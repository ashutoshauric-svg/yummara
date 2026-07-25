const express = require('express');
const db = require('../db');
const { dispatchOrder } = require('../lib/dispatch');
const { createOrder, getOrderWithItems } = require('../lib/orders');
const router = express.Router();

// POST /api/orders — place an order without payment (cash flows / internal use).
// Paid orders are created inside POST /api/payment/verify instead, so that a captured
// payment can never end up without an order behind it.
router.post('/', (req, res) => {
  const result = createOrder(req.body);
  if (!result.ok) return res.status(result.code || 400).json({ error: result.error });

  // Emit socket event to cook's room
  req.app.get('io').to(`cook:${result.order.cook_id}`).emit('new_order', result.order);

  res.status(201).json(result.order);
});

// GET /api/orders/:id — get a single order (customer polls for status)
router.get('/:id', (req, res) => {
  const order = getOrderWithItems(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// GET /api/orders?cookId=X — cook fetches their orders (pending + accepted + cooking)
router.get('/', (req, res) => {
  const { cookId, status } = req.query;
  if (!cookId) return res.status(400).json({ error: 'cookId required' });

  const activeStatuses = status ? [status] : ['pending', 'accepted', 'cooking'];
  const placeholders = activeStatuses.map(() => '?').join(',');
  const orders = db.prepare(`
    SELECT * FROM orders
    WHERE cook_id = ? AND status IN (${placeholders})
    ORDER BY placed_at DESC
  `).all(cookId, ...activeStatuses);

  const result = orders.map(o => ({
    ...o,
    items: db.prepare('SELECT oi.*, d.name, d.subtitle, d.veg FROM order_items oi JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id = ?').all(o.id),
  }));

  res.json(result);
});

// PUT /api/orders/:id/status — cook updates order status
// Body: { status: 'accepted' | 'cooking' | 'ready' | 'cancelled' }
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['accepted', 'cooking', 'ready', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, order.id);
  const updated = getOrderWithItems(order.id);

  // Notify customer
  const io = req.app.get('io');
  io.to(`order:${order.id}`).emit('order_update', updated);

  // Booking a rider is the natural next step once food is ready — do it automatically rather
  // than making the cook press a second button. Never fail the status update if dispatch fails.
  let dispatch = null;
  if (status === 'ready') {
    try {
      dispatch = await dispatchOrder(order.id, io);
    } catch (err) {
      console.error('[orders] auto-dispatch failed:', err.message);
    }
  }

  res.json({ ...updated, dispatch });
});

module.exports = router;

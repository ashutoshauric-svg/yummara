const express = require('express');
const db = require('../db');
const router = express.Router();

// POST /api/orders — customer places an order
// Body: { customerName, customerPhone, cookId, items: [{dishId, qty}], tip, address }
router.post('/', (req, res) => {
  const { customerName, customerPhone, cookId, items, tip = 0, address = '' } = req.body;

  if (!customerName || !customerPhone || !cookId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cook = db.prepare('SELECT id FROM cooks WHERE id = ?').get(cookId);
  if (!cook) return res.status(404).json({ error: 'Cook not found' });

  // Resolve prices from DB (never trust client-sent prices)
  const dishIds = items.map(i => i.dishId);
  const placeholders = dishIds.map(() => '?').join(',');
  const dishes = db.prepare(`SELECT * FROM dishes WHERE id IN (${placeholders})`).all(...dishIds);
  const dishMap = Object.fromEntries(dishes.map(d => [d.id, d]));

  for (const item of items) {
    if (!dishMap[item.dishId]) return res.status(400).json({ error: `Dish ${item.dishId} not found` });
    if (dishMap[item.dishId].cook_id !== cookId) return res.status(400).json({ error: 'Dish does not belong to this cook' });
  }

  const itemsTotal = items.reduce((sum, i) => sum + dishMap[i.dishId].price * i.qty, 0);
  const total = itemsTotal + 29 + 12 + tip; // delivery + platform + tip

  const placeOrder = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO orders (customer_name, customer_phone, cook_id, status, total, tip, address)
      VALUES (?, ?, ?, 'pending', ?, ?, ?)
    `).run(customerName, String(customerPhone), cookId, total, tip, address);

    const orderId = result.lastInsertRowid;
    const insertItem = db.prepare('INSERT INTO order_items (order_id, dish_id, qty, unit_price) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      insertItem.run(orderId, item.dishId, item.qty, dishMap[item.dishId].price);
    }
    return orderId;
  });

  const orderId = placeOrder();
  const order = getOrderWithItems(orderId);

  // Emit socket event to cook's room
  const io = req.app.get('io');
  io.to(`cook:${cookId}`).emit('new_order', order);

  res.status(201).json(order);
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
router.put('/:id/status', (req, res) => {
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

  res.json(updated);
});

function getOrderWithItems(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return null;
  order.items = db.prepare(`
    SELECT oi.*, d.name, d.subtitle, d.veg, d.tone
    FROM order_items oi
    JOIN dishes d ON oi.dish_id = d.id
    WHERE oi.order_id = ?
  `).all(order.id);
  return order;
}

module.exports = router;

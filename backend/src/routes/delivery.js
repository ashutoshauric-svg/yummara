const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// POST /api/delivery/dispatch/:orderId — cook marks order as dispatched (dummy rider)
router.post('/dispatch/:orderId', requireAuth, async (req, res) => {
  if (req.user.role !== 'cook') return res.status(403).json({ error: 'Cook only' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'ready') return res.status(400).json({ error: 'Order must be marked ready before dispatching' });

  const existing = db.prepare('SELECT id FROM deliveries WHERE order_id = ? AND status NOT IN (?, ?)').get(order.id, 'cancelled', 'failed');
  if (existing) return res.status(409).json({ error: 'Delivery already started for this order' });

  db.prepare(`
    INSERT INTO deliveries (order_id, borzo_order_id, status, rider_name, rider_phone, price)
    VALUES (?, ?, 'dispatched', ?, ?, 0)
    ON CONFLICT(order_id) DO UPDATE SET status='dispatched', updated_at=datetime('now')
  `).run(order.id, `dummy_${order.id}`, 'Rider assigned', null);

  const io = req.app.get('io');
  if (io) io.to(`order_${order.id}`).emit('order_update', { id: order.id, status: order.status, delivery: { status: 'dispatched' } });

  res.json({ ok: true, message: 'Delivery started' });
});

// GET /api/delivery/:orderId — get delivery status for an order
router.get('/:orderId', (req, res) => {
  const delivery = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(req.params.orderId);
  if (!delivery) return res.json({ delivery: null });
  res.json({ delivery });
});

module.exports = router;

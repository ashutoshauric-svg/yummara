const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// All user routes require auth
router.use(requireAuth);

// GET /api/user/profile
router.get('/profile', (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer only' });
  const user = db.prepare('SELECT id, phone, name, created_at FROM users WHERE id = ?').get(req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT /api/user/profile
router.put('/profile', (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer only' });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.sub);
  const user = db.prepare('SELECT id, phone, name, created_at FROM users WHERE id = ?').get(req.user.sub);
  res.json(user);
});

// GET /api/user/orders — order history with items
router.get('/orders', (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer only' });
  const orders = db.prepare(
    `SELECT o.*, c.name as cook_name, c.short as cook_short, c.area as cook_area
     FROM orders o JOIN cooks c ON c.id = o.cook_id
     WHERE o.user_id = ? ORDER BY o.placed_at DESC LIMIT 20`
  ).all(req.user.sub);

  const orderIds = orders.map(o => o.id);
  if (orderIds.length === 0) return res.json([]);

  const items = db.prepare(
    `SELECT oi.*, d.name as dish_name FROM order_items oi JOIN dishes d ON d.id = oi.dish_id
     WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})`)
    .all(...orderIds);

  const itemsByOrder = items.reduce((m, i) => { (m[i.order_id] ||= []).push(i); return m; }, {});
  res.json(orders.map(o => ({ ...o, items: itemsByOrder[o.id] || [] })));
});

// GET /api/user/addresses
router.get('/addresses', (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer only' });
  const addrs = db.prepare('SELECT * FROM saved_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(req.user.sub);
  res.json(addrs);
});

// POST /api/user/addresses
router.post('/addresses', (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer only' });
  const { label = 'Home', address, is_default = 0 } = req.body;
  if (!address) return res.status(400).json({ error: 'Address required' });
  if (is_default) {
    db.prepare('UPDATE saved_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.sub);
  }
  const result = db.prepare(
    'INSERT INTO saved_addresses (user_id, label, address, is_default) VALUES (?, ?, ?, ?)'
  ).run(req.user.sub, label, address, is_default ? 1 : 0);
  const addr = db.prepare('SELECT * FROM saved_addresses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(addr);
});

// PUT /api/user/addresses/:id
router.put('/addresses/:id', (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer only' });
  const { label, address, is_default } = req.body;
  const existing = db.prepare('SELECT * FROM saved_addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.sub);
  if (!existing) return res.status(404).json({ error: 'Address not found' });
  if (is_default) {
    db.prepare('UPDATE saved_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.sub);
  }
  db.prepare('UPDATE saved_addresses SET label = ?, address = ?, is_default = ? WHERE id = ?').run(
    label ?? existing.label, address ?? existing.address, is_default ? 1 : 0, existing.id
  );
  res.json(db.prepare('SELECT * FROM saved_addresses WHERE id = ?').get(existing.id));
});

// DELETE /api/user/addresses/:id
router.delete('/addresses/:id', (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer only' });
  const existing = db.prepare('SELECT * FROM saved_addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.sub);
  if (!existing) return res.status(404).json({ error: 'Address not found' });
  db.prepare('DELETE FROM saved_addresses WHERE id = ?').run(existing.id);
  res.json({ ok: true });
});

module.exports = router;

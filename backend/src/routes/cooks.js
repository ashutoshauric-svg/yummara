const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/cooks — list all cooks with their dishes
router.get('/', (req, res) => {
  const cooks = db.prepare('SELECT * FROM cooks ORDER BY rating DESC').all();
  const dishes = db.prepare('SELECT * FROM dishes WHERE available = 1').all();
  const dishesByCook = dishes.reduce((m, d) => {
    (m[d.cook_id] ||= []).push(d);
    return m;
  }, {});
  res.json(cooks.map(c => ({ ...c, dishes: dishesByCook[c.id] || [] })));
});

// GET /api/cooks/:id — single cook + dishes
router.get('/:id', (req, res) => {
  const cook = db.prepare('SELECT * FROM cooks WHERE id = ?').get(req.params.id);
  if (!cook) return res.status(404).json({ error: 'Cook not found' });
  const dishes = db.prepare('SELECT * FROM dishes WHERE cook_id = ? AND available = 1').all(cook.id);
  res.json({ ...cook, dishes });
});

// POST /api/cooks/login — cook login by phone (Phase 1: no password)
router.post('/login', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  const cook = db.prepare('SELECT * FROM cooks WHERE phone = ?').get(String(phone));
  if (!cook) return res.status(404).json({ error: 'No cook account found for this phone' });
  res.json({ cook });
});

// PUT /api/cooks/:id/online — toggle online status
router.put('/:id/online', (req, res) => {
  const { online } = req.body;
  db.prepare('UPDATE cooks SET online = ? WHERE id = ?').run(online ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

module.exports = router;

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

function cookOnly(req, res, next) {
  if (req.user.role !== 'cook') return res.status(403).json({ error: 'Cook account required' });
  next();
}

// POST /api/dishes — cook adds a new dish
router.post('/', requireAuth, cookOnly, (req, res) => {
  const { name, subtitle, price, tone = 'warm', veg = true, tag = null, photo_url = null } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'name and price required' });
  const cookId = req.user.sub;
  const id = `${cookId}-${Date.now()}`;
  db.prepare(
    'INSERT INTO dishes (id, cook_id, name, subtitle, price, tone, veg, tag, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, cookId, name, subtitle || null, Number(price), tone, veg ? 1 : 0, tag || null, photo_url || null);
  res.status(201).json(db.prepare('SELECT * FROM dishes WHERE id = ?').get(id));
});

// PUT /api/dishes/:id — cook edits a dish
router.put('/:id', requireAuth, cookOnly, (req, res) => {
  const dish = db.prepare('SELECT * FROM dishes WHERE id = ?').get(req.params.id);
  if (!dish) return res.status(404).json({ error: 'Dish not found' });
  if (dish.cook_id !== req.user.sub) return res.status(403).json({ error: 'Not your dish' });
  const { name, subtitle, price, tone, veg, tag, photo_url } = req.body;
  db.prepare(
    'UPDATE dishes SET name=?, subtitle=?, price=?, tone=?, veg=?, tag=?, photo_url=? WHERE id=?'
  ).run(
    name ?? dish.name, subtitle ?? dish.subtitle, price != null ? Number(price) : dish.price,
    tone ?? dish.tone, veg != null ? (veg ? 1 : 0) : dish.veg,
    tag !== undefined ? tag : dish.tag, photo_url !== undefined ? photo_url : dish.photo_url,
    dish.id
  );
  res.json(db.prepare('SELECT * FROM dishes WHERE id = ?').get(dish.id));
});

// DELETE /api/dishes/:id — cook removes a dish
router.delete('/:id', requireAuth, cookOnly, (req, res) => {
  const dish = db.prepare('SELECT * FROM dishes WHERE id = ?').get(req.params.id);
  if (!dish) return res.status(404).json({ error: 'Dish not found' });
  if (dish.cook_id !== req.user.sub) return res.status(403).json({ error: 'Not your dish' });
  db.prepare('DELETE FROM dishes WHERE id = ?').run(dish.id);
  res.json({ ok: true });
});

// PUT /api/dishes/:id/available — toggle availability
router.put('/:id/available', requireAuth, cookOnly, (req, res) => {
  const dish = db.prepare('SELECT * FROM dishes WHERE id = ?').get(req.params.id);
  if (!dish) return res.status(404).json({ error: 'Dish not found' });
  if (dish.cook_id !== req.user.sub) return res.status(403).json({ error: 'Not your dish' });
  const available = req.body.available ? 1 : 0;
  db.prepare('UPDATE dishes SET available = ? WHERE id = ?').run(available, dish.id);
  res.json({ ...dish, available });
});

module.exports = router;

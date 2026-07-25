const db = require('../db');

// Must match the frontend's VITE_DELIVERY_FEE / VITE_PLATFORM_FEE, or the amount charged
// through Razorpay won't match the order total stored here.
const DELIVERY_FEE = Number(process.env.DELIVERY_FEE ?? 29);
const PLATFORM_FEE = Number(process.env.PLATFORM_FEE ?? 12);

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

// Computes the total from DB prices (never trusting client-sent amounts) and inserts the order
// plus its items in one transaction. Returns { ok, order } or { ok: false, error, code }.
// Shared by the plain order route and the payment-verify route so a paid order is always created.
function createOrder({ customerName, customerPhone, cookId, items, tip = 0, address = '', lat = null, lng = null }) {
  if (!customerName || !customerPhone || !cookId || !Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Missing required fields', code: 400 };
  }

  const cook = db.prepare('SELECT id FROM cooks WHERE id = ?').get(cookId);
  if (!cook) return { ok: false, error: 'Cook not found', code: 404 };

  const dishIds = items.map(i => i.dishId);
  const placeholders = dishIds.map(() => '?').join(',');
  const dishes = db.prepare(`SELECT * FROM dishes WHERE id IN (${placeholders})`).all(...dishIds);
  const dishMap = Object.fromEntries(dishes.map(d => [d.id, d]));

  for (const item of items) {
    if (!dishMap[item.dishId]) return { ok: false, error: `Dish ${item.dishId} not found`, code: 400 };
    if (dishMap[item.dishId].cook_id !== cookId) return { ok: false, error: 'Dish does not belong to this cook', code: 400 };
  }

  const itemsTotal = items.reduce((sum, i) => sum + dishMap[i.dishId].price * i.qty, 0);
  const total = itemsTotal + DELIVERY_FEE + PLATFORM_FEE + tip;

  const insert = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO orders (customer_name, customer_phone, cook_id, status, total, tip, address, delivery_lat, delivery_lng)
      VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)
    `).run(customerName, String(customerPhone), cookId, total, tip, address, lat, lng);

    const orderId = result.lastInsertRowid;
    const insertItem = db.prepare('INSERT INTO order_items (order_id, dish_id, qty, unit_price) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      insertItem.run(orderId, item.dishId, item.qty, dishMap[item.dishId].price);
    }
    return orderId;
  });

  return { ok: true, order: getOrderWithItems(insert()) };
}

module.exports = { createOrder, getOrderWithItems, DELIVERY_FEE, PLATFORM_FEE };

const db = require('../db');
const adloggs = require('./adloggs');

const PLATFORM_FEE = Number(process.env.PLATFORM_FEE ?? 1);
// Only used when Adloggs cannot quote (no coordinates, or their API is down).
const FALLBACK_DELIVERY_FEE = Number(process.env.DELIVERY_FEE ?? 29);

// Asks Adloggs what this delivery actually costs and charges that, so the fee collected always
// covers the rider. Returns { fee, quoted, distance, error } — `quoted` is false when we had to
// fall back, so callers can tell a real quote from a guess.
async function quoteDeliveryFee(cookId, lat, lng) {
  const cook = db.prepare('SELECT pickup_lat, pickup_lng FROM cooks WHERE id = ?').get(cookId);
  if (!cook?.pickup_lat || !cook?.pickup_lng || lat == null || lng == null) {
    return { fee: FALLBACK_DELIVERY_FEE, quoted: false, error: 'Missing pickup or delivery coordinates' };
  }

  try {
    const r = await adloggs.checkAvailability(cook.pickup_lat, cook.pickup_lng, lat, lng);
    const d = r.data?.data;
    if (!r.ok || !d?.service_available) {
      return {
        fee: FALLBACK_DELIVERY_FEE,
        quoted: false,
        unavailable: true,
        error: r.data?.message || 'Delivery not available for this address',
      };
    }
    // Round up to a whole rupee — Razorpay works in paise and a fractional fee would drift.
    return { fee: Math.ceil(Number(d.estimated_price)), quoted: true, distance: d.distance };
  } catch (err) {
    console.error('[adloggs] quote failed:', err.message);
    return { fee: FALLBACK_DELIVERY_FEE, quoted: false, error: 'Could not reach Adloggs' };
  }
}

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

// Prices an order entirely from DB values and a live Adloggs quote — never from client input,
// so the amount charged cannot be tampered with. Both the Razorpay charge and the stored order
// go through this, which is what keeps them in agreement.
async function priceOrder({ cookId, items, tip = 0, lat = null, lng = null }) {
  if (!cookId || !Array.isArray(items) || items.length === 0) {
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

  const quote = await quoteDeliveryFee(cookId, lat, lng);
  const itemsTotal = items.reduce((sum, i) => sum + dishMap[i.dishId].price * i.qty, 0);
  const deliveryFee = quote.fee;
  const total = itemsTotal + deliveryFee + PLATFORM_FEE + Number(tip || 0);

  return { ok: true, dishMap, itemsTotal, deliveryFee, platformFee: PLATFORM_FEE, total, quote };
}

// Creates the order using priceOrder's figures. Returns { ok, order } or { ok: false, error, code }.
// Shared by the plain order route and the payment-verify route so a paid order is always created.
async function createOrder({ customerName, customerPhone, cookId, items, tip = 0, address = '', lat = null, lng = null }) {
  if (!customerName || !customerPhone) {
    return { ok: false, error: 'Missing required fields', code: 400 };
  }

  const priced = await priceOrder({ cookId, items, tip, lat, lng });
  if (!priced.ok) return priced;
  const { dishMap, total } = priced;

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

  return { ok: true, order: getOrderWithItems(insert()), pricing: priced };
}

module.exports = { createOrder, priceOrder, quoteDeliveryFee, getOrderWithItems, PLATFORM_FEE };

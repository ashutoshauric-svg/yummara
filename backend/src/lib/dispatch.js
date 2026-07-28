const db = require('../db');
const adloggs = require('./adloggs');

// Creates the delivery for an order, using Adloggs when we have both coordinates and falling
// back to a dummy dispatch otherwise. Returns { ok, provider, reason } — `reason` explains a
// fallback so the cook dashboard can show why no real rider was booked.
async function dispatchOrder(orderId, io) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return { ok: false, error: 'Order not found', code: 404 };
  if (order.status !== 'ready') return { ok: false, error: 'Order must be marked ready before dispatching', code: 400 };

  // A dummy dispatch is a placeholder, not a real booking — allow retrying it once the missing
  // location data is filled in. Only a real Adloggs booking blocks re-dispatch.
  const existing = db.prepare('SELECT id, provider FROM deliveries WHERE order_id = ? AND status NOT IN (?, ?)').get(order.id, 'cancelled', 'failed');
  if (existing && existing.provider === 'adloggs') {
    return { ok: false, error: 'Delivery already booked with Adloggs for this order', code: 409 };
  }

  const cook = db.prepare('SELECT * FROM cooks WHERE id = ?').get(order.cook_id);

  let provider = 'dummy', externalId = `dummy_${order.id}`, riderName = 'Rider assigned', reason = null;

  const missingPickup = !cook?.pickup_lat || !cook?.pickup_lng;
  const missingDelivery = !order.delivery_lat || !order.delivery_lng;

  if (missingPickup || missingDelivery) {
    reason = missingPickup && missingDelivery
      ? 'Kitchen location not set, and customer did not share their location'
      : missingPickup
        ? 'Kitchen location not set — add it in your Profile tab'
        : 'Customer did not share their exact location at checkout';
  } else {
    const items = db.prepare(`
      SELECT oi.qty, oi.unit_price AS price, d.name
      FROM order_items oi JOIN dishes d ON oi.dish_id = d.id
      WHERE oi.order_id = ?
    `).all(order.id);

    try {
      const result = await adloggs.createOrder(order, cook, items);
      if (result.ok && result.data?.data?.order_uuid) {
        provider = 'adloggs';
        externalId = result.data.data.order_uuid;
        riderName = 'Awaiting rider assignment';
      } else {
        reason = result.data?.message || 'Adloggs rejected the request';
        console.error('[adloggs] create-order rejected:', result.status, JSON.stringify(result.data));
      }
    } catch (err) {
      reason = 'Could not reach Adloggs';
      console.error('[adloggs] create-order failed:', err.message);
    }
  }

  // Persist the fallback reason too — without it the dashboard shows a generic "location
  // details were missing" message on reload, which misreports why Adloggs actually refused.
  db.prepare(`
    INSERT INTO deliveries (order_id, borzo_order_id, provider, adloggs_order_uuid, status, rider_name, rider_phone, price, reason)
    VALUES (?, ?, ?, ?, 'dispatched', ?, NULL, 0, ?)
    ON CONFLICT(order_id) DO UPDATE SET provider=excluded.provider, adloggs_order_uuid=excluded.adloggs_order_uuid, status='dispatched', rider_name=excluded.rider_name, reason=excluded.reason, updated_at=datetime('now')
  `).run(order.id, externalId, provider, provider === 'adloggs' ? externalId : null, riderName, reason);

  if (io) io.to(`order_${order.id}`).emit('order_update', { id: order.id, status: order.status, delivery: { status: 'dispatched', provider } });

  return { ok: true, provider, reason };
}

module.exports = { dispatchOrder };

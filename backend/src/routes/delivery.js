const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { dispatchOrder } = require('../lib/dispatch');
const router = express.Router();

// POST /api/delivery/dispatch/:orderId — manual re-dispatch (orders are auto-dispatched on 'ready')
router.post('/dispatch/:orderId', requireAuth, async (req, res) => {
  if (req.user.role !== 'cook') return res.status(403).json({ error: 'Cook only' });

  const result = await dispatchOrder(req.params.orderId, req.app.get('io'));
  if (!result.ok) return res.status(result.code || 400).json({ error: result.error });

  res.json({ ok: true, message: 'Delivery started', provider: result.provider, reason: result.reason });
});

// GET /api/delivery/:orderId — get delivery status for an order
router.get('/:orderId', (req, res) => {
  const delivery = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(req.params.orderId);
  if (!delivery) return res.json({ delivery: null });
  res.json({ delivery });
});

// Adloggs sends a numeric order_status_id. Their docs list the status names in this order but
// never publish the numeric mapping, so this is inferred from that ordering and needs confirming
// with Adloggs. Unknown ids are stored raw and logged rather than guessed at.
const ADLOGGS_STATUS = {
  1: 'pending',
  2: 'assigned',
  3: 'at_pickup',
  4: 'picking',
  5: 'on_the_way',
  6: 'delivered',
  7: 'rto_delivered',
  8: 'cancelled',
};

// POST /api/delivery/adloggs/webhook — receives order status pushes from Adloggs.
// Registered in the Adloggs dashboard. Must answer 200 within 5 seconds or they treat the
// event as failed, so this does one small write and replies — no outbound calls.
router.post('/adloggs/webhook', (req, res) => {
  const body = req.body || {};
  console.log('[adloggs webhook]', JSON.stringify(body));

  const statusId = body.order_status_id;
  const mapped = ADLOGGS_STATUS[statusId];
  if (statusId != null && !mapped) console.warn('[adloggs webhook] unknown order_status_id:', statusId);

  // Match on our own order id first (we send it as partner_order_id), falling back to the uuid.
  const delivery =
    (body.partner_order_id != null &&
      db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(body.partner_order_id)) ||
    (body.order_uuid &&
      db.prepare('SELECT * FROM deliveries WHERE adloggs_order_uuid = ?').get(body.order_uuid));

  if (!delivery) {
    console.warn('[adloggs webhook] no matching delivery for', body.partner_order_id, body.order_uuid);
    return res.sendStatus(200); // still ack — retries would not help
  }

  const staff = body.deliveryStaffDetails || {};
  const loc = staff.currentLocation || {};

  db.prepare(`
    UPDATE deliveries SET
      status            = COALESCE(?, status),
      adloggs_status_id = COALESCE(?, adloggs_status_id),
      reason            = COALESCE(?, reason),
      rider_name        = COALESCE(?, rider_name),
      rider_phone       = COALESCE(?, rider_phone),
      rider_lat         = COALESCE(?, rider_lat),
      rider_lng         = COALESCE(?, rider_lng),
      eta_pickup        = COALESCE(?, eta_pickup),
      updated_at        = datetime('now')
    WHERE order_id = ?
  `).run(
    mapped ?? null,
    statusId ?? null,
    body.reason ?? null,
    staff.name ?? null,
    staff.phone ?? null,
    loc.lat != null ? Number(loc.lat) : null,
    loc.long != null ? Number(loc.long) : null,
    body.eta?.to_pickup ?? null,
    delivery.order_id,
  );

  const updated = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(delivery.order_id);
  const io = req.app.get('io');
  if (io) {
    io.to(`order:${delivery.order_id}`).emit('delivery_update', updated);
    io.to(`order_${delivery.order_id}`).emit('delivery_update', updated);
    const order = db.prepare('SELECT cook_id FROM orders WHERE id = ?').get(delivery.order_id);
    if (order) io.to(`cook:${order.cook_id}`).emit('delivery_update', updated);
  }

  res.sendStatus(200);
});

module.exports = router;

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const adloggs = require('../lib/adloggs');
const router = express.Router();

// POST /api/delivery/dispatch/:orderId — cook marks order as dispatched
// Uses Adloggs when both the cook's pickup location and the customer's delivery location are
// known; otherwise falls back to a dummy dispatch (older orders / locations not captured yet).
router.post('/dispatch/:orderId', requireAuth, async (req, res) => {
  if (req.user.role !== 'cook') return res.status(403).json({ error: 'Cook only' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'ready') return res.status(400).json({ error: 'Order must be marked ready before dispatching' });

  const existing = db.prepare('SELECT id FROM deliveries WHERE order_id = ? AND status NOT IN (?, ?)').get(order.id, 'cancelled', 'failed');
  if (existing) return res.status(409).json({ error: 'Delivery already started for this order' });

  const cook = db.prepare('SELECT * FROM cooks WHERE id = ?').get(order.cook_id);
  const canUseAdloggs = cook?.pickup_lat && cook?.pickup_lng && order.delivery_lat && order.delivery_lng;

  let provider = 'dummy', externalId = `dummy_${order.id}`, riderName = 'Rider assigned', riderPhone = null;

  if (canUseAdloggs) {
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
        console.error('[adloggs] create-order rejected:', result.status, JSON.stringify(result.data));
      }
    } catch (err) {
      console.error('[adloggs] create-order failed:', err.message);
    }
  }

  db.prepare(`
    INSERT INTO deliveries (order_id, borzo_order_id, provider, adloggs_order_uuid, status, rider_name, rider_phone, price)
    VALUES (?, ?, ?, ?, 'dispatched', ?, ?, 0)
    ON CONFLICT(order_id) DO UPDATE SET provider=excluded.provider, adloggs_order_uuid=excluded.adloggs_order_uuid, status='dispatched', updated_at=datetime('now')
  `).run(order.id, externalId, provider, provider === 'adloggs' ? externalId : null, riderName, riderPhone);

  const io = req.app.get('io');
  if (io) io.to(`order_${order.id}`).emit('order_update', { id: order.id, status: order.status, delivery: { status: 'dispatched', provider } });

  res.json({ ok: true, message: 'Delivery started', provider });
});

// GET /api/delivery/:orderId — get delivery status for an order
router.get('/:orderId', (req, res) => {
  const delivery = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(req.params.orderId);
  if (!delivery) return res.json({ delivery: null });
  res.json({ delivery });
});

// POST /api/delivery/adloggs/webhook — receives order status pushes from Adloggs
// Register this URL in the Adloggs dashboard (Webhook section, Step 2 of their onboarding guide).
// Payload shape is unconfirmed until we get their API reference — logging raw body for now so we
// can see real event structure during their Test Webhook step, then map statuses to our `deliveries` table.
router.post('/adloggs/webhook', (req, res) => {
  console.log('[adloggs webhook]', JSON.stringify(req.body));
  res.sendStatus(200); // ack fast — Adloggs treats a slow/non-2xx response as a failed delivery of the event
});

module.exports = router;

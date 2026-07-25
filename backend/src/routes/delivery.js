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

// POST /api/delivery/adloggs/webhook — receives order status pushes from Adloggs
// Register this URL in the Adloggs dashboard (Webhook section, Step 2 of their onboarding guide).
// Payload shape is unconfirmed until we get their API reference — logging raw body for now so we
// can see real event structure during their Test Webhook step, then map statuses to our `deliveries` table.
router.post('/adloggs/webhook', (req, res) => {
  console.log('[adloggs webhook]', JSON.stringify(req.body));
  res.sendStatus(200); // ack fast — Adloggs treats a slow/non-2xx response as a failed delivery of the event
});

module.exports = router;

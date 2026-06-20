const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const BORZO_URL = process.env.BORZO_TEST === 'true'
  ? 'https://robotapitest-in.borzodelivery.com/api/business/1.8'
  : 'https://robot-in.borzodelivery.com/api/business/1.8';

function borzoHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-DV-Auth-Token': process.env.BORZO_TOKEN,
  };
}

// POST /api/delivery/dispatch/:orderId — cook triggers Borzo pickup
router.post('/dispatch/:orderId', requireAuth, async (req, res) => {
  if (req.user.role !== 'cook') return res.status(403).json({ error: 'Cook only' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'ready') return res.status(400).json({ error: 'Order must be marked ready before dispatching' });

  const cook = db.prepare('SELECT * FROM cooks WHERE id = ?').get(req.user.sub);
  if (!cook?.address) return res.status(400).json({ error: 'Add your pickup address in Profile before dispatching' });
  if (!order.address) return res.status(400).json({ error: 'Customer has no delivery address on this order' });

  // Check not already dispatched
  const existing = db.prepare('SELECT id FROM deliveries WHERE order_id = ? AND status NOT IN (?, ?)').get(order.id, 'cancelled', 'failed');
  if (existing) return res.status(409).json({ error: 'Rider already dispatched for this order' });

  const body = {
    matter: `Home-cooked food from ${cook.name}`,
    vehicle_type_id: 8, // Bike
    total_weight_kg: 2,
    points: [
      {
        address: cook.address,
        contact_person: { phone: `91${cook.phone}`, name: cook.name },
        note: `Pickup from ${cook.short}'s kitchen`,
      },
      {
        address: order.address,
        contact_person: { phone: `91${order.customer_phone}`, name: order.customer_name },
        note: `Deliver to ${order.customer_name}`,
      },
    ],
  };

  try {
    const borzoRes = await fetch(`${BORZO_URL}/create-order`, {
      method: 'POST',
      headers: borzoHeaders(),
      body: JSON.stringify(body),
    });
    const data = await borzoRes.json();

    if (!data.is_successful) {
      console.error('[Borzo] create-order failed:', JSON.stringify(data));
      return res.status(502).json({ error: data.errors?.join(', ') || 'Borzo error — check order details' });
    }

    const borzoOrder = data.order;
    db.prepare(`
      INSERT INTO deliveries (order_id, borzo_order_id, status, price)
      VALUES (?, ?, 'dispatched', ?)
      ON CONFLICT(order_id) DO UPDATE SET borzo_order_id=excluded.borzo_order_id, status='dispatched', updated_at=datetime('now')
    `).run(order.id, String(borzoOrder.order_id || borzoOrder.id), Math.round((borzoOrder.delivery_fee_amount || 0) * 100));

    // Notify customer via socket
    const io = req.app.get('io');
    if (io) io.to(`order_${order.id}`).emit('order_update', { id: order.id, status: order.status, delivery: { status: 'dispatched' } });

    res.json({ ok: true, borzo_order_id: borzoOrder.order_id || borzoOrder.id, price: borzoOrder.delivery_fee_amount });
  } catch (err) {
    console.error('[Borzo] dispatch error:', err.message);
    res.status(502).json({ error: 'Could not reach Borzo. Try again.' });
  }
});

// GET /api/delivery/:orderId — get delivery status for an order
router.get('/:orderId', (req, res) => {
  const delivery = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(req.params.orderId);
  if (!delivery) return res.json({ delivery: null });
  res.json({ delivery });
});

// POST /api/delivery/webhook — Borzo calls this when status changes
router.post('/webhook', (req, res) => {
  const payload = req.body;
  const borzoOrderId = String(payload?.order?.order_id || payload?.order_id || '');
  const newStatus = payload?.order?.status_description || payload?.status || '';
  const courier = payload?.order?.courier || payload?.courier;

  if (borzoOrderId) {
    const delivery = db.prepare('SELECT * FROM deliveries WHERE borzo_order_id = ?').get(borzoOrderId);
    if (delivery) {
      db.prepare(`
        UPDATE deliveries SET
          status = ?,
          rider_name = COALESCE(?, rider_name),
          rider_phone = COALESCE(?, rider_phone),
          updated_at = datetime('now')
        WHERE borzo_order_id = ?
      `).run(newStatus || delivery.status, courier?.name || null, courier?.phone || null, borzoOrderId);

      // Notify customer
      const io = req.app.get('io');
      if (io) {
        const updated = db.prepare('SELECT * FROM deliveries WHERE borzo_order_id = ?').get(borzoOrderId);
        io.to(`order_${delivery.order_id}`).emit('delivery_update', updated);
      }
    }
  }

  res.json({ ok: true });
});

// POST /api/delivery/estimate — price estimate before dispatching
router.post('/estimate', requireAuth, async (req, res) => {
  const { cook_address, customer_address } = req.body;
  if (!cook_address || !customer_address) return res.status(400).json({ error: 'Both addresses required' });

  try {
    const borzoRes = await fetch(`${BORZO_URL}/calculate-order`, {
      method: 'POST',
      headers: borzoHeaders(),
      body: JSON.stringify({
        matter: 'Home-cooked food',
        vehicle_type_id: 8,
        points: [
          { address: cook_address, contact_person: { phone: '919900000001' } },
          { address: customer_address, contact_person: { phone: '919900000001' } },
        ],
      }),
    });
    const data = await borzoRes.json();
    if (!data.is_successful) return res.status(502).json({ error: 'Could not estimate price' });
    res.json({ price: data.order?.delivery_fee_amount, currency: 'INR' });
  } catch {
    res.status(502).json({ error: 'Borzo unreachable' });
  }
});

module.exports = router;

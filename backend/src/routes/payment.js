const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { createOrder, priceOrder } = require('../lib/orders');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
// Body: { order } — the amount is priced here from DB prices and a live Adloggs quote rather
// than taken from the client, so the charge always matches the order we go on to create.
router.post('/create-order', async (req, res) => {
  const { order } = req.body;
  if (!order) return res.status(400).json({ error: 'Missing order details' });

  const priced = await priceOrder(order);
  if (!priced.ok) return res.status(priced.code || 400).json({ error: priced.error });
  if (priced.quote.unavailable) {
    return res.status(400).json({ error: priced.quote.error || 'Delivery not available to this address' });
  }

  const amountPaise = Math.round(priced.total * 100);
  if (amountPaise < 100) return res.status(400).json({ error: 'Minimum order amount is ₹1' });

  try {
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `yum_${Date.now()}`,
    });
    res.json({
      order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      breakdown: {
        items: priced.itemsTotal,
        delivery: priced.deliveryFee,
        platform: priced.platformFee,
        tip: Number(order.tip || 0),
        total: priced.total,
      },
    });
  } catch (err) {
    console.error('[Razorpay] create-order error:', err);
    res.status(500).json({ error: 'Could not create payment order' });
  }
});

// POST /api/payment/verify
// Verifies the signature AND creates the order in the same request. Creating the order in a
// separate follow-up call meant any failure in between (crash, deploy, dropped connection) left
// the customer charged with no order for the cook to see.
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment fields' });
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  if (!order) return res.json({ ok: true, payment_id: razorpay_payment_id, order: null });

  const result = await createOrder(order);
  if (!result.ok) {
    // Payment is already captured — surface it loudly so it can be reconciled or refunded
    // rather than silently swallowed.
    console.error('[payment] PAID BUT ORDER FAILED', razorpay_payment_id, result.error, JSON.stringify(order));
    return res.status(500).json({
      error: `Payment succeeded but the order could not be created: ${result.error}. Payment ID ${razorpay_payment_id} — contact support for a refund.`,
      payment_id: razorpay_payment_id,
    });
  }

  req.app.get('io').to(`cook:${result.order.cook_id}`).emit('new_order', result.order);

  res.json({ ok: true, payment_id: razorpay_payment_id, order: result.order });
});

module.exports = router;

const express = require('express');
const router = express.Router();

// GET /api/whatsapp/webhook — Meta verification handshake
router.get('/webhook', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// POST /api/whatsapp/webhook — incoming messages and status updates
router.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    const changes = body.entry?.[0]?.changes?.[0]?.value;
    const messages = changes?.messages;
    if (messages?.length) {
      const msg = messages[0];
      console.log(`[WhatsApp] Incoming from ${msg.from}: ${msg.text?.body || msg.type}`);
    }
  }
  res.sendStatus(200);
});

module.exports = router;

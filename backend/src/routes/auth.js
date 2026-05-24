const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || 'yummara-dev-secret-CHANGE-IN-PRODUCTION';
const OTP_EXPIRY_MINUTES = 10;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendWhatsAppOtp(phone, code) {
  const token    = process.env.WHATSAPP_TOKEN;
  const numberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = process.env.WHATSAPP_TEMPLATE_NAME || 'yummara_otp';

  const res = await fetch(`https://graph.facebook.com/v19.0/${numberId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: `91${phone}`,
      type: 'template',
      template: {
        name: template,
        language: { code: 'en_US' },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: code }] },
          { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
        ],
      },
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data;
}

async function sendOtp(phone, code) {
  const waToken = process.env.WHATSAPP_TOKEN;
  const waNumId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (waToken && waNumId) {
    try {
      await sendWhatsAppOtp(phone, code);
      console.log(`[OTP] WhatsApp sent to ${phone}`);
      return {};
    } catch (err) {
      console.error('[OTP] WhatsApp failed:', err.message);
      return { devCode: code };
    }
  }

  // No channel configured — dev mode
  console.log(`\n[OTP] Phone: ${phone}  Code: ${code}\n`);
  return { devCode: code };
}

// POST /api/auth/send-otp
// Works for both customers (role=customer) and cooks (role=cook)
router.post('/send-otp', async (req, res) => {
  const { phone, role = 'customer' } = req.body;
  if (!phone || !/^\d{10}$/.test(String(phone))) {
    return res.status(400).json({ error: 'Valid 10-digit phone number required' });
  }

  if (role === 'cook') {
    const cook = db.prepare('SELECT id FROM cooks WHERE phone = ?').get(String(phone));
    if (!cook) return res.status(404).json({ error: 'No cook account found for this number' });
  }

  // Invalidate any existing unused OTPs for this phone
  db.prepare("UPDATE otps SET used = 1 WHERE phone = ? AND used = 0").run(String(phone));

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
  db.prepare("INSERT INTO otps (phone, code, expires_at) VALUES (?, ?, ?)").run(String(phone), code, expiresAt);

  const { devCode } = await sendOtp(String(phone), code);
  const expose = devCode || process.env.DEV_OTP === 'true';
  res.json({ ok: true, dev: expose, ...(expose ? { devCode: code } : {}) });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { phone, code, name, role = 'customer' } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });

  const otp = db.prepare(
    "SELECT * FROM otps WHERE phone = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1"
  ).get(String(phone), String(code));

  if (!otp) return res.status(400).json({ error: 'Invalid or expired OTP' });

  db.prepare('UPDATE otps SET used = 1 WHERE id = ?').run(otp.id);

  if (role === 'cook') {
    const cook = db.prepare('SELECT * FROM cooks WHERE phone = ?').get(String(phone));
    if (!cook) return res.status(404).json({ error: 'Cook not found' });
    const token = jwt.sign({ sub: cook.id, role: 'cook', phone: cook.phone }, SECRET, { expiresIn: '7d' });
    return res.json({ token, cook, role: 'cook' });
  }

  // Customer: upsert user record
  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(String(phone));
  if (!user) {
    const result = db.prepare('INSERT INTO users (phone, name) VALUES (?, ?)').run(String(phone), name || null);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  } else if (name && !user.name) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, user.id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  }

  const token = jwt.sign({ sub: user.id, role: 'customer', phone: user.phone }, SECRET, { expiresIn: '7d' });
  res.json({ token, user, role: 'customer' });
});

module.exports = router;

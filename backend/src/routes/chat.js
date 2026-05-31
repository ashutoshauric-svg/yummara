const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const THREE_DAYS_AGO = "datetime('now', '-3 days')";

function pruneOld() {
  // Delete messages older than 3 days, then orphaned conversations
  db.prepare(`DELETE FROM chat_messages WHERE created_at < ${THREE_DAYS_AGO}`).run();
  db.prepare(`DELETE FROM conversations WHERE id NOT IN (SELECT DISTINCT conversation_id FROM chat_messages)`).run();
}

// POST /api/chat/:cookId — customer starts or continues a conversation
router.post('/:cookId', (req, res) => {
  const { cookId } = req.params;
  const { body, user_phone, user_name } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'Message body required' });
  if (!user_phone) return res.status(400).json({ error: 'user_phone required' });

  const cook = db.prepare('SELECT id FROM cooks WHERE id = ?').get(cookId);
  if (!cook) return res.status(404).json({ error: 'Cook not found' });

  pruneOld();

  // Upsert conversation
  db.prepare(`
    INSERT INTO conversations (cook_id, user_phone, user_name, last_message_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(cook_id, user_phone) DO UPDATE SET
      user_name = COALESCE(excluded.user_name, user_name),
      last_message_at = datetime('now')
  `).run(cookId, user_phone, user_name || null);

  const conv = db.prepare('SELECT id FROM conversations WHERE cook_id = ? AND user_phone = ?').get(cookId, user_phone);

  const result = db.prepare(
    `INSERT INTO chat_messages (conversation_id, sender, body) VALUES (?, 'customer', ?)`
  ).run(conv.id, body.trim());

  const message = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(result.lastInsertRowid);

  // Notify cook via socket
  const io = req.app.get('io');
  if (io) {
    io.to(`cook_${cookId}`).emit('new_message', { conversation_id: conv.id, message });
  }

  res.json({ ok: true, conversation_id: conv.id, message });
});

// GET /api/chat/conversations — cook gets all their conversations (requires cook auth)
router.get('/conversations', requireAuth, (req, res) => {
  if (req.user.role !== 'cook') return res.status(403).json({ error: 'Cook only' });
  pruneOld();

  const convs = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM chat_messages m WHERE m.conversation_id = c.id AND m.read = 0 AND m.sender = 'customer') as unread,
      (SELECT body FROM chat_messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) as last_body,
      (SELECT sender FROM chat_messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) as last_sender
    FROM conversations c
    WHERE c.cook_id = ?
    ORDER BY c.last_message_at DESC
  `).all(req.user.sub);

  res.json(convs);
});

// GET /api/chat/conversations/:id — get messages in a conversation
router.get('/conversations/:id', requireAuth, (req, res) => {
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  // Cook can access their own; customer matches by phone
  if (req.user.role === 'cook' && conv.cook_id !== req.user.sub)
    return res.status(403).json({ error: 'Forbidden' });

  const messages = db.prepare(
    'SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY id ASC'
  ).all(conv.id);

  // Mark customer messages as read if cook is reading
  if (req.user.role === 'cook') {
    db.prepare(`UPDATE chat_messages SET read = 1 WHERE conversation_id = ? AND sender = 'customer'`).run(conv.id);
  }

  res.json({ conversation: conv, messages });
});

// POST /api/chat/conversations/:id/reply — cook replies
router.post('/conversations/:id/reply', requireAuth, (req, res) => {
  if (req.user.role !== 'cook') return res.status(403).json({ error: 'Cook only' });
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'Message body required' });

  const conv = db.prepare('SELECT * FROM conversations WHERE id = ? AND cook_id = ?').get(req.params.id, req.user.sub);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  db.prepare(`UPDATE conversations SET last_message_at = datetime('now') WHERE id = ?`).run(conv.id);

  const result = db.prepare(
    `INSERT INTO chat_messages (conversation_id, sender, body) VALUES (?, 'cook', ?)`
  ).run(conv.id, body.trim());

  const message = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(result.lastInsertRowid);

  // Notify customer via socket
  const io = req.app.get('io');
  if (io) {
    io.to(`conv_${conv.id}`).emit('new_message', { conversation_id: conv.id, message });
  }

  res.json({ ok: true, message });
});

// GET /api/chat/customer/:cookId — customer fetches their thread with a cook (by phone)
router.get('/customer/:cookId', (req, res) => {
  const { user_phone } = req.query;
  if (!user_phone) return res.status(400).json({ error: 'user_phone required' });

  const conv = db.prepare('SELECT * FROM conversations WHERE cook_id = ? AND user_phone = ?').get(req.params.cookId, user_phone);
  if (!conv) return res.json({ conversation: null, messages: [] });

  const messages = db.prepare(
    'SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY id ASC'
  ).all(conv.id);

  // Mark cook replies as read
  db.prepare(`UPDATE chat_messages SET read = 1 WHERE conversation_id = ? AND sender = 'cook'`).run(conv.id);

  res.json({ conversation: conv, messages });
});

module.exports = router;

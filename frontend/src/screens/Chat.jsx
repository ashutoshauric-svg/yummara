import React from 'react';
import { Ic, YButton } from '../components/ui';
import { NavCtx } from '../lib/NavCtx';
import { API_URL as API } from '../lib/config';

function timeLabel(iso) {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Customer: chat panel that slides up over cook profile ──────────────
export function CustomerChatPanel({ cook, onClose }) {
  const { authUser } = React.useContext(NavCtx);
  const userPhone = authUser?.user?.phone || '';
  const userName  = authUser?.user?.name  || '';

  const [messages, setMessages]     = React.useState([]);
  const [convId, setConvId]         = React.useState(null);
  const [input, setInput]           = React.useState('');
  const [loading, setLoading]       = React.useState(true);
  const [sending, setSending]       = React.useState(false);
  const [guestPhone, setGuestPhone] = React.useState('');
  const [guestName, setGuestName]   = React.useState('');
  const bottomRef = React.useRef(null);

  const phone = userPhone || guestPhone;
  const name  = userName  || guestName;

  React.useEffect(() => {
    if (!phone) { setLoading(false); return; }
    fetch(`${API}/api/chat/customer/${cook.id}?user_phone=${phone}`)
      .then(r => r.json())
      .then(d => { setMessages(d.messages || []); setConvId(d.conversation?.id || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [phone, cook.id]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || !phone) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/api/chat/${cook.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: input.trim(), user_phone: phone, user_name: name }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        setConvId(data.conversation_id);
        setInput('');
      }
    } catch (_) {}
    setSending(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(20,16,10,0.4)', backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div className="yum" onClick={e => e.stopPropagation()} style={{ background: 'var(--yum-paper)', borderRadius: '20px 20px 0 0', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(20,16,10,0.18)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--yum-border-soft)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 17 }}>Message {cook.short}</div>
            <div style={{ fontSize: 12, color: 'var(--yum-ink-3)' }}>{cook.area} · replies within a few hours</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yum-ink-2)' }}>
            {Ic.x({ s: 14 })}
          </button>
        </div>

        {/* Guest phone entry if not logged in */}
        {!userPhone && (
          <div style={{ padding: '12px 20px', background: 'var(--yum-cream)', borderBottom: '1px solid var(--yum-border-soft)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Your name"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 13, outline: 'none' }}/>
            <input value={guestPhone} onChange={e => setGuestPhone(e.target.value.replace(/\D/g,''))} placeholder="Your phone" maxLength={10}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 13, outline: 'none' }}/>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120 }}>
          {loading && <div style={{ textAlign: 'center', color: 'var(--yum-ink-3)', fontSize: 13 }}>Loading…</div>}
          {!loading && messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--yum-ink-3)', fontSize: 13, marginTop: 20 }}>
              No messages yet. Say hi to {cook.short}!
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender === 'customer';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '78%', padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? 'var(--yum-primary)' : 'var(--yum-cream)',
                  color: isMe ? '#fff' : 'var(--yum-ink)',
                  fontSize: 14, lineHeight: 1.45,
                  border: isMe ? 'none' : '1px solid var(--yum-border-soft)',
                }}>
                  {msg.body}
                </div>
                <div style={{ fontSize: 11, color: 'var(--yum-ink-4)', marginTop: 3 }}>{timeLabel(msg.created_at)}</div>
              </div>
            );
          })}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--yum-border-soft)', display: 'flex', gap: 8, flexShrink: 0 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={`Message ${cook.short}…`}
            disabled={!phone}
            style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-pill)', fontSize: 14, outline: 'none', background: 'var(--yum-cream)' }}
          />
          <button onClick={send} disabled={sending || !input.trim() || !phone} style={{
            width: 42, height: 42, borderRadius: 999, border: 'none', flexShrink: 0,
            background: input.trim() && phone ? 'var(--yum-primary)' : 'var(--yum-border)',
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}>
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cook: inbox tab ────────────────────────────────────────────────────
export function CookInbox({ cookId, token }) {
  const [convs, setConvs]         = React.useState([]);
  const [loading, setLoading]     = React.useState(true);
  const [active, setActive]       = React.useState(null); // conversation object
  const [messages, setMessages]   = React.useState([]);
  const [reply, setReply]         = React.useState('');
  const [sending, setSending]     = React.useState(false);
  const bottomRef = React.useRef(null);
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  React.useEffect(() => {
    loadConvs();
  }, []);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConvs() {
    try {
      const res = await fetch(`${API}/api/chat/conversations`, { headers });
      if (res.ok) setConvs(await res.json());
    } catch (_) {}
    setLoading(false);
  }

  async function openConv(conv) {
    setActive(conv);
    try {
      const res = await fetch(`${API}/api/chat/conversations/${conv.id}`, { headers });
      const data = await res.json();
      setMessages(data.messages || []);
      setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
    } catch (_) {}
  }

  async function sendReply() {
    if (!reply.trim() || !active) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/api/chat/conversations/${active.id}/reply`, {
        method: 'POST', headers,
        body: JSON.stringify({ body: reply.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        setReply('');
        setConvs(prev => prev.map(c => c.id === active.id ? { ...c, last_body: reply.trim(), last_sender: 'cook' } : c));
      }
    } catch (_) {}
    setSending(false);
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--yum-ink-3)', fontSize: 14 }}>Loading messages…</div>;

  if (convs.length === 0) return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--yum-ink-3)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--yum-ink-2)', marginBottom: 8 }}>No messages yet.</div>
      <div style={{ fontSize: 14 }}>When customers message you, they'll appear here.</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 0, height: 560, border: '1px solid var(--yum-border-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--yum-paper)' }}>

      {/* Conversation list */}
      <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--yum-border-soft)', overflowY: 'auto', background: 'var(--yum-cream)' }}>
        {convs.map(conv => (
          <div key={conv.id} onClick={() => openConv(conv)} style={{
            padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--yum-border-soft)',
            background: active?.id === conv.id ? 'var(--yum-primary-50)' : 'transparent',
            borderLeft: active?.id === conv.id ? '3px solid var(--yum-primary)' : '3px solid transparent',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{conv.user_name || conv.user_phone}</div>
              {conv.unread > 0 && (
                <span style={{ background: 'var(--yum-primary)', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '2px 6px', minWidth: 18, textAlign: 'center' }}>{conv.unread}</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--yum-ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {conv.last_sender === 'cook' ? 'You: ' : ''}{conv.last_body || '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--yum-ink-4)', marginTop: 3 }}>{timeLabel(conv.last_message_at)}</div>
          </div>
        ))}
      </div>

      {/* Thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!active ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yum-ink-3)', fontSize: 14 }}>
            Select a conversation
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--yum-border-soft)', flexShrink: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{active.user_name || active.user_phone}</div>
              <div style={{ fontSize: 12, color: 'var(--yum-ink-3)' }}>{active.user_phone}</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map(msg => {
                const isMe = msg.sender === 'cook';
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%', padding: '9px 13px',
                      borderRadius: isMe ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                      background: isMe ? 'var(--yum-primary)' : 'var(--yum-cream)',
                      color: isMe ? '#fff' : 'var(--yum-ink)', fontSize: 13, lineHeight: 1.45,
                      border: isMe ? 'none' : '1px solid var(--yum-border-soft)',
                    }}>
                      {msg.body}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--yum-ink-4)', marginTop: 2 }}>{timeLabel(msg.created_at)}</div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--yum-border-soft)', display: 'flex', gap: 8, flexShrink: 0 }}>
              <input value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                placeholder="Reply…"
                style={{ flex: 1, padding: '9px 14px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-pill)', fontSize: 13, outline: 'none' }}
              />
              <button onClick={sendReply} disabled={sending || !reply.trim()} style={{
                width: 38, height: 38, borderRadius: 999, border: 'none', flexShrink: 0,
                background: reply.trim() ? 'var(--yum-primary)' : 'var(--yum-border)',
                color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

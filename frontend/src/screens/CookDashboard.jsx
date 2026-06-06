import React from 'react';
import { io } from 'socket.io-client';
import { YButton, Veg, NonVeg } from '../components/ui';
import { AuthModal } from './Auth';
import { loadAuth, saveAuth, clearAuth } from '../lib/auth';
import { CookInbox } from './Chat';
import { API_URL as API } from '../lib/config';

const CLOUDINARY_CLOUD = 'djhkavj7s';
const CLOUDINARY_PRESET = 'yummara_dishes';

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
}

function timeAgo(isoUtc) {
  const ms = Date.now() - new Date(isoUtc.endsWith('Z') ? isoUtc : isoUtc + 'Z').getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const STATUS_ACTIONS = {
  pending:  [
    { label: 'Accept order',  next: 'accepted',  variant: 'primary'   },
    { label: 'Decline',       next: 'cancelled', variant: 'secondary' },
  ],
  accepted: [
    { label: 'Start cooking', next: 'cooking',   variant: 'primary'   },
    { label: 'Cancel',        next: 'cancelled', variant: 'secondary' },
  ],
  cooking:  [{ label: 'Mark as ready', next: 'ready', variant: 'primary' }],
  ready:    [],
  cancelled:[],
};

const STATUS_META = {
  pending:   { label: 'New order',  bg: '#fef9ec', border: '#e8d080', color: '#a07c10' },
  accepted:  { label: 'Accepted',   bg: '#edf3e6', border: '#a8c490', color: '#3b5630' },
  cooking:   { label: 'Cooking',    bg: '#edf3e6', border: '#4a6b3a', color: '#2e4a22' },
  ready:     { label: 'Ready',      bg: '#e8f5ee', border: '#5cb87a', color: '#1f6b3a' },
  cancelled: { label: 'Cancelled',  bg: '#f9f0ef', border: '#e0b8b4', color: '#8a3a30' },
};

function OrderCard({ order, onStatusChange, token }) {
  const actions = STATUS_ACTIONS[order.status] || [];
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const [busy, setBusy] = React.useState(false);
  const [dispatching, setDispatching] = React.useState(false);
  const [delivery, setDelivery] = React.useState(null);
  const authH = token ? { Authorization: `Bearer ${token}` } : {};

  React.useEffect(() => {
    if (order.status === 'ready') {
      fetch(`${API}/api/delivery/${order.id}`).then(r => r.json()).then(d => setDelivery(d.delivery)).catch(() => {});
    }
  }, [order.id, order.status]);

  const updateStatus = async (next) => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authH },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) onStatusChange(order.id, next);
    } catch (e) { console.error('[cook] updateStatus error', e); }
    setBusy(false);
  };

  const dispatchRider = async () => {
    setDispatching(true);
    try {
      const res = await fetch(`${API}/api/delivery/dispatch/${order.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authH },
      });
      const data = await res.json();
      if (res.ok) {
        setDelivery({ status: 'dispatched', price: data.price });
      } else {
        alert(data.error || 'Could not dispatch rider');
      }
    } catch { alert('Network error — try again'); }
    setDispatching(false);
  };

  return (
    <div className="yum" style={{
      background: 'var(--yum-paper)',
      border: `1.5px solid ${order.status === 'pending' ? '#e8d080' : 'var(--yum-border-soft)'}`,
      borderRadius: 'var(--r-lg)',
      padding: 20, marginBottom: 14,
      boxShadow: order.status === 'pending' ? '0 2px 12px rgba(200,160,20,0.1)' : 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Order <span className="num">#{order.id}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--yum-ink-3)', marginTop: 3 }}>
            <span style={{ fontWeight: 600, color: 'var(--yum-ink-2)' }}>{order.customer_name}</span>
            {' · '}{order.customer_phone}{' · '}{timeAgo(order.placed_at)}
          </div>
        </div>
        <div style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color, flexShrink: 0 }}>
          {meta.label}
        </div>
      </div>

      <div style={{ background: 'var(--yum-cream)', borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 14, border: '1px solid var(--yum-border-soft)' }}>
        {order.items.map((item, i) => (
          <div key={item.dish_id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--yum-border-soft)' : 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.veg ? <Veg size="sm"/> : <NonVeg size="sm"/>}
              <span>{item.name}</span>
              <span className="num" style={{ color: 'var(--yum-ink-3)', fontSize: 13 }}>×{item.qty}</span>
            </span>
            <span className="num" style={{ color: 'var(--yum-ink-2)', fontWeight: 600 }}>₹{item.unit_price * item.qty}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10, marginTop: 8, borderTop: '1px dashed var(--yum-border)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18 }}>
          <span>Total</span>
          <span className="num">₹{order.total}</span>
        </div>
      </div>

      {actions.length > 0 && (
        <div style={{ display: 'flex', gap: 8 }}>
          {actions.map(({ label, next, variant }) => (
            <YButton key={next} variant={variant} size="md" onClick={() => updateStatus(next)} disabled={busy}>{label}</YButton>
          ))}
        </div>
      )}
      {order.status === 'ready' && (
        <div>
          {!delivery || delivery.status === 'failed' || delivery.status === 'cancelled' ? (
            <YButton variant="primary" size="md" onClick={dispatchRider} disabled={dispatching}>
              {dispatching ? 'Dispatching…' : '🛵 Dispatch Rider (Borzo)'}
            </YButton>
          ) : (
            <div style={{ padding: '10px 14px', background: '#e8f5ee', border: '1px solid #5cb87a', borderRadius: 'var(--r-md)', fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: '#1f6b3a' }}>Rider dispatched</span>
              {delivery.rider_name && <span style={{ color: 'var(--yum-ink-2)', marginLeft: 8 }}>· {delivery.rider_name}</span>}
              {delivery.rider_phone && <span style={{ color: 'var(--yum-ink-3)', marginLeft: 8 }}>· {delivery.rider_phone}</span>}
              <span style={{ color: 'var(--yum-ink-3)', marginLeft: 8 }}>· {delivery.status}</span>
            </div>
          )}
        </div>
      )}
      {order.status === 'cancelled' && <div style={{ fontSize: 13, color: 'var(--yum-ink-3)' }}>This order was cancelled.</div>}
    </div>
  );
}

function DishForm({ form, setForm, editingId, saving, onSave, onCancel }) {
  return (
    <div style={{ background: 'var(--yum-paper)', border: '1.5px solid var(--yum-primary)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>{editingId ? 'Edit dish' : 'New dish'}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--yum-ink-2)', marginBottom: 4 }}>Name *</div>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dish name"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}/>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--yum-ink-2)', marginBottom: 4 }}>Description</div>
          <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Short description"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}/>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--yum-ink-2)', marginBottom: 4 }}>Price (₹) *</div>
          <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value.replace(/\D/g, '') }))} placeholder="180" type="tel"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}/>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.veg} onChange={e => setForm(f => ({ ...f, veg: e.target.checked }))} style={{ width: 16, height: 16 }}/>
          Vegetarian
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--yum-ink-2)' }}>Tag:</span>
          {['', 'new', 'reorder', 'highly'].map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, tag: t }))} style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: form.tag === t ? 'var(--yum-primary)' : 'var(--yum-border-soft)',
              color: form.tag === t ? '#fff' : 'var(--yum-ink-2)',
            }}>{t || 'None'}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--yum-ink-2)', marginBottom: 6 }}>Dish photo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 80, height: 60, borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--yum-cream)', border: '1px dashed var(--yum-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(form._preview || form.photo_url)
              ? <img src={form._preview || form.photo_url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="var(--yum-ink-4)" strokeWidth="1.4"><rect x="2" y="4" width="16" height="12" rx="2"/><circle cx="7" cy="9" r="1.5"/><path d="m2 14 5-4 3 3 3-2 5 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            }
          </div>
          <div>
            <label style={{ cursor: 'pointer', display: 'inline-block' }}>
              <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setForm(f => ({ ...f, _imageFile: file, _preview: ev.target.result }));
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}/>
              <span style={{ padding: '7px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--yum-border)', fontSize: 13, background: 'var(--yum-paper)', color: 'var(--yum-ink-2)' }}>
                {(form._preview || form.photo_url) ? 'Change photo' : 'Upload photo'}
              </span>
            </label>
            {(form._preview || form.photo_url) && (
              <button onClick={() => setForm(f => ({ ...f, photo_url: '', _imageFile: null, _preview: null }))}
                style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--yum-ink-3)', fontSize: 12, cursor: 'pointer' }}>Remove</button>
            )}
            <div style={{ fontSize: 11, color: 'var(--yum-ink-4)', marginTop: 4 }}>JPG, PNG or WebP</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <YButton variant="primary" size="sm" onClick={onSave} loading={saving}>{editingId ? 'Update dish' : 'Add to menu'}</YButton>
        <YButton variant="ghost" size="sm" onClick={onCancel}>Cancel</YButton>
      </div>
    </div>
  );
}

function DishManagerTab({ cook, token }) {
  const [dishes, setDishes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editingId, setEditingId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', subtitle: '', price: '', veg: true, tag: '' });
  const [saving, setSaving] = React.useState(false);

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  React.useEffect(() => {
    fetch(`${API}/api/cooks/${cook.id}`)
      .then(r => r.json())
      .then(data => { setDishes(data.dishes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cook.id]);

  function startAdd() {
    setForm({ name: '', subtitle: '', price: '', veg: true, tag: '', photo_url: '', _imageFile: null, _preview: null });
    setEditingId(null); setShowAdd(true);
  }

  function startEdit(dish) {
    setForm({ name: dish.name, subtitle: dish.subtitle || '', price: String(dish.price), veg: !!dish.veg, tag: dish.tag || '', photo_url: dish.photo_url || '', _imageFile: null, _preview: null });
    setEditingId(dish.id); setShowAdd(false);
  }

  async function saveDish() {
    if (!form.name.trim() || !form.price) return alert('Name and price are required');
    setSaving(true);
    try {
      let photo_url = form.photo_url || null;
      if (form._imageFile) {
        try { photo_url = await uploadToCloudinary(form._imageFile); }
        catch (_) { alert('Image upload failed — saving dish without photo'); }
      }
      const body = { name: form.name.trim(), subtitle: form.subtitle.trim() || null, price: Number(form.price), veg: form.veg, tag: form.tag || null, photo_url };
      if (editingId) {
        const res = await fetch(`${API}/api/dishes/${editingId}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(body) });
        if (res.ok) { const u = await res.json(); setDishes(prev => prev.map(d => d.id === editingId ? u : d)); setEditingId(null); }
      } else {
        const res = await fetch(`${API}/api/dishes`, { method: 'POST', headers: authHeaders, body: JSON.stringify(body) });
        if (res.ok) { const c = await res.json(); setDishes(prev => [...prev, c]); setShowAdd(false); }
      }
    } catch (e) { console.error('[cook] saveDish error', e); }
    setSaving(false);
  }

  async function toggleAvailable(dish) {
    try {
      const res = await fetch(`${API}/api/dishes/${dish.id}/available`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ available: !dish.available }) });
      if (res.ok) setDishes(prev => prev.map(d => d.id === dish.id ? { ...d, available: dish.available ? 0 : 1 } : d));
    } catch (e) { console.error('[cook] toggleAvailable error', e); }
  }

  async function deleteDish(id) {
    if (!confirm('Remove this dish from your menu?')) return;
    try {
      const res = await fetch(`${API}/api/dishes/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) setDishes(prev => prev.filter(d => d.id !== id));
    } catch (e) { console.error('[cook] deleteDish error', e); }
  }

  const cancelForm = () => { setShowAdd(false); setEditingId(null); };

  return (
    <div>
      {editingId && <DishForm form={form} setForm={setForm} editingId={editingId} saving={saving} onSave={saveDish} onCancel={cancelForm}/>}
      {!editingId && !showAdd && (
        <button onClick={startAdd} style={{ width: '100%', padding: 16, border: '1px dashed var(--yum-border)', borderRadius: 'var(--r-lg)', background: 'transparent', color: 'var(--yum-ink-2)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10 4v12M4 10h12" strokeLinecap="round"/></svg>
          Add new dish
        </button>
      )}
      {showAdd && !editingId && <DishForm form={form} setForm={setForm} editingId={editingId} saving={saving} onSave={saveDish} onCancel={cancelForm}/>}
      {loading && <div style={{ color: 'var(--yum-ink-3)', padding: '20px 0', fontSize: 14 }}>Loading dishes…</div>}
      {!loading && dishes.map(dish => (
        <div key={dish.id} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'var(--yum-paper)', border: '1px solid var(--yum-border-soft)',
          borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 10,
          opacity: dish.available ? 1 : 0.6,
        }}>
          {dish.photo_url
            ? <div style={{ width: 52, height: 40, borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0 }}>
                <img src={dish.photo_url} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
            : <span style={{ flexShrink: 0 }}>{dish.veg ? <Veg size="sm"/> : <NonVeg size="sm"/>}</span>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              {dish.name}
              {dish.tag && <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.05, color: dish.tag === 'new' ? '#2563eb' : 'var(--yum-primary)', background: dish.tag === 'new' ? '#dbeafe' : 'var(--yum-primary-100)', padding: '2px 6px', borderRadius: 999 }}>{dish.tag}</span>}
            </div>
            {dish.subtitle && <div style={{ fontSize: 12, color: 'var(--yum-ink-3)', marginTop: 2 }}>{dish.subtitle}</div>}
          </div>
          <div className="num" style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, flexShrink: 0 }}>₹{dish.price}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button onClick={() => toggleAvailable(dish)} style={{
              padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 999, cursor: 'pointer', border: 'none',
              background: dish.available ? 'var(--yum-primary-50)' : 'var(--yum-cream)',
              color: dish.available ? 'var(--yum-primary-700)' : 'var(--yum-ink-3)',
            }}>
              {dish.available ? 'Live' : 'Hidden'}
            </button>
            <button onClick={() => startEdit(dish)} style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yum-ink-2)', cursor: 'pointer' }}>
              <svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m14.5 3.5 2 2-9 9-3 1 1-3 9-9Z"/></svg>
            </button>
            <button onClick={() => deleteDish(dish.id)} style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cc4444', cursor: 'pointer' }}>
              <svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m5 5 10 10M15 5 5 15" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CookDashboardScreen({ cook: initialCook, token, onLogout }) {
  const [cook, setCook] = React.useState(initialCook);
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState('orders');
  const socketRef = React.useRef(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/orders?cookId=${cook.id}`);
      const data = await res.json();
      setOrders(data);
    } catch (e) { console.error('[cook] fetchOrders error', e); }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchOrders();
    const socket = io(API);
    socketRef.current = socket;
    socket.emit('join_cook', cook.id);
    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
    });
    return () => socket.disconnect();
  }, [cook.id]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const toggleOnline = async () => {
    const next = cook.online ? 0 : 1;
    try {
      await fetch(`${API}/api/cooks/${cook.id}/online`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ online: next }),
      });
      setCook(prev => ({ ...prev, online: next }));
    } catch (e) { console.error('[cook] toggleOnline error', e); }
  };

  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    onLogout();
  };

  const pending   = orders.filter(o => o.status === 'pending');
  const active    = orders.filter(o => ['accepted', 'cooking'].includes(o.status));
  const completed = orders.filter(o => ['ready', 'cancelled'].includes(o.status));
  const todayEarnings = orders.filter(o => o.status === 'ready').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--yum-cream)' }}>
      <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--yum-border)', background: 'rgba(251,247,240,0.96)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>{cook.short}'s kitchen</div>
          <div style={{ fontSize: 13, color: 'var(--yum-ink-3)', marginTop: 1 }}>{cook.area}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleOnline} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            border: `1px solid ${cook.online ? 'var(--yum-primary)' : 'var(--yum-border)'}`,
            background: cook.online ? 'var(--yum-primary-50)' : 'var(--yum-paper)',
            color: cook.online ? 'var(--yum-primary)' : 'var(--yum-ink-3)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: cook.online ? 'var(--yum-primary)' : 'var(--yum-ink-4)' }}/>
            {cook.online ? 'Online' : 'Offline'}
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: 13, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', color: 'var(--yum-ink-2)' }}>
            Log out
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Pending',         value: pending.length,                                  color: 'var(--yum-mustard)' },
            { label: 'Active',          value: active.length,                                   color: 'var(--yum-primary)' },
            { label: 'Done today',      value: completed.filter(o => o.status === 'ready').length, color: 'var(--yum-ink-2)' },
            { label: "Today's earnings", value: `₹${todayEarnings}`,                             color: 'var(--yum-primary-700)' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--yum-paper)', border: '1px solid var(--yum-border-soft)', borderRadius: 'var(--r-md)', padding: '14px 18px' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--yum-ink-3)', letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
              <div className="num" style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--yum-border)', marginBottom: 24 }}>
          {[['orders', 'Orders'], ['menu', 'My Menu'], ['messages', 'Messages'], ['profile', 'Profile']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '12px 20px', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
              color: tab === key ? 'var(--yum-ink)' : 'var(--yum-ink-3)',
              borderBottom: tab === key ? '2px solid var(--yum-primary)' : '2px solid transparent',
            }}>{label}</button>
          ))}
        </div>

        {tab === 'orders' && (
          <div>
            {pending.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--yum-mustard)' }}/>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--yum-ink-3)', letterSpacing: 0.1, textTransform: 'uppercase' }}>New orders · {pending.length}</div>
                </div>
                {pending.map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} token={token}/>)}
              </div>
            )}
            {active.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--yum-primary)' }}/>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--yum-ink-3)', letterSpacing: 0.1, textTransform: 'uppercase' }}>In progress · {active.length}</div>
                </div>
                {active.map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} token={token}/>)}
              </div>
            )}
            {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--yum-ink-3)' }}><div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--yum-ink-2)', marginBottom: 6 }}>Loading orders…</div></div>}
            {!loading && pending.length === 0 && active.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--yum-ink-3)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--yum-ink-2)', marginBottom: 10 }}>Kitchen's quiet.</div>
                <div style={{ fontSize: 15 }}>New orders will appear here instantly.</div>
              </div>
            )}
            {completed.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--yum-ink-3)', letterSpacing: 0.1, textTransform: 'uppercase', marginBottom: 14 }}>Completed / Cancelled · {completed.length}</div>
                {completed.map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} token={token}/>)}
              </div>
            )}
          </div>
        )}

        {tab === 'menu'     && <DishManagerTab cook={cook} token={token}/>}
        {tab === 'messages' && <CookInbox cookId={cook.id} token={token}/>}
        {tab === 'profile'  && <CookProfileTab cook={cook} token={token} onUpdate={setCook}/>}
      </div>
    </div>
  );
}

// ─── Cook Profile Tab ───────────────────────────────────────────────────────
function CookProfileTab({ cook, token, onUpdate }) {
  const [form, setForm] = React.useState({
    bio: cook.bio || '', area: cook.area || '', address: cook.address || '',
    tags: cook.tags || '', languages: cook.languages || '',
    schedule: cook.schedule || '', min_order: cook.min_order || 0,
  });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/cooks/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { onUpdate(data.cook); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch (_) {}
    setSaving(false);
  };

  const field = (label, key, opts = {}) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--yum-ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.05 }}>{label}</label>
      {opts.multiline
        ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={3}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}/>
        : <input type={opts.type || 'text'} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            placeholder={opts.placeholder || ''}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}/>
      }
      {opts.hint && <div style={{ fontSize: 11, color: 'var(--yum-ink-4)', marginTop: 4 }}>{opts.hint}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24, padding: '14px 18px', background: '#fef9ec', border: '1px solid #e8d080', borderRadius: 'var(--r-md)', fontSize: 13, color: '#a07c10' }}>
        <strong>Pickup address is required</strong> to dispatch a Borzo rider when orders are ready.
      </div>
      {field('Pickup address (for Borzo delivery)', 'address', { placeholder: '12 CMH Road, Indiranagar, Bangalore 560038', hint: 'Full street address — this is where the rider picks up food' })}
      {field('Neighbourhood / Area', 'area', { placeholder: 'Indiranagar' })}
      {field('Cuisine tags', 'tags', { placeholder: 'South Indian · Tamil · Tiffin' })}
      {field('Languages', 'languages', { placeholder: 'Tamil · English · Kannada' })}
      {field('Schedule', 'schedule', { placeholder: 'Mon–Sat · 7am–9pm' })}
      {field('Minimum order (₹)', 'min_order', { type: 'number' })}
      {field('Bio', 'bio', { multiline: true, placeholder: 'Tell customers about your cooking…' })}
      <YButton variant="primary" size="lg" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save profile'}
      </YButton>
    </div>
  );
}

// ─── Cook Registration Screen ───────────────────────────────────────────────
function CookRegistrationScreen({ onSuccess, onBack }) {
  const [step, setStep] = React.useState('form'); // 'form' | 'otp'
  const [form, setForm] = React.useState({ name: '', phone: '', area: '', address: '', tags: '', bio: '' });
  const [otp, setOtp] = React.useState('');
  const [devCode, setDevCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const inp = (key, placeholder, opts = {}) => (
    <div style={{ marginBottom: 14 }}>
      {opts.multiline
        ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} rows={2}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
        : <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
            type={opts.type || 'text'} maxLength={opts.max}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}/>
      }
    </div>
  );

  const submitForm = async () => {
    if (!form.name.trim()) return setError('Name is required');
    if (!/^\d{10}$/.test(form.phone)) return setError('Enter a valid 10-digit phone number');
    if (!form.area.trim()) return setError('Area is required');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/cook-register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Registration failed');
      if (data.devCode) setDevCode(data.devCode);
      setStep('otp');
    } catch { setError('Network error — try again'); }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, code: otp, role: 'cook-register' }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Invalid OTP');
      onSuccess(data);
    } catch { setError('Network error — try again'); }
    setLoading(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: 460, padding: '0 28px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--yum-ink-3)', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0 }}>← Back</button>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>Register as cook</div>
      <div style={{ fontSize: 14, color: 'var(--yum-ink-2)', marginBottom: 28 }}>Tell us about your kitchen — customers will see this.</div>

      {step === 'form' && (
        <>
          {inp('name', 'Your full name *')}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            <span style={{ padding: '12px 14px', background: 'var(--yum-cream)', borderRight: '1px solid var(--yum-border)', fontSize: 14, color: 'var(--yum-ink-2)', flexShrink: 0 }}>+91</span>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} placeholder="Phone number *" maxLength={10} type="tel"
              style={{ flex: 1, padding: '12px 14px', border: 'none', fontSize: 14, outline: 'none' }}/>
          </div>
          {inp('area', 'Your area / neighbourhood * (e.g. Indiranagar)')}
          {inp('address', 'Full pickup address (for delivery rider)')}
          {inp('tags', 'Cuisine (e.g. South Indian · Tamil · Tiffin)')}
          {inp('bio', 'Tell customers about your cooking (optional)', { multiline: true })}
          {error && <div style={{ color: '#cc3333', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <YButton variant="primary" size="lg" full onClick={submitForm} disabled={loading}>
            {loading ? 'Sending OTP…' : 'Continue'}
          </YButton>
        </>
      )}

      {step === 'otp' && (
        <>
          <div style={{ marginBottom: 20, fontSize: 14, color: 'var(--yum-ink-2)' }}>
            OTP sent to <strong>+91 {form.phone}</strong>
          </div>
          {devCode && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef9ec', border: '1px solid #e8d080', borderRadius: 'var(--r-md)', fontSize: 13, color: '#a07c10' }}>
              Dev mode OTP: <strong style={{ fontFamily: 'monospace' }}>{devCode}</strong>
            </div>
          )}
          <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6-digit OTP" maxLength={6} type="tel"
            style={{ width: '100%', padding: '16px 18px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 22, outline: 'none', letterSpacing: 8, textAlign: 'center', boxSizing: 'border-box', marginBottom: 16 }}/>
          {error && <div style={{ color: '#cc3333', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <YButton variant="primary" size="lg" full onClick={verifyOtp} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & Create account'}
          </YButton>
          <button onClick={() => setStep('form')} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--yum-ink-3)', fontSize: 13, cursor: 'pointer', width: '100%' }}>Edit details</button>
        </>
      )}
    </div>
  );
}

export function CookApp() {
  const [auth, setAuth] = React.useState(() => {
    const saved = loadAuth();
    return saved?.role === 'cook' ? saved : null;
  });
  const [mode, setMode] = React.useState('landing'); // 'landing' | 'signin' | 'register'

  const handleAuthSuccess = (data) => {
    saveAuth(data);
    setAuth(data);
    setMode('landing');
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    setMode('landing');
  };

  if (auth?.role === 'cook' && auth.cook) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <CookDashboardScreen cook={auth.cook} token={auth.token} onLogout={handleLogout}/>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="yum" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--yum-cream)', overflowY: 'auto' }}>
        <CookRegistrationScreen onSuccess={handleAuthSuccess} onBack={() => setMode('landing')}/>
      </div>
    );
  }

  return (
    <div className="yum" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--yum-cream)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 28px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: 10 }}>
            Yummara<br/>for Cooks
          </div>
          <div style={{ fontSize: 15, color: 'var(--yum-ink-2)' }}>Your kitchen, your orders, your earnings.</div>
        </div>

        <YButton variant="primary" size="lg" full onClick={() => setMode('signin')}>
          Sign in with phone
        </YButton>
        <div style={{ margin: '12px 0', textAlign: 'center', color: 'var(--yum-ink-3)', fontSize: 13 }}>or</div>
        <YButton variant="secondary" size="lg" full onClick={() => setMode('register')}>
          Register as a new cook
        </YButton>
      </div>

      {mode === 'signin' && (
        <AuthModal role="cook" onSuccess={handleAuthSuccess} onClose={() => setMode('landing')}/>
      )}
    </div>
  );
}

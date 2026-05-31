import React from 'react';
import { YButton, Ic } from '../components/ui';
import { NavCtx } from '../lib/NavCtx';
import { API_URL as API } from '../lib/config';

export function CustomerProfileScreen({ isMobile }) {
  const { authUser, openAuth, logout, go, addToCart, reset } = React.useContext(NavCtx);

  if (!authUser) {
    return (
      <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--yum-cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500 }}>Your account</div>
        <div style={{ color: 'var(--yum-ink-2)', fontSize: 15, marginBottom: 8 }}>Sign in to see your orders and saved addresses.</div>
        <YButton variant="primary" onClick={() => openAuth('customer')}>Sign in</YButton>
      </div>
    );
  }

  const [tab, setTab] = React.useState('orders');
  const [orders, setOrders] = React.useState([]);
  const [addresses, setAddresses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [newAddr, setNewAddr] = React.useState('');
  const [newAddrLabel, setNewAddrLabel] = React.useState('Home');
  const [addingAddr, setAddingAddr] = React.useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${authUser.token}` };

  React.useEffect(() => {
    if (tab === 'orders') loadOrders();
    else loadAddresses();
  }, [tab]);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user/orders`, { headers });
      if (res.ok) setOrders(await res.json());
    } catch (_) {}
    setLoading(false);
  }

  async function loadAddresses() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user/addresses`, { headers });
      if (res.ok) setAddresses(await res.json());
    } catch (_) {}
    setLoading(false);
  }

  async function saveAddress() {
    if (!newAddr.trim()) return;
    try {
      const res = await fetch(`${API}/api/user/addresses`, {
        method: 'POST', headers,
        body: JSON.stringify({ label: newAddrLabel, address: newAddr.trim(), is_default: addresses.length === 0 }),
      });
      if (res.ok) {
        const created = await res.json();
        setAddresses(prev => [...prev, created]);
        setNewAddr(''); setAddingAddr(false);
      }
    } catch (_) {}
  }

  async function deleteAddress(id) {
    try {
      const res = await fetch(`${API}/api/user/addresses/${id}`, { method: 'DELETE', headers });
      if (res.ok) setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (_) {}
  }

  async function setDefault(id) {
    try {
      await fetch(`${API}/api/user/addresses/${id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ is_default: 1 }),
      });
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id ? 1 : 0 })));
    } catch (_) {}
  }

  function handleReorder(order) {
    if (order.items) {
      order.items.forEach(item => {
        if (item.dish_id) addToCart(item.dish_id, order.cook_id);
      });
    }
    reset({ name: 'home' });
  }

  const statusColors = { pending: '#c19829', accepted: '#4a6b3a', cooking: '#4a6b3a', ready: '#2c7a2c', cancelled: '#cc4444' };
  const statusLabels = { pending: 'Waiting for cook', accepted: 'Accepted', cooking: 'Cooking', ready: 'Ready', cancelled: 'Cancelled' };

  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--yum-cream)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '14px 18px' : '20px 56px',
        borderBottom: '1px solid var(--yum-border-soft)',
        background: 'rgba(251,247,240,0.92)', backdropFilter: 'blur(8px)',
        position: 'sticky', top: 0, zIndex: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => go({ name: 'home' })} style={{ width: 38, height: 38, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yum-ink-2)', cursor: 'pointer' }}>
            {Ic.back({ s: 16 })}
          </button>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: isMobile ? 18 : 22, letterSpacing: '-0.01em' }}>
              {authUser.user?.name || 'Account'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--yum-ink-3)' }}>+91 {authUser.user?.phone}</div>
          </div>
        </div>
        <button onClick={logout} style={{ padding: '0 14px', height: 36, borderRadius: 'var(--r-md)', border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', fontSize: 13, color: 'var(--yum-ink-2)', cursor: 'pointer', fontWeight: 500 }}>
          Sign out
        </button>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--yum-border)', padding: isMobile ? '0 18px' : '0 56px', background: 'var(--yum-paper)' }}>
        {['orders', 'addresses'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '14px 20px', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t ? 'var(--yum-ink)' : 'var(--yum-ink-3)',
            borderBottom: tab === t ? '2px solid var(--yum-primary)' : '2px solid transparent',
            textTransform: 'capitalize',
          }}>{t === 'orders' ? 'Order history' : 'Saved addresses'}</button>
        ))}
      </div>

      <div style={{ padding: isMobile ? '20px 18px' : '32px 56px', maxWidth: 720 }}>
        {loading && <div style={{ color: 'var(--yum-ink-3)', fontSize: 14, padding: '20px 0' }}>Loading…</div>}

        {!loading && tab === 'orders' && (
          orders.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--yum-ink-3)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8, color: 'var(--yum-ink-2)' }}>No orders yet.</div>
              <div style={{ fontSize: 14, marginBottom: 20 }}>Browse cooks and place your first order.</div>
              <YButton variant="primary" onClick={() => go({ name: 'home' })}>Explore cooks</YButton>
            </div>
          ) : orders.map(order => (
            <div key={order.id} style={{ background: 'var(--yum-paper)', border: '1px solid var(--yum-border-soft)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{order.cook_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--yum-ink-3)', marginTop: 2 }}>{order.cook_area} · #{order.id} · {new Date(order.placed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: statusColors[order.status] || '#888', background: `${statusColors[order.status]}18`, padding: '3px 10px', borderRadius: 999 }}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              {order.items && order.items.length > 0 && (
                <div style={{ fontSize: 13, color: 'var(--yum-ink-2)', marginBottom: 12, lineHeight: 1.6 }}>
                  {order.items.map(i => `${i.dish_name} ×${i.qty}`).join(' · ')}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>₹{order.total}</div>
                <button onClick={() => handleReorder(order)} style={{
                  padding: '0 16px', height: 36, borderRadius: 'var(--r-md)', border: '1.5px solid var(--yum-primary)', background: 'transparent',
                  color: 'var(--yum-primary-700)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>Reorder</button>
              </div>
            </div>
          ))
        )}

        {!loading && tab === 'addresses' && (
          <div>
            {addresses.map(addr => (
              <div key={addr.id} style={{ background: 'var(--yum-paper)', border: '1px solid var(--yum-border-soft)', borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{addr.label}</span>
                    {addr.is_default ? (
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--yum-primary)', background: 'var(--yum-primary-100)', padding: '2px 8px', borderRadius: 999 }}>Default</span>
                    ) : (
                      <button onClick={() => setDefault(addr.id)} style={{ fontSize: 11, color: 'var(--yum-ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Set default</button>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--yum-ink-2)', wordBreak: 'break-word' }}>{addr.address}</div>
                </div>
                <button onClick={() => deleteAddress(addr.id)} style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cc4444', cursor: 'pointer', flexShrink: 0 }}>
                  {Ic.x({ s: 13 })}
                </button>
              </div>
            ))}

            {addingAddr ? (
              <div style={{ background: 'var(--yum-paper)', border: '1px solid var(--yum-primary)', borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--yum-ink-2)', marginBottom: 4 }}>Label</div>
                    <input value={newAddrLabel} onChange={e => setNewAddrLabel(e.target.value)} placeholder="Home / Work"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--yum-ink-2)', marginBottom: 4 }}>Address</div>
                    <input value={newAddr} onChange={e => setNewAddr(e.target.value)} placeholder="Full address"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}/>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <YButton variant="primary" size="sm" onClick={saveAddress}>Save address</YButton>
                  <YButton variant="ghost" size="sm" onClick={() => { setAddingAddr(false); setNewAddr(''); }}>Cancel</YButton>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingAddr(true)} style={{ width: '100%', padding: 16, border: '1px dashed var(--yum-border)', borderRadius: 'var(--r-lg)', background: 'transparent', color: 'var(--yum-ink-2)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {Ic.plus({ s: 14 })}
                Add new address
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

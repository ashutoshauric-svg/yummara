import React from 'react';
import { Ic, YButton, YChip, YBadge, YImg, Veg, NonVeg } from '../components/ui';
import { DishCard } from '../components/cards';
import { NavCtx, useNav } from '../lib/NavCtx';
import { YUM_INDEX } from '../data/cooks';
import { CustomerChatPanel } from './Chat';
import { API_URL } from '../lib/config';

// ─── Shared header ────────────────────────────────────────────────
function ScreenHeader({ title, subtitle, right, isMobile }) {
  const { back } = useNav();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '14px 18px' : '18px 40px', borderBottom: '1px solid var(--yum-border-soft)', background: 'rgba(251,247,240,0.92)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 6 }}>
      <button onClick={back} style={{ width: 38, height: 38, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yum-ink-2)', cursor: 'pointer', flexShrink: 0 }} aria-label="Back">
        {Ic.back({ s: 16 })}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--yum-ink-3)', letterSpacing: 0.08, textTransform: 'uppercase' }}>{subtitle}</div>}
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: isMobile ? 18 : 22, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

function CartButton() {
  const { cartCount, cartTotal, openCart } = useNav();
  if (!cartCount) return (
    <button onClick={openCart} style={{ width: 38, height: 38, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yum-ink-2)', cursor: 'pointer' }}>
      {Ic.cart({ s: 16 })}
    </button>
  );
  return (
    <button onClick={openCart} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 38, background: 'var(--yum-ink)', color: 'var(--yum-cream)', borderRadius: 'var(--r-pill)', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
      {Ic.cart({ s: 14 })} <span><span className="num">{cartCount}</span> · <span className="num">₹{cartTotal}</span></span>
    </button>
  );
}

// ─── Cook profile ─────────────────────────────────────────────────
export function CookProfile({ cookId, isMobile }) {
  const staticCook = YUM_INDEX.byId[cookId];
  const [cook, setCook] = React.useState(staticCook || null);
  const [loadingCook, setLoadingCook] = React.useState(!staticCook);
  const { openDish, getQty, addToCart, incCart, decCart } = useNav();
  const [filter, setFilter] = React.useState('all');
  const [chatOpen, setChatOpen] = React.useState(false);

  // Fetch from API if not in static data (registered cooks)
  React.useEffect(() => {
    if (!staticCook) {
      fetch(`${API_URL}/api/cooks/${cookId}`)
        .then(r => r.json())
        .then(data => setCook(data.id ? data : null))
        .catch(() => {})
        .finally(() => setLoadingCook(false));
    }
  }, [cookId, staticCook]);

  if (loadingCook) return <div style={{ padding: 40, color: 'var(--yum-ink-3)' }}>Loading…</div>;
  if (!cook) return <div style={{ padding: 40 }}>Cook not found.</div>;

  const filtered = (cook.dishes || []).filter(d => filter === 'veg' ? d.veg : filter === 'nonveg' ? !d.veg : true);

  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--yum-cream)' }}>
      <ScreenHeader title={cook.name} subtitle={`${cook.area} · ${cook.distance}`} right={<CartButton/>} isMobile={isMobile}/>

      <section style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, padding: isMobile ? '0' : '40px 56px' }}>
        <div style={{ padding: isMobile ? '20px 18px 6px' : 0 }}>
          {cook.online ? <YBadge tone="online">Online now · cooking</YBadge> : <YBadge tone="offline">Offline · back tomorrow</YBadge>}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 30 : 48, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 500, marginTop: 14, marginBottom: 10 }}>{cook.name}'s kitchen</h1>
          <div style={{ fontSize: 14, color: 'var(--yum-ink-2)', marginBottom: 14 }}>{cook.tags}</div>
          <p style={{ fontSize: 15, color: 'var(--yum-ink-2)', lineHeight: 1.55, maxWidth: 520, margin: 0 }}>{cook.bio}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 18 : 32, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--yum-border-soft)' }}>
            <Stat label="Rating" value={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ color: 'var(--yum-mustard)' }}>{Ic.star({ s: 16 })}</span><span className="num">{cook.rating}</span><span className="num" style={{ color: 'var(--yum-ink-3)', fontSize: 13 }}>({cook.count})</span></span>}/>
            <Stat label="Prep time" value={<span className="num">{cook.prepTime}</span>}/>
            <Stat label="Min order" value={<span className="num">₹{cook.minOrder}</span>}/>
            <Stat label="Languages" value={<span style={{ fontSize: 13 }}>{cook.languages}</span>}/>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <YBadge tone="verified" icon={Ic.shield({ s: 12 })}>FSSAI verified</YBadge>
            <YBadge tone="neutral" icon={Ic.clock({ s: 12 })}>{cook.schedule}</YBadge>
            <button onClick={() => setChatOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 32, borderRadius: 'var(--r-pill)', border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', fontSize: 12, fontWeight: 600, color: 'var(--yum-ink-2)', cursor: 'pointer' }}>
              <svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 5h14v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z"/><path d="m7 9 3 2.5L13 9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Message cook
            </button>
          </div>
          {chatOpen && <CustomerChatPanel cook={cook} onClose={() => setChatOpen(false)}/>}
        </div>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: isMobile ? 0 : 'var(--r-xl)', aspectRatio: isMobile ? '5/3' : '4/5', margin: isMobile ? '20px 0 0' : 0 }}>
          <YImg tone={cook.tone} label={`${cook.short}'s kitchen`} style={{ position: 'absolute', inset: 0 }}/>
        </div>
      </section>

      <section style={{ padding: isMobile ? '24px 18px' : '20px 56px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 26 : 32, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>
            <span className="num">{cook.dishes.length}</span> dishes from {cook.short}
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <YChip size="sm" active={filter === 'all'} onClick={() => setFilter('all')}>All</YChip>
            <YChip size="sm" active={filter === 'veg'} onClick={() => setFilter('veg')} icon={<Veg size="sm"/>}>Veg</YChip>
            <YChip size="sm" active={filter === 'nonveg'} onClick={() => setFilter('nonveg')} icon={<NonVeg size="sm"/>}>Non-veg</YChip>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: isMobile ? 12 : 18 }}>
          {filtered.map(d => {
            const qty = getQty(d.id);
            return (
              <DishCard
                key={d.id}
                name={d.name} cook={`${cook.short} · ${cook.area}`} price={d.price}
                subtitle={d.subtitle} tone={d.tone} veg={d.veg} tag={d.tag} qtyState={qty}
                imageUrl={d.photo_url || null}
                onClick={() => openDish(d, cook)}
                onAdd={() => addToCart(d.id, cook.id, d.price, d.name, cook.short)}
                onInc={() => incCart(d.id)}
                onDec={() => decCart(d.id)}
              />
            );
          })}
        </div>
      </section>
      <div style={{ height: 100 }}/>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--yum-ink-3)', letterSpacing: 0.08, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  );
}

// ─── Dish modal ───────────────────────────────────────────────────
export function DishModal({ dish, cook, onClose, isMobile }) {
  const { addToCart, incCart, decCart, getQty } = useNav();
  const [spice, setSpice] = React.useState('medium');
  if (!cook || !dish) return null;
  const qty = getQty(dish.id);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(20,16,10,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 24 }} onClick={onClose}>
      <div className="yum" onClick={e => e.stopPropagation()} style={{ background: 'var(--yum-cream)', width: '100%', maxWidth: isMobile ? 'none' : 520, maxHeight: isMobile ? '88vh' : '86vh', borderRadius: isMobile ? '20px 20px 0 0' : 'var(--r-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ position: 'relative', aspectRatio: '5/3', flexShrink: 0 }}>
          {dish.photo_url
            ? <img src={dish.photo_url} alt={dish.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <YImg tone={dish.tone} label={dish.name} style={{ position: 'absolute', inset: 0 }}/>
          }
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 999, background: 'rgba(251,247,240,0.96)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Ic.x({ s: 14 })}
          </button>
          <div style={{ position: 'absolute', top: 14, left: 14 }}>{dish.veg ? <Veg size="lg"/> : <NonVeg size="lg"/>}</div>
        </div>
        <div style={{ padding: '20px 22px 0', overflowY: 'auto', flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--yum-ink-3)' }}>{cook.short} · {cook.area} · {cook.prepTime}</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 6, marginBottom: 8 }}>{dish.name}</h2>
          <p style={{ fontSize: 14, color: 'var(--yum-ink-2)', lineHeight: 1.55, marginTop: 0, marginBottom: 18 }}>{dish.subtitle}</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['mild', 'medium', 'spicy'].map(s => (
              <YChip key={s} size="sm" active={spice === s} onClick={() => setSpice(s)}>{s[0].toUpperCase() + s.slice(1)}</YChip>
            ))}
          </div>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--yum-border)', background: 'var(--yum-paper)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div className="num" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>₹{dish.price}</div>
          {qty ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', height: 44, border: '1px solid var(--yum-primary)', borderRadius: 'var(--r-pill)', overflow: 'hidden', background: 'var(--yum-paper)' }}>
                <button onClick={() => decCart(dish.id)} style={{ width: 44, height: 44, border: 'none', background: 'transparent', color: 'var(--yum-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic.minus()}</button>
                <span className="num" style={{ minWidth: 28, textAlign: 'center', fontWeight: 600, color: 'var(--yum-primary-700)' }}>{qty}</span>
                <button onClick={() => incCart(dish.id)} style={{ width: 44, height: 44, border: 'none', background: 'transparent', color: 'var(--yum-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic.plus()}</button>
              </div>
              <YButton variant="primary" size="lg" onClick={onClose}>Done</YButton>
            </div>
          ) : (
            <YButton variant="primary" size="lg" icon={Ic.plus({ s: 14 })} onClick={() => addToCart(dish.id, cook.id, dish.price, dish.name, cook.short)}>Add to cart</YButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cart sheet ───────────────────────────────────────────────────
function Row({ label, value, sub }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: sub ? 12 : 13, color: sub ? 'var(--yum-ink-3)' : 'var(--yum-ink-2)', margin: '4px 0' }}>
      <span>{label}</span><span className="num" style={{ fontWeight: sub ? 500 : 600 }}>{value}</span>
    </div>
  );
}

export function CartSheet({ onClose, onCheckout, isMobile }) {
  const { cart, incCart, decCart, cartTotal, cartCount } = useNav();
  const groups = Object.values(cart.reduce((acc, item) => {
    (acc[item.cookId] ||= { cookId: item.cookId, cookShort: item.cookShort, items: [] }).items.push(item);
    return acc;
  }, {}));
  const deliveryFee = cartCount ? 29 : 0;
  const platformFee = cartCount ? 12 : 0;
  const total = cartTotal + deliveryFee + platformFee;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(20,16,10,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end' }} onClick={onClose}>
      <div className="yum" onClick={e => e.stopPropagation()} style={{ background: 'var(--yum-cream)', width: isMobile ? '100%' : 440, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--yum-border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 }}>
            {cartCount ? `${cartCount} item${cartCount > 1 ? 's' : ''}` : 'Empty cart'}
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Ic.x({ s: 14 })}
          </button>
        </div>
        <div className="yum-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
          {groups.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--yum-ink-3)', fontSize: 14 }}>Nothing in your cart yet.</div>}
          {groups.map(({ cookId, cookShort, items }) => (
            <div key={cookId} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{cookShort}'s kitchen</div>
              <div style={{ background: 'var(--yum-paper)', border: '1px solid var(--yum-border-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                {items.map((item, i) => (
                  <div key={item.dishId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderTop: i ? '1px solid var(--yum-border-soft)' : 'none' }}>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', height: 30, border: '1px solid var(--yum-primary)', borderRadius: 999 }}>
                      <button onClick={() => decCart(item.dishId)} style={{ width: 30, height: 30, border: 'none', background: 'transparent', color: 'var(--yum-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic.minus({ s: 11 })}</button>
                      <span className="num" style={{ minWidth: 20, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>{item.qty}</span>
                      <button onClick={() => incCart(item.dishId)} style={{ width: 30, height: 30, border: 'none', background: 'transparent', color: 'var(--yum-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic.plus({ s: 11 })}</button>
                    </div>
                    <div className="num" style={{ minWidth: 56, textAlign: 'right', fontWeight: 600, fontSize: 14 }}>₹{item.price * item.qty}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {cartCount > 0 && (
          <div style={{ borderTop: '1px solid var(--yum-border)', padding: '16px 22px', background: 'var(--yum-paper)' }}>
            <Row label="Items" value={`₹${cartTotal}`}/>
            <Row label="Delivery · 1.4 km" value={`₹${deliveryFee}`}/>
            <Row label="Platform fee" value={`₹${platformFee}`} sub/>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--yum-border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Total</div>
              <div className="num" style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600 }}>₹{total}</div>
            </div>
            <YButton variant="primary" size="lg" full style={{ marginTop: 14 }} onClick={onCheckout} iconRight={Ic.arrow()}>Checkout</YButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Checkout ─────────────────────────────────────────────────────
function Block({ title, kicker, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
        <div className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--yum-ink-4)' }}>{kicker}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

export function CheckoutScreen({ onPlace, isMobile }) {
  const { cart, cartTotal, cartCount, authUser, openAuth } = React.useContext(NavCtx);
  const [tip, setTip] = React.useState(20);
  const [address, setAddress] = React.useState('');
  const [customerName, setCustomerName] = React.useState(authUser?.user?.name || '');
  const [customerPhone, setCustomerPhone] = React.useState(authUser?.user?.phone || '');

  const groups = React.useMemo(() => {
    const m = {};
    cart.forEach(it => { (m[it.cookId] ||= { cook: YUM_INDEX.byId[it.cookId], items: [] }).items.push(it); });
    return Object.values(m);
  }, [cart]);

  const deliveryFee = 29;
  const platformFee = 12;
  const total = cartTotal + deliveryFee + platformFee + tip;

  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--yum-cream)' }}>
      <ScreenHeader title="Checkout" subtitle={`${cartCount} item${cartCount > 1 ? 's' : ''}`} isMobile={isMobile}/>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: isMobile ? 0 : 36, padding: isMobile ? '0 18px 24px' : '28px 56px 56px' }}>
        <div>
          {!authUser && (
            <div style={{ marginBottom: 20, padding: 16, background: 'var(--yum-primary-50)', border: '1px solid var(--yum-primary-100)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--yum-primary-700)', fontWeight: 500 }}>Sign in for faster checkout & order history</div>
              <YButton variant="ghost" size="sm" onClick={() => openAuth('customer')}>Sign in</YButton>
            </div>
          )}
          <Block title="Your details" kicker="00">
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--yum-ink-2)', marginBottom: 6 }}>Name</div>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your full name"
                  style={{ width: '100%', height: 40, padding: '0 14px', background: 'var(--yum-paper)', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--yum-ink-2)', marginBottom: 6 }}>Phone</div>
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" type="tel"
                  style={{ width: '100%', height: 40, padding: '0 14px', background: 'var(--yum-paper)', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
              </div>
            </div>
          </Block>

          <Block title="Delivery address" kicker="01">
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Full delivery address"
              style={{ width: '100%', height: 44, padding: '0 14px', background: 'var(--yum-paper)', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-md)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
          </Block>

          <Block title="From the kitchens" kicker="02">
            {groups.map(({ cook, items }) => (
              cook ? (
                <div key={cook.id} style={{ background: 'var(--yum-paper)', border: '1px solid var(--yum-border-soft)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{cook.short}'s kitchen</div>
                  {items.map(it => {
                    const d = cook.dishes.find(x => x.id === it.dishId);
                    return d ? (
                      <div key={it.dishId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--yum-ink-2)', padding: '3px 0' }}>
                        <span>{d.name} <span className="num" style={{ color: 'var(--yum-ink-3)' }}>×{it.qty}</span></span>
                        <span className="num">₹{d.price * it.qty}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : null
            ))}
          </Block>

          <Block title="Tip your cook · 100% to them" kicker="03">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[0, 10, 20, 40, 60].map(amt => (
                <YChip key={amt} active={tip === amt} onClick={() => setTip(amt)}>{amt === 0 ? 'No tip' : `₹${amt}`}</YChip>
              ))}
            </div>
          </Block>
        </div>

        <aside style={{ position: isMobile ? 'static' : 'sticky', top: 100, alignSelf: 'flex-start', marginTop: isMobile ? 0 : 0 }}>
          <div style={{ background: 'var(--yum-paper)', border: '1px solid var(--yum-border-soft)', borderRadius: 'var(--r-lg)', padding: 22 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, marginBottom: 14 }}>Order summary</div>
            <Row label="Items" value={`₹${cartTotal}`}/>
            <Row label="Delivery" value={`₹${deliveryFee}`}/>
            <Row label="Platform fee" value={`₹${platformFee}`} sub/>
            <Row label="Tip" value={`₹${tip}`}/>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--yum-border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Total</div>
              <div className="num" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>₹{total}</div>
            </div>
            <YButton variant="primary" size="lg" full style={{ marginTop: 18 }}
              onClick={() => {
                if (!customerName.trim()) { alert('Please enter your name'); return; }
                if (!/^\d{10}$/.test(customerPhone)) { alert('Please enter a valid 10-digit phone'); return; }
                onPlace({ total, customerName: customerName.trim(), customerPhone, tip, address });
              }}
              iconRight={Ic.arrow()}
            >
              Place order · ₹{total}
            </YButton>
            <div style={{ fontSize: 11, color: 'var(--yum-ink-3)', marginTop: 10, textAlign: 'center' }}>Refundable within 60 seconds.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Tracking screen ──────────────────────────────────────────────
export function TrackingScreen({ order, isMobile }) {
  const statusToStage = { pending: 0, accepted: 1, cooking: 2, ready: 3, cancelled: -1 };
  const stage = statusToStage[order?.status] ?? 0;
  const firstCook = order?.groups?.[0]?.cook;

  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--yum-cream)' }}>
      <ScreenHeader title="Tracking your order" subtitle={`#YUM-${order?.id || '0000'}`} isMobile={isMobile}/>

      <div style={{ position: 'relative', height: isMobile ? 220 : 300, background: 'radial-gradient(circle at 35% 50%, #e6ecdc 0%, #f4eee2 60%, #ece4d3 100%)', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }} viewBox="0 0 600 320">
          {Array.from({ length: 16 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 22} x2="600" y2={i * 22} stroke="#c8bfa3" strokeWidth="0.5"/>)}
          {Array.from({ length: 30 }).map((_, i) => <line key={`v${i}`} x1={i * 22} y1="0" x2={i * 22} y2="320" stroke="#c8bfa3" strokeWidth="0.5"/>)}
          <path d="M120 240 Q 240 180, 360 160 T 480 80" fill="none" stroke="var(--yum-primary)" strokeWidth="3" strokeDasharray="6 4"/>
          <circle cx="120" cy="240" r="10" fill="var(--yum-primary)"/>
          <circle cx="120" cy="240" r="18" fill="none" stroke="var(--yum-primary)" strokeWidth="2" opacity="0.4">
            <animate attributeName="r" from="18" to="34" dur="1.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.5" to="0" dur="1.6s" repeatCount="indefinite"/>
          </circle>
        </svg>
        <div style={{ position: 'absolute', left: 20, top: 20, padding: '10px 14px', background: 'rgba(251,247,240,0.95)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--yum-primary-100)', color: 'var(--yum-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{firstCook?.short?.[0] || 'P'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{firstCook?.short || 'Cook'} is cooking</div>
            <div style={{ fontSize: 11, color: 'var(--yum-ink-3)' }}>{firstCook?.area || '—'} · ~{Math.max(8, 32 - stage * 8)} min</div>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '24px 18px' : '32px 56px', maxWidth: 560 }}>
        {[
          { label: 'Order placed', meta: 'Just now', done: stage >= 0 },
          { label: 'Cook accepted', meta: firstCook?.short || 'Cook', done: stage >= 1 },
          { label: 'Cooking', meta: 'In the kitchen', done: stage >= 2 },
          { label: 'Out for delivery', meta: 'Rider on the way', done: stage >= 3 },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.done ? 'var(--yum-primary)' : 'var(--yum-border)', transition: 'background 0.4s' }}>
                {s.done ? Ic.check({ s: 14 }) : <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff' }}/>}
              </div>
              {i < 3 && <div style={{ width: 2, height: 24, background: 'var(--yum-border-soft)', marginTop: 4 }}/>}
            </div>
            <div style={{ paddingTop: 3 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: s.done ? 'var(--yum-ink)' : 'var(--yum-ink-3)' }}>{s.label}</div>
              <div style={{ fontSize: 13, color: 'var(--yum-ink-3)', marginTop: 2 }}>{s.meta}</div>
            </div>
          </div>
        ))}

        {order && (
          <div style={{ background: 'var(--yum-paper)', border: '1px solid var(--yum-border-soft)', borderRadius: 'var(--r-lg)', padding: 18, marginTop: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--yum-ink-3)', marginBottom: 8 }}>Order <span className="num">#{order.id}</span></div>
            {order.groups?.flatMap(({ cook, items }) => items.map(it => {
              const dish = cook?.dishes?.find(d => d.id === it.dishId);
              return dish ? <div key={it.dishId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '3px 0', color: 'var(--yum-ink-2)' }}><span>{dish.name} <span className="num" style={{ color: 'var(--yum-ink-3)' }}>×{it.qty}</span></span><span className="num">₹{dish.price * it.qty}</span></div> : null;
            }))}
            <div style={{ borderTop: '1px dashed var(--yum-border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18 }}>
              <span>Total</span><span className="num">₹{order.total}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

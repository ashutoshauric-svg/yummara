import React from 'react';
import { Ic, YChip, YImg, YBadge, Veg, NonVeg } from '../components/ui';
import { CookCard, DishCard } from '../components/cards';
import { NavCtx } from '../lib/NavCtx';
import { YUM_COOKS } from '../data/cooks';

function YumLogo({ tone = 'ink', size = 22 }) {
  const color = tone === 'cream' ? 'var(--yum-cream)' : 'var(--yum-ink)';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, color }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: size, fontWeight: 600, letterSpacing: '-0.02em' }}>yummara</span>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--yum-primary)', display: 'inline-block', transform: 'translateY(-2px)' }}/>
    </div>
  );
}

function CustomerNav({ area = 'HSR Layout' }) {
  const { cartCount, cartTotal, openCart, authUser, openAuth, go } = React.useContext(NavCtx);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid var(--yum-border-soft)', background: 'rgba(251,247,240,0.9)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <YumLogo/>
        <nav style={{ display: 'flex', gap: 20, fontSize: 14, color: 'var(--yum-ink-2)' }}>
          <span style={{ color: 'var(--yum-ink)', fontWeight: 600, cursor: 'default' }}>Discover</span>
          <span style={{ cursor: 'pointer' }}>Cooks</span>
          <span style={{ cursor: 'pointer' }}>Tiffin plans</span>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="/cook.html" style={{ padding: '0 14px', height: 36, display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--r-pill)', border: '1px solid var(--yum-border)', background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--yum-ink-2)', cursor: 'pointer', textDecoration: 'none' }}>
          Cook login
        </a>
        {authUser ? (
          <button onClick={() => go({ name: 'profile' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 36, background: 'var(--yum-paper)', color: 'var(--yum-ink)', borderRadius: 'var(--r-pill)', border: '1px solid var(--yum-border)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--yum-primary-100)', color: 'var(--yum-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
              {(authUser.user?.name || authUser.user?.phone || '?')[0].toUpperCase()}
            </span>
            <span>{authUser.user?.name || 'Account'}</span>
          </button>
        ) : (
          <button onClick={() => openAuth('customer')} style={{ padding: '0 14px', height: 36, background: 'var(--yum-paper)', color: 'var(--yum-ink)', borderRadius: 'var(--r-pill)', border: '1px solid var(--yum-border)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Sign in
          </button>
        )}
        {cartCount > 0 ? (
          <button onClick={openCart} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 36, background: 'var(--yum-ink)', color: 'var(--yum-cream)', borderRadius: 'var(--r-pill)', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {Ic.cart({ s: 14 })}
            <span><span className="num">{cartCount}</span> · <span className="num">₹{cartTotal}</span></span>
          </button>
        ) : (
          <button onClick={openCart} style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yum-ink-2)', cursor: 'pointer' }}>
            {Ic.cart({ s: 16 })}
          </button>
        )}
      </div>
    </div>
  );
}

export function CustomerHomeDesktop() {
  const { go } = React.useContext(NavCtx);
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'veg'
    ? YUM_COOKS.filter(c => c.dishes.every(d => d.veg))
    : filter === 'online'
    ? YUM_COOKS.filter(c => c.online)
    : YUM_COOKS;

  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--yum-cream)' }}>
      <CustomerNav/>

      {/* Hero */}
      <section style={{ padding: '48px 56px 32px', display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--yum-ink-3)', letterSpacing: 0.12, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
            {Ic.spark({ s: 11 })} <span style={{ marginLeft: 4 }}>6 home cooks live in HSR right now</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1.04, letterSpacing: '-0.02em', margin: '0 0 16px', fontWeight: 500 }}>
            Ghar ka khana,<br/>by the people who cook it.
          </h1>
          <p style={{ fontSize: 16, color: 'var(--yum-ink-2)', lineHeight: 1.55, maxWidth: 520, margin: '0 0 24px' }}>
            Verified home cooks in HSR, Indiranagar, Koramangala & Whitefield. Order by 6 am or grab what's hot now.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, background: 'var(--yum-paper)', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-pill)', padding: '0 20px', maxWidth: 520, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ color: 'var(--yum-ink-3)' }}>{Ic.search({ s: 18 })}</span>
            <input placeholder="Search cooks, dishes, cuisines…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--yum-ink)' }}/>
          </div>
        </div>
        <div style={{ width: 320, flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, height: 220 }}>
          <YImg tone="warm" label="Padma's tiffin" style={{ borderRadius: 'var(--r-lg)', gridRow: '1 / 3' }}/>
          <YImg tone="clay" label="Garhwali thali" style={{ borderRadius: 'var(--r-lg)' }}/>
          <YImg tone="green" label="Avalakki upma" style={{ borderRadius: 'var(--r-lg)' }}/>
        </div>
      </section>

      {/* Filters */}
      <div style={{ padding: '14px 56px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--yum-border-soft)', borderBottom: '1px solid var(--yum-border-soft)', background: 'rgba(251,247,240,0.8)', position: 'sticky', top: 69, zIndex: 4, backdropFilter: 'blur(6px)' }}>
        <YChip active={filter === 'all'} onClick={() => setFilter('all')}>All cooks</YChip>
        <YChip active={filter === 'online'} onClick={() => setFilter('online')}>Open now</YChip>
        <YChip active={filter === 'veg'} onClick={() => setFilter('veg')}>Veg only</YChip>
        <YChip>Under ₹200</YChip>
        <YChip>South Indian</YChip>
        <YChip>North Indian</YChip>
        <YChip>Coastal</YChip>
      </div>

      {/* Cook grid */}
      <div style={{ padding: '32px 56px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>Cooks near you</h2>
          <span className="num" style={{ fontSize: 13, color: 'var(--yum-ink-3)' }}>{filtered.length} available</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map(cook => (
            <CookCard key={cook.id} {...cook} onClick={() => go({ name: 'cook', cookId: cook.id })}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CustomerHomeMobile() {
  const { go, cartCount, cartTotal, openCart } = React.useContext(NavCtx);
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'veg'
    ? YUM_COOKS.filter(c => c.dishes.every(d => d.veg))
    : filter === 'online'
    ? YUM_COOKS.filter(c => c.online)
    : YUM_COOKS;

  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--yum-cream)' }}>
      {/* Mobile header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--yum-border-soft)', background: 'var(--yum-cream)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 5 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>yummara<span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 999, background: 'var(--yum-primary)', marginLeft: 3, transform: 'translateY(-3px)' }}/></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/cook.html" style={{ fontSize: 12, fontWeight: 500, color: 'var(--yum-ink-3)', textDecoration: 'none' }}>Cook login</a>
        {cartCount > 0 ? (
          <button onClick={openCart} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 34, background: 'var(--yum-ink)', color: 'var(--yum-cream)', borderRadius: 'var(--r-pill)', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {Ic.cart({ s: 14 })} <span className="num">{cartCount}</span>
          </button>
        ) : (
          <button onClick={openCart} style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'var(--yum-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yum-ink-2)' }}>
            {Ic.cart({ s: 16 })}
          </button>
        )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '24px 18px 20px', borderBottom: '1px solid var(--yum-border-soft)' }}>
        <div style={{ fontSize: 11, color: 'var(--yum-ink-3)', letterSpacing: 0.12, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          {Ic.spark({ s: 10 })} <span style={{ marginLeft: 3 }}>6 home cooks live in HSR right now</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 10px', fontWeight: 500 }}>
          Ghar ka khana,<br/>by the people<br/>who cook it.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--yum-ink-2)', lineHeight: 1.5, margin: 0 }}>
          Verified home cooks in HSR, Indiranagar & Koramangala.
        </p>
      </div>

      <div style={{ padding: '16px 18px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, background: 'var(--yum-paper)', border: '1px solid var(--yum-border)', borderRadius: 'var(--r-pill)', padding: '0 16px', marginBottom: 14 }}>
          {Ic.search({ s: 16 })}
          <input placeholder="Search…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--yum-ink)' }}/>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <YChip size="sm" active={filter === 'all'} onClick={() => setFilter('all')}>All</YChip>
          <YChip size="sm" active={filter === 'online'} onClick={() => setFilter('online')}>Open now</YChip>
          <YChip size="sm" active={filter === 'veg'} onClick={() => setFilter('veg')}>Veg</YChip>
          <YChip size="sm">South Indian</YChip>
          <YChip size="sm">Coastal</YChip>
        </div>
      </div>


      <div style={{ padding: '0 18px 32px' }}>
        {filtered.map(cook => (
          <div key={cook.id} onClick={() => go({ name: 'cook', cookId: cook.id })} style={{ background: 'var(--yum-paper)', border: '1px solid var(--yum-border-soft)', borderRadius: 'var(--r-lg)', marginBottom: 12, overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ position: 'relative', height: 140 }}>
              <YImg tone={cook.tone} style={{ position: 'absolute', inset: 0 }}/>
              {cook.online && <div style={{ position: 'absolute', top: 10, left: 10 }}><YBadge tone="online">Online now</YBadge></div>}
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>{cook.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{Ic.star({ s: 12 })} <span className="num" style={{ fontSize: 13, fontWeight: 600 }}>{cook.rating}</span></div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--yum-ink-2)', marginTop: 2 }}>{cook.tags}</div>
              <div style={{ fontSize: 12, color: 'var(--yum-ink-3)', marginTop: 4 }}>{cook.area} · {cook.prepTime}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

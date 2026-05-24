import React from 'react';
import { Ic, Veg, NonVeg, YBadge, YImg } from './ui';

export function CookCard({ name, area, tags, rating, count, prepTime, online = true, fssai = true, tone = 'warm', dishCount, onClick }) {
  return (
    <div onClick={onClick} data-yum-cook-name={name} style={{
      background: 'var(--yum-paper)', borderRadius: 'var(--r-lg)',
      border: '1px solid var(--yum-border-soft)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform .15s ease, box-shadow .15s ease',
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}}>
      <div style={{ position: 'relative', aspectRatio: '4 / 3' }}>
        <YImg tone={tone} label={`${name.split(' ')[0]}'s kitchen`} style={{ position: 'absolute', inset: 0 }}/>
        {online && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <YBadge tone="online">Online now</YBadge>
          </div>
        )}
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--yum-mustard)' }}>
            {Ic.star({ s: 13 })}
            <span className="num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--yum-ink)' }}>{rating}</span>
            <span className="num" style={{ fontSize: 12, color: 'var(--yum-ink-3)' }}>({count})</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--yum-ink-2)' }}>{tags}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--yum-ink-3)', fontSize: 12, marginTop: 2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{Ic.pin({ s: 13 })} {area}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{Ic.clock({ s: 13 })} {prepTime}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--yum-border)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--yum-primary-700)', fontSize: 12, fontWeight: 600 }}>
            {fssai && <>{Ic.shield({ s: 12 })} FSSAI verified</>}
          </span>
          <span style={{ fontSize: 12, color: 'var(--yum-ink-3)' }}><span className="num">{dishCount}</span> dishes today</span>
        </div>
      </div>
    </div>
  );
}

export function DishCard({ name, cook, price, veg = true, tag, tone = 'warm', subtitle, qtyState = 0, onClick, onAdd, onInc, onDec }) {
  return (
    <div onClick={onClick} data-yum-dish-name={name} data-yum-dish-cook={cook} style={{
      background: 'var(--yum-paper)', borderRadius: 'var(--r-lg)',
      border: '1px solid var(--yum-border-soft)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ position: 'relative', aspectRatio: '3 / 2' }}>
        <YImg tone={tone} style={{ position: 'absolute', inset: 0 }}/>
        {tag && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <YBadge tone={tag === 'new' ? 'new' : 'reorder'}>
              {tag === 'new' ? 'New' : tag === 'highly' ? 'Highly reordered' : 'Reorder'}
            </YBadge>
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <span style={{ marginTop: 2, flexShrink: 0 }}>{veg ? <Veg size="sm"/> : <NonVeg size="sm"/>}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.25, marginBottom: 2 }}>{name}</div>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--yum-ink-3)', lineHeight: 1.4 }}>{subtitle}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span className="num" style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>₹{price}</span>
          {qtyState === 0 ? (
            <button onClick={e => { e.stopPropagation(); onAdd && onAdd(); }} style={{
              width: 32, height: 32, borderRadius: 999, border: '1.5px solid var(--yum-primary)',
              background: 'var(--yum-paper)', color: 'var(--yum-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {Ic.plus({ s: 14 })}
            </button>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', height: 32, border: '1px solid var(--yum-primary)', borderRadius: 999, overflow: 'hidden', background: 'var(--yum-paper)' }}>
              <button onClick={e => { e.stopPropagation(); onDec && onDec(); }} style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--yum-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic.minus({ s: 12 })}</button>
              <span className="num" style={{ minWidth: 22, textAlign: 'center', fontWeight: 600, fontSize: 13, color: 'var(--yum-primary-700)' }}>{qtyState}</span>
              <button onClick={e => { e.stopPropagation(); onInc && onInc(); }} style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--yum-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic.plus({ s: 12 })}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

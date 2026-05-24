import React from 'react';

export const Ic = {
  search:   (p={}) => <svg viewBox="0 0 20 20" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="9" r="6"/><path d="m14 14 3.5 3.5" strokeLinecap="round"/></svg>,
  pin:      (p={}) => <svg viewBox="0 0 20 20" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10 17s6-5.2 6-10A6 6 0 0 0 4 7c0 4.8 6 10 6 10Z"/><circle cx="10" cy="7" r="2"/></svg>,
  star:     (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="currentColor"><path d="m10 2 2.4 5 5.6.8-4 3.9.9 5.5L10 14.6 5.1 17.2 6 11.7l-4-3.9L7.6 7Z"/></svg>,
  clock:    (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 2" strokeLinecap="round"/></svg>,
  check:    (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="2"><path d="m4.5 10.5 3 3 8-8.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield:   (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10 2.5 3.5 5v5c0 4 3 6.7 6.5 7.5 3.5-.8 6.5-3.5 6.5-7.5V5L10 2.5Z"/><path d="m7 10 2.2 2L13 8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  heart:    (p={}) => <svg viewBox="0 0 20 20" width={p.s||16} height={p.s||16} fill={p.fill||'none'} stroke="currentColor" strokeWidth="1.7"><path d="M10 16.5S3 12 3 7.5A3.5 3.5 0 0 1 10 6a3.5 3.5 0 0 1 7 1.5C17 12 10 16.5 10 16.5Z"/></svg>,
  plus:     (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 4v12M4 10h12" strokeLinecap="round"/></svg>,
  minus:    (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10h12" strokeLinecap="round"/></svg>,
  arrow:    (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 10h12m-4-4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  cart:     (p={}) => <svg viewBox="0 0 20 20" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 4h2l1.5 9h9L17 7H6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="16.5" r="1.2"/><circle cx="14" cy="16.5" r="1.2"/></svg>,
  filter:   (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 5h14M5 10h10M8 15h4" strokeLinecap="round"/></svg>,
  user:     (p={}) => <svg viewBox="0 0 20 20" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10" cy="7" r="3"/><path d="M3.5 17c1.2-3 3.7-4.5 6.5-4.5s5.3 1.5 6.5 4.5"/></svg>,
  spark:    (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="currentColor"><path d="M10 2 11.6 8 17.5 10 11.6 12 10 18 8.4 12 2.5 10 8.4 8Z"/></svg>,
  chevron:  (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevR:    (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m8 6 4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bell:     (p={}) => <svg viewBox="0 0 20 20" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 1.5H3.5L5 14Z" strokeLinejoin="round"/><path d="M8.5 17.5a1.5 1.5 0 0 0 3 0"/></svg>,
  flame:    (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="currentColor"><path d="M10 2c0 3-4 4-4 8a4 4 0 1 0 8 0c0-1.5-1-2.5-2-3 .5 2-1 3-2 2 0-2 2-4 0-7Z"/></svg>,
  bowl:     (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 10h14M4 10c0 4 2 6 6 6s6-2 6-6M9 6c0-1 .5-2 1-2s1 1 1 2"/></svg>,
  x:        (p={}) => <svg viewBox="0 0 20 20" width={p.s||14} height={p.s||14} fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 5 10 10M15 5 5 15" strokeLinecap="round"/></svg>,
  back:     (p={}) => <svg viewBox="0 0 20 20" width={p.s||16} height={p.s||16} fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m12 5-5 5 5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  whatsapp: (p={}) => <svg viewBox="0 0 20 20" width={p.s||16} height={p.s||16} fill="currentColor"><path d="M10 2a8 8 0 0 0-7 11.9L2 18l4.2-1a8 8 0 1 0 3.8-15Zm4.4 11.4c-.2.5-1 1-1.5 1.1-.4.1-.9.1-3-.6-2.6-1-4.2-3.7-4.3-3.9-.1-.2-1-1.4-1-2.7s.7-1.9 1-2.1c.2-.2.5-.2.7-.2h.5c.2 0 .4 0 .6.4l.7 1.8c.1.2 0 .4-.1.5l-.3.4c-.1.2-.3.3-.1.6.1.2.6 1 1.3 1.6 1 .9 1.8 1.2 2 1.3.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z"/></svg>,
};

export function Veg({ size = 'md' }) {
  return <span className={`veg-ind ${size}`} aria-label="veg"><i/></span>;
}

export function NonVeg({ size = 'md' }) {
  return <span className={`nonveg-ind ${size}`} aria-label="non-veg"><i/></span>;
}

export function YImg({ tone = 'neutral', label, style, children }) {
  return (
    <div className={`yum-img tone-${tone}`} style={style}>
      {children}
      {label && <span>{label}</span>}
    </div>
  );
}

export function Spinner({ size = 14, color = 'currentColor' }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${color}`, borderTopColor: 'transparent',
      animation: 'yumspin 0.7s linear infinite', display: 'inline-block',
    }}>
      <style>{`@keyframes yumspin{to{transform:rotate(360deg)}}`}</style>
    </span>
  );
}

export function YButton({ variant = 'primary', size = 'md', icon, iconRight, state = 'default', loading, children, full, style, ...rest }) {
  const effectiveState = loading ? 'loading' : state;
  const sizes = {
    sm: { h: 32, px: 12, fs: 13, gap: 6, r: 10 },
    md: { h: 40, px: 16, fs: 14, gap: 8, r: 12 },
    lg: { h: 52, px: 22, fs: 15, gap: 10, r: 14 },
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary:     { bg: 'var(--yum-primary)', fg: '#fbf7f0', border: '1px solid var(--yum-primary)' },
    secondary:   { bg: 'transparent', fg: 'var(--yum-ink)', border: '1px solid var(--yum-border)' },
    ghost:       { bg: 'transparent', fg: 'var(--yum-primary)', border: '1px solid transparent' },
    destructive: { bg: 'var(--yum-danger)', fg: '#fff', border: '1px solid var(--yum-danger)' },
    invert:      { bg: 'var(--yum-ink)', fg: '#fbf7f0', border: '1px solid var(--yum-ink)' },
  };
  const v = variants[variant] || variants.primary;
  let bg = v.bg, fg = v.fg, border = v.border, shadow = 'none';
  if (effectiveState === 'disabled') { bg = '#ede6d6'; fg = '#a89d8a'; border = '1px solid #ede6d6'; }

  return (
    <button
      disabled={effectiveState === 'disabled' || loading}
      style={{
        height: s.h, padding: `0 ${s.px}px`, gap: s.gap,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: s.fs, fontWeight: 600, lineHeight: 1,
        borderRadius: s.r, background: bg, color: fg, border,
        cursor: (effectiveState === 'disabled' || loading) ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, color 0.15s',
        boxShadow: shadow,
        width: full ? '100%' : undefined,
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      {loading ? <Spinner size={s.fs} /> : icon}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
}

export function YChip({ children, active, icon, trailing, onClick, variant = 'outline', size = 'md' }) {
  const sz = size === 'sm' ? { h: 28, px: 10, fs: 12 } : { h: 36, px: 14, fs: 13 };
  let bg = 'var(--yum-paper)', fg = 'var(--yum-ink)', border = 'var(--yum-border)';
  if (active) { bg = 'var(--yum-ink)'; fg = 'var(--yum-cream)'; border = 'var(--yum-ink)'; }
  if (variant === 'solid' && !active) { bg = 'var(--yum-primary-50)'; fg = 'var(--yum-primary-700)'; border = 'var(--yum-primary-100)'; }
  return (
    <button onClick={onClick} style={{
      height: sz.h, padding: `0 ${sz.px}px`, gap: 6, fontSize: sz.fs, fontWeight: 500,
      background: bg, color: fg, border: `1px solid ${border}`,
      borderRadius: 'var(--r-pill)', display: 'inline-flex', alignItems: 'center',
      cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
    }}>
      {icon}{children}{trailing}
    </button>
  );
}

export function YBadge({ tone = 'neutral', icon, children, style }) {
  const tones = {
    neutral:  { bg: 'var(--yum-cream-deep)', fg: 'var(--yum-ink-2)', dot: null },
    online:   { bg: 'rgba(44,138,82,0.10)',  fg: 'var(--yum-online)', dot: 'var(--yum-online)' },
    offline:  { bg: 'var(--yum-cream-deep)', fg: 'var(--yum-ink-3)', dot: 'var(--yum-ink-4)' },
    verified: { bg: 'var(--yum-primary-50)', fg: 'var(--yum-primary-700)', dot: null },
    new:      { bg: 'var(--yum-mustard-bg)', fg: '#7a5a14', dot: null },
    reorder:  { bg: 'rgba(193,152,41,0.14)', fg: '#7a5a14', dot: null },
    veg:      { bg: 'rgba(0,109,52,0.08)',   fg: 'var(--yum-veg)', dot: null },
    danger:   { bg: 'rgba(185,68,50,0.08)',  fg: 'var(--yum-danger)', dot: null },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span data-yum-badge-tone={tone} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: t.bg, color: t.fg,
      fontSize: 11.5, fontWeight: 600, letterSpacing: 0.01,
      padding: '4px 9px', borderRadius: 'var(--r-pill)',
      ...style,
    }}>
      {t.dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: t.dot }}/>}
      {icon}{children}
    </span>
  );
}

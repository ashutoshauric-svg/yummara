// Yummara — prototype screens: CookProfile, DishModal, CartSheet, Checkout, Tracking

const NavCtx = React.createContext({
  go: () => {}, back: () => {}, addToCart: () => {}, openDish: () => {},
  cart: [], cartCount: 0, cartTotal: 0,
});
const useNav = () => React.useContext(NavCtx);

// ─── shared header (back arrow + title) ────────────────────────────
function ScreenHeader({ title, subtitle, right, compact, isMobile }) {
  const { back } = useNav();
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 14,
      padding: isMobile ? '14px 18px' : '20px 56px',
      borderBottom: '1px solid var(--yum-border-soft)',
      background: 'rgba(251,247,240,0.92)', backdropFilter:'blur(8px)',
      position:'sticky', top: 0, zIndex: 6,
    }}>
      <button onClick={back} style={{
        width: 38, height: 38, borderRadius: 999,
        border:'1px solid var(--yum-border)', background:'var(--yum-paper)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'var(--yum-ink-2)', cursor:'pointer', flexShrink: 0,
      }} aria-label="Back">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m12 5-5 5 5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle && <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing:0.08, textTransform:'uppercase' }}>{subtitle}</div>}
        <div style={{ fontFamily:'var(--font-display)', fontWeight: 500, fontSize: isMobile ? 18 : 22, letterSpacing:'-0.01em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

function CartButton({ compact }) {
  const { cartCount, cartTotal, openCart } = useNav();
  if (!cartCount) {
    return (
      <button onClick={openCart} style={{ width:38, height:38, borderRadius:999, border:'1px solid var(--yum-border)', background:'var(--yum-paper)', display:'flex',alignItems:'center',justifyContent:'center', color:'var(--yum-ink-2)', cursor:'pointer' }} aria-label="Cart">
        {Ic.cart({s:16})}
      </button>
    );
  }
  return (
    <button onClick={openCart} style={{
      display:'inline-flex', alignItems:'center', gap: 8, padding:'0 14px', height: 38,
      background:'var(--yum-ink)', color:'var(--yum-cream)', borderRadius: 'var(--r-pill)', border:'none',
      fontSize: 13, fontWeight: 600, cursor:'pointer',
    }}>
      <span style={{ display:'inline-flex' }}>{Ic.cart({s:14})}</span>
      <span><span className="num">{cartCount}</span> · <span className="num">₹{cartTotal}</span></span>
    </button>
  );
}

// ─── Cook profile screen ──────────────────────────────────────────
function CookProfile({ cookId, isMobile }) {
  const cook = YUM_INDEX.byId[cookId];
  const { openDish, getQty, addToCart, incCart, decCart } = useNav();
  const [filter, setFilter] = React.useState('all');
  if (!cook) return <div style={{ padding: 40 }}>Cook not found.</div>;

  const filtered = cook.dishes.filter(d => {
    if (filter === 'veg') return d.veg;
    if (filter === 'nonveg') return !d.veg;
    return true;
  });

  return (
    <div className="yum yum-scroll" style={{ width:'100%', height:'100%', overflowY:'auto', background:'var(--yum-cream)' }}>
      <ScreenHeader
        title={cook.name}
        subtitle={`${cook.area} · ${cook.distance}`}
        right={<CartButton/>}
        isMobile={isMobile}
      />

      {/* Hero */}
      <section style={{
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? undefined : '1.1fr 1fr',
        gap: isMobile ? 0 : 40,
        padding: isMobile ? '0' : '40px 56px',
      }}>
        <div style={{ padding: isMobile ? '20px 18px 6px' : 0 }}>
          {cook.online
            ? <YBadge tone="online">Online now · cooking</YBadge>
            : <YBadge tone="offline">Offline · back tomorrow</YBadge>}
          <h1 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? 30 : 48, lineHeight: 1.05, letterSpacing:'-0.02em', fontWeight: 500, marginTop: 14, marginBottom: 10 }}>
            {cook.name}'s kitchen
          </h1>
          <div style={{ fontSize: isMobile ? 14 : 15, color:'var(--yum-ink-2)', marginBottom: 14 }}>{cook.tags}</div>
          <p style={{ fontSize: isMobile ? 14 : 15.5, color:'var(--yum-ink-2)', lineHeight: 1.55, maxWidth: 520, margin: 0 }}>{cook.bio}</p>

          <div style={{ display:'flex', flexWrap:'wrap', gap: isMobile ? 18 : 32, marginTop: 20, paddingTop: 18, borderTop:'1px solid var(--yum-border-soft)' }}>
            <Stat label="Rating" value={
              <span style={{ display:'inline-flex', alignItems:'center', gap: 4 }}>
                <span style={{ color:'var(--yum-mustard)' }}>{Ic.star({s:16})}</span>
                <span className="num">{cook.rating}</span>
                <span className="num" style={{ color:'var(--yum-ink-3)', fontSize: 13 }}>({cook.count})</span>
              </span>
            }/>
            <Stat label="Prep time" value={<span className="num">{cook.prepTime}</span>}/>
            <Stat label="Min order" value={<span className="num">₹{cook.minOrder}</span>}/>
            <Stat label="Languages" value={<span style={{ fontSize: 13 }}>{cook.languages}</span>}/>
          </div>

          <div style={{ display:'flex', gap: 10, marginTop: 18, flexWrap:'wrap' }}>
            <YBadge tone="verified" icon={Ic.shield({s:12})}>FSSAI verified</YBadge>
            <YBadge tone="neutral" icon={Ic.clock({s:12})}>{cook.schedule}</YBadge>
          </div>
        </div>

        <div style={{
          position:'relative', overflow:'hidden',
          borderRadius: isMobile ? 0 : 'var(--r-xl)',
          aspectRatio: isMobile ? '5/3' : '4/5',
          margin: isMobile ? '20px 0 0' : 0,
        }}>
          <YImg tone={cook.tone} label={`${cook.short}'s kitchen — photo`} style={{ position:'absolute', inset:0 }}/>
        </div>
      </section>

      {/* Menu */}
      <section style={{ padding: isMobile ? '24px 18px 24px' : '20px 56px 56px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing:0.1, textTransform:'uppercase' }}>Today's menu</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? 26 : 34, fontWeight: 500, letterSpacing:'-0.015em', marginTop: 4 }}>
              <span className="num">{cook.dishes.length}</span> dishes from {cook.short}'s kitchen
            </h2>
          </div>
          <div style={{ display:'flex', gap: 6 }}>
            <YChip size={isMobile ? 'sm' : 'md'} active={filter==='all'}     onClick={()=>setFilter('all')}>All</YChip>
            <YChip size={isMobile ? 'sm' : 'md'} active={filter==='veg'}     onClick={()=>setFilter('veg')}     icon={<Veg size="sm"/>}>Veg</YChip>
            <YChip size={isMobile ? 'sm' : 'md'} active={filter==='nonveg'}  onClick={()=>setFilter('nonveg')}  icon={<NonVeg size="sm"/>}>Non-veg</YChip>
          </div>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: isMobile ? 14 : 20,
        }}>
          {filtered.map(d => {
            const qty = getQty(d.id);
            const tag = d.tag === 'reorder'
              ? <YBadge tone="reorder" icon={Ic.flame({s:11})}>Highly reordered</YBadge>
              : d.tag === 'highly'
              ? <YBadge tone="reorder" icon={Ic.flame({s:11})}>4× in your building</YBadge>
              : d.tag === 'new'
              ? <YBadge tone="new" icon={Ic.spark({s:11})}>New this week</YBadge>
              : null;
            return (
              <DishCard
                key={d.id}
                name={d.name} cook={`${cook.short} · ${cook.area}`} price={d.price} subtitle={d.subtitle}
                tone={d.tone} veg={d.veg} tag={tag} qtyState={qty}
                onClick={() => openDish(d.id, cook.id)}
                onAdd={() => addToCart(d.id, cook.id)}
                onInc={() => incCart(d.id)}
                onDec={() => decCart(d.id)}
              />
            );
          })}
        </div>
      </section>

      <div style={{ height: 120 }}/>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing:0.08, textTransform:'uppercase' }}>{label}</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize: 20, fontWeight: 500, marginTop: 2, letterSpacing:'-0.005em' }}>{value}</div>
    </div>
  );
}

// ─── Dish modal (overlay) ─────────────────────────────────────────
function DishModal({ dishId, cookId, onClose, isMobile }) {
  const cook = YUM_INDEX.byId[cookId];
  const dish = cook?.dishes.find(d => d.id === dishId);
  const { addToCart, incCart, decCart, getQty } = useNav();
  const [spice, setSpice] = React.useState('medium');
  const [notes, setNotes] = React.useState('');
  if (!cook || !dish) return null;
  const qty = getQty(dish.id);

  return (
    <div style={{
      position:'fixed', inset: 0, zIndex: 20,
      background: 'rgba(20,16,10,0.55)', backdropFilter: 'blur(4px)',
      display:'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent:'center',
      padding: isMobile ? 0 : 24,
    }} onClick={onClose}>
      <div className="yum" onClick={(e)=>e.stopPropagation()} style={{
        background:'var(--yum-cream)',
        width:'100%', maxWidth: isMobile ? 'none' : 560,
        maxHeight: isMobile ? '92vh' : '90vh',
        borderRadius: isMobile ? '20px 20px 0 0' : 'var(--r-xl)',
        overflow:'hidden', display:'flex', flexDirection:'column',
        boxShadow:'var(--shadow-lg)',
      }}>
        <div style={{ position:'relative', aspectRatio:'5/3', flexShrink: 0 }}>
          <YImg tone={dish.tone} label={dish.name} style={{ position:'absolute', inset:0 }}/>
          <button onClick={onClose} style={{
            position:'absolute', top: 14, right: 14, width: 38, height: 38, borderRadius: 999,
            background:'rgba(251,247,240,0.96)', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', color:'var(--yum-ink-2)',
          }} aria-label="Close">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 5 10 10M15 5 5 15" strokeLinecap="round"/></svg>
          </button>
          <div style={{ position:'absolute', top: 14, left: 14 }}>
            {dish.veg ? <Veg size="lg"/> : <NonVeg size="lg"/>}
          </div>
        </div>

        <div style={{ padding: '22px 24px 0', overflowY:'auto', flex: 1 }}>
          <div style={{ fontSize: 12, color:'var(--yum-ink-3)' }}>{cook.short} · {cook.area} · {cook.prepTime}</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize: 30, fontWeight: 500, letterSpacing:'-0.015em', marginTop: 6, marginBottom: 8 }}>{dish.name}</h2>
          <p style={{ fontSize: 14.5, color:'var(--yum-ink-2)', lineHeight: 1.55, marginTop: 0, marginBottom: 20 }}>
            {dish.subtitle}. Cooked fresh on order — Padma-grade attention to ghee, salt, and tempering. Travels in a steel dabba; ours to wash.
          </p>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color:'var(--yum-ink-2)', marginBottom: 8 }}>Spice level</div>
              <div style={{ display:'flex', gap: 6 }}>
                {['mild','medium','spicy'].map(s => (
                  <YChip key={s} size="sm" active={spice===s} onClick={()=>setSpice(s)}>{s[0].toUpperCase()+s.slice(1)}</YChip>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color:'var(--yum-ink-2)', marginBottom: 8 }}>Notes for {cook.short}</div>
              <input
                value={notes} onChange={e=>setNotes(e.target.value)}
                placeholder="Less salt, ghee on side…"
                style={{
                  width: '100%', height: 40, padding:'0 14px',
                  background:'var(--yum-paper)', border:'1px solid var(--yum-border)',
                  borderRadius:'var(--r-md)', fontSize: 14, color:'var(--yum-ink)',
                  outline:'none', fontFamily:'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 22, padding: 14, background:'var(--yum-paper)', border:'1px dashed var(--yum-border)', borderRadius:'var(--r-md)', fontSize: 13, color:'var(--yum-ink-2)', display:'flex', alignItems:'center', gap: 10 }}>
            <span style={{ color:'var(--yum-primary)' }}>{Ic.shield({s:14})}</span>
            <span>{cook.short}'s kitchen was hand-walked by a Yummara verifier. FSSAI on file.</span>
          </div>
        </div>

        <div style={{
          padding: '16px 20px', borderTop:'1px solid var(--yum-border)',
          background:'var(--yum-paper)',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14,
        }}>
          <div className="num" style={{ fontFamily:'var(--font-display)', fontSize: 26, fontWeight: 600 }}>₹{dish.price}</div>
          {qty ? (
            <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', height: 46,
                border:'1px solid var(--yum-primary)', borderRadius:'var(--r-pill)', overflow:'hidden', background:'var(--yum-paper)',
              }}>
                <button onClick={()=>decCart(dish.id)} style={{ width: 46, height: 46, border:'none', background:'transparent', color:'var(--yum-primary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Ic.minus()}</button>
                <span className="num" style={{ minWidth: 28, textAlign:'center', fontWeight: 600, color:'var(--yum-primary-700)' }}>{qty}</span>
                <button onClick={()=>incCart(dish.id)} style={{ width: 46, height: 46, border:'none', background:'transparent', color:'var(--yum-primary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Ic.plus()}</button>
              </div>
              <YButton variant="primary" size="lg" onClick={onClose}>Done</YButton>
            </div>
          ) : (
            <YButton variant="primary" size="lg" icon={Ic.plus({s:14})} onClick={()=>addToCart(dish.id, cook.id)}>Add to cart</YButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cart sheet (overlay) ─────────────────────────────────────────
function CartSheet({ onClose, onCheckout, isMobile }) {
  const { cart, incCart, decCart, removeCart, cartTotal, cartCount } = useNav();
  // Group by cook
  const byCook = cart.reduce((acc, item) => {
    const cook = YUM_INDEX.byId[item.cookId];
    if (!cook) return acc;
    (acc[cook.id] ||= { cook, items: [] }).items.push(item);
    return acc;
  }, {});
  const groups = Object.values(byCook);
  const deliveryFee = cartCount ? 29 : 0;
  const platformFee = cartCount ? 12 : 0;
  const total = cartTotal + deliveryFee + platformFee;

  return (
    <div style={{
      position:'fixed', inset: 0, zIndex: 20,
      background: 'rgba(20,16,10,0.5)', backdropFilter: 'blur(4px)',
      display:'flex', alignItems:'stretch', justifyContent:'flex-end',
    }} onClick={onClose}>
      <div className="yum" onClick={(e)=>e.stopPropagation()} style={{
        background:'var(--yum-cream)',
        width: isMobile ? '100%' : 460,
        height:'100%', display:'flex', flexDirection:'column',
        boxShadow:'var(--shadow-lg)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid var(--yum-border)' }}>
          <div>
            <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing:0.1, textTransform:'uppercase' }}>Your cart</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing:'-0.01em', marginTop: 2 }}>
              {cartCount ? `${cartCount} item${cartCount>1?'s':''} from ${groups.length} cook${groups.length>1?'s':''}` : 'Empty cart'}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 999, border:'1px solid var(--yum-border)', background:'var(--yum-paper)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--yum-ink-2)' }}>
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 5 10 10M15 5 5 15" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="yum-scroll" style={{ flex: 1, overflowY:'auto', padding:'18px 22px' }}>
          {groups.length === 0 && (
            <div style={{ padding: 40, textAlign:'center', color:'var(--yum-ink-3)' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 22, marginBottom: 6, color:'var(--yum-ink-2)' }}>Nothing in your cart yet.</div>
              <div style={{ fontSize: 13 }}>Browse cooks near you to add dishes.</div>
            </div>
          )}
          {groups.map(({ cook, items }) => (
            <div key={cook.id} style={{ marginBottom: 24 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background:'var(--yum-primary-100)', color:'var(--yum-primary-700)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight: 600 }}>{cook.short[0]}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cook.short}'s kitchen</div>
                  <div style={{ fontSize: 12, color:'var(--yum-ink-3)' }}>{cook.area} · {cook.prepTime}</div>
                </div>
              </div>
              <div style={{ background:'var(--yum-paper)', border:'1px solid var(--yum-border-soft)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
                {items.map((item, i) => {
                  const dish = cook.dishes.find(d => d.id === item.dishId);
                  if (!dish) return null;
                  return (
                    <div key={item.dishId} style={{
                      display:'flex', alignItems:'center', gap: 12,
                      padding: 14,
                      borderTop: i ? '1px solid var(--yum-border-soft)' : 'none',
                    }}>
                      <span style={{ marginTop: 1 }}>{dish.veg ? <Veg size="sm"/> : <NonVeg size="sm"/>}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{dish.name}</div>
                        <div style={{ fontSize: 12, color:'var(--yum-ink-3)' }}>{dish.subtitle}</div>
                      </div>
                      <div style={{
                        display:'inline-flex', alignItems:'center', height: 32,
                        border:'1px solid var(--yum-primary)', borderRadius: 999, overflow:'hidden', background:'var(--yum-paper)',
                      }}>
                        <button onClick={()=>decCart(item.dishId)} style={{ width: 32, height: 32, border:'none', background:'transparent', color:'var(--yum-primary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Ic.minus({s:12})}</button>
                        <span className="num" style={{ minWidth: 22, textAlign:'center', fontWeight: 600, fontSize: 13, color:'var(--yum-primary-700)' }}>{item.qty}</span>
                        <button onClick={()=>incCart(item.dishId)} style={{ width: 32, height: 32, border:'none', background:'transparent', color:'var(--yum-primary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Ic.plus({s:12})}</button>
                      </div>
                      <div className="num" style={{ minWidth: 60, textAlign:'right', fontWeight: 600 }}>₹{dish.price * item.qty}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {cartCount > 0 && (
          <div style={{ borderTop:'1px solid var(--yum-border)', padding:'16px 22px', background:'var(--yum-paper)' }}>
            <Row label="Items" value={`₹${cartTotal}`}/>
            <Row label="Delivery · 1.4 km" value={`₹${deliveryFee}`}/>
            <Row label="Platform · cook-tipping fund" value={`₹${platformFee}`} sub/>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop: 10, paddingTop: 10, borderTop:'1px dashed var(--yum-border)' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Total</div>
              <div className="num" style={{ fontFamily:'var(--font-display)', fontSize: 26, fontWeight: 600 }}>₹{total}</div>
            </div>
            <YButton variant="primary" size="lg" full style={{ marginTop: 14 }} onClick={onCheckout} iconRight={Ic.arrow()}>Checkout</YButton>
          </div>
        )}
      </div>
    </div>
  );
}
function Row({ label, value, sub }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', fontSize: sub ? 12 : 13, color: sub ? 'var(--yum-ink-3)' : 'var(--yum-ink-2)', margin:'4px 0' }}>
      <span>{label}</span>
      <span className="num" style={{ fontWeight: sub ? 500 : 600 }}>{value}</span>
    </div>
  );
}

// ─── Checkout screen ──────────────────────────────────────────────
function CheckoutScreen({ onPlace, isMobile }) {
  const { cart, cartTotal, cartCount, authUser, openAuth } = useNav();
  const [address, setAddress] = React.useState('home');
  const [pay, setPay] = React.useState('upi');
  const [tip, setTip] = React.useState(20);
  const [customerName, setCustomerName] = React.useState(authUser?.user?.name || '');
  const [customerPhone, setCustomerPhone] = React.useState(authUser?.user?.phone || '');
  const groups = React.useMemo(() => {
    const m = {};
    cart.forEach(it => { (m[it.cookId] ||= []).push(it); });
    return Object.entries(m).map(([cid, items]) => ({ cook: YUM_INDEX.byId[cid], items }));
  }, [cart]);
  const deliveryFee = 29;
  const platformFee = 12;
  const total = cartTotal + deliveryFee + platformFee + tip;

  return (
    <div className="yum yum-scroll" style={{ width:'100%', height:'100%', overflowY:'auto', background:'var(--yum-cream)' }}>
      <ScreenHeader title="Checkout" subtitle={`${cartCount} item${cartCount>1?'s':''} · ${groups.length} kitchen${groups.length>1?'s':''}`} isMobile={isMobile}/>

      <div style={{
        display:'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr',
        gap: isMobile ? 0 : 36,
        padding: isMobile ? '0 18px 24px' : '32px 56px 56px',
      }}>
        <div>
          {/* Customer details */}
          <Block title="Your details" kicker="00">
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color:'var(--yum-ink-2)', marginBottom: 6 }}>Name</div>
                <input
                  value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  style={{ width:'100%', height: 40, padding:'0 14px', background:'var(--yum-paper)', border:'1px solid var(--yum-border)', borderRadius:'var(--r-md)', fontSize: 14, color:'var(--yum-ink)', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color:'var(--yum-ink-2)', marginBottom: 6 }}>Phone</div>
                <input
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                  placeholder="10-digit mobile number" type="tel"
                  style={{ width:'100%', height: 40, padding:'0 14px', background:'var(--yum-paper)', border:'1px solid var(--yum-border)', borderRadius:'var(--r-md)', fontSize: 14, color:'var(--yum-ink)', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                />
              </div>
            </div>
          </Block>

          {/* Address */}
          <Block title="Delivery address" kicker="01">
            {[
              ['home',  'Home',   'HSR Layout, Sector 2 · 11th Cross, Krithika Apts', 'Default · within delivery zone'],
              ['work',  'Work',   'Outer Ring Rd · Embassy Tech Village, Block C',     '4.2 km · adds ₹15'],
            ].map(([id, label, line, meta]) => (
              <button key={id} onClick={()=>setAddress(id)} style={{
                width:'100%', textAlign:'left', background: address===id ? 'var(--yum-primary-50)' : 'var(--yum-paper)',
                border: `1px solid ${address===id ? 'var(--yum-primary)' : 'var(--yum-border-soft)'}`,
                borderRadius:'var(--r-md)', padding: 14, marginBottom: 10, cursor:'pointer',
                display:'flex', alignItems:'flex-start', gap: 14,
              }}>
                <span style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px solid ${address===id ? 'var(--yum-primary)' : 'var(--yum-border)'}`, marginTop: 2, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--yum-paper)' }}>
                  {address===id && <span style={{ width: 8, height: 8, borderRadius: 999, background:'var(--yum-primary)' }}/>}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                    <span style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', textTransform:'uppercase', letterSpacing: 0.06 }}>{meta}</span>
                  </div>
                  <div style={{ fontSize: 13, color:'var(--yum-ink-2)', marginTop: 4 }}>{line}</div>
                </span>
              </button>
            ))}
            <button style={{ height: 40, padding:'0 14px', background:'transparent', border:'1px dashed var(--yum-border)', borderRadius:'var(--r-md)', fontSize: 13, color:'var(--yum-ink-2)', cursor:'pointer', display:'inline-flex', alignItems:'center', gap: 6 }}>{Ic.plus({s:12})} Add new address</button>
          </Block>

          {/* Items by cook */}
          <Block title="From the kitchens" kicker="02">
            {groups.map(({ cook, items }) => (
              <div key={cook.id} style={{ background:'var(--yum-paper)', border:'1px solid var(--yum-border-soft)', borderRadius:'var(--r-md)', padding: 14, marginBottom: 10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cook.short}'s kitchen</div>
                  <div style={{ fontSize: 12, color:'var(--yum-ink-3)' }}>{cook.prepTime}</div>
                </div>
                {items.map(it => {
                  const d = cook.dishes.find(x => x.id === it.dishId);
                  return (
                    <div key={it.dishId} style={{ display:'flex', justifyContent:'space-between', fontSize: 13, color:'var(--yum-ink-2)', padding:'4px 0' }}>
                      <span>{d.name} <span className="num" style={{ color:'var(--yum-ink-3)' }}>×{it.qty}</span></span>
                      <span className="num">₹{d.price * it.qty}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </Block>

          {/* Payment */}
          <Block title="Payment" kicker="03">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {[
                ['upi',  'UPI',     'Pay by GPay / PhonePe / BHIM'],
                ['card', 'Card',    'Visa · MC · Rupay · saved'],
                ['cod',  'Cash',    'Pay on delivery'],
              ].map(([id, label, sub]) => (
                <button key={id} onClick={()=>setPay(id)} style={{
                  textAlign:'left', background: pay===id ? 'var(--yum-primary-50)' : 'var(--yum-paper)',
                  border: `1px solid ${pay===id ? 'var(--yum-primary)' : 'var(--yum-border-soft)'}`,
                  borderRadius:'var(--r-md)', padding: 14, cursor:'pointer',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                  <div style={{ fontSize: 12, color:'var(--yum-ink-3)', marginTop: 4 }}>{sub}</div>
                </button>
              ))}
            </div>
          </Block>

          {/* Tip */}
          <Block title="Tip your cook · goes 100% to them" kicker="04">
            <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
              {[0, 10, 20, 40, 60].map(amt => (
                <YChip key={amt} active={tip===amt} onClick={()=>setTip(amt)}>{amt === 0 ? 'No tip' : `₹${amt}`}</YChip>
              ))}
            </div>
          </Block>
        </div>

        {/* Sticky summary */}
        <aside style={{ position: isMobile ? 'sticky' : 'sticky', top: isMobile ? undefined : 100, alignSelf:'flex-start', marginTop: isMobile ? 12 : 0 }}>
          <div style={{ background:'var(--yum-paper)', border:'1px solid var(--yum-border-soft)', borderRadius:'var(--r-lg)', padding: 22 }}>
            <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing:0.1, textTransform:'uppercase' }}>Summary</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing:'-0.01em', marginTop: 4 }}>Place your order</div>
            <div style={{ marginTop: 14 }}>
              <Row label="Items" value={`₹${cartTotal}`}/>
              <Row label="Delivery" value={`₹${deliveryFee}`}/>
              <Row label="Platform · cook-tipping fund" value={`₹${platformFee}`} sub/>
              <Row label="Tip your cook" value={`₹${tip}`}/>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop: 12, paddingTop: 12, borderTop:'1px dashed var(--yum-border)' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Total</div>
                <div className="num" style={{ fontFamily:'var(--font-display)', fontSize: 28, fontWeight: 600 }}>₹{total}</div>
              </div>
            </div>
            <YButton variant="primary" size="lg" full style={{ marginTop: 18 }} onClick={() => {
                if (!customerName.trim()) { alert('Please enter your name'); return; }
                if (!/^\d{10}$/.test(customerPhone)) { alert('Please enter a valid 10-digit phone number'); return; }
                onPlace({ total, customerName: customerName.trim(), customerPhone, tip, address });
              }} iconRight={Ic.arrow()}>
              Place order · ₹{total}
            </YButton>
            <div style={{ fontSize: 11, color:'var(--yum-ink-3)', marginTop: 10, textAlign:'center' }}>
              Refundable for 60 seconds after placing.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Block({ title, kicker, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap: 10, marginBottom: 14 }}>
        <div className="num" style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--yum-ink-4)', letterSpacing: 0.1 }}>{kicker}</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize: 20, fontWeight: 500, letterSpacing:'-0.01em' }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

// ─── Tracking screen ─────────────────────────────────────────────
function TrackingScreen({ order, isMobile }) {
  const statusToStage = { pending: 0, accepted: 1, cooking: 2, ready: 3, cancelled: -1 };
  const stage = statusToStage[order?.status] ?? 0;

  const groups = order?.groups || [];
  const firstCook = groups[0]?.cook;

  const stages = [
    { label: 'Order placed',         meta: 'Just now',                          done: stage >= 0 },
    { label: 'Cook accepted',        meta: firstCook?.short || 'Cook',           done: stage >= 1 },
    { label: 'Cooking',              meta: 'In the kitchen',                     done: stage >= 2 },
    { label: 'Out for delivery',     meta: 'Rider on the way',                   done: stage >= 3 },
  ];

  return (
    <div className="yum yum-scroll" style={{ width:'100%', height:'100%', overflowY:'auto', background:'var(--yum-cream)' }}>
      <ScreenHeader title="Tracking your order" subtitle={`#YUM-${order?.id || '0000'}`} isMobile={isMobile}/>

      {/* "Map" hero */}
      <div style={{ position:'relative', height: isMobile ? 240 : 320, background: 'radial-gradient(circle at 35% 50%, #e6ecdc 0%, #f4eee2 60%, #ece4d3 100%)', overflow:'hidden' }}>
        <svg style={{ position:'absolute', inset: 0, width:'100%', height:'100%', opacity: 0.4 }} viewBox="0 0 600 320">
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 22} x2="600" y2={i * 22} stroke="#c8bfa3" strokeWidth="0.5"/>
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 22} y1="0" x2={i * 22} y2="320" stroke="#c8bfa3" strokeWidth="0.5"/>
          ))}
          <path d="M120 240 Q 240 180, 360 160 T 480 80" fill="none" stroke="var(--yum-primary)" strokeWidth="3" strokeDasharray="6 4"/>
          <circle cx="120" cy="240" r="10" fill="var(--yum-primary)"/>
          <circle cx="120" cy="240" r="18" fill="none" stroke="var(--yum-primary)" strokeWidth="2" opacity="0.4">
            <animate attributeName="r" from="18" to="34" dur="1.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.5" to="0" dur="1.6s" repeatCount="indefinite"/>
          </circle>
          <rect x="470" y="68" width="20" height="20" fill="var(--yum-ink)"/>
        </svg>
        <div style={{ position:'absolute', left: 20, top: 20, padding:'10px 14px', background:'rgba(251,247,240,0.94)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', gap: 10, boxShadow:'var(--shadow-sm)' }}>
          <span style={{ width: 36, height: 36, borderRadius: 999, background:'var(--yum-primary-100)', color:'var(--yum-primary-700)', display:'flex',alignItems:'center',justifyContent:'center', fontFamily:'var(--font-display)', fontWeight: 600 }}>{firstCook?.short[0] || 'P'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{firstCook?.short || 'Padma'} is cooking</div>
            <div style={{ fontSize: 11, color:'var(--yum-ink-3)' }}>{firstCook?.area || 'Indiranagar'} · ~28 min away</div>
          </div>
        </div>
        <div style={{ position:'absolute', right: 20, top: 20, padding:'8px 14px', background:'var(--yum-ink)', color:'var(--yum-cream)', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
          ETA <span className="num">{Math.max(8, 32 - stage * 8)} min</span>
        </div>
      </div>

      <section style={{
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? undefined : '1.3fr 1fr',
        gap: isMobile ? 0 : 36,
        padding: isMobile ? '24px 18px' : '36px 56px 56px',
      }}>
        <div>
          <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing:0.1, textTransform:'uppercase' }}>Live timeline</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? 26 : 32, fontWeight: 500, letterSpacing:'-0.015em', marginTop: 4, marginBottom: 24 }}>
            {stage < 1 ? "Looking for your cook…" : stage < 2 ? `${firstCook?.short || 'Padma'} accepted — heating up the kadhai.` : stage < 3 ? "Cooking on flame, not microwave." : "On its way to you."}
          </h2>

          <div style={{ position:'relative', paddingLeft: 32 }}>
            <div style={{ position:'absolute', left: 11, top: 8, bottom: 8, width: 2, background:'var(--yum-border)' }}/>
            {stages.map((s, i) => (
              <div key={i} style={{ position:'relative', paddingBottom: 22 }}>
                <span style={{
                  position:'absolute', left: -27, top: 2,
                  width: 24, height: 24, borderRadius: 999,
                  background: s.done ? 'var(--yum-primary)' : 'var(--yum-paper)',
                  border: `1.5px solid ${s.done ? 'var(--yum-primary)' : 'var(--yum-border)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center', color:'#fbf7f0',
                }}>
                  {s.done && Ic.check({s:12})}
                </span>
                <div style={{ fontFamily:'var(--font-display)', fontSize: 18, fontWeight: 500, color: s.done ? 'var(--yum-ink)' : 'var(--yum-ink-3)' }}>{s.label}</div>
                <div style={{ fontSize: 13, color:'var(--yum-ink-3)', marginTop: 2 }}>{s.meta}</div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div style={{ background:'var(--yum-paper)', border:'1px solid var(--yum-border-soft)', borderRadius:'var(--r-lg)', padding: 22, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing:0.1, textTransform:'uppercase' }}>Order</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing:'-0.01em', marginTop: 4 }}>What's coming</div>
            <ul style={{ margin:'16px 0 0', padding: 0, listStyle:'none' }}>
              {groups.flatMap(g => g.items.map(it => {
                const d = g.cook.dishes.find(x => x.id === it.dishId);
                return (
                  <li key={it.dishId} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--yum-border-soft)', fontSize: 14 }}>
                    <span style={{ display:'flex', alignItems:'center', gap: 8 }}>{d.veg ? <Veg size="sm"/> : <NonVeg size="sm"/>}{d.name} <span className="num" style={{ color:'var(--yum-ink-3)' }}>×{it.qty}</span></span>
                    <span className="num">₹{d.price * it.qty}</span>
                  </li>
                );
              }))}
            </ul>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 12, fontFamily:'var(--font-display)', fontWeight: 600, fontSize: 18 }}>
              <span>Total paid</span>
              <span className="num">₹{order?.total || 0}</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
            <YButton variant="secondary" size="md" icon={Ic.whatsapp({s:14})}>Chat with cook</YButton>
            <YButton variant="ghost"     size="md">Help</YButton>
          </div>
        </aside>
      </section>
    </div>
  );
}

Object.assign(window, {
  NavCtx, useNav,
  ScreenHeader, CartButton,
  CookProfile, DishModal, CartSheet, CheckoutScreen, TrackingScreen,
});

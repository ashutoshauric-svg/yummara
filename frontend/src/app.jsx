// Yummara — clickable prototype root + tweakable controls
// Renders: customer flow (default), cook landing, OR design system canvas.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "view": "prototype",
  "persona": "customer",
  "device": "desktop",
  "primary": "#4a6b3a",
  "accent": "#c19829",
  "displayFont": "Fraunces",
  "uiFont": "Inter",
  "density": "comfortable",
  "cornerRadius": 16,
  "showAi": true,
  "showReorderBadges": true,
  "darkHero": false
}/*EDITMODE-END*/;

// ─── Theme injection ─────────────────────────────────────────────
function ThemeStyle({ t }) {
  // derive a 700 from the primary (just darken via mix)
  // We approximate by darkening 12% via color-mix.
  const r = t.cornerRadius;
  const densityScale = t.density === 'compact' ? 0.86 : 1;
  return (
    <style>{`
      :root {
        --yum-primary: ${t.primary};
        --yum-primary-700: color-mix(in oklab, ${t.primary} 78%, #1d1812 22%);
        --yum-primary-600: color-mix(in oklab, ${t.primary} 88%, #1d1812 12%);
        --yum-primary-500: ${t.primary};
        --yum-primary-400: color-mix(in oklab, ${t.primary} 70%, #fbf7f0 30%);
        --yum-primary-100: color-mix(in oklab, ${t.primary} 18%, #fbf7f0 82%);
        --yum-primary-50:  color-mix(in oklab, ${t.primary} 10%, #fbf7f0 90%);
        --yum-mustard: ${t.accent};
        --yum-mustard-bg: color-mix(in oklab, ${t.accent} 28%, #fbf7f0 72%);
        --font-display: '${t.displayFont}', ui-serif, Georgia, serif;
        --font-sans:    '${t.uiFont}', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        --r-xs: ${Math.max(2, r * 0.27)}px;
        --r-sm: ${Math.max(4, r * 0.4)}px;
        --r-md: ${Math.max(6, r * 0.6)}px;
        --r-lg: ${r}px;
        --r-xl: ${r * 1.35}px;
      }
      .yum .twkable-section { padding-block: ${44 * densityScale}px !important; }
      .yum .twkable-condensed h1 { font-size: ${56 * densityScale}px !important; }
    `}</style>
  );
}

// ─── Mobile device frame ─────────────────────────────────────────
function PhoneFrame({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display:'flex', alignItems:'center', justifyContent:'center',
      background: 'radial-gradient(circle at 30% 20%, #ece6d3 0%, #d9d1bd 100%)',
      padding: 24, overflow: 'hidden',
    }}>
      <div style={{
        width: 410, height: '94vh', maxHeight: 880,
        background: '#0e0a06',
        borderRadius: 52, padding: 12,
        boxShadow: '0 30px 60px rgba(20,16,10,0.28), inset 0 0 0 1px rgba(255,255,255,0.04)',
        flexShrink: 0,
      }}>
        <div style={{
          width:'100%', height:'100%', borderRadius: 42,
          background: 'var(--yum-cream)', overflow: 'hidden', position:'relative',
        }}>
          <div style={{
            position:'absolute', top: 0, left: 0, right: 0, height: 28,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'8px 28px 0', fontSize: 12, fontWeight: 600, color:'var(--yum-ink)',
            zIndex: 100, pointerEvents:'none', fontVariantNumeric:'tabular-nums',
          }}>
            <span>9:41</span>
            <span style={{ position:'absolute', left: '50%', transform:'translateX(-50%)', top: 4, width: 92, height: 22, background:'#0e0a06', borderRadius: 16 }}/>
            <span style={{ display:'flex', gap: 6, alignItems:'center' }}>
              <svg viewBox="0 0 20 12" width="20" height="12"><rect x="0.5" y="0.5" width="17" height="11" rx="2.5" fill="none" stroke="currentColor"/><rect x="2" y="2" width="11" height="8" rx="1" fill="currentColor"/><rect x="18" y="4" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>
            </span>
          </div>
          <div style={{ width:'100%', height:'100%', paddingTop: 28 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main app shell ──────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Routing
  const [stack, setStack] = React.useState([{ name: 'home' }]);
  const screen = stack[stack.length - 1];
  const go = React.useCallback((s) => setStack(prev => [...prev, s]), []);
  const back = React.useCallback(() => setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev), []);
  const reset = React.useCallback((s = { name: 'home' }) => setStack([s]), []);

  // Auth
  const [authUser, setAuthUser] = React.useState(() => window.YUM_AUTH || null);
  const [showAuth, setShowAuth] = React.useState(false);
  const [authRole, setAuthRole] = React.useState('customer');
  const openAuth = React.useCallback((role = 'customer') => { setAuthRole(role); setShowAuth(true); }, []);
  const logout = React.useCallback(() => {
    if (window.clearAuth) window.clearAuth();
    setAuthUser(null);
    reset({ name: 'home' });
  }, [reset]);
  const handleAuthSuccess = React.useCallback((data) => {
    setAuthUser(data);
    setShowAuth(false);
  }, []);

  // Cart
  const [cart, setCart] = React.useState([]);
  const cartCount = cart.reduce((n, it) => n + it.qty, 0);
  const cartTotal = cart.reduce((n, it) => {
    const cook = YUM_INDEX.byId[it.cookId];
    const d = cook?.dishes.find(x => x.id === it.dishId);
    return n + (d ? d.price * it.qty : 0);
  }, 0);

  const addToCart = (dishId, cookId) => setCart(prev => {
    const i = prev.findIndex(x => x.dishId === dishId);
    if (i >= 0) return prev.map((x, idx) => idx === i ? { ...x, qty: x.qty + 1 } : x);
    return [...prev, { dishId, cookId, qty: 1 }];
  });
  const incCart = (dishId) => setCart(prev => prev.map(x => x.dishId === dishId ? { ...x, qty: x.qty + 1 } : x));
  const decCart = (dishId) => setCart(prev => prev.flatMap(x => x.dishId === dishId ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x]));
  const removeCart = (dishId) => setCart(prev => prev.filter(x => x.dishId !== dishId));
  const getQty = (dishId) => cart.find(x => x.dishId === dishId)?.qty || 0;

  // Modal/sheet state
  const [dishModal, setDishModal] = React.useState(null); // {dishId, cookId}
  const [cartOpen, setCartOpen] = React.useState(false);
  const openDish = (dishId, cookId) => setDishModal({ dishId, cookId });
  const openCart = () => setCartOpen(true);

  // Socket ref — persists across renders, one connection per session
  const socketRef = React.useRef(null);

  // Last placed order (for tracking screen)
  const [placedOrder, setPlacedOrder] = React.useState(null);
  const placeOrder = async ({ total, customerName, customerPhone, tip, address }) => {
    const groups = Object.values(cart.reduce((m, it) => {
      const cook = YUM_INDEX.byId[it.cookId];
      (m[it.cookId] ||= { cook, items: [] }).items.push(it);
      return m;
    }, {}));
    const firstGroup = groups[0];
    if (!firstGroup) return;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authUser?.token) headers['Authorization'] = `Bearer ${authUser.token}`;
      const res = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName,
          customerPhone: String(customerPhone),
          cookId: firstGroup.cook.id,
          items: firstGroup.items.map(it => ({ dishId: it.dishId, qty: it.qty })),
          tip: tip || 0,
          address: address || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');

      setPlacedOrder({ id: data.id, status: data.status, groups, total });
      setCart([]);
      setCartOpen(false);

      // Subscribe to real-time order status updates
      if (!socketRef.current) {
        socketRef.current = window.io('http://localhost:3001');
      }
      socketRef.current.emit('join_order', data.id);
      socketRef.current.off('order_update');
      socketRef.current.on('order_update', (updated) => {
        setPlacedOrder(prev =>
          prev && prev.id === updated.id ? { ...prev, status: updated.status } : prev
        );
      });

      reset({ name: 'tracking' });
    } catch (err) {
      console.error('[yummara] placeOrder error:', err);
      alert('Could not place order: ' + err.message + '\n\nMake sure the backend is running:\n  cd backend && node server.js');
    }
  };

  // Delegated click handler: any element with data-yum-cook-name or data-yum-dish-name
  const onContainerClick = (e) => {
    const ce = e.target.closest?.('[data-yum-cook-name]');
    const de = e.target.closest?.('[data-yum-dish-name]');
    // dish takes precedence if it's inside a cook element (it's more specific)
    if (de && (!ce || de.contains(ce) || ce.contains(de) && de !== ce)) {
      // figure out which one is inside which; dish wins
      const dishName = de.getAttribute('data-yum-dish-name');
      const cookField = de.getAttribute('data-yum-dish-cook') || '';
      const cookGuess = cookField.split('·')[0].trim();
      const cook = yumFindCookByName(cookGuess);
      const dish = yumFindDish(dishName);
      if (dish) {
        e.stopPropagation();
        openDish(dish.id, dish.cookId);
        return;
      }
      if (cook) {
        e.stopPropagation();
        go({ name: 'cook', cookId: cook.id });
        return;
      }
    } else if (ce) {
      const cookName = ce.getAttribute('data-yum-cook-name');
      const cook = yumFindCookByName(cookName);
      if (cook) {
        e.stopPropagation();
        go({ name: 'cook', cookId: cook.id });
      }
    }
  };

  const isMobile = t.device === 'mobile';
  const navValue = {
    go, back, reset,
    openDish, openCart,
    addToCart, incCart, decCart, removeCart, getQty,
    cart, cartCount, cartTotal,
    authUser, openAuth, logout,
  };

  // Render content based on view
  let content;
  if (t.view === 'designSystem') {
    content = (
      <DesignCanvas minScale={0.05} maxScale={2}>
        <DCSection id="ds-foundation" title="01 · Foundation" subtitle="Color, type, indicators — the bones.">
          <DCArtboard id="colors"     label="Colors"       width={1100} height={780}><ColorsArtboard/></DCArtboard>
          <DCArtboard id="type"       label="Typography"   width={1100} height={780}><TypeArtboard/></DCArtboard>
          <DCArtboard id="indicators" label="Indicators · badges" width={900} height={780}><IndicatorsArtboard/></DCArtboard>
        </DCSection>
        <DCSection id="ds-components" title="02 · Five core components" subtitle="Buttons, inputs, chips, cards, badges — everything else is built from these.">
          <DCArtboard id="buttons" label="Buttons"      width={950}  height={780}><ButtonsArtboard/></DCArtboard>
          <DCArtboard id="inputs"  label="Inputs · OTP" width={950}  height={780}><InputsArtboard/></DCArtboard>
          <DCArtboard id="chips"   label="Filter chips" width={950}  height={780}><ChipsArtboard/></DCArtboard>
          <DCArtboard id="cards"   label="Cards"        width={1400} height={1900}><CardsArtboard/></DCArtboard>
        </DCSection>
      </DesignCanvas>
    );
  } else if (t.persona === 'cook') {
    content = isMobile
      ? <PhoneFrame><CookLandingMobile/></PhoneFrame>
      : <CookLandingDesktop/>;
  } else {
    // Customer prototype flow
    let inner;
    if (screen.name === 'home')      inner = isMobile ? <CustomerHomeMobile/> : <CustomerHomeDesktop/>;
    else if (screen.name === 'cook') inner = <CookProfile cookId={screen.cookId} isMobile={isMobile}/>;
    else if (screen.name === 'checkout') inner = <CheckoutScreen onPlace={placeOrder} isMobile={isMobile}/>;
    else if (screen.name === 'tracking') inner = <TrackingScreen order={placedOrder} isMobile={isMobile}/>;
    else if (screen.name === 'profile' && typeof CustomerProfileScreen !== 'undefined') inner = <CustomerProfileScreen isMobile={isMobile}/>;
    else inner = isMobile ? <CustomerHomeMobile/> : <CustomerHomeDesktop/>;

    const overlays = (
      <React.Fragment>
        {dishModal && <DishModal dishId={dishModal.dishId} cookId={dishModal.cookId} isMobile={isMobile} onClose={()=>setDishModal(null)}/>}
        {cartOpen  && <CartSheet onClose={()=>setCartOpen(false)} onCheckout={()=>{ setCartOpen(false); go({ name: 'checkout' }); }} isMobile={isMobile}/>}
        {showAuth  && <AuthModal role={authRole} onSuccess={handleAuthSuccess} onClose={()=>setShowAuth(false)}/>}
      </React.Fragment>
    );

    // Persistent home-link breadcrumb for screens past home
    const persistent = (
      <React.Fragment>
        {(screen.name !== 'home') && cartCount > 0 && screen.name !== 'checkout' && screen.name !== 'tracking' && (
          <button onClick={openCart} style={{
            position:'fixed', bottom: 24, left:'50%', transform:'translateX(-50%)', zIndex: 10,
            background:'var(--yum-ink)', color:'var(--yum-cream)', border:'none', cursor:'pointer',
            padding:'14px 22px', borderRadius:'var(--r-pill)',
            display:'inline-flex', alignItems:'center', gap: 12,
            boxShadow:'0 16px 30px rgba(20,16,10,0.25)', fontSize: 14, fontWeight: 600,
          }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background:'var(--yum-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, fontWeight: 700 }} className="num">{cartCount}</span>
            <span>View cart · <span className="num">₹{cartTotal}</span></span>
            <span>{Ic.chevR({s:14})}</span>
          </button>
        )}
      </React.Fragment>
    );

    const wrapped = (
      <div onClick={onContainerClick} style={{ width:'100%', height:'100%', position:'relative' }}>
        {inner}
        {persistent}
        {overlays}
      </div>
    );

    content = isMobile ? <PhoneFrame>{wrapped}</PhoneFrame> : wrapped;
  }

  return (
    <NavCtx.Provider value={navValue}>
      <ThemeStyle t={t}/>
      <div style={{ width:'100%', height:'100%' }}>
        {content}
      </div>
      <TweaksPanel title="Tweaks">
        <TweakSection label="View"/>
        <TweakRadio  label="Mode"      value={t.view}    options={[{value:'prototype',label:'Prototype'},{value:'designSystem',label:'Design system'}]} onChange={v=>setTweak('view', v)}/>
        {t.view === 'prototype' && (
          <React.Fragment>
            <TweakRadio  label="Persona"   value={t.persona} options={[{value:'customer',label:'Customer'},{value:'cook',label:'Cook'}]} onChange={v=>setTweak('persona', v)}/>
            <TweakRadio  label="Device"    value={t.device}  options={[{value:'desktop',label:'Desktop'},{value:'mobile',label:'Mobile'}]} onChange={v=>setTweak('device', v)}/>
            <TweakButton label="Reset to home" onClick={()=>reset({ name: 'home' })}/>
          </React.Fragment>
        )}

        <TweakSection label="Theme"/>
        <TweakColor label="Primary" value={t.primary}
          options={['#4a6b3a','#b0522e','#c19829','#3a5e7a','#7a4e63']}
          onChange={v=>setTweak('primary', v)}/>
        <TweakColor label="Accent" value={t.accent}
          options={['#c19829','#b94432','#3a5e7a','#7a4e63','#4a6b3a']}
          onChange={v=>setTweak('accent', v)}/>

        <TweakSection label="Typography"/>
        <TweakSelect label="Display font" value={t.displayFont}
          options={['Fraunces','Playfair Display','DM Serif Display','Cormorant Garamond','Instrument Serif']}
          onChange={v=>{ setTweak('displayFont', v); ensureGoogleFont(v); }}/>
        <TweakSelect label="UI font" value={t.uiFont}
          options={['Inter','DM Sans','Manrope','IBM Plex Sans','Geist']}
          onChange={v=>{ setTweak('uiFont', v); ensureGoogleFont(v); }}/>

        <TweakSection label="Shape & feel"/>
        <TweakSlider label="Corner radius" value={t.cornerRadius} min={4} max={28} step={1} unit="px" onChange={v=>setTweak('cornerRadius', v)}/>
        <TweakRadio  label="Density" value={t.density} options={['comfortable','compact']} onChange={v=>setTweak('density', v)}/>

        <TweakSection label="Feature flags"/>
        <TweakToggle label="AI 'cook at home' module" value={t.showAi} onChange={v=>setTweak('showAi', v)}/>
        <TweakToggle label="Reorder / new badges" value={t.showReorderBadges} onChange={v=>setTweak('showReorderBadges', v)}/>
      </TweaksPanel>

      {/* Conditional UI hides based on tweaks */}
      <style>{`
        ${!t.showAi ? `[data-yum-feature="ai"] { display: none !important; }` : ''}
        ${!t.showReorderBadges ? `[data-yum-badge-tone="reorder"], [data-yum-badge-tone="new"] { display: none !important; }` : ''}
      `}</style>
    </NavCtx.Provider>
  );
}

// Helper to load Google Fonts on the fly
const _loadedFonts = new Set();
function ensureGoogleFont(name) {
  if (_loadedFonts.has(name)) return;
  _loadedFonts.add(name);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  const family = name.replace(/ /g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

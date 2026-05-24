import React from 'react';
import { io } from 'socket.io-client';
import { NavCtx } from './lib/NavCtx';
import { loadAuth, clearAuth } from './lib/auth';
import { YUM_INDEX, yumFindCookByName, yumFindDish } from './data/cooks';
import { Ic } from './components/ui';
import { CustomerHomeDesktop, CustomerHomeMobile } from './screens/CustomerHome';
import { CookProfile, DishModal, CartSheet, CheckoutScreen, TrackingScreen } from './screens/OrderFlow';
import { CustomerProfileScreen } from './screens/CustomerProfile';
import { AuthModal } from './screens/Auth';

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 768);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export function App() {
  const isMobile = useIsMobile();

  // Routing
  const [stack, setStack] = React.useState([{ name: 'home' }]);
  const screen = stack[stack.length - 1];
  const go    = React.useCallback((s) => setStack(prev => [...prev, s]), []);
  const back  = React.useCallback(() => setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev), []);
  const reset = React.useCallback((s = { name: 'home' }) => setStack([s]), []);

  // Auth
  const [authUser, setAuthUser] = React.useState(() => loadAuth());
  const [showAuth, setShowAuth] = React.useState(false);
  const [authRole, setAuthRole] = React.useState('customer');
  const openAuth = React.useCallback((role = 'customer') => { setAuthRole(role); setShowAuth(true); }, []);
  const logout   = React.useCallback(() => { clearAuth(); setAuthUser(null); reset({ name: 'home' }); }, [reset]);
  const handleAuthSuccess = React.useCallback((data) => { setAuthUser(data); setShowAuth(false); }, []);

  // Cart
  const [cart, setCart] = React.useState([]);
  const cartCount = cart.reduce((n, it) => n + it.qty, 0);
  const cartTotal = cart.reduce((n, it) => {
    const cook = YUM_INDEX.byId[it.cookId];
    const d = cook?.dishes.find(x => x.id === it.dishId);
    return n + (d ? d.price * it.qty : 0);
  }, 0);

  const addToCart  = (dishId, cookId) => setCart(prev => {
    const i = prev.findIndex(x => x.dishId === dishId);
    if (i >= 0) return prev.map((x, idx) => idx === i ? { ...x, qty: x.qty + 1 } : x);
    return [...prev, { dishId, cookId, qty: 1 }];
  });
  const incCart    = (dishId) => setCart(prev => prev.map(x => x.dishId === dishId ? { ...x, qty: x.qty + 1 } : x));
  const decCart    = (dishId) => setCart(prev => prev.flatMap(x => x.dishId === dishId ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x]));
  const removeCart = (dishId) => setCart(prev => prev.filter(x => x.dishId !== dishId));
  const getQty     = (dishId) => cart.find(x => x.dishId === dishId)?.qty || 0;

  // Modal / sheet state
  const [dishModal, setDishModal] = React.useState(null);
  const [cartOpen, setCartOpen]   = React.useState(false);
  const openDish = (dishId, cookId) => setDishModal({ dishId, cookId });
  const openCart = () => setCartOpen(true);

  const socketRef    = React.useRef(null);
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
      const res = await fetch('/api/orders', {
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

      if (!socketRef.current) socketRef.current = io();
      socketRef.current.emit('join_order', data.id);
      socketRef.current.off('order_update');
      socketRef.current.on('order_update', (updated) => {
        setPlacedOrder(prev => prev && prev.id === updated.id ? { ...prev, status: updated.status } : prev);
      });

      reset({ name: 'tracking' });
    } catch (err) {
      console.error('[yummara] placeOrder error:', err);
      alert('Could not place order: ' + err.message + '\n\nMake sure the backend is running:\n  cd backend && node server.js');
    }
  };

  // Delegated data-attr click handling (cook cards, dish cards without explicit onClick)
  const onContainerClick = (e) => {
    const ce = e.target.closest?.('[data-yum-cook-name]');
    const de = e.target.closest?.('[data-yum-dish-name]');
    if (de) {
      const dishName = de.getAttribute('data-yum-dish-name');
      const cookField = de.getAttribute('data-yum-dish-cook') || '';
      const cookGuess = cookField.split('·')[0].trim();
      const dish = yumFindDish(dishName);
      const cook = yumFindCookByName(cookGuess);
      if (dish) { e.stopPropagation(); openDish(dish.id, dish.cookId); return; }
      if (cook) { e.stopPropagation(); go({ name: 'cook', cookId: cook.id }); return; }
    } else if (ce) {
      const cook = yumFindCookByName(ce.getAttribute('data-yum-cook-name'));
      if (cook) { e.stopPropagation(); go({ name: 'cook', cookId: cook.id }); }
    }
  };

  const navValue = {
    go, back, reset,
    openDish, openCart,
    addToCart, incCart, decCart, removeCart, getQty,
    cart, cartCount, cartTotal,
    authUser, openAuth, logout,
  };

  let inner;
  if (screen.name === 'home')         inner = isMobile ? <CustomerHomeMobile/> : <CustomerHomeDesktop/>;
  else if (screen.name === 'cook')    inner = <CookProfile cookId={screen.cookId} isMobile={isMobile}/>;
  else if (screen.name === 'checkout') inner = <CheckoutScreen onPlace={placeOrder} isMobile={isMobile}/>;
  else if (screen.name === 'tracking') inner = <TrackingScreen order={placedOrder} isMobile={isMobile}/>;
  else if (screen.name === 'profile') inner = <CustomerProfileScreen isMobile={isMobile}/>;
  else                                inner = isMobile ? <CustomerHomeMobile/> : <CustomerHomeDesktop/>;

  return (
    <NavCtx.Provider value={navValue}>
      <div onClick={onContainerClick} style={{ width: '100%', height: '100%', position: 'relative' }}>
        {inner}

        {/* Floating cart button on non-home screens */}
        {screen.name !== 'home' && cartCount > 0 && screen.name !== 'checkout' && screen.name !== 'tracking' && (
          <button onClick={openCart} style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
            background: 'var(--yum-ink)', color: 'var(--yum-cream)', border: 'none', cursor: 'pointer',
            padding: '14px 22px', borderRadius: 'var(--r-pill)',
            display: 'inline-flex', alignItems: 'center', gap: 12,
            boxShadow: '0 16px 30px rgba(20,16,10,0.25)', fontSize: 14, fontWeight: 600,
          }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--yum-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }} className="num">{cartCount}</span>
            <span>View cart · <span className="num">₹{cartTotal}</span></span>
            <span>{Ic.chevR({ s: 14 })}</span>
          </button>
        )}

        {/* Overlays */}
        {dishModal && <DishModal dishId={dishModal.dishId} cookId={dishModal.cookId} isMobile={isMobile} onClose={() => setDishModal(null)}/>}
        {cartOpen   && <CartSheet onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); go({ name: 'checkout' }); }} isMobile={isMobile}/>}
        {showAuth   && <AuthModal role={authRole} onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)}/>}
      </div>
    </NavCtx.Provider>
  );
}

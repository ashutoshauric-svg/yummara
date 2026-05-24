// Yummara — Customer homepage (desktop + mobile)

function YumLogo({ tone='ink', size=22 }) {
  const color = tone === 'cream' ? 'var(--yum-cream)' : 'var(--yum-ink)';
  return (
    <div style={{ display:'inline-flex', alignItems: 'baseline', gap: 4, color }}>
      <span style={{ fontFamily:'var(--font-display)', fontSize: size, fontWeight: 600, letterSpacing: '-0.02em' }}>yummara</span>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--yum-primary)', display:'inline-block', transform:'translateY(-2px)' }}/>
    </div>
  );
}

function CustomerNav({ compact, area='HSR Layout' }) {
  const { cartCount, cartTotal, openCart, authUser, openAuth, go } = React.useContext(NavCtx);
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: compact ? '12px 20px' : '20px 56px',
      borderBottom: '1px solid var(--yum-border-soft)',
      background: 'rgba(251,247,240,0.85)', backdropFilter: 'blur(8px)',
      position:'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: compact ? 14 : 36 }}>
        <YumLogo size={compact ? 19 : 22}/>
        {!compact && <nav style={{ display:'flex', gap: 22, fontSize: 14, color:'var(--yum-ink-2)' }}>
          <a style={{ color:'var(--yum-ink)', fontWeight: 600 }}>Discover</a>
          <a>Cooks</a>
          <a>Tiffin plans</a>
          <a>Cook at home <sup style={{ fontSize:9, color:'var(--yum-primary)', fontWeight:600, marginLeft:2, verticalAlign:'super' }}>AI</sup></a>
        </nav>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap: compact ? 8 : 12 }}>
        {!compact && (
          <button style={{
            display:'inline-flex', alignItems:'center', gap: 8, padding:'8px 12px',
            background:'var(--yum-paper)', border:'1px solid var(--yum-border)', borderRadius:'var(--r-md)',
            fontSize: 13, color: 'var(--yum-ink-2)',
          }}>
            <span style={{ color:'var(--yum-primary)' }}>{Ic.pin({s:14})}</span>
            <span><span style={{ fontWeight:600, color:'var(--yum-ink)' }}>{area}</span> · Sector 2</span>
            {Ic.chevron({s:12})}
          </button>
        )}
        {compact && (
          <button style={{ width:36, height:36, borderRadius: 999, border:'1px solid var(--yum-border)', background:'var(--yum-paper)', display:'flex',alignItems:'center',justifyContent:'center', color:'var(--yum-primary)' }}>{Ic.pin({s:16})}</button>
        )}
        {authUser ? (
          <button onClick={() => go({ name: 'profile' })} style={{
            display:'inline-flex', alignItems:'center', gap: 8, padding:'0 14px', height: 38,
            background:'var(--yum-paper)', color:'var(--yum-ink)', borderRadius: 'var(--r-pill)', border:'1px solid var(--yum-border)',
            fontSize: 13, fontWeight: 600, cursor:'pointer',
          }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background:'var(--yum-primary-100)', color:'var(--yum-primary-700)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 11, fontWeight: 700 }}>
              {(authUser.user?.name || authUser.user?.phone || '?')[0].toUpperCase()}
            </span>
            {!compact && <span>{authUser.user?.name || 'Account'}</span>}
          </button>
        ) : (
          <button onClick={() => openAuth('customer')} style={{
            display:'inline-flex', alignItems:'center', gap: 6, padding:'0 14px', height: 38,
            background:'var(--yum-paper)', color:'var(--yum-ink)', borderRadius: 'var(--r-pill)', border:'1px solid var(--yum-border)',
            fontSize: 13, fontWeight: 600, cursor:'pointer',
          }}>
            Sign in
          </button>
        )}
        {cartCount > 0 ? (
          <button onClick={openCart} style={{
            display:'inline-flex', alignItems:'center', gap: 8, padding:'0 14px', height: 38,
            background:'var(--yum-ink)', color:'var(--yum-cream)', borderRadius: 'var(--r-pill)', border:'none',
            fontSize: 13, fontWeight: 600, cursor:'pointer',
          }}>
            <span style={{ display:'inline-flex' }}>{Ic.cart({s:14})}</span>
            <span><span className="num">{cartCount}</span> · <span className="num">₹{cartTotal}</span></span>
          </button>
        ) : (
          <button onClick={openCart} style={{ width:36, height:36, borderRadius: 999, border:'1px solid var(--yum-border)', background:'var(--yum-paper)', display:'flex',alignItems:'center',justifyContent:'center', color:'var(--yum-ink-2)', cursor:'pointer' }}>{Ic.bell({s:16})}</button>
        )}
      </div>
    </div>
  );
}

function SectionHead({ kicker, title, action='See all', count, dark }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 18, color: dark ? 'var(--yum-cream)' : undefined }}>
      <div>
        {kicker && <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color: dark ? 'rgba(251,247,240,0.55)' : 'var(--yum-ink-3)', letterSpacing: 0.1, textTransform:'uppercase' }}>{kicker}</div>}
        <h3 style={{ fontFamily:'var(--font-display)', fontSize: 30, marginTop: 4, fontWeight: 500, letterSpacing:'-0.015em', color: dark ? 'var(--yum-cream)' : 'var(--yum-ink)' }}>{title}</h3>
      </div>
      {action && (
        <a style={{ fontSize: 13, color: dark ? 'rgba(251,247,240,0.8)' : 'var(--yum-ink-2)', fontWeight: 500, display:'inline-flex', alignItems:'center', gap: 4, borderBottom: '1px solid currentColor', paddingBottom: 2 }}>
          {action}{count && <span className="num" style={{ opacity: 0.6, marginLeft: 4 }}>{count}</span>}
        </a>
      )}
    </div>
  );
}

function CustomerHomeDesktop() {
  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background:'var(--yum-cream)' }}>
      <CustomerNav/>

      {/* Hero */}
      <section style={{ padding: '56px 56px 30px', position: 'relative' }}>
        <div style={{ maxWidth: 760 }}>
          <div style={{ fontSize: 12, color:'var(--yum-ink-3)', letterSpacing: 0.12, textTransform:'uppercase', fontFamily:'var(--font-mono)' }}>{Ic.spark({s:11})} <span style={{ marginLeft: 4 }}>23 home cooks online in HSR right now</span></div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize: 64, lineHeight: 1.02, letterSpacing: '-0.02em', marginTop: 16, marginBottom: 14, fontWeight: 500 }}>
            Ghar ka khana,<br/>by the people who cook it.
          </h1>
          <p style={{ fontSize: 18, color:'var(--yum-ink-2)', lineHeight: 1.5, maxWidth: 580, margin: 0 }}>
            Verified home cooks in HSR, Indiranagar, Koramangala &amp; Whitefield. Today's menu refreshes by 6 am — order ahead or grab what's hot now.
          </p>

          <div style={{ display:'flex', gap: 10, marginTop: 28, alignItems:'center' }}>
            <div style={{ flex: 1, display:'flex', alignItems:'center', gap: 10, height: 56, background:'var(--yum-paper)', border:'1px solid var(--yum-border)', borderRadius: 'var(--r-pill)', padding:'0 20px', boxShadow:'var(--shadow-sm)' }}>
              <span style={{ color:'var(--yum-ink-3)' }}>{Ic.search({s:18})}</span>
              <input placeholder="Search for 'curd rice', 'biryani', 'a cook named Padma'…" style={{ flex: 1, border:'none', outline:'none', background:'transparent', fontSize: 15, color:'var(--yum-ink)' }}/>
              <span style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--yum-ink-3)', border:'1px solid var(--yum-border)', borderRadius: 6, padding:'2px 6px' }}>⌘ K</span>
            </div>
            <YButton size="lg" variant="primary">Find dinner</YButton>
          </div>

          <div style={{ display:'flex', gap: 8, marginTop: 18, flexWrap:'wrap' }}>
            <span style={{ fontSize: 12, color:'var(--yum-ink-3)', alignSelf:'center', marginRight: 4 }}>People near you searched —</span>
            {['Curd rice', 'Bisi bele bath', 'Pavakkai poriyal', 'Tamilian thali', 'Bengali fish jhol', 'Avalakki'].map(t => (
              <button key={t} style={{ height: 28, padding: '0 12px', borderRadius: 999, background:'transparent', border:'1px solid var(--yum-border)', fontSize: 12, color:'var(--yum-ink-2)' }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Hero collage */}
        <div style={{ position: 'absolute', right: 56, top: 56, width: 380, height: 280, display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap: 10 }}>
          <YImg tone="warm" label="Padma's tiffin" style={{ borderRadius:'var(--r-lg)', gridRow:'1 / 3'}}/>
          <YImg tone="clay" label="Garhwali thali" style={{ borderRadius:'var(--r-lg)' }}/>
          <YImg tone="green" label="Avalakki upma" style={{ borderRadius:'var(--r-lg)' }}/>
        </div>
      </section>

      {/* Filter chips */}
      <div style={{ padding:'18px 56px', display:'flex', gap: 8, flexWrap:'wrap', borderTop:'1px solid var(--yum-border-soft)', borderBottom:'1px solid var(--yum-border-soft)', background:'rgba(251,247,240,0.7)', position:'sticky', top: 78, zIndex: 4, backdropFilter:'blur(6px)' }}>
        <YChip icon={Ic.filter({s:13})} trailing={Ic.chevron({s:12})}>Filters</YChip>
        <YChip icon={<Veg size="sm"/>}>Veg only</YChip>
        <YChip icon={<NonVeg size="sm"/>}>Non-veg</YChip>
        <YChip>Under ₹200</YChip>
        <YChip>Under 30 min</YChip>
        <YChip>4★ &amp; up</YChip>
        <YChip active>Open now</YChip>
        <YChip>South Indian</YChip>
        <YChip>North Indian</YChip>
        <YChip>Bengali</YChip>
        <YChip>Tiffin plans</YChip>
      </div>

      {/* Cooks near you */}
      <section style={{ padding: '44px 56px' }}>
        <SectionHead kicker="01 · Within 2km of HSR Sector 2" title="Cooks near you" count="23"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 18 }}>
          <CookCard name="Padma Sundaram"   area="Indiranagar · 1.2 km" tags="South Indian · Tiffin" rating={4.9} count={312} dishCount={18} tone="warm"/>
          <CookCard name="Rukmini D'Souza" area="Koramangala · 0.8 km" tags="Mangalorean · Coastal" rating={4.7} count={178} dishCount={11} tone="green" prepTime="35–45 min"/>
          <CookCard name="Aarti Bisht"     area="HSR Sector 2 · 1.6 km" tags="Pahadi · Garhwali" rating={4.8} count={92} dishCount={7} tone="clay" online={false}/>
          <CookCard name="Lakshmi Iyer"     area="HSR Sector 6 · 1.0 km" tags="Tam Brahm · Iyer" rating={4.9} count={401} dishCount={14} tone="warm" prepTime="20–30 min"/>
        </div>
      </section>

      {/* Highly reordered */}
      <section style={{ padding: '12px 56px 44px' }}>
        <SectionHead kicker="02 · 3+ orders by people in your building" title="Highly reordered this month" count="47"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 18 }}>
          <DishCard name="Bisi Bele Bath" cook="Padma · Indiranagar" price={145} subtitle="With aloo bonda + curd" tone="warm" tag={<YBadge tone="reorder" icon={Ic.flame({s:11})}>4× in your building</YBadge>}/>
          <DishCard name="Neer Dosa Combo" cook="Rukmini · Koramangala" price={220} subtitle="3 dosas + chicken sukka" veg={false} tone="clay" tag={<YBadge tone="reorder" icon={Ic.flame({s:11})}>Reordered</YBadge>}/>
          <DishCard name="Curd Rice + Pickle" cook="Lakshmi · HSR" price={95} subtitle="Pongal-style, with kothavarangai" tone="warm" />
          <DishCard name="Methi Thepla Box" cook="Bhumi · Koramangala" price={165} subtitle="6 theplas, dahi, mango chunda" tone="green" tag={<YBadge tone="reorder" icon={Ic.flame({s:11})}>Reordered</YBadge>}/>
        </div>
      </section>

      {/* AI Cook at home — reserved module */}
      <section data-yum-feature="ai" style={{ padding: '12px 56px 44px' }}>
        <div style={{
          background: 'var(--yum-ink)', color:'var(--yum-cream)',
          borderRadius: 'var(--r-xl)', padding: '40px 44px', display:'flex', alignItems:'center', justifyContent:'space-between', gap: 40, overflow: 'hidden', position:'relative',
        }}>
          <div style={{ flex: 1, maxWidth: 540 }}>
            <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', letterSpacing: 0.12, textTransform:'uppercase', color:'rgba(251,247,240,0.55)' }}>{Ic.spark({s:11})} <span style={{ marginLeft: 4 }}>Beta · invite only</span></div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize: 36, lineHeight: 1.1, fontWeight: 500, marginTop: 14, marginBottom: 10, color:'var(--yum-cream)', letterSpacing: '-0.015em' }}>
              Snap your fridge. Get a recipe from a cook in your pincode.
            </h3>
            <p style={{ color:'rgba(251,247,240,0.7)', fontSize: 15, lineHeight: 1.55, marginTop: 0, marginBottom: 22 }}>
              Yummara AI matches what you have today with a cook's go-to recipe — message Padma directly for tips, or order from her if you'd rather she cooked it.
            </p>
            <div style={{ display:'flex', gap: 10 }}>
              <YButton variant="primary" size="md">Try the beta</YButton>
              <YButton size="md" style={{ background:'transparent', color:'var(--yum-cream)', border:'1px solid rgba(251,247,240,0.3)' }}>How it works</YButton>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, width: 340, flexShrink: 0 }}>
            <YImg tone="ink" label="Your fridge · 11 items" style={{ borderRadius:'var(--r-lg)', height: 130 }}/>
            <div style={{ background: 'rgba(251,247,240,0.06)', border:'1px solid rgba(251,247,240,0.12)', borderRadius:'var(--r-lg)', padding: 14, color:'var(--yum-cream)', fontSize: 13, lineHeight: 1.5 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'rgba(251,247,240,0.55)', textTransform:'uppercase', letterSpacing: 0.08, marginBottom: 6 }}>Padma suggests</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Vendakkai puli kuzhambu</div>
              <div style={{ color:'rgba(251,247,240,0.65)', fontSize: 12, marginTop: 6 }}>Uses 7 of 11 — needs only tamarind &amp; mustard.</div>
            </div>
            <div style={{ gridColumn:'1 / -1', display:'flex', alignItems:'center', gap: 8, background:'rgba(251,247,240,0.06)', border:'1px solid rgba(251,247,240,0.12)', borderRadius:'var(--r-md)', padding: '10px 12px' }}>
              <span style={{ color:'rgba(251,247,240,0.55)' }}>{Ic.spark({s:14})}</span>
              <input placeholder="…or describe what you've got" style={{ flex: 1, background:'transparent', border:'none', outline:'none', color:'var(--yum-cream)', fontSize: 13 }}/>
            </div>
          </div>
        </div>
      </section>

      {/* Under ₹200 */}
      <section style={{ padding: '12px 56px 44px' }}>
        <SectionHead kicker="03 · Quick comfort, big value" title="Under ₹200"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 18 }}>
          <DishCard name="Pongal + Vada" cook="Lakshmi · HSR" price={120} subtitle="2 vadas, sambhar, coconut chutney" tone="warm"/>
          <DishCard name="Egg Curry + 4 Roti" cook="Bhumi · Koramangala" price={180} subtitle="Bengali jhol style" veg={false} tone="clay"/>
          <DishCard name="Avalakki Upma" cook="Padma · Indiranagar" price={95} subtitle="With grated coconut + curry leaves" tone="green"/>
          <DishCard name="Rajma Chawal Box" cook="Aarti · HSR" price={160} subtitle="Kashmiri rajma, jeera rice, ghee" tone="warm"/>
        </div>
      </section>

      {/* New this week */}
      <section style={{ padding: '12px 56px 80px' }}>
        <SectionHead kicker="04 · Cooks who joined this week" title="New on Yummara"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 18 }}>
          <CookCard name="Bhumi Patel"      area="Koramangala 5th · 1.3 km" tags="Gujarati · Sattvik" rating={5.0} count={4} dishCount={9} tone="green" prepTime="30–40 min"/>
          <CookCard name="Krishnan Pillai"  area="Whitefield · 4.1 km" tags="Kerala · Sadhya" rating={5.0} count={2} dishCount={6} tone="warm" prepTime="45–60 min"/>
          <CookCard name="Sushma Kulkarni"  area="HSR Sector 7 · 1.7 km" tags="Maharashtrian · Brahmin" rating={4.9} count={11} dishCount={8} tone="clay"/>
          <CookCard name="Tara Hazarika"    area="Indiranagar · 1.8 km" tags="Assamese" rating={5.0} count={3} dishCount={5} tone="warm" prepTime="40–50 min"/>
        </div>
      </section>

      {/* footer */}
      <footer style={{ padding: '36px 56px 48px', borderTop: '1px solid var(--yum-border-soft)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 40 }}>
        <div>
          <YumLogo/>
          <p style={{ fontSize: 13, color:'var(--yum-ink-3)', maxWidth: 320, marginTop: 12, lineHeight: 1.55 }}>Bengaluru's home-cook marketplace. Every kitchen FSSAI-verified, every order tracked, every cook tipped directly.</p>
        </div>
        <div style={{ display:'flex', gap: 48 }}>
          {[
            ['For diners', ['Browse cooks','Tiffin plans','Cook at home AI','Rewards']],
            ['For cooks', ['Become a cook','Cook handbook','FSSAI help','Earnings calc']],
            ['Company', ['About','Press','Trust & safety','Contact']],
          ].map(([h, items])=>(
            <div key={h}>
              <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', textTransform:'uppercase', letterSpacing: 0.1, marginBottom: 12 }}>{h}</div>
              {items.map(i=><div key={i} style={{ fontSize: 13, color:'var(--yum-ink-2)', marginBottom: 8 }}>{i}</div>)}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ─── Mobile ───────────────────────────────────────────────────────
function CustomerHomeMobile() {
  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background:'var(--yum-cream)' }}>
      {/* Top bar */}
      <div style={{ padding: '14px 18px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button style={{ display:'flex', alignItems:'flex-start', gap: 6, background:'transparent', border:'none', textAlign:'left', padding: 0 }}>
          <span style={{ color:'var(--yum-primary)', marginTop: 2 }}>{Ic.pin({s:16})}</span>
          <span>
            <div style={{ fontSize: 11, color:'var(--yum-ink-3)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing: 0.08 }}>Deliver to</div>
            <div style={{ fontSize: 15, fontWeight: 600, display:'inline-flex', alignItems:'center', gap: 4 }}>HSR Sector 2 {Ic.chevron({s:13})}</div>
          </span>
        </button>
        <div style={{ display:'flex', gap: 8 }}>
          <button style={{ width: 36, height: 36, borderRadius: 999, border:'1px solid var(--yum-border)', background:'var(--yum-paper)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--yum-ink-2)' }}>{Ic.bell({s:16})}</button>
          <button style={{ width: 36, height: 36, borderRadius: 999, background:'var(--yum-ink)', color:'var(--yum-cream)', display:'flex', alignItems:'center', justifyContent:'center', border:'none' }}>{Ic.user({s:16})}</button>
        </div>
      </div>

      {/* Hero */}
      <section style={{ padding: '8px 18px 16px' }}>
        <div style={{ fontSize: 10, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing: 0.1, textTransform:'uppercase', display:'inline-flex',alignItems:'center',gap:4 }}>
          {Ic.spark({s:10})} 23 cooks online near you
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.015em', fontWeight: 500, marginTop: 10, marginBottom: 14 }}>
          Ghar ka khana, from your neighbour's kitchen.
        </h1>
        <div style={{ display:'flex', alignItems:'center', gap: 8, height: 48, background:'var(--yum-paper)', border:'1px solid var(--yum-border)', borderRadius:'var(--r-pill)', padding:'0 16px' }}>
          <span style={{ color:'var(--yum-ink-3)' }}>{Ic.search({s:16})}</span>
          <input placeholder="Curd rice, biryani, a cook…" style={{ flex: 1, border:'none', outline:'none', background:'transparent', fontSize: 14 }}/>
        </div>
      </section>

      {/* Filter chips horizontal */}
      <div className="yum-scroll" style={{ display:'flex', gap: 8, padding:'8px 18px 12px', overflowX:'auto' }}>
        <YChip size="sm" icon={Ic.filter({s:12})}>Filters</YChip>
        <YChip size="sm" icon={<Veg size="sm"/>}>Veg</YChip>
        <YChip size="sm" icon={<NonVeg size="sm"/>}>Non-veg</YChip>
        <YChip size="sm" active>Under ₹200</YChip>
        <YChip size="sm">Under 30 min</YChip>
        <YChip size="sm">4★ &amp; up</YChip>
        <YChip size="sm">South Indian</YChip>
      </div>

      {/* Cooks near you */}
      <section style={{ padding: '16px 18px 4px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>Cooks near you</h3>
          <a style={{ fontSize: 12, color:'var(--yum-ink-2)', fontWeight: 500 }}>See all <span className="num" style={{opacity:0.5}}>23</span></a>
        </div>
        <div className="yum-scroll" style={{ display:'flex', gap: 12, overflowX:'auto', paddingRight: 18, marginRight: -18 }}>
          {[
            ['Padma Sundaram','Indiranagar · 1.2 km','South Indian',4.9,312,'warm', true],
            ['Rukmini D\'Souza','Koramangala','Mangalorean',4.7,178,'green', true],
            ['Aarti Bisht','HSR · 1.6 km','Pahadi',4.8,92,'clay', false],
            ['Lakshmi Iyer','HSR Sector 6','Tam Brahm',4.9,401,'warm', true],
          ].map(([n,a,t,r,c,tone,online])=>(
            <div key={n} style={{ width: 240, flexShrink: 0 }}>
              <CookCard name={n} area={a} tags={t} rating={r} count={c} tone={tone} online={online}/>
            </div>
          ))}
        </div>
      </section>

      {/* Highly reordered */}
      <section style={{ padding: '18px 18px 4px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 10, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing: 0.08, textTransform:'uppercase' }}>3+ orders in your building</div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', marginTop: 2 }}>Highly reordered</h3>
          </div>
        </div>
        <div className="yum-scroll" style={{ display:'flex', gap: 12, overflowX:'auto', paddingRight: 18, marginRight: -18 }}>
          {[
            ['Bisi Bele Bath','Padma · Indiranagar',145,'warm',true],
            ['Neer Dosa Combo','Rukmini · Koramangala',220,'clay',false],
            ['Curd Rice + Pickle','Lakshmi · HSR',95,'warm',true],
          ].map(([n,c,p,tone,v])=>(
            <div key={n} style={{ width: 200, flexShrink: 0 }}>
              <DishCard name={n} cook={c} price={p} tone={tone} veg={v}/>
            </div>
          ))}
        </div>
      </section>

      {/* AI cook at home banner */}
      <section data-yum-feature="ai" style={{ padding: '20px 18px 4px' }}>
        <div style={{ background: 'var(--yum-ink)', color:'var(--yum-cream)', borderRadius:'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 10, fontFamily:'var(--font-mono)', color:'rgba(251,247,240,0.55)', letterSpacing: 0.1, textTransform:'uppercase' }}>{Ic.spark({s:10})} <span style={{ marginLeft: 4 }}>Beta</span></div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize: 24, lineHeight: 1.1, fontWeight: 500, marginTop: 8, marginBottom: 8 }}>Cook at home with what you have</h3>
          <p style={{ fontSize: 13, color:'rgba(251,247,240,0.7)', marginTop: 0, marginBottom: 14, lineHeight: 1.5 }}>Snap your fridge — get a recipe from a Yummara cook nearby.</p>
          <YButton size="sm" variant="primary">Try the beta</YButton>
        </div>
      </section>

      {/* Under ₹200 */}
      <section style={{ padding: '20px 18px 4px' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 10 }}>Under ₹200</h3>
        <div className="yum-scroll" style={{ display:'flex', gap: 12, overflowX:'auto', paddingRight: 18, marginRight: -18 }}>
          {[
            ['Pongal + Vada','Lakshmi · HSR',120,'warm',true],
            ['Egg Curry + 4 Roti','Bhumi · Koramangala',180,'clay',false],
            ['Avalakki Upma','Padma · Indiranagar',95,'green',true],
            ['Rajma Chawal Box','Aarti · HSR',160,'warm',true],
          ].map(([n,c,p,tone,v])=>(
            <div key={n} style={{ width: 180, flexShrink: 0 }}>
              <DishCard name={n} cook={c} price={p} tone={tone} veg={v}/>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 92 }}/>

      {/* Sticky cart strip */}
      <div style={{ position:'sticky', bottom: 14, padding: '0 18px', display:'flex', justifyContent:'center' }}>
        <button style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'var(--yum-ink)', color:'var(--yum-cream)', border:'none',
          padding: '12px 18px', borderRadius: 'var(--r-pill)', width: '100%',
          boxShadow: '0 12px 24px rgba(40,30,15,0.18)',
        }}>
          <span style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--yum-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 11, fontWeight: 700 }} className="num">3</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>From Padma's kitchen</span>
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, display:'inline-flex', alignItems:'center', gap: 6 }}><span className="num">₹420</span> {Ic.chevR({s:14})}</span>
        </button>
      </div>

      {/* bottom nav */}
      <div style={{ display:'flex', justifyContent:'space-around', padding:'12px 18px', borderTop:'1px solid var(--yum-border-soft)', background:'rgba(251,247,240,0.95)', marginTop: 10 }}>
        {[['Discover',Ic.search({s:18}),true],['Cooks',Ic.user({s:18}),false],['Orders',Ic.bowl({s:18}),false],['Profile',Ic.heart({s:18}),false]].map(([l,ic,active])=>(
          <button key={l} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 4, background:'transparent', border:'none', color: active?'var(--yum-primary)':'var(--yum-ink-3)', fontWeight: active?600:500, fontSize: 11 }}>
            {ic}<span>{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CustomerHomeDesktop, CustomerHomeMobile, YumLogo, CustomerNav, SectionHead });

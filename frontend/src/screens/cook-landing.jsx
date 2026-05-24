// Yummara — Cook landing page (desktop + mobile)
// Warmer, encouraging tone. Real cook anchored hero, earnings calc, testimonials, FAQ.

function CookNav({ compact }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: compact ? '12px 20px' : '20px 56px',
      borderBottom: '1px solid var(--yum-border-soft)',
      background: 'rgba(251,247,240,0.92)', backdropFilter: 'blur(8px)',
      position:'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
        <YumLogo size={compact ? 19 : 22}/>
        <span style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-primary-700)', background:'var(--yum-primary-50)', borderRadius: 6, padding:'3px 7px', letterSpacing: 0.06, textTransform:'uppercase' }}>for cooks</span>
      </div>
      {!compact && (
        <nav style={{ display:'flex', gap: 24, fontSize: 14, color:'var(--yum-ink-2)' }}>
          <a>How it works</a>
          <a>Earnings</a>
          <a>Stories</a>
          <a>FSSAI help</a>
          <a>FAQ</a>
        </nav>
      )}
      <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
        {!compact && <a style={{ fontSize: 14, color:'var(--yum-ink-2)' }}>Already a cook? <span style={{ color:'var(--yum-primary)', fontWeight: 600 }}>Sign in</span></a>}
        <YButton size={compact?'sm':'md'} variant="primary">{compact ? 'Apply' : 'Become a Yummara cook'}</YButton>
      </div>
    </div>
  );
}

function CookLandingDesktop() {
  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background:'var(--yum-cream)' }}>
      <CookNav/>

      {/* Hero — real cook anchored */}
      <section style={{ padding: '64px 56px 40px', display:'grid', gridTemplateColumns: '1.05fr 1fr', gap: 56, alignItems:'center' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', letterSpacing: 0.14, textTransform:'uppercase', color:'var(--yum-primary)', display:'inline-flex', alignItems:'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background:'var(--yum-primary)' }}/>
            1,240 home cooks in Bengaluru. Yours next?
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize: 70, lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 16, marginBottom: 18, fontWeight: 500 }}>
            Your kitchen.<br/>Your menu.<br/>Your hours.
          </h1>
          <p style={{ fontSize: 18, color:'var(--yum-ink-2)', lineHeight: 1.55, maxWidth: 520, marginTop: 0, marginBottom: 28 }}>
            Yummara turns your home cooking into a quiet, reliable income. No restaurant rent, no commission war — just orders from neighbours who already wish your food was on a menu.
          </p>
          <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
            <YButton size="lg" variant="primary" iconRight={Ic.arrow()}>Start applying — it takes 12 min</YButton>
            <a style={{ fontSize: 14, color:'var(--yum-ink-2)', textDecoration:'underline', textUnderlineOffset: 4 }}>Watch a 90-sec walkthrough</a>
          </div>
          <div style={{ display:'flex', gap: 36, marginTop: 36, paddingTop: 24, borderTop:'1px solid var(--yum-border-soft)' }}>
            {[
              ['₹28,400', 'median monthly earning · part-time cooks'],
              ['12 min', 'application · save & resume anywhere'],
              ['0% comm.', 'on your first 30 orders'],
            ].map(([n, l])=>(
              <div key={n}>
                <div className="num" style={{ fontFamily:'var(--font-display)', fontSize: 26, fontWeight: 600, color:'var(--yum-ink)' }}>{n}</div>
                <div style={{ fontSize: 12, color:'var(--yum-ink-3)', maxWidth: 160, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Cook quote portrait */}
        <div style={{ position: 'relative', borderRadius: 'var(--r-xl)', overflow:'hidden', aspectRatio:'4/5' }}>
          <YImg tone="warm" label="Padma in her Indiranagar kitchen" style={{ position:'absolute', inset:0 }}/>
          <div style={{ position:'absolute', left: 20, right: 20, bottom: 20, background: 'rgba(29,24,18,0.88)', color:'var(--yum-cream)', borderRadius:'var(--r-lg)', padding: '20px 22px', backdropFilter:'blur(8px)' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize: 22, lineHeight: 1.3, fontWeight: 500, letterSpacing: '-0.01em' }}>
              "I cook the way my paati did. Yummara just tells the right people about it."
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background:'rgba(251,247,240,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight: 600, fontSize: 14, color:'var(--yum-cream)' }}>P</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Padma Sundaram</div>
                <div style={{ fontSize: 11, color:'rgba(251,247,240,0.6)', fontFamily:'var(--font-mono)', letterSpacing: 0.04 }}>Indiranagar · Cooking since 2024 · 312 orders · 4.9 ★</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '56px 56px 40px' }}>
        <div style={{ fontSize: 12, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing: 0.16, textTransform:'uppercase' }}>How it works</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize: 44, fontWeight: 500, letterSpacing:'-0.02em', marginTop: 8, marginBottom: 32, lineHeight: 1.05 }}>Three quiet steps. We sit with you for each one.</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 20 }}>
          {[
            ['01','Apply in 12 minutes','Kitchen photos, FSSAI, sample dishes, bank. Save and resume anywhere — your phone, your son\'s laptop, doesn\'t matter.'],
            ['02','Get a hand-walked verification','A Yummara human visits your kitchen, helps with FSSAI if you don\'t have it yet, and shoots your first 5 dish photos for free.'],
            ['03','Go live on your own clock','Cook 3 dishes or 30. Open Tuesday-only, or mornings only. Pause for Diwali. Your kitchen sets the rhythm.'],
          ].map(([n, t, b])=>(
            <div key={n} style={{ background:'var(--yum-paper)', borderRadius:'var(--r-lg)', padding: 26, border:'1px solid var(--yum-border-soft)' }}>
              <div className="num" style={{ fontFamily:'var(--font-display)', fontSize: 48, color:'var(--yum-primary)', fontWeight: 500, lineHeight: 1, letterSpacing:'-0.02em' }}>{n}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing:'-0.01em', marginTop: 14, marginBottom: 10 }}>{t}</div>
              <p style={{ fontSize: 14, color:'var(--yum-ink-2)', lineHeight: 1.55, margin: 0 }}>{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Earnings calc */}
      <section style={{ padding: '40px 56px' }}>
        <div style={{ background:'var(--yum-paper)', border:'1px solid var(--yum-border-soft)', borderRadius:'var(--r-xl)', padding: 44, display:'grid', gridTemplateColumns:'1fr 1.1fr', gap: 56, alignItems:'center' }}>
          <div>
            <div style={{ fontSize: 12, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing: 0.14, textTransform:'uppercase' }}>Estimate your earnings</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize: 40, fontWeight: 500, letterSpacing:'-0.02em', marginTop: 8, marginBottom: 18, lineHeight: 1.1 }}>What could one weekday lunch service look like?</h2>

            <div style={{ marginBottom: 22 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color:'var(--yum-ink-2)' }}>Orders per day</span>
                <span className="num" style={{ fontSize: 13, fontWeight: 600 }}>14</span>
              </div>
              <YSlider value={14} min={4} max={40}/>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color:'var(--yum-ink-2)' }}>Average order value</span>
                <span className="num" style={{ fontSize: 13, fontWeight: 600 }}>₹245</span>
              </div>
              <YSlider value={245} min={120} max={500}/>
            </div>

            <div style={{ marginBottom: 4 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color:'var(--yum-ink-2)' }}>Days a week you cook</span>
                <span className="num" style={{ fontSize: 13, fontWeight: 600 }}>5</span>
              </div>
              <YSlider value={5} min={1} max={7}/>
            </div>
          </div>
          <div style={{ background:'var(--yum-ink)', color:'var(--yum-cream)', borderRadius:'var(--r-lg)', padding: 32, position: 'relative' }}>
            <div style={{ fontSize: 12, fontFamily:'var(--font-mono)', color:'rgba(251,247,240,0.6)', letterSpacing: 0.1, textTransform:'uppercase' }}>Projected monthly take-home</div>
            <div className="num" style={{ fontFamily:'var(--font-display)', fontSize: 80, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 14, marginBottom: 8, color:'var(--yum-cream)' }}>
              ₹68,600
            </div>
            <div style={{ fontSize: 13, color:'rgba(251,247,240,0.65)' }}>After 12% Yummara fee · before TDS · payouts every Tue &amp; Fri</div>
            <div style={{ marginTop: 24, borderTop:'1px solid rgba(251,247,240,0.12)', paddingTop: 18, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16 }}>
              {[['Gross', '₹78,000'],['Yummara fee', '−₹9,400'],['Net','₹68,600']].map(([l, v])=>(
                <div key={l}>
                  <div style={{ fontSize: 11, color:'rgba(251,247,240,0.5)', textTransform:'uppercase', letterSpacing: 0.06, fontFamily:'var(--font-mono)' }}>{l}</div>
                  <div className="num" style={{ fontSize: 18, fontWeight: 600, marginTop: 2, color:'var(--yum-cream)' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ position:'absolute', top: 20, right: 24, fontFamily:'var(--font-mono)', fontSize: 10, color:'rgba(251,247,240,0.45)', letterSpacing: 0.1, textTransform: 'uppercase' }}>
              live · changes as you drag
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '56px 56px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing: 0.16, textTransform:'uppercase' }}>From cooks already on Yummara</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize: 44, fontWeight: 500, letterSpacing:'-0.02em', marginTop: 8, lineHeight: 1.05 }}>Words from the kitchen.</h2>
          </div>
          <div style={{ display:'flex', gap: 6 }}>
            <button style={{ width: 40, height: 40, borderRadius: 999, border:'1px solid var(--yum-border)', background:'var(--yum-paper)', display:'flex',alignItems:'center',justifyContent:'center', transform:'rotate(180deg)' }}>{Ic.arrow()}</button>
            <button style={{ width: 40, height: 40, borderRadius: 999, border:'1px solid var(--yum-ink)', background:'var(--yum-ink)', color:'var(--yum-cream)', display:'flex',alignItems:'center',justifyContent:'center' }}>{Ic.arrow()}</button>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 18 }}>
          {[
            { name: 'Rukmini D\'Souza', area: 'Koramangala', tone:'green', kpi:'₹42k/mo', quote: "I'd been cooking for the family for 30 years. Yummara is the first place that didn't ask me to act like a restaurant — they just asked what I cook on Sundays." },
            { name: 'Aarti Bisht', area: 'HSR Layout', tone:'clay', kpi:'₹19k/mo · weekends only', quote: "Pahadi food is hard to find here. I started doing weekends only. By month two there was a Saturday waitlist." },
            { name: 'Krishnan Pillai', area: 'Whitefield', tone:'warm', kpi:'8 dishes · 412 orders', quote: "The handhold during FSSAI was the make-or-break for me. I was sure my kitchen wouldn't qualify. It did." },
          ].map(c=>(
            <div key={c.name} style={{ background:'var(--yum-paper)', borderRadius:'var(--r-lg)', border:'1px solid var(--yum-border-soft)', overflow:'hidden' }}>
              <div style={{ position:'relative', aspectRatio: '4/3' }}>
                <YImg tone={c.tone} label={`${c.name.split(' ')[0]}'s kitchen`} style={{ position:'absolute', inset:0 }}/>
                <div style={{ position:'absolute', top: 12, left: 12 }}>
                  <YBadge tone="online">{c.kpi}</YBadge>
                </div>
              </div>
              <div style={{ padding: 22 }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize: 17, lineHeight: 1.4, fontWeight: 500, letterSpacing:'-0.005em', margin: 0, color:'var(--yum-ink)' }}>"{c.quote}"</p>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop:'1px solid var(--yum-border-soft)', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color:'var(--yum-ink-3)' }}>{c.area}</div>
                  </div>
                  <a style={{ fontSize: 12, color:'var(--yum-primary)', fontWeight: 600 }}>Read her story →</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '40px 56px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'0.55fr 1fr', gap: 56 }}>
          <div>
            <div style={{ fontSize: 12, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing: 0.16, textTransform:'uppercase' }}>The honest questions</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize: 44, fontWeight: 500, letterSpacing:'-0.02em', marginTop: 8, marginBottom: 18, lineHeight: 1.05 }}>Things cooks usually want to know first.</h2>
            <p style={{ fontSize: 14, color:'var(--yum-ink-2)', lineHeight: 1.6 }}>If yours isn't here, our cook-support team is on WhatsApp 9am–9pm. We answer in Kannada, Hindi, Tamil, Malayalam &amp; English.</p>
            <YButton variant="secondary" icon={Ic.whatsapp({s:14})} style={{ marginTop: 14 }}>Chat with cook support</YButton>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap: 0 }}>
            {[
              ['I don\'t have FSSAI yet. Can I still apply?', 'Yes. 60% of our cooks didn\'t have FSSAI when they applied. We walk you through the form, pay the fee for your first year, and only go live once it\'s in your name.'],
              ['What about deliveries — do I drop them off?', 'No. Our delivery partners pick up from your doorstep within a 5-minute window you set. You hand over a packed order, they handle the rest.'],
              ['What if I want to pause for two weeks?', 'One toggle. Holiday mode hides you from discovery, customers see "back on the 18th", and no rating penalty.'],
              ['How does the platform fee work?', '12% of order value, zero on your first 30. No subscription, no listing fee, no charge per dish. Payouts hit your account every Tuesday and Friday.'],
            ].map(([q, a], i)=>(
              <details key={i} style={{ borderTop: i===0 ? '1px solid var(--yum-border)' : 'none', borderBottom: '1px solid var(--yum-border)', padding: '18px 0' }} open={i===0}>
                <summary style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', fontFamily:'var(--font-display)', fontSize: 20, fontWeight: 500, letterSpacing:'-0.005em', listStyle: 'none' }}>
                  <span>{q}</span>
                  <span style={{ color:'var(--yum-ink-3)' }}>{Ic.plus({s:16})}</span>
                </summary>
                <p style={{ fontSize: 14, color:'var(--yum-ink-2)', lineHeight: 1.6, marginTop: 12, marginBottom: 0, maxWidth: 640 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Apply CTA strip */}
      <section style={{ padding: '56px 56px 96px' }}>
        <div style={{ background: 'var(--yum-primary)', color:'var(--yum-cream)', borderRadius:'var(--r-xl)', padding: '56px 56px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right: -60, top: -60, width: 320, height: 320, borderRadius:'50%', background:'rgba(251,247,240,0.06)' }}/>
          <div style={{ position:'absolute', right: 60, bottom: -60, width: 220, height: 220, borderRadius:'50%', background:'rgba(193,152,41,0.18)' }}/>
          <div style={{ position:'relative', maxWidth: 720 }}>
            <div style={{ fontSize: 12, fontFamily:'var(--font-mono)', letterSpacing: 0.14, textTransform:'uppercase', color:'rgba(251,247,240,0.7)' }}>One last thing</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize: 56, lineHeight: 1.02, letterSpacing:'-0.025em', fontWeight: 500, marginTop: 14, marginBottom: 18, color:'var(--yum-cream)' }}>
              The dish your family eats on Sundays — someone in your pincode wants it tonight.
            </h2>
            <p style={{ fontSize: 16, color:'rgba(251,247,240,0.78)', lineHeight: 1.55, maxWidth: 540, marginTop: 0, marginBottom: 28 }}>
              Bring your kitchen as it is. We help with FSSAI, photos, packaging, the awkward bits. Twelve minutes to start the application.
            </p>
            <div style={{ display:'flex', gap: 14 }}>
              <YButton size="lg" variant="invert">Apply to cook on Yummara</YButton>
              <YButton size="lg" style={{ background:'transparent', color:'var(--yum-cream)', border:'1px solid rgba(251,247,240,0.4)' }}>Book a 1:1 walkthrough</YButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function YSlider({ value, min, max }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position:'relative', height: 36, display:'flex', alignItems:'center' }}>
      <div style={{ height: 6, borderRadius: 999, background: 'var(--yum-cream-deep)', width: '100%' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--yum-primary)', borderRadius: 999 }}/>
      </div>
      <div style={{
        position:'absolute', left: `calc(${pct}% - 12px)`, top: '50%', transform:'translateY(-50%)',
        width: 24, height: 24, borderRadius: 999, background:'var(--yum-paper)',
        border: '2px solid var(--yum-primary)', boxShadow:'0 2px 4px rgba(40,30,15,0.12)',
      }}/>
    </div>
  );
}

// ─── Mobile ───────────────────────────────────────────────────────
function CookLandingMobile() {
  return (
    <div className="yum yum-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', background:'var(--yum-cream)' }}>
      <CookNav compact/>

      <section style={{ padding: '24px 18px 12px' }}>
        <div style={{ fontSize: 10, fontFamily:'var(--font-mono)', color:'var(--yum-primary)', letterSpacing: 0.12, textTransform:'uppercase' }}>1,240 home cooks in BLR</div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize: 40, lineHeight: 1.02, letterSpacing: '-0.02em', marginTop: 10, marginBottom: 14, fontWeight: 500 }}>
          Your kitchen.<br/>Your menu.<br/>Your hours.
        </h1>
        <p style={{ fontSize: 15, color:'var(--yum-ink-2)', lineHeight: 1.55, margin: '0 0 22px' }}>
          Quiet, reliable income from your cooking. No rent, no commission war.
        </p>
        <YButton size="lg" variant="primary" full iconRight={Ic.arrow()}>Start applying</YButton>
        <div style={{ fontSize: 12, color:'var(--yum-ink-3)', textAlign:'center', marginTop: 10 }}>Takes 12 minutes · save &amp; resume anywhere</div>
      </section>

      {/* Cook portrait */}
      <section style={{ padding: '20px 18px 12px' }}>
        <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow:'hidden', aspectRatio:'4/5' }}>
          <YImg tone="warm" label="Padma in her kitchen" style={{ position:'absolute', inset:0 }}/>
          <div style={{ position:'absolute', left: 14, right: 14, bottom: 14, background:'rgba(29,24,18,0.88)', color:'var(--yum-cream)', borderRadius:'var(--r-md)', padding: 16 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize: 17, lineHeight: 1.3, fontWeight: 500 }}>
              "I cook the way my paati did. Yummara just tells the right people."
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 8, marginTop: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background:'rgba(251,247,240,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight: 600, fontSize: 12 }}>P</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>Padma Sundaram</div>
                <div style={{ fontSize: 10, color:'rgba(251,247,240,0.6)', fontFamily:'var(--font-mono)' }}>Indiranagar · 4.9 ★ · 312 orders</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12, marginTop: 18 }}>
          {[
            ['₹28.4k', 'median/mo'],
            ['12 min', 'application'],
            ['0%', 'first 30 orders'],
          ].map(([n, l])=>(
            <div key={n} style={{ padding: 14, background:'var(--yum-paper)', borderRadius:'var(--r-md)', border:'1px solid var(--yum-border-soft)' }}>
              <div className="num" style={{ fontFamily:'var(--font-display)', fontSize: 20, fontWeight: 600 }}>{n}</div>
              <div style={{ fontSize: 11, color:'var(--yum-ink-3)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '24px 18px 12px' }}>
        <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing: 0.14, textTransform:'uppercase' }}>How it works</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize: 28, fontWeight: 500, letterSpacing:'-0.015em', marginTop: 6, marginBottom: 16, lineHeight: 1.1 }}>Three quiet steps.</h2>
        {[
          ['01','Apply in 12 minutes','Photos, FSSAI, sample dishes, bank. Save and resume anywhere.'],
          ['02','Hand-walked verification','A Yummara human visits, helps with FSSAI, shoots your first 5 dishes free.'],
          ['03','Go live on your own clock','3 dishes or 30. Mornings only. Pause for Diwali. Your rhythm.'],
        ].map(([n, t, b])=>(
          <div key={n} style={{ background:'var(--yum-paper)', borderRadius:'var(--r-md)', padding: 18, border:'1px solid var(--yum-border-soft)', marginBottom: 10 }}>
            <div style={{ display:'flex', gap: 12, alignItems:'baseline' }}>
              <div className="num" style={{ fontFamily:'var(--font-display)', fontSize: 26, color:'var(--yum-primary)', fontWeight: 500, lineHeight: 1 }}>{n}</div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize: 17, fontWeight: 500, marginBottom: 4 }}>{t}</div>
                <p style={{ fontSize: 13, color:'var(--yum-ink-2)', margin: 0, lineHeight: 1.5 }}>{b}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Earnings calc */}
      <section style={{ padding: '24px 18px 12px' }}>
        <div style={{ background:'var(--yum-paper)', border:'1px solid var(--yum-border-soft)', borderRadius:'var(--r-lg)', padding: 22 }}>
          <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing: 0.12, textTransform:'uppercase' }}>Estimate your earnings</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize: 26, fontWeight: 500, letterSpacing:'-0.015em', marginTop: 6, marginBottom: 14, lineHeight: 1.1 }}>One weekday lunch service?</h2>

          {[['Orders / day', 14, 4, 40], ['Avg order value', '₹245', 120, 500], ['Days / week', 5, 1, 7]].map(([l, v, min, max])=>(
            <div key={l} style={{ marginBottom: 16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color:'var(--yum-ink-2)' }}>{l}</span>
                <span className="num" style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
              </div>
              <YSlider value={typeof v==='string'?245:v} min={min} max={max}/>
            </div>
          ))}

          <div style={{ background:'var(--yum-ink)', color:'var(--yum-cream)', borderRadius:'var(--r-md)', padding: 20, marginTop: 8 }}>
            <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'rgba(251,247,240,0.6)', letterSpacing: 0.1, textTransform:'uppercase' }}>Projected monthly take-home</div>
            <div className="num" style={{ fontFamily:'var(--font-display)', fontSize: 52, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 8, color:'var(--yum-cream)' }}>₹68,600</div>
            <div style={{ fontSize: 11, color:'rgba(251,247,240,0.65)', marginTop: 6 }}>After 12% fee · before TDS</div>
          </div>
        </div>
      </section>

      {/* Testimonial card single */}
      <section style={{ padding: '24px 18px 12px' }}>
        <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', color:'var(--yum-ink-3)', letterSpacing: 0.14, textTransform:'uppercase' }}>Cooks on Yummara</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize: 28, fontWeight: 500, letterSpacing:'-0.015em', marginTop: 6, marginBottom: 14, lineHeight: 1.1 }}>Words from the kitchen.</h2>
        <div style={{ background:'var(--yum-paper)', borderRadius:'var(--r-lg)', border:'1px solid var(--yum-border-soft)', overflow:'hidden' }}>
          <div style={{ position:'relative', aspectRatio: '4/3' }}>
            <YImg tone="green" label="Rukmini's kitchen, Koramangala" style={{ position:'absolute', inset:0 }}/>
            <div style={{ position:'absolute', top: 12, left: 12 }}>
              <YBadge tone="online">₹42k / month</YBadge>
            </div>
          </div>
          <div style={{ padding: 18 }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize: 16, lineHeight: 1.4, fontWeight: 500, margin: 0 }}>"They didn't ask me to act like a restaurant — they asked what I cook on Sundays."</p>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop:'1px solid var(--yum-border-soft)', display:'flex', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Rukmini D'Souza</div>
                <div style={{ fontSize: 11, color:'var(--yum-ink-3)' }}>Koramangala</div>
              </div>
              <div style={{ display:'flex', gap: 4 }}>
                <button style={{ width: 32, height: 32, borderRadius: 999, border:'1px solid var(--yum-border)', background:'transparent', transform:'rotate(180deg)' }}>{Ic.arrow({s:12})}</button>
                <button style={{ width: 32, height: 32, borderRadius: 999, background:'var(--yum-ink)', color:'var(--yum-cream)', border:'none' }}>{Ic.arrow({s:12})}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section style={{ padding: '24px 18px 32px' }}>
        <div style={{ background:'var(--yum-primary)', color:'var(--yum-cream)', borderRadius:'var(--r-lg)', padding: 24 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize: 28, lineHeight: 1.05, letterSpacing:'-0.02em', fontWeight: 500, marginTop: 0, marginBottom: 12 }}>
            The dish your family eats on Sundays — someone nearby wants it tonight.
          </h2>
          <p style={{ fontSize: 13, color:'rgba(251,247,240,0.78)', marginTop: 0, marginBottom: 18 }}>Bring your kitchen as it is. We help with the awkward bits.</p>
          <YButton size="lg" variant="invert" full>Apply to cook</YButton>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { CookLandingDesktop, CookLandingMobile, CookNav, YSlider });

// Auth modal — phone OTP login for customers and cooks
// Exposes: AuthModal, useAuth (reads authUser from window.YUM_AUTH)
// window.YUM_AUTH = { user|cook, token, role } | null

const API = 'http://localhost:3001';

// ── Storage helpers ────────────────────────────────────────────────────
function loadAuth() {
  try {
    const raw = localStorage.getItem('yum_auth');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveAuth(data) {
  localStorage.setItem('yum_auth', JSON.stringify(data));
  window.YUM_AUTH = data;
}
function clearAuth() {
  localStorage.removeItem('yum_auth');
  window.YUM_AUTH = null;
}

// Initialise on load
window.YUM_AUTH = loadAuth();

// ── AuthModal ─────────────────────────────────────────────────────────
function AuthModal({ role = 'customer', onSuccess, onClose }) {
  const [step, setStep] = React.useState('phone'); // phone | otp | name
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [devOtp, setDevOtp] = React.useState('');

  async function sendOtp(e) {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) return setError('Enter a valid 10-digit number');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed to send OTP');
      if (data.dev) setDevOtp('(check server console for OTP)');
      setStep('otp');
    } catch {
      setError('Network error — is the backend running?');
    } finally { setLoading(false); }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp, role, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Invalid OTP');
      const authData = { token: data.token, role: data.role };
      if (data.role === 'cook') authData.cook = data.cook;
      else authData.user = data.user;
      saveAuth(authData);
      onSuccess(authData);
    } catch {
      setError('Network error');
    } finally { setLoading(false); }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 200 }}>
      <div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 400, margin: '80px auto', borderRadius: 20, padding: 32 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>
              {role === 'cook' ? 'Cook sign in' : 'Sign in / Sign up'}
            </div>
            <div style={{ color: 'var(--yum-ink-2)', fontSize: 14, marginTop: 2 }}>
              {role === 'cook' ? 'Your registered cook number' : 'We\'ll send a one-time code'}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            {window.Ic ? <Ic name="x" size={20} /> : '✕'}
          </button>
        </div>

        {step === 'phone' && (
          <form onSubmit={sendOtp}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--yum-ink-2)', display: 'block', marginBottom: 6 }}>
                Mobile number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--yum-border)', borderRadius: 10, overflow: 'hidden' }}>
                <span style={{ padding: '12px 14px', color: 'var(--yum-ink-2)', fontSize: 15, borderRight: '1px solid var(--yum-border)', background: 'var(--yum-surface)' }}>+91</span>
                <input
                  type="tel" inputMode="numeric" maxLength={10}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9900000001"
                  autoFocus
                  style={{ flex: 1, border: 'none', padding: '12px 14px', fontSize: 16, outline: 'none', background: 'transparent' }}
                />
              </div>
            </div>
            {error && <div style={{ color: '#e53e3e', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <YButton type="submit" variant="primary" fullWidth loading={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </YButton>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyOtp}>
            <div style={{ marginBottom: 8, fontSize: 14, color: 'var(--yum-ink-2)' }}>
              OTP sent to +91 {phone} · <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--yum-primary)', cursor: 'pointer', padding: 0, fontSize: 14 }}>Change</button>
            </div>
            {devOtp && <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{devOtp}</div>}
            <div style={{ marginBottom: 16 }}>
              <input
                type="text" inputMode="numeric" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit OTP"
                autoFocus
                style={{ width: '100%', border: '1.5px solid var(--yum-border)', borderRadius: 10, padding: '14px 16px', fontSize: 22, letterSpacing: 8, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {error && <div style={{ color: '#e53e3e', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <YButton type="submit" variant="primary" fullWidth loading={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </YButton>
          </form>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AuthModal, loadAuth, saveAuth, clearAuth });

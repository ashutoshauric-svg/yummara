import React from 'react';
import { YButton, Ic } from '../components/ui';
import { saveAuth } from '../lib/auth';
import { API_URL as API } from '../lib/config';

export function AuthModal({ role = 'customer', onSuccess, onClose }) {
  const [step, setStep] = React.useState('phone');
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [devNote, setDevNote] = React.useState('');

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
      if (data.devCode) setDevNote(`Dev mode OTP: ${data.devCode}`);
      else if (data.dev) setDevNote('Check server console for OTP');
      setStep('otp');
    } catch {
      setError('Cannot reach backend — is it running?');
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
        body: JSON.stringify({ phone, code: otp, role }),
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,16,10,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="yum" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, margin: '0 16px', borderRadius: 20, background: 'var(--yum-paper)', padding: 32, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, letterSpacing: '-0.01em' }}>
              {role === 'cook' ? 'Cook sign in' : 'Sign in / Sign up'}
            </div>
            <div style={{ color: 'var(--yum-ink-2)', fontSize: 14, marginTop: 4 }}>
              {role === 'cook' ? 'Your registered cook number' : "We'll send a one-time code"}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid var(--yum-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yum-ink-2)', flexShrink: 0 }}>
            {Ic.x({ s: 14 })}
          </button>
        </div>

        {step === 'phone' && (
          <form onSubmit={sendOtp}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--yum-ink-2)', display: 'block', marginBottom: 6 }}>Mobile number</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--yum-border)', borderRadius: 10, overflow: 'hidden' }}>
                <span style={{ padding: '12px 14px', color: 'var(--yum-ink-2)', fontSize: 15, borderRight: '1px solid var(--yum-border)', background: 'var(--yum-cream)' }}>+91</span>
                <input
                  type="tel" inputMode="numeric" maxLength={10}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9900000001" autoFocus
                  style={{ flex: 1, border: 'none', padding: '12px 14px', fontSize: 16, outline: 'none', background: 'transparent' }}
                />
              </div>
            </div>
            {error && <div style={{ color: 'var(--yum-danger)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <YButton type="submit" variant="primary" full loading={loading}>Send OTP</YButton>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyOtp}>
            <div style={{ marginBottom: 8, fontSize: 14, color: 'var(--yum-ink-2)' }}>
              Sent to +91 {phone} ·{' '}
              <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--yum-primary)', cursor: 'pointer', padding: 0, fontSize: 14 }}>Change</button>
            </div>
            {devNote && <div style={{ fontSize: 12, color: 'var(--yum-ink-3)', marginBottom: 8, padding: '6px 10px', background: 'var(--yum-primary-50)', borderRadius: 6 }}>{devNote}</div>}
            <div style={{ marginBottom: 16 }}>
              <input
                type="text" inputMode="numeric" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit OTP" autoFocus
                style={{ width: '100%', border: '1.5px solid var(--yum-border)', borderRadius: 10, padding: '14px 16px', fontSize: 22, letterSpacing: 8, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {error && <div style={{ color: 'var(--yum-danger)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <YButton type="submit" variant="primary" full loading={loading}>Verify</YButton>
          </form>
        )}
      </div>
    </div>
  );
}

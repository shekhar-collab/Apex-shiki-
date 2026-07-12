import { useState } from 'react';
import { API_BASE } from './api';

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('admin@apex.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('apex_admin_token', data.token);
      localStorage.setItem('apex_admin_user', JSON.stringify(data.user));
      onSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--black)',
        color: 'var(--ivory)',
        fontFamily: 'var(--body)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ width: 380, padding: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(155deg,var(--gold-bright),var(--gold-dim))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--serif)',
              fontWeight: 600,
              color: '#141210',
              fontSize: 18,
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 19 }}>
              APEX <span style={{ color: 'var(--gold)' }}>OS</span>
            </div>
            <div style={{ fontSize: 10.5, letterSpacing: 1.5, color: 'var(--muted-dim)', textTransform: 'uppercase' }}>
              Admin Sign In
            </div>
          </div>
        </div>

        <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', margin: '16px 0 6px' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Admin@123"
          style={inputStyle}
        />

        {error && (
          <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 14 }}>{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p style={{ fontSize: 11.5, color: 'var(--muted-dim)', marginTop: 18, textAlign: 'center' }}>
          Demo credentials: admin@apex.com / Admin@123
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'var(--graphite)',
  border: '1px solid var(--line)',
  borderRadius: 11,
  padding: '11px 14px',
  color: 'var(--ivory)',
  fontFamily: 'var(--body)',
  fontSize: 13.5,
  outline: 'none',
};

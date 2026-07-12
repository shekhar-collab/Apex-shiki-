import { useState } from 'react';
import { API_BASE } from './api';

export default function MemberLogin({ onSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('ishaan.v@mail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const path = mode === 'login' ? '/api/auth/member/login' : '/api/auth/member/register';
      const body = mode === 'login' ? { email, password } : { name, email, password };
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      localStorage.setItem('apex_member_token', data.token);
      localStorage.setItem('apex_member_user', JSON.stringify(data.user));
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
      <form onSubmit={handleSubmit} className="card" style={{ width: 380, padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
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
              APEX <span style={{ color: 'var(--gold)' }}>.</span>
            </div>
            <div style={{ fontSize: 10.5, letterSpacing: 1.5, color: 'var(--muted-dim)', textTransform: 'uppercase' }}>
              My Fitness Panel
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`btn ${mode === 'login' ? 'btn-gold' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`btn ${mode === 'register' ? 'btn-gold' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Register
          </button>
        </div>

        {mode === 'register' && (
          <>
            <label style={labelStyle}>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </>
        )}

        <label style={{ ...labelStyle, marginTop: mode === 'register' ? 16 : 0 }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder={mode === 'login' ? 'Member@123' : 'Choose a password'}
          style={inputStyle}
        />

        {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 14 }}>{error}</div>}

        <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 22 }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <p style={{ fontSize: 11.5, color: 'var(--muted-dim)', marginTop: 18, textAlign: 'center' }}>
          Demo member: ishaan.v@mail.com / Member@123
        </p>
      </form>
    </div>
  );
}

const labelStyle = { fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 6 };
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('ishaan.v@mail.com');
  const [password, setPassword] = useState('Member@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      // Store token and user in localStorage
      localStorage.setItem('apex_member_token', data.token);
      localStorage.setItem('apex_member_user', JSON.stringify(data.user));
      
      login({ token: data.token, user: data.user });
      navigate(data.user?.role === 'admin' ? '/admin/dashboard' : '/member/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--black)', color: 'var(--ivory)' }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: 380, padding: 36 }}>
        <h2 style={{ fontFamily: 'var(--serif)', marginBottom: 8 }}>Welcome back</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Sign in to continue to your member dashboard.</p>
        <label style={labelStyle}>Email</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={inputStyle} />
        <label style={{ ...labelStyle, marginTop: 16 }}>Password</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={inputStyle} />
        {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 14 }}>{error}</div>}
        <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 22 }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p style={{ fontSize: 12, marginTop: 16, color: 'var(--muted-dim)', textAlign: 'center' }}>Demo: ishaan.v@mail.com / Member@123</p>
      </form>
    </section>
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

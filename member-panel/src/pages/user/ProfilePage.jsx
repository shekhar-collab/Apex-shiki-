import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('apex_member_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/member/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Could not load profile');
        setProfile(data);
      })
      .catch((err) => setError(err.message || 'Could not load profile'))
      .finally(() => setLoading(false));
  }, []);

  const displayName = useMemo(() => profile?.name || user?.name || 'Member', [profile, user]);

  return (
    <section style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--black)', color: 'var(--ivory)' }}>
      <div className="card" style={{ maxWidth: 760, margin: '0 auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div>
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontSize: 12, marginBottom: 6 }}>Member profile</p>
            <h2 style={{ fontFamily: 'var(--serif)', margin: 0 }}>{displayName}</h2>
          </div>
          <button type="button" className="btn btn-gold" onClick={logout}>Logout</button>
        </div>

        {loading && <p style={{ color: 'var(--muted)' }}>Loading profile…</p>}
        {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
        {!loading && !error && profile && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <div><strong>Email:</strong> {profile.email}</div>
              <div><strong>Plan:</strong> {profile.plan || 'Essential'}</div>
              <div><strong>Trainer:</strong> {profile.trainer || 'Not assigned'}</div>
              <div><strong>Join date:</strong> {profile.join || '—'}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

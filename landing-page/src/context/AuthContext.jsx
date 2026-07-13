import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, role: null, user: null, token: null };
  }

  const adminToken = window.localStorage.getItem('apex_admin_token');
  const memberToken = window.localStorage.getItem('apex_member_token');
  const token = adminToken || memberToken || null;
  const rawUser = window.localStorage.getItem('apex_admin_user') || window.localStorage.getItem('apex_member_user');

  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  return {
    isAuthenticated: Boolean(token),
    role: adminToken ? 'admin' : memberToken ? 'member' : null,
    user,
    token,
  };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  useEffect(() => {
    const handleStorageChange = () => setAuth(readStoredAuth());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = ({ token, user }) => {
    const role = user?.role === 'admin' ? 'admin' : 'member';
    if (role === 'admin') {
      window.localStorage.setItem('apex_admin_token', token);
      window.localStorage.setItem('apex_admin_user', JSON.stringify(user));
      window.localStorage.removeItem('apex_member_token');
      window.localStorage.removeItem('apex_member_user');
    } else {
      window.localStorage.setItem('apex_member_token', token);
      window.localStorage.setItem('apex_member_user', JSON.stringify(user));
      window.localStorage.removeItem('apex_admin_token');
      window.localStorage.removeItem('apex_admin_user');
    }

    setAuth({ isAuthenticated: true, role, user, token });
  };

  const logout = () => {
    window.localStorage.removeItem('apex_admin_token');
    window.localStorage.removeItem('apex_admin_user');
    window.localStorage.removeItem('apex_member_token');
    window.localStorage.removeItem('apex_member_user');
    setAuth({ isAuthenticated: false, role: null, user: null, token: null });
  };

  const value = useMemo(() => ({ ...auth, login, logout }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

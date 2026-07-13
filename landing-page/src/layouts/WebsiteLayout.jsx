import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function WebsiteLayout() {
  const { isAuthenticated, role, user, logout } = useAuth();

  const displayName = user?.name || (role === 'admin' ? 'Admin' : role === 'member' ? 'Member' : 'Guest');
  const initials = (displayName || 'U').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div className="app-shell">
      <header>
        <div className="wrap">
          <nav>
            <NavLink to="/" className="logo">APEX<span>.</span></NavLink>
            <div className="nav-links">
              <NavLink to="/about">About</NavLink>
              <NavLink to="/services">Services</NavLink>
              <NavLink to="/products">Products</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </div>
            <div className="nav-auth-slot">
              {isAuthenticated ? (
                <div className="nav-auth-actions">
                  <div className="nav-user-pill">
                    <span className="nav-user-avatar">{initials}</span>
                    <span className="nav-user-name">{displayName}</span>
                  </div>
                  <NavLink className="nav-auth-link" to={role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}>
                    {role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                  </NavLink>
                  <button type="button" className="nav-auth-button nav-auth-logout" onClick={logout}>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="nav-auth-actions">
                  <NavLink className="nav-auth-button nav-auth-login" to="/login">Log In</NavLink>
                  <NavLink className="nav-auth-button" to="/register">Register</NavLink>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

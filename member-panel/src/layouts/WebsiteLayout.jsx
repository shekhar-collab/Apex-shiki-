import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function WebsiteLayout() {
  const { isAuthenticated, role, user, logout } = useAuth();

  useEffect(() => {
    const navAuthSlot = document.getElementById('navAuthActions');
    if (!navAuthSlot) return;

    // Clear previous content
    navAuthSlot.innerHTML = '';

    if (isAuthenticated) {
      const displayName = user?.name || (role === 'admin' ? 'Admin' : 'Member');
      const initials = (displayName || 'U').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
      const dashboardLink = role === 'admin' ? '/admin/dashboard' : '/member/dashboard';
      const dashboardLabel = role === 'admin' ? 'Admin Panel' : 'My Dashboard';

      navAuthSlot.innerHTML = `
        <div class="nav-auth-actions">
          <div class="nav-user-pill">
            <span class="nav-user-avatar">${initials}</span>
            <span class="nav-user-name">${displayName}</span>
          </div>
          <a class="nav-auth-link" href="${dashboardLink}">${dashboardLabel}</a>
          <button type="button" class="nav-auth-button nav-auth-logout">Logout</button>
        </div>
      `;

      // Wire logout button
      const logoutBtn = navAuthSlot.querySelector('.nav-auth-logout');
      if (logoutBtn) {
        logoutBtn.onclick = (e) => {
          e.preventDefault();
          logout();
        };
      }

      // Wire dashboard link for SPA navigation
      const dashLink = navAuthSlot.querySelector('.nav-auth-link');
      if (dashLink) {
        dashLink.onclick = (e) => {
          e.preventDefault();
          window.location.href = dashboardLink;
        };
      }
    } else {
      navAuthSlot.innerHTML = `
        <div class="nav-auth-actions">
          <a class="nav-auth-button nav-auth-login" href="/login">Log In</a>
          <a class="nav-auth-button" href="/register">Register</a>
        </div>
      `;
    }
  }, [isAuthenticated, role, user, logout]);

  return (
    <>
      <Outlet />
    </>
  );
}

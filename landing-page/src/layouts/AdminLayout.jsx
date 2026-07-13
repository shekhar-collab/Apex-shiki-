import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminLayout() {
  const { logout, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      Navigate({ to: '/login' });
    }

    // Wire up logout button in the dashboard markup
    const logoutItem = document.querySelector('.sidebar-footer .nav-item');
    if (logoutItem) {
      const handleLogout = () => {
        logout();
        window.location.href = '/';
      };
      logoutItem.addEventListener('click', handleLogout);
      return () => logoutItem.removeEventListener('click', handleLogout);
    }
  }, [logout, isAuthenticated, role]);

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <div />;
}

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function UserLayout() {
  const { logout, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || role !== 'member') {
      Navigate({ to: '/login' });
    }

    // Wire up logout button in the panel markup
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

  if (!isAuthenticated || role !== 'member') {
    return <Navigate to="/login" replace />;
  }

  return <div />;
}

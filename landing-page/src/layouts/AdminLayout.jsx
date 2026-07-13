import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/login', { replace: true });
      return;
    }

    const logoutItem = document.querySelector('.sidebar-footer .nav-item');
    if (logoutItem) {
      const handleLogout = () => {
        logout();
        window.location.href = '/';
      };
      logoutItem.addEventListener('click', handleLogout);
      return () => logoutItem.removeEventListener('click', handleLogout);
    }
  }, [logout, isAuthenticated, role, navigate]);

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

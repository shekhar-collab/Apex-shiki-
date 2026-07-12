import { useEffect, useRef, useState } from 'react';
import bodyHtml from './body.html?raw';
import './App.css';
import { API_BASE } from './api';
import MemberLogin from './MemberLogin.jsx';
import { initMemberPanel } from './panel-init.js';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('apex_member_token'));
  const [error, setError] = useState('');
  const rootRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!token || !rootRef.current || initialized.current) return;
    initialized.current = true;
    initMemberPanel(token, API_BASE).catch((err) => {
      console.error(err);
      setError('Could not load your panel data: ' + err.message);
    });

    // logout wiring — original markup has a "Logout" nav item as the last item
    const logoutItem = rootRef.current.querySelector('.sidebar-footer .nav-item');
    const handleLogout = () => {
      localStorage.removeItem('apex_member_token');
      localStorage.removeItem('apex_member_user');
      window.location.reload();
    };
    logoutItem?.addEventListener('click', handleLogout);
    return () => logoutItem?.removeEventListener('click', handleLogout);
  }, [token]);

  function handleLoginSuccess(newToken) {
    setToken(newToken);
  }

  if (!token) {
    return <MemberLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      {error && (
        <div
          style={{
            position: 'fixed',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#e2725b',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 10,
            zIndex: 999,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}

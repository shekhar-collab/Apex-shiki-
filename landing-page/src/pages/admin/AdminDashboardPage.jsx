import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../../api';
import bodyHtml from '../../../../admin-dashboard/src/body.html?raw';
import '../../../../admin-dashboard/src/App.css';
import { initAdminDashboard } from '../../../../admin-dashboard/src/dashboard-init.js';

export default function AdminDashboardPage() {
  const [error, setError] = useState('');
  const rootRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('apex_admin_token');
    if (!token || !rootRef.current || initialized.current) return;
    initialized.current = true;
    initAdminDashboard(token, API_BASE).catch((err) => {
      console.error(err);
      setError('Could not load dashboard data: ' + err.message);
    });
  }, []);

  return (
    <>
      {error && <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', background: '#e2725b', color: '#fff', padding: '10px 20px', borderRadius: 10, zIndex: 999, fontSize: 13 }}>{error}</div>}
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}

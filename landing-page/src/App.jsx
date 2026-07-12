import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import bodyHtml from './body.html?raw';
import './App.css';
import { API_BASE } from './api';

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

export default function App() {
  const rootRef = useRef(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [authState, setAuthState] = useState(readStoredAuth);
  const [navAuthMountNode, setNavAuthMountNode] = useState(null);

  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    const authNode = container.querySelector('#navAuthActions');
    if (authNode) {
      setNavAuthMountNode(authNode);
    }

    /* ---- FAQ accordion (identical behaviour to the original static page) ---- */
    const faqItems = container.querySelectorAll('.faq-item');
    const faqCleanups = [];
    faqItems.forEach((item) => {
      const answer = item.querySelector('.faq-a');
      const icon = item.querySelector('.icon');
      answer.style.display = 'none';
      const handler = () => {
        const open = answer.style.display === 'block';
        container.querySelectorAll('.faq-a').forEach((a) => (a.style.display = 'none'));
        container.querySelectorAll('.faq-item .icon').forEach((i) => (i.textContent = '+'));
        if (!open) {
          answer.style.display = 'block';
          icon.textContent = '–';
        }
      };
      item.addEventListener('click', handler);
      faqCleanups.push(() => item.removeEventListener('click', handler));
    });

    /* ---- Contact form -> POST /api/contact (real backend, MongoDB) ---- */
    const form = container.querySelector('.contact-form');
    let submitHandler = null;
    if (form) {
      const [firstNameInput, lastNameInput] = form.querySelectorAll('input[type="text"]');
      const emailInput = form.querySelector('input[type="email"]');
      const messageInput = form.querySelector('textarea');
      const sendBtn = form.querySelector('.btn.btn-solid');
      const originalLabel = sendBtn ? sendBtn.textContent : '';

      submitHandler = async () => {
        if (!firstNameInput.value || !lastNameInput.value || !emailInput.value || !messageInput.value) {
          sendBtn.textContent = 'Please fill in every field';
          setTimeout(() => (sendBtn.textContent = originalLabel), 2200);
          return;
        }
        sendBtn.textContent = 'Sending…';
        try {
          const res = await fetch(`${API_BASE}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: firstNameInput.value,
              lastName: lastNameInput.value,
              email: emailInput.value,
              message: messageInput.value,
            }),
          });
          if (!res.ok) throw new Error('request failed');
          sendBtn.textContent = 'Message sent ✓';
          firstNameInput.value = '';
          lastNameInput.value = '';
          emailInput.value = '';
          messageInput.value = '';
        } catch (err) {
          sendBtn.textContent = 'Something went wrong — try again';
        } finally {
          setTimeout(() => (sendBtn.textContent = originalLabel), 2600);
        }
      };
      sendBtn.addEventListener('click', submitHandler);
    }

    const loginTrigger = container.querySelector('#loginTrigger');
    if (loginTrigger) {
      const handleOpenLogin = (event) => {
        event.preventDefault();
        setLoginError('');
        setLoginEmail('');
        setLoginPassword('');
        setLoginOpen(true);
      };
      loginTrigger.addEventListener('click', handleOpenLogin);
      faqCleanups.push(() => loginTrigger.removeEventListener('click', handleOpenLogin));
    }

    const handleStorageChange = () => setAuthState(readStoredAuth());
    window.addEventListener('storage', handleStorageChange);

    return () => {
      faqCleanups.forEach((fn) => fn());
      if (form && submitHandler) {
        const sendBtn = form.querySelector('.btn.btn-solid');
        if (sendBtn) sendBtn.removeEventListener('click', submitHandler);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  function openLoginModal() {
    setLoginError('');
    setLoginEmail('');
    setLoginPassword('');
    setLoginOpen(true);
  }

  function handleLogout() {
    window.localStorage.removeItem('apex_admin_token');
    window.localStorage.removeItem('apex_admin_user');
    window.localStorage.removeItem('apex_member_token');
    window.localStorage.removeItem('apex_member_user');
    setAuthState(readStoredAuth());
    window.location.assign('/');
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter your email and password');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      const role = data.user?.role === 'admin' ? 'admin' : 'member';
      if (role === 'admin') {
        window.localStorage.setItem('apex_admin_token', data.token);
        window.localStorage.setItem('apex_admin_user', JSON.stringify(data.user));
        window.localStorage.removeItem('apex_member_token');
        window.localStorage.removeItem('apex_member_user');
      } else {
        window.localStorage.setItem('apex_member_token', data.token);
        window.localStorage.setItem('apex_member_user', JSON.stringify(data.user));
        window.localStorage.removeItem('apex_admin_token');
        window.localStorage.removeItem('apex_admin_user');
      }

      setAuthState({
        isAuthenticated: true,
        role,
        user: data.user,
        token: data.token,
      });
      window.location.assign(role === 'admin' ? '/admin' : '/member');
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  }

  const renderNavAuth = () => {
    const displayName = authState.user?.name || (authState.role === 'admin' ? 'Admin' : 'Member');
    const initials = (displayName || 'U').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

    if (!authState.isAuthenticated) {
      return (
        <button type="button" className="nav-auth-button nav-auth-login" onClick={openLoginModal}>
          Log In
        </button>
      );
    }

    const dashboardHref = authState.role === 'admin' ? '/admin' : '/member';

    return (
      <div className="nav-auth-actions">
        <div className="nav-user-pill">
          <span className="nav-user-avatar">{initials}</span>
          <span className="nav-user-name">{displayName}</span>
        </div>
        <a className="nav-auth-link" href={dashboardHref}>
          {authState.role === 'admin' ? 'Admin Panel' : 'Profile'}
        </a>
        {authState.role === 'admin' && (
          <a className="nav-auth-link" href="/admin/">
            Dashboard
          </a>
        )}
        <button type="button" className="nav-auth-button nav-auth-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  };

  return (
    <>
      {loginOpen && (
        <div className="login-modal-overlay" onClick={() => setLoginOpen(false)}>
          <div className="login-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="login-modal-close" onClick={() => setLoginOpen(false)} aria-label="Close login">
              ×
            </button>
            <div className="login-modal-title">Welcome back</div>
            <p className="login-modal-subtitle">Enter your email and password to access your account.</p>
            <form onSubmit={handleLoginSubmit} className="login-form">
              <label className="login-label" htmlFor="loginEmail">Email</label>
              <input id="loginEmail" type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="you@example.com" />
              <label className="login-label" htmlFor="loginPassword">Password</label>
              <input id="loginPassword" type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Your password" />
              {loginError && <div className="login-error">{loginError}</div>}
              <button type="submit" className="btn btn-solid login-submit" disabled={loginLoading}>
                {loginLoading ? 'Signing in…' : 'Log In'}
              </button>
              <p className="login-hint">Demo admin: admin@apex.com / Admin@123</p>
              <p className="login-hint">Demo member: ishaan.v@mail.com / Member@123</p>
            </form>
          </div>
        </div>
      )}
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      {navAuthMountNode ? createPortal(renderNavAuth(), navAuthMountNode) : null}
    </>
  );
}

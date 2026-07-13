import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../../api';
import bodyHtml from '../../body.html?raw';
import '../../App.css';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
  const rootRef = useRef(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    const faqItems = container.querySelectorAll('.faq-item');
    const faqCleanups = [];
    faqItems.forEach((item) => {
      const answer = item.querySelector('.faq-a');
      const icon = item.querySelector('.icon');
      if (answer) answer.style.display = 'none';
      const handler = () => {
        const open = answer && answer.style.display === 'block';
        container.querySelectorAll('.faq-a').forEach((a) => (a.style.display = 'none'));
        container.querySelectorAll('.faq-item .icon').forEach((i) => (i.textContent = '+'));
        if (!open && answer && icon) {
          answer.style.display = 'block';
          icon.textContent = '–';
        }
      };
      item.addEventListener('click', handler);
      faqCleanups.push(() => item.removeEventListener('click', handler));
    });

    const form = container.querySelector('.contact-form');
    let submitHandler = null;
    if (form) {
      const [firstNameInput, lastNameInput] = form.querySelectorAll('input[type="text"]');
      const emailInput = form.querySelector('input[type="email"]');
      const messageInput = form.querySelector('textarea');
      const sendBtn = form.querySelector('.btn.btn-solid');
      const originalLabel = sendBtn ? sendBtn.textContent : '';

      submitHandler = async () => {
        if (!firstNameInput?.value || !lastNameInput?.value || !emailInput?.value || !messageInput?.value) {
          if (sendBtn) sendBtn.textContent = 'Please fill in every field';
          setTimeout(() => { if (sendBtn) sendBtn.textContent = originalLabel; }, 2200);
          return;
        }
        if (sendBtn) sendBtn.textContent = 'Sending…';
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
          if (sendBtn) sendBtn.textContent = 'Message sent ✓';
          if (firstNameInput) firstNameInput.value = '';
          if (lastNameInput) lastNameInput.value = '';
          if (emailInput) emailInput.value = '';
          if (messageInput) messageInput.value = '';
        } catch (err) {
          if (sendBtn) sendBtn.textContent = 'Something went wrong — try again';
        } finally {
          setTimeout(() => { if (sendBtn) sendBtn.textContent = originalLabel; }, 2600);
        }
      };
      sendBtn?.addEventListener('click', submitHandler);
    }

    return () => {
      faqCleanups.forEach((fn) => fn());
      if (form && submitHandler) {
        const sendBtn = form.querySelector('.btn.btn-solid');
        sendBtn?.removeEventListener('click', submitHandler);
      }
    };
  }, []);

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
      login({ token: data.token, user: data.user });
      setLoginOpen(false);
      window.location.assign(data.user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <>
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
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
    </>
  );
}

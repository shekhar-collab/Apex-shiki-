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
  const [trialOpen, setTrialOpen] = useState(false);
  const [trialData, setTrialData] = useState({ fullName: '', mobileNumber: '', email: '', preferredDate: '', preferredTimeSlot: '', fitnessGoal: '', age: '' });
  const [trialError, setTrialError] = useState('');
  const [trialSuccess, setTrialSuccess] = useState('');
  const [trialLoading, setTrialLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    const getImageSrc = (img) => {
      if (!img) return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop';
      if (/^https?:\/\//i.test(img)) return img;
      return `https://images.unsplash.com/${img}?q=80&w=1200&auto=format&fit=crop`;
    };

    let cancelled = false;

    const renderHomeContent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/contact/home-content`);
        const data = await res.json();
        if (!res.ok || cancelled) return;

        const trainers = Array.isArray(data?.trainers) ? data.trainers : [];
        const plans = Array.isArray(data?.plans) ? data.plans : [];
        const workouts = Array.isArray(data?.workouts) ? data.workouts : [];

        const programsGrid = container.querySelector('.programs-grid');
        if (programsGrid) {
          const programs = (workouts.length ? workouts : [
            { name: 'Performance Strength', description: 'Progressive overload programming for serious, measurable gains.', category: 'Strength' },
            { name: 'Hybrid Conditioning', description: 'Energy system training focused on endurance, recovery, and resilience.', category: 'Conditioning' },
            { name: 'Rebuild & Recover', description: 'Mobility, mobility, and strength programming for sustainable progress.', category: 'Recovery' },
          ])
            .slice(0, 3)
            .map((item, index) => `
              <div class="program-card">
                <img alt="${item.name}" src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop" />
                <div class="overlay"></div>
                <div class="content">
                  <span class="program-num">0${index + 1}</span>
                  <h3>${item.name}</h3>
                  <p>${item.description || `${item.category || 'Performance'} program curated by our coaching team.`}</p>
                  <span class="program-link">Discover Program →</span>
                </div>
              </div>
            `)
            .join('');
          programsGrid.innerHTML = programs;
        }

        const trainersGrid = container.querySelector('.trainers-grid');
        if (trainersGrid) {
          const trainerCards = (trainers.length ? trainers : [
            { name: 'Elena Cross', spec: 'Performance Coach', img: 'photo-1594381898411-846e7d193883' },
            { name: 'Marcus Reed', spec: 'Strength Specialist', img: 'photo-1526506118085-60ce8714f8c5' },
            { name: 'Nina Patel', spec: 'Mobility Coach', img: 'photo-1571019613454-1cb2f99b2d8b' },
          ])
            .slice(0, 4)
            .map((trainer) => `
              <div class="trainer-card">
                <div class="trainer-photo">
                  <img alt="${trainer.name}" src="${getImageSrc(trainer.img)}" />
                  <div class="trainer-social"><span>in</span><span>ig</span></div>
                </div>
                <div class="trainer-info">
                  <h4>${trainer.name}</h4>
                  <div class="role">${trainer.spec || 'Certified Coach'}</div>
                  <div class="desc">${trainer.clients ? `${trainer.clients} clients coached` : 'Trusted by athletes and busy professionals alike.'}</div>
                </div>
              </div>
            `)
            .join('');
          trainersGrid.innerHTML = trainerCards;
        }

        const plansGrid = container.querySelector('.plans-grid');
        if (plansGrid) {
          const membershipCards = (plans.length ? plans : [
            { name: 'Essential', price: 89, features: ['Full gym access', 'Recovery suite access'] },
            { name: 'Elite', price: 179, features: ['Dedicated coaching', 'Custom nutrition plan'] },
            { name: 'Private', price: 349, features: ['Bespoke coaching', 'Priority booking'] },
          ])
            .slice(0, 3)
            .map((plan, index) => {
              const featured = index === 1;
              const features = Array.isArray(plan.features) && plan.features.length ? plan.features : ['Coach support', 'Premium access', 'Recovery perks'];
              return `
                <div class="plan-card${featured ? ' featured' : ''}">
                  ${featured ? '<div class="plan-badge">Most Popular</div>' : ''}
                  <div class="plan-name">${plan.name}</div>
                  <div class="plan-price">₹${Number(plan.price || 0).toLocaleString('en-IN')}<span>/mo</span></div>
                  <p class="plan-desc">${plan.description || 'Flexible membership designed around your lifestyle and goals.'}</p>
                  <ul class="plan-list">
                    ${features.map((feature) => `<li>${feature}</li>`).join('')}
                  </ul>
                  <div class="plan-btn">Get Started</div>
                </div>
              `;
            })
            .join('');
          plansGrid.innerHTML = membershipCards;
        }
      } catch (err) {
        console.error('Could not load home content', err);
      }
    };

    renderHomeContent();
    const refreshTimer = window.setInterval(() => {
      renderHomeContent();
    }, 15000);

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

    // Book Free Trial button handler
    const bookTrialBtn = container.querySelector('a.btn-glass[href="#programs"]');
    if (bookTrialBtn) {
      const trialHandler = (e) => {
        e.preventDefault();
        setTrialOpen(true);
      };
      bookTrialBtn.addEventListener('click', trialHandler);
      faqCleanups.push(() => bookTrialBtn.removeEventListener('click', trialHandler));
    }

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
      cancelled = true;
      window.clearInterval(refreshTimer);
      faqCleanups.forEach((fn) => fn());
      if (form && submitHandler) {
        const sendBtn = form.querySelector('.btn.btn-solid');
        sendBtn?.removeEventListener('click', submitHandler);
      }
    };
  }, []);

  function handleTrialChange(e) {
    const { name, value } = e.target;
    setTrialData(prev => ({ ...prev, [name]: value }));
    if (trialError) setTrialError('');
  }

  async function handleTrialSubmit(e) {
    e.preventDefault();
    setTrialError('');
    setTrialSuccess('');
    
    // Validation
    if (!trialData.fullName.trim()) {
      setTrialError('Full Name is required');
      return;
    }
    if (!trialData.mobileNumber.trim()) {
      setTrialError('Mobile Number is required');
      return;
    }
    if (!trialData.preferredDate) {
      setTrialError('Preferred Date is required');
      return;
    }
    if (!trialData.preferredTimeSlot) {
      setTrialError('Preferred Time Slot is required');
      return;
    }

    setTrialLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/trial-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trialData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      
      setTrialSuccess('Trial booking submitted successfully! We will contact you shortly.');
      setTrialData({ fullName: '', mobileNumber: '', email: '', preferredDate: '', preferredTimeSlot: '', fitnessGoal: '', age: '' });
      setTimeout(() => {
        setTrialOpen(false);
        setTrialSuccess('');
      }, 2500);
    } catch (err) {
      setTrialError(err.message || 'Booking failed');
    } finally {
      setTrialLoading(false);
    }
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
      login({ token: data.token, user: data.user });
      setLoginOpen(false);
      window.location.assign(data.user?.role === 'admin' ? '/admin/dashboard' : '/member/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <>
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      {trialOpen && (
        <div className="trial-modal-overlay" onClick={() => !trialLoading && setTrialOpen(false)}>
          <div className="trial-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="trial-modal-close" onClick={() => !trialLoading && setTrialOpen(false)} aria-label="Close trial booking" disabled={trialLoading}>
              ×
            </button>
            <div className="trial-modal-title">Book Your Free Trial</div>
            <p className="trial-modal-subtitle">Experience APEX with a personalized one-on-one session. Fill in your details and we will confirm your booking.</p>
            {trialError && <div className="trial-error">{trialError}</div>}
            {trialSuccess && <div className="trial-success">{trialSuccess}</div>}
            <form onSubmit={handleTrialSubmit} className="trial-form">
              <div className="form-row">
                <div className="field">
                  <label htmlFor="fullName">Full Name <span className="required">*</span></label>
                  <input id="fullName" type="text" name="fullName" value={trialData.fullName} onChange={handleTrialChange} placeholder="John Doe" />
                </div>
                <div className="field">
                  <label htmlFor="mobileNumber">Mobile Number <span className="required">*</span></label>
                  <input id="mobileNumber" type="tel" name="mobileNumber" value={trialData.mobileNumber} onChange={handleTrialChange} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" name="email" value={trialData.email} onChange={handleTrialChange} placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label htmlFor="preferredDate">Preferred Date <span className="required">*</span></label>
                  <input id="preferredDate" type="date" name="preferredDate" value={trialData.preferredDate} onChange={handleTrialChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="preferredTimeSlot">Preferred Time Slot <span className="required">*</span></label>
                  <select id="preferredTimeSlot" name="preferredTimeSlot" value={trialData.preferredTimeSlot} onChange={handleTrialChange}>
                    <option value="">Select a time slot</option>
                    <option value="06:00-07:00">6:00 AM - 7:00 AM</option>
                    <option value="07:00-08:00">7:00 AM - 8:00 AM</option>
                    <option value="08:00-09:00">8:00 AM - 9:00 AM</option>
                    <option value="17:00-18:00">5:00 PM - 6:00 PM</option>
                    <option value="18:00-19:00">6:00 PM - 7:00 PM</option>
                    <option value="19:00-20:00">7:00 PM - 8:00 PM</option>
                    <option value="20:00-21:00">8:00 PM - 9:00 PM</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="age">Age</label>
                  <input id="age" type="number" name="age" value={trialData.age} onChange={handleTrialChange} placeholder="25" min="16" max="100" />
                </div>
              </div>
              <div className="form-row full">
                <div className="field">
                  <label htmlFor="fitnessGoal">Fitness Goal</label>
                  <textarea id="fitnessGoal" name="fitnessGoal" value={trialData.fitnessGoal} onChange={handleTrialChange} placeholder="e.g., Build muscle, Lose weight, Improve endurance..."></textarea>
                </div>
              </div>
              <button type="submit" className="trial-submit" disabled={trialLoading}>
                {trialLoading ? 'Booking Trial...' : 'Book Your Free Trial'}
              </button>
            </form>
          </div>
        </div>
      )}
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

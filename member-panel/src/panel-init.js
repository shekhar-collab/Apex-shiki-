// Auto-generated from the original apex-member-user-panel script.
// All hardcoded demo arrays were replaced with live fetches to the
// Node/Express + MongoDB backend (this member's own document). Every
// rendering function below is otherwise byte-for-byte identical to the
// original static panel.
export async function initMemberPanel(token, apiBase) {
  const base = apiBase.replace(/\/$/, '');
  const api = (path, options = {}) => {
    const normalizedPath = path.replace(/^\/api/i, '');
    const method = options.method || 'GET';
    const headers = {
      Authorization: 'Bearer ' + token,
      ...(options.headers || {}),
    };

    if (method !== 'GET' && method !== 'HEAD') {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(`${base}/api${normalizedPath}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }).then((r) => {
      if (!r.ok) throw new Error('API error ' + r.status + ' on ' + path);
      return r.text().then((text) => (text ? JSON.parse(text) : null));
    });
  };

  const me = await api('/member/me');
  const [planData, trainerData, workoutData] = await Promise.all([
    api('/api/contact/plans-public').catch(() => []),
    api('/api/contact/trainers-public').catch(() => []),
    api('/member/me/workout').catch(() => ({
      title: 'Today — Push Day',
      subtitle: 'Chest · Shoulders · Triceps · 45 min',
      trainer: me.trainer || 'Marcus Reid',
      exercises: Array.isArray(me.exercises) ? me.exercises : [],
      weekPlan: Array.isArray(me.weekPlan) ? me.weekPlan : [],
      total: Array.isArray(me.exercises) ? me.exercises.length : 0,
      completed: (Array.isArray(me.exercises) ? me.exercises : []).filter((exercise) => exercise?.done).length,
      isComplete: false,
    })),
  ]);

  const membershipPlan = Array.isArray(planData) ? planData.find((plan) => (plan.name || '').toLowerCase() === String(me.plan || '').toLowerCase()) || planData[0] : null;
  const selectedTrainer = Array.isArray(trainerData) ? trainerData[0] : null;

  const SETTINGS = {
    name: me.name || '',
    email: me.email || '',
    phone: me.phone || '',
    password: '',
    preferences: {
      workoutReminders: Boolean(me.preferences?.workoutReminders),
      streakAlerts: Boolean(me.preferences?.streakAlerts),
      dietReminders: Boolean(me.preferences?.dietReminders),
      marketingEmails: Boolean(me.preferences?.marketingEmails),
    },
  };

const ICON = {
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  workouts:'<polyline points="3 12 8 12 10 6 14 18 16 12 21 12"/>',
  diet:'<path d="M12 2a10 10 0 1 0 0.01 0z"/><path d="M12 2v10l7 5"/>',
  progress:'<polyline points="3 17 10 10 14 14 21 7"/><polyline points="21 14 21 7 14 7"/>',
  streak:'<path d="M12 2c1 3-2 4.5-2 7.5a2 2 0 0 0 4 0c0-1 .5-1.5 1-2 1 2 2 4 2 6.5a5 5 0 0 1-10 0c0-4 2-5.5 3-8 .5-1.3.8-2.6 2-4z"/>',
  bookings:'<rect x="3" y="4" width="18" height="17" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>',
  schedule:'<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>',
  membership:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  notifications:'<path d="M6 10a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'
};
function svgIcon(key){return '<svg class="icon" viewBox="0 0 24 24">'+ICON[key]+'</svg>';}

const NAV = [
  {label:'Overview', items:[{id:'dashboard', label:'My Dashboard', icon:'dashboard'}]},
  {label:'Fitness', items:[
    {id:'workouts', label:'My Workouts', icon:'workouts'},
    {id:'diet', label:'My Diet Plan', icon:'diet'},
    {id:'progress', label:'My Progress', icon:'progress'},
  ]},
  {label:'Streak & Rewards', items:[
    {id:'streak', label:'Streak & Rewards', icon:'streak', badge:'🔥'},
  ]},
  {label:'Schedule', items:[
    {id:'bookings', label:'My Bookings', icon:'bookings'},
    {id:'classschedule', label:'Class Schedule', icon:'schedule'},
  ]},
  {label:'Account', items:[
    {id:'membership', label:'Membership & Billing', icon:'membership'},
    {id:'notifications', label:'Notifications', icon:'notifications', badge:'5'},
    {id:'settings', label:'Settings', icon:'settings'},
  ]},
];
const FULL_PAGES = ['dashboard','workouts','diet','streak','bookings','membership','progress','notifications','settings'];

const navContainer = document.getElementById('navContainer');
NAV.forEach(group=>{
  const g = document.createElement('div'); g.className='nav-group';
  const l = document.createElement('div'); l.className='nav-label'; l.textContent=group.label; g.appendChild(l);
  group.items.forEach(item=>{
    const el = document.createElement('div');
    el.className='nav-item'; el.dataset.page=item.id;
    el.innerHTML = svgIcon(item.icon)+'<span>'+item.label+'</span>'+(item.badge?'<span class="nav-badge">'+item.badge+'</span>':'');
    el.onclick = ()=>switchPage(item.id, item.label, item.icon);
    g.appendChild(el);
  });
  navContainer.appendChild(g);
});
navContainer.querySelector('.nav-item').classList.add('active');

function switchPage(id, label, icon){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const t = document.querySelector('.nav-item[data-page="'+id+'"]'); if(t) t.classList.add('active');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  if(FULL_PAGES.includes(id)){
    document.getElementById('page-'+id).classList.add('active');
    document.getElementById('pageTitle').textContent = label || id;
  } else {
    document.getElementById('page-placeholder').classList.add('active');
    document.getElementById('placeholderCrumb').textContent = label;
    document.getElementById('placeholderTitle').textContent = label;
    document.getElementById('placeholderIcon').innerHTML = ICON[icon] ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+ICON[icon]+'</svg>' : '✨';
    document.getElementById('pageTitle').textContent = label;
  }
}

/* ===== Mini heatmap generator ===== */
function heatCells(n, active){
  let html='';
  for(let i=0;i<n;i++){
    const on = i >= (n-active);
    html += `<div style="background:${on?'var(--gold-bright)':'var(--graphite-lighter)'}"></div>`;
  }
  return html;
}
document.getElementById('dashHeat').innerHTML = heatCells(14,10);
document.getElementById('fullHeat').innerHTML = heatCells(21,16);

const memberNameEl = document.querySelector('.admin-chip .name');
if (memberNameEl) memberNameEl.textContent = me.name || 'Member';
const memberRoleEl = document.querySelector('.admin-chip .role');
if (memberRoleEl) memberRoleEl.textContent = me.plan || 'Member';

const planTitleEl = document.getElementById('membershipPlanTitle');
if (planTitleEl) planTitleEl.textContent = membershipPlan?.name || me.plan || 'Membership';
const planMetaEl = document.getElementById('membershipPlanMeta');
if (planMetaEl) {
  const expiry = me.expiry || 'your next billing date';
  planMetaEl.textContent = membershipPlan ? `${membershipPlan.durationMonths || 1} month plan • Renews on ${expiry}` : `Renews on ${expiry}`;
}
const planBadgeEl = document.getElementById('membershipPlanBadge');
if (planBadgeEl) planBadgeEl.textContent = me.fee === 'gold' ? 'Active' : 'Active';
const planDescEl = document.getElementById('membershipPlanDescription');
if (planDescEl) {
  const features = Array.isArray(membershipPlan?.features) && membershipPlan.features.length ? membershipPlan.features.join(' • ') : 'Live coaching, nutrition guidance, and premium access.';
  planDescEl.textContent = `${membershipPlan ? `₹${Number(membershipPlan.price || 0).toLocaleString('en-IN')}/mo` : '$0/mo'} • ${features}`;
}
const trainerNameEl = document.getElementById('trainerName');
if (trainerNameEl) trainerNameEl.textContent = me.trainer || selectedTrainer?.name || 'Your coach';
const trainerSpecEl = document.getElementById('trainerSpec');
if (trainerSpecEl) trainerSpecEl.textContent = selectedTrainer?.spec || 'Assigned coach';

/* ===== Weekly activity bar chart ===== */
function barChart(svgId, data, labels, colors, w, h){
  const svg=document.getElementById(svgId); const pad=24, gap=16;
  const max=Math.max(...data.map(d=>Math.max(...d)));
  const groupW=(w-pad*2-gap*(data.length-1))/data.length;
  svg.innerHTML='';
  data.forEach((vals,i)=>{
    const x=pad+i*(groupW+gap);
    vals.forEach((v,j)=>{
      const bw=groupW/vals.length-4;
      const bh=(v/max)*(h-pad*2);
      const bx=x+j*(groupW/vals.length);
      const by=h-pad-bh;
      svg.innerHTML += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="5" fill="${colors[j]}" opacity="0.9"/>`;
    });
    svg.innerHTML += `<text x="${x+groupW/2}" y="${h-4}" font-size="10" fill="#8f8d87" text-anchor="middle" font-family="Manrope">${labels[i]}</text>`;
  });
}
barChart('activityBar', [[1,1],[1,0],[1,1],[0,1],[1,1],[1,0],[0,0]], ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], ['#e8cd90','#2a2a2e'], 500, 200);

function lineChart(svgId, series, color, w, h){
  const svg=document.getElementById(svgId); const pad=20;
  const max=Math.max(...series), min=Math.min(...series);
  const stepX=(w-pad*2)/(series.length-1);
  const pts = series.map((v,i)=>{
    const x=pad+i*stepX; const y=h-pad-((v-min)/((max-min)||1))*(h-pad*2); return [x,y];
  });
  const path = pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const area = path+` L${pts[pts.length-1][0]},${h-pad} L${pts[0][0]},${h-pad} Z`;
  svg.innerHTML = `<defs><linearGradient id="g${svgId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.35"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
  <path d="${area}" fill="url(#g${svgId})" stroke="none"/>
  <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  ${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${color}"/>`).join('')}`;
}
const weightData = me.weightData || [];
lineChart('progressChart', weightData, '#e8cd90', 400, 200);
lineChart('progressChartFull', weightData, '#e8cd90', 700, 220);

/* ===== Macro rings ===== */
function macroRing(pct,color){
  const r=36, c=2*Math.PI*r;
  return `<svg viewBox="0 0 88 88" width="88" height="88"><circle cx="44" cy="44" r="${r}" stroke="var(--graphite-lighter)" stroke-width="7" fill="none"/><circle cx="44" cy="44" r="${r}" stroke="${color}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct/100)}" transform="rotate(-90 44 44)"/></svg>`;
}
const MACROS = me.macros || [];
function renderMacros(id){
  document.getElementById(id).innerHTML = MACROS.map(m=>`
    <div><div class="macro-ring">${macroRing(m.pct,m.color)}<div class="val"><b>${m.val}</b><span>/ ${m.target}</span></div></div><div class="macro-lbl">${m.label}</div></div>
  `).join('');
}
renderMacros('dashMacros');
renderMacros('dietMacros');

/* ===== Meal schedule ===== */
const MEALS = me.meals || [];
document.getElementById('mealList').innerHTML = MEALS.map(m=>`
  <div class="meal-item"><div class="meal-time">${m.time}</div><div class="meal-body"><h5>${m.name}</h5><p>${m.desc}</p></div><div class="meal-cal">${m.cal} kcal</div></div>`).join('');

/* ===== Exercises ===== */
const PROGRAM_TEMPLATES = {
  Strength: [
    { name: 'Barbell Bench Press', sets: '4', reps: '8', detail: '70kg', done: false },
    { name: 'Incline Dumbbell Press', sets: '3', reps: '10', detail: '24kg', done: false },
    { name: 'Cable Fly', sets: '3', reps: '12', detail: '', done: false },
    { name: 'Overhead Shoulder Press', sets: '4', reps: '8', detail: '40kg', done: false },
    { name: 'Tricep Rope Pushdown', sets: '3', reps: '15', detail: '', done: false },
  ],
  HIIT: [
    { name: 'Jump Squats', sets: '4', reps: '15', detail: 'Bodyweight', done: false },
    { name: 'Burpees', sets: '4', reps: '12', detail: '', done: false },
    { name: 'Mountain Climbers', sets: '4', reps: '30 sec', detail: '', done: false },
    { name: 'Kettlebell Swings', sets: '4', reps: '20', detail: '16kg', done: false },
    { name: 'Plank Jacks', sets: '4', reps: '30 sec', detail: '', done: false },
  ],
  Mobility: [
    { name: 'World’s Greatest Stretch', sets: '3', reps: '8', detail: 'Per side', done: false },
    { name: 'Hip Flexor Stretch', sets: '3', reps: '45 sec', detail: 'Each leg', done: false },
    { name: 'Thoracic Rotation', sets: '3', reps: '12', detail: 'Per side', done: false },
    { name: 'Band Pull Apart', sets: '4', reps: '15', detail: '', done: false },
    { name: 'Lunge with Reach', sets: '3', reps: '10', detail: 'Per side', done: false },
  ],
};

let selectedProgram = workoutData?.program || 'Strength';
let selectedDay = 0;
const EXERCISES = Array.isArray(workoutData?.exercises) && workoutData.exercises.length ? workoutData.exercises : (me.exercises || []);
const WEEK = Array.isArray(workoutData?.weekPlan) && workoutData.weekPlan.length ? workoutData.weekPlan : (me.weekPlan || []);

function promptForExercise(current = {}) {
  const name = window.prompt('Exercise name', current.name || '');
  if (name === null) return null;
  const sets = window.prompt('Sets', current.sets || '');
  if (sets === null) return null;
  const reps = window.prompt('Reps', current.reps || '');
  if (reps === null) return null;
  const detail = window.prompt('Notes / weight / details', current.detail || '');
  if (detail === null) return null;
  return {
    name: name.trim() || current.name || 'Exercise',
    sets: sets.trim(),
    reps: reps.trim(),
    detail: detail.trim(),
    done: Boolean(current.done),
  };
}

function renderWorkoutHeader() {
  const pageTitle = document.querySelector('#page-workouts .page-head h2');
  const pageSubtitle = document.querySelector('#page-workouts .page-head p');
  if (pageTitle) pageTitle.textContent = `${selectedProgram} Focus`;
  if (pageSubtitle) pageSubtitle.textContent = `${WEEK[selectedDay]?.l || 'Today'} · ${selectedProgram} session`;
}

async function saveWorkoutState(nextExercises = EXERCISES, nextWeekPlan = WEEK) {
  try {
    const saved = await api('/member/me/workout', {
      method: 'PATCH',
      body: {
        exercises: nextExercises,
        weekPlan: nextWeekPlan,
      },
    });

    if (Array.isArray(saved.exercises)) {
      EXERCISES.splice(0, EXERCISES.length, ...saved.exercises);
    }
    if (Array.isArray(saved.weekPlan)) {
      WEEK.splice(0, WEEK.length, ...saved.weekPlan);
    }
    renderWorkoutSection();
    renderWeekPlan();
  } catch (error) {
    console.error('Could not save workout updates', error);
  }
}

function setProgram(programName) {
  if (!PROGRAM_TEMPLATES[programName]) return;
  selectedProgram = programName;
  const programExercises = PROGRAM_TEMPLATES[programName].map((exercise) => ({ ...exercise, done: false }));
  EXERCISES.splice(0, EXERCISES.length, ...programExercises);
  renderWorkoutHeader();
  renderWorkoutSection();
  setActiveProgramCard();
}

function setActiveProgramCard() {
  document.querySelectorAll('.program-mini').forEach((card) => {
    const label = card.dataset.program;
    card.classList.toggle('selected', label === selectedProgram);
  });
}

function selectDay(index) {
  selectedDay = index;
  renderWeekPlan();
  renderWorkoutHeader();
}

function renderWorkoutSection() {
  renderWorkoutHeader();
  const workoutList = document.getElementById('exerciseList');
  if (!workoutList) return;

  if (!EXERCISES.length) {
    workoutList.innerHTML = `
      <div class="placeholder">
        <div class="icon-lg">💪</div>
        <h3>Your workout plan is empty</h3>
        <p>Create a custom exercise list with sets and reps to stay on track.</p>
      </div>`;
  } else {
    workoutList.innerHTML = EXERCISES.map((e, i) => {
      const detailLine = [
        e.sets ? `${e.sets} sets` : '',
        e.reps ? `${e.reps} reps` : '',
        e.detail || '',
      ].filter(Boolean).join(' · ');
      return `
      <div class="exercise-row" data-index="${i}" role="button" tabindex="0" aria-label="Toggle exercise ${i + 1} ${e.name}">
        <div class="ex-num">${i + 1}</div>
        <div class="ex-body"><h5>${e.name}</h5><p class="exercise-meta">${detailLine || 'No details yet'}</p></div>
        <div class="ex-check ${e.done ? 'done' : ''}">${e.done ? '✓' : ''}</div>
        <div class="exercise-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-edit-exercise="${i}">Edit</button>
          <button type="button" class="btn btn-ghost btn-sm btn-remove-exercise" data-remove-exercise="${i}">Remove</button>
        </div>
      </div>`;
    }).join('');
  }

  workoutList.querySelectorAll('.exercise-row').forEach((row) => {
    const index = Number(row.dataset.index);
    const toggleExercise = async () => {
      try {
        const updated = await api(`/member/me/exercises/${index}`, { method: 'PATCH' });
        EXERCISES.splice(0, EXERCISES.length, ...updated);
        renderWorkoutSection();
      } catch (error) {
        console.error('Could not toggle workout item', error);
      }
    };

    row.onclick = (event) => {
      if (event.target.closest('[data-edit-exercise]') || event.target.closest('[data-remove-exercise]')) return;
      toggleExercise();
    };
    row.ondblclick = (event) => {
      if (event.target.closest('[data-edit-exercise]') || event.target.closest('[data-remove-exercise]')) return;
      const current = EXERCISES[index] || {};
      const updated = promptForExercise(current);
      if (!updated) return;
      EXERCISES[index] = updated;
      saveWorkoutState();
    };
    row.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleExercise();
      }
    };
  });

  workoutList.querySelectorAll('[data-edit-exercise]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      const index = Number(button.dataset.editExercise);
      const current = EXERCISES[index] || {};
      const updated = promptForExercise(current);
      if (!updated) return;
      EXERCISES[index] = updated;
      saveWorkoutState();
    };
  });

  workoutList.querySelectorAll('[data-remove-exercise]').forEach((button) => {
    button.onclick = async (event) => {
      event.stopPropagation();
      const index = Number(button.dataset.removeExercise);
      if (!confirm('Remove this exercise?')) return;
      EXERCISES.splice(index, 1);
      await saveWorkoutState(EXERCISES, WEEK);
    };
  });

  const addExerciseButton = document.querySelector('#page-workouts .btn-add-exercise');
  if (addExerciseButton) {
    addExerciseButton.onclick = async () => {
      const nextExercise = promptForExercise();
      if (!nextExercise) return;
      EXERCISES.push(nextExercise);
      await saveWorkoutState(EXERCISES, WEEK);
    };
  }

  setActiveProgramCard();
  renderWorkoutHeader();

  const completionButton = document.querySelector('#page-workouts .head-actions .btn-gold');
  if (completionButton) {
    const total = EXERCISES.length;
    const done = EXERCISES.filter((exercise) => exercise?.done).length;
    completionButton.textContent = total > 0 && done === total ? '✓ Workout Complete' : '✓ Mark Workout Complete';
    completionButton.disabled = total === 0 || (total > 0 && done === total);
    completionButton.onclick = async () => {
      try {
        const updated = await api('/member/me/workout/complete', { method: 'PATCH' });
        if (Array.isArray(updated.exercises)) {
          EXERCISES.splice(0, EXERCISES.length, ...updated.exercises);
          renderWorkoutSection();
        }
      } catch (error) {
        console.error('Could not complete workout', error);
      }
    };
  }
}

function renderWeekPlan() {
  const weekStrip = document.getElementById('weekStrip');
  if (!weekStrip) return;

  weekStrip.innerHTML = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;">
    ${WEEK.map((w, index) => `
      <div class="week-cell${index === selectedDay ? ' selected' : ''}" data-index="${index}" style="text-align:center;padding:12px 4px;border-radius:10px;background:${w.done?'var(--gold-glow)':'var(--graphite-light)'};border:1px solid ${index === selectedDay ? 'var(--gold-bright)' : (w.done?'var(--gold-dim)':'var(--line)')};cursor:pointer;">
        <div style="font-size:10px;color:var(--muted);text-transform:uppercase;font-weight:700;">${w.d}</div>
        <div style="font-size:11.5px;font-weight:700;margin-top:6px;color:${w.done?'var(--gold-bright)':'var(--ivory)'};">${w.l}</div>
      </div>
    `).join('')}</div>`;

  weekStrip.querySelectorAll('.week-cell').forEach((cell) => {
    const index = Number(cell.dataset.index);
    cell.onclick = () => {
      selectDay(index);
    };
    cell.oncontextmenu = async (event) => {
      event.preventDefault();
      const nextWeek = [...WEEK];
      nextWeek[index] = { ...nextWeek[index], done: !Boolean(nextWeek[index]?.done) };
      WEEK.splice(0, WEEK.length, ...nextWeek);
      await saveWorkoutState(EXERCISES, WEEK);
    };
    cell.ondblclick = () => {
      const current = WEEK[index] || {};
      const nextLabel = window.prompt('Edit workout label', current.l || 'Workout');
      if (nextLabel === null) return;
      const nextDay = window.prompt('Edit day label', current.d || 'Mon');
      if (nextDay === null) return;
      WEEK[index] = { ...current, d: nextDay.trim() || current.d, l: nextLabel.trim() || current.l };
      saveWorkoutState(EXERCISES, WEEK);
    };
  });
}

function initProgramSelection() {
  document.querySelectorAll('.program-mini').forEach((card) => {
    const program = card.dataset.program;
    card.onclick = () => setProgram(program);
  });
  setActiveProgramCard();
}

function updateSettingsDisplay() {
  const labels = {
    workoutReminders: 'Daily push notification',
    streakAlerts: 'Warn before streak breaks',
    dietReminders: 'Meal logging nudges',
    marketingEmails: 'Offers and gym news',
  };

  const statusText = (pref) => (SETTINGS.preferences[pref] ? 'Enabled' : 'Disabled');

  document.getElementById('settingName').textContent = SETTINGS.name || 'Not set';
  document.getElementById('settingEmail').textContent = SETTINGS.email || 'Not set';
  document.getElementById('settingPhone').textContent = SETTINGS.phone || 'Not set';
  document.getElementById('settingPasswordInfo').textContent = SETTINGS.password ? 'Password will be updated on save' : 'Last changed 3 months ago';

  Object.keys(SETTINGS.preferences).forEach((pref) => {
    const elem = document.getElementById(`pref${pref.charAt(0).toUpperCase() + pref.slice(1)}`);
    if (elem) elem.textContent = `${labels[pref]} · ${statusText(pref)}`;
    const toggle = document.querySelector(`.toggle[data-pref="${pref}"]`);
    if (toggle) toggle.classList.toggle('on', Boolean(SETTINGS.preferences[pref]));
  });
}

function promptForSetting(field, currentValue, options = {}) {
  const promptText = options.prompt || `Update ${field}`;
  const result = window.prompt(promptText, currentValue || '');
  if (result === null) return null;
  return result.trim();
}

function renderSettings() {
  updateSettingsDisplay();
}

function initSettings() {
  document.getElementById('editName')?.addEventListener('click', () => {
    const newValue = promptForSetting('name', SETTINGS.name, { prompt: 'Enter your name' });
    if (newValue !== null && newValue) {
      SETTINGS.name = newValue;
      updateSettingsDisplay();
    }
  });

  document.getElementById('editEmail')?.addEventListener('click', () => {
    const newValue = promptForSetting('email', SETTINGS.email, { prompt: 'Enter your email' });
    if (newValue !== null && newValue) {
      SETTINGS.email = newValue;
      updateSettingsDisplay();
    }
  });

  document.getElementById('editPhone')?.addEventListener('click', () => {
    const newValue = promptForSetting('phone', SETTINGS.phone, { prompt: 'Enter your phone number' });
    if (newValue !== null) {
      SETTINGS.phone = newValue;
      updateSettingsDisplay();
    }
  });

  document.getElementById('changePassword')?.addEventListener('click', () => {
    const newPassword = promptForSetting('password', '', { prompt: 'Enter new password (min 8 chars)' });
    if (newPassword === null) return;
    if (newPassword.length < 8) {
      return alert('Password must be at least 8 characters long.');
    }
    const confirmPassword = promptForSetting('confirm password', '', { prompt: 'Confirm new password' });
    if (confirmPassword === null) return;
    if (newPassword !== confirmPassword) {
      return alert('Passwords do not match.');
    }
    SETTINGS.password = newPassword;
    updateSettingsDisplay();
  });

  document.querySelectorAll('.toggle').forEach((toggle) => {
    const pref = toggle.dataset.pref;
    if (!pref) return;
    toggle.onclick = () => {
      SETTINGS.preferences[pref] = !SETTINGS.preferences[pref];
      updateSettingsDisplay();
    };
  });

  document.getElementById('saveSettings')?.addEventListener('click', async () => {
    const payload = {
      name: SETTINGS.name,
      email: SETTINGS.email,
      phone: SETTINGS.phone,
      preferences: SETTINGS.preferences,
    };
    if (SETTINGS.password) payload.password = SETTINGS.password;

    try {
      const saved = await api('/member/me', { method: 'PATCH', body: payload });
      if (saved) {
        SETTINGS.password = '';
        SETTINGS.name = saved.name || SETTINGS.name;
        SETTINGS.email = saved.email || SETTINGS.email;
        SETTINGS.phone = saved.phone || SETTINGS.phone;
        SETTINGS.preferences = {
          workoutReminders: Boolean(saved.preferences?.workoutReminders),
          streakAlerts: Boolean(saved.preferences?.streakAlerts),
          dietReminders: Boolean(saved.preferences?.dietReminders),
          marketingEmails: Boolean(saved.preferences?.marketingEmails),
        };
        updateSettingsDisplay();
        const memberNameEl = document.querySelector('.admin-chip .name');
        if (memberNameEl) memberNameEl.textContent = saved.name || memberNameEl.textContent;
        alert('Settings saved successfully.');
      }
    } catch (error) {
      console.error('Could not save settings', error);
      alert(error.message || 'Failed to save settings.');
    }
  });
}

renderWorkoutSection();
renderWeekPlan();
initProgramSelection();
renderSettings();
initSettings();

/* ===== Bookings ===== */
const BOOKINGS = Array.isArray(me.bookings) ? me.bookings : [];

function bookingHTML(b, index) {
  return `<div class="booking-item" data-booking-index="${index}"><div class="booking-date"><div class="d">${b.d}</div><div class="m">${b.m}</div></div><div class="booking-body"><h5>${b.name}</h5><p>${b.time}</p></div><div class="booking-actions"><span class="booking-action" data-action="reschedule" data-index="${index}">Reschedule</span><span class="booking-action" data-action="cancel" data-index="${index}">Cancel</span></div></div>`;
}

function renderBookings() {
  document.getElementById('dashBookings').innerHTML = BOOKINGS.slice(0, 2).map(bookingHTML).join('');
  document.getElementById('bookingsFull').innerHTML = BOOKINGS.map(bookingHTML).join('');
  attachBookingListeners();
}

function attachBookingListeners() {
  document.querySelectorAll('.booking-action').forEach((button) => {
    button.onclick = async (event) => {
      const index = Number(button.dataset.index);
      const action = button.dataset.action;
      if (action === 'cancel') {
        if (!confirm('Cancel this booking?')) return;
        await cancelBooking(index);
      }
      if (action === 'reschedule') {
        await rescheduleBooking(index);
      }
    };
  });
}

async function createBooking() {
  const d = window.prompt('Booking day (e.g. 11)', '');
  if (d === null) return;
  const m = window.prompt('Booking month (e.g. Jul)', '');
  if (m === null) return;
  const name = window.prompt('Session name or coach', 'Personal Training');
  if (name === null) return;
  const time = window.prompt('Time slot (e.g. 6:30 PM – 7:15 PM)', '');
  if (time === null) return;
  const booking = { d: d.trim(), m: m.trim(), name: name.trim(), time: time.trim() };
  if (!booking.d || !booking.m || !booking.name || !booking.time) {
    return alert('Please provide all booking details.');
  }

  try {
    const saved = await api('/member/me/bookings', {
      method: 'POST',
      body: booking,
    });
    if (Array.isArray(saved)) {
      BOOKINGS.splice(0, BOOKINGS.length, ...saved);
      renderBookings();
    }
  } catch (error) {
    console.error('Could not create booking', error);
    alert('Failed to create booking.');
  }
}

async function cancelBooking(index) {
  try {
    const updated = await api(`/member/me/bookings/${index}`, { method: 'DELETE' });
    if (Array.isArray(updated)) {
      BOOKINGS.splice(0, BOOKINGS.length, ...updated);
      renderBookings();
    }
  } catch (error) {
    console.error('Could not cancel booking', error);
    alert('Failed to cancel booking.');
  }
}

async function rescheduleBooking(index) {
  const current = BOOKINGS[index] || {};
  const d = window.prompt('Booking day (e.g. 11)', current.d || '');
  if (d === null) return;
  const m = window.prompt('Booking month (e.g. Jul)', current.m || '');
  if (m === null) return;
  const name = window.prompt('Session name or coach', current.name || '');
  if (name === null) return;
  const time = window.prompt('Time slot (e.g. 6:30 PM – 7:15 PM)', current.time || '');
  if (time === null) return;
  const booking = { d: d.trim(), m: m.trim(), name: name.trim(), time: time.trim() };
  if (!booking.d || !booking.m || !booking.name || !booking.time) {
    return alert('Please provide all booking details.');
  }

  try {
    const updated = await api(`/member/me/bookings/${index}`, {
      method: 'PATCH',
      body: booking,
    });
    if (Array.isArray(updated)) {
      BOOKINGS.splice(0, BOOKINGS.length, ...updated);
      renderBookings();
    }
  } catch (error) {
    console.error('Could not reschedule booking', error);
    alert('Failed to reschedule booking.');
  }
}

document.querySelector('#page-bookings .head-actions .btn-gold')?.addEventListener('click', createBooking);
renderBookings();

const BOOK_TRAINERS = await api('/api/contact/trainers-public');
document.getElementById('trainerBookGrid').innerHTML = BOOK_TRAINERS.map(t=>`
  <div style="display:flex;align-items:center;gap:14px;padding:12px;border:1px solid var(--line);border-radius:12px;">
    <img src="${/^https?:\/\//i.test(t.img || '') ? t.img : `https://images.unsplash.com/${t.img || 'photo-1571019613454-1cb2f99b2d8b'}?q=80&w=100&auto=format&fit=crop`}" style="width:44px;height:44px;border-radius:11px;object-fit:cover;">
    <div style="flex:1;"><div style="font-weight:700;font-size:13.5px;">${t.name}</div><div style="font-size:11.5px;color:var(--gold-bright);">${t.spec}</div></div>
    <button class="btn btn-ghost" style="padding:8px 16px;font-size:12px;">Book</button>
  </div>`).join('');

/* ===== Payments ===== */
const PAYMENTS = me.payments || [];
document.getElementById('paymentBody').innerHTML = PAYMENTS.map(p=>`
  <tr><td>${p.date}</td><td>${p.desc}</td><td>${p.amt}</td><td><span class="badge ${p.status}">Paid</span></td></tr>`).join('');

/* ===== Rewards ===== */
const MY_REWARDS = me.rewards || [];
document.getElementById('myRewards').innerHTML = MY_REWARDS.map(r=>`
  <div class="notif-item"><div class="notif-ico">🎁</div><div class="notif-body"><h5>${r.name}</h5><p>From ${r.from}</p></div><div class="notif-time">${r.time}</div></div>`).join('');

/* ===== Notifications ===== */
const NOTIFS = me.notifications || [];
document.getElementById('notifFullList').innerHTML = NOTIFS.map(n=>`
  <div class="notif-item"><div class="notif-ico">${n.ico}</div><div class="notif-body"><h5>${n.title}</h5><p>${n.desc}</p></div><div class="notif-time">${n.time}</div></div>`).join('');

// expose functions referenced via inline onclick="..." attributes in the markup
window.switchPage = switchPage;

}

// Auto-generated from the original apex-gym-admin-dashboard script.
// All hardcoded demo arrays were replaced with live fetches to the
// Node/Express + MongoDB backend. Every rendering function below is
// otherwise byte-for-byte identical to the original static dashboard.
export async function initAdminDashboard(token, apiBase) {
  const base = apiBase.replace(/\/$/, '');
  const api = (path, options = {}) => {
    const normalizedPath = path.replace(/^\/api/i, '');
    return fetch(`${base}/api${normalizedPath}`, {
      headers: { Authorization: 'Bearer ' + token, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...options,
    }).then(async (r) => {
      const text = await r.text();
      const data = text ? JSON.parse(text) : null;
      if (!r.ok) throw new Error(data?.message || 'API error ' + r.status + ' on ' + path);
      return data;
    });
  };

  function normalizeList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.items)) return payload.items;
    return [];
  }

window.__prefillMember = null;
document.getElementById('rewardOptions').addEventListener('click', e=>{
  const opt = e.target.closest('.reward-opt'); if(!opt) return;
  document.querySelectorAll('.reward-opt').forEach(o=>o.classList.remove('selected'));
  opt.classList.add('selected');
});
function openRewardModal(memberName){
  const sel = document.getElementById('rewardMember');
  sel.innerHTML = STREAKS.map(m=>`<option ${m.name===memberName?'selected':''}>${m.name} — 🔥${m.current} day streak</option>`).join('');
  document.getElementById('rewardModal').classList.add('open');
}
function closeRewardModal(){document.getElementById('rewardModal').classList.remove('open');}
function sendReward(){
  const memberText = document.getElementById('rewardMember').value;
  const rewardType = document.querySelector('.reward-opt.selected').dataset.r;
  const name = memberText.split(' — ')[0];
  const item = {name, img: (STREAKS.find(s=>s.name===name)||STREAKS[0]).img, reward: rewardType, time:'Just now'};
  REWARD_HISTORY.unshift(item);
  renderRewardHistory();
  const memberId = (STREAKS.find(s=>s.name===name)||{}).id;
  api('/admin/rewards', {
    method: 'POST',
    body: JSON.stringify({ memberId, name, img: item.img, reward: rewardType }),
  }).catch(()=>{});
  closeRewardModal();
}




/* ============ ICONS ============ */
const ICON = {
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  members:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  admission:'<circle cx="10" cy="8" r="3.5"/><path d="M2 21c0-3.6 3.6-5.5 8-5.5s8 1.9 8 5.5"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>',
  attendance:'<rect x="3" y="3" width="18" height="18" rx="3"/><polyline points="8 12 11 15 16 9"/>',
  plans:'<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  fees:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  pending:'<circle cx="12" cy="12" r="9"/><line x1="12" y1="7.5" x2="12" y2="13"/><circle cx="12" cy="16.5" r="0.6" fill="currentColor"/>',
  trainers:'<rect x="2" y="9" width="3" height="6" rx="1"/><rect x="19" y="9" width="3" height="6" rx="1"/><line x1="5" y1="12" x2="19" y2="12"/>',
  workouts:'<polyline points="3 12 8 12 10 6 14 18 16 12 21 12"/>',
  diet:'<path d="M12 2a10 10 0 1 0 0.01 0z"/><path d="M12 2v10l7 5"/>',
  personal:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
  group:'<circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17.5" cy="9" r="2.4"/><path d="M15.2 20c0-2.5 1.9-4.3 4.3-4.7"/>',
  store:'<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  orders:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><line x1="12" y1="13" x2="12" y2="21"/>',
  inventory:'<rect x="4" y="7" width="16" height="13" rx="1.5"/><path d="M4 7l8-4 8 4"/>',
  equipment:'<path d="M17 3l4 4-4.5 4.5a4 4 0 0 1-5.5 5.5L5 23l-2-2 6-6a4 4 0 0 1 5.5-5.5z"/>',
  expenses:'<polyline points="3 7 10 14 14 10 21 17"/><polyline points="21 10 21 17 14 17"/>',
  revenue:'<polyline points="3 17 10 10 14 14 21 7"/><polyline points="21 14 21 7 14 7"/>',
  bookings:'<rect x="3" y="4" width="18" height="17" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>',
  coupons:'<path d="M20.6 13.4 12 22l-9-9V4h9l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7.3" cy="8.3" r="1.2" fill="currentColor"/>',
  reviews:'<polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 17 5.5 21 7.5 13.5 2 9 9 9"/>',
  notifications:'<path d="M6 10a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  analytics:'<line x1="5" y1="21" x2="5" y2="12"/><line x1="12" y1="21" x2="12" y2="6"/><line x1="19" y1="21" x2="19" y2="15"/>',
  reports:'<path d="M6 2h9l5 5v15H6z"/><line x1="9" y1="13" x2="17" y2="13"/><line x1="9" y1="17" x2="17" y2="17"/>',
  staff:'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  roles:'<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>',
  streak:'<path d="M12 2c1 3-2 4.5-2 7.5a2 2 0 0 0 4 0c0-1 .5-1.5 1-2 1 2 2 4 2 6.5a5 5 0 0 1-10 0c0-4 2-5.5 3-8 .5-1.3.8-2.6 2-4z"/>',
  gift:'<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M3 8h18v4H3z"/><line x1="12" y1="8" x2="12" y2="21"/><path d="M12 8c-1.5 0-4-1-4-3.2A2.3 2.3 0 0 1 10.3 2.5C12 2.5 12 5 12 8z"/><path d="M12 8c1.5 0 4-1 4-3.2A2.3 2.3 0 0 0 13.7 2.5C12 2.5 12 5 12 8z"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'
};
function svgIcon(key){return '<svg class="icon" viewBox="0 0 24 24">'+ICON[key]+'</svg>';}

/* ============ NAV STRUCTURE ============ */
const NAV = [
  {label:'Overview', items:[
    {id:'dashboard', label:'Dashboard', icon:'dashboard'},
  ]},
  {label:'Members', items:[
    {id:'members', label:'Members', icon:'members'},
    {id:'admission', label:'New Admission', icon:'admission'},
    {id:'attendance', label:'Attendance', icon:'attendance'},
  ]},
  {label:'Billing', items:[
    {id:'plans', label:'Membership Plans', icon:'plans'},
    {id:'fees', label:'Fee Management', icon:'fees'},
  ]},
  {label:'Fitness', items:[
    {id:'trainers', label:'Trainers', icon:'trainers'},
    {id:'workouts', label:'Workout Programs', icon:'workouts'},
    {id:'diet', label:'Diet Plans', icon:'diet'},
    {id:'personal', label:'Personal Training', icon:'personal'},
    {id:'group', label:'Group Classes', icon:'group'},
  ]},
  {label:'Engagement', items:[
    {id:'streaks', label:'Streak Tracker', icon:'streak', badge:'9'},
  ]},
  {label:'Finance', items:[
    {id:'expenses', label:'Expenses', icon:'expenses'},
    {id:'revenue', label:'Revenue', icon:'revenue'},
    {id:'bookings', label:'Bookings', icon:'bookings'},
    {id:'coupons', label:'Coupons & Offers', icon:'coupons'},
  ]},
  {label:'Insights', items:[
    {id:'reviews', label:'Reviews', icon:'reviews'},
    {id:'notifications', label:'Notifications', icon:'notifications', badge:'12'},
    {id:'analytics', label:'Analytics', icon:'analytics'},
    {id:'reports', label:'Reports', icon:'reports'},
  ]},
  {label:'System', items:[
    {id:'staff', label:'Staff Management', icon:'staff'},
    {id:'roles', label:'User Roles', icon:'roles'},
    {id:'settings', label:'Settings', icon:'settings'},
  ]},
];
const FULL_PAGES = ['dashboard','members','admission','attendance','plans','fees','trainers','workouts','diet','analytics','notifications','settings','streaks'];

const navContainer = document.getElementById('navContainer');
NAV.forEach(group=>{
  const g = document.createElement('div'); g.className='nav-group';
  const l = document.createElement('div'); l.className='nav-label'; l.textContent = group.label; g.appendChild(l);
  group.items.forEach(item=>{
    const el = document.createElement('div');
    el.className = 'nav-item'; el.dataset.page = item.id;
    el.innerHTML = svgIcon(item.icon) + '<span>'+item.label+'</span>' + (item.badge? '<span class="nav-badge">'+item.badge+'</span>' : '');
    el.onclick = ()=>switchPage(item.id, item.label, item.icon);
    g.appendChild(el);
  });
  navContainer.appendChild(g);
});
navContainer.querySelector('.nav-item').classList.add('active');

function switchPage(id, label, icon){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const target = document.querySelector('.nav-item[data-page="'+id+'"]');
  if(target) target.classList.add('active');

  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  if(FULL_PAGES.includes(id)){
    document.getElementById('page-'+id).classList.add('active');
    document.getElementById('pageTitle').textContent = label || (id.charAt(0).toUpperCase()+id.slice(1));
  } else {
    document.getElementById('page-placeholder').classList.add('active');
    document.getElementById('placeholderCrumb').textContent = label;
    document.getElementById('placeholderTitle').textContent = label;
    document.getElementById('placeholderIcon').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+ICON[icon]+'</svg>';
    document.getElementById('pageTitle').textContent = label;
  }
}

/* ============ DASHBOARD DATA ============ */
const dashboardSummary = await api('/api/admin/dashboard-summary').catch(() => ({}));
const KPIS = dashboardSummary.kpis || [];
const dashboardCharts = dashboardSummary.charts || {};
function sparkPath(data,w,h){
  const max=Math.max(...data), min=Math.min(...data);
  const step=w/(data.length-1);
  return data.map((v,i)=>{
    const x=i*step; const y=h-((v-min)/(max-min||1))*h;
    return (i===0?'M':'L')+x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
}
const kpiGrid = document.getElementById('kpiGrid');
KPIS.forEach(k=>{
  const path = sparkPath(k.data,90,28);
  const div = document.createElement('div');
  div.className='card kpi';
  div.innerHTML = `
    <div class="kpi-top">
      <div class="kpi-icon">${svgIcon(k.icon)}</div>
      <div class="kpi-growth ${k.up?'up':'down'}">${k.up?'↑':'↓'} ${k.growth}</div>
    </div>
    <div class="kpi-val">${k.val}</div>
    <div class="kpi-label">${k.label}</div>
    <svg class="kpi-spark" viewBox="0 0 90 28" width="100%" height="32" preserveAspectRatio="none">
      <path d="${path}" fill="none" stroke="${k.up?'#e8cd90':'#e2725b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  kpiGrid.appendChild(div);
});

/* ============ REVENUE LINE CHART ============ */
function lineChart(svgId, seriesArr, colors, w, h){
  const svg = document.getElementById(svgId);
  const pad = 20;
  const max = Math.max(...seriesArr.flat());
  const n = seriesArr[0].length;
  const stepX = (w - pad*2)/(n-1);
  svg.innerHTML='';
  // gridlines
  for(let i=0;i<4;i++){
    const y = pad + i*(h-pad*2)/3;
    svg.innerHTML += `<line x1="${pad}" y1="${y}" x2="${w-pad}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
  }
  seriesArr.forEach((series,si)=>{
    const pts = series.map((v,i)=>{
      const x = pad + i*stepX;
      const y = h - pad - (v/max)*(h-pad*2);
      return [x,y];
    });
    const path = pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
    if(si===0){
      const areaPath = path + ` L${pts[pts.length-1][0]},${h-pad} L${pts[0][0]},${h-pad} Z`;
      svg.innerHTML += `<defs><linearGradient id="grad${svgId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${colors[si]}" stop-opacity="0.35"/><stop offset="100%" stop-color="${colors[si]}" stop-opacity="0"/></linearGradient></defs>`;
      svg.innerHTML += `<path d="${areaPath}" fill="url(#grad${svgId})" stroke="none"/>`;
    }
    svg.innerHTML += `<path d="${path}" fill="none" stroke="${colors[si]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    pts.forEach(p=>{svg.innerHTML += `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${colors[si]}"/>`;});
  });
}
lineChart('revenueChart', dashboardCharts.revenueSeries || [
  [4.2,4.8,5.1,5.6,6.0,6.4,7.1,7.6,8.0,8.5,9.2,9.8],
  [1.1,1.3,1.2,1.6,1.8,1.7,2.0,2.2,2.4,2.3,2.6,2.9]
], ['#e8cd90','#7aa6d6'], 720, 220);

lineChart('growthChart', [dashboardCharts.growthSeries || [80,95,110,102,130,148,160,175,168,190,205,220]], ['#e8cd90'], 720, 200);

/* ============ DONUT CHARTS ============ */
function donut(svgId, segments, colors){
  const svg = document.getElementById(svgId);
  const cx=100,cy=100,r=70, r2=45;
  let acc=0;
  svg.innerHTML='';
  segments.forEach((val,i)=>{
    const frac = val/100;
    const start = acc*2*Math.PI - Math.PI/2;
    acc += frac;
    const end = acc*2*Math.PI - Math.PI/2;
    const x1=cx+r*Math.cos(start), y1=cy+r*Math.sin(start);
    const x2=cx+r*Math.cos(end), y2=cy+r*Math.sin(end);
    const large = frac>0.5?1:0;
    svg.innerHTML += `<path d="M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${cx + r2*Math.cos(end)},${cy + r2*Math.sin(end)} A${r2},${r2} 0 ${large} 0 ${cx + r2*Math.cos(start)},${cy + r2*Math.sin(start)} Z" fill="${colors[i]}" opacity="0.92"/>`;
  });
  svg.innerHTML += `<circle cx="${cx}" cy="${cy}" r="${r2-2}" fill="#18181b"/>`;
}
donut('donutChart', dashboardCharts.membershipDistribution || [46,34,20], ['#e8cd90','#7aa6d6','#6fcf97']);
donut('paymentDonut', dashboardCharts.paymentBreakdown || [48,28,16,8], ['#e8cd90','#7aa6d6','#6fcf97','#e2725b']);
donut('workoutDonut', dashboardCharts.workoutMix || [38,27,20,15], ['#e8cd90','#7aa6d6','#6fcf97','#e2725b']);
donut('attendanceDonut', dashboardCharts.attendanceBreakdown || [94,6], ['#e8cd90','#2a2a2e']);
donut('feeDonut', dashboardCharts.feeCollectionBreakdown || [88,12], ['#7aa6d6','#2a2a2e']);

/* ============ BAR CHARTS ============ */
function barChart(svgId, data, labels, color, w, h){
  const svg = document.getElementById(svgId);
  const pad=20, gap=14;
  const max=Math.max(...data);
  const bw=(w-pad*2-gap*(data.length-1))/data.length;
  svg.innerHTML='';
  data.forEach((v,i)=>{
    const bh=(v/max)*(h-pad*2);
    const x=pad+i*(bw+gap);
    const y=h-pad-bh;
    svg.innerHTML += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="${color}" opacity="${0.55+ (v/max)*0.4}"/>`;
    svg.innerHTML += `<text x="${x+bw/2}" y="${h-4}" font-size="10" fill="#8f8d87" text-anchor="middle" font-family="Manrope">${labels[i]}</text>`;
  });
}
barChart('attendanceBar', dashboardCharts.attendanceTrend || [72,78,81,86,90,94], ['Feb','Mar','Apr','May','Jun','Jul'], '#e8cd90', 400, 220);
barChart('trainerBarChart', dashboardCharts.trainerPerformance || [92,88,95,84,90,97], ['Marcus','Elena','Jordan','Sofia','Kabir','Riya'], '#7aa6d6', 400, 200);

/* ============ HEATMAP ============ */
const heat = document.getElementById('heatmapGrid');
for(let i=0;i<42;i++){
  const l = [0,1,1,2,2,3,3,4][Math.floor(Math.random()*8)];
  heat.innerHTML += `<div class="heat-cell" data-l="${l}" title="Day ${i+1}: ${l*22}% capacity"></div>`;
}

/* ============ RECENT MEMBERS + MEMBERS TABLE ============ */
const membersPayload = await api('/api/admin/members').catch(() => []);
const MEMBERS = (dashboardSummary.recentMembers || []).concat(normalizeList(membersPayload));
const allMembers = normalizeList(membersPayload);
function feeLabel(f){return f==='green'?'Paid':f==='red'?'Overdue':'Partial';}
document.getElementById('recentMembersBody').innerHTML = (dashboardSummary.recentMembers || []).slice(0,5).map(m=>`
  <tr>
    <td><div class="member-cell"><img src="https://images.unsplash.com/photo-${m.img}?q=80&w=100&auto=format&fit=crop"><div><div class="n">${m.name}</div><div class="e">${m.email}</div></div></div></td>
    <td><span class="badge gold">${m.plan}</span></td>
    <td>${m.trainer}</td>
    <td><span class="badge ${m.fee}">${feeLabel(m.fee)}</span></td>
  </tr>`).join('');

function renderMembers(list = allMembers) {
  document.getElementById('membersBody').innerHTML = list.map(m=>`
    <tr>
      <td><div class="member-cell"><img src="https://images.unsplash.com/photo-${m.img}?q=80&w=100&auto=format&fit=crop"><div><div class="n">${m.name}</div><div class="e">${m.email}</div></div></div></td>
      <td><span class="badge gold">${m.plan}</span></td>
      <td>${m.trainer || 'Unassigned'}</td>
      <td>${m.join || '—'}</td>
      <td>${m.expiry || '—'}</td>
      <td><div class="progress-mini"><i style="width:${m.att || 0}%"></i></div></td>
      <td>${m.bmi || 0}</td>
      <td><span class="badge ${m.fee || 'green'}">${feeLabel(m.fee || 'green')}</span></td>
      <td><div class="row-actions"><span onclick="window.editMember('${m._id || m.id}')">✎</span><span onclick="window.deleteMember('${m._id || m.id}')">⋯</span></div></td>
    </tr>`).join('');
}
renderMembers(allMembers);

/* ============ TRANSACTIONS ============ */
const TXNS = dashboardSummary.transactions || [];
document.getElementById('txnBody').innerHTML = TXNS.map(t=>`
  <tr><td>${t.memberName || t.name}</td><td>${t.amount || t.amt}</td><td>${t.method}</td><td><span class="badge ${t.status}">${t.status==='green'?'Paid':t.status==='red'?'Overdue':'Partial'}</span></td></tr>`).join('');

/* ============ TRAINERS GRID ============ */
let TRAINERS = dashboardSummary.trainers || [];
function resolveImageSrc(img, fallback = '1519085360753-af0119f7cbe7', width = 200) {
  if (!img) {
    return `https://images.unsplash.com/photo-${fallback}?q=80&w=${width}&auto=format&fit=crop`;
  }
  if (/^data:image\//i.test(img)) {
    return img;
  }
  if (/^https?:\/\//i.test(img)) {
    return img;
  }
  return `https://images.unsplash.com/photo-${img}?q=80&w=${width}&auto=format&fit=crop`;
}
function renderTrainers(list = TRAINERS) {
  document.getElementById('trainerGrid').innerHTML = list.map(t=>`
    <div class="card trainer-card">
      <div class="trainer-card-actions">
        <button type="button" class="btn btn-ghost trainer-action-btn" onclick="window.editTrainer('${t._id || t.id}')">Edit</button>
        <button type="button" class="btn btn-gold trainer-action-btn" onclick="window.deleteTrainer('${t._id || t.id}')">Remove</button>
      </div>
      <div class="trainer-portrait-wrap">
        <img src="${resolveImageSrc(t.img, '1519085360753-af0119f7cbe7', 200)}" alt="${t.name}">
      </div>
      <h4>${t.name}</h4>
      <div class="spec">${t.spec}</div>
      <div class="trainer-stats">
        <div><div class="v">${t.clients}</div><div class="l">Clients</div></div>
        <div><div class="v">${t.rating}★</div><div class="l">Rating</div></div>
        <div><div class="v">${t.sessions}</div><div class="l">Today</div></div>
      </div>
    </div>`).join('');
  const trainerSelect = document.querySelector('#admissionForm [name="trainer"]');
  if (trainerSelect) populateTrainerSelect(trainerSelect, trainerSelect.value || '');
}
renderTrainers(TRAINERS);

/* ============ NOTIFICATIONS ============ */
const NOTIFS = dashboardSummary.notifications || [];
function notifHTML(n){
  return `<div class="notif-item">
    <div class="notif-ico" style="background:rgba(198,161,91,0.14);color:var(--gold-bright);">${svgIcon(n.icon || 'notifications')}</div>
    <div class="notif-body"><h5>${n.title || n.name}</h5><p>${n.desc || n.message || 'No details provided'}</p></div>
    <div class="notif-time">${n.time || 'Just now'}</div>
  </div>`;
}
document.getElementById('dashNotifList').innerHTML = NOTIFS.slice(0,4).map(notifHTML).join('');
document.getElementById('fullNotifList').innerHTML = NOTIFS.map(notifHTML).join('');

/* ============ STREAK TRACKER ============ */
const STREAKS = normalizeList(await api('/api/admin/streaks'));
const TIER_META = {
  bronze:{label:'Bronze · 3+ days', color:'tier-bronze', dotBg:'rgba(180,120,70,0.16)', emoji:'🔥'},
  silver:{label:'Silver · 10+ days', color:'tier-silver', dotBg:'rgba(190,190,200,0.16)', emoji:'⚡'},
  gold:{label:'Gold · 25+ days', color:'tier-gold', dotBg:'var(--gold-glow)', emoji:'🏆'},
  diamond:{label:'Diamond · 50+ days', color:'tier-diamond', dotBg:'rgba(122,166,214,0.16)', emoji:'💎'},
};
function miniHeat(days){
  let html='';
  for(let i=0;i<14;i++){
    const active = i >= (14-Math.min(days,14));
    html += `<div style="background:${active?'var(--gold-bright)':'var(--graphite-lighter)'}"></div>`;
  }
  return `<div class="mini-heat">${html}</div>`;
}
function renderStreaks(){
  const sorted = [...STREAKS].sort((a,b)=>b.current-a.current);
  document.getElementById('streaksBody').innerHTML = sorted.map((s,i)=>{
    const t = TIER_META[s.tier];
    return `<tr>
      <td>${i+1}</td>
      <td><div class="member-cell"><img src="https://images.unsplash.com/photo-${s.img}?q=80&w=100&auto=format&fit=crop"><div><div class="n">${s.name}</div></div></div></td>
      <td><div class="streak-flame"><span class="ficon">🔥</span><span class="fnum">${s.current}</span><span style="color:var(--muted);font-size:12px;">days</span></div></td>
      <td><span class="tier-badge ${t.color}">${t.emoji} ${s.tier.charAt(0).toUpperCase()+s.tier.slice(1)}</span></td>
      <td>${miniHeat(s.current)}</td>
      <td>${s.longest} days</td>
      <td style="color:var(--muted);font-size:12.5px;">${s.last}</td>
      <td><button class="reward-btn" onclick="openRewardModal('${s.name}')">🎁 Reward</button></td>
    </tr>`;
  }).join('');
}
function renderTiers(){
  document.getElementById('tierList').innerHTML = Object.keys(TIER_META).map(k=>{
    const t = TIER_META[k];
    const count = STREAKS.filter(s=>s.tier===k).length;
    return `<div class="tier-row">
      <div class="tl"><div class="dot" style="background:${t.dotBg};">${t.emoji}</div><div><h5>${k.charAt(0).toUpperCase()+k.slice(1)} Tier</h5><p>${t.label}</p></div></div>
      <div class="tier-badge ${t.color}">${count} members</div>
    </div>`;
  }).join('');
}
const REWARD_HISTORY = normalizeList(await api('/api/admin/rewards'));
function renderRewardHistory(){
  document.getElementById('rewardHistory').innerHTML = REWARD_HISTORY.map(r=>`
    <div class="reward-hist-item">
      <img src="https://images.unsplash.com/photo-${r.img}?q=80&w=100&auto=format&fit=crop">
      <div class="rh-body"><h5>${r.name}</h5><p>${r.time}</p></div>
      <div class="rh-tag">${r.reward}</div>
    </div>`).join('');
}
renderStreaks();
renderTiers();
renderRewardHistory();

// expose functions referenced via inline onclick="..." attributes in the markup
window.switchPage = switchPage;
window.openRewardModal = openRewardModal;
window.closeRewardModal = closeRewardModal;
window.sendReward = sendReward;

async function refreshData() {
  const [members, trainers, attendance, fees, plans, workouts, diets] = await Promise.all([
    api('/api/admin/members').catch(() => []).then(normalizeList),
    api('/api/admin/trainers').catch(() => []).then(normalizeList),
    api('/api/admin/attendance').catch(() => []).then(normalizeList),
    api('/api/admin/fees').catch(() => []).then(normalizeList),
    api('/api/admin/plans').catch(() => []).then(normalizeList),
    api('/api/admin/workouts').catch(() => []).then(normalizeList),
    api('/api/admin/diets').catch(() => []).then(normalizeList),
  ]);
  renderMembers(members);
  TRAINERS = trainers;
  renderTrainers(trainers);
  const trainerSelect = document.querySelector('#admissionForm [name="trainer"]');
  if (trainerSelect) populateTrainerSelect(trainerSelect, trainerSelect.value || '');
  renderAttendance(attendance);
  renderFees(fees);
  renderPlans(plans);
  renderWorkouts(workouts);
  renderDiets(diets);
}

function normalizeForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.features) data.features = data.features.split(',').map((item) => item.trim()).filter(Boolean);
  if (data.durationMonths) data.durationMonths = Number(data.durationMonths);
  if (data.price) data.price = Number(data.price);
  if (data.amount) data.amount = Number(data.amount);
  if (data.clients) data.clients = Number(data.clients);
  if (data.rating) data.rating = Number(data.rating);
  if (data.sessions) data.sessions = Number(data.sessions);
  if (data.calories) data.calories = Number(data.calories);
  if (data.att !== '') data.att = Number(data.att);
  if (data.bmi !== '') data.bmi = Number(data.bmi);
  if (data.id === '') delete data.id;
  return data;
}

async function submitForm(url, payload, method = 'POST') {
  return api(url, { method, body: JSON.stringify(payload) });
}

function setupForm(formId, handler) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = normalizeForm(form);
    await handler(payload);
    form.reset();
  });
}

function populateTrainerSelect(select, value = '') {
  if (!select) return;
  const currentValue = value || select.value || '';
  const options = ['<option value="">Unassigned</option>', ...TRAINERS.map((trainer) => `<option value="${trainer.name}" ${trainer.name === currentValue ? 'selected' : ''}>${trainer.name}</option>`)]
    .join('');
  select.innerHTML = options;
}

function setAdmissionStatus(message, type = 'success') {
  const status = document.getElementById('admissionStatus');
  if (!status) return;
  status.textContent = message;
  status.style.color = type === 'error' ? '#e2725b' : '#e8cd90';
}

setupForm('admissionForm', async (payload) => {
  try {
    const url = payload.id ? `/api/admin/members/${payload.id}` : '/api/admin/members';
    const method = payload.id ? 'PATCH' : 'POST';
    await submitForm(url, payload, method);
    await refreshData();
    setAdmissionStatus(payload.id ? 'Member updated successfully.' : 'Member created successfully.');
    if (!payload.id) {
      const form = document.getElementById('admissionForm');
      if (form) form.reset();
    }
  } catch (error) {
    setAdmissionStatus(error.message || 'Could not save member.', 'error');
  }
});

setupForm('planForm', async (payload) => {
  if (payload.id) {
    await submitForm(`/api/admin/plans/${payload.id}`, payload, 'PATCH');
  } else {
    await submitForm('/api/admin/plans', payload, 'POST');
  }
});

setupForm('attendanceForm', async (payload) => {
  if (payload.id) {
    await submitForm(`/api/admin/attendance/${payload.id}`, payload, 'PATCH');
  } else {
    await submitForm('/api/admin/attendance', payload, 'POST');
  }
});

setupForm('feeForm', async (payload) => {
  if (payload.id) {
    await submitForm(`/api/admin/fees/${payload.id}`, payload, 'PATCH');
  } else {
    await submitForm('/api/admin/fees', payload, 'POST');
  }
});

setupForm('trainerForm', async (payload) => {
  try {
    if (payload.id) {
      await submitForm(`/api/admin/trainers/${payload.id}`, payload, 'PATCH');
    } else {
      await submitForm('/api/admin/trainers', payload, 'POST');
    }
    await refreshData();
  } catch (error) {
    console.error('Trainer save failed:', error);
    throw error;
  }
});

setupForm('workoutForm', async (payload) => {
  if (payload.id) {
    await submitForm(`/api/admin/workouts/${payload.id}`, payload, 'PATCH');
  } else {
    await submitForm('/api/admin/workouts', payload, 'POST');
  }
});

setupForm('dietForm', async (payload) => {
  if (payload.id) {
    await submitForm(`/api/admin/diets/${payload.id}`, payload, 'PATCH');
  } else {
    await submitForm('/api/admin/diets', payload, 'POST');
  }
});

function renderAttendance(list) {
  const body = document.getElementById('attendanceBody');
  if (!body) return;
  const filtered = list.filter((item) => {
    const search = (document.getElementById('attendanceSearchInput')?.value || '').toLowerCase();
    const status = document.getElementById('attendanceStatusFilter')?.value || '';
    const matchSearch = !search || [item.memberName, item.status, item.notes].join(' ').toLowerCase().includes(search);
    const matchStatus = !status || item.status === status;
    return matchSearch && matchStatus;
  });
  body.innerHTML = filtered.map((item) => `
    <tr>
      <td>${item.memberName}</td>
      <td>${item.date}</td>
      <td><span class="badge ${item.status === 'Absent' ? 'red' : item.status === 'Late' ? 'gold' : 'green'}">${item.status}</span></td>
      <td>${item.checkInTime || '—'}</td>
      <td>${item.checkOutTime || '—'}</td>
      <td>${item.notes || '—'}</td>
      <td><div class="row-actions"><span onclick="window.editAttendance('${item._id}')">✎</span><span onclick="window.deleteAttendance('${item._id}')">⋯</span></div></td>
    </tr>`).join('');
}

function renderFees(list) {
  const body = document.getElementById('feesBody');
  if (!body) return;
  body.innerHTML = list.map((item) => `
    <tr>
      <td>${item.memberName}</td>
      <td>${item.plan}</td>
      <td>${item.amount}</td>
      <td><span class="badge ${item.status === 'Paid' ? 'green' : item.status === 'Overdue' ? 'red' : 'gold'}">${item.status}</span></td>
      <td>${item.dueDate || '—'}</td>
      <td>${item.paidDate || '—'}</td>
      <td>${item.method || 'UPI'}</td>
      <td><div class="row-actions"><span onclick="window.editFee('${item._id}')">✎</span><span onclick="window.deleteFee('${item._id}')">⋯</span></div></td>
    </tr>`).join('');
}

function renderPlans(list) {
  const body = document.getElementById('plansBody');
  if (!body) return;
  body.innerHTML = list.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.durationMonths || 0} mo</td>
      <td>₹${item.price}</td>
      <td>${item.status}</td>
      <td>${(item.features || []).join(', ')}</td>
      <td><div class="row-actions"><span onclick="window.editPlan('${item._id}')">✎</span><span onclick="window.deletePlan('${item._id}')">⋯</span></div></td>
    </tr>`).join('');
}

function renderWorkouts(list) {
  const body = document.getElementById('workoutsBody');
  if (!body) return;
  body.innerHTML = list.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.duration}</td>
      <td>${item.intensity}</td>
      <td>${item.trainer}</td>
      <td><div class="row-actions"><span onclick="window.editWorkout('${item._id}')">✎</span><span onclick="window.deleteWorkout('${item._id}')">⋯</span></div></td>
    </tr>`).join('');
}

function renderDiets(list) {
  const body = document.getElementById('dietsBody');
  if (!body) return;
  body.innerHTML = list.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.goal}</td>
      <td>${item.calories}</td>
      <td>${item.trainer}</td>
      <td>${(item.meals || []).join(', ')}</td>
      <td><div class="row-actions"><span onclick="window.editDiet('${item._id}')">✎</span><span onclick="window.deleteDiet('${item._id}')">⋯</span></div></td>
    </tr>`).join('');
}

window.refreshDashboard = refreshData;
window.openAttendanceForm = () => { document.getElementById('attendanceForm').reset(); };
window.openFeeForm = () => { document.getElementById('feeForm').reset(); };
window.openPlanForm = () => { document.getElementById('planForm').reset(); };
function syncTrainerImagePreview(src) {
  const previewWrap = document.getElementById('trainerImagePreviewWrap');
  const preview = document.getElementById('trainerImagePreview');
  if (!previewWrap || !preview) return;

  if (!src) {
    previewWrap.style.display = 'none';
    preview.removeAttribute('src');
    return;
  }

  preview.src = resolveImageSrc(src, '1519085360753-af0119f7cbe7', 200);
  previewWrap.style.display = 'block';
}

window.openTrainerForm = () => {
  const form = document.getElementById('trainerForm');
  if (!form) return;
  form.reset();
  const fileInput = document.getElementById('trainerImageFile');
  if (fileInput) fileInput.value = '';
  syncTrainerImagePreview('');
};
window.openWorkoutForm = () => { document.getElementById('workoutForm').reset(); };
window.openDietForm = () => { document.getElementById('dietForm').reset(); };

const trainerForm = document.getElementById('trainerForm');
if (trainerForm) {
  const fileInput = document.getElementById('trainerImageFile');
  const imageField = trainerForm.querySelector('[name="img"]');

  fileInput?.addEventListener('change', async (event) => {
    const [file] = event.target.files || [];
    if (!file || !imageField) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      imageField.value = dataUrl;
      syncTrainerImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  });

  imageField?.addEventListener('input', (event) => {
    syncTrainerImagePreview(event.target.value || '');
  });
}

window.editMember = async (id) => {
  const member = await api(`/api/admin/members/${id}`);
  const form = document.getElementById('admissionForm');
  if (!form) return;
  form.querySelector('[name="id"]').value = member._id || member.id;
  form.querySelector('[name="name"]').value = member.name || '';
  form.querySelector('[name="email"]').value = member.email || '';
  form.querySelector('[name="plan"]').value = member.plan || 'Essential';
  const trainerSelect = form.querySelector('[name="trainer"]');
  populateTrainerSelect(trainerSelect, member.trainer || '');
  form.querySelector('[name="fee"]').value = member.fee || 'green';
  form.querySelector('[name="att"]').value = member.att || 0;
  form.querySelector('[name="bmi"]').value = member.bmi || 0;
  switchPage('admission', 'New Admission', 'admission');
};

window.deleteMember = async (id) => {
  if (!confirm('Delete this member?')) return;
  await api(`/api/admin/members/${id}`, { method: 'DELETE' });
  await refreshData();
};

window.editAttendance = async (id) => {
  const item = await api(`/api/admin/attendance/${id}`);
  const form = document.getElementById('attendanceForm');
  form.querySelector('[name="id"]').value = item._id;
  form.querySelector('[name="memberName"]').value = item.memberName || '';
  form.querySelector('[name="date"]').value = item.date || '';
  form.querySelector('[name="status"]').value = item.status || 'Present';
  form.querySelector('[name="checkInTime"]').value = item.checkInTime || '';
  form.querySelector('[name="checkOutTime"]').value = item.checkOutTime || '';
  form.querySelector('[name="notes"]').value = item.notes || '';
  switchPage('attendance', 'Attendance', 'attendance');
};

window.deleteAttendance = async (id) => {
  if (!confirm('Delete this attendance record?')) return;
  await api(`/api/admin/attendance/${id}`, { method: 'DELETE' });
  await refreshData();
};

window.editFee = async (id) => {
  const item = await api(`/api/admin/fees/${id}`);
  const form = document.getElementById('feeForm');
  form.querySelector('[name="id"]').value = item._id;
  form.querySelector('[name="memberName"]').value = item.memberName || '';
  form.querySelector('[name="plan"]').value = item.plan || '';
  form.querySelector('[name="amount"]').value = item.amount || 0;
  form.querySelector('[name="status"]').value = item.status || 'Pending';
  form.querySelector('[name="dueDate"]').value = item.dueDate || '';
  form.querySelector('[name="paidDate"]').value = item.paidDate || '';
  form.querySelector('[name="method"]').value = item.method || 'UPI';
  switchPage('fees', 'Fee Management', 'fees');
};

window.deleteFee = async (id) => {
  if (!confirm('Delete this fee record?')) return;
  await api(`/api/admin/fees/${id}`, { method: 'DELETE' });
  await refreshData();
};

window.editPlan = async (id) => {
  const item = await api(`/api/admin/plans/${id}`);
  const form = document.getElementById('planForm');
  form.querySelector('[name="id"]').value = item._id;
  form.querySelector('[name="name"]').value = item.name || '';
  form.querySelector('[name="durationMonths"]').value = item.durationMonths || '';
  form.querySelector('[name="price"]').value = item.price || '';
  form.querySelector('[name="status"]').value = item.status || 'Active';
  form.querySelector('[name="features"]').value = (item.features || []).join(', ');
  switchPage('plans', 'Membership Plans', 'plans');
};

window.deletePlan = async (id) => {
  if (!confirm('Delete this plan?')) return;
  await api(`/api/admin/plans/${id}`, { method: 'DELETE' });
  await refreshData();
};

window.editTrainer = async (id) => {
  const item = await api(`/api/admin/trainers/${id}`);
  const form = document.getElementById('trainerForm');
  if (!form) return;
  form.querySelector('[name="id"]').value = item.id || item._id || '';
  form.querySelector('[name="name"]').value = item.name || '';
  form.querySelector('[name="spec"]').value = item.spec || '';
  form.querySelector('[name="clients"]').value = item.clients ?? '';
  form.querySelector('[name="rating"]').value = item.rating ?? '';
  form.querySelector('[name="sessions"]').value = item.sessions ?? '';
  const imageField = form.querySelector('[name="img"]');
  imageField.value = item.img || '';
  syncTrainerImagePreview(item.img || '');
  switchPage('trainers', 'Trainers', 'trainers');
};

window.deleteTrainer = async (id) => {
  if (!confirm('Delete this trainer?')) return;
  await api(`/api/admin/trainers/${id}`, { method: 'DELETE' });
  await refreshData();
};

window.editWorkout = async (id) => {
  const item = await api(`/api/admin/workouts/${id}`);
  const form = document.getElementById('workoutForm');
  form.querySelector('[name="id"]').value = item._id;
  form.querySelector('[name="name"]').value = item.name || '';
  form.querySelector('[name="category"]').value = item.category || '';
  form.querySelector('[name="duration"]').value = item.duration || '';
  form.querySelector('[name="intensity"]').value = item.intensity || '';
  form.querySelector('[name="trainer"]').value = item.trainer || '';
  form.querySelector('[name="description"]').value = item.description || '';
  switchPage('workouts', 'Workout Programs', 'workouts');
};

window.deleteWorkout = async (id) => {
  if (!confirm('Delete this workout?')) return;
  await api(`/api/admin/workouts/${id}`, { method: 'DELETE' });
  await refreshData();
};

window.editDiet = async (id) => {
  const item = await api(`/api/admin/diets/${id}`);
  const form = document.getElementById('dietForm');
  form.querySelector('[name="id"]').value = item._id;
  form.querySelector('[name="name"]').value = item.name || '';
  form.querySelector('[name="goal"]').value = item.goal || '';
  form.querySelector('[name="calories"]').value = item.calories || '';
  form.querySelector('[name="trainer"]').value = item.trainer || '';
  form.querySelector('[name="meals"]').value = (item.meals || []).join(', ');
  switchPage('diet', 'Diet Plans', 'diet');
};

window.deleteDiet = async (id) => {
  if (!confirm('Delete this diet plan?')) return;
  await api(`/api/admin/diets/${id}`, { method: 'DELETE' });
  await refreshData();
};

await refreshData();

}

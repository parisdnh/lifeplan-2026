/* ============================================================
   app.js — livsplan main logic
   ============================================================ */

// ── State ────────────────────────────────────────────────────
function loadOrDefault(key, fallback) {
  try {
    const val = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(val) || val.length === 0) return JSON.parse(JSON.stringify(fallback));
    return val;
  } catch { return JSON.parse(JSON.stringify(fallback)); }
}

function loadBudget() {
  try {
    const val = JSON.parse(localStorage.getItem('paris_budget'));
    if (Array.isArray(val) && val.length > 0 && val.every(s => s.title && Array.isArray(s.rows))) return val;
  } catch {}
  localStorage.removeItem('paris_budget');
  return JSON.parse(JSON.stringify(DEFAULT_BUDGET_SECTIONS));
}

let months   = loadOrDefault('paris_months', DEFAULT_MONTHS);
let budget   = loadBudget();
let goals    = loadOrDefault('paris_goals',  DEFAULT_GOALS);
let savings  = (() => {
  try {
    const s = JSON.parse(localStorage.getItem('paris_savings'));
    return (s && typeof s.current === 'number') ? s : { current: 0, log: [], goal: SAVINGS_GOAL };
  } catch { return { current: 0, log: [], goal: SAVINGS_GOAL }; }
})();

// ── Persist ──────────────────────────────────────────────────
function persist() {
  localStorage.setItem('paris_months',  JSON.stringify(months));
  localStorage.setItem('paris_budget',  JSON.stringify(budget));
  localStorage.setItem('paris_goals',   JSON.stringify(goals));
  localStorage.setItem('paris_savings', JSON.stringify(savings));
}

function saveAll() {
  persist();
  const ind = document.getElementById('save-indicator');
  ind.style.display = 'inline';
  showToast('Lagret! 💗');
  setTimeout(() => ind.style.display = 'none', 2500);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Tabs ─────────────────────────────────────────────────────
function showTab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  btn.classList.add('active');
}

// ── Countdown ────────────────────────────────────────────────
function buildCountdown() {
  const now  = new Date();
  const diff = DEPARTURE_DATE - now;
  if (diff <= 0) {
    document.getElementById('cd-days').textContent  = '0';
    document.getElementById('cd-weeks').textContent = '0';
    document.getElementById('cd-months').textContent= '0';
    return;
  }
  const days   = Math.floor(diff / 86400000);
  const weeks  = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);
  document.getElementById('cd-days').textContent   = days;
  document.getElementById('cd-weeks').textContent  = weeks;
  document.getElementById('cd-months').textContent = months;
}

// ── Savings tracker ──────────────────────────────────────────
function buildSavings() {
  const goal = savings.goal || _savingsGoal;
  const pct = Math.min(100, Math.round((savings.current / goal) * 100));
  document.getElementById('savings-current').textContent = savings.current.toLocaleString('nb-NO') + ' kr';
  document.getElementById('savings-goal-val').textContent = goal.toLocaleString('nb-NO') + ' kr';
  document.getElementById('savings-pct').textContent = pct + '%';
  document.getElementById('savings-left').textContent = Math.max(0, goal - savings.current).toLocaleString('nb-NO') + ' kr igjen';
  document.getElementById('savings-bar-fill').style.width = pct + '%';
  const glabel = document.getElementById('savings-goal-label');
  if (glabel) glabel.textContent = goal.toLocaleString('nb-NO') + ' kr';

  // Milestones
  const step = Math.round(goal / 5);
  const milestones = [
    { amount: step*1, label: (step/1000).toFixed(0)+'k', icon: '🌱' },
    { amount: step*2, label: (step*2/1000).toFixed(0)+'k', icon: '🌸' },
    { amount: step*3, label: (step*3/1000).toFixed(0)+'k', icon: '🌺' },
    { amount: step*4, label: (step*4/1000).toFixed(0)+'k', icon: '🦋' },
    { amount: goal,   label: (goal/1000).toFixed(0)+'k', icon: '🌟' },
  ];
  const mc = document.getElementById('milestones');
  mc.innerHTML = '';
  milestones.forEach(m => {
    const reached = savings.current >= m.amount;
    const el = document.createElement('div');
    el.className = 'milestone' + (reached ? ' reached' : '');
    el.innerHTML = `<span class="m-icon">${m.icon}</span>${m.label}${reached ? ' ✓' : ''}`;
    mc.appendChild(el);
  });
}

function addSavings() {
  const inp = document.getElementById('savings-add-input');
  const val = parseInt(inp.value);
  if (!val || val === 0) return;
  savings.current += val;
  if (savings.current < 0) savings.current = 0;
  savings.log.push({ amount: val, date: new Date().toLocaleDateString('nb-NO') });
  inp.value = '';
  persist();
  buildSavings();
  showToast(val > 0 ? `+${val.toLocaleString('nb-NO')} kr spart! 🎉` : `${val.toLocaleString('nb-NO')} kr registrert 💸`);
}

function setSavingsGoalEdit() {
  const inp = document.getElementById('savings-goal-edit');
  const val = parseInt(inp.value);
  if (val && val > 0) {
    // update the global (in-memory only for simplicity)
    window.SAVINGS_GOAL = val; window.SAVINGS_GOAL_val = val;
    inp.value = '';
    buildSavings();
    showToast('Sparemål oppdatert! 🌟');
  }
}

// ── Timeline ─────────────────────────────────────────────────
function buildTimeline() {
  const tl = document.getElementById('timeline');
  tl.innerHTML = '';
  months.forEach((m, mi) => {
    const done  = m.todos.filter(t => t.done).length;
    const total = m.todos.length;
    const pct   = total ? Math.round((done / total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'month-card';
    card.innerHTML = `
      <div class="month-header" onclick="toggleMonth(${mi})">
        <div class="month-color" style="background:${m.color}; color:${m.color}"></div>
        <div class="month-name">${m.name}</div>
        <div class="month-meta">
          <span class="badge badge-${m.phase}">${m.badgeText}</span>
          <span class="month-pct">${pct}%</span>
          <span class="chevron" id="chev-${mi}">▾</span>
        </div>
      </div>
      <div class="month-body" id="body-${mi}">
        <div class="month-body-inner">
          <div class="phase-banner">
            <strong>${m.name} — ${m.location}</strong><br>${m.context}
          </div>
          <div>
            <div class="section-label">✅ Todo denne måneden</div>
            <div class="todo-list" id="todos-${mi}"></div>
            <div class="add-todo" style="margin-top:10px">
              <input id="newtodo-${mi}" placeholder="Legg til oppgave…"
                     onkeydown="if(event.key==='Enter')addTodo(${mi})" />
              <button onclick="addTodo(${mi})">+</button>
            </div>
          </div>
          <div>
            <div class="section-label">📍 Detaljer</div>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-key">📍 Sted</span>
                <span class="info-val editable-val" id="loc-${mi}"
                      onclick="editField(${mi},'location','loc-${mi}')">${m.location}</span>
              </div>
              <div class="info-row">
                <span class="info-key">💼 Jobb</span>
                <span class="info-val editable-val" id="job-${mi}"
                      onclick="editField(${mi},'jobb','job-${mi}')">${m.jobb}</span>
              </div>
              <div class="info-row">
                <span class="info-key">🌟 Status</span>
                <span class="info-val">${m.status}</span>
              </div>
            </div>
            <div class="section-label" style="margin-top:16px">📝 Notater</div>
            <textarea class="notes-area"
              placeholder="Tanker, ideer, drømmer…"
              onchange="saveNotes(${mi},this.value)">${m.notes || ''}</textarea>
            <div class="progress-mini">
              <div class="progress-mini-fill" id="prog-${mi}" style="width:${pct}%"></div>
            </div>
          </div>
        </div>
      </div>`;
    tl.appendChild(card);
    renderTodos(mi);
  });
}

function toggleMonth(mi) {
  const body = document.getElementById('body-' + mi);
  const chev = document.getElementById('chev-' + mi);
  const open = body.classList.toggle('open');
  chev.classList.toggle('open', open);
}

function renderTodos(mi) {
  const list = document.getElementById('todos-' + mi);
  if (!list) return;
  list.innerHTML = '';
  months[mi].todos.forEach((t, ti) => {
    const item = document.createElement('div');
    item.className = 'todo-item' + (t.done ? ' done' : '');
    item.innerHTML = `
      <input type="checkbox" id="cb-${mi}-${ti}" ${t.done ? 'checked' : ''}
             onchange="toggleTodo(${mi},${ti})">
      <label class="todo-label" for="cb-${mi}-${ti}">${t.text}</label>
      <button class="todo-del" onclick="deleteTodo(${mi},${ti})">✕</button>`;
    list.appendChild(item);
  });
}

function toggleTodo(mi, ti) {
  months[mi].todos[ti].done = !months[mi].todos[ti].done;
  persist();
  const done  = months[mi].todos.filter(t => t.done).length;
  const total = months[mi].todos.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  const item  = document.getElementById('cb-' + mi + '-' + ti).parentElement;
  item.classList.toggle('done', months[mi].todos[ti].done);
  const prog = document.getElementById('prog-' + mi);
  if (prog) prog.style.width = pct + '%';
  const pctEl = document.querySelector(`#chev-${mi}`);
  if (pctEl) pctEl.previousElementSibling.textContent = pct + '%';
}

function addTodo(mi) {
  const inp = document.getElementById('newtodo-' + mi);
  if (!inp.value.trim()) return;
  months[mi].todos.push({ text: inp.value.trim(), done: false });
  inp.value = '';
  persist();
  renderTodos(mi);
}

function deleteTodo(mi, ti) {
  months[mi].todos.splice(ti, 1);
  persist();
  renderTodos(mi);
}

function saveNotes(mi, val) {
  months[mi].notes = val;
  persist();
}

function editField(mi, field, elId) {
  const el  = document.getElementById(elId);
  const cur = months[mi][field];
  el.outerHTML = `<div class="inline-edit" id="${elId}">
    <input id="ei-${elId}" value="${cur}" onkeydown="if(event.key==='Enter')saveField(${mi},'${field}','${elId}')"/>
    <button onclick="saveField(${mi},'${field}','${elId}')">OK</button>
  </div>`;
  document.getElementById('ei-' + elId).focus();
}

function saveField(mi, field, elId) {
  const inp = document.getElementById('ei-' + elId);
  const val = inp ? inp.value.trim() : '';
  if (val) months[mi][field] = val;
  persist();
  const span = document.createElement('span');
  span.className   = 'info-val editable-val';
  span.id          = elId;
  span.textContent = months[mi][field];
  span.onclick     = () => editField(mi, field, elId);
  document.getElementById(elId).replaceWith(span);
}

// ── Budget ───────────────────────────────────────────────────
function resetBudget() {
  budget = JSON.parse(JSON.stringify(DEFAULT_BUDGET_SECTIONS));
  localStorage.removeItem('paris_budget');
  buildBudget();
  showToast('Budsjett tilbakestilt til standard 🌸');
}

function buildBudget() {
  if (!Array.isArray(budget) || budget.length === 0 || !budget.every(s => Array.isArray(s.rows))) {
    budget = JSON.parse(JSON.stringify(DEFAULT_BUDGET_SECTIONS));
    localStorage.removeItem('paris_budget');
  }
  let totalB = 0, totalS = 0;
  budget.forEach(sec => sec.rows.forEach(r => { totalB += (r.budget || 0); totalS += (r.spent || 0); }));
  const left = totalB - totalS;

  document.getElementById('budget-metrics').innerHTML = `
    <div class="metric-card" data-emoji="💸">
      <div class="metric-label">Totalbudsjett</div>
      <div class="metric-val">${totalB.toLocaleString('nb-NO')} kr</div>
    </div>
    <div class="metric-card" data-emoji="🛍️">
      <div class="metric-label">Brukt</div>
      <div class="metric-val ${totalS > 0 ? 'pink' : ''}">${totalS.toLocaleString('nb-NO')} kr</div>
    </div>
    <div class="metric-card" data-emoji="${left >= 0 ? '🌸' : '😬'}">
      <div class="metric-label">Gjenstår</div>
      <div class="metric-val ${left >= 0 ? 'green' : 'red'}">${left.toLocaleString('nb-NO')} kr</div>
    </div>
    <div class="metric-card" data-emoji="📊">
      <div class="metric-label">Forbrukt</div>
      <div class="metric-val">${totalB ? Math.round((totalS/totalB)*100) : 0}%</div>
    </div>`;

  const wrap = document.getElementById('budget-sections');
  wrap.innerHTML = '';
  budget.forEach((sec, si) => {
    const div = document.createElement('div');
    div.className = 'budget-section';
    div.innerHTML = `<div class="budget-section-title">${sec.title}</div>
      <div class="budget-table-wrap">
        <table>
          <thead><tr><th>Post</th><th>Budsjett (kr)</th><th>Brukt (kr)</th><th>Rest</th><th></th></tr></thead>
          <tbody id="btbody-${si}"></tbody>
        </table>
        <div class="add-budget-row">
          <input id="bcat-${si}" placeholder="Ny post…" />
          <input id="bbud-${si}" type="number" placeholder="Beløp" />
          <button onclick="addBudgetRow(${si})">+ Legg til</button>
        </div>
      </div>`;
    wrap.appendChild(div);
    renderBudgetRows(si);
  });
}

function renderBudgetRows(si) {
  const tbody = document.getElementById('btbody-' + si);
  if (!tbody) return;
  tbody.innerHTML = '';
  budget[si].rows.forEach((row, ri) => {
    const rest = row.budget - row.spent;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.cat}</td>
      <td><input class="budget-input" type="number" value="${row.budget}"
           onchange="updateBudget(${si},${ri},'budget',this.value)" /></td>
      <td><input class="budget-input" type="number" value="${row.spent}"
           onchange="updateBudget(${si},${ri},'spent',this.value)" /></td>
      <td class="${rest < 0 ? 'overspent' : 'surplus'}">${rest.toLocaleString('nb-NO')} kr</td>
      <td><button class="del-btn" onclick="deleteBudgetRow(${si},${ri})">✕</button></td>`;
    tbody.appendChild(tr);
  });
}

function updateBudget(si, ri, field, val) {
  budget[si].rows[ri][field] = parseInt(val) || 0;
  persist();
  buildBudget();
}

function deleteBudgetRow(si, ri) {
  budget[si].rows.splice(ri, 1);
  persist();
  buildBudget();
}

function addBudgetRow(si) {
  const cat = document.getElementById('bcat-' + si).value.trim();
  const bud = parseInt(document.getElementById('bbud-' + si).value) || 0;
  if (!cat) return;
  budget[si].rows.push({ cat, budget: bud, spent: 0 });
  document.getElementById('bcat-' + si).value = '';
  document.getElementById('bbud-' + si).value = '';
  persist();
  buildBudget();
}

// ── Goals ────────────────────────────────────────────────────
function buildGoals() {
  const list = document.getElementById('goals-list');
  list.innerHTML = '';
  goals.forEach((g, i) => {
    const card = document.createElement('div');
    card.className = 'goal-card';
    card.innerHTML = `
      <div class="goal-top">
        <span class="goal-icon">${g.icon}</span>
        <span class="goal-title-text"
              contenteditable="true"
              data-idx="${i}"
              onblur="saveGoalField(${i},'title',this.textContent)"
              title="Klikk for å redigere">${g.title}</span>
        <button class="goal-del" onclick="deleteGoal(${i})">✕</button>
      </div>
      <div class="edit-hint">✏️ Klikk på tittel eller beskrivelse for å redigere</div>
      <span class="goal-desc-text"
            contenteditable="true"
            onblur="saveGoalField(${i},'desc',this.textContent)"
            title="Klikk for å redigere">${g.desc}</span>
      <div class="goal-progress-row">
        <div class="goal-bar">
          <div class="goal-bar-fill" id="gbar-${i}" style="width:${g.pct}%"></div>
        </div>
        <input type="range" class="goal-slider" min="0" max="100" step="5" value="${g.pct}"
               oninput="updateGoalPct(${i},this.value)">
        <span class="goal-pct-label" id="gpct-${i}">${g.pct}%</span>
      </div>`;
    list.appendChild(card);
  });
}

function saveGoalField(i, field, val) {
  goals[i][field] = val.trim();
  persist();
}

function updateGoalPct(i, val) {
  goals[i].pct = parseInt(val);
  document.getElementById('gbar-' + i).style.width = val + '%';
  document.getElementById('gpct-' + i).textContent = val + '%';
  persist();
}

function deleteGoal(i) {
  goals.splice(i, 1);
  persist();
  buildGoals();
}

function addGoal() {
  const title = document.getElementById('new-goal-title').value.trim();
  const desc  = document.getElementById('new-goal-desc').value.trim();
  if (!title) return;
  const icon = GOAL_ICONS[goals.length % GOAL_ICONS.length];
  goals.push({ icon, title, desc, pct: 0 });
  document.getElementById('new-goal-title').value = '';
  document.getElementById('new-goal-desc').value  = '';
  persist();
  buildGoals();
  showToast('Nytt mål lagt til! ✨');
}

// ── Init ─────────────────────────────────────────────────────
let _savingsGoal = savings.goal || SAVINGS_GOAL;
buildCountdown();
buildSavings();
buildTimeline();
buildBudget();
buildGoals();
setInterval(buildCountdown, 60000);

function getCurrentSavingsGoal() { return _savingsGoal; }

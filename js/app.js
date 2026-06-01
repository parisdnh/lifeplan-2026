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
let spareplanPre  = loadOrDefault('paris_sp_pre',  DEFAULT_SPAREPLAN_PRE);
let spareplanPost = loadOrDefault('paris_sp_post', DEFAULT_SPAREPLAN_POST);

// ── Persist ──────────────────────────────────────────────────
function persist() {
  localStorage.setItem('paris_months',  JSON.stringify(months));
  localStorage.setItem('paris_budget',  JSON.stringify(budget));
  localStorage.setItem('paris_goals',   JSON.stringify(goals));
  localStorage.setItem('paris_savings', JSON.stringify(savings));
  localStorage.setItem('paris_sp_pre',  JSON.stringify(spareplanPre));
  localStorage.setItem('paris_sp_post', JSON.stringify(spareplanPost));
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

// ── Spareplan ─────────────────────────────────────────────────
function fmt(n) { return Math.round(n || 0).toLocaleString('nb-NO'); }

function buildSpareplan() {
  const goal    = savings.goal || SAVINGS_GOAL;
  const current = savings.current || 0;
  const pct     = Math.min(100, Math.round((current / goal) * 100));

  const now  = new Date();
  const diff = Math.max(0, DEPARTURE_DATE - now);
  const cdDays   = Math.floor(diff / 86400000);
  const cdWeeks  = Math.floor(cdDays / 7);
  const cdMonths = Math.floor(cdDays / 30.44);

  const step = Math.round(goal / 5);
  const milestones = [
    { amount: step*1, label: fmt(step*1),  icon: '🌱' },
    { amount: step*2, label: fmt(step*2),  icon: '🌸' },
    { amount: step*3, label: fmt(step*3),  icon: '🌺' },
    { amount: step*4, label: fmt(step*4),  icon: '🦋' },
    { amount: goal,   label: fmt(goal),    icon: '🌟' },
  ];

  let prePlanned = 0, preActual = 0;
  spareplanPre.forEach(r => { prePlanned += r.planned || 0; preActual += r.actual || 0; });

  let postIncome = 0, postExpenses = 0;
  spareplanPost.forEach(r => { postIncome += r.income || 0; postExpenses += r.expenses || 0; });

  let estimatedMonth = null;
  let cum = current;
  for (const r of spareplanPre) {
    cum += r.planned || 0;
    if (cum >= goal) { estimatedMonth = r.month; break; }
  }

  document.getElementById('spareplan-content').innerHTML = `
    <div class="sp-countdown">
      <div class="sp-cd-chip"><div class="sp-cd-num">${cdMonths}</div><div class="sp-cd-lbl">måneder</div></div>
      <div class="sp-cd-chip"><div class="sp-cd-num">${cdWeeks}</div><div class="sp-cd-lbl">uker</div></div>
      <div class="sp-cd-chip"><div class="sp-cd-num">${cdDays}</div><div class="sp-cd-lbl">dager</div></div>
      <span class="sp-cd-label">til avreise ✈️</span>
    </div>

    <div class="savings-card sp-goal-card">
      <div class="savings-header">
        <span style="font-size:24px">🌟</span>
        <h2>Sparemål til avreise</h2>
        <span class="pill">1. sep 2026</span>
      </div>
      <div class="savings-goal-row">
        <div class="savings-item pink">
          <div class="savings-item-label">Spart hittil</div>
          <div class="savings-item-val">${fmt(current)} kr</div>
          <div class="savings-item-sub">av målet ditt</div>
        </div>
        <div class="savings-item lilac">
          <div class="savings-item-label">Sparemål</div>
          <div class="savings-item-val">${fmt(goal)} kr</div>
          <div class="savings-item-sub">satt av deg</div>
        </div>
        <div class="savings-item mint">
          <div class="savings-item-label">Fremgang</div>
          <div class="savings-item-val">${pct}%</div>
          <div class="savings-item-sub">${fmt(Math.max(0, goal - current))} kr igjen</div>
        </div>
      </div>
      <div class="savings-bar-wrap">
        <div class="savings-bar-labels"><span>0 kr</span><span>${fmt(goal)} kr</span></div>
        <div class="savings-bar-track"><div class="savings-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="milestones">
        ${milestones.map(m => `<div class="milestone${current >= m.amount ? ' reached' : ''}"><span class="m-icon">${m.icon}</span>${m.label}${current >= m.amount ? ' ✓' : ''}</div>`).join('')}
      </div>
      <div class="savings-input-row">
        <label>Legg til sparing:</label>
        <input id="sp-add-input" type="number" placeholder="f.eks. 2500" onkeydown="if(event.key==='Enter')addSparing()" />
        <button onclick="addSparing()">+ Legg til</button>
        <label style="margin-left:12px">Endre mål:</label>
        <input id="sp-goal-edit" type="number" placeholder="f.eks. 30000" onkeydown="if(event.key==='Enter')setSparemaal()" />
        <button onclick="setSparemaal()">Oppdater</button>
      </div>
    </div>

    <div class="sp-section">
      <div class="sp-section-header">
        <div class="sp-section-title">✈️ Før premien</div>
        <div class="sp-section-sub">Månedlig spareplan frem til avreise</div>
      </div>
      <div class="sp-table-wrap">
        <table class="sp-table">
          <thead><tr><th>Måned</th><th>Planlagt spart</th><th>Faktisk spart</th><th>Gjenstår</th></tr></thead>
          <tbody>
            ${spareplanPre.map((r, i) => {
              const rem = (r.planned||0) - (r.actual||0);
              return `<tr>
                <td>${r.month}</td>
                <td><input class="sp-input" type="number" value="${r.planned||0}" onchange="updateSparePreRow(${i},'planned',this.value)" /></td>
                <td><input class="sp-input" type="number" value="${r.actual||0}" onchange="updateSparePreRow(${i},'actual',this.value)" /></td>
                <td class="${rem<=0?'sp-done':'sp-todo'}">${rem<=0?'✓ Nådd':fmt(rem)+' kr'}</td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot><tr class="sp-total-row">
            <td>Totalt</td><td>${fmt(prePlanned)} kr</td><td>${fmt(preActual)} kr</td>
            <td class="${preActual>=prePlanned?'sp-done':'sp-todo'}">${fmt(Math.max(0,prePlanned-preActual))} kr</td>
          </tr></tfoot>
        </table>
      </div>
      <button class="sp-add-row-btn" onclick="addSparePreRow()">+ Legg til måned</button>
    </div>

    <div class="sp-section">
      <div class="sp-section-header">
        <div class="sp-section-title">🌍 Etter premien</div>
        <div class="sp-section-sub">Månedlig oversikt under reisen</div>
      </div>
      <div class="sp-table-wrap">
        <table class="sp-table">
          <thead><tr><th>Måned</th><th>Inntekt inn</th><th>Utgifter ut</th><th>Netto</th></tr></thead>
          <tbody>
            ${spareplanPost.map((r, i) => {
              const net = (r.income||0) - (r.expenses||0);
              return `<tr>
                <td>${r.month}</td>
                <td><input class="sp-input" type="number" value="${r.income||0}" onchange="updateSparePostRow(${i},'income',this.value)" /></td>
                <td><input class="sp-input" type="number" value="${r.expenses||0}" onchange="updateSparePostRow(${i},'expenses',this.value)" /></td>
                <td class="${net>=0?'sp-done':'sp-todo'}">${net>=0?'+':''}${fmt(net)} kr</td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot><tr class="sp-total-row">
            <td>Totalt</td><td>${fmt(postIncome)} kr</td><td>${fmt(postExpenses)} kr</td>
            <td class="${postIncome>=postExpenses?'sp-done':'sp-todo'}">${fmt(postIncome-postExpenses)} kr</td>
          </tr></tfoot>
        </table>
      </div>
      <button class="sp-add-row-btn" onclick="addSparePostRow()">+ Legg til måned</button>
    </div>

    <div class="sp-summary">
      <div class="sp-summary-title">📊 Total oversikt</div>
      <div class="sp-summary-grid">
        <div class="sp-summary-item">
          <div class="sp-summary-label">Totalt spart</div>
          <div class="sp-summary-val">${fmt(current)} kr</div>
        </div>
        <div class="sp-summary-item">
          <div class="sp-summary-label">Gjenstår til mål</div>
          <div class="sp-summary-val">${fmt(Math.max(0, goal - current))} kr</div>
        </div>
        <div class="sp-summary-item">
          <div class="sp-summary-label">Estimert nådd</div>
          <div class="sp-summary-val sp-summary-date">${estimatedMonth ? estimatedMonth : current >= goal ? '🎉 Nådd!' : '—'}</div>
        </div>
      </div>
    </div>
  `;
}

function addSparing() {
  const inp = document.getElementById('sp-add-input');
  const val = parseInt(inp.value);
  if (!val || val === 0) return;
  savings.current = Math.max(0, savings.current + val);
  savings.log.push({ amount: val, date: new Date().toLocaleDateString('nb-NO') });
  inp.value = '';
  persist();
  buildSpareplan();
  showToast(val > 0 ? `+${fmt(val)} kr spart! 🎉` : `${fmt(val)} kr registrert 💸`);
}

function setSparemaal() {
  const inp = document.getElementById('sp-goal-edit');
  const val = parseInt(inp.value);
  if (val && val > 0) {
    savings.goal = val;
    inp.value = '';
    persist();
    buildSpareplan();
    showToast('Sparemål oppdatert! 🌟');
  }
}

function updateSparePreRow(i, field, val) {
  spareplanPre[i][field] = parseInt(val) || 0;
  persist();
  buildSpareplan();
}

function updateSparePostRow(i, field, val) {
  spareplanPost[i][field] = parseInt(val) || 0;
  persist();
  buildSpareplan();
}

function addSparePreRow() {
  spareplanPre.push({ month: 'Ny måned', planned: 0, actual: 0 });
  persist();
  buildSpareplan();
}

function addSparePostRow() {
  spareplanPost.push({ month: 'Ny måned', income: 0, expenses: 0 });
  persist();
  buildSpareplan();
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
buildSpareplan();
buildTimeline();
buildBudget();
buildGoals();

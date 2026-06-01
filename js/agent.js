/* ============================================================
   agent.js — AI tilpass-plan chat
   ============================================================ */

const HISTORY_TTL = 24 * 60 * 60 * 1000; // 24 timer

function createProgress(barId, labelId, stages) {
  let timer = null, value = 0, stage = 0;
  function draw(pct, lbl) {
    const bar  = document.getElementById(barId);
    const lbl2 = document.getElementById(labelId);
    if (bar)  bar.style.width  = Math.min(100, pct) + '%';
    if (lbl2 && lbl) lbl2.textContent = lbl;
  }
  return {
    start() {
      value = 0; stage = 0;
      draw(0, stages[0].label);
      timer = setInterval(() => {
        const target = stages[stage].pct;
        value += Math.max(0.15, (target - value) * 0.045);
        if (value >= target && stage < stages.length - 1) stage++;
        draw(value, stages[stage].label);
      }, 120);
    },
    finish(onDone) {
      clearInterval(timer); timer = null;
      draw(100, '✨ Ferdig!');
      setTimeout(onDone, 650);
    },
  };
}

const updProgress = createProgress('upd-bar', 'upd-label', [
  { pct: 30, label: 'Tolker forespørselen…' },
  { pct: 75, label: 'Oppdaterer planen…' },
  { pct: 92, label: 'Nesten ferdig…' },
]);

// ── State ─────────────────────────────────────────────────────
// persistentHistory    = [{ role, content }]        — sendes til API
// persistentDisplayLog = [{ html, role, ts }]       — vises + lagres
let persistentHistory    = [];
let persistentDisplayLog = [];
let persistentTypingEl   = null;

// ── Chat-historikk i localStorage (24t) ──────────────────────
function saveChatHistory() {
  try {
    localStorage.setItem('lp_chat_api',     JSON.stringify(persistentHistory));
    localStorage.setItem('lp_chat_display', JSON.stringify(persistentDisplayLog));
  } catch { /* storage full — ignorer */ }
}

function loadChatHistory() {
  try {
    const displayLog = JSON.parse(localStorage.getItem('lp_chat_display') || '[]');
    if (!displayLog.length) return false;

    const lastTs = displayLog[displayLog.length - 1].ts || 0;
    if (Date.now() - lastTs > HISTORY_TTL) return false;

    const apiHistory = JSON.parse(localStorage.getItem('lp_chat_api') || '[]');
    persistentHistory    = apiHistory;
    persistentDisplayLog = displayLog;

    const box = document.getElementById('persistent-messages');
    displayLog.forEach(({ html, role }) => {
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble chat-bubble-' + role;
      bubble.innerHTML = html;
      box.appendChild(bubble);
    });
    box.scrollTop = box.scrollHeight;
    return true;
  } catch {
    return false;
  }
}

// ── API-nøkkel ────────────────────────────────────────────────
function savePersistentApiKey() {
  const inp = document.getElementById('persistent-api-input');
  const key = (inp.value || '').trim();
  if (!key || !key.startsWith('sk-ant-')) {
    inp.style.borderColor = 'var(--pink-deep)';
    inp.placeholder = 'Nøkkelen må starte med sk-ant-…';
    setTimeout(() => { inp.style.borderColor = ''; inp.placeholder = 'sk-ant-…'; }, 3000);
    return;
  }
  localStorage.setItem('lp_api_key', key);
  document.getElementById('persistent-api-section').style.display = 'none';
  initPersistentChat();
}

// ── Panel toggle ──────────────────────────────────────────────
function togglePersistentChat() {
  const panel   = document.getElementById('persistent-panel');
  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open');
  if (!opening) return;

  const apiKey = localStorage.getItem('lp_api_key');
  if (!apiKey) {
    document.getElementById('persistent-api-section').style.display = 'block';
    document.getElementById('persistent-input-row').style.display   = 'none';
    return;
  }

  if (persistentDisplayLog.length === 0) {
    const hadHistory = loadChatHistory();
    if (!hadHistory) {
      initPersistentChat();
    } else {
      document.getElementById('persistent-input-row').style.display = 'flex';
    }
  }
}

function closePersistentChat() {
  document.getElementById('persistent-panel').classList.remove('open');
}

// ── Chat-hjelpere ─────────────────────────────────────────────
function initPersistentChat() {
  document.getElementById('persistent-input-row').style.display = 'flex';
  addPersistentMsg(
    'Hei! 🌺 Jeg kan hjelpe deg tilpasse livsplanen.\n\nFortell meg mer om målene dine, hverdagen din, eller be meg justere tidslinje, mål og budsjett — så oppdaterer jeg planen din i sanntid.',
    'ai'
  );
}

function addPersistentMsg(html, role, save = true) {
  const box    = document.getElementById('persistent-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble-' + role;
  bubble.innerHTML = html.replace(/\n/g, '<br>');
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;

  if (save) {
    persistentDisplayLog.push({ html: bubble.innerHTML, role, ts: Date.now() });
    saveChatHistory();
  }
}

function showPersistentTyping() {
  const box = document.getElementById('persistent-messages');
  persistentTypingEl = document.createElement('div');
  persistentTypingEl.className = 'chat-bubble chat-bubble-ai';
  persistentTypingEl.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  box.appendChild(persistentTypingEl);
  box.scrollTop = box.scrollHeight;
}

function removePersistentTyping() {
  if (persistentTypingEl) { persistentTypingEl.remove(); persistentTypingEl = null; }
}

// ── Send melding ──────────────────────────────────────────────
async function sendPersistentMessage() {
  const inp    = document.getElementById('persistent-input');
  const msg    = (inp.value || '').trim();
  const apiKey = localStorage.getItem('lp_api_key');

  if (!msg) return;
  if (!apiKey) {
    document.getElementById('persistent-api-section').style.display = 'block';
    document.getElementById('persistent-input-row').style.display   = 'none';
    return;
  }

  inp.value    = '';
  inp.disabled = true;

  addPersistentMsg(msg, 'user');
  persistentHistory.push({ role: 'user', content: msg });
  if (persistentHistory.length > 20) persistentHistory = persistentHistory.slice(-20);

  showPersistentTyping();
  document.getElementById('persistent-updating').style.display = 'block';
  updProgress.start();

  const systemPrompt = `Du er en personlig livsplanlegger for Paris. Paris planlegger en reise fra september 2026 til januar 2027: Norge → Europa → Brasil → Latin-Amerika.

NÅVÆRENDE PLAN (dette er den faktiske dataen du skal oppdatere):

Sparemål: ${savings.goal} kr | Spart: ${savings.current} kr

Mål (goals):
${JSON.stringify(goals)}

Måneder (months):
${JSON.stringify(months)}

Budsjett (budgetSections):
${JSON.stringify(budget)}

---

Svar ALLTID med dette eksakte JSON-formatet — ingen tekst rundt, ingen markdown:
{"message":"Kort svar til brukeren på norsk","update":{"goals":[...],"months":[...],"budgetSections":[...],"sparemaal":0}}

REGLER:
- Utelat "update" HELT hvis ingenting endres (kun spørsmål/motivasjon)
- Utelat et felt i "update" hvis akkurat det ikke endres
- NÅR du inkluderer "goals": returner ALLE mål inkl. uendrede, med nye lagt til / endrede oppdatert
- NÅR du inkluderer "months": returner ALLE måneder inkl. uendrede
- NÅR du inkluderer "budgetSections": returner ALLE seksjoner inkl. uendrede
- goals-format: [{"icon":"emoji","title":"...","desc":"...","pct":0}]
- todos-format: [{"text":"...","done":false}]
- budgetSections-format: [{"title":"...","rows":[{"cat":"...","budget":0,"spent":0}]}]
- Svar på norsk. Vær konkret.`;

  let success = false;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        system: systemPrompt,
        messages: persistentHistory,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API-feil (${res.status})`);
    }

    const result = await res.json();
    const raw    = result.content[0].text;
    persistentHistory.push({ role: 'assistant', content: raw });

    removePersistentTyping();
    updProgress.finish(() => {
      document.getElementById('persistent-updating').style.display = 'none';
    });

    let parsed;
    try {
      const start = raw.indexOf('{');
      const end   = raw.lastIndexOf('}');
      parsed = JSON.parse(raw.slice(start, end + 1));
    } catch {
      addPersistentMsg(raw, 'ai');
      success = true;
      return;
    }

    addPersistentMsg(parsed.message || raw, 'ai');
    if (parsed.update && Object.keys(parsed.update).length > 0) {
      applyPlanUpdate(parsed.update);
    }
    success = true;

  } catch (err) {
    // Fjern brukerens melding fra API-historikk så retry fungerer
    persistentHistory.pop();

    removePersistentTyping();
    updProgress.finish(() => {
      document.getElementById('persistent-updating').style.display = 'none';
    });

    const isKeyError = err.message.toLowerCase().includes('api_key') ||
                       err.message.toLowerCase().includes('unauthorized') ||
                       err.message.includes('401');
    if (isKeyError) {
      localStorage.removeItem('lp_api_key');
      addPersistentMsg('API-nøkkelen ble avvist. Skriv inn en gyldig nøkkel for å fortsette.', 'ai');
      document.getElementById('persistent-api-section').style.display = 'block';
      document.getElementById('persistent-input-row').style.display   = 'none';
    } else {
      addPersistentMsg(`Noe gikk galt: ${err.message}\n\nPrøv å sende meldingen på nytt.`, 'ai');
    }
  } finally {
    inp.disabled = false;
    if (success || document.getElementById('persistent-input-row').style.display !== 'none') {
      inp.focus();
    }
  }
}

// ── Anvend planendringer ──────────────────────────────────────
function isValidArray(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

function applyPlanUpdate(update) {
  let changed = false;

  if (isValidArray(update.goals))          { goals        = update.goals;          changed = true; }
  if (isValidArray(update.months))         { months       = update.months;         changed = true; }
  if (isValidArray(update.budgetSections)) { budget       = update.budgetSections; changed = true; }
  if (update.sparemaal > 0)               { savings.goal = update.sparemaal;      changed = true; }

  if (changed) {
    persist();
    buildTimeline();
    buildBudget();
    buildGoals();
    buildSavings();
    showToast('Plan oppdatert! ✨');
  }
}

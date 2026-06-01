/* ============================================================
   agent.js — AI tilpass-plan chat
   ============================================================ */

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
let persistentHistory  = [];
let persistentTypingEl = null;

function togglePersistentChat() {
  const panel   = document.getElementById('persistent-panel');
  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open');
  if (!opening) return;

  const apiKey = localStorage.getItem('lp_api_key');
  if (!apiKey) {
    document.getElementById('persistent-api-section').style.display = 'block';
    document.getElementById('persistent-input-row').style.display   = 'none';
  } else if (persistentHistory.length === 0) {
    initPersistentChat();
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

function addPersistentMsg(html, role) {
  const box    = document.getElementById('persistent-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble-' + role;
  bubble.innerHTML = html.replace(/\n/g, '<br>');
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
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

  inp.value = '';
  inp.disabled = true;
  addPersistentMsg(msg, 'user');
  persistentHistory.push({ role: 'user', content: msg });
  if (persistentHistory.length > 20) persistentHistory = persistentHistory.slice(-20);

  showPersistentTyping();
  document.getElementById('persistent-updating').style.display = 'block';
  updProgress.start();

  const systemPrompt = `Du er en personlig livsplanlegger for Paris. Paris planlegger en reise fra september 2026 til januar 2027: Norge → Europa → Brasil → Latin-Amerika.

Nåværende plan:
- Avreise: 1. september 2026
- Sparemål: ${savings.goal ? savings.goal.toLocaleString('no-NO') + ' kr' : '25 000 kr'} (Spart: ${savings.current ? savings.current.toLocaleString('no-NO') + ' kr' : '0 kr'})
- Måneder i tidslinjen: ${months.length}
- Mål: ${goals.map(g => g.title).join(' | ')}

Brukeren kan be deg om å:
- Endre eller legge til mål/delmål
- Justere tidslinjen (måneder, todos, kontekst)
- Endre budsjettet
- Gjøre planen mer personlig basert på ny kontekst
- Gi råd og motivasjon

Svar ALLTID med et gyldig JSON-objekt:
{
  "message": "Svarmeldingen din på norsk her",
  "update": {
    "goals": [...],
    "months": [...],
    "budgetSections": [...],
    "sparemaal": 30000
  }
}

Inkluder kun feltene i "update" som faktisk endres. Utelat "update" helt hvis ingenting i planen endres.
Svar på norsk. Vær konkret og motiverende.`;

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
        max_tokens: 4000,
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
      inp.disabled = false; inp.focus();
      return;
    }

    addPersistentMsg(parsed.message || raw, 'ai');
    if (parsed.update && Object.keys(parsed.update).length > 0) {
      applyPlanUpdate(parsed.update);
    }

  } catch (err) {
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
      addPersistentMsg(`Noe gikk galt: ${err.message}`, 'ai');
    }
  }

  inp.disabled = false;
  inp.focus();
}

// ── Anvend planendringer ──────────────────────────────────────
function applyPlanUpdate(update) {
  let changed = false;

  if (update.goals)          { goals          = update.goals;          changed = true; }
  if (update.months)         { months         = update.months;         changed = true; }
  if (update.budgetSections) { budget         = update.budgetSections; changed = true; }
  if (update.sparemaal)      { savings.goal   = update.sparemaal;      changed = true; }

  if (changed) {
    persist();
    buildTimeline();
    buildBudget();
    buildGoals();
    buildSavings();
    showToast('Plan oppdatert! ✨');
  }
}

# Livsplan — prosjektkontekst for Claude Code

## Hva er dette
En personlig livsplan-webapp (HTML/CSS/JS, ingen rammeverk) for en person som planlegger
et år med jobb, reise og studier. Åpnes direkte i nettleseren — ingen server nødvendig.
All data lagres i `localStorage`.

---

## Livsplan — faser og innhold

### 🇳🇴 Sommer i Norge (jun–aug 2026)
- Deltidsjobb på **Høyer Skøyen** (klesbutikk)
- Småjobber ved siden av: dogwalking, hagearbeid, generelle småjobber via Finn/Bark
- Ta **lappen** — kun oppkjøring gjenstår, sett av ~10 000 kr
- Spare **15–25k** til avreise i september
- Fullføre **Harvard CS50 Python** (gratis nettkurs)
- Bygge apper med **Claude Code** for gøy og læring
- Ha en sosial sommer med venner — ikke bare jobb

### 🎓 Studier (aug 2026 → mai 2027)
- Starter **nettstudier i august 2026**
- Gir **studielån 11 000 kr/mnd** fra september 2026
- **Storstipend ~30 000 kr** utbetales i august 2026
- Studielånet dekker levekostnader i utlandet — lønn kan spares

### 🇪🇺 Europa (sep–nov 2026)
- Destinasjon: **Spania, Portugal eller Hellas** (ikke bestemt ennå)
- Jobb: **retail** (H&M, Zara, Mango eller lokale kjeder)
- Mål: få jobb innen 4 uker, bli selvforsynt
- Bo i WG/flatshare, bygge lokalt nettverk
- Spare størst mulig andel av lønn til Brasil-turen

### 🇧🇷 Brasil (des 2026)
- **4–5 uker** fra slutten av desember
- Nyttårsfest på Copacabana 🎆
- Leve på sparepenger + studielån
- Dette er drømmemålet — ikke stress, bare nyt

### 🌎 Mexico / Colombia (jan 2027)
- **Venner på utveksling** hit — bo med dem noen uker
- Utforske, koble av, planlegge resten av 2027

---

## Økonomi-oversikt

| Kilde | Beløp | Når |
|---|---|---|
| Høyer + småjobber (sommer) | 15–25k spart | jun–aug 2026 |
| Storstipend | ~30 000 kr | aug 2026 |
| Studielån | 11 000 kr/mnd | sep 2026 → mai 2027 |
| Retailjobb i Europa | Levbar lønn (spares) | sep–nov 2026 |

**Faste utgifter å budsjettere:**
- Lappen: ~10 000 kr
- Fly til Europa: ~3 000 kr
- Bolig Europa (×3 mnd): ~12 000 kr
- Fly Europa → Brasil: ~6 000 kr
- Brasil opphold (4–5 uker): ~7 000 kr
- Fly Brasil → Mexico/Colombia: ~3 000 kr
- Buffer/nødfond: ~10 000 kr

---

## Prosjektstruktur

```
livsplan/
├── index.html          ← HTML-skjelett, alle panels
├── css/
│   └── style.css       ← all styling (cutesy design system)
└── js/
    ├── data.js         ← DEFAULT_MONTHS, DEFAULT_BUDGET_SECTIONS, DEFAULT_GOALS, konstanter
    └── app.js          ← all logikk: state, persist(), buildX(), eventhandlers
```

### Viktige konstanter i data.js
- `SAVINGS_GOAL = 25000` — sparemål til avreise
- `DEPARTURE_DATE = new Date('2026-09-01')` — brukes av countdown

### State-variabler i app.js
- `months` — array av månedsobjekter med todos, notater, jobb, sted
- `budget` — array av seksjoner, hver med `rows[]`
- `goals` — array av mål med tittel, beskrivelse, ikon, pct
- `savings` — `{ current, log[], goal }` — sparetracking

---

## Design-system

**Fonter:** Playfair Display (serif, headings) + Nunito (sans, body)
**Palett:** Rosa (#E8619A), lilla (#C9A8E0), mint (#7ECBB8), fersken (#F4A97A), gul (#F5C842)
**Stil:** Cutesy, myke skygger, pill-border-radius, gradient-knapper, polka dot bakgrunn
**Brasil-touch:** Tropical gul/grønn aksenter på LatAm-måneder, palme-emoji deko

**CSS-variabler (viktigste):**
```css
--pink, --pink-light, --pink-deep
--lilac, --lilac-light
--mint, --mint-light
--peach, --peach-light
--bg, --surface, --surface2, --surface3
--border, --border-strong
--text, --text-muted
--radius (16px), --radius-sm (10px), --radius-pill (50px)
--shadow, --shadow-hover
```

---

## Features som er bygget

- ✅ **Countdown** til avreise (måneder / uker / dager), oppdateres hvert minutt
- ✅ **Sparetracker** — legg til beløp, progressbar med ✨, milepæler (🌱🌸🌺🦋🌟), mutable sparemål
- ✅ **Tidslinje** — 8 månedskort (jun 2026 → jan 2027), toggle åpne/lukke
  - Todo-lister med checkbox, legg til / slett oppgaver
  - Redigerbare felter (sted, jobb) med inline edit
  - Notater (textarea)
  - Fremgangsbar per måned
- ✅ **Budsjett** — 3 seksjoner (Norge / Europa / LatAm)
  - Inline redigerbare beløp
  - Legg til / slett poster per seksjon
  - 4 metrics-kort øverst (totalbudsjett, brukt, gjenstår, forbrukt%)
- ✅ **Mål** — contenteditable tittel og beskrivelse (klikk for å redigere)
  - Range slider for fremgang
  - Legg til / slett mål
- ✅ **localStorage** — alt lagres automatisk, persist() kalles ved alle endringer
- ✅ **Toast-notifikasjoner** — vises ved lagring og hendelser

---

## Ideer til videre utvikling

- [ ] Deploy til **GitHub Pages** (gratis hosting)
- [ ] **Jobbsøker-tracker** — firma, land, status (søkt / intervju / avslag / tilbud)
- [ ] **Destinasjonssammenligning** — Spania vs Portugal vs Hellas (levekostnader, jobb, vær)
- [ ] **Budsjett-graf** — visuell fordeling med Chart.js eller D3
- [ ] **Eksport til PDF** — livsplanen som nedlastbart dokument
- [ ] **Mørk modus** toggle
- [ ] **PWA** — legg til på hjemskjerm på telefon

---

## Hvordan starte

```bash
# Åpne i nettleser direkte:
open index.html

# Eller med en enkel lokal server:
npx serve .
# eller
python3 -m http.server 3000
```

---

## Nyttige Claude Code-kommandoer å starte med

```
Les denne filen og bli kjent med prosjektet. Still gjerne spørsmål.
```

```
Legg til en jobbsøker-tracker som ny fane i appen
```

```
Deploy denne appen til GitHub Pages
```

```
Legg til en destinasjonssammenligning mellom Spania, Portugal og Hellas
```

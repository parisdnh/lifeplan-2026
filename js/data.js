/* ============================================================
   data.js — livsplan default content
   ============================================================ */

const GOAL_ICONS = ['🌍','💼','🏠','💰','🗣️','❤️','✈️','📚','🏃','🎯','🌊','🎸','🌺','🦋','✨'];

const DEFAULT_MONTHS = [
  {
    id:'jun2026', name:'Juni 2026', color:'#5CAD8A',
    phase:'norway', badgeText:'🇳🇴 Norge',
    location:'Oslo', jobb:'Høyer Skøyen (deltid) + småjobber',
    status:'Planlegging', notes:'',
    context:'Drømmesommerjobben er i boks! Høyer Skøyen deltid = tid til å bygge skills, spare penger og søke jobb i Europa — alt på én gang.',
    todos:[
      {text:'Bestill første oppkjøring — søk på Autoskolen, Signal eller din lokale trafikskole',done:false},
      {text:'Opprett profil på Finn.no og Bark.no for dogwalking og hagearbeid',done:false},
      {text:'Start Harvard CS50 Python — cs50.harvard.edu/python (gratis, 9 uker)',done:false},
      {text:'Bestem deg for Europa-destinasjon: Spania, Portugal eller Hellas',done:false},
      {text:'Lag CV på norsk OG engelsk — bruk Canva.com for fin layout',done:false},
      {text:'Søk på H&M careers: hmgroup.com/career',done:false},
      {text:'Søk på Zara/Inditex: inditex.com/join-us',done:false},
      {text:'Åpne dedikert sparekonto (Bulder Bank eller DNB) — mål: 20k+ innen september',done:false},
    ]
  },
  {
    id:'jul2026', name:'Juli 2026', color:'#5CAD8A',
    phase:'norway', badgeText:'🇳🇴 Norge',
    location:'Oslo', jobb:'Høyer Skøyen + dogwalking / hagearbeid',
    status:'Inntekt & skills', notes:'',
    context:'Høysesong på Høyer + maksimer småjobber. Fortsett CS50 og bygg første app med Claude Code.',
    todos:[
      {text:'Fullfør CS50 Python modul 1–4 (lister, løkker, funksjoner)',done:false},
      {text:'Bygg en liten app med Claude Code — f.eks. en budsjettkalkulatorer eller reise-planner',done:false},
      {text:'Ta minst 4 nye oppkjøringsstimer',done:false},
      {text:'Spar minimum 5 000 kr denne måneden',done:false},
      {text:'Søk jobber via Infojobs.es (Spania) / Net-empregos.com (Portugal) / Kariera.gr (Hellas)',done:false},
      {text:'Søk på Mango careers: mango.com/careers',done:false},
      {text:'Finn flatshare-nettsider: Idealista.com (ESP/PRT) eller Spiti.gr (GRE)',done:false},
      {text:'Vær med venner — ikke bare jobb 🌞',done:false},
    ]
  },
  {
    id:'aug2026', name:'August 2026', color:'#5CAD8A',
    phase:'norway', badgeText:'🇳🇴 Norge',
    location:'Oslo', jobb:'Høyer Skøyen + nettskolestart',
    status:'Sluttspurt Norge', notes:'',
    context:'Nettstudie starter → studielån 11k/mnd. Storstipend ~30k. Avreise nærmer seg — book fly og korttidsbolig nå!',
    todos:[
      {text:'Bestå førerprøven! Book via din trafikskole 🚗',done:false},
      {text:'Bekreft oppstart nettstudier og motta studielånskort fra Lånekassen',done:false},
      {text:'Motta storstipend (~30k) — sett mesteparten på sparekonto',done:false},
      {text:'Book fly til Europa i september — sjekk Skyscanner.no, Google Flights, Momondo.no',done:false},
      {text:'Book første 1–2 ukers bolig — Airbnb, Booking.com eller hostel via Hostelworld.com',done:false},
      {text:'Bestill Wise-kort (wise.com) — gratis, billigst å ta ut penger og ta imot lønn i utlandet',done:false},
      {text:'Fullfør CS50 Python modul 5–9 og ta sluttsertifikatet',done:false},
      {text:'Si takk og farvel på Høyer 💗',done:false},
    ]
  },
  {
    id:'sep2026', name:'September 2026', color:'#C9A8E0',
    phase:'europe', badgeText:'🇪🇺 Europa',
    location:'TBD — Spania / Portugal / Hellas', jobb:'Retailjobb (søker aktivt)',
    status:'Ankomst', notes:'',
    context:'Ankommer med sparepenger + studielån 11k/mnd starter. Mål: bli selvforsynt innen 4 uker. Studielånet er sikkerhetsnett — jobb er bonus.',
    todos:[
      {text:'Finn permanent flatshare — Idealista.com, SpainWG.com (ESP) / Imovirtual.com (PRT) / XE.gr (GRE)',done:false},
      {text:'Søk om NIE (Spania) / NHR (Portugal) / AMKA (Hellas) for å jobbe lovlig',done:false},
      {text:'Åpne lokal bankkonto ELLER bruk Wise som primærkonto',done:false},
      {text:'Lever CV personlig i H&M, Zara, Mango og lokale klesbutikker',done:false},
      {text:'Bli med i Facebook-grupper: "Expats in [by]", "Norwegians in [by]"',done:false},
      {text:'Finn Internations.org-møter i din by — gratis nettverk med expats',done:false},
      {text:'Sett opp studierutine — f.eks. 2 timer studie tidlig morgen før jobb',done:false},
      {text:'Utforsk nabolaget og finn favorittkafeen din ☕',done:false},
    ]
  },
  {
    id:'okt2026', name:'Oktober 2026', color:'#C9A8E0',
    phase:'europe', badgeText:'🇪🇺 Europa',
    location:'Europa — destinasjon 1', jobb:'Retailjobb + studielån',
    status:'Etablert', notes:'',
    context:'Nå i jobb! Studielån dekker alt — jobb er ren sparing til Brasil og LatAm. Book Brasil-fly nå for best pris.',
    todos:[
      {text:'Spar minimum 4 000 kr av lønn denne måneden',done:false},
      {text:'Book Brasil-fly i desember — kjøp nå for best pris! Google Flights eller Momondo.no',done:false},
      {text:'Søk etter nyttårsbolig i Rio de Janeiro — Hostelworld.com eller Booking.com (BOOK TIDLIG)',done:false},
      {text:'Fullfør nettskole-modul for oktober',done:false},
      {text:'Utforsk lokale dagsturer og billige opplevelser',done:false},
      {text:'Sjekk om venner i Mexico/Colombia er klare — koordiner januar-reise',done:false},
    ]
  },
  {
    id:'nov2026', name:'November 2026', color:'#C9A8E0',
    phase:'europe', badgeText:'🇪🇺 Europa',
    location:'Europa — destinasjon 1', jobb:'Retailjobb + studielån',
    status:'Stabil rytme', notes:'',
    context:'Siste måned i Europa. Evaluer om du vil tilbake etter LatAm-turen. Bekreft alle reisedetaljer.',
    todos:[
      {text:'Spar minimum 4 000 kr av lønn',done:false},
      {text:'Kjøp reiseforsikring for Latin-Amerika — SafetyWing.com (billigst) eller Gouda/Europeiske',done:false},
      {text:'Bekreft Brasil-fly og Rio-bolig',done:false},
      {text:'Book fly Brasil → Mexico City / Bogotá / Medellín',done:false},
      {text:'Kontakt venner på utveksling — avtal møtested og bolig i januar',done:false},
      {text:'Fullfør nettskole-modul',done:false},
      {text:'Evaluer: vil du tilbake til samme by i Europa etter nyttår?',done:false},
    ]
  },
  {
    id:'des2026', name:'Desember 2026', color:'#F4A97A',
    phase:'latam', badgeText:'🇧🇷 Brasil',
    location:'Brasil (4–5 uker)', jobb:'Studielån + sparebuffer',
    status:'Drømmen 🌊', notes:'',
    context:'BRASIL! Lev på studielån + sparepenger. Ingen stress om jobb. Nyttårsfest, varme og samba! 🎉',
    todos:[
      {text:'Ankomst Rio de Janeiro — sjekk inn og utforsk',done:false},
      {text:'Kjøp brasiliansk SIM-kort — Claro, Vivo eller TIM (billigst data)',done:false},
      {text:'Last ned offline kart — Google Maps offline eller Maps.me',done:false},
      {text:'Besøk Lapa, Santa Teresa og Ipanema-stranden',done:false},
      {text:'Nyttårsfest på Copacabana 🎆 — stå opp tidlig for god plass!',done:false},
      {text:'Ikke stress om jobb — dette er drømmeferien din ✨',done:false},
      {text:'Book fly til Mexico/Colombia',done:false},
    ]
  },
  {
    id:'jan2027', name:'Januar 2027', color:'#F4A97A',
    phase:'latam', badgeText:'🌎 Mexico / Colombia',
    location:'Mexico / Colombia', jobb:'Studielån + sparebuffer',
    status:'Med venner 💛', notes:'',
    context:'Venner på utveksling! Bo med dem, utforsk, og nyt å ha et ferdig nettverk lokalt. Planlegg resten av 2027.',
    todos:[
      {text:'Ankomst — finn plass hos / nær vennene',done:false},
      {text:'Utforsk Mexico City / Bogotá / Medellín med venner',done:false},
      {text:'Hold nettskolen i gang — 2 timer studie om dagen',done:false},
      {text:'Evaluer: bli lenger i LatAm, tilbake til Europa, eller noe annet?',done:false},
      {text:'Planlegg resten av 2027 — skriv ned drømmene 🌍',done:false},
    ]
  },
];

const DEFAULT_BUDGET_SECTIONS = [
  {
    title:'💰 Inntekter (jun–aug)',
    rows:[
      {cat:'Juni — Høyer deltid + småjobber', budget:2000,  spent:0},
      {cat:'Juli — Høyer + sesong',           budget:9000,  spent:0},
      {cat:'August — Høyer høysesong',        budget:15000, spent:0},
    ]
  },
  {
    title:'📋 Utgifter (jun–aug)',
    rows:[
      {cat:'Lappen (oppkjøring + prøve)',     budget:12500, spent:0},
      {cat:'Sosialt / sommer',                budget:500,   spent:0},
    ]
  },
  {
    title:'🇪🇺 Europa (sep–nov)',
    rows:[
      {cat:'Fly til Europa',               budget:3000,  spent:0},
      {cat:'Bolig per mnd (×3)',           budget:12000, spent:0},
      {cat:'Mat og dagligvarer (×3)',      budget:6000,  spent:0},
      {cat:'Transport lokalt (×3)',        budget:3000,  spent:0},
      {cat:'Opplevelser / reise lokalt',   budget:4000,  spent:0},
    ]
  },
  {
    title:'🌎 Latin-Amerika (des–jan)',
    rows:[
      {cat:'Fly Europa → Brasil',          budget:6000,  spent:0},
      {cat:'Bolig Brasil (4–5 uker)',      budget:7000,  spent:0},
      {cat:'Fly Brasil → Mexico/Colombia', budget:3000,  spent:0},
      {cat:'Bolig Mexico/Colombia',        budget:5000,  spent:0},
      {cat:'Mat og opplevelser LatAm',     budget:8000,  spent:0},
      {cat:'Buffer / nødfond',             budget:10000, spent:0},
    ]
  }
];

const DEFAULT_GOALS = [
  {
    icon:'🚗',
    title:'Ta lappen innen august 2026',
    desc:'Book oppkjøring nå — Autoskolen, Signal eller lokal trafikskole. Trenger ca. 8–12 timer à ~700 kr = ~8–9k. Book teoriprøve og oppkjøring via Statens Vegvesen (vegvesen.no). Sett av 10 000 kr totalt.',
    pct:0
  },
  {
    icon:'💰',
    title:'Spar 20 000 kr til september',
    desc:'Åpne dedikert sparekonto på Bulder Bank, Sbanken eller DNB. Mål: minst 5k/mnd fra Høyer + dogwalking/hagearbeid via Finn.no og Bark.no. Storstipend ~30k og studielån 11k/mnd starter aug/sep.',
    pct:0
  },
  {
    icon:'💼',
    title:'Få retailjobb i Europa innen 4 uker',
    desc:'Søk på: H&M (hmgroup.com/career), Zara/Inditex (inditex.com/join-us), Mango (mango.com/careers). Lokale jobbannonser: Infojobs.es (Spania), Net-empregos.com (Portugal), Kariera.gr (Hellas). LinkedIn jobsøk + møt opp personlig i butikk med trykt CV!',
    pct:0
  },
  {
    icon:'📚',
    title:'Fullfør Harvard CS50 Python',
    desc:'Gratis på cs50.harvard.edu/python — 9 uker, ca. 3–5t/uke. Start juni, fullfør august. Gir et Harvard-sertifikat du kan vise frem. Dekker variabler, funksjoner, filer, API-er og objektorientering.',
    pct:0
  },
  {
    icon:'🛠️',
    title:'Bygg 2–3 apper med Claude Code',
    desc:'Ideer: reisebudsjett-tracker, jobbsøker-CRM, studie-timer, dagbok-app. Bruk Claude Code i terminalen eller VS Code. Livsplan-appen teller som nr. 1! Deploy gratis på GitHub Pages eller Netlify.',
    pct:10
  },
  {
    icon:'🏠',
    title:'Finn bolig i Europa før avreise',
    desc:'Spania: Idealista.com, Fotocasa.es, SpainWG.com. Portugal: Idealista.pt, Imovirtual.com, Uniplaces.com. Hellas: Spiti.gr, XE.gr. Facebook: søk "Rooms for rent [by]" og "Expats in [by]". Book første uke på Airbnb — finn permanent bolig når du er der.',
    pct:0
  },
  {
    icon:'🇧🇷',
    title:'Brasil og Copacabana-nyttår',
    desc:'Book fly tidlig (oktober) via Google Flights, Momondo.no eller Skyscanner — Europa→Rio de Janeiro. Nyttårsaften på Copacabana er ENORMT populært — book hotell/hostel på Hostelworld.com eller Booking.com senest i oktober!',
    pct:0
  },
  {
    icon:'💳',
    title:'Sett opp økonomi for utlandet',
    desc:'Opprett Wise-konto på wise.com — bestill fysisk kort (gratis). Beste løsning for å ta imot europeisk lønn, konvertere valuta og ta ut penger billig. Søk om NIE (Spania) / NHR (Portugal) / AMKA (Hellas) ved ankomst — nødvendig for å jobbe lovlig.',
    pct:0
  },
];

const DEFAULT_SPAREPLAN_PRE = [
  { month: 'Juni 2026',   planned: 2000,  actual: 0 },
  { month: 'Juli 2026',   planned: 9000,  actual: 0 },
  { month: 'August 2026', planned: 15000, actual: 0 },
];

const DEFAULT_SPAREPLAN_POST = [
  { month: 'September 2026', income: 0, expenses: 0 },
  { month: 'Oktober 2026',   income: 0, expenses: 0 },
  { month: 'November 2026',  income: 0, expenses: 0 },
  { month: 'Desember 2026',  income: 0, expenses: 0 },
  { month: 'Januar 2027',    income: 0, expenses: 0 },
];

const SAVINGS_GOAL = 25000;
const DEPARTURE_DATE = new Date('2026-09-01');

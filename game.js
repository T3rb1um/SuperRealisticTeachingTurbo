'use strict';
/* =====================================================================
   Klasse im Griff! – Prototyp (Graubox C)
   Berufsschule, Klasse IM24 (Industriemechanik / Mechatronik)
   Störer mit Vorwarnung, Präsenz, Tafel mit Arbeitsformen, Kopierer,
   Pult-Ablage, Tür mit Zuspätkommern.
   Alle Spielzahlen stehen hier oben im CONFIG-Objekt.
   Einheiten: Zeiten in Sekunden, Strecken in Kacheln (1 Kachel = 16 px).
   ===================================================================== */
const CONFIG = {
  lessonSeconds: 90,
  phases: { warmupEnd: 10, finalStart: 70 },   // Einstieg 0–10 s, Schlussspurt ab 70 s
  warmupMaxProblems: 1,
  maxProblems: 3,                               // max. gleichzeitige Probleme
  finalSpawnMult: 1.3,

  player: { speed: 3.4, radius: 0.28, reach: 1.15, cornerAssist: 0.45 },

  presence: { radius: 3.0, show: true, blocksSpread: true },

  kids: {
    cols: [4, 8, 12, 16],       // Tisch-Mitten (x)
    rows: [2.6, 4.9, 7.2],      // Tisch-Oberkanten (y) → 12 Azubis
    deskWidth: 1.8,
    fidgetTime: 4.5,            // VORWARNUNG: so lange ist ein Kind zappelig, bevor es trödelt
    presenceCalm: 0.5,          // so lange musst du in der Nähe stehen, damit sich ein zappeliges Kind beruhigt
    idleToLoud: 8,
    spreadEvery: 5,
    spawnInterval: 8.5,         // Ø Sekunden zwischen neuen Unruhe-Fällen (wird mit der Arbeitsform multipliziert)
    spawnJitter: 0.5,
    scoldWorkingPenalty: 3,
  },

  // Arbeitsformen: An der Tafel mit 1/2/3 (oder Q) wählen, dann E halten.
  forms: [
    { name: 'EINZEL',  label: 'Einzelarbeit',  write: 1.5, duration: 20, noise: 0.5, learn: 0.6, sheets: false },
    { name: 'PARTNER', label: 'Partnerarbeit', write: 2.0, duration: 35, noise: 1.0, learn: 1.0, sheets: false },
    { name: 'GRUPPE',  label: 'Gruppenarbeit', write: 3.0, duration: 70, noise: 1.3, learn: 1.6, sheets: true },  // jede Gruppe (Spalte) braucht 1 Blatt
  ],
  startForm: 1,

  board: {
    keepProgress: 2.0,
    writingSpawnMult: 2.0,      // Rücken zur Klasse
    writingExtraLimit: 2,
    writingEscalateMult: 1.5,
    backstabChance: 0.3,
    emptyDelay: 4,
    waveEvery: 0.7,
    lowWarn: 0.25,
  },

  copier: {
    warmup: 2.5,                // Kopierer wärmt erst auf
    printEvery: 1.2,
    trayMax: 6,
    carryMax: 6,                // du nimmst alle Blätter aus dem Fach (dann sind die Hände voll → Pult)
    reach: 0.8,
    patience: 20,
    requestInterval: 16,
    requestJitter: 0.4,
    firstRequestAt: 12,
    cooldown: 10,               // nach vollem Auftrag + leerem Fach muss er abkühlen
  },

  // Austeilen: 1 Blatt in der Hand geht sofort. Aus einem Stapel musst du E halten und „frickeln“.
  give: { stackMin: 0.4, stackMax: 1.4 },

  deskStash: true,              // Pult: Stapel ablegen, einzelne Blätter schnell wieder nehmen (später Upgrade)
  deskStashMax: 6,              // so viele Blätter passen aufs Pult
  deskTakeEvery: 0.35,          // Pult: E halten nimmt alle 0,35 s ein weiteres Blatt

  door: {
    lateMin: 1, lateMax: 2,     // Zuspätkommer pro Stunde
    arriveFrom: 8, arriveTo: 45,
    patience: 12,               // danach klopft es lauter
    walkSpeed: 2.4,
    wantSheetChance: 0.8,       // Zuspätkommer fragen nach dem Hinsetzen meist sofort nach dem Blatt
  },

  order: {
    start: 100,
    recover: 0.6,
    drain: { idle: 0.8, loud: 1.6, boardEmpty: 1.0, waiting: 0.3, knock: 0.5, knockLoud: 1.0 },
  },

  // Lernfortschritt ist die Wertung. Ordnung bestimmt, wie gut gelernt wird.
  learning: {
    perKid: 0.1,                // Lernpunkte pro arbeitendem Azubi und Sekunde (Partnerarbeit, volle Ordnung)
    fullAt: 90,                 // ab dieser Ordnung lernt die Klasse voll, darunter anteilig
    stars: [40, 65, 95],        // Lernpunkte für 1/2/3 Sterne
  },

  events: {
    question: { firstAt: 18, every: 28, jitter: 0.4, patience: 15, explain: 1.0, bonus: 5, soothe: 10 },   // soothe: E beim Azubi = vertrösten (+10 s)   // „?“ → an der Tafel erklären
    wc:       { firstAt: 25, every: 40, jitter: 0.4, patience: 10, awayMin: 10, awayMax: 15 },  // „WC“ → beim Azubi E
    phone:    { chance: 0.4, from: 20, to: 70, warn: 2, orderHit: 6, drain: 1.5, hold: 1.0, refund: 3 },
    jamChance: 0.04,            // Papierstau pro Blatt (nie im ersten Auftrag der Stunde)
    jamHits: 4,                 // so oft E hämmern
  },

  taler: { perTask: 1, perStar: 5 },

  teacher: 2,                   // Lehrkraft: 0 Frau Sommer, 1 Herr Brandt, 2 Herr Demir, 3 Frau Roth, 4 Frau Adeyemi

  // Woche: Mo–Fr, je 3 Stunden, nach jedem Tag Shop, am Freitag Klassenarbeit
  week: {
    days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'],
    lessonsPerDay: 2,
    examTarget: 540,            // Lernpunkte der ganzen Woche für Note 4 (ca. 54 pro Stunde)
    examGrowth: 1.2,            // jede Woche wird die Klassenarbeit schwerer
    difficultyPerDay: 0.07,     // jeder Tag: Ereignisse ca. 7 % häufiger
    extraProblemEvery: 3,       // alle 3 Tage darf 1 Problem mehr gleichzeitig offen sein
    changerAfterDay: 2,         // nach Mittwoch: Game-Changer (1 aus 3)
    changerGrade: 3,            // Klassenarbeit mit Note 3 oder besser: noch ein Game-Changer
  },
};
const BASE_CONFIG = structuredClone(CONFIG);

/* Tägliche Upgrades (Feierabend, für Taler, je 3 Stufen) */
const UPGRADES = [
  { id: 'shoes',    name: 'Turnschuhe',       desc: '+20 % Laufgeschwindigkeit pro Stufe.',                              cost: [25, 35, 50] },
  { id: 'pult',     name: 'Größere Ablage',   desc: '+3 Blätter aufs Pult pro Stufe.',                                   cost: [20, 30, 45] },
  { id: 'copier',   name: 'Kopierer-Wartung', desc: 'Wärmt schneller auf, kühlt schneller ab, Papierstau wird seltener.', cost: [25, 35, 50] },
  { id: 'chalk',    name: 'Gute Kreide',      desc: '20 % schneller an die Tafel schreiben pro Stufe.',                  cost: [25, 35, 50] },
  { id: 'presence', name: 'Lehrerblick',      desc: 'Größerer Präsenz-Kreis.',                                           cost: [30, 45, 60] },
  { id: 'patience', name: 'Geduldige Azubis', desc: 'Blatt-Wünsche, Fragen, WC und Klopfen warten 20 % länger.',         cost: [25, 35, 50] },
];

/* Game-Changer: Mittwoch und nach guter Klassenarbeit, 1 aus 3. Jeder hat einen kleinen Haken. */
const CHANGERS = [
  { id: 'opener',  name: 'Türöffner',             desc: 'Die Tür geht von selbst auf, kurz bevor das Klopfen laut wird.',               catch: 'Für Zuspätkommer gibt es keine Taler mehr.' },
  { id: 'review',  name: 'Wiederholungsaufgaben', desc: 'Ist die Tafel leer, arbeitet die Klasse an alten Aufgaben weiter und trödelt nicht.', catch: 'Dabei lernt sie nur 30 %.' },
  { id: 'rules',   name: 'Klassenregeln-Poster',  desc: 'Unruhige Azubis zappeln doppelt so lange, bevor sie trödeln.',                  catch: 'Falsch ermahnen kostet doppelt.' },
  { id: 'beamer',  name: 'Beamer',                desc: 'Du drehst der Klasse beim Schreiben nicht mehr den Rücken zu.',                 catch: '1× pro Tag: „Update wird installiert …“' },
  { id: 'netprint',name: 'Netzwerkdrucker',       desc: 'Der Kopierer druckt von selbst nach, sobald er leer und abgekühlt ist.',      catch: 'Er druckt nur 4 statt 6 Blätter.' },
  { id: 'helper',  name: 'Klassensprecher',       desc: 'Ein Azubi holt Blätter vom Pult und teilt sie selbst aus.',                     catch: 'Solange er unterwegs ist, lernt er nichts.' },
  { id: 'seating', name: 'Sitzplan',              desc: 'Laute Azubis stecken niemanden mehr an.',                                      catch: 'Partnerarbeit bringt 15 % weniger.' },
  { id: 'light',   name: 'Lärmampel',             desc: 'Zeigt 3 s vorher, wer als Nächstes unruhig wird.',                              catch: '–' },
  { id: 'tables',  name: 'Gruppentische',         desc: 'Gruppenarbeit braucht nur 2 statt 4 Blätter.',                                  catch: 'Gruppenarbeit ist etwas lauter.' },
  { id: 'phonebox',name: 'Handy-Garage',          desc: 'Keine Handys mehr im Unterricht.',                                             catch: 'Unruhe kommt etwas öfter.' },
  { id: 'gong',    name: 'Klangschale',           desc: '1× pro Stunde mit G (Handy: Taste G) alle Unruhigen sofort beruhigen.',          catch: '–' },
];

/* ---------------------------------------------------------------- Basis */
const T = 32, RW = 20, RH = 10, OX = 64, OY = 96, WALL_H = 80, SW = 768, SH = 432;
const U = T / 16;   // Pixel-Maßstab gegenüber dem alten 16-px-Raster

const cv = document.getElementById('game');
let ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[(Math.random() * arr.length) | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sx = x => Math.round(OX + x * T);
const sy = y => Math.round(OY + y * T);
function R(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }

/* ------------------------------------------------------------- Palette */
const PAL = {
  outside: '#262430',
  floorA: '#c99a66', floorB: '#bd8e5b', floorLine: '#9c7246', floorFleck: '#b08354',
  wall: '#f1e4c8', wallShade: '#e6d6b4', wainscot: '#7f9a7a', wainscotDark: '#6a8566', trim: '#fbf3e2',
  wallTop: '#4a4658', wallTopLight: '#625d74',
  board: '#2f5d4a', boardDark: '#244a3b', frame: '#7c868f', frameDark: '#5d666e', chalk: '#f4f1e6',
  desk: '#e2b882', deskFront: '#5d666e', deskDark: '#454c53',
  chair: '#3f4552', chairDark: '#2c313b',
  skin: ['#f6d3b0', '#e8b48c', '#c98d62', '#8d5a3c'],
  hair: ['#3b2a1e', '#7a4a2a', '#d9b25a', '#1e1a26', '#a8582d', '#4a3a32'],
  jacket: ['#3d4f7a', '#6b7280', '#4f6b4f', '#2f2f38', '#a8443c', '#4f7fbf', '#5a4a6b', '#3d4f7a', '#7a6a4f', '#2f4f5a', '#6b3d3d', '#4f7fbf'],
  accent: ['#e8823c', '#c9d3dc', '#f2c14e', '#e8823c', '#f2e6d0', '#f2c14e', '#9ad0e8', '#c9d3dc', '#e8823c', '#f2c14e', '#d9d0c0', '#e8823c'],
  cap: ['#d94a3a', '#2f2f38', '#f2c14e'],
  dark: '#26232e', white: '#fff8ec',
  yellow: '#f7d154', red: '#e8534a', blue: '#5ca7e8', orange: '#f29a4e', grey: '#c9c6d0',
};

/* ---------------------------------------------- Mini-Pixelschrift 3×5 */
const GLYPHS = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
  '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001010010010',
  '8': '111101111101111', '9': '111101111001111', '+': '000010111010000', '-': '000000111000000',
  '!': '010010010000010', '?': '111001011000010', ' ': '000000000000000', '=': '000111000111000',
  '.': '000000000000010', ':': '000010000010000', '/': '001001010100100', '&': '010101010101011',
  'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011', 'D': '110101101101110',
  'E': '111100110100111', 'F': '111100110100100', 'G': '011100101101011', 'H': '101101111101101',
  'I': '111010010010111', 'J': '001001001101010', 'K': '101101110101101', 'L': '100100100100111',
  'M': '101111111101101', 'N': '110101101101101', 'O': '010101101101010', 'P': '110101110100100',
  'Q': '010101101110011', 'R': '110101110101101', 'S': '011100010001110', 'T': '111010010010010',
  'U': '101101101101111', 'V': '101101101101010', 'W': '101101111111101', 'X': '101101010101101',
  'Y': '101101010010010', 'Z': '111001010100111',
};
function ltext(str, x, y, color, sc = 1) {
  ctx.fillStyle = color;
  x = Math.round(x); y = Math.round(y);
  for (let i = 0; i < str.length; i++) {
    const g = GLYPHS[str[i]] || GLYPHS[' '];
    for (let p = 0; p < 15; p++) if (g[p] === '1') ctx.fillRect(x + (i * 4 + (p % 3)) * sc, y + ((p / 3) | 0) * sc, sc, sc);
  }
}
function ptext(str, x, y, color, outline = PAL.dark, sc = 2) {
  const x0 = Math.round(x - (str.length * 4 - 1) * sc / 2), y0 = Math.round(y);
  if (outline) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]]) ltext(str, x0 + ox * sc, y0 + oy * sc, outline, sc);
  ltext(str, x0, y0, color, sc);
}

/* Tafelbilder: Berufsschule Metall/Elektro. Zeile 0 = Überschrift, 1–4 = Aufgaben. */
const SUBJECTS = [
  { lines: ['GETRIEBE', 'I = Z2 : Z1', 'Z1 = 12', 'Z2 = 36', 'I = ?'], fig: 'gears' },
  { lines: ['OHMSCHES GES.', 'U = R X I', 'R = 220', 'U = 12 V', 'I = ?'], fig: 'circuit' },
  { lines: ['WELLE-NABE', '1. PASSFEDER', '2. KEILWELLE', '3. PRESSVERB.', '4. VORTEILE?'], fig: 'shaft' },
  { lines: ['SPS GRUNDL.', '1. UND', '2. ODER', '3. NICHT', '4. TABELLE'], fig: 'gate' },
  { lines: ['PASSUNGEN', '1. H7 / G6', '2. SPIEL', '3. UEBERMASS', '4. TOLERANZ'], fig: 'fit' },
  { lines: ['PNEUMATIK', '1. ZYLINDER', '2. 5/2-WEGEV.', '3. DROSSEL', '4. SCHALTPLAN'], fig: 'cylinder' },
];

/* ----------------------------------------------------------- Sound */
let actx = null;
function initAudio() {
  if (actx) return;
  try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }
  musicStart();
}
/* Musik: kleine, gemütliche Schleife (Lo-Fi-Chiptune), komplett per Code erzeugt. M schaltet sie an/aus. */
const music = { on: true, next: 0, step: 0, gain: null, timer: null };
try { music.on = localStorage.getItem('kig_music') !== 'off'; } catch (e) { /* egal */ }
const MUSIC = {
  bpm: 84,
  // Akkorde je 2 Takte: Fmaj7 – Em7 – Dm7 – Cmaj7 (warm, leicht melancholisch)
  chords: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]],
  bass: [41, 40, 38, 36],
  // Melodie (16tel-Raster, 32 Schritte pro Akkord, 0 = Pause), pentatonisch
  mel: [72, 0, 0, 69, 0, 0, 67, 0, 69, 0, 0, 0, 72, 0, 74, 0, 76, 0, 0, 74, 0, 72, 0, 0, 69, 0, 0, 0, 0, 0, 0, 0,
        71, 0, 0, 67, 0, 0, 64, 0, 67, 0, 69, 0, 71, 0, 0, 0, 74, 0, 0, 71, 0, 69, 0, 0, 67, 0, 0, 0, 0, 0, 0, 0,
        69, 0, 0, 72, 0, 0, 74, 0, 72, 0, 69, 0, 67, 0, 0, 0, 65, 0, 0, 67, 0, 69, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0,
        67, 0, 0, 64, 0, 0, 67, 0, 71, 0, 0, 0, 72, 0, 0, 0, 71, 0, 67, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function mnote(m, t, dur, type, vol, dest) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(mtof(m), t);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05);
}
function musicTick() {
  if (!actx || !music.on) return;
  const sixteenth = 60 / MUSIC.bpm / 4;
  if (music.next < actx.currentTime) music.next = actx.currentTime + 0.05;
  while (music.next < actx.currentTime + 0.25) {
    const st = music.step % 128, ci = Math.floor(st / 32), t = music.next, ch = MUSIC.chords[ci];
    if (st % 16 === 0) ch.forEach((m, i) => mnote(m, t + i * 0.015, sixteenth * 15, 'triangle', 0.022, music.gain));   // Pad
    if (st % 8 === 0) mnote(MUSIC.bass[ci], t, sixteenth * 6, 'sine', 0.09, music.gain);                              // Bass
    if (st % 4 === 2) mnote(ch[(st / 4 | 0) % 4] + 12, t, sixteenth * 2, 'square', 0.008, music.gain);               // Arpeggio
    const m = MUSIC.mel[st]; if (m) mnote(m, t, sixteenth * 3, 'square', 0.018, music.gain);                          // Melodie
    if (st % 4 === 0 && st % 8 !== 0) {                                                                               // leiser Shaker
      const n = actx.createBufferSource(), buf = actx.createBuffer(1, 800, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const g = actx.createGain(); g.gain.value = 0.02; n.buffer = buf; n.connect(g).connect(music.gain); n.start(t);
    }
    music.next += sixteenth; music.step++;
  }
}
function musicStart() {
  if (!actx || music.timer) return;
  music.gain = actx.createGain(); music.gain.gain.value = 0.5; music.gain.connect(actx.destination);
  music.next = actx.currentTime + 0.1;
  music.timer = setInterval(musicTick, 100);
}
function toggleMusic() {
  music.on = !music.on;
  try { localStorage.setItem('kig_music', music.on ? 'on' : 'off'); } catch (e) { /* egal */ }
  if (music.gain) music.gain.gain.setTargetAtTime(music.on ? 0.5 : 0, actx.currentTime, 0.1);
}

function blip(freq, dur = 0.08, type = 'square', vol = 0.04, delay = 0) {
  if (!actx) return;
  const t0 = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
const sfx = {
  scold: () => { blip(880, 0.06); blip(1320, 0.08, 'square', 0.03, 0.05); },
  calm: () => blip(990, 0.05, 'triangle', 0.03),
  wrong: () => blip(160, 0.18, 'sawtooth', 0.04),
  loud: () => blip(220, 0.12, 'triangle', 0.05),
  chalk: () => blip(rand(1800, 2400), 0.02, 'square', 0.012),
  done: () => { blip(660, 0.08); blip(990, 0.12, 'square', 0.04, 0.08); },
  paper: () => { blip(1200, 0.04, 'triangle', 0.04); blip(1600, 0.05, 'triangle', 0.03, 0.04); },
  fiddle: () => blip(rand(700, 900), 0.03, 'triangle', 0.02),
  print: () => blip(500, 0.05, 'square', 0.025),
  start: () => { blip(300, 0.06, 'square', 0.03); blip(450, 0.06, 'square', 0.03, 0.07); },
  knock: (loud) => { blip(120, 0.06, 'square', loud ? 0.07 : 0.04); blip(120, 0.06, 'square', loud ? 0.07 : 0.04, 0.12); },
  door: () => { blip(260, 0.1, 'triangle', 0.05); blip(390, 0.12, 'triangle', 0.04, 0.08); },
  ring: () => { [1320, 1568, 1320, 1568].forEach((f, i) => blip(f, 0.07, 'square', 0.035, i * 0.08)); },
  buzz: () => { blip(90, 0.15, 'sawtooth', 0.03); blip(90, 0.15, 'sawtooth', 0.03, 0.25); },
  jam: () => { blip(140, 0.25, 'sawtooth', 0.05); },
  hit: () => { blip(rand(90, 130), 0.06, 'square', 0.06); },
  gong: () => { [523, 784, 1046].forEach((f, i) => blip(f, 1.2, 'sine', 0.06, i * 0.05)); },
  rattle: () => { for (let i = 0; i < 8; i++) blip(rand(80, 160), 0.05, 'square', 0.03, i * 0.15); },
  select: () => blip(1400, 0.03, 'square', 0.03),
  bell: () => { [784, 659, 523].forEach((f, i) => blip(f, 0.35, 'triangle', 0.06, i * 0.22)); },
};

/* ------------------------------------------------------------ Eingabe */
const keys = new Set();
const isHold = () => keys.has('KeyE') || keys.has('Space');

/* --------------------------------------------------- Touch-Steuerung */
// Links: Daumen irgendwo auflegen und ziehen = Stick (wandert mit, wenn man zu weit zieht).
// Rechts: E (tippen/halten), Q (Arbeitsform wechseln), Pause, ggf. Klangschale.
const touch = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const STICK = { dead: 4, max: 40 };
// Vollbild (PC: Taste F oder Schaltfläche oben rechts, Handy: [ ]-Taste)
const canFullscreen = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
function toggleFullscreen() {
  const el = document.documentElement;
  const fail = () => toast(isTouchDevice
    ? 'Vollbild ist in dieser Vorschau nicht erlaubt. Tipp: Spiel als Webseite öffnen und „Zum Startbildschirm hinzufügen“.'
    : 'Vollbild ist hier nicht erlaubt. Einmal ins Spiel klicken und nochmal F drücken.');
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else {
      const fn = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!fn || !canFullscreen()) { fail(); return; }
      const r = fn.call(el);
      if (r && r.then) r.then(() => { try { if (isTouchDevice) screen.orientation.lock('landscape').catch(() => {}); } catch (err) { /* egal */ } }).catch(fail);
    }
  } catch (err) { fail(); }
}
document.addEventListener('fullscreenchange', () => setTimeout(fit, 50));
document.addEventListener('webkitfullscreenchange', () => setTimeout(fit, 50));

function setupTouch() {
  if (isTouchDevice) document.body.classList.add('touch');
  const stick = $('stick'), knob = $('knob');
  const place = () => { stick.style.left = touch.ox + 'px'; stick.style.top = touch.oy + 'px'; };
  if (isTouchDevice) { document.body.appendChild($('hud')); document.body.appendChild($('overlay')); }   // Anzeigen in die linke Spalte
  window.addEventListener('pointerdown', e => {                 // Stick: frei auf der linken Bildschirmhälfte
    if (e.pointerType === 'mouse' || touch.active || state !== 'play') return;
    if (e.target.closest('#pad, button, #overlay, #hud')) return;
    if (e.clientX > innerWidth * 0.5 || e.clientY < 70) return;        // oben links liegen die kleinen Tasten
    initAudio();
    touch.active = true; touch.id = e.pointerId; touch.ox = e.clientX; touch.oy = e.clientY; touch.x = touch.y = 0;
    place(); stick.hidden = false; knob.style.transform = 'translate(-50%, -50%)';
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('pointermove', e => {
    if (!touch.active || e.pointerId !== touch.id) return;
    let dx = e.clientX - touch.ox, dy = e.clientY - touch.oy, d = Math.hypot(dx, dy);
    if (d > STICK.max) {                                          // Stick wandert mit dem Daumen mit
      touch.ox += dx / d * (d - STICK.max); touch.oy += dy / d * (d - STICK.max); place();
      dx = e.clientX - touch.ox; dy = e.clientY - touch.oy; d = STICK.max;
    }
    if (d < STICK.dead) { touch.x = touch.y = 0; } else { touch.x = dx / d; touch.y = dy / d; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    e.preventDefault();
  }, { passive: false });
  const end = e => { if (e.pointerId !== touch.id) return; touch.active = false; touch.x = touch.y = 0; stick.hidden = true; };
  window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);

  // Langes Drücken darf keine Textauswahl und kein Kontextmenü auslösen
  if (isTouchDevice) {
    document.addEventListener('contextmenu', e => { if (!e.target.closest('.card')) e.preventDefault(); });
    document.addEventListener('selectstart', e => { if (!e.target.closest('.card')) e.preventDefault(); });
  }
  const btn = (id, down, up) => {
    const el = $(id);
    el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); initAudio(); el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (err) { /* egal */ } down(); });
    el.addEventListener('touchstart', e => e.preventDefault(), { passive: false });       // iOS: keine Lupe/Auswahl beim Halten
    const off = e => { el.classList.remove('on'); if (up) up(); };
    el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
  };
  btn('btnE', () => { keys.add('KeyE'); if (state === 'play') tap(); }, () => keys.delete('KeyE'));
  btn('btnQ', () => state === 'play' && selectForm(G.formSel + 1));
  btn('btnG', () => state === 'play' && useGong());
  btn('btnM', () => { toggleMusic(); $('btnM').textContent = music.on ? '♪' : '–'; });
  btn('btnF', toggleFullscreen);
  btn('btnZ', toggleView);
  $('btnZ').textContent = cam.mode === 'zoom' ? '-' : '+';
  $('fsBtn').addEventListener('click', e => { e.preventDefault(); toggleFullscreen(); $('fsBtn').blur(); });
  btn('btnP', () => { if (state === 'play') { state = 'pause'; showCard('<h2>Pause</h2><p class="go">Weiter</p>'); } });
  $('overlay').addEventListener('pointerdown', e => {
    initAudio();
    const b = e.target.closest('[data-buy]');
    if (b && state === 'shop') { buy(+b.dataset.buy); return; }
    const tb = e.target.closest('[data-teacher]');
    if (tb && state === 'title') { pickTeacher(+tb.dataset.teacher); return; }
    const pr = e.target.closest('[data-prep]');
    if (pr && state === 'prep') { togglePrep(+pr.dataset.prep); return; }
    const pk = e.target.closest('[data-pick]');
    if (pk && state === 'choice') { pickChanger(+pk.dataset.pick); return; }
    if (['title', 'prep', 'end', 'shop', 'exam'].includes(state)) { if (e.target.closest('.go')) advance(); }   // sonst: Text scrollen
    else if (state === 'pause') { state = 'play'; hideCard(); }
  });
}

/* -------------------------------------------------------------- Welt */
const STATIC_BLOCKS = [
  { x0: 1.4, y0: 0.0, x1: 4.6, y1: 1.45, name: 'Lehrertisch' },
  { x0: 4.9, y0: 0.0, x1: 6.7, y1: 0.7, name: 'Regal' },
  { x0: 0.0, y0: 8.3, x1: 2.1, y1: 10, name: 'Kopierer' },
  { x0: 18.9, y0: 0.0, x1: 20, y1: 0.95, name: 'Pflanze' },
  { x0: 19.2, y0: 2.6, x1: 20, y1: 4.2, name: 'Schaltschrank' },
  { x0: 19.0, y0: 6.0, x1: 20, y1: 7.0, name: 'Werkzeugwagen' },
  { x0: 19.3, y0: 9.2, x1: 20, y1: 10, name: 'Feuerlöscher' },
];
const BOARD = { x0: 7, x1: 13, zoneY: 1.9 };
const DOOR = { x0: 16.4, x1: 18.8, zoneY: 9.0, cx: 17.6 };
const blockByName = n => STATIC_BLOCKS.find(b => b.name === n);

let state = 'title';     // title | play | pause | end
let G = null;
let debug = false;
let lessonNo = 0;
let RUN = null;            // der aktuelle Durchgang (Woche, Tag, Taler, Upgrades)
let best = 0;
try { best = +(localStorage.getItem('kig_best_weeks') || 0); } catch (e) { best = 0; }

/* Lehrkräfte zur Auswahl (Index in TEACHERS, render.js) mit kleiner Eigenschaft (ca. 10–15 %) */
const TEACHER_PICK = [
  { idx: 2, trait: 'Organisationstalent', desc: 'Teilt Blätter aus dem Stapel 40 % schneller aus, der Kopierer wärmt 20 % schneller auf.',
    apply: C => { C.give.stackMin *= 0.6; C.give.stackMax *= 0.6; C.copier.warmup *= 0.8; } },
  { idx: 1, trait: 'Ruhepol', desc: 'Präsenz-Kreis 15 % größer, läuft dafür 5 % langsamer.',
    apply: C => { C.presence.radius *= 1.15; C.player.speed *= 0.95; } },
  { idx: 3, trait: 'Flink', desc: 'Läuft 12 % schneller.',
    apply: C => { C.player.speed *= 1.12; } },
  { idx: 4, trait: 'Erfahren', desc: 'Beruhigt zappelige Azubis doppelt so schnell und erklärt Fragen 30 % schneller.',
    apply: C => { C.kids.presenceCalm *= 0.5; C.events.question.explain *= 0.7; } },
];
let teacherPick = 0;
try { teacherPick = clamp(+(localStorage.getItem('kig_teacher') || 0), 0, TEACHER_PICK.length - 1); } catch (e) { teacherPick = 0; }

/* Vorbereitung vor jedem Tag: 3 Punkte verteilen */
const PREP_POINTS = 3;
const PREP = [
  { id: 'sheets', cost: 1, name: 'Blätter vorkopiert',       desc: 'Jede Stunde startet mit 4 Blättern auf dem Pult.' },
  { id: 'board',  cost: 1, name: 'Tafelbild vorbereitet',    desc: 'Jede Stunde startet mit Gruppenarbeit an der Tafel (die Gruppen wollen gleich ihre Blätter).' },
  { id: 'sleep',  cost: 1, name: 'Ausgeschlafen',            desc: 'Du läufst heute 15 % schneller.' },
  { id: 'warm',   cost: 1, name: 'Kopierer vorgeheizt',      desc: 'Der Kopierer muss heute nicht aufwärmen.' },
  { id: 'calm',   cost: 1, name: 'Ruhiger Einstieg geplant', desc: 'In den ersten 20 s jeder Stunde gibt es nur halb so viel Unruhe.' },
  { id: 'faq',    cost: 2, name: 'Fragen vorbereitet',       desc: 'Fragen erklärst du sofort, und sie bringen 3 Lernpunkte extra.' },
];
const prepUsed = () => PREP.filter(p => RUN.prep[p.id]).reduce((s, p) => s + p.cost, 0);

function newRun() { RUN = { week: 1, day: 0, lesson: 0, taler: 0, weekLearn: 0, up: {}, ch: {}, queue: [], teacherPick, prep: {} }; newDay(); }
function newDay() { RUN.jamLesson = randInt(0, CONFIG.week.lessonsPerDay - 1); RUN.beamerUpdate = true; RUN.prep = {}; }   // 1× pro Tag Papierstau / Beamer-Update
const has = id => !!(RUN && RUN.ch[id]);
const upLevel = id => (RUN && RUN.up[id]) || 0;

// Setzt CONFIG auf die Grundwerte zurück und rechnet Tages-Schwierigkeit und Upgrades ein.
function applyModifiers() {
  const base = structuredClone(BASE_CONFIG);
  for (const key of Object.keys(base)) CONFIG[key] = base[key];
  const tp = TEACHER_PICK[RUN ? RUN.teacherPick : teacherPick] || TEACHER_PICK[0];
  CONFIG.teacher = tp.idx;
  if (!RUN) return;
  tp.apply(CONFIG);
  // Vorbereitung des Tages
  if (RUN.prep.sleep) CONFIG.player.speed *= 1.15;
  if (RUN.prep.warm) CONFIG.copier.warmup = 0;
  if (RUN.prep.faq) { CONFIG.events.question.explain = 0.05; CONFIG.events.question.bonus += 3; }
  const W = CONFIG.week, lvl = (RUN.week - 1) * W.days.length + RUN.day;
  const d = 1 + W.difficultyPerDay * lvl;
  CONFIG.kids.spawnInterval /= d;
  CONFIG.copier.requestInterval /= d;
  CONFIG.events.question.every /= d;
  CONFIG.events.wc.every /= d;
  CONFIG.events.phone.chance = Math.min(0.9, CONFIG.events.phone.chance + 0.05 * lvl);
  CONFIG.events.jamChance += 0.01 * lvl;
  CONFIG.maxProblems += Math.floor(lvl / W.extraProblemEvery);
  CONFIG.door.lateMax += Math.floor(lvl / 5);
  // tägliche Upgrades
  CONFIG.player.speed *= 1 + 0.2 * upLevel('shoes');
  CONFIG.deskStashMax += 3 * upLevel('pult');
  CONFIG.copier.warmup = Math.max(0.5, CONFIG.copier.warmup - 0.6 * upLevel('copier'));
  CONFIG.copier.cooldown = Math.max(3, CONFIG.copier.cooldown - 2.3 * upLevel('copier'));
  CONFIG.forms.forEach(f => { f.write *= Math.pow(0.8, upLevel('chalk')); });
  CONFIG.presence.radius += 0.5 * upLevel('presence');
  const pat = 1 + 0.2 * upLevel('patience');
  CONFIG.copier.patience *= pat; CONFIG.events.question.patience *= pat; CONFIG.events.wc.patience *= pat; CONFIG.door.patience *= pat;
  // Game-Changer
  if (has('opener')) CONFIG.door.autoOpen = true;
  if (has('review')) CONFIG.board.review = true;
  if (has('rules')) { CONFIG.kids.fidgetTime *= 2; CONFIG.kids.scoldWorkingPenalty *= 2; }
  if (has('beamer')) CONFIG.board.beamer = true;
  if (has('netprint')) { CONFIG.copier.auto = true; CONFIG.copier.trayMax = 4; }
  if (has('helper')) CONFIG.helper = true;
  if (has('seating')) { CONFIG.kids.noSpread = true; CONFIG.forms[1].learn *= 0.85; }
  if (has('light')) CONFIG.forecast = true;
  if (has('tables')) { CONFIG.forms[2].groupSheets = 2; CONFIG.forms[2].noise += 0.2; }
  if (has('phonebox')) { CONFIG.events.phone.chance = 0; CONFIG.kids.spawnInterval *= 0.9; }
}
function examTarget() { return Math.round(CONFIG.week.examTarget * Math.pow(CONFIG.week.examGrowth, RUN.week - 1)); }
let totalTaler = 0;
let clockT = 0;
let gust = 0, nextGust = rand(5, 10);

/* Die Klasse IM24: 12 Azubis mit eigenem Look */
const SKIN = ['#f9dcc0', '#f0c39c', '#d9a07a', '#b07850', '#8a5638', '#5e3a24'];
const LOOKS = [
  { name: 'Jonas',   skin: SKIN[1], hair: '#3b2a1e', style: 'short',    jacket: '#3d4f7a', accent: '#e8823c', glasses: true },
  { name: 'Amara',   skin: SKIN[5], hair: '#1e1a1a', style: 'afro',     jacket: '#4f6b4f', accent: '#f2c14e' },
  { name: 'Lena',    skin: SKIN[0], hair: '#d9b25a', style: 'long',     jacket: '#7a5a8a', accent: '#f2e6d0' },
  { name: 'Can',     skin: SKIN[3], hair: '#2a1e1a', style: 'undercut', jacket: '#2f2f38', accent: '#e8823c', dye: '#3fb8b0' },
  { name: 'Tim',     skin: SKIN[2], hair: '#4a3a32', style: 'cap',      jacket: '#a8443c', accent: '#f2e6d0', cap: '#2f2f38', beard: true },
  { name: 'Nia',     skin: SKIN[4], hair: '#1e1a26', style: 'braids',   jacket: '#4f7fbf', accent: '#f2c14e', phones: true },
  { name: 'Mia',     skin: SKIN[0], hair: '#b5582d', style: 'bun',      jacket: '#6b7280', accent: '#9ad0e8', glasses: true },
  { name: 'Felix',   skin: SKIN[1], hair: '#5a4030', style: 'buzz',     jacket: '#2f4f5a', accent: '#e8823c', beard: true },
  { name: 'Sofia',   skin: SKIN[3], hair: '#2a1e1a', style: 'curly',    jacket: '#b8823a', accent: '#f2e6d0' },
  { name: 'Kofi',    skin: SKIN[5], hair: '#141018', style: 'buzz',     jacket: '#3d4f7a', accent: '#f2c14e', phones: true },
  { name: 'Ronja',   skin: SKIN[2], hair: '#d97aa8', style: 'ponytail', jacket: '#4f6b4f', accent: '#f2e6d0' },
  { name: 'Paul',    skin: SKIN[1], hair: '#7a4a2a', style: 'short',    jacket: '#5a4a6b', accent: '#e8823c', glasses: true },
];

function makeKids() {
  const kids = [];
  const K = CONFIG.kids;
  K.rows.forEach((dy, r) => K.cols.forEach((cx, c) => {
    const i = kids.length;
    kids.push({
      i, r, c, cx, dy,
      x: cx, y: dy + 1.05,
      block: { x0: cx - K.deskWidth / 2, y0: dy, x1: cx + K.deskWidth / 2, y1: dy + 1.15 },
      state: 'work', t: 0, pres: 0, spreadT: 0, knockT: 0, phase: rand(0, 6.28), annoyed: 0, calm: 0, flip: Math.random() < 0.5,
      ...LOOKS[i % LOOKS.length],
      item: i % 4,                   // Tisch: 0 Laptop, 1 Multimeter, 2 Zahnrad, 3 Messschieber
      wx: 0, wy: 0, path: null, face: 'up', walk: 0,
    });
  }));
  return kids;
}

function newLesson() {
  lessonNo++;
  G = {
    t: 0, order: CONFIG.order.start, orderInt: 0, taler: 0,
    loss: { stoerer: 0, tafel: 0, kopierer: 0, tuer: 0, fehl: 0 },
    m: { free: 0, probInt: 0, maxOpen: 0 },
    supply: 100, formIdx: CONFIG.startForm, formSel: CONFIG.startForm,
    subject: pick(SUBJECTS), nextSubject: null,
    writing: false, writeProg: 0, writeIdle: 0, needRelease: false,
    emptyT: 0, waveT: 0,
    spawnT: CONFIG.kids.spawnInterval, sheetT: CONFIG.copier.firstRequestAt,
    copier: { tray: 0, printing: false, warm: 0, t: 0, cool: 0, jam: false, hits: 0, jobDone: false, shake: 0, jobs: 0, rattle: 0 }, carry: 0, stash: 0, give: null,
    grab: null, explainProg: 0, explaining: false, learn: 0, learnRate: 0, laughT: 0,
    qT: CONFIG.events.question.firstAt, wcT: CONFIG.events.wc.firstAt,
    phoneAt: Math.random() < CONFIG.events.phone.chance ? rand(CONFIG.events.phone.from, CONFIG.events.phone.to) : null,
    doorOpen: 0,
    p: { x: 10, y: 2.1, face: 'down', walk: 0, moving: false },
    kids: makeKids(), floats: [], parts: [],
    drainNow: { stoerer: 0, tafel: 0, kopierer: 0, tuer: 0 },
    gongLeft: has('gong') ? 1 : 0, gongFx: 0,
    jamPlan: !!RUN && RUN.jamLesson === RUN.lesson && Math.random() >= 0.3 * upLevel('copier'), forecastKid: null, beamerDelay: 0,
  };
  // Vorbereitung des Tages
  if (RUN && RUN.prep.sheets) G.stash = Math.min(4, CONFIG.deskStashMax);
  if (RUN && RUN.prep.board) { G.formIdx = G.formSel = 2; G.prepGroups = true; }
  // Zuspätkommer: Platz bleibt leer, später klopft es
  const late = randInt(CONFIG.door.lateMin, CONFIG.door.lateMax);
  const pool = G.kids.slice();
  for (let n = 0; n < late; n++) {
    const k = pool.splice((Math.random() * pool.length) | 0, 1)[0];
    k.state = 'away'; k.late = true; k.arriveAt = rand(CONFIG.door.arriveFrom, CONFIG.door.arriveTo);
  }
}

/* --------------------------------------------------------- Kollision */
function allBlocks() { return STATIC_BLOCKS.concat(G.kids.map(k => k.block)); }
function blockedAt(x, y) {
  const r = CONFIG.player.radius;
  if (x < r || x > RW - r || y < 0.35 || y > RH - r) return true;
  for (const b of allBlocks()) {
    const cx = clamp(x, b.x0, b.x1), cy = clamp(y, b.y0, b.y1);
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
  }
  return false;
}
function distToBlock(px, py, b) {
  const cx = clamp(px, b.x0, b.x1), cy = clamp(py, b.y0, b.y1);
  return Math.hypot(px - cx, py - cy);
}

/* ------------------------------------------------------------ Regeln */
const form = () => CONFIG.forms[G.formIdx];
const isProblem = k => k.state === 'idle' || k.state === 'loud';
const isSeated = k => !['away', 'knock', 'walk'].includes(k.state);
const presenceOn = () => !G.writing || !!CONFIG.board.beamer;
const backTurned = () => G.writing && !CONFIG.board.beamer;   // Rücken zur Klasse
const inPresence = k => presenceOn() && Math.hypot(G.p.x - k.x, G.p.y - (k.y - 0.4)) <= CONFIG.presence.radius;
const inBoardZone = () => G.p.y < BOARD.zoneY && G.p.x > BOARD.x0 && G.p.x < BOARD.x1;
const inDoorZone = () => G.p.y > DOOR.zoneY && G.p.x > DOOR.x0 && G.p.x < DOOR.x1;
const atCopier = () => distToBlock(G.p.x, G.p.y, blockByName('Kopierer')) <= CONFIG.copier.reach;
const atDesk = () => CONFIG.deskStash && distToBlock(G.p.x, G.p.y, blockByName('Lehrertisch')) <= 0.7;
function openProblems() {
  return G.kids.filter(k => ['fidget', 'idle', 'loud', 'wait', 'knock', 'question', 'wc', 'phone'].includes(k.state)).length + (G.supply <= 0 && !CONFIG.board.review ? 1 : 0);
}
function phaseName() {
  if (G.t < CONFIG.phases.warmupEnd) return 'Einstieg';
  if (G.t >= CONFIG.phases.finalStart) return 'Schlussspurt';
  return 'Arbeitsphase';
}

function currentTarget() {
  if (inBoardZone()) return { type: 'board' };
  if (inDoorZone() && G.kids.some(k => k.state === 'knock')) return { type: 'door' };
  if (atCopier()) return { type: 'copier' };
  if (atDesk() && (G.carry > 0 || G.stash > 0)) return { type: 'desk' };
  let best = null, bs = 1e9;
  for (const k of G.kids) {
    if (!isSeated(k)) continue;
    const d = distToBlock(G.p.x, G.p.y, k.block);
    if (d > CONFIG.player.reach) continue;
    const prio = k.state === 'wait' ? (G.carry > 0 ? 20 : 5) : (k.state === 'phone' || k.state === 'phoneSoon') ? 15 : (isProblem(k) || k.state === 'wc') ? 10 : (k.state === 'fidget' || k.state === 'question') ? 8 : 0;
    if (d - prio < bs) { bs = d - prio; best = k; }
  }
  return best ? { type: 'kid', kid: best } : null;
}

function float(x, y, text, color) { G.floats.push({ x, y, text, color, t: 0 }); }
function puff(x, y, color, n = 8) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, 6.28), v = rand(10, 28) * U;
    G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10 * U, t: 0, life: rand(0.3, 0.6), color });
  }
}
function flashHands() { const h = $('hands'); h.classList.remove('flash'); void h.offsetWidth; h.classList.add('flash'); }
function handsFull() { float(sx(G.p.x), sy(G.p.y) - 72, '!', PAL.red); sfx.wrong(); flashHands(); }
function reward(k) {
  G.taler += CONFIG.taler.perTask;
  float(sx(k ? k.x : G.p.x), sy(k ? k.y : G.p.y) - 64, '+' + CONFIG.taler.perTask, PAL.yellow);
}
function makeIdle(k) { k.state = 'idle'; k.t = 0; k.spreadT = 0; }
function backToWork(k, calm) { k.state = G.supply <= 0 && !CONFIG.board.review ? 'done' : 'work'; k.t = 0; k.pres = 0; k.spreadT = 0; k.calm = calm; }

function useCopier() {
  const C = G.copier, CC = CONFIG.copier;
  if (C.jam) {                                   // Papierstau: draufklopfen
    C.hits++; C.shake = 0.15; sfx.hit();
    if (C.hits >= CONFIG.events.jamHits) { C.jam = false; C.hits = 0; sfx.start(); float(sx(1.1), sy(8.5) - 60, 'OK', PAL.white); }
    return;
  }
  const take = Math.min(C.tray, CC.carryMax - G.carry);
  if (take > 0) { C.tray -= take; G.carry += take; sfx.paper(); }
  else if (C.tray > 0) handsFull();
  if (C.tray === 0 && C.jobDone) { C.jobDone = false; C.cool = CC.cooldown; }
  if (!C.printing && !C.jobDone && C.cool <= 0 && C.tray < CC.trayMax) { C.printing = true; C.warm = 0; C.t = 0; sfx.start(); }
  else if (take === 0 && C.cool > 0) { float(sx(1.1), sy(8.5) - 60, 'HEISS', PAL.orange); }
}
function sendToWC(k) {
  k.needsWC = false; k.state = 'walk'; k.leaving = true;
  k.wx = k.x; k.wy = k.y;
  const ax = k.cx + 2;
  k.path = [{ x: ax, y: k.y }, { x: ax, y: 9.1 }, { x: DOOR.cx, y: 9.8 }];
  reward(k); sfx.calm();
}
// Pult: E tippen = mit Blättern alles ablegen, ohne Blätter 1 nehmen. E halten = Blatt für Blatt aufnehmen.
function deskTap() {
  if (G.carry > 0) {
    const put = Math.min(G.carry, CONFIG.deskStashMax - G.stash);
    if (put <= 0) { handsFull(); return; }
    G.stash += put; G.carry -= put;
    sfx.paper();
  } else deskTakeOne();
}
function deskTakeOne() {
  if (G.stash <= 0 || G.carry >= CONFIG.copier.carryMax) return false;
  G.stash--; G.carry++;
  float(sx(3.6), sy(0.15) - 44, String(G.carry), PAL.white);
  sfx.paper();
  return true;
}
function giveSheet(k) {
  G.carry--;
  k.needsSheet = false;
  backToWork(k, 1.5);
  reward(k);
  puff(sx(k.x), sy(k.y) - 36, PAL.white, 6);
  sfx.paper();
}
function letIn(auto) {
  const knocking = G.kids.filter(k => k.state === 'knock');
  knocking.forEach((k, n) => {
    const ax = k.cx + 2;
    k.state = 'walk';
    k.wx = DOOR.cx + n * 0.5; k.wy = 9.75;
    k.path = [{ x: ax, y: 9.1 }, { x: ax, y: k.y }, { x: k.cx, y: k.y }];
    if (!auto) reward(null);
  });
  G.doorOpen = 1.2;
  sfx.door();
}

function tap() {
  const tg = currentTarget();
  if (!tg) return;
  if (tg.type === 'board') { if (G.carry > 0) handsFull(); return; }
  if (tg.type === 'door') { letIn(); return; }
  if (tg.type === 'copier') { useCopier(); return; }
  if (tg.type === 'desk') { G.deskHold = { t: 0, took: 0 }; return; }   // Entscheidung fällt beim Loslassen oder Halten
  const k = tg.kid;
  if (k.state === 'wait') {
    if (G.carry === 0) float(sx(k.x), sy(k.y) - 60, '?', PAL.blue);
    else if (G.carry === 1) giveSheet(k);
    else G.give = { k, t: 0, need: rand(CONFIG.give.stackMin, CONFIG.give.stackMax) };
    return;
  }
  if (k.state === 'phoneSoon') { backToWork(k, 2); reward(k); float(sx(k.x), sy(k.y) - 80, 'HANDY', PAL.white); sfx.scold(); return; }   // abgefangen!
  if (k.state === 'phone') { G.grab = { k, t: 0 }; return; }
  if (k.state === 'wc') { sendToWC(k); return; }
  if (k.state === 'question') { k.t = Math.max(0, k.t - CONFIG.events.question.soothe); float(sx(k.x), sy(k.y) - 80, 'GLEICH!', '#9fd39a'); sfx.calm(); return; }
  if (k.state === 'fidget') { backToWork(k, 2); puff(sx(k.x), sy(k.y) - 44, PAL.white, 4); sfx.calm(); return; }
  if (isProblem(k)) {
    backToWork(k, 0.6);
    if (k.needsSheet && G.supply > 0) { k.state = 'wait'; k.t = 0; }   // will das Blatt immer noch
    else if (k.needsWC) { k.state = 'wc'; k.t = 0; }                     // muss immer noch
    reward(k);
    puff(sx(k.x), sy(k.y) - 44, PAL.white);
    sfx.scold();
    return;
  }
  const pen = CONFIG.kids.scoldWorkingPenalty;
  G.order = Math.max(0, G.order - pen);
  G.loss.fehl += pen;
  k.annoyed = 1.2;
  float(sx(k.x), sy(k.y) - 60, '-' + pen, PAL.red);
  sfx.wrong();
}

// Klassensprecher: holt ein Blatt vom Pult und bringt es einem wartenden Azubi
function helperTick() {
  if (!CONFIG.helper || G.stash <= 0 || G.kids.some(k => k.job)) return;
  const target = G.kids.filter(k => k.state === 'wait' && !k.helperComing).sort((a, b) => b.t - a.t)[0];
  if (!target) return;
  const h = G.kids.filter(k => k !== target && (k.state === 'work' || k.state === 'fidget'))
    .sort((a, b) => Math.hypot(a.x - 3, a.y - 2) - Math.hypot(b.x - 3, b.y - 2))[0];
  if (!h) return;
  target.helperComing = true;
  h.job = { stage: 'pult', target, has: false };
  h.state = 'walk'; h.wx = h.x; h.wy = h.y;
  h.path = [{ x: h.cx - 2, y: h.y }, { x: h.cx - 2, y: 2.1 }, { x: 3.0, y: 2.0 }];
}
function helperArrive(h) {
  const j = h.job, ax = h.cx - 2;
  const home = () => { j.stage = 'home'; h.path.push({ x: ax, y: 2.1 }, { x: ax, y: h.y }, { x: h.cx, y: h.y }); };
  if (j.stage === 'pult') {
    if (G.stash > 0) { G.stash--; j.has = true; j.stage = 'kid'; const tx = j.target.cx - 2; h.path = [{ x: tx, y: 2.1 }, { x: tx, y: j.target.y }]; sfx.paper(); }
    else { j.target.helperComing = false; h.path = []; home(); }
  } else if (j.stage === 'kid') {
    const t = j.target; t.helperComing = false;
    if (t.state === 'wait') { t.needsSheet = false; backToWork(t, 1.5); puff(sx(t.x), sy(t.y) - 36, PAL.white, 5); sfx.paper(); }
    else G.stash = Math.min(CONFIG.deskStashMax, G.stash + 1);                       // nicht mehr nötig → zurück aufs Pult
    j.has = false; h.path = [{ x: t.cx - 2, y: 2.1 }]; home();
  } else { h.job = null; backToWork(h, 2); }
}

function useGong() {
  if (!G.gongLeft) return;
  G.gongLeft--; G.gongFx = 1;
  for (const k of G.kids) if (['fidget', 'idle', 'loud'].includes(k.state)) {
    backToWork(k, 4);
    if (k.needsSheet && G.supply > 0) { k.state = 'wait'; k.t = 0; } else if (k.needsWC) { k.state = 'wc'; k.t = 0; }
  }
  sfx.gong();
}

function selectForm(i) {
  if (G.writing) return;
  G.formSel = (i + CONFIG.forms.length) % CONFIG.forms.length;
  sfx.select();
}

function finishWriting() {
  G.formIdx = G.formSel;
  G.supply = 100; G.writeProg = 0; G.writing = false; G.needRelease = true;
  G.subject = G.nextSubject; G.nextSubject = null;
  G.emptyT = 0;
  G.kids.forEach(k => { if (k.state === 'done') k.state = 'work'; });
  reward(null);
  sfx.done();
  if (form().sheets) requestGroupSheets();
}
function requestGroupSheets() {          // Gruppenarbeit: pro Gruppe ein Blatt
  {
    const groups = form().groupSheets === 2 ? [[0, 1], [2, 3]] : CONFIG.kids.cols.map((_, c) => [c]);
    groups.forEach(cs => {
      const grp = G.kids.filter(k => cs.includes(k.c) && (k.state === 'work' || k.state === 'fidget'));
      if (grp.length && !G.kids.some(k => cs.includes(k.c) && k.state === 'wait')) { const k = pick(grp); k.state = 'wait'; k.t = 0; }
    });
  }
}

/* =========================================================== Update */
function update(dt) {
  G.t += dt;
  const P = G.p, B = CONFIG.board, K = CONFIG.kids, CC = CONFIG.copier, DR = CONFIG.door, E = CONFIG.events;
  const hold = isHold();

  /* --- Frage an der Tafel erklären (E halten) --- */
  const asking = G.kids.filter(k => k.state === 'question');
  G.explaining = false;
  if (hold && inBoardZone() && asking.length && !G.needRelease && !G.writing) {
    G.explaining = true; P.face = 'down';
    if ((G.explainProg += dt / E.question.explain) >= 1) {
      const k = asking.reduce((a, b) => (a.t > b.t ? a : b));
      backToWork(k, 2);
      G.learn += E.question.bonus;
      G.taler += CONFIG.taler.perTask;
      float(sx(k.x), sy(k.y) - 68, '+' + E.question.bonus, '#9fd39a');
      puff(sx(k.x), sy(k.y) - 52, '#9fd39a', 6);
      sfx.done();
      G.explainProg = 0; G.needRelease = true;
    }
  } else G.explainProg = 0;
  const sel = CONFIG.forms[G.formSel];

  /* --- Tafel schreiben (E halten) --- */
  const canWrite = inBoardZone() && !G.needRelease && G.carry === 0 && !asking.length && !G.explaining && (G.supply < 99.5 || G.formSel !== G.formIdx);
  if (hold && canWrite) {
    if (!G.writing && G.writeProg === 0) {
      G.nextSubject = pick(SUBJECTS.filter(s => s !== G.subject));
      if (B.beamer && RUN && RUN.beamerUpdate) { G.beamerDelay = 4; RUN.beamerUpdate = false; float(sx(10), sy(0) - 60, 'UPDATE ...', PAL.blue); }
      if (!B.beamer && Math.random() < B.backstabChance) {       // „hinter deinem Rücken“ – ohne Vorwarnung
        const c = G.kids.filter(k => k.state === 'work' && k.calm <= 0);
        if (c.length) { const k = pick(c); makeIdle(k); puff(sx(k.x), sy(k.y) - 48, PAL.yellow, 5); }
      }
    }
    G.writing = true; G.writeIdle = 0; P.face = 'up';
    if (G.beamerDelay > 0) G.beamerDelay -= dt; else G.writeProg += dt / sel.write;
    if (Math.random() < dt * 12) sfx.chalk();
    if (G.writeProg >= 1) finishWriting();
  } else {
    G.writing = false;
    if (G.writeProg > 0 && (G.writeIdle += dt) > B.keepProgress) { G.writeProg = 0; G.nextSubject = null; }
  }
  if (!hold) G.needRelease = false;

  /* --- Austeilen aus dem Stapel (E halten) --- */
  if (G.give) {
    const k = G.give.k, tg = currentTarget();
    if (!hold || !tg || tg.kid !== k || k.state !== 'wait' || G.carry === 0) G.give = null;
    else {
      G.give.t += dt;
      if (Math.random() < dt * 10) sfx.fiddle();
      if (G.give.t >= G.give.need) { giveSheet(k); G.give = null; }
    }
  }

  /* --- Handy einsammeln (E halten) --- */
  if (G.grab) {
    const k = G.grab.k, tg = currentTarget();
    if (!hold || !tg || tg.kid !== k || k.state !== 'phone') G.grab = null;
    else if ((G.grab.t += dt) >= E.phone.hold) {
      backToWork(k, 2);
      G.order = Math.min(100, G.order + E.phone.refund);
      reward(k); puff(sx(k.x), sy(k.y) - 44, '#b07ce8', 6); sfx.scold();
      G.grab = null;
    }
  }

  /* --- Pult: tippen oder halten --- */
  if (G.deskHold) {
    const H = G.deskHold;
    if (!atDesk()) G.deskHold = null;
    else if (hold) {
      H.t += dt;
      const due = Math.floor(H.t / CONFIG.deskTakeEvery);       // nach 0,35 s das 1. Blatt, dann alle 0,35 s eins mehr
      while (H.took < due) { if (!deskTakeOne()) { H.took = 1e9; break; } H.took++; }
    } else {
      if (H.took === 0) deskTap();
      G.deskHold = null;
    }
  }

  /* --- Laufen --- */
  let mx = 0, my = 0;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
  P.moving = false;
  if (touch.active) { mx = touch.x; my = touch.y; }
  if (!G.writing && !G.give && !G.grab && !G.explaining && !G.deskHold && (mx || my)) {
    const l = Math.hypot(mx, my), v = CONFIG.player.speed * dt;
    const nx = P.x + mx / l * v, ny = P.y + my / l * v, A = CONFIG.player.cornerAssist;
    const offs = [0.1, 0.2, 0.3, A].flatMap(o => [o, -o]);
    if (!blockedAt(nx, P.y)) { P.x = nx; P.moving = true; }
    else if (!my) {                    // an einer Ecke hängen geblieben: seitlich drumherum rutschen
      for (const d of offs) if (!blockedAt(nx, P.y + d)) { const st = Math.sign(d) * Math.min(v, Math.abs(d)); if (!blockedAt(P.x, P.y + st)) { P.y += st; P.moving = true; } break; }
    }
    if (!blockedAt(P.x, ny)) { P.y = ny; P.moving = true; }
    else if (!mx) {
      for (const d of offs) if (!blockedAt(P.x + d, ny)) { const st = Math.sign(d) * Math.min(v, Math.abs(d)); if (!blockedAt(P.x + st, P.y)) { P.x += st; P.moving = true; } break; }
    }
    P.face = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 'left' : 'right') : (my < 0 ? 'up' : 'down');
  }
  if (P.moving) P.walk += dt * 13;

  /* --- Tafelvorrat --- */
  const present = G.kids.filter(isSeated).length || 1;
  const working = G.kids.filter(k => k.state === 'work' || k.state === 'fidget').length;
  if (G.supply > 0) {
    G.supply -= working / present * 100 / form().duration * dt;
    if (G.supply <= 0) {
      G.supply = 0; G.emptyT = 0; G.waveT = 0;
      if (!B.review) G.kids.forEach(k => { if (k.state === 'work' || k.state === 'fidget') k.state = 'done'; });
    }
  } else if (!B.review) {
    G.emptyT += dt;
    if (G.emptyT >= B.emptyDelay && (G.waveT -= dt) <= 0) {
      const k = G.kids.find(k => k.state === 'done');
      if (k) makeIdle(k);
      G.waveT = B.waveEvery;
    }
  }

  /* --- Kopierer --- */
  const C = G.copier;
  C.cool = Math.max(0, C.cool - dt); C.shake = Math.max(0, C.shake - dt);
  if (C.rattle > 0) {                                  // rattert … gleich ist Stau
    C.rattle -= dt; C.shake = 0.1;
    if (C.rattle <= 0) { C.jam = true; C.hits = 0; sfx.jam(); }
  }
  if (CC.auto && !C.printing && !C.jam && !C.jobDone && C.cool <= 0 && C.tray === 0) { C.printing = true; C.warm = 0; C.t = 0; }
  if (C.printing && !C.jam && !(C.rattle > 0)) {
    if (C.warm < CC.warmup) C.warm += dt;
    else if ((C.t += dt) >= CC.printEvery) {
      C.t = 0;
      if (G.jamPlan && C.tray >= 1) { G.jamPlan = false; C.rattle = 1.5; sfx.rattle(); }
      else { C.tray++; sfx.print(); if (C.tray >= CC.trayMax) { C.printing = false; C.jobDone = true; C.jobs++; } }
    }
  }

  /* --- Kinder --- */
  const esc = backTurned() ? B.writingEscalateMult : 1;
  for (const k of G.kids) {
    k.annoyed = Math.max(0, k.annoyed - dt);
    k.calm = Math.max(0, k.calm - dt);
    switch (k.state) {
      case 'fidget':
        if (inPresence(k)) {
          if ((k.pres += dt) >= K.presenceCalm) { backToWork(k, 2); puff(sx(k.x), sy(k.y) - 44, PAL.white, 3); }
        } else {
          k.pres = 0;
          if ((k.t += dt * esc) >= K.fidgetTime) makeIdle(k);
        }
        break;
      case 'idle':
        if ((k.t += dt * esc) >= K.idleToLoud) { k.state = 'loud'; k.spreadT = 0; sfx.loud(); }
        break;
      case 'loud':
        if (!K.noSpread && (k.spreadT += dt) >= K.spreadEvery) {
          k.spreadT = 0;
          const nb = G.kids.filter(o => (Math.abs(o.r - k.r) + Math.abs(o.c - k.c)) === 1
            && ['work', 'done', 'fidget'].includes(o.state)
            && !(CONFIG.presence.blocksSpread && inPresence(o)));
          if (nb.length) { const o = pick(nb); makeIdle(o); puff(sx(o.x), sy(o.y) - 48, PAL.red, 5); }
        }
        break;
      case 'wait':
        if ((k.t += dt) >= CC.patience) { makeIdle(k); k.needsSheet = true; puff(sx(k.x), sy(k.y) - 48, PAL.blue, 5); }
        break;
      case 'question':
        if (!inBoardZone() && (k.t += dt) >= E.question.patience) makeIdle(k);   // steht die Lehrkraft an der Tafel, wartet der Azubi
        break;
      case 'wc':
        if ((k.t += dt) >= E.wc.patience) { makeIdle(k); k.needsWC = true; }
        break;
      case 'phoneSoon':
        if ((k.t += dt) >= E.phone.warn) {
          k.state = 'phone'; k.t = 0; k.ringT = 0;
          G.order = Math.max(0, G.order - E.phone.orderHit); G.loss.stoerer += E.phone.orderHit;
          G.laughT = 2.5;
        }
        break;
      case 'phone':
        k.t += dt;
        if ((k.ringT -= dt) <= 0) { sfx.ring(); k.ringT = 1.2; }
        break;
      case 'away':
        if (G.t >= k.arriveAt) { k.state = 'knock'; k.t = 0; k.knockT = 0; }
        break;
      case 'knock': {
        k.t += dt;
        const loud = k.t > DR.patience;
        if (DR.autoOpen && k.t >= DR.patience - 0.5) { letIn(true); break; }      // Upgrade Türöffner
        if ((k.knockT -= dt) <= 0) { sfx.knock(loud); k.knockT = loud ? 0.9 : 1.8; }
        break;
      }
      case 'walk': {
        const wp = k.path[0];
        const dx = wp.x - k.wx, dy = wp.y - k.wy, d = Math.hypot(dx, dy), v = DR.walkSpeed * dt;
        if (d <= v) {
          k.wx = wp.x; k.wy = wp.y; k.path.shift();
          if (!k.path.length) {
            if (k.job) helperArrive(k);
            else if (k.leaving) { k.leaving = false; k.state = 'away'; k.arriveAt = G.t + rand(E.wc.awayMin, E.wc.awayMax); G.doorOpen = 0.8; sfx.door(); }
            else {
              backToWork(k, 2);
              if (k.late && G.supply > 0 && Math.random() < DR.wantSheetChance) { k.state = 'wait'; k.t = 0; }
              k.late = false;
            }
          }
        }
        else {
          k.wx += dx / d * v; k.wy += dy / d * v; k.walk += dt * 10;
          k.face = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
        }
        break;
      }
    }
  }

  helperTick();

  if (G.prepGroups && G.t > 2) { G.prepGroups = false; requestGroupSheets(); }

  /* --- Event-Direktor: Unruhe kündigt sich an (Vorwarnung) --- */
  const writingNow = backTurned();
  const limit = (G.t < CONFIG.phases.warmupEnd ? CONFIG.warmupMaxProblems : CONFIG.maxProblems) + (writingNow ? B.writingExtraLimit : 0);
  const mult = form().noise * (writingNow ? B.writingSpawnMult : 1) * (G.t >= CONFIG.phases.finalStart ? CONFIG.finalSpawnMult : 1) * (RUN && RUN.prep.calm && G.t < 20 ? 0.5 : 1);
  G.spawnT -= dt * mult;
  const fidgetCands = () => G.kids.filter(k => k.state === 'work' && !inPresence(k) && k.calm <= 0);
  if (CONFIG.forecast && !G.forecastKid && G.spawnT / mult <= 3 && openProblems() < limit) { const c = fidgetCands(); if (c.length) G.forecastKid = pick(c); }
  if (G.spawnT <= 0) {
    if (openProblems() < limit) {
      const c = fidgetCands();
      const k = G.forecastKid && c.includes(G.forecastKid) ? G.forecastKid : c.length ? pick(c) : null;
      if (k) { k.state = 'fidget'; k.t = 0; k.pres = 0; }
    }
    G.forecastKid = null;
    G.spawnT = K.spawnInterval * (1 + rand(-1, 1) * K.spawnJitter);
  }
  G.sheetT -= dt;
  if (G.sheetT <= 0) {
    if (G.t >= CC.firstRequestAt && openProblems() < limit) {
      const c = G.kids.filter(k => k.state === 'work' && k.calm <= 0);
      if (c.length) { const k = pick(c); k.state = 'wait'; k.t = 0; }
    }
    G.sheetT = CC.requestInterval * (1 + rand(-1, 1) * CC.requestJitter);
  }
  const workingKids = () => G.kids.filter(k => k.state === 'work' && k.calm <= 0);
  if ((G.qT -= dt) <= 0) {
    if (openProblems() < limit && G.supply > 0) { const c = workingKids(); if (c.length) { const k = pick(c); k.state = 'question'; k.t = 0; } }
    G.qT = E.question.every * (1 + rand(-1, 1) * E.question.jitter);
  }
  if ((G.wcT -= dt) <= 0) {
    if (openProblems() < limit) { const c = workingKids(); if (c.length) { const k = pick(c); k.state = 'wc'; k.t = 0; } }
    G.wcT = E.wc.every * (1 + rand(-1, 1) * E.wc.jitter);
  }
  if (G.phoneAt !== null && G.t >= G.phoneAt) {
    const c = workingKids();
    if (c.length) { const k = pick(c); k.state = 'phoneSoon'; k.t = 0; sfx.buzz(); }
    G.phoneAt = null;
  }
  G.laughT = Math.max(0, G.laughT - dt);

  /* --- Ordnung --- */
  const D = CONFIG.order.drain;
  const cnt = s => G.kids.filter(k => k.state === s).length;
  const dS = cnt('idle') * D.idle + cnt('loud') * D.loud + cnt('phone') * E.phone.drain;
  const dT = G.supply <= 0 && !CONFIG.board.review ? D.boardEmpty : 0;
  const dK = cnt('wait') * D.waiting;
  const dD = G.kids.filter(k => k.state === 'knock').reduce((s, k) => s + (k.t > DR.patience ? D.knockLoud : D.knock), 0) + cnt('wc') * D.waiting;
  G.drainNow = { stoerer: dS, tafel: dT, kopierer: dK, tuer: dD };
  G.order -= (dS + dT + dK + dD) * dt;
  G.loss.stoerer += dS * dt; G.loss.tafel += dT * dt; G.loss.kopierer += dK * dt; G.loss.tuer += dD * dt;
  if (dS + dT + dK + dD === 0) G.order += CONFIG.order.recover * dt;
  G.order = clamp(G.order, 0, 100);
  G.orderInt += G.order * dt;

  /* --- Lernfortschritt --- */
  const L = CONFIG.learning;
  const quality = Math.min(1, G.order / L.fullAt) * (G.supply <= 0 ? 0.3 : 1);   // leere Tafel nur mit Wiederholungsaufgaben
  const learners = G.laughT > 0 ? [] : G.kids.filter(k => k.state === 'work' || k.state === 'fidget');
  G.learnRate = learners.length * L.perKid * form().learn * quality;
  G.learn += G.learnRate * dt;
  for (const k of learners) if (Math.random() < dt * 0.5 * form().learn * quality) G.parts.push({ x: sx(k.x) + rand(-8, 8), y: sy(k.y) - 50, vx: 0, vy: -28, g: 0, s: 1, t: 0, life: 0.8, color: PAL.yellow });

  /* --- Testwerte --- */
  const open = openProblems();
  G.m.probInt += open * dt;
  G.m.maxOpen = Math.max(G.m.maxOpen, open);
  if (open === 0 && G.supply > B.lowWarn * 100 && !G.writing) G.m.free += dt;

  /* --- Effekte --- */
  G.doorOpen = Math.max(0, G.doorOpen - dt);
  G.gongFx = Math.max(0, G.gongFx - dt);
  G.floats.forEach(f => f.t += dt); G.floats = G.floats.filter(f => f.t < 1);
  G.parts.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g ?? 60 * U) * dt; });
  G.parts = G.parts.filter(p => p.t < p.life);

  if (G.t >= CONFIG.lessonSeconds) endLesson();
}

function endLesson() {
  const W = CONFIG.week;
  const avg = G.orderInt / Math.max(G.t, 0.001);
  const stars = CONFIG.learning.stars.filter(v => G.learn >= v).length;
  const bonus = stars * CONFIG.taler.perStar;
  G.taler += bonus;
  totalTaler += G.taler;
  RUN.taler += G.taler;
  RUN.weekLearn += G.learn;
  state = 'end';
  sfx.bell();

  const lastOfDay = RUN.lesson >= W.lessonsPerDay - 1, lastOfWeek = lastOfDay && RUN.day >= W.days.length - 1;
  RUN.queue = lastOfWeek ? ['exam'] : lastOfDay ? ['shop', ...(RUN.day === W.changerAfterDay ? ['choice'] : []), 'nextDay'] : ['lesson'];
  const goText = { lesson: 'Weiter: nächste Stunde', shop: 'Weiter: Feierabend', exam: 'Weiter: Klassenarbeit' }[RUN.queue[0]];

  const L = G.loss, sum = L.stoerer + L.tafel + L.kopierer + L.tuer + L.fehl;
  const rows = [['Störer', L.stoerer], ['Warten auf Blätter', L.kopierer], ['Tafel leer', L.tafel], ['Tür', L.tuer], ['Falsch ermahnt', L.fehl]]
    .sort((a, b) => b[1] - a[1])
    .map(([n, v]) => {
      const p = Math.round(v / (sum || 1) * 100);
      return `<div><span class="l">${n}</span><span class="b"><i style="width:${p}%"></i></span><span class="p">${p} %</span></div>`;
    }).join('');
  const starHtml = [0, 1, 2].map(i => `<span class="${i < stars ? '' : 'off'}">★</span>`).join('');
  const target = examTarget(), wp = Math.min(100, Math.round(RUN.weekLearn / target * 100));
  showCard(`
    <h2>Es klingelt! <span style="color:var(--muted);font-size:.7em">${W.days[RUN.day]}, ${RUN.lesson + 1}. Stunde</span></h2>
    <div class="stars">${starHtml}</div>
    <p>Lernfortschritt: <b style="color:var(--ink)">${Math.round(G.learn)}</b> (Sterne ab ${CONFIG.learning.stars.join(' / ')}) · Ø Ordnung ${Math.round(avg)}</p>
    <p>Taler: <b style="color:var(--gold)">+${G.taler}</b>${bonus ? ` (inkl. ${bonus} Sterne-Bonus)` : ''} → ${RUN.taler}</p>
    <p style="margin-top:8px;color:var(--ink)">Klassenarbeit am Freitag: ${Math.round(RUN.weekLearn)} / ${target} Lernpunkte</p>
    <div class="weekbar"><i style="width:${wp}%"></i></div>
    <p style="margin-top:8px;color:var(--ink)">Woran lag's?</p>
    <div class="loss">${sum > 0.5 ? rows : '<p>Nichts verloren. Respekt!</p>'}</div>
    <p class="test">Testwerte: nichts zu tun ${Math.round(G.m.free / G.t * 100)} % · Ø gleichzeitige Probleme ${(G.m.probInt / G.t).toFixed(1)} · max ${G.m.maxOpen}</p>
    <p class="go">${goText} (Enter)</p>`);
}

function openShop() {
  state = 'shop';
  const W = CONFIG.week;
  const title = RUN.queue.includes('nextWeek') ? 'Wochenende!' : `Feierabend – ${W.days[RUN.day]}`;
  const owned = CHANGERS.filter(c => has(c.id)).map(c => c.name);
  const items = UPGRADES.map((u, i) => {
    const lv = upLevel(u.id), max = u.cost.length, cost = u.cost[lv];
    const maxed = lv >= max, afford = !maxed && RUN.taler >= cost;
    return `<button class="shopitem${maxed ? ' maxed' : ''}${afford ? '' : ' poor'}" data-buy="${i}" ${maxed ? 'disabled' : ''}>
      <span class="k">${i + 1}</span><span class="n">${u.name}${max > 1 ? ` <small>${lv}/${max}</small>` : ''}</span>
      <span class="d">${u.desc}</span><span class="c">${maxed ? 'gekauft' : cost + ' T'}</span></button>`;
  }).join('');
  showCard(`
    <h2>${title}</h2>
    <p>Du hast <b style="color:var(--gold)">${RUN.taler} Taler</b>. Was gönnst du dir?</p>
    <div class="shop">${items}</div>
    ${owned.length ? `<p class="test">Im Klassenzimmer: ${owned.join(' · ')}</p>` : ''}
    <p class="go">Weiter (Enter)</p>`);
}
function openChoice() {
  state = 'choice';
  const left = CHANGERS.filter(c => !has(c.id));
  if (!left.length) { advance(); return; }
  RUN.offer = left.sort(() => Math.random() - 0.5).slice(0, 3);
  const reason = RUN.queue.includes('nextWeek') ? 'Belohnung für die gute Klassenarbeit' : 'Bergfest! Neue Idee fürs Klassenzimmer';
  const items = RUN.offer.map((c, i) => `<button class="shopitem choice" data-pick="${i}">
      <span class="k">${i + 1}</span><span class="n">${c.name}</span><span class="c"></span>
      <span class="d">${c.desc}<br><i>Haken: ${c.catch}</i></span></button>`).join('');
  showCard(`
    <h2>${reason}</h2>
    <p>Such dir <b>eins</b> davon aus. Es bleibt für den ganzen Durchgang.</p>
    <div class="shop">${items}</div>`);
}
function pickChanger(i) {
  const c = RUN.offer && RUN.offer[i]; if (!c) return;
  RUN.ch[c.id] = true; RUN.offer = null; sfx.done();
  advance();
}

function buy(i) {
  const u = UPGRADES[i]; if (!u) return;
  const lv = upLevel(u.id), cost = u.cost[lv];
  if (cost === undefined || RUN.taler < cost) { sfx.wrong(); return; }
  RUN.taler -= cost; RUN.up[u.id] = lv + 1; sfx.done();
  openShop();
}

function showExam() {
  state = 'exam';
  const target = examTarget(), r = RUN.weekLearn / target;
  const grade = r >= 1.6 ? 1 : r >= 1.35 ? 2 : r >= 1.15 ? 3 : r >= 1 ? 4 : r >= 0.75 ? 5 : 6;
  const words = ['', 'sehr gut', 'gut', 'befriedigend', 'ausreichend', 'mangelhaft', 'ungenügend'];
  if (grade <= 4) {
    if (RUN.week > best) { best = RUN.week; try { localStorage.setItem('kig_best_weeks', String(best)); } catch (e) { /* egal */ } }
    RUN.queue = [...(grade <= CONFIG.week.changerGrade ? ['choice'] : []), 'shop', 'nextWeek'];
    sfx.done();
    showCard(`
      <h1>Klassenarbeit: Note ${grade}</h1>
      <p style="color:var(--ink)">${words[grade]}: ${Math.round(RUN.weekLearn)} von ${target} Lernpunkten.</p>
      <p>Woche ${RUN.week} geschafft! Nächste Woche wird es etwas wilder.${grade <= CONFIG.week.changerGrade ? ' Als Belohnung darfst du dir etwas Neues fürs Klassenzimmer aussuchen.' : ''}</p>
      <p class="go">Weiter (Enter)</p>`);
  } else {
    RUN.queue = ['over'];
    sfx.wrong();
    showCard(`
      <h1>Klassenarbeit: Note ${grade}</h1>
      <p style="color:var(--ink)">${words[grade]}: nur ${Math.round(RUN.weekLearn)} von ${target} Lernpunkten.</p>
      <p>Die Schulleitung bittet zum Gespräch … Du hast ${RUN.week - 1} ${RUN.week - 1 === 1 ? 'Woche' : 'Wochen'} geschafft. Rekord: ${best}.</p>
      <p class="go">Neuer Versuch (Enter)</p>`);
  }
}

// „Weiter“ auf allen Zwischenbildschirmen
function openPrep() {
  state = 'prep';
  const left = PREP_POINTS - prepUsed();
  const items = PREP.map((p, i) => {
    const on = !!RUN.prep[p.id], can = on || p.cost <= left;
    return `<button class="shopitem${on ? ' sel' : ''}${can ? '' : ' poor'}" data-prep="${i}">
      <span class="k">${i + 1}</span><span class="n">${p.name}</span><span class="c">${on ? '✓' : p.cost + ' P'}</span>
      <span class="d">${p.desc}</span></button>`;
  }).join('');
  showCard(`
    <h2>Vorbereitung für ${CONFIG.week.days[RUN.day]}</h2>
    <p>Am Abend vorher: Du hast <b style="color:var(--gold)">${left} von ${PREP_POINTS} Punkten</b> übrig. Wähle, was du vorbereitest.</p>
    <div class="shop">${items}</div>
    <p class="go">Los geht's (Enter)</p>`);
}
function togglePrep(i) {
  const p = PREP[i]; if (!p) return;
  if (RUN.prep[p.id]) delete RUN.prep[p.id];
  else if (p.cost <= PREP_POINTS - prepUsed()) RUN.prep[p.id] = true;
  else { sfx.wrong(); return; }
  sfx.select(); openPrep();
}

function advance() {
  if (state === 'title') { newRun(); openPrep(); return; }
  if (state === 'prep') { startLesson(); return; }
  if (state === 'choice' && RUN.offer) return;                   // erst auswählen
  const next = RUN.queue.shift();
  switch (next) {
    case 'lesson': RUN.lesson++; startLesson(); break;
    case 'shop': openShop(); break;
    case 'choice': openChoice(); break;
    case 'exam': showExam(); break;
    case 'nextDay': RUN.day++; RUN.lesson = 0; newDay(); openPrep(); break;
    case 'nextWeek': RUN.week++; RUN.day = 0; RUN.lesson = 0; RUN.weekLearn = 0; newDay(); openPrep(); break;
    case 'over': RUN = null; titleScreen(); break;
    default: break;
  }
}

/* Zeichnen: siehe render.js */

/* ================================================================ HUD */
function updateHud() {
  const o = Math.round(G.order);
  $('orderNum').textContent = o;
  $('barFill').style.width = o + '%';
  $('barFill').style.background = o > 60 ? 'var(--order)' : o > 30 ? 'var(--warn)' : 'var(--bad)';
  const left = Math.max(0, Math.ceil(CONFIG.lessonSeconds - G.t));
  $('clock').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  $('phase').textContent = RUN ? `W${RUN.week} ${CONFIG.week.days[RUN.day].slice(0, 2)} · Std. ${RUN.lesson + 1}/${CONFIG.week.lessonsPerDay} · ${form().label}${G.gongLeft ? ' · G: Klangschale ×' + G.gongLeft : ''}` : '';
  const LS = CONFIG.learning.stars, lmax = LS[2] * 1.15;
  $('lfill').style.width = Math.min(100, G.learn / lmax * 100) + '%';
  LS.forEach((v, i) => { $('tick' + i).style.left = (v / lmax * 100) + '%'; });
  $('learnNum').textContent = Math.floor(G.learn);
  $('lstars').textContent = '★'.repeat(LS.filter(v => G.learn >= v).length);
  $('taler').textContent = (RUN ? RUN.taler : 0) + G.taler;
  $('btnG').hidden = !G.gongLeft;
  $('hands').textContent = G.carry ? `Blätter ×${G.carry}` : G.writing ? 'Kreide' : 'leer';

  const dbg = $('debug');
  dbg.classList.toggle('hidden', !debug);
  if (debug) {
    const cnt = s => G.kids.filter(k => k.state === s).length;
    const limit = (G.t < CONFIG.phases.warmupEnd ? CONFIG.warmupMaxProblems : CONFIG.maxProblems) + (G.writing ? CONFIG.board.writingExtraLimit : 0);
    dbg.textContent =
      `DEBUG (F2 / ^)\n` +
      `offene Probleme: ${openProblems()}  (Limit ${limit})\n` +
      `zappelig ${cnt('fidget')}  trödeln ${cnt('idle')}  laut ${cnt('loud')}  Blatt ${cnt('wait')}  klopft ${cnt('knock')}\n` +
      `Kopierer: Fach ${G.copier.tray}/${CONFIG.copier.trayMax} ${G.copier.printing ? (G.copier.warm < CONFIG.copier.warmup ? 'wärmt auf' : 'druckt') : 'steht'}  Hände ${G.carry}  Pult ${G.stash}\n` +
      `Abzug/s  Störer ${G.drainNow.stoerer.toFixed(1)}  Tafel ${G.drainNow.tafel.toFixed(1)}  Kopierer ${G.drainNow.kopierer.toFixed(1)}  Tür ${G.drainNow.tuer.toFixed(1)}\n` +
      `Tafel: ${form().label} ${G.supply.toFixed(0)} %  Schreiben ${(G.writeProg * 100).toFixed(0)} %\n` +
      `Präsenz ${presenceOn() ? 'an' : 'AUS'} · nächste Unruhe ${Math.max(0, G.spawnT).toFixed(1)} s · nächster Blatt-Wunsch ${Math.max(0, G.sheetT).toFixed(1)} s\n` +
      `Lernen ${G.learnRate.toFixed(2)}/s (Qualität ${Math.round(Math.min(1, G.order / CONFIG.learning.fullAt) * 100)} %)  Kopierer ${G.copier.jam ? 'STAU ' + G.copier.hits : G.copier.cool > 0 ? 'kühlt ' + G.copier.cool.toFixed(0) + ' s' : 'ok'}\n` +
      `Frage in ${Math.max(0, G.qT).toFixed(0)} s · WC in ${Math.max(0, G.wcT).toFixed(0)} s · Handy ${G.phoneAt === null ? '–' : 'bei ' + G.phoneAt.toFixed(0) + ' s'}\n` +
      `nichts zu tun: ${(G.m.free / Math.max(G.t, 0.01) * 100).toFixed(0)} %  Ø Probleme: ${(G.m.probInt / Math.max(G.t, 0.01)).toFixed(1)}`;
  }
}

/* ========================================================== Screens */
function showCard(html) { $('card').innerHTML = html; $('overlay').classList.remove('hidden'); document.body.classList.add('overlay-open'); }
function hideCard() { $('overlay').classList.add('hidden'); document.body.classList.remove('overlay-open'); }

function titleScreen() {
  state = 'title';
  showCard(`
    <h1>Klasse im Griff!</h1>
    <p>Berufsschule · Klasse IM24 (Industriemechanik) · Prototyp</p>
    <p style="color:var(--ink);margin-top:8px">Wer unterrichtet? <span class="touch-hide" style="color:var(--muted)">(← → oder 1–4)</span></p>
    <div class="teachers">${TEACHER_PICK.map((tp, i) => `<button class="tpick${i === teacherPick ? ' sel' : ''}" data-teacher="${i}">
      <img src="${teacherPortrait(tp.idx)}" alt=""><b>${TEACHERS[tp.idx].name}</b><span class="tr">${tp.trait}</span><span class="td">${tp.desc}</span></button>`).join('')}</div>
    <p style="color:var(--ink)">Eine Woche, 2 Stunden pro Tag, am Freitag Klassenarbeit. Sorge für möglichst viel <b>Lernfortschritt</b>. Je mehr Ordnung, desto besser lernt die Klasse. Nach jedem Tag kaufst du kleine Upgrades, am Mittwoch und nach einer guten Klassenarbeit wählst du einen Game-Changer.${best ? ` Rekord: ${best} ${best === 1 ? 'Woche' : 'Wochen'}.` : ''}</p>
    <p class="rules">
       <b style="color:#c9c6d0">Graue Blase</b>: wird unruhig. Stell dich in die Nähe oder drück E.<br>
       <b style="color:#f7d154">Gelbe Blase</b>: trödelt. Hingehen, E. Nach 6 s wird es <b style="color:#e8534a">laut</b>.<br>
       <b>Tafel</b>: davor mit 1 / 2 / 3 (oder Q) die Arbeitsform wählen, dann E halten.<br>
       Einzel: ruhig, kurz · Partner: normal · Gruppe: lang, laut, jede Gruppe braucht ein Blatt.<br>
       <b style="color:#5ca7e8">Blaue Blase</b>: braucht ein Blatt. Kopierer unten links: wärmt auf, druckt bis zu 6.<br>
       1 Blatt in der Hand gibst du sofort, aus dem Stapel musst du E halten.<br>
       Am Pult: E tippen = alles ablegen bzw. 1 Blatt nehmen · E halten = Blatt für Blatt aufnehmen.<br>
       <b style="color:#f29a4e">Tür</b> unten rechts: Zuspätkommer klopfen. Hingehen, E.<br>
       <b style="color:#9fd39a">?</b> Frage: an der Tafel E halten (Lernbonus). Beim Azubi E = vertrösten. · <b style="color:#5cc8c0">WC</b>: beim Azubi E<br>
       <b style="color:#b07ce8">Handy</b> vibriert: schnell hin und E. Klingelt es schon: E halten.<br>
       Kopierer: muss nach einem vollen Auftrag abkühlen. Einmal am Tag rattert er und hat Papierstau: E hämmern.</p>
    <p class="keys touch-hide">WASD / Pfeile laufen · E / Leertaste · 1 2 3 / Q Arbeitsform · P Pause · M Musik · F Vollbild · F2 oder ^ Debug</p>
    <p class="keys touch-only">Handy quer halten: links mit dem Daumen ziehen zum Laufen · rechts E (tippen oder halten) und Q (Arbeitsform wechseln) · [ ] = Vollbild</p>
    <p class="go">Start (Enter, E oder tippen)</p>`);
}

function pickTeacher(i) {
  teacherPick = (i + TEACHER_PICK.length) % TEACHER_PICK.length;
  try { localStorage.setItem('kig_teacher', String(teacherPick)); } catch (e) { /* egal */ }
  applyModifiers(); sfx.select(); titleScreen();
}

function startLesson() { applyModifiers(); newLesson(); hideCard(); state = 'play'; keys.clear(); }

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'F2'].includes(e.code)) e.preventDefault();
  initAudio();
  if (e.code === 'F2' || e.code === 'Backquote' || e.key === '^' || e.key === 'Dead') { debug = !debug; return; }
  if (e.code === 'KeyM') { toggleMusic(); return; }
  if (e.code === 'KeyF') { toggleFullscreen(); return; }
  keys.add(e.code);
  if (e.repeat) return;
  const confirm = e.code === 'Enter' || e.code === 'KeyE' || e.code === 'Space';
  if (state === 'title') {
    if (confirm) { advance(); return; }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { pickTeacher(teacherPick - 1); return; }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { pickTeacher(teacherPick + 1); return; }
    const n = +e.key; if (n >= 1 && n <= TEACHER_PICK.length) { pickTeacher(n - 1); return; }
  }
  if (state === 'prep') {
    if (e.code === 'Enter' || e.code === 'Space') { advance(); return; }
    const n = +e.key; if (n >= 1 && n <= PREP.length) togglePrep(n - 1);
    return;
  }
  if (['end', 'shop', 'exam'].includes(state) && e.code === 'Enter') { advance(); return; }
  if (state === 'choice') { const n = +e.key; if (n >= 1 && n <= 3) pickChanger(n - 1); return; }
  if (state === 'shop') { const n = +e.key; if (n >= 1 && n <= 9) buy(n - 1); return; }
  if (state === 'pause' && (e.code === 'KeyP' || e.code === 'Escape' || confirm)) { state = 'play'; hideCard(); return; }
  if (state === 'play') {
    if (e.code === 'KeyP' || e.code === 'Escape') { state = 'pause'; showCard('<h2>Pause</h2><p class="go">P drücken zum Weiterspielen</p>'); return; }
    if (e.code === 'KeyE' || e.code === 'Space') tap();
    const num = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[e.code];
    if (num !== undefined) selectForm(num);
    if (e.code === 'KeyQ') selectForm(G.formSel + 1);
    if (e.code === 'KeyG') useGong();
  }
});
window.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());

/* ========================================================= Skalierung */
// Kamera fürs Handy: Ist das Bild größer als der Bildschirm, folgt es sanft der Lehrkraft.
const cam = { s: 1, x: 0, y: 0, mode: 'fit' };      // fit = ganzer Raum, zoom = nah dran mit Kamera
try { cam.mode = localStorage.getItem('kig_view') === 'zoom' ? 'zoom' : 'fit'; } catch (e) { /* egal */ }
function toggleView() {
  cam.mode = cam.mode === 'zoom' ? 'fit' : 'zoom';
  try { localStorage.setItem('kig_view', cam.mode); } catch (e) { /* egal */ }
  $('btnZ').textContent = cam.mode === 'zoom' ? '-' : '+';
  fit();
}
function toast(msg) {
  const el = $('toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 3500);
}
const VIEW = { x0: OX - 16, x1: OX + RW * T + 16, y0: OY - WALL_H - 8, y1: SH };   // sichtbarer Raum (Wände inklusive)
function updateCamera(k) {
  if (!isTouchDevice || !G) return;
  const s = cam.s, hudH = 22;
  const vw = (VIEW.x1 - VIEW.x0) * s, vh = (VIEW.y1 - VIEW.y0) * s;
  const tx = vw <= innerWidth ? (innerWidth - vw) / 2 - VIEW.x0 * s
    : clamp(innerWidth / 2 - sx(G.p.x) * s, innerWidth - VIEW.x1 * s, -VIEW.x0 * s);
  const ty = vh <= innerHeight - hudH ? hudH + (innerHeight - hudH - vh) / 2 - VIEW.y0 * s
    : clamp(innerHeight / 2 - (sy(G.p.y) - 30) * s, innerHeight - VIEW.y1 * s, hudH - VIEW.y0 * s);
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
  cv.style.transform = `translate(${Math.round(cam.x)}px, ${Math.round(cam.y)}px)`;
}

function fit() {
  if (isTouchDevice) {                                          // Handy: Klassenraum füllt den ganzen Bildschirm
    const fw = innerWidth / (VIEW.x1 - VIEW.x0), fh = (innerHeight - 22) / (VIEW.y1 - VIEW.y0);
    cam.s = cam.mode === 'zoom' ? Math.max(fw, fh) : Math.min(fw, fh);
    cv.style.width = SW * cam.s + 'px'; cv.style.height = SH * cam.s + 'px';
    updateCamera(1);
    return;
  }
  const hudH = $('hud').offsetHeight;
  const availW = innerWidth - 8;
  $('wrap').style.left = innerWidth / 2 + 'px';
  const raw = Math.min(availW / SW, (innerHeight - hudH) / SH);
  const full = !!(document.fullscreenElement || document.webkitFullscreenElement);
  const s = full ? raw : raw >= 2 ? Math.floor(raw) : Math.max(0.5, raw);   // im Vollbild ganz ausfüllen
  cv.style.width = SW * s + 'px'; cv.style.height = SH * s + 'px';
  $('hud').style.width = SW * s + 'px';
  $('overlay').style.top = hudH + 'px';
  $('hud').style.fontSize = Math.round(clamp(SW * s / 80, 9, 16)) + 'px';
}
window.addEventListener('resize', fit);

/* ========================================================== Hauptloop */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  clockT += dt;
  nextGust -= dt;
  if (nextGust <= 0) { gust = 1; nextGust = rand(6, 12); }
  gust = Math.max(0, gust - dt * 0.7);
  if (state === 'play') update(dt);
  render();
  updateCamera(Math.min(1, dt * 5));
  updateHud();
  requestAnimationFrame(frame);
}

/* Start: siehe Ende von render.js */

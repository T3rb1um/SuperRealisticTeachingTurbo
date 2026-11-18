/* Räume im Spiel + SPS-Labor-Logik.
   Räume sind Daten (Stellflächen, Tafel, Tür, Drucker, Pult). Wege laufen über eine Wegsuche, die in jedem Raum funktioniert. */

/* ------------------------------------------------------------ Räume */
const ROOMDEF = {
  class: {
    name: 'Klassenraum',
    blocks: STATIC_BLOCKS.map(b => ({ ...b })),
    board: { x0: 7, x1: 13, zoneY: 1.9 },
    door: { x0: 16.4, x1: 18.8, zoneY: 9.0, cx: 17.6 },
    copierAt: { x: 1.1, y: 8.5 }, copySpot: { x: 2.6, y: 9.3 },
    deskAt: { x: 3.6, y: 0.15, ax: 2.2 },
    start: { x: 10, y: 2.1 },
  },
  lab: {
    name: 'SPS-Labor',
    blocks: [
      { x0: 0.4, y0: 0.0, x1: 3.8, y1: 0.9, name: 'Kopierer' },          // Druckertisch
      { x0: 5.2, y0: 1.6, x1: 10.6, y1: 2.6, name: 'Lehrertisch' },
      { x0: 0.0, y0: 2.4, x1: 1.4, y1: 9.6, name: 'Reihe links' },
      { x0: 18.6, y0: 2.4, x1: 20, y1: 9.6, name: 'Reihe rechts' },
      { x0: 7.4, y0: 3.9, x1: 12.6, y1: 7.5, name: 'Anlage' },
      { x0: 3.0, y0: 9.2, x1: 6.2, y1: 10, name: 'Kleine Anlage' },
      { x0: 11.4, y0: 9.3, x1: 15.3, y1: 10, name: 'Schränke' },
      { x0: 15.0, y0: 0.0, x1: 16.6, y1: 0.4, name: 'Netzwerk' },          // Unterverteilung mit Switch
    ],
    board: { x0: 4.0, x1: 12.4, zoneY: 1.5 },
    door: { x0: 15.6, x1: 18.2, zoneY: 9.0, cx: 16.9 },
    door2: { x0: 17.6, x1: 19.8, zoneY: 1.2, cx: 18.75, cy: 0.5 },      // Tür an der Hinterwand
    copierAt: { x: 1.4, y: 0.4 }, copySpot: { x: 2.1, y: 1.3 },
    deskAt: { x: 9.6, y: 1.6, ax: 9.0 },
    plantSpot: { x: 10.0, y: 7.95 },
    plant2Spot: { x: 4.6, y: 8.85 },
    checkerSpot: { x: 12.95, y: 6.6 },
    robotHome: { x: 13.4, y: 1.25 },
    start: { x: 8.6, y: 3.1 },
  },
  hall: {
    name: 'Praxishalle', w: 30, h: 13,
    blocks: [
      { x0: 1.0, y0: 0.0, x1: 6.8, y1: 1.0, name: 'Motorregal' },
      { x0: 0.0, y0: 0.0, x1: 1.4, y1: 5.9, name: 'Hochregal' },
      { x0: 8.9, y0: 0.5, x1: 10.8, y1: 0.95, name: 'Hydraulik 1' }, { x0: 11.0, y0: 0.5, x1: 12.9, y1: 0.95, name: 'Hydraulik 2' },
      { x0: 14.0, y0: 0.5, x1: 15.9, y1: 0.95, name: 'Hydraulik 3' }, { x0: 16.1, y0: 0.5, x1: 18.0, y1: 0.95, name: 'Hydraulik 4' },
      { x0: 24.2, y0: 0.0, x1: 30, y1: 4.5, name: 'Büro' },
      { x0: 24.6, y0: 4.8, x1: 26.2, y1: 5.6, name: 'Kopierer' },                // Drucker am Büro
      { x0: 27.4, y0: 5.1, x1: 28.9, y1: 5.8, name: 'Tonnen' },
      { x0: 22.1, y0: 10.4, x1: 29.6, y1: 11.9, name: 'Radlader' },
      { x0: 13.2, y0: 9.4, x1: 16.1, y1: 10.05, name: 'Motor 1' },
      { x0: 19.75, y0: 6.5, x1: 21.4, y1: 7.05, name: 'Motor 2' },
      { x0: 16.6, y0: 9.8, x1: 18.2, y1: 10.6, name: 'Werkzeugwagen' },
      { x0: 1.6, y0: 9.6, x1: 4.4, y1: 9.95, name: 'Elektrowand 1' }, { x0: 7.0, y0: 9.6, x1: 9.8, y1: 9.95, name: 'Elektrowand 2' },
      { x0: 10.3, y0: 4.75, x1: 13.0, y1: 5.05, name: 'Mobile Tafel' },
      { x0: 13.4, y0: 4.55, x1: 14.3, y1: 5.05, name: 'Lehrertisch' },          // Stehpult mit Ablage
      { x0: 6.6, y0: 3.8, x1: 9.7, y1: 4.05, name: 'Smartboard' },
      { x0: 29.4, y0: 8.7, x1: 30, y1: 9.4, name: 'Feuerlöscher' },
    ],
    board: { x0: 10.0, x1: 13.3, zoneY: 6.3, y0: 4.9 },
    door: { x0: 18.4, x1: 20.8, zoneY: 12.0, cx: 19.6 },
    copierAt: { x: 25.4, y: 5.2 }, copySpot: { x: 25.4, y: 6.1 },
    deskAt: { x: 13.85, y: 4.55, ax: 13.85 },
    wcDoor: { x: 27.1, y: 4.9 },
    start: { x: 12.0, y: 5.8 },
  },
};
let ROOM_ID = 'class';
const isHall = () => ROOM_ID === 'hall';
const usesNav = () => ROOM_ID !== 'class';
const isLab = () => ROOM_ID === 'lab';
const RD = () => ROOMDEF[ROOM_ID];
const CPX = () => RD().copierAt.x, CPY = () => RD().copierAt.y;
const DKX = () => RD().deskAt.x, DKY = () => RD().deskAt.y;
let roomPick = 0;                                    // 0 automatisch (Block), 1 Klassenraum, 2 SPS-Labor
try { roomPick = +(localStorage.getItem('kig_room') || 0) || 0; } catch (e) { roomPick = 0; }
const ROOM_PICKS = ['Automatisch', 'Klassenraum', 'SPS-Labor', 'Praxishalle'];
function roomFor() {
  const p = RUN ? (RUN.roomPick ?? 0) : roomPick;
  if (p === 1) return 'class';
  if (p === 2) return 'lab';
  if (p === 3) return 'hall';
  const w = RUN ? RUN.week : 1;                                          // Block: Woche 3 Praxishalle, Woche 4 SPS-Labor
  return w >= 4 ? 'lab' : w === 3 ? 'hall' : 'class';
}
function enterRoom(id) {
  if (!ROOMDEF[id]) id = 'class';
  const changed = id !== ROOM_ID;
  ROOM_ID = id;
  const d = ROOMDEF[id];
  RW = d.w || 20; RH = d.h || 10;
  STATIC_BLOCKS.length = 0; d.blocks.forEach(b => STATIC_BLOCKS.push({ ...b }));
  for (const k of Object.keys(BOARD)) delete BOARD[k]; Object.assign(BOARD, d.board);
  for (const k of Object.keys(DOOR)) delete DOOR[k]; Object.assign(DOOR, d.door);
  Object.assign(COPY_SPOT, d.copySpot);
  if (changed || !navGrid) buildNav();
  // Spielbild an die Raumgröße anpassen (die ganze Halle ist auf einmal sichtbar, kein Scrollen)
  const big = id === 'hall', W = big ? OX * 2 + RW * T : SW, H = big ? OY + RH * T + 40 : SH;
  if (cv.width !== W || cv.height !== H) {
    cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false;
    VIEW.x1 = OX + RW * T + 16; VIEW.y1 = H;   // Handy: sichtbarer Bereich
    if (typeof fit === 'function') fit();
  }
}
function pickRoom(i) {
  roomPick = (i + ROOM_PICKS.length) % ROOM_PICKS.length;
  try { localStorage.setItem('kig_room', String(roomPick)); } catch (e) { /* egal */ }
  sfx.select(); titleScreen();
}

/* ------------------------------------------------------- Wegsuche */
let navGrid = null;
const NAV = 0.25;
function buildNav() {
  const W = Math.round(RW / NAV), H = Math.round(RH / NAV), r = 0.26, g = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = (i + 0.5) * NAV, y = (j + 0.5) * NAV;
    if (x < r || x > RW - r || y < 0.3 || y > RH - 0.05) continue;
    if (STATIC_BLOCKS.every(b => distToBlock(x, y, b) >= r)) g[j * W + i] = 1;
  }
  navGrid = { W, H, g };
}
function navCell(x, y) {                     // nächste freie Zelle
  const { W, H, g } = navGrid;
  let ci = clamp(Math.floor(x / NAV), 0, W - 1), cj = clamp(Math.floor(y / NAV), 0, H - 1);
  if (g[cj * W + ci]) return cj * W + ci;
  for (let rad = 1; rad < 12; rad++) for (let dj = -rad; dj <= rad; dj++) for (let di = -rad; di <= rad; di++) {
    const i = ci + di, j = cj + dj;
    if (i >= 0 && j >= 0 && i < W && j < H && g[j * W + i]) return j * W + i;
  }
  return cj * W + ci;
}
function lineFree(a, b) {
  const { W, g } = navGrid, ax = (a % W + 0.5) * NAV, ay = (((a / W) | 0) + 0.5) * NAV, bx = (b % W + 0.5) * NAV, by = (((b / W) | 0) + 0.5) * NAV;
  const n = Math.ceil(Math.hypot(bx - ax, by - ay) / (NAV / 2));
  for (let s = 1; s < n; s++) { const x = ax + (bx - ax) * s / n, y = ay + (by - ay) * s / n; if (!g[Math.floor(y / NAV) * W + Math.floor(x / NAV)]) return false; }
  return true;
}
// Liefert Wegpunkte von (x0,y0) nach (x1,y1); das Ziel selbst ist der letzte Punkt.
function findPath(x0, y0, x1, y1) {
  if (!navGrid) buildNav();
  const { W, H, g } = navGrid, s = navCell(x0, y0), t = navCell(x1, y1);
  const prev = new Int32Array(W * H).fill(-1), dist = new Float32Array(W * H).fill(1e9), open = [s];
  dist[s] = 0;
  const hx = t % W, hy = (t / W) | 0;
  while (open.length) {
    let bi = 0; for (let i = 1; i < open.length; i++) { const a = open[i], b = open[bi]; if (dist[a] + Math.hypot(a % W - hx, ((a / W) | 0) - hy) < dist[b] + Math.hypot(b % W - hx, ((b / W) | 0) - hy)) bi = i; }
    const c = open.splice(bi, 1)[0];
    if (c === t) break;
    const ci = c % W, cj = (c / W) | 0;
    for (const [di, dj, w] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.41], [1, -1, 1.41], [-1, 1, 1.41], [-1, -1, 1.41]]) {
      const i = ci + di, j = cj + dj;
      if (i < 0 || j < 0 || i >= W || j >= H) continue;
      const n = j * W + i;
      if (!g[n] || (di && dj && (!g[cj * W + i] || !g[j * W + ci]))) continue;
      const nd = dist[c] + w;
      if (nd < dist[n]) { if (dist[n] >= 1e9) open.push(n); dist[n] = nd; prev[n] = c; }
    }
  }
  const cells = [];
  for (let c = t; c !== -1; c = prev[c]) { cells.push(c); if (c === s) break; }
  cells.reverse();
  if (cells[0] !== s) return [{ x: x1, y: y1 }];
  const pts = []; let anchor = 0;                  // glätten: nur Ecken behalten
  for (let i = 2; i < cells.length; i++) if (!lineFree(cells[anchor], cells[i])) { pts.push(cells[i - 1]); anchor = i - 1; }
  const out = pts.map(c => ({ x: (c % W + 0.5) * NAV, y: (((c / W) | 0) + 0.5) * NAV }));
  out.push({ x: x1, y: y1 });
  return out;
}

/* ----------------------------------------------------- Labor-Azubis */
const LAB_SEATS_Y = [3.5, 4.4, 5.7, 6.6, 7.9, 8.8];
function makeLabKids() {
  const kids = [];
  for (let c = 0; c < 2; c++) LAB_SEATS_Y.forEach((y, r) => {
    const i = kids.length, side = c ? 1 : -1, x = c ? 17.85 : 2.15;
    const b = side < 0 ? { x0: x - 0.7, y0: y - 0.45, x1: x + 0.5, y1: y + 0.05 } : { x0: x - 0.5, y0: y - 0.45, x1: x + 0.7, y1: y + 0.05 };
    kids.push({
      i, r, c, side, pair: c * 3 + Math.floor(r / 2), cx: x, dy: y - 1.05,
      x, y, block: b,
      state: 'work', t: 0, pres: 0, spreadT: 0, knockT: 0, phase: rand(0, 6.28), annoyed: 0, calm: 0, flip: side < 0,
      ...LOOKS[i % LOOKS.length], item: i % 4,
      wx: 0, wy: 0, path: null, face: side < 0 ? 'left' : 'right', walk: 0,
    });
  });
  kids.forEach(k => { k.partner = kids.find(o => o !== k && o.pair === k.pair); });
  return kids;
}
const seatFront = k => (k.side ? { x: k.side < 0 ? k.x + 0.95 : k.x - 0.95, y: k.y } : { x: k.x, y: k.y + 0.75 });   // Stehplatz neben dem Azubi
function spreadNeighbors(k) {
  if (isHall()) return G.kids.filter(o => o !== k && isSeated(o) && (o.grp === k.grp || Math.hypot(o.x - k.x, o.y - k.y) < 2.6));
  if (!isLab()) return G.kids.filter(o => (Math.abs(o.r - k.r) + Math.abs(o.c - k.c)) === 1);
  return G.kids.filter(o => o !== k && o.c === k.c && Math.abs(o.r - k.r) === 1);
}
function groupsOfKids() {
  if (isHall()) return [0, 1, 2, 3, 4, 5].map(g => G.kids.filter(k => k.grp === g));
  if (isLab()) return [0, 1, 2, 3, 4, 5].map(p => G.kids.filter(k => k.pair === p));
  const cols = form().groupSheets === 2 ? [[0, 1], [2, 3]] : CONFIG.kids.cols.map((_, c) => [c]);
  return cols.map(cs => G.kids.filter(k => cs.includes(k.c)));
}
const labLevel = () => CONFIG.lab.levels[G.formIdx] || CONFIG.lab.levels[1];
const pairMult = k => (isLab() && k.partner && (k.partner.state === 'work' || k.partner.state === 'fidget') ? CONFIG.lab.pairBonus : 1);

const LAB_SUBJECTS = [
  { lines: ['AMPEL', 'E0.0 = START', 'A0.0-A0.2 LAMPEN', 'T1 = 5S'], fig: 'tl' },
  { lines: ['FOERDERBAND', 'E0.1 = SENSOR', 'A0.3 = MOTOR', 'M10.0 MERKER'], fig: 'belt' },
  { lines: ['SORTIEREN', 'E0.2 = FARBE', 'A0.4 = WEICHE', 'Z1 ZAEHLER'], fig: 'sort' },
  { lines: ['NOT-AUS', 'E0.7 OEFFNER', 'QUITTIEREN', 'SICHER?'], fig: 'estop' },
  { lines: ['ZYLINDER', '1A1 AUSFAHREN', '1S2 ENDLAGE', '5/2-VENTIL'], fig: 'cyl' },
];

/* ---------------------------------------------------- Labor-Ablauf */
function labInitLesson() {
  const LB = CONFIG.lab;
  G.plant = { cur: null, t: 0, estop: false, queue: [] };
  G.plant2 = { cur: null, t: 0, estop: false };
  if (has('checker') && !G.exam) {                    // Azubi-Prüfer: steht an der Anlage und hilft
    const k = G.kids.slice().reverse().find(k => k.state === 'work');
    if (k) { const S = RD().checkerSpot; k.state = 'walk'; k.wx = k.x; k.wy = k.y; k.job = { kind: 'checker', stage: 'go' }; k.path = findPath(k.x, k.y, S.x, S.y); }
  }
  G.netDown = false; G.netAt = !G.exam && Math.random() < LB.net.chance ? rand(LB.net.from, LB.net.to) : null; G.netIdleT = 0;
  G.pcT = LB.pc.firstAt; G.plcT = LB.plc.firstAt; G.testT = LB.test.firstAt; G.labHold = null;
  const h = RD().robotHome;
  G.robot = { x: h.x, y: h.y, path: [], stage: 'idle', carry: false, target: null, stuckAt: null, stuck: false, walk: 0, face: 'down' };
}
const atNet = () => distToBlock(G.p.x, G.p.y, blockByName('Netzwerk')) <= CONFIG.player.reach;
const atPlant = () => distToBlock(G.p.x, G.p.y, blockByName('Anlage')) <= CONFIG.player.reach;
const robotNear = () => G.robot && G.robot.stuck && Math.hypot(G.p.x - G.robot.x, G.p.y - G.robot.y) <= 1.4;
function labTarget() {
  if (!isLab() || !G.plant) return null;
  if (G.netDown && atNet()) return { type: 'net' };
  if (robotNear()) return { type: 'robot' };
  const P = G.plant;
  if (atPlant() && (P.estop || (P.cur && P.cur.job && P.cur.job.stage === 'run'))) return { type: 'plant' };
  return null;
}
function labTap(tg) {
  if (!isLab()) return false;
  const LB = CONFIG.lab;
  if (tg.type === 'net') { G.labHold = { kind: 'net', t: 0 }; return true; }
  if (tg.type === 'plant') { G.labHold = { kind: G.plant.estop ? 'quit' : 'help', t: 0 }; return true; }
  if (tg.type === 'robot') { G.robot.stuck = false; float(sx(G.robot.x), sy(G.robot.y) - 70, 'WEITER', '#9fd3f0'); sfx.calm(); return true; }
  if (tg.type !== 'kid') return false;
  const k = tg.kid;
  if (k.state === 'pc') { G.labHold = { kind: 'pc', k, t: 0 }; return true; }
  if (k.state === 'plc') { backToWork(k, 2); reward(k); float(sx(k.x), sy(k.y) - 80, 'RUN', '#7cc47a'); sfx.calm(); return true; }
  if (k.state === 'test') { k.t = Math.max(0, k.t - CONFIG.events.question.soothe); float(sx(k.x), sy(k.y) - 80, 'GLEICH!', '#5cc8c0'); sfx.calm(); return true; }
  if (k.state === 'net') { float(sx(k.x), sy(k.y) - 80, 'NETZ!', PAL.grey); sfx.wrong(); return true; }
  return false;
}
function labFixHold(dt, hold) {
  const H = G.labHold, LB = CONFIG.lab, P = G.plant;
  if (!H) return;
  if (!hold) { G.labHold = null; return; }
  if (H.kind === 'pc') {
    const tg = currentTarget();
    if (!tg || tg.kid !== H.k || H.k.state !== 'pc') { G.labHold = null; return; }
    if (Math.random() < dt * 6) sfx.fiddle();
    if ((H.t += dt) >= LB.pc.hold) { backToWork(H.k, 2); reward(H.k); float(sx(H.k.x), sy(H.k.y) - 80, 'NEUSTART', '#9fd3f0'); sfx.start(); G.labHold = null; G.needRelease = true; }
  } else if (H.kind === 'net') {
    if (!atNet() || !G.netDown) { G.labHold = null; return; }
    if ((H.t += dt) >= LB.net.hold) {
      G.netDown = false; G.kids.forEach(k => { if (k.state === 'net') backToWork(k, 2); });
      G.taler += 3; float(sx(15.8), sy(0.4) - 70, 'NETZ OK +3', PAL.yellow); sfx.done(); G.labHold = null; G.needRelease = true;
    }
  } else if (H.kind === 'quit') {
    if (!atPlant() || !P.estop) { G.labHold = null; return; }
    if ((H.t += dt) >= LB.test.quitHold) { P.estop = false; P.t = (P.dur || labLevel().dur) * 0.6; float(sx(10), sy(3.9) - 80, 'QUITTIERT', '#7cc47a'); sfx.start(); G.labHold = null; G.needRelease = true; }
  } else if (H.kind === 'help') {
    if (!atPlant() || P.estop || !P.cur) { G.labHold = null; return; }
    H.t += dt;
  }
}
function labNeedFix(k, kind) { makeIdle(k); k.needsFix = kind; puff(sx(k.x), sy(k.y) - 48, PAL.red, 5); }
function labPickWorker(limit) {
  if (openProblems() >= limit) return null;
  const c = G.kids.filter(k => k.state === 'work' && k.calm <= 0 && !inPresence(k));
  return c.length ? pick(c) : null;
}
function labTick(dt, hold, limit) {
  const LB = CONFIG.lab, P = G.plant;
  labFixHold(dt, hold);
  if (G.exam) return;
  // Ereignisse
  const lv = labLevel(), edt = dt * lv.ev;
  if ((G.pcT -= edt) <= 0) { const k = labPickWorker(limit); if (k) { k.state = 'pc'; k.t = 0; sfx.buzz(); } G.pcT = LB.pc.every * (1 + rand(-1, 1) * LB.pc.jitter); }
  if ((G.plcT -= edt) <= 0) { const k = labPickWorker(limit); if (k) { k.state = 'plc'; k.t = 0; } G.plcT = LB.plc.every * (1 + rand(-1, 1) * LB.plc.jitter); }
  if ((G.testT -= dt) <= 0) {
    const busyPairs = new Set(P.queue.map(k => k.pair).concat(P.cur ? [P.cur.pair] : []));
    const c = G.kids.filter(k => k.state === 'work' && !busyPairs.has(k.pair));
    if (c.length && !(G.labPause > 0)) { const k = pick(c); k.state = 'test'; k.t = 0; P.queue.push(k); float(sx(k.x), sy(k.y) - 80, 'TESTEN!', '#5cc8c0'); }
    G.testT = lv.every / 2 * (1 + rand(-1, 1) * LB.test.jitter);                  // zwei Seiten → im Schnitt alle every/2 s ein Testwunsch
  }
  if (G.netAt !== null && G.t >= G.netAt) {
    G.netAt = null; G.netDown = true; G.netIdleT = LB.net.idleEvery;
    G.kids.forEach(k => { if (['work', 'fidget', 'done', 'pc', 'plc'].includes(k.state)) { k.state = 'net'; k.t = 0; } });
    float(sx(15.8), sy(0.4) - 70, 'NETZWERK WEG!', PAL.red); sfx.jam();
  }
  if (G.netDown && (G.netIdleT -= dt) <= 0) { G.netIdleT = LB.net.idleEvery; const c = G.kids.filter(k => k.state === 'net'); if (c.length) labNeedFix(pick(c), null); }
  // Geduld
  for (const k of G.kids) {
    if (k.state === 'pc' && (k.t += dt) >= LB.pc.patience) labNeedFix(k, 'pc');
    if (k.state === 'plc' && (k.t += dt) >= LB.plc.patience) labNeedFix(k, 'plc');
    if (k.state === 'test' && (k.t += dt) >= LB.test.patience) labNeedFix(k, 'test');
  }
  // Teststationen: große Anlage (mit Hilfe) und – als Ausbau – die kleine Anlage unten
  P.queue = P.queue.filter(k => k.state === 'test');
  const P2 = G.plant2;
  const send = (S, spot) => {
    const k = P.queue.shift();
    k.state = 'walk'; k.wx = k.x; k.wy = k.y; k.job = { kind: 'test', stage: 'go', st: S === P ? 1 : 2 };
    k.path = findPath(k.x, k.y, spot.x, spot.y); S.cur = k; S.t = 0; S.dur = labLevel().dur; S.bonus = labLevel().bonus; S.helped = false;
  };
  if (!P.cur && !P.estop && P.queue.length) send(P, RD().plantSpot);
  if (P2 && has('plant2') && !P2.cur && P.queue.length) send(P2, RD().plant2Spot);
  const checker = G.kids.some(k => k.job && k.job.kind === 'checker' && k.job.stage === 'stay');
  runStation(P, dt, lv, true, checker);
  if (P2 && has('plant2')) runStation(P2, dt, lv, false, false);
  robotTick(dt);
}
function runStation(S, dt, lv, main, checker) {
  const LB = CONFIG.lab, X = main ? 10 : 4.6, Y = main ? 3.9 : 8.6;
  if (!(S.cur && S.cur.job && S.cur.job.stage === 'run' && !S.estop)) return;
  const helping = main && G.labHold && G.labHold.kind === 'help';
  if (helping || checker) S.helped = true;
  S.t += dt * (helping ? LB.test.helpMult : checker ? 1.6 : 1);
  if (S.t < (S.dur || lv.dur)) return;
  const k = S.cur;
  if (main && !S.hadStop && Math.random() < lv.estop) { S.estop = true; S.hadStop = true; sfx.jam(); float(sx(X), sy(Y) - 80, 'NOT-AUS!', PAL.red); return; }
  if (Math.random() < lv.fail * (S.helped ? LB.test.helpFail : 1)) {                   // Test schlägt fehl → Fehlersuche am Platz
    S.hadStop = false; S.helped = false; k.debug = true;
    float(sx(X), sy(Y) - 80, 'FEHLER!', PAL.orange); sfx.wrong();
  } else {
    const b = S.bonus || lv.bonus;
    G.learn += b; k.learn = (k.learn || 0) + b / 2; if (k.partner) k.partner.learn = (k.partner.learn || 0) + b / 2;
    G.taler += CONFIG.taler.perTask; S.hadStop = false; S.helped = false;
    float(sx(X), sy(Y) - 80, 'TEST OK +' + Math.round(b), '#7cc47a'); puff(sx(k.wx), sy(k.wy) - 50, '#7cc47a', 8); sfx.done();
  }
  k.job.stage = 'home'; k.path = findPath(k.wx, k.wy, k.x, k.y); S.cur = null;
}

function labJobArrive(k) {
  const j = k.job;
  if (j.kind === 'checker') { j.stage = 'stay'; k.face = 'left'; return; }
  if (j.stage === 'go') { j.stage = 'run'; k.face = 'up'; return; }
  if (j.stage === 'home') {
    k.job = null; backToWork(k, 2);
    if (k.debug) { k.debug = false; k.state = 'question'; k.t = 0; float(sx(k.x), sy(k.y) - 80, 'FEHLERSUCHE', PAL.orange); }   // Fehler suchen: am Platz erklären
  }
}
// Netzwerk-Abzug und Ordnung
const labDrain = () => (isLab() && G.netDown ? CONFIG.lab.net.drain : 0);

/* --------------------------------------------------- Fahrroboter */
function robotTick(dt) {
  const R0 = G.robot, LB = CONFIG.lab.robot;
  if (!R0 || !has('robot')) return;
  if (R0.stuck) return;
  if (R0.path.length) {
    if (R0.stuckAt !== null && (R0.stuckAt -= dt) <= 0) { R0.stuckAt = null; R0.stuck = true; sfx.wrong(); return; }
    const wp = R0.path[0], dx = wp.x - R0.x, dy = wp.y - R0.y, d = Math.hypot(dx, dy), v = LB.speed * dt;
    if (d <= v) { R0.x = wp.x; R0.y = wp.y; R0.path.shift(); if (!R0.path.length) robotArrive(); }
    else { R0.x += dx / d * v; R0.y += dy / d * v; R0.walk += dt; }
    return;
  }
  if (R0.stage === 'idle') {
    const t = G.kids.find(k => k.state === 'wait' && !k.helperComing);
    if (t && (G.copier.tray > 0 || G.stash > 0)) {
      t.helperComing = true; R0.target = t; R0.stage = G.copier.tray > 0 ? 'copy' : 'pult';
      const S = R0.stage === 'copy' ? COPY_SPOT : { x: RD().deskAt.ax, y: 1.2 };
      R0.path = findPath(R0.x, R0.y, S.x, S.y); R0.stuckAt = Math.random() < LB.stuckChance ? rand(1, 3) : null;
    }
  }
}
function robotArrive() {
  const R0 = G.robot, C = G.copier;
  if (R0.stage === 'copy' || R0.stage === 'pult') {
    let ok = false;
    if (R0.stage === 'copy' && C.tray > 0) { C.tray--; ok = true; if (C.tray === 0 && C.jobDone) { C.jobDone = false; C.cool = CONFIG.copier.cooldown; } }
    if (R0.stage === 'pult' && G.stash > 0) { G.stash--; ok = true; }
    if (!ok) { R0.target.helperComing = false; R0.target = null; return robotHome(); }
    R0.carry = true; sfx.paper(); R0.stage = 'deliver';
    const f = seatFront(R0.target);
    R0.path = findPath(R0.x, R0.y, f.x, f.y); R0.stuckAt = Math.random() < CONFIG.lab.robot.stuckChance ? rand(1, 3) : null;
  } else if (R0.stage === 'deliver') {
    const t = R0.target; t.helperComing = false; R0.carry = false;
    if (t.state === 'wait') { t.needsSheet = false; backToWork(t, 1.5); t.state = 'work'; puff(sx(t.x), sy(t.y) - 36, PAL.white, 5); sfx.paper(); }
    else G.stash = Math.min(CONFIG.deskStashMax, G.stash + 1);
    R0.target = null; robotHome();
  } else R0.stage = 'idle';
}
function robotHome() { const R0 = G.robot, h = RD().robotHome; R0.stage = 'back'; R0.path = findPath(R0.x, R0.y, h.x, h.y); }
// Farbe der Bildschirme je Paar (für die Raumgrafik)
function labPcColor(side, n) {
  if (!G || !isLab() || !G.kids) return null;
  const pair = (side < 0 ? 0 : 3) + n, ks = G.kids.filter(k => k.pair === pair);
  if (ks.some(k => k.state === 'net') || G.netDown) return '#3a3d46';
  if (ks.some(k => k.state === 'pc')) return blink(3) ? '#e8534a' : '#2b3a4a';
  if (ks.some(k => k.state === 'plc')) return '#f29a4e';
  return null;
}

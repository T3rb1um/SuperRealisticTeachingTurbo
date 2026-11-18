/* Praxishalle: Wartungsauftrag Radlader.
   Vier Arbeitspakete (Hydraulik, Elektrik, Motor, Endmontage) füllen sich, während die Gruppen arbeiten.
   Meilensteine brauchen die Lehrkraft: ein Teil vom Werkzeugwagen (ca. 40 %) und die Abnahme (100 %).
   Wo die Lehrkraft steht, wird schneller gearbeitet. Ist alles fertig → großer Bonus, nächster Auftrag. */

const HALL_ST = [
  { name: 'HYDRAULIK 1', slots: [[9.8, 1.9, 'up'], [11.9, 1.9, 'up']] },
  { name: 'HYDRAULIK 2', slots: [[14.9, 1.9, 'up'], [17.0, 1.9, 'up']] },
  { name: 'MOTOREN',     slots: [[12.7, 10.3, 'right'], [19.1, 7.5, 'right']] },
  { name: 'RADLADER',    slots: [[21.0, 11.6, 'right'], [22.3, 12.4, 'up']] },
  { name: 'ELEKTRO 2',   slots: [[7.9, 10.7, 'up'], [9.4, 10.7, 'up']] },
  { name: 'ELEKTRO 1',   slots: [[2.5, 10.7, 'up'], [4.0, 10.7, 'up']] },
];
// Arbeitspakete: welche Gruppen, wie lange (s bei voller Arbeit), welches Teil, wo der Balken steht
const HALL_PKG = [
  { id: 'hyd', name: 'HYDRAULIK',  grps: [0, 1], time: 30, part: 'DICHTUNGEN', bar: [13.4, 2.75] },
  { id: 'ele', name: 'ELEKTRIK',   grps: [4, 5], time: 30, part: 'KABELBAUM',  bar: [5.95, 12.35] },
  { id: 'mot', name: 'MOTOR',      grps: [2],    time: 24, part: 'FILTER',     bar: [16.4, 8.2] },
  { id: 'rad', name: 'ENDMONTAGE', grps: [3],    time: 18, part: 'SCHRAUBEN',  bar: [25.6, 9.4] },
];
const HALL_ORDERS = ['RADLADER: INSPEKTION', 'RADLADER: HYDRAULIK UNDICHT', 'RADLADER: LICHT + MOTOR', 'RADLADER: WINTERFEST'];
const hallBox = (x, y) => ({ x0: x - 0.3, y0: y - 0.35, x1: x + 0.3, y1: y });
const hallStation = k => k.grp;
const hallSpot = k => HALL_ST[k.grp].slots[k.slot];
const pkgOf = k => HALL_PKG.findIndex(p => p.grps.includes(k.grp));

function makeHallKids() {
  const kids = [];
  for (let i = 0; i < 12; i++) {
    const grp = Math.floor(i / 2), slot = i % 2, [x, y, face] = HALL_ST[grp].slots[slot];
    kids.push({
      i, r: slot, c: grp, grp, slot, pair: grp, cx: x, dy: y - 1.05, x, y, block: hallBox(x, y),
      state: 'work', t: 0, pres: 0, spreadT: 0, knockT: 0, phase: rand(0, 6.28), annoyed: 0, calm: 0, flip: false,
      ...LOOKS[i % LOOKS.length], item: i % 4, wx: 0, wy: 0, path: null, face, walk: 0,
    });
  }
  kids.forEach(k => { k.partner = kids.find(o => o !== k && o.grp === k.grp); });
  return kids;
}

function hallNewOrder() {
  G.order_n = (G.order_n || 0) + 1;
  G.hallOrder = pick(HALL_ORDERS);
  G.pkg = HALL_PKG.map(() => ({ p: 0, need: null, done: false }));       // need: 'mat' | 'check'
  G.orderDoneT = 0;
}
function hallInitLesson() {
  const H = CONFIG.hall;
  G.rot = 0; G.supply = 100; G.mats = 0; G.binder = false; G.hallHold = null;
  G.order_n = 0; hallNewOrder();
  G.puddle = null; G.leakAt = !G.exam && Math.random() < H.leak.chance ? rand(H.leak.from, H.leak.to) : null;
  G.motorLoud = null; G.motorAt = !G.exam && Math.random() < H.motor.chance ? rand(H.motor.from, H.motor.to) : null;
  G.climbAt = !G.exam && Math.random() < H.climb.chance ? rand(H.climb.from, H.climb.to) : null;
  G.wcBusy = null; G.wcQueue = [];
}
function hallRotate() { G.writeProg = 0; G.writing = false; G.needRelease = true; }   // (keine Rotation mehr)
function hallArrive(k) {
  k.hallMove = false; k.path = [];
  backToWork(k, 1.5);
  const [, , face] = hallSpot(k); k.face = face;
  if (G.puddle && G.puddle.grps.includes(k.grp)) k.state = 'leak';
}

/* --------------------------------------------------------------- WC */
function hallSendToWC(k) {
  const W = RD().wcDoor;
  if (G.wcBusy) {                                         // nur ein WC: anstellen
    if (k.state !== 'wcq') { k.state = 'wcq'; k.t = 0; k.needsWC = false; G.wcQueue.push(k); reward(k); float(sx(k.x), sy(k.y) - 80, 'BESETZT', '#5cc8c0'); }
    return;
  }
  G.wcBusy = k; k.needsWC = false;
  k.state = 'walk'; k.leaving = true; k.wx = k.x; k.wy = k.y;
  k.path = findPath(k.x, k.y, W.x, W.y + 0.5);
  if (!k.wcQueued) { reward(k); sfx.calm(); }
  k.wcQueued = false;
}
function hallEnterWC(k) {
  const H = CONFIG.hall;
  k.leaving = false; k.state = 'away'; k.inWC = true; k.arriveAt = G.t + rand(H.wc.awayMin, H.wc.awayMax);
  sfx.door();
}
function hallBackFromWC(k) {
  const W = RD().wcDoor, [x, y] = hallSpot(k);
  k.inWC = false; G.wcBusy = null;
  k.state = 'walk'; k.wx = W.x; k.wy = W.y + 0.5; k.hallMove = true;
  k.path = findPath(k.wx, k.wy, x, y);
  sfx.door();
}

/* --------------------------------------------------- Ziele und Tippen */
const nearBlock = name => { const b = blockByName(name); return b && distToBlock(G.p.x, G.p.y, b) <= CONFIG.player.reach; };
const hallMotorBlock = () => G.motorLoud ? blockByName(G.motorLoud.m ? 'Motor 2' : 'Motor 1') : null;
function hallTarget() {
  if (!isHall() || !G || !G.pkg) return null;
  if (G.puddle && Math.hypot(G.p.x - G.puddle.x, G.p.y - G.puddle.y) <= 1.3) return { type: 'puddle' };
  const mb = hallMotorBlock(); if (mb && distToBlock(G.p.x, G.p.y, mb) <= CONFIG.player.reach) return { type: 'motor' };
  if (G.puddle && !G.binder && nearBlock('Hochregal')) return { type: 'binder' };
  if (G.kids.some(k => k.state === 'mat') && G.mats < CONFIG.hall.mat.carry && nearBlock('Werkzeugwagen')) return { type: 'parts' };
  return null;
}
function hallTap(tg) {
  if (!isHall()) return false;
  const H = CONFIG.hall;
  if (tg.type === 'puddle') {
    if (G.binder) G.hallHold = { kind: 'clean', t: 0 };
    else { float(sx(G.puddle.x), sy(G.puddle.y) - 50, 'BINDEMITTEL HOLEN (REGAL)', PAL.orange); sfx.wrong(); }
    return true;
  }
  if (tg.type === 'motor') {
    const mb = hallMotorBlock(); G.motorLoud = null; reward(null);
    float(sx((mb.x0 + mb.x1) / 2), sy(mb.y0) - 70, 'MOTOR AUS', '#9fd39a'); sfx.calm(); return true;
  }
  if (tg.type === 'binder') { G.binder = true; float(sx(1.0), sy(3) - 60, 'BINDEMITTEL', PAL.yellow); sfx.paper(); return true; }
  if (tg.type === 'parts') {
    const n = H.mat.carry - G.mats; G.mats += n;
    float(sx(17.4), sy(9.8) - 60, 'TEILE +' + n, PAL.yellow); sfx.paper(); return true;
  }
  if (tg.type !== 'kid') return false;
  const k = tg.kid;
  if (k.state === 'mat') {
    if (G.mats > 0) {
      G.mats--; backToWork(k, 2); reward(k); sfx.paper();
      const P = G.pkg[pkgOf(k)]; if (P) P.need = null;
      float(sx(k.x), sy(k.y) - 80, HALL_PKG[pkgOf(k)].part, PAL.yellow);
    } else { float(sx(k.x), sy(k.y) - 80, 'TEIL VOM WERKZEUGWAGEN', PAL.orange); sfx.wrong(); }
    return true;
  }
  if (k.state === 'check') { G.hallHold = { kind: 'check', k, t: 0 }; return true; }
  if (k.state === 'climbSoon' || k.state === 'climb') { backToWork(k, 3); reward(k); float(sx(k.x), sy(k.y) - 80, 'RUNTER DA!', PAL.orange); sfx.scold(); return true; }
  if (k.state === 'wcq') { float(sx(k.x), sy(k.y) - 80, 'GLEICH', '#5cc8c0'); return true; }
  if (k.state === 'leak') { float(sx(k.x), sy(k.y) - 80, 'ÖL WEG!', PAL.orange); return true; }
  return false;
}
function hallHoldTick(dt, hold) {
  const Hh = G.hallHold, H = CONFIG.hall;
  if (!Hh) return;
  if (!hold) { G.hallHold = null; return; }
  if (Hh.kind === 'check') {
    const tg = currentTarget();
    if (!tg || tg.kid !== Hh.k || Hh.k.state !== 'check') { G.hallHold = null; return; }
    if ((Hh.t += dt) >= H.check.hold) {
      const k = Hh.k, i = pkgOf(k), P = G.pkg[i], b = H.order.checkBonus;
      P.need = null; P.done = true;
      G.learn += b; HALL_PKG[i].grps.forEach(g => G.kids.filter(o => o.grp === g).forEach(o => { o.learn = (o.learn || 0) + b / 4; }));
      backToWork(k, 2); G.taler += CONFIG.taler.perTask;
      float(sx(k.x), sy(k.y) - 80, HALL_PKG[i].name + ' OK +' + b, '#9fd39a'); puff(sx(k.x), sy(k.y) - 50, '#9fd39a', 8); sfx.done();
      G.hallHold = null; G.needRelease = true;
    }
  } else if (Hh.kind === 'clean') {
    if (!G.puddle || Math.hypot(G.p.x - G.puddle.x, G.p.y - G.puddle.y) > 1.4) { G.hallHold = null; return; }
    if (Math.random() < dt * 8) sfx.fiddle();
    if ((Hh.t += dt) >= H.leak.clean) {
      G.puddle = null; G.binder = false;
      G.kids.forEach(k => { if (k.state === 'leak') backToWork(k, 2); });
      reward(null); float(sx(G.p.x), sy(G.p.y) - 70, 'SAUBER', '#9fd39a'); sfx.done();
      G.hallHold = null; G.needRelease = true;
    }
  }
}

/* ------------------------------------------------------------- Ablauf */
function hallPick(limit, filter) {
  if (openProblems() >= limit) return null;
  const c = G.kids.filter(k => k.state === 'work' && k.calm <= 0 && (!filter || filter(k)));
  return c.length ? pick(c) : null;
}
const teacherNear = i => G.kids.some(k => HALL_PKG[i].grps.includes(k.grp) && isSeated(k) && inPresence(k));
function hallTick(dt, hold, limit) {
  const H = CONFIG.hall;
  hallHoldTick(dt, hold);
  G.wcQueue = G.wcQueue.filter(k => k.state === 'wcq');
  if (!G.wcBusy && G.wcQueue.length) { const k = G.wcQueue.shift(); k.wcQueued = true; hallSendToWC(k); }
  if (G.exam) return;
  // Arbeitspakete füllen sich
  const othersDone = G.pkg.slice(0, 3).every(P => P.done);
  HALL_PKG.forEach((D, i) => {
    const P = G.pkg[i]; if (P.done || P.need) return;
    const ks = G.kids.filter(k => D.grps.includes(k.grp));
    const working = ks.filter(k => k.state === 'work' || k.state === 'fidget').length / ks.length;
    let rate = 100 / D.time * working * (teacherNear(i) ? H.order.presenceBoost : 1);
    if (D.id === 'mot' && G.motorLoud) rate *= 0.3;
    const cap = D.id === 'rad' && !othersDone ? H.order.prepCap : 100;
    const before = P.p; P.p = Math.min(cap, P.p + rate * dt);
    // Meilensteine: Teil (ca. 40 %) und Abnahme (100 %)
    if (before < H.order.matAt && P.p >= H.order.matAt) {
      const k = ks.find(k => k.state === 'work') || ks[0];
      P.need = 'mat'; P.p = H.order.matAt; k.state = 'mat'; k.t = 0; float(sx(k.x), sy(k.y) - 80, D.part + '?', PAL.yellow);
    } else if (P.p >= 100) {
      const k = ks.find(k => k.state === 'work') || ks[0];
      P.need = 'check'; k.state = 'check'; k.t = 0; float(sx(k.x), sy(k.y) - 80, 'FERTIG!', '#9fd39a');
    }
  });
  // offener Meilenstein, aber niemand hält ihn (z. B. aufs WC gegangen) → ein anderer aus dem Paket übernimmt
  HALL_PKG.forEach((D, i) => {
    const P = G.pkg[i]; if (!P.need) return;
    const ks = G.kids.filter(k => D.grps.includes(k.grp));
    if (ks.some(k => k.state === P.need || k.needsFix === P.need)) return;
    const k = ks.find(k => k.state === 'work'); if (k) { k.state = P.need; k.t = 0; }
  });
  // Wer bei einem Meilenstein zu lange wartet, wird unruhig (Meilenstein bleibt bestehen)
  for (const k of G.kids) {
    if (k.state === 'check' && (k.t += dt) >= H.check.patience) { makeIdle(k); k.needsFix = 'check'; }
    if (k.state === 'mat' && (k.t += dt) >= H.mat.patience) { makeIdle(k); k.needsFix = 'mat'; }
    if (k.state === 'climbSoon' && (k.t += dt) >= H.climb.warn) { k.state = 'climb'; k.t = 0; G.order = Math.max(0, G.order - H.climb.orderHit); G.loss.stoerer += H.climb.orderHit; G.laughT = 1.5; sfx.loud(); }
    if (k.state === 'wcq') k.t += dt;
  }
  // Auftrag fertig → Bonus, kurze Pause, neuer Auftrag
  if (G.pkg.every(P => P.done)) {
    if (!G.orderDoneT) {
      const b = H.order.bonus; G.learn += b; G.taler += H.order.taler; G.kids.forEach(k => { k.learn = (k.learn || 0) + b / 12; });
      float(sx(25.6), sy(9.4) - 90, 'AUFTRAG FERTIG! +' + b, PAL.yellow); puff(sx(25.6), sy(10.5) - 40, PAL.yellow, 20); sfx.done(); sfx.bell();
      G.orderDoneT = 3;
    } else if ((G.orderDoneT -= dt) <= 0) { hallNewOrder(); float(sx(11.6), sy(4.75) - 70, 'NEUER AUFTRAG', '#9fd3f0'); }
  }
  // Ölfleck an der Hydraulik: Paket steht still
  if (G.leakAt !== null && G.t >= G.leakAt) {
    G.leakAt = null; const g = Math.random() < 0.5 ? 0 : 1, sl = HALL_ST[g].slots;
    G.puddle = { grps: [g], x: (sl[0][0] + sl[1][0]) / 2, y: 2.75, t: 0, slipT: 0 };
    G.kids.forEach(k => { if (isSeated(k) && k.grp === g && k.state === 'work') k.state = 'leak'; });
    float(sx(G.puddle.x), sy(G.puddle.y) - 60, 'ÖL LÄUFT AUS!', PAL.orange); sfx.jam();
  }
  if (G.puddle && (G.puddle.t += dt) >= H.leak.slipAfter && (G.puddle.slipT -= dt) <= 0) {
    G.puddle.slipT = H.leak.slipEvery;
    G.order = Math.max(0, G.order - H.leak.orderHit); G.loss.stoerer += H.leak.orderHit;
    float(sx(G.puddle.x), sy(G.puddle.y) - 60, 'AUSGERUTSCHT!', PAL.red); sfx.wrong(); G.laughT = 1.2;
  }
  if (G.motorAt !== null && G.t >= G.motorAt) { G.motorAt = null; G.motorLoud = { m: Math.random() < 0.5 ? 0 : 1 }; sfx.buzz(); }
  if (G.climbAt !== null && G.t >= G.climbAt) {
    G.climbAt = null;
    const k = hallPick(limit + 1, k => k.grp === 3) || hallPick(limit + 1, k => k.grp === 2);
    if (k) { k.state = 'climbSoon'; k.t = 0; }
  }
}
const hallDrain = () => !isHall() ? 0 : (G.motorLoud ? CONFIG.hall.motor.drain : 0) + G.kids.filter(k => k.state === 'climb').length * CONFIG.hall.climb.drain + G.kids.filter(k => k.state === 'wcq').length * 0.3 + (G.puddle ? 0.2 : 0);
const hallSpawnMult = () => (G.motorLoud ? CONFIG.hall.motor.spawn : 1);

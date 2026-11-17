/* Raum-Vorschau (nur zum Ansehen): Klassenraum, Metallwerkstatt, Praxishalle, Automatisierungslabor.
   Nutzt die Zeichen-Helfer aus game.js / render.js. Gleicher Ursprung (OX/OY) wie im Spiel, größere Räume werden geschwenkt. */

const roomCv = document.createElement('canvas');
const mainCtx = ctx;
const origRender = render;
let roomIdx = 1, camX = 0, camY = 0, camAuto = true, camDir = 1;
const RKIDS = makeKids();

const ROOMS = [
  { name: 'KLASSENRAUM', sub: 'WOCHE 1', w: 20, h: 10, draw: null },
  { name: 'METALLWERKSTATT', sub: 'WOCHE 2', w: 20, h: 10, draw: () => drawWorkshop() },
  { name: 'PRAXISHALLE', sub: 'WOCHE 3', w: 30, h: 13, draw: () => drawHall() },
  { name: 'AUTOMATISIERUNGSLABOR', sub: 'WOCHE 4', w: 20, h: 10, draw: () => drawLab() },
];

/* ------------------------------------------------------- Grundgerüst */
function rmShell(w, h, o) {
  const FX = OX, FY = OY, FW = w * T, FH = h * T, wy = OY - WALL_H;
  R(0, 0, FX * 2 + FW, FY + FH + 40, COL.bg);
  R(FX, wy, FW, WALL_H, o.wall);
  if (o.wallLow) { R(FX, FY - 30, FW, 30, o.wallLow); R(FX, FY - 31, FW, 1, shade(o.wallLow, 0.2)); }
  if (o.stripe) R(FX, FY - 34, FW, 4, o.stripe);
  R(FX, FY - 4, FW, 4, o.base || COL.oakDD);
  o.floor(FX, FY, FW, FH);
  R(FX, FY, FW, 6, 'rgba(40,30,30,.18)'); R(FX, FY, 5, FH, 'rgba(40,30,30,.12)');
  const sd = o.side || '#3c3a40', sl = shade(sd, 0.15);
  R(FX - 16, wy, 16, FH + WALL_H + 40, sd); R(FX - 4, wy, 4, FH + WALL_H, sl);
  R(FX + FW, wy, 16, FH + WALL_H + 40, sd); R(FX + FW, wy, 4, FH + WALL_H, sl);
  R(FX - 16, FY + FH, FW + 32, 40, sd); R(FX - 16, FY + FH, FW + 32, 3, sl);
  return { FX, FY, FW, FH, wy };
}
function rmDoor(x, h) {                        // Tür in der Vorderwand
  const X = sx(x), Y = OY + h * T;
  R(X - 4, Y - 1, 72, 17, COL.oakDD); R(X, Y + 1, 64, 15, COL.oak); R(X, Y + 1, 64, 1, COL.oakL);
  for (let i = 0; i < 4; i++) R(X + 4 + i * 15, Y + 3, 1, 12, COL.oakD);
  R(X + 52, Y + 6, 6, 3, '#d9b25a');
}
function rmClock(x, y) {
  disc(x, y, 12, '#3a3d46'); disc(x, y, 10, '#f4f4f0');
  const a = clockT * 0.2, a2 = a / 12 - 1;
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a2) * 5, y + Math.sin(a2) * 5); ctx.stroke();
  ctx.strokeStyle = PAL.red; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); ctx.stroke();
}
function rmSign(x, y, kind) {                  // Sicherheitszeichen
  if (kind === 'goggles') { disc(x, y, 9, '#2f6db5'); R(x - 6, y - 2, 5, 4, COL.white); R(x + 1, y - 2, 5, 4, COL.white); R(x - 1, y - 1, 2, 1, COL.white); }
  if (kind === 'ear') { disc(x, y, 9, '#2f6db5'); R(x - 6, y - 3, 3, 7, COL.white); R(x + 3, y - 3, 3, 7, COL.white); R(x - 5, y - 6, 10, 2, COL.white); }
  if (kind === 'warn') { for (let i = 0; i < 9; i++) R(x - i, y - 8 + i * 2, i * 2 + 1, 2, COL.ink); for (let i = 1; i < 8; i++) R(x - i + 1, y - 5 + i * 2, i * 2 - 1, 2, PAL.yellow); R(x, y - 3, 1, 5, COL.ink); px(x, y + 4, COL.ink); }
  if (kind === 'exit') { R(x - 10, y - 6, 20, 12, '#2f9a5a'); R(x - 7, y - 3, 3, 6, COL.white); R(x - 3, y - 1, 7, 2, COL.white); R(x + 2, y - 3, 2, 6, COL.white); }
}
function rmEstop(x, y) { R(x - 6, y - 6, 12, 12, PAL.yellow); R(x - 6, y - 6, 12, 1, '#fff2a0'); disc(x, y, 4, '#d94a3a'); px(x - 1, y - 2, '#ff9a8a'); }
function rmKid(i, x, y, face, opt = {}) {      // stehender Azubi
  const k = RKIDS[i % 12];
  k.wx = x; k.wy = y; k.face = face; k.walk = opt.walk || 0; k.job = null;
  drawWalker(k);
  if (opt.goggles && face !== 'up') { const X = sx(x) - 8, Y = sy(y) - 46; R(X + 2, Y + 7, 14, 4, 'rgba(160,220,255,.7)'); R(X + 1, Y + 7, 16, 1, '#3a3d46'); }
  if (opt.goggles && face === 'up') { const X = sx(x) - 8, Y = sy(y) - 46; R(X, Y + 7, 16, 2, '#3a3d46'); }
}
function rmSeated(i, x, y) {                   // sitzender Azubi (Rücken)
  const k = RKIDS[i % 12];
  k.x = x; k.y = y; k.state = 'work'; k.annoyed = 0;
  drawKid(k);
}
function rmTeacher(x, y, face = 'down', o = {}) { const T0 = TEACHERS[2]; drawTeacherFigure(T0, sx(x), sy(y), { face, shoe: T0.shoe, shoeStripe: true, ...o }); }
function rmLabel() {
  const r = ROOMS[roomIdx];
  rr(8, 8, r.name.length * 8 + 20, 36, 'rgba(38,35,46,.82)', 3);
  ltext(r.sub, 18, 14, PAL.yellow, 1);
  ltext(r.name, 18, 24, COL.white, 2);
}

/* ===================================================== Metallwerkstatt */
function wsFloor(FX, FY, FW, FH) {
  R(FX, FY, FW, FH, '#7e9488');
  seed = 11;
  for (let i = 0; i < 900; i++) px(FX + srnd() * FW, FY + srnd() * FH, srnd() < 0.5 ? '#879d91' : '#738a7e');
  for (let x = 0; x < FW; x += 4 * T) R(FX + x, FY, 1, FH, '#6f857a');                     // Fugen
  for (let y = 0; y < FH; y += 4 * T) R(FX, FY + y, FW, 1, '#6f857a');
  // Maschinenbereich gelb abgegrenzt
  const mx = sx(10.3), my = sy(1.5), mw = sx(19.8) - mx, mh = sy(8.2) - my;
  R(mx, my, mw, 2, '#d9c24a'); R(mx, my + mh, mw, 2, '#d9c24a'); R(mx, my, 2, mh, '#d9c24a');
  // Späne vor den Maschinen
  for (const [x, y] of [[15.4, 3.8], [16.4, 4.0], [15.2, 7.2], [16.6, 7.4], [11.4, 4.2], [12.6, 7.6]]) for (let i = 0; i < 8; i++) R(sx(x) + srnd() * 26, sy(y) + srnd() * 10, 2, 1, srnd() < 0.5 ? '#c9ccd1' : '#d9a85a');
  // Ölfleck
  ctx.fillStyle = 'rgba(40,40,40,.18)'; ctx.beginPath(); ctx.ellipse(sx(17.4), sy(4.1), 14, 5, 0, 0, 7); ctx.fill();
}
function wsWall(wy) {
  // Fliesenspiegel unten, Wand oben
  const FX = OX, FW = 20 * T;
  for (let x = 0; x < FW; x += 12) for (let y = 0; y < 30; y += 10) R(FX + x, OY - 34 + y, 11, 9, (x / 12 + y / 10) % 2 ? '#dde3df' : '#d3dad5');
  // Stahlfenster
  for (const x0 of [0.6, 15.2]) {
    const X = sx(x0), Y = wy + 8;
    R(X - 2, Y - 2, 4 * T + 4, 40, '#4a4f58');
    for (let c = 0; c < 4; c++) for (let r = 0; r < 2; r++) { R(X + c * T + 1, Y + r * 18, T - 2, 16, '#a9d0e8'); R(X + c * T + 2, Y + r * 18 + 1, 6, 2, '#d8eefa'); }
  }
  // Whiteboard mit technischer Zeichnung
  const bx = sx(6.6), by = wy + 6;
  R(bx - 3, by - 3, 6 * T + 6, 52, '#9aa2ab'); R(bx, by, 6 * T, 46, '#f8f8f4');
  ltext('DREHEN', bx + 6, by + 5, '#2f6db5', 2);
  R(bx + 6, by + 18, 60, 14, 'rgba(47,109,181,0)'); ctx.strokeStyle = '#2f6db5'; ctx.lineWidth = 1;
  ctx.strokeRect(bx + 8.5, by + 22.5, 44, 14); ctx.strokeRect(bx + 52.5, by + 25.5, 30, 8); ctx.strokeRect(bx + 82.5, by + 27.5, 16, 4);
  R(bx + 4, by + 29, 100, 1, '#d94a3a');
  ltext('VC=200', bx + 112, by + 8, '#26232e', 1); ltext('F=0.2', bx + 112, by + 18, '#26232e', 1); ltext('AP=1', bx + 112, by + 28, '#26232e', 1);
  R(bx + 60, by + 46, 20, 3, '#9aa2ab'); R(bx + 64, by + 44, 4, 2, PAL.red); R(bx + 70, by + 44, 4, 2, '#2f6db5');
  // Werkzeugwand (Lochblech)
  const tx = sx(12.9), ty = wy + 8;
  R(tx - 2, ty - 2, 2 * T + 4, 44, '#6b717c'); R(tx, ty, 2 * T, 40, '#c9ccc4');
  for (let x = 3; x < 2 * T; x += 5) for (let y = 3; y < 40; y += 5) px(tx + x, ty + y, '#9aa09a');
  R(tx + 4, ty + 4, 3, 16, '#7a5a3a'); R(tx + 1, ty + 4, 9, 5, '#4a4f58');                     // Hammer
  R(tx + 14, ty + 4, 2, 20, '#9aa2ab'); R(tx + 12, ty + 4, 6, 3, '#9aa2ab');                    // Schlüssel
  R(tx + 22, ty + 6, 2, 18, '#555c68'); R(tx + 21, ty + 22, 4, 6, '#c0503a');                   // Feile
  R(tx + 30, ty + 6, 2, 18, '#555c68'); R(tx + 29, ty + 22, 4, 6, '#2f6db5');
  R(tx + 40, ty + 4, 14, 3, '#c9ccd1'); R(tx + 40, ty + 7, 2, 10, '#c9ccd1');                   // Winkel
  R(tx + 44, ty + 24, 14, 12, '#d94a3a'); R(tx + 46, ty + 26, 10, 3, '#f2c14e');               // Messschieber-Box
  // Schilder, Not-Aus, Uhr
  rmSign(sx(5.6), wy + 20, 'goggles'); rmSign(sx(5.6), wy + 44, 'ear');
  rmClock(sx(19.3) - 6, wy + 22);
  rmEstop(sx(12.5), wy + 60);
  // Absaugrohr unter der Decke
  R(OX, wy + 2, 20 * T, 5, '#9aa2ab'); R(OX, wy + 2, 20 * T, 1, '#c9ccd1');
  for (const x of [14.8, 17.3]) { R(sx(x), wy + 7, 5, 18, '#9aa2ab'); }
}
function drawLathe(x, y, spin) {               // Drehmaschine (Bett von links nach rechts)
  const body = '#5f8579', bodyD = '#4a6b61', bodyL = '#7aa093';
  softShadow(sx(x) + 2.2 * T, sy(y + 1.1), 2.4 * T, 6);
  const bed = box(x, y + 0.2, 4.4, 0.9, 26, bodyL, body, bodyD);
  R(bed.X + 4, bed.front + 6, bed.W - 8, 10, '#3a4440');                                 // Spänewanne
  R(bed.X + 4, bed.front + 6, bed.W - 8, 2, '#2a3230');
  const hs = box(x, y, 1.3, 1.1, 50, bodyL, body, bodyD);                                 // Spindelkasten
  R(hs.X + 6, hs.front + 6, 18, 12, '#2b3a33'); R(hs.X + 8, hs.front + 8, 8, 2, '#7cc47a'); R(hs.X + 8, hs.front + 12, 12, 1, '#7cc47a');
  disc(hs.X + 32, hs.front + 12, 4, '#d94a3a'); R(hs.X + 28, hs.front + 17, 8, 3, PAL.yellow);   // Not-Aus
  // Futter (dreht sich)
  const cx = hs.X + hs.W + 4, cy = hs.Y + hs.D + 8;
  R(cx - 4, cy - 12, 8, 24, '#9aa2ab'); R(cx - 4, cy - 12, 8, 2, '#c9ccd1');
  for (let i = 0; i < 3; i++) { const yy = cy - 10 + ((i * 8 + (spin ? clockT * 40 : 0)) % 24); R(cx - 6, yy, 3, 3, '#6b717c'); }
  R(cx + 4, cy - 2, 22, 4, '#c9ccd1');                                                     // Werkstück
  // Reitstock
  const ts = box(x + 3.6, y + 0.25, 0.7, 0.8, 34, bodyL, body, bodyD);
  R(ts.X - 8, ts.Y + ts.D + 6, 10, 3, '#9aa2ab');
  disc(ts.X + ts.W - 4, ts.front + 8, 4, '#c9ccd1');
  // Support mit Handrädern
  const sp = sx(x + 1.9), spy = bed.Y + 6;
  R(sp, spy - 6, 26, 18, bodyD); R(sp, spy - 6, 26, 2, bodyL); R(sp + 8, spy - 12, 10, 8, '#555c68'); R(sp + 12, spy - 14, 2, 4, '#c9ccd1');
  for (const [hx, hy] of [[sp + 4, bed.front + 4], [sp + 22, bed.front + 4]]) { disc(hx, hy, 5, '#9aa2ab'); disc(hx, hy, 2, '#555c68'); R(hx + 4, hy - 1, 4, 2, '#26232e'); }
  // Maschinenlampe
  R(hs.X + 4, hs.Y - 24, 2, 24, '#26232e'); R(hs.X + 4, hs.Y - 26, 14, 3, '#26232e'); rr(hs.X + 14, hs.Y - 28, 10, 7, PAL.yellow, 2);
  if (spin && blink(10)) px(cx + 26, cy, COL.white);
}
function drawMill(x, y, run) {                 // Fräsmaschine
  const c = '#5f8579', cD = '#4a6b61', cL = '#7aa093';
  softShadow(sx(x) + T, sy(y + 1.3), T + 10, 6);
  const base = box(x, y + 0.2, 2, 1.1, 22, cL, c, cD);
  const col = box(x + 0.6, y - 0.2, 0.9, 0.6, 76, cL, c, cD);                              // Ständer
  R(col.X + 4, col.front + 4, 12, 30, cD);
  const head = box(x + 0.35, y + 0.2, 1.3, 0.5, 18, cL, c, cD);                            // Fräskopf
  const hy = col.Y + 18;
  R(head.X, hy, head.W, 22, c); R(head.X, hy, head.W, 2, cL);
  R(head.X + head.W / 2 - 3, hy + 22, 6, 10 + (run ? Math.round(Math.sin(clockT * 2) * 2) : 0), '#c9ccd1');
  if (run) for (let i = 0; i < 2; i++) px(head.X + head.W / 2 - 2 + i * 3, hy + 33, blink(14, i) ? COL.white : '#9aa2ab');
  // Tisch mit Schraubstock
  R(base.X - 6, base.Y + 4, base.W + 12, 8, '#9aa2ab'); R(base.X - 6, base.Y + 4, base.W + 12, 2, '#c9ccd1');
  R(base.X + 18, base.Y - 4, 22, 8, '#3d5f8a'); R(base.X + 18, base.Y - 4, 22, 2, '#5a7fb0');
  disc(base.X - 8, base.Y + 8, 5, '#9aa2ab'); disc(base.X - 8, base.Y + 8, 2, '#555c68');
  disc(base.X + base.W + 8, base.Y + 8, 5, '#9aa2ab'); disc(base.X + base.W + 8, base.Y + 8, 2, '#555c68');
  R(base.X + 6, base.front + 6, 16, 10, '#2b3a33'); R(base.X + 8, base.front + 8, 10, 2, '#7cc47a');
  disc(base.X + base.W - 10, base.front + 10, 4, '#d94a3a');
}
function drawDrill(x, y) {                     // Standbohrmaschine
  const c = '#5f8579', cL = '#7aa093', cD = '#4a6b61';
  softShadow(sx(x) + 16, sy(y + 0.9), 20, 5);
  const X = sx(x), Y = sy(y);
  R(X - 2, Y + 14, 36, 12, cD); R(X - 2, Y + 14, 36, 3, cL);                              // Fuß
  R(X + 14, Y - 70, 6, 86, '#c9ccd1'); R(X + 14, Y - 70, 2, 86, '#e6e8ec');                // Säule
  R(X + 4, Y - 18, 26, 6, '#9aa2ab'); R(X + 4, Y - 18, 26, 2, '#c9ccd1');                  // Bohrtisch
  rr(X + 2, Y - 84, 32, 24, c, 3); R(X + 2, Y - 84, 32, 3, cL); R(X + 22, Y - 92, 12, 10, cD);   // Kopf + Motor
  R(X + 16, Y - 60, 4, 14, '#c9ccd1'); R(X + 17, Y - 46, 2, 6, '#9aa2ab');                 // Pinole + Bohrer
  for (let i = 0; i < 3; i++) { const a = clockT * 0.5 + i * 2.09; R(X + 34 + Math.cos(a) * 4, Y - 70 + Math.sin(a) * 6, 10, 2, '#26232e'); }   // Hebel
  rmEstop(X + 8, Y - 72);
}
function drawBench(x, y, w, vices) {           // Werkbank mit Schraubstöcken
  softShadow(sx(x) + w * T / 2, sy(y + 1.0), w * T / 2 + 4, 5);
  const b = box(x, y, w, 0.85, 22, '#d9b27a', '#5a6470', '#454d57');
  R(b.X, b.Y, b.W, 2, '#ecc890');
  for (let i = 0; i < w * 2; i++) R(b.X + 6 + i * 16, b.Y + 6 + (i * 7) % 14, 10, 1, '#c99f68');
  for (let i = 0; i < Math.floor(w); i++) { R(b.X + 6 + i * T, b.front + 5, T - 10, 12, '#6b7580'); R(b.X + 12 + i * T, b.front + 9, 10, 2, '#c9ccd1'); }
  vices.forEach((vx, i) => {
    const X = sx(vx) - 9, Y = b.Y + b.D - 14;
    R(X, Y, 18, 10, '#3d5f8a'); R(X, Y, 18, 2, '#5a7fb0'); R(X + 6, Y - 6, 6, 6, '#3d5f8a');
    R(X - 4, Y + 4, 26, 2, '#c9ccd1');                                                     // Spindel/Knebel
    R(X + 4, Y - 4, 10, 3, i % 2 ? '#c9ccd1' : '#d9a85a');                                 // Werkstück
    if (i % 2) { R(X + 24, Y - 2, 14, 2, '#555c68'); R(X + 36, Y - 3, 5, 4, '#c0503a'); }   // Feile liegt da
  });
}
function drawToolCabinet(x, y) {               // roter Werkzeugschrank
  const b = box(x, y, 1.6, 0.7, 54, '#e06a52', '#c0503a', '#8a3a2a');
  for (let i = 0; i < 5; i++) { R(b.X + 3, b.front + 3 + i * 10, b.W - 6, 8, i % 2 ? '#c85a44' : '#b84a36'); R(b.X + b.W / 2 - 8, b.front + 6 + i * 10, 16, 2, '#c9ccd1'); }
  R(b.X + 6, b.Y + 4, 20, 4, '#555c68'); R(b.X + 30, b.Y + 3, 12, 6, '#f2c14e');
}
function drawIssue(x, y) {                     // Werkzeugausgabe mit Gitter (statt Kopierer)
  const b = box(x, y, 2.2, 0.9, 30, '#b9b2a2', '#8a8476', '#6b665b');
  const X = b.X, top = b.Y - 46;
  R(X, top, b.W, 46, 'rgba(70,74,82,.18)');
  for (let i = 0; i <= b.W; i += 6) R(X + i, top, 1, 46, '#555c68');
  for (let j = 0; j <= 46; j += 6) R(X, top + j, b.W, 1, '#555c68');
  R(X, top, b.W, 3, '#3a3d46');
  R(X + 10, b.Y + 6, 18, 6, '#c9ccd1'); R(X + 34, b.Y + 4, 12, 10, '#d94a3a'); R(X + 52, b.Y + 6, 10, 4, '#555c68');
  ltext('AUSGABE', X + 8, b.front + 10, '#26232e', 1);
}
function drawWorkshop() {
  const S = rmShell(20, 10, { wall: '#ece6d6', wallLow: null, base: '#5a6470', side: '#3c3f46', floor: wsFloor });
  wsWall(S.wy);
  // Meisterpult links oben
  const list = [];
  list.push({ y: 1.3, f: () => {
    const b = box(1.4, 0.2, 3, 1.1, 20, '#9aa2ab', '#6b717c', '#555c68');
    R(b.X, b.Y, b.W, 2, '#c9ccd1');
    R(b.X + 8, b.Y - 14, 30, 18, '#3a3d46'); R(b.X + 10, b.Y - 12, 26, 14, '#69b2ee');
    R(b.X + 50, b.Y + 6, 24, 16, COL.white); R(b.X + 52, b.Y + 9, 18, 1, '#9ab'); R(b.X + 52, b.Y + 13, 14, 1, '#9ab');
    R(b.X + 80, b.Y + 4, 8, 8, COL.white); R(b.X + 81, b.Y + 4, 6, 2, '#6b4a32');
  } });
  list.push({ y: 4.6, f: () => drawToolCabinet(0.3, 3.9) });
  list.push({ y: 2.9, f: () => drawLathe(14.9, 1.9, true) });
  list.push({ y: 6.4, f: () => drawLathe(14.9, 5.4, false) });
  list.push({ y: 3.6, f: () => drawMill(10.8, 2.3, true) });
  list.push({ y: 7.6, f: () => drawDrill(12.4, 7.0) });
  list.push({ y: 3.25, f: () => drawBench(4.4, 2.4, 5.8, [5.4, 7.3, 9.2]) });
  list.push({ y: 5.85, f: () => drawBench(4.4, 5.0, 5.8, [5.4, 7.3, 9.2]) });
  list.push({ y: 8.45, f: () => drawBench(4.4, 7.6, 5.8, [6.3, 8.3]) });
  list.push({ y: 9.8, f: () => drawIssue(0.2, 8.8) });
  list.push({ y: 9.9, f: () => { const X = sx(19.4), Y = sy(9.6); R(X, Y - 22, 10, 22, '#d94a3a'); R(X + 2, Y - 26, 6, 4, '#26232e'); } });   // Feuerlöscher
  list.push({ y: 9.5, f: () => { const X = sx(3.2), Y = sy(9.4); R(X, Y - 26, 3, 26, '#c9a43e'); R(X - 6, Y - 4, 16, 4, '#555c68'); for (let i = 0; i < 6; i++) R(X - 5 + i * 3, Y, 2, 4, '#7a5a3a'); } });   // Besen
  // Azubis
  [5.4, 7.3, 9.2].forEach((x, i) => list.push({ y: 4.0, f: () => rmKid(i, x, 4.0, 'up', { goggles: true }) }));
  [5.4, 7.3, 9.2].forEach((x, i) => list.push({ y: 6.6, f: () => rmKid(3 + i, x, 6.6, 'up', { goggles: true }) }));
  [6.3, 8.3].forEach((x, i) => list.push({ y: 9.2, f: () => rmKid(6 + i, x, 9.2, 'up', { goggles: true }) }));
  list.push({ y: 3.9, f: () => rmKid(8, 16.3, 3.9, 'up', { goggles: true }) });
  list.push({ y: 7.4, f: () => rmKid(9, 16.3, 7.4, 'up', { goggles: true }) });
  list.push({ y: 4.5, f: () => rmKid(10, 11.8, 4.5, 'up', { goggles: true }) });
  list.push({ y: 7.7, f: () => rmKid(11, 11.7, 7.7, 'right', { goggles: true }) });
  list.push({ y: 1.95, f: () => rmTeacher(9.4, 1.95) });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  rmDoor(16.6, 10);
  // Licht: kühles Hallenlicht + Sonnenflecken durch die Fenster
  ctx.fillStyle = 'rgba(255,240,200,.07)'; ctx.fillRect(OX, OY, 20 * T, 10 * T);
  for (const x0 of [0.6, 15.2]) { ctx.fillStyle = 'rgba(255,236,180,.10)'; ctx.beginPath(); ctx.moveTo(sx(x0), OY); ctx.lineTo(sx(x0 + 4), OY); ctx.lineTo(sx(x0 + 2.5), OY + 7 * T); ctx.lineTo(sx(x0 - 1.5), OY + 7 * T); ctx.fill(); }
}

/* ========================================================= Praxishalle */
// Grob nach der Vorlagenhalle: Sektionaltor hinten, Bürocontainer rechts dahinter mit Radlader davor,
// Motorprüfstände rechts, PC-Plätze und E-Pneumatik-Tafeln links, mobile Tafel in der Mitte.
function hallFloor(FX, FY, FW, FH) {
  R(FX, FY, FW, FH, '#b9bbb8');
  seed = 23;
  for (let i = 0; i < 2600; i++) px(FX + srnd() * FW, FY + srnd() * FH, srnd() < 0.5 ? '#c1c3c0' : '#b0b2af');
  for (let x = 0; x < FW; x += 6 * T) R(FX + x, FY, 1, FH, '#a4a6a3');
  for (let y = 0; y < FH; y += 6 * T) R(FX, FY + y, FW, 1, '#a4a6a3');
  // Glanz vom Oberlicht
  for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(FX + 40 + i * 190, FY + 30, 70, FH - 60); }
  // Ölflecken, Reifenspuren
  for (const [x, y, r] of [[17.5, 7.2, 20], [24.5, 10.2, 12], [9.5, 11.6, 9]]) { ctx.fillStyle = 'rgba(40,40,45,.12)'; ctx.beginPath(); ctx.ellipse(sx(x), sy(y), r, r * 0.35, 0, 0, 7); ctx.fill(); }
  for (let i = 0; i < 40; i++) { R(sx(19.6) + i * 3, sy(4.4) + Math.sin(i * 0.3) * 4, 2, 2, 'rgba(60,60,60,.10)'); }
}
function hallWall(wy) {
  const FX = OX, FW = 30 * T;
  // Sandwichpaneele
  R(FX, wy, FW, WALL_H, '#e2e5e8');
  for (let x = 0; x < FW; x += 6) { R(FX + x, wy, 1, WALL_H, '#d2d6da'); R(FX + x + 1, wy, 1, WALL_H, '#eef0f2'); }
  // Stahlstützen, Riegel, Kreuzverband
  R(FX, wy + 44, FW, 4, '#7a838e'); R(FX, wy + 44, FW, 1, '#9aa2ab');
  for (const x of [0, 7.5, 15, 22.5, 30]) R(sx(x) - 5, wy, 10, WALL_H, '#6b7480');
  ctx.strokeStyle = '#8a929c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx(15) + 5, wy + 4); ctx.lineTo(sx(22.5) - 5, wy + 44); ctx.moveTo(sx(22.5) - 5, wy + 4); ctx.lineTo(sx(15) + 5, wy + 44); ctx.stroke();
  // Absaugrohr (Wickelfalzrohr) mit blauem Lüfter
  R(FX, wy + 6, 14 * T, 9, '#b9c0c7'); R(FX, wy + 6, 14 * T, 2, '#dfe3e7');
  for (let x = 0; x < 14 * T; x += 18) R(FX + x, wy + 6, 2, 9, '#9aa2ab');
  R(sx(14) - 2, wy + 6, 9, 30, '#b9c0c7'); disc(sx(3.2), wy + 22, 10, '#2f6db5'); disc(sx(3.2), wy + 22, 5, '#5a8fd6'); R(sx(3.2) - 2, wy + 14, 4, 16, '#1f4f8f');
  // Banner (gelb, ohne Logo) mit Radlader-Silhouette
  const bx = sx(7.9);
  R(bx, wy + 10, 18, 66, '#f2c22e'); R(bx, wy + 10, 18, 14, '#26232e');
  R(bx + 3, wy + 50, 12, 6, '#26232e'); R(bx + 2, wy + 56, 4, 4, '#26232e'); R(bx + 11, wy + 56, 4, 4, '#26232e'); R(bx + 8, wy + 44, 5, 6, '#26232e');
  // Fotos von Baumaschinen auf der Leiste
  for (let i = 0; i < 3; i++) { const px0 = sx(1.0) + i * 30; R(px0, wy + 26, 26, 16, '#f4f4f0'); R(px0 + 2, wy + 28, 22, 12, '#8fbfe0'); R(px0 + 6, wy + 34, 10, 5, '#f2c22e'); R(px0 + 2, wy + 39, 22, 1, '#b08a5a'); }
  // Notausgang-Tür + Schilder
  const dx = sx(9.2);
  R(dx - 3, wy + 22, 40, WALL_H - 22, '#d6d9dc'); R(dx, wy + 26, 34, WALL_H - 26, '#eceeef'); R(dx + 26, wy + 52, 6, 2, '#9aa2ab');
  rmSign(dx + 17, wy + 15, 'exit');
  R(dx + 44, wy + 30, 10, 14, '#d94a3a'); R(dx + 46, wy + 33, 6, 8, COL.white);
  // Sektionaltor mit Fensterreihe
  const rx = sx(18.4), rw = 4.6 * T;
  R(rx - 6, wy + 14, rw + 12, WALL_H - 14, '#7a838e');
  for (let j = 0; j < 8; j++) { R(rx, wy + 18 + j * 8, rw, 7, '#dfe2e5'); R(rx, wy + 18 + j * 8, rw, 1, '#f2f4f6'); }
  for (let c = 0; c < 6; c++) { R(rx + 4 + c * 24, wy + 50, 20, 7, '#a9d0e8'); R(rx + 5 + c * 24, wy + 51, 5, 2, '#d8eefa'); }
  R(rx + rw - 16, wy + 60, 6, 6, '#3a3d46');
  // runde Uhr
  rmClock(sx(16.4), wy + 28);
}
function drawContainer(x, y) {                 // Bürocontainer mit Leiter und Heizgerät
  const b = box(x, y, 5.6, 2.2, 74, '#d6d9dc', '#f2f2ee', '#c9ccd1');
  for (let i = 0; i < 4; i++) R(b.X + 2 + i * (b.W / 4), b.front, 1, 74, '#d6d9dc');
  R(b.X + 18, b.front + 18, 30, 56, '#e6e8e6'); R(b.X + 42, b.front + 46, 4, 2, '#9aa2ab');        // Tür
  R(b.X + 80, b.front + 14, 50, 26, '#3a3d46'); R(b.X + 82, b.front + 16, 46, 22, '#a9d0e8'); R(b.X + 84, b.front + 18, 10, 4, '#d8eefa');
  rmSign(b.X + 150, b.front + 22, 'exit');
  R(b.X + 18, b.front + 6, 30, 9, '#2f6db5'); ltext('BÜRO'.replace('Ü', 'UE'), b.X + 21, b.front + 8, COL.white, 1);
  // auf dem Dach: Heizgerät, Kisten, Leiter
  R(b.X + 20, b.Y - 4, 40, 26, '#9aa2ab'); R(b.X + 20, b.Y - 4, 40, 3, '#c9ccd1'); disc(b.X + 36, b.Y + 9, 8, '#3a3d46'); disc(b.X + 36, b.Y + 9, 3, '#6b7280');
  R(b.X + 90, b.Y + 4, 22, 14, '#c08a5a'); R(b.X + 116, b.Y + 8, 16, 10, '#c08a5a'); R(b.X + 140, b.Y + 2, 6, 20, '#3a3d46');
  for (let i = 0; i < 6; i++) R(b.X + b.W - 18, b.front - 30 + i * 14, 14, 2, '#c9ccd1');
  R(b.X + b.W - 18, b.front - 34, 2, 90, '#c9ccd1'); R(b.X + b.W - 6, b.front - 34, 2, 90, '#c9ccd1');
}
function drawLoader2(x, y) {                   // moderner kompakter Radlader, Schaufel links
  const X = sx(x), Y = sy(y), Yl = '#f2b81e', YD = '#c99212', YL = '#ffd65a';
  softShadow(X + 80, Y + 4, 104, 10, 0.3);
  // Schaufel + Schnellwechsler
  R(X - 4, Y - 30, 36, 30, '#555c68'); R(X - 4, Y - 30, 36, 3, '#7d8590'); R(X - 8, Y - 3, 42, 4, '#3a3d46');
  R(X + 30, Y - 34, 8, 30, Yl);
  // Hubarm (Z-Kinematik)
  R(X + 36, Y - 44, 46, 8, Yl); R(X + 36, Y - 44, 46, 2, YL); R(X + 60, Y - 60, 8, 20, YD); R(X + 42, Y - 30, 30, 4, '#c9ccd1');
  // Rahmen vorne/hinten
  rr(X + 56, Y - 46, 52, 26, Yl, 3); R(X + 56, Y - 46, 52, 2, YL);
  rr(X + 108, Y - 52, 74, 32, Yl, 4); R(X + 108, Y - 52, 74, 2, YL); for (let i = 0; i < 5; i++) R(X + 160 + i * 4, Y - 46, 2, 18, YD);
  R(X + 176, Y - 66, 5, 16, '#26232e');                                                         // Auspuff
  // Kabine: schwarzer Rahmen, viel Glas
  R(X + 100, Y - 104, 54, 54, '#26232e'); R(X + 104, Y - 100, 22, 46, '#7fb6d6'); R(X + 129, Y - 100, 21, 46, '#7fb6d6');
  R(X + 106, Y - 98, 6, 24, '#c8e4f4'); R(X + 98, Y - 108, 58, 6, '#26232e'); R(X + 116, Y - 82, 10, 8, '#3a3d46');
  disc(X + 146, Y - 112, 3, blink(2) ? '#f29a4e' : '#a85a2a');
  R(X + 154, Y - 92, 3, 10, '#26232e'); R(X + 156, Y - 92, 6, 6, '#26232e');                   // Spiegel
  // Räder mit gelben Felgen
  for (const wx of [X + 76, X + 160]) {
    rr(wx - 24, Y - 42, 48, 46, '#26232e', 8); for (let i = 0; i < 7; i++) R(wx - 22 + i * 7, Y - 42, 4, 3, '#3a3d46');
    disc(wx, Y - 19, 12, Yl); disc(wx, Y - 19, 8, YD); disc(wx, Y - 19, 3, '#3a3d46');
  }
}
function drawTestStand(x, y, c) {              // Motorprüfstand: gelber Diesel auf fahrbarem Gestell + Schalttafel
  const X = sx(x), Y = sy(y);
  softShadow(X + 36, Y + 2, 46, 5);
  R(X - 2, Y - 8, 84, 6, '#3a3d46'); R(X, Y - 2, 6, 4, '#26232e'); R(X + 74, Y - 2, 6, 4, '#26232e');       // Gestell
  R(X + 58, Y - 64, 26, 56, '#3a3d46');                                                                      // Kühler hinten
  for (let i = 0; i < 7; i++) R(X + 60, Y - 60 + i * 7, 22, 2, '#555c68');
  R(X + 62, Y - 96, 30, 30, '#f4f4f0'); R(X + 62, Y - 96, 30, 2, '#ffffff');                                 // Schalttafel
  for (let i = 0; i < 4; i++) { disc(X + 68 + (i % 2) * 14, Y - 88 + Math.floor(i / 2) * 12, 4, '#26232e'); px(X + 68 + (i % 2) * 14, Y - 90 + Math.floor(i / 2) * 12, PAL.red); }
  for (let i = 0; i < 4; i++) px(X + 64 + i * 7, Y - 70, blink(1.2 + i * 0.4, x) ? '#f29a4e' : '#7a3a1a');
  rr(X + 6, Y - 46, 52, 38, c, 3); R(X + 6, Y - 46, 52, 3, shade(c, 0.3));                                   // Block
  rr(X + 10, Y - 58, 40, 14, '#c9ccd1', 3); R(X + 12, Y - 56, 36, 2, '#eef0f2');                              // Ventildeckel
  disc(X + 6, Y - 26, 8, '#3a3d46'); disc(X + 6, Y - 26, 3, '#9aa2ab');                                       // Schwungrad
  R(X + 30, Y - 70, 6, 14, shade(c, -0.15)); R(X + 30, Y - 72, 22, 5, shade(c, -0.15));                       // Ansaugrohr
  R(X + 16, Y - 30, 26, 4, '#26232e'); R(X + 44, Y - 38, 10, 10, '#3a3d46');                                  // Kabel/Turbo
  rmEstop(X + 86, Y - 60);
}
function drawEngineRack(x, y) {                // Sperrholzwand mit Motoren auf blauen Gestellen
  const X = sx(x), Y = sy(y);
  R(X + 40, Y - 70, 120, 64, '#b08a5a'); R(X + 40, Y - 70, 120, 2, '#c8a272'); for (let i = 0; i < 6; i++) R(X + 46 + i * 20, Y - 60 + (i * 7) % 30, 12, 1, '#9c784a');
  R(X, Y - 30, 70, 6, '#2f4fb5'); R(X + 4, Y - 24, 4, 24, '#2f4fb5'); R(X + 62, Y - 24, 4, 24, '#2f4fb5');
  rr(X + 8, Y - 62, 52, 32, '#e8b830', 3); R(X + 12, Y - 66, 40, 6, '#c9ccd1'); for (let i = 0; i < 4; i++) disc(X + 16 + i * 11, Y - 46, 3, '#9a7a20');
  for (let k = 0; k < 3; k++) { const ex = X + 76 + k * 30; R(ex, Y - 8, 26, 8, '#555c68'); rr(ex, Y - 36, 26, 28, '#e8b830', 3); disc(ex + 13, Y - 20, 6, '#8a5a3a'); }
  // zerlegter Rasentraktor: grüne Haube, gelber Sitz
  rr(X + 4, Y - 14, 44, 14, '#3f9a4a', 4); R(X + 8, Y - 14, 36, 3, '#62b06a');
  rr(X - 26, Y - 26, 22, 20, '#f2c14e', 4); R(X - 22, Y - 6, 3, 6, '#3a3d46');
}
function drawSmartboard(x, y) {
  const X = sx(x), Y = sy(y);
  softShadow(X + 50, Y, 46, 3);
  R(X + 40, Y - 30, 6, 30, '#3a3d46'); R(X + 54, Y - 30, 6, 30, '#3a3d46'); R(X + 30, Y - 2, 40, 3, '#3a3d46');
  R(X, Y - 86, 100, 58, '#f4f4f0'); R(X + 4, Y - 82, 92, 46, '#1c2028'); R(X + 8, Y - 78, 30, 3, '#3a4a5a');
  R(X + 4, Y - 34, 92, 4, '#e2e4e6'); for (let i = 0; i < 4; i++) R(X + 30 + i * 10, Y - 33, 6, 2, ['#3a8a5a', '#3a3d46', '#2f6db5', '#d94a3a'][i]);
}
function drawRack(x, y) {                      // Palettenregal mit Kanistern und Teilen
  const X = sx(x), Y = sy(y), w = 4 * T;
  R(X, Y - 90, 4, 90, '#2f4fb5'); R(X + w - 4, Y - 90, 4, 90, '#2f4fb5');
  for (const yy of [Y - 4, Y - 44, Y - 84]) R(X, yy, w, 4, '#e8853a');
  for (let i = 0; i < 6; i++) { R(X + 8 + i * 20, Y - 104, 16, 20, '#26232e'); R(X + 12 + i * 20, Y - 107, 6, 3, '#26232e'); }
  for (let i = 0; i < 5; i++) R(X + 8 + i * 24, Y - 62, 18, 18, ['#555c68', '#c08a5a', '#3a3d46', '#9aa2ab', '#c08a5a'][i]);
  R(X + 10, Y - 22, 30, 18, '#c08a5a'); R(X + 50, Y - 18, 24, 14, '#2f6db5');
}
function drawPneuPanel(x, y) {                 // fahrbare E-Pneumatik-Tafel (Lochplatte mit roten Kabeln)
  const X = sx(x), Y = sy(y);
  softShadow(X + 30, Y, 32, 3);
  R(X + 4, Y - 12, 4, 12, '#9aa2ab'); R(X + 52, Y - 12, 4, 12, '#9aa2ab'); R(X, Y - 2, 60, 3, '#555c68');
  R(X, Y - 80, 60, 68, '#e6e8ea'); for (let r = 0; r < 10; r++) R(X + 2, Y - 76 + r * 6, 56, 1, '#c9ccd1');
  R(X + 6, Y - 74, 48, 8, '#9aa2ab'); for (let i = 0; i < 6; i++) px(X + 9 + i * 8, Y - 71, blink(1 + i * 0.3, x) ? '#7cc47a' : '#2a4a2a');
  R(X + 8, Y - 58, 18, 6, '#c9ccd1'); R(X + 36, Y - 52, 8, 10, '#3d7fc4'); R(X + 10, Y - 34, 16, 8, '#3a3d46');
  ctx.strokeStyle = '#d94a3a'; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(X + 10 + i * 12, Y - 66); ctx.quadraticCurveTo(X + 20 + i * 8, Y - 30, X + 40 - i * 6, Y - 44); ctx.stroke(); }
  ctx.strokeStyle = '#3d7fc4'; ctx.beginPath(); ctx.moveTo(X + 40, Y - 42); ctx.quadraticCurveTo(X + 50, Y - 20, X + 18, Y - 30); ctx.stroke();
}
function drawPcBench(x, y, w) {                // Werkbank mit Monitoren an Armen und Laptops
  const b = box(x, y, w, 0.9, 20, '#d9b27a', '#c9ccd1', '#9aa2ab');
  R(b.X, b.Y, b.W, 2, '#ecc890');
  for (let i = 0; i < Math.floor(w); i++) { R(b.X + 4 + i * T, b.front + 4, T - 8, 14, '#b9bec5'); R(b.X + 10 + i * T, b.front + 9, 12, 2, '#7d8590'); }
  for (let s = 0; s < Math.floor(w / 1.6); s++) {
    const X = b.X + 14 + s * 52;
    R(X + 20, b.Y - 6, 3, 10, '#c9ccd1'); R(X + 6, b.Y - 30, 30, 22, '#26232e'); R(X + 8, b.Y - 28, 26, 16, '#2b3a4a'); R(X + 10, b.Y - 26, 12, 1, '#7cc47a');
    R(X, b.Y + 6, 20, 12, '#c9ccd1'); R(X + 1, b.Y + 4, 18, 3, '#e6e8ea');                     // Laptop
  }
  R(b.X + b.W - 30, b.Y + 4, 10, 14, '#c08a5a');                                                  // Brötchentüte
}
function drawTrolley(x, y) {                   // Werkzeugwagen mit Schaumeinlage
  const b = box(x, y, 1.6, 0.8, 40, '#e2e4e6', '#c9ccd1', '#9aa2ab');
  R(b.X + 4, b.Y + 4, b.W - 8, b.D - 8, '#d94a3a'); for (let i = 0; i < 4; i++) R(b.X + 8 + i * 11, b.Y + 8, 7, 3, '#26232e');
  for (let i = 0; i < 4; i++) { R(b.X + 4, b.front + 3 + i * 9, b.W - 8, 7, '#d6d9dc'); R(b.X + b.W / 2 - 6, b.front + 5 + i * 9, 12, 2, '#7d8590'); }
  disc(b.X + 4, b.bottom - 2, 3, '#26232e'); disc(b.X + b.W - 4, b.bottom - 2, 3, '#26232e');
}
function drawWoodBench(x, y, w) {              // Werkbank Holz mit grauen Schubladenschränken
  const b = box(x, y, w, 1.0, 24, '#dcc496', '#c9ccd1', '#9aa2ab');
  R(b.X, b.Y, b.W, 2, '#ecd6aa'); R(b.X + 20, b.Y + 8, 60, 14, '#c9a46c');
  for (const cx of [0, b.W - 40]) for (let i = 0; i < 2; i++) { R(b.X + cx + 4, b.front + 3 + i * 10, 32, 8, '#b9bec5'); R(b.X + cx + 14, b.front + 6 + i * 10, 12, 2, '#7d8590'); }
  R(b.X + b.W - 70, b.Y + 4, 36, 18, '#d94a3a'); R(b.X + b.W - 70, b.Y + 4, 36, 3, '#e86a5a');     // rote Kiste
}
function drawOfficePrinter(x, y) {            // Drucker am Büro (Kopierer-Station der Halle)
  const b = box(x, y, 1.6, 0.8, 34, '#d6d6dc', '#ececf0', '#b9b9c1');
  R(b.X + 4, b.Y + 4, b.W - 20, b.D - 8, '#c3c3ca'); R(b.X + 8, b.Y + 8, b.W - 30, 6, COL.white);
  R(b.X + b.W - 16, b.front + 2, 14, 8, '#3a3d46'); R(b.X + b.W - 14, b.front + 4, 10, 4, '#4f8fc9');
  R(b.X + 4, b.front + 12, b.W - 12, 8, '#3f424b'); for (let i = 0; i < 3; i++) R(b.X + 8, b.front + 18 - i * 2, b.W - 22, 2, i % 2 ? '#f0ece4' : COL.white);
  for (let i = 0; i < 2; i++) { R(b.X + 2, b.front + 22 + i * 6, b.W - 4, 5, '#e2e2e8'); R(b.X + b.W / 2 - 6, b.front + 23 + i * 6, 12, 1, '#7d8590'); }
}
function drawBins(x, y) { const X = sx(x), Y = sy(y); for (let i = 0; i < 3; i++) { R(X + i * 18, Y - 22, 16, 22, '#f2f2ee'); R(X + i * 18, Y - 24, 16, 3, ['#f2c14e', '#2f6db5', '#9aa2ab'][i]); } }
function drawHoseRail() {                      // blaue Schiene mit orangen Abgasschläuchen über den Prüfständen
  const y0 = sy(9.2) - 128;
  R(sx(20.2), y0, 9.6 * T, 6, '#2f6db5'); R(sx(20.2), y0, 9.6 * T, 2, '#5a8fd6');
  for (const x of [21.6, 24.8, 28.0]) {
    const X = sx(x) + 30;
    R(X - 4, y0 + 6, 10, 6, '#3a3d46');
    for (let i = 0; i < 12; i++) { const yy = y0 + 12 + i * 4; R(X - 3 + Math.round(Math.sin(i * 0.9 + clockT) * 1), yy, 8, 3, i % 2 ? '#d98a4a' : '#c47a3a'); }
  }
}
function hallWorker(i, x, y, face) {           // Azubi in Arbeitshose mit Reflexstreifen
  rmKid(i, x, y, face);
  const X = sx(x), Y = sy(y);
  R(X - 6, Y - 12, 12, 10, '#26304a'); R(X - 6, Y - 7, 5, 2, '#d8e86a'); R(X + 1, Y - 7, 5, 2, '#d8e86a'); R(X - 6, Y - 6, 5, 1, '#e6e8ea'); R(X + 1, Y - 6, 5, 1, '#e6e8ea');
  R(X - 7, Y - 2, 6, 2, '#26232e'); R(X + 1, Y - 2, 6, 2, '#26232e');
}
function drawHall() {
  const S = rmShell(30, 13, { wall: '#e2e5e8', side: '#4a525c', base: '#7a838e', floor: hallFloor });
  hallWall(S.wy);
  const list = [];
  list.push({ y: 1.0, f: () => drawEngineRack(1.6, 1.0) });
  list.push({ y: 1.2, f: () => drawSmartboard(11.0, 1.2) });
  list.push({ y: 0.9, f: () => drawRack(13.6, 0.9) });
  list.push({ y: 2.6, f: () => drawContainer(24.2, 0.3) });
  list.push({ y: 3.6, f: () => drawBins(28.4, 3.6) });
  list.push({ y: 3.3, f: () => drawOfficePrinter(24.4, 2.6) });
  list.push({ y: 6.3, f: () => drawLoader2(16.4, 6.2) });
  [[20.6, '#e8b830'], [23.8, '#e8b830'], [27.0, '#e8b830']].forEach(([x, c]) => list.push({ y: 9.2, f: () => drawTestStand(x, 9.2, c) }));
  list.push({ y: 5.6, f: () => drawPneuPanel(1.2, 5.6) });
  list.push({ y: 5.6, f: () => drawPneuPanel(4.0, 5.6) });
  list.push({ y: 9.6, f: () => drawPcBench(0.6, 8.6, 6.4) });
  list.push({ y: 8.0, f: () => drawTrolley(8.0, 7.2) });
  list.push({ y: 4.8, f: () => drawMobileBoard(11.2, 4.8) });
  list.push({ y: 12.4, f: () => drawWoodBench(20.4, 11.4, 6) });
  list.push({ y: 12.7, f: () => { const X = sx(29.4), Y = sy(12.6); R(X, Y - 22, 10, 22, '#d94a3a'); R(X + 2, Y - 26, 6, 4, '#26232e'); } });
  // Azubis (12)
  list.push({ y: 2.2, f: () => hallWorker(0, 3.4, 2.2, 'up') });                    // am Motorregal
  list.push({ y: 6.5, f: () => hallWorker(1, 2.1, 6.5, 'up') });                    // E-Pneumatik
  list.push({ y: 6.5, f: () => hallWorker(2, 4.9, 6.5, 'up') });
  [1.6, 3.4, 5.2].forEach((x, n) => list.push({ y: 10.6, f: () => rmSeated(3 + n, x, 10.6) }));   // PC-Plätze
  list.push({ y: 8.3, f: () => hallWorker(6, 9.8, 8.3, 'left') });                  // Werkzeugwagen
  list.push({ y: 9.9, f: () => hallWorker(7, 20.2, 9.9, 'right') });               // Prüfstände
  list.push({ y: 9.9, f: () => hallWorker(8, 23.4, 9.9, 'right') });
  list.push({ y: 7.6, f: () => hallWorker(9, 24.4, 7.6, 'down') });
  list.push({ y: 9.9, f: () => hallWorker(10, 26.6, 9.9, 'right') });
  list.push({ y: 7.3, f: () => hallWorker(11, 15.6, 7.3, 'up') });                  // schaut sich den Radlader an
  list.push({ y: 5.6, f: () => rmTeacher(14.2, 5.6, 'left') });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  drawHoseRail();
  // runde Hallenlampen: Lichtkegel auf dem Boden
  for (const [x, y] of [[5, 4], [14, 4], [23, 5], [5, 10], [14, 10], [23, 10.5]]) {
    const g = ctx.createRadialGradient(sx(x), sy(y), 6, sx(x), sy(y), 150);
    g.addColorStop(0, 'rgba(255,250,235,.16)'); g.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = g; ctx.fillRect(sx(x) - 150, sy(y) - 150, 300, 300);
  }
}

function drawMobileBoard(x, y) {
  const X = sx(x), Y = sy(y);
  softShadow(X + 40, Y + 1, 44, 4);
  R(X + 4, Y - 16, 3, 16, '#9aa2ab'); R(X + 74, Y - 16, 3, 16, '#9aa2ab'); R(X - 2, Y - 2, 14, 3, '#555c68'); R(X + 68, Y - 2, 14, 3, '#555c68');
  R(X - 2, Y - 66, 84, 52, '#9aa2ab'); R(X, Y - 64, 80, 48, '#f8f8f4');
  ltext('HYDRAULIK', X + 4, Y - 60, '#2f6db5', 1);
  ctx.strokeStyle = '#26232e'; ctx.lineWidth = 1; ctx.strokeRect(X + 8.5, Y - 48.5, 24, 10); ctx.strokeRect(X + 40.5, Y - 46.5, 12, 14);
  R(X + 32, Y - 44, 8, 1, '#26232e'); R(X + 46, Y - 32, 1, 10, '#26232e'); R(X + 20, Y - 38, 1, 16, '#d94a3a'); R(X + 20, Y - 22, 27, 1, '#d94a3a');
}

/* ============================================== Automatisierungslabor */
function labFloor(FX, FY, FW, FH) {
  R(FX, FY, FW, FH, '#c8ccc8');
  for (let x = 0; x < FW; x += T) for (let y = 0; y < FH; y += T) if ((x / T + y / T) % 2) R(FX + x, FY + y, T, T, '#c2c6c2');
  seed = 41;
  for (let i = 0; i < 500; i++) px(FX + srnd() * FW, FY + srnd() * FH, '#b8bcb8');
  for (const y of [3.95, 6.25]) { R(FX + 2 * T, sy(y), 12 * T, 4, '#8a9099'); R(FX + 2 * T, sy(y), 12 * T, 1, '#a9afb6'); }   // Bodenkanal
}
function labWall(wy) {
  const FX = OX, FW = 20 * T;
  R(FX, OY - 40, FW, 4, '#2f6db5');
  // Pneumatik-Tafeln links
  for (let i = 0; i < 2; i++) {
    const X = sx(0.4 + i * 2.5), Y = wy + 10;
    R(X - 2, Y - 2, 2.2 * T + 4, 48, '#9aa2ab'); R(X, Y, 2.2 * T, 44, '#d6dadf');
    for (let r = 0; r < 7; r++) R(X, Y + 3 + r * 6, 2.2 * T, 1, '#b9bec5');
    R(X + 6, Y + 6, 24, 7, '#c9ccd1'); R(X + 30, Y + 8, 12, 3, '#9aa2ab'); R(X + 46, Y + 22, 10, 10, '#3d7fc4');
    R(X + 8, Y + 26, 18, 6, '#c9ccd1');
    ctx.strokeStyle = '#3d7fc4'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X + 14, Y + 13); ctx.quadraticCurveTo(X + 30, Y + 36, X + 48, Y + 30); ctx.stroke();
    ctx.strokeStyle = '#2a2a2a'; ctx.beginPath(); ctx.moveTo(X + 20, Y + 32); ctx.quadraticCurveTo(X + 40, Y + 42, X + 54, Y + 28); ctx.stroke();
  }
  // Leinwand mit Beamer-Bild
  const bx = sx(6.4), by = wy + 4;
  R(bx - 2, by - 4, 7.2 * T + 4, 4, '#3a3d46');
  R(bx, by, 7.2 * T, 54, '#f4f6f8');
  R(bx + 8, by + 6, 210, 42, '#2b3a4a');
  ltext('SPS: AMPELSTEUERUNG', bx + 14, by + 10, '#9fd3f0', 1);
  for (let r = 0; r < 3; r++) {                                                            // Kontaktplan
    const yy = by + 22 + r * 8;
    R(bx + 14, yy, 2, 6, '#9fd3f0'); R(bx + 16, yy + 3, 170, 1, '#9fd3f0');
    R(bx + 40, yy, 2, 6, '#7cc47a'); R(bx + 46, yy, 2, 6, '#7cc47a'); R(bx + 172, yy, 6, 6, 'rgba(0,0,0,0)');
    disc(bx + 178, yy + 3, 3, ['#d94a3a', '#f2c14e', '#7cc47a'][r]); R(bx + 200, yy, 2, 6, '#9fd3f0');
  }
  // Beamer an der Decke
  R(sx(9.6), wy - 2, 4, 14, '#3a3d46'); rr(sx(9.2), wy + 10, 22, 10, '#e2e4e6', 2); disc(sx(9.2) + 6, wy + 15, 2, blink(0.5) ? '#9fd3f0' : '#5a8aa8');
  // Fenster rechts
  const fx = sx(14.6), fy = wy + 8;
  R(fx - 2, fy - 2, 3 * T + 4, 42, '#e2e4e6');
  for (let c = 0; c < 3; c++) { R(fx + c * T + 1, fy, T - 2, 38, '#a9d0e8'); R(fx + c * T + 3, fy + 2, 5, 2, '#d8eefa'); }
  for (let c = 0; c < 3; c++) for (let j = 0; j < 6; j++) R(fx + c * T + 1, fy + j * 6 + 2, T - 2, 2, 'rgba(230,236,240,.75)');   // Lamellen
  rmClock(sx(13.6), wy + 22);
}
function drawServerRack(x, y) {
  const b = box(x, y, 1.1, 0.8, 70, '#3a3d46', '#26232e', '#16141a');
  for (let i = 0; i < 9; i++) { R(b.X + 3, b.front + 3 + i * 7, b.W - 6, 5, '#3a3d46'); for (let j = 0; j < 4; j++) px(b.X + 6 + j * 4, b.front + 5 + i * 7, blink(2 + j * 0.7, i) ? '#7cc47a' : '#2a4a2a'); px(b.X + b.W - 8, b.front + 5 + i * 7, i === 3 && blink(4) ? '#f2c14e' : '#4a4f58'); }
}
function drawLabDesk(x, y, w) {                // Doppelarbeitsplatz mit PC und SPS-Trainer
  const b = box(x, y, w, 0.9, 16, '#eceeef', '#9aa2ab', '#7d8590');
  R(b.X, b.Y, b.W, 1, '#ffffff');
  for (let s = 0; s < 2; s++) {
    const X = b.X + 8 + s * (b.W / 2);
    R(X + 4, b.Y - 18, 30, 20, '#26232e'); R(X + 6, b.Y - 16, 26, 14, (s + Math.floor(x)) % 2 ? '#2b3a4a' : '#24303c');
    for (let r = 0; r < 3; r++) R(X + 8, b.Y - 14 + r * 4, 8 + ((r * 7 + x) % 14), 1, ['#9fd3f0', '#7cc47a', '#f2c14e'][r]);
    R(X + 16, b.Y + 2, 6, 3, '#3a3d46');
    // SPS-Trainer
    R(X + 38, b.Y - 10, 22, 22, '#9aa2ab'); R(X + 38, b.Y - 10, 22, 2, '#c9ccd1'); R(X + 40, b.Y - 6, 18, 6, '#3a3d46');
    for (let j = 0; j < 4; j++) px(X + 42 + j * 4, b.Y - 4, blink(1.5 + j * 0.4, s) ? '#7cc47a' : '#2a4a2a');
    for (let j = 0; j < 3; j++) R(X + 41 + j * 6, b.Y + 4, 3, 4, ['#d94a3a', '#7cc47a', '#f2c14e'][j]);
    R(X + 2, b.Y + 6, 18, 6, '#3a3d46');                                                   // Tastatur
  }
  ctx.strokeStyle = '#e8853a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b.X + 70, b.Y + 4); ctx.quadraticCurveTo(b.X + 76, b.front + 10, b.X + 60, b.front + 14); ctx.stroke();
}
function drawConveyor(x, y, w) {               // Förderband-Modell mit Teilen
  const b = box(x, y, w, 0.7, 20, '#3a3d46', '#9aa2ab', '#7d8590');
  for (let i = 0; i < b.W; i += 6) R(b.X + ((i + clockT * 20) % b.W), b.Y + 2, 2, b.D - 4, '#2a2d34');
  for (let i = 0; i < 3; i++) { const px0 = b.X + ((i * 40 + clockT * 20) % (b.W - 12)); R(px0, b.Y + 4, 10, 10, ['#d94a3a', '#2f6db5', '#c9ccd1'][i]); R(px0, b.Y + 4, 10, 2, '#ffffff55'); }
  R(b.X + b.W / 2, b.Y - 22, 4, 22, '#555c68'); R(b.X + b.W / 2 - 2, b.Y - 24, 10, 6, '#3a3d46'); px(b.X + b.W / 2 + 6, b.Y - 21, blink(3) ? '#d94a3a' : '#5a2a2a');   // Lichtschranke
  disc(b.X + 6, b.front + 6, 4, '#555c68'); disc(b.X + b.W - 6, b.front + 6, 4, '#555c68');
  rmEstop(b.X + b.W - 18, b.front + 10);
}
function drawRobot(x, y) {                     // kleiner Roboterarm auf Tisch mit Schutzscheibe
  const b = box(x, y, 2.2, 1.2, 18, '#d6dadf', '#9aa2ab', '#7d8590');
  const bx = b.X + b.W / 2, by = b.Y + b.D / 2;
  disc(bx, by + 2, 10, '#e8853a'); disc(bx, by, 8, '#f29a4e');
  const a1 = -1.2 + Math.sin(clockT * 0.9) * 0.6, a2 = a1 + 1.4 + Math.sin(clockT * 1.3) * 0.5;
  const ex = bx + Math.cos(a1) * 22, ey = by - 18 + Math.sin(a1) * 14, hx = ex + Math.cos(a2) * 18, hy = ey + Math.sin(a2) * 12;
  ctx.strokeStyle = '#e8853a'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by - 18); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke(); ctx.lineCap = 'butt';
  disc(ex, ey, 4, '#3a3d46'); R(hx - 3, hy, 6, 6, '#3a3d46'); R(hx - 4, hy + 6, 2, 4, '#9aa2ab'); R(hx + 2, hy + 6, 2, 4, '#9aa2ab');
  R(b.X + 6, b.Y + 4, 10, 10, '#2f6db5'); R(b.X + b.W - 18, b.Y + 6, 10, 10, '#d94a3a');
  // Schutzscheibe
  ctx.fillStyle = 'rgba(190,225,245,.22)'; ctx.fillRect(b.X - 4, b.Y - 46, b.W + 8, 46 + b.D);
  R(b.X - 4, b.Y - 46, 2, 46 + b.D, '#9aa2ab'); R(b.X + b.W + 2, b.Y - 46, 2, 46 + b.D, '#9aa2ab'); R(b.X - 4, b.Y - 46, b.W + 8, 2, '#9aa2ab');
}
function draw3DPrinter(x, y) {
  const b = box(x, y, 1.1, 0.8, 34, '#3a3d46', '#26232e', '#16141a');
  R(b.X + 4, b.front + 2, b.W - 8, 26, 'rgba(190,225,245,.4)');
  const hx = b.X + 8 + ((Math.sin(clockT * 2) + 1) / 2) * (b.W - 22);
  R(hx, b.front + 6, 6, 4, '#f29a4e'); R(b.X + 10, b.front + 22, b.W - 20, 4, '#7cc47a');
  R(b.X + 4, b.Y + 4, 10, 4, '#7cc47a');
}
function drawLab() {
  const S = rmShell(20, 10, { wall: '#eef0f1', wallLow: '#dfe3e6', base: '#8a9099', side: '#3c4048', floor: labFloor });
  labWall(S.wy);
  const list = [];
  list.push({ y: 1.35, f: () => {                                                          // Lehrertisch mit 2 Monitoren
    const b = box(1.4, 0.2, 3, 1.1, 18, '#eceeef', '#9aa2ab', '#7d8590');
    R(b.X + 8, b.Y - 18, 28, 20, '#26232e'); R(b.X + 10, b.Y - 16, 24, 14, '#2b3a4a'); R(b.X + 40, b.Y - 18, 28, 20, '#26232e'); R(b.X + 42, b.Y - 16, 24, 14, '#69b2ee');
    R(b.X + 12, b.Y - 14, 12, 1, '#7cc47a'); R(b.X + 12, b.Y - 10, 16, 1, '#9fd3f0');
    R(b.X + 20, b.Y + 6, 30, 6, '#3a3d46'); R(b.X + 74, b.Y + 4, 8, 8, COL.white);
  } });
  list.push({ y: 1.0, f: () => drawServerRack(18.6, 0.2) });
  [2.6, 4.9, 7.2].forEach(dy => { list.push({ y: dy + 0.9, f: () => drawLabDesk(3.2, dy, 4.2) }); list.push({ y: dy + 0.9, f: () => drawLabDesk(8.4, dy, 4.2) }); });
  let n = 0;
  [2.6, 4.9, 7.2].forEach(dy => [4.25, 6.35, 9.45, 11.55].forEach(x => { const i = n++; list.push({ y: dy + 1.25, f: () => rmSeated(i, x, dy + 1.25) }); }));
  list.push({ y: 4.0, f: () => drawConveyor(14.6, 3.1, 4.6) });
  list.push({ y: 7.4, f: () => drawRobot(15.8, 6.0) });
  list.push({ y: 9.8, f: () => draw3DPrinter(0.4, 8.9) });
  list.push({ y: 9.75, f: () => { const b = box(1.7, 8.9, 1.4, 0.8, 30, '#e2e4e6', '#c9ccd1', '#9aa2ab'); R(b.X + 6, b.Y + 4, 30, 6, COL.white); ltext('DRUCK', b.X + 8, b.front + 8, '#3a3d46', 1); } });
  list.push({ y: 2.1, f: () => rmTeacher(7.9, 2.1) });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  rmDoor(16.6, 10);
  // kühles LED-Licht
  ctx.fillStyle = 'rgba(220,240,255,.08)'; ctx.fillRect(OX, OY, 20 * T, 10 * T);
  for (const x of [5, 10, 15]) { const g = ctx.createRadialGradient(sx(x), sy(5), 10, sx(x), sy(5), 160); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(sx(x) - 160, sy(5) - 160, 320, 320); }
}

/* ============================================================ Ablauf */
render = function () {
  const r = ROOMS[roomIdx];
  if (!r.draw) { state = 'title'; origRender(); rmLabel(); return; }
  const W = OX * 2 + r.w * T, H = OY + r.h * T + 40;
  if (roomCv.width !== W || roomCv.height !== H) { roomCv.width = W; roomCv.height = H; }
  ctx = roomCv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  r.draw();
  ctx = mainCtx;
  const maxX = Math.max(0, W - SW), maxY = Math.max(0, H - SH);
  if (camAuto && maxX > 0) { camX += camDir * 0.6; if (camX > maxX) { camX = maxX; camDir = -1; } if (camX < 0) { camX = 0; camDir = 1; } }
  camX = clamp(camX, 0, maxX); camY = clamp(camY, 0, maxY);
  ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, SW, SH);
  ctx.drawImage(roomCv, -Math.round(camX), -Math.round(camY));
  rmLabel();
  if (maxX > 0) ptext(camAuto ? 'PFEILE: SCHWENKEN' : 'LEERTASTE: AUTO', SW - 150, SH - 20, COL.white);
};
function setRoom(i) { roomIdx = i; camX = 0; camY = 0; camAuto = true; document.querySelectorAll('#roombar button').forEach((b, j) => b.classList.toggle('on', j === i)); }
window.addEventListener('keydown', e => {
  if (/^Digit[1-4]$/.test(e.code)) setRoom(+e.code.slice(5) - 1);
  const step = 48;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') { camAuto = false; camX += step; }
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') { camAuto = false; camX -= step; }
  if (e.code === 'ArrowDown' || e.code === 'KeyS') { camAuto = false; camY += step; }
  if (e.code === 'ArrowUp' || e.code === 'KeyW') { camAuto = false; camY -= step; }
  if (e.code === 'Space') camAuto = true;
  e.stopImmediatePropagation(); e.preventDefault();
}, true);
(function roomBar() {
  const bar = document.createElement('div');
  bar.id = 'roombar';
  bar.innerHTML = ['Klasse', 'Werkstatt', 'Halle', 'Labor'].map((n, i) => `<button data-room="${i}">${i + 1} ${n}</button>`).join('');
  document.body.appendChild(bar);
  bar.addEventListener('pointerdown', e => { const b = e.target.closest('button'); if (b) { setRoom(+b.dataset.room); e.stopPropagation(); } });
  let drag = null;
  document.getElementById('game').addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, cx: camX, cy: camY }; camAuto = false; });
  window.addEventListener('pointermove', e => { if (drag) { const s = SW / document.getElementById('game').getBoundingClientRect().width; camX = drag.cx - (e.clientX - drag.x) * s; camY = drag.cy - (e.clientY - drag.y) * s; } });
  window.addEventListener('pointerup', () => { drag = null; });
  setRoom(1);
})();

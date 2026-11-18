/* Raumgrafik: Metallwerkstatt, Praxishalle, Automatisierungslabor (genutzt von Spiel und Raum-Vorschau).
   Gleicher Ursprung (OX/OY) wie im Spiel. */

const RKIDS = makeKids();


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
  [5.4, 7.3, 9.2].forEach((x, i) => list.push({ y: 3.75, f: () => rmKid(i, x, 3.75, 'up', { goggles: true }) }));
  [5.4, 7.3, 9.2].forEach((x, i) => list.push({ y: 6.35, f: () => rmKid(3 + i, x, 6.35, 'up', { goggles: true }) }));
  [6.3, 8.3].forEach((x, i) => list.push({ y: 8.95, f: () => rmKid(6 + i, x, 8.95, 'up', { goggles: true }) }));
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
  // Sektionaltor mit Fensterreihe
  const rx = sx(18.4), rw = 4.6 * T;
  R(rx - 6, wy + 14, rw + 12, WALL_H - 14, '#7a838e');
  for (let j = 0; j < 8; j++) { R(rx, wy + 18 + j * 8, rw, 7, '#dfe2e5'); R(rx, wy + 18 + j * 8, rw, 1, '#f2f4f6'); }
  for (let c = 0; c < 6; c++) { R(rx + 4 + c * 24, wy + 50, 20, 7, '#a9d0e8'); R(rx + 5 + c * 24, wy + 51, 5, 2, '#d8eefa'); }
  R(rx + rw - 16, wy + 60, 6, 6, '#3a3d46');
  // runde Uhr
  rmClock(sx(16.4), wy + 28);
}
function drawContainer(x, y) {                 // Bürocontainer als geschlossener Block, vorne WC-Tür
  const b = box(x, y, 5.6, 4.2, 74, '#d6d9dc', '#f2f2ee', '#c9ccd1');
  for (let i = 1; i < 4; i++) R(b.X + i * (b.W / 4), b.front, 1, 74, '#d6d9dc');
  for (let i = 1; i < 6; i++) R(b.X, b.Y + i * (b.D / 6), b.W, 1, '#c9ccd1');                    // Dachfugen
  R(b.X + 8, b.front + 10, 34, 9, '#2f6db5'); ltext('BUERO', b.X + 11, b.front + 12, COL.white, 1);
  const wx = b.X + 92;                                                                              // WC-Tür
  R(wx - 2, b.front + 18, 34, 56, '#c9ccd1'); R(wx, b.front + 20, 30, 54, '#e6e8e6'); R(wx, b.front + 20, 30, 2, '#ffffff'); R(wx + 24, b.front + 46, 4, 2, '#9aa2ab');
  R(wx + 6, b.front + 26, 18, 10, '#2f6db5'); ltext('WC', wx + 11, b.front + 28, COL.white, 1);
  // auf dem Dach: Heizgerät, Kisten, Leiter
  R(b.X + 20, b.Y + 6, 40, 26, '#9aa2ab'); R(b.X + 20, b.Y + 6, 40, 3, '#c9ccd1'); disc(b.X + 36, b.Y + 19, 8, '#3a3d46'); disc(b.X + 36, b.Y + 19, 3, '#6b7280');
  R(b.X + 90, b.Y + 14, 22, 14, '#c08a5a'); R(b.X + 116, b.Y + 18, 16, 10, '#c08a5a'); R(b.X + 140, b.Y + 12, 6, 20, '#3a3d46');
  for (let i = 0; i < 6; i++) R(b.X + b.W - 18, b.front - 30 + i * 14, 14, 2, '#c9ccd1');
  R(b.X + b.W - 18, b.front - 34, 2, 90, '#c9ccd1'); R(b.X + b.W - 6, b.front - 34, 2, 90, '#c9ccd1');
}
function drawTestStandFront(x, y) {            // Motorprüfstand in den Raum gedreht (Blick auf die Stirnseite)
  const X = sx(x), Y = sy(y), c = '#e8b830';
  softShadow(X + 22, Y + 2, 30, 5);
  R(X - 2, Y - 8, 50, 6, '#3a3d46'); R(X, Y - 2, 6, 4, '#26232e'); R(X + 40, Y - 2, 6, 4, '#26232e');
  R(X + 4, Y - 110, 38, 30, '#f4f4f0'); R(X + 4, Y - 110, 38, 2, '#ffffff');                                     // Schalttafel hinten oben
  for (let i = 0; i < 3; i++) { disc(X + 12 + i * 11, Y - 100, 4, '#26232e'); px(X + 12 + i * 11, Y - 102, PAL.red); }
  for (let i = 0; i < 4; i++) px(X + 10 + i * 8, Y - 86, blink(1.1 + i * 0.4, 7) ? '#f29a4e' : '#7a3a1a');
  rr(X + 4, Y - 70, 38, 62, c, 3); R(X + 4, Y - 70, 38, 3, shade(c, 0.3));                                       // Block
  rr(X + 8, Y - 80, 30, 12, '#c9ccd1', 3);                                                                      // Ventildeckel
  disc(X + 23, Y - 40, 12, '#3a3d46'); disc(X + 23, Y - 40, 5, '#9aa2ab');                                       // Riemenscheibe / Lüfter
  R(X + 30, Y - 62, 8, 8, '#3a3d46'); R(X + 8, Y - 24, 30, 6, '#3a3d46');
  rmEstop(X + 44, Y - 60);
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
function drawRackSide(x, y, len) {            // Hochregal an der linken Wand (um 90° gedreht, von oben)
  const X = sx(x), Y = sy(y), W = 1.3 * T, H = len * T;
  softShadow(X + W / 2 + 6, Y + H, W, 5);
  R(X, Y - 60, W, H, 'rgba(0,0,0,0)');
  for (let i = 0; i <= len; i += 1.5) R(X, Y - 60 + i * T, W, 4, '#2f4fb5');                     // Stützen
  R(X, Y - 60, 4, H, '#e8853a'); R(X + W - 4, Y - 60, 4, H, '#e8853a');                          // Traversen
  for (let i = 0; i < len * 2 - 1; i++) {
    const yy = Y - 54 + i * 16;
    if (i % 3 === 2) { R(X + 6, yy, W - 12, 12, '#c08a5a'); R(X + 6, yy, W - 12, 2, '#d8a874'); }
    else for (let j = 0; j < 2; j++) { R(X + 6 + j * 16, yy, 13, 12, '#26232e'); R(X + 9 + j * 16, yy + 2, 6, 2, '#3a3d46'); }
  }
  R(X - 2, Y - 60 + H, W + 4, 60, 'rgba(0,0,0,0)');
  R(X, Y - 60 + H, W, 60 - 6, '#2f4fb5'); R(X + 4, Y - 60 + H + 4, W - 8, 16, '#3a3d46'); R(X + 4, Y - 60 + H + 24, W - 8, 16, '#c08a5a');   // Stirnseite
  R(X, Y - 60 + H + 20, W, 3, '#e8853a'); R(X, Y - 60 + H + 40, W, 3, '#e8853a');
}
function drawHydWall(x, y) {                   // fahrbare Hydraulikwand
  const X = sx(x), Y = sy(y), W = 1.9 * T;
  softShadow(X + W / 2, Y, W / 2 + 4, 3);
  R(X + 4, Y - 12, 4, 12, '#2f5f9a'); R(X + W - 8, Y - 12, 4, 12, '#2f5f9a'); R(X, Y - 2, W, 3, '#1f3f6a');
  R(X - 2, Y - 84, W + 4, 74, '#2f5f9a'); R(X, Y - 82, W, 70, '#d6dadf');
  for (let r = 0; r < 11; r++) R(X, Y - 80 + r * 6, W, 1, '#b9bec5');
  R(X + 6, Y - 76, 24, 7, '#2f6db5'); R(X + 30, Y - 74, 8 + Math.round((Math.sin(clockT * 1.5 + x) + 1) * 4), 3, '#c9ccd1');   // Zylinder fährt
  R(X + 40, Y - 56, 10, 12, '#555c68'); R(X + 42, Y - 54, 6, 3, '#d94a3a');
  disc(X + 16, Y - 46, 5, '#f4f4f0'); disc(X + 16, Y - 46, 3, '#26232e'); px(X + 17, Y - 47, '#d94a3a');
  ctx.strokeStyle = '#26232e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X + 14, Y - 69); ctx.quadraticCurveTo(X + 20, Y - 30, X + 44, Y - 44); ctx.stroke();
  ctx.strokeStyle = '#3d7fc4'; ctx.beginPath(); ctx.moveTo(X + 48, Y - 44); ctx.quadraticCurveTo(X + 56, Y - 20, X + 24, Y - 24); ctx.stroke();
  R(X + 34, Y - 30, 18, 12, '#2f6db5');                                                            // Aggregat unten
}
function drawElecWall(x, y, ph) {              // große Steckwand mit Bagger-Arbeitsscheinwerfern und Rundumleuchte
  const X = sx(x), Y = sy(y), W = 2.8 * T;
  softShadow(X + W / 2, Y, W / 2 + 6, 4);
  R(X + 6, Y - 14, 5, 14, '#555c68'); R(X + W - 11, Y - 14, 5, 14, '#555c68'); R(X, Y - 3, W, 4, '#3a3d46');
  R(X - 3, Y - 124, W + 6, 112, '#555c68'); R(X, Y - 121, W, 106, '#e2e4e6');
  for (let r = 0; r < 9; r++) for (let c = 0; c < 11; c++) px(X + 6 + c * 8, Y - 112 + r * 10, ['#d94a3a', '#26232e', '#2f6db5'][(r + c) % 3]);
  for (let c = 0; c < 4; c++) { R(X + 8 + c * 20, Y - 34, 14, 12, '#3a3d46'); px(X + 12 + c * 20, Y - 30, blink(2, c + ph) ? '#7cc47a' : '#2a4a2a'); }   // Relais/Schalter
  ctx.strokeStyle = '#d94a3a'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(X + 8 + i * 16, Y - 112 + (i % 3) * 14); ctx.quadraticCurveTo(X + 20 + i * 12, Y - 16, X + 70 - i * 10, Y - 60 + (i % 2) * 20); ctx.stroke(); }
  ctx.strokeStyle = '#f2c14e'; ctx.beginPath(); ctx.moveTo(X + 14, Y - 90); ctx.quadraticCurveTo(X + 40, Y - 10, X + 80, Y - 50); ctx.stroke();
  // Arbeitsscheinwerfer oben: Lampenschaltung, mal die einen, mal die anderen
  const step = Math.floor(clockT * 1.2 + ph);
  for (let i = 0; i < 4; i++) {
    const lx = X + 4 + i * 22, on = ((step + i) % 3 !== 0) && ((step >> 1) % 2 === i % 2 || step % 4 === 0);
    R(lx, Y - 136, 16, 12, '#26232e'); R(lx + 2, Y - 134, 12, 8, on ? '#fff4c8' : '#5a5a50');
    if (on) { ctx.fillStyle = 'rgba(255,244,200,.35)'; ctx.beginPath(); ctx.moveTo(lx + 2, Y - 126); ctx.lineTo(lx + 14, Y - 126); ctx.lineTo(lx + 24, Y - 90); ctx.lineTo(lx - 8, Y - 90); ctx.fill(); }
  }
  // Rundumleuchte
  const bx = X + W - 6, by = Y - 142, a = clockT * 6 + ph;
  R(bx - 5, by + 2, 10, 6, '#26232e'); disc(bx, by, 5, '#c8701a'); disc(bx + Math.round(Math.cos(a) * 3), by, 2, '#ffd27a');
  if (Math.cos(a) > 0.3) { ctx.fillStyle = 'rgba(242,154,78,.25)'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 40 * Math.sin(a), by - 12); ctx.lineTo(bx + 40 * Math.sin(a), by + 12); ctx.fill(); }
}
function drawBins(x, y) { const X = sx(x), Y = sy(y); for (let i = 0; i < 3; i++) { R(X + i * 18, Y - 22, 16, 22, '#f2f2ee'); R(X + i * 18, Y - 24, 16, 3, ['#f2c14e', '#2f6db5', '#9aa2ab'][i]); } }
function drawHoseRail() {                      // kurze blaue Schienen mit orangen Abgasschläuchen über den Prüfständen
  const B = HALL.motorB, A = HALL.motorA;
  for (const [rx, ry, X, end] of [[sx(B.x - 0.4), sy(B.y) - 124, sx(B.x) + 23, sy(B.y) - 80], [sx(A.x + 1.2), sy(A.y) - 112, sx(A.x + 1.8) + 10, sy(A.y) - 58]]) {
    R(rx, ry, 2.4 * T, 6, '#2f6db5'); R(rx, ry, 2.4 * T, 2, '#5a8fd6');
    R(X - 4, ry + 6, 10, 6, '#3a3d46');
    for (let yy = ry + 12, i = 0; yy < end; yy += 4, i++) R(X - 3 + Math.round(Math.sin(i * 0.9 + clockT) * 1), yy, 8, 3, i % 2 ? '#d98a4a' : '#c47a3a');
  }
}
function hallWorker(i, x, y, face) {           // Azubi in Arbeitshose mit Reflexstreifen
  rmKid(i, x, y, face);
  const X = sx(x), Y = sy(y);
  R(X - 6, Y - 12, 12, 10, '#26304a'); R(X - 6, Y - 7, 5, 2, '#d8e86a'); R(X + 1, Y - 7, 5, 2, '#d8e86a'); R(X - 6, Y - 6, 5, 1, '#e6e8ea'); R(X + 1, Y - 6, 5, 1, '#e6e8ea');
  R(X - 7, Y - 2, 6, 2, '#26232e'); R(X + 1, Y - 2, 6, 2, '#26232e');
}
const HALL = { motorA: { x: 13.2, y: 10.0 }, motorB: { x: 19.8, y: 7.0 } };
function drawHall() {
  const S = rmShell(30, 13, { wall: '#e2e5e8', side: '#4a525c', base: '#7a838e', floor: hallFloor });
  hallWall(S.wy);
  // Notausgang in der linken Wand
  { const L = OX - 16, Y = sy(7.2); R(L, Y, 16, 1.8 * T, '#d6d9dc'); R(L + 2, Y + 2, 12, 1.8 * T - 4, '#eceeef'); R(L + 10, Y + 26, 3, 6, '#9aa2ab'); rmSign(OX + 14, Y - 8, 'exit'); }
  const list = [];
  list.push({ y: 1.0, f: () => drawEngineRack(1.8, 1.0) });
  list.push({ y: 5.6, f: () => drawRackSide(0.1, 1.6, 4.4) });
  [8.9, 11.0, 14.0, 16.1].forEach(x => list.push({ y: 0.9, f: () => drawHydWall(x, 0.9) }));
  list.push({ y: 4.5, f: () => drawContainer(24.2, 0.3) });
  list.push({ y: 5.6, f: () => drawOfficePrinter(24.6, 4.8) });
  list.push({ y: 5.8, f: () => drawBins(27.4, 5.8) });
  // Radlader: Schaufel nach rechts, unten rechts an der Wand, Motorhaube hinten offen
  const LA = sx(29.2), LB = sy(11.7);
  list.push({ y: 11.7, f: () => {
    ctx.save(); ctx.translate(LA, LB); ctx.scale(-1.25, 1.25); ctx.translate(-sx(0), -sy(0)); drawLoader2(0, 0); ctx.restore();
    // Motorraum hinter der Kabine, Klappe hinten hochgeklappt
    const ex = LA - 228, ey = LB - 66;
    R(ex + 2, ey, 40, 18, '#3a3d46'); rr(ex + 6, ey + 2, 30, 13, '#9aa2ab', 2); R(ex + 8, ey + 4, 26, 3, '#c9ccd1'); disc(ex + 30, ey + 10, 3, '#555c68');
    ctx.fillStyle = '#f2b81e'; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + 40, ey); ctx.lineTo(ex + 4, ey - 44); ctx.lineTo(ex - 22, ey - 30); ctx.fill();
    ctx.fillStyle = '#c99212'; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + 6, ey); ctx.lineTo(ex - 16, ey - 33); ctx.lineTo(ex - 22, ey - 30); ctx.fill();
    for (let i = 0; i < 4; i++) R(ex + 6 + i * 7 - i * 3, ey - 14 - i * 6, 10, 2, '#c99212');
    R(ex + 22, ey - 26, 2, 26, '#9aa2ab');                                                               // Gasdruckfeder
  } });
  // Motoren: einer an der Wand, einer in den Raum gedreht
  list.push({ y: HALL.motorA.y, f: () => drawTestStand(HALL.motorA.x, HALL.motorA.y, '#e8b830') });
  list.push({ y: HALL.motorB.y, f: () => drawTestStandFront(HALL.motorB.x, HALL.motorB.y) });
  list.push({ y: 10.6, f: () => drawTrolley(16.6, 9.8) });
  // Elektro-Steckwände (groß), etwas höher
  list.push({ y: 9.9, f: () => drawElecWall(1.6, 9.9, 0) });
  list.push({ y: 9.9, f: () => drawElecWall(7.0, 9.9, 2) });
  list.push({ y: 5.0, f: () => drawMobileBoard(10.4, 5.0) });
  list.push({ y: 4.0, f: () => drawSmartboard(6.6, 4.0) });
  list.push({ y: 12.7, f: () => { const X = sx(29.4), Y = sy(9.4); R(X, Y - 22, 10, 22, '#d94a3a'); R(X + 2, Y - 26, 6, 4, '#26232e'); } });
  // Azubis (12)
  [9.8, 11.9, 14.9, 17.0].forEach((x, n) => list.push({ y: 1.9, f: () => hallWorker(n, x, 1.9, 'up') }));          // Hydraulik
  [[2.5, 4], [4.0, 5], [7.9, 6], [9.4, 7]].forEach(([x, i]) => list.push({ y: 10.7, f: () => hallWorker(i, x, 10.7, 'up') }));   // Elektrowände
  list.push({ y: 10.3, f: () => hallWorker(8, 12.7, 10.3, 'right') });                                           // Motor an der Wand
  list.push({ y: 7.5, f: () => hallWorker(9, 19.1, 7.5, 'right') });                                           // Motor im Raum
  list.push({ y: 11.6, f: () => hallWorker(10, 21.0, 11.6, 'right') });                                          // Radlader-Motor
  list.push({ y: 12.4, f: () => hallWorker(11, 22.3, 12.4, 'up') });
  list.push({ y: 5.7, f: () => rmTeacher(13.4, 5.7, 'left') });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  drawHoseRail();
  for (const [x, y] of [[5, 4], [14, 4], [23, 6], [5, 10], [14, 10], [23, 10.5]]) {
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
function labWall2(wy) {
  const FX = OX, FW = 20 * T;
  R(FX, OY - 40, FW, 4, '#2f6db5');
  // Tafel: Whiteboard + großer Bildschirm
  const bx = sx(4.6), by = wy + 6;
  R(bx - 2, by - 2, 2.6 * T + 4, 50, '#9aa2ab'); R(bx, by, 2.6 * T, 46, '#f8f8f4');
  ltext('E1  A1', bx + 6, by + 6, '#2f6db5', 1); R(bx + 6, by + 16, 40, 1, '#2f6db5'); R(bx + 6, by + 26, 60, 1, '#26232e'); R(bx + 30, by + 22, 2, 8, '#26232e'); R(bx + 36, by + 22, 2, 8, '#26232e'); disc(bx + 70, by + 26, 4, '#d94a3a');
  const sx0 = sx(7.4), sy0 = wy + 4;
  R(sx0 - 3, sy0 - 3, 4.4 * T + 6, 54, '#26232e'); R(sx0, sy0, 4.4 * T, 48, '#2b3a4a');
  ltext('SPS: AMPELSTEUERUNG', sx0 + 6, sy0 + 5, '#9fd3f0', 1);
  for (let r = 0; r < 3; r++) {
    const yy = sy0 + 16 + r * 9;
    R(sx0 + 6, yy, 2, 7, '#9fd3f0'); R(sx0 + 8, yy + 3, 110, 1, '#9fd3f0');
    R(sx0 + 30, yy, 2, 7, '#7cc47a'); R(sx0 + 36, yy, 2, 7, '#7cc47a');
    disc(sx0 + 112, yy + 3, 3, ['#d94a3a', '#f2c14e', '#7cc47a'][r]); R(sx0 + 128, yy, 2, 7, '#9fd3f0');
  }
  rmClock(sx(13.3), wy + 24);
  // Schaltschrank-Verteiler und Not-Aus an der Wand
  R(sx(15.0), wy + 10, 50, 56, '#d6d9dc'); R(sx(15.0), wy + 10, 50, 3, '#eef0f2'); R(sx(15.0) + 4, wy + 16, 42, 4, '#9aa2ab');
  for (let i = 0; i < 6; i++) R(sx(15.0) + 6 + i * 7, wy + 22, 5, 10, i % 2 ? '#3a3d46' : '#f4f4f0');
  rmEstop(sx(15.0) + 25, wy + 50);
  rmSign(sx(17.4), wy + 30, 'warn');
  const dx = sx(18.1);                                                                              // Tür an der Hinterwand
  R(dx - 3, wy + 18, 46, WALL_H - 18, '#9aa2ab'); R(dx, wy + 21, 40, WALL_H - 21, COL.oak); R(dx, wy + 21, 40, 1, COL.oakL);
  for (let i = 0; i < 3; i++) R(dx + 6 + i * 12, wy + 26, 1, WALL_H - 32, COL.oakD); R(dx + 32, wy + 50, 5, 3, '#d9b25a');
}
function labSideWalls() {
  // Fenster in der linken Wand, Türen in der rechten
  const L = OX - 16, Rr = OX + 20 * T;
  for (const y of [2.2, 4.8, 7.4]) {
    const Y = sy(y);
    R(L + 2, Y, 12, 2.0 * T, '#9fc7e0'); R(L + 4, Y + 4, 4, 2.0 * T - 8, '#d8eefa'); R(L + 2, Y + T - 1, 12, 2, '#e2e4e6');
    ctx.fillStyle = 'rgba(255,240,200,.10)'; ctx.beginPath(); ctx.moveTo(OX, Y); ctx.lineTo(OX + 70, Y + 20); ctx.lineTo(OX + 70, Y + 2.0 * T + 20); ctx.lineTo(OX, Y + 2.0 * T); ctx.fill();
  }
}
const LAB_PAIRS = [[3.5, 4.4], [5.7, 6.6], [7.9, 8.8]];
function drawWallDesk(side) {                  // lange Reihe an der Wand: pro Azubi-Paar ein PC und eine SPS
  const x = side < 0 ? 0.1 : 18.6, b = box(x, 2.4, 1.3, 7.2, 16, '#eceeef', '#9aa2ab', '#7d8590');
  R(b.X, b.Y, b.W, 1, '#ffffff');
  LAB_PAIRS.forEach(([y1, y2], n) => {
    const cy = (sy(y1) + sy(y2)) / 2 - 46;
    const SX = b.X + (side < 0 ? 3 : b.W - 25);                                                     // SPS (von oben)
    R(SX, cy - 18, 22, 18, '#9aa2ab'); R(SX, cy - 18, 22, 2, '#c9ccd1'); R(SX + 3, cy - 14, 16, 5, '#3a3d46');
    for (let j = 0; j < 4; j++) px(SX + 5 + j * 4, cy - 12, blink(1.3 + j * 0.37, n) ? '#7cc47a' : '#2a4a2a');
    for (let j = 0; j < 3; j++) R(SX + 4 + j * 6, cy - 6, 3, 3, ['#d94a3a', '#7cc47a', '#f2c14e'][j]);
    const MX = side < 0 ? b.X + 28 : b.X + 6;                                                       // Monitor im Profil, Bild zu den Azubis
    const pcc = typeof labPcColor === 'function' ? labPcColor(side, n) : null;
    R(MX, cy - 2, 4, 30, '#26232e'); R(MX + (side < 0 ? 4 : -1), cy, 1, 26, pcc || (n % 2 ? '#69b2ee' : '#7cc47a'));
    R(side < 0 ? MX - 4 : MX + 4, cy + 12, 4, 6, '#3a3d46');
    const KX = side < 0 ? b.X + 18 : b.X + 14;                                                      // Tastatur + Maus
    R(KX, cy + 6, 8, 22, '#3a3d46'); for (let j = 0; j < 5; j++) R(KX + 2, cy + 8 + j * 4, 4, 1, '#555c68');
    R(KX + (side < 0 ? 1 : 2), cy + 32, 5, 7, '#3a3d46'); px(KX + 3, cy + 33, '#9aa2ab');
    ctx.strokeStyle = '#e8853a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(SX + 11, cy); ctx.quadraticCurveTo(SX + 11 - side * 6, cy + 10, MX + 2, cy + 6); ctx.stroke();
  });
}
function rmSitSide(i, x, y, side) {            // sitzender Azubi im Profil, Blick zur Wand (side -1 links, +1 rechts)
  const k = RKIDS[i % 12], X = sx(x), Y = sy(y), s = side;
  softShadow(X, Y, 12, 3);
  // Bürostuhl
  R(X - 2, Y - 6, 3, 6, '#3a3d46'); R(X - 8, Y - 2, 16, 2, '#26232e');
  R(X - 9, Y - 16, 16, 5, '#3a3d46'); R(X - s * 9 - 2, Y - 36, 4, 22, '#3a3d46');
  // Beine: Oberschenkel nach vorn, Unterschenkel runter
  R(s < 0 ? X - 14 : X, Y - 20, 14, 6, '#3a3f55'); R(s < 0 ? X - 15 : X + 10, Y - 16, 5, 14, '#3a3f55'); R(s < 0 ? X - 18 : X + 10, Y - 3, 8, 3, '#26232e');
  // Oberkörper
  const jc = k.jacket;
  rr(X - 7, Y - 38, 14, 20, jc, 3); R(X - 7, Y - 30, 14, 2, k.accent); R(s < 0 ? X - 7 : X + 5, Y - 36, 2, 16, shade(jc, -0.2));
  R(s < 0 ? X - 16 : X + 4, Y - 32, 12, 4, jc); R(s < 0 ? X - 18 : X + 14, Y - 32, 4, 4, k.skin);       // Arm zur Tastatur
  drawHead(k, X - 8 + s * 2, Y - 54, 1, s, '');
}
function drawBigMPS(x, y) {                    // große Automatisierungsanlage (Stationen auf Profiltischen, Band im Kreis)
  const w = 5.2, d = 3.6;
  softShadow(sx(x) + w * T / 2, sy(y + d) + 4, w * T / 2 + 8, 8);
  const b = box(x, y, w, d, 26, '#c9ccd1', '#9aa2ab', '#7d8590');
  const PL = typeof isLab === 'function' && isLab() && G && G.plant ? G.plant : null, stop = PL && PL.estop;
  const speed = PL ? (stop ? 0 : PL.cur && PL.cur.job && PL.cur.job.stage === 'run' ? 30 : 6) : 22;
  for (let i = 0; i < 8; i++) R(b.X + 2, b.Y + 4 + i * 14, b.W - 4, 1, '#b9bec5');                  // Profilnuten
  for (let i = 0; i < 4; i++) R(b.X + 4 + i * (b.W - 8) / 3, b.front + 2, 3, 22, '#7d8590');
  // Band als Rundlauf
  const bx = b.X + 20, by = b.Y + 20, bw = b.W - 40, bh = b.D - 40;
  R(bx, by, bw, 10, '#3a3d46'); R(bx, by + bh - 10, bw, 10, '#3a3d46'); R(bx, by, 10, bh, '#3a3d46'); R(bx + bw - 10, by, 10, bh, '#3a3d46');
  const perim = 2 * (bw + bh) - 40;
  for (let n = 0; n < 5; n++) {                                                                       // Werkstücke fahren im Kreis
    let p = ((PL ? (PL.belt = (PL.belt || 0) + speed / 600) * 10 : clockT * speed) + n * perim / 5) % perim, px0, py0;
    if (p < bw - 10) { px0 = bx + p; py0 = by + 1; }
    else if ((p -= bw - 10) < bh - 10) { px0 = bx + bw - 10; py0 = by + p; }
    else if ((p -= bh - 10) < bw - 10) { px0 = bx + bw - 10 - p; py0 = by + bh - 10; }
    else { p -= bw - 10; px0 = bx; py0 = by + bh - 10 - p; }
    R(px0 + 1, py0 + 1, 8, 8, ['#d94a3a', '#2f6db5', '#c9ccd1', '#26232e', '#d94a3a'][n]); R(px0 + 1, py0 + 1, 8, 2, 'rgba(255,255,255,.35)');
  }
  // Stationen innen: Magazin, Prüfen, Bearbeiten, Sortieren
  const ix = bx + 18, iy = by + 18;
  R(ix, iy - 24, 14, 34, '#e2e4e6'); R(ix + 2, iy - 22, 10, 30, 'rgba(160,210,240,.5)'); for (let i = 0; i < 4; i++) R(ix + 3, iy - 4 - i * 6, 8, 5, ['#d94a3a', '#2f6db5', '#c9ccd1', '#d94a3a'][i]);
  R(ix + 30, iy - 4, 24, 14, '#2f6db5'); R(ix + 54, iy, 10 + Math.round(Math.sin(clockT * 3) * 4 + 4), 4, '#c9ccd1');        // Pneumatikzylinder
  R(ix + 80, iy - 18, 6, 28, '#9aa2ab'); R(ix + 74, iy - 20, 22, 8, '#555c68'); R(ix + 82, iy - 12 + Math.round(Math.abs(Math.sin(clockT * 2)) * 8), 4, 8, '#c9ccd1');   // Bohrstation
  for (let i = 0; i < 3; i++) { R(ix + 108 + i * 10, iy - 2, 8, 22, '#d6d9dc'); R(ix + 108 + i * 10, iy + 18, 8, 3, ['#d94a3a', '#2f6db5', '#c9ccd1'][i]); }   // Rutschen
  // Signalsäulen + Bedienpulte
  for (const [sx1, sy1] of [[b.X + 10, b.Y - 4], [b.X + b.W - 16, b.Y - 4]]) {
    R(sx1 + 2, sy1 - 26, 2, 26, '#9aa2ab');
    const red = stop ? blink(4) : !PL && blink(2, sx1), green = PL ? !stop && PL.cur : blink(1, sx1);
    R(sx1, sy1 - 40, 6, 5, red ? '#d94a3a' : '#5a2a2a'); R(sx1, sy1 - 35, 6, 5, PL && PL.queue.length && !PL.cur ? '#f2c14e' : '#7a6a2a'); R(sx1, sy1 - 30, 6, 5, green ? '#7cc47a' : '#2a4a2a');
  }
  R(b.X + b.W / 2 - 16, b.Y + b.D - 14, 32, 12, '#3a3d46'); R(b.X + b.W / 2 - 12, b.Y + b.D - 12, 12, 6, '#69b2ee'); rmEstop(b.X + b.W / 2 + 8, b.Y + b.D - 8);
}
function drawLab() {
  const S = rmShell(20, 10, { wall: '#eef0f1', wallLow: '#dfe3e6', base: '#8a9099', side: '#3c4048', floor: labFloor });
  labWall2(S.wy);
  labSideWalls();
  const list = [];
  list.push({ y: 0.9, f: () => {                                                         // Tisch mit Drucker (oben links)
    const b = box(0.4, 0.15, 3.4, 0.75, 18, '#eceeef', '#9aa2ab', '#7d8590');
    R(b.X + 6, b.Y - 18, 40, 26, '#d6d6dc'); R(b.X + 6, b.Y - 18, 40, 3, '#ececf0'); R(b.X + 10, b.Y - 10, 28, 6, '#3f424b'); R(b.X + 12, b.Y - 8, 24, 2, COL.white); R(b.X + 36, b.Y - 16, 8, 5, '#4f8fc9');
    R(b.X + 54, b.Y - 2, 26, 14, COL.white); R(b.X + 56, b.Y - 4, 24, 14, '#f4f4ee');
    draw3DPrinterAt(b.X + 84, b.Y + 6);
  } });
  list.push({ y: 2.6, f: () => {                                                         // Lehrerpult
    const b = box(5.2, 1.6, 5.4, 1.0, 20, '#eceeef', '#9aa2ab', '#7d8590');
    R(b.X + 20, b.Y - 18, 28, 20, '#26232e'); R(b.X + 22, b.Y - 16, 24, 14, '#2b3a4a'); R(b.X + 52, b.Y - 18, 28, 20, '#26232e'); R(b.X + 54, b.Y - 16, 24, 14, '#69b2ee');
    R(b.X + 30, b.Y + 6, 34, 6, '#3a3d46'); R(b.X + 100, b.Y + 4, 30, 20, '#9aa2ab'); R(b.X + 104, b.Y + 8, 22, 6, '#3a3d46'); R(b.X + 160, b.Y + 6, 8, 8, COL.white);
  } });
  list.push({ y: 9.6, f: () => drawWallDesk(-1) });
  list.push({ y: 9.6, f: () => drawWallDesk(1) });
  list.push({ y: 7.6, f: () => drawBigMPS(7.4, 3.9) });
  list.push({ y: 10.0, f: () => drawConveyor(3.0, 9.2, 3.2) });
  list.push({ y: 10.0, f: () => { for (let i = 0; i < 3; i++) { const b = box(11.4 + i * 1.3, 9.3, 1.2, 0.7, 34, '#d6d9dc', '#b9bec5', '#9aa2ab'); R(b.X + 4, b.Y + 4, b.W - 8, 2, '#9aa2ab'); } } });   // Schränke links neben der Tür
  const rp = robotPos(); list.push({ y: rp[1], f: () => drawMobileRobot(rp[0], rp[1]) });
  // Azubis: je Seite 3 Paare, Blick zur Wand
  let n = 0;
  for (const side of [-1, 1]) for (const y of LAB_PAIRS.flat()) { const i = n++; list.push({ y, f: () => rmSitSide(i, side < 0 ? 2.15 : 17.85, y, side) }); }
  list.push({ y: 3.1, f: () => rmTeacher(8.6, 3.1) });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  { const dm = sx(16.1); R(dm, sy(9.35), 56, 18, '#6b6f78'); R(dm + 3, sy(9.35) + 3, 50, 12, '#858a94'); for (let i = 0; i < 8; i++) R(dm + 5 + i * 6, sy(9.35) + 5, 3, 8, '#767b85'); }   // Fußmatte
  rmDoor(15.9, 10);                                                                                  // Tür vorne
  // kühles LED-Licht
  ctx.fillStyle = 'rgba(220,240,255,.07)'; ctx.fillRect(OX, OY, 20 * T, 10 * T);
  for (const x of [5, 10, 15]) { const g = ctx.createRadialGradient(sx(x), sy(5), 10, sx(x), sy(5), 170); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(sx(x) - 170, sy(5) - 170, 340, 340); }
}
function drawMobileRobot(x, y) {               // kleiner Fahrroboter: runde Basis, Profilsäule, Band oben, Signalsäule, Not-Aus
  const X = sx(x), Y = sy(y);
  softShadow(X, Y + 2, 18, 5, 0.25);
  ctx.fillStyle = '#9aa2ab'; ctx.beginPath(); ctx.ellipse(X, Y - 6, 18, 8, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#eceeef'; ctx.beginPath(); ctx.ellipse(X, Y - 10, 17, 7, 0, 0, 7); ctx.fill();
  R(X - 17, Y - 10, 34, 5, '#d6d9dc'); R(X - 6, Y - 9, 6, 3, '#26232e'); R(X + 6, Y - 9, 4, 3, '#3d7fc4');
  R(X - 3, Y - 54, 6, 44, '#c9ccd1'); R(X - 3, Y - 54, 2, 44, '#e6e8ea');                           // Säule
  R(X - 16, Y - 60, 32, 6, '#c9ccd1'); R(X - 14, Y - 66, 28, 6, '#3a3d46');                          // Band oben
  const off = Math.round((clockT * 10) % 8); for (let i = 0; i < 4; i++) R(X - 13 + ((i * 8 + off) % 26), Y - 65, 2, 4, '#555c68');
  R(X - 22, Y - 74, 5, 18, '#3a3d46'); R(X - 22, Y - 80, 5, 3, blink(1.5) ? '#7cc47a' : '#2a4a2a'); R(X - 22, Y - 83, 5, 3, '#7a6a2a'); R(X - 22, Y - 86, 5, 3, '#5a2a2a');
  R(X + 10, Y - 76, 6, 10, '#c9ccd1'); disc(X + 13, Y - 78, 3, '#d94a3a');                           // Not-Aus
}
function robotPos() {                          // fährt hin und zurück: rechts oben → um die Anlage links herum → vorne bis vor die Schränke
  const P = [[15.4, 3.4], [6.6, 3.4], [6.6, 8.9], [10.6, 8.9]];
  const L = P.slice(1).map((q, i) => Math.hypot(q[0] - P[i][0], q[1] - P[i][1])), tot = L.reduce((a, b) => a + b, 0);
  let d = (clockT * 0.9) % (2 * tot); if (d > tot) d = 2 * tot - d;
  for (let i = 0; i < L.length; i++) { if (d <= L[i]) { const f = d / L[i]; return [P[i][0] + (P[i + 1][0] - P[i][0]) * f, P[i][1] + (P[i + 1][1] - P[i][1]) * f]; } d -= L[i]; }
  return P[P.length - 1];
}
function draw3DPrinterAt(X, Y) { R(X, Y - 26, 20, 26, '#3a3d46'); R(X + 2, Y - 22, 16, 18, 'rgba(190,225,245,.4)'); R(X + 4 + Math.round((Math.sin(clockT * 2) + 1) * 5), Y - 20, 4, 3, '#f29a4e'); R(X + 4, Y - 8, 12, 3, '#7cc47a'); }

/* ===================================================== Wege-Prüfung
   Stellflächen (x0, y0, x1, y1 in Feldern) und Ziele je Raum. Taste P zeigt die Prüfung als Overlay. */
const kidBox = (x, y) => [x - 0.3, y - 0.35, x + 0.3, y];
const seatBox = (x, y, side) => side < 0 ? [x - 0.7, y - 0.45, x + 0.5, y + 0.05] : [x - 0.5, y - 0.45, x + 0.7, y + 0.05];
const ROOM_DIMS = { 1: { w: 20, h: 10 }, 2: { w: 30, h: 13 }, 3: { w: 20, h: 10 } };
const ROOM_LAYOUT = {
  1: { start: [9.4, 1.95], blocks: [
      ['Meisterpult', 1.4, 0.2, 4.4, 1.3], ['Werkzeugschrank', 0.3, 3.9, 1.9, 4.6], ['Drehmaschine 1', 14.9, 1.9, 19.3, 3.0], ['Drehmaschine 2', 14.9, 5.4, 19.3, 6.5],
      ['Fräse', 10.6, 2.1, 12.9, 3.6], ['Bohrmaschine', 12.3, 7.0, 13.5, 7.8], ['Werkbank 1', 4.4, 2.4, 10.2, 3.25], ['Werkbank 2', 4.4, 5.0, 10.2, 5.85], ['Werkbank 3', 4.4, 7.6, 10.2, 8.45],
      ['Ausgabe', 0.2, 8.8, 2.4, 9.7], ['Feuerlöscher', 19.4, 9.2, 19.8, 9.7]],
    kids: [[5.4, 3.75], [7.3, 3.75], [9.2, 3.75], [5.4, 6.35], [7.3, 6.35], [9.2, 6.35], [6.3, 8.95], [8.3, 8.95], [16.3, 3.9], [16.3, 7.4], [11.8, 4.5], [11.7, 7.7]],
    stations: [['Tafel', [6.6, 0.4, 12.6, 0.5]], ['Ausgabe (Kopierer)', [0.2, 8.8, 2.4, 9.7]], ['Pult', [1.4, 0.2, 4.4, 1.3]], ['Tür', [16.6, 9.95, 18.6, 10]]] },
  2: { start: [13.4, 5.7], blocks: [
      ['Motorregal', 1.0, 0.0, 6.8, 1.0], ['Hochregal', 0.1, 0.0, 1.4, 5.9], ['Hydraulik 1', 8.9, 0.5, 10.8, 0.95], ['Hydraulik 2', 11.0, 0.5, 12.9, 0.95], ['Hydraulik 3', 14.0, 0.5, 15.9, 0.95], ['Hydraulik 4', 16.1, 0.5, 18.0, 0.95],
      ['Büro', 24.2, 0.3, 29.8, 4.5], ['Drucker', 24.6, 4.8, 26.2, 5.6], ['Tonnen', 27.4, 5.1, 28.4, 5.8], ['Radlader', 22.1, 10.2, 29.6, 11.9],
      ['Motor (längs)', 13.2, 9.4, 16.1, 10.05], ['Motor (Stirnseite)', 19.75, 6.5, 21.4, 7.05], ['Werkzeugwagen', 16.6, 9.8, 18.2, 10.6],
      ['Elektrowand 1', 1.6, 9.6, 4.4, 9.95], ['Elektrowand 2', 7.0, 9.6, 9.8, 9.95], ['Mobile Tafel', 10.3, 4.75, 13.0, 5.05], ['Smartboard', 6.6, 3.8, 9.7, 4.05], ['Feuerlöscher', 29.4, 8.7, 29.8, 9.4]],
    kids: [[9.8, 1.9], [11.9, 1.9], [14.9, 1.9], [17.0, 1.9], [2.5, 10.7], [4.0, 10.7], [7.9, 10.7], [9.4, 10.7], [12.7, 10.3], [19.1, 7.5], [21.0, 11.6], [22.3, 12.4]],
    stations: [['Tafel', [10.3, 4.75, 13.0, 5.05]], ['Drucker', [24.6, 4.8, 26.2, 5.6]], ['Notausgang', [0, 7.2, 0.05, 9.0]]] },
  3: { start: [8.6, 3.1], blocks: [
      ['Druckertisch', 0.4, 0.15, 3.8, 0.9], ['Lehrerpult', 5.2, 1.6, 10.6, 2.6], ['Reihe links', 0.1, 2.4, 1.4, 9.6], ['Reihe rechts', 18.6, 2.4, 19.9, 9.6],
      ['Anlage', 7.4, 3.9, 12.6, 7.5], ['Kleine Anlage', 3.0, 9.2, 6.2, 9.9], ['Schränke', 11.4, 9.3, 15.3, 10.0]],
    kids: [], seats: [],
    stations: [['Tafel', [4.6, 0.0, 11.8, 0.05]], ['Drucker', [0.4, 0.15, 3.8, 0.9]], ['Tür hinten', [18.1, 0.0, 19.4, 0.05]], ['Tür vorne', [15.9, 9.95, 17.9, 10]]] },
};
for (const side of [-1, 1]) for (const y of LAB_PAIRS.flat()) ROOM_LAYOUT[3].seats.push(seatBox(side < 0 ? 2.15 : 17.85, y, side));

function checkPaths(idx) {                     // Flutfüllung ab der Startposition der Lehrkraft
  const L = ROOM_LAYOUT[idx], RmD = ROOM_DIMS[idx], r = CONFIG.player.radius, reach = CONFIG.player.reach, g = 0.05;
  const boxes = L.blocks.map(b => ({ name: b[0], b: b.slice(1) }))
    .concat((L.kids || []).map((k, i) => ({ name: 'Azubi ' + (i + 1), b: kidBox(k[0], k[1]), kid: true })))
    .concat((L.seats || []).map((b, i) => ({ name: 'Azubi ' + (i + 1), b, kid: true })));
  const W = Math.round(RmD.w / g), H = Math.round(RmD.h / g), free = new Uint8Array(W * H), seen = new Uint8Array(W * H);
  const d2b = (x, y, b) => { const cx = clamp(x, b[0], b[2]), cy = clamp(y, b[1], b[3]); return Math.hypot(x - cx, y - cy); };
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = (i + 0.5) * g, y = (j + 0.5) * g;
    if (x < r || x > RmD.w - r || y < 0.35 || y > RmD.h - r) continue;
    if (boxes.every(o => d2b(x, y, o.b) >= r)) free[j * W + i] = 1;
  }
  const q = [], s0 = Math.floor(L.start[1] / g) * W + Math.floor(L.start[0] / g);
  if (free[s0]) { q.push(s0); seen[s0] = 1; }
  while (q.length) { const c = q.pop(), i = c % W, j = (c / W) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue; const n = nj * W + ni; if (free[n] && !seen[n]) { seen[n] = 1; q.push(n); } } }
  const reachable = b => { for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (seen[j * W + i] && d2b((i + 0.5) * g, (j + 0.5) * g, b) <= reach) return true; return false; };
  const targets = boxes.filter(o => o.kid).map(o => ({ name: o.name, b: o.b })).concat(L.stations.map(([name, b]) => ({ name, b })));
  const res = targets.map(t => ({ name: t.name, ok: reachable(t.b), b: t.b }));
  return { res, seen, free, W, H, g, boxes };
}
function drawPathOverlay(idx) {
  const P = checkPaths(idx);
  for (let j = 0; j < P.H; j++) for (let i = 0; i < P.W; i++) {
    const c = P.seen[j * P.W + i] ? 'rgba(80,200,90,.28)' : P.free[j * P.W + i] ? 'rgba(240,180,40,.35)' : null;
    if (c) { ctx.fillStyle = c; ctx.fillRect(OX + i * P.g * T, OY + j * P.g * T, P.g * T + 0.5, P.g * T + 0.5); }
  }
  ctx.strokeStyle = 'rgba(220,40,40,.9)'; ctx.lineWidth = 1;
  for (const o of P.boxes) ctx.strokeRect(sx(o.b[0]) + 0.5, sy(o.b[1]) + 0.5, (o.b[2] - o.b[0]) * T, (o.b[3] - o.b[1]) * T);
  for (const t of P.res) if (!t.ok) { ctx.fillStyle = 'rgba(255,0,80,.6)'; ctx.fillRect(sx(t.b[0]) - 2, sy(t.b[1]) - 2, (t.b[2] - t.b[0]) * T + 4, (t.b[3] - t.b[1]) * T + 4); }
  return P.res;
}


/* ================================================ Spiel: SPS-Labor */
let labBgCanvas = null;
function labBackground() {
  if (labBgCanvas) return labBgCanvas;
  labBgCanvas = document.createElement('canvas'); labBgCanvas.width = SW; labBgCanvas.height = SH;
  const real = ctx; ctx = labBgCanvas.getContext('2d');
  const S = rmShell(20, 10, { wall: '#eef0f1', wallLow: '#dfe3e6', base: '#8a9099', side: '#3c4048', floor: labFloor });
  labWall2(S.wy); labSideWalls();
  { const dm = sx(16.1); R(dm, sy(9.35), 56, 18, '#6b6f78'); R(dm + 3, sy(9.35) + 3, 50, 12, '#858a94'); for (let i = 0; i < 8; i++) R(dm + 5 + i * 6, sy(9.35) + 5, 3, 8, '#767b85'); }
  ctx = real;
  return labBgCanvas;
}
function drawLabBoard() {                      // Beamer-Bildschirm: aktuelle Aufgabe, Vorrat, Ladebalken
  const wy = OY - WALL_H, X = sx(7.4), Y = wy + 4, W = 4.4 * T, H = 48;
  R(X, Y, W, H, '#2b3a4a');
  if (G.exam) {
    ltext(examName().toUpperCase().replace('Ü', 'UE'), X + 6, Y + 5, '#f2c14e', 1);
    ltext('RUHE BITTE  KEIN SPICKEN', X + 6, Y + 17, COL.chalk, 1);
    const left = Math.max(0, Math.ceil(CONFIG.lessonSeconds - G.t));
    ltext('NOCH ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'), X + 6, Y + 31, '#9fd39a', 2);
    return;
  }
  const lv = labLevel(), lines = G.subject.lines;
  ltext('PROJEKT: ' + lines[0], X + 6, Y + 5, '#9fd3f0', 1);
  for (let i = 1; i < lines.length; i++) ltext(lines[i], X + 6, Y + 6 + i * 9, COL.chalk, 1);
  for (let i = 0; i < 3; i++) {                                                                  // Stufe: drei Balken
    const on = i <= G.formIdx, c = ['#7cc47a', '#f2c14e', '#e8534a'][G.formIdx];
    R(X + W - 40 + i * 9, Y + 22 - i * 5, 7, 8 + i * 5, on ? c : '#3a3d46');
  }
  ltext(lv.name, X + W - 46, Y + 5, ['#7cc47a', '#f2c14e', '#e8534a'][G.formIdx], 1);
  if (G.writing) {                             // Umschalten
    R(X + 4, Y + H - 8, W - 8, 4, '#1a2430'); R(X + 4, Y + H - 8, Math.round((W - 8) * Math.min(1, G.writeProg)), 4, '#9fd3f0');
    ltext('-> ' + CONFIG.forms[G.formSel].name, X + W - 60, Y + H - 16, '#9fd3f0', 1);
  } else if (G.labPause > 0) {
    R(X, Y, W, H, 'rgba(20,28,38,.75)'); ltext('BEAMER LAEDT ...', X + 20, Y + 20, blink(3) ? '#9fd3f0' : COL.chalk, 1);
  }
  // Beamer-Lichtkegel
  ctx.fillStyle = 'rgba(200,230,255,.05)'; ctx.beginPath(); ctx.moveTo(sx(9.6) + 6, wy + 20); ctx.lineTo(X, Y + H); ctx.lineTo(X + W, Y + H); ctx.fill();
}
function drawLabPrinterTable() {               // Drucker oben links (Station „Kopierer“)
  const C = G.copier, CC = CONFIG.copier;
  const b = box(0.4, 0.15, 3.4, 0.75, 18, '#eceeef', '#9aa2ab', '#7d8590');
  const sh = C.shake > 0 ? Math.round(rand(-1, 1)) : 0, X = b.X + 6 + sh, Y = b.Y - 22;
  if ((C.tray > 0 && blink(3)) || (C.jam && blink(5))) { ctx.fillStyle = C.jam ? 'rgba(232,83,74,.5)' : 'rgba(247,209,84,.5)'; ctx.fillRect(X - 4, Y - 4, 52, 36); }
  R(X, Y, 44, 30, '#d6d6dc'); R(X, Y, 44, 3, '#ececf0'); R(X + 4, Y + 6, 26, 6, '#3f424b');
  for (let i = 0; i < Math.min(C.tray, 6); i++) R(X + 6, Y + 10 - i * 1, 22, 1, i % 2 ? '#f0ece4' : COL.white);
  const warming = C.printing && C.warm < CC.warmup;
  const scr = C.jam ? (blink(5) ? PAL.red : '#7a2a2a') : warming ? PAL.orange : C.cool > 0 ? '#7fb3e0' : C.printing ? '#7cc47a' : '#4f8fc9';
  R(X + 32, Y + 5, 9, 6, scr);
  R(X + 2, Y + 16, 40, 5, '#e2e2e8'); R(X + 2, Y + 23, 40, 5, '#e2e2e8');
  if (C.printing && !warming && !C.jam) { const sl = Math.round((C.t / CC.printEvery) * 20); R(X + 28 - sl, Y + 8, sl + 2, 2, COL.white); }
  if (C.cool > 0) for (let i = 0; i < 3; i++) { const ph = (clockT * 0.8 + i / 3) % 1; R(X + 8 + i * 12, Y - 4 - ph * 16, 2, 3, `rgba(255,255,255,${(0.7 * (1 - ph)).toFixed(2)})`); }
  if (C.jam) { R(X - 6, Y + 8, 8, 6, COL.white); R(X - 8, Y + 10, 4, 4, '#e6e1d6'); }
  if (has('netprint')) { R(X + 40, Y - 16, 2, 16, '#3a3d46'); disc(X + 41, Y - 17, 2, blink(1.5) ? '#7cc47a' : '#3a5a3a'); }
  R(b.X + 58, b.Y - 2, 26, 14, COL.white); R(b.X + 60, b.Y - 4, 24, 14, '#f4f4ee');               // Papierstapel
  draw3DPrinterAt(b.X + 84, b.Y + 6);
}
function drawLabPult() {                       // Lehrerpult mit Monitoren und Ablage
  const b = box(5.2, 1.6, 5.4, 1.0, 20, '#eceeef', '#9aa2ab', '#7d8590');
  R(b.X + 20, b.Y - 18, 28, 20, '#26232e'); R(b.X + 22, b.Y - 16, 24, 14, '#2b3a4a'); R(b.X + 52, b.Y - 18, 28, 20, '#26232e'); R(b.X + 54, b.Y - 16, 24, 14, '#69b2ee');
  R(b.X + 30, b.Y + 6, 34, 6, '#3a3d46'); R(b.X + 100, b.Y + 4, 30, 20, '#9aa2ab'); R(b.X + 104, b.Y + 8, 22, 6, '#3a3d46');
  const ax = sx(8.9), ay = b.Y + 6;                                                                  // Ablage
  if (upLevel('pult')) { R(ax - 2, ay - 2, 26, 18, '#9aa2ab'); }
  R(ax, ay, 22, 14, '#555c68');
  for (let i = 0; i < Math.min(G.stash, 8); i++) R(ax + 1, ay + 11 - i * 2, 20, 2, i % 2 ? '#f0ece4' : COL.white);
  if (G.stash > 0) ptext(G.stash + '/' + CONFIG.deskStashMax, ax + 26, ay + 2, COL.white, PAL.dark, 2);
  if (has('gong')) { const used = !(G.gongLeft > 0); disc(b.X + 150, b.Y + 22, 6, used ? '#8a7a4a' : '#c9a43e'); }
}
function drawLabKid(k) {                       // sitzender Azubi im Profil, Zustände wie im Klassenraum
  const X = sx(k.x), Y = sy(k.y), s = k.side, t = clockT, st = k.state;
  softShadow(X, Y, 12, 3);
  R(X - 2, Y - 6, 3, 6, '#3a3d46'); R(X - 8, Y - 2, 16, 2, '#26232e');
  R(X - 9, Y - 16, 16, 5, '#3a3d46'); R(X - s * 9 - 2, Y - 36, 4, 22, '#3a3d46');
  if (!isSeated(k)) return;
  let jit = 0, oy = 0, turn = 1, mood = '', fs = s;
  if (st === 'fidget' || st === 'wc') jit = Math.floor(t * 9 + k.phase) % 2 ? 1 : -1;
  if (st === 'idle' || st === 'net' || st === 'test') turn = 2;
  if (st === 'loud') { turn = 2; mood = 'open'; oy = -6 - Math.abs(Math.round(Math.sin(t * 12 + k.phase) * 3)); }
  if (st === 'phone') { turn = 2; mood = 'smile'; }
  if (st === 'cheat') fs = -s;
  if (G && G.laughT > 0 && (st === 'work' || st === 'fidget')) { turn = 2; mood = 'laugh'; }
  if (k.annoyed > 0) turn = 2;
  const bx = X + jit;
  R(s < 0 ? bx - 14 : bx, Y - 20, 14, 6, '#3a3f55'); R(s < 0 ? bx - 15 : bx + 10, Y - 16, 5, 14, '#3a3f55'); R(s < 0 ? bx - 18 : bx + 10, Y - 3, 8, 3, '#26232e');
  const jc = k.jacket;
  rr(bx - 7, Y - 38 + oy, 14, 20, jc, 3); R(bx - 7, Y - 30 + oy, 14, 2, k.accent); R(s < 0 ? bx - 7 : bx + 5, Y - 36 + oy, 2, 16, shade(jc, -0.2));
  if (st === 'loud') { R(bx - 11, Y - 46 + oy, 4, 12, jc); R(bx + 7, Y - 46 + oy, 4, 12, jc); }
  else { R(s < 0 ? bx - 16 : bx + 4, Y - 32 + oy, 12, 4, jc); R(s < 0 ? bx - 18 : bx + 14, Y - 32 + oy, 4, 4, k.skin); }
  if (st === 'phone' || st === 'phoneSoon') { R(bx - 2, Y - 34, 5, 8, PAL.dark); R(bx - 1, Y - 33, 3, 5, '#9fd3f0'); }
  drawHead(k, bx - 8 + (turn === 1 ? fs * 2 : 0), Y - 54 + oy, turn, fs, mood);
  if (has('helper') && k.i === 0) sash(bx, Y + oy - 6);
}
function drawLabRobot() {
  const R0 = G.robot;
  if (!R0) return;
  drawMobileRobot(R0.x, R0.y);
  if (R0.carry) { R(sx(R0.x) - 7, sy(R0.y) - 74, 14, 9, COL.white); R(sx(R0.x) - 5, sy(R0.y) - 71, 10, 1, '#9fd3f0'); }
  if (!has('robot')) ltext('LAEDT', sx(R0.x) - 9, sy(R0.y) + 4, '#7cc47a', 1);
}
function renderLabWorld() {
  ctx.drawImage(labBackground(), 0, 0);
  drawLabBoard();
  drawPresence();
  const list = [
    { y: 0.9, f: drawLabPrinterTable }, { y: 2.6, f: drawLabPult },
    { y: 9.6, f: () => drawWallDesk(-1) }, { y: 9.6, f: () => drawWallDesk(1) },
    { y: 7.6, f: () => drawBigMPS(7.4, 3.9) }, { y: 10.0, f: () => drawConveyor(3.0, 9.2, 3.2) },
    { y: 10.0, f: () => { for (let i = 0; i < 3; i++) { const b = box(11.4 + i * 1.3, 9.3, 1.2, 0.7, 34, '#d6d9dc', '#b9bec5', '#9aa2ab'); R(b.X + 4, b.Y + 4, b.W - 8, 2, '#9aa2ab'); } } },
  ];
  if (G.robot) list.push({ y: G.robot.y, f: drawLabRobot });
  for (const k of G.kids) {
    list.push({ y: k.y, f: () => drawLabKid(k) });
    if (k.state === 'walk') list.push({ y: k.wy, f: () => drawWalker(k) });
  }
  list.push({ y: G.p.y, f: drawTeacher });
  if (G.npc) list.push({ y: G.npc.y, f: drawNpc });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  if (has('labtidy')) {                                                  // Ausbau: LED-Leiste an der Wand, Kabelkanäle an den Reihen
    const wy = OY - WALL_H; R(OX, wy + 1, 20 * T, 3, blink(0.5) ? '#7fd3ff' : '#9fe0ff'); ctx.fillStyle = 'rgba(127,211,255,.08)'; ctx.fillRect(OX, wy + 4, 20 * T, 16);
    for (const x of [1.45, 18.45]) { R(sx(x), sy(2.4), 4, 7.2 * T, '#e6e8ea'); R(sx(x) + 1, sy(2.4), 1, 7.2 * T, '#c9ccd1'); }
  }
  // Türen: vorne (geöffnet = heller Spalt)
  rmDoor(15.9, 10);
  if (G.doorOpen > 0) R(sx(15.9), OY + RH * T + 1, 64, 15, '#e8d8b8');
  // kühles LED-Licht
  ctx.fillStyle = 'rgba(220,240,255,.07)'; ctx.fillRect(OX, OY, 20 * T, 10 * T);
  for (const x of [5, 10, 15]) { const g = ctx.createRadialGradient(sx(x), sy(5), 10, sx(x), sy(5), 170); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(sx(x) - 170, sy(5) - 170, 340, 340); }
  if (G.netDown) { ctx.fillStyle = 'rgba(30,30,50,.12)'; ctx.fillRect(OX, OY, 20 * T, 10 * T); }
}
function drawLabOverlay() {
  const P = G.plant;
  if (!P) return;
  if (P.estop) bubble(sx(10), sy(3.9) - 66 + (blink(6) ? -2 : 0), PAL.red, 1, '!', COL.white, 13);
  else if (P.cur && P.cur.job && P.cur.job.stage === 'run') {
    const X = sx(10), Y = sy(3.9) - 22, helping = G.labHold && G.labHold.kind === 'help';         // auf der Anlage, hinterer Rand
    rr(X - 46, Y, 92, 12, PAL.dark, 2); R(X - 44, Y + 2, Math.round(88 * Math.min(1, P.t / (P.dur || labLevel().dur))), 8, helping ? '#9fd39a' : '#5cc8c0');
    ltext(helping ? 'HILFE X2.5' : 'TEST', X - (helping ? 19 : 8), Y + 3, COL.white, 1);
    if (!helping && atPlant()) ptext('E HALTEN = HELFEN', X, sy(7.5) + 6, COL.white, PAL.dark, 1);
  }
  const P2 = G.plant2;
  if (P2 && has('plant2') && P2.cur && P2.cur.job && P2.cur.job.stage === 'run') {     // zweite Teststation (kleine Anlage)
    const X = sx(4.6), Y = sy(9.2) - 44;
    rr(X - 30, Y, 60, 10, PAL.dark, 2); R(X - 28, Y + 2, Math.round(56 * Math.min(1, P2.t / (P2.dur || labLevel().dur))), 6, '#5cc8c0');
    ltext('TEST 2', X - 12, Y + 2, COL.white, 1);
  }
  if (G.netDown) bubble(sx(15.8), OY - 50 + (blink(4) ? -2 : 0), PAL.red, G.labHold && G.labHold.kind === 'net' ? G.labHold.t / CONFIG.lab.net.hold : 1, 'NET', COL.white, 16);
  if (G.robot && G.robot.stuck) bubble(sx(G.robot.x), sy(G.robot.y) - 100, '#9fd3f0', 1, '!', COL.white, 10);
}


/* ================================================= Spiel: Praxishalle */
let hallCv = null, hallBgCanvas = null;
const hallCam = { x: 0, y: 0 };
function hallCanvas() {
  const W = OX * 2 + 30 * T, H = OY + 13 * T + 40;
  if (!hallCv) { hallCv = document.createElement('canvas'); hallCv.width = W; hallCv.height = H; }
  return hallCv;
}
function hallBackground() {
  if (hallBgCanvas) return hallBgCanvas;
  const W = OX * 2 + 30 * T, H = OY + 13 * T + 40;
  hallBgCanvas = document.createElement('canvas'); hallBgCanvas.width = W; hallBgCanvas.height = H;
  const real = ctx; ctx = hallBgCanvas.getContext('2d');
  const S = rmShell(30, 13, { wall: '#e2e5e8', side: '#4a525c', base: '#7a838e', floor: hallFloor });
  hallWall(S.wy);
  { const L = OX - 16, Y = sy(7.2); R(L, Y, 16, 1.8 * T, '#d6d9dc'); R(L + 2, Y + 2, 12, 1.8 * T - 4, '#eceeef'); R(L + 10, Y + 26, 3, 6, '#9aa2ab'); rmSign(OX + 14, Y - 8, 'exit'); }
  ctx = real;
  return hallBgCanvas;
}
function drawHallKid(k) {                      // Azubi an der Station (stehend), Zustände wie im Klassenraum
  if (!isSeated(k)) return;
  const st = k.state, t = clockT;
  let jit = 0, oy = 0, face = k.face;
  if (st === 'fidget' || st === 'wc' || st === 'wcq') jit = Math.floor(t * 9 + k.phase) % 2 ? 1 : -1;
  if (['idle', 'loud', 'phone', 'mat', 'check', 'leak', 'net', 'break'].includes(st) || k.annoyed > 0) face = 'down';
  if (st === 'loud') oy = -Math.abs(Math.round(Math.sin(t * 12 + k.phase) * 4));
  let X = k.x, Y = k.y;
  if (st === 'climb') { ctx.save(); ctx.translate(28, -40); }
  ctx.save(); ctx.translate(jit, oy);
  k.wx = X; k.wy = Y; const f0 = k.face; k.face = face; k.walk = 0; k.job = k.job || null;
  drawWalker(k); k.face = f0;
  const sx0 = sx(X), sy0 = sy(Y);
  R(sx0 - 6, sy0 - 12, 12, 10, '#26304a'); R(sx0 - 6, sy0 - 7, 5, 2, '#d8e86a'); R(sx0 + 1, sy0 - 7, 5, 2, '#d8e86a');   // Arbeitshose mit Reflexstreifen
  R(sx0 - 7, sy0 - 2, 6, 2, '#26232e'); R(sx0 + 1, sy0 - 2, 6, 2, '#26232e');
  if (st !== 'psa' && face !== 'up') { R(sx0 - 6, sy0 - 39, 14, 3, 'rgba(160,220,255,.7)'); R(sx0 - 7, sy0 - 39, 16, 1, '#3a3d46'); }   // Schutzbrille
  if (st === 'phone' || st === 'phoneSoon') { R(sx0 - 2, sy0 - 26, 5, 8, PAL.dark); R(sx0 - 1, sy0 - 25, 3, 5, '#9fd3f0'); }
  if (st === 'break') { R(sx0 + 8, sy0 - 26, 6, 7, COL.white); R(sx0 + 14, sy0 - 24, 2, 3, COL.white); R(sx0 + 9, sy0 - 26, 4, 2, '#6b4a32');   // Kaffeebecher
    for (let i = 0; i < 2; i++) { const ph = (t * 0.7 + i / 2 + k.phase) % 1; R(sx0 + 10 + Math.sin(t * 2 + i) * 2, sy0 - 30 - ph * 10, 1, 3, `rgba(255,255,255,${(0.6 * (1 - ph)).toFixed(2)})`); } }
  ctx.restore();
  if (st === 'climb') ctx.restore();
}
function drawHallPrinter() {                   // Drucker am Büro, mit Fach-Anzeige
  const C = G.copier, CC = CONFIG.copier;
  drawOfficePrinter(24.6, 4.8);
  const b = { X: sx(24.6), Y: sy(4.8) - 34 };
  for (let i = 0; i < Math.min(C.tray, 6); i++) R(b.X + 8, b.Y + 4 - i, 26, 1, i % 2 ? '#f0ece4' : COL.white);
  const warming = C.printing && C.warm < CC.warmup;
  R(b.X + 40, b.Y + 4, 8, 6, C.jam ? (blink(5) ? PAL.red : '#7a2a2a') : warming ? PAL.orange : C.cool > 0 ? '#7fb3e0' : C.printing ? '#7cc47a' : '#4f8fc9');
  if ((C.tray > 0 && blink(3)) || (C.jam && blink(5))) { ctx.fillStyle = C.jam ? 'rgba(232,83,74,.4)' : 'rgba(247,209,84,.4)'; ctx.fillRect(b.X - 3, b.Y - 3, 58, 40); }
}
function drawHallBoard() {                     // mobile Tafel: Auftrag mit Checkliste
  drawMobileBoard(10.4, 5.0);
  const X = sx(10.4), Y = sy(5.0) - 64;
  R(X, Y, 80, 48, '#f8f8f4');
  if (G.exam) { ltext(examName().toUpperCase().replace('Ü', 'UE'), X + 4, Y + 4, '#c0503a', 1); ltext('RUHE BITTE', X + 4, Y + 16, '#26232e', 1); return; }
  if (!G.pkg) return;
  ltext('AUFTRAG ' + G.order_n, X + 4, Y + 3, '#2f6db5', 1);
  // Müdigkeit (unter der Tafel) und Tempo/Pause
  const F = G.fatigue || 0; R(X, Y + 50, 80, 4, '#d6d9dc'); R(X, Y + 50, Math.round(80 * F), 4, F > 0.7 ? PAL.red : F > 0.4 ? PAL.orange : '#9fd39a');
  if (G.breakT > 0) ltext('PAUSE ' + Math.ceil(G.breakT), X + 44, Y + 3, '#2f6db5', 1);
  else if (G.tempoT > 0) ltext('TEMPO!', X + 50, Y + 3, PAL.orange, 1);
  else if (G.freeWork) ltext('FREI', X + 58, Y + 3, '#7cc47a', 1);
  HALL_PKG.forEach((D, i) => {
    const P = G.pkg[i], yy = Y + 12 + i * 8;
    R(X + 4, yy, 5, 5, P.done ? '#7cc47a' : '#d6d9dc'); if (P.done) { px(X + 5, yy + 2, COL.white); px(X + 6, yy + 3, COL.white); px(X + 7, yy + 1, COL.white); }
    ltext(D.name, X + 12, yy, '#26232e', 1);
    R(X + 56, yy + 1, 20, 3, '#d6d9dc'); R(X + 56, yy + 1, Math.round(20 * P.p / 100), 3, P.need ? PAL.orange : '#2f6db5');
  });
}
function drawHallPkgBars() {                   // Fortschritt je Paket direkt an den Stationen
  if (!G.pkg || G.exam) return;
  HALL_PKG.forEach((D, i) => {
    const P = G.pkg[i], X = sx(D.bar[0]), Y = sy(D.bar[1]);
    const near = teacherNear(i), col = P.done ? '#7cc47a' : P.need ? PAL.orange : near ? '#9fd3f0' : '#5ca7e8';
    const w = 96; rr(X - w / 2 - 2, Y - 6, w + 4, 12, PAL.dark, 2); R(X - w / 2, Y - 4, Math.round(w * P.p / 100), 8, col);
    if (D.id === 'rad' && !P.done && P.p >= CONFIG.hall.order.prepCap - 0.1 && !G.pkg.slice(0, 3).every(q => q.done)) R(X - w / 2 + Math.round(w * 0.3), Y - 5, 1, 10, PAL.red);
    ltext(P.done ? D.name + ' OK' : P.need === 'mat' ? D.part + '?' : P.need === 'check' ? 'ABNAHME!' : D.name + (near ? ' X1.3' : ''), X - w / 2 + 2, Y - 3, COL.white, 1);
  });
}
function drawHallPult() {                      // Stehpult mit Ablage
  const b = box(13.4, 4.55, 0.9, 0.5, 30, '#9aa2ab', '#6b717c', '#555c68');
  R(b.X + 2, b.Y - 2, 24, 8, '#555c68');
  for (let i = 0; i < Math.min(G.stash, 6); i++) R(b.X + 3, b.Y + 4 - i * 2, 22, 2, i % 2 ? '#f0ece4' : COL.white);
  if (G.stash > 0) ptext(G.stash + '/' + CONFIG.deskStashMax, b.X + 14, b.Y - 16, COL.white, PAL.dark, 1);
}
function drawHallBell() {                      // Pausenklingel am Büro (Ständer mit Glocke)
  const X = sx(23.7), Y = sy(4.95), used = G.pauseUsed, ring = (G.bellFx || 0) > 0;
  if (ring) G.bellFx = Math.max(0, G.bellFx - 0.02);
  softShadow(X, Y, 8, 2);
  R(X - 1, Y - 34, 3, 34, '#555c68'); R(X - 6, Y - 2, 13, 3, '#3a3d46');
  const sw = ring ? Math.round(Math.sin(clockT * 30) * 2) : 0;
  disc(X + 1 + sw, Y - 38, 6, used ? '#8a7a4a' : '#e8b830'); R(X - 5 + sw, Y - 36, 13, 3, used ? '#6b5f3a' : '#c99212'); disc(X + 1 + sw, Y - 32, 2, '#3a3d46');
  if (!used && blink(0.6)) px(X - 2, Y - 41, COL.white);
}
function drawPuddle() {
  const P = G.puddle; if (!P) return;
  ctx.fillStyle = 'rgba(30,30,40,.55)'; ctx.beginPath(); ctx.ellipse(sx(P.x), sy(P.y), 30, 10, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(150,120,220,.25)'; ctx.beginPath(); ctx.ellipse(sx(P.x) - 6, sy(P.y) - 2, 12, 3, 0, 0, 7); ctx.fill();
}
function renderHallWorld() {
  ctx.drawImage(hallBackground(), 0, 0);
  drawPuddle();
  drawPresence();
  const list = [];
  list.push({ y: 1.0, f: () => drawEngineRack(1.8, 1.0) });
  list.push({ y: 5.6, f: () => drawRackSide(0.1, 1.6, 4.4) });
  [8.9, 11.0, 14.0, 16.1].forEach(x => list.push({ y: 0.9, f: () => drawHydWall(x, 0.9) }));
  list.push({ y: 4.5, f: () => drawContainer(24.2, 0.3) });
  list.push({ y: 5.6, f: drawHallPrinter });
  list.push({ y: 5.8, f: () => drawBins(27.4, 5.8) });
  const LA = sx(29.2), LB = sy(11.7);
  list.push({ y: 11.7, f: () => { ctx.save(); ctx.translate(LA, LB); ctx.scale(-1.25, 1.25); ctx.translate(-sx(0), -sy(0)); drawLoader2(0, 0); ctx.restore(); } });
  list.push({ y: 10.0, f: () => drawTestStand(13.2, 10.0, '#e8b830') });
  list.push({ y: 7.0, f: () => drawTestStandFront(19.8, 7.0) });
  list.push({ y: 10.6, f: () => drawTrolley(16.6, 9.8) });
  list.push({ y: 9.9, f: () => drawElecWall(1.6, 9.9, 0) });
  list.push({ y: 9.9, f: () => drawElecWall(7.0, 9.9, 2) });
  list.push({ y: 5.0, f: drawHallBoard });
  list.push({ y: 5.05, f: drawHallPult });
  list.push({ y: 4.95, f: drawHallBell });
  if (has('binderbox')) list.push({ y: 1.0, f: () => { const X = sx(13.1), Y = sy(1.0); softShadow(X + 11, Y, 12, 3); R(X, Y - 16, 22, 16, '#d8c8a0'); R(X, Y - 16, 22, 3, '#b08a5a'); ltext('BIND', X + 3, Y - 10, '#6b4a32', 1); } });
  list.push({ y: 4.0, f: () => drawSmartboard(6.6, 4.0) });
  list.push({ y: 9.4, f: () => { const X = sx(29.4), Y = sy(9.4); R(X, Y - 22, 10, 22, '#d94a3a'); R(X + 2, Y - 26, 6, 4, '#26232e'); } });
  for (const k of G.kids) {
    list.push({ y: k.state === 'climb' ? 12 : k.y, f: () => drawHallKid(k) });
    if (k.state === 'walk') list.push({ y: k.wy, f: () => drawWalker(k) });
  }
  list.push({ y: G.p.y, f: drawTeacher });
  if (G.npc) list.push({ y: G.npc.y, f: drawNpc });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  drawHoseRail();
  drawHallPkgBars();
  if (G.motorLoud) {                             // Lärm-Wellen am Motor
    const b = hallMotorBlock(), X = sx((b.x0 + b.x1) / 2), Y = sy(b.y0) - 60;
    for (let i = 0; i < 3; i++) { const ph = (clockT * 1.5 + i / 3) % 1; ctx.strokeStyle = `rgba(242,154,78,${(1 - ph).toFixed(2)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, 10 + ph * 40, -2.6, -0.5); ctx.stroke(); }
  }
  rmDoor(18.5, 13);
  if (G.doorOpen > 0) R(sx(18.5), OY + 13 * T + 1, 64, 15, '#e8d8b8');
  for (const [x, y] of [[5, 4], [14, 4], [23, 6], [5, 10], [14, 10], [23, 10.5]]) {
    const g = ctx.createRadialGradient(sx(x), sy(y), 6, sx(x), sy(y), 150);
    g.addColorStop(0, 'rgba(255,250,235,.14)'); g.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = g; ctx.fillRect(sx(x) - 150, sy(y) - 150, 300, 300);
  }
}
function drawHallOverlay() {
  const H = CONFIG.hall;
  for (const k of G.kids) {
    if (!isSeated(k)) continue;
    const X = sx(k.x) + (k.state === 'climb' ? 28 : 0), Y = sy(k.y) - 74 - (k.state === 'climb' ? 40 : 0);
    if (k.state === 'check') bubble(X, Y - 8, '#9fd39a', 1 - k.t / H.check.patience, 'OK?', COL.white, 13);
    if (k.state === 'mat') { bubble(X, Y - 8, PAL.yellow, 1 - k.t / H.mat.patience, '', COL.white, 11); R(X - 5, Y - 10, 10, 3, '#555c68'); R(X - 2, Y - 13, 4, 9, '#555c68'); }
    if (k.state === 'psa') { bubble(X, Y - 8, '#2f6db5', 1 - k.t / H.psa.patience, '', COL.white, 11); R(X - 6, Y - 10, 5, 4, COL.white); R(X + 1, Y - 10, 5, 4, COL.white); R(X - 1, Y - 9, 2, 1, COL.white); }
    if (k.state === 'climbSoon') { bubble(X, Y + 8, PAL.grey, 1 - k.t / H.climb.warn, '!', PAL.orange, 8); }
    if (k.state === 'climb') bubble(X, Y - 8, PAL.red, 1, '!!', COL.white, 12);
    if (k.state === 'wcq') bubble(X, Y - 8, PAL.grey, 1, 'WC', '#5cc8c0', 13);
    if (k.state === 'leak') { bubble(X, Y + 6, PAL.grey, 1, '', PAL.grey, 8); disc(X, Y + 7, 3, '#2a2a35'); R(X - 1, Y + 1, 2, 4, '#2a2a35'); }
  }
  if (G.puddle) { const P = G.puddle; bubble(sx(P.x), sy(P.y) - 30 + (blink(4) ? -2 : 0), PAL.orange, P.t < H.leak.slipAfter ? 1 - P.t / H.leak.slipAfter : 1, '!', P.t >= H.leak.slipAfter ? PAL.red : COL.white, 10); }
  if (G.motorLoud) { const b = hallMotorBlock(); bubble(sx((b.x0 + b.x1) / 2), sy(b.y0) - 84, PAL.orange, 1, 'LAUT', COL.white, 16); }
  if (G.breakT > 0) bubble(sx(11.6), sy(5.0) - 92, '#9fd3f0', G.breakT / CONFIG.hall.pause.time, 'PAUSE', COL.white, 18);
  else if ((G.fatigue || 0) > 0.75 && !G.pauseUsed && !G.exam && blink(1)) ptext('MUEDE - PAUSE? (KLINGEL)', sx(23.7), sy(4.6) - 96, PAL.orange, PAL.dark, 1);
  if (G.binder) { const X = sx(G.p.x) + 14, Y = sy(G.p.y) - 34; R(X, Y, 10, 12, '#d8c8a0'); R(X, Y, 10, 3, '#b08a5a'); }
  if (G.mats) for (let i = 0; i < G.mats; i++) { const X = sx(G.p.x) - 20 - i * 5, Y = sy(G.p.y) - 26; R(X, Y, 4, 4, '#9aa2ab'); }
}
function renderHall() {                        // ganze Halle direkt ins (größere) Spielbild
  ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, cv.width, cv.height);
  renderHallWorld();
  if (state !== 'title') renderOverlay();
}

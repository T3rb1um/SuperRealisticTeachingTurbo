'use strict';
/* =====================================================================
   Super Real Teaching Turbo – Grafik
   Doppelte Auflösung (768×432, 1 Kachel = 32 px). Gemütlicher Stil:
   Holz, warmes Licht, Pflanzen, viele kleine Animationen – in einem
   modernen Technik-Klassenraum einer Berufsschule.
   ===================================================================== */

/* ---------------------------------------------------------- Hilfen */
const shadeCache = new Map();
function shade(hex, f) {                          // f < 0 dunkler, f > 0 heller
  const key = hex + f;
  let v = shadeCache.get(key);
  if (v) return v;
  const n = parseInt(hex.slice(1, 7), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  v = '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
  shadeCache.set(key, v);
  return v;
}
const px = (x, y, c) => R(x, y, 1, 1, c);
function rr(x, y, w, h, c, cut = 1) { R(x + cut, y, w - 2 * cut, h, c); R(x, y + cut, w, h - 2 * cut, c); }
function round16(x, y, c) { R(x + 3, y, 10, 16, c); R(x + 1, y + 1, 14, 14, c); R(x, y + 3, 16, 10, c); }
function disc(cx, cy, r, c) {
  ctx.fillStyle = c;
  for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); ctx.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1); }
}
function pcircle(cx, cy, r, c) {
  ctx.fillStyle = c;
  const n = Math.max(12, Math.round(r * 7));
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1); }
}
function softShadow(cx, cy, rx, ry, a = 0.22) {
  ctx.fillStyle = `rgba(60,35,30,${a})`;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fill();
}
let seed = 1;
const srnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const blink = (f, ph = 0) => Math.floor(clockT * f + ph) % 2 === 0;

/* ------------------------------------------------------------ Farben */
const COL = {
  bg: '#1f1a24',
  floor: ['#c48e57', '#bb8650', '#cc9760', '#b98250', '#c2894f'], floorGap: '#87593a', floorGrain: '#ab7746',
  plaster: '#f3e6cc', plasterD: '#e6d5b6', beam: '#6b4a32', beamL: '#86603f', beamD: '#553a27',
  panel: '#b07a48', panelL: '#c48d58', panelD: '#8e5f36',
  oak: '#c8935a', oakL: '#deac72', oakD: '#9c6a3c', oakDD: '#6e4a2c',
  birch: '#e8c993', birchL: '#f4dcae', birchD: '#c9a46c',
  metal: '#4a4f58', metalL: '#6b717c',
  slate: '#2f5b49', slateD: '#264b3c', slateL: '#3a6a56', chalk: '#f4f1e6', chalkDim: '#86ad99',
  wallDark: '#4a3426', wallDarkL: '#644733',
  ink: '#26232e', white: '#fff8ec',
};

/* ===================================================== Hintergrund */
let bgCanvas = null;
function buildBackground() {
  bgCanvas = document.createElement('canvas');
  bgCanvas.width = SW; bgCanvas.height = SH;
  const real = ctx;
  ctx = bgCanvas.getContext('2d');
  const FX = OX, FY = OY, FW = RW * T, FH = RH * T, wy = OY - WALL_H;

  R(0, 0, SW, SH, COL.bg);

  // Holzdielen
  seed = 11;
  for (let row = 0; row < FH / 16; row++) {
    const y = FY + row * 16;
    let x = FX - Math.floor(srnd() * 90);
    while (x < FX + FW) {
      const len = 70 + Math.floor(srnd() * 100), col = COL.floor[Math.floor(srnd() * COL.floor.length)];
      const x0 = Math.max(x, FX), x1 = Math.min(x + len, FX + FW);
      if (x1 > x0) {
        R(x0, y, x1 - x0, 15, col);
        R(x0, y, x1 - x0, 1, shade(col, 0.14));
        R(x0, y + 14, x1 - x0, 1, shade(col, -0.08));
        for (let g = 0; g < 4; g++) {
          const gy = y + 3 + Math.floor(srnd() * 10), gx = x0 + Math.floor(srnd() * (x1 - x0));
          R(gx, gy, Math.min(x1 - gx, 8 + Math.floor(srnd() * 34)), 1, shade(col, -0.1));
        }
        if (srnd() < 0.1) { const kx = x0 + 8 + Math.floor(srnd() * Math.max(1, x1 - x0 - 16)); R(kx, y + 6, 4, 3, shade(col, -0.25)); px(kx + 1, y + 7, shade(col, -0.4)); }
      }
      if (x + len < FX + FW) R(x + len, y, 1, 15, COL.floorGap);
      x += len + 1;
    }
    R(FX, y + 15, FW, 1, COL.floorGap);
  }

  // Rückwand: Putz, Deckenbalken, Holzvertäfelung
  R(FX, wy, FW, WALL_H, COL.plaster);
  for (let i = 0; i < 700; i++) px(FX + Math.floor(srnd() * FW), wy + 12 + Math.floor(srnd() * (WALL_H - 44)), srnd() < 0.5 ? COL.plasterD : shade(COL.plaster, 0.3));
  R(FX, wy + 12, FW, 3, 'rgba(80,50,30,.12)');                         // Schatten unter dem Balken
  R(FX, wy, FW, 12, COL.beam);
  R(FX, wy + 10, FW, 2, COL.beamD); R(FX, wy + 1, FW, 1, COL.beamL);
  for (let i = 0; i < 30; i++) R(FX + Math.floor(srnd() * FW), wy + 3 + Math.floor(srnd() * 6), 6 + Math.floor(srnd() * 20), 1, shade(COL.beam, -0.12));
  for (const bx of [FX + 150, FX + 330, FX + 510]) { R(bx, wy, 4, 12, COL.beamD); }  // Balkenstöße
  const pY = OY - 30;
  R(FX, pY, FW, 30, COL.panel);
  for (let x = FX; x < FX + FW; x += 14) { R(x, pY, 1, 30, COL.panelD); R(x + 1, pY, 1, 30, COL.panelL); }
  R(FX, pY - 4, FW, 4, COL.oakD); R(FX, pY - 4, FW, 1, COL.oakL);
  R(FX, OY - 4, FW, 4, COL.oakDD);
  // Steckdosenleiste am Paneel
  for (const x of [FX + 14, FX + 188, FX + 452, FX + 548]) { R(x, pY + 8, 10, 8, '#f4f0e6'); R(x + 2, pY + 11, 2, 2, '#777'); R(x + 6, pY + 11, 2, 2, '#777'); }

  // Seitenwände und Vorderwand (dunkles Holz)
  R(FX - 16, wy, 16, SH - wy, COL.wallDark); R(FX - 4, wy, 4, SH - wy, COL.wallDarkL);
  R(FX + FW, wy, 16, SH - wy, COL.wallDark); R(FX + FW, wy, 4, SH - wy, COL.wallDarkL);
  R(FX - 16, FY + FH, FW + 32, SH - FY - FH, COL.wallDark); R(FX - 16, FY + FH, FW + 32, 3, COL.wallDarkL);
  R(FX, FY, FW, 6, 'rgba(60,35,25,.18)');                             // Schatten an der Wand
  R(FX, FY, 5, FH, 'rgba(60,35,25,.12)');

  // Poster: Arbeitssicherheit
  const p1 = FX + 12, p1y = wy + 20;
  R(p1, p1y, 36, 46, '#fdfaf2'); R(p1 + 2, p1y + 2, 32, 32, '#f2c94a');
  for (let i = 0; i < 12; i++) R(p1 + 18 - i, p1y + 6 + i * 2, i * 2 + 1, 2, COL.ink);
  for (let i = 2; i < 10; i++) R(p1 + 18 - i + 2, p1y + 10 + i * 2, Math.max(1, i * 2 - 3), 2, '#f2c94a');
  R(p1 + 17, p1y + 14, 3, 8, COL.ink); R(p1 + 17, p1y + 24, 3, 2, COL.ink);
  R(p1 + 4, p1y + 37, 28, 2, '#9a8a7a'); R(p1 + 4, p1y + 41, 20, 2, '#9a8a7a');
  px(p1 + 17, p1y - 1, '#d94a3a');

  // Pinnwand aus Kork mit Zetteln und Klassenfoto
  const pb = FX + 470, pby = wy + 14;
  R(pb - 3, pby - 3, 70, 50, COL.oakD); R(pb - 3, pby - 3, 70, 1, COL.oakL);
  R(pb, pby, 64, 44, '#c99a5e');
  for (let i = 0; i < 80; i++) px(pb + Math.floor(srnd() * 64), pby + Math.floor(srnd() * 44), srnd() < 0.5 ? '#b5864d' : '#d8ab72');
  R(pb + 3, pby + 4, 16, 20, '#fdfaf2'); for (let i = 0; i < 5; i++) R(pb + 5, pby + 8 + i * 3, 10 - (i % 2) * 3, 1, '#9ab');
  R(pb + 22, pby + 3, 22, 18, '#fdfaf2'); R(pb + 24, pby + 5, 18, 11, '#9fc7e0');                // Klassenfoto
  for (let i = 0; i < 5; i++) { R(pb + 25 + i * 3.5, pby + 10, 2, 2, SKIN[i % SKIN.length]); R(pb + 25 + i * 3.5, pby + 12, 2, 3, ['#3d4f7a', '#4f6b4f', '#a8443c', '#4f7fbf', '#7a5a8a'][i]); }
  R(pb + 48, pby + 4, 13, 12, '#f7e07a'); R(pb + 50, pby + 8, 8, 1, '#b09a3a'); R(pb + 50, pby + 11, 6, 1, '#b09a3a');
  R(pb + 5, pby + 28, 14, 12, '#f2a0b4'); R(pb + 7, pby + 32, 9, 1, '#b0607a');
  R(pb + 24, pby + 25, 34, 16, '#fdfaf2');                                                       // Schaltplan
  R(pb + 27, pby + 28, 28, 1, '#3d5f8a'); R(pb + 27, pby + 37, 28, 1, '#3d5f8a'); R(pb + 27, pby + 28, 1, 10, '#3d5f8a'); R(pb + 54, pby + 28, 1, 10, '#3d5f8a');
  R(pb + 35, pby + 26, 8, 4, '#3d5f8a'); R(pb + 46, pby + 31, 2, 4, '#d94a3a');
  for (const [x, y, c] of [[pb + 10, pby + 4, '#d94a3a'], [pb + 32, pby + 3, '#3d7fc4'], [pb + 54, pby + 4, '#7cc47a'], [pb + 11, pby + 28, '#f2c14e'], [pb + 40, pby + 25, '#d94a3a']]) { R(x, y - 1, 2, 2, c); }

  // Kopierer-Kabel: dezent an der Wand entlang
  R(FX + 2, FY + 268, 2, 46, '#2c2832'); R(FX + 4, FY + 268, 1, 46, '#3a3540');

  // Fußmatte an der Tür
  const dmx = sx(DOOR.x0 + 0.25);
  R(dmx, FY + FH - 20, 56, 18, '#6b5a4a'); R(dmx + 3, FY + FH - 17, 50, 12, '#8a7660');
  for (let i = 0; i < 8; i++) R(dmx + 5 + i * 6, FY + FH - 15, 3, 8, '#7a6652');

  ctx = real;
}

/* =================================================== Kleine Objekte */
function box(x, y, w, d, h, top, front, edge) {          // Kacheln / Pixel
  const X = sx(x), Y = sy(y), Wp = Math.round(w * T), Dp = Math.round(d * T);
  R(X, Y - h, Wp, Dp, top);
  R(X, Y - h + Dp, Wp, h, front);
  if (edge) R(X, Y - h + Dp, Wp, 1, edge);
  return { X, Y: Y - h, W: Wp, D: Dp, H: h, front: Y - h + Dp, bottom: Y + Dp };
}

function drawFigure(fig, x, y, c) {       // Tafelskizzen (im 16-px-Raster, doppelt gezeichnet)
  const t = clockT, bg = COL.slate;
  ctx.save(); ctx.translate(x, y); ctx.scale(2, 2);
  if (fig === 'gears') {
    const a = t * 0.6;
    pcircle(9, 11, 7, c); pcircle(9, 11, 2, c);
    for (let i = 0; i < 10; i++) { const b = a + i / 10 * 6.28; R(9 + Math.cos(b) * 9, 11 + Math.sin(b) * 9, 1, 1, c); }
    pcircle(22, 6, 4, c); pcircle(22, 6, 1, c);
    for (let i = 0; i < 6; i++) { const b = -a * 1.7 + i / 6 * 6.28; R(22 + Math.cos(b) * 6, 6 + Math.sin(b) * 6, 1, 1, c); }
  } else if (fig === 'circuit') {
    R(2, 3, 24, 1, c); R(2, 20, 24, 1, c); R(2, 3, 1, 18, c); R(25, 3, 1, 18, c);
    R(9, 1, 10, 5, bg); R(9, 1, 10, 1, c); R(9, 5, 10, 1, c); R(9, 1, 1, 5, c); R(18, 1, 1, 5, c);
    R(0, 10, 5, 1, c); R(1, 13, 3, 1, c); R(2, 11, 1, 2, bg);
    R(23, 9, 5, 6, bg); pcircle(25.5, 11.5, 3, c);
  } else if (fig === 'shaft') {
    R(0, 9, 28, 1, c); R(0, 15, 28, 1, c); R(0, 9, 1, 7, c);
    R(10, 6, 10, 1, c); R(10, 18, 10, 1, c); R(10, 6, 1, 13, c); R(19, 6, 1, 13, c);
    R(13, 9, 4, 2, c);
  } else if (fig === 'gate') {
    R(8, 3, 12, 1, c); R(8, 18, 12, 1, c); R(8, 3, 1, 16, c); R(19, 3, 1, 16, c);
    ltext('&', 13, 8, c);
    R(0, 7, 8, 1, c); R(0, 14, 8, 1, c); R(20, 10, 8, 1, c);
  } else if (fig === 'fit') {
    R(2, 2, 24, 4, c); R(2, 16, 24, 4, c);
    R(4, 8, 20, 1, c); R(4, 14, 20, 1, c); R(4, 8, 1, 7, c); R(23, 8, 1, 7, c);
    R(14, 6, 1, 2, '#f2c14e'); R(14, 15, 1, 1, '#f2c14e');
  } else if (fig === 'series') {                       // zwei Widerstände in Reihe
    R(2, 3, 24, 1, c); R(2, 20, 24, 1, c); R(2, 3, 1, 18, c); R(25, 3, 1, 18, c);
    for (const x0 of [5, 15]) { R(x0, 1, 7, 5, bg); R(x0, 1, 7, 1, c); R(x0, 5, 7, 1, c); R(x0, 1, 1, 5, c); R(x0 + 6, 1, 1, 5, c); }
    R(0, 10, 5, 1, c); R(1, 13, 3, 1, c); R(2, 11, 1, 2, bg);
  } else if (fig === 'bulb') {                         // Glühlampe
    pcircle(14, 8, 6, c); R(11, 14, 7, 1, c); R(12, 16, 5, 1, c); R(12, 18, 5, 1, c);
    R(12, 6, 1, 4, c); R(16, 6, 1, 4, c); R(13, 9, 3, 1, c);
    if (Math.floor(t * 2) % 2) { R(4, 3, 3, 1, '#f2c14e'); R(22, 3, 3, 1, '#f2c14e'); R(3, 9, 3, 1, '#f2c14e'); R(23, 9, 3, 1, '#f2c14e'); }
  } else if (fig === 'wrench') {                       // Schraubenschlüssel
    R(4, 15, 3, 3, c); R(6, 13, 3, 3, c); R(8, 11, 3, 3, c); R(10, 9, 3, 3, c); R(12, 7, 3, 3, c);
    pcircle(17, 5, 4, c); R(17, 1, 4, 4, bg); R(18, 3, 1, 1, c);
    R(3, 17, 1, 3, c); R(5, 19, 3, 1, c);
  } else if (fig === 'speech') {                       // Sprechblase
    R(3, 2, 22, 1, c); R(3, 14, 22, 1, c); R(2, 3, 1, 11, c); R(25, 3, 1, 11, c);
    R(6, 15, 1, 3, c); R(7, 17, 1, 1, c); R(8, 15, 1, 2, c);
    ltext('HI!', 8, 6, c);
  } else if (fig === 'warn') {                         // Warndreieck
    for (let i = 0; i < 9; i++) { R(13 - i, 2 + i * 2, 1, 2, c); R(14 + i, 2 + i * 2, 1, 2, c); }
    R(5, 19, 18, 1, c); R(13, 7, 2, 6, '#f2c14e'); R(13, 15, 2, 2, '#f2c14e');
  } else if (fig === 'chart') {                        // Balkendiagramm
    R(2, 20, 24, 1, c); R(2, 2, 1, 19, c);
    const hs = [6, 10, 8, 15];
    hs.forEach((h, i) => R(5 + i * 5, 20 - h, 3, h, i === 3 ? '#f2c14e' : c));
  } else if (fig === 'flow') {                         // Ablauf mit Pfeilen
    for (let i = 0; i < 3; i++) { const y0 = 1 + i * 7; R(4, y0, 12, 5, bg); R(4, y0, 12, 1, c); R(4, y0 + 4, 12, 1, c); R(4, y0, 1, 5, c); R(15, y0, 1, 5, c); if (i < 2) { R(9, y0 + 5, 1, 2, c); } }
    R(19, 3, 5, 1, c); R(23, 2, 1, 3, c); R(19, 17, 5, 1, c);
  } else if (fig === 'pie') {                          // Tortendiagramm
    pcircle(13, 11, 8, c); R(13, 3, 1, 8, c); R(13, 11, 7, 1, c);
    for (let i = 0; i < 6; i++) R(14 + i, 10 - i, 1, 1, '#f2c14e');
  } else if (fig === 'cylinder') {
    R(2, 6, 18, 1, c); R(2, 15, 18, 1, c); R(2, 6, 1, 10, c); R(19, 6, 1, 10, c);
    const s = Math.round((Math.sin(t * 1.5) + 1) * 3);
    R(8 + s, 7, 1, 8, c); R(9 + s, 10, 16 - s, 1, c);
    R(5, 16, 1, 4, c); R(15, 16, 1, 4, c);
  }
  ctx.restore();
}

/* ======================================================= Rückwand */
function drawWindow() {
  const x0 = sx(17.05), y0 = OY - WALL_H + 12, w = 76, h = 54, t = clockT;
  const evening = RUN && RUN.lesson >= 1;
  // Himmel
  const sky = ctx.createLinearGradient(0, y0, 0, y0 + h);
  sky.addColorStop(0, evening ? '#f2b98a' : '#9fd3f0'); sky.addColorStop(1, evening ? '#ffd9a8' : '#fff0cf');
  ctx.fillStyle = sky; ctx.fillRect(x0, y0, w, h);
  // Wolken
  for (let i = 0; i < 3; i++) {
    const cx = x0 + ((t * (3 + i) + i * 40) % (w + 30)) - 15, cy = y0 + 8 + i * 7;
    R(cx, cy, 14, 3, 'rgba(255,255,255,.85)'); R(cx + 3, cy - 2, 7, 2, 'rgba(255,255,255,.85)');
  }
  // Werkhallen mit Sheddach und Schornstein
  const hb = y0 + h;
  R(x0, hb - 16, w, 16, evening ? '#a08a8a' : '#8fa3b3');
  for (let i = 0; i < 6; i++) { const sx0 = x0 + i * 13; for (let j = 0; j < 6; j++) R(sx0 + j, hb - 16 - j, 1, j, evening ? '#a08a8a' : '#8fa3b3'); R(sx0 + 6, hb - 22, 1, 6, evening ? '#8a7676' : '#7d93a3'); }
  R(x0 + 52, hb - 34, 5, 18, '#7d8590');
  for (let i = 0; i < 4; i++) { const ph = (t * 0.4 + i / 4) % 1; R(x0 + 52 + ph * 8 + Math.sin(t + i) * 2, hb - 36 - ph * 18, 4 - ph * 2, 3, `rgba(255,255,255,${(0.7 * (1 - ph)).toFixed(2)})`); }
  for (let i = 0; i < 5; i++) R(x0 + 4 + i * 14, hb - 9, 5, 3, evening ? '#ffd27a' : '#cfe3ee');
  // ab und zu fliegt ein Vogel vorbei
  const bp = (t % 23) / 4;
  if (bp < 1) { const bxx = x0 + w - bp * (w + 10), byy = y0 + 14 + Math.sin(bp * 9) * 4, wing = blink(8) ? -1 : 1; R(bxx, byy, 3, 1, '#3a3540'); px(bxx - 1, byy + wing, '#3a3540'); px(bxx + 3, byy + wing, '#3a3540'); }
  // Baum vor dem Fenster
  const sway = Math.sin(t * 1.2) * 1.2 + gust * Math.sin(t * 6) * 2.5;
  R(x0 + 10, hb - 20, 4, 20, '#6b4a32');
  for (const [lx, ly, r, c] of [[8, -30, 9, '#5f9a4f'], [16, -24, 8, '#4f8a45'], [4, -22, 7, '#6faa5a'], [14, -36, 6, '#7cba62']]) disc(x0 + lx + sway * (1 + ly / -40), hb + ly, r, c);
  // Rahmen und Sprossen aus Holz
  R(x0 - 4, y0 - 4, w + 8, 4, COL.oak); R(x0 - 4, y0 + h, w + 8, 4, COL.oak);
  R(x0 - 4, y0, 4, h, COL.oak); R(x0 + w, y0, 4, h, COL.oak);
  R(x0 + w / 2 - 2, y0, 4, h, COL.oak); R(x0, y0 + h / 2 - 2, w, 3, COL.oak);
  R(x0 - 4, y0 - 4, w + 8, 1, COL.oakL); R(x0 + w / 2 - 2, y0, 1, h, COL.oakL);
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x0 + 4, y0 + 3, 3, 20); ctx.fillRect(x0 + w / 2 + 5, y0 + 3, 3, 20);   // Spiegelung
  // Fensterbank mit Pflanzen (Upgrade „Geduldige Azubis“)
  R(x0 - 8, y0 + h + 4, w + 16, 5, COL.oakL); R(x0 - 8, y0 + h + 8, w + 16, 2, COL.oakD);
  for (let i = 0; i < upLevel('patience'); i++) {
    const ppx = x0 + 6 + i * 24, ppy = y0 + h + 4, s2 = Math.round(Math.sin(t * 1.6 + i) * 0.8 + gust * Math.sin(t * 8 + i) * 1.5);
    R(ppx, ppy - 8, 12, 8, '#c4622d'); R(ppx - 1, ppy - 9, 14, 2, '#d9774a');
    disc(ppx + 3 + s2, ppy - 13, 4, i % 2 ? '#7cc47a' : '#5fa85a'); disc(ppx + 9 + s2, ppy - 14, 4, '#6faa5a'); disc(ppx + 6 + s2, ppy - 18, 3, '#9fd39a');
  }
  // Vorhänge aus Leinen, wehen im Wind
  const cs = Math.sin(t * 1.3) * 0.8 + gust * 3 * Math.sin(t * 7);
  for (const side of [-1, 1]) {
    const cx0 = side < 0 ? x0 - 14 : x0 + w + 2;
    for (let i = 0; i < 6; i++) {
      const off = Math.round(cs * (i / 5) * (side < 0 ? 1 : -1) * 1.5);
      R(cx0 + off, y0 - 6 + i * 10, 12, 10, i % 2 ? '#eadcc0' : '#f3e8d2');
      R(cx0 + off + (i % 2 ? 3 : 7), y0 - 6 + i * 10, 1, 10, '#d8c8a8');
    }
  }
  R(x0 - 18, y0 - 9, w + 36, 3, COL.oakDD);   // Gardinenstange
}

function drawBoard() {
  const wy = OY - WALL_H;
  const bx = sx(BOARD.x0), bw = (BOARD.x1 - BOARD.x0) * T, by = wy + 8, bh = 66;
  const low = G.supply < CONFIG.board.lowWarn * 100, empty = G.supply <= 0 && !CONFIG.board.review;
  // Rahmen (Eiche), blinkt bei leerer/fast leerer Tafel
  const frameCol = empty && blink(4) ? PAL.red : low && blink(4) ? PAL.yellow : COL.oak;
  R(bx - 6, by - 6, bw + 12, bh + 12, frameCol);
  R(bx - 6, by - 6, bw + 12, 2, shade(frameCol, 0.2)); R(bx - 6, by + bh + 4, bw + 12, 2, shade(frameCol, -0.25));
  R(bx, by, bw, bh, COL.slate);
  // Kreidestaub-Wolken (wischspuren)
  ctx.fillStyle = 'rgba(255,255,255,.035)';
  for (let i = 0; i < 5; i++) ctx.fillRect(bx + 10 + i * 36, by + 6 + (i % 3) * 14, 30, 16);
  R(bx, by + bh - 4, bw, 4, COL.slateD);
  // Ablage mit Kreide und Schwamm
  R(bx - 8, by + bh + 6, bw + 16, 5, COL.oakD); R(bx - 8, by + bh + 6, bw + 16, 1, COL.oakL);
  R(bx + 22, by + bh + 3, 10, 3, COL.chalk); R(bx + 150, by + bh + 2, 18, 4, '#3a3a44'); R(bx + 150, by + bh + 2, 18, 1, '#5a5a66');
  if (upLevel('chalk')) ['#f28fb6', '#f7d154', '#5cc8c0', '#9fd39a', COL.chalk].slice(0, 2 + upLevel('chalk')).forEach((c, i) => R(bx + 38 + i * 8, by + bh + 3, 6, 3, c));

  const lineY = i => by + 5 + i * 12 + (i ? 2 : 0);
  const figX = bx + 130, figY = by + 8;
  if (G.exam) {                                                  // Klassenarbeit
    const en = examName().toUpperCase().replace('Ü', 'UE');
    ltext(en, bx + 6, lineY(0), '#f2c14e', 2);
    R(bx + 6, lineY(0) + 11, en.length * 8 - 2, 1, '#c9a43e');
    ltext('RUHE BITTE!', bx + 6, lineY(1) + 2, COL.chalk, 2);
    ltext('KEIN SPICKEN', bx + 6, lineY(2) + 2, COL.chalk, 2);
    const left = Math.max(0, Math.ceil(CONFIG.lessonSeconds - G.t));
    ltext('NOCH ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'), bx + 6, lineY(4), '#9fd39a', 2);
    drawFigure('gears', figX, figY, '#cfe3d6');
  } else if (G.writing || G.writeProg > 0) {
    const sub = G.nextSubject || G.subject, txt = sub.lines, total = txt.join('').length;
    let n = Math.floor(total * G.writeProg);
    txt.forEach((line, i) => { if (n > 0) { ltext(line.slice(0, n), bx + 6, lineY(i), COL.chalk, 2); n -= line.length; } });
    if (G.writeProg > 0.6) drawFigure(sub.fig, figX, figY, COL.chalk);
  } else if (G.supply > 0) {
    const txt = G.subject.lines;
    ltext(txt[0], bx + 6, lineY(0), '#f2c14e', 2);
    R(bx + 6, lineY(0) + 11, txt[0].length * 8 - 2, 1, '#c9a43e');
    const doneCount = Math.floor((1 - G.supply / 100) * 4);
    for (let i = 1; i < 5; i++) {
      const done = i <= doneCount;
      ltext(txt[i], bx + 6, lineY(i), done ? COL.chalkDim : COL.chalk, 2);
      if (done) { const cx0 = bx + 6 + txt[i].length * 8 + 2, cy0 = lineY(i) + 4; for (const [dx, dy] of [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0], [5, -1], [6, -2]]) R(cx0 + dx, cy0 + dy, 1, 2, '#9fd39a'); }
    }
    drawFigure(G.subject.fig, figX, figY, '#cfe3d6');
    ltext(form().name, bx + bw - 6 - form().name.length * 4, by + bh - 9, '#9fc7b4');
  } else if (CONFIG.board.review) {
    ltext('WIEDERHOLUNG', bx + 6, lineY(0), '#9fc7b4', 2);
    ltext('ALTE AUFGABEN', bx + 6, lineY(2), COL.chalkDim, 2);
  } else {
    for (let i = 0; i < 4; i++) R(bx + 12 + i * 44, by + 16 + (i % 2) * 14, 28, 4, COL.slateL);
  }
  if (G.writeProg > 0) { R(bx + 6, by + bh - 3, bw - 12, 2, COL.slateD); R(bx + 6, by + bh - 3, Math.round((bw - 12) * G.writeProg), 2, PAL.yellow); }

  // Füllstand rechts neben der Tafel
  const mx0 = bx + bw + 9, mh = bh - 4, fill = Math.round(mh * G.supply / 100);
  R(mx0 - 2, by, 10, mh + 4, COL.oakD);
  R(mx0, by + 2, 6, mh, '#1f2a24');
  R(mx0, by + 2 + mh - fill, 6, fill, G.supply > 50 ? '#7cc47a' : G.supply > CONFIG.board.lowWarn * 100 ? PAL.yellow : PAL.red);
  R(mx0, by + 2 + mh - fill, 1, fill, 'rgba(255,255,255,.35)');
  for (let i = 1; i < 4; i++) R(mx0, by + 2 + Math.round(mh * i / 4), 6, 1, 'rgba(0,0,0,.35)');

  // Beamer (Game-Changer)
  if (CONFIG.board.beamer) {
    R(bx + 80, wy - 2, 34, 10, '#3a3d46'); R(bx + 80, wy - 2, 34, 2, '#555a66'); R(bx + 106, wy + 2, 5, 4, '#9fd3f0');
    if (G.beamerDelay > 0) {
      R(bx + 40, by + 22, bw - 80, 22, '#3d5f8a'); ltext('UPDATE', bx + 72, by + 26, COL.white, 2);
      R(bx + 46, by + 38, bw - 92, 2, '#26406a'); R(bx + 46, by + 38, Math.round((bw - 92) * (1 - G.beamerDelay / 4)), 2, COL.white);
    }
  }
}

function drawClockAndSigns() {
  const wy = OY - WALL_H, t = clockT;
  // Holzuhr: Zeiger zeigt den Stundenfortschritt
  const cx = sx(13.85), cy = wy + 34;
  disc(cx, cy + 1, 14, 'rgba(60,35,25,.25)');
  disc(cx, cy, 14, COL.oakD); disc(cx, cy, 12, COL.oak); disc(cx, cy, 10, '#fdf6e6');
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; px(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8, i % 3 ? '#b8a890' : COL.ink); }
  const a = -Math.PI / 2 + (G.t / CONFIG.lessonSeconds) * Math.PI * 2, a2 = a / 12 - Math.PI / 3;
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a2) * 5, cy + Math.sin(a2) * 5); ctx.stroke();
  ctx.strokeStyle = PAL.red; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8); ctx.stroke();
  disc(cx, cy, 1, COL.ink);
  // Lärmampel (Game-Changer)
  if (CONFIG.forecast) {
    const ax = cx - 5, ay = wy + 54, n = openProblems();
    R(ax, ay, 11, 27, COL.ink); R(ax, ay, 11, 1, '#4a4658');
    disc(ax + 5, ay + 5, 3, n >= CONFIG.maxProblems ? PAL.red : '#5a2a2a');
    disc(ax + 5, ay + 13, 3, n > 0 && n < CONFIG.maxProblems ? PAL.yellow : '#5a5a2a');
    disc(ax + 5, ay + 21, 3, n === 0 ? '#7cc47a' : '#2a4a2a');
  }
  // Sitzplan auf der Pinnwand
  if (has('seating')) {
    const pb = OX + 470, pby = wy + 14;
    R(pb + 3, pby + 24, 18, 17, '#fdfaf2'); R(pb + 5, pby + 26, 14, 2, '#3d5f8a');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) R(pb + 5 + c * 4, pby + 30 + r * 3, 3, 2, '#9ab');
    R(pb + 11, pby + 23, 2, 2, '#d94a3a');
  }
  // Handy-Garage an der Wand
  if (has('phonebox')) {
    const hx = sx(1.9), hy = wy + 22;
    R(hx - 2, hy - 2, 40, 34, COL.oakD); R(hx, hy, 36, 30, COL.oak);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      const cx2 = hx + 2 + c * 9, cy2 = hy + 2 + r * 14;
      R(cx2, cy2, 7, 12, COL.oakDD);
      if ((r * 4 + c) % 3 !== 2) { R(cx2 + 1, cy2 + 2, 5, 10, PAL.dark); R(cx2 + 2, cy2 + 3, 3, 6, (r + c) % 2 ? '#3a5a7a' : '#2a3a4a'); }
    }
    ltext('HANDYS', hx + 7, hy + 32, COL.ink, 1);
  }
  // Klassenregeln-Poster (Game-Changer)
  if (has('rules')) {
    const px0 = sx(3.15), py0 = wy + 18;
    R(px0, py0, 38, 46, '#fdfaf2'); R(px0 + 3, py0 + 3, 32, 7, '#3d5f8a'); ltext('REGELN', px0 + 7, py0 + 4, COL.white, 1);
    for (let i = 0; i < 5; i++) { R(px0 + 4, py0 + 14 + i * 6, 4, 4, '#7cc47a'); px(px0 + 5, py0 + 16 + i * 6, COL.white); R(px0 + 11, py0 + 15 + i * 6, 20 - (i % 2) * 6, 2, '#9ab'); }
  }
}

/* ======================================================== Möbel */
function drawTeacherDesk() {
  const b = box(1.5, 0.15, 3, 1.2, 18, COL.oak, COL.oakD, COL.oakDD);
  const X = b.X, Y = b.Y, t = clockT;
  // Holzmaserung auf der Platte
  R(X, Y, b.W, 1, COL.oakL);
  for (let i = 0; i < 6; i++) R(X + 6 + i * 15, Y + 4 + (i * 7) % 28, 18, 1, shade(COL.oak, -0.08));
  // Schubladen vorne
  for (let i = 0; i < 3; i++) { R(X + 6 + i * 30, b.front + 4, 26, 11, shade(COL.oakD, 0.08)); R(X + 15 + i * 30, b.front + 8, 8, 2, '#d9b25a'); }
  // Laptop (aufgeklappt, leuchtet)
  R(X + 8, Y - 14, 30, 18, '#3a3d46'); R(X + 10, Y - 12, 26, 14, blink(0.4) ? '#5ca7e8' : '#69b2ee');
  R(X + 12, Y - 10, 12, 2, '#cfe7fa'); R(X + 12, Y - 6, 18, 2, '#cfe7fa'); R(X + 12, Y - 2, 9, 2, '#cfe7fa');
  R(X + 6, Y + 4, 34, 6, '#7d8590'); R(X + 6, Y + 4, 34, 1, '#9aa2ab');
  // Schreibtischlampe (grüner Schirm)
  R(X + 82, Y - 2, 2, 12, '#c9a43e'); R(X + 76, Y + 10, 14, 3, '#c9a43e');
  rr(X + 72, Y - 8, 22, 8, '#2f6b4a', 2); R(X + 74, Y - 8, 18, 2, '#4f8f6a'); R(X + 74, Y - 1, 18, 1, '#ffe7a8');
  // Getriebemodell (dreht sich)
  const ga = t * 0.8;
  disc(X + 56, Y + 12, 7, '#9aa2ab'); disc(X + 56, Y + 12, 3, '#6b7280');
  for (let i = 0; i < 8; i++) { const a = ga + i / 8 * 6.283; R(X + 56 + Math.cos(a) * 8 - 1, Y + 12 + Math.sin(a) * 8 - 1, 2, 2, '#9aa2ab'); }
  disc(X + 67, Y + 18, 4, '#c9a43e');
  for (let i = 0; i < 6; i++) { const a = -ga * 1.8 + i / 6 * 6.283; px(X + 67 + Math.cos(a) * 5, Y + 18 + Math.sin(a) * 5, '#c9a43e'); }
  // Tasse mit Dampf
  R(X + 44, Y + 22, 8, 8, COL.white); R(X + 52, Y + 24, 2, 4, COL.white); R(X + 45, Y + 22, 6, 2, '#6b4a32');
  for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; R(X + 47 + Math.sin(t * 2 + i) * 2, Y + 18 - ph * 14, 1, 3, `rgba(255,255,255,${(0.6 * (1 - ph)).toFixed(2)})`); }
  // Sukkulente
  R(X + 30, Y + 24, 8, 6, '#d9774a'); disc(X + 34, Y + 21, 3, '#7cc47a'); px(X + 33, Y + 18, '#9fd39a');
  // Klangschale (Game-Changer): glänzt, solange sie noch nicht benutzt ist
  if (has('gong')) { const used = !(G.gongLeft > 0); disc(X + 63, Y + 31, 6, used ? '#8a7a4a' : '#c9a43e'); R(X + 58, Y + 28, 10, 2, used ? '#6b5f3a' : '#f2d27a'); R(X + 60, Y + 36, 6, 2, '#7a3a3a'); if (!used && blink(0.7)) px(X + 59, Y + 27, COL.white); }
  // Klemmbrett (Upgrade)
  if (upLevel('clip')) { R(X + 74, Y + 18, 14, 17, '#a8794a'); R(X + 75, Y + 21, 12, 13, COL.white); R(X + 78, Y + 16, 6, 4, '#9aa2ab'); for (let i = 0; i < Math.min(3, upLevel('clip')) + 1; i++) R(X + 77, Y + 24 + i * 3, 8, 1, '#9ab'); }
  // Ablage für Blätter
  const ax = X + 4, ay = Y + 16;
  if (upLevel('pult')) { R(ax - 2, ay - 2, 26, 18, COL.oakDD); R(ax, ay, 22, 14, COL.oakL); }
  R(ax + 2, ay + 2, 18, 12, '#555c68');
  for (let i = 0; i < Math.min(G.stash, 8); i++) R(ax + 3, ay + 11 - i * 2, 16, 2, i % 2 ? '#f0ece4' : COL.white);
  if (G.stash > 0) ptext(G.stash + '/' + CONFIG.deskStashMax, ax - 16, ay + 4, COL.white, PAL.dark, 2);
}

function drawShelf() {
  const b = box(4.9, 0.0, 1.8, 0.7, 62, COL.oakD, COL.oak, COL.oakDD);
  const X = b.X, Y = b.front, W = b.W, t = clockT;
  R(X + 3, Y + 3, W - 6, 56, '#4a3424');
  for (const sy0 of [Y + 20, Y + 40]) { R(X + 3, sy0, W - 6, 3, COL.oak); R(X + 3, sy0, W - 6, 1, COL.oakL); }
  ['#d94a3a', '#3d5f8a', '#f2c14e', '#4f6b4f', '#7a5a8a', '#3d5f8a', '#c97a3a'].forEach((c, i) => { const h = 13 + (i % 3) * 2; R(X + 6 + i * 4, Y + 20 - h, 3, h, c); R(X + 6 + i * 4, Y + 20 - h + 3, 3, 1, shade(c, 0.3)); });
  disc(X + 44, Y + 12, 6, '#c9ccd1'); disc(X + 44, Y + 12, 2, '#8c9198');
  for (let i = 0; i < 8; i++) { const a = t * 0.3 + i / 8 * 6.283; R(X + 44 + Math.cos(a) * 7 - 1, Y + 12 + Math.sin(a) * 7 - 1, 2, 2, '#c9ccd1'); }
  R(X + 7, Y + 28, 18, 10, '#6b7280'); R(X + 25, Y + 32, 7, 2, '#c9ccd1'); R(X + 9, Y + 30, 14, 1, '#8c9198');
  R(X + 38, Y + 28, 14, 10, '#e8823c'); R(X + 40, Y + 30, 2, 2, blink(1) ? '#7cc47a' : '#2f5f3a');
  R(X + 7, Y + 47, 40, 9, '#c9a43e'); R(X + 22, Y + 45, 10, 3, '#3a3a3a'); R(X + 10, Y + 50, 4, 3, COL.ink);
  // Pflanze oben mit Ranken
  const s2 = Math.sin(t * 1.4) * 1 + gust * Math.sin(t * 8) * 1.5;
  R(X + 18, b.Y - 10, 18, 10, '#d9774a'); R(X + 16, b.Y - 12, 22, 3, '#e8946a');
  for (const [lx, ly, r, c] of [[20, -16, 5, '#5fa85a'], [30, -18, 5, '#7cc47a'], [25, -22, 4, '#6faa5a']]) disc(X + lx + s2, b.Y + ly, r, c);
  for (let i = 0; i < 4; i++) { R(X + 37 + Math.round(s2 * (i / 3)), b.Y - 6 + i * 6, 3, 5, i % 2 ? '#5fa85a' : '#7cc47a'); }
}

function drawStool() {          // Lernbegleitung: Hocker zum Danebensetzen
  if (!has('tutor')) return;
  const X = sx(5.5), Y = sy(1.6);
  softShadow(X, Y, 9, 2);
  R(X - 7, Y - 12, 2, 12, COL.metal); R(X + 5, Y - 12, 2, 12, COL.metal);
  disc(X, Y - 14, 8, '#7cc47a'); disc(X, Y - 15, 6, '#9fd39a');
}
function drawPlant() {          // Monstera in der Ecke
  const x = sx(19.35), y = sy(0.85), t = clockT;
  softShadow(x, y, 15, 4);
  R(x - 11, y - 20, 22, 20, '#e8e2d6'); R(x - 12, y - 22, 24, 4, '#f4f0e6'); R(x - 11, y - 4, 22, 4, '#cfc6b6');
  R(x - 8, y - 14, 16, 2, '#7cb3c7');
  const sway = Math.sin(t * 1.7) * 1.2 + gust * Math.sin(t * 9) * 3;
  [[-12, -36, 9, -1], [9, -40, 10, 1], [-2, -52, 9, 0], [11, -28, 7, 1], [-14, -26, 7, -1]].forEach(([lx, ly, r, dir], i) => {
    const s = Math.round(sway * (i === 2 ? 1.5 : 1) + (i === 1 ? Math.sin(t * 3.1) * 1.5 : 0));
    const c = i % 2 ? '#4f9a4a' : '#62b05a';
    disc(x + lx + s, y + ly, r, c);
    R(x + lx + s - (dir > 0 ? r : 0), y + ly - 1, r, 2, shade(c, -0.25));     // Schlitz im Blatt
    px(x + lx + s - 2, y + ly - r + 2, shade(c, 0.35));
  });
  R(x - 1, y - 40, 2, 20, '#3f7a3c');
}

function drawCabinet() {        // Schaltschrank – mit schlafender Katze obendrauf
  const b = box(19.2, 2.6, 0.8, 1.6, 62, '#9aa2ab', '#c4c8ce', '#7d858f');
  const X = b.X, Y = b.front, t = clockT;
  R(X + 2, Y + 3, 22, 54, '#b4b9c0'); R(X + 2, Y + 3, 22, 1, '#d6d9de');
  R(X + 5, Y + 7, 16, 16, '#26302b'); R(X + 5, Y + 7, 16, 1, '#3f4a44');
  for (let i = 0; i < 4; i++) R(X + 6 + i * 4, Y + 10, 3, 9, ['#3d7fc4', '#d94a3a', '#e8e2d6', '#3d7fc4'][i]);
  R(X + 6, Y + 20, 1, 1, blink(2) ? '#7cc47a' : '#2f5f3a'); R(X + 9, Y + 20, 1, 1, blink(3, 1) ? '#f2c14e' : '#5f4f2a'); R(X + 12, Y + 20, 1, 1, Math.floor(t * 1.3) % 5 === 0 ? PAL.red : '#5a2a2a');
  R(X + 6, Y + 30, 12, 11, '#f2c94a'); for (let i = 0; i < 4; i++) R(X + 12 - i, Y + 32 + i * 2, 1 + i * 2 > 1 ? 2 : 1, 2, COL.ink);
  R(X + 20, Y + 30, 2, 9, '#555c68');
  // Katze
  const cx = X + 13, cy = b.Y + 34, breathe = Math.round(Math.sin(t * 1.5));
  const awake = openProblems() >= CONFIG.maxProblems;
  softShadow(cx, cy + 6, 12, 3, 0.2);
  rr(cx - 11, cy - 6 - breathe, 22, 12 + breathe, '#e0a060', 3);
  for (let i = 0; i < 3; i++) R(cx - 6 + i * 5, cy - 6 - breathe, 2, 5, '#c07a3a');
  rr(cx + 2, cy - 12, 11, 9, '#e0a060', 2);
  R(cx + 3, cy - 14, 3, 3, '#e0a060'); R(cx + 9, cy - 14, 3, 3, '#e0a060'); px(cx + 4, cy - 13, '#f2a0b4'); px(cx + 10, cy - 13, '#f2a0b4');
  if (awake) { R(cx + 4, cy - 9, 2, 2, '#3f7a3c'); R(cx + 9, cy - 9, 2, 2, '#3f7a3c'); }
  else { R(cx + 4, cy - 8, 2, 1, '#6b3a1a'); R(cx + 9, cy - 8, 2, 1, '#6b3a1a'); }
  px(cx + 7, cy - 6, '#f2a0b4');
  const tail = Math.round(Math.sin(t * (awake ? 6 : 1.2)) * 2);
  R(cx - 13, cy + 1 + tail, 6, 3, '#e0a060'); R(cx - 15, cy - 1 + tail * 1.5, 3, 3, '#c07a3a');
  if (!awake && Math.floor(t * 0.5) % 3 === 0) { const ph = (t * 0.5) % 1; ltext('Z', cx + 10 + ph * 6, cy - 22 - ph * 8, `rgba(255,255,255,${(1 - ph).toFixed(2)})`, 1); }
}

function drawToolCart() {
  const b = box(19.0, 6.0, 1.0, 1.0, 38, '#c43c32', '#d94a3a', '#9a2e26');
  const X = b.X, Y = b.front;
  softShadow(X + 16, b.bottom + 1, 18, 3);
  for (let i = 0; i < 3; i++) { R(X + 2, Y + 3 + i * 11, 28, 1, '#9a2e26'); R(X + 11, Y + 6 + i * 11, 10, 2, '#e8e2d6'); }
  R(X + 4, b.Y + 8, 14, 3, '#9aa2ab'); R(X + 16, b.Y + 6, 4, 6, '#9aa2ab');      // Schraubenschlüssel
  R(X + 20, b.Y + 14, 3, 12, '#f2c14e'); R(X + 20, b.Y + 22, 3, 6, '#3a3a3a');    // Schraubendreher
  R(X + 3, b.bottom - 2, 4, 4, COL.ink); R(X + 25, b.bottom - 2, 4, 4, COL.ink);
}

function drawExtinguisher() {
  const X = sx(19.55), Y = sy(9.9);
  softShadow(X, Y, 8, 2);
  rr(X - 6, Y - 28, 12, 28, '#d94a3a', 2); R(X - 5, Y - 26, 3, 24, '#e8766a');
  R(X - 4, Y - 33, 8, 5, COL.ink); R(X + 4, Y - 32, 6, 2, COL.ink); R(X + 8, Y - 30, 2, 10, COL.ink);
  R(X - 6, Y - 18, 12, 6, '#f7f5ee'); R(X - 3, Y - 16, 6, 2, '#d94a3a');
}

function drawDoor() {
  const X = sx(DOOR.x0 + 0.2), Y = OY + RH * T, w = 64, open = G.doorOpen > 0;
  if (has('opener')) {                                  // Türöffner: Antriebskasten mit Lämpchen und Taster
    R(X + 2, Y + 17, 30, 7, '#9aa2ab'); R(X + 2, Y + 17, 30, 1, '#c9ccd1'); R(X + 26, Y + 19, 3, 3, blink(1) ? '#7cc47a' : '#3a5a3a');
    R(X - 16, Y + 2, 9, 11, '#3d7fc4'); R(X - 14, Y + 4, 5, 5, COL.white); R(X - 13, Y + 5, 3, 3, '#3d7fc4');
  }
  const shake = G.kids.some(k => k.state === 'knock') && blink(16) ? 1 : 0;
  R(X - 4, Y - 1, w + 8, 17, COL.oakDD);
  R(X + shake, Y + 1, w, 15, open ? '#e8d8b8' : COL.oak);
  if (!open) {
    R(X + shake, Y + 1, w, 1, COL.oakL);
    for (let i = 0; i < 4; i++) R(X + 4 + i * 15 + shake, Y + 3, 1, 12, COL.oakD);
    R(X + w - 12 + shake, Y + 6, 6, 3, '#d9b25a');
  }
}

function drawCopier() {      // Büro-Multifunktionsgerät
  const C = G.copier, t = clockT, CC = CONFIG.copier;
  const X = sx(0.2), W = 60, Yb = sy(9.75), H = 76, Dp = 24, top = Yb - H;
  softShadow(X + W / 2, Yb + 2, W / 2 + 4, 4);
  if ((C.tray > 0 && blink(3)) || (C.jam && blink(5))) { ctx.fillStyle = C.jam ? 'rgba(232,83,74,.55)' : 'rgba(247,209,84,.55)'; ctx.fillRect(X - 4, top - Dp - 4, W + 8, H + Dp + 8); }
  ctx.save(); if (C.shake > 0) ctx.translate(Math.round(rand(-1.5, 1.5)), Math.round(rand(-1, 1)));
  // Oberseite: Scanner mit Vorlageneinzug
  R(X, top - Dp, W, Dp, '#d6d6dc'); R(X, top - Dp, W, 1, '#ececf0');
  R(X + 2, top - Dp + 2, W - 18, Dp - 6, '#c3c3ca'); R(X + 2, top - Dp + 2, W - 18, 1, '#d6d6dc');
  R(X + 6, top - Dp + 4, W - 28, 8, COL.white); R(X + 8, top - Dp + 6, W - 34, 1, '#c9c6bd'); R(X + 8, top - Dp + 9, W - 38, 1, '#c9c6bd');
  R(X + W - 14, top - Dp + 4, 12, Dp - 8, '#b5b5bd');
  // Front
  R(X, top, W, H, '#ececf0'); R(X, top, W, 2, '#b9b9c1'); R(X, top + 2, W, 10, '#d4d5db');
  R(X + W - 2, top, 2, H, '#c4c4cc'); R(X, top, 1, H, '#f8f8fa');
  // Bedienfeld mit Touch-Display
  const warming = C.printing && C.warm < CC.warmup;
  let scr = '#4f8fc9';
  if (C.jam) scr = blink(5) ? PAL.red : '#7a2a2a';
  else if (warming) scr = PAL.orange;
  else if (C.cool > 0) scr = '#7fb3e0';
  else if (C.printing) scr = '#7cc47a';
  R(X + W - 24, top + 2, 24, 13, '#3a3d46');
  R(X + W - 22, top + 4, 16, 8, scr);
  R(X + W - 20, top + 5, 6, 1, 'rgba(255,255,255,.6)'); R(X + W - 20, top + 8, 10, 1, 'rgba(255,255,255,.35)');
  if (warming) R(X + W - 22, top + 10, Math.round(16 * C.warm / CC.warmup), 2, '#fff3c0');
  if (C.cool > 0) R(X + W - 22, top + 10, Math.max(1, Math.round(16 * C.cool / CC.cooldown)), 2, COL.white);
  R(X + W - 4, top + 6, 2, 2, C.printing && blink(6) ? '#7cc47a' : C.tray > 0 ? PAL.yellow : '#6b7280');
  // Ausgabefach in der Mitte
  R(X + 4, top + 16, W - 12, 18, '#3f424b'); R(X + 4, top + 16, W - 12, 2, '#2b2d34');
  for (let i = 0; i < Math.min(C.tray, 6); i++) R(X + 8, top + 30 - i * 2, W - 24, 2, i % 2 ? '#f0ece4' : COL.white);
  if (C.printing && !warming && !C.jam && !(C.rattle > 0)) {
    const slide = Math.round((C.t / CC.printEvery) * (W - 28));
    R(X + W - 12 - slide, top + 19, Math.min(slide + 2, W - 24), 2, COL.white);
    R(X + 4, top + 4 + Math.round(Math.sin(t * 10) * 2 + 2), W - 32, 1, '#bfe3f5');
  }
  if (C.jam) { R(X - 5, top + 22, 9, 6, COL.white); R(X - 7, top + 24, 4, 4, '#e6e1d6'); R(X - 4, top + 23, 2, 1, '#c9c6bd'); }
  R(X + 6, top + 38, 14, 2, '#9aa0aa'); R(X + W - 10, top + 38, 4, 6, '#d4d5db');
  for (let i = 0; i < 3; i++) {                          // Papierschubladen
    const y = top + 42 + i * 10;
    R(X + 2, y, W - 4, 8, '#e2e2e8'); R(X + 2, y + 8, W - 4, 2, '#b9b9c1');
    R(X + W / 2 - 8, y + 2, 16, 2, '#7d8590'); R(X + W / 2 - 8, y + 2, 16, 1, '#9aa2ab');
    R(X + 6, y + 3, 4, 2, '#3d7fc4');
  }
  R(X + 4, Yb, 6, 2, COL.ink); R(X + W - 10, Yb, 6, 2, COL.ink);
  if (has('netprint')) {                                // Netzwerkdrucker: Antenne + WLAN-Lämpchen + AUTO
    const ax = X + W - 8, ay = top - Dp;
    R(ax, ay - 20, 2, 20, '#3a3d46'); disc(ax + 1, ay - 21, 2, blink(1.5) ? '#7cc47a' : '#3a5a3a');
    for (let i = 1; i <= 2; i++) { ctx.strokeStyle = `rgba(92,200,192,${(0.5 + 0.5 * Math.sin(t * 3 - i)).toFixed(2)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ax + 1, ay - 21, 3 + i * 3, -2.4, -0.7); ctx.stroke(); }
    const off = G.exam && !G.printerOn;
    R(X + W - 22, top + 4, 16, 8, off ? '#22242a' : '#2b3a33'); if (!off) ltext('AUTO', X + W - 21, top + 6, '#7cc47a', 1);
    if (G.printerOn) for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; ltext('~', X + W + 2 + ph * 10, top + 10 + i * 12 - ph * 6, `rgba(255,243,192,${(1 - ph).toFixed(2)})`, 2); }
  }
  if (has('techteam')) {                                // Werkzeugkiste neben dem Kopierer
    const tx = X + W + 6, ty = Yb - 14;
    R(tx, ty, 22, 12, '#c0503a'); R(tx, ty, 22, 3, '#e06a52'); R(tx + 7, ty - 4, 8, 2, '#3a3d46'); R(tx + 7, ty - 4, 2, 4, '#3a3d46'); R(tx + 13, ty - 4, 2, 4, '#3a3d46'); R(tx + 9, ty + 5, 4, 2, '#d9b25a');
  }
  const lv = upLevel('copier');
  if (lv >= 1) { R(X + 24, top + 36, 10, 6, '#7cc47a'); R(X + 26, top + 38, 6, 2, COL.white); }
  if (lv >= 2) { R(X, top + 12, 2, H - 12, '#3d7fc4'); R(X + W - 4, top + 12, 2, H - 12, '#3d7fc4'); }
  if (lv >= 3) { R(X - 10, top + 12, 10, 28, '#d6d6dc'); R(X - 10, top + 12, 10, 2, '#b9b9c1'); R(X - 8, top + 20, 6, 2, COL.white); R(X - 8, top + 26, 6, 2, COL.white); }
  if (C.cool > 0) for (let i = 0; i < 4; i++) {
    const ph = (t * 0.8 + i / 4) % 1;
    R(X + 10 + i * 12 + Math.round(Math.sin(t * 3 + i) * 3), top - Dp - 4 - ph * 22, 2, 4, `rgba(255,255,255,${(0.7 * (1 - ph)).toFixed(2)})`);
  }
  ctx.restore();
}

/* ======================================================= Azubis */
function drawDesk(k) {
  const d = CONFIG.kids.deskWidth;
  const b = box(k.cx - d / 2, k.dy, d, 0.55, 14, COL.birch, '#8a8f98', COL.birchD);
  const X = b.X, Y = b.Y;
  R(X, Y, b.W, 1, COL.birchL);
  R(X + 3, Y + 4, 20, 1, shade(COL.birch, -0.06)); R(X + 30, Y + 10, 18, 1, shade(COL.birch, -0.06));
  R(X, b.front, b.W, 3, COL.birchD);                                   // Plattenkante
  R(X + 3, b.front + 3, 13, 9, 'rgba(0,0,0,.12)'); R(X + 2, b.front + 3, 3, 11, COL.metal); R(X + b.W - 5, b.front + 3, 3, 11, COL.metal);
  if (!isSeated(k)) return;
  const iy = Y + 2;
  if (k.item === 0) { R(X + 18, iy - 6, 24, 13, '#3a3d46'); R(X + 19, iy - 5, 22, 1, '#555c68'); disc(X + 30, iy, 2, '#6b7280'); }   // Laptop (Rückseite)
  if (k.item === 1) {                                                  // Multimeter mit Messleitungen
    R(X + 36, iy, 10, 13, '#f2c14e'); R(X + 37, iy + 1, 8, 4, '#2b3a33'); R(X + 38, iy + 2, 5, 1, '#7cc47a'); disc(X + 41, iy + 9, 2, COL.ink);
    R(X + 46, iy + 4, 6, 1, '#d94a3a'); R(X + 46, iy + 8, 5, 1, COL.ink);
    R(X + 16, iy + 2, 14, 10, COL.white); R(X + 18, iy + 4, 9, 1, '#b0c4de'); R(X + 18, iy + 7, 7, 1, '#b0c4de');
  }
  if (k.item === 2) { disc(X + 42, iy + 6, 5, '#9aa2ab'); disc(X + 42, iy + 6, 2, '#6b7280'); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; px(X + 42 + Math.cos(a) * 6, iy + 6 + Math.sin(a) * 6, '#9aa2ab'); } R(X + 16, iy + 2, 16, 10, COL.white); R(X + 18, iy + 5, 10, 1, '#b0c4de'); }
  if (k.item === 3) { R(X + 16, iy + 2, 16, 10, COL.white); R(X + 18, iy + 5, 10, 1, '#b0c4de'); R(X + 36, iy + 6, 16, 2, '#c9ccd1'); R(X + 36, iy + 2, 2, 6, '#c9ccd1'); R(X + 42, iy + 2, 2, 6, '#c9ccd1'); R(X + 52, iy + 1, 3, 9, '#5cc8c0'); }
  if (k.state === 'work' || k.state === 'fidget') R(X + 32, iy + 1, 2, 9, '#3d5f8a');
  if (has('tables') && k.r === 0) {                    // Gruppentische: Tischaufsteller in Gruppenfarbe
    const gc = k.c < 2 ? '#3d7fc4' : '#e8853a', gx = k.c % 2 ? X + 2 : X + b.W - 12;
    R(gx, iy - 8, 10, 9, gc); R(gx + 1, iy - 7, 8, 1, shade(gc, 0.3)); ltext(k.c < 2 ? 'A' : 'B', gx + 3, iy - 6, COL.white, 1);
  }
}

// Haare je Stil. turn: 0 Rücken, 1 Profil, 2 von vorne. side: Blickrichtung im Profil.
function drawHair(k, x, y, turn, side) {
  const h = k.hair, hl = shade(h, 0.22), hd = shade(h, -0.3);
  const st = k.style, t = clockT;
  const back = side > 0 ? x : x + 9;                         // Hinterkopf-Seite im Profil
  if (st === 'cap') {
    const c = k.cap || '#2f2f38';
    if (turn === 0) { R(x, y - 2, 16, 9, c); R(x + 2, y - 3, 12, 1, c); R(x + 3, y + 7, 10, 3, shade(c, -0.25)); R(x + 3, y, 6, 1, shade(c, 0.25)); R(x, y + 7, 3, 5, h); R(x + 13, y + 7, 3, 5, h); }
    else if (turn === 1) { R(x, y - 2, 16, 7, c); R(side > 0 ? x - 4 : x + 14, y + 3, 6, 2, shade(c, -0.25)); R(back, y + 5, 7, 5, h); }
    else { R(x, y - 2, 16, 6, c); R(x + 7, y - 3, 2, 1, shade(c, 0.3)); R(x, y + 4, 2, 6, h); R(x + 14, y + 4, 2, 6, h); }
    return;
  }
  if (st === 'afro') {
    if (turn === 0) { R(x - 3, y - 5, 22, 17, h); R(x - 1, y - 7, 18, 2, h); R(x - 2, y + 12, 20, 2, h); }
    else { R(x - 3, y - 6, 22, 9, h); R(x - 1, y - 8, 18, 2, h); R(turn === 1 ? (side > 0 ? x - 3 : x + 13) : x - 3, y + 3, turn === 1 ? 6 : 4, 8, h); if (turn === 2) R(x + 15, y + 3, 4, 8, h); }
    for (let i = 0; i < 14; i++) px(x - 2 + (i * 7) % 20, y - 5 + (i * 5) % 14, i % 2 ? hl : hd);
    return;
  }
  if (st === 'curly') {
    if (turn === 0) { R(x - 1, y - 3, 18, 15, h); for (let i = 0; i < 6; i++) disc(x + 1 + i * 3, y + 12, 1, h); }
    else { R(x - 1, y - 3, 18, 6, h); R(turn === 1 ? back - 1 : x - 1, y + 2, turn === 1 ? 8 : 3, 10, h); if (turn === 2) R(x + 14, y + 2, 3, 10, h); }
    for (let i = 0; i < 10; i++) px(x + (i * 5) % 16, y - 2 + (i * 3) % 10, i % 2 ? hl : hd);
    return;
  }
  if (st === 'undercut') {
    const dy = k.dye || h;
    if (turn === 0) { R(x, y + 2, 16, 10, hd); R(x + 1, y - 3, 14, 7, dy); R(x + 3, y - 3, 6, 1, shade(dy, 0.3)); }
    else if (turn === 1) { R(x, y - 3, 16, 5, dy); R(side > 0 ? x + 9 : x - 2, y + 1, 9, 3, dy); R(back, y + 2, 7, 7, hd); }
    else { R(x, y - 3, 16, 5, dy); R(x + 6, y + 1, 9, 3, dy); R(x, y + 2, 2, 6, hd); R(x + 14, y + 2, 2, 6, hd); }
    return;
  }
  if (st === 'buzz') {
    if (turn === 0) R(x + 1, y - 1, 14, 11, h); else R(x + 1, y - 1, 14, 4, h);
    for (let i = 0; i < 8; i++) px(x + 2 + (i * 5) % 12, y + (i * 3) % (turn === 0 ? 9 : 3), hl);
    return;
  }
  // Grundform kurz (für short, long, bun, braids, ponytail)
  if (turn === 0) { R(x, y - 1, 16, 12, h); R(x + 2, y - 2, 12, 1, h); R(x + 1, y + 11, 14, 1, h); R(x + 4, y, 6, 1, hl); R(x + 3, y + 1, 2, 1, hl); }
  else if (turn === 1) { R(x, y - 2, 16, 5, h); R(back, y + 2, 7, 8, h); R(x + 4, y - 1, 5, 1, hl); }
  else { R(x, y - 2, 16, 5, h); R(x + 3, y + 3, 5, 2, h); R(x + 10, y + 3, 4, 1, h); R(x, y + 3, 2, 6, h); R(x + 14, y + 3, 2, 6, h); R(x + 4, y - 1, 5, 1, hl); }
  if (st === 'long') {
    if (turn === 0) R(x - 1, y + 4, 18, 18, h);
    else if (turn === 1) R(back, y + 3, 7, 18, h);
    else { R(x - 1, y + 3, 3, 18, h); R(x + 14, y + 3, 3, 18, h); }
    R(turn === 0 ? x + 4 : back + 2, y + 8, 1, 10, hd);
  } else if (st === 'bun') {
    disc(x + 8 + (turn === 1 ? -side * 3 : 0), y - 4, 4, h); px(x + 7, y - 6, hl);
  } else if (st === 'braids') {
    for (const bxx of turn === 0 ? [x + 2, x + 11] : turn === 1 ? [back + 2] : [x - 1, x + 14]) for (let i = 0; i < 6; i++) R(bxx, y + 9 + i * 2, 3, 2, i % 2 ? hd : h);
  } else if (st === 'ponytail') {
    const sw = Math.round(Math.sin(t * 2 + k.phase) * 1.5);
    if (turn === 0) { R(x + 6 + sw, y + 9, 4, 12, h); R(x + 6, y + 9, 4, 2, '#5cc8c0'); }
    else if (turn === 1) { R((side > 0 ? x - 3 : x + 15) - side * sw, y + 4, 4, 11, h); }
  }
}

function drawHead(k, x, y, turn, side, mood) {
  const sk = k.skin, skd = shade(sk, -0.14);
  const closed = ((clockT + (k.phase || 0)) % 4.3) < 0.13;              // blinzeln
  round16(x, y, sk);
  if (turn === 0) { R(x + 13, y + 3, 3, 10, skd); R(x - 1, y + 7, 2, 4, sk); R(x + 15, y + 7, 2, 4, skd); }
  else if (turn === 1) {
    const ex = side > 0 ? x + 11 : x + 3;
    if (closed) R(ex, y + 9, 2, 1, PAL.dark); else { R(ex, y + 7, 2, 3, PAL.dark); px(ex + (side > 0 ? 1 : 0), y + 7, COL.white); }
    px(side > 0 ? x + 16 : x - 1, y + 10, sk);                                   // Nase
    R(side > 0 ? x + 10 : x + 4, y + 13, 3, 1, mood === 'open' ? '#8a2a2a' : shade(sk, -0.3));
    R(side > 0 ? x + 9 : x + 4, y + 10, 3, 2, 'rgba(242,143,143,.55)');
    R(side > 0 ? x : x + 13, y + 7, 3, 4, skd);                                   // Ohr
    if (k.glasses) { R(ex - 2, y + 6, 6, 1, '#3a2a2a'); R(ex - 2, y + 6, 1, 5, '#3a2a2a'); R(ex + 3, y + 6, 1, 5, '#3a2a2a'); R(ex - 2, y + 10, 6, 1, '#3a2a2a'); }
    if (k.beard) R(side > 0 ? x + 6 : x + 2, y + 12, 8, 4, shade(k.hair, -0.1));
  } else {
    if (closed || mood === 'laugh') { R(x + 4, y + 9, 2, 1, PAL.dark); R(x + 10, y + 9, 2, 1, PAL.dark); }
    else { R(x + 4, y + 7, 2, 3, PAL.dark); R(x + 10, y + 7, 2, 3, PAL.dark); px(x + 4, y + 7, COL.white); px(x + 10, y + 7, COL.white); }
    R(x + 2, y + 11, 3, 2, 'rgba(242,143,143,.6)'); R(x + 11, y + 11, 3, 2, 'rgba(242,143,143,.6)');
    if (mood === 'open') { R(x + 6, y + 12, 4, 3, '#7a2222'); R(x + 7, y + 14, 2, 1, '#e8766a'); }
    else if (mood === 'laugh') { R(x + 5, y + 12, 6, 2, '#7a2222'); R(x + 5, y + 12, 6, 1, COL.white); }
    else { R(x + 6, y + 13, 4, 1, shade(sk, -0.35)); px(x + 5, y + 12, shade(sk, -0.35)); px(x + 10, y + 12, shade(sk, -0.35)); }
    if (k.glasses) { for (const gx of [x + 2, x + 8]) { R(gx, y + 6, 6, 1, '#3a2a2a'); R(gx, y + 10, 6, 1, '#3a2a2a'); R(gx, y + 6, 1, 5, '#3a2a2a'); R(gx + 5, y + 6, 1, 5, '#3a2a2a'); } }
    if (k.beard) { R(x + 1, y + 11, 2, 4, shade(k.hair, -0.1)); R(x + 13, y + 11, 2, 4, shade(k.hair, -0.1)); R(x + 3, y + 14, 10, 2, shade(k.hair, -0.1)); }
  }
  drawHair(k, x, y, turn, side);
  if (k.phones) {                                                                  // Kopfhörer
    if (turn === 0) { R(x - 1, y - 2, 18, 2, '#2f2f38'); R(x - 2, y + 6, 4, 6, '#d94a3a'); R(x + 14, y + 6, 4, 6, '#d94a3a'); }
    else if (turn === 1) { R(x + 1, y - 2, 14, 2, '#2f2f38'); R(side > 0 ? x + 1 : x + 11, y + 6, 4, 6, '#d94a3a'); }
    else { R(x - 1, y - 2, 18, 2, '#2f2f38'); R(x - 3, y + 6, 4, 6, '#d94a3a'); R(x + 15, y + 6, 4, 6, '#d94a3a'); }
  }
}

function drawKid(k) {
  const X = sx(k.x), Y = sy(k.y), t = clockT;
  // Stuhl (Holzsitz, Metallbeine)
  softShadow(X, Y, 13, 3);
  R(X - 10, Y - 16, 20, 4, COL.oakD); R(X - 9, Y - 12, 2, 12, COL.metal); R(X + 7, Y - 12, 2, 12, COL.metal);
  if (!isSeated(k)) { R(X - 10, Y - 28, 20, 8, COL.oak); R(X - 10, Y - 28, 20, 2, COL.oakL); return; }   // leerer Platz

  let oy = 0, headY = 0, turn = 0, jit = 0, mood = '';
  const st = k.state;
  if (st === 'work') headY = Math.sin(t * 3 + k.phase) > 0.75 ? 2 : 0;
  if (st === 'done') headY = -2;
  if (st === 'fidget') { jit = Math.floor(t * 9 + k.phase) % 2 ? 1 : -1; turn = Math.sin(t * 2.5 + k.phase) > 0.3 ? 1 : 0; }
  if (st === 'idle') turn = 1;
  if (st === 'cheat') turn = 1;
  if (st === 'wc') jit = Math.floor(t * 6 + k.phase) % 2 ? 1 : -1;
  if (st === 'phoneSoon') headY = 2;
  if (st === 'phone') { turn = 2; mood = 'smile'; }
  if (st === 'loud') { turn = 2; mood = 'open'; oy = -8 - Math.abs(Math.round(Math.sin(t * 12 + k.phase) * 4)); }
  if (G && G.laughT > 0 && (st === 'work' || st === 'fidget')) { turn = 2; mood = 'laugh'; oy = -Math.abs(Math.round(Math.sin(t * 14 + k.phase) * 2)); }
  if (k.annoyed > 0) turn = 1;
  if (G && backTurned() && st === 'work' && Math.sin(t * 1.5 + k.phase) > 0.2) turn = 1;
  const side = st === 'cheat' ? k.cheatSide : k.flip ? -1 : 1;
  const bx = X + jit + (st === 'cheat' ? k.cheatSide * 3 : 0) + (st === 'idle' ? Math.round(Math.sin(t * 2.2 + k.phase) * 2) : 0);

  // Jacke
  const jc = k.jacket, jd = shade(jc, -0.2), jl = shade(jc, 0.12);
  rr(bx - 10, Y - 31 + oy, 20, 19, jc, 3);
  R(bx + 6, Y - 29 + oy, 3, 16, jd); R(bx - 9, Y - 28 + oy, 2, 14, jl);
  if (oy === 0) R(bx - 1, Y - 28, 2, 14, jd);                                 // Rückennaht
  R(bx - 10, Y - 23 + oy, 20, 2, k.accent);
  R(bx - 3, Y - 31 + oy, 6, 3, jd);
  // Arme je Zustand
  if (st === 'loud') { R(bx - 15, Y - 44 + oy, 5, 15, jc); R(bx + 10, Y - 44 + oy, 5, 15, jc); R(bx - 15, Y - 47 + oy, 5, 4, k.skin); R(bx + 10, Y - 47 + oy, 5, 4, k.skin); }
  else if (st === 'done') { R(bx - 11, Y - 44, 4, 7, k.skin); R(bx + 7, Y - 44, 4, 7, k.skin); }
  else if (st === 'idle') R(bx + (side > 0 ? 9 : -13), Y - 29, 4, 11, jc);
  else if (st === 'wait' || st === 'question' || st === 'wc') { const wv = Math.round(Math.sin(t * 6 + k.phase) * 2); R(bx + 9, Y - 56 + wv, 4, 26, jc); R(bx + 9, Y - 60 + wv, 4, 4, k.skin); R(bx - 13, Y - 28, 4, 7, jc); }
  else { R(bx - 13, Y - 28, 4, 7, jc); R(bx + 9, Y - 28, 4, 7, jc); }
  // schmale Stuhllehne vor dem Rücken
  R(X - 9, Y - 17, 18, 3, COL.oak); R(X - 9, Y - 17, 18, 1, COL.oakL); R(X - 9, Y - 17, 2, 6, COL.oakD); R(X + 7, Y - 17, 2, 6, COL.oakD);
  // Kopf
  const hy = Y - 47 + oy + headY;
  drawHead(k, bx - 8, hy, turn, side, mood);
  if (st === 'phoneSoon') {                                    // Handy vibriert in der Tasche
    const v = blink(20) ? 1 : -1;
    R(bx - 4 + v, Y - 20, 6, 9, PAL.dark); R(bx - 3 + v, Y - 19, 4, 5, '#5ca7e8');
    if (blink(6)) { R(bx - 9, Y - 20, 1, 6, COL.white); R(bx + 5, Y - 20, 1, 6, COL.white); }
  }
  if (st === 'phone') { R(bx + 9, hy + 2, 6, 10, PAL.dark); R(bx + 10, hy + 3, 4, 6, '#9fd3f0'); }
  if (st === 'loud' && blink(8)) { R(bx - 18, hy + 2, 4, 2, COL.white); R(bx + 14, hy + 2, 4, 2, COL.white); R(bx - 20, hy + 8, 5, 2, COL.white); R(bx + 15, hy + 8, 5, 2, COL.white); }
  if (k.annoyed > 0) R(bx + (side > 0 ? 3 : -6), hy + 13, 4, 1, PAL.dark);
}

function sash(X, Y) {            // Klassensprecher-Schärpe (gold mit Klassensprecher+)
  const c = has('helper2') ? '#f2c14e' : '#d94a3a';
  for (let i = 0; i < 9; i++) R(X - 9 + i * 2, Y - 30 + i * 2, 3, 2, c);
  disc(X + 5, Y - 18, 2, has('helper2') ? COL.white : PAL.yellow);
}
function drawWalker(k) {          // Zuspätkommer, WC-Gänger, Klassensprecher
  const X = sx(k.wx), Y = sy(k.wy), step = Math.round(Math.sin(k.walk) * 2), bob = Math.abs(Math.round(Math.sin(k.walk)));
  softShadow(X, Y, 11, 3);
  R(X - 6, Y - 12 + (step > 0 ? -2 : 0), 5, 12, '#3a3f55'); R(X + 1, Y - 12 + (step < 0 ? -2 : 0), 5, 12, '#3a3f55');
  R(X - 7, Y - 2, 6, 2, '#26232e'); R(X + 1, Y - 2, 6, 2, '#26232e');
  const jc = k.jacket;
  rr(X - 10, Y - 30 - bob, 20, 19, jc, 3); R(X + 6, Y - 28 - bob, 3, 16, shade(jc, -0.2)); R(X - 10, Y - 22 - bob, 20, 2, k.accent);
  R(X - 13, Y - 28 - bob, 4, 13, jc); R(X + 9, Y - 28 - bob, 4, 13, jc);
  R(X + 3, Y - 30 - bob, 3, 18, '#3a3d46');                   // Rucksackgurt
  if (has('helper') && k.i === 0) sash(X, Y - bob + 1);
  if (k.job && k.job.kind === 'tech' && k.job.stage === 'fix') { const w = Math.round(Math.sin(clockT * 16) * 2); R(X - 18, Y - 24 - bob + w, 8, 3, '#9aa2ab'); R(X - 20, Y - 26 - bob + w, 3, 7, '#9aa2ab'); R(X - 12, Y - 24 - bob + w, 3, 3, k.skin); }
  if (k.job && k.job.has) { R(X + 9, Y - 20 - bob, 8, 10, COL.white); R(X + 10, Y - 17 - bob, 5, 1, '#c9d3dc'); R(X + 9, Y - 16 - bob, 4, 4, k.skin); }   // Blatt in der Hand
  const turn = k.face === 'up' ? 0 : k.face === 'down' ? 2 : 1, side = k.face === 'left' ? -1 : 1;
  drawHead(k, X - 8, Y - 46 - bob, turn, side, 'smile');
}

/* ===================================================== Lehrkräfte */
// Auswahl über CONFIG.teacher (Index). Jede Lehrkraft: Farben, Statur, Frisur, Brille, Bart.
const TEACHERS = [
  { name: 'Frau Sommer', walkAnim: true, skin: '#f2c9a0', hair: '#7a4a2a', style: 'bun',   glasses: 'rect',  coat: '#d9a441', shirt: '#fff1d6', pants: '#3f4f7a', w: 22, legs: 12, body: 21 },
  { name: 'Herr Brandt', walkAnim: true, skin: '#f0c4a0', hair: '#38373d', temples: '#a9a7ad', style: 'wild', glasses: 'round', coat: '#7a9cc0', shirt: '#7a9cc0', pants: '#4a4440', w: 23, legs: 11, body: 22, belly: true, beard: 'stubble', buttonShirt: true },
  { name: 'Herr Demir',  walkAnim: true, skin: '#f2c6a4', hair: '#9a7a58', style: 'bald', glasses: 'thick', glColor: '#151417', coat: '#24304a', shirt: '#24304a', pants: '#4a6a9a', w: 22, legs: 13, body: 22, beard: 'stubble', grin: true, fleece: true, logo: true, jeans: true, shoe: '#7a2236', sneakers: true },
  { name: 'Frau Roth', walkAnim: true,   skin: '#f9dcc0', hair: '#c8502a', style: 'long',  glasses: 'round', coat: '#4f8a6a', shirt: '#f2e6d0', pants: '#4a3a5a', w: 16, legs: 9,  body: 17, scarf: '#e8b84a' },
  { name: 'Frau Adeyemi', walkAnim: true,skin: '#f6d6bc', hair: '#1a1418', style: 'bob',   glasses: 'cat',   coat: '#7a4a8a', shirt: '#f2e6d0', pants: '#2f2f38', w: 20, legs: 11, body: 21, necklace: true },
];

function drawGlasses(T0, x, y, s) {           // x,y: linke obere Ecke des linken Glases
  if (T0.glasses === 'none' && !T0.gl) return;
  const c = T0.gl || T0.glColor || '#5a3a2a';
  const one = gx => {
    if (T0.glasses === 'thick') { R(gx, y - 1, 6, 2, c); R(gx, y + 4, 6, 1, c); R(gx, y, 1, 5, c); R(gx + 5, y, 1, 5, c); R(gx + 1, y + 1, 4, 3, 'rgba(255,255,255,.12)'); }
    else if (T0.glasses === 'round') { R(gx + 1, y, 4, 1, c); R(gx + 1, y + 4, 4, 1, c); R(gx, y + 1, 1, 3, c); R(gx + 5, y + 1, 1, 3, c); }
    else if (T0.glasses === 'cat') { R(gx, y, 6, 1, c); R(gx, y + 4, 6, 1, c); R(gx, y, 1, 5, c); R(gx + 5, y, 1, 5, c); px(gx + (gx === x ? -1 : 6), y - 1, c); }
    else { R(gx, y, 6, 1, c); R(gx, y + 4, 6, 1, c); R(gx, y, 1, 5, c); R(gx + 5, y, 1, 5, c); }
  };
  if (s === 0) { one(x); one(x + 7); px(x + 6, y + 1, c); }
  else one(x);
}

function drawTeacherHair(T0, hx, hy, face, t) {
  const h = T0.hair, hl = shade(h, 0.25), hd = shade(h, -0.25);
  const wig = Math.round(Math.sin(t * 2) * 0.6 + gust * Math.sin(t * 9));
  if (T0.style === 'wild') {                               // wilde graue Mähne
    const hi = T0.hairHi || hl;                            // grau melierte, etwas zerzauste Haare
    const tufts = [[-2, 2, 4, 7], [16, 2, 4, 7], [1, -3, 5, 4], [6, -4, 6, 4], [12, -3, 5, 4]];
    tufts.forEach(([dx, dy, w, hh], i) => R(hx + dx + (i % 2 ? wig : 0), hy + dy, w, hh, h));
    if (face === 'up') R(hx - 1, hy, 20, 14, h);
    else R(hx + 1, hy - 1, 16, 3, h);
    if (T0.temples) {                                       // nur an den Schläfen grau
      const tm = T0.temples, mid = shade(tm, -0.35);
      if (face !== 'right') { R(hx - 2, hy + 6, 2, 3, tm); px(hx, hy + 7, mid); px(hx - 1, hy + 5, mid); px(hx, hy + 8, tm); }
      if (face !== 'left') { R(hx + 18, hy + 6, 2, 3, tm); px(hx + 17, hy + 7, mid); px(hx + 18, hy + 5, mid); px(hx + 17, hy + 8, tm); }
      for (const [dx, dy] of [[4, -2], [9, -3], [13, -2]]) px(hx + dx, hy + dy, shade(h, 0.25));
    } else {
      for (const [dx, dy] of [[-1, 4], [17, 5], [3, -2], [8, -3], [13, -2], [-2, 7], [18, 3], [10, -1]]) px(hx + dx, hy + dy, hi);
      if (face === 'up') for (const [dx, dy] of [[3, 4], [9, 6], [14, 3], [6, 9]]) px(hx + dx, hy + dy, hi);
    }
    return;
  }
  if (T0.style === 'bald') {                               // Glatze mit Haarkranz
    if (T0.thinTop) for (const [dx, dy] of [[4, 0], [7, -1], [10, 0], [13, 1], [5, 2], [11, 2], [3, 3], [14, 3], [8, 1]]) px(hx + dx, hy + dy, shade(h, 0.1));
    R(hx + 6, hy + 1, 3, 2, 'rgba(255,255,255,.4)');
    if (face === 'up') { R(hx, hy + 12, 18, 2, h); R(hx + 2, hy + 14, 14, 1, h); for (let i = 0; i < 6; i++) px(hx + 1 + i * 3, hy + 12, shade(h, 0.3)); }
    else if (face === 'down') { R(hx - 1, hy + 4, 3, 9, h); R(hx + 16, hy + 4, 3, 9, h); }
    else { R(face === 'left' ? hx + 14 : hx, hy + 5, 4, 8, h); R(face === 'left' ? hx + 12 : hx + 4, hy + 11, 2, 2, h); }
    return;
  }
  if (T0.style === 'long') {                               // lange rote Haare
    if (face === 'up') { R(hx - 1, hy - 2, 20, 18, h); R(hx, hy + 16, 18, 16, h); R(hx + 4, hy + 4, 1, 26, hd); R(hx + 12, hy + 6, 1, 22, hd); R(hx + 6, hy - 1, 6, 1, hl); }
    else if (face === 'down') { R(hx - 1, hy - 2, 20, 6, h); R(hx + 3, hy + 3, 6, 2, h); R(hx - 2, hy + 3, 4, 26, h); R(hx + 16, hy + 3, 4, 26, h); R(hx + 6, hy - 1, 6, 1, hl); R(hx - 1, hy + 10, 1, 16, hd); }
    else { const s = face === 'left' ? -1 : 1; R(hx - 1, hy - 2, 20, 6, h); R(s > 0 ? hx - 2 : hx + 10, hy + 2, 10, 28, h); R(s > 0 ? hx + 1 : hx + 15, hy + 6, 1, 20, hd); }
    return;
  }
  if (T0.style === 'bob') {                                // schulterlanger Bob mit grauer Strähne
    if (face === 'up') { R(hx - 2, hy - 2, 22, 22, h); }
    else if (face === 'down') { R(hx - 1, hy - 2, 20, 5, h); R(hx + 9, hy + 3, 8, 2, h); R(hx - 2, hy + 2, 4, 18, h); R(hx + 16, hy + 2, 4, 18, h); R(hx - 2, hy + 2, 1, 16, hl); }
    else { const s = face === 'left' ? -1 : 1; R(hx - 1, hy - 2, 20, 6, h); R(s > 0 ? hx - 2 : hx + 9, hy + 2, 11, 18, h); }
    return;
  }
  // Dutt (Frau Sommer)
  if (face === 'up') { R(hx - 1, hy - 2, 20, 16, h); disc(hx + 9, hy - 5, 5, h); R(hx + 6, hy - 1, 6, 1, hl); }
  else { R(hx - 1, hy - 2, 20, 6, h); disc(hx + 9, hy - 5, 5, h); if (face === 'down') { R(hx - 1, hy + 4, 3, 10, h); R(hx + 16, hy + 4, 3, 10, h); R(hx + 3, hy + 3, 6, 2, h); } else R(face === 'left' ? hx + 10 : hx - 1, hy + 2, 9, 12, h); }
  R(hx + 4, hy - 7, 3, 2, '#d94a3a');
}

// Zeichnet eine Lehrkraft. o: { face, moving, walk, writing, explaining, carry, give, shoe, gl }
// schräger Strich, Zeile für Zeile (für Beine und Arme im Gehzyklus)
function slant(x0, y0, x1, y1, w, c) {
  const n = Math.max(1, y1 - y0);
  for (let y = y0; y < y1; y++) R(Math.round(x0 + (x1 - x0) * (y - y0) / n), y, w, 1, c);
}

// Gehzyklus in 4 klassischen Pixel-Schritten: 0 Kontakt, 1 Durchschwung, 2 Kontakt (anderes Bein), 3 Durchschwung.
// Körper und Kopf bleiben ruhig, nur die Beine (und ganz leicht die Arme) bewegen sich.
const walkFrame = p => Math.floor(((p % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 2));
function walkLegs(T0, X, Y, L, lw, side, p, shoe, stripe) {
  const pants = T0.pants, far = shade(pants, -0.18), hipY = Y - L, f = walkFrame(p), half = Math.floor(L / 2);
  const leg = (hipX, off, lift, col, shoeCol) => {          // off: Versatz des Fußes, Knie knickt halb so weit
    const fy = Y - lift;
    R(hipX + Math.round(off / 2), hipY, lw, half, col);
    R(hipX + off, hipY + half, lw, fy - hipY - half, col);
    if (T0.jeans) R(hipX + off + (side ? 0 : 1), hipY + half, 1, fy - hipY - half - 1, shade(col, 0.25));
    const sx0 = side ? hipX + off - (side < 0 ? 3 : 0) : hipX + off - 1, sw0 = side ? lw + 3 : lw + 2;
    R(sx0, fy - 2, sw0, 3, shoeCol);
    if (stripe) R(sx0, fy, sw0, 1, COL.white);
  };
  if (side) {
    const hip = Math.round(X - lw / 2);
    const nearOff = [3, 0, -2, 0][f] * side, farOff = [-2, 0, 3, 0][f] * side;
    leg(hip - side, farOff, f === 3 ? 2 : 0, far, shade(shoe, -0.2));     // hinteres Bein
    leg(hip, nearOff, f === 1 ? 2 : 0, pants, shoe);                     // vorderes Bein
  } else {
    leg(X - lw - 1, 0, f === 1 ? 2 : 0, pants, shoe);
    leg(X + 1, 0, f === 3 ? 2 : 0, pants, shoe);
  }
}

function drawTeacherFigure(T0, X, Y, o) {
  const t = clockT, face = o.face || 'down';
  softShadow(X, Y, T0.w / 2 + 2, 3);
  const anim = !!(T0.walkAnim && o.moving), p = o.walk || 0;
  const side = face === 'left' ? -1 : face === 'right' ? 1 : 0;
  const step = o.moving && !anim ? Math.round(Math.sin(o.walk) * 2) : 0;
  const bob = anim ? 0 : o.moving ? Math.abs(Math.round(Math.sin(o.walk))) : 0;     // mit Laufanimation: Kopf und Körper ruhig
  const lw = T0.w < 20 ? 4 : 5, L = T0.legs, B = T0.body, W = T0.w;
  const coat = T0.coat, coatD = shade(coat, -0.2), coatL = shade(coat, 0.15), skin = T0.skin;
  const shoe = o.shoe || '#3a2a22';
  // Beine + Schuhe
  if (anim) walkLegs(T0, X, Y, L, lw, side, p, shoe, o.shoeStripe);
  else {
    R(X - lw - 1, Y - L + (step > 0 ? -2 : 0), lw, L, T0.pants); R(X + 1, Y - L + (step < 0 ? -2 : 0), lw, L, T0.pants);
    if (T0.jeans) { R(X - lw, Y - L + 1 + (step > 0 ? -2 : 0), 1, L - 2, shade(T0.pants, 0.25)); R(X + lw - 1, Y - L + 1 + (step < 0 ? -2 : 0), 1, L - 2, shade(T0.pants, 0.25)); }
    R(X - lw - 2, Y - 2, lw + 2, 3, shoe); R(X + 1, Y - 2, lw + 2, 3, shoe);
    if (o.shoeStripe) { R(X - lw - 2, Y, lw + 2, 1, COL.white); R(X + 1, Y, lw + 2, 1, COL.white); }
  }
  const y0 = Y - bob, top = y0 - L - B;
  const freeArms = !o.writing && !o.explaining && !(o.carry > 0);
  const aw0 = W < 20 ? 3 : 4, al0 = B - 4;
  const narrow = !!(T0.walkAnim && side), Wb = narrow ? W - 6 : W;   // im Profil schmaler
  if (narrow && freeArms) {                                 // hinterer Arm, hinter dem Körper
    const sh = X - aw0 / 2, hd = anim ? side * [-1, 0, 1, 0][walkFrame(p)] : 0;
    slant(sh, top + 3, sh + hd, top + 3 + al0, aw0, shade(coat, -0.32));
    R(Math.round(sh + hd), top + 3 + al0, aw0, 3, shade(skin, -0.15));
  }
  // Oberkörper
  rr(X - Wb / 2, top, Wb, B + 1, coat, 3);
  if (T0.belly) R(X - Wb / 2 - 1, top + 9, Wb + 2, 9, coat);
  R(X + Wb / 2 - 4, top + 2, 3, B - 2, coatD); R(X - Wb / 2 + 1, top + 3, 2, B - 6, coatL);
  if (narrow && T0.fleece) { R(X + side * (Wb / 2 - 2), top + 1, 1, B - 2, '#8a96aa'); for (let i = 0; i < 6; i++) px(X - Wb / 2 + 2 + (i * 5) % (Wb - 4), top + 4 + (i * 7) % (B - 6), shade(coat, 0.12)); }
  if (face === 'down') {
    if (T0.buttonShirt) {                                  // Hemd mit Knopfleiste und Kragen
      R(X - 4, top, 3, 3, shade(coat, 0.3)); R(X + 1, top, 3, 3, shade(coat, 0.3)); R(X, top + 2, 1, B - 3, shade(coat, -0.25));
      for (let i = 0; i < 4; i++) px(X - 1, top + 5 + i * 4, COL.white);
      if (!T0.plain) { for (let i = 0; i < 4; i++) R(X - W / 2 + 2, top + 4 + i * 5, W - 4, 1, shade(coat, -0.08)); }   // feines Karo
      R(X - W / 2 + 4, top + 4, 4, 4, shade(coat, -0.12));
    } else if (T0.fleece) {                                // Fleecejacke mit Reißverschluss
      R(X - 4, top, 8, 3, shade(coat, 0.15)); R(X, top + 2, 1, B - 2, '#8a96aa'); px(X, top + 4, '#c9ccd1');
      for (let i = 0; i < 14; i++) px(X - W / 2 + 2 + (i * 7) % (W - 4), top + 4 + (i * 5) % (B - 6), shade(coat, 0.12));
      if (T0.logo) { R(X + 3, top + 5, 5, 1, '#f29a4e'); px(X + 4, top + 4, '#f29a4e'); px(X + 6, top + 4, '#f29a4e'); R(X + 3, top + 7, 5, 1, '#7cc47a'); }
    } else if (T0.polo) { R(X - 3, top, 6, 4, T0.shirt); R(X - 1, top + 4, 2, 4, coatD); px(X, top + 5, COL.white); px(X, top + 7, COL.white); R(X + 3, top + 6, 4, 3, coatD); }
    else if (!T0.buttonShirt && !T0.fleece) { R(X - 2, top, 4, B - 2, T0.shirt); for (let i = 0; i < 3; i++) px(X - 4, top + 5 + i * 5, shade(coat, -0.4)); }
    if (T0.tie) { R(X - 1, top + 1, 2, 2, T0.tie); R(X - 1, top + 3, 3, 9, T0.tie); }
    if (T0.necklace) for (let i = 0; i < 7; i++) px(X - 3 + i, top + 2 + Math.abs(3 - i) * -0.5 + 3, '#f4f0e6');
    if (T0.scarf) { R(X - W / 2 + 1, top, W - 2, 4, T0.scarf); R(X + 1, top + 4, 3, 7, T0.scarf); }
    if (!T0.polo && !T0.tie && !T0.fleece) R(X + W / 2 - 7, top + 4, 2, 6, '#3d5f8a');      // Stift in der Brusttasche
  } else if (face === 'up' && T0.scarf) R(X - W / 2 + 1, top, W - 2, 4, T0.scarf);
  R(X - Wb / 2, y0 - L - 2, Wb, 2, coatD);
  // Arme
  const aw = W < 20 ? 3 : 4, al = B - 4, ax0 = X - Wb / 2 - aw, ax1 = X + Wb / 2;   // Arme am (im Profil schmaleren) Körper
  if (o.writing) {
    const scr = Math.round(Math.sin(t * 18) * 2);
    R(ax1, top - 12 + scr, aw, al, coat); R(ax1, top - 15 + scr, aw, 4, skin); R(ax0, top + 2, aw, al, coatD);
  } else if (o.explaining) {
    const g = Math.round(Math.sin(t * 6) * 3);
    R(ax0, top - 2 + g, aw, al, coat); R(ax0, top - 5 + g, aw, 4, skin); R(ax1, top + 2, aw, al, coatD);
  } else if (o.carry > 0) {
    if (narrow) R(X - aw / 2 + side * 2, top + 2, aw, al - 5, coatD);                // im Profil: ein Arm nach vorn zum Stapel
    else { R(ax0, top + 2, aw, al - 5, coatD); R(ax1, top + 2, aw, al - 5, coatD); } // Arme nach vorn, Hände am Stapel
  } else if (narrow) {                                            // vorderer Arm schwingt gegengleich zum vorderen Bein
    const sh = X - aw / 2, hd = anim ? side * [-1, 0, 1, 0][walkFrame(p)] : 0;      // nur ganz leichter Armschwung
    slant(sh, top + 2, sh + hd, top + 2 + al, aw, coatD);
    R(Math.round(sh + hd), top + 2 + al, aw, 4, skin);
  } else if (anim) {                                               // vorne/hinten: Arme pendeln
    const f = walkFrame(p), s0 = f === 1 ? 1 : 0, s1 = f === 3 ? 1 : 0;              // Schultern minimal
    R(ax0, top + 2 + s0, aw, al, coatD); R(ax0, top + 2 + al + s0, aw, 4, skin);
    R(ax1, top + 2 + s1, aw, al, coatD); R(ax1, top + 2 + al + s1, aw, 4, skin);
  } else {
    const sw = o.moving ? Math.round(Math.sin(o.walk) * 2) : 0;
    R(ax0, top + 2 + sw, aw, al, coatD); R(ax1, top + 2 - sw, aw, al, coatD);
    R(ax0, top + 2 + al + sw, aw, 4, skin); R(ax1, top + 2 + al - sw, aw, 4, skin);
    if (T0.patches) { R(ax0, top + 9 + sw, aw, 4, shade(coat, -0.35)); R(ax1, top + 9 - sw, aw, 4, shade(coat, -0.35)); }
  }
  // Blätter in der Hand
  if (o.carry > 0 && !o.writing && face !== 'up') {                                 // flacher Stapel vor der Hüfte, mit beiden Händen gehalten
    const n = Math.min(o.carry, 8), side = face === 'left' ? -1 : face === 'right' ? 1 : 0;
    const sw = side ? 14 : W + 4, cx0 = X + side * (W / 2 + 2), sy0 = top + B - 8 - n;
    for (let i = 0; i < n; i++) R(cx0 - sw / 2 + 1, sy0 + 6 + i, sw - 2, 1, i % 2 ? '#d6d0c4' : '#ebe5d9');
    R(cx0 - sw / 2, sy0, sw, 6, COL.white); R(cx0 - sw / 2, sy0, sw, 1, '#fffdf8');
    R(cx0 - sw / 2 + 3, sy0 + 2, sw - 9, 1, '#c9d3dc'); R(cx0 - sw / 2 + 3, sy0 + 4, sw - 12, 1, '#c9d3dc');
    if (o.give) { const wg = Math.round(Math.sin(t * 30) * 2); R(cx0 - sw / 2 + 3 + wg, sy0 - 3, sw - 6, 3, COL.white); R(cx0 - sw / 2 + 3 + wg, sy0 - 3, sw - 6, 1, '#e8e2d6'); }
    if (side) R(cx0 - side * (sw / 2) - 2, sy0 + 2, 4, 5, skin);
    else { R(cx0 - sw / 2 - 2, sy0 + 2, 4, 5, skin); R(cx0 + sw / 2 - 2, sy0 + 2, 4, 5, skin); }
  }
  // Kopf
  const hx = X - 9, hy = top - 17;
  R(hx + 3, hy, 12, 18, skin); R(hx + 1, hy + 1, 16, 16, skin); R(hx, hy + 3, 18, 12, skin);
  R(hx + 7, hy + 17, 4, 2, shade(skin, -0.15));                                         // Hals
  const blinkNow = ((t + (T0.w * 0.37)) % 3.7) < 0.12;
  if (face === 'down') {
    if (blinkNow) { R(hx + 5, hy + 10, 2, 1, PAL.dark); R(hx + 11, hy + 10, 2, 1, PAL.dark); }
    else { R(hx + 5, hy + 8, 2, 3, PAL.dark); R(hx + 11, hy + 8, 2, 3, PAL.dark); px(hx + 5, hy + 8, COL.white); px(hx + 11, hy + 8, COL.white); }
    R(hx + 2, hy + 12, 2, 2, 'rgba(242,143,143,.65)'); R(hx + 14, hy + 12, 2, 2, 'rgba(242,143,143,.65)');
    if (T0.beard === 'short') {
      const bc = shade(T0.hair, 0.2);
      R(hx + 1, hy + 10, 2, 5, bc); R(hx + 15, hy + 10, 2, 5, bc); R(hx + 3, hy + 16, 12, 2, bc); R(hx + 2, hy + 15, 3, 1, bc); R(hx + 13, hy + 15, 3, 1, bc);
      R(hx + 6, hy + 12, 6, 1, bc);
      for (const [dx, dy] of [[4, 16], [9, 17], [13, 16], [1, 12], [16, 11]]) px(hx + dx, hy + dy, T0.hairHi || shade(T0.hair, 0.3));
      R(hx + 6, hy + 14, 6, 2, '#8a4a3a'); R(hx + 6, hy + 14, 6, 1, COL.white); px(hx + 5, hy + 13, '#8a4a3a'); px(hx + 12, hy + 13, '#8a4a3a');
    }
    else if (T0.beard === 'full') { R(hx + 1, hy + 11, 16, 7, T0.hair); R(hx + 3, hy + 18, 12, 2, T0.hair); R(hx + 6, hy + 13, 6, 3, '#8a4a3a'); R(hx + 6, hy + 13, 6, 1, COL.white); R(hx + 4, hy + 11, 10, 1, shade(T0.hair, -0.15)); }
    else {
      if (T0.grin) { R(hx + 5, hy + 13, 8, 3, '#8a3a32'); R(hx + 5, hy + 13, 8, 1, COL.white); R(hx + 6, hy + 15, 6, 1, '#c0605a'); px(hx + 4, hy + 12, '#8a4a3a'); px(hx + 13, hy + 12, '#8a4a3a'); }
      else { R(hx + 6, hy + 14, 6, 2, '#8a4a3a'); R(hx + 6, hy + 14, 6, 1, COL.white); px(hx + 5, hy + 13, '#8a4a3a'); px(hx + 12, hy + 13, '#8a4a3a'); }   // fröhliches Lächeln
      if (T0.beard === 'stubble') for (const [dx, dy] of [[1, 12], [2, 14], [3, 16], [16, 12], [15, 14], [14, 16], [6, 17], [9, 17], [12, 17], [4, 17], [8, 16], [10, 16]]) px(hx + dx, hy + dy, shade(skin, -0.2));
    }
    drawTeacherHair(T0, hx, hy, face, t);
    drawGlasses({ ...T0, gl: o.gl }, hx + 3, hy + 7, 0);
  } else if (face === 'up') {
    drawTeacherHair(T0, hx, hy, face, t);
    R(hx - 1, hy + 7, 2, 4, skin); R(hx + 17, hy + 7, 2, 4, skin);
  } else {
    const s = face === 'left' ? -1 : 1, ex = s > 0 ? hx + 13 : hx + 3;
    if (blinkNow) R(ex, hy + 10, 2, 1, PAL.dark); else R(ex, hy + 8, 2, 3, PAL.dark);
    px(s > 0 ? hx + 18 : hx - 1, hy + 10, skin);
    R(s > 0 ? hx + 12 : hx + 3, hy + 14, 4, 1, '#8a4a3a');
    R(s > 0 ? hx + 11 : hx + 4, hy + 11, 3, 2, 'rgba(242,143,143,.6)');
    if (T0.beard === 'full') R(s > 0 ? hx + 8 : hx + 1, hy + 11, 9, 8, T0.hair);
    if (T0.beard === 'short') { const bc = shade(T0.hair, 0.2); R(s > 0 ? hx + 7 : hx + 2, hy + 16, 9, 2, bc); R(s > 0 ? hx + 5 : hx + 11, hy + 10, 2, 6, bc); }
    if (T0.beard === 'stubble') for (let i = 0; i < 6; i++) px((s > 0 ? hx + 9 : hx + 2) + (i * 3) % 8, hy + 13 + (i % 3), shade(skin, -0.25));
    drawTeacherHair(T0, hx, hy, face, t);
    drawGlasses({ ...T0, gl: o.gl }, ex - 2, hy + 7, s);
  }
}

function drawTeacher() {
  const P = G.p, T0 = TEACHERS[CONFIG.teacher || 0] || TEACHERS[0];
  drawTeacherFigure(T0, sx(P.x), sy(P.y), {
    face: P.face, moving: P.moving, walk: P.walk, writing: G.writing && !(typeof isHall === 'function' && isHall()), explaining: G.explaining || !!(G.labHold && G.labHold.kind === 'help') || !!G.tutor || !!G.hallHold || !!(G.writing && typeof isHall === 'function' && isHall()), carry: G.carry, give: G.give,
    shoe: upLevel('shoes') ? ['', '#e8534a', '#5cc8c0', '#f7d154'][Math.min(3, upLevel('shoes'))] : (T0.shoe || '#3a2a22'), shoeStripe: upLevel('shoes') >= 1 || !!T0.sneakers,
    gl: upLevel('presence') ? ['', '#3d5f8a', '#c9a43e', '#d94a3a'][Math.min(3, upLevel('presence'))] : null,
  });
  if (upLevel('shoes') >= 3 && P.moving && blink(12)) { R(sx(P.x) - 11, sy(P.y) - 3, 2, 2, PAL.yellow); R(sx(P.x) + 10, sy(P.y) - 2, 2, 2, PAL.yellow); }
}

// Kleines Porträt (Data-URL) fürs Auswahlmenü
const portraitCache = {};
function teacherPortrait(idx) {
  if (portraitCache[idx]) return portraitCache[idx];
  const c = document.createElement('canvas'); c.width = 40; c.height = 64;
  const real = ctx; ctx = c.getContext('2d');
  const T0 = TEACHERS[idx];
  drawTeacherFigure(T0, 20, 61, { face: 'down', shoe: T0.shoe, shoeStripe: !!T0.sneakers });
  ctx = real;
  return (portraitCache[idx] = c.toDataURL());
}

// Vorschau-Blatt: alle Lehrkräfte von vorne, Seite, hinten (für die Auswahl)
function drawTeacherSheet() {
  ctx.drawImage(bgCanvas, 0, 0);
  R(0, 0, SW, SH, 'rgba(38,35,46,.35)');
  TEACHERS.forEach((T0, i) => {
    const cx = 80 + i * 152;
    rr(cx - 66, 70, 132, 300, 'rgba(38,35,46,.55)', 6);
    ltext(T0.name.toUpperCase(), cx - (T0.name.length * 4 - 1), 84, PAL.white, 2);
    const sh = { shoe: T0.shoe, shoeStripe: !!T0.sneakers };
    drawTeacherFigure(T0, cx - 38, 210, { face: 'down', ...sh });
    drawTeacherFigure(T0, cx + 2, 210, { face: 'right', ...sh });
    drawTeacherFigure(T0, cx + 40, 210, { face: 'up', ...sh });
    drawTeacherFigure(T0, cx - 20, 330, { face: 'down', carry: 4, ...sh });
    drawTeacherFigure(T0, cx + 24, 330, { face: 'down', explaining: true, ...sh });
  });
}


/* ================================================ Besucher an der Tür */
const NPC_LOOKS = {
  teen:    { name: 'Nachbarklasse', walkAnim: true, skin: '#e8b48a', hair: '#2a1e18', style: 'wild', coat: '#c0503a', shirt: '#26232e', pants: '#2f3a55', w: 18, legs: 11, body: 18, plain: true, glasses: 'none' },
  trainer: { name: 'Ausbilder', walkAnim: true, skin: '#f0c4a0', hair: '#6b6b70', style: 'bald', temples: '#6b6b70', coat: '#2f5f9a', shirt: '#2f5f9a', pants: '#2f5f9a', w: 23, legs: 12, body: 22, polo: true, beard: 'short', glasses: 'none' },
};
function drawNpc() {
  const n = G.npc;
  if (!n || n.stage === 'knock') return;
  const T0 = typeof n.look === 'number' ? TEACHERS[n.look] : NPC_LOOKS[n.look];
  drawTeacherFigure(T0, sx(n.x), sy(n.y), { face: n.face, moving: n.moving, walk: n.walk, shoe: T0.shoe || '#3a2a22', shoeStripe: !!T0.sneakers || n.look === 'teen' });
  if (n.look === 'trainer' && n.stage === 'stay') { const X = sx(n.x), Y = sy(n.y); R(X + 10, Y - 34, 10, 13, '#a8794a'); R(X + 11, Y - 32, 8, 10, COL.white); R(X + 12, Y - 29, 6, 1, '#9ab'); R(X + 12, Y - 26, 4, 1, '#9ab'); }
}
function newsIcon(kind, x, y) {          // kleine Pixelbildchen in der Sprechblase
  x = Math.round(x); y = Math.round(y);
  if (kind === 'toilet') {
    R(x - 5, y - 8, 7, 5, COL.white); R(x - 6, y - 3, 11, 4, COL.white); R(x - 4, y + 1, 7, 5, COL.white); R(x - 5, y - 2, 9, 1, '#9ab');
    R(x + 3, y - 8, 2, 2, PAL.red); R(x + 5, y - 6, 2, 2, PAL.red); R(x + 3, y - 4, 2, 2, PAL.red); R(x + 5, y - 8, 2, 2, PAL.red); R(x + 3, y - 6, 2, 2, PAL.red);
  } else if (kind === 'copier') {
    R(x - 7, y - 4, 14, 9, '#d8dade'); R(x - 6, y - 7, 12, 3, '#9aa2ab'); R(x - 4, y + 5, 8, 2, COL.white); R(x + 2, y - 2, 3, 2, '#5cc8c0');
    R(x - 2, y - 3, 2, 5, PAL.red); R(x - 2, y + 3, 2, 1, PAL.red);
  } else if (kind === 'cake') {
    R(x - 7, y, 14, 6, '#c08a5a'); R(x - 7, y - 3, 14, 4, '#f2a0b8'); R(x - 6, y + 2, 12, 1, '#f2a0b8');
    R(x - 1, y - 8, 2, 5, COL.white); R(x - 1, y - 10, 2, 2, blink(6) ? PAL.yellow : PAL.orange);
  } else if (kind === 'trainer') {
    R(x - 6, y - 4, 12, 6, PAL.yellow); R(x - 4, y - 7, 8, 3, PAL.yellow); R(x - 8, y + 1, 16, 2, '#c9a43e'); R(x - 1, y - 7, 2, 7, '#c9a43e');
    R(x - 4, y + 4, 8, 3, '#f0c4a0');
  } else if (kind === 'heat') {
    disc(x, y, 4, PAL.yellow);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + clockT; R(x + Math.cos(a) * 7 - 1, y + Math.sin(a) * 7 - 1, 2, 2, PAL.orange); }
  }
}
function drawNpcBubbles() {
  const n = G.npc, DE = CONFIG.doorEvents;
  if (!n) return;
  const doorX = sx(DOOR.cx), doorY = sy(RH) - 44;
  if (n.stage === 'knock') {                          // Symbol über der Tür
    if (n.kind === 'news') { bubble(doorX, doorY, COL.white, 1 - n.t / DE.knockTime, '', '#9fd3f0', 13); newsIcon(n.news, doorX, doorY); }
    else if (n.kind === 'trainer') { bubble(doorX, doorY, COL.white, 1 - n.t / DE.knockTime, '', '#9fd3f0', 13); newsIcon('trainer', doorX, doorY); }
    else bubble(doorX, doorY, '#9fd3f0', 1 - n.t / DE.knockTime, '?', COL.white);
    return;
  }
  const X = sx(n.x), Y = sy(n.y) - 78;
  if (n.kind === 'intruder' && n.stage !== 'out') bubble(X, Y + (blink(8) ? -2 : 0), PAL.red, 1 - n.t / DE.intruder.stay, 'HEY', '#ffb36b', 15);
  if (n.kind === 'question' && n.stage === 'stay') {
    const late = n.t >= DE.question.patience;
    bubble(X, Y, late ? PAL.orange : '#9fd3f0', 1 - n.t / DE.question.stay, '?', late ? PAL.red : COL.white);
  }
  if (n.kind === 'news' && (n.stage === 'stay' || n.stage === 'copying' || n.stage === 'toCopier')) {
    bubble(X, Y, COL.white, n.stage === 'stay' ? 1 - n.t / DE.news.stay : G.copier.busy / DE.news.copierBusy, '', n.listened ? '#9fd39a' : '#9fd3f0', 13);
    newsIcon(n.news, X, Y);
  }
}

/* =========================================================== Overlay */
function bubble(cx, cy, color, frac, glyph, ringColor, r = 11) {
  cx = Math.round(cx); cy = Math.round(cy);
  softShadow(cx, cy + r + 8, r * 0.6, 2, 0.18);
  disc(cx, cy, r + 4, 'rgba(38,35,46,.75)');
  if (frac > 0) {
    ctx.fillStyle = ringColor;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac)); ctx.closePath(); ctx.fill();
  }
  disc(cx, cy, r, color);
  R(cx - r + 3, cy - r + 4, 3, 3, shade(color, 0.35));
  R(cx - 2, cy + r + 1, 5, 3, color); R(cx - 1, cy + r + 4, 3, 2, color); px(cx, cy + r + 6, color);
  if (glyph) ltext(glyph, cx - (glyph.length * 4 - 1), cy - 5, PAL.dark, 2);
}
function paperIcon(x, y) { R(x - 5, y - 7, 10, 14, COL.white); R(x - 3, y - 4, 6, 1, '#9ab'); R(x - 3, y - 1, 6, 1, '#9ab'); R(x - 3, y + 2, 4, 1, '#9ab'); R(x + 2, y - 7, 3, 3, '#d6d0c4'); }
function phoneIcon(x, y) { R(x - 4, y - 7, 8, 14, PAL.dark); R(x - 3, y - 5, 6, 9, '#9fd3f0'); px(x, y + 5, '#555'); }

function drawPresence() {
  if (!CONFIG.presence.show && !debug) return;
  if (!presenceOn()) return;
  const X = sx(G.p.x), Y = sy(G.p.y - 0.4), r = CONFIG.presence.radius * T;
  const g = ctx.createRadialGradient(X, Y, r * 0.2, X, Y, r);
  g.addColorStop(0, 'rgba(255, 238, 190, 0.16)'); g.addColorStop(0.85, 'rgba(255, 238, 190, 0.07)'); g.addColorStop(1, 'rgba(255, 238, 190, 0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill();
  if (debug) { ctx.strokeStyle = 'rgba(255,244,200,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.stroke(); }
}

function drawFormPicker() {
  const X = sx(G.p.x), Y = sy(G.p.y) + 10;
  if (typeof isHall === 'function' && isHall()) {             // Ansagen an der mobilen Tafel
    const items = CONFIG.forms.map((f, i) => `${i + 1} ${f.name}${hallCanAct(i) ? '' : ' -'}`), widths = items.map(t => t.length * 8 + 6);
    const total = widths.reduce((a, b) => a + b, 0) + 8; let x = Math.round(clamp(X - total / 2, 8, cv.width - total - 8));
    rr(x - 6, Y - 6, total + 12, 22, 'rgba(38,35,46,.92)', 3);
    items.forEach((t, i) => { const on = i === G.formSel; if (on) rr(x - 2, Y - 3, widths[i], 16, hallCanAct(i) ? PAL.yellow : PAL.grey, 2); ltext(t, x + 2, Y, on ? PAL.dark : hallCanAct(i) ? COL.white : PAL.grey, 2); x += widths[i] + 4; });
    ptext(['RADLADER-GRUPPE HILFT BEIM LANGSAMSTEN PAKET', '20 S SCHNELLER, ABER UNRUHIGER UND MUEDER', G.freeWork ? 'FREIES ARBEITEN AUS: WIEDER NORMAL' : 'FREIES ARBEITEN: RUHIGER, ABER LANGSAMER'][G.formSel], X, Y + 26, PAL.yellow, PAL.dark, 1);
    return;
  }
  if (G.kids.some(k => k.state === 'question')) { ptext('FRAGE: E HALTEN', X, Y, '#9fd39a'); return; }
  const items = CONFIG.forms.map((f, i) => `${i + 1} ${f.name}`);
  const widths = items.map(s => s.length * 8 + 6);
  const total = widths.reduce((a, b) => a + b, 0) + 4 * (items.length - 1);
  let x = Math.round(clamp(X - total / 2, 8, SW - total - 8));
  rr(x - 6, Y - 6, total + 12, 22, 'rgba(38,35,46,.92)', 3);
  items.forEach((s, i) => {
    const on = i === G.formSel, cur = i === G.formIdx && G.supply > 0;
    if (on) rr(x - 2, Y - 3, widths[i], 16, PAL.yellow, 2);
    ltext(s, x + 2, Y, on ? PAL.dark : cur ? '#9fd39a' : PAL.grey, 2);
    x += widths[i] + 4;
  });
}

/* ============================================================ Licht */
function drawLighting() {
  const t = clockT, evening = RUN && RUN.lesson >= 1;
  const wx0 = sx(17.05), wx1 = wx0 + 76, wyT = OY - WALL_H + 12, wyB = wyT + 54;
  ctx.save();
  // Sonnenlicht durchs Fenster (zieht langsam, Wolken dimmen es)
  ctx.globalCompositeOperation = 'lighter';
  const pulse = 0.8 + 0.2 * Math.sin(t * 0.21) * Math.sin(t * 0.13 + 1);
  const sun = evening ? [255, 176, 110] : [255, 220, 160];
  const lg = ctx.createLinearGradient(wx1, wyT, wx0 - 190, wyB + 250);
  lg.addColorStop(0, `rgba(${sun},${0.2 * pulse})`); lg.addColorStop(0.6, `rgba(${sun},${0.09 * pulse})`); lg.addColorStop(1, `rgba(${sun},0)`);
  ctx.fillStyle = lg;
  ctx.beginPath(); ctx.moveTo(wx0 + 2, wyT + 4); ctx.lineTo(wx1 - 2, wyT + 4); ctx.lineTo(wx1 - 150, 380); ctx.lineTo(wx0 - 230, 380); ctx.closePath(); ctx.fill();
  // Staub im Licht
  for (let i = 0; i < 14; i++) {
    const ph = (t * 0.05 + i * 0.137) % 1;
    const dx = wx0 - 30 - ph * 160 + Math.sin(t * 0.7 + i) * 10, dy = wyB + 10 + ph * 220 + Math.cos(t * 0.5 + i * 2) * 8;
    ctx.fillStyle = `rgba(255,240,200,${(0.5 * Math.sin(ph * Math.PI)).toFixed(2)})`; ctx.fillRect(Math.round(dx), Math.round(dy), 1, 1);
  }
  // Schreibtischlampe und Laptop-Schein
  const lamp = ctx.createRadialGradient(sx(4.25), sy(0.4), 2, sx(4.25), sy(0.4), 70);
  lamp.addColorStop(0, 'rgba(255,200,120,.22)'); lamp.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = lamp; ctx.fillRect(sx(4.25) - 70, sy(0.4) - 70, 140, 140);
  const lap = ctx.createRadialGradient(sx(2.2), sy(0.1), 1, sx(2.2), sy(0.1), 26);
  lap.addColorStop(0, 'rgba(120,180,255,.18)'); lap.addColorStop(1, 'rgba(120,180,255,0)');
  ctx.fillStyle = lap; ctx.fillRect(sx(2.2) - 26, sy(0.1) - 26, 52, 52);
  // Deckenlampen: warme Lichtinseln über den Tischreihen
  for (const [lx, ly] of [[6, 4.4], [14, 4.4], [6, 8.0], [14, 8.0]]) {
    const g = ctx.createRadialGradient(sx(lx), sy(ly), 4, sx(lx), sy(ly), 120);
    g.addColorStop(0, `rgba(255,214,150,${evening ? 0.1 : 0.06})`); g.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = g; ctx.fillRect(sx(lx) - 120, sy(ly) - 120, 240, 240);
  }
  // Stimmung: warm, am Nachmittag (2. Stunde) noch etwas goldener
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = evening ? 'rgb(255,228,200)' : 'rgb(255,247,236)';
  ctx.fillRect(0, 0, SW, SH);
  ctx.globalCompositeOperation = 'source-over';
  const vg = ctx.createRadialGradient(SW / 2, SH / 2 + 30, 220, SW / 2, SH / 2, 470);
  vg.addColorStop(0, 'rgba(40,25,35,0)'); vg.addColorStop(1, 'rgba(40,25,35,0.38)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, SW, SH);
  ctx.restore();
}

/* ============================================================ Szene */
function render() {
  if (typeof isHall === 'function' && isHall()) { renderHall(); return; }
  if (typeof isLab === 'function' && isLab()) renderLabWorld(); else renderClassWorld();
  if (state === 'title') return;
  renderOverlay();
}
function renderClassWorld() {
  ctx.drawImage(bgCanvas, 0, 0);
  drawWindow();
  drawBoard();
  drawClockAndSigns();
  drawPresence();

  const list = [
    { y: 1.35, f: drawTeacherDesk }, { y: 0.7, f: drawShelf }, { y: 0.85, f: drawPlant },
    { y: 4.2, f: drawCabinet }, { y: 7.0, f: drawToolCart }, { y: 9.75, f: drawCopier }, { y: 9.9, f: drawExtinguisher },
  ];
  for (const k of G.kids) {
    list.push({ y: k.dy + 0.55, f: () => drawDesk(k) });
    list.push({ y: k.y, f: () => { drawKid(k); if (has('helper') && k.i === 0 && isSeated(k)) sash(sx(k.x), sy(k.y)); } });
    if (k.state === 'walk') list.push({ y: k.wy, f: () => drawWalker(k) });
  }
  list.push({ y: G.p.y, f: drawTeacher });
  list.push({ y: 1.6, f: drawStool });
  if (G.npc) list.push({ y: G.npc.y, f: drawNpc });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  drawDoor();
  if (has('cozy')) drawCozy();
  drawLighting();
}
function drawCozy() {                          // Ausbau Klassenraum Stufe 1: Lichterkette, Pflanzen, Leselampe
  const wy = OY - WALL_H;
  ctx.strokeStyle = '#3a3540'; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const x = OX + i * 16, y = wy + 6 + Math.sin(i / 40 * Math.PI * 8) * 3 + 3; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  for (let i = 0; i < 40; i++) { const x = OX + 8 + i * 16, y = wy + 9 + Math.sin((i + 0.5) / 40 * Math.PI * 8) * 3 + 3; disc(x, y, 2, ['#f7d154', '#f29a4e', '#9fd39a', '#9fd3f0'][i % 4]); if (blink(1, i * 0.3)) { ctx.fillStyle = 'rgba(255,230,160,.25)'; ctx.fillRect(x - 4, y - 4, 9, 9); } }
  // Pflanze rechts an der Wand
  const px0 = sx(19.25), py0 = sy(8.6);
  R(px0, py0 - 14, 18, 14, '#c0603a'); R(px0, py0 - 14, 18, 3, '#d8784a');
  for (const [dx, dy, r] of [[4, -22, 7], [13, -26, 8], [8, -34, 7], [16, -18, 5], [1, -16, 5]]) disc(px0 + dx, py0 + dy, r, r > 6 ? '#4f9a5a' : '#62b06a');
  // Leselampe am Regal (warmes Licht)
  const lx = sx(6.3), ly = sy(0.05);
  R(lx, ly - 30, 2, 30, '#c9a43e'); rr(lx - 6, ly - 36, 14, 8, '#e8853a', 2);
  const g = ctx.createRadialGradient(lx, ly - 20, 2, lx, ly - 20, 70); g.addColorStop(0, 'rgba(255,214,140,.28)'); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 70, ly - 90, 140, 140);
}
function renderOverlay() {
  // Blasen mit Geduld-Ring
  for (const k of G.kids) {
    const X = sx(k.x), Y = sy(k.y) - 74;
    const E = CONFIG.events;
    if (k.state === 'fidget') {
      bubble(X, Y + 8, PAL.grey, 1 - k.t / CONFIG.kids.fidgetTime, '', COL.white, 8);
      const d = Math.floor(clockT * 4) % 4;
      for (let i = 0; i < 3; i++) R(X - 6 + i * 5, Y + 7, 2, 2, i < d ? PAL.dark : '#8a8794');
    }
    if (k.state === 'idle') bubble(X, Y, PAL.yellow, 1 - k.t / CONFIG.kids.idleToLoud, 'Z', COL.white);
    if (k.state === 'loud') bubble(X, Y - 8, PAL.red, 1 - k.spreadT / CONFIG.kids.spreadEvery, '!', '#ffb36b');
    if (k.state === 'wait') { bubble(X, Y - 8, PAL.blue, 1 - k.t / CONFIG.copier.patience, '', COL.white); paperIcon(X, Y - 8); }
    if (k.state === 'cheat') {                                     // spickt: Augen schielen zur Seite
      bubble(X, Y - 8, PAL.orange, 1 - k.t / CONFIG.week.cheatPatience, '', COL.white);
      for (const ex of [-5, 2]) { R(X + ex, Y - 12, 5, 6, COL.white); R(X + ex + (k.cheatSide > 0 ? 3 : 0), Y - 10, 2, 3, PAL.dark); }
    }
    if (k.state === 'question') bubble(X, Y - 8, '#9fd39a', 1 - k.t / E.question.patience, '?', COL.white);
    if (k.state === 'wc') bubble(X, Y - 8, '#5cc8c0', 1 - k.t / E.wc.patience, 'WC', COL.white, 13);
    if (k.state === 'phoneSoon') { bubble(X, Y + 8, PAL.grey, 1 - k.t / E.phone.warn, '', '#b07ce8', 8); phoneIcon(X, Y + 8); }
    if (k.state === 'phone') { bubble(X, Y - 8, '#b07ce8', 1, '', COL.white); phoneIcon(X, Y - 8); }
    if (k.state === 'pc') bubble(X, Y - 8, '#e8534a', 1 - k.t / CONFIG.lab.pc.patience, 'PC', COL.white, 13);
    if (k.state === 'plc') bubble(X, Y - 8, PAL.orange, 1 - k.t / CONFIG.lab.plc.patience, 'STOP', COL.white, 18);
    if (k.state === 'net') { bubble(X, Y + 6, PAL.grey, 1, '', PAL.grey, 8); R(X - 4, Y + 2, 8, 2, PAL.dark); R(X - 2, Y + 5, 4, 2, PAL.dark); R(X - 5, Y, 2, 9, PAL.red); }
    if (k.state === 'test') { const n = G.plant ? G.plant.queue.indexOf(k) + 1 : 0; bubble(X, Y - 8, '#5cc8c0', 1 - k.t / CONFIG.lab.test.patience, 'T' + (n || ''), COL.white, 13); }
  }
  if (typeof isLab === 'function' && isLab()) drawLabOverlay();
  if (typeof isHall === 'function' && isHall()) drawHallOverlay();
  const knockers = G.kids.filter(k => k.state === 'knock' && !(k.door === 1));
  const back = G.kids.filter(k => k.state === 'knock' && k.door === 1);
  if (back.length) { const k = back.reduce((a, b) => (a.t > b.t ? a : b)), loud = k.t > CONFIG.door.patience; bubble(sx(18.1) + 20, OY - 44 + (loud && blink(10) ? -2 : 0), PAL.orange, loud ? 1 : 1 - k.t / CONFIG.door.patience, back.length > 1 ? '!' + back.length : '!', loud ? PAL.red : COL.white, back.length > 1 ? 13 : 11); }
  if (knockers.length) {
    const k = knockers.reduce((a, b) => (a.t > b.t ? a : b));
    const loud = k.t > CONFIG.door.patience;
    bubble(sx(DOOR.cx), sy(RH) - 44 + (loud && blink(10) ? -2 : 0), PAL.orange, loud ? 1 : 1 - k.t / CONFIG.door.patience, knockers.length > 1 ? '!' + knockers.length : '!', loud ? PAL.red : COL.white, knockers.length > 1 ? 13 : 11);
  }
  drawNpcBubbles();
  if (G.noWC) { const X = sx(DOOR.cx) + 34, Y = sy(RH) - 60; rr(X - 12, Y - 10, 24, 20, 'rgba(38,35,46,.75)', 3); newsIcon('toilet', X, Y); }   // Erinnerung: WC zu
  if (G.copier.jam) bubble(sx(CPX()), sy(CPY()) - (isLab() ? 66 : 84), PAL.red, 1 - G.copier.hits / CONFIG.events.jamHits, '!', COL.white);
  if (G.supply <= 0 && !CONFIG.board.review && !isHall()) bubble(sx(10), OY - WALL_H + 40, PAL.red, 1 - Math.min(1, G.emptyT / CONFIG.board.emptyDelay), '!', COL.white);

  // Denkblase: welche Arbeitsform ist gewählt? (nach Q abseits der Tafel)
  if (G.formFx > 0) {
    const X = sx(G.p.x), Y = sy(G.p.y) - 108, FC = ['#9fd3f0', '#9fd39a', '#f2c14e'], n = [1, 2, 4][G.formSel], c = FC[G.formSel];
    ctx.globalAlpha = Math.min(1, G.formFx * 3);
    disc(X - 12, Y + 34, 2, COL.white); disc(X - 7, Y + 28, 3, COL.white);
    rr(X - 22, Y - 12, 44, 30, COL.white, 6); rr(X - 20, Y - 10, 40, 26, '#fdfaf2', 5);
    const gap = 9, x0 = X - ((n - 1) * gap) / 2;
    for (let i = 0; i < n; i++) { const fx = Math.round(x0 + i * gap); disc(fx, Y - 2, 3, shade(c, -0.25)); R(fx - 3, Y + 2, 7, 8, c); R(fx - 3, Y + 9, 7, 1, shade(c, -0.3)); }
    ctx.globalAlpha = 1;
  }
  if (G.exam) for (const k of G.kids) if (k.state === 'question' && k.qs) {           // Klassenarbeit: Vertrösten-Zähler
    const X = sx(k.x), Y = sy(k.y) - 100;
    for (let i = 0; i < CONFIG.week.examQuestionSoothes; i++) disc(X - 8 + i * 8, Y, 3, i < k.qs ? '#9fd39a' : 'rgba(38,35,46,.6)');
  }
  // Lärmampel: wer wird gleich unruhig?
  if (G.forecastKid && G.forecastKid.state === 'work') {
    const k = G.forecastKid, X = sx(k.x), Y = sy(k.y) - 66;
    disc(X, Y, 5, PAL.dark); disc(X, Y, 3, blink(4) ? PAL.orange : '#7a4a2a');
  }

  // Ziel-Pfeil
  const tg = currentTarget();
  if (tg && tg.type !== 'board' && !(tg.type === 'copier' && G.exam && !G.printerOn) && !G.writing && !G.give && !G.grab && !G.deskHold) {
    let X, Y;
    if (tg.type === 'copier') { X = sx(CPX()); Y = sy(CPY()) - (isLab() ? 60 : 96); }
    else if (tg.type === 'desk') { X = sx(RD().deskAt.ax); Y = sy(DKY()) - 50; }
    else if (tg.type === 'door2') { X = sx(18.1) + 20; Y = OY - 74; }
    else if (tg.type === 'net') { X = sx(15.8); Y = OY - 86; }
    else if (tg.type === 'plant') { X = sx(10); Y = sy(3.9) - 100; }
    else if (tg.type === 'robot') { X = sx(G.robot.x); Y = sy(G.robot.y) - 120; }
    else if (tg.type === 'puddle') { X = sx(G.puddle.x); Y = sy(G.puddle.y) - 40; }
    else if (tg.type === 'motor') { const b = hallMotorBlock(); X = sx((b.x0 + b.x1) / 2); Y = sy(b.y0) - 110; }
    else if (tg.type === 'binder') { X = sx(0.75); Y = sy(3.2) - 100; }
    else if (tg.type === 'parts') { X = sx(17.4); Y = sy(9.8) - 60; }
    else if (tg.type === 'bell') { X = sx(23.7); Y = sy(4.6) - 80; }
    else if (tg.type === 'door') { X = sx(DOOR.cx); Y = sy(RH) - 78; }
    else if (tg.type === 'npc') { X = sx(G.npc.x); Y = sy(G.npc.y) - 112; }
    else { X = sx(tg.kid.x); Y = sy(tg.kid.y) - (['idle', 'loud', 'wait', 'question', 'wc', 'phone', 'cheat', 'pc', 'plc', 'test', 'mat', 'psa', 'check', 'climb', 'climbSoon', 'wcq', 'leak'].includes(tg.kid.state) ? 110 : ['fidget', 'phoneSoon'].includes(tg.kid.state) ? 96 : 70); }
    const b = Math.round(Math.sin(clockT * 6) * 2);
    for (let i = 0; i < 5; i++) R(X - 6 + i, Y + i + b, 13 - i * 2, 1, COL.white);
    R(X - 6, Y - 1 + b, 13, 1, PAL.dark);
  }
  if (inBoardZone() && !G.writing && !G.exam) drawFormPicker();
  if (G.gongFx > 0) {
    ctx.strokeStyle = `rgba(255,244,200,${G.gongFx.toFixed(2)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(sx(G.p.x), sy(G.p.y) - 24, (1 - G.gongFx) * 520, 0, 7); ctx.stroke();
  }

  // Fortschritt beim Halten
  const prog = G.give ? [G.give.t / G.give.need, PAL.blue] : G.grab ? [G.grab.t / CONFIG.events.phone.hold, '#b07ce8'] : G.explaining ? [G.explainProg, '#9fd39a'] : G.tutor && G.tutor.t > 0.25 ? [G.tutor.t / (CONFIG.tutor.hold * CONFIG.events.question.explain), '#9fd39a'] : G.npcProg > 0 ? [G.npcProg, '#9fd3f0'] : G.printerOff ? [G.printerOff.t / CONFIG.week.printerNoise.offHold, PAL.white]
    : G.labHold && G.labHold.kind === 'pc' ? [G.labHold.t / CONFIG.lab.pc.hold, '#9fd3f0'] : G.labHold && G.labHold.kind === 'net' ? [G.labHold.t / CONFIG.lab.net.hold, '#9fd3f0']
    : G.labHold && G.labHold.kind === 'quit' ? [G.labHold.t / CONFIG.lab.test.quitHold, '#7cc47a']
    : G.hallHold && G.hallHold.kind === 'check' ? [G.hallHold.t / CONFIG.hall.check.hold, '#9fd39a'] : G.hallHold && G.hallHold.kind === 'clean' ? [G.hallHold.t / CONFIG.hall.leak.clean, PAL.yellow] : null;
  if (prog) { const X = sx(G.p.x), Y = sy(G.p.y) - 80; rr(X - 18, Y, 36, 8, PAL.dark, 2); R(X - 16, Y + 2, Math.round(32 * Math.min(1, prog[0])), 4, prog[1]); }

  for (const p of G.parts) { const s = p.s ? 2 : 3; R(p.x, p.y, s, s, p.color); }
  for (const f of G.floats) ptext(f.text, f.x, f.y - f.t * 28, f.color);

  if (debug) for (const k of G.kids) if (isSeated(k) && inPresence(k)) R(sx(k.x) - 2, sy(k.y) + 4, 5, 2, PAL.yellow);
}

/* ============================================================ Start */
buildBackground();
setupTouch();
newLesson(); lessonNo = 0;
titleScreen();
fit();
requestAnimationFrame(frame);

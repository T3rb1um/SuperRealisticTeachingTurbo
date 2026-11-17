/* Raum-Vorschau (nur zum Ansehen): Klassenraum, Metallwerkstatt, Praxishalle, Automatisierungslabor.
   Nutzt die Zeichen-Helfer aus game.js / render.js. Gleicher Ursprung (OX/OY) wie im Spiel, größere Räume werden geschwenkt. */

const roomCv = document.createElement('canvas');
const mainCtx = ctx;
const origRender = render;
let roomIdx = 1, camX = 0, camY = 0, camAuto = true, camDir = 1;

const ROOMS = [
  { name: 'KLASSENRAUM', sub: 'WOCHE 1', w: 20, h: 10, draw: null },
  { name: 'METALLWERKSTATT', sub: 'WOCHE 2', w: 20, h: 10, draw: () => drawWorkshop() },
  { name: 'PRAXISHALLE', sub: 'WOCHE 3', w: 30, h: 13, draw: () => drawHall() },
  { name: 'AUTOMATISIERUNGSLABOR', sub: 'WOCHE 4', w: 20, h: 10, draw: () => drawLab() },
];

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

let showPaths = false;
window.addEventListener('keydown', e => { if (e.code === 'KeyP') showPaths = !showPaths; }, true);
{
  const base = render;
  render = function () {
    if (!showPaths || !ROOM_LAYOUT[roomIdx]) return base();
    const r = ROOMS[roomIdx];
    const W = OX * 2 + r.w * T, H = OY + r.h * T + 40;
    if (roomCv.width !== W || roomCv.height !== H) { roomCv.width = W; roomCv.height = H; }
    ctx = roomCv.getContext('2d'); r.draw(); drawPathOverlay(roomIdx); ctx = mainCtx;
    ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, SW, SH); ctx.drawImage(roomCv, -Math.round(camX), -Math.round(camY)); rmLabel();
  };
}

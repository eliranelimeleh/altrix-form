// ALTRIX onboarding: shared library (overlay, icons, layout templates, UI mockups, funnel).
// Everything is drawn in a 1920x1080 space. Texts, prices and facts come from src/onb1.json.
'use strict';
window.SCENES = {};
const S = window.SCENES;
const FX = () => R.spec.facts;
const CX = W / 2, CY = H / 2;
const TEAL = C.teal, GOLD = C.gold, P1 = C.purple, P2 = C.purple2;
const WA = '#25d366', WA_D = '#128c7e';
// the ALTRIX customer-journey funnel (recurring element)
const STAGES = [
  ['TRAFFIC', 'קהילות, תוכן וקמפיינים'], ['LEAD', 'פנייה בוואטסאפ'], ['CONTACT', 'שיחת היכרות'],
  ['QUALIFICATION', 'בדיקת התאמה והבנת הצורך'], ['TRIAL', '10 ימי ניסיון'], ['INSTALLATION', 'התקנה והדרכה'],
  ['NURTURING', 'ליווי אישי'], ['CLOSING', 'שיחת סיכום ורכישה'], ['CUSTOMER', 'לקוח משלם'],
];
let SEGCH = null;
const chOf = id => { if (!SEGCH) { SEGCH = {}; R.spec.segments.forEach(x => (SEGCH[x.id] = x.ch)); } return SEGCH[id]; };
const chapter = n => R.spec.chapters.find(c => c.n === n);
const segById = id => R.tl.segments.find(x => x.id === id);
// cue: number (local seconds) | 'word' | ['word', occurrence] | ['@', fraction of the scene]
function cueT(s, c) {
  if (c === undefined || c === null) return 0;
  if (typeof c === 'number') return c;
  if (Array.isArray(c)) return c[0] === '@' ? c[1] * s.d : s.cue(c[0], c[1] || 0) + (c[2] || 0);
  return s.cue(c);
}
const pr = (s, c, len = 0.4, off = -0.05) => { const t = cueT(s, c) + off; return prog(s.lt, t, t + len); };

// ---------------- text helpers ----------------
function wrapLines(ctx, str, maxW, size, weight = 700, fam = FONT) {
  const words = String(str).split(' '), lines = []; let cur = '';
  for (const w of words) {
    const tr = cur ? cur + ' ' + w : w;
    if (cur && measure(ctx, tr, size, weight, fam) > maxW) { lines.push(cur); cur = w; } else cur = tr;
  }
  if (cur) lines.push(cur);
  return lines;
}
function para(ctx, str, x, y, maxW, o = {}) { // right-aligned (rtl) paragraph, returns height
  const { size = 30, weight = 600, lh = 1.4, color = '#fff', align = 'right', alpha = 1 } = o;
  const lines = wrapLines(ctx, str, maxW, size, weight);
  lines.forEach((l, k) => text(ctx, l, x, y + k * size * lh, { size, weight, color, align, alpha }));
  return lines.length * size * lh;
}
function fitText(ctx, s, x, y, maxW, o = {}) {
  let size = o.size || 60; const wt = o.weight || 800;
  while (size > 14 && measure(ctx, s, size, wt, o.fam || FONT, o.spacing || 0) > maxW) size -= 2;
  text(ctx, s, x, y, { ...o, size });
  return size;
}
// kinetic heading: small spaced English kicker + Hebrew title
function heading(ctx, s, he, en, o = {}) {
  const { y = 200, at = 0, size = 66, color = '#fff', x = CX, align = 'center' } = o, lt = s.lt;
  if (en) {
    const pk = prog(lt, at - 0.05, at + 0.6), sp = lerp(26, 8, E.outExpo(pk));
    text(ctx, en, x, y - size * 0.95, { size: 22, weight: 700, fam: MONO, color: P2, spacing: sp, alpha: clamp(pk * 2), align });
  }
  wipeText(ctx, he, x, y, prog(lt, at, at + 0.45), { size, weight: 900, color, glow: 24, glowColor: P1, align });
}
function kicker(ctx, s, str, x, y, at = 0, color = P2) {
  const p = prog(s.lt, at, at + 0.4); if (p <= 0) return;
  text(ctx, str, x, y, { size: 22, weight: 700, fam: MONO, color, spacing: lerp(20, 6, E.outExpo(p)), alpha: clamp(p * 2) });
}

// ---------------- backgrounds / camera ----------------
function bg(ctx, s, o = {}) {
  drawBG(ctx, s.t, { rain: o.rain ?? 0.7, glow: o.glow ?? 1, hue: o.hue || 0 });
  if (o.grid) floorGrid(ctx, s.t, o.grid);
  if (o.dots) dotField(ctx, s.t, o.dots);
}
function floorGrid(ctx, t, a = 1) { // perspective grid at the bottom: FinTech stage floor
  ctx.save(); ctx.globalAlpha = 0.22 * a; ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 1.5;
  const hz = 640, vp = CX;
  for (let k = -14; k <= 14; k++) { ctx.beginPath(); ctx.moveTo(vp + k * 30, hz); ctx.lineTo(vp + k * 260, H + 40); ctx.stroke(); }
  const off = (t * 0.35) % 1;
  for (let k = 0; k < 12; k++) { const f = (k + off) / 12, y = hz + (H + 40 - hz) * f * f; ctx.globalAlpha = 0.22 * a * f; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
}
function dotField(ctx, t, a = 1) {
  ctx.save();
  for (let k = 0; k < 70; k++) {
    const x = (hash(k) * W + t * (8 + hash(k + 9) * 20)) % W, y = hash(k + 3) * H, r = 1 + hash(k + 5) * 2.2;
    ctx.globalAlpha = a * (0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.5 + k))); ctx.fillStyle = hash(k + 7) > 0.75 ? TEAL : P2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function cam(ctx, s, fn, o = {}) { // slow push-in for the whole scene
  const { k = 0.035, cx = CX, cy = CY } = o, sc = 1 + k * E.inOut(clamp(s.lt / Math.max(1, s.d)));
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy); fn(); ctx.restore();
}
function slideIn(ctx, p, dx, dy, fn) { if (p <= 0) return; const e = E.outCubic(clamp(p)); ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.translate(dx * (1 - e), dy * (1 - e)); fn(); ctx.restore(); }
function fadeOut(ctx, s, at, len = 0.35) { return 1 - prog(s.lt, at, at + len); }

// ---------------- icons ----------------
function icon(ctx, name, x, y, sz = 60, col = '#fff', o = {}) {
  const lw = o.lw || Math.max(2.5, sz * 0.075);
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (o.glow !== false) { ctx.shadowColor = col; ctx.shadowBlur = o.glow || 14; }
  const r = sz / 2, B = () => ctx.beginPath(), St = () => ctx.stroke(), Fi = () => ctx.fill();
  const user = (dx, dy, k = 1) => { B(); ctx.arc(dx, dy - r * 0.32 * k, r * 0.26 * k, 0, Math.PI * 2); St(); B(); ctx.arc(dx, dy + r * 0.62 * k, r * 0.5 * k, Math.PI * 1.08, Math.PI * 1.92); St(); };
  switch (name) {
    case 'user': user(0, 0); break;
    case 'users': user(-r * 0.32, 0.06 * r, 0.82); user(r * 0.34, -0.02 * r, 0.9); break;
    case 'team': user(0, -0.05 * r, 0.85); user(-r * 0.62, 0.12 * r, 0.62); user(r * 0.62, 0.12 * r, 0.62); break;
    case 'headset': user(0, 0.08 * r, 0.9); B(); ctx.arc(0, -r * 0.28, r * 0.42, Math.PI * 1.05, Math.PI * 1.95); St();
      ctx.fillRect(-r * 0.5, -r * 0.34, r * 0.14, r * 0.26); ctx.fillRect(r * 0.36, -r * 0.34, r * 0.14, r * 0.26); B(); ctx.moveTo(r * 0.43, -r * 0.1); ctx.quadraticCurveTo(r * 0.4, r * 0.12, r * 0.12, r * 0.12); St(); break;
    case 'robot': rrect(ctx, -r * 0.6, -r * 0.42, r * 1.2, r * 0.95, r * 0.22); St(); B(); ctx.arc(-r * 0.25, 0, r * 0.11, 0, 7); ctx.arc(r * 0.25, 0, r * 0.11, 0, 7); Fi();
      B(); ctx.moveTo(-r * 0.22, r * 0.3); ctx.lineTo(r * 0.22, r * 0.3); St(); B(); ctx.moveTo(0, -r * 0.42); ctx.lineTo(0, -r * 0.7); St(); B(); ctx.arc(0, -r * 0.78, r * 0.09, 0, 7); Fi();
      B(); ctx.moveTo(-r * 0.6, 0); ctx.lineTo(-r * 0.78, 0); ctx.moveTo(r * 0.6, 0); ctx.lineTo(r * 0.78, 0); St(); break;
    case 'candles': [[-0.45, 0.2, -0.35, 0.45], [0, -0.1, -0.6, 0.3], [0.45, -0.35, -0.75, 0.05]].forEach(([dx, a, b, c]) => {
      B(); ctx.moveTo(dx * r, (b - 0.1) * r); ctx.lineTo(dx * r, (c + 0.25) * r); St(); ctx.fillRect(dx * r - r * 0.12, a * r - r * 0.25, r * 0.24, r * 0.5); }); break;
    case 'chart': B(); ctx.moveTo(-r * 0.75, -r * 0.7); ctx.lineTo(-r * 0.75, r * 0.7); ctx.lineTo(r * 0.8, r * 0.7); St();
      B(); ctx.moveTo(-r * 0.55, r * 0.35); ctx.lineTo(-r * 0.15, -r * 0.05); ctx.lineTo(r * 0.15, r * 0.2); ctx.lineTo(r * 0.65, -r * 0.45); St(); break;
    case 'shield': B(); ctx.moveTo(0, -r * 0.8); ctx.lineTo(r * 0.65, -r * 0.52); ctx.lineTo(r * 0.6, r * 0.1); ctx.quadraticCurveTo(r * 0.45, r * 0.6, 0, r * 0.85);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.6, -r * 0.6, r * 0.1); ctx.lineTo(-r * 0.65, -r * 0.52); ctx.closePath(); St();
      if (o.check) { B(); ctx.moveTo(-r * 0.25, 0.02 * r); ctx.lineTo(-r * 0.05, r * 0.22); ctx.lineTo(r * 0.3, -r * 0.2); St(); } break;
    case 'clock': B(); ctx.arc(0, 0, r * 0.75, 0, 7); St(); B(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.45); ctx.moveTo(0, 0); ctx.lineTo(r * 0.32, r * 0.18); St(); break;
    case 'phone': rrect(ctx, -r * 0.4, -r * 0.78, r * 0.8, r * 1.56, r * 0.16); St(); B(); ctx.moveTo(-r * 0.12, r * 0.55); ctx.lineTo(r * 0.12, r * 0.55); St(); break;
    case 'call': B(); ctx.moveTo(-r * 0.55, -r * 0.6); ctx.quadraticCurveTo(-r * 0.75, r * 0.05, -r * 0.05, r * 0.6); ctx.quadraticCurveTo(r * 0.45, r * 0.85, r * 0.62, r * 0.5);
      ctx.lineTo(r * 0.3, r * 0.2); ctx.lineTo(r * 0.08, r * 0.32); ctx.quadraticCurveTo(-r * 0.25, r * 0.1, -r * 0.32, -r * 0.1); ctx.lineTo(-r * 0.2, -r * 0.32); ctx.lineTo(-r * 0.4, -r * 0.65); ctx.closePath(); o.fill ? Fi() : St(); break;
    case 'chat': B(); rrect(ctx, -r * 0.75, -r * 0.6, r * 1.5, r * 1.0, r * 0.3); St(); B(); ctx.moveTo(-r * 0.35, r * 0.4); ctx.lineTo(-r * 0.5, r * 0.75); ctx.lineTo(-r * 0.05, r * 0.4); St();
      [-0.35, 0, 0.35].forEach(dx => { B(); ctx.arc(dx * r, -r * 0.1, r * 0.07, 0, 7); Fi(); }); break;
    case 'whatsapp': B(); ctx.arc(0, -r * 0.02, r * 0.68, Math.PI * 0.72, Math.PI * 2.62); St(); B(); ctx.moveTo(-r * 0.47, r * 0.48); ctx.lineTo(-r * 0.7, r * 0.75); ctx.lineTo(-r * 0.3, r * 0.64); St();
      ctx.save(); ctx.scale(0.55, 0.55); ctx.lineWidth = lw / 0.55 * 0.8; B(); ctx.moveTo(-r * 0.55, -r * 0.6); ctx.quadraticCurveTo(-r * 0.75, r * 0.05, -r * 0.05, r * 0.6); ctx.quadraticCurveTo(r * 0.45, r * 0.85, r * 0.62, r * 0.5); St(); ctx.restore(); break;
    case 'gear': { B(); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, rr = k % 2 ? r * 0.55 : r * 0.78; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); St(); B(); ctx.arc(0, 0, r * 0.22, 0, 7); St(); break; }
    case 'link': ctx.save(); ctx.rotate(-0.78); rrect(ctx, -r * 0.8, -r * 0.24, r * 0.95, r * 0.48, r * 0.24); St(); rrect(ctx, -r * 0.15, -r * 0.24, r * 0.95, r * 0.48, r * 0.24); St(); ctx.restore(); break;
    case 'eye': B(); ctx.moveTo(-r * 0.85, 0); ctx.quadraticCurveTo(0, -r * 0.8, r * 0.85, 0); ctx.quadraticCurveTo(0, r * 0.8, -r * 0.85, 0); St(); B(); ctx.arc(0, 0, r * 0.25, 0, 7); Fi(); break;
    case 'bulb': B(); ctx.arc(0, -r * 0.18, r * 0.48, Math.PI * 0.8, Math.PI * 2.2); ctx.lineTo(r * 0.2, r * 0.45); ctx.lineTo(-r * 0.2, r * 0.45); ctx.closePath(); St();
      B(); ctx.moveTo(-r * 0.18, r * 0.62); ctx.lineTo(r * 0.18, r * 0.62); ctx.moveTo(-r * 0.1, r * 0.78); ctx.lineTo(r * 0.1, r * 0.78); St(); break;
    case 'star': B(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.36 : r * 0.8; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); St(); break;
    case 'target': [0.78, 0.5, 0.2].forEach(k => { B(); ctx.arc(0, 0, r * k, 0, 7); k < 0.3 ? Fi() : St(); }); break;
    case 'calendar': rrect(ctx, -r * 0.72, -r * 0.6, r * 1.44, r * 1.35, r * 0.15); St(); B(); ctx.moveTo(-r * 0.72, -r * 0.22); ctx.lineTo(r * 0.72, -r * 0.22); St();
      B(); ctx.moveTo(-r * 0.35, -r * 0.8); ctx.lineTo(-r * 0.35, -r * 0.45); ctx.moveTo(r * 0.35, -r * 0.8); ctx.lineTo(r * 0.35, -r * 0.45); St();
      [[-0.35, 0.1], [0, 0.1], [0.35, 0.1], [-0.35, 0.42], [0, 0.42]].forEach(([dx, dy]) => ctx.fillRect(dx * r - r * 0.08, dy * r - r * 0.08, r * 0.16, r * 0.16)); break;
    case 'video': rrect(ctx, -r * 0.8, -r * 0.45, r * 1.15, r * 0.9, r * 0.15); St(); B(); ctx.moveTo(r * 0.4, -r * 0.12); ctx.lineTo(r * 0.82, -r * 0.4); ctx.lineTo(r * 0.82, r * 0.4); ctx.lineTo(r * 0.4, r * 0.12); ctx.closePath(); St(); break;
    case 'coin': B(); ctx.arc(0, 0, r * 0.75, 0, 7); St(); ctx.shadowBlur = 0; text(ctx, '₪', 0, r * 0.04, { size: r * 0.95, weight: 800, color: col }); break;
    case 'lock': rrect(ctx, -r * 0.55, -r * 0.1, r * 1.1, r * 0.85, r * 0.15); St(); B(); ctx.arc(0, -r * 0.1, r * 0.36, Math.PI, 0); St(); B(); ctx.arc(0, r * 0.3, r * 0.1, 0, 7); Fi(); break;
    case 'megaphone': B(); ctx.moveTo(-r * 0.6, -r * 0.2); ctx.lineTo(r * 0.5, -r * 0.65); ctx.lineTo(r * 0.5, r * 0.55); ctx.lineTo(-r * 0.6, r * 0.2); ctx.closePath(); St();
      B(); ctx.moveTo(-r * 0.4, r * 0.25); ctx.lineTo(-r * 0.25, r * 0.7); St(); B(); ctx.arc(r * 0.55, -r * 0.05, r * 0.3, -0.9, 0.9); St(); break;
    case 'doc': B(); ctx.moveTo(-r * 0.55, -r * 0.8); ctx.lineTo(r * 0.25, -r * 0.8); ctx.lineTo(r * 0.55, -r * 0.5); ctx.lineTo(r * 0.55, r * 0.8); ctx.lineTo(-r * 0.55, r * 0.8); ctx.closePath(); St();
      [-0.3, 0, 0.3].forEach(dy => { B(); ctx.moveTo(-r * 0.3, dy * r); ctx.lineTo(r * 0.3, dy * r); St(); }); break;
    case 'refresh': B(); ctx.arc(0, 0, r * 0.62, -0.3, Math.PI * 1.45); St(); B(); ctx.moveTo(r * 0.68, -r * 0.62); ctx.lineTo(r * 0.62, -r * 0.18); ctx.lineTo(r * 0.18, -r * 0.3); St(); break;
    case 'monitor': rrect(ctx, -r * 0.82, -r * 0.6, r * 1.64, r * 1.05, r * 0.1); St(); B(); ctx.moveTo(0, r * 0.45); ctx.lineTo(0, r * 0.72); ctx.moveTo(-r * 0.35, r * 0.75); ctx.lineTo(r * 0.35, r * 0.75); St(); break;
    case 'question': B(); ctx.arc(0, 0, r * 0.75, 0, 7); St(); ctx.shadowBlur = 0; text(ctx, '?', 0, r * 0.05, { size: r * 1.05, weight: 900, color: col }); break;
    case 'trophy': B(); ctx.moveTo(-r * 0.45, -r * 0.65); ctx.lineTo(r * 0.45, -r * 0.65); ctx.lineTo(r * 0.38, -r * 0.05); ctx.quadraticCurveTo(0, r * 0.35, -r * 0.38, -r * 0.05); ctx.closePath(); St();
      B(); ctx.moveTo(0, r * 0.2); ctx.lineTo(0, r * 0.55); ctx.moveTo(-r * 0.3, r * 0.65); ctx.lineTo(r * 0.3, r * 0.65); St();
      B(); ctx.arc(-r * 0.5, -r * 0.4, r * 0.18, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(r * 0.5, -r * 0.4, r * 0.18, -Math.PI * 0.5, Math.PI * 0.5); St(); break;
    case 'building': ctx.strokeRect(-r * 0.6, -r * 0.7, r * 1.2, r * 1.45); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) ctx.fillRect(-r * 0.4 + i * r * 0.32, -r * 0.5 + j * r * 0.35, r * 0.15, r * 0.18); break;
    case 'cap': B(); ctx.moveTo(-r * 0.85, -r * 0.15); ctx.lineTo(0, -r * 0.55); ctx.lineTo(r * 0.85, -r * 0.15); ctx.lineTo(0, r * 0.25); ctx.closePath(); St();
      B(); ctx.moveTo(-r * 0.45, r * 0.05); ctx.lineTo(-r * 0.45, r * 0.45); ctx.quadraticCurveTo(0, r * 0.7, r * 0.45, r * 0.45); ctx.lineTo(r * 0.45, r * 0.05); St(); break;
    case 'wallet': rrect(ctx, -r * 0.78, -r * 0.5, r * 1.56, r * 1.1, r * 0.18); St(); rrect(ctx, r * 0.2, -r * 0.12, r * 0.58, r * 0.36, r * 0.1); St(); break;
    case 'globe': B(); ctx.arc(0, 0, r * 0.75, 0, 7); St(); B(); ctx.ellipse(0, 0, r * 0.32, r * 0.75, 0, 0, 7); St(); B(); ctx.moveTo(-r * 0.75, 0); ctx.lineTo(r * 0.75, 0); St(); break;
    case 'filter': B(); ctx.moveTo(-r * 0.8, -r * 0.65); ctx.lineTo(r * 0.8, -r * 0.65); ctx.lineTo(r * 0.15, r * 0.1); ctx.lineTo(r * 0.15, r * 0.7); ctx.lineTo(-r * 0.15, r * 0.55); ctx.lineTo(-r * 0.15, r * 0.1); ctx.closePath(); St(); break;
    case 'search': B(); ctx.arc(-r * 0.12, -r * 0.12, r * 0.48, 0, 7); St(); B(); ctx.moveTo(r * 0.22, r * 0.22); ctx.lineTo(r * 0.7, r * 0.7); St(); break;
    case 'bolt': B(); ctx.moveTo(r * 0.15, -r * 0.85); ctx.lineTo(-r * 0.45, r * 0.1); ctx.lineTo(0, r * 0.1); ctx.lineTo(-r * 0.15, r * 0.85); ctx.lineTo(r * 0.45, -r * 0.1); ctx.lineTo(0, -r * 0.1); ctx.closePath(); St(); break;
    case 'heart': B(); ctx.moveTo(0, r * 0.7); ctx.bezierCurveTo(-r * 1.1, -r * 0.05, -r * 0.5, -r * 0.95, 0, -r * 0.35); ctx.bezierCurveTo(r * 0.5, -r * 0.95, r * 1.1, -r * 0.05, 0, r * 0.7); St(); break;
    case 'handshake': B(); ctx.moveTo(-r * 0.9, -r * 0.15); ctx.lineTo(-r * 0.45, -r * 0.4); ctx.lineTo(-r * 0.05, -r * 0.2); ctx.lineTo(r * 0.45, -r * 0.4); ctx.lineTo(r * 0.9, -r * 0.15); St();
      B(); ctx.moveTo(-r * 0.6, -r * 0.05); ctx.lineTo(-r * 0.1, r * 0.45); ctx.quadraticCurveTo(0, r * 0.55, r * 0.1, r * 0.45); ctx.lineTo(r * 0.6, -r * 0.05); St();
      B(); ctx.moveTo(-r * 0.05, -r * 0.2); ctx.lineTo(r * 0.3, r * 0.15); ctx.moveTo(-r * 0.25, r * 0.05); ctx.lineTo(r * 0.1, r * 0.35); St(); break;
    case 'pause': ctx.fillRect(-r * 0.4, -r * 0.55, r * 0.26, r * 1.1); ctx.fillRect(r * 0.14, -r * 0.55, r * 0.26, r * 1.1); break;
    case 'play': B(); ctx.moveTo(-r * 0.35, -r * 0.55); ctx.lineTo(r * 0.55, 0); ctx.lineTo(-r * 0.35, r * 0.55); ctx.closePath(); Fi(); break;
    case 'plug': B(); ctx.moveTo(-r * 0.2, -r * 0.8); ctx.lineTo(-r * 0.2, -r * 0.4); ctx.moveTo(r * 0.2, -r * 0.8); ctx.lineTo(r * 0.2, -r * 0.4); St();
      B(); ctx.moveTo(-r * 0.5, -r * 0.4); ctx.lineTo(r * 0.5, -r * 0.4); ctx.lineTo(r * 0.5, 0); ctx.quadraticCurveTo(r * 0.45, r * 0.35, 0, r * 0.4); ctx.quadraticCurveTo(-r * 0.45, r * 0.35, -r * 0.5, 0); ctx.closePath(); St();
      B(); ctx.moveTo(0, r * 0.4); ctx.lineTo(0, r * 0.85); St(); break;
    case 'flag': B(); ctx.moveTo(-r * 0.5, r * 0.85); ctx.lineTo(-r * 0.5, -r * 0.75); St(); B(); ctx.moveTo(-r * 0.5, -r * 0.75); ctx.lineTo(r * 0.6, -r * 0.55); ctx.lineTo(-r * 0.5, -r * 0.15); ctx.closePath(); Fi(); break;
    case 'scale': B(); ctx.moveTo(0, -r * 0.75); ctx.lineTo(0, r * 0.7); ctx.moveTo(-r * 0.4, r * 0.72); ctx.lineTo(r * 0.4, r * 0.72); ctx.moveTo(-r * 0.75, -r * 0.5); ctx.lineTo(r * 0.75, -r * 0.5); St();
      B(); ctx.arc(-r * 0.6, -r * 0.05, r * 0.25, 0, Math.PI); ctx.moveTo(r * 0.85, -r * 0.05); ctx.arc(r * 0.6, -r * 0.05, r * 0.25, 0, Math.PI); St(); break;
    case 'check': B(); ctx.moveTo(-r * 0.5, 0); ctx.lineTo(-r * 0.12, r * 0.38); ctx.lineTo(r * 0.55, -r * 0.38); St(); break;
    case 'x': B(); ctx.moveTo(-r * 0.42, -r * 0.42); ctx.lineTo(r * 0.42, r * 0.42); ctx.moveTo(r * 0.42, -r * 0.42); ctx.lineTo(-r * 0.42, r * 0.42); St(); break;
    case 'arrowL': B(); ctx.moveTo(r * 0.6, 0); ctx.lineTo(-r * 0.6, 0); ctx.moveTo(-r * 0.2, -r * 0.4); ctx.lineTo(-r * 0.6, 0); ctx.lineTo(-r * 0.2, r * 0.4); St(); break;
    case 'install': B(); ctx.moveTo(0, -r * 0.7); ctx.lineTo(0, r * 0.25); ctx.moveTo(-r * 0.35, -r * 0.1); ctx.lineTo(0, r * 0.25); ctx.lineTo(r * 0.35, -r * 0.1); St();
      B(); ctx.moveTo(-r * 0.7, r * 0.3); ctx.lineTo(-r * 0.7, r * 0.7); ctx.lineTo(r * 0.7, r * 0.7); ctx.lineTo(r * 0.7, r * 0.3); St(); break;
    case 'remote': rrect(ctx, -r * 0.85, -r * 0.55, r * 0.95, r * 0.7, r * 0.08); St(); rrect(ctx, -r * 0.05, -r * 0.05, r * 0.9, r * 0.65, r * 0.08); St();
      B(); ctx.moveTo(-r * 0.3, r * 0.4); ctx.quadraticCurveTo(-r * 0.4, r * 0.75, -r * 0.05, r * 0.72); St(); break;
    default: B(); ctx.arc(0, 0, r * 0.5, 0, 7); St();
  }
  ctx.restore();
}
// icon inside a glowing disc
function iconDisc(ctx, name, x, y, r, col, p = 1, o = {}) {
  if (p <= 0) return;
  popT(ctx, x, y, p, () => {
    ctx.save(); const g = ctx.createRadialGradient(x, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, o.fill2 || 'rgba(60,30,120,0.95)'); g.addColorStop(1, o.fill || 'rgba(20,10,44,0.95)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.shadowColor = col; ctx.shadowBlur = o.glow ?? 30; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
    icon(ctx, name, x, y, r * 1.05, o.iconColor || '#fff', { glow: 0, check: o.check });
  });
}
function badgeAt(ctx, s, str, x, y, c, color = P1, size = 30, fill = true) { popT(ctx, x, y, pr(s, c, 0.35), () => pill(ctx, str, x, y, { size, color, weight: 800, fill, glow: 30 })); }

// ---------------- avatars ----------------
function avatar(ctx, x, y, r, o = {}) {
  const { initial = '', color = P1, ring: rg = 0, talk = 0, headset = false, label = '', sub = '' } = o;
  if (!(r > 4)) return;
  ctx.save();
  if (talk > 0) { for (let k = 0; k < 3; k++) { const ph = ((R.t || 0) * 1.4 + k / 3) % 1; ctx.globalAlpha = talk * (1 - ph) * 0.6; ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r * (1 + ph * 0.55), 0, 7); ctx.stroke(); } ctx.globalAlpha = 1; }
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, color); g.addColorStop(1, '#1b0d3a');
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.shadowColor = color; ctx.shadowBlur = 30 + rg * 30; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 3 + rg * 3; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 3, 0, 7); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(x, y - r * 0.18, r * 0.36, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + r * 0.95, r * 0.7, 0, 7); ctx.fill(); ctx.restore();
  if (headset) { ctx.strokeStyle = '#1b0d3a'; ctx.lineWidth = r * 0.09; ctx.beginPath(); ctx.arc(x, y - r * 0.18, r * 0.47, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.fillStyle = '#1b0d3a'; rrect(ctx, x + r * 0.37, y - r * 0.32, r * 0.16, r * 0.3, 4); ctx.fill(); ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.moveTo(x + r * 0.45, y - r * 0.05); ctx.quadraticCurveTo(x + r * 0.4, y + r * 0.2, x + r * 0.1, y + r * 0.18); ctx.stroke(); }
  ctx.restore();
  if (initial) { ctx.save(); ctx.beginPath(); ctx.arc(x + r * 0.72, y - r * 0.72, r * 0.3, 0, 7); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore();
    text(ctx, initial, x + r * 0.72, y - r * 0.7, { size: r * 0.36, weight: 900 }); }
  if (label) text(ctx, label, x, y + r + 34, { size: Math.max(24, r * 0.32), weight: 800 });
  if (sub) text(ctx, sub, x, y + r + 34 + Math.max(24, r * 0.32) * 1.15, { size: Math.max(18, r * 0.22), weight: 600, color: C.dim });
}
function waveform(ctx, x, y, w, h, amp, color = TEAL, seed = 1) {
  const n = 28; ctx.save(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10;
  for (let k = 0; k < n; k++) { const v = amp * (0.25 + 0.75 * Math.abs(Math.sin((R.t || 0) * 9 + k * 0.7 + seed) * Math.sin((R.t || 0) * 5.3 + k * 1.3))); const bh = Math.max(4, h * v);
    rrect(ctx, x + k * w / n, y - bh / 2, w / n * 0.55, bh, 3); ctx.fill(); }
  ctx.restore();
}
// is the voice of a given dialogue segment speaking at global time t?
function speaking(segId, t) { const sg = segById(segId); if (!sg || !sg.words.length) return 0; return t > sg.words[0].t0 - 0.05 && t < sg.words[sg.words.length - 1].t1 + 0.05 ? 1 : 0; }
// words of a segment revealed up to global time t
function spokenText(segId, t, all = false) { const sg = segById(segId); if (!sg) return ''; return sg.words.filter(w => all || w.t0 <= t + 0.02).map(w => w.w).join(' '); }
function phraseDisplay(str) { const ph = Object.entries(R.spec.phrases || {}).sort((a, b) => b[0].length - a[0].length); for (const [a, b] of ph) str = str.split(a).join(b); return str; }

// ---------------- mockups ----------------
function windowFrame(ctx, x, y, w, h, title = '', o = {}) {
  const { r = 22, accent = P1, dark = 'rgba(13,10,26,0.97)', bar = 54 } = o;
  ctx.save(); rrect(ctx, x, y, w, h, r); ctx.shadowColor = 'rgba(140,70,255,0.45)'; ctx.shadowBlur = 50; ctx.fillStyle = dark; ctx.fill(); ctx.shadowBlur = 0;
  ctx.save(); rrect(ctx, x, y, w, h, r); ctx.clip(); ctx.fillStyle = '#17122b'; ctx.fillRect(x, y, w, bar); ctx.fillStyle = 'rgba(180,140,255,0.15)'; ctx.fillRect(x, y + bar, w, 2); ctx.restore();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(200,150,255,0.45)'; rrect(ctx, x, y, w, h, r); ctx.stroke(); ctx.restore();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, k) => { ctx.beginPath(); ctx.arc(x + 30 + k * 26, y + bar / 2, 8, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  if (title) text(ctx, title, x + w / 2, y + bar / 2 + 1, { size: 22, weight: 700, color: C.axis, fam: /[א-ת]/.test(title) ? FONT : MONO });
}
function phoneFrame(ctx, x, y, w, h, fn, o = {}) {
  ctx.save(); rrect(ctx, x - 12, y - 12, w + 24, h + 24, 52); ctx.fillStyle = '#0a0814'; ctx.shadowColor = o.glow || 'rgba(140,70,255,0.6)'; ctx.shadowBlur = 60; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(210,180,255,0.55)'; ctx.stroke();
  rrect(ctx, x, y, w, h, 42); ctx.clip(); fn(); ctx.restore();
  ctx.save(); rrect(ctx, x + w / 2 - 60, y + 10, 120, 26, 13); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
}
// WhatsApp chat (inside a phone). msgs: [{side:'in'|'out', t: text, at: localTime, name}]
function waChat(ctx, s, x, y, w, h, title, msgs, o = {}) {
  phoneFrame(ctx, x, y, w, h, () => {
    ctx.fillStyle = '#0b141a'; ctx.fillRect(x, y, w, h);
    ctx.save(); ctx.globalAlpha = 0.06; for (let k = 0; k < 40; k++) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + hash(k) * w, y + hash(k + 50) * h, 2 + hash(k + 9) * 4, 0, 7); ctx.fill(); } ctx.restore();
    ctx.fillStyle = '#1f2c34'; ctx.fillRect(x, y, w, 120);
    ctx.beginPath(); ctx.arc(x + w - 70, y + 78, 26, 0, 7); ctx.fillStyle = o.avatarColor || WA_D; ctx.fill();
    if (o.group) icon(ctx, 'users', x + w - 70, y + 78, 34, '#fff', { glow: 0 }); else icon(ctx, 'user', x + w - 70, y + 78, 34, '#fff', { glow: 0 });
    text(ctx, title, x + w - 112, y + 68, { size: 24, weight: 700, align: 'right' });
    text(ctx, o.sub || 'מקוון', x + w - 112, y + 96, { size: 17, weight: 500, align: 'right', color: '#8696a0' });
    let cy = y + 150; const bw = w - 90, scrollTo = o.scroll || 0;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y + 122, w, h - 200); ctx.clip(); ctx.translate(0, -scrollTo);
    for (const m of msgs) {
      const a = typeof m.at === 'number' ? m.at : cueT(s, m.at), p = prog(s.lt, a, a + 0.3); if (p <= 0) continue;
      const size = o.size || 22, lines = wrapLines(ctx, m.t, bw - 40, size, 500), bh = lines.length * size * 1.35 + 44 + (m.name ? 26 : 0);
      const lw = Math.min(bw, Math.max(...lines.map(l => measure(ctx, l, size, 500))) + 44), out = m.side === 'out';
      const bx = out ? x + w - 22 - lw : x + 22;
      slideIn(ctx, p, out ? 40 : -40, 10, () => {
        ctx.save(); rrect(ctx, bx, cy, lw, bh, 14); ctx.fillStyle = out ? '#005c4b' : '#202c33'; ctx.fill(); ctx.restore();
        let ty = cy + 28;
        if (m.name) { text(ctx, m.name, bx + lw - 20, ty, { size: 17, weight: 700, color: m.nameColor || '#53bdeb', align: 'right' }); ty += 26; }
        lines.forEach((l, k) => text(ctx, l, bx + lw - 20, ty + k * size * 1.35, { size, weight: 500, align: 'right' }));
        text(ctx, m.time || '10:2' + (msgs.indexOf(m) % 10), bx + 16, cy + bh - 16, { size: 14, weight: 500, color: '#8696a0', align: 'left', fam: MONO });
      });
      cy += bh + 14;
    }
    ctx.restore();
    ctx.fillStyle = '#1f2c34'; ctx.fillRect(x, y + h - 78, w, 78);
    rrect(ctx, x + 20, y + h - 62, w - 110, 46, 23); ctx.fillStyle = '#2a3942'; ctx.fill();
    text(ctx, 'הודעה', x + w - 112, y + h - 38, { size: 19, weight: 500, align: 'right', color: '#8696a0' });
    ctx.beginPath(); ctx.arc(x + w - 46, y + h - 39, 24, 0, 7); ctx.fillStyle = WA_D; ctx.fill();
  });
}
// CRM lead card
function crmCard(ctx, x, y, w, h, o = {}) {
  const { name = 'דניאל', source = 'וואטסאפ', status = 'ליד חדש', statusColor = TEAL, rows = [], p = 1, highlight = 0 } = o;
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 2); const dy = (1 - E.outBack(clamp(p))) * 40; ctx.translate(0, dy);
  glass(ctx, x, y, w, h, 22, { fill: 'rgba(16,11,32,0.96)', glow: 40 + highlight * 30, border: highlight ? TEAL : 'rgba(190,140,255,0.45)', glowColor: highlight ? 'rgba(46,230,200,0.5)' : 'rgba(140,70,255,0.45)' });
  ctx.save(); rrect(ctx, x, y, w, 56, 22); ctx.clip(); ctx.fillStyle = 'rgba(124,58,237,0.35)'; ctx.fillRect(x, y, w, 56); ctx.restore();
  text(ctx, 'ALTRIX CRM', x + 24, y + 29, { size: 19, weight: 700, fam: MONO, color: C.neon, align: 'left', spacing: 3 });
  text(ctx, 'כרטיס ליד', x + w - 24, y + 29, { size: 21, weight: 700, align: 'right' });
  avatar(ctx, x + w - 70, y + 120, 38, { color: '#6d28d9' });
  text(ctx, name, x + w - 128, y + 106, { size: 34, weight: 900, align: 'right' });
  text(ctx, 'מקור: ' + source, x + w - 128, y + 142, { size: 21, weight: 600, align: 'right', color: C.dim });
  pill(ctx, status, x + 100, y + 112, { size: 21, color: statusColor, fill: false, glow: 14 });
  rows.forEach(([k, v, col], i) => {
    const ry = y + 200 + i * 52; ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x + 24, ry - 24, w - 48, 1.5);
    text(ctx, k, x + w - 30, ry, { size: 21, weight: 600, align: 'right', color: C.axis });
    text(ctx, v, x + 30, ry, { size: 21, weight: 700, align: 'left', color: col || '#fff' });
  });
  ctx.restore();
}
function button(ctx, str, x, y, w, h, o = {}) {
  const { color = P1, p = 1, pressed = 0, fg = '#fff', size = 26, iconName = null } = o; if (p <= 0) return;
  popT(ctx, x, y, p, () => {
    const k = 1 - pressed * 0.06; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
    rrect(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 30 + pressed * 30; ctx.fill(); ctx.restore();
    if (iconName) { const tw = measure(ctx, str, size, 800); icon(ctx, iconName, x + tw / 2 + 22, y, size * 1.1, fg, { glow: 0 }); text(ctx, str, x - 14, y + 1, { size, weight: 800, color: fg }); }
    else text(ctx, str, x, y + 1, { size, weight: 800, color: fg });
  });
}
function toggle(ctx, x, y, on, o = {}) {
  const w = o.w || 110, h = o.h || 56, e = E.outBack(clamp(on));
  ctx.save(); rrect(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = on > 0.5 ? (o.color || C.up) : '#2a2440'; ctx.shadowColor = o.color || C.up; ctx.shadowBlur = 30 * on; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(x - w / 2 + h / 2 + (w - h) * e, y, h / 2 - 6, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
}
function progressBar(ctx, x, y, w, h, p, o = {}) {
  const { color = P1, color2 = C.neon, bgc = 'rgba(255,255,255,0.08)' } = o;
  ctx.save(); rrect(ctx, x, y, w, h, h / 2); ctx.fillStyle = bgc; ctx.fill();
  if (p > 0) { const g = ctx.createLinearGradient(x + w, 0, x, 0); g.addColorStop(0, color); g.addColorStop(1, color2); rrect(ctx, x + w - w * clamp(p), y, Math.max(h, w * clamp(p)), h, h / 2); ctx.fillStyle = g; ctx.shadowColor = color; ctx.shadowBlur = 20; ctx.fill(); }
  ctx.restore();
}
// rule row with icon: [text, cue, icon, color]
function checkRow(ctx, s, str, x, y, c, kind = 'check', o = {}) {
  const p = pr(s, c, 0.4); if (p <= 0) return 0;
  const col = kind === 'check' ? C.up : kind === 'cross' ? C.down : kind === 'warn' ? GOLD : (o.color || P1), r = o.r || 26;
  slideIn(ctx, p, 60, 0, () => {
    if (kind === 'check') check(ctx, x, y, r, 1, col); else if (kind === 'cross') cross(ctx, x, y, r, 1, col); else if (kind === 'warn') warnIcon(ctx, x, y, r, 1); else iconDisc(ctx, kind, x, y, r, col, 1);
    text(ctx, str, x - r - 22, y + 2, { size: o.size || 36, weight: o.weight || 800, align: 'right', color: o.textColor || '#fff' });
    if (o.strike && kind === 'cross') { const tw = measure(ctx, str, o.size || 36, o.weight || 800), sp = prog(s.lt, cueT(s, c) + 0.25, cueT(s, c) + 0.6); ctx.save(); ctx.strokeStyle = C.down; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - r - 22, y + 2); ctx.lineTo(x - r - 22 - tw * sp, y + 2); ctx.stroke(); ctx.restore(); }
  });
  return p;
}
function events(list) { return s => list.map(([c, type, k]) => ({ lt: cueT(s, c), type: type || 'pop', k })); }

// ---------------- funnel (recurring centerpiece) ----------------
// vertical 9-band funnel. lit: array of stage indexes to light; build: 0..1 per band reveal; litP: 0..1
function funnel(ctx, cx, y0, y1, wTop, wBot, o = {}) {
  const { lit = [], build = 1, litP = 1, done = -1, labels = true, size = 1, here = -1, t = 0, flow = 1, dimOthers = 0.55 } = o;
  const n = STAGES.length, bh = (y1 - y0) / n, gap = 6 * size;
  for (let k = 0; k < n; k++) {
    const bp = clamp(build * n - k * 0.85); if (bp <= 0) continue;
    const ya = y0 + k * bh, yb = ya + bh - gap, wa = lerp(wTop, wBot, k / n), wb = lerp(wTop, wBot, (k + 1) / n) , isLit = lit.includes(k), isDone = k <= done;
    const e = E.outBack(bp);
    ctx.save(); ctx.globalAlpha *= clamp(bp * 2) * (lit.length && !isLit && !isDone ? dimOthers + (1 - dimOthers) * (1 - litP) : 1);
    ctx.translate(cx, (ya + yb) / 2); ctx.scale(e, 1); ctx.translate(-cx, -(ya + yb) / 2);
    ctx.beginPath(); ctx.moveTo(cx - wa / 2, ya); ctx.lineTo(cx + wa / 2, ya); ctx.lineTo(cx + wb / 2, yb); ctx.lineTo(cx - wb / 2, yb); ctx.closePath();
    const g = ctx.createLinearGradient(cx - wa / 2, 0, cx + wa / 2, 0);
    if (isLit) { g.addColorStop(0, `rgba(255,201,77,${0.35 + 0.5 * litP})`); g.addColorStop(0.5, `rgba(255,170,60,${0.25 + 0.4 * litP})`); g.addColorStop(1, `rgba(255,201,77,${0.35 + 0.5 * litP})`); }
    else if (isDone) { g.addColorStop(0, 'rgba(46,230,200,0.32)'); g.addColorStop(0.5, 'rgba(46,230,200,0.14)'); g.addColorStop(1, 'rgba(46,230,200,0.32)'); }
    else { const a = 0.5 - k * 0.025; g.addColorStop(0, `rgba(124,58,237,${a})`); g.addColorStop(0.5, `rgba(80,30,170,${a * 0.6})`); g.addColorStop(1, `rgba(124,58,237,${a})`); }
    ctx.fillStyle = g; if (isLit) { ctx.shadowColor = GOLD; ctx.shadowBlur = 40 * litP; } ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = isLit ? 3 : 1.5; ctx.strokeStyle = isLit ? '#ffe2a0' : isDone ? 'rgba(46,230,200,0.7)' : 'rgba(210,170,255,0.55)'; ctx.stroke();
    // sheen
    ctx.save(); ctx.clip(); const sx = cx - wa / 2 + ((t * 0.25 + k * 0.11) % 1.6) * wa; const sg = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.12)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(cx - wa / 2, ya, wa, bh); ctx.restore();
    if (labels) {
      const my = (ya + yb) / 2, half = Math.min(wa, wb) / 2;
      text(ctx, STAGES[k][0], cx - half + 22 * size, my + 1, { size: 19 * size, weight: 800, fam: MONO, align: 'left', color: isLit ? '#1a0f00' : '#fff', spacing: 1 });
      fitText(ctx, STAGES[k][1], cx + half - 22 * size, my + 1, half * 1.05 - 40 * size, { size: 22 * size, weight: 800, align: 'right', color: isLit ? '#1a0f00' : 'rgba(255,255,255,0.92)' });
    }
    ctx.restore();
    if (isDone && labels && here < 0) { const half = Math.min(wa, wb) / 2; check(ctx, cx + half + 30 * size, (ya + yb) / 2, 14 * size, 1, TEAL); }
  }
  // particles flowing down
  if (flow > 0 && build >= 1) {
    ctx.save();
    for (let k = 0; k < 46; k++) {
      const f = ((t * (0.07 + hash(k) * 0.05) + hash(k + 11)) % 1), yy = lerp(y0, y1, f), ww = lerp(wTop, wBot, f) * 0.92;
      const xx = cx + (hash(k + 3) - 0.5) * ww * (1 - 0.2 * Math.sin(t + k));
      ctx.globalAlpha = flow * 0.75 * Math.sin(f * Math.PI); ctx.fillStyle = hash(k + 5) > 0.7 ? GOLD : '#fff'; ctx.shadowColor = P2; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(xx, yy, 1.6 + hash(k + 8) * 2.4, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  if (here >= 0) { // "you are here" marker to the side
    const ya = y0 + here * bh + bh / 2 - gap / 2, wa = lerp(wTop, wBot, (here + 0.5) / n), xx = cx + wa / 2 + 50 * size, bob = Math.sin(t * 4) * 8;
    ctx.save(); ctx.globalAlpha = litP; arrow(ctx, xx + 100 * size + bob, ya, xx + bob, ya, 1, { color: GOLD, width: 6 * size, head: 22 * size }); ctx.restore();
    text(ctx, 'אנחנו כאן', xx + 112 * size + bob, ya, { size: 28 * size, weight: 900, color: GOLD, align: 'left', alpha: litP });
  }
}
// compact horizontal journey rail (overlay, top center): stage nodes RTL
function journeyRail(ctx, t, lit, alpha = 1) {
  if (alpha <= 0) return;
  const n = STAGES.length, xR = 1260, xL = 660, y = 58, dx = (xR - xL) / (n - 1), lo = lit.length ? Math.min(...lit) : -1;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(200,170,255,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(xL, y); ctx.stroke();
  if (lo > 0) { ctx.strokeStyle = TEAL; ctx.shadowColor = TEAL; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(xR - dx * lo, y); ctx.stroke(); ctx.shadowBlur = 0; }
  for (let k = 0; k < n; k++) {
    const x = xR - k * dx, on = lit.includes(k), done = lo >= 0 && k < lo;
    ctx.beginPath(); ctx.arc(x, y, on ? 9 + Math.sin(t * 5) * 1.5 : 6, 0, 7);
    ctx.fillStyle = on ? GOLD : done ? TEAL : '#3a2d5c'; if (on) { ctx.shadowColor = GOLD; ctx.shadowBlur = 22; } ctx.fill(); ctx.shadowBlur = 0;
    if (on) text(ctx, STAGES[k][0], x, y + 27, { size: 15, weight: 800, fam: MONO, color: GOLD });
  }
  ctx.restore();
}

// ---------------- overlay: progress, logo, chapter tag, journey rail, subtitles, risk ----------------
window.OVERLAY = (ctx, t, seg, sc) => {
  R.t = t;
  const spec = R.spec, n = chOf(seg.id), chp = chapter(n), bare = sc.bare || seg.card;
  const lt = t - seg.t0, fin = Math.min(prog(lt, 0.15, 0.6), 1 - prog(t, R.tl.duration - 1.2, R.tl.duration - 0.6));
  if (!bare && chp) {
    drawLogo(ctx, 150, 62, 230, 0.9 * fin, 'mark');
    const tag = `פרק ${n}`;
    ctx.save(); ctx.globalAlpha = fin;
    const pw = pill(ctx, tag, 1790, 52, { size: 20, color: P1, glow: 14 });
    fitText(ctx, chp.title.replace('ALTRIX', 'ALTRIX'), 1790 - pw / 2 - 16, 53, 430, { size: 22, weight: 700, align: 'right', color: 'rgba(255,255,255,0.8)' });
    ctx.restore();
    if (sc.rail !== false) journeyRail(ctx, t, chp.stages || [], fin * 0.95);
  }
  // subtitles
  if (sc.captions !== false && R.tl.subs) {
    const c = R.tl.subs.find(c => t >= c.t0 && t < c.t1);
    if (c && c.voice === 'narrator' || (c && sc.dialogCaps)) {
      const a = Math.min(prog(t, c.t0, c.t0 + 0.12), 1 - prog(t, c.t1 - 0.1, c.t1)), y = sc.capY || 1000;
      let size = 38; while (size > 26 && measure(ctx, c.text, size, 700) > 1560) size -= 2;
      const tw = measure(ctx, c.text, size, 700);
      ctx.save(); ctx.globalAlpha = a; rrect(ctx, CX - tw / 2 - 30, y - 31, tw + 60, 62, 16); ctx.fillStyle = 'rgba(6,3,16,0.74)'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(190,140,255,0.28)'; ctx.stroke(); ctx.restore();
      text(ctx, c.text, CX, y + 1, { size, weight: 700, color: '#fff', alpha: a });
    }
  }
  if (sc.risk) { const a = prog(lt, 0.4, 1) * (1 - prog(lt, seg.t1 - seg.t0 - 0.3, seg.t1 - seg.t0)); text(ctx, '⚠ ' + FX().risk, CX, 1056, { size: 19, weight: 600, color: 'rgba(255,214,120,0.75)', alpha: a }); }
  // progress (rtl)
  const p = t / R.tl.duration; ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(0, 0, W, 5);
  const pg = ctx.createLinearGradient(0, 0, W, 0); pg.addColorStop(0, C.violet); pg.addColorStop(1, C.neon); ctx.fillStyle = pg; ctx.fillRect(W * (1 - p), 0, W * p, 5);
  if (R.tl.preview) text(ctx, 'PREVIEW · ללא קול', CX, 1062, { size: 20, weight: 700, color: 'rgba(255,255,255,0.35)' });
};

// ---------------- chapter card ----------------
function chapterCard(n) {
  return {
    bare: true, captions: false, trans: 'zoom',
    events: s => [{ lt: 0.05, type: 'riser' }, { lt: 0.9, type: 'impact', k: 0.6 }],
    draw(ctx, s) {
      const { lt, d } = s, chp = chapter(n), st = chp.stages || [];
      bg(ctx, s, { rain: 1.6, glow: 1.3, grid: 0.8 });
      const out = fadeOut(ctx, s, d - 0.35);
      ctx.save(); ctx.globalAlpha = out;
      // funnel on the left with this chapter's stage(s) lit
      const fp = prog(lt, 0.1, 1.1), litP = prog(lt, 0.9, 1.4);
      funnel(ctx, 560, 150, 940, 620, 300, { build: fp, lit: st, litP, done: st.length ? Math.min(...st) - 1 : -1, t: s.t, here: st.length ? st[0] : -1, size: 0.92, dimOthers: 0.5 });
      if (!st.length) text(ctx, n === 2 ? 'הכרת המוצר' : n === 10 ? 'לאורך כל המסע' : n === 1 ? 'המסע שלכם מתחיל' : 'המסע המלא', 560, 990, { size: 26, weight: 800, color: GOLD, alpha: litP });
      // chapter number + titles on the right
      const xr = 1780, nn = String(n).padStart(2, '0');
      popT(ctx, 1560, 330, prog(lt, 0.25, 0.65), () => {
        text(ctx, nn, 1560, 330, { size: 220, weight: 900, fam: MONO, color: 'rgba(168,85,247,0.18)', glow: 0 });
        text(ctx, nn, 1560, 330, { size: 220, weight: 900, fam: MONO, color: 'rgba(0,0,0,0)', stroke: 3, strokeColor: 'rgba(227,196,255,0.7)' });
      });
      kicker(ctx, s, `CHAPTER ${nn} · ${chp.en}`, 1500, 500, 0.5);
      const words = chp.title; let size = 76; while (size > 40 && measure(ctx, words, size, 900) > 740) size -= 2;
      const lines = size <= 56 ? wrapLines(ctx, words, 740, 66, 900) : [words];
      lines.forEach((l, k) => wipeText(ctx, l, xr, 600 + k * 92, prog(lt, 0.75 + k * 0.15, 1.25 + k * 0.15), { size: lines.length > 1 ? 66 : size, weight: 900, align: 'right', glow: 30, glowColor: P1 }));
      const lw = 740 * E.outExpo(prog(lt, 0.9, 1.6)); const lg = ctx.createLinearGradient(xr - lw, 0, xr, 0); lg.addColorStop(0, 'rgba(168,85,247,0)'); lg.addColorStop(1, P2);
      ctx.fillStyle = lg; ctx.fillRect(xr - lw, 600 + lines.length * 92 - 20, lw, 4);
      if (st.length) { const lbl = st.map(k => STAGES[k][0]).join('  →  '); popT(ctx, xr - 200, 600 + lines.length * 92 + 50, prog(lt, 1.3, 1.7), () => text(ctx, lbl, xr, 600 + lines.length * 92 + 50, { size: 26, weight: 800, fam: MONO, color: GOLD, align: 'right', glow: 20 })); }
      ring(ctx, 1560, 330, 420, prog(lt, 0.3, 1.1));
      ctx.restore();
    },
  };
}

// ---------------- generic templates ----------------
// cards in a row (rtl: first item on the right). items: {t, sub, icon, cue, color}
function rowCards(ctx, s, items, o = {}) {
  const { y = 330, h = 420, x0 = 110, x1 = 1810, gap = 34, r = 66, size = 42, subSize = 26 } = o, n = items.length, w = (x1 - x0 - gap * (n - 1)) / n;
  let lastOn = -1; items.forEach((it, k) => { if (s.lt >= cueT(s, it.cue) - 0.05) lastOn = k; });
  items.forEach((it, k) => {
    const p = pr(s, it.cue, 0.5); if (p <= 0) return;
    const x = x1 - (k + 1) * w - k * gap, col = it.color || P1, act = k === lastOn && o.focus !== false;
    slideIn(ctx, p, 0, 70, () => {
      glass(ctx, x, y, w, h, 28, { border: act ? col : 'rgba(190,140,255,0.3)', glowColor: act ? col : 'rgba(140,70,255,0.35)', glow: act ? 45 : 25 });
      iconDisc(ctx, it.icon || 'star', x + w / 2, y + 30 + r, r, col, 1, { check: it.check });
      const ty = y + 2 * r + 95;
      const tl = wrapLines(ctx, it.t, w - 40, size, 900); tl.forEach((l, j) => text(ctx, l, x + w / 2, ty + j * size * 1.12, { size, weight: 900 }));
      if (it.sub) { const sl = wrapLines(ctx, it.sub, w - 50, subSize, 600); sl.forEach((l, j) => text(ctx, l, x + w / 2, ty + tl.length * size * 1.12 + 22 + j * subSize * 1.35, { size: subSize, weight: 600, color: C.dim })); }
      if (it.num) { ctx.save(); ctx.beginPath(); ctx.arc(x + w - 34, y + 34, 22, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.restore(); text(ctx, String(it.num), x + w - 34, y + 35, { size: 24, weight: 900, fam: MONO }); }
    });
  });
}
// vertical list of rows. items: {t, sub, kind: 'check'|'cross'|'warn'|iconName, cue, color}
function listRows(ctx, s, items, o = {}) {
  const { x = 1720, y = 330, dy = 110, size = 40, r = 30, maxW = 1100 } = o;
  items.forEach((it, k) => {
    const yy = y + k * dy, p = pr(s, it.cue, 0.45); if (p <= 0) return;
    slideIn(ctx, p, 80, 0, () => {
      if (o.panel) glass(ctx, x - maxW - 40, yy - dy / 2 + 10, maxW + 100, dy - 20, 22, { glow: 18, border: 'rgba(190,140,255,0.22)' });
      const kind = it.kind || 'check', col = it.color || (kind === 'check' ? C.up : kind === 'cross' ? C.down : P1);
      if (kind === 'check') check(ctx, x, yy, r, 1, col); else if (kind === 'cross') cross(ctx, x, yy, r, 1, col); else if (kind === 'warn') warnIcon(ctx, x, yy - 4, r, 1);
      else if (kind === 'num') { ctx.save(); ctx.beginPath(); ctx.arc(x, yy, r, 0, 7); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fill(); ctx.restore(); text(ctx, String(it.n), x, yy + 2, { size: r * 1.1, weight: 900, fam: MONO }); }
      else iconDisc(ctx, kind, x, yy, r, col, 1);
      text(ctx, it.t, x - r - 26, yy + (it.sub ? -14 : 2), { size, weight: 800, align: 'right' });
      if (it.sub) text(ctx, it.sub, x - r - 26, yy + size * 0.72, { size: size * 0.62, weight: 600, align: 'right', color: C.dim });
      if (it.strike) { const tw = measure(ctx, it.t, size, 800), sp = prog(s.lt, cueT(s, it.cue) + 0.3, cueT(s, it.cue) + 0.7); ctx.save(); ctx.strokeStyle = C.down; ctx.lineWidth = 5; ctx.shadowColor = C.down; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(x - r - 22, yy + 2); ctx.lineTo(x - r - 22 - (tw + 8) * sp, yy + 2); ctx.stroke(); ctx.restore(); }
    });
  });
}
// two-column contrast panel (right = first)
function contrast(ctx, s, A, B, o = {}) {
  const { y = 280, h = 560, at = 0 } = o, cols = [[1000, 1820, A], [100, 920, B]];
  cols.forEach(([x0, x1, c], k) => {
    const p = pr(s, c.cue ?? at, 0.5); if (p <= 0) return;
    slideIn(ctx, p, k ? -80 : 80, 0, () => {
      const col = c.color || (c.good ? C.up : C.down);
      glass(ctx, x0, y, x1 - x0, h, 30, { border: col, glowColor: col, glow: 30, fill: 'rgba(14,9,30,0.86)' });
      ctx.save(); rrect(ctx, x0, y, x1 - x0, 92, 30); ctx.clip(); ctx.fillStyle = c.good ? 'rgba(22,199,132,0.18)' : 'rgba(242,54,69,0.16)'; ctx.fillRect(x0, y, x1 - x0, 92); ctx.restore();
      if (c.icon) iconDisc(ctx, c.icon, x1 - 56, y + 46, 28, col, 1); else (c.good ? check : cross)(ctx, x1 - 56, y + 46, 26, 1, col);
      text(ctx, c.h, x1 - 100, y + 47, { size: 40, weight: 900, align: 'right' });
      (c.items || []).forEach((it, j) => {
        const ip = pr(s, it.cue, 0.4), yy = y + 160 + j * 92; if (ip <= 0) return;
        slideIn(ctx, ip, 0, 20, () => {
          const iw = 22; ctx.save(); ctx.beginPath(); ctx.arc(x1 - 60, yy, 9, 0, 7); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.fill(); ctx.restore();
          fitText(ctx, it.t, x1 - 60 - iw - 6, yy + 2, x1 - x0 - 140, { size: 34, weight: 700, align: 'right' });
        });
      });
      if (c.draw) c.draw(x0, y, x1 - x0, h);
    });
  });
}
// big centered statement
function statement(ctx, s, he, o = {}) {
  const { y = 470, at = 0, size = 110, color = '#fff', glowColor = P1, en = null } = o;
  if (en) kicker(ctx, s, en, CX, y - size * 0.9, at);
  popT(ctx, CX, y, prog(s.lt, at - 0.05, at + 0.35), () => text(ctx, he, CX, y, { size, weight: 900, color, glow: 40, glowColor }));
  ring(ctx, CX, y, 700, prog(s.lt, at, at + 0.8), glowColor);
}
// title + glowing underline sweep
function sectionTitle(ctx, s, he, en, o = {}) { heading(ctx, s, he, en, { y: o.y || 190, at: o.at || 0, size: o.size || 60 }); }

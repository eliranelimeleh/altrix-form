// ALTRIX reel engine: deterministic canvas renderer, frame = f(t).
// Scenes (scenes_<id>.js) register in SCENES and are synced to the voice
// timeline produced by tools/tts.py.
'use strict';
const W = 1080, H = 1920;
const C = {
  bg0: '#04020a', bg1: '#0c0620', panel: '#0d0b17', panelTop: '#121020', grid: 'rgba(150,130,220,0.075)',
  purple: '#a855f7', purple2: '#c084fc', neon: '#e3c4ff', violet: '#7c3aed', deep: '#3b1a78',
  up: '#16c784', down: '#f23645', gold: '#ffc94d', teal: '#2ee6c8', white: '#ffffff',
  dim: 'rgba(255,255,255,0.55)', axis: 'rgba(200,190,235,0.55)',
};
const FONT = 'Heebo', MONO = 'JetBrains Mono';

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: t => t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: t => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// keyframe interpolation: frames = [[t, value(s)...]]
function kf(t, frames, ease = E.inOut) {
  if (t <= frames[0][0]) return frames[0].slice(1);
  for (let i = 1; i < frames.length; i++) {
    if (t <= frames[i][0]) {
      const a = frames[i - 1], b = frames[i], p = ease((t - a[0]) / (b[0] - a[0]));
      return a.slice(1).map((v, k) => lerp(v, b[k + 1], p));
    }
  }
  return frames[frames.length - 1].slice(1);
}
const fmt = (p, d = 0) => p.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// ---------- drawing primitives ----------
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
const isHeb = s => /[֐-׿]/.test(s);
function font(size, weight = 800, fam = FONT) { return `${weight} ${size}px "${fam}"`; }
function text(ctx, s, x, y, o = {}) {
  const { size = 60, weight = 800, color = C.white, align = 'center', base = 'middle', glow = 0, glowColor = color,
    stroke = 0, strokeColor = 'rgba(0,0,0,0.85)', fam = FONT, alpha = 1, spacing = 0 } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = font(size, weight, fam);
  ctx.direction = isHeb(s) ? 'rtl' : 'ltr';
  ctx.textAlign = align; ctx.textBaseline = base;
  if (spacing) ctx.letterSpacing = spacing + 'px';
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = strokeColor; ctx.strokeText(s, x, y); }
  if (glow) { ctx.shadowColor = glowColor; ctx.shadowBlur = glow; ctx.fillStyle = color; ctx.fillText(s, x, y); }
  ctx.shadowBlur = 0; ctx.fillStyle = color; ctx.fillText(s, x, y);
  ctx.restore();
}
function measure(ctx, s, size, weight = 800, fam = FONT, spacing = 0) {
  ctx.save(); ctx.font = font(size, weight, fam); if (spacing) ctx.letterSpacing = spacing + 'px';
  const w = ctx.measureText(s).width; ctx.restore(); return w;
}
// pop-in scale around a point
function popT(ctx, x, y, p, fn, ease = E.outBack) {
  if (p <= 0) return;
  const s = ease(clamp(p));
  ctx.save(); ctx.globalAlpha *= clamp(p * 3); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); fn(); ctx.restore();
}
// wipe reveal (rtl: from right to left)
function wipeText(ctx, s, x, y, p, o = {}) {
  if (p <= 0) return;
  const w = measure(ctx, s, o.size || 60, o.weight || 800, o.fam || FONT, o.spacing || 0) + 40;
  const h = (o.size || 60) * 1.6, rtl = isHeb(s), e = E.outExpo(clamp(p));
  ctx.save();
  const x0 = o.align === 'right' ? x - w : o.align === 'left' ? x : x - w / 2;
  ctx.beginPath();
  if (rtl) ctx.rect(x0 + w * (1 - e), y - h / 2, w * e + 2, h); else ctx.rect(x0, y - h / 2, w * e, h);
  ctx.clip();
  text(ctx, s, x, y + (1 - e) * 18, { ...o, alpha: (o.alpha ?? 1) * clamp(p * 2.5) });
  ctx.restore();
}
function pill(ctx, s, x, y, o = {}) {
  const { size = 34, color = C.purple, fg = '#fff', pad = 18, h = size * 1.55, weight = 800, fam = FONT, glow = 22, fill = true } = o;
  const w = measure(ctx, s, size, weight, fam) + pad * 2;
  ctx.save();
  rrect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.shadowColor = color; ctx.shadowBlur = glow;
  if (fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.fillStyle = 'rgba(10,6,22,0.85)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke(); }
  ctx.shadowBlur = 0;
  ctx.restore();
  text(ctx, s, x, y + 1, { size, weight, color: fill ? fg : color, fam });
  return w;
}
function glass(ctx, x, y, w, h, r = 28, o = {}) {
  const { border = 'rgba(190,140,255,0.35)', fill = 'rgba(18,12,36,0.78)', glow = 40, glowColor = 'rgba(140,70,255,0.45)' } = o;
  ctx.save(); rrect(ctx, x, y, w, h, r); ctx.shadowColor = glowColor; ctx.shadowBlur = glow; ctx.fillStyle = fill; ctx.fill();
  ctx.shadowBlur = 0; ctx.lineWidth = 2; ctx.strokeStyle = border; ctx.stroke(); ctx.restore();
}
function check(ctx, x, y, r, p, color = C.up) {
  if (p <= 0) return;
  popT(ctx, x, y, p, () => {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 30; ctx.fill();
    ctx.shadowBlur = 0; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(x - r * 0.45, y + r * 0.02); ctx.lineTo(x - r * 0.1, y + r * 0.36); ctx.lineTo(x + r * 0.48, y - r * 0.32); ctx.stroke(); ctx.restore();
  });
}
function cross(ctx, x, y, r, p, color = C.down) {
  if (p <= 0) return;
  popT(ctx, x, y, p, () => {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 30; ctx.fill();
    ctx.shadowBlur = 0; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.strokeStyle = '#fff'; const k = r * 0.38;
    ctx.beginPath(); ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k); ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k); ctx.stroke(); ctx.restore();
  });
}
function arrow(ctx, x0, y0, x1, y1, p, o = {}) {
  if (p <= 0) return;
  const { color = C.up, width = 10, head = 34, glow = 25 } = o, e = E.outCubic(clamp(p));
  const x = lerp(x0, x1, e), y = lerp(y0, y1, e), a = Math.atan2(y - y0, x - x0);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = glow;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - Math.cos(a) * head * 0.6, y - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a - 0.5) * head, y - Math.sin(a - 0.5) * head);
  ctx.lineTo(x - Math.cos(a + 0.5) * head, y - Math.sin(a + 0.5) * head); ctx.closePath(); ctx.fill(); ctx.restore();
}
function ring(ctx, x, y, r, p, color = C.purple) { // expanding shockwave
  if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.globalAlpha *= (1 - p); ctx.lineWidth = 6 * (1 - p) + 1; ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x, y, r * E.outCubic(p), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
function burst(ctx, x, y, p, color = C.purple2, n = 18, seed = 1, dist = 160) {
  if (p <= 0 || p >= 1) return;
  const r = rng(seed); ctx.save();
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = dist * (0.4 + r() * 0.8) * E.outExpo(p), s = (2 + r() * 5) * (1 - p);
    ctx.globalAlpha = 1 - p; ctx.fillStyle = r() > 0.3 ? color : '#fff'; ctx.shadowColor = color; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function keycap(ctx, s, x, y, p, o = {}) {
  const { size = 64, w = 170, h = 150, pressed = 0 } = o;
  popT(ctx, x, y, p, () => {
    const dy = pressed * 10;
    ctx.save(); rrect(ctx, x - w / 2, y - h / 2 + 14, w, h, 26); ctx.fillStyle = '#2a1650'; ctx.fill();
    rrect(ctx, x - w / 2, y - h / 2 + dy, w, h - 6, 26);
    const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#4b2a8f'); g.addColorStop(1, '#2d1660');
    ctx.fillStyle = g; ctx.shadowColor = C.purple; ctx.shadowBlur = 30 + pressed * 30; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(220,180,255,0.6)'; ctx.stroke(); ctx.restore();
    text(ctx, s, x, y + dy - 4, { size, weight: 800, fam: MONO, color: '#fff' });
  });
}
function cursor(ctx, x, y, click = 0, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - click * 0.12), s * (1 - click * 0.12));
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 54); ctx.lineTo(14, 41); ctx.lineTo(25, 64); ctx.lineTo(34, 60); ctx.lineTo(23, 37); ctx.lineTo(41, 37); ctx.closePath();
  ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = '#111'; ctx.stroke();
  ctx.restore();
}

// ---------- candles ----------
// pivots: [[index, price], ...] ; returns [{o,h,l,c}]
function genCandles(pivots, o = {}) {
  const { seed = 7, noise = 0.18, wick = 0.35 } = o, r = rng(seed), out = [];
  const n = pivots[pivots.length - 1][0] + 1;
  const path = i => {
    for (let k = 1; k < pivots.length; k++) if (i <= pivots[k][0]) {
      const [i0, p0] = pivots[k - 1], [i1, p1] = pivots[k], t = (i - i0) / (i1 - i0);
      return lerp(p0, p1, E.inOut(t) * 0.35 + t * 0.65);
    }
    return pivots[pivots.length - 1][1];
  };
  let range = 0; for (let k = 1; k < pivots.length; k++) range = Math.max(range, Math.abs(pivots[k][1] - pivots[k - 1][1]) / (pivots[k][0] - pivots[k - 1][0]));
  let prev = path(0);
  for (let i = 0; i < n; i++) {
    const target = path(i + 1 < n ? i + 1 : i) + (r() - 0.5) * range * noise * 4;
    const op = prev, cl = i === n - 1 ? path(i) : target;
    const body = Math.abs(cl - op) + range * 0.15;
    out.push({ o: op, c: cl, h: Math.max(op, cl) + r() * body * wick, l: Math.min(op, cl) - r() * body * wick });
    prev = cl;
  }
  // force the pivots to be the true swing points
  pivots.forEach(([i, p], k) => {
    const c = out[Math.min(i, n - 1)];
    const isHigh = (k > 0 ? p > pivots[k - 1][1] : p > pivots[1][1]);
    for (let j = Math.max(0, i - 4); j <= Math.min(n - 1, i + 4); j++) {
      const q = out[j];
      if (isHigh) { q.h = Math.min(q.h, p - range * 0.05); q.o = Math.min(q.o, q.h); q.c = Math.min(q.c, q.h); }
      else { q.l = Math.max(q.l, p + range * 0.05); q.o = Math.max(q.o, q.l); q.c = Math.max(q.c, q.l); }
    }
    if (isHigh) c.h = p; else c.l = p;
  });
  for (let i = 1; i < n; i++) out[i].o = out[i - 1].c; // continuity
  out.forEach(q => { q.h = Math.max(q.h, q.o, q.c); q.l = Math.min(q.l, q.o, q.c); });
  return out;
}
// partially formed candle at progress f along a path open -> extremes -> close
function formCandle(c, f) {
  const bull = c.c >= c.o, pts = bull ? [c.o, c.l, c.h, c.c] : [c.o, c.h, c.l, c.c];
  const seg = [0, 0.3, 0.75, 1];
  let price = c.o, hi = c.o, lo = c.o;
  for (let k = 1; k < 4; k++) {
    const t = clamp((f - seg[k - 1]) / (seg[k] - seg[k - 1]));
    if (f >= seg[k - 1]) { price = lerp(pts[k - 1], pts[k], E.inOut(t)); hi = Math.max(hi, price); lo = Math.min(lo, price); }
  }
  return { o: c.o, c: price, h: hi, l: lo };
}

class Chart {
  constructor(candles, o = {}) {
    this.c = candles; this.sym = o.sym || 'BTCUSD'; this.tf = o.tf || '4H'; this.dec = o.dec ?? 0;
    this.v = { i0: 0, i1: candles.length, pMin: 0, pMax: 1 };
  }
  autoP(i0, i1, pad = 0.12) {
    let lo = Infinity, hi = -Infinity;
    for (let i = Math.max(0, Math.floor(i0)); i < Math.min(this.c.length, Math.ceil(i1)); i++) { lo = Math.min(lo, this.c[i].l); hi = Math.max(hi, this.c[i].h); }
    const r = hi - lo; return [lo - r * pad, hi + r * pad];
  }
  view(i0, i1, pMin, pMax) { if (pMin === undefined) [pMin, pMax] = this.autoP(i0, i1); this.v = { i0, i1, pMin, pMax }; return this; }
  layout(x, y, w, h, o = {}) {
    this.r = { x, y, w, h }; const head = o.head ?? 96, axis = o.axis ?? 150, foot = o.foot ?? 54, left = o.left ?? 0;
    this.p = { x: x + left, y: y + head, w: w - axis - left, h: h - head - foot }; this.opt = o; return this;
  }
  X(i) { const v = this.v; return this.p.x + (i - v.i0 + 0.5) / (v.i1 - v.i0) * this.p.w; }
  Y(p) { const v = this.v; return this.p.y + (1 - (p - v.pMin) / (v.pMax - v.pMin)) * this.p.h; }
  cw() { return this.p.w / (this.v.i1 - this.v.i0); }
  clip(ctx, fn) { ctx.save(); ctx.beginPath(); ctx.rect(this.p.x, this.p.y - 30, this.p.w, this.p.h + 60); ctx.clip(); fn(); ctx.restore(); }
  frame(ctx, o = {}) {
    const { x, y, w, h } = this.r, { alpha = 1 } = o;
    ctx.save(); ctx.globalAlpha *= alpha;
    rrect(ctx, x, y, w, h, 30); ctx.shadowColor = 'rgba(140,70,255,0.55)'; ctx.shadowBlur = 70; ctx.fillStyle = C.panel; ctx.fill(); ctx.shadowBlur = 0;
    ctx.save(); rrect(ctx, x, y, w, h, 30); ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(124,58,237,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = C.panelTop; ctx.fillRect(x, y, w, this.p.y - y - 14);
    ctx.fillStyle = 'rgba(180,140,255,0.12)'; ctx.fillRect(x, this.p.y - 14, w, 2);
    ctx.restore();
    rrect(ctx, x, y, w, h, 30); ctx.lineWidth = 2.5; const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, 'rgba(200,150,255,0.7)'); bg.addColorStop(0.5, 'rgba(120,60,240,0.25)'); bg.addColorStop(1, 'rgba(200,150,255,0.6)'); ctx.strokeStyle = bg; ctx.stroke();
    ctx.restore();
  }
  grid(ctx) {
    const { pMin, pMax } = this.v, raw = (pMax - pMin) / 6, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw);
    ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1.5;
    for (let p = Math.ceil(pMin / step) * step; p < pMax; p += step) {
      const y = this.Y(p); if (y < this.p.y || y > this.p.y + this.p.h) continue;
      ctx.beginPath(); ctx.moveTo(this.p.x, y); ctx.lineTo(this.p.x + this.p.w, y); ctx.stroke();
      text(ctx, fmt(p, this.dec), this.p.x + this.p.w + 16, y, { size: 24, weight: 500, fam: MONO, color: C.axis, align: 'left' });
    }
    const v = this.v, every = Math.max(2, Math.round((v.i1 - v.i0) / 6));
    for (let i = Math.ceil(v.i0 / every) * every; i < v.i1; i += every) {
      const x = this.X(i); ctx.beginPath(); ctx.moveTo(x, this.p.y); ctx.lineTo(x, this.p.y + this.p.h); ctx.stroke();
      const d = new Date(Date.UTC(2026, 8, 1) + i * 4 * 3600e3);
      text(ctx, `${d.getUTCDate()} ${['Sep', 'Oct'][d.getUTCMonth() - 8] || ''} ${String(d.getUTCHours()).padStart(2, '0')}:00`, x, this.p.y + this.p.h + 30,
        { size: 21, weight: 500, fam: MONO, color: 'rgba(200,190,235,0.4)' });
    }
    ctx.restore();
  }
  header(ctx, last, o = {}) {
    const { x, y, w } = this.r, cy = y + 48;
    ctx.save();
    ctx.beginPath(); ctx.arc(x + 52, cy, 22, 0, Math.PI * 2); ctx.fillStyle = '#f7931a'; ctx.fill();
    text(ctx, '₿', x + 52, cy + 1, { size: 28, weight: 800, color: '#fff' });
    text(ctx, this.sym, x + 88, cy, { size: 32, weight: 700, color: '#fff', align: 'left' });
    let bx = x + 88 + measure(ctx, this.sym, 32, 700) + 26;
    (o.tfs || ['1H', '4H', '1D']).forEach(tf => {
      const on = tf === this.tf, tw = measure(ctx, tf, 24, 700, MONO) + 26;
      if (on) { rrect(ctx, bx, cy - 20, tw, 40, 10); ctx.fillStyle = o.tfFlash ? `rgba(168,85,247,${0.35 + o.tfFlash * 0.65})` : 'rgba(168,85,247,0.35)'; ctx.fill(); }
      text(ctx, tf, bx + tw / 2, cy + 1, { size: 24, weight: 700, fam: MONO, color: on ? '#fff' : C.axis });
      bx += tw + 8;
    });
    if (last) {
      const col = last.c >= last.o ? C.up : C.down; let lx = x + w - 28;
      [['C', last.c], ['L', last.l], ['H', last.h], ['O', last.o]].forEach(([k, val]) => {
        const s = fmt(val, this.dec); const sw = measure(ctx, s, 22, 600, MONO);
        text(ctx, s, lx, cy, { size: 22, weight: 600, fam: MONO, color: col, align: 'right' }); lx -= sw + 6;
        text(ctx, k, lx, cy, { size: 22, weight: 600, fam: MONO, color: C.axis, align: 'right' }); lx -= 30;
      });
    }
    ctx.restore();
  }
  candle(ctx, i, q, alpha = 1, glow = 0) {
    const x = this.X(i), w = Math.max(2, this.cw() * 0.68), col = q.c >= q.o ? C.up : C.down;
    const yo = this.Y(q.o), yc = this.Y(q.c), yh = this.Y(q.h), yl = this.Y(q.l);
    ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(2, w * 0.12);
    if (glow) { ctx.shadowColor = col; ctx.shadowBlur = glow; }
    ctx.beginPath(); ctx.moveTo(x, yh); ctx.lineTo(x, yl); ctx.stroke();
    ctx.fillRect(x - w / 2, Math.min(yo, yc), w, Math.max(2, Math.abs(yc - yo)));
    ctx.restore();
  }
  // reveal: number of candles visible (float -> last one forming)
  draw(ctx, o = {}) {
    const { reveal = this.c.length, dim = 0, header = true, frame = true, highlight = null, lastTag = true, alpha = 1 } = o;
    ctx.save(); ctx.globalAlpha *= alpha;
    if (frame) this.frame(ctx);
    this.grid(ctx);
    this._drawn = FRAME;
    if (this._pf === FRAME) { const q = this._pend; this._pend = []; q.forEach(f => f()); }
    const n = Math.min(this.c.length, Math.floor(reveal)), f = reveal - Math.floor(reveal);
    let last = null;
    this.clip(ctx, () => {
      const a = Math.max(0, Math.floor(this.v.i0) - 1), b = Math.min(n, Math.ceil(this.v.i1) + 1);
      for (let i = a; i < b; i++) {
        const hl = highlight && highlight(i);
        this.candle(ctx, i, this.c[i], hl ? 1 : 1 - dim * 0.78, hl ? 25 : 0);
      }
      last = this.c[n - 1];
      if (n < this.c.length && f > 0.02) { last = formCandle(this.c[n], f); this.candle(ctx, n, last, 1, 18); }
    });
    if (header) this.header(ctx, last, o);
    if (last && lastTag) {
      const y = this.Y(last.c), col = last.c >= last.o ? C.up : C.down, bx = this.p.x + this.p.w;
      if (y > this.p.y && y < this.p.y + this.p.h) {
        ctx.save(); ctx.setLineDash([6, 8]); ctx.strokeStyle = col; ctx.globalAlpha *= 0.6; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(this.p.x, y); ctx.lineTo(bx, y); ctx.stroke(); ctx.restore();
        ctx.save(); rrect(ctx, bx + 4, y - 20, 136, 40, 6); ctx.fillStyle = col; ctx.fill(); ctx.restore();
        text(ctx, fmt(last.c, this.dec), bx + 72, y + 1, { size: 23, weight: 700, fam: MONO, color: '#fff' });
      }
    }
    ctx.restore();
    return last;
  }
  // ---- annotations (chart space) ----
  _defer(fn) { // called before draw() this frame -> run under the candles, after the panel is painted
    if (this._drawn === FRAME) return false;
    if (this._pf !== FRAME) { this._pend = []; this._pf = FRAME; }
    this._pend.push(fn); return true;
  }
  hline(ctx, p, i0, i1, o = {}) {
    if (this._defer(() => this.hline(ctx, p, i0, i1, o))) return;
    const { color = C.purple2, width = 4, dash = null, progress = 1, glow = 16, alpha = 1 } = o;
    if (progress <= 0) return;
    const x0 = this.X(i0), x1 = lerp(x0, this.X(i1), E.outCubic(clamp(progress))), y = this.Y(p);
    this.clip(ctx, () => {
      ctx.save(); ctx.globalAlpha *= alpha; if (dash) ctx.setLineDash(dash); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = color; ctx.shadowBlur = glow;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
    });
  }
  zone(ctx, p0, p1, i0, i1, o = {}) {
    if (this._defer(() => this.zone(ctx, p0, p1, i0, i1, o))) return;
    const { color = C.purple, progress = 1, alpha = 0.22, label = null } = o; if (progress <= 0) return;
    const x0 = this.X(i0), x1 = lerp(x0, this.X(i1), E.outCubic(clamp(progress))), y0 = this.Y(Math.max(p0, p1)), y1 = this.Y(Math.min(p0, p1));
    this.clip(ctx, () => {
      ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.globalAlpha /= alpha;
      ctx.globalAlpha *= 0.9; ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0); ctx.restore();
      if (label) text(ctx, label, Math.max(x0, this.p.x) + 18, (y0 + y1) / 2, { size: 28, weight: 800, color, align: 'left', alpha: clamp(progress * 2) });
    });
  }
  zigzag(ctx, pts, progress, o = {}) {
    const { color = C.purple2, width = 6, dots = true } = o; if (progress <= 0) return;
    const xy = pts.map(([i, p]) => [this.X(i), this.Y(p)]);
    let total = 0; const L = [0]; for (let k = 1; k < xy.length; k++) { total += Math.hypot(xy[k][0] - xy[k - 1][0], xy[k][1] - xy[k - 1][1]); L.push(total); }
    const lim = total * clamp(progress);
    this.clip(ctx, () => {
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.moveTo(...xy[0]);
      for (let k = 1; k < xy.length; k++) {
        if (L[k] <= lim) ctx.lineTo(...xy[k]);
        else { const t = (lim - L[k - 1]) / (L[k] - L[k - 1]); ctx.lineTo(lerp(xy[k - 1][0], xy[k][0], t), lerp(xy[k - 1][1], xy[k][1], t)); break; }
      }
      ctx.stroke();
      if (dots) for (let k = 0; k < xy.length; k++) if (L[k] <= lim) {
        ctx.beginPath(); ctx.arc(xy[k][0], xy[k][1], 9, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = 4; ctx.stroke();
      }
      ctx.restore();
    });
  }
  tag(ctx, i, p, s, p01, o = {}) {
    const { color = C.purple, above = true, off = 52, size = 30 } = o; if (p01 <= 0) return;
    const x = this.X(i), y = this.Y(p) + (above ? -off : off);
    popT(ctx, x, y, p01, () => pill(ctx, s, x, y, { size, color, fam: /[A-Za-z]/.test(s) && !isHeb(s) ? FONT : FONT, weight: 900 }));
  }
  dot(ctx, i, p, p01, color = C.purple2, r = 13) {
    if (p01 <= 0) return; const x = this.X(i), y = this.Y(p);
    popT(ctx, x, y, p01, () => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 30; ctx.fill(); ctx.restore(); });
  }
}

// ---------- shared assets / background ----------
const A = { logo: null, noise: [], vign: null, rain: [] };
async function loadAssets() {
  await Promise.all([800, 900, 500, 700].map(w => document.fonts.load(`${w} 40px "${FONT}"`, 'אבגד abc')));
  await document.fonts.load(`700 40px "${MONO}"`, '0123');
  A.logo = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.src = '../assets/logo.jpg'; });
  for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas'); c.width = c.height = 360; const g = c.getContext('2d'), d = g.createImageData(360, 360), r = rng(99 + k);
    for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); A.noise.push(c);
  }
  const v = document.createElement('canvas'); v.width = W; v.height = H; const g = v.getContext('2d');
  const rg = g.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.72); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.72)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H); A.vign = v;
  const r = rng(5);
  for (let k = 0; k < 46; k++) A.rain.push({ x: r() * W, sp: 60 + r() * 220, len: 80 + r() * 380, ph: r() * 4000, w: r() > 0.85 ? 2.5 : 1.3, teal: r() > 0.8, digits: r() > 0.55 });
}
function drawBG(ctx, t, o = {}) {
  const { rain = 1, glow = 1, hue = 0 } = o;
  ctx.fillStyle = C.bg0; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 50, W / 2, H * 0.45, H * 0.75);
  const pulse = 0.85 + 0.15 * Math.sin(t * 1.3);
  g.addColorStop(0, `rgba(${90 + hue},40,200,${0.42 * glow * pulse})`); g.addColorStop(0.45, `rgba(50,18,120,${0.22 * glow})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (rain > 0) {
    ctx.save();
    for (const d of A.rain) {
      const y = ((d.ph + t * d.sp) % (H + d.len)) - d.len;
      const lg = ctx.createLinearGradient(0, y, 0, y + d.len); const col = d.teal ? '46,230,200' : '180,120,255';
      lg.addColorStop(0, `rgba(${col},0)`); lg.addColorStop(1, `rgba(${col},${0.32 * rain})`);
      ctx.fillStyle = lg; ctx.fillRect(d.x, y, d.w, d.len);
      if (d.digits) { ctx.globalAlpha = 0.28 * rain; ctx.font = `500 15px "${MONO}"`; ctx.fillStyle = `rgb(${col})`;
        for (let k = 0; k < 4; k++) ctx.fillText(String(Math.floor(hash(d.ph + k + Math.floor(t * 6)) * 10)), d.x + 6, y + d.len * (0.3 + k * 0.17)); ctx.globalAlpha = 1; }
    }
    ctx.restore();
  }
}
function drawLogo(ctx, cx, cy, size, alpha = 1, crop = 'full') {
  if (!A.logo) return;
  const im = A.logo; ctx.save(); ctx.globalAlpha *= alpha; ctx.globalCompositeOperation = 'screen';
  if (crop === 'mark') { const sx = 250, sy = 300, sw = 490, sh = 310; ctx.drawImage(im, sx, sy, sw, sh, cx - size / 2, cy - size * sh / sw / 2, size, size * sh / sw); }
  else ctx.drawImage(im, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
}

// ---------- captions ----------
function buildCaptions(tl, spec) {
  const chunks = [];
  for (const s of tl.segments) {
    let cur = [];
    const flush = () => { if (cur.length) chunks.push({ seg: s.id, words: cur }); cur = []; };
    s.words.forEach((w, k) => {
      const raw = w.w, dm = spec.display || {}, disp = dm[raw.replace(/[.,:?!]/g, '')] ?? dm[raw] ?? dm[raw.replace(/[.,:?!]+$/, '')] ?? raw;
      cur.push({ ...w, d: disp });
      const len = cur.reduce((a, x) => a + x.d.length, 0);
      if (/[.,:?!]$/.test(raw) || cur.length >= 3 || len > 15) flush();
    });
    flush();
  }
  chunks.forEach((c, k) => { c.t0 = c.words[0].t0 - 0.05; c.t1 = k + 1 < chunks.length ? Math.min(chunks[k + 1].words[0].t0 - 0.05, c.words[c.words.length - 1].t1 + 0.6) : c.words[c.words.length - 1].t1 + 0.6; });
  return chunks;
}
function drawCaptions(ctx, t, chunks, spec, o = {}) {
  const c = chunks.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const { y = 1455, size = 76 } = o, p = (t - c.t0) / 0.16;
  const clean = s => s.replace(/[.,:!]$/g, '').replace(/^["']|["']$/g, '');
  const ws = c.words.map(w => ({ ...w, s: clean(w.d) })).filter(w => w.s);
  if (!ws.length) return;
  // runs of consecutive Latin words read left-to-right inside the RTL line: reverse each run
  for (let i = 0; i < ws.length;) {
    if (isHeb(ws[i].s)) { i++; continue; }
    let j = i; while (j < ws.length && !isHeb(ws[j].s)) j++;
    const run = ws.slice(i, j).reverse(); ws.splice(i, j - i, ...run); i = j;
  }
  const gap = size * 0.38, widths = ws.map(w => measure(ctx, w.s, size, 900));
  const pad = widths.map(w => w * 0.05); // room for the active word's scale-up
  const total = widths.reduce((a, b) => a + b, 0) + pad.reduce((a, b) => a + b, 0) * 2 + gap * (ws.length - 1);
  const sc = Math.min(1, 980 / total);
  ctx.save(); ctx.translate(W / 2, y); const s0 = lerp(0.82, 1, E.outBack(clamp(p))); ctx.scale(sc * s0, sc * s0); ctx.globalAlpha = clamp(p * 2.5);
  let x = total / 2; // rtl: start at right
  ws.forEach((w, k) => {
    x -= pad[k];
    const cx = x - widths[k] / 2, active = t >= w.t0 - 0.03, now = t >= w.t0 - 0.03 && t < w.t1 + 0.05;
    const key = (spec.keywords || []).some(kw => w.s.includes(kw)) || /[A-Za-z]/.test(w.s);
    const green = (spec.green || []).some(kw => w.s.includes(kw)), red = (spec.red || []).some(kw => w.s.includes(kw));
    let col = green ? '#3df2a6' : red ? '#ff5a72' : key ? C.purple2 : '#ffffff';
    const sc2 = now ? 1.08 : 1;
    ctx.save(); ctx.translate(cx, 0); ctx.scale(sc2, sc2);
    if (now && !green && !red && !key) col = C.gold;
    text(ctx, w.s, 0, 0, { size, weight: 900, color: active ? col : 'rgba(255,255,255,0.45)', stroke: 14, strokeColor: 'rgba(5,0,15,0.9)', glow: now ? 28 : 0, glowColor: col });
    ctx.restore();
    x -= widths[k] + pad[k] + gap;
  });
  ctx.restore();
}

// ---------- chapters (long format) ----------
// spec.chapters = [{seg: 'ch1', he: 'title'}...]; chapter 0 = everything before the first card
function chapterSpans() {
  const segs = R.tl.segments, ch = (R.spec.chapters || []).map(c => ({ ...c, t0: (segs.find(s => s.id === c.seg) || {}).t0 })).filter(c => c.t0 !== undefined);
  const out = [{ seg: segs[0].id, he: R.spec.hookTitle || 'פתיחה', t0: 0 }, ...ch];
  out.forEach((c, k) => { c.t1 = k + 1 < out.length ? out[k + 1].t0 : R.tl.duration; c.n = k; });
  return out;
}
function chapterBar(ctx, t, segId) {
  const sp = R.chap || (R.chap = chapterSpans()), gap = 8, n = sp.length, bw = (W - gap * (n - 1)) / n;
  sp.forEach((c, k) => { // rtl: chapter 0 at the right
    const x = W - (k + 1) * bw - k * gap, f = clamp((t - c.t0) / (c.t1 - c.t0));
    ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(x, 0, bw, 9);
    if (f > 0) { const g = ctx.createLinearGradient(x + bw, 0, x, 0); g.addColorStop(0, C.violet); g.addColorStop(1, C.neon); ctx.fillStyle = g; ctx.fillRect(x + bw * (1 - f), 0, bw * f, 9); }
  });
  const cur = sp.filter(c => t >= c.t0).pop();
  if (!cur || cur.n === 0 || segId === 'cta' || segId === cur.seg) return;
  const a = clamp((t - cur.t0 - 2.2) / 0.4) * 0.85; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  text(ctx, `פרק ${cur.n} · ${cur.he}`, W - 34, 46, { size: 30, weight: 800, color: C.neon, align: 'right', stroke: 8, strokeColor: 'rgba(5,0,15,0.85)' });
  ctx.restore();
}

// ---------- timeline / runtime ----------
let FRAME = 0; // bumps per scene render; lets charts defer annotations drawn before the chart body
const R = { tl: null, spec: null, scenes: null, caps: [], offA: null, offB: null, events: [] };
function segLocal(seg, t) {
  const words = seg.words;
  return {
    t, lt: t - seg.t0, d: seg.t1 - seg.t0, seg,
    // local time of the n-th word containing `needle` (0-based occurrence)
    cue(needle, occ = 0, edge = 't0') {
      let n = 0; for (const w of words) if (w.w.includes(needle)) { if (n++ === occ) return w[edge] - seg.t0; }
      console.warn('cue miss', seg.id, needle); return 0;
    },
  };
}
function sceneOf(id) { return R.scenes[id] || { draw(ctx, s) { drawBG(ctx, s.t); text(ctx, id, W / 2, H / 2, { size: 80 }); } }; }
function impactsFor(seg) {
  const sc = sceneOf(seg.id); if (!sc.events) return [];
  return sc.events(segLocal(seg, seg.t0)).map(e => ({ ...e, t: seg.t0 + e.lt }));
}
function renderScene(ctx, seg, t) {
  FRAME++;
  const s = segLocal(seg, t), sc = sceneOf(seg.id);
  // camera punch & shake from impacts
  let k = 1, sx = 0, sy = 0;
  for (const e of seg._ev) {
    if (e.type !== 'impact' || t < e.t) continue; const dt = t - e.t, st = e.k ?? 1;
    k += 0.045 * st * Math.exp(-dt * 9);
    sx += Math.sin(dt * 80 + e.t) * 14 * st * Math.exp(-dt * 12); sy += Math.cos(dt * 70) * 10 * st * Math.exp(-dt * 12);
  }
  ctx.save(); ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
  sc.draw(ctx, s);
  ctx.restore();
}
function composite(ctx, src, o = {}) {
  const { x = 0, y = 0, s = 1, a = 1, blur = 0, rot = 0 } = o; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; if (blur > 0.5) ctx.filter = `blur(${blur}px)`;
  ctx.translate(W / 2 + x, H / 2 + y); ctx.rotate(rot); ctx.scale(s, s); ctx.drawImage(src, -W / 2, -H / 2); ctx.restore();
}
const TR_IN = 0.2, TR_OUT = 0.24;
function renderAt(t) {
  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  const segs = R.tl.segments;
  let idx = segs.findIndex(s => t < s.t1); if (idx < 0) idx = segs.length - 1;
  // transition window?
  let tr = null;
  for (let k = 1; k < segs.length; k++) {
    const T = segs[k].t0, type = sceneOf(segs[k].id).trans || 'whip';
    if (type !== 'none' && t >= T - TR_IN && t < T + TR_OUT) tr = { k, T, type, p: (t - (T - TR_IN)) / (TR_IN + TR_OUT) };
  }
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (!tr) renderScene(ctx, segs[idx], t);
  else {
    const a = R.offA.getContext('2d'), b = R.offB.getContext('2d');
    renderScene(a, segs[tr.k - 1], Math.min(t, segs[tr.k].t0 - 1e-3)); renderScene(b, segs[tr.k], Math.max(t, segs[tr.k].t0));
    const p = tr.p, e = E.inOut(p);
    if (tr.type === 'whip') {
      const v = Math.sin(p * Math.PI); // velocity
      for (let j = 0; j < 5; j++) {
        const o = (j - 2) * 38 * v;
        composite(ctx, R.offA, { x: -W * e + o, a: (j === 2 ? 1 : 0.28) * (1 - e * 0.3), blur: 6 * v });
        composite(ctx, R.offB, { x: W * (1 - e) + o, a: j === 2 ? 1 : 0.28, blur: 6 * v });
      }
    } else if (tr.type === 'zoom') {
      if (p < 0.5) composite(ctx, R.offA, { s: 1 + E.inCubic(p * 2) * 0.9, blur: 22 * p * 2, a: 1 });
      else composite(ctx, R.offB, { s: 0.55 + 0.45 * E.outCubic((p - 0.5) * 2), blur: 22 * (1 - (p - 0.5) * 2), a: 1 });
      const f = Math.max(0, 1 - Math.abs(p - 0.5) * 6); if (f > 0) { ctx.fillStyle = `rgba(230,200,255,${f * 0.7})`; ctx.fillRect(0, 0, W, H); }
    } else if (tr.type === 'glitch') {
      const src = p < 0.45 ? R.offA : R.offB; composite(ctx, src, {});
      const amt = Math.sin(p * Math.PI), r = rng(Math.floor(t * 60) + 3);
      for (let j = 0; j < 9; j++) {
        const y = r() * H, h = 20 + r() * 140, dx = (r() - 0.5) * 160 * amt;
        ctx.drawImage(src, 0, y, W, h, dx, y, W, h);
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 * amt;
      ctx.drawImage(src, 14 * amt, 0); ctx.globalAlpha = 0.18 * amt; ctx.drawImage(src, -14 * amt, 0); ctx.restore();
      const f = Math.max(0, 1 - Math.abs(p - 0.45) * 7); if (f > 0) { ctx.fillStyle = `rgba(190,120,255,${f * 0.45})`; ctx.fillRect(0, 0, W, H); }
    } else { // flash
      composite(ctx, p < 0.5 ? R.offA : R.offB, { s: p < 0.5 ? 1 + p * 0.1 : 1.05 - (p - 0.5) * 0.1 });
      const f = Math.max(0, 1 - Math.abs(p - 0.5) * 3.2); ctx.fillStyle = `rgba(255,245,255,${f * 0.85})`; ctx.fillRect(0, 0, W, H);
    }
  }
  // ---- overlay layer ----
  const sc = sceneOf(segs[idx].id);
  if (sc.captions !== false) drawCaptions(ctx, t, R.caps, R.spec, sc.capStyle || {});
  // watermark + progress
  if (segs[idx].id !== 'cta') drawLogo(ctx, W / 2, 168, 210, 0.9, 'mark');
  chapterBar(ctx, t, segs[idx].id);
  if (R.tl.preview) text(ctx, 'PREVIEW · ללא קול', W / 2, 1800, { size: 26, weight: 700, color: 'rgba(255,255,255,0.35)' });
  // film look
  ctx.drawImage(A.vign, 0, 0);
  ctx.globalAlpha = 0.035; ctx.fillStyle = ctx.createPattern(A.noise[Math.floor(t * 24) % 4], 'repeat'); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  ctx.restore();
}
async function setup(tl, spec) {
  R.tl = tl; R.spec = spec; R.scenes = window.SCENES; R.chap = null;
  R.offA = document.createElement('canvas'); R.offB = document.createElement('canvas');
  R.offA.width = R.offB.width = W; R.offA.height = R.offB.height = H;
  await loadAssets();
  R.caps = buildCaptions(tl, spec);
  R.events = [];
  tl.segments.forEach((s, k) => {
    s._ev = impactsFor(s); R.events.push(...s._ev);
    if (k > 0 && (sceneOf(s.id).trans || 'whip') !== 'none') R.events.push({ t: s.t0 - 0.16, type: 'whoosh' });
  });
  if (window.SETUP) window.SETUP(tl);
  return { duration: tl.duration, events: R.events.map(({ t, type, k }) => ({ t, type, k })) };
}
window.VIDEO = { setup, renderAt };

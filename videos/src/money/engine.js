// "כל האמת על הכסף שלכם": a 2026-style reel engine, separate from the ALTRIX TradingView look.
// Graded real footage (Mixkit, free licence), kinetic type, karaoke captions, transitions,
// gold-on-black brand and a creator profile end card. Every reveal hangs on a voice timestamp.
'use strict';
const W = 1080, H = 1920, FPS = 30;
const C = {
  bg: '#060606', ink: '#0a0a0a', white: '#f7f4ee', dim: 'rgba(247,244,238,.62)',
  gold: '#f5c451', gold2: '#ffe29a', goldD: '#b98a2e', red: '#ff3d3d', green: '#36e28f', blue: '#2f8cff', ig: '#0095f6',
};
const HEB = 'Rubik', SERIF = 'Frank Ruhl Libre';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, a, b) => clamp((t - a) / Math.max(1e-6, b - a));
const E = {
  lin: x => x, in: x => x * x * x, out: x => 1 - Math.pow(1 - x, 3), inOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  expo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  back: x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
  elastic: x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * 2.094) + 1,
};
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function kf(t, frames, ease = E.inOut) { // [[t,v],...]
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) if (t <= frames[i][0]) {
    const [t0, v0] = frames[i - 1], [t1, v1] = frames[i];
    return lerp(v0, v1, ease((t - t0) / (t1 - t0)));
  }
  return frames[frames.length - 1][1];
}
const isHeb = s => /[֐-׿]/.test(s);
const R = { imgs: {}, cache: new Map(), missing: [], hits: [], tl: null, spec: null, scenes: {}, segs: [] };

// ---------- canvases ----------
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const CV = { a: mk(), b: mk(), tmp: mk(), small: mk(90, 160), grain: [] };

// ---------- assets ----------
function loadImg(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(src); i.src = src; }); }
async function loadAssets() {
  R.imgs.eliran = await loadImg('../../assets/money/eliran.jpg');
  for (let k = 0; k < 4; k++) { // film grain tiles
    const g = mk(360, 640), x = g.getContext('2d'), d = x.createImageData(360, 640), r = rng(7 + k);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - .5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); CV.grain.push(g);
  }
  await document.fonts.load(`900 40px "${HEB}"`); await document.fonts.load(`700 40px "${HEB}"`);
  await document.fonts.load(`900 40px "${SERIF}"`); await document.fonts.load(`900 40px "Heebo"`);
}
// footage frames are loaded lazily; a draw that needs a missing frame records it and the frame is redrawn
function frameImg(id, n) {
  const key = `${id}/${String(n).padStart(4, '0')}`;
  const c = R.cache.get(key);
  if (c) { R.cache.delete(key); R.cache.set(key, c); return c; }
  R.missing.push(key); return null;
}
async function fetchMissing() {
  const keys = [...new Set(R.missing)]; R.missing = [];
  await Promise.all(keys.map(async k => { try { R.cache.set(k, await loadImg(`../../build/footage/${k}.jpg`)); } catch (e) { console.warn('missing ' + k); R.cache.set(k, null); } }));
  while (R.cache.size > 140) R.cache.delete(R.cache.keys().next().value);
}

// ---------- drawing primitives ----------
function font(size, w = 900, fam = HEB) { return `${w} ${size}px "${fam}"`; }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function txt(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = font(o.size || 80, o.w || 900, o.fam || HEB);
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.direction = isHeb(s) ? 'rtl' : 'ltr';
  if (o.ls) ctx.letterSpacing = o.ls + 'px';
  ctx.globalAlpha *= o.a ?? 1;
  if (o.shadow !== false) { ctx.shadowColor = o.shadowColor || 'rgba(0,0,0,.65)'; ctx.shadowBlur = o.blur ?? 24; ctx.shadowOffsetY = o.sy ?? 6; }
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowR || 40; ctx.shadowOffsetY = 0; }
  if (o.stroke) { ctx.lineWidth = o.lw || 4; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  if (o.color !== 'none') { ctx.fillStyle = o.color || C.white; ctx.fillText(s, x, y); }
  ctx.restore();
}
function tw(ctx, s, size, w = 900, fam = HEB) { ctx.save(); ctx.font = font(size, w, fam); const m = ctx.measureText(s).width; ctx.restore(); return m; }
function fitSize(ctx, s, size, maxW, w = 900, fam = HEB) { const m = tw(ctx, s, size, w, fam); return m > maxW ? size * maxW / m : size; }
// kinetic headline: styles rise | mask | pop | blur | stamp | type
function kt(ctx, s, x, y, p, o = {}) {
  if (p <= 0) return;
  const st = o.style || 'rise', size = o.max ? fitSize(ctx, s, o.size || 120, o.max, o.w, o.fam) : (o.size || 120);
  const q = clamp(p);
  ctx.save();
  if (st === 'rise') {
    const e = E.expo(q); ctx.beginPath(); ctx.rect(0, y - size * .75, W, size * 1.5); ctx.clip();
    txt(ctx, s, x, y + (1 - e) * size * 1.1, { ...o, size });
  } else if (st === 'mask') { // a bar sweeps right->left, then retracts and leaves the text behind it
    const m = tw(ctx, s, size, o.w, o.fam), x0 = (o.align === 'right' ? x - m : o.align === 'left' ? x : x - m / 2);
    const a = E.inOut(clamp(q * 1.7)), b = E.inOut(clamp(q * 1.7 - .7));
    if (b > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x0 + m * (1 - b) - 20, y - size, m * b + 40, size * 2); ctx.clip(); txt(ctx, s, x, y, { ...o, size }); ctx.restore(); }
    if (a > b) { ctx.fillStyle = o.bar || C.gold; ctx.fillRect(x0 + m * (1 - a) - 10, y - size * .55, m * (a - b) + 20, size * 1.1); }
  } else if (st === 'pop') {
    const e = E.back(q); ctx.translate(x, y); ctx.scale(lerp(.4, 1, e), lerp(.4, 1, e)); ctx.globalAlpha *= clamp(q * 3);
    txt(ctx, s, 0, 0, { ...o, size });
  } else if (st === 'stamp') {
    const e = E.out(q); ctx.translate(x, y); const k = lerp(2.4, 1, e); ctx.scale(k, k); ctx.rotate((o.rot || 0) * (1 - e) + (o.tilt || 0));
    ctx.globalAlpha *= clamp(q * 4); txt(ctx, s, 0, 0, { ...o, size });
  } else if (st === 'blur') {
    const e = E.out(q); ctx.globalAlpha *= e; ctx.filter = `blur(${(1 - e) * 18}px)`; ctx.translate(x, y); ctx.scale(lerp(1.25, 1, e), lerp(1.25, 1, e));
    txt(ctx, s, 0, 0, { ...o, size, shadow: false }); ctx.filter = 'none';
  } else if (st === 'type') {
    const n = Math.round(s.length * q); txt(ctx, s.slice(0, n), x, y, { ...o, size });
  }
  ctx.restore();
}
function pill(ctx, s, x, y, o = {}) {
  const size = o.size || 40, m = tw(ctx, s, size, o.w || 700), pw = m + size * 1.3, ph = size * 1.7;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.translate(x, y); if (o.k) ctx.scale(o.k, o.k);
  rr(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2);
  ctx.fillStyle = o.bg || 'rgba(255,255,255,.1)'; ctx.fill();
  if (o.border !== false) { ctx.lineWidth = 2; ctx.strokeStyle = o.border || 'rgba(255,255,255,.22)'; ctx.stroke(); }
  txt(ctx, s, 0, 2, { size, w: o.w || 700, color: o.color || C.white, shadow: false });
  ctx.restore(); return pw;
}
function glass(ctx, x, y, w, h, r = 36, o = {}) {
  ctx.save(); rr(ctx, x, y, w, h, r);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  ctx.fillStyle = o.fill || 'rgba(16,14,12,.72)'; ctx.fill(); ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, o.edge || 'rgba(255,226,154,.55)'); g.addColorStop(.5, 'rgba(255,255,255,.06)'); g.addColorStop(1, o.edge2 || 'rgba(255,226,154,.25)');
  ctx.lineWidth = 2.5; ctx.strokeStyle = g; ctx.stroke(); ctx.restore();
}
function ringFx(ctx, x, y, r, p, color = C.gold, lw = 6) {
  if (p <= 0 || p >= 1) return; ctx.save(); ctx.globalAlpha = (1 - p) * .9; ctx.lineWidth = lw * (1 - p) + 1; ctx.strokeStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r * E.out(p), 0, 7); ctx.stroke(); ctx.restore();
}
function sparks(ctx, x, y, p, o = {}) {
  if (p <= 0 || p >= 1) return; const r = rng(o.seed || 3), n = o.n || 22;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = r() * 6.283, d = (o.dist || 220) * (.4 + r() * .8) * E.out(p), s = (o.size || 7) * (1 - p) * (.5 + r());
    ctx.fillStyle = i % 3 ? (o.color || C.gold) : C.gold2; ctx.globalAlpha = 1 - p;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d - p * 40, s, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function dust(ctx, t, o = {}) { // floating gold dust, like the profile photo
  const r = rng(o.seed || 11), n = o.n || 60; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, sp = 10 + r() * 40, ph = r() * 6.28, s = .8 + r() * 2.6;
    const x = (x0 + Math.sin(t * .4 + ph) * 30) % W, y = ((y0 - t * sp) % H + H) % H;
    ctx.globalAlpha = (o.a ?? .8) * (.3 + .7 * Math.abs(Math.sin(t * 1.3 + ph)));
    ctx.fillStyle = i % 4 ? C.gold : C.gold2; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function leak(ctx, t, a = .5, seed = 1) { // drifting warm light leak
  if (a <= 0) return; const r = rng(seed); ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 2; i++) {
    const x = W * (r() + .25 * Math.sin(t * .35 + i * 2)), y = H * (r() * .8 + .1 + .1 * Math.cos(t * .3 + i));
    const g = ctx.createRadialGradient(x, y, 0, x, y, 700 + 200 * i);
    g.addColorStop(0, `rgba(255,${150 + 40 * i},60,${a * .55})`); g.addColorStop(.5, `rgba(255,90,30,${a * .18})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
function shade(ctx, o = {}) { // readability gradients top+bottom
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgba(0,0,0,${o.top ?? .55})`); g.addColorStop(.22, 'rgba(0,0,0,0)');
  g.addColorStop(.5, `rgba(0,0,0,${o.mid ?? 0})`);
  g.addColorStop(.62, 'rgba(0,0,0,.05)'); g.addColorStop(1, `rgba(0,0,0,${o.bot ?? .78})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function blackBG(ctx, t, o = {}) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, 1100);
  g.addColorStop(0, o.glow || 'rgba(120,86,24,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (o.dust !== false) dust(ctx, t, { a: o.dustA ?? .6 });
}
// footage: draw clip `id` at local time lt; o: {rate, from, zoom:[a,b], x,y,w,h, r (corner), a, blur, bw, dur(for zoom), px}
function clip(ctx, id, lt, o = {}) {
  const n = (window.FOOTAGE || {})[id]; if (!n) { ctx.fillStyle = '#222'; ctx.fillRect(o.x || 0, o.y || 0, o.w || W, o.h || H); return; }
  let f = Math.floor(((o.from || 0) + Math.max(0, lt) * (o.rate ?? 1)) * FPS);
  const cyc = 2 * (n - 1); f = f % cyc; if (f >= n) f = cyc - f; // ping-pong when the scene outlasts the clip
  const im = frameImg(id, f + 1); if (!im) return;
  const x = o.x ?? 0, y = o.y ?? 0, w = o.w ?? W, h = o.h ?? H;
  const z = o.zoom ? lerp(o.zoom[0], o.zoom[1], E.inOut(clamp(lt / (o.dur || 6)))) : 1.04;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  rr(ctx, x, y, w, h, o.r || 0); ctx.clip();
  const sc = Math.max(w / 720, h / 1280) * z, dw = 720 * sc, dh = 1280 * sc;
  const px = (o.px || 0) * (dw - w) / 2, py = (o.py || 0) * (dh - h) / 2;
  if (o.blur) { const s = CV.small, sx = s.getContext('2d'); sx.drawImage(im, 0, 0, 90, 160); ctx.drawImage(s, x + (w - dw) / 2 + px, y + (h - dh) / 2 + py, dw, dh); }
  else ctx.drawImage(im, x + (w - dw) / 2 + px, y + (h - dh) / 2 + py, dw, dh);
  if (o.bw) { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(0,0,0,${o.bw})`; ctx.fillRect(x, y, w, h); ctx.globalCompositeOperation = 'source-over'; }
  if (o.dark) { ctx.fillStyle = `rgba(0,0,0,${o.dark})`; ctx.fillRect(x, y, w, h); }
  if (o.tint) { ctx.globalCompositeOperation = 'color'; ctx.fillStyle = o.tint; ctx.fillRect(x, y, w, h); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  if (o.r && o.border !== false) { ctx.save(); rr(ctx, x, y, w, h, o.r); ctx.lineWidth = 3; ctx.strokeStyle = o.border || 'rgba(255,226,154,.6)'; ctx.globalAlpha *= o.a ?? 1; ctx.stroke(); ctx.restore(); }
}
// card that flies in with a fake 3D tilt
function card(ctx, p, x, y, w, h, fn, o = {}) {
  if (p <= 0) return; const e = (o.ease || E.back)(clamp(p));
  ctx.save(); ctx.translate(x + w / 2, y + h / 2);
  const tilt = (1 - e) * (o.tilt ?? .5);
  ctx.transform(1, (o.dir || 1) * tilt * .25, 0, 1, 0, 0); ctx.scale(lerp(o.from ?? .6, 1, e), lerp(o.from ?? .6, 1, e));
  ctx.rotate((o.rot || 0) * (1 - e)); ctx.globalAlpha *= clamp(p * 3);
  ctx.translate(-w / 2, -h / 2); fn(ctx, w, h); ctx.restore();
}
function avatar(ctx, x, y, r, o = {}) { // circular crop of the owner's portrait (ring centre 450,787 r~378 in the source)
  const im = R.imgs.eliran; ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  const k = r / 372; ctx.drawImage(im, x - 450 * k, y - 787 * k, 900 * k, 1600 * k); ctx.restore();
  if (o.ring !== false) {
    ctx.save(); ctx.lineWidth = o.lw || Math.max(3, r * .05);
    const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, C.gold2); g.addColorStop(.5, C.goldD); g.addColorStop(1, C.gold);
    ctx.strokeStyle = g; ctx.shadowColor = C.gold; ctx.shadowBlur = o.glow ?? 30; ctx.beginPath(); ctx.arc(x, y, r + ctx.lineWidth / 2, 0, 7); ctx.stroke(); ctx.restore();
  }
}
function verified(ctx, x, y, s = 30) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = C.blue; ctx.beginPath();
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr2 = i % 2 ? s * .82 : s; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = s * .18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-s * .38, 0); ctx.lineTo(-s * .1, s * .3); ctx.lineTo(s * .42, -s * .3); ctx.stroke(); ctx.restore();
}
function hand(ctx, x, y, press = 0, s = 1) { // tapping finger
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - press * .12), s * (1 - press * .12)); ctx.rotate(-.25);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; ctx.fillStyle = '#f2d2b6'; ctx.strokeStyle = '#7a5640'; ctx.lineWidth = 3;
  rr(ctx, -16, 0, 32, 90, 16); ctx.fill(); ctx.stroke();
  rr(ctx, -30, 60, 74, 110, 30); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; rr(ctx, -9, 6, 18, 20, 8); ctx.fill(); ctx.restore();
}
function counter(ctx, v, x, y, o = {}) { const s = (o.fmt || (n => Math.round(n).toLocaleString('en-US')))(v); txt(ctx, (o.pre || '') + s + (o.post || ''), x, y, o); }
function strike(ctx, x0, x1, y, p, color = C.red, lw = 12) {
  if (p <= 0) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.shadowColor = color; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, E.out(p)), y + (x1 - x0) * -.04 * E.out(p)); ctx.stroke(); ctx.restore();
}
function icon(ctx, name, x, y, s, color = C.white, a = 1) { // tiny vector icons
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.globalAlpha *= a;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const P = (pts, close) => { ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); if (close) ctx.closePath(); };
  if (name === 'clock') { ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.stroke(); P([[0, -28], [0, 0], [20, 12]]); ctx.stroke(); }
  else if (name === 'lock') { rr(ctx, -34, -6, 68, 54, 10); ctx.fill(); ctx.beginPath(); ctx.arc(0, -10, 24, Math.PI, 0); ctx.stroke(); }
  else if (name === 'send') { P([[-44, -4], [44, -40], [10, 44], [0, 8]], true); ctx.stroke(); P([[0, 8], [44, -40]]); ctx.stroke(); }
  else if (name === 'play') { P([[-24, -34], [36, 0], [-24, 34]], true); ctx.fill(); }
  else if (name === 'check') { P([[-34, 0], [-8, 26], [38, -28]]); ctx.lineWidth = 14; ctx.stroke(); }
  else if (name === 'x') { ctx.lineWidth = 14; P([[-30, -30], [30, 30]]); ctx.stroke(); P([[30, -30], [-30, 30]]); ctx.stroke(); }
  else if (name === 'bulb') { ctx.beginPath(); ctx.arc(0, -12, 32, .75 * Math.PI, .25 * Math.PI); ctx.stroke(); P([[-16, 28], [16, 28]]); ctx.stroke(); P([[-12, 42], [12, 42]]); ctx.stroke(); }
  else if (name === 'user') { ctx.beginPath(); ctx.arc(0, -18, 20, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(0, 40, 38, Math.PI, 0); ctx.fill(); }
  ctx.restore();
}

// ---------- captions (karaoke, word by word) ----------
function cleanWord(w) { return w.replace(/[.,:;!…"]+$/g, '').replace(/^["]+/, ''); }
function buildCaptions(tl, spec) {
  const out = [], disp = spec.display || {};
  for (const seg of tl.segments) {
    let cur = [];
    const flush = () => { if (cur.length) out.push({ seg: seg.id, words: cur }); cur = []; };
    seg.words.forEach((w, i) => {
      let shown = disp[w.w] ?? disp[cleanWord(w.w)];
      if (shown === undefined) shown = cleanWord(w.w);
      const word = { raw: w.w, s: shown, t0: w.t0, t1: w.t1, hl: (spec.hl || []).includes(w.w) || (spec.hl || []).includes(cleanWord(w.w)), red: (spec.red || []).includes(w.w) || (spec.red || []).includes(cleanWord(w.w)) };
      if (shown) cur.push(word);
      const len = cur.reduce((a, b) => a + b.s.length + 1, 0);
      if (/[.?!:]$/.test(w.w) || (/[,]$/.test(w.w) && cur.length >= 2) || cur.length >= 3 || len > 15) flush();
    });
    flush();
  }
  out.forEach(c => { c.t0 = c.words[0].t0; });
  out.forEach((c, i) => { const nx = out[i + 1]; c.t1 = nx ? Math.min(nx.t0, c.words[c.words.length - 1].t1 + .6) : c.words[c.words.length - 1].t1 + .8; });
  return out;
}
function drawCaptions(ctx, t, o = {}) {
  const ch = R.caps.find(c => t >= c.t0 - .02 && t < c.t1); if (!ch) return;
  const y = o.y ?? 1300, size = o.size ?? 86, gap = size * .5;
  ctx.save(); ctx.font = font(size, 900);
  const ws = ch.words.map(w => ({ ...w, m: ctx.measureText(w.s).width }));
  let total = ws.reduce((a, w) => a + w.m, 0) + gap * (ws.length - 1);
  const k = total > 900 ? 900 / total : 1; total *= k;
  let x = (o.x ?? W / 2) + total / 2; // first word on the right (RTL); a run of latin words keeps LTR order
  const order = []; let i = 0;
  while (i < ws.length) { if (!isHeb(ws[i].s)) { let j = i; while (j + 1 < ws.length && !isHeb(ws[j + 1].s)) j++; for (let q = j; q >= i; q--) order.push(ws[q]); i = j + 1; } else order.push(ws[i++]); }
  // latin runs were pushed reversed so that, laid right->left, they read left->right
  for (const w of order) {
    const cx = x - w.m * k / 2; x -= w.m * k + gap * k;
    if (t < w.t0 - .04) continue;
    const ap = E.back(prog(t, w.t0 - .04, w.t0 + .14)), active = t >= w.t0 - .04 && t < w.t1 + .08;
    ctx.save(); ctx.translate(cx, y + (1 - ap) * 30); const sc = k * lerp(.7, 1, ap) * (active ? 1.06 : 1); ctx.scale(sc, sc);
    ctx.globalAlpha = clamp(ap * 2);
    if (active) { // gold block behind the spoken word
      const pad = size * .2; rr(ctx, -w.m / 2 - pad, -size * .62, w.m + pad * 2, size * 1.24, size * .22);
      ctx.fillStyle = w.red ? C.red : C.gold; ctx.shadowColor = w.red ? 'rgba(255,61,61,.6)' : 'rgba(245,196,81,.6)'; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0;
      txt(ctx, w.s, 0, 3, { size, color: C.ink, shadow: false });
    } else {
      txt(ctx, w.s, 0, 3, { size, color: w.hl ? C.gold : w.red ? '#ff6b6b' : C.white, stroke: 'rgba(0,0,0,.85)', lw: 12, blur: 18, sy: 4 });
    }
    ctx.restore();
  }
  ctx.restore();
}

// ---------- chrome: series chip, progress, grain, vignette ----------
function chrome(ctx, t) {
  const sp = R.spec, d = R.tl.duration, a = 1 - prog(t, d - 4.2, d - 3.6);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a * E.out(prog(t, .15, .7));
    const y = 205; glass(ctx, 70, y - 46, 940, 92, 46, { fill: 'rgba(8,8,8,.55)' });
    avatar(ctx, 960, y, 34, { lw: 3, glow: 8 });
    txt(ctx, 'כל האמת על הכסף שלכם', 900, y + 2, { size: 38, w: 800, align: 'right', shadow: false });
    // episode dots 1..4 (left side)
    for (let i = 0; i < 4; i++) {
      const x = 120 + i * 46, on = i + 1 === sp.part;
      ctx.beginPath(); ctx.roundRect(x - (on ? 20 : 8), y - 8, on ? 40 : 16, 16, 8);
      ctx.fillStyle = on ? C.gold : i + 1 < sp.part ? 'rgba(245,196,81,.55)' : 'rgba(255,255,255,.25)'; ctx.fill();
    }
    txt(ctx, `חלק ${sp.part}/4`, 355, y + 2, { size: 32, w: 700, color: C.gold, shadow: false });
    // thin progress line under the chip
    const p = clamp(t / (d - 3)); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(110, y + 62, 860, 5);
    ctx.fillStyle = C.gold; ctx.fillRect(970 - 860 * p, y + 62, 860 * p, 5);
    ctx.restore();
  }
}
function grainVignette(ctx, t) {
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .1;
  ctx.drawImage(CV.grain[Math.floor(t * FPS) % 4], 0, 0, W, H); ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ---------- scenes, transitions, camera ----------
function segLocal(seg, t) {
  const words = seg.words, lt = t - seg.t0;
  return {
    t, lt, d: seg.t1 - seg.t0, seg, words, id: seg.id,
    cue(word, n = 1) { let k = 0; for (const w of words) if (w.w.includes(word) && ++k === n) return w.t0 - seg.t0; console.warn(`cue miss ${seg.id}:${word}`); return 0; },
    end(word, n = 1) { let k = 0; for (const w of words) if (w.w.includes(word) && ++k === n) return w.t1 - seg.t0; return 0; },
    w(i) { return words[Math.max(0, Math.min(words.length - 1, i < 0 ? words.length + i : i))].t0 - seg.t0; },
    p(a, b) { return prog(lt, a, b); },
  };
}
function scene(id) { return R.scenes[id] || { draw(ctx, s) { blackBG(ctx, s.t); txt(ctx, id, W / 2, H / 2, { size: 90 }); } }; }
function renderSeg(ctx, i, t) {
  const seg = R.segs[i], s = segLocal(seg, t), sc = scene(seg.id);
  ctx.save(); ctx.clearRect(0, 0, W, H); sc.draw(ctx, s); ctx.restore();
}
const TD = { cut: .001, zoom: .42, whip: .4, flash: .36, iris: .5, split: .5, glitch: .32, flip: .5, push: .45, blur: .5 };
function transition(ctx, type, p, A, B) {
  const e = E.inOut(p);
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (type === 'zoom') { // zoom-blur punch through
    for (let k = 0; k < 5; k++) {
      const z1 = 1 + e * (.6 + k * .08), z2 = 1.5 - .5 * e + k * .03 * (1 - e);
      ctx.globalAlpha = (1 - e) * (k ? .18 : 1); ctx.setTransform(z1, 0, 0, z1, W / 2 * (1 - z1), H / 2 * (1 - z1)); ctx.drawImage(A, 0, 0);
      ctx.globalAlpha = e * (k ? .18 : 1); ctx.setTransform(z2, 0, 0, z2, W / 2 * (1 - z2), H / 2 * (1 - z2)); ctx.drawImage(B, 0, 0);
    }
  } else if (type === 'whip') {
    const dx = -e * W * 1.05;
    for (let k = 0; k < 6; k++) { const o = k * 34 * Math.sin(p * Math.PI); ctx.globalAlpha = k ? .16 : 1; ctx.drawImage(A, dx - o, 0); ctx.drawImage(B, dx + W * 1.05 - o, 0); }
  } else if (type === 'push') { // vertical push, like a feed swipe
    const dy = -e * H; ctx.drawImage(A, 0, dy * .6); ctx.globalAlpha = 1; ctx.save(); ctx.translate(0, dy + H); ctx.drawImage(B, 0, 0); ctx.restore();
    ctx.globalAlpha = .35 * Math.sin(p * Math.PI); ctx.fillStyle = C.gold; ctx.fillRect(0, dy + H - 6, W, 12);
  } else if (type === 'flash') {
    ctx.drawImage(p < .5 ? A : B, 0, 0); ctx.globalAlpha = Math.sin(p * Math.PI); ctx.fillStyle = '#fff6df'; ctx.fillRect(0, 0, W, H);
  } else if (type === 'iris') {
    ctx.drawImage(A, 0, 0); ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H * .46, 1200 * e, 0, 7); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    ctx.globalAlpha = 1 - e; ctx.lineWidth = 14; ctx.strokeStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 40; ctx.beginPath(); ctx.arc(W / 2, H * .46, 1200 * e, 0, 7); ctx.stroke();
  } else if (type === 'split') { // three vertical shutters slide in alternately
    ctx.drawImage(A, 0, 0);
    for (let k = 0; k < 3; k++) {
      const q = E.inOut(clamp(p * 1.6 - k * .3)), x = k * W / 3, dir = k % 2 ? 1 : -1;
      ctx.save(); ctx.beginPath(); ctx.rect(x, 0, W / 3 + 1, H); ctx.clip(); ctx.translate(0, dir * (1 - q) * H); ctx.drawImage(B, 0, 0); ctx.restore();
    }
  } else if (type === 'glitch') {
    const src = p < .5 ? A : B; ctx.drawImage(src, 0, 0); const r = rng(Math.floor(p * 12) + 5), amt = Math.sin(p * Math.PI);
    for (let k = 0; k < 14; k++) { const y = r() * H, h = 20 + r() * 140, dx = (r() - .5) * 220 * amt; ctx.drawImage(r() < .5 ? A : B, 0, y, W, h, dx, y, W, h); }
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .5 * amt; ctx.fillStyle = 'rgba(255,0,60,.35)'; ctx.fillRect(0, 0, W, H);
  } else if (type === 'flip') {
    const half = p < .5, sx = Math.abs(Math.cos(p * Math.PI)), img = half ? A : B;
    ctx.translate(W / 2, H / 2); ctx.transform(sx, (half ? 1 : -1) * (1 - sx) * .18, 0, 1, 0, 0); ctx.drawImage(img, -W / 2, -H / 2);
  } else if (type === 'blur') { // soft dissolve through defocus
    const s = CV.small.getContext('2d'); s.drawImage(p < .5 ? A : B, 0, 0, 90, 160);
    ctx.drawImage(A, 0, 0); ctx.globalAlpha = e; ctx.drawImage(B, 0, 0);
    ctx.globalAlpha = Math.sin(p * Math.PI) * .9; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(CV.small, 0, 0, W, H);
  } else { ctx.drawImage(p < .5 ? A : B, 0, 0); }
  ctx.restore();
}
function camera(t) { // punch + shake from hits
  let z = 1, sx = 0, sy = 0, rot = 0;
  for (const h of R.hits) {
    const d = t - h.t; if (d < 0 || d > .5) continue; const k = h.k ?? 1, f = Math.exp(-d * 9);
    z += .07 * k * f; sx += Math.sin(d * 90) * 16 * k * f; sy += Math.cos(d * 77) * 12 * k * f; rot += Math.sin(d * 50) * .006 * k * f;
  }
  return { z, sx, sy, rot };
}
function rgbSplit(ctx, src, amt) {
  if (amt < .5) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .5;
  const t = CV.tmp.getContext('2d');
  for (const [col, dx] of [['#ff0040', amt], ['#00e5ff', -amt]]) {
    t.save(); t.globalCompositeOperation = 'copy'; t.drawImage(src, 0, 0); t.globalCompositeOperation = 'multiply'; t.fillStyle = col; t.fillRect(0, 0, W, H); t.restore();
    ctx.drawImage(CV.tmp, dx, 0);
  }
  ctx.restore();
}

async function renderAt(t) {
  for (let pass = 0; pass < 4; pass++) {
    draw(t);
    if (!R.missing.length) return;
    await fetchMissing();
  }
}
function draw(t) {
  R.missing = [];
  const ctx = document.getElementById('c').getContext('2d'), segs = R.segs;
  let i = segs.findIndex(s => t >= s.t0 && t < s.t1); if (i < 0) i = t < segs[0].t0 ? 0 : segs.length - 1;
  const A = CV.a, B = CV.b, ax = A.getContext('2d'), bx = B.getContext('2d');
  // transition window around the start of segment j: [t0 - .4*d, t0 + .6*d]
  let tr = null;
  for (const j of [i, i + 1]) {
    if (j <= 0 || j >= segs.length) continue; const type = scene(segs[j].id).trans || 'cut', d = TD[type] ?? .4;
    const a = segs[j].t0 - d * .4, b = segs[j].t0 + d * .6; if (t >= a && t < b && type !== 'cut') tr = { j, type, p: (t - a) / (b - a) };
  }
  let frame = A;
  if (tr) { renderSeg(ax, tr.j - 1, t); renderSeg(bx, tr.j, t); const f = CV.tmp.getContext('2d'); transition(f, tr.type, tr.p, A, B); ax.drawImage(CV.tmp, 0, 0); }
  else renderSeg(ax, i, t);
  const cam = camera(t);
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2 + cam.sx, H / 2 + cam.sy); ctx.rotate(cam.rot); ctx.scale(cam.z, cam.z); ctx.translate(-W / 2, -H / 2);
  ctx.drawImage(frame, 0, 0); ctx.restore();
  const hitAmt = R.hits.reduce((a, h) => { const d = t - h.t; return d >= 0 && d < .25 ? Math.max(a, (1 - d / .25) * 14 * (h.k ?? 1)) : a; }, 0);
  if (hitAmt) rgbSplit(ctx, frame, hitAmt);
  const sc = scene(segs[i].id);
  if (sc.caps !== false && !(tr && scene(segs[tr.j].id).caps === false && tr.p > .5)) drawCaptions(ctx, t, sc.capStyle || {});
  chrome(ctx, t);
  grainVignette(ctx, t);
}

async function setup(tl, spec) {
  R.tl = tl; R.spec = spec; R.scenes = window.SCENES; R.segs = tl.segments;
  await loadAssets();
  R.caps = buildCaptions(tl, spec);
  if (window.SETUP) window.SETUP(tl, spec);
  // events -> absolute time; hits feed the camera; transitions add whooshes
  const ev = [];
  R.segs.forEach((seg, i) => {
    const sc = scene(seg.id), s = segLocal(seg, seg.t0);
    if (i > 0 && sc.trans && sc.trans !== 'cut') ev.push({ t: seg.t0 - (TD[sc.trans] ?? .4) * .4, type: { flash: 'swoosh', glitch: 'glitch2', iris: 'whoosh2', blur: 'swoosh' }[sc.trans] || 'whoosh' });
    for (const e of (sc.events ? sc.events(s) : [])) {
      const at = seg.t0 + e.lt; ev.push({ t: at, type: e.type, k: e.k ?? 1 });
      if (e.hit || e.type === 'impact' || e.type === 'impact2' || e.type === 'deep') R.hits.push({ t: at, k: e.k ?? 1 });
    }
  });
  const music = [];
  R.segs.forEach(seg => { const sc = scene(seg.id), s = segLocal(seg, seg.t0); for (const m of (sc.music ? sc.music(s) : [])) music.push({ ...m, t: seg.t0 + (m.lt || 0) }); });
  return { duration: tl.duration, events: ev.sort((a, b) => a.t - b.t), music };
}
window.VIDEO = { setup, renderAt };

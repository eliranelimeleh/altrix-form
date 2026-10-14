// L8 — Price Action pillars, part 3/3: INVALIDATION + CONTEXT, then all four as one checklist
'use strict';
// ---------- local helpers ----------
function flashCol(ctx, lt, t, col = '255,40,70', a = 0.25) { const f = Math.max(0, 1 - (lt - t) / 0.3); if (lt >= t && f > 0) { ctx.fillStyle = `rgba(${col},${a * f})`; ctx.fillRect(0, 0, W, H); } }
function hit(ctx, x, y, lt, t, col = C.gold, r = 220) { ring(ctx, x, y, r, prog(lt, t, t + 0.6), col); burst(ctx, x, y, prog(lt, t, t + 0.9), col, 26, Math.floor(t * 10) + 3, r * 1.1); }
// candles from a list of closes (open = previous close), deterministic wicks
function seqC(o0, closes, seed = 1, wk = 0.28) {
  const r = rng(seed); let o = o0;
  return closes.map(c => { const b = Math.abs(c - o) + 0.25, q = { o, c, h: Math.max(o, c) + r() * b * wk, l: Math.min(o, c) - r() * b * wk }; o = c; return q; });
}
const cp = cs => cs.map(q => ({ ...q }));
// the engine header always paints a ₿ badge: repaint it as a stock / index badge
function symIcon(ctx, ch, letter, col = '#2962ff', alpha = 1) {
  const x = ch.r.x + 52, y = ch.r.y + 48;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  text(ctx, letter, x, y + 1, { size: 24, weight: 800, fam: MONO, color: '#fff', alpha });
}
function ghostCandle(ctx, ch, i, q, a = 1) {
  if (a <= 0) return;
  const x = ch.X(i), w = ch.cw() * 0.68, yo = ch.Y(q.o), yc = ch.Y(q.c), col = q.c >= q.o ? C.up : C.down;
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([7, 6]); ctx.shadowColor = col; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.moveTo(x, ch.Y(q.h)); ctx.lineTo(x, Math.min(yo, yc)); ctx.moveTo(x, Math.max(yo, yc)); ctx.lineTo(x, ch.Y(q.l)); ctx.stroke();
  ctx.fillStyle = 'rgba(242,54,69,0.28)'; ctx.fillRect(x - w / 2, Math.min(yo, yc), w, Math.abs(yc - yo)); ctx.strokeRect(x - w / 2, Math.min(yo, yc), w, Math.abs(yc - yo)); ctx.restore();
}
// tiny candle strip inside a card
function miniCandles(ctx, cs, x, y, w, h, a = 1) {
  let lo = Infinity, hi = -Infinity; cs.forEach(q => { lo = Math.min(lo, q.l); hi = Math.max(hi, q.h); });
  const n = cs.length, cw = w / n, Y = p => y + (1 - (p - lo) / (hi - lo)) * h;
  ctx.save(); ctx.globalAlpha *= a;
  cs.forEach((q, i) => { const cx = x + (i + 0.5) * cw, col = q.c >= q.o ? C.up : C.down; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, Y(q.h)); ctx.lineTo(cx, Y(q.l)); ctx.stroke(); ctx.fillRect(cx - cw * 0.32, Math.min(Y(q.o), Y(q.c)), cw * 0.64, Math.max(2, Math.abs(Y(q.o) - Y(q.c)))); });
  ctx.restore();
}
// polyline from normalised points [[0..1, 0..1]] in a box
function spark(ctx, pts, x, y, w, h, col, p = 1, width = 6) {
  if (p <= 0) return;
  const xy = pts.map(([u, v]) => [x + u * w, y + (1 - v) * h]);
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.rect(x - 10, y - 20, w * p + 20, h + 40); ctx.clip();
  ctx.beginPath(); xy.forEach(([a, b], k) => k ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.stroke(); ctx.restore();
}
// small icon per pillar: 0 map, 1 confirmation, 2 invalidation, 3 context
const PCOL = [C.gold, '#3df2a6', '#ff5a72', C.teal];
function pillarIcon(ctx, k, x, y, s = 1, a = 1) {
  const col = PCOL[k]; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 16;
  if (k === 0) { [-26, 0, 26].forEach((dy, j) => { ctx.globalAlpha = a * (j === 1 ? 1 : 0.55); ctx.beginPath(); ctx.moveTo(-42, dy); ctx.lineTo(42, dy); ctx.stroke(); }); }
  if (k === 1) { ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(0, 46); ctx.stroke(); ctx.fillRect(-16, -28, 32, 56); }
  if (k === 2) { ctx.beginPath(); ctx.moveTo(-44, 12); ctx.lineTo(44, 12); ctx.stroke(); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-14, -34); ctx.lineTo(14, -6); ctx.moveTo(14, -34); ctx.lineTo(-14, -6); ctx.stroke(); }
  if (k === 3) { ctx.beginPath(); ctx.moveTo(-44, 26); ctx.lineTo(-18, -4); ctx.lineTo(4, 12); ctx.lineTo(42, -32); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.globalAlpha = a * 0.5; ctx.stroke(); }
  ctx.restore();
}
// hebrew label (right) + mono value (left) row
function monoRow(ctx, y, he, val, p, o = {}) {
  if (p <= 0) return;
  const { col = '#fff', vcol = '#fff', size = 44, vsize = 50, xr = 920, xl = 160 } = o;
  ctx.save(); ctx.globalAlpha *= clamp(p * 2); const dx = (1 - E.outCubic(p)) * 40;
  text(ctx, he, xr + dx, y, { size, weight: 800, color: col, align: 'right' });
  text(ctx, val, xl - dx, y, { size: vsize, weight: 800, fam: MONO, color: vcol, align: 'left' });
  ctx.restore();
}
function bubble(ctx, s, x, y, p, col = '#3b2a63') {
  popT(ctx, x, y, p, () => {
    const w = measure(ctx, s, 40, 800) + 60, h = 84;
    ctx.save(); rrect(ctx, x - w / 2, y - h / 2, w, h, 40); ctx.fillStyle = 'rgba(30,20,60,0.92)'; ctx.shadowColor = C.purple; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = C.purple2; ctx.stroke();
    [[w / 2 - 40, h / 2 + 18, 12], [w / 2 - 20, h / 2 + 44, 7]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    ctx.restore(); text(ctx, s, x, y + 2, { size: 40, weight: 800, color: '#fff' });
  });
}

// ---------- data ----------
// reclaim on a daily stock chart: support 48 (touch at 10), lost 19-22, reclaimed by the confirmation candle 23 (close 50.00)
const LV = 48, ENT = 50, TGT = 56;
const RCG = genCandles([[0, 52.0], [5, 55.6], [10, 48.1], [15, 52.6], [21, 47.1], [26, 52.2], [29, 50.6], [44, 58.8]], { seed: 21, noise: 0.14 });
const RCC = override(RCG, {
  20: { o: RCG[19].c, h: 48.15, l: 47.3, c: 47.85 },
  21: { o: 47.85, h: 48.05, l: 47.1, c: 47.45 },
  22: { o: 47.45, h: 47.95, l: 47.25, c: 47.7 },
  23: { o: 47.7, h: 50.25, l: 47.6, c: 50.0 },
});
const chRC = new Chart(RCC, { sym: 'XYZ', tf: '1D', dec: 2 });
// the same trade failing: first close below 48 at 28, add at 30 (45.40), bleed to ~41
const FLC = cp(RCC.slice(0, 25)).concat(seqC(RCC[24].c, [50.9, 50.2, 49.0, 47.4, 46.2, 45.4, 46.0, 45.1, 44.0, 43.2, 43.6, 42.4, 41.6, 41.0, 41.3, 40.6], 9));
const chFL = new Chart(FLC, { sym: 'XYZ', tf: '1D', dec: 2 });
const ADD = FLC[30].c;
const pnlAt = rev => { const n = Math.min(FLC.length - 1, Math.max(0, Math.floor(rev) - (rev % 1 < 0.02 ? 1 : 0))), c = FLC[n].c; return 50 * (c - ENT) + (rev >= 31 ? 50 * (c - ADD) : 0); };
// wick vs close through 48 (both at candle 23)
const WKG = genCandles([[0, 52.4], [6, 55.2], [11, 48.2], [17, 52.2], [22, 49.3], [23, 46.7], [32, 55.0]], { seed: 5, noise: 0.14 });
const WKC = override(WKG, { 21: { o: WKG[20].c, h: 49.9, l: 49.3, c: 49.75 }, 22: { o: 49.75, h: 49.85, l: 49.2, c: 49.43 }, 23: { o: 49.43, h: 49.6, l: 46.7, c: 48.75 }, 24: { o: 48.75, h: 49.9, l: 48.55, c: 49.7 } });
const chWK = new Chart(WKC, { sym: 'XYZ', tf: '1D', dec: 2 });
const CLC = cp(WKC.slice(0, 23)).concat([{ o: 49.43, h: 49.6, l: 46.85, c: 47.05 }], seqC(47.05, [46.6, 46.9, 45.8, 45.2, 44.6, 44.9, 43.8, 43.1, 42.5], 4));
const chCL = new Chart(CLC, { sym: 'XYZ', tf: '1D', dec: 2 });
// clean stock long (entry 23) run over when the index rolls over (26)
const SXG = genCandles([[0, 29.5], [6, 33.4], [11, 31.0], [17, 34.4], [21, 32.6], [25, 34.6], [34, 27.4]], { seed: 41, noise: 0.13 });
const SXC = override(SXG, { 22: { o: SXG[21].c, h: 33.75, l: 32.55, c: 33.65 }, 26: { o: SXG[25].c, h: SXG[25].c + 0.1, l: 31.7, c: 31.85 }, 27: { o: 31.85, h: 32.1, l: 30.6, c: 30.8 } });
const chSX = new Chart(SXC, { sym: 'XYZ', tf: '1D', dec: 2 });
const IXG = genCandles([[0, 5600], [6, 5760], [10, 5700], [16, 5850], [20, 5785], [24, 5835], [34, 5440]], { seed: 13, noise: 0.13 });
const IXC = override(IXG, { 26: { o: IXG[25].c, h: IXG[25].c + 6, l: 5730, c: 5738 } });
const chIX = new Chart(IXC, { sym: 'SPX', tf: '1D' });
// index in a clean uptrend (check #1)
const SPC = genCandles([[0, 5200], [8, 5450], [12, 5380], [20, 5620], [24, 5560], [33, 5810]], { seed: 19, noise: 0.14 });
const chSP = new Chart(SPC, { sym: 'SPX', tf: '1D' });
// 5 green days in a row (16-20) vs 3-week base (9-23) + breakout (24)
const EXG = genCandles([[0, 40.0], [5, 41.6], [9, 40.2], [13, 41.3], [15, 40.6], [24, 41.4]], { seed: 3, noise: 0.15 });
const EXC = override(EXG, { 16: { o: EXG[15].c, h: 42.3, l: 40.55, c: 42.1 }, 17: { o: 42.1, h: 43.8, l: 42.0, c: 43.6 }, 18: { o: 43.6, h: 45.4, l: 43.5, c: 45.2 }, 19: { o: 45.2, h: 47.1, l: 45.1, c: 46.9 }, 20: { o: 46.9, h: 48.8, l: 46.8, c: 48.6 } });
const chEX = new Chart(EXC, { sym: 'XYZ', tf: '1D', dec: 2 });
const BSG = genCandles([[0, 36.2], [8, 40.5], [11, 38.5], [15, 40.5], [19, 38.4], [23, 40.3], [30, 44]], { seed: 8, noise: 0.15 });
const BSC = override(BSG, { 24: { o: BSG[23].c, h: 42.0, l: BSG[23].c - 0.1, c: 41.8 } });
const chBS = new Chart(BSC, { sym: 'XYZ', tf: '1D', dec: 2 });
// 1-minute noise: a wiggle every candle
const NZC = (() => { const r = rng(77), cl = []; for (let i = 0; i < 64; i++) cl.push(50 + 0.55 * Math.sin(i * 0.95) + 0.35 * Math.sin(i * 2.4 + 1) + (r() - 0.5) * 0.35 - i * 0.012); return seqC(50, cl, 12, 0.5); })();
const chNZ = new Chart(NZC, { sym: 'XYZ', tf: '1m', dec: 2 });
const NZX = []; for (let i = 2; i < NZC.length - 1; i++) { if (NZC[i].c > NZC[i - 1].c && NZC[i].c > NZC[i + 1].c) NZX.push([i, 1]); if (NZC[i].c < NZC[i - 1].c && NZC[i].c < NZC[i + 1].c) NZX.push([i, -1]); }

const PIL = [
  { he: 'המפה', en: 'MAP', q: 'איפה הרמות שכבר הוכיחו את עצמן?' },
  { he: 'האישור', en: 'CONFIRMATION', q: 'מה המחיר צריך לעשות ברמה?' },
  { he: 'הביטול', en: 'INVALIDATION', q: 'איפה אני טועה? מחליטים לפני הכניסה' },
  { he: 'ההקשר', en: 'CONTEXT', q: 'מה השוק הכללי עושה?' },
];
// the 4-pillar checklist board. act = active card; tT/tQ = its title/question cue; done = cards shown as checked
function board(ctx, lt, act, tT, tQ, o = {}) {
  const { checks = [], hi = -1 } = o;
  PIL.forEach((pl, k) => {
    const y0 = 410 + k * 232, hh = 214, col = PCOL[k];
    if (k > act) { ctx.save(); ctx.globalAlpha = 0.35; rrect(ctx, 70, y0, 940, hh, 30); ctx.setLineDash([12, 10]); ctx.strokeStyle = 'rgba(200,160,255,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      text(ctx, String(k + 1), 950, y0 + hh / 2, { size: 48, weight: 800, fam: MONO, color: 'rgba(200,160,255,0.35)' }); return; }
    const cur = k === act, p = cur ? prog(lt, tT - 0.05, tT + 0.4) : 1; if (p <= 0) return;
    const e = E.outBack(p), on = cur || k === hi;
    ctx.save(); ctx.globalAlpha = clamp(p * 2) * (on || checks[k] !== undefined ? 1 : 0.6); ctx.translate(W / 2, y0 + hh / 2); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); ctx.translate(-W / 2, -(y0 + hh / 2));
    glass(ctx, 70, y0, 940, hh, 30, { border: on ? col : 'rgba(190,140,255,0.3)', glowColor: on ? col : 'rgba(140,70,255,0.3)', glow: on ? 45 : 20 });
    ctx.beginPath(); ctx.arc(950, y0 + 64, 32, 0, Math.PI * 2); ctx.fillStyle = on ? col : 'rgba(124,58,237,0.6)'; ctx.fill();
    text(ctx, String(k + 1), 950, y0 + 66, { size: 38, weight: 900, fam: MONO, color: on ? '#140a00' : '#fff' });
    text(ctx, pl.he, 892, y0 + 64, { size: 58, weight: 900, align: 'right', color: '#fff' });
    text(ctx, pl.en, 892 - measure(ctx, pl.he, 58, 900) - 24, y0 + 68, { size: 24, weight: 800, align: 'right', color: col, spacing: 3 });
    const pq = cur ? prog(lt, tQ - 0.05, tQ + 0.4) : 1;
    if (o.q && o.q[k]) o.q[k](y0, pq); else wipeText(ctx, pl.q, 892, y0 + 140, pq, { size: 36, weight: 700, align: 'right', color: '#e8e0ff' });
    pillarIcon(ctx, k, 170, y0 + hh / 2, 0.95);
    ctx.restore();
    if (checks[k] !== undefined) check(ctx, 268, y0 + 64, 26, prog(lt, checks[k], checks[k] + 0.3));
  });
}
// four-card recap (smaller than recapDraw's three)
function recap4(ctx, s, title, cards) {
  const { lt } = s;
  drawBG(ctx, s.t, { glow: 1.2 });
  wipeText(ctx, title, W / 2, 330, prog(lt, 0, 0.35), { size: 62, weight: 900, color: C.purple2 });
  cards.forEach(([h, sub, t0], k) => {
    const p = prog(lt, t0 - 0.05, t0 + 0.4), y = 430 + k * 245, e = E.outBack(p), col = PCOL[k];
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate((1 - e) * -500, 0);
    glass(ctx, 80, y, 920, 215, 32, { border: col, glowColor: col, glow: 35 });
    ctx.beginPath(); ctx.arc(925, y + 107, 40, 0, Math.PI * 2); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 25; ctx.fill(); ctx.shadowBlur = 0;
    text(ctx, String(k + 1), 925, y + 110, { size: 46, weight: 900, fam: MONO, color: '#140a00' });
    text(ctx, h, 860, y + 78, { size: 66, weight: 900, color: '#fff', align: 'right' });
    text(ctx, sub, 860, y + 152, { size: 46, weight: 800, color: col, align: 'right' });
    pillarIcon(ctx, k, 200, y + 107, 1.1);
    ctx.restore();
  });
}
const SPARK = {
  trend: [[0, 0.15], [0.18, 0.35], [0.3, 0.28], [0.5, 0.55], [0.62, 0.48], [0.82, 0.75], [1, 0.88]],
  ext: [[0, 0.08], [0.4, 0.15], [0.58, 0.26], [0.72, 0.45], [0.85, 0.7], [1, 0.97]],
  chop: [[0, 0.5], [0.14, 0.75], [0.28, 0.3], [0.43, 0.68], [0.57, 0.28], [0.72, 0.72], [0.86, 0.35], [1, 0.55]],
};

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('נגדך'), type: 'pop' }, { lt: s.cue('משא'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFL, vs = s.cue('נגדך'), neg = s.cue('משא'), inst = s.cue('ובמקום');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 32], [d, 14, 34]], { p: [44.5, 55] });
      ch.hline(ctx, ENT, 23, 34, { color: 'rgba(255,255,255,0.8)', width: 3, dash: [10, 8] });
      ch.hline(ctx, LV, 23, 34, { color: C.down, width: 4 });
      const rev = kf(lt, [[0, 24.6], [vs, 27.3], [d, 28.55]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === 23 });
      symIcon(ctx, ch, 'X');
      popT(ctx, ch.X(31), ch.Y(ENT) - 30, prog(lt, 0.2, 0.5), () => pill(ctx, 'LONG 50.00', ch.X(31), ch.Y(ENT) - 30, { size: 26, color: '#0b8f63', fam: MONO }));
      popT(ctx, ch.X(31), ch.Y(LV) + 32, prog(lt, 0.4, 0.7), () => pill(ctx, 'STOP 48.00', ch.X(31), ch.Y(LV) + 32, { size: 26, color: '#d61f45', fam: MONO }));
      const pn = pnlAt(rev);
      popT(ctx, W / 2, 1270, prog(lt, vs - 0.2, vs + 0.2), () => { glass(ctx, W / 2 - 200, 1225, 400, 90, 45, { border: '#ff5a72', glowColor: C.down });
        text(ctx, 'P&L', W / 2 + 110, 1271, { size: 30, weight: 800, color: C.axis }); text(ctx, (pn < 0 ? '-$' : '+$') + fmt(Math.abs(Math.round(pn))), W / 2 - 40, 1271, { size: 44, weight: 800, fam: MONO, color: pn < 0 ? '#ff5a72' : '#3df2a6' }); });
      wipeText(ctx, 'אתה בעסקה', W / 2, 300, prog(lt, 0.1, 0.45) * (1 - prog(lt, vs - 0.2, vs)), { size: 76, weight: 900 });
      wipeText(ctx, 'והיא הולכת נגדך', W / 2, 300, prog(lt, vs - 0.05, vs + 0.3) * (1 - prog(lt, inst - 0.2, inst)), { size: 76, weight: 900, color: '#ff5a72' });
      wipeText(ctx, 'משא ומתן עם עצמך', W / 2, 300, prog(lt, inst, inst + 0.35), { size: 72, weight: 900, color: C.gold });
      if (lt > neg) [[300, 640, '?'], [520, 560, '?!'], [780, 650, '...']].forEach(([x, y, q], k) => bubble(ctx, q, x, y, prog(lt, neg + k * 0.15, neg + k * 0.15 + 0.35)));
    },
  },
  hook2: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('יחזור'), type: 'pop' }, { lt: s.cue('רעש'), type: 'pop' }, { lt: s.cue('מזיז'), type: 'whoosh' }, { lt: s.cue('מוסיף'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFL, back = s.cue('יחזור'), nz = s.cue('רעש'), mv = s.cue('מזיז'), add = s.cue('מוסיף');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 34], [d, 16, 36]], { p: [42.5, 55] });
      const sp = kf(lt, [[mv - 0.1, LV], [mv + 0.7, 44.5]])[0];
      ch.hline(ctx, ENT, 23, 36, { color: 'rgba(255,255,255,0.8)', width: 3, dash: [10, 8] });
      if (lt > mv - 0.1) ch.hline(ctx, LV, 23, 36, { color: 'rgba(255,90,114,0.35)', width: 3, dash: [8, 8] });
      ch.hline(ctx, sp, 23, 36, { color: C.down, width: 4 });
      const rev = kf(lt, [[0, 28.55], [mv, 29.9], [add, 30.97], [d, 31.4]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      symIcon(ctx, ch, 'X');
      pill(ctx, 'LONG 50.00', ch.X(32), ch.Y(ENT) - 30, { size: 26, color: '#0b8f63', fam: MONO });
      pill(ctx, 'STOP ' + sp.toFixed(2), ch.X(32), ch.Y(sp) + 32, { size: 26, color: '#d61f45', fam: MONO });
      if (lt > mv) arrow(ctx, ch.X(34.5), ch.Y(LV), ch.X(34.5), ch.Y(sp) - 6, prog(lt, mv, mv + 0.5), { color: '#ff5a72', width: 6, head: 22 });
      if (lt > add) { ch.hline(ctx, ADD, 30, 36, { color: '#3df2a6', width: 3, dash: [10, 8], progress: prog(lt, add, add + 0.4) });
        popT(ctx, ch.X(26), ch.Y(ADD), prog(lt, add, add + 0.3), () => pill(ctx, 'BUY +50', ch.X(26), ch.Y(ADD), { size: 28, color: '#0b8f63', fam: MONO })); hit(ctx, ch.X(30), ch.Y(ADD), lt, add, '#3df2a6', 160); }
      bubble(ctx, 'אולי זה יחזור', 330, 560, prog(lt, back - 0.3, back + 0.1));
      bubble(ctx, 'רק רעש', 770, 650, prog(lt, nz - 0.3, nz + 0.1));
      wipeText(ctx, 'מזיז את הסטופ', W / 2, 300, prog(lt, mv - 0.05, mv + 0.3) * (1 - prog(lt, add - 0.2, add)), { size: 74, weight: 900, color: '#ff5a72' });
      wipeText(ctx, 'מוסיף לפוזיציה', W / 2, 300, prog(lt, add - 0.05, add + 0.3), { size: 74, weight: 900, color: '#ff5a72' });
      const pn = pnlAt(rev);
      glass(ctx, W / 2 - 200, 1225, 400, 90, 45, { border: '#ff5a72', glowColor: C.down });
      text(ctx, 'P&L', W / 2 + 110, 1271, { size: 30, weight: 800, color: C.axis }); text(ctx, '-$' + fmt(Math.abs(Math.round(pn))), W / 2 - 40, 1271, { size: 44, weight: 800, fam: MONO, color: '#ff5a72' });
    },
  },
  hook3: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('קטן'), type: 'pop' }, { lt: s.cue('שכואב'), type: 'impact', k: 1.4 }, { lt: s.cue('המסגרת'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFL, small = s.cue('קטן'), pain = s.cue('שכואב'), today = s.cue('היום'), frame = s.cue('ונחבר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 16, 36], [pain, 16, 41], [d, 17, 41]], { p: [39.5, 55] });
      ch.hline(ctx, ENT, 23, 41, { color: 'rgba(255,255,255,0.7)', width: 3, dash: [10, 8] });
      ch.hline(ctx, LV, 23, 41, { color: 'rgba(255,90,114,0.45)', width: 3, dash: [8, 8] });
      const rev = kf(lt, [[0, 31.4], [small, 32], [pain, 38.97], [d, 38.99]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      symIcon(ctx, ch, 'X');
      const pn = Math.round(pnlAt(rev));
      // what the stop would have cost vs what it costs now
      popT(ctx, ch.X(28), ch.Y(LV) - 40, prog(lt, small - 0.1, small + 0.3), () => pill(ctx, '-$100', ch.X(28), ch.Y(LV) - 40, { size: 30, color: '#555', fam: MONO }));
      if (lt > small) check(ctx, ch.X(28) + 100, ch.Y(LV) - 40, 20, prog(lt, small, small + 0.3), '#888');
      const pb = prog(lt, pain - 0.1, pain + 0.3);
      if (lt < today) {
        popT(ctx, W / 2, 1180, prog(lt, small, small + 0.3), () => { glass(ctx, W / 2 - 280, 1110, 560, 140, 40, { border: '#ff5a72', glowColor: C.down, glow: 30 + 40 * pb });
          text(ctx, '-$' + fmt(Math.abs(pn)), W / 2, 1182, { size: lerp(64, 96, pb), weight: 800, fam: MONO, color: '#ff5a72', glow: 30 * pb, glowColor: C.down }); });
        if (lt > pain) { hit(ctx, W / 2, 1180, lt, pain, C.down, 360); flashCol(ctx, lt, pain); }
        wipeText(ctx, 'הפסד קטן ← הפסד שכואב', W / 2, 300, prog(lt, small - 0.1, small + 0.3), { size: 64, weight: 900, color: '#ff5a72' });
      }
      const ps = prog(lt, today - 0.1, today + 0.3);
      if (ps > 0) {
        scrim(ctx, 0.75 * ps);
        headlines(ctx, lt, [{ t: 'היום נסגור', at: today, y: 620, size: 120 }, { t: 'את החור הזה', at: s.cue('החור'), y: 770, size: 120, color: C.gold, glowColor: C.gold }]);
        seriesMap(ctx, lt, -1, frame, 1050, { series: PILLARS, done: 4 });
        wipeText(ctx, 'ונחבר את כל המסגרת', W / 2, 1300, prog(lt, frame + 0.4, frame + 0.8), { size: 54, weight: 900, color: C.neon });
      }
    },
  },
  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('השלישי'), type: 'pop' }, { lt: s.cue('הביטול'), type: 'impact', k: 1 }, { lt: s.cue('וההקשר'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt } = s, third = s.cue('השלישי'), two = s.cue('שני'), pa = s.cue('Price'), inv = s.cue('הביטול'), cx = s.cue('וההקשר'), last = s.cue('והאחרון');
      drawBG(ctx, s.t, { glow: 1.25 });
      wipeText(ctx, 'חלק 3 מתוך 3', W / 2, 300, prog(lt, third - 0.05, third + 0.35), { size: 66, weight: 900, color: C.neon });
      popT(ctx, W / 2, 385, prog(lt, last, last + 0.3), () => pill(ctx, 'האחרון בסדרה', W / 2, 385, { size: 32, color: C.purple, glow: 30 }));
      text(ctx, 'PRICE ACTION · 4 PILLARS', W / 2, 1360, { size: 34, weight: 900, color: C.purple2, spacing: lerp(24, 6, E.outExpo(prog(lt, pa, pa + 0.7))), alpha: prog(lt, pa, pa + 0.4) });
      const onC = lt > cx;
      seriesMap(ctx, lt, onC ? 3 : 2, two, 1140, { series: PILLARS, done: onC ? 3 : 2 });
      const card = (y, k, he, en, t0) => { const p = prog(lt, t0 - 0.05, t0 + 0.4); if (p <= 0) return; const e = E.outBack(p), col = PCOL[k];
        ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(W / 2, y + 115); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); ctx.translate(-W / 2, -(y + 115));
        glass(ctx, 90, y, 900, 230, 34, { border: col, glowColor: col, glow: 45 });
        text(ctx, `עמוד ${k + 1}`, 930, y + 56, { size: 30, weight: 800, color: col, align: 'right' });
        text(ctx, he, 930, y + 140, { size: 92, weight: 900, align: 'right', glow: 24, glowColor: col });
        text(ctx, en, 150, y + 140, { size: 50, weight: 900, color: C.neon, align: 'left' });
        pillarIcon(ctx, k, 210, y + 60, 0.6); ctx.restore(); };
      card(470, 2, 'הביטול', 'INVALIDATION', inv);
      card(740, 3, 'ההקשר', 'CONTEXT', cx);
      if (lt > inv) ring(ctx, lerp(930, 150, 2 / 3), 1140, 160, prog(lt, inv, inv + 0.7), PCOL[2]);
      if (lt > cx) ring(ctx, 150, 1140, 160, prog(lt, cx, cx + 0.7), PCOL[3]);
    },
  },

  // ================= CH1: invalidation =================
  ch1: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 6, 'הביטול', 'INVALIDATION', { cueWord: 'הביטול' }); } },
  i1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('לפני'), type: 'pop' }, { lt: s.cue('נכנס'), type: 'pop' }, { lt: s.cue('המדויק'), type: 'pop' }, { lt: s.cue('שטעית'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRC, bf = s.cue('לפני'), ent = s.cue('נכנס'), ex = s.cue('המדויק'), wr = s.cue('שטעית');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 30], [d, 8, 32]], { p: [45.4, 56.4] });
      ch.hline(ctx, LV, 10, 32, { color: C.gold, width: 5, progress: prog(lt, bf, bf + 0.6), glow: 20 });
      ch.draw(ctx, { reveal: kf(lt, [[0, 21.5], [ent - 0.5, 22.97], [ent + 0.4, 23.98], [d, 24.3]], E.lin)[0], highlight: i => i === 23 && lt > ent + 0.4 });
      symIcon(ctx, ch, 'X');
      ch.tag(ctx, 29, LV, 'נקודת ביטול', prog(lt, bf + 0.3, bf + 0.6), { color: '#b8860b', above: false, size: 30, off: 46 });
      if (lt > ent) { ch.dot(ctx, 23, ENT, prog(lt, ent + 0.3, ent + 0.6), '#3df2a6', 12); popT(ctx, ch.X(23) - 130, ch.Y(ENT) - 40, prog(lt, ent + 0.3, ent + 0.6), () => pill(ctx, 'כניסה', ch.X(23) - 130, ch.Y(ENT) - 40, { size: 30, color: '#0b8f63' })); }
      const xa = ch.p.x + ch.p.w + 72;
      popT(ctx, xa, ch.Y(LV), prog(lt, ex, ex + 0.3), () => { rrect(ctx, xa - 70, ch.Y(LV) - 22, 140, 44, 8); ctx.fillStyle = C.gold; ctx.fill(); text(ctx, '48.00', xa, ch.Y(LV) + 1, { size: 26, weight: 800, fam: MONO, color: '#1a0f00' }); });
      if (lt > ex) ring(ctx, xa, ch.Y(LV), 140, prog(lt, ex, ex + 0.6), C.gold);
      badge(ctx, 'לפני הכניסה', prog(lt, bf, bf + 0.35), '#b8860b', 300, W / 2, 46);
      badge(ctx, 'המחיר שמוכיח שטעית', prog(lt, wr - 0.1, wr + 0.25), '#d61f45', 1270, W / 2, 40);
    },
  },
  i2: {
    trans: 'none',
    events: s => [{ lt: s.cue('תחושה'), type: 'pop' }, { lt: s.cue('רמה'), type: 'pop' }, { lt: s.cue('איבד'), type: 'impact', k: 1.3 }, { lt: s.cue('בחוץ'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFL, feel = s.cue('תחושה'), no2 = s.cue('לא', 1), down = s.cue('ירד'), lvl = s.cue('רמה'), lost = s.cue('איבד'), out = s.cue('בחוץ'), deb = s.cue('דיון');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 32], [d, 12, 36]], { p: [43.6, 55] });
      // the "feeling": a vague red cloud with no edge
      const pf = prog(lt, feel - 0.1, feel + 0.4) * (1 - prog(lt, lvl - 0.2, lvl + 0.2));
      if (pf > 0) { ch.zone(ctx, 44.4, 47.2, 25, 35, { color: '#ff5a72', alpha: (0.12 + 0.06 * Math.sin(lt * 6)) * pf });
        ['?', '?', '?'].forEach((q, k) => text(ctx, q, ch.X(27 + k * 3), ch.Y(45.8 + (k % 2) * 0.6), { size: 60, weight: 900, color: '#ff8a9a', alpha: pf * (0.6 + 0.4 * Math.sin(lt * 5 + k)) })); }
      ch.hline(ctx, LV, 10, 36, { color: lt > lost ? C.down : C.gold, width: lt > lost ? 6 : 5, progress: prog(lt, lvl, lvl + 0.5), glow: 22 });
      ch.draw(ctx, { reveal: kf(lt, [[0, 25], [lost - 0.6, 27.97], [lost, 28.98], [d, 29.6]], E.lin)[0], highlight: i => i === 28 && lt > lost });
      symIcon(ctx, ch, 'X');
      popT(ctx, ch.X(17), ch.Y(45), prog(lt, feel, feel + 0.3) * (1 - prog(lt, lvl - 0.2, lvl)), () => pill(ctx, 'תחושה', ch.X(17), ch.Y(45), { size: 32, color: '#555' }));
      cross(ctx, ch.X(17) - 110, ch.Y(45), 24, prog(lt, no2 - 0.1, no2 + 0.2) * (1 - prog(lt, lvl - 0.2, lvl)));
      const pd = prog(lt, down - 0.1, down + 0.3) * (1 - prog(lt, lvl - 0.2, lvl));
      if (pd > 0) { popT(ctx, ch.X(17), ch.Y(44.1), pd, () => pill(ctx, 'אם ירד עוד הרבה...', ch.X(17), ch.Y(44.1), { size: 28, color: '#555' })); cross(ctx, ch.X(17) - 175, ch.Y(44.1), 22, prog(lt, down + 0.4, down + 0.6)); }
      ch.tag(ctx, 16, LV, 'רמה מוגדרת · 48.00', prog(lt, lvl + 0.2, lvl + 0.5), { color: lt > lost ? '#d61f45' : '#b8860b', above: false, size: 28, off: 46 });
      if (lt > lost) { hit(ctx, ch.X(28), ch.Y(LV), lt, lost, C.down, 240); flashCol(ctx, lt, lost); }
      popT(ctx, W / 2, 300, prog(lt, out - 0.05, out + 0.3), () => pill(ctx, 'OUT ✗', W / 2, 300, { size: 60, color: '#d61f45', glow: 50 }));
      if (lt > out) ring(ctx, W / 2, 300, 420, prog(lt, out, out + 0.7), C.down);
      badge(ctx, 'בלי דיון', prog(lt, deb - 0.1, deb + 0.25), C.purple, 1270, W / 2, 42);
    },
  },
  i3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('אחד'), type: 'pop' }, { lt: s.cue('אוטומטית'), type: 'pop' }, { lt: s.cue('רגוע'), type: 'pop' }, { lt: s.cue('שהרגש'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, two = s.cue('שני'), one = s.cue('אחד'), auto = s.cue('אוטומטית'), got = s.cue('קיבלת'), calm = s.cue('רגוע'), emo = s.cue('שהרגש'), pic = s.cue('לתמונה');
      drawBG(ctx, s.t);
      badge(ctx, 'שני דברים', prog(lt, two, two + 0.35), C.purple, 300, W / 2, 44);
      popT(ctx, W / 2, 450, prog(lt, one - 0.05, one + 0.3), () => { ctx.save(); ctx.beginPath(); ctx.arc(850, 450, 42, 0, Math.PI * 2); ctx.fillStyle = C.purple; ctx.shadowColor = C.purple; ctx.shadowBlur = 30; ctx.fill(); ctx.restore();
        text(ctx, '1', 850, 453, { size: 50, weight: 900, fam: MONO }); text(ctx, 'ההחלטה אוטומטית', 780, 450, { size: 58, weight: 900, align: 'right' }); });
      popT(ctx, W / 2, 620, prog(lt, auto - 0.05, auto + 0.35), () => { glass(ctx, 110, 545, 860, 150, 26, { border: C.gold, glowColor: C.gold, fill: 'rgba(12,8,24,0.95)' });
        text(ctx, 'IF close < 48.00', 160, 600, { size: 44, weight: 800, fam: MONO, align: 'left', color: '#e8e0ff' });
        text(ctx, '→ OUT', 160, 652, { size: 44, weight: 800, fam: MONO, align: 'left', color: '#ff5a72' });
        text(ctx, 'כלל, לא החלטה', 920, 625, { size: 34, weight: 800, align: 'right', color: C.gold }); });
      // two states: calm (before entry) vs emotion (in the trade)
      const panel = (x, title, sub, col, t0, kind) => { const p = prog(lt, t0 - 0.05, t0 + 0.35); if (p <= 0) return;
        popT(ctx, x + 205, 1020, p, () => { glass(ctx, x, 790, 410, 420, 30, { border: col, glowColor: col });
          text(ctx, title, x + 205, 850, { size: 40, weight: 900 });
          const pts = []; for (let k = 0; k <= 40; k++) { const u = k / 40; pts.push([u, kind === 'calm' ? 0.5 + 0.12 * Math.sin(u * 9 + lt * 2) : 0.5 + 0.38 * Math.sin(u * 31 + lt * 9) * Math.sin(u * 7 + lt * 3)]); }
          spark(ctx, pts, x + 40, 920, 330, 170, col, 1, 5);
          text(ctx, sub, x + 205, 1150, { size: 46, weight: 900, color: col }); }); };
      panel(560, 'לפני הכניסה', 'רגוע ✓', '#3df2a6', got, 'calm');
      panel(110, 'בתוך העסקה', 'רגש', '#ff5a72', emo, 'emo');
      if (lt > calm) { ctx.save(); ctx.globalAlpha = prog(lt, calm, calm + 0.3); arrow(ctx, 765, 780, 765, 705, prog(lt, calm, calm + 0.4), { color: '#3df2a6', width: 7, head: 24 }); ctx.restore(); }
      if (lt > pic) { cross(ctx, 315, 1010, 50, prog(lt, pic, pic + 0.3)); }
      badge(ctx, 'ההחלטה כבר התקבלה', prog(lt, pic, pic + 0.35), '#0b8f63', 1290, W / 2, 38);
    },
  },
  i4: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('הביטול'), type: 'pop' }, { lt: s.cue('לסכן'), type: 'pop' }, { lt: s.cue('הגודל', 1), type: 'impact', k: 1.1 }, { lt: s.cue('הביטחון'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, sz = s.cue('הגודל'), safe = s.cue('בטוח'), pt = s.cue('נקודת'), inv = s.cue('הביטול'), risk = s.cue('לסכן'), math = s.cue('המתמטיקה'), sz2 = s.cue('הגודל', 1), conf = s.cue('הביטחון');
      drawBG(ctx, s.t);
      popT(ctx, W / 2, 300, prog(lt, sz - 0.05, sz + 0.3), () => { pill(ctx, '2 · הגודל בטוח', W / 2, 300, { size: 46, color: '#0b8f63', glow: 40 }); });
      const pc = prog(lt, safe - 0.1, safe + 0.3);
      if (pc > 0) { ctx.save(); ctx.globalAlpha = clamp(pc * 2); glass(ctx, 90, 400, 900, 790, 34, { fill: 'rgba(14,10,30,0.9)' }); ctx.restore(); }
      monoRow(ctx, 480, 'גודל החשבון', '$10,000', prog(lt, safe, safe + 0.35));
      monoRow(ctx, 590, 'כניסה', '50.00', prog(lt, pt, pt + 0.35));
      monoRow(ctx, 700, 'נקודת ביטול', '48.00', prog(lt, inv, inv + 0.35), { col: C.gold, vcol: C.gold });
      if (lt > inv + 0.3) { const p = prog(lt, inv + 0.3, inv + 0.7); text(ctx, 'מרחק', 920, 790, { size: 34, weight: 700, color: C.axis, align: 'right', alpha: p }); text(ctx, '$2.00', 160, 790, { size: 38, weight: 800, fam: MONO, align: 'left', color: '#ff5a72', alpha: p }); }
      monoRow(ctx, 885, 'סיכון לעסקה', '1% = $100', prog(lt, risk - 0.4, risk), { vcol: '#ff8a9a' });
      if (lt > math - 0.1) { ctx.save(); ctx.globalAlpha = prog(lt, math - 0.1, math + 0.2); ctx.fillStyle = 'rgba(200,150,255,0.35)'; ctx.fillRect(140, 945, 800, 3); ctx.restore(); }
      const pm = prog(lt, math, math + 0.4);
      if (pm > 0) { text(ctx, '$100 ÷ $2.00 =', 160, 1060, { size: 50, weight: 800, fam: MONO, align: 'left', alpha: pm });
        const p2 = prog(lt, sz2 - 0.1, sz2 + 0.3);
        popT(ctx, 690, 1060, p2, () => text(ctx, '50', 690, 1060, { size: 96, weight: 800, fam: MONO, color: '#3df2a6', glow: 30, glowColor: C.up }));
        text(ctx, 'מניות', 920, 1060, { size: 46, weight: 900, align: 'right', color: '#3df2a6', alpha: p2 });
        if (lt > sz2) hit(ctx, 690, 1060, lt, sz2, C.up, 220); }
      const pf = prog(lt, conf - 0.1, conf + 0.3);
      if (pf > 0) { popT(ctx, W / 2 + 40, 1280, pf, () => pill(ctx, 'כמה אני מרגיש בטוח', W / 2 + 40, 1280, { size: 36, color: '#555' })); cross(ctx, W / 2 - 250, 1280, 28, prog(lt, conf + 0.2, conf + 0.45)); }
    },
  },

  // ================= CH2: close, not wick =================
  ch2: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 6, 'סגירה, לא פתיל', 'CLOSE, NOT WICK', { cueWord: 'סגירה' }); } },
  v1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('ריקליים'), type: 'pop' }, { lt: s.cue('שקניתי'), type: 'pop' }, { lt: s.cue('יומי'), type: 'click' }, { lt: s.cue('בחוץ'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRC, rc = s.cue('ריקליים'), inv = s.cue('הביטול'), buy = s.cue('שקניתי'), day = s.cue('יומי'), cl = s.cue('נסגר'), wrong = s.cue('נכונה'), out = s.cue('בחוץ');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 32], [cl, 10, 30], [d, 12, 30]], { p: [45.6, 55.8] });
      ch.zone(ctx, 46.6, LV, 10, 32, { color: '#ff5a72', alpha: 0.16, progress: prog(lt, inv, inv + 0.6) });
      ch.hline(ctx, LV, 10, 32, { color: C.gold, width: 5, glow: 20 });
      ch.draw(ctx, { reveal: kf(lt, [[0, 18.5], [buy - 0.3, 23.98]], E.lin)[0], highlight: i => i === 23 && lt > buy, tfFlash: lt > day ? Math.exp(-(lt - day) * 5) : 0 });
      symIcon(ctx, ch, 'X');
      ch.tag(ctx, 20.5, 47.1, 'מתחת לרמה', prog(lt, rc + 0.2, rc + 0.5), { color: '#555', above: false, size: 26, off: 44 });
      ch.tag(ctx, 29, LV, 'ביטול: מתחת לרמה', prog(lt, inv, inv + 0.35), { color: '#d61f45', above: false, size: 28, off: 52 });
      if (lt > buy) popT(ctx, ch.X(21), ch.Y(51.2), prog(lt, buy, buy + 0.3), () => pill(ctx, '→ קניתי', ch.X(21), ch.Y(51.2), { size: 30, color: '#0b8f63' }));
      // the hypothetical: tomorrow's daily candle closes back below
      const pg = prog(lt, cl - 0.1, cl + 0.5);
      if (pg > 0) { const q = { o: ENT, h: 50.2, l: lerp(ENT, 46.9, pg), c: lerp(ENT, 47.3, pg) }; ghostCandle(ctx, ch, 24, q, 1);
        popT(ctx, ch.X(27), ch.Y(49.4), prog(lt, cl + 0.3, cl + 0.6), () => pill(ctx, 'נר יומי נסגר מתחת?', ch.X(27), ch.Y(49.4), { size: 28, color: '#d61f45' })); }
      badge(ctx, 'הקריאה שלי לא נכונה', prog(lt, wrong - 0.2, wrong + 0.2), '#d61f45', 1270, W / 2, 40);
      popT(ctx, W / 2, 300, prog(lt, rc - 0.05, rc + 0.3) * (1 - prog(lt, out - 0.2, out)), () => pill(ctx, 'RECLAIM · 1D', W / 2, 300, { size: 52, color: C.purple, glow: 45 }));
      popT(ctx, W / 2, 300, prog(lt, out - 0.05, out + 0.3), () => pill(ctx, 'OUT ✗', W / 2, 300, { size: 60, color: '#d61f45', glow: 50 }));
      if (lt > out) { hit(ctx, W / 2, 300, lt, out, C.down, 400); flashCol(ctx, lt, out); }
    },
  },
  v2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נגיעה'), type: 'pop' }, { lt: s.cue('רעש'), type: 'whoosh' }, { lt: s.cue('דרך'), type: 'pop' }, { lt: s.cue('לשבור'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chWK, clo = s.cue('סגירה'), touch = s.cue('נגיעה'), nz = s.cue('רעש'), thru = s.cue('דרך'), brk = s.cue('לשבור');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 30], [nz, 10, 28], [d, 13, 28]], { p: [45.8, 55.8] });
      ch.hline(ctx, LV, 6, 30, { color: C.gold, width: 5, glow: 20 });
      ch.draw(ctx, { reveal: kf(lt, [[0, 20.5], [nz, 22.97], [thru, 23.62], [brk, 23.98], [d, 23.99]], E.lin)[0], highlight: i => i === 23 && lt > brk });
      symIcon(ctx, ch, 'X');
      if (lt > touch) { ch.dot(ctx, 11, WKC[11].l, prog(lt, touch, touch + 0.3), C.gold, 12); ring(ctx, ch.X(11), ch.Y(LV), 90, (lt - touch) % 1.2 / 1.2, C.gold); }
      popT(ctx, ch.X(23) - 190, ch.Y(46.3), prog(lt, nz + 0.4, nz + 0.7), () => pill(ctx, 'רעש של יום אחד', ch.X(23) - 190, ch.Y(46.3), { size: 28, color: C.purple }));
      if (lt > thru) hit(ctx, ch.X(23), ch.Y(46.75), lt, thru, '#ff5a72', 120);
      if (lt > brk) { popT(ctx, ch.X(23) + 150, ch.Y(49.6) - 40, prog(lt, brk, brk + 0.3), () => pill(ctx, 'נסגר מעל', ch.X(23) + 150, ch.Y(49.6) - 40, { size: 28, color: '#0b8f63' })); check(ctx, ch.X(23) + 260, ch.Y(49.6) - 40, 22, prog(lt, brk + 0.1, brk + 0.4)); }
      badge(ctx, 'סגירה · לא נגיעה', prog(lt, clo, clo + 0.35), C.purple, 300, W / 2, 46);
      badge(ctx, 'עבר דרך הרמה · לא שבר אותה', prog(lt, brk + 0.3, brk + 0.6), '#b8860b', 1270, W / 2, 36);
    },
  },
  v3: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('ניסיון'), type: 'pop' }, { lt: s.cue('החלטה'), type: 'impact', k: 1.2 }, { lt: s.cue('מקום'), type: 'pop' }, { lt: s.cue('להיסגר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, wick = s.cue('פתיל'), tri = s.cue('ניסיון'), clo = s.cue('סגירה'), dec = s.cue('החלטה'), room = s.cue('מקום'), close2 = s.cue('להיסגר');
      drawBG(ctx, s.t);
      const panes = [[chWK, PANEL_TOP, kf(lt, [[0, 22.6], [wick, 22.97], [tri, 23.98], [room, 24.98], [d, 26]], E.lin)[0], [45.9, 53.2]],
        [chCL, PANEL_BOT, kf(lt, [[0, 22.6], [clo - 0.3, 22.97], [dec, 23.98], [close2, 25.5], [d, 26.5]], E.lin)[0], [44.6, 53.2]]];
      panes.forEach(([ch, pn, rev, pr], k) => {
        ch.layout(...pn, { head: 80, foot: 40 }).view(...kf(lt, [[0, 8, 30], [d, 10, 30]]), ...pr);
        if (k === 0) ch.zone(ctx, 46.6, LV, 21, 30, { color: '#3df2a6', alpha: 0.18, progress: prog(lt, room, room + 0.6) });
        ch.hline(ctx, LV, 8, 30, { color: k === 1 && lt > dec ? C.down : C.gold, width: 4 });
        ch.draw(ctx, { reveal: rev, highlight: i => i === 23 && (k ? lt > dec : lt > tri) });
        symIcon(ctx, ch, 'X');
      });
      const tx = PANEL_TOP[0] + 40, ty = chWK.Y(46.5), bx = PANEL_BOT[0] + 40, by = chCL.Y(45.4);
      const pt = prog(lt, tri - 0.05, tri + 0.3);
      if (pt > 0) { text(ctx, 'פתיל = ניסיון', tx + 270, ty, { size: 42, weight: 900, color: '#3df2a6', align: 'right', alpha: pt }); check(ctx, tx + 310, ty, 26, pt); }
      const pb = prog(lt, dec - 0.05, dec + 0.3);
      if (pb > 0) { text(ctx, 'סגירה = החלטה', bx + 290, by, { size: 42, weight: 900, color: '#ff5a72', align: 'right', alpha: pb }); cross(ctx, bx + 330, by, 26, pb); hit(ctx, chCL.X(23), chCL.Y(LV), lt, dec, C.down, 200); }
      if (lt > room) popT(ctx, chWK.X(26.5), chWK.Y(47.3), prog(lt, room + 0.3, room + 0.6), () => pill(ctx, 'מקום לנסות', chWK.X(26.5), chWK.Y(47.3), { size: 28, color: '#0b8f63' }));
      if (lt > close2) popT(ctx, chCL.X(27.5), chCL.Y(LV) - 40, prog(lt, close2, close2 + 0.3), () => pill(ctx, 'OUT ✗', chCL.X(27.5), chCL.Y(LV) - 40, { size: 34, color: '#d61f45', glow: 30 }));
      badge(ctx, 'פתיל ≠ סגירה', prog(lt, 0.05, 0.4), C.purple, 268, W / 2, 40);
    },
  },
  v4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('קטן'), type: 'pop' }, { lt: s.cue('שגומר'), type: 'impact', k: 1.3 }, { lt: s.cue('ההבדל'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, st = s.cue('וסטופ'), prot = s.cue('הוא'), small = s.cue('קטן'), turns = s.cue('שהופך'), kill = s.cue('שגומר'), acct = s.cue('החשבון'), diff = s.cue('ההבדל');
      drawBG(ctx, s.t);
      wipeText(ctx, 'סטופ לא מבטל הפסד', W / 2, 300, prog(lt, st, st + 0.35), { size: 68, weight: 900 });
      const card = (y, title, col, t0, frac, tFill, pct, bal) => { const p = prog(lt, t0 - 0.05, t0 + 0.35); if (p <= 0) return;
        popT(ctx, W / 2, y + 150, p, () => { glass(ctx, 90, y, 900, 300, 30, { border: col, glowColor: col });
          text(ctx, title, 930, y + 60, { size: 46, weight: 900, align: 'right' });
          text(ctx, 'חשבון', 930, y + 150, { size: 32, weight: 700, align: 'right', color: C.axis });
          const f = lerp(1, frac, E.outCubic(prog(lt, tFill, tFill + 0.6)));
          rrect(ctx, 150, y + 125, 640, 54, 14); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
          rrect(ctx, 150, y + 125, 640 * f, 54, 14); ctx.fillStyle = C.purple; ctx.shadowColor = C.purple; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
          if (f < 1) { ctx.fillStyle = 'rgba(242,54,69,0.75)'; ctx.fillRect(150 + 640 * f, y + 125, 640 * (1 - f), 54); }
          const pv = prog(lt, tFill + 0.2, tFill + 0.5);
          text(ctx, pct, 150, y + 240, { size: 54, weight: 800, fam: MONO, align: 'left', color: '#ff5a72', alpha: pv });
          text(ctx, bal, 790, y + 240, { size: 40, weight: 800, fam: MONO, align: 'right', color: '#fff', alpha: pv }); }); };
      card(420, 'עם סטופ · הפסד קטן', '#3df2a6', prot, 0.99, small, '-1%', '$9,900');
      card(780, 'בלי סטופ · הפסד שגדל', '#ff5a72', turns, 0.35, kill, '-65%', '$3,500');
      if (lt > kill) { hit(ctx, W / 2, 930, lt, kill, C.down, 380); flashCol(ctx, lt, kill); }
      popT(ctx, 760, 1125, prog(lt, acct - 0.05, acct + 0.3), () => pill(ctx, 'גומר את החשבון', 760, 1125, { size: 32, color: '#d61f45', glow: 30 }));
      badge(ctx, 'וזה כל ההבדל', prog(lt, diff - 0.2, diff + 0.2), C.purple, 1270, W / 2, 46);
    },
  },

  // ================= CH3: context =================
  ch3: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 6, 'ההקשר', 'CONTEXT', { cueWord: 'ההקשר' }); } },
  x1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('רמה'), type: 'pop' }, { lt: s.cue('אישור'), type: 'pop' }, { lt: s.cue('מתהפך'), type: 'impact', k: 1 }, { lt: s.cue('ודורס'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, lvl = s.cue('רמה'), cf = s.cue('אישור'), perf = s.cue('מושלם'), ent = s.cue('נכנסת'), mkt = s.cue('השוק'), flip = s.cue('מתהפך'), run = s.cue('ודורס'), head = s.cue('הראש');
      drawBG(ctx, s.t);
      const ts = chSX, ti = chIX;
      ts.layout(...PANEL_TOP, { head: 80, foot: 40 }).view(...kf(lt, [[0, 6, 30], [d, 8, 31]]), 29.4, 36.2);
      ts.hline(ctx, 32.6, 11, 31, { color: C.gold, width: 4, progress: prog(lt, lvl, lvl + 0.5) });
      const rs = kf(lt, [[0, 19.6], [cf - 0.3, 21.97], [cf + 0.2, 22.98], [ent, 23.98], [run - 0.2, 25.9], [run + 0.4, 27.98], [d, 28.4]], E.lin)[0];
      ts.draw(ctx, { reveal: rs, highlight: i => i === 22 && lt > cf });
      symIcon(ctx, ts, 'X');
      ts.tag(ctx, 17, 32.6, 'רמה', prog(lt, lvl, lvl + 0.3), { color: '#b8860b', above: false, size: 26, off: 40 });
      ts.tag(ctx, 22, 32.55, 'אישור', prog(lt, cf + 0.2, cf + 0.5), { color: '#0b8f63', above: false, size: 26, off: 40 });
      if (lt > ent) popT(ctx, ts.X(23) - 110, ts.Y(34.3) - 30, prog(lt, ent, ent + 0.3), () => pill(ctx, 'LONG', ts.X(23) - 110, ts.Y(34.3) - 30, { size: 26, color: '#0b8f63' }));
      check(ctx, ts.X(30), ts.r.y + 130, 24, prog(lt, perf, perf + 0.3) * (1 - prog(lt, run, run + 0.2)));
      if (lt > run) { hit(ctx, ts.X(27), ts.Y(31), lt, run, C.down, 200); flashCol(ctx, lt, run); ts.tag(ctx, 28, 30.6, 'נדרס', prog(lt, run + 0.3, run + 0.6), { color: '#d61f45', above: false, size: 28, off: 40 }); }
      // the index nobody looked at
      const look = prog(lt, mkt - 0.2, mkt + 0.3);
      ti.layout(...PANEL_BOT, { head: 80, foot: 40 }).view(...kf(lt, [[0, 6, 30], [d, 8, 31]]), 5420, 5900);
      ctx.save(); ctx.globalAlpha = 0.35 + 0.65 * look;
      ti.hline(ctx, 5785, 20, 31, { color: lt > flip ? C.down : 'rgba(255,255,255,0.5)', width: 3, dash: lt > flip ? null : [10, 8] });
      ti.draw(ctx, { reveal: kf(lt, [[0, 19.6], [ent, 24], [mkt, 24.6], [flip, 26.98], [d, 28.4]], E.lin)[0] });
      symIcon(ctx, ti, 'S', '#e0546b');
      ctx.restore();
      popT(ctx, ti.r.x + 425, ti.r.y + 48, look, () => pill(ctx, 'S&P 500', ti.r.x + 425, ti.r.y + 48, { size: 24, color: '#3b1a78', fam: MONO }));
      if (lt > flip) { hit(ctx, ti.X(26), ti.Y(5785), lt, flip, C.down, 200); ti.tag(ctx, 27, 5690, 'השוק מתהפך', prog(lt, flip, flip + 0.3), { color: '#d61f45', above: false, size: 26, off: 40 }); }
      const ph = prog(lt, head - 0.1, head + 0.3);
      if (ph > 0) { arrow(ctx, 960, 760, 960, 1000, ph, { color: C.gold, width: 8, head: 26 }); popT(ctx, W / 2, 865, ph, () => pill(ctx, 'תרים את הראש מהגרף', W / 2, 865, { size: 36, color: '#b8860b', glow: 35 })); }
      badge(ctx, 'סטאפ נקי', prog(lt, 0.1, 0.45), '#0b8f63', 268, W / 2, 40);
    },
  },
  x2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('בוואקום'), type: 'pop' }, { lt: s.cue('שלוש'), type: 'pop' }, { lt: s.cue('בסדר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, vac = s.cue('בוואקום'), size = s.cue('גודל'), three = s.cue('שלוש'), ord = s.cue('בסדר');
      drawBG(ctx, s.t);
      wipeText(ctx, 'גרף אחד לא חי בוואקום', W / 2, 300, prog(lt, 0.05, 0.4), { size: 64, weight: 900 });
      // the lone chart inside a glass bell, which cracks open
      const pc = prog(lt, 0.1, 0.5), crack = prog(lt, vac, vac + 0.4);
      popT(ctx, W / 2, 560, pc, () => { glass(ctx, 300, 440, 480, 240, 26, { border: 'rgba(200,150,255,0.5)' }); miniCandles(ctx, SXC.slice(8, 24), 330, 470, 420, 180);
        ctx.save(); ctx.strokeStyle = `rgba(227,196,255,${0.7 - 0.5 * crack})`; ctx.lineWidth = 4; ctx.shadowColor = C.purple; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.moveTo(280, 710); ctx.lineTo(280, 620); ctx.arc(540, 620, 260, Math.PI, 0); ctx.lineTo(800, 710); ctx.stroke();
        if (crack > 0) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(540, 360); ctx.lineTo(565, 360 + 50 * crack); ctx.lineTo(525, 360 + 80 * crack); ctx.stroke(); }
        ctx.restore(); });
      popT(ctx, W / 2, 780, prog(lt, size - 0.05, size + 0.3), () => pill(ctx, 'לפני שקובעים גודל', W / 2, 780, { size: 36, color: C.purple }));
      ['השוק הכללי', 'כמה התנועה מתוחה', 'אירוע קרוב'].forEach((t, k) => { const y = 900 + k * 135, p = prog(lt, three + k * 0.18, three + k * 0.18 + 0.35), on = lt > ord + k * 0.2;
        popT(ctx, W / 2, y, p, () => { glass(ctx, 140, y - 55, 800, 110, 26, { border: on ? C.gold : 'rgba(190,140,255,0.35)', glowColor: on ? C.gold : 'rgba(140,70,255,0.45)' });
          ctx.save(); ctx.beginPath(); ctx.arc(880, y, 36, 0, Math.PI * 2); ctx.fillStyle = on ? C.gold : C.purple; ctx.fill(); ctx.restore();
          text(ctx, String(k + 1), 880, y + 2, { size: 42, weight: 900, fam: MONO, color: on ? '#1a0f00' : '#fff' }); text(ctx, t, 820, y, { size: 46, weight: 900, align: 'right' }); pillarIcon(ctx, 3, 220, y, 0.6, 0.6); }); });
    },
  },
  x3: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('אס-אנד-פי'), type: 'click' }, { lt: s.cue('הנאסדק'), type: 'click' }, { lt: s.cue('מגמה'), type: 'pop' }, { lt: s.cue('מתוח'), type: 'pop' }, { lt: s.cue('דשדוש'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSP, open = s.cue('פותח'), spx = s.cue('אס-אנד-פי'), ndx = s.cue('הנאסדק'), day = s.cue('יומי'), tr = s.cue('מגמה'), ex = s.cue('מתוח'), chop = s.cue('דשדוש');
      drawBG(ctx, s.t);
      badge(ctx, '1 · מה השוק הכללי עושה?', prog(lt, 0.05, 0.4), C.purple, 300, W / 2, 40);
      ch.sym = lt > ndx ? 'NDX' : 'SPX';
      const pc = prog(lt, open - 0.3, open + 0.2);
      if (pc > 0) { ctx.save(); ctx.globalAlpha = pc;
        ch.layout(40, 370, 1000, 560, { head: 90, foot: 44 }).view(...kf(lt, [[0, 0, 34], [d, 6, 34]]), 5120, 5880);
        const fl = Math.max(lt > spx ? Math.exp(-(lt - spx) * 5) : 0, lt > ndx ? Math.exp(-(lt - ndx) * 5) : 0, lt > day ? Math.exp(-(lt - day) * 5) : 0);
        ch.draw(ctx, { reveal: lerp(10, 33.9, prog(lt, open, d - 0.5)), tfFlash: fl });
        symIcon(ctx, ch, lt > ndx ? 'N' : 'S', lt > ndx ? '#2962ff' : '#e0546b'); ctx.restore(); }
      popT(ctx, 720, 965, prog(lt, spx, spx + 0.3), () => pill(ctx, 'S&P 500', 720, 965, { size: 30, color: lt > ndx ? '#3b1a78' : '#e0546b', fam: MONO }));
      popT(ctx, 360, 965, prog(lt, ndx, ndx + 0.3), () => pill(ctx, 'NASDAQ', 360, 965, { size: 30, color: '#2962ff', fam: MONO }));
      [['מגמה ברורה', SPARK.trend, '#3df2a6', tr], ['מתוח אחרי ריצה', SPARK.ext, C.gold, ex], ['דשדוש', SPARK.chop, '#9aa0b5', chop]].forEach(([t, pts, col, t0], k) => {
        const x = 870 - k * 330, p = prog(lt, t0 - 0.05, t0 + 0.3);
        popT(ctx, x, 1160, p, () => { glass(ctx, x - 150, 1030, 300, 260, 26, { border: col, glowColor: col });
          spark(ctx, pts, x - 110, 1070, 220, 120, col, prog(lt, t0, t0 + 0.6), 6); text(ctx, t, x, 1245, { size: t.length > 9 ? 32 : 38, weight: 900, color: col }); });
      });
    },
  },
  x4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('לונג'), type: 'pop' }, { lt: s.cue('נגד'), type: 'impact', k: 1 }, { lt: s.cue('איתי'), type: 'pop' }, { lt: s.cue('נגדי'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, lg = s.cue('לונג'), mkt = s.cue('השוק'), swim = s.cue('לשחות'), ag = s.cue('נגד'), wm = s.cue('איתי'), least = s.cue('לפחות'), nag = s.cue('נגדי');
      drawBG(ctx, s.t);
      // the tide: chevrons flowing down (against), up (with) or sideways (neutral)
      const mode = lt > least ? 2 : lt > wm ? 1 : 0, col = ['255,90,114', '61,242,166', '170,170,200'][mode], pf = prog(lt, mkt - 0.2, mkt + 0.3);
      if (pf > 0) { ctx.save(); ctx.beginPath(); ctx.rect(60, 400, 960, 820); ctx.clip();
        for (let cx = 0; cx < 7; cx++) for (let r = 0; r < 7; r++) {
          const x0 = 130 + cx * 137, base = 400 + r * 130, sp = 150;
          let x = x0, y = base;
          if (mode === 0) y = 400 + ((r * 130 + lt * sp) % 910);
          if (mode === 1) y = 400 + (((r * 130 - lt * sp) % 910) + 910) % 910;
          if (mode === 2) x = 60 + (((cx * 137 + lt * 90) % 960) + 960) % 960;
          ctx.globalAlpha = 0.35 * pf; ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
          if (mode === 0) { ctx.moveTo(x - 22, y - 12); ctx.lineTo(x, y + 10); ctx.lineTo(x + 22, y - 12); }
          else if (mode === 1) { ctx.moveTo(x - 22, y + 12); ctx.lineTo(x, y - 10); ctx.lineTo(x + 22, y + 12); }
          else { ctx.moveTo(x - 12, y - 20); ctx.lineTo(x + 10, y); ctx.lineTo(x - 12, y + 20); }
          ctx.stroke(); }
        ctx.restore(); }
      popT(ctx, W / 2, 300, pf, () => pill(ctx, ['השוק ↓', 'השוק ↑', 'השוק →'][mode], W / 2, 300, { size: 46, color: ['#d61f45', '#0b8f63', '#555'][mode], glow: 40 }));
      // the trade
      const pl = prog(lt, lg - 0.05, lg + 0.5);
      if (pl > 0) { const wob = mode === 0 ? Math.sin(lt * 9) * 14 : 0; arrow(ctx, W / 2 + wob, 1120, W / 2 - wob, 600, pl, { color: C.up, width: 26, head: 70, glow: 40 });
        popT(ctx, W / 2 + 160, 900, pl, () => pill(ctx, 'LONG', W / 2 + 160, 900, { size: 40, color: '#0b8f63' })); }
      if (lt > ag && mode === 0) { cross(ctx, W / 2 - 170, 860, 50, prog(lt, ag, ag + 0.3)); hit(ctx, W / 2, 860, lt, ag, C.down, 320); }
      if (lt > wm) check(ctx, W / 2 - 170, 860, 50, prog(lt, wm, wm + 0.3), mode === 2 ? '#9aa0b5' : C.up);
      wipeText(ctx, 'לשחות נגד הזרם', W / 2, 1270, prog(lt, swim, swim + 0.35) * (1 - prog(lt, wm - 0.2, wm)), { size: 58, weight: 900, color: '#ff5a72' });
      wipeText(ctx, 'השוק איתי', W / 2, 1270, prog(lt, wm, wm + 0.3) * (1 - prog(lt, least - 0.2, least)), { size: 58, weight: 900, color: '#3df2a6' });
      wipeText(ctx, 'או לפחות לא נגדי', W / 2, 1270, prog(lt, nag - 0.4, nag), { size: 58, weight: 900, color: '#cfd3e6' });
    },
  },
  x5: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('חמישה'), type: 'pop' }, { lt: s.cue('סיכון'), type: 'pop' }, { lt: s.cue('דשדוש'), type: 'pop' }, { lt: s.cue('שבועות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, five = s.cue('חמישה'), noFix = s.cue('תיקון'), risk = s.cue('סיכון'), rng0 = s.cue('דשדוש'), wks = s.cue('שבועות');
      drawBG(ctx, s.t);
      const te = chEX, tb = chBS;
      te.layout(...PANEL_TOP, { head: 80, foot: 40 }).view(...kf(lt, [[0, 2, 26], [d, 4, 26]]), 39.2, 50);
      te.draw(ctx, { reveal: kf(lt, [[0, 15.5], [five, 15.98], [five + 1.2, 20.98], [d, 20.99]], E.lin)[0], highlight: i => i >= 16 && i <= 20 && lt > noFix });
      symIcon(ctx, te, 'X');
      for (let k = 0; k < 5; k++) { const i = 16 + k, t0 = five + k * 0.24; if (lt > t0 + 0.2) te.tag(ctx, i, EXC[i].l, String(k + 1), prog(lt, t0 + 0.2, t0 + 0.45), { color: '#0b8f63', above: false, size: 24, off: 32 }); }
      if (lt > noFix) popT(ctx, te.X(9), te.r.y + 150, prog(lt, noFix, noFix + 0.3), () => pill(ctx, '5 ימים · בלי תיקון', te.X(9), te.r.y + 150, { size: 30, color: '#0b8f63' }));
      if (lt > risk) { warnIcon(ctx, te.X(14), te.r.y + 250, 30, prog(lt, risk, risk + 0.3)); text(ctx, 'מתוח · סיכון אחר', te.X(14) - 50, te.r.y + 255, { size: 36, weight: 900, color: C.gold, align: 'right', alpha: prog(lt, risk, risk + 0.3) }); }
      // base breakout
      tb.layout(...PANEL_BOT, { head: 80, foot: 40 }).view(...kf(lt, [[0, 2, 28], [d, 4, 28]]), 37.6, 43.2);
      tb.zone(ctx, 38.35, 40.55, 9, 23.5, { color: C.purple, alpha: 0.2, progress: prog(lt, rng0, rng0 + 0.5) });
      tb.draw(ctx, { reveal: kf(lt, [[0, 18], [rng0, 23.98], [wks, 24.2], [d, 24.98]], E.lin)[0], highlight: i => i === 24 && lt > wks + 0.3 });
      symIcon(ctx, tb, 'X');
      if (lt > rng0) popT(ctx, tb.X(16), tb.Y(40.55) - 40, prog(lt, rng0 + 0.2, rng0 + 0.5), () => pill(ctx, 'דשדוש · 3 שבועות', tb.X(16), tb.Y(40.55) - 40, { size: 28, color: C.purple }));
      if (lt > wks) { popT(ctx, tb.X(24) - 140, tb.Y(42) - 10, prog(lt, wks + 0.3, wks + 0.6), () => pill(ctx, 'פריצה', tb.X(24) - 140, tb.Y(42) - 10, { size: 28, color: '#0b8f63' })); hit(ctx, tb.X(24), tb.Y(41.5), lt, wks + 0.3, C.up, 150); }
      badge(ctx, '2 · כמה התנועה מתוחה?', prog(lt, 0.05, 0.4), C.purple, 268, W / 2, 40);
    },
  },
  x6: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שונה'), type: 'pop' }, { lt: s.cue('קטן'), type: 'pop' }, { lt: s.cue('מוותר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, same = s.cue('אותו'), diff = s.cue('שונה'), size = s.cue('גודל'), small = s.cue('קטן'), pass = s.cue('מוותר');
      drawBG(ctx, s.t);
      wipeText(ctx, 'אותו סטאפ · הקשר שונה', W / 2, 300, prog(lt, same, same + 0.35), { size: 62, weight: 900 });
      const setup = BSC.slice(12, 25);
      [[790, 'הקשר נקי', '#3df2a6'], [290, 'מתוח', C.gold]].forEach(([x, lb, col], k) => {
        popT(ctx, x, 560, prog(lt, same + k * 0.15, same + k * 0.15 + 0.35), () => { glass(ctx, x - 220, 420, 440, 290, 26, { border: lt > diff ? col : 'rgba(190,140,255,0.4)', glowColor: lt > diff ? col : 'rgba(140,70,255,0.45)' });
          miniCandles(ctx, setup, x - 180, 450, 360, 170); text(ctx, lb, x, 670, { size: 38, weight: 900, color: col, alpha: prog(lt, diff, diff + 0.3) }); });
      });
      // size gauge
      const pg = prog(lt, size - 0.3, size + 0.2); if (pg <= 0) return;
      const cx = W / 2, cy = 1170, R = 300;
      ctx.save(); ctx.globalAlpha = pg; ctx.lineWidth = 46; ctx.lineCap = 'butt';
      [[Math.PI, Math.PI * 4 / 3, '#ff5a72'], [Math.PI * 4 / 3, Math.PI * 5 / 3, C.gold], [Math.PI * 5 / 3, Math.PI * 2, '#3df2a6']].forEach(([a0, a1, c]) => {
        ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(cx, cy, R, a0 + 0.02, a1 - 0.02); ctx.stroke(); });
      ctx.restore();
      [['PASS', Math.PI * 7 / 6, '#ff5a72'], ['HALF', Math.PI * 3 / 2, C.gold], ['FULL', Math.PI * 11 / 6, '#3df2a6']].forEach(([t, a, c]) => text(ctx, t, cx + Math.cos(a) * (R + 72), cy + Math.sin(a) * (R + 62), { size: 36, weight: 900, fam: MONO, color: c, alpha: pg }));
      const ang = kf(lt, [[size, Math.PI * 11 / 6], [small, Math.PI * 11 / 6], [small + 0.4, Math.PI * 3 / 2], [pass, Math.PI * 3 / 2], [pass + 0.4, Math.PI * 7 / 6]])[0];
      ctx.save(); ctx.globalAlpha = pg; ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * (R - 50), cy + Math.sin(ang) * (R - 50)); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      text(ctx, 'גודל פוזיציה', cx, cy + 70, { size: 38, weight: 800, color: C.axis, alpha: pg });
    },
  },
  x7: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('דוחות'), type: 'pop' }, { lt: s.cue('מדד'), type: 'pop' }, { lt: s.cue('הפד'), type: 'pop' }, { lt: s.cue('חוצה'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, ev = s.cue('אירוע'), er = s.cue('דוחות'), cpi = s.cue('מדד'), fed = s.cue('נאום'), run = s.cue('בורח'), but = s.cue('אבל'), half = s.cue('חוצה');
      drawBG(ctx, s.t);
      badge(ctx, '3 · יש אירוע קרוב?', prog(lt, 0.05, 0.4), C.purple, 300, W / 2, 42);
      const pc = prog(lt, ev - 0.3, ev + 0.2);
      if (pc > 0) { ctx.save(); ctx.globalAlpha = pc; glass(ctx, 70, 400, 940, 480, 30, { fill: 'rgba(14,10,30,0.92)' });
        ['MON', 'TUE', 'WED', 'THU', 'FRI'].forEach((dn, k) => { const x = 164 + k * 188; text(ctx, dn, x, 455, { size: 30, weight: 800, fam: MONO, color: C.axis }); text(ctx, String(12 + k), x, 510, { size: 40, weight: 800, fam: MONO });
          if (k) { ctx.fillStyle = 'rgba(200,150,255,0.15)'; ctx.fillRect(70 + k * 188, 430, 2, 430); } });
        ctx.restore(); }
      const chip = (k, y, t, col, t0, sub) => { const x = 164 + k * 188, p = prog(lt, t0 - 0.05, t0 + 0.3); popT(ctx, x, y, p, () => { pill(ctx, t, x, y, { size: 30, color: col, fam: MONO, glow: 30 }); if (sub) text(ctx, sub, x, y + 52, { size: 24, weight: 700, fam: MONO, color: C.axis }); });
        if (p > 0 && lt < t0 + 0.6) ring(ctx, x, y, 120, prog(lt, t0, t0 + 0.6), col); };
      chip(1, 640, 'Earnings', '#7c3aed', er, 'AMC');
      chip(2, 640, 'CPI', '#d61f45', cpi, '08:30');
      chip(3, 640, 'FED', '#b8860b', fed, '14:00');
      [[0, 760], [4, 760], [2, 790]].forEach(([k, y], j) => { const p = prog(lt, run + j * 0.12, run + j * 0.12 + 0.3); popT(ctx, 164 + k * 188, y, p, () => pill(ctx, 'News', 164 + k * 188, y, { size: 24, color: '#444', fam: MONO, glow: 0 })); });
      if (lt > run) text(ctx, 'לא בורח מכל חדשה', W / 2, 935, { size: 40, weight: 800, color: '#cfd3e6', alpha: prog(lt, run + 0.2, run + 0.5) * (1 - prog(lt, but - 0.2, but)) });
      // size bar halves
      const pb = prog(lt, but - 0.1, but + 0.3);
      if (pb > 0) { ctx.save(); ctx.globalAlpha = pb; glass(ctx, 120, 990, 840, 200, 28);
        text(ctx, 'גודל', 900, 1050, { size: 40, weight: 900, align: 'right' });
        const f = lerp(1, 0.5, E.outCubic(prog(lt, half, half + 0.5)));
        rrect(ctx, 180, 1095, 720, 56, 14); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
        rrect(ctx, 900 - 720 * f, 1095, 720 * f, 56, 14); ctx.fillStyle = f < 0.99 ? C.gold : C.purple; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 25; ctx.fill(); ctx.shadowBlur = 0;
        text(ctx, f < 0.99 ? Math.round(f * 100) + '%' : '100%', 180, 1050, { size: 44, weight: 800, fam: MONO, align: 'left', color: f < 0.99 ? C.gold : '#fff' });
        ctx.restore(); if (lt > half) hit(ctx, 540, 1123, lt, half, C.gold, 260); }
      badge(ctx, 'לפני אירוע · חצי גודל', prog(lt, half + 0.3, half + 0.6), '#b8860b', 1290, W / 2, 38);
    },
  },
  x8: {
    trans: 'whip',
    events: s => [{ lt: s.cue('לטוב'), type: 'pop' }, { lt: s.cue('כשמתעלמים'), type: 'whoosh' }, { lt: s.cue('להפסד'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, bad = s.cue('רע'), good = s.cue('לטוב'), but = s.cue('אבל'), ign = s.cue('כשמתעלמים'), gd = s.cue('טוב', 1), loss = s.cue('להפסד'), saw = s.cue('ראית');
      drawBG(ctx, s.t);
      wipeText(ctx, 'הקשר לא מציל סטאפ רע', W / 2, 300, prog(lt, 0.05, 0.4) * (1 - prog(lt, but - 0.2, but)), { size: 62, weight: 900 });
      wipeText(ctx, 'אבל בלעדיו, גם טוב נופל', W / 2, 300, prog(lt, but, but + 0.35), { size: 62, weight: 900, color: C.gold });
      const row = (y, a, ca, b, cb, r, cr, ts) => {
        popT(ctx, 820, y, prog(lt, ts[0] - 0.05, ts[0] + 0.3), () => pill(ctx, a, 820, y, { size: 44, color: ca, glow: 30 }));
        popT(ctx, 540, y, prog(lt, ts[1] - 0.05, ts[1] + 0.3), () => pill(ctx, b, 540, y, { size: 40, color: cb, glow: 20, fill: false }));
        popT(ctx, 240, y, prog(lt, ts[2] - 0.05, ts[2] + 0.3), () => pill(ctx, r, 240, y, { size: 44, color: cr, glow: 40 }));
        [[680, ts[1]], [385, ts[2]]].forEach(([x, t]) => text(ctx, '←', x, y, { size: 56, weight: 900, color: C.axis, alpha: prog(lt, t - 0.1, t + 0.2) })); };
      row(620, 'סטאפ רע', '#d61f45', '+ הקשר', C.teal, 'טוב?', '#555', [bad, bad + 0.25, good]);
      if (lt > good) cross(ctx, 240, 540, 34, prog(lt, good + 0.1, good + 0.4));
      row(1000, 'סטאפ טוב', '#0b8f63', '− הקשר', '#ff5a72', 'הפסד', '#d61f45', [gd - 0.3, ign, loss]);
      if (lt > loss) { hit(ctx, 240, 1000, lt, loss, C.down, 260); flashCol(ctx, lt, loss); }
      badge(ctx, 'הפסד שלא ראית מגיע', prog(lt, saw - 0.1, saw + 0.25), '#d61f45', 1200, W / 2, 40);
    },
  },

  // ================= CH4: all four pillars =================
  ch4: {
    trans: 'glitch', captions: false, events: chapterEvents,
    draw(ctx, s) { chapterDraw(ctx, s, 4, 6, 'כל ארבעת העמודים', 'ALL 4 PILLARS', { cueWord: 'כל' }); seriesMap(ctx, s.lt, -1, s.cue('ביחד') - 0.2, 1440, { series: PILLARS, done: 4 }); },
  },
  f1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('שנים'), type: 'pop' }, { lt: s.cue('לשוניות'), type: 'pop' }, { lt: s.cue('ותוכנית'), type: 'pop' }, { lt: s.cue('ניחוש'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt } = s, hard = s.cue('הקשה'), ind = s.cue('שנים'), tabs = s.cue('לשוניות'), plan = s.cue('ותוכנית'), gs = s.cue('ניחוש'), steps = s.cue('צעדים');
      drawBG(ctx, s.t, { hue: 30 });
      const dimA = 1 - 0.6 * prog(lt, gs, gs + 0.3);
      ctx.save(); ctx.globalAlpha = dimA;
      const r = rng(31), names = ['RSI', 'MACD', 'EMA 9', 'EMA 21', 'EMA 200', 'VWAP', 'BB 20', 'Stoch', 'ATR', 'OBV', 'Ichimoku', 'SuperTrend'];
      names.forEach((n, k) => { const x = 160 + r() * 760, y = 430 + r() * 330, p = prog(lt, ind + k * 0.06, ind + k * 0.06 + 0.3), jx = Math.sin(lt * 7 + k) * 5, jy = Math.cos(lt * 6 + k * 2) * 5;
        popT(ctx, x + jx, y + jy, p, () => pill(ctx, n, x + jx, y + jy, { size: 30, color: ['#7c3aed', '#2962ff', '#b8860b', '#d61f45', '#0b8f63'][k % 5], fam: MONO, glow: 16 })); });
      const pt = prog(lt, tabs - 0.1, tabs + 0.2);
      if (pt > 0) { glass(ctx, 60, 840, 960, 90, 18, { fill: 'rgba(14,10,30,0.92)' });
        ['Chart', 'News', 'Forum', 'Scanner', 'Chat', 'Blog', 'Signals', 'Tips', 'Video', 'Calc'].forEach((t, k) => { const p = prog(lt, tabs + k * 0.07, tabs + k * 0.07 + 0.2); if (p <= 0) return; const x = 75 + k * 94;
          ctx.save(); ctx.globalAlpha *= p; rrect(ctx, x, 860, 88, 56, 10); ctx.fillStyle = k === Math.floor(lt * 4) % 10 ? '#3b1a78' : '#1d1535'; ctx.fill(); ctx.restore();
          text(ctx, t, x + 44, 889, { size: 17, weight: 700, fam: MONO, color: '#ddd', alpha: p }); }); }
      const pp = prog(lt, plan - 0.1, plan + 0.2);
      if (pp > 0) { const nDay = 1 + Math.floor(Math.max(0, lt - plan) / 0.3);
        for (let k = 2; k >= 0; k--) { const y = 1030 + k * 22, x = 300 + k * 26, rot = (k - 1) * 0.06; ctx.save(); ctx.globalAlpha *= pp * (k ? 0.5 : 1); ctx.translate(x + 240, y + 80); ctx.rotate(rot); ctx.translate(-(x + 240), -(y + 80));
          glass(ctx, x, y, 480, 170, 20, { fill: 'rgba(24,16,48,0.97)' });
          if (!k) { text(ctx, 'תוכנית חדשה', x + 440, y + 60, { size: 40, weight: 900, align: 'right' }); text(ctx, 'DAY ' + nDay, x + 40, y + 60, { size: 34, weight: 800, fam: MONO, align: 'left', color: C.gold }); text(ctx, 'אולי הפעם?', x + 440, y + 125, { size: 32, weight: 700, align: 'right', color: C.axis }); }
          ctx.restore(); } }
      ctx.restore();
      badge(ctx, 'הדרך הקשה', prog(lt, hard, hard + 0.35), '#d61f45', 300, W / 2, 46);
      const pg = prog(lt, gs - 0.05, gs + 0.25);
      if (pg > 0) { popT(ctx, W / 2, 760, pg, () => { ctx.save(); ctx.translate(W / 2, 760); ctx.rotate(-0.12); ctx.translate(-W / 2, -760);
          rrect(ctx, W / 2 - 300, 650, 600, 220, 30); ctx.lineWidth = 12; ctx.strokeStyle = '#ff3355'; ctx.shadowColor = C.down; ctx.shadowBlur = 40; ctx.stroke(); ctx.fillStyle = 'rgba(40,0,10,0.6)'; ctx.fill(); ctx.shadowBlur = 0;
          text(ctx, 'ניחוש', W / 2, 765, { size: 150, weight: 900, color: '#ff3355', glow: 30, glowColor: C.down }); ctx.restore(); });
        hit(ctx, W / 2, 760, lt, gs, C.down, 420);
        text(ctx, 'עם עוד צעדים', W / 2, 960, { size: 52, weight: 900, color: '#ff8a9a', alpha: prog(lt, steps - 0.1, steps + 0.25) }); }
    },
  },
  f2: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('הפשוטה'), type: 'pop' }, { lt: s.cue('המפה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, easy = s.cue('הפשוטה'), mp = s.cue('המפה'), q = s.cue('איפה');
      drawBG(ctx, s.t);
      badge(ctx, 'הדרך הפשוטה', prog(lt, easy - 0.1, easy + 0.25), '#0b8f63', 300, W / 2, 46);
      board(ctx, lt, 0, mp, q);
    },
  },
  f3: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('האישור'), type: 'pop' }, { lt: s.cue('ברמה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s;
      drawBG(ctx, s.t);
      badge(ctx, 'הדרך הפשוטה', 1, '#0b8f63', 300, W / 2, 46);
      board(ctx, lt, 1, s.cue('האישור'), s.cue('מה'), { checks: [0.1] });
    },
  },
  f4: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('הביטול'), type: 'pop' }, { lt: s.cue('מחליטים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s;
      drawBG(ctx, s.t);
      badge(ctx, 'הדרך הפשוטה', 1, '#0b8f63', 300, W / 2, 46);
      board(ctx, lt, 2, s.cue('הביטול'), s.cue('איפה'), { checks: [-1, 0.1] });
    },
  },
  f5: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('וההקשר'), type: 'pop' }, { lt: s.cue('מלא'), type: 'pop' }, { lt: s.cue('חצי'), type: 'pop' }, { lt: s.cue('ויתור'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, ctxw = s.cue('וההקשר'), q = s.cue('מה'), full = s.cue('מלא'), half = s.cue('חצי'), pass = s.cue('ויתור');
      drawBG(ctx, s.t);
      badge(ctx, 'הדרך הפשוטה', 1, '#0b8f63', 300, W / 2, 46);
      board(ctx, lt, 3, ctxw, q, { checks: [-1, -1, 0.1], q: { 3: (y0, pq) => {
        wipeText(ctx, PIL[3].q, 892, y0 + 122, pq, { size: 34, weight: 700, align: 'right', color: '#e8e0ff' });
        [['מלא', '#0b8f63', full, 820], ['חצי', '#b8860b', half, 690], ['ויתור', '#d61f45', pass, 555]].forEach(([t, c, t0, x]) => popT(ctx, x, y0 + 178, prog(lt, t0 - 0.05, t0 + 0.3), () => pill(ctx, t, x, y0 + 178, { size: 28, color: c, glow: 20 })));
      } } });
    },
  },
  f6: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('ארבעה'), type: 'pop' }, { lt: s.cue('סודי'), type: 'pop' }, { lt: s.cue('תחזיות'), type: 'pop' }, { lt: s.cue('תהליך'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt } = s, four = s.cue('ארבעה'), ord = s.cue('סדר'), sec = s.cue('סודי'), fc = s.cue('תחזיות'), proc = s.cue('תהליך');
      drawBG(ctx, s.t, { glow: 1.2 });
      const hi = lt > ord - 0.2 && lt < sec ? Math.floor(clamp((lt - ord + 0.2) / 1.0) * 4 + 0.0001) : -1;
      board(ctx, lt, 3, -9, -9, { checks: [four, four + 0.15, four + 0.3, four + 0.45], hi });
      popT(ctx, 760, 300, prog(lt, sec - 0.1, sec + 0.25), () => pill(ctx, 'אינדיקטור סודי', 760, 300, { size: 34, color: '#444', glow: 0 }));
      cross(ctx, 760 + 150, 300, 22, prog(lt, sec + 0.1, sec + 0.4));
      popT(ctx, 330, 300, prog(lt, fc - 0.1, fc + 0.25), () => pill(ctx, 'תחזיות', 330, 300, { size: 34, color: '#444', glow: 0 }));
      cross(ctx, 330 + 90, 300, 22, prog(lt, fc + 0.1, fc + 0.4));
      const pp = prog(lt, proc - 0.1, proc + 0.25);
      if (pp > 0) { scrim(ctx, 0.7 * pp); popT(ctx, W / 2, 860, pp, () => text(ctx, 'יש לך תהליך', W / 2, 860, { size: 140, weight: 900, color: '#3df2a6', glow: 60, glowColor: C.up }));
        hit(ctx, W / 2, 860, lt, proc, C.up, 560); }
    },
  },

  // ================= CH5: what it changed =================
  ch5: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 6, 'מה זה שינה אצלי', 'WHAT CHANGED FOR ME', { cueWord: 'מה' }); } },
  g1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('תזוזה'), type: 'pop' }, { lt: s.cue('להגיב'), type: 'pop' }, { lt: s.cue('מתיש'), type: 'pop' }, { lt: s.cue('יקר'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chNZ, mv = s.cue('תזוזה'), tired = s.cue('מתיש'), cost = s.cue('יקר');
      drawBG(ctx, s.t);
      const rev = lerp(14, 60, prog(lt, 0, d));
      stdChart(ch, lt, [[0, 0, 22], [d, 38, 60]], { p: [48.6, 51.4] });
      ch.draw(ctx, { reveal: rev });
      symIcon(ctx, ch, 'X');
      const L = ['BUY?', 'SELL?', 'EXIT?', 'ADD!', '!!'];
      if (lt > mv) NZX.forEach(([i, dir], k) => { if (i > rev - 0.5 || i < rev - 16) return; const age = clamp((rev - i) / 3); const y = ch.Y(dir > 0 ? NZC[i].h : NZC[i].l) + (dir > 0 ? -40 : 40); if (y < ch.p.y + 20 || y > ch.p.y + ch.p.h - 20) return;
        ctx.save(); ctx.globalAlpha = 1 - age * 0.6; popT(ctx, ch.X(i), y, clamp((rev - i) * 2), () => pill(ctx, L[k % 5], ch.X(i), y, { size: 22, color: dir > 0 ? '#d61f45' : '#0b8f63', fam: MONO, pad: 10, glow: 20 * (1 - age) })); ctx.restore(); });
      badge(ctx, 'כל תזוזה = תגובה', prog(lt, mv, mv + 0.35) * (1 - prog(lt, tired - 0.2, tired)), C.purple, 300, W / 2, 44);
      if (lt > tired && lt < cost - 0.2) { popT(ctx, W / 2, 300, prog(lt, tired, tired + 0.3), () => { glass(ctx, W / 2 - 230, 255, 460, 90, 45, { border: '#ff5a72', glowColor: C.down });
          text(ctx, 'מתיש', W / 2 + 140, 301, { size: 42, weight: 900, color: '#ff5a72' });
          const f = 1 - 0.85 * prog(lt, tired, tired + 1.2); rrect(ctx, W / 2 - 190, 280, 240, 42, 8); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = f > 0.4 ? C.gold : '#ff3355'; ctx.fillRect(W / 2 - 185, 285, 230 * f, 32); ctx.fillStyle = '#fff'; ctx.fillRect(W / 2 + 52, 292, 8, 18); }); }
      if (lt > cost - 0.2) { const pv = prog(lt, cost - 0.2, cost + 0.2), v = Math.round(lerp(380, 1240, prog(lt, cost - 0.2, cost + 0.6)) / 10) * 10;
        popT(ctx, W / 2, 300, pv, () => { glass(ctx, W / 2 - 220, 255, 440, 90, 45, { border: '#ff5a72', glowColor: C.down, fill: 'rgba(30,8,20,0.96)' }); text(ctx, 'P&L', W / 2 + 130, 301, { size: 30, weight: 800, color: C.axis }); text(ctx, '-$' + fmt(v), W / 2 - 40, 301, { size: 46, weight: 800, fam: MONO, color: '#ff5a72' }); });
        if (lt > cost) { hit(ctx, W / 2, 300, lt, cost, C.down, 260); flashCol(ctx, lt, cost); } }
    },
  },
  g2: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('אחת'), type: 'pop' }, { lt: s.cue('ארבעת'), type: 'pop' }, { lt: s.cue('לא'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, one = s.cue('אחת'), deal = s.cue('העסקה'), four = s.cue('ארבעת'), or = s.cue('לא');
      drawBG(ctx, s.t, { glow: 1.2 });
      headlines(ctx, lt, [{ t: 'שאלה אחת', at: one - 0.2, y: 400, size: 96, color: C.neon }]);
      popT(ctx, W / 2, 720, prog(lt, deal - 0.05, deal + 0.35), () => { glass(ctx, 90, 580, 900, 280, 40, { border: C.gold, glowColor: C.gold, glow: 50 });
        text(ctx, 'עובר את 4 העמודים?', W / 2, 720, { size: 78, weight: 900, glow: 30, glowColor: C.gold }); });
      PILLARS.forEach((pl, k) => { const x = lerp(840, 240, k / 3), p = prog(lt, four + k * 0.15, four + k * 0.15 + 0.35);
        popT(ctx, x, 1000, p, () => { ctx.save(); ctx.beginPath(); ctx.arc(x, 1000, 62, 0, Math.PI * 2); ctx.fillStyle = 'rgba(20,12,40,0.95)'; ctx.strokeStyle = PCOL[k]; ctx.lineWidth = 4; ctx.shadowColor = PCOL[k]; ctx.shadowBlur = 25; ctx.fill(); ctx.stroke(); ctx.restore();
          pillarIcon(ctx, k, x, 1000, 0.7); text(ctx, pl.he, x, 1105, { size: 34, weight: 800, color: PCOL[k] }); }); });
      [['כן', 790, '#0b8f63'], ['לא', 290, '#d61f45']].forEach(([t, x, c], k) => popT(ctx, x, 1260, prog(lt, or - 0.3 + k * 0.15, or + k * 0.15), () => pill(ctx, t, x, 1260, { size: 60, color: c, glow: 40, pad: 50 })));
    },
  },
  g3: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('כלום'), type: 'pop' }, { lt: s.cue('כן'), type: 'pop' }, { lt: s.cue('ולמה'), type: 'pop' }, { lt: s.cue('קנייה') + 0.1, type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, no = s.cue('לא'), nothing = s.cue('כלום'), yes = s.cue('כן'), exact = s.cue('בדיוק'), why = s.cue('ולמה'), buy = s.cue('קנייה');
      drawBG(ctx, s.t, { glow: 1.2 });
      const m = E.inOut(prog(lt, 0, 0.5));
      ctx.save(); ctx.globalAlpha = 1 - m; glass(ctx, 90, 580, 900, 280, 40, { border: C.gold, glowColor: C.gold, glow: 50 }); text(ctx, 'עובר את 4 העמודים?', W / 2, 720, { size: 78, weight: 900 }); ctx.restore();
      ctx.save(); ctx.globalAlpha = m; glass(ctx, 140, 290, 800, 130, 34, { border: C.gold, glowColor: C.gold }); text(ctx, 'עובר את 4 העמודים?', W / 2, 355, { size: 56, weight: 900 }); ctx.restore();
      const by = lerp(1260, 520, m);
      // NO branch (left)
      const pn = prog(lt, no - 0.05, no + 0.3);
      pill(ctx, 'לא', 290, by, { size: lerp(60, 50, m), color: '#d61f45', glow: 40 * (0.4 + pn), pad: 50 });
      const pz = prog(lt, nothing - 0.1, nothing + 0.3);
      if (pz > 0) { ctx.save(); ctx.globalAlpha = pz; glass(ctx, 60, 620, 460, 560, 30, { border: 'rgba(200,200,220,0.4)' });
        spark(ctx, [[0, 0.5], [1, 0.5]], 110, 760, 360, 100, '#9aa0b5', 1, 5);
        text(ctx, 'NO TRADE', 290, 690, { size: 40, weight: 800, fam: MONO, color: '#cfd3e6' });
        text(ctx, 'לא עושה', 290, 960, { size: 56, weight: 900, color: '#cfd3e6' }); text(ctx, 'כלום', 290, 1040, { size: 56, weight: 900, color: '#cfd3e6' });
        text(ctx, 'z z z', 290 + Math.sin(lt * 2) * 6, 1120, { size: 34, weight: 800, fam: MONO, color: C.axis }); ctx.restore(); }
      // YES branch (right): the plan
      const py = prog(lt, yes - 0.05, yes + 0.3);
      if (py > 0) { pill(ctx, 'כן', 790, by, { size: 50, color: '#0b8f63', glow: 50 * py, pad: 50 }); ring(ctx, 790, by, 200, prog(lt, yes, yes + 0.6), C.up); }
      else pill(ctx, 'כן', 790, by, { size: lerp(60, 50, m), color: '#0b8f63', glow: 10, pad: 50 });
      const pp = prog(lt, exact - 0.2, exact + 0.2);
      if (pp > 0) { ctx.save(); ctx.globalAlpha = pp; glass(ctx, 560, 620, 460, 560, 30, { border: '#3df2a6', glowColor: C.up });
        text(ctx, 'התוכנית', 980, 680, { size: 44, weight: 900, align: 'right', color: '#3df2a6' });
        [['כניסה', '50.00', '#fff'], ['ביטול', '48.00', C.gold], ['גודל', '50', '#3df2a6']].forEach(([h, v, c], k) => { const y = 780 + k * 90, p = prog(lt, exact + k * 0.2, exact + k * 0.2 + 0.3);
          text(ctx, h, 980, y, { size: 40, weight: 800, align: 'right', alpha: p }); text(ctx, v, 600, y, { size: 44, weight: 800, fam: MONO, align: 'left', color: c, alpha: p }); });
        const pw = prog(lt, why - 0.05, why + 0.3); text(ctx, 'למה:', 980, 1060, { size: 36, weight: 800, align: 'right', color: C.axis, alpha: pw }); text(ctx, '4/4 ✓', 600, 1060, { size: 40, weight: 800, fam: MONO, align: 'left', color: '#3df2a6', alpha: pw });
        ctx.restore(); }
      const pb = prog(lt, buy - 0.6, buy - 0.3);
      if (pb > 0) { const done = lt > buy + 0.1, k = done ? 1 + 0.06 * Math.exp(-(lt - buy - 0.1) * 6) : 1;
        popT(ctx, 790, 1260, pb, () => { ctx.save(); ctx.translate(790, 1260); ctx.scale(k, k); ctx.translate(-790, -1260); rrect(ctx, 610, 1210, 360, 100, 50); ctx.fillStyle = done ? '#0b8f63' : '#16c784'; ctx.shadowColor = C.up; ctx.shadowBlur = done ? 60 : 30; ctx.fill(); ctx.restore();
          text(ctx, 'BUY', 790, 1262, { size: 54, weight: 900, fam: MONO }); });
        const c = kf(lt, [[buy - 0.6, 980, 1500], [buy + 0.05, 820, 1275]]); if (lt < buy + 0.8) cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - buy - 0.1) * 12), 1.2);
        if (lt > buy + 0.1) ring(ctx, 790, 1260, 300, prog(lt, buy + 0.1, buy + 0.8), C.up); }
    },
  },

  // ================= CH6: TradingView =================
  ch6: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 6, 6, 'ב-TradingView', 'TRADINGVIEW', { cueWord: 'TradingView' }); } },
  t1: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('כלי') + 0.1, type: 'click' }, { lt: s.cue('הכניסה'), type: 'click' }, { lt: s.cue('האישור'), type: 'pop' }, { lt: s.cue('בדיוק'), type: 'pop' }, { lt: s.cue('הביטול'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRC, tool = s.cue('כלי'), ent = s.cue('הכניסה'), conf = s.cue('האישור'), stp = s.cue('והסטופ'), exact = s.cue('בדיוק'), inv = s.cue('הביטול');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(...kf(lt, [[0, 8, 36], [d, 10, 36]]), 45.4, 57.6);
      ch.hline(ctx, LV, 10, 36, { color: C.gold, width: lt > exact ? 6 : 3, dash: lt > exact ? null : [10, 8], glow: lt > exact ? 26 : 8 });
      ch.draw(ctx, { reveal: 23.98, tfs: ['1H', '4H', '1D'], highlight: i => i === 23 && lt > conf });
      symIcon(ctx, ch, 'X');
      const at = tvToolbar(ctx, 40, 466, 870, lt > tool ? 'pos' : null);
      const sl = kf(lt, [[stp, 49.2], [exact + 0.3, LV]])[0];
      positionBox(ctx, ch, 23, 36.4, ENT, sl, TGT, prog(lt, ent, ent + 0.7), { rr: lt > exact + 0.3 });
      if (lt > ent + 0.4) { const lw = t => measure(ctx, t, 20, 800, MONO) / 2 + 12, ts = `Stop: ${(ENT - sl).toFixed(2)} (${((ENT - sl) / ENT * 100).toFixed(2)}%) Qty: 50`, x = ch.X(36.4) - lw(ts), xt = ch.X(36.4) - lw('Target: 6.00 (12.00%)');
        popT(ctx, xt, ch.Y(TGT) - 30, prog(lt, ent + 0.4, ent + 0.7), () => pill(ctx, 'Target: 6.00 (12.00%)', xt, ch.Y(TGT) - 30, { size: 20, color: '#0b8f63', fam: MONO, glow: 10, pad: 12 }));
        popT(ctx, x, ch.Y(46.55), prog(lt, ent + 0.4, ent + 0.7), () => pill(ctx, ts, x, ch.Y(46.55), { size: 20, color: '#d61f45', fam: MONO, glow: 10, pad: 12 })); }
      if (lt > conf) popT(ctx, ch.X(20), ch.Y(51.3), prog(lt, conf, conf + 0.3), () => pill(ctx, '→ נר האישור', ch.X(20), ch.Y(51.3), { size: 26, color: '#0b8f63' }));
      if (lt > exact) ch.tag(ctx, 14, LV, 'נקודת ביטול', prog(lt, exact, exact + 0.3), { color: '#b8860b', above: false, size: 26, off: 36 });
      if (lt > inv) hit(ctx, ch.X(29), ch.Y(LV), lt, inv, C.gold, 180);
      const [px, py] = at('pos');
      const c = kf(lt, [[0, 700, 1150], [tool - 0.1, px, py], [tool + 0.3, px, py], [ent, ch.X(23), ch.Y(ENT)], [stp, ch.X(23), ch.Y(ENT)], [exact + 0.3, ch.X(26), ch.Y(LV)], [d, ch.X(26) + 8, ch.Y(LV) + 6]]);
      cursor(ctx, c[0], c[1], Math.max(Math.exp(-Math.abs(lt - tool - 0.1) * 14), Math.exp(-Math.abs(lt - ent) * 14)), 1.1);
      popT(ctx, W / 2, 300, prog(lt, tool, tool + 0.35), () => pill(ctx, 'Long Position', W / 2, 300, { size: 50, color: C.purple, glow: 40, fam: MONO }));
    },
  },
  t2: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('ובלוח') + 0.1, type: 'click' }, { lt: s.cue('דוחות'), type: 'pop' }, { lt: s.cue('מדד'), type: 'pop' }, { lt: s.cue('הפד'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, open = s.cue('ובלוח'), chk = s.cue('בודקים'), er = s.cue('דוחות'), cpi = s.cue('מדד'), fed = s.cue('הפד');
      drawBG(ctx, s.t);
      ctx.save(); ctx.globalAlpha = 0.5; ch_bg(ctx, lt, d); ctx.restore();
      const pd = prog(lt, open, open + 0.35); if (pd <= 0) return;
      ctx.save(); ctx.globalAlpha = pd; const dy = (1 - E.outCubic(pd)) * 60;
      ctx.translate(0, dy);
      glass(ctx, 70, 400, 940, 800, 26, { fill: 'rgba(20,14,38,0.98)' });
      text(ctx, 'Economic Calendar', 110, 460, { size: 38, weight: 800, align: 'left' });
      [['Economic', true], ['Earnings', false], ['Dividends', false]].forEach(([t, on], k) => { const x = 110 + k * 200; rrect(ctx, x, 505, 180, 52, 12); ctx.fillStyle = on ? 'rgba(168,85,247,0.45)' : '#141026'; ctx.fill(); text(ctx, t, x + 90, 532, { size: 24, weight: 700, fam: MONO, color: on ? '#fff' : C.axis }); });
      text(ctx, 'TOMORROW', 110, 605, { size: 24, weight: 800, fam: MONO, align: 'left', color: C.axis, spacing: 3 });
      const rows = [['08:30', 'US', 'Initial Jobless Claims', 1, null], ['08:30', 'US', 'CPI (YoY)', 3, cpi], ['10:30', 'US', 'Crude Oil Inventories', 1, null], ['14:00', 'US', 'Fed Chair Speech', 3, fed], ['AMC', 'XYZ', 'Earnings Release', 3, er]];
      rows.forEach(([tm, cc, ev, imp, t0], k) => { const y = 670 + k * 100, pr = prog(lt, open + 0.2 + k * 0.1, open + 0.5 + k * 0.1); if (pr <= 0) return;
        const hot = t0 !== null && lt > t0 - 0.05, ph = t0 !== null ? prog(lt, t0 - 0.05, t0 + 0.25) : 0;
        ctx.save(); ctx.globalAlpha *= pr * (t0 === null && lt > er ? 0.45 : 1);
        if (hot) { rrect(ctx, 90, y - 42, 900, 84, 14); ctx.fillStyle = `rgba(255,201,77,${0.18 * ph})`; ctx.fill(); ctx.strokeStyle = `rgba(255,201,77,${0.8 * ph})`; ctx.lineWidth = 3; ctx.stroke(); }
        text(ctx, tm, 110, y, { size: 28, weight: 700, fam: MONO, align: 'left', color: C.axis });
        rrect(ctx, 225, y - 20, 70, 40, 8); ctx.fillStyle = '#2a2350'; ctx.fill(); text(ctx, cc, 260, y + 1, { size: 20, weight: 800, fam: MONO });
        text(ctx, ev, 320, y, { size: 30, weight: 700, align: 'left', color: hot ? '#fff' : '#ddd' });
        for (let b = 0; b < 3; b++) { ctx.fillStyle = b < imp ? (imp === 3 ? '#ff5a72' : C.gold) : 'rgba(255,255,255,0.15)'; ctx.fillRect(900 + b * 22, y + 12 - (b + 1) * 9, 14, (b + 1) * 9); }
        ctx.restore(); });
      // scan line while "checking"
      if (lt > chk && lt < er) { const sy = lerp(630, 1110, ((lt - chk) / 0.8) % 1); ctx.fillStyle = 'rgba(168,85,247,0.25)'; ctx.fillRect(90, sy - 3, 900, 6); }
      ctx.restore();
      const c = kf(lt, [[0, 900, 1300], [open, 960, 420], [er, 960, 1110], [d, 960, 1110]]); if (lt < open + 0.6) cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - open - 0.1) * 14), 1.1);
      badge(ctx, 'אירוע קרוב? · חצי גודל', prog(lt, fed + 0.2, fed + 0.5), '#b8860b', 1270, W / 2, 38);
    },
  },
  t3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מפה'), type: 'click' }, { lt: s.cue('אישור'), type: 'click' }, { lt: s.cue('ביטול'), type: 'click' }, { lt: s.cue('הקשר'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, before = s.cue('ולפני'), list = s.cue('הצ\'קליסט');
      const ts = [s.cue('מפה'), s.cue('אישור'), s.cue('ביטול'), s.cue('הקשר')];
      drawBG(ctx, s.t);
      const pc = prog(lt, 0, 0.35);
      ctx.save(); ctx.globalAlpha = pc; glass(ctx, 110, 400, 860, 830, 34, { fill: 'rgba(16,11,32,0.95)' }); ctx.restore();
      text(ctx, 'CHECKLIST', W / 2, 455, { size: 28, weight: 800, color: C.purple2, spacing: 8, alpha: prog(lt, list - 0.1, list + 0.3) });
      wipeText(ctx, 'לפני כל עסקה', W / 2, 525, prog(lt, before, before + 0.4), { size: 58, weight: 900 });
      [['מפה', 'רמות שהוכיחו את עצמן'], ['אישור', 'מה המחיר עשה ברמה'], ['ביטול', 'איפה אני טועה'], ['הקשר', 'שוק · מתיחות · אירועים']].forEach(([h, sub], k) => {
        const y = 660 + k * 150, pr = prog(lt, list + k * 0.1, list + k * 0.1 + 0.3), on = lt > ts[k];
        ctx.save(); ctx.globalAlpha *= pr;
        rrect(ctx, 830, y - 36, 72, 72, 14); ctx.fillStyle = on ? PCOL[k] : '#0d0a19'; if (on) { ctx.shadowColor = PCOL[k]; ctx.shadowBlur = 30; } ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = PCOL[k]; ctx.stroke();
        if (on) popT(ctx, 866, y, prog(lt, ts[k], ts[k] + 0.25), () => text(ctx, '✓', 866, y + 2, { size: 54, weight: 900, color: '#140a00' }));
        text(ctx, h, 790, y - 16, { size: 54, weight: 900, align: 'right', color: on ? '#fff' : 'rgba(255,255,255,0.6)' });
        text(ctx, sub, 790, y + 36, { size: 30, weight: 700, align: 'right', color: on ? PCOL[k] : C.axis });
        pillarIcon(ctx, k, 220, y, 0.75, on ? 1 : 0.35);
        ctx.restore(); });
      if (lt > ts[3]) hit(ctx, 866, 1110, lt, ts[3], C.teal, 200);
      badge(ctx, 'מוכן לעסקה ✓', prog(lt, ts[3] + 0.3, ts[3] + 0.6), '#0b8f63', 1300, W / 2, 40);
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('המפה'), type: 'pop' }, { lt: s.cue('האישור'), type: 'pop' }, { lt: s.cue('הביטול'), type: 'pop' }, { lt: s.cue('וההקשר'), type: 'pop' }],
    draw(ctx, s) {
      recap4(ctx, s, 'בוא נסכם את כל הסדרה', [
        ['המפה', 'אומרת איפה', s.cue('המפה')],
        ['האישור', 'אומר מתי', s.cue('האישור')],
        ['הביטול', 'אומר איפה טעית', s.cue('הביטול')],
        ['ההקשר', 'אומר כמה', s.cue('וההקשר')],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('חצי'), type: 'pop' }, { lt: s.cue('בראש'), type: 'impact', k: 1 }, { lt: s.cue('כסף'), type: 'pop' }, { lt: s.cue('בסדרה'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, read = s.cue('לקרוא'), half = s.cue('חצי'), other = s.cue('החצי'), head = s.cue('בראש'), money = s.cue('כסף'), next = s.cue('בסדרה');
      drawBG(ctx, s.t, { glow: 1.35, rain: 1.4 });
      wipeText(ctx, 'לקרוא גרף', W / 2, 330, prog(lt, read, read + 0.35), { size: 72, weight: 900 });
      // half-full progress bar
      const pb = prog(lt, half - 0.1, half + 0.2);
      if (pb > 0) { ctx.save(); ctx.globalAlpha = pb; rrect(ctx, 190, 420, 700, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); ctx.strokeStyle = 'rgba(200,160,255,0.5)'; ctx.lineWidth = 2; ctx.stroke();
        const f = 0.5 * E.outCubic(prog(lt, half, half + 0.6)) + 0.5 * E.outCubic(prog(lt, other, other + 0.8));
        rrect(ctx, 890 - 700 * f, 420, 700 * f, 60, 30); const g = ctx.createLinearGradient(190, 0, 890, 0); g.addColorStop(0, C.gold); g.addColorStop(0.5, C.gold); g.addColorStop(0.5, C.purple); g.addColorStop(1, C.purple2); ctx.fillStyle = f > 0.5 ? g : C.purple; ctx.fill();
        text(ctx, Math.round(f * 100) + '%', W / 2, 452, { size: 34, weight: 800, fam: MONO }); ctx.restore(); }
      // the head
      const ph = prog(lt, head - 0.2, head + 0.4);
      if (ph > 0) { ctx.save(); ctx.globalAlpha = ph; ctx.translate(W / 2, 830); const sc = lerp(0.8, 1, E.outBack(ph)); ctx.scale(sc, sc);
        ctx.strokeStyle = C.purple2; ctx.lineWidth = 8; ctx.shadowColor = C.purple; ctx.shadowBlur = 40; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-90, 250); ctx.lineTo(-95, 150); ctx.bezierCurveTo(-200, 90, -210, -120, -60, -190); ctx.bezierCurveTo(60, -240, 200, -170, 190, -40);
        ctx.lineTo(240, 40); ctx.lineTo(200, 55); ctx.lineTo(205, 110); ctx.bezierCurveTo(205, 150, 150, 150, 110, 150); ctx.lineTo(105, 250); ctx.stroke();
        ctx.shadowBlur = 20; ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.beginPath();
        for (let k = 0; k <= 30; k++) { const u = k / 30, x = -130 + u * 260, y = -40 + Math.sin(u * 14 + lt * 6) * 40 * Math.sin(u * Math.PI); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
      if (lt > money) { const r = rng(4); for (let k = 0; k < 6; k++) { const a = r() * Math.PI * 2 + lt * 0.8, rr = 330 + r() * 40, x = W / 2 + Math.cos(a) * rr, y = 830 + Math.sin(a) * rr * 0.7;
        popT(ctx, x, y, prog(lt, money + k * 0.08, money + k * 0.08 + 0.3), () => pill(ctx, '$', x, y, { size: 36, color: '#0b8f63', fam: MONO, glow: 25 })); } }
      popT(ctx, W / 2, 1230, prog(lt, next - 0.1, next + 0.3), () => pill(ctx, 'הסדרה הבאה', W / 2, 1230, { size: 40, color: C.purple, glow: 40 }));
      wipeText(ctx, 'הצד של הראש · פסיכולוגיה', W / 2, 1340, prog(lt, next + 0.1, next + 0.5), { size: 60, weight: 900, color: C.gold, glow: 30, glowColor: C.gold });
      if (lt > next) ring(ctx, W / 2, 1230, 520, prog(lt, next, next + 0.7));
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};
// dimmed chart behind the calendar panel
function ch_bg(ctx, lt, d) { const ch = chRC; ch.layout(40, 370, 1000, 970).view(8, 36, 45.4, 57.6); ch.draw(ctx, { reveal: 23.98 }); symIcon(ctx, ch, 'X'); }

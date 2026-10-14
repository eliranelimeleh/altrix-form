// L5 — Equilibrium (premium / discount): the fifth and last confluence (continuation)
'use strict';
// ---------- data ----------
// uptrend: leg 11 (60600) -> 20 (64200), EQ 62400, HL at 27 (61900, discount), new HH at 38
const UQP = [[0, 59800], [7, 61800], [11, 60600], [20, 64200], [27, 61900], [38, 66000]];
const UQ = genCandles(UQP, { seed: 17, noise: 0.13 });
const chU = new Chart(UQ);
const PU = i => UQP.find(p => p[0] === i)[1];
const ULO = PU(11), UHI = PU(20), UEQ = (ULO + UHI) / 2;
// downtrend = mirror of the uptrend around 62,000: leg 11 (63400) -> 20 (59800), EQ 61600, LH at 27 (62100, premium)
const MIRR = 124000;
const DQ = genCandles(UQP, { seed: 23, noise: 0.13 }).map(q => ({ o: MIRR - q.o, c: MIRR - q.c, h: MIRR - q.l, l: MIRR - q.h }));
const chD = new Chart(DQ);
const PD = i => MIRR - PU(i);
const DHI = PD(11), DLO = PD(20), DEQ = (DHI + DLO) / 2;
// all five: equal lows swept at 24, impulse with BOS (above LH 10) and FVG 25..27, EQ 61300 -> 64300, retrace into FVG at 35
const KQP = [[0, 63500], [6, 61800], [10, 62800], [16, 61820], [20, 62500], [23, 61900], [31, 64300], [35, 62450], [46, 66000]];
const KQ = override(genCandles(KQP, { seed: 37, noise: 0.12 }), {
  24: { o: 61950, h: 62050, l: 61300, c: 61900 },
  25: { o: 61900, h: 62200, l: 61850, c: 62150 }, 26: { o: 62150, h: 63200, l: 62100, c: 63150 }, 27: { o: 63150, h: 63500, l: 62600, c: 63400 },
});
const chK = new Chart(KQ);
const PK = i => KQP.find(p => p[0] === i)[1];
const KG = [62200, 62600], KLO = 61300, KHI = PK(31), KEQ = (KLO + KHI) / 2;

// ---------- local helpers ----------
function flashCol(ctx, lt, t, col = '255,40,70', a = 0.25) { const f = Math.max(0, 1 - (lt - t) / 0.3); if (lt >= t && f > 0) { ctx.fillStyle = `rgba(${col},${a * f})`; ctx.fillRect(0, 0, W, H); } }
function hit(ctx, x, y, lt, t, col = C.gold, r = 220) { ring(ctx, x, y, r, prog(lt, t, t + 0.6), col); burst(ctx, x, y, prog(lt, t, t + 0.9), col, 26, Math.floor(t * 10) + 3, r * 1.1); }
// Gann-box style premium/discount box between two prices, from i0 to iEnd. o.prem / o.disc fade the halves in, o.line the 50% line
function eqBox(ctx, ch, i0, lo, hi, iEnd, o = {}) {
  const { p = 1, prem = 1, disc = 1, line = 1, labels = true, alpha = 1 } = o, mid = (lo + hi) / 2;
  if (p <= 0) return;
  ch.zone(ctx, mid, hi, i0, iEnd, { color: '#f23645', alpha: 0.2 * prem * alpha, progress: p });
  ch.zone(ctx, lo, mid, i0, iEnd, { color: '#16c784', alpha: 0.2 * disc * alpha, progress: p });
  ch.hline(ctx, mid, i0, iEnd, { color: C.gold, width: 5, dash: [14, 10], progress: p * line, glow: 20 });
  if (!labels) return;
  const x = ch.X(iEnd) - 20;
  text(ctx, 'PREMIUM', x, ch.Y(lerp(mid, hi, 0.5)), { size: 30, weight: 900, color: '#ff7b8f', align: 'right', alpha: prem * clamp(p * 2 - 1) * alpha, spacing: 3, stroke: 6 });
  text(ctx, 'DISCOUNT', x, ch.Y(lerp(lo, mid, 0.5)), { size: 30, weight: 900, color: '#3df2a6', align: 'right', alpha: disc * clamp(p * 2 - 1) * alpha, spacing: 3, stroke: 6 });
  text(ctx, '50%', ch.X(i0) + 14, ch.Y(mid) - 22, { size: 26, weight: 800, fam: MONO, color: C.gold, align: 'left', alpha: line * clamp(p * 2 - 1) * alpha, stroke: 6 });
}
function priceTag(ctx, x, y, label, price, col, p, strike = false) {
  popT(ctx, x, y, p, () => {
    glass(ctx, x - 190, y - 80, 380, 160, 26, { border: col, glowColor: col });
    text(ctx, label, x, y - 32, { size: 36, weight: 900, color: col });
    text(ctx, price, x, y + 30, { size: 56, weight: 800, fam: MONO, color: '#fff' });
    if (strike) { ctx.save(); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 120, y + 34); ctx.lineTo(x + 120, y + 26); ctx.stroke(); ctx.restore(); }
  });
}

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('מלא'), type: 'pop' }, { lt: s.cue('מבצע'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, full = s.cue('מלא'), sale = s.cue('מבצע');
      drawBG(ctx, s.t);
      // TV icon
      const pt = prog(lt, 0, 0.4);
      popT(ctx, W / 2, 640, pt, () => { ctx.save(); rrect(ctx, W / 2 - 260, 470, 520, 320, 24); ctx.fillStyle = '#0d0b17'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = C.purple2; ctx.shadowColor = C.purple; ctx.shadowBlur = 40; ctx.stroke(); ctx.restore();
        ctx.save(); ctx.fillStyle = C.purple2; ctx.fillRect(W / 2 - 80, 800, 160, 14); ctx.fillRect(W / 2 - 14, 790, 28, 20); ctx.restore(); text(ctx, '4K', W / 2, 630, { size: 120, weight: 900, color: C.neon, glow: 30, glowColor: C.purple }); });
      priceTag(ctx, W / 2 + 0, 1010, 'מחיר מלא', '$2,000', '#ff5a72', prog(lt, full - 0.1, full + 0.3), lt > sale);
      if (lt > sale) { priceTag(ctx, W / 2, 1230, 'בעוד שבוע · מבצע', '$1,200', '#3df2a6', prog(lt, sale, sale + 0.3)); hit(ctx, W / 2, 1230, lt, sale, C.up, 300); }
      wipeText(ctx, 'מי קונה במחיר מלא?', W / 2, 300, prog(lt, 0.1, 0.45), { size: 70, weight: 900 });
    },
  },
  hook2: {
    trans: 'whip', captions: false,
    events: s => [{ lt: s.cue('בשיא'), type: 'impact', k: 1.2 }, { lt: s.cue('יקר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, top = s.cue('בשיא'), exp = s.cue('יקר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 30], [d, 8, 30]], { p: [59800, 64900] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 18], [top, 20.9], [d, 25]], E.lin)[0] });
      if (lt > top) { const r = rng(3); for (let k = 0; k < 7; k++) { const x = ch.X(19 + r() * 3), y = ch.Y(63800 + r() * 500) - 30; popT(ctx, x, y, prog(lt, top + k * 0.06, top + k * 0.06 + 0.3), () => pill(ctx, 'BUY', x, y, { size: 22, color: '#555', pad: 10 })); } hit(ctx, ch.X(20), ch.Y(UHI), lt, top, '#ff5a72', 220); }
      if (lt > exp) cross(ctx, ch.X(23), ch.Y(UHI) - 40, 30, prog(lt, exp, exp + 0.3));
      wipeText(ctx, 'רובם קונים בשיא', W / 2, 300, prog(lt, top - 0.1, top + 0.25), { size: 76, weight: 900, color: '#ff5a72' });
    },
  },
  hook3: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('קו'), type: 'riser' }, { lt: s.cue('המבצע'), type: 'impact', k: 1.2 }, { lt: s.cue('בשנייה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, line = s.cue('קו'), sale = s.cue('המבצע'), sec = s.cue('בשנייה');
      drawBG(ctx, s.t, { hue: 20 });
      stdChart(ch, lt, [[0, 6, 30], [d, 8, 32]], { p: [59800, 64900] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 25], [sale, 27.9], [d, 30]], E.lin)[0] });
      eqBox(ctx, ch, 11, ULO, UHI, 32, { p: prog(lt, line - 0.1, line + 0.6), disc: prog(lt, sale - 0.2, sale + 0.2) });
      if (lt > sale) hit(ctx, ch.X(27), ch.Y(PU(27)), lt, sale, C.up, 200);
      wipeText(ctx, 'הקו שמראה איפה מתחיל המבצע', W / 2, 300, prog(lt, line - 0.2, line + 0.2), { size: 58, weight: 900, color: C.gold });
      popT(ctx, W / 2, 1255, prog(lt, sec, sec + 0.35), () => pill(ctx, 'תשרטט אותו בשנייה', W / 2, 1255, { size: 42, color: C.purple, glow: 40 }));
    },
  },
  intro: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('החמישי'), type: 'pop' }, { lt: s.cue('Equilibrium'), type: 'impact', k: 1.1 }, { lt: s.cue('המשך'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, five = s.cue('החמישי'), eq = s.cue('Equilibrium'), cont = s.cue('המשך');
      drawBG(ctx, s.t, { glow: 1.25 });
      wipeText(ctx, 'קונפלואנס 5 מתוך 5', W / 2, 300, prog(lt, five - 0.05, five + 0.35), { size: 62, weight: 900, color: C.neon });
      seriesMap(ctx, lt, 4, five, 1120, { done: 4 });
      confluenceCard(ctx, lt, eq, { he: 'שיווי משקל', en: 'EQUILIBRIUM', type: 'continuation', uses: ['זול / יקר', 'אזור כניסה'], y: 430, tType: cont - 0.1, tUses: [cont + 0.3, cont + 0.6] });
    },
  },

  // ================= CH1: what =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 6, 'מה זה Equilibrium?', 'PREMIUM VS DISCOUNT', { cueWord: 'מה' }); } },
  q1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('האחרון'), type: 'pop' }, { lt: s.cue('האחרון', 1), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, a = s.cue('האחרון'), b = s.cue('האחרון', 1);
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 26], [d, 6, 26]], { p: [59800, 64900] });
      ch.draw(ctx, { reveal: 20.9, dim: 0.3 });
      ch.dot(ctx, 11, ULO, prog(lt, a - 0.1, a + 0.2), '#3df2a6', 15); ch.tag(ctx, 11, ULO, 'שפל', prog(lt, a, a + 0.3), { color: '#0b8f63', above: false, size: 28, off: 44 });
      ch.dot(ctx, 20, UHI, prog(lt, b - 0.1, b + 0.2), '#ff5a72', 15); ch.tag(ctx, 20, UHI, 'שיא', prog(lt, b, b + 0.3), { color: '#d61f45', size: 28, off: 44 });
      ch.zigzag(ctx, [[11, ULO], [20, UHI]], prog(lt, a, b + 0.3), { color: C.purple2, width: 6, dots: false });
      badge(ctx, 'תנועה אחת', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 44);
    },
  },
  q2: {
    trans: 'none',
    events: s => [{ lt: s.cue('באמצע'), type: 'impact', k: 1 }, { lt: s.cue('Equilibrium'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, mid = s.cue('באמצע'), eq = s.cue('Equilibrium');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 26], [d, 7, 26]], { p: [59800, 64900] });
      ch.draw(ctx, { reveal: 20.9, dim: 0.35 });
      ch.zigzag(ctx, [[11, ULO], [20, UHI]], 1, { color: C.purple2, width: 6, dots: true });
      // cut in half
      const pc = prog(lt, mid - 0.1, mid + 0.5);
      ch.hline(ctx, UEQ, 11, 26, { color: C.gold, width: 6, dash: [14, 10], progress: pc, glow: 24 });
      if (lt > mid) hit(ctx, ch.X(15.5), ch.Y(UEQ), lt, mid, C.gold, 200);
      text(ctx, '50%', ch.X(23), ch.Y(UEQ) - 30, { size: 40, weight: 800, fam: MONO, color: C.gold, alpha: prog(lt, mid, mid + 0.3), stroke: 8 });
      popT(ctx, W / 2, 300, prog(lt, eq, eq + 0.35), () => pill(ctx, 'EQUILIBRIUM · שיווי משקל', W / 2, 300, { size: 44, color: '#b8860b', glow: 45 }));
    },
  },
  q3: {
    trans: 'none',
    events: s => [{ lt: s.cue('Premium'), type: 'pop' }, { lt: s.cue('Discount'), type: 'pop' }, { lt: s.cue('בהנחה'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, pr = s.cue('Premium'), ds = s.cue('Discount');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 7, 26], [d, 8, 26]], { p: [59800, 64900] });
      ch.draw(ctx, { reveal: 20.9, dim: 0.35 });
      eqBox(ctx, ch, 11, ULO, UHI, 26, { prem: prog(lt, pr - 0.2, pr + 0.3), disc: prog(lt, ds - 0.2, ds + 0.3) });
      popT(ctx, ch.X(14), ch.Y(lerp(UEQ, UHI, 0.5)), prog(lt, pr, pr + 0.3), () => pill(ctx, 'יקר', ch.X(14), ch.Y(lerp(UEQ, UHI, 0.5)), { size: 36, color: '#d61f45' }));
      popT(ctx, ch.X(14), ch.Y(lerp(ULO, UEQ, 0.5)), prog(lt, ds, ds + 0.3), () => pill(ctx, 'בהנחה', ch.X(14), ch.Y(lerp(ULO, UEQ, 0.5)), { size: 36, color: '#0b8f63' }));
    },
  },
  q4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('בהנחה'), type: 'pop' }, { lt: s.cue('ביוקר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, sup = s.cue('בסופר'), buy = s.cue('בהנחה'), sell = s.cue('ביוקר');
      drawBG(ctx, s.t, { glow: 1.2 });
      headlines(ctx, lt, [{ t: 'כמו בסופר', at: sup - 0.1, y: 420, size: 110 }]);
      const card = (y, h1, h2, col, ok, t) => popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 120, y - 120, 840, 240, 30, { border: col, glowColor: col }); text(ctx, h1, 880, y - 30, { size: 70, weight: 900, align: 'right' }); text(ctx, h2, 880, y + 50, { size: 40, weight: 800, color: col, align: 'right' }); check(ctx, 230, y, 50, 1, col); });
      card(720, 'קונים בהנחה', 'DISCOUNT · מתחת ל-50%', '#16c784', true, buy);
      card(1030, 'מוכרים ביוקר', 'PREMIUM · מעל 50%', '#f23645', true, sell);
    },
  },
  q5: {
    trans: 'whip',
    events: s => [{ lt: s.cue('ביוקר'), type: 'pop' }, { lt: s.cue('וממלאים'), type: 'impact', k: 1 }, { lt: s.cue('הממוצע'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, inst = s.cue('מוסדות'), fill = s.cue('וממלאים'), avg = s.cue('הממוצע');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 7, 30], [d, 9, 32]], { p: [59800, 64900] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 21], [fill, 26], [d, 29]], E.lin)[0] });
      eqBox(ctx, ch, 11, ULO, UHI, 32, { alpha: 0.8 });
      if (lt > fill - 0.6) { const r = rng(44); for (let k = 0; k < 10; k++) { const x = ch.X(22 + r() * 7), y = ch.Y(ULO + 400 + r() * (UEQ - ULO - 600)); popT(ctx, x, y, prog(lt, fill - 0.6 + k * 0.08, fill - 0.3 + k * 0.08), () => pill(ctx, 'BUY', x, y, { size: 22, color: '#0b8f63', pad: 10, glow: 12 })); } }
      popT(ctx, W / 2, 300, prog(lt, inst, inst + 0.35), () => pill(ctx, 'מוסדות קונים בהנחה', W / 2, 300, { size: 46, color: '#0b8f63', glow: 40 }));
      if (lt > avg) { ch.hline(ctx, 61700, 21, 32, { color: '#fff', width: 3, dash: [6, 6], progress: prog(lt, avg, avg + 0.4) }); popT(ctx, ch.X(29), ch.Y(61700) + 40, prog(lt, avg, avg + 0.3), () => pill(ctx, 'מחיר ממוצע טוב יותר', ch.X(29), ch.Y(61700) + 40, { size: 26, color: '#0b8f63' })); }
    },
  },

  // ================= CH2: uptrend =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 6, 'במגמת עלייה', 'BUY IN DISCOUNT', { cueWord: 'במגמת' }); } },
  u1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('יותר'), type: 'pop' }, { lt: s.cue('Higher'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, seq = s.cue('שפל'), hh = s.cue('יותר'), hl = s.cue('Higher');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 26], [d, 2, 28]], { p: [59300, 64900] });
      ch.draw(ctx, { reveal: lerp(8, 20.9, prog(lt, 0, hh + 0.3)) });
      ch.zigzag(ctx, [[0, 59800], [7, PU(7)], [11, ULO], [20, UHI]], prog(lt, seq - 0.3, hh + 0.4), { color: '#3df2a6', width: 5 });
      ch.tag(ctx, 20, UHI, 'HH', prog(lt, hh, hh + 0.3), { color: '#0b8f63', size: 26, off: 40 });
      if (lt > hl) { text(ctx, '?', ch.X(25), ch.Y(62000), { size: 110, weight: 900, color: C.gold, glow: 30, alpha: prog(lt, hl, hl + 0.3) }); ch.tag(ctx, 25, 61400, 'HL ?', prog(lt, hl, hl + 0.3), { color: '#b8860b', above: false, size: 28, off: 40 }); }
    },
  },
  u2: {
    trans: 'none',
    events: s => [{ lt: s.cue('מותחים'), type: 'click' }, { lt: s.cue('התחתון'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, drag = s.cue('מותחים'), low = s.cue('התחתון');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 28], [d, 4, 30]], { p: [59300, 64900] });
      ch.draw(ctx, { reveal: 20.9 });
      const pd = prog(lt, drag, drag + 1.2), hi = lerp(ULO, UHI, E.outCubic(pd));
      if (pd > 0) { eqBox(ctx, ch, 11, ULO, hi, lerp(11, 30, pd), { labels: pd >= 1, disc: 1 - 0.6 * prog(lt, low - 0.3, low) * 0, prem: 1 - 0.7 * prog(lt, low, low + 0.3) });
        const c = [ch.X(lerp(11, 30, pd)), ch.Y(hi)]; if (pd < 1) cursor(ctx, c[0], c[1], 0.4, 1.1); }
      if (lt > low) ring(ctx, ch.X(22), ch.Y(lerp(ULO, UEQ, 0.5)), 200, prog(lt, low, low + 0.7), C.up);
      badge(ctx, 'מהשפל האחרון לשיא האחרון', prog(lt, drag, drag + 0.35), C.purple, 300, W / 2, 40);
    },
  },
  u3: {
    trans: 'none',
    events: s => [{ lt: s.cue('Discount'), type: 'impact', k: 1.1 }, { lt: s.cue('קנייה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, ds = s.cue('Discount'), buy = s.cue('קנייה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 30], [d, 6, 32]], { p: [59300, 64900] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 20.9], [ds, 25], [buy, 27.9], [d, 28.5]], E.lin)[0] });
      eqBox(ctx, ch, 11, ULO, UHI, 32, { prem: 0.35 });
      if (lt > ds) { const y = ch.Y(UEQ); ctx.save(); ctx.globalAlpha = 0.5 + 0.4 * Math.sin(lt * 8); ctx.fillStyle = 'rgba(22,199,132,0.25)'; ctx.fillRect(ch.p.x, y, ch.p.w, ch.Y(ULO) - y); ctx.restore(); }
      if (lt > buy) { hit(ctx, ch.X(27), ch.Y(PU(27)), lt, buy, C.up, 200); popT(ctx, ch.X(27) - 140, ch.Y(PU(27)) + 50, prog(lt, buy, buy + 0.3), () => pill(ctx, 'מחפשים קנייה', ch.X(27) - 140, ch.Y(PU(27)) + 50, { size: 28, color: '#0b8f63' })); }
    },
  },
  u4: {
    trans: 'none',
    events: s => [{ lt: s.cue('הקו'), type: 'pop' }, { lt: s.cue('ביוקר'), type: 'impact', k: 0.9 }, { lt: s.cue('שווה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, above = s.cue('הקו'), exp = s.cue('ביוקר'), worth = s.cue('שווה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 32], [d, 8, 32]], { p: [59300, 64900] });
      ch.draw(ctx, { reveal: 28.5, dim: 0.2 });
      eqBox(ctx, ch, 11, ULO, UHI, 32);
      const by = 63300, bx = ch.X(22);
      popT(ctx, bx, ch.Y(by), prog(lt, above, above + 0.3), () => pill(ctx, 'BUY', bx, ch.Y(by), { size: 30, color: '#555' }));
      cross(ctx, bx + 80, ch.Y(by), 26, prog(lt, exp, exp + 0.3));
      // risk bar: big stop distance from premium vs small from discount
      if (lt > worth - 0.4) { const pw = prog(lt, worth - 0.4, worth); ctx.save(); ctx.globalAlpha = pw; glass(ctx, 120, 1150, 840, 150, 24);
        text(ctx, 'סיכון מ-Premium', 900, 1195, { size: 30, weight: 800, align: 'right' }); ctx.fillStyle = '#f23645'; ctx.fillRect(160, 1180, 420 * pw, 26);
        text(ctx, 'סיכון מ-Discount', 900, 1260, { size: 30, weight: 800, align: 'right' }); ctx.fillStyle = '#16c784'; ctx.fillRect(160, 1245, 150 * pw, 26); ctx.restore(); }
      badge(ctx, 'קנייה מעל הקו = ביוקר', prog(lt, exp, exp + 0.35), '#d61f45', 300, W / 2, 42);
    },
  },
  u5: {
    trans: 'whip',
    events: s => [{ lt: s.cue('עצומות'), type: 'pop' }, { lt: s.cue('FVG'), type: 'pop' }, { lt: s.cue('סוויפ'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, closed = s.cue('עצומות'), sig = s.cue('לסימן'), fv = s.cue('FVG'), sw = s.cue('סוויפ');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 18, 40], [d, 20, 40]], { p: [60800, 64800] });
      ch.draw(ctx, { reveal: 35.9, dim: 0.2 });
      eqBox(ctx, ch, 24, KLO, KHI, 40, { alpha: 0.8 });
      if (lt > closed && lt < sig) cross(ctx, ch.X(33), ch.Y(62700), 30, prog(lt, closed, closed + 0.3));
      ch.zone(ctx, KG[0], KG[1], 24.6, 40, { color: C.gold, alpha: 0.35, progress: prog(lt, fv - 0.1, fv + 0.4), label: 'FVG' });
      ch.tag(ctx, 24, KLO, 'SWEEP', prog(lt, sw, sw + 0.3), { color: C.purple, above: false, size: 26, off: 44 });
      badge(ctx, 'מחכים גם לסימן בתוך האזור', prog(lt, sig, sig + 0.35), C.purple, 300, W / 2, 40);
    },
  },

  // ================= CH3: downtrend =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 6, 'במגמת ירידה', 'SELL IN PREMIUM', { cueWord: 'במגמת' }); } },
  r1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('יותר'), type: 'pop' }, { lt: s.cue('Lower'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, seq = s.cue('שיא'), ll = s.cue('יותר'), lh = s.cue('Lower');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 26], [d, 2, 28]], { p: [59100, 64700] });
      ch.draw(ctx, { reveal: lerp(8, 20.9, prog(lt, 0, ll + 0.3)) });
      ch.zigzag(ctx, [[0, PD(0)], [7, PD(7)], [11, DHI], [20, DLO]], prog(lt, seq - 0.3, ll + 0.4), { color: '#ff7b8f', width: 5 });
      ch.tag(ctx, 20, DLO, 'LL', prog(lt, ll, ll + 0.3), { color: '#d61f45', above: false, size: 26, off: 40 });
      if (lt > lh) { text(ctx, '?', ch.X(25), ch.Y(62000), { size: 110, weight: 900, color: C.gold, glow: 30, alpha: prog(lt, lh, lh + 0.3) }); ch.tag(ctx, 25, 62600, 'LH ?', prog(lt, lh, lh + 0.3), { color: '#b8860b', size: 28, off: 40 }); }
    },
  },
  r2: {
    trans: 'none',
    events: s => [{ lt: s.cue('מותחים'), type: 'click' }, { lt: s.cue('Premium'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, drag = s.cue('מותחים'), pr = s.cue('Premium');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 28], [d, 4, 30]], { p: [59100, 64700] });
      ch.draw(ctx, { reveal: 20.9 });
      const pd = prog(lt, drag, drag + 1.2), lo = lerp(DHI, DLO, E.outCubic(pd));
      if (pd > 0) { eqBox(ctx, ch, 11, Math.min(lo, DHI), Math.max(lo, DHI), lerp(11, 30, pd), { labels: pd >= 1, disc: 1 - 0.7 * prog(lt, pr, pr + 0.3) }); if (pd < 1) cursor(ctx, ch.X(lerp(11, 30, pd)), ch.Y(lo), 0.4, 1.1); }
      if (lt > pr) ring(ctx, ch.X(22), ch.Y(lerp(DEQ, DHI, 0.5)), 200, prog(lt, pr, pr + 0.7), C.down);
      badge(ctx, 'מהשיא האחרון לשפל האחרון', prog(lt, drag, drag + 0.35), C.purple, 300, W / 2, 40);
    },
  },
  r3: {
    trans: 'none',
    events: s => [{ lt: s.cue('נעצר'), type: 'tick' }, { lt: s.cue('בשורט'), type: 'impact', k: 1.1 }, { lt: s.cue('ביוקר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, up = s.cue('מטפס'), stop = s.cue('נעצר'), sh = s.cue('בשורט');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 30], [d, 6, 32]], { p: [59100, 64700] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 20.9], [stop, 27], [sh, 28.5], [d, 29.5]], E.lin)[0] });
      eqBox(ctx, ch, 11, DLO, DHI, 32, { disc: 0.35 });
      if (lt > sh) { hit(ctx, ch.X(27), ch.Y(PD(27)), lt, sh, C.down, 200); popT(ctx, ch.X(27) - 140, ch.Y(PD(27)) - 50, prog(lt, sh, sh + 0.3), () => pill(ctx, 'SHORT ביוקר', ch.X(27) - 140, ch.Y(PD(27)) - 50, { size: 28, color: '#d61f45' })); }
      badge(ctx, 'מעל 50% = Premium', prog(lt, up, up + 0.35), '#d61f45', 300, W / 2, 42);
    },
  },
  r4: {
    trans: 'none',
    events: s => [{ lt: s.cue('והיעד'), type: 'pop' }, { lt: s.cue('הנזילות'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, tg = s.cue('והיעד'), lq = s.cue('הנזילות'), first = s.cue('הראשון');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 32], [d, 8, 39]], { p: [57400, 64700] });
      ch.draw(ctx, { reveal: lerp(29.5, 38.9, prog(lt, tg, d - 0.2)) });
      eqBox(ctx, ch, 11, DLO, DHI, 39, { alpha: 0.6, labels: false });
      ch.hline(ctx, DLO, 20, 39, { color: '#3df2a6', width: 3, dash: [10, 8], progress: prog(lt, tg, tg + 0.5) });
      stopPills(ctx, ch, 20, DLO, false, prog(lt, lq - 0.3, lq + 0.4), 33);
      ch.tag(ctx, 20, DLO, 'יעד', prog(lt, tg, tg + 0.3), { color: '#0b8f63', above: true, size: 28, off: 40 });
      popT(ctx, W / 2, 300, prog(lt, first, first + 0.35), () => pill(ctx, '← מהסרטון הראשון: נזילות', W / 2, 300, { size: 40, color: '#3b1a78', fill: false }));
    },
  },
  r5: {
    trans: 'whip',
    events: s => [{ lt: s.cue('עמוק'), type: 'pop' }, { lt: s.cue('והסטופ'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, deep = s.cue('עמוק'), better = s.cue('טובה'), st = s.cue('והסטופ');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 32], [d, 10, 32]], { p: [59100, 64700] });
      ch.draw(ctx, { reveal: 29.5, dim: 0.2 });
      eqBox(ctx, ch, 11, DLO, DHI, 32);
      // depth meter inside premium
      const pm = prog(lt, deep - 0.2, better + 0.5);
      if (pm > 0) { const x = ch.X(30), y0 = ch.Y(DEQ), y1 = ch.Y(DHI), yy = lerp(y0, y1, E.outCubic(pm) * 0.85);
        ctx.save(); const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(255,201,77,0.3)'); g.addColorStop(1, 'rgba(242,54,69,0.95)'); ctx.fillStyle = g; ctx.fillRect(x - 16, yy, 32, y0 - yy); ctx.restore();
        text(ctx, 'עמוק = טוב יותר', x - 40, yy, { size: 28, weight: 900, color: '#ff7b8f', align: 'right', stroke: 6, alpha: pm }); }
      ch.hline(ctx, DHI + 150, 11, 32, { color: C.down, width: 4, progress: prog(lt, st, st + 0.4) });
      popT(ctx, ch.X(17), ch.Y(DHI + 150) - 34, prog(lt, st, st + 0.3), () => pill(ctx, 'סטופ: מעל השיא', ch.X(17), ch.Y(DHI + 150) - 34, { size: 28, color: '#d61f45' }));
      badge(ctx, 'טיפ', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 46);
    },
  },

  // ================= CH4: all five =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 6, 'כל החמישה ביחד', 'ONE TRADE · 5 CONFLUENCES', { cueWord: 'כל' }); } },
  k1: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('הסדרה'), type: 'riser' }, { lt: s.cue('אחת'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, ser = s.cue('הסדרה'), one = s.cue('אחת');
      drawBG(ctx, s.t, { glow: 1.3 });
      seriesMap(ctx, lt, 4, 0, 760, { done: 5 });
      // nodes converge into one
      const pc = prog(lt, one - 0.2, one + 0.4);
      if (pc > 0) { popT(ctx, W / 2, 1120, pc, () => { ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 1120, 110, 0, Math.PI * 2); ctx.fillStyle = C.purple; ctx.shadowColor = C.purple; ctx.shadowBlur = 60; ctx.fill(); ctx.restore(); text(ctx, '1', W / 2, 1110, { size: 90, weight: 900, fam: MONO }); text(ctx, 'עסקה', W / 2, 1180, { size: 34, weight: 900 }); });
        for (let k = 0; k < 5; k++) { const x = lerp(930, 150, k / 4); arrow(ctx, x, 830, lerp(x, W / 2, 0.7), 1020, pc, { color: 'rgba(192,132,252,0.7)', width: 5, head: 20, glow: 10 }); } }
      headlines(ctx, lt, [{ t: 'כל הסדרה · עסקה אחת', at: ser - 0.2, y: 420, size: 74, color: C.neon }]);
    },
  },
  k2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('סוויפ'), type: 'impact', k: 1.1 }, { lt: s.cue('BOS'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, sw = s.cue('סוויפ'), up = s.cue('חדה'), bos = s.cue('BOS');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 30], [d, 8, 34]], { p: [60800, 64800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 23.9], [sw, 24.98], [up, 26], [bos, 26.98], [d, 31.9]], E.lin)[0], highlight: i => (i === 24 && lt > sw) || (i === 26 && lt > bos) });
      ch.hline(ctx, 61810, 6, 34, { color: C.gold, width: 4 }); ch.tag(ctx, 11, 61810, 'EQL', 1, { color: '#b8860b', above: false, size: 24, off: 38 });
      ch.hline(ctx, PK(20), 20, 34, { color: lt > bos ? C.up : '#fff', width: 4, dash: lt > bos ? null : [10, 8] });
      if (lt > sw) { hit(ctx, ch.X(24), ch.Y(KLO), lt, sw, C.gold, 200); ch.tag(ctx, 24, KLO, '1 · SWEEP', prog(lt, sw, sw + 0.3), { color: C.purple, above: false, size: 26, off: 44 }); }
      if (lt > bos) { hit(ctx, ch.X(26), ch.Y(PK(20)), lt, bos, C.up, 200); ch.tag(ctx, 26, 63300, '2 · BOS', prog(lt, bos, bos + 0.3), { color: '#0b8f63', size: 26, off: 60 }); }
    },
  },
  k3: {
    trans: 'none',
    events: s => [{ lt: s.cue('FVG'), type: 'pop' }, { lt: s.cue('Equilibrium'), type: 'click' }, { lt: s.cue('החדש'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, fv = s.cue('FVG'), eq = s.cue('Equilibrium'), nw = s.cue('החדש');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 34], [d, 14, 38]], { p: [60800, 64800] });
      ch.draw(ctx, { reveal: 31.9 });
      ch.tag(ctx, 24, KLO, '1 · SWEEP', 1, { color: C.purple, above: false, size: 24, off: 44 }); ch.tag(ctx, 26, 63300, '2 · BOS', 1, { color: '#0b8f63', size: 24, off: 60 });
      ch.zone(ctx, KG[0], KG[1], 24.6, 38, { color: C.gold, alpha: 0.35, progress: prog(lt, fv - 0.1, fv + 0.4) });
      ch.tag(ctx, 29, KG[0], '3 · FVG', prog(lt, fv, fv + 0.3), { color: '#b8860b', above: false, size: 24, off: 40 });
      const pd = prog(lt, eq, nw + 0.3), hi = lerp(KLO, KHI, E.outCubic(pd));
      if (pd > 0) { eqBox(ctx, ch, 24, KLO, hi, lerp(24, 38, pd), { labels: pd >= 1, alpha: 0.85 }); if (pd < 1) cursor(ctx, ch.X(lerp(24, 38, pd)), ch.Y(hi), 0.4, 1.1); }
      popT(ctx, W / 2, 300, prog(lt, nw, nw + 0.35), () => pill(ctx, '4 · EQUILIBRIUM', W / 2, 300, { size: 46, color: '#b8860b', glow: 40 }));
    },
  },
  k4: {
    trans: 'none',
    events: s => [{ lt: s.cue('Discount'), type: 'pop' }, { lt: s.cue('מצוינת'), type: 'impact', k: 1.2 }, { lt: s.cue('אחד'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, ds = s.cue('Discount'), good = s.cue('מצוינת'), two = s.cue('אחד');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 38], [d, 16, 42]], { p: [60800, 65600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 31.9], [good, 35.98], [d, 38]], E.lin)[0] });
      eqBox(ctx, ch, 24, KLO, KHI, 42, { prem: 0.4 });
      ch.zone(ctx, KG[0], KG[1], 24.6, 42, { color: C.gold, alpha: 0.4 + 0.15 * Math.sin(lt * 7) * prog(lt, ds, ds + 0.3), progress: 1 });
      if (lt > good) { hit(ctx, ch.X(35), ch.Y(PK(35)), lt, good, C.up, 220); popT(ctx, ch.X(35) - 120, ch.Y(PK(35)) + 60, prog(lt, good, good + 0.3), () => pill(ctx, 'כניסה ✓', ch.X(35) - 120, ch.Y(PK(35)) + 60, { size: 30, color: '#0b8f63' })); }
      popT(ctx, W / 2, 300, prog(lt, two - 0.2, two + 0.2), () => pill(ctx, 'FVG בתוך DISCOUNT', W / 2, 300, { size: 48, color: '#0b8f63', glow: 45 }));
    },
  },
  k5: {
    trans: 'none',
    events: s => [{ lt: s.cue('IFVG'), type: 'impact', k: 1.1 }, { lt: s.cue('מבוטלת'), type: 'pop' }, { lt: s.cue('השני'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, cl = s.cue('נסגר'), iv = s.cue('IFVG'), off = s.cue('מבוטלת'), guard = s.cue('שומר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 16, 42], [d, 16, 42]], { p: [60800, 65600] });
      ch.draw(ctx, { reveal: 35.5, dim: 0.35 });
      eqBox(ctx, ch, 24, KLO, KHI, 42, { alpha: 0.5, labels: false });
      const inv = prog(lt, iv - 0.1, iv + 0.4);
      ch.zone(ctx, KG[0], KG[1], 24.6, 42, { color: inv > 0.5 ? '#ff5a72' : C.gold, alpha: 0.4, progress: 1 });
      // the alternative path: closing through the gap (ghost)
      ch.zigzag(ctx, [[35, PK(35)], [37, 61900], [40, 61200]], prog(lt, cl - 0.2, cl + 0.6), { color: 'rgba(255,90,114,0.9)', width: 6, dots: false });
      if (lt > iv) ch.tag(ctx, 37, 61900, 'IFVG', prog(lt, iv, iv + 0.3), { color: '#d61f45', above: false, size: 28, off: 44 });
      if (lt > off) popT(ctx, W / 2, 300, prog(lt, off, off + 0.3), () => pill(ctx, 'התוכנית מבוטלת ✗', W / 2, 300, { size: 46, color: '#d61f45', glow: 40 }));
      badge(ctx, 'כל קונפלואנס שומר על השני', prog(lt, guard, guard + 0.35), C.purple, 1270, W / 2, 38);
    },
  },

  // ================= CH5: TradingView =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 6, 'איך משרטטים', 'TRADINGVIEW', { cueWord: 'איך' }); } },
  t1: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Gann'), type: 'click' }, { lt: s.cue('מהשפל'), type: 'click' }, { lt: s.cue('השיא'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, tool = s.cue('Gann'), a = s.cue('מהשפל'), b = s.cue('השיא');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(4, 30, 59300, 64900);
      ch.draw(ctx, { reveal: 25, tfs: ['15m', '1H', '4H', '1D'] });
      const at = tvToolbar(ctx, 40, 466, 870, lt > tool - 0.2 ? 'fib' : null);
      // full gann box with all levels (messy)
      const pr = prog(lt, a, b + 0.3);
      if (pr > 0) { const x0 = ch.X(11), y0 = ch.Y(ULO), x1 = lerp(x0, ch.X(28), pr), y1 = lerp(y0, ch.Y(UHI), pr);
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.strokeRect(x0, Math.min(y0, y1), x1 - x0, Math.abs(y1 - y0));
        [0.25, 0.382, 0.5, 0.618, 0.75].forEach((r, k) => { const y = lerp(y0, y1, r); ctx.strokeStyle = ['#f23645', '#ff9800', '#4caf50', '#089981', '#2962ff'][k]; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); const x = lerp(x0, x1, r); ctx.beginPath(); ctx.moveTo(x, Math.min(y0, y1)); ctx.lineTo(x, Math.max(y0, y1)); ctx.stroke(); });
        ctx.restore(); }
      const [fx, fy] = at('fib'); const c = kf(lt, [[0, 700, 1100], [tool - 0.3, fx, fy], [tool, fx, fy], [a, ch.X(11), ch.Y(ULO)], [b + 0.3, ch.X(28), ch.Y(UHI)], [d, ch.X(28) + 10, ch.Y(UHI) + 10]]);
      cursor(ctx, c[0], c[1], Math.max(Math.exp(-Math.abs(lt - tool + 0.2) * 14), Math.exp(-Math.abs(lt - a) * 14)), 1.1);
      popT(ctx, W / 2, 300, prog(lt, tool, tool + 0.35), () => pill(ctx, 'Gann Box', W / 2, 300, { size: 50, color: C.purple, glow: 40 }));
    },
  },
  t2: {
    trans: 'none',
    events: s => [{ lt: s.cue('להגדרות'), type: 'click' }, { lt: s.cue('ומבטלים'), type: 'click' }, { lt: s.cue('וברור'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, set = s.cue('להגדרות'), off = s.cue('ומבטלים'), only = s.cue('משאירים'), clean = s.cue('וברור');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(4, 30, 59300, 64900);
      ch.draw(ctx, { reveal: 25, tfs: ['15m', '1H', '4H', '1D'] });
      tvToolbar(ctx, 40, 466, 870, 'fib');
      if (lt > clean - 0.3) eqBox(ctx, ch, 11, ULO, UHI, 28, { p: prog(lt, clean - 0.3, clean + 0.2) });
      const pd = prog(lt, set - 0.1, set + 0.25) * (1 - prog(lt, clean - 0.4, clean - 0.1));
      if (pd > 0) {
        ctx.save(); ctx.globalAlpha = pd; const bx = 170, by = 470, bw = 740, bh = 720;
        glass(ctx, bx, by, bw, bh, 26, { fill: 'rgba(22,16,40,0.97)' });
        text(ctx, 'Gann Box · Settings', bx + 40, by + 60, { size: 36, weight: 800, align: 'left' });
        const lv = ['0', '0.25', '0.382', '0.5', '0.618', '0.75', '1'];
        lv.forEach((l, k) => { const y = by + 140 + k * 80, keep = l === '0.5', unchecked = !keep && lt > off + k * 0.12;
          rrect(ctx, bx + 50, y - 22, 44, 44, 8); ctx.fillStyle = unchecked ? '#0d0a19' : C.purple; ctx.fill(); ctx.strokeStyle = C.purple2; ctx.lineWidth = 2; ctx.stroke();
          if (!unchecked) text(ctx, '✓', bx + 72, y + 2, { size: 30, weight: 900 });
          text(ctx, l, bx + 130, y, { size: 32, weight: 700, fam: MONO, align: 'left', color: keep && lt > only ? C.gold : unchecked ? 'rgba(255,255,255,0.35)' : '#fff' }); });
        ctx.restore();
        const k = Math.min(6, Math.floor(Math.max(0, lt - off) / 0.12)); const c = kf(lt, [[set, 700, 1300], [off, bx + 72, by + 140]]); cursor(ctx, lt > off ? bx + 80 : c[0], lt > off ? by + 140 + k * 80 + 6 : c[1], 0.3, 1.0);
      }
      badge(ctx, 'רק 50% · נקי וברור', prog(lt, clean, clean + 0.35), '#b8860b', 300, W / 2, 44);
    },
  },
  t3: {
    trans: 'none',
    events: s => [{ lt: s.cue('Fib'), type: 'click' }, { lt: s.cue('קו'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, fib = s.cue('Fib'), same = s.cue('קו');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(4, 30, 59300, 64900);
      ch.draw(ctx, { reveal: 25, tfs: ['15m', '1H', '4H', '1D'] });
      tvToolbar(ctx, 40, 466, 870, 'fib');
      eqBox(ctx, ch, 11, ULO, UHI, 28, { alpha: 0.35, labels: false });
      fibDraw(ctx, ch, 11, ULO, 20, UHI, 30, prog(lt, fib - 0.1, fib + 0.8), { hi: lt > same ? [0.5] : [] });
      popT(ctx, W / 2, 300, prog(lt, fib, fib + 0.35), () => pill(ctx, 'Fib Retracement · Alt+F', W / 2, 300, { size: 44, color: C.purple, glow: 40 }));
      if (lt > same) ring(ctx, ch.X(20), ch.Y(UEQ), 260, prog(lt, same, same + 0.7), C.gold);
    },
  },
  t4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('Bar'), type: 'click' }, { lt: s.cue('אחורה'), type: 'whoosh' }, { lt: s.cue('נעצר'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, bar = s.cue('Bar'), back = s.cue('אחורה'), stop = s.cue('נעצר');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970).view(4, 34, 59300, 66200);
      const rev = kf(lt, [[0, 25], [back, 25], [back + 0.4, 21], [stop, 27.95], [d, 31]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, tfs: ['15m', '1H', '4H', '1D'] });
      if (rev > 20.9) eqBox(ctx, ch, 11, ULO, UHI, 34, { alpha: 0.85 });
      // replay control bar
      const pb = prog(lt, bar - 0.1, bar + 0.3);
      if (pb > 0) { ctx.save(); ctx.globalAlpha = pb; glass(ctx, 200, 1190, 680, 110, 24, { fill: 'rgba(22,16,40,0.97)' });
        text(ctx, '⏮', 280, 1245, { size: 44 }); text(ctx, lt > back + 0.4 ? '❚❚' : '▶', 380, 1247, { size: 44, color: C.purple2 }); text(ctx, '⏭', 480, 1245, { size: 44 });
        text(ctx, 'Bar Replay', 830, 1245, { size: 36, weight: 800, align: 'right', color: C.neon }); ctx.restore(); }
      if (lt > stop) { hit(ctx, ch.X(27), ch.Y(PU(27)), lt, stop, C.up, 200); popT(ctx, ch.X(27) + 120, ch.Y(PU(27)) + 40, prog(lt, stop, stop + 0.3), () => pill(ctx, 'נעצר ב-Discount ✓', ch.X(27) + 120, ch.Y(PU(27)) + 40, { size: 28, color: '#0b8f63' })); }
    },
  },

  // ================= CH6: the common mistake =================
  ch6: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 6, 6, 'הטעות הנפוצה', 'WRONG LEG', { cueWord: 'הטעות' }); } },
  m1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('נכונה'), type: 'pop' }, { lt: s.cue('תמיד'), type: 'pop' }, { lt: s.cue('ישנה'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, wrong = s.cue('נכונה'), always = s.cue('תמיד'), old = s.cue('ישנה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [d, 0, 30]], { p: [59300, 64900] });
      ch.draw(ctx, { reveal: 25, dim: 0.2 });
      const pw = prog(lt, wrong - 0.2, wrong + 0.4) * (1 - prog(lt, always, always + 0.4));
      if (pw > 0) { eqBox(ctx, ch, 0, 59800, PU(7), 30, { alpha: pw, labels: false }); cross(ctx, ch.X(4), ch.Y(PU(7)) - 50, 28, pw); }
      const pr = prog(lt, always, always + 0.6);
      if (pr > 0) { eqBox(ctx, ch, 11, ULO, UHI, 30, { p: pr }); check(ctx, ch.X(20) + 60, ch.Y(UHI) - 40, 28, pr); }
      badge(ctx, 'מהשפל האחרון לשיא האחרון', prog(lt, always, always + 0.35), '#0b8f63', 300, W / 2, 40);
      if (lt > old) badge(ctx, 'לא מתנועה ישנה', prog(lt, old, old + 0.35), '#d61f45', 1270, W / 2, 38);
    },
  },
  m2: {
    trans: 'none',
    events: s => [{ lt: s.cue('חדש'), type: 'pop' }, { lt: s.cue('מחדש'), type: 'click' }, { lt: s.cue('המגמה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, nw = s.cue('חדש'), redo = s.cue('מחדש'), tr = s.cue('המגמה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [nw, 8, 39], [d, 8, 39]], { p: [59300, 66600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 25], [nw, 38.9]], E.lin)[0] });
      const old = 1 - prog(lt, redo, redo + 0.4);
      if (old > 0) eqBox(ctx, ch, 11, ULO, UHI, 39, { alpha: old, labels: false });
      const pr = prog(lt, redo, redo + 0.8);
      if (pr > 0) { const hi = lerp(PU(27), 66000, E.outCubic(pr)); eqBox(ctx, ch, 27, PU(27), hi, lerp(27, 39, pr), { labels: pr >= 1 }); }
      if (lt > nw) ch.tag(ctx, 38, 66000, 'HH חדש', prog(lt, nw, nw + 0.3), { color: '#0b8f63', size: 26, off: 40 });
      badge(ctx, 'ה-Equilibrium זז עם המגמה', prog(lt, tr, tr + 0.35), C.purple, 300, W / 2, 40);
    },
  },
  m3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('צדדי'), type: 'pop' }, { lt: s.cue('אמיתי'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, side = s.cue('צדדי'), real = s.cue('אמיתי');
      drawBG(ctx, s.t);
      // choppy sideways mini chart with random "midlines"
      const ch = chRange; ch.layout(...PANEL_STD); ch.view(0, 28, 61500, 62700);
      ch.draw(ctx, { reveal: 28 });
      const r = rng(5);
      for (let k = 0; k < 4; k++) { const p = 61850 + r() * 500, pk = prog(lt, side + k * 0.2, side + k * 0.2 + 0.4); ch.hline(ctx, p, 0, 28, { color: C.gold, width: 3, dash: [10, 8], progress: pk, alpha: 0.7 }); }
      if (lt > real) { cross(ctx, W / 2, 860, 60, prog(lt, real, real + 0.3)); }
      badge(ctx, 'שוק צדדי = אין אמצע אמיתי', prog(lt, side, side + 0.35), '#d61f45', 300, W / 2, 40);
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('האמצע'), type: 'pop' }, { lt: s.cue('זול'), type: 'pop' }, { lt: s.cue('קונים'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['Equilibrium', 'האמצע של התנועה · 50%', '#e0a100', s.cue('האמצע'), 'zz'],
        ['מתחת זול · מעל יקר', 'Discount · Premium', C.purple, s.cue('זול'), 'warn'],
        ['לפי כיוון המגמה', 'קונים בזול · מוכרים ביוקר', '#0fa36b', s.cue('קונים'), 'check'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('החמישה'), type: 'riser' }, { lt: s.cue('רמז'), type: 'pop' }, { lt: s.cue('תוכנית'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt } = s, all = s.cue('החמישה'), hint = s.cue('רמז'), plan = s.cue('תוכנית');
      drawBG(ctx, s.t, { glow: 1.4, rain: 1.6 });
      wipeText(ctx, 'יש לך את כל החמישה', W / 2, 360, prog(lt, all - 0.1, all + 0.3), { size: 76, weight: 900, color: C.neon });
      const names = ['נזילות', 'BOS', 'FVG', 'IFVG', 'Equilibrium'];
      const cues = [s.cue('נזילות'), s.cue('BOS'), s.cue('FVG'), s.cue('IFVG'), s.cue('Equilibrium')];
      names.forEach((n, k) => { const y = 520 + k * 120, p = prog(lt, cues[k] - 0.1, cues[k] + 0.25); popT(ctx, W / 2, y, p, () => { glass(ctx, 220, y - 48, 640, 96, 24); text(ctx, String(k + 1), 800, y + 2, { size: 44, weight: 900, fam: MONO, color: C.purple2 }); text(ctx, n, 740, y, { size: 46, weight: 900, align: 'right' }); check(ctx, 290, y, 26, 1); }); });
      if (lt > hint && lt < plan) text(ctx, 'כל אחד לבד = רמז', W / 2, 1180, { size: 52, weight: 900, color: C.gold, alpha: prog(lt, hint, hint + 0.3) });
      popT(ctx, W / 2, 1200, prog(lt, plan - 0.1, plan + 0.35), () => pill(ctx, 'ביחד = תוכנית מסחר', W / 2, 1200, { size: 56, color: '#0b8f63', glow: 55 }));
      if (lt > plan) { ring(ctx, W / 2, 1200, 560, prog(lt, plan, plan + 0.7), C.up); burst(ctx, W / 2, 1200, prog(lt, plan, plan + 1), C.up, 36, 9, 420); }
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};
// sideways range for the last mistake
const RNP = [[0, 62000], [4, 62400], [8, 61900], [12, 62350], [16, 61850], [20, 62450], [24, 61950], [28, 62300]];
const chRange = new Chart(genCandles(RNP, { seed: 6, noise: 0.35 }), { tf: '1H' });

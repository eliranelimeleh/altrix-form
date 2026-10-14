// L3 — Fair Value Gap: the third of the 5 confluences (continuation)
'use strict';
// ---------- data ----------
// anatomy: candles 11/12/13 form a bullish FVG 62300..62800, price returns to it at 19 then rallies
const ANP = [[0, 61200], [6, 61700], [10, 61950], [14, 63600], [19, 62560], [30, 64600]];
const ANC = override(genCandles(ANP, { seed: 3, noise: 0.14 }), {
  11: { o: 62000, h: 62300, l: 61950, c: 62200 },
  12: { o: 62200, h: 63300, l: 62150, c: 63200 },
  13: { o: 63200, h: 63600, l: 62800, c: 63500 },
  14: { o: 63500, h: 63650, l: 63300, c: 63350 }, 15: { o: 63350, h: 63420, l: 63100, c: 63150 }, 16: { o: 63150, h: 63220, l: 62950, c: 63000 },
  17: { o: 63000, h: 63080, l: 62820, c: 62880 }, 18: { o: 62880, h: 62950, l: 62650, c: 62700 }, 19: { o: 62700, h: 62780, l: 62480, c: 62600 },
  20: { o: 62600, h: 63000, l: 62580, c: 62950 }, 21: { o: 62950, h: 63320, l: 62900, c: 63250 }, 22: { o: 63250, h: 63500, l: 63150, c: 63450 },
});
const chA = new Chart(ANC);
const AG = [62300, 62800];
// uptrend with two FVGs, each HL forms inside the gap
const TRP = [[0, 60000], [7, 61800], [11, 61000], [18, 63000], [22, 61750], [29, 64300], [33, 62400], [42, 65200]];
const TRC = override(genCandles(TRP, { seed: 19, noise: 0.12 }), {
  13: { o: 61300, h: 61500, l: 61150, c: 61450 }, 14: { o: 61450, h: 62300, l: 61400, c: 62250 }, 15: { o: 62250, h: 62500, l: 61950, c: 62400 },
  24: { o: 62000, h: 62150, l: 61900, c: 62100 }, 25: { o: 62100, h: 63000, l: 62050, c: 62950 }, 26: { o: 62950, h: 63200, l: 62600, c: 63100 },
});
const chT = new Chart(TRC);
const G1 = [61500, 61950], G2 = [62150, 62600];
const PT = i => TRP.find(p => p[0] === i)[1];
// downtrend with a bearish FVG (12..14) and a counter-trend bullish FVG (18..20) that fails
const BRP = [[0, 66000], [6, 64300], [10, 65000], [17, 63000], [21, 64400], [30, 61500]];
const BRC = override(genCandles(BRP, { seed: 8, noise: 0.12 }), {
  12: { o: 64800, h: 64900, l: 64650, c: 64700 }, 13: { o: 64700, h: 64750, l: 63900, c: 63950 }, 14: { o: 63950, h: 64200, l: 63700, c: 63800 },
  18: { o: 63050, h: 63250, l: 62950, c: 63200 }, 19: { o: 63200, h: 63800, l: 63150, c: 63750 }, 20: { o: 63750, h: 64000, l: 63550, c: 63900 },
});
const chB = new Chart(BRC);
const BG = [64200, 64650];
const PB = i => BRP.find(p => p[0] === i)[1];
// liquidity sweep -> impulse with FVG (27..29) + BOS -> retrace into the gap -> rally
const CBP = [[0, 64000], [6, 62600], [10, 63400], [16, 62000], [20, 62800], [25, 62050], [30, 63900], [33, 62750], [44, 65200]];
const CBC = override(genCandles(CBP, { seed: 61, noise: 0.13 }), {
  26: { o: 62100, h: 62200, l: 61600, c: 62150 },
  27: { o: 62150, h: 62450, l: 62100, c: 62400 }, 28: { o: 62400, h: 63600, l: 62350, c: 63550 }, 29: { o: 63550, h: 63900, l: 63000, c: 63800 },
});
const chC = new Chart(CBC);
const CG = [62450, 63000];
const PC = i => CBP.find(p => p[0] === i)[1];
// choppy range with a tiny gap
const RGP = [[0, 62000], [4, 62300], [8, 61900], [12, 62350], [16, 61950], [20, 62300], [24, 62000], [28, 62250]];
const RGC = override(genCandles(RGP, { seed: 4, noise: 0.3 }), { 9: { o: 61950, h: 62020, l: 61900, c: 62000 }, 10: { o: 62000, h: 62140, l: 61990, c: 62120 }, 11: { o: 62120, h: 62200, l: 62050, c: 62150 } });
const chR = new Chart(RGC, { tf: '15m' });
// gap that gets closed through (teaser for IFVG)
const FBP = [[0, 61000], [6, 62000], [13, 63500], [22, 61000]];
const FBC = override(genCandles(FBP, { seed: 27, noise: 0.12 }), {
  8: { o: 62000, h: 62200, l: 61950, c: 62150 }, 9: { o: 62150, h: 63000, l: 62100, c: 62950 }, 10: { o: 62950, h: 63300, l: 62600, c: 63200 },
  17: { o: 62650, h: 62700, l: 62050, c: 62100 },
});
const chF = new Chart(FBC);

// ---------- local helpers ----------
function flashCol(ctx, lt, t, col = '255,40,70', a = 0.25) { const f = Math.max(0, 1 - (lt - t) / 0.3); if (lt >= t && f > 0) { ctx.fillStyle = `rgba(${col},${a * f})`; ctx.fillRect(0, 0, W, H); } }
function hit(ctx, x, y, lt, t, col = C.gold, r = 220) { ring(ctx, x, y, r, prog(lt, t, t + 0.6), col); burst(ctx, x, y, prog(lt, t, t + 0.9), col, 26, Math.floor(t * 10) + 3, r * 1.1); }
// FVG box from the first candle to iEnd, gold (bull) / pink (bear), with label
function fvg(ctx, ch, i0, g, iEnd, p, o = {}) {
  if (p <= 0) return;
  const { bear = false, label = 'FVG', alpha = 0.3, mid = false } = o, col = o.color || (bear ? '#ff5a72' : C.gold);
  ch.zone(ctx, g[0], g[1], i0 - 0.4, iEnd, { color: col, alpha: alpha * clamp(p * 2), progress: p });
  if (mid) ch.hline(ctx, (g[0] + g[1]) / 2, i0, iEnd, { color: col, width: 2.5, dash: [8, 8], progress: p, glow: 8 });
  if (label) { const x = Math.min(ch.X(iEnd) - 60, ch.X(i0 + 3) + 50); text(ctx, label, x, ch.Y((g[0] + g[1]) / 2), { size: 28, weight: 900, color: col, alpha: clamp(p * 2 - 0.5), stroke: 6 }); }
}
function bracket(ctx, x, y0, y1, side, col, p) { // vertical bracket next to a wick
  if (p <= 0) return; const dx = side * 26;
  ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.shadowColor = col; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.moveTo(x + dx * 0.5, y0); ctx.lineTo(x + dx, y0); ctx.lineTo(x + dx, y1); ctx.lineTo(x + dx * 0.5, y1); ctx.stroke(); ctx.restore();
}

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('הכניסה'), type: 'pop' }, { lt: s.cue('טס'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chC, miss = s.cue('הכניסה'), fly = s.cue('טס');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 34], [d, 16, 36]], { p: [61300, 64300] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 26.9], [fly, 28.5], [d, 30.9]], E.lin)[0] });
      popT(ctx, ch.X(26) - 60, ch.Y(61600) + 60, prog(lt, miss, miss + 0.3), () => pill(ctx, 'הכניסה שפספסת', ch.X(26) - 60, ch.Y(61600) + 60, { size: 28, color: '#555' }));
      cross(ctx, ch.X(26) + 100, ch.Y(61600) + 60, 24, prog(lt, miss + 0.2, miss + 0.5));
      arrow(ctx, ch.X(28) - 60, ch.Y(62600), ch.X(30) - 20, ch.Y(63900), prog(lt, fly, fly + 0.5), { color: C.up, width: 12, head: 44 });
      wipeText(ctx, 'פספסת את הכניסה?', W / 2, 300, prog(lt, 0, 0.35), { size: 74, weight: 900, color: '#ff5a72' });
    },
  },
  hook2: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('חור'), type: 'impact', k: 1.2 }, { lt: s.cue('חוזר'), type: 'whoosh' }, { lt: s.cue('שנייה'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chC, hole = s.cue('חור'), back = s.cue('חוזר'), sec = s.cue('שנייה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 16, 36], [d, 18, 44]], { p: [61300, 65400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 30.9], [back, 31.5], [sec, 33.6], [d, 38]], E.lin)[0], highlight: i => i >= 27 && i <= 29 && lt > hole });
      fvg(ctx, ch, 27, CG, 44, prog(lt, hole, hole + 0.5), { label: '' });
      if (lt > hole) hit(ctx, ch.X(28), ch.Y((CG[0] + CG[1]) / 2), lt, hole, C.gold, 200);
      if (lt > sec) { hit(ctx, ch.X(33), ch.Y(62750), lt, sec, C.up, 200); popT(ctx, ch.X(33) + 30, ch.Y(62750) + 80, prog(lt, sec, sec + 0.3), () => pill(ctx, 'כניסה שנייה ✓', ch.X(33) + 30, ch.Y(62750) + 80, { size: 30, color: '#0b8f63' })); }
      if (lt < back) wipeText(ctx, 'השוק משאיר חור', W / 2, 300, prog(lt, hole - 0.1, hole + 0.25), { size: 74, weight: 900, color: C.gold });
      else wipeText(ctx, 'וחוזר למלא אותו', W / 2, 300, prog(lt, back - 0.05, back + 0.25), { size: 74, weight: 900, color: '#3df2a6' });
    },
  },
  hook3: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('בשלוש'), type: 'impact', k: 1 }, { lt: s.cue('כסף'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chT, three = s.cue('בשלוש'), money = s.cue('כסף');
      drawBG(ctx, s.t, { hue: 20 });
      stdChart(ch, lt, [[0, 6, 42], [d, 8, 42]], { p: [59500, 65800] });
      ch.draw(ctx, { reveal: 42, dim: 0.4, highlight: i => lt > three && ((i >= 13 && i <= 15) || (i >= 24 && i <= 26)) });
      fvg(ctx, ch, 13, G1, 42, prog(lt, three, three + 0.5), { label: '' }); fvg(ctx, ch, 24, G2, 42, prog(lt, three + 0.2, three + 0.7), { label: '' });
      const secs = (3 - Math.min(3, Math.max(0, lt - three + 0.2) * 3)).toFixed(1);
      if (lt > three - 0.3) popT(ctx, 230, 540, prog(lt, three - 0.3, three), () => { glass(ctx, 130, 480, 200, 120, 24, { border: C.gold }); text(ctx, secs, 230, 542, { size: 60, weight: 800, fam: MONO, color: C.gold }); });
      wipeText(ctx, 'לזהות את החור ב-3 שניות', W / 2, 300, prog(lt, 0.1, 0.45), { size: 62, weight: 900, color: C.purple2 });
      popT(ctx, W / 2, 1255, prog(lt, money, money + 0.35), () => pill(ctx, 'ולדעת מתי הוא שווה כסף', W / 2, 1255, { size: 42, color: '#0b8f63', glow: 40 }));
    },
  },
  intro: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('השלישי'), type: 'pop' }, { lt: s.cue('Fair'), type: 'impact', k: 1.1 }, { lt: s.cue('המשך'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, third = s.cue('השלישי'), fv = s.cue('Fair'), not = s.cue('היפוך'), cont = s.cue('המשך');
      drawBG(ctx, s.t, { glow: 1.25 });
      wipeText(ctx, 'קונפלואנס 3 מתוך 5', W / 2, 300, prog(lt, third - 0.05, third + 0.35), { size: 62, weight: 900, color: C.neon });
      seriesMap(ctx, lt, 2, third, 1120, { done: 2 });
      confluenceCard(ctx, lt, fv, { he: 'פער ערך', en: 'FAIR VALUE GAP', type: 'continuation', uses: ['כניסה', 'כניסה שנייה'], y: 430, tType: cont - 0.1, tUses: [cont + 0.3, cont + 0.6] });
    },
  },

  // ================= CH1: what =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 6, 'מה זה Fair Value Gap?', 'THREE CANDLES', { cueWord: 'מה' }); } },
  f1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('ראשון'), type: 'pop' }, { lt: s.cue('אמצעי'), type: 'impact', k: 0.9 }, { lt: s.cue('שלישי'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, a = s.cue('ראשון'), b = s.cue('אמצעי'), c = s.cue('שלישי');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 9, 22], [d, 9, 18]], { p: [61600, 64000] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 10.9], [a, 11.98], [b, 12.98], [c, 14]], E.lin)[0], dim: 0.55, highlight: i => i >= 11 && i <= 13 });
      [[11, a, '1'], [12, b, '2'], [13, c, '3']].forEach(([i, t, n]) => { const p = prog(lt, t, t + 0.3); if (p <= 0) return; const x = ch.X(i), y = ch.Y(ANC[i].l) + 70;
        popT(ctx, x, y, p, () => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fillStyle = C.purple; ctx.shadowColor = C.purple; ctx.shadowBlur = 24; ctx.fill(); ctx.restore(); text(ctx, n, x, y + 2, { size: 36, weight: 900, fam: MONO }); }); });
      if (lt > b) hit(ctx, ch.X(12), ch.Y(62700), lt, b, C.up, 180);
      badge(ctx, 'שלושה נרות ברצף', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 44);
    },
  },
  f2: {
    trans: 'none',
    events: s => [{ lt: s.cue('העליון'), type: 'pop' }, { lt: s.cue('התחתון'), type: 'pop' }, { lt: s.cue('נוגעים'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, up = s.cue('העליון'), dn = s.cue('התחתון'), touch = s.cue('נוגעים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 7, 18], [d, 8, 17]], { p: [61700, 63800] });
      ch.draw(ctx, { reveal: 14, dim: 0.55, highlight: i => i >= 11 && i <= 13 });
      const p1 = prog(lt, up, up + 0.4), p3 = prog(lt, dn, dn + 0.4);
      ch.hline(ctx, AG[0], 10, 18, { color: C.gold, width: 3, dash: [8, 8], progress: p1 }); ch.dot(ctx, 11, AG[0], p1, C.gold, 11);
      ch.hline(ctx, AG[1], 10, 18, { color: '#3df2a6', width: 3, dash: [8, 8], progress: p3 }); ch.dot(ctx, 13, AG[1], p3, '#3df2a6', 11);
      popT(ctx, ch.X(11) - 120, ch.Y(AG[0]), p1, () => pill(ctx, 'פתיל עליון · נר 1', ch.X(11) - 120, ch.Y(AG[0]) + 40, { size: 26, color: '#b8860b' }));
      popT(ctx, ch.X(13) + 120, ch.Y(AG[1]), p3, () => pill(ctx, 'פתיל תחתון · נר 3', ch.X(13) + 120, ch.Y(AG[1]) - 40, { size: 26, color: '#0b8f63' }));
      if (lt > touch) { const x = ch.X(14.4), y0 = ch.Y(AG[1]), y1 = ch.Y(AG[0]); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.restore();
        arrow(ctx, x, (y0 + y1) / 2, x, y0 + 4, 1, { color: '#fff', width: 4, head: 18, glow: 0 }); arrow(ctx, x, (y0 + y1) / 2, x, y1 - 4, 1, { color: '#fff', width: 4, head: 18, glow: 0 }); }
      badge(ctx, 'הם לא נוגעים', prog(lt, touch, touch + 0.35), '#b8860b', 300, W / 2, 46);
    },
  },
  f3: {
    trans: 'none',
    events: s => [{ lt: s.cue('Fair'), type: 'impact', k: 1.2 }, { lt: s.cue('מהר'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, fv = s.cue('Fair'), fast = s.cue('מהר'), few = s.cue('נסחרו');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 17], [d, 6, 20]], { p: [61700, 63800] });
      ch.draw(ctx, { reveal: 14, dim: 0.4, highlight: i => i === 12 });
      fvg(ctx, ch, 11, AG, 20, prog(lt, fv - 0.1, fv + 0.5), { alpha: 0.35 });
      if (lt > fv) hit(ctx, ch.X(12), ch.Y(62550), lt, fv, C.gold, 220);
      // speed lines through the gap
      if (lt > fast) { const r = rng(9); for (let k = 0; k < 10; k++) { const ph = (lt * 2.2 + r()) % 1, x = ch.X(12) + (r() - 0.5) * 40, y = lerp(ch.Y(62200), ch.Y(63000), ph); ctx.save(); ctx.globalAlpha = 0.7 * Math.sin(ph * Math.PI); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(x, y); ctx.stroke(); ctx.restore(); } }
      popT(ctx, W / 2, 300, prog(lt, fv, fv + 0.35), () => pill(ctx, 'FAIR VALUE GAP', W / 2, 300, { size: 54, color: '#b8860b', glow: 50 }));
      badge(ctx, 'כמעט בלי פקודות', prog(lt, few, few + 0.35), C.purple, 1270, W / 2, 40);
    },
  },
  f4: {
    trans: 'none',
    events: s => [{ lt: s.cue('Imbalance'), type: 'pop' }, { lt: s.cue('לחזור'), type: 'whoosh' }, { lt: s.cue('ולאזן'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, imb = s.cue('Imbalance'), back = s.cue('לחזור'), bal = s.cue('ולאזן');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 20], [back, 6, 24], [d, 5, 30]], { p: [61400, 64900] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 14], [back, 15], [bal, 19.5], [d, 26]], E.lin)[0] });
      fvg(ctx, ch, 11, AG, 30, 1, { alpha: lt > bal ? 0.12 : 0.32, label: lt > bal ? 'מאוזן ✓' : 'FVG' });
      // scale icon (imbalance -> balance)
      const tilt = lerp(0.35, 0, E.outBack(prog(lt, bal, bal + 0.6))), cx = 830, cy = 520, pk = prog(lt, imb - 0.1, imb + 0.3);
      if (pk > 0) { ctx.save(); ctx.globalAlpha = pk; glass(ctx, cx - 140, cy - 90, 280, 190, 24); ctx.translate(cx, cy); ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, 60); ctx.stroke();
        ctx.rotate(tilt); ctx.beginPath(); ctx.moveTo(-90, -40); ctx.lineTo(90, -40); ctx.stroke(); [-90, 90].forEach(x => { ctx.beginPath(); ctx.arc(x, -10, 26, 0, Math.PI); ctx.stroke(); }); ctx.restore(); }
      if (lt > bal) hit(ctx, ch.X(19), ch.Y(62560), lt, bal, C.up, 180);
      popT(ctx, W / 2, 300, prog(lt, imb, imb + 0.35), () => pill(ctx, 'IMBALANCE · חוסר איזון', W / 2, 300, { size: 46, color: C.purple, glow: 45 }));
    },
  },

  // ================= CH2: why =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 6, 'למה זה עובד?', 'WHY IT WORKS', { cueWord: 'למה' }); } },
  w1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('החזקה'), type: 'pop' }, { lt: s.cue('ענקית'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, strong = s.cue('החזקה'), big = s.cue('גדול'), huge = s.cue('ענקית');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 22], [d, 6, 20]], { p: [61400, 64400] });
      ch.draw(ctx, { reveal: 14, dim: 0.35, highlight: i => i === 12 && lt > strong });
      fvg(ctx, ch, 11, AG, 22, 1, { alpha: 0.2, label: '' });
      popT(ctx, W / 2, 560, prog(lt, big - 0.1, big + 0.3), () => { glass(ctx, W / 2 - 280, 470, 560, 180, 30, { border: 'rgba(255,201,77,0.7)', glowColor: 'rgba(255,180,40,0.35)' }); text(ctx, 'שחקן גדול', W / 2 + 230, 520, { size: 46, weight: 900, align: 'right' }); text(ctx, 'BUY ' + (lt > huge ? '$900M' : '...'), W / 2 + 230, 595, { size: 46, weight: 800, fam: MONO, color: C.up, align: 'right' }); });
      if (lt > huge) { arrow(ctx, W / 2, 670, ch.X(12), ch.Y(62700) - 20, prog(lt, huge, huge + 0.4), { color: C.gold, width: 6, head: 26 }); hit(ctx, ch.X(12), ch.Y(62700), lt, huge + 0.3, C.up, 200); }
    },
  },
  w2: {
    trans: 'none',
    events: s => [{ lt: s.cue('התמלאו'), type: 'pop' }, { lt: s.cue('חוזר'), type: 'whoosh' }, { lt: s.cue('ודוחף'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, unf = s.cue('התמלאו'), back = s.cue('חוזר'), fill = s.cue('ממלא'), push = s.cue('ודוחף');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 20], [push, 6, 26], [d, 5, 31]], { p: [61400, 64900] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 14], [back, 15], [fill, 19.5], [push, 20], [d, 30]], E.lin)[0] });
      fvg(ctx, ch, 11, AG, 31, 1, { alpha: 0.22, label: '' });
      // resting (unfilled) buy orders inside the gap
      const r = rng(31), gone = prog(lt, fill, fill + 0.6);
      for (let k = 0; k < 9; k++) { const x = ch.X(14 + r() * 12), y = ch.Y(AG[0] + 60 + r() * (AG[1] - AG[0] - 120)), pk = prog(lt, unf + k * 0.05, unf + k * 0.05 + 0.3);
        ctx.save(); ctx.globalAlpha *= 1 - gone; popT(ctx, x, y - gone * 30, pk, () => pill(ctx, 'BUY', x, y - gone * 30, { size: 20, color: '#0b8f63', pad: 10, glow: 10 })); ctx.restore(); }
      if (lt > fill) hit(ctx, ch.X(19), ch.Y(62560), lt, fill, C.up, 160);
      arrow(ctx, ch.X(20), ch.Y(62700), ch.X(25), ch.Y(64000), prog(lt, push, push + 0.5), { color: C.up, width: 12, head: 44 });
      badge(ctx, 'פקודות שלא התמלאו', prog(lt, unf, unf + 0.35), '#0b8f63', 300, W / 2, 42);
    },
  },
  w3: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('המשך'), type: 'impact', k: 1 }, { lt: s.cue('מתהפכת'), type: 'pop' }, { lt: s.cue('ממשיכה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, cont = s.cue('המשך'), flip = s.cue('מתהפכת'), where = s.cue('ממשיכה');
      drawBG(ctx, s.t, { glow: 1.2 });
      headlines(ctx, lt, [{ t: 'FVG = המשך', at: cont - 0.2, y: 520, size: 120, color: C.teal, glowColor: C.teal, kind: 'pop' }]);
      const row = (y, t1, ok, t, col) => popT(ctx, W / 2, y, prog(lt, t, t + 0.35), () => { glass(ctx, 120, y - 80, 840, 160, 28, { border: col, glowColor: col }); text(ctx, t1, 820, y, { size: 50, weight: 900, align: 'right' }); (ok ? check : cross)(ctx, 220, y, 40, 1); });
      row(780, 'המגמה מתהפכת', false, flip, '#d61f45');
      row(990, 'איפה היא ממשיכה', true, where, '#0b8f63');
      ring(ctx, W / 2, 520, 560, prog(lt, cont, cont + 0.7), C.teal);
    },
  },

  // ================= CH3: inside a trend =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 6, 'FVG בתוך המגמה', 'TREND CONTINUATION', { cueWord: 'בתוך' }); } },
  t1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('יותר'), type: 'pop' }, { lt: s.cue('Higher'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chT, seq = s.cue('שפל'), q = s.cue('הבא'), hl = s.cue('Higher');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [d, 2, 32]], { p: [59500, 64800] });
      ch.draw(ctx, { reveal: lerp(8, 18.9, prog(lt, 0, seq + 1.2)) });
      ch.zigzag(ctx, [[0, 60000], [7, PT(7)], [11, PT(11)], [18, PT(18)]], prog(lt, seq - 0.2, seq + 1.3), { color: '#3df2a6', width: 5 });
      ch.tag(ctx, 18, PT(18), 'HH', prog(lt, s.cue('יותר') - 0.1, s.cue('יותר') + 0.2), { color: '#0b8f63', size: 26, off: 40 });
      if (lt > q) { const x = ch.X(22), y = ch.Y(61750); text(ctx, '?', x, y, { size: 110, weight: 900, color: C.gold, alpha: prog(lt, q, q + 0.3), glow: 30 }); ch.tag(ctx, 22, 61500, 'HL ?', prog(lt, hl, hl + 0.3), { color: '#b8860b', above: false, size: 28, off: 40 }); }
    },
  },
  t2: {
    trans: 'none',
    events: s => [{ lt: s.cue('הפער'), type: 'pop' }, { lt: s.cue('FVG'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chT, gap = s.cue('הפער'), fv = s.cue('FVG');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 32], [d, 4, 28]], { p: [59800, 63800] });
      ch.draw(ctx, { reveal: 18.9, dim: 0.3, highlight: i => i >= 13 && i <= 15 && lt > gap });
      fvg(ctx, ch, 13, G1, 28, prog(lt, fv - 0.2, fv + 0.4));
      if (lt > fv) hit(ctx, ch.X(14), ch.Y(61720), lt, fv, C.gold, 180);
      badge(ctx, 'הפער מהתנועה האחרונה', prog(lt, gap, gap + 0.35), '#b8860b', 300, W / 2, 42);
    },
  },
  t2b: {
    trans: 'whip',
    events: s => [{ lt: s.cue('פערים'), type: 'pop' }, { lt: s.cue('המבנה'), type: 'impact', k: 1.1 }, { lt: s.cue('BOS'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chC, many = s.cue('פערים'), str = s.cue('המבנה'), bos = s.cue('BOS');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 34], [d, 10, 34]], { p: [61300, 64300] });
      ch.draw(ctx, { reveal: 30.9, dim: 0.3, highlight: i => i >= 27 && i <= 29 && lt > str });
      // a weak gap during the earlier chop vs the gap in the breaking move
      if (lt > many && lt < str) text(ctx, '?', ch.X(31), ch.Y(62700), { size: 100, weight: 900, color: C.gold, alpha: prog(lt, many, many + 0.3), glow: 30 });
      fvg(ctx, ch, 27, CG, 34, prog(lt, many + 0.2, many + 0.6), { label: '' });
      ch.hline(ctx, PC(20), 20, 34, { color: lt > str ? C.up : '#fff', width: 4, dash: lt > str ? null : [10, 8], progress: prog(lt, 0.2, 0.7) });
      if (lt > str) { hit(ctx, ch.X(28), ch.Y(PC(20)), lt, str, C.up, 200); ch.tag(ctx, 28, 63600, 'BOS', prog(lt, str, str + 0.3), { color: '#0b8f63', size: 28, off: 44 }); }
      check(ctx, ch.X(31), ch.Y((CG[0] + CG[1]) / 2), 26, prog(lt, bos, bos + 0.3));
      popT(ctx, W / 2, 300, prog(lt, bos, bos + 0.35), () => pill(ctx, 'הכי חזק: FVG אחרי BOS', W / 2, 300, { size: 46, color: '#b8860b', glow: 45 }));
    },
  },
  t3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('לתוך'), type: 'pop' }, { lt: s.cue('ונעצר'), type: 'impact', k: 1.2 }, { lt: s.cue('ממשיכה'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chT, into = s.cue('לתוך'), stop = s.cue('ונעצר'), hl = s.cue('Higher'), go = s.cue('ממשיכה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 28], [d, 6, 32]], { p: [59800, 64800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 18.9], [into, 21], [stop, 22.95], [go, 24], [d, 29]], E.lin)[0] });
      fvg(ctx, ch, 13, G1, 32, 1);
      if (lt > stop) { hit(ctx, ch.X(22), ch.Y(PT(22)), lt, stop, C.up, 200); ch.tag(ctx, 22, PT(22), 'HL', prog(lt, hl, hl + 0.3), { color: '#0b8f63', above: false, size: 30, off: 44 }); }
      popT(ctx, W / 2, 300, prog(lt, stop, stop + 0.35), () => pill(ctx, 'התיקון נעצר בתוך הפער', W / 2, 300, { size: 46, color: '#0b8f63', glow: 45 }));
    },
  },
  t4: {
    trans: 'none',
    events: s => [{ lt: s.cue('חדש'), type: 'pop' }, { lt: s.cue('לתוכו'), type: 'impact', k: 1 }, { lt: s.cue('בחיים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chT, nw = s.cue('חדש'), into = s.cue('לתוכו'), hh = s.cue('שיא'), alive = s.cue('בחיים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 32], [d, 2, 43]], { p: [59500, 65800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 26.9], [into, 33], [hh, 36], [d - 0.2, 42]], E.lin)[0] });
      fvg(ctx, ch, 13, G1, 43, 1, { alpha: 0.18, label: '' });
      fvg(ctx, ch, 24, G2, 43, prog(lt, nw - 0.1, nw + 0.4));
      if (lt > into) { hit(ctx, ch.X(33), ch.Y(PT(33)), lt, into, C.up, 180); ch.tag(ctx, 33, PT(33), 'HL', prog(lt, into, into + 0.3), { color: '#0b8f63', above: false, size: 28, off: 44 }); }
      [22].forEach(i => ch.tag(ctx, i, PT(i), 'HL', 1, { color: '#0b8f63', above: false, size: 28, off: 44 }));
      badge(ctx, 'כל עוד הפערים מחזיקים', prog(lt, alive - 0.6, alive - 0.2), '#0b8f63', 300, W / 2, 42);
    },
  },
  t5: {
    trans: 'whip',
    events: s => [{ lt: s.cue('דובי'), type: 'pop' }, { lt: s.cue('לתוכו'), type: 'whoosh' }, { lt: s.cue('לרדת'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chB, bear = s.cue('דובי'), wk = s.cue('הפתילים'), into = s.cue('לתוכו'), down = s.cue('לרדת');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 24], [into, 4, 30], [d, 4, 31]], { p: [60800, 66600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 14.9], [into, 18], [into + 1, 21.5], [d - 0.2, 30.5]], E.lin)[0], highlight: i => i >= 12 && i <= 14 && lt > bear && lt < into });
      if (lt > wk) { bracket(ctx, ch.X(12), ch.Y(BG[1]), ch.Y(BG[1]), -1, '#ff5a72', 1); }
      fvg(ctx, ch, 12, BG, 31, prog(lt, bear, bear + 0.5), { bear: true });
      if (lt > into + 1) { hit(ctx, ch.X(21), ch.Y(PB(21)), lt, into + 1, C.down, 180); ch.tag(ctx, 21, PB(21), 'LH', prog(lt, into + 1, into + 1.3), { color: '#d61f45', size: 28, off: 44 }); }
      popT(ctx, W / 2, 300, prog(lt, bear, bear + 0.35), () => pill(ctx, 'FVG דובי ↓', W / 2, 300, { size: 50, color: '#d61f45', glow: 45 }));
    },
  },

  // ================= CH4: with liquidity =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 6, 'השילוב עם הנזילות', 'SWEEP + FVG', { cueWord: 'השילוב' }); } },
  c1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('אוסף'), type: 'impact', k: 1.2 }, { lt: s.cue('חדה'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chC, col = s.cue('אוסף'), sharp = s.cue('חדה'), rem = s.cue('זוכר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 32], [d, 10, 34]], { p: [61300, 64300] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 25.9], [col, 26.98], [sharp, 28], [d, 29.98]], E.lin)[0], highlight: i => i === 26 && lt > col });
      ch.hline(ctx, 62020, 15, 34, { color: C.gold, width: 4 }); ch.tag(ctx, 20, 62020, 'EQL', 1, { color: '#b8860b', above: false, size: 26, off: 40 });
      [16, 25].forEach((i, k) => stopPills(ctx, ch, i, 62020, false, prog(lt, rem, rem + 0.6), 70 + k, prog(lt, col, col + 0.5)));
      if (lt > col) { hit(ctx, ch.X(26), ch.Y(61600), lt, col, C.gold, 200); ch.tag(ctx, 26, 61600, 'SWEEP', prog(lt, col, col + 0.3), { color: C.purple, above: false, size: 28, off: 50 }); }
      popT(ctx, W / 2, 300, prog(lt, rem, rem + 0.35), () => pill(ctx, '← מהסרטון הראשון: נזילות', W / 2, 300, { size: 32, color: '#3b1a78', fill: false }));
    },
  },
  c2: {
    trans: 'none',
    events: s => [{ lt: s.cue('FVG'), type: 'impact', k: 1 }, { lt: s.cue('השני'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chC, fv = s.cue('FVG'), miss = s.cue('פספסת'), ticket = s.cue('השני');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 34], [d, 14, 40]], { p: [61300, 64600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 29.98], [miss, 31], [ticket, 33.6], [d, 36]], E.lin)[0], highlight: i => i >= 27 && i <= 29 && lt < miss });
      fvg(ctx, ch, 27, CG, 40, prog(lt, fv - 0.1, fv + 0.4));
      ch.hline(ctx, 62020, 15, 40, { color: C.gold, width: 3, alpha: 0.5 });
      ch.tag(ctx, 26, 61600, 'SWEEP', 1, { color: C.purple, above: false, size: 26, off: 50 });
      if (lt > miss) cross(ctx, ch.X(26) - 60, ch.Y(61600) + 50, 22, prog(lt, miss, miss + 0.3));
      if (lt > ticket) { hit(ctx, ch.X(33), ch.Y(62750), lt, ticket, C.up, 200); popT(ctx, ch.X(33) + 20, ch.Y(62750) + 80, prog(lt, ticket, ticket + 0.3), () => pill(ctx, 'הכרטיס השני ✓', ch.X(33) + 20, ch.Y(62750) + 80, { size: 30, color: '#0b8f63' })); }
    },
  },
  c3: {
    trans: 'none',
    events: s => [{ lt: s.cue('סוויפ'), type: 'pop' }, { lt: s.cue('BOS'), type: 'pop' }, { lt: s.cue('FVG'), type: 'pop' }, { lt: s.cue('מקום'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chC, sw = s.cue('סוויפ'), bos = s.cue('BOS'), fv = s.cue('FVG'), place = s.cue('מקום');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 40], [d, 16, 44]], { p: [61300, 65600] });
      ch.draw(ctx, { reveal: lerp(36, 44, prog(lt, 0, d)), dim: 0.25 });
      const tagN = (i, p, n, l, col, t, above) => ch.tag(ctx, i, p, `${n} · ${l}`, prog(lt, t, t + 0.3), { color: col, above, size: 28, off: 48 });
      tagN(26, 61600, '1', 'SWEEP', C.purple, sw, false);
      ch.hline(ctx, PC(20), 20, 44, { color: C.up, width: 3, progress: prog(lt, bos - 0.1, bos + 0.3) }); tagN(28, 63600, '2', 'BOS', '#0b8f63', bos, true);
      fvg(ctx, ch, 27, CG, 44, prog(lt, fv - 0.1, fv + 0.3), { label: '' }); tagN(33, 62750, '3', 'FVG', '#b8860b', fv, false);
      popT(ctx, W / 2, 300, prog(lt, place - 0.2, place + 0.2), () => pill(ctx, '3 קונפלואנסים · מקום אחד', W / 2, 300, { size: 46, color: '#b8860b', glow: 45 }));
      if (lt > place) ring(ctx, ch.X(29), ch.Y(62700), 300, prog(lt, place, place + 0.7), C.gold);
    },
  },

  // ================= CH5: bad FVGs =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 6, 'איזה FVG לא שווה כלום?', 'SKIP THESE', { cueWord: 'איזה' }); } },
  x1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('המגמה'), type: 'pop' }, { lt: s.cue('מלכודת'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chB, against = s.cue('נגד'), trap = s.cue('מלכודת');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 30], [d, 8, 31]], { p: [60800, 66400] });
      ch.draw(ctx, { reveal: lerp(21, 30.9, prog(lt, against + 0.3, trap + 0.4)) });
      // bullish gap inside the downtrend's pullback (counter-trend)
      const cg = [63250, 63550];
      fvg(ctx, ch, 18, cg, 31, prog(lt, against - 0.2, against + 0.3), { color: '#3df2a6', label: 'FVG ↑' });
      ch.zigzag(ctx, [[0, 66000], [6, PB(6)], [10, PB(10)], [17, PB(17)]], 1, { color: 'rgba(255,123,143,0.6)', width: 4, dots: false });
      if (lt > trap) { hit(ctx, ch.X(24), ch.Y(63400), lt, trap, C.down, 200); cross(ctx, ch.X(27), ch.Y(63400), 30, prog(lt, trap, trap + 0.3)); flashCol(ctx, lt, trap); }
      badge(ctx, 'FVG נגד המגמה = מלכודת', prog(lt, trap, trap + 0.35), '#d61f45', 300, W / 2, 42);
    },
  },
  x2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('קטנטן'), type: 'pop' }, { lt: s.cue('רעש'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, tiny = s.cue('קטנטן'), noise = s.cue('רעש');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 29], [d, 2, 29]], { p: [61400, 62900] });
      ch.draw(ctx, { reveal: 28.9, highlight: i => i >= 9 && i <= 11 });
      ch.zone(ctx, 62020, 62050, 8.6, 29, { color: C.gold, alpha: 0.6, progress: prog(lt, tiny, tiny + 0.4) });
      if (lt > tiny) ring(ctx, ch.X(10), ch.Y(62035), 90, (lt - tiny) % 1, C.gold);
      ch.zone(ctx, 61850, 62400, 0, 29, { color: '#888', alpha: 0.1, progress: prog(lt, 0.2, 0.8) });
      badge(ctx, 'שוק צדדי · פער קטנטן = רעש', prog(lt, noise - 0.2, noise + 0.15), '#d61f45', 300, W / 2, 40);
      cross(ctx, ch.X(10) + 90, ch.Y(62035) - 60, 26, prog(lt, noise, noise + 0.3));
    },
  },
  x3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('דרכו'), type: 'impact', k: 1.3 }, { lt: s.cue('קנייה'), type: 'pop' }, { lt: s.cue('אחר'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chF, thru = s.cue('דרכו'), buy = s.cue('קנייה'), other = s.cue('אחר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 22], [d, 2, 23]], { p: [60600, 64000] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 15.9], [thru, 17.98], [d, 22]], E.lin)[0], highlight: i => i === 17 && lt > thru });
      const flipped = lt > other;
      fvg(ctx, ch, 8, [62200, 62600], 23, 1, { color: flipped ? '#ff5a72' : C.gold, label: flipped ? '?' : 'FVG' });
      if (lt > thru) { hit(ctx, ch.X(17), ch.Y(62200), lt, thru, C.down, 220); flashCol(ctx, lt, thru); }
      if (lt > buy) cross(ctx, ch.X(20), ch.Y(62400), 28, prog(lt, buy, buy + 0.3));
      badge(ctx, 'נסגר דרך הפער', prog(lt, thru, thru + 0.35), '#d61f45', 300, W / 2, 42);
      popT(ctx, W / 2, 1270, prog(lt, other, other + 0.35), () => pill(ctx, 'בסרטון הבא: הוא מתהפך', W / 2, 1270, { size: 38, color: C.purple, glow: 40 }));
    },
  },

  // ================= CH6: TradingView + plan =================
  ch6: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 6, 6, 'תוכנית מסחר', 'TRADINGVIEW PLAN', { cueWord: 'תוכנית' }); } },
  p1: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Rectangle') - 0.2, type: 'click' }, { lt: s.cue('הראשון'), type: 'click' }, { lt: s.cue('השלישי'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chT, tool = s.cue('Rectangle'), a = s.cue('הראשון'), b = s.cue('השלישי');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(16, 32, 61300, 64600);
      ch.draw(ctx, { reveal: 29.9, tfs: ['15m', '1H', '4H', '1D'], highlight: i => i >= 24 && i <= 26 });
      const at = tvToolbar(ctx, 40, 466, 870, lt > tool - 0.2 ? 'rect' : null);
      const pr = prog(lt, a, b);
      if (pr > 0) { const x0 = ch.X(23.6), y0 = ch.Y(G2[0]), x1 = lerp(x0, ch.X(26.4), pr), y1 = lerp(y0, ch.Y(G2[1]), pr);
        ctx.save(); ctx.fillStyle = 'rgba(255,201,77,0.25)'; ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.fillRect(x0, Math.min(y0, y1), x1 - x0, Math.abs(y1 - y0)); ctx.strokeRect(x0, Math.min(y0, y1), x1 - x0, Math.abs(y1 - y0)); ctx.restore(); }
      const [rx, ry] = at('rect');
      const c = kf(lt, [[0, 700, 1100], [tool - 0.3, rx, ry], [tool, rx, ry], [a - 0.1, ch.X(23.6), ch.Y(G2[0])], [b, ch.X(26.4), ch.Y(G2[1])], [d, ch.X(26.4) + 20, ch.Y(G2[1]) + 20]]);
      cursor(ctx, c[0], c[1], Math.max(Math.exp(-Math.abs(lt - tool + 0.2) * 14), Math.exp(-Math.abs(lt - a) * 14), Math.exp(-Math.abs(lt - b) * 14)), 1.1);
      popT(ctx, W / 2, 300, prog(lt, tool, tool + 0.35), () => pill(ctx, 'Rectangle · Alt+Shift+R', W / 2, 300, { size: 44, color: C.purple, glow: 40 }));
    },
  },
  p2: {
    trans: 'none',
    events: s => [{ lt: s.cue('ימינה'), type: 'click' }, { lt: s.cue('יחזור'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chT, ext = s.cue('ימינה'), back = s.cue('יחזור'), chase = s.cue('לרדוף');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(...kf(lt, [[0, 16, 32], [d, 18, 36]]), 61300, 64600);
      ch.draw(ctx, { reveal: kf(lt, [[0, 29.9], [back, 31], [d, 33.6]], E.lin)[0], tfs: ['15m', '1H', '4H', '1D'] });
      tvToolbar(ctx, 40, 466, 870, 'rect');
      fvg(ctx, ch, 24, G2, lerp(26.4, 38, E.outCubic(prog(lt, ext - 0.1, ext + 0.6))), 1, { label: 'FVG' });
      if (lt > ext - 0.3 && lt < back) { const c = kf(lt, [[ext - 0.3, ch.X(26.4), ch.Y(62375)], [ext + 0.6, ch.X(36), ch.Y(62375)]]); cursor(ctx, c[0], c[1], 0.5, 1.1); }
      badge(ctx, 'בלי לרדוף', prog(lt, chase, chase + 0.35), C.purple, 300, W / 2, 44);
    },
  },
  p2b: {
    trans: 'none',
    events: s => [{ lt: s.cue('לאמצע'), type: 'pop' }, { lt: s.cue('מסתובב'), type: 'impact', k: 1 }, { lt: s.cue('האמצע'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chT, mid = s.cue('לאמצע'), turn = s.cue('מסתובב'), mark = s.cue('האמצע');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 22, 38], [d, 26, 37]], { p: [61700, 64600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 32], [turn, 33.95], [d, 35]], E.lin)[0] });
      fvg(ctx, ch, 24, G2, 38, 1, { label: '', mid: lt > mid - 0.2 });
      const m = (G2[0] + G2[1]) / 2;
      if (lt > mid - 0.2) popT(ctx, ch.X(36), ch.Y(m) - 36, prog(lt, mid - 0.2, mid + 0.1), () => pill(ctx, '50%', ch.X(36), ch.Y(m) - 36, { size: 30, color: '#b8860b', fam: MONO }));
      if (lt > turn) hit(ctx, ch.X(33), ch.Y(PT(33)), lt, turn, C.up, 180);
      badge(ctx, 'טיפ של מקצוענים', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 44);
      badge(ctx, 'תסמן גם את האמצע', prog(lt, mark, mark + 0.35), '#b8860b', 1270, W / 2, 40);
    },
  },
  p3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הכניסה'), type: 'pop' }, { lt: s.cue('הסטופ'), type: 'pop' }, { lt: s.cue('והיעד'), type: 'pop' }, { lt: s.cue('יושבת'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chT, en = s.cue('הכניסה'), st = s.cue('הסטופ'), tg = s.cue('והיעד'), liq = s.cue('יושבת');
      const EN = G2[1], SL = 61850, TP = PT(29);
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 18, 40], [d, 16, 42]], { p: [61300, 65500] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 33], [tg, 33.5], [d - 0.2, 40.5]], E.lin)[0] });
      fvg(ctx, ch, 24, G2, 42, 1, { alpha: 0.2, label: '' });
      ch.hline(ctx, EN, 30, 42, { color: '#fff', width: 4, progress: prog(lt, en, en + 0.4) });
      popT(ctx, ch.X(37), ch.Y(EN) - 34, prog(lt, en, en + 0.3), () => pill(ctx, 'כניסה: נגיעה בפער', ch.X(37), ch.Y(EN) - 34, { size: 26, color: '#2962ff' }));
      ch.hline(ctx, SL, 24, 42, { color: C.down, width: 4, progress: prog(lt, st, st + 0.4) });
      popT(ctx, ch.X(37), ch.Y(SL) + 34, prog(lt, st, st + 0.3), () => pill(ctx, 'סטופ: מתחת לנר 1', ch.X(37), ch.Y(SL) + 34, { size: 26, color: '#d61f45' }));
      positionBox(ctx, ch, 31, 42, EN, SL, TP, prog(lt, tg, tg + 0.8), { rr: true });
      ch.tag(ctx, 29, TP, 'יעד: השיא הבא', prog(lt, tg, tg + 0.3), { color: '#0b8f63', size: 26, off: 44 });
      if (lt > liq) { stopPills(ctx, ch, 29, TP, true, prog(lt, liq, liq + 0.5), 90); }
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('FVG'), type: 'pop' }, { lt: s.cue('המשך'), type: 'pop' }, { lt: s.cue('נעצר'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['FVG', 'פער בין פתיל 1 לפתיל 3', '#e0a100', s.cue('FVG'), 3],
        ['קונפלואנס של המשך', 'לא של היפוך', C.purple, s.cue('המשך'), 'zz'],
        ['שם התיקון נעצר', 'שם נכנסים', '#0fa36b', s.cue('נעצר'), 'check'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('דרכו'), type: 'impact', k: 1 }, { lt: s.cue('Inverse'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chF, q = s.cue('מה'), thru = s.cue('דרכו'), inv = s.cue('Inverse');
      drawBG(ctx, s.t, { glow: 1.3 });
      headlines(ctx, lt, [{ t: 'ומה אם המחיר', at: q, y: 380, size: 80 }, { t: 'נסגר דרך הפער?', at: s.cue('ונסגר'), y: 490, size: 92, color: '#ff5a72', glowColor: C.down }]);
      ch.layout(90, 600, 900, 520, { head: 0, foot: 0, axis: 0 }).view(2, 23, 60600, 64000);
      ctx.save(); ctx.globalAlpha = prog(lt, q, q + 0.4); ch.draw(ctx, { reveal: kf(lt, [[0, 15.9], [thru, 17.98], [d, 20]], E.lin)[0], frame: false, header: false, lastTag: false }); ctx.restore();
      fvg(ctx, ch, 8, [62200, 62600], 23, prog(lt, q, q + 0.4), { color: lt > inv ? '#ff5a72' : C.gold, label: '' });
      popT(ctx, W / 2, 1230, prog(lt, inv - 0.1, inv + 0.35), () => pill(ctx, 'הבא: INVERSE FVG', W / 2, 1230, { size: 50, color: C.purple, glow: 50 }));
      ring(ctx, W / 2, 1230, 520, prog(lt, inv, inv + 0.7));
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

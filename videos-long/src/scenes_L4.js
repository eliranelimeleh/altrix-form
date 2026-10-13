// L4 — Inverse Fair Value Gap: the fourth of the 5 confluences (reversal)
'use strict';
// ---------- data ----------
// bearish IFVG: uptrend, bullish FVG 12..14 (61700..62200), close below it at 22, retest from below at 26, sell-off
const IVP = [[0, 60500], [6, 61800], [10, 61200], [17, 63400], [24, 61100], [26, 62000], [38, 59700]];
const IV_OV = {
  12: { o: 61500, h: 61700, l: 61400, c: 61650 }, 13: { o: 61650, h: 62600, l: 61600, c: 62550 }, 14: { o: 62550, h: 62900, l: 62200, c: 62800 },
  18: { o: 63400, h: 63450, l: 63000, c: 63050 }, 19: { o: 63050, h: 63150, l: 62750, c: 62800 }, 20: { o: 62800, h: 62900, l: 62450, c: 62500 },
  21: { o: 62500, h: 62600, l: 62050, c: 62150 }, 22: { o: 62150, h: 62200, l: 61450, c: 61500 }, 23: { o: 61500, h: 61550, l: 61150, c: 61200 },
  24: { o: 61200, h: 61450, l: 61100, c: 61400 }, 25: { o: 61400, h: 61750, l: 61350, c: 61700 }, 26: { o: 61700, h: 62050, l: 61650, c: 61750 },
  27: { o: 61750, h: 61800, l: 61300, c: 61350 },
};
const IVC = override(genCandles(IVP, { seed: 13, noise: 0.12 }), IV_OV);
const chI = new Chart(IVC);
const IG = [61700, 62200];
const PI = i => IVP.find(p => p[0] === i)[1];
// same pattern on a 1H chart, shifted up 2,000 (step-by-step chapter)
const shiftC = (cs, dp) => cs.map(q => ({ o: q.o + dp, h: q.h + dp, l: q.l + dp, c: q.c + dp }));
const EXB = shiftC(override(genCandles(IVP, { seed: 71, noise: 0.13 }), IV_OV), 2000);
const chX = new Chart(EXB, { tf: '1H' });
const XG = [IG[0] + 2000, IG[1] + 2000];
// bullish IFVG = mirror image of the bearish one
const MIR = 2 * 62000;
const mirrorC = cs => cs.map(q => ({ o: MIR - q.o, c: MIR - q.c, h: MIR - q.l, l: MIR - q.h }));
const UPC = mirrorC(override(genCandles(IVP, { seed: 29, noise: 0.12 }), IV_OV));
const chM = new Chart(UPC, { tf: '4H' });
const MG = [MIR - IG[1], MIR - IG[0]];
// the killer combo: EQH, bullish FVG 20..22, sweep at 25, IFVG close at 27, BOS below HL 19 at 28, retest 30, sell-off
const CMP = [[0, 60000], [6, 62000], [10, 61200], [16, 63000], [19, 62300], [24, 63020], [28, 62200], [30, 62700], [42, 60800]];
const CMC = override(genCandles(CMP, { seed: 52, noise: 0.12 }), {
  20: { o: 62300, h: 62500, l: 62250, c: 62450 }, 21: { o: 62450, h: 63000, l: 62400, c: 62950 }, 22: { o: 62950, h: 63150, l: 62750, c: 63050 },
  23: { o: 63050, h: 63100, l: 62850, c: 62900 }, 24: { o: 62900, h: 63020, l: 62820, c: 62980 },
  25: { o: 62980, h: 63400, l: 62950, c: 63100 }, 26: { o: 63100, h: 63150, l: 62800, c: 62850 },
  27: { o: 62850, h: 62900, l: 62400, c: 62450 }, 28: { o: 62450, h: 62500, l: 62180, c: 62220 },
  29: { o: 62220, h: 62550, l: 62200, c: 62500 }, 30: { o: 62500, h: 62720, l: 62450, c: 62600 }, 31: { o: 62600, h: 62650, l: 62300, c: 62350 },
});
const chK = new Chart(CMC);
const KG = [62500, 62750];
const PK = i => CMP.find(p => p[0] === i)[1];

// ---------- local helpers ----------
function flashCol(ctx, lt, t, col = '255,40,70', a = 0.25) { const f = Math.max(0, 1 - (lt - t) / 0.3); if (lt >= t && f > 0) { ctx.fillStyle = `rgba(${col},${a * f})`; ctx.fillRect(0, 0, W, H); } }
function hit(ctx, x, y, lt, t, col = C.gold, r = 220) { ring(ctx, x, y, r, prog(lt, t, t + 0.6), col); burst(ctx, x, y, prog(lt, t, t + 0.9), col, 26, Math.floor(t * 10) + 3, r * 1.1); }
// gap box; `inv` (0..1) blends gold FVG -> red/green IFVG
function gapBox(ctx, ch, i0, g, iEnd, p, o = {}) {
  if (p <= 0) return;
  const { inv = 0, bull = false, label = true, alpha = 0.3 } = o;
  const base = bull ? '#ff5a72' : C.gold, flip = bull ? '#3df2a6' : '#ff5a72', col = inv > 0.5 ? flip : base;
  ch.zone(ctx, g[0], g[1], i0 - 0.4, iEnd, { color: col, alpha: alpha * clamp(p * 2), progress: p });
  if (inv > 0 && inv < 1) { const x = ch.X(lerp(i0, iEnd, inv)); ch.clip(ctx, () => { ctx.save(); ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.6 * Math.sin(inv * Math.PI); ctx.fillRect(x - 6, ch.Y(g[1]), 12, ch.Y(g[0]) - ch.Y(g[1])); ctx.restore(); }); }
  if (label) text(ctx, inv > 0.5 ? 'IFVG' : 'FVG', Math.min(ch.X(iEnd) - 70, ch.X(i0 + 3) + 60), ch.Y((g[0] + g[1]) / 2), { size: 28, weight: 900, color: col, alpha: clamp(p * 2 - 0.5), stroke: 6 });
}

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('להחזיק'), type: 'pop' }, { lt: s.cue('נשבר'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, hold = s.cue('להחזיק'), brk = s.cue('נשבר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 28], [d, 10, 30]], { p: [60600, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 20.9], [brk - 0.3, 21.9], [brk, 22.98], [d, 23.5]], E.lin)[0], highlight: i => i === 22 && lt > brk });
      gapBox(ctx, ch, 12, IG, 30, 1, { inv: prog(lt, brk, brk + 0.5) });
      if (lt > brk) { hit(ctx, ch.X(22), ch.Y(IG[0]), lt, brk, C.down, 260); flashCol(ctx, lt, brk); }
      if (lt < brk - 0.1) wipeText(ctx, 'הפער אמור להחזיק', W / 2, 300, prog(lt, 0, 0.3), { size: 74, weight: 900, color: C.gold });
      else wipeText(ctx, 'והוא נשבר', W / 2, 300, prog(lt, brk - 0.1, brk + 0.2), { size: 84, weight: 900, color: '#ff5a72' });
    },
  },
  hook2: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('ומפסידים'), type: 'pop' }, { lt: s.cue('ההפוך'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, buy = s.cue('לקנות'), lose = s.cue('ומפסידים'), opp = s.cue('ההפוך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 30], [opp, 12, 34], [d, 10, 38]], { p: [59300, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 23.5], [lose, 26.5], [opp, 28], [d, 36]], E.lin)[0] });
      gapBox(ctx, ch, 12, IG, 38, 1, { inv: 1 });
      if (lt > buy && lt < opp + 0.4) { const r = rng(6); for (let k = 0; k < 5; k++) { const x = ch.X(23 + r() * 4), y = ch.Y(61900 + r() * 200) - 40; popT(ctx, x, y, prog(lt, buy + k * 0.08, buy + k * 0.08 + 0.3) * (1 - prog(lt, opp, opp + 0.4)), () => pill(ctx, 'BUY', x, y, { size: 22, color: '#555', pad: 10 })); } }
      if (lt > lose) cross(ctx, ch.X(25), ch.Y(62400), 30, prog(lt, lose, lose + 0.3) * (1 - prog(lt, opp, opp + 0.4)));
      if (lt > opp) { popT(ctx, ch.X(27) + 120, ch.Y(62150) - 40, prog(lt, opp, opp + 0.3), () => pill(ctx, 'SELL ✓', ch.X(27) + 120, ch.Y(62150) - 40, { size: 32, color: '#0b8f63' })); hit(ctx, ch.X(26), ch.Y(62000), lt, opp, C.up, 200); }
      if (lt < opp) wipeText(ctx, 'רובם ממשיכים לקנות', W / 2, 300, prog(lt, buy - 0.2, buy + 0.2), { size: 66, weight: 900, color: '#ff5a72' });
      else wipeText(ctx, 'אתה נכנס הפוך', W / 2, 300, prog(lt, opp - 0.05, opp + 0.25), { size: 76, weight: 900, color: '#3df2a6' });
    },
  },
  hook3: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('מהירים'), type: 'riser' }, { lt: s.cue('שלך'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, fast = s.cue('מהירים'), yours = s.cue('שלך');
      drawBG(ctx, s.t, { hue: 20 });
      stdChart(ch, lt, [[0, 4, 38], [d, 6, 38]], { p: [59300, 63800] });
      ch.draw(ctx, { reveal: 38, dim: 0.45, highlight: i => i === 22 });
      gapBox(ctx, ch, 12, IG, 38, 1, { inv: 1 });
      ch.zigzag(ctx, [[17, PI(17)], [24, 61100], [26, 62050], [38, 59700]], prog(lt, 0.2, fast + 0.6), { color: '#ff7b8f', width: 5, dots: false });
      wipeText(ctx, 'הסימן הכי מהיר להיפוך', W / 2, 300, prog(lt, fast - 0.5, fast), { size: 64, weight: 900, color: C.purple2 });
      popT(ctx, W / 2, 1255, prog(lt, yours, yours + 0.35), () => pill(ctx, 'ובעוד כמה דקות · שלך', W / 2, 1255, { size: 42, color: C.purple, glow: 40 }));
    },
  },
  intro: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('הרביעי'), type: 'pop' }, { lt: s.cue('Inverse'), type: 'impact', k: 1.1 }, { lt: s.cue('היפוך'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, four = s.cue('הרביעי'), inv = s.cue('Inverse'), rev = s.cue('היפוך');
      drawBG(ctx, s.t, { glow: 1.25 });
      wipeText(ctx, 'קונפלואנס 4 מתוך 5', W / 2, 300, prog(lt, four - 0.05, four + 0.35), { size: 62, weight: 900, color: C.neon });
      seriesMap(ctx, lt, 3, four, 1120, { done: 3 });
      confluenceCard(ctx, lt, inv, { he: 'פער הפוך', en: 'INVERSE FVG', type: 'reversal', uses: ['היפוך מהיר', 'כניסה'], y: 430, tType: rev - 0.1, tUses: [rev + 0.3, rev + 0.6] });
    },
  },

  // ================= CH1: what =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 6, 'מה זה IFVG?', 'INVERSE FAIR VALUE GAP', { cueWord: 'מה' }); } },
  a1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('להחזיק'), type: 'pop' }, { lt: s.cue('ממשיך'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, prev = s.cue('בסרטון'), hold = s.cue('להחזיק'), go = s.cue('ממשיך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 24], [d, 6, 24]], { p: [60400, 63800] });
      ch.draw(ctx, { reveal: lerp(15, 20.9, prog(lt, 0.3, d)), dim: 0.2 });
      gapBox(ctx, ch, 12, IG, 24, prog(lt, 0.1, 0.6));
      // the expected path: dip into the gap, then up (ghost)
      ch.zigzag(ctx, [[17, PI(17)], [21, 62000], [24, 63600]], prog(lt, hold, go + 0.5), { color: 'rgba(61,242,166,0.85)', width: 5, dots: false });
      check(ctx, ch.X(21), ch.Y(62000) + 60, 26, prog(lt, go, go + 0.3));
      popT(ctx, W / 2, 300, prog(lt, prev, prev + 0.35), () => pill(ctx, '← מהסרטון הקודם: FVG מחזיק', W / 2, 300, { size: 40, color: '#b8860b', glow: 35 }));
    },
  },
  a2: {
    trans: 'none',
    events: s => [{ lt: s.cue('נעצר'), type: 'tick' }, { lt: s.cue('נסגר'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, no = s.cue('נעצר'), cl = s.cue('נסגר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 24], [d, 8, 26]], { p: [60400, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 20.9], [no, 21.9], [cl, 22.98], [d, 23.2]], E.lin)[0], highlight: i => i === 22 && lt > cl });
      gapBox(ctx, ch, 12, IG, 26, 1);
      if (lt > no && lt < cl) text(ctx, '?', ch.X(23), ch.Y(61950), { size: 110, weight: 900, color: C.gold, glow: 30, alpha: prog(lt, no, no + 0.3) });
      if (lt > cl) { hit(ctx, ch.X(22), ch.Y(IG[0]), lt, cl, C.down, 240); flashCol(ctx, lt, cl);
        const x = ch.X(22), y0 = ch.Y(62150), y1 = ch.Y(61500); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x - 24, y0 - 6, 48, y1 - y0 + 12); ctx.restore(); }
      badge(ctx, 'נר שלם נסגר מתחת', prog(lt, cl, cl + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },
  a3: {
    trans: 'none',
    events: s => [{ lt: s.cue('להתנגדות'), type: 'impact', k: 1.1 }, { lt: s.cue('Inverse'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, sup = s.cue('מתמיכה'), res = s.cue('להתנגדות'), inv = s.cue('Inverse');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 26], [d, 10, 30]], { p: [60400, 63800] });
      ch.draw(ctx, { reveal: lerp(23.2, 24.5, prog(lt, 0, d)) });
      gapBox(ctx, ch, 12, IG, 30, 1, { inv: prog(lt, res - 0.2, res + 0.5) });
      popT(ctx, ch.X(27), ch.Y(IG[1]) - 40, prog(lt, sup, sup + 0.3) * (1 - prog(lt, res - 0.1, res + 0.1)), () => pill(ctx, 'תמיכה', ch.X(27), ch.Y(IG[1]) - 40, { size: 30, color: '#0b8f63' }));
      popT(ctx, ch.X(27), ch.Y(IG[1]) - 40, prog(lt, res, res + 0.3), () => pill(ctx, 'התנגדות', ch.X(27), ch.Y(IG[1]) - 40, { size: 30, color: '#d61f45' }));
      popT(ctx, W / 2, 300, prog(lt, inv, inv + 0.35), () => pill(ctx, 'INVERSE FAIR VALUE GAP', W / 2, 300, { size: 46, color: '#d61f45', glow: 45 }));
      if (lt > inv) ring(ctx, W / 2, 300, 480, prog(lt, inv, inv + 0.7), C.down);
    },
  },
  a4: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('בפתיל'), type: 'pop' }, { lt: s.cue('גוף'), type: 'impact', k: 1 }, { lt: s.cue('רגיל'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, wick = s.cue('בפתיל'), body = s.cue('גוף'), reg = s.cue('רגיל'), enter = s.cue('ייכנס');
      drawBG(ctx, s.t, { glow: 1.1 });
      // three mini scenarios against the same gap
      const gx = 140, gw = 800, gy0 = 620, gy1 = 760, col = C.gold;
      const panel = (y, title, kind, ok, t) => {
        const p = prog(lt, t - 0.1, t + 0.3); if (p <= 0) return;
        ctx.save(); ctx.globalAlpha = p; glass(ctx, gx - 40, y - 150, gw + 80, 300, 28);
        ctx.fillStyle = 'rgba(255,201,77,0.28)'; ctx.fillRect(gx + 280, y - 50, 480, 100); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(gx + 280, y - 50, 480, 100);
        const cx = gx + 520, cw = 56; // candle: kind 0 = into gap, 1 = wick through, 2 = body close below
        const [hi, bt, bb, lo] = kind === 0 ? [y - 120, y - 100, y - 20, y + 10] : kind === 1 ? [y - 120, y - 100, y - 30, y + 110] : [y - 120, y - 100, y + 90, y + 120];
        ctx.strokeStyle = C.down; ctx.fillStyle = C.down; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, hi); ctx.lineTo(cx, lo); ctx.stroke(); ctx.fillRect(cx - cw / 2, bt, cw, bb - bt);
        text(ctx, title, gx + 230, y, { size: 38, weight: 900, align: 'right', color: '#fff' });
        ctx.restore(); (ok ? check : cross)(ctx, gx + 820, y, 32, p);
      };
      panel(560, 'נכנס לפער', 0, false, enter);
      panel(900, 'פתיל חוצה', 1, false, wick);
      panel(1240, 'גוף נסגר מתחת', 2, true, body);
      wipeText(ctx, 'מה הופך FVG ל-IFVG?', W / 2, 300, prog(lt, 0, 0.35), { size: 62, weight: 900, color: C.neon });
      badge(ctx, 'אחרת: FVG רגיל', prog(lt, reg, reg + 0.35), '#b8860b', 1440, W / 2, 34);
    },
    captions: false,
  },

  // ================= CH2: why =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 6, 'למה זה כל כך חזק?', 'TRAPPED BUYERS', { cueWord: 'למה' }); } },
  b1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('להגן'), type: 'pop' }, { lt: s.cue('להמשיך'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, def = s.cue('להגן'), cont = s.cue('להמשיך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 26], [d, 8, 26]], { p: [60400, 63800] });
      ch.draw(ctx, { reveal: 21.9, dim: 0.25 });
      gapBox(ctx, ch, 12, IG, 26, 1, { label: false });
      // shield over the gap
      const p = prog(lt, def - 0.1, def + 0.3);
      if (p > 0) { const x = ch.X(19), y = ch.Y((IG[0] + IG[1]) / 2); popT(ctx, x, y, p, () => { ctx.save(); ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.lineTo(x + 50, y - 40); ctx.lineTo(x + 44, y + 20); ctx.lineTo(x, y + 60); ctx.lineTo(x - 44, y + 20); ctx.lineTo(x - 50, y - 40); ctx.closePath(); ctx.fillStyle = 'rgba(22,199,132,0.85)'; ctx.shadowColor = C.up; ctx.shadowBlur = 30; ctx.fill(); ctx.restore(); text(ctx, 'קונים', x, y + 2, { size: 26, weight: 900 }); }); }
      arrow(ctx, ch.X(22), ch.Y(62000), ch.X(25), ch.Y(63500), prog(lt, cont, cont + 0.5), { color: 'rgba(61,242,166,0.8)', width: 8, head: 30 });
      badge(ctx, 'הפער = הבטחה', prog(lt, 0.1, 0.45), '#b8860b', 300, W / 2, 44);
    },
  },
  b2: {
    trans: 'none',
    events: s => [{ lt: s.cue('חלשים'), type: 'impact', k: 1.1 }, { lt: s.cue('תקוע'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, weak = s.cue('חלשים'), stuck = s.cue('תקוע');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 26], [d, 10, 28]], { p: [60400, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 22], [weak, 22.98], [d, 24]], E.lin)[0], highlight: i => i === 22 });
      gapBox(ctx, ch, 12, IG, 28, 1, { inv: 1, label: false });
      if (lt > weak) { hit(ctx, ch.X(22), ch.Y(61700), lt, weak, C.down, 220); const x = ch.X(19), y = ch.Y(61950); ctx.save(); ctx.globalAlpha = prog(lt, weak, weak + 0.3); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 50, y - 50); ctx.lineTo(x + 50, y + 50); ctx.moveTo(x + 50, y - 50); ctx.lineTo(x - 50, y + 50); ctx.stroke(); ctx.restore(); }
      if (lt > stuck) { const r = rng(14); for (let k = 0; k < 6; k++) { const x = ch.X(19 + r() * 6), y = ch.Y(61750 + r() * 400); popT(ctx, x, y, prog(lt, stuck + k * 0.06, stuck + k * 0.06 + 0.3), () => pill(ctx, '-$', x, y, { size: 22, color: '#d61f45', pad: 10 })); } }
      badge(ctx, 'קונים תקועים בהפסד', prog(lt, stuck, stuck + 0.35), '#d61f45', 300, W / 2, 42);
    },
  },
  b3: {
    trans: 'none',
    events: s => [{ lt: s.cue('יחזור'), type: 'whoosh' }, { lt: s.cue('באפס'), type: 'pop' }, { lt: s.cue('מכירה'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, back = s.cue('יחזור'), zero = s.cue('באפס'), sell = s.cue('מכירה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 28], [d, 12, 32]], { p: [60000, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 24], [zero, 26.98], [sell, 27.5], [d, 30]], E.lin)[0] });
      gapBox(ctx, ch, 12, IG, 32, 1, { inv: 1 });
      if (lt > zero) { const r = rng(15); for (let k = 0; k < 7; k++) { const x = ch.X(24 + r() * 4), y = ch.Y(61800 + r() * 350); popT(ctx, x, y, prog(lt, zero + k * 0.06, zero + k * 0.06 + 0.3), () => pill(ctx, 'SELL', x, y, { size: 22, color: '#d61f45', pad: 10, glow: 12 })); } }
      if (lt > sell) { hit(ctx, ch.X(26), ch.Y(62050), lt, sell, C.down, 220); arrow(ctx, ch.X(27), ch.Y(61700), ch.X(30), ch.Y(60600), prog(lt, sell, sell + 0.5), { color: C.down, width: 12, head: 44 }); }
      badge(ctx, 'יוצאים באפס = לחץ מכירה', prog(lt, zero, zero + 0.35), '#d61f45', 300, W / 2, 40);
    },
  },
  b4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מתהפך'), type: 'impact', k: 1 }, { lt: s.cue('לפני'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, not = s.cue('המשך'), flip = s.cue('מתהפך'), before = s.cue('לפני');
      drawBG(ctx, s.t, { glow: 1.2 });
      const card = (y, h1, t2, col, p) => popT(ctx, W / 2, y, p, () => { glass(ctx, 120, y - 95, 840, 190, 30, { border: col, glowColor: col }); text(ctx, h1, 900, y - 25, { size: 58, weight: 900, align: 'right' }); text(ctx, t2, 900, y + 45, { size: 36, weight: 800, color: col, align: 'right' }); });
      card(560, 'FVG', 'המשך ⇢', C.teal, prog(lt, 0, 0.35));
      card(820, 'IFVG', 'היפוך ⇄', '#ff8a3d', prog(lt, flip - 0.1, flip + 0.3));
      cross(ctx, 210, 560, 34, prog(lt, not, not + 0.3) * prog(lt, flip - 0.1, flip));
      // timeline: IFVG before BOS
      const pt = prog(lt, before - 0.2, before + 0.4);
      if (pt > 0) { ctx.save(); ctx.globalAlpha = pt; glass(ctx, 120, 1000, 840, 220, 30);
        ctx.strokeStyle = C.axis; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(880, 1130); ctx.lineTo(200, 1130); ctx.stroke(); arrow(ctx, 880, 1130, 190, 1130, 1, { color: C.axis, width: 4, head: 20, glow: 0 });
        [[760, '1', 'IFVG', '#ff8a3d'], [420, '2', 'BOS', '#d61f45']].forEach(([x, n, l, c]) => { ctx.beginPath(); ctx.arc(x, 1130, 26, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); text(ctx, n, x, 1132, { size: 30, weight: 900, fam: MONO }); text(ctx, l, x, 1065, { size: 38, weight: 900, color: c }); });
        ctx.restore(); }
      wipeText(ctx, 'לא המשך · היפוך', W / 2, 300, prog(lt, not - 0.1, not + 0.3), { size: 66, weight: 900, color: '#ff8a3d' });
    },
  },

  // ================= CH3: bearish IFVG step by step =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 6, 'IFVG דובי', 'STEP BY STEP', { at: 0.4 }); } },
  c1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('Higher'), type: 'pop' }, { lt: s.cue('FVG'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chX, hh = s.cue('Higher'), fv = s.cue('FVG');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 24], [d, 2, 24]], { p: [62300, 65800] });
      ch.draw(ctx, { reveal: lerp(10, 17.9, prog(lt, 0, fv)) });
      const P = i => IVP.find(p => p[0] === i)[1] + 2000;
      ch.zigzag(ctx, [[0, P(0)], [6, P(6)], [10, P(10)], [17, P(17)]], prog(lt, hh - 0.5, hh + 0.6), { color: '#3df2a6', width: 5 });
      ch.tag(ctx, 17, P(17), 'HH', prog(lt, hh, hh + 0.3), { color: '#0b8f63', size: 26, off: 40 }); ch.tag(ctx, 10, P(10), 'HL', prog(lt, hh + 0.3, hh + 0.6), { color: '#0b8f63', above: false, size: 26, off: 40 });
      gapBox(ctx, ch, 12, XG, 24, prog(lt, fv - 0.1, fv + 0.4));
      badge(ctx, 'שלב 1 · FVG שורי במגמה', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 42);
    },
  },
  c2: {
    trans: 'none',
    events: s => [{ lt: s.cue('לקפוץ'), type: 'tick' }, { lt: s.cue('נסגר'), type: 'impact', k: 1.3 }, { lt: s.cue('התהפך'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chX, jump = s.cue('לקפוץ'), cl = s.cue('נסגר'), fl = s.cue('התהפך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 24], [d, 6, 28]], { p: [62600, 65800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 17.9], [jump, 21.9], [cl, 22.98], [d, 23.5]], E.lin)[0], highlight: i => i === 22 && lt > cl });
      gapBox(ctx, ch, 12, XG, 28, 1, { inv: prog(lt, fl - 0.1, fl + 0.5) });
      if (lt > cl) { hit(ctx, ch.X(22), ch.Y(XG[0]), lt, cl, C.down, 230); flashCol(ctx, lt, cl); }
      badge(ctx, 'שלב 2 · סגירה מתחת לפער', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 42);
    },
  },
  c3: {
    trans: 'none',
    events: s => [{ lt: s.cue('עולה'), type: 'whoosh' }, { lt: s.cue('נוגע'), type: 'tick' }, { lt: s.cue('ונדחה'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chX, up = s.cue('עולה'), touch = s.cue('נוגע'), rej = s.cue('ונדחה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 28], [d, 10, 30]], { p: [62600, 65800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 23.5], [up, 24.5], [touch, 26.6], [rej, 27.98], [d, 28.3]], E.lin)[0], highlight: i => i === 26 && lt > touch });
      gapBox(ctx, ch, 12, XG, 30, 1, { inv: 1 });
      if (lt > rej) { hit(ctx, ch.X(26), ch.Y(XG[0] + 300), lt, rej, C.down, 200); popT(ctx, ch.X(26) + 130, ch.Y(XG[1]) - 50, prog(lt, rej, rej + 0.3), () => pill(ctx, 'נדחה ✓', ch.X(26) + 130, ch.Y(XG[1]) - 50, { size: 30, color: '#d61f45' })); }
      badge(ctx, 'שלב 3 · חזרה לפער מלמטה', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 42);
    },
  },
  c4: {
    trans: 'none',
    events: s => [{ lt: s.cue('בשורט'), type: 'pop' }, { lt: s.cue('Lower'), type: 'pop' }, { lt: s.cue('Lower', 1), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chX, sh = s.cue('בשורט'), lh = s.cue('Lower'), ll = s.cue('Lower', 1);
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 30], [d, 8, 39]], { p: [61400, 65800] });
      ch.draw(ctx, { reveal: lerp(28.3, 38, prog(lt, sh, d - 0.2)) });
      gapBox(ctx, ch, 12, XG, 39, 1, { inv: 1 });
      popT(ctx, ch.X(26) + 120, ch.Y(XG[0]) + 30, prog(lt, sh, sh + 0.3), () => pill(ctx, 'כניסה: SHORT', ch.X(26) + 120, ch.Y(XG[0]) + 30, { size: 28, color: '#2962ff' }));
      ch.tag(ctx, 26, 64050, 'LH', prog(lt, lh, lh + 0.3), { color: '#d61f45', size: 28, off: 44 });
      ch.tag(ctx, 23, 63150, 'L', prog(lt, lh + 0.2, lh + 0.5), { color: '#d61f45', above: false, size: 24, off: 40 });
      if (lt > ll) { const i = 37; ch.tag(ctx, i, EXB[i].l, 'LL', prog(lt, ll, ll + 0.3), { color: '#d61f45', above: false, size: 28, off: 44 }); }
      badge(ctx, 'שלב 4 · כניסה, ומגמה חדשה', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 42);
    },
  },
  c5: {
    trans: 'none',
    events: s => [{ lt: s.cue('והיעד'), type: 'pop' }, { lt: s.cue('השאירה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chX, tg = s.cue('והיעד'), lows = s.cue('השפלים'), left = s.cue('השאירה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 39], [d, 0, 39]], { p: [61400, 65800] });
      ch.draw(ctx, { reveal: 38.9, dim: 0.2 });
      gapBox(ctx, ch, 12, XG, 39, 1, { inv: 1, label: false });
      const P = i => IVP.find(p => p[0] === i)[1] + 2000;
      [[10, P(10)], [0, P(0)]].forEach(([i, p], k) => { ch.hline(ctx, p, i, 39, { color: '#3df2a6', width: 3, dash: [10, 8], progress: prog(lt, lows + k * 0.2, lows + k * 0.2 + 0.5) }); if (k === 0) stopPills(ctx, ch, i, p, false, prog(lt, lows, lows + 0.8), 80); });
      if (lt > left) { hit(ctx, ch.X(35), ch.Y(P(10)), lt, left, C.up, 180); }
      badge(ctx, 'יעד: הנזילות שמתחת', prog(lt, tg, tg + 0.35), '#0b8f63', 300, W / 2, 42);
    },
  },

  // ================= CH4: bullish IFVG =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 6, 'IFVG שורי', 'THE MIRROR CASE', { at: 0.4 }); } },
  d1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('דובי'), type: 'pop' }, { lt: s.cue('לרדת'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, bear = s.cue('דובי'), down = s.cue('לרדת');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 24], [d, 4, 24]], { p: [60200, 63600] });
      ch.draw(ctx, { reveal: lerp(15, 20.9, prog(lt, 0, d)) });
      gapBox(ctx, ch, 12, MG, 24, prog(lt, bear - 0.1, bear + 0.4), { bull: true });
      ch.zigzag(ctx, [[17, MIR - PI(17)], [21, 62000], [24, 60400]], prog(lt, down - 0.3, down + 0.5), { color: 'rgba(255,90,114,0.85)', width: 5, dots: false });
      badge(ctx, 'מגמת ירידה · FVG דובי', prog(lt, 0.1, 0.45), '#d61f45', 300, W / 2, 42);
    },
  },
  d2: {
    trans: 'none',
    events: s => [{ lt: s.cue('נסגר'), type: 'impact', k: 1.3 }, { lt: s.cue('נשבר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, cl = s.cue('נסגר'), brk = s.cue('נשבר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 24], [d, 8, 28]], { p: [60200, 63600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 20.9], [cl - 0.4, 21.9], [cl, 22.98], [d, 23.3]], E.lin)[0], highlight: i => i === 22 && lt > cl });
      gapBox(ctx, ch, 12, MG, 28, 1, { bull: true, inv: prog(lt, brk - 0.1, brk + 0.5) });
      if (lt > cl) { hit(ctx, ch.X(22), ch.Y(MG[1]), lt, cl, C.up, 230); flashCol(ctx, lt, cl, '22,199,132', 0.2); }
      badge(ctx, 'נר ירוק נסגר מעל', prog(lt, cl, cl + 0.35), '#0b8f63', 300, W / 2, 44);
    },
  },
  d3: {
    trans: 'none',
    events: s => [{ lt: s.cue('חוזר'), type: 'whoosh' }, { lt: s.cue('לתמיכה'), type: 'impact', k: 1.1 }, { lt: s.cue('עלייה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, back = s.cue('חוזר'), sup = s.cue('לתמיכה'), up = s.cue('עלייה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 28], [sup, 10, 32], [d, 8, 38]], { p: [60200, 64400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 23.3], [back, 24.5], [sup, 27.98], [d - 0.2, 37]], E.lin)[0] });
      gapBox(ctx, ch, 12, MG, 38, 1, { bull: true, inv: 1 });
      popT(ctx, ch.X(29), ch.Y(MG[0]) + 40, prog(lt, sup - 0.2, sup + 0.2), () => pill(ctx, 'התנגדות → תמיכה', ch.X(29), ch.Y(MG[0]) + 40, { size: 28, color: '#0b8f63' }));
      if (lt > sup) hit(ctx, ch.X(26), ch.Y(MG[1] - 300), lt, sup, C.up, 200);
      badge(ctx, 'מגמת עלייה חדשה ↑', prog(lt, up, up + 0.35), '#0b8f63', 300, W / 2, 44);
    },
  },
  d4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('שורי'), type: 'pop' }, { lt: s.cue('דובי'), type: 'pop' }, { lt: s.cue('ההפוך'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, bu = s.cue('שורי'), be = s.cue('דובי'), op = s.cue('ההפוך');
      drawBG(ctx, s.t, { glow: 1.2 });
      const row = (y, a, b, ca, cb, t) => { const p = prog(lt, t - 0.1, t + 0.35); if (p <= 0) return; popT(ctx, W / 2, y, p, () => {
        glass(ctx, 100, y - 110, 880, 220, 30); pill(ctx, a, 760, y, { size: 40, color: ca }); arrow(ctx, 600, y, 470, y, 1, { color: '#fff', width: 8, head: 30, glow: 10 }); pill(ctx, b, 300, y, { size: 40, color: cb }); }); };
      row(620, 'FVG שורי נשבר', 'התנגדות', '#b8860b', '#d61f45', bu);
      row(920, 'FVG דובי נשבר', 'תמיכה', '#d61f45', '#0b8f63', be);
      wipeText(ctx, 'הסימטריה', W / 2, 300, prog(lt, 0, 0.35), { size: 76, weight: 900, color: C.neon });
      headlines(ctx, lt, [{ t: 'תמיד התפקיד ההפוך', at: op - 0.3, y: 1210, size: 72, color: C.gold, glowColor: C.gold }]);
    },
  },

  // ================= CH5: the killer combo =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 6, 'השילוב הקטלני', 'SWEEP + IFVG + BOS', { cueWord: 'השילוב' }); } },
  e1: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('תחבר'), type: 'riser' }],
    draw(ctx, s) {
      const { lt } = s, con = s.cue('תחבר');
      drawBG(ctx, s.t, { glow: 1.3 });
      seriesMap(ctx, lt, 3, 0, 900, { done: 4 });
      headlines(ctx, lt, [{ t: 'תחבר את הכל', at: con - 0.1, y: 560, size: 120, kind: 'pop' }]);
      for (let k = 0; k < 4; k++) ring(ctx, lerp(930, 150, k / 4), 900, 150, prog(lt, con + k * 0.12, con + k * 0.12 + 0.6), C.gold);
    },
  },
  e2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('סוויפ'), type: 'impact', k: 1.1 }, { lt: s.cue('נסגר'), type: 'impact', k: 1.2 }, { lt: s.cue('IFVG'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, sw = s.cue('סוויפ'), cl = s.cue('נסגר'), iv = s.cue('IFVG');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 32], [d, 12, 34]], { p: [61000, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 23.9], [sw, 25.98], [cl - 0.3, 26.9], [cl, 27.98], [d, 28]], E.lin)[0], highlight: i => (i === 25 && lt > sw) || (i === 27 && lt > cl) });
      ch.hline(ctx, 63010, 16, 34, { color: C.gold, width: 4 }); ch.tag(ctx, 20, 63010, 'EQH', 1, { color: '#b8860b', size: 24, off: 38 });
      gapBox(ctx, ch, 20, KG, 34, 1, { inv: prog(lt, iv - 0.1, iv + 0.4) });
      if (lt > sw) { hit(ctx, ch.X(25), ch.Y(63400), lt, sw, C.gold, 200); ch.tag(ctx, 25, 63400, '1 · SWEEP', prog(lt, sw, sw + 0.3), { color: C.purple, size: 26, off: 44 }); }
      if (lt > cl) { hit(ctx, ch.X(27), ch.Y(KG[0]), lt, cl, C.down, 200); ch.tag(ctx, 27, 62400, '2 · IFVG', prog(lt, iv, iv + 0.3), { color: '#d61f45', above: false, size: 26, off: 48 }); }
    },
  },
  e3: {
    trans: 'none',
    events: s => [{ lt: s.cue('נשבר'), type: 'impact', k: 1.2 }, { lt: s.cue('BOS'), type: 'pop' }, { lt: s.cue('היפוך'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, brk = s.cue('נשבר'), bos = s.cue('BOS'), rev = s.cue('היפוך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 34], [d, 12, 34]], { p: [61000, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 28], [brk, 28.98], [d, 29.5]], E.lin)[0], highlight: i => i === 28 && lt > brk });
      ch.hline(ctx, 63010, 16, 34, { color: C.gold, width: 3, alpha: 0.5 });
      gapBox(ctx, ch, 20, KG, 34, 1, { inv: 1, label: false });
      ch.tag(ctx, 25, 63400, '1 · SWEEP', 1, { color: C.purple, size: 26, off: 44 }); ch.tag(ctx, 27, 62400, '2 · IFVG', 1, { color: '#d61f45', above: false, size: 26, off: 48 });
      ch.hline(ctx, PK(19), 19, 34, { color: lt > brk ? C.down : '#fff', width: 4, dash: lt > brk ? null : [10, 8] }); ch.tag(ctx, 19, PK(19), 'HL', 1, { color: '#0b8f63', above: false, size: 24, off: 40 });
      if (lt > brk) { hit(ctx, ch.X(28), ch.Y(PK(19)), lt, brk, C.down, 200); ch.tag(ctx, 31, 62180, '3 · BOS', prog(lt, bos, bos + 0.3), { color: '#d61f45', above: false, size: 26, off: 60 }); }
      popT(ctx, W / 2, 300, prog(lt, rev - 0.1, rev + 0.3), () => pill(ctx, '3 קונפלואנסים = היפוך', W / 2, 300, { size: 48, color: '#d61f45', glow: 45 }));
    },
  },
  e4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('אחרי'), type: 'pop' }, { lt: s.cue('אמין'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, after = s.cue('אחרי'), without = s.cue('בלי'), rel = s.cue('אמין');
      drawBG(ctx, s.t);
      const card = (y, t1, t2, ok, col, t) => popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 110, y - 150, 860, 300, 30, { border: col, glowColor: col }); text(ctx, t1, 880, y - 40, { size: 60, weight: 900, align: 'right' }); text(ctx, t2, 880, y + 50, { size: 40, weight: 800, color: col, align: 'right' }); (ok ? check : cross)(ctx, 240, y, 56, 1); });
      card(640, 'SWEEP → IFVG', 'הכי אמין', true, '#0b8f63', after);
      card(1020, 'IFVG לבד', 'הרבה פחות אמין', false, '#d61f45', without);
      badge(ctx, 'טיפ חשוב', prog(lt, 0, 0.35), C.purple, 300, W / 2, 46);
      if (lt > rel) ring(ctx, W / 2, 640, 500, prog(lt, rel, rel + 0.7), C.up);
    },
  },

  // ================= CH6: TradingView + plan =================
  ch6: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 6, 6, 'תוכנית מסחר', 'TRADINGVIEW PLAN', { cueWord: 'תוכנית' }); } },
  f1: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('במלבן') - 0.2, type: 'click' }, { lt: s.cue('לסגירת'), type: 'tick' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, rect = s.cue('במלבן'), wait = s.cue('ומחכים');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(10, 32, 61200, 63700);
      ch.draw(ctx, { reveal: 26.9, tfs: ['15m', '1H', '4H', '1D'], highlight: i => i >= 20 && i <= 22 });
      const at = tvToolbar(ctx, 40, 466, 870, lt > rect - 0.2 ? 'rect' : null);
      const pr = prog(lt, rect, rect + 0.8);
      gapBox(ctx, ch, 20, KG, lerp(22.4, 32, pr), pr > 0 ? 1 : 0, { label: pr > 0.9 });
      const [rx, ry] = at('rect'); const c = kf(lt, [[0, 700, 1100], [rect - 0.3, rx, ry], [rect, ch.X(19.6), ch.Y(KG[1])], [rect + 0.8, ch.X(31), ch.Y(KG[0])]]);
      if (lt < wait + 0.5) cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - rect + 0.2) * 14), 1.1);
      if (lt > wait) { const secs = Math.max(0, Math.ceil(lerp(9, 1, prog(lt, wait, d)))); popT(ctx, W / 2, 300, prog(lt, wait, wait + 0.3), () => pill(ctx, `מחכים לסגירה · 00:0${secs}`, W / 2, 300, { size: 42, color: '#b8860b', glow: 40 })); }
    },
  },
  f2: {
    trans: 'none',
    events: s => [{ lt: s.cue('נסגר'), type: 'impact', k: 1.2 }, { lt: s.cue('צובעים'), type: 'click' }, { lt: s.cue('IFVG'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, cl = s.cue('נסגר'), paint = s.cue('צובעים'), iv = s.cue('IFVG');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(10, 32, 61200, 63700);
      ch.draw(ctx, { reveal: kf(lt, [[0, 26.9], [cl, 27.98], [d, 28.3]], E.lin)[0], tfs: ['15m', '1H', '4H', '1D'], highlight: i => i === 27 && lt > cl });
      tvToolbar(ctx, 40, 466, 870, 'rect');
      gapBox(ctx, ch, 20, KG, 32, 1, { inv: prog(lt, paint, paint + 0.6) });
      if (lt > cl) hit(ctx, ch.X(27), ch.Y(KG[0]), lt, cl, C.down, 200);
      // color picker swatch
      const pp = prog(lt, paint - 0.2, paint + 0.2) * (1 - prog(lt, iv, iv + 0.3));
      if (pp > 0) { ctx.save(); ctx.globalAlpha = pp; glass(ctx, 640, 520, 300, 110, 20, { fill: 'rgba(22,16,40,0.97)' }); ['#ffc94d', '#f23645', '#16c784', '#2962ff', '#a855f7'].forEach((c, k) => { ctx.beginPath(); ctx.arc(680 + k * 56, 575, 20, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); if (k === 1) { ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke(); } }); ctx.restore();
        cursor(ctx, 736 + 10, 585, Math.exp(-Math.abs(lt - paint) * 14), 1.0); }
      popT(ctx, W / 2, 300, prog(lt, iv, iv + 0.35), () => pill(ctx, 'עכשיו זה IFVG', W / 2, 300, { size: 52, color: '#d61f45', glow: 45 }));
    },
  },
  f2b: {
    trans: 'whip',
    events: s => [{ lt: s.cue('בורח'), type: 'whoosh' }, { lt: s.cue('עסקה'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, run = s.cue('בורח'), deal = s.cue('עסקה'), chase = s.cue('תרדוף');
      // a version of the bearish IFVG where price never comes back
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 30], [d, 10, 32]], { p: [58600, 63800] });
      ch.draw(ctx, { reveal: 22.98, dim: 0.1 });
      gapBox(ctx, ch, 12, IG, 32, 1, { inv: 1 });
      ch.zigzag(ctx, [[22, 61500], [26, 60100], [31, 58900]], prog(lt, run - 0.2, run + 0.8), { color: '#ff5a72', width: 6, dots: false });
      if (lt > chase) cross(ctx, ch.X(27), ch.Y(60100) - 60, 28, prog(lt, chase, chase + 0.3));
      popT(ctx, W / 2, 300, prog(lt, deal - 0.2, deal + 0.2), () => pill(ctx, 'אין חזרה לפער = אין עסקה', W / 2, 300, { size: 44, color: '#d61f45', glow: 40 }));
    },
  },
  f3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הכניסה'), type: 'pop' }, { lt: s.cue('הסטופ'), type: 'pop' }, { lt: s.cue('והיעד'), type: 'pop' }, { lt: s.cue('הבאה'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, en = s.cue('הכניסה'), st = s.cue('הסטופ'), tg = s.cue('והיעד'), nx = s.cue('הבאה');
      const EN = KG[0], SL = 62850, TP = PK(10) + 100;
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 36], [d, 6, 42]], { p: [60600, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 29], [en, 30.98], [tg, 31.5], [d - 0.2, 41.5]], E.lin)[0] });
      gapBox(ctx, ch, 20, KG, 42, 1, { inv: 1, label: false, alpha: 0.2 });
      ch.hline(ctx, EN, 28, 42, { color: '#fff', width: 4, progress: prog(lt, en, en + 0.4) });
      popT(ctx, ch.X(36), ch.Y(EN) + 34, prog(lt, en, en + 0.3), () => pill(ctx, 'כניסה: חזרה לפער', ch.X(36), ch.Y(EN) + 34, { size: 26, color: '#2962ff' }));
      ch.hline(ctx, SL, 28, 42, { color: C.down, width: 4, progress: prog(lt, st, st + 0.4) });
      popT(ctx, ch.X(36), ch.Y(SL) - 34, prog(lt, st, st + 0.3), () => pill(ctx, 'סטופ: מעבר לקצה הרחוק', ch.X(36), ch.Y(SL) - 34, { size: 26, color: '#d61f45' }));
      positionBox(ctx, ch, 31, 42, EN, SL, TP, prog(lt, tg, tg + 0.8), { rr: true });
      ch.hline(ctx, PK(10), 10, 42, { color: '#3df2a6', width: 3, dash: [10, 8], progress: prog(lt, tg, tg + 0.5) });
      ch.tag(ctx, 10, PK(10), 'יעד: הנזילות הבאה', prog(lt, tg, tg + 0.3), { color: '#0b8f63', above: false, size: 24, off: 40 });
      if (lt > nx) hit(ctx, ch.X(41), ch.Y(TP), lt, nx, C.up, 200);
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('IFVG'), type: 'pop' }, { lt: s.cue('תפקיד'), type: 'pop' }, { lt: s.cue('ונכנסים'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['IFVG', 'FVG שנר נסגר דרכו', '#e0546b', s.cue('IFVG'), 'warn'],
        ['מחליף תפקיד', 'תמיכה ⇄ התנגדות', C.purple, s.cue('תפקיד'), 'zz'],
        ['נכנסים בחזרה אליו', 'עדיף אחרי סוויפ', '#0fa36b', s.cue('ונכנסים'), 'check'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('זול'), type: 'pop' }, { lt: s.cue('יקר'), type: 'pop' }, { lt: s.cue('Equilibrium'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, one = s.cue('נשאר'), cheap = s.cue('זול'), exp = s.cue('יקר'), eq = s.cue('Equilibrium');
      drawBG(ctx, s.t, { glow: 1.3 });
      headlines(ctx, lt, [{ t: 'נשאר קונפלואנס אחד', at: one, y: 400, size: 80 }]);
      // price tag teaser: premium / discount bar
      const pb = prog(lt, cheap - 0.2, cheap + 0.3);
      if (pb > 0) { ctx.save(); ctx.globalAlpha = pb; const x = 240, w = 600, y0 = 560, h = 520;
        ctx.fillStyle = 'rgba(242,54,69,0.3)'; ctx.fillRect(x, y0, w, h / 2); ctx.fillStyle = 'rgba(22,199,132,0.3)'; ctx.fillRect(x, y0 + h / 2, w, h / 2);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(x, y0 + h / 2); ctx.lineTo(x + w, y0 + h / 2); ctx.stroke(); ctx.restore();
        text(ctx, 'זול', x + w / 2, y0 + h * 0.75, { size: 80, weight: 900, color: '#3df2a6', alpha: pb });
        text(ctx, 'יקר', x + w / 2, y0 + h * 0.25, { size: 80, weight: 900, color: '#ff5a72', alpha: prog(lt, exp - 0.1, exp + 0.3) }); }
      popT(ctx, W / 2, 1230, prog(lt, eq - 0.1, eq + 0.35), () => pill(ctx, 'הבא: EQUILIBRIUM', W / 2, 1230, { size: 50, color: C.purple, glow: 50 }));
      ring(ctx, W / 2, 1230, 520, prog(lt, eq, eq + 0.7));
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

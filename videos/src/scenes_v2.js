// Video 2 — 3 נרות שכל סוחר חייב להכיר
'use strict';
const PANEL2 = [40, 370, 1000, 970];
function after(cs, i, q) { cs[i] = q; if (cs[i + 1]) cs[i + 1].o = q.c; cs.forEach(x => { x.h = Math.max(x.h, x.o, x.c); x.l = Math.min(x.l, x.o, x.c); }); return cs; }

// hook: one big candle inside a chart
const HK = genCandles([[0, 62600], [8, 63400], [14, 62900], [22, 63800], [28, 63200], [34, 64300], [39, 63900], [41, 64000]], { seed: 31 });
after(HK, 40, { o: 64000, c: 66000, h: 66450, l: 63250 });
const chHK = new Chart(HK.slice(0, 41));
// hammer
const HM = genCandles([[0, 67500], [6, 66300], [9, 66900], [16, 65000], [19, 65600], [24, 64200], [34, 66600]], { seed: 8 });
after(HM, 25, { o: HM[24].c, c: HM[24].c + 190, h: HM[24].c + 250, l: 62900 });
const chHM = new Chart(HM);
// engulfing
const EG = genCandles([[0, 3420], [8, 3300], [12, 3350], [20, 3205], [30, 3345]], { seed: 13, noise: 0.15 });
after(EG, 21, { o: EG[20].c, c: EG[20].c - 34, h: EG[20].c + 6, l: EG[20].c - 42 });
after(EG, 22, { o: EG[21].c - 6, c: EG[20].c + 30, h: EG[20].c + 38, l: EG[21].c - 14 });
EG[22].o = EG[21].c - 6;
for (let i = 23; i < 30; i++) { const o = EG[i - 1].c, c = o + 9 + (i % 3) * 5; EG[i] = { o, c, h: c + 6, l: o - 5 }; }
const chEG = new Chart(EG.slice(0, 30), { sym: 'ETHUSD' });
// doji
const DJ = genCandles([[0, 64000], [6, 64600], [10, 64200], [15, 64700], [19, 64400]], { seed: 17, noise: 0.25 });
after(DJ, 20, { o: DJ[19].c, c: DJ[19].c + 12, h: DJ[19].c + 260, l: DJ[19].c - 250 });
[[520, 120], [640, 90], [560, 140], [300, 160]].forEach(([b, w], k) => { const o = DJ[20 + k].c; DJ.push({ o, c: o + b, h: o + b + w, l: o - 40 }); });
const chDJ = new Chart(DJ);
// secret: hammer with no level (top) vs at support (bottom)
const SA = genCandles([[0, 65200], [5, 65800], [9, 65000], [14, 65700], [18, 65100], [23, 65600], [28, 65150]], { seed: 41, noise: 0.35 });
after(SA, 16, { o: SA[15].c, c: SA[15].c + 60, h: SA[15].c + 90, l: SA[15].c - 520 });
const SUP = 62000;
const SB = genCandles([[0, 64600], [6, 62050], [10, 63300], [14, 62080], [18, 63100], [22, 62300], [30, 65200]], { seed: 43 });
after(SB, 22, { o: 62550, c: 62750, h: 62820, l: 61850 }); SB[21].c = 62550;
for (let i = 23; i < 31; i++) { const o = SB[i - 1].c, c = o + 230 + (i % 2) * 120; SB[i] = { o, c, h: c + 80, l: o - 60 }; }
const chSA = new Chart(SA), chSB = new Chart(SB);
// TradingView demo: same support chart, patterns labelled
const TVC = SB.map(q => ({ ...q }));
after(TVC, 8, { o: TVC[7].c, c: TVC[7].c - 120, h: TVC[7].c + 20, l: TVC[7].c - 150 });
after(TVC, 9, { o: TVC[8].c - 20, c: TVC[7].c + 90, h: TVC[7].c + 130, l: TVC[8].c - 40 });
after(TVC, 16, { o: TVC[15].c, c: TVC[15].c + 8, h: TVC[15].c + 190, l: TVC[15].c - 180 });
const chTV = new Chart(TVC);

function titlePill(ctx, num, he, en, p) {
  popT(ctx, W / 2, 300, p, () => {
    const w = pill(ctx, `${he}  ·  ${en}`, W / 2 - 10, 300, { size: 44, color: C.purple, weight: 900, glow: 40 });
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2 - 10 + w / 2 + 52, 300, 40, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.shadowColor = C.purple; ctx.shadowBlur = 30; ctx.fill(); ctx.restore();
    text(ctx, String(num), W / 2 - 10 + w / 2 + 52, 302, { size: 50, weight: 900, color: C.violet });
  });
}
function bracket(ctx, x, y0, y1, side, color, p, label) { // vertical bracket + label
  if (p <= 0) return;
  const e = E.outCubic(p), ym = (y0 + y1) / 2, d = side * 26;
  ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, lerp(ym, y0, e)); ctx.lineTo(x + d, lerp(ym, y0, e)); ctx.moveTo(x + d, lerp(ym, y0, e)); ctx.lineTo(x + d, lerp(ym, y1, e)); ctx.lineTo(x, lerp(ym, y1, e)); ctx.stroke(); ctx.restore();
  if (label) popT(ctx, x + d + side * 20, ym, p, () => text(ctx, label, x + d + side * 20, ym, { size: 40, weight: 900, color, align: side > 0 ? 'left' : 'right', stroke: 10 }));
}
function bigCandle(ctx, x, yh, yc, yo, yl, w, col, o = {}) {
  const { glow = 40, wickGlow = 0 } = o;
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.shadowColor = col; ctx.lineCap = 'round';
  ctx.shadowBlur = wickGlow || glow * 0.5; ctx.lineWidth = w * 0.12; ctx.beginPath(); ctx.moveTo(x, yh); ctx.lineTo(x, yl); ctx.stroke();
  ctx.shadowBlur = glow; rrect(ctx, x - w / 2, Math.min(yo, yc), w, Math.max(4, Math.abs(yo - yc)), 10); ctx.fill(); ctx.restore();
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('אחד'), type: 'pop' }, { lt: s.cue('הקונים'), type: 'pop' }, { lt: s.cue('והמוכרים'), type: 'pop' }, { lt: s.cue('לקרוא'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chHK, z = s.cue('לקרוא') - 0.1;
      drawBG(ctx, s.t, { glow: 1.2 });
      const f = clamp(lt / (z + 0.1));
      const zp = E.inOut(prog(lt, z, z + 0.9));
      const span = lerp(2.2, 42, zp);
      const [pa, pb] = ch.autoP(40 - span, 41, 0.15);
      ch.layout(0, 250, W, 1250, { head: 0, axis: lerp(0, 150, zp), foot: 0 }).view(40.5 - span * lerp(0.5, 0.96, zp), 40.5 + span * lerp(0.5, 0.04, zp), lerp(63000, pa, zp), lerp(66700, pb, zp));
      ch.draw(ctx, { reveal: 40 + Math.min(0.999, f), frame: false, header: false, lastTag: true });
      const a = s.cue('אחד'), b = s.cue('הקונים'), c = s.cue('והמוכרים');
      const out = 1 - prog(lt, z - 0.1, z + 0.2);
      ctx.save(); ctx.globalAlpha = out;
      popT(ctx, W / 2, 330, prog(lt, a - 0.2, a + 0.2), () => text(ctx, 'נר אחד', W / 2, 330, { size: 150, weight: 900, glow: 40, glowColor: C.purple, stroke: 18 }));
      popT(ctx, W / 2 + 230, 1420, prog(lt, b - 0.05, b + 0.3), () => text(ctx, 'הקונים', W / 2 + 230, 1420, { size: 110, weight: 900, color: '#3df2a6', glow: 40, stroke: 16 }));
      popT(ctx, W / 2 - 230, 1420, prog(lt, c - 0.05, c + 0.3), () => text(ctx, 'המוכרים', W / 2 - 230, 1420, { size: 110, weight: 900, color: '#ff5a72', glow: 40, stroke: 16 }));
      ctx.restore();
      const p2 = prog(lt, z, z + 0.35);
      popT(ctx, W / 2, 1450, p2, () => text(ctx, 'אם אתה יודע לקרוא אותו', W / 2, 1450, { size: 72, weight: 900, color: C.purple2, stroke: 14, glow: 30, glowColor: C.purple }));
    },
  },

  anatomy: {
    trans: 'zoom',
    events: s => ['פתיחה', 'סגירה', 'גבוה', 'ונמוך', 'הגוף', 'והפתילים'].map(w => ({ lt: s.cue(w), type: 'pop' })),
    draw(ctx, s) {
      const { lt } = s;
      drawBG(ctx, s.t);
      const g = E.outCubic(prog(lt, 0, 0.7)), x = 430;
      const yo = 1180, yc = lerp(1180, 720, g), yh = lerp(1180, 520, g), yl = lerp(1180, 1330, g);
      const body = s.cue('הגוף'), wk = s.cue('והפתילים');
      const wg = lt > wk ? 30 + 25 * Math.sin(lt * 10) : 0;
      bigCandle(ctx, x, yh, yc, yo, yl, 230, C.up, { glow: lt > body && lt < wk ? 70 : 35, wickGlow: wg });
      const labs = [['פתיחה', 'Open', yo, s.cue('פתיחה')], ['סגירה', 'Close', yc, s.cue('סגירה')], ['גבוה', 'High', yh, s.cue('גבוה')], ['נמוך', 'Low', yl, s.cue('ונמוך')]];
      labs.forEach(([he, en, y, t0]) => {
        const p = prog(lt, t0 - 0.05, t0 + 0.3); if (p <= 0) return;
        const x0 = x + (he === 'גבוה' || he === 'נמוך' ? 14 : 125), x1 = lerp(x0, 690, E.outCubic(p));
        ctx.save(); ctx.strokeStyle = C.purple2; ctx.lineWidth = 4; ctx.shadowColor = C.purple; ctx.shadowBlur = 15; ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.arc(x0, y, 9, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
        popT(ctx, 860, y, p, () => { text(ctx, he, 1000, y - 18, { size: 62, weight: 900, align: 'right' }); text(ctx, en, 1000, y + 36, { size: 32, weight: 700, color: C.purple2, align: 'right', fam: MONO }); });
      });
      bracket(ctx, x - 140, yc, yo, -1, '#3df2a6', prog(lt, body, body + 0.4), 'מי ניצח');
      if (lt > wk) {
        const p = prog(lt, wk, wk + 0.4);
        popT(ctx, 170, 520, p, () => pill(ctx, 'פתיל = דחייה', 190, 520, { size: 36, color: '#d61f45' }));
        ring(ctx, x, yh + 40, 140, prog(lt, wk, wk + 0.6), C.down); ring(ctx, x, yl - 40, 140, prog(lt, wk + 0.1, wk + 0.7), C.down);
      }
    },
  },

  three: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1.3 }, { lt: s.cue('נרות'), type: 'pop' }, { lt: s.cue('חייב'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s;
      drawBG(ctx, s.t, { glow: 1.5 });
      popT(ctx, W / 2, 700, prog(lt, 0, 0.35), () => text(ctx, '3', W / 2, 700, { size: 560, weight: 900, color: C.purple2, glow: 90, glowColor: C.purple }));
      wipeText(ctx, 'נרות שכל סוחר', W / 2, 1060, prog(lt, s.cue('נרות'), s.cue('נרות') + 0.35), { size: 96, weight: 900 });
      wipeText(ctx, 'חייב להכיר', W / 2, 1170, prog(lt, s.cue('חייב'), s.cue('חייב') + 0.35), { size: 96, weight: 900, color: C.gold });
      const icons = [[W / 2 + 260, 'hammer'], [W / 2, 'engulf'], [W / 2 - 260, 'doji']];
      icons.forEach(([x, k], j) => {
        const p = prog(lt, 0.4 + j * 0.25, 0.75 + j * 0.25), y = 1420;
        popT(ctx, x, y, p, () => {
          glass(ctx, x - 95, y - 120, 190, 240, 26);
          if (k === 'hammer') bigCandle(ctx, x, y - 75, y - 70, y - 30, y + 85, 54, C.up, { glow: 20 });
          if (k === 'engulf') { bigCandle(ctx, x - 30, y - 40, y - 30, y + 30, y + 45, 34, C.down, { glow: 15 }); bigCandle(ctx, x + 28, y - 85, y - 70, y + 50, y + 70, 48, C.up, { glow: 20 }); }
          if (k === 'doji') bigCandle(ctx, x, y - 85, y - 2, y + 2, y + 85, 60, '#d9d2f0', { glow: 20 });
        });
      });
    },
  },

  hammer: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הפטיש'), type: 'impact', k: 1 }, { lt: s.cue('גוף'), type: 'pop' }, { lt: s.cue('ופתיל'), type: 'pop' }, { lt: s.cue('המוכרים'), type: 'whoosh' }, { lt: s.cue('הקונים'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chHM;
      drawBG(ctx, s.t);
      const nm = s.cue('הפטיש'), body = s.cue('גוף'), wk = s.cue('ופתיל'), sel = s.cue('המוכרים'), buy = s.cue('הקונים'), up = s.cue('למעלה');
      ch.layout(...PANEL2).view(...kf(lt, [[0, 0, 32], [body - 0.2, 0, 32], [body + 0.4, 16, 30], [up - 0.2, 16, 30], [up + 0.6, 6, 36]]), ...[]);
      ch.view(ch.v.i0, ch.v.i1, ...ch.autoP(lt > up ? 6 : 14, 36, 0.12).map((v, k) => k ? Math.max(v, 66000) : Math.min(v, 62500)));
      const rev = lt < up ? lerp(20, 26, prog(lt, 0, nm + 0.3)) : lerp(26, 35, prog(lt, up - 0.1, d - 0.2));
      ch.draw(ctx, { reveal: rev, highlight: i => i === 25 && lt > nm });
      titlePill(ctx, 1, 'הפטיש', 'HAMMER', prog(lt, nm - 0.05, nm + 0.3));
      const q = HM[25], x = ch.X(25);
      bracket(ctx, x + ch.cw() * 0.55, ch.Y(q.c), ch.Y(q.o) + 1, 1, C.purple2, prog(lt, body, body + 0.35), 'גוף קטן');
      bracket(ctx, x + ch.cw() * 0.55, ch.Y(q.o) + 10, ch.Y(q.l), 1, C.gold, prog(lt, wk, wk + 0.35), 'פתיל ארוך');
      arrow(ctx, x - 120, ch.Y(q.o) - 20, x - 120, ch.Y(q.l) + 10, prog(lt, sel, sel + 0.5), { color: C.down, width: 12, head: 44 });
      if (lt > sel) text(ctx, 'מוכרים', x - 140, ch.Y(q.l) + 70, { size: 40, weight: 900, color: '#ff5a72', alpha: prog(lt, sel, sel + 0.3), stroke: 10 });
      arrow(ctx, x - 200, ch.Y(q.l) + 10, x - 200, ch.Y(q.c) - 20, prog(lt, buy, buy + 0.5), { color: C.up, width: 12, head: 44 });
      if (lt > buy) text(ctx, 'קונים', x - 220, ch.Y(q.c) - 70, { size: 40, weight: 900, color: '#3df2a6', alpha: prog(lt, buy, buy + 0.3), stroke: 10 });
    },
  },

  engulf: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הבולע'), type: 'impact', k: 1 }, { lt: s.cue('שבולע'), type: 'pop' }, { lt: s.cue('הכוח'), type: 'impact', k: 0.8 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chEG;
      drawBG(ctx, s.t);
      const nm = s.cue('הבולע'), gr = s.cue('ירוק'), eat = s.cue('שבולע'), red = s.cue('האדום'), pw = s.cue('הכוח');
      ch.layout(...PANEL2).view(...kf(lt, [[0, 4, 28], [gr, 13, 26], [pw - 0.1, 13, 26], [pw + 0.6, 6, 31]]), ...[]);
      ch.view(ch.v.i0, ch.v.i1, ...ch.autoP(lt > pw ? 6 : 13, lt > pw ? 31 : 26, 0.15));
      const rev = lt < pw ? lerp(17, 22, prog(lt, 0, gr - 0.2)) + prog(lt, gr - 0.2, eat + 0.1) : lerp(23, 30, prog(lt, pw - 0.1, d - 0.2));
      ch.draw(ctx, { reveal: Math.min(rev, 30), highlight: i => (i === 21 || i === 22) && lt > eat });
      titlePill(ctx, 2, 'הנר הבולע', 'ENGULFING', prog(lt, nm - 0.05, nm + 0.3));
      const pe = prog(lt, eat, eat + 0.4);
      if (pe > 0 && lt < pw) {
        const a = EG[21], b = EG[22], x0 = ch.X(21) - ch.cw() * 0.5, x1 = ch.X(22) + ch.cw() * 0.5, y0 = ch.Y(b.c) - 12, y1 = ch.Y(b.o) + 12;
        ctx.save(); ctx.globalAlpha = clamp(pe * 2); ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.setLineDash([12, 9]); ctx.shadowColor = C.gold; ctx.shadowBlur = 20;
        rrect(ctx, x0, y0, x1 - x0, y1 - y0, 12); ctx.stroke(); ctx.restore();
        popT(ctx, (x0 + x1) / 2, y1 + 70, pe, () => pill(ctx, 'בולע את הגוף', (x0 + x1) / 2, y1 + 70, { size: 34, color: '#b8860b' }));
      }
      if (lt > red) { const x = ch.X(21); ring(ctx, x, ch.Y(EG[21].c), 90, prog(lt, red, red + 0.6), C.down); }
      arrow(ctx, ch.X(23), ch.Y(EG[23].l) + 60, ch.X(29), ch.Y(EG[29].h) - 20, prog(lt, pw + 0.3, pw + 0.9), { color: C.up, width: 12, head: 46 });
      badge(ctx, 'הכוח עבר לקונים', prog(lt, pw, pw + 0.35), '#0fa36b', 1270, W / 2, 40);
    },
  },

  doji: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הדוג'), type: 'impact', k: 1 }, { lt: s.cue('פתיחה'), type: 'pop' }, { lt: s.cue('ניצח'), type: 'pop' }, { lt: s.cue('חדה'), type: 'impact', k: 1.6 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chDJ;
      drawBG(ctx, s.t);
      const nm = s.cue('הדוג'), op = s.cue('פתיחה'), win = s.cue('ניצח'), hes = s.cue('מתלבט'), go = s.cue('חדה');
      ch.layout(...PANEL2).view(...kf(lt, [[0, 3, 26], [op, 12, 24], [go - 0.2, 12, 24], [go + 0.3, 6, 27]]), ...[]);
      ch.view(ch.v.i0, ch.v.i1, ...ch.autoP(lt > go ? 6 : 12, lt > go ? 27 : 22, 0.2));
      const rev = lt < go ? 20 + Math.min(0.999, prog(lt, 0.2, op + 0.1)) : lerp(21, 25, E.outCubic(prog(lt, go - 0.1, go + 0.7)));
      ch.draw(ctx, { reveal: rev, highlight: i => i === 20 && lt > nm });
      titlePill(ctx, 3, 'הדוג\'י', 'DOJI', prog(lt, nm - 0.05, nm + 0.3));
      const q = DJ[20], x = ch.X(20), po = prog(lt, op, op + 0.4);
      if (po > 0 && lt < go) {
        ch.hline(ctx, q.o, 16, 23, { color: '#fff', width: 3, dash: [8, 8], progress: po });
        popT(ctx, x - 230, ch.Y(q.o), po, () => pill(ctx, 'פתיחה ≈ סגירה', x - 230, ch.Y(q.o) - 60, { size: 34, color: C.purple }));
      }
      const pwn = prog(lt, win, win + 0.35);
      if (lt < go) popT(ctx, W / 2, 1270, pwn, () => pill(ctx, 'תיקו: אף צד לא ניצח', W / 2, 1270, { size: 42, color: 'rgba(30,20,60,0.95)', glow: 30 }));
      if (lt > hes && lt < go) for (let k = 0; k < 3; k++) {
        const qx = x + (k - 1) * 90, qy = ch.Y(q.h) - 70 + Math.sin(lt * 6 + k * 2) * 14;
        popT(ctx, qx, qy, prog(lt, hes + k * 0.1, hes + k * 0.1 + 0.3), () => text(ctx, '?', qx, qy, { size: 72, weight: 900, color: C.gold, glow: 25 }));
      }
      if (lt > go) {
        burst(ctx, ch.X(22), ch.Y(DJ[22].c), prog(lt, go, go + 0.9), '#3df2a6', 28, 9, 300);
        badge(ctx, 'תנועה חדה!', prog(lt, go, go + 0.3), '#0fa36b', 1270, W / 2, 48);
      }
    },
  },

  secret: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('הסוד'), type: 'riser' }, { lt: s.cue('כלום'), type: 'impact', k: 1 }, { lt: s.cue('רמה'), type: 'pop' }, { lt: s.cue('תמיכה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s;
      drawBG(ctx, s.t, { glow: 1.1 });
      const sec = s.cue('הסוד'), no = s.cue('כלום'), lvl = s.cue('רמה'), sup = s.cue('תמיכה'), res = s.cue('התנגדות');
      // intro: "the secret" lock-up
      const pIntro = 1 - prog(lt, s.cue('נר') - 0.2, s.cue('נר'));
      if (pIntro > 0) {
        ctx.save(); ctx.globalAlpha = pIntro;
        popT(ctx, W / 2, 760, prog(lt, 0, 0.3), () => text(ctx, 'הסוד', W / 2, 760, { size: 230, weight: 900, color: C.gold, glow: 60 }));
        wipeText(ctx, 'שרוב המתחילים מפספסים', W / 2, 960, prog(lt, s.cue('שרוב'), s.cue('שרוב') + 0.4), { size: 72, weight: 800 });
        ctx.restore();
        return;
      }
      const pin = E.outCubic(prog(lt, s.cue('נר') - 0.2, s.cue('נר') + 0.3));
      ctx.save(); ctx.globalAlpha = pin;
      chSA.layout(40, 360, 1000, 470, { head: 70 }).view(0, 29); chSA.draw(ctx, { reveal: 29, lastTag: false });
      chSB.layout(40, 870, 1000, 470, { head: 70 }).view(0, 31, 61500, 65600);
      chSB.zone(ctx, SUP + 280, SUP - 200, 0, 31, { color: C.purple, progress: prog(lt, lvl, lvl + 0.5), alpha: 0.25 });
      chSB.draw(ctx, { reveal: lt > lvl + 0.3 ? lerp(23, 31, prog(lt, lvl + 0.3, d - 0.3)) : 23, lastTag: false });
      chSB.zone(ctx, SUP + 280, SUP - 200, 0, 31, { color: C.purple, progress: prog(lt, lvl, lvl + 0.5), alpha: 0.18, label: lt > sup ? 'תמיכה' : null });
      ctx.restore();
      // verdicts
      const sx = chSA.X(16), sy = chSA.Y(SA[16].l);
      ring(ctx, sx, sy, 90, prog(lt, no - 0.3, no + 0.3), C.down);
      cross(ctx, sx, chSA.Y(SA[16].h) - 70, 38, prog(lt, no, no + 0.35));
      popT(ctx, sx - 210, chSA.Y(SA[16].h) - 70, prog(lt, no, no + 0.35), () => pill(ctx, 'באמצע שום מקום', sx - 220, chSA.Y(SA[16].h) - 70, { size: 32, color: '#d61f45' }));
      const bx = chSB.X(22), by = chSB.Y(SB[22].l);
      ring(ctx, bx, by, 90, prog(lt, lvl, lvl + 0.6), C.up);
      check(ctx, bx, by + 70, 38, prog(lt, lvl + 0.2, lvl + 0.55));
      popT(ctx, bx + 230, by + 70, prog(lt, lvl + 0.2, lvl + 0.55), () => pill(ctx, 'ליד רמה = כוח', bx + 230, by + 70, { size: 32, color: '#0fa36b' }));
      if (lt > res) popT(ctx, W / 2, 300, prog(lt, res, res + 0.35), () => pill(ctx, 'תמיכה · התנגדות · אזור ביקוש', W / 2, 300, { size: 36, color: C.purple }));
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('והגרף') - 0.15, type: 'click' }, ...[0, 1, 2].map(k => ({ lt: s.cue('יסמן') + k * 0.25, type: 'pop' })), { lt: s.cue('הרמות'), type: 'click' },
      ...Array.from({ length: 14 }, (_, k) => ({ lt: s.cue('באינדיקטורים') + 0.1 + k * 0.08, type: 'tick' }))],
    draw(ctx, s) {
      const { lt, d } = s, ch = chTV;
      drawBG(ctx, s.t);
      const ind = s.cue('באינדיקטורים'), pick = s.cue('והגרף') - 0.15, mark = s.cue('יסמן'), lv = s.cue('הרמות'), self = s.cue('בעצמך');
      ch.layout(...PANEL2).view(0, 31, 61400, 66000);
      const dz = prog(lt, lv + 0.1, self + 0.2);
      ch.zone(ctx, SUP + 280, SUP - 200, 1, lerp(1, 31, dz), { color: C.purple, progress: dz > 0 ? 1 : 0, alpha: 0.22 });
      ch.draw(ctx, { reveal: 31 });
      ch.zone(ctx, SUP + 280, SUP - 200, 1, lerp(1, 31, dz), { color: C.purple, progress: dz > 0 ? 1 : 0, alpha: 0.12, label: lt > self ? 'הרמה שלך' : null });
      // auto pattern flags
      [[9, 'Engulfing', true], [16, 'Doji', false], [22, 'Hammer', true]].forEach(([i, nm, below], k) => {
        const p = prog(lt, mark + k * 0.25, mark + k * 0.25 + 0.35); if (p <= 0) return;
        const q = TVC[i], x = ch.X(i), y = below ? ch.Y(q.l) + 60 : ch.Y(q.h) - 60;
        popT(ctx, x, y, p, () => {
          const w = measure(ctx, nm, 28, 700) + 26; ctx.save(); rrect(ctx, x - w / 2, y - 22, w, 44, 8); ctx.fillStyle = below ? '#0b8f63' : '#2962ff'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(x - 10, below ? y - 22 : y + 22); ctx.lineTo(x + 10, below ? y - 22 : y + 22); ctx.lineTo(x, below ? y - 36 : y + 36); ctx.fill(); ctx.restore();
          text(ctx, nm, x, y + 1, { size: 28, weight: 700 });
        });
      });
      // indicators dialog
      const pd = prog(lt, ind - 0.2, ind + 0.15) * (1 - prog(lt, pick + 0.15, pick + 0.4));
      if (pd > 0) {
        scrim(ctx, 0.45 * pd);
        ctx.save(); ctx.globalAlpha = pd; const dy = (1 - E.outCubic(pd)) * 60;
        const bx = 110, by = 470 + dy, bw = 860, bh = 640;
        glass(ctx, bx, by, bw, bh, 26, { fill: 'rgba(22,16,40,0.97)' });
        text(ctx, 'Indicators, metrics & strategies', bx + 40, by + 60, { size: 34, weight: 700, align: 'left' });
        rrect(ctx, bx + 36, by + 110, bw - 72, 76, 14); ctx.fillStyle = '#0d0a19'; ctx.fill(); ctx.strokeStyle = C.purple; ctx.lineWidth = 3; ctx.stroke();
        const q = 'Candlestick Patterns', n = Math.floor(prog(lt, ind + 0.1, ind + 0.1 + q.length * 0.055) * q.length), typed = q.slice(0, n);
        text(ctx, typed + (Math.floor(lt * 3) % 2 ? '|' : ''), bx + 70, by + 149, { size: 36, weight: 600, align: 'left' });
        const rows = ['All Candlestick Patterns', 'Hammer - Bullish', 'Engulfing - Bullish', 'Doji'];
        if (n >= 6) rows.forEach((r, k) => {
          const ry = by + 250 + k * 92, hot = k === 0;
          if (hot) { rrect(ctx, bx + 24, ry - 40, bw - 48, 80, 12); ctx.fillStyle = lt > pick - 0.3 ? 'rgba(168,85,247,0.45)' : 'rgba(168,85,247,0.18)'; ctx.fill(); }
          text(ctx, r, bx + 70, ry, { size: 34, weight: hot ? 800 : 500, align: 'left', color: hot ? '#fff' : C.dim });
          text(ctx, 'Built-in', bx + bw - 60, ry, { size: 24, weight: 500, align: 'right', color: C.axis, fam: MONO });
        });
        ctx.restore();
        const cxy = kf(lt, [[ind, 700, 1300], [pick - 0.3, 500, 720], [pick, 480, 730]]);
        cursor(ctx, cxy[0], cxy[1], Math.exp(-Math.abs(lt - pick) * 14), 1.15);
      }
      // drawing the level yourself
      if (lt > lv - 0.3 && lt < self + 0.8) {
        const cx = kf(lt, [[lv - 0.3, 700, 1100], [lv + 0.1, ch.X(1), ch.Y(SUP + 280)], [self + 0.2, ch.X(30), ch.Y(SUP - 200)]]);
        cursor(ctx, cx[0], cx[1], lt > lv + 0.1 && lt < self + 0.2 ? 0.6 : 0, 1.15);
      }
      if (lt > self) popT(ctx, W / 2, 300, prog(lt, self, self + 0.35), () => pill(ctx, 'הרמות = העבודה שלך', W / 2, 300, { size: 40, color: C.purple }));
    },
  },

  rule: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('רמה'), type: 'impact', k: 0.8 }, { lt: s.cue('נר'), type: 'impact', k: 0.8 }, { lt: s.cue('כניסה'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s;
      drawBG(ctx, s.t, { glow: 1.3 });
      wipeText(ctx, 'החוק', W / 2, 380, prog(lt, 0, 0.35), { size: 120, weight: 900, color: C.gold, glow: 30 });
      const steps = [['1', 'קודם רמה', s.cue('רמה')], ['2', 'אחר כך נר', s.cue('נר')], ['3', 'ורק אז כניסה', s.cue('כניסה')]];
      const lineP = prog(lt, steps[0][2], steps[2][2]);
      ctx.save(); ctx.strokeStyle = C.purple; ctx.lineWidth = 8; ctx.shadowColor = C.purple; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.moveTo(870, 640); ctx.lineTo(870, 640 + 520 * lineP); ctx.stroke(); ctx.restore();
      steps.forEach(([n, t, t0], k) => {
        const p = prog(lt, t0 - 0.05, t0 + 0.35), y = 640 + k * 260;
        popT(ctx, 870, y, p, () => {
          ctx.save(); ctx.beginPath(); ctx.arc(870, y, 78, 0, Math.PI * 2); const g = ctx.createLinearGradient(0, y - 78, 0, y + 78); g.addColorStop(0, '#c084fc'); g.addColorStop(1, '#6d28d9');
          ctx.fillStyle = g; ctx.shadowColor = C.purple; ctx.shadowBlur = 40; ctx.fill(); ctx.restore();
          text(ctx, n, 870, y + 4, { size: 96, weight: 900 });
        });
        wipeText(ctx, t, 750, y, p, { size: 92, weight: 900, align: 'right', color: k === 2 ? '#3df2a6' : '#fff' });
      });
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

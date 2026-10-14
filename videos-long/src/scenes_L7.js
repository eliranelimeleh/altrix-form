// L7 — Price Action made simple, part 2: key #2 confirmation and key #3 invalidation
'use strict';
const chP = new Chart(PA_C);
const MIRP = 125800;
const DN_C = PA_C.map(q => ({ o: MIRP - q.o, c: MIRP - q.c, h: MIRP - q.l, l: MIRP - q.h }));
const chN = new Chart(DN_C);
const BRK_I = 49; // close below the trend line
const CHOCH_I = 54 + PA_C.slice(54).findIndex(q => q.c < PA(36)); // close below the last HL
const KNIFE_BUYS = [47, 50, 53, 58];

function knife(ctx, x, y, s, rot = 0, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#d9dce8'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.quadraticCurveTo(46, -60, 34, 30); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = '#3b1a78'; rrect(ctx, -6, 30, 46, 120, 14); ctx.fill(); ctx.strokeStyle = C.purple2; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('יקר'), type: 'pop' }, { lt: s.cue('סכין'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, exp = s.cue('יקר'), kn = s.cue('סכין');
      drawBG(ctx, s.t);
      wipeText(ctx, 'הדבר הכי יקר שעשיתי', W / 2, 330, prog(lt, 0.05, 0.4), { size: 70, weight: 900 });
      const fall = prog(lt, kn - 0.6, kn + 0.2), y = lerp(720, 860, E.inCubic(fall));
      knife(ctx, W / 2, y, 2.2, Math.PI + 0.15 + Math.sin(lt * 10) * 0.05 * (1 - fall), prog(lt, 0.2, 0.6));
      if (lt > kn) { hit(ctx, W / 2, 1050, lt, kn + 0.15, '#ff5a72', 300); headlines(ctx, lt, [{ t: 'תפסתי סכין נופלת', at: kn + 0.1, y: 1250, size: 92, color: '#ff7b8f', glowColor: C.down, kind: 'pop' }]); }
    },
  },
  hook2: {
    trans: 'whip', captions: false,
    events: s => [{ lt: s.cue('קונה'), type: 'click' }, { lt: s.cue('הסטופ'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, bottom = s.cue('התחתית'), buy = s.cue('קונה'), stop = s.cue('הסטופ');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 40, 60], [d, 42, 64]], { p: [60500, 66200] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 48], [buy, 51], [stop, 59], [d, 61]], E.lin)[0] });
      const SL = 62700;
      if (lt > bottom) popT(ctx, ch.X(51), ch.Y(PA_C[50].l) + 60, prog(lt, bottom, bottom + 0.3), () => pill(ctx, 'התחתית?', ch.X(51), ch.Y(PA_C[50].l) + 60, { size: 28, color: '#b8860b' }));
      if (lt > buy) { popT(ctx, ch.X(51), ch.Y(PA_C[51].c) - 50, prog(lt, buy, buy + 0.3), () => pill(ctx, 'BUY', ch.X(51), ch.Y(PA_C[51].c) - 50, { size: 30, color: '#2962ff' })); ch.hline(ctx, SL, 50, 64, { color: lt > stop ? C.down : '#ff8095', width: 4, dash: lt > stop ? null : [10, 8] }); }
      if (lt > stop) { hit(ctx, ch.X(58), ch.Y(SL), lt, stop, C.down, 240); flashCol(ctx, lt, stop); popT(ctx, ch.X(56), ch.Y(SL) - 40, prog(lt, stop, stop + 0.3), () => pill(ctx, 'STOP HIT', ch.X(56), ch.Y(SL) - 40, { size: 32, color: '#d61f45' })); }
      wipeText(ctx, 'בטוח שזו התחתית', W / 2, 300, prog(lt, 0.05, 0.4), { size: 70, weight: 900, color: C.gold });
    },
  },
  hook3: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('לאישור'), type: 'pop' }, { lt: s.cue('מתה'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, conf = s.cue('לאישור'), dead = s.cue('מתה'), before = s.cue('לפני');
      drawBG(ctx, s.t, { glow: 1.25 });
      const card = (y, t1, t2, col, t) => popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 120, y - 120, 840, 240, 30, { border: col, glowColor: col }); text(ctx, t1, 880, y - 30, { size: 66, weight: 900, align: 'right' }); text(ctx, t2, 880, y + 50, { size: 40, weight: 800, color: col, align: 'right' }); });
      card(560, 'מחכה לאישור', 'לא מנחש', '#16c784', conf);
      card(870, 'מזהה שהמגמה מתה', 'לפני כולם', '#f23645', dead);
      popT(ctx, W / 2, 1180, prog(lt, before, before + 0.35), () => pill(ctx, 'מפתח 2 + מפתח 3', W / 2, 1180, { size: 46, color: C.purple, glow: 40 }));
    },
  },
  intro: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('השני'), type: 'pop' }, { lt: s.cue('אישור'), type: 'impact', k: 1 }, { lt: s.cue('פסילה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, part = s.cue('השני'), conf = s.cue('אישור'), inv = s.cue('פסילה');
      drawBG(ctx, s.t, { glow: 1.25 });
      wipeText(ctx, 'חלק 2 מתוך 3', W / 2, 330, prog(lt, part - 0.1, part + 0.3), { size: 66, weight: 900, color: C.neon });
      seriesMap(ctx, lt, lt > inv ? 2 : 1, 0.2, 760, { list: SERIES_PA.slice(0, 3), done: 1 });
      popT(ctx, W / 2, 1060, prog(lt, conf, conf + 0.3), () => pill(ctx, 'מפתח 2 · אישור', W / 2, 1060, { size: 48, color: '#0b8f63', glow: 40 }));
      popT(ctx, W / 2, 1190, prog(lt, inv, inv + 0.3), () => pill(ctx, 'מפתח 3 · פסילה', W / 2, 1190, { size: 48, color: '#d61f45', glow: 40 }));
    },
  },

  // ================= CH1: falling knife =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 5, 'סכין נופלת', 'STOP GUESSING', { cueWord: 'סכין' }); } },
  a1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('יקפוץ'), type: 'pop' }, { lt: s.cue('ניחוש'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, jump = s.cue('יקפוץ'), guess = s.cue('ניחוש');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 42, 64], [d, 42, 66]], { p: [60500, 66200] });
      ch.draw(ctx, { reveal: lerp(50, 64, prog(lt, 0.2, d)) });
      KNIFE_BUYS.forEach((i, k) => { const x = ch.X(i), y = ch.Y(PA_C[i].l) + 50, t = jump + k * 0.3; popT(ctx, x, y, prog(lt, t, t + 0.3), () => pill(ctx, 'BUY?', x, y, { size: 22, color: '#555', pad: 10 })); cross(ctx, x, y + 46, 18, prog(lt, guess + k * 0.1, guess + k * 0.1 + 0.3)); });
      badge(ctx, 'קנייה מתוך ניחוש', prog(lt, guess, guess + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },
  a2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מחכה'), type: 'tick' }, { lt: s.cue('יגיב'), type: 'pop' }, { lt: s.cue('להסתובב'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, wait = s.cue('מחכה'), react = s.cue('יגיב'), turn = s.cue('להסתובב');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 18, 40], [d, 20, 42]], { p: [61000, 65200] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 32.5], [react, 35.9], [turn, 37], [d, 39]], E.lin)[0], highlight: i => i === 36 && lt > react });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 42, 1, { color: C.teal, width: 6 });
      if (lt > wait && lt < react) text(ctx, '⏳', ch.X(37), ch.Y(TL(37)) - 90, { size: 64 });
      if (lt > react) { hit(ctx, ch.X(36), ch.Y(PA_C[36].l), lt, react, C.up, 180); }
      arrow(ctx, ch.X(37), ch.Y(63100), ch.X(39.5), ch.Y(64200), prog(lt, turn, turn + 0.5), { color: C.up, width: 10, head: 36 });
      badge(ctx, 'מחכה לתגובה בקו', prog(lt, wait, wait + 0.35), '#0f766e', 300, W / 2, 44);
    },
  },
  a3: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מנחש'), type: 'pop' }, { lt: s.cue('מאשר'), type: 'pop' }, { lt: s.cue('שינה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, gs = s.cue('מנחש'), cf = s.cue('מאשר'), chg = s.cue('שינה');
      drawBG(ctx, s.t, { glow: 1.2 });
      const card = (y, t1, ok, col, t) => popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 120, y - 110, 840, 220, 30, { border: col, glowColor: col }); text(ctx, t1, 860, y, { size: 66, weight: 900, align: 'right' }); (ok ? check : cross)(ctx, 230, y, 50, 1); });
      card(600, 'מנחש רמות', false, '#f23645', gs);
      card(900, 'מאשר רמות', true, '#16c784', cf);
      popT(ctx, W / 2, 1180, prog(lt, chg, chg + 0.35), () => pill(ctx, 'ההבדל ששינה לי את המסחר', W / 2, 1180, { size: 44, color: C.purple, glow: 40 }));
    },
  },
  a4: {
    trans: 'whip', captions: false,
    events: s => [{ lt: s.cue('באוויר'), type: 'pop' }, { lt: s.cue('לרצפה'), type: 'impact', k: 1.2 }, { lt: s.cue('מרים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, air = s.cue('באוויר'), floor = s.cue('לרצפה'), lift = s.cue('מרים');
      drawBG(ctx, s.t);
      wipeText(ctx, 'תדמיין סכין נופלת', W / 2, 330, prog(lt, 0.05, 0.4), { size: 70, weight: 900 });
      ctx.save(); ctx.fillStyle = 'rgba(192,132,252,0.35)'; ctx.fillRect(140, 1150, 800, 6); ctx.restore();
      const fall = prog(lt, 0.3, floor), up = prog(lt, lift, lift + 0.6);
      const y = lerp(lerp(400, 1040, E.inCubic(fall)), 760, E.outCubic(up)), rot = lerp(0.2, 1.57, prog(lt, floor, floor + 0.2)) * (1 - up) + up * 0;
      knife(ctx, W / 2, y, 1.6, rot);
      if (lt > air && lt < floor) { cross(ctx, W / 2 + 230, 700, 40, prog(lt, air, air + 0.3)); text(ctx, 'לא באוויר', W / 2 + 230, 790, { size: 40, weight: 900, color: '#ff5a72' }); }
      if (lt > floor) hit(ctx, W / 2, 1150, lt, floor, C.purple2, 260);
      if (lt > lift) { check(ctx, W / 2 + 230, 760, 40, prog(lt, lift, lift + 0.3)); popT(ctx, W / 2, 1280, prog(lt, lift, lift + 0.3), () => pill(ctx, 'רק אחרי שנחתה', W / 2, 1280, { size: 46, color: '#0b8f63', glow: 40 })); }
    },
  },

  // ================= CH2: key 2 — confirmation =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 5, 'המפתח השני: אישור', 'KEY #2 · CONFIRMATION', { cueWord: 'המפתח' }); } },
  b1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('כיוון'), type: 'pop' }, { lt: s.cue('BOS'), type: 'pop' }, { lt: s.cue('מגמה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, dir = s.cue('כיוון'), bos = s.cue('BOS'), line = s.cue('מגמה'), wait = s.cue('מחכה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 40], [d, 4, 40]], { p: [59300, 65200] });
      ch.draw(ctx, { reveal: 34.5 });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 40, prog(lt, line, line + 0.6), { color: C.teal, width: 6 });
      const chips = [['כיוון ↑', dir], ['BOS', bos], ['קו מגמה', line]];
      chips.forEach(([t, c], k) => popT(ctx, 820 - k * 300, 300, prog(lt, c - 0.1, c + 0.25), () => pill(ctx, t + ' ✓', 820 - k * 300, 300, { size: 34, color: '#0b8f63' })));
      if (lt > wait) ch.zone(ctx, TL(36) - 200, TL(36) + 200, 33, 40, { color: C.teal, alpha: 0.18 + 0.08 * Math.sin(lt * 6), progress: prog(lt, wait, wait + 0.4) });
    },
  },
  b2: {
    trans: 'none',
    events: s => [{ lt: s.cue('שנוגע'), type: 'tick' }, { lt: s.cue('פתיל'), type: 'pop' }, { lt: s.cue('חזרו'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, touch = s.cue('שנוגע'), wick = s.cue('פתיל'), back = s.cue('חזרו');
      drawBG(ctx, s.t);
      const [i0, i1] = kf(lt, [[0, 26, 42], [touch, 30, 40], [d, 31, 39]]);
      ch.layout(...PANEL_STD).view(i0, i1, ...kf(lt, [[0, 61400, 64400], [touch, 62300, 63600], [d, 62400, 63500]]));
      ch.draw(ctx, { reveal: kf(lt, [[0, 35], [touch, 35.6], [wick, 35.98], [d, 36.5]], E.lin)[0], highlight: i => i === 36 });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 42, 1, { color: C.teal, width: 6 });
      if (lt > wick) { const x = ch.X(36), y0 = ch.Y(62950), y1 = ch.Y(62760); ctx.save(); ctx.strokeStyle = C.neon; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 40, y0); ctx.lineTo(x - 60, y0); ctx.lineTo(x - 60, y1); ctx.lineTo(x - 40, y1); ctx.stroke(); ctx.restore();
        popT(ctx, x - 190, (y0 + y1) / 2, prog(lt, wick, wick + 0.3), () => pill(ctx, 'פתיל ארוך', x - 190, (y0 + y1) / 2, { size: 30, color: C.purple })); }
      if (lt > back) hit(ctx, ch.X(36), ch.Y(62760), lt, back, C.up, 200);
      badge(ctx, 'הקונים חזרו', prog(lt, back, back + 0.35), '#0b8f63', 300, W / 2, 48);
    },
  },
  b3: {
    trans: 'none',
    events: s => [{ lt: s.cue('נכנס'), type: 'click' }, { lt: s.cue('friend'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, enter = s.cue('נכנס'), against = s.cue('נגדה'), fr = s.cue('friend');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 26, 42], [d, 24, 46]], { p: [61400, 66200] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 36.5], [enter, 37], [d, 45]], E.lin)[0] });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 46, 1, { color: C.teal, width: 6 });
      if (lt > enter) { ch.hline(ctx, PA_C[36].c, 36, 46, { color: '#2962ff', width: 3, dash: [8, 6] }); popT(ctx, ch.X(37), ch.Y(PA_C[36].c) + 50, prog(lt, enter, enter + 0.3), () => pill(ctx, 'BUY ✓', ch.X(37), ch.Y(PA_C[36].c) + 50, { size: 30, color: '#0b8f63' })); }
      if (lt > against) { popT(ctx, ch.X(30), ch.Y(64700), prog(lt, against, against + 0.3), () => pill(ctx, 'SELL', ch.X(30), ch.Y(64700), { size: 26, color: '#555' })); cross(ctx, ch.X(30) + 70, ch.Y(64700), 20, prog(lt, against, against + 0.3)); }
      popT(ctx, W / 2, 300, prog(lt, fr - 0.2, fr + 0.2), () => pill(ctx, 'THE TREND IS YOUR FRIEND', W / 2, 300, { size: 44, color: '#0b8f63', glow: 45 }));
    },
  },
  b4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('בטוחה'), type: 'pop' }, { lt: s.cue('מסכים'), type: 'pop' }, { lt: s.cue('שקל'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt } = s, safe = s.cue('בטוחה'), agree = s.cue('מסכים'), shekel = s.cue('שקל');
      drawBG(ctx, s.t, { glow: 1.15 });
      wipeText(ctx, 'אישור לא אומר', W / 2, 360, prog(lt, 0.05, 0.4), { size: 70, weight: 900, color: C.gold });
      const card = (y, t1, ok, col, t) => popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 120, y - 110, 840, 220, 30, { border: col, glowColor: col }); text(ctx, t1, 860, y, { size: 58, weight: 900, align: 'right' }); (ok ? check : cross)(ctx, 230, y, 48, 1); });
      card(620, 'העסקה בטוחה', false, '#f23645', safe);
      card(920, 'השוק מסכים איתי', true, '#16c784', agree);
      popT(ctx, W / 2, 1190, prog(lt, shekel, shekel + 0.35), () => pill(ctx, 'לפני שאני מסכן שקל', W / 2, 1190, { size: 46, color: C.purple, glow: 40 }));
    },
  },

  // ================= CH3: FVG as confirmation =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 5, 'האישור שלי: FVG', 'FAIR VALUE GAP', { cueWord: 'האישור' }); } },
  c1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('Fair'), type: 'pop' }, { lt: s.cue('נרות'), type: 'pop' }, { lt: s.cue('באמצע'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, fv = s.cue('Fair'), three = s.cue('נרות'), mid = s.cue('באמצע');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 28, 44], [d, 31, 43]], { p: [62300, 64600] });
      ch.draw(ctx, { reveal: 40, dim: 0.5, highlight: i => i >= 37 && i <= 39 });
      [37, 38, 39].forEach((i, k) => { const p = prog(lt, three + k * 0.15, three + k * 0.15 + 0.3), x = ch.X(i), y = ch.Y(62700); popT(ctx, x, y, p, () => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fillStyle = C.purple; ctx.fill(); ctx.restore(); text(ctx, String(k + 1), x, y + 2, { size: 30, weight: 900, fam: MONO }); }); });
      fvgZone(ctx, ch, 37, PA_G, 44, prog(lt, mid, mid + 0.5));
      popT(ctx, W / 2, 300, prog(lt, fv, fv + 0.35), () => pill(ctx, 'FAIR VALUE GAP', W / 2, 300, { size: 52, color: '#b8860b', glow: 45 }));
    },
  },
  c2: {
    trans: 'none',
    events: s => [{ lt: s.cue('העליון'), type: 'pop' }, { lt: s.cue('התחתון'), type: 'pop' }, { lt: s.cue('הפער'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, up = s.cue('העליון'), dn = s.cue('התחתון'), gap = s.cue('הפער');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 31, 43], [d, 32, 42]], { p: [62600, 64300] });
      ch.draw(ctx, { reveal: 40, dim: 0.5, highlight: i => i >= 37 && i <= 39 });
      const p1 = prog(lt, up, up + 0.4), p3 = prog(lt, dn, dn + 0.4);
      ch.hline(ctx, PA_G[0], 36, 43, { color: C.gold, width: 3, dash: [8, 8], progress: p1 }); ch.dot(ctx, 37, PA_G[0], p1, C.gold, 11);
      ch.hline(ctx, PA_G[1], 36, 43, { color: '#3df2a6', width: 3, dash: [8, 8], progress: p3 }); ch.dot(ctx, 39, PA_G[1], p3, '#3df2a6', 11);
      fvgZone(ctx, ch, 37, PA_G, 43, prog(lt, gap, gap + 0.5), { label: '' });
      popT(ctx, ch.X(35), ch.Y(PA_G[0]) + 40, p1, () => pill(ctx, 'פתיל עליון · נר 1', ch.X(35), ch.Y(PA_G[0]) + 40, { size: 26, color: '#b8860b' }));
      popT(ctx, ch.X(41), ch.Y(PA_G[1]) - 40, p3, () => pill(ctx, 'פתיל תחתון · נר 3', ch.X(41), ch.Y(PA_G[1]) - 40, { size: 26, color: '#0b8f63' }));
      badge(ctx, 'הרווח ביניהם = הפער', prog(lt, gap, gap + 0.35), '#b8860b', 300, W / 2, 44);
    },
  },
  c3: {
    trans: 'none',
    events: s => [{ lt: s.cue('מהר'), type: 'whoosh' }, { lt: s.cue('חוזר'), type: 'pop' }, { lt: s.cue('ממשיך'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, fast = s.cue('מהר'), fair = s.cue('הוגן'), back = s.cue('חוזר'), go = s.cue('ממשיך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 32, 44], [back, 32, 56], [d, 32, 57]], { p: [62300, 66300] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 40], [back, 50], [back + 0.8, 51.9], [go, 54.5], [d, 55]], E.lin)[0] });
      fvgZone(ctx, ch, 37, PA_G, 57, 1);
      if (lt > fast && lt < back) { const r = rng(9); for (let k = 0; k < 10; k++) { const ph = (lt * 2.2 + r()) % 1, x = ch.X(38) + (r() - 0.5) * 40, y = lerp(ch.Y(63000), ch.Y(63700), ph); ctx.save(); ctx.globalAlpha = 0.7 * Math.sin(ph * Math.PI); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(x, y); ctx.stroke(); ctx.restore(); } }
      if (lt > fair && lt < back) text(ctx, 'מחיר הוגן?', ch.X(40), ch.Y(63200) + 70, { size: 34, weight: 900, color: C.gold, stroke: 6 });
      if (lt > go) { hit(ctx, ch.X(51), ch.Y(PA(51)), lt, go - 0.6, C.up, 160); check(ctx, ch.X(51) - 60, ch.Y(PA(51)) + 50, 24, prog(lt, go, go + 0.3)); }
    },
  },
  c4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('המגמה'), type: 'pop' }, { lt: s.cue('תגובה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, line = s.cue('המגמה'), mark = s.cue('מסמן'), zone = s.cue('תגובה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 18, 46], [d, 22, 46]], { p: [60800, 66300] });
      ch.draw(ctx, { reveal: 40 });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 50, prog(lt, line - 0.2, line + 0.4), { color: C.teal, width: 6 });
      fvgZone(ctx, ch, 37, PA_G, 50, prog(lt, mark - 0.2, mark + 0.3), { label: 'FVG' });
      if (lt > zone) ch.zone(ctx, TL(46) - 150, PA_G[1], 40, 50, { color: '#3df2a6', alpha: 0.18 + 0.08 * Math.sin(lt * 6), progress: prog(lt, zone, zone + 0.4), label: 'אזור תגובה' });
      badge(ctx, 'FVG ליד הקו + בכיוון שלו', prog(lt, line, line + 0.35), '#b8860b', 300, W / 2, 40);
    },
  },
  c5: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הפוך'), type: 'pop' }, { lt: s.cue('דובי'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chN, rev = s.cue('הפוך'), bear = s.cue('דובי');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 28, 44], [d, 31, 43]], { p: [61300, 63600] });
      ch.draw(ctx, { reveal: 40, dim: 0.45, highlight: i => i >= 37 && i <= 39 });
      const G = [MIRP - PA_G[1], MIRP - PA_G[0]];
      ch.hline(ctx, G[1], 36, 43, { color: '#ff5a72', width: 3, dash: [8, 8], progress: prog(lt, rev, rev + 0.4) }); ch.hline(ctx, G[0], 36, 43, { color: '#ff5a72', width: 3, dash: [8, 8], progress: prog(lt, rev + 0.3, rev + 0.7) });
      fvgZone(ctx, ch, 37, G, 43, prog(lt, bear - 0.1, bear + 0.4), { color: '#ff5a72', label: 'FVG ↓' });
      badge(ctx, 'במגמת ירידה · FVG דובי', prog(lt, rev, rev + 0.35), '#d61f45', 300, W / 2, 42);
    },
  },

  // ================= CH4: key 3 — invalidation =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 5, 'המפתח השלישי: פסילה', 'KEY #3 · INVALIDATION', { cueWord: 'המפתח' }); } },
  d1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('אהבתי'), type: 'pop' }, { lt: s.cue('להישבר'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, love = s.cue('אהבתי'), brk = s.cue('להישבר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 48], [d, 20, 52]], { p: [60300, 66400] });
      ch.draw(ctx, { reveal: lerp(40, 47.5, prog(lt, 0, d)) });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 56, 1, { color: C.teal, width: 6 });
      wipeText(ctx, 'הרגע שהמגמה נשברת', W / 2, 300, prog(lt, love, love + 0.35), { size: 66, weight: 900, color: '#ff7b8f' });
    },
  },
  d2: {
    trans: 'none',
    events: s => [{ lt: s.cue('ושוב'), type: 'pop' }, { lt: s.cue('נסגר'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, again = s.cue('ושוב'), cl = s.cue('נסגר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 20, 52], [cl, 30, 54], [d, 30, 54]], { p: [60300, 66400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 47.5], [cl - 0.4, 48.9], [cl, 49.98], [d, 50.2]], E.lin)[0], highlight: i => i === BRK_I && lt > cl });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 56, 1, { color: lt > cl ? '#ff5a72' : C.teal, width: 6 });
      [13, 25, 36].forEach((i, k) => check(ctx, ch.X(i), ch.Y(PA(i)) + 50, 20, prog(lt, again - 0.6 + k * 0.15, again - 0.3 + k * 0.15)));
      if (lt > cl) { hit(ctx, ch.X(BRK_I), ch.Y(TL(BRK_I)), lt, cl, C.down, 250); flashCol(ctx, lt, cl); }
      badge(ctx, 'נר נסגר מתחת לקו', prog(lt, cl, cl + 0.35), '#d61f45', 300, W / 2, 46);
    },
  },
  d3: {
    trans: 'none',
    events: s => [{ lt: s.cue('המוכרים'), type: 'pop' }, { lt: s.cue('הזדמנות'), type: 'impact', k: 1 }, { lt: s.cue('מוקדם'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, sellers = s.cue('המוכרים'), opp = s.cue('הזדמנות'), early = s.cue('מוקדם');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 30, 54], [d, 32, 56]], { p: [60300, 66400] });
      ch.draw(ctx, { reveal: 50.2, highlight: i => i === BRK_I });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 56, 1, { color: '#ff5a72', width: 6 });
      if (lt > sellers) { const r = rng(4); for (let k = 0; k < 6; k++) { const x = ch.X(48 + r() * 3), y = ch.Y(63800 + r() * 500); popT(ctx, x, y, prog(lt, sellers + k * 0.06, sellers + k * 0.06 + 0.3), () => pill(ctx, 'SELL', x, y, { size: 20, color: '#d61f45', pad: 9 })); } }
      arrow(ctx, ch.X(50), ch.Y(63300), ch.X(55), ch.Y(61800), prog(lt, opp, opp + 0.5), { color: 'rgba(255,90,114,0.85)', width: 10, head: 36 });
      popT(ctx, W / 2, 300, prog(lt, opp, opp + 0.35), () => pill(ctx, 'הזדמנות · מגמה חדשה מוקדם', W / 2, 300, { size: 44, color: C.purple, glow: 45 }));
    },
  },
  d4: {
    trans: 'none',
    events: s => [{ lt: s.cue('לבדוק'), type: 'whoosh' }, { lt: s.cue('Retest'), type: 'impact', k: 1.2 }, { lt: s.cue('למטה'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, test = s.cue('לבדוק'), rt = s.cue('Retest'), down = s.cue('למטה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 32, 56], [d, 36, 62]], { p: [60300, 66400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 50.2], [test, 52], [rt, 54.98], [down, 56], [d, 60]], E.lin)[0] });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 62, 1, { color: '#ff5a72', width: 6 });
      if (lt > rt) { hit(ctx, ch.X(54), ch.Y(TL(54)), lt, rt, C.down, 200); ch.tag(ctx, 54, PA_C[54].h, 'RETEST', prog(lt, rt, rt + 0.3), { color: '#d61f45', size: 28, off: 44 }); }
      ch.tag(ctx, BRK_I, PA_C[BRK_I].l, 'BREAK', 1, { color: '#d61f45', above: false, size: 26, off: 44 });
      popT(ctx, W / 2, 300, prog(lt, rt, rt + 0.35), () => pill(ctx, 'BREAK & RETEST', W / 2, 300, { size: 54, color: '#d61f45', glow: 50 }));
    },
  },
  d5: {
    trans: 'none',
    events: s => [{ lt: s.cue('מלמטה'), type: 'pop' }, { lt: s.cue('מלמעלה'), type: 'pop' }, { lt: s.cue('לצאת'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, below = s.cue('מלמטה'), above = s.cue('מלמעלה'), out = s.cue('לצאת');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 20, 60], [d, 22, 60]], { p: [60300, 66400] });
      ch.draw(ctx, { reveal: 59 });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 62, 1, { color: '#ff5a72', width: 6 });
      popT(ctx, ch.X(30), ch.Y(TL(30)) + 60, prog(lt, below, below + 0.3), () => pill(ctx, 'תמיכה', ch.X(30), ch.Y(TL(30)) + 60, { size: 30, color: '#0b8f63' }));
      popT(ctx, ch.X(54), ch.Y(TL(54)) - 70, prog(lt, above, above + 0.3), () => pill(ctx, 'התנגדות', ch.X(54), ch.Y(TL(54)) - 70, { size: 30, color: '#d61f45' }));
      if (lt > out) { const r = rng(17); for (let k = 0; k < 5; k++) { const x = ch.X(51 + r() * 5), y = ch.Y(63700 + r() * 300); popT(ctx, x, y, prog(lt, out + k * 0.06, out + k * 0.06 + 0.3), () => pill(ctx, 'EXIT', x, y, { size: 20, color: '#555', pad: 9 })); } }
      badge(ctx, 'אותו קו · תפקיד הפוך', prog(lt, above, above + 0.35), C.purple, 300, W / 2, 44);
    },
  },

  // ================= CH5: CHoCH =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 5, 'CHoCH', 'CHANGE OF CHARACTER', { at: 0.4 }); } },
  e1: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('סופית'), type: 'riser' }, { lt: s.cue('Change'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, fin = s.cue('סופית'), chg = s.cue('Change');
      drawBG(ctx, s.t, { glow: 1.3 });
      wipeText(ctx, 'מה מאשר את זה סופית?', W / 2, 400, prog(lt, 0, 0.35), { size: 66, weight: 900, color: C.gold });
      titleLock(ctx, lt, 'CHoCH', 'CHANGE OF CHARACTER', fin + 0.2, chg, 820);
    },
  },
  e2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שבירה'), type: 'pop' }, { lt: s.cue('שבירה', 1), type: 'pop' }, { lt: s.cue('מצליח'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, b1 = s.cue('שבירה'), b2 = s.cue('שבירה', 1), fail = s.cue('מצליח');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 58], [d, 0, 58]], { p: [59300, 66600] });
      ch.draw(ctx, { reveal: 57, dim: 0.4 });
      ch.zigzag(ctx, [[0, 60000], [8, PA(8)], [13, PA(13)], [20, PA(20)], [25, PA(25)], [32, PA(32)], [36, PA(36)], [44, PA(44)], [51, PA(51)], [54, PA(54)]], prog(lt, 0.1, fail + 0.4), { color: C.purple2, width: 5 });
      [[20, b1], [32, b2], [44, b2 + 0.5]].forEach(([i, t]) => ch.tag(ctx, i, PA(i), 'BOS', prog(lt, t, t + 0.3), { color: '#0b8f63', size: 24, off: 40 }));
      if (lt > fail) { ch.hline(ctx, PA(44), 44, 58, { color: C.gold, width: 3, dash: [8, 8] }); ch.tag(ctx, 54, PA(54), 'אין שיא חדש', prog(lt, fail, fail + 0.3), { color: '#d61f45', size: 26, off: 44 }); }
      badge(ctx, 'ההפך מ-BOS', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 44);
    },
  },
  e3: {
    trans: 'none',
    events: s => [{ lt: s.cue('שובר'), type: 'impact', k: 1.3 }, { lt: s.cue("הצ'וק"), type: 'pop' }, { lt: s.cue('לרדת'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, br = s.cue('שובר'), cho = s.cue("הצ'וק"), down = s.cue('לרדת');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 28, 60], [d, 30, 67]], { p: [60300, 66400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 55], [br, CHOCH_I + 0.98], [down, CHOCH_I + 2], [d, 66.5]], E.lin)[0], highlight: i => i === CHOCH_I && lt > br });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 67, 1, { color: '#ff5a72', width: 5, alpha: 0.7 });
      ch.hline(ctx, PA(36), 36, 67, { color: lt > br ? C.down : '#fff', width: 4, dash: lt > br ? null : [10, 8] });
      ch.tag(ctx, 36, PA(36), 'שפל אחרון', 1, { color: '#0b8f63', above: false, size: 24, off: 40 });
      if (lt > br) { hit(ctx, ch.X(CHOCH_I), ch.Y(PA(36)), lt, br, C.down, 240); flashCol(ctx, lt, br); }
      popT(ctx, W / 2, 300, prog(lt, cho, cho + 0.35), () => pill(ctx, 'CHoCH ↓', W / 2, 300, { size: 56, color: '#d61f45', glow: 50 }));
    },
  },
  e4: {
    trans: 'none',
    events: s => [{ lt: s.cue('מחדש'), type: 'riser' }, { lt: s.cue('חדש', 2), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, again = s.cue('מחדש'), dir = s.cue('כיוון'), bos = s.cue('BOS'), line = s.cue('וקו');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 30, 67], [d, 34, 67]], { p: [60300, 66400] });
      ch.draw(ctx, { reveal: 66.5, dim: 0.2 });
      const chips = [['כיוון ↓', dir], ['BOS', bos], ['קו מגמה', line]];
      chips.forEach(([t, c], k) => popT(ctx, 820 - k * 300, 300, prog(lt, c - 0.1, c + 0.25), () => pill(ctx, t, 820 - k * 300, 300, { size: 34, color: '#d61f45' })));
      trendLine(ctx, ch, 44, PA(44), 54, PA(54), 67, prog(lt, line, line + 0.6), { color: '#ff5a72', width: 6 });
      if (lt > again) text(ctx, '↻', ch.X(60), ch.Y(64500), { size: 120, weight: 900, color: C.purple2, alpha: 0.7 * prog(lt, again, again + 0.3), glow: 30 });
    },
  },
  e5: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('בהפתעה'), type: 'pop' }, { lt: s.cue('שנשבר'), type: 'pop' }, { lt: s.cue('השני'), type: 'pop' }, { lt: s.cue("וצ'וק"), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, surp = s.cue('בהפתעה');
      drawBG(ctx, s.t, { glow: 1.2 });
      headlines(ctx, lt, [{ t: 'מגמה לא נגמרת בהפתעה', at: surp - 0.3, y: 400, size: 70, color: C.neon }]);
      const items = [['קו שנשבר', s.cue('שנשבר')], ['בדיקה מהצד השני', s.cue('השני')], ['CHoCH', s.cue("וצ'וק")]];
      items.forEach(([t, c], k) => { const y = 620 + k * 200; popT(ctx, W / 2, y, prog(lt, c - 0.1, c + 0.25), () => { glass(ctx, 180, y - 75, 720, 150, 26, { border: '#f23645' }); text(ctx, String(k + 1), 830, y, { size: 60, weight: 900, fam: MONO, color: '#ff7b8f' }); text(ctx, t, 760, y, { size: 52, weight: 900, align: 'right' }); check(ctx, 260, y, 34, 1); }); });
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('סכינים'), type: 'pop' }, { lt: s.cue('FVG'), type: 'pop' }, { lt: s.cue('מתהפכת'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['לא תופסים סכינים', 'מחכים לתגובה בקו', '#e0546b', s.cue('סכינים'), 'cross'],
        ['FVG = אישור', 'ליד הקו ובכיוון שלו', '#e0a100', s.cue('FVG'), 'check'],
        ['שבירה + בדיקה', 'המגמה מתהפכת', '#7c3aed', s.cue('מתהפכת'), 'warn'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('המפה'), type: 'pop' }, { lt: s.cue('הכניסה'), type: 'impact', k: 1.1 }, { lt: s.cue('דקה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, map = s.cue('המפה'), entry = s.cue('הכניסה'), min = s.cue('דקה');
      drawBG(ctx, s.t, { glow: 1.3 });
      headlines(ctx, lt, [{ t: 'יש לך את המפה', at: map - 0.2, y: 400, size: 96 }]);
      seriesMap(ctx, lt, 3, map, 760, { list: SERIES_PA, done: 3 });
      popT(ctx, W / 2, 1120, prog(lt, entry - 0.1, entry + 0.3), () => pill(ctx, 'בחלק 3: מודל הכניסה', W / 2, 1120, { size: 50, color: C.purple, glow: 50 }));
      popT(ctx, W / 2, 1250, prog(lt, min, min + 0.3), () => pill(ctx, 'צעד אחר צעד · גרף של דקה', W / 2, 1250, { size: 40, color: '#b8860b' }));
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

// Video 11 — EMA 20 / 50 / 200
'use strict';
const EMP = [[0, 64500], [30, 62000], [40, 63000], [48, 62300], [56, 63100], [62, 62500], [70, 63000], [88, 66200], [94, 64900], [106, 68000], [111, 66600], [124, 69600], [129, 68300], [140, 70800]];
const EM = genCandles(EMP, { seed: 5, noise: 0.2 });
const E20 = emaSeries(EM, 20), E50 = emaSeries(EM, 50), E200 = emaSeries(EM, 200);
const chEM = new Chart(EM, { tf: '1D' });
const GX = 87, T1 = 94, T2 = 111;
const COL = { 20: C.teal, 50: C.purple2, 200: C.gold };

function emas(ctx, ch, reveal, o = {}) {
  const { show = [20, 50, 200], p = {} } = o;
  if (show.includes(200)) lineSeries(ctx, ch, E200, Math.floor(lerp(0, reveal, p[200] ?? 1)), { color: COL[200], width: 6, glow: 22 });
  if (show.includes(50)) lineSeries(ctx, ch, E50, Math.floor(lerp(0, reveal, p[50] ?? 1)), { color: COL[50], width: 4 });
  if (show.includes(20)) lineSeries(ctx, ch, E20, Math.floor(lerp(0, reveal, p[20] ?? 1)), { color: COL[20], width: 4 });
}
function emaTag(ctx, ch, n, i, p, dy = 0) {
  const v = { 20: E20, 50: E50, 200: E200 }[n][i];
  popT(ctx, ch.X(i) + 60, ch.Y(v) + dy, p, () => pill(ctx, `EMA ${n}`, ch.X(i) + 60, ch.Y(v) + dy, { size: 24, color: n === 200 ? '#b8860b' : n === 50 ? C.purple : '#14a88f', pad: 12 }));
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('קו'), type: 'riser' }, { lt: s.cue('קניות'), type: 'pop' }, { lt: s.cue('מכירות'), type: 'pop' }, { lt: s.cue('שנייה'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chEM, ln = s.cue('קו'), buy = s.cue('קניות'), sell = s.cue('מכירות'), sec = s.cue('שנייה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 20, 120], [d, 24, 120]], { p: [61400, 69800] });
      ch.draw(ctx, { reveal: 120 });
      lineSeries(ctx, ch, E200, Math.floor(lerp(20, 120, prog(lt, ln - 0.1, ln + 0.8))), { color: C.gold, width: 7, glow: 30 });
      popT(ctx, ch.X(105), ch.Y(66000), prog(lt, buy, buy + 0.3), () => pill(ctx, 'מעל = קניות', ch.X(105), ch.Y(66000), { size: 34, color: '#0b8f63' }));
      popT(ctx, ch.X(40), ch.Y(61900), prog(lt, sell, sell + 0.3), () => pill(ctx, 'מתחת = מכירות', ch.X(40), ch.Y(61900), { size: 34, color: '#d61f45' }));
      if (lt < sec - 0.1) wipeText(ctx, 'קו אחד על הגרף', W / 2, 300, prog(lt, 0.05, 0.4), { size: 76, weight: 900 });
      else wipeText(ctx, 'וזה לוקח שנייה', W / 2, 300, prog(lt, sec - 0.1, sec + 0.25), { size: 80, weight: 900, color: C.gold });
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('EMA'), type: 'impact', k: 1.2 }, { lt: s.cue('מאתיים'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt } = s, e = s.cue('EMA'), two = s.cue('מאתיים');
      drawBG(ctx, s.t, { glow: 1.3 });
      wipeText(ctx, 'ממוצע נע אקספוננציאלי', W / 2, 520, prog(lt, 0, 0.4), { size: 70, weight: 900, color: C.dim });
      titleLock(ctx, lt, 'EMA', 'EXPONENTIAL MOVING AVERAGE', e, e + 0.4, 760);
      popT(ctx, W / 2, 1210, prog(lt, two - 0.05, two + 0.35), () => text(ctx, '200', W / 2, 1210, { size: 230, weight: 900, color: C.gold, glow: 70, fam: FONT }));
    },
  },

  ema200: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מעל'), type: 'pop' }, { lt: s.cue('מתחת'), type: 'pop' }, { lt: s.cue('נלחם'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chEM, ab = s.cue('מעל'), bl = s.cue('מתחת'), fight = s.cue('נלחם');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 20, 122], [d, 20, 122]], { p: [61400, 69800] });
      ch.draw(ctx, { reveal: 122 });
      const tint = (a, b, col, p) => { if (p <= 0) return; ch.clip(ctx, () => { ctx.save(); ctx.globalAlpha = 0.14 * p; ctx.fillStyle = col; ctx.fillRect(ch.X(a), ch.p.y, ch.X(b) - ch.X(a), ch.p.h); ctx.restore(); }); };
      tint(76, 122, C.up, prog(lt, ab, ab + 0.4)); tint(20, 75, C.down, prog(lt, bl, bl + 0.4));
      lineSeries(ctx, ch, E200, 122, { color: C.gold, width: 7, glow: 30 });
      popT(ctx, ch.X(100), ch.p.y + 60, prog(lt, ab, ab + 0.3), () => pill(ctx, 'רק קניות', ch.X(100), ch.p.y + 60, { size: 36, color: '#0b8f63' }));
      popT(ctx, ch.X(47), ch.p.y + 60, prog(lt, bl, bl + 0.3), () => pill(ctx, 'רק מכירות', ch.X(47), ch.p.y + 60, { size: 36, color: '#d61f45' }));
      emaTag(ctx, ch, 200, 118, prog(lt, 0, 0.3), 40);
      badge(ctx, 'לא נלחמים במגמה', prog(lt, fight, fight + 0.35), C.purple, 300, W / 2, 46);
    },
  },

  fast: {
    trans: 'none',
    events: s => [{ lt: s.cue('עשרים'), type: 'pop' }, { lt: s.cue('ומסודרים'), type: 'pop' }, { lt: s.cue('חזקה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chEM, add = s.cue('עשרים'), ord = s.cue('ומסודרים'), strong = s.cue('חזקה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 20, 122], [d, 70, 124]], { p: [61400, 69800] });
      ch.draw(ctx, { reveal: 122, dim: 0.3 });
      emas(ctx, ch, 122, { p: { 20: prog(lt, add, add + 0.8), 50: prog(lt, add + 0.2, add + 1) } });
      if (lt > ord) {
        const i = 118; [[20, -60], [50, 0], [200, 50]].forEach(([n, dy], k) => emaTag(ctx, ch, n, i, prog(lt, ord + k * 0.12, ord + k * 0.12 + 0.3), dy));
        popT(ctx, W / 2, 1270, prog(lt, ord, ord + 0.35), () => pill(ctx, '20 מעל 50 מעל 200', W / 2, 1270, { size: 36, color: 'rgba(20,12,40,0.95)' }));
      }
      badge(ctx, 'מגמה חזקה', prog(lt, strong, strong + 0.35), '#0fa36b', 300, W / 2, 48);
    },
  },

  dynamic: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('מתקן'), type: 'whoosh' }, { lt: s.cue('נדחה'), type: 'impact', k: 1.1 }, { lt: s.cue('דינמית'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chEM, fix = s.cue('מתקן'), rj = s.cue('נדחה'), dyn = s.cue('דינמית');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 84, 116], [d, 86, 118]], { p: [63800, 69200] });
      const rev = kf(lt, [[0, 92], [rj + 0.1, 96], [dyn, 112.5], [d, 116]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => (i === T1 || i === T2) && rev > i + 1 });
      emas(ctx, ch, rev, { show: [20, 50] });
      [[T1, rj], [T2, dyn - 0.3]].forEach(([i, t0]) => { if (rev > i + 0.5) ring(ctx, ch.X(i), ch.Y(EM[i].l), 130, prog(lt, t0, t0 + 0.6), C.teal); });
      emaTag(ctx, ch, 20, Math.min(Math.floor(rev) - 1, 115), prog(lt, 0.1, 0.4), -50);
      badge(ctx, 'תמיכה דינמית', prog(lt, dyn, dyn + 0.35), '#14a88f', 300, W / 2, 48);
    },
  },

  cross: {
    trans: 'whip',
    events: s => [{ lt: s.cue('חוצה'), type: 'pop' }, { lt: s.cue('Golden'), type: 'impact', k: 1.4 }, { lt: s.cue('לטווח'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chEM, cx = s.cue('חוצה'), gc = s.cue('Golden'), lt2 = s.cue('לטווח');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 56, 104], [cx, 70, 102], [d, 70, 102]], { p: [61800, 68400] });
      const rev = kf(lt, [[0, 80], [cx + 0.3, 90], [d, 100]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, dim: 0.35 });
      emas(ctx, ch, rev, { show: [50, 200] });
      if (rev > GX + 1) {
        const x = ch.X(GX), y = ch.Y(E200[GX]);
        ring(ctx, x, y, 200, prog(lt, cx + 0.2, cx + 0.8), C.gold); burst(ctx, x, y, prog(lt, gc, gc + 0.9), C.gold, 28, 5, 260);
        popT(ctx, x, y - 120, prog(lt, gc - 0.05, gc + 0.35), () => pill(ctx, 'GOLDEN CROSS', x, y - 120, { size: 44, color: '#b8860b', glow: 50 }));
      }
      emaTag(ctx, ch, 50, 76, prog(lt, 0.1, 0.4), -40); emaTag(ctx, ch, 200, 76, prog(lt, 0.2, 0.5), 40);
      badge(ctx, 'שינוי מגמה לטווח ארוך', prog(lt, lt2, lt2 + 0.35), '#0fa36b', 300, W / 2, 42);
    },
  },

  mistake: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נגיעה'), type: 'pop' }, { lt: s.cue('צדדי'), type: 'impact', k: 1 }, { lt: s.cue('שטוחים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chEM, tch = s.cue('נגיעה'), side = s.cue('צדדי'), flat = s.cue('שטוחים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 40, 74], [d, 42, 74]], { p: [61600, 63800] });
      ch.draw(ctx, { reveal: 72 });
      emas(ctx, ch, 72, { show: [20, 50] });
      [50, 57, 63, 68].forEach((i, k) => { const x = ch.X(i), y = ch.Y(EM[i].l) + 50; popT(ctx, x, y, prog(lt, tch + k * 0.15, tch + k * 0.15 + 0.3), () => pill(ctx, 'BUY', x, y, { size: 22, color: '#2962ff', pad: 12 })); cross(ctx, x, y + 50, 20, prog(lt, side + k * 0.1, side + k * 0.1 + 0.3)); });
      if (lt > flat) { ch.zone(ctx, 62400, 63150, 44, 74, { color: C.down, alpha: 0.15 + 0.08 * Math.sin(lt * 9) }); }
      badge(ctx, 'ממוצעים שטוחים = אין מגמה', prog(lt, flat, flat + 0.35), '#d61f45', 300, W / 2, 40);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...Array.from({ length: 12 }, (_, k) => ({ lt: s.cue('Moving') + 0.05 + k * 0.05, type: 'tick' })), { lt: s.cue('תוסיף'), type: 'click' }, ...['עשרים', 'חמישים', 'ומאתיים'].map(w => ({ lt: s.cue(w), type: 'key' }))],
    draw(ctx, s) {
      const { lt, d } = s, ch = chEM, op = s.cue('תחפש'), pk = s.cue('תוסיף'), a = s.cue('עשרים'), b = s.cue('חמישים'), c = s.cue('ומאתיים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 60, 124], [d, 60, 124]], { p: [61400, 69800] });
      ch.draw(ctx, { reveal: 124, dim: 0.2 });
      emas(ctx, ch, 124, { show: [lt > a ? 20 : 0, lt > b ? 50 : 0, lt > c ? 200 : 0], p: { 20: prog(lt, a, a + 0.6), 50: prog(lt, b, b + 0.6), 200: prog(lt, c, c + 0.6) } });
      indicatorDialog(ctx, lt, 'Moving Average Exponential', [['Moving Average Exponential', 'Built-in'], ['Moving Average Simple', 'Built-in'], ['Moving Average Ribbon', 'Built-in']], op, pk);
      const ps = prog(lt, a - 0.3, a) ;
      if (ps > 0) {
        ctx.save(); ctx.globalAlpha = ps; glass(ctx, 300, 1100, 480, 200, 22, { fill: 'rgba(22,16,40,0.97)' });
        text(ctx, 'EMA · Inputs', 330, 1140, { size: 28, weight: 800, align: 'left' });
        text(ctx, 'Length', 330, 1220, { size: 28, weight: 500, align: 'left', color: C.axis });
        const v = lt > c ? '200' : lt > b ? '50' : '20', col = lt > c ? COL[200] : lt > b ? COL[50] : COL[20];
        rrect(ctx, 520, 1190, 220, 60, 10); ctx.fillStyle = '#0d0a19'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
        text(ctx, v, 630, 1221, { size: 34, weight: 800, fam: MONO, color: col });
        ctx.restore();
      }
      popT(ctx, W / 2, 300, prog(lt, a, a + 0.35), () => pill(ctx, 'EMA 20 · 50 · 200', W / 2, 300, { size: 42, color: C.purple }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מאתיים'), type: 'pop' }, { lt: s.cue('עשרים'), type: 'pop' }, { lt: s.cue('שטוחים'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['EMA 200', 'קובע את הכיוון', '#e0a100', s.cue('מאתיים'), 'zz'],
        ['EMA 20 ו-50', 'נותנים כניסה', '#0fa36b', s.cue('עשרים'), 'check'],
        ['ממוצעים שטוחים', 'לא נוגעים', '#d61f45', s.cue('שטוחים'), 'cross'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

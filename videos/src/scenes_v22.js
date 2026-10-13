// Video 22 — VWAP (intraday fair price, daily reset, VWAP pullback, flat VWAP, Anchored VWAP)
'use strict';
const VWP = [[0, 63000], [5, 63700], [8, 63380], [14, 64400], [17, 63720], [23, 64750], [24, 64700], [27, 64300], [30, 64900], [33, 64350], [36, 64850], [39, 64400], [42, 64800], [45, 64450], [47, 64600], [48, 64600], [53, 64000], [56, 64300], [62, 63400], [65, 63750], [71, 63000]];
const VWC = genCandles(VWP, { seed: 221, noise: 0.15 });
const VWV = VWC.map((_, i) => 70 + hash(i * 2.3) * 60);
const VW = vwapSeries(VWC, VWV, 24);
const chVW = new Chart(VWC, { tf: '15m' });
const DAY = 24;

function vwapLine(ctx, ch, upto, o = {}) {
  const { color = C.gold, width = 6, from = 0 } = o, n = Math.min(upto, VWC.length);
  ch.clip(ctx, () => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = color; ctx.shadowBlur = 22; ctx.lineJoin = 'round';
    for (let d0 = Math.floor(from / DAY) * DAY; d0 < n; d0 += DAY) { ctx.beginPath(); for (let i = Math.max(d0, from); i < Math.min(d0 + DAY, n); i++) i === Math.max(d0, from) ? ctx.moveTo(ch.X(i), ch.Y(VW[i])) : ctx.lineTo(ch.X(i), ch.Y(VW[i])); ctx.stroke(); }
    ctx.restore(); });
}
function daySep(ctx, ch, p) {
  [DAY, 2 * DAY].forEach((i, k) => { const pk = clamp(p * 2 - k * 0.5); if (pk <= 0) return; const x = ch.X(i - 0.5);
    ch.clip(ctx, () => { ctx.save(); ctx.globalAlpha = pk; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, ch.p.y); ctx.lineTo(x, ch.p.y + ch.p.h); ctx.stroke(); ctx.restore(); });
    popT(ctx, x, ch.p.y + 40, pk, () => pill(ctx, 'יום חדש', x, ch.p.y + 40, { size: 24, color: 'rgba(30,20,60,0.95)', pad: 12 })); });
}
function anchored(from) { let pv = 0, v = 0; return VWC.map((q, i) => { if (i < from) return NaN; const tp = (q.h + q.l + q.c) / 3; pv += tp * VWV[i]; v += VWV[i]; return pv / v; }); }

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('המוסדות'), type: 'pop' }, { lt: s.cue('סגורות'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVW, inst = s.cue('המוסדות'), blind = s.cue('סגורות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 24], [d, 0, 24]], { p: [62800, 65000] });
      ch.draw(ctx, { reveal: 24, tfs: ['15m', '1H', '4H'] });
      vwapLine(ctx, ch, Math.floor(lerp(1, 24, prog(lt, inst - 0.2, inst + 1))));
      const r = rng(3); if (lt > inst) for (let k = 0; k < 5; k++) { const x = ch.X(3 + r() * 18), y = ch.Y(63200 + r() * 600); popT(ctx, x, y, prog(lt, inst + 0.3 + k * 0.1, inst + 0.6 + k * 0.1), () => pill(ctx, 'BIG $', x, y, { size: 22, color: '#2962ff', pad: 12 })); }
      if (lt < blind - 0.1) wipeText(ctx, 'הקו שהמוסדות מסתכלים עליו', W / 2, 300, prog(lt, 0.05, 0.4), { size: 60, weight: 900 });
      const pb = prog(lt, blind - 0.1, blind + 0.25);
      if (pb > 0) { scrim(ctx, 0.55 * pb); popT(ctx, W / 2, 860, pb, () => text(ctx, 'בעיניים סגורות?', W / 2, 860, { size: 130, weight: 900, color: '#ff5a72', glow: 50, glowColor: '#ff1744' })); }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('VWAP'), type: 'impact', k: 1.3 }, { lt: s.cue('משוקלל'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, v = s.cue('VWAP'), w = s.cue('משוקלל');
      drawBG(ctx, s.t, { glow: 1.3 });
      titleLock(ctx, lt, 'VWAP', 'VOLUME WEIGHTED AVERAGE PRICE', v, v + 0.3, 620);
      wipeText(ctx, 'המחיר הממוצע של היום', W / 2, 1080, prog(lt, s.cue('הממוצע') - 0.1, s.cue('הממוצע') + 0.3), { size: 62, weight: 900 });
      popT(ctx, W / 2, 1200, prog(lt, w, w + 0.35), () => pill(ctx, 'משוקלל לפי נפח', W / 2, 1200, { size: 42, color: '#b8860b' }));
    },
  },

  meaning: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מעל'), type: 'pop' }, { lt: s.cue('המוכרים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVW, ab = s.cue('מעל'), sel = s.cue('המוכרים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 72]], { p: [62500, 65300] });
      const tint = (a, b, col, p) => { if (p <= 0) return; ch.clip(ctx, () => { ctx.save(); ctx.globalAlpha = 0.13 * p; ctx.fillStyle = col; ctx.fillRect(ch.X(a - 0.5), ch.p.y, ch.X(b) - ch.X(a), ch.p.h); ctx.restore(); }); };
      tint(0, 24, C.up, prog(lt, ab, ab + 0.4)); tint(48, 72, C.down, prog(lt, sel, sel + 0.4));
      ch.draw(ctx, { reveal: 72, tfs: ['15m', '1H', '4H'] });
      vwapLine(ctx, ch, 72);
      popT(ctx, ch.X(12), ch.p.y + 60, prog(lt, ab, ab + 0.3), () => pill(ctx, 'מעל = הקונים שולטים', ch.X(12), ch.p.y + 60, { size: 26, color: '#0b8f63' }));
      popT(ctx, ch.X(60), ch.p.y + 60, prog(lt, sel, sel + 0.3), () => pill(ctx, 'מתחת = המוכרים', ch.X(60), ch.p.y + 60, { size: 26, color: '#d61f45' }));
    },
  },

  reset: {
    trans: 'none',
    events: s => [{ lt: s.cue('מתאפס'), type: 'impact', k: 1 }, { lt: s.cue('הנוכחי'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVW, rs = s.cue('מתאפס'), cur = s.cue('הנוכחי');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 72]], { p: [62500, 65300] });
      ch.draw(ctx, { reveal: 72, dim: 0.35, tfs: ['15m', '1H', '4H'] });
      vwapLine(ctx, ch, 72);
      daySep(ctx, ch, prog(lt, rs - 0.1, rs + 0.6));
      [24, 48].forEach((i, k) => ring(ctx, ch.X(i), ch.Y(VW[i]), 90, prog(lt, rs + k * 0.25, rs + k * 0.25 + 0.6), C.gold));
      badge(ctx, 'מספר את הסיפור של היום', prog(lt, cur, cur + 0.35), C.purple, 300, W / 2, 42);
    },
  },

  bounce: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('יחזור'), type: 'whoosh' }, { lt: s.cue('ייתמך'), type: 'impact', k: 1.1 }, { lt: s.cue('ונכנסים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVW, back = s.cue('יחזור'), hold = s.cue('ייתמך'), en = s.cue('ונכנסים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 24], [d, 4, 24]], { p: [62800, 65000] });
      const rev = kf(lt, [[0, 13], [back + 0.3, 17], [hold + 0.2, 18], [d, 24]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => (i === 8 || i === 17) && rev > i + 1, tfs: ['15m', '1H', '4H'] });
      vwapLine(ctx, ch, rev);
      [[8, 0], [17, hold]].forEach(([i, t0]) => { if (rev > i + 1) ring(ctx, ch.X(i), ch.Y(VWC[i].l), 120, prog(lt, t0, t0 + 0.6), C.gold); });
      const pe = prog(lt, en, en + 0.35);
      popT(ctx, ch.X(17) + 120, ch.Y(63600), pe, () => pill(ctx, 'ENTRY', ch.X(17) + 120, ch.Y(63600), { size: 30, color: '#2962ff' }));
      check(ctx, ch.X(17) + 120, ch.Y(63600) + 62, 24, pe);
      badge(ctx, 'יום עולה → חזרה ל-VWAP', prog(lt, 0.05, 0.35), '#0fa36b', 300, W / 2, 42);
    },
  },

  inst: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מודדים'), type: 'pop' }, { lt: s.cue('מתחתיו'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVW, meas = s.cue('מודדים'), below = s.cue('מתחתיו');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 24]], { p: [62800, 65000] });
      ch.draw(ctx, { reveal: 24, tfs: ['15m', '1H', '4H'], dim: 0.2 });
      vwapLine(ctx, ch, 24);
      if (lt > below) ch.clip(ctx, () => { ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = C.up; ctx.beginPath(); for (let i = 0; i < 24; i++) ctx.lineTo(ch.X(i), ch.Y(VW[i])); ctx.lineTo(ch.X(23), ch.p.y + ch.p.h); ctx.lineTo(ch.X(0), ch.p.y + ch.p.h); ctx.closePath(); ctx.fill(); ctx.restore(); });
      glass(ctx, 140, 480, 800, 160, 26);
      text(ctx, 'ביצוע המוסד', 900, 520, { size: 30, weight: 800, color: C.dim, align: 'right' });
      text(ctx, 'קנייה מתחת ל-VWAP = ביצוע טוב', 900, 590, { size: 40, weight: 900, align: 'right', alpha: prog(lt, meas, meas + 0.4) });
      const r = rng(9); if (lt > below) for (let k = 0; k < 6; k++) { const i = 2 + r() * 20, x = ch.X(i), y = ch.Y(VW[Math.floor(i)] - 120 - r() * 250); popT(ctx, x, y, prog(lt, below + k * 0.08, below + 0.3 + k * 0.08), () => pill(ctx, 'BUY', x, y, { size: 22, color: '#2962ff', pad: 12 })); }
    },
  },

  avoid: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שטוח'), type: 'pop' }, { lt: s.cue('ושוב'), type: 'pop' }, { lt: s.cue('כיוון'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVW, flat = s.cue('שטוח'), again = s.cue('ושוב'), dir = s.cue('כיוון');
      drawBG(ctx, s.t, { hue: lt > dir ? 30 : 0 });
      stdChart(ch, lt, [[0, 23, 48], [d, 24, 48]], { p: [63900, 65200] });
      ch.draw(ctx, { reveal: 48, tfs: ['15m', '1H', '4H'] });
      vwapLine(ctx, ch, 48, { from: 24 });
      const xs = []; for (let i = 25; i < 48; i++) if ((VWC[i].c - VW[i]) * (VWC[i - 1].c - VW[i - 1]) < 0) xs.push(i);
      xs.forEach((i, k) => cross(ctx, ch.X(i), ch.Y(VW[i]), 20, prog(lt, again + k * 0.08, again + k * 0.08 + 0.3)));
      badge(ctx, 'VWAP שטוח', prog(lt, flat, flat + 0.35), '#b8860b', 300, W / 2, 44);
      badge(ctx, 'יום בלי כיוון = לא סוחרים', prog(lt, dir, dir + 0.35), '#d61f45', 1270, W / 2, 38);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...[0, 1, 2, 3].map(k => ({ lt: s.cue('האינדיקטור') + 0.1 + k * 0.06, type: 'tick' })), { lt: s.cue('ולעוגן') - 0.2, type: 'click' }, { lt: s.cue('Anchored'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVW, op = s.cue('האינדיקטור'), pk = s.cue('ולעוגן') - 0.2, an = s.cue('Anchored');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(44, 72, 62600, 65100);
      ch.draw(ctx, { reveal: 72, tfs: ['15m', '1H', '4H'] });
      if (lt > pk) vwapLine(ctx, ch, Math.floor(lerp(48, 72, prog(lt, pk, pk + 0.8))), { from: 48 });
      const AV = anchored(56);
      if (lt > an) { lineSeries(ctx, ch, AV, Math.floor(lerp(57, 72, prog(lt, an + 0.2, an + 1))), { color: '#2962ff', width: 5, from: 56 }); ch.dot(ctx, 56, VWC[56].h, prog(lt, an, an + 0.3), '#2962ff', 12); }
      const at = tvToolbar(ctx, 40, 466, 870, lt > an - 0.3 ? 'trend' : null), [tx, ty] = at('trend');
      if (lt > pk + 0.3) { const c = kf(lt, [[pk + 0.3, 700, 1100], [an - 0.3, tx, ty], [an - 0.1, tx, ty], [an, ch.X(56), ch.Y(VWC[56].h)]]); cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - an) * 14), 1.15); }
      indicatorDialog(ctx, lt, 'VWAP', [['VWAP', 'Built-in'], ['VWAP Auto Anchored', 'Built-in'], ['Anchored VWAP', 'Drawing']], op, pk);
      popT(ctx, W / 2, 300, prog(lt, an, an + 0.35), () => pill(ctx, 'Anchored VWAP', W / 2, 300, { size: 46, color: '#2962ff' }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('קונים'), type: 'pop' }, { lt: s.cue('חזרה'), type: 'pop' }, { lt: s.cue('שטוח'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['מעל VWAP', 'מחפשים קניות', '#0fa36b', s.cue('קונים'), 'zz'],
        ['חזרה ל-VWAP', 'היא הכניסה', '#e0a100', s.cue('חזרה'), 'check'],
        ['VWAP שטוח', 'לא סוחרים', '#d61f45', s.cue('שטוח'), 'cross'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

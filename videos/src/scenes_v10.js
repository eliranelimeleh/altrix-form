// Video 10 — RSI & divergence
'use strict';
const RSP = [[0, 62000], [14, 62800], [28, 66000], [33, 65200], [42, 66300], [46, 63500], [51, 64900], [61, 63400], [69, 65600]];
const RS = genCandles(RSP, { seed: 113, noise: 0.22 });
const RV = rsiSeries(RS, 14);
const chRS = new Chart(RS);
const H1 = 28, H2 = 42, L1 = 46, L2 = 61, BOUNCE = 64900;
const rAt = (i, w = 1, f = Math.max) => { let b = i; for (let k = i - w; k <= i + w; k++) if (f(RV[k], RV[b]) === RV[k]) b = k; return b; };
const RH1 = rAt(H1, 2), RH2 = rAt(H2, 2), RL1 = rAt(L1, 1, Math.min), RL2 = rAt(L2, 1, Math.min);

function split(ch, lt, frames, p, o = {}) { // price panel on top, RSI pane below
  const [i0, i1] = kf(lt, frames);
  ch.layout(40, 370, 1000, 630, { foot: 10 }).view(i0, i1, ...(p || ch.autoP(i0, i1, 0.12)));
  return ch;
}
function rsiPane(ctx, ch, reveal, o = {}) { return oscPane(ctx, ch, 1020, 320, RV, reveal, o); }
function seg2(ctx, x0, y0, x1, y1, p, col) { // two-point line with dots
  if (p <= 0) return; const e = E.outCubic(p), x = lerp(x0, x1, e), y = lerp(y0, y1, e);
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x0, y0, 9, 0, Math.PI * 2); ctx.fill(); if (p > 0.95) { ctx.beginPath(); ctx.arc(x1, y1, 9, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('קונים'), type: 'pop' }, { lt: s.cue('אינדיקטור'), type: 'whoosh' }, { lt: s.cue('נגמר'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRS, buy = s.cue('קונים'), ind = s.cue('אינדיקטור'), end = s.cue('נגמר');
      drawBG(ctx, s.t);
      split(ch, lt, [[0, 18, 46], [d, 20, 46]], [63500, 66900]);
      ch.draw(ctx, { reveal: kf(lt, [[0, 36], [buy, 43], [d, 43]], E.lin)[0] });
      if (lt > buy) { const r = rng(2); for (let k = 0; k < 6; k++) { const x = ch.X(38 + r() * 5), y = ch.Y(66300) - 40 - r() * 120; popT(ctx, x, y, prog(lt, buy + k * 0.06, buy + k * 0.06 + 0.3), () => pill(ctx, 'BUY', x, y, { size: 22, color: '#2962ff', glow: 12, pad: 12 })); } }
      const pi = E.outCubic(prog(lt, ind - 0.1, ind + 0.4));
      if (pi > 0) {
        ctx.save(); ctx.globalAlpha = pi; ctx.translate(0, (1 - pi) * 200);
        const Y = rsiPane(ctx, ch, 43);
        seg2(ctx, ch.X(RH1), Y(RV[RH1]), ch.X(RH2), Y(RV[RH2]), prog(lt, end - 0.2, end + 0.3), C.down);
        ctx.restore();
      }
      if (lt < end - 0.1) wipeText(ctx, 'שיא חדש. כולם קונים', W / 2, 300, prog(lt, 0.05, 0.4), { size: 70, weight: 900 });
      else wipeText(ctx, 'אבל הכוח נגמר', W / 2, 300, prog(lt, end - 0.1, end + 0.25), { size: 80, weight: 900, color: '#ff5a72' });
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('RSI'), type: 'impact', k: 1.2 }, { lt: s.cue('דיברגנס'), type: 'riser' }],
    draw(ctx, s) {
      const { lt } = s, r = s.cue('RSI'), dv = s.cue('דיברגנס');
      drawBG(ctx, s.t, { glow: 1.3 });
      titleLock(ctx, lt, 'RSI', 'RELATIVE STRENGTH INDEX', r, r + 0.4, 760);
      popT(ctx, W / 2, 1150, prog(lt, dv - 0.05, dv + 0.3), () => pill(ctx, 'DIVERGENCE', W / 2, 1150, { size: 60, color: '#b8860b', glow: 50 }));
      ring(ctx, W / 2, 1150, 500, prog(lt, dv, dv + 0.7), C.gold);
    },
  },

  rsi: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מאפס'), type: 'pop' }, { lt: s.cue('שבעים'), type: 'pop' }, { lt: s.cue('לשלושים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRS, z = s.cue('מאפס'), ob = s.cue('שבעים'), os = s.cue('לשלושים');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970).view(...kf(lt, [[0, 14, 64], [d, 15, 64]]));
      const Y = oscPane(ctx, ch, 370, 970, RV, lerp(20, 64, prog(lt, 0, z + 0.5)), { label: 'RSI 14' });
      const band = (lo, hi, col, p) => { if (p <= 0) return; ctx.save(); ctx.globalAlpha = 0.22 * p; ctx.fillStyle = col; ctx.fillRect(ch.p.x, Y(hi), ch.p.w, Y(lo) - Y(hi)); ctx.restore(); };
      band(70, 100, C.down, prog(lt, ob, ob + 0.4)); band(0, 30, C.up, prog(lt, os, os + 0.4));
      popT(ctx, W / 2, Y(85), prog(lt, ob, ob + 0.35), () => pill(ctx, 'מעל 70 · קנוי יתר', W / 2, Y(85), { size: 36, color: '#d61f45' }));
      popT(ctx, W / 2, Y(15), prog(lt, os, os + 0.35), () => pill(ctx, 'מתחת ל-30 · מכור יתר', W / 2, Y(15), { size: 36, color: '#0b8f63' }));
      popT(ctx, W / 2, 300, prog(lt, z, z + 0.35), () => pill(ctx, 'עוצמת התנועה · 0 עד 100', W / 2, 300, { size: 40, color: C.purple }));
    },
  },

  myth: {
    trans: 'whip',
    events: s => [{ lt: s.cue('לשורט'), type: 'impact', k: 1 }, { lt: s.cue('הרבה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRS, sh = s.cue('לשורט'), long = s.cue('הרבה');
      drawBG(ctx, s.t);
      split(ch, lt, [[0, 8, 31], [d, 8, 31]], [62200, 66400]);
      const rev = kf(lt, [[0, 21], [sh, 22], [d - 0.2, 29]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      const Y = rsiPane(ctx, ch, rev);
      if (lt > long) { ctx.save(); ctx.globalAlpha = 0.25 + 0.15 * Math.sin(lt * 10); ctx.fillStyle = C.up; ctx.fillRect(ch.X(17), Y(100), ch.X(rev) - ch.X(17), Y(70) - Y(100)); ctx.restore(); }
      const x = ch.X(21), y = ch.Y(RS[21].h) - 60;
      popT(ctx, x, y, prog(lt, 0.1, 0.4), () => pill(ctx, 'שורט? כי קנוי יתר', x, y, { size: 30, color: '#d61f45' }));
      cross(ctx, x, y - 70, 30, prog(lt, sh, sh + 0.35));
      badge(ctx, 'במגמה חזקה RSI נשאר למעלה', prog(lt, long, long + 0.35), '#0fa36b', 300, W / 2, 38);
    },
  },

  div: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('גבוה'), type: 'pop' }, { lt: s.cue('נמוך'), type: 'pop' }, { lt: s.cue('נחלש'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRS, hi = s.cue('גבוה'), lo = s.cue('נמוך'), wk = s.cue('נחלש');
      drawBG(ctx, s.t);
      split(ch, lt, [[0, 20, 46], [d, 22, 46]], [63500, 66900]);
      ch.draw(ctx, { reveal: 43, highlight: i => (i === H1 || i === H2) && lt > hi });
      const Y = rsiPane(ctx, ch, 43);
      seg2(ctx, ch.X(H1), ch.Y(RS[H1].h), ch.X(H2), ch.Y(RS[H2].h), prog(lt, hi - 0.1, hi + 0.4), C.up);
      seg2(ctx, ch.X(RH1), Y(RV[RH1]), ch.X(RH2), Y(RV[RH2]), prog(lt, lo - 0.1, lo + 0.4), C.down);
      popT(ctx, ch.X(35), ch.Y(66600), prog(lt, hi, hi + 0.3), () => pill(ctx, 'מחיר: שיא גבוה יותר', ch.X(35), ch.Y(66600), { size: 28, color: '#0b8f63' }));
      popT(ctx, ch.X(35), 1080, prog(lt, lo, lo + 0.3), () => pill(ctx, 'RSI: שיא נמוך יותר', ch.X(35), 1080, { size: 28, color: '#d61f45' }));
      badge(ctx, 'Bearish Divergence', prog(lt, wk, wk + 0.35), '#d61f45', 300, W / 2, 46);
    },
  },

  drop: {
    trans: 'none',
    events: s => [{ lt: s.cue('חד') - 0.1, type: 'impact', k: 1.5 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRS, sh = s.cue('חד');
      drawBG(ctx, s.t, { hue: 40 });
      split(ch, lt, [[0, 22, 46], [d, 24, 48]], [63100, 66900]);
      const rev = kf(lt, [[0, 43], [sh, 46.5], [d, 47]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      const Y = rsiPane(ctx, ch, rev);
      seg2(ctx, ch.X(RH1), Y(RV[RH1]), ch.X(RH2), Y(RV[RH2]), 1, C.down);
      arrow(ctx, ch.X(42) + 30, ch.Y(66200), ch.X(46) + 20, ch.Y(63700), prog(lt, sh - 0.3, sh + 0.3), { color: C.down, width: 14, head: 50 });
      badge(ctx, 'תיקון חד', prog(lt, sh, sh + 0.35), '#d61f45', 300, W / 2, 50);
    },
  },

  bull: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נמוך'), type: 'pop' }, { lt: s.cue('גבוה'), type: 'pop' }, { lt: s.cue('לעלייה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRS, lo = s.cue('נמוך'), hi = s.cue('גבוה'), up = s.cue('לעלייה');
      drawBG(ctx, s.t);
      split(ch, lt, [[0, 40, 64], [d, 40, 64]], [62900, 65600]);
      ch.draw(ctx, { reveal: 62, highlight: i => (i === L1 || i === L2) && lt > lo });
      const Y = rsiPane(ctx, ch, 62);
      seg2(ctx, ch.X(L1), ch.Y(RS[L1].l), ch.X(L2), ch.Y(RS[L2].l), prog(lt, lo - 0.1, lo + 0.4), C.down);
      seg2(ctx, ch.X(RL1), Y(RV[RL1]), ch.X(RL2), Y(RV[RL2]), prog(lt, hi - 0.1, hi + 0.4), C.up);
      popT(ctx, ch.X(53), ch.Y(63100), prog(lt, lo, lo + 0.3), () => pill(ctx, 'מחיר: שפל נמוך יותר', ch.X(53), ch.Y(63100), { size: 28, color: '#d61f45' }));
      popT(ctx, ch.X(53), 1300, prog(lt, hi, hi + 0.3), () => pill(ctx, 'RSI: שפל גבוה יותר', ch.X(53), 1300, { size: 28, color: '#0b8f63' }));
      badge(ctx, 'Bullish Divergence', prog(lt, up, up + 0.35), '#0fa36b', 300, W / 2, 46);
    },
  },

  confirm: {
    trans: 'none',
    events: s => [{ lt: s.cue('אזהרה'), type: 'pop' }, { lt: s.cue('לשבירת'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRS, warn = s.cue('אזהרה'), br = s.cue('לשבירת');
      drawBG(ctx, s.t);
      split(ch, lt, [[0, 40, 64], [d, 42, 70]], [62900, 66000]);
      const rev = kf(lt, [[0, 62], [br + 0.3, 66], [d, 69]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      const Y = rsiPane(ctx, ch, rev);
      seg2(ctx, ch.X(RL1), Y(RV[RL1]), ch.X(RL2), Y(RV[RL2]), 1, C.up);
      const ok = rev > 65.5;
      ch.hline(ctx, BOUNCE, 51, 72, { color: ok ? C.purple2 : 'rgba(255,255,255,0.8)', dash: ok ? null : [12, 10], width: ok ? 6 : 4 });
      ch.tag(ctx, 56, BOUNCE, 'BOS', ok ? prog(lt, br + 0.3, br + 0.6) : 0, { color: C.purple, size: 38, off: 44 });
      if (ok) check(ctx, ch.X(66), ch.Y(BOUNCE) + 80, 32, prog(lt, br + 0.4, br + 0.7));
      if (lt < br) badge(ctx, 'דיברגנס = אזהרה, לא כניסה', prog(lt, warn, warn + 0.35), '#b8860b', 300, W / 2, 40);
      else badge(ctx, 'שבירת מבנה מאשרת', prog(lt, br, br + 0.35), '#0fa36b', 300, W / 2, 44);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...Array.from({ length: 12 }, (_, k) => ({ lt: s.cue('Relative') + 0.1 + k * 0.05, type: 'tick' })), { lt: s.cue('מהאינדיקטורים'), type: 'click' }, { lt: s.cue('קו'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRS, op = s.cue('תוסיף'), pk = s.cue('מהאינדיקטורים'), ln = s.cue('קו');
      drawBG(ctx, s.t);
      split(ch, lt, [[0, 20, 46], [d, 20, 46]], [63500, 66900]);
      ch.draw(ctx, { reveal: 43 });
      const pp = E.outCubic(prog(lt, pk + 0.2, pk + 0.6));
      if (pp > 0) {
        ctx.save(); ctx.globalAlpha = pp; ctx.translate(0, (1 - pp) * 150);
        const Y = rsiPane(ctx, ch, 43);
        seg2(ctx, ch.X(RH1), Y(RV[RH1]), ch.X(RH2), Y(RV[RH2]), prog(lt, ln + 0.3, ln + 0.8), C.down);
        ctx.restore();
      }
      seg2(ctx, ch.X(H1), ch.Y(RS[H1].h), ch.X(H2), ch.Y(RS[H2].h), prog(lt, ln - 0.1, ln + 0.4), C.up);
      indicatorDialog(ctx, lt, 'Relative Strength Index', [['Relative Strength Index', 'Built-in'], ['Stochastic RSI', 'Built-in'], ['RSI Divergence Indicator', 'Built-in']], op, pk);
      popT(ctx, W / 2, 300, prog(lt, ln, ln + 0.35), () => pill(ctx, 'קו בין השיאים · מחיר + RSI', W / 2, 300, { size: 38, color: C.purple }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('RSI'), type: 'pop' }, { lt: s.cue('דיברגנס'), type: 'pop' }, { lt: s.cue('שבירת'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['RSI', 'מודד כוח', C.purple, s.cue('RSI'), 'zz'],
        ['Divergence', 'מזהיר', '#e0a100', s.cue('דיברגנס'), 'warn'],
        ['שבירת מבנה', 'מאשרת', '#0fa36b', s.cue('שבירת'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

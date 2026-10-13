// Video 21 — Trailing stop by market structure
'use strict';
const TSP = [[0, 62200], [4, 62800], [7, 62300], [16, 64400], [20, 64000], [24, 65700], [28, 65200], [32, 66900], [36, 66300], [40, 67500], [46, 65400]];
const TSC = genCandles(TSP, { seed: 211, noise: 0.16 });
const TBP = [...TSP.slice(0, 10), [52, 62450]];
const TBC = genCandles(TBP, { seed: 211, noise: 0.16 });
const chTS = new Chart(TSC), chTB = new Chart(TBC);
const ENTI = 8, ENTP = TSC[8].c;
// stop steps: [from index, stop price]
const STEPS = [[8, 62150], [22, 63880], [30, 65080], [38, 66180]];
const stopAt = i => { let s = STEPS[0][1]; for (const [k, p] of STEPS) if (i >= k) s = p; return s; };
const EXITI = (() => { for (let i = 39; i < TSC.length; i++) if (TSC[i].l <= stopAt(i)) return i; return TSC.length - 1; })();
const HLS = [[7, 62300], [20, 64000], [28, 65200], [36, 66300]];

function stopLine(ctx, ch, upto, o = {}) { // step function
  const n = Math.min(upto, TSC.length); const { color = C.down, width = 5 } = o;
  ch.clip(ctx, () => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = color; ctx.shadowBlur = 16; ctx.beginPath();
    for (let i = ENTI; i < n; i++) { const y = ch.Y(stopAt(i)); if (i === ENTI) ctx.moveTo(ch.X(i), y); else { ctx.lineTo(ch.X(i), ch.Y(stopAt(i - 1))); ctx.lineTo(ch.X(i), y); } ctx.lineTo(ch.X(i + 1), y); }
    ctx.stroke(); ctx.restore(); });
}
function pnlBox(ctx, v, label = 'P&L') {
  const col = v > 50 ? '#3df2a6' : v < -50 ? '#ff5a72' : '#ffffff';
  glass(ctx, 320, 1205, 440, 110, 26, { border: col, glowColor: col, glow: 25 });
  text(ctx, label, 720, 1260, { size: 28, weight: 800, color: C.dim, align: 'right' });
  text(ctx, (v >= 0 ? '+$' : '-$') + fmt(Math.abs(Math.round(v / 10) * 10)), 470, 1262, { size: 50, weight: 900, color: col, fam: MONO });
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('המון'), type: 'pop' }, { lt: s.cue('לכניסה'), type: 'impact', k: 1.3 }, { lt: s.cue('אפס'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chTB, up = s.cue('המון'), back = s.cue('לכניסה'), zero = s.cue('אפס');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 54], [d, 0, 54]], { p: [61600, 68200] });
      ch.hline(ctx, ENTP, ENTI, 56, { color: '#2962ff', width: 4 });
      const rev = kf(lt, [[0, 10], [up, 41], [back, 52], [d, 52]], E.lin)[0];
      const last = ch.draw(ctx, { reveal: rev });
      pnlBox(ctx, last.c - ENTP);
      if (lt < back - 0.1) wipeText(ctx, 'עסקה מושלמת, עלתה המון', W / 2, 300, prog(lt, 0.05, 0.4), { size: 64, weight: 900, color: '#3df2a6' });
      else wipeText(ctx, 'וחזרה לכניסה. אפס.', W / 2, 300, prog(lt, back - 0.1, back + 0.25), { size: 72, weight: 900, color: '#ff5a72' });
      if (lt > zero) { const f = Math.max(0, 1 - (lt - zero) / 0.35); if (f > 0) { ctx.fillStyle = `rgba(255,40,70,${0.25 * f})`; ctx.fillRect(0, 0, W, H); } }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('Trailing'), type: 'impact', k: 1.2 }, { lt: s.cue('שעולה'), type: 'riser' }],
    draw(ctx, s) {
      const { lt } = s, tr = s.cue('Trailing'), rise = s.cue('שעולה');
      drawBG(ctx, s.t, { glow: 1.3 });
      titleLock(ctx, lt, 'סטופ שעולה', 'TRAILING STOP', tr - 0.1, tr + 0.3, 560);
      const p = prog(lt, rise - 0.2, rise + 0.8);
      ctx.save(); ctx.strokeStyle = C.down; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.shadowColor = C.down; ctx.shadowBlur = 25; ctx.beginPath(); ctx.moveTo(220, 1300);
      [[380, 1300], [380, 1180], [540, 1180], [540, 1060], [700, 1060], [700, 940], [860, 940]].slice(0, Math.ceil(7 * p)).forEach(([x, y]) => ctx.lineTo(x, y)); ctx.stroke(); ctx.restore();
      wipeText(ctx, 'לפי מבנה', W / 2, 830, prog(lt, s.cue('מבנה') - 0.1, s.cue('מבנה') + 0.3), { size: 64, weight: 900, color: C.purple2 });
    },
  },

  start: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מתחת'), type: 'pop' }, { lt: s.cue('הכניסה'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chTS, und = s.cue('מתחת'), en = s.cue('הכניסה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 24], [d, 0, 24]], { p: [61700, 64600] });
      ch.draw(ctx, { reveal: 9 });
      ch.hline(ctx, ENTP, ENTI, 26, { color: '#2962ff', width: 4, progress: prog(lt, en - 0.3, en + 0.2) });
      ch.dot(ctx, 7, 62300, prog(lt, und - 0.1, und + 0.2), C.teal, 13);
      stopLine(ctx, ch, lerp(ENTI, 21.5, prog(lt, und, und + 0.6)));
      popT(ctx, ch.X(14), ch.Y(62150) + 36, prog(lt, und, und + 0.3), () => pill(ctx, 'STOP מתחת לשפל', ch.X(14), ch.Y(62150) + 36, { size: 28, color: '#d61f45' }));
      popT(ctx, ch.X(14), ch.Y(ENTP) - 36, prog(lt, en, en + 0.3), () => pill(ctx, 'ENTRY', ch.X(14), ch.Y(ENTP) - 36, { size: 28, color: '#2962ff' }));
    },
  },

  step: {
    trans: 'none',
    events: s => [{ lt: s.cue('שובר'), type: 'pop' }, { lt: s.cue('גבוה'), type: 'pop' }, { lt: s.cue('מזיזים'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chTS, br = s.cue('שובר'), hl = s.cue('גבוה'), mv = s.cue('מזיזים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 26], [d, 2, 30]], { p: [61700, 66200] });
      const rev = kf(lt, [[0, 9], [br + 0.3, 22.5], [d, 24]], E.lin)[0];
      ch.hline(ctx, ENTP, ENTI, 32, { color: '#2962ff', width: 3 });
      ch.draw(ctx, { reveal: rev });
      ch.hline(ctx, 64400, 16, 26, { color: 'rgba(255,255,255,0.7)', width: 3, dash: [10, 8], progress: prog(lt, br - 0.3, br) });
      if (rev > 22) ring(ctx, ch.X(22), ch.Y(64400), 150, prog(lt, br, br + 0.6));
      ch.dot(ctx, 20, 64000, prog(lt, hl, hl + 0.3), C.teal, 14); ring(ctx, ch.X(20), ch.Y(64000), 110, prog(lt, hl, hl + 0.6), C.teal);
      stopLine(ctx, ch, lt > mv ? rev + 1 : Math.min(rev, 22));
      if (lt > mv) arrow(ctx, ch.X(23.5), ch.Y(62150), ch.X(23.5), ch.Y(63880) + 10, prog(lt, mv, mv + 0.5), { color: C.purple2, width: 8, head: 28 });
      popT(ctx, ch.X(10), ch.Y(63880) - 40, prog(lt, mv + 0.3, mv + 0.6), () => pill(ctx, 'STOP ↑ מתחת לשפל החדש', ch.X(12), ch.Y(63880) - 40, { size: 26, color: C.purple }));
    },
  },

  lock: {
    trans: 'none',
    events: s => [{ lt: s.cue('ננעל'), type: 'pop' }, { lt: s.cue('מתהפך'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chTS, lk = s.cue('ננעל'), flip = s.cue('מתהפך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 30], [lk, 4, 48], [d, 4, 48]], { p: [61700, 68100] });
      const rev = kf(lt, [[0, 24], [lk, 39], [flip + 0.5, EXITI + 1], [d, EXITI + 1]], E.lin)[0];
      const cur = stopAt(Math.floor(rev) - 1);
      ch.zone(ctx, cur, ENTP, ENTI, Math.min(rev, EXITI + 1), { color: C.up, alpha: 0.16 * prog(lt, lk, lk + 0.4) });
      ch.hline(ctx, ENTP, ENTI, 50, { color: '#2962ff', width: 3 });
      ch.draw(ctx, { reveal: rev });
      stopLine(ctx, ch, rev + 0.5);
      if (rev > EXITI + 0.5) { ring(ctx, ch.X(EXITI), ch.Y(stopAt(EXITI)), 180, prog(lt, flip, flip + 0.6), C.up); check(ctx, ch.X(EXITI) - 110, ch.Y(stopAt(EXITI)) + 60, 28, prog(lt, flip + 0.2, flip + 0.5)); }
      popT(ctx, ch.X(18), ch.Y((cur + ENTP) / 2), prog(lt, lk, lk + 0.35), () => pill(ctx, 'רווח נעול', ch.X(18), ch.Y((cur + ENTP) / 2), { size: 32, color: '#0b8f63' }));
      pnlBox(ctx, cur - ENTP, 'נעול');
    },
  },

  never: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('למעלה'), type: 'impact', k: 1.1 }, { lt: s.cue('מורידים'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, up = s.cue('למעלה'), down = s.cue('מורידים');
      drawBG(ctx, s.t, { glow: 1.2 });
      wipeText(ctx, 'החוק', W / 2, 380, prog(lt, 0, 0.35), { size: 110, weight: 900, color: C.gold, glow: 30 });
      arrow(ctx, W / 2 + 200, 1200, W / 2 + 200, 640, prog(lt, up - 0.1, up + 0.4), { color: C.up, width: 26, head: 90, glow: 40 });
      popT(ctx, W / 2 + 200, 1300, prog(lt, up, up + 0.3), () => pill(ctx, 'רק למעלה', W / 2 + 200, 1300, { size: 44, color: '#0b8f63' }));
      arrow(ctx, W / 2 - 200, 640, W / 2 - 200, 1200, prog(lt, down - 0.1, down + 0.4), { color: 'rgba(242,54,69,0.6)', width: 26, head: 90, glow: 10 });
      cross(ctx, W / 2 - 200, 920, 90, prog(lt, down + 0.2, down + 0.5));
      popT(ctx, W / 2 - 200, 1300, prog(lt, down, down + 0.3), () => pill(ctx, 'אף פעם לא למטה', W / 2 - 200, 1300, { size: 40, color: '#d61f45' }));
    },
  },

  vsfixed: {
    trans: 'whip',
    events: s => [{ lt: s.cue('קבוע'), type: 'pop' }, { lt: s.cue('לנשום'), type: 'pop' }, { lt: s.cue('נשברת'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, fx = s.cue('קבוע'), br = s.cue('לנשום'), end = s.cue('נשברת');
      drawBG(ctx, s.t);
      let peak = 0; const FIX = TSC.map((q, i) => { peak = Math.max(peak, q.c); return i < ENTI ? NaN : peak * 0.985; });
      let fe = -1; for (let i = ENTI + 1; i < TSC.length; i++) if (TSC[i].l < FIX[i - 1]) { fe = i; break; }
      const draw = (y, label, col, fn, t0) => {
        chTS.layout(40, y, 1000, 470, { head: 70 }).view(4, 48, 61700, 68100); chTS.draw(ctx, { reveal: lerp(10, 47, prog(lt, t0, end + 0.3)), lastTag: false });
        fn(); popT(ctx, 800, y + 110, prog(lt, t0, t0 + 0.3), () => pill(ctx, label, 800, y + 110, { size: 28, color: col }));
      };
      draw(360, 'סטופ קבוע 1.5%', '#d61f45', () => { lineSeries(ctx, chTS, FIX, Math.floor(lerp(10, 47, prog(lt, fx, end + 0.3))), { color: '#ff8095', width: 4, from: ENTI });
        if (fe > 0 && lerp(10, 47, prog(lt, fx, end + 0.3)) > fe) { ring(ctx, chTS.X(fe), chTS.Y(FIX[fe - 1]), 90, prog(lt, fx + 0.6, fx + 1.2), C.down); cross(ctx, chTS.X(fe), chTS.Y(FIX[fe - 1]) + 60, 22, 1); } }, fx);
      draw(870, 'סטופ לפי מבנה', '#0b8f63', () => stopLine(ctx, chTS, lerp(10, 47, prog(lt, br, end + 0.3)), { color: '#3df2a6' }), br);
      badge(ctx, 'יוצא רק כשהמגמה נשברת', prog(lt, end, end + 0.35), '#0fa36b', 300, W / 2, 42);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('גוררים'), type: 'click' }, { lt: s.cue('שפל'), type: 'click' }, { lt: s.cue('נעול'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chTS, drag = s.cue('גוררים'), low = s.cue('שפל'), lk = s.cue('נעול');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(4, 44, 61700, 68100);
      const k = lt < drag ? 0 : lt < low ? 1 : lt < lk ? 2 : 3, sp = STEPS[k][1], prev = STEPS[Math.max(0, k - 1)][1];
      const anim = lerp(prev, sp, E.inOut(prog(lt, [0, drag, low, lk][k], [0, drag, low, lk][k] + 0.5)));
      ch.zone(ctx, anim, ENTP, 40, 46, { color: k ? C.up : C.down, alpha: 0.22 });
      ch.zone(ctx, ENTP, 68000, 40, 46, { color: C.up, alpha: 0.12 });
      ch.draw(ctx, { reveal: 40 });
      ch.hline(ctx, ENTP, 40, 46, { color: '#ffffff', width: 3 });
      ch.hline(ctx, anim, 40, 46, { color: C.down, width: 4 });
      HLS.slice(1, k + 1).forEach(([i, p]) => ch.dot(ctx, i, p, 1, C.teal, 11));
      tvToolbar(ctx, 40, 466, 870, 'pos');
      cursor(ctx, ch.X(43), ch.Y(anim) + 6, k ? 0.5 : 0, 1.15);
      text(ctx, `Stop: ${fmt(anim)}`, ch.X(43), ch.Y(anim) + 34, { size: 24, weight: 700, fam: MONO, color: '#ff8095' });
      if (anim > ENTP) popT(ctx, W / 2, 300, prog(lt, lk, lk + 0.35), () => pill(ctx, `נעול: +$${fmt(Math.round((anim - ENTP) / 10) * 10)}`, W / 2, 300, { size: 44, color: '#0b8f63' }));
      else popT(ctx, W / 2, 300, prog(lt, 0.1, 0.4), () => pill(ctx, 'Long Position · גוררים את הסטופ', W / 2, 300, { size: 38, color: C.purple }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('סטופ'), type: 'pop' }, { lt: s.cue('עולה'), type: 'pop' }, { lt: s.cue('יורד'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['סטופ מתחת לשפל', 'מההתחלה', '#d61f45', s.cue('סטופ'), 1],
        ['עולה עם כל שפל חדש', 'צעד אחרי צעד', C.purple, s.cue('עולה'), 2],
        ['לא יורד אף פעם', 'הרווח ננעל', '#0fa36b', s.cue('יורד'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

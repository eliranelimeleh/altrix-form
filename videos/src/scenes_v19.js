// Video 19 — Bull Flag & Ascending Triangle (continuation patterns)
'use strict';
const FLP = [[0, 62200], [7, 62000], [14, 65000], [16, 64600], [18, 64900], [20, 64400], [22, 64700], [24, 64200], [28, 65500], [38, 67700]];
const FLC = genCandles(FLP, { seed: 191, noise: 0.14 });
const FLV = FLC.map((_, i) => i < 8 ? 50 : i <= 14 ? 150 - (i - 8) * 5 : i <= 24 ? 90 - (i - 14) * 6 : i <= 27 ? 160 : 90);
const TRP = [[0, 62600], [3, 62800], [6, 65000], [10, 63400], [14, 65000], [18, 63900], [22, 65000], [25, 64400], [28, 64980], [30, 64700], [33, 65900], [40, 66600]];
const TRC = genCandles(TRP, { seed: 193, noise: 0.14 });
const TFP = [...TRP.slice(0, 9), [29, 64700], [31, 64000], [36, 63100]];
const TFC = genCandles(TFP, { seed: 193, noise: 0.14 });
const chFL = new Chart(FLC), chTR = new Chart(TRC), chTF = new Chart(TFC);
const UP0 = [14, 65050], UP1 = [24, 64600], DN0 = [15, 64600], DN1 = [25, 64150]; // flag channel (upper / lower)
const chLine = (a, b, x) => a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
const POLE = 65000 - 62000, BRK = 64650, FTGT = BRK + POLE;
const RES = 65000, RL0 = [3, 62800], RL1 = [25, 64400];

function seg(ctx, ch, a, b, p, col, w = 5, dash = null) {
  if (p <= 0) return; const e = E.outCubic(clamp(p));
  ch.clip(ctx, () => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.shadowColor = col; ctx.shadowBlur = 16; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(ch.X(a[0]), ch.Y(a[1])); ctx.lineTo(lerp(ch.X(a[0]), ch.X(b[0]), e), lerp(ch.Y(a[1]), ch.Y(b[1]), e)); ctx.stroke(); ctx.restore(); });
}
function flagLines(ctx, ch, p, ext = 27) {
  seg(ctx, ch, UP0, [ext, chLine(UP0, UP1, ext)], p, C.purple2); seg(ctx, ch, DN0, [ext, chLine(DN0, DN1, ext)], p, C.purple2);
}
function triLines(ctx, ch, p1, p2, ext = 34) { seg(ctx, ch, [4, RES], [ext, RES], p1, '#ff8095'); seg(ctx, ch, RL0, [ext, chLine(RL0, RL1, ext)], p2, '#3df2a6'); }

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('נח'), type: 'pop' }, { lt: s.cue('נגמרה'), type: 'pop' }, { lt: s.cue('לפריצה'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFL, rest = s.cue('נח'), over = s.cue('נגמרה'), brk = s.cue('לפריצה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 32], [d, 2, 34]], { p: [61500, 66800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 10], [rest, 22], [brk - 0.2, 25], [brk + 0.4, 28], [d, 30]], E.lin)[0] });
      if (lt > brk) { ring(ctx, ch.X(26), ch.Y(BRK), 220, prog(lt, brk, brk + 0.6)); burst(ctx, ch.X(26), ch.Y(BRK), prog(lt, brk, brk + 0.9), '#3df2a6', 24, 4, 240); }
      if (lt < over - 0.1) wipeText(ctx, 'עלה חזק, ועכשיו נח', W / 2, 300, prog(lt, 0.05, 0.4), { size: 72, weight: 900 });
      else if (lt < brk - 0.1) wipeText(ctx, 'המגמה נגמרה?', W / 2, 300, prog(lt, over - 0.1, over + 0.25), { size: 80, weight: 900, color: '#ff5a72' });
      else wipeText(ctx, 'המקצוענים חיכו לפריצה', W / 2, 300, prog(lt, brk - 0.1, brk + 0.25), { size: 70, weight: 900, color: '#3df2a6' });
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('Bull'), type: 'impact', k: 1.1 }, { lt: s.cue('ומשולש'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, bf = s.cue('Bull'), tr = s.cue('ומשולש');
      drawBG(ctx, s.t, { glow: 1.3 });
      wipeText(ctx, 'שני דפוסי ההמשך הכי חזקים', W / 2, 420, prog(lt, 0, 0.4), { size: 64, weight: 900 });
      const draw = (x, lab, lines, t0) => {
        const p = prog(lt, t0 - 0.05, t0 + 0.6); if (p <= 0) return;
        popT(ctx, x, 920, Math.min(1, p * 2), () => { glass(ctx, x - 200, 680, 400, 480, 32, { border: C.up, glowColor: C.up, glow: 30 }); text(ctx, lab, x, 1100, { size: lab.length > 9 ? 44 : 54, weight: 900, color: '#3df2a6' }); });
        ctx.save(); ctx.strokeStyle = '#3df2a6'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.shadowColor = C.up; ctx.shadowBlur = 20;
        lines.forEach(([a, b, c, d2], k) => { const pk = clamp(p * lines.length - k); if (pk <= 0) return; ctx.beginPath(); ctx.moveTo(x + a, 900 + b); ctx.lineTo(x + lerp(a, c, pk), 900 + lerp(b, d2, pk)); ctx.stroke(); });
        ctx.restore();
      };
      draw(W / 2 + 230, 'BULL FLAG', [[-130, 140, -60, -120], [-60, -120, 90, -60], [-60, -40, 90, 20], [90, -60, 140, -150]], bf);
      draw(W / 2 - 230, 'משולש עולה', [[-140, -100, 140, -100], [-140, 140, 140, -100], [100, -100, 150, -160]], tr);
    },
  },

  pole: {
    trans: 'whip',
    events: s => [{ lt: s.cue('בתורן'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFL, pl = s.cue('בתורן');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [d, 1, 30]], { p: [61500, 66800] });
      ch.draw(ctx, { reveal: 15, highlight: i => i >= 8 && i <= 14 && lt > pl });
      const x = ch.X(5); arrow(ctx, x, ch.Y(62000), x, ch.Y(65000), prog(lt, pl, pl + 0.5), { color: C.gold, width: 10, head: 36 });
      popT(ctx, x - 20, ch.Y(63500), prog(lt, pl, pl + 0.35), () => pill(ctx, 'תורן', x + 90, ch.Y(63500), { size: 36, color: '#b8860b' }));
      badge(ctx, 'תנועה חדה ומהירה', prog(lt, pl + 0.3, pl + 0.6), '#0fa36b', 300, W / 2, 44);
    },
  },

  flag: {
    trans: 'none',
    events: s => [{ lt: s.cue('הדגל'), type: 'pop' }, { lt: s.cue('מקבילים'), type: 'pop' }, { lt: s.cue('נפח'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFL, fl = s.cue('הדגל'), par = s.cue('מקבילים'), vol = s.cue('נפח');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 1, 30], [d, 4, 30]], { p: [61500, 66800] });
      const rev = lerp(15, 25, prog(lt, 0, par));
      ch.draw(ctx, { reveal: rev });
      volumeBars(ctx, ch, FLV, rev, { h: 170, highlight: i => lt > vol && i >= 15 && i <= 24 });
      flagLines(ctx, ch, prog(lt, par - 0.2, par + 0.5), 25);
      popT(ctx, ch.X(19.5), ch.Y(65400), prog(lt, fl, fl + 0.35), () => pill(ctx, 'דגל', ch.X(19.5), ch.Y(65400), { size: 34, color: C.purple }));
      if (lt > vol) arrow(ctx, ch.X(15), ch.p.y + ch.p.h - 200, ch.X(24), ch.p.y + ch.p.h - 110, prog(lt, vol, vol + 0.5), { color: '#ff8095', width: 6, head: 22 });
      badge(ctx, 'נפח שיורד', prog(lt, vol, vol + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },

  brk: {
    trans: 'none',
    events: s => [{ lt: s.cue('שובר'), type: 'impact', k: 1.3 }, { lt: s.cue('אורך'), type: 'pop' }, { lt: s.cue('מועתק'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFL, br = s.cue('שובר'), len = s.cue('אורך'), cp = s.cue('מועתק');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 30], [len, 2, 40], [d, 2, 40]], { p: [61500, 68300] });
      const rev = kf(lt, [[0, 25], [br + 0.3, 27], [cp + 0.3, 30], [d, 38]], E.lin)[0];
      ch.hline(ctx, FTGT, 26, 42, { color: '#3df2a6', width: 5, progress: prog(lt, cp, cp + 0.5) });
      ch.draw(ctx, { reveal: rev });
      volumeBars(ctx, ch, FLV, rev, { h: 150, alpha: 0.4 });
      flagLines(ctx, ch, 1, 27);
      if (lt > br) { ring(ctx, ch.X(25.5), ch.Y(BRK), 200, prog(lt, br, br + 0.6), C.up); popT(ctx, ch.X(25.5) - 120, ch.Y(BRK) + 50, prog(lt, br, br + 0.3), () => pill(ctx, 'ENTRY', ch.X(25.5) - 120, ch.Y(BRK) + 50, { size: 30, color: '#2962ff' })); }
      arrow(ctx, ch.X(5), ch.Y(62000), ch.X(5), ch.Y(65000), prog(lt, len - 0.1, len + 0.3), { color: C.gold, width: 8, head: 28 });
      arrow(ctx, ch.X(27), ch.Y(BRK), ch.X(27), ch.Y(FTGT), prog(lt, cp, cp + 0.6), { color: C.gold, width: 8, head: 28 });
      popT(ctx, ch.X(32), ch.Y(FTGT) + 40, prog(lt, cp + 0.3, cp + 0.6), () => pill(ctx, 'TARGET = אורך התורן', ch.X(32), ch.Y(FTGT) + 40, { size: 28, color: '#0b8f63' }));
    },
  },

  tri: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שטוחה'), type: 'pop' }, { lt: s.cue('שעולים'), type: 'pop' }, { lt: s.cue('לוחצים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chTR, flat = s.cue('שטוחה'), rise = s.cue('שעולים'), push = s.cue('לוחצים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 34], [d, 0, 34]], { p: [62200, 66900] });
      ch.draw(ctx, { reveal: lerp(10, 29, prog(lt, 0, push + 0.5)), dim: 0.2 });
      triLines(ctx, ch, prog(lt, flat - 0.1, flat + 0.5), prog(lt, rise - 0.1, rise + 0.5), 30);
      [10, 18, 25].forEach((i, k) => ring(ctx, ch.X(i), ch.Y(TRP.find(p => p[0] === i)[1]), 90, prog(lt, push + k * 0.2, push + k * 0.2 + 0.6), C.up));
      popT(ctx, ch.X(15), ch.Y(RES) - 40, prog(lt, flat, flat + 0.3), () => pill(ctx, 'התנגדות שטוחה', ch.X(15), ch.Y(RES) - 40, { size: 28, color: '#d61f45' }));
      popT(ctx, ch.X(20), ch.Y(63300), prog(lt, rise, rise + 0.3), () => pill(ctx, 'שפלים עולים', ch.X(20), ch.Y(63300), { size: 28, color: '#0b8f63' }));
      badge(ctx, 'הקונים לוחצים', prog(lt, push, push + 0.35), '#0fa36b', 300, W / 2, 44);
    },
  },

  tbreak: {
    trans: 'none',
    events: s => [{ lt: s.cue('נשברת'), type: 'impact', k: 1.4 }, { lt: s.cue('נגיעות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chTR, br = s.cue('נשברת'), tch = s.cue('נגיעות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 34], [d, 4, 41]], { p: [62200, 67200] });
      const rev = kf(lt, [[0, 29], [br + 0.3, 33], [d, 40]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      triLines(ctx, ch, 1, 1, 31);
      if (rev > 32) { ring(ctx, ch.X(31.5), ch.Y(RES), 220, prog(lt, br, br + 0.6), C.up); burst(ctx, ch.X(31.5), ch.Y(RES), prog(lt, br, br + 0.9), '#3df2a6', 24, 3, 240); }
      [6, 14, 22, 28].forEach((i, k) => { const x = ch.X(i), y = ch.Y(RES) - 60; popT(ctx, x, y, prog(lt, tch + k * 0.12, tch + k * 0.12 + 0.3), () => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fillStyle = C.purple; ctx.fill(); ctx.restore(); text(ctx, String(k + 1), x, y + 2, { size: 32, weight: 900 }); }); });
      badge(ctx, 'יותר נגיעות = פריצה חזקה', prog(lt, tch, tch + 0.35), '#0fa36b', 300, W / 2, 42);
    },
  },

  fail: {
    trans: 'whip',
    events: s => [{ lt: s.cue('התחתון'), type: 'impact', k: 1.3 }, { lt: s.cue('יוצאים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chTF, low = s.cue('התחתון'), out = s.cue('יוצאים');
      drawBG(ctx, s.t, { hue: lt > low ? 40 : 0 });
      stdChart(ch, lt, [[0, 0, 37], [d, 2, 37]], { p: [62200, 66200] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 28], [low + 0.3, 32], [d, 36]], E.lin)[0] });
      triLines(ctx, ch, 1, 1, 33);
      if (lt > low) { ring(ctx, ch.X(30.5), ch.Y(chLine(RL0, RL1, 30.5)), 200, prog(lt, low, low + 0.6), C.down); cross(ctx, ch.X(30.5) + 120, ch.Y(64700), 34, prog(lt, low + 0.1, low + 0.4)); }
      badge(ctx, 'הדפוס נכשל', prog(lt, low, low + 0.35), '#d61f45', 300, W / 2, 46);
      badge(ctx, 'יוצאים · לא מתווכחים', prog(lt, out, out + 0.35), 'rgba(20,12,40,0.95)', 1270, W / 2, 38);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Parallel'), type: 'click' }, { lt: s.cue('Trend'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, pc = s.cue('Parallel'), tl = s.cue('Trend');
      drawBG(ctx, s.t);
      chFL.layout(40, 360, 1000, 470, { head: 70, left: 92 }).view(4, 30, 61500, 66800); chFL.draw(ctx, { reveal: 25, lastTag: false });
      flagLines(ctx, chFL, prog(lt, pc, pc + 0.8), 27);
      tvToolbar(ctx, 40, 430, 400, lt > pc && lt < tl ? 'trend' : null);
      chTR.layout(40, 870, 1000, 470, { head: 70, left: 92 }).view(0, 32, 62200, 66500); chTR.draw(ctx, { reveal: 29, lastTag: false });
      triLines(ctx, chTR, prog(lt, tl, tl + 0.5), prog(lt, tl + 0.3, tl + 0.8), 30);
      tvToolbar(ctx, 40, 940, 400, lt > tl ? 'trend' : null);
      popT(ctx, 760, 460, prog(lt, pc, pc + 0.3), () => pill(ctx, 'Parallel Channel', 760, 460, { size: 28, color: C.purple }));
      popT(ctx, 760, 970, prog(lt, tl, tl + 0.3), () => pill(ctx, 'Trend Line', 760, 970, { size: 28, color: C.purple }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('תורן'), type: 'pop' }, { lt: s.cue('משולש'), type: 'pop' }, { lt: s.cue('לשבירה'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['תורן ודגל', 'Bull Flag', C.purple, s.cue('תורן'), 'zz'],
        ['משולש עולה', 'קונים לוחצים', '#e0a100', s.cue('משולש'), '△'],
        ['מחכים לשבירה', 'ורק אז נכנסים', '#0fa36b', s.cue('לשבירה'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

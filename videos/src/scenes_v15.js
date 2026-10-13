// Video 15 — Take Profit (previous high, front-run, partials, breakeven runner)
'use strict';
const TPP = [[0, 62500], [10, 66000], [17, 64100]];
const BASEC = genCandles(TPP, { seed: 151 });
const up = [[64100, 64400, 64450, 64000], [64400, 64750, 64800, 64350], [64750, 65050, 65120, 64700], [65050, 65300, 65380, 64980], [65300, 65550, 65600, 65200],
  [65550, 65650, 65760, 65480], [65650, 65780, 65850, 65600], [65780, 65700, 65900, 65640], [65700, 65450, 65760, 65400]];
up.forEach(([o, c, h, l], k) => { BASEC[18 + k] = { o, c, h, l }; });
BASEC[17].c = 64100;
const TA = BASEC.map(q => ({ ...q })), TB = BASEC.map(q => ({ ...q }));
[[65450, 65100, 65500, 65020], [65100, 64700, 65150, 64650], [64700, 64350, 64760, 64280], [64350, 64050, 64400, 63980], [64050, 64150, 64250, 63950]]
  .forEach(([o, c, h, l], k) => { TA[27 + k] = { o, c, h, l }; });
[[65450, 65200, 65480, 65100], [65200, 65050, 65260, 64980], [65050, 65400, 65450, 65000], [65400, 65900, 65950, 65350], [65900, 66300, 66380, 65850],
 [66300, 66700, 66780, 66250], [66700, 66950, 67050, 66650], [66950, 67300, 67380, 66900], [67300, 67500, 67600, 67250], [67500, 67650, 67750, 67420]]
  .forEach(([o, c, h, l], k) => { TB[27 + k] = { o, c, h, l }; });
const chA = new Chart(TA), chB = new Chart(TB);
const ENT = 64200, STP = 63800, PH = 66000, SMART = 65850;

function pnl(ctx, v, x = 860, y = 520) {
  const col = v >= 0 ? '#3df2a6' : '#ff5a72';
  glass(ctx, x - 220, y - 60, 440, 120, 26, { border: col, glowColor: col, glow: 25 });
  text(ctx, 'P&L', x + 180, y, { size: 30, weight: 800, color: C.dim, align: 'right' });
  text(ctx, (v >= 0 ? '+$' : '-$') + fmt(Math.abs(v)), x - 40, y + 2, { size: 54, weight: 900, color: col, fam: MONO });
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('ברווח'), type: 'pop' }, { lt: s.cue('ולקח'), type: 'impact', k: 1.3 }, { lt: s.cue('היציאה'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, prof = s.cue('ברווח'), took = s.cue('ולקח'), ex = s.cue('היציאה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 34], [d, 8, 34]], { p: [63400, 66600] });
      ch.hline(ctx, ENT, 18, 34, { color: '#2962ff', width: 4 });
      const rev = kf(lt, [[0, 19], [prof + 0.2, 26], [took + 0.4, 32], [d, 32]], E.lin)[0];
      const last = ch.draw(ctx, { reveal: rev });
      if (lt < ex - 0.1) pnl(ctx, Math.round((last.c - ENT) / 10) * 10 * 1, W / 2, 1255);
      if (lt < took - 0.1) wipeText(ctx, 'הייתה לך עסקה ברווח?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 70, weight: 900 });
      else wipeText(ctx, 'והמחיר חזר ולקח הכל', W / 2, 300, prog(lt, took - 0.1, took + 0.25), { size: 70, weight: 900, color: '#ff5a72' });
      const pe = prog(lt, ex - 0.1, ex + 0.25);
      if (pe > 0) { scrim(ctx, 0.55 * pe); popT(ctx, W / 2, 800, pe, () => text(ctx, 'הבעיה:', W / 2, 800, { size: 110, weight: 900, color: C.dim })); popT(ctx, W / 2, 960, prog(lt, ex, ex + 0.3), () => text(ctx, 'היציאה', W / 2, 960, { size: 190, weight: 900, color: C.gold, glow: 60 })); }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('טייק'), type: 'impact', k: 1.2 }, { lt: s.cue('לממש'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, tp = s.cue('טייק'), re = s.cue('לממש');
      drawBG(ctx, s.t, { glow: 1.3 });
      titleLock(ctx, lt, 'טייק פרופיט', 'TAKE PROFIT', tp, tp + 0.4, 700);
      wipeText(ctx, 'איפה לממש רווח', W / 2, 1100, prog(lt, re - 0.1, re + 0.3), { size: 72, weight: 900, color: '#3df2a6' });
    },
  },

  prev: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הקודם'), type: 'pop' }, { lt: s.cue('מוכרים'), type: 'pop' }, { lt: s.cue('להיעצר'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chB, ph = s.cue('הקודם'), sel = s.cue('מוכרים'), stop = s.cue('להיעצר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [d, 2, 30]], { p: [62200, 66600] });
      ch.hline(ctx, ENT, 18, 32, { color: '#2962ff', width: 3, alpha: 0.7 });
      ch.draw(ctx, { reveal: lerp(20, 27, prog(lt, 0, stop + 0.2)) });
      ch.hline(ctx, PH, 10, 32, { color: C.gold, width: 5, progress: prog(lt, ph - 0.1, ph + 0.4) });
      popT(ctx, ch.X(13), ch.Y(PH) - 40, prog(lt, ph, ph + 0.3), () => pill(ctx, 'השיא הקודם', ch.X(13), ch.Y(PH) - 40, { size: 30, color: '#b8860b' }));
      if (lt > sel) { const r = rng(8); for (let k = 0; k < 6; k++) { const x = ch.X(17 + r() * 12), y = ch.Y(PH + 80 + r() * 300); popT(ctx, x, y, prog(lt, sel + k * 0.06, sel + k * 0.06 + 0.3), () => pill(ctx, 'SELL', x, y, { size: 20, color: '#d61f45', pad: 10 })); } }
      if (lt > stop) ring(ctx, ch.X(25), ch.Y(65900), 140, prog(lt, stop, stop + 0.6), C.gold);
      badge(ctx, 'יעד ראשון', prog(lt, 0.05, 0.35), C.purple, 300, W / 2, 46);
    },
  },

  liq: {
    trans: 'none',
    events: s => [{ lt: s.cue('מתחת'), type: 'pop' }, { lt: s.cue('עליו'), type: 'pop' }, { lt: s.cue('כולם'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chB, below = s.cue('מתחת'), on = s.cue('עליו'), all = s.cue('כולם');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 2, 30], [0.8, 16, 29], [d, 17, 29]]), ...kf(lt, [[0, 62200, 66600], [0.8, 64800, 66300], [d, 64800, 66300]]));
      ch.draw(ctx, { reveal: 27, highlight: i => i === 25 });
      ch.hline(ctx, PH, 10, 32, { color: '#ff8095', width: 4, dash: [12, 10], progress: prog(lt, on - 0.1, on + 0.3) });
      ch.hline(ctx, SMART, 10, 32, { color: '#3df2a6', width: 5, progress: prog(lt, below - 0.1, below + 0.4) });
      popT(ctx, ch.X(20), ch.Y(SMART) + 40, prog(lt, below, below + 0.3), () => pill(ctx, 'יעד חכם', ch.X(20), ch.Y(SMART) + 40, { size: 30, color: '#0b8f63' }));
      check(ctx, ch.X(22.3), ch.Y(SMART) + 40, 24, prog(lt, all, all + 0.3));
      popT(ctx, ch.X(20), ch.Y(PH) - 40, prog(lt, on, on + 0.3), () => pill(ctx, 'בדיוק על השיא', ch.X(20), ch.Y(PH) - 40, { size: 30, color: '#d61f45' }));
      cross(ctx, ch.X(22.6), ch.Y(PH) - 40, 24, prog(lt, all, all + 0.3));
      badge(ctx, 'יוצאים לפני כולם', prog(lt, all, all + 0.35), '#0fa36b', 300, W / 2, 44);
    },
  },

  partial: {
    trans: 'whip',
    events: s => [{ lt: s.cue('חלקי'), type: 'pop' }, { lt: s.cue('חצי'), type: 'impact', k: 1 }, { lt: s.cue('הסטופ'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chB, pc = s.cue('חלקי'), half = s.cue('חצי'), mv = s.cue('הסטופ');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 680).view(12, 32, 63400, 66400);
      const sp = E.inOut(prog(lt, mv, mv + 0.8)), stopNow = lerp(STP, ENT, sp);
      ch.hline(ctx, ENT, 18, 34, { color: '#2962ff', width: 3 });
      ch.hline(ctx, stopNow, 18, 34, { color: sp > 0.95 ? '#ffffff' : C.down, width: 4, dash: [12, 10] });
      ch.draw(ctx, { reveal: 27 });
      popT(ctx, ch.X(14.5), ch.Y(stopNow) + 34, prog(lt, 0, 0.3), () => pill(ctx, sp > 0.95 ? 'STOP = כניסה' : 'STOP', ch.X(14.5), ch.Y(stopNow) + 34, { size: 26, color: sp > 0.95 ? C.purple : '#d61f45' }));
      if (lt > mv) arrow(ctx, ch.X(30), ch.Y(STP), ch.X(30), ch.Y(ENT) + 14, prog(lt, mv, mv + 0.6), { color: C.purple2, width: 8, head: 30 });
      // position card
      glass(ctx, 80, 1080, 920, 240, 28);
      text(ctx, 'הפוזיציה', 960, 1130, { size: 34, weight: 800, align: 'right', color: C.dim });
      const cl = E.outCubic(prog(lt, half, half + 0.5));
      ctx.save(); rrect(ctx, 120, 1170, 840, 70, 16); ctx.fillStyle = 'rgba(41,98,255,0.75)'; ctx.fill();
      if (cl > 0) { rrect(ctx, 960 - 420 * cl, 1170, 420 * cl, 70, 16); ctx.fillStyle = C.up; ctx.shadowColor = C.up; ctx.shadowBlur = 25; ctx.fill(); } ctx.restore();
      text(ctx, cl > 0.5 ? '50% נסגר ברווח' : '100% פתוח', 940, 1206, { size: 32, weight: 900, align: 'right' });
      if (cl > 0.5) text(ctx, '+$850', 190, 1206, { size: 34, weight: 900, fam: MONO, color: '#3df2a6', align: 'left' });
      text(ctx, cl > 0.5 ? '50% רץ' : '', 140, 1280, { size: 28, weight: 700, align: 'left', color: '#8fb0ff' });
      badge(ctx, 'מימוש חלקי', prog(lt, pc, pc + 0.35), '#b8860b', 300, W / 2, 46);
    },
  },

  runner: {
    trans: 'none',
    events: s => [{ lt: s.cue('בחינם'), type: 'pop' }, { lt: s.cue('ממשיך'), type: 'whoosh' }, { lt: s.cue('חוזר'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, free = s.cue('בחינם'), go = s.cue('ממשיך'), back = s.cue('חוזר');
      drawBG(ctx, s.t);
      chB.layout(40, 370, 1000, 970).view(14, 38, 63400, 68000);
      chB.hline(ctx, ENT, 18, 40, { color: '#ffffff', width: 4, dash: [12, 10] });
      chB.draw(ctx, { reveal: lt > go ? lerp(27, 37, prog(lt, go, back)) : 27 });
      if (lt > back) { chA.layout(40, 370, 1000, 970).view(14, 38, 63400, 68000); ctx.save(); ctx.globalAlpha = 0.55; chA.clip(ctx, () => { for (let i = 27; i < Math.min(32, 27 + 5 * prog(lt, back, back + 0.8)); i++) chA.candle(ctx, i, TA[i], 0.9); }); ctx.restore(); }
      popT(ctx, chB.X(33), chB.Y(67900), prog(lt, go, go + 0.35), () => pill(ctx, 'ממשיך = מרוויחים עוד', chB.X(31), chB.Y(67900), { size: 30, color: '#0b8f63' }));
      popT(ctx, chB.X(31), chB.Y(63700), prog(lt, back, back + 0.35), () => pill(ctx, 'חוזר = יציאה בלי הפסד', chB.X(31), chB.Y(63700), { size: 30, color: C.purple }));
      badge(ctx, 'החצי השני רץ בחינם', prog(lt, free, free + 0.35), '#0fa36b', 300, W / 2, 44);
    },
  },

  mistake: {
    trans: 'whip',
    events: s => [{ lt: s.cue('רחוק'), type: 'whoosh' }, { lt: s.cue('החמדנות'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, far = s.cue('רחוק'), greed = s.cue('החמדנות');
      drawBG(ctx, s.t, { hue: lt > greed ? 40 : 0 });
      stdChart(ch, lt, [[0, 14, 34], [d, 14, 34]], { p: [63400, 67400] });
      const steps = Math.floor(clamp((lt - far) / 0.35, 0, 4)), tgt = SMART + steps * 300;
      ch.hline(ctx, ENT, 18, 36, { color: '#2962ff', width: 3 });
      ch.hline(ctx, tgt, 18, 36, { color: C.gold, width: 4 });
      popT(ctx, ch.X(21), ch.Y(tgt) - 36, 1, () => pill(ctx, steps ? 'עוד קצת…' : 'יעד', ch.X(21), ch.Y(tgt) - 36, { size: 28, color: '#b8860b' }));
      ch.draw(ctx, { reveal: kf(lt, [[0, 25], [far, 27], [greed, 32], [d, 32]], E.lin)[0] });
      cross(ctx, ch.X(31), ch.Y(64600), 34, prog(lt, greed, greed + 0.35));
      badge(ctx, 'החמדנות מוחקת רווחים', prog(lt, greed, greed + 0.35), '#d61f45', 300, W / 2, 42);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Shift'), type: 'key' }, { lt: s.cue('ולוחצים'), type: 'click' }, { lt: s.cue('ומודדים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chB, sh = s.cue('Shift'), clk = s.cue('ולוחצים'), ms = s.cue('ומודדים');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(10, 36, 63400, 67600);
      const dp = E.inOut(prog(lt, clk, ms + 0.4)), x0 = ch.X(18), y0 = ch.Y(ENT), x1 = lerp(x0, ch.X(26), dp), y1 = lerp(y0, ch.Y(SMART), dp);
      ch.draw(ctx, { reveal: 27 });
      if (dp > 0) {
        ctx.save(); ctx.fillStyle = 'rgba(41,98,255,0.22)'; ctx.fillRect(x0, y1, x1 - x0, y0 - y1); ctx.strokeStyle = '#2962ff'; ctx.lineWidth = 3; ctx.strokeRect(x0, y1, x1 - x0, y0 - y1); ctx.restore();
        arrow(ctx, (x0 + x1) / 2, y0, (x0 + x1) / 2, y1, 1, { color: '#8fb0ff', width: 4, head: 20, glow: 0 });
        const v = Math.round((lerp(ENT, SMART, dp) - ENT) / 10) * 10, pct = (v / ENT * 100).toFixed(2);
        ctx.save(); rrect(ctx, x1 - 150, y1 - 110, 300, 90, 12); ctx.fillStyle = '#2962ff'; ctx.fill(); ctx.restore();
        text(ctx, `+${fmt(v)} (${pct}%)`, x1, y1 - 80, { size: 28, weight: 800, fam: MONO });
        text(ctx, `${Math.round(8 * dp)} bars`, x1, y1 - 44, { size: 24, weight: 600, fam: MONO, color: '#dbe4ff' });
      }
      cursor(ctx, dp > 0 ? x1 : 700, dp > 0 ? y1 : 1000, Math.exp(-Math.abs(lt - clk) * 14), 1.15);
      const pk = prog(lt, sh - 0.05, sh + 0.3) * (1 - prog(lt, clk + 0.2, clk + 0.5));
      if (pk > 0) { scrim(ctx, 0.45 * pk); keycap(ctx, 'Shift', W / 2, 860, pk, { w: 300, size: 56, pressed: lt > sh ? 1 : 0 }); }
      popT(ctx, W / 2, 300, prog(lt, ms, ms + 0.35), () => pill(ctx, 'Shift + קליק = מדידה', W / 2, 300, { size: 42, color: '#2962ff' }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('יעד'), type: 'pop' }, { lt: s.cue('מימוש'), type: 'pop' }, { lt: s.cue('וסטופ'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['יעד בשיא הקודם', 'קצת מתחת אליו', C.purple, s.cue('יעד'), 1],
        ['מימוש חלקי', 'חצי ביעד הראשון', '#e0a100', s.cue('מימוש'), 2],
        ['סטופ לכניסה', 'והשאר רץ בחינם', '#0fa36b', s.cue('וסטופ'), 3],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

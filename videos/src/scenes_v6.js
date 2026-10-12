// Video 6 — פריצת שווא (Fakeout) vs real breakout + retest
'use strict';
const FKP = [[0, 64900], [8, 65940], [13, 65000], [18, 65960], [22, 65150], [24, 65700]];
const FK = genCandles(FKP, { seed: 61, noise: 0.2 });
[[65700, 65750, 66450, 65650], [65750, 65300, 65800, 65250], [65300, 65050, 65380, 64980], [65050, 65380, 65420, 65000],
 [65380, 65600, 65660, 65330], [65600, 65760, 65820, 65540], [65760, 65900, 65950, 65700], [65900, 66500, 66560, 65870],
 [66500, 66650, 66720, 66430], [66650, 66150, 66680, 66020], [66150, 66300, 66340, 66080], [66300, 66750, 66800, 66260],
 [66750, 67150, 67220, 66700], [67150, 67400, 67480, 67080], [67400, 67700, 67780, 67350]]
  .forEach(([o, c, h, l], k) => { FK[25 + k] = { o, c, h, l }; });
FK[24].c = 65700;
const VOL = FK.map((_, i) => 45 + hash(i * 3.1) * 45);
VOL[25] = 38; VOL[26] = 70; VOL[32] = 175; VOL[33] = 120; VOL[34] = 60; VOL[35] = 75; VOL[36] = 110; VOL[37] = 115;
const chFK = new Chart(FK);
const RES = 66000;
const P6 = [64500, 67300];

function slPills(ctx, ch, gone, p01) {
  const r = rng(17);
  for (let k = 0; k < 9; k++) {
    const i = 9 + r() * 15, y = ch.Y(RES + 120 + r() * 260), pk = clamp((p01 - k * 0.06) * 3); if (pk <= 0) continue;
    const buy = k % 3 === 0;
    ctx.save(); ctx.globalAlpha *= 1 - gone;
    popT(ctx, ch.X(i), y - gone * 60, pk, () => pill(ctx, buy ? 'BUY' : 'SL', ch.X(i), y - gone * 60, { size: 20, color: buy ? '#2962ff' : '#d61f45', glow: 12, pad: 12 }));
    ctx.restore();
  }
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('קנית'), type: 'click' }, { lt: s.cue('חזר'), type: 'impact', k: 1.2 }, { lt: s.cue('שווא'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFK, buy = s.cue('קנית'), back = s.cue('חזר'), fk = s.cue('פריצת');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 28], [d, 8, 29]], { p: P6 });
      const rev = kf(lt, [[0, 24.6], [buy, 25.3], [back - 0.1, 25.9], [back + 0.4, 27], [d, 27.5]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      ch.hline(ctx, RES, 0, 32, { color: '#fff', width: 3, dash: [12, 10] });
      const bx = ch.X(25), by = ch.Y(66250);
      popT(ctx, bx - 120, by, prog(lt, buy, buy + 0.3), () => pill(ctx, 'BUY', bx - 120, by, { size: 34, color: '#2962ff' }));
      cross(ctx, bx - 120, by + 70, 30, prog(lt, back, back + 0.3));
      if (lt > back) { const f = Math.max(0, 1 - (lt - back) / 0.3); if (f > 0) { ctx.fillStyle = `rgba(255,40,70,${0.25 * f})`; ctx.fillRect(0, 0, W, H); } }
      if (lt < fk - 0.1) wipeText(ctx, lt < back ? 'קנית בפריצה?' : 'והמחיר חזר למטה', W / 2, 300, prog(lt, lt < back ? 0.05 : back, (lt < back ? 0.05 : back) + 0.35), { size: 76, weight: 900, color: lt < back ? '#fff' : '#ff5a72' });
      const pf = prog(lt, fk - 0.1, fk + 0.25);
      if (pf > 0) {
        scrim(ctx, 0.6 * pf);
        popT(ctx, W / 2, 860, pf, () => text(ctx, 'פריצת שווא', W / 2, 860, { size: 170, weight: 900, color: '#ff5a72', glow: 60, glowColor: '#ff1744' }));
        text(ctx, 'FAKEOUT', W / 2, 1030, { size: 70, weight: 900, color: C.neon, spacing: lerp(50, 16, E.outExpo(pf)), alpha: pf });
      }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('למה'), type: 'pop' }, { lt: s.cue('ואיך'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFK;
      drawBG(ctx, s.t, { glow: 1.3 });
      stdChart(ch, lt, [[0, 6, 30], [d, 8, 30]], { p: P6 });
      ctx.save(); ctx.globalAlpha = 0.25; ch.draw(ctx, { reveal: 28, header: false }); ctx.restore();
      scrim(ctx, 0.35);
      headlines(ctx, lt, [
        { t: 'בוא נבין', at: 0, y: 700, size: 90, color: C.dim },
        { t: 'למה זה קורה', at: s.cue('למה'), y: 840, size: 130, color: '#fff', kind: 'pop' },
        { t: 'ואיך לא ליפול בזה שוב', at: s.cue('ואיך'), y: 1010, size: 80, color: C.gold },
      ]);
    },
  },

  why: {
    trans: 'whip',
    events: s => [{ lt: s.cue('סטופים'), type: 'pop' }, { lt: s.cue('חודר'), type: 'impact', k: 1.2 }, { lt: s.cue('ומתהפך'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFK, st = s.cue('סטופים'), pen = s.cue('חודר'), col = s.cue('אוסף'), rev2 = s.cue('ומתהפך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 30], [d, 10, 30]], { p: P6 });
      const rev = kf(lt, [[0, 24.2], [pen, 25.3], [rev2, 26], [d, 27]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      ch.hline(ctx, RES, 0, 32, { color: '#ff8095', width: 4 });
      popT(ctx, ch.X(12), ch.Y(RES) + 40, prog(lt, 0, 0.3), () => pill(ctx, 'התנגדות', ch.X(12), ch.Y(RES) + 40, { size: 30, color: '#d61f45' }));
      slPills(ctx, ch, prog(lt, col, col + 0.5), prog(lt, st, st + 0.8));
      if (lt > pen) { ring(ctx, ch.X(25), ch.Y(66400), 200, prog(lt, pen, pen + 0.6), C.gold); burst(ctx, ch.X(25), ch.Y(66400), prog(lt, col, col + 0.9), C.gold, 26, 4, 260); }
      arrow(ctx, ch.X(25) + 70, ch.Y(66200), ch.X(27) + 40, ch.Y(65200), prog(lt, rev2, rev2 + 0.5), { color: C.down, width: 12, head: 44 });
    },
  },

  signs: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('פתיל'), type: 'pop' }, { lt: s.cue('סגירה'), type: 'pop' }, { lt: s.cue('ונפח'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFK, a = s.cue('פתיל'), b = s.cue('סגירה'), c = s.cue('ונפח');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 16, 30], [d, 17, 30]], { p: [64300, 67500] });
      ch.draw(ctx, { reveal: 26, highlight: i => i === 25 });
      volumeBars(ctx, ch, VOL, 26, { h: 170, highlight: i => i === 25 && lt > c });
      ch.hline(ctx, RES, 0, 32, { color: '#ff8095', width: 4 });
      const x = ch.X(25);
      ring(ctx, x, ch.Y(66350), 120, prog(lt, a, a + 0.6), C.gold);
      if (lt > b) { ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(x - 80, ch.Y(65750)); ctx.lineTo(x + 80, ch.Y(65750)); ctx.stroke(); ctx.restore(); }
      if (lt > c) ring(ctx, x, ch.p.y + ch.p.h - 30, 90, prog(lt, c, c + 0.6), C.gold);
      // checklist card
      const rows = [['פתיל ארוך מעל הרמה', a], ['סגירה בחזרה מתחת', b], ['נפח מסחר חלש', c]];
      glass(ctx, 120, 500, 840, 280, 26, { glow: 25 });
      text(ctx, '3 סימנים לפריצת שווא', 900, 548, { size: 40, weight: 900, color: C.gold, align: 'right' });
      rows.forEach(([t, t0], k) => {
        const p = prog(lt, t0, t0 + 0.3), y = 620 + k * 60;
        wipeText(ctx, t, 830, y, p, { size: 38, weight: 800, align: 'right' });
        popT(ctx, 880, y, p, () => { ctx.save(); ctx.beginPath(); ctx.arc(880, y, 22, 0, Math.PI * 2); ctx.fillStyle = '#d61f45'; ctx.fill(); ctx.restore(); text(ctx, String(k + 1), 880, y + 2, { size: 28, weight: 900 }); });
      });
    },
  },

  real: {
    trans: 'whip',
    events: s => [{ lt: s.cue('גוף'), type: 'impact', k: 1.3 }, { lt: s.cue('גבוה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFK, bd = s.cue('גוף'), hv = s.cue('גבוה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 18, 34], [d, 19, 35]], { p: [64300, 67500] });
      const rev = kf(lt, [[0, 28], [bd + 0.4, 33], [d, 33.4]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === 32 && lt > bd });
      volumeBars(ctx, ch, VOL, rev, { h: 170, highlight: i => i === 32 && lt > hv });
      ch.hline(ctx, RES, 0, 40, { color: lt > bd ? C.up : '#ff8095', width: 4 });
      if (lt > bd) { ring(ctx, ch.X(32), ch.Y(RES), 220, prog(lt, bd, bd + 0.6), C.up); burst(ctx, ch.X(32), ch.Y(RES), prog(lt, bd, bd + 0.9), '#3df2a6', 24, 7, 240); }
      check(ctx, ch.X(32) - 110, ch.Y(66300), 34, prog(lt, bd + 0.2, bd + 0.5));
      if (lt > hv) ring(ctx, ch.X(32), ch.p.y + ch.p.h - 80, 90, prog(lt, hv, hv + 0.6), C.up);
      badge(ctx, 'פריצה אמיתית', prog(lt, bd, bd + 0.35), '#0fa36b', 300, W / 2, 46);
      badge(ctx, 'גוף מלא + נפח גבוה', prog(lt, hv, hv + 0.35), 'rgba(20,12,40,0.95)', 560, W / 2, 34);
    },
  },

  retest: {
    trans: 'none',
    events: s => [{ lt: s.cue('לריטסט'), type: 'pop' }, { lt: s.cue('מחזיק'), type: 'impact', k: 1 }, { lt: s.cue('נכנסים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFK, no = s.cue('לקנות'), rt = s.cue('לריטסט'), bk = s.cue('חוזר'), hold = s.cue('מחזיק'), en = s.cue('נכנסים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 19, 35], [bk, 22, 38], [d, 24, 41]], { p: [64800, 68000] });
      const rev = kf(lt, [[0, 33.4], [bk, 34], [hold + 0.1, 35], [en, 36], [d, 40]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === 34 && lt > hold });
      volumeBars(ctx, ch, VOL, rev, { h: 150, alpha: 0.4 });
      ch.hline(ctx, RES, 0, 44, { color: C.up, width: 4 });
      cross(ctx, ch.X(32) - 100, ch.Y(66500), 30, prog(lt, no, no + 0.3) * (1 - prog(lt, rt, rt + 0.2)));
      if (lt > hold) ring(ctx, ch.X(34), ch.Y(66020), 150, prog(lt, hold, hold + 0.6), C.up);
      const pe = prog(lt, en, en + 0.35);
      popT(ctx, ch.X(35) + 130, ch.Y(66200), pe, () => pill(ctx, 'ENTRY', ch.X(35) + 130, ch.Y(66200), { size: 34, color: '#2962ff' }));
      check(ctx, ch.X(35) + 130, ch.Y(66200) + 66, 28, pe);
      if (lt < rt) badge(ctx, 'לא קונים בפריצה עצמה', prog(lt, no, no + 0.35), '#d61f45', 300, W / 2, 40);
      else badge(ctx, 'מחכים לריטסט', prog(lt, rt, rt + 0.35), C.purple, 300, W / 2, 46);
    },
  },

  reverse: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('מתחת'), type: 'pop' }, { lt: s.cue('ההזדמנות'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFK, un = s.cue('מתחת'), op = s.cue('ההזדמנות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 31], [d, 15, 31]], { p: P6 });
      ch.zone(ctx, 65750, 65050, 25.5, 28, { color: C.up, alpha: 0.2, progress: prog(lt, op, op + 0.5) });
      ch.draw(ctx, { reveal: 28, highlight: i => i === 25 || i === 26 });
      ch.hline(ctx, RES, 0, 32, { color: '#ff8095', width: 4 });
      ring(ctx, ch.X(26), ch.Y(65750), 130, prog(lt, un, un + 0.6), C.gold);
      const p = prog(lt, op, op + 0.35);
      popT(ctx, ch.X(26) + 150, ch.Y(65750), p, () => pill(ctx, 'SELL', ch.X(26) + 150, ch.Y(65750), { size: 34, color: '#0b8f63' }));
      check(ctx, ch.X(26) + 150, ch.Y(65750) + 66, 28, p);
      arrow(ctx, ch.X(26) + 40, ch.Y(65650), ch.X(27.6), ch.Y(65100), p, { color: C.down, width: 10, head: 38 });
      badge(ctx, 'הזדמנות לכיוון ההפוך', p, '#b8860b', 300, W / 2, 42);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...Array.from({ length: 6 }, (_, k) => ({ lt: s.cue('האינדיקטור') + 0.1 + k * 0.06, type: 'tick' })), { lt: s.cue('ותבדוק') - 0.15, type: 'click' }, { lt: s.cue('שעולה'), type: 'pop' }, { lt: s.cue('שנעלם'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFK, op = s.cue('האינדיקטור'), pk = s.cue('ותבדוק') - 0.15, up = s.cue('שעולה'), gone = s.cue('שנעלם');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(10, 40, 64300, 68000);
      ch.draw(ctx, { reveal: 40 });
      const vp = prog(lt, pk + 0.2, pk + 0.9);
      if (vp > 0) volumeBars(ctx, ch, VOL.map(v => v * E.outCubic(vp)), 40, { h: 190, alpha: 0.5, highlight: i => (i === 32 && lt > up) || (i === 25 && lt > gone) });
      ch.hline(ctx, RES, 0, 44, { color: '#fff', width: 3, dash: [12, 10] });
      if (lt > up) { popT(ctx, ch.X(32), ch.p.y + ch.p.h - 240, prog(lt, up, up + 0.3), () => pill(ctx, 'נפח עולה', ch.X(32), ch.p.y + ch.p.h - 240, { size: 30, color: '#0b8f63' })); }
      if (lt > gone) { popT(ctx, ch.X(25), ch.p.y + ch.p.h - 150, prog(lt, gone, gone + 0.3), () => pill(ctx, 'נפח נעלם', ch.X(25), ch.p.y + ch.p.h - 150, { size: 30, color: '#d61f45' })); }
      indicatorDialog(ctx, lt, 'Volume', [['Volume', 'Built-in'], ['Volume Profile Visible Range', 'Built-in'], ['Volume Oscillator', 'Built-in']], op, pk);
      badge(ctx, 'Volume', prog(lt, pk + 0.2, pk + 0.5), '#2962ff', 300, W / 2, 46);
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('פתיל'), type: 'pop' }, { lt: s.cue('גוף'), type: 'pop' }, { lt: s.cue('לריטסט'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['פתיל וסגירה מתחת', 'פריצת שווא', '#d61f45', s.cue('פתיל'), 'cross'],
        ['גוף מלא ונפח', 'פריצה אמיתית', '#0fa36b', s.cue('גוף'), 'check'],
        ['ובכל מקרה', 'מחכים לריטסט', C.purple, s.cue('לריטסט'), 'zz'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

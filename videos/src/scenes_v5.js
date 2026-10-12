// Video 5 — תמיכה והתנגדות נכונות (zones, touches, flip, retest)
'use strict';
const SRP = [[0, 63200], [6, 65240], [11, 63900], [17, 65250], [22, 64100], [28, 65230], [33, 64300]];
const SR = genCandles(SRP, { seed: 37, noise: 0.2 });
[[64300, 64650, 64720, 64250], [64650, 64950, 65020, 64600], [64950, 65150, 65230, 64900], [65150, 65750, 65800, 65100],
 [65750, 66000, 66080, 65700], [66000, 65800, 66050, 65740], [65800, 65450, 65850, 65400], [65450, 65330, 65500, 65120],
 [65330, 65700, 65740, 65200], [65700, 66150, 66200, 65650], [66150, 66500, 66580, 66100], [66500, 66800, 66900, 66420]]
  .forEach(([o, c, h, l], k) => { SR[34 + k] = { o, c, h, l }; });
SR[33].c = 64300;
// keep the three resistance touches as wicks into the zone with bodies below it
[6, 17, 28].forEach(i => { const q = SR[i]; q.o = Math.min(q.o, 64990); q.c = Math.min(q.c, 64960); });
for (let i = 1; i < 34; i++) SR[i].o = SR[i - 1].c;
SR.forEach(q => { q.h = Math.max(q.h, q.o, q.c); q.l = Math.min(q.l, q.o, q.c); });
const chSR = new Chart(SR);
const Z0 = 65000, Z1 = 65250, TOUCH = [6, 17, 28];
const NOISE = genCandles([[0, 64000], [3, 64300], [5, 63900], [8, 64400], [10, 63800], [13, 64350], [15, 63950], [18, 64250], [21, 63850], [24, 64300], [27, 64000]], { seed: 51, noise: 0.9 });
const chNZ = new Chart(NOISE, { tf: '1m' }), chHT = new Chart(SR, { tf: '1D' });

function flipLabel(ctx, x, y, a, b, p, colA, colB) { // card flip from label a to label b
  const sy = Math.abs(Math.cos(p * Math.PI)), first = p < 0.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(1, Math.max(0.02, sy)); ctx.translate(-x, -y);
  pill(ctx, first ? a : b, x, y, { size: 34, color: first ? colA : colB }); ctx.restore();
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('בקו'), type: 'click' }, ...TOUCH.map((_, k) => ({ lt: s.cue('שובר') + k * 0.18, type: 'pop' })), { lt: s.cue('כי'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSR, ln = s.cue('בקו'), br = s.cue('שובר'), why = s.cue('כי');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 34], [d, 2, 34]], { p: [63300, 65700] });
      ch.draw(ctx, { reveal: 34 });
      ch.hline(ctx, 65100, 0, 40, { color: '#fff', width: 2.5, progress: prog(lt, ln - 0.1, ln + 0.4) });
      TOUCH.forEach((i, k) => { const t0 = br + k * 0.18; ring(ctx, ch.X(i), ch.Y(SR[i].h), 110, prog(lt, t0, t0 + 0.6), C.down); cross(ctx, ch.X(i), ch.Y(SR[i].h) - 60, 26, prog(lt, t0, t0 + 0.3)); });
      if (lt < why - 0.1) wipeText(ctx, 'מסמן תמיכה בקו אחד?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 72, weight: 900 });
      const pw = prog(lt, why - 0.1, why + 0.25);
      if (pw > 0) {
        scrim(ctx, 0.6 * pw);
        popT(ctx, W / 2, 800, pw, () => text(ctx, 'תמיכה', W / 2, 800, { size: 170, weight: 900, glow: 40, glowColor: C.purple }));
        popT(ctx, W / 2, 990, prog(lt, s.cue('קו', 1) - 0.1, s.cue('קו', 1) + 0.3), () => text(ctx, 'היא לא קו', W / 2, 990, { size: 150, weight: 900, color: '#ff5a72', glow: 50, glowColor: '#ff1744' }));
      }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('אזורים'), type: 'impact', k: 1.3 }, { lt: s.cue('ככה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSR, z = s.cue('אזורים');
      drawBG(ctx, s.t, { glow: 1.3 });
      stdChart(ch, lt, [[0, 0, 34], [d, 3, 34]], { p: [63300, 65700] });
      ctx.save(); ctx.globalAlpha = 0.25; ch.zone(ctx, Z0, Z1, 0, 40, { color: C.purple, alpha: 0.5 }); ch.draw(ctx, { reveal: 34, header: false }); ctx.restore();
      scrim(ctx, 0.35);
      headlines(ctx, lt, [{ t: 'תמיכה והתנגדות', at: 0, y: 720, size: 110 }]);
      popT(ctx, W / 2, 900, prog(lt, z - 0.05, z + 0.3), () => text(ctx, 'הן אזורים', W / 2, 900, { size: 170, weight: 900, color: C.gold, glow: 50 }));
      ring(ctx, W / 2, 900, 650, prog(lt, z, z + 0.7), C.gold);
      wipeText(ctx, 'ככה מסמנים אותן נכון', W / 2, 1090, prog(lt, s.cue('ככה'), s.cue('ככה') + 0.35), { size: 64, weight: 800, color: C.purple2 });
    },
  },

  zone: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נדחה'), type: 'pop' }, { lt: s.cue('מלבן'), type: 'impact', k: 1 }, { lt: s.cue('מהפתילים'), type: 'pop' }, { lt: s.cue('הגופים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSR, rj = s.cue('נדחה'), thin = s.cue('קו'), rect = s.cue('מלבן'), wk = s.cue('מהפתילים'), bd = s.cue('הגופים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 34], [d, 2, 34]], { p: [63300, 65700] });
      const m = E.outCubic(prog(lt, rect - 0.1, rect + 0.5));
      if (m > 0) ch.zone(ctx, lerp(65100, Z1, m), lerp(65100, Z0, m), 0, 40, { color: C.purple, alpha: 0.28 });
      ch.draw(ctx, { reveal: 34, highlight: i => TOUCH.includes(i) && lt > rj });
      TOUCH.forEach((i, k) => ring(ctx, ch.X(i), ch.Y(SR[i].h), 100, prog(lt, rj + k * 0.12, rj + k * 0.12 + 0.6)));
      if (m <= 0) ch.hline(ctx, 65100, 0, 40, { color: '#fff', width: 2, progress: prog(lt, thin - 0.1, thin + 0.3) });
      else ch.zone(ctx, lerp(65100, Z1, m), lerp(65100, Z0, m), 0, 40, { color: C.purple, alpha: 0.05 });
      cross(ctx, ch.X(31), ch.Y(65100) - 50, 26, prog(lt, thin, thin + 0.3) * (1 - m));
      ch.hline(ctx, Z1, 0, 40, { color: C.purple2, width: 4, progress: prog(lt, wk, wk + 0.4) });
      ch.hline(ctx, Z0, 0, 40, { color: C.teal, width: 4, progress: prog(lt, bd, bd + 0.4) });
      popT(ctx, ch.X(9), ch.Y(Z1) - 40, prog(lt, wk, wk + 0.35), () => pill(ctx, 'הפתילים', ch.X(9), ch.Y(Z1) - 40, { size: 30, color: C.purple }));
      popT(ctx, ch.X(13), ch.Y(Z0) + 44, prog(lt, bd, bd + 0.35), () => pill(ctx, 'הגופים', ch.X(13), ch.Y(Z0) + 44, { size: 30, color: '#14a88f' }));
      badge(ctx, 'מלבן, לא קו', prog(lt, rect, rect + 0.35), C.purple, 300, W / 2, 46);
    },
  },

  touches: {
    trans: 'none',
    events: s => [{ lt: s.cue('שתיים'), type: 'pop' }, { lt: s.cue('שלוש'), type: 'impact', k: 1 }, { lt: s.cue('מחלישה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSR, two = s.cue('שתיים'), three = s.cue('שלוש'), weak = s.cue('מחלישה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 34], [d, 3, 35]], { p: [63300, 65700] });
      const wa = lt > weak ? 0.12 + 0.12 * Math.abs(Math.sin(lt * 9)) : 0.28;
      ch.zone(ctx, Z1, Z0, 0, 40, { color: lt > three && lt < weak ? C.up : C.purple, alpha: wa });
      ch.draw(ctx, { reveal: 34 });
      ch.zone(ctx, Z1, Z0, 0, 40, { color: C.purple, alpha: 0.04 });
      TOUCH.forEach((i, k) => {
        const t0 = k < 2 ? two + k * 0.2 : three, x = ch.X(i), y = ch.Y(SR[i].h) - 70;
        popT(ctx, x, y, prog(lt, t0, t0 + 0.3), () => {
          ctx.save(); ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fillStyle = k === 2 ? '#0fa36b' : C.purple; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 25; ctx.fill(); ctx.restore();
          text(ctx, String(k + 1), x, y + 2, { size: 42, weight: 900 });
        });
      });
      if (lt < three) badge(ctx, '2 נגיעות = התחלה', prog(lt, two, two + 0.35), C.purple, 300, W / 2, 42);
      else badge(ctx, '3 נגיעות = אזור חזק', prog(lt, three, three + 0.35), '#0fa36b', 300, W / 2, 42);
      badge(ctx, 'אבל כל נגיעה מחלישה', prog(lt, weak, weak + 0.35), '#d61f45', 1270, W / 2, 38);
    },
  },

  flip: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נשברת'), type: 'impact', k: 1.4 }, { lt: s.cue('לתמיכה'), type: 'whoosh' }, { lt: s.cue('Flip'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSR, br = s.cue('נשברת'), sup = s.cue('לתמיכה'), fl = s.cue('Flip');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 40], [d, 14, 41]], { p: [63500, 66400] });
      const rev = kf(lt, [[0, 34], [br, 38], [d, 39]], E.lin)[0];
      const fp = prog(lt, sup - 0.1, sup + 0.4), col = fp > 0.5 ? C.up : C.down;
      ch.zone(ctx, Z1, Z0, 0, 46, { color: col, alpha: 0.26 });
      ch.draw(ctx, { reveal: rev });
      ch.zone(ctx, Z1, Z0, 0, 46, { color: col, alpha: 0.04 });
      if (lt > br - 0.1) { ring(ctx, ch.X(37), ch.Y(Z1), 240, prog(lt, br, br + 0.6)); burst(ctx, ch.X(37), ch.Y(Z1), prog(lt, br, br + 0.9), C.purple2, 24, 2, 240); }
      flipLabel(ctx, ch.X(22), ch.Y(Z1) - 46, 'התנגדות', 'תמיכה', fp, '#d61f45', '#0b8f63');
      popT(ctx, W / 2, 300, prog(lt, fl, fl + 0.35), () => pill(ctx, 'FLIP', W / 2, 300, { size: 64, color: C.purple, glow: 50 }));
    },
  },

  retest: {
    trans: 'none',
    events: s => [{ lt: s.cue('נדחה'), type: 'impact', k: 1 }, { lt: s.cue('הכניסה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSR, ck = s.cue('לבדוק'), rj = s.cue('נדחה'), up = s.cue('לעלות'), en = s.cue('הכניסה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 41], [rj, 26, 44], [d, 28, 47]], { p: [64200, 67100] });
      const rev = kf(lt, [[0, 39], [rj + 0.1, 42], [up + 0.1, 43.5], [d, 46]], E.lin)[0];
      ch.zone(ctx, Z1, Z0, 0, 50, { color: C.up, alpha: 0.26 });
      ch.draw(ctx, { reveal: rev, highlight: i => i === 41 && lt > rj });
      ch.zone(ctx, Z1, Z0, 0, 50, { color: C.up, alpha: 0.04, label: 'תמיכה' });
      arrow(ctx, ch.X(38.5), ch.Y(66100), ch.X(40.8), ch.Y(65450), prog(lt, ck, ck + 0.5), { color: C.purple2, width: 10, head: 38 });
      if (lt > rj) { ring(ctx, ch.X(41), ch.Y(SR[41].l), 160, prog(lt, rj, rj + 0.6), C.up); }
      arrow(ctx, ch.X(42), ch.Y(65500), ch.X(45.5), ch.Y(66700), prog(lt, up, up + 0.5), { color: C.up, width: 12, head: 46 });
      const pe = prog(lt, en, en + 0.35);
      popT(ctx, ch.X(42) - 150, ch.Y(65600), pe, () => pill(ctx, 'ENTRY', ch.X(42) - 150, ch.Y(65600), { size: 34, color: '#2962ff' }));
      check(ctx, ch.X(42) - 150, ch.Y(65600) + 70, 30, pe);
      badge(ctx, 'הכניסה של המקצוענים', pe, '#0fa36b', 300, W / 2, 42);
    },
  },

  tip: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('גבוה'), type: 'pop' }, { lt: s.cue('רעש'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, hi = s.cue('גבוה'), nz = s.cue('רעש');
      drawBG(ctx, s.t);
      chHT.layout(40, 340, 1000, 520, { head: 70 }).view(0, 46, 63300, 67000);
      chHT.zone(ctx, Z1, Z0, 0, 50, { color: C.purple, alpha: 0.25, progress: prog(lt, hi, hi + 0.4) });
      chHT.draw(ctx, { reveal: 46, lastTag: false, tfs: ['1D', '4H'] });
      check(ctx, 900, 470, 34, prog(lt, hi + 0.1, hi + 0.4));
      chNZ.layout(40, 900, 1000, 440, { head: 70 }).view(0, 28);
      chNZ.draw(ctx, { reveal: lerp(10, 28, prog(lt, 0, d)), lastTag: false, tfs: ['1m'] });
      const r = rng(9);
      for (let k = 0; k < 9; k++) chNZ.hline(ctx, 63800 + r() * 600, 0, 30, { color: r() > 0.5 ? C.down : C.up, width: 2, alpha: 0.7, progress: prog(lt, nz - 0.6 + k * 0.05, nz + k * 0.05) });
      cross(ctx, 900, 1020, 34, prog(lt, nz, nz + 0.3));
      popT(ctx, W / 2, 1270, prog(lt, nz, nz + 0.35), () => pill(ctx, 'גרף של דקה = רעש', W / 2, 1270, { size: 38, color: '#d61f45' }));
      badge(ctx, 'יומי / 4 שעות', prog(lt, hi, hi + 0.35), '#0fa36b', 300, W / 2, 40);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Rectangle') - 0.2, type: 'click' }, { lt: s.cue('ומותחים'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSR, tool = s.cue('Rectangle') - 0.2, dr = s.cue('ומותחים'), end = s.cue('הגופים') + 0.3;
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(0, 34, 63300, 65700);
      const dz = E.inOut(prog(lt, dr, end)), xi = lerp(1, 33, dz), pz = lerp(Z1, Z0, dz);
      if (dz > 0) ch.zone(ctx, Z1, pz, 1, xi, { color: C.purple, alpha: 0.28 });
      ch.draw(ctx, { reveal: 34, tfs: ['1H', '4H', '1D'] });
      if (dz > 0) ch.zone(ctx, Z1, pz, 1, xi, { color: C.purple, alpha: 0.04, label: dz > 0.9 ? 'אזור התנגדות' : null });
      const at = tvToolbar(ctx, 40, 466, 870, lt > tool ? 'rect' : null), [rx, ry] = at('rect');
      const c = lt < dr ? kf(lt, [[0, 700, 1100], [tool - 0.3, rx, ry], [tool + 0.2, rx, ry], [dr, ch.X(1), ch.Y(Z1)]]) : [ch.X(xi), ch.Y(pz)];
      cursor(ctx, c[0], c[1], Math.max(Math.exp(-Math.abs(lt - tool) * 14), lt > dr && lt < end ? 0.6 : 0), 1.15);
      ring(ctx, rx, ry, 70, prog(lt, tool, tool + 0.5));
      popT(ctx, W / 2, 300, prog(lt, tool, tool + 0.35), () => pill(ctx, 'Rectangle', W / 2, 300, { size: 46, color: C.purple }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('אזור'), type: 'pop' }, { lt: s.cue('שלוש'), type: 'pop' }, { lt: s.cue('שנשברה'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['אזור ולא קו', 'מהפתילים ועד הגופים', C.purple, s.cue('אזור'), 'zz'],
        ['שלוש נגיעות', 'אזור חזק', '#e0a100', s.cue('שלוש'), 3],
        ['התנגדות שנשברה', 'הופכת לתמיכה', '#0fa36b', s.cue('שנשברה'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

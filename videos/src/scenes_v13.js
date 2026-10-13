// Video 13 — Daily Bias / top-down analysis (1D -> 4H -> 15m)
'use strict';
const D1P = [[0, 56000], [8, 59500], [12, 58200], [20, 62500], [25, 60800], [33, 66000], [38, 64200], [41, 64600]];
const H4P = [[0, 66000], [8, 64300], [12, 65100], [20, 63400], [24, 63900], [29, 63250]];
const M15P = [[0, 64300], [10, 63450], [14, 63800], [22, 63180], [26, 63520], [30, 63260], [35, 63950], [41, 64250]];
const D1 = genCandles(D1P, { seed: 131 }), H4 = genCandles(H4P, { seed: 137 }), M15 = genCandles(M15P, { seed: 139, noise: 0.25 });
const chD = new Chart(D1, { tf: '1D' }), chH = new Chart(H4, { tf: '4H' }), chM = new Chart(M15, { tf: '15m' });
const TFS = ['15m', '4H', '1D'];
const SZ0 = 63100, SZ1 = 63650, MBOS = 63520;

function q(ctx, tf, he, p) { popT(ctx, W / 2, 300, p, () => pill(ctx, `${he}  ·  ${tf}`, W / 2, 300, { size: 44, color: C.purple, glow: 40 })); }

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('חמש'), type: 'click' }, { lt: s.cue('ביומי'), type: 'impact', k: 1.3 }, { lt: s.cue('מופתעים'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, five = s.cue('חמש'), day = s.cue('ביומי'), sur = s.cue('מופתעים');
      drawBG(ctx, s.t);
      if (lt < day) {
        const ch = chM; stdChart(ch, lt, [[0, 0, 24], [day, 2, 24]], { p: [62900, 64600] });
        ch.draw(ctx, { reveal: lerp(10, 23, prog(lt, 0, day)), tfs: TFS });
        popT(ctx, ch.X(18), ch.Y(63600), prog(lt, five, five + 0.3), () => pill(ctx, 'SELL', ch.X(18), ch.Y(63600), { size: 34, color: '#d61f45' }));
        wipeText(ctx, 'נכנסת בגרף של 5 דקות?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 70, weight: 900 });
      } else {
        const ch = chD; stdChart(ch, lt, [[day, 30, 42], [day + 0.8, 0, 42], [d, 0, 42]], { autoFrom: 0, autoTo: 42 });
        ch.draw(ctx, { reveal: 42, tfs: TFS });
        arrow(ctx, ch.X(2), ch.Y(57500), ch.X(36), ch.Y(65800), prog(lt, day + 0.3, day + 0.9), { color: C.up, width: 14, head: 52 });
        wipeText(ctx, 'אבל ביומי: מגמת עלייה', W / 2, 300, prog(lt, day, day + 0.3), { size: 70, weight: 900, color: '#3df2a6' });
        const ps = prog(lt, sur - 0.1, sur + 0.25);
        if (ps > 0) { scrim(ctx, 0.5 * ps); popT(ctx, W / 2, 850, ps, () => text(ctx, 'מופתעים?!', W / 2, 850, { size: 170, weight: 900, color: '#ff5a72', glow: 60, glowColor: '#ff1744' })); }
      }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('טופ-דאון'), type: 'impact', k: 1.2 }, ...['1D', '4H', '15m'].map((_, k) => ({ lt: s.cue('שלושה') + k * 0.2, type: 'pop' }))],
    draw(ctx, s) {
      const { lt } = s, td = s.cue('טופ-דאון'), three = s.cue('שלושה'), qs = s.cue('שאלות');
      drawBG(ctx, s.t, { glow: 1.3 });
      titleLock(ctx, lt, 'טופ-דאון', 'TOP-DOWN ANALYSIS', td, td + 0.4, 640);
      [['1D', 'מה הכיוון?'], ['4H', 'איפה האזור?'], ['15m', 'מתי נכנסים?']].forEach(([tf, qq], k) => {
        const y = 1010 + k * 120, p = prog(lt, three + k * 0.2, three + k * 0.2 + 0.35);
        popT(ctx, W / 2, y, p, () => { glass(ctx, 170, y - 50, 740, 100, 50, { glow: 20 }); text(ctx, tf, 260, y + 2, { size: 46, weight: 900, fam: MONO, color: C.purple2 }); text(ctx, qq, 860, y + 2, { size: 46, weight: 800, align: 'right', alpha: prog(lt, qs, qs + 0.3) }); });
      });
    },
  },

  d1: {
    trans: 'whip',
    events: s => [{ lt: s.cue('עולים'), type: 'pop' }, { lt: s.cue('קנייה', 0), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, up = s.cue('עולים'), buy = s.cue('קנייה', 0);
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 42], [d, 1, 42]], { autoFrom: 0, autoTo: 42 });
      ch.draw(ctx, { reveal: 42, tfs: TFS, dim: 0.4 * prog(lt, up, up + 0.4) });
      ch.zigzag(ctx, D1P, prog(lt, up - 0.2, up + 0.8), { color: C.up });
      q(ctx, '1D', 'מה הכיוון?', prog(lt, 0, 0.3));
      popT(ctx, W / 2, 1270, prog(lt, buy, buy + 0.35), () => pill(ctx, 'הכיוון: רק קנייה', W / 2, 1270, { size: 46, color: '#0b8f63', glow: 40 }));
    },
  },

  h4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('האזור'), type: 'pop' }, { lt: s.cue('תיקון'), type: 'whoosh' }, { lt: s.cue('לתמיכה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chH, zn = s.cue('האזור'), pb = s.cue('תיקון'), sup = s.cue('לתמיכה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 32], [d, 2, 32]], { p: [62700, 66400] });
      ch.zone(ctx, SZ1, SZ0, 0, 34, { color: C.up, alpha: 0.26, progress: prog(lt, sup - 0.1, sup + 0.4), label: lt > sup ? 'תמיכה' : null });
      ch.draw(ctx, { reveal: lerp(18, 30, prog(lt, 0, sup + 0.3)), tfs: TFS });
      q(ctx, '4H', 'איפה האזור?', prog(lt, 0, 0.3));
      arrow(ctx, ch.X(12), ch.Y(65300), ch.X(27), ch.Y(63800), prog(lt, pb, pb + 0.6), { color: C.purple2, width: 10, head: 40 });
      badge(ctx, 'תיקון בתוך מגמה יומית', prog(lt, sup + 0.3, sup + 0.6), 'rgba(20,12,40,0.95)', 1270, W / 2, 36);
    },
  },

  m15: {
    trans: 'whip',
    events: s => [{ lt: s.cue('לאזור'), type: 'pop' }, { lt: s.cue('ושובר'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, zn = s.cue('לאזור'), br = s.cue('ושובר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 42], [d, 8, 42]], { p: [62900, 64500] });
      ch.zone(ctx, SZ1, SZ0, 0, 44, { color: C.up, alpha: 0.22 });
      const rev = kf(lt, [[0, 18], [zn + 0.3, 31], [br + 0.3, 36], [d, 41]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, tfs: TFS });
      const ok = rev > 34.5;
      ch.hline(ctx, MBOS, 26, 44, { color: ok ? C.purple2 : 'rgba(255,255,255,0.8)', dash: ok ? null : [12, 10], width: ok ? 6 : 4, progress: prog(lt, zn, zn + 0.5) });
      ch.tag(ctx, 30, MBOS, 'BOS', ok ? prog(lt, br + 0.2, br + 0.5) : 0, { color: C.purple, size: 38, off: 44 });
      if (ok) { ring(ctx, ch.X(35), ch.Y(MBOS), 180, prog(lt, br + 0.2, br + 0.8)); popT(ctx, ch.X(36) + 110, ch.Y(63700), prog(lt, br + 0.4, br + 0.7), () => pill(ctx, 'ENTRY', ch.X(36) + 110, ch.Y(63700), { size: 32, color: '#2962ff' })); }
      q(ctx, '15m', 'מתי נכנסים?', prog(lt, 0, 0.3));
    },
  },

  align: {
    trans: 'zoom', captions: false,
    events: s => [0, 1, 2].map(k => ({ lt: 0.4 + k * 0.4, type: 'pop' })).concat([{ lt: s.cue('בצד'), type: 'impact', k: 1.2 }]),
    draw(ctx, s) {
      const { lt } = s, side = s.cue('בצד');
      drawBG(ctx, s.t, { glow: 1.2 });
      [[chD, 0, 42, '1D', 'כיוון: עלייה'], [chH, 0, 31, '4H', 'אזור: תמיכה'], [chM, 6, 42, '15m', 'כניסה: BOS']].forEach(([ch, a, b, tf, lab], k) => {
        const y = 300 + k * 340, p = E.outCubic(prog(lt, k * 0.25, k * 0.25 + 0.4)); if (p <= 0) return;
        ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - p) * 300, 0);
        ch.layout(40, y, 1000, 320, { head: 64, foot: 10 }).view(a, b); ch.draw(ctx, { reveal: b, lastTag: false, tfs: [tf] });
        ctx.restore();
        check(ctx, 960, y + 32, 26, prog(lt, 0.4 + k * 0.4, 0.75 + k * 0.4));
        popT(ctx, 760, y + 32, prog(lt, 0.4 + k * 0.4, 0.75 + k * 0.4), () => pill(ctx, lab, 760, y + 32, { size: 24, color: '#0b8f63', pad: 12 }));
      });
      popT(ctx, W / 2, 1390, prog(lt, side - 0.1, side + 0.3), () => pill(ctx, '3 מתוך 3 מסכימים', W / 2, 1390, { size: 48, color: '#0b8f63', glow: 50 }));
    },
  },

  conflict: {
    trans: 'whip',
    events: s => [{ lt: s.cue('יורד'), type: 'pop' }, { lt: s.cue('תיקון'), type: 'impact', k: 1 }, { lt: s.cue('שורטים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, dn = s.cue('יורד'), fix = s.cue('תיקון'), sh = s.cue('שורטים');
      drawBG(ctx, s.t);
      chD.layout(40, 360, 1000, 470, { head: 70 }).view(0, 42); chD.draw(ctx, { reveal: 42, lastTag: false, tfs: ['1D'] });
      popT(ctx, 800, 470, prog(lt, 0, 0.3), () => pill(ctx, 'יומי: עולה', 800, 470, { size: 32, color: '#0b8f63' }));
      chM.layout(40, 870, 1000, 470, { head: 70 }).view(0, 24, 62900, 64600); chM.draw(ctx, { reveal: lerp(8, 23, prog(lt, 0, dn + 0.4)), lastTag: false, tfs: ['15m'] });
      popT(ctx, 800, 980, prog(lt, dn, dn + 0.3), () => pill(ctx, 'רבע שעה: יורד', 800, 980, { size: 32, color: '#d61f45' }));
      popT(ctx, W / 2, 1150, prog(lt, fix, fix + 0.35), () => pill(ctx, 'זה תיקון, לא היפוך', W / 2, 1150, { size: 44, color: '#b8860b', glow: 40 }));
      popT(ctx, W / 2, 300, prog(lt, sh, sh + 0.35), () => pill(ctx, 'לא שורטים נגד היומי', W / 2, 300, { size: 44, color: '#d61f45', glow: 40 }));
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...[0, 1, 2].map(k => ({ lt: s.cue('מאתיים') + k * 0.12, type: 'tick' })), { lt: s.cue('ואנטר'), type: 'key' }, { lt: s.cue('ואנטר') + 0.2, type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, typ = s.cue('מאתיים'), ent = s.cue('ואנטר'), sw = lt > ent + 0.2;
      drawBG(ctx, s.t);
      const ch = sw ? chH : chD;
      stdChart(ch, lt, sw ? [[0, 0, 31]] : [[0, 0, 42]], sw ? { p: [62700, 66400] } : { autoFrom: 0, autoTo: 42 });
      ch.draw(ctx, { reveal: sw ? 30 : 42, tfs: TFS, tfFlash: sw ? Math.max(0, 1 - (lt - ent - 0.2) * 2) : 0 });
      intervalPopup(ctx, lt, '240', typ, ent);
      keycap(ctx, 'Enter', W / 2, 1060, prog(lt, ent - 0.1, ent + 0.2) * (1 - prog(lt, ent + 0.5, ent + 0.8)), { w: 300, size: 56, pressed: lt > ent ? 1 : 0 });
      if (sw) { const f = Math.max(0, 1 - (lt - ent - 0.2) / 0.3); if (f > 0) { ctx.fillStyle = `rgba(230,200,255,${0.4 * f})`; ctx.fillRect(0, 0, W, H); } }
      popT(ctx, W / 2, 300, prog(lt, typ, typ + 0.35), () => pill(ctx, 'מקלידים 240 = 4 שעות', W / 2, 300, { size: 42, color: C.purple }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('יומי'), type: 'pop' }, { lt: s.cue('ארבע'), type: 'pop' }, { lt: s.cue('ורבע'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['יומי', 'נותן כיוון', C.purple, s.cue('יומי'), '1D'],
        ['ארבע שעות', 'נותן אזור', '#e0a100', s.cue('ארבע'), '4H'],
        ['רבע שעה', 'נותן כניסה', '#0fa36b', s.cue('ורבע'), '15m'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

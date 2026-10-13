// Video 4 — Fair Value Gap
'use strict';
const FVP = [[0, 66400], [5, 64900], [9, 65700], [15, 63700], [19, 64250], [23, 63300]];
const FV = genCandles(FVP, { seed: 29, noise: 0.18 });
[[63650, 63300, 63700, 63150], [63300, 63500, 63560, 63250], [63500, 64650, 64720, 63460], [64650, 64900, 65050, 64380],
 [64900, 64700, 64980, 64600], [64700, 64300, 64760, 64250], [64300, 63980, 64350, 63900], [63980, 64020, 64120, 63860],
 [64020, 64500, 64560, 63990], [64500, 65250, 65300, 64450], [65250, 65600, 65760, 64700], [65600, 65820, 65900, 65480]]
  .forEach(([o, c, h, l], k) => { FV[24 + k] = { o, c, h, l }; });
FV[23].c = 63650; FV[23].h = Math.max(FV[23].h, 63650);
const chFV = new Chart(FV);
const G0 = 63560, G1 = 64380, BOSL = 64250, TGT = 65700;

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('פער'), type: 'impact', k: 1 }, { lt: s.cue('חוזר'), type: 'pop' }, { lt: s.cue('רואים'), type: 'impact', k: 0.8 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFV, a = s.cue('פער'), b = s.cue('חוזר'), c = s.cue('רוב');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 34], [d, 14, 35]], { p: [62900, 66000] });
      const rev = kf(lt, [[0, 28], [b + 0.6, 31], [d, 33]], E.lin)[0];
      ch.zone(ctx, G0, G1, 25, 36, { color: C.purple, progress: prog(lt, a, a + 0.5), alpha: 0.3 + 0.1 * Math.sin(lt * 8) });
      ch.draw(ctx, { reveal: rev });
      ch.zone(ctx, G0, G1, 25, 36, { color: C.purple, progress: prog(lt, a, a + 0.5), alpha: 0.08, label: lt > a ? '?' : null });
      ring(ctx, ch.X(26), ch.Y((G0 + G1) / 2), 300, prog(lt, a, a + 0.7));
      const line = lt < b - 0.1 ? ['פער אחד בגרף', a, '#fff'] : lt < c - 0.1 ? ['שהמחיר חוזר אליו', b, C.purple2] : ['ורוב הסוחרים לא רואים אותו', c, '#ff5a72'];
      wipeText(ctx, line[0], W / 2, 300, prog(lt, line[1] - 0.1, line[1] + 0.25), { size: line[0].length > 16 ? 62 : 80, weight: 900, color: line[2] });
      arrow(ctx, ch.X(29) + 60, ch.Y(64900), ch.X(30) + 30, ch.Y(64200), prog(lt, b, b + 0.5), { color: C.purple2, width: 10, head: 38 });
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('Fair'), type: 'impact', k: 1.2 }, { lt: s.cue('אף'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFV;
      drawBG(ctx, s.t, { glow: 1.3 });
      stdChart(ch, lt, [[0, 18, 34], [d, 20, 33]], { p: [62900, 66000] });
      ctx.save(); ctx.globalAlpha = 0.25; ch.draw(ctx, { reveal: 36, header: false }); ch.zone(ctx, G0, G1, 25, 36, { color: C.purple, alpha: 0.4 }); ctx.restore();
      scrim(ctx, 0.35);
      headlines(ctx, lt, [{ t: 'קוראים לו', at: 0, y: 700, size: 80, color: C.dim }], s.cue('Fair'));
      titleLock(ctx, lt, 'FVG', 'FAIR VALUE GAP', s.cue('Fair'), s.cue('Fair') + 0.4);
      popT(ctx, W / 2, 1200, prog(lt, s.cue('אף'), s.cue('אף') + 0.3), () => pill(ctx, 'פער ערך הוגן', W / 2, 1200, { size: 40, color: 'rgba(30,20,60,0.95)' }));
    },
  },

  three: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שלושה'), type: 'pop' }, { lt: s.cue('באמצע'), type: 'impact', k: 1 }, { lt: s.cue('הבא'), type: 'pop' }, { lt: s.cue('נוגעים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFV, t3 = s.cue('שלושה'), mid = s.cue('באמצע'), nx = s.cue('הבא'), nt = s.cue('נוגעים');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 18, 31], [t3, 22.2, 29.2], [d, 22.4, 29.4]]), 62900, 65300);
      const rev = kf(lt, [[0, 25], [mid - 0.2, 26], [nx - 0.2, 26], [nx + 0.5, 28]], E.lin)[0];
      ch.draw(ctx, { reveal: Math.max(rev, lt < mid - 0.2 ? 26 : rev), highlight: i => i >= 25 && i <= 27 });
      [25, 26, 27].forEach((i, k) => {
        const p = prog(lt, [t3, mid, nx][k], [t3, mid, nx][k] + 0.3), q = FV[i];
        popT(ctx, ch.X(i), ch.Y(q.h) - 60, p, () => {
          ctx.save(); ctx.beginPath(); ctx.arc(ch.X(i), ch.Y(q.h) - 60, 32, 0, Math.PI * 2); ctx.fillStyle = C.purple; ctx.shadowColor = C.purple; ctx.shadowBlur = 25; ctx.fill(); ctx.restore();
          text(ctx, String(k + 1), ch.X(i), ch.Y(q.h) - 58, { size: 40, weight: 900 });
        });
      });
      const pg = prog(lt, nt - 0.2, nt + 0.4);
      ch.hline(ctx, G0, 25, 28.6, { color: '#fff', width: 4, dash: [10, 8], progress: pg });
      ch.hline(ctx, G1, 27, 23.4, { color: '#fff', width: 4, dash: [10, 8], progress: pg });
      if (pg > 0) {
        const x = ch.X(28.4); arrow(ctx, x, ch.Y(G0), x, ch.Y(G1), pg, { color: C.gold, width: 8, head: 28 }); arrow(ctx, x, ch.Y(G1), x, ch.Y(G0), pg, { color: C.gold, width: 8, head: 28 });
        popT(ctx, W / 2, 300, pg, () => pill(ctx, 'הפתילים לא נוגעים', W / 2, 300, { size: 44, color: '#b8860b' }));
      }
    },
  },

  gap: {
    trans: 'none',
    events: s => [{ lt: s.cue('הפער'), type: 'impact', k: 1.1 }, { lt: s.cue('מאוזן'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFV, g = s.cue('הפער'), m = s.cue('מאוזן'), nt = s.cue('מסחר');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 22.4, 29.4], [g + 0.6, 18, 33], [d, 18.5, 33.5]]), ...kf(lt, [[0, 62900, 65300], [g + 0.6, 62800, 65600], [d, 62800, 65600]]));
      ch.zone(ctx, G0, G1, 25, 40, { color: C.purple, progress: prog(lt, g - 0.1, g + 0.5), alpha: 0.32 });
      ch.draw(ctx, { reveal: 28 });
      ch.zone(ctx, G0, G1, 25, 40, { color: C.purple, progress: prog(lt, g - 0.1, g + 0.5), alpha: 0.05, label: lt > g ? 'FVG' : null });
      if (lt > nt) { // "no real trading" — sparse flicker inside the gap
        const r = rng(Math.floor(lt * 8));
        for (let k = 0; k < 6; k++) { ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ch.X(25.5 + r() * 2), ch.Y(G0 + r() * (G1 - G0)), 3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      }
      badge(ctx, 'השוק לא מאוזן כאן', prog(lt, m, m + 0.35), C.purple, 300, W / 2, 44);
    },
  },

  fill: {
    trans: 'none',
    events: s => [{ lt: s.cue('למלא'), type: 'pop' }, { lt: s.cue('ממשיך'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFV, fl = s.cue('למלא'), go = s.cue('ממשיך');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 18.5, 33.5], [d, 20, 37]]), 62800, 66100);
      const rev = kf(lt, [[0, 28], [fl + 0.4, 31.6], [go - 0.1, 32], [d - 0.2, 36]], E.lin)[0];
      const inside = rev > 30.3 && lt < go + 0.2;
      ch.zone(ctx, G0, G1, 25, 40, { color: inside ? C.gold : C.purple, alpha: inside ? 0.4 + 0.15 * Math.sin(lt * 12) : 0.3 });
      ch.draw(ctx, { reveal: rev });
      ch.zone(ctx, G0, G1, 25, 40, { color: C.purple, alpha: 0.05, label: 'FVG' });
      arrow(ctx, ch.X(32), ch.Y(64300), ch.X(35.5), ch.Y(65700), prog(lt, go, go + 0.6), { color: C.up, width: 12, head: 46 });
      badge(ctx, 'חוזר למלא את הפער', prog(lt, fl, fl + 0.35), '#b8860b', 300, W / 2, 42);
      badge(ctx, 'וממשיך בכיוון המקורי', prog(lt, go, go + 0.35), '#0fa36b', 1270, W / 2, 38);
    },
  },

  pick: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שבירת'), type: 'impact', k: 1 }, { lt: s.cue('רעש'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFV, br = s.cue('שבירת'), ns = s.cue('רעש');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 6, 32], [d, 8, 33]]), 62800, 66100);
      ch.zone(ctx, G0, G1, 25, 40, { color: C.purple, alpha: 0.25 });
      ch.draw(ctx, { reveal: 30 });
      ch.zigzag(ctx, [[9, 65700], [15, 63700], [19, 64250], [23, 63150]], prog(lt, 0, 0.8), { color: 'rgba(255,122,138,0.8)', width: 4 });
      const ok = lt > br;
      ch.hline(ctx, BOSL, 19, 30, { color: ok ? C.purple2 : 'rgba(255,255,255,0.8)', dash: ok ? null : [12, 10], width: ok ? 6 : 4, progress: prog(lt, 0.3, 0.8) });
      ch.tag(ctx, 22, BOSL, 'BOS', prog(lt, br, br + 0.4), { color: C.purple, size: 40, off: 44 });
      if (ok) { ring(ctx, ch.X(26), ch.Y(BOSL), 220, prog(lt, br, br + 0.6)); check(ctx, ch.X(29), ch.Y(G0) + 90, 40, prog(lt, br + 0.2, br + 0.55)); }
      badge(ctx, 'פער אחרי שבירת מבנה', prog(lt, br, br + 0.35), '#0fa36b', 300, W / 2, 42);
      badge(ctx, 'פער בלי שבירה = רעש', prog(lt, ns, ns + 0.35), '#d61f45', 1270, W / 2, 38);
    },
  },

  entry: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('הכניסה'), type: 'pop' }, { lt: s.cue('הסטופ'), type: 'pop' }, { lt: s.cue('והיעד'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFV, en = s.cue('הכניסה'), sl = s.cue('הסטופ'), tg = s.cue('והיעד');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 20, 36], [d, 21, 36]]), 62900, 66200);
      const rev = kf(lt, [[0, 30.5], [en + 0.3, 31], [tg, 31], [d - 0.1, 36]], E.lin)[0];
      ch.zone(ctx, G0, G1, 25, 40, { color: C.purple, alpha: 0.18 });
      // position tool boxes
      ch.zone(ctx, 63200, G1, 30.5, 37, { color: C.down, progress: prog(lt, sl, sl + 0.4), alpha: 0.22 });
      ch.zone(ctx, G1, TGT, 30.5, 37, { color: C.up, progress: prog(lt, tg, tg + 0.4), alpha: 0.2 });
      ch.draw(ctx, { reveal: rev });
      const lab = (p, s2, col, t0) => { ch.hline(ctx, p, 30.5, 37, { color: col, width: 4, progress: prog(lt, t0, t0 + 0.4) }); popT(ctx, ch.X(23.5), ch.Y(p), prog(lt, t0, t0 + 0.35), () => pill(ctx, s2, ch.X(23.5), ch.Y(p), { size: 30, color: col })); };
      lab(G1, 'ENTRY · כניסה', '#2962ff', en);
      lab(63200, 'STOP · סטופ', '#d61f45', sl);
      lab(TGT, 'TARGET · יעד', '#0b8f63', tg);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...Array.from({ length: 12 }, (_, k) => ({ lt: s.cue('באינדיקטורים') + 0.1 + k * 0.06, type: 'tick' })), { lt: s.cue('סקריפט'), type: 'click' }, { lt: s.cue('יסומנו'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFV, op = s.cue('באינדיקטורים'), pk = s.cue('סקריפט'), mk = s.cue('יסומנו');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(10, 38, 62800, 66300);
      const pb = prog(lt, mk - 0.2, mk + 0.3);
      ch.zone(ctx, G0, G1, 25, 38, { color: '#2962ff', progress: pb, alpha: 0.28 });
      ch.zone(ctx, 64560, 64700, 32, 38, { color: '#2962ff', progress: prog(lt, mk + 0.1, mk + 0.5), alpha: 0.28 });
      ch.draw(ctx, { reveal: 36 });
      if (pb > 0) { text(ctx, 'FVG', ch.X(36.4), ch.Y((G0 + G1) / 2), { size: 26, weight: 800, color: '#8fb0ff', alpha: pb }); text(ctx, 'FVG', ch.X(36.4), ch.Y(64630) - 24, { size: 22, weight: 800, color: '#8fb0ff', alpha: pb }); }
      indicatorDialog(ctx, lt, 'Fair Value Gap', [['Fair Value Gap', 'Community'], ['Fair Value Gaps (FVG)', 'Community'], ['FVG Imbalance', 'Community']], op, pk);
      badge(ctx, 'מסומן אוטומטית', prog(lt, mk, mk + 0.35), '#2962ff', 300, W / 2, 42);
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('שלושה'), type: 'pop' }, { lt: s.cue('פער'), type: 'pop' }, { lt: s.cue('שבירת'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['שלושה נרות', 'נר גדול באמצע', C.purple, s.cue('שלושה'), 3],
        ['פער בין הפתילים', 'לשם המחיר חוזר', '#e0a100', s.cue('פער'), 'zz'],
        ['אחרי שבירת מבנה', 'זה אזור הכניסה שלך', '#0fa36b', s.cue('שבירת'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

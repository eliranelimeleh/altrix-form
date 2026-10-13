// Video 8 — פיבונאצ'י (retracement, golden zone, confluence)
'use strict';
const FBP = [[0, 63000], [6, 62000], [12, 63850], [16, 63200], [22, 66000], [30, 63700], [40, 67000]];
const FB = genCandles(FBP, { seed: 83, noise: 0.18 });
const chFB = new Chart(FB);
const FL = [6, 62000], FH = [22, 66000];
const lvl = r => FH[1] - r * (FH[1] - FL[1]);
const OLD = 63850; // old resistance -> support under the golden zone

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('שפספסת'), type: 'pop' }, { lt: s.cue('תרדוף'), type: 'impact', k: 1 }, { lt: s.cue('חכה'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFB, miss = s.cue('שפספסת'), chase = s.cue('תרדוף'), wait = s.cue('חכה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 26], [d, 2, 26]], { p: [61500, 66600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 10], [miss, 22.6], [d, 23]], E.outCubic)[0] });
      const x = ch.X(22), y = ch.Y(66000);
      popT(ctx, x - 150, y + 20, prog(lt, miss, miss + 0.3), () => pill(ctx, 'FOMO BUY?', x - 150, y + 20, { size: 32, color: '#2962ff' }));
      cross(ctx, x - 150, y + 90, 30, prog(lt, chase, chase + 0.3));
      if (lt < chase - 0.1) wipeText(ctx, 'המחיר טס ופספסת?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 76, weight: 900 });
      else if (lt < wait - 0.1) wipeText(ctx, 'אל תרדוף אחריו', W / 2, 300, prog(lt, chase - 0.1, chase + 0.25), { size: 80, weight: 900, color: '#ff5a72' });
      const pw = prog(lt, wait - 0.1, wait + 0.3);
      if (pw > 0) {
        fibDraw(ctx, ch, FL[0], FL[1], FH[0], FH[1], 30, pw, { alpha: 0.8 });
        scrim(ctx, 0.5 * pw);
        popT(ctx, W / 2, 820, pw, () => text(ctx, 'חכה לו', W / 2, 820, { size: 150, weight: 900, glow: 40, glowColor: C.purple }));
        popT(ctx, W / 2, 990, prog(lt, s.cue('בפיבונאצ'), s.cue('בפיבונאצ') + 0.3), () => text(ctx, 'בפיבונאצ\'י', W / 2, 990, { size: 140, weight: 900, color: C.gold, glow: 50 }));
      }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('פיבונאצ'), type: 'impact', k: 1.2 }, { lt: s.cue('תיקון'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, f = s.cue('פיבונאצ');
      drawBG(ctx, s.t, { glow: 1.3 });
      goldenSpiral(ctx, W / 2 + 120, 820, 420, E.outCubic(prog(lt, 0, d)), 0.35);
      titleLock(ctx, lt, 'פיבונאצ\'י', 'FIBONACCI', f, f + 0.4, 760);
      wipeText(ctx, 'עד איפה תיקון חוזר', W / 2, 1150, prog(lt, s.cue('תיקון'), s.cue('תיקון') + 0.35), { size: 66, weight: 900, color: C.gold });
    },
  },

  draw: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מהשפל'), type: 'click' }, { lt: s.cue('השיא'), type: 'click' }, { lt: s.cue('מתמלא'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFB, a = s.cue('מהשפל'), b = s.cue('השיא'), fill = s.cue('מתמלא');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 32], [d, 1, 32]], { p: [61400, 66600] });
      ch.draw(ctx, { reveal: 23, dim: 0.3 * prog(lt, fill, fill + 0.4) });
      const dp = E.inOut(prog(lt, a, b)), xi = lerp(FL[0], FH[0], dp), yp = lerp(FL[1], FH[1], dp);
      if (lt > a - 0.1) {
        ch.clip(ctx, () => { ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ch.X(FL[0]), ch.Y(FL[1])); ctx.lineTo(ch.X(xi), ch.Y(yp)); ctx.stroke(); ctx.restore(); });
        ch.dot(ctx, FL[0], FL[1], prog(lt, a, a + 0.3), C.teal);
        cursor(ctx, ch.X(xi), ch.Y(yp), Math.max(Math.exp(-Math.abs(lt - a) * 14), lt > a && lt < b ? 0.5 : 0), 1.15);
      }
      ch.dot(ctx, FH[0], FH[1], prog(lt, b, b + 0.3), C.purple2);
      popT(ctx, ch.X(FL[0]) + 90, ch.Y(FL[1]) + 40, prog(lt, a, a + 0.3), () => pill(ctx, 'שפל', ch.X(FL[0]) + 90, ch.Y(FL[1]) + 40, { size: 28, color: '#14a88f' }));
      popT(ctx, ch.X(FH[0]), ch.Y(FH[1]) - 50, prog(lt, b, b + 0.3), () => pill(ctx, 'שיא', ch.X(FH[0]), ch.Y(FH[1]) - 50, { size: 28, color: C.purple }));
      fibDraw(ctx, ch, FL[0], FL[1], FH[0], FH[1], 32, prog(lt, fill - 0.1, fill + 0.8));
    },
  },

  levels: {
    trans: 'none',
    events: s => [{ lt: s.cue('חמישים'), type: 'pop' }, { lt: s.cue('שישים'), type: 'pop' }, { lt: s.cue('הזהב'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFB, f50 = s.cue('חמישים'), f61 = s.cue('שישים'), gz = s.cue('הזהב');
      drawBG(ctx, s.t);
      const [i0, i1] = kf(lt, [[0, 1, 32], [f50, 6, 32], [d, 7, 32]]), [pa, pb] = kf(lt, [[0, 61400, 66600], [f50, 62500, 65600], [d, 62500, 65600]]);
      ch.layout(...PANEL_STD).view(i0, i1, pa, pb);
      ch.draw(ctx, { reveal: 23, dim: 0.3 });
      fibDraw(ctx, ch, FL[0], FL[1], FH[0], FH[1], 32, 1, { hi: [lt > f50 ? 0.5 : -1, lt > f61 ? 0.618 : -1], gz: prog(lt, gz - 0.1, gz + 0.4) });
      popT(ctx, ch.X(27), ch.Y(lvl(0.5)) - 36, prog(lt, f50, f50 + 0.3), () => pill(ctx, '50%', ch.X(27), ch.Y(lvl(0.5)) - 36, { size: 34, color: '#2e7d32' }));
      popT(ctx, ch.X(27), ch.Y(lvl(0.618)) + 40, prog(lt, f61, f61 + 0.3), () => pill(ctx, '61.8%', ch.X(27), ch.Y(lvl(0.618)) + 40, { size: 34, color: '#00796b' }));
      badge(ctx, 'אזור הזהב', prog(lt, gz, gz + 0.35), '#b8860b', 300, W / 2, 52);
    },
  },

  reaction: {
    trans: 'none',
    events: s => [{ lt: s.cue('נכנס'), type: 'pop' }, { lt: s.cue('נדחה'), type: 'impact', k: 1.2 }, { lt: s.cue('וממשיך'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFB, inn = s.cue('נכנס'), rj = s.cue('נדחה'), go = s.cue('וממשיך');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 7, 32], [go, 10, 41], [d, 11, 41]]), ...kf(lt, [[0, 62500, 65600], [go, 62500, 67400], [d, 62500, 67400]]));
      const rev = kf(lt, [[0, 23], [inn + 0.2, 30], [rj + 0.2, 31], [d - 0.1, 40]], E.lin)[0];
      const inside = rev > 28.5 && rev < 33;
      fibDraw(ctx, ch, FL[0], FL[1], FH[0], FH[1], 42, 1, { hi: [0.5, 0.618], gz: 1, alpha: 0.9 });
      ch.draw(ctx, { reveal: rev, highlight: i => i === 30 && lt > rj });
      if (inside) ch.zone(ctx, lvl(0.5), lvl(0.618), 6, 42, { color: C.gold, alpha: 0.2 + 0.15 * Math.sin(lt * 12) });
      if (lt > rj) ring(ctx, ch.X(30), ch.Y(FB[30].l), 160, prog(lt, rj, rj + 0.6), C.gold);
      arrow(ctx, ch.X(31), ch.Y(64200), ch.X(39), ch.Y(66900), prog(lt, go, go + 0.6), { color: C.up, width: 12, head: 46 });
      badge(ctx, 'ושיא חדש', prog(lt, s.cue('חדש'), s.cue('חדש') + 0.35), '#0fa36b', 300, W / 2, 46);
    },
  },

  combo: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('תמיכה'), type: 'pop' }, { lt: s.cue('סיבות'), type: 'pop' }, { lt: s.cue('כניסה'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFB, sup = s.cue('תמיכה'), two = s.cue('סיבות'), en = s.cue('כניסה');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 4, 34], [d, 6, 34]]), 62400, 66400);
      ch.zone(ctx, lvl(0.5), lvl(0.618), 6, 40, { color: C.gold, alpha: 0.25 });
      ch.draw(ctx, { reveal: 31, highlight: i => i === 12 && lt > sup });
      ch.hline(ctx, OLD, 12, 40, { color: C.teal, width: 5, progress: prog(lt, sup - 0.1, sup + 0.5) });
      ring(ctx, ch.X(12), ch.Y(OLD), 120, prog(lt, sup, sup + 0.6), C.teal);
      const px = ch.X(30), py = ch.Y(lvl(0.56));
      popT(ctx, W / 2 + 200, 300, prog(lt, 0.1, 0.4), () => pill(ctx, '1 · פיבונאצ\'י', W / 2 + 200, 300, { size: 36, color: '#b8860b' }));
      popT(ctx, W / 2 - 200, 300, prog(lt, sup, sup + 0.35), () => pill(ctx, '2 · תמיכה', W / 2 - 200, 300, { size: 36, color: '#14a88f' }));
      if (lt > two) { ring(ctx, px, py, 200, prog(lt, two, two + 0.7), C.gold); burst(ctx, px, py, prog(lt, two, two + 0.9), C.gold, 22, 3, 220); }
      popT(ctx, px - 220, py, prog(lt, en, en + 0.35), () => pill(ctx, 'כניסה אחת', px - 220, py, { size: 38, color: '#0b8f63', glow: 40 }));
      check(ctx, px - 220, py + 76, 30, prog(lt, en + 0.1, en + 0.45));
    },
  },

  mistake: {
    trans: 'whip',
    events: s => [{ lt: s.cue('אקראיות'), type: 'impact', k: 1 }, { lt: s.cue('המשמעותי', 0), type: 'click' }, { lt: s.cue('המשמעותי', 1), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFB, bad = s.cue('אקראיות'), m0 = s.cue('המשמעותי', 0), m1 = s.cue('המשמעותי', 1);
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(0, 32, 61400, 66600);
      ch.draw(ctx, { reveal: 23, dim: 0.25 });
      const wrong = lt < m0 - 0.1;
      if (wrong) {
        fibDraw(ctx, ch, 16, 63200, 19, FB[19].h, 32, prog(lt, 0, 0.6), { alpha: 0.85 });
        cross(ctx, ch.X(24), ch.Y(64200), 40, prog(lt, bad, bad + 0.35));
        badge(ctx, 'נקודות אקראיות', prog(lt, bad, bad + 0.35), '#d61f45', 300, W / 2, 44);
      } else {
        ch.dot(ctx, FL[0], FL[1], prog(lt, m0, m0 + 0.3), C.teal, 16); ring(ctx, ch.X(FL[0]), ch.Y(FL[1]), 120, prog(lt, m0, m0 + 0.6), C.teal);
        ch.dot(ctx, FH[0], FH[1], prog(lt, m1, m1 + 0.3), C.purple2, 16); ring(ctx, ch.X(FH[0]), ch.Y(FH[1]), 120, prog(lt, m1, m1 + 0.6));
        fibDraw(ctx, ch, FL[0], FL[1], FH[0], FH[1], 32, prog(lt, m1, m1 + 0.6));
        check(ctx, ch.X(28), ch.Y(65400), 40, prog(lt, m1 + 0.2, m1 + 0.5));
        badge(ctx, 'שפל ושיא משמעותיים', prog(lt, m0, m0 + 0.35), '#0fa36b', 300, W / 2, 44);
      }
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Fib') - 0.2, type: 'click' }, { lt: s.cue('אלט'), type: 'key' }, { lt: s.cue('ואף'), type: 'key' }, { lt: s.cue('ומותחים'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFB, tool = s.cue('Fib') - 0.2, ka = s.cue('אלט'), kb = s.cue('ואף'), dr = s.cue('ומותחים'), end = s.cue('לשיא') + 0.3;
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(0, 32, 61400, 66600);
      ch.draw(ctx, { reveal: 23 });
      const at = tvToolbar(ctx, 40, 466, 870, lt > tool ? 'fib' : null), [fx, fy] = at('fib');
      const dp = E.inOut(prog(lt, dr, end)), xi = lerp(FL[0], FH[0], dp), yp = lerp(FL[1], FH[1], dp);
      if (dp > 0) fibDraw(ctx, ch, FL[0], FL[1], xi, yp, 32, 1, { alpha: 0.4 + 0.6 * dp });
      const c = lt < dr ? kf(lt, [[0, 700, 1150], [tool - 0.3, fx, fy], [tool + 0.2, fx, fy], [dr, ch.X(FL[0]), ch.Y(FL[1])]]) : [ch.X(xi), ch.Y(yp)];
      if (lt < ka - 0.1 || lt > kb + 0.4) cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - tool) * 14), 1.15);
      ring(ctx, fx, fy, 70, prog(lt, tool, tool + 0.5));
      popT(ctx, W / 2, 300, prog(lt, tool, tool + 0.35), () => pill(ctx, 'Fib Retracement', W / 2, 300, { size: 44, color: C.purple }));
      const pk = prog(lt, ka - 0.05, ka + 0.3) * (1 - prog(lt, dr - 0.2, dr));
      if (pk > 0) {
        scrim(ctx, 0.5 * pk);
        keycap(ctx, 'Alt', W / 2 - 150, 860, pk, { w: 230, pressed: lt > ka ? 1 : 0 });
        text(ctx, '+', W / 2 - 5, 860, { size: 90, weight: 900, color: C.purple2, alpha: pk });
        keycap(ctx, 'F', W / 2 + 160, 860, prog(lt, kb - 0.05, kb + 0.3) * pk, { w: 170, pressed: lt > kb ? 1 : 0 });
      }
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מותחים'), type: 'pop' }, { lt: s.cue('הזהב'), type: 'pop' }, { lt: s.cue('אישור'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['משפל לשיא', 'מותחים את הכלי', C.purple, s.cue('מותחים'), 'zz'],
        ['אזור הזהב', '50% עד 61.8%', '#e0a100', s.cue('הזהב'), 'φ'],
        ['אישור מרמה', 'ורק אז נכנסים', '#0fa36b', s.cue('אישור'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

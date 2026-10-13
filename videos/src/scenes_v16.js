// Video 16 — ATR & volatility-based stops
'use strict';
function genATR(seed) {
  const r = rng(seed), out = []; let p = 64000;
  for (let i = 0; i < 62; i++) {
    const R = i < 20 ? 380 : i < 41 ? 830 : 1350, drift = Math.sin(i / 6) * R * 0.18 + (i > 44 ? R * 0.12 : 0);
    const o = p, c = o + (r() - 0.5) * R * 1.1 + drift, h = Math.max(o, c) + r() * R * 0.35, l = Math.min(o, c) - r() * R * 0.35;
    out.push({ o, c, h, l }); p = c;
  }
  return out;
}
const AT = genATR(161);
const AV = atrSeries(AT, 14);
const chAT = new Chart(AT);
const EI = 38, EP = AT[EI].c, TIGHT = EP - 200, WIDE = EP - 1.5 * AV[EI], SUPL = 61080;
const ATRSTOP = AT.map((q, i) => q.c - 1.5 * AV[i]);

function atrPane(ctx, ch, reveal, o = {}) { return oscPane(ctx, ch, 1020, 320, AV, reveal, { lo: 0, hi: 1000, levels: [500], color: '#ffb74d', label: 'ATR 14', ...o }); }
function rangeBracket(ctx, ch, i, p, col = C.gold) {
  if (p <= 0) return; const q = AT[i], x = ch.X(i) + ch.cw() * 0.55, y0 = ch.Y(q.h), y1 = ch.Y(q.l), e = E.outCubic(p);
  ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.shadowColor = col; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.moveTo(x - 10, y0); ctx.lineTo(x, y0); ctx.lineTo(x, lerp(y0, y1, e)); ctx.lineTo(x - 10, lerp(y0, y1, e)); ctx.stroke(); ctx.restore();
}
function sizeCard(ctx, y, lab, dist, qty, wide, col, p, k) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate((1 - E.outBack(p)) * (k ? 500 : -500), 0);
  glass(ctx, 80, y, 920, 330, 28, { border: col, glowColor: col, glow: 30 });
  text(ctx, lab, 940, y + 60, { size: 44, weight: 900, align: 'right' });
  text(ctx, 'סיכון $100', 940, y + 130, { size: 36, weight: 800, align: 'right', color: C.dim });
  text(ctx, qty, 540, y + 130, { size: 44, weight: 800, align: 'right', color: col === C.up ? '#3df2a6' : C.purple2, fam: MONO });
  const bw = wide ? 160 : 460; rrect(ctx, 940 - bw * E.outCubic(p), y + 200, bw * E.outCubic(p), 64, 14); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
  text(ctx, 'גודל פוזיציה', 940, y + 295, { size: 26, weight: 700, align: 'right', color: C.dim });
  ctx.save(); ctx.strokeStyle = C.down; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(180, y + 110); ctx.lineTo(180, y + 110 + dist); ctx.stroke(); ctx.restore();
  text(ctx, 'סטופ', 210, y + 110 + dist / 2, { size: 26, weight: 700, align: 'left', color: '#ff5a72' });
  ctx.restore();
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('נתפס'), type: 'impact', k: 1.3 }, { lt: s.cue('מותאם'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chAT, hit = s.cue('נתפס'), fit = s.cue('מותאם');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 28, 46], [d, 29, 46]], { p: [60400, 63500] });
      ch.hline(ctx, EP, EI, 48, { color: '#2962ff', width: 4 });
      const hitNow = lt > hit;
      ch.hline(ctx, TIGHT, EI, 48, { color: hitNow ? C.down : '#ff8095', width: 4, dash: hitNow ? null : [12, 10] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 39], [hit, 39.35], [fit, 41], [d, 45]], E.lin)[0] });
      popT(ctx, ch.X(EI) - 150, ch.Y(TIGHT) + 30, prog(lt, 0.1, 0.4), () => pill(ctx, hitNow ? 'STOP HIT' : 'SL $200', ch.X(EI) - 150, ch.Y(TIGHT) + 30, { size: 30, color: '#d61f45' }));
      if (hitNow) { ring(ctx, ch.X(39), ch.Y(TIGHT), 200, prog(lt, hit, hit + 0.6), C.down); const f = Math.max(0, 1 - (lt - hit) / 0.3); if (f > 0) { ctx.fillStyle = `rgba(255,40,70,${0.25 * f})`; ctx.fillRect(0, 0, W, H); } }
      if (lt < fit - 0.1) wipeText(ctx, 'הסטופ נתפס מכל רעש?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 72, weight: 900 });
      else wipeText(ctx, 'הוא לא מותאם לתנודתיות', W / 2, 300, prog(lt, fit - 0.1, fit + 0.25), { size: 66, weight: 900, color: C.gold });
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('ATR'), type: 'impact', k: 1.2 }, ...[0, 1, 2].map(k => ({ lt: s.cue('מודד') + k * 0.2, type: 'pop' }))],
    draw(ctx, s) {
      const { lt } = s, a = s.cue('ATR'), m = s.cue('מודד'), ch = chAT;
      drawBG(ctx, s.t, { glow: 1.3 });
      titleLock(ctx, lt, 'ATR', 'AVERAGE TRUE RANGE', a, a + 0.4, 560);
      const pm = E.outCubic(prog(lt, m - 0.2, m + 0.3));
      if (pm > 0) {
        ctx.save(); ctx.globalAlpha = pm;
        ch.layout(140, 920, 800, 420, { head: 0, axis: 0, foot: 0 }).view(35.5, 39.5, 60600, 62300);
        ch.clip(ctx, () => { for (let i = 36; i < 39; i++) ch.candle(ctx, i, AT[i], 1, 14); });
        [36, 37, 38].forEach((i, k) => rangeBracket(ctx, ch, i, prog(lt, m + k * 0.2, m + k * 0.2 + 0.4)));
        ctx.restore();
        wipeText(ctx, 'כמה נר זז בממוצע', W / 2, 870, prog(lt, m, m + 0.35), { size: 54, weight: 900, color: C.gold });
      }
    },
  },

  measure: {
    trans: 'whip',
    events: s => [{ lt: s.cue('חמש'), type: 'pop' }, { lt: s.cue('מאתיים'), type: 'pop' }, { lt: s.cue('רגיל'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chAT, five = s.cue('חמש'), two = s.cue('מאתיים'), norm = s.cue('רגיל');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 630, { foot: 10 }).view(...kf(lt, [[0, 22, 42], [d, 24, 42]]), 60400, 63600);
      ch.draw(ctx, { reveal: 39 });
      const Y = atrPane(ctx, ch, 39);
      [34, 35, 36, 37, 38].forEach((i, k) => rangeBracket(ctx, ch, i, prog(lt, five + k * 0.1, five + k * 0.1 + 0.4)));
      popT(ctx, ch.X(EI), Y(AV[EI]) - 40, prog(lt, five, five + 0.35), () => pill(ctx, 'ATR ≈ $500', ch.X(EI) - 60, Y(AV[EI]) - 40, { size: 30, color: '#e67e22' }));
      if (lt > two) {
        ch.zone(ctx, EP, TIGHT, EI, 41, { color: C.down, alpha: 0.35 });
        popT(ctx, ch.X(31), ch.Y(TIGHT), prog(lt, two, two + 0.3), () => pill(ctx, 'סטופ $200', ch.X(31), ch.Y(TIGHT), { size: 30, color: '#d61f45' }));
        cross(ctx, ch.X(31) + 140, ch.Y(TIGHT), 26, prog(lt, norm, norm + 0.3));
      }
      badge(ctx, 'ייתפס מרעש רגיל', prog(lt, norm, norm + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },

  rule: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('אחד'), type: 'impact', k: 1 }, { lt: s.cue('הטכנית'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chAT, one = s.cue('אחד'), tech = s.cue('הטכנית');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 26, 46], [d, 27, 46]], { p: [60300, 63500] });
      ch.hline(ctx, EP, EI, 48, { color: '#2962ff', width: 4 });
      ch.hline(ctx, SUPL, 30, 48, { color: C.teal, width: 3, dash: [10, 8], progress: prog(lt, tech - 0.1, tech + 0.4) });
      ch.hline(ctx, WIDE, EI, 48, { color: '#3df2a6', width: 5, progress: prog(lt, one, one + 0.5) });
      ch.draw(ctx, { reveal: lt > tech ? lerp(39, 45, prog(lt, tech, d)) : 39 });
      if (lt > one) { const x = ch.X(47); arrow(ctx, x, ch.Y(EP) + 8, x, ch.Y(WIDE) - 8, prog(lt, one, one + 0.4), { color: C.gold, width: 6, head: 22 });
        popT(ctx, ch.X(33), ch.Y(WIDE) + 40, prog(lt, one, one + 0.35), () => pill(ctx, '1.5 × ATR = $750', ch.X(33), ch.Y(WIDE) + 40, { size: 32, color: '#b8860b' })); }
      popT(ctx, ch.X(33), ch.Y(SUPL) - 34, prog(lt, tech, tech + 0.3), () => pill(ctx, 'רמה טכנית', ch.X(33), ch.Y(SUPL) - 34, { size: 26, color: '#14a88f' }));
      check(ctx, ch.X(42), ch.Y(WIDE) + 40, 28, prog(lt, tech + 0.6, tech + 0.9));
      badge(ctx, 'סטופ מעבר לרמה', prog(lt, tech, tech + 0.35), '#0fa36b', 300, W / 2, 44);
    },
  },

  volatile: {
    trans: 'whip',
    events: s => [{ lt: s.cue('סוער'), type: 'impact', k: 1.2 }, { lt: s.cue('רגוע'), type: 'pop' }, { lt: s.cue('נושם'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chAT, st = s.cue('סוער'), calm = s.cue('רגוע'), br = s.cue('נושם');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 630, { foot: 10 }).view(0, 62);
      ch.draw(ctx, { reveal: 62, dim: 0.25 });
      lineSeries(ctx, ch, ATRSTOP, Math.floor(lerp(14, 62, prog(lt, 0, br + 0.5))), { color: '#ff8095', width: 4 });
      atrPane(ctx, ch, 62);
      popT(ctx, ch.X(52), ch.p.y + 50, prog(lt, st, st + 0.35), () => pill(ctx, 'סוער: סטופ רחב', ch.X(52), ch.p.y + 50, { size: 30, color: '#d61f45' }));
      popT(ctx, ch.X(10), ch.p.y + 50, prog(lt, calm, calm + 0.35), () => pill(ctx, 'רגוע: סטופ צר', ch.X(10), ch.p.y + 50, { size: 30, color: '#0b8f63' }));
      badge(ctx, 'הסטופ נושם עם השוק', prog(lt, br, br + 0.35), C.purple, 300, W / 2, 44);
    },
  },

  size: {
    trans: 'whip',
    events: s => [{ lt: s.cue('רחב'), type: 'pop' }, { lt: s.cue('קטנה'), type: 'pop' }, { lt: s.cue('נשאר'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, wd = s.cue('רחב'), sm = s.cue('קטנה'), same = s.cue('נשאר');
      drawBG(ctx, s.t);
      popT(ctx, W / 2, 300, prog(lt, 0, 0.3), () => pill(ctx, 'גודל = סיכון ÷ מרחק הסטופ', W / 2, 300, { size: 40, color: C.purple }));
      sizeCard(ctx, 440, 'סטופ רחב · $750', 160, '0.13 BTC', true, C.purple, prog(lt, wd - 0.05, wd + 0.35), 0);
      sizeCard(ctx, 820, 'סטופ צר · $300', 64, '0.33 BTC', false, C.up, prog(lt, sm - 0.05, sm + 0.35), 1);
      popT(ctx, W / 2, 1230, prog(lt, same, same + 0.35), () => pill(ctx, 'הסיכון נשאר $100', W / 2, 1230, { size: 46, color: '#0b8f63', glow: 40 }));
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...Array.from({ length: 10 }, (_, k) => ({ lt: s.cue('Average') + 0.05 + k * 0.05, type: 'tick' })), { lt: s.cue('מהאינדיקטורים'), type: 'click' }, { lt: s.cue('הערך'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chAT, op = s.cue('תוסיף'), pk = s.cue('מהאינדיקטורים'), val = s.cue('הערך');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 630, { foot: 10 }).view(20, 42, 60400, 63600);
      ch.draw(ctx, { reveal: 41 });
      const pp = E.outCubic(prog(lt, pk + 0.2, pk + 0.6));
      if (pp > 0) {
        ctx.save(); ctx.globalAlpha = pp; ctx.translate(0, (1 - pp) * 150);
        const Y = atrPane(ctx, ch, 41);
        if (lt > val) { ring(ctx, ch.X(40), Y(AV[40]), 70, prog(lt, val, val + 0.6), '#ffb74d'); popT(ctx, ch.X(36), Y(AV[40]) - 50, prog(lt, val, val + 0.35), () => pill(ctx, `ATR 14 · ${Math.round(AV[40])}`, ch.X(36), Y(AV[40]) - 50, { size: 28, color: '#e67e22' })); }
        ctx.restore();
      }
      indicatorDialog(ctx, lt, 'Average True Range', [['Average True Range', 'Built-in'], ['ATR Bands', 'Community'], ['ATR Trailing Stop', 'Community']], op, pk);
      popT(ctx, W / 2, 300, prog(lt, val, val + 0.35), () => pill(ctx, 'קוראים את הנר האחרון', W / 2, 300, { size: 40, color: '#e67e22' }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('ATR', 0), type: 'pop' }, { lt: s.cue('סטופ'), type: 'pop' }, { lt: s.cue('וגודל'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['ATR', 'מודד תנודתיות', C.purple, s.cue('ATR', 0), 'zz'],
        ['סטופ ב-1.5 ATR', 'מעבר לרמה', '#e0a100', s.cue('סטופ'), '1.5'],
        ['גודל לפי הסטופ', 'הסיכון נשאר קבוע', '#0fa36b', s.cue('וגודל'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

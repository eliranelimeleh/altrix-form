// Video 20 — Bollinger Bands (squeeze, breakout, walking the band, mean reversion)
'use strict';
function genBB(seed) {
  const r = rng(seed), out = []; let p = 62000;
  for (let i = 0; i < 84; i++) {
    let R, drift;
    if (i < 14) { R = 560; drift = 110; } else if (i < 39) { R = 110; drift = (63600 - p) * 0.15; } else if (i === 39) { R = 0; drift = 950; }
    else if (i < 56) { R = 340; drift = 210; } else { R = 420; drift = (67400 + Math.sin((i - 56) / 2.2) * 1100 - p) * 0.55; }
    const o = p, c = o + drift + (r() - 0.5) * R, h = Math.max(o, c) + r() * Math.max(R, 120) * 0.35, l = Math.min(o, c) - r() * Math.max(R, 120) * 0.35;
    out.push({ o, c, h, l }); p = c;
  }
  return out;
}
const BBC = genBB(201), BB = bollinger(BBC, 20, 2);
const BBV = BBC.map((q, i) => i === 39 ? 230 : i > 14 && i < 39 ? 40 : 80 + Math.abs(q.c - q.o) / 12);
const chBB = new Chart(BBC);
const BU = BB.map(b => b.u), BL = BB.map(b => b.l), BM = BB.map(b => b.m);

function bands(ctx, ch, reveal, o = {}) {
  if (ch._defer(() => bands(ctx, ch, reveal, o))) return; // draw under the candles when called before draw()
  const n = Math.floor(Math.min(reveal, BB.length)); if (n < 2) return;
  const { alpha = 1 } = o;
  ch.clip(ctx, () => {
    ctx.save(); ctx.globalAlpha *= 0.12 * alpha; ctx.fillStyle = '#2962ff'; ctx.beginPath();
    for (let i = 0; i < n; i++) ctx.lineTo(ch.X(i), ch.Y(BU[i])); for (let i = n - 1; i >= 0; i--) ctx.lineTo(ch.X(i), ch.Y(BL[i])); ctx.closePath(); ctx.fill(); ctx.restore();
  });
  lineSeries(ctx, ch, BU, n, { color: '#5b8cff', width: 3.5, alpha }); lineSeries(ctx, ch, BL, n, { color: '#5b8cff', width: 3.5, alpha }); lineSeries(ctx, ch, BM, n, { color: '#ff9800', width: 3, alpha: 0.8 * alpha });
}
function widthMeter(ctx, i, label) {
  const w = (BU[i] - BL[i]) / 3200, col = w < 0.25 ? C.gold : w > 0.6 ? C.down : C.purple2;
  glass(ctx, 140, 490, 800, 130, 26, { border: col, glowColor: col });
  text(ctx, label || 'רוחב הרצועות', 900, 525, { size: 32, weight: 800, align: 'right', color: C.dim });
  ctx.save(); rrect(ctx, 180, 560, 720, 30, 15); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); rrect(ctx, 900 - 720 * clamp(w), 560, 720 * clamp(w), 30, 15); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fill(); ctx.restore();
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('שקט'), type: 'pop' }, { lt: s.cue('להתפוצץ'), type: 'impact', k: 1.5 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chBB, q = s.cue('שקט'), boom = s.cue('להתפוצץ');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 44], [d, 16, 46]], { p: [61800, 66600] });
      const rev = kf(lt, [[0, 26], [boom - 0.2, 39], [boom + 0.3, 41], [d, 44]], E.lin)[0];
      bands(ctx, ch, rev, { alpha: prog(lt, q, q + 0.5) });
      ch.draw(ctx, { reveal: rev });
      if (lt > boom) { ring(ctx, ch.X(39), ch.Y(BBC[39].c), 260, prog(lt, boom, boom + 0.6), C.up); burst(ctx, ch.X(39), ch.Y(BBC[39].c), prog(lt, boom, boom + 0.9), '#3df2a6', 30, 6, 300); }
      if (lt < boom - 0.1) wipeText(ctx, 'השוק שקט מדי?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 80, weight: 900 });
      else wipeText(ctx, 'ואז הוא מתפוצץ', W / 2, 300, prog(lt, boom - 0.1, boom + 0.25), { size: 80, weight: 900, color: '#3df2a6' });
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('Bollinger'), type: 'impact', k: 1.2 }, { lt: s.cue('ממוצע'), type: 'pop' }, { lt: s.cue('רצועות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, bb = s.cue('Bollinger'), avg = s.cue('ממוצע'), rb = s.cue('רצועות'), ch = chBB;
      drawBG(ctx, s.t, { glow: 1.3 });
      titleLock(ctx, lt, 'בולינג׳ר', 'BOLLINGER BANDS', bb, bb + 0.3, 500);
      const p = E.outCubic(prog(lt, avg - 0.2, avg + 0.3));
      if (p > 0) {
        ctx.save(); ctx.globalAlpha = p;
        ch.layout(60, 860, 960, 480, { head: 0, axis: 0, foot: 0 }).view(0, 38, 61400, 64800);
        lineSeries(ctx, ch, BM, 38, { color: '#ff9800', width: 5 });
        if (lt > rb) { lineSeries(ctx, ch, BU, Math.floor(lerp(2, 38, prog(lt, rb, rb + 0.6))), { color: '#5b8cff', width: 5 }); lineSeries(ctx, ch, BL, Math.floor(lerp(2, 38, prog(lt, rb, rb + 0.6))), { color: '#5b8cff', width: 5 }); }
        ctx.restore();
        popT(ctx, 300, 1380, prog(lt, avg, avg + 0.3), () => pill(ctx, 'ממוצע 20', 300, 1380, { size: 30, color: '#e67e22' }));
        popT(ctx, 760, 1380, prog(lt, rb, rb + 0.3), () => pill(ctx, '2 רצועות', 760, 1380, { size: 30, color: '#2962ff' }));
      }
    },
  },

  how: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מתרחבות'), type: 'pop' }, { lt: s.cue('ומתכווצות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chBB, wide = s.cue('מתרחבות'), tight = s.cue('ומתכווצות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 40], [d, 2, 40]], { p: [60800, 65200] });
      bands(ctx, ch, 39); ch.draw(ctx, { reveal: 39, dim: 0.3 });
      const i = lt < tight ? 12 : 36; widthMeter(ctx, i);
      ring(ctx, ch.X(i), ch.Y(BM[i]), 160, prog(lt, lt < tight ? wide : tight, (lt < tight ? wide : tight) + 0.6), lt < tight ? C.down : C.gold);
      badge(ctx, lt < tight ? 'תנודתי = רחב' : 'רגוע = צר', prog(lt, lt < tight ? wide : tight, (lt < tight ? wide : tight) + 0.3), lt < tight ? '#d61f45' : '#b8860b', 300, W / 2, 46);
    },
  },

  squeeze: {
    trans: 'none',
    events: s => [{ lt: s.cue('Squeeze'), type: 'impact', k: 1.2 }, { lt: s.cue('נצברת'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chBB, sq = s.cue('Squeeze'), en = s.cue('נצברת');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 2, 40], [sq, 22, 41], [d, 23, 41]]), ...kf(lt, [[0, 60800, 65200], [sq, 62600, 64600], [d, 62600, 64600]]));
      bands(ctx, ch, 39); ch.draw(ctx, { reveal: 39 });
      widthMeter(ctx, 36, 'Squeeze');
      if (lt > en) { const g = 0.5 + 0.5 * Math.sin(lt * 14); ch.zone(ctx, BU[36], BL[36], 24, 39, { color: C.gold, alpha: 0.12 + 0.12 * g }); }
      popT(ctx, W / 2, 1270, prog(lt, sq, sq + 0.35), () => pill(ctx, 'SQUEEZE', W / 2, 1270, { size: 56, color: '#b8860b', glow: 50 }));
    },
  },

  breakout: {
    trans: 'none',
    events: s => [{ lt: s.cue('בחוזקה'), type: 'impact', k: 1.6 }, { lt: s.cue('נפח'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chBB, out = s.cue('בחוזקה'), vol = s.cue('נפח');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 23, 41], [out + 0.3, 24, 44], [d, 25, 46]]), ...kf(lt, [[0, 62600, 64600], [out + 0.3, 62600, 65800], [d, 62600, 66200]]));
      const rev = kf(lt, [[0, 39], [out, 40], [d, 44]], E.lin)[0];
      bands(ctx, ch, rev); ch.draw(ctx, { reveal: rev, highlight: i => i === 39 });
      volumeBars(ctx, ch, BBV, rev, { h: 170, highlight: i => i === 39 && lt > vol });
      if (lt > out) { ring(ctx, ch.X(39), ch.Y(BU[39]), 220, prog(lt, out, out + 0.6), C.up); burst(ctx, ch.X(39), ch.Y(BU[39]), prog(lt, out, out + 0.9), '#3df2a6', 28, 9, 260); }
      badge(ctx, 'פריצה מחוץ לרצועה', prog(lt, out, out + 0.35), '#0fa36b', 300, W / 2, 44);
      if (lt > vol) ring(ctx, ch.X(39), ch.p.y + ch.p.h - 80, 90, prog(lt, vol, vol + 0.6), C.up);
    },
  },

  walk: {
    trans: 'whip',
    events: s => [{ lt: s.cue('העליונה'), type: 'pop' }, { lt: s.cue('למכור'), type: 'pop' }, { lt: s.cue('לכוח'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chBB, top = s.cue('העליונה'), sell = s.cue('למכור'), pw = s.cue('לכוח');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 30, 58], [d, 32, 58]], { p: [62600, 68800] });
      const rev = lerp(42, 56, prog(lt, 0, top + 0.6));
      bands(ctx, ch, rev); ch.draw(ctx, { reveal: rev });
      if (lt > top) ch.clip(ctx, () => { ctx.save(); ctx.globalAlpha = 0.25 + 0.15 * Math.sin(lt * 10); ctx.strokeStyle = C.up; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 41; i < Math.floor(rev); i++) ctx.lineTo(ch.X(i), ch.Y(BU[i])); ctx.stroke(); ctx.restore(); });
      const x = ch.X(48), y = ch.Y(BU[48]) - 70;
      popT(ctx, x, y, prog(lt, sell - 0.2, sell + 0.1), () => pill(ctx, 'SELL?', x, y, { size: 28, color: '#d61f45' }));
      cross(ctx, x + 90, y, 22, prog(lt, sell, sell + 0.3));
      badge(ctx, 'הליכה על הרצועה = כוח', prog(lt, pw, pw + 0.35), '#0fa36b', 300, W / 2, 42);
    },
  },

  mean: {
    trans: 'whip',
    events: s => [{ lt: s.cue('צדדי'), type: 'pop' }, { lt: s.cue('לממוצע'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chBB, side = s.cue('צדדי'), back = s.cue('לממוצע');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 56, 84], [d, 56, 84]], { p: [64600, 70200] });
      const rev = lerp(66, 84, prog(lt, 0, back + 0.6));
      bands(ctx, ch, rev); ch.draw(ctx, { reveal: rev });
      const touches = []; for (let i = 62; i < Math.floor(rev); i++) { if (BBC[i].h >= BU[i] - 80) touches.push([i, 1]); else if (BBC[i].l <= BL[i] + 80) touches.push([i, -1]); }
      touches.slice(0, 6).forEach(([i, sgn], k) => { const t0 = side + k * 0.25; ring(ctx, ch.X(i), ch.Y(sgn > 0 ? BBC[i].h : BBC[i].l), 70, prog(lt, t0, t0 + 0.5), sgn > 0 ? C.down : C.up);
        arrow(ctx, ch.X(i), ch.Y(sgn > 0 ? BBC[i].h : BBC[i].l) + sgn * -20, ch.X(i + 2), ch.Y(BM[i + 2] || BM[i]), prog(lt, t0 + 0.2, t0 + 0.6), { color: '#ff9800', width: 5, head: 18 }); });
      badge(ctx, 'שוק צדדי → חזרה לממוצע', prog(lt, back, back + 0.35), '#e67e22', 300, W / 2, 42);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...Array.from({ length: 10 }, (_, k) => ({ lt: s.cue('Bollinger') + 0.05 + k * 0.05, type: 'tick' })), { lt: s.cue('מהאינדיקטורים'), type: 'click' }, { lt: s.cue('עשרים'), type: 'key' }, { lt: s.cue('ושתיים'), type: 'key' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chBB, op = s.cue('תוסיף'), pk = s.cue('מהאינדיקטורים'), a = s.cue('עשרים'), b = s.cue('ושתיים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 50]], { p: [61400, 68000] });
      if (lt > pk + 0.2) bands(ctx, ch, Math.floor(lerp(2, 50, prog(lt, pk + 0.2, pk + 1)))); ch.draw(ctx, { reveal: 50 });
      indicatorDialog(ctx, lt, 'Bollinger Bands', [['Bollinger Bands', 'Built-in'], ['Bollinger Bands %B', 'Built-in'], ['Bollinger BandWidth', 'Built-in']], op, pk);
      const ps = prog(lt, a - 0.3, a);
      if (ps > 0) {
        ctx.save(); ctx.globalAlpha = ps; glass(ctx, 240, 1060, 600, 250, 22, { fill: 'rgba(22,16,40,0.97)' });
        text(ctx, 'BB · Inputs', 270, 1100, { size: 28, weight: 800, align: 'left' });
        [['Length', '20', a], ['StdDev', '2', b]].forEach(([k, v, t0], j) => { const y = 1170 + j * 70; text(ctx, k, 270, y, { size: 28, weight: 500, align: 'left', color: C.axis });
          rrect(ctx, 560, y - 28, 220, 56, 10); ctx.fillStyle = '#0d0a19'; ctx.fill(); ctx.strokeStyle = lt > t0 ? C.purple : 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3; ctx.stroke(); text(ctx, v, 670, y + 2, { size: 32, weight: 800, fam: MONO }); });
        ctx.restore();
      }
      popT(ctx, W / 2, 300, prog(lt, a, a + 0.35), () => pill(ctx, 'הגדרות סטנדרטיות: 20 / 2', W / 2, 300, { size: 40, color: C.purple }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('התכווצות'), type: 'pop' }, { lt: s.cue('פריצה'), type: 'pop' }, { lt: s.cue('וההקשר'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['התכווצות', 'לפני תנועה', '#e0a100', s.cue('התכווצות'), 'warn'],
        ['פריצה עם נפח', 'זה הסיגנל', '#0fa36b', s.cue('פריצה'), 'check'],
        ['ההקשר קובע', 'מגמה או שוק צדדי', C.purple, s.cue('וההקשר'), 'zz'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

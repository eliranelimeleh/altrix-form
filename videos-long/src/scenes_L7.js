// L7 — Price Action pillar 2: CONFIRMATION (don't front-run a level, wait for the close)
'use strict';
// ---------- data ----------
// the falling knife: HL support 61800 at 8, rally to 65700 (21), sell-off; I bought the close of 26 (wick tagged the level),
// it fell to 58500 (33), I exited the small bounce at 35, base at 40, real reclaim = close above 61800 at 45, retest holds
const KP = [[0, 60400], [4, 62700], [8, 61800], [14, 65900], [18, 64900], [21, 65700], [33, 58500], [36, 59800], [40, 58300], [47, 62300], [49, 61950], [58, 64800]];
const KC = override(genCandles(KP, { seed: 21, noise: 0.14 }), {
  26: { o: 62951, h: 63024, l: 61760, c: 62050 },
  27: { o: 62050, h: 62150, l: 60850, c: 61050 },
  44: { o: 60581, h: 62050, l: 60341, c: 61550 },
  45: { o: 61550, h: 62150, l: 61500, c: 62080 },
});
const chK = new Chart(KC);
const K_LVL = 61800, K_BUY = 62050, K_EXIT = KC[35].c, K_BI = 26, K_XI = 35, K_RI = 45;
// guess vs reaction around support 62000: shared approach, B = rejection + close (confirmation at 17), A = slices through
const BP = [[0, 65200], [5, 63900], [8, 64500], [16, 62150], [26, 64800]];
const BC = override(genCandles(BP, { seed: 3, noise: 0.14 }), {
  16: { o: 62206, h: 62300, l: 61850, c: 62250 },
  17: { o: 62250, h: 62750, l: 62230, c: 62700 },
});
const AC = override(BC.map(q => ({ ...q })), {
  16: { o: 62206, h: 62250, l: 61700, c: 61780 }, 17: { o: 61780, h: 61850, l: 61200, c: 61300 },
  18: { o: 61300, h: 61400, l: 60900, c: 60980 }, 19: { o: 60980, h: 61250, l: 60850, c: 61150 },
  20: { o: 61150, h: 61200, l: 60500, c: 60600 }, 21: { o: 60600, h: 60700, l: 60300, c: 60420 },
  22: { o: 60420, h: 60650, l: 60350, c: 60550 }, 23: { o: 60550, h: 60600, l: 60100, c: 60180 },
  24: { o: 60180, h: 60400, l: 60050, c: 60300 }, 25: { o: 60300, h: 60350, l: 59900, c: 60000 },
  26: { o: 60000, h: 60150, l: 59850, c: 59950 },
});
const chA = new Chart(AC), chB = new Chart(BC);
const P_LVL = 62000, P_BUY = AC[13].c;
// weekly support 60000 tested 3 times (8, 16, 24)
const WP = [[0, 56500], [5, 62800], [8, 60050], [12, 63600], [16, 60000], [20, 63200], [24, 60080], [28, 62600], [31, 61000]];
const WC = override(genCandles(WP, { seed: 4, noise: 0.14 }), {
  14: { o: 61887, h: 62442, l: 60900, c: 61000 }, 15: { o: 61000, h: 61100, l: 60350, c: 60420 },
  22: { o: 61782, h: 62144, l: 60900, c: 61000 }, 23: { o: 61000, h: 61050, l: 60300, c: 60350 },
});
const chW = new Chart(WC, { tf: '1W' });
// daily: close below at 18, back from below, 25 = wick above / close below, 26 = CLOSE ABOVE (confirmation), 27 = entry
const DP = [[0, 62800], [5, 61300], [8, 62100], [14, 60200], [16, 60700], [21, 59000], [38, 63600]];
const DC = override(genCandles(DP, { seed: 9, noise: 0.14 }), {
  17: { o: 60475, h: 60560, l: 60150, c: 60250 },
  18: { o: 60250, h: 60300, l: 59480, c: 59560 },
  25: { o: 59874, h: 60180, l: 59800, c: 59880 },
  26: { o: 59880, h: 60550, l: 59850, c: 60450 },
  27: { o: 60450, h: 60800, l: 60300, c: 60720 },
});
const chD = new Chart(DC, { tf: '1D' });
const LVL = 60000, D_BRK = 18, D_WICK = 25, D_CONF = 26, D_ENT = 27;
const TFS_D = ['4H', '1D', '1W'];

// ---------- local helpers ----------
function flashCol(ctx, lt, t, col = '255,40,70', a = 0.25) { const f = Math.max(0, 1 - (lt - t) / 0.3); if (lt >= t && f > 0) { ctx.fillStyle = `rgba(${col},${a * f})`; ctx.fillRect(0, 0, W, H); } }
function hit(ctx, x, y, lt, t, col = C.gold, r = 220) { ring(ctx, x, y, r, prog(lt, t, t + 0.6), col); burst(ctx, x, y, prog(lt, t, t + 0.9), col, 26, Math.floor(t * 10) + 3, r * 1.1); }
// white box around a candle's body
function boxCandle(ctx, ch, i, q, p, col = '#fff') {
  if (p <= 0) return; const x = ch.X(i), y0 = ch.Y(Math.max(q.o, q.c)), y1 = ch.Y(Math.min(q.o, q.c)), w = ch.cw() * 0.68 / 2 + 10;
  ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.strokeRect(x - w, y0 - 8, w * 2, y1 - y0 + 16); ctx.restore();
}
// dashed "imagined" candle
function ghostCandle(ctx, ch, i, q, a = 1, col = C.gold) {
  if (a <= 0) return; const x = ch.X(i), w = ch.cw() * 0.68;
  ch.clip(ctx, () => { ctx.save(); ctx.globalAlpha *= a; ctx.setLineDash([7, 6]); ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, ch.Y(q.h)); ctx.lineTo(x, ch.Y(Math.max(q.o, q.c))); ctx.moveTo(x, ch.Y(Math.min(q.o, q.c))); ctx.lineTo(x, ch.Y(q.l)); ctx.stroke();
    ctx.strokeRect(x - w / 2, ch.Y(Math.max(q.o, q.c)), w, Math.abs(ch.Y(q.c) - ch.Y(q.o))); ctx.restore(); });
}
// dashed polyline in chart space (imagined path)
function dashPath(ctx, ch, pts, p, col = C.gold, width = 5) {
  if (p <= 0) return; const xy = pts.map(([i, v]) => [ch.X(i), ch.Y(v)]);
  let tot = 0; const L = [0]; for (let k = 1; k < xy.length; k++) { tot += Math.hypot(xy[k][0] - xy[k - 1][0], xy[k][1] - xy[k - 1][1]); L.push(tot); }
  const lim = tot * clamp(p);
  ch.clip(ctx, () => { ctx.save(); ctx.setLineDash([14, 10]); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(...xy[0]);
    for (let k = 1; k < xy.length; k++) { if (L[k] <= lim) ctx.lineTo(...xy[k]); else { const t = (lim - L[k - 1]) / (L[k] - L[k - 1]); ctx.lineTo(lerp(xy[k - 1][0], xy[k][0], t), lerp(xy[k - 1][1], xy[k][1], t)); break; } }
    ctx.stroke(); ctx.restore(); });
}
// pill with a ✓ / ✗ disc on its left side
function markPill(ctx, s, x, y, p, col, ok, size = 28) {
  popT(ctx, x, y, p, () => { const w = pill(ctx, s, x, y, { size, color: col, weight: 900 }); (ok ? check : cross)(ctx, x - w / 2 - 24, y, 20, 1, ok ? C.up : C.down); });
}
function knife(ctx, x, y, rot, s = 1, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#f4f2ff'); g.addColorStop(1, '#9a94b8');
  ctx.beginPath(); ctx.moveTo(-14, -40); ctx.lineTo(14, -40); ctx.lineTo(14, 70); ctx.quadraticCurveTo(10, 120, -2, 150); ctx.lineTo(-14, 70); ctx.closePath();
  ctx.fillStyle = g; ctx.shadowColor = '#ff5a72'; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#2a1650'; rrect(ctx, -22, -50, 44, 14, 6); ctx.fill();
  ctx.fillStyle = '#3b1a78'; rrect(ctx, -16, -140, 32, 92, 12); ctx.fill(); ctx.strokeStyle = C.purple2; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
function bell(ctx, x, y, r, col = C.gold, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.moveTo(x - r, y + r * 0.6); ctx.quadraticCurveTo(x - r * 0.75, y + r * 0.35, x - r * 0.72, y - r * 0.2);
  ctx.quadraticCurveTo(x - r * 0.65, y - r, x, y - r); ctx.quadraticCurveTo(x + r * 0.65, y - r, x + r * 0.72, y - r * 0.2);
  ctx.quadraticCurveTo(x + r * 0.75, y + r * 0.35, x + r, y + r * 0.6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + r * 0.78, r * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function lockIcon(ctx, x, y, s, open, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s * 0.16; ctx.shadowColor = col; ctx.shadowBlur = 20;
  ctx.beginPath(); const lift = open * s * 0.35; ctx.arc(x, y - s * 0.25 - lift, s * 0.36, Math.PI, open > 0.5 ? Math.PI * 1.85 : Math.PI * 2); if (open <= 0.5) ctx.lineTo(x + s * 0.36, y - s * 0.1); ctx.moveTo(x - s * 0.36, y - s * 0.25 - lift); ctx.lineTo(x - s * 0.36, y - s * 0.1); ctx.stroke();
  rrect(ctx, x - s * 0.55, y - s * 0.12, s * 1.1, s * 0.8, s * 0.12); ctx.fill(); ctx.restore();
}
// mini candle sketch (units: y up). list = [[o,h,l,c]], level in units, p reveals candles
function miniCandles(ctx, x0, yb, u, dx, list, level, p, o = {}) {
  const { hiLast = true } = o, n = list.length, shown = p * n;
  const Y = v => yb - v * u;
  ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.shadowColor = C.gold; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.moveTo(x0 - dx * 0.6, Y(level)); ctx.lineTo(x0 + dx * (n - 0.4), Y(level)); ctx.stroke(); ctx.restore();
  list.forEach(([op, h, l, c], k) => {
    const f = clamp(shown - k); if (f <= 0) return;
    const q = f < 1 ? formCandle({ o: op, h, l, c }, f) : { o: op, h, l, c }, x = x0 + k * dx, col = q.c >= q.o ? C.up : C.down, last = hiLast && k === n - 1 && f >= 1;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 4; if (last) { ctx.shadowColor = col; ctx.shadowBlur = 24; }
    ctx.beginPath(); ctx.moveTo(x, Y(q.h)); ctx.lineTo(x, Y(q.l)); ctx.stroke(); ctx.fillRect(x - dx * 0.32, Y(Math.max(q.o, q.c)), dx * 0.64, Math.max(3, Math.abs(Y(q.c) - Y(q.o)))); ctx.restore();
  });
}
const pct = (a, b) => ((b - a) / a * 100).toFixed(1) + '%';

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('יקרה'), type: 'impact', k: 1.2 }, { lt: s.cue('ניתוח'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, exp = s.cue('יקרה'), an = s.cue('ניתוח'), wrong = s.cue('נכון');
      drawBG(ctx, s.t, { hue: 30 });
      stdChart(ch, lt, [[0, 6, 34], [d, 10, 36]], { p: [57600, 67200] });
      ch.draw(ctx, { reveal: lerp(24, 27.6, prog(lt, 0, d)), dim: 0.25 });
      ch.hline(ctx, K_LVL, 8, 36, { color: C.gold, width: 3, dash: [12, 10], alpha: 0.7 });
      scrim(ctx, 0.3 * prog(lt, exp - 0.2, exp + 0.3));
      wipeText(ctx, 'הטעות הכי יקרה שלי', W / 2, 300, prog(lt, 0, 0.35), { size: 74, weight: 900, color: '#ff5a72', glow: 30, glowColor: C.down });
      if (lt > exp) ring(ctx, W / 2, 300, 520, prog(lt, exp, exp + 0.7), C.down);
      const pa = prog(lt, an - 0.05, an + 0.3);
      if (pa > 0) popT(ctx, W / 2, 820, pa, () => {
        glass(ctx, 170, 720, 740, 200, 34, { border: 'rgba(255,255,255,0.35)' });
        text(ctx, 'ניתוח לא נכון', W / 2, 820, { size: 92, weight: 900, color: '#fff' });
        const ps = prog(lt, wrong, wrong + 0.3); if (ps > 0) { ctx.save(); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.shadowColor = C.down; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(250, 826); ctx.lineTo(lerp(250, 830, E.outCubic(ps)), 814); ctx.stroke(); ctx.restore(); }
      });
      if (lt > wrong) popT(ctx, W / 2, 1010, prog(lt, wrong, wrong + 0.3), () => pill(ctx, 'זו לא הייתה הבעיה', W / 2, 1010, { size: 44, color: C.purple, glow: 40 }));
    },
  },
  hook2: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('מוקדמת'), type: 'pop' }, { lt: s.cue('סכין'), type: 'impact', k: 1.4 }, { lt: s.cue('ליפול'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, early = s.cue('מוקדמת'), kn = s.cue('סכין'), fall = s.cue('ליפול');
      drawBG(ctx, s.t, { hue: 30 });
      stdChart(ch, lt, [[0, 10, 36], [kn, 12, 36], [d, 14, 38]], { p: [57600, 67200] });
      const rev = kf(lt, [[0, 25.95], [early - 0.2, 26.98], [kn, 27.6], [fall - 0.4, 30], [d, 33.5]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === K_BI && lt > early });
      ch.hline(ctx, K_LVL, 8, 38, { color: C.gold, width: 3, dash: [12, 10], alpha: 0.7 });
      const last = KC[Math.min(KC.length - 1, Math.floor(rev))];
      if (lt > early) {
        ch.hline(ctx, K_BUY, K_BI, 38, { color: '#fff', width: 3, dash: [8, 8], progress: prog(lt, early, early + 0.5) });
        ch.dot(ctx, K_BI, K_BUY, prog(lt, early, early + 0.3), '#fff', 11);
        popT(ctx, ch.X(30), ch.Y(62900), prog(lt, early, early + 0.3), () => pill(ctx, 'BUY', ch.X(30), ch.Y(62900), { size: 32, color: '#0b8f63' }));
        cross(ctx, ch.X(30) + 78, ch.Y(62900), 22, prog(lt, fall, fall + 0.3));
      }
      if (rev > 27) ch.zone(ctx, K_BUY, Math.min(K_BUY, last.c), K_BI, rev, { color: C.down, alpha: 0.18 });
      wipeText(ctx, 'כניסה מוקדמת מדי', W / 2, 300, prog(lt, early - 0.1, early + 0.25) * (1 - prog(lt, kn - 0.2, kn)), { size: 70, weight: 900, color: C.gold });
      wipeText(ctx, 'סכין נופלת', W / 2, 300, prog(lt, kn - 0.05, kn + 0.25), { size: 90, weight: 900, color: '#ff5a72', glow: 40, glowColor: C.down });
      // the knife itself drops down the right side
      const pk = prog(lt, kn - 0.1, d);
      if (pk > 0) knife(ctx, 800, lerp(560, 1080, E.inOut(pk)), 0.12 + Math.sin(lt * 7) * 0.05, 0.9, clamp(pk * 5));
      if (lt > kn) { flashCol(ctx, lt, kn); hit(ctx, W / 2, 300, lt, kn, C.down, 300); }
      if (rev > 28) popT(ctx, W / 2, 1268, prog(lt, fall - 0.2, fall + 0.1), () => pill(ctx, pct(K_BUY, last.c), W / 2, 1268, { size: 40, color: '#d61f45', fam: MONO, glow: 40 }));
    },
  },
  hook3: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('כלל'), type: 'pop' }, { lt: s.cue('מנחש'), type: 'pop' }, { lt: s.cue('מגיב'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, rule = s.cue('כלל'), brk = s.cue('שובר'), gs = s.cue('מנחש'), re = s.cue('מגיב');
      drawBG(ctx, s.t, { glow: 1.3 });
      wipeText(ctx, 'מאז · כלל אחד', W / 2, 300, prog(lt, 0.05, 0.4), { size: 60, weight: 900, color: C.neon });
      popT(ctx, W / 2, 600, prog(lt, rule - 0.05, rule + 0.3), () => text(ctx, 'כלל אחד', W / 2, 600, { size: 170, weight: 900, glow: 50, glowColor: C.purple }));
      ring(ctx, W / 2, 600, 560, prog(lt, rule, rule + 0.7));
      text(ctx, 'שאני לא שובר', W / 2, 740, { size: 52, weight: 800, color: C.purple2, alpha: prog(lt, brk - 0.1, brk + 0.3) });
      const card = (y, t, col, ok, p) => popT(ctx, W / 2, y, p, () => { glass(ctx, 160, y - 85, 760, 170, 36, { border: col, glowColor: col }); text(ctx, t, 600, y, { size: 84, weight: 900, color: '#fff' }); (ok ? check : cross)(ctx, 270, y, 50, 1); });
      card(940, 'לא מנחש', '#ff5a72', false, prog(lt, gs - 0.1, gs + 0.25));
      card(1160, 'מגיב', '#3df2a6', true, prog(lt, re - 0.1, re + 0.25));
      if (lt > re) { hit(ctx, W / 2, 1160, lt, re, C.up, 380); flashCol(ctx, lt, re, '22,199,132', 0.18); }
    },
  },
  intro: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('השני'), type: 'pop' }, { lt: s.cue('האישור'), type: 'impact', k: 1.1 }, { lt: s.cue('המפה'), type: 'pop' }, { lt: s.cue('מתי'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, two = s.cue('השני'), pa = s.cue('Price'), cf = s.cue('האישור'), en = s.cue('Confirmation'), map = s.cue('המפה'), where = s.cue('איפה'), when = s.cue('מתי');
      drawBG(ctx, s.t, { glow: 1.25 });
      wipeText(ctx, 'עמוד 2 מתוך 4', W / 2, 300, prog(lt, two - 0.05, two + 0.35), { size: 62, weight: 900, color: C.neon });
      seriesMap(ctx, lt, 1, pa - 0.2, 1130, { series: PILLARS, done: 1 });
      // pillar card
      const p = prog(lt, cf - 0.05, cf + 0.4); if (p <= 0) return;
      const e = E.outBack(p), y = 420;
      ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(W / 2, y + 220); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); ctx.translate(-W / 2, -(y + 220));
      glass(ctx, 90, y, 900, 450, 36, { border: 'rgba(200,150,255,0.6)', glow: 60 });
      text(ctx, 'PILLAR 2', 930, y + 60, { size: 26, weight: 800, color: C.purple2, align: 'right', spacing: 8 });
      text(ctx, 'אישור', 930, y + 140, { size: 92, weight: 900, align: 'right', glow: 24, glowColor: C.purple });
      text(ctx, 'CONFIRMATION', 150, y + 140, { size: 50, weight: 900, color: C.neon, align: 'left', alpha: prog(lt, en - 0.1, en + 0.3), spacing: lerp(16, 2, E.outExpo(prog(lt, en - 0.1, en + 0.6))) });
      ctx.fillStyle = 'rgba(200,150,255,0.25)'; ctx.fillRect(130, y + 200, 820, 2);
      const row = (yy, k, v, col, t0, icon) => { const pr = prog(lt, t0 - 0.05, t0 + 0.35); if (pr <= 0) return;
        ctx.save(); ctx.globalAlpha *= clamp(pr * 2); ctx.translate((1 - E.outCubic(pr)) * 60, 0);
        text(ctx, k, 930, yy, { size: 46, weight: 900, color: col, align: 'right' }); text(ctx, v, 930 - measure(ctx, k, 46, 900) - 24, yy, { size: 46, weight: 700, color: '#fff', align: 'right' });
        ctx.restore(); icon(pr, yy); };
      row(y + 285, 'המפה', 'איפה להסתכל', C.purple2, map, (pr, yy) => { ctx.save(); ctx.globalAlpha *= pr; ctx.beginPath(); ctx.arc(190, yy, 30, 0, Math.PI * 2); ctx.fillStyle = C.violet; ctx.fill(); ctx.restore(); text(ctx, '1', 190, yy + 2, { size: 34, weight: 900, fam: MONO, alpha: pr }); });
      row(y + 380, 'האישור', 'מתי לפעול', C.gold, when, (pr, yy) => check(ctx, 190, yy, 30, pr, '#d4a017'));
      if (lt > where) ring(ctx, 640, y + 285, 200, prog(lt, where, where + 0.5), C.purple2);
      ctx.restore();
      if (lt > when) hit(ctx, 640, y + 380, lt, when, C.gold, 260);
    },
  },

  // ================= CH1: the falling knife =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 6, 'הסכין הנופלת', 'THE FALLING KNIFE', { cueWord: 'הסכין' }); } },
  k1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('ירד'), type: 'whoosh' }, { lt: s.cue('בטוח'), type: 'pop' }, { lt: s.cue('הזדמנות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, dn = s.cue('ירד'), fast = s.cue('ומהר'), sure = s.cue('בטוח'), more = s.cue('לרדת'), opp = s.cue('הזדמנות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 30], [d, 8, 32]], { p: [58600, 67000] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 21.5], [fast + 0.4, 24.5], [sure, 25.4], [d, 26.98]], E.lin)[0] });
      ch.hline(ctx, K_LVL, 8, 32, { color: C.gold, width: 4, dash: [12, 10], progress: prog(lt, 0.1, 0.6) });
      ch.tag(ctx, 8, K_LVL, 'תמיכה', prog(lt, 0.2, 0.5), { color: '#b8860b', above: false, size: 26, off: 42 });
      arrow(ctx, ch.X(20), ch.Y(66300), ch.X(26), ch.Y(63000), prog(lt, dn, fast + 0.5), { color: 'rgba(255,90,114,0.9)', width: 9, head: 30 });
      popT(ctx, ch.X(27.5), ch.Y(64900), prog(lt, fast, fast + 0.3), () => pill(ctx, 'חזק ומהר', ch.X(27.5), ch.Y(64900), { size: 30, color: '#d61f45' }));
      // the thought bubble
      const pb = prog(lt, sure - 0.05, sure + 0.3);
      if (pb > 0) popT(ctx, 560, 1110, pb, () => {
        glass(ctx, 250, 1035, 620, 150, 40, { border: 'rgba(255,201,77,0.6)', glowColor: 'rgba(255,201,77,0.4)' });
        [[270, 1200, 14], [240, 1235, 9]].forEach(([x, y, r]) => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(18,12,36,0.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,201,77,0.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); });
        text(ctx, 'הוא לא יכול לרדת יותר', 560, 1092, { size: 46, weight: 900, color: '#fff', alpha: prog(lt, more - 0.4, more) });
        text(ctx, 'אני בטוח', 560, 1145, { size: 34, weight: 800, color: C.gold });
      });
      badge(ctx, 'סיפור אמיתי · הטרייד שלי', prog(lt, 0, 0.35) * (1 - prog(lt, opp - 0.2, opp)), C.purple, 300, W / 2, 42);
      popT(ctx, W / 2, 300, prog(lt, opp - 0.05, opp + 0.3), () => pill(ctx, 'זו הזדמנות?', W / 2, 300, { size: 54, color: '#b8860b', glow: 50 }));
    },
  },
  k2: {
    trans: 'none',
    events: s => [{ lt: s.cue('קניתי'), type: 'pop' }, { lt: s.cue('סימן'), type: 'pop' }, { lt: s.cue('ועוד'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, buy = s.cue('קניתי'), sig = s.cue('סימן'), more = s.cue('עוד'), more2 = s.cue('ועוד');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 32], [more, 12, 36], [d, 14, 38]], { p: [57400, 67000] });
      const rev = kf(lt, [[0, 26.98], [sig, 27.0], [more - 0.2, 28.5], [more2 - 0.2, 31], [d, 33.98]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === K_BI });
      ch.hline(ctx, K_LVL, 8, 38, { color: C.gold, width: 3, dash: [12, 10], alpha: 0.7 });
      ch.hline(ctx, K_BUY, K_BI, 38, { color: '#fff', width: 3, dash: [8, 8], progress: prog(lt, buy, buy + 0.5) });
      ch.dot(ctx, K_BI, K_BUY, prog(lt, buy, buy + 0.3), '#fff', 11);
      const last = KC[Math.min(KC.length - 1, Math.floor(rev))];
      if (rev > 27.05) ch.zone(ctx, K_BUY, Math.min(K_BUY, last.c), K_BI, rev, { color: C.down, alpha: 0.2 });
      popT(ctx, ch.X(31), ch.Y(63100), prog(lt, buy, buy + 0.3), () => pill(ctx, 'BUY · קניתי', ch.X(31), ch.Y(63100), { size: 30, color: '#0b8f63' }));
      cross(ctx, ch.X(31) + 130, ch.Y(63100), 22, prog(lt, more2, more2 + 0.3));
      if (lt > more2) { flashCol(ctx, lt, more2); hit(ctx, ch.X(31), ch.Y(last.c), lt, more2, C.down, 200); }
      popT(ctx, ch.X(33), ch.Y(last.c) + 70, prog(lt, more - 0.1, more + 0.2), () => pill(ctx, pct(K_BUY, last.c), ch.X(33), ch.Y(last.c) + 70, { size: 32, color: '#d61f45', fam: MONO }));
      markPill(ctx, 'אין סימן שהירידה נעצרה', W / 2 + 22, 300, prog(lt, sig - 0.05, sig + 0.3), '#3b1a78', false, 38);
    },
  },
  k3: {
    trans: 'none',
    events: s => [{ lt: s.cue('יצאתי'), type: 'pop' }, { lt: s.cue('ההפסד'), type: 'pop' }, { lt: s.cue('קורס'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, ex = s.cue('יצאתי'), small = s.cue('קטן'), loss = s.cue('ההפסד'), cr = s.cue('קורס');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 38], [d, 16, 40]], { p: [57400, 66200] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 33.98], [ex, 35.0], [small, 35.98], [d, 36.3]], E.lin)[0], highlight: i => i === K_XI && lt > small });
      ch.hline(ctx, K_LVL, 8, 40, { color: C.gold, width: 3, dash: [12, 10], alpha: 0.6 });
      ch.hline(ctx, K_BUY, K_BI, 40, { color: '#fff', width: 3, dash: [8, 8] });
      ch.dot(ctx, K_BI, K_BUY, 1, '#fff', 11);
      popT(ctx, ch.X(31), ch.Y(63100), 1, () => pill(ctx, 'BUY · קניתי', ch.X(31), ch.Y(63100), { size: 30, color: '#555' }));
      ch.zone(ctx, K_BUY, K_EXIT, K_BI, K_XI, { color: C.down, alpha: 0.22, progress: prog(lt, small, small + 0.5) });
      if (lt > small) { ch.dot(ctx, K_XI, K_EXIT, prog(lt, small, small + 0.3), '#ff5a72', 12);
        popT(ctx, ch.X(K_XI + 2), ch.Y(58950), prog(lt, small, small + 0.3), () => pill(ctx, 'יציאה בתיקון', ch.X(K_XI + 2), ch.Y(58950), { size: 28, color: '#d61f45' })); }
      // loss bracket
      const pl = prog(lt, loss - 0.1, loss + 0.4);
      if (pl > 0) { const x = ch.X(K_XI + 2.4), y0 = ch.Y(K_BUY), y1 = lerp(y0, ch.Y(K_EXIT), E.outCubic(pl));
        ctx.save(); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 5; ctx.shadowColor = C.down; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(x - 14, y0); ctx.lineTo(x, y0); ctx.lineTo(x, y1); ctx.lineTo(x - 14, y1); ctx.stroke(); ctx.restore();
        popT(ctx, x + 2, (y0 + y1) / 2, prog(lt, loss + 0.2, loss + 0.5), () => pill(ctx, pct(K_BUY, K_EXIT), x + 2, (ch.Y(K_BUY) + ch.Y(K_EXIT)) / 2, { size: 30, color: '#d61f45', fam: MONO })); }
      popT(ctx, W / 2, 300, prog(lt, cr - 0.4, cr), () => pill(ctx, 'השיעור הכי יקר שקיבלתי', W / 2, 300, { size: 46, color: '#b8860b', glow: 45 }));
      text(ctx, 'הפסד', W / 2, 300, { size: 64, weight: 900, color: '#ff5a72', alpha: prog(lt, loss - 0.05, loss + 0.25) * (1 - prog(lt, cr - 0.5, cr - 0.3)), glow: 30, glowColor: C.down });
    },
  },
  k4: {
    trans: 'none',
    events: s => [{ lt: s.cue('המקום'), type: 'pop' }, { lt: s.cue('שחשבתי'), type: 'whoosh' }, { lt: s.cue('באמת'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chK, place = s.cue('המקום'), thought = s.cue('שחשבתי'), real = s.cue('באמת'), hap = s.cue('קרה', 1);
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 40], [real, 16, 46], [d, 18, 52]], { p: [57400, 66800] });
      const rev = kf(lt, [[0, 36.3], [real, 36.5], [hap - 0.25, 45.98], [d, 47]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === K_RI && lt > hap - 0.2 });
      const lp = prog(lt, place, place + 0.3);
      ch.hline(ctx, K_LVL, 8, 52, { color: C.gold, width: 3 + 3 * lp, dash: lp > 0 ? null : [12, 10], glow: 10 + 20 * lp });
      popT(ctx, ch.p.x + 125, ch.Y(K_LVL) + 52, lp, () => pill(ctx, 'המקום נכון ✓', ch.p.x + 125, ch.Y(K_LVL) + 52, { size: 28, color: '#b8860b' }));
      ch.hline(ctx, K_BUY, K_BI, 38, { color: '#fff', width: 3, dash: [8, 8], alpha: 0.6 });
      ch.dot(ctx, K_BI, K_BUY, 1, '#fff', 11);
      // what I thought would happen (dashed bounce) vs what really happened
      const pt = prog(lt, thought - 0.1, thought + 0.7), fade = 1 - 0.6 * prog(lt, real, real + 0.4);
      ctx.save(); ctx.globalAlpha *= fade; dashPath(ctx, ch, [[K_BI, K_BUY], [29, 63600], [32, 63100], [36, 65200]], pt, C.gold, 6); ctx.restore();
      popT(ctx, ch.X(31), ch.Y(65400), prog(lt, thought + 0.2, thought + 0.5) * fade, () => pill(ctx, 'מה שחשבתי שיקרה', ch.X(31), ch.Y(65400), { size: 28, color: '#b8860b' }));
      popT(ctx, ch.X(37), ch.Y(57950), prog(lt, real - 0.05, real + 0.3), () => pill(ctx, 'מה שבאמת קרה', ch.X(37), ch.Y(57950), { size: 28, color: '#d61f45' }));
      if (lt > hap - 0.2) { const q = KC[K_RI]; boxCandle(ctx, ch, K_RI, q, prog(lt, hap - 0.2, hap + 0.1), '#3df2a6'); hit(ctx, ch.X(K_RI), ch.Y(q.c), lt, hap - 0.2, C.up, 200);
        popT(ctx, ch.X(K_RI - 4), ch.Y(62800), prog(lt, hap - 0.2, hap + 0.1), () => pill(ctx, 'כאן היה האישור ✓', ch.X(K_RI - 4), ch.Y(62800), { size: 28, color: '#0b8f63' })); }
      wipeText(ctx, 'הבעיה הייתה התזמון', W / 2, 300, prog(lt, thought - 0.6, thought - 0.2), { size: 62, weight: 900, color: C.neon });
    },
  },

  // ================= CH2: guess vs reaction =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 6, 'ניחוש מול תגובה', 'GUESS VS REACTION', { cueWord: 'ניחוש' }); } },
  p1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('לרמה'), type: 'pop' }, { lt: s.cue('יקפוץ'), type: 'whoosh' }, { lt: s.cue('מוקדם'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, near = s.cue('מתקרב'), lvl = s.cue('לרמה'), jump = s.cue('יקפוץ'), early = s.cue('מוקדם');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 22], [d, 2, 24]], { p: [60600, 65800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 7], [near, 10], [jump, 12.5], [early, 13.98], [d, 14.2]], E.lin)[0] });
      ch.hline(ctx, P_LVL, 0, 24, { color: C.gold, width: 5, progress: prog(lt, lvl - 0.1, lvl + 0.5) });
      ch.tag(ctx, 6, P_LVL, 'רמה', prog(lt, lvl, lvl + 0.3), { color: '#b8860b', above: false, size: 26, off: 40 });
      arrow(ctx, ch.X(13), ch.Y(62300), ch.X(18), ch.Y(64700), prog(lt, jump, jump + 0.6), { color: 'rgba(255,201,77,0.75)', width: 8, head: 28 });
      popT(ctx, ch.X(19), ch.Y(65150), prog(lt, jump + 0.2, jump + 0.5), () => pill(ctx, 'הוא יקפוץ!', ch.X(19), ch.Y(65150), { size: 28, color: '#b8860b' }));
      if (lt > early) { ch.dot(ctx, 13, P_BUY, prog(lt, early, early + 0.3), '#fff', 11);
        popT(ctx, ch.X(17), ch.Y(P_BUY), prog(lt, early, early + 0.3), () => pill(ctx, 'BUY מוקדם', ch.X(17), ch.Y(P_BUY), { size: 28, color: '#0b8f63' }));
        const yA = ch.Y(P_BUY), yB = ch.Y(P_LVL); ctx.save(); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(ch.X(14), yA); ctx.lineTo(ch.X(14), yB); ctx.stroke(); ctx.restore(); }
      badge(ctx, 'ככה זה נראה בלי אישור', prog(lt, 0, 0.35), '#d61f45', 300, W / 2, 42);
    },
  },
  p2: {
    trans: 'none',
    events: s => [{ lt: s.cue('קרתה'), type: 'pop' }, { lt: s.cue('הגרף'), type: 'impact', k: 1 }, { lt: s.cue('חושב'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chA, run = s.cue('רץ'), notyet = s.cue('קרתה'), chart = s.cue('הגרף'), think = s.cue('חושב');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 24], [chart, 4, 26], [d, 5, 27]], { p: [59600, 65800] });
      const rev = kf(lt, [[0, 14.2], [notyet, 15], [chart, 16.98], [think, 21], [d, 25]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === 16 && lt > chart });
      ch.hline(ctx, P_LVL, 0, 27, { color: lt > chart ? C.down : C.gold, width: 5 });
      ch.dot(ctx, 13, P_BUY, 1, '#fff', 11);
      ch.hline(ctx, P_BUY, 13, 27, { color: '#fff', width: 3, dash: [8, 8], alpha: 0.7 });
      popT(ctx, ch.X(17), ch.Y(P_BUY) - 46, 1, () => pill(ctx, 'BUY מוקדם', ch.X(17), ch.Y(P_BUY) - 46, { size: 26, color: lt > chart ? '#555' : '#0b8f63' }));
      cross(ctx, ch.X(17) + 100, ch.Y(P_BUY) - 46, 20, prog(lt, chart, chart + 0.3));
      // the imagined move (dashed) you run ahead of
      const ga = 1 - 0.55 * prog(lt, chart, chart + 0.4);
      ctx.save(); ctx.globalAlpha *= ga; dashPath(ctx, ch, [[13, P_BUY], [16, 63300], [20, 64900]], prog(lt, run, run + 0.8), C.gold, 6); ctx.restore();
      popT(ctx, ch.X(21), ch.Y(65300), prog(lt, notyet, notyet + 0.3) * ga, () => pill(ctx, 'עוד לא קרה', ch.X(21), ch.Y(65300), { size: 28, color: '#b8860b' }));
      if (lt > chart) { hit(ctx, ch.X(16), ch.Y(P_LVL), lt, chart, C.down, 200);
        popT(ctx, ch.X(21), ch.Y(59950), prog(lt, chart, chart + 0.3), () => pill(ctx, 'מה שהגרף עושה', ch.X(21), ch.Y(59950), { size: 28, color: '#d61f45' })); }
      popT(ctx, W / 2, 300, prog(lt, think - 0.05, think + 0.3), () => pill(ctx, 'סוחר את מה שאתה חושב', W / 2, 300, { size: 46, color: '#b8860b', glow: 45 }));
      badge(ctx, 'רץ לפני התנועה', prog(lt, run, run + 0.35) * (1 - prog(lt, think - 0.25, think - 0.05)), C.purple, 300, W / 2, 42);
    },
  },
  p3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('אחד'), type: 'pop' }, { lt: s.cue('השני'), type: 'pop' }, { lt: s.cue('להוכחה'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, one = s.cue('אחד'), two = s.cue('השני'), proof = s.cue('להוכחה');
      drawBG(ctx, s.t);
      [[chA, PANEL_TOP, one, 22], [chB, PANEL_BOT, two, 21]].forEach(([ch, pn, t, end]) => {
        ch.layout(...pn, { head: 80, foot: 40 }).view(...kf(lt, [[0, 4, 24], [d, 6, 25]]), 59700, 65400);
        ch.draw(ctx, { reveal: kf(lt, [[0, 13.98], [t, 14.5], [t + 1.2, end], [d, end + 0.5]], E.lin)[0], highlight: i => ch === chB && i === 17 && lt > two + 0.6 });
        ch.hline(ctx, P_LVL, 0, 25, { color: C.gold, width: 4 });
      });
      // top: guess -> buy before the level
      chA.dot(ctx, 13, P_BUY, prog(lt, one, one + 0.3), '#fff', 10);
      popT(ctx, chA.X(10), chA.Y(P_BUY) - 30, prog(lt, one, one + 0.3), () => pill(ctx, 'BUY', chA.X(10), chA.Y(P_BUY) - 30, { size: 24, color: '#555' }));
      // bottom: reaction -> buy after the close above
      if (lt > two + 0.6) { boxCandle(ctx, chB, 17, BC[17], prog(lt, two + 0.6, two + 0.9), '#3df2a6');
        chB.dot(ctx, 18, BC[17].c, prog(lt, proof, proof + 0.3), '#fff', 10);
        popT(ctx, chB.X(20), chB.Y(BC[17].c) - 70, prog(lt, proof, proof + 0.3), () => pill(ctx, 'BUY אחרי סגירה', chB.X(20), chB.Y(BC[17].c) - 70, { size: 24, color: '#0b8f63' })); }
      const lab = (ch, t1, t2, col, ok, p) => { const x = ch.p.x + ch.p.w - 140, y = ch.p.y + 36;
        popT(ctx, x, y, p, () => { text(ctx, t1, x + 120, y, { size: 38, weight: 900, color: col, align: 'right' }); text(ctx, t2, x + 120 - measure(ctx, t1, 38, 900) - 18, y, { size: 30, weight: 700, color: '#fff', align: 'right' }); }); };
      lab(chA, 'ניחוש', 'הימור על דעה', '#ff5a72', false, prog(lt, one - 0.05, one + 0.3));
      cross(ctx, chA.p.x + 60, chA.p.y + 150, 30, prog(lt, one + 0.4, one + 0.7));
      lab(chB, 'תגובה', 'תגובה להוכחה', '#3df2a6', true, prog(lt, two - 0.05, two + 0.3));
      check(ctx, chB.p.x + 60, chB.p.y + 150, 30, prog(lt, proof, proof + 0.3));
      if (lt > proof) hit(ctx, chB.X(17), chB.Y(BC[17].c), lt, proof, C.up, 220);
      badge(ctx, 'שני עולמות', prog(lt, 0, 0.35), C.purple, 268, W / 2, 40);
    },
  },

  // ================= CH3: what confirmation is =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 6, 'מה זה אישור', 'WHAT IS CONFIRMATION', { cueWord: 'מה' }); } },
  c1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('מראש'), type: 'pop' }, { lt: s.cue('צריך'), type: 'tick' }, { lt: s.cue('קורה'), type: 'click' }, { lt: s.cue('מותר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, before = s.cue('לפני'), adv = s.cue('מראש'), must = s.cue('צריך'), at = s.cue('ברמה'), hap = s.cue('קורה'), ok = s.cue('מותר'), enter = s.cue('להיכנס');
      drawBG(ctx, s.t, { glow: 1.15 });
      wipeText(ctx, 'מחליטים מראש', W / 2, 300, prog(lt, adv - 0.1, adv + 0.3), { size: 72, weight: 900, color: C.neon });
      // trade plan card
      const pc = prog(lt, before, before + 0.4);
      if (pc > 0) popT(ctx, W / 2, 690, pc, () => {
        glass(ctx, 110, 440, 860, 500, 34, { border: 'rgba(200,150,255,0.6)' });
        text(ctx, 'התוכנית שלי', 920, 500, { size: 40, weight: 900, color: C.purple2, align: 'right' });
        text(ctx, 'TRADE PLAN', 160, 500, { size: 24, weight: 800, color: C.axis, align: 'left', spacing: 6 });
        ctx.fillStyle = 'rgba(200,150,255,0.25)'; ctx.fillRect(150, 545, 780, 2);
        const row = (y, k, p) => { text(ctx, k, 920, y, { size: 40, weight: 800, color: C.axis, align: 'right', alpha: p }); rrect(ctx, 160, y - 40, 560, 80, 16); ctx.save(); ctx.globalAlpha *= p; ctx.fillStyle = '#0d0a19'; ctx.fill(); ctx.strokeStyle = 'rgba(168,85,247,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); };
        row(630, 'רמה', 1); row(745, 'תנאי', 1); row(860, 'כניסה', 1);
        text(ctx, '60,000', 690, 630, { size: 46, weight: 800, fam: MONO, color: C.gold, align: 'right', alpha: prog(lt, at - 0.6, at - 0.3) });
        const cond = 'סגירה יומית מעל הרמה', n = Math.floor(prog(lt, must, must + 1.1) * cond.length);
        text(ctx, cond.slice(0, n) + (n < cond.length && n > 0 && Math.floor(lt * 4) % 2 ? '|' : ''), 690, 745, { size: 40, weight: 800, color: '#fff', align: 'right' });
        const op = prog(lt, hap, hap + 0.4), col = op > 0.5 ? C.up : '#ff5a72';
        lockIcon(ctx, 640, 870, 54, op, col);
        text(ctx, op > 0.5 ? 'פתוח' : 'נעול', 560, 862, { size: 40, weight: 900, color: col, align: 'right' });
      });
      // flow chips: define -> it happens -> enter
      [['מגדירים', adv], ['זה קורה', hap], ['נכנסים', enter]].forEach(([t, t0], k) => {
        const x = 830 - k * 300, p = prog(lt, t0 - 0.05, t0 + 0.3), on = lt > t0;
        popT(ctx, x, 1080, p, () => pill(ctx, t, x, 1080, { size: 40, color: on ? (k === 2 ? '#0b8f63' : C.purple) : '#333', glow: 30 }));
        if (k < 2) arrow(ctx, x - 100, 1080, x - 195, 1080, prog(lt, t0 + 0.2, t0 + 0.5), { color: C.purple2, width: 6, head: 22 });
      });
      popT(ctx, W / 2, 1230, prog(lt, ok - 0.05, ok + 0.3), () => pill(ctx, 'רק אז מותר להיכנס ✓', W / 2, 1230, { size: 46, color: '#0b8f63', glow: 45 }));
      if (lt > ok) ring(ctx, W / 2, 1230, 420, prog(lt, ok, ok + 0.7), C.up);
    },
  },
  c2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נראה'), type: 'pop' }, { lt: s.cue('מוגדרת'), type: 'impact', k: 1 }, { lt: s.cue('החזקה'), type: 'pop' }, { lt: s.cue('ריקליים'), type: 'pop' }, { lt: s.cue('פריצה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, looks = s.cue('נראה'), def = s.cue('מוגדרת'), hold = s.cue('החזקה'), rec = s.cue('ריקליים'), br = s.cue('פריצה');
      drawBG(ctx, s.t, { glow: 1.15 });
      const pv = prog(lt, looks - 0.05, looks + 0.3) * (1 - prog(lt, def - 0.3, def - 0.05));
      markPill(ctx, '"נראה חזק"', W / 2 + 26, 300, pv, '#555', false, 50);
      if (pv > 0 && lt > looks + 0.3) { ctx.save(); ctx.globalAlpha *= pv; ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(W / 2 - 110, 304); ctx.lineTo(W / 2 + 160, 296); ctx.stroke(); ctx.restore(); }
      popT(ctx, W / 2, 300, prog(lt, def - 0.05, def + 0.3), () => pill(ctx, 'פעולה מוגדרת', W / 2, 300, { size: 56, color: C.purple, glow: 50 }));
      if (lt > def) ring(ctx, W / 2, 300, 480, prog(lt, def, def + 0.7));
      const cards = [
        { t: hold, he: 'החזקה', en: 'HOLD', lv: 40, list: [[75, 78, 60, 62], [62, 64, 47, 50], [50, 53, 33, 47], [47, 70, 46, 68]] },
        { t: rec, he: 'Reclaim', en: 'RECLAIM', lv: 46, list: [[62, 64, 48, 50], [50, 51, 30, 33], [33, 40, 27, 37], [37, 58, 35, 56]] },
        { t: br, he: 'פריצה וריטסט', en: 'BREAK & RETEST', lv: 60, list: [[40, 48, 37, 46], [46, 58, 44, 55], [55, 75, 53, 72], [72, 73, 58, 63], [63, 82, 62, 80]] },
      ];
      cards.forEach((c, k) => {
        const x = 830 - k * 290, p = prog(lt, c.t - 0.1, c.t + 0.3); if (p <= 0) return;
        popT(ctx, x, 800, p, () => {
          glass(ctx, x - 135, 440, 270, 720, 30, { border: lt > c.t + 1 ? 'rgba(61,242,166,0.6)' : 'rgba(200,150,255,0.5)' });
          ctx.save(); ctx.beginPath(); ctx.arc(x, 500, 30, 0, Math.PI * 2); ctx.fillStyle = C.violet; ctx.shadowColor = C.purple; ctx.shadowBlur = 20; ctx.fill(); ctx.restore();
          text(ctx, String(k + 1), x, 502, { size: 34, weight: 900, fam: MONO });
          const n = c.list.length, dx = 200 / n;
          miniCandles(ctx, x - 100 + dx / 2, 950, 4.2, dx, c.list, c.lv, prog(lt, c.t, c.t + 1.2));
          text(ctx, c.he, x, 1030, { size: c.he.length > 8 ? 38 : 46, weight: 900, color: '#fff' });
          text(ctx, c.en, x, 1090, { size: c.en.length > 8 ? 22 : 28, weight: 800, color: C.purple2, spacing: 2 });
        });
        check(ctx, x + 95, 1140, 22, prog(lt, c.t + 1.1, c.t + 1.4));
      });
    },
  },
  c3: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('קרה'), type: 'pop' }, { lt: s.cue('מקווה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, done = s.cue('קרה'), hope = s.cue('מקווה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 32], [d, 14, 33]], { p: [58600, 62600] });
      ch.draw(ctx, { reveal: 26.98, dim: 0.35, highlight: i => i === D_CONF, tfs: TFS_D });
      ch.hline(ctx, LVL, 4, 33, { color: C.gold, width: 4 });
      const q = DC[D_CONF];
      boxCandle(ctx, ch, D_CONF, q, prog(lt, done - 0.1, done + 0.2), '#3df2a6');
      markPill(ctx, 'כבר קרה', ch.X(D_CONF) + 18, ch.Y(59250), prog(lt, done - 0.05, done + 0.3), '#0b8f63', true, 30);
      const ph = prog(lt, hope - 0.1, hope + 0.4);
      ghostCandle(ctx, ch, 27, { o: 60450, h: 61100, l: 60400, c: 61000 }, ph);
      ghostCandle(ctx, ch, 28, { o: 61000, h: 61850, l: 60900, c: 61700 }, prog(lt, hope + 0.15, hope + 0.5));
      markPill(ctx, 'מקווה שיקרה', ch.X(28) - 20, ch.Y(62150), prog(lt, hope + 0.1, hope + 0.4), '#b8860b', false, 30);
      badge(ctx, 'אישור = עובדה בגרף', prog(lt, 0, 0.35), C.purple, 300, W / 2, 44);
    },
  },
  c4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('חצי'), type: 'pop' }, { lt: s.cue('נעלמות'), type: 'impact', k: 1.1 }, { lt: s.cue('היו'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, head = s.cue('לראש'), half = s.cue('חצי'), gone = s.cue('נעלמות'), were = s.cue('היו');
      drawBG(ctx, s.t);
      const bad = [1, 2, 4, 7, 9, 10];
      for (let k = 0; k < 12; k++) {
        const isBad = bad.includes(k), j = [0, 3, 5, 6, 8, 11].indexOf(k), pr = isBad ? 0 : E.inOut(prog(lt, gone + 0.35, gone + 0.9));
        const x = lerp(830 - (k % 3) * 290, W / 2 + 150 - (j % 2) * 300, pr), y = lerp(520 + Math.floor(k / 3) * 190, 620 + Math.floor(j / 2) * 190, pr);
        const p = prog(lt, 0.05 + k * 0.05, 0.35 + k * 0.05), g = isBad ? prog(lt, gone, gone + 0.5) : 0;
        if (p <= 0 || g >= 1) continue;
        const tint = isBad ? prog(lt, half, half + 0.3) : 0, good = !isBad && lt > were;
        ctx.save(); ctx.globalAlpha *= 1 - g; ctx.translate(x, y); ctx.scale(1 - 0.4 * g, 1 - 0.4 * g); ctx.translate(-x, -y);
        popT(ctx, x, y, p, () => {
          glass(ctx, x - 130, y - 75, 260, 150, 24, { border: tint > 0.5 ? 'rgba(255,90,114,0.8)' : good ? 'rgba(61,242,166,0.8)' : 'rgba(200,150,255,0.4)', glowColor: tint > 0.5 ? 'rgba(242,54,69,0.5)' : good ? 'rgba(22,199,132,0.5)' : undefined });
          text(ctx, `#${k + 1}`, x + 100, y - 36, { size: 26, weight: 800, fam: MONO, color: C.axis, align: 'right' });
          const sell = k % 4 === 3; text(ctx, sell ? 'SELL' : 'BUY', x - 100, y - 36, { size: 26, weight: 900, color: sell ? '#ff5a72' : '#3df2a6', align: 'left' });
          text(ctx, tint > 0.5 ? 'בלי אישור' : good ? 'עם אישור' : 'רעיון', x, y + 22, { size: 36, weight: 900, color: tint > 0.5 ? '#ff5a72' : good ? '#3df2a6' : '#fff' });
        });
        ctx.restore();
        if (isBad) burst(ctx, x, y, prog(lt, gone, gone + 0.8), '#ff5a72', 16, k + 5, 160);
      }
      wipeText(ctx, 'כשזה נכנס לראש', W / 2, 300, prog(lt, head - 0.3, head) * (1 - prog(lt, half - 0.2, half)), { size: 62, weight: 900, color: C.neon });
      popT(ctx, W / 2, 300, prog(lt, half - 0.05, half + 0.3), () => pill(ctx, 'חצי מהעסקאות נעלמות', W / 2, 300, { size: 48, color: '#d61f45', glow: 45 }));
      popT(ctx, W / 2, 1290, prog(lt, were - 0.05, were + 0.3), () => pill(ctx, 'הן אף פעם לא היו עסקאות', W / 2, 1290, { size: 44, color: C.purple, glow: 40 }));
    },
  },

  // ================= CH4: reclaim step by step =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 6, 'צעד אחר צעד', 'RECLAIM · STEP BY STEP', { cueWord: 'צעד' }); } },
  r1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('תמיכה'), type: 'pop' }, { lt: s.cue('שלוש'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chW, sup = s.cue('תמיכה'), wk = s.cue('שבועית'), three = s.cue('שלוש');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 32], [d, 2, 33]], { p: [55400, 64800] });
      ch.draw(ctx, { reveal: 31, tfs: TFS_D, tfFlash: lt > wk ? Math.exp(-(lt - wk) * 5) : 0 });
      ch.zone(ctx, LVL - 150, LVL + 150, 3, 33, { color: C.gold, alpha: 0.12, progress: prog(lt, sup, sup + 0.5) });
      ch.hline(ctx, LVL, 3, 33, { color: C.gold, width: 5, progress: prog(lt, sup, sup + 0.5) });
      [8, 16, 24].forEach((i, k) => {
        const t = three - 0.2 + k * 0.22, p = prog(lt, t, t + 0.3), x = ch.X(i), y = ch.Y(LVL) + 62;
        popT(ctx, x, y, p, () => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fillStyle = '#b8860b'; ctx.shadowColor = C.gold; ctx.shadowBlur = 25; ctx.fill(); ctx.restore(); text(ctx, String(k + 1), x, y + 2, { size: 32, weight: 900, fam: MONO }); });
        if (lt > t) ring(ctx, x, ch.Y(LVL), 90, prog(lt, t, t + 0.5), C.gold);
      });
      badge(ctx, 'תמיכה שבועית', prog(lt, wk - 0.05, wk + 0.3), '#b8860b', 300, W / 2, 46);
      popT(ctx, W / 2, 1268, prog(lt, three + 0.5, three + 0.8), () => pill(ctx, 'החזיקה 3 פעמים', W / 2, 1268, { size: 36, color: C.purple }));
    },
  },
  r2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נסגר'), type: 'impact', k: 1.3 }, { lt: s.cue('מסתכל'), type: 'pop' }, { lt: s.cue('נכנס'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, cl = s.cue('נסגר'), look = s.cue('מסתכל'), no = s.cue('נכנס');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 26], [cl, 6, 26], [d, 7, 28]], { p: [58200, 63400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 16.5], [cl - 0.5, 17.98], [cl, 18.98], [d, 20.3]], E.lin)[0], highlight: i => i === D_BRK && lt > cl, tfs: TFS_D, tfFlash: Math.exp(-lt * 4) });
      const broke = lt > cl;
      ch.hline(ctx, LVL, 0, 28, { color: broke ? C.down : C.gold, width: broke ? 6 : 5, glow: broke ? 26 : 16 });
      ch.tag(ctx, 10, LVL, 'תמיכה שבועית', 1, { color: '#b8860b', above: false, size: 24, off: 38 });
      if (broke) { hit(ctx, ch.X(D_BRK), ch.Y(LVL), lt, cl, C.down, 220); flashCol(ctx, lt, cl); boxCandle(ctx, ch, D_BRK, DC[D_BRK], 1);
        popT(ctx, ch.X(D_BRK), ch.Y(58750), prog(lt, cl, cl + 0.3), () => pill(ctx, 'סגירה מתחת', ch.X(D_BRK), ch.Y(58750), { size: 28, color: '#d61f45' })); }
      // status card
      const ps = prog(lt, look - 0.1, look + 0.25);
      if (ps > 0) popT(ctx, 700, 590, ps, () => { glass(ctx, 540, 500, 320, 180, 24);
        text(ctx, 'מסתכל', 790, 555, { size: 40, weight: 900, align: 'right' }); check(ctx, 590, 555, 22, 1, C.purple);
        text(ctx, 'נכנס', 790, 630, { size: 40, weight: 900, align: 'right', alpha: prog(lt, no - 0.1, no + 0.2) }); cross(ctx, 590, 630, 22, prog(lt, no, no + 0.3)); });
      badge(ctx, 'גרף יומי', prog(lt, 0, 0.3), C.purple, 300, W / 2, 42);
    },
  },
  r3: {
    trans: 'none',
    events: s => [{ lt: s.cue('מחכה'), type: 'pop' }, { lt: s.cue('מלמטה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, wait = s.cue('מחכה'), back = s.cue('חוזר'), below = s.cue('מלמטה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 7, 28], [d, 9, 30]], { p: [58200, 63000] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 20.3], [back, 23.5], [d, 24.98]], E.lin)[0], tfs: TFS_D });
      ch.hline(ctx, LVL, 0, 30, { color: C.gold, width: 5, dash: [14, 10] });
      ch.tag(ctx, D_BRK, 59480, 'סגירה מתחת', 1, { color: '#d61f45', above: false, size: 24, off: 38 });
      arrow(ctx, ch.X(26), ch.Y(59100), ch.X(26), ch.Y(59920), prog(lt, back, below + 0.3), { color: '#3df2a6', width: 8, head: 28 });
      popT(ctx, ch.X(26), ch.Y(58700), prog(lt, below - 0.05, below + 0.3), () => pill(ctx, 'חוזר מלמטה', ch.X(26), ch.Y(58700), { size: 28, color: '#0b8f63' }));
      ch.zone(ctx, LVL - 120, LVL + 120, 22, 30, { color: C.gold, alpha: 0.12 + 0.06 * Math.sin(lt * 6), progress: prog(lt, back, back + 0.5) });
      popT(ctx, W / 2, 300, prog(lt, wait - 0.05, wait + 0.3), () => pill(ctx, 'מחכה לתגובה ברמה', W / 2, 300, { size: 48, color: '#b8860b', glow: 45 }));
      popT(ctx, ch.X(14), ch.Y(62400), prog(lt, wait + 0.3, wait + 0.6), () => pill(ctx, 'מה המחיר עושה?', ch.X(14), ch.Y(62400), { size: 30, color: C.purple }));
    },
  },
  r4: {
    trans: 'none',
    events: s => [{ lt: s.cue('דוחף'), type: 'pop' }, { lt: s.cue('ונסגר'), type: 'impact', k: 1.4 }, { lt: s.cue('האישור'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, push = s.cue('דוחף'), cl = s.cue('ונסגר'), daily = s.cue('היומי'), conf = s.cue('האישור');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 9, 30], [cl, 12, 32], [d, 13, 32]], { p: [58400, 62400] });
      const rev = kf(lt, [[0, 24.98], [push - 0.25, 25.98], [push - 0.2, 26.0], [cl + 0.1, 26.98], [d, 27.0]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === D_CONF && lt > cl, tfs: TFS_D, tfFlash: lt > daily ? Math.exp(-(lt - daily) * 5) : 0 });
      const ok = lt > cl;
      ch.hline(ctx, LVL, 0, 32, { color: ok ? C.up : C.gold, width: ok ? 6 : 5, dash: ok ? null : [14, 10], glow: ok ? 26 : 16 });
      if (lt > push && lt < cl + 0.2) arrow(ctx, ch.X(27.2), ch.Y(59700), ch.X(27.2), ch.Y(60500), prog(lt, push, push + 0.4), { color: '#3df2a6', width: 7, head: 24 });
      if (ok) { const q = DC[D_CONF]; boxCandle(ctx, ch, D_CONF, q, 1, C.gold); hit(ctx, ch.X(D_CONF), ch.Y(q.c), lt, cl, C.gold, 240); flashCol(ctx, lt, cl, '255,201,77', 0.2);
        popT(ctx, ch.X(D_CONF), ch.Y(61050), prog(lt, cl, cl + 0.3), () => pill(ctx, 'סגירה מעל', ch.X(D_CONF), ch.Y(61050), { size: 34, color: '#b8860b', glow: 40 })); }
      badge(ctx, 'דוחף מעל הרמה', prog(lt, push, push + 0.3) * (1 - prog(lt, daily - 0.2, daily)), C.purple, 300, W / 2, 42);
      popT(ctx, W / 2, 300, prog(lt, daily - 0.05, daily + 0.3) * (1 - prog(lt, conf - 0.2, conf)), () => pill(ctx, 'סגירה יומית מעל הרמה', W / 2, 300, { size: 46, color: '#b8860b', glow: 45 }));
      popT(ctx, W / 2, 300, prog(lt, conf - 0.05, conf + 0.3), () => pill(ctx, 'זה האישור ✓', W / 2, 300, { size: 56, color: '#0b8f63', glow: 50 }));
      if (lt > conf) ring(ctx, W / 2, 300, 480, prog(lt, conf, conf + 0.7), C.up);
    },
  },
  r5: {
    trans: 'none',
    events: s => [{ lt: s.cue('והחזיקה'), type: 'pop' }, { lt: s.cue('הקונים'), type: 'pop' }, { lt: s.cue('נכנס'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, test = s.cue('נבדקה'), held = s.cue('והחזיקה'), close = s.cue('בסגירה'), buyers = s.cue('הקונים'), now = s.cue('עכשיו'), inn = s.cue('נכנס');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 13, 32], [inn, 14, 34], [d, 15, 36]], { p: [58400, 62600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 26.98], [now, 27.0], [d, 28.6]], E.lin)[0], highlight: i => i === D_CONF, tfs: TFS_D });
      ch.hline(ctx, LVL, 0, 36, { color: C.up, width: 5 });
      if (lt > test) ring(ctx, ch.X(D_CONF), ch.Y(LVL), 130, prog(lt, test, test + 0.6), C.gold);
      markPill(ctx, 'נבדקה והחזיקה', ch.X(20) + 20, ch.Y(61000), prog(lt, held - 0.05, held + 0.3), '#b8860b', true, 28);
      boxCandle(ctx, ch, D_CONF, DC[D_CONF], prog(lt, close - 0.1, close + 0.2), C.gold);
      ch.zone(ctx, LVL, LVL + 380, 22, 36, { color: C.up, alpha: 0.14 + 0.05 * Math.sin(lt * 5), progress: prog(lt, buyers - 0.1, buyers + 0.5) });
      popT(ctx, ch.X(31), ch.Y(LVL) + 44, prog(lt, buyers, buyers + 0.3), () => pill(ctx, 'הקונים מגינים', ch.X(31), ch.Y(LVL) + 44, { size: 28, color: '#0b8f63' }));
      if (lt > inn) { ch.dot(ctx, D_ENT, DC[D_ENT].o, prog(lt, inn, inn + 0.3), '#fff', 12); hit(ctx, ch.X(D_ENT), ch.Y(DC[D_ENT].o), lt, inn, C.up, 200);
        ch.hline(ctx, DC[D_ENT].o, D_ENT, 36, { color: '#fff', width: 3, dash: [8, 8], progress: prog(lt, inn, inn + 0.4) });
        popT(ctx, ch.X(30), ch.Y(61500), prog(lt, inn, inn + 0.3), () => pill(ctx, 'BUY · רק עכשיו', ch.X(30), ch.Y(61500), { size: 30, color: '#0b8f63' })); }
      badge(ctx, 'השוק הראה לי בסגירה', prog(lt, close - 0.05, close + 0.3), C.purple, 300, W / 2, 42);
    },
  },
  r6: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('מתקרב'), type: 'pop' }, { lt: s.cue('נראה'), type: 'pop' }, { lt: s.cue('הוכיחה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, what = s.cue('מה'), near = s.cue('מתקרב'), seem = s.cue('נראה'), proved = s.cue('הוכיחה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 30], [d, 15, 30]], { p: [58600, 62600] });
      ch.draw(ctx, { reveal: 27.98, dim: 0.55, highlight: i => (i === 24 && lt > near && lt < seem) || (i === D_WICK && lt > seem && lt < proved) || (i === D_CONF && lt > proved), tfs: TFS_D });
      ch.hline(ctx, LVL, 0, 30, { color: C.gold, width: 4 });
      markPill(ctx, 'רק מתקרב', ch.X(24) + 20, ch.Y(60500), prog(lt, near - 0.05, near + 0.3), '#555', false, 28);
      markPill(ctx, 'נראה לי', ch.X(D_WICK) + 20, ch.Y(61100), prog(lt, seem - 0.05, seem + 0.3), '#555', false, 28);
      markPill(ctx, 'הסגירה הוכיחה', ch.X(D_CONF) + 20, ch.Y(61700), prog(lt, proved - 0.05, proved + 0.3), '#0b8f63', true, 30);
      if (lt > proved) { boxCandle(ctx, ch, D_CONF, DC[D_CONF], 1, '#3df2a6'); hit(ctx, ch.X(D_CONF), ch.Y(DC[D_CONF].c), lt, proved, C.up, 220); }
      if (lt > seem) text(ctx, 'רק פתיל', ch.X(D_WICK), ch.Y(59600), { size: 26, weight: 800, color: C.gold, alpha: prog(lt, seem + 0.2, seem + 0.5) * (1 - prog(lt, proved, proved + 0.3)), stroke: 6 });
      badge(ctx, 'מה אני לא עושה?', prog(lt, what, what + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },

  // ================= CH5: what it gives you =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 6, 'מה אישור נותן', 'WHAT IT GIVES YOU', { cueWord: 'מה' }); } },
  w1: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('לצודק'), type: 'pop' }, { lt: s.cue('לממושמע'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, right = s.cue('לצודק'), disc = s.cue('לממושמע');
      drawBG(ctx, s.t, { glow: 1.2 });
      wipeText(ctx, 'אישור הופך אותך ל...', W / 2, 300, prog(lt, 0.05, 0.4), { size: 62, weight: 900, color: C.neon });
      const card = (y, t, col, ok, p) => popT(ctx, W / 2, y, p, () => { glass(ctx, 140, y - 120, 800, 240, 40, { border: col, glowColor: col }); text(ctx, t, 600, y, { size: 120, weight: 900, color: '#fff' }); (ok ? check : cross)(ctx, 250, y, 60, 1); });
      card(680, 'צודק', '#ff5a72', false, prog(lt, right - 0.1, right + 0.25));
      const ps = prog(lt, right + 0.3, right + 0.6);
      if (ps > 0) { ctx.save(); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.shadowColor = C.down; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(420, 690); ctx.lineTo(lerp(420, 790, E.outCubic(ps)), 670); ctx.stroke(); ctx.restore(); }
      card(1010, 'ממושמע', '#3df2a6', true, prog(lt, disc - 0.1, disc + 0.25));
      if (lt > disc) { hit(ctx, W / 2, 1010, lt, disc, C.up, 420); flashCol(ctx, lt, disc, '22,199,132', 0.15); }
    },
  },
  w2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('תפסיד'), type: 'pop' }, { lt: s.cue('מהמשחק'), type: 'pop' }, { lt: s.cue('תפסיק'), type: 'pop' }, { lt: s.cue('שמלכתחילה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, lose = s.cue('תפסיד'), game = s.cue('מהמשחק'), stop = s.cue('תפסיק'), orig = s.cue('שמלכתחילה'), last = s.cue('עסקאות', 2);
      drawBG(ctx, s.t);
      // journal: [W/L, confirmed?]
      const T = [['W', 1], ['L', 1], ['L', 0], ['W', 1], ['L', 0], ['W', 1], ['L', 0], ['L', 1]];
      const pg = prog(lt, orig, orig + 0.7), rh = 92;
      glass(ctx, 110, 400, 860, 820 - 3 * rh * E.inOut(pg), 30);
      text(ctx, 'יומן עסקאות', 920, 450, { size: 38, weight: 900, color: C.purple2, align: 'right' });
      let y = 530;
      T.forEach(([r, conf], k) => {
        const g = conf ? 0 : pg, p = prog(lt, 0.05 + k * 0.08, 0.35 + k * 0.08), mark = !conf && lt > stop;
        const h = rh * (1 - E.inOut(prog(g, 0.3, 1))), fa = 1 - prog(g, 0, 0.4); if (p <= 0) { y += h; return; }
        if (fa > 0) {
          ctx.save(); ctx.globalAlpha *= clamp(p * 2) * fa; ctx.translate((1 - E.outCubic(p)) * 80, 0);
          if (mark) { rrect(ctx, 140, y - 38, 800, 76, 14); ctx.fillStyle = 'rgba(242,54,69,0.16)'; ctx.fill(); }
          text(ctx, `#${k + 1}`, 900, y, { size: 32, weight: 800, fam: MONO, color: C.axis, align: 'right' });
          text(ctx, conf ? 'עם אישור' : 'בלי אישור', 800, y, { size: 36, weight: 800, color: conf ? '#fff' : mark ? '#ff5a72' : '#fff', align: 'right' });
          const L = r === 'L', pulse = L && lt > lose ? 1 + 0.08 * Math.sin((lt - lose) * 10) * Math.exp(-(lt - lose) * 1.5) : 1;
          ctx.save(); ctx.translate(220, y); ctx.scale(pulse, pulse); ctx.translate(-220, -y); pill(ctx, r, 220, y, { size: 32, color: L ? '#d61f45' : '#0b8f63', fam: MONO, glow: L && lt > lose ? 24 : 8 }); ctx.restore();
          if (mark) { ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(500, y); ctx.lineTo(lerp(500, 900, prog(lt, stop, stop + 0.4)), y); ctx.stroke(); }
          ctx.restore();
        }
        if (g > 0 && g < 0.6) burst(ctx, 520, y, g / 0.6, '#ff5a72', 14, k + 9, 200);
        y += h;
      });
      popT(ctx, W / 2, 300, prog(lt, game - 0.05, game + 0.3) * (1 - prog(lt, stop - 0.2, stop)), () => pill(ctx, 'הפסדים הם חלק מהמשחק', W / 2, 300, { size: 46, color: C.purple, glow: 40 }));
      popT(ctx, W / 2, 300, prog(lt, stop - 0.05, stop + 0.3), () => pill(ctx, 'עסקאות שלא היו צריכות להיות', W / 2, 300, { size: 42, color: '#d61f45', glow: 40 }));
      // losses counter
      const pc = prog(lt, last - 0.3, last + 0.1);
      if (pc > 0) popT(ctx, W / 2, 1060, pc, () => { glass(ctx, 260, 990, 560, 140, 30, { border: 'rgba(61,242,166,0.7)', glowColor: 'rgba(22,199,132,0.5)' });
        text(ctx, 'הפסדים', 770, 1060, { size: 50, weight: 900, align: 'right' }); text(ctx, '2 ← 5', 330, 1060, { size: 64, weight: 800, fam: MONO, color: '#3df2a6', align: 'left' }); });
    },
  },
  w3: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('גבוה'), type: 'pop' }, { lt: s.cue('הוכחה'), type: 'pop' }, { lt: s.cue('בשמחה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, q0 = s.cue('והמחיר'), high = s.cue('גבוה'), proof = s.cue('הוכחה'), happy = s.cue('בשמחה');
      const EARLY = 59900, CONF = DC[D_CONF].c;
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 16, 36], [d, 17, 37]], { p: [58800, 63200] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 26.98], [happy, 27.5], [d, 33.5]], E.lin)[0], highlight: i => i === D_CONF, tfs: TFS_D });
      ch.hline(ctx, LVL, 0, 37, { color: C.gold, width: 3, alpha: 0.6 });
      ch.hline(ctx, EARLY, D_WICK, 37, { color: '#9a94b8', width: 3, dash: [8, 8], progress: prog(lt, q0, q0 + 0.5) });
      popT(ctx, ch.X(31.5), ch.Y(EARLY) + 32, prog(lt, q0 + 0.2, q0 + 0.5), () => pill(ctx, 'כניסה מוקדמת', ch.X(31.5), ch.Y(EARLY) + 32, { size: 24, color: '#555' }));
      ch.hline(ctx, CONF, D_CONF, 37, { color: '#3df2a6', width: 4, progress: prog(lt, high - 0.1, high + 0.4) });
      popT(ctx, ch.X(31.5), ch.Y(CONF) - 32, prog(lt, high, high + 0.3), () => pill(ctx, 'כניסה אחרי אישור', ch.X(31.5), ch.Y(CONF) - 32, { size: 24, color: '#0b8f63' }));
      const pb = prog(lt, proof - 0.2, proof + 0.3);
      if (pb > 0) { const x = ch.X(36), y0 = ch.Y(EARLY), y1 = lerp(y0, ch.Y(CONF), E.outCubic(pb));
        ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.shadowColor = C.gold; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(x - 14, y0); ctx.lineTo(x, y0); ctx.lineTo(x, y1); ctx.lineTo(x - 14, y1); ctx.stroke(); ctx.restore();
        text(ctx, '+' + fmt(CONF - EARLY), x - 22, (ch.Y(EARLY) + ch.Y(CONF)) / 2, { size: 28, weight: 800, fam: MONO, color: C.gold, align: 'right', alpha: pb, stroke: 6 }); }
      popT(ctx, W / 2, 300, prog(lt, proof - 0.05, proof + 0.3), () => pill(ctx, 'המחיר של הוכחה', W / 2, 300, { size: 54, color: '#b8860b', glow: 50 }));
      badge(ctx, 'לפעמים קצת יותר גבוה', prog(lt, high, high + 0.3) * (1 - prog(lt, proof - 0.25, proof - 0.05)), C.purple, 300, W / 2, 42);
      if (lt > happy) { popT(ctx, W / 2, 1268, prog(lt, happy, happy + 0.3), () => pill(ctx, 'משלם בשמחה ✓', W / 2, 1268, { size: 40, color: '#0b8f63', glow: 40 })); ring(ctx, W / 2, 1268, 400, prog(lt, happy, happy + 0.7), C.up); }
    },
  },

  // ================= CH6: TradingView =================
  ch6: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 6, 6, 'ב-TradingView', 'WAIT FOR THE CLOSE', { cueWord: 'TradingView' }); } },
  t1: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('מסמנים') + 0.1, type: 'click' }, { lt: s.cue('הרמה'), type: 'click' }, { lt: s.cue('התראה'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, mk = s.cue('מסמנים'), lv = s.cue('הרמה'), sit = s.cue('לשבת'), al = s.cue('התראה');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(...kf(lt, [[0, 4, 30], [d, 6, 30]]), 58400, 63200);
      ch.draw(ctx, { reveal: 24.6, tfs: TFS_D });
      const at = tvToolbar(ctx, 40, 466, 870, lt > mk && lt < al - 0.4 ? 'hline' : null);
      ch.hline(ctx, LVL, 0, 30, { color: C.gold, width: 4, progress: prog(lt, lv, lv + 0.4) });
      if (lt > lv) text(ctx, '60,000', ch.X(6), ch.Y(LVL) - 24, { size: 24, weight: 700, fam: MONO, color: C.gold, align: 'left', alpha: prog(lt, lv + 0.2, lv + 0.5), stroke: 6 });
      // alert button
      const bx = 760, by = 530, hot = lt > al - 0.1;
      ctx.save(); rrect(ctx, bx - 80, by - 30, 160, 60, 14); ctx.fillStyle = hot ? 'rgba(168,85,247,0.55)' : 'rgba(30,22,52,0.95)'; ctx.shadowColor = C.purple; ctx.shadowBlur = hot ? 30 : 8; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(200,150,255,0.5)'; ctx.stroke(); ctx.restore();
      bell(ctx, bx - 44, by - 2, 15, hot ? '#fff' : C.gold); text(ctx, 'Alert', bx + 16, by + 1, { size: 26, weight: 800, align: 'center' });
      const [hx, hy] = at('hline');
      const c = kf(lt, [[0, 700, 1150], [mk - 0.1, hx, hy], [mk + 0.25, hx, hy], [lv - 0.1, ch.X(12), ch.Y(LVL)], [lv + 0.4, ch.X(12), ch.Y(LVL)], [al - 0.15, bx + 10, by + 6]]);
      const clk = Math.max(Math.exp(-Math.abs(lt - (mk + 0.1)) * 14), Math.exp(-Math.abs(lt - lv) * 14), Math.exp(-Math.abs(lt - al) * 14));
      cursor(ctx, c[0], c[1], clk, 1.15);
      if (lt > al) ring(ctx, bx, by, 140, prog(lt, al, al + 0.5), C.purple2);
      badge(ctx, 'מסמנים את הרמה', prog(lt, mk, mk + 0.3) * (1 - prog(lt, sit - 0.2, sit)), C.purple, 300, W / 2, 42);
      markPill(ctx, 'לא יושבים מול המסך', W / 2 + 22, 300, prog(lt, sit - 0.05, sit + 0.3), '#3b1a78', false, 40);
    },
  },
  t2: {
    trans: 'none',
    events: s => [{ lt: s.cue('בוחרים'), type: 'click' }, { lt: s.cue('Close'), type: 'click' }, { lt: s.cue('נסגר'), type: 'pop' }, { lt: s.cue('פתיל'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, set = s.cue('בהגדרות'), pick = s.cue('בוחרים'), once = s.cue('Once'), cls = s.cue('Close'), arr = s.cue('מגיעה'), closed = s.cue('נסגר'), wick = s.cue('פתיל');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(6, 30, 58400, 63200);
      ch.draw(ctx, { reveal: 24.6, tfs: TFS_D });
      tvToolbar(ctx, 40, 466, 870, null);
      ch.hline(ctx, LVL, 0, 30, { color: C.gold, width: 4 });
      scrim(ctx, 0.55);
      // the dialog
      const pd = prog(lt, set - 0.2, set + 0.2), bx = 130, by = 420, bw = 820, bh = 470;
      const opts = ['Only Once', 'Once Per Bar', 'Once Per Bar Close', 'Once Per Minute'];
      const listOpen = lt > pick && lt < cls + 0.25, chosen = lt > cls;
      if (pd > 0) {
        ctx.save(); ctx.globalAlpha = pd; ctx.translate(0, (1 - E.outCubic(pd)) * 50);
        glass(ctx, bx, by, bw, bh, 26, { fill: 'rgba(22,16,40,0.97)' });
        text(ctx, 'Create alert on BTCUSD', bx + 40, by + 60, { size: 36, weight: 800, align: 'left' });
        [['Condition', 'Crossing Up'], ['Value', '60,000.00'], ['Trigger', chosen ? 'Once Per Bar Close' : 'Only Once']].forEach(([k, v], j) => {
          const hot = j === 2 && (listOpen || chosen), yy = by + 150 + j * 80;
          text(ctx, k, bx + 40, yy, { size: 28, weight: 500, align: 'left', color: C.axis });
          rrect(ctx, bx + 250, yy - 30, 520, 60, 10); ctx.fillStyle = hot && chosen ? 'rgba(168,85,247,0.45)' : '#0d0a19'; ctx.fill();
          if (hot) { ctx.strokeStyle = C.purple; ctx.lineWidth = 3; ctx.stroke(); }
          text(ctx, v, bx + 270, yy, { size: 28, weight: 700, align: 'left', fam: MONO, color: hot && chosen ? '#fff' : '#ddd' });
          if (j === 2) text(ctx, '▾', bx + 745, yy, { size: 26, color: C.axis });
        });
        rrect(ctx, bx + bw - 240, by + bh - 90, 200, 64, 14); ctx.fillStyle = C.purple; ctx.fill();
        text(ctx, 'Create', bx + bw - 140, by + bh - 57, { size: 30, weight: 800 });
        ctx.restore();
      }
      const ly = by + 150 + 2 * 80 + 40;
      if (listOpen) {
        const pl = prog(lt, pick, pick + 0.2);
        ctx.save(); ctx.globalAlpha = pl; glass(ctx, bx + 250, ly, 520, opts.length * 64 + 16, 12, { fill: 'rgba(14,10,28,0.98)', glow: 30 });
        opts.forEach((o, k) => { const yy = ly + 40 + k * 64, on = k === 2 && lt > once - 0.1;
          if (on) { rrect(ctx, bx + 258, yy - 28, 504, 56, 10); ctx.fillStyle = 'rgba(168,85,247,0.5)'; ctx.fill(); }
          text(ctx, o, bx + 280, yy, { size: 28, weight: on ? 800 : 600, align: 'left', fam: MONO, color: on ? '#fff' : C.dim }); });
        ctx.restore();
      }
      if (lt < arr) { const c = kf(lt, [[0, 760, 1300], [pick - 0.15, bx + 700, by + 310], [pick + 0.1, bx + 700, by + 310], [cls - 0.15, bx + 560, ly + 40 + 2 * 64], [cls + 0.2, bx + 560, ly + 40 + 2 * 64]]);
        cursor(ctx, c[0], c[1], Math.max(Math.exp(-Math.abs(lt - pick) * 14), Math.exp(-Math.abs(lt - cls) * 14)), 1.15); }
      if (lt > cls) hit(ctx, bx + 510, by + 310, lt, cls, C.purple2, 200);
      // mini demo: wick vs closed candle
      const demo = (x, ok, t0, label) => { const p = prog(lt, t0 - 0.1, t0 + 0.3); if (p <= 0) return;
        popT(ctx, x, 1150, p, () => { glass(ctx, x - 200, 1000, 400, 300, 26, { border: ok ? 'rgba(61,242,166,0.7)' : 'rgba(255,90,114,0.7)', glowColor: ok ? 'rgba(22,199,132,0.4)' : 'rgba(242,54,69,0.4)' });
          ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 170, 1120); ctx.lineTo(x + 40, 1120); ctx.stroke(); ctx.restore();
          const cx = x - 70, col = ok ? C.up : C.down; ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5;
          if (ok) { ctx.beginPath(); ctx.moveTo(cx, 1070); ctx.lineTo(cx, 1210); ctx.stroke(); ctx.fillRect(cx - 26, 1090, 52, 100); }
          else { ctx.beginPath(); ctx.moveTo(cx, 1065); ctx.lineTo(cx, 1220); ctx.stroke(); ctx.fillRect(cx - 26, 1150, 52, 50); }
          ctx.restore();
          bell(ctx, x + 110, 1100, 34, ok ? C.gold : '#666'); (ok ? check : cross)(ctx, x + 140, 1140, 20, 1);
          text(ctx, label, x, 1262, { size: 34, weight: 900, color: ok ? '#3df2a6' : '#ff5a72' }); }); };
      demo(780, true, closed, 'רק בסגירה');
      demo(300, false, wick, 'לא על פתיל');
    },
  },
  t3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('קפצה'), type: 'pop' }, { lt: s.cue('סגירה'), type: 'pop' }, { lt: s.cue('אישור'), type: 'impact', k: 1.2 }, { lt: s.cue('מחכים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, pop = s.cue('קפצה'), open = s.cue('פותחים'), cl = s.cue('סגירה'), yes = s.cue('אישור'), no = s.cue('אין'), wait = s.cue('מחכים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 30], [open + 0.5, 14, 30], [no, 14, 30], [d, 15, 30]], { p: [58600, 62600], layout: { left: 92 } });
      ch.draw(ctx, { reveal: 26.98, tfs: TFS_D, highlight: i => (i === D_CONF && lt > cl && lt < no) || (i === D_WICK && lt > no) });
      tvToolbar(ctx, 40, 466, 870, null);
      ch.hline(ctx, LVL, 0, 30, { color: C.gold, width: 4 });
      if (lt > cl) boxCandle(ctx, ch, D_CONF, DC[D_CONF], prog(lt, cl, cl + 0.2) * (1 - 0.6 * prog(lt, no, no + 0.3)), '#3df2a6');
      markPill(ctx, 'סגירה מעל = אישור', ch.X(D_CONF) + 20, ch.Y(61300), prog(lt, yes - 0.1, yes + 0.25), '#0b8f63', true, 28);
      if (lt > yes) hit(ctx, ch.X(D_CONF), ch.Y(DC[D_CONF].c), lt, yes, C.up, 220);
      if (lt > no) boxCandle(ctx, ch, D_WICK, DC[D_WICK], prog(lt, no, no + 0.2), C.gold);
      popT(ctx, ch.X(D_WICK), ch.Y(59150), prog(lt, wait - 0.1, wait + 0.25), () => pill(ctx, 'רק פתיל · מחכים', ch.X(D_WICK), ch.Y(59150), { size: 28, color: '#b8860b' }));
      // alert toast
      const pt = prog(lt, pop - 0.1, pop + 0.25) * (1 - prog(lt, open + 0.6, open + 0.9));
      if (pt > 0) { ctx.save(); ctx.globalAlpha = pt; ctx.translate(0, (1 - E.outBack(pt)) * -80);
        glass(ctx, 130, 520, 820, 150, 26, { fill: 'rgba(22,16,40,0.97)', border: 'rgba(255,201,77,0.7)', glowColor: 'rgba(255,201,77,0.4)' });
        bell(ctx, 210, 590, 30, C.gold); text(ctx, 'Alert on BTCUSD', 270, 562, { size: 32, weight: 800, align: 'left' });
        text(ctx, 'Crossing Up 60,000 · bar closed', 270, 615, { size: 26, weight: 600, align: 'left', fam: MONO, color: C.axis }); ctx.restore();
        if (lt > pop) ring(ctx, 210, 590, 120, prog(lt, pop, pop + 0.5), C.gold); }
      badge(ctx, 'ההתראה קפצה', prog(lt, pop - 0.05, pop + 0.3) * (1 - prog(lt, cl - 0.25, cl - 0.05)), '#b8860b', 300, W / 2, 42);
      badge(ctx, 'בודקים את הסגירה', prog(lt, cl - 0.05, cl + 0.3), C.purple, 300, W / 2, 42);
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('הרמה'), type: 'pop' }, { lt: s.cue('האישור'), type: 'pop' }, { lt: s.cue('מנחש'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['הרמה', 'אומרת איפה', C.purple, s.cue('הרמה'), 'zz'],
        ['האישור', 'אומר מתי', '#d4a017', s.cue('האישור'), 'check'],
        ['לא מנחש', 'מגיב', '#0fa36b', s.cue('מנחש'), 'cross'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('נגדך'), type: 'impact', k: 1 }, { lt: s.cue('שורפים'), type: 'pop' }, { lt: s.cue('הבא'), type: 'riser' }, { lt: s.cue('הביטול'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, conf = s.cue('אישור'), vs = s.cue('נגדך'), burn = s.cue('שורפים'), next = s.cue('הבא'), third = s.cue('השלישי'), inv = s.cue('הביטול');
      drawBG(ctx, s.t, { glow: 1.3, hue: lt > vs && lt < next ? 30 : 0 });
      const out = next - 0.1;
      headlines(ctx, lt, [{ t: 'נכנסת עם אישור', at: conf - 0.2, y: 460, size: 84 }, { t: 'והעסקה הולכת נגדך?', at: vs - 0.2, y: 580, size: 80, color: '#ff5a72', glowColor: C.down }], out);
      // mini trade: entry, small push up, then against you
      const pm = prog(lt, conf, vs + 0.6), a = 1 - prog(lt, out - 0.25, out - 0.05);
      if (pm > 0 && a > 0) { ctx.save(); ctx.globalAlpha = a;
        const pts = [[180, 900], [330, 850], [450, 870], [560, 800], [680, 900], [800, 1000], [900, 1080]], n = pts.length - 1, f = pm * n;
        ctx.setLineDash([10, 8]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(180, 900); ctx.lineTo(920, 900); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = lt > vs ? '#ff5a72' : '#3df2a6'; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(...pts[0]);
        for (let k = 1; k <= n && k - 1 < f; k++) { const t = clamp(f - (k - 1)); ctx.lineTo(lerp(pts[k - 1][0], pts[k][0], t), lerp(pts[k - 1][1], pts[k][1], t)); }
        ctx.stroke(); ctx.restore();
        popT(ctx, 180, 960, pm, () => pill(ctx, 'כניסה ✓', 180, 960, { size: 28, color: '#0b8f63' })); }
      if (lt < out) { popT(ctx, W / 2, 1200, prog(lt, burn - 0.05, burn + 0.3), () => pill(ctx, 'כאן שורפים את החשבון', W / 2, 1200, { size: 48, color: '#d61f45', glow: 50 })); flashCol(ctx, lt, burn, '255,40,70', 0.18); }
      // next: pillar 3
      if (lt > next - 0.2) {
        wipeText(ctx, 'בסרטון הבא', W / 2, 470, prog(lt, next - 0.1, next + 0.3), { size: 80, weight: 900, color: C.neon });
        seriesMap(ctx, lt, 2, next + 0.1, 760, { series: PILLARS, done: 2 });
        if (lt > third) ring(ctx, lerp(930, 150, 2 / 3), 760, 200, prog(lt, third, third + 0.6), C.gold);
        popT(ctx, W / 2, 1120, prog(lt, inv - 0.1, inv + 0.35), () => pill(ctx, 'הבא: הביטול · INVALIDATION', W / 2, 1120, { size: 46, color: C.purple, glow: 50 }));
        ring(ctx, W / 2, 1120, 520, prog(lt, inv, inv + 0.7));
      }
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

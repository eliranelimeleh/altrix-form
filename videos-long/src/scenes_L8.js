// L8 — Price Action made simple, part 3: the 1-minute entry model
'use strict';
const ch15 = new Chart(PA_C, { tf: '15m' });
const ch1 = new Chart(M1_C, { tf: '1m' });
const TFS = ['1m', '15m', '1H', '4H'];
const NY_I = 22;
const VOL1 = M1_C.map((q, i) => (i < NY_I ? 0.25 + 0.2 * hash(i) : 0.8 + 0.6 * hash(i + 3) + (i < 27 ? 0.6 : 0)));
const CH_I = 24; // the CHoCH candle (close above the LH at 16)

function nyLine(ctx, ch, p, label = true) {
  if (p <= 0) return;
  const x = ch.X(NY_I - 0.5);
  ch.clip(ctx, () => { ctx.save(); ctx.globalAlpha *= p; ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(x, ch.p.y); ctx.lineTo(x, ch.p.y + ch.p.h); ctx.stroke(); ctx.restore(); });
  if (label) popT(ctx, x, ch.p.y + 40, p, () => pill(ctx, 'NY OPEN', x, ch.p.y + 40, { size: 24, color: '#b8860b', fam: MONO, pad: 12 }));
}
function m1Base(ctx, ch, o = {}) {
  ch.hline(ctx, M1(16), 16, 46, { color: o.choch ? C.up : 'rgba(255,255,255,0.7)', width: 3, dash: o.choch ? null : [10, 8], progress: o.lh ?? 1 });
}
function mapCard(ctx, lt, t0, o = {}) {
  const p = prog(lt, t0 - 0.1, t0 + 0.4); if (p <= 0) return;
  const { y = 820, route = 1, pins = [] } = o, x0 = 160, x1 = 920, y0 = y - 260, y1 = y + 260;
  ctx.save(); ctx.globalAlpha = p; glass(ctx, x0 - 40, y0 - 40, x1 - x0 + 80, y1 - y0 + 80, 30);
  ctx.strokeStyle = 'rgba(150,130,220,0.15)'; ctx.lineWidth = 2; for (let gx = x0; gx <= x1; gx += 76) { ctx.beginPath(); ctx.moveTo(gx, y0); ctx.lineTo(gx, y1); ctx.stroke(); } for (let gy = y0; gy <= y1; gy += 74) { ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); }
  const pts = [[x1 - 40, y1 - 40], [x1 - 200, y1 - 150], [x0 + 420, y + 40], [x0 + 300, y - 120], [x0 + 60, y0 + 40]];
  let total = 0; const L = [0]; for (let k = 1; k < pts.length; k++) { total += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); L.push(total); }
  const lim = total * clamp(route);
  ctx.strokeStyle = C.purple2; ctx.lineWidth = 8; ctx.setLineDash([18, 12]); ctx.shadowColor = C.purple; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let k = 1; k < pts.length; k++) { if (L[k] <= lim) ctx.lineTo(...pts[k]); else { const t = (lim - L[k - 1]) / (L[k] - L[k - 1]); ctx.lineTo(lerp(pts[k - 1][0], pts[k][0], t), lerp(pts[k - 1][1], pts[k][1], t)); break; } }
  ctx.stroke(); ctx.restore();
  const pin = (x, y, col, t) => { ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 25; ctx.beginPath(); ctx.arc(x, y - 30, 24, Math.PI, 0); ctx.lineTo(x, y); ctx.closePath(); ctx.fill(); ctx.restore(); text(ctx, t, x, y + 34, { size: 30, weight: 900, color: col, alpha: p }); };
  pin(pts[0][0], pts[0][1], '#3df2a6', 'התחלה'); pin(pts[4][0], pts[4][1] + 40, C.gold, 'יעד');
  pins.forEach(([k, t, tp]) => { const pk = prog(lt, tp, tp + 0.3); popT(ctx, pts[k][0], pts[k][1], pk, () => pill(ctx, t, pts[k][0], pts[k][1], { size: 30, color: C.purple })); });
}

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('המפה'), type: 'pop' }, { lt: s.cue('לאיבוד'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, map = s.cue('המפה'), dir = s.cue('הוראות'), lost = s.cue('לאיבוד');
      drawBG(ctx, s.t);
      mapCard(ctx, lt, map, { route: prog(lt, map, dir + 0.4) });
      wipeText(ctx, 'המפה מראה לאן', W / 2, 330, prog(lt, map - 0.1, map + 0.3) * (1 - prog(lt, dir - 0.2, dir)), { size: 72, weight: 900 });
      wipeText(ctx, 'בלי הוראות נסיעה?', W / 2, 330, prog(lt, dir - 0.05, dir + 0.3), { size: 72, weight: 900, color: C.gold });
      if (lt > lost) { text(ctx, '?', 500, 760, { size: 200, weight: 900, color: '#ff5a72', alpha: prog(lt, lost, lost + 0.3), glow: 40, glowColor: C.down }); hit(ctx, 500, 760, lt, lost, C.down, 260); }
    },
  },
  hook2: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('צעדים'), type: 'pop' }, { lt: s.cue('דקה'), type: 'click' }, { lt: s.cue('ארבע'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, steps = s.cue('צעדים'), min = s.cue('דקה'), risk = s.cue('סיכון'), four = s.cue('ארבע');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 40], [d, 10, 46]], { p: [62600, 64000] });
      ch.draw(ctx, { reveal: lerp(26, 45, prog(lt, risk, four + 0.3)), tfs: TFS, tfFlash: lt > min ? Math.exp(-(lt - min) * 5) : 0 });
      fvgZone(ctx, ch, 23, M1_G, 46, prog(lt, steps, steps + 0.4), { mid: true, label: '' });
      positionBox(ctx, ch, 29, 45, M1_MID, M1_SL, M1_TP, prog(lt, risk, risk + 0.8), { rr: true });
      if (lt > four) hit(ctx, ch.X(44), ch.Y(M1_TP), lt, four, C.up, 220);
      wipeText(ctx, 'מודל הכניסה שלי', W / 2, 300, prog(lt, 0, 0.35), { size: 72, weight: 900, color: C.purple2 });
    },
  },
  hook3: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('לבד'), type: 'pop' }, { lt: s.cue('אינדיקטור'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, alone = s.cue('לבד'), ind = s.cue('אינדיקטור');
      drawBG(ctx, s.t, { glow: 1.25 });
      headlines(ctx, lt, [{ t: 'תפעיל אותו לבד', at: alone - 0.3, y: 470, size: 100 }]);
      ['RSI', 'MACD', 'EMA', 'STOCH'].forEach((t, k) => { const x = 210 + k * 220, p = prog(lt, ind - 0.4 + k * 0.08, ind - 0.1 + k * 0.08); popT(ctx, x, 820, p, () => pill(ctx, t, x, 820, { size: 34, color: '#555', fam: MONO })); cross(ctx, x, 900, 26, prog(lt, ind + k * 0.08, ind + k * 0.08 + 0.3)); });
      popT(ctx, W / 2, 1150, prog(lt, ind + 0.3, ind + 0.6), () => pill(ctx, 'בלי אף אינדיקטור', W / 2, 1150, { size: 50, color: '#0b8f63', glow: 45 }));
    },
  },
  intro: {
    trans: 'whip', captions: false,
    events: s => [{ lt: s.cue('השלישי'), type: 'pop' }, { lt: s.cue('הכניסה'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, third = s.cue('השלישי'), entry = s.cue('הכניסה');
      drawBG(ctx, s.t, { glow: 1.25 });
      wipeText(ctx, 'חלק 3 מתוך 3', W / 2, 360, prog(lt, third - 0.1, third + 0.3), { size: 70, weight: 900, color: C.neon });
      seriesMap(ctx, lt, 3, 0.1, 820, { list: SERIES_PA, done: 3 });
      popT(ctx, W / 2, 1180, prog(lt, entry - 0.1, entry + 0.3), () => pill(ctx, 'מודל הכניסה', W / 2, 1180, { size: 56, color: C.purple, glow: 50 }));
    },
  },

  // ================= CH1: map & directions =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 6, 'מפה, והוראות נסיעה', 'MAP VS DIRECTIONS', { cueWord: 'מפה' }); } },
  a1: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('כיוון'), type: 'pop' }, { lt: s.cue('אישור'), type: 'pop' }, { lt: s.cue('ופסילה'), type: 'pop' }, { lt: s.cue('המפה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, map = s.cue('המפה');
      drawBG(ctx, s.t);
      mapCard(ctx, lt, 0.1, { route: prog(lt, 0.2, map + 0.4), pins: [[1, 'כיוון', s.cue('כיוון')], [2, 'אישור', s.cue('אישור')], [3, 'פסילה', s.cue('ופסילה')]] });
      wipeText(ctx, 'הניתוח = המפה', W / 2, 330, prog(lt, map - 0.1, map + 0.3), { size: 76, weight: 900, color: C.neon });
    },
  },
  a2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שעה'), type: 'click' }, { lt: s.cue('החמים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch15, q = s.cue('שעה'), where = s.cue('לסחור'), hot = s.cue('החמים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 42], [d, 4, 42]], { p: [59300, 65400] });
      ch.draw(ctx, { reveal: 36.5, tfs: TFS, tfFlash: lt > q ? Math.exp(-(lt - q) * 5) : 0 });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 42, prog(lt, where - 0.3, where + 0.4), { color: C.teal, width: 6 });
      if (lt > hot) ch.zone(ctx, TL(36) - 180, TL(36) + 220, 33, 42, { color: C.gold, alpha: 0.22 + 0.1 * Math.sin(lt * 7), progress: prog(lt, hot, hot + 0.4), label: 'אזור חם' });
      badge(ctx, 'המפה: גרף רבע שעה', prog(lt, q, q + 0.35), C.purple, 300, W / 2, 44);
    },
  },
  a3: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('יורד'), type: 'whoosh' }, { lt: s.cue('בזום'), type: 'pop' }, { lt: s.cue('פנייה', 1), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, down = s.cue('יורד'), zoom = s.cue('בזום'), turn = s.cue('פנייה');
      drawBG(ctx, s.t);
      const top = ch15; top.layout(...PANEL_TOP, { head: 80, foot: 40 }).view(20, 40, 61500, 64600); top.draw(ctx, { reveal: 36.5, tfs: TFS });
      top.zone(ctx, 62600, 63100, 35.5, 36.5, { color: C.gold, alpha: 0.4, progress: prog(lt, down - 0.3, down) });
      const pb = prog(lt, down, down + 0.4);
      if (pb > 0) { ctx.save(); ctx.globalAlpha = pb; ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(top.X(35.5), top.Y(62600)); ctx.lineTo(PANEL_BOT[0] + 20, PANEL_BOT[1]); ctx.moveTo(top.X(36.5), top.Y(62600)); ctx.lineTo(PANEL_BOT[0] + PANEL_BOT[2] - 20, PANEL_BOT[1]); ctx.stroke(); ctx.restore();
        const b = ch1; b.layout(...PANEL_BOT, { head: 80, foot: 40 }).view(0, 30, 62600, 63600); ctx.save(); ctx.globalAlpha = pb; b.draw(ctx, { reveal: lerp(10, 29, prog(lt, zoom, d)), tfs: TFS }); ctx.restore(); }
      popT(ctx, W / 2, 268, prog(lt, turn, turn + 0.35), () => pill(ctx, 'דקה = הוראות נסיעה', W / 2, 268, { size: 44, color: '#b8860b', glow: 40 }));
    },
  },
  a4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מקום'), type: 'pop' }, { lt: s.cue('מדי'), type: 'pop' }, { lt: s.cue('שתיהן'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, any = s.cue('מקום'), late = s.cue('מדי'), both = s.cue('שתיהן');
      drawBG(ctx, s.t, { glow: 1.15 });
      const card = (y, t1, t2, ok, col, t) => popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 120, y - 110, 840, 220, 30, { border: col, glowColor: col }); text(ctx, t1, 880, y - 28, { size: 56, weight: 900, align: 'right' }); text(ctx, t2, 880, y + 48, { size: 38, weight: 800, color: col, align: 'right' }); (ok ? check : cross)(ctx, 230, y, 46, 1); });
      card(500, 'בלי מפה', 'נכנס בכל מקום', false, '#f23645', any);
      card(780, 'בלי הוראות', 'נכנס מאוחר מדי', false, '#f23645', late);
      card(1060, 'מפה + הוראות', 'צריך את שתיהן', true, '#16c784', both);
    },
  },

  // ================= CH2: when =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 6, 'מתי בכלל מסתכלים', 'NEW YORK OPEN', { cueWord: 'מתי' }); } },
  b1: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('שווה'), type: 'pop' }, { lt: s.cue('יורק'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, eq = s.cue('שווה'), ny = s.cue('יורק');
      drawBG(ctx, s.t);
      wipeText(ctx, 'לא כל שעה שווה', W / 2, 360, prog(lt, eq - 0.4, eq), { size: 76, weight: 900 });
      const sess = [['אסיה', 0.05, 0.35, '#555'], ['לונדון', 0.35, 0.62, '#2962ff'], ['ניו יורק', 0.6, 0.95, C.gold]], x0 = 130, w = 820, y = 760;
      sess.forEach(([t, a, b, col], k) => { const p = prog(lt, k * 0.2, k * 0.2 + 0.3), on = k === 2 && lt > ny; ctx.save(); ctx.globalAlpha = p * (on || lt < ny ? 1 : 0.4); rrect(ctx, x0 + w * a, y + k * 120, w * (b - a), 90, 18); ctx.fillStyle = col; if (on) { ctx.shadowColor = col; ctx.shadowBlur = 40; } ctx.fill(); ctx.restore();
        text(ctx, t, x0 + w * (a + b) / 2, y + k * 120 + 46, { size: 38, weight: 900, color: k === 2 ? '#1a0f00' : '#fff', alpha: p }); });
      if (lt > ny) { popT(ctx, W / 2, 1200, prog(lt, ny, ny + 0.3), () => pill(ctx, 'פתיחת ניו יורק · 16:30 שעון ישראל', W / 2, 1200, { size: 38, color: '#b8860b', glow: 40 })); ring(ctx, x0 + w * 0.775, y + 280, 260, prog(lt, ny, ny + 0.7), C.gold); }
    },
  },
  b2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הווליום'), type: 'impact', k: 1 }, { lt: s.cue('זז'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, vol = s.cue('הווליום'), moves = s.cue('זז');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 36], [d, 8, 38]], { p: [62300, 63800] });
      const rev = kf(lt, [[0, 21], [vol, 23], [d, 30]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, tfs: TFS });
      volumeBars(ctx, ch, VOL1, rev, { h: 220, highlight: i => i >= NY_I && lt > vol });
      nyLine(ctx, ch, prog(lt, vol - 0.4, vol));
      badge(ctx, 'הווליום נכנס לשוק', prog(lt, vol, vol + 0.35), '#b8860b', 300, W / 2, 44);
    },
  },
  b3: {
    trans: 'none',
    events: s => [{ lt: s.cue('רעש'), type: 'pop' }, { lt: s.cue('לנקות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, noise = s.cue('רעש'), clean = s.cue('לנקות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [d, 0, 30]], { p: [62300, 63800] });
      ch.draw(ctx, { reveal: 29, tfs: TFS, dim: 0.2 });
      const pn = prog(lt, noise - 0.2, noise + 0.3);
      if (pn > 0) { ch.zone(ctx, 62700, 63500, -0.5, NY_I - 0.5, { color: '#888', alpha: 0.22 * pn, progress: pn, label: 'רעש' }); cross(ctx, ch.X(10), ch.Y(63600), 28, pn); }
      nyLine(ctx, ch, 1);
      if (lt > clean) ch.zone(ctx, 62700, 63500, NY_I - 0.5, 30, { color: C.gold, alpha: 0.15, progress: prog(lt, clean, clean + 0.4), label: '' });
      badge(ctx, 'מחוץ לשעות = רעש', prog(lt, noise, noise + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },
  b4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('לפתיחה'), type: 'pop' }, { lt: s.cue('הסטאפ'), type: 'pop' }, { lt: s.cue('הולך'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, day = s.cue('היום'), open = s.cue('לפתיחה'), setup = s.cue('הסטאפ'), go = s.cue('הולך');
      drawBG(ctx, s.t, { glow: 1.15 });
      headlines(ctx, lt, [{ t: 'לא יושב כל היום', at: day - 0.2, y: 420, size: 88, color: C.neon }]);
      const steps = [['מגיע לפתיחה', open, C.gold], ['מחפש את הסטאפ', setup, C.purple2], ['אין? הולך', go, '#3df2a6']];
      steps.forEach(([t, c, col], k) => { const y = 640 + k * 210; popT(ctx, W / 2, y, prog(lt, c - 0.1, c + 0.25), () => { glass(ctx, 180, y - 80, 720, 160, 28, { border: col, glowColor: col }); text(ctx, String(k + 1), 830, y, { size: 60, weight: 900, fam: MONO, color: col }); text(ctx, t, 760, y, { size: 50, weight: 900, align: 'right' }); });
        if (k < 2) arrow(ctx, W / 2, y + 85, W / 2, y + 125, prog(lt, c + 0.2, c + 0.4), { color: C.axis, width: 5, head: 18, glow: 0 }); });
    },
  },

  // ================= CH3: the three steps =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 6, 'שלושת הצעדים', '3-STEP ENTRY', { cueWord: 'שלושת' }); } },
  c1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue("צ'וק"), type: 'pop' }, { lt: s.cue('שובר'), type: 'impact', k: 1.3 }, { lt: s.cue('הראשונה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, cho = s.cue("צ'וק"), br = s.cue('שובר'), first = s.cue('הראשונה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 32], [d, 6, 32]], { p: [62600, 63600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 22], [br, CH_I + 0.98], [d, 26]], E.lin)[0], tfs: TFS, highlight: i => i === CH_I && lt > br });
      ch.zigzag(ctx, [[0, M1(0)], [5, M1(5)], [8, M1(8)], [13, M1(13)], [16, M1(16)], [21, M1(21)]], prog(lt, 0, cho), { color: '#ff7b8f', width: 4 });
      m1Base(ctx, ch, { choch: lt > br });
      nyLine(ctx, ch, 1);
      if (lt > br) { hit(ctx, ch.X(CH_I), ch.Y(M1(16)), lt, br, C.up, 220); ch.tag(ctx, CH_I, M1_C[CH_I].h, 'CHoCH', prog(lt, br, br + 0.3), { color: '#0b8f63', size: 28, off: 44 }); }
      badge(ctx, "צעד 1 · CHoCH", prog(lt, cho - 0.1, cho + 0.25), C.purple, 300, W / 2, 44);
    },
  },
  c2: {
    trans: 'none',
    events: s => [{ lt: s.cue('FVG'), type: 'pop' }, { lt: s.cue('המטרה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, fv = s.cue('FVG'), three = s.cue('נרות'), target = s.cue('המטרה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 32], [d, 12, 34]], { p: [62600, 63600] });
      ch.draw(ctx, { reveal: 26, tfs: TFS, highlight: i => i >= 23 && i <= 25 && lt > three });
      m1Base(ctx, ch, { choch: true }); nyLine(ctx, ch, 1, false);
      ch.tag(ctx, CH_I, M1_C[CH_I].h, 'CHoCH', 1, { color: '#0b8f63', size: 26, off: 44 });
      fvgZone(ctx, ch, 23, M1_G, 34, prog(lt, fv, fv + 0.5));
      if (lt > target) hit(ctx, ch.X(28), ch.Y(M1_MID), lt, target, C.gold, 180);
      badge(ctx, 'צעד 2 · FVG בכיוון', prog(lt, fv - 0.1, fv + 0.25), C.purple, 300, W / 2, 44);
    },
  },
  c3: {
    trans: 'none',
    events: s => [{ lt: s.cue('יחזור'), type: 'whoosh' }, { lt: s.cue('באמצע'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, back = s.cue('יחזור'), mid = s.cue('באמצע');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 34], [d, 14, 36]], { p: [62600, 63600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 26], [mid, 29.6], [d, 30]], E.lin)[0], tfs: TFS });
      m1Base(ctx, ch, { choch: true }); nyLine(ctx, ch, 1, false);
      fvgZone(ctx, ch, 23, M1_G, 36, 1, { mid: true, label: 'FVG' });
      if (lt > mid) { hit(ctx, ch.X(29), ch.Y(M1_MID), lt, mid, C.up, 200); popT(ctx, ch.X(29) + 120, ch.Y(M1_MID) + 46, prog(lt, mid, mid + 0.3), () => pill(ctx, 'כניסה: האמצע', ch.X(29) + 120, ch.Y(M1_MID) + 46, { size: 28, color: '#2962ff' })); }
      badge(ctx, 'צעד 3 · חזרה לאמצע הפער', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 42);
    },
  },
  c4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('רודף'), type: 'pop' }, { lt: s.cue('עסקה'), type: 'impact', k: 0.9 }, { lt: s.cue('מחר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, chase = s.cue('רודף'), none = s.cue('עסקה'), tmrw = s.cue('מחר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 36], [d, 12, 36]], { p: [62600, 64000] });
      ch.draw(ctx, { reveal: 26, tfs: TFS });
      fvgZone(ctx, ch, 23, M1_G, 36, 1, { mid: true, label: '' });
      ch.zigzag(ctx, [[25.5, 63280], [29, 63550], [33, 63900]], prog(lt, chase - 0.3, chase + 0.5), { color: 'rgba(255,255,255,0.6)', width: 5, dots: false });
      if (lt > none) cross(ctx, ch.X(31), ch.Y(63500), 32, prog(lt, none, none + 0.3));
      popT(ctx, W / 2, 300, prog(lt, none - 0.1, none + 0.25), () => pill(ctx, 'לא חזר לפער = אין עסקה', W / 2, 300, { size: 44, color: '#d61f45', glow: 40 }));
      badge(ctx, 'תמיד יש עסקה מחר', prog(lt, tmrw, tmrw + 0.35), '#0b8f63', 1270, W / 2, 40);
    },
  },
  c5: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('חסר'), type: 'pop' }, { lt: s.cue('פשרות'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, three = s.cue('שלושה'), miss = s.cue('חסר'), nc = s.cue('פשרות');
      drawBG(ctx, s.t, { glow: 1.15 });
      const items = [['CHoCH', three + 0.3], ['FVG', three + 0.7], ['חזרה לאמצע', three + 1.1]];
      items.forEach(([t, c], k) => { const y = 520 + k * 200, off = lt > miss && k === 1; popT(ctx, W / 2, y, prog(lt, c - 0.1, c + 0.25), () => { glass(ctx, 200, y - 75, 680, 150, 26, { border: off ? '#f23645' : '#16c784' }); text(ctx, String(k + 1), 810, y, { size: 56, weight: 900, fam: MONO, color: C.purple2 }); text(ctx, t, 740, y, { size: 52, weight: 900, align: 'right', alpha: off ? 0.35 : 1 }); (off ? cross : check)(ctx, 280, y, 34, 1); }); });
      if (lt > miss) popT(ctx, W / 2, 1180, prog(lt, miss, miss + 0.3), () => pill(ctx, 'אחד חסר = לא נכנס', W / 2, 1180, { size: 46, color: '#d61f45', glow: 40 }));
      headlines(ctx, lt, [{ t: 'בלי פשרות', at: nc - 0.2, y: 1320, size: 70, color: C.gold, glowColor: C.gold, kind: 'pop' }]);
    },
  },

  // ================= CH4: stop & target =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 6, 'סטופ ויעד', 'RISK 1 · REWARD 3-4', { cueWord: 'סטופ' }); } },
  d1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('הסטופ'), type: 'pop' }, { lt: s.cue('נכון'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, st = s.cue('הסטופ'), out = s.cue('מחוץ'), wrong = s.cue('נכון');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 36], [d, 16, 36]], { p: [62600, 63600] });
      ch.draw(ctx, { reveal: 29.6, tfs: TFS, highlight: i => i === 23 && lt > out });
      fvgZone(ctx, ch, 23, M1_G, 36, 1, { mid: true, label: '' });
      ch.hline(ctx, M1_MID, 29, 36, { color: '#fff', width: 4 });
      ch.hline(ctx, M1_SL, 22, 36, { color: C.down, width: 4, progress: prog(lt, st, st + 0.4) });
      popT(ctx, ch.X(32), ch.Y(M1_SL) + 36, prog(lt, out, out + 0.3), () => pill(ctx, 'סטופ: מתחת לנר 1', ch.X(32), ch.Y(M1_SL) + 36, { size: 28, color: '#d61f45' }));
      badge(ctx, 'שם הרעיון כבר לא נכון', prog(lt, wrong, wrong + 0.35), '#d61f45', 300, W / 2, 42);
    },
  },
  d2: {
    trans: 'none',
    events: s => [{ lt: s.cue('והיעד'), type: 'pop' }, { lt: s.cue('בסדר'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, tg = s.cue('והיעד'), ok = s.cue('בסדר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 16, 36], [d, 18, 46]], { p: [62600, 64000] });
      ch.draw(ctx, { reveal: 29.6, tfs: TFS });
      fvgZone(ctx, ch, 23, M1_G, 46, 1, { label: '', alpha: 0.2 });
      positionBox(ctx, ch, 29, 45, M1_MID, M1_SL, M1_TP, prog(lt, tg, tg + 0.8), { rr: true });
      [1, 2].forEach(k => { const p = M1_MID + k * 200; if (lt > tg + 0.3 + k * 0.2) { ch.hline(ctx, p, 29, 45, { color: 'rgba(255,255,255,0.5)', width: 2, dash: [6, 6] }); text(ctx, `${k}R`, ch.X(45) - 20, ch.Y(p) - 16, { size: 24, weight: 800, fam: MONO, color: '#fff', align: 'right' }); } });
      badge(ctx, 'יעד: פי 3 עד 4 מהסיכון', prog(lt, tg, tg + 0.35), '#0b8f63', 300, W / 2, 42);
    },
  },
  d3: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('החשבון'), type: 'pop' }, { lt: s.cue('שלושים'), type: 'pop' }, { lt: s.cue('ברווח'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, calc = s.cue('החשבון'), pct = s.cue('שלושים'), win = s.cue('ברווח');
      drawBG(ctx, s.t, { glow: 1.15 });
      wipeText(ctx, 'תעשה את החשבון', W / 2, 340, prog(lt, calc - 0.1, calc + 0.3), { size: 74, weight: 900 });
      // 10 trades: 3 winners (+3R), 7 losers (-1R)
      const res = [-1, 3, -1, -1, 3, -1, -1, -1, 3, -1];
      let acc = 0;
      res.forEach((r, k) => { const p = prog(lt, pct + k * 0.12, pct + k * 0.12 + 0.25); if (p <= 0) return; acc += r; const x = 170 + k * 82, h = Math.abs(r) * 70 * E.outBack(p), y0 = 820;
        ctx.save(); ctx.fillStyle = r > 0 ? '#16c784' : '#f23645'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 16; ctx.fillRect(x - 28, r > 0 ? y0 - h : y0, 56, h); ctx.restore(); });
      ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(130, 820); ctx.lineTo(950, 820); ctx.stroke(); ctx.restore();
      if (lt > pct + 0.4) text(ctx, '3 מתוך 10 עסקאות', W / 2, 1060, { size: 44, weight: 800, color: C.axis, alpha: prog(lt, pct + 0.4, pct + 0.7) });
      const pw = prog(lt, win - 0.2, win + 0.3);
      if (pw > 0) { popT(ctx, W / 2, 1180, pw, () => { glass(ctx, W / 2 - 300, 1110, 600, 140, 30, { border: '#16c784', glowColor: 'rgba(22,199,132,0.5)' }); text(ctx, '+9R  −7R  =  +2R', W / 2, 1182, { size: 54, weight: 800, fam: MONO, color: '#3df2a6' }); }); }
    },
  },
  d4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('קטן'), type: 'pop' }, { lt: s.cue('מדויקת'), type: 'pop' }, { lt: s.cue('לסיכון'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, small = s.cue('קטן'), prec = s.cue('מדויקת'), rr = s.cue('לסיכון');
      drawBG(ctx, s.t);
      const box = (x, label, risk, reward, col, p) => { if (p <= 0) return; const y0 = 980, k = 46; ctx.save(); ctx.globalAlpha = p;
        ctx.fillStyle = 'rgba(242,54,69,0.45)'; ctx.fillRect(x - 120, y0, 240, risk * k); ctx.fillStyle = 'rgba(22,199,132,0.4)'; ctx.fillRect(x - 120, y0 - reward * k * E.outCubic(p), 240, reward * k * E.outCubic(p));
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 120, y0); ctx.lineTo(x + 120, y0); ctx.stroke(); ctx.restore();
        text(ctx, label, x, 1280, { size: 40, weight: 900, color: col, alpha: p }); };
      box(760, 'כניסה מדויקת', 1, 3.5, '#3df2a6', prog(lt, small - 0.1, small + 0.4));
      box(320, 'כניסה מאוחרת', 4, 3.5, '#ff7b8f', prog(lt, prec, prec + 0.4));
      wipeText(ctx, 'סטופ קטן · יעד רחוק', W / 2, 330, prog(lt, small, small + 0.3), { size: 70, weight: 900, color: C.gold });
      if (lt > rr) { popT(ctx, 760, 460, prog(lt, rr, rr + 0.3), () => pill(ctx, '1 : 3.5', 760, 460, { size: 40, color: '#0b8f63', fam: MONO })); popT(ctx, 320, 460, prog(lt, rr + 0.2, rr + 0.5), () => pill(ctx, '1 : 0.9', 320, 460, { size: 40, color: '#d61f45', fam: MONO })); }
    },
    captions: false,
  },

  // ================= CH5: full trade =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 6, 'עסקה מלאה, מההתחלה', 'FULL WALKTHROUGH', { cueWord: 'עסקה' }); } },
  e1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('BOS'), type: 'pop' }, { lt: s.cue('המגמה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch15, bos = s.cue('BOS'), line = s.cue('המגמה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 40], [d, 14, 40]], { p: [59300, 65400] });
      ch.draw(ctx, { reveal: lerp(30, 36.4, prog(lt, bos, d)), tfs: TFS });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 42, 1, { color: C.teal, width: 6 });
      [20, 32].forEach((i, k) => ch.tag(ctx, i, PA(i), 'BOS', prog(lt, bos + k * 0.15, bos + k * 0.15 + 0.3), { color: '#0b8f63', size: 24, off: 40 }));
      if (lt > line) hit(ctx, ch.X(36), ch.Y(TL(36)), lt, line, C.gold, 180);
      badge(ctx, '1 · המפה ברבע שעה', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 44);
    },
  },
  e2: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('יורק'), type: 'pop' }, { lt: s.cue('למעלה'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, ny = s.cue('יורק'), up = s.cue('למעלה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [d, 4, 32]], { p: [62600, 63600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 18], [ny, 22], [up, CH_I + 0.98], [d, 25.5]], E.lin)[0], tfs: TFS, highlight: i => i === CH_I && lt > up });
      m1Base(ctx, ch, { choch: lt > up });
      nyLine(ctx, ch, prog(lt, ny - 0.2, ny + 0.2));
      if (lt > up) { hit(ctx, ch.X(CH_I), ch.Y(M1(16)), lt, up, C.up, 220); ch.tag(ctx, CH_I, M1_C[CH_I].h, 'CHoCH', prog(lt, up, up + 0.3), { color: '#0b8f63', size: 28, off: 44 }); }
      badge(ctx, '2 · יורדים לדקה', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 44);
    },
  },
  e3: {
    trans: 'none',
    events: s => [{ lt: s.cue('FVG'), type: 'pop' }, { lt: s.cue('נכנסים'), type: 'impact', k: 1.1 }, { lt: s.cue('סטופ'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, fv = s.cue('FVG'), enter = s.cue('נכנסים'), st = s.cue('סטופ');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 32], [d, 12, 36]], { p: [62600, 63600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 25.5], [fv, 26], [enter, 29.6], [d, 30]], E.lin)[0], tfs: TFS });
      m1Base(ctx, ch, { choch: true });
      fvgZone(ctx, ch, 23, M1_G, 36, prog(lt, fv - 0.1, fv + 0.4), { mid: true });
      if (lt > enter) { hit(ctx, ch.X(29), ch.Y(M1_MID), lt, enter, C.up, 180); ch.hline(ctx, M1_MID, 29, 36, { color: '#fff', width: 4 }); }
      ch.hline(ctx, M1_SL, 22, 36, { color: C.down, width: 4, progress: prog(lt, st, st + 0.4) });
      badge(ctx, '3 · FVG · כניסה · סטופ', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 44);
    },
  },
  e4: {
    trans: 'none',
    events: s => [{ lt: s.cue('רץ'), type: 'whoosh' }, { lt: s.cue('ארבע'), type: 'impact', k: 1.3 }, { lt: s.cue('שניות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = ch1, run = s.cue('רץ'), four = s.cue('ארבע'), secs = s.cue('שניות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 36], [d, 14, 47]], { p: [62600, 64100] });
      const rev = lerp(30, 45.9, prog(lt, run, four + 0.3));
      ch.draw(ctx, { reveal: rev, tfs: TFS });
      positionBox(ctx, ch, 29, 46, M1_MID, M1_SL, M1_TP, 1, { rr: true });
      const r = clamp((M1_C[Math.max(29, Math.floor(rev) - 1)].c - M1_MID) / 200, 0, (M1_TP - M1_MID) / 200);
      popT(ctx, 860, 300, prog(lt, run, run + 0.3), () => { glass(ctx, 740, 245, 240, 110, 22, { border: '#16c784' }); text(ctx, `+${r.toFixed(1)}R`, 860, 302, { size: 52, weight: 800, fam: MONO, color: '#3df2a6' }); });
      if (lt > four) hit(ctx, ch.X(44), ch.Y(M1_TP), lt, four, C.up, 240);
      popT(ctx, 360, 300, prog(lt, secs, secs + 0.3), () => pill(ctx, 'החלטה של שניות', 360, 300, { size: 36, color: C.purple }));
    },
  },

  // ================= CH6: what matters =================
  ch6: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 6, 6, 'מה שבאמת חשוב', 'REPEAT THE MODEL', { cueWord: 'מה' }); } },
  f1: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מושלמת'), type: 'pop' }, { lt: s.cue('הגדולה'), type: 'pop' }, { lt: s.cue('מדויק'), type: 'pop' }, { lt: s.cue('ושוב'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, perf = s.cue('מושלמת');
      drawBG(ctx, s.t, { glow: 1.15 });
      wipeText(ctx, 'הסוד: לא אסטרטגיה מושלמת', W / 2, 340, prog(lt, perf - 0.6, perf), { size: 58, weight: 900, color: C.gold });
      const items = [['ללכת עם התנועה הגדולה', s.cue('הגדולה')], ['להיות מדויק בכניסה', s.cue('מדויק')], ['לחזור על אותו מודל', s.cue('ושוב')]];
      items.forEach(([t, c], k) => { const y = 560 + k * 220; popT(ctx, W / 2, y, prog(lt, c - 0.1, c + 0.25), () => { glass(ctx, 140, y - 85, 800, 170, 28, { border: '#16c784' }); text(ctx, String(k + 1), 870, y, { size: 60, weight: 900, fam: MONO, color: '#3df2a6' }); text(ctx, t, 800, y, { size: 48, weight: 900, align: 'right' }); }); });
    },
  },
  f2: {
    trans: 'whip', captions: false,
    events: s => [{ lt: s.cue('יהיו'), type: 'pop' }, { lt: s.cue('סומך'), type: 'pop' }, { lt: s.cue('הכל'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, loss = s.cue('יהיו'), trust = s.cue('סומך'), all = s.cue('הכל');
      drawBG(ctx, s.t);
      // equity curve with drawdowns
      const res = [3, -1, -1, 3, -1, 3, -1, -1, -1, 3, -1, 3, 3, -1, -1, 3, -1, 3, -1, 3];
      const x0 = 140, x1 = 940, y0 = 1150, k = 26; let eq = 0; const pts = [[x0, y0]];
      res.forEach((r, i) => { eq += r; pts.push([lerp(x0, x1, (i + 1) / res.length), y0 - eq * k]); });
      const n = Math.floor(prog(lt, 0.2, d - 0.3) * pts.length);
      ctx.save(); glass(ctx, 100, 480, 880, 740, 30); ctx.strokeStyle = '#3df2a6'; ctx.lineWidth = 6; ctx.shadowColor = C.up; ctx.shadowBlur = 20; ctx.lineJoin = 'round'; ctx.beginPath();
      pts.slice(0, Math.max(2, n)).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
      if (lt > loss) pts.forEach(([x, y], i) => { if (i && i < n && res[i - 1] < 0) { ctx.save(); ctx.fillStyle = '#ff5a72'; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } });
      wipeText(ctx, 'הפסדים יהיו · וזה בסדר', W / 2, 330, prog(lt, loss - 0.1, loss + 0.3), { size: 64, weight: 900 });
      popT(ctx, W / 2, 1300, prog(lt, trust, trust + 0.35), () => pill(ctx, 'מודל שאתה סומך עליו', W / 2, 1300, { size: 44, color: '#0b8f63', glow: 40 }));
    },
  },
  f3: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('תנקה'), type: 'whoosh' }, { lt: s.cue('מאה'), type: 'pop' }, { lt: s.cue('ביטחון'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, clean = s.cue('תנקה'), one = s.cue('אחד'), hundred = s.cue('מאה'), conf = s.cue('ביטחון');
      drawBG(ctx, s.t, { glow: 1.2 });
      headlines(ctx, lt, [{ t: 'גרף נקי · מודל אחד', at: clean, y: 380, size: 76, color: C.neon }]);
      const n = Math.floor(lerp(0, 100, E.inOut(prog(lt, hundred - 0.3, conf + 0.2))));
      for (let k = 0; k < n; k++) { const cx = 175 + (k % 10) * 81, cy = 560 + Math.floor(k / 10) * 66; ctx.save(); ctx.fillStyle = k % 3 === 0 ? '#16c784' : 'rgba(192,132,252,0.55)'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      text(ctx, `×${n}`, W / 2, 1270, { size: 72, weight: 800, fam: MONO, color: C.gold, alpha: prog(lt, hundred - 0.3, hundred), glow: 20 });
      popT(ctx, W / 2, 1380, prog(lt, conf, conf + 0.35), () => pill(ctx, 'ככה בונים ביטחון', W / 2, 1380, { size: 44, color: C.purple, glow: 40 }));
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מפה'), type: 'pop' }, { lt: s.cue('יורק'), type: 'pop' }, { lt: s.cue('סטופ'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['מפה + הוראות', 'רבע שעה · דקה', C.purple, s.cue('מפה'), 'zz'],
        ['שלושה צעדים', 'CHoCH · FVG · אמצע', '#e0a100', s.cue('יורק'), 3],
        ['סטופ מחוץ לנר', 'יעד פי 3', '#0fa36b', s.cue('סטופ'), 'check'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('כיוון'), type: 'pop' }, { lt: s.cue('TradingView'), type: 'click' }, { lt: s.cue('אותו'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, dir = s.cue('כיוון'), tv = s.cue('TradingView'), read = s.cue('אותו');
      drawBG(ctx, s.t, { glow: 1.35, rain: 1.6 });
      const names = [['כיוון', s.cue('כיוון')], ['אישור', s.cue('אישור')], ['פסילה', s.cue('פסילה')], ['מודל כניסה', s.cue('כניסה')]];
      names.forEach(([n, c], k) => { const y = 440 + k * 130; popT(ctx, W / 2, y, prog(lt, c - 0.1, c + 0.25), () => { glass(ctx, 240, y - 52, 600, 104, 24); text(ctx, String(k + 1), 780, y + 2, { size: 46, weight: 900, fam: MONO, color: C.purple2 }); text(ctx, n, 720, y, { size: 48, weight: 900, align: 'right' }); check(ctx, 310, y, 28, 1); }); });
      popT(ctx, W / 2, 1040, prog(lt, tv - 0.1, tv + 0.3), () => pill(ctx, 'TradingView · גרף נקי', W / 2, 1040, { size: 46, color: '#2962ff', glow: 40 }));
      popT(ctx, W / 2, 1190, prog(lt, read - 0.1, read + 0.35), () => pill(ctx, 'ותתחיל לקרוא אותו', W / 2, 1190, { size: 56, color: '#0b8f63', glow: 55 }));
      if (lt > read) { ring(ctx, W / 2, 1190, 560, prog(lt, read, read + 0.7), C.up); burst(ctx, W / 2, 1190, prog(lt, read, read + 1), C.up, 36, 9, 420); }
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

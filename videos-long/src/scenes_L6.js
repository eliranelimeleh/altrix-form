// L6 — Price Action series, part 1 of 3: pillar 1, the map (levels)
'use strict';
// ---------- data ----------
// hook: a choppy chart that keeps respecting one support (61200) under a pile of indicators
const IND = [[0, 62600], [5, 63700], [10, 61220], [16, 63500], [21, 61260], [27, 63900], [32, 61210], [38, 63300], [44, 62000]];
const INDC = genCandles(IND, { seed: 21, noise: 0.18 });
const chI = new Chart(INDC);
const I_SUP = 61200;
const E20 = emaSeries(INDC, 8), E50 = emaSeries(INDC, 18), BB = bollinger(INDC, 12, 2);
const MACD = emaSeries(INDC, 6).map((v, i) => Math.abs(v - emaSeries(INDC, 13)[i]) + 30), RSI = rsiSeries(INDC, 10);
const IND_NAMES = ['EMA 20', 'EMA 50', 'Bollinger', 'MACD', 'RSI'];
// main map: a range between support 60000 and resistance 64000, then a knife through support
const RG = [[0, 62200], [4, 63980], [9, 60060], [14, 63950], [19, 60020], [24, 64000], [29, 60040], [34, 63970], [39, 61800], [42, 60900], [47, 57800]];
const RGC = override(genCandles(RG, { seed: 9, noise: 0.15 }), {
  29: { o: 60520, h: 60600, l: 59650, c: 60380 },
  44: { o: 60700, h: 60750, l: 59050, c: 59150 },
});
RGC[29].o = RGC[28].c; RGC[44].o = RGC[43].c;
const chR = new Chart(RGC, { tf: '1D' });
const SUP = 60000, RES = 64000;
const PR = i => RG.find(p => p[0] === i)[1];
const SUP_T = [9, 19, 29], RES_T = [4, 14, 24, 34];
// the loop: buy near a high, price runs straight against you
const LP = [[0, 61800], [8, 63300], [11, 62700], [14, 63400], [24, 60900]];
const LPC = genCandles(LP, { seed: 3, noise: 0.15 });
const chL = new Chart(LPC, { tf: '1H' });
const L_IN = LPC[14].c;
// setup 1: resistance 62000 broken, retested from above, holds
const FL = [[0, 60400], [5, 61980], [9, 60900], [14, 62000], [18, 61150], [24, 63700], [29, 62120], [40, 65200]];
const FLC = genCandles(FL, { seed: 17, noise: 0.15 });
const chF = new Chart(FLC);
const LV1 = 62000;
// setup 2: support 60000 lost on a close, reclaimed on a close
const RC = [[0, 62500], [6, 60050], [11, 61800], [17, 60030], [22, 61400], [26, 59300], [38, 62600]];
const RCC = override(genCandles(RC, { seed: 28, noise: 0.15 }), {
  24: { o: 60300, h: 60350, l: 59750, c: 59800 },
  29: { o: 59750, h: 60480, l: 59700, c: 60380 },
});
RCC[24].o = RCC[23].c; RCC[29].o = RCC[28].c; RCC[29].l = Math.min(RCC[29].l, RCC[29].o);
const chC = new Chart(RCC);
// setup 3: strong resistance 64000, shooting-star rejection, sell-off
const RJ = [[0, 61000], [6, 63950], [11, 62300], [18, 63960], [24, 62600], [30, 64000], [40, 61200]];
const RJC = override(genCandles(RJ, { seed: 40, noise: 0.15 }), { 30: { o: 63640, h: 64380, l: 63520, c: 63560 } });
RJC[30].o = RJC[29].c;
const chJ = new Chart(RJC);

// ---------- local helpers ----------
function flashCol(ctx, lt, t, col = '255,40,70', a = 0.25) { const f = Math.max(0, 1 - (lt - t) / 0.3); if (lt >= t && f > 0) { ctx.fillStyle = `rgba(${col},${a * f})`; ctx.fillRect(0, 0, W, H); } }
function hit(ctx, x, y, lt, t, col = C.gold, r = 220) { ring(ctx, x, y, r, prog(lt, t, t + 0.6), col); burst(ctx, x, y, prog(lt, t, t + 0.9), col, 26, Math.floor(t * 10) + 3, r * 1.1); }
// indicator overlays on the hook chart; ps = per-indicator visibility 0..1
function drawInds(ctx, ch, rv, ps, jitter = 0) {
  const n = Math.ceil(rv);
  ctx.save(); if (jitter) ctx.translate((Math.random() - 0.5) * 0, 0);
  if (ps[2] > 0) { lineSeries(ctx, ch, BB.map(b => b.u), n, { color: '#2962ff', width: 3, alpha: ps[2] * 0.9 }); lineSeries(ctx, ch, BB.map(b => b.l), n, { color: '#2962ff', width: 3, alpha: ps[2] * 0.9 }); }
  if (ps[0] > 0) lineSeries(ctx, ch, E20, n, { color: C.gold, width: 4, alpha: ps[0] });
  if (ps[1] > 0) lineSeries(ctx, ch, E50, n, { color: C.teal, width: 4, alpha: ps[1] });
  if (ps[3] > 0) { ctx.save(); ctx.globalAlpha *= ps[3]; volumeBars(ctx, ch, MACD, rv, { h: 110, alpha: 0.5 }); ctx.restore(); }
  if (ps[4] > 0) { ctx.save(); ctx.globalAlpha *= ps[4]; ctx.translate(0, (1 - E.outCubic(ps[4])) * 60); oscPane(ctx, ch, 1070, 240, RSI, rv, { label: 'RSI' }); ctx.restore(); }
  ctx.restore();
}
function indChips(ctx, lt, ts, y = 1375, fade = 1) {
  ts.forEach((t, k) => { const x = 930 - k * 196, p = prog(lt, t, t + 0.3) * fade; if (p <= 0) return;
    popT(ctx, x, y, p, () => pill(ctx, IND_NAMES[k], x, y, { size: 26, color: ['#b8860b', '#0e9e8a', '#2962ff', '#7c3aed', '#9c27b0'][k], pad: 14, glow: 16 })); });
}
// four pillars (columns) of the series; hi = highlighted index, ts = pop-in cue per pillar
const PIL = [['המפה', 'MAP', C.purple2], ['האישור', 'CONFIRM', C.teal], ['הביטול', 'INVALID', '#ff5a72'], ['ההקשר', 'CONTEXT', C.gold]];
function pillars(ctx, lt, ts, hi = -1, y = 620, h = 560, o = {}) {
  const { dimOthers = 0, done = -1 } = o;
  ts.forEach((t, k) => {
    const p = prog(lt, t - 0.05, t + 0.4); if (p <= 0) return;
    const x = 930 - k * 260 - 90, [he, en, col] = PIL[k], on = k === hi, e = E.outBack(p);
    ctx.save(); ctx.globalAlpha = clamp(p * 2) * (on || dimOthers === 0 ? 1 : 1 - dimOthers * 0.6);
    const hh = h * e;
    // capital + base
    glass(ctx, x - 20, y + h - hh - 30, 220, 40, 12, { border: col, glowColor: col, glow: on ? 50 : 20 });
    glass(ctx, x, y + h - hh + 10, 180, hh - 20, 18, { border: col, glowColor: col, glow: on ? 60 : 18, fill: on ? 'rgba(60,30,110,0.85)' : 'rgba(18,12,36,0.8)' });
    glass(ctx, x - 20, y + h - 10, 220, 40, 12, { border: col, glowColor: col, glow: 18 });
    // fluting
    ctx.save(); ctx.globalAlpha *= 0.25; ctx.strokeStyle = col; ctx.lineWidth = 3;
    for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(x + j * 45, y + h - hh + 40); ctx.lineTo(x + j * 45, y + h - 30); ctx.stroke(); } ctx.restore();
    text(ctx, String(k + 1), x + 90, y + h - hh + 90, { size: 70, weight: 900, fam: MONO, color: on ? '#fff' : col, glow: on ? 30 : 0, glowColor: col });
    text(ctx, he, x + 90, y + h - hh + 200, { size: 44, weight: 900, color: '#fff' });
    text(ctx, en, x + 90, y + h - hh + 250, { size: 24, weight: 800, color: col, spacing: 2 });
    if (k <= done) check(ctx, x + 90, y + h - 90, 26, 1, col);
    ctx.restore();
    if (on) ring(ctx, x + 90, y + h / 2, 360, prog(lt, t, t + 0.8), col);
  });
}
function eye(ctx, x, y, r, col = '#fff', slash = 0) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - r, y); ctx.quadraticCurveTo(x, y - r * 0.9, x + r, y); ctx.quadraticCurveTo(x, y + r * 0.9, x - r, y); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r * 0.32, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
  if (slash > 0) { ctx.beginPath(); ctx.moveTo(x - r * 0.9, y - r * 0.8); ctx.lineTo(x - r * 0.9 + r * 1.8 * slash, y - r * 0.8 + r * 1.6 * slash); ctx.stroke(); }
  ctx.restore();
}
// map pin
function pin(ctx, x, y, p, col = C.gold) {
  popT(ctx, x, y, p, () => { ctx.save(); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.arc(x, y - 46, 26, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - 46, 10, 0, Math.PI * 2); ctx.fillStyle = '#1a0f00'; ctx.fill(); ctx.restore(); });
}
function arrowsAt(ctx, ch, list, P, lt, t0, up, dt = 0.18, col) {
  list.forEach((i, k) => { const p = prog(lt, t0 + k * dt, t0 + k * dt + 0.35); if (p <= 0) return;
    const y = ch.Y(P(i)), x = ch.X(i), d = up ? 1 : -1;
    arrow(ctx, x, y + d * 150, x, y + d * 30, p, { color: col || (up ? C.up : C.down), width: 8, head: 26 }); });
}

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('אינדיקטור'), type: 'pop' }, { lt: s.cue('עוד', 1), type: 'pop' }, { lt: s.cue('יסתדר'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, one = s.cue('אינדיקטור'), more = s.cue('עוד', 1), fine = s.cue('יסתדר');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 680).view(...kf(lt, [[0, 10, 40], [d, 4, 44]]), ...[60300, 64700]);
      const rv = 44.9;
      ch.draw(ctx, { reveal: rv });
      const ts = [one - 0.2, one + 0.35, more, more + 0.35, fine - 0.2];
      drawInds(ctx, ch, rv, ts.map(t => prog(lt, t, t + 0.4)));
      indChips(ctx, lt, ts);
      wipeText(ctx, 'רק עוד אינדיקטור אחד…', W / 2, 300, prog(lt, 0.05, 0.4), { size: 64, weight: 900 });
      if (lt > fine) { popT(ctx, W / 2, 720, prog(lt, fine, fine + 0.3), () => pill(ctx, 'והכל יסתדר?', W / 2, 720, { size: 64, color: '#b8860b', glow: 50 })); ring(ctx, W / 2, 720, 480, prog(lt, fine, fine + 0.7), C.gold); }
    },
  },
  hook2: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('חמישה'), type: 'pop' }, { lt: s.cue('קנה'), type: 'pop' }, { lt: s.cue('מכור'), type: 'pop' }, { lt: s.cue('תקוע'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, five = s.cue('חמישה'), buy = s.cue('קנה'), sell = s.cue('מכור'), stuck = s.cue('תקוע');
      drawBG(ctx, s.t, { hue: lt > stuck ? 30 : 0 });
      ch.layout(40, 370, 1000, 680).view(...kf(lt, [[0, 4, 44], [d, 8, 45]]), 60300, 64700);
      ch.draw(ctx, { reveal: 44.9 });
      drawInds(ctx, ch, 44.9, [1, 1, 1, 1, 1]);
      indChips(ctx, lt, [0, 0, 0, 0, 0]);
      text(ctx, '5', 120, 1375, { size: 60, weight: 900, fam: MONO, color: C.gold, alpha: prog(lt, five, five + 0.3), glow: 30, glowColor: C.gold });
      const sig = [[820, 520, 'BUY', '#0b8f63'], [300, 600, 'BUY', '#0b8f63'], [620, 880, 'BUY', '#0b8f63'], [430, 480, 'SELL', '#d61f45'], [780, 780, 'SELL', '#d61f45']];
      sig.forEach(([x, y, t, col], k) => {
        const at = k < 3 ? buy - 0.2 + k * 0.15 : sell - 0.2 + (k - 3) * 0.15, p = prog(lt, at, at + 0.3); if (p <= 0) return;
        const blink = lt > stuck ? 0.55 + 0.45 * Math.sin(lt * 16 + k * 2) : 1;
        ctx.save(); ctx.globalAlpha *= blink; popT(ctx, x, y, p, () => pill(ctx, t, x, y, { size: 38, color: col, glow: 30 })); ctx.restore();
      });
      text(ctx, '3 × BUY', 760, 300, { size: 48, weight: 900, fam: MONO, color: '#3df2a6', alpha: prog(lt, buy, buy + 0.3) * (1 - prog(lt, stuck - 0.2, stuck)) });
      text(ctx, '2 × SELL', 320, 300, { size: 48, weight: 900, fam: MONO, color: '#ff5a72', alpha: prog(lt, sell, sell + 0.3) * (1 - prog(lt, stuck - 0.2, stuck)) });
      const ps = prog(lt, stuck - 0.1, stuck + 0.25);
      if (ps > 0) { scrim(ctx, 0.5 * ps); popT(ctx, W / 2, 700, ps, () => text(ctx, 'תקוע באמצע', W / 2, 700, { size: 150, weight: 900, color: C.gold, glow: 60, glowColor: C.gold })); ring(ctx, W / 2, 700, 620, prog(lt, stuck, stuck + 0.7), C.gold); }
    },
  },
  hook3: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('מחקתי'), type: 'impact', k: 1.3 }, { lt: s.cue('וקו'), type: 'pop' }, { lt: s.cue('לדבר'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, del = s.cue('מחקתי'), cand = s.cue('נרות'), line = s.cue('וקו'), talk = s.cue('לדבר');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970).view(...kf(lt, [[0, 6, 45], [d, 8, 45]]), 60200, 64600);
      ch.draw(ctx, { reveal: 44.9, dim: 0.35 * (1 - prog(lt, cand, cand + 0.4)) + 0.35 * prog(lt, line, line + 0.4) * (1 - prog(lt, talk, talk + 0.3)) });
      const gone = prog(lt, del, del + 0.5);
      if (gone < 1) { ctx.save(); ctx.translate(Math.sin(lt * 90) * 18 * gone, 0); drawInds(ctx, ch, 44.9, [1, 1, 1, 1, 0].map(v => v * (1 - gone))); ctx.restore(); }
      if (lt > del) flashCol(ctx, lt, del, '190,120,255', 0.35);
      ch.hline(ctx, I_SUP, 0, 45, { color: C.gold, width: 6, glow: 30, progress: prog(lt, line, line + 0.6) });
      [10, 21, 32].forEach((i, k) => { const t = talk - 0.3 + k * 0.2; ch.dot(ctx, i, IND.find(p => p[0] === i)[1], prog(lt, t, t + 0.3), C.gold, 14); ch.tag(ctx, i, I_SUP, String(k + 1), prog(lt, t, t + 0.3), { color: '#b8860b', above: false, size: 30, off: 52 }); });
      wipeText(ctx, 'מחקתי הכל', W / 2, 300, prog(lt, del - 0.05, del + 0.3) * (1 - prog(lt, line - 0.2, line)), { size: 72, weight: 900, color: '#ff5a72' });
      wipeText(ctx, 'רק נרות · וקו אחד', W / 2, 300, prog(lt, line - 0.05, line + 0.3) * (1 - prog(lt, talk - 0.2, talk)), { size: 66, weight: 900, color: C.gold });
      if (lt > talk) { popT(ctx, W / 2, 300, prog(lt, talk, talk + 0.3), () => pill(ctx, 'הגרף התחיל לדבר', W / 2, 300, { size: 54, color: C.purple, glow: 50 })); hit(ctx, ch.X(21), ch.Y(I_SUP), lt, talk, C.gold, 260); }
    },
  },
  intro: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('שלושה'), type: 'pop' }, { lt: s.cue('המפה'), type: 'pop' }, { lt: s.cue('האישור'), type: 'pop' }, { lt: s.cue('הביטול'), type: 'pop' }, { lt: s.cue('וההקשר'), type: 'pop' }, { lt: s.cue('המפה', 1), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, three = s.cue('שלושה'), pa = s.cue('Price'), first = s.cue('הראשון'), map = s.cue('המפה', 1);
      drawBG(ctx, s.t, { glow: 1.25 });
      wipeText(ctx, 'סדרה · 3 סרטונים', W / 2, 300, prog(lt, three - 0.1, three + 0.3) * (1 - prog(lt, pa - 0.2, pa)), { size: 64, weight: 900, color: C.neon });
      wipeText(ctx, '4 עמודים של PRICE ACTION', W / 2, 300, prog(lt, pa - 0.05, pa + 0.35), { size: 58, weight: 900, color: C.neon });
      pillars(ctx, lt, [s.cue('המפה'), s.cue('האישור'), s.cue('הביטול'), s.cue('וההקשר')], lt > first ? 0 : -1, 470, 620, { dimOthers: prog(lt, first, first + 0.4) });
      // which video covers which pillar
      const pv = prog(lt, s.cue('וההקשר') + 0.3, s.cue('וההקשר') + 0.7) * (1 - prog(lt, first - 0.1, first + 0.2));
      if (pv > 0) [[840, 'חלק 1', 0], [580, 'חלק 2', 1], [195, 'חלק 3', 2]].forEach(([x, t, k]) => { const w = k === 2 ? 520 : 200; ctx.save(); ctx.globalAlpha = pv; glass(ctx, x - w / 2, 1150, w, 60, 18, { border: C.purple2 }); text(ctx, t, x, 1181, { size: 30, weight: 800, color: C.purple2 }); ctx.restore(); });
      if (lt > map) { popT(ctx, W / 2, 1260, prog(lt, map, map + 0.3), () => pill(ctx, 'היום: המפה', W / 2, 1260, { size: 58, color: C.purple, glow: 50 })); }
    },
  },

  // ================= CH1: the indicator loop =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 6, 'לולאת האינדיקטורים', 'THE INDICATOR LOOP', { cueWord: 'לולאת' }); } },
  lp1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('נכנס'), type: 'click' }, { lt: s.cue('נגדך'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chL, inn = s.cue('נכנס'), against = s.cue('נגדך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 22], [d, 4, 25]], { p: [60500, 64000] });
      const rv = kf(lt, [[0, 12], [inn, 14.9], [against - 0.3, 16], [d, 23.5]], E.lin)[0];
      const last = ch.draw(ctx, { reveal: rv });
      if (lt > inn) {
        ch.hline(ctx, L_IN, 14, 25, { color: '#2962ff', width: 4, progress: prog(lt, inn, inn + 0.4) });
        popT(ctx, ch.X(14) - 100, ch.Y(L_IN) - 60, prog(lt, inn, inn + 0.3), () => pill(ctx, 'BUY', ch.X(14) - 100, ch.Y(L_IN) - 60, { size: 30, color: '#2962ff' }));
        if (last && last.c < L_IN) ch.zone(ctx, L_IN, last.c, 14, Math.max(14.5, rv), { color: C.down, alpha: 0.25 });
      }
      if (lt > against) { flashCol(ctx, lt, against); popT(ctx, W / 2, 300, prog(lt, against, against + 0.3), () => pill(ctx, 'הולכת נגדך ↓', W / 2, 300, { size: 52, color: '#d61f45', glow: 45 })); }
      badge(ctx, 'הלולאה', prog(lt, 0.05, 0.4) * (1 - prog(lt, against - 0.2, against)), C.purple, 300, W / 2, 44);
      if (last && lt > inn + 0.5 && last.c < L_IN) text(ctx, '-$' + fmt((L_IN - last.c) * 0.5), ch.X(20), ch.Y((L_IN + last.c) / 2), { size: 44, weight: 900, fam: MONO, color: '#ff5a72', glow: 20, glowColor: C.down });
    },
  },
  lp2: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מחפש'), type: 'pop' }, { lt: s.cue('מוסיף'), type: 'pop' }, { lt: s.cue('מחדש'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, look = s.cue('מחפש'), add = s.cue('מוסיף'), again = s.cue('מחדש');
      drawBG(ctx, s.t, { glow: 1.15 });
      const cx = W / 2, cy = 820, R0 = 300;
      const nodes = [['עסקה', '#2962ff', -90, 0.05], ['הפסד', '#d61f45', 0, 0.4], ['מחפש אינדיקטור', '#b8860b', 90, look], ['מוסיף לגרף', C.purple, 180, add]];
      // loop ring
      const pr = prog(lt, 0, again);
      ctx.save(); ctx.strokeStyle = 'rgba(192,132,252,0.35)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pr); ctx.stroke(); ctx.restore();
      const spin = lt > again ? (lt - again) * 5 : 0, ah = -Math.PI / 2 + Math.PI * 2 * pr + spin;
      if (pr > 0.02) { ctx.save(); ctx.translate(cx + Math.cos(ah) * R0, cy + Math.sin(ah) * R0); ctx.rotate(ah + Math.PI / 2); ctx.fillStyle = C.purple2; ctx.shadowColor = C.purple; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-16, -22); ctx.lineTo(-16, 22); ctx.closePath(); ctx.fill(); ctx.restore(); }
      nodes.forEach(([t, col, deg, at]) => { const a = deg * Math.PI / 180, x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0; popT(ctx, x, y, prog(lt, at, at + 0.35), () => pill(ctx, t, x, y, { size: 38, color: col, glow: 30 })); });
      // indicators piling up in the middle
      const n = Math.floor(prog(lt, add, again + 0.8) * 5 + (lt > add ? 1 : 0));
      for (let k = 0; k < Math.min(5, n); k++) { const y = cy + 80 - k * 46; popT(ctx, cx, y, 1, () => pill(ctx, IND_NAMES[k], cx, y, { size: 26, color: 'rgba(124,58,237,0.8)', glow: 10, pad: 14 })); }
      if (lt > again) { text(ctx, '∞', cx, cy - 190, { size: 110, weight: 900, color: C.gold, glow: 40, glowColor: C.gold, alpha: prog(lt, again, again + 0.3) }); ring(ctx, cx, cy, 520, prog(lt, again, again + 0.7)); }
      wipeText(ctx, 'והמעגל מתחיל מחדש', W / 2, 300, prog(lt, again - 0.1, again + 0.3), { size: 64, weight: 900, color: C.gold });
    },
  },
  lp3: {
    trans: 'whip', captions: false,
    events: s => [{ lt: s.cue('האינדיקטור'), type: 'pop' }, { lt: s.cue('מסגרת'), type: 'pop' }, { lt: s.cue('ניחוש'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, ind = s.cue('האינדיקטור'), frame = s.cue('מסגרת'), guess = s.cue('ניחוש');
      drawBG(ctx, s.t);
      // 1: the indicator is not the problem
      const p1 = prog(lt, ind - 0.2, ind + 0.2) * (1 - prog(lt, frame - 0.3, frame));
      if (p1 > 0) { popT(ctx, W / 2, 720, p1, () => pill(ctx, 'האינדיקטור', W / 2, 720, { size: 72, color: '#7c3aed', glow: 40 })); cross(ctx, W / 2 + 280, 720, 50, prog(lt, ind + 0.2, ind + 0.5)); text(ctx, 'הוא לא הבעיה', W / 2, 860, { size: 56, weight: 900, alpha: p1 * prog(lt, ind + 0.2, ind + 0.5) }); }
      // 2: no framework underneath: stacked decision blocks floating on an empty dashed foundation
      const p2 = prog(lt, frame - 0.2, frame + 0.3);
      if (p2 > 0) {
        const wob = lt > guess ? Math.sin(lt * 9) * 14 : Math.sin(lt * 3) * 4;
        ['כניסה', 'יציאה', 'סטופ'].forEach((t, k) => { const y = 600 + k * 130; popT(ctx, W / 2 + wob * (k + 1) * 0.6, y, prog(lt, frame + k * 0.15, frame + k * 0.15 + 0.3), () => { glass(ctx, W / 2 - 200 + wob * (k + 1) * 0.6, y - 50, 400, 100, 20, { border: C.purple2 }); text(ctx, t, W / 2 + wob * (k + 1) * 0.6, y, { size: 46, weight: 900 }); }); });
        ctx.save(); ctx.globalAlpha = p2; ctx.setLineDash([16, 12]); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 5; rrect(ctx, 240, 1000, 600, 110, 22); ctx.stroke(); ctx.restore();
        text(ctx, 'מסגרת?', W / 2, 1056, { size: 52, weight: 900, color: '#ff5a72', alpha: p2 });
      }
      const pg = prog(lt, guess - 0.1, guess + 0.3);
      if (pg > 0) { popT(ctx, W / 2, 1250, pg, () => pill(ctx, 'ניתוח = ניחוש', W / 2, 1250, { size: 60, color: '#d61f45', glow: 50 })); hit(ctx, W / 2, 1250, lt, guess, C.down, 300); }
      wipeText(ctx, 'אז מה הבעיה?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 66, weight: 900, color: C.purple2 });
    },
  },
  lp4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('בטוח'), type: 'pop' }, { lt: s.cue('סיכון'), type: 'impact', k: 0.9 }, { lt: s.cue('לחזור'), type: 'pop' }, { lt: s.cue('דרך'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, simple = s.cue('פשוט'), safe = s.cue('בטוח'), risk = s.cue('סיכון'), rep = s.cue('לחזור'), same = s.cue('באותה');
      drawBG(ctx, s.t, { glow: 1.15 });
      const out = rep - 0.3;
      const card = (x, t, col, p) => popT(ctx, x, 600, p, () => { glass(ctx, x - 190, 500, 380, 200, 30, { border: col, glowColor: col }); text(ctx, t, x, 600, { size: 76, weight: 900, color: '#fff' }); });
      ctx.save(); ctx.globalAlpha = 1 - prog(lt, out, out + 0.3);
      card(780, 'פשוט', C.purple2, prog(lt, simple - 0.1, simple + 0.3));
      card(300, 'בטוח', '#ff5a72', prog(lt, safe - 0.1, safe + 0.3));
      text(ctx, '≠', W / 2, 600, { size: 120, weight: 900, color: C.gold, glow: 30, glowColor: C.gold, alpha: prog(lt, safe, safe + 0.3) });
      if (lt > risk) { warnIcon(ctx, W / 2, 900, 70, prog(lt, risk, risk + 0.3)); text(ctx, 'במסחר תמיד יש סיכון', W / 2, 1040, { size: 52, weight: 900, color: C.gold, alpha: prog(lt, risk, risk + 0.3) }); }
      ctx.restore();
      const pr = prog(lt, rep - 0.1, rep + 0.35);
      if (pr > 0) {
        popT(ctx, W / 2, 560, pr, () => text(ctx, 'פשוט = לחזור על זה', W / 2, 560, { size: 84, weight: 900, glow: 30, glowColor: C.purple }));
        // repeat loop icon + ticks
        const ang = (lt - rep) * 3; ctx.save(); ctx.globalAlpha = pr; ctx.strokeStyle = C.teal; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.shadowColor = C.teal; ctx.shadowBlur = 30;
        ctx.beginPath(); ctx.arc(W / 2, 830, 110, ang, ang + Math.PI * 1.6); ctx.stroke(); const ex = W / 2 + Math.cos(ang + Math.PI * 1.6) * 110, ey = 830 + Math.sin(ang + Math.PI * 1.6) * 110;
        ctx.fillStyle = C.teal; ctx.translate(ex, ey); ctx.rotate(ang + Math.PI * 1.6 + Math.PI / 2); ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-16, -24); ctx.lineTo(-16, 24); ctx.closePath(); ctx.fill(); ctx.restore();
        for (let k = 0; k < 5; k++) { const t = same - 0.4 + k * 0.15; check(ctx, 780 - k * 120, 1060, 34, prog(lt, t, t + 0.3), C.teal); }
        text(ctx, 'כל פעם · באותה דרך', W / 2, 1180, { size: 54, weight: 900, color: C.teal, alpha: prog(lt, same, same + 0.3) });
      }
    },
  },

  // ================= CH2: what the chart shows =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 6, 'מה הגרף באמת מראה', 'READING THE CHART', { cueWord: 'מה' }); } },
  dc1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('רעש'), type: 'pop' }, { lt: s.cue('יומן'), type: 'pop' }, { lt: s.cue('קונים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, noise = s.cue('רעש'), log = s.cue('יומן'), bs = s.cue('קונים');
      drawBG(ctx, s.t);
      orderRain(ctx, lt, 18, 61, prog(lt, bs, bs + 0.5) * 0.8);
      stdChart(ch, lt, [[0, 0, 40], [d, 2, 40]], { p: [59000, 65000] });
      ch.draw(ctx, { reveal: lerp(18, 39.5, prog(lt, 0, d - 0.3)) });
      if (lt < log + 0.3) { ctx.save(); ctx.globalAlpha = prog(lt, noise - 0.2, noise) * (1 - prog(lt, log, log + 0.3)); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 5; ctx.beginPath(); for (let x = 140; x < 900; x += 12) ctx.lineTo(x, 300 + Math.sin(x * 0.2 + lt * 20) * 18 + (hash(x) - 0.5) * 22); ctx.stroke(); ctx.restore(); cross(ctx, 960, 300, 30, prog(lt, noise + 0.2, noise + 0.5) * (1 - prog(lt, log, log + 0.3))); }
      popT(ctx, W / 2, 300, prog(lt, log, log + 0.35), () => pill(ctx, 'יומן של החלטות', W / 2, 300, { size: 52, color: C.purple, glow: 45 }));
      popT(ctx, 740, 1270, prog(lt, bs, bs + 0.3), () => pill(ctx, 'קונים', 740, 1270, { size: 40, color: '#0b8f63' }));
      popT(ctx, 340, 1270, prog(lt, bs + 0.3, bs + 0.6), () => pill(ctx, 'מוכרים', 340, 1270, { size: 40, color: '#d61f45' }));
    },
  },
  dc2: {
    trans: 'none',
    events: s => [{ lt: s.cue('המוכרים'), type: 'pop' }, { lt: s.cue('ועצרו'), type: 'impact', k: 0.9 }, { lt: s.cue('הקונים'), type: 'pop' }, { lt: s.cue('והחזיקו'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, sel = s.cue('המוכרים'), stop = s.cue('ועצרו'), buy = s.cue('הקונים'), held = s.cue('והחזיקו');
      drawBG(ctx, s.t);
      const fx = kf(lt, [[0, 2, 40], [sel, 4, 26], [buy - 0.3, 4, 26], [buy + 0.4, 8, 30], [d, 8, 31]]);
      stdChart(ch, lt, [[0, ...fx]], { p: [59000, 65000] }); ch.view(fx[0], fx[1], 59000, 65000);
      ch.draw(ctx, { reveal: 39.5, dim: 0.45, highlight: i => (i === 14 && lt > sel) || (i === 19 && lt > buy) });
      if (lt > sel) { ch.tag(ctx, 14, PR(14), 'המוכרים', prog(lt, sel, sel + 0.3), { color: '#d61f45', size: 32, off: 60 }); arrowsAt(ctx, ch, [14], PR, lt, stop, false); if (lt > stop) hit(ctx, ch.X(14), ch.Y(PR(14)), lt, stop, C.down, 180); }
      if (lt > buy) { ch.tag(ctx, 19, PR(19), 'הקונים', prog(lt, buy, buy + 0.3), { color: '#0b8f63', above: false, size: 32, off: 60 }); arrowsAt(ctx, ch, [19], PR, lt, held, true); if (lt > held) hit(ctx, ch.X(19), ch.Y(PR(19)), lt, held, C.up, 180); }
      badge(ctx, 'כאן התקבלו החלטות', prog(lt, 0.05, 0.4), C.purple, 300, W / 2, 44);
    },
  },
  dc3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('תמיד'), type: 'pop' }, { lt: s.cue('השכבות'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, always = s.cue('תמיד'), layers = s.cue('השכבות'), see = s.cue('ראיתי');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 40], [d, 1, 40]], { p: [59000, 65000] });
      ch.draw(ctx, { reveal: 39.5 });
      // decisions marked on the chart
      SUP_T.forEach((i, k) => ch.dot(ctx, i, PR(i), prog(lt, always + k * 0.12, always + k * 0.12 + 0.3), '#3df2a6', 13));
      RES_T.forEach((i, k) => ch.dot(ctx, i, PR(i), prog(lt, always + k * 0.12, always + k * 0.12 + 0.3), '#ff5a72', 13));
      // translucent layers that hid it; they fly off
      const off = E.inCubic(prog(lt, layers - 0.2, layers + 0.8));
      ['RSI', 'MACD', 'Bollinger', 'EMA 50', 'EMA 20'].forEach((t, k) => {
        const y = 520 + k * 150 - off * (900 + k * 200), a = prog(lt, see - 0.6, see - 0.3) * (1 - off);
        if (a <= 0) return;
        ctx.save(); ctx.globalAlpha = a * 0.85; glass(ctx, 120 + k * 12, y, 840 - k * 24, 110, 20, { fill: 'rgba(60,30,120,0.55)', border: 'rgba(200,150,255,0.5)' }); text(ctx, t, W / 2, y + 56, { size: 44, weight: 900, color: C.neon }); ctx.restore();
      });
      badge(ctx, 'המידע תמיד היה שם', prog(lt, always, always + 0.35), '#0b8f63', 300, W / 2, 44);
    },
  },

  // ================= CH3: the map =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 6, 'המפה', 'PILLAR 1 · THE MAP', { cueWord: 'המפה' }); } },
  mp1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('באקראי'), type: 'pop' }, { lt: s.cue('רמות'), type: 'impact', k: 1 }, { lt: s.cue('הופיעו'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, rnd = s.cue('באקראי'), lv = s.cue('רמות'), app = s.cue('הופיעו');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 1, 40], [d, 0, 40]], { p: [59000, 65000] });
      ch.draw(ctx, { reveal: 39.5, dim: 0.4 });
      if (lt < lv + 0.3) { const a = prog(lt, rnd - 0.3, rnd) * (1 - prog(lt, lv, lv + 0.3)); text(ctx, '?', 300, 700, { size: 160, weight: 900, color: '#ff5a72', alpha: a, glow: 40, glowColor: C.down }); text(ctx, '?', 760, 900, { size: 120, weight: 900, color: '#ff5a72', alpha: a * 0.8 }); cross(ctx, W / 2, 300, 34, prog(lt, rnd + 0.2, rnd + 0.5) * (1 - prog(lt, lv, lv + 0.3))); }
      ch.hline(ctx, RES, 0, 40, { color: C.down, width: 6, progress: prog(lt, lv, lv + 0.6) });
      ch.hline(ctx, SUP, 0, 40, { color: C.up, width: 6, progress: prog(lt, lv + 0.15, lv + 0.75) });
      ch.zigzag(ctx, RG.slice(0, 9), prog(lt, lv, app + 0.6), { color: 'rgba(192,132,252,0.75)', width: 4 });
      [...SUP_T.map(i => [i, '#3df2a6']), ...RES_T.map(i => [i, '#ff5a72'])].sort((a, b) => a[0] - b[0]).forEach(([i, col], k) => ch.dot(ctx, i, PR(i), prog(lt, app + k * 0.08, app + k * 0.08 + 0.3), col, 14));
      wipeText(ctx, 'לא באקראי · בין רמות', W / 2, 300, prog(lt, lv - 0.05, lv + 0.3), { size: 64, weight: 900, color: C.neon });
    },
  },
  mp2: {
    trans: 'none',
    events: s => [{ lt: s.cue('תמיכה'), type: 'pop' }, { lt: s.cue('שוב', 1), type: 'pop' }, { lt: s.cue('הירידה'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, sup = s.cue('תמיכה'), again = s.cue('שוב'), fall = s.cue('הירידה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 40], [sup, 2, 36], [d, 4, 34]], { p: [58800, 63200] });
      ch.draw(ctx, { reveal: 39.5, dim: 0.3, highlight: i => SUP_T.includes(i) && lt > again });
      ch.zone(ctx, SUP - 150, SUP + 150, 0, 40, { color: C.up, alpha: 0.2 + 0.06 * Math.sin(lt * 5), progress: prog(lt, sup - 0.1, sup + 0.5) });
      ch.hline(ctx, SUP, 0, 40, { color: C.up, width: 5 });
      arrowsAt(ctx, ch, SUP_T, PR, lt, again - 0.2, true, 0.22);
      if (lt > fall) SUP_T.forEach(i => hit(ctx, ch.X(i), ch.Y(SUP), lt, fall, C.up, 120));
      popT(ctx, W / 2, 300, prog(lt, sup, sup + 0.35), () => pill(ctx, 'תמיכה · הקונים נכנסים', W / 2, 300, { size: 50, color: '#0b8f63', glow: 45 }));
      badge(ctx, 'עוצרים את הירידה', prog(lt, fall, fall + 0.35), '#0b8f63', 1270, W / 2, 40);
    },
  },
  mp3: {
    trans: 'none',
    events: s => [{ lt: s.cue('התנגדות'), type: 'pop' }, { lt: s.cue('שוב', 1), type: 'pop' }, { lt: s.cue('העלייה'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, res = s.cue('התנגדות'), again = s.cue('שוב'), rise = s.cue('העלייה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 34], [res, 0, 38], [d, 0, 39]], { p: [60800, 65200] });
      ch.draw(ctx, { reveal: 39.5, dim: 0.3, highlight: i => RES_T.includes(i) && lt > again });
      ch.zone(ctx, RES - 150, RES + 150, 0, 40, { color: C.down, alpha: 0.2 + 0.06 * Math.sin(lt * 5), progress: prog(lt, res - 0.1, res + 0.5) });
      ch.hline(ctx, RES, 0, 40, { color: C.down, width: 5 });
      arrowsAt(ctx, ch, RES_T, PR, lt, again - 0.2, false, 0.2);
      if (lt > rise) RES_T.forEach(i => hit(ctx, ch.X(i), ch.Y(RES), lt, rise, C.down, 120));
      popT(ctx, W / 2, 300, prog(lt, res, res + 0.35), () => pill(ctx, 'התנגדות · המוכרים נכנסים', W / 2, 300, { size: 48, color: '#d61f45', glow: 45 }));
      badge(ctx, 'עוצרים את העלייה', prog(lt, rise, rise + 0.35), '#d61f45', 1270, W / 2, 40);
    },
  },
  mp4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מסומנות'), type: 'pop' }, { lt: s.cue('מנחש'), type: 'pop' }, { lt: s.cue('בודק'), type: 'pop' }, { lt: s.cue('חשובה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, mk = s.cue('מסומנות'), guess = s.cue('מנחש'), check_ = s.cue('בודק'), imp = s.cue('חשובה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 44], [check_, 24, 44], [d, 26, 44]], { p: [59000, 65000] });
      const rv = kf(lt, [[0, 34], [check_, 41.5], [d, 42.6]], E.lin)[0];
      ch.draw(ctx, { reveal: rv });
      ch.hline(ctx, RES, 0, 46, { color: C.down, width: 5, progress: prog(lt, mk - 0.2, mk + 0.3) });
      ch.hline(ctx, SUP, 0, 46, { color: C.up, width: 5, progress: prog(lt, mk, mk + 0.5) });
      // guessing arrows crossed out
      const pg = prog(lt, guess - 0.1, guess + 0.3) * (1 - prog(lt, check_ - 0.2, check_));
      if (pg > 0) { [[-1, C.up], [1, C.down]].forEach(([dir, col], k) => arrow(ctx, 760, 760, 900, 760 + dir * 200, pg, { color: col, width: 8 })); text(ctx, '?', 960, 760, { size: 100, weight: 900, color: C.gold, alpha: pg }); cross(ctx, 830, 760, 30, prog(lt, guess + 0.3, guess + 0.6)); }
      // magnifier on the price arriving at support
      if (lt > check_) { const x = ch.X(Math.min(42, rv)), y = ch.Y(SUP); ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.shadowColor = C.gold; ctx.shadowBlur = 25; const r = 90 + 6 * Math.sin(lt * 7); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + r * 0.7, y + r * 0.7); ctx.lineTo(x + r * 1.3, y + r * 1.3); ctx.lineWidth = 14; ctx.stroke(); ctx.restore(); }
      if (lt > imp) hit(ctx, ch.X(42), ch.Y(SUP), lt, imp, C.gold, 240);
      popT(ctx, W / 2, 300, prog(lt, check_, check_ + 0.35), () => pill(ctx, 'איך הוא מתנהג ברמה?', W / 2, 300, { size: 50, color: C.purple, glow: 45 }));
    },
  },
  mp5: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('חוזה'), type: 'pop' }, { lt: s.cue('להסתכל'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, pred = s.cue('חוזה'), look = s.cue('איפה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 40], [d, 2, 42]], { p: [59000, 65000] });
      ch.draw(ctx, { reveal: 39.5, dim: 0.7 });
      ch.hline(ctx, RES, 0, 42, { color: C.down, width: 6, glow: 30 }); ch.hline(ctx, SUP, 0, 42, { color: C.up, width: 6, glow: 30 });
      scrim(ctx, 0.62 * prog(lt, pred - 0.2, pred + 0.2));
      headlines(ctx, lt, [{ t: 'המפה לא חוזה', at: pred - 0.2, y: 640, size: 100, color: '#fff' }, { t: 'היא אומרת איפה להסתכל', at: look - 0.1, y: 1020, size: 70, color: C.gold, glowColor: C.gold }]);
      cross(ctx, 160, 640, 38, prog(lt, pred + 0.3, pred + 0.6));
      [12, 28].forEach((i, k) => { pin(ctx, ch.X(i), ch.Y(RES) - 4, prog(lt, look + k * 0.2, look + k * 0.2 + 0.35), C.gold); pin(ctx, ch.X(i + 6), ch.Y(SUP) - 4, prog(lt, look + 0.1 + k * 0.2, look + 0.1 + k * 0.2 + 0.35), C.gold); });
      eye(ctx, W / 2, 1180, 70, C.gold);
      ring(ctx, W / 2, 1180, 300, prog(lt, look, look + 0.7), C.gold);
    },
  },

  // ================= CH4: drawing a level =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 6, 'איך מסמנים רמה', 'DRAWING A LEVEL', { cueWord: 'איך' }); } },
  lv1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('נגע'), type: 'pop' }, { lt: s.cue('הגיב'), type: 'pop' }, { lt: s.cue('והתרחק'), type: 'pop' }, { lt: s.cue('מפעם'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, touch = s.cue('נגע'), react = s.cue('הגיב'), away = s.cue('והתרחק'), more = s.cue('מפעם');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 3, 17], [more, 3, 20], [d, 0, 34]], { p: [59000, 64600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 9], [away + 0.4, 14], [more, 19.5], [d, 30]], E.lin)[0] });
      ch.hline(ctx, SUP, 0, 34, { color: 'rgba(255,255,255,0.6)', width: 3, dash: [10, 8] });
      const x = ch.X(9), y = ch.Y(SUP);
      ch.dot(ctx, 9, PR(9), prog(lt, touch, touch + 0.3), C.gold, 15);
      if (lt > react) arrow(ctx, x + 40, y - 20, x + 40, y - 220, prog(lt, react, react + 0.4), { color: C.up, width: 8 });
      const steps = [['1 · נגע', touch], ['2 · הגיב', react], ['3 · התרחק', away]];
      steps.forEach(([t, at], k) => popT(ctx, 790 - k * 260, 300, prog(lt, at, at + 0.3), () => pill(ctx, t, 790 - k * 260, 300, { size: 40, color: k === 2 ? '#0b8f63' : C.purple, glow: 30 })));
      [19, 29].forEach((i, k) => ch.dot(ctx, i, PR(i), prog(lt, more + k * 0.25, more + k * 0.25 + 0.3), C.gold, 15));
    },
  },
  lv2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('אחת'), type: 'pop' }, { lt: s.cue('שתיים'), type: 'pop' }, { lt: s.cue('שלוש'), type: 'pop' }, { lt: s.cue('משמעותית'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, t1 = s.cue('אחת'), t2 = s.cue('שתיים'), t3 = s.cue('שלוש'), big = s.cue('משמעותית');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 37], [d, 0, 38]], { p: [60600, 64800] });
      const rv = kf(lt, [[0, 6], [t2, 15.5], [t3, 25.5], [big - 0.2, 36], [d, 37]], E.lin)[0];
      ch.draw(ctx, { reveal: rv });
      const lvl = prog(lt, t1, t1 + 0.4), strong = lt > big;
      ch.hline(ctx, RES, 0, 38, { color: strong ? C.gold : lt > t2 ? C.down : 'rgba(255,90,114,0.6)', width: strong ? 9 : lt > t2 ? 6 : 3, glow: strong ? 40 : 14, progress: lvl, dash: lt > t2 ? null : [10, 8] });
      const ats = [t1, t2, t3, t3 + 0.45];
      RES_T.forEach((i, k) => { const p = prog(lt, ats[k], ats[k] + 0.3); ch.dot(ctx, i, PR(i), p, k >= 2 ? C.gold : k === 1 ? '#3df2a6' : '#fff', 14); ch.tag(ctx, i, PR(i), String(k + 1), p, { color: k >= 2 ? '#b8860b' : k === 1 ? '#0b8f63' : '#555', size: 30, off: 58 }); });
      const lab = lt > big ? ['רמה משמעותית', '#b8860b'] : lt > t2 ? ['אמיתי', '#0b8f63'] : lt > t1 ? ['מעניין', '#555'] : null;
      if (lab) popT(ctx, W / 2, 1270, prog(lt, lt > big ? big : lt > t2 ? t2 : t1, (lt > big ? big : lt > t2 ? t2 : t1) + 0.3), () => pill(ctx, lab[0], W / 2, 1270, { size: 46, color: lab[1], glow: 40 }));
      if (strong) hit(ctx, ch.X(34), ch.Y(RES), lt, big, C.gold, 260);
      badge(ctx, 'ספירת נגיעות', prog(lt, 0.05, 0.4), C.purple, 300, W / 2, 44);
    },
  },
  lv3: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('אופקי'), type: 'pop' }, { lt: s.cue('מדויק'), type: 'pop' }, { lt: s.cue('אמת'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, hz = s.cue('אופקי'), exact = s.cue('מדויק'), live = s.cue('אמת');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 34], [live, 12, 42], [d, 16, 43]], { p: [58800, 62800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 30], [live, 39.5], [d, 42.7]], E.lin)[0] });
      // wide zone (crossed) -> one clean line
      const pz = prog(lt, 0.1, 0.5) * (1 - prog(lt, hz, hz + 0.4));
      if (pz > 0) { ch.zone(ctx, SUP - 700, SUP + 700, 0, 44, { color: '#ff5a72', alpha: 0.18 * pz }); popT(ctx, 300, 300, pz, () => pill(ctx, 'אזור רחב', 300, 300, { size: 38, color: '#555' })); cross(ctx, 430, 300, 24, prog(lt, hz - 0.4, hz - 0.1)); }
      ch.hline(ctx, SUP, 0, 44, { color: C.gold, width: 6, glow: 30, progress: prog(lt, hz, hz + 0.6) });
      if (lt > exact) { const y = ch.Y(SUP), bx = ch.p.x + ch.p.w; popT(ctx, bx + 72, y, prog(lt, exact, exact + 0.3), () => { rrect(ctx, bx + 4, y - 22, 136, 44, 8); ctx.fillStyle = C.gold; ctx.fill(); text(ctx, fmt(SUP), bx + 72, y + 1, { size: 24, weight: 800, fam: MONO, color: '#1a0f00' }); }); }
      popT(ctx, W / 2 + 120, 300, prog(lt, hz, hz + 0.3), () => pill(ctx, 'קו אחד · מחיר מדויק', W / 2 + 120, 300, { size: 44, color: '#b8860b', glow: 40 }));
      if (lt > live) { const x = ch.X(42); ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(x, ch.p.y); ctx.lineTo(x, ch.p.y + ch.p.h); ctx.stroke(); ctx.restore(); popT(ctx, x - 120, ch.p.y + 60, prog(lt, live, live + 0.3), () => pill(ctx, 'LIVE', x - 120, ch.p.y + 60, { size: 30, color: '#d61f45' })); }
      badge(ctx, 'יודע בדיוק איפה לפעול', prog(lt, live + 0.6, live + 1), C.purple, 1270, W / 2, 40);
    },
  },
  lv4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נסגר'), type: 'pop' }, { lt: s.cue('פתיל'), type: 'pop' }, { lt: s.cue('וסגירה'), type: 'pop' }, { lt: s.cue('שונים'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, cl = s.cue('נסגר'), wick = s.cue('פתיל'), close = s.cue('וסגירה'), diff = s.cue('שונים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 18, 36], [wick, 22, 33], [d, 23, 33]], { p: [59200, 61600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 28], [cl - 0.3, 29.95], [d, 30]], E.lin)[0], highlight: i => i === 29, dim: 0.4 });
      ch.hline(ctx, SUP, 9, 34, { color: C.gold, width: 5 });
      const q = RGC[29], x = ch.X(29);
      if (lt > wick) { ctx.save(); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 4; ctx.setLineDash([6, 6]); ctx.strokeRect(x - 30, ch.Y(Math.min(q.o, q.c)), 60, ch.Y(q.l) - ch.Y(Math.min(q.o, q.c)) + 8); ctx.restore();
        popT(ctx, x - 210, ch.Y(q.l) + 10, prog(lt, wick, wick + 0.3), () => pill(ctx, 'פתיל = בודק', x - 210, ch.Y(q.l) + 10, { size: 32, color: '#d61f45' })); }
      if (lt > close) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x - 30, ch.Y(Math.max(q.o, q.c)) - 6, 60, ch.Y(Math.min(q.o, q.c)) - ch.Y(Math.max(q.o, q.c)) + 12); ctx.restore();
        popT(ctx, x + 240, ch.Y(q.c) - 70, prog(lt, close, close + 0.3), () => pill(ctx, 'סגירה = מאשרת', x + 240, ch.Y(q.c) - 70, { size: 32, color: '#0b8f63' })); }
      if (lt > diff) { hit(ctx, x, ch.Y(SUP), lt, diff, C.gold, 220); popT(ctx, W / 2, 1270, prog(lt, diff, diff + 0.3), () => pill(ctx, 'שני דברים שונים לגמרי', W / 2, 1270, { size: 44, color: C.purple, glow: 40 })); }
      badge(ctx, 'איפה הנר נסגר?', prog(lt, cl - 0.1, cl + 0.3), '#b8860b', 300, W / 2, 46);
    },
  },

  // ================= CH5: three setups =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 6, 'שלושה סטאפים', '3 LEVEL SETUPS', { cueWord: 'שלושה' }); } },
  s1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('שנפרצה'), type: 'impact', k: 1 }, { lt: s.cue('לתמיכה'), type: 'pop' }, { lt: s.cue('ומחזיק'), type: 'pop' }, { lt: s.cue('לונג'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chF, brk = s.cue('שנפרצה'), flip = s.cue('לתמיכה'), back = s.cue('חוזר'), hold = s.cue('ומחזיק'), lg = s.cue('לונג');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 26], [back, 6, 34], [d, 8, 40]], { p: [60000, 65600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 15], [brk, 21], [back, 25], [hold, 30], [lg + 0.2, 31], [d, 38]], E.lin)[0], highlight: i => i === 29 && lt > hold });
      const flipped = lt > flip;
      ch.hline(ctx, LV1, 0, 40, { color: flipped ? C.up : C.down, width: 6, glow: 24 });
      [5, 14].forEach(i => ch.tag(ctx, i, LV1, 'R', prog(lt, 0.1, 0.4), { color: '#d61f45', size: 24, off: 44 }));
      if (lt > brk) hit(ctx, ch.X(20), ch.Y(LV1), lt, brk, C.up, 220);
      popT(ctx, W / 2, 300, prog(lt, flip, flip + 0.35), () => pill(ctx, 'התנגדות ⇢ תמיכה', W / 2, 300, { size: 52, color: '#0b8f63', glow: 45 }));
      if (lt > hold) { ch.tag(ctx, 29, FL[6][1], 'מחזיק ✓', prog(lt, hold, hold + 0.3), { color: '#0b8f63', above: false, size: 30, off: 56 }); }
      if (lt > lg) { arrow(ctx, ch.X(31), ch.Y(LV1) - 30, ch.X(31) + 60, ch.Y(LV1) - 260, prog(lt, lg, lg + 0.4), { color: C.up, width: 10 }); popT(ctx, ch.X(31) - 120, ch.Y(LV1) - 150, prog(lt, lg, lg + 0.3), () => pill(ctx, 'LONG', ch.X(31) - 120, ch.Y(LV1) - 150, { size: 38, color: '#0b8f63', glow: 30 })); }
      badge(ctx, 'סטאפ 1 · החזקה מעל', prog(lt, 0.05, 0.4), C.purple, 1270, W / 2, 40);
    },
  },
  s2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נופל'), type: 'pop' }, { lt: s.cue('ונסגר'), type: 'impact', k: 1.2 }, { lt: s.cue('האישור'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chC, rc = s.cue('ריקליים'), fall = s.cue('נופל'), cl = s.cue('ונסגר'), conf = s.cue('האישור');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 30], [cl, 8, 33], [d, 10, 38]], { p: [58700, 62900] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 20], [fall, 24.95], [cl - 0.4, 28.5], [cl, 29.95], [conf, 30], [d, 35]], E.lin)[0], highlight: i => (i === 24 && lt > fall) || (i === 29 && lt > cl) });
      ch.hline(ctx, SUP, 0, 38, { color: lt > cl ? C.up : lt > fall ? C.down : C.gold, width: 6 });
      if (lt > fall) ch.tag(ctx, 24, RCC[24].l, 'סגירה מתחת', prog(lt, fall, fall + 0.3), { color: '#d61f45', above: false, size: 26, off: 50 });
      if (lt > cl) { hit(ctx, ch.X(29), ch.Y(SUP), lt, cl, C.up, 240); flashCol(ctx, lt, cl, '22,199,132', 0.2); ch.tag(ctx, 29, RCC[29].h, 'סגירה מעל ✓', prog(lt, cl, cl + 0.3), { color: '#0b8f63', size: 28, off: 56 }); }
      if (lt > conf) popT(ctx, ch.X(30) + 40, ch.Y(SUP) + 120, prog(lt, conf, conf + 0.3), () => pill(ctx, 'כניסה', ch.X(30) + 40, ch.Y(SUP) + 120, { size: 32, color: '#2962ff' }));
      popT(ctx, W / 2, 300, prog(lt, rc, rc + 0.35), () => pill(ctx, 'RECLAIM', W / 2, 300, { size: 56, color: C.purple, glow: 50 }));
      badge(ctx, 'סטאפ 2 · Reclaim', prog(lt, 0.05, 0.4), C.purple, 1270, W / 2, 40);
    },
  },
  s3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('חזקה'), type: 'pop' }, { lt: s.cue('דחייה', 1), type: 'impact', k: 1.2 }, { lt: s.cue('שורט'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chJ, strong = s.cue('חזקה'), rej = s.cue('דחייה', 1), sh = s.cue('שורט');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 32], [rej, 8, 36], [d, 10, 40]], { p: [60600, 65000] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 22], [strong, 28], [rej - 0.5, 29.9], [rej, 30.95], [sh, 31.5], [d, 37]], E.lin)[0], highlight: i => i === 30 && lt > rej });
      ch.hline(ctx, RES, 0, 40, { color: C.down, width: lt > strong ? 7 : 4, glow: lt > strong ? 30 : 12 });
      [6, 18].forEach(i => ch.dot(ctx, i, RJ.find(p => p[0] === i)[1], prog(lt, strong, strong + 0.3), '#ff5a72', 12));
      if (lt > rej) { const x = ch.X(30); hit(ctx, x, ch.Y(RJC[30].h), lt, rej, C.down, 200); ch.tag(ctx, 30, RJC[30].h, 'נר דחייה', prog(lt, rej, rej + 0.3), { color: '#d61f45', size: 28, off: 52 }); }
      if (lt > sh) { arrow(ctx, ch.X(32), ch.Y(RES) + 40, ch.X(32) + 60, ch.Y(RES) + 280, prog(lt, sh, sh + 0.4), { color: C.down, width: 10 }); popT(ctx, ch.X(32) - 120, ch.Y(RES) + 170, prog(lt, sh, sh + 0.3), () => pill(ctx, 'SHORT', ch.X(32) - 120, ch.Y(RES) + 170, { size: 38, color: '#d61f45', glow: 30 })); }
      badge(ctx, 'סטאפ 3 · דחייה בהתנגדות', prog(lt, 0.05, 0.4), C.purple, 300, W / 2, 42);
    },
  },
  s4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('ברמה'), type: 'pop' }, { lt: s.cue('מיקום'), type: 'pop' }, { lt: s.cue('אישור'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, all = s.cue('ברמה'), loc = s.cue('מיקום'), act = s.cue('עושה'), ok = s.cue('אישור');
      drawBG(ctx, s.t, { glow: 1.2 });
      wipeText(ctx, 'מה משותף לשלושתם?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 64, weight: 900, color: C.purple2 });
      // three mini setup cards sitting on one shared level
      const cards = [['החזקה', C.up, 1], ['Reclaim', C.purple2, 0], ['דחייה', C.down, -1]];
      cards.forEach(([t, col, dir], k) => {
        const x = 800 - k * 260, p = prog(lt, 0.1 + k * 0.15, 0.45 + k * 0.15); if (p <= 0) return;
        popT(ctx, x, 560, p, () => { glass(ctx, x - 115, 430, 230, 260, 24, { border: col, glowColor: col });
          ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.beginPath();
          const pts = dir > 0 ? [[-80, 560], [-35, 500], [0, 590], [35, 525], [80, 470]] : dir < 0 ? [[-80, 640], [-30, 560], [0, 515], [35, 590], [80, 640]] : [[-80, 560], [-35, 640], [0, 620], [35, 545], [80, 500]];
          pts.forEach(([dx, y], j) => j ? ctx.lineTo(x + dx, y) : ctx.moveTo(x + dx, y)); ctx.stroke(); ctx.restore();
          text(ctx, t, x, 470, { size: 34, weight: 900 }); });
      });
      const pl = prog(lt, all - 0.1, all + 0.4);
      if (pl > 0) { ctx.save(); ctx.globalAlpha = pl; ctx.strokeStyle = C.gold; ctx.lineWidth = 7; ctx.shadowColor = C.gold; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(120, 720); ctx.lineTo(120 + 840 * E.outCubic(pl), 720); ctx.stroke(); ctx.restore(); text(ctx, 'כולם מתחילים ברמה', W / 2, 780, { size: 46, weight: 900, color: C.gold, alpha: pl }); }
      const row = (y, a, b, col, p) => popT(ctx, W / 2, y, p, () => { glass(ctx, 110, y - 75, 860, 150, 28, { border: col, glowColor: col }); text(ctx, a, 900, y, { size: 52, weight: 900, align: 'right' }); text(ctx, '=', 470, y, { size: 60, weight: 900, color: col }); text(ctx, b, 400, y, { size: 52, weight: 900, color: col, align: 'right' }); });
      row(960, 'הרמה', 'מיקום', C.purple2, prog(lt, loc - 0.15, loc + 0.25));
      row(1150, 'פעולת המחיר', 'אישור', C.teal, prog(lt, act - 0.1, act + 0.3));
      if (lt > ok) hit(ctx, 280, 1150, lt, ok, C.teal, 220);
    },
  },
  s5: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הבטחה'), type: 'pop' }, { lt: s.cue('סכין'), type: 'impact', k: 1.4 }, { lt: s.cue('עמודים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, prom = s.cue('הבטחה'), knife = s.cue('לחתוך'), more = s.cue('שלושה') - 0.3;
      drawBG(ctx, s.t, { hue: lt > knife ? 20 : 0 });
      stdChart(ch, lt, [[0, 22, 46], [knife, 26, 48], [d, 26, 48]], { p: [57200, 64600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 41], [knife - 0.3, 43.9], [knife + 0.1, 44.95], [d, 48]], E.lin)[0], highlight: i => i === 44 && lt > knife });
      ch.hline(ctx, SUP, 9, 48, { color: lt > knife ? C.down : C.up, width: lt > knife ? 7 : 5, glow: 26 });
      if (lt > knife) { hit(ctx, ch.X(44), ch.Y(SUP), lt, knife, C.down, 280); flashCol(ctx, lt, knife);
        const x = ch.X(44), p = prog(lt, knife, knife + 0.35); ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.shadowColor = '#fff'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(x - 140, ch.Y(SUP) - 90); ctx.lineTo(x - 140 + 280 * p, ch.Y(SUP) - 90 + 180 * p); ctx.stroke(); ctx.restore(); }
      popT(ctx, W / 2, 300, prog(lt, prom, prom + 0.35), () => pill(ctx, 'רמה ≠ הבטחה', W / 2, 300, { size: 54, color: '#d61f45', glow: 45 }));
      if (lt > more) { ctx.save(); ctx.globalAlpha = prog(lt, more, more + 0.3); glass(ctx, 140, 1205, 800, 130, 26, { border: C.purple2 }); ctx.restore();
        ['ההקשר', 'הביטול', 'האישור'].forEach((t, k) => popT(ctx, 300 + k * 240, 1270, prog(lt, more + k * 0.15, more + k * 0.15 + 0.3), () => pill(ctx, t, 300 + k * 240, 1270, { size: 34, color: [C.gold, '#d61f45', '#0e9e8a'][k] === C.gold ? '#b8860b' : [C.gold, '#d61f45', '#0e9e8a'][k] }))); }
    },
  },

  // ================= CH6: TradingView =================
  ch6: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 6, 6, 'ככה ב-TradingView', 'TRADINGVIEW', { cueWord: 'ככה' }); } },
  t1: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('מסתירים') - 0.2, type: 'click' }, { lt: s.cue('האינדיקטורים'), type: 'click' }, { lt: s.cue('נרות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chI, clean = s.cue('מנקים'), hide = s.cue('מסתירים'), pick = s.cue('האינדיקטורים'), cand = s.cue('נרות');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(4, 45, 60300, 64700);
      ch.draw(ctx, { reveal: 44.9, tfs: ['15m', '1H', '4H', '1D'] });
      const gone = prog(lt, pick + 0.1, pick + 0.5);
      drawInds(ctx, ch, 44.9, [1, 1, 1, 1, 0].map(v => v * (1 - gone)));
      tvToolbar(ctx, 40, 466, 870, null);
      // eye button at the bottom of the toolbar
      const ex = 86, ey = 1268, on = lt > hide - 0.2;
      if (on) { ctx.save(); rrect(ctx, ex - 34, ey - 34, 68, 68, 14); ctx.fillStyle = 'rgba(168,85,247,0.45)'; ctx.shadowColor = C.purple; ctx.shadowBlur = 25; ctx.fill(); ctx.restore(); }
      eye(ctx, ex, ey, 24, on ? '#fff' : 'rgba(210,200,240,0.65)', prog(lt, pick, pick + 0.3));
      // hide menu
      const pm = prog(lt, hide, hide + 0.2) * (1 - prog(lt, pick + 0.3, pick + 0.5));
      if (pm > 0) { ctx.save(); ctx.globalAlpha = pm; const bx = 150, by = 1060; glass(ctx, bx, by, 520, 240, 20, { fill: 'rgba(22,16,40,0.97)' });
        [['Hide drawings', 0], ['Hide indicators', 1], ['Hide all', 0]].forEach(([t, hot], j) => { const y = by + 50 + j * 72; if (hot) { rrect(ctx, bx + 14, y - 30, 492, 60, 10); ctx.fillStyle = lt > pick - 0.3 ? 'rgba(168,85,247,0.55)' : 'rgba(168,85,247,0.2)'; ctx.fill(); }
          text(ctx, t, bx + 40, y, { size: 32, weight: hot ? 800 : 500, align: 'left', color: hot ? '#fff' : C.dim }); }); ctx.restore(); }
      const c = kf(lt, [[0, 700, 900], [hide - 0.3, ex, ey], [hide, ex, ey], [pick - 0.3, 330, 1182], [pick, 330, 1182], [d, 600, 1000]]);
      cursor(ctx, c[0], c[1], Math.exp(-Math.min(Math.abs(lt - (hide - 0.2)), Math.abs(lt - pick)) * 14), 1.15);
      badge(ctx, 'מנקים את הגרף', prog(lt, clean, clean + 0.35) * (1 - prog(lt, cand - 0.2, cand)), C.purple, 300, W / 2, 44);
      popT(ctx, W / 2, 300, prog(lt, cand, cand + 0.35), () => pill(ctx, 'רק נרות ✓', W / 2, 300, { size: 52, color: '#0b8f63', glow: 45 }));
    },
  },
  t2: {
    trans: 'none',
    events: s => [{ lt: s.cue('יומי'), type: 'key' }, { lt: s.cue('ומחפשים'), type: 'pop' }, { lt: s.cue('פעמים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, day = s.cue('יומי'), find = s.cue('ומחפשים'), times = s.cue('פעמים');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(...kf(lt, [[0, 4, 40], [d, 0, 40]]), 59000, 65000);
      ch.draw(ctx, { reveal: 39.5, tfs: ['15m', '1H', '4H', '1D'], tfFlash: lt > day + 0.3 ? Math.exp(-(lt - day - 0.3) * 5) : 0 });
      tvToolbar(ctx, 40, 466, 870, null);
      intervalPopup(ctx, lt, '1D', day - 0.4, day + 0.3);
      if (lt > find) { const r = 80, xs = [...SUP_T.map(i => [i, SUP]), ...RES_T.map(i => [i, RES])].sort((a, b) => a[0] - b[0]);
        xs.forEach(([i, p], k) => { const t = find + k * 0.2; ch.dot(ctx, i, PR(i), prog(lt, t, t + 0.3), p === SUP ? '#3df2a6' : '#ff5a72', 13); });
        const k = Math.min(xs.length - 1, Math.floor((lt - find) / 0.2)), [i] = xs[k]; ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.shadowColor = C.gold; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(ch.X(i), ch.Y(PR(i)), r * 0.7, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      badge(ctx, 'גרף יומי · איפה המחיר הגיב?', prog(lt, find, find + 0.35), C.purple, 300, W / 2, 42);
      if (lt > times) popT(ctx, W / 2, 1270, prog(lt, times, times + 0.3), () => pill(ctx, '3 נגיעות · 4 נגיעות', W / 2, 1270, { size: 38, color: '#b8860b' }));
    },
  },
  t3: {
    trans: 'none',
    events: s => [{ lt: s.cue('בקו') - 0.2, type: 'click' }, { lt: s.cue('אלט'), type: 'key' }, { lt: s.cue('ואייץ'), type: 'key' }, { lt: s.cue('שתיים'), type: 'pop' }, { lt: s.cue('שלוש'), type: 'pop' }, { lt: s.cue('יותר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, mk = s.cue('בקו'), ka = s.cue('אלט'), kb = s.cue('ואייץ'), two = s.cue('שתיים'), three = s.cue('שלוש'), nomore = s.cue('יותר');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(0, 40, 59000, 65000);
      ch.draw(ctx, { reveal: 39.5, tfs: ['15m', '1H', '4H', '1D'], dim: 0.15 });
      const at = tvToolbar(ctx, 40, 466, 870, lt > mk - 0.2 ? 'hline' : null), [hx, hy] = at('hline');
      ch.hline(ctx, SUP, 0, 40, { color: C.up, width: 5, progress: prog(lt, kb, kb + 0.5) });
      ch.hline(ctx, RES, 0, 40, { color: C.down, width: 5, progress: prog(lt, two, two + 0.5) });
      ch.hline(ctx, 61800, 0, 40, { color: C.gold, width: 4, progress: prog(lt, three, three + 0.5), dash: [12, 8] });
      // a 4th line that we refuse to draw
      if (lt > nomore - 0.3) { ch.hline(ctx, 62900, 0, 40, { color: 'rgba(255,255,255,0.5)', width: 3, dash: [6, 8], progress: prog(lt, nomore - 0.3, nomore), alpha: 1 - prog(lt, nomore + 0.4, nomore + 0.8) }); cross(ctx, ch.X(20), ch.Y(62900), 28, prog(lt, nomore, nomore + 0.3) * (1 - prog(lt, nomore + 0.6, nomore + 0.9))); }
      if (lt < ka) { const c = kf(lt, [[0, 700, 1100], [mk - 0.3, hx, hy], [mk + 0.1, hx, hy], [ka - 0.1, ch.X(20), ch.Y(SUP)]]); cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - (mk - 0.2)) * 14), 1.15); }
      const pk = prog(lt, ka - 0.05, ka + 0.3) * (1 - prog(lt, two - 0.3, two - 0.05));
      if (pk > 0) { scrim(ctx, 0.5 * pk);
        keycap(ctx, 'Alt', W / 2 - 150, 860, pk, { w: 230, pressed: lt > ka ? 1 : 0 }); text(ctx, '+', W / 2 - 5, 860, { size: 90, weight: 900, color: C.purple2, alpha: pk });
        keycap(ctx, 'H', W / 2 + 160, 860, prog(lt, kb - 0.05, kb + 0.3) * pk, { w: 170, pressed: lt > kb ? 1 : 0 }); }
      const n = lt > three ? 3 : lt > two ? 2 : lt > kb ? 1 : 0;
      if (n) text(ctx, `${n} / 3`, 900, 300, { size: 54, weight: 900, fam: MONO, color: C.gold, glow: 20, glowColor: C.gold });
      popT(ctx, 420, 300, prog(lt, nomore, nomore + 0.3), () => pill(ctx, 'לא יותר', 420, 300, { size: 46, color: '#d61f45', glow: 40 }));
    },
  },
  t4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מפה'), type: 'impact', k: 1.1 }, { lt: s.cue('להסתכל'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chR, map = s.cue('מפה'), look = s.cue('להסתכל');
      drawBG(ctx, s.t, { glow: 1.2 });
      stdChart(ch, lt, [[0, 0, 40], [d, 3, 42]], { p: [59000, 65000] });
      ch.draw(ctx, { reveal: 39.5, dim: 0.55 });
      ch.hline(ctx, RES, 0, 42, { color: C.down, width: 6, glow: 30 }); ch.hline(ctx, SUP, 0, 42, { color: C.up, width: 6, glow: 30 }); ch.hline(ctx, 61800, 0, 42, { color: C.gold, width: 4, dash: [12, 8] });
      scrim(ctx, 0.3 * prog(lt, map - 0.2, map + 0.2));
      popT(ctx, W / 2, 760, prog(lt, map - 0.1, map + 0.3), () => text(ctx, 'יש לך מפה', W / 2, 760, { size: 140, weight: 900, glow: 50, glowColor: C.purple }));
      ring(ctx, W / 2, 760, 600, prog(lt, map, map + 0.7));
      [[12, RES], [26, SUP], [34, 61800]].forEach(([i, p], k) => pin(ctx, ch.X(i), ch.Y(p) - 4, prog(lt, look + k * 0.15, look + k * 0.15 + 0.35), C.gold));
      popT(ctx, W / 2, 300, prog(lt, look, look + 0.35), () => pill(ctx, 'אתה יודע איפה להסתכל', W / 2, 300, { size: 50, color: C.purple, glow: 45 }));
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('החלטות'), type: 'pop' }, { lt: s.cue('המפה'), type: 'pop' }, { lt: s.cue('האות'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['הגרף = החלטות', 'של קונים ומוכרים', C.purple, s.cue('החלטות'), 'zz'],
        ['הרמות = המפה', 'איפה להסתכל', '#0fa36b', s.cue('המפה'), 'check'],
        ['הפעולה ברמה = האות', 'זה מה שמאשר', '#b8860b', s.cue('עושה'), 'warn'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('יקרה'), type: 'impact', k: 1.1 }, { lt: s.cue('השני'), type: 'riser' }, { lt: s.cue('האישור'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, q = s.cue('מתי'), cost = s.cue('הטעות'), next = s.cue('בסרטון'), conf = s.cue('האישור');
      drawBG(ctx, s.t, { glow: 1.3 });
      const out = next - 0.2;
      headlines(ctx, lt, [{ t: 'מתי באמת נכנסים?', at: q, y: 430, size: 86, color: C.gold, glowColor: C.gold }], out + 0.4);
      const pc = prog(lt, cost - 0.1, cost + 0.3) * (1 - prog(lt, out, out + 0.3));
      if (pc > 0) { popT(ctx, W / 2, 760, pc, () => text(ctx, 'הטעות הכי יקרה שלי', W / 2, 760, { size: 84, weight: 900, color: '#ff5a72', glow: 50, glowColor: C.down })); ring(ctx, W / 2, 760, 560, prog(lt, cost, cost + 0.7), C.down); }
      pillars(ctx, lt, [next, next + 0.1, next + 0.2, next + 0.3].map(t => t - 0.1), lt > conf - 0.2 ? 1 : -1, 430, 620, { dimOthers: prog(lt, conf - 0.2, conf + 0.2), done: 0 });
      if (lt > conf) { popT(ctx, W / 2, 1250, prog(lt, conf, conf + 0.35), () => pill(ctx, 'הבא: האישור · CONFIRMATION', W / 2, 1250, { size: 44, color: C.purple, glow: 50 })); ring(ctx, W / 2, 1250, 520, prog(lt, conf, conf + 0.7)); }
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

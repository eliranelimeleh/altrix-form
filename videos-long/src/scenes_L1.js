// L1 — נזילות (Liquidity): the first of the 5 confluences
'use strict';
// ---------- data ----------
// main 4H chart: equal highs at 20/32, sweep candle at 44, run to the lows below
const MP = [[0, 63000], [8, 65200], [13, 63800], [20, 66400], [25, 65300], [32, 66410], [38, 65450], [43, 66300], [58, 63300]];
const MAIN = override(genCandles(MP, { seed: 23, noise: 0.18 }), {
  43: { o: 66050, c: 66300, h: 66360, l: 65980 },
  44: { o: 66300, c: 66110, h: 66820, l: 66080 },
  45: { o: 66110, c: 65660, h: 66170, l: 65610 },
  46: { o: 65660, c: 65420, h: 65720, l: 65330 },
});
const chM = new Chart(MAIN);
const EQH = 66400, PV = i => MP.find(p => p[0] === i)[1];
const HI = [8, 20, 32], LO = [13, 25, 38];
const ENTRY = 66110, STOP = 66900, TGT = 63700;
// daily example: equal lows 18/30, bullish sweep at 37, run to the highs
const XP1 = [[0, 51800], [6, 48600], [12, 50800], [18, 47600], [24, 49900], [30, 47650], [34, 48900], [36, 48000], [52, 53200]];
const EX1 = override(genCandles(XP1, { seed: 41, noise: 0.16 }), {
  37: { o: 48000, h: 48260, l: 46950, c: 48380 },
  38: { o: 48380, h: 49050, l: 48300, c: 48950 },
});
const chE1 = new Chart(EX1, { tf: '1D' });
const EQL = 47620;
// 1H example: cluster of highs, small breakout at 31, sell-off through every low
const XP2 = [[0, 61200], [6, 62400], [10, 61800], [15, 62450], [19, 61650], [24, 62420], [28, 61900], [30, 62300], [46, 60300]];
const EX2 = override(genCandles(XP2, { seed: 57, noise: 0.16 }), {
  31: { o: 62300, h: 62780, l: 62240, c: 62150 },
  32: { o: 62150, h: 62200, l: 61850, c: 61900 },
});
const chE2 = new Chart(EX2, { tf: '1H' });
const X2H = [6, 15, 24], X2L = [10, 19, 28], PV2 = i => XP2.find(p => p[0] === i)[1];
// trap: same approach, sweep (A) vs real breakout (B)
const TPA = [[0, 65000], [6, 66380], [10, 65600], [16, 66400], [20, 65800], [24, 66250], [34, 64700]];
const TPB = [[0, 65000], [6, 66380], [10, 65600], [16, 66400], [20, 65800], [24, 66250], [34, 67900]];
const TRA = override(genCandles(TPA, { seed: 9, noise: 0.14 }), { 25: { o: 66250, h: 66780, l: 66180, c: 66120 }, 26: { o: 66120, h: 66160, l: 65800, c: 65850 } });
const TRB = override(genCandles(TPB, { seed: 9, noise: 0.14 }), { 25: { o: 66250, h: 66820, l: 66200, c: 66740 }, 26: { o: 66740, h: 67050, l: 66600, c: 66980 } });
const chTA = new Chart(TRA), chTB = new Chart(TRB);

// ---------- local helpers ----------
function bankIcon(ctx, x, y, s, col = C.gold) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.moveTo(-70, -30); ctx.lineTo(0, -75); ctx.lineTo(70, -30); ctx.closePath(); ctx.fill();
  for (let k = -2; k <= 2; k++) ctx.fillRect(k * 27 - 8, -22, 16, 70);
  ctx.fillRect(-78, 52, 156, 16); ctx.restore();
}
function playerCard(ctx, x, y, p, amount, o = {}) {
  popT(ctx, x, y, p, () => {
    glass(ctx, x - 300, y - 120, 600, 240, 30, { border: 'rgba(255,201,77,0.7)', glowColor: 'rgba(255,180,40,0.35)' });
    bankIcon(ctx, x + 190, y - 8, 0.9);
    text(ctx, o.title || 'קרן / בנק', x + 100, y - 52, { size: 46, weight: 900, align: 'right' });
    text(ctx, amount, x + 100, y + 30, { size: 50, weight: 800, fam: MONO, color: C.gold, align: 'right', glow: 18 });
    if (o.sub) text(ctx, o.sub, x + 100, y + 88, { size: 30, weight: 700, color: C.axis, align: 'right' });
  });
}
function flashCol(ctx, lt, t, col = '255,40,70', a = 0.25) { const f = Math.max(0, 1 - (lt - t) / 0.3); if (lt >= t && f > 0) { ctx.fillStyle = `rgba(${col},${a * f})`; ctx.fillRect(0, 0, W, H); } }
function hit(ctx, x, y, lt, t, col = C.gold, r = 220) { ring(ctx, x, y, r, prog(lt, t, t + 0.6), col); burst(ctx, x, y, prog(lt, t, t + 0.9), col, 26, Math.floor(t * 10) + 3, r * 1.1); }
// glowing liquidity pools above highs / below lows
function pools(ctx, ch, p, list, o = {}) {
  list.forEach(([i, price, above], k) => {
    const pk = clamp((p - k * 0.12) * 2); if (pk <= 0) return;
    const col = above ? '255,90,114' : '61,242,166', x = ch.X(i), y = ch.Y(price) + (above ? -34 : 34);
    ctx.save(); const g = ctx.createRadialGradient(x, y, 4, x, y, 120 * pk); g.addColorStop(0, `rgba(${col},${0.55 * pk})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 130 * pk, 60 * pk, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (o.labels) popT(ctx, x, y, pk, () => text(ctx, '$$$', x, y + 2, { size: 30, weight: 800, fam: MONO, color: `rgb(${col})`, glow: 14 }));
  });
}
const MAIN_POOLS = [[20, PV(20), true], [32, PV(32), true], [8, PV(8), true], [25, PV(25), false], [38, PV(38), false], [13, PV(13), false]];

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('נתפס'), type: 'impact', k: 1.3 }, { lt: s.cue('טס'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, h = s.cue('נתפס'), fly = s.cue('טס');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 27, 48], [d, 30, 50]], { p: [64900, 67200] });
      const rev = kf(lt, [[0, 41], [h, 44.32], [fly, 44.9], [d, 47]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === 44 && lt > h });
      const stopped = lt >= h, SL = 66480;
      ch.hline(ctx, SL, 30, 52, { color: stopped ? C.down : '#ff8095', width: 4, dash: stopped ? null : [12, 10] });
      ch.hline(ctx, ENTRY + 60, 30, 52, { color: 'rgba(255,255,255,0.6)', width: 3, dash: [6, 8] });
      popT(ctx, ch.X(34), ch.Y(ENTRY + 60) + 40, prog(lt, 0.1, 0.4), () => pill(ctx, 'SHORT שלך', ch.X(34), ch.Y(ENTRY + 60) + 40, { size: 30, color: '#2962ff' }));
      if (!stopped) popT(ctx, ch.X(34), ch.Y(SL) - 40, prog(lt, 0, 0.3), () => pill(ctx, 'הסטופ שלך', ch.X(34), ch.Y(SL) - 40, { size: 30, color: '#d61f45' }));
      else {
        hit(ctx, ch.X(44), ch.Y(SL), lt, h, C.down, 240);
        popT(ctx, ch.X(34), ch.Y(SL) - 40, prog(lt, h, h + 0.3), () => pill(ctx, 'STOP HIT', ch.X(34), ch.Y(SL) - 40, { size: 36, color: '#d61f45' }));
        flashCol(ctx, lt, h);
      }
      arrow(ctx, ch.X(45) + 50, ch.Y(66000), ch.X(47) + 30, ch.Y(65200), prog(lt, fly, fly + 0.5), { color: C.gold, width: 12, head: 44 });
      if (lt < fly - 0.1) wipeText(ctx, 'הסטופ שלך נתפס', W / 2, 300, prog(lt, h - 0.1, h + 0.25), { size: 76, weight: 900, color: '#ff5a72' });
      else wipeText(ctx, 'ואז המחיר טס לכיוון שלך', W / 2, 300, prog(lt, fly - 0.1, fly + 0.25), { size: 66, weight: 900, color: C.gold });
    },
  },
  hook2: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('מזל'), type: 'pop' }, { lt: s.cue('צריך') - 0.05, type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, luck = s.cue('מזל'), nd = s.cue('צריך');
      drawBG(ctx, s.t);
      const [i0, i1] = kf(lt, [[0, 30, 50], [1.6, 14, 50], [d, 13, 50]]);
      const [pa, pb] = kf(lt, [[0, 64900, 67200], [1.6, 64600, 67200], [d, 64600, 67200]]);
      ch.layout(...PANEL_STD).view(i0, i1, pa, pb);
      ch.draw(ctx, { reveal: 47, dim: 0.3 * prog(lt, 0.5, 1.2) });
      ch.hline(ctx, EQH, 20, 52, { color: C.gold, width: 5, progress: prog(lt, 0.4, 1.0) });
      [20, 32].forEach((i, k) => stopPills(ctx, ch, i, PV(i), true, prog(lt, 0.8 + k * 0.2, 1.6 + k * 0.2), 30 + k));
      const ll = s.cue('רודף');
      wipeText(ctx, 'זה לא מזל רע', W / 2, 300, prog(lt, luck - 0.1, luck + 0.25), { size: 74, weight: 900 });
      if (lt > ll && lt < nd) cross(ctx, W / 2, 1250, 40, prog(lt, ll, ll + 0.3));
      const pl = prog(lt, nd - 0.1, nd + 0.25);
      if (pl > 0) {
        scrim(ctx, 0.62 * pl);
        headlines(ctx, lt, [{ t: 'השוק היה צריך', at: nd, y: 760, size: 104 }, { t: 'את הסטופ שלך', at: s.cue('הסטופ'), y: 900, size: 124, color: C.gold, glowColor: C.gold }]);
        ring(ctx, W / 2, 840, 650, prog(lt, nd, nd + 0.7), C.gold);
      }
    },
  },
  hook3: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('לפני'), type: 'riser' }, { lt: s.cue('קורה', 1), type: 'impact', k: 1 }, { lt: s.cue('להרוויח'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, bf = s.cue('לפני'), hp = s.cue('קורה', 1), earn = s.cue('להרוויח');
      drawBG(ctx, s.t, { hue: 20 });
      stdChart(ch, lt, [[0, 6, 46], [d, 10, 50]], { p: [63000, 67400] });
      ch.draw(ctx, { reveal: 43, dim: 0.45 });
      pools(ctx, ch, prog(lt, 0.2, 1.6), MAIN_POOLS, { labels: true });
      // predicted path (ghost): up into the pool, then down to the pools below
      const gp = prog(lt, bf, hp + 0.3);
      if (gp > 0) ch.zigzag(ctx, [[42, 66300], [44, 66800], [50, 65200], [56, 63700]], gp, { color: 'rgba(255,201,77,0.9)', width: 6, dots: false });
      if (lt > hp) hit(ctx, ch.X(44), ch.Y(66800), lt, hp, C.gold, 200);
      text(ctx, 'X-RAY', ch.r.x + ch.r.w - 40, ch.r.y + 130, { size: 30, weight: 900, fam: MONO, color: C.teal, align: 'right', alpha: 0.6 + 0.3 * Math.sin(lt * 6), spacing: 6 });
      wipeText(ctx, 'תראה את זה לפני שזה קורה', W / 2, 300, prog(lt, bf - 0.6, bf), { size: 64, weight: 900, color: C.purple2 });
      popT(ctx, W / 2, 1255, prog(lt, earn, earn + 0.35), () => pill(ctx, 'ותרוויח מזה', W / 2, 1255, { size: 46, color: '#0b8f63', glow: 40 }));
    },
  },
  intro: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('הראשון'), type: 'pop' }, { lt: s.cue('חמישה'), type: 'riser' }, { lt: s.cue('נזילות'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, first = s.cue('הראשון'), five = s.cue('חמישה'), nm = s.cue('נזילות'), en = s.cue('Liquidity');
      drawBG(ctx, s.t, { glow: 1.25 });
      orderRain(ctx, lt, 18, 77, 0.6);
      wipeText(ctx, 'קונפלואנס 1 מתוך 5', W / 2, 300, prog(lt, first - 0.05, first + 0.35), { size: 62, weight: 900, color: C.neon });
      seriesMap(ctx, lt, 0, five - 0.3, 1120);
      confluenceCard(ctx, lt, nm, { he: 'נזילות', en: 'LIQUIDITY', type: 'reversal', uses: ['כניסה', 'יעד'], y: 430, tType: en + 0.1 });
    },
  },

  // ================= CH1: what =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 6, 'מה זה בכלל נזילות?', 'WHAT IS LIQUIDITY', { cueWord: 'מה' }); } },
  what1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('קנה'), type: 'pop' }, { lt: s.cue('מכר'), type: 'impact', k: 0.7 }, { lt: s.cue('אין'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, b = s.cue('קנה'), m = s.cue('מכר'), no = s.cue('אין');
      drawBG(ctx, s.t);
      const meet = E.outCubic(prog(lt, b, m)), cy = 760;
      text(ctx, '$65,000', W / 2, 520, { size: 84, weight: 800, fam: MONO, color: '#fff', glow: 20, glowColor: C.purple, alpha: prog(lt, 0, 0.3) });
      popT(ctx, lerp(W + 200, W / 2 + 170, meet), cy, prog(lt, b - 0.1, b + 0.2), () => pill(ctx, 'קונה', lerp(W + 200, W / 2 + 170, meet), cy, { size: 54, color: '#0b8f63', glow: 30 }));
      popT(ctx, lerp(-200, W / 2 - 170, meet), cy, prog(lt, m - 0.3, m), () => pill(ctx, 'מוכר', lerp(-200, W / 2 - 170, meet), cy, { size: 54, color: '#d61f45', glow: 30 }));
      if (lt > m) { hit(ctx, W / 2, cy, lt, m, C.purple2, 260); popT(ctx, W / 2, cy + 160, prog(lt, m, m + 0.3), () => pill(ctx, 'עסקה ✓', W / 2, cy + 160, { size: 46, color: C.purple })); }
      const pn = prog(lt, no - 0.1, no + 0.3);
      if (pn > 0) {
        glass(ctx, 140, 1040, 800, 250, 30, { border: 'rgba(242,54,69,0.6)', glowColor: 'rgba(242,54,69,0.3)' });
        pill(ctx, 'קונה', 680, 1165, { size: 44, color: '#0b8f63' });
        text(ctx, '?', 400, 1165, { size: 110, weight: 900, color: 'rgba(255,255,255,0.35)' });
        cross(ctx, 540, 1165, 40, pn);
      }
    },
  },
  what2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('ענק'), type: 'impact', k: 1 }, { lt: s.cue('מיליארד'), type: 'riser' }],
    draw(ctx, s) {
      const { lt } = s, big = s.cue('ענק'), bil = s.cue('מיליארד'), bk = s.cue('בנק');
      drawBG(ctx, s.t, { glow: 1.2 });
      // small traders vs the whale
      const r = rng(4);
      for (let k = 0; k < 26; k++) { const x = 120 + r() * 840, y = 420 + r() * 300; ctx.save(); ctx.globalAlpha = 0.5 * (1 - prog(lt, big, big + 0.5)); ctx.beginPath(); ctx.arc(x, y + Math.sin(lt * 2 + k) * 6, 10, 0, Math.PI * 2); ctx.fillStyle = C.purple2; ctx.fill(); ctx.restore(); }
      const pc = prog(lt, big - 0.1, big + 0.4);
      popT(ctx, W / 2, 700, pc, () => { bankIcon(ctx, W / 2, 700, 2.4); });
      ring(ctx, W / 2, 700, 500, prog(lt, big, big + 0.8), C.gold);
      wipeText(ctx, 'קרן · בנק · מוסד', W / 2, 940, prog(lt, bk - 0.4, bk), { size: 60, weight: 900, color: C.gold });
      const pb = prog(lt, bil - 0.1, bil + 1.2);
      if (pb > 0) {
        const v = Math.round(1e9 * E.outExpo(pb));
        glass(ctx, 140, 1060, 800, 220, 30, { border: 'rgba(22,199,132,0.7)', glowColor: 'rgba(22,199,132,0.35)' });
        text(ctx, 'BUY BTC', W / 2, 1115, { size: 40, weight: 900, color: C.up, spacing: 6 });
        text(ctx, '$' + fmt(v), W / 2, 1200, { size: 78, weight: 800, fam: MONO, color: '#fff', glow: 24, glowColor: C.up });
      }
    },
  },
  what3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('ללחוץ'), type: 'click' }, { lt: s.cue('מקפיץ'), type: 'impact', k: 1.1 }, { lt: s.cue('עצמו'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, press = s.cue('ללחוץ'), none = s.cue('מספיק'), jump = s.cue('מקפיץ'), self = s.cue('עצמו');
      drawBG(ctx, s.t);
      // order book: sell orders (asks) per price level
      const x0 = 160, y0 = 470, rows = 9, rh = 84, sizes = [2.1, 1.4, 3.2, 0.9, 1.8, 2.6, 1.1, 2.2, 1.6];
      glass(ctx, 100, 380, 880, 900, 30);
      text(ctx, 'ORDER BOOK · SELL', W / 2, 425, { size: 30, weight: 800, fam: MONO, color: C.axis, spacing: 4 });
      const eat = prog(lt, press + 0.2, jump + 0.4) * rows; // rows consumed bottom-up
      for (let k = 0; k < rows; k++) {
        const y = y0 + (rows - 1 - k) * rh + 20, price = 65000 + k * 250, gone = clamp(eat - k), fl = gone > 0 && gone < 1;
        ctx.save(); ctx.globalAlpha = 1 - gone * 0.75;
        text(ctx, '$' + fmt(price), x0 + 20, y + 30, { size: 34, weight: 700, fam: MONO, color: fl ? C.gold : '#ddd', align: 'left' });
        const bw = sizes[k] * 160 * (1 - gone);
        ctx.fillStyle = fl ? C.gold : 'rgba(242,54,69,0.75)'; ctx.fillRect(900 - bw, y + 8, bw, 44);
        text(ctx, sizes[k].toFixed(1) + ' BTC', 880 - Math.max(bw, 0), y + 30, { size: 26, weight: 600, fam: MONO, color: C.axis, align: 'right', alpha: 1 - gone });
        ctx.restore();
      }
      // price marker climbing as the book is eaten
      const py = y0 + (rows - 1 - Math.min(rows - 1, eat)) * rh + 50;
      if (lt > press) { ctx.save(); ctx.strokeStyle = C.up; ctx.lineWidth = 5; ctx.shadowColor = C.up; ctx.shadowBlur = 18; ctx.beginPath(); ctx.moveTo(120, py); ctx.lineTo(960, py); ctx.stroke(); ctx.restore(); }
      badge(ctx, 'אין מספיק מוכרים', prog(lt, none, none + 0.35), '#d61f45', 300, W / 2, 44);
      if (lt > jump) { hit(ctx, W / 2, py, lt, jump, C.gold, 260); popT(ctx, W / 2, 1210, prog(lt, jump, jump + 0.3), () => pill(ctx, 'המחיר קופץ +3.2%', W / 2, 1210, { size: 44, color: '#b8860b', glow: 30 })); }
      if (lt > self) cross(ctx, 870, 1210, 34, prog(lt, self, self + 0.3));
    },
  },
  what4: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('בסטופים'), type: 'impact', k: 1 }, { lt: s.cue('מכירה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, sl = s.cue('בסטופים'), sell = s.cue('מכירה'), q = s.cue('איפה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 41], [d, 4, 41]], { p: [62800, 67100] });
      ch.draw(ctx, { reveal: 41, dim: 0.35 * prog(lt, sl, sl + 0.4) });
      const lbl = lt > sell ? 'SELL' : 'SL';
      LO.forEach((i, k) => { ch.hline(ctx, PV(i), i, 41, { color: 'rgba(61,242,166,0.7)', dash: [10, 10], width: 3, progress: prog(lt, sl + k * 0.1, sl + k * 0.1 + 0.5) }); stopPills(ctx, ch, i, PV(i), false, prog(lt, sl + k * 0.12, sl + k * 0.12 + 0.6), 20 + k, 0, lbl); });
      if (lt > sell) LO.forEach(i => ring(ctx, ch.X(i), ch.Y(PV(i)) + 90, 120, prog(lt, sell, sell + 0.6), C.down));
      wipeText(ctx, 'איפה יש המון מוכרים?', W / 2, 300, prog(lt, q - 0.05, q + 0.3) * (1 - prog(lt, sl - 0.2, sl)), { size: 62, weight: 900 });
      badge(ctx, 'סטופ של קונה = פקודת מכירה', prog(lt, sell - 0.2, sell + 0.2), '#d61f45', 300, W / 2, 40);
    },
  },
  what5: {
    trans: 'none',
    events: s => [{ lt: s.cue('נזילות'), type: 'impact', k: 1.2 }, { lt: s.cue('לבריכה'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, lq = s.cue('נזילות'), wait = s.cue('שמחכות'), pool = s.cue('מבריכה'), next = s.cue('לבריכה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 41], [d, 6, 46]], { p: [62800, 67100] });
      ch.draw(ctx, { reveal: 41, dim: 0.45 });
      pools(ctx, ch, prog(lt, wait, wait + 1.4), MAIN_POOLS, { labels: true });
      ch.zigzag(ctx, [[25, PV(25) - 300], [32, PV(32) + 300], [38, PV(38) - 300], [44, 66750]], prog(lt, pool, next + 0.6), { color: C.gold, width: 5, dots: false });
      popT(ctx, W / 2, 300, prog(lt, lq - 0.05, lq + 0.3), () => pill(ctx, 'נזילות = פקודות שמחכות', W / 2, 300, { size: 46, color: C.purple, glow: 45 }));
      badge(ctx, 'מבריכה לבריכה', prog(lt, pool, pool + 0.35), '#b8860b', 1270, W / 2, 40);
    },
  },

  // ================= CH2: where =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 6, 'איפה הנזילות יושבת?', 'WHERE IT SITS', { cueWord: 'איפה' }); } },
  where1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('מעל'), type: 'pop' }, { lt: s.cue('ומתחת'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, a = s.cue('מעל'), b = s.cue('ומתחת');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 41], [d, 1, 41]], { p: [62600, 67100] });
      ch.draw(ctx, { reveal: 41, dim: 0.35 * prog(lt, a, a + 0.4) });
      HI.forEach((i, k) => { ch.hline(ctx, PV(i), i, 41, { color: 'rgba(255,90,114,0.75)', dash: [10, 10], width: 3, progress: prog(lt, a + k * 0.1, a + k * 0.1 + 0.5) }); ch.dot(ctx, i, PV(i), prog(lt, a + k * 0.1, a + k * 0.1 + 0.3), '#ff5a72', 10); });
      LO.forEach((i, k) => { ch.hline(ctx, PV(i), i, 41, { color: 'rgba(61,242,166,0.75)', dash: [10, 10], width: 3, progress: prog(lt, b + k * 0.1, b + k * 0.1 + 0.5) }); ch.dot(ctx, i, PV(i), prog(lt, b + k * 0.1, b + k * 0.1 + 0.3), '#3df2a6', 10); });
      popT(ctx, 300, 300, prog(lt, b, b + 0.3), () => pill(ctx, 'מתחת לשפלים', 300, 300, { size: 38, color: '#0b8f63' }));
      popT(ctx, 780, 300, prog(lt, a, a + 0.3), () => pill(ctx, 'מעל שיאים', 780, 300, { size: 38, color: '#d61f45' }));
    },
  },
  where2: {
    trans: 'none',
    events: s => [{ lt: s.cue('עולה'), type: 'tick' }, { lt: s.cue('יורד'), type: 'tick' }, { lt: s.cue('הסטופ'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, up = s.cue('עולה'), dn = s.cue('יורד'), sh = s.cue('בשורט'), st = s.cue('הסטופ');
      drawBG(ctx, s.t);
      const [i0, i1] = kf(lt, [[0, 1, 41], [0.8, 9, 30], [d, 10, 30]]);
      const [pa, pb] = kf(lt, [[0, 62600, 67100], [0.8, 63400, 67700], [d, 63400, 67700]]);
      ch.layout(...PANEL_STD).view(i0, i1, pa, pb);
      ch.draw(ctx, { reveal: lerp(14, 26, prog(lt, up - 0.3, dn + 0.8)), dim: 0.2 });
      ch.zigzag(ctx, [[13, PV(13)], [20, PV(20)], [25, PV(25)]], prog(lt, up, dn + 0.6), { color: C.purple2 });
      ch.tag(ctx, 20, PV(20), 'שיא', prog(lt, dn, dn + 0.3), { color: C.purple, off: 44 });
      popT(ctx, ch.X(20) + 150, ch.Y(PV(20)) + 30, prog(lt, sh, sh + 0.3), () => pill(ctx, 'SELL', ch.X(20) + 150, ch.Y(PV(20)) + 30, { size: 30, color: '#d61f45' }));
      ch.hline(ctx, PV(20) + 180, 17, 30, { color: '#ff5a72', width: 4, dash: [10, 8], progress: prog(lt, st, st + 0.4) });
      popT(ctx, ch.X(24), ch.Y(PV(20) + 180) - 36, prog(lt, st, st + 0.35), () => pill(ctx, 'הסטופ של המוכר', ch.X(24), ch.Y(PV(20) + 180) - 36, { size: 28, color: '#d61f45' }));
    },
  },
  where3: {
    trans: 'none',
    events: s => [{ lt: s.cue('לפריצה'), type: 'pop' }, { lt: s.cue('נערמות'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, br = s.cue('לפריצה'), buy = s.cue('קנייה'), pile = s.cue('נערמות');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 10, 30], [d, 11, 30]]), 63400, 67700);
      ch.draw(ctx, { reveal: 26, dim: 0.3 });
      ch.hline(ctx, PV(20) + 180, 17, 30, { color: '#ff5a72', width: 4, dash: [10, 8] });
      popT(ctx, ch.X(24), ch.Y(PV(20) + 180) - 36, 1, () => pill(ctx, 'SL', ch.X(24), ch.Y(PV(20) + 180) - 36, { size: 26, color: '#d61f45' }));
      popT(ctx, ch.X(16), ch.Y(PV(20) + 140) - 36, prog(lt, buy, buy + 0.3), () => pill(ctx, 'BUY STOP', ch.X(16), ch.Y(PV(20) + 140) - 36, { size: 26, color: '#0b8f63' }));
      // the pile: counter of orders stacking above the high
      const n = Math.floor(lerp(2, 37, E.outCubic(prog(lt, pile - 0.4, d - 0.3))));
      if (lt > pile - 0.4) {
        const r = rng(8);
        for (let k = 0; k < n; k++) { const x = ch.X(20) + (r() - 0.5) * 190, y = ch.Y(PV(20)) - 90 - r() * 170; ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = r() > 0.5 ? '#ff5a72' : '#3df2a6'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12; ctx.fillRect(x - 10, y - 5, 20, 10); ctx.restore(); }
        popT(ctx, W / 2, 300, prog(lt, pile, pile + 0.3), () => pill(ctx, `${n} פקודות במקום אחד`, W / 2, 300, { size: 44, color: C.purple, glow: 40 }));
      }
    },
  },
  where4: {
    trans: 'none',
    events: s => [{ lt: s.cue('לשפל'), type: 'pop' }, { lt: s.cue('יושבים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, lo = s.cue('לשפל'), st = s.cue('הסטופים');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 10, 30], [0.8, 16, 36], [d, 17, 36]]), ...kf(lt, [[0, 63400, 67700], [0.8, 64300, 67000], [d, 64300, 67000]]));
      ch.draw(ctx, { reveal: 30, dim: 0.25 });
      ch.dot(ctx, 25, PV(25), prog(lt, lo, lo + 0.3), '#3df2a6', 13);
      ch.hline(ctx, PV(25), 25, 36, { color: 'rgba(61,242,166,0.8)', dash: [10, 10], width: 4, progress: prog(lt, lo, lo + 0.5) });
      stopPills(ctx, ch, 25, PV(25), false, prog(lt, st, st + 0.7), 44);
      badge(ctx, 'הסטופים של הקונים', prog(lt, st, st + 0.35), '#0b8f63', 300, W / 2, 42);
    },
  },
  where5: {
    trans: 'whip',
    events: s => [{ lt: s.cue('Equal'), type: 'impact', k: 1 }, { lt: s.cue('נוספת'), type: 'pop' }, { lt: s.cue('לערימה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, mag = s.cue('המגנט'), two = s.cue('שיאים'), eq = s.cue('Equal'), more = s.cue('נוספת'), pile = s.cue('לערימה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 41], [d, 14, 42]], { p: [64300, 67300] });
      ch.draw(ctx, { reveal: 41, dim: 0.3 });
      [20, 32].forEach((i, k) => { ch.dot(ctx, i, PV(i), prog(lt, two + k * 0.2, two + k * 0.2 + 0.3), C.gold, 14); ring(ctx, ch.X(i), ch.Y(PV(i)), 90, prog(lt, two + k * 0.2, two + k * 0.2 + 0.6), C.gold); });
      ch.hline(ctx, EQH, 18, 44, { color: C.gold, width: 6, progress: prog(lt, eq - 0.1, eq + 0.4) });
      ch.tag(ctx, 26, EQH, 'EQUAL HIGHS', prog(lt, eq, eq + 0.4), { color: '#b8860b', size: 34, off: 50, above: false });
      stopPills(ctx, ch, 20, PV(20), true, prog(lt, more - 0.3, more + 0.4), 30);
      stopPills(ctx, ch, 32, PV(32), true, prog(lt, more, pile + 0.4), 31);
      popT(ctx, ch.X(20), ch.Y(EQH) + 125, prog(lt, more - 0.3, more), () => pill(ctx, 'נגיעה 1', ch.X(20), ch.Y(EQH) + 125, { size: 26, color: '#b8860b' }));
      popT(ctx, ch.X(32), ch.Y(EQH) + 125, prog(lt, more, more + 0.3), () => pill(ctx, 'נגיעה 2', ch.X(32), ch.Y(EQH) + 125, { size: 26, color: '#b8860b' }));
      badge(ctx, 'המגנט הכי חזק', prog(lt, mag, mag + 0.35), '#b8860b', 300, W / 2, 46);
      if (lt > pile) { // particles pulled to the level
        const r = rng(3);
        for (let k = 0; k < 40; k++) { const x = ch.X(22 + r() * 18), y0 = ch.Y(65000 + r() * 800), ph = (lt - pile + r()) % 1, y = lerp(y0, ch.Y(EQH), E.inCubic(ph));
          ctx.save(); ctx.globalAlpha = 0.8 * (1 - ph); ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      }
    },
  },
  where6: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('מי'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, q = s.cue('תשאל'), who = s.cue('מי');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 14, 42], [d, 22, 40]]), ...kf(lt, [[0, 64300, 67000], [d, 65600, 66900]]));
      ch.draw(ctx, { reveal: 41, dim: 0.4 });
      ch.hline(ctx, EQH, 18, 44, { color: C.gold, width: 6 + 2 * Math.sin(lt * 6) });
      wipeText(ctx, 'כשאתה רואה קו ישר כזה', W / 2, 300, prog(lt, 0, 0.35) * (1 - prog(lt, q - 0.1, q + 0.1)), { size: 60, weight: 900 });
      wipeText(ctx, 'תשאל שאלה אחת', W / 2, 300, prog(lt, q, q + 0.35), { size: 64, weight: 900, color: C.purple2 });
      const pw = prog(lt, who - 0.1, who + 0.3);
      if (pw > 0) {
        scrim(ctx, 0.55 * pw);
        headlines(ctx, lt, [{ t: 'מי שם סטופ', at: who, y: 780, size: 120 }, { t: 'ממש פה?', at: s.cue('ממש'), y: 930, size: 140, color: C.gold, glowColor: C.gold, kind: 'pop' }]);
        ring(ctx, W / 2, 850, 600, prog(lt, who, who + 0.7), C.gold);
      }
    },
  },

  // ================= CH3: sweep =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 6, 'ה-Sweep', 'LIQUIDITY SWEEP', { at: 0.3 }); } },
  sweep1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('חשוב'), type: 'pop' }, { lt: s.cue('מטפס'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, imp = s.cue('חשוב'), cl = s.cue('מטפס');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 22, 44], [d, 26, 48]], { p: [64900, 67100] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 38], [cl, 40], [d, 43.9]], E.lin)[0] });
      ch.hline(ctx, EQH, 18, 52, { color: C.gold, width: 5 });
      ch.tag(ctx, 26, EQH, 'EQH', 1, { color: '#b8860b', size: 30, off: 42 });
      [20, 32].forEach((i, k) => stopPills(ctx, ch, i, PV(i), true, 1, 30 + k));
      badge(ctx, 'החלק הכי חשוב', prog(lt, imp, imp + 0.35), C.purple, 300, W / 2, 44);
      if (lt > cl) { const y = ch.Y(EQH), x = ch.X(42); ctx.save(); ctx.globalAlpha = 0.5 + 0.4 * Math.sin(lt * 8); arrow(ctx, x, y + 160, x, y + 40, 1, { color: C.gold, width: 8, head: 30 }); ctx.restore(); }
    },
  },
  sweep2: {
    trans: 'none',
    events: s => [{ lt: s.cue('חודר'), type: 'impact', k: 1.4 }, { lt: s.cue('מופעלים'), type: 'pop' }, { lt: s.cue('קונה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, pen = s.cue('חודר'), on = s.cue('מופעלים'), buy = s.cue('קונה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 26, 48], [d, 30, 50]], { p: [64900, 67100] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 43.9], [pen, 44.62], [d, 44.68]], E.lin)[0], highlight: i => i === 44 && lt > pen });
      ch.hline(ctx, EQH, 18, 52, { color: C.gold, width: 5 });
      const gone = prog(lt, on, on + 0.5);
      [20, 32].forEach((i, k) => stopPills(ctx, ch, i, PV(i), true, 1, 30 + k, gone));
      if (lt > pen) { hit(ctx, ch.X(44), ch.Y(66780), lt, pen, C.gold, 230); flashCol(ctx, lt, pen, '255,201,77', 0.22); }
      if (lt > on) { const r = rng(12); for (let k = 0; k < 8; k++) { const x = ch.X(44) + (r() - 0.5) * 300, y = ch.Y(66600) - 60 - r() * 120, pk = prog(lt, buy + k * 0.06, buy + k * 0.06 + 0.3); popT(ctx, x, y, pk, () => pill(ctx, 'BUY', x, y, { size: 24, color: '#0b8f63', pad: 12, glow: 12 })); } }
      badge(ctx, 'כל הסטופים מופעלים', prog(lt, on, on + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },
  sweep3: {
    trans: 'none',
    events: s => [{ lt: s.cue('הגדול'), type: 'pop' }, { lt: s.cue('הפקודות'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, big = s.cue('הגדול'), all = s.cue('הפקודות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 30, 50], [d, 31, 50]], { p: [64900, 67900] });
      ch.draw(ctx, { reveal: 44.68, highlight: i => i === 44, dim: 0.3 });
      ch.hline(ctx, EQH, 18, 52, { color: C.gold, width: 5 });
      // orders flow from the level to the big player card
      const px = W / 2, py = 500;
      if (lt > big) { const r = rng(21); for (let k = 0; k < 50; k++) { const sx = ch.X(41 + r() * 6), sy = ch.Y(66500 + r() * 300), ph = (lt - big + r() * 1.2) % 1.2 / 1.2; ctx.save(); ctx.globalAlpha = 0.9 * (1 - ph); ctx.fillStyle = r() > 0.5 ? '#ff5a72' : '#3df2a6'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10; ctx.fillRect(lerp(sx, px, E.inCubic(ph)) - 8, lerp(sy, py + 80, E.inCubic(ph)) - 4, 16, 8); ctx.restore(); } }
      playerCard(ctx, px, py + 80, prog(lt, big - 0.1, big + 0.3), lt > all ? 'FILLED ✓' : '$' + fmt(Math.round(1e9 * prog(lt, big, all))), { sub: 'מקבל את כל הפקודות' });
      if (lt > all) hit(ctx, px, py + 80, lt, all, C.up, 300);
    },
  },
  sweep4: {
    trans: 'none',
    events: s => [{ lt: s.cue('נסגר'), type: 'tick' }, { lt: s.cue('פתיל'), type: 'pop' }, { lt: s.cue('Sweep'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, cl = s.cue('נסגר'), wk = s.cue('פתיל'), sw = s.cue('Sweep');
      drawBG(ctx, s.t);
      const [i0, i1] = kf(lt, [[0, 30, 50], [wk, 37, 49], [d, 36, 50]]);
      ch.layout(...PANEL_STD).view(i0, i1, ...kf(lt, [[0, 64900, 67100], [wk, 65600, 67000], [d, 65500, 67000]]));
      ch.draw(ctx, { reveal: kf(lt, [[0, 44.68], [cl + 0.6, 45]], E.lin)[0], highlight: i => i === 44 });
      ch.hline(ctx, EQH, 18, 52, { color: C.gold, width: 5 });
      if (lt > wk) { const x = ch.X(44), y0 = ch.Y(66820), y1 = ch.Y(66300); ctx.save(); ctx.strokeStyle = C.neon; ctx.lineWidth = 4; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(x + 50, y0); ctx.lineTo(x + 70, y0); ctx.lineTo(x + 70, y1); ctx.lineTo(x + 50, y1); ctx.stroke(); ctx.restore();
        popT(ctx, x + 170, (y0 + y1) / 2, prog(lt, wk, wk + 0.3), () => pill(ctx, 'פתיל ארוך', x + 170, (y0 + y1) / 2, { size: 30, color: C.purple })); }
      if (lt > cl + 0.5) check(ctx, ch.X(44) - 80, ch.Y(66110), 26, prog(lt, cl + 0.5, cl + 0.8));
      popT(ctx, W / 2, 300, prog(lt, sw, sw + 0.35), () => pill(ctx, 'LIQUIDITY SWEEP', W / 2, 300, { size: 54, color: C.purple, glow: 50 }));
      if (lt > sw) ring(ctx, W / 2, 300, 500, prog(lt, sw, sw + 0.7));
    },
  },
  sweep5: {
    trans: 'whip',
    events: s => [{ lt: s.cue('היפוך'), type: 'pop' }, { lt: s.cue('דלק'), type: 'tick' }, { lt: s.cue('מתהפך'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, rv = s.cue('היפוך'), fuel = s.cue('דלק'), flip = s.cue('מתהפך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 30, 50], [d, 32, 52]], { p: [64800, 67100] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 45], [flip, 45.3], [d, 47.5]], E.lin)[0], highlight: i => i === 44 });
      ch.hline(ctx, EQH, 18, 54, { color: C.gold, width: 4, alpha: 0.6 });
      popT(ctx, W / 2, 300, prog(lt, rv - 0.1, rv + 0.3), () => pill(ctx, 'קונפלואנס של היפוך ⇄', W / 2, 300, { size: 44, color: '#ff8a3d', fg: '#140800', glow: 40 }));
      // fuel gauge
      const pf = prog(lt, fuel - 0.4, fuel), lvl = 1 - prog(lt, fuel, flip);
      if (pf > 0) { ctx.save(); ctx.globalAlpha = pf; glass(ctx, 720, 450, 260, 90, 20); text(ctx, 'דלק', 950, 495, { size: 32, weight: 900, align: 'right' });
        rrect(ctx, 740, 478, 140, 34, 10); ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = lvl > 0.3 ? C.up : C.down; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14; rrect(ctx, 744, 482, 132 * lvl + 0.1, 26, 8); ctx.fill(); ctx.restore(); }
      arrow(ctx, ch.X(45) + 40, ch.Y(66200), ch.X(48) + 30, ch.Y(65100), prog(lt, flip, flip + 0.5), { color: C.down, width: 12, head: 44 });
      if (lt > flip) hit(ctx, ch.X(45), ch.Y(66100), lt, flip, C.down, 200);
    },
  },
  sweep6: {
    trans: 'none',
    events: s => [{ lt: s.cue('לבריכה'), type: 'whoosh' }, { lt: s.cue('כניסה'), type: 'pop' }, { lt: s.cue('יעד'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, nx = s.cue('לבריכה'), lows = s.cue('שמתחת'), en = s.cue('כניסה'), tg = s.cue('יעד');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 32, 52], [1.2, 8, 60], [d, 7, 60]], { p: [62700, 67300] });
      ch.draw(ctx, { reveal: lerp(47.5, 59, prog(lt, nx, tg)) });
      ch.hline(ctx, EQH, 18, 54, { color: C.gold, width: 3, alpha: 0.5 });
      LO.forEach((i, k) => { ch.hline(ctx, PV(i), i, 60, { color: '#3df2a6', width: 3, dash: [10, 8], progress: prog(lt, lows + k * 0.1, lows + 0.6) }); });
      pools(ctx, ch, prog(lt, lows, lows + 1), [[25, PV(25), false], [38, PV(38), false], [13, PV(13), false]], { labels: true });
      popT(ctx, ch.X(44), ch.Y(66820) - 50, prog(lt, en, en + 0.3), () => pill(ctx, 'כניסה', ch.X(44), ch.Y(66820) - 50, { size: 34, color: '#2962ff' }));
      popT(ctx, ch.X(52), ch.Y(PV(13)) + 70, prog(lt, tg, tg + 0.3), () => pill(ctx, 'יעד', ch.X(52), ch.Y(PV(13)) + 70, { size: 34, color: '#0b8f63' }));
      badge(ctx, 'גם כניסה · וגם יעד', prog(lt, en, en + 0.35), C.purple, 300, W / 2, 44);
    },
  },

  // ================= CH4: examples =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 6, 'שתי דוגמאות אמיתיות', 'REAL EXAMPLES', { cueWord: 'שתי' }); } },
  ex1a: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('יומי'), type: 'click' }, { lt: s.cue('Equal'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE1, dl = s.cue('יומי'), two = s.cue('שפלים'), eq = s.cue('Equal');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 40], [d, 2, 41]], { p: [46200, 52600] });
      ch.draw(ctx, { reveal: 36.9, tfFlash: Math.exp(-Math.max(0, lt - dl) * 5) * (lt > dl ? 1 : 0) });
      [18, 30].forEach((i, k) => ch.dot(ctx, i, XP1.find(p => p[0] === i)[1], prog(lt, two + k * 0.2, two + k * 0.2 + 0.3), C.gold, 14));
      ch.hline(ctx, EQL, 16, 42, { color: C.gold, width: 6, progress: prog(lt, eq - 0.1, eq + 0.4) });
      ch.tag(ctx, 24, EQL, 'EQUAL LOWS', prog(lt, eq, eq + 0.4), { color: '#b8860b', size: 32, above: false, off: 48 });
      [18, 30].forEach((i, k) => stopPills(ctx, ch, i, EQL, false, prog(lt, eq + 0.2 + k * 0.1, eq + 0.9), 60 + k));
      badge(ctx, 'דוגמה 1 · גרף יומי', prog(lt, 0, 0.35), C.purple, 300, W / 2, 42);
    },
  },
  ex1b: {
    trans: 'none',
    events: s => [{ lt: s.cue('שובר'), type: 'impact', k: 1.2 }, { lt: s.cue('אוסף'), type: 'pop' }, { lt: s.cue('מעל'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE1, br = s.cue('שובר'), col = s.cue('אוסף'), ab = s.cue('מעל');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 41], [br, 18, 42], [d, 19, 43]], { p: [46400, 50200] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 36.9], [br, 37.55], [ab, 38], [d, 39]], E.lin)[0], highlight: i => i === 37 && lt > br });
      ch.hline(ctx, EQL, 16, 44, { color: C.gold, width: 5 });
      [18, 30].forEach((i, k) => stopPills(ctx, ch, i, EQL, false, 1, 60 + k, prog(lt, col, col + 0.5)));
      if (lt > br) hit(ctx, ch.X(37), ch.Y(47000), lt, br, C.gold, 220);
      popT(ctx, W / 2, 300, prog(lt, br, br + 0.35), () => pill(ctx, 'SWEEP ↓', W / 2, 300, { size: 50, color: C.purple, glow: 45 }));
      if (lt > ab) { check(ctx, ch.X(37) - 80, ch.Y(48380), 26, prog(lt, ab, ab + 0.3)); popT(ctx, ch.X(37) - 80, ch.Y(48380) - 70, prog(lt, ab, ab + 0.3), () => pill(ctx, 'סגירה מעל', ch.X(37) - 80, ch.Y(48380) - 70, { size: 28, color: '#0b8f63' })); }
    },
  },
  ex1c: {
    trans: 'none',
    events: s => [{ lt: s.cue('עולה'), type: 'whoosh' }, { lt: s.cue('השיאים'), type: 'pop' }, { lt: s.cue('סטופים'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE1, up = s.cue('עולה'), hs = s.cue('השיאים'), st = s.cue('סטופים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 18, 43], [0.8, 0, 53], [d, 0, 53]], { p: [46400, 54000] });
      const rev = lerp(39, 53, prog(lt, up, d - 0.2));
      ch.draw(ctx, { reveal: rev });
      ch.hline(ctx, EQL, 16, 44, { color: C.gold, width: 3, alpha: 0.5 });
      [[24, 49900], [12, 50800], [0, 51800]].forEach(([i, p], k) => {
        const taken = EX1.slice(38, Math.floor(rev)).some(q => q.h > p), pk = prog(lt, hs + k * 0.15, hs + k * 0.15 + 0.4);
        ch.hline(ctx, p, i, 53, { color: taken ? C.up : '#ff5a72', width: 3, dash: taken ? null : [10, 8], progress: pk });
        if (taken) { const ti = 38 + EX1.slice(38).findIndex(q => q.h > p); const tt = up + (ti - 39) / 14 * (d - 0.2 - up); hit(ctx, ch.X(ti), ch.Y(p), lt, tt, C.up, 150); popT(ctx, ch.X(ti) - 90, ch.Y(p) - 36, prog(lt, tt, tt + 0.3), () => pill(ctx, 'TARGET ✓', ch.X(ti) - 90, ch.Y(p) - 36, { size: 24, color: '#0b8f63', pad: 12 })); }
      });
      badge(ctx, 'גם שם מחכים סטופים', prog(lt, st, st + 0.35), C.purple, 300, W / 2, 42);
    },
  },
  ex2a: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שעה'), type: 'click' }, { lt: s.cue('צמודים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE2, hr = s.cue('שעה'), cl = s.cue('צמודים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 34], [d, 2, 36]], { p: [60800, 63000] });
      ch.draw(ctx, { reveal: lerp(20, 30.9, prog(lt, 0, cl + 0.3)), tfFlash: lt > hr ? Math.exp(-(lt - hr) * 5) : 0 });
      X2H.forEach((i, k) => ch.dot(ctx, i, PV2(i), prog(lt, cl - 0.4 + k * 0.15, cl - 0.1 + k * 0.15), '#ff5a72', 12));
      ch.zone(ctx, 62380, 62470, 4, 36, { color: '#ff5a72', alpha: 0.18, progress: prog(lt, cl, cl + 0.5) });
      badge(ctx, 'דוגמה 2 · גרף שעה', prog(lt, 0, 0.35), C.purple, 300, W / 2, 42);
    },
  },
  ex2b: {
    trans: 'none',
    events: s => [{ lt: s.cue('קטנה'), type: 'pop' }, { lt: s.cue('קונים'), type: 'pop' }, { lt: s.cue('מתהפך'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE2, br = s.cue('קטנה'), buy = s.cue('קונים'), flip = s.cue('מתהפך'), low = s.cue('לאסוף');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 36], [flip, 4, 40], [d, 4, 47]], { p: [60000, 63000] });
      const rev = kf(lt, [[0, 30.9], [br, 31.6], [flip, 32], [d - 0.2, 46.5]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === 31 && lt > br });
      ch.zone(ctx, 62380, 62470, 4, 47, { color: '#ff5a72', alpha: 0.14 });
      if (lt > br) { const r = rng(5); for (let k = 0; k < 6; k++) { const x = ch.X(31) + (r() - 0.5) * 240, y = ch.Y(62700) - 60 - r() * 120; popT(ctx, x, y, prog(lt, buy + k * 0.05, buy + k * 0.05 + 0.3) * (1 - prog(lt, flip + 0.5, flip + 0.9)), () => pill(ctx, 'BUY', x, y, { size: 24, color: '#0b8f63', pad: 12 })); } }
      if (lt > flip) hit(ctx, ch.X(31), ch.Y(62700), lt, flip, C.down, 200);
      X2L.forEach((i, k) => {
        const p = PV2(i), taken = EX2.slice(32, Math.floor(rev)).some(q => q.l < p);
        ch.hline(ctx, p, i, 47, { color: taken ? C.down : '#3df2a6', width: 3, dash: taken ? null : [10, 8], progress: prog(lt, low - 0.6 + k * 0.1, low) });
        if (taken) { const ti = 32 + EX2.slice(32).findIndex(q => q.l < p); const tt = flip + (ti - 32) / 14.5 * (d - 0.2 - flip); hit(ctx, ch.X(ti), ch.Y(p), lt, tt, '#ff5a72', 130); }
      });
      if (lt < flip) wipeText(ctx, 'פריצה? כולם קונים', W / 2, 300, prog(lt, br, br + 0.3), { size: 60, weight: 900, color: '#3df2a6' });
      else popT(ctx, W / 2, 300, prog(lt, flip, flip + 0.3), () => pill(ctx, 'SWEEP ↑ ואז היפוך', W / 2, 300, { size: 46, color: '#d61f45', glow: 40 }));
    },
  },
  ex2c: {
    trans: 'none',
    events: s => [{ lt: s.cue('סוויפ'), type: 'pop' }, { lt: s.cue('יעד'), type: 'pop' }, { lt: s.cue('לנזילות'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE2, sw = s.cue('סוויפ'), tg = s.cue('יעד'), lq = s.cue('לנזילות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 47], [d, 3, 47]], { p: [60000, 63000] });
      ch.draw(ctx, { reveal: 47, dim: 0.35 });
      popT(ctx, ch.X(31), ch.Y(62780) - 50, prog(lt, sw, sw + 0.3), () => pill(ctx, 'SWEEP', ch.X(31), ch.Y(62780) - 50, { size: 36, color: C.purple }));
      ch.zone(ctx, 60250, 61900, 31, 47, { color: C.up, alpha: 0.16, progress: prog(lt, tg, tg + 0.5) });
      popT(ctx, ch.X(40), ch.Y(60400) + 60, prog(lt, tg, tg + 0.3), () => pill(ctx, 'TARGET', ch.X(40), ch.Y(60400) + 60, { size: 36, color: '#0b8f63' }));
      arrow(ctx, ch.X(31) + 20, ch.Y(62650), ch.X(40), ch.Y(61000), prog(lt, tg, lq), { color: C.gold, width: 10, head: 40 });
      popT(ctx, W / 2, 300, prog(lt, lq - 0.1, lq + 0.3), () => pill(ctx, 'מנזילות לנזילות', W / 2, 300, { size: 50, color: '#b8860b', glow: 45 }));
    },
  },

  // ================= CH5: trap =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 6, 'המלכודת', 'THE TRAP', { cueWord: 'המלכודת' }); } },
  trap1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('טועים'), type: 'impact', k: 1 }, { lt: s.cue('סוויפ'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, wrong = s.cue('טועים'), sw = s.cue('סוויפ');
      drawBG(ctx, s.t);
      [[chTA, PANEL_TOP], [chTB, PANEL_BOT]].forEach(([ch, pn]) => {
        ch.layout(...pn, { head: 80, foot: 40 }).view(...kf(lt, [[0, 6, 32], [d, 8, 32]]), 65000, 67100);
        ch.draw(ctx, { reveal: kf(lt, [[0, 24], [sw, 25.5]], E.lin)[0] });
        ch.hline(ctx, 66400, 4, 34, { color: C.gold, width: 4 });
        if (lt > sw) text(ctx, '?', ch.X(25) + 90, ch.Y(66650), { size: 90, weight: 900, color: C.gold, alpha: prog(lt, sw, sw + 0.3) });
      });
      badge(ctx, 'רוב הסוחרים טועים כאן', prog(lt, wrong, wrong + 0.35), '#d61f45', 268, W / 2, 40);
    },
  },
  trap2: {
    trans: 'none',
    events: s => [{ lt: s.cue('גוף'), type: 'pop' }, { lt: s.cue('אמיתית'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, body = s.cue('גוף'), stay = s.cue('ונשאר'), real = s.cue('אמיתית');
      drawBG(ctx, s.t);
      chTA.layout(...PANEL_TOP, { head: 80, foot: 40 }).view(8, 32, 65000, 67100); chTA.draw(ctx, { reveal: 25.5, dim: 0.5 }); chTA.hline(ctx, 66400, 4, 34, { color: C.gold, width: 3, alpha: 0.5 });
      const ch = chTB; ch.layout(...PANEL_BOT, { head: 80, foot: 40 }).view(...kf(lt, [[0, 8, 32], [d, 10, 34]]), 64400, ...kf(lt, [[0, 67300], [d, 68200]]));
      ch.draw(ctx, { reveal: kf(lt, [[0, 25.5], [body, 26], [d, 30]], E.lin)[0], highlight: i => i === 25 && lt > body });
      ch.hline(ctx, 66400, 4, 34, { color: lt > stay ? C.up : C.gold, width: 4 });
      if (lt > body) { const x = ch.X(25), y0 = ch.Y(66740), y1 = ch.Y(66400); ctx.save(); ctx.strokeStyle = C.up; ctx.lineWidth = 4; ctx.strokeRect(x - 26, y0 - 8, 52, y1 - y0 + 16); ctx.restore();
        popT(ctx, x - 150, y0 - 30, prog(lt, body, body + 0.3), () => pill(ctx, 'גוף מלא מעל', x - 150, y0 - 30, { size: 28, color: '#0b8f63' })); }
      popT(ctx, W / 2, 268, prog(lt, real, real + 0.35), () => pill(ctx, 'פריצה אמיתית · לא סוויפ', W / 2, 268, { size: 42, color: '#0b8f63', glow: 40 }));
    },
  },
  trap3: {
    trans: 'none',
    events: s => [{ lt: s.cue('פתיל'), type: 'pop' }, { lt: s.cue('בפנים'), type: 'pop' }, { lt: s.cue('בסגירה'), type: 'impact', k: 1 }, { lt: s.cue('תחכה'), type: 'tick' }],
    draw(ctx, s) {
      const { lt, d } = s, wk = s.cue('פתיל'), inn = s.cue('בפנים'), cls = s.cue('בסגירה'), wait = s.cue('תחכה');
      drawBG(ctx, s.t);
      const ch = chTA; ch.layout(...PANEL_TOP, { head: 80, foot: 40 }).view(...kf(lt, [[0, 8, 32], [d, 12, 32]]), 64600, 67100);
      ch.draw(ctx, { reveal: kf(lt, [[0, 25.5], [inn, 26], [d, 28]], E.lin)[0], highlight: i => i === 25 });
      ch.hline(ctx, 66400, 4, 34, { color: C.gold, width: 4 });
      popT(ctx, ch.X(25) - 140, ch.Y(66780), prog(lt, wk, wk + 0.3), () => pill(ctx, 'פתיל חודר', ch.X(25) - 140, ch.Y(66780), { size: 28, color: C.purple }));
      popT(ctx, ch.X(25) - 140, ch.Y(66120) + 46, prog(lt, inn, inn + 0.3), () => pill(ctx, 'גוף בפנים', ch.X(25) - 140, ch.Y(66120) + 46, { size: 28, color: '#d61f45' }));
      check(ctx, ch.r.x + 90, ch.r.y + 140, 34, prog(lt, inn, inn + 0.3));
      text(ctx, 'SWEEP', ch.r.x + 150, ch.r.y + 141, { size: 36, weight: 900, color: '#3df2a6', align: 'left', alpha: prog(lt, inn, inn + 0.3) });
      const cb = chTB; cb.layout(...PANEL_BOT, { head: 80, foot: 40 }).view(10, 34, 65000, 68200); cb.draw(ctx, { reveal: 30, dim: 0.4 }); cb.hline(ctx, 66400, 4, 34, { color: C.up, width: 3, alpha: 0.6 });
      text(ctx, 'BREAKOUT', cb.r.x + 150, cb.r.y + 141, { size: 36, weight: 900, color: '#3df2a6', align: 'left' }); check(ctx, cb.r.x + 90, cb.r.y + 140, 34, 1, C.up);
      // candle-close countdown
      const pc = prog(lt, wait - 0.2, wait + 0.2);
      if (pc > 0) { scrim(ctx, 0.5 * pc); const secs = Math.max(0, Math.ceil(lerp(9, 0, prog(lt, wait, d - 0.2))));
        popT(ctx, W / 2, 860, pc, () => { glass(ctx, W / 2 - 330, 720, 660, 280, 34, { border: C.gold, glowColor: 'rgba(255,201,77,0.4)' });
          text(ctx, 'סגירת הנר בעוד', W / 2, 790, { size: 46, weight: 900 }); text(ctx, `00:0${secs}`, W / 2, 900, { size: 100, weight: 800, fam: MONO, color: C.gold, glow: 24 }); }); }
      badge(ctx, 'ההבדל: הסגירה', prog(lt, cls, cls + 0.35), '#b8860b', 268, W / 2, 42);
    },
  },
  trap4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('בדיוק'), type: 'pop' }, { lt: s.cue('כולם'), type: 'impact', k: 0.9 }, { lt: s.cue('מרווח'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, bad = s.cue('בדיוק'), all = s.cue('כולם'), good = s.cue('מרווח');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 34, 50], [d, 35, 49]]), 65200, 67200);
      ch.draw(ctx, { reveal: 47, highlight: i => i === 44 });
      ch.hline(ctx, EQH, 18, 56, { color: C.gold, width: 4 });
      ch.hline(ctx, 66480, 34, 56, { color: C.down, width: 4, dash: [12, 10], progress: prog(lt, bad, bad + 0.4) });
      popT(ctx, ch.X(37), ch.Y(66480) - 38, prog(lt, bad, bad + 0.35), () => pill(ctx, 'סטופ צמוד', ch.X(37), ch.Y(66480) - 38, { size: 30, color: '#d61f45' }));
      cross(ctx, ch.X(39.6), ch.Y(66480) - 38, 26, prog(lt, all, all + 0.3));
      ch.hline(ctx, STOP, 34, 56, { color: C.up, width: 5, progress: prog(lt, good, good + 0.4) });
      popT(ctx, ch.X(37), ch.Y(STOP) - 38, prog(lt, good, good + 0.35), () => pill(ctx, 'מעל הפתיל + מרווח', ch.X(37), ch.Y(STOP) - 38, { size: 30, color: '#0b8f63' }));
      check(ctx, ch.X(40.6), ch.Y(STOP) - 38, 26, prog(lt, good + 0.3, good + 0.6));
      badge(ctx, 'שם כולם', prog(lt, all, all + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },

  // ================= CH6: TradingView + plan =================
  ch6: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 6, 6, 'תוכנית מסחר', 'TRADINGVIEW PLAN', { cueWord: 'תוכנית' }); } },
  tv1: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('ארבע'), type: 'click' }, { lt: s.cue('ומסמנים') + 0.1, type: 'click' }, { lt: s.cue('אלט'), type: 'key' }, { lt: s.cue('ואייץ'), type: 'key' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, tf = s.cue('ארבע'), fnd = s.cue('שווים'), mk = s.cue('ומסמנים'), ka = s.cue('אלט'), kb = s.cue('ואייץ');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(4, 42, 62900, 67000);
      ch.draw(ctx, { reveal: 41, tfs: ['15m', '1H', '4H', '1D'], dim: 0.1, tfFlash: lt > tf ? Math.exp(-(lt - tf) * 5) : 0 });
      const at = tvToolbar(ctx, 40, 466, 870, lt > mk ? 'hline' : null);
      [20, 32].forEach((i, k) => ch.dot(ctx, i, PV(i), prog(lt, fnd + k * 0.2, fnd + k * 0.2 + 0.3), C.gold, 11));
      ch.hline(ctx, EQH, 20, 42, { color: C.gold, width: 4, progress: prog(lt, mk + 0.3, mk + 0.8) });
      const [hx, hy] = at('hline');
      if (lt < ka) { const c = kf(lt, [[0, 700, 1100], [tf - 0.2, 600, 425], [fnd, ch.X(26), ch.Y(EQH) + 80], [mk, hx, hy], [mk + 0.3, ch.X(30), ch.Y(EQH)]]); cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - mk - 0.1) * 14), 1.15); }
      const pk = prog(lt, ka - 0.05, ka + 0.3);
      if (pk > 0) { scrim(ctx, 0.5 * pk);
        keycap(ctx, 'Alt', W / 2 - 150, 860, pk, { w: 230, pressed: lt > ka ? 1 : 0 }); text(ctx, '+', W / 2 - 5, 860, { size: 90, weight: 900, color: C.purple2, alpha: pk });
        keycap(ctx, 'H', W / 2 + 160, 860, prog(lt, kb - 0.05, kb + 0.3), { w: 170, pressed: lt > kb ? 1 : 0 });
        popT(ctx, W / 2, 1040, prog(lt, kb, kb + 0.35), () => pill(ctx, 'Horizontal Line', W / 2, 1040, { size: 40, color: C.purple })); }
    },
  },
  tv2: {
    trans: 'none',
    events: s => [{ lt: s.cue('התראה'), type: 'click' }, { lt: s.cue('אלט'), type: 'key' }, { lt: s.cue('ואיי'), type: 'key' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, al = s.cue('התראה'), ka = s.cue('אלט'), kb = s.cue('ואיי');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(4, 42, 62900, 67000);
      ch.draw(ctx, { reveal: 41, tfs: ['15m', '1H', '4H', '1D'], dim: 0.1 });
      tvToolbar(ctx, 40, 466, 870, null);
      ch.hline(ctx, EQH, 20, 42, { color: C.gold, width: 4 });
      const pa = prog(lt, al - 0.1, al + 0.25) * (1 - prog(lt, ka - 0.3, ka - 0.05));
      if (pa > 0) {
        ctx.save(); ctx.globalAlpha = pa; const bx = 170, by = 560, bw = 740, bh = 420;
        glass(ctx, bx, by, bw, bh, 26, { fill: 'rgba(22,16,40,0.97)' });
        text(ctx, 'Create alert on BTCUSD', bx + 40, by + 60, { size: 36, weight: 800, align: 'left' });
        [['Condition', 'Crossing'], ['Value', '66,400.00'], ['Trigger', 'Once only']].forEach(([k, v], j) => {
          text(ctx, k, bx + 40, by + 140 + j * 70, { size: 28, weight: 500, align: 'left', color: C.axis });
          rrect(ctx, bx + 300, by + 112 + j * 70, 400, 56, 10); ctx.fillStyle = '#0d0a19'; ctx.fill();
          text(ctx, v, bx + 320, by + 140 + j * 70, { size: 28, weight: 700, align: 'left', fam: MONO });
        });
        rrect(ctx, bx + bw - 240, by + bh - 90, 200, 64, 14); ctx.fillStyle = C.purple; ctx.fill();
        text(ctx, 'Create', bx + bw - 140, by + bh - 57, { size: 30, weight: 800 });
        ctx.restore();
        const c = kf(lt, [[al, 800, 1200], [ka - 0.5, 800, 940]]); cursor(ctx, c[0], c[1], 0, 1.15);
      }
      const pk = prog(lt, ka - 0.05, ka + 0.3);
      if (pk > 0) { scrim(ctx, 0.5 * pk);
        keycap(ctx, 'Alt', W / 2 - 150, 860, pk, { w: 230, pressed: lt > ka ? 1 : 0 }); text(ctx, '+', W / 2 - 5, 860, { size: 90, weight: 900, color: C.purple2, alpha: pk });
        keycap(ctx, 'A', W / 2 + 160, 860, prog(lt, kb - 0.05, kb + 0.3), { w: 170, pressed: lt > kb ? 1 : 0 });
        popT(ctx, W / 2, 1040, prog(lt, kb, kb + 0.35), () => pill(ctx, 'Add Alert', W / 2, 1040, { size: 40, color: C.purple })); }
      badge(ctx, 'בלי לשבת מול המסך', prog(lt, s.cue('לשבת'), s.cue('לשבת') + 0.35), C.purple, 300, W / 2, 40);
    },
  },
  tv3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('קופצת'), type: 'pop' }, { lt: s.cue('לא'), type: 'pop' }, { lt: s.cue('מתחת'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, pop = s.cue('קופצת'), no = s.cue('לא'), wait = s.cue('מחכים'), below = s.cue('מתחת');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 28, 48], [d, 32, 50]], { p: [65000, 67100] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 44.3], [pop, 44.6], [wait, 44.7], [below, 45]], E.lin)[0], highlight: i => i === 44 });
      ch.hline(ctx, EQH, 18, 52, { color: C.gold, width: 4 });
      // alert toast
      const pt = prog(lt, pop - 0.1, pop + 0.25);
      if (pt > 0) { const y = lerp(150, 300, E.outBack(pt)); ctx.save(); ctx.globalAlpha = pt; glass(ctx, 120, y - 60, 840, 120, 24, { border: C.gold, glowColor: 'rgba(255,201,77,0.4)' });
        warnIcon(ctx, 185, y - 4, 30, 1); text(ctx, 'Alert: BTCUSD Crossing 66,400', 250, y, { size: 34, weight: 800, align: 'left', fam: MONO, color: C.gold }); ctx.restore(); }
      if (lt > no && lt < below) cross(ctx, ch.X(46) + 40, ch.Y(66800), 30, prog(lt, no, no + 0.3));
      if (lt > no && lt < below) popT(ctx, ch.X(46) + 40, ch.Y(66800) + 70, prog(lt, no, no + 0.3), () => pill(ctx, 'לא נכנסים מיד', ch.X(46) + 40, ch.Y(66800) + 70, { size: 28, color: '#d61f45' }));
      if (lt > below) { check(ctx, ch.X(44) - 80, ch.Y(66110), 28, prog(lt, below, below + 0.3)); popT(ctx, ch.X(44) - 80, ch.Y(66110) + 64, prog(lt, below, below + 0.3), () => pill(ctx, 'נסגר מתחת ✓', ch.X(44) - 80, ch.Y(66110) + 64, { size: 28, color: '#0b8f63' })); }
    },
  },
  plan1: {
    trans: 'none',
    events: s => [{ lt: s.cue('הכניסה'), type: 'pop' }, { lt: s.cue('הסטופ'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, en = s.cue('הכניסה'), st = s.cue('הסטופ');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 32, 50], [d, 30, 56]], { p: [63300, 67300] });
      ch.draw(ctx, { reveal: 45 });
      ch.hline(ctx, EQH, 18, 56, { color: C.gold, width: 3, alpha: 0.6 });
      ch.hline(ctx, ENTRY, 44, 56, { color: '#fff', width: 4, progress: prog(lt, en, en + 0.4) });
      popT(ctx, ch.X(50), ch.Y(ENTRY) + 36, prog(lt, en, en + 0.35), () => pill(ctx, 'כניסה: SHORT', ch.X(50), ch.Y(ENTRY) + 36, { size: 28, color: '#2962ff' }));
      ch.hline(ctx, STOP, 44, 56, { color: C.down, width: 4, progress: prog(lt, st, st + 0.4) });
      popT(ctx, ch.X(50), ch.Y(STOP) - 36, prog(lt, st, st + 0.35), () => pill(ctx, 'סטופ: מעל הפתיל', ch.X(50), ch.Y(STOP) - 36, { size: 28, color: '#d61f45' }));
      positionBox(ctx, ch, 45, 56, ENTRY, STOP, ENTRY, prog(lt, st + 0.2, st + 0.8));
    },
  },
  plan2: {
    trans: 'none',
    events: s => [{ lt: s.cue('היעד'), type: 'pop' }, { lt: s.cue('לשלוש'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chM, tg = s.cue('היעד'), rr = s.cue('לשלוש');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 30, 56], [d, 28, 60]], { p: [63000, 67300] });
      const rev = lerp(45, 58.6, prog(lt, tg + 0.4, rr));
      ch.draw(ctx, { reveal: rev });
      ch.hline(ctx, PV(13), 13, 60, { color: '#3df2a6', width: 3, dash: [10, 8] });
      ch.hline(ctx, TGT, 44, 60, { color: C.up, width: 4, progress: prog(lt, tg, tg + 0.4) });
      positionBox(ctx, ch, 45, 58, ENTRY, STOP, TGT, prog(lt, tg, tg + 0.8), { rr: true });
      popT(ctx, ch.X(47), ch.Y(TGT) + 40, prog(lt, tg, tg + 0.35), () => pill(ctx, 'יעד: הנזילות שמתחת', ch.X(47), ch.Y(TGT) + 40, { size: 28, color: '#0b8f63' }));
      if (lt > rr) { hit(ctx, ch.X(57), ch.Y(TGT), lt, rr, C.up, 220); popT(ctx, W / 2, 300, prog(lt, rr, rr + 0.35), () => pill(ctx, 'סיכון 1 · סיכוי 3', W / 2, 300, { size: 50, color: '#0b8f63', glow: 45 })); }
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('סטופים'), type: 'pop' }, { lt: s.cue('סוויפ'), type: 'pop' }, { lt: s.cue('רץ'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['נזילות', 'מעל שיאים · מתחת לשפלים', C.purple, s.cue('סטופים'), 'zz'],
        ['Sweep', 'אוסף אותם · נסגר חזרה', '#e0a100', s.cue('סוויפ'), 'warn'],
        ['ואז היעד', 'הנזילות בצד השני', '#0fa36b', s.cue('רץ'), 'check'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('התהפכה'), type: 'riser' }, { lt: s.cue('Break'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, q = s.cue('איך'), nx = s.cue('הבא'), br = s.cue('Break');
      drawBG(ctx, s.t, { glow: 1.3 });
      headlines(ctx, lt, [{ t: 'איך תדע שהמגמה', at: q, y: 470, size: 84 }, { t: 'באמת התהפכה?', at: s.cue('באמת'), y: 590, size: 100, color: C.gold, glowColor: C.gold }]);
      seriesMap(ctx, lt, 1, nx - 0.4, 900, { done: 1 });
      const pb = prog(lt, br - 0.1, br + 0.35);
      popT(ctx, W / 2, 1220, pb, () => pill(ctx, 'הבא: BREAK OF STRUCTURE', W / 2, 1220, { size: 46, color: C.purple, glow: 50 }));
      ring(ctx, W / 2, 1220, 520, prog(lt, br, br + 0.7));
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

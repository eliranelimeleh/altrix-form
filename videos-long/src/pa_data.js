// shared market data for the "Price Action made simple" series (L6-L8)
'use strict';
// master 4H/15m chart: push up (0->8), HL 13, BOS at ~17, HLs on a rising trend line (0 -> 13), confirmation hammer at 36,
// bullish FVG 37..39, top at 44, close below the line at 49, retest from below at 54, CHoCH below HL 36, sell-off
const PA_P = [[0, 60000], [8, 62000], [13, 61000], [20, 63200], [25, 61950], [32, 64400], [36, 62780], [44, 65800], [51, 63200], [54, 64100], [66, 61000]];
const PA_C = override(genCandles(PA_P, { seed: 11, noise: 0.13 }), {
  35: { o: 63100, h: 63150, l: 62900, c: 62950 }, 36: { o: 62950, h: 63050, l: 62760, c: 63020 },
  37: { o: 63020, h: 63050, l: 62980, c: 63030 }, 38: { o: 63030, h: 63700, l: 63000, c: 63650 }, 39: { o: 63650, h: 63950, l: 63350, c: 63850 },
  48: { o: 64300, h: 64350, l: 63900, c: 63950 }, 49: { o: 63950, h: 64000, l: 63450, c: 63500 },
  53: { o: 63700, h: 64000, l: 63650, c: 63950 }, 54: { o: 63950, h: 64130, l: 63850, c: 64000 }, 55: { o: 64000, h: 64050, l: 63600, c: 63650 },
});
const PA = i => PA_P.find(p => p[0] === i)[1];
const TL = i => 60000 + (61000 - 60000) / 13 * i; // trend line through the lows 0 and 13
const PA_G = [63050, 63350]; // bullish FVG 37..39
// 1m entry model: micro pullback (LH/LL), NY open at 22, CHoCH up with FVG 23..25, return to the middle at 29, run
const M1_P = [[0, 63400], [5, 63150], [8, 63300], [13, 62950], [16, 63100], [21, 62800], [26, 63300], [29, 63000], [46, 63950]];
const M1_C = override(genCandles(M1_P, { seed: 21, noise: 0.14 }), {
  22: { o: 62830, h: 62880, l: 62800, c: 62850 },
  23: { o: 62850, h: 62950, l: 62820, c: 62930 }, 24: { o: 62930, h: 63250, l: 62920, c: 63220 }, 25: { o: 63220, h: 63320, l: 63050, c: 63280 },
  26: { o: 63280, h: 63300, l: 63150, c: 63180 }, 27: { o: 63180, h: 63200, l: 63080, c: 63100 }, 28: { o: 63100, h: 63120, l: 63020, c: 63040 },
  29: { o: 63040, h: 63080, l: 62995, c: 63060 }, 30: { o: 63060, h: 63200, l: 63040, c: 63180 },
});
const M1 = i => M1_P.find(p => p[0] === i)[1];
const M1_G = [62950, 63050], M1_MID = 63000, M1_SL = 62800, M1_TP = 63700;

function flashCol(ctx, lt, t, col = '255,40,70', a = 0.25) { const f = Math.max(0, 1 - (lt - t) / 0.3); if (lt >= t && f > 0) { ctx.fillStyle = `rgba(${col},${a * f})`; ctx.fillRect(0, 0, W, H); } }
function hit(ctx, x, y, lt, t, col = C.gold, r = 220) { ring(ctx, x, y, r, prog(lt, t, t + 0.6), col); burst(ctx, x, y, prog(lt, t, t + 0.9), col, 26, Math.floor(t * 10) + 3, r * 1.1); }
function fvgZone(ctx, ch, i0, g, iEnd, p, o = {}) {
  if (p <= 0) return; const { color = C.gold, label = 'FVG', mid = false, alpha = 0.32 } = o;
  ch.zone(ctx, g[0], g[1], i0 - 0.4, iEnd, { color, alpha: alpha * clamp(p * 2), progress: p });
  if (mid) ch.hline(ctx, (g[0] + g[1]) / 2, i0, iEnd, { color, width: 3, dash: [8, 8], progress: p, glow: 10 });
  if (label) text(ctx, label, Math.min(ch.X(iEnd) - 60, ch.X(i0 + 3) + 50), ch.Y((g[0] + g[1]) / 2), { size: 26, weight: 900, color, alpha: clamp(p * 2 - 0.5), stroke: 6 });
}
// cluttered indicator overlay (EMAs + bands) on a chart, alpha controlled
function clutter(ctx, ch, n, a) {
  if (a <= 0) return;
  const cs = ch.c, e9 = emaSeries(cs, 9), e21 = emaSeries(cs, 21), e50 = emaSeries(cs, 50), bb = bollinger(cs, 20, 2);
  [[e9, '#ffeb3b'], [e21, '#ff9800'], [e50, '#2962ff']].forEach(([v, c]) => lineSeries(ctx, ch, v, n, { color: c, width: 3, glow: 6, alpha: a }));
  lineSeries(ctx, ch, bb.map(x => x.u), n, { color: '#00bcd4', width: 2, glow: 0, alpha: a * 0.8 });
  lineSeries(ctx, ch, bb.map(x => x.l), n, { color: '#00bcd4', width: 2, glow: 0, alpha: a * 0.8 });
}

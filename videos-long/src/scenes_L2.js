// L2 — Break of Structure: the second of the 5 confluences
'use strict';
// ---------- data ----------
// uptrend in stairs, BOS down at 40 (close below HL 30), LH at 46, new downtrend
const UP = [[0, 60000], [6, 62200], [10, 61200], [16, 63400], [20, 62300], [26, 64600], [30, 63500], [36, 65200], [42, 63000], [46, 64200], [58, 61000]];
const UPC = override(genCandles(UP, { seed: 31, noise: 0.16 }), {
  39: { o: 64300, h: 64380, l: 63850, c: 63950 },
  40: { o: 63950, h: 64000, l: 63180, c: 63250 },
});
const chU = new Chart(UPC);
const PU = i => UP.find(p => p[0] === i)[1];
const HL_KEY = PU(30), LH_KEY = PU(46);
const U_LBL = [[6, 'HH'], [10, 'HL'], [16, 'HH'], [20, 'HL'], [26, 'HH'], [30, 'HL'], [36, 'HH']];
// downtrend for the mirror case: BOS up at 30 (close above LH 19)
const DN = [[0, 66000], [5, 63800], [9, 65000], [15, 62600], [19, 63900], [25, 61400], [32, 64700], [36, 63500], [50, 67000]];
const DNC = override(genCandles(DN, { seed: 12, noise: 0.16 }), { 30: { o: 63500, h: 64250, l: 63400, c: 64150 } });
const chD = new Chart(DNC);
const PD = i => DN.find(p => p[0] === i)[1];
// wick vs body: same approach to the HL at 63500, A = wick only, B = body close
const WA = [[0, 61500], [8, 64600], [13, 63500], [20, 65000], [25, 63900], [34, 66200]];
const WB = [[0, 61500], [8, 64600], [13, 63500], [20, 65000], [25, 63900], [34, 61600]];
const WKA = override(genCandles(WA, { seed: 5, noise: 0.14 }), { 26: { o: 63950, h: 64000, l: 63250, c: 63800 }, 27: { o: 63800, h: 64250, l: 63750, c: 64200 } });
const WKB = override(genCandles(WB, { seed: 5, noise: 0.14 }), { 26: { o: 63950, h: 64000, l: 63150, c: 63250 }, 27: { o: 63250, h: 63400, l: 62900, c: 63000 } });
const chWA = new Chart(WKA), chWB = new Chart(WKB);
const WLV = 63500;
// sweep + BOS combo: equal highs swept at 34, BOS at 37 below HL 25
const SP = [[0, 60000], [8, 62500], [13, 61500], [20, 63000], [25, 62200], [31, 63020], [33, 62700], [39, 61600], [42, 62650], [54, 60500]];
const SPC = override(genCandles(SP, { seed: 44, noise: 0.15 }), {
  34: { o: 62700, h: 63420, l: 62650, c: 62820 },
  35: { o: 62820, h: 62880, l: 62450, c: 62500 },
  36: { o: 62500, h: 62560, l: 62250, c: 62300 },
  37: { o: 62300, h: 62340, l: 61900, c: 61950 },
});
const chS = new Chart(SPC);
const PS = i => SP.find(p => p[0] === i)[1];
// daily example: downtrend, BOS up at 30, HL at 34, rally
const E1 = [[0, 58000], [5, 55500], [9, 56800], [15, 53800], [19, 55200], [25, 52500], [31, 55900], [35, 54100], [50, 59500]];
const E1C = override(genCandles(E1, { seed: 77, noise: 0.15 }), { 29: { o: 54500, h: 55600, l: 54400, c: 55500 } });
const chE1 = new Chart(E1C, { tf: '1D' });
const PE1 = i => E1.find(p => p[0] === i)[1];
// 1H example: uptrend, BOS down at 32, LH at 37, sell-off
const E2 = [[0, 61000], [5, 62000], [8, 61500], [13, 62800], [16, 62200], [21, 63500], [24, 62900], [29, 64000], [34, 62500], [37, 63250], [50, 60900]];
const E2C = override(genCandles(E2, { seed: 15, noise: 0.15 }), { 32: { o: 63300, h: 63350, l: 62750, c: 62800 } });
const chE2 = new Chart(E2C, { tf: '1H' });
const PE2 = i => E2.find(p => p[0] === i)[1];

// ---------- local helpers ----------
function flashCol(ctx, lt, t, col = '255,40,70', a = 0.25) { const f = Math.max(0, 1 - (lt - t) / 0.3); if (lt >= t && f > 0) { ctx.fillStyle = `rgba(${col},${a * f})`; ctx.fillRect(0, 0, W, H); } }
function hit(ctx, x, y, lt, t, col = C.gold, r = 220) { ring(ctx, x, y, r, prog(lt, t, t + 0.6), col); burst(ctx, x, y, prog(lt, t, t + 0.9), col, 26, Math.floor(t * 10) + 3, r * 1.1); }
// structure labels HH/HL/LH/LL over pivots, popping in sequence from t0 with gap dt
function labels(ctx, ch, list, P, lt, t0, dt = 0.3, o = {}) {
  list.forEach(([i, l], k) => {
    const above = l.endsWith('H'), col = l.startsWith('H') ? (above ? '#0b8f63' : '#0fa36b') : (above ? '#d61f45' : '#c2183a');
    ch.tag(ctx, i, P(i), l, prog(lt, t0 + k * dt, t0 + k * dt + 0.3), { color: o.color || col, above, size: o.size || 26, off: 40 });
  });
}
function zz(list, P) { return list.map(([i]) => [i, P(i)]); }

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('ברעש'), type: 'pop' }, { lt: s.cue('אחד'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, nz = s.cue('ברעש'), one = s.cue('אחד');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 40], [d, 20, 44]], { p: [61800, 65800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 36], [one - 0.3, 39.9], [one, 40.95], [d, 41]], E.lin)[0], highlight: i => i === 40 && lt > one });
      ch.hline(ctx, HL_KEY, 30, 46, { color: lt > one ? C.down : C.gold, width: 4, dash: lt > one ? null : [12, 10] });
      if (lt > one) { hit(ctx, ch.X(40), ch.Y(HL_KEY), lt, one, C.down, 260); flashCol(ctx, lt, one); }
      wipeText(ctx, 'מגמה לא נגמרת ברעש', W / 2, 300, prog(lt, 0, 0.35) * (1 - prog(lt, one - 0.2, one)), { size: 66, weight: 900 });
      wipeText(ctx, 'היא נגמרת בנר אחד', W / 2, 300, prog(lt, one - 0.05, one + 0.3), { size: 72, weight: 900, color: '#ff5a72' });
    },
  },
  hook2: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('מתה'), type: 'impact', k: 1.4 }, { lt: s.cue('לפני'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, dead = s.cue('מתה'), bf = s.cue('לפני');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 20, 44], [dead, 22, 48], [d, 8, 58]], { p: [60300, 65800] });
      ch.draw(ctx, { reveal: lerp(41, 58, prog(lt, dead, d - 0.3)), highlight: i => i === 40 });
      ch.hline(ctx, HL_KEY, 30, 58, { color: C.down, width: 4 });
      ch.tag(ctx, 40, PU(42), 'BOS', prog(lt, 0.2, 0.5), { color: '#d61f45', above: false, size: 34, off: 46 });
      wipeText(ctx, 'נר אחד במקום הלא נכון', W / 2, 300, prog(lt, 0.05, 0.4) * (1 - prog(lt, dead - 0.2, dead)), { size: 62, weight: 900 });
      const pd = prog(lt, dead - 0.1, dead + 0.25);
      if (pd > 0 && lt < bf) { scrim(ctx, 0.55 * pd); popT(ctx, W / 2, 860, pd, () => text(ctx, 'המגמה מתה', W / 2, 860, { size: 170, weight: 900, color: '#ff5a72', glow: 60, glowColor: C.down })); ring(ctx, W / 2, 860, 640, prog(lt, dead, dead + 0.7), C.down); }
      if (lt > bf) wipeText(ctx, 'לפני שכולם רואים', W / 2, 300, prog(lt, bf, bf + 0.3), { size: 70, weight: 900, color: C.gold });
    },
  },
  hook3: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('איזה'), type: 'pop' }, { lt: s.cue('לחפש'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, which = s.cue('איזה'), where = s.cue('לחפש');
      drawBG(ctx, s.t, { hue: 20 });
      stdChart(ch, lt, [[0, 4, 44], [d, 8, 44]], { p: [59800, 65800] });
      ch.draw(ctx, { reveal: 41, dim: 0.5, highlight: i => i === 40 && lt > which });
      ch.zigzag(ctx, zz(U_LBL, PU), prog(lt, 0, which), { color: C.purple2, width: 5 });
      if (lt > which) { const x = ch.X(40), y = ch.Y(63600); ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.shadowColor = C.gold; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(x, y, 60 + 6 * Math.sin(lt * 8), 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      ch.hline(ctx, HL_KEY, 30, 44, { color: C.gold, width: 5, progress: prog(lt, where, where + 0.4) });
      if (lt > where) hit(ctx, ch.X(30), ch.Y(HL_KEY), lt, where, C.gold, 200);
      wipeText(ctx, 'איזה נר · ואיפה לחפש', W / 2, 300, prog(lt, which - 0.1, which + 0.3), { size: 66, weight: 900, color: C.purple2 });
    },
  },
  intro: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('השני'), type: 'pop' }, { lt: s.cue('Break'), type: 'impact', k: 1.1 }, { lt: s.cue('התהפכה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, two = s.cue('השני'), br = s.cue('Break'), heb = s.cue('שבירת'), q = s.cue('האם');
      drawBG(ctx, s.t, { glow: 1.25 });
      wipeText(ctx, 'קונפלואנס 2 מתוך 5', W / 2, 300, prog(lt, two - 0.05, two + 0.35), { size: 62, weight: 900, color: C.neon });
      seriesMap(ctx, lt, 1, two, 1120, { done: 1 });
      confluenceCard(ctx, lt, br, { he: 'שבירת מבנה', en: 'BREAK OF STRUCTURE', type: 'reversal', uses: ['אישור כיוון', 'כניסה'], y: 430, tType: heb + 0.3, tUses: [q, q + 0.4] });
    },
  },

  // ================= CH1: structure =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 6, 'מה זה בכלל מבנה?', 'MARKET STRUCTURE', { cueWord: 'מה' }); } },
  st1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('ישר'), type: 'pop' }, { lt: s.cue('במדרגות'), type: 'pop' }, { lt: s.cue('גבוה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, str = s.cue('ישר'), stp = s.cue('במדרגות'), hh = s.cue('גבוה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 37], [d, 0, 38]], { p: [59500, 65800] });
      ch.draw(ctx, { reveal: lerp(8, 37, prog(lt, 0, hh + 0.5)), dim: 0.3 });
      // the naive straight line, crossed out
      if (lt > str && lt < stp + 0.5) { ctx.save(); ctx.globalAlpha = 1 - prog(lt, stp, stp + 0.5); ctx.setLineDash([12, 10]); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ch.X(0), ch.Y(60000)); ctx.lineTo(ch.X(0) + (ch.X(36) - ch.X(0)) * prog(lt, str, str + 0.4), lerp(ch.Y(60000), ch.Y(65200), prog(lt, str, str + 0.4))); ctx.stroke(); ctx.restore(); cross(ctx, W / 2, 700, 40, prog(lt, str + 0.3, str + 0.6)); }
      const pts = [[0, 60000], ...U_LBL.map(([i]) => [i, PU(i)])];
      ch.zigzag(ctx, pts, prog(lt, stp, hh + 0.6), { color: C.purple2, width: 6 });
      badge(ctx, 'מדרגות, לא קו ישר', prog(lt, stp, stp + 0.35), C.purple, 300, W / 2, 44);
    },
  },
  st2: {
    trans: 'none',
    events: s => [{ lt: s.cue('Higher'), type: 'pop' }, { lt: s.cue('Higher', 1), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, hh = s.cue('Higher'), hl = s.cue('Higher', 1);
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 38], [d, 2, 38]], { p: [59500, 65800] });
      ch.draw(ctx, { reveal: 37, dim: 0.45 });
      ch.zigzag(ctx, [[0, 60000], ...zz(U_LBL, PU)], 1, { color: C.purple2, width: 5 });
      labels(ctx, ch, U_LBL.filter(([, l]) => l === 'HH'), PU, lt, hh - 0.1, 0.18);
      labels(ctx, ch, U_LBL.filter(([, l]) => l === 'HL'), PU, lt, hl - 0.1, 0.18);
      badge(ctx, 'HH + HL = מגמת עלייה', prog(lt, hl + 0.5, hl + 0.9), '#0b8f63', 300, W / 2, 44);
    },
  },
  st3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('Lower'), type: 'pop' }, { lt: s.cue('Lower', 1), type: 'pop' }, { lt: s.cue('במדרגות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, lh = s.cue('Lower'), ll = s.cue('Lower', 1), stp = s.cue('במדרגות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 27], [d, 0, 28]], { p: [60800, 66600] });
      ch.draw(ctx, { reveal: lerp(5, 26, prog(lt, 0, ll + 0.6)), dim: 0.35 });
      const L = [[5, 'LL'], [9, 'LH'], [15, 'LL'], [19, 'LH'], [25, 'LL']];
      ch.zigzag(ctx, [[0, 66000], ...zz(L, PD)], prog(lt, 0.2, ll + 0.6), { color: '#ff7b8f', width: 5 });
      labels(ctx, ch, L.filter(([, l]) => l === 'LH'), PD, lt, lh - 0.1, 0.2);
      labels(ctx, ch, L.filter(([, l]) => l === 'LL'), PD, lt, ll - 0.1, 0.2);
      badge(ctx, 'LH + LL = מגמת ירידה', prog(lt, stp, stp + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },
  st4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('המבנה'), type: 'impact', k: 1 }, { lt: s.cue('בחיים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, str = s.cue('המבנה'), alive = s.cue('בחיים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 38], [d, 1, 38]], { p: [59500, 65800] });
      ch.draw(ctx, { reveal: 37, dim: 0.6 });
      ch.zigzag(ctx, [[0, 60000], ...zz(U_LBL, PU)], 1, { color: C.purple2, width: 6 });
      scrim(ctx, 0.35 * prog(lt, str, str + 0.3));
      headlines(ctx, lt, [{ t: 'זה המבנה', at: str, y: 760, size: 150, kind: 'pop' }, { t: 'כל עוד הוא נשמר · המגמה בחיים', at: alive - 0.4, y: 930, size: 60, color: '#3df2a6', glowColor: C.up }]);
      ring(ctx, W / 2, 760, 560, prog(lt, str, str + 0.7));
    },
  },

  // ================= CH2: where it breaks =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 6, 'איפה המבנה נשבר?', 'WHERE IT BREAKS', { cueWord: 'איפה' }); } },
  br1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('זהב'), type: 'impact', k: 1 }, { lt: s.cue('Higher'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, gold = s.cue('זהב'), last = s.cue('האחרון'), hl = s.cue('Higher');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 38], [gold, 14, 42], [d, 16, 42]], { p: [61400, 65800] });
      ch.draw(ctx, { reveal: 37, dim: 0.35 });
      ch.zigzag(ctx, [[0, 60000], ...zz(U_LBL, PU)], 1, { color: 'rgba(192,132,252,0.6)', width: 4 });
      ch.dot(ctx, 30, HL_KEY, prog(lt, last, last + 0.3), C.gold, 16);
      if (lt > last) ring(ctx, ch.X(30), ch.Y(HL_KEY), 120, (lt - last) % 1.2 / 1.2, C.gold);
      ch.hline(ctx, HL_KEY, 30, 44, { color: C.gold, width: 6, progress: prog(lt, gold, gold + 0.5) });
      ch.tag(ctx, 30, HL_KEY, 'HL אחרון', prog(lt, hl, hl + 0.35), { color: '#b8860b', above: false, size: 32, off: 48 });
      badge(ctx, 'הרמה ששווה זהב', prog(lt, gold, gold + 0.35), '#b8860b', 300, W / 2, 46);
    },
  },
  br2: {
    trans: 'none',
    events: s => [{ lt: s.cue('שולטים'), type: 'pop' }, { lt: s.cue('מתחתיו'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, ctrl = s.cue('שולטים'), below = s.cue('מתחתיו');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 16, 42], [d, 18, 42]], { p: [61400, 65800] });
      ch.draw(ctx, { reveal: 38.5 });
      ch.hline(ctx, HL_KEY, 30, 44, { color: C.gold, width: 6 });
      // buyers defending: green shield band above the level
      const pb = prog(lt, ctrl - 0.2, ctrl + 0.3);
      if (pb > 0) { ch.zone(ctx, HL_KEY, HL_KEY + 350, 30, 44, { color: C.up, alpha: 0.16 * pb + 0.04 * Math.sin(lt * 5) * pb, progress: pb });
        popT(ctx, ch.X(34), ch.Y(HL_KEY + 175), pb, () => pill(ctx, 'הקונים מגינים', ch.X(34), ch.Y(HL_KEY + 175), { size: 30, color: '#0b8f63' })); }
      const pn = prog(lt, below - 0.1, below + 0.3);
      if (pn > 0) { arrow(ctx, ch.X(40), ch.Y(HL_KEY + 500), ch.X(40), ch.Y(HL_KEY - 250), pn, { color: 'rgba(255,90,114,0.8)', width: 8, head: 30 }); cross(ctx, ch.X(40) + 70, ch.Y(HL_KEY), 30, pn); }
      badge(ctx, 'לא אמור לרדת מתחתיו', prog(lt, below, below + 0.35), C.purple, 300, W / 2, 42);
    },
  },
  br3: {
    trans: 'none',
    events: s => [{ lt: s.cue('נסגר'), type: 'impact', k: 1.4 }, { lt: s.cue('Lower'), type: 'pop' }, { lt: s.cue('Break'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, cl = s.cue('נסגר'), ll = s.cue('Lower'), br = s.cue('Break');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 18, 42], [cl, 24, 44], [d, 22, 46]], { p: [62300, 65800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 38.5], [cl - 0.4, 39.9], [cl, 40.98], [d, 42.5]], E.lin)[0], highlight: i => i === 40 && lt > cl });
      const broke = lt > cl;
      ch.hline(ctx, HL_KEY, 30, 46, { color: broke ? C.down : C.gold, width: broke ? 7 : 5, glow: broke ? 30 : 16 });
      if (broke) { hit(ctx, ch.X(40), ch.Y(HL_KEY), lt, cl, C.down, 260); flashCol(ctx, lt, cl);
        const x = ch.X(40), y0 = ch.Y(63950), y1 = ch.Y(63250); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x - 26, y0 - 6, 52, y1 - y0 + 12); ctx.restore();
        popT(ctx, x + 150, y1 + 10, prog(lt, cl, cl + 0.3), () => pill(ctx, 'סגירה מתחת', x + 150, y1 + 10, { size: 28, color: '#d61f45' })); }
      ch.tag(ctx, 42, PU(42), 'LL', prog(lt, ll, ll + 0.3), { color: '#d61f45', above: false, size: 30, off: 44 });
      popT(ctx, W / 2, 300, prog(lt, br, br + 0.35), () => pill(ctx, 'BREAK OF STRUCTURE', W / 2, 300, { size: 52, color: '#d61f45', glow: 50 }));
      if (lt > br) ring(ctx, W / 2, 300, 500, prog(lt, br, br + 0.7), C.down);
    },
  },
  br4: {
    trans: 'none',
    events: s => [{ lt: s.cue('מתקן'), type: 'whoosh' }, { lt: s.cue('Lower'), type: 'pop' }, { lt: s.cue('נולדה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, fix = s.cue('מתקן'), lh = s.cue('Lower'), cont = s.cue('וממשיך'), born = s.cue('נולדה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 22, 46], [cont, 24, 56], [d, 22, 59]], { p: [60300, 65800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 42.5], [lh, 46.5], [born, 58]], E.lin)[0] });
      ch.hline(ctx, HL_KEY, 30, 59, { color: C.down, width: 3, alpha: 0.5 });
      ch.tag(ctx, 40, PU(42), 'BOS', 1, { color: '#d61f45', above: false, size: 28, off: 44 });
      ch.zigzag(ctx, [[36, PU(36)], [42, PU(42)], [46, LH_KEY], [58, PU(58)]], prog(lt, fix, born + 0.3), { color: '#ff7b8f', width: 5 });
      ch.tag(ctx, 46, LH_KEY, 'LH', prog(lt, lh, lh + 0.3), { color: '#d61f45', size: 30, off: 44 });
      popT(ctx, W / 2, 300, prog(lt, born - 0.1, born + 0.3), () => pill(ctx, 'מגמה חדשה נולדה ↓', W / 2, 300, { size: 50, color: '#d61f45', glow: 45 }));
    },
  },
  br5: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מעל'), type: 'impact', k: 1.2 }, { lt: s.cue('Lower'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chD, above = s.cue('מעל'), lh = s.cue('Lower');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 32], [d, 10, 36]], { p: [60800, 66400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 27], [above - 0.4, 29.5], [above, 30.98], [d, 34]], E.lin)[0], highlight: i => i === 30 && lt > above });
      ch.zigzag(ctx, [[0, 66000], [5, PD(5)], [9, PD(9)], [15, PD(15)], [19, PD(19)], [25, PD(25)]], 1, { color: 'rgba(255,123,143,0.7)', width: 4 });
      ch.hline(ctx, PD(19), 19, 36, { color: lt > above ? C.up : C.gold, width: 6, progress: prog(lt, 0.2, 0.7) });
      ch.tag(ctx, 19, PD(19), 'LH אחרון', prog(lt, lh, lh + 0.35), { color: '#b8860b', size: 30, off: 46 });
      if (lt > above) { hit(ctx, ch.X(30), ch.Y(PD(19)), lt, above, C.up, 240); flashCol(ctx, lt, above, '22,199,132', 0.2); }
      popT(ctx, W / 2, 300, prog(lt, above, above + 0.35), () => pill(ctx, 'BOS ↑ סגירה מעל', W / 2, 300, { size: 50, color: '#0b8f63', glow: 45 }));
    },
  },
  br6: {
    trans: 'zoom',
    events: s => [{ lt: s.cue("צ'וק"), type: 'pop' }, { lt: s.cue('זהה'), type: 'pop' }, { lt: s.cue('משתנה'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt } = s, ch5 = s.cue("צ'וק"), same = s.cue('זהה'), chg = s.cue('משתנה');
      drawBG(ctx, s.t, { glow: 1.2 });
      const card = (x, title, sub, col, p) => popT(ctx, x, 720, p, () => { glass(ctx, x - 200, 560, 400, 320, 30, { border: col, glowColor: col }); text(ctx, title, x, 680, { size: 72, weight: 900, color: '#fff' }); text(ctx, sub, x, 780, { size: 34, weight: 700, color: col }); });
      card(790, 'BOS', 'Break of Structure', C.purple2, prog(lt, 0, 0.35));
      card(290, 'CHoCH', 'Change of Character', C.gold, prog(lt, ch5 - 0.1, ch5 + 0.3));
      text(ctx, '=', W / 2, 720, { size: 110, weight: 900, color: '#fff', alpha: prog(lt, same - 0.1, same + 0.2), glow: 30, glowColor: C.purple });
      const pc = prog(lt, same, same + 0.4);
      if (pc > 0) { glass(ctx, 140, 1000, 800, 220, 30); text(ctx, 'המבנה נשבר', W / 2, 1065, { size: 58, weight: 900, alpha: pc }); text(ctx, 'הכיוון משתנה ⇄', W / 2, 1150, { size: 50, weight: 900, color: '#ff8a3d', alpha: prog(lt, chg - 0.1, chg + 0.3) }); }
      wipeText(ctx, 'שני שמות · רעיון אחד', W / 2, 300, prog(lt, 0.05, 0.4), { size: 62, weight: 900, color: C.neon });
    },
  },

  // ================= CH3: body, not wick =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 6, 'גוף, לא פתיל', 'BODY CLOSE ONLY', { cueWord: 'גוף' }); } },
  wk1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('גוף'), type: 'pop' }, { lt: s.cue('בפתיל'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, body = s.cue('גוף'), wick = s.cue('בפתיל'), imp = s.cue('חשוב');
      drawBG(ctx, s.t);
      [[chWA, PANEL_TOP, wick], [chWB, PANEL_BOT, body]].forEach(([ch, pn, t]) => {
        ch.layout(...pn, { head: 80, foot: 40 }).view(...kf(lt, [[0, 6, 32], [d, 10, 32]]), 62600, 65400);
        ch.draw(ctx, { reveal: kf(lt, [[0, 25], [t, 26.98], [d, 28]], E.lin)[0], highlight: i => i === 26 && lt > t });
        ch.hline(ctx, WLV, 13, 34, { color: C.gold, width: 4 });
      });
      text(ctx, 'פתיל', chWA.r.x + 70, chWA.r.y + 140, { size: 40, weight: 900, color: '#ff5a72', align: 'left', alpha: prog(lt, wick, wick + 0.3) });
      cross(ctx, chWA.r.x + 220, chWA.r.y + 140, 30, prog(lt, wick, wick + 0.3));
      text(ctx, 'גוף', chWB.r.x + 70, chWB.r.y + 140, { size: 40, weight: 900, color: '#3df2a6', align: 'left', alpha: prog(lt, body, body + 0.3) });
      check(ctx, chWB.r.x + 200, chWB.r.y + 140, 30, prog(lt, body, body + 0.3));
      badge(ctx, 'הכלל הכי חשוב', prog(lt, imp, imp + 0.35), C.purple, 268, W / 2, 42);
    },
  },
  wk2: {
    trans: 'none',
    events: s => [{ lt: s.cue('וחוזר'), type: 'pop' }, { lt: s.cue('סוויפ'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chWA, back = s.cue('וחוזר'), not = s.cue('לא'), sw = s.cue('סוויפ'), prev = s.cue('הקודם');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 32], [d, 14, 34]], { p: [62700, 66600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 26], [back, 27], [d, 33]], E.lin)[0], highlight: i => i === 26 });
      ch.hline(ctx, WLV, 13, 34, { color: C.gold, width: 5 });
      const x = ch.X(26);
      if (lt > back) popT(ctx, x - 150, ch.Y(63250) + 40, prog(lt, back, back + 0.3), () => pill(ctx, 'פתיל וחזרה', x - 150, ch.Y(63250) + 40, { size: 30, color: C.purple }));
      if (lt > not) { popT(ctx, x + 160, ch.Y(63250) + 40, prog(lt, not, not + 0.3), () => pill(ctx, 'BOS', x + 160, ch.Y(63250) + 40, { size: 30, color: '#555' })); cross(ctx, x + 240, ch.Y(63250) + 40, 26, prog(lt, not, not + 0.3)); }
      popT(ctx, W / 2, 300, prog(lt, sw, sw + 0.35), () => pill(ctx, 'זה SWEEP', W / 2, 300, { size: 54, color: C.purple, glow: 50 }));
      if (lt > sw) hit(ctx, x, ch.Y(63250), lt, sw, C.purple2, 200);
      popT(ctx, W / 2, 1270, prog(lt, prev, prev + 0.35), () => pill(ctx, '← מהסרטון הקודם: נזילות', W / 2, 1270, { size: 34, color: '#3b1a78', fill: false }));
    },
  },
  wk3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('סוויפ'), type: 'impact', k: 1.1 }, { lt: s.cue('BOS'), type: 'impact', k: 1.3 }, { lt: s.cue('החזקים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chS, sw = s.cue('סוויפ'), bos = s.cue('BOS'), strong = s.cue('החזקים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 40], [d, 14, 42]], { p: [60800, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 33], [sw, 34.98], [bos - 0.3, 36], [bos, 37.98], [d, 39]], E.lin)[0], highlight: i => (i === 34 && lt > sw) || (i === 37 && lt > bos) });
      ch.hline(ctx, 63010, 20, 42, { color: C.gold, width: 4 });
      ch.tag(ctx, 26, 63010, 'EQH', 1, { color: '#b8860b', size: 26, off: 40 });
      ch.hline(ctx, PS(25), 25, 42, { color: lt > bos ? C.down : 'rgba(255,255,255,0.7)', width: 4, dash: lt > bos ? null : [10, 8] });
      ch.tag(ctx, 25, PS(25), 'HL', 1, { color: '#0b8f63', above: false, size: 26, off: 40 });
      if (lt > sw) { hit(ctx, ch.X(34), ch.Y(63400), lt, sw, C.gold, 200); ch.tag(ctx, 34, 63420, '1 · SWEEP', prog(lt, sw, sw + 0.3), { color: C.purple, size: 28, off: 44 }); }
      if (lt > bos) { hit(ctx, ch.X(37), ch.Y(PS(25)), lt, bos, C.down, 220); ch.tag(ctx, 37, 61900, '2 · BOS', prog(lt, bos, bos + 0.3), { color: '#d61f45', above: false, size: 28, off: 48 }); }
      badge(ctx, 'אחד הסטאפים החזקים שיש', prog(lt, strong, strong + 0.35), '#b8860b', 300, W / 2, 42);
    },
  },
  wk4: {
    trans: 'none',
    events: s => [{ lt: s.cue('הדלק'), type: 'pop' }, { lt: s.cue('מאשר'), type: 'pop' }, { lt: s.cue('התהפך'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chS, fuel = s.cue('הדלק'), conf = s.cue('מאשר'), flip = s.cue('התהפך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 42], [d, 10, 55]], { p: [58300, 63800] });
      ch.draw(ctx, { reveal: lerp(39, 54, prog(lt, conf, d - 0.2)) });
      ch.hline(ctx, 63010, 20, 55, { color: C.gold, width: 3, alpha: 0.5 }); ch.hline(ctx, PS(25), 25, 55, { color: C.down, width: 3, alpha: 0.5 });
      ch.tag(ctx, 34, 63420, 'SWEEP', 1, { color: C.purple, size: 26, off: 44 }); ch.tag(ctx, 37, 61900, 'BOS', 1, { color: '#d61f45', above: false, size: 26, off: 48 });
      const card = (y, n, t1, t2, col, p) => popT(ctx, W / 2, y, p, () => { glass(ctx, 120, y - 70, 840, 140, 26, { border: col, glowColor: col }); text(ctx, n, 890, y, { size: 56, weight: 900, fam: MONO, color: col }); text(ctx, t1, 830, y - 18, { size: 40, weight: 900, align: 'right' }); text(ctx, t2, 830, y + 32, { size: 30, weight: 700, color: col, align: 'right' }); });
      card(1160, '1', 'סוויפ', 'הדלק נאסף', C.purple2, prog(lt, fuel - 0.1, fuel + 0.3));
      card(1310, '2', 'BOS', 'הכיוון התהפך ✓', '#ff5a72', prog(lt, conf - 0.1, conf + 0.3));
      if (lt > flip) hit(ctx, W / 2, 1310, lt, flip, '#ff5a72', 300);
    },
  },

  // ================= CH4: examples =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 6, 'שתי דוגמאות אמיתיות', 'REAL EXAMPLES', { cueWord: 'שתי' }); } },
  e1a: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('יומי'), type: 'click' }, { lt: s.cue('נקייה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE1, day = s.cue('יומי'), seq = s.cue('שיא');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 32], [d, 0, 33]], { p: [51800, 58600] });
      ch.draw(ctx, { reveal: lerp(10, 28.9, prog(lt, 0, d - 0.4)), tfFlash: lt > day ? Math.exp(-(lt - day) * 5) : 0 });
      const L = [[5, 'LL'], [9, 'LH'], [15, 'LL'], [19, 'LH'], [25, 'LL']];
      ch.zigzag(ctx, [[0, 58000], ...zz(L, PE1)], prog(lt, seq - 0.3, d - 0.3), { color: '#ff7b8f', width: 5 });
      labels(ctx, ch, L, PE1, lt, seq, 0.45);
      badge(ctx, 'דוגמה 1 · גרף יומי', prog(lt, 0, 0.35), C.purple, 300, W / 2, 42);
    },
  },
  e1b: {
    trans: 'none',
    events: s => [{ lt: s.cue('נסגר'), type: 'impact', k: 1.3 }, { lt: s.cue('Break'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE1, cl = s.cue('נסגר'), br = s.cue('Break');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 33], [cl, 10, 34], [d, 12, 35]], { p: [51800, 58600] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 28.9], [cl - 0.5, 29.3], [cl, 29.98], [d, 30.5]], E.lin)[0], highlight: i => i === 29 && lt > cl });
      ch.zigzag(ctx, [[0, 58000], [5, PE1(5)], [9, PE1(9)], [15, PE1(15)], [19, PE1(19)], [25, PE1(25)]], 1, { color: 'rgba(255,123,143,0.6)', width: 4 });
      ch.hline(ctx, PE1(19), 19, 35, { color: lt > cl ? C.up : C.gold, width: 6 });
      ch.tag(ctx, 19, PE1(19), 'LH אחרון', 1, { color: '#b8860b', size: 28, off: 44 });
      if (lt > cl) { hit(ctx, ch.X(29), ch.Y(PE1(19)), lt, cl, C.up, 240); flashCol(ctx, lt, cl, '22,199,132', 0.2); }
      popT(ctx, W / 2, 300, prog(lt, br, br + 0.35), () => pill(ctx, 'BREAK OF STRUCTURE ↑', W / 2, 300, { size: 48, color: '#0b8f63', glow: 45 }));
    },
  },
  e1c: {
    trans: 'none',
    events: s => [{ lt: s.cue('קונים'), type: 'pop' }, { lt: s.cue('Higher'), type: 'pop' }, { lt: s.cue('לעלות'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE1, buy = s.cue('קונים'), hl = s.cue('Higher'), up = s.cue('ומשם');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 35], [up, 14, 42], [d, 10, 51]], { p: [51800, 60200] });
      const rev = kf(lt, [[0, 30.5], [buy, 31.9], [hl, 35.5], [up, 36], [d - 0.2, 50]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      ch.hline(ctx, PE1(19), 19, 51, { color: C.up, width: 3, alpha: 0.6 });
      if (lt > buy && lt < hl + 0.5) { popT(ctx, ch.X(31), ch.Y(PE1(31)) - 60, prog(lt, buy, buy + 0.3), () => pill(ctx, 'BUY בשיא', ch.X(31), ch.Y(PE1(31)) - 60, { size: 28, color: '#555' })); cross(ctx, ch.X(31) + 110, ch.Y(PE1(31)) - 60, 24, prog(lt, buy + 0.2, buy + 0.5)); }
      ch.tag(ctx, 35, PE1(35), 'HL', prog(lt, hl, hl + 0.3), { color: '#0b8f63', above: false, size: 30, off: 44 });
      if (lt > hl) { popT(ctx, ch.X(35) - 130, ch.Y(PE1(35)) + 50, prog(lt, hl, hl + 0.3), () => pill(ctx, 'כניסה ✓', ch.X(35) - 130, ch.Y(PE1(35)) + 50, { size: 28, color: '#0b8f63' })); }
      badge(ctx, 'לא רודפים · מחכים לתיקון', prog(lt, buy, buy + 0.35), C.purple, 300, W / 2, 42);
    },
  },
  e2a: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שעה'), type: 'click' }, { lt: s.cue('Higher'), type: 'pop' }, { lt: s.cue('ושוב'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE2, hr = s.cue('שעה'), hh = s.cue('Higher');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 32], [d, 0, 33]], { p: [60500, 64400] });
      ch.draw(ctx, { reveal: lerp(8, 30, prog(lt, 0, d - 0.3)), tfFlash: lt > hr ? Math.exp(-(lt - hr) * 5) : 0 });
      const L = [[5, 'HH'], [8, 'HL'], [13, 'HH'], [16, 'HL'], [21, 'HH'], [24, 'HL'], [29, 'HH']];
      ch.zigzag(ctx, [[0, 61000], ...zz(L, PE2)], prog(lt, hh - 0.3, d - 0.3), { color: '#3df2a6', width: 5 });
      labels(ctx, ch, L, PE2, lt, hh, 0.32, { size: 24 });
      badge(ctx, 'דוגמה 2 · גרף שעה', prog(lt, 0, 0.35), C.purple, 300, W / 2, 42);
    },
  },
  e2b: {
    trans: 'none',
    events: s => [{ lt: s.cue('אחרון'), type: 'pop' }, { lt: s.cue('נסגר'), type: 'impact', k: 1.3 }, { lt: s.cue('נשבר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE2, last = s.cue('אחרון'), cl = s.cue('נסגר'), brk = s.cue('נשבר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 33], [cl, 12, 37], [d, 12, 38]], { p: [61800, 64400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 30], [cl - 0.5, 31.5], [cl, 32.98], [d, 33.5]], E.lin)[0], highlight: i => i === 32 && lt > cl });
      ch.dot(ctx, 29, PE2(29), prog(lt, last, last + 0.3), '#3df2a6', 13);
      ch.hline(ctx, PE2(24), 24, 38, { color: lt > cl ? C.down : C.gold, width: 6 });
      ch.tag(ctx, 24, PE2(24), 'HL', 1, { color: '#0b8f63', above: false, size: 28, off: 44 });
      if (lt > cl) { hit(ctx, ch.X(32), ch.Y(PE2(24)), lt, cl, C.down, 240); flashCol(ctx, lt, cl); }
      popT(ctx, W / 2, 300, prog(lt, brk, brk + 0.35), () => pill(ctx, 'BOS ↓ המבנה נשבר', W / 2, 300, { size: 50, color: '#d61f45', glow: 45 }));
    },
  },
  e2c: {
    trans: 'none',
    events: s => [{ lt: s.cue('Lower'), type: 'pop' }, { lt: s.cue('נופל'), type: 'whoosh' }, { lt: s.cue('נמוכים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chE2, lh = s.cue('Lower'), fall = s.cue('נופל'), low = s.cue('נמוכים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 12, 38], [fall, 16, 46], [d, 14, 51]], { p: [60300, 64400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 33.5], [lh, 37.5], [fall, 38], [d - 0.2, 50]], E.lin)[0] });
      ch.hline(ctx, PE2(24), 24, 51, { color: C.down, width: 3, alpha: 0.5 });
      ch.tag(ctx, 37, PE2(37), 'LH', prog(lt, lh, lh + 0.3), { color: '#d61f45', size: 30, off: 44 });
      ch.zigzag(ctx, [[29, PE2(29)], [34, PE2(34)], [37, PE2(37)], [50, PE2(50)]], prog(lt, lh - 0.4, d - 0.2), { color: '#ff7b8f', width: 5 });
      badge(ctx, 'שפלים נמוכים יותר ↓', prog(lt, low, low + 0.35), '#d61f45', 300, W / 2, 42);
    },
  },

  // ================= CH5: mistakes =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 6, 'שלוש טעויות', '3 COSTLY MISTAKES', { cueWord: 'שלוש' }); } },
  m1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('זיגזג'), type: 'pop' }, { lt: s.cue('נחשב'), type: 'pop' }, { lt: s.cue('רעש'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, zig = s.cue('זיגזג'), valid = s.cue('נחשב'), noise = s.cue('רעש');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 38], [d, 10, 38]], { p: [60800, 65800] });
      ch.draw(ctx, { reveal: 37, dim: 0.3 });
      // minor swing lows = local minima that are not structure lows
      const minors = [];
      for (let i = 9; i < 36; i++) { const q = UPC[i]; if (q.l < UPC[i - 1].l && q.l < UPC[i + 1].l && ![10, 20, 30].includes(i)) minors.push(i); }
      minors.forEach((i, k) => { const pk = prog(lt, zig + k * 0.08, zig + k * 0.08 + 0.3); ch.dot(ctx, i, UPC[i].l, pk * (1 - 0.6 * prog(lt, noise, noise + 0.3)), '#ff5a72', 9); });
      if (lt > noise) minors.forEach(i => cross(ctx, ch.X(i), ch.Y(UPC[i].l) + 40, 16, prog(lt, noise, noise + 0.3)));
      [10, 20, 30].forEach((i, k) => { ch.dot(ctx, i, PU(i), prog(lt, valid + k * 0.15, valid + k * 0.15 + 0.3), C.gold, 15); check(ctx, ch.X(i), ch.Y(PU(i)) + 52, 22, prog(lt, valid + k * 0.15, valid + k * 0.15 + 0.3)); });
      badge(ctx, 'טעות 1 · כל זיגזג = שפל', prog(lt, 0, 0.35), '#d61f45', 300, W / 2, 40);
    },
  },
  m2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('עצמו'), type: 'pop' }, { lt: s.cue('רחוק'), type: 'pop' }, { lt: s.cue('לתיקון'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, self = s.cue('עצמו'), far = s.cue('רחוק'), fix = s.cue('לתיקון');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 26, 50], [d, 28, 52]], { p: [61800, 65800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 41], [fix, 43], [d, 47]], E.lin)[0] });
      ch.hline(ctx, HL_KEY, 30, 52, { color: C.down, width: 3, alpha: 0.6 });
      const yb = ch.Y(63250);
      popT(ctx, ch.X(40) - 190, yb + 70, prog(lt, self, self + 0.3), () => pill(ctx, 'SELL בנר השבירה', ch.X(40) - 190, yb + 70, { size: 26, color: '#555' }));
      cross(ctx, ch.X(40) - 20, yb + 70, 24, prog(lt, far, far + 0.3));
      if (lt > far) { ctx.save(); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(ch.X(41), ch.Y(LH_KEY)); ctx.lineTo(ch.X(41), yb); ctx.stroke(); ctx.restore(); text(ctx, 'רחוק', ch.X(41) - 18, (ch.Y(LH_KEY) + yb) / 2, { size: 30, weight: 900, color: '#ff5a72', align: 'right', alpha: prog(lt, far, far + 0.3) }); }
      if (lt > fix + 0.8) popT(ctx, ch.X(46), ch.Y(LH_KEY) - 60, prog(lt, fix + 0.8, fix + 1.1), () => pill(ctx, 'SELL בתיקון ✓', ch.X(46), ch.Y(LH_KEY) - 60, { size: 28, color: '#0b8f63' }));
      badge(ctx, 'טעות 2 · כניסה בנר השבירה', prog(lt, 0, 0.35), '#d61f45', 300, W / 2, 40);
    },
  },
  m3: {
    trans: 'whip',
    events: s => [{ lt: s.cue('דקה'), type: 'pop' }, { lt: s.cue('יומית'), type: 'impact', k: 0.9 }, { lt: s.cue('הגדולה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, mn = s.cue('דקה'), day = s.cue('יומית'), big = s.cue('הגדולה');
      drawBG(ctx, s.t);
      const tf = (y, label, dir, col, p, sub) => popT(ctx, W / 2, y, p, () => { glass(ctx, 140, y - 95, 800, 190, 30, { border: col, glowColor: col });
        text(ctx, label, 860, y, { size: 80, weight: 800, fam: MONO, color: '#fff', align: 'right' }); text(ctx, sub, 600, y, { size: 40, weight: 800, color: col, align: 'right' });
        arrow(ctx, 225, y + (dir > 0 ? 50 : -50), 225, y + (dir > 0 ? -50 : 50), 1, { color: col, width: 12, head: 36 }); });
      tf(560, '1D', 1, C.up, prog(lt, day - 0.1, day + 0.3), 'מגמה יומית');
      tf(800, '4H', 1, C.up, prog(lt, day + 0.1, day + 0.4), 'עלייה');
      tf(1040, '1m', -1, C.down, prog(lt, mn - 0.1, mn + 0.3), 'BOS למטה');
      cross(ctx, 345, 1040, 30, prog(lt, day, day + 0.3));
      badge(ctx, 'תתחיל מהתמונה הגדולה', prog(lt, big - 0.3, big + 0.1), C.purple, 1270, W / 2, 42);
      badge(ctx, 'טעות 3 · נגד הטיימפריים הגבוה', prog(lt, 0, 0.35), '#d61f45', 300, W / 2, 40);
    },
  },

  // ================= CH6: TradingView + plan =================
  ch6: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 6, 6, 'תוכנית מסחר', 'TRADINGVIEW PLAN', { cueWord: 'תוכנית' }); } },
  t1: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('בקו') - 0.2, type: 'click' }, { lt: s.cue('אלט'), type: 'key' }, { lt: s.cue('ואייץ'), type: 'key' }, { lt: s.cue('התראה'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, mk = s.cue('בקו'), ka = s.cue('אלט'), kb = s.cue('ואייץ'), al = s.cue('התראה');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(4, 42, 59600, 65800);
      ch.draw(ctx, { reveal: 38.5, tfs: ['15m', '1H', '4H', '1D'], dim: 0.1 });
      const at = tvToolbar(ctx, 40, 466, 870, lt > mk - 0.2 ? 'hline' : null);
      ch.dot(ctx, 30, HL_KEY, prog(lt, 0.2, 0.5), C.gold, 12);
      ch.hline(ctx, HL_KEY, 30, 42, { color: C.gold, width: 4, progress: prog(lt, mk, mk + 0.5) });
      const [hx, hy] = at('hline');
      if (lt < ka) { const c = kf(lt, [[0, 700, 1100], [mk - 0.3, hx, hy], [mk + 0.1, hx, hy], [ka - 0.1, ch.X(34), ch.Y(HL_KEY)]]); cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - (mk - 0.2)) * 14), 1.15); }
      const pk = prog(lt, ka - 0.05, ka + 0.3) * (1 - prog(lt, al - 0.3, al - 0.05));
      if (pk > 0) { scrim(ctx, 0.5 * pk);
        keycap(ctx, 'Alt', W / 2 - 150, 860, pk, { w: 230, pressed: lt > ka ? 1 : 0 }); text(ctx, '+', W / 2 - 5, 860, { size: 90, weight: 900, color: C.purple2, alpha: pk });
        keycap(ctx, 'H', W / 2 + 160, 860, prog(lt, kb - 0.05, kb + 0.3) * pk, { w: 170, pressed: lt > kb ? 1 : 0 }); }
      const pa = prog(lt, al - 0.1, al + 0.25);
      if (pa > 0) {
        ctx.save(); ctx.globalAlpha = pa; const bx = 150, by = 600, bw = 780, bh = 420;
        glass(ctx, bx, by, bw, bh, 26, { fill: 'rgba(22,16,40,0.97)' });
        text(ctx, 'Create alert on BTCUSD', bx + 40, by + 60, { size: 36, weight: 800, align: 'left' });
        [['Condition', 'Crossing Down'], ['Value', fmt(HL_KEY) + '.00'], ['Trigger', 'Once Per Bar Close']].forEach(([k, v], j) => {
          const hot = j === 2 && lt > al + 0.5;
          text(ctx, k, bx + 40, by + 140 + j * 70, { size: 28, weight: 500, align: 'left', color: C.axis });
          rrect(ctx, bx + 280, by + 112 + j * 70, 460, 56, 10); ctx.fillStyle = hot ? 'rgba(168,85,247,0.45)' : '#0d0a19'; ctx.fill();
          text(ctx, v, bx + 300, by + 140 + j * 70, { size: 28, weight: 700, align: 'left', fam: MONO, color: hot ? '#fff' : '#ddd' });
        });
        rrect(ctx, bx + bw - 240, by + bh - 90, 200, 64, 14); ctx.fillStyle = C.purple; ctx.fill();
        text(ctx, 'Create', bx + bw - 140, by + bh - 57, { size: 30, weight: 800 });
        ctx.restore();
      }
      badge(ctx, 'התראה על סגירת נר', prog(lt, al + 0.5, al + 0.85), C.purple, 300, W / 2, 42);
    },
  },
  t2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('רודפים'), type: 'pop' }, { lt: s.cue('Lower'), type: 'pop' }, { lt: s.cue('בשורט'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, chase = s.cue('רודפים'), lh = s.cue('Lower'), sh = s.cue('בשורט');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 24, 48], [d, 26, 50]], { p: [61800, 65800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 41], [lh, 46.5], [d, 47]], E.lin)[0] });
      ch.hline(ctx, HL_KEY, 30, 50, { color: C.down, width: 3, alpha: 0.6 });
      ch.tag(ctx, 40, PU(42), 'BOS', 1, { color: '#d61f45', above: false, size: 26, off: 44 });
      if (lt > chase && lt < lh) cross(ctx, ch.X(42) + 100, ch.Y(63100), 26, prog(lt, chase, chase + 0.3));
      ch.tag(ctx, 46, LH_KEY, 'LH', prog(lt, lh, lh + 0.3), { color: '#d61f45', size: 30, off: 44 });
      ch.zone(ctx, LH_KEY - 250, LH_KEY + 50, 44, 50, { color: '#2962ff', alpha: 0.2, progress: prog(lt, sh - 0.2, sh + 0.3) });
      popT(ctx, ch.X(47), ch.Y(LH_KEY) + 90, prog(lt, sh, sh + 0.3), () => pill(ctx, 'כניסה: SHORT', ch.X(47), ch.Y(LH_KEY) + 90, { size: 28, color: '#2962ff' }));
      badge(ctx, 'לא רודפים · מחכים לתיקון', prog(lt, chase, chase + 0.35), C.purple, 300, W / 2, 42);
    },
  },
  t3: {
    trans: 'none',
    events: s => [{ lt: s.cue('הסטופ'), type: 'pop' }, { lt: s.cue('והיעד'), type: 'pop' }, { lt: s.cue('הבאים'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chU, st = s.cue('הסטופ'), tg = s.cue('והיעד'), nx = s.cue('הבאים');
      const EN = 64000, SL = 64550, TP = 62350;
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 26, 50], [d, 24, 58]], { p: [61500, 65800] });
      ch.draw(ctx, { reveal: lerp(47, 55.5, prog(lt, tg + 0.3, d - 0.2)) });
      ch.hline(ctx, PU(20), 20, 58, { color: '#3df2a6', width: 3, dash: [10, 8], progress: prog(lt, tg, tg + 0.5) });
      ch.hline(ctx, SL, 46, 58, { color: C.down, width: 4, progress: prog(lt, st, st + 0.4) });
      popT(ctx, ch.X(52), ch.Y(SL) - 34, prog(lt, st, st + 0.3), () => pill(ctx, 'סטופ: מעל ה-LH', ch.X(52), ch.Y(SL) - 34, { size: 26, color: '#d61f45' }));
      positionBox(ctx, ch, 47, 56, EN, SL, TP, prog(lt, tg, tg + 0.8), { rr: true });
      popT(ctx, ch.X(51), ch.Y(TP) + 44, prog(lt, tg, tg + 0.3), () => pill(ctx, 'יעד: השפלים הבאים', ch.X(51), ch.Y(TP) + 44, { size: 26, color: '#0b8f63' }));
      if (lt > nx) hit(ctx, ch.X(55), ch.Y(TP), lt, nx, C.up, 200);
    },
  },
  t4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('יודעים'), type: 'riser' }, { lt: s.cue('בשלושת'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, q = s.cue('ואיך'), three = s.cue('בשלושת');
      drawBG(ctx, s.t, { glow: 1.2 });
      headlines(ctx, lt, [{ t: 'עד לאן התיקון יגיע?', at: q + 0.2, y: 520, size: 84, color: C.gold, glowColor: C.gold }]);
      seriesMap(ctx, lt, 1, q, 900, { done: 2 });
      [2, 3, 4].forEach((k, j) => { const x = lerp(930, 150, k / 4), p = prog(lt, three + j * 0.15, three + j * 0.15 + 0.4); ring(ctx, x, 900, 140, p, C.gold); popT(ctx, x, 1130, p, () => pill(ctx, 'הבא', x, 1130, { size: 28, color: '#b8860b' })); });
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מבנה'), type: 'pop' }, { lt: s.cue('BOS'), type: 'pop' }, { lt: s.cue('השבירה'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['מבנה', 'שיאים ושפלים במדרגות', C.purple, s.cue('מבנה'), 'zz'],
        ['BOS', 'סגירת גוף מעבר לרמה', '#e0546b', s.cue('BOS'), 'warn'],
        ['ואז מחכים לתיקון', 'שם נכנסים', '#0fa36b', s.cue('השבירה'), 'check'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('מדויק'), type: 'riser' }, { lt: s.cue('Fair'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, q = s.cue('איפה'), three = s.cue('שלושה'), fv = s.cue('Fair');
      drawBG(ctx, s.t, { glow: 1.3 });
      headlines(ctx, lt, [{ t: 'איפה התיקון', at: q, y: 470, size: 92 }, { t: 'ייעצר?', at: s.cue('ייעצר'), y: 590, size: 110, color: C.gold, glowColor: C.gold }]);
      // three-candle gap teaser
      const pc = prog(lt, three - 0.2, three + 0.6);
      if (pc > 0) { const cx = W / 2; const cs = [[-150, 830, 880, 960, 1000], [0, 700, 720, 900, 940], [150, 640, 660, 740, 780]]; // [dx, high, bodyTop, bodyBot, low] in y
        cs.forEach(([dx, hi, bt, bb, lo], k) => { const p = clamp(pc * 3 - k); if (p <= 0) return; ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = C.up; ctx.fillStyle = C.up; ctx.lineWidth = 6; ctx.shadowColor = C.up; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(cx + dx, hi); ctx.lineTo(cx + dx, lo); ctx.stroke(); ctx.fillRect(cx + dx - 40, bt, 80, bb - bt); ctx.restore(); });
        if (pc > 0.9) { ctx.save(); ctx.globalAlpha = 0.35 + 0.15 * Math.sin(lt * 6); ctx.fillStyle = C.gold; ctx.fillRect(cx - 220, 780, 440, 50); ctx.restore(); text(ctx, 'FVG', cx + 270, 805, { size: 34, weight: 900, color: C.gold, alpha: prog(pc, 0.9, 1) }); } }
      popT(ctx, W / 2, 1220, prog(lt, fv - 0.1, fv + 0.35), () => pill(ctx, 'הבא: FAIR VALUE GAP', W / 2, 1220, { size: 48, color: C.purple, glow: 50 }));
      ring(ctx, W / 2, 1220, 520, prog(lt, fv, fv + 0.7));
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

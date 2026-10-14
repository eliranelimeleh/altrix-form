// L6 — Price Action made simple, part 1: the indicator loop, sunk cost, and key #1: direction
'use strict';
const chP = new Chart(PA_C);
const MIRP = 125800; // downtrend = mirror image of the master chart
const DN_C = PA_C.map(q => ({ o: MIRP - q.o, c: MIRP - q.c, h: MIRP - q.l, l: MIRP - q.h }));
const chN = new Chart(DN_C);
const BOS_I = 13 + PA_C.slice(13).findIndex(q => q.c > PA(8)); // first close above the first high
const LOSS_BUYS = [47, 50, 56, 60]; // dip buys during the sell-off (story of the hook)

function lossPills(ctx, ch, lt, t0, crossAt) {
  LOSS_BUYS.forEach((i, k) => {
    const x = ch.X(i), y = ch.Y(PA_C[i].l) + 50, p = prog(lt, t0 + k * 0.25, t0 + k * 0.25 + 0.3);
    popT(ctx, x, y, p, () => pill(ctx, 'BUY', x, y, { size: 22, color: '#2962ff', pad: 10 }));
    if (crossAt !== undefined) cross(ctx, x, y + 46, 18, prog(lt, crossAt + k * 0.12, crossAt + k * 0.12 + 0.3));
  });
}
function indicatorTags(ctx, lt, list, t0, y0 = 300) {
  list.forEach(([t, col], k) => popT(ctx, 200 + k * 340, y0, prog(lt, t0 + k * 0.2, t0 + k * 0.2 + 0.3), () => pill(ctx, t, 200 + k * 340, y0, { size: 30, color: col, fam: MONO })));
}

window.SCENES = {
  // ================= HOOK =================
  hook1: {
    captions: false,
    events: s => [{ lt: s.cue('שבעה'), type: 'pop' }, { lt: s.cue('הפסדתי'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, seven = s.cue('שבעה'), lost = s.cue('הפסדתי');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 38, 62], [d, 40, 64]], { p: [60500, 66400] });
      ch.draw(ctx, { reveal: lerp(46, 62, prog(lt, 0.3, d)) });
      clutter(ctx, ch, 64, prog(lt, seven - 0.3, seven + 0.3));
      lossPills(ctx, ch, lt, 0.6, lost);
      if (lt > lost) flashCol(ctx, lt, lost);
      wipeText(ctx, 'שבעה אינדיקטורים על הגרף', W / 2, 300, prog(lt, seven - 0.1, seven + 0.25), { size: 66, weight: 900 });
    },
  },
  hook2: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('מחקתי'), type: 'whoosh' }, { lt: s.cue('אחד'), type: 'impact', k: 1 }, { lt: s.cue('הפוך'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, del = s.cue('מחקתי'), one = s.cue('אחד'), opp = s.cue('הפוך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 40, 64], [d, 40, 66]], { p: [60500, 66400] });
      ch.draw(ctx, { reveal: 62 });
      clutter(ctx, ch, 64, 1 - prog(lt, del, del + 0.5));
      trendLine(ctx, ch, 44, PA(44), 54, PA(54), 66, prog(lt, one, one + 0.6), { color: '#ff5a72', width: 6 });
      lossPills(ctx, ch, lt, -5, -5);
      if (lt > opp) { arrow(ctx, ch.X(46), ch.Y(65200), ch.X(62), ch.Y(61400), prog(lt, opp, opp + 0.5), { color: C.down, width: 12, head: 44 }); hit(ctx, ch.X(54), ch.Y(PA(54)), lt, opp, C.down, 240); }
      if (lt < opp) wipeText(ctx, 'מחקתי הכל · קו אחד', W / 2, 300, prog(lt, del, del + 0.3), { size: 68, weight: 900, color: C.purple2 });
      else wipeText(ctx, 'סחרתי הפוך מהשוק', W / 2, 300, prog(lt, opp - 0.05, opp + 0.25), { size: 72, weight: 900, color: '#ff5a72' });
    },
  },
  hook3: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('בלי'), type: 'pop' }, { lt: s.cue('שלושה'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, how = s.cue('קורא'), no = s.cue('בלי'), three = s.cue('שלושה');
      drawBG(ctx, s.t, { glow: 1.25 });
      headlines(ctx, lt, [{ t: 'איך אני קורא גרף', at: how - 0.3, y: 420, size: 92 }, { t: 'בלי אינדיקטורים', at: no, y: 560, size: 84, color: '#ff7b8f', glowColor: C.down }]);
      seriesMap(ctx, lt, -1, three - 0.2, 980, { list: SERIES_PA.slice(0, 3), done: 0 });
      popT(ctx, W / 2, 1270, prog(lt, three, three + 0.35), () => pill(ctx, 'רק 3 מפתחות', W / 2, 1270, { size: 48, color: C.purple, glow: 45 }));
    },
  },
  intro: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('ברורות'), type: 'pop' }, { lt: s.cue('טיפשיות'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, click = s.cue('קליק'), good = s.cue('ברורות'), bad = s.cue('טיפשיות');
      drawBG(ctx, s.t, { glow: 1.2 });
      headlines(ctx, lt, [{ t: 'כשזה עושה קליק', at: click - 0.3, y: 420, size: 96, color: C.neon }]);
      const card = (y, t1, t2, col, ok, t) => popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 120, y - 120, 840, 240, 30, { border: col, glowColor: col }); text(ctx, t1, 880, y - 30, { size: 64, weight: 900, align: 'right' }); text(ctx, t2, 880, y + 50, { size: 40, weight: 800, color: col, align: 'right' }); (ok ? check : cross)(ctx, 230, y, 50, 1); });
      card(720, 'עסקה טובה', 'נראית ברורה', '#16c784', true, good);
      card(1030, 'עסקה גרועה', 'נראית טיפשית', '#f23645', false, bad);
    },
  },

  // ================= CH1: the loop =================
  ch1: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 1, 5, 'הלופ שנתקעתי בו', 'THE INDICATOR LOOP', { cueWord: 'הלופ' }); } },
  a1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('קנייה'), type: 'pop' }, { lt: s.cue('מכירה'), type: 'pop' }, { lt: s.cue('נכנס'), type: 'click' }, { lt: s.cue('נגדי'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, buy = s.cue('קנייה'), sell = s.cue('מכירה'), enter = s.cue('נכנס'), against = s.cue('נגדי');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 32, 52], [d, 34, 54]], { p: [62300, 66400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 45], [enter, 46], [against, 47.5], [d, 49.5]], E.lin)[0] });
      clutter(ctx, ch, 50, 0.8);
      indicatorTags(ctx, lt, [['RSI ▲', '#0b8f63'], ['MACD ▲', '#0b8f63']], buy - 0.1, 300);
      popT(ctx, 880, 300, prog(lt, sell, sell + 0.3), () => pill(ctx, 'EMA ▼', 880, 300, { size: 30, color: '#d61f45', fam: MONO }));
      if (lt > enter) { ch.hline(ctx, PA_C[45].c, 45, 54, { color: '#2962ff', width: 3, dash: [8, 6] }); popT(ctx, ch.X(46), ch.Y(PA_C[45].c) - 40, prog(lt, enter, enter + 0.3), () => pill(ctx, 'BUY', ch.X(46), ch.Y(PA_C[45].c) - 40, { size: 28, color: '#2962ff' })); }
      if (lt > against) { cross(ctx, ch.X(49), ch.Y(64000), 34, prog(lt, against, against + 0.3)); flashCol(ctx, lt, against); }
    },
  },
  a2: {
    trans: 'none',
    events: s => [{ lt: s.cue('מוסיף'), type: 'pop' }, { lt: s.cue('ועוד'), type: 'pop' }, { lt: s.cue('ועוד', 1), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, add = s.cue('מוסיף'), m1 = s.cue('ועוד'), m2 = s.cue('ועוד', 1);
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 640).view(32, 54, 62300, 66400);
      ch.draw(ctx, { reveal: 49.5 });
      const cs = PA_C, lines = [[emaSeries(cs, 9), '#ffeb3b', add], [emaSeries(cs, 21), '#ff9800', m1], [emaSeries(cs, 50), '#2962ff', m1 + 0.3], [smaSeries(cs, 100), '#e91e63', m2]];
      lines.forEach(([v, c, t]) => lineSeries(ctx, ch, v, 50, { color: c, width: 3, glow: 8, alpha: prog(lt, t, t + 0.3) }));
      const pr = prog(lt, m1, m1 + 0.4);
      if (pr > 0) { ctx.save(); ctx.globalAlpha = pr; oscPane(ctx, ch, 1030, 150, rsiSeries(cs), 50, { label: 'RSI 14' }); ctx.restore(); }
      const pm = prog(lt, m2, m2 + 0.4);
      if (pm > 0) { ctx.save(); ctx.globalAlpha = pm; oscPane(ctx, ch, 1190, 140, cs.map((q, i) => 50 + 40 * Math.sin(i / 3)), 50, { label: 'STOCH', color: '#ff9800', levels: [20, 80] }); ctx.restore(); }
      const n = (lt > add) + (lt > m1) * 2 + (lt > m2) * 2;
      popT(ctx, W / 2, 300, prog(lt, add, add + 0.3), () => pill(ctx, n > 2 ? 'עוד ועוד אינדיקטורים' : 'עוד אינדיקטור', W / 2, 300, { size: 44, color: '#d61f45', glow: 35 }));
    },
  },
  a3: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('חוזר'), type: 'riser' }, { lt: s.cue('ניחוש'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, loop = s.cue('חוזר'), frame = s.cue('מסגרת'), guess = s.cue('ניחוש');
      drawBG(ctx, s.t, { glow: 1.1 });
      const cx = W / 2, cy = 800, R = 300, rot = lt * 0.9 * prog(lt, loop - 0.2, loop + 0.3);
      const nodes = [['אינדיקטור', C.purple], ['עסקה', '#2962ff'], ['הפסד', '#d61f45'], ['עוד אינדיקטור', C.purple]];
      ctx.save(); ctx.strokeStyle = 'rgba(192,132,252,0.45)'; ctx.lineWidth = 6; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -lt * 60; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      nodes.forEach(([t, c], k) => { const a = -Math.PI / 2 + k * Math.PI / 2 + rot, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; popT(ctx, x, y, prog(lt, k * 0.25, k * 0.25 + 0.35), () => pill(ctx, t, x, y, { size: 36, color: c, glow: 30 })); });
      text(ctx, '↻', cx, cy, { size: 160, weight: 900, color: C.purple2, alpha: 0.6, glow: 30 });
      if (lt > frame) badge(ctx, 'אין מסגרת', prog(lt, frame, frame + 0.3), '#d61f45', 300, W / 2, 46);
      popT(ctx, W / 2, 1270, prog(lt, guess, guess + 0.35), () => pill(ctx, 'ניחוש שמחופש לניתוח', W / 2, 1270, { size: 46, color: '#d61f45', glow: 40 }));
    },
  },
  a4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('יותר'), type: 'pop' }, { lt: s.cue('פחות'), type: 'pop' }, { lt: s.cue('הנכון'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, more = s.cue('יותר'), less = s.cue('פחות'), right = s.cue('הנכון');
      drawBG(ctx, s.t);
      const top = new Chart(PA_C), bot = new Chart(PA_C);
      top.layout(...PANEL_TOP, { head: 80, foot: 40 }).view(0, 46, 59500, 66400); top.draw(ctx, { reveal: 45 }); clutter(ctx, top, 46, prog(lt, more - 0.3, more + 0.2));
      bot.layout(...PANEL_BOT, { head: 80, foot: 40 }).view(0, 46, 59500, 66400); bot.draw(ctx, { reveal: 45 });
      trendLine(ctx, bot, 0, 60000, 13, 61000, 46, prog(lt, less, less + 0.6), { color: C.teal, width: 6 });
      text(ctx, 'יותר', top.r.x + 110, top.r.y + 140, { size: 44, weight: 900, color: '#ff5a72', align: 'left', alpha: prog(lt, more, more + 0.3) }); cross(ctx, top.r.x + 70, top.r.y + 140, 26, prog(lt, more, more + 0.3));
      text(ctx, 'פחות · הנכון', bot.r.x + 110, bot.r.y + 140, { size: 44, weight: 900, color: '#3df2a6', align: 'left', alpha: prog(lt, less, less + 0.3) }); check(ctx, bot.r.x + 70, bot.r.y + 140, 26, prog(lt, right, right + 0.3));
    },
  },
  a5: {
    trans: 'none',
    events: s => [{ lt: s.cue('מהמחיר'), type: 'pop' }, { lt: s.cue('מאחר'), type: 'impact', k: 1 }, { lt: s.cue('ישר'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, from = s.cue('מהמחיר'), late = s.cue('מאחר'), direct = s.cue('ישר');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 30, 56], [d, 34, 56]], { p: [61500, 66400] });
      ch.draw(ctx, { reveal: 55 });
      const e = emaSeries(PA_C, 21);
      lineSeries(ctx, ch, e, 56, { color: '#ff9800', width: 5, glow: 14, alpha: prog(lt, from - 0.2, from + 0.3) });
      // lag: price turned at 44, the EMA turns ~5 candles later
      const turnE = 44 + e.slice(44).findIndex((v, k, a) => k > 0 && v < a[k - 1]);
      if (lt > late) { ch.dot(ctx, 44, PA(44), 1, C.gold, 14); ch.dot(ctx, turnE, e[turnE], 1, '#ff9800', 14);
        ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(ch.X(44), ch.Y(PA(44)) - 40); ctx.lineTo(ch.X(turnE), ch.Y(PA(44)) - 40); ctx.stroke(); ctx.restore();
        text(ctx, 'מאחר', (ch.X(44) + ch.X(turnE)) / 2, ch.Y(PA(44)) - 80, { size: 40, weight: 900, color: '#ff9800', alpha: prog(lt, late, late + 0.3), stroke: 6 }); }
      badge(ctx, 'כל אינדיקטור = חישוב על המחיר', prog(lt, from, from + 0.35), C.purple, 300, W / 2, 40);
      badge(ctx, 'אז תסתכל ישר על המחיר', prog(lt, direct, direct + 0.35), '#0b8f63', 1270, W / 2, 40);
    },
  },

  // ================= CH2: sunk cost =================
  ch2: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 2, 5, 'מלכודת הזמן שהשקעתי', 'THE SUNK COST TRAP', { cueWord: 'מלכודת' }); } },
  b1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('שעות'), type: 'tick' }, { lt: s.cue('מפסידות'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, hrs = s.cue('שעות'), lose = s.cue('מפסידות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 36, 64], [d, 38, 64]], { p: [60500, 66400] });
      ch.draw(ctx, { reveal: lerp(48, 62, prog(lt, hrs, d)) });
      clutter(ctx, ch, 64, 0.7);
      fibDraw(ctx, ch, 36, PA(36), 44, PA(44), 64, prog(lt, 0.1, 0.9), { alpha: 0.7 });
      const h = Math.floor(lerp(0, 6, prog(lt, hrs - 0.3, d - 0.3)));
      popT(ctx, 880, 300, prog(lt, hrs - 0.3, hrs), () => { glass(ctx, 760, 245, 240, 110, 22, { border: C.gold }); text(ctx, `${h}:00`, 880, 302, { size: 54, weight: 800, fam: MONO, color: C.gold }); });
      lossPills(ctx, ch, lt, lose - 0.6, lose);
    },
  },
  b2: {
    trans: 'none',
    events: s => [{ lt: s.cue('הגיונית'), type: 'pop' }, { lt: s.cue('לוותר'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt } = s, logic = s.cue('הגיונית'), time = s.cue('זמן'), give = s.cue('לוותר');
      drawBG(ctx, s.t, { glow: 1.1 });
      const row = (y, t1, ok, t, col) => popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 120, y - 90, 840, 180, 28, { border: col, glowColor: col }); text(ctx, t1, 860, y, { size: 52, weight: 900, align: 'right' }); (ok ? check : cross)(ctx, 220, y, 40, 1); });
      row(560, 'העסקה הגיונית', false, logic, '#d61f45');
      row(800, 'השקעתי בה 6 שעות', true, time, C.gold);
      const p = prog(lt, give - 0.1, give + 0.3);
      if (p > 0) { scrim(ctx, 0.4 * p); headlines(ctx, lt, [{ t: 'לא הצלחתי לוותר', at: give, y: 1080, size: 86, color: '#ff7b8f', glowColor: C.down, kind: 'pop' }]); }
    },
  },
  b3: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('Sunk'), type: 'impact', k: 1.1 }, { lt: s.cue('ערך'), type: 'pop' }, { lt: s.cue('המטרה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, sk = s.cue('Sunk'), val = s.cue('ערך'), goal = s.cue('המטרה');
      drawBG(ctx, s.t, { glow: 1.2 });
      titleLock(ctx, lt, 'Sunk Cost', 'ההשקעה שמטעה אותך', sk - 0.1, sk + 0.5, 470);
      // scale: invested time vs goal
      const tilt = lerp(0, 0.32, E.outBack(prog(lt, val, val + 0.6))), cx = W / 2, cy = 960;
      ctx.save(); ctx.globalAlpha = prog(lt, val - 0.3, val); ctx.translate(cx, cy); ctx.strokeStyle = C.gold; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, 200); ctx.stroke();
      ctx.rotate(tilt); ctx.beginPath(); ctx.moveTo(-300, -60); ctx.lineTo(300, -60); ctx.stroke(); ctx.restore();
      const yl = cy - 60 + Math.sin(tilt) * 300, yr = cy - 60 - Math.sin(tilt) * 300;
      popT(ctx, cx + 300, yl + 70, prog(lt, val, val + 0.3), () => pill(ctx, 'זמן שהשקעתי', cx + 300, yl + 70, { size: 34, color: '#b8860b' }));
      popT(ctx, cx - 300, yr + 70, prog(lt, goal, goal + 0.3), () => pill(ctx, 'המטרה: עסקה טובה', cx - 300, yr + 70, { size: 34, color: '#0b8f63' }));
    },
  },
  b4: {
    trans: 'whip',
    events: s => [{ lt: s.cue('ניקיתי'), type: 'whoosh' }, { lt: s.cue('קו'), type: 'pop' }, { lt: s.cue('פשטות'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, clean = s.cue('ניקיתי'), line = s.cue('קו'), secs = s.cue('שניות'), simp = s.cue('פשטות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 38, 64], [d, 40, 66]], { p: [60500, 66400] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 55], [secs, 55.5], [d, 64]], E.lin)[0] });
      clutter(ctx, ch, 64, 1 - prog(lt, clean, clean + 0.4));
      trendLine(ctx, ch, 44, PA(44), 54, PA(54), 66, prog(lt, line, line + 0.5), { color: '#ff5a72', width: 6 });
      if (lt > secs) { popT(ctx, ch.X(55) + 80, ch.Y(PA_C[55].c), prog(lt, secs, secs + 0.3), () => pill(ctx, 'SELL', ch.X(55) + 80, ch.Y(PA_C[55].c), { size: 30, color: '#d61f45' })); check(ctx, ch.X(60), ch.Y(62000), 30, prog(lt, simp, simp + 0.3)); }
      popT(ctx, W / 2, 300, prog(lt, simp - 0.1, simp + 0.3), () => pill(ctx, 'השיעור: פשטות', W / 2, 300, { size: 54, color: C.purple, glow: 50 }));
    },
  },
  b5: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('קל'), type: 'pop' }, { lt: s.cue('להפסיד'), type: 'pop' }, { lt: s.cue('הסיכון'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, easy = s.cue('קל'), lose = s.cue('להפסיד'), rep = s.cue('חוזר'), risk = s.cue('הסיכון');
      drawBG(ctx, s.t, { glow: 1.15 });
      headlines(ctx, lt, [{ t: 'פשוט ≠ קל', at: easy - 0.2, y: 420, size: 130, color: C.gold, glowColor: C.gold, kind: 'pop' }]);
      const row = (y, t1, ok, t) => popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 140, y - 75, 800, 150, 26, { border: ok ? '#16c784' : '#f23645' }); text(ctx, t1, 860, y, { size: 46, weight: 900, align: 'right' }); (ok ? check : cross)(ctx, 230, y, 36, 1); });
      row(680, 'בלי הפסדים', false, lose);
      row(880, 'חוזר על עצמו', true, rep);
      row(1080, 'שווה את הסיכון', true, risk);
    },
  },

  // ================= CH3: what the chart shows =================
  ch3: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 3, 5, 'מה הגרף באמת מראה', 'MASS PSYCHOLOGY', { cueWord: 'מה' }); } },
  c1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('פסיכולוגיה'), type: 'impact', k: 1 }, { lt: s.cue('הקונים'), type: 'pop' }, { lt: s.cue('המוכרים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, psy = s.cue('פסיכולוגיה'), buy = s.cue('הקונים'), sell = s.cue('המוכרים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 46], [d, 2, 46]], { p: [59300, 66600] });
      ch.draw(ctx, { reveal: 45 });
      [[13, 'קונים'], [25, 'קונים'], [36, 'קונים']].forEach(([i, t], k) => ch.tag(ctx, i, PA(i), t, prog(lt, buy + k * 0.15, buy + k * 0.15 + 0.3), { color: '#0b8f63', above: false, size: 26, off: 44 }));
      [[8, 'מוכרים'], [20, 'מוכרים'], [32, 'מוכרים']].forEach(([i, t], k) => ch.tag(ctx, i, PA(i), t, prog(lt, sell + k * 0.15, sell + k * 0.15 + 0.3), { color: '#d61f45', size: 26, off: 44 }));
      // tug of war bar
      const pb = prog(lt, psy - 0.2, psy + 0.3), bal = 0.5 + 0.18 * Math.sin(lt * 1.6);
      if (pb > 0) { ctx.save(); ctx.globalAlpha = pb; glass(ctx, 120, 250, 840, 100, 22); ctx.fillStyle = '#16c784'; ctx.fillRect(160 + 760 * (1 - bal), 285, 760 * bal, 30); ctx.fillStyle = '#f23645'; ctx.fillRect(160, 285, 760 * (1 - bal), 30);
        text(ctx, 'קונים', 900, 300, { size: 26, weight: 900, align: 'right' }); text(ctx, 'מוכרים', 180, 300, { size: 26, weight: 900, align: 'left' }); ctx.restore(); }
    },
  },
  c2: {
    trans: 'none',
    events: s => [{ lt: s.cue('נכנסו'), type: 'pop' }, { lt: s.cue('שוב'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, inn = s.cue('נכנסו'), again = s.cue('שוב');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 46], [d, 14, 46]], { p: [60300, 66600] });
      ch.draw(ctx, { reveal: 45, dim: 0.25 });
      [13, 25, 36].forEach((i, k) => ch.dot(ctx, i, PA(i), prog(lt, inn + k * 0.15, inn + k * 0.15 + 0.3), '#3df2a6', 13));
      const pz = prog(lt, again - 0.2, again + 0.3);
      if (pz > 0) { const p0 = TL(48); ch.zone(ctx, p0 - 250, p0 + 250, 45, 52, { color: C.gold, alpha: 0.25 * pz, progress: pz }); text(ctx, '?', ch.X(48.5), ch.Y(p0), { size: 90, weight: 900, color: C.gold, alpha: pz, glow: 30 }); }
      badge(ctx, 'איפה הם ייכנסו שוב?', prog(lt, again, again + 0.35), '#b8860b', 300, W / 2, 44);
    },
  },
  c3: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('כיוון'), type: 'pop' }, { lt: s.cue('אישור'), type: 'pop' }, { lt: s.cue('ופסילה'), type: 'pop' }, { lt: s.cue('הראשון'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, three = s.cue('שלושה'), first = s.cue('הראשון');
      drawBG(ctx, s.t, { glow: 1.2 });
      headlines(ctx, lt, [{ t: 'שלושה מפתחות', at: three - 0.2, y: 440, size: 110 }]);
      const keys = [['כיוון', 'DIRECTION', s.cue('כיוון')], ['אישור', 'CONFIRMATION', s.cue('אישור')], ['פסילה', 'INVALIDATION', s.cue('ופסילה')]];
      keys.forEach(([he, en, t], k) => { const y = 680 + k * 210, on = k === 0 && lt > first;
        popT(ctx, W / 2, y, prog(lt, t - 0.1, t + 0.3), () => { glass(ctx, 160, y - 85, 760, 170, 28, { border: on ? C.gold : 'rgba(190,140,255,0.35)', glowColor: on ? 'rgba(255,201,77,0.5)' : 'rgba(140,70,255,0.45)' });
          text(ctx, String(k + 1), 850, y, { size: 70, weight: 900, fam: MONO, color: on ? C.gold : C.purple2 }); text(ctx, he, 760, y - 18, { size: 56, weight: 900, align: 'right' }); text(ctx, en, 760, y + 40, { size: 26, weight: 800, align: 'right', color: C.axis, spacing: 4 }); }); });
      if (lt > first) ring(ctx, W / 2, 680, 460, prog(lt, first, first + 0.7), C.gold);
    },
  },
  c4: {
    trans: 'none', captions: false,
    events: s => [{ lt: s.cue('שלושים'), type: 'pop' }, { lt: s.cue('דקות'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt } = s, thirty = s.cue('שלושים'), min = s.cue('דקות');
      drawBG(ctx, s.t, { glow: 1.1 });
      text(ctx, '3', 650, 620, { size: 300, weight: 900, color: '#3df2a6', glow: 40, glowColor: C.up, alpha: prog(lt, 0, 0.3) });
      text(ctx, '30', 330, 620, { size: 300, weight: 900, color: 'rgba(255,90,114,0.6)', alpha: prog(lt, thirty - 0.1, thirty + 0.2) });
      if (lt > thirty) { ctx.save(); ctx.strokeStyle = '#ff5a72'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(180, 700); ctx.lineTo(480, 540); ctx.stroke(); ctx.restore(); }
      const pc = prog(lt, min - 0.3, min + 0.3);
      if (pc > 0) { const secs = Math.round(lerp(0, 120, prog(lt, min - 0.3, min + 1.2))); popT(ctx, W / 2, 1000, pc, () => { glass(ctx, W / 2 - 260, 900, 520, 200, 30, { border: C.gold }); text(ctx, `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, W / 2, 1000, { size: 110, weight: 800, fam: MONO, color: C.gold, glow: 24 }); }); }
      badge(ctx, 'כל מפתח · שתי דקות', prog(lt, min, min + 0.35), C.purple, 1250, W / 2, 44);
    },
  },

  // ================= CH4: key 1 — direction =================
  ch4: { trans: 'flash', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 4, 5, 'המפתח הראשון: כיוון', 'KEY #1 · DIRECTION', { cueWord: 'המפתח' }); } },
  d1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('מתרחק'), type: 'whoosh' }, { lt: s.cue('קטנה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, far = s.cue('מתרחק'), small = s.cue('קטנה');
      drawBG(ctx, s.t);
      const [i0, i1] = kf(lt, [[0, 40, 45], [far, 40, 45], [far + 1.4, 0, 46], [d, 0, 46]]);
      ch.layout(...PANEL_STD).view(i0, i1, ...ch.autoP(i0, i1, 0.14)); ch.draw(ctx, { reveal: 45 });
      popT(ctx, W / 2, 300, prog(lt, far, far + 0.35), () => pill(ctx, 'מתרחק · כמה ימים אחורה', W / 2, 300, { size: 44, color: C.purple, glow: 40 }));
      if (lt > small) cross(ctx, ch.X(44), ch.Y(PA(44)) - 50, 26, prog(lt, small, small + 0.3));
    },
  },
  d2: {
    trans: 'none',
    events: s => [{ lt: s.cue('שיא'), type: 'pop' }, { lt: s.cue('תיקון'), type: 'tick' }, { lt: s.cue('גבוה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, hi = s.cue('שיא'), fix = s.cue('תיקון'), hl = s.cue('גבוה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 24], [d, 0, 24]], { p: [59500, 63000] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 3], [hi, 8.9], [hl, 13.9], [d, 14.5]], E.lin)[0] });
      ch.zigzag(ctx, [[0, 60000], [8, PA(8)], [13, PA(13)]], prog(lt, 0.2, hl + 0.3), { color: C.purple2, width: 5 });
      ch.tag(ctx, 8, PA(8), 'שיא', prog(lt, hi, hi + 0.3), { color: C.purple, size: 28, off: 44 });
      ch.tag(ctx, 13, PA(13), 'שפל גבוה יותר', prog(lt, hl, hl + 0.3), { color: '#0b8f63', above: false, size: 28, off: 44 });
      badge(ctx, 'דחיפה ראשונה', prog(lt, 0.1, 0.45), C.purple, 300, W / 2, 44);
    },
  },
  d3: {
    trans: 'none',
    events: s => [{ lt: s.cue('ושובר'), type: 'impact', k: 1.3 }, { lt: s.cue('Break'), type: 'pop' }, { lt: s.cue('כיוון'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, br = s.cue('ושובר'), bos = s.cue('Break'), dir = s.cue('כיוון');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 24], [d, 0, 26]], { p: [59500, 63800] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 14.5], [br, BOS_I + 0.98], [d, 20.5]], E.lin)[0], highlight: i => i === BOS_I && lt > br });
      ch.hline(ctx, PA(8), 8, 26, { color: lt > br ? C.up : '#fff', width: 4, dash: lt > br ? null : [10, 8] });
      ch.zigzag(ctx, [[0, 60000], [8, PA(8)], [13, PA(13)]], 1, { color: 'rgba(192,132,252,0.6)', width: 4 });
      if (lt > br) { hit(ctx, ch.X(BOS_I), ch.Y(PA(8)), lt, br, C.up, 230); ch.tag(ctx, BOS_I, PA_C[BOS_I].h, 'BOS', prog(lt, bos, bos + 0.3), { color: '#0b8f63', size: 30, off: 46 }); }
      popT(ctx, W / 2, 300, prog(lt, dir, dir + 0.35), () => pill(ctx, 'יש כיוון: למעלה ↑', W / 2, 300, { size: 50, color: '#0b8f63', glow: 45 }));
    },
  },
  d4: {
    trans: 'none',
    events: s => [{ lt: s.cue('מותח'), type: 'click' }, { lt: s.cue('הראשון'), type: 'pop' }, { lt: s.cue('השני'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, drag = s.cue('מותח'), a = s.cue('הראשון'), b = s.cue('השני');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 26], [d, 0, 30]], { p: [59500, 64000] });
      ch.draw(ctx, { reveal: 20.5 });
      ch.dot(ctx, 0, 60000, prog(lt, a, a + 0.3), C.teal, 14); ch.tag(ctx, 0.6, 60000, 'שפל 1', prog(lt, a, a + 0.3), { color: '#0f766e', above: false, size: 26, off: 44 });
      ch.dot(ctx, 13, PA(13), prog(lt, b, b + 0.3), C.teal, 14); ch.tag(ctx, 13, PA(13), 'שפל 2', prog(lt, b, b + 0.3), { color: '#0f766e', above: false, size: 26, off: 44 });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 30, prog(lt, b, b + 0.9), { color: C.teal, width: 6 });
      badge(ctx, 'קו מגמה', prog(lt, drag, drag + 0.35), '#0f766e', 300, W / 2, 46);
    },
  },
  d5: {
    trans: 'none',
    events: s => [{ lt: s.cue('הקונים'), type: 'pop' }, { lt: s.cue('ממשיכה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, buyers = s.cue('הקונים'), go = s.cue('ממשיכה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [d, 0, 46]], { p: [59500, 66600] });
      const rev = lerp(20.5, 45, prog(lt, 0.2, d - 0.2));
      ch.draw(ctx, { reveal: rev });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 46, 1, { color: C.teal, width: 6 });
      [25, 36].forEach(i => { if (rev > i + 0.5) { const t = 0.2 + (i - 20.5) / 24.5 * (d - 0.4); hit(ctx, ch.X(i), ch.Y(PA(i)), lt, t, C.up, 150); ch.tag(ctx, i, PA(i), 'קונים חזרו', prog(lt, t, t + 0.3), { color: '#0b8f63', above: false, size: 24, off: 44 }); } });
      badge(ctx, 'כאן הקונים צפויים לחזור', prog(lt, buyers, buyers + 0.35), '#0b8f63', 300, W / 2, 42);
    },
  },
  d6: {
    trans: 'whip',
    events: s => [{ lt: s.cue('למטה'), type: 'impact', k: 1.1 }, { lt: s.cue('השיאים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chN, down = s.cue('למטה'), highs = s.cue('השיאים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [d, 0, 46]], { p: [59200, 66300] });
      ch.draw(ctx, { reveal: lerp(10, 45, prog(lt, 0, d - 0.2)) });
      const P = i => MIRP - PA(i);
      ch.zigzag(ctx, [[0, P(0)], [8, P(8)], [13, P(13)]], prog(lt, 0.2, down), { color: '#ff7b8f', width: 5 });
      ch.hline(ctx, P(8), 8, 30, { color: lt > down ? C.down : '#fff', width: 4, dash: lt > down ? null : [10, 8], progress: prog(lt, 0.3, 0.8) });
      if (lt > down) ch.tag(ctx, BOS_I, MIRP - PA_C[BOS_I].h, 'BOS', prog(lt, down, down + 0.3), { color: '#d61f45', above: false, size: 28, off: 46 });
      trendLine(ctx, ch, 0, P(0), 13, P(13), 46, prog(lt, highs - 0.2, highs + 0.8), { color: '#ff7b8f', width: 6 });
      badge(ctx, 'מגמת ירידה · הכל הפוך', prog(lt, 0.1, 0.45), '#d61f45', 300, W / 2, 42);
    },
  },
  d7: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('שיא,'), type: 'pop' }, { lt: s.cue('בוקר'), type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const { lt } = s, all = s.cue('הכל'), morning = s.cue('בוקר');
      drawBG(ctx, s.t, { glow: 1.15 });
      headlines(ctx, lt, [{ t: 'בלי חישובים · בלי הגדרות', at: all, y: 380, size: 62, color: C.neon }]);
      const items = [['שיא', s.cue('שיא,')], ['שפל', s.cue('שפל')], ['שבירה', s.cue('שבירה')], ['קו', s.cue('וקו')]];
      items.forEach(([t, c], k) => { const y = 560 + k * 160; popT(ctx, W / 2, y, prog(lt, c - 0.1, c + 0.25), () => { glass(ctx, 220, y - 62, 640, 124, 24); text(ctx, t, 760, y, { size: 56, weight: 900, align: 'right' }); check(ctx, 300, y, 34, 1); }); });
      popT(ctx, W / 2, 1250, prog(lt, morning, morning + 0.35), () => pill(ctx, 'ככה אני מתחיל כל בוקר', W / 2, 1250, { size: 44, color: '#b8860b', glow: 40 }));
    },
  },

  // ================= CH5: my early mistake =================
  ch5: { trans: 'glitch', captions: false, events: chapterEvents, draw(ctx, s) { chapterDraw(ctx, s, 5, 5, 'הטעות שעשיתי בהתחלה', 'STOP REACTING', { cueWord: 'הטעות' }); } },
  e1: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('ירוק'), type: 'pop' }, { lt: s.cue('אדום'), type: 'pop' }, { lt: s.cue('שחק'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, g = s.cue('ירוק'), r = s.cue('אדום'), played = s.cue('שחק');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 20, 34], [d, 22, 36]], { p: [61500, 64800] });
      ch.draw(ctx, { reveal: lerp(28, 34, prog(lt, 0, d)) });
      for (let i = 26; i < 34; i++) { const q = PA_C[i], t = g + (i - 26) * 0.35; if (lt < t) continue; const up = q.c >= q.o, y = ch.Y(up ? q.h : q.l) + (up ? -40 : 40);
        popT(ctx, ch.X(i), y, prog(lt, t, t + 0.2), () => pill(ctx, up ? 'קונה' : 'מוכר', ch.X(i), y, { size: 20, color: up ? '#0b8f63' : '#d61f45', pad: 8 })); }
      if (lt > played) { flashCol(ctx, lt, played); cross(ctx, W / 2, 860, 60, prog(lt, played, played + 0.3)); }
      badge(ctx, 'מגיב לכל תזוזה', prog(lt, 0.1, 0.45), '#d61f45', 300, W / 2, 44);
    },
  },
  e2: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מפסיק'), type: 'pop' }, { lt: s.cue('שלי'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, stop = s.cue('מפסיק'), mine = s.cue('שלי');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 14, 40], [d, 16, 40]], { p: [61000, 65200] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 32], [mine, 36.5], [d, 37.5]], E.lin)[0] });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 40, 1, { color: C.teal, width: 6 });
      ch.zone(ctx, TL(36) - 200, TL(36) + 200, 33, 40, { color: C.teal, alpha: 0.2, progress: prog(lt, stop, stop + 0.5) });
      if (lt > stop && lt < mine) text(ctx, '⏳', ch.X(38), ch.Y(TL(38)) - 80, { size: 60, alpha: 0.8 });
      if (lt > mine) { hit(ctx, ch.X(36), ch.Y(PA(36)), lt, mine, C.up, 200); check(ctx, ch.X(36) + 70, ch.Y(PA(36)) + 50, 26, prog(lt, mine, mine + 0.3)); }
      badge(ctx, 'מחכה שהמחיר יגיע לאזור', prog(lt, stop, stop + 0.35), '#0f766e', 300, W / 2, 42);
    },
  },
  e3: {
    trans: 'none',
    events: s => [{ lt: s.cue('קניות'), type: 'pop' }, { lt: s.cue('friend'), type: 'impact', k: 1 }, { lt: s.cue('תילחם'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chP, buys = s.cue('קניות'), fr = s.cue('friend'), fight = s.cue('תילחם');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 46], [d, 2, 46]], { p: [59300, 66600] });
      ch.draw(ctx, { reveal: 45, dim: 0.2 });
      trendLine(ctx, ch, 0, 60000, 13, PA(13), 46, 1, { color: C.teal, width: 6 });
      [13, 25, 36].forEach((i, k) => popT(ctx, ch.X(i), ch.Y(PA(i)) + 60, prog(lt, buys + k * 0.15, buys + k * 0.15 + 0.3), () => pill(ctx, 'BUY ✓', ch.X(i), ch.Y(PA(i)) + 60, { size: 24, color: '#0b8f63', pad: 10 })));
      [20, 32].forEach((i, k) => { const p = prog(lt, fight + k * 0.15, fight + k * 0.15 + 0.3); popT(ctx, ch.X(i), ch.Y(PA(i)) - 60, p, () => pill(ctx, 'SELL', ch.X(i), ch.Y(PA(i)) - 60, { size: 24, color: '#555', pad: 10 })); cross(ctx, ch.X(i) + 64, ch.Y(PA(i)) - 60, 18, p); });
      popT(ctx, W / 2, 300, prog(lt, fr - 0.2, fr + 0.2), () => pill(ctx, 'THE TREND IS YOUR FRIEND', W / 2, 300, { size: 44, color: '#0b8f63', glow: 45 }));
    },
  },
  e4: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('מתרחק'), type: 'whoosh' }, { lt: s.cue('עסקה'), type: 'impact', k: 0.9 }, { lt: s.cue('החלטה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, far = s.cue('מתרחק'), none = s.cue('עסקה'), dec = s.cue('החלטה');
      drawBG(ctx, s.t);
      const tf = (y, label, sub, col, p) => popT(ctx, W / 2, y, p, () => { glass(ctx, 140, y - 85, 800, 170, 28, { border: col, glowColor: col }); text(ctx, label, 860, y, { size: 74, weight: 800, fam: MONO, align: 'right' }); text(ctx, sub, 560, y, { size: 40, weight: 800, color: col, align: 'right' }); });
      tf(560, '15m', 'אין BOS ברור', '#d61f45', prog(lt, 0.1, 0.4));
      arrow(ctx, W / 2, 660, W / 2, 740, prog(lt, far - 0.1, far + 0.3), { color: C.purple2, width: 8, head: 26 });
      tf(840, '4H', 'מחפש כיוון', '#b8860b', prog(lt, far, far + 0.3));
      tf(1120, 'אין כיוון?', 'אין עסקה', '#d61f45', prog(lt, none - 0.2, none + 0.2));
      wipeText(ctx, 'טיפ ששמרתי לעצמי', W / 2, 330, prog(lt, 0, 0.35), { size: 62, weight: 900, color: C.gold });
      popT(ctx, W / 2, 1310, prog(lt, dec, dec + 0.35), () => pill(ctx, 'גם זו החלטה ✓', W / 2, 1310, { size: 42, color: '#0b8f63', glow: 35 }));
    },
  },

  // ================= outro =================
  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('אינדיקטורים'), type: 'pop' }, { lt: s.cue('BOS'), type: 'pop' }, { lt: s.cue('לסחור'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'בוא נסכם', [
        ['פחות אינדיקטורים', 'יותר מחיר', '#e0546b', s.cue('אינדיקטורים'), 'cross'],
        ['תתרחק · תמצא BOS', 'זה הכיוון', C.purple, s.cue('BOS'), 'zz'],
        ['קו מגמה', 'שם הקונים חוזרים', '#0fa36b', s.cue('לסחור'), 'check'],
      ]);
    },
  },
  bridge: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('נכנסים'), type: 'pop' }, { lt: s.cue('נגמרת'), type: 'pop' }, { lt: s.cue('הבא'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, half = s.cue('חצי'), enter = s.cue('נכנסים'), end = s.cue('נגמרת'), next = s.cue('הבא');
      drawBG(ctx, s.t, { glow: 1.3 });
      headlines(ctx, lt, [{ t: 'כיוון = רק חצי', at: half - 0.2, y: 400, size: 96 }]);
      seriesMap(ctx, lt, 1, enter - 0.3, 760, { list: SERIES_PA.slice(0, 3), done: 1 });
      popT(ctx, W / 2, 1050, prog(lt, enter, enter + 0.3), () => pill(ctx, 'מתי נכנסים?', W / 2, 1050, { size: 46, color: '#0b8f63' }));
      popT(ctx, W / 2, 1160, prog(lt, end, end + 0.3), () => pill(ctx, 'מתי המגמה נגמרת?', W / 2, 1160, { size: 46, color: '#d61f45' }));
      popT(ctx, W / 2, 1290, prog(lt, next - 0.1, next + 0.3), () => pill(ctx, 'בחלק 2 ←', W / 2, 1290, { size: 44, color: C.purple, glow: 45 }));
    },
  },
  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

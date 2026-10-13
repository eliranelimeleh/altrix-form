// Video 14 — Supply & Demand (base + explosive departure, fresh zones)
'use strict';
const SDP = [[0, 64800], [6, 63600], [10, 64000], [13, 62300]];
const SD = genCandles(SDP, { seed: 141, noise: 0.18 });
[[62300, 62200, 62340, 62120], [62200, 62280, 62330, 62090], [62280, 62240, 62350, 62150], [62240, 62320, 62360, 62180],
 [62320, 62950, 62980, 62300], [62950, 63700, 63730, 62930], [63700, 64300, 64340, 63680], [64300, 64600, 64680, 64250],
 [64600, 64400, 64650, 64300], [64400, 64150, 64480, 64080], [64150, 63900, 64200, 63820], [63900, 63550, 63950, 63480],
 [63550, 63200, 63600, 63150], [63200, 62900, 63280, 62850], [62900, 62650, 62980, 62600], [62650, 62480, 62700, 62420],
 [62480, 62420, 62520, 62200], [62420, 62900, 62950, 62380], [62900, 63500, 63560, 62860], [63500, 64100, 64160, 63450],
 [64100, 64600, 64680, 64050], [64600, 65000, 65080, 64550]]
  .forEach(([o, c, h, l], k) => { SD[14 + k] = { o, c, h, l }; });
SD[13].c = 62300;
const OZP = [[0, 63500], [6, 62000], [10, 63100], [14, 62050], [18, 62900], [22, 62100], [25, 62600], [30, 60800]];
const OZ = genCandles(OZP, { seed: 143 });
const chSD = new Chart(SD), chOZ = new Chart(OZ);
const DZ1 = 62360, DZ0 = 62080; // base: highest body .. lowest wick
const OZ1 = 62250, OZ0 = 61950;

function meter(ctx, v, label, col) {
  glass(ctx, 140, 490, 800, 150, 26, { border: col, glowColor: col });
  text(ctx, label, 900, 530, { size: 34, weight: 800, align: 'right', color: C.dim });
  ctx.save(); rrect(ctx, 180, 575, 720, 34, 17); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); rrect(ctx, 900 - 720 * v, 575, 720 * v, 34, 17); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fill(); ctx.restore();
  text(ctx, `${Math.round(v * 100)}%`, 240, 530, { size: 40, weight: 900, fam: MONO, color: col });
}
function boxAround(ctx, ch, i0, i1, p0, p1, col, p) {
  if (p <= 0) return; const x0 = ch.X(i0) - ch.cw() * 0.6, x1 = ch.X(i1) + ch.cw() * 0.6, y0 = ch.Y(p1), y1 = ch.Y(p0);
  ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.setLineDash([12, 9]); ctx.shadowColor = col; ctx.shadowBlur = 20;
  rrect(ctx, x0, y0 - 14, x1 - x0, y1 - y0 + 28, 12); ctx.stroke(); ctx.restore();
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('נשבר'), type: 'impact', k: 1.4 }, { lt: s.cue('הלא'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOZ, br = s.cue('נשבר'), wrong = s.cue('הלא');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 32], [d, 2, 32]], { p: [60500, 63900] });
      ch.zone(ctx, OZ1, OZ0, 0, 34, { color: lt > br ? C.down : C.up, alpha: 0.26, label: 'ביקוש' });
      ch.draw(ctx, { reveal: kf(lt, [[0, 24], [br, 28.5], [d, 31]], E.lin)[0] });
      if (lt > br) { ring(ctx, ch.X(27), ch.Y(OZ0), 240, prog(lt, br, br + 0.6), C.down); const f = Math.max(0, 1 - (lt - br) / 0.3); if (f > 0) { ctx.fillStyle = `rgba(255,40,70,${0.25 * f})`; ctx.fillRect(0, 0, W, H); } }
      if (lt < wrong - 0.1) wipeText(ctx, 'אזור הביקוש נשבר שוב?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 70, weight: 900 });
      else wipeText(ctx, 'סימנת במקום הלא נכון', W / 2, 300, prog(lt, wrong - 0.1, wrong + 0.25), { size: 72, weight: 900, color: '#ff5a72' });
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('Supply'), type: 'impact', k: 1.2 }, { lt: s.cue('איזון'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, he = s.cue('אזורי'), en = s.cue('Supply'), im = s.cue('איזון');
      drawBG(ctx, s.t, { glow: 1.3 });
      titleLock(ctx, lt, 'היצע וביקוש', 'SUPPLY & DEMAND', he, en, 620);
      const p = E.outBack(prog(lt, im, im + 0.6));
      if (p > 0) {
        glass(ctx, 140, 980, 800, 330, 30);
        text(ctx, 'חוסר איזון', W / 2, 1030, { size: 44, weight: 900, color: C.gold });
        ctx.save(); ctx.fillStyle = C.up; ctx.shadowColor = C.up; ctx.shadowBlur = 25; rrect(ctx, 600, 1260 - 190 * p, 180, 190 * p, 14); ctx.fill(); ctx.fillStyle = C.down; ctx.shadowColor = C.down; rrect(ctx, 300, 1260 - 50 * p, 180, 50 * p, 14); ctx.fill(); ctx.restore();
        text(ctx, 'קונים', 690, 1290, { size: 30, weight: 800, color: '#3df2a6' }); text(ctx, 'מוכרים', 390, 1290, { size: 30, weight: 800, color: '#ff5a72' });
      }
    },
  },

  base: {
    trans: 'whip',
    events: s => [{ lt: s.cue('בסיס'), type: 'pop' }, { lt: s.cue('יציאה'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSD, bs = s.cue('בסיס'), out = s.cue('יציאה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 26], [d, 6, 26]], { p: [61800, 65000] });
      const rev = kf(lt, [[0, 14], [bs + 0.4, 18], [out, 18], [out + 0.6, 22], [d, 23]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => (i >= 14 && i <= 17 && lt > bs) || (i >= 18 && i <= 21 && lt > out) });
      boxAround(ctx, ch, 14, 17, 62090, 62360, C.gold, prog(lt, bs, bs + 0.4));
      popT(ctx, ch.X(15.5), ch.Y(62090) + 60, prog(lt, bs, bs + 0.35), () => pill(ctx, 'בסיס', ch.X(15.5), ch.Y(62090) + 60, { size: 32, color: '#b8860b' }));
      arrow(ctx, ch.X(18) - 20, ch.Y(62500), ch.X(21) + 10, ch.Y(64500), prog(lt, out, out + 0.6), { color: C.up, width: 12, head: 46 });
      popT(ctx, ch.X(23), ch.Y(64900), prog(lt, out + 0.2, out + 0.5), () => pill(ctx, 'יציאה חדה', ch.X(23), ch.Y(64900), { size: 30, color: '#0b8f63' }));
    },
  },

  strength: {
    trans: 'none',
    events: s => [{ lt: s.cue('חזק'), type: 'impact', k: 1 }, { lt: s.cue('גדולים'), type: 'pop' }, { lt: s.cue('פתילים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSD, st = s.cue('חזק'), big = s.cue('גדולים'), wk = s.cue('פתילים');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(8, 26, 61500, 65800);
      ch.draw(ctx, { reveal: 22, highlight: i => i >= 18 && i <= 21, dim: 0.3 });
      meter(ctx, lerp(0.2, 1, E.outCubic(prog(lt, 0.2, st + 0.3))), 'כוח האזור', C.up);
      popT(ctx, ch.X(13), ch.Y(63600), prog(lt, big, big + 0.35), () => pill(ctx, 'נרות גדולים', ch.X(13), ch.Y(63600), { size: 32, color: '#0b8f63' }));
      popT(ctx, ch.X(13), ch.Y(63200), prog(lt, wk, wk + 0.35), () => pill(ctx, 'כמעט בלי פתילים', ch.X(13), ch.Y(63200), { size: 32, color: '#0b8f63' }));
      [18, 19, 20, 21].forEach((i, k) => ring(ctx, ch.X(i), ch.Y((SD[i].o + SD[i].c) / 2), 80, prog(lt, big + k * 0.1, big + k * 0.1 + 0.5), C.up));
    },
  },

  draw: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('מהגוף'), type: 'click' }, { lt: s.cue('הנמוך'), type: 'click' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSD, top = s.cue('מהגוף'), lo = s.cue('הנמוך');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 10, 22], [lo, 10, 22], [d, 10, 30]]), 61900, 62700);
      if (lt > lo) ch.zone(ctx, DZ1, DZ0, 13.5, lerp(17.5, 40, prog(lt, lo, lo + 0.8)), { color: C.up, alpha: 0.28 });
      ch.draw(ctx, { reveal: 18.4, highlight: i => i >= 14 && i <= 17 });
      ch.hline(ctx, DZ1, 13.5, 30, { color: '#3df2a6', width: 4, progress: prog(lt, top, top + 0.4) });
      ch.hline(ctx, DZ0, 13.5, 30, { color: '#3df2a6', width: 4, progress: prog(lt, lo, lo + 0.4) });
      popT(ctx, ch.X(12), ch.Y(DZ1) - 40, prog(lt, top, top + 0.3), () => pill(ctx, 'הגוף הגבוה', ch.X(12), ch.Y(DZ1) - 40, { size: 30, color: '#0b8f63' }));
      popT(ctx, ch.X(12), ch.Y(DZ0) + 44, prog(lt, lo, lo + 0.3), () => pill(ctx, 'הפתיל הנמוך', ch.X(12), ch.Y(DZ0) + 44, { size: 30, color: '#0b8f63' }));
      badge(ctx, 'רק את הבסיס', prog(lt, 0, 0.3), C.purple, 300, W / 2, 46);
    },
  },

  why: {
    trans: 'whip',
    events: s => [{ lt: s.cue('ישנים'), type: 'pop' }, ...[0, 1, 2].map(k => ({ lt: s.cue('שלוש') + k * 0.15, type: 'pop' }))],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOZ, old = s.cue('ישנים'), three = s.cue('שלוש');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 32], [d, 1, 32]], { p: [60500, 63900] });
      ch.zone(ctx, OZ1, OZ0, 0, 34, { color: C.gold, alpha: 0.22, label: lt > old ? 'אזור ישן' : null });
      ch.draw(ctx, { reveal: lt > three + 0.6 ? lerp(25, 31, prog(lt, three + 0.6, d)) : 25 });
      [6, 14, 22].forEach((i, k) => { const x = ch.X(i), y = ch.Y(OZ[i].l) + 70, p = prog(lt, three + k * 0.15, three + k * 0.15 + 0.3);
        popT(ctx, x, y, p, () => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fillStyle = '#d61f45'; ctx.shadowColor = '#d61f45'; ctx.shadowBlur = 20; ctx.fill(); ctx.restore(); text(ctx, String(k + 1), x, y + 2, { size: 36, weight: 900 }); }); });
      badge(ctx, 'נבדק 3 פעמים = חלש', prog(lt, three + 0.4, three + 0.7), '#d61f45', 300, W / 2, 44);
    },
  },

  fresh: {
    trans: 'whip',
    events: s => [{ lt: s.cue('טרי'), type: 'pop' }, { lt: s.cue('מחכות'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSD, fr = s.cue('טרי'), wt = s.cue('מחכות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 36], [d, 12, 37]], { p: [61800, 65300] });
      ch.zone(ctx, DZ1, DZ0, 14, 40, { color: C.up, alpha: 0.28, label: 'FRESH' });
      const rev = kf(lt, [[0, 26], [wt, 31], [d, 36]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      if (lt > wt - 0.4) { const r = rng(6); for (let k = 0; k < 6; k++) { const x = ch.X(17 + r() * 13), y = ch.Y(DZ0 + 40 + r() * 200); popT(ctx, x, y, prog(lt, wt - 0.4 + k * 0.06, wt - 0.1 + k * 0.06), () => pill(ctx, 'BUY', x, y, { size: 20, color: '#2962ff', pad: 10 })); } }
      if (rev > 31) { ring(ctx, ch.X(30), ch.Y(SD[30].l), 160, prog(lt, wt, wt + 0.6), C.up); arrow(ctx, ch.X(31), ch.Y(62700), ch.X(35.5), ch.Y(64800), prog(lt, wt + 0.2, wt + 0.8), { color: C.up, width: 12, head: 44 }); }
      badge(ctx, 'אזור טרי = הכי חזק', prog(lt, fr, fr + 0.35), '#0fa36b', 300, W / 2, 44);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Bar'), type: 'click' }, { lt: s.cue('אחורה'), type: 'whoosh' }, ...Array.from({ length: 8 }, (_, k) => ({ lt: s.cue('ותתאמן') + k * 0.25, type: 'tick' }))],
    draw(ctx, s) {
      const { lt, d } = s, ch = chSD, br = s.cue('Bar'), back = s.cue('אחורה'), prac = s.cue('ותתאמן'), spot = s.cue('לזהות');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(4, 36, 61800, 65300);
      const rev = lt < back ? 36 : lt < prac ? 22 : lerp(22, 36, prog(lt, prac, d - 0.2));
      if (lt > spot) ch.zone(ctx, DZ1, DZ0, 14, 40, { color: C.up, alpha: 0.28, progress: prog(lt, spot, spot + 0.5) });
      ch.draw(ctx, { reveal: rev });
      // replay toolbar button + cut line
      const bx = ch.p.x + 20, by = ch.p.y + 40; ctx.save(); rrect(ctx, bx, by - 24, 170, 48, 10); ctx.fillStyle = lt > br ? 'rgba(41,98,255,0.85)' : 'rgba(255,255,255,0.08)'; ctx.fill(); ctx.restore();
      text(ctx, '⏪ Replay', bx + 85, by + 1, { size: 26, weight: 800 });
      ring(ctx, bx + 85, by, 80, prog(lt, br, br + 0.5), '#2962ff');
      if (lt > back) {
        const x = ch.X(Math.floor(rev) - 0.5);
        ch.clip(ctx, () => { ctx.save(); ctx.strokeStyle = '#2962ff'; ctx.lineWidth = 4; ctx.shadowColor = '#2962ff'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(x, ch.p.y); ctx.lineTo(x, ch.p.y + ch.p.h); ctx.stroke(); ctx.restore(); });
        glass(ctx, 300, 1230, 480, 90, 45, { border: '#2962ff', glowColor: '#2962ff', glow: 25 });
        text(ctx, '⏮   ▶   ⏭    1x', W / 2, 1276, { size: 36, weight: 800, fam: MONO });
      }
      popT(ctx, W / 2, 300, prog(lt, br, br + 0.35), () => pill(ctx, 'Bar Replay', W / 2, 300, { size: 46, color: '#2962ff' }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('בסיס'), type: 'pop' }, { lt: s.cue('יציאה'), type: 'pop' }, { lt: s.cue('טריים'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['בסיס צפוף', 'נרות קטנים', C.purple, s.cue('בסיס'), 1],
        ['יציאה חדה', 'נרות גדולים', '#e0a100', s.cue('יציאה'), 2],
        ['רק אזורים טריים', 'שעוד לא נבדקו', '#0fa36b', s.cue('טריים'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

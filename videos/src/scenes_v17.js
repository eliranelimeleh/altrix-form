// Video 17 — Double Top & Head and Shoulders (+ inverse versions)
'use strict';
const DTP = [[0, 62500], [8, 64300], [12, 63700], [20, 66000], [25, 64500], [30, 65980], [34, 64400], [42, 63000]];
const DT = genCandles(DTP, { seed: 171 });
const HSP = [[0, 62800], [10, 64900], [14, 64200], [18, 65500], [22, 64300], [26, 66500], [30, 64400], [34, 65400], [38, 64200], [46, 62200]];
const HS = genCandles(HSP, { seed: 173 });
const mirror = cs => cs.map(q => ({ o: 129000 - q.o, c: 129000 - q.c, h: 129000 - q.l, l: 129000 - q.h }));
const DB = mirror(DT), IHS = mirror(HS);
const chDT = new Chart(DT), chHS = new Chart(HS), chDB = new Chart(DB), chIH = new Chart(IHS);
const NL = 64500, TGT1 = NL - (66000 - NL); // 63000
const HNL = 64350, HTGT = HNL - (66500 - HNL); // 62200

function letterM(ctx, ch, p) { ch.zigzag(ctx, [[12, 63700], [20, 66000], [25, 64500], [30, 65980], [34, 64400]], p, { color: C.gold, width: 8 }); }
function hsOutline(ctx, ch, p, col = C.gold) { ch.zigzag(ctx, [[14, 64200], [18, 65500], [22, 64300], [26, 66500], [30, 64400], [34, 65400], [38, 64200]], p, { color: col, width: 6 }); }

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('מאה'), type: 'pop' }, { lt: s.cue('ההיפוך'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chHS, cent = s.cue('מאה'), rev = s.cue('ההיפוך');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 48], [d, 8, 48]], { p: [61500, 67100] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 28], [rev, 40], [d, 46]], E.lin)[0], dim: 0.2 });
      hsOutline(ctx, ch, prog(lt, cent - 0.2, rev), 'rgba(255,201,77,0.9)');
      arrow(ctx, ch.X(38), ch.Y(64100), ch.X(45), ch.Y(62400), prog(lt, rev, rev + 0.5), { color: C.down, width: 14, head: 50 });
      if (lt < rev - 0.1) wipeText(ctx, 'דפוסים שחוזרים כבר 100 שנה', W / 2, 300, prog(lt, 0.05, 0.4), { size: 62, weight: 900 });
      else wipeText(ctx, 'ורואים את ההיפוך לפני כולם', W / 2, 300, prog(lt, rev - 0.1, rev + 0.25), { size: 62, weight: 900, color: C.gold });
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('Double'), type: 'impact', k: 1.1 }, { lt: s.cue('וראש'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt } = s, dt = s.cue('Double'), hs = s.cue('וראש');
      drawBG(ctx, s.t, { glow: 1.3 });
      wipeText(ctx, 'שני דפוסי ההיפוך הכי חזקים', W / 2, 420, prog(lt, 0, 0.4), { size: 64, weight: 900 });
      const sketch = (x, pts, p) => { ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.shadowColor = C.gold; ctx.shadowBlur = 25; ctx.beginPath();
        const n = Math.max(2, Math.ceil(pts.length * p)); pts.slice(0, n).forEach(([dx, dy], k) => k ? ctx.lineTo(x + dx, 900 + dy) : ctx.moveTo(x + dx, 900 + dy)); ctx.stroke(); ctx.restore(); };
      [[W / 2 + 230, 'DOUBLE TOP', [[-130, 120], [-70, -110], [0, 20], [70, -110], [130, 120]], dt], [W / 2 - 230, 'ראש וכתפיים', [[-150, 120], [-100, -40], [-60, 40], [0, -140], [60, 40], [100, -40], [150, 120]], hs]].forEach(([x, lab, pts, t0]) => {
        const p = prog(lt, t0 - 0.05, t0 + 0.5); if (p <= 0) return;
        popT(ctx, x, 920, Math.min(1, p * 2), () => { glass(ctx, x - 200, 680, 400, 480, 32, { border: C.gold, glowColor: C.gold, glow: 30 }); text(ctx, lab, x, 1090, { size: lab.length > 8 ? 46 : 52, weight: 900, color: C.gold }); });
        sketch(x, pts, p);
      });
    },
  },

  dtop: {
    trans: 'whip',
    events: s => [{ lt: s.cue('פעמיים'), type: 'pop' }, { lt: s.cue('ונכשל'), type: 'impact', k: 1.1 }, { lt: s.cue('M'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chDT, two = s.cue('פעמיים'), fail = s.cue('ונכשל'), m = s.cue('M');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 38], [d, 8, 38]], { p: [62600, 66700] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 22], [two + 0.3, 31], [d, 33]], E.lin)[0], dim: 0.3 * prog(lt, m - 0.2, m + 0.2) });
      ch.hline(ctx, 66000, 18, 34, { color: '#ff8095', width: 3, dash: [10, 8], progress: prog(lt, two, two + 0.4) });
      [20, 30].forEach((i, k) => { ch.dot(ctx, i, DTP.find(p => p[0] === i)[1], prog(lt, two + k * 0.3, two + k * 0.3 + 0.3), C.gold, 14); ring(ctx, ch.X(i), ch.Y(66000), 100, prog(lt, two + k * 0.3, two + k * 0.3 + 0.6), C.gold); });
      cross(ctx, ch.X(30), ch.Y(66000) - 70, 30, prog(lt, fail, fail + 0.35));
      letterM(ctx, ch, prog(lt, m - 0.3, m + 0.5));
      popT(ctx, W / 2, 300, prog(lt, m, m + 0.35), () => text(ctx, 'M', W / 2, 300, { size: 120, weight: 900, color: C.gold, glow: 50 }));
    },
  },

  neck: {
    trans: 'none',
    events: s => [{ lt: s.cue('שובר'), type: 'impact', k: 1.4 }, { lt: s.cue('Neckline'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chDT, mid = s.cue('שבאמצע'), br = s.cue('שובר'), nl = s.cue('Neckline');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 38], [d, 10, 40]], { p: [62600, 66700] });
      const rev = kf(lt, [[0, 33], [br + 0.3, 35.5], [d, 37]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      letterM(ctx, ch, 1);
      const broke = rev > 35;
      ch.hline(ctx, NL, 25, 40, { color: broke ? C.down : '#ffffff', width: broke ? 6 : 4, dash: broke ? null : [12, 10], progress: prog(lt, mid - 0.2, mid + 0.4) });
      if (broke) { ring(ctx, ch.X(35), ch.Y(NL), 220, prog(lt, br + 0.2, br + 0.8), C.down); burst(ctx, ch.X(35), ch.Y(NL), prog(lt, br + 0.2, br + 1), '#ff5a72', 24, 3, 240); }
      ch.tag(ctx, 29, NL, 'NECKLINE', prog(lt, nl, nl + 0.35), { color: C.purple, size: 34, above: false, off: 46 });
      badge(ctx, 'האישור: שבירת השפל באמצע', prog(lt, br, br + 0.35), '#d61f45', 300, W / 2, 40);
    },
  },

  hs: {
    trans: 'whip',
    events: s => [{ lt: s.cue('כתף', 0), type: 'pop' }, { lt: s.cue('ראש'), type: 'pop' }, { lt: s.cue('וכתף'), type: 'pop' }, { lt: s.cue('נחלשים'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chHS, ls = s.cue('כתף', 0), hd = s.cue('ראש'), rs = s.cue('וכתף'), wk = s.cue('נחלשים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 42], [d, 10, 42]], { p: [62800, 67200] });
      ch.draw(ctx, { reveal: kf(lt, [[0, 20], [rs + 0.3, 36], [d, 38]], E.lin)[0], dim: 0.3 });
      hsOutline(ctx, ch, prog(lt, ls - 0.2, rs + 0.4));
      [[18, 65500, 'כתף', ls], [26, 66500, 'ראש', hd], [34, 65400, 'כתף', rs]].forEach(([i, p, t, t0]) => ch.tag(ctx, i, p, t, prog(lt, t0, t0 + 0.35), { color: '#b8860b', size: 32 }));
      if (lt > wk) [[18, 26], [26, 34]].forEach(([a, b], k) => arrow(ctx, ch.X(a), ch.Y(HSP.find(q => q[0] === a)[1]) - 90, ch.X(b), ch.Y(HSP.find(q => q[0] === b)[1]) - 90, prog(lt, wk + k * 0.2, wk + k * 0.2 + 0.4), { color: k ? C.down : C.up, width: 6, head: 22 }));
      badge(ctx, 'הקונים נחלשים', prog(lt, wk, wk + 0.35), '#d61f45', 300, W / 2, 46);
    },
  },

  target: {
    trans: 'none',
    events: s => [{ lt: s.cue('הגובה'), type: 'pop' }, { lt: s.cue('ומעתיקים'), type: 'whoosh' }, { lt: s.cue('השבירה'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chHS, ht = s.cue('הגובה'), cp = s.cue('ומעתיקים'), brk = s.cue('השבירה');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 10, 42], [d, 12, 48]], { p: [61600, 67200] });
      ch.hline(ctx, HNL, 22, 50, { color: '#ffffff', width: 4 });
      ch.hline(ctx, HTGT, 37, 50, { color: '#3df2a6', width: 5, progress: prog(lt, brk, brk + 0.4) });
      ch.draw(ctx, { reveal: kf(lt, [[0, 38], [brk, 39], [d, 47]], E.lin)[0], dim: 0.2 });
      hsOutline(ctx, ch, 1);
      const x1 = ch.X(26); arrow(ctx, x1, ch.Y(66500), x1, ch.Y(HNL), prog(lt, ht - 0.1, ht + 0.4), { color: C.gold, width: 8, head: 28 });
      popT(ctx, x1 - 150, ch.Y((66500 + HNL) / 2), prog(lt, ht, ht + 0.3), () => pill(ctx, 'גובה', x1 - 150, ch.Y((66500 + HNL) / 2), { size: 30, color: '#b8860b' }));
      const x2 = ch.X(38); arrow(ctx, x2, ch.Y(HNL), x2, ch.Y(HTGT), prog(lt, cp, cp + 0.6), { color: C.gold, width: 8, head: 28 });
      popT(ctx, x2 + 150, ch.Y(HTGT), prog(lt, brk, brk + 0.3), () => pill(ctx, 'TARGET', x2 + 150, ch.Y(HTGT), { size: 30, color: '#0b8f63' }));
    },
  },

  bottom: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('Bottom'), type: 'pop' }, { lt: s.cue('הפוך', 1), type: 'pop' }, { lt: s.cue('ירידה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, db = s.cue('Bottom'), ih = s.cue('הפוך', 1), end = s.cue('ירידה');
      drawBG(ctx, s.t);
      chDB.layout(40, 360, 1000, 470, { head: 70 }).view(6, 40); chDB.draw(ctx, { reveal: lerp(20, 40, prog(lt, db - 0.3, ih)), lastTag: false });
      chDB.zigzag(ctx, [[12, 129000 - 63700], [20, 129000 - 66000], [25, 129000 - 64500], [30, 129000 - 65980], [34, 129000 - 64400]], prog(lt, db, db + 0.6), { color: C.up, width: 6 });
      popT(ctx, 820, 470, prog(lt, db, db + 0.35), () => pill(ctx, 'DOUBLE BOTTOM · W', 820, 470, { size: 28, color: '#0b8f63' }));
      chIH.layout(40, 870, 1000, 470, { head: 70 }).view(8, 46); chIH.draw(ctx, { reveal: lerp(30, 46, prog(lt, ih - 0.3, end + 0.5)), lastTag: false });
      chIH.zigzag(ctx, [[14, 129000 - 64200], [18, 129000 - 65500], [22, 129000 - 64300], [26, 129000 - 66500], [30, 129000 - 64400], [34, 129000 - 65400], [38, 129000 - 64200]], prog(lt, ih, ih + 0.6), { color: C.up, width: 6 });
      popT(ctx, 800, 980, prog(lt, ih, ih + 0.35), () => pill(ctx, 'ראש וכתפיים הפוך', 800, 980, { size: 28, color: '#0b8f63' }));
      badge(ctx, 'בסוף מגמת ירידה', prog(lt, end, end + 0.35), '#0fa36b', 300, W / 2, 44);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Patterns'), type: 'click' }, { lt: s.cue('Head'), type: 'click' }, ...Array.from({ length: 7 }, (_, k) => ({ lt: s.cue('שמסמן') + k * 0.12, type: 'click' }))],
    draw(ctx, s) {
      const { lt, d } = s, ch = chHS, pt = s.cue('Patterns'), hd = s.cue('Head'), mk = s.cue('שמסמן');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(8, 42, 62800, 67200);
      ch.draw(ctx, { reveal: 39, dim: 0.15 });
      const at = tvToolbar(ctx, 40, 466, 870, lt > pt ? 'ruler' : null), [px, py] = at('ruler');
      // tool polygon
      const pts = [[14, 64200], [18, 65500], [22, 64300], [26, 66500], [30, 64400], [34, 65400], [38, 64200]];
      const n = lt > mk ? Math.min(7, Math.floor((lt - mk) / 0.12) + 1) : 0;
      if (n > 1) {
        ch.clip(ctx, () => { ctx.save(); ctx.beginPath(); pts.slice(0, n).forEach(([i, p], k) => k ? ctx.lineTo(ch.X(i), ch.Y(p)) : ctx.moveTo(ch.X(i), ch.Y(p))); ctx.closePath(); ctx.fillStyle = 'rgba(41,98,255,0.18)'; ctx.fill();
          ctx.strokeStyle = '#2962ff'; ctx.lineWidth = 4; ctx.beginPath(); pts.slice(0, n).forEach(([i, p], k) => k ? ctx.lineTo(ch.X(i), ch.Y(p)) : ctx.moveTo(ch.X(i), ch.Y(p))); ctx.stroke(); ctx.restore(); });
        if (n >= 7) [['Left Shoulder', 18, 65500], ['Head', 26, 66500], ['Right Shoulder', 34, 65400]].forEach(([t, i, p]) => text(ctx, t, ch.X(i), ch.Y(p) - 30, { size: 24, weight: 800, color: '#8fb0ff' }));
      }
      // patterns menu
      const pm = prog(lt, pt, pt + 0.25) * (1 - prog(lt, hd + 0.2, hd + 0.4));
      if (pm > 0) {
        ctx.save(); ctx.globalAlpha = pm; glass(ctx, px + 50, py - 40, 440, 380, 18, { fill: 'rgba(22,16,40,0.98)' });
        text(ctx, 'PATTERNS', px + 80, py, { size: 22, weight: 800, align: 'left', color: C.axis, fam: MONO });
        ['XABCD Pattern', 'Cypher Pattern', 'Head and Shoulders', 'Triangle Pattern', 'Three Drives Pattern'].forEach((r, k) => {
          const y = py + 55 + k * 60, hot = r === 'Head and Shoulders';
          if (hot && lt > hd - 0.3) { rrect(ctx, px + 62, y - 26, 416, 52, 10); ctx.fillStyle = 'rgba(168,85,247,0.45)'; ctx.fill(); }
          text(ctx, r, px + 80, y, { size: 28, weight: hot ? 800 : 500, align: 'left', color: hot ? '#fff' : C.dim });
        });
        ctx.restore();
      }
      const c = lt < mk ? kf(lt, [[0, 700, 1150], [pt - 0.3, px, py], [pt + 0.1, px, py], [hd - 0.2, px + 200, py + 175], [mk, ch.X(14), ch.Y(64200)]]) : (() => { const k = Math.min(6, Math.floor((lt - mk) / 0.12)); return [ch.X(pts[k][0]), ch.Y(pts[k][1])]; })();
      cursor(ctx, c[0], c[1], lt > mk && lt < mk + 0.85 ? 0.6 : Math.max(Math.exp(-Math.abs(lt - pt) * 14), Math.exp(-Math.abs(lt - hd) * 14)), 1.15);
      popT(ctx, W / 2, 300, prog(lt, hd, hd + 0.35), () => pill(ctx, 'Head and Shoulders', W / 2, 300, { size: 44, color: '#2962ff' }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('שני'), type: 'pop' }, { lt: s.cue('שבירת'), type: 'pop' }, { lt: s.cue('ויעד'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['2 או 3 שיאים', 'Double Top · ראש וכתפיים', C.purple, s.cue('שני'), 'M'],
        ['שבירת Neckline', 'זה האישור', '#e0a100', s.cue('שבירת'), 'warn'],
        ['יעד לפי הגובה', 'מעתיקים מטה מהשבירה', '#0fa36b', s.cue('ויעד'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

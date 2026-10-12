// Video 12 — פסיכולוגיה: FOMO, Revenge Trading, rules, journal, Paper Trading
'use strict';
const FOP = [[0, 62000], [6, 62600], [9, 62300], [20, 65800], [27, 64300], [31, 64700], [34, 64250], [44, 66600]];
const FO = genCandles(FOP, { seed: 121, noise: 0.18 });
const chFO = new Chart(FO);
const FE20 = emaSeries(FO, 12);

function equity(ctx, x, y, w, h, vals, p, col) {
  const n = vals.length, mx = Math.max(...vals), mn = 0, X = k => x + 40 + k / (n - 1) * (w - 80), Y = v => y + h - 40 - (v - mn) / (mx - mn) * (h - 90);
  glass(ctx, x, y, w, h, 28, { border: col, glowColor: col });
  const m = p * (n - 1);
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(X(0), Y(vals[0]));
  for (let k = 1; k <= Math.ceil(m) && k < n; k++) { const f = Math.min(1, m - (k - 1)); ctx.lineTo(lerp(X(k - 1), X(k), f), lerp(Y(vals[k - 1]), Y(vals[k]), f)); }
  ctx.stroke(); ctx.restore();
  const k = Math.min(n - 1, Math.floor(m)), f = m - k, cur = k < n - 1 ? lerp(vals[k], vals[k + 1], f) : vals[n - 1];
  return cur;
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('הפסדת'), type: 'pop' }, { lt: s.cue('נכנסת'), type: 'click' }, { lt: s.cue('מוחקים'), type: 'impact', k: 1.5 }],
    draw(ctx, s) {
      const { lt, d } = s, l1 = s.cue('הפסדת'), again = s.cue('נכנסת'), wipe = s.cue('מוחקים');
      drawBG(ctx, s.t, { hue: lt > wipe ? 40 : 0 });
      const vals = [10000, 9800, 9300, 8200, 6100, 3200];
      const p = kf(lt, [[0, 0], [l1 + 0.3, 0.2], [again, 0.25], [wipe, 1]], E.lin)[0];
      const cur = equity(ctx, 80, 470, 920, 640, vals, p, p > 0.5 ? C.down : C.purple);
      text(ctx, 'יתרת החשבון', 940, 530, { size: 34, weight: 700, color: C.dim, align: 'right' });
      text(ctx, '$' + fmt(cur), 140, 530, { size: 56, weight: 900, color: p > 0.5 ? '#ff5a72' : '#fff', align: 'left', fam: FONT });
      const lab = ['הפסד', 'עוד עסקה', 'גדולה יותר', 'ועוד אחת'];
      lab.forEach((t, k) => { const pk = prog(lt, l1 + k * (wipe - l1) / 4, l1 + k * (wipe - l1) / 4 + 0.3); popT(ctx, 230 + k * 210, 1180, pk, () => pill(ctx, t, 230 + k * 210, 1180, { size: 26, color: '#d61f45', pad: 14 })); });
      if (lt < again - 0.1) wipeText(ctx, 'הפסדת עסקה?', W / 2, 300, prog(lt, l1 - 0.1, l1 + 0.25), { size: 80, weight: 900 });
      else if (lt < wipe - 0.1) wipeText(ctx, 'ומיד נכנסת לעוד אחת?', W / 2, 300, prog(lt, again - 0.1, again + 0.25), { size: 72, weight: 900, color: C.gold });
      const pw = prog(lt, wipe - 0.1, wipe + 0.25);
      if (pw > 0) { scrim(ctx, 0.55 * pw); popT(ctx, W / 2, 800, pw, () => text(ctx, 'ככה מוחקים', W / 2, 800, { size: 150, weight: 900, color: '#ff5a72', glow: 60, glowColor: '#ff1744' })); popT(ctx, W / 2, 970, prog(lt, wipe + 0.15, wipe + 0.45), () => text(ctx, 'חשבונות', W / 2, 970, { size: 150, weight: 900, color: '#ff5a72', glow: 60, glowColor: '#ff1744' })); }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('FOMO'), type: 'impact', k: 1.2 }, { lt: s.cue('Revenge'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt } = s, f = s.cue('FOMO'), r = s.cue('Revenge');
      drawBG(ctx, s.t, { glow: 1.3, hue: 30 });
      wipeText(ctx, 'שני האויבים הכי גדולים', W / 2, 420, prog(lt, 0, 0.4), { size: 72, weight: 900 });
      wipeText(ctx, 'הם לא השוק', W / 2, 530, prog(lt, s.cue('השוק') - 0.1, s.cue('השוק') + 0.3), { size: 60, weight: 800, color: C.dim });
      [[W / 2 + 230, 'FOMO', 'פחד לפספס', f], [W / 2 - 230, 'REVENGE', 'מסחר נקמה', r]].forEach(([x, en, he, t0]) => {
        popT(ctx, x, 880, prog(lt, t0 - 0.05, t0 + 0.35), () => {
          glass(ctx, x - 200, 680, 400, 420, 32, { border: C.down, glowColor: C.down, glow: 45 });
          text(ctx, en, x, 830, { size: en.length > 4 ? 66 : 96, weight: 900, color: '#ff5a72', glow: 30, glowColor: '#ff1744' });
          text(ctx, he, x, 950, { size: 44, weight: 800 });
        });
      });
    },
  },

  fomo: {
    trans: 'whip',
    events: s => [{ lt: s.cue('טס'), type: 'riser' }, { lt: s.cue('מאוחר'), type: 'click' }, { lt: s.cue('בשיא'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFO, fly = s.cue('טס'), late = s.cue('מאוחר'), top = s.cue('בשיא');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 30], [d, 2, 30]], { p: [61600, 66400] });
      const rev = kf(lt, [[0, 10], [late, 21], [top + 0.1, 21.5], [d, 26]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      const x = ch.X(20), y = ch.Y(65900);
      popT(ctx, x - 150, y, prog(lt, late, late + 0.3), () => pill(ctx, 'BUY בלי תוכנית', x - 150, y, { size: 30, color: '#2962ff' }));
      cross(ctx, x - 150, y + 70, 28, prog(lt, top, top + 0.3));
      if (lt > top) { ring(ctx, x, ch.Y(65800), 160, prog(lt, top, top + 0.6), C.down); }
      badge(ctx, 'קנית בדיוק בשיא', prog(lt, top, top + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },

  fomofix: {
    trans: 'none',
    events: s => [{ lt: s.cue('פספסת'), type: 'pop' }, { lt: s.cue('הבאה'), type: 'pop' }, { lt: s.cue('לתיקון'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFO, ms = s.cue('פספסת'), nx = s.cue('הבאה'), fix = s.cue('לתיקון');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 2, 30], [d, 8, 44]], { p: [61600, 67000] });
      const rev = kf(lt, [[0, 26], [fix, 34.5], [d, 42]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      lineSeries(ctx, ch, FE20, rev, { color: C.teal, width: 4, alpha: 0.8 });
      if (lt > fix) { ring(ctx, ch.X(34), ch.Y(FO[34].l), 140, prog(lt, fix, fix + 0.6), C.up); }
      popT(ctx, ch.X(34) - 140, ch.Y(FO[34].l) + 50, prog(lt, fix, fix + 0.35), () => pill(ctx, 'כניסה בתיקון', ch.X(34) - 140, ch.Y(FO[34].l) + 50, { size: 30, color: '#0b8f63' }));
      check(ctx, ch.X(34) - 140, ch.Y(FO[34].l) + 120, 26, prog(lt, fix + 0.1, fix + 0.45));
      if (lt < nx) badge(ctx, 'פספסת? פספסת', prog(lt, ms, ms + 0.35), C.purple, 300, W / 2, 46);
      else badge(ctx, 'תמיד יש עסקה הבאה', prog(lt, nx, nx + 0.35), '#0fa36b', 300, W / 2, 44);
    },
  },

  revenge: {
    trans: 'whip',
    events: s => [{ lt: s.cue('הפסד'), type: 'pop' }, { lt: s.cue('מגדיל'), type: 'riser' }, { lt: s.cue('עוד'), type: 'impact', k: 1.5 }],
    draw(ctx, s) {
      const { lt, d } = s, loss = s.cue('הפסד'), up = s.cue('מגדיל'), more = s.cue('עוד');
      drawBG(ctx, s.t, { hue: 40 });
      popT(ctx, W / 2, 300, prog(lt, 0, 0.3), () => pill(ctx, 'REVENGE TRADING', W / 2, 300, { size: 48, color: '#d61f45', glow: 40 }));
      card(ctx, 70, 420, 940, 900, C.down);
      const bars = [[1, -100, loss], [2, -220, up], [4, -480, up + 0.4], [8, -1050, more]];
      text(ctx, 'גודל פוזיציה', 950, 480, { size: 34, weight: 800, align: 'right', color: C.dim });
      text(ctx, 'הפסד', 950, 900, { size: 34, weight: 800, align: 'right', color: '#ff5a72' });
      bars.forEach(([sz, pl, t0], k) => {
        const p = E.outBack(prog(lt, t0 - 0.05, t0 + 0.4)), x = 780 - k * 200;
        if (p <= 0) return;
        ctx.save(); ctx.fillStyle = C.purple2; ctx.shadowColor = C.purple; ctx.shadowBlur = 20; const hh = sz * 42 * p; ctx.fillRect(x - 50, 860 - hh, 100, hh); ctx.restore();
        text(ctx, `x${sz}`, x, 860 - sz * 42 * p - 30, { size: 34, weight: 900, fam: MONO });
        ctx.save(); ctx.fillStyle = C.down; ctx.shadowColor = C.down; ctx.shadowBlur = 20; const lh = -pl / 1050 * 300 * p; ctx.fillRect(x - 50, 930, 100, lh); ctx.restore();
        text(ctx, `-$${fmt(-pl)}`, x, 930 + lh + 30, { size: 28, weight: 800, fam: MONO, color: '#ff5a72' });
      });
      arrow(ctx, 860, 1200, 160, 1200, prog(lt, up, more + 0.3), { color: C.down, width: 8, head: 30 });
    },
  },

  rules: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('שני'), type: 'pop' }, { lt: s.cue('מזיזים'), type: 'pop' }, { lt: s.cue('מגדילים'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, '3 חוקים שעוצרים את זה', [
        ['2 הפסדים ביום?', 'סוגרים את המסך', '#d61f45', s.cue('שני'), 1],
        ['לא מזיזים סטופ', 'באמצע עסקה', '#e0a100', s.cue('מזיזים'), 2],
        ['לא מגדילים פוזיציה', 'אחרי הפסד', C.purple, s.cue('מגדילים'), 3],
      ]);
    },
  },

  journal: {
    trans: 'whip',
    events: s => [{ lt: s.cue('יומן'), type: 'pop' }, ...Array.from({ length: 10 }, (_, k) => ({ lt: s.cue('למה') + k * 0.08, type: 'tick' })), { lt: s.cue('הדפוסים'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt } = s, jr = s.cue('יומן'), why = s.cue('למה'), feel = s.cue('הרגשת'), pat = s.cue('הדפוסים');
      drawBG(ctx, s.t);
      popT(ctx, W / 2, 300, prog(lt, jr, jr + 0.35), () => pill(ctx, 'יומן מסחר', W / 2, 300, { size: 50, color: C.purple, glow: 40 }));
      glass(ctx, 80, 420, 920, 900, 30, { fill: 'rgba(20,14,38,0.92)' });
      for (let k = 0; k < 9; k++) { ctx.save(); ctx.fillStyle = 'rgba(180,140,255,0.08)'; ctx.fillRect(120, 560 + k * 80, 840, 2); ctx.restore(); }
      const rows = [['12.10 · BTC · Long', 'ריטסט לתמיכה', 'רגוע', false], ['13.10 · ETH · Long', 'המחיר טס', 'FOMO', true], ['14.10 · BTC · Short', 'בלי סיבה ברורה', 'FOMO', true]];
      text(ctx, 'עסקה', 940, 500, { size: 30, weight: 800, color: C.dim, align: 'right' }); text(ctx, 'למה נכנסתי', 640, 500, { size: 30, weight: 800, color: C.dim, align: 'right' }); text(ctx, 'הרגשה', 240, 500, { size: 30, weight: 800, color: C.dim, align: 'right' });
      rows.forEach(([tr, rs, fl, bad], k) => {
        const y = 610 + k * 200, p1 = prog(lt, why + k * 0.25, why + k * 0.25 + 0.4), p2 = prog(lt, feel + k * 0.2, feel + k * 0.2 + 0.3);
        if (p1 > 0) { text(ctx, tr, 940, y, { size: 30, weight: 700, fam: MONO, align: 'right', alpha: p1 }); wipeText(ctx, rs, 640, y + 60, p1, { size: 36, weight: 800, align: 'right' }); }
        const hl = bad && lt > pat;
        popT(ctx, 180, y + 60, p2, () => pill(ctx, fl, 180, y + 60, { size: 30, color: bad ? '#d61f45' : '#0b8f63', glow: hl ? 40 + 20 * Math.sin(lt * 10) : 14 }));
      });
      popT(ctx, W / 2, 1250, prog(lt, pat, pat + 0.35), () => pill(ctx, 'דפוס: FOMO חוזר', W / 2, 1250, { size: 38, color: '#d61f45', glow: 40 }));
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Paper'), type: 'pop' }, { lt: s.cue('תתאמן'), type: 'click' }, { lt: s.cue('וירטואלי'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chFO, pp = s.cue('Paper'), pr = s.cue('תתאמן'), vr = s.cue('וירטואלי');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 640).view(10, 44, 61600, 67000);
      ch.draw(ctx, { reveal: 42 });
      const pb = E.outCubic(prog(lt, pp - 0.1, pp + 0.4));
      if (pb > 0) {
        ctx.save(); ctx.globalAlpha = pb; ctx.translate(0, (1 - pb) * 200);
        glass(ctx, 40, 1030, 1000, 310, 24, { fill: 'rgba(16,12,30,0.98)' });
        text(ctx, 'Paper Trading', 80, 1080, { size: 34, weight: 800, align: 'left' });
        text(ctx, 'Account Balance', 80, 1150, { size: 26, weight: 500, align: 'left', color: C.axis });
        text(ctx, '100,000.00 USD', 80, 1200, { size: 44, weight: 800, align: 'left', fam: MONO, color: '#3df2a6' });
        const btn = (x, t, col, on) => { rrect(ctx, x, 1235, 200, 76, 16); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = on ? 40 : 0; ctx.fill(); ctx.shadowBlur = 0; text(ctx, t, x + 100, 1274, { size: 34, weight: 900 }); };
        btn(600, 'SELL', '#d61f45', false); btn(820, 'BUY', '#2962ff', lt > pr);
        ctx.restore();
        const c = kf(lt, [[pp, 700, 900], [pr - 0.1, 920, 1275], [d, 920, 1275]]); cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - pr) * 14), 1.15);
        ring(ctx, 920, 1273, 90, prog(lt, pr, pr + 0.5));
      }
      popT(ctx, W / 2, 300, prog(lt, vr, vr + 0.35), () => pill(ctx, 'כסף וירטואלי · 0 סיכון', W / 2, 300, { size: 40, color: '#0b8f63' }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('FOMO'), type: 'pop' }, { lt: s.cue('נקמה'), type: 'pop' }, { lt: s.cue('ותוכנית'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['בלי FOMO', 'מחכים לתיקון', '#d61f45', s.cue('FOMO'), 'cross'],
        ['בלי נקמה', 'אחרי הפסד עוצרים', '#e0a100', s.cue('נקמה'), 'warn'],
        ['תוכנית', 'לפני כל עסקה', '#0fa36b', s.cue('ותוכנית'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};
function card(ctx, x, y, w, h, col) { glass(ctx, x, y, w, h, 28, { border: col, glowColor: col, glow: 30 }); }

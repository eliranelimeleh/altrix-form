// Video 7 — ניהול סיכון (1% rule, 1:2 R:R, position size, Long Position tool)
'use strict';
const RKP = [[0, 63000], [7, 64400], [11, 63700], [18, 65200], [23, 64300], [30, 66100], [34, 65400]];
const RK = genCandles(RKP, { seed: 71, noise: 0.2 });
const chRK = new Chart(RK);
const EN = 65450, SL = 64950, TP = 66450; // 1R = 500, 2R = 1000

function card(ctx, x, y, w, h, col) { glass(ctx, x, y, w, h, 28, { border: col, glowColor: col, glow: 30 }); }
function counter(ctx, v, x, y, o = {}) { text(ctx, (o.prefix || '') + fmt(v, o.dec || 0) + (o.suffix || ''), x, y, { size: o.size || 120, weight: 900, color: o.color || '#fff', fam: o.fam || FONT, glow: o.glow ?? 30, glowColor: o.color || C.purple }); }
function posTool(ctx, ch, i0, i1, p, o = {}) { // TradingView long-position style boxes
  const { risk = 1, reward = 1, labels = true } = o;
  ch.zone(ctx, SL, EN, i0, i1, { color: C.down, alpha: 0.25, progress: risk });
  ch.zone(ctx, EN, TP, i0, i1, { color: C.up, alpha: 0.22, progress: reward });
  ch.hline(ctx, EN, i0, i1, { color: '#fff', width: 3, progress: Math.max(risk, reward) });
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [...Array.from({ length: 10 }, (_, k) => ({ lt: s.cue('לצדוק') + k * 0.07, type: 'tick' })), { lt: s.cue('למחוק'), type: 'impact', k: 1.4 }, { lt: s.cue('הסיכון'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ok = s.cue('לצדוק'), wipe = s.cue('למחוק'), str = s.cue('האסטרטגיה'), rk = s.cue('ניהול');
      drawBG(ctx, s.t, { hue: lt > wipe ? 40 : 0 });
      const out = 1 - prog(lt, rk - 0.2, rk);
      ctx.save(); ctx.globalAlpha = out;
      wipeText(ctx, '7 מתוך 10 עסקאות ברווח', W / 2, 360, prog(lt, ok - 0.1, ok + 0.3), { size: 64, weight: 900 });
      for (let k = 0; k < 10; k++) { // trade grid
        const x = 190 + (k % 5) * 175, y = 520 + Math.floor(k / 5) * 175, win = ![2, 5, 8].includes(k);
        (win ? check : cross)(ctx, x, y, 58, prog(lt, ok + k * 0.07, ok + k * 0.07 + 0.3));
      }
      // balance draining
      const drain = E.inCubic(prog(lt, wipe - 0.4, wipe + 0.3)), bal = lerp(10000, 0, drain);
      glass(ctx, 140, 860, 800, 230, 30, { border: drain > 0.5 ? C.down : C.purple });
      text(ctx, 'יתרת החשבון', 860, 910, { size: 38, weight: 700, color: C.dim, align: 'right' });
      counter(ctx, bal, W / 2, 1010, { prefix: '$', size: 110, color: drain > 0.5 ? '#ff5a72' : '#fff', fam: FONT });
      ctx.save(); rrect(ctx, 180, 1060, 720 * (1 - drain), 14, 7); ctx.fillStyle = drain > 0.5 ? C.down : C.up; ctx.fill(); ctx.restore();
      if (lt > str) { popT(ctx, W / 2, 1230, prog(lt, str, str + 0.3), () => { text(ctx, 'הבעיה: האסטרטגיה?', W / 2, 1230, { size: 60, weight: 900, color: C.dim }); }); cross(ctx, W / 2 - 330, 1230, 30, prog(lt, str + 0.2, str + 0.5)); }
      ctx.restore();
      const pr = prog(lt, rk - 0.1, rk + 0.3);
      if (pr > 0) {
        popT(ctx, W / 2, 800, pr, () => text(ctx, 'ניהול סיכון', W / 2, 800, { size: 170, weight: 900, color: C.purple2, glow: 60, glowColor: C.purple }));
        ring(ctx, W / 2, 800, 650, prog(lt, rk, rk + 0.7));
        text(ctx, 'RISK MANAGEMENT', W / 2, 980, { size: 66, weight: 900, color: C.neon, spacing: lerp(50, 14, E.outExpo(pr)), alpha: pr });
      }
    },
  },

  rule1: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('אחוז'), type: 'impact', k: 1.3 }, { lt: s.cue('עשרת'), type: 'pop' }, { lt: s.cue('מאה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, pc = s.cue('אחוז'), acc = s.cue('עשרת'), hund = s.cue('מאה');
      drawBG(ctx, s.t, { glow: 1.3 });
      popT(ctx, W / 2, 300, prog(lt, 0, 0.3), () => pill(ctx, 'חוק #1', W / 2, 300, { size: 46, color: C.purple }));
      popT(ctx, W / 2, 640, prog(lt, pc - 0.05, pc + 0.35), () => text(ctx, '1%', W / 2, 640, { size: 330, weight: 900, color: C.purple2, glow: 80, glowColor: C.purple }));
      ring(ctx, W / 2, 640, 600, prog(lt, pc, pc + 0.7));
      wipeText(ctx, 'מקסימום סיכון לעסקה', W / 2, 860, prog(lt, pc + 0.2, pc + 0.6), { size: 60, weight: 800 });
      const pa = prog(lt, acc - 0.05, acc + 0.35);
      if (pa > 0) {
        popT(ctx, 740, 1090, pa, () => { card(ctx, 560, 990, 400, 200, C.purple); text(ctx, 'החשבון', 900, 1040, { size: 34, weight: 700, color: C.dim, align: 'right' }); counter(ctx, 10000 * E.outCubic(pa), 760, 1120, { prefix: '$', size: 72 }); });
        arrow(ctx, 545, 1090, 470, 1090, prog(lt, hund - 0.2, hund), { color: C.purple2, width: 10, head: 34 });
        popT(ctx, 300, 1090, prog(lt, hund - 0.05, hund + 0.35), () => { card(ctx, 120, 990, 360, 200, '#0fa36b'); text(ctx, 'סיכון', 440, 1040, { size: 34, weight: 700, color: C.dim, align: 'right' }); counter(ctx, 100, 300, 1120, { prefix: '$', size: 80, color: '#3df2a6' }); });
      }
    },
  },

  why: {
    trans: 'whip',
    events: s => [{ lt: s.cue('עשרה'), type: 'riser' }, { lt: s.cue('תשעים'), type: 'impact', k: 1.2 }, { lt: s.cue('במשחק'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, ten = s.cue('עשרה'), ninety = s.cue('תשעים'), game = s.cue('במשחק');
      drawBG(ctx, s.t);
      if (lt < game) wipeText(ctx, '10 הפסדים ברצף', W / 2, 330, prog(lt, ten - 0.1, ten + 0.3), { size: 72, weight: 900, color: '#ff5a72' });
      const x0 = 120, base = 1250, hmax = 700, bw = 62, gap = 12;
      card(ctx, 70, 420, 940, 900, C.purple);
      const p = prog(lt, ten, ninety - 0.1);
      for (let k = 0; k <= 10; k++) {
        const pk = clamp((p * 10.5 - k) * 1.5); if (pk <= 0) continue;
        const a = Math.pow(0.99, k), b = Math.pow(0.9, k), x = x0 + 30 + k * (bw + gap);
        ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = C.down; ctx.fillRect(x, base - hmax * b * pk, bw * 0.45, hmax * b * pk); ctx.restore();
        ctx.save(); ctx.fillStyle = C.up; ctx.shadowColor = C.up; ctx.shadowBlur = 14; ctx.fillRect(x + bw * 0.5, base - hmax * a * pk, bw * 0.45, hmax * a * pk); ctx.restore();
      }
      text(ctx, 'סיכון 1%', 940, 480, { size: 34, weight: 800, color: '#3df2a6', align: 'right' });
      text(ctx, 'סיכון 10%', 940, 525, { size: 34, weight: 800, color: '#ff5a72', align: 'right', alpha: 0.8 });
      const pn = prog(lt, ninety - 0.05, ninety + 0.35);
      popT(ctx, 760, 700, pn, () => pill(ctx, 'נשאר 90%', 760, 700, { size: 52, color: '#0b8f63', glow: 40 }));
      popT(ctx, 760, 1080, pn, () => pill(ctx, 'נשאר 35%', 760, 1080, { size: 38, color: '#d61f45' }));
      badge(ctx, 'ואתה עדיין במשחק', prog(lt, game, game + 0.35), '#0fa36b', 330, W / 2, 46);
    },
  },

  rr: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מסכן'), type: 'pop' }, { lt: s.cue('שניים'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRK, risk = s.cue('מסכן'), two = s.cue('שניים');
      drawBG(ctx, s.t);
      popT(ctx, W / 2, 300, prog(lt, 0, 0.3), () => pill(ctx, 'חוק #2 · יחס סיכון סיכוי', W / 2, 300, { size: 42, color: C.purple }));
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 12, 40], [d, 14, 40]]), 63800, 66900);
      posTool(ctx, ch, 34, 40, 1, { risk: prog(lt, risk - 0.1, risk + 0.4), reward: prog(lt, two - 0.3, two + 0.3) });
      ch.draw(ctx, { reveal: 35 });
      if (lt > risk) popT(ctx, ch.X(37), ch.Y((EN + SL) / 2), prog(lt, risk, risk + 0.3), () => pill(ctx, '$1 סיכון · 1R', ch.X(37), ch.Y((EN + SL) / 2), { size: 30, color: '#d61f45' }));
      if (lt > two - 0.2) popT(ctx, ch.X(37), ch.Y((EN + TP) / 2), prog(lt, two - 0.2, two + 0.2), () => pill(ctx, '$2 סיכוי · 2R', ch.X(37), ch.Y((EN + TP) / 2), { size: 34, color: '#0b8f63' }));
    },
  },

  math: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('אחד'), type: 'pop' }, ...Array.from({ length: 10 }, (_, k) => ({ lt: s.cue('בארבעים') + k * 0.08, type: 'tick' })), { lt: s.cue('ברווח'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt } = s, r = s.cue('אחד'), f = s.cue('בארבעים'), win = s.cue('ברווח');
      drawBG(ctx, s.t, { glow: 1.2 });
      popT(ctx, W / 2, 330, prog(lt, r - 0.05, r + 0.3), () => pill(ctx, 'יחס 1:2', W / 2, 330, { size: 52, color: C.purple, glow: 40 }));
      let sum = 0;
      for (let k = 0; k < 10; k++) {
        const w = k % 5 === 0 || k % 5 === 3, p = prog(lt, f + k * 0.08, f + k * 0.08 + 0.3), x = 190 + (k % 5) * 175, y = 560 + Math.floor(k / 5) * 190;
        if (p > 0.5) sum += w ? 2 : -1;
        popT(ctx, x, y, p, () => { glass(ctx, x - 70, y - 70, 140, 140, 24, { border: w ? C.up : C.down, glowColor: w ? C.up : C.down, glow: 18 });
          text(ctx, w ? '+2R' : '−1R', x, y + 2, { size: 44, weight: 900, color: w ? '#3df2a6' : '#ff5a72', fam: MONO }); });
      }
      wipeText(ctx, '40% הצלחה בלבד', W / 2, 960, prog(lt, f + 0.2, f + 0.6), { size: 64, weight: 900 });
      if (lt > f) { text(ctx, 'סה״כ', W / 2 + 170, 1110, { size: 60, weight: 800, color: C.dim }); text(ctx, `${sum > 0 ? '+' : ''}${sum}R`, W / 2 - 60, 1110, { size: 100, weight: 900, color: sum > 0 ? '#3df2a6' : '#ff5a72', glow: lt > win ? 50 : 20, fam: MONO }); }
      const pw = prog(lt, win, win + 0.35);
      popT(ctx, W / 2, 1260, pw, () => pill(ctx, 'ואתה ברווח', W / 2, 1260, { size: 50, color: '#0b8f63', glow: 40 }));
      if (pw > 0) burst(ctx, W / 2, 1110, prog(lt, win, win + 0.9), '#3df2a6', 30, 2, 380);
    },
  },

  size: {
    trans: 'whip',
    events: s => [{ lt: s.cue('רחוק'), type: 'pop' }, { lt: s.cue('קרוב'), type: 'pop' }, { lt: s.cue('הסטופ'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, st = s.cue('הסטופ'), far = s.cue('רחוק'), near = s.cue('קרוב');
      drawBG(ctx, s.t);
      popT(ctx, W / 2, 300, prog(lt, 0, 0.3), () => pill(ctx, 'חוק #3 · גודל פוזיציה', W / 2, 300, { size: 42, color: C.purple }));
      popT(ctx, W / 2, 420, prog(lt, st, st + 0.35), () => text(ctx, 'גודל = סיכון ÷ מרחק הסטופ', W / 2, 420, { size: 56, weight: 900, color: C.gold, glow: 25 }));
      const box = (y, lab, dist, qty, col, t0, k) => {
        const p = prog(lt, t0 - 0.05, t0 + 0.35); if (p <= 0) return;
        ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate((1 - E.outBack(p)) * (k ? 500 : -500), 0);
        card(ctx, 80, y, 920, 380, col);
        text(ctx, lab, 940, y + 60, { size: 46, weight: 900, align: 'right' });
        const ex = 220, ey = y + 110; // entry->stop distance arrow
        ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ex - 70, ey); ctx.lineTo(ex + 70, ey); ctx.stroke();
        ctx.strokeStyle = C.down; ctx.beginPath(); ctx.moveTo(ex - 70, ey + dist); ctx.lineTo(ex + 70, ey + dist); ctx.stroke(); ctx.restore();
        arrow(ctx, ex, ey + 6, ex, ey + dist - 6, 1, { color: C.down, width: 6, head: 22, glow: 10 });
        text(ctx, 'כניסה', ex + 90, ey, { size: 26, weight: 700, align: 'left', color: C.dim }); text(ctx, 'סטופ', ex + 90, ey + dist, { size: 26, weight: 700, align: 'left', color: '#ff5a72' });
        text(ctx, 'סיכון $100', 940, y + 150, { size: 40, weight: 800, align: 'right', color: C.dim });
        text(ctx, qty, 560, y + 150, { size: 46, weight: 800, align: 'right', color: col === C.up ? '#3df2a6' : C.purple2, fam: MONO });
        const bw = qty === '0.4 BTC' ? 520 : 130; rrect(ctx, 940 - bw * E.outCubic(p), y + 230, bw * E.outCubic(p), 70, 14);
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
        text(ctx, 'גודל פוזיציה', 940, y + 335, { size: 28, weight: 700, align: 'right', color: C.dim });
        ctx.restore();
      };
      box(500, 'סטופ רחוק ($1,000)', 220, '0.1 BTC', C.purple, far, 0);
      box(920, 'סטופ קרוב ($250)', 60, '0.4 BTC', C.up, near, 1);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('Long') - 0.2, type: 'click' }, { lt: s.cue('כניסה'), type: 'click' }, { lt: s.cue('סטופ'), type: 'pop' }, { lt: s.cue('ויעד'), type: 'pop' }, { lt: s.cue('מחשב'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chRK, tool = s.cue('Long') - 0.2, en = s.cue('כניסה'), sl = s.cue('סטופ'), tp = s.cue('ויעד'), calc = s.cue('מחשב');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(10, 40, 63800, 66900);
      posTool(ctx, ch, 34, 40, 1, { risk: prog(lt, sl - 0.1, sl + 0.3), reward: prog(lt, tp - 0.1, tp + 0.3) });
      ch.hline(ctx, EN, 34, 40, { color: '#fff', width: 3, progress: prog(lt, en - 0.1, en + 0.3) });
      ch.draw(ctx, { reveal: 35 });
      const at = tvToolbar(ctx, 40, 466, 870, lt > tool ? 'pos' : null), [px, py] = at('pos');
      const c = kf(lt, [[0, 700, 1150], [tool - 0.3, px, py], [tool + 0.2, px, py], [en, ch.X(34), ch.Y(EN)], [sl, ch.X(36), ch.Y(SL)], [tp, ch.X(38), ch.Y(TP)], [d, ch.X(38), ch.Y(TP)]]);
      cursor(ctx, c[0], c[1], Math.max(Math.exp(-Math.abs(lt - tool) * 14), Math.exp(-Math.abs(lt - en) * 14)), 1.15);
      ring(ctx, px, py, 70, prog(lt, tool, tool + 0.5));
      if (lt > tp) { text(ctx, 'Target: 1,000 (2.00R)', ch.X(37), ch.Y(TP) - 22, { size: 22, weight: 700, fam: MONO, color: '#3df2a6' }); text(ctx, 'Stop: 500', ch.X(37), ch.Y(SL) + 24, { size: 22, weight: 700, fam: MONO, color: '#ff8095' }); }
      const pc = prog(lt, calc - 0.05, calc + 0.3);
      if (pc > 0) {
        ctx.save(); ctx.globalAlpha = pc; const bx = 150, by = 520 + (1 - E.outCubic(pc)) * 40, bw = 620;
        glass(ctx, bx, by, bw, 330, 24, { fill: 'rgba(22,16,40,0.97)' });
        text(ctx, 'Long Position', bx + 36, by + 52, { size: 32, weight: 800, align: 'left' });
        [['Account size', '10,000'], ['Risk', '1%'], ['Qty', '0.2'], ['Risk/Reward', '2.00']].forEach(([k, v], j) => {
          text(ctx, k, bx + 36, by + 120 + j * 56, { size: 28, weight: 500, align: 'left', color: C.axis });
          text(ctx, v, bx + bw - 36, by + 120 + j * 56, { size: 30, weight: 800, align: 'right', fam: MONO, color: j === 3 ? '#3df2a6' : '#fff' });
        });
        ctx.restore();
      }
      popT(ctx, W / 2, 300, prog(lt, tool, tool + 0.35), () => pill(ctx, 'Long Position', W / 2, 300, { size: 46, color: C.purple }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('אחוז'), type: 'pop' }, { lt: s.cue('יחס'), type: 'pop' }, { lt: s.cue('וגודל'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, '3 החוקים', [
        ['1% לעסקה', 'לא יותר', C.purple, s.cue('אחוז'), 1],
        ['יחס של 1:2', 'סיכון מול סיכוי', '#e0a100', s.cue('יחס'), 2],
        ['גודל לפי הסטופ', 'ולא לפי תחושה', '#0fa36b', s.cue('וגודל'), 3],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

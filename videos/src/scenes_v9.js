// Video 9 — Order Blocks
'use strict';
const OBP = [[0, 64800], [5, 63900], [9, 64500], [14, 63400], [17, 63900], [19, 63500]];
const OB = genCandles(OBP, { seed: 91, noise: 0.18 });
[[63500, 63650, 63700, 63450], [63650, 63320, 63700, 63250], [63320, 63900, 63950, 63300], [63900, 64550, 64600, 63860], [64550, 64900, 64980, 64500],
 [64900, 65100, 65150, 64850], [65100, 64950, 65120, 64880], [64950, 64600, 65000, 64550], [64600, 64200, 64650, 64150], [64200, 63900, 64250, 63850],
 [63900, 63650, 63950, 63600], [63650, 63600, 63720, 63380], [63600, 64100, 64150, 63560], [64100, 64700, 64750, 64050], [64700, 65200, 65260, 64650],
 [65200, 65500, 65560, 65150], [65500, 65800, 65880, 65440]]
  .forEach(([o, c, h, l], k) => { OB[19 + k] = { o, c, h, l }; });
const chOB = new Chart(OB);
const OH = 63700, OL = 63250, BOSO = 64500, OBI = 20;

function minis(ctx, x, y, list, hiIdx, p) { // simple candle sketch for definitions
  list.forEach(([o, c, h, l], k) => {
    const pk = clamp((p * list.length - k) * 1.5); if (pk <= 0) return;
    const cx = x + k * 130, sc = 0.55, Y = v => y - (v - 100) * sc * 4, col = c >= o ? C.up : C.down, on = k === hiIdx;
    ctx.save(); ctx.globalAlpha *= pk; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 8; ctx.shadowColor = on ? C.gold : col; ctx.shadowBlur = on ? 50 : 18;
    ctx.beginPath(); ctx.moveTo(cx, Y(h)); ctx.lineTo(cx, Y(l)); ctx.stroke(); rrect(ctx, cx - 40, Math.min(Y(o), Y(c)), 80, Math.abs(Y(o) - Y(c)) + 4, 8); ctx.fill(); ctx.restore();
    if (on) { ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.setLineDash([10, 8]); ctx.strokeRect(cx - 60, Y(h) - 20, 120, Y(l) - Y(h) + 40); ctx.restore(); }
  });
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('עקבות'), type: 'pop' }, { lt: s.cue('Order'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOB, tr = s.cue('עקבות'), ob = s.cue('Order');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 6, 36], [d, 8, 36]], { p: [62900, 66200] });
      ch.zone(ctx, OH, OL, OBI, 40, { color: C.gold, alpha: (0.15 + 0.15 * Math.sin(lt * 7)) * prog(lt, tr, tr + 0.3) });
      ch.draw(ctx, { reveal: kf(lt, [[0, 18], [tr, 36], [d, 36]], E.lin)[0], highlight: i => i === OBI && lt > tr });
      if (lt > tr) ring(ctx, ch.X(OBI), ch.Y(63480), 150, prog(lt, tr, tr + 0.6), C.gold);
      if (lt < tr - 0.1) wipeText(ctx, 'המוסדות לא נכנסים בבת אחת', W / 2, 300, prog(lt, 0.05, 0.4), { size: 60, weight: 900 });
      else if (lt < ob - 0.1) wipeText(ctx, 'הם משאירים עקבות בגרף', W / 2, 300, prog(lt, tr - 0.1, tr + 0.25), { size: 64, weight: 900, color: C.gold });
      const po = prog(lt, ob - 0.1, ob + 0.3);
      if (po > 0) { scrim(ctx, 0.55 * po); popT(ctx, W / 2, 840, po, () => text(ctx, 'ORDER BLOCK', W / 2, 840, { size: 130, weight: 900, color: C.purple2, glow: 60, glowColor: C.purple })); ring(ctx, W / 2, 840, 640, prog(lt, ob, ob + 0.7)); }
    },
  },

  what: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('האחרון'), type: 'impact', k: 1 }, { lt: s.cue('תנועה'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt } = s, last = s.cue('האחרון'), mv = s.cue('תנועה');
      drawBG(ctx, s.t, { glow: 1.2 });
      wipeText(ctx, 'מה זה Order Block?', W / 2, 330, prog(lt, 0, 0.35), { size: 66, weight: 900, color: C.purple2 });
      minis(ctx, 200, 1000, [[130, 112, 134, 105], [112, 100, 115, 92], [100, 125, 128, 98], [125, 160, 164, 122], [160, 190, 196, 156]], 1, prog(lt, 0.1, mv + 0.3));
      popT(ctx, 330, 1150, prog(lt, last, last + 0.35), () => pill(ctx, 'הנר ההפוך האחרון', 330, 1150, { size: 34, color: '#b8860b' }));
      arrow(ctx, 470, 900, 770, 520, prog(lt, mv, mv + 0.5), { color: C.up, width: 12, head: 46 });
      popT(ctx, 720, 440, prog(lt, mv, mv + 0.35), () => pill(ctx, 'תנועה חזקה', 720, 440, { size: 34, color: '#0b8f63' }));
    },
  },

  find: {
    trans: 'whip',
    events: s => [{ lt: s.cue('האדום'), type: 'pop' }, { lt: s.cue('הזינוק'), type: 'whoosh' }, { lt: s.cue('האזור'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOB, red = s.cue('האדום'), jump = s.cue('הזינוק'), zone = s.cue('האזור');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 4, 28], [d, 8, 28]], { p: [62900, 65500] });
      ch.zone(ctx, OH, OL, OBI, 40, { color: C.gold, alpha: 0.28, progress: prog(lt, zone, zone + 0.5) });
      ch.draw(ctx, { reveal: 25, dim: 0.4 * prog(lt, red, red + 0.3), highlight: i => i === OBI || (lt > jump && i > OBI && i < 24) });
      ring(ctx, ch.X(OBI), ch.Y(63480), 130, prog(lt, red, red + 0.6), C.gold);
      arrow(ctx, ch.X(21), ch.Y(63500), ch.X(24), ch.Y(65000), prog(lt, jump, jump + 0.5), { color: C.up, width: 12, head: 44 });
      popT(ctx, ch.X(OBI) - 120, ch.Y(OL) + 60, prog(lt, zone, zone + 0.35), () => pill(ctx, 'ORDER BLOCK', ch.X(OBI) - 60, ch.Y(OL) + 60, { size: 30, color: '#b8860b' }));
    },
  },

  valid: {
    trans: 'none',
    events: s => [{ lt: s.cue('שברה'), type: 'impact', k: 1.2 }, { lt: s.cue('בלי'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOB, br = s.cue('שברה'), no = s.cue('בלי');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 8, 28], [d, 5, 28]], { p: [62900, 65500] });
      ch.zone(ctx, OH, OL, OBI, 40, { color: C.gold, alpha: 0.28 });
      ch.draw(ctx, { reveal: 25 });
      const ok = lt > br;
      ch.hline(ctx, BOSO, 9, 30, { color: ok ? C.purple2 : 'rgba(255,255,255,0.8)', dash: ok ? null : [12, 10], width: ok ? 6 : 4, progress: prog(lt, 0, 0.6) });
      ch.tag(ctx, 14, BOSO, 'BOS', prog(lt, br, br + 0.35), { color: C.purple, size: 40, off: 44 });
      if (ok) { ring(ctx, ch.X(22), ch.Y(BOSO), 200, prog(lt, br, br + 0.6)); check(ctx, ch.X(OBI), ch.Y(OL) + 80, 34, prog(lt, br + 0.2, br + 0.5)); }
      badge(ctx, 'התנועה שברה מבנה', prog(lt, br, br + 0.35), '#0fa36b', 300, W / 2, 44);
      badge(ctx, 'בלי BOS = אין Order Block', prog(lt, no, no + 0.35), '#d61f45', 1270, W / 2, 36);
    },
  },

  mark: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('מהגבוה'), type: 'click' }, { lt: s.cue('הנמוך'), type: 'click' }, { lt: s.cue('ימינה'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOB, hi = s.cue('מהגבוה'), lo = s.cue('הנמוך'), rt = s.cue('ימינה');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 14, 27], [rt, 14, 27], [d, 12, 34]]), 62900, 64600);
      const ext = lerp(OBI + 0.5, 40, E.inOut(prog(lt, rt, rt + 0.8)));
      if (lt > lo) ch.zone(ctx, OH, OL, OBI - 0.5, ext, { color: C.gold, alpha: 0.3 });
      ch.draw(ctx, { reveal: 25, highlight: i => i === OBI });
      ch.hline(ctx, OH, OBI - 0.5, ext, { color: C.gold, width: 4, progress: prog(lt, hi, hi + 0.3) });
      ch.hline(ctx, OL, OBI - 0.5, ext, { color: C.gold, width: 4, progress: prog(lt, lo, lo + 0.3) });
      popT(ctx, ch.X(OBI) - 150, ch.Y(OH), prog(lt, hi, hi + 0.3), () => pill(ctx, 'High', ch.X(OBI) - 150, ch.Y(OH), { size: 30, color: '#b8860b' }));
      popT(ctx, ch.X(OBI) - 150, ch.Y(OL), prog(lt, lo, lo + 0.3), () => pill(ctx, 'Low', ch.X(OBI) - 150, ch.Y(OL), { size: 30, color: '#b8860b' }));
      arrow(ctx, ch.X(OBI) + 60, ch.Y((OH + OL) / 2), ch.X(OBI) + 320, ch.Y((OH + OL) / 2), prog(lt, rt, rt + 0.5), { color: C.gold, width: 8, head: 30 });
    },
  },

  ret: {
    trans: 'none',
    events: s => [{ lt: s.cue('חוזר'), type: 'whoosh' }, { lt: s.cue('משלימים'), type: 'pop' }, { lt: s.cue('מזנק'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOB, back = s.cue('חוזר'), fill = s.cue('משלימים'), jump = s.cue('מזנק');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 12, 34], [jump, 12, 37], [d, 14, 38]]), 62900, 66200);
      const rev = kf(lt, [[0, 25], [back + 0.4, 30], [fill + 0.3, 31], [jump + 0.1, 32], [d, 36]], E.lin)[0];
      const inz = rev > 29.5 && lt < jump + 0.3;
      ch.zone(ctx, OH, OL, OBI, 40, { color: C.gold, alpha: inz ? 0.3 + 0.15 * Math.sin(lt * 12) : 0.25 });
      ch.draw(ctx, { reveal: rev });
      if (lt > fill) { const r = rng(4); for (let k = 0; k < 6; k++) { const x = ch.X(22 + r() * 9), y = ch.Y(OL + 80 + r() * 340); popT(ctx, x, y, prog(lt, fill + k * 0.08, fill + k * 0.08 + 0.3), () => pill(ctx, 'BUY', x, y, { size: 20, color: '#2962ff', glow: 12, pad: 10 })); } }
      arrow(ctx, ch.X(31), ch.Y(63900), ch.X(35.5), ch.Y(65700), prog(lt, jump, jump + 0.5), { color: C.up, width: 12, head: 46 });
      badge(ctx, 'המוסדות משלימים פקודות', prog(lt, fill, fill + 0.35), '#2962ff', 300, W / 2, 40);
    },
  },

  entry: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('כניסה'), type: 'pop' }, { lt: s.cue('סטופ'), type: 'pop' }, { lt: s.cue('ויעד'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOB, en = s.cue('כניסה'), sl = s.cue('סטופ'), tp = s.cue('ויעד');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(14, 38, 62900, 66200);
      const E1 = 63550, S1 = 63150, T1 = 65100;
      ch.zone(ctx, OH, OL, OBI, 40, { color: C.gold, alpha: 0.2 });
      ch.zone(ctx, S1, E1, 30, 38, { color: C.down, progress: prog(lt, sl, sl + 0.4), alpha: 0.24 });
      ch.zone(ctx, E1, T1, 30, 38, { color: C.up, progress: prog(lt, tp, tp + 0.4), alpha: 0.22 });
      ch.draw(ctx, { reveal: lt > tp ? lerp(31, 36, prog(lt, tp, d)) : 31 });
      const lab = (p, t, col, t0) => { ch.hline(ctx, p, 30, 38, { color: col, width: 4, progress: prog(lt, t0, t0 + 0.4) }); popT(ctx, ch.X(17.5), ch.Y(p), prog(lt, t0, t0 + 0.35), () => pill(ctx, t, ch.X(17.5), ch.Y(p), { size: 30, color: col })); };
      lab(E1, 'ENTRY · בתוך הבלוק', '#2962ff', en);
      lab(S1, 'STOP · מתחת לבלוק', '#d61f45', sl);
      lab(T1, 'TARGET · השיא הבא', '#0b8f63', tp);
    },
  },

  fresh: {
    trans: 'whip',
    events: s => [{ lt: s.cue('טרי'), type: 'impact', k: 1 }, { lt: s.cue('נגיעה'), type: 'pop' }, { lt: s.cue('מחלישה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOB, fr = s.cue('טרי'), t1 = s.cue('נגיעה'), wk = s.cue('מחלישה');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(10, 40, 62900, 66600);
      const strength = lt < t1 ? 100 : lt < wk ? lerp(100, 60, prog(lt, t1, t1 + 0.4)) : lerp(60, 25, prog(lt, wk, wk + 0.4));
      const col = strength > 70 ? C.up : strength > 40 ? C.gold : C.down;
      ch.zone(ctx, OH, OL, OBI, 42, { color: col, alpha: 0.12 + 0.2 * strength / 100 });
      ch.draw(ctx, { reveal: 36, dim: 0.2 });
      glass(ctx, 140, 490, 800, 150, 26, { border: col, glowColor: col });
      text(ctx, 'כוח הבלוק', 900, 530, { size: 34, weight: 800, align: 'right', color: C.dim });
      ctx.save(); rrect(ctx, 180, 575, 720, 34, 17); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); rrect(ctx, 900 - 720 * strength / 100, 575, 720 * strength / 100, 34, 17); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fill(); ctx.restore();
      text(ctx, `${Math.round(strength)}%`, 240, 530, { size: 40, weight: 900, fam: MONO, color: col });
      popT(ctx, W / 2, 300, prog(lt, fr, fr + 0.35), () => pill(ctx, lt < t1 ? 'FRESH · טרי = החזק ביותר' : 'כל נגיעה מחלישה', W / 2, 300, { size: 40, color: lt < t1 ? '#0b8f63' : '#d61f45' }));
      [[30, t1], [34.5, wk]].forEach(([i, t0], k) => { if (lt > t0) { const x = ch.X(i), y = ch.Y(OH); ring(ctx, x, y, 110, prog(lt, t0, t0 + 0.6), C.down); popT(ctx, x, y - 60 - k * 60, prog(lt, t0, t0 + 0.3), () => pill(ctx, `נגיעה ${k + 1}`, x, y - 60 - k * 60, { size: 26, color: '#d61f45' })); } });
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...Array.from({ length: 10 }, (_, k) => ({ lt: s.cue('באינדיקטורים') + 0.1 + k * 0.06, type: 'tick' })), { lt: s.cue('סקריפט'), type: 'click' }, { lt: s.cue('הסימון'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chOB, op = s.cue('באינדיקטורים'), pk = s.cue('סקריפט'), cmp = s.cue('הסימון');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(6, 38, 62900, 66200);
      const pb = prog(lt, pk + 0.2, pk + 0.7);
      ch.zone(ctx, OH, OL, OBI, 38, { color: '#2962ff', progress: pb, alpha: 0.25 });
      ch.zone(ctx, 65150, 64880, 24, 38, { color: '#f23645', progress: prog(lt, pk + 0.4, pk + 0.9), alpha: 0.2 });
      ch.draw(ctx, { reveal: 36 });
      if (pb > 0) { text(ctx, 'Bull OB', ch.X(37), ch.Y(OH) - 18, { size: 22, weight: 800, color: '#8fb0ff', alpha: pb, align: 'right' }); text(ctx, 'Bear OB', ch.X(37), ch.Y(65150) - 18, { size: 22, weight: 800, color: '#ff8095', alpha: pb, align: 'right' }); }
      if (lt > cmp) { ch.zone(ctx, OH, OL, OBI, 38, { color: C.gold, alpha: 0.0 }); ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.strokeRect(ch.X(OBI) - 20, ch.Y(OH) - 8, ch.X(38) - ch.X(OBI) + 20, ch.Y(OL) - ch.Y(OH) + 16); ctx.restore(); check(ctx, ch.X(OBI) - 80, ch.Y(OL) + 60, 30, prog(lt, cmp, cmp + 0.35)); }
      indicatorDialog(ctx, lt, 'Order Blocks', [['Order Blocks', 'Community'], ['Order Block Finder', 'Community'], ['Smart Money Concepts', 'Community']], op, pk);
      badge(ctx, 'בדוק את הסימון שלך', prog(lt, cmp, cmp + 0.35), '#b8860b', 300, W / 2, 42);
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('נר'), type: 'pop' }, { lt: s.cue('שבירת'), type: 'pop' }, { lt: s.cue('וכניסה'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['נר הפוך אחרון', 'לפני תנועה חזקה', C.purple, s.cue('נר'), 1],
        ['שבירת מבנה', 'אחריו, חובה', '#e0a100', s.cue('שבירת'), 2],
        ['כניסה בחזרה', 'כשהמחיר חוזר לבלוק', '#0fa36b', s.cue('וכניסה'), 3],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

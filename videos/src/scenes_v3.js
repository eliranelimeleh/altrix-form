// Video 3 — נזילות (Liquidity)
'use strict';
const LQP = [[0, 63000], [8, 65200], [13, 64300], [20, 66400], [25, 65300], [32, 66410], [38, 65450], [43, 66300], [54, 64200]];
const LQ = override(genCandles(LQP, { seed: 23, noise: 0.18 }), {
  43: { o: 66050, c: 66300, h: 66360, l: 65980 },
  44: { o: 66300, c: 66110, h: 66820, l: 66080 },
  45: { o: 66110, c: 65660, h: 66170, l: 65610 },
  46: { o: 65660, c: 65420, h: 65720, l: 65330 },
});
const chLQ = new Chart(LQ);
const EQH = 66400, STOP = 66520;
const HI = [8, 20, 32], LO = [13, 25, 38];
const PV = i => LQP.find(p => p[0] === i)[1];

function stopPills(ctx, ch, i, p, above, p01, seed, gone = 0) {
  const r = rng(seed);
  for (let k = 0; k < 4; k++) {
    const dx = (r() - 0.5) * 60, dy = (above ? -1 : 1) * (40 + k * 36), pk = clamp((p01 - k * 0.12) * 2);
    if (pk <= 0) continue;
    const x = ch.X(i) + dx, y = ch.Y(p) + dy;
    ctx.save(); ctx.globalAlpha *= 1 - gone;
    popT(ctx, x, y + gone * -80, pk, () => pill(ctx, 'SL', x, y + gone * -80, { size: 22, color: above ? '#d61f45' : '#0b8f63', glow: 14, pad: 12 }));
    ctx.restore();
  }
}

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('נתפס'), type: 'impact', k: 1.3 }, { lt: s.cue('נזילות') - 0.05, type: 'impact', k: 1.4 }, { lt: s.cue('מזל'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chLQ, hit = s.cue('נתפס'), lq = s.cue('נזילות');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 28, 49], [d, 31, 50]], { p: [64800, 67100] });
      const rev = kf(lt, [[0, 41], [hit, 44.32], [s.cue('לכיוון'), 45], [d, 47]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      const stopped = lt >= hit;
      ch.hline(ctx, STOP, 30, 52, { color: stopped ? C.down : '#ff8095', width: 4, dash: stopped ? null : [12, 10] });
      if (!stopped) popT(ctx, ch.X(35), ch.Y(STOP) - 40, prog(lt, 0, 0.3), () => pill(ctx, 'הסטופ שלך', ch.X(35), ch.Y(STOP) - 40, { size: 32, color: '#d61f45' }));
      else {
        const x = ch.X(44), y = ch.Y(STOP);
        ring(ctx, x, y, 240, prog(lt, hit, hit + 0.6), C.down); burst(ctx, x, y, prog(lt, hit, hit + 0.9), '#ff5a72', 24, 5, 240);
        popT(ctx, ch.X(35), ch.Y(STOP) - 40, prog(lt, hit, hit + 0.3), () => pill(ctx, 'STOP HIT', ch.X(35), ch.Y(STOP) - 40, { size: 36, color: '#d61f45' }));
        const f = Math.max(0, 1 - (lt - hit) / 0.3); if (f > 0) { ctx.fillStyle = `rgba(255,40,70,${0.25 * f})`; ctx.fillRect(0, 0, W, H); }
      }
      if (lt < s.cue('מזל') - 0.1) wipeText(ctx, 'למה הסטופ נתפס?', W / 2, 300, prog(lt, 0.05, 0.4), { size: 72, weight: 900 });
      else wipeText(ctx, 'זה לא מזל רע', W / 2, 300, prog(lt, s.cue('מזל') - 0.1, s.cue('מזל') + 0.25), { size: 72, weight: 900, color: '#ff5a72' });
      const pl = prog(lt, lq - 0.1, lq + 0.25);
      if (pl > 0) {
        scrim(ctx, 0.6 * pl);
        popT(ctx, W / 2, 860, pl, () => text(ctx, 'זו נזילות', W / 2, 860, { size: 190, weight: 900, color: C.purple2, glow: 60, glowColor: C.purple }));
        ring(ctx, W / 2, 860, 650, prog(lt, lq, lq + 0.7));
      }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('וקוראים'), type: 'impact', k: 1.2 }, { lt: s.cue('Liquidity'), type: 'riser' }],
    draw(ctx, s) {
      const { lt } = s, out = s.cue('וקוראים');
      drawBG(ctx, s.t, { glow: 1.3 });
      const r = rng(77); // floating orders
      for (let k = 0; k < 22; k++) {
        const x = r() * W, y0 = r() * H, sp = 40 + r() * 80, buy = r() > 0.5, y = ((y0 - lt * sp) % H + H) % H;
        ctx.save(); ctx.globalAlpha = 0.25 + 0.2 * r();
        pill(ctx, buy ? 'BUY STOP' : 'SELL STOP', x, y, { size: 20, color: buy ? '#0b8f63' : '#d61f45', glow: 10, pad: 12 }); ctx.restore();
      }
      scrim(ctx, 0.3);
      headlines(ctx, lt, [{ t: 'השוק זז', at: 0, y: 760, size: 110 }, { t: 'לאן שיש הכי הרבה פקודות', at: s.cue('לאן'), y: 900, size: 72, color: C.purple2 }], out);
      titleLock(ctx, lt, 'נזילות', 'LIQUIDITY', out, s.cue('Liquidity'));
    },
  },

  where: {
    trans: 'whip',
    events: s => [{ lt: s.cue('מעל'), type: 'pop' }, { lt: s.cue('ומתחת'), type: 'pop' }, { lt: s.cue('סטופים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chLQ, a = s.cue('מעל'), b = s.cue('ומתחת'), st = s.cue('סטופים');
      drawBG(ctx, s.t);
      stdChart(ch, lt, [[0, 0, 41], [d, 1, 41]], { p: [62600, 67100] });
      ch.draw(ctx, { reveal: 41, dim: 0.35 * prog(lt, a, a + 0.4) });
      HI.forEach((i, k) => { ch.hline(ctx, PV(i), i, 41, { color: 'rgba(255,90,114,0.7)', dash: [10, 10], width: 3, progress: prog(lt, a + k * 0.1, a + k * 0.1 + 0.5) }); stopPills(ctx, ch, i, PV(i), true, prog(lt, a + k * 0.12, a + k * 0.12 + 0.6), 10 + k); });
      LO.forEach((i, k) => { ch.hline(ctx, PV(i), i, 41, { color: 'rgba(61,242,166,0.7)', dash: [10, 10], width: 3, progress: prog(lt, b + k * 0.1, b + k * 0.1 + 0.5) }); stopPills(ctx, ch, i, PV(i), false, prog(lt, b + k * 0.12, b + k * 0.12 + 0.6), 20 + k); });
      badge(ctx, 'כאן כולם שמים סטופים', prog(lt, st, st + 0.35), C.purple, 300, W / 2, 40);
    },
  },

  equal: {
    trans: 'none',
    events: s => [{ lt: s.cue('Equal'), type: 'impact', k: 1 }, { lt: s.cue('מגנט'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chLQ, eq = s.cue('Equal'), mg = s.cue('מגנט'), two = s.cue('שיאים');
      drawBG(ctx, s.t);
      const [i0, i1] = kf(lt, [[0, 1, 41], [0.9, 14, 42], [d, 15, 42]]);
      const [pa, pb] = kf(lt, [[0, 62600, 67100], [0.9, 64700, 66900], [d, 64700, 66900]]);
      ch.layout(...PANEL_STD).view(i0, i1, pa, pb);
      ch.draw(ctx, { reveal: 41, dim: 0.3 });
      [20, 32].forEach((i, k) => { ch.dot(ctx, i, PV(i), prog(lt, two + k * 0.15, two + k * 0.15 + 0.3), C.gold, 14); ring(ctx, ch.X(i), ch.Y(PV(i)), 90, prog(lt, two + k * 0.15, two + k * 0.15 + 0.6), C.gold); });
      ch.hline(ctx, EQH, 20, 44, { color: C.gold, width: 6, progress: prog(lt, eq - 0.1, eq + 0.4) });
      ch.tag(ctx, 26, EQH, 'EQUAL HIGHS', prog(lt, eq, eq + 0.4), { color: '#b8860b', size: 34, off: 46 });
      [20, 32].forEach((i, k) => stopPills(ctx, ch, i, PV(i), true, prog(lt, eq + 0.2 + k * 0.1, eq + 0.8), 30 + k));
      if (lt > mg) { // particles pulled up to the level
        const r = rng(3);
        for (let k = 0; k < 40; k++) {
          const x = ch.X(22 + r() * 18), y0 = ch.Y(65000 + r() * 800), ph = (lt - mg + r()) % 1, y = lerp(y0, ch.Y(EQH), E.inCubic(ph));
          ctx.save(); ctx.globalAlpha = 0.8 * (1 - ph); ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        badge(ctx, 'מגנט למחיר', prog(lt, mg, mg + 0.35), '#b8860b', 300, W / 2, 46);
      }
    },
  },

  sweep: {
    trans: 'none',
    events: s => [{ lt: s.cue('חודר'), type: 'impact', k: 1.4 }, { lt: s.cue('אוסף'), type: 'pop' }, { lt: s.cue('Sweep'), type: 'impact', k: 1.1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chLQ, pen = s.cue('חודר'), col = s.cue('אוסף'), back = s.cue('וחוזר'), sw = s.cue('Sweep');
      drawBG(ctx, s.t);
      const [i0, i1] = kf(lt, [[0, 15, 42], [pen - 0.3, 26, 49], [d, 27, 50]]);
      ch.layout(...PANEL_STD).view(i0, i1, 64700, 67100);
      const rev = kf(lt, [[0, 41], [pen, 44.32], [back + 0.2, 45], [sw, 46], [d, 47]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, highlight: i => i === 44 && lt > pen });
      ch.hline(ctx, EQH, 20, 52, { color: C.gold, width: 5, alpha: lt > sw ? 0.5 : 1 });
      ch.tag(ctx, 38, EQH, 'EQH', 1, { color: '#b8860b', size: 30, off: 42 });
      const gone = prog(lt, col, col + 0.5);
      [20, 32].forEach((i, k) => stopPills(ctx, ch, i, PV(i), true, 1, 30 + k, gone));
      if (lt > pen) { const x = ch.X(44), y = ch.Y(66780); ring(ctx, x, y, 220, prog(lt, pen, pen + 0.6), C.gold); burst(ctx, x, y, prog(lt, col, col + 0.9), C.gold, 30, 6, 280); }
      arrow(ctx, ch.X(44) + 70, ch.Y(66500), ch.X(46) + 40, ch.Y(65500), prog(lt, back, back + 0.5), { color: C.down, width: 12, head: 44 });
      popT(ctx, W / 2, 300, prog(lt, sw, sw + 0.35), () => pill(ctx, 'LIQUIDITY SWEEP', W / 2, 300, { size: 52, color: C.purple, glow: 50 }));
    },
  },

  trap: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נתקע'), type: 'impact', k: 1 }, { lt: s.cue('נכנס'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chLQ, stuck = s.cue('נתקע'), wait = s.cue('נכנס');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 30, 52], [d, 32, 55]]), 63800, 67100);
      const rev = lerp(46, 55, prog(lt, 0.2, d - 0.3));
      ch.zone(ctx, 66110, ch.c[Math.min(54, Math.floor(rev) - 1)].c, 45, Math.min(56, rev + 0.5), { color: C.up, progress: prog(lt, wait, wait + 0.3), alpha: 0.16 });
      ch.draw(ctx, { reveal: rev });
      ch.hline(ctx, EQH, 20, 56, { color: C.gold, width: 3, alpha: 0.5 });
      // breakout buyer
      const xb = ch.X(44), yb = ch.Y(66480);
      popT(ctx, xb - 130, yb, prog(lt, 0.1, 0.4), () => pill(ctx, 'BUY בפריצה', xb - 130, yb - 10, { size: 30, color: '#2962ff' }));
      cross(ctx, xb - 130, yb - 90, 34, prog(lt, stuck, stuck + 0.35));
      // waited short
      const xs = ch.X(45), ys = ch.Y(66110);
      popT(ctx, xs + 150, ys, prog(lt, wait, wait + 0.35), () => pill(ctx, 'SELL אחרי הסוויפ', xs + 170, ys - 10, { size: 30, color: '#0b8f63' }));
      check(ctx, xs + 170, ys + 70, 34, prog(lt, wait + 0.15, wait + 0.5));
      badge(ctx, 'הקונים בפריצה נתקעו', prog(lt, stuck, stuck + 0.35), '#d61f45', 300, W / 2, 40);
    },
  },

  tip: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('בדיוק'), type: 'pop' }, { lt: s.cue('מרווח'), type: 'pop' }, { lt: s.cue('תחכה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chLQ, bad = s.cue('בדיוק'), good = s.cue('מרווח'), wt = s.cue('תחכה');
      drawBG(ctx, s.t);
      ch.layout(...PANEL_STD).view(...kf(lt, [[0, 34, 50], [d, 35, 49]]), 65200, 67200);
      ch.draw(ctx, { reveal: 47, highlight: i => i === 44 });
      ch.hline(ctx, EQH, 20, 56, { color: C.gold, width: 4 });
      ch.hline(ctx, 66480, 34, 56, { color: C.down, width: 4, dash: [12, 10], progress: prog(lt, bad, bad + 0.4) });
      popT(ctx, ch.X(37), ch.Y(66480) - 38, prog(lt, bad, bad + 0.35), () => pill(ctx, 'סטופ צמוד', ch.X(37), ch.Y(66480) - 38, { size: 30, color: '#d61f45' }));
      cross(ctx, ch.X(39.5), ch.Y(66480) - 38, 28, prog(lt, bad + 0.3, bad + 0.6));
      ch.hline(ctx, 66980, 34, 56, { color: C.up, width: 5, progress: prog(lt, good, good + 0.4) });
      popT(ctx, ch.X(37), ch.Y(66980) - 38, prog(lt, good, good + 0.35), () => pill(ctx, 'סטופ עם מרווח', ch.X(37), ch.Y(66980) - 38, { size: 30, color: '#0b8f63' }));
      check(ctx, ch.X(40), ch.Y(66980) - 38, 28, prog(lt, good + 0.3, good + 0.6));
      badge(ctx, 'או: חכה שהסוויפ יקרה', prog(lt, wt, wt + 0.35), C.purple, 1270, W / 2, 40);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('השיאים') - 0.2, type: 'click' }, { lt: s.cue('התראה'), type: 'click' }, { lt: s.cue('אלט'), type: 'key' }, { lt: s.cue('ואיי'), type: 'key' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chLQ, mk = s.cue('השיאים'), al = s.cue('התראה'), ka = s.cue('אלט'), kb = s.cue('ואיי');
      drawBG(ctx, s.t);
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(4, 42, 62900, 67000);
      ch.draw(ctx, { reveal: 41, tfs: ['15m', '1H', '4H', '1D'], dim: 0.1 });
      const at = tvToolbar(ctx, 40, 466, 870, lt > mk - 0.2 ? 'hline' : null);
      ch.hline(ctx, EQH, 20, 42, { color: C.gold, width: 4, progress: prog(lt, mk, mk + 0.5) });
      [20, 32].forEach((i, k) => ch.dot(ctx, i, PV(i), prog(lt, mk + k * 0.2, mk + k * 0.2 + 0.3), C.gold, 10));
      const [hx, hy] = at('hline');
      if (lt < al) { const c = kf(lt, [[0, 700, 1100], [mk - 0.3, hx, hy], [mk + 0.1, hx, hy], [al - 0.1, ch.X(30), ch.Y(EQH)]]); cursor(ctx, c[0], c[1], Math.exp(-Math.abs(lt - (mk - 0.2)) * 14), 1.15); }
      // alert dialog
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
      }
      const pk = prog(lt, ka - 0.05, ka + 0.3);
      if (pk > 0) {
        scrim(ctx, 0.5 * pk);
        keycap(ctx, 'Alt', W / 2 - 150, 860, pk, { w: 230, pressed: lt > ka ? 1 : 0 });
        text(ctx, '+', W / 2 - 5, 860, { size: 90, weight: 900, color: C.purple2, alpha: pk });
        keycap(ctx, 'A', W / 2 + 160, 860, prog(lt, kb - 0.05, kb + 0.3), { w: 170, pressed: lt > kb ? 1 : 0 });
        popT(ctx, W / 2, 1040, prog(lt, kb, kb + 0.35), () => pill(ctx, 'התראה חדשה', W / 2, 1040, { size: 40, color: C.purple }));
      }
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('נזילות'), type: 'pop' }, { lt: s.cue('סוויפ'), type: 'pop' }, { lt: s.cue('האמיתית'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['נזילות', 'מעל שיאים ומתחת לשפלים', C.purple, s.cue('נזילות'), 'zz'],
        ['סוויפ', 'אוסף את הסטופים', '#e0a100', s.cue('סוויפ'), 'warn'],
        ['ואז התנועה האמיתית', 'נכנסים אחרי הסוויפ', '#0fa36b', s.cue('האמיתית'), 'check'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

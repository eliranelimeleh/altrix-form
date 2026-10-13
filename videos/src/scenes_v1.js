// Video 1 — מבנה שוק (Market Structure)
'use strict';
const UPP = [[0, 62000], [7, 63900], [12, 62950], [20, 65300], [25, 64150], [33, 66700], [38, 65550], [46, 68300], [52, 66900], [60, 69400], [72, 65900]];
const UP = override(genCandles(UPP, { seed: 11, noise: 0.2 }), {
  53: { o: 67050, c: 67380, h: 67500, l: 66990 },
  54: { o: 67380, c: 67900, h: 68020, l: 67260 },
  55: { o: 67900, c: 67960, h: 68680, l: 67720 },
  56: { o: 67960, c: 67700, h: 68110, l: 67520 },
  57: { o: 67700, c: 68760, h: 68860, l: 67640 },
  58: { o: 68760, c: 69060, h: 69200, l: 68610 },
  67: { o: 67650, c: 67250, h: 67760, l: 67150 },
  68: { o: 67250, c: 66520, h: 67300, l: 66430 },
});
const DNP = [[0, 70500], [7, 68600], [12, 69600], [20, 67300], [25, 68350], [33, 65800], [38, 66900], [46, 64300], [51, 65000]];
const DN = genCandles(DNP, { seed: 4, noise: 0.2 });
const CHOP = genCandles([[0, 64000], [5, 64900], [9, 63700], [14, 65200], [18, 63500], [23, 64700], [27, 63300], [33, 65400], [37, 64100], [42, 65000], [47, 63600], [53, 65300], [58, 64200], [64, 64900]], { seed: 21, noise: 0.5 });

const chUP = new Chart(UP, { tf: '4H' }), chDN = new Chart(DN, { sym: 'ETHUSD' }), chCH = new Chart(CHOP, { tf: '15m' });
const PANEL = [40, 370, 1000, 970];
const HIGHS = [20, 33, 46], LOWS = [12, 25, 38, 52];
const ZZ = UPP.slice(0, 9);
const P = i => UPP.find(p => p[0] === i)[1];


window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('מפסידים'), type: 'impact', k: 1.2 }, { lt: s.cue('לאן'), type: 'impact', k: 0.8 }, { lt: s.cue('הולך'), type: 'impact', k: 1.4 }, { lt: s.cue('רוב'), type: 'pop' }, { lt: s.cue('כי'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s;
      drawBG(ctx, s.t);
      const [i0, i1] = kf(lt, [[0, 6, 30], [d, 30, 62]], E.lin);
      chCH.layout(...PANEL).view(i0, i1);
      ctx.save(); ctx.translate(W / 2, 830); ctx.rotate(-0.035 + lt * 0.004); ctx.scale(1.06, 1.06); ctx.translate(-W / 2, -830);
      chCH.draw(ctx, { reveal: lerp(18, 64, clamp(lt / d)), dim: 0.2 });
      ctx.restore();
      const qa = s.cue('לאן'), dimA = clamp(lerp(0.3, 0.72, prog(lt, s.cue('רוב') - 0.1, s.cue('רוב') + 0.3)));
      scrim(ctx, dimA);
      // phase 1
      const out1 = 1 - prog(lt, qa - 0.25, qa - 0.05);
      ctx.save(); ctx.globalAlpha = out1;
      wipeText(ctx, 'רוב הסוחרים', W / 2, 700, prog(lt, s.cue('רוב') - 0.05, s.cue('רוב') + 0.35), { size: 120, weight: 900 });
      popT(ctx, W / 2, 880, prog(lt, s.cue('מפסידים') - 0.05, s.cue('מפסידים') + 0.3), () =>
        text(ctx, 'מפסידים', W / 2, 880, { size: 190, weight: 900, color: '#ff4d6a', glow: 50, glowColor: '#ff1744' }));
      wipeText(ctx, 'כי הם לא יודעים לענות', W / 2, 1060, prog(lt, s.cue('כי'), s.cue('כי') + 0.4), { size: 60, weight: 700, color: C.dim });
      wipeText(ctx, 'על שאלה אחת פשוטה', W / 2, 1140, prog(lt, s.cue('שאלה'), s.cue('שאלה') + 0.4), { size: 60, weight: 700, color: C.dim });
      ctx.restore();
      // phase 2
      const p2 = prog(lt, qa - 0.05, qa + 0.3), p3 = prog(lt, s.cue('הולך') - 0.05, s.cue('הולך') + 0.3);
      popT(ctx, W / 2, 760, p2, () => text(ctx, 'לאן השוק', W / 2, 760, { size: 150, weight: 900, glow: 40, glowColor: C.purple }));
      popT(ctx, W / 2, 950, p3, () => text(ctx, 'הולך?', W / 2, 950, { size: 210, weight: 900, color: C.purple2, glow: 60, glowColor: C.purple }));
      if (p3 > 0) { burst(ctx, W / 2, 950, prog(lt, s.cue('הולך'), s.cue('הולך') + 0.8), C.purple2, 26, 3, 420); ring(ctx, W / 2, 950, 600, prog(lt, s.cue('הולך'), s.cue('הולך') + 0.6)); }
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('מבנה'), type: 'impact', k: 1.3 }, { lt: s.cue('Market'), type: 'riser' }, { lt: s.cue('Market') + 0.3, type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s;
      drawBG(ctx, s.t, { glow: 1.3 });
      chUP.layout(...PANEL).view(...kf(lt, [[0, 0, 56], [d, 4, 52]], E.lin));
      ctx.save(); ctx.globalAlpha = 0.28; ctx.translate(W / 2, 830); ctx.scale(1.15 - lt * 0.02, 1.15 - lt * 0.02); ctx.translate(-W / 2, -830);
      chUP.draw(ctx, { reveal: 53, header: false }); ctx.restore();
      scrim(ctx, 0.35);
      const m = s.cue('מבנה'), out = 1 - prog(lt, m - 0.25, m - 0.05);
      ctx.save(); ctx.globalAlpha = out;
      wipeText(ctx, 'והתשובה נמצאת', W / 2, 800, prog(lt, 0, 0.35), { size: 92, weight: 800 });
      wipeText(ctx, 'ממש מול העיניים שלך', W / 2, 920, prog(lt, s.cue('ממש'), s.cue('ממש') + 0.4), { size: 92, weight: 800, color: C.purple2 });
      ctx.restore();
      const pm = prog(lt, m - 0.05, m + 0.35);
      popT(ctx, W / 2, 800, pm, () => text(ctx, 'מבנה שוק', W / 2, 800, { size: 180, weight: 900, glow: 50, glowColor: C.purple }));
      ring(ctx, W / 2, 800, 700, prog(lt, m, m + 0.7));
      const mk = s.cue('Market'), pk = prog(lt, mk - 0.05, mk + 0.6);
      if (pk > 0) {
        const sp = lerp(60, 16, E.outExpo(pk));
        text(ctx, 'MARKET STRUCTURE', W / 2, 990, { size: 74, weight: 900, color: C.neon, spacing: sp, glow: 30, glowColor: C.purple, alpha: clamp(pk * 2) });
        // light sweep
        const sx = lerp(-300, W + 300, prog(lt, mk + 0.1, mk + 0.9));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,230,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 700, W, 360); ctx.restore();
      }
    },
  },

  swings: {
    trans: 'whip',
    events: s => [{ lt: s.cue('שיאים'), type: 'pop' }, { lt: s.cue('ושפלים'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, ch = chUP;
      drawBG(ctx, s.t);
      const a = s.cue('שיאים'), b = s.cue('ושפלים');
      ch.layout(...PANEL).view(0, 56);
      const ent = E.outCubic(prog(lt, 0, 0.35));
      ctx.save(); ctx.translate(W / 2, 830); ctx.scale(lerp(0.9, 1, ent), lerp(0.9, 1, ent)); ctx.translate(-W / 2, -830); ctx.globalAlpha = ent;
      ch.draw(ctx, { reveal: lerp(14, 53, E.outCubic(prog(lt, 0, a))), dim: 0.6 * prog(lt, a, a + 0.6) });
      [7, ...HIGHS].forEach((i, k) => { ch.dot(ctx, i, P(i), prog(lt, a + k * 0.09, a + k * 0.09 + 0.3), C.purple2); ring(ctx, ch.X(i), ch.Y(P(i)), 80, prog(lt, a + k * 0.09, a + k * 0.09 + 0.6)); });
      [0, ...LOWS].forEach((i, k) => { ch.dot(ctx, i, P(i), prog(lt, b + k * 0.08, b + k * 0.08 + 0.3), C.teal); ring(ctx, ch.X(i), ch.Y(P(i)), 80, prog(lt, b + k * 0.08, b + k * 0.08 + 0.6), C.teal); });
      badge(ctx, 'שיאים', prog(lt, a, a + 0.3), C.purple, 300, W / 2 + 130, 38);
      badge(ctx, 'שפלים', prog(lt, b, b + 0.3), '#14a88f', 300, W / 2 - 130, 38);
      ctx.restore();
    },
  },

  uptrend: {
    trans: 'none',
    events: s => [{ lt: s.cue('Higher', 0), type: 'pop' }, { lt: s.cue('Higher', 1), type: 'pop' }, { lt: s.cue('עלייה'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chUP;
      drawBG(ctx, s.t);
      const hh = s.cue('Higher', 0), hl = s.cue('Higher', 1), up = s.cue('עלייה'), buy = s.cue('הקונים');
      ch.layout(...PANEL).view(...kf(lt, [[0, 0, 56], [d, 3, 55]], E.lin));
      ch.draw(ctx, { reveal: 53, dim: 0.6 });
      ch.zigzag(ctx, ZZ, prog(lt, 0, Math.min(1.3, hh - 0.1)), { color: C.purple2 });
      HIGHS.forEach((i, k) => ch.tag(ctx, i, P(i), 'HH', prog(lt, hh + k * 0.13, hh + k * 0.13 + 0.35), { color: C.purple, above: true }));
      LOWS.forEach((i, k) => ch.tag(ctx, i, P(i), 'HL', prog(lt, hl + k * 0.12, hl + k * 0.12 + 0.35), { color: '#14a88f', above: false }));
      HIGHS.forEach((i, k) => ring(ctx, ch.X(i), ch.Y(P(i)), 90, prog(lt, hh + k * 0.13, hh + k * 0.13 + 0.6)));
      LOWS.forEach((i, k) => ring(ctx, ch.X(i), ch.Y(P(i)), 90, prog(lt, hl + k * 0.12, hl + k * 0.12 + 0.6), C.teal));
      arrow(ctx, ch.X(3), ch.Y(62700), ch.X(50), ch.Y(68900), prog(lt, up - 0.1, up + 0.5), { color: C.up, width: 14, head: 52 });
      badge(ctx, 'מגמת עלייה', prog(lt, up, up + 0.35), '#0fa36b', 300, W / 2, 46);
      badge(ctx, 'הקונים בשליטה', prog(lt, buy, buy + 0.35), 'rgba(20,12,40,0.95)', 1270, W / 2, 34);
    },
  },

  downtrend: {
    trans: 'whip',
    events: s => [{ lt: s.cue('Lower', 0), type: 'pop' }, { lt: s.cue('Lower', 1), type: 'pop' }, { lt: s.cue('המוכרים'), type: 'impact', k: 1 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chDN;
      drawBG(ctx, s.t, { hue: 30 });
      const lh = s.cue('Lower', 0), ll = s.cue('Lower', 1), sel = s.cue('המוכרים');
      ch.layout(...PANEL).view(...kf(lt, [[0, 0, 54], [d, 2, 53]], E.lin));
      ch.draw(ctx, { reveal: lerp(30, 52, E.outCubic(prog(lt, 0, 0.7))), dim: 0.6 * prog(lt, 0.4, 0.9) });
      ch.zigzag(ctx, DNP, prog(lt, 0.4, Math.min(1.5, lh)), { color: '#ff7a8a' });
      [12, 25, 38].forEach((i, k) => ch.tag(ctx, i, DNP.find(p => p[0] === i)[1], 'LH', prog(lt, lh + k * 0.12, lh + k * 0.12 + 0.35), { color: '#d61f45', above: true }));
      [20, 33, 46].forEach((i, k) => ch.tag(ctx, i, DNP.find(p => p[0] === i)[1], 'LL', prog(lt, ll + k * 0.12, ll + k * 0.12 + 0.35), { color: '#7d2bd9', above: false }));
      arrow(ctx, ch.X(2), ch.Y(70000), ch.X(48), ch.Y(64700), prog(lt, sel - 0.15, sel + 0.4), { color: C.down, width: 14, head: 52 });
      badge(ctx, 'מגמת ירידה', prog(lt, 0.1, 0.45), '#d61f45', 300, W / 2, 46);
      badge(ctx, 'המוכרים בשליטה', prog(lt, sel, sel + 0.35), 'rgba(20,12,40,0.95)', 1270, W / 2, 34);
    },
  },

  bos: {
    trans: 'whip',
    events: s => [{ lt: s.cue('השיא'), type: 'click' }, { lt: s.cue('Break'), type: 'impact', k: 1.5 }, { lt: s.cue('אישור'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chUP;
      drawBG(ctx, s.t);
      const hi = s.cue('השיא'), br = s.cue('Break'), ok = s.cue('אישור');
      ch.layout(...PANEL).view(...kf(lt, [[0, 0, 56], [1.1, 34, 63], [d, 35, 64]]));
      const rev = lerp(53, 58, prog(lt, s.cue('סוגר') - 0.5, br - 0.08));
      ch.draw(ctx, { reveal: rev, dim: 0.15 });
      ch.zigzag(ctx, ZZ, 1, { color: 'rgba(192,132,252,0.55)', width: 4 });
      ch.tag(ctx, 46, 68300, 'HH', 1, { color: C.purple }); ch.tag(ctx, 52, 66900, 'HL', 1, { color: '#14a88f', above: false });
      const broke = lt >= br - 0.08;
      ch.hline(ctx, 68300, 46, 66, { color: broke ? C.purple2 : 'rgba(255,255,255,0.8)', dash: broke ? null : [14, 12], width: broke ? 6 : 4, progress: prog(lt, hi - 0.1, hi + 0.5) });
      if (broke) {
        const x = ch.X(57), y = ch.Y(68300);
        ring(ctx, x, y, 260, prog(lt, br - 0.08, br + 0.6)); burst(ctx, x, y, prog(lt, br - 0.08, br + 0.9), C.purple2, 24, 8, 260);
        ch.tag(ctx, 51, 68300, 'BOS', prog(lt, br, br + 0.4), { color: C.purple, size: 44, off: 48 });
      }
      badge(ctx, 'המגמה ממשיכה', prog(lt, ok, ok + 0.35), '#0fa36b', 300, W / 2 + 30, 42);
      check(ctx, W / 2 - 200, 300, 34, prog(lt, ok + 0.1, ok + 0.45));
    },
  },

  choch: {
    trans: 'none',
    events: s => [{ lt: s.cue('השפל') + 0.25, type: 'impact', k: 1.6 }, { lt: s.cue('Change'), type: 'pop' }, { lt: s.cue('מתהפכת'), type: 'impact', k: 0.8 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chUP;
      drawBG(ctx, s.t, { hue: lt > s.cue('השפל') ? 40 : 0 });
      const lo = s.cue('השפל'), brk = lo + 0.25, cc = s.cue('Change'), fl = s.cue('מתהפכת');
      ch.layout(...PANEL).view(...kf(lt, [[0, 35, 64], [1.0, 42, 75], [d, 43, 76]]));
      const rev = kf(lt, [[0, 58], [brk, 69], [d, 72]], E.lin)[0];
      ch.draw(ctx, { reveal: rev, dim: 0.15 });
      ch.zigzag(ctx, [...ZZ, [60, 69400]], 1, { color: 'rgba(192,132,252,0.5)', width: 4 });
      ch.hline(ctx, 68300, 46, 66, { color: C.purple2, width: 5, alpha: 0.6 });
      ch.tag(ctx, 51, 68300, 'BOS', 1, { color: C.purple, size: 34, off: 40 });
      ch.tag(ctx, 60, 69400, 'HH', 1, { color: C.purple });
      const broke = lt >= brk;
      ch.hline(ctx, 66900, 52, 78, { color: broke ? C.gold : 'rgba(255,255,255,0.85)', dash: broke ? null : [14, 12], width: broke ? 6 : 4, progress: prog(lt, 0.15, 0.8) });
      ch.tag(ctx, 52, 66900, 'HL', 1, { color: '#14a88f', above: false });
      if (broke) {
        const x = ch.X(68), y = ch.Y(66900);
        ring(ctx, x, y, 280, prog(lt, brk, brk + 0.6), C.gold); burst(ctx, x, y, prog(lt, brk, brk + 0.9), C.gold, 24, 12, 260);
        const f = Math.max(0, 1 - (lt - brk) / 0.35); if (f > 0) { ctx.fillStyle = `rgba(255,40,70,${0.25 * f})`; ctx.fillRect(0, 0, W, H); }
      }
      ch.tag(ctx, 63, 66900, 'CHoCH', prog(lt, cc, cc + 0.4), { color: '#e0a100', size: 42, above: true, off: 46 });
      warnIcon(ctx, W / 2 - 240, 300, 36, prog(lt, fl, fl + 0.4));
      badge(ctx, 'המגמה מתהפכת', prog(lt, fl, fl + 0.35), '#d61f45', 300, W / 2 + 30, 42);
    },
  },

  wick: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('גוף'), type: 'pop' }, { lt: s.cue('פתיל'), type: 'pop' }, { lt: s.cue('מלכודת'), type: 'impact', k: 1.4 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chUP;
      drawBG(ctx, s.t);
      const body = s.cue('גוף'), wk = s.cue('פתיל'), trap = s.cue('מלכודת');
      const [i0, i1] = kf(lt, [[0, 49, 62], [body + 0.2, 51.5, 60.5], [wk - 0.1, 51.5, 60.5], [wk + 0.4, 50.5, 58.5], [d, 50.8, 58.8]]);
      ch.layout(...PANEL).view(i0, i1, 66700, 69500);
      ch.draw(ctx, { reveal: 59, highlight: i => (lt > body && lt < wk && i === 57) || (lt >= wk && i === 55), dim: lt > body ? 0.5 : 0 });
      ch.hline(ctx, 68300, 40, 70, { color: C.purple2, width: 5 });
      text(ctx, 'רמת השיא', ch.p.x + 24, ch.Y(68300) - 34, { size: 30, weight: 800, color: C.purple2, align: 'left' });
      // body close through the level = valid
      const pb = prog(lt, body, body + 0.4);
      if (pb > 0) {
        const x = ch.X(57), w = ch.cw() * 0.9, y0 = ch.Y(68760), y1 = ch.Y(68300);
        ctx.save(); ctx.globalAlpha = clamp(pb * 2); ctx.strokeStyle = C.up; ctx.lineWidth = 5; ctx.shadowColor = C.up; ctx.shadowBlur = 25; ctx.setLineDash([10, 8]);
        ctx.strokeRect(x - w / 2, y0 - 10, w, y1 - y0 + 20); ctx.restore();
        check(ctx, x, y0 - 80, 40, pb);
        const py = ch.Y(67050); popT(ctx, x - 40, py, pb, () => pill(ctx, 'סגירת גוף = שבירה', x - 40, py, { size: 32, color: '#0fa36b' }));
      }
      const pw = prog(lt, wk, wk + 0.4);
      if (pw > 0) {
        const x = ch.X(55), y = ch.Y(68560);
        ring(ctx, x, y, 120, prog(lt, wk, wk + 0.6), C.down);
        ctx.save(); ctx.globalAlpha = clamp(pw * 2); ctx.strokeStyle = C.down; ctx.lineWidth = 6; ctx.shadowColor = C.down; ctx.shadowBlur = 25;
        ctx.beginPath(); ctx.arc(x, y, 60, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        cross(ctx, x, y - 140, 40, pw);
        popT(ctx, x, y - 225, pw, () => pill(ctx, 'רק פתיל = לא שבירה', x, y - 225, { size: 32, color: '#d61f45' }));
      }
      const pt = prog(lt, trap - 0.05, trap + 0.3);
      if (pt > 0) { scrim(ctx, 0.35 * pt); popT(ctx, W / 2, 1150, pt, () => pill(ctx, 'מלכודת!', W / 2, 1150, { size: 86, color: '#d61f45', glow: 60 })); }
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [{ lt: s.cue('ארבע'), type: 'click' }, { lt: s.cue('האופקי') - 0.2, type: 'click' }, { lt: s.cue('אלט'), type: 'key' }, { lt: s.cue("ואייץ'"), type: 'key' },
      ...[0, 1, 2, 3, 4].map(k => ({ lt: s.cue('שיא') + k * 0.22, type: 'tick' }))],
    draw(ctx, s) {
      const { lt, d } = s, ch = chUP;
      drawBG(ctx, s.t);
      const four = s.cue('ארבע'), tool = s.cue('האופקי') - 0.2, mark = s.cue('שיא'), alt = s.cue('אלט'), hk = s.cue("ואייץ'");
      ch.tf = lt >= four ? '4H' : '1H';
      ch.layout(40, 370, 1000, 970, { left: 92 }).view(0, 56);
      ch.draw(ctx, { reveal: 53, tfs: ['15m', '1H', '4H', '1D'], tfFlash: lt >= four ? Math.max(0, 1 - (lt - four) * 2) : 0, dim: 0.1 });
      // TradingView-style left drawing toolbar
      const tx = 40, ty = 370 + 96;
      ctx.save(); ctx.fillStyle = '#100d1c'; ctx.fillRect(tx + 2, ty, 88, 970 - 96 - 4); ctx.fillStyle = 'rgba(180,140,255,0.12)'; ctx.fillRect(tx + 90, ty, 2, 970 - 96 - 4); ctx.restore();
      const icons = ['cross', 'trend', 'hline', 'fib', 'rect', 'text', 'ruler'];
      const toolOn = lt >= tool;
      icons.forEach((ic, k) => {
        const cx = tx + 46, cy = ty + 56 + k * 92, on = ic === 'hline' && toolOn;
        if (on) { ctx.save(); rrect(ctx, cx - 34, cy - 34, 68, 68, 14); ctx.fillStyle = 'rgba(168,85,247,0.45)'; ctx.shadowColor = C.purple; ctx.shadowBlur = 25; ctx.fill(); ctx.restore(); }
        ctx.save(); ctx.strokeStyle = on ? '#fff' : 'rgba(210,200,240,0.65)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath();
        if (ic === 'cross') { ctx.moveTo(cx - 18, cy); ctx.lineTo(cx + 18, cy); ctx.moveTo(cx, cy - 18); ctx.lineTo(cx, cy + 18); }
        if (ic === 'trend') { ctx.moveTo(cx - 18, cy + 16); ctx.lineTo(cx + 18, cy - 16); }
        if (ic === 'hline') { ctx.moveTo(cx - 22, cy); ctx.lineTo(cx + 22, cy); ctx.moveTo(cx - 6, cy); ctx.arc(cx, cy, 6, Math.PI, 3 * Math.PI); }
        if (ic === 'fib') { [-14, -4, 6, 16].forEach(dy => { ctx.moveTo(cx - 20, cy + dy); ctx.lineTo(cx + 20, cy + dy); }); }
        if (ic === 'rect') { ctx.rect(cx - 18, cy - 13, 36, 26); }
        if (ic === 'text') { ctx.moveTo(cx - 14, cy - 15); ctx.lineTo(cx + 14, cy - 15); ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy + 16); }
        if (ic === 'ruler') { ctx.moveTo(cx - 18, cy + 12); ctx.lineTo(cx + 12, cy - 18); ctx.lineTo(cx + 18, cy - 12); ctx.lineTo(cx - 12, cy + 18); ctx.closePath(); }
        ctx.stroke(); ctx.restore();
      });
      // levels drawn one by one
      const lv = [[20, 65300, C.purple2], [25, 64150, C.teal], [33, 66700, C.purple2], [38, 65550, C.teal], [46, 68300, C.purple2]];
      lv.forEach(([i, p, col], k) => {
        const pk = prog(lt, mark + k * 0.22, mark + k * 0.22 + 0.4);
        ch.hline(ctx, p, i, 60, { color: col, width: 3.5, progress: pk });
        ch.dot(ctx, i, p, pk, col, 9);
      });
      // cursor choreography
      const fourX = 40 + 88 + measure(ctx, 'BTCUSD', 32, 700) + 26 + (measure(ctx, '15m', 24, 700, MONO) + 34) + (measure(ctx, '1H', 24, 700, MONO) + 34) + 30, fourY = 370 + 48;
      const hx = tx + 46, hy = ty + 56 + 2 * 92;
      const cxy = kf(lt, [[0, 760, 1000], [four - 0.45, fourX, fourY + 6], [four + 0.25, fourX, fourY + 6], [tool - 0.4, hx, hy + 4], [tool + 0.2, hx, hy + 4],
        ...lv.map(([i, p], k) => [mark + k * 0.22, ch.X(i), ch.Y(p)]), [d, 900, 900]]);
      const clk = Math.max(Math.exp(-Math.abs(lt - four) * 14), Math.exp(-Math.abs(lt - tool) * 14));
      ring(ctx, fourX, fourY, 70, prog(lt, four, four + 0.5)); ring(ctx, hx, hy, 70, prog(lt, tool, tool + 0.5));
      cursor(ctx, cxy[0], cxy[1], clk, 1.15);
      // keyboard shortcut
      const pk = prog(lt, alt - 0.05, alt + 0.3);
      if (pk > 0) {
        scrim(ctx, 0.55 * pk);
        keycap(ctx, 'Alt', W / 2 - 150, 860, pk, { w: 230, pressed: Math.exp(-Math.max(0, lt - alt) * 2) * (lt > alt ? 1 : 0) });
        text(ctx, '+', W / 2 - 5, 860, { size: 90, weight: 900, color: C.purple2, alpha: pk });
        keycap(ctx, 'H', W / 2 + 160, 860, prog(lt, hk - 0.05, hk + 0.3), { w: 170, pressed: lt > hk ? 1 : 0 });
        popT(ctx, W / 2, 1040, prog(lt, hk, hk + 0.35), () => pill(ctx, 'קו אופקי', W / 2, 1040, { size: 40, color: C.purple }));
      }
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('שיאים'), type: 'pop' }, { lt: s.cue('BOS'), type: 'pop' }, { lt: s.cue("וצ'וק"), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s;
      drawBG(ctx, s.t, { glow: 1.2 });
      wipeText(ctx, 'סיכום ב-3 שניות', W / 2, 360, prog(lt, 0, 0.35), { size: 64, weight: 900, color: C.purple2 });
      const cards = [
        ['שיאים ושפלים', 'מראים את המגמה', C.purple, s.cue('שיאים'), 'zz'],
        ['BOS', 'מאשר את המגמה', '#0fa36b', s.cue('BOS'), 'bos'],
        ['CHoCH', 'מזהיר שהיא נגמרת', '#e0a100', s.cue("וצ'וק"), 'warn'],
      ];
      cards.forEach(([h, sub, col, t0, ic], k) => {
        const p = prog(lt, t0 - 0.05, t0 + 0.4), y = 560 + k * 300, e = E.outBack(p);
        if (p <= 0) return;
        ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate((1 - e) * -500, 0);
        glass(ctx, 80, y, 920, 250, 34, { border: col, glowColor: col, glow: 35 });
        text(ctx, h, 860, y + 92, { size: 70, weight: 900, color: '#fff', align: 'right' });
        text(ctx, sub, 860, y + 172, { size: 46, weight: 700, color: col === C.purple ? C.purple2 : col, align: 'right' });
        const ix = 210, iy = y + 125;
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 20;
        if (ic === 'zz') { ctx.beginPath(); [[-80, 50], [-40, 0], [-10, 25], [30, -30], [60, -5], [90, -60]].forEach(([dx, dy], j) => j ? ctx.lineTo(ix + dx, iy + dy) : ctx.moveTo(ix + dx, iy + dy)); ctx.stroke(); }
        ctx.restore();
        if (ic === 'bos') check(ctx, ix, iy, 58, 1, col);
        if (ic === 'warn') warnIcon(ctx, ix, iy, 60, 1);
        ctx.restore();
      });
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};


// Video 18 — Volume Profile (POC, Value Area, low-volume nodes)
'use strict';
const VPP = [[0, 63500], [4, 64600], [8, 63150], [12, 64700], [16, 63250], [20, 64500], [24, 63350], [28, 64400], [30, 63800], [33, 62700], [36, 63500], [38, 63850], [42, 65500], [48, 65700]];
const VPC = genCandles(VPP, { seed: 181, noise: 0.2 });
const VPV = VPC.map((_, i) => i <= 30 ? 90 + hash(i * 1.7) * 50 : i <= 38 ? 22 : i <= 42 ? 18 : 70);
const chVP = new Chart(VPC);
const PLO = 62300, PHI = 66100;
const PA = profileBins(VPC, VPV, 0, 31, PLO, PHI, 40); // value built in the range
const PFULL = profileBins(VPC, VPV, 0, 48, PLO, PHI, 40);
const POC = PA.price(PA.poc), VAH = PA.lo + (PA.va1 + 1) * PA.step, VAL = PA.lo + PA.va0 * PA.step;
const LVN0 = 64500, LVN1 = 65300;

function vpView(ch, lt, frames) { const [a, b] = kf(lt, frames); return ch.layout(...PANEL_STD).view(a, b, PLO, PHI); }

window.SCENES = {
  hook: {
    captions: false,
    events: s => [{ lt: s.cue('קווים'), type: 'click' }, { lt: s.cue('באמת'), type: 'riser' }, { lt: s.cue('מחיר'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVP, ln = s.cue('קווים'), real = s.cue('באמת');
      drawBG(ctx, s.t);
      vpView(ch, lt, [[0, 0, 40], [d, 0, 44]]);
      ch.draw(ctx, { reveal: 39 });
      [64300, 63400].forEach((p, k) => ch.hline(ctx, p, 0, 44, { color: 'rgba(255,255,255,0.75)', width: 2.5, progress: prog(lt, ln + k * 0.15, ln + k * 0.15 + 0.4) }));
      drawProfile(ctx, ch, PA, prog(lt, real - 0.1, real + 0.9));
      if (lt < real - 0.1) wipeText(ctx, 'קווים זה טוב', W / 2, 300, prog(lt, 0.05, 0.4), { size: 76, weight: 900 });
      else wipeText(ctx, 'איפה באמת קרה המסחר?', W / 2, 300, prog(lt, real - 0.1, real + 0.25), { size: 70, weight: 900, color: C.gold });
    },
  },

  intro: {
    trans: 'glitch', captions: false,
    events: s => [{ lt: s.cue('Volume'), type: 'impact', k: 1.2 }, { lt: s.cue('מחיר'), type: 'whoosh' }],
    draw(ctx, s) {
      const { lt } = s, vp = s.cue('Volume'), rot = s.cue('מחיר');
      drawBG(ctx, s.t, { glow: 1.3 });
      titleLock(ctx, lt, 'נפח לפי מחיר', 'VOLUME PROFILE', s.cue('קוראים'), vp, 520);
      const r = E.inOut(prog(lt, rot - 0.4, rot + 0.4)), cx = W / 2, cy = 1080;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI / 2 * r);
      for (let k = 0; k < 12; k++) { const h = 60 + 180 * Math.abs(Math.sin(k * 1.3 + 1)) * (k === 6 ? 1.3 : 1); ctx.fillStyle = k === 6 ? C.gold : 'rgba(168,85,247,0.75)'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 15; ctx.fillRect(-300 + k * 50, 150 - h, 36, h); }
      ctx.restore();
      text(ctx, r < 0.5 ? 'נפח לפי זמן' : 'נפח לפי מחיר', W / 2, 1380, { size: 46, weight: 800, color: r < 0.5 ? C.dim : '#fff' });
    },
  },

  bars: {
    trans: 'whip',
    events: s => [{ lt: s.cue('ארוכה'), type: 'pop' }, { lt: s.cue('קצרה'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVP, lg = s.cue('ארוכה'), sh = s.cue('קצרה');
      drawBG(ctx, s.t);
      vpView(ch, lt, [[0, 0, 44], [d, 0, 44]]);
      ch.draw(ctx, { reveal: 39, dim: 0.4 });
      const longK = PA.poc + 2, shortK = PA.va1 + 6;
      drawProfile(ctx, ch, PA, 1, { hi: k => (lt > lg && lt < sh && k === longK) || (lt > sh && k === shortK) });
      const xr = ch.p.x + ch.p.w;
      popT(ctx, xr - 420, ch.Y(PA.price(longK)), prog(lt, lg, lg + 0.3), () => pill(ctx, 'הרבה עסקאות', xr - 420, ch.Y(PA.price(longK)), { size: 30, color: '#0b8f63' }));
      popT(ctx, xr - 180, ch.Y(PA.price(shortK)), prog(lt, sh, sh + 0.3), () => pill(ctx, 'כמעט כלום', xr - 180, ch.Y(PA.price(shortK)), { size: 30, color: '#d61f45' }));
      badge(ctx, 'כל עמודה = נפח במחיר', prog(lt, 0.05, 0.35), C.purple, 300, W / 2, 42);
    },
  },

  poc: {
    trans: 'none',
    events: s => [{ lt: s.cue('POC'), type: 'impact', k: 1.2 }, { lt: s.cue('מגנט'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVP, pc = s.cue('POC'), mg = s.cue('מגנט');
      drawBG(ctx, s.t);
      vpView(ch, lt, [[0, 0, 44], [d, 2, 44]]);
      ch.draw(ctx, { reveal: 39, dim: 0.4 });
      drawProfile(ctx, ch, PA, 1);
      ch.hline(ctx, POC, 0, 46, { color: C.gold, width: 5, progress: prog(lt, pc - 0.1, pc + 0.6) });
      popT(ctx, ch.X(8), ch.Y(POC) - 40, prog(lt, pc, pc + 0.35), () => pill(ctx, 'POC · Point of Control', ch.X(8), ch.Y(POC) - 40, { size: 30, color: '#b8860b' }));
      if (lt > mg) { const r = rng(4); for (let k = 0; k < 40; k++) { const x = ch.X(2 + r() * 36), up = r() > 0.5, y0 = ch.Y(POC + (up ? 1 : -1) * (300 + r() * 800)), ph = (lt - mg + r()) % 1, y = lerp(y0, ch.Y(POC), E.inCubic(ph));
        ctx.save(); ctx.globalAlpha = 0.8 * (1 - ph); ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
      badge(ctx, 'מגנט למחיר', prog(lt, mg, mg + 0.35), '#b8860b', 1270, W / 2, 44);
    },
  },

  va: {
    trans: 'none',
    events: s => [{ lt: s.cue('ה-Value'), type: 'impact', k: 1 }, { lt: s.cue('שבעים'), type: 'pop' }, { lt: s.cue('הוגן'), type: 'pop' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVP, va = s.cue('ה-Value'), pct = s.cue('שבעים'), fair = s.cue('הוגן');
      drawBG(ctx, s.t);
      vpView(ch, lt, [[0, 2, 44], [d, 2, 44]]);
      ch.zone(ctx, VAH, VAL, 0, 46, { color: C.purple, alpha: 0.2, progress: prog(lt, va - 0.1, va + 0.5) });
      ch.draw(ctx, { reveal: 39, dim: 0.35 });
      drawProfile(ctx, ch, PA, 1);
      ch.hline(ctx, VAH, 0, 46, { color: C.purple2, width: 3, dash: [10, 8], progress: prog(lt, va, va + 0.5) });
      ch.hline(ctx, VAL, 0, 46, { color: C.purple2, width: 3, dash: [10, 8], progress: prog(lt, va, va + 0.5) });
      ch.hline(ctx, POC, 0, 46, { color: C.gold, width: 4 });
      popT(ctx, ch.X(6), ch.Y(VAH) - 36, prog(lt, va, va + 0.3), () => pill(ctx, 'VAH', ch.X(6), ch.Y(VAH) - 36, { size: 26, color: C.purple }));
      popT(ctx, ch.X(6), ch.Y(VAL) + 36, prog(lt, va, va + 0.3), () => pill(ctx, 'VAL', ch.X(6), ch.Y(VAL) + 36, { size: 26, color: C.purple }));
      badge(ctx, 'VALUE AREA · 70%', prog(lt, pct, pct + 0.35), C.purple, 300, W / 2, 46);
      badge(ctx, 'מחיר הוגן', prog(lt, fair, fair + 0.35), 'rgba(20,12,40,0.95)', 1270, W / 2, 40);
    },
  },

  lvn: {
    trans: 'whip',
    events: s => [{ lt: s.cue('נמוך'), type: 'pop' }, { lt: s.cue('מהר'), type: 'impact', k: 1.3 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVP, low = s.cue('נמוך'), fast = s.cue('מהר');
      drawBG(ctx, s.t);
      vpView(ch, lt, [[0, 14, 48], [d, 16, 48]]);
      ch.zone(ctx, LVN1, LVN0, 14, 50, { color: C.down, alpha: 0.16 * prog(lt, low, low + 0.4) });
      const rev = kf(lt, [[0, 38.5], [fast, 39], [fast + 0.6, 43], [d, 47]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      drawProfile(ctx, ch, PFULL, 1, { hi: k => lt > low && PFULL.price(k) > LVN0 && PFULL.price(k) < LVN1 });
      if (lt > fast) for (let k = 0; k < 6; k++) { const x = ch.X(40) - 40 + k * 14, y = ch.Y(64900); ctx.save(); ctx.globalAlpha = 0.5 * (1 - prog(lt, fast + 0.3, fast + 1)); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 90); ctx.lineTo(x, y - 90); ctx.stroke(); ctx.restore(); }
      badge(ctx, 'נפח נמוך = המחיר טס', prog(lt, fast, fast + 0.35), '#d61f45', 300, W / 2, 44);
    },
  },

  trade: {
    trans: 'zoom',
    events: s => [{ lt: s.cue('שיוצא'), type: 'whoosh' }, { lt: s.cue('וחוזר'), type: 'pop' }, { lt: s.cue('ה-POC'), type: 'impact', k: 1.2 }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVP, out = s.cue('שיוצא'), back = s.cue('וחוזר'), poc = s.cue('ה-POC');
      drawBG(ctx, s.t);
      vpView(ch, lt, [[0, 6, 42], [d, 8, 42]]);
      ch.zone(ctx, VAH, VAL, 0, 46, { color: C.purple, alpha: 0.18 });
      ch.hline(ctx, POC, 0, 46, { color: C.gold, width: 4 });
      const rev = kf(lt, [[0, 30], [out + 0.3, 33.5], [back + 0.3, 35.5], [poc + 0.2, 38.5], [d, 38.5]], E.lin)[0];
      ch.draw(ctx, { reveal: rev });
      drawProfile(ctx, ch, PA, 1, { alpha: 0.7 });
      popT(ctx, ch.X(33), ch.Y(62600) + 10, prog(lt, out + 0.3, out + 0.6), () => pill(ctx, 'מחוץ ל-Value Area', ch.X(33), ch.Y(62600) + 10, { size: 26, color: '#d61f45' }));
      if (lt > back) arrow(ctx, ch.X(35), ch.Y(63300), ch.X(38), ch.Y(POC) + 12, prog(lt, back, poc), { color: C.gold, width: 10, head: 36 });
      check(ctx, ch.X(38), ch.Y(POC) - 60, 28, prog(lt, poc + 0.1, poc + 0.45));
      badge(ctx, 'חוזר → נע עד ה-POC', prog(lt, poc, poc + 0.35), '#b8860b', 300, W / 2, 44);
    },
  },

  tv: {
    trans: 'glitch',
    events: s => [...Array.from({ length: 12 }, (_, k) => ({ lt: s.cue('באינדיקטורים') + 0.1 + k * 0.05, type: 'tick' })), { lt: s.cue('והפרופיל'), type: 'click' }, { lt: s.cue('יופיע'), type: 'riser' }],
    draw(ctx, s) {
      const { lt, d } = s, ch = chVP, op = s.cue('באינדיקטורים'), pk = s.cue('והפרופיל') - 0.15, ap = s.cue('יופיע');
      drawBG(ctx, s.t);
      vpView(ch, lt, [[0, 0, 48]]);
      ch.draw(ctx, { reveal: 47 });
      drawProfile(ctx, ch, PFULL, prog(lt, ap - 0.2, ap + 0.8), { colIn: 'rgba(41,98,255,0.55)', colOut: 'rgba(41,98,255,0.25)', colPoc: '#ff9800' });
      indicatorDialog(ctx, lt, 'Visible Range Volume Profile', [['Visible Range Volume Profile', 'Built-in'], ['Fixed Range Volume Profile', 'Built-in'], ['Session Volume Profile', 'Built-in']], op, pk);
      popT(ctx, W / 2, 300, prog(lt, ap, ap + 0.35), () => pill(ctx, 'VRVP', W / 2, 300, { size: 46, color: '#2962ff' }));
    },
  },

  recap: {
    trans: 'zoom', captions: false,
    events: s => [{ lt: s.cue('POC'), type: 'pop' }, { lt: s.cue('Value'), type: 'pop' }, { lt: s.cue('ובנפח'), type: 'pop' }],
    draw(ctx, s) {
      recapDraw(ctx, s, 'סיכום ב-3 שניות', [
        ['POC', 'מגנט למחיר', '#e0a100', s.cue('POC'), 'zz'],
        ['Value Area', 'מחיר הוגן · 70%', C.purple, s.cue('Value'), '70%'],
        ['נפח נמוך', 'המחיר טס', '#d61f45', s.cue('ובנפח'), 'warn'],
      ]);
    },
  },

  cta: {
    trans: 'flash', captions: false,
    events: s => [{ lt: 0.05, type: 'impact', k: 1 }, { lt: s.cue('פולו') + 0.25, type: 'click' }, { lt: s.cue('פולו') + 0.3, type: 'pop' }],
    draw(ctx, s) { ctaDraw(ctx, s, 'פולו'); },
  },
};

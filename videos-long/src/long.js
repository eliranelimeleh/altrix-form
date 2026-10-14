// helpers for the long-format ALTRIX videos (chapters, series map, confluence card)
'use strict';
const SERIES = [
  { id: 'L1', he: 'נזילות', en: 'LIQUIDITY' },
  { id: 'L2', he: 'שבירת מבנה', en: 'BOS' },
  { id: 'L3', he: 'פער ערך', en: 'FVG' },
  { id: 'L4', he: 'פער הפוך', en: 'IFVG' },
  { id: 'L5', he: 'שיווי משקל', en: 'EQUILIBRIUM' },
];
// second series: price action made simple (L6-L8)
const SERIES_PA = [
  { he: 'כיוון', en: 'DIRECTION' },
  { he: 'אישור', en: 'CONFIRM' },
  { he: 'פסילה', en: 'INVALIDATE' },
  { he: 'כניסה', en: 'ENTRY' },
];
const HEB_NUM = ['', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי'];

// full-screen chapter card: big outlined number, hebrew title, english subtitle, chapter dots
function chapterDraw(ctx, s, n, total, he, en, o = {}) {
  const { lt, d } = s, t1 = o.at ?? s.cue(o.cueWord || he.split(' ')[0]);
  drawBG(ctx, s.t, { rain: 1.8, glow: 1.25 });
  const pn = prog(lt, 0, 0.45), num = String(n).padStart(2, '0');
  // giant number with zoom-in + outline
  ctx.save(); const sc = lerp(1.6, 1, E.outExpo(pn)) * (1 + lt * 0.015); ctx.globalAlpha = clamp(pn * 2);
  ctx.translate(W / 2, 700); ctx.scale(sc, sc); ctx.translate(-W / 2, -700);
  ctx.font = font(430, 800, MONO); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 6; ctx.strokeStyle = C.purple2; ctx.shadowColor = C.purple; ctx.shadowBlur = 50; ctx.strokeText(num, W / 2, 700);
  ctx.globalAlpha *= 0.16; ctx.fillStyle = C.purple; ctx.fillText(num, W / 2, 700);
  ctx.restore();
  text(ctx, `פרק ${HEB_NUM[n] || n}`, W / 2, 400, { size: 48, weight: 800, color: C.neon, alpha: prog(lt, 0.1, 0.4), spacing: 4 });
  // line sweep
  const lw = 760 * E.outExpo(prog(lt, 0.15, 0.7));
  ctx.save(); const g = ctx.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0); g.addColorStop(0, 'rgba(192,132,252,0)'); g.addColorStop(0.5, C.purple2); g.addColorStop(1, 'rgba(192,132,252,0)');
  ctx.fillStyle = g; ctx.shadowColor = C.purple; ctx.shadowBlur = 20; ctx.fillRect(W / 2 - lw / 2, 968, lw, 4); ctx.restore();
  wipeText(ctx, he, W / 2, 1075, prog(lt, t1 - 0.1, t1 + 0.35), { size: he.length > 14 ? 84 : 104, weight: 900, glow: 34, glowColor: C.purple });
  if (en) { const pe = prog(lt, t1 + 0.1, t1 + 0.7); text(ctx, en, W / 2, 1195, { size: 40, weight: 800, color: C.purple2, spacing: lerp(30, 10, E.outExpo(pe)), alpha: pe }); }
  // chapter dots (rtl)
  for (let k = 1; k <= total; k++) {
    const x = W / 2 + ((total + 1) / 2 - k) * 54, on = k === n, past = k < n, pk = prog(lt, 0.2 + k * 0.04, 0.5 + k * 0.04);
    popT(ctx, x, 1330, pk, () => { ctx.save(); ctx.beginPath(); ctx.arc(x, 1330, on ? 15 : 10, 0, Math.PI * 2); ctx.fillStyle = on ? C.gold : past ? C.purple2 : 'rgba(255,255,255,0.18)'; if (on) { ctx.shadowColor = C.gold; ctx.shadowBlur = 25; } ctx.fill(); ctx.restore(); });
  }
  ring(ctx, W / 2, 700, 620, prog(lt, 0, 0.8));
  const sx = lerp(-300, W + 300, prog(lt, 0.3, 1.2));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createLinearGradient(sx - 140, 0, sx + 140, 0);
  gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,230,255,0.22)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gg; ctx.fillRect(0, 480, W, 460); ctx.restore();
}
const chapterEvents = s => [{ lt: 0.02, type: 'impact', k: 0.8 }, { lt: Math.max(0.1, s.d - 1.1), type: 'riser' }];

// the 5-part series as a path of nodes (rtl). cur = index 0..4, p = reveal progress, y center
function seriesMap(ctx, lt, cur, t0, y = 1180, o = {}) {
  const list = o.list || SERIES, n = list.length, x0 = 930, x1 = 150, { done = cur } = o;
  const xs = list.map((_, k) => lerp(x0, x1, k / (n - 1)));
  const pl = E.outCubic(prog(lt, t0, t0 + 1.0));
  ctx.save(); ctx.strokeStyle = 'rgba(192,132,252,0.35)'; ctx.lineWidth = 5; ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, pl), y); ctx.stroke(); ctx.restore();
  list.forEach((c, k) => {
    const pk = prog(lt, t0 + k * 0.15, t0 + k * 0.15 + 0.4), on = k === cur, x = xs[k];
    popT(ctx, x, y, pk, () => {
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, on ? 58 : 44, 0, Math.PI * 2);
      ctx.fillStyle = on ? C.purple : k < done ? 'rgba(124,58,237,0.55)' : 'rgba(30,20,60,0.95)';
      ctx.shadowColor = on ? C.purple : 'transparent'; ctx.shadowBlur = on ? 45 : 0; ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = 3; ctx.strokeStyle = on ? '#fff' : 'rgba(200,160,255,0.5)'; ctx.stroke(); ctx.restore();
      text(ctx, String(k + 1), x, y + 3, { size: on ? 52 : 38, weight: 900, fam: MONO, color: '#fff' });
      text(ctx, c.en, x, y + (on ? 98 : 84), { size: on ? 30 : 24, weight: 900, color: on ? C.neon : C.axis, alpha: on ? 1 : 0.8 });
      text(ctx, c.he, x, y + (on ? 140 : 120), { size: on ? 32 : 24, weight: 800, color: on ? '#fff' : 'rgba(255,255,255,0.5)' });
    });
  });
  return xs;
}

// confluence identity card: name, type (reversal/continuation) and what it gives you
function confluenceCard(ctx, lt, t0, o) {
  const { he, en, type, uses = [], y = 520, tType = t0 + 0.6, tUses = [] } = o;
  const p = prog(lt, t0 - 0.05, t0 + 0.4); if (p <= 0) return;
  const e = E.outBack(p);
  ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(W / 2, y + 230); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); ctx.translate(-W / 2, -(y + 230));
  glass(ctx, 90, y, 900, 460, 36, { border: 'rgba(200,150,255,0.6)', glow: 60 });
  text(ctx, 'CONFLUENCE', 930, y + 62, { size: 26, weight: 800, color: C.purple2, align: 'right', spacing: 8 });
  text(ctx, he, 930, y + 140, { size: 84, weight: 900, align: 'right', glow: 24, glowColor: C.purple });
  const room = 780 - measure(ctx, he, 84, 900) - 40; let fs = 52; while (fs > 24 && measure(ctx, en, fs, 900) > room) fs -= 2;
  if (fs > 24) text(ctx, en, 150, y + 140, { size: fs, weight: 900, color: C.neon, align: 'left' });
  else text(ctx, en, 150, y + 62, { size: 30, weight: 900, color: C.neon, align: 'left', spacing: 2 });
  ctx.fillStyle = 'rgba(200,150,255,0.25)'; ctx.fillRect(130, y + 200, 820, 2);
  const rev = type === 'reversal', tc = rev ? '#ff8a3d' : C.teal;
  popT(ctx, 760, y + 275, prog(lt, tType, tType + 0.35), () => pill(ctx, rev ? 'היפוך ⇄' : 'המשך ⇢', 760, y + 275, { size: 40, color: tc, fg: '#120a00', glow: 30 }));
  text(ctx, 'סוג:', 930, y + 275, { size: 38, weight: 800, align: 'right', color: C.axis, alpha: prog(lt, tType, tType + 0.3) });
  uses.forEach((u, k) => {
    const tu = tUses[k] ?? tType + 0.4 + k * 0.3, x = 930 - k * 300;
    const pu = prog(lt, tu, tu + 0.35); if (pu <= 0) return;
    check(ctx, x - 22, y + 380, 22, pu, C.up);
    text(ctx, u, x - 56, y + 381, { size: 40, weight: 800, align: 'right', alpha: clamp(pu * 2) });
  });
  ctx.restore();
}

// two stacked mini chart panels used for "right vs wrong" comparisons
const PANEL_TOP = [40, 330, 1000, 520], PANEL_BOT = [40, 880, 1000, 520];

// floating order pills (buy/sell stops) used for order-flow explanations
function orderRain(ctx, lt, n = 22, seed = 77, alpha = 1) {
  const r = rng(seed);
  for (let k = 0; k < n; k++) {
    const x = r() * W, y0 = r() * H, sp = 40 + r() * 80, buy = r() > 0.5, y = ((y0 - lt * sp) % H + H) % H;
    ctx.save(); ctx.globalAlpha = (0.2 + 0.2 * r()) * alpha;
    pill(ctx, buy ? 'BUY STOP' : 'SELL STOP', x, y, { size: 20, color: buy ? '#0b8f63' : '#d61f45', glow: 10, pad: 12 }); ctx.restore();
  }
}
// SL pills stacked above/below a pivot
function stopPills(ctx, ch, i, p, above, p01, seed, gone = 0, label = 'SL') {
  const r = rng(seed);
  for (let k = 0; k < 4; k++) {
    const dx = (r() - 0.5) * 60, dy = (above ? -1 : 1) * (40 + k * 36), pk = clamp((p01 - k * 0.12) * 2);
    if (pk <= 0) continue;
    const x = ch.X(i) + dx, y = ch.Y(p) + dy;
    ctx.save(); ctx.globalAlpha *= 1 - gone;
    popT(ctx, x, y + gone * (above ? -80 : 80), pk, () => pill(ctx, label, x, y + gone * (above ? -80 : 80), { size: 22, color: above ? '#d61f45' : '#0b8f63', glow: 14, pad: 12 }));
    ctx.restore();
  }
}
// risk/reward position box (TradingView Long/Short Position look)
function positionBox(ctx, ch, i0, i1, entry, stop, target, p, o = {}) {
  if (p <= 0) return;
  const pe = E.outCubic(clamp(p)), xi = lerp(ch.X(i0), ch.X(i1), pe);
  ch.clip(ctx, () => {
    ctx.save(); ctx.globalAlpha *= clamp(p * 2);
    const x0 = ch.X(i0), ye = ch.Y(entry), ys = ch.Y(stop), yt = ch.Y(target);
    ctx.fillStyle = 'rgba(242,54,69,0.26)'; ctx.fillRect(x0, Math.min(ye, ys), xi - x0, Math.abs(ys - ye));
    ctx.fillStyle = 'rgba(22,199,132,0.24)'; ctx.fillRect(x0, Math.min(ye, yt), xi - x0, Math.abs(yt - ye));
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, ye); ctx.lineTo(xi, ye); ctx.stroke();
    ctx.restore();
  });
  if (p > 0.6 && o.rr) {
    const rr = Math.abs(target - entry) / Math.abs(entry - stop);
    popT(ctx, ch.X(i1) - 90, ch.Y(target) + (target > entry ? 34 : -34), prog(p, 0.6, 1), () => pill(ctx, `R:R 1:${rr.toFixed(1)}`, ch.X(i1) - 90, ch.Y(target) + (target > entry ? 34 : -34), { size: 26, color: '#0b8f63', fam: MONO, glow: 14 }));
  }
}

// trend line through (i1,p1)-(i2,p2), extended to iEnd; drawn progressively with p
function trendLine(ctx, ch, i1, p1, i2, p2, iEnd, p, o = {}) {
  if (p <= 0) return;
  const { color = C.teal, width = 5, glow = 20, dash = null, alpha = 1 } = o;
  const slope = (p2 - p1) / (i2 - i1), ie = lerp(i1, iEnd, E.outCubic(clamp(p)));
  ch.clip(ctx, () => {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = color; ctx.shadowBlur = glow; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(ch.X(i1), ch.Y(p1)); ctx.lineTo(ch.X(ie), ch.Y(p1 + slope * (ie - i1))); ctx.stroke(); ctx.restore();
  });
  return i => p1 + slope * (i - i1);
}

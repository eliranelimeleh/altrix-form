// helpers shared by all reels
'use strict';
function override(cs, map) {
  for (const [i, q] of Object.entries(map)) { cs[+i] = { ...q }; if (cs[+i + 1] && !map[+i + 1]) cs[+i + 1].o = q.c; }
  cs.forEach(q => { q.h = Math.max(q.h, q.o, q.c); q.l = Math.min(q.l, q.o, q.c); });
  return cs;
}
function badge(ctx, s, p, color, y = 520, x = W / 2, size = 42) {
  popT(ctx, x, y, p, () => pill(ctx, s, x, y, { size, color, weight: 900, glow: 40 }));
}
function scrim(ctx, a) { if (a <= 0) return; ctx.fillStyle = `rgba(4,2,10,${a})`; ctx.fillRect(0, 0, W, H); }
function warnIcon(ctx, x, y, r, p) {
  popT(ctx, x, y, p, () => {
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * 1.05, y + r * 0.75); ctx.lineTo(x - r * 1.05, y + r * 0.75); ctx.closePath();
    ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 30; ctx.fill(); ctx.restore();
    text(ctx, '!', x, y + r * 0.18, { size: r * 1.15, weight: 900, color: '#1a0f00' });
  });
}

function ctaDraw(ctx, s, word) {
  const { lt, d } = s;
  drawBG(ctx, s.t, { rain: 2.2, glow: 1.4 });
  const pl = E.outCubic(prog(lt, 0, 0.8));
  wipeText(ctx, 'רוצה עוד שיעורים כאלה?', W / 2, 330, prog(lt, 0.05, 0.45), { size: 66, weight: 900 });
  ctx.save(); ctx.globalAlpha = pl; const sc = lerp(1.35, 1, pl) * (1 + 0.012 * Math.sin(lt * 3));
  ctx.translate(W / 2, 800); ctx.scale(sc, sc); ctx.translate(-W / 2, -800);
  drawLogo(ctx, W / 2, 800, 1000, 1); drawLogo(ctx, W / 2, 800, 1000, 0.35 + 0.25 * Math.sin(lt * 4));
  ctx.restore();
  const f = s.cue(word) + 0.25, pb = prog(lt, f - 0.9, f - 0.5), done = lt >= f;
  if (pb > 0) {
    const bx = W / 2, by = 1330, bw = 520, bh = 130, k = done ? 1 + 0.08 * Math.exp(-(lt - f) * 6) : 1;
    popT(ctx, bx, by, pb, () => {
      ctx.save(); ctx.translate(bx, by); ctx.scale(k, k); ctx.translate(-bx, -by);
      rrect(ctx, bx - bw / 2, by - bh / 2, bw, bh, bh / 2);
      const g = ctx.createLinearGradient(bx - bw / 2, 0, bx + bw / 2, 0);
      if (done) { g.addColorStop(0, '#1b1230'); g.addColorStop(1, '#2a1a4a'); } else { g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#c084fc'); }
      ctx.fillStyle = g; ctx.shadowColor = C.purple; ctx.shadowBlur = 60; ctx.fill(); ctx.shadowBlur = 0;
      if (done) { ctx.lineWidth = 4; ctx.strokeStyle = C.purple2; ctx.stroke(); }
      ctx.restore();
      text(ctx, done ? 'FOLLOWING ✓' : '+ FOLLOW', bx, by + 2, { size: 58, weight: 900, color: '#fff' });
    });
    const cx = kf(lt, [[f - 0.6, 900, 1650], [f - 0.05, bx + 60, by + 20]])
    if (lt < f + 0.6) cursor(ctx, cx[0], cx[1], Math.exp(-Math.abs(lt - f) * 12), 1.3);
    burst(ctx, bx, by, prog(lt, f, f + 0.9), C.purple2, 30, 4, 360);
    ring(ctx, bx, by, 420, prog(lt, f, f + 0.7));
  }
  const handle = (R.spec && R.spec.handle) || '';
  if (handle) text(ctx, handle, W / 2, 1460, { size: 48, weight: 800, color: C.purple2, alpha: prog(lt, f, f + 0.4) });
  text(ctx, 'תוכן לימודי בלבד · אינו מהווה ייעוץ השקעות', W / 2, 1600, { size: 26, weight: 500, color: 'rgba(255,255,255,0.4)', alpha: prog(lt, 0.5, 1) });
}

// ---------- reusable scene blocks (v3+) ----------
// kinetic headline lines: [{t: 'text', at: localTime, y, size, color, glow, kind: 'wipe'|'pop'}], faded out at `out`
function headlines(ctx, lt, lines, out = Infinity) {
  const a = 1 - prog(lt, out - 0.25, out - 0.05); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  for (const l of lines) {
    const o = { size: l.size || 110, weight: 900, color: l.color || '#fff', glow: l.glow ?? 30, glowColor: l.glowColor || C.purple, stroke: l.stroke || 0 };
    if (l.kind === 'pop') popT(ctx, W / 2, l.y, prog(lt, l.at - 0.05, l.at + 0.3), () => text(ctx, l.t, W / 2, l.y, o));
    else wipeText(ctx, l.t, W / 2, l.y, prog(lt, l.at - 0.05, l.at + 0.35), o);
  }
  ctx.restore();
}
// big title lock-up with an english subtitle + light sweep
function titleLock(ctx, lt, he, en, tHe, tEn, y = 800) {
  popT(ctx, W / 2, y, prog(lt, tHe - 0.05, tHe + 0.35), () => text(ctx, he, W / 2, y, { size: he.length > 9 ? 140 : 180, weight: 900, glow: 50, glowColor: C.purple }));
  ring(ctx, W / 2, y, 700, prog(lt, tHe, tHe + 0.7));
  const pk = prog(lt, tEn - 0.05, tEn + 0.6); if (pk <= 0) return;
  text(ctx, en, W / 2, y + 190, { size: en.length > 14 ? 64 : 80, weight: 900, color: C.neon, spacing: lerp(50, 14, E.outExpo(pk)), glow: 30, glowColor: C.purple, alpha: clamp(pk * 2) });
  const sx = lerp(-300, W + 300, prog(lt, tEn + 0.1, tEn + 0.9));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,230,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y - 150, W, 420); ctx.restore();
}
// recap cards: [[title, sub, color, cueTime, icon('zz'|'check'|'warn'|'cross'|number)]]
function recapDraw(ctx, s, title, cards) {
  const { lt } = s;
  drawBG(ctx, s.t, { glow: 1.2 });
  wipeText(ctx, title, W / 2, 360, prog(lt, 0, 0.35), { size: 64, weight: 900, color: C.purple2 });
  cards.forEach(([h, sub, col, t0, ic], k) => {
    const p = prog(lt, t0 - 0.05, t0 + 0.4), y = 560 + k * 300, e = E.outBack(p);
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate((1 - e) * -500, 0);
    glass(ctx, 80, y, 920, 250, 34, { border: col, glowColor: col, glow: 35 });
    text(ctx, h, 860, y + 92, { size: h.length > 14 ? 58 : 70, weight: 900, color: '#fff', align: 'right' });
    text(ctx, sub, 860, y + 172, { size: 46, weight: 700, color: col === C.purple ? C.purple2 : col, align: 'right' });
    const ix = 210, iy = y + 125;
    if (ic === 'zz') { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.beginPath();
      [[-80, 50], [-40, 0], [-10, 25], [30, -30], [60, -5], [90, -60]].forEach(([dx, dy], j) => j ? ctx.lineTo(ix + dx, iy + dy) : ctx.moveTo(ix + dx, iy + dy)); ctx.stroke(); ctx.restore(); }
    else if (ic === 'check') check(ctx, ix, iy, 58, 1, col);
    else if (ic === 'cross') cross(ctx, ix, iy, 58, 1, col);
    else if (ic === 'warn') warnIcon(ctx, ix, iy, 60, 1);
    else { ctx.save(); ctx.beginPath(); ctx.arc(ix, iy, 62, 0, Math.PI * 2); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.fill(); ctx.restore(); text(ctx, String(ic), ix, iy + 4, { size: 70, weight: 900 }); }
    ctx.restore();
  });
}
// TradingView-like left drawing toolbar; returns icon center getter
function tvToolbar(ctx, x, y, h, active) {
  ctx.save(); ctx.fillStyle = '#100d1c'; ctx.fillRect(x + 2, y, 88, h); ctx.fillStyle = 'rgba(180,140,255,0.12)'; ctx.fillRect(x + 90, y, 2, h); ctx.restore();
  const icons = ['cross', 'trend', 'hline', 'fib', 'rect', 'text', 'ruler', 'pos'];
  const at = ic => [x + 46, y + 56 + icons.indexOf(ic) * 92];
  icons.forEach(ic => {
    const [cx, cy] = at(ic), on = ic === active;
    if (cy > y + h - 30) return;
    if (on) { ctx.save(); rrect(ctx, cx - 34, cy - 34, 68, 68, 14); ctx.fillStyle = 'rgba(168,85,247,0.45)'; ctx.shadowColor = C.purple; ctx.shadowBlur = 25; ctx.fill(); ctx.restore(); }
    ctx.save(); ctx.strokeStyle = on ? '#fff' : 'rgba(210,200,240,0.65)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath();
    if (ic === 'cross') { ctx.moveTo(cx - 18, cy); ctx.lineTo(cx + 18, cy); ctx.moveTo(cx, cy - 18); ctx.lineTo(cx, cy + 18); }
    if (ic === 'trend') { ctx.moveTo(cx - 18, cy + 16); ctx.lineTo(cx + 18, cy - 16); }
    if (ic === 'hline') { ctx.moveTo(cx - 22, cy); ctx.lineTo(cx + 22, cy); }
    if (ic === 'fib') { [-14, -4, 6, 16].forEach(dy => { ctx.moveTo(cx - 20, cy + dy); ctx.lineTo(cx + 20, cy + dy); }); }
    if (ic === 'rect') { ctx.rect(cx - 18, cy - 13, 36, 26); }
    if (ic === 'text') { ctx.moveTo(cx - 14, cy - 15); ctx.lineTo(cx + 14, cy - 15); ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy + 16); }
    if (ic === 'ruler') { ctx.moveTo(cx - 18, cy + 12); ctx.lineTo(cx + 12, cy - 18); ctx.lineTo(cx + 18, cy - 12); ctx.lineTo(cx - 12, cy + 18); ctx.closePath(); }
    if (ic === 'pos') { ctx.rect(cx - 16, cy - 18, 32, 16); ctx.rect(cx - 16, cy + 2, 32, 16); }
    ctx.stroke(); ctx.restore();
  });
  return at;
}
// TradingView "Indicators" dialog with typed search; returns {open}
function indicatorDialog(ctx, lt, q, rows, tOpen, tPick, o = {}) {
  const pd = prog(lt, tOpen - 0.2, tOpen + 0.15) * (1 - prog(lt, tPick + 0.15, tPick + 0.4)); if (pd <= 0) return false;
  scrim(ctx, 0.45 * pd);
  ctx.save(); ctx.globalAlpha = pd; const dy = (1 - E.outCubic(pd)) * 60;
  const bx = 110, by = 470 + dy, bw = 860, bh = 140 + 100 + rows.length * 92;
  glass(ctx, bx, by, bw, bh, 26, { fill: 'rgba(22,16,40,0.97)' });
  text(ctx, o.title || 'Indicators, metrics & strategies', bx + 40, by + 60, { size: 34, weight: 700, align: 'left' });
  rrect(ctx, bx + 36, by + 110, bw - 72, 76, 14); ctx.fillStyle = '#0d0a19'; ctx.fill(); ctx.strokeStyle = C.purple; ctx.lineWidth = 3; ctx.stroke();
  const n = Math.floor(prog(lt, tOpen + 0.1, tOpen + 0.1 + q.length * 0.05) * q.length);
  text(ctx, q.slice(0, n) + (Math.floor(lt * 3) % 2 ? '|' : ''), bx + 70, by + 149, { size: 36, weight: 600, align: 'left' });
  if (n >= Math.min(5, q.length)) rows.forEach(([r, tag], k) => {
    const ry = by + 250 + k * 92, hot = k === 0;
    if (hot) { rrect(ctx, bx + 24, ry - 40, bw - 48, 80, 12); ctx.fillStyle = lt > tPick - 0.3 ? 'rgba(168,85,247,0.45)' : 'rgba(168,85,247,0.18)'; ctx.fill(); }
    text(ctx, r, bx + 70, ry, { size: 34, weight: hot ? 800 : 500, align: 'left', color: hot ? '#fff' : C.dim });
    text(ctx, tag || 'Built-in', bx + bw - 60, ry, { size: 24, weight: 500, align: 'right', color: C.axis, fam: MONO });
  });
  ctx.restore();
  const cxy = kf(lt, [[tOpen, 700, 1300], [tPick - 0.3, 500, by + 260], [tPick, 480, by + 262]]);
  cursor(ctx, cxy[0], cxy[1], Math.exp(-Math.abs(lt - tPick) * 14), 1.15);
  return true;
}
// volume bars at the bottom of a chart's plot
function volumeBars(ctx, ch, vols, reveal, o = {}) {
  const { h = 150, alpha = 0.55, highlight = null } = o, n = Math.min(vols.length, Math.ceil(reveal)), mx = Math.max(...vols);
  ch.clip(ctx, () => {
    for (let i = Math.max(0, Math.floor(ch.v.i0)); i < n; i++) {
      const q = ch.c[i], x = ch.X(i), w = ch.cw() * 0.68, f = i === n - 1 ? reveal - Math.floor(reveal) || 1 : 1, vh = vols[i] / mx * h * f;
      const hl = highlight && highlight(i);
      ctx.save(); ctx.globalAlpha *= hl ? 1 : alpha; ctx.fillStyle = q.c >= q.o ? C.up : C.down; if (hl) { ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 25; }
      ctx.fillRect(x - w / 2, ch.p.y + ch.p.h - vh, w, vh); ctx.restore();
    }
  });
}
// generic chart scene frame
const PANEL_STD = [40, 370, 1000, 970];
function stdChart(ch, lt, frames, o = {}) {
  const [i0, i1] = kf(lt, frames); ch.layout(...(o.panel || PANEL_STD), o.layout || {});
  if (o.p) ch.view(i0, i1, ...o.p); else ch.view(i0, i1, ...ch.autoP(o.autoFrom ?? i0, o.autoTo ?? i1, o.pad ?? 0.14));
  return ch;
}

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

// Shared blocks for the "כל האמת על הכסף שלכם" series: end card, fast montage, split screen, stats.
'use strict';
const SERIES = { handle: '@eliran_elimeleh', name: 'Eliran Elimeleh', heName: 'אלירן אלימלך', posts: 73, followers: 9783, following: 109 };

// fast montage: cuts between clips at given local times, with a 2-frame white flash on each cut
function montage(ctx, s, shots, o = {}) {
  let k = 0; for (let i = 0; i < shots.length; i++) if (s.lt >= shots[i].at) k = i;
  const sh = shots[k], lt = s.lt - sh.at;
  clip(ctx, sh.id, lt, { zoom: sh.zoom || [1.12, 1.0], dur: sh.dur || 3, rate: sh.rate, from: sh.from, px: sh.px, bw: sh.bw, dark: sh.dark ?? o.dark, tint: sh.tint });
  if (k > 0 && lt < .07) { ctx.fillStyle = 'rgba(255,248,230,.75)'; ctx.fillRect(0, 0, W, H); }
  return { k, lt };
}
function splitScreen(ctx, s, L, Rr, p, o = {}) { // two clips side by side with a gold seam; p opens the split
  const e = E.expo(clamp(p)), mid = W / 2;
  clip(ctx, Rr.id, s.lt, { x: mid + 6, y: 0, w: mid - 6, h: H, zoom: [1.15, 1.02], dur: 5, dark: Rr.dark ?? .15, bw: Rr.bw, px: Rr.px });
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, lerp(W, mid - 6, e), H); ctx.clip();
  clip(ctx, L.id, s.lt, { zoom: [1.15, 1.02], dur: 5, dark: L.dark ?? .15, bw: L.bw, px: L.px }); ctx.restore();
  if (e > 0) { ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 30; ctx.fillRect(lerp(W, mid - 6, e), 0, 12, H); ctx.shadowBlur = 0; }
}
function vsBadge(ctx, x, y, p) {
  if (p <= 0) return; const e = E.back(clamp(p)); ctx.save(); ctx.translate(x, y); ctx.scale(e, e); ctx.rotate((1 - e) * .8);
  ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fillStyle = C.ink; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.gold; ctx.stroke();
  txt(ctx, 'VS', 0, 4, { size: 58, color: C.gold, shadow: false }); ctx.restore();
}
// label tag with a gold underline, e.g. over a split side
function tag(ctx, s, x, y, p, o = {}) {
  if (p <= 0) return; const e = E.back(clamp(p)), size = o.size || 54;
  ctx.save(); ctx.globalAlpha *= clamp(p * 3); ctx.translate(x, y + (1 - e) * 40);
  const m = tw(ctx, s, size, 900) + size; rr(ctx, -m / 2, -size * .8, m, size * 1.6, 18);
  ctx.fillStyle = o.bg || 'rgba(6,6,6,.78)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = o.color || C.gold; ctx.stroke();
  txt(ctx, s, 0, 3, { size, color: o.color || C.gold, shadow: false }); ctx.restore();
}
function moneyStack(ctx, x, y, n, p, o = {}) { // stacked bill bars growing (for "millions/billions")
  const bw = o.w || 200, bh = o.h || 22;
  for (let i = 0; i < n; i++) {
    const q = E.back(clamp(p * n - i)); if (q <= 0) break;
    ctx.save(); ctx.translate(x, y - i * (bh + 4)); ctx.scale(q, 1);
    rr(ctx, -bw / 2, -bh / 2, bw, bh, 5); const g = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
    g.addColorStop(0, '#2f6b45'); g.addColorStop(.5, '#7bd39b'); g.addColorStop(1, '#2f6b45'); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-12, -bh / 2, 24, bh); ctx.restore();
  }
}

// ---------- end card ----------
// Phase 1 (teaser): "next part" card; phase 2 (from the follow cue): creator profile with a tapped FOLLOW button.
function endCard(ctx, s, o) {
  const tz = o.teaserAt ?? 0, fz = o.followAt, tap = fz + .9;
  if (o.bg) clip(ctx, o.bg, s.lt, { zoom: [1.1, 1.25], dur: 9, dark: .35 + .3 * s.p(fz - .3, fz + .3), from: o.bgFrom });
  else blackBG(ctx, s.t);
  ctx.fillStyle = `rgba(0,0,0,${.25 + .35 * s.p(tz, tz + .5)})`; ctx.fillRect(0, 0, W, H);
  dust(ctx, s.t, { a: .7 * s.p(tz, tz + 1) });
  const flipP = s.p(fz - .25, fz + .25); // flip teaser -> profile
  const teaserVis = s.lt >= tz && flipP < .5, profVis = flipP >= .5;
  const sx = Math.abs(Math.cos(flipP * Math.PI));
  ctx.save(); ctx.translate(W / 2, 900); ctx.transform(flipP > 0 && flipP < 1 ? sx : 1, 0, 0, 1, 0, 0); ctx.translate(-W / 2, -900);
  if (teaserVis) teaser(ctx, s, o, s.p(tz, tz + .55));
  if (profVis) profile(ctx, s, o, tap);
  ctx.restore();
  if (o.share) { // "send it to someone" — paper plane bubble
    const sp = s.p(o.share, o.share + .4); if (sp > 0) {
      const e = E.back(sp), y = 1395; ctx.save(); ctx.translate(W / 2, y); ctx.scale(e, e);
      glass(ctx, -300, -60, 600, 120, 60, { fill: 'rgba(8,8,8,.8)' });
      icon(ctx, 'send', 200, 0, 70, C.gold); txt(ctx, 'שלחו למישהו שצריך את זה', -50, 3, { size: 40, w: 800, shadow: false });
      ctx.restore();
    }
  }
}
function teaser(ctx, s, o, p) {
  card(ctx, p, 110, 600, 860, 560, (c, w, h) => {
    glass(c, 0, 0, w, h, 44, { fill: 'rgba(10,9,7,.82)' });
    if (o.next) {
      txt(c, 'בפרק הבא', w / 2, 90, { size: 44, w: 700, color: C.dim, shadow: false });
      txt(c, `חלק ${R.spec.part + 1}`, w / 2, 200, { size: 130, color: C.gold, glow: 'rgba(245,196,81,.55)', glowR: 40 });
      const nt = o.next, sz = fitSize(c, nt, 64, w - 100, 900);
      txt(c, nt, w / 2, 330, { size: sz, shadow: false });
      const pl = .5 + .5 * Math.sin(s.lt * 6);
      c.save(); c.globalAlpha = .75 + .25 * pl; icon(c, 'lock', w / 2, 450, 70 + 6 * pl, C.gold); c.restore();
    } else { // series finale: the equation recap
      txt(c, 'המשוואה לעושר', w / 2, 90, { size: 52, w: 800, color: C.gold, shadow: false });
      const steps = ['בעיה', 'פתרון', 'סקייל', 'חופש'];
      steps.forEach((st, i) => {
        const q = E.back(clamp(p * 4 - i * .7)); if (q <= 0) return;
        const y = 190 + i * 92; c.save(); c.globalAlpha = clamp(q * 2); c.translate(w / 2, y); c.scale(q, q);
        rr(c, -230, -38, 460, 76, 38); c.fillStyle = i === 3 ? C.gold : 'rgba(255,255,255,.08)'; c.fill();
        txt(c, st, 0, 3, { size: 46, color: i === 3 ? C.ink : C.white, shadow: false }); c.restore();
        if (i < 3 && q > .9) txt(c, '↓', w / 2, y + 47, { size: 30, color: C.gold, shadow: false });
      });
    }
  }, { tilt: .6, from: .7 });
}
function profile(ctx, s, o, tap) {
  const fp = s.p(o.followAt - .05, o.followAt + .6), tp = s.p(tap, tap + .15), done = s.lt >= tap + .08;
  card(ctx, fp, 90, 520, 900, 760, (c, w, h) => {
    glass(c, 0, 0, w, h, 48, { fill: 'rgba(10,9,7,.86)' });
    const ax = w / 2, ay = 165, rot = s.lt * 1.2;
    // rotating gold halo
    c.save(); c.translate(ax, ay); c.rotate(rot); c.lineWidth = 5; c.strokeStyle = C.gold; c.setLineDash([60, 22]); c.globalAlpha = .7;
    c.beginPath(); c.arc(0, 0, 138, 0, 7); c.stroke(); c.restore();
    avatar(c, ax, ay, 115, { lw: 7, glow: 40 });
    const nm = SERIES.name, nw = tw(c, nm, 56, 800);
    txt(c, nm, w / 2 - 22, 345, { size: 56, w: 800, shadow: false }); verified(c, w / 2 + nw / 2 + 10, 345, 22);
    txt(c, SERIES.heName, w / 2 + 20, 405, { size: 34, w: 500, color: C.dim, shadow: false, align: 'left' });
    txt(c, SERIES.handle, w / 2 - 20, 405, { size: 34, w: 500, color: C.gold, shadow: false, align: 'right' });
    // stats
    const fol = SERIES.followers + (done ? 1 : 0);
    [[SERIES.following, 'במעקב'], [fol, 'עוקבים'], [SERIES.posts, 'פוסטים']].forEach(([v, l], i) => {
      const x = 170 + i * 280; const pop = i === 1 && done ? 1 + .25 * Math.exp(-(s.lt - tap) * 6) : 1;
      c.save(); c.translate(x, 485); c.scale(pop, pop); txt(c, v.toLocaleString('en-US'), 0, 0, { size: 50, w: 800, color: i === 1 && done ? C.gold : C.white, shadow: false }); c.restore();
      txt(c, l, x, 540, { size: 30, w: 500, color: C.dim, shadow: false });
    });
    // follow button
    const bx = 70, by = 600, bw = w - 140, bh = 104, press = Math.sin(tp * Math.PI) * .06;
    c.save(); c.translate(w / 2, by + bh / 2); c.scale(1 - press, 1 - press); c.translate(-w / 2, -(by + bh / 2));
    rr(c, bx, by, bw, bh, 26); c.fillStyle = done ? 'rgba(255,255,255,.14)' : C.ig;
    if (!done) { c.shadowColor = 'rgba(0,149,246,.6)'; c.shadowBlur = 30 + 15 * Math.sin(s.lt * 7); }
    c.fill(); c.shadowBlur = 0;
    txt(c, done ? 'במעקב ✓' : 'עקבו', w / 2, by + bh / 2 + 3, { size: 50, w: 800, shadow: false });
    c.restore();
    ringFx(c, w / 2, by + bh / 2, 420, s.p(tap, tap + .6), C.ig, 8);
    sparks(c, w / 2, by + bh / 2, s.p(tap, tap + .9), { n: 30, dist: 380, color: C.gold });
  }, { tilt: -.5, from: .75, dir: -1 });
  // finger comes in, taps, leaves
  const hx = kf(s.lt, [[tap - .7, 900], [tap - .05, 590], [tap + .5, 600], [tap + 1.1, 1000]], E.inOut);
  const hy = kf(s.lt, [[tap - .7, 1700], [tap - .05, 1205], [tap + .5, 1215], [tap + 1.1, 1750]], E.inOut);
  if (s.lt > tap - .7 && s.lt < tap + 1.1) hand(ctx, hx, hy, tp > 0 && tp < 1 ? 1 : 0, 1.1);
}
function endEvents(s, o) {
  const fz = o.followAt, tap = fz + .9, ev = [{ lt: o.teaserAt, type: 'riser' }, { lt: fz - .25, type: 'swoosh' }, { lt: tap, type: 'pop' }, { lt: tap + .05, type: 'correct' }];
  if (o.share) ev.push({ lt: o.share, type: 'pop' });
  return ev;
}

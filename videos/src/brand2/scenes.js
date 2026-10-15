// ALTRIX brand film v2: pain -> technology -> solutions -> people -> trial -> CTA.
// Facts and narration come from src/brand2.json. Simulated data is labelled as illustration.
'use strict';
// virtual camera: frames [[globalTime, focusX, focusY, zoom], ...]
function camK(ctx, t, frames, fn, ease = E.inOut) {
  const [cx, cy, z] = kf(t, frames, ease);
  ctx.save(); ctx.translate(CX, CY); ctx.scale(z, z); ctx.translate(-cx, -cy); fn(); ctx.restore();
}
const ST = id => segById(id).t0, SE = id => segById(id).t1;
const W_ = (id, n, o = 0) => wordT(id, n, o);
// big kinetic word that slams in
function slam(ctx, str, x, y, p, o = {}) {
  if (p <= 0) return; const s = lerp(1.8, 1, E.outExpo(clamp(p)));
  ctx.save(); ctx.globalAlpha *= clamp(p * 3); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y);
  text(ctx, str, x, y, { size: o.size || 90, weight: 900, color: o.color || '#fff', glow: o.glow ?? 40, glowColor: o.glowColor || P1, fam: o.fam || FONT, spacing: o.spacing || 0 }); ctx.restore();
}
// illustrated person (bust) at a desk, to bring a human feeling without stock photos
function person(ctx, x, y, s, o = {}) { // stylised silhouette with rim light (no stock photos / no fake faces)
  const { glow = P1, headset = false } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-120, -100, 120, 160); g.addColorStop(0, '#2b2148'); g.addColorStop(1, '#0d0a18');
  ctx.shadowColor = glow; ctx.shadowBlur = 40; ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-125, 165); ctx.quadraticCurveTo(-118, 45, 0, 42); ctx.quadraticCurveTo(118, 45, 125, 165); ctx.closePath(); ctx.fill();
  ctx.fillRect(-20, 8, 40, 44); ctx.beginPath(); ctx.ellipse(0, -32, 54, 64, 0, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 3; ctx.strokeStyle = glow; ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.ellipse(0, -32, 54, 64, 0, -1.3, 0.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(118, 165); ctx.quadraticCurveTo(112, 52, 20, 44); ctx.stroke(); ctx.globalAlpha = 1;
  if (headset) { ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, -38, 62, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.fillStyle = '#c084fc'; rrect(ctx, 50, -48, 18, 34, 6); ctx.fill(); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(58, -16); ctx.quadraticCurveTo(52, 14, 18, 8); ctx.stroke(); }
  ctx.restore();
}
function laptop(ctx, x, y, w, fn) {
  const h = w * 0.62; ctx.save(); rrect(ctx, x - w / 2, y - h, w, h, 14); ctx.fillStyle = '#0b0916'; ctx.shadowColor = 'rgba(140,70,255,0.6)'; ctx.shadowBlur = 40; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = '#3a2d5c'; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2 + 12, y - h + 12, w - 24, h - 24); ctx.clip(); fn(x - w / 2 + 12, y - h + 12, w - 24, h - 24); ctx.restore();
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 40, y + 4); ctx.lineTo(x + w / 2 + 40, y + 4); ctx.lineTo(x + w / 2 + 10, y + 26); ctx.lineTo(x - w / 2 - 10, y + 26); ctx.closePath(); ctx.fillStyle = '#2a2142'; ctx.fill(); ctx.restore();
}
function handCursor(ctx, x, y, click = 0) { // human mouse (white) vs system pointer (robot)
  cursor(ctx, x, y, click, 1.05);
}
function robotPointer(ctx, x, y, click = 0) {
  ctx.save(); ctx.translate(x, y); const k = 1 - click * 0.15; ctx.scale(k, k);
  ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fillStyle = 'rgba(124,58,237,0.9)'; ctx.shadowColor = P1; ctx.shadowBlur = 30; ctx.fill(); ctx.restore();
  icon(ctx, 'robot', x, y, 30, '#fff', { glow: 0 });
  if (click > 0.05) ring(ctx, x, y, 80, 1 - click, C.neon);
}

// ---------------- 1. opening: hit -> welcome -> dive into the trading world ----------------
const PANELS = [ // floating interface panels in pseudo-3D (x, y, w, h, depth, kind, skew)
  [300, 360, 520, 300, 1.6, 'chart', 0.12], [1620, 380, 460, 280, 1.8, 'orders', -0.12], [420, 760, 380, 180, 2.2, 'pnl', 0.08],
  [1500, 770, 420, 200, 2.0, 'ticker', -0.08], [960, 520, 760, 420, 1.15, 'main', 0], [960, 170, 360, 120, 2.6, 'algo', 0],
];
function drawPanel(ctx, kind, w, h, t, s) {
  glass(ctx, -w / 2, -h / 2, w, h, 18, { fill: 'rgba(14,10,28,0.92)', glow: 30 });
  if (kind === 'chart' || kind === 'main') { miniCandles(ctx, -w / 2 + 20, -h / 2 + 40, w - 40, h - 70, kind === 'main' ? 40 : 26, kind === 'main' ? 77 : 5, 1); text(ctx, 'EURUSD · H1', -w / 2 + 20, -h / 2 + 22, { size: 18, weight: 700, fam: MONO, align: 'left', color: C.axis }); }
  if (kind === 'orders') { ['BUY 0.10  1.08669', 'SELL 0.10  1.09039', 'BUY 0.10  1.09112'].forEach((r, k) => text(ctx, r, -w / 2 + 24, -h / 2 + 50 + k * 50, { size: 20, weight: 700, fam: MONO, align: 'left', color: k === 1 ? C.down : '#4f8cff' })); }
  if (kind === 'pnl') { text(ctx, 'Equity', -w / 2 + 24, -h / 2 + 30, { size: 18, weight: 700, fam: MONO, align: 'left', color: C.axis }); text(ctx, fmt(10000 + Math.sin(t * 1.3) * 18 + 20, 2), 0, 20, { size: 46, weight: 800, fam: MONO, color: TEAL }); }
  if (kind === 'ticker') { text(ctx, 'EUR/USD', 0, -30, { size: 30, weight: 800, fam: MONO }); text(ctx, fmt(1.0904 + Math.sin(t * 2) * 0.0006, 5), 0, 30, { size: 44, weight: 800, fam: MONO, color: Math.cos(t * 2) > 0 ? C.up : C.down }); }
  if (kind === 'algo') { ctx.beginPath(); ctx.arc(-w / 2 + 40, 0, 10, 0, 7); ctx.fillStyle = C.up; ctx.shadowColor = C.up; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0; text(ctx, 'ALGO TRADING · ON', 20, 2, { size: 24, weight: 800, fam: MONO, color: '#c8ffe9' }); }
}
function openScene(id) {
  return {
    trans: 'none', bare: id !== 's1b', captions: id === 's1b',
    events: s => id === 's1_hit' ? [{ lt: 0.0, type: 'impact', k: 1 }, { lt: 0.4, type: 'whoosh' }] : id === 's1a' ? [{ lt: 0.1, type: 'pop' }] : [{ lt: s.cue('האוטומטית'), type: 'pop' }, { lt: s.cue('לשנות'), type: 'riser' }],
    draw(ctx, s) {
      const t = s.t, a0 = ST('s1a'), b0 = ST('s1b'), b1 = SE('s1b');
      drawBG(ctx, t, { rain: 1.8, glow: 1.4 }); floorGrid(ctx, t, 1);
      // data streaks rushing past the whole time (energy)
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 60; k++) { const a = hash(k + 40) * 7, sp = 500 + hash(k) * 900, r0 = ((t * sp + hash(k + 1) * 1400) % 1400) + 40; ctx.strokeStyle = k % 4 ? 'rgba(168,85,247,0.22)' : 'rgba(46,230,200,0.25)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0 * 0.6); ctx.lineTo(CX + Math.cos(a) * (r0 + 90 + r0 * 0.15), CY + Math.sin(a) * (r0 + 90 + r0 * 0.15) * 0.6); ctx.stroke(); }
      ctx.restore();
      // the dive: camera moves forward through floating panels during s1b
      const dive = E.inOut(clamp((t - b0) / (b1 - b0)));
      const pin = prog(t, b0 - 0.6, b0 + 1.0);
      PANELS.forEach(([x, y, w, h, z, kind, sk], k) => {
        const zz = z - dive * (kind === 'main' ? 0.35 : 1.2), sc = 1 / Math.max(0.35, zz) * 0.9, a = pin * clamp(zz * 1.4) * (kind === 'main' ? 1 : 1 - clamp((0.6 - zz) * 3));
        if (a <= 0.01) return; const px = CX + (x - CX) / Math.max(0.35, zz) * 0.95, py = CY + (y - CY) / Math.max(0.35, zz) * 0.95 + (1 - pin) * 200;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(px, py); ctx.transform(1, sk * 0.5, 0, 1, 0, 0); ctx.scale(sc, sc); drawPanel(ctx, kind, w, h, t + k, s); ctx.restore();
      });
      // logo: hits at 0, holds during s1a, flies up and away in s1b
      const lp = E.outExpo(prog(t, 0, 0.5)), up = E.inOut(prog(t, b0 - 0.2, b0 + 1.2));
      const ly = lerp(400, 140, up), lsz = lerp(lerp(1400, 760, lp), 300, up);
      ctx.save(); ctx.globalAlpha = lp * (1 - 0.15 * up); drawLogo(ctx, CX, ly, lsz, 1); drawLogo(ctx, CX, ly, lsz, 0.3 * (1 - up)); ctx.restore();
      const fl = Math.max(0, 1 - t * 4); if (fl > 0) { ctx.fillStyle = `rgba(240,225,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      ring(ctx, CX, 400, 1100, prog(t, 0, 0.9)); burst(ctx, CX, 400, prog(t, 0, 1.4), P2, 60, 5, 900);
      // welcome title (s1a)
      const wa = prog(t, a0 - 0.1, a0 + 0.35) * (1 - prog(t, b0 + 0.2, b0 + 0.8));
      if (wa > 0) { text(ctx, 'WELCOME TO ALTRIX', CX, 780, { size: 30, weight: 800, fam: MONO, color: C.neon, spacing: 14, alpha: wa });
        slam(ctx, 'ברוכים הבאים לקהילת הסוחרים', CX, 870, prog(t, a0, a0 + 0.4) * (1 - prog(t, b0 + 0.2, b0 + 0.8)), { size: 80 }); }
      if (id === 's1b') {
        { const bb = prog(t, b0 + 1.5, b0 + 2.2); ctx.save(); const gb = ctx.createLinearGradient(0, 760, 0, 960); gb.addColorStop(0, 'rgba(4,2,10,0)'); gb.addColorStop(0.4, `rgba(4,2,10,${0.8 * bb})`); gb.addColorStop(1, `rgba(4,2,10,${0.8 * bb})`); ctx.fillStyle = gb; ctx.fillRect(0, 760, W, 320); ctx.restore(); }
        const p1 = pr(s, 'האוטומטית', 0.5) * (1 - pr(s, 'לשנות', 0.3)), p2 = pr(s, 'לשנות', 0.5);
        popT(ctx, CX, 860, p1, () => pill(ctx, 'AUTOMATED TRADING SYSTEM', CX, 860, { size: 34, color: P1, fam: MONO, weight: 900, glow: 40 }));
        slam(ctx, 'דרך חדשה לגשת למסחר', CX, 860, p2, { size: 78 });
      }
    },
  };
}
S.s1_hit = openScene('s1_hit'); S.s1a = openScene('s1a'); S.s1b = openScene('s1b');

// ---------------- 2. the ALTRIX promise, then the pain of manual trading ----------------
S.s2a = {
  trans: 'zoom',
  events: events([['מערכות', 'pop'], ['לפשוט', 'pop']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.8, glow: 1.2, grid: 0.8 });
    // automated pipeline loop: analysis -> entry -> management -> exit
    const steps = [['ניתוח', 'search'], ['כניסה', 'play'], ['ניהול', 'gear'], ['יציאה', 'check']], R0 = 250, cx = CX, cy = 470;
    const sp = pr(s, 'מערכות', 0.8);
    ctx.save(); ctx.globalAlpha = sp; ctx.strokeStyle = 'rgba(168,85,247,0.35)'; ctx.lineWidth = 6; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -s.t * 80; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, 7); ctx.stroke(); ctx.restore();
    const orb = s.t * 1.6; ctx.save(); ctx.globalAlpha = sp; ctx.beginPath(); ctx.arc(cx + Math.cos(orb) * R0, cy + Math.sin(orb) * R0, 14, 0, 7); ctx.fillStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 30; ctx.fill(); ctx.restore();
    steps.forEach(([l, ic], k) => { const a = -Math.PI / 2 + k * Math.PI / 2, x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0, on = Math.floor(((orb + Math.PI / 2) / (Math.PI / 2)) % 4 + 4) % 4 === k;
      iconDisc(ctx, ic, x, y, on ? 60 : 50, on ? GOLD : P2, clamp(sp * 1.5 - k * 0.15)); text(ctx, l, x + (Math.cos(a) > 0.5 ? 120 : Math.cos(a) < -0.5 ? -120 : 0), y + (Math.sin(a) > 0.5 ? 90 : Math.sin(a) < -0.5 ? -90 : 0), { size: 36, weight: 900, color: on ? GOLD : '#fff', alpha: sp }); });
    iconDisc(ctx, 'robot', cx, cy, 90, P1, sp);
    popT(ctx, CX, 860, pr(s, 'לפשוט', 0.4), () => pill(ctx, 'פשוט יותר לתפעול', CX, 860, { size: 40, color: TEAL, fill: false, weight: 900, glow: 30 }));
  },
};
// manual trading POV
const MAN = genCandles([[0, 1.0884], [14, 1.0872], [26, 1.0893], [34, 1.0880], [44, 1.0906], [52, 1.0874], [60, 1.0881]], { seed: 12, noise: 0.2 });
const MAN_ENTRY = 44;
function manualScene(id) {
  return {
    trans: id === 's2b' ? 'glitch' : 'none',
    events: s => id === 's2b' ? [['ידע', 'impact', 0.35], ['זמן', 'impact', 0.35], ['ניסיון', 'impact', 0.35], ['משמעת', 'impact', 0.5]].map(([c, ty, k]) => ({ lt: s.cue(c), type: ty, k }))
      : id === 's2c' ? [['לעקוב', 'pop'], ['לזהות', 'pop'], ['להיכנס', 'click'], ['לצאת', 'pop'], ['רגשות', 'impact', 0.6]].map(([c, ty, k]) => ({ lt: s.cue(c), type: ty, k }))
      : [{ lt: s.cue('אוטומטית') - 0.6, type: 'riser' }, { lt: s.cue('אוטומטית') + 0.1, type: 'impact', k: 0.9 }],
    draw(ctx, s) {
      const t = s.t, b0 = ST('s2b'), c0 = ST('s2c'), d0 = ST('s2d');
      const tEnter = W_('s2c', 'להיכנס'), tExit = W_('s2c', 'לצאת'), tEmo = W_('s2c', 'רגשות'), tAuto = W_('s2d', 'אוטומטית');
      const conv = prog(t, tAuto - 0.3, tAuto + 0.5); // conversion to ALTRIX
      // desaturated, colder world for manual trading
      ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(CX, 420, 50, CX, 480, 1000); g.addColorStop(0, `rgba(${lerp(60, 90, conv)},${lerp(70, 40, conv)},${lerp(100, 200, conv)},0.35)`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const camF = [[b0, 960, 520, 1.12], [c0, 960, 520, 1.0], [W_('s2c', 'לעקוב'), 820, 470, 1.18], [tEnter, 1300, 640, 1.3], [tExit, 900, 520, 1.12], [tEmo, 960, 540, 1.05], [d0, 960, 540, 1.0], [SE('s2d'), 960, 540, 1.08]];
      camK(ctx, t, camF, () => {
        // monitor
        const mx = 210, my = 150, mw = 1500, mh = 760;
        ctx.save(); rrect(ctx, mx - 16, my - 16, mw + 32, mh + 32, 22); ctx.fillStyle = '#0d0e14'; ctx.shadowColor = conv > 0 ? P1 : 'rgba(80,100,140,0.5)'; ctx.shadowBlur = 50; ctx.fill(); ctx.restore();
        const ch = new Chart(MAN, { sym: 'EURUSD', tf: 'M15', dec: 5, icon: '€', iconColor: '#2962ff' });
        ch.layout(mx, my, mw, mh - 120, { head: 70, axis: 120, foot: 36 });
        const rv = kf(t, [[b0, 26], [c0, 32], [tEnter, MAN_ENTRY + 1], [tExit, 50], [tEmo + 0.6, 52.2], [d0, 53], [SE('s2d'), 56]], E.lin)[0];
        ch.view(rv - 40, rv + 6, 1.0862, 1.0914);
        const entered = t > tEnter + 0.15, closed = t > tEmo + 0.5;
        if (entered) ch.hline(ctx, MAN[MAN_ENTRY].c, MAN_ENTRY, closed ? 52 : rv + 6, { color: '#4f8cff', dash: [10, 8], width: 2.5 });
        ch.draw(ctx, { reveal: rv, tfs: ['M5', 'M15', 'H1'] });
        ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(0,0,0,${0.7 * (1 - conv)})`; ctx.fillRect(mx, my, mw, mh); ctx.restore();
        // eye-tracking saccades
        const ep = prog(t, W_('s2c', 'לעקוב'), W_('s2c', 'לזהות') + 0.8);
        if (ep > 0 && ep < 1) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([4, 8]); ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 12 * ep; k++) { const x = mx + 120 + hash(k + 3) * (mw - 400), y = my + 120 + hash(k + 9) * (mh - 320); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
        // question marks on possible opportunities
        const qp = prog(t, W_('s2c', 'לזהות'), W_('s2c', 'לזהות') + 0.6) * (1 - prog(t, tEnter, tEnter + 0.4));
        [[30, -1], [36, 1], [41, -1]].forEach(([i, dir], k) => { if (qp <= 0) return; const q = MAN[i]; iconDisc(ctx, 'question', ch.X(i), ch.Y(dir > 0 ? q.h : q.l) - dir * 50, 26, GOLD, clamp(qp * 2 - k * 0.3)); });
        // order buttons + hesitating hand cursor
        const bx = mx + mw - 420, by = my + mh - 70, hes = prog(t, tEnter - 1.4, tEnter);
        button(ctx, 'SELL', bx, by, 170, 64, { color: C.down, size: 28, p: 1 }); button(ctx, 'BUY', bx + 200, by, 170, 64, { color: '#2962ff', size: 28, p: 1, pressed: Math.exp(-Math.abs(t - tEnter) * 10) });
        if (t > tEnter - 1.6 && t < tEmo + 1.2) {
          let cxp, cyp; if (t < tEnter) { const w = Math.sin(t * 9) * 0.5 + 0.5; cxp = lerp(bx, bx + 200, hes < 1 ? w : 1); cyp = by + 10; }
          else if (t < tEmo) { cxp = bx + 200 + Math.sin(t * 3) * 30; cyp = by + 20 + Math.cos(t * 2) * 10; } else { cxp = lerp(bx + 200, mx + 330, E.outExpo(prog(t, tEmo, tEmo + 0.4))); cyp = lerp(by, my + mh - 70, E.outExpo(prog(t, tEmo, tEmo + 0.4))); }
          if (conv < 0.5) handCursor(ctx, cxp, cyp, Math.exp(-Math.abs(t - tEnter) * 10) + Math.exp(-Math.abs(t - tEmo - 0.4) * 10));
          if (t < tEnter) { const hp = prog(t, tEnter - 1.4, tEnter - 1.0); text(ctx, '?', cxp + 40, cyp - 60, { size: 60, weight: 900, color: GOLD, alpha: hp }); }
        }
        // floating P/L of the manual trade (moves against)
        if (entered) { const n = Math.floor(rv), f = rv - n, price = closed ? MAN[52].c : formCandle(MAN[Math.min(n, MAN.length - 1)], f).c, v = (price - MAN[MAN_ENTRY].c) * 10000;
          const col = v >= 0 ? C.up : C.down; ctx.save(); rrect(ctx, mx + 30, my + mh - 100, 380, 60, 12); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          text(ctx, `${closed ? 'נסגר ידנית' : 'P/L'}  ${money(v)}$`, mx + 220, my + mh - 70, { size: 26, weight: 800, fam: closed ? FONT : MONO, color: col });
          if (!closed) button(ctx, 'CLOSE', mx + 330, my + mh - 160, 150, 52, { color: '#444', size: 22, p: prog(t, tExit, tExit + 0.3), pressed: Math.exp(-Math.abs(t - tEmo - 0.4) * 10) }); }
        // time passing (hours at the screen)
        const hrs = 2 + (t - b0) * 0.35; text(ctx, `⏱ ${String(Math.floor(hrs)).padStart(2, '0')}:${String(Math.floor((hrs % 1) * 60)).padStart(2, '0')} שעות מול המסך`, mx + mw - 30, my - 50, { size: 28, weight: 800, align: 'right', color: 'rgba(200,210,235,0.75)', alpha: 1 - conv });
      });
      // heartbeat (emotions)
      const hb = prog(t, tEmo - 0.3, tEmo + 0.3) * (1 - prog(t, d0, d0 + 0.5));
      if (hb > 0) { ctx.save(); ctx.globalAlpha = hb; ctx.strokeStyle = C.down; ctx.lineWidth = 5; ctx.shadowColor = C.down; ctx.shadowBlur = 20; ctx.beginPath();
        for (let x = 0; x <= W; x += 6) { const ph = ((x / 300) - t * 1.6) % 1, beat = ph < 0 ? ph + 1 : ph, y = 960 - (beat > 0.45 && beat < 0.5 ? -90 : beat > 0.5 && beat < 0.55 ? 120 : 0) * (1 - Math.abs(beat - 0.5) * 8); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke(); ctx.restore(); popT(ctx, 1500, 260, prog(t, tEmo + 0.3, tEmo + 0.7) * (1 - prog(t, d0, d0 + 0.4)), () => pill(ctx, 'החלטה רגשית', 1500, 260, { size: 40, color: C.down, weight: 900, glow: 40 })); }
      // s2b: the four demands slam in over the scene
      if (id === 's2b') { const bp = pr(s, 'ידע', 0.3); if (bp > 0) { ctx.save(); ctx.globalAlpha = 0.55 * bp; ctx.fillStyle = '#05060a'; ctx.fillRect(0, 330, W, 380); ctx.restore(); }
        [['ידע', 1300, 440], ['זמן', 620, 440], ['ניסיון', 1300, 600], ['משמעת', 620, 600]].forEach(([w, x, y]) => slam(ctx, w, x, y, pr(s, w, 0.3), { size: 120, glowColor: '#5a6a9a' })); }
      if (id === 's2c') { const lbl = [['לעקוב', 'לעקוב אחר הגרפים'], ['לזהות', 'לזהות הזדמנויות'], ['להיכנס', 'מתי להיכנס?'], ['לצאת', 'ומתי לצאת?']]; let cur = null; lbl.forEach(([c, l]) => { if (s.lt > s.cue(c) - 0.1) cur = [c, l]; });
        if (cur && s.lt < s.cue('רגשות')) popT(ctx, CX, 108, pr(s, cur[0], 0.3), () => pill(ctx, cur[1], CX, 108, { size: 34, color: '#6a7aa8', weight: 900, glow: 20 })); }
      // s2d: purple conversion wave
      if (id === 's2d') {
        slam(ctx, 'ומה אם...', CX, 300, prog(s.lt, 0.05, 0.4) * (1 - conv), { size: 120, glowColor: P1 });
        if (conv > 0 && conv < 1) { const wx = lerp(W + 200, -200, conv); ctx.save(); const gg = ctx.createLinearGradient(wx - 260, 0, wx + 260, 0); gg.addColorStop(0, 'rgba(168,85,247,0)'); gg.addColorStop(0.5, 'rgba(200,140,255,0.55)'); gg.addColorStop(1, 'rgba(168,85,247,0)'); ctx.fillStyle = gg; ctx.fillRect(wx - 260, 0, 520, H); ctx.restore(); }
        if (conv > 0.5) { const p = prog(t, tAuto + 0.1, tAuto + 0.5); popT(ctx, CX, 300, p, () => { glass(ctx, CX - 330, 240, 660, 120, 30, { border: C.up, glowColor: C.up }); toggle(ctx, CX - 210, 300, 1, { w: 130, h: 64 }); text(ctx, 'אוטומטי', CX + 80, 302, { size: 64, weight: 900, color: C.up }); }); }
      }
    },
  };
}
S.s2b = manualScene('s2b'); S.s2c = manualScene('s2c'); S.s2d = manualScene('s2d');

// ---------------- 3. technology in action: cinematic trading simulation ----------------
function sim2(t) {
  const tCond = W_('s3c', 'התנאים'), tOpen = W_('s3c', 'לפתוח'), tManage = W_('s3c', 'לנהל'), tClose = W_('s3c', 'ולסגור'), tB = ST('s3d') + 0.3, tLoss = ST('s3e') + 0.9, tHist = W_('s3e', 'התוצאות'), tAcc = W_('s3e', 'החשבון');
  const rv = kf(t, [[ST('s3a'), 30], [ST('s3b'), 42], [tCond, TA.i0 + 0.5], [tOpen + 0.35, TA.i0 + 1.05], [tManage, TA.i0 + 7], [tClose, TA.i1 + 1], [tB, TB.i0 + 1], [tLoss, TB.i1 + 1], [SE('s3e'), TB.i1 + 7]], E.lin)[0];
  return { rv, tCond, tOpen, tManage, tClose, tB, tLoss, tHist, tAcc };
}
function techScene(id) {
  return {
    trans: id === 's3a' ? 'zoom' : 'none', illus: true,
    events: s => { const st = sim2(s.seg.t0), L = x => x - s.seg.t0, m = { s3a: [[s.seg.t0 + 0.2, 'whoosh']], s3b: [[s.seg.t0 + 0.1, 'riser']], s3c: [[st.tCond, 'pop'], [st.tOpen + 0.35, 'click'], [st.tClose + 0.3, 'impact']], s3d: [[st.tB, 'click']], s3e: [[st.tLoss, 'click'], [st.tHist, 'pop'], [st.tAcc, 'pop']] }[id];
      return m.map(([tt, type]) => ({ lt: L(tt), type, k: 0.5 })); },
    draw(ctx, s) {
      const t = s.t, st = sim2(t), rv = st.rv, a0 = ST('s3a');
      bg(ctx, s, { rain: 0.4, glow: 0.9 });
      const cam = [[a0, 330, 250, 1.9], [a0 + 2.4, 960, 540, 1.0], [ST('s3b'), 960, 520, 1.0], [st.tCond - 0.6, 900, 470, 1.22], [st.tCond + 0.3, 1060, 520, 1.5], [st.tOpen + 0.1, 760, 470, 1.35], [st.tManage, 1080, 440, 1.4], [st.tClose + 0.2, 960, 520, 1.05], [st.tB, 960, 500, 1.12], [st.tLoss + 0.3, 1060, 420, 1.22], [st.tHist - 0.1, 960, 780, 1.45], [st.tAcc + 0.4, 760, 840, 1.55], [SE('s3e'), 960, 560, 1.0]];
      camK(ctx, t, cam, () => {
        const X0 = 40, Y0 = 70, WW = 1840, HH = 920;
        windowFrame(ctx, X0, Y0, WW, HH, 'ALTRIX · Automated Trading Terminal', { dark: 'rgba(11,9,20,0.98)' });
        ctx.fillStyle = '#120e22'; ctx.fillRect(X0 + 2, Y0 + 54, WW - 4, 50);
        text(ctx, 'EURUSD', X0 + 30, Y0 + 80, { size: 22, weight: 800, fam: MONO, align: 'left' }); text(ctx, 'H1   Trade   History', X0 + 150, Y0 + 80, { size: 19, weight: 700, fam: MONO, color: C.axis, align: 'left' });
        ctx.save(); rrect(ctx, X0 + 1300, Y0 + 62, 220, 34, 8); ctx.fillStyle = 'rgba(22,199,132,0.22)'; ctx.fill(); ctx.strokeStyle = C.up; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.arc(X0 + 1322, Y0 + 79, 6, 0, 7); ctx.fillStyle = C.up; ctx.fill(); text(ctx, 'Algo Trading', X0 + 1340, Y0 + 80, { size: 18, weight: 700, fam: MONO, color: '#c8ffe9', align: 'left' });
        const cy0 = Y0 + 106, cw = 1400, chh = 540;
        const ch = new Chart(SIM, { sym: 'EURUSD', tf: 'H1', dec: 5 });
        ch.layout(X0 + 2, cy0, cw, chh, { head: 10, axis: 120, foot: 36 });
        const i1 = rv + 7, i0 = i1 - 46; ch.view(i0, i1, 1.0852, 1.0942);
        const n = Math.floor(rv), f = rv - n, price = n < SIM.length ? formCandle(SIM[n], f).c : SIM[SIM.length - 1].c;
        // strategy data layer (generic: watches market conditions; no invented rules)
        if (t > ST('s3b') && t < st.tCond + 0.4) { const sp = prog(t, ST('s3b'), ST('s3b') + 0.5); ctx.save(); ctx.globalAlpha = sp * 0.9;
          for (let k = 0; k < 3; k++) { const sx = lerp(ch.p.x, ch.X(rv), ((t - ST('s3b')) * 0.6 + k / 3) % 1); const gg = ctx.createLinearGradient(sx - 80, 0, sx + 6, 0); gg.addColorStop(0, 'rgba(46,230,200,0)'); gg.addColorStop(1, 'rgba(46,230,200,0.3)'); ctx.fillStyle = gg; ctx.fillRect(sx - 80, ch.p.y, 86, ch.p.h); }
          for (let k = 0; k < 40; k++) { const fx = ((t * 0.5 + hash(k)) % 1), x = lerp(ch.X(rv), X0 + 1420, fx), y = lerp(ch.Y(price), Y0 + 200 + hash(k + 4) * 300, fx); ctx.fillStyle = k % 3 ? C.neon : TEAL; ctx.globalAlpha = sp * Math.sin(fx * Math.PI); ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
          ctx.restore(); }
        const trades = [TA, TB].map(tr => ({ tr, open: rv >= tr.i0 + 1, closed: rv >= tr.i1 + 1 }));
        trades.forEach(({ tr, open, closed }) => { if (!open) return; const col = tr.side === 'BUY' ? '#4f8cff' : C.down; ch.hline(ctx, SIM[tr.i0].c, tr.i0, closed ? tr.i1 : i1, { color: col, width: 2.5, dash: [10, 8], glow: 8, alpha: closed ? 0.5 : 1 }); });
        ch.draw(ctx, { reveal: rv, header: false, frame: false });
        // condition marker
        const cp = prog(t, st.tCond - 0.1, st.tCond + 0.3) * (1 - prog(t, st.tOpen + 0.6, st.tOpen + 1));
        if (cp > 0) { const x = ch.X(TA.i0), y = ch.Y(SIM[TA.i0].c); ctx.save(); ctx.globalAlpha = cp; ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(x, y, 34 + Math.sin(t * 8) * 4, 0, 7); ctx.stroke(); ctx.restore();
          popT(ctx, x, y - 80, cp, () => pill(ctx, 'תנאי האסטרטגיה התקיימו', x, y - 80, { size: 24, color: GOLD, fg: '#1a0f00', weight: 900 })); ring(ctx, x, y, 160, prog(t, st.tCond, st.tCond + 0.7), GOLD); }
        ch.clip(ctx, () => trades.forEach(({ tr, open, closed }) => {
          if (!open) return; const buy = tr.side === 'BUY', e = SIM[tr.i0].c, ex = ch.X(tr.i0), ey = ch.Y(e), p = clamp((rv - tr.i0 - 1) * 2);
          popT(ctx, ex, ey, p, () => { arrow(ctx, ex, buy ? ey + 70 : ey - 70, ex, buy ? ey + 12 : ey - 12, 1, { color: buy ? '#4f8cff' : C.down, width: 6, head: 20, glow: 14 }); pill(ctx, `${tr.side} 0.10 @ ${fmt(e, 5)}`, ex, buy ? ey + 98 : ey - 98, { size: 18, color: buy ? '#2962ff' : C.down, fam: MONO, weight: 800 }); });
          if (closed) { const c = SIM[tr.i1].c, v = pnl(tr, c), xx = ch.X(tr.i1), yy = ch.Y(c), q = clamp((rv - tr.i1 - 1) * 2), col = v >= 0 ? C.up : C.down;
            popT(ctx, xx, yy, q, () => { ctx.save(); ctx.beginPath(); ctx.arc(xx, yy, 10, 0, 7); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fill(); ctx.restore(); pill(ctx, `CLOSE ${money(v)}$`, xx, yy - 46, { size: 19, color: col, fam: MONO, weight: 800 }); });
            const fl = Math.max(0, 1 - Math.abs(rv - tr.i1 - 1.2) * 2); if (fl > 0) ring(ctx, xx, yy, 140, 1 - fl, col); }
        }));
        const live = trades.find(x => x.open && !x.closed);
        if (live) { const v = pnl(live.tr, price), col = v >= 0 ? C.up : C.down, y = ch.Y(price), x = ch.p.x + ch.p.w - 150;
          ctx.save(); rrect(ctx, x - 125, y - 70, 250, 50, 12); ctx.fillStyle = 'rgba(10,6,22,0.94)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.stroke(); ctx.restore();
          text(ctx, `P/L  ${money(v)}$`, x, y - 44, { size: 24, weight: 800, fam: MONO, color: col }); }
        // EA panel
        const px = X0 + 1420, py = Y0 + 120, pw = 400;
        ctx.save(); rrect(ctx, px, py, pw, 520, 18); ctx.fillStyle = 'rgba(124,58,237,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(190,140,255,0.35)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        icon(ctx, 'robot', px + pw - 46, py + 44, 44, C.neon); text(ctx, 'ALTRIX', px + pw - 80, py + 44, { size: 28, weight: 900, fam: MONO, align: 'right' });
        const steps = [['עוקבת אחר תנאי השוק', ST('s3b'), 'search'], ['תנאי האסטרטגיה התקיימו', st.tCond, 'target'], ['פותחת עסקה', st.tOpen, 'play'], ['מנהלת לפי הכללים', st.tManage, 'gear'], ['סוגרת אוטומטית', st.tClose, 'check']];
        let cur = -1; steps.forEach(([, at], k) => { if (t >= at - 0.05) cur = k; }); if (t > st.tB - 0.1) cur = t > st.tLoss ? 4 : 3;
        steps.forEach(([lbl, at, ic], k) => { const y = py + 120 + k * 78, on = k === cur, done = k < cur; ctx.save(); ctx.globalAlpha = on ? 1 : done ? 0.75 : 0.35;
          if (on) { rrect(ctx, px + 14, y - 32, pw - 28, 64, 12); ctx.fillStyle = 'rgba(168,85,247,0.32)'; ctx.fill(); }
          if (done) check(ctx, px + pw - 44, y, 16, 1, C.up); else iconDisc(ctx, ic, px + pw - 44, y, 18, on ? GOLD : P2, 1); text(ctx, lbl, px + pw - 76, y + 2, { size: 26, weight: on ? 900 : 700, align: 'right', color: on ? '#fff' : C.dim }); ctx.restore(); });
        text(ctx, 'ללא פעולה ידנית', px + pw / 2, py + 560 - 60, { size: 24, weight: 800, color: TEAL, alpha: prog(t, W_('s3d', 'ידני') - 0.3, W_('s3d', 'ידני') + 0.2) });
        // order ticket opened BY THE SYSTEM (robot pointer clicks BUY)
        const op = prog(t, st.tOpen - 0.4, st.tOpen) * (1 - prog(t, st.tOpen + 0.9, st.tOpen + 1.2));
        if (op > 0) { ctx.save(); ctx.globalAlpha = op; const ox = 420, oy = 240; windowFrame(ctx, ox, oy, 600, 380, 'Order · EURUSD', { dark: 'rgba(20,16,36,0.99)' });
          [['Symbol', 'EURUSD'], ['Type', 'Market Execution'], ['Volume', '0.10'], ['Price', fmt(SIM[TA.i0].c, 5)]].forEach(([k, v], j) => { text(ctx, k, ox + 40, oy + 100 + j * 50, { size: 22, weight: 700, fam: MONO, color: C.axis, align: 'left' }); text(ctx, v, ox + 250, oy + 100 + j * 50, { size: 24, weight: 800, fam: MONO, align: 'left' }); });
          const ck = Math.exp(-Math.abs(t - st.tOpen - 0.3) * 10); button(ctx, 'Sell', ox + 170, oy + 330, 220, 56, { color: '#5a2030', size: 24 }); button(ctx, 'Buy by Market', ox + 430, oy + 330, 260, 56, { color: '#2962ff', size: 24, pressed: ck });
          robotPointer(ctx, lerp(ox + 700, ox + 450, E.outCubic(prog(t, st.tOpen - 0.4, st.tOpen + 0.2))), lerp(oy + 450, oy + 345, E.outCubic(prog(t, st.tOpen - 0.4, st.tOpen + 0.2))), ck); ctx.restore(); }
        // toolbox
        const by = cy0 + chh + 16, bw = WW - 44, bx = X0 + 22, showHist = t > st.tHist - 0.2;
        ctx.save(); rrect(ctx, bx, by, bw, HH - (by - Y0) - 20, 14); ctx.fillStyle = '#0f0b1d'; ctx.fill(); ctx.restore();
        [['Trade', !showHist], ['History', showHist]].forEach(([tb, on], k) => { if (on) { ctx.fillStyle = 'rgba(168,85,247,0.4)'; ctx.fillRect(bx + 14 + k * 140, by + 10, 130, 34); } text(ctx, tb, bx + 79 + k * 140, by + 27, { size: 19, weight: 800, fam: MONO, color: on ? '#fff' : C.axis }); });
        const cols = [['Ticket', 20], ['Symbol', 170], ['Type', 330], ['Volume', 460], ['Entry', 610], [showHist ? 'Exit' : 'Price', 800], ['Profit', 1010]];
        cols.forEach(([c, dx]) => text(ctx, c, bx + dx, by + 70, { size: 18, weight: 700, fam: MONO, color: C.axis, align: 'left' }));
        const rows = []; trades.forEach(({ tr, open, closed }, k) => { if (open && (showHist ? closed : !closed)) rows.push({ tr, k, closed }); });
        rows.forEach(({ tr, k, closed }, j) => { const y = by + 110 + j * 44, ex = closed ? SIM[tr.i1].c : price, v = pnl(tr, ex), col = v >= 0 ? C.up : C.down;
          const vals = [String(84213 + k), 'EURUSD', tr.side.toLowerCase(), '0.10', fmt(SIM[tr.i0].c, 5), fmt(ex, 5), money(v)];
          cols.forEach(([, dx], c) => text(ctx, vals[c], bx + dx, y, { size: 22, weight: 700, fam: MONO, align: 'left', color: c === 6 ? col : c === 2 ? (tr.side === 'BUY' ? '#4f8cff' : C.down) : '#fff' })); });
        if (!rows.length && !showHist) text(ctx, 'אין עסקאות פתוחות · המערכת עוקבת אחר השוק', bx + bw / 2, by + 115, { size: 24, weight: 700, color: C.dim });
        const realized = trades.filter(x => x.closed).reduce((a, x) => a + pnl(x.tr, SIM[x.tr.i1].c), 0), floating = live ? pnl(live.tr, price) : 0, bal = 10000 + realized;
        text(ctx, `Balance: ${fmt(bal, 2)}   Equity: ${fmt(bal + floating, 2)}   Open P/L: ${money(floating)}`, bx + 20, by + 230, { size: 22, weight: 700, fam: MONO, align: 'left' });
        if (t > st.tAcc - 0.2) { const a = clamp((t - st.tAcc) * 3); ctx.save(); ctx.globalAlpha = a; rrect(ctx, bx + 6, by + 208, 860, 44, 10); ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.stroke(); ctx.restore(); }
        if (showHist) { const a = clamp((t - st.tHist) * 3); ctx.save(); ctx.globalAlpha = a; rrect(ctx, bx + 6, by + 86, bw - 12, 100, 10); ctx.lineWidth = 3; ctx.strokeStyle = TEAL; ctx.shadowColor = TEAL; ctx.shadowBlur = 20; ctx.stroke(); ctx.restore(); }
      });
      // screen-space titles (outside the camera)
      if (id === 's3a') { const p = prog(s.lt, 0.1, 0.5) * (1 - prog(s.lt, s.d - 0.8, s.d - 0.3)); slam(ctx, 'EUR / USD', CX, 470, p, { size: 150, fam: MONO, spacing: 6 }); text(ctx, 'FOREX · שוק המט"ח', CX, 590, { size: 40, weight: 900, color: C.neon, alpha: p }); }
      const co = [[st.tOpen, st.tManage, 'פתיחת עסקה', GOLD], [st.tManage, st.tClose, 'ניהול העסקה', GOLD], [st.tClose, st.tB, 'סגירה אוטומטית ברווח', C.up], [st.tB, st.tLoss, 'עסקה נוספת', GOLD], [st.tLoss, st.tHist, 'וגם עסקאות מפסידות', C.down], [st.tHist, SE('s3e') + 9, 'הכל שקוף: היסטוריה ומצב החשבון', TEAL]];
      co.forEach(([a, b, lbl, col]) => { if (t < a || t > b) return; const p = Math.min(clamp((t - a) * 4), 1 - clamp((t - b + 0.25) * 4)); popT(ctx, CX, 150, p, () => pill(ctx, lbl, CX, 150, { size: 32, color: col, fg: col === GOLD ? '#1a0f00' : '#fff', weight: 900, glow: 30 })); });
    },
  };
}
['s3a', 's3b', 's3c', 's3d', 's3e'].forEach(id => (S[id] = techScene(id)));
// subtitles sit above the callout band during the simulation
['s3a', 's3b', 's3c', 's3d', 's3e'].forEach(id => (S[id].capY = 1010));

// ---------------- 4. three solutions, three worlds ----------------
S.s4a = {
  trans: 'glitch',
  events: events([['שלושה', 'impact', 0.7], ['פתרונות', 'impact', 0.4], ['מרכזיים', 'impact', 0.4]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 1.4, glow: 1.4, grid: 1 });
    slam(ctx, '3 פתרונות מסחר', CX, 240, pr(s, 'שלושה', 0.35), { size: 96 });
    ['שלושה', 'פתרונות', 'מרכזיים'].forEach((c, k) => robotBadge(ctx, k, 1440 - k * 480, 580, 120, pr(s, c, 0.4, -0.1)));
  },
};
S.s4b = {
  trans: 'zoom', risk: true,
  events: events([['הראשון', 'pop'], ['סוחרת'], ['עוקבים', 'pop']]),
  draw(ctx, s) {
    const { lt, t } = s, col = ROBOTS[0].col;
    drawBG(ctx, t, { rain: 0.5, glow: 1, hue: -60 }); floorGrid(ctx, t, 0.6);
    camK(ctx, t, [[s.seg.t0, 960, 540, 1.12], [s.seg.t1, 960, 540, 1.0]], () => {
      robotBadge(ctx, 0, 1600, 330, 110, pr(s, 'הראשון', 0.5), { hot: 1 });
      // laptop with the user's own account
      const lp = prog(lt, 0.2, 0.8);
      slideIn(ctx, lp, 0, 60, () => laptop(ctx, 720, 720, 900, (x, y, w, h) => {
        ctx.fillStyle = '#0b0916'; ctx.fillRect(x, y, w, h);
        text(ctx, 'החשבון שלי · My Account', x + w - 20, y + 36, { size: 26, weight: 800, align: 'right' });
        const rp = prog(lt, cueT(s, 'סוחרת'), s.d);
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.beginPath();
        for (let i = 0; i <= 80 * rp; i++) { const v = Math.sin(i * 0.21) * 0.3 + Math.sin(i * 0.07 + 2) * 0.35 + Math.sin(i * 0.6) * 0.1; const xx = lerp(x + 30, x + w - 30, i / 80), yy = lerp(y + h - 40, y + 90, 0.5 + v * 0.5); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        ctx.stroke(); ctx.restore();
        const tr = Math.floor(rp * 6); for (let k = 0; k < tr; k++) { const up = [1, 0, 1, 1, 0, 1][k]; pill(ctx, up ? 'BUY ✓ +' : 'SELL ✓ −', x + 70 + k * 115, y + 80, { size: 16, color: up ? C.up : C.down, fill: false, fam: MONO }); }
      }));
      // ownership + phone tracking
      popT(ctx, 1600, 620, pr(s, 'שלכם', 0.4), () => { glass(ctx, 1380, 560, 440, 120, 24, { border: col, glowColor: col }); iconDisc(ctx, 'lock', 1760, 620, 30, col, 1); text(ctx, 'חשבון בבעלותכם', 1560, 622, { size: 38, weight: 900 }); });
      const pp = pr(s, 'עוקבים', 0.5);
      slideIn(ctx, pp, 60, 0, () => phoneFrame(ctx, 1470, 705, 240, 260, () => { ctx.fillStyle = '#0b0916'; ctx.fillRect(1470, 705, 240, 260); text(ctx, 'P/L', 1590, 770, { size: 24, weight: 800, fam: MONO, color: C.axis });
        const v = Math.sin(t * 1.7) * 14 + Math.sin(t * 0.6) * 9; text(ctx, `${money(v)}$`, 1590, 830, { size: 44, weight: 900, fam: MONO, color: v >= 0 ? C.up : C.down }); text(ctx, 'רווח או הפסד · בזמן אמת', 1590, 895, { size: 18, weight: 700, color: C.dim }); }));
    });
  },
};
S.s4c = {
  trans: 'whip', risk: true,
  events: events([['השני', 'pop'], ['מבחנים'], ['ביעדי'], ['ובמגבלות'], ['בתנאים', 'impact', 0.5], ['ממומן'], ['מהרווחים'], ['החברה']]),
  draw(ctx, s) {
    const { lt, t } = s, col = ROBOTS[1].col;
    drawBG(ctx, t, { rain: 0.5, glow: 1, hue: 40 }); floorGrid(ctx, t, 0.5);
    robotBadge(ctx, 1, 1720, 210, 80, pr(s, 'השני', 0.5), { hot: 1, label: false });
    text(ctx, 'PROP TRADING', 1600, 180, { size: 52, weight: 900, align: 'right', spacing: 3, glow: 20, glowColor: col, alpha: pr(s, 'השני', 0.5) });
    text(ctx, 'מה זה נוסטרו? חברות מסחר שמעמידות חשבון מסחר לסוחרים שעומדים במבחן', 1600, 240, { size: 26, weight: 700, align: 'right', color: '#ffe2a0', alpha: pr(s, 'מבחנים', 0.5) });
    // evaluation track with a moving token
    const nodes = [['מבחן הערכה', 'doc', 'מבחנים'], ['יעדים ומגבלות', 'target', 'ביעדי'], ['עמידה בתנאים', 'check', 'בתנאים'], ['חשבון ממומן', 'building', 'ממומן'], ['חלוקת רווחים', 'handshake', 'מהרווחים']];
    const y = 420, xs = nodes.map((_, k) => 1650 - k * 340);
    ctx.save(); ctx.strokeStyle = 'rgba(255,201,77,0.2)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(xs[0], y); ctx.lineTo(xs[4], y); ctx.stroke(); ctx.restore();
    let cur = -1; nodes.forEach(([, , c], k) => { if (lt > cueT(s, c) - 0.1) cur = k; });
    const tokX = cur < 0 ? xs[0] + 120 : lerp(cur ? xs[cur - 1] : xs[0] + 120, xs[cur], E.inOut(prog(lt, cueT(s, nodes[cur][2]) - 0.1, cueT(s, nodes[cur][2]) + 0.5)));
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.beginPath(); ctx.moveTo(xs[0] + 120, y); ctx.lineTo(tokX, y); ctx.stroke(); ctx.restore();
    nodes.forEach(([l, ic, c], k) => { const p = pr(s, c, 0.4); iconDisc(ctx, ic, xs[k], y, k === cur ? 58 : 46, k <= cur ? col : 'rgba(255,201,77,0.4)', Math.max(0.35, p)); text(ctx, l, xs[k], y + 95, { size: 30, weight: 900, alpha: Math.max(0.35, p), color: k === cur ? col : '#fff' }); });
    ctx.save(); ctx.beginPath(); ctx.arc(tokX, y - 80, 22, 0, 7); ctx.fillStyle = '#fff'; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.fill(); ctx.restore(); icon(ctx, 'user', tokX, y - 80, 30, '#1a0f00', { glow: 0 });
    // meters: profit target fills, risk limit respected
    const mp = pr(s, 'ביעדי', 0.5);
    slideIn(ctx, mp, 0, 40, () => {
      glass(ctx, 1020, 580, 800, 230, 26, { border: col, glowColor: 'rgba(255,201,77,0.3)' });
      text(ctx, 'יעד רווח', 1780, 625, { size: 30, weight: 900, align: 'right' }); progressBar(ctx, 1060, 650, 720, 22, E.outCubic(prog(lt, cueT(s, 'ביעדי'), cueT(s, 'בתנאים'))), { color: C.up, color2: '#7dffc4' });
      text(ctx, 'מגבלת סיכון', 1780, 715, { size: 30, weight: 900, align: 'right', alpha: pr(s, 'ובמגבלות', 0.4) });
      const rl = pr(s, 'ובמגבלות', 0.4); if (rl > 0) { ctx.save(); ctx.globalAlpha = rl; progressBar(ctx, 1060, 740, 720, 22, 0.35 + 0.1 * Math.sin(t * 2), { color: GOLD, color2: GOLD }); ctx.fillStyle = C.down; ctx.fillRect(1060 + 720 * 0.2, 732, 5, 38); text(ctx, 'גבול', 1060 + 720 * 0.2, 790, { size: 20, weight: 800, color: C.down }); ctx.restore(); }
    });
    // funded account + profit split (no amounts, not owned by the trader)
    const fp = pr(s, 'ממומן', 0.5);
    slideIn(ctx, fp, -40, 0, () => {
      glass(ctx, 100, 580, 860, 230, 26, { border: col, glowColor: 'rgba(255,201,77,0.3)' });
      iconDisc(ctx, 'building', 880, 650, 40, col, 1); text(ctx, 'גישה לחשבון ממומן', 820, 640, { size: 34, weight: 900, align: 'right' });
      text(ctx, 'ההון שייך לחברה · ייתכן שזה חשבון סימולציה', 820, 690, { size: 24, weight: 700, align: 'right', color: '#ffe2a0' });
      const sp = pr(s, 'מהרווחים', 0.6); if (sp > 0) { const cx = 230, cy = 700; ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.6 * sp); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 70, -Math.PI / 2 + Math.PI * 2 * 0.6 * sp, Math.PI * 1.5); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill(); ctx.restore();
        text(ctx, 'חלוקת רווחים לפי ההסכם', 820, 760, { size: 28, weight: 900, align: 'right', color: col, alpha: sp }); }
    });
    text(ctx, 'משיכות וחלוקת רווחים בכפוף לכללי החברה · אין הבטחה למעבר מבחן', CX, 880, { size: 26, weight: 800, color: 'rgba(255,230,170,0.9)', alpha: pr(s, 'החברה', 0.5, -0.8) });
  },
};
S.s4d = {
  trans: 'zoom', risk: true,
  events: events([['השלישי', 'impact', 0.5], ['מאלף', 'pop'], ['מהירה'], ['מוגבר', 'impact', 0.5]]),
  draw(ctx, s) {
    const { lt, t } = s, col = ROBOTS[2].col;
    drawBG(ctx, t, { rain: 0.6, glow: 1.1, hue: 70 }); floorGrid(ctx, t, 0.5);
    robotBadge(ctx, 2, 1640, 300, 110, pr(s, 'השלישי', 0.5), { hot: 1 });
    popT(ctx, 1640, 690, pr(s, 'מאלף', 0.4), () => { glass(ctx, 1450, 630, 380, 130, 24, { border: col, glowColor: col }); text(ctx, 'חשבון החל מ־', 1640, 665, { size: 26, weight: 700, color: C.dim }); text(ctx, FX().strikeMin, 1640, 720, { size: 60, weight: 900, fam: MONO, glow: 20, glowColor: col }); });
    // one hypothetical, volatile path: rises, sharp drawdown, partial recovery
    windowFrame(ctx, 100, 170, 1260, 700, 'STRIKE · מסלול היפותטי · לא תחזית');
    const x0 = 160, x1 = 1320, ym = 560, pts = [], r = rng(31); let v = 0;
    for (let i = 0; i <= 90; i++) { const f = i / 90; v += (r() - 0.5) * 0.05 + (f < 0.45 ? 0.022 : f < 0.62 ? -0.06 : 0.012); pts.push([lerp(x0, x1, f), ym - v * 260]); }
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, ym); ctx.lineTo(x1, ym); ctx.stroke(); ctx.restore();
    text(ctx, FX().strikeMin, x0 + 6, ym - 22, { size: 22, weight: 800, fam: MONO, color: C.dim, align: 'left' });
    const gp = prog(lt, 0.3, s.d - 0.6), m = Math.floor(pts.length * gp);
    for (let i = 1; i <= m && i < pts.length; i++) { const up = pts[i][1] <= pts[i - 1][1]; ctx.save(); ctx.strokeStyle = up ? C.up : C.down; ctx.lineWidth = 6; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(...pts[i - 1]); ctx.lineTo(...pts[i]); ctx.stroke(); ctx.restore(); }
    if (m > 40) popT(ctx, pts[40][0], pts[40][1] - 50, 1, () => pill(ctx, 'צמיחה אפשרית', pts[40][0], pts[40][1] - 50, { size: 24, color: C.up, weight: 900 }));
    if (m > 58) popT(ctx, pts[58][0], pts[58][1] + 50, 1, () => pill(ctx, 'ירידה חדה אפשרית', pts[58][0], pts[58][1] + 50, { size: 24, color: C.down, weight: 900 }));
    const rp = pr(s, 'מוגבר', 0.8);
    if (rp > 0) { const gx = 1640, gy = 955; ctx.save(); ctx.lineWidth = 16; ctx.lineCap = 'round'; [[C.up, Math.PI, Math.PI * 1.33], [GOLD, Math.PI * 1.33, Math.PI * 1.66], [C.down, Math.PI * 1.66, Math.PI * 2]].forEach(([c, a, b]) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(gx, gy, 90, a, b); ctx.stroke(); });
      const a = Math.PI * (1 + 0.88 * E.outBack(rp)); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(a) * 78, gy + Math.sin(a) * 78); ctx.stroke(); ctx.restore(); text(ctx, 'סיכון מוגבר', gx, gy - 125, { size: 34, weight: 900, color: C.down, alpha: rp }); }
  },
};

// ---------------- 5. people behind the technology ----------------
S.s5a = {
  trans: 'whip',
  events: events([['החשוב', 'pop'], ['מקצועיים'], ['להכיר', 'pop']]),
  draw(ctx, s) {
    const { lt, t } = s;
    bg(ctx, s, { rain: 0.5, glow: 1.2, dots: 0.6 });
    camK(ctx, t, [[s.seg.t0, 760, 520, 1.15], [s.seg.t1, 960, 540, 1.0]], () => {
      person(ctx, 560, 440, 1.4, { glow: TEAL });
      laptop(ctx, 560, 900, 520, (x, y, w, h) => { ctx.fillStyle = '#0b0916'; ctx.fillRect(x, y, w, h); miniCandles(ctx, x + 20, y + 30, w - 40, h - 60, 24, 3, 1); });
      const a = pr(s, 'מקצועיים', 0.5);
      slideIn(ctx, a, 60, 0, () => { glass(ctx, 1000, 330, 780, 140, 30, { border: C.down, glowColor: C.down }); cross(ctx, 1720, 400, 30, 1, C.down); text(ctx, 'לא צריך להיות סוחר מקצועי', 1660, 402, { size: 44, weight: 900, align: 'right' });
        const sp = prog(lt, cueT(s, 'מקצועיים') + 0.3, cueT(s, 'מקצועיים') + 0.7); });
      popT(ctx, 1390, 580, pr(s, 'להכיר', 0.5), () => { glass(ctx, 1000, 510, 780, 140, 30, { border: C.up, glowColor: C.up }); check(ctx, 1720, 580, 30, 1, C.up); text(ctx, 'כדי להתחיל להכיר את המערכת', 1660, 582, { size: 44, weight: 900, align: 'right' }); });
    });
  },
};
S.s5b = {
  trans: 'zoom',
  events: events([['קהילה', 'pop'], ['ומאות', 'pop'], ['הצטרפו', 'pop']]),
  draw(ctx, s) {
    const { lt, t } = s;
    bg(ctx, s, { rain: 0.6, glow: 1.1, dots: 0.8 });
    waChat(ctx, s, 1220, 110, 480, 850, 'ALTRIX · קהילת מסחר', [
      { side: 'in', name: 'ALTRIX', nameColor: C.neon, t: 'סרטון חדש עלה: איך עוקבים אחר העסקאות במערכת', at: 0.2 },
      { side: 'in', name: 'חבר קהילה', nameColor: '#ffb74d', t: 'איפה רואים את היסטוריית העסקאות?', at: cueT(s, 'קהילה') + 0.3 },
      { side: 'in', name: 'צוות ALTRIX', nameColor: C.neon, t: 'בלשונית History בטרמינל. שולח לך הסבר קצר', at: cueT(s, 'ומאות') },
      { side: 'in', name: 'חבר קהילה', nameColor: '#80cbc4', t: 'תודה, ברור עכשיו', at: cueT(s, 'הצטרפו') },
    ], { group: true, sub: 'קהילה פעילה · המחשה', size: 21 });
    // orbiting member avatars around the community hub
    const hp = pr(s, 'קהילה', 0.6), cx = 620, cy = 500;
    for (let k = 0; k < 14; k++) { const a = t * (0.18 + (k % 3) * 0.06) + k * 0.45, rr = 180 + (k % 3) * 95, p = clamp(hp * 3 - k * 0.12); if (p <= 0) continue;
      avatar(ctx, cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr * 0.75, 30 * E.outBack(p) + 0.001, { color: ['#7c3aed', '#0f766e', '#b45309', '#be185d'][k % 4] }); }
    iconDisc(ctx, 'whatsapp', cx, cy, 80, WA, hp); text(ctx, 'קהילה פעילה', cx, cy + 140, { size: 44, weight: 900, alpha: hp, stroke: 10, strokeColor: 'rgba(4,2,10,0.9)' });
    popT(ctx, cx, 880, pr(s, 'ומאות', 0.5), () => text(ctx, 'מאות משתמשים כבר הצטרפו', cx, 880, { size: 52, weight: 900, color: GOLD, glow: 30, glowColor: '#ff9800' }));
  },
};
S.s5c = {
  trans: 'whip', illus: true,
  events: events([['ליווי', 'pop'], ['יסביר'], ['בהתקנה', 'click'], ['לעקוב', 'pop']]),
  draw(ctx, s) {
    const { lt, t } = s;
    bg(ctx, s, { rain: 0.4, glow: 1 });
    // the user's screen (terminal) with the staff member's remote pointer
    const T = terminal(ctx, s, [80, 120, 1240, 800]);
    const tE = cueT(s, 'יסביר'), tI = cueT(s, 'בהתקנה'), tF = cueT(s, 'לעקוב');
    const tgt = lt < tI ? [T.ea.x + 120, T.ea.y + 22] : lt < tF ? [T.algo.x + 100, T.algo.y + 18] : [T.trades.x + 300, T.trades.y + 40];
    if (lt > tF - 0.1) spotlight(ctx, T.trades.x - 8, T.trades.y - 8, T.trades.w + 16, T.trades.h + 16, prog(lt, tF, tF + 0.4), TEAL);
    else if (lt > tI - 0.1) spotlight(ctx, T.algo.x - 8, T.algo.y - 8, T.algo.w + 16, T.algo.h + 16, prog(lt, tI, tI + 0.4), GOLD);
    else if (lt > tE - 0.1) spotlight(ctx, T.ea.x - 8, T.ea.y - 8, T.ea.w + 16, T.ea.h + 16, prog(lt, tE, tE + 0.4), P2);
    const cp = kf(lt, [[0, 900, 700], [tE, T.ea.x + 120, T.ea.y + 30], [tI, T.algo.x + 100, T.algo.y + 25], [tF, T.trades.x + 300, T.trades.y + 50]]);
    ctx.save(); ctx.beginPath(); ctx.arc(cp[0], cp[1], 16, 0, 7); ctx.fillStyle = 'rgba(46,230,200,0.9)'; ctx.shadowColor = TEAL; ctx.shadowBlur = 30; ctx.fill(); ctx.restore(); text(ctx, 'איש צוות', cp[0] + 24, cp[1] + 30, { size: 20, weight: 800, align: 'left', color: TEAL });
    // staff video tile (human)
    const vx = 1360, vy = 130;
    ctx.save(); rrect(ctx, vx, vy, 480, 380, 20); ctx.fillStyle = '#16122a'; ctx.shadowColor = P1; ctx.shadowBlur = 40; ctx.fill(); ctx.restore();
    ctx.save(); rrect(ctx, vx, vy, 480, 380, 20); ctx.clip(); const gg = ctx.createLinearGradient(0, vy, 0, vy + 380); gg.addColorStop(0, '#2a1d4a'); gg.addColorStop(1, '#100c1e'); ctx.fillStyle = gg; ctx.fillRect(vx, vy, 480, 380);
    person(ctx, vx + 240, vy + 250, 1.05, { shirt: '#4c1d95', headset: true, look: Math.sin(t) * 0.4 }); ctx.restore();
    ctx.save(); rrect(ctx, vx + 14, vy + 330, 230, 36, 8); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill(); ctx.restore(); text(ctx, 'צוות ALTRIX · מחובר', vx + 30, vy + 349, { size: 20, weight: 700, align: 'left' });
    if (speaking(s.seg.id, t)) waveform(ctx, vx + 300, vy + 349, 160, 26, 1, C.up, 2);
    // guidance steps
    [['מסביר איך המערכת עובדת', 'יסביר', 'bulb'], ['עוזר בהתקנה', 'בהתקנה', 'install'], ['מראה איך לעקוב אחר כל עסקה', 'לעקוב', 'chart']].forEach(([l, c, ic], k) => {
      const p = pr(s, c, 0.4), y = 600 + k * 105, on = lt > cueT(s, c) - 0.1 && (k === 2 || lt < cueT(s, [['יסביר'], ['בהתקנה'], ['לעקוב']][k + 1][0]) - 0.1); if (p <= 0) return;
      slideIn(ctx, p, 50, 0, () => { glass(ctx, 1360, y - 45, 480, 90, 20, { border: on ? GOLD : 'rgba(190,140,255,0.3)', glowColor: on ? 'rgba(255,201,77,0.4)' : 'rgba(0,0,0,0)', glow: on ? 30 : 0 }); iconDisc(ctx, ic, 1790, y, 26, on ? GOLD : P2, 1); fitText(ctx, l, 1745, y + 2, 360, { size: 28, weight: 900, align: 'right' }); });
    });
    kicker(ctx, s, 'PERSONAL GUIDANCE', 1600, 100, 0.1, GOLD);
  },
};

// ---------------- 6. 10 days: first, test it ----------------
S.s6a = {
  trans: 'glitch',
  events: events([['פשוטה', 'pop'], ['בודקים', 'impact', 0.7]]),
  draw(ctx, s) {
    const { lt, t } = s;
    bg(ctx, s, { rain: 1, glow: 1.3, grid: 1 });
    text(ctx, 'הדרך שלנו', CX, 330, { size: 50, weight: 800, color: C.dim, alpha: prog(lt, 0.05, 0.4) });
    slam(ctx, 'דרך פשוטה', CX, 520, prog(lt, 0.15, 0.5) * (1 - pr(s, 'בודקים', 0.25, -0.3)), { size: 120, color: C.neon });
    slam(ctx, 'קודם בודקים.', CX, 520, pr(s, 'בודקים', 0.35), { size: 150 });
    const p = pr(s, 'בודקים', 1.2); if (p > 0) { const x = lerp(1500, 420, E.inOut(p)); icon(ctx, 'search', x, 700, 120, GOLD, { glow: 30 }); lineReveal(ctx, CX, 640, 1100, p, GOLD); }
  },
};
S.s6b = {
  trans: 'zoom', note: true,
  events: events([['עשרה', 'impact', 0.8], ['להכיר'], ['לשאול'], ['ולראות', 'pop']]),
  draw(ctx, s) {
    const { lt, t } = s, ct = cueT(s, 'עשרה');
    bg(ctx, s, { rain: 1.2, glow: 1.4, grid: 1 });
    slam(ctx, '10 DAYS EXPERIENCE', CX, 170, prog(lt, ct - 0.2, ct + 0.3), { size: 84, fam: MONO, spacing: 6 });
    text(ctx, 'לפני שמחליטים אם לרכוש רישיון', CX, 255, { size: 36, weight: 800, color: C.neon, alpha: pr(s, 'שמחליטים', 0.4) });
    // 10 day tiles flipping in, each a mini experience
    const ics = ['handshake', 'install', 'chat', 'chart', 'eye', 'chart', 'question', 'chart', 'chat', 'flag'];
    for (let d = 0; d < 10; d++) { const p = prog(lt, ct + d * 0.12, ct + 0.35 + d * 0.12), x = 1770 - d * 172, y = 420; if (p <= 0) continue;
      ctx.save(); ctx.translate(x, y); ctx.scale(1, E.outBack(p)); glass(ctx, -76, -90, 152, 180, 20, { border: d === 0 ? GOLD : 'rgba(190,140,255,0.4)', glowColor: P1, glow: 20 }); ctx.restore();
      text(ctx, `יום ${d + 1}`, x, y - 55, { size: 24, weight: 800, color: C.dim, alpha: p }); icon(ctx, ics[d], x, y + 20, 56, d === 0 ? GOLD : C.neon, { glow: 14 }); }
    // the experience: getting to know -> guided installation -> trying it out
    const stg = [['היכרות', 'bulb', 'להכיר'], ['התקנה בליווי', 'install', 'לשאול'], ['התנסות', 'chart', 'ולראות']];
    stg.forEach(([l, ic, c], k) => { const x = 1460 - k * 500, p = pr(s, c, 0.45);
      if (k) arrow(ctx, x + 360, 700, x + 140, 700, p, { color: 'rgba(230,210,255,0.6)', width: 6, head: 22 });
      iconDisc(ctx, ic, x, 700, 70, k === 2 ? GOLD : P2, p); text(ctx, l, x, 820, { size: 44, weight: 900, color: k === 2 ? GOLD : '#fff', alpha: p }); });
  },
};

// ---------------- 7. risk, CTA, tagline ----------------
S.s7a = {
  trans: 'zoom', risk: true,
  events: events([['כרוך'], ['אבל', 'pop']]),
  draw(ctx, s) {
    const { lt } = s, b = pr(s, 'אבל', 0.6);
    bg(ctx, s, { rain: lerp(0.2, 0.9, b), glow: lerp(0.6, 1.3, b) });
    cam(ctx, s, () => {
      ctx.save(); ctx.globalAlpha = 1 - 0.55 * b;
      wipeText(ctx, 'מסחר כרוך בסיכון', CX, 330, pr(s, 'כרוך', 0.5, -0.4), { size: 70, weight: 900 });
      wipeText(ctx, 'ותוצאות העבר לא מבטיחות את העתיד', CX, 420, pr(s, 'ותוצאות', 0.5), { size: 46, weight: 800, color: GOLD });
      lineReveal(ctx, CX, 480, 900, pr(s, 'כרוך', 0.8), GOLD); ctx.restore();
      slam(ctx, 'את הדרך שבה המערכת עובדת,', CX, 620, b, { size: 64 });
      slam(ctx, 'אתם יכולים להכיר בעצמכם.', CX, 720, pr(s, 'בעצמכם', 0.5, -0.6), { size: 72, color: C.neon });
    }, { k: 0.04 });
  },
};
S.s7b = {
  trans: 'flash', captions: true,
  events: events([['השאירו', 'click'], ['להכיר', 'impact', 0.6]]),
  draw(ctx, s) {
    const { lt } = s, ct = cueT(s, 'השאירו') + 0.35;
    bg(ctx, s, { rain: 1.8, glow: 1.5, grid: 1 });
    drawLogo(ctx, CX, 200, 330, 1); drawLogo(ctx, CX, 200, 330, 0.25);
    slam(ctx, '10 ימי התנסות במערכות ALTRIX', CX, 440, prog(lt, 0.05, 0.4), { size: 84 });
    const done = lt > ct, k = done ? 1 + 0.06 * Math.exp(-(lt - ct) * 6) : 1;
    popT(ctx, CX, 630, prog(lt, 0.25, 0.6), () => { ctx.save(); ctx.translate(CX, 630); ctx.scale(k, k); ctx.translate(-CX, -630);
      rrect(ctx, CX - 380, 630 - 58, 760, 116, 58); const g = ctx.createLinearGradient(CX - 380, 0, CX + 380, 0); g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#c084fc'); ctx.fillStyle = g; ctx.shadowColor = P1; ctx.shadowBlur = 70; ctx.fill(); ctx.restore();
      text(ctx, 'אני רוצה להתחיל להתנסות', CX, 632, { size: 50, weight: 900 }); });
    if (lt < ct + 0.7) cursor(ctx, ...kf(lt, [[0.3, 1350, 900], [ct - 0.05, CX + 150, 645]]), Math.exp(-Math.abs(lt - ct) * 12), 1.2);
    ring(ctx, CX, 630, 600, prog(lt, ct, ct + 0.8)); burst(ctx, CX, 630, prog(lt, ct, ct + 1.2), P2, 40, 51, 500);
  },
};
S.s7c = {
  trans: 'none', captions: false, bare: true,
  events: events([[0.05, 'whoosh'], ['קודם', 'pop'], ['בודקים', 'pop'], ['מחליטים', 'impact', 0.9]]),
  draw(ctx, s) {
    const { lt, d } = s;
    bg(ctx, s, { rain: 2, glow: 1.5, grid: 1 });
    // the three solutions fly into the logo
    const m = E.inCubic(prog(lt, 0, 0.9));
    [0, 1, 2].forEach(k => { const x = lerp(1440 - k * 480, CX, m), y = lerp(560, 300, m), r = lerp(100, 30, m); if (m < 0.98) { ctx.save(); ctx.globalAlpha = 1 - m * 0.8; robotBadge(ctx, k, x, y, r, 1, { label: false }); ctx.restore(); } });
    const lp = E.outBack(prog(lt, 0.8, 1.4));
    if (lp > 0) { drawLogo(ctx, CX, 300, 560 * lp, 1); drawLogo(ctx, CX, 300, 560 * lp, 0.3 + 0.15 * Math.sin(lt * 3)); }
    const fl = Math.max(0, 1 - Math.abs(lt - 0.9) * 5); if (fl > 0) { ctx.fillStyle = `rgba(235,215,255,${fl * 0.6})`; ctx.fillRect(0, 0, W, H); }
    ring(ctx, CX, 300, 1000, prog(lt, 0.9, 1.9));
    [['קודם מכירים.', 'קודם', 660, '#fff', 64], ['אחר כך בודקים.', 'בודקים', 755, '#fff', 64], ['ורק אז מחליטים.', 'מחליטים', 860, GOLD, 80]].forEach(([t2, c, y, col, sz]) => slam(ctx, t2, CX, y, pr(s, c, 0.35, c === 'קודם' ? 0 : -0.3), { size: sz, color: col, glowColor: col === GOLD ? '#ff9800' : P1 }));
    burst(ctx, CX, 300, pr(s, 'מחליטים', 1.4), P2, 50, 61, 700);
    scrim(ctx, prog(lt, d - 1.2, d - 0.1));
  },
};

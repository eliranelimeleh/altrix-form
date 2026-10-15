// ALTRIX brand film scenes. All business facts come from src/brand1.json (facts / segments).
'use strict';
const ROBOTS = [
  { code: 'ROBOT 01', en: 'LIVE ACCOUNT', he: 'חשבון מסחר פרטי', icon: 'wallet', col: '#2ee6c8' },
  { code: 'ROBOT 02', en: 'PROP TRADING', he: 'מבחני נוסטרו', icon: 'trophy', col: '#ffc94d' },
  { code: 'ROBOT 03', en: 'STRIKE', he: 'חשבונות קטנים · סיכון מוגבר', icon: 'bolt', col: '#ff4fa3' },
];
// ---------- brand overlay: logo watermark, section tag, "illustration" tag, subtitles, disclaimers ----------
window.OVERLAY = (ctx, t, seg, sc) => {
  R.t = t;
  const lt = t - seg.t0, d = seg.t1 - seg.t0, fin = Math.min(prog(lt, 0.1, 0.5), 1 - prog(t, R.tl.duration - 1.6, R.tl.duration - 0.8));
  const chp = chapter(chOf(seg.id));
  if (!sc.bare && !seg.card) {
    drawLogo(ctx, 140, 62, 210, 0.85 * fin, 'mark');
    if (chp && !sc.illus) text(ctx, chp.en, 1840, 56, { size: 20, weight: 700, fam: MONO, color: 'rgba(227,196,255,0.7)', align: 'right', spacing: 5, alpha: fin });
  }
  if (sc.illus) { const a = fin; popT(ctx, 1640, 56, a, () => pill(ctx, '● ' + FX().illus, 1640, 56, { size: 19, color: GOLD, fill: false, glow: 12 })); }
  if (sc.captions !== false && R.tl.subs) {
    const c = R.tl.subs.find(c => t >= c.t0 && t < c.t1);
    if (c) {
      const a = Math.min(prog(t, c.t0, c.t0 + 0.12), 1 - prog(t, c.t1 - 0.1, c.t1)), y = sc.capY || 1004;
      let size = 36; while (size > 24 && measure(ctx, c.text, size, 700) > 1600) size -= 2;
      const tw = measure(ctx, c.text, size, 700);
      ctx.save(); ctx.globalAlpha = a * 0.9; rrect(ctx, CX - tw / 2 - 28, y - 29, tw + 56, 58, 14); ctx.fillStyle = 'rgba(6,3,16,0.72)'; ctx.fill(); ctx.restore();
      text(ctx, c.text, CX, y + 1, { size, weight: 700, alpha: a });
    }
  }
  const note = sc.risk ? FX().risk : sc.note ? FX().trialNote : null;
  if (note) { const a = prog(lt, 0.3, 0.8) * (1 - prog(lt, d - 0.3, d)); text(ctx, note, CX, 1058, { size: 18, weight: 600, color: 'rgba(255,214,120,0.78)', alpha: a }); }
  if (R.tl.preview) text(ctx, 'PREVIEW', CX, 30, { size: 18, weight: 700, color: 'rgba(255,255,255,0.35)' });
};
// hexagonal robot emblem
function robotBadge(ctx, k, x, y, r, p = 1, o = {}) {
  if (p <= 0) return; const R0 = ROBOTS[k], col = R0.col;
  popT(ctx, x, y, p, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin((R.t || 0) * 0.6 + k) * 0.03);
    const hex = rr => { ctx.beginPath(); for (let j = 0; j < 6; j++) { const a = Math.PI / 6 + j * Math.PI / 3; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); };
    hex(r); const g = ctx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, col + 'aa'); g.addColorStop(1, 'rgba(18,8,40,0.95)'); ctx.fillStyle = g; ctx.shadowColor = col; ctx.shadowBlur = 50 + (o.hot || 0) * 40; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); hex(r * 0.8); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke();
    // orbit ring
    ctx.save(); ctx.rotate((R.t || 0) * (0.5 + k * 0.2)); ctx.setLineDash([6, 14]); ctx.strokeStyle = col; ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r * 1.22, 0, 7); ctx.stroke(); ctx.restore();
    ctx.restore();
    icon(ctx, R0.icon, x, y - r * 0.12, r * 0.85, '#fff', { glow: 20 });
    text(ctx, R0.code, x, y + r * 0.5, { size: Math.max(14, r * 0.17), weight: 800, fam: MONO, color: '#fff', spacing: 2 });
    if (o.label !== false) { fitText(ctx, R0.en, x, y + r * 1.55, r * 3.2, { size: Math.max(20, r * 0.36), weight: 900, fam: FONT, spacing: 3, color: '#fff', glow: 20, glowColor: col }); text(ctx, R0.he, x, y + r * 1.55 + Math.max(26, r * 0.42), { size: Math.max(18, r * 0.26), weight: 800, color: col }); }
  });
}
function lineReveal(ctx, x, y, w, p, col = P2) { const lw = w * E.outExpo(clamp(p)); const g = ctx.createLinearGradient(x - lw / 2, 0, x + lw / 2, 0); g.addColorStop(0, 'rgba(168,85,247,0)'); g.addColorStop(0.5, col); g.addColorStop(1, 'rgba(168,85,247,0)'); ctx.fillStyle = g; ctx.fillRect(x - lw / 2, y, lw, 3); }

// ---------------- 0:00 intro: fly-through of financial data -> logo ----------------
S.b_intro = {
  bare: true, captions: false, trans: 'none',
  events: s => [{ lt: 0, type: 'riser' }, { lt: 1.9, type: 'impact', k: 0.9 }, { lt: 2.7, type: 'pop' }],
  draw(ctx, s) {
    const { lt } = s;
    ctx.fillStyle = C.bg0; ctx.fillRect(0, 0, W, H);
    drawBG(ctx, s.t, { rain: lerp(0, 1.8, prog(lt, 1.6, 3)), glow: lerp(0.2, 1.4, prog(lt, 1.4, 2.4)) });
    // perspective fly-through: price tags, candles, code fragments rush toward the camera
    const speed = lerp(1.2, 0.15, E.outCubic(prog(lt, 1.4, 2.2))), z0 = lt * 1.6 * speed + lt * 0.4, frag = ['EURUSD 1.09136', 'BUY 0.10', 'SELL 0.10', 'if (conditions) open()', '1.08942', 'risk.check()', 'GBPUSD 1.27410', 'manage(trade)', '0x3F2A', 'P/L +12.40', 'P/L -8.15', 'close()'];
    const fade = 1 - prog(lt, 1.8, 2.4);
    ctx.save();
    for (let k = 0; k < 90; k++) {
      let z = ((hash(k) * 6 - z0 * 1.1) % 6 + 6) % 6 + 0.15; const px = (hash(k + 1) - 0.5) * 9, py = (hash(k + 2) - 0.5) * 5;
      const sx = CX + px / z * 260, sy = 470 + py / z * 260, sc = 1 / z; if (sx < -200 || sx > W + 200 || sy < -200 || sy > H + 200) continue;
      ctx.globalAlpha = fade * clamp((6 - z) / 4) * clamp(z * 2);
      if (k % 3 === 0) { const up = hash(k + 4) > 0.45, h = 60 * sc, col = up ? C.up : C.down; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.fillRect(sx - 9 * sc, sy - h / 2, 18 * sc, h); ctx.fillRect(sx - 1.5 * sc, sy - h, 3 * sc, h * 2); ctx.shadowBlur = 0; }
      else { ctx.font = `600 ${Math.max(6, 26 * sc)}px "${MONO}"`; ctx.fillStyle = k % 3 === 1 ? 'rgba(200,170,255,0.9)' : 'rgba(46,230,200,0.85)'; ctx.textAlign = 'center'; ctx.fillText(frag[k % frag.length], sx, sy); }
    }
    ctx.restore();
    // light streak tunnel
    if (lt < 2.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 24; k++) { const a = hash(k + 40) * 7, r0 = 80 + ((lt * 600 + hash(k) * 900) % 900); ctx.strokeStyle = `rgba(168,85,247,${0.25 * fade})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * r0, 470 + Math.sin(a) * r0 * 0.6); ctx.lineTo(CX + Math.cos(a) * (r0 + 120), 470 + Math.sin(a) * (r0 + 120) * 0.6); ctx.stroke(); } ctx.restore(); }
    // logo resolve
    const lp = E.outCubic(prog(lt, 1.8, 2.8)), sc = lerp(1.35, 1, lp);
    if (lp > 0) { ctx.save(); ctx.globalAlpha = lp; ctx.translate(CX, 430); ctx.scale(sc, sc); ctx.translate(-CX, -430); drawLogo(ctx, CX, 430, 820, 1); drawLogo(ctx, CX, 430, 820, 0.25 + 0.15 * Math.sin(lt * 4)); ctx.restore(); }
    const fl = Math.max(0, 1 - Math.abs(lt - 1.9) * 5); if (fl > 0) { ctx.fillStyle = `rgba(235,215,255,${fl * 0.7})`; ctx.fillRect(0, 0, W, H); }
    ring(ctx, CX, 430, 1000, prog(lt, 1.9, 2.9)); burst(ctx, CX, 430, prog(lt, 1.9, 3.2), P2, 50, 3, 700);
    const tp = prog(lt, 2.6, 3.4);
    text(ctx, 'AUTOMATED TRADING TECHNOLOGY', CX, 800, { size: 34, weight: 800, fam: MONO, color: C.neon, spacing: lerp(30, 12, E.outExpo(tp)), alpha: tp, glow: 20, glowColor: P1 });
    lineReveal(ctx, CX, 838, 900, prog(lt, 2.8, 3.6));
  },
};
S.b1a = {
  trans: 'none', captions: false, bare: true,
  events: events([['ברוכים', 'pop']]),
  draw(ctx, s) {
    const { lt } = s, mv = E.inOut(prog(lt, 0, 0.9));
    drawBG(ctx, s.t, { rain: 1.8, glow: 1.4 }); floorGrid(ctx, s.t, mv);
    const y = lerp(430, 330, mv), sz = lerp(820, 620, mv);
    drawLogo(ctx, CX, y, sz, 1); drawLogo(ctx, CX, y, sz, 0.25);
    text(ctx, 'AUTOMATED TRADING TECHNOLOGY', CX, lerp(800, 640, mv), { size: 30, weight: 800, fam: MONO, color: C.neon, spacing: 12, alpha: 1 - prog(lt, 0, 0.25) });
    kicker(ctx, s, 'WELCOME TO ALTRIX', CX, 690, Math.max(0.35, cueT(s, 'ברוכים')), C.neon);
    popT(ctx, CX, 790, pr(s, 'ברוכים', 0.45), () => text(ctx, 'ברוכים הבאים ל־ALTRIX', CX, 790, { size: 96, weight: 900, glow: 40, glowColor: P1 }));
  },
};
S.b1b = {
  trans: 'whip',
  events: events([['אלירן', 'pop'], ['מייסד'], ['שמונה', 'impact', 0.4]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.6, glow: 1.1, grid: 0.7 });
    cam(ctx, s, () => {
      // founder monogram (placeholder for a real portrait)
      const mp = prog(lt, 0.05, 0.6), cx = 560, cy = 470;
      ctx.save(); ctx.globalAlpha = mp;
      for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.t * (0.2 + k * 0.15) * (k % 2 ? -1 : 1)); ctx.setLineDash([4 + k * 6, 10 + k * 8]); ctx.strokeStyle = [P2, TEAL, GOLD][k]; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 230 + k * 34, 0, 7); ctx.stroke(); ctx.restore(); }
      const g = ctx.createRadialGradient(cx, cy - 60, 20, cx, cy, 200); g.addColorStop(0, '#5b2ab8'); g.addColorStop(1, '#170a33'); ctx.beginPath(); ctx.arc(cx, cy, 200, 0, 7); ctx.fillStyle = g; ctx.shadowColor = P1; ctx.shadowBlur = 60; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(227,196,255,0.8)'; ctx.stroke();
      ctx.restore();
      text(ctx, 'א.א', cx, cy + 6, { size: 130, weight: 900, color: '#fff', glow: 30, glowColor: P1, alpha: mp });
      // name card
      const np = pr(s, 'אלירן', 0.6);
      slideIn(ctx, np, 80, 0, () => {
        kicker(ctx, { lt: 9 }, 'FOUNDER', 1450, 300, 0, GOLD);
        text(ctx, FX().founder, 1760, 380, { size: 92, weight: 900, align: 'right', glow: 30, glowColor: P1 });
        ctx.fillStyle = GOLD; ctx.fillRect(1760 - 560 * E.outExpo(np), 440, 560 * E.outExpo(np), 4);
      });
      slideIn(ctx, pr(s, 'מייסד', 0.5), 60, 0, () => text(ctx, 'מייסד החברה', 1760, 500, { size: 50, weight: 800, align: 'right', color: C.neon }));
      const ep = pr(s, 'שמונה', 0.6);
      slideIn(ctx, ep, 60, 0, () => { glass(ctx, 1090, 580, 670, 200, 30, { border: GOLD, glowColor: GOLD });
        const v = (8.5 * E.outCubic(prog(lt, cueT(s, 'שמונה'), cueT(s, 'שמונה') + 1.3))).toFixed(1);
        text(ctx, v, 1215, 680, { size: 110, weight: 900, fam: MONO, color: GOLD, glow: 30, glowColor: '#ff9800' });
        text(ctx, 'שנות ניסיון', 1720, 655, { size: 50, weight: 900, align: 'right' }); text(ctx, 'במסחר בשווקים הפיננסיים', 1720, 715, { size: 32, weight: 700, align: 'right', color: C.dim }); });
    }, { k: 0.03 });
  },
};
S.b1c = {
  trans: 'zoom',
  events: events([['פיתחנו', 'impact', 0.4], ['ללא'], ['טכנולוגיה', 'pop']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.8, glow: 1.2, dots: 0.7 });
    const cp = pr(s, 'פיתחנו', 0.8), cx = CX, cy = 430;
    // circuit lines from the core to three screens
    const screens = [[360, 300], [1560, 300], [1560, 640], [360, 640]];
    screens.forEach(([x, y], k) => { const p = clamp(cp * 1.6 - k * 0.15); if (p <= 0) return;
      ctx.save(); ctx.strokeStyle = k % 2 ? TEAL : P2; ctx.lineWidth = 3; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(lerp(cx, x, 0.5), cy); ctx.lineTo(lerp(cx, x, 0.5), lerp(cy, y, E.outCubic(p))); ctx.lineTo(lerp(lerp(cx, x, 0.5), x, E.outCubic(p)), lerp(cy, y, E.outCubic(p))); ctx.stroke(); ctx.restore();
      const pulse = ((s.t * 0.8 + k * 0.25) % 1); ctx.save(); ctx.beginPath(); ctx.arc(lerp(cx, lerp(cx, x, 0.5), clamp(pulse * 2)), cy, 6, 0, 7); ctx.fillStyle = '#fff'; ctx.globalAlpha = p; ctx.fill(); ctx.restore();
      if (p > 0.9) { ctx.save(); ctx.globalAlpha = clamp((p - 0.9) * 10); glass(ctx, x - 170, y - 95, 340, 190, 18, { glow: 20 }); miniCandles(ctx, x - 150, y - 60, 300, 120, 22, 30 + k, prog(lt, cueT(s, 'פיתחנו') + 0.5, s.d)); ctx.restore(); }
    });
    // core
    const r = 130 * E.outBack(cp);
    if (r > 4) { ctx.save(); ctx.beginPath(); for (let j = 0; j < 6; j++) { const a = Math.PI / 6 + j * Math.PI / 3; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); const g = ctx.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#1b0d3a'); ctx.fillStyle = g; ctx.shadowColor = P1; ctx.shadowBlur = 60; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.neon; ctx.stroke(); ctx.restore();
      icon(ctx, 'robot', cx, cy, r * 0.9, '#fff', { glow: 24 }); }
    text(ctx, 'מערכות מסחר אוטומטיות', cx, 640, { size: 60, weight: 900, glow: 30, glowColor: P1, alpha: cp });
    popT(ctx, cx, 735, pr(s, 'ללא', 0.4), () => pill(ctx, 'גם ללא ניסיון קודם במסחר', cx, 735, { size: 34, color: TEAL, fill: false, glow: 26, weight: 900 }));
    const tp = pr(s, 'טכנולוגיה', 0.6);
    text(ctx, 'ADVANCED FINANCIAL TECHNOLOGY', cx, 835, { size: 26, weight: 800, fam: MONO, color: C.neon, spacing: lerp(26, 10, E.outExpo(tp)), alpha: tp });
  },
};

// ---------------- 0:20 how automated trading works ----------------
S.b2a = {
  trans: 'glitch',
  events: events([['איך', 'pop'], ['לשבת'], ['לחפש'], ['ולפתוח']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    kicker(ctx, s, 'AUTOMATED TRADING', CX, 170, 0);
    popT(ctx, CX, 250, pr(s, 'איך', 0.4), () => text(ctx, 'איך זה עובד?', CX, 250, { size: 84, weight: 900, glow: 30, glowColor: P1 }));
    // manual (right) is struck through item by item, robot (left) lights up
    [['לשבת מול הגרפים', 'לשבת', 'monitor'], ['לחפש הזדמנויות', 'לחפש', 'search'], ['לפתוח עסקאות ידנית', 'ולפתוח', 'user']].forEach(([t, c, ic], k) => {
      const p = pr(s, c, 0.4), y = 430 + k * 140; if (p <= 0) return;
      slideIn(ctx, p, 60, 0, () => { iconDisc(ctx, ic, 1700, y, 42, '#9a8fc4', 1); text(ctx, t, 1630, y + 2, { size: 50, weight: 800, align: 'right', color: 'rgba(255,255,255,0.75)' });
        const sp = prog(lt, cueT(s, c) + 0.5, cueT(s, c) + 0.9), tw = measure(ctx, t, 50, 800); ctx.save(); ctx.strokeStyle = C.down; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1630, y + 2); ctx.lineTo(1630 - tw * sp, y + 2); ctx.stroke(); ctx.restore(); });
    });
    const rp = prog(lt, s.d - 1.6, s.d - 0.4);
    if (rp > 0) { iconDisc(ctx, 'robot', 470, 570, 130 * E.outBack(rp) + 0.001, P1, 1); ring(ctx, 470, 570, 320, rp); text(ctx, 'ALTRIX AUTOMATION', 470, 760, { size: 30, weight: 800, fam: MONO, color: C.neon, spacing: 6, alpha: rp }); }
    arrow(ctx, 1050, 570, 700, 570, rp, { color: GOLD, width: 8, head: 30 });
  },
};
// --- trading simulation (one continuous terminal over b2b + b2c) ---
const SIM = genCandles([[0, 1.0872], [12, 1.0895], [22, 1.0878], [34, 1.0902], [44, 1.0889], [55, 1.0866], [72, 1.0911], [78, 1.0898], [83, 1.0904], [96, 1.0926], [106, 1.0915], [116, 1.0934]], { seed: 8, noise: 0.16 });
const TA = { side: 'BUY', i0: 55, i1: 72 }, TB = { side: 'SELL', i0: 83, i1: 96 };
const money = v => (Math.abs(v) < 0.005 ? '0.00' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}`);
const pnl = (tr, price) => (tr.side === 'BUY' ? price - SIM[tr.i0].c : SIM[tr.i0].c - price) * 10000 * 1.0; // 0.10 lot on EURUSD = $1 per pip
function simState(t) {
  const sb = segById('b2b'), sc = segById('b2c'), cw = (id, n, o = 0) => wordT(id, n, o);
  const kfs = [[sb.t0, 40], [cw('b2b', 'מנתח'), 46], [cw('b2b', 'התנאים'), TA.i0 + 0.5], [cw('b2b', 'לפתוח'), TA.i0 + 1.05], [cw('b2b', 'לנהל'), TA.i0 + 7], [cw('b2b', 'ולסגור'), TA.i1 + 1], [sc.t0 + 0.6, TB.i0 + 1], [cw('b2c', 'ההפסדים'), TB.i1 + 1], [sc.t1, TB.i1 + 8]];
  return { rv: kf(t, kfs, E.lin)[0], tScan: cw('b2b', 'מנתח'), tCond: cw('b2b', 'התנאים'), tOpen: cw('b2b', 'לפתוח'), tManage: cw('b2b', 'לנהל'), tClose: cw('b2b', 'ולסגור'), tB: sc.t0 + 0.6, tLoss: cw('b2c', 'ההפסדים'), tAcc: cw('b2c', 'החשבון', 0) };
}
function simScene(id) {
  return {
    trans: id === 'b2b' ? 'zoom' : 'none', illus: true,
    events: s => { const st = simState(s.seg.t0); const L = x => x - s.seg.t0; const ev = id === 'b2b' ? [[st.tScan, 'riser'], [st.tCond, 'pop'], [st.tOpen + 0.3, 'click'], [st.tClose + 0.5, 'click']] : [[st.tB, 'click'], [st.tLoss + 0.3, 'click'], [st.tAcc, 'pop']]; return ev.map(([t, type]) => ({ lt: L(t), type })); },
    draw(ctx, s) {
      const t = s.t, st = simState(t), rv = st.rv;
      bg(ctx, s, { rain: 0.25, glow: 0.8 });
      const X0 = 60, Y0 = 100, WW = 1800, HH = 850;
      windowFrame(ctx, X0, Y0, WW, HH, 'ALTRIX · Automated Trading Terminal', { dark: 'rgba(11,9,20,0.98)' });
      // toolbar
      ctx.fillStyle = '#120e22'; ctx.fillRect(X0 + 2, Y0 + 54, WW - 4, 50);
      ['EURUSD', 'H1', 'Trade', 'History'].forEach((m, k) => text(ctx, m, X0 + 30 + k * 120, Y0 + 80, { size: 19, weight: 700, fam: MONO, color: k === 0 ? '#fff' : C.axis, align: 'left' }));
      const algoOn = t > st.tScan - 0.5;
      ctx.save(); rrect(ctx, X0 + 1280, Y0 + 62, 200, 34, 8); ctx.fillStyle = algoOn ? 'rgba(22,199,132,0.22)' : 'rgba(255,255,255,0.05)'; ctx.fill(); ctx.strokeStyle = algoOn ? C.up : 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      text(ctx, 'Algo Trading', X0 + 1320, Y0 + 80, { size: 18, weight: 700, fam: MONO, color: algoOn ? '#c8ffe9' : C.axis, align: 'left' }); ctx.beginPath(); ctx.arc(X0 + 1302, Y0 + 79, 6, 0, 7); ctx.fillStyle = algoOn ? C.up : '#555'; ctx.fill();
      // chart
      const cx0 = X0 + 2, cy0 = Y0 + 106, cw = 1360, chh = 500;
      const ch = new Chart(SIM, { sym: 'EURUSD', tf: 'H1', dec: 5, icon: '€', iconColor: '#2962ff' });
      ch.layout(cx0, cy0, cw, chh, { head: 10, axis: 120, foot: 36 });
      const i1 = rv + 7, i0 = i1 - 46; ch.view(i0, i1, 1.0852, 1.0942);
      const n = Math.floor(rv), f = rv - n, price = n < SIM.length ? formCandle(SIM[n], f).c : SIM[SIM.length - 1].c;
      // scan sweep
      if (t > st.tScan && t < st.tCond + 0.3) { const sx = lerp(ch.p.x, ch.X(rv), ((t - st.tScan) * 0.7) % 1); ctx.save(); const g = ctx.createLinearGradient(sx - 60, 0, sx + 6, 0); g.addColorStop(0, 'rgba(46,230,200,0)'); g.addColorStop(1, 'rgba(46,230,200,0.35)'); ctx.fillStyle = g; ctx.fillRect(sx - 60, ch.p.y, 66, ch.p.h); ctx.restore(); }
      // trade lines (drawn under candles via defer)
      const trades = [TA, TB].map(tr => ({ tr, open: rv >= tr.i0 + 1, closed: rv >= tr.i1 + 1 }));
      trades.forEach(({ tr, open, closed }) => { if (!open) return; const col = tr.side === 'BUY' ? '#4f8cff' : C.down; ch.hline(ctx, SIM[tr.i0].c, tr.i0, closed ? tr.i1 : i1, { color: col, width: 2.5, dash: [10, 8], glow: 8, alpha: closed ? 0.5 : 1 }); });
      ch.draw(ctx, { reveal: rv, header: false, frame: false, lastTag: true });
      ch.clip(ctx, () => trades.forEach(({ tr, open, closed }) => {
        if (!open) return; const buy = tr.side === 'BUY', e = SIM[tr.i0].c, ex = ch.X(tr.i0), ey = ch.Y(e);
        const p = clamp((rv - tr.i0 - 1) * 2);
        popT(ctx, ex, ey, p, () => { arrow(ctx, ex, buy ? ey + 70 : ey - 70, ex, buy ? ey + 12 : ey - 12, 1, { color: buy ? '#4f8cff' : C.down, width: 6, head: 20, glow: 14 }); pill(ctx, `${tr.side} 0.10 @ ${fmt(e, 5)}`, ex, buy ? ey + 98 : ey - 98, { size: 18, color: buy ? '#2962ff' : C.down, fam: MONO, weight: 800 }); });
        if (closed) { const c = SIM[tr.i1].c, v = pnl(tr, c), xx = ch.X(tr.i1), yy = ch.Y(c), cp = clamp((rv - tr.i1 - 1) * 2), col = v >= 0 ? C.up : C.down;
          popT(ctx, xx, yy, cp, () => { ctx.save(); ctx.beginPath(); ctx.arc(xx, yy, 10, 0, 7); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fill(); ctx.restore(); pill(ctx, `CLOSE ${v >= 0 ? '+' : '−'}$${Math.abs(v).toFixed(2)}`, xx, yy - 46, { size: 19, color: col, fam: MONO, weight: 800 }); }); }
      }));
      // floating P/L tag next to price for the open trade
      const live = trades.find(x => x.open && !x.closed);
      if (live) { const v = pnl(live.tr, price), col = v >= 0 ? C.up : C.down, y = ch.Y(price); ctx.save(); rrect(ctx, ch.p.x + ch.p.w - 250, y - 62, 230, 40, 10); ctx.fillStyle = 'rgba(10,6,22,0.9)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        text(ctx, `P/L  ${money(v)}$`, ch.p.x + ch.p.w - 135, y - 41, { size: 20, weight: 800, fam: MONO, color: col }); }
      // EA panel (right)
      const px = X0 + 1380, py = Y0 + 120, pw = 400;
      ctx.save(); rrect(ctx, px, py, pw, 480, 18); ctx.fillStyle = 'rgba(124,58,237,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(190,140,255,0.35)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      icon(ctx, 'robot', px + pw - 46, py + 44, 44, C.neon); text(ctx, 'ALTRIX EA', px + pw - 80, py + 44, { size: 26, weight: 900, fam: MONO, align: 'right' });
      const steps = [['סורק את תנאי השוק', st.tScan, 'search'], ['תנאי האסטרטגיה התקיימו', st.tCond, 'target'], ['פותח עסקה', st.tOpen, 'play'], ['מנהל לפי הכללים', st.tManage, 'gear'], ['סוגר אוטומטית', st.tClose, 'check']];
      let cur = -1; steps.forEach(([, at], k) => { if (t >= at - 0.05) cur = k; }); if (t > st.tB - 0.1) cur = t > st.tLoss ? 4 : 3;
      steps.forEach(([lbl, at, ic], k) => { const y = py + 120 + k * 72, on = k === cur, done = k < cur; ctx.save(); ctx.globalAlpha = on ? 1 : done ? 0.75 : 0.35;
        if (on) { rrect(ctx, px + 14, y - 30, pw - 28, 60, 12); ctx.fillStyle = 'rgba(168,85,247,0.3)'; ctx.fill(); }
        if (done) check(ctx, px + pw - 44, y, 16, 1, C.up); else iconDisc(ctx, ic, px + pw - 44, y, 18, on ? GOLD : P2, 1); text(ctx, lbl, px + pw - 76, y + 2, { size: 25, weight: on ? 900 : 700, align: 'right', color: on ? '#fff' : C.dim }); ctx.restore(); });
      if (t > st.tScan && t < st.tCond) { ctx.save(); ctx.beginPath(); ctx.arc(px + 40, py + 120, 14, s.t * 6, s.t * 6 + 4); ctx.strokeStyle = TEAL; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
      // toolbox: open trades / history / account
      const by = cy0 + chh + 20, bw = WW - 44, bx = X0 + 22;
      ctx.save(); rrect(ctx, bx, by, bw, HH - (by - Y0) - 22, 14); ctx.fillStyle = '#0f0b1d'; ctx.fill(); ctx.restore();
      const showHist = t > st.tAcc - 0.2;
      [['Trade', !showHist], ['History', showHist]].forEach(([tb, on], k) => { if (on) { ctx.fillStyle = 'rgba(168,85,247,0.35)'; ctx.fillRect(bx + 14 + k * 140, by + 10, 130, 34); } text(ctx, tb, bx + 79 + k * 140, by + 27, { size: 19, weight: 800, fam: MONO, color: on ? '#fff' : C.axis }); });
      const cols = [['Ticket', 20], ['Symbol', 160], ['Type', 320], ['Volume', 450], ['Entry', 600], [showHist ? 'Exit' : 'Price', 780], ['Profit', 980]];
      cols.forEach(([c, dx]) => text(ctx, c, bx + dx, by + 70, { size: 17, weight: 700, fam: MONO, color: C.axis, align: 'left' }));
      const rows = [];
      trades.forEach(({ tr, open, closed }, k) => { if (!open) return; if (showHist ? closed : !closed) rows.push({ tr, k, closed }); });
      rows.forEach(({ tr, k, closed }, j) => { const y = by + 108 + j * 40, ex = closed ? SIM[tr.i1].c : price, v = pnl(tr, ex), col = v >= 0 ? C.up : C.down;
        const vals = [String(84213 + k), 'EURUSD', tr.side.toLowerCase(), '0.10', fmt(SIM[tr.i0].c, 5), fmt(ex, 5), money(v)];
        cols.forEach(([, dx], c) => text(ctx, vals[c], bx + dx, y, { size: 20, weight: 700, fam: MONO, align: 'left', color: c === 6 ? col : c === 2 ? (tr.side === 'BUY' ? '#4f8cff' : C.down) : '#fff' })); });
      if (!rows.length) text(ctx, showHist ? '' : 'אין עסקאות פתוחות · המערכת סורקת', bx + bw / 2, by + 115, { size: 22, weight: 700, color: C.dim });
      // account summary
      const realized = trades.filter(x => x.closed).reduce((a, x) => a + pnl(x.tr, SIM[x.tr.i1].c), 0), floating = live ? pnl(live.tr, price) : 0, bal = 10000 + realized;
      const sum = `Balance: ${fmt(bal, 2)}   Equity: ${fmt(bal + floating, 2)}   Open P/L: ${money(floating)}`;
      text(ctx, sum, bx + 20, by + 205, { size: 20, weight: 700, fam: MONO, align: 'left' });
      if (showHist) { const a = clamp((t - st.tAcc) * 3); ctx.save(); ctx.globalAlpha = a; rrect(ctx, bx + 6, by + 186, 760, 38, 10); ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.stroke(); ctx.restore(); }
      // callouts synced to narration
      const co = [[st.tOpen, st.tManage, 'פתיחת עסקה'], [st.tManage, st.tClose, 'רווח והפסד צף'], [st.tClose, st.tB, 'סגירה אוטומטית'], [st.tB, st.tLoss, 'עסקה חדשה'], [st.tLoss, st.tAcc, 'גם עסקה בהפסד'], [st.tAcc, s.seg.t1 + 99, 'היסטוריית עסקאות ומצב החשבון']];
      co.forEach(([a, b, lbl]) => { if (t < a || t > b) return; const p = Math.min(clamp((t - a) * 4), 1 - clamp((t - b + 0.25) * 4)); popT(ctx, 360, 150 + Y0, p, () => pill(ctx, lbl, 360, 150 + Y0, { size: 30, color: lbl.includes('הפסד') ? C.down : GOLD, fg: lbl.includes('הפסד') ? '#fff' : '#1a0f00', weight: 900, glow: 30 })); });
    },
  };
}
S.b2b = simScene('b2b'); S.b2c = simScene('b2c');

// ---------------- 0:48 three robots ----------------
S.b3a = {
  trans: 'glitch', captions: true,
  events: events([['שלושה', 'impact', 0.6]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 1, glow: 1.3, grid: 0.9 });
    kicker(ctx, s, '3 TRADING SOLUTIONS', CX, 170, 0.05);
    popT(ctx, CX, 250, prog(s.lt, 0.1, 0.5), () => text(ctx, 'שלושה פתרונות מסחר', CX, 250, { size: 80, weight: 900, glow: 34, glowColor: P1 }));
    [0, 1, 2].forEach(k => robotBadge(ctx, k, 1440 - k * 480, 540, 110, prog(lt, cueT(s, 'פתרונות') + k * 0.2, cueT(s, 'פתרונות') + 0.5 + k * 0.2)));
  },
};
S.b3b = {
  trans: 'zoom', risk: true, illus: false,
  events: events([['הראשון', 'impact', 0.4], ['מתחברת'], ['ומבצעת'], ['ישירות']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1, hue: -30 });
    robotBadge(ctx, 0, 1580, 400, 120, pr(s, 'הראשון', 0.5), { hot: 1 });
    // user -> account -> robot
    const a = pr(s, 'מתחברת', 0.6), b = pr(s, 'ומבצעת', 0.5), c = pr(s, 'ישירות', 0.5);
    avatar(ctx, 250, 330, 70 * E.outBack(clamp(prog(lt, 0.2, 0.7))) + 0.001, { color: '#0f766e', label: 'המשתמש' });
    iconDisc(ctx, 'wallet', 640, 330, 70, TEAL, prog(lt, 0.3, 0.8)); text(ctx, 'חשבון מסחר אישי', 640, 450, { size: 30, weight: 900, alpha: prog(lt, 0.3, 0.8) });
    arrow(ctx, 340, 330, 555, 330, prog(lt, 0.5, 0.9), { color: 'rgba(230,210,255,0.6)', width: 5, head: 18 });
    if (a > 0) { ctx.save(); ctx.strokeStyle = TEAL; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -s.t * 50; ctx.shadowColor = TEAL; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(725, 330); ctx.lineTo(725 + (1440 - 725) * E.outCubic(a), 330 + (400 - 330) * E.outCubic(a)); ctx.stroke(); ctx.restore(); icon(ctx, 'link', 1080, 300, 54, TEAL, { glow: 20 }); }
    // account panel with equity going up and down
    slideIn(ctx, b, 0, 50, () => {
      windowFrame(ctx, 140, 540, 1060, 400, 'החשבון של המשתמש · המחשה');
      const x0 = 190, x1 = 1150, y0 = 640, y1 = 860, rp = prog(lt, cueT(s, 'ומבצעת'), s.d);
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 - 20, x1 - x0, y1 - y0 + 40); ctx.clip(); ctx.strokeStyle = TEAL; ctx.lineWidth = 4; ctx.shadowColor = TEAL; ctx.shadowBlur = 12; ctx.beginPath();
      for (let i = 0; i <= 100 * rp; i++) { const v = Math.sin(i * 0.19) * 0.3 + Math.sin(i * 0.07 + 2) * 0.4 + Math.sin(i * 0.5) * 0.1; const x = lerp(x0, x1, i / 100), y = lerp(y1, y0, 0.5 + v * 0.55); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore();
      [[0.2, true], [0.38, false], [0.55, true], [0.7, false], [0.86, true]].forEach(([f, up]) => { const p = prog(rp, f, f + 0.06); if (p > 0) popT(ctx, lerp(x0, x1, f), 610, p, () => pill(ctx, up ? 'רווח' : 'הפסד', lerp(x0, x1, f), 610, { size: 20, color: up ? C.up : C.down, fill: false })); });
    });
    popT(ctx, 1580, 760, c, () => { glass(ctx, 1320, 690, 520, 140, 24, { border: TEAL, glowColor: TEAL }); text(ctx, 'רווחים והפסדים', 1580, 740, { size: 36, weight: 900 }); text(ctx, 'משתקפים ישירות בחשבון', 1580, 790, { size: 30, weight: 800, color: TEAL }); });
  },
};
S.b3c = {
  trans: 'whip', risk: true,
  events: events([['השני', 'impact', 0.4], ['הערכה'], ['ביעדי'], ['ובמגבלות'], ['שעובר'], ['ממומן'], ['ולחלוקת']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1, hue: 30 });
    robotBadge(ctx, 1, 1660, 260, 92, pr(s, 'השני', 0.5), { hot: 1, label: false });
    text(ctx, 'PROP TRADING', 1530, 230, { size: 54, weight: 900, align: 'right', spacing: 3, glow: 20, glowColor: GOLD, alpha: pr(s, 'השני', 0.5) });
    text(ctx, 'מבחני נוסטרו וחשבונות ממומנים', 1530, 295, { size: 34, weight: 800, align: 'right', color: GOLD, alpha: pr(s, 'השני', 0.5) });
    const st = [['הרשמה למבחן הערכה', 'doc', 'הערכה'], ['מסחר לפי כללי החברה', 'robot', 'ביעדי'], ['עמידה ביעדים ובמגבלות', 'target', 'ובמגבלות'], ['אישור החשבון לפי התנאים', 'check', 'שעובר'], ['חלוקת רווחים לפי ההסכם', 'handshake', 'ולחלוקת']];
    const y = 520, xs = st.map((_, k) => 1680 - k * 360);
    st.forEach(([lbl, ic, c], k) => { const p = pr(s, c, 0.45);
      if (k) { ctx.save(); ctx.strokeStyle = 'rgba(255,201,77,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xs[k - 1] - 70, y); ctx.lineTo(xs[k - 1] - 70 - (xs[k - 1] - xs[k] - 140) * E.outCubic(p), y); ctx.stroke(); ctx.restore(); }
      iconDisc(ctx, ic, xs[k], y, 62, GOLD, p); slideIn(ctx, p, 0, 20, () => { para(ctx, lbl, xs[k], y + 105, 300, { size: 28, weight: 900, align: 'center' }); text(ctx, String(k + 1), xs[k] - 50, y - 50, { size: 22, weight: 900, fam: MONO, color: GOLD }); }); });
    // larger trading scope (allocated capital is not owned by the user)
    const fp = pr(s, 'ממומן', 0.6);
    slideIn(ctx, fp, 0, 30, () => { glass(ctx, 260, 700, 1400, 165, 26, { border: GOLD, glowColor: 'rgba(255,201,77,0.35)' });
      text(ctx, 'חשבון ממומן: גישה להיקף מסחר גדול יותר', 1620, 745, { size: 34, weight: 900, align: 'right' });
      progressBar(ctx, 300, 790, 1320, 22, 0.25 + 0.75 * E.outCubic(prog(lt, cueT(s, 'ממומן'), cueT(s, 'ממומן') + 1.4)), { color: GOLD, color2: '#ffe2a0' });
      text(ctx, 'ההון המוקצה שייך לחברת הנוסטרו · החשבון הממומן עשוי להיות חשבון סימולציה', 960, 836, { size: 23, weight: 700, color: 'rgba(255,230,170,0.9)' }); });
    text(ctx, 'משיכות וחלוקת רווחים בכפוף לכללי החברה · אין הבטחה למעבר מבחן', 960, 900, { size: 23, weight: 700, color: 'rgba(255,230,170,0.9)', alpha: fp });
  },
};
S.b3d = {
  trans: 'zoom', risk: true,
  events: events([['השלישי', 'impact', 0.5], ['קטנים'], ['מאלף'], ['לצמיחת'], ['סיכון', 'impact', 0.4]]),
  draw(ctx, s) {
    const { lt } = s, col = ROBOTS[2].col;
    bg(ctx, s, { rain: 0.5, glow: 1, hue: 50 });
    robotBadge(ctx, 2, 1640, 300, 110, pr(s, 'השלישי', 0.5), { hot: 1 });
    // $1,000 account
    popT(ctx, 1640, 690, pr(s, 'מאלף', 0.5), () => { glass(ctx, 1450, 630, 380, 130, 24, { border: col, glowColor: col }); text(ctx, 'חשבון החל מ־', 1640, 665, { size: 26, weight: 700, color: C.dim }); text(ctx, FX().strikeMin, 1640, 720, { size: 60, weight: 900, fam: MONO, glow: 20, glowColor: col }); });
    // hypothetical path: growth scenario AND drawdown scenario
    const gp = pr(s, 'קטנים', 2.4), x0 = 180, x1 = 1280, ym = 560, n = 60;
    windowFrame(ctx, 120, 200, 1220, 640, 'STRIKE · מסלול היפותטי · לא תחזית');
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, ym); ctx.lineTo(x1, ym); ctx.stroke(); ctx.restore();
    text(ctx, FX().strikeMin, x0 + 10, ym - 22, { size: 22, weight: 800, fam: MONO, color: C.dim, align: 'left' });
    const path = (dir, seed) => { const r = rng(seed); let v = 0; const pts = []; for (let i = 0; i <= n; i++) { v += (r() - 0.5) * 0.09 + dir * 0.012; pts.push([lerp(x0, x1, i / n), ym - v * 300]); } return pts; };
    const up = path(1, 3), dn = path(-1.2, 9);
    // cone
    if (gp > 0) { ctx.save(); ctx.globalAlpha = 0.12 * gp; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, ym); ctx.lineTo(x1, ym - 330); ctx.lineTo(x1, ym + 290); ctx.closePath(); ctx.fill(); ctx.restore(); }
    [[up, C.up, 'תרחיש צמיחה', gp], [dn, C.down, 'תרחיש ירידה בהון', pr(s, 'סיכון', 1.2)]].forEach(([pts, c, lbl, p]) => { if (p <= 0) return; const m = Math.floor(pts.length * p);
      ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.shadowColor = c; ctx.shadowBlur = 14; ctx.beginPath(); pts.slice(0, m + 1).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
      if (p > 0.95) { const [x, y] = pts[pts.length - 1]; pill(ctx, lbl, x - 120, y + (c === C.up ? -40 : 40), { size: 24, color: c, weight: 900 }); } });
    // risk gauge
    const rp = pr(s, 'סיכון', 0.8);
    if (rp > 0) { const gx = 1640, gy = 930; ctx.save(); ctx.lineWidth = 16; ctx.lineCap = 'round'; [[C.up, Math.PI, Math.PI * 1.33], [GOLD, Math.PI * 1.33, Math.PI * 1.66], [C.down, Math.PI * 1.66, Math.PI * 2]].forEach(([c, a, b]) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(gx, gy, 90, a, b); ctx.stroke(); });
      const a = Math.PI * (1 + 0.88 * E.outBack(rp)); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(a) * 78, gy + Math.sin(a) * 78); ctx.stroke(); ctx.restore();
      text(ctx, 'רמת סיכון משמעותית', gx, gy - 125, { size: 30, weight: 900, color: C.down, alpha: rp }); }
  },
};

// ---------------- 1:32 community, 10 days, personal guidance ----------------
S.b4a = {
  trans: 'glitch',
  events: events([['2025'], ['מאות', 'pop'], ['קהילה']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.6, glow: 1.1, dots: 0.8 });
    waChat(ctx, s, 1250, 120, 470, 830, 'ALTRIX · קהילת מסחר', [
      { side: 'in', name: 'ALTRIX', nameColor: C.neon, t: 'תוכן מקצועי חדש: איך עובדת מערכת מסחר אוטומטית?', at: 0.5 },
      { side: 'in', name: 'ALTRIX', nameColor: C.neon, t: 'מפגש שאלות ותשובות פתוח לכל חברי הקהילה', at: cueT(s, 'מאות') },
      { side: 'in', name: 'ALTRIX', nameColor: C.neon, t: 'סקירה: מה חשוב לדעת על ניהול סיכונים', at: cueT(s, 'קהילה') },
    ], { group: true, sub: 'קהילה פעילה · המחשה', size: 21 });
    kicker(ctx, s, 'ALTRIX COMMUNITY', 760, 230, 0.1);
    popT(ctx, 760, 330, pr(s, '2025', 0.4), () => text(ctx, 'מאז 2025', 760, 330, { size: 90, weight: 900, fam: FONT, glow: 34, glowColor: P1 }));
    popT(ctx, 760, 470, pr(s, 'מאות', 0.4), () => { iconDisc(ctx, 'users', 1060, 470, 46, GOLD, 1); text(ctx, 'מאות משתמשים', 720, 470, { size: 64, weight: 900, color: GOLD }); });
    [['whatsapp', WA, 'וואטסאפ'], ['globe', '#4f8cff', 'רשתות חברתיות']].forEach(([ic, c, l], k) => { const p = pr(s, 'קהילה', 0.4, k * 0.15); iconDisc(ctx, ic, 920 - k * 320, 650, 54, c, p); text(ctx, l, 920 - k * 320, 750, { size: 30, weight: 800, alpha: p }); });
  },
};
S.b4b = {
  trans: 'zoom',
  events: events([['פשוט', 'pop'], ['להבין'], ['ולבדוק', 'impact', 0.5]]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.9, glow: 1.3, grid: 0.9 });
    cam(ctx, s, () => {
      wipeText(ctx, 'לפני שמחליטים,', CX, 330, pr(s, 'לפני', 0.5), { size: 70, weight: 900, color: C.dim });
      popT(ctx, 1240, 520, pr(s, 'להבין', 0.4), () => { iconDisc(ctx, 'bulb', 1240, 470, 60, TEAL, 1); text(ctx, 'מבינים', 1240, 600, { size: 90, weight: 900, color: TEAL, glow: 30, glowColor: TEAL }); });
      popT(ctx, 680, 520, pr(s, 'ולבדוק', 0.4), () => { iconDisc(ctx, 'search', 680, 470, 60, GOLD, 1); text(ctx, 'בודקים', 680, 600, { size: 90, weight: 900, color: GOLD, glow: 30, glowColor: GOLD }); });
      text(ctx, '·', CX, 600, { size: 90, weight: 900, color: C.dim, alpha: pr(s, 'ולבדוק', 0.4) });
    }, { k: 0.05 });
  },
};
S.b4c = {
  trans: 'flash', note: true,
  events: events([['עשרה', 'impact', 0.8], ['רישיון', 'pop']]),
  draw(ctx, s) {
    const { lt } = s, ct = cueT(s, 'עשרה');
    bg(ctx, s, { rain: 1.4, glow: 1.5, grid: 1 });
    const cx = CX, cy = 430, R0 = 230, on = prog(lt, ct - 0.2, ct + 1.4);
    for (let k = 0; k < 10; k++) { const a0 = -Math.PI / 2 - k * Math.PI / 5 - 0.05, a1 = a0 - Math.PI / 5 + 0.1, lit = on * 10 > k;
      ctx.save(); ctx.lineWidth = 28; ctx.lineCap = 'round'; ctx.strokeStyle = lit ? (k === 9 ? GOLD : P2) : 'rgba(168,85,247,0.15)'; if (lit) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 25; } ctx.beginPath(); ctx.arc(cx, cy, R0, a1, a0); ctx.stroke(); ctx.restore(); }
    popT(ctx, cx, cy - 25, prog(lt, ct - 0.1, ct + 0.3), () => text(ctx, '10', cx, cy - 25, { size: 210, weight: 900, fam: MONO, glow: 50, glowColor: P1 }));
    text(ctx, 'ימי התנסות', cx, cy + 110, { size: 48, weight: 900, color: C.neon, alpha: prog(lt, ct, ct + 0.4) });
    text(ctx, '10 DAYS EXPERIENCE', cx, 760, { size: 60, weight: 900, fam: MONO, spacing: lerp(30, 10, E.outExpo(prog(lt, ct + 0.3, ct + 1.2))), glow: 30, glowColor: P1, alpha: prog(lt, ct + 0.3, ct + 0.8) });
    popT(ctx, cx, 860, pr(s, 'רישיון', 0.4), () => pill(ctx, 'ללא עלות רישיון לתקופת הניסיון', cx, 860, { size: 34, color: TEAL, fill: false, glow: 26, weight: 900 }));
  },
};
S.b4d = {
  trans: 'whip', note: true,
  events: events([['לבד', 'pop'], ['יסביר'], ['בהתקנה'], ['עוקבים'], ['זמין']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    kicker(ctx, s, 'PERSONAL GUIDANCE', CX, 140, 0.05, GOLD);
    wipeText(ctx, 'לא צריך להתמודד לבד', CX, 210, pr(s, 'לבד', 0.5), { size: 60, weight: 900 });
    const steps = [['מכירים את המערכת', 'bulb', 'יסביר'], ['מתקינים בליווי אישי', 'install', 'בהתקנה'], ['מתנסים ועוקבים', 'chart', 'עוקבים']];
    let cur = -1; steps.forEach(([, , c], k) => { if (lt > cueT(s, c) - 0.1) cur = k; });
    steps.forEach(([l, ic, c], k) => { const x = 1500 - k * 540, p = pr(s, c, 0.45), on = k === cur;
      if (k) arrow(ctx, x + 400, 330, x + 130, 330, p, { color: 'rgba(230,210,255,0.6)', width: 5, head: 18 });
      iconDisc(ctx, ic, x, 330, on ? 58 : 48, on ? GOLD : P2, p); text(ctx, l, x, 425, { size: 34, weight: 900, color: on ? GOLD : '#fff', alpha: p }); });
    // stage visual below
    const vx = 260, vy = 500, vw = 1400, vh = 420;
    if (cur <= 0) { avatar(ctx, 560, 700, 110, { color: P1, headset: true, talk: 0.7, label: 'איש צוות ALTRIX' }); { const gp = pr(s, 'יסביר', 0.4, -0.2); ctx.save(); ctx.globalAlpha *= gp; glass(ctx, 820, 560, 820, 280, 30, {}); ctx.restore(); }
      [['איך המערכת עובדת', 'robot'], ['מה הסיכונים', 'shield'], ['מה רואים בחשבון', 'monitor']].forEach(([t2, ic], j) => { iconDisc(ctx, ic, 1560, 615 + j * 85, 28, TEAL, prog(lt, cueT(s, 'יסביר') + j * 0.3, cueT(s, 'יסביר') + 0.4 + j * 0.3)); text(ctx, t2, 1510, 617 + j * 85, { size: 34, weight: 800, align: 'right', alpha: prog(lt, cueT(s, 'יסביר') + j * 0.3, cueT(s, 'יסביר') + 0.4 + j * 0.3) }); }); }
    else if (cur === 1) { const a = prog(lt, cueT(s, 'בהתקנה') - 0.1, cueT(s, 'בהתקנה') + 0.3); ctx.save(); ctx.globalAlpha = a;
      windowFrame(ctx, 1080, 520, 560, 380, 'עמדת איש הצוות'); avatar(ctx, 1360, 690, 70, { color: P1, headset: true, talk: 0.6 });
      windowFrame(ctx, 280, 520, 700, 380, 'המחשב של המשתמש'); icon(ctx, 'install', 630, 660, 80, TEAL); text(ctx, 'התקנה מרחוק, באישור המשתמש', 630, 760, { size: 30, weight: 800 }); progressBar(ctx, 380, 810, 500, 16, prog(lt, cueT(s, 'בהתקנה'), cueT(s, 'עוקבים')), { color: TEAL, color2: C.up });
      ctx.save(); ctx.strokeStyle = C.up; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -s.t * 50; ctx.beginPath(); ctx.moveTo(1075, 710); ctx.lineTo(985, 710); ctx.stroke(); ctx.restore(); ctx.restore(); }
    else { const a = prog(lt, cueT(s, 'עוקבים') - 0.1, cueT(s, 'עוקבים') + 0.3); ctx.save(); ctx.globalAlpha = a;
      const T = terminal(ctx, { lt: lt, d: s.d, t: s.t }, [200, 480, 1280, 470]); ctx.restore();
      popT(ctx, 1500, 1000 - 60, prog(lt, cueT(s, 'זמין'), cueT(s, 'זמין') + 0.4), () => {});
      const zp = prog(lt, cueT(s, 'זמין'), cueT(s, 'זמין') + 0.4); if (zp > 0) popT(ctx, 1660, 700, zp, () => { glass(ctx, 1510, 600, 320, 200, 24, { fill: 'rgba(11,20,26,0.98)', border: WA }); iconDisc(ctx, 'whatsapp', 1670, 650, 34, WA, 1); text(ctx, 'זמינים לשאלות', 1670, 725, { size: 32, weight: 900 }); text(ctx, 'לאורך הדרך', 1670, 765, { size: 24, weight: 700, color: '#8fe6b0' }); }); }
  },
};

// ---------------- 2:03 risk, CTA, tagline ----------------
S.b5a = {
  trans: 'zoom', risk: true,
  events: events([['מבטל'], ['ותוצאות', 'pop']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.3, glow: 0.7, hue: 30 });
    cam(ctx, s, () => {
      warnIcon(ctx, CX, 280, 52, prog(s.lt, 0.1, 0.5));
      wipeText(ctx, 'מסחר אוטומטי לא מבטל את הסיכונים', CX, 430, pr(s, 'מבטל', 0.6, -0.6), { size: 64, weight: 900 });
      lineReveal(ctx, CX, 500, 1000, pr(s, 'מבטל', 0.8), GOLD);
      wipeText(ctx, 'ותוצאות העבר אינן מבטיחות את העתיד', CX, 580, pr(s, 'ותוצאות', 0.6), { size: 52, weight: 800, color: GOLD });
    }, { k: 0.03 });
  },
};
S.b5b = {
  trans: 'whip',
  events: events([['אחרת', 'pop'], ['טכנולוגית'], ['ושיטתית']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 1, glow: 1.3, grid: 0.9 });
    [0, 1, 2].forEach(k => { ctx.save(); ctx.globalAlpha = 0.35; robotBadge(ctx, k, 1440 - k * 480, 760, 70, prog(lt, 0.2 + k * 0.15, 0.7 + k * 0.15), { label: false }); ctx.restore(); });
    wipeText(ctx, 'דרך אחרת להשתתף במסחר', CX, 320, pr(s, 'אחרת', 0.5), { size: 72, weight: 900, glow: 30, glowColor: P1 });
    popT(ctx, 1200, 500, pr(s, 'טכנולוגית', 0.4), () => text(ctx, 'טכנולוגית', 1200, 500, { size: 84, weight: 900, color: TEAL, glow: 30, glowColor: TEAL }));
    popT(ctx, 720, 500, pr(s, 'ושיטתית', 0.4), () => text(ctx, 'שיטתית', 720, 500, { size: 84, weight: 900, color: P2, glow: 30, glowColor: P1 }));
  },
};
S.b5c = {
  trans: 'flash', captions: true,
  events: events([['רוצים', 'pop'], ['השאירו', 'click'], ['והתחילו', 'impact', 0.6]]),
  draw(ctx, s) {
    const { lt } = s, ct = cueT(s, 'השאירו');
    bg(ctx, s, { rain: 1.6, glow: 1.4, grid: 1 });
    drawLogo(ctx, CX, 215, 360, prog(lt, 0, 0.5)); drawLogo(ctx, CX, 215, 360, 0.2 * prog(lt, 0, 0.5));
    popT(ctx, CX, 460, prog(lt, 0.15, 0.55), () => text(ctx, '10 ימי התנסות', CX, 460, { size: 120, weight: 900, glow: 50, glowColor: P1 }));
    wipeText(ctx, 'הכירו את מערכות המסחר האוטומטיות של ALTRIX', CX, 580, prog(lt, 0.5, 1.0), { size: 44, weight: 800, color: C.neon });
    const bp = prog(lt, ct - 0.6, ct - 0.2), done = lt > ct + 0.2;
    if (bp > 0) { const k = done ? 1 + 0.05 * Math.exp(-(lt - ct - 0.2) * 6) : 1;
      popT(ctx, CX, 740, bp, () => { ctx.save(); ctx.translate(CX, 740); ctx.scale(k, k); ctx.translate(-CX, -740);
        rrect(ctx, CX - 330, 740 - 52, 660, 104, 52); const g = ctx.createLinearGradient(CX - 330, 0, CX + 330, 0); g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#c084fc'); ctx.fillStyle = g; ctx.shadowColor = P1; ctx.shadowBlur = 60; ctx.fill(); ctx.restore();
        text(ctx, 'השאירו פרטים ונתחיל להכיר', CX, 742, { size: 44, weight: 900 }); });
      if (lt < ct + 0.8) cursor(ctx, ...kf(lt, [[ct - 0.6, 1300, 980], [ct + 0.15, CX + 120, 755]]), Math.exp(-Math.abs(lt - ct - 0.2) * 12), 1.2);
      ring(ctx, CX, 740, 500, prog(lt, ct + 0.2, ct + 0.9)); }
  },
};
S.b5d = {
  trans: 'none', captions: false, bare: true,
  events: events([['קודם', 'pop'], ['בודקים', 'pop'], ['מחליטים', 'impact', 0.8]]),
  draw(ctx, s) {
    const { lt, d } = s;
    bg(ctx, s, { rain: 2, glow: 1.5, grid: 1 });
    const lp = E.outCubic(prog(lt, 0, 0.9));
    drawLogo(ctx, CX, 290, lerp(340, 560, lp), 1); drawLogo(ctx, CX, 290, lerp(340, 560, lp), 0.25 + 0.15 * Math.sin(lt * 3));
    [['קודם מכירים.', 'קודם', 650, '#fff'], ['אחר כך בודקים.', 'בודקים', 745, '#fff'], ['ורק אז מחליטים.', 'מחליטים', 845, GOLD]].forEach(([t2, c, y, col]) => {
      const p = pr(s, c, 0.45, c === 'קודם' ? -0.05 : -0.35); popT(ctx, CX, y, p, () => text(ctx, t2, CX, y, { size: y > 800 ? 76 : 64, weight: 900, color: col, glow: 30, glowColor: col === GOLD ? '#ff9800' : P1 })); });
    ring(ctx, CX, 290, 900, pr(s, 'מחליטים', 1)); burst(ctx, CX, 290, pr(s, 'מחליטים', 1.4), P2, 50, 41, 700);
    text(ctx, 'AUTOMATED TRADING TECHNOLOGY', CX, 950, { size: 24, weight: 800, fam: MONO, color: C.neon, spacing: 10, alpha: pr(s, 'מחליטים', 0.8, 0.4) });
    scrim(ctx, prog(lt, d - 1.3, d - 0.1));
  },
};

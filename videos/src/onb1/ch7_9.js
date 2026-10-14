// Chapters 7-9: installation, the 10 days of trust (contact plan), the closing call (+ simulation 2).
'use strict';
// spotlight: dim everything except a rounded rect
function spotlight(ctx, x, y, w, h, a, col = GOLD) {
  if (a <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); rrect(ctx, x, y, w, h, 14); ctx.fillStyle = `rgba(4,2,10,${0.62 * a})`; ctx.fill('evenodd'); ctx.restore();
  ctx.save(); ctx.globalAlpha = a; rrect(ctx, x, y, w, h, 14); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.stroke(); ctx.restore();
}
function callout(ctx, str, x, y, p, col = GOLD, align = 'center') {
  if (p <= 0) return; popT(ctx, x, y, p, () => pill(ctx, str, x, y, { size: 30, color: col, fg: '#1a0f00', weight: 900, glow: 30 }));
}
// MetaTrader-5-like terminal (illustration only, sample data)
function terminal(ctx, s, box, o = {}) {
  const [x, y, w, h] = box, lt = s.lt;
  windowFrame(ctx, x, y, w, h, 'MetaTrader 5 · המחשה בלבד · נתונים לדוגמה');
  // toolbar
  const ty = y + 54; ctx.fillStyle = '#120e22'; ctx.fillRect(x + 2, ty, w - 4, 56);
  ['File', 'View', 'Insert', 'Charts', 'Tools'].forEach((m, k) => text(ctx, m, x + 30 + k * 90, ty + 28, { size: 19, weight: 600, fam: MONO, color: C.axis, align: 'left' }));
  const at = { x: x + w - 230, y: ty + 10, w: 200, h: 36 };
  ctx.save(); rrect(ctx, at.x, at.y, at.w, at.h, 8); ctx.fillStyle = 'rgba(22,199,132,0.22)'; ctx.fill(); ctx.strokeStyle = C.up; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(at.x + 22, at.y + 18, 7, 0, 7); ctx.fillStyle = C.up; ctx.shadowColor = C.up; ctx.shadowBlur = 12; ctx.fill(); ctx.restore();
  text(ctx, 'Algo Trading', at.x + 40, at.y + 19, { size: 19, weight: 700, fam: MONO, color: '#c8ffe9', align: 'left' });
  // chart pane
  const cy = ty + 60, ch_h = h - 54 - 60 - 250;
  ctx.save(); ctx.beginPath(); ctx.rect(x + 2, cy, w - 4, ch_h); ctx.clip();
  const r = fxChart(ctx, s, [x + 2, cy - 10, w - 4, ch_h + 20], { header: false, frame: false, r0: 80, r1: 96, win: 70, axis: 120 });
  ctx.restore();
  text(ctx, 'EURUSD, H1', x + 24, cy + 26, { size: 20, weight: 700, fam: MONO, color: '#fff', align: 'left' });
  const ea = { x: x + w - 300, y: cy + 10, w: 280, h: 44 };
  ctx.save(); rrect(ctx, ea.x, ea.y, ea.w, ea.h, 10); ctx.fillStyle = 'rgba(124,58,237,0.35)'; ctx.fill(); ctx.restore();
  icon(ctx, 'robot', ea.x + 28, ea.y + 22, 30, '#fff', { glow: 0 }); text(ctx, 'ALTRIX EA', ea.x + 52, ea.y + 23, { size: 20, weight: 800, fam: MONO, align: 'left' });
  ctx.save(); ctx.beginPath(); ctx.arc(ea.x + ea.w - 24, ea.y + 22, 8, 0, 7); ctx.fillStyle = C.up; ctx.shadowColor = C.up; ctx.shadowBlur = 12; ctx.fill(); ctx.restore();
  text(ctx, 'פעיל', ea.x + ea.w - 40, ea.y + 23, { size: 18, weight: 700, color: C.up, align: 'right' });
  // toolbox
  const by = cy + ch_h; ctx.fillStyle = '#0f0b1d'; ctx.fillRect(x + 2, by, w - 4, 250 - 6); ctx.fillStyle = 'rgba(180,140,255,0.15)'; ctx.fillRect(x + 2, by, w - 4, 2);
  ['Trade', 'Exposure', 'History', 'Journal'].forEach((tb, k) => { const on = k === 0; if (on) { ctx.fillStyle = 'rgba(168,85,247,0.3)'; ctx.fillRect(x + 20 + k * 130, by + 8, 120, 34); } text(ctx, tb, x + 80 + k * 130, by + 26, { size: 18, weight: 700, fam: MONO, color: on ? '#fff' : C.axis }); });
  const cols = [['Symbol', 30], ['Type', 230], ['Volume', 380], ['Open', 540], ['Price', 720], ['Profit', w - 160]];
  cols.forEach(([c, dx]) => text(ctx, c, x + dx, by + 70, { size: 17, weight: 700, fam: MONO, color: C.axis, align: 'left' }));
  const trades = [['EURUSD', 'buy', '0.10', '1.09012', '1.09136', '+12.40'], ['EURUSD', 'sell', '0.10', '1.09095', '1.09136', '-4.15']];
  trades.forEach((tr, j) => { const ry = by + 108 + j * 40; cols.forEach(([, dx], k) => text(ctx, tr[k], x + dx, ry, { size: 19, weight: 600, fam: MONO, align: 'left', color: k === 5 ? (tr[5][0] === '+' ? C.up : C.down) : k === 1 ? (tr[1] === 'buy' ? '#4f8cff' : C.down) : '#fff' })); });
  text(ctx, 'Balance: 10 000.00   Equity: 10 008.25   Free margin: 9 790.03', x + 30, by + 205, { size: 19, weight: 700, fam: MONO, align: 'left', color: '#fff' });
  text(ctx, '8.25', x + w - 160, by + 205, { size: 19, weight: 800, fam: MONO, align: 'left', color: C.up });
  return { algo: at, ea, trades: { x: x + 10, y: by + 84, w: w - 20, h: 90 }, summary: { x: x + 10, y: by + 182, w: w - 20, h: 46 }, profit: { x: x + w - 190, y: by + 52, w: 170, h: 170 } };
}

// ---------------- chapter 7 ----------------
S.c7_card = chapterCard(7);
S.c7a = {
  trans: 'glitch',
  events: events([['הסכים'], ['האחריות'], ['ההתקנה']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1, grid: 0.6 });
    const y = 500, xs = [1560, 960, 360];
    const a = pr(s, 'הסכים', 0.45), b = pr(s, 'האחריות', 0.5), c = pr(s, 'ההתקנה', 0.45);
    iconDisc(ctx, 'check', xs[0], y, 90, C.up, a); slideIn(ctx, a, 0, 30, () => { text(ctx, 'הלקוח הסכים לניסיון', xs[0], y + 150, { size: 40, weight: 900 }); text(ctx, 'מצוין!', xs[0], y + 200, { size: 34, weight: 800, color: C.up }); });
    arrow(ctx, xs[0] - 120, y, xs[1] + 150, y, b, { color: 'rgba(230,210,255,0.7)', width: 7, head: 26 });
    if (b > 0) { avatar(ctx, xs[1], y, 120 * E.outBack(b), { color: P1, headset: true, ring: 1, talk: 0.5 }); slideIn(ctx, b, 0, 30, () => { text(ctx, 'האחריות עוברת לנציג', xs[1], y + 180, { size: 40, weight: 900, color: GOLD }); }); }
    arrow(ctx, xs[1] - 150, y, xs[2] + 120, y, c, { color: 'rgba(230,210,255,0.7)', width: 7, head: 26 });
    iconDisc(ctx, 'install', xs[2], y, 90, TEAL, c); slideIn(ctx, c, 0, 30, () => { text(ctx, 'תהליך ההתקנה', xs[2], y + 150, { size: 40, weight: 900 }); text(ctx, 'בצורה חלקה', xs[2], y + 200, { size: 34, weight: 800, color: TEAL }); });
  },
};
S.c7b = {
  trans: 'whip',
  events: events([['מתחברים'], ['באישורו', 'click'], ['ומתקינים']]),
  draw(ctx, s) {
    const { lt } = s, ok = cueT(s, 'באישורו') + 0.2, conn = lt > ok;
    bg(ctx, s, { rain: 0.4, glow: 1 });
    // rep side (right) & client side (left)
    windowFrame(ctx, 1190, 220, 620, 420, 'עמדת הנציג'); avatar(ctx, 1500, 400, 80, { color: P1, headset: true, label: FX().repName, sub: 'נציג ALTRIX' });
    windowFrame(ctx, 110, 180, 960, 640, 'המחשב של ' + FX().clientName);
    ctx.save(); ctx.globalAlpha = 0.5; miniCandles(ctx, 160, 300, 860, 300, 50, 9, 1); ctx.restore();
    // link
    const lp = pr(s, 'מתחברים', 0.8);
    if (lp > 0) { ctx.save(); ctx.strokeStyle = conn ? C.up : P2; ctx.lineWidth = 6; ctx.setLineDash([14, 12]); ctx.lineDashOffset = -lt * 50; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(1185, 430); ctx.lineTo(1185 - 110 * E.outCubic(lp), 430); ctx.stroke(); ctx.restore();
      iconDisc(ctx, 'remote', 1130, 330, 40, conn ? C.up : P2, lp); }
    // consent dialog
    const dp = pr(s, 'מתחברים', 0.4, 0.2) * (1 - prog(lt, ok + 0.4, ok + 0.7));
    if (dp > 0) { scrim(ctx, 0); ctx.save(); ctx.globalAlpha = dp; glass(ctx, 290, 330, 600, 330, 22, { fill: 'rgba(22,16,40,0.98)', glow: 50 });
      iconDisc(ctx, 'remote', 820, 395, 36, GOLD, 1); text(ctx, 'בקשת חיבור מרחוק', 760, 395, { size: 36, weight: 900, align: 'right' });
      para(ctx, `${FX().repName} מ־ALTRIX מבקש גישה זמנית למחשב שלך לצורך התקנת המערכת.`, 850, 470, 520, { size: 26, weight: 600, color: C.dim });
      const pressed = Math.exp(-Math.abs(lt - ok) * 12);
      button(ctx, 'אישור', 720, 600, 200, 64, { color: C.up, size: 28, pressed }); button(ctx, 'דחייה', 470, 600, 200, 64, { color: '#3a2d5c', size: 28 });
      ctx.restore();
      if (lt > ok - 0.9 && lt < ok + 0.4) cursor(ctx, ...kf(lt, [[ok - 0.9, 980, 800], [ok - 0.1, 735, 612]]), pressed, 1.1);
    }
    if (conn) { const cp = prog(lt, ok, ok + 0.4); popT(ctx, 590, 740, cp, () => pill(ctx, '✓ מחובר · באישור הלקוח', 590, 740, { size: 32, color: C.up, weight: 900 })); }
    const ip = pr(s, 'ומתקינים', 0.5);
    if (ip > 0) { ctx.save(); ctx.globalAlpha = ip; glass(ctx, 360, 330, 460, 230, 22, { fill: 'rgba(22,16,40,0.96)' }); icon(ctx, 'install', 590, 400, 70, TEAL); text(ctx, 'מתקינים לפי צורכי החשבון', 590, 480, { size: 28, weight: 800 }); progressBar(ctx, 410, 515, 360, 14, prog(lt, cueT(s, 'ומתקינים'), s.d) * 0.4, { color: TEAL, color2: C.up }); ctx.restore(); }
  },
};
S.c7c = {
  trans: 'none',
  events: events([['כחמש', 'impact', 0.6]]),
  draw(ctx, s) {
    const { lt } = s, pp = prog(lt, 0, s.d - 0.4);
    bg(ctx, s, { rain: 0.4, glow: 1 });
    windowFrame(ctx, 110, 180, 960, 640, 'ALTRIX Installer');
    const steps = ['התחברות לחשבון המסחר', 'טעינת רובוט ALTRIX', 'התאמת הגדרות לחשבון', 'הפעלה ובדיקה'];
    steps.forEach((st, k) => { const done = pp > (k + 1) / steps.length - 0.02, act = !done && pp > k / steps.length, y = 320 + k * 100;
      if (done) check(ctx, 990, y, 24, 1, C.up); else { ctx.save(); ctx.beginPath(); ctx.arc(990, y, 22, 0, 7); ctx.lineWidth = 3; ctx.strokeStyle = act ? GOLD : 'rgba(255,255,255,0.2)'; ctx.stroke(); if (act) { ctx.beginPath(); ctx.arc(990, y, 22, lt * 6, lt * 6 + 1.6); ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.stroke(); } ctx.restore(); }
      text(ctx, st, 945, y + 2, { size: 36, weight: 800, align: 'right', color: done ? '#fff' : act ? GOLD : C.dim }); });
    progressBar(ctx, 170, 740, 840, 22, pp, { color: P1, color2: C.up });
    // stopwatch
    const sp = pr(s, 'כחמש', 0.5), cx = 1440, cy = 480;
    ctx.save(); ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(cx, cy, 200, 0, 7); ctx.stroke();
    ctx.strokeStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 25; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, 200, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pp); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.fillStyle = GOLD; ctx.fillRect(cx - 24, cy - 250, 48, 26); ctx.restore();
    const mm = Math.floor(pp * 5), ss = Math.floor((pp * 300) % 60);
    text(ctx, `0${mm}:${String(ss).padStart(2, '0')}`, cx, cy - 10, { size: 90, weight: 900, fam: MONO, glow: 30, glowColor: GOLD });
    popT(ctx, cx, cy + 300, sp, () => pill(ctx, 'כ־5 דקות · בדרך כלל', cx, cy + 300, { size: 40, color: GOLD, fg: '#1a0f00', weight: 900 }));
    text(ctx, 'כשסביבת העבודה מוכנה', cx, cy + 80, { size: 28, weight: 700, color: C.dim });
  },
};
S.c7d = {
  trans: 'glitch',
  events: events([['מסיימים'], ['להפך', 'impact', 1]]),
  draw(ctx, s) {
    const { lt } = s, flip = pr(s, 'להפך', 0.4);
    bg(ctx, s, { rain: 0.6, glow: 1.1 });
    cam(ctx, s, () => {
      const a = pr(s, 'מסיימים', 0.45);
      slideIn(ctx, a, 0, 40, () => { ctx.save(); ctx.globalAlpha *= 1 - 0.6 * flip;
        glass(ctx, 560, 230, 800, 220, 30, { border: C.down, glowColor: C.down }); iconDisc(ctx, 'install', 1250, 340, 50, '#9a8fc4', 1); arrow(ctx, 1170, 340, 1060, 340, 1, { color: C.dim, width: 6, head: 22 }); iconDisc(ctx, 'call', 980, 340, 50, C.down, 1);
        text(ctx, 'מסיימים ומנתקים', 850, 342, { size: 46, weight: 900, align: 'right' }); cross(ctx, 620, 340, 30, 1, C.down); ctx.restore(); });
      popT(ctx, CX, 640, flip, () => text(ctx, 'להפך!', CX, 640, { size: 190, weight: 900, color: C.up, glow: 60, glowColor: C.up }));
      ring(ctx, CX, 640, 700, flip, C.up); burst(ctx, CX, 640, prog(lt, cueT(s, 'להפך'), cueT(s, 'להפך') + 1), C.up, 30, 4, 500);
    }, { k: 0.05 });
  },
};
S.c7e = {
  trans: 'zoom',
  events: events([['נשארים'], ['העסקאות'], ['רווח'], ['מצב'], ['צפוי'], ['פונים']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.3, glow: 0.8 });
    const T = terminal(ctx, s, [100, 120, 1720, 830]);
    const hs = [['העסקאות', T.trades, 'כאן מופיעות העסקאות', GOLD], ['רווח', T.summary, 'כאן בודקים רווח והפסד', TEAL], ['מצב', T.algo, 'כאן רואים שהמערכת פעילה', C.up], ['צפוי', null, 'מה צפוי בתקופת הניסיון', P2], ['פונים', null, 'שאלה? פונים לנציג', WA]];
    let cur = -1; hs.forEach(([c], k) => { if (lt >= cueT(s, c) - 0.1) cur = k; });
    if (cur < 0) { avatar(ctx, 1640, 840, 60, { color: P1, headset: true, talk: 1 }); badgeAt(ctx, s, 'נשארים עם הלקוח עוד כמה דקות', 1300, 840, 'נשארים', P1, 30); return; }
    const [c, box, label, col] = hs[cur], a = prog(lt, cueT(s, c) - 0.1, cueT(s, c) + 0.3);
    if (box) { spotlight(ctx, box.x - 8, box.y - 8, box.w + 16, box.h + 16, a, col); const ly = box.y < 400 ? box.y + box.h + 50 : box.y - 50, lx = clamp(box.x + box.w / 2, 300, 1620); callout(ctx, label, lx, ly, a, col); }
    else if (cur === 3) { spotlight(ctx, 560, 380, 800, 260, a, col); popT(ctx, CX, 510, a, () => { glass(ctx, 560, 380, 800, 260, 26, { fill: 'rgba(22,16,40,0.97)', border: col }); text(ctx, 'תקופת הניסיון', 1300, 430, { size: 32, weight: 900, align: 'right', color: col });
      for (let k = 0; k < 10; k++) { ctx.save(); rrect(ctx, 1290 - (k + 1) * 70, 480, 58, 58, 10); ctx.fillStyle = k === 0 ? GOLD : 'rgba(168,85,247,0.35)'; ctx.fill(); ctx.restore(); text(ctx, String(k + 1), 1290 - (k + 1) * 70 + 29, 510, { size: 24, weight: 800, fam: MONO }); }
      text(ctx, 'המערכת סוחרת לפי ההגדרות · עוקבים יחד', CX, 590, { size: 28, weight: 700, color: C.dim }); }); }
    else { spotlight(ctx, 1220, 720, 560, 200, a, col); popT(ctx, 1500, 820, a, () => { glass(ctx, 1220, 720, 560, 200, 26, { fill: 'rgba(11,20,26,0.98)', border: WA }); iconDisc(ctx, 'whatsapp', 1700, 820, 44, WA, 1); text(ctx, 'שאלה? כותבים לנציג', 1630, 795, { size: 34, weight: 900, align: 'right' }); text(ctx, `${FX().repName} · זמין לאורך הניסיון`, 1630, 845, { size: 26, weight: 700, align: 'right', color: '#8fe6b0' }); }); }
    // cursor travels between hotspots
    const pts = hs.map(([c, b], k) => [cueT(s, c), b ? b.x + b.w * 0.5 : k === 3 ? 960 : 1500, b ? b.y + b.h * 0.6 : k === 3 ? 520 : 830]);
    const cp = kf(lt, pts.map(p => [p[0], p[1], p[2]]));
    cursor(ctx, cp[0] + 10, cp[1] + 10, 0, 1);
  },
};
S.c7f = {
  trans: 'whip',
  events: events([['לא'], ['למשתמש', 'impact', 0.4]]),
  draw(ctx, s) {
    const { lt } = s, m = pr(s, 'למשתמש', 0.8);
    bg(ctx, s, { rain: 0.5, glow: 1, dots: 0.6 });
    const a = pr(s, 'לא', 0.5);
    slideIn(ctx, a, 60, 0, () => { avatar(ctx, 1380, 470, 130, { color: '#64748b' }); [[-170, -150], [170, -170], [200, 60]].forEach(([dx, dy], k) => iconDisc(ctx, 'question', 1380 + dx, 470 + dy + Math.sin(lt * 3 + k) * 8, 36, GOLD, 1)); text(ctx, 'לא מכיר את המערכת', 1380, 680, { size: 44, weight: 900, color: C.dim }); });
    arrow(ctx, 1120, 470, 820, 470, m, { color: GOLD, width: 10, head: 36 });
    if (m > 0) { avatar(ctx, 560, 470, 140 * E.outBack(m), { color: C.up, ring: 1 }); check(ctx, 680, 360, 40, m, C.up); text(ctx, 'יודע להתמצא בה', 560, 690, { size: 50, weight: 900, color: C.up, alpha: m }); ring(ctx, 560, 470, 340, m, C.up); }
  },
};
S.c7g = {
  trans: 'zoom',
  events: events([['טוב', 'impact', 0.5], ['מעניק']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 1, glow: 1.3, grid: 0.8 });
    cam(ctx, s, () => {
      const a = pr(s, 'טוב', 0.5); check(ctx, CX, 260, 70, a, C.up);
      popT(ctx, CX, 400, a, () => text(ctx, 'INSTALLATION COMPLETE', CX, 400, { size: 72, weight: 900, fam: MONO, color: C.up, glow: 40, glowColor: C.up, spacing: 4 }));
      text(ctx, 'הניסיון התחיל', CX, 480, { size: 40, weight: 800, color: C.dim, alpha: a });
      const q = pr(s, 'מעניק', 0.6);
      slideIn(ctx, q, 0, 40, () => { glass(ctx, 360, 580, 1200, 230, 34, { border: GOLD, glowColor: GOLD }); text(ctx, '”', 1500, 640, { size: 120, weight: 900, color: GOLD });
        text(ctx, 'נציג טוב לא רק מסביר ומוכר.', CX, 650, { size: 46, weight: 800 }); text(ctx, 'הוא מעניק חוויית התחלה מקצועית.', CX, 730, { size: 52, weight: 900, color: GOLD, glow: 20, glowColor: GOLD }); });
    }, { k: 0.04 });
  },
};

// ---------------- chapter 8 ----------------
S.c8_card = chapterCard(8);
// 10-day track (rtl). mode 'wrong' | 'right'
function dayTrack(ctx, s, mode) {
  const { lt } = s, y = 520, xR = 1700, xL = 220, dx = (xR - xL) / 9, X = d => xR - (d - 1) * dx;
  ctx.save(); ctx.strokeStyle = 'rgba(220,200,255,0.25)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(xL, y); ctx.stroke(); ctx.restore();
  for (let d = 1; d <= 10; d++) { ctx.save(); ctx.beginPath(); ctx.arc(X(d), y, 16, 0, 7); ctx.fillStyle = '#2a2042'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(220,200,255,0.4)'; ctx.stroke(); ctx.restore(); text(ctx, `יום ${d}`, X(d), y + 52, { size: 26, weight: 800, color: C.axis }); }
  if (mode === 'wrong') {
    const a = pr(s, 'להתקין', 0.4), g = pr(s, 'ולחזור', 0.8), b = pr(s, 'להסתיים', 0.4, -0.3);
    iconDisc(ctx, 'install', X(1), y - 120, 46, TEAL, a); text(ctx, 'התקנה', X(1), y - 190, { size: 30, weight: 900, color: TEAL, alpha: a });
    if (g > 0) { ctx.save(); ctx.strokeStyle = C.down; ctx.setLineDash([12, 12]); ctx.lineWidth = 5; ctx.globalAlpha = g; ctx.beginPath(); ctx.moveTo(X(1) - 30, y); ctx.lineTo(X(1) - 30 - (X(1) - X(10) - 60) * g, y); ctx.stroke(); ctx.restore();
      text(ctx, '…שקט מוחלט…', (X(2) + X(9)) / 2, y - 80, { size: 48, weight: 900, color: C.down, alpha: g }); }
    iconDisc(ctx, 'call', X(10), y - 120, 46, C.down, b); text(ctx, 'חוזרים רק עכשיו', X(10), y - 190, { size: 30, weight: 900, color: C.down, alpha: b });
    badgeAt(ctx, s, '✗  טעות נפוצה', CX, 230, 'הטעויות', C.down, 40);
    const qb = pr(s, 'להסתיים', 0.5);
    slideIn(ctx, qb, 0, 40, () => { ctx.save(); rrect(ctx, CX - 330, 700, 660, 120, 30); ctx.fillStyle = 'rgba(40,28,60,0.95)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(242,54,69,0.6)'; ctx.stroke(); ctx.restore();
      text(ctx, '"נו, מה החלטת?"', CX, 760, { size: 50, weight: 900, color: '#ffb3bd' }); cross(ctx, CX + 370, 760, 30, 1, C.down); });
    text(ctx, 'הלקוח לא מכיר את המערכת, ואין אמון', CX, 880, { size: 34, weight: 700, color: C.dim, alpha: qb });
  } else {
    const a = pr(s, 'ממשיך', 1.4);
    for (let d = 1; d <= 10; d++) { const p = clamp(a * 10 - (d - 1)); if (p <= 0) continue; const ic = [1, 3, 5, 7, 8, 10].includes(d) ? (d === 1 ? 'install' : d === 8 ? 'video' : 'chat') : null; if (!ic) continue;
      iconDisc(ctx, ic, X(d), y - 120, 40, d === 8 ? GOLD : C.up, p); ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = C.up; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(d), y - 80); ctx.lineTo(X(d), y - 18); ctx.stroke(); ctx.restore(); }
    if (a > 0) { ctx.save(); ctx.strokeStyle = C.up; ctx.shadowColor = C.up; ctx.shadowBlur = 16; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(xR - (xR - xL) * a, y); ctx.stroke(); ctx.restore(); }
    badgeAt(ctx, s, '✓  באלטריקס עובדים אחרת', CX, 230, 'אחרת', C.up, 40);
    popT(ctx, CX, 760, pr(s, 'הקשר', 0.4), () => { avatar(ctx, CX - 330, 760, 50, { color: P1, headset: true }); text(ctx, 'הנציג = איש הקשר לאורך כל הניסיון', CX + 50, 762, { size: 44, weight: 900 }); });
  }
}
S.c8a = { trans: 'glitch', events: events([['הטעויות', 'impact', 0.5], ['להתקין'], ['ולחזור'], ['להסתיים']]), draw(ctx, s) { bg(ctx, s, { rain: 0.5, glow: 1, hue: -20 }); dayTrack(ctx, s, 'wrong'); } };
S.c8b = { trans: 'whip', events: events([['אחרת', 'impact', 0.4], ['ממשיך', 'riser'], ['הקשר']]), draw(ctx, s) { bg(ctx, s, { rain: 0.5, glow: 1 }); dayTrack(ctx, s, 'right'); } };
const REG = genCandles([[0, 1.0800], [26, 1.0920], [32, 1.0898], [38, 1.0918], [44, 1.0896], [50, 1.0916], [56, 1.0899], [61, 1.0985], [65, 1.0880], [70, 1.0990], [75, 1.0870], [80, 1.0950]], { seed: 21, noise: 0.25 });
S.c8c = {
  trans: 'zoom',
  events: events([['להכיר'], ['אופן'], ['שונים']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.3, glow: 0.9 });
    const ch = new Chart(REG, { sym: 'EURUSD', tf: '1H', dec: 5, icon: '€', iconColor: '#2962ff' });
    ch.layout(100, 150, 1720, 760, { head: 86, axis: 130, foot: 44 }).view(-1, 82, ...ch.autoP(0, 81, 0.16));
    const rv = lerp(20, 81, E.inOut(prog(lt, 0, s.d - 0.6)));
    const zs = [[0, 27, 'מגמה', TEAL, 'להכיר'], [27, 57, 'דשדוש', GOLD, 'אופן'], [57, 81, 'תנודתיות', C.down, 'שונים']];
    zs.forEach(([a, b, , col, c]) => { const p = pr(s, c, 0.6); if (p > 0) ch.zone(ctx, ch.v.pMin, ch.v.pMax, a - 0.5, b - 0.5, { color: col, alpha: 0.08, progress: p }); });
    ch.draw(ctx, { reveal: rv, tfs: ['15m', '1H', '4H'] });
    zs.forEach(([a, b, l, col, c]) => badgeAt(ctx, s, l, (ch.X(a) + ch.X(b - 1)) / 2, 280, c, col, 34, false));
    text(ctx, 'המחשה: תנאי שוק שונים', 1780, 880, { size: 22, weight: 600, color: C.dim, align: 'right' });
  },
};
S.c8d = {
  trans: 'whip',
  events: events([['שאלות'], ['נפתחה'], ['נפתחה', 'pop'], ['זמני'], ['המצטברות'], ['תנודתיות']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    waChat(ctx, s, 1260, 120, 480, 840, FX().clientName, [
      { side: 'in', t: 'למה נפתחה עסקה עכשיו?', at: cueT(s, 'נפתחה') },
      { side: 'in', t: 'למה לא נפתחה עסקה כבר כמה שעות?', at: cueT(s, 'נפתחה', 1) },
      { side: 'in', t: 'יש עסקה בהפסד כרגע. מה זה אומר?', at: cueT(s, 'זמני') - 0.4 },
      { side: 'in', t: 'איך אני רואה את התוצאות המצטברות?', at: cueT(s, 'המצטברות') - 0.4 },
      { side: 'in', t: 'ומה קורה כשהשוק תנודתי?', at: cueT(s, 'תנודתיות') - 0.4 },
    ], { sub: 'משתמש ניסיון · יום 4', size: 23 });
    wipeText(ctx, 'ובדרך, עולות שאלות', 1120, 300, pr(s, 'שאלות', 0.5), { size: 70, weight: 900, align: 'right' });
    text(ctx, 'וזה טבעי. זו ההזדמנות שלכם לבנות אמון.', 1120, 390, { size: 36, weight: 700, align: 'right', color: TEAL, alpha: pr(s, 'נפתחה', 0.5) });
    for (let k = 0; k < 5; k++) { const p = pr(s, ['נפתחה', ['נפתחה', 1], 'זמני', 'המצטברות', 'תנודתיות'][k], 0.4); iconDisc(ctx, 'question', 980 - k * 150, 600 + (k % 2) * 90 + Math.sin(lt * 2 + k) * 10, 46, [GOLD, P2, C.down, TEAL, '#4f8cff'][k], p); }
  },
};
S.c8e = {
  trans: 'none',
  events: events([['מסביר'], ['בגבולות'], ['מפנה', 'pop']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1, grid: 0.5 });
    sectionTitle(ctx, s, 'איך עונים לשאלות?', 'ANSWER WITHIN YOUR SCOPE', { y: 170 });
    const q = prog(lt, 0.1, 0.5), r = pr(s, 'מסביר', 0.5), b = pr(s, 'בגבולות', 0.5), f = pr(s, 'מפנה', 0.5);
    iconDisc(ctx, 'question', 1600, 450, 80, GOLD, q); text(ctx, 'שאלה של הלקוח', 1600, 580, { size: 36, weight: 900, alpha: q });
    arrow(ctx, 1490, 450, 1120, 450, r, { color: 'rgba(230,210,255,0.7)', width: 7, head: 26 });
    if (r > 0) { avatar(ctx, 980, 450, 100 * E.outBack(r), { color: P1, headset: true, ring: 1 }); text(ctx, 'הנציג מסביר', 980, 600, { size: 38, weight: 900, alpha: r }); }
    popT(ctx, 980, 680, b, () => pill(ctx, 'מענה מקצועי בגבולות ההכשרה', 980, 680, { size: 30, color: C.up, fill: false }));
    if (f > 0) { ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -lt * 40; ctx.globalAlpha = f; ctx.beginPath(); ctx.moveTo(860, 450); ctx.lineTo(860 - 340 * E.outCubic(f), 450); ctx.stroke(); ctx.restore();
      iconDisc(ctx, 'cap', 400, 450, 90, GOLD, f); text(ctx, 'גורם מקצועי בחברה', 400, 590, { size: 38, weight: 900, color: GOLD, alpha: f }); text(ctx, 'לשאלות מסחר מורכבות', 400, 640, { size: 30, weight: 700, color: C.dim, alpha: f }); }
  },
};
S.c8f = {
  trans: 'whip', risk: true,
  events: events([['רווחים'], ['כהבטחה', 'pop'], ['מוצלח'], ['בשקיפות', 'pop']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    sectionTitle(ctx, s, 'שקיפות בימים טובים ובימים פחות טובים', 'HONEST IN EVERY MARKET', { y: 170 });
    const card = (x, col, title, sub, c1, c2, up) => {
      const p = pr(s, c1, 0.5); if (p <= 0) return;
      slideIn(ctx, p, 0, 60, () => { glass(ctx, x, 260, 780, 620, 32, { border: col, glowColor: col });
        text(ctx, title, x + 390, 330, { size: 46, weight: 900, color: col });
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.beginPath();
        for (let i = 0; i <= 40; i++) { const xx = x + 80 + i * 15.5, v = (up ? i / 40 : 1 - i / 40) * 0.7 + Math.sin(i * 0.9) * 0.08; i ? ctx.lineTo(xx, 640 - v * 220) : ctx.moveTo(xx, 640 - v * 220); } ctx.stroke(); ctx.restore();
        const sp = pr(s, c2, 0.4); if (sp > 0) { popT(ctx, x + 390, 780, sp, () => { pill(ctx, sub, x + 390, 780, { size: 36, color: up ? GOLD : TEAL, fg: '#1a0f00', weight: 900 }); }); }
      });
    };
    card(1000, C.up, 'יום עם רווחים', 'לא הבטחה להמשך', 'רווחים', 'כהבטחה', true);
    card(140, C.down, 'יום פחות מוצלח', 'מסבירים בשקיפות', 'מוצלח', 'בשקיפות', false);
  },
};
S.c8g = {
  trans: 'zoom',
  events: events([['חברה', 'impact', 0.4], ['ואנשים']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.8, glow: 1.2, grid: 0.8 });
    cam(ctx, s, () => {
      const b = pr(s, 'חברה', 0.6), p = pr(s, 'ואנשים', 0.6);
      if (b > 0) { ctx.save(); ctx.globalAlpha = b * 0.9; icon(ctx, 'building', CX, 330, 300, P2, { glow: 30 }); ctx.restore(); }
      [[-330, '#7c3aed'], [330, '#0f766e'], [-170, '#a855f7'], [170, '#14b8a6']].forEach(([dx, col], k) => { if (p > 0) avatar(ctx, CX + dx, 560 - (Math.abs(dx) > 200 ? 0 : 40), 70 * E.outBack(clamp(p * 2 - k * 0.2)) + 0.001, { color: col, headset: k < 2 }); });
      avatar(ctx, CX, 640, 110, { color: GOLD, ring: 1 });
      text(ctx, 'הלקוח לא לבד', CX, 830, { size: 60, weight: 900, glow: 30, glowColor: P1 });
      text(ctx, 'יש מאחוריו חברה אמיתית ואנשים שמלווים אותו', CX, 900, { size: 36, weight: 700, color: C.neon, alpha: p });
    }, { k: 0.04 });
  },
};
// contact plan: groups of days
const PLAN = [
  { id: 'c8i', days: [1], h: 'תחילת הניסיון', b: ['מוודאים שההתקנה הושלמה', 'הלקוח יודע איך לצפות במערכת'], m: `היי ${'דניאל'}, ההתקנה הושלמה. אם משהו במסך לא ברור, אני כאן.` },
  { id: 'c8j', days: [2, 3], h: 'קשר ראשוני', b: ['הכל ברור?', 'אין בעיות טכניות?', 'מענה לשאלות'], m: 'רציתי לוודא שהכל עובד ושהכל ברור. יש שאלות?' },
  { id: 'c8k', days: [4, 5, 6], h: 'העמקת ההיכרות', b: ['התנהגות המערכת', 'התוצאות', 'הממשק'], m: 'רוצה שנעבור יחד על העסקאות של השבוע ועל מה שרואים בממשק?' },
  { id: 'c8l', days: [7], h: 'הכנה לשיחת הסיכום', b: ['מה עדיין לא ברור?', 'מה חשוב לדעת לפני החלטה?'], m: 'לקראת סוף הניסיון: יש משהו שחשוב לך להבין לפני שמחליטים?' },
  { id: 'c8m', days: [8, 9], h: 'שיחת סיכום ורכישה', b: ['ההתנסות', 'שאלות הלקוח', 'אפשרויות ההמשך'], m: 'מתי נוח לך לשיחת סיכום קצרה? אפשר בטלפון או בזום.' },
  { id: 'c8n', days: [10], h: 'סיום הניסיון', b: ['מתי הרישיון מסתיים', 'הצעדים האפשריים להמשך'], m: 'תזכורת: תקופת הניסיון מסתיימת היום. אשמח לעזור בכל שאלה.' },
];
function planScene(idx) { // idx -1 = intro (c8h), 6 = outro (c8o)
  return {
    trans: idx === -1 ? 'glitch' : idx === 6 ? 'zoom' : 'none',
    events: s => idx >= 0 && idx < 6 ? [{ lt: 0.1, type: 'pop' }, { lt: 0.9, type: 'pop' }] : idx === -1 ? [{ lt: 0.2, type: 'riser' }] : [{ lt: s.cue('התאימו'), type: 'pop' }],
    draw(ctx, s) {
      const { lt } = s, y = 230, xR = 1720, xL = 200, dx = (xR - xL) / 9, X = d => xR - (d - 1) * dx;
      bg(ctx, s, { rain: 0.4, glow: 1 });
      if (idx === -1) { const tl = prog(lt, 0.1, 0.5); wipeText(ctx, 'תוכנית הקשר המומלצת', CX, 470, tl, { size: 84, weight: 900, glow: 34, glowColor: P1 });
        popT(ctx, CX, 600, prog(lt, 0.6, 1), () => text(ctx, '10 ימים · 6 נקודות מגע', CX, 600, { size: 50, weight: 800, color: GOLD }));
        ['install', 'chat', 'chat', 'chat', 'video', 'flag'].forEach((ic, k) => iconDisc(ctx, ic, 1260 - k * 120, 760, 40, k === 4 ? GOLD : C.up, prog(lt, 0.9 + k * 0.12, 1.3 + k * 0.12))); }
      const build = idx === -1 ? prog(lt, 0.3, s.d) : 1;
      ctx.save(); ctx.strokeStyle = 'rgba(220,200,255,0.22)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(xR - (xR - xL) * build, y); ctx.stroke(); ctx.restore();
      const cur = idx >= 0 && idx < 6 ? PLAN[idx] : null, past = idx === 6 ? 99 : idx >= 0 ? Math.min(...PLAN[idx].days) : 0;
      if (past > 1) { ctx.save(); ctx.strokeStyle = TEAL; ctx.shadowColor = TEAL; ctx.shadowBlur = 14; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(Math.max(xL, X(Math.min(10, past))), y); ctx.stroke(); ctx.restore(); }
      for (let d = 1; d <= 10; d++) {
        const p = clamp(build * 10 - (d - 1)); if (p <= 0) continue; const on = cur && cur.days.includes(d), done = d < past || idx === 6;
        popT(ctx, X(d), y, p, () => { ctx.save(); ctx.beginPath(); ctx.arc(X(d), y, on ? 36 : 26, 0, 7); ctx.fillStyle = on ? GOLD : done ? 'rgba(46,230,200,0.9)' : '#2a2042'; ctx.shadowColor = on ? GOLD : TEAL; ctx.shadowBlur = on ? 35 : done ? 14 : 0; ctx.fill(); ctx.restore();
          text(ctx, String(d), X(d), y + 2, { size: on ? 32 : 26, weight: 900, fam: MONO, color: on ? '#1a0f00' : '#fff' }); });
        if (d === 1) text(ctx, 'יום', X(1) + 70, y + 2, { size: 26, weight: 800, color: C.axis, alpha: p });
      }
      if (cur) {
        const xs = cur.days.map(X), x0 = Math.min(...xs) - 50, x1 = Math.max(...xs) + 50;
        ctx.save(); ctx.globalAlpha = prog(lt, 0, 0.3); rrect(ctx, x0, y - 56, x1 - x0, 112, 56); ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.setLineDash([8, 8]); ctx.stroke(); ctx.restore();
        const dl = cur.days.length > 1 ? `ימים ${cur.days[0]}-${cur.days[cur.days.length - 1]}` : `יום ${cur.days[0]}`;
        slideIn(ctx, prog(lt, 0.05, 0.45), 60, 0, () => {
          glass(ctx, 820, 340, 1000, 560, 32, { border: GOLD, glowColor: 'rgba(255,201,77,0.4)' });
          pill(ctx, dl, 1680, 410, { size: 32, color: GOLD, fg: '#1a0f00', weight: 900 });
          text(ctx, cur.h, 1560 - (dl.length > 6 ? 30 : 0), 412, { size: 50, weight: 900, align: 'right' });
          cur.b.forEach((b, j) => { const bp = prog(lt, 0.6 + j * 0.5, 1.0 + j * 0.5); if (bp <= 0) return; slideIn(ctx, bp, 40, 0, () => { check(ctx, 1730, 530 + j * 100, 24, 1, C.up); text(ctx, b, 1680, 532 + j * 100, { size: 40, weight: 800, align: 'right' }); }); });
        });
        // sample message
        const mp = prog(lt, 0.9, 1.3);
        slideIn(ctx, mp, -60, 0, () => {
          text(ctx, 'דוגמה להודעה', 470, 380, { size: 26, weight: 800, color: '#8fe6b0' });
          const lines = wrapLines(ctx, cur.m, 560, 30, 500), bh = lines.length * 44 + 60;
          ctx.save(); rrect(ctx, 150, 420, 640, bh, 22); ctx.fillStyle = '#005c4b'; ctx.shadowColor = WA; ctx.shadowBlur = 25; ctx.fill(); ctx.restore();
          lines.forEach((l, j) => text(ctx, l, 760, 460 + j * 44, { size: 30, weight: 500, align: 'right' }));
          text(ctx, '✓✓', 180, 420 + bh - 22, { size: 18, weight: 700, color: '#53bdeb', align: 'left' });
          iconDisc(ctx, 'whatsapp', 150, 420, 30, WA, 1);
        });
      }
      if (idx === 6) {
        const p = pr(s, 'התאימו', 0.5);
        popT(ctx, CX, 560, prog(lt, 0.1, 0.5), () => text(ctx, 'תוכנית מומלצת, לא נוקשה', CX, 520, { size: 72, weight: 900, glow: 30, glowColor: P1 }));
        slideIn(ctx, p, 0, 40, () => { glass(ctx, 460, 640, 1000, 200, 30, { border: TEAL, glowColor: TEAL }); iconDisc(ctx, 'gear', 1360, 740, 50, TEAL, 1); text(ctx, 'התאימו את תדירות הפניות', 1270, 710, { size: 44, weight: 900, align: 'right' }); text(ctx, 'להעדפות של כל לקוח', 1270, 775, { size: 38, weight: 800, align: 'right', color: TEAL }); });
      }
    },
  };
}
S.c8h = planScene(-1); PLAN.forEach((p, k) => (S[p.id] = planScene(k))); S.c8o = planScene(6);

// ---------------- chapter 9 ----------------
S.c9_card = chapterCard(9);
S.c9a = {
  trans: 'glitch',
  events: events([['השמיני', 'impact', 0.6], ['יוזם'], ['בטלפון'], ['בזום']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.6, glow: 1.1, grid: 0.6 });
    // calendar of 10 days, 8-9 highlighted
    glass(ctx, 120, 200, 860, 640, 30, {});
    text(ctx, 'תקופת הניסיון', 900, 260, { size: 34, weight: 900, align: 'right' });
    const hp = pr(s, 'השמיני', 0.5);
    for (let d = 1; d <= 10; d++) { const r = Math.floor((d - 1) / 5), c = (d - 1) % 5, x = 830 - c * 150, y = 380 + r * 190, hot = d === 8 || d === 9;
      ctx.save(); rrect(ctx, x - 60, y - 70, 120, 140, 18); ctx.fillStyle = hot ? `rgba(255,201,77,${0.15 + 0.7 * hp})` : 'rgba(255,255,255,0.05)'; if (hot) { ctx.shadowColor = GOLD; ctx.shadowBlur = 40 * hp; } ctx.fill(); ctx.restore();
      text(ctx, String(d), x, y - 5, { size: 56, weight: 900, fam: MONO, color: hot && hp > 0.5 ? '#1a0f00' : '#fff' }); text(ctx, 'יום', x, y + 45, { size: 22, weight: 700, color: hot && hp > 0.5 ? '#1a0f00' : C.dim }); }
    popT(ctx, 1420, 330, hp, () => text(ctx, 'יום 8-9', 1420, 330, { size: 120, weight: 900, fam: FONT, color: GOLD, glow: 40, glowColor: '#ff9800' }));
    wipeText(ctx, 'שיחת סיכום יזומה', 1420, 470, pr(s, 'יוזם', 0.5), { size: 60, weight: 900 });
    [['בטלפון', 'call', C.up, 1560], ['בזום', 'video', '#4f8cff', 1280]].forEach(([c, ic, col, x]) => { const p = pr(s, c, 0.4); iconDisc(ctx, ic, x, 650, 64, col, p); text(ctx, c === 'בטלפון' ? 'טלפון' : 'Zoom', x, 760, { size: 36, weight: 900, color: col, alpha: p }); });
    text(ctx, 'או', 1420, 652, { size: 34, weight: 800, color: C.dim, alpha: pr(s, 'בזום', 0.4) });
  },
};
function beforeAfter(phase) {
  return {
    trans: phase ? 'none' : 'whip',
    events: phase ? events([['בפעולה'], ['הממשק'], ['אופי'], ['ממוקדות']]) : events([['אחרת', 'pop'], ['מפרסומים'], ['הסברים'], ['המלצות']]),
    draw(ctx, s) {
      bg(ctx, s, { rain: 0.5, glow: 1 });
      sectionTitle(ctx, s, 'הלקוח נמצא עכשיו בנקודה אחרת', 'BEFORE VS. AFTER THE TRIAL', { y: 170, at: phase ? -5 : 0 });
      const pre = phase ? -5 : null;
      contrast(ctx, s,
        { h: 'לפני הניסיון', good: false, color: '#9a8fc4', icon: 'megaphone', cue: pre ?? 'אחרת', items: [{ t: 'הכיר מפרסומים', cue: pre ?? 'מפרסומים' }, { t: 'מהסברים', cue: pre ?? 'הסברים' }, { t: 'או מהמלצות', cue: pre ?? 'המלצות' }] },
        { h: 'אחרי הניסיון', good: true, color: TEAL, icon: 'eye', cue: phase ? 'בפעולה' : 999, items: [{ t: 'ראה את המערכת בפעולה', cue: phase ? 'בפעולה' : 999 }, { t: 'מכיר את הממשק', cue: phase ? 'הממשק' : 999 }, { t: 'מבין את אופי המסחר', cue: phase ? 'אופי' : 999 }, { t: 'שאלות ממוקדות הרבה יותר', cue: phase ? 'ממוקדות' : 999 }] },
        { y: 260, h: 610 });
    },
  };
}
S.c9b = beforeAfter(0); S.c9c = beforeAfter(1);
S.c9d = {
  trans: 'zoom',
  events: events([['אישית'], ['מדויקת'], ['ומכוונת', 'impact', 0.4]]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.8, glow: 1.2, grid: 0.8 });
    sectionTitle(ctx, s, 'שיחת הסיכום צריכה להיות:', 'THE CLOSING CALL IS', { y: 230 });
    rowCards(ctx, s, [{ t: 'אישית', icon: 'user', cue: 'אישית', color: P1 }, { t: 'מדויקת', icon: 'target', cue: 'מדויקת', color: TEAL }, { t: 'מכוונת להחלטה', icon: 'flag', cue: 'ומכוונת', color: GOLD }], { y: 330, h: 440, r: 80, size: 56 });
  },
};
S.c9e = {
  trans: 'glitch', captions: false,
  events: events([[0.05, 'riser'], ['בסימולציה', 'impact', 0.5]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 1.4, glow: 1.3, grid: 1 });
    cam(ctx, s, () => {
      kicker(ctx, s, 'ROLE PLAY', CX, 300, 0.05, GOLD);
      popT(ctx, CX, 430, prog(lt, 0.1, 0.5), () => text(ctx, 'SIMULATION 02', CX, 430, { size: 130, weight: 900, fam: MONO, glow: 50, glowColor: P1, spacing: 6 }));
      wipeText(ctx, 'שיחת סיכום · יום 8-9', CX, 580, prog(lt, 0.4, 0.85), { size: 64, weight: 900, color: GOLD });
      iconDisc(ctx, 'video', CX, 760, 70, '#4f8cff', prog(lt, 0.6, 1));
    }, { k: 0.06 });
  },
};
// simulation 2: Zoom call
const SIM2 = [{ id: 'c9s1', who: 'rep' }, { id: 'c9s2', who: 'client' }, { id: 'c9s3', who: 'rep' }, { id: 'c9s4', who: 'client' }, { id: 'c9s5', who: 'rep' }, { id: 'c9s6', who: 'rep' }, { id: 'c9s7', who: 'client' }];
function zoomScene(id) {
  const narr = id === 'c9n1';
  return {
    trans: id === 'c9s1' ? 'zoom' : 'none', captions: narr, rail: true,
    events: s => id === 'c9s5' ? [{ lt: 0.2, type: 'click' }, { lt: 0.4, type: 'whoosh' }] : id === 'c9s7' ? [{ lt: s.cue('נתקדם'), type: 'impact', k: 0.7 }] : narr ? [['שראה'], ['העלויות'], ['הסיכונים'], ['החלטה']].map(([c]) => ({ lt: s.cue(c), type: 'pop' })) : [],
    draw(ctx, s) {
      const t = s.t, lt = s.lt;
      bg(ctx, s, { rain: 0.3, glow: 0.9 });
      const zx = 90, zy = 130, zw = 1170, zh = 820;
      windowFrame(ctx, zx, zy, zw, zh, 'Zoom · שיחת סיכום · ALTRIX', { dark: 'rgba(10,10,16,0.98)' });
      const tS = segById('c9s5').t0, tE = segById('c9s6').t0 - 0.2, share = clamp((t - tS) / 0.5) * (1 - clamp((t - tE) / 0.5));
      const repTalk = SIM2.some(x => x.who === 'rep' && speaking(x.id, t)), cliTalk = SIM2.some(x => x.who === 'client' && speaking(x.id, t));
      // tiles
      const big = [[zx + 610, zy + 90, 530, 560], [zx + 30, zy + 90, 560, 560]], small = [[zx + zw - 290, zy + 70, 260, 170], [zx + zw - 570, zy + 70, 260, 170]];
      [[FX().repName + ' · ALTRIX', P1, true, repTalk], [FX().clientName, '#0f766e', false, cliTalk]].forEach(([nm, col, hs, talk], k) => {
        const [x, y, w, h] = big[k].map((v, j) => lerp(v, small[k][j], E.inOut(share)));
        ctx.save(); rrect(ctx, x, y, w, h, 16); ctx.fillStyle = '#1b1830'; ctx.fill(); ctx.lineWidth = talk ? 5 : 1.5; ctx.strokeStyle = talk ? C.up : 'rgba(255,255,255,0.15)'; if (talk) { ctx.shadowColor = C.up; ctx.shadowBlur = 20; } ctx.stroke(); ctx.restore();
        avatar(ctx, x + w / 2, y + h * 0.46, Math.min(w, h) * 0.26, { color: col, headset: hs, talk: talk ? 0.6 : 0 });
        ctx.save(); rrect(ctx, x + 12, y + h - 44, measure(ctx, nm, 20, 700) + 30, 32, 8); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill(); ctx.restore();
        text(ctx, nm, x + 27, y + h - 27, { size: 20, weight: 700, align: 'left' });
      });
      // shared screen
      if (share > 0) {
        ctx.save(); ctx.globalAlpha = share; const sx = zx + 30, sy = zy + 260, sw = zw - 60, sh = 470;
        rrect(ctx, sx, sy, sw, sh, 14); ctx.fillStyle = '#0d0a19'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.up; ctx.stroke();
        pill(ctx, 'שיתוף מסך', sx + sw - 90, sy + 26, { size: 18, color: C.up });
        if (t < segById('c9n1').t0) {
          FX().plans.forEach((pl, k) => { const x = sx + sw - 60 - (k + 1) * 520 + 20, col = k ? GOLD : P2; glass(ctx, x, sy + 70, 480, 360, 22, { border: col, glowColor: col });
            fitText(ctx, pl.name, x + 240, sy + 120, 420, { size: 30, weight: 900 }); text(ctx, pl.kind, x + 240, sy + 170, { size: 26, weight: 800, color: col });
            text(ctx, pl.price, x + 240, sy + 260, { size: 84, weight: 900, fam: MONO, glow: 30, glowColor: col }); text(ctx, pl.per, x + 240, sy + 330, { size: 26, weight: 800, color: col });
            const hl = k === 0 ? (t > wordT('c9s5', 'בבייסיק') - 0.1 && t < wordT('c9s5', 'בפרו') - 0.1) : t > wordT('c9s5', 'בפרו') - 0.1 && t < wordT('c9s5', 'ובשני');
            if (hl) { ctx.save(); rrect(ctx, x - 6, sy + 64, 492, 372, 26); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.stroke(); ctx.restore(); } });
          if (t > wordT('c9s5', 'ובשני') - 0.1) popT(ctx, sx + sw / 2, sy + sh - 30, clamp((t - wordT('c9s5', 'ובשני')) * 3), () => pill(ctx, '⚠ מסחר כרוך בסיכון · אין הבטחה לתוצאות', sx + sw / 2, sy + sh - 30, { size: 24, color: GOLD, fg: '#1a0f00' }));
        } else {
          const tabs = [['מה ראית בניסיון', 'שראה', 'eye', TEAL], ['העלויות', 'העלויות', 'coin', GOLD], ['הסיכונים', 'הסיכונים', 'shield', C.down], ['שאלות ותשובות', 'שאלה', 'chat', P2]];
          tabs.forEach(([h, c, ic, col], k) => { const at = wordT('c9n1', c), p = clamp((t - at + 0.1) * 3), x = sx + sw - 40 - (k + 1) * 265 + 20; if (p <= 0) return;
            popT(ctx, x + 120, sy + 230, p, () => { glass(ctx, x, sy + 90, 240, 280, 22, { border: col, glowColor: col }); iconDisc(ctx, ic, x + 120, sy + 190, 50, col, 1); text(ctx, h, x + 120, sy + 300, { size: 28, weight: 900 }); check(ctx, x + 120, sy + 345, 16, clamp((t - at - 0.6) * 3), C.up); }); });
        }
        ctx.restore();
      }
      // control bar
      ctx.fillStyle = '#16131f'; ctx.fillRect(zx + 2, zy + zh - 80, zw - 4, 78);
      [['🎙', 'mic'], ['', 'video'], ['', 'remote']].forEach(([, ic], k) => icon(ctx, ic === 'mic' ? 'phone' : ic, zx + 200 + k * 160, zy + zh - 42, 40, share > 0.5 && ic === 'remote' ? C.up : '#ddd', { glow: 0 }));
      button(ctx, 'סיום', zx + zw - 140, zy + zh - 42, 140, 46, { color: '#e02424', size: 22 });
      kicker(ctx, { lt: t - segById('c9s1').t0 }, 'SIMULATION 02 · CLOSING CALL', zx + zw / 2, 106, 0);
      // transcript
      transcript(ctx, t, SIM2, [1290, 140, 540, 800], { size: 26 });
      // decision moment
      if (id === 'c9s7') { const p = prog(lt, s.cue('נתקדם'), s.cue('נתקדם') + 0.4); if (p > 0) { scrim(ctx, 0.35 * p); check(ctx, zx + zw / 2, 470, 90, p, C.up); popT(ctx, zx + zw / 2, 640, p, () => text(ctx, 'החלטה ברורה', zx + zw / 2, 640, { size: 80, weight: 900, color: C.up, glow: 40, glowColor: C.up })); ring(ctx, zx + zw / 2, 470, 400, p, C.up); } }
    },
  };
}
['c9s1', 'c9s2', 'c9s3', 'c9s4', 'c9s5', 'c9n1', 'c9s6', 'c9s7'].forEach(id => (S[id] = zoomScene(id)));
S.c9f = {
  trans: 'zoom',
  events: events([['התחמק'], ['לחץ'], ['הבטיח'], ['עזר'], ['לערך'], ['וביקש', 'impact', 0.4]]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.5, glow: 1 });
    sectionTitle(ctx, s, 'שימו לב לשיחה', 'DEBRIEF', { y: 175 });
    contrast(ctx, s,
      { h: 'מה הנציג לא עשה', good: false, cue: 'התחמק', items: [{ t: 'לא התחמק משאלות', cue: 'התחמק' }, { t: 'לא יצר לחץ מלאכותי', cue: 'לחץ' }, { t: 'לא הבטיח ביצועים', cue: 'הבטיח' }] },
      { h: 'מה הנציג כן עשה', good: true, cue: 'עזר', items: [{ t: 'עזר להבין את האפשרויות', cue: 'עזר' }, { t: 'חזר לערך של המוצר', cue: 'לערך' }, { t: 'ביקש החלטה ברורה', cue: 'וביקש' }] },
      { y: 260, h: 610 });
  },
};
S.c9g = {
  trans: 'whip',
  events: events([['לסגור', 'pop'], ['בשל'], ['הבהרות'], ['צעד'], ['כופים', 'impact', 0.5]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1, grid: 0.5 });
    const top = pr(s, 'לסגור', 0.5);
    popT(ctx, CX, 220, top, () => { glass(ctx, CX - 300, 160, 600, 120, 30, { border: P2 }); text(ctx, 'המטרה: לסגור כבר בשיחה', CX, 222, { size: 44, weight: 900 }); });
    const b1 = pr(s, 'בשל', 0.6), b2 = pr(s, 'הבהרות', 0.6), b3 = pr(s, 'צעד', 0.5);
    const br = (x, p, col) => { if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(CX, 285); ctx.bezierCurveTo(CX, 360, x, 340, x, lerp(285, 420, E.outCubic(p))); ctx.stroke(); ctx.restore(); };
    br(1400, b1, GOLD); br(520, b2, TEAL);
    slideIn(ctx, b1, 0, 40, () => { glass(ctx, 1110, 430, 580, 380, 30, { border: GOLD, glowColor: GOLD }); text(ctx, 'הלקוח בשל ומעוניין', 1400, 500, { size: 40, weight: 900 }); iconDisc(ctx, 'handshake', 1400, 620, 64, GOLD, 1); text(ctx, 'סוגרים כבר בשיחה', 1400, 750, { size: 42, weight: 900, color: GOLD }); });
    slideIn(ctx, b2, 0, 40, () => { glass(ctx, 230, 430, 580, 380, 30, { border: TEAL, glowColor: TEAL }); text(ctx, 'צריך עוד הבהרות', 520, 500, { size: 40, weight: 900 }); iconDisc(ctx, 'chat', 520, 620, 64, TEAL, 1);
      text(ctx, 'מענה + צעד המשך ברור', 520, 750, { size: 40, weight: 900, color: TEAL, alpha: b3 }); });
    popT(ctx, CX, 900, pr(s, 'כופים', 0.4), () => pill(ctx, '✋ לא כופים החלטה', CX, 900, { size: 40, color: C.down, weight: 900, fill: false, glow: 30 }));
  },
};
S.c9h = {
  trans: 'zoom',
  events: s => { const e = s.seg.words[s.seg.words.length - 1].t1 - s.seg.t0; return [{ lt: s.cue('תנאי'), type: 'pop' }, { lt: s.cue('התשלום'), type: 'pop' }, { lt: s.cue('הרישיון'), type: 'pop' }, { lt: e - 0.5, type: 'riser' }, { lt: e + 0.25, type: 'impact', k: 1 }]; },
  draw(ctx, s) {
    const { lt } = s, end = s.seg.words[s.seg.words.length - 1].t1 - s.seg.t0, fin = prog(lt, end + 0.15, end + 0.6);
    bg(ctx, s, { rain: lerp(0.6, 2, fin), glow: lerp(1, 1.5, fin), grid: 1 });
    ctx.save(); ctx.globalAlpha = 1 - fin;
    sectionTitle(ctx, s, 'כשהלקוח בוחר לרכוש', 'FROM DECISION TO ACTIVATION', { y: 190 });
    rowCards(ctx, s, [{ t: 'תנאי המסלול', sub: 'מסבירים בבהירות', icon: 'doc', cue: 'תנאי', color: P2, num: 1 }, { t: 'תשלום', sub: 'דרך הערוץ המאושר בלבד', icon: 'lock', cue: 'התשלום', color: GOLD, num: 2 }, { t: 'הפעלת הרישיון', sub: 'מוודאים שהכל תקין', icon: 'bolt', cue: 'הרישיון', color: C.up, num: 3 }], { y: 300, h: 460, r: 70, size: 46 });
    ctx.restore();
    if (fin > 0) {
      check(ctx, CX, 280, 80, fin, C.up);
      popT(ctx, CX, 430, fin, () => text(ctx, 'ACTIVATION SUCCESSFUL', CX, 430, { size: 84, weight: 900, fam: MONO, color: C.up, glow: 40, glowColor: C.up, spacing: 3 }));
      const m = prog(lt, end + 0.8, end + 1.5);
      popT(ctx, CX, 640, prog(lt, end + 0.4, end + 0.8), () => {
        ctx.save(); ctx.globalAlpha *= 1 - m; text(ctx, 'TRIAL USER', CX, 640, { size: 90, weight: 900, fam: MONO, color: C.dim, spacing: 6 }); ctx.restore();
        ctx.save(); ctx.globalAlpha *= m; text(ctx, 'ALTRIX CUSTOMER', CX, 640, { size: 100, weight: 900, color: GOLD, glow: 50, glowColor: '#ff9800', spacing: 6 }); ctx.restore();
      });
      burst(ctx, CX, 640, prog(lt, end + 1.5, end + 2.5), GOLD, 50, 17, 800); ring(ctx, CX, 640, 900, prog(lt, end + 1.5, end + 2.3), GOLD);
    }
  },
};

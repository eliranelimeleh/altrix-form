// Chapters 10-11: the iron rules, finale (you are the face of ALTRIX).
'use strict';
const RULES = [['אמינות לפני הכל', 'shield', GOLD], ['מקצועיות', 'cap', P2], ['רציפות ואחריות', 'link', TEAL], ['שירות הוא חלק מהמכירה', 'heart', '#ff6fd8'], ['מסחר כרוך בסיכון', 'bolt', C.down]];
function ruleTiles(ctx, s, cur, o = {}) {
  const n = 5, x1 = 1810, x0 = 110, w = (x1 - x0 - 4 * 20) / n, y = o.y || 140, h = o.h || 110;
  RULES.forEach(([t, ic, col], k) => {
    const x = x1 - (k + 1) * w - k * 20, on = k === cur || cur === 'all', done = typeof cur === 'number' && k < cur, p = o.build ? prog(s.lt, o.build + k * 0.15, o.build + 0.4 + k * 0.15) : 1;
    if (p <= 0) return;
    slideIn(ctx, p, 0, -30, () => {
      ctx.save(); ctx.globalAlpha *= on ? 1 : done ? 0.75 : 0.4; glass(ctx, x, y, w, h, 22, { border: on ? col : 'rgba(190,140,255,0.25)', glowColor: on ? col : 'rgba(0,0,0,0)', glow: on ? 40 : 0 });
      ctx.save(); ctx.beginPath(); ctx.arc(x + w - 50, y + h / 2, 30, 0, 7); ctx.fillStyle = on ? col : '#2a2042'; ctx.fill(); ctx.restore();
      text(ctx, String(k + 1), x + w - 50, y + h / 2 + 2, { size: 32, weight: 900, fam: MONO, color: on ? '#1a0f00' : '#fff' });
      fitText(ctx, t, x + w - 96, y + h / 2 + 2, w - 120, { size: 30, weight: 900, align: 'right' });
      if (done) check(ctx, x + 34, y + h / 2, 16, 1, C.up);
      ctx.restore();
    });
  });
}
function ruleScene(k, body, ev) {
  return {
    trans: k === 0 ? 'whip' : 'none', risk: k === 4 || k === 0,
    events: s => [{ lt: 0.05, type: 'impact', k: 0.45 }, ...ev.map(([c, ty]) => ({ lt: cueT(s, c), type: ty || 'pop' }))],
    draw(ctx, s) {
      const [t, ic, col] = RULES[k];
      bg(ctx, s, { rain: 0.5, glow: 1, grid: 0.4 });
      ruleTiles(ctx, s, k);
      const p = prog(s.lt, 0, 0.5);
      slideIn(ctx, p, 0, 50, () => {
        glass(ctx, 110, 290, 1700, 620, 36, { border: col, glowColor: col, glow: 40 });
        iconDisc(ctx, ic, 1700, 400, 64, col, 1);
        text(ctx, `הכלל ה${['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'][k]}`, 1600, 365, { size: 30, weight: 800, align: 'right', color: col });
        text(ctx, t, 1600, 430, { size: 66, weight: 900, align: 'right', glow: 24, glowColor: col });
        body(ctx, s, col);
      });
    },
  };
}
S.c10_card = chapterCard(10);
S.c10a = {
  trans: 'glitch',
  events: events([['חמישה', 'impact', 0.6]]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 1, glow: 1.3, grid: 0.9 });
    statement(ctx, s, '5 כללי ברזל', { y: 420, at: cueT(s, 'חמישה'), size: 140, en: 'THE IRON RULES' });
    ruleTiles(ctx, s, 'all', { y: 640, build: cueT(s, 'כללים') });
  },
};
S.c10b = ruleScene(0, (ctx, s) => {
  text(ctx, 'לעולם לא מבטיחים:', 1600, 540, { size: 38, weight: 800, align: 'right', color: C.dim, alpha: pr(s, 'לעולם', 0.4) });
  [['רווח עתידי', 'רווח'], ['תשואה קבועה', 'תשואה'], ['הצלחה במבחן נוסטרו', 'הצלחה'], ['מסחר ללא סיכון', 'ללא']].forEach(([t, c], j) => {
    const x = 1440 - j * 370, y = 700, p = pr(s, c, 0.4); if (p <= 0) return;
    slideIn(ctx, p, 0, 30, () => { glass(ctx, x - 170, y - 80, 340, 180, 24, { border: C.down, glowColor: C.down, glow: 20 }); cross(ctx, x, y - 20, 28, 1, C.down); fitText(ctx, t, x, y + 50, 310, { size: 34, weight: 900 }); });
  });
}, [['רווח'], ['תשואה'], ['הצלחה'], ['ללא']]);
S.c10c = ruleScene(1, (ctx, s) => {
  listRows(ctx, s, [{ t: 'לומדים את המוצרים', kind: 'check', cue: 'לומדים' }, { t: 'מבינים את המסלולים', kind: 'check', cue: 'מבינים' }, { t: 'מכירים את תהליך ההתקנה', kind: 'check', cue: 'מכירים' }, { t: 'מסבירים ללקוח איך לעקוב אחר הפעילות', kind: 'check', cue: 'להסביר' }], { x: 1600, y: 545, dy: 92, size: 40, r: 26 });
  iconDisc(ctx, 'cap', 420, 640, 130, P2, pr(s, 'לומדים', 0.6));
}, [['לומדים'], ['מבינים'], ['מכירים'], ['להסביר']]);
S.c10d = ruleScene(2, (ctx, s) => {
  const st = [['פנייה ראשונה', 'שמתחיל', 'call'], ['התקנה', 'שמתקין', 'install'], ['ליווי בניסיון', 'מלווה', 'chat'], ['סיכום ומכירה', 'ומוביל', 'handshake']], y = 690, xs = [1450, 1080, 710, 340];
  const lp = prog(s.lt, cueT(s, 'שמתחיל'), cueT(s, 'ומוביל') + 0.5);
  ctx.save(); ctx.strokeStyle = TEAL; ctx.lineWidth = 6; ctx.shadowColor = TEAL; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(xs[0], y); ctx.lineTo(xs[0] - (xs[0] - xs[3]) * lp, y); ctx.stroke(); ctx.restore();
  st.forEach(([t, c, ic], j) => { const p = pr(s, c, 0.4); iconDisc(ctx, ic, xs[j], y, 54, TEAL, p); text(ctx, t, xs[j], y + 95, { size: 32, weight: 900, alpha: p }); });
  const ax = xs[0] - (xs[0] - xs[3]) * lp; avatar(ctx, ax, y - 125, 50, { color: P1, headset: true, ring: 1 });
  text(ctx, 'אותו נציג, לאורך כל המסע', 1600, 525, { size: 36, weight: 800, align: 'right', color: TEAL, alpha: pr(s, 'ככלל', 0.4) });
}, [['שמתחיל'], ['שמתקין'], ['מלווה'], ['ומוביל']]);
S.c10e = ruleScene(3, (ctx, s) => {
  text(ctx, 'אנחנו רוצים לקוחות ש:', 1600, 540, { size: 38, weight: 800, align: 'right', color: C.dim, alpha: pr(s, 'רוצים', 0.4) });
  [['מבינים מה הם רוכשים', 'שמבינים', 'bulb'], ['יודעים להשתמש במערכת', 'יודעים', 'monitor'], ['מרגישים שקיבלו ליווי ראוי', 'ומרגישים', 'heart']].forEach(([t, c, ic], j) => {
    const x = 1330 - j * 520, y = 720, p = pr(s, c, 0.45); if (p <= 0) return;
    slideIn(ctx, p, 0, 30, () => { glass(ctx, x - 240, y - 110, 480, 230, 26, { border: '#ff6fd8', glowColor: '#ff6fd8', glow: 20 }); iconDisc(ctx, ic, x, y - 30, 44, '#ff6fd8', 1); fitText(ctx, t, x, y + 60, 440, { size: 34, weight: 900 }); });
  });
}, [['שמבינים'], ['יודעים'], ['ומרגישים']]);
S.c10f = ruleScene(4, (ctx, s) => {
  text(ctx, 'מותר להציג:', 1600, 540, { size: 36, weight: 800, align: 'right', color: C.up, alpha: pr(s, 'מותר', 0.4) });
  listRows(ctx, s, [{ t: 'את הפוטנציאל', kind: 'check', cue: 'הפוטנציאל' }, { t: 'את יכולות המערכת', kind: 'check', cue: 'יכולות' }, { t: 'תוצאות היסטוריות מאומתות, בהקשר הנכון', kind: 'check', cue: 'ההיסטוריות' }], { x: 1600, y: 620, dy: 85, size: 36, r: 24 });
  const p = pr(s, 'מצג', 0.5);
  slideIn(ctx, p, -50, 0, () => { glass(ctx, 170, 520, 640, 330, 30, { border: C.down, glowColor: C.down }); cross(ctx, 490, 610, 44, 1, C.down);
    text(ctx, 'לעולם לא', 490, 710, { size: 44, weight: 900, color: C.down }); text(ctx, 'מצג שהעתיד מובטח', 490, 775, { size: 46, weight: 900 }); });
}, [['הפוטנציאל'], ['יכולות'], ['ההיסטוריות'], ['מצג', 'impact']]);
S.c10g = {
  trans: 'zoom',
  events: events([['מקצועיות'], ['שקיפות'], ['ואמון', 'impact', 0.8]]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 1.2, glow: 1.4, grid: 1 });
    ruleTiles(ctx, s, 'all', { y: 150 });
    kicker(ctx, s, 'HOW WE SELL', CX, 410, 0.1);
    [['מקצועיות', P2], ['שקיפות', TEAL], ['ואמון', GOLD]].forEach(([t, col], k) => { const x = 1500 - k * 540, p = pr(s, t, 0.4); popT(ctx, x, 560, p, () => text(ctx, t.replace(/^ו/, ''), x, 560, { size: 92, weight: 900, color: col, glow: 50, glowColor: col })); ring(ctx, x, 560, 300, p, col); if (k < 2) text(ctx, '|', x - 270, 560, { size: 90, weight: 300, color: 'rgba(255,255,255,0.3)', alpha: p }); });
    text(ctx, 'מוכרים מתוך', CX, 720, { size: 44, weight: 800, color: C.dim, alpha: pr(s, 'למכור', 0.4) });
  },
};

// ---------------- chapter 11 ----------------
S.c11_card = chapterCard(11);
S.c11a = {
  trans: 'glitch', rail: false,
  events: events([['מסע', 'riser'], ['נחשף'], ['שואל'], ['היכרות'], ['ניסיון'], ['לומד'], ['מחליט', 'impact', 0.5]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.7, glow: 1.2, grid: 0.8 });
    wipeText(ctx, 'כל לקוח חדש מתחיל מסע', CX, 160, pr(s, 'מסע', 0.5), { size: 70, weight: 900, glow: 30, glowColor: P1 });
    const nodes = [['חשיפה', 'תוכן · קהילה · פרסום', 'globe', 'נחשף'], ['שאלות', 'פונה ושואל', 'question', 'שואל'], ['שיחת היכרות', 'שירות לפני מכירה', 'call', 'היכרות'], ['ניסיון', '10 ימים', 'clock', 'ניסיון'], ['הכרת המערכת', 'ליווי אישי', 'monitor', 'לומד'], ['החלטה', 'ממשיך איתנו?', 'flag', 'מחליט']];
    const pts = nodes.map((_, k) => [1740 - k * 300, 560 + Math.sin(k * 1.3) * 150]);
    // path
    ctx.save(); ctx.strokeStyle = 'rgba(220,200,255,0.18)'; ctx.lineWidth = 6; ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
    let cur = -1; nodes.forEach(([, , , c], k) => { if (lt >= cueT(s, c) - 0.05) cur = k; });
    if (cur >= 0) {
      const f = cur + clamp((lt - cueT(s, nodes[cur][3])) / 0.6) - 1, i = Math.max(0, Math.floor(f)), fr = f - i;
      ctx.save(); ctx.strokeStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(...pts[0]);
      for (let k = 1; k <= Math.min(i, pts.length - 1); k++) ctx.lineTo(...pts[k]);
      if (f > 0 && i + 1 < pts.length) ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], fr), lerp(pts[i][1], pts[i + 1][1], fr)); ctx.stroke(); ctx.restore();
    }
    nodes.forEach(([h, sub, ic, c], k) => { const p = pr(s, c, 0.45), [x, y] = pts[k], on = k === cur; iconDisc(ctx, ic, x, y, on ? 62 : 50, on ? GOLD : TEAL, p);
      slideIn(ctx, p, 0, 20, () => { text(ctx, h, x, y + (y > 560 ? 105 : -100), { size: on ? 40 : 34, weight: 900, color: on ? GOLD : '#fff' }); text(ctx, sub, x, y + (y > 560 ? 148 : -60), { size: 24, weight: 700, color: C.dim }); }); });
  },
};
S.c11b = {
  trans: 'zoom', captions: false, rail: false,
  events: events([['אתם', 'impact', 1]]),
  draw(ctx, s) {
    const { lt } = s, p = pr(s, 'אתם', 0.5);
    bg(ctx, s, { rain: 0.6, glow: lerp(0.8, 1.6, p), grid: 1 });
    // spotlight cone
    ctx.save(); const g = ctx.createRadialGradient(CX, 520, 20, CX, 520, 620); g.addColorStop(0, `rgba(255,230,180,${0.25 * p})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    wipeText(ctx, 'ולאורך כל המסע, מי שמלווה אותו…', CX, 260, prog(lt, 0.1, 0.6), { size: 54, weight: 800, color: C.dim });
    popT(ctx, CX, 560, p, () => text(ctx, 'זה אתם.', CX, 560, { size: 230, weight: 900, color: '#fff', glow: 70, glowColor: GOLD }));
    ring(ctx, CX, 560, 800, p, GOLD); burst(ctx, CX, 560, prog(lt, cueT(s, 'אתם'), cueT(s, 'אתם') + 1.2), GOLD, 50, 23, 700);
  },
};
S.c11c = {
  trans: 'whip', rail: false,
  events: events([['סוגרים'], ['מייצגים'], ['בונים'], ['מעניקים'], ['ומשפיעים']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.5, glow: 1, dots: 0.6 });
    wipeText(ctx, 'לא רק מי שסוגרים עסקאות', CX, 180, pr(s, 'סוגרים', 0.5), { size: 64, weight: 900 });
    rowCards(ctx, s, [{ t: 'מייצגים את החברה', icon: 'building', cue: 'מייצגים', color: P2 }, { t: 'בונים את הקשר הראשוני', icon: 'handshake', cue: 'בונים', color: TEAL }, { t: 'מעניקים חוויית שירות', icon: 'heart', cue: 'מעניקים', color: '#ff6fd8' }, { t: 'משפיעים על הצמיחה', icon: 'chart', cue: 'ומשפיעים', color: GOLD }], { y: 290, h: 520, r: 74, size: 44 });
  },
};
S.c11d = {
  trans: 'zoom', rail: false,
  events: events([['מחפשים'], ['בונים', 'impact', 0.4], ['שמכיר'], ['מבין'], ['מלווה'], ['נותן'], ['ומוביל']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.6, glow: 1.1, grid: 0.6 });
    const a = pr(s, 'מחפשים', 0.4), sp = prog(lt, cueT(s, 'בטלפון'), cueT(s, 'בטלפון') + 0.4);
    slideIn(ctx, a, 0, 20, () => { ctx.save(); ctx.globalAlpha *= 1 - 0.5 * pr(s, 'בונים', 0.4); iconDisc(ctx, 'call', 1300, 180, 36, '#9a8fc4', 1); text(ctx, 'לא רק אנשים שמדברים יפה בטלפון', 1240, 182, { size: 44, weight: 800, align: 'right', color: C.dim });
      const tw = measure(ctx, 'לא רק אנשים שמדברים יפה בטלפון', 44, 800); ctx.strokeStyle = C.down; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1240, 182); ctx.lineTo(1240 - tw * sp, 182); ctx.stroke(); ctx.restore(); });
    const b = pr(s, 'בונים', 0.5);
    popT(ctx, CX, 330, b, () => text(ctx, 'אנחנו בונים צוות שיודע:', CX, 330, { size: 70, weight: 900, glow: 30, glowColor: P1 }));
    [['להכיר את המוצר', 'שמכיר', 'bulb', P2], ['להבין את הלקוח', 'מבין', 'user', TEAL], ['ללוות אותו', 'מלווה', 'chat', '#4f8cff'], ['לתת שירות מקצועי', 'נותן', 'heart', '#ff6fd8'], ['להוביל לרכישה מתוך אמון', 'ומוביל', 'handshake', GOLD]].forEach(([t, c, ic, col], k) => {
      const x = 1640 - k * 330, y = 600 + (k % 2) * 40, p = pr(s, c, 0.45); if (p <= 0) return;
      slideIn(ctx, p, 0, 50, () => { iconDisc(ctx, ic, x, y, 60, col, 1); para(ctx, t, x + 130, y + 110, 260, { size: 32, weight: 900, align: 'center' }); });
    });
  },
};
S.c11e = {
  trans: 'whip', rail: false,
  events: events([['שמערכת'], ['שירות'], ['ותהליך'], ['בונים', 'impact', 0.5], ['וקהילת']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.7, glow: 1.2, grid: 1 });
    const cols = [['מערכת איכותית', 'שמערכת', 'robot', P2], ['שירות מקצועי', 'שירות', 'heart', TEAL], ['תהליך מכירה נכון', 'ותהליך', 'filter', GOLD]];
    const base = 840, roof = pr(s, 'בונים', 0.6), comm = pr(s, 'וקהילת', 0.5);
    cols.forEach(([t, c, ic, col], k) => {
      const x = 1340 - k * 380, p = pr(s, c, 0.6), hh = 430 * E.outCubic(p); if (p <= 0) return;
      ctx.save(); const g = ctx.createLinearGradient(0, base - hh, 0, base); g.addColorStop(0, col); g.addColorStop(1, 'rgba(40,20,80,0.6)'); rrect(ctx, x - 110, base - hh, 220, hh, 16); ctx.fillStyle = g; ctx.globalAlpha = 0.85; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.fill(); ctx.restore();
      iconDisc(ctx, ic, x, base - hh + 90, 52, col, p); para(ctx, t, x, base - hh + 190, 200, { size: 34, weight: 900, align: 'center', alpha: p });
    });
    if (roof > 0) { const y = 410 - (1 - E.outBack(roof)) * 80; ctx.save(); ctx.globalAlpha = roof; ctx.beginPath(); ctx.moveTo(CX - 620, y); ctx.lineTo(CX, y - 190); ctx.lineTo(CX + 620, y); ctx.closePath(); const g = ctx.createLinearGradient(0, y - 190, 0, y); g.addColorStop(0, '#e3c4ff'); g.addColorStop(1, '#7c3aed'); ctx.fillStyle = g; ctx.shadowColor = P1; ctx.shadowBlur = 50; ctx.fill(); ctx.restore();
      text(ctx, 'חברה חזקה', CX, y - 60, { size: 60, weight: 900, color: '#1b0d3a', alpha: roof }); }
    if (comm > 0) { ctx.save(); ctx.globalAlpha = comm; glass(ctx, CX - 640, base + 10, 1280, 90, 20, { border: TEAL, glowColor: TEAL }); ctx.restore();
      for (let k = 0; k < 14; k++) icon(ctx, 'user', CX - 590 + k * 30, base + 55, 30, TEAL, { glow: 6 }); text(ctx, 'וקהילת לקוחות לטווח ארוך', CX + 160, base + 57, { size: 40, weight: 900, color: '#fff', alpha: comm }); }
  },
};
S.c11f = {
  trans: 'zoom', rail: false,
  events: s => [{ lt: 0, type: 'riser' }, ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => ({ lt: 0.15 + k * 0.28, type: 'tick' })), { lt: s.cue('שמחים'), type: 'impact', k: 0.6 }],
  draw(ctx, s) {
    const { lt } = s, J = ['LEAD', 'CONTACT', 'DISCOVERY', 'TRIAL', 'INSTALLATION', 'SUPPORT', 'CLOSING', 'CUSTOMER'];
    bg(ctx, s, { rain: 2, glow: 1.5, grid: 1 });
    const y = 300, xR = 1780, dx = 228;
    J.forEach((j, k) => { const x = xR - k * dx - 60, p = prog(lt, 0.1 + k * 0.28, 0.4 + k * 0.28), last = k === 7;
      if (k) arrow(ctx, x + dx - 30, y, x + 120, y, p, { color: GOLD, width: 4, head: 14, glow: 10 });
      popT(ctx, x, y, p, () => { ctx.save(); rrect(ctx, x - 105, y - 34, 210, 68, 34); ctx.fillStyle = last ? GOLD : 'rgba(30,18,60,0.95)'; ctx.shadowColor = last ? GOLD : P1; ctx.shadowBlur = last ? 40 : 18; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = last ? '#fff' : P2; ctx.stroke(); ctx.restore();
        fitText(ctx, j, x, y + 1, 186, { size: 24, weight: 900, fam: MONO, color: last ? '#1a0f00' : '#fff' }); }); });
    popT(ctx, CX, 560, pr(s, 'ברוכים', 0.4), () => text(ctx, 'ברוכים הבאים לצוות ALTRIX', CX, 560, { size: 96, weight: 900, glow: 50, glowColor: P1 }));
    wipeText(ctx, 'אנחנו שמחים שאתם כאן', CX, 700, pr(s, 'שמחים', 0.5), { size: 66, weight: 900, color: GOLD });
  },
};
S.c11g = {
  trans: 'flash', captions: false, bare: true,
  events: events([[0.1, 'impact', 0.9], ['ברוכים', 'pop'], ['ההצלחה', 'riser']]),
  draw(ctx, s) {
    const { lt, d } = s;
    bg(ctx, s, { rain: 2.2, glow: 1.5, grid: 1 });
    const lp = E.outCubic(prog(lt, 0, 1.2)), sc = lerp(1.2, 1, lp) * (1 + 0.012 * Math.sin(lt * 2.5));
    ctx.save(); ctx.globalAlpha = lp; ctx.translate(CX, 390); ctx.scale(sc, sc); ctx.translate(-CX, -390);
    drawLogo(ctx, CX, 390, 700, 1); drawLogo(ctx, CX, 390, 700, 0.3 + 0.2 * Math.sin(lt * 3)); ctx.restore();
    ring(ctx, CX, 390, 900, prog(lt, 0.1, 1.2)); burst(ctx, CX, 390, prog(lt, 0.1, 1.6), P2, 50, 31, 700);
    popT(ctx, CX, 790, pr(s, 'ברוכים', 0.5), () => text(ctx, 'ברוכים הבאים לצוות.', CX, 790, { size: 76, weight: 900, glow: 30, glowColor: P1 }));
    wipeText(ctx, 'ההצלחה שלנו מתחילה באנשים שלנו.', CX, 900, pr(s, 'ההצלחה', 0.7), { size: 56, weight: 800, color: GOLD });
    scrim(ctx, prog(lt, d - 1.6, d - 0.2));
  },
};

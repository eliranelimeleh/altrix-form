// Chapters 1-3: welcome, what we offer, where leads come from (+ the full funnel).
'use strict';
// shared EUR/USD candles for illustrative charts (no performance claims)
const FXC = genCandles([[0, 1.0820], [10, 1.0868], [19, 1.0832], [31, 1.0902], [42, 1.0861], [55, 1.0931], [66, 1.0884], [80, 1.0955], [92, 1.0907], [106, 1.0972], [118, 1.0925], [130, 1.0990]], { seed: 3, noise: 0.22 });
function fxChart(ctx, s, box, o = {}) {
  const ch = new Chart(FXC, { sym: 'EURUSD', tf: o.tf || '1H', dec: 5, icon: '€', iconColor: '#2962ff' });
  const [x, y, w, h] = box, n = FXC.length, rv = o.reveal ?? lerp(o.r0 ?? 40, o.r1 ?? n, clamp(s.lt / Math.max(1, s.d)));
  ch.layout(x, y, w, h, { head: o.head ?? 86, axis: o.axis ?? 130, foot: 44 });
  const i1 = Math.max(rv + 4, o.win ?? 60), i0 = i1 - (o.win ?? 60);
  ch.view(i0, i1, ...ch.autoP(i0, i1, 0.18));
  if (o.under) o.under(ch, rv);
  ch.draw(ctx, { reveal: rv, header: o.header !== false, frame: o.frame !== false, tfs: ['15m', '1H', '4H'], dim: o.dim || 0, alpha: o.alpha ?? 1 });
  return { ch, rv };
}
function miniCandles(ctx, x, y, w, h, n, seed, p = 1) { // tiny decorative candles (no axes)
  const r = rng(seed); let v = 0.5; const cw = w / n;
  for (let i = 0; i < n * clamp(p); i++) { const o = v; v = clamp(v + (r() - 0.48) * 0.3, 0.1, 0.9); const hi = Math.max(o, v) + r() * 0.08, lo = Math.min(o, v) - r() * 0.08, col = v >= o ? C.up : C.down;
    const X = x + i * cw + cw / 2, Y = q => y + h - q * h; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, Y(hi)); ctx.lineTo(X, Y(lo)); ctx.stroke();
    ctx.fillRect(X - cw * 0.3, Math.min(Y(o), Y(v)), cw * 0.6, Math.max(2, Math.abs(Y(o) - Y(v)))); }
}
function coinGlyph(ctx, g, x, y, r, col, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); const gr = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
  gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(20,10,40,0.9)'); ctx.fillStyle = gr; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke(); ctx.restore();
  text(ctx, g, x, y + r * 0.05, { size: r * 1.05, weight: 800, color: '#fff', alpha: a });
}
function productCard(ctx, x, y, w, h, k, o = {}) {
  const P = [['01', 'PRIVATE ACCOUNT', 'חשבון אישי', 'wallet', TEAL], ['02', 'PROP TRADING', 'מבחני נוסטרו', 'trophy', GOLD], ['03', 'STRIKE', 'חשבונות קטנים', 'bolt', '#ff6fd8']][k];
  const { p = 1, hot = 0, compact = false } = o; if (p <= 0) return;
  slideIn(ctx, p, 0, 60, () => {
    glass(ctx, x, y, w, h, 30, { border: P[4], glowColor: P[4], glow: 30 + hot * 40, fill: 'rgba(14,9,30,0.9)' });
    ctx.save(); rrect(ctx, x, y, w, h, 30); ctx.clip(); const g = ctx.createLinearGradient(0, y, 0, y + h * 0.5); g.addColorStop(0, P[4] + '33'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore();
    text(ctx, P[0], x + 40, y + 48, { size: 30, weight: 800, fam: MONO, color: P[4], align: 'left' });
    iconDisc(ctx, P[3], x + w / 2, y + (compact ? 120 : 170), compact ? 56 : 80, P[4], 1);
    fitText(ctx, P[1], x + w / 2, y + (compact ? 225 : 320), w - 50, { size: compact ? 34 : 48, weight: 900, fam: FONT, color: '#fff', spacing: 2 });
    text(ctx, P[2], x + w / 2, y + (compact ? 275 : 385), { size: compact ? 30 : 40, weight: 800, color: P[4] });
    if (o.extra) o.extra(x, y, w, h, P[4]);
  });
}

// ---------------- intro: cinematic logo open ----------------
S.intro = {
  bare: true, captions: false, trans: 'none',
  events: s => [{ lt: 0.0, type: 'riser' }, { lt: 1.05, type: 'impact', k: 0.8 }, { lt: 2.6, type: 'pop' }, { lt: 3.2, type: 'pop' }],
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: lerp(0.2, 2.4, prog(lt, 0, 1.2)), glow: lerp(0.2, 1.5, prog(lt, 0.4, 1.4)), grid: prog(lt, 1, 2.2) });
    // converging particles
    if (lt < 1.4) { ctx.save(); for (let k = 0; k < 120; k++) { const a = hash(k) * 7, d = (1 - E.inCubic(prog(lt, 0, 1.15))) * (400 + hash(k + 1) * 900); ctx.globalAlpha = 0.8 * prog(lt, 0, 0.3); ctx.fillStyle = hash(k + 2) > 0.7 ? TEAL : P2; ctx.beginPath(); ctx.arc(CX + Math.cos(a) * d, 430 + Math.sin(a) * d * 0.6, 2 + hash(k + 4) * 2, 0, 7); ctx.fill(); } ctx.restore(); }
    const lp = E.outCubic(prog(lt, 0.95, 2.0)), sc = lerp(1.25, 1, lp) * (1 + 0.01 * Math.sin(lt * 3));
    ctx.save(); ctx.globalAlpha = lp; ctx.translate(CX, 430); ctx.scale(sc, sc); ctx.translate(-CX, -430);
    drawLogo(ctx, CX, 430, 820, 1); drawLogo(ctx, CX, 430, 820, 0.25 + 0.2 * Math.sin(lt * 4)); ctx.restore();
    ring(ctx, CX, 430, 900, prog(lt, 1.05, 2.0)); burst(ctx, CX, 430, prog(lt, 1.05, 2.2), P2, 40, 7, 600);
    kicker(ctx, s, 'SALES TEAM ONBOARDING', CX, 800, 2.5, C.neon);
    wipeText(ctx, 'הכשרת נציגי מכירות חדשים', CX, 870, prog(lt, 3.1, 3.6), { size: 58, weight: 900, glow: 30, glowColor: P1 });
    const lw = 700 * E.outExpo(prog(lt, 3.3, 4.2)); ctx.fillStyle = P2; ctx.fillRect(CX - lw / 2, 925, lw, 3);
  },
};

// ---------------- chapter 1 ----------------
S.c1a = {
  trans: 'flash', captions: false, rail: false,
  events: s => [{ lt: 0.1, type: 'impact', k: 0.7 }],
  draw(ctx, s) {
    bg(ctx, s, { rain: 1.4, glow: 1.4, grid: 1 });
    cam(ctx, s, () => {
      drawLogo(ctx, CX, 300, 330, prog(s.lt, 0, 0.4), 'mark');
      popT(ctx, CX, 560, prog(s.lt, 0.05, 0.45), () => text(ctx, 'ברוכים הבאים', CX, 560, { size: 150, weight: 900, glow: 50, glowColor: P1 }));
      popT(ctx, CX, 720, prog(s.lt, 0.5, 0.9), () => text(ctx, 'לצוות המכירות של ALTRIX', CX, 720, { size: 74, weight: 900, color: C.neon, glow: 30, glowColor: P1 }));
      ring(ctx, CX, 560, 800, prog(s.lt, 0.1, 0.9));
    }, { k: 0.05 });
  },
};
S.c1b = {
  trans: 'none',
  events: events([['שמחים'], ['המסחר'], ['בשווקים']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.6, glow: 1.1 });
    ctx.save(); ctx.globalAlpha = 0.35; fxChart(ctx, s, [60, 130, 1800, 820], { header: false, frame: false, r0: 30, r1: 70, win: 70, axis: 120 }); ctx.restore();
    scrim(ctx, 0.35);
    const coins = [['€', '#2962ff'], ['$', '#16c784'], ['£', '#a855f7'], ['¥', '#f23645'], ['₿', '#f7931a'], ['€', '#2ee6c8']];
    coins.forEach(([g, col], k) => {
      const a = lt * 0.35 + k / coins.length * Math.PI * 2, x = CX + Math.cos(a) * 640, y = 520 + Math.sin(a) * 250, z = 0.75 + 0.25 * Math.sin(a);
      coinGlyph(ctx, g, x, y, 46 * z, col, prog(lt, 0.2 + k * 0.12, 0.6 + k * 0.12) * z);
    });
    cam(ctx, s, () => {
      badgeAt(ctx, s, 'שמחים שבחרתם להצטרף', CX, 330, 'שמחים', P1, 32);
      kicker(ctx, s, 'AUTOMATED TRADING · FINANCIAL MARKETS', CX, 450, cueT(s, 'המסחר') - 0.2);
      popT(ctx, CX, 540, pr(s, 'המסחר', 0.4), () => text(ctx, 'מסחר אוטומטי', CX, 540, { size: 130, weight: 900, glow: 45, glowColor: P1 }));
      wipeText(ctx, 'בשווקים הפיננסיים', CX, 680, pr(s, 'בשווקים', 0.5), { size: 64, weight: 800, color: C.neon });
    });
  },
};
S.c1c = {
  trans: 'whip',
  events: events([['הניסיון'], ['פיתחנו', 'impact', 0.4], ['לשיטתי'], ['נגיש'], ['ופשוט']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1, dots: 0.8 });
    cam(ctx, s, () => {
      // left: experience stat
      const sp = pr(s, 'הניסיון', 0.6);
      if (sp > 0) {
        const cx = 520, cy = 520, R0 = 230;
        ctx.save(); ctx.globalAlpha = clamp(sp * 2); ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(168,85,247,0.15)'; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, 7); ctx.stroke();
        ctx.strokeStyle = P2; ctx.shadowColor = P1; ctx.shadowBlur = 30; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 - Math.PI * 2 * 0.85 * E.outCubic(prog(lt, cueT(s, 'הניסיון'), cueT(s, 'הניסיון') + 1.6)), true); ctx.stroke(); ctx.restore();
        const v = (8.5 * E.outCubic(prog(lt, cueT(s, 'הניסיון'), cueT(s, 'הניסיון') + 1.4))).toFixed(1);
        text(ctx, v, cx, cy - 20, { size: 170, weight: 900, fam: MONO, glow: 40, glowColor: P1, alpha: clamp(sp * 2) });
        text(ctx, 'שנות ניסיון במסחר', cx, cy + 110, { size: 44, weight: 900, color: C.neon, alpha: clamp(sp * 2) });
      }
      // right: what we built
      const bp = pr(s, 'פיתחנו', 0.5);
      if (bp > 0) {
        slideIn(ctx, bp, 60, 0, () => {
          iconDisc(ctx, 'robot', 1640, 270, 70, TEAL, 1);
          text(ctx, 'מערכות מסחר', 1540, 245, { size: 50, weight: 900, align: 'right' });
          text(ctx, 'אוטומטיות', 1540, 305, { size: 50, weight: 900, align: 'right', color: TEAL });
        });
      }
      [['שיטתי', 'לשיטתי', 'target'], ['נגיש', 'נגיש', 'users'], ['פשוט לתפעול', 'ופשוט', 'gear']].forEach(([t, c, ic], k) => {
        const p = pr(s, c, 0.45), y = 470 + k * 145; if (p <= 0) return;
        slideIn(ctx, p, 80, 0, () => { glass(ctx, 1080, y - 55, 640, 110, 26, { glow: 25 }); iconDisc(ctx, ic, 1660, y, 40, P1, 1); text(ctx, t, 1590, y + 2, { size: 50, weight: 900, align: 'right' }); });
      });
    });
  },
};
S.c1d = {
  trans: 'zoom',
  events: events([['2025', 'impact', 0.5], ['צמחנו'], ['קהילות'], ['וברשתות'], ['למאות']]),
  draw(ctx, s) {
    const { lt } = s, y = 700, xR = 1700, xL = 220;
    bg(ctx, s, { rain: 0.5, glow: 1, grid: 0.6 });
    sectionTitle(ctx, s, 'מאז 2025: צמיחה מתמדת', 'OUR TIMELINE', { y: 180 });
    const t0 = cueT(s, '2025'), lp = E.inOut(prog(lt, t0, s.d - 0.8));
    // growing network above the line (illustrative)
    const nodes = 64; ctx.save();
    for (let k = 0; k < nodes; k++) {
      const f = k / nodes; if (f > lp + 0.02) break;
      const x = xR - (xR - xL) * f, yy = 470 + (hash(k + 1) - 0.5) * 300 * (0.4 + f), a = clamp((lp - f) * 8);
      if (k > 0) { const j = Math.max(0, k - 1 - Math.floor(hash(k + 7) * 3)), fx = xR - (xR - xL) * (j / nodes), fy = 470 + (hash(j + 1) - 0.5) * 300 * (0.4 + j / nodes);
        ctx.globalAlpha = 0.35 * a; ctx.strokeStyle = P2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(x, yy); ctx.stroke(); }
      ctx.globalAlpha = a; ctx.fillStyle = hash(k + 3) > 0.7 ? TEAL : P2; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(x, yy, 4 + hash(k + 5) * 5 * (0.5 + f), 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.restore();
    // the timeline
    ctx.save(); ctx.strokeStyle = 'rgba(200,170,255,0.25)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(xL, y); ctx.stroke();
    const g = ctx.createLinearGradient(xR, 0, xL, 0); g.addColorStop(0, P1); g.addColorStop(1, TEAL); ctx.strokeStyle = g; ctx.shadowColor = P1; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(xR - (xR - xL) * lp, y); ctx.stroke(); ctx.restore();
    const ms = [['2025', 'תחילת פעילות המערכות', 'play', '2025', 0, P1], ['צמיחה', 'מערכות, תוכן ושירות', 'refresh', 'צמחנו', 0.25, P2], ['קהילות', 'וואטסאפ', 'whatsapp', 'קהילות', 0.5, WA], ['רשתות', 'רשתות חברתיות', 'globe', 'וברשתות', 0.72, '#4f8cff'], ['מאות', 'משתמשים במערכות', 'users', 'למאות', 1, GOLD]];
    ms.forEach(([h, sub, ic, c, f, col]) => {
      const p = pr(s, c, 0.45), x = xR - (xR - xL) * f; if (p <= 0) return;
      iconDisc(ctx, ic, x, y, 40, col, p);
      slideIn(ctx, p, 0, 30, () => { text(ctx, h, x, y + 90, { size: h.length > 4 ? 40 : 46, weight: 900, color: col, fam: /\d/.test(h) ? MONO : FONT }); text(ctx, sub, x, y + 140, { size: 26, weight: 700, color: C.dim }); });
    });
    text(ctx, 'היום', xL - 95, y + 2, { size: 32, weight: 900, color: TEAL, alpha: prog(lt, s.d - 1.4, s.d - 0.8) });
  },
};
S.c1e = {
  trans: 'whip',
  events: s => { const e = s.seg.words[s.seg.words.length - 1].t1 - s.seg.t0; return [{ lt: s.cue('מקצועית'), type: 'pop' }, { lt: s.cue('אישית'), type: 'pop' }, { lt: s.cue('ומוצלחת'), type: 'pop' }, { lt: e - 0.6, type: 'riser' }, { lt: e + 0.15, type: 'impact', k: 1 }]; },
  draw(ctx, s) {
    const { lt } = s, end = s.seg.words[s.seg.words.length - 1].t1 - s.seg.t0, fin = prog(lt, end + 0.1, end + 0.6);
    bg(ctx, s, { rain: lerp(0.6, 2, fin), glow: lerp(1, 1.5, fin), grid: 1 });
    const a = 1 - fin;
    ctx.save(); ctx.globalAlpha = a;
    avatar(ctx, CX, 330, 100, { color: P1, headset: true, ring: 1 });
    wipeText(ctx, 'מהתעניינות ⟵ לחוויית לקוח', CX, 520, pr(s, 'ההתעניינות', 0.5), { size: 56, weight: 900 });
    [['מקצועית', P1], ['אישית', TEAL], ['ומוצלחת', GOLD]].forEach(([t, col], k) => { const x = 1380 - k * 420; popT(ctx, x, 680, pr(s, t, 0.4), () => pill(ctx, t.replace('ו', k === 2 ? '' : 'ו'), x, 680, { size: 50, color: col, weight: 900, glow: 40, fill: false })); });
    ctx.restore();
    if (fin > 0) {
      ring(ctx, CX, 520, 1100, fin);
      popT(ctx, CX, 420, fin, () => text(ctx, 'WELCOME TO', CX, 420, { size: 64, weight: 800, fam: MONO, color: C.neon, spacing: 18 }));
      popT(ctx, CX, 560, prog(lt, end + 0.25, end + 0.75), () => text(ctx, 'THE ALTRIX SALES TEAM', CX, 560, { size: 120, weight: 900, glow: 60, glowColor: P1, spacing: 4 }));
      const lw = 1300 * E.outExpo(prog(lt, end + 0.5, end + 1.3)); ctx.fillStyle = P2; ctx.fillRect(CX - lw / 2, 650, lw, 4);
      burst(ctx, CX, 520, prog(lt, end + 0.15, end + 1.3), P2, 46, 9, 800);
    }
  },
};

// ---------------- chapter 2 ----------------
S.c2_card = chapterCard(2);
S.c2a = {
  trans: 'glitch',
  events: events([['להבין']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.8, glow: 1.1, dots: 0.6 });
    cam(ctx, s, () => {
      kicker(ctx, s, 'KNOW THE PRODUCT FIRST', CX, 330, 0.1);
      popT(ctx, CX, 450, prog(s.lt, 0.15, 0.55), () => text(ctx, 'לפני שמדברים עם לקוחות', CX, 450, { size: 70, weight: 900 }));
      popT(ctx, CX, 600, pr(s, 'להבין', 0.45), () => text(ctx, 'מבינים מה אנחנו מציעים', CX, 600, { size: 96, weight: 900, color: C.neon, glow: 40, glowColor: P1 }));
      iconDisc(ctx, 'bulb', CX, 770, 56, GOLD, pr(s, 'מציעים', 0.4));
    }, { k: 0.06 });
  },
};
S.c2b = {
  trans: 'whip',
  events: events([['אוטומטיות'], ['קנייה'], ['המט'], ['יורו']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.4, glow: 0.9 });
    const marks = [[46, 'BUY'], [53, 'SELL'], [61, 'BUY'], [69, 'SELL'], [77, 'BUY'], [86, 'SELL'], [95, 'BUY'], [103, 'SELL']];
    const { ch, rv } = fxChart(ctx, s, [100, 150, 1720, 760], { r0: 44, r1: 108, win: 64 });
    marks.forEach(([i, side]) => {
      if (rv < i + 1) return; const q = FXC[i], buy = side === 'BUY', y = buy ? ch.Y(q.l) + 46 : ch.Y(q.h) - 46, p = clamp((rv - i - 1) * 2);
      ch.clip(ctx, () => popT(ctx, ch.X(i), y, p, () => { arrow(ctx, ch.X(i), buy ? y + 40 : y - 40, ch.X(i), buy ? y - 6 : y + 6, 1, { color: buy ? C.up : C.down, width: 6, head: 20, glow: 14 }); pill(ctx, side, ch.X(i), buy ? y + 64 : y - 64, { size: 18, color: buy ? C.up : C.down, fam: MONO }); }));
    });
    // algo badge on chart
    popT(ctx, 400, 300, pr(s, 'אוטומטיות', 0.4), () => { glass(ctx, 150, 255, 420, 90, 20, { border: TEAL, glowColor: TEAL }); icon(ctx, 'robot', 205, 300, 50, TEAL); text(ctx, 'ALTRIX ALGO', 250, 288, { size: 26, weight: 800, fam: MONO, color: TEAL, align: 'left' }); text(ctx, 'מבצע עסקאות אוטומטית', 250, 322, { size: 22, weight: 700, align: 'left', color: C.dim });
      ctx.beginPath(); ctx.arc(535, 300, 9 + Math.sin(lt * 6) * 2, 0, 7); ctx.fillStyle = C.up; ctx.shadowColor = C.up; ctx.shadowBlur = 16; ctx.fill(); });
    badgeAt(ctx, s, 'שוק המט"ח · FOREX', 1440, 300, 'המט', P1, 30);
    badgeAt(ctx, s, 'EUR / USD', 1440, 370, 'יורו', '#2962ff', 30);
  },
};
S.c2c = {
  trans: 'zoom',
  events: events([['לשבת'], ['לנתח'], ['ידנית'], ['אוטומטי', 'impact', 0.4], ['אסטרטגיית'], ['ניהול']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.5, glow: 1 });
    sectionTitle(ctx, s, 'במקום מסחר ידני: אוטומציה', 'MANUAL VS. AUTOMATED', { y: 170 });
    contrast(ctx, s,
      { h: 'מסחר ידני', good: false, color: '#9a8fc4', cue: 'לשבת', items: [{ t: 'לשבת מול הגרפים', cue: 'לשבת' }, { t: 'לנתח כל תנועה', cue: 'לנתח' }, { t: 'לבצע כל עסקה ידנית', cue: 'ידנית' }],
        draw: (x, y, w, h) => { icon(ctx, 'clock', x + 120, y + h - 90, 90, 'rgba(200,190,235,0.5)'); icon(ctx, 'user', x + 230, y + h - 90, 90, 'rgba(200,190,235,0.5)'); } },
      { h: 'מערכת ALTRIX', good: true, color: TEAL, cue: 'אוטומטי', items: [{ t: 'פועלת באופן אוטומטי', cue: 'אוטומטי' }, { t: 'לפי אסטרטגיית המסחר', cue: 'אסטרטגיית' }, { t: 'עם הגדרות ניהול סיכונים', cue: 'ניהול' }],
        draw: (x, y, w, h) => { icon(ctx, 'robot', x + 120, y + h - 90, 100, TEAL); icon(ctx, 'shield', x + 240, y + h - 90, 90, TEAL, { check: true }); } },
      { y: 270, h: 600 });
  },
};
S.c2d = {
  trans: 'whip',
  events: events([['צריך'], ['אופן'], ['הסיכונים'], ['הגדרות'], ['עוקבים']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.5, glow: 1, dots: 0.6 });
    cam(ctx, s, () => {
      const p = pr(s, 'צריך', 0.5);
      slideIn(ctx, p, -60, 0, () => {
        glass(ctx, 110, 260, 700, 560, 34, { border: C.up, glowColor: C.up });
        check(ctx, 460, 420, 70, 1, C.up);
        text(ctx, 'לא צריך להיות', 460, 570, { size: 50, weight: 900 }); text(ctx, 'סוחר מקצועי', 460, 640, { size: 64, weight: 900, color: C.up });
        text(ctx, 'כדי להפעיל את המערכת', 460, 715, { size: 30, weight: 700, color: C.dim });
      });
      wipeText(ctx, 'אבל חשוב שיבין:', 1760, 300, pr(s, 'אבל', 0.4), { size: 52, weight: 900, align: 'right', color: GOLD });
      listRows(ctx, s, [{ t: 'אופן הפעולה', kind: 'gear', cue: 'אופן', color: P1 }, { t: 'הסיכונים', kind: 'shield', cue: 'הסיכונים', color: GOLD }, { t: 'הגדרות החשבון', kind: 'wallet', cue: 'הגדרות', color: TEAL }, { t: 'איך עוקבים אחר התוצאות', kind: 'chart', cue: 'עוקבים', color: '#4f8cff' }],
        { x: 1720, y: 420, dy: 118, size: 44, r: 38 });
    });
  },
};
S.c2e = {
  trans: 'glitch', captions: true,
  events: events([['כמה', 'impact', 0.5]]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 1, glow: 1.2, grid: 0.7 });
    statement(ctx, s, '3 פתרונות מסחר', { y: 250, at: cueT(s, 'כמה'), size: 100, en: 'THREE WAYS TO USE ALTRIX' });
    [0, 1, 2].forEach(k => productCard(ctx, 1290 - k * 560, 400, 500, 470, k, { p: prog(s.lt, cueT(s, 'אפשרויות') + k * 0.18, cueT(s, 'אפשרויות') + 0.5 + k * 0.18), compact: true }));
  },
};
S.c2f = {
  trans: 'zoom',
  events: events([['הראשון', 'impact', 0.4], ['מחבר'], ['עסקאות'], ['בהתאם']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    productCard(ctx, 1210, 170, 600, 700, 0, { p: pr(s, 'הראשון', 0.5), hot: 1 });
    // robot -> account link with trade pulses
    const rx = 320, ax = 900, yy = 470, lp = pr(s, 'מחבר', 0.8);
    iconDisc(ctx, 'robot', rx, yy, 90, P1, pr(s, 'מחבר', 0.4, -0.3)); text(ctx, 'מערכת ALTRIX', rx, yy + 140, { size: 34, weight: 900, alpha: pr(s, 'מחבר', 0.4, -0.3) });
    iconDisc(ctx, 'wallet', ax, yy, 90, TEAL, pr(s, 'אישי', 0.4)); text(ctx, 'חשבון מסחר אישי', ax, yy + 140, { size: 34, weight: 900, color: TEAL, alpha: pr(s, 'אישי', 0.4) });
    if (lp > 0) { ctx.save(); ctx.strokeStyle = TEAL; ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -lt * 60; ctx.shadowColor = TEAL; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.moveTo(rx + 100, yy); ctx.lineTo(rx + 100 + (ax - rx - 200) * E.outCubic(lp), yy); ctx.stroke(); ctx.restore(); icon(ctx, 'link', (rx + ax) / 2, yy - 70, 60, TEAL, { glow: 20 }); }
    const tp = prog(lt, cueT(s, 'עסקאות'), s.d);
    if (tp > 0) for (let k = 0; k < 6; k++) { const f = ((lt - cueT(s, 'עסקאות')) * 0.5 + k / 6) % 1, x = lerp(rx + 100, ax - 100, f), buy = k % 2 === 0;
      ctx.save(); ctx.globalAlpha = Math.sin(f * Math.PI); pill(ctx, buy ? 'BUY' : 'SELL', x, yy, { size: 20, color: buy ? C.up : C.down, fam: MONO }); ctx.restore(); }
    badgeAt(ctx, s, 'אוטומטית · לפי ההגדרות', 610, 750, 'בהתאם', P1, 32);
  },
};
S.c2g = {
  trans: 'none', risk: true,
  events: events([['הרווחים'], ['ידנית']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    productCard(ctx, 1210, 170, 600, 700, 0, { p: 1, hot: 0.4 });
    windowFrame(ctx, 110, 180, 1020, 640, 'חשבון המסחר של הלקוח · המחשה');
    // equity line wiggling up and down (illustrative, no trend claim)
    const x0 = 160, x1 = 1080, y0 = 330, y1 = 660, n = 120, rp = prog(lt, 0.2, s.d);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 - 20, x1 - x0, y1 - y0 + 40); ctx.clip(); ctx.strokeStyle = C.neon; ctx.lineWidth = 4; ctx.shadowColor = P1; ctx.shadowBlur = 14; ctx.beginPath();
    for (let i = 0; i <= n * rp; i++) { const v = Math.sin(i * 0.17) * 0.35 + Math.sin(i * 0.071 + 1) * 0.4 + Math.sin(i * 0.43) * 0.12; const x = lerp(x0, x1, i / n), y = lerp(y1, y0, 0.5 + v * 0.55); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x0, y0 + k * 110); ctx.lineTo(x1, y0 + k * 110); ctx.stroke(); }
    text(ctx, 'Equity', x0, 280, { size: 24, weight: 700, fam: MONO, color: C.axis, align: 'left' });
    // P/L chips appearing both green and red
    [['+', C.up, 0.15], ['−', C.down, 0.35], ['+', C.up, 0.55], ['−', C.down, 0.72], ['+', C.up, 0.88]].forEach(([sg, col, f], k) => {
      const p = prog(rp, f, f + 0.08); if (p <= 0) return; const x = lerp(x0, x1, f) + 10; popT(ctx, x, 720, p, () => pill(ctx, sg === '+' ? 'רווח' : 'הפסד', x, 760, { size: 22, color: col, fill: false }));
    });
    badgeAt(ctx, s, 'רווח והפסד משתקפים בחשבון הלקוח', 800, 292, 'הרווחים', P1, 24, true);
    popT(ctx, 620, 920, pr(s, 'ידנית', 0.4), () => { check(ctx, 900, 920, 26, 1, C.up); text(ctx, 'בלי לבצע ידנית כל עסקה', 860, 922, { size: 36, weight: 800, align: 'right' }); });
  },
};
S.c2h = {
  trans: 'whip',
  events: events([['השני', 'impact', 0.4], ['מבחני', 'pop'], ['בתנאי'], ['ממומנים']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.5, glow: 1, grid: 0.5 });
    productCard(ctx, 1210, 170, 600, 700, 1, { p: pr(s, 'השני', 0.5), hot: 1 });
    const steps = [['מבחן הערכה', 'חברת נוסטרו', 'doc', ['מבחני', 1], P1], ['עמידה בתנאים', 'יעדים ומגבלות', 'target', 'בתנאי', GOLD], ['חשבון ממומן', 'בכפוף לתנאי החברה', 'wallet', 'ממומנים', TEAL]];
    steps.forEach(([h, sub, ic, c, col], k) => {
      const x = 960 - k * 330, y = 470, p = pr(s, c, 0.45); if (p <= 0) return;
      if (k) arrow(ctx, x + 250, y, x + 105, y, prog(s.lt, cueT(s, c) - 0.1, cueT(s, c) + 0.3), { color: 'rgba(220,200,255,0.7)', width: 5, head: 20, glow: 10 });
      iconDisc(ctx, ic, x, y, 78, col, p);
      slideIn(ctx, p, 0, 30, () => { text(ctx, h, x, y + 130, { size: 38, weight: 900 }); text(ctx, sub, x, y + 178, { size: 25, weight: 600, color: C.dim }); });
    });
    badgeAt(ctx, s, 'רק אם הלקוח עומד בתנאי החברה', 630, 800, 'בתנאי', GOLD, 28, false);
  },
};
S.c2i = {
  trans: 'none', risk: true,
  events: events([['ביעדי'], ['ובמגבלות'], ['ככלי'], ['בכפוף', 'impact', 0.35]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.4, glow: 1 });
    productCard(ctx, 1210, 170, 600, 700, 1, { p: 1, hot: 0.4 });
    windowFrame(ctx, 110, 170, 1040, 700, 'PROP EVALUATION · המחשה');
    const rows = [['יעד מסחר', 'ביעדי', TEAL, 0.62, 'target'], ['מגבלת הפסד יומית', 'ובמגבלות', GOLD, 0.3, 'shield'], ['מגבלת הפסד כוללת', 'ובמגבלות', C.down, 0.22, 'shield'], ['כללי החברה', 'בכפוף', P2, 1, 'doc']];
    rows.forEach(([h, c, col, v, ic], k) => {
      const y = 290 + k * 125, p = pr(s, c, 0.45, -0.05 + (k === 2 ? 0.3 : 0)); if (p <= 0) return;
      slideIn(ctx, p, 50, 0, () => { iconDisc(ctx, ic, 1080, y, 32, col, 1); text(ctx, h, 1030, y - 22, { size: 30, weight: 800, align: 'right' });
        progressBar(ctx, 170, y + 16, 860, 18, v * E.outCubic(clamp(p * 1.2)), { color: col, color2: col }); });
    });
    // robot plugged in as a tool
    popT(ctx, 300, 800, pr(s, 'ככלי', 0.4), () => { pill(ctx, '🤖'.length > 2 ? 'ALTRIX ככלי אוטומטי' : 'ALTRIX ככלי אוטומטי', 330, 800, { size: 28, color: P1, glow: 26 }); });
    // compliance stamp
    const sp = pr(s, 'בכפוף', 0.4);
    if (sp > 0) popT(ctx, 840, 800, sp, () => { ctx.save(); ctx.translate(840, 800); ctx.rotate(-0.06); rrect(ctx, -270, -42, 540, 84, 14); ctx.lineWidth = 4; ctx.strokeStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.stroke(); ctx.restore();
      text(ctx, 'בכפוף לתקנון של כל חברת נוסטרו', 840, 798, { size: 28, weight: 900, color: GOLD }); });
  },
};
S.c2j = {
  trans: 'glitch', risk: true,
  events: events([['אין', 'impact', 0.7], ['למעבר'], ['לקבלת'], ['להשגת']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.4, glow: 0.9, hue: 40 });
    cam(ctx, s, () => {
      warnIcon(ctx, CX, 260, 80, pr(s, 'אין', 0.4));
      popT(ctx, CX, 420, pr(s, 'אין', 0.4), () => text(ctx, 'אין הבטחה', CX, 420, { size: 110, weight: 900, color: GOLD, glow: 40, glowColor: '#ff9800' }));
      [['למעבר מבחן', 'למעבר'], ['לקבלת חשבון ממומן', 'לקבלת'], ['להשגת רווחים', 'להשגת']].forEach(([t, c], k) => {
        const x = 1440 - k * 480, p = pr(s, c, 0.4); if (p <= 0) return;
        slideIn(ctx, p, 0, 40, () => { glass(ctx, x - 210, 560, 420, 200, 26, { border: C.down, glowColor: C.down, glow: 25 }); cross(ctx, x, 620, 30, 1, C.down); text(ctx, t, x, 705, { size: 36, weight: 900 }); });
      });
    });
  },
};
S.c2k = {
  trans: 'zoom',
  events: events([['השלישי', 'impact', 0.4], ['קטנים'], ['ההון'], ['הסיכון']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1, hue: 30 });
    productCard(ctx, 1210, 170, 600, 700, 2, { p: pr(s, 'השלישי', 0.5), hot: 1 });
    const p = pr(s, 'קטנים', 0.5);
    slideIn(ctx, p, -50, 0, () => {
      windowFrame(ctx, 140, 200, 940, 380, 'STRIKE · חשבון קטן · המחשה');
      iconDisc(ctx, 'wallet', 300, 390, 70, '#ff6fd8', 1);
      text(ctx, 'חשבון מסחר קטן יותר', 1020, 330, { size: 40, weight: 900, align: 'right' });
      text(ctx, 'רובוט ייעודי שעובד עם היקף הון מצומצם', 1020, 385, { size: 28, weight: 600, align: 'right', color: C.dim });
      miniCandles(ctx, 180, 470, 860, 90, 34, 5, prog(lt, cueT(s, 'קטנים'), s.d));
    });
    [['דרישות הון', 'ההון', 'coin', GOLD], ['הגדרות סיכון', 'הסיכון', 'shield', TEAL]].forEach(([t, c, ic, col], k) => {
      const pp = pr(s, c, 0.4), x = 860 - k * 460; if (pp <= 0) return;
      slideIn(ctx, pp, 0, 40, () => { glass(ctx, x - 210, 640, 420, 170, 24, { border: col, glowColor: col, glow: 24 }); iconDisc(ctx, ic, x + 130, 725, 42, col, 1); text(ctx, t, x + 60, 712, { size: 36, weight: 900, align: 'right' }); text(ctx, 'בהתאם למוצר', x + 60, 760, { size: 24, weight: 600, align: 'right', color: C.dim }); });
    });
  },
};
S.c2l = {
  trans: 'whip',
  events: events([['להתאים', 'impact', 0.4], ['מסלול'], ['הסיכון']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.6, glow: 1, grid: 0.6 });
    sectionTitle(ctx, s, 'הפתרון הנכון ללקוח הנכון', 'MATCH THE SOLUTION', { y: 165 });
    const pick = lt > cueT(s, 'מסלול') ? Math.floor((lt - cueT(s, 'מסלול')) / 0.9) % 3 : -1;
    [0, 1, 2].forEach(k => productCard(ctx, 1300 - k * 520, 250, 470, 360, k, { p: prog(lt, 0.1 + k * 0.12, 0.6 + k * 0.12), compact: true, hot: pick === k ? 1 : 0 }));
    const ap = pr(s, 'להתאים', 0.5);
    avatar(ctx, CX, 790, 70 * E.outBack(ap) + 0.001, { color: TEAL, ring: 1 });
    if (ap > 0) [0, 1, 2].forEach(k => { const x = 1300 - k * 520 + 235; ctx.save(); ctx.globalAlpha = ap * (pick === k ? 1 : 0.35); ctx.strokeStyle = pick === k ? GOLD : P2; ctx.lineWidth = pick === k ? 5 : 2; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -lt * 40;
      ctx.beginPath(); ctx.moveTo(CX, 720); ctx.quadraticCurveTo((CX + x) / 2, 680, x, 615); ctx.stroke(); ctx.restore(); });
    text(ctx, 'מטרות הלקוח', CX + 330, 770, { size: 32, weight: 800, color: TEAL, alpha: pr(s, 'למטרות', 0.4) });
    // risk tolerance gauge
    const gp = pr(s, 'הסיכון', 0.5);
    if (gp > 0) { const gx = CX - 380, gy = 800; ctx.save(); ctx.globalAlpha = gp; ctx.lineWidth = 14; ctx.lineCap = 'round';
      [[C.up, Math.PI, Math.PI * 1.33], [GOLD, Math.PI * 1.33, Math.PI * 1.66], [C.down, Math.PI * 1.66, Math.PI * 2]].forEach(([c, a, b]) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(gx, gy, 70, a, b); ctx.stroke(); });
      const a = Math.PI * (1.15 + 0.5 * (0.5 + 0.4 * Math.sin(lt * 1.5))); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(a) * 60, gy + Math.sin(a) * 60); ctx.stroke(); ctx.restore();
      text(ctx, 'רמת סיכון', gx, gy + 40, { size: 28, weight: 800, alpha: gp }); }
  },
};

// ---------------- chapter 3 ----------------
S.c3_card = chapterCard(3);
S.c3a = {
  trans: 'glitch',
  events: events([['בקהילה'], ['בתוכן'], ['בהסברה'], ['ובחשיפה']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.6, glow: 1, dots: 0.7 });
    sectionTitle(ctx, s, 'איך הכל מתחיל?', 'IT STARTS WITH VALUE', { y: 175 });
    rowCards(ctx, s, [{ t: 'קהילה', sub: 'קהילות פעילות', icon: 'users', cue: 'בקהילה', color: P1 }, { t: 'תוכן מקצועי', sub: 'ערך אמיתי לעוקבים', icon: 'doc', cue: 'בתוכן', color: TEAL },
      { t: 'הסברה', sub: 'מסבירים איך זה עובד', icon: 'bulb', cue: 'בהסברה', color: GOLD }, { t: 'חשיפה', sub: 'ברשתות החברתיות', icon: 'globe', cue: 'ובחשיפה', color: '#4f8cff' }], { y: 300, h: 500 });
  },
};
S.c3b = {
  trans: 'zoom',
  events: events([['משני', 'impact', 0.6]]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 1.2, glow: 1.3, grid: 0.8 });
    cam(ctx, s, () => {
      popT(ctx, CX, 420, pr(s, 'משני', 0.4), () => { text(ctx, '2', CX, 420, { size: 360, weight: 900, fam: MONO, glow: 60, glowColor: P1 }); });
      wipeText(ctx, 'מקורות לידים עיקריים', CX, 700, pr(s, 'מקורות', 0.4), { size: 80, weight: 900, color: C.neon });
      ring(ctx, CX, 420, 600, pr(s, 'משני', 0.9));
      iconDisc(ctx, 'whatsapp', CX + 420, 420, 60, WA, pr(s, 'מקורות', 0.4, 0.2)); iconDisc(ctx, 'megaphone', CX - 420, 420, 60, GOLD, pr(s, 'מקורות', 0.4, 0.35));
    }, { k: 0.05 });
  },
};
S.c3c = {
  trans: 'whip',
  events: events([['הראשון'], ['עוקבים'], ['נחשפים'], ['ללמוד']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    pill(ctx, 'מקור 1', 1720, 190, { size: 26, color: WA }); wipeText(ctx, 'קהילות וואטסאפ ורשתות חברתיות', 1650, 190, pr(s, 'הראשון', 0.5), { size: 50, weight: 900, align: 'right' });
    const t0 = cueT(s, 'הקהילות');
    waChat(ctx, s, 250, 140, 470, 820, 'ALTRIX · קהילת מסחר', [
      { side: 'in', name: 'ALTRIX', nameColor: C.neon, t: 'תוכן מקצועי חדש עלה לקהילה: מה זה מסחר אוטומטי ואיך הוא עובד?', at: t0 },
      { side: 'in', name: 'ALTRIX', nameColor: C.neon, t: 'סרטון הסבר: איך עוקבים אחר העסקאות במערכת', at: t0 + 1.2 },
      { side: 'in', name: 'חבר קהילה', nameColor: '#ffb74d', t: 'אפשר לקבל עוד פרטים על המערכת?', at: cueT(s, 'ללמוד') },
    ], { group: true, sub: 'חברי קהילה · המחשה', size: 21 });
    const flow = [['עוקבים אחר התכנים', 'עוקבים', 'eye', P1], ['נחשפים למערכת', 'נחשפים', 'robot', TEAL], ['רוצים ללמוד עוד', 'ללמוד', 'bulb', GOLD]];
    flow.forEach(([t, c, ic, col], k) => {
      const y = 380 + k * 175, p = pr(s, c, 0.45); if (p <= 0) return;
      slideIn(ctx, p, 60, 0, () => { glass(ctx, 900, y - 65, 860, 130, 26, { border: col, glowColor: col, glow: 22 }); iconDisc(ctx, ic, 1680, y, 44, col, 1); text(ctx, t, 1600, y + 2, { size: 46, weight: 900, align: 'right' });
        if (k < 2) arrow(ctx, 1330, y + 70, 1330, y + 108, prog(lt, cueT(s, c) + 0.2, cueT(s, c) + 0.6), { color: 'rgba(220,200,255,0.6)', width: 5, head: 18, glow: 8 }); });
    });
  },
};
S.c3d = {
  trans: 'whip',
  events: events([['השני'], ['שחושפים', 'riser']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    pill(ctx, 'מקור 2', 1720, 190, { size: 26, color: GOLD }); wipeText(ctx, 'קמפיינים ממומנים', 1650, 190, pr(s, 'השני', 0.5), { size: 50, weight: 900, align: 'right' });
    // reach rings with new people
    const rp = prog(lt, cueT(s, 'שחושפים') - 0.3, s.d);
    for (let k = 0; k < 4; k++) { const f = (lt * 0.4 + k / 4) % 1; ctx.save(); ctx.globalAlpha = rp * (1 - f) * 0.5; ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(560, 560, 200 + f * 520, 0, 7); ctx.stroke(); ctx.restore(); }
    for (let k = 0; k < 18; k++) { const a = hash(k) * 7, d = 330 + hash(k + 2) * 380, p = clamp(rp * 3 - hash(k + 4) * 2); if (p <= 0) continue; icon(ctx, 'user', 560 + Math.cos(a) * d, 560 + Math.sin(a) * d * 0.7, 40 * p, hash(k + 5) > 0.5 ? P2 : TEAL, { glow: 10 }); }
    // sponsored post
    const pp = prog(lt, 0.2, 0.7);
    slideIn(ctx, pp, 0, 60, () => {
      glass(ctx, 360, 290, 400, 560, 26, { fill: 'rgba(18,14,34,0.98)', glow: 40 });
      ctx.save(); ctx.beginPath(); ctx.arc(410, 340, 24, 0, 7); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore(); drawLogo(ctx, 410, 340, 70, 1, 'mark');
      text(ctx, 'ALTRIX', 445, 330, { size: 22, weight: 800, align: 'left' }); text(ctx, 'ממומן', 445, 356, { size: 17, weight: 600, align: 'left', color: C.dim });
      ctx.save(); rrect(ctx, 380, 385, 360, 260, 12); ctx.clip(); ctx.fillStyle = '#0b0718'; ctx.fillRect(380, 385, 360, 260); drawLogo(ctx, 560, 515, 300, 1); ctx.restore();
      para(ctx, 'רוצים להכיר את מערכות המסחר האוטומטיות של ALTRIX? שלחו הודעה ונשמח להסביר.', 735, 685, 350, { size: 21, weight: 600 });
      button(ctx, 'שליחת הודעה', 560, 800, 300, 58, { color: WA_D, size: 24, iconName: 'whatsapp', pressed: Math.exp(-Math.abs(lt - (s.d - 1)) * 10) });
    });
    badgeAt(ctx, s, 'אנשים חדשים נחשפים לפתרונות שלנו', 1350, 560, 'שחושפים', GOLD, 34, false);
  },
};
S.c3e = {
  trans: 'zoom',
  events: events([['פונה', 'pop'], ['פרטים'], ['איש', 'impact', 0.6]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    waChat(ctx, s, 1290, 130, 450, 800, 'ALTRIX · מכירות', [
      { side: 'in', t: 'היי, ראיתי את הפרסום שלכם', at: cueT(s, 'פונה') },
      { side: 'in', t: 'אשמח לשמוע פרטים על המערכת', at: cueT(s, 'פרטים') - 0.3 },
    ], { sub: 'ליד חדש' });
    crmCard(ctx, 650, 260, 560, 380, { p: pr(s, 'פרטים', 0.5), rows: [['מקור', 'וואטסאפ', WA], ['סטטוס', 'ממתין לשיחה', GOLD], ['נציג מטפל', 'טרם שובץ', C.dim]], highlight: 1 });
    arrow(ctx, 1270, 450, 1225, 450, pr(s, 'פרטים', 0.4), { color: TEAL, width: 6, head: 20 });
    const ap = pr(s, 'איש', 0.5);
    if (ap > 0) {
      avatar(ctx, 340, 520, 120 * E.outBack(ap), { color: P1, headset: true, ring: 1, talk: 0.6 });
      text(ctx, 'איש המכירות', 340, 700, { size: 44, weight: 900, alpha: ap }); text(ctx, 'נכנס לתמונה', 340, 755, { size: 40, weight: 900, color: GOLD, alpha: ap });
      ring(ctx, 340, 520, 300, ap); arrow(ctx, 500, 450, 640, 450, prog(lt, cueT(s, 'איש') + 0.3, cueT(s, 'איש') + 0.7), { color: GOLD, width: 6, head: 22 });
    }
  },
};
S.c3f = {
  trans: 'whip',
  events: events([['לא'], ['סקרנים'], ['חוששים'], ['חסרי'], ['מכירים']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.6, glow: 1, dots: 0.6 });
    sectionTitle(ctx, s, 'לא כל מי שפונה מוכן לרכישה', 'EVERY LEAD IS DIFFERENT', { y: 175, at: cueT(s, 'לא') });
    rowCards(ctx, s, [{ t: 'סקרנים', sub: 'רוצים להבין במה מדובר', icon: 'search', cue: 'סקרנים', color: '#4f8cff' }, { t: 'חוששים', sub: 'צריכים ביטחון ושקיפות', icon: 'shield', cue: 'חוששים', color: GOLD },
      { t: 'חסרי ניסיון', sub: 'צריכים הסבר מהבסיס', icon: 'cap', cue: 'חסרי', color: TEAL }, { t: 'מכירים את התחום', sub: 'מחפשים פתרון מקצועי', icon: 'star', cue: 'מכירים', color: P2 }], { y: 300, h: 500 });
  },
};
S.c3g = {
  trans: 'zoom', rail: false,
  events: s => [['להבין'], ['המסע', 'riser'], ['חשיפה'], ['פנייה'], ['ליד'], ['שיחת'], ['ניסיון'], ['ליווי'], ['רכישה'], ['ולקוח', 'impact', 0.8]].map(([c, ty, k]) => ({ lt: cueT(s, c), type: ty || 'pop', k })),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.8, glow: 1.2, grid: 0.8 });
    // first: "understand who's in front of us"
    const intro = 1 - prog(lt, cueT(s, 'המסע') - 0.3, cueT(s, 'המסע'));
    if (intro > 0) { ctx.save(); ctx.globalAlpha = intro; avatar(ctx, CX, 420, 110, { color: TEAL, ring: 1 }); icon(ctx, 'search', CX + 120, 330, 80, GOLD); wipeText(ctx, 'להבין מי עומד מולנו', CX, 640, pr(s, 'להבין', 0.5), { size: 80, weight: 900 }); wipeText(ctx, 'ולעזור לו להתקדם נכון', CX, 740, pr(s, 'ולעזור', 0.5), { size: 56, weight: 800, color: TEAL }); ctx.restore(); }
    const fp = pr(s, 'המסע', 1.2); if (fp <= 0) return;
    const keys = [['חשיפה', [0]], ['פנייה', [1]], ['ליד', [1]], ['שיחת', [2, 3]], ['ניסיון', [4, 5]], ['ליווי', [6]], ['רכישה', [7]], ['ולקוח', [8]]];
    let lit = [], done = -1;
    keys.forEach(([c, ks]) => { if (lt >= cueT(s, c) - 0.05) { lit = ks; done = Math.min(...ks) - 1; } });
    const end = cueT(s, 'ולקוח') + 0.6, all = lt > end;
    ctx.save(); ctx.globalAlpha = fp;
    kicker(ctx, s, 'THE ALTRIX CUSTOMER JOURNEY', 1640, 440, cueT(s, 'המסע'));
    funnel(ctx, 900, 150, 915, 1040, 420, { build: fp, lit: all ? [] : lit, litP: 1, done: all ? 8 : done, t: s.t, size: 1.0, dimOthers: 0.65 });
    if (all) popT(ctx, 1640, 560, prog(lt, end, end + 0.4), () => { text(ctx, 'מהחשיפה הראשונה', 1640, 520, { size: 40, weight: 900 }); text(ctx, 'ועד ללקוח משלם', 1640, 580, { size: 40, weight: 900, color: TEAL, glow: 20, glowColor: TEAL }); });
    ctx.restore();
  },
};

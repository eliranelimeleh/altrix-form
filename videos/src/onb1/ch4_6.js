// Chapters 4-6: discovery call (+ simulation 1), product & pricing, the 10-day trial.
'use strict';
// global time of the n-th word containing `needle` in segment `id`
function wordT(id, needle, occ = 0) { const sg = segById(id); let n = 0; for (const w of sg.words) if (w.w.includes(needle) && n++ === occ) return w.t0; return sg.t0; }
function lastWordT(id) { const sg = segById(id); return sg.words[sg.words.length - 1].t1; }

// ---------- dialogue transcript: bubbles revealed word by word ----------
// turns: [{id, who:'rep'|'client'}]
function transcript(ctx, t, turns, box, o = {}) {
  const [x, y, w, h] = box, size = o.size || 30, maxW = w * 0.78;
  const shown = turns.filter(tr => t >= segById(tr.id).words[0].t0 - 0.1);
  const items = shown.map(tr => {
    const full = phraseDisplay(spokenText(tr.id, t, true)), part = phraseDisplay(spokenText(tr.id, t));
    const lines = wrapLines(ctx, full, maxW - 60, size, 600);
    return { tr, lines, part, h: lines.length * size * 1.42 + 74 };
  });
  const total = items.reduce((a, b) => a + b.h + 22, 0), scroll = Math.max(0, total - h);
  ctx.save(); ctx.beginPath(); ctx.rect(x - 30, y, w + 60, h); ctx.clip();
  let cy = y - scroll;
  items.forEach(it => {
    const rep = it.tr.who === 'rep', col = rep ? P1 : TEAL, sg = segById(it.tr.id), p = prog(t, sg.words[0].t0 - 0.1, sg.words[0].t0 + 0.25);
    const lw = Math.min(maxW, Math.max(...it.lines.map(l => measure(ctx, l, size, 600))) + 60), bx = rep ? x + w - lw : x;
    slideIn(ctx, p, rep ? 50 : -50, 20, () => {
      ctx.save(); rrect(ctx, bx, cy, lw, it.h, 24); ctx.fillStyle = rep ? 'rgba(88,40,180,0.55)' : 'rgba(20,90,90,0.45)'; ctx.shadowColor = col; ctx.shadowBlur = speaking(it.tr.id, t) ? 30 : 8; ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
      text(ctx, rep ? `${FX().repName} · נציג ALTRIX` : `${FX().clientName} · לקוח`, bx + lw - 30, cy + 30, { size: 20, weight: 800, align: 'right', color: rep ? C.neon : '#7ff5e1' });
      // spoken part bright, rest faint (karaoke) - draw full lines faint then overlay spoken words
      let said = it.part.split(' ').length, k = 0;
      it.lines.forEach((l, j) => {
        const ws = l.split(' '), ly = cy + 68 + j * size * 1.42;
        const spokenLine = ws.slice(0, Math.max(0, said - k)).join(' '); k += ws.length;
        text(ctx, l, bx + lw - 30, ly, { size, weight: 600, align: 'right', color: 'rgba(255,255,255,0.22)' });
        if (spokenLine) text(ctx, spokenLine, bx + lw - 30, ly, { size, weight: 600, align: 'right', color: '#fff' });
      });
    });
    cy += it.h + 22;
  });
  ctx.restore();
}
function chip(ctx, str, x, y, p, col = GOLD, ic = null) {
  if (p <= 0) return;
  popT(ctx, x, y, p, () => { const w = pill(ctx, str, x, y, { size: 30, color: col, fill: false, glow: 26, weight: 900 }); if (ic) iconDisc(ctx, ic, x + w / 2 + 6, y, 24, col, 1); });
}
// simulation 1: phone call
const SIM1 = [{ id: 'c4s1', who: 'rep' }, { id: 'c4s2', who: 'rep' }, { id: 'c4s3', who: 'client' }, { id: 'c4s4', who: 'rep' }];
function callScene(first) {
  return {
    trans: first ? 'glitch' : 'none', captions: false, rail: true,
    events: s => first ? [{ lt: 0.0, type: 'click' }] : [],
    draw(ctx, s) {
      const t = s.t, t0 = segById('c4s1').t0;
      bg(ctx, s, { rain: 0.35, glow: 0.9 });
      // call card
      glass(ctx, 90, 140, 700, 820, 36, { fill: 'rgba(14,9,30,0.92)', glow: 40 });
      kicker(ctx, { lt: t - t0 }, 'SIMULATION 01 · DISCOVERY CALL', 440, 190, 0);
      text(ctx, 'שיחה פעילה', 440, 240, { size: 30, weight: 800, color: C.up });
      const el = Math.max(0, t - t0), mm = String(Math.floor(el / 60)).padStart(2, '0'), ss = String(Math.floor(el % 60)).padStart(2, '0');
      text(ctx, `${mm}:${ss}`, 440, 285, { size: 30, weight: 700, fam: MONO, color: C.axis });
      const repTalk = SIM1.some(tr => tr.who === 'rep' && speaking(tr.id, t)), cliTalk = SIM1.some(tr => tr.who === 'client' && speaking(tr.id, t));
      avatar(ctx, 440, 430, 92, { color: P1, headset: true, talk: repTalk, ring: repTalk, label: FX().repName, sub: 'נציג ALTRIX' });
      if (repTalk) waveform(ctx, 300, 600, 280, 40, 1, C.neon, 1);
      avatar(ctx, 440, 730, 80, { color: '#0f766e', talk: cliTalk, ring: cliTalk, label: FX().clientName, sub: 'ליד חדש · וואטסאפ' });
      if (cliTalk) waveform(ctx, 300, 880, 280, 40, 1, TEAL, 3);
      // controls
      // transcript
      transcript(ctx, t, SIM1, [860, 150, 960, 640], { size: 30 });
      // skills chips
      const cp = (id, nd, occ = 0) => prog(t, wordT(id, nd, occ), wordT(id, nd, occ) + 0.4);
      chip(ctx, 'התאמה', 1700, 880, cp('c4s2', 'מחפש'), GOLD, 'target');
      chip(ctx, 'הקשבה', 1440, 880, cp('c4s3', 'ראיתי'), TEAL, 'chat');
      chip(ctx, 'שירות', 1180, 880, cp('c4s4', 'עוזרים'), P2, 'heart');
      chip(ctx, 'אמינות', 930, 880, cp('c4s4', 'הסיכונים'), C.up, 'shield');
    },
  };
}

// ---------------- chapter 4 ----------------
S.c4_card = chapterCard(4);
S.c4a = {
  trans: 'whip',
  events: events([['הליד'], ['יוצר', 'click']]),
  draw(ctx, s) {
    const { lt } = s, ct = cueT(s, 'יוצר');
    bg(ctx, s, { rain: 0.5, glow: 1 });
    crmCard(ctx, 1080, 220, 700, 540, { p: prog(lt, 0.1, 0.6), rows: [['מקור', 'וואטסאפ', WA], ['הודעה', 'רוצה להבין מה זאת המערכת', '#fff'], ['סטטוס', lt > ct ? 'בשיחה' : 'ליד חדש', lt > ct ? C.up : GOLD], ['נציג מטפל', FX().repName, C.neon]], highlight: lt > ct ? 1 : 0, status: lt > ct ? 'בטיפול' : 'ליד חדש' });
    button(ctx, 'התקשר ללקוח', 1430, 830, 360, 84, { p: prog(lt, ct - 1, ct - 0.6), color: C.up, iconName: 'call', size: 32, pressed: Math.exp(-Math.abs(lt - ct) * 10) });
    if (lt > ct - 0.6 && lt < ct + 0.6) cursor(ctx, ...kf(lt, [[ct - 0.6, 1700, 1000], [ct - 0.05, 1450, 845]]), Math.exp(-Math.abs(lt - ct) * 12), 1.1);
    // ringing phone on the left
    const rp = prog(lt, ct, ct + 0.4);
    if (rp > 0) {
      const sh = Math.sin(lt * 40) * 6 * (0.5 + 0.5 * Math.sin(lt * 3));
      for (let k = 0; k < 3; k++) { const f = (lt * 0.9 + k / 3) % 1; ctx.save(); ctx.globalAlpha = rp * (1 - f) * 0.6; ctx.strokeStyle = C.up; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(520, 480, 120 + f * 260, 0, 7); ctx.stroke(); ctx.restore(); }
      iconDisc(ctx, 'call', 520 + sh, 480, 110, C.up, rp, { fill: 'rgba(10,60,40,0.95)' });
      text(ctx, 'מתקשר ל' + FX().clientName + '…', 520, 680, { size: 44, weight: 900, alpha: rp });
    } else {
      waChat(ctx, s, 300, 170, 440, 760, FX().clientName, [{ side: 'in', t: 'היי, אשמח להבין מה זאת המערכת', at: 0.3 }], { sub: 'ליד חדש' });
    }
  },
};
S.c4b = {
  trans: 'zoom',
  events: events([['עיקרון', 'impact', 0.8], ['לדחוף'], ['לעזור']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.9, glow: 1.2, grid: 0.6 });
    cam(ctx, s, () => {
      statement(ctx, s, 'שירות לפני מכירה', { y: 340, at: cueT(s, 'עיקרון'), size: 120, en: 'SERVICE BEFORE SALES' });
      const a = pr(s, 'לדחוף', 0.45), b = pr(s, 'לעזור', 0.45);
      slideIn(ctx, a, 60, 0, () => { glass(ctx, 1000, 560, 760, 170, 28, { border: C.down, glowColor: C.down }); cross(ctx, 1690, 645, 34, 1, C.down); text(ctx, 'לפתוח שיחה כדי לדחוף מכירה', 1630, 647, { size: 40, weight: 800, align: 'right' });
        const sp = prog(s.lt, cueT(s, 'לדחוף') + 0.3, cueT(s, 'לדחוף') + 0.8), tw = measure(ctx, 'לפתוח שיחה כדי לדחוף מכירה', 40, 800); ctx.save(); ctx.strokeStyle = C.down; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1630, 647); ctx.lineTo(1630 - tw * sp, 647); ctx.stroke(); ctx.restore(); });
      slideIn(ctx, b, -60, 0, () => { glass(ctx, 160, 560, 780, 170, 28, { border: C.up, glowColor: C.up }); check(ctx, 870, 645, 34, 1, C.up); text(ctx, 'רצון אמיתי לעזור ללקוח', 810, 625, { size: 40, weight: 800, align: 'right' }); text(ctx, 'להכיר את הפתרון', 810, 680, { size: 32, weight: 700, align: 'right', color: C.up }); });
    }, { k: 0.03 });
  },
};
S.c4c = {
  trans: 'whip',
  events: events([['למגננה'], ['מלחץ'], ['מהתחייבות'], ['משכנוע']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 0.9, hue: -20 });
    const ap = prog(lt, 0.1, 0.6);
    avatar(ctx, 500, 500, 130 * E.outBack(ap) + 0.001, { color: '#64748b' });
    const shp = pr(s, 'למגננה', 0.5);
    if (shp > 0) { ctx.save(); ctx.globalAlpha = shp * 0.9; icon(ctx, 'shield', 500 + 190, 500, 260 * E.outBack(shp), GOLD, { glow: 30 }); ctx.restore(); text(ctx, 'מגננה', 500, 720, { size: 56, weight: 900, color: GOLD, alpha: shp }); }
    text(ctx, 'כשמתקשר איש מכירות…', 500, 250, { size: 36, weight: 700, color: C.dim, alpha: ap });
    [['לחץ', 'מלחץ', 'bolt'], ['התחייבות כספית', 'מהתחייבות', 'coin'], ['שכנוע לקנות משהו לא מובן', 'משכנוע', 'question']].forEach(([t, c, ic], k) => {
      const p = pr(s, c, 0.45), y = 330 + k * 190, x = 1350 + (k % 2) * 80; if (p <= 0) return;
      slideIn(ctx, p, 60, 0, () => {
        ctx.save(); rrect(ctx, x - 420, y - 70, 840, 140, 70); ctx.fillStyle = 'rgba(30,18,50,0.9)'; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,201,77,0.6)'; ctx.stroke(); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.arc(x - 450, y + 50, 16, 0, 7); ctx.arc(x - 490, y + 80, 9, 0, 7); ctx.fillStyle = 'rgba(30,18,50,0.9)'; ctx.fill(); ctx.restore();
        iconDisc(ctx, ic, x + 340, y, 44, GOLD, 1); fitText(ctx, 'חשש מ' + t, x + 270, y + 2, 640, { size: 42, weight: 800, align: 'right' });
      });
    });
  },
};
S.c4d = {
  trans: 'none',
  events: events([['בדקות'], ['נינוחה'], ['אמינה'], ['ומקצועית']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.6, glow: 1.1 });
    iconDisc(ctx, 'clock', 1640, 230, 50, P2, pr(s, 'בדקות', 0.4)); wipeText(ctx, 'כבר בדקות הראשונות', 1560, 230, pr(s, 'בדקות', 0.5), { size: 54, weight: 900, align: 'right' });
    // trust meter: right (חשש) -> left (אמון)
    const x0 = 1600, x1 = 320, y = 470, v = E.inOut(prog(lt, cueT(s, 'נינוחה') - 0.3, cueT(s, 'ומקצועית') + 0.8));
    ctx.save(); const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, GOLD); g.addColorStop(1, C.up); rrect(ctx, x1, y - 16, x0 - x1, 32, 16); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
    rrect(ctx, x0 - (x0 - x1) * Math.max(0.04, v), y - 16, (x0 - x1) * Math.max(0.04, v), 32, 16); ctx.fillStyle = g; ctx.shadowColor = C.up; ctx.shadowBlur = 25; ctx.fill(); ctx.restore();
    text(ctx, 'חשש', x0, y + 70, { size: 38, weight: 900, color: GOLD }); text(ctx, 'אמון', x1, y + 70, { size: 38, weight: 900, color: C.up });
    const kx = x0 - (x0 - x1) * Math.max(0.04, v); ctx.save(); ctx.beginPath(); ctx.arc(kx, y, 28, 0, 7); ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 25; ctx.fill(); ctx.restore();
    [['נינוחה', P1], ['אמינה', TEAL], ['ומקצועית', C.up]].forEach(([t, col], k) => { const x = 1400 - k * 480; popT(ctx, x, 720, pr(s, t, 0.4), () => pill(ctx, 'אווירה ' + t.replace(/^ו/, ''), x, 720, { size: 46, color: col, weight: 900, fill: false, glow: 36 })); });
  },
};
S.c4e = {
  trans: 'glitch', captions: false,
  events: events([[0.05, 'riser'], ['בפועל', 'impact', 0.5]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 1.4, glow: 1.3, grid: 1 });
    cam(ctx, s, () => {
      kicker(ctx, s, 'ROLE PLAY', CX, 300, 0.05, GOLD);
      popT(ctx, CX, 430, prog(lt, 0.1, 0.5), () => text(ctx, 'SIMULATION 01', CX, 430, { size: 130, weight: 900, fam: MONO, glow: 50, glowColor: P1, spacing: 6 }));
      wipeText(ctx, 'שיחת היכרות ראשונה עם ליד', CX, 580, prog(lt, 0.45, 0.9), { size: 64, weight: 900, color: C.neon });
      const sh = Math.sin(lt * 40) * 5; iconDisc(ctx, 'call', CX + sh, 760, 70, C.up, prog(lt, 0.6, 1));
      for (let k = 0; k < 3; k++) { const f = (lt * 1.2 + k / 3) % 1; ctx.save(); ctx.globalAlpha = prog(lt, 0.6, 1) * (1 - f) * 0.6; ctx.strokeStyle = C.up; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CX, 760, 80 + f * 160, 0, 7); ctx.stroke(); ctx.restore(); }
    }, { k: 0.06 });
  },
};
S.c4s1 = callScene(true); S.c4s2 = callScene(false); S.c4s3 = callScene(false); S.c4s4 = callScene(false);
function didScene(phase) { // c4f: what the rep did NOT do; c4g: what the rep DID
  return {
    trans: phase ? 'none' : 'zoom',
    events: phase ? events([['הקשיב'], ['ביטחון'], ['כהיכרות'], ['שקיפות']]) : events([['לחץ'], ['הבטיח'], ['משא']]),
    draw(ctx, s) {
      bg(ctx, s, { rain: 0.5, glow: 1 });
      sectionTitle(ctx, s, 'שימו לב לשיחה', 'DEBRIEF', { y: 175, at: phase ? -5 : 0 });
      const pre = phase ? -5 : null;
      contrast(ctx, s,
        { h: 'מה הנציג לא עשה', good: false, cue: pre ?? 'לחץ', items: [{ t: 'לא לחץ על הלקוח לקנות', cue: pre ?? 'לחץ' }, { t: 'לא הבטיח רווחים', cue: pre ?? 'הבטיח' }, { t: 'לא ניהל משא ומתן', cue: pre ?? 'משא' }] },
        { h: 'מה הנציג כן עשה', good: true, cue: phase ? 'הקשיב' : 999, items: [{ t: 'הקשיב', cue: 'הקשיב' }, { t: 'נתן תחושת ביטחון', cue: 'ביטחון' }, { t: 'הציג את השיחה כהיכרות ושירות', cue: 'כהיכרות' }, { t: 'שקיפות לגבי רכישה בהמשך', cue: 'שקיפות' }].map(x => phase ? x : { ...x, cue: 999 }) },
        { y: 260, h: 610 });
    },
  };
}
S.c4f = didScene(0); S.c4g = didScene(1);
S.c4h = {
  trans: 'whip',
  events: events([['מברר', 'pop'], ['אישי'], ['נוסטרו'], ['ניסיון'], ['הסיכונים'], ['פתרון']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.4, glow: 1 });
    windowFrame(ctx, 520, 150, 1300, 790, 'ALTRIX CRM · שאלות התאמה · ' + FX().clientName);
    const qs = [['מעוניין בחשבון אישי?', 'אישי', 'wallet'], ['או במבחן נוסטרו?', 'נוסטרו', 'trophy'], ['יש לו ניסיון במסחר?', 'ניסיון', 'cap'], ['מכיר את הסיכונים?', 'הסיכונים', 'shield'], ['איזה פתרון מתאים לצרכים שלו?', 'פתרון', 'target']];
    qs.forEach(([q, c, ic], k) => {
      const y = 280 + k * 128, p = pr(s, c, 0.45); if (p <= 0) return;
      slideIn(ctx, p, 50, 0, () => {
        ctx.save(); rrect(ctx, 580, y - 52, 1180, 104, 18); ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill(); ctx.restore();
        iconDisc(ctx, ic, 1700, y, 36, P1, 1); text(ctx, q, 1640, y + 2, { size: 40, weight: 800, align: 'right' });
        const cp = prog(lt, cueT(s, c) + 0.5, cueT(s, c) + 0.9);
        ctx.save(); rrect(ctx, 610, y - 26, 52, 52, 10); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(220,200,255,0.6)'; ctx.stroke(); ctx.restore(); if (cp > 0) icon(ctx, 'check', 636, y, 46 * E.outBack(cp), C.up);
      });
    });
    // client avatar + "understand first"
    avatar(ctx, 270, 430, 110, { color: '#0f766e', ring: 1, label: FX().clientName, sub: 'פרופיל לקוח' });
    iconDisc(ctx, 'search', 380, 330, 40, GOLD, pr(s, 'מברר', 0.4));
    const filled = qs.filter(([, c]) => lt > cueT(s, c) + 0.6).length;
    progressBar(ctx, 120, 720, 300, 16, filled / qs.length, { color: TEAL, color2: C.up });
    text(ctx, `${filled}/${qs.length}`, 270, 770, { size: 30, weight: 800, fam: MONO, color: TEAL });
  },
};
S.c4i = {
  trans: 'none',
  events: events([['רק', 'impact', 0.4], ['להציג']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    glass(ctx, 1290, 250, 520, 500, 30, { border: TEAL, glowColor: TEAL });
    avatar(ctx, 1550, 400, 90, { color: '#0f766e', ring: 1 });
    text(ctx, 'מבינים את הלקוח', 1550, 560, { size: 42, weight: 900 }); check(ctx, 1550, 650, 34, pr(s, 'רק', 0.4), C.up);
    arrow(ctx, 1260, 500, 1100, 500, pr(s, 'להציג', 0.5, -0.4), { color: GOLD, width: 8, head: 30 });
    [0, 1, 2].forEach(k => productCard(ctx, 740 - k * 320, 300 + 0, 290, 340, k, { p: pr(s, 'להציג', 0.45, -0.2 + k * 0.12), compact: true, hot: k === 0 ? 1 : 0 }));
    badgeAt(ctx, s, 'מציגים רק את האפשרויות הרלוונטיות', 590, 760, 'הרלוונטיות', GOLD, 34, false);
  },
};

// ---------------- chapter 5 ----------------
S.c5_card = chapterCard(5);
S.c5a = {
  trans: 'glitch',
  events: events([['מסבירים'], ['מחברים'], ['מבצעת'], ['ההבדל'], ['עוקבים'], ['התעסקות'], ['הסיכונים']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.5, glow: 1, dots: 0.6 });
    sectionTitle(ctx, s, 'איך המערכת פועלת בפועל', 'EXPLAIN THE SYSTEM', { y: 165, at: cueT(s, 'מסבירים') - 0.3 });
    const it = [{ t: 'חיבור לחשבון מסחר', icon: 'link', cue: 'מחברים', color: TEAL, num: 1 }, { t: 'ביצוע העסקאות', icon: 'robot', cue: 'מבצעת', color: P1, num: 2 }, { t: 'פרטי מול נוסטרו', icon: 'scale', cue: 'ההבדל', color: GOLD, num: 3 },
      { t: 'מעקב עסקאות ורווח/הפסד', icon: 'chart', cue: 'עוקבים', color: '#4f8cff', num: 4 }, { t: 'כמה התעסקות נדרשת', icon: 'clock', cue: 'התעסקות', color: P2, num: 5 }, { t: 'הסיכונים', icon: 'shield', cue: 'הסיכונים', color: C.down, num: 6 }];
    rowCards(ctx, s, it.slice(0, 3), { y: 250, h: 330, r: 52, size: 38 });
    rowCards(ctx, s, it.slice(3), { y: 605, h: 330, r: 52, size: 38 });
  },
};
S.c5c = {
  trans: 'whip',
  events: events([['השקיפות', 'impact', 0.4], ['מציגים'], ['ללחוץ'], ['מראש'], ['יחליט']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1, grid: 0.5 });
    statement(ctx, s, 'שקיפות', { y: 210, at: cueT(s, 'השקיפות'), size: 96, en: 'TRANSPARENCY', glowColor: TEAL });
    const nodes = [['שיחת היכרות', 'המחירים מוצגים כבר כאן', 'call', 'מציגים', GOLD], ['10 ימי ניסיון', 'הלקוח מתנסה', 'clock', 'מראש', P1], ['החלטה', 'אם להמשיך', 'flag', 'יחליט', TEAL]];
    const xs = [1500, 960, 420], y = 500;
    ctx.save(); ctx.strokeStyle = 'rgba(220,200,255,0.25)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1500, y); ctx.lineTo(420, y); ctx.stroke(); ctx.restore();
    nodes.forEach(([h, sub, ic, c, col], k) => { const p = pr(s, c, 0.45); iconDisc(ctx, ic, xs[k], y, 64, col, p); slideIn(ctx, p, 0, 30, () => { text(ctx, h, xs[k], y + 110, { size: 40, weight: 900 }); text(ctx, sub, xs[k], y + 158, { size: 28, weight: 700, color: col }); }); });
    popT(ctx, 1500, 380, pr(s, 'מציגים', 0.4), () => pill(ctx, '₪ מסלולי רכישה', 1500, 380, { size: 28, color: GOLD, weight: 900 }));
    const a = pr(s, 'ללחוץ', 0.4), b = pr(s, 'מראש', 0.4);
    slideIn(ctx, a, 40, 0, () => { cross(ctx, 1720, 820, 28, 1, C.down); text(ctx, 'לא כדי ללחוץ לרכישה מיידית', 1670, 822, { size: 36, weight: 800, align: 'right' }); });
    slideIn(ctx, b, -40, 0, () => { check(ctx, 860, 820, 28, 1, C.up); text(ctx, 'כדי שהלקוח ידע מראש את העלויות', 810, 822, { size: 36, weight: 800, align: 'right' }); });
  },
};
// price card. plan: facts.plans[k]
function priceCard(ctx, s, k, x, y, w, h, o = {}) {
  const pl = FX().plans[k], gold = k === 1, col = gold ? GOLD : P2, { p = 1, count = 1, feats = [], hot = 0 } = o; if (p <= 0) return;
  slideIn(ctx, p, o.dx ?? 0, o.dy ?? 60, () => {
    glass(ctx, x, y, w, h, 34, { border: col, glowColor: col, glow: 40 + hot * 30, fill: 'rgba(14,9,30,0.94)' });
    ctx.save(); rrect(ctx, x, y, w, h, 34); ctx.clip(); const g = ctx.createLinearGradient(0, y, 0, y + 260); g.addColorStop(0, gold ? 'rgba(255,201,77,0.22)' : 'rgba(168,85,247,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, 260); ctx.restore();
    if (gold) popT(ctx, x + w / 2, y, 1, () => pill(ctx, 'LIFETIME LICENSE', x + w / 2, y, { size: 22, color: GOLD, fg: '#1a0f00', fam: MONO, weight: 900 }));
    fitText(ctx, pl.name, x + w / 2, y + 80, w - 120, { size: 44, weight: 900, spacing: 2 });
    pill(ctx, pl.kind, x + w / 2, y + 145, { size: 28, color: col, fill: false, glow: 16 });
    const num = Math.round(+pl.price.replace(',', '') * E.outCubic(clamp(count)));
    text(ctx, fmt(num), x + w / 2, y + 265, { size: 116, weight: 900, fam: MONO, glow: 40, glowColor: col });
    text(ctx, pl.per, x + w / 2, y + 345, { size: 30, weight: 800, color: col });
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + 50, y + 395, w - 100, 2);
    let fy = y + 450;
    [pl.desc, ...feats].forEach((f, j) => { const fp = j === 0 ? 1 : clamp(f.p ?? 1); const str = j === 0 ? f : f.t; if (fp <= 0) return;
      ctx.save(); ctx.globalAlpha *= fp; check(ctx, x + w - 60, fy, 16, 1, C.up); const hh = para(ctx, str, x + w - 92, fy + 2, w - 150, { size: 26, weight: 700 }); ctx.restore(); fy += Math.max(50, hh + 16); });
    text(ctx, pl.note, x + w / 2, y + h - 40, { size: 22, weight: 600, color: C.dim });
  });
}
S.c5d = {
  trans: 'zoom',
  events: events([['הראשון'], ['בתשעת', 'impact', 0.5]]),
  draw(ctx, s) {
    const { lt } = s, ct = cueT(s, 'בתשעת');
    bg(ctx, s, { rain: 0.6, glow: 1.2, grid: 0.7 });
    kicker(ctx, s, 'PLAN 01', CX, 130, 0.1, P2);
    priceCard(ctx, s, 0, 640, 165, 640, 780, { p: pr(s, 'הראשון', 0.6, -0.3), count: prog(lt, ct - 0.2, ct + 1.2) });
    burst(ctx, CX, 430, prog(lt, ct + 0.9, ct + 1.8), P2, 30, 3, 420);
  },
};
S.c5e = {
  trans: 'none',
  events: events([['השני'], ['ארבעה', 'impact', 0.5], ['מגוון'], ['ועדכונים']]),
  draw(ctx, s) {
    const { lt } = s, ct = cueT(s, 'ארבעה'), mv = E.inOut(prog(lt, 0.1, 0.9));
    bg(ctx, s, { rain: 0.6, glow: 1.2, grid: 0.7 });
    priceCard(ctx, s, 0, lerp(640, 1060, mv), 165, 640, 780, { p: 1, count: 1 });
    priceCard(ctx, s, 1, 220, 165, 640, 780, { p: pr(s, 'השני', 0.6, -0.2), dx: -80, dy: 0, count: prog(lt, ct - 0.2, ct + 1.4), hot: 1, feats: [{ t: 'עדכונים ושדרוגים ללא עלות נוספת', p: pr(s, 'ועדכונים', 0.4) }] });
    burst(ctx, 540, 430, prog(lt, ct + 1.1, ct + 2), GOLD, 30, 5, 420);
  },
};
S.c5f = {
  trans: 'whip',
  events: events([['מלחיץ'], ['בבהירות'], ['ההבדלים'], ['הערך']]),
  draw(ctx, s) {
    const { lt } = s, pl = FX().plans;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    sectionTitle(ctx, s, 'מציגים בבהירות, בלי לחץ', 'CLEAR & CALM', { y: 165 });
    badgeAt(ctx, s, 'הצגת מחיר ≠ אירוע מלחיץ', 1580, 165, 'מלחיץ', TEAL, 26, false);
    const tp = pr(s, 'בבהירות', 0.6);
    slideIn(ctx, tp, 0, 50, () => {
      glass(ctx, 160, 250, 1600, 650, 30, { glow: 30 });
      const cx = [1500, 1020, 470], hy = 320;
      text(ctx, '', cx[0], hy, {});
      [[pl[0].name, P2], [pl[1].name, GOLD]].forEach(([n, col], k) => { const x = cx[k + 1]; ctx.save(); rrect(ctx, x - 250, hy - 40, 500, 80, 18); ctx.fillStyle = k ? 'rgba(255,201,77,0.16)' : 'rgba(168,85,247,0.2)'; ctx.fill(); ctx.restore(); text(ctx, n, x, hy + 2, { size: 32, weight: 900, color: col, spacing: 1 }); });
      const rows = [['משך', 'שנה', 'לכל החיים'], ['תשלום', `${pl[0].price} ₪ לשנה`, `${pl[1].price} ₪ חד־פעמי`], ['תכולה', 'לפי תכולת המסלול', 'מגוון הרובוטים של ALTRIX'], ['עדכונים ושדרוגים', 'בהתאם לתכולת המסלול', 'ללא עלות נוספת'], ['תנאים', 'בהתאם לתנאי הרישיון', 'בהתאם לתנאי הרישיון']];
      rows.forEach(([k, a, b], j) => {
        const rp = prog(lt, cueT(s, 'ההבדלים') - 0.6 + j * 0.35, cueT(s, 'ההבדלים') - 0.2 + j * 0.35), y = 420 + j * 95; if (rp <= 0) return;
        ctx.save(); ctx.globalAlpha *= rp; ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(200, y - 47, 1520, 1.5);
        text(ctx, k, 1680, y, { size: 32, weight: 800, align: 'right', color: C.axis });
        fitText(ctx, a, cx[1], y, 470, { size: 32, weight: 800, fam: /\d/.test(a) ? FONT : FONT }); fitText(ctx, b, cx[2], y, 520, { size: 32, weight: 800, color: '#fff' });
        ctx.restore();
      });
      const hv = pr(s, 'הערך', 0.5); if (hv > 0) { ctx.save(); ctx.globalAlpha = hv * (0.5 + 0.5 * Math.sin(lt * 4)); ctx.lineWidth = 4; ctx.strokeStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 25; rrect(ctx, 190, 275, 1540, 600, 26); ctx.stroke(); ctx.restore(); }
    });
  },
};
S.c5g = {
  trans: 'zoom',
  events: events([['ודאו'], ['שהמחיר'], ['התשלום'], ['הרישיון'], ['העדכניים', 'impact', 0.5]]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    // document with stamp
    slideIn(ctx, prog(lt, 0.1, 0.6), -60, 0, () => {
      ctx.save(); ctx.translate(480, 540); ctx.rotate(-0.04); glass(ctx, -260, -330, 520, 660, 20, { fill: 'rgba(240,236,255,0.96)', border: '#fff', glow: 40 });
      text(ctx, 'מחירון ותנאים', 200, -265, { size: 38, weight: 900, color: '#1b0d3a', align: 'right' });
      for (let k = 0; k < 7; k++) { ctx.fillStyle = 'rgba(27,13,58,0.18)'; ctx.fillRect(-200, -190 + k * 52, 400 - (k % 3) * 70, 14); }
      const sp = pr(s, 'העדכניים', 0.4);
      if (sp > 0) { ctx.save(); ctx.globalAlpha = sp; const k = lerp(1.6, 1, E.outBack(sp)); ctx.translate(40, 200); ctx.rotate(-0.25); ctx.scale(k, k); ctx.lineWidth = 7; ctx.strokeStyle = C.up; rrect(ctx, -170, -55, 340, 110, 16); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.translate(40, 200); ctx.rotate(-0.25); text(ctx, 'מאושר ועדכני', 0, 2, { size: 46, weight: 900, color: C.up, alpha: sp }); ctx.restore(); }
      ctx.restore();
    });
    wipeText(ctx, 'לפני כל הצגה, ודאו:', 1760, 260, pr(s, 'ודאו', 0.4), { size: 54, weight: 900, align: 'right', color: GOLD });
    listRows(ctx, s, [{ t: 'המחיר', kind: 'coin', cue: 'שהמחיר', color: GOLD }, { t: 'אופן התשלום', kind: 'wallet', cue: 'התשלום', color: TEAL }, { t: 'תנאי הרישיון', kind: 'doc', cue: 'הרישיון', color: P2 }, { t: 'עדכניים ומאושרים בחברה', kind: 'check', cue: 'העדכניים' }],
      { x: 1720, y: 400, dy: 125, size: 46, r: 40 });
  },
};

// ---------------- chapter 6 ----------------
S.c6_card = chapterCard(6);
S.c6a = {
  trans: 'glitch',
  events: events([['היתרונות'], ['עשרה', 'impact', 0.8]]),
  draw(ctx, s) {
    const { lt } = s, ct = cueT(s, 'עשרה');
    bg(ctx, s, { rain: 1, glow: 1.3, grid: 0.8 });
    kicker(ctx, s, 'OUR CONVERSION ENGINE', CX, 180, cueT(s, 'היתרונות'));
    wipeText(ctx, 'אחד היתרונות הגדולים שלנו', CX, 250, pr(s, 'היתרונות', 0.5), { size: 50, weight: 900, color: C.dim });
    // ring of 10 day-segments
    const cx = CX, cy = 560, R0 = 230, on = prog(lt, ct - 0.2, ct + 1.6);
    for (let k = 0; k < 10; k++) { const a0 = -Math.PI / 2 - k * Math.PI * 2 / 10 - 0.05, a1 = a0 - Math.PI * 2 / 10 + 0.1, lit = on * 10 > k;
      ctx.save(); ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.strokeStyle = lit ? (k > 6 ? GOLD : P2) : 'rgba(168,85,247,0.15)'; if (lit) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 25; }
      ctx.beginPath(); ctx.arc(cx, cy, R0, a1, a0); ctx.stroke(); ctx.restore(); }
    popT(ctx, cx, cy - 20, prog(lt, ct - 0.1, ct + 0.3), () => text(ctx, '10', cx, cy - 20, { size: 220, weight: 900, fam: MONO, glow: 50, glowColor: P1 }));
    text(ctx, 'ימי ניסיון', cx, cy + 120, { size: 52, weight: 900, color: C.neon, alpha: prog(lt, ct, ct + 0.4) });
    badgeAt(ctx, s, 'לפני החלטת רכישה', cx, 880, 'לפני', TEAL, 34, false);
  },
};
S.c6b = {
  trans: 'whip',
  events: events([['לראות'], ['להבין'], ['ולהתרשם']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.5, glow: 1, dots: 0.6 });
    sectionTitle(ctx, s, 'למה זה כל כך חשוב?', 'WHY IT MATTERS', { y: 175 });
    rowCards(ctx, s, [{ t: 'לראות', sub: 'את המערכת בפעולה', icon: 'eye', cue: 'לראות', color: TEAL }, { t: 'להבין', sub: 'איך היא עובדת', icon: 'bulb', cue: 'להבין', color: GOLD }, { t: 'להתרשם', sub: 'מהפעילות בפועל', icon: 'star', cue: 'ולהתרשם', color: P2 }], { y: 300, h: 520, r: 80, size: 60, subSize: 32 });
  },
};
S.c6c = {
  trans: 'none',
  events: events([['שעה'], ['אבל', 'impact', 0.4]]),
  draw(ctx, s) {
    const { lt } = s, tip = E.outBack(pr(s, 'אבל', 0.8)) * 0.16;
    bg(ctx, s, { rain: 0.5, glow: 1 });
    const cx = CX, cy = 380;
    ctx.save(); ctx.strokeStyle = C.neon; ctx.lineWidth = 8; ctx.shadowColor = P1; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, 860); ctx.moveTo(cx - 160, 870); ctx.lineTo(cx + 160, 870); ctx.stroke();
    ctx.translate(cx, cy); ctx.rotate(-tip); ctx.beginPath(); ctx.moveTo(-560, 0); ctx.lineTo(560, 0); ctx.stroke(); ctx.restore();
    const pan = (side, str, sub, ic, col, p) => {
      const ax = cx + side * 560 * Math.cos(tip), ay = cy - side * 560 * Math.sin(-tip) * -1 + (side > 0 ? -1 : 1) * 0 , yy = cy + side * Math.sin(tip) * 560 * -1;
      const py = cy + (side > 0 ? -560 * Math.sin(tip) : 560 * Math.sin(tip));
      ctx.save(); ctx.strokeStyle = 'rgba(220,200,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, py); ctx.lineTo(ax - 150, py + 200); ctx.moveTo(ax, py); ctx.lineTo(ax + 150, py + 200); ctx.stroke(); ctx.restore();
      if (p <= 0) return; slideIn(ctx, p, 0, -40, () => { glass(ctx, ax - 230, py + 200, 460, 230, 30, { border: col, glowColor: col }); iconDisc(ctx, ic, ax, py + 270, 46, col, 1); text(ctx, str, ax, py + 360, { size: 38, weight: 900 }); text(ctx, sub, ax, py + 405, { size: 26, weight: 700, color: C.dim }); });
    };
    pan(1, 'שעה של הסברים', 'מילים', 'chat', '#9a8fc4', pr(s, 'שעה', 0.5));
    pan(-1, 'חוויית שימוש אמיתית', 'ערך אחר לגמרי', 'monitor', GOLD, pr(s, 'לחוויית', 0.5));
  },
};
S.c6d = {
  trans: 'zoom',
  events: events([['למכור'], ['יסכים', 'impact', 0.5], ['כולל'], ['העלויות'], ['הסיכונים']]),
  draw(ctx, s) {
    const { lt } = s;
    bg(ctx, s, { rain: 0.5, glow: 1, grid: 0.5 });
    sectionTitle(ctx, s, 'המטרה של שיחת ההיכרות', 'THE REAL GOAL', { y: 165 });
    // target
    const tp = pr(s, 'יסכים', 0.6);
    [[230, 'rgba(242,54,69,0.5)'], [170, 'rgba(255,255,255,0.15)'], [110, 'rgba(242,54,69,0.5)'], [50, GOLD]].forEach(([r, c]) => { ctx.save(); ctx.beginPath(); ctx.arc(420, 560, r, 0, 7); ctx.lineWidth = 16; ctx.strokeStyle = c; ctx.globalAlpha = 0.4 + 0.6 * tp; ctx.stroke(); ctx.restore(); });
    if (tp > 0) { const e = E.outExpo(tp); arrow(ctx, 900 - 450 * e + 0, 360 + 200 * e - 0, 900 - 450 * e - 30, 380 + 180 * e, 1, { color: GOLD, width: 9, head: 34 }); ring(ctx, 420, 560, 300, tp); }
    const rows = [{ t: 'למכור רישיון באותו רגע', kind: 'cross', cue: 'למכור', strike: true }, { t: 'הסכמה ל־10 ימי ניסיון', kind: 'check', cue: 'יסכים', color: GOLD }];
    listRows(ctx, s, rows, { x: 1740, y: 320, dy: 130, size: 48, r: 36 });
    text(ctx, 'כשהלקוח מבין:', 1700, 600, { size: 34, weight: 800, align: 'right', color: C.dim, alpha: pr(s, 'כולל', 0.4) });
    listRows(ctx, s, [{ t: 'מה הניסיון כולל', kind: 'doc', cue: 'כולל', color: TEAL }, { t: 'מהן העלויות, אם יש', kind: 'coin', cue: 'העלויות', color: GOLD }, { t: 'מהם הסיכונים', kind: 'shield', cue: 'הסיכונים', color: C.down }], { x: 1700, y: 680, dy: 92, size: 38, r: 28 });
  },
};
S.c6e = {
  trans: 'glitch', risk: true,
  events: events([['אינו', 'impact', 0.6], ['אמיתי'], ['להפסד']]),
  draw(ctx, s) {
    bg(ctx, s, { rain: 0.4, glow: 0.9, hue: 40 });
    cam(ctx, s, () => {
      warnIcon(ctx, CX, 230, 74, pr(s, 'אינו', 0.4));
      popT(ctx, CX, 380, pr(s, 'אינו', 0.4), () => text(ctx, 'ניסיון ≠ ללא סיכון', CX, 380, { size: 100, weight: 900, color: GOLD, glow: 40, glowColor: '#ff9800' }));
      wipeText(ctx, 'הניסיון אינו מבטל את סיכוני המסחר', CX, 500, pr(s, 'מבטל', 0.5), { size: 46, weight: 800 });
      const a = pr(s, 'אמיתי', 0.5), b = pr(s, 'להפסד', 0.5);
      slideIn(ctx, a, 60, 0, () => { glass(ctx, 1000, 620, 720, 200, 28, { border: GOLD, glowColor: GOLD }); iconDisc(ctx, 'coin', 1630, 720, 50, GOLD, 1); text(ctx, 'חשבון עם כסף אמיתי', 1550, 722, { size: 44, weight: 900, align: 'right' }); });
      arrow(ctx, 980, 720, 900, 720, b, { color: C.down, width: 8, head: 28 });
      slideIn(ctx, b, -60, 0, () => { glass(ctx, 200, 620, 680, 200, 28, { border: C.down, glowColor: C.down }); iconDisc(ctx, 'chart', 800, 720, 50, C.down, 1); text(ctx, 'קיימת אפשרות להפסד', 720, 722, { size: 44, weight: 900, align: 'right' }); });
    }, { k: 0.03 });
  },
};
S.c6f = {
  trans: 'zoom',
  events: s => { const e = s.seg.words[s.seg.words.length - 1].t1 - s.seg.t0; return [{ lt: s.cue('ומחליט'), type: 'click' }, { lt: s.cue('ומחליט') + 0.3, type: 'pop' }, { lt: s.cue('התקנת'), type: 'pop' }, { lt: e - 0.6, type: 'riser' }, { lt: e + 0.2, type: 'impact', k: 1 }]; },
  draw(ctx, s) {
    const { lt } = s, ct = cueT(s, 'ומחליט'), end = s.seg.words[s.seg.words.length - 1].t1 - s.seg.t0, fin = prog(lt, end + 0.1, end + 0.6);
    bg(ctx, s, { rain: lerp(0.6, 2, fin), glow: lerp(1, 1.5, fin), grid: 1 });
    ctx.save(); ctx.globalAlpha = 1 - fin;
    windowFrame(ctx, 560, 190, 800, 560, 'ALTRIX · TRIAL ACTIVATION');
    const on = prog(lt, ct, ct + 0.35);
    toggle(ctx, 960, 340, on, { w: 180, h: 84 });
    text(ctx, on > 0.5 ? 'TRIAL ACTIVATED' : 'TRIAL OFF', 960, 450, { size: 52, weight: 900, fam: MONO, color: on > 0.5 ? C.up : C.axis, glow: on > 0.5 ? 30 : 0, glowColor: C.up });
    for (let k = 0; k < 10; k++) { const lit = on > 0.5 && lt > ct + 0.3 + k * 0.08; ctx.save(); rrect(ctx, 1260 - k * 64 - 46, 540, 52, 70, 10); ctx.fillStyle = lit ? (k === 0 ? GOLD : 'rgba(168,85,247,0.55)') : 'rgba(255,255,255,0.06)'; if (lit) { ctx.shadowColor = P1; ctx.shadowBlur = 14; } ctx.fill(); ctx.restore();
      text(ctx, String(k + 1), 1260 - k * 64 - 20, 576, { size: 26, weight: 800, fam: MONO, color: lit ? '#fff' : C.axis }); }
    text(ctx, 'יום', 1320, 576, { size: 26, weight: 800, color: C.axis });
    popT(ctx, 960, 680, pr(s, 'התקנת', 0.4), () => pill(ctx, 'השלב הבא: התקנת המערכת  ⟵', 960, 680, { size: 32, color: TEAL, weight: 900 }));
    ctx.restore();
    if (fin > 0) {
      ring(ctx, CX, 500, 1100, fin);
      popT(ctx, CX, 420, fin, () => text(ctx, '10 DAYS', CX, 420, { size: 170, weight: 900, fam: MONO, glow: 60, glowColor: P1, spacing: 8 }));
      popT(ctx, CX, 590, prog(lt, end + 0.3, end + 0.8), () => text(ctx, 'TO EXPERIENCE ALTRIX', CX, 590, { size: 72, weight: 900, color: C.neon, spacing: 10, glow: 30, glowColor: P1 }));
      burst(ctx, CX, 500, prog(lt, end + 0.2, end + 1.4), P2, 46, 13, 800);
    }
  },
};

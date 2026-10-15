// Part 2: האמת על כסף (perceived value, solve problems, listen to the market)
window.SCENES = {};
const S = window.SCENES;

S.hook = {
  draw(ctx, s) {
    const c1 = s.cue('ברצינות'), c2 = s.cue('הנה');
    clip(ctx, '18303', s.lt, { zoom: [1.3, 1.05], dur: 4.5, dark: .2 });
    leak(ctx, s.t, .5, 2); shade(ctx);
    kt(ctx, 'תפסיקו', W / 2, 560, s.p(0, .35) * (1 - s.p(c2 - .2, c2)), { style: 'stamp', size: 200, color: C.red, glow: 'rgba(255,61,61,.5)', rot: -.15 });
    kt(ctx, 'לרדוף אחרי כסף', W / 2, 730, s.p(s.cue('לרדוף') - .05, s.cue('לרדוף') + .35) * (1 - s.p(c2 - .2, c2)), { style: 'rise', size: 104, fam: SERIF });
    const rp = s.p(c2 - .05, c2 + .45);
    if (rp > 0) card(ctx, rp, 160, 520, 760, 360, (c, w, h) => {
      glass(c, 0, 0, w, h, 40);
      txt(c, 'החוקים', w / 2, 120, { size: 100, fam: SERIF, color: C.gold2 });
      txt(c, 'האמיתיים של המשחק', w / 2, 240, { size: 60, w: 800, shadow: false });
    }, { tilt: .6 });
  },
  events: s => [{ lt: 0, type: 'impact', k: 1 }, { lt: s.cue('ברצינות'), type: 'drum', k: .6 }, { lt: s.cue('הנה'), type: 'swoosh' }],
  music: s => [{ track: '283', from: 0, gain: .6, fade: .02 }],
};
S.rule = {
  trans: 'zoom',
  draw(ctx, s) {
    const c1 = s.cue('הערך'), c2 = s.cue('השוק'), c3 = s.cue('אתם');
    clip(ctx, '4401', s.lt, { zoom: [1.05, 1.3], dur: 7, dark: .35 });
    shade(ctx);
    card(ctx, s.p(c1 - .1, c1 + .4), 110, 470, 860, 250, (c, w, h) => {
      glass(c, 0, 0, w, h, 40);
      txt(c, 'הכסף שלכם', w - 60, h / 2 - 40, { size: 56, w: 800, align: 'right', shadow: false });
      txt(c, '=', w / 2, h / 2 - 40, { size: 70, color: C.gold, shadow: false });
      txt(c, 'הערך שרואים בכם', 60, h / 2 - 40, { size: 56, w: 800, align: 'left', color: C.gold, shadow: false });
      txt(c, 'לא השעות. לא המאמץ.', w / 2, h / 2 + 60, { size: 40, w: 600, color: C.dim, shadow: false, a: s.p(c1 + .6, c1 + 1) });
    }, { tilt: .5 });
    kt(ctx, 'השוק', W / 2, 900, s.p(c2 - .05, c2 + .35), { style: 'stamp', size: 190, color: C.gold2, glow: 'rgba(245,196,81,.6)', fam: SERIF });
    // people bubbles: you, friends, family, neighbours
    ['אתם', 'החברים', 'המשפחה', 'השכנים'].forEach((w, i) => {
      const at = s.cue(w), q = E.back(s.p(at - .05, at + .3)); if (q <= 0) return;
      const x = 850 - i * 220, y = 1090;
      ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
      ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fillStyle = 'rgba(10,10,10,.8)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.gold; ctx.stroke();
      icon(ctx, 'user', 0, 4, 80, C.gold); ctx.restore();
    });
  },
  capStyle: { y: 1330 },
  events: s => [{ lt: s.cue('הערך'), type: 'pop' }, { lt: s.cue('השוק'), type: 'impact2', k: .7 }, ...['אתם', 'החברים', 'המשפחה', 'השכנים'].map(w => ({ lt: s.cue(w), type: 'pop2' }))],
};
S.football = {
  trans: 'whip',
  draw(ctx, s) {
    const c1 = s.cue('ביקוש'), c2 = s.cue('אז'), items = [['כרטיסים', 'כרטיסים'], ['חולצות', 'חולצות'], ['שידורים', 'שידורים']];
    montage(ctx, s, [{ id: '4262', at: -1, zoom: [1.0, 1.2] }, { id: '43499', at: c1 }, { id: '43501', at: c2, zoom: [1.15, 1.0] }], { dark: .25 });
    shade(ctx);
    if (s.lt < c1) kt(ctx, 'משלמים להם יותר מדי?', W / 2, 560, s.p(.2, .6), { style: 'rise', size: 76, w: 800 });
    const bp = s.p(c1 - .1, c1 + .3);
    if (bp > 0 && s.lt < c2 + .2) card(ctx, bp, 120, 440, 840, 420, (c, w, h) => {
      glass(c, 0, 0, w, h, 36);
      txt(c, 'ביקוש', w - 50, 70, { size: 56, align: 'right', color: C.gold, shadow: false });
      items.forEach(([l, cue], i) => {
        const at = s.cue(cue), p = E.out(s.p(at - .1, at + .5)), y = 160 + i * 90;
        txt(c, l, w - 50, y, { size: 42, w: 700, align: 'right', shadow: false, a: clamp(p * 3) });
        rr(c, 60, y - 20, 520, 40, 20); c.fillStyle = 'rgba(255,255,255,.08)'; c.fill();
        if (p > 0) { rr(c, 60 + 520 * (1 - p * (.75 + .08 * i)), y - 20, 520 * p * (.75 + .08 * i), 40, 20); c.fillStyle = C.green; c.fill(); }
      });
    }, { tilt: .4 });
    const mp = s.p(s.cue('מיליונים') - .05, s.cue('מיליונים') + .35);
    if (mp > 0) { kt(ctx, '$ מיליונים', W / 2, 760, mp, { style: 'stamp', size: 150, color: C.gold2, glow: 'rgba(245,196,81,.6)' }); sparks(ctx, W / 2, 760, s.p(s.cue('מיליונים'), s.cue('מיליונים') + .9), { n: 34, dist: 420 }); }
  },
  events: s => [{ lt: s.cue('ביקוש'), type: 'whoosh2' }, ...['כרטיסים', 'חולצות', 'שידורים'].map(w => ({ lt: s.cue(w), type: 'pop' })), { lt: s.cue('מיליונים'), type: 'coins' }, { lt: s.cue('מיליונים'), type: 'impact2', k: .6 }],
};
function salarySplit(ctx, s, o) {
  splitScreen(ctx, s, { id: '4830', px: 0 }, { id: '8734', px: .2 }, o.split);
  shade(ctx, { bot: .7 });
  vsBadge(ctx, W / 2, 900, o.split * 1.4 - .3);
  tag(ctx, 'מנקה', W * .75, 420, o.split, { size: 50 });
  tag(ctx, 'רואה חשבון', W * .25, 420, o.split - .1, { size: 50 });
}
S.cleaner = {
  trans: 'iris',
  draw(ctx, s) {
    const c1 = s.cue('המנקה'), c2 = s.cue('ומרוויח'), c3 = s.cue('פחות');
    salarySplit(ctx, s, { split: s.p(c1 - .3, c1 + .3) });
    if (s.lt < c1) kt(ctx, 'כמה קשה אתם עובדים?', W / 2, 700, s.p(.1, .5), { style: 'rise', size: 80, w: 800 });
    // effort vs pay meters
    const meter = (x, label, v, at, col) => {
      const p = E.out(s.p(at, at + .6)); if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(p * 3);
      txt(ctx, label, x, 1050, { size: 38, w: 700, color: C.dim });
      rr(ctx, x - 50, 1090, 100, 300, 18); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
      rr(ctx, x - 50, 1090 + 300 * (1 - v * p), 100, 300 * v * p, 18); ctx.fillStyle = col; ctx.fill(); ctx.restore();
    };
    meter(W * .75 + 70, 'מאמץ', .95, s.cue('מזיע'), C.gold); meter(W * .75 - 90, 'שכר', .25, c3, C.red);
    meter(W * .25 + 70, 'מאמץ', .45, c2, C.gold); meter(W * .25 - 90, 'שכר', .85, c3, C.green);
  },
  capStyle: { y: 1500, size: 72 },
  events: s => [{ lt: s.cue('המנקה') - .3, type: 'whoosh' }, { lt: s.cue('המנקה') + .1, type: 'impact2', k: .5 }, { lt: s.cue('פחות'), type: 'buzzer', k: .4 }],
};
S.why = {
  trans: 'cut',
  draw(ctx, s) {
    const c1 = s.cue('להחליף'), c2 = s.cue('למד'), c3 = s.cue('וחוסך');
    salarySplit(ctx, s, { split: 1 });
    kt(ctx, 'למה?', W / 2, 640, s.p(0, .3) * (1 - s.p(c1 - .2, c1)), { style: 'pop', size: 170, fam: SERIF, color: C.gold2 });
    tag(ctx, 'קל להחליף', W * .75, 1150, s.p(c1 - .05, c1 + .3), { color: C.red, size: 46 });
    tag(ctx, 'שנים של לימוד', W * .25, 1050, s.p(c2 - .05, c2 + .3), { size: 42 });
    tag(ctx, 'חוסך אלפים', W * .25, 1170, s.p(c3 - .05, c3 + .3), { size: 42, color: C.green });
  },
  capStyle: { y: 1450, size: 72 },
  events: s => [{ lt: 0, type: 'pop' }, { lt: s.cue('להחליף'), type: 'buzzer', k: .4 }, { lt: s.cue('למד'), type: 'pop2' }, { lt: s.cue('וחוסך'), type: 'coins' }],
};
S.secret = {
  trans: 'zoom', caps: false,
  draw(ctx, s) {
    const c1 = s.cue('הצעד'), c2 = s.cue('רוצים'), c3 = s.cue('תפתרו');
    blackBG(ctx, s.t, { dust: true, dustA: .4 });
    ctx.save(); ctx.globalAlpha = .45 * (1 - s.p(c3 - .3, c3)); clip(ctx, '221', s.lt, { zoom: [1.1, 1.3], dur: 6 }); ctx.restore();
    kt(ctx, 'איך מעלים את הערך שלכם?', W / 2, 640, s.p(0, .5) * (1 - s.p(c2 - .3, c2)), { style: 'blur', size: 72, w: 800 });
    kt(ctx, 'הצעד הראשון', W / 2, 770, s.p(c1, c1 + .4) * (1 - s.p(c2 - .3, c2)), { style: 'rise', size: 56, w: 600, color: C.dim });
    kt(ctx, 'רוצים כסף?', W / 2, 620, s.p(c2, c2 + .35), { style: 'rise', size: 96, w: 800 });
    const r = s.p(c3 - .05, c3 + .5);
    if (r > 0) { leak(ctx, s.t, .8 * r, 9);
      kt(ctx, 'תפתרו', W / 2, 880, r, { style: 'stamp', size: 240, fam: SERIF, color: C.gold2, glow: 'rgba(245,196,81,.7)', glowR: 60 });
      kt(ctx, 'בעיות.', W / 2, 1120, s.p(s.cue('בעיות') - .05, s.cue('בעיות') + .4), { style: 'stamp', size: 240, fam: SERIF, color: C.gold2, glow: 'rgba(245,196,81,.7)', glowR: 60 });
      ringFx(ctx, W / 2, 1000, 700, s.p(c3, c3 + .8)); sparks(ctx, W / 2, 1000, s.p(c3, c3 + 1), { n: 50, dist: 600 });
    }
  },
  events: s => [{ lt: .1, type: 'heartbeat' }, { lt: s.cue('תפתרו'), type: 'riser' }, { lt: s.cue('תפתרו'), type: 'impact', k: 1.3 }, { lt: s.cue('בעיות'), type: 'impact2', k: .7 }],
  music: s => [{ fx: 'drop', lt: 0, dur: .05 }, { track: '614', from: 20, gain: .45, fade: .2 }, { fx: 'drop', lt: s.cue('תפתרו') - .45, dur: .45 }],
};
S.scale = {
  trans: 'flash',
  draw(ctx, s) {
    const a = s.cue('מיליון'), b = s.cue('מיליונים'), c = s.cue('מיליארד'), d = s.cue('מיליארדים');
    blackBG(ctx, s.t);
    const col = (x, title, p1, sub, p2, n, at2) => {
      if (p1 <= 0) return;
      card(ctx, p1, x - 210, 440, 420, 170, (cx, w, h) => { glass(cx, 0, 0, w, h, 30); txt(cx, 'בעיה של', w / 2, 55, { size: 36, w: 600, color: C.dim, shadow: false }); txt(cx, title, w / 2, 115, { size: 70, fam: 'Rubik', color: C.white, shadow: false }); }, { tilt: .4 });
      if (p2 > 0) txt(ctx, '↓', x, 690, { size: 70, color: C.gold, a: p2 });
      moneyStack(ctx, x, 1250, n, s.p(at2, at2 + .9), { w: 300 });
      txt(ctx, sub, x, 1340, { size: 64, color: C.gold2, a: p2, glow: 'rgba(245,196,81,.4)' });
    };
    col(W * .73, '$1M', s.p(a - .1, a + .3), 'מיליונים', s.p(b - .05, b + .3), 8, b);
    col(W * .27, '$1B', s.p(c - .1, c + .3), 'מיליארדים', s.p(d - .05, d + .3), 22, d);
  },
  caps: false,
  events: s => [{ lt: s.cue('מיליון'), type: 'pop' }, { lt: s.cue('מיליונים'), type: 'coins' }, { lt: s.cue('מיליארד'), type: 'pop' }, { lt: s.cue('מיליארדים'), type: 'impact2', k: .8 }, { lt: s.cue('מיליארדים') + .1, type: 'coins' }],
  music: s => [{ track: '404', from: 11.5, gain: .6, fade: .02 }],
};
S.amazon = {
  trans: 'split',
  draw(ctx, s) {
    const a = s.cue('הטרחה'), b = s.cue('ההמתנה'), c = s.cue('המחירים'), d = s.cue('ובזוס');
    montage(ctx, s, [{ id: '31155', at: -1 }, { id: '42130', at: b }, { id: '31138', at: c }, { id: '18249', at: d, zoom: [1.3, 1.05] }], { dark: .3 });
    shade(ctx);
    const items = [['בלי ללכת לחנות', a], ['בלי לחכות שבועות', b], ['מחירים נמוכים', c]];
    if (s.lt < d + .2) card(ctx, s.p(a - .2, a + .2), 130, 430, 820, 400, (cx, w, h) => {
      glass(cx, 0, 0, w, h, 36);
      txt(cx, 'הבעיות שאמזון פתרה', w / 2, 70, { size: 46, w: 800, color: C.gold, shadow: false });
      items.forEach(([l, at], i) => {
        const p = s.p(at - .05, at + .3), y = 165 + i * 85; if (p <= 0) return;
        cx.save(); cx.globalAlpha = clamp(p * 2); txt(cx, l, w - 140, y, { size: 48, w: 700, align: 'right', shadow: false }); cx.restore();
        cx.beginPath(); cx.arc(w - 80, y, 30, 0, 7); cx.fillStyle = C.green; cx.globalAlpha = p; cx.fill(); cx.globalAlpha = 1;
        icon(cx, 'check', w - 80, y, 46 * E.back(p), C.ink);
      });
    }, { tilt: .4 });
    const m = s.p(s.cue('מיליארדים') - .05, s.cue('מיליארדים') + .35);
    if (m > 0) kt(ctx, '$ מיליארדים', W / 2, 760, m, { style: 'stamp', size: 150, color: C.gold2, glow: 'rgba(245,196,81,.6)' });
  },
  events: s => [...['הטרחה', 'ההמתנה', 'המחירים'].map(w => ({ lt: s.cue(w), type: 'correct', k: .6 })), { lt: s.cue('מיליארדים'), type: 'impact', k: .8 }, { lt: s.cue('מיליארדים'), type: 'coins' }],
};
S.objection = {
  trans: 'glitch',
  draw(ctx, s) {
    const a = s.cue('לתכנת'), b = s.cue('אין');
    montage(ctx, s, [{ id: '50766', at: -1, zoom: [1.0, 1.15] }, { id: '41645', at: a - .3, zoom: [1.2, 1.05] }], { dark: .3 });
    shade(ctx);
    kt(ctx, 'רגע.', W / 2, 560, s.p(0, .3) * (1 - s.p(s.cue('אמזון') - .2, s.cue('אמזון'))), { style: 'stamp', size: 160, color: C.white, rot: .1 });
    const bub = (y, l, at, dir) => { const p = s.p(at - .1, at + .3); if (p <= 0) return;
      card(ctx, p, 150, y, 780, 130, (c, w, h) => { glass(c, 0, 0, w, h, 65, { fill: 'rgba(30,8,8,.8)', edge: 'rgba(255,61,61,.7)', edge2: 'rgba(255,61,61,.3)' });
        icon(c, 'x', 80, h / 2, 50, C.red); txt(c, l, w - 50, h / 2 + 4, { size: 54, w: 800, align: 'right', shadow: false }); }, { dir, tilt: .6 }); };
    bub(470, 'אמזון הבאה?!', s.cue('אמזון'), 1);
    bub(640, 'לא יודע לתכנת', a, -1);
    bub(810, 'אין לי כסף להתחיל', b, 1);
  },
  events: s => [{ lt: 0, type: 'glitch2' }, { lt: s.cue('אמזון'), type: 'pop' }, { lt: s.cue('לתכנת'), type: 'buzzer', k: .35 }, { lt: s.cue('אין'), type: 'buzzer', k: .35 }],
  music: s => [{ fx: 'lpf', lt: 0, dur: s.d }],
};
S.listen = {
  trans: 'flash',
  draw(ctx, s) {
    const a = s.cue('מבעיה'), b = s.cue('תקשיבו'), q = [['מה מתסכל אנשים?', s.cue('מתסכל')], ['מה הם מאחלים שהיה קיים?', s.cue('מאחלים')], ['מה מסורבל להם?', s.cue('מסורבל')]];
    // freeze on "stop", then the street comes alive
    const frozen = s.lt < b;
    clip(ctx, frozen ? '4915' : '4437', frozen ? Math.min(s.lt, .05) : s.lt - b, { zoom: frozen ? [1.15, 1.15] : [1.05, 1.2], dur: 5, dark: .35, bw: frozen ? 1 : 0 });
    shade(ctx);
    kt(ctx, 'תעצרו.', W / 2, 600, s.p(0, .25) * (1 - s.p(a - .2, a)), { style: 'stamp', size: 190, color: C.red, glow: 'rgba(255,61,61,.5)' });
    kt(ctx, 'תתחילו מבעיה', W / 2, 600, s.p(a - .1, a + .3) * (1 - s.p(b - .2, b)), { style: 'mask', size: 110, fam: SERIF, color: C.gold2 });
    if (s.lt > b - .2) card(ctx, s.p(b - .2, b + .3), 110, 400, 860, 520, (c, w, h) => {
      glass(c, 0, 0, w, h, 40, { fill: 'rgba(12,11,9,.86)' });
      txt(c, 'תקשיבו לשוק', w / 2, 75, { size: 54, color: C.gold, shadow: false });
      q.forEach(([l, at], i) => {
        const p = s.p(at - .1, at + .3), y = 190 + i * 115; if (p <= 0) return;
        c.save(); c.globalAlpha = clamp(p * 2); c.translate((1 - E.out(p)) * 60, 0);
        icon(c, 'bulb', w - 70, y, 56, C.gold); txt(c, l, w - 120, y, { size: 48, w: 700, align: 'right', shadow: false }); c.restore();
        c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(50, y + 52, w - 100, 2);
      });
    }, { tilt: .5 });
  },
  events: s => [{ lt: 0, type: 'shutter' }, { lt: 0.02, type: 'impact2', k: .6 }, { lt: s.cue('מבעיה'), type: 'whoosh2' }, { lt: s.cue('תקשיבו'), type: 'pop' }, ...['מתסכל', 'מאחלים', 'מסורבל'].map(w => ({ lt: s.cue(w), type: 'pop2' }))],
  music: s => [{ track: '281', from: 7, gain: .5, fade: .3, lt: s.cue('תקשיבו') - .3 }],
};
S.cta = {
  trans: 'blur',
  draw(ctx, s) {
    const h = s.cue('חצי');
    endCard(ctx, s, { bg: '49885', teaserAt: s.cue('בחלק') - .1, followAt: s.cue('תעקבו') - .1, next: R.spec.next.replace(/^חלק \d: /, '') });
    const p = s.p(h - .1, h + .5) * (1 - s.p(s.cue('בחלק') - .3, s.cue('בחלק') - .1));
    if (p > 0) { // half of the equation: half-filled ring
      ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.lineWidth = 40; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.arc(W / 2, 800, 220, 0, 7); ctx.stroke();
      ctx.strokeStyle = C.gold; ctx.lineCap = 'round'; ctx.shadowColor = C.gold; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(W / 2, 800, 220, -Math.PI / 2, -Math.PI / 2 + Math.PI * E.out(p)); ctx.stroke(); ctx.restore();
      txt(ctx, '50%', W / 2, 800, { size: 120, color: C.gold2, a: p, fam: 'Rubik' });
    }
  },
  capStyle: { y: 1400, size: 76 },
  events: s => [{ lt: s.cue('מעולה'), type: 'correct', k: .5 }, { lt: s.cue('חצי'), type: 'whoosh' }, ...endEvents(s, { teaserAt: s.cue('בחלק') - .1, followAt: s.cue('תעקבו') - .1 })],
  music: s => [{ track: '846', from: 78, gain: .6, fade: .5 }],
};

// Part 3: הסוד שהופך פתרון להון (scale, automation, the exit)
window.SCENES = {};
const S = window.SCENES;

S.hook = {
  draw(ctx, s) {
    const a = s.cue('ויש'), b = s.cue('ההבדל'), c = s.cue('סקייל');
    if (s.lt < b) {
      montage(ctx, s, [{ id: '26089', at: -1, zoom: [1.15, 1.0] }, { id: '52427', at: a }], { dark: .2 });
      shade(ctx);
      tag(ctx, s.lt < a ? 'עובדים יותר קשה' : 'עשירים', W / 2, 560, s.lt < a ? s.p(.2, .5) : s.p(a, a + .3), { color: s.lt < a ? C.red : C.gold, size: 60 });
    } else {
      blackBG(ctx, s.t);
      kt(ctx, 'ההבדל?', W / 2, 640, s.p(b - .05, b + .3) * (1 - s.p(c - .2, c)), { style: 'blur', size: 130, fam: SERIF });
      // SCALE: letters slam in one by one
      const L = 'SCALE'.split(''), sz = 230, gap = 175, x0 = W / 2 - gap * 2;
      L.forEach((ch, i) => { const at = c + i * .08, p = s.p(at, at + .25); if (p <= 0) return;
        kt(ctx, ch, x0 + i * gap, 900, p, { style: 'stamp', size: sz, color: C.gold2, glow: 'rgba(245,196,81,.6)', fam: 'Rubik' }); });
      ringFx(ctx, W / 2, 900, 700, s.p(c + .4, c + 1.2)); sparks(ctx, W / 2, 900, s.p(c + .4, c + 1.4), { n: 50, dist: 600 });
    }
  },
  caps: true, capStyle: { y: 1300 },
  events: s => [{ lt: 0, type: 'impact2', k: .7 }, { lt: s.cue('ויש'), type: 'shutter' }, { lt: s.cue('ההבדל'), type: 'whoosh2' }, { lt: s.cue('סקייל'), type: 'riser' }, { lt: s.cue('סקייל') + .35, type: 'impact', k: 1.2 }],
  music: s => [{ track: '369', from: 12, gain: .55, fade: .02 }, { fx: 'drop', lt: s.cue('ההבדל') - .1, dur: .6 }],
};
function mapCard(ctx, s, p, pins, spread) {
  card(ctx, p, 110, 420, 860, 560, (c, w, h) => {
    glass(c, 0, 0, w, h, 40, { fill: 'rgba(10,12,14,.86)' });
    c.save(); rr(c, 20, 20, w - 40, h - 40, 30); c.clip();
    c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 2;
    for (let x = 20; x < w; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 20; y < h; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    const r = rng(4);
    for (let i = 0; i < pins; i++) {
      const x = i === 0 ? w / 2 : 60 + r() * (w - 120), y = i === 0 ? h / 2 : 60 + r() * (h - 120), q = E.back(clamp(spread * pins - i));
      if (i && q <= 0) continue; const k = i ? q : 1;
      if (i === 0) { c.beginPath(); c.arc(x, y, 110, 0, 7); c.fillStyle = 'rgba(245,196,81,.12)'; c.fill(); c.strokeStyle = 'rgba(245,196,81,.5)'; c.setLineDash([10, 10]); c.stroke(); c.setLineDash([]); }
      c.save(); c.translate(x, y); c.scale(k, k); c.beginPath(); c.arc(0, -18, 16, 0, 7); c.lineTo(0, 6); c.fillStyle = i ? C.gold : C.red; c.fill(); c.restore();
    }
    c.restore();
  }, { tilt: .4 });
}
S.restaurant = {
  trans: 'whip',
  draw(ctx, s) {
    const a = s.cue('תקועים'), b = s.cue('רשת');
    clip(ctx, '4672', s.lt, { zoom: [1.05, 1.2], dur: 6, dark: .3 });
    shade(ctx);
    tag(ctx, 'מסעדה', W / 2, 360, s.p(0, .3), { size: 56 });
    mapCard(ctx, s, s.p(a - .2, a + .3), 26, s.p(b, b + 1.6));
    tag(ctx, 'אזור אחד', W / 2, 1060, s.p(a, a + .3) * (1 - s.p(b - .2, b)), { color: C.red, size: 48 });
    tag(ctx, 'רשת זכיינות = SCALE', W / 2, 1060, s.p(b + .2, b + .5), { color: C.gold, size: 48 });
  },
  events: s => [{ lt: s.cue('תקועים'), type: 'pop' }, { lt: s.cue('רשת'), type: 'riser' }, { lt: s.cue('רשת') + .1, type: 'coins' }],
};
S.software = {
  trans: 'zoom',
  draw(ctx, s) {
    const a = s.cue('פעם'), b = s.cue('לאינסוף'), c = s.cue('ייצור'), d = s.cue('משלוחים');
    montage(ctx, s, [{ id: '1728', at: -1, zoom: [1.1, 1.3] }, { id: '41656', at: b }], { dark: .45 });
    shade(ctx);
    // one box -> infinite users
    const bp = s.p(a - .1, a + .3), cx = W / 2, cy = 760;
    if (bp > 0) { ctx.save(); ctx.translate(cx, cy); ctx.scale(E.back(bp), E.back(bp)); rr(ctx, -90, -90, 180, 180, 30); ctx.fillStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 40; ctx.fill(); ctx.shadowBlur = 0;
      txt(ctx, '</>', 0, 4, { size: 70, color: C.ink, fam: 'JetBrains Mono', shadow: false }); ctx.restore(); }
    const up = s.p(b - .1, b + 1.6), r = rng(9);
    for (let i = 0; i < 60; i++) {
      const ang = r() * 6.283, dist = 160 + r() * 420, q = E.out(clamp(up * 60 / 20 - i / 20)); if (q <= 0) continue;
      const x = cx + Math.cos(ang) * dist * q, y = cy + Math.sin(ang) * dist * .9 * q;
      ctx.save(); ctx.globalAlpha = .4 + .6 * q; ctx.strokeStyle = 'rgba(245,196,81,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      icon(ctx, 'user', x, y, 34, C.white); ctx.restore();
    }
    if (up > 0) counter(ctx, 1 + 999999 * E.in(up), W / 2, 470, { size: 96, fam: 'Rubik', color: C.gold2, post: ' משתמשים' });
    tag(ctx, 'בלי ייצור', W * .72, 1120, s.p(c - .05, c + .3), { color: C.green, size: 44 });
    tag(ctx, 'בלי משלוחים', W * .3, 1120, s.p(d - .05, d + .3), { color: C.green, size: 44 });
  },
  events: s => [{ lt: s.cue('פעם'), type: 'pop' }, { lt: s.cue('לאינסוף'), type: 'riser' }, { lt: s.cue('לאינסוף') + .1, type: 'impact2', k: .6 }, { lt: s.cue('ייצור'), type: 'pop2' }, { lt: s.cue('משלוחים'), type: 'pop2' }],
};
S.yoga = {
  trans: 'glitch',
  draw(ctx, s) {
    const a = s.cue('מורה'), b = s.cue('מזל'), c = s.cue('יצרתם'), d = s.cue('בתחפושת');
    clip(ctx, '43737', s.lt, { zoom: [1.05, 1.2], dur: 7, dark: .25 });
    shade(ctx);
    kt(ctx, 'זהירות', W / 2, 520, s.p(0, .3) * (1 - s.p(a, a + .3)), { style: 'stamp', size: 150, color: C.red, glow: 'rgba(255,61,61,.5)', rot: -.2 });
    const tp = s.p(s.cue('מאה') - .1, s.cue('מאה') + .3);
    if (tp > 0) card(ctx, tp, 290, 440, 500, 200, (c2, w, h) => { glass(c2, 0, 0, w, h, 36); txt(c2, '$100', w / 2, 80, { size: 100, fam: 'Rubik', color: C.gold2, shadow: false }); txt(c2, 'לשעה', w / 2, 160, { size: 44, w: 700, color: C.dim, shadow: false }); }, { tilt: .5 });
    if (s.lt > b) { sparks(ctx, W / 2, 540, s.p(b, b + 1), { n: 40, dist: 450, color: C.green }); }
    kt(ctx, 'עוד עבודה', W / 2, 820, s.p(c + .3, c + .6), { style: 'stamp', size: 140, color: C.white, rot: .1 });
    kt(ctx, 'בתחפושת של עסק', W / 2, 980, s.p(d - .05, d + .3), { style: 'mask', size: 84, color: C.red, bar: C.red });
  },
  events: s => [{ lt: 0, type: 'buzzer', k: .4 }, { lt: s.cue('מאה'), type: 'pop' }, { lt: s.cue('מזל'), type: 'correct', k: .5 }, { lt: s.cue('יצרתם') + .3, type: 'impact2', k: .7 }],
};
S.online = {
  trans: 'push',
  draw(ctx, s) {
    const a = s.cue('אונליין'), b = s.cue('עשרים'), c = s.cue('סקייל');
    montage(ctx, s, [{ id: '1053', at: -1 }, { id: '10443', at: a - .2, zoom: [1.15, 1.0] }], { dark: .3 });
    shade(ctx);
    // the day bar: only so many lessons fit
    if (s.lt < a) card(ctx, s.p(0, .4), 110, 470, 860, 240, (cx, w, h) => {
      glass(cx, 0, 0, w, h, 36); txt(cx, 'שעות ביום', w - 50, 60, { size: 44, w: 700, align: 'right', color: C.dim, shadow: false });
      for (let i = 0; i < 12; i++) { const q = E.back(s.p(.3 + i * .12, .5 + i * .12)); const x = w - 80 - i * 64;
        rr(cx, x - 26, 120, 52, 80 * q, 10); cx.fillStyle = i < 8 ? C.gold : 'rgba(255,255,255,.1)'; cx.fill(); }
      txt(cx, 'מקסימום', 120, 60, { size: 40, w: 800, color: C.red, shadow: false, a: s.p(1.6, 1.9) });
    }, { tilt: .4 });
    else card(ctx, s.p(a - .1, a + .35), 210, 430, 660, 440, (cx, w, h) => {
      glass(cx, 0, 0, w, h, 36, { fill: 'rgba(8,8,8,.85)' });
      rr(cx, 40, 40, w - 80, 260, 22); cx.fillStyle = '#16120a'; cx.fill();
      cx.beginPath(); cx.arc(w / 2, 170, 60, 0, 7); cx.fillStyle = C.gold; cx.fill(); icon(cx, 'play', w / 2 + 6, 170, 60, C.ink);
      txt(cx, 'קורס יוגה אונליין', w / 2, 345, { size: 44, w: 800, shadow: false });
      const vp = s.p(b, s.d);
      counter(cx, 24 + 18000 * E.in(vp), w / 2, 400, { size: 34, w: 700, fam: 'Rubik', color: C.dim, shadow: false, post: ' צפיות' });
      if (s.lt > b - .1) { const q = E.back(s.p(b - .1, b + .3)); cx.save(); cx.translate(w - 60, 50); cx.scale(q, q); rr(cx, -95, -40, 190, 80, 40); cx.fillStyle = C.red; cx.fill(); txt(cx, '24/7', 0, 3, { size: 46, fam: 'Rubik', shadow: false }); cx.restore(); }
    }, { tilt: .5 });
    kt(ctx, 'SCALE', W / 2, 1020, s.p(c - .05, c + .3), { style: 'stamp', size: 170, color: C.gold2, glow: 'rgba(245,196,81,.6)', fam: 'Rubik' });
  },
  events: s => [{ lt: .3, type: 'tick' }, { lt: s.cue('אונליין'), type: 'whoosh2' }, { lt: s.cue('עשרים'), type: 'pop' }, { lt: s.cue('סקייל'), type: 'impact', k: .9 }],
};
S.auto = {
  trans: 'flash',
  draw(ctx, s) {
    const a = s.cue('מערכות'), b = s.cue('מכונה'), c = s.cue('תאצילו');
    montage(ctx, s, [{ id: '2230', at: -1, zoom: [1.1, 1.25] }, { id: '3650', at: b - .1, zoom: [1.3, 1.1] }], { dark: .4 });
    shade(ctx);
    kt(ctx, 'אוטומציה', W / 2, 470, s.p(0, .35), { style: 'mask', size: 130, fam: SERIF, color: C.gold2 });
    // flow: systems -> processes -> machine, with dots travelling along
    const nodes = [['מערכות', W * .78, s.cue('מערכות')], ['תהליכים', W / 2, s.cue('ותהליכים')], ['מכונה', W * .22, b]];
    nodes.forEach(([l, x, at], i) => { const q = E.back(s.p(at - .05, at + .3)); if (q <= 0) return;
      ctx.save(); ctx.translate(x, 760); ctx.scale(q, q); ctx.beginPath(); ctx.arc(0, 0, 105, 0, 7); ctx.fillStyle = 'rgba(8,8,8,.85)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.gold; ctx.stroke();
      txt(ctx, l, 0, 4, { size: 40, w: 800, shadow: false }); ctx.restore();
      if (i) { const x0 = nodes[i - 1][1] - 110, x1 = x + 110; ctx.strokeStyle = 'rgba(245,196,81,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, 760); ctx.lineTo(x1, 760); ctx.stroke();
        for (let k = 0; k < 3; k++) { const f = ((s.lt * 1.2 + k / 3) % 1); ctx.beginPath(); ctx.arc(lerp(x0, x1, f), 760, 8, 0, 7); ctx.fillStyle = C.gold2; ctx.fill(); } }
    });
    const dp = s.p(c - .1, c + .35);
    if (dp > 0) card(ctx, dp, 160, 960, 760, 160, (cx, w, h) => { glass(cx, 0, 0, w, h, 80);
      txt(cx, 'אתם', w - 110, h / 2 + 3, { size: 52, shadow: false }); txt(cx, '←', w / 2, h / 2, { size: 70, color: C.gold, shadow: false }); txt(cx, 'מי שעושה טוב יותר', 230, h / 2 + 3, { size: 42, w: 700, color: C.gold, shadow: false }); }, { tilt: .5 });
  },
  events: s => [{ lt: s.cue('מערכות'), type: 'click' }, { lt: s.cue('ותהליכים'), type: 'click' }, { lt: s.cue('מכונה'), type: 'impact2', k: .6 }, { lt: s.cue('תאצילו'), type: 'whoosh' }],
};
S.ego = {
  trans: 'blur',
  draw(ctx, s) {
    const a = s.cue('אגו'), b = s.cue('ולשוק');
    clip(ctx, '49885', s.lt, { zoom: [1.1, 1.25], dur: 5, dark: .35, bw: .6 });
    shade(ctx);
    kt(ctx, 'אגו', W * .7, 640, s.p(a - .05, a + .3), { style: 'stamp', size: 150, color: C.white });
    strike(ctx, W * .7 - 150, W * .7 + 150, 640, s.p(a + .3, a + .6), C.red, 16);
    kt(ctx, 'תשוקה', W * .3, 820, s.p(s.cue('מהתשוקות') - .05, s.cue('מהתשוקות') + .3), { style: 'stamp', size: 130, color: C.white });
    strike(ctx, W * .3 - 190, W * .3 + 190, 820, s.p(s.cue('מהתשוקות') + .3, s.cue('מהתשוקות') + .6), C.red, 16);
    kt(ctx, 'לשוק לא אכפת', W / 2, 1040, s.p(b + .2, b + .6), { style: 'rise', size: 90, fam: SERIF, color: C.gold2 });
  },
  events: s => [{ lt: s.cue('אגו'), type: 'drum', k: .6 }, { lt: s.cue('מהתשוקות'), type: 'drum', k: .6 }],
  music: s => [{ fx: 'lpf', lt: 0, dur: s.d }, { fx: 'drop', lt: s.d - .45, dur: .45 }],
};
S.exit = {
  trans: 'zoom',
  draw(ctx, s) {
    const a = s.cue('האקזיט'), b = s.cue('פייסבוק'), c = s.cue('איביי'), d = s.cue('ואילון');
    montage(ctx, s, [{ id: '30009', at: -1, zoom: [1.2, 1.0] }, { id: '18249', at: b - .1, zoom: [1.0, 1.3] }], { dark: .45 });
    leak(ctx, s.t, .5, 6); shade(ctx);
    if (s.lt < b) kt(ctx, 'EXIT', W / 2, 820, s.p(a - .05, a + .3), { style: 'stamp', size: 280, color: C.gold2, glow: 'rgba(245,196,81,.7)', glowR: 70, fam: 'Rubik' });
    const deal = (y, buyer, sold, price, at) => { const p = s.p(at - .1, at + .35); if (p <= 0) return;
      card(ctx, p, 110, y, 860, 190, (cx, w, h) => { glass(cx, 0, 0, w, h, 36, { fill: 'rgba(8,8,8,.86)' });
        txt(cx, sold, w - 50, 70, { size: 58, w: 800, align: 'right', shadow: false, fam: 'Rubik' });
        txt(cx, 'נקנתה ע"י ' + buyer, w - 50, 140, { size: 36, w: 600, align: 'right', color: C.dim, shadow: false });
        txt(cx, price, 60, h / 2, { size: 92, align: 'left', color: C.gold2, fam: 'Rubik', shadow: false, glow: 'rgba(245,196,81,.4)' }); }, { tilt: .5 }); };
    deal(420, 'Facebook', 'Instagram', '$1B', b);
    deal(640, 'eBay', 'PayPal', '$1.5B', c);
    const mp = s.p(d - .05, d + .35);
    if (mp > 0) card(ctx, mp, 210, 870, 660, 230, (cx, w, h) => { glass(cx, 0, 0, w, h, 36, { edge: 'rgba(54,226,143,.7)' });
      txt(cx, 'אילון מאסק לקח', w / 2, 60, { size: 40, w: 700, color: C.dim, shadow: false });
      counter(cx, 165 * E.out(s.p(d + .2, s.d - .3)), w / 2, 150, { size: 110, fam: 'Rubik', color: C.green, pre: '$', post: 'M', shadow: false }); }, { tilt: .6 });
  },
  events: s => [{ lt: s.cue('האקזיט'), type: 'impact', k: 1.2 }, { lt: s.cue('פייסבוק'), type: 'swoosh' }, { lt: s.cue('במיליארד'), type: 'coins' }, { lt: s.cue('איביי'), type: 'swoosh' }, { lt: s.cue('וחצי'), type: 'coins' }, { lt: s.cue('ואילון'), type: 'impact2', k: .7 }],
  music: s => [{ track: '680', from: 68, gain: .65, fade: .05 }],
};
S.keep = {
  trans: 'whip',
  draw(ctx, s) {
    const a = s.cue('אוהבים'), b = s.cue('רץ'), c = s.cue('עשיתם');
    montage(ctx, s, [{ id: '52427', at: -1, zoom: [1.05, 1.2] }, { id: '4800', at: c - .3, zoom: [1.2, 1.05] }], { dark: .3 });
    leak(ctx, s.t, .4, 8); shade(ctx);
    tag(ctx, 'או שממשיכים', W / 2, 420, s.p(0, .3) * (1 - s.p(c - .4, c - .2)), { size: 52 });
    const row = (y, l, at) => { const p = s.p(at - .1, at + .3); if (p <= 0 || s.lt > c - .2) return;
      card(ctx, p, 130, y, 820, 130, (cx, w, h) => { glass(cx, 0, 0, w, h, 65); icon(cx, 'check', w - 75, h / 2, 50, C.green);
        txt(cx, l, w - 130, h / 2 + 3, { size: 48, w: 700, align: 'right', shadow: false }); }, { tilt: .5 }); };
    row(540, 'אוהבים את מה שבניתם', a); row(710, 'העסק רץ גם בלעדיכם', b);
    kt(ctx, 'עשיתם את זה.', W / 2, 760, s.p(c - .05, c + .4), { style: 'blur', size: 130, fam: SERIF, color: C.gold2, glow: 'rgba(245,196,81,.5)' });
    sparks(ctx, W / 2, 760, s.p(c + .1, c + 1.1), { n: 40, dist: 500 });
  },
  events: s => [{ lt: s.cue('אוהבים'), type: 'correct', k: .5 }, { lt: s.cue('רץ'), type: 'correct', k: .5 }, { lt: s.cue('עשיתם'), type: 'impact2', k: .6 }],
  music: s => [{ track: '839', from: 30, gain: .5, fade: .5 }],
};
S.cta = {
  trans: 'flash',
  draw(ctx, s) {
    endCard(ctx, s, { bg: '1214', teaserAt: s.cue('בחלק') - .1, followAt: s.cue('תעקבו') - .1, next: R.spec.next.replace(/^חלק \d: /, '') });
    kt(ctx, 'בשביל מה?', W / 2, 760, s.p(s.cue('בשביל') - .1, s.cue('בשביל') + .3) * (1 - s.p(s.cue('בחלק') - .3, s.cue('בחלק') - .1)), { style: 'blur', size: 150, fam: SERIF, color: C.gold2 });
  },
  capStyle: { y: 1400, size: 76 },
  events: s => [{ lt: 0, type: 'deep', k: .6 }, ...endEvents(s, { teaserAt: s.cue('בחלק') - .1, followAt: s.cue('תעקבו') - .1 })],
  music: s => [{ fx: 'drop', lt: 0, dur: .5 }, { track: '614', from: 70, gain: .55, fade: .3, lt: .45 }],
};

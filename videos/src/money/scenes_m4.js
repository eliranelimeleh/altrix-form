// Part 4: הכסף או החיים (your money or your life + conclusion)
window.SCENES = {};
const S = window.SCENES;

S.hook = {
  draw(ctx, s) {
    const a = s.cue('בשביל', 2), b = s.cue('הכסף');
    clip(ctx, '1214', s.lt, { zoom: [1.2, 1.05], dur: 5 });
    leak(ctx, s.t, .4, 4); shade(ctx);
    kt(ctx, 'בשביל מה', W / 2, 560, s.p(0, .5), { style: 'blur', size: 130, fam: SERIF });
    kt(ctx, 'כל זה היה?', W / 2, 700, s.p(s.cue('כל') - .05, s.cue('כל') + .4), { style: 'blur', size: 130, fam: SERIF, color: C.gold2 });
    const p = s.p(b - .05, b + .35);
    if (p > 0) { ctx.fillStyle = `rgba(0,0,0,${.45 * p})`; ctx.fillRect(0, 0, W, H); kt(ctx, 'זה לא היה הכסף', W / 2, 900, p, { style: 'stamp', size: 110, color: C.white, rot: -.1 }); }
  },
  events: s => [{ lt: 0, type: 'deep', k: .5 }, { lt: s.cue('הכסף'), type: 'impact2', k: .6 }],
  music: s => [{ track: '614', from: 10, gain: .55, fade: .02 }],
};
S.paper = {
  trans: 'blur',
  draw(ctx, s) {
    const a = s.cue('מספר'), b = s.cue('יש'), c = s.cue('מאמינים');
    montage(ctx, s, [{ id: '18296', at: -1, zoom: [1.1, 1.3], rate: .6, bw: .4 }, { id: '4915', at: a - .1, zoom: [1.25, 1.1] }], { dark: .35 });
    shade(ctx);
    kt(ctx, 'נייר.', W * .5, 560, s.p(0, .35) * (1 - s.p(a - .2, a)), { style: 'stamp', size: 180, fam: SERIF, color: C.white });
    if (s.lt > a - .1) { // a number on a screen, flickering digits
      const r = rng(Math.floor(s.lt * 12)), dig = Array.from({ length: 7 }, () => Math.floor(r() * 10)).join('');
      const settle = s.p(a + .5, a + 1.1), v = settle >= 1 ? '1,000,000' : dig.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
      txt(ctx, '$' + v, W / 2, 620, { size: 130, fam: 'JetBrains Mono', w: 700, color: C.green, glow: 'rgba(54,226,143,.5)', a: s.p(a - .1, a + .2) });
    }
    const bp = s.p(c - .1, c + .4);
    if (bp > 0) { kt(ctx, 'אמונה.', W / 2, 860, bp, { style: 'blur', size: 170, fam: SERIF, color: C.gold2, glow: 'rgba(245,196,81,.5)' }); }
  },
  events: s => [{ lt: .1, type: 'shutter' }, { lt: s.cue('מספר'), type: 'glitch2' }, { lt: s.cue('מאמינים'), type: 'deep', k: .4 }],
};
S.freedom = {
  trans: 'whip',
  draw(ctx, s) {
    const a = s.cue('רכב'), b = s.cue('לטייל'), c = s.cue('חופש');
    montage(ctx, s, [{ id: '4204', at: -1, zoom: [1.1, 1.25] }, { id: '52427', at: a }, { id: '44495', at: b }], { dark: .2 });
    leak(ctx, s.t, .6, 2); shade(ctx);
    const lbl = [['המשכנתא', 0], ['רכב החלומות', a], ['לטייל בעולם', b]];
    lbl.forEach(([l, at], i) => { const nx = lbl[i + 1] ? lbl[i + 1][1] : c; if (s.lt >= at && s.lt < nx) tag(ctx, l, W / 2, 470, s.p(at, at + .25), { size: 58 }); });
    const p = s.p(c - .05, c + .4);
    if (p > 0) { ctx.fillStyle = `rgba(0,0,0,${.35 * p})`; ctx.fillRect(0, 0, W, H); kt(ctx, 'חופש.', W / 2, 820, p, { style: 'blur', size: 260, fam: SERIF, color: C.gold2, glow: 'rgba(245,196,81,.6)', glowR: 60 }); dust(ctx, s.t, { a: p }); }
  },
  events: s => [{ lt: s.cue('רכב'), type: 'shutter' }, { lt: s.cue('לטייל'), type: 'shutter' }, { lt: s.cue('חופש'), type: 'riser' }, { lt: s.cue('חופש'), type: 'impact', k: .7 }],
  music: s => [{ track: '587', from: 52, gain: .55, fade: .4 }],
};
S.questions = {
  trans: 'zoom',
  draw(ctx, s) {
    const a = s.cue('בלי'), Q = [['יש לי מספיק?', s.cue('מספיק')], ['איך אשלם שכירות?', s.cue('אשלם')], ['על איזה חלום אצטרך לוותר?', s.cue('חלום')]];
    montage(ctx, s, [{ id: '1053', at: -1, zoom: [1.05, 1.15] }, { id: '4513', at: a - .1, bw: .6 }], { dark: .3 });
    shade(ctx);
    if (s.lt < a) kt(ctx, 'מה שבא לכם, מתי שבא לכם', W / 2, 560, s.p(.1, .5), { style: 'rise', size: 70, w: 800 });
    Q.forEach(([q, at], i) => { const p = s.p(at - .15, at + .25); if (p <= 0) return;
      // notification-style bubbles stacking from the top
      card(ctx, p, 120, 430 + i * 165, 840, 135, (c, w, h) => { glass(c, 0, 0, w, h, 34, { fill: 'rgba(20,20,22,.88)', edge: 'rgba(255,255,255,.25)', edge2: 'rgba(255,255,255,.1)' });
        c.beginPath(); c.arc(w - 70, h / 2, 34, 0, 7); c.fillStyle = C.red; c.fill(); txt(c, '!', w - 70, h / 2 + 3, { size: 46, shadow: false });
        txt(c, q, w - 130, h / 2 + 3, { size: 48, w: 700, align: 'right', shadow: false }); }, { tilt: .3, from: .85 }); });
  },
  capStyle: { y: 1400 },
  events: s => [{ lt: s.cue('מספיק'), type: 'pop' }, { lt: s.cue('אשלם'), type: 'pop' }, { lt: s.cue('חלום'), type: 'pop' }, { lt: s.cue('לוותר'), type: 'heart' }],
  music: s => [{ fx: 'lpf', lt: s.cue('בלי'), dur: 99 }],
};
S.time = {
  trans: 'iris', caps: false,
  draw(ctx, s) {
    const a = s.cue('המשאב'), b = s.cue('זמן');
    clip(ctx, '28897', s.lt, { zoom: [1.0, 1.25], dur: 6, dark: .55 });
    kt(ctx, 'השיעור האמיתי', W / 2, 480, s.p(0, .4), { style: 'rise', size: 70, w: 700, color: C.dim });
    kt(ctx, 'הוא לא על כסף', W / 2, 580, s.p(s.cue('לא') - .05, s.cue('לא') + .3), { style: 'rise', size: 80, w: 800 });
    kt(ctx, 'המשאב היחיד שלא חוזר', W / 2, 1280, s.p(a - .05, a + .4), { style: 'rise', size: 64, w: 700 });
    kt(ctx, 'זמן.', W / 2, 1450, s.p(b - .05, b + .4), { style: 'blur', size: 220, fam: SERIF, color: C.gold2, glow: 'rgba(245,196,81,.55)', glowR: 60 });
  },
  events: s => [{ lt: 0, type: 'ticktock' }, { lt: s.cue('זמן'), type: 'deep', k: .5 }],
  music: s => [{ track: '188', from: 6, gain: .55, fade: .4 }],
};
S.loop = {
  trans: 'flash', caps: false,
  draw(ctx, s) {
    const steps = [['עבודה.', '918', 'עבודה'], ['בית.', '4180', 'בית'], ['טלוויזיה.', '26089', 'טלוויזיה'], ['שינה.', '31411', 'שינה'], ['ושוב.', '39786', 'ושוב']];
    const cues = steps.map(x => s.cue(x[2])), again = cues[4], pens = s.cue('הפנסיה'), q = s.cue('כמה');
    let shots = steps.map((x, i) => ({ id: x[1], at: i ? cues[i] : -1, zoom: [1.15, 1.0] }));
    // after "again" the cycle repeats faster and faster until retirement
    if (s.lt > again) { let t = again, d = .42, i = 0; shots = shots.slice(0, 4); while (t < q) { shots.push({ id: steps[i % 4][1], at: t, zoom: [1.1, 1.0] }); t += d; d = Math.max(.12, d * .8); i++; } }
    montage(ctx, s, shots, { dark: .35 });
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
    let cur = 0; cues.forEach((c, i) => { if (s.lt >= c) cur = i; });
    if (s.lt < pens - .1) kt(ctx, steps[cur][0], W / 2, 860, s.p(cues[cur] - .03, cues[cur] + .2), { style: 'stamp', size: 190, color: cur === 4 ? C.red : C.white });
    if (s.lt > again) { ctx.save(); ctx.translate(W / 2, 600); ctx.rotate(s.lt * 6); ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 5); ctx.stroke(); ctx.restore(); }
    kt(ctx, 'עד הפנסיה', W / 2, 860, s.p(pens - .05, pens + .3) * (1 - s.p(q - .2, q)), { style: 'stamp', size: 150, color: C.red });
    if (s.lt > q - .1) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H);
      kt(ctx, 'כמה שעות מהחיים', W / 2, 760, s.p(q - .1, q + .3), { style: 'rise', size: 90, w: 800 });
      kt(ctx, 'תתנו לזה לגנוב?', W / 2, 900, s.p(s.cue('תתנו') - .05, s.cue('תתנו') + .3), { style: 'rise', size: 100, fam: SERIF, color: C.gold2 }); }
  },
  events: s => [...['עבודה', 'בית', 'טלוויזיה', 'שינה'].map(w => ({ lt: s.cue(w), type: 'drum', k: .55 })), { lt: s.cue('ושוב'), type: 'alarm' }, { lt: s.cue('הפנסיה'), type: 'impact2', k: .7 }, { lt: s.cue('כמה'), type: 'tick' }],
  music: s => [{ track: '404', from: 30, gain: .5, fade: .05 }, { fx: 'drop', lt: s.cue('כמה') - .1, dur: s.d }],
};
S.ok = {
  trans: 'blur',
  draw(ctx, s) {
    clip(ctx, '42734', s.lt, { zoom: [1.05, 1.15], dur: 5, dark: .2 });
    shade(ctx);
    kt(ctx, 'וזה לגיטימי.', W / 2, 640, s.p(s.cue('לגיטימי') - .1, s.cue('לגיטימי') + .4), { style: 'blur', size: 110, fam: SERIF, color: C.white });
  },
  events: s => [{ lt: 0, type: 'heart' }],
  music: s => [{ track: '682', from: 0, gain: .45, fade: .4 }],
};
S.but = {
  trans: 'flash',
  draw(ctx, s) {
    const a = s.cue('תפסיקו'), b = s.cue('תרדפו'), c = s.cue('ותמצאו');
    clip(ctx, '41067', s.lt, { zoom: [1.2, 1.0], dur: 7, dark: .25 });
    leak(ctx, s.t, .4, 7); shade(ctx);
    card(ctx, s.p(a - .1, a + .35), 120, 440, 840, 520, (cx, w, h) => {
      glass(cx, 0, 0, w, h, 40);
      txt(cx, 'לרדוף אחרי כסף', w - 60, 110, { size: 62, w: 800, align: 'right', shadow: false });
      if (s.lt > a + .4) { strike(cx, w - 60 - 470, w - 60, 110, s.p(a + .4, a + .7), C.red, 12); icon(cx, 'x', 90, 110, 70 * E.back(s.p(a + .4, a + .7)), C.red); }
      const bp = s.p(b - .05, b + .3);
      if (bp > 0) { cx.save(); cx.globalAlpha = clamp(bp * 2); txt(cx, 'לרדוף אחרי בעיות', w - 60, 260, { size: 62, color: C.gold2, align: 'right', shadow: false }); icon(cx, 'check', 90, 260, 70 * E.back(bp), C.green); cx.restore(); }
      const cp = s.p(c - .05, c + .3);
      if (cp > 0) { cx.save(); cx.globalAlpha = clamp(cp * 2); txt(cx, 'ולמצוא להן פתרונות', w - 60, 400, { size: 62, color: C.gold2, align: 'right', shadow: false }); icon(cx, 'check', 90, 400, 70 * E.back(cp), C.green); cx.restore(); }
    }, { tilt: .5 });
  },
  capStyle: { y: 1330 },
  events: s => [{ lt: 0, type: 'impact', k: .8 }, { lt: s.cue('תפסיקו') + .4, type: 'buzzer', k: .4 }, { lt: s.cue('תרדפו'), type: 'correct', k: .6 }, { lt: s.cue('ותמצאו'), type: 'correct', k: .6 }],
  music: s => [{ track: '846', from: 60, gain: .55, fade: .02 }],
};
S.fail = {
  trans: 'split',
  draw(ctx, s) {
    const a = s.cue('להיכשל'), b = s.cue('מהר'), c = s.cue('ולהמשיך');
    montage(ctx, s, [{ id: '41045', at: -1, zoom: [1.1, 1.2] }, { id: '32809', at: a - .1, zoom: [1.2, 1.0] }], { dark: .3 });
    shade(ctx);
    // a jagged progress line: falls, gets up, ends higher
    const pts = [[0, .2], [.12, .35], [.2, .15], [.32, .4], [.42, .28], [.55, .55], [.63, .42], [.78, .7], [.86, .6], [1, .95]];
    const p = E.inOut(s.p(.2, s.d - .3)), x0 = 120, x1 = 960, y0 = 1080, y1 = 520;
    ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.shadowColor = C.gold; ctx.shadowBlur = 25; ctx.beginPath();
    for (const [u, v] of pts) { if (u > p) break; ctx.lineTo(lerp(x1, x0, u), lerp(y0, y1, v)); }
    ctx.stroke(); ctx.restore();
    kt(ctx, 'להיכשל.', W * .62, 470, s.p(a - .05, a + .3), { style: 'stamp', size: 130, color: C.red, rot: .2 });
    kt(ctx, 'מהר.', W * .3, 610, s.p(b - .05, b + .3), { style: 'stamp', size: 130, color: C.white, rot: -.2 });
    tag(ctx, 'ולהמשיך לדבר הבא →', W / 2, 1180, s.p(c - .05, c + .3), { size: 50 });
  },
  events: s => [{ lt: s.cue('להיכשל'), type: 'impact2', k: .7 }, { lt: s.cue('מהר'), type: 'drum', k: .6 }, { lt: s.cue('ולהמשיך'), type: 'whoosh' }],
};
S.job = {
  trans: 'push',
  draw(ctx, s) {
    const a = s.cue('בעיות'), b = s.cue('קלף');
    clip(ctx, '30009', s.lt, { zoom: [1.05, 1.2], dur: 5, dark: .3 });
    shade(ctx);
    tag(ctx, 'וגם בעבודה', W / 2, 430, s.p(0, .3), { size: 54 });
    card(ctx, s.p(a - .2, a + .3), 140, 540, 800, 420, (cx, w, h) => {
      glass(cx, 0, 0, w, h, 40);
      txt(cx, 'בעיות שפתרתם', w - 60, 70, { size: 44, w: 700, align: 'right', color: C.dim, shadow: false });
      const n = Math.floor(1 + 7 * E.out(s.p(a, b))); for (let i = 0; i < 8; i++) { const on = i < n;
        rr(cx, w - 100 - i * 85, 110, 60, 60, 14); cx.fillStyle = on ? C.gold : 'rgba(255,255,255,.08)'; cx.fill(); if (on) icon(cx, 'check', w - 70 - i * 85, 140, 36, C.ink); }
      txt(cx, 'משכורת', w - 60, 250, { size: 44, w: 700, align: 'right', color: C.dim, shadow: false });
      const sp = E.out(s.p(b - .2, b + .8)); rr(cx, 60, 290, w - 120, 50, 25); cx.fillStyle = 'rgba(255,255,255,.08)'; cx.fill();
      rr(cx, w - 60 - (w - 120) * (.35 + .55 * sp), 290, (w - 120) * (.35 + .55 * sp), 50, 25); cx.fillStyle = C.green; cx.fill();
      if (sp > 0) txt(cx, '↑', 90, 250, { size: 70, color: C.green, shadow: false, a: sp });
    }, { tilt: .5 });
  },
  capStyle: { y: 1330 },
  events: s => [{ lt: s.cue('בעיות'), type: 'pop' }, { lt: s.cue('קלף'), type: 'coins' }],
};
S.cta = {
  trans: 'zoom',
  draw(ctx, s) {
    endCard(ctx, s, { bg: '43785', teaserAt: 0, followAt: s.cue('תעקבו') - .1, share: s.cue('ותשלחו') - .05, next: '' });
  },
  capStyle: { y: 1530, size: 64 },
  events: s => [{ lt: 0, type: 'impact', k: .7 }, ...endEvents(s, { teaserAt: 0, followAt: s.cue('תעקבו') - .1, share: s.cue('ותשלחו') - .05 })],
  music: s => [{ track: '846', from: 80, gain: .6, fade: .2 }],
};

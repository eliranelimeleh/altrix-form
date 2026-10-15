// Part 1: השקר שמכרו לכם (prologue + "the lies you've been fed")
window.SCENES = {};
const S = window.SCENES;

// ---- the million / billion circles (one continuous camera over circle, grow, bezos) ----
const CIRC = [[1e6, '$1M'], [1e7, '$10M'], [1e8, '$100M'], [1e9, '$1B']];
const rOf = v => 60 * Math.sqrt(v / 1e6);
let CZ = null; // circle timeline in absolute seconds, filled in SETUP
window.SETUP = tl => {
  const g = id => tl.segments.find(s => s.id === id), wt = (seg, w, n = 1) => { let k = 0; for (const x of seg.words) if (x.w.includes(w) && ++k === n) return x.t0; return seg.t0; };
  const c = g('circle'), gr = g('grow'), bz = g('bezos');
  CZ = { c1: wt(c, 'העיגול'), m1: wt(c, 'מיליון'), m10: wt(gr, 'עשרה'), m100: wt(gr, 'מאה'), b1: wt(gr, 'מיליארד'), bz: bz.t0, x117: wt(bz, 'ושבע'), end: bz.t1 };
};
function circles(ctx, t) {
  blackBG(ctx, t, { glow: 'rgba(120,86,24,.25)' });
  const z = kf(t, [[CZ.m1, 1], [CZ.m10, 1], [CZ.m10 + .5, .9], [CZ.m100, .9], [CZ.m100 + .5, .55], [CZ.b1, .55], [CZ.b1 + .8, .2]], E.expo);
  const cx = W / 2, cy = 900;
  const shown = [CZ.c1, CZ.m10, CZ.m100, CZ.b1];
  for (let i = CIRC.length - 1; i >= 0; i--) {
    const at = shown[i]; if (t < at) continue;
    const q = E.back(prog(t, at, at + .45)), r = rOf(CIRC[i][0]) * z * q;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Math.max(r, 1), 0, 7);
    ctx.fillStyle = i === 0 ? 'rgba(245,196,81,.95)' : `rgba(245,196,81,${.05 + .04 * i})`; ctx.fill();
    ctx.lineWidth = i === 0 ? 0 : 4; ctx.strokeStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 30; if (i) ctx.stroke(); ctx.restore();
    const la = prog(t, at + .1, at + .4) * (i === 0 ? 1 - prog(t, CZ.m100, CZ.m100 + .3) : 1) * (i === 1 ? 1 - prog(t, CZ.b1, CZ.b1 + .3) : 1);
    if (la > 0) txt(ctx, CIRC[i][1], cx, i === 0 ? cy - r - 60 : cy - r + 70, { size: i === 3 ? 120 : 76, color: i === 0 ? C.gold2 : C.gold, a: la, fam: 'Rubik' });
  }
  ringFx(ctx, cx, cy, 300, prog(t, CZ.b1, CZ.b1 + .7));
}
S.circle = {
  caps: true,
  draw(ctx, s) { circles(ctx, s.t); },
  events: s => [{ lt: s.cue('העיגול'), type: 'pop' }, { lt: s.cue('מיליון'), type: 'coins' }],
  music: s => [{ track: '871', from: 18, gain: .55, fade: .05 }],
};
S.grow = {
  trans: 'cut',
  draw(ctx, s) { circles(ctx, s.t); },
  events: s => [{ lt: s.cue('עשרה'), type: 'pop' }, { lt: s.cue('מאה'), type: 'pop' }, { lt: s.cue('מיליארד'), type: 'riser' }, { lt: s.cue('מיליארד'), type: 'impact', k: 1.1 }],
};
S.bezos = {
  trans: 'cut',
  draw(ctx, s) {
    const t = s.t, x = s.cue('ושבע'), fade = s.p(0, .6);
    // the $1B circle shrinks into one dot of a 9x13 grid: 117 billions
    ctx.save(); ctx.globalAlpha = 1 - fade; circles(ctx, t); ctx.restore();
    ctx.save(); ctx.globalAlpha = fade; blackBG(ctx, t);
    const cols = 9, rows = 13, gx = 105, gy = 82, x0 = W / 2 - (cols - 1) * gx / 2, y0 = 470;
    for (let i = 0; i < 117; i++) {
      const c = i % cols, r = Math.floor(i / cols), appear = .2 + (r * cols + c) / 117 * (x - .4);
      const q = E.back(s.p(appear, appear + .3)); if (q <= 0) continue;
      ctx.beginPath(); ctx.arc(x0 + c * gx, y0 + r * gy, 26 * q, 0, 7); ctx.fillStyle = i === 0 ? C.gold2 : 'rgba(245,196,81,.75)'; ctx.fill();
    }
    ctx.restore();
    pill(ctx, 'כל עיגול = $1B', W / 2, 380, { a: s.p(.3, .7), size: 38, bg: 'rgba(0,0,0,.6)', color: C.gold });
    const st = s.p(x, x + .35);
    if (st > 0) { ctx.fillStyle = `rgba(0,0,0,${.55 * st})`; ctx.fillRect(0, 0, W, H); kt(ctx, '×117', W / 2, 900, st, { style: 'stamp', size: 300, color: C.gold, glow: 'rgba(245,196,81,.7)', fam: 'Rubik', rot: -.2 }); }
    sparks(ctx, W / 2, 900, s.p(x, x + .9), { n: 40, dist: 520 });
  },
  events: s => [{ lt: .3, type: 'typing' }, { lt: s.cue('ושבע'), type: 'impact2', k: 1.2 }],
};
S.you = {
  trans: 'blur',
  draw(ctx, s) {
    const c1 = s.cue('עבודה'), c2 = s.cue('חסכונות'), c3 = s.cue('וחוב');
    montage(ctx, s, [{ id: '4701', at: -1, zoom: [1.2, 1.05], dur: 3 }, { id: '28321', at: c1 }, { id: '18299', at: c2, zoom: [1.25, 1.1] }, { id: '4513', at: c3, zoom: [1.1, 1.2] }], { dark: .12 });
    shade(ctx);
    kt(ctx, 'ואז... יש אתכם', W / 2, 760, s.p(.0, .5) * (1 - s.p(c1 - .2, c1)), { style: 'blur', size: 110, fam: SERIF });
    // bank widget: savings almost empty, card debt full
    const wp = s.p(c2 - .1, c2 + .4); if (wp > 0) card(ctx, wp, 140, 560, 800, 300, (c, w, h) => {
      glass(c, 0, 0, w, h, 36);
      txt(c, 'חסכונות', w - 50, 80, { size: 46, w: 800, align: 'right', shadow: false });
      rr(c, 50, 130, w - 100, 34, 17); c.fillStyle = 'rgba(255,255,255,.1)'; c.fill();
      rr(c, w - 50 - (w - 100) * .04, 130, (w - 100) * .04, 34, 17); c.fillStyle = C.green; c.fill();
      const dp = E.out(s.p(c3, c3 + .8));
      txt(c, 'חוב באשראי', w - 50, 215, { size: 46, w: 800, align: 'right', shadow: false, a: s.p(c3 - .1, c3 + .2) });
      rr(c, 50, 245, w - 100, 34, 17); c.fillStyle = 'rgba(255,255,255,.1)'; c.fill();
      if (dp > 0) { rr(c, w - 50 - (w - 100) * .92 * dp, 245, (w - 100) * .92 * dp, 34, 17); c.fillStyle = C.red; c.fill(); }
    }, { tilt: .4 });
  },
  events: s => [{ lt: s.cue('עבודה'), type: 'shutter' }, { lt: s.cue('חסכונות'), type: 'pop' }, { lt: s.cue('וחוב'), type: 'buzzer', k: .5 }],
  music: s => [{ track: '614', from: 10, gain: .5, fade: .6 }],
};
S.dream = {
  trans: 'whip',
  draw(ctx, s) {
    const c1 = s.cue('נשמע'), c2 = s.cue('אז'), c3 = s.cue('המשחק');
    const m = montage(ctx, s, [{ id: '4280', at: -1, zoom: [1.05, 1.18] }, { id: '44545', at: c1 }, { id: '4204', at: c1 + (c2 - c1) / 2 }, { id: '4043', at: c2, bw: .9, dark: .3 }], {});
    if (s.lt < c2) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .25; ctx.fillStyle = '#ffd38a'; ctx.fillRect(0, 0, W, H); ctx.restore(); leak(ctx, s.t, .7, 3); }
    shade(ctx);
    kt(ctx, 'עושר?', W / 2, 760, s.p(0, .4) * (1 - s.p(c1 + .6, c1 + .9)), { style: 'blur', size: 190, fam: SERIF, color: C.gold2 });
    const g = s.p(c3, c3 + .3);
    if (g > 0) { ctx.fillStyle = `rgba(40,0,0,${.45 * g})`; ctx.fillRect(0, 0, W, H); kt(ctx, 'המשחק מכור', W / 2, 820, g, { style: 'stamp', size: 150, color: C.red, glow: 'rgba(255,61,61,.6)', rot: .25, tilt: -.06 }); }
  },
  events: s => [{ lt: s.cue('נשמע'), type: 'shutter' }, { lt: s.cue('אז'), type: 'heart' }, { lt: s.cue('המשחק'), type: 'impact', k: 1 }],
  music: s => [{ fx: 'lpf', lt: s.cue('אז'), dur: 99 }, { fx: 'drop', lt: s.d - .38, dur: .4 }],
};
S.twist = {
  trans: 'flash',
  draw(ctx, s) {
    const c1 = s.cue('משוואה'), c2 = s.cue('מדע');
    clip(ctx, '231', s.lt, { zoom: [1.25, 1.05], dur: 6, px: .1 });
    leak(ctx, s.t, .6, 5); shade(ctx);
    kt(ctx, 'אתם טועים.', W / 2, 640, s.p(s.cue('טועים') - .1, s.cue('טועים') + .3) * (1 - s.p(c1 - .3, c1)), { style: 'stamp', size: 150, color: C.white, rot: -.1 });
    const ep = s.p(c1 - .1, c1 + .5);
    if (ep > 0) card(ctx, ep, 130, 520, 820, 330, (c, w, h) => {
      glass(c, 0, 0, w, h, 40);
      txt(c, '?', w - 140, h / 2, { size: 190, color: C.gold, glow: 'rgba(245,196,81,.8)', fam: SERIF });
      txt(c, '=', w / 2 + 70, h / 2, { size: 130, color: C.white, shadow: false });
      txt(c, 'עושר', 200, h / 2 + 6, { size: 120, color: C.white, fam: SERIF });
      // a "science" scribble of formulas typing in under it
      kt(c, 'value × scale × time', w / 2, h - 36, s.p(c2, c2 + 1.2), { style: 'type', size: 30, w: 400, fam: 'JetBrains Mono', color: C.dim, shadow: false });
    }, { tilt: .5 });
  },
  events: s => [{ lt: 0, type: 'impact', k: .8 }, { lt: s.cue('משוואה'), type: 'pop' }, { lt: s.cue('מדע'), type: 'typing' }],
  music: s => [{ track: '404', from: 8.5, gain: .6, fade: .02 }],
};
S.myth = {
  trans: 'glitch',
  draw(ctx, s) {
    const c1 = s.cue('Wealth'), c2 = s.cue('שישים'), c3 = s.cue('בעצמם');
    if (s.lt < c1) {
      clip(ctx, '4043', s.lt, { zoom: [1.05, 1.2], dur: c1, bw: 1, dark: .25, tint: 'rgba(255,40,40,.0)' });
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,60,60,.55)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      shade(ctx);
      // film-strip cliché label
      tag(ctx, 'הקלישאה של הוליווד', W / 2, 420, s.p(.1, .5), { color: C.red });
      kt(ctx, 'רעים. מושחתים.', W / 2, 760, s.p(s.cue('כרעים') - .1, s.cue('כרעים') + .3), { style: 'stamp', size: 120, color: C.white, rot: .15 });
    } else {
      blackBG(ctx, s.t);
      const p = E.out(s.p(c2 - .2, c3)), cx = W / 2, cy = 820, r = 300;
      ctx.lineWidth = 46; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
      ctx.save(); ctx.strokeStyle = C.gold; ctx.shadowColor = C.gold; ctx.shadowBlur = 30; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * .68 * p); ctx.stroke(); ctx.restore();
      counter(ctx, 68 * p, cx, cy - 10, { size: 210, color: C.gold2, post: '%', fam: 'Rubik', glow: 'rgba(245,196,81,.5)' });
      txt(ctx, 'עשו את זה בעצמם', cx, cy + 130, { size: 50, w: 800, a: s.p(c3 - .1, c3 + .3), color: C.white, shadow: false });
      pill(ctx, 'Wealth-X · שווי $30M+', W / 2, 410, { a: s.p(c1, c1 + .4), size: 36, color: C.gold });
      sparks(ctx, cx, cy, s.p(c3, c3 + .8), { n: 36, dist: 420 });
    }
  },
  events: s => [{ lt: s.cue('כרעים'), type: 'impact2', k: .6 }, { lt: s.cue('Wealth'), type: 'whoosh' }, { lt: s.cue('שישים'), type: 'riser' }, { lt: s.cue('בעצמם'), type: 'impact', k: .9 }],
};
S.names = {
  trans: 'split',
  draw(ctx, s) {
    clip(ctx, '4180', s.lt, { zoom: [1.1, 1.25], dur: 6, rate: .6, dark: .6, bw: .7 });
    shade(ctx, { bot: .6 });
    const N = [['וורן באפט', 'וורן'], ['אופרה וינפרי', 'אופרה'], ["ג'ף בזוס", 'בזוס'], ['אילון מאסק', 'אילון']];
    N.forEach(([n, cue], i) => {
      const at = s.cue(cue) - .05, p = s.p(at, at + .35); if (p <= 0) return;
      const y = 470 + i * 150, out = s.p(s.cue('מה') - .2, s.cue('מה') + .2);
      card(ctx, p, 150, y - 60, 780, 120, (c, w, h) => {
        glass(c, 0, 0, w, h, 26, { fill: 'rgba(8,8,8,.78)' });
        txt(c, n, w - 40, h / 2 + 4, { size: 60, align: 'right', shadow: false });
        if (i === 1) txt(c, 'נולדה בעוני', 40, h / 2 + 4, { size: 34, w: 600, align: 'left', color: C.gold, shadow: false, a: s.p(s.cue('בעוני'), s.cue('בעוני') + .3) });
        else { c.save(); c.globalAlpha = s.p(at + .25, at + .5); rr(c, 30, h / 2 - 26, 180, 52, 26); c.fillStyle = C.gold; c.fill(); txt(c, 'SELF-MADE', 120, h / 2 + 2, { size: 26, color: C.ink, shadow: false }); c.restore(); }
      }, { tilt: .7, dir: i % 2 ? 1 : -1, from: .8 });
      if (out > 0) { ctx.fillStyle = `rgba(0,0,0,${.0})`; }
    });
    const q = s.p(s.cue('מה'), s.cue('מה') + .4);
    if (q > 0) { ctx.fillStyle = `rgba(0,0,0,${.6 * q})`; ctx.fillRect(0, 0, W, H); kt(ctx, '?', W / 2, 860, q, { style: 'pop', size: 520, color: C.gold, glow: 'rgba(245,196,81,.6)', fam: SERIF }); }
  },
  events: s => [...['וורן', 'אופרה', 'בזוס', 'אילון'].map(c => ({ lt: s.cue(c), type: 'drum', k: .5 })), { lt: s.cue('מה'), type: 'deep', k: .7 }],
};
S.equation = {
  trans: 'push',
  draw(ctx, s) {
    const c1 = s.cue('כסף'), c2 = s.cue('בעיה');
    clip(ctx, '918', s.lt, { zoom: [1.05, 1.2], dur: 5, dark: .35 });
    shade(ctx);
    tag(ctx, 'מה שלימדו אתכם', W / 2, 470, s.p(0, .4), { color: C.white });
    card(ctx, s.p(c1 - .1, c1 + .4), 110, 600, 860, 260, (c, w, h) => {
      glass(c, 0, 0, w, h, 40);
      txt(c, 'כסף = משכורת', w / 2, h / 2 + 6, { size: 112, fam: SERIF });
    }, { tilt: .5 });
    const sp = s.p(c2, c2 + .35);
    strike(ctx, 170, 910, 736, sp, C.red, 16);
    if (sp > 0) { icon(ctx, 'x', 900, 600, 120 * E.back(sp), C.red); tag(ctx, 'בעיה ענקית', W / 2, 960, s.p(c2 + .1, c2 + .5), { color: C.red }); }
  },
  events: s => [{ lt: s.cue('כסף'), type: 'pop' }, { lt: s.cue('בעיה'), type: 'buzzer', k: .7, hit: true }],
};
S.time = {
  trans: 'zoom', caps: false,
  draw(ctx, s) {
    const c1 = s.cue('זמן'), c2 = s.cue('ואותו');
    clip(ctx, '28901', s.lt, { zoom: [1.0, 1.15], dur: 5, rate: .7 });
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
    kt(ctx, 'המשאב הכי יקר שלכם', W / 2, 520, s.p(s.cue('המשאב') - .1, s.cue('המשאב') + .4), { style: 'rise', size: 70, w: 700 });
    kt(ctx, 'זמן.', W / 2, 1270, s.p(c1 - .05, c1 + .5), { style: 'blur', size: 300, fam: SERIF, color: C.gold2, glow: 'rgba(245,196,81,.55)', glowR: 60 });
    kt(ctx, 'ואותו אי אפשר להחזיר', W / 2, 1480, s.p(c2, c2 + .5), { style: 'rise', size: 62, w: 700, color: C.dim });
  },
  events: s => [{ lt: 0, type: 'ticktock' }, { lt: s.cue('זמן'), type: 'deep', k: .5 }],
  music: s => [{ track: '188', from: 6, gain: .55, fade: .3 }],
};
S.math = {
  trans: 'iris',
  draw(ctx, s) {
    const a = s.cue('עשרים'), b = s.cue('ארבעים'), c = s.cue('עשרים', 2), d = s.cue('לפני'), m = s.cue('מסים'), ex = s.cue('הוצאות'), inf = s.cue('ואינפלציה');
    clip(ctx, '4180', s.lt, { zoom: [1.2, 1.05], dur: 8, rate: 1.6, dark: .55, bw: .5 });
    card(ctx, s.p(a - .2, a + .3), 90, 380, 900, 700, (cx, w, h) => {
      glass(cx, 0, 0, w, h, 44, { fill: 'rgba(8,8,8,.84)' });
      const row = (y, l, v, p) => { if (p <= 0) return; cx.save(); cx.globalAlpha = clamp(p * 2);
        txt(cx, l, w - 50, y, { size: 44, w: 600, align: 'right', color: C.dim, shadow: false });
        txt(cx, v, 50, y, { size: 64, align: 'left', fam: 'Rubik', shadow: false, color: C.white }); cx.restore(); };
      row(80, 'שכר לשעה', '$20', s.p(a, a + .3));
      row(170, 'שעות בשבוע', '40', s.p(b, b + .3));
      // years counter + bar toward $1M
      const yp = E.inOut(s.p(c - .4, d - .1)), yrs = 24 * yp;
      cx.save(); cx.globalAlpha = s.p(c - .5, c);
      txt(cx, 'שנים עד מיליון', w - 50, 280, { size: 44, w: 600, align: 'right', color: C.dim, shadow: false });
      counter(cx, yrs, 50, 280, { size: 96, align: 'left', fam: 'Rubik', color: C.gold, shadow: false, fmt: n => n.toFixed(1) });
      rr(cx, 50, 360, w - 100, 40, 20); cx.fillStyle = 'rgba(255,255,255,.1)'; cx.fill();
      const shrink = .3 * E.out(s.p(m, m + .3)) + .25 * E.out(s.p(ex, ex + .3)) + .2 * E.out(s.p(inf, inf + .3));
      const fill = yp * (1 - shrink); rr(cx, w - 50 - (w - 100) * fill, 360, (w - 100) * fill, 40, 20); cx.fillStyle = C.gold; cx.fill();
      txt(cx, '$1,000,000', 60, 440, { size: 34, w: 700, align: 'left', color: C.gold, shadow: false, fam: 'Rubik' });
      cx.restore();
      [['מסים', m], ['הוצאות', ex], ['אינפלציה', inf]].forEach(([l, at], i) => {
        const p = s.p(at - .05, at + .3); if (p <= 0) return; const e = E.back(p);
        cx.save(); cx.translate(w - 160 - i * 290, 560); cx.scale(e, e); cx.rotate(-.06 + i * .05);
        rr(cx, -125, -44, 250, 88, 22); cx.fillStyle = C.red; cx.fill(); txt(cx, l, 0, 3, { size: 44, shadow: false }); cx.restore();
      });
    }, { tilt: .4, from: .7 });
  },
  events: s => [{ lt: s.cue('עשרים'), type: 'pop' }, { lt: s.cue('ארבעים'), type: 'pop' }, { lt: s.cue('עשרים', 2) - .3, type: 'riser' }, { lt: s.cue('מסים'), type: 'buzzer', k: .4 }, { lt: s.cue('הוצאות'), type: 'buzzer', k: .4 }, { lt: s.cue('ואינפלציה'), type: 'impact2', k: .6 }],
  music: s => [{ track: '404', from: 40, gain: .55, fade: .2 }],
};
S.trade = {
  trans: 'whip',
  draw(ctx, s) {
    const c1 = s.cue('תמורת');
    montage(ctx, s, [{ id: '39786', at: -1 }, { id: '34562', at: c1, zoom: [1.0, 1.15] }], { dark: .3 });
    shade(ctx);
    const p = s.p(.2, c1 + .6);
    kt(ctx, 'מכרתם', W / 2, 520, s.p(0, .4), { style: 'stamp', size: 120, color: C.red, rot: -.1 });
    counter(ctx, 49920 * E.out(p), W / 2, 760, { size: 170, fam: 'Rubik', color: C.white, a: s.p(.15, .4) });
    txt(ctx, 'שעות מהחיים', W / 2, 900, { size: 60, w: 700, color: C.dim, a: s.p(.3, .6) });
    txt(ctx, '24 שנים × 52 שבועות × 40 שעות', W / 2, 990, { size: 34, w: 500, color: C.dim, a: s.p(.6, 1), shadow: false });
  },
  events: s => [{ lt: 0, type: 'impact2', k: .7 }, { lt: .2, type: 'tick' }],
  music: s => [{ track: '614', from: 72, gain: .6, fade: .4 }],
};
S.cta = {
  trans: 'blur',
  draw(ctx, s) {
    endCard(ctx, s, { bg: '231', bgFrom: 3, teaserAt: s.cue('ובחלק') - .1, followAt: s.cue('תעקבו') - .1, next: R.spec.next.replace(/^חלק \d: /, '') });
    kt(ctx, 'משוואה אחרת', W / 2, 760, s.p(s.cue('משוואה') - .1, s.cue('משוואה') + .4) * (1 - s.p(s.cue('ובחלק') - .3, s.cue('ובחלק') - .1)), { style: 'mask', size: 130, fam: SERIF, color: C.gold2 });
  },
  capStyle: { y: 1400, size: 76 },
  events: s => [{ lt: s.cue('משוואה'), type: 'whoosh' }, ...endEvents(s, { teaserAt: s.cue('ובחלק') - .1, followAt: s.cue('תעקבו') - .1 })],
  music: s => [{ track: '846', from: 78, gain: .6, fade: .5 }],
};

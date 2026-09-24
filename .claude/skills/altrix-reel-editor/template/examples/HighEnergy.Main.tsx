import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import {CHUNKS, SPEECH_END} from './captions';

/*
 * Altrix reel #2 (desktop MT5 recording, 55s). Built on the house template, plus:
 * a "wait wait wait" shock hook, full-screen motion-graphic scenes that take over the long
 * static stretches of the trading terminal, trade tickets popping on "opens/closes/buys/sells",
 * screen shake, and a denser sound-design layer.
 */

export const FPS = 30;
export const W = 1080;
export const H = 1920;
const VIDEO_END = 54.87;
const OUTRO_START = 53.9;
const LOGO_SLAM = OUTRO_START + 0.5;
export const TOTAL = LOGO_SLAM + 2.9;

const PURPLE = '#9B4DFF';
const PURPLE_LIGHT = '#D6A8FF';
const GOLD = '#FFD84D';
const GREEN = '#2BFF7A';
const RED = '#FF3355';
const WA = '#25D366';
const FONT = 'Heebo, sans-serif';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const useT = () => useCurrentFrame() / FPS;

// ---------- camera ----------
type Cam = {s: number; fx: number; fy: number; tx: number; ty: number};
const BASE: Cam = {s: 1, fx: 0.5, fy: 0.5, tx: 0.5, ty: 0.5};
const BASE_S = 1.0;
const SHOTS: {a: number; b: number; cam: Cam}[] = [
  {a: 2.0, b: 4.1, cam: {s: 1.8, fx: 0.82, fy: 0.42, tx: 0.5, ty: 0.42}}, // falling "bad" chart
  {a: 4.15, b: 7.3, cam: {s: 1.25, fx: 0.6, fy: 0.3, tx: 0.5, ty: 0.4}}, // "oy vey" pull back
  {a: 9.6, b: 12.4, cam: {s: 1.9, fx: 0.5, fy: 0.19, tx: 0.5, ty: 0.36}}, // live chart
  {a: 12.4, b: 16.5, cam: {s: 1.6, fx: 0.72, fy: 0.62, tx: 0.5, ty: 0.42}}, // trades table, TP column
  {a: 18.6, b: 22.4, cam: {s: 1.8, fx: 0.78, fy: 0.64, tx: 0.5, ty: 0.42}}, // green TP rows
  {a: 22.45, b: 27.45, cam: {s: 1.6, fx: 0.23, fy: 0.13, tx: 0.5, ty: 0.36}}, // +16.55k circle
  {a: 27.5, b: 31.6, cam: {s: 1.7, fx: 0.55, fy: 0.2, tx: 0.5, ty: 0.36}}, // chart peek
  {a: 35.5, b: 38.3, cam: {s: 1.5, fx: 0.62, fy: 0.64, tx: 0.5, ty: 0.42}}, // table
  {a: 45.6, b: 49.6, cam: {s: 1.6, fx: 0.5, fy: 0.2, tx: 0.5, ty: 0.36}}, // chart
  {a: 52.4, b: 53.9, cam: {s: 1.4, fx: 0.5, fy: 0.3, tx: 0.5, ty: 0.4}},
];
const PUNCHES = [3.38, 6.62, 12.64, 13.2, 19.04, 19.48, 20.94, 21.92, 22.28, 24.48, 36.1, 36.38, 36.86, 37.08, 48.34, 53.34];
const CUTS = [7.3, 16.5, 22.35, 27.5, 31.6, 35.5, 38.3, 42.7, 45.6, 49.6, 52.4];
// screen shake moments: [time, strength px]
const SHAKES: [number, number][] = [[0, 26], [0.9, 30], [1.12, 40], [4.16, 34], [4.72, 18], [5.16, 18], [7.62, 30], [20.94, 16], [21.92, 20], [22.28, 30], [24.48, 22], [41.72, 18], [53.34, 26]];

const camAt = (t: number): Cam => {
  const drift = interpolate(t, [0, VIDEO_END], [BASE_S, BASE_S + 0.08]);
  let c: Cam = {...BASE, s: drift};
  for (const sh of SHOTS) {
    const w = Math.min(
      interpolate(t, [sh.a - 0.2, sh.a + 0.25], [0, 1], {...clamp, easing: ease}),
      interpolate(t, [sh.b - 0.3, sh.b + 0.1], [1, 0], {...clamp, easing: ease}),
    );
    if (w > 0) {
      c = {
        s: c.s + (sh.cam.s - c.s) * w, fx: c.fx + (sh.cam.fx - c.fx) * w, fy: c.fy + (sh.cam.fy - c.fy) * w,
        tx: c.tx + (sh.cam.tx - c.tx) * w, ty: c.ty + (sh.cam.ty - c.ty) * w,
      };
    }
  }
  let punch = 0;
  for (const p of [...PUNCHES, ...CUTS]) if (t >= p && t < p + 0.5) punch += 0.06 * Math.exp(-(t - p) * 9);
  c.s *= 1 + punch;
  return c;
};

const shakeAt = (t: number) => {
  let x = 0, y = 0, r = 0;
  for (const [p, k] of SHAKES) {
    const d = t - p;
    if (d < 0 || d > 0.5) continue;
    const a = k * Math.exp(-d * 9);
    x += a * Math.sin(d * 97); y += a * Math.cos(d * 83); r += a * 0.04 * Math.sin(d * 61);
  }
  return `translate(${x}px, ${y}px) rotate(${r}deg)`;
};

const Background: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2a0f4d 0%, #0c0618 55%, #05030a 100%)'}} />
);

const Footage: React.FC = () => {
  const t = useT();
  const c = camAt(t);
  const left = Math.min(0, Math.max(W - W * c.s, c.tx * W - c.fx * W * c.s));
  const top = Math.min(0, Math.max(H - H * c.s, c.ty * H - c.fy * H * c.s));
  let blur = 0;
  for (const p of CUTS) blur += Math.max(0, 1 - Math.abs(t - p) / 0.12) * 12;
  const outroFade = interpolate(t, [OUTRO_START, LOGO_SLAM], [1, 0], clamp);
  const outroZoom = interpolate(t, [OUTRO_START, LOGO_SLAM], [1, 1.5], {...clamp, easing: Easing.in(Easing.cubic)});
  // hook: the "bad" chart gets a red alarm tint that pulses
  const alarm = t < 7.3 ? interpolate(t, [1.5, 2.2, 6.8, 7.3], [0, 1, 1, 0], clamp) * (0.55 + 0.45 * Math.abs(Math.sin(t * 5))) : 0;
  return (
    <AbsoluteFill style={{opacity: outroFade, transform: `scale(${outroZoom})`, filter: `blur(${blur + (1 - outroFade) * 20}px)`}}>
      <div style={{position: 'absolute', left, top, width: W * c.s, height: H * c.s}}>
        <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
      </div>
      <AbsoluteFill style={{background: `radial-gradient(circle, transparent 35%, ${RED}aa 100%)`, opacity: alarm}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,4,22,0.55) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 52%, rgba(10,4,22,0.65) 76%, rgba(10,4,22,0.8) 100%)'}} />
    </AbsoluteFill>
  );
};

const CutFlash: React.FC = () => {
  const t = useT();
  let a = 0;
  for (const p of CUTS) a = Math.max(a, 1 - Math.abs(t - p) / 0.1);
  a = Math.max(a, interpolate(t, [LOGO_SLAM - 0.03, LOGO_SLAM, LOGO_SLAM + 0.3], [0, 1, 0], clamp));
  return <AbsoluteFill style={{background: `radial-gradient(circle, ${PURPLE_LIGHT} 0%, ${PURPLE} 60%)`, opacity: a * 0.55, mixBlendMode: 'screen'}} />;
};

const E: React.FC<{c: string}> = ({c}) => (
  <Img src={staticFile(`emoji/${c}.svg`)} style={{height: '0.95em', width: '0.95em', verticalAlign: '-0.12em', margin: '0 0.08em'}} />
);
const BigE: React.FC<{c: string; size: number; style?: React.CSSProperties}> = ({c, size, style}) => (
  <Img src={staticFile(`emoji/${c}.svg`)} style={{width: size, height: size, ...style}} />
);

// ---------- captions ----------
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const chunk = CHUNKS.find((c) => t >= c.start && t < c.end);
  if (!chunk || t > SPEECH_END) return null;
  const local = f - Math.round(chunk.start * fps);
  const pop = spring({frame: local, fps, config: {damping: 12, stiffness: 220, mass: 0.6}});
  const out = interpolate(t, [chunk.end - 0.08, chunk.end], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 1210, left: 24, right: 24, display: 'flex', justifyContent: 'center'}}>
      <div style={{direction: 'rtl', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px',
        transform: `scale(${interpolate(pop, [0, 1], [0.6, 1])}) translateY(${(1 - pop) * 40}px)`, opacity: Math.min(pop * 1.5, 1) * out}}>
        {chunk.words.map((w, i) => {
          const active = t >= w.start && t < w.end;
          const shown = t >= w.start - 0.05;
          const wp = spring({frame: f - Math.round(w.start * fps), fps, config: {damping: 10, stiffness: 300, mass: 0.5}});
          return (
            <span key={i} style={{
              fontFamily: FONT, fontWeight: 900, fontSize: chunk.words.reduce((n, x) => n + x.text.length, 0) > 13 ? 82 : 96, lineHeight: 1.15,
              color: w.hi ? GOLD : '#fff', padding: '0 14px', borderRadius: 18,
              background: active ? `linear-gradient(135deg, ${PURPLE} 0%, #6A1BE0 100%)` : 'transparent',
              boxShadow: active ? `0 0 40px ${PURPLE}cc` : 'none',
              WebkitTextStroke: active ? '0px' : '12px #0b0414', paintOrder: 'stroke fill',
              textShadow: w.hi ? `0 0 28px ${GOLD}88, 0 6px 0 #00000066` : '0 6px 0 #00000066',
              opacity: shown ? 1 : 0.45,
              transform: `scale(${active ? 1 + 0.12 * wp - 0.04 * Math.max(0, wp - 1) : 1})`,
              unicodeBidi: 'isolate', display: 'inline-block',
            }}>{w.text}</span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- cards ----------
const Card: React.FC<{from: number; to: number; top: number; children: React.ReactNode; accent?: string}> = ({from, to, top, children, accent = PURPLE}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < from || t > to + 0.3) return null;
  const inS = spring({frame: f - Math.round(from * FPS), fps: FPS, config: {damping: 11, stiffness: 180, mass: 0.7}});
  const outS = interpolate(t, [to, to + 0.25], [0, 1], {...clamp, easing: Easing.in(Easing.back(2))});
  const float = Math.sin(t * 3) * 6;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center',
      transform: `translateY(${float - outS * 60}px) scale(${interpolate(inS, [0, 1], [0.3, 1]) * (1 - outS * 0.4)}) rotate(${(1 - inS) * -8}deg)`,
      opacity: Math.min(1, inS * 2) * (1 - outS)}}>
      <div style={{direction: 'rtl', fontFamily: FONT, color: '#fff', textAlign: 'center', padding: '26px 48px', borderRadius: 36,
        background: 'linear-gradient(145deg, rgba(40,14,78,0.92), rgba(12,5,26,0.92))',
        border: `3px solid ${accent}`, boxShadow: `0 0 60px ${accent}99, inset 0 0 40px ${accent}33`}}>
        {children}
      </div>
    </div>
  );
};

const Counter: React.FC<{from: number; value: number; dur?: number; decimals?: number; size?: number}> = ({from, value, dur = 1.1, decimals = 2, size = 128}) => {
  const t = useT();
  const v = interpolate(t, [from, from + dur], [0, value], {...clamp, easing: Easing.out(Easing.cubic)});
  const done = t >= from + dur;
  const glow = done ? interpolate(t, [from + dur, from + dur + 0.4], [1.25, 1], clamp) : 1;
  return (
    <div style={{direction: 'ltr', fontWeight: 900, fontSize: size, lineHeight: 1, color: '#6BFF9E', transform: `scale(${glow})`,
      textShadow: `0 0 40px ${GREEN}aa, 0 0 90px ${GREEN}55`, fontVariantNumeric: 'tabular-nums'}}>
      +${v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}
    </div>
  );
};

const Burst: React.FC<{at: number; seed: string; emojis?: string[]; y0?: number; n?: number}> = ({at, seed, emojis = ['1f4b0', '1f4b5', '1f4b8', '1fa99'], y0 = 1050, n = 26}) => {
  const t = useT() - at;
  if (t < 0 || t > 2.2) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(n).fill(0).map((_, i) => {
        const ang = -Math.PI / 2 + (random(seed + i) - 0.5) * 2.2;
        const sp = 500 + random(seed + 'v' + i) * 900;
        const x = W / 2 + Math.cos(ang) * sp * t;
        const y = y0 + Math.sin(ang) * sp * t * 1.3 + 1100 * t * t;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 70 + random(seed + 's' + i) * 50,
          transform: `rotate(${t * 400 * (random(seed + 'r' + i) - 0.5)}deg)`, opacity: interpolate(t, [0, 1.5, 2.2], [1, 1, 0], clamp)}}>
          <Img src={staticFile(`emoji/${emojis[i % emojis.length]}.svg`)} style={{width: '100%'}} /></div>;
      })}
    </AbsoluteFill>
  );
};

const Label: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 46, color = PURPLE_LIGHT}) => (
  <div style={{fontWeight: 800, fontSize: size, color, lineHeight: 1.2}}>{children}</div>
);

// Sticker text that slams onto the screen (hook "רגע!", "לבד!", "תנו בראש")
const Slam: React.FC<{at: number; to: number; x: number; y: number; rot: number; size: number; color?: string; bg?: string; children: React.ReactNode}> = ({at, to, x, y, rot, size, color = '#fff', bg = RED, children}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < at || t > to + 0.2) return null;
  const s = spring({frame: f - Math.round(at * FPS), fps: FPS, config: {damping: 9, stiffness: 260, mass: 0.6}});
  const out = interpolate(t, [to, to + 0.2], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${interpolate(s, [0, 1], [3, 1]) * (0.8 + 0.2 * out)})`,
      opacity: Math.min(1, s * 3) * out, direction: 'rtl', fontFamily: FONT, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap',
      background: bg, padding: '6px 38px', borderRadius: 22, border: '6px solid #fff', boxShadow: `0 14px 0 #00000055, 0 0 60px ${bg}aa`}}>
      {children}
    </div>
  );
};

// Trade ticket that pops on "פותח / וסוגר / קונה / ומוכר"
const Ticket: React.FC<{at: number; side: 'BUY' | 'SELL' | 'CLOSE'; x: number; y: number; profit?: string}> = ({at, side, x, y, profit}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const life = 1.4;
  if (t < at || t > at + life) return null;
  const s = spring({frame: f - Math.round(at * FPS), fps: FPS, config: {damping: 10, stiffness: 240, mass: 0.5}});
  const out = interpolate(t, [at + life - 0.3, at + life], [1, 0], clamp);
  const col = side === 'SELL' ? RED : side === 'BUY' ? GREEN : GOLD;
  return (
    <div style={{position: 'absolute', left: x, top: y - (1 - out) * 80, transform: `translate(-50%, -50%) scale(${s})`, opacity: out,
      fontFamily: FONT, direction: 'ltr', background: 'rgba(12,5,26,0.94)', border: `4px solid ${col}`, borderRadius: 26, padding: '16px 30px',
      boxShadow: `0 0 50px ${col}88`, display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{background: col, color: '#0b0414', fontWeight: 900, fontSize: 44, padding: '4px 18px', borderRadius: 12}}>{side}</div>
      <div style={{color: '#fff', fontWeight: 800, fontSize: 44}}>XAUUSD</div>
      {profit && <div style={{color: '#6BFF9E', fontWeight: 900, fontSize: 48}}>{profit}</div>}
    </div>
  );
};

// ---------- full-screen motion-graphic scenes (cover the static terminal) ----------
const Scene: React.FC<{from: number; to: number; children: React.ReactNode; tint?: string}> = ({from, to, children, tint = PURPLE}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const inP = interpolate(t, [from, from + 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const outP = interpolate(t, [to, to + 0.3], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const grid = (t * 120) % 120;
  return (
    <AbsoluteFill style={{clipPath: `circle(${inP * 125}% at 50% 42%)`, opacity: 1 - outP, transform: `scale(${1 + outP * 0.2})`, background: '#0c0618'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, ${tint}66 0%, #12062a 45%, #05030a 100%)`}} />
      <AbsoluteFill style={{opacity: 0.35, backgroundImage: `linear-gradient(${tint}55 2px, transparent 2px), linear-gradient(90deg, ${tint}55 2px, transparent 2px)`,
        backgroundSize: '120px 120px', backgroundPosition: `0 ${grid}px`, transform: 'perspective(900px) rotateX(55deg) scale(2.2)', transformOrigin: '50% 100%', top: 700}} />
      {new Array(22).fill(0).map((_, i) => {
        const x = random('px' + i) * W;
        const y = (random('py' + i) * H - t * (60 + random('ps' + i) * 120)) % H;
        return <div key={i} style={{position: 'absolute', left: x, top: y < 0 ? y + H : y, width: 8, height: 8, borderRadius: 4,
          background: i % 3 ? PURPLE_LIGHT : GOLD, opacity: 0.5, boxShadow: `0 0 12px ${PURPLE_LIGHT}`}} />;
      })}
      <AbsoluteFill style={{direction: 'rtl', fontFamily: FONT, color: '#fff', textAlign: 'center'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Pop: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties; from?: number}> = ({at, children, style, from = 0.2}) => {
  const f = useCurrentFrame();
  const s = spring({frame: f - Math.round(at * FPS), fps: FPS, config: {damping: 10, stiffness: 200, mass: 0.6}});
  return <div style={{...style, transform: `${style?.transform ?? ''} scale(${interpolate(s, [0, 1], [from, 1])})`, opacity: Math.min(1, s * 2)}}>{children}</div>;
};

const Rings: React.FC<{color?: string}> = ({color = PURPLE}) => {
  const t = useT();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const p = ((t * 0.8 + i / 3) % 1);
        return <div key={i} style={{position: 'absolute', left: W / 2, top: 560, width: 300 + p * 700, height: 300 + p * 700, borderRadius: '50%',
          border: `6px solid ${color}`, opacity: (1 - p) * 0.7, transform: 'translate(-50%, -50%)'}} />;
      })}
    </>
  );
};

const SceneAuto: React.FC = () => {
  const t = useT();
  return (
    <Scene from={7.3} to={9.6}>
      <Rings />
      <Pop at={7.4} style={{position: 'absolute', left: W / 2 - 170, top: 390, transform: `rotate(${Math.sin(t * 6) * 6}deg)`}}><BigE c="1f916" size={340} /></Pop>
      <Pop at={7.62} style={{position: 'absolute', top: 800, left: 0, right: 0}}>
        <div style={{fontWeight: 900, fontSize: 124, lineHeight: 1, color: GOLD, textShadow: `0 0 50px ${GOLD}99`}}>מסחר אוטומטי</div>
      </Pop>
      <Pop at={8.2} style={{position: 'absolute', top: 960, left: 0, right: 0}}>
        <div style={{fontWeight: 800, fontSize: 48, color: PURPLE_LIGHT, letterSpacing: 6, direction: 'ltr'}}>ALTRIX · GOLD BOT</div>
      </Pop>
    </Scene>
  );
};

const SceneZero: React.FC = () => {
  const t = useT();
  return (
    <Scene from={16.5} to={18.6}>
      <Pop at={16.55} style={{position: 'absolute', top: 170, left: 0, right: 0}}>
        <div style={{fontWeight: 900, fontSize: 520, lineHeight: 1, color: '#fff', textShadow: `0 0 80px ${PURPLE}`, direction: 'ltr'}}>0</div>
      </Pop>
      <Pop at={16.8} style={{position: 'absolute', left: 640, top: 250, transform: `rotate(${12 + Math.sin(t * 4) * 5}deg)`}}><BigE c="1f60e" size={230} /></Pop>
      <Pop at={17.0} style={{position: 'absolute', top: 830, left: 0, right: 0}}>
        <div style={{fontWeight: 900, fontSize: 104, color: GOLD, textShadow: `0 0 40px ${GOLD}88`}}>התעסקות</div>
      </Pop>
    </Scene>
  );
};

const SceneRobot: React.FC = () => {
  const t = useT();
  const icons = ['1f4c8', '1f4b0', '2699', '23f0', '1f3c6'];
  return (
    <Scene from={31.6} to={35.5}>
      <Rings />
      <Pop at={31.7} style={{position: 'absolute', left: W / 2 - 160, top: 400}}><BigE c="1f916" size={320} /></Pop>
      {icons.map((c, i) => {
        const a = t * 1.6 + (i / icons.length) * Math.PI * 2;
        return <Pop key={c} at={31.9 + i * 0.12} style={{position: 'absolute', left: W / 2 + Math.cos(a) * 380 - 65, top: 560 + Math.sin(a) * 250 - 65}}>
          <BigE c={c} size={130} /></Pop>;
      })}
      <Pop at={33.9} style={{position: 'absolute', top: 900, left: 0, right: 0}}>
        <div style={{fontWeight: 900, fontSize: 96}}>עושה הכל <span style={{color: GOLD}}>לבד</span></div>
      </Pop>
    </Scene>
  );
};

const SceneGift: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const n = Math.round(interpolate(t, [41.0, 41.72], [1, 10], clamp));
  const bounce = Math.abs(Math.sin(t * 5)) * 30;
  return (
    <Scene from={38.3} to={42.7} tint="#C9A227">
      <Pop at={38.4} style={{position: 'absolute', left: W / 2 - 180, top: 230 - bounce}}><BigE c="1f381" size={360} /></Pop>
      <Pop at={40.68} style={{position: 'absolute', top: 580, left: 0, right: 0}}>
        <div style={{fontWeight: 900, fontSize: 130, color: GREEN, textShadow: `0 0 50px ${GREEN}99`}}>בחינם!</div>
      </Pop>
      {t >= 41.0 && (
        <Pop at={41.0} style={{position: 'absolute', top: 830, left: 0, right: 0}}>
          <div style={{fontWeight: 900, fontSize: 150, lineHeight: 1, color: GOLD, textShadow: `0 0 50px ${GOLD}aa`}}>
            <span style={{direction: 'ltr', display: 'inline-block', fontVariantNumeric: 'tabular-nums'}}>{n}</span> ימים
          </div>
        </Pop>
      )}
      <Burst at={41.72} seed="gift" emojis={['1f389', '2b50', '1f381', '1f4b0']} y0={900} />
    </Scene>
  );
};

const SceneWhatsApp: React.FC = () => {
  const bubbles: {at: number; text: React.ReactNode}[] = [
    {at: 43.0, text: <>הצטרפו לקבוצה {<E c="1f4f2" />}</>},
    {at: 43.8, text: <>{<E c="1f381" />} 10 ימי ניסיון בחינם</>},
    {at: 44.9, text: <>{<E c="2705" />} תוצאות בזמן אמת</>},
  ];
  return (
    <Scene from={42.7} to={45.6} tint={WA}>
      <Pop at={42.75} style={{position: 'absolute', left: 190, top: 150, width: 700, height: 980, borderRadius: 60, background: '#0b141a',
        border: '10px solid #1f2c34', boxShadow: `0 0 90px ${WA}66`, overflow: 'hidden'}}>
        <div style={{background: '#1f2c34', height: 150, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 20, padding: '0 34px'}}>
          <div style={{width: 90, height: 90, borderRadius: 45, background: WA, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50}}>{<E c="1f916" />}</div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 800, fontSize: 42}}>Altrix Gold Bot</div>
            <div style={{fontWeight: 400, fontSize: 30, color: '#8696a0'}}>קבוצת וואטסאפ</div>
          </div>
        </div>
        {bubbles.map((b, i) => (
          <Pop key={i} at={b.at} from={0.5} style={{position: 'absolute', right: 30, top: 200 + i * 170, maxWidth: 600, background: '#005c4b',
            borderRadius: '30px 0 30px 30px', padding: '22px 30px', fontWeight: 800, fontSize: 46, textAlign: 'right'}}>{b.text}</Pop>
        ))}
      </Pop>
    </Scene>
  );
};

const SceneChecklist: React.FC = () => {
  const items: [number, string][] = [[49.78, 'תנסו'], [50.38, 'תבדקו'], [51.4, 'תראו אם זה מתאים לכם']];
  return (
    <Scene from={49.6} to={52.4}>
      <div style={{position: 'absolute', top: 260, left: 110, right: 110}}>
        {items.map(([at, txt], i) => (
          <Pop key={i} at={at} from={0.4} style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 60, background: 'rgba(40,14,78,0.9)',
            border: `3px solid ${PURPLE}`, borderRadius: 30, padding: '26px 40px', boxShadow: `0 0 50px ${PURPLE}77`}}>
            <BigE c="2705" size={100} />
            <div style={{fontWeight: 900, fontSize: i === 2 ? 64 : 84}}>{txt}</div>
          </Pop>
        ))}
      </div>
    </Scene>
  );
};

// Scanner line sweeping the trades table while "he opens and closes all trades"
const Scanner: React.FC<{from: number; to: number}> = ({from, to}) => {
  const t = useT();
  if (t < from || t > to) return null;
  const p = ((t - from) / 1.3) % 1;
  return <div style={{position: 'absolute', left: 0, right: 0, top: 380 + p * 700, height: 14, background: `linear-gradient(90deg, transparent, ${GREEN}, transparent)`,
    boxShadow: `0 0 40px ${GREEN}`, opacity: interpolate(t, [from, from + 0.2, to - 0.2, to], [0, 0.9, 0.9, 0], clamp)}} />;
};

const Overlays: React.FC = () => {
  const t = useT();
  return (
    <>
      <Burst at={25.7} seed="big" />
      {/* hook */}
      <Slam at={0.0} to={1.55} x={330} y={560} rot={-10} size={130}>רגע!</Slam>
      <Slam at={0.9} to={1.55} x={740} y={820} rot={8} size={150}>רגע!</Slam>
      <Slam at={1.12} to={1.55} x={540} y={1090} rot={-4} size={190}>רגע! <E c="270b" /></Slam>
      {t >= 3.3 && t < 4.15 && (
        <Pop at={3.38} style={{position: 'absolute', left: 700, top: 250, transform: `rotate(${Math.sin(t * 8) * 8}deg)`}}><BigE c="1f4c9" size={220} /></Pop>
      )}
      {t >= 4.16 && t < 6.5 && (
        <Pop at={4.16} style={{position: 'absolute', left: W / 2 - 200, top: 330, transform: `rotate(${Math.sin(t * 20) * 6}deg)`}}><BigE c="1f631" size={400} /></Pop>
      )}
      {t >= 4.16 && t < 6.5 && (
        <>
          <Pop at={4.3} style={{position: 'absolute', left: 90, top: 200, opacity: Math.floor(t * 6) % 2 ? 1 : 0.4}}><BigE c="1f6a8" size={150} /></Pop>
          <Pop at={4.4} style={{position: 'absolute', left: 840, top: 200, opacity: Math.floor(t * 6) % 2 ? 0.4 : 1}}><BigE c="1f6a8" size={150} /></Pop>
        </>
      )}
      <Slam at={6.62} to={7.25} x={540} y={640} rot={-3} size={120} bg={PURPLE}>תתקדמו <E c="1f680" /></Slam>

      <Card from={11.2} to={12.5} top={210} accent={GOLD}>
        <div style={{fontWeight: 900, fontSize: 80}}>{<E c="23f0" />} כל היום</div>
        <Label>הבוט עובד בזמן שאתם לא</Label>
      </Card>
      <Ticket at={12.64} side="BUY" x={380} y={560} />
      <Ticket at={13.2} side="CLOSE" x={640} y={760} profit="+$4.99" />
      <Ticket at={13.82} side="SELL" x={420} y={960} />
      <Ticket at={19.04} side="BUY" x={600} y={420} />
      <Ticket at={19.48} side="CLOSE" x={460} y={600} profit="+$7.38" />
      <Scanner from={18.7} to={22.3} />
      <Slam at={20.94} to={22.4} x={300} y={520} rot={-9} size={110} bg={PURPLE}>לבד!</Slam>
      <Slam at={21.92} to={22.4} x={770} y={720} rot={7} size={130} bg={PURPLE}>לבד!</Slam>
      <Slam at={22.28} to={22.4} x={540} y={930} rot={-3} size={160} bg={PURPLE}>לבד!</Slam>

      <Card from={23.25} to={27.3} top={120} accent={RED}>
        <div style={{fontWeight: 900, fontSize: 56, display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center'}}>
          <span style={{width: 26, height: 26, borderRadius: 13, background: RED, boxShadow: `0 0 20px ${RED}`, display: 'inline-block', opacity: Math.floor(t * 3) % 2 ? 1 : 0.35}} />
          תיק LIVE · לא דמו
        </div>
      </Card>
      <Card from={24.4} to={27.35} top={590} accent={GREEN}>
        <Label>{<E c="1f3c6" />} רווח כולל</Label>
        <Counter from={24.48} value={16550} dur={1.2} decimals={0} size={140} />
      </Card>
      <Card from={28.9} to={31.4} top={870} accent={PURPLE}>
        <div style={{fontWeight: 900, fontSize: 70}}>{<E c="1f440" />} רק מציצים מדי פעם</div>
      </Card>
      <Ticket at={36.1} side="BUY" x={380} y={500} />
      <Ticket at={36.38} side="SELL" x={690} y={680} />
      <Ticket at={36.86} side="BUY" x={400} y={860} />
      <Ticket at={37.08} side="SELL" x={680} y={1040} />
      <Card from={46.9} to={47.95} top={220} accent={GREEN}>
        <div style={{fontWeight: 900, fontSize: 84, color: '#6BFF9E'}}>{<E c="1f381" />} בחינם · 10 ימים</div>
      </Card>
      <Card from={48.25} to={49.55} top={220} accent={RED}>
        <div style={{fontWeight: 900, fontSize: 84}}>{<E c="23f3" />} אל תפספסו!</div>
      </Card>
      <Slam at={52.7} to={53.85} x={540} y={620} rot={-5} size={130} bg={PURPLE}>בהצלחה <E c="1f525" /></Slam>
      <Slam at={53.34} to={53.85} x={540} y={860} rot={4} size={150} bg={GOLD} color="#0b0414">תנו בראש!</Slam>
    </>
  );
};

// ---------- branding ----------
const Watermark: React.FC = () => {
  const t = useT();
  const o = interpolate(t, [1.6, 2.1, OUTRO_START, OUTRO_START + 0.3], [0, 0.9, 0.9, 0], clamp);
  const k = 190 / 430;
  return (
    <div style={{position: 'absolute', top: 70, left: 36, width: 430 * k, height: 250 * k, overflow: 'hidden', opacity: o, mixBlendMode: 'screen'}}>
      <Img src={staticFile('logo.jpg')} style={{position: 'absolute', width: 990 * k, height: 990 * k, left: -280 * k, top: -325 * k}} />
    </div>
  );
};

const Progress: React.FC = () => {
  const t = useT();
  const p = Math.min(1, t / OUTRO_START);
  if (t > OUTRO_START + 0.2) return null;
  return <div style={{position: 'absolute', top: 0, right: 0, height: 10, width: `${p * 100}%`, background: `linear-gradient(270deg, ${PURPLE_LIGHT}, ${PURPLE})`, boxShadow: `0 0 20px ${PURPLE}`}} />;
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < OUTRO_START) return null;
  const bgO = interpolate(t, [OUTRO_START, LOGO_SLAM], [0, 1], clamp);
  const s = spring({frame: f - Math.round((LOGO_SLAM - 0.15) * FPS), fps: FPS, config: {damping: 9, stiffness: 120}});
  const txt = spring({frame: f - Math.round((LOGO_SLAM + 0.45) * FPS), fps: FPS, config: {damping: 12}});
  const txt2 = spring({frame: f - Math.round((LOGO_SLAM + 0.8) * FPS), fps: FPS, config: {damping: 12}});
  const pulse = 1 + Math.sin(t * 5) * 0.015;
  const fadeEnd = interpolate(t, [TOTAL - 0.4, TOTAL], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: bgO * fadeEnd, background: '#06040c'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, ${PURPLE}55 0%, transparent 55%)`, opacity: s}} />
      <div style={{position: 'absolute', top: 140, left: 0, width: W, height: W, transform: `scale(${interpolate(s, [0, 1], [2.2, 1]) * pulse})`,
        opacity: Math.min(1, s * 1.5), filter: `blur(${(1 - Math.min(s, 1)) * 18}px)`, mixBlendMode: 'screen'}}>
        <Img src={staticFile('logo.jpg')} style={{width: '100%', height: '100%'}} />
      </div>
      <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', direction: 'rtl', fontFamily: FONT, color: '#fff'}}>
        <div style={{fontWeight: 900, fontSize: 84, transform: `translateY(${(1 - txt) * 80}px)`, opacity: txt}}>
          {<E c="1f381" />} <span style={{color: GOLD}}>10 ימי ניסיון בחינם</span>
        </div>
        <div style={{marginTop: 26, display: 'inline-block', fontWeight: 800, fontSize: 58, padding: '18px 44px', borderRadius: 60,
          background: `linear-gradient(135deg, ${WA}, #128C7E)`, boxShadow: `0 0 50px ${WA}88`,
          transform: `translateY(${(1 - txt2) * 80}px) scale(${1 + Math.sin(t * 6) * 0.03})`, opacity: txt2}}>
          הצטרפו לקבוצה עכשיו {<E c="1f447" />}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- audio ----------
const musicVol = (f: number) => {
  const t = f / FPS;
  return interpolate(t, [0, 1.2, 1.8, 7.5, 7.7, SPEECH_END - 0.3, LOGO_SLAM - 0.2, TOTAL - 0.9, TOTAL], [0, 0, 0.13, 0.15, 0.17, 0.17, 0.6, 0.6, 0], clamp);
};
type S = 'whoosh' | 'ding' | 'scratch' | 'boom' | 'pop' | 'click' | 'glitch' | 'riser' | 'sad' | 'ping' | 'swish';
const SFX: [number, S, number?][] = [
  [0.0, 'scratch', 0.55], [0.0, 'boom', 0.3], [0.9, 'boom', 0.35], [1.12, 'boom', 0.45], [2.0, 'whoosh'], [3.38, 'pop', 0.4],
  [4.16, 'sad', 0.4], [4.16, 'boom', 0.25], [6.0, 'riser', 0.35], [6.62, 'pop', 0.35], [7.3, 'glitch', 0.4], [8.0, 'swish'],
  [9.6, 'whoosh'], [11.2, 'swish'], [12.64, 'pop', 0.4], [13.2, 'ding', 0.25], [13.82, 'pop', 0.4],
  [16.5, 'glitch', 0.35], [16.55, 'boom', 0.25], [18.6, 'whoosh'], [19.04, 'pop', 0.4], [19.48, 'ding', 0.25],
  [20.94, 'boom', 0.2], [21.92, 'boom', 0.25], [22.28, 'boom', 0.35], [22.35, 'whoosh'], [23.25, 'pop', 0.35],
  [24.48, 'ding', 0.4], [25.7, 'ding', 0.25], [27.5, 'whoosh'], [28.9, 'swish'], [31.6, 'glitch', 0.35], [31.7, 'whoosh'],
  [33.9, 'swish'], [35.5, 'whoosh'], [36.1, 'pop', 0.4], [36.38, 'pop', 0.4], [36.86, 'pop', 0.4], [37.08, 'ding', 0.25],
  [38.3, 'whoosh'], [38.4, 'pop', 0.35], [40.68, 'ding', 0.35], [41.72, 'boom', 0.3], [42.7, 'swish'],
  [43.0, 'ping', 0.35], [43.8, 'ping', 0.35], [44.9, 'ping', 0.35], [45.6, 'whoosh'], [46.9, 'swish'], [48.25, 'click', 0.5],
  [48.34, 'boom', 0.2], [49.6, 'whoosh'], [49.78, 'click', 0.5], [50.38, 'click', 0.5], [51.4, 'click', 0.5],
  [52.4, 'swish'], [52.7, 'pop', 0.35], [53.34, 'boom', 0.35], [OUTRO_START, 'whoosh'],
];
const SFX_VOL: Record<S, number> = {whoosh: 0.22, ding: 0.3, scratch: 0.5, boom: 0.3, pop: 0.35, click: 0.4, glitch: 0.35, riser: 0.35, sad: 0.4, ping: 0.35, swish: 0.25};

export const Main: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{backgroundColor: '#06040c'}}>
      <AbsoluteFill style={{transform: shakeAt(t)}}>
        <Background />
        <Sequence durationInFrames={Math.round(VIDEO_END * FPS)}>
          <Footage />
        </Sequence>
        <SceneAuto />
        <SceneZero />
        <SceneRobot />
        <SceneGift />
        <SceneWhatsApp />
        <SceneChecklist />
        <Watermark />
        <Overlays />
        <Captions />
      </AbsoluteFill>
      <CutFlash />
      <Progress />
      <Outro />
      <Sequence durationInFrames={Math.round(VIDEO_END * FPS)}>
        <Audio src={staticFile('src.mp4')} volume={1.15} />
      </Sequence>
      <Audio src={staticFile('music.wav')} volume={musicVol} />
      {SFX.map(([at, s, v], i) => (
        <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`${s}.wav`)} volume={v ?? SFX_VOL[s]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

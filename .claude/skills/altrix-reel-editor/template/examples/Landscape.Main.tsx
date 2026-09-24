import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import {CHUNKS, SPEECH_END} from './captions';

/*
 * Altrix reel #3. Source: 16:9 desktop recording (MT5 + TradingView), pre-processed with ffmpeg:
 * hook (first 5.9s) at 1.0x, the rest at 1.2x with pitch-preserving atempo -> public/src.mp4.
 * A virtual 9:16 camera pans/zooms over the landscape frame; full-screen scenes cover the static parts.
 */

export const FPS = 30;
export const W = 1080;
export const H = 1920;
const SW = 1920; // source frame
const SH = 1080;
const VIDEO_END = 63.07;
const OUTRO_START = 62.7;
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

// ---------- camera (virtual 9:16 window over the 16:9 source) ----------
// s = 1 means the source height fills the reel height. (fx,fy) source point -> (tx,ty) screen point.
type Cam = {s: number; fx: number; fy: number; tx: number; ty: number};
const BASE: Cam = {s: 1.15, fx: 0.5, fy: 0.5, tx: 0.5, ty: 0.5};
// the desktop recording has black bands above/below the app window
const CY0 = 85 / 1080;
const CY1 = 1040 / 1080;
const SHOTS: {a: number; b: number; cam: Cam}[] = [
  {a: -1, b: 1.45, cam: {s: 1.3, fx: 0.47, fy: 0.42, tx: 0.5, ty: 0.45}}, // hook: bad chart
  {a: 1.45, b: 3.1, cam: {s: 1.35, fx: 0.36, fy: 0.35, tx: 0.5, ty: 0.42}},
  {a: 3.1, b: 5.95, cam: {s: 1.6, fx: 0.57, fy: 0.5, tx: 0.5, ty: 0.42}}, // "does your chart look like this?"
  {a: 6.0, b: 7.2, cam: {s: 2.2, fx: 0.66, fy: 0.68, tx: 0.5, ty: 0.42}}, // crash, "oy vey"
  {a: 7.2, b: 13.0, cam: {s: 1.2, fx: 0.45, fy: 0.45, tx: 0.5, ty: 0.45}},
  {a: 15.5, b: 18.4, cam: {s: 1.55, fx: 0.8, fy: 0.3, tx: 0.5, ty: 0.38}}, // MT5 chart, bot trades
  {a: 18.4, b: 20.3, cam: {s: 1.45, fx: 0.52, fy: 0.8, tx: 0.5, ty: 0.42}}, // "all these trades"
  {a: 20.3, b: 22.2, cam: {s: 1.3, fx: 0.6, fy: 0.35, tx: 0.5, ty: 0.4}},
  {a: 22.2, b: 25.4, cam: {s: 1.7, fx: 0.73, fy: 0.8, tx: 0.5, ty: 0.42}}, // profit column
  {a: 25.4, b: 28.6, cam: {s: 1.5, fx: 0.42, fy: 0.3, tx: 0.5, ty: 0.38}}, // gold chart
  {a: 36.4, b: 39.3, cam: {s: 1.4, fx: 0.62, fy: 0.32, tx: 0.5, ty: 0.38}},
  {a: 44.0, b: 46.1, cam: {s: 1.35, fx: 0.45, fy: 0.33, tx: 0.5, ty: 0.36}}, // equity graph
  {a: 46.1, b: 49.0, cam: {s: 1.7, fx: 0.86, fy: 0.3, tx: 0.5, ty: 0.36}}, // graph peak
  {a: 49.1, b: 51.8, cam: {s: 1.5, fx: 0.7, fy: 0.3, tx: 0.5, ty: 0.38}},
  {a: 59.0, b: 62.7, cam: {s: 1.45, fx: 0.55, fy: 0.3, tx: 0.5, ty: 0.38}},
];
const PUNCHES = [4.6, 11.54, 12.36, 17.4, 18.16, 21.42, 22.54, 22.86, 23.32, 23.58, 24.5, 24.78, 26.08, 37.22, 38.0, 47.04, 60.14, 62.04];
const CUTS = [5.0, 6.27, 44.18, 51.96, 13.0, 15.5, 18.4, 22.2, 25.4, 28.6, 31.4, 36.4, 39.3, 44.0, 46.1, 49.1, 51.8, 55.1, 59.0];
const SHAKES: [number, number][] = [[0, 26], [1.0, 30], [1.24, 40], [6.06, 34], [6.52, 18], [6.82, 22], [8.96, 14], [10.12, 14], [10.76, 18], [12.36, 30],
  [13.36, 30], [21.92, 22], [47.04, 26], [62.04, 24]];

const camAt = (t: number): Cam => {
  let c: Cam = {...BASE, s: BASE.s + 0.08 * (t / VIDEO_END)};
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
  // slow pan inside long shots keeps the static screen alive
  c.fx += Math.sin(t * 0.35) * 0.015;
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
  const K = c.s * (H / SH); // px per source px
  const vw = SW * K, vh = SH * K;
  const left = Math.min(0, Math.max(W - vw, c.tx * W - c.fx * vw));
  const top = Math.min(-CY0 * vh, Math.max(H - CY1 * vh, c.ty * H - c.fy * vh));
  let blur = 0;
  for (const p of CUTS) blur += Math.max(0, 1 - Math.abs(t - p) / 0.12) * 12;
  const outroFade = interpolate(t, [OUTRO_START, LOGO_SLAM], [1, 0], clamp);
  const outroZoom = interpolate(t, [OUTRO_START, LOGO_SLAM], [1, 1.5], {...clamp, easing: Easing.in(Easing.cubic)});
  const alarm = t < 13 ? interpolate(t, [1.4, 2.2, 7.2, 7.8], [0, 1, 1, 0], clamp) * (0.55 + 0.45 * Math.abs(Math.sin(t * 5))) : 0;
  const dim = interpolate(t, [7.3, 7.7, 12.8, 13.0], [0, 0.55, 0.55, 0], clamp); // "SMT / Wyckoff" stickers sit on a dimmed chart
  return (
    <AbsoluteFill style={{opacity: outroFade, transform: `scale(${outroZoom})`, filter: `blur(${blur + (1 - outroFade) * 20 + dim * 8}px)`}}>
      <div style={{position: 'absolute', left, top, width: vw, height: vh}}>
        <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
      </div>
      <AbsoluteFill style={{background: `radial-gradient(circle, transparent 35%, ${RED}aa 100%)`, opacity: alarm}} />
      <AbsoluteFill style={{background: '#0c0618', opacity: dim}} />
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
  if (t > 13.75 && t < 15.35) return null; // the giant kinetic words carry this line
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

const Counter: React.FC<{from: number; value: number; dur?: number; decimals?: number; size?: number; prefix?: string; suffix?: string}> = ({from, value, dur = 1.1, decimals = 2, size = 128, prefix = '+$', suffix = ''}) => {
  const t = useT();
  const v = interpolate(t, [from, from + dur], [0, value], {...clamp, easing: Easing.out(Easing.cubic)});
  const done = t >= from + dur;
  const glow = done ? interpolate(t, [from + dur, from + dur + 0.4], [1.25, 1], clamp) : 1;
  return (
    <div style={{direction: 'ltr', fontWeight: 900, fontSize: size, lineHeight: 1, color: '#6BFF9E', transform: `scale(${glow})`,
      textShadow: `0 0 40px ${GREEN}aa, 0 0 90px ${GREEN}55`, fontVariantNumeric: 'tabular-nums'}}>
      {prefix}{v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}{suffix}
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
  return <div style={{zIndex: 5, ...style, transform: `${style?.transform ?? ''} scale(${interpolate(s, [0, 1], [from, 1])})`, opacity: Math.min(1, s * 2)}}>{children}</div>;
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

const SceneGift: React.FC = () => {
  const t = useT();
  const n = Math.round(interpolate(t, [29.38, 30.0], [1, 10], clamp));
  const bounce = Math.abs(Math.sin(t * 5)) * 30;
  return (
    <Scene from={28.6} to={31.4} tint="#C9A227">
      <Pop at={28.65} style={{position: 'absolute', left: W / 2 - 180, top: 200 - bounce}}><BigE c="1f381" size={360} /></Pop>
      {t >= 29.38 && (
        <Pop at={29.38} style={{position: 'absolute', top: 600, left: 0, right: 0}}>
          <div style={{fontWeight: 900, fontSize: 150, lineHeight: 1, color: GOLD, textShadow: `0 0 50px ${GOLD}aa`}}>
            <span style={{direction: 'ltr', display: 'inline-block', fontVariantNumeric: 'tabular-nums'}}>{n}</span> ימי ניסיון
          </div>
        </Pop>
      )}
      <Pop at={30.54} style={{position: 'absolute', top: 800, left: 0, right: 0}}>
        <div style={{fontWeight: 900, fontSize: 140, color: GREEN, textShadow: `0 0 50px ${GREEN}99`}}>בחינם!</div>
      </Pop>
    </Scene>
  );
};

const Check: React.FC<{at: number; icon?: string; num?: string; text: React.ReactNode; size?: number}> = ({at, icon = '2705', num, text, size = 70}) => (
  <Pop at={at} from={0.4} style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 46, background: 'rgba(40,14,78,0.92)',
    border: `3px solid ${PURPLE}`, borderRadius: 30, padding: '24px 36px', boxShadow: `0 0 50px ${PURPLE}77`}}>
    {num ? (
      <div style={{width: 100, height: 100, borderRadius: 50, background: `linear-gradient(135deg, ${GOLD}, #E0A800)`, color: '#1a0b33',
        fontWeight: 900, fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{num}</div>
    ) : <BigE c={icon} size={96} />}
    <div style={{fontWeight: 900, fontSize: size, textAlign: 'right', lineHeight: 1.1}}>{text}</div>
  </Pop>
);

const SceneSetup: React.FC = () => (
  <Scene from={31.4} to={36.4}>
    <Pop at={31.5} style={{position: 'absolute', top: 150, left: 0, right: 0}}>
      <div style={{fontWeight: 900, fontSize: 84}}><E c="1f6e0" /> בלי <span style={{color: GOLD}}>כאב ראש</span></div>
    </Pop>
    <div style={{position: 'absolute', top: 360, left: 90, right: 90}}>
      <Check at={33.24} text={<>התקנה מלאה – <span style={{color: GOLD}}>עלינו</span></>} />
      <Check at={34.38} text="אנחנו עושים לכם הכל" />
      <Check at={35.3} text={<>מלבישים לכם את <span style={{color: GOLD}}>הרובוט</span> <E c="1f916" /></>} size={62} />
    </div>
  </Scene>
);

const SceneSteps: React.FC = () => (
  <Scene from={39.3} to={44.4}>
    <Pop at={39.36} style={{position: 'absolute', top: 150, left: 0, right: 0}}>
      <div style={{fontWeight: 900, fontSize: 84}}>איך <span style={{color: GOLD}}>מתחילים?</span></div>
    </Pop>
    <div style={{position: 'absolute', top: 360, left: 90, right: 90}}>
      <Check at={39.68} num="1" text={<>נסו <span style={{color: GOLD}}>10 ימים</span> בחינם</>} />
      <Check at={41.26} num="2" text="תראו את התוצאות" />
      <Check at={42.94} num="3" text={<>תחליטו אם <span style={{color: GOLD}}>מתאים לכם</span></>} size={62} />
    </div>
  </Scene>
);

const SceneCommunity: React.FC = () => {
  const t = useT();
  const faces = ['p1', 'p2', 'p3', 'man', 'p4', 'p5', 'p6', 'p7'];
  return (
    <Scene from={55.75} to={59.0} tint={WA}>
      <Pop at={55.8} style={{position: 'absolute', top: 150, left: 0, right: 0}}>
        <div style={{fontWeight: 900, fontSize: 88}}><E c="1f91d" /> חלק <span style={{color: GOLD}}>מהקהילה</span></div>
      </Pop>
      {faces.map((c, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        return <Pop key={i} at={55.9 + i * 0.11} style={{position: 'absolute', left: 105 + col * 225, top: 380 + row * 250 + Math.sin(t * 4 + i) * 10}}>
          <Img src={staticFile(`faces/${c}.jpg`)} style={{width: 190, height: 190, borderRadius: 95, objectFit: 'cover', border: `6px solid ${WA}`, boxShadow: `0 0 36px ${WA}77`}} />
        </Pop>;
      })}
      <Pop at={58.66} style={{position: 'absolute', top: 960, left: 0, right: 0}}>
        <div style={{display: 'inline-block', fontWeight: 900, fontSize: 64, padding: '14px 40px', borderRadius: 50, background: `linear-gradient(135deg, ${WA}, #128C7E)`}}>
          <E c="1f916" /> הרובוט לניסיון
        </div>
      </Pop>
    </Scene>
  );
};

// ===== 13.0-18.4: modern "boot -> kinetic type -> 3D panel" sequence (replaces the robot scene) =====
const MONO = '"DejaVu Sans Mono", monospace';
const SceneBoot: React.FC = () => {
  const t = useT();
  if (t < 12.95 || t > 13.95) return null;
  const lines = ['> ALTRIX_CORE v2026', '> XAUUSD feed ........ OK', '> AI engine .......... ONLINE', '> AUTO-TRADING ....... ENABLED'];
  const p = interpolate(t, [13.0, 13.75], [0, 1], clamp);
  const out = interpolate(t, [13.75, 13.9], [1, 0], clamp);
  const flicker = 0.85 + 0.15 * Math.abs(Math.sin(t * 90));
  return (
    <AbsoluteFill style={{background: '#030208', opacity: out}}>
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)'}} />
      <div style={{position: 'absolute', top: 480, left: 90, right: 90, fontFamily: MONO, fontSize: 44, lineHeight: 1.7, color: GREEN, direction: 'ltr', opacity: flicker,
        textShadow: `0 0 18px ${GREEN}`}}>
        {lines.map((l, i) => {
          const lp = interpolate(p, [i / lines.length, (i + 1) / lines.length], [0, 1], clamp);
          const txt = l.slice(0, Math.floor(lp * l.length));
          return <div key={i} style={{color: i === 3 && lp >= 1 ? GOLD : GREEN}}>{txt}{lp > 0 && lp < 1 ? '▌' : ''}</div>;
        })}
        <div style={{marginTop: 40, height: 22, borderRadius: 11, background: '#0f2a1a', overflow: 'hidden', border: `2px solid ${GREEN}66`}}>
          <div style={{width: `${p * 100}%`, height: '100%', background: `linear-gradient(90deg, ${PURPLE}, ${GREEN})`, boxShadow: `0 0 20px ${GREEN}`}} />
        </div>
        <div style={{marginTop: 14, fontSize: 36, color: '#9fe8b8'}}>{Math.round(p * 100)}%</div>
      </div>
    </AbsoluteFill>
  );
};

// giant kinetic words: "למסחר" drops in, "אוטומטי" slams with a moving gold gradient fill
const SceneKinetic: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < 13.75 || t > 15.75) return null;
  const inA = spring({frame: f - Math.round(13.8 * FPS), fps: FPS, config: {damping: 12, stiffness: 160}});
  const inB = spring({frame: f - Math.round(14.28 * FPS), fps: FPS, config: {damping: 11, stiffness: 140}});
  const out = interpolate(t, [15.35, 15.7], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const sweep = interpolate(t, [14.5, 15.2], [-400, 1400], clamp);
  return (
    <AbsoluteFill style={{background: '#05030a', opacity: 1 - out, transform: `scale(${1 + out * 0.3})`}}>
      {/* animated gradient fill (gold -> purple) clipped to the word */}
      <div style={{position: 'absolute', top: 820, left: 0, right: 0, textAlign: 'center', direction: 'rtl', fontFamily: FONT, fontWeight: 900, fontSize: 270, lineHeight: 1,
        backgroundImage: `linear-gradient(100deg, ${PURPLE} 0%, ${GOLD} 30%, #fff 45%, ${GOLD} 60%, ${PURPLE} 100%)`, backgroundSize: '300% 100%',
        backgroundPosition: `${(t * 90) % 300}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        transform: `scale(${interpolate(inB, [0, 1], [2.4, 1])})`, opacity: Math.min(1, inB * 2)}}>אוטומטי</div>
      {/* outline + light sweep on top of the masked word */}
      <div style={{position: 'absolute', top: 820, left: 0, right: 0, textAlign: 'center', direction: 'rtl', fontFamily: FONT, fontWeight: 900, fontSize: 270, lineHeight: 1,
        color: 'transparent', WebkitTextStroke: `3px ${PURPLE_LIGHT}`, filter: `drop-shadow(0 0 24px ${PURPLE})`,
        transform: `scale(${interpolate(inB, [0, 1], [2.4, 1])})`, opacity: Math.min(1, inB * 2)}}>אוטומטי</div>
      <div style={{position: 'absolute', top: 780, left: sweep, width: 160, height: 360, transform: 'skewX(-20deg)',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)', mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', direction: 'rtl', fontFamily: FONT, fontWeight: 900, fontSize: 200, lineHeight: 1,
        color: '#fff', textShadow: `0 0 40px ${PURPLE}`, transform: `translateY(${(1 - inA) * -200}px)`, opacity: Math.min(1, inA * 2)}}>למסחר</div>
      <div style={{position: 'absolute', top: 1110, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: 10, color: PURPLE_LIGHT,
        direction: 'ltr', opacity: interpolate(t, [14.7, 15.0], [0, 1], clamp)}}>ALTRIX · GOLD BOT</div>
    </AbsoluteFill>
  );
};

// floating 3D terminal panel + "AUTO" gauge that fills to 100%
const ScenePanel: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < 15.35 || t > 18.75) return null;
  const inS = spring({frame: f - Math.round(15.4 * FPS), fps: FPS, config: {damping: 14, stiffness: 90}});
  const out = interpolate(t, [18.4, 18.7], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const ry = interpolate(inS, [0, 1], [-60, -14]) + Math.sin(t * 1.2) * 4;
  const rx = 8 + Math.cos(t * 1.1) * 3;
  const pct = interpolate(t, [16.2, 18.16], [0, 100], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const hit = interpolate(t, [18.16, 18.4], [1.25, 1], clamp);
  const R = 150, C = 2 * Math.PI * R;
  // crop of the MT5 chart (source x 900..1865, y 85..630) inside the panel
  const PW = 940, PH = 530, k = PW / 965;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #2a0f4d 0%, #0c0618 60%, #05030a 100%)', opacity: 1 - out, transform: `translateX(${-out * 300}px)`}}>
      <AbsoluteFill style={{opacity: 0.3, backgroundImage: `linear-gradient(${PURPLE}55 2px, transparent 2px), linear-gradient(90deg, ${PURPLE}55 2px, transparent 2px)`,
        backgroundSize: '120px 120px', backgroundPosition: `0 ${(t * 120) % 120}px`, transform: 'perspective(900px) rotateX(55deg) scale(2.2)', transformOrigin: '50% 100%', top: 700}} />
      <div style={{position: 'absolute', left: (W - PW) / 2, top: 170, width: PW, height: PH, perspective: 1400}}>
        <div style={{width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden', border: `3px solid ${PURPLE}`, background: '#fff',
          transform: `rotateY(${ry}deg) rotateX(${rx}deg) scale(${interpolate(inS, [0, 1], [0.6, 1])})`, boxShadow: `0 40px 120px ${PURPLE}88`, opacity: Math.min(1, inS * 2)}}>
          <div style={{position: 'absolute', left: -900 * k, top: -85 * k, width: SW * k, height: SH * k}}>
            <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
          </div>
          <div style={{position: 'absolute', top: 18, left: 18, background: RED, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 30, padding: '4px 16px', borderRadius: 10,
            direction: 'ltr', opacity: Math.floor(t * 3) % 2 ? 1 : 0.6}}>● LIVE</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: W / 2 - R - 20, top: 790, width: 2 * R + 40, height: 2 * R + 40, transform: `scale(${hit})`}}>
        <svg width={2 * R + 40} height={2 * R + 40}>
          <circle cx={R + 20} cy={R + 20} r={R} stroke="#2a1850" strokeWidth={26} fill="rgba(12,5,26,0.9)" />
          <circle cx={R + 20} cy={R + 20} r={R} stroke={pct >= 100 ? GREEN : PURPLE} strokeWidth={26} fill="none" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * C} ${C}`} transform={`rotate(-90 ${R + 20} ${R + 20})`} style={{filter: `drop-shadow(0 0 16px ${pct >= 100 ? GREEN : PURPLE})`}} />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: '#fff'}}>
          <div style={{fontWeight: 900, fontSize: 96, lineHeight: 1, direction: 'ltr', color: pct >= 100 ? '#6BFF9E' : '#fff'}}>{Math.round(pct)}%</div>
          <div style={{fontWeight: 800, fontSize: 40, color: GOLD, opacity: interpolate(t, [17.3, 17.5], [0, 1], clamp)}}>אוטומטי</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== realistic WhatsApp chat (simulation) =====
const WA_BG = '#efeae2';
const Tick: React.FC<{read?: boolean}> = ({read}) => (
  <svg width="30" height="20" viewBox="0 0 16 11" style={{marginInlineStart: 6}}><path d="M11.07.65 5.5 7.3 3.1 5.03 2.3 5.9l3.26 3.1 6.33-7.6zM15.1.65 9.5 7.3l-.9-.86-.8.87 1.77 1.68 6.33-7.6z" fill={read ? '#53bdeb' : '#8696a0'} /></svg>
);
type Msg = {at: number; me: boolean; text: React.ReactNode; time: string; link?: boolean};
const ChatPhone: React.FC<{name: string; photo: string; status: string; msgs: Msg[]; typingAt?: number[]; top?: number; scale?: number; composer?: React.ReactNode}> = ({name, photo, status, msgs, typingAt = [], top = 150, scale = 1, composer}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const shown = msgs.filter((m) => t >= m.at);
  const typing = typingAt.some((a) => t >= a && t < a + 0.55);
  // keep the latest messages in view
  const scroll = Math.max(0, shown.length - 4) * 150;
  return (
    <div style={{position: 'absolute', left: (W - 760) / 2, top, width: 760, height: 1020, borderRadius: 64, background: '#111', padding: 14,
      boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 80px ${WA}44`, transform: `scale(${scale})`, transformOrigin: '50% 0%'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 52, overflow: 'hidden', background: WA_BG, direction: 'rtl', fontFamily: FONT}}>
        {/* doodle-ish wallpaper */}
        <div style={{position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(#5b4a3a 2px, transparent 2px), radial-gradient(#5b4a3a 1.5px, transparent 1.5px)',
          backgroundSize: '46px 46px, 30px 30px', backgroundPosition: '0 0, 15px 20px'}} />
        {/* status bar + header */}
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 180, background: '#f0f2f5', borderBottom: '1px solid #d1d7db'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', padding: '14px 44px 0', fontSize: 26, fontWeight: 700, color: '#111', direction: 'ltr'}}>
            <span>10:24</span><span>● ● ▮</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 26px'}}>
            <div style={{fontSize: 44, color: '#54656f', transform: 'scaleX(-1)'}}>‹</div>
            <Img src={staticFile(photo)} style={{width: 86, height: 86, borderRadius: 43, objectFit: 'cover'}} />
            <div style={{flex: 1, textAlign: 'right'}}>
              <div style={{fontSize: 36, fontWeight: 700, color: '#111b21'}}>{name}</div>
              <div style={{fontSize: 26, color: typing ? '#008069' : '#667781'}}>{typing ? 'מקליד/ה…' : status}</div>
            </div>
            <div style={{fontSize: 36, color: '#54656f', direction: 'ltr'}}>📞</div>
          </div>
        </div>
        {/* messages */}
        <div style={{position: 'absolute', top: 200, left: 0, right: 0, bottom: 120, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scroll}px)`, padding: '0 22px'}}>
            <div style={{textAlign: 'center', margin: '6px 0 18px'}}><span style={{background: '#fff', borderRadius: 12, padding: '6px 18px', fontSize: 24, color: '#54656f'}}>היום</span></div>
            {shown.map((m, i) => {
              const s = spring({frame: f - Math.round(m.at * FPS), fps: FPS, config: {damping: 14, stiffness: 220, mass: 0.5}});
              return (
                <div key={i} style={{display: 'flex', justifyContent: m.me ? 'flex-start' : 'flex-end', marginBottom: 14}}>
                  <div style={{maxWidth: 560, background: m.me ? '#d9fdd3' : '#fff', borderRadius: m.me ? '22px 0 22px 22px' : '0 22px 22px 22px', padding: '14px 20px 10px',
                    boxShadow: '0 1px 1px rgba(0,0,0,0.13)', transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, transformOrigin: m.me ? '100% 0%' : '0% 0%', opacity: Math.min(1, s * 2)}}>
                    {m.link && (
                      <div style={{background: 'rgba(0,0,0,0.05)', borderRadius: 14, padding: 12, marginBottom: 10, display: 'flex', gap: 14, alignItems: 'center'}}>
                        <div style={{width: 84, height: 84, borderRadius: 12, background: '#0c0618', overflow: 'hidden', flexShrink: 0}}>
                          <Img src={staticFile('logo.jpg')} style={{width: 84, height: 84}} />
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontSize: 28, fontWeight: 800, color: '#111b21'}}>Altrix Gold Bot</div>
                          <div style={{fontSize: 24, color: '#667781'}}>הזמנה לקבוצת וואטסאפ</div>
                        </div>
                      </div>
                    )}
                    <div style={{fontSize: 34, color: '#111b21', lineHeight: 1.3, textAlign: 'right'}}>{m.text}</div>
                    <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: 22, color: '#667781', direction: 'ltr', marginTop: 4}}>
                      <span>{m.time}</span>{m.me && <Tick read={t > m.at + 0.5} />}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <div style={{background: '#fff', borderRadius: '0 22px 22px 22px', padding: '18px 26px', display: 'flex', gap: 8}}>
                  {[0, 1, 2].map((d) => <div key={d} style={{width: 14, height: 14, borderRadius: 7, background: '#8696a0', opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 8 + d))}} />)}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* composer */}
        <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: '#f0f2f5', display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px'}}>
          <div style={{flex: 1, height: 76, borderRadius: 38, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 28px', fontSize: 32, color: '#111b21'}}>
            {composer ?? <span style={{color: '#8696a0'}}>הודעה</span>}
          </div>
          <div style={{width: 80, height: 80, borderRadius: 40, background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width="38" height="38" viewBox="0 0 24 24" style={{transform: 'scaleX(-1)'}}><path d="M1.1 21.8 23 12 1.1 2.2l.01 7.6L16.6 12 1.1 14.2z" fill="#fff" /></svg>
          </div>
        </div>
        <div style={{position: 'absolute', bottom: 130, left: 24, fontSize: 22, color: '#8696a0', direction: 'rtl'}}>*הדמיה</div>
      </div>
    </div>
  );
};

const SceneWhatsApp: React.FC = () => {
  const msgs: Msg[] = [
    {at: 52.25, me: false, text: <>היי! ראיתי את הסרטון <E c="1f440" /> אפשר לנסות את הרובוט?</>, time: '10:24'},
    {at: 53.0, me: true, text: <>בטח! 10 ימי ניסיון בחינם <E c="1f381" /></>, time: '10:24'},
    {at: 54.35, me: true, link: true, text: <>מצרף לך קישור לקבוצה <E c="1f447" /></>, time: '10:25'},
    {at: 55.3, me: false, text: <>מעולה, מצטרף! <E c="1f64c" /></>, time: '10:25'},
  ];
  return (
    <Scene from={51.92} to={55.75} tint={WA}>
      <Pop at={51.95} from={0.7}><ChatPhone name="דניאל" photo="faces/man.jpg" status="מחובר/ת" msgs={msgs} typingAt={[54.8]} top={120} /></Pop>
    </Scene>
  );
};

// ===== final CTA: typing & sending a message + happy people joining =====
const SceneSend: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const draft = 'אני רוצה להתחיל עם הרובוט 🚀';
  const typed = t < 60.8 ? draft.slice(0, Math.floor(interpolate(t, [59.9, 60.7], [0, draft.length], clamp))) : '';
  const msgs: Msg[] = [
    {at: 60.8, me: true, text: <>אני רוצה להתחיל עם הרובוט <E c="1f680" /></>, time: '10:31'},
    {at: 61.5, me: false, text: <>ברוך הבא! <E c="1f389" /> מתקינים לך הכל</>, time: '10:31'},
  ];
  const people = ['faces/p1.jpg', 'faces/p2.jpg', 'faces/p3.jpg', 'faces/p4.jpg', 'faces/p5.jpg', 'faces/p6.jpg'];
  const reacts = ['1f929', '1f525', '1f680', '1f64c', '2764', '1f389'];
  const spots: [number, number][] = [[70, 330], [880, 420], [60, 700], [900, 780], [110, 1040], [860, 1080]];
  return (
    <Scene from={59.0} to={62.75} tint={WA}>
      <Pop at={59.05} style={{position: 'absolute', top: 60, left: 0, right: 0}}>
        <div style={{fontWeight: 900, fontSize: 80}}>
          {t < 61.36 ? <>שלחו לנו <span style={{color: GOLD}}>הודעה</span> <E c="1f4ac" /></> : <>מחכים <span style={{color: GOLD}}>לכם!</span> <E c="1f447" /></>}
        </div>
      </Pop>
      <Pop at={59.1} from={0.7}>
        <ChatPhone name="Altrix Gold Bot" photo="logo.jpg" status="קבוצה · 10 ימי ניסיון" msgs={msgs} typingAt={[61.0]} top={200} scale={0.86}
          composer={typed ? <span style={{direction: 'rtl'}}>{typed}<span style={{opacity: Math.floor(t * 4) % 2}}>|</span></span> : undefined} />
      </Pop>
      {people.map((p, i) => {
        const at = 61.0 + i * 0.18;
        const [x, y] = spots[i];
        return (
          <Pop key={i} at={at} style={{position: 'absolute', left: x - 90, top: y + Math.sin(t * 3 + i) * 12}}>
            <div style={{position: 'relative', width: 180, height: 180}}>
              <Img src={staticFile(p)} style={{width: 180, height: 180, borderRadius: 90, objectFit: 'cover', border: `6px solid ${WA}`, boxShadow: `0 0 40px ${WA}88`}} />
              <div style={{position: 'absolute', right: -14, bottom: -8}}><BigE c={reacts[i]} size={78} /></div>
            </div>
          </Pop>
        );
      })}
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

// sticker with a red strike-through ("SMT", "Wyckoff" - the methods he mocks)
const Nope: React.FC<{at: number; to: number; x: number; y: number; rot: number; children: React.ReactNode}> = ({at, to, x, y, rot, children}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < at || t > to + 0.2) return null;
  const s = spring({frame: f - Math.round(at * FPS), fps: FPS, config: {damping: 9, stiffness: 260, mass: 0.6}});
  const strike = interpolate(t, [at + 0.25, at + 0.45], [0, 1], clamp);
  const out = interpolate(t, [to, to + 0.2], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${interpolate(s, [0, 1], [2.5, 1])})`,
      opacity: Math.min(1, s * 3) * out, fontFamily: FONT, fontWeight: 900, fontSize: 110, color: '#fff', whiteSpace: 'nowrap', direction: 'rtl',
      background: 'rgba(30,30,40,0.92)', padding: '4px 40px', borderRadius: 20, border: '5px solid #fff'}}>
      {children}
      <div style={{position: 'absolute', left: -20, top: '50%', height: 16, width: `calc(${strike * 100}% + 40px)`, background: RED, borderRadius: 8,
        transform: 'rotate(-8deg)', boxShadow: `0 0 20px ${RED}`}} />
    </div>
  );
};

const Overlays: React.FC = () => {
  const t = useT();
  return (
    <>
      <Burst at={47.9} seed="pct" />
      {/* hook */}
      <Slam at={0.0} to={1.4} x={330} y={560} rot={-10} size={130}>רגע!</Slam>
      <Slam at={1.0} to={1.4} x={740} y={820} rot={8} size={150}>רגע!</Slam>
      <Slam at={1.24} to={1.4} x={540} y={1090} rot={-4} size={190}>רגע! <E c="270b" /></Slam>
      {t >= 4.5 && t < 5.95 && (
        <Pop at={4.6} style={{position: 'absolute', left: 700, top: 230, transform: `rotate(${Math.sin(t * 8) * 8}deg)`}}><BigE c="1f4c9" size={220} /></Pop>
      )}
      {t >= 6.06 && t < 7.3 && (
        <>
          <Pop at={6.06} style={{position: 'absolute', left: W / 2 - 200, top: 330, transform: `rotate(${Math.sin(t * 20) * 6}deg)`}}><BigE c="1f631" size={400} /></Pop>
          <Pop at={6.2} style={{position: 'absolute', left: 90, top: 200, opacity: Math.floor(t * 6) % 2 ? 1 : 0.4}}><BigE c="1f6a8" size={150} /></Pop>
          <Pop at={6.3} style={{position: 'absolute', left: 840, top: 200, opacity: Math.floor(t * 6) % 2 ? 0.4 : 1}}><BigE c="1f6a8" size={150} /></Pop>
        </>
      )}
      <Slam at={8.2} to={11.4} x={540} y={330} rot={-3} size={96} bg={PURPLE}>שמענו... <E c="1f971" /></Slam>
      <Nope at={8.96} to={11.4} x={330} y={620} rot={-7}>SMT</Nope>
      <Nope at={10.12} to={11.4} x={720} y={800} rot={6}>וייקוף</Nope>
      <Nope at={10.76} to={11.4} x={420} y={990} rot={-4}>שמייקוף <E c="1f921" /></Nope>
      <Slam at={11.54} to={12.3} x={540} y={640} rot={-3} size={130} bg={PURPLE}>תתקדמו <E c="1f680" /></Slam>
      <Slam at={12.36} to={12.98} x={540} y={700} rot={3} size={220} bg={GOLD} color="#0b0414">2026</Slam>

      <Scanner from={18.5} to={20.2} />
      <Nope at={20.58} to={22.1} x={540} y={420} rot={-5}>אנחנו</Nope>
      <Slam at={21.42} to={22.15} x={540} y={680} rot={4} size={120} bg={PURPLE}>הרובוט <E c="1f916" /></Slam>
      <Slam at={21.92} to={22.15} x={540} y={930} rot={-3} size={160} bg={GOLD} color="#0b0414">לבד!</Slam>
      <Ticket at={22.54} side="BUY" x={390} y={420} />
      <Ticket at={22.86} side="CLOSE" x={620} y={580} profit="+$9.98" />
      <Ticket at={23.32} side="SELL" x={400} y={740} />
      <Ticket at={23.58} side="CLOSE" x={630} y={900} profit="+$13.93" />
      <Ticket at={24.5} side="BUY" x={420} y={500} />
      <Ticket at={24.78} side="CLOSE" x={610} y={680} profit="+$18.11" />
      <Card from={25.6} to={28.4} top={170} accent={GOLD}>
        <div style={{fontWeight: 900, fontSize: 76}}><E c="1f947" /> סוחר על <span style={{color: GOLD}}>הזהב</span></div>
        <Label><E c="23f0" /> כל היום · מסחר יומי</Label>
      </Card>
      <Slam at={37.22} to={39.2} x={320} y={560} rot={-6} size={96} bg={PURPLE}>תיק דמו</Slam>
      <Slam at={38.0} to={39.2} x={760} y={760} rot={5} size={96} bg={PURPLE}>תיק פרטי</Slam>
      <Slam at={38.6} to={39.2} x={540} y={960} rot={-2} size={84} bg={GREEN} color="#0b0414">לא משנה מה <E c="2705" /></Slam>
      <Card from={45.2} to={46.9} top={960} accent={PURPLE}>
        <div style={{fontWeight: 900, fontSize: 72}}><E c="1f4c5" /> בחודש אחד בלבד</div>
      </Card>
      <Card from={46.95} to={49.0} top={900} accent={GREEN}>
        <Label><E c="1f680" /> תשואה על התיק</Label>
        <Counter from={47.04} value={15.5} dur={0.9} decimals={1} size={170} prefix="+" suffix="%" />
      </Card>
      <Card from={49.1} to={51.7} top={170} accent={GREEN}>
        <div style={{fontWeight: 900, fontSize: 80, color: '#6BFF9E'}}><E c="1f381" /> 10 ימים בחינם</div>
        <Label>מי שרוצה – יכול לנסות</Label>
      </Card>
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
  return interpolate(t, [0, 1.3, 1.9, 13.2, 13.4, SPEECH_END - 0.3, LOGO_SLAM - 0.2, TOTAL - 0.9, TOTAL], [0, 0, 0.13, 0.15, 0.17, 0.17, 0.6, 0.6, 0], clamp);
};
type S = 'whoosh' | 'ding' | 'scratch' | 'boom' | 'pop' | 'click' | 'glitch' | 'riser' | 'sad' | 'ping' | 'swish';
const SFX: [number, S, number?][] = [
  [0.0, 'scratch', 0.55], [0.0, 'boom', 0.3], [1.0, 'boom', 0.35], [1.24, 'boom', 0.45], [1.5, 'whoosh'], [3.1, 'swish'], [4.6, 'pop', 0.4],
  [6.06, 'sad', 0.4], [6.06, 'boom', 0.25], [8.2, 'pop', 0.35], [8.96, 'click', 0.5], [9.25, 'glitch', 0.3], [10.12, 'click', 0.5], [10.4, 'glitch', 0.3],
  [10.76, 'click', 0.5], [11.05, 'glitch', 0.3], [11.54, 'swish'], [11.75, 'riser', 0.35], [12.36, 'boom', 0.35], [13.0, 'glitch', 0.4], [13.05, 'whoosh'],
  [15.5, 'whoosh'], [17.3, 'swish'], [18.4, 'whoosh'], [20.58, 'click', 0.5], [20.8, 'glitch', 0.3], [21.42, 'pop', 0.4], [21.92, 'boom', 0.35],
  [22.2, 'whoosh'], [22.54, 'pop', 0.4], [22.86, 'ding', 0.25], [23.32, 'pop', 0.4], [23.58, 'ding', 0.25], [24.5, 'pop', 0.4], [24.78, 'ding', 0.3],
  [25.4, 'whoosh'], [25.6, 'swish'], [28.6, 'whoosh'], [28.65, 'pop', 0.35], [29.38, 'click', 0.4], [30.54, 'ding', 0.35], [31.4, 'glitch', 0.35],
  [31.5, 'whoosh'], [33.24, 'click', 0.5], [34.38, 'click', 0.5], [35.3, 'click', 0.5], [36.4, 'whoosh'], [37.22, 'pop', 0.4], [38.0, 'pop', 0.4],
  [38.6, 'ding', 0.25], [39.3, 'whoosh'], [39.68, 'click', 0.5], [41.26, 'click', 0.5], [42.94, 'click', 0.5], [44.0, 'whoosh'], [45.2, 'swish'],
  [47.04, 'ding', 0.4], [47.9, 'ding', 0.25], [49.1, 'whoosh'], [51.8, 'swish'], [52.2, 'ping', 0.35], [53.1, 'ping', 0.35], [54.4, 'ping', 0.35],
  [55.1, 'whoosh'], [55.5, 'pop', 0.3], [56.2, 'pop', 0.3], [58.66, 'ding', 0.3], [59.0, 'whoosh'], [60.14, 'pop', 0.4], [61.36, 'boom', 0.3],
  [OUTRO_START, 'whoosh'],
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
        <SceneBoot />
        <SceneKinetic />
        <ScenePanel />
        <SceneGift />
        <SceneSetup />
        <SceneSteps />
        <SceneWhatsApp />
        <SceneCommunity />
        <SceneSend />
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
      {SFX.map(([at, s, v], i) => (
        <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`${s}.wav`)} volume={v ?? SFX_VOL[s]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

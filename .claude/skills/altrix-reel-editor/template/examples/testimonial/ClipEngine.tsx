import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random, spring,
  staticFile, useCurrentFrame, Easing,
} from 'remotion';

/*
 * Testimonial short-clip engine (Google-Meet interview → 9:16 split screen).
 * Base video (made with ffmpeg): client panel y 110-1010, host panel y 1300-1920, caption band between.
 * Everything per clip lives in clipdata.ts.
 */

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const OUTRO = 3.3;

const PURPLE = '#9B4DFF';
const PURPLE_LIGHT = '#D6A8FF';
const GOLD = '#FFD84D';
const GREEN = '#2BFF7A';
const RED = '#FF3355';
const WA = '#25D366';
const FONT = 'Heebo, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useT = () => useCurrentFrame() / FPS;

export const PANELS = {client: {y: 110, h: 900}, host: {y: 1300, h: 620}};
export const BAND = {y: 1010, h: 290};

// ---------- data types ----------
export type Word = {text: string; start: number; end: number; hi: boolean};
export type Chunk = {words: Word[]; start: number; end: number};
export type Ev =
  | {type: 'hook'; at: number; to: number; lines: string[]; color?: string}
  | {type: 'focus'; at: number; to: number; who: 'client' | 'host'; label?: string}
  | {type: 'money'; at: number}
  | {type: 'quote'; at: number; to: number; text: string[]; gold?: number[]}
  | {type: 'stat'; at: number; to: number; prefix?: string; value: number; suffix?: string; sub: string; decimals?: number}
  | {type: 'phone'; at: number; to: number; tapAt: number}
  | {type: 'shield'; at: number; to: number; title: string; sub: string}
  | {type: 'stamp'; at: number; to: number; text: string; x: number; y: number; rot: number; size: number; bg?: string; color?: string}
  | {type: 'scan'; at: number; to: number; text: string}
  | {type: 'compare'; at: number; to: number; a: {title: string; value: string; sub: string}; b: {title: string; value: string; sub: string}}
  | {type: 'multi'; at: number; to: number; steps: [number, string][]; sub: string}
  | {type: 'range'; at: number; to: number; from: number; toV: number; suffix: string; sub: string; label?: string}
  | {type: 'shake'; at: number; amp: number};
export type ClipData = {
  id: string; video: string; len: number; raw: string; speakers: [number, number, 'client' | 'host'][];
  joins: number[]; events: Ev[]; sfx: [number, string, number?][]; music: string; dropAt: number; clientName: string;
  tag?: [string, string]; quoteBy?: string; disclaimer?: string; ring?: boolean; noZoom?: boolean;
};

export const parseRaw = (raw: string, end: number): Chunk[] => {
  const groups = raw.trim().split('|').map((g) => g.trim().split(/\s+/).filter(Boolean));
  const flat: {text: string; start: number; hi: boolean; g: number}[] = [];
  groups.forEach((g, gi) => g.forEach((tok) => {
    const at = tok.lastIndexOf('@');
    const t = tok.slice(0, at); const s = parseFloat(tok.slice(at + 1));
    const hi = t.startsWith('*');
    flat.push({text: (hi ? t.slice(1) : t).replace(/_/g, ' '), start: s, hi, g: gi});
  }));
  const chunks: Chunk[] = groups.map(() => ({words: [], start: 0, end: 0}));
  flat.forEach((w, i) => {
    const next = flat[i + 1];
    chunks[w.g].words.push({text: w.text, start: w.start, end: next ? Math.min(next.start, w.start + 1.1) : end, hi: w.hi});
  });
  chunks.forEach((c, i) => {
    c.start = c.words[0].start;
    const nextStart = chunks[i + 1]?.words[0].start ?? end;
    c.end = Math.min(nextStart, c.words[c.words.length - 1].end + 0.7);
  });
  return chunks.filter((c) => c.words.length);
};

const E: React.FC<{c: string; s?: string | number}> = ({c, s = '0.95em'}) => (
  <Img src={staticFile(`emoji/${c}.svg`)} style={{height: s, width: s, verticalAlign: '-0.12em', margin: '0 0.08em'}} />
);
const pop = (f: number, at: number, cfg = {damping: 11, stiffness: 200, mass: 0.6}) => spring({frame: f - Math.round(at * FPS), fps: FPS, config: cfg});

// ---------- background + footage ----------
const Bg: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, #2a0f4d 0%, #0c0618 55%, #05030a 100%)'}}>
      {new Array(30).fill(0).map((_, i) => {
        const x = random('bx' + i) * W, y = BAND.y + random('by' + i) * BAND.h;
        return <div key={i} style={{position: 'absolute', left: (x + t * (20 + random('bs' + i) * 40)) % W, top: y, width: 4, height: 4, borderRadius: 2,
          background: i % 3 ? PURPLE_LIGHT : GOLD, opacity: 0.35, boxShadow: `0 0 10px ${PURPLE_LIGHT}`}} />;
      })}
    </AbsoluteFill>
  );
};

const camAt = (d: ClipData, t: number) => {
  let s = 1, cy = H / 2;
  if (d.noZoom) return {s, cy};
  for (const e of d.events) {
    if (e.type !== 'focus') continue;
    const w = Math.min(interpolate(t, [e.at - 0.15, e.at + 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}),
      interpolate(t, [e.to - 0.25, e.to + 0.1], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)}));
    if (w > 0) {
      const p = PANELS[e.who];
      s = 1 + 0.14 * w; cy = H / 2 + (p.y + p.h / 2 - H / 2) * w;
    }
  }
  let punch = 0;
  const hits = [...d.joins, ...d.events.filter((e) => e.type === 'money').map((e) => e.at)];
  for (const p of hits) if (t >= p && t < p + 0.45) punch += 0.045 * Math.exp(-(t - p) * 9);
  return {s: s * (1 + punch), cy};
};

const Footage: React.FC<{d: ClipData}> = ({d}) => {
  const t = useT();
  const {s, cy} = camAt(d, t);
  const fade = interpolate(t, [d.len - 0.25, d.len + 0.2], [1, 0], clamp);
  let blur = 0;
  for (const p of d.joins) blur += Math.max(0, 1 - Math.abs(t - p) / 0.1) * 8;
  return (
    <AbsoluteFill style={{transform: `translateY(${(H / 2 - cy) * (s - 1) / s}px) scale(${s})`, transformOrigin: `50% ${cy}px`, opacity: fade, filter: `blur(${blur}px)`}}>
      <OffthreadVideo src={staticFile(d.video)} muted style={{width: W, height: H}} />
    </AbsoluteFill>
  );
};

// active-speaker glow frames + name tags
const Frames: React.FC<{d: ClipData}> = ({d}) => {
  const t = useT();
  if (t > d.len) return null;
  const who = d.speakers.find(([a, b]) => t >= a && t < b)?.[2] ?? 'client';
  const box = (k: 'client' | 'host') => {
    const p = PANELS[k]; const on = who === k;
    return <div key={k} style={{position: 'absolute', left: 0, right: 0, top: p.y, height: p.h, pointerEvents: 'none',
      boxShadow: on ? `inset 0 0 0 4px ${PURPLE}, inset 0 0 60px ${PURPLE}66` : 'inset 0 0 0 2px rgba(155,77,255,0.25)', transition: 'none'}} />;
  };
  return (
    <>
      {box('client')}{box('host')}
      {d.ring ? <div style={{position: 'absolute', left: 540 - 432, top: PANELS.client.y + 450 - 432, width: 864, height: 864, borderRadius: 432, pointerEvents: 'none',
        border: `7px solid ${PURPLE_LIGHT}`, boxShadow: `0 0 40px ${PURPLE}, 0 0 90px ${PURPLE}88, inset 0 0 30px ${PURPLE}88`}} /> : null}
      <div style={{position: 'absolute', top: PANELS.client.y + PANELS.client.h - 86, right: 26, direction: 'rtl', fontFamily: FONT, fontWeight: 800, fontSize: 34,
        color: '#fff', padding: '8px 22px', borderRadius: 30, background: 'rgba(12,6,24,0.72)', border: `2px solid ${GOLD}aa`}}>
        {d.tag ? <><span style={{color: GOLD}}>{d.tag[0]}</span> · {d.tag[1]}</> : d.clientName ? <>{d.clientName} <span style={{color: GOLD}}>· לקוח Altrix</span></> : <><span style={{color: GOLD}}>לקוח Altrix</span> · ריאיון אמיתי</>}
      </div>
    </>
  );
};

// ---------- captions (middle band) ----------
const Captions: React.FC<{chunks: Chunk[]; d: ClipData}> = ({chunks, d}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (d.events.some((e) => (e.type === 'hook' || e.type === 'quote' || e.type === 'stat' || e.type === 'compare' || e.type === 'multi' || e.type === 'range' || (e.type === 'stamp' && e.y > BAND.y && e.y < BAND.y + BAND.h)) && t >= e.at && t < e.to + 0.1)) return null;
  const c = chunks.find((x) => t >= x.start && t < x.end);
  if (!c) return null;
  const inS = pop(f, c.start, {damping: 14, stiffness: 180, mass: 0.6});
  const out = interpolate(t, [c.end - 0.08, c.end], [1, 0], clamp);
  const n = c.words.reduce((a, w) => a + w.text.length, 0);
  const size = n > 22 ? 74 : n > 15 ? 86 : 100;
  return (
    <div style={{position: 'absolute', top: BAND.y, height: BAND.h, left: 30, right: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{direction: 'rtl', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', opacity: Math.min(1, inS * 1.6) * out,
        transform: `translateY(${(1 - inS) * 26}px)`, filter: `blur(${(1 - Math.min(1, inS)) * 10}px)`}}>
        {c.words.map((w, i) => {
          const active = t >= w.start && t < w.end;
          const wp = pop(f, w.start, {damping: 10, stiffness: 320, mass: 0.5});
          const said = t >= w.start - 0.03;
          const gold = w.hi;
          return (
            <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.12, unicodeBidi: 'isolate', display: 'inline-block', margin: '0 17px',
              color: gold ? 'transparent' : '#fff', opacity: said ? 1 : 0.38,
              backgroundImage: gold ? `linear-gradient(180deg, #fff6c9 0%, ${GOLD} 45%, #E0A800 100%)` : undefined, WebkitBackgroundClip: gold ? 'text' : undefined,
              filter: active ? `drop-shadow(0 0 22px ${gold ? GOLD : PURPLE})` : 'drop-shadow(0 6px 0 rgba(0,0,0,0.55))',
              transform: `scale(${active ? 1 + 0.1 * Math.min(wp, 1.2) : 1})`}}>{w.text}</span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- hook: glitch slam in the band ----------
const Hook: React.FC<{e: Extract<Ev, {type: 'hook'}>}> = ({e}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < e.at || t > e.to + 0.2) return null;
  const s = pop(f, e.at, {damping: 9, stiffness: 240, mass: 0.6});
  const out = interpolate(t, [e.to, e.to + 0.2], [1, 0], clamp);
  const g = t - e.at < 0.5 ? (random('g' + f) - 0.5) * 22 : 0;
  const layer = (col: string, dx: number) => (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: col,
      transform: `translateX(${dx}px)`, mixBlendMode: col === '#fff' ? 'normal' : 'screen', opacity: col === '#fff' ? 1 : 0.8}}>
      {e.lines.map((l, i) => <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: i === 0 ? (l.length > 16 ? 84 : l.length > 11 ? 112 : 140) : 58, lineHeight: i === 0 ? 1 : 1.25, marginTop: i ? 14 : 0, direction: 'rtl', whiteSpace: 'nowrap'}}>{l}</div>)}
    </div>
  );
  return (
    <div style={{position: 'absolute', top: BAND.y - 40, height: BAND.h + 80, left: 0, right: 0, opacity: out,
      transform: `scale(${interpolate(s, [0, 1], [2.4, 1])}) rotate(${(1 - Math.min(s, 1)) * -6}deg)`}}>
      {layer('#00E5FF', g)}{layer(RED, -g)}{layer(e.color ?? '#fff', 0)}
    </div>
  );
};

// ---------- AI focus lock (HUD over a panel) ----------
const Focus: React.FC<{e: Extract<Ev, {type: 'focus'}>}> = ({e}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < e.at || t > e.to + 0.25) return null;
  const s = pop(f, e.at, {damping: 13, stiffness: 160, mass: 0.6});
  const out = interpolate(t, [e.to, e.to + 0.25], [1, 0], clamp);
  const p = PANELS[e.who];
  const cy = p.y + p.h / 2 - (e.who === 'client' ? 60 : 40);
  const R = e.who === 'client' ? 330 : 230;
  const inset = interpolate(s, [0, 1], [-120, 40]);
  const corner = (x: number, y: number, rx: number, ry: number) => (
    <div style={{position: 'absolute', left: x, top: y, width: 90, height: 90, borderTop: ry ? 'none' : `8px solid ${GOLD}`, borderBottom: ry ? `8px solid ${GOLD}` : 'none',
      borderLeft: rx ? 'none' : `8px solid ${GOLD}`, borderRight: rx ? `8px solid ${GOLD}` : 'none', filter: `drop-shadow(0 0 12px ${GOLD})`}} />
  );
  return (
    <AbsoluteFill style={{opacity: Math.min(1, s * 1.5) * out, pointerEvents: 'none'}}>
      {corner(inset, p.y + inset, 0, 0)}{corner(W - 90 - inset, p.y + inset, 1, 0)}
      {corner(inset, p.y + p.h - 90 - inset, 0, 1)}{corner(W - 90 - inset, p.y + p.h - 90 - inset, 1, 1)}
      <svg style={{position: 'absolute', left: W / 2 - R, top: cy - R}} width={2 * R} height={2 * R}>
        <circle cx={R} cy={R} r={R - 6} fill="none" stroke={`${PURPLE_LIGHT}aa`} strokeWidth={3} strokeDasharray="18 14" transform={`rotate(${t * 60} ${R} ${R})`} />
        <circle cx={R} cy={R} r={R - 34} fill="none" stroke={`${GOLD}88`} strokeWidth={2} strokeDasharray="4 22" transform={`rotate(${-t * 90} ${R} ${R})`} />
      </svg>
      <div style={{position: 'absolute', top: p.y + 28, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{direction: 'ltr', fontFamily: '"DejaVu Sans Mono", monospace', fontSize: 26, color: GOLD, background: 'rgba(10,4,22,0.75)', padding: '6px 18px',
          borderRadius: 10, border: `1px solid ${GOLD}88`, letterSpacing: 3}}>● {e.label ?? 'AI FOCUS'}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- money: 3D coin rain + gold flash ----------
const Coin: React.FC<{size: number; spin: number}> = ({size, spin}) => (
  <div style={{width: size, height: size, borderRadius: '50%', transform: `rotateY(${spin}deg)`,
    background: 'radial-gradient(circle at 35% 30%, #fff6c9 0%, #f7d25a 30%, #d9a520 62%, #9c6a0c 100%)',
    boxShadow: `inset 0 0 0 ${size * 0.07}px #f3c64a, inset 0 0 0 ${size * 0.11}px #b98314`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Rubik, Heebo', fontWeight: 900, fontSize: size * 0.48, color: '#8a5d05'}}>$</div>
);
const Money: React.FC<{at: number}> = ({at}) => {
  const t = useT() - at;
  if (t < 0 || t > 2.0) return null;
  const flash = interpolate(t, [0, 0.08, 0.5], [0, 0.55, 0], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', perspective: 900}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${GOLD}aa, transparent 60%)`, opacity: flash, mixBlendMode: 'screen'}} />
      {new Array(28).fill(0).map((_, i) => {
        const x = random('mx' + at + i) * W; const delay = random('md' + at + i) * 0.5; const tt = t - delay;
        if (tt < 0) return null;
        const y = -120 + tt * (900 + random('mv' + at + i) * 700) + 400 * tt * tt;
        const sz = 50 + random('ms' + at + i) * 70;
        return <div key={i} style={{position: 'absolute', left: x, top: y, opacity: interpolate(tt, [0, 1.2, 1.5], [1, 1, 0], clamp), filter: `blur(${sz < 70 ? 1.5 : 0}px)`}}>
          <Coin size={sz} spin={tt * 720 * (random('mr' + at + i) > 0.5 ? 1 : -1)} /></div>;
      })}
    </AbsoluteFill>
  );
};

// ---------- full-screen scenes (cover footage; captions stay on top in the band) ----------
const SceneShell: React.FC<{at: number; to: number; children: React.ReactNode; tint?: string}> = ({at, to, children, tint = PURPLE}) => {
  const t = useT();
  if (t < at || t > to + 0.3) return null;
  const inP = interpolate(t, [at, at + 0.4], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const outP = interpolate(t, [to, to + 0.3], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  // liquid diagonal reveal
  const cut = interpolate(inP, [0, 1], [-30, 130]);
  return (
    <AbsoluteFill style={{clipPath: `polygon(0 0, ${cut}% 0, ${cut - 30}% 100%, 0 100%)`, opacity: 1 - outP, transform: `scale(${1 + outP * 0.12})`, background: '#0a0516'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 30% 25%, ${tint}55 0%, transparent 45%), radial-gradient(circle at 75% 80%, ${GOLD}22 0%, transparent 45%)`}} />
      <AbsoluteFill style={{opacity: 0.18, backgroundImage: `linear-gradient(${tint}55 1px, transparent 1px), linear-gradient(90deg, ${tint}55 1px, transparent 1px)`, backgroundSize: '64px 64px'}} />
      <AbsoluteFill style={{direction: 'rtl', fontFamily: FONT, color: '#fff', textAlign: 'center'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Quote: React.FC<{e: Extract<Ev, {type: 'quote'}>; who: string}> = ({e, who}) => {
  const f = useCurrentFrame();
  return (
    <SceneShell at={e.at} to={e.to}>
      <div style={{position: 'absolute', top: 170, left: 80, fontFamily: 'Rubik', fontWeight: 900, fontSize: 300, lineHeight: 1, color: `${PURPLE}88`}}>”</div>
      <div style={{position: 'absolute', top: 360, left: 70, right: 70}}>
        {e.text.map((l, i) => {
          const s = pop(f, e.at + 0.15 + i * 0.22);
          const g = e.gold?.includes(i);
          return <div key={i} style={{fontWeight: 900, fontSize: 104, lineHeight: 1.12, opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 40}px)`,
            color: g ? 'transparent' : '#fff', backgroundImage: g ? `linear-gradient(180deg, #fff6c9, ${GOLD} 50%, #E0A800)` : undefined,
            WebkitBackgroundClip: g ? 'text' : undefined, filter: g ? `drop-shadow(0 0 24px ${GOLD}77)` : undefined}}>{l}</div>;
        })}
      </div>
      <div style={{position: 'absolute', top: 1420, left: 0, right: 0, fontWeight: 800, fontSize: 44, color: PURPLE_LIGHT, opacity: interpolate(f / FPS, [e.at + 0.6, e.at + 0.9], [0, 1], clamp)}}>
        — {who}
      </div>
    </SceneShell>
  );
};

const Stat: React.FC<{e: Extract<Ev, {type: 'stat'}>}> = ({e}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const v = interpolate(t, [e.at + 0.2, e.at + 1.3], [0, e.value], {...clamp, easing: Easing.out(Easing.cubic)});
  const done = t > e.at + 1.3;
  return (
    <SceneShell at={e.at} to={e.to} tint="#C9A227">
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, direction: 'ltr', fontFamily: 'Rubik, Heebo', fontWeight: 900, fontSize: 210, lineHeight: 1,
        color: 'transparent', backgroundImage: `linear-gradient(180deg, #fff6c9, ${GOLD} 50%, #E0A800)`, WebkitBackgroundClip: 'text',
        filter: `drop-shadow(0 0 ${done ? 40 : 18}px ${GOLD}88)`, transform: `scale(${done ? interpolate(t, [e.at + 1.3, e.at + 1.6], [1.12, 1], clamp) : 1})`}}>
        {e.prefix ?? ''}{v.toLocaleString('en-US', {maximumFractionDigits: e.decimals ?? 0, minimumFractionDigits: e.decimals ?? 0})}{e.suffix ?? ''}
      </div>
      <div style={{position: 'absolute', top: 640, left: 60, right: 60, fontWeight: 800, fontSize: 64, color: '#fff'}}>{e.sub}</div>
    </SceneShell>
  );
};

const Phone: React.FC<{e: Extract<Ev, {type: 'phone'}>}> = ({e}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const on = t >= e.tapAt;
  const tap = interpolate(t, [e.tapAt - 0.25, e.tapAt, e.tapAt + 0.3], [0, 1, 0], clamp);
  const s = pop(f, e.at + 0.1);
  return (
    <SceneShell at={e.at} to={e.to}>
      <div style={{position: 'absolute', left: (W - 520) / 2, top: 150, width: 520, height: 820, borderRadius: 64, background: '#111', padding: 14,
        boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 80px ${PURPLE}55`, transform: `scale(${interpolate(s, [0, 1], [0.7, 1])}) rotate(-4deg)`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 52, background: 'linear-gradient(180deg, #160a2c, #0a0516)', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 70, left: 0, right: 0, fontWeight: 800, fontSize: 40, color: PURPLE_LIGHT, direction: 'ltr'}}>ALTRIX · GOLD BOT</div>
          <div style={{position: 'absolute', top: 160, left: 0, right: 0, fontWeight: 900, fontSize: 56, color: on ? GREEN : '#888'}}>{on ? 'הבוט פעיל' : 'הבוט כבוי'}</div>
          {/* big toggle */}
          <div style={{position: 'absolute', top: 300, left: 110, width: 270, height: 140, borderRadius: 70, background: on ? GREEN : '#333',
            boxShadow: on ? `0 0 50px ${GREEN}` : 'none'}}>
            <div style={{position: 'absolute', top: 12, left: on ? 142 : 12, width: 116, height: 116, borderRadius: 58, background: '#fff'}} />
          </div>
          <div style={{position: 'absolute', top: 520, left: 40, right: 40, fontWeight: 700, fontSize: 34, color: '#cfc3e6', lineHeight: 1.4}}>
            <E c="1f514" /> התראה: אירוע תנודתי<br />לחיצה אחת — וזהו
          </div>
          <div style={{position: 'absolute', left: 245 - 70, top: 370 - 70, width: 140, height: 140, borderRadius: 70, border: `6px solid #fff`,
            opacity: tap, transform: `scale(${1 + (1 - tap) * 0.8})`}} />
        </div>
      </div>
    </SceneShell>
  );
};

const Shield: React.FC<{e: Extract<Ev, {type: 'shield'}>}> = ({e}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const s = pop(f, e.at + 0.1, {damping: 10, stiffness: 140, mass: 0.7});
  return (
    <SceneShell at={e.at} to={e.to} tint="#2b7bff">
      <div style={{position: 'absolute', left: W / 2 - 210, top: 180, width: 420, height: 480, transform: `scale(${s})`}}>
        <svg width="420" height="480" viewBox="0 0 420 480">
          <defs><linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb2ff" /><stop offset="1" stopColor="#3b2fd6" /></linearGradient></defs>
          <path d="M210 20 L380 80 V230 C380 340 300 420 210 460 C120 420 40 340 40 230 V80 Z" fill="url(#sh)" stroke="#fff" strokeWidth="8" />
          <path d="M140 240 l50 50 l100 -110" stroke="#fff" strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="300" strokeDashoffset={interpolate(t, [e.at + 0.4, e.at + 0.9], [300, 0], clamp)} />
        </svg>
        {[0, 1, 2].map((i) => {
          const p = ((t * 0.9 + i / 3) % 1);
          return <div key={i} style={{position: 'absolute', left: 210 - (200 + p * 300), top: 240 - (200 + p * 300), width: 2 * (200 + p * 300), height: 2 * (200 + p * 300),
            borderRadius: '50%', border: '4px solid #7fb2ff', opacity: (1 - p) * 0.5}} />;
        })}
      </div>
      <div style={{position: 'absolute', top: 700, left: 40, right: 40, fontWeight: 900, fontSize: 96, lineHeight: 1.05}}>{e.title}</div>
      <div style={{position: 'absolute', top: 820, left: 60, right: 60, fontWeight: 700, fontSize: 48, color: '#cfe0ff'}}>{e.sub}</div>
    </SceneShell>
  );
};

const Stamp: React.FC<{e: Extract<Ev, {type: 'stamp'}>}> = ({e}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < e.at || t > e.to + 0.2) return null;
  const s = pop(f, e.at, {damping: 9, stiffness: 260, mass: 0.6});
  const out = interpolate(t, [e.to, e.to + 0.2], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: e.x, top: e.y, transform: `translate(-50%, -50%) rotate(${e.rot}deg) scale(${interpolate(s, [0, 1], [3, 1])})`,
      opacity: Math.min(1, s * 3) * out, direction: 'rtl', fontFamily: FONT, fontWeight: 900, fontSize: e.size, color: e.color ?? '#fff', whiteSpace: 'nowrap',
      background: e.bg ?? PURPLE, padding: '6px 40px', borderRadius: 22, border: '6px solid #fff', boxShadow: `0 14px 0 #00000055, 0 0 60px ${e.bg ?? PURPLE}aa`}}>
      {e.text}
    </div>
  );
};

// scanning beam + label over the client panel (modern "analysis" effect)
const Scan: React.FC<{e: Extract<Ev, {type: 'scan'}>}> = ({e}) => {
  const t = useT();
  if (t < e.at || t > e.to) return null;
  const p = PANELS.client;
  const y = p.y + ((t - e.at) / (e.to - e.at)) * p.h;
  const o = interpolate(t, [e.at, e.at + 0.15, e.to - 0.15, e.to], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: y - 3, height: 6, background: `linear-gradient(90deg, transparent, ${GREEN}, transparent)`, boxShadow: `0 0 40px ${GREEN}`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: p.y, height: y - p.y, background: `linear-gradient(180deg, transparent, ${GREEN}18)`}} />
      <div style={{position: 'absolute', top: p.y + 30, left: 30, direction: 'ltr', fontFamily: '"DejaVu Sans Mono", monospace', fontSize: 26, color: GREEN,
        background: 'rgba(4,20,10,0.8)', padding: '6px 16px', borderRadius: 8}}>{e.text}</div>
    </AbsoluteFill>
  );
};


// LOW risk vs HIGH risk - two glass cards slide in from opposite sides
const Compare: React.FC<{e: Extract<Ev, {type: 'compare'}>}> = ({e}) => {
  const f = useCurrentFrame();
  const sa = pop(f, e.at + 0.15, {damping: 13, stiffness: 150, mass: 0.7});
  const sb = pop(f, e.at + 0.7, {damping: 13, stiffness: 150, mass: 0.7});
  const card = (c: {title: string; value: string; sub: string}, s: number, dir: number, col: string, top: number) => (
    <div style={{position: 'absolute', top, left: 70, right: 70, padding: '34px 40px', borderRadius: 40, background: 'rgba(20,10,40,0.85)',
      border: `4px solid ${col}`, boxShadow: `0 0 60px ${col}77, inset 0 0 50px ${col}22`, transform: `translateX(${(1 - s) * dir * 900}px) rotate(${(1 - s) * dir * 6}deg)`}}>
      <div style={{fontWeight: 800, fontSize: 50, color: col}}>{c.title}</div>
      <div style={{direction: /[א-ת]/.test(c.value) ? 'rtl' : 'ltr', fontFamily: 'Rubik, Heebo', fontWeight: 900, fontSize: /[א-ת]/.test(c.value) && c.value.length > 6 ? 104 : 130, lineHeight: 1.05, color: 'transparent',
        backgroundImage: `linear-gradient(180deg, #fff6c9, ${GOLD} 50%, #E0A800)`, WebkitBackgroundClip: 'text'}}>{c.value}</div>
      <div style={{fontWeight: 700, fontSize: 40, color: '#e9defa'}}>{c.sub}</div>
    </div>
  );
  return (
    <SceneShell at={e.at} to={e.to}>
      {card(e.a, sa, 1, GREEN, 170)}
      <div style={{position: 'absolute', top: 600, left: 0, right: 0, fontFamily: 'Rubik', fontWeight: 900, fontSize: 70, color: PURPLE_LIGHT, opacity: sb, direction: 'ltr'}}>VS</div>
      {card(e.b, sb, -1, RED, 700)}
    </SceneShell>
  );
};

// ×2 → ×3 multiplier slams
const Multi: React.FC<{e: Extract<Ev, {type: 'multi'}>}> = ({e}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const cur = [...e.steps].reverse().find(([at]) => t >= at);
  return (
    <SceneShell at={e.at} to={e.to} tint="#C9A227">
      {e.steps.map(([at, txt], i) => {
        if (t < at) return null;
        const s = pop(f, at, {damping: 8, stiffness: 260, mass: 0.6});
        const active = cur?.[0] === at;
        return <div key={i} style={{position: 'absolute', top: 190 + i * 250, left: 0, right: 0, fontFamily: 'Rubik, Heebo', fontWeight: 900,
          fontSize: active ? 230 : 120, lineHeight: 1, direction: /[א-ת]/.test(txt) ? 'rtl' : 'ltr', opacity: active ? 1 : 0.35,
          color: 'transparent', backgroundImage: `linear-gradient(180deg, #fff6c9, ${GOLD} 50%, #E0A800)`, WebkitBackgroundClip: 'text',
          transform: `scale(${interpolate(s, [0, 1], [3, 1])})`, filter: active ? `drop-shadow(0 0 40px ${GOLD}aa)` : 'none'}}>{txt}</div>;
      })}
      <div style={{position: 'absolute', top: 900, left: 60, right: 60, fontWeight: 800, fontSize: 52, color: '#fff'}}>{e.sub}</div>
    </SceneShell>
  );
};

// counter that runs from one number to another (e.g. 6,000 → 10,000)
const Range: React.FC<{e: Extract<Ev, {type: 'range'}>}> = ({e}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const v = interpolate(t, [e.at + 0.2, e.at + 1.6], [e.from, e.toV], {...clamp, easing: Easing.out(Easing.cubic)});
  const done = t > e.at + 1.6;
  return (
    <SceneShell at={e.at} to={e.to} tint="#C9A227">
      <div style={{position: 'absolute', top: 230, left: 0, right: 0, fontWeight: 800, fontSize: 56, color: PURPLE_LIGHT}}>{e.label ?? 'מתוך הריאיון'}</div>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, direction: 'ltr', fontFamily: 'Rubik, Heebo', fontWeight: 900, fontSize: 200, lineHeight: 1,
        color: 'transparent', backgroundImage: `linear-gradient(180deg, #fff6c9, ${GOLD} 50%, #E0A800)`, WebkitBackgroundClip: 'text',
        filter: `drop-shadow(0 0 ${done ? 46 : 18}px ${GOLD}99)`, transform: `scale(${done ? interpolate(t, [e.at + 1.6, e.at + 1.9], [1.15, 1], clamp) : 1})`}}>
        {Math.round(v).toLocaleString('en-US')}{e.suffix}
      </div>
      <div style={{position: 'absolute', top: 600, left: 60, right: 60, fontWeight: 900, fontSize: 70, color: '#fff'}}>{e.sub}</div>
    </SceneShell>
  );
};

// light sweep on every join
const JoinFx: React.FC<{d: ClipData}> = ({d}) => {
  const t = useT();
  const j = d.joins.find((p) => t >= p - 0.12 && t < p + 0.25);
  if (j === undefined) return null;
  const p = interpolate(t, [j - 0.12, j + 0.25], [-0.4, 1.4], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div style={{position: 'absolute', top: -200, bottom: -200, left: p * W - 250, width: 500, transform: 'skewX(-18deg)',
        background: `linear-gradient(90deg, transparent, ${PURPLE_LIGHT}cc, #fff, ${PURPLE_LIGHT}cc, transparent)`, opacity: 0.55}} />
    </AbsoluteFill>
  );
};

// ---------- top strip + outro ----------
const Top: React.FC<{d: ClipData}> = ({d}) => {
  const t = useT();
  if (t > d.len) return null;
  const k = 170 / 470;
  return (
    <>
      <div style={{position: 'absolute', top: 0, right: 0, height: 8, width: `${Math.min(1, t / d.len) * 100}%`, background: `linear-gradient(270deg, ${PURPLE_LIGHT}, ${PURPLE})`}} />
      <div style={{position: 'absolute', top: 14, left: W / 2 - 85, width: 170, height: 250 * k * 0.36 + 60, overflow: 'hidden', mixBlendMode: 'screen',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 62% at 50% 50%, #000 45%, transparent 100%)'}}>
        <Img src={staticFile('logo.jpg')} style={{position: 'absolute', width: 990 * k, height: 990 * k, left: -260 * k, top: -318 * k}} />
      </div>
    </>
  );
};

const Outro: React.FC<{d: ClipData}> = ({d}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const at = d.len;
  if (t < at - 0.2) return null;
  const bg = interpolate(t, [at - 0.2, at + 0.2], [0, 1], clamp);
  const s = pop(f, at + 0.05, {damping: 9, stiffness: 120, mass: 1});
  const a = pop(f, at + 0.5, {damping: 12, stiffness: 160, mass: 0.6});
  const b = pop(f, at + 0.8, {damping: 12, stiffness: 160, mass: 0.6});
  return (
    <AbsoluteFill style={{background: '#06040c', opacity: bg}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 33%, ${PURPLE}55 0%, transparent 55%)`, opacity: s}} />
      <div style={{position: 'absolute', top: 120, left: 0, width: W, height: W, transform: `scale(${interpolate(s, [0, 1], [2.2, 1])})`, opacity: Math.min(1, s * 1.5),
        filter: `blur(${(1 - Math.min(s, 1)) * 16}px)`, mixBlendMode: 'screen', WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 50%, transparent 75%)'}}>
        <Img src={staticFile('logo.jpg')} style={{width: '100%', height: '100%'}} />
      </div>
      <div style={{position: 'absolute', top: 1160, left: 0, right: 0, textAlign: 'center', direction: 'rtl', fontFamily: FONT, color: '#fff'}}>
        <div style={{fontWeight: 900, fontSize: 82, opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}><E c="1f381" /> <span style={{color: GOLD}}>10 ימי ניסיון בחינם</span></div>
        <div style={{marginTop: 30, display: 'inline-block', fontWeight: 800, fontSize: 56, padding: '18px 46px', borderRadius: 60, background: `linear-gradient(135deg, ${WA}, #128C7E)`,
          boxShadow: `0 0 50px ${WA}88`, opacity: b, transform: `translateY(${(1 - b) * 60}px) scale(${1 + Math.sin(t * 6) * 0.03})`}}>הצטרפו לקבוצת הוואטסאפ <E c="1f447" /></div>
        <div style={{marginTop: 70, fontWeight: 400, fontSize: 26, color: '#9a8fb3', opacity: b, padding: '0 80px', lineHeight: 1.4}}>
          {d.disclaimer ?? 'דברי הלקוח משקפים את ניסיונו האישי. תוצאות עבר אינן מבטיחות תוצאות עתידיות, ומסחר כרוך בסיכון. אין לראות באמור ייעוץ השקעות.'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- composition ----------
export const ClipComp: React.FC<{d: ClipData; chunks: Chunk[]}> = ({d, chunks}) => {
  const total = d.len + OUTRO;
  const musicVol = (fr: number) => {
    const t = fr / FPS;
    return interpolate(t, [0, 0.15, d.dropAt, d.dropAt + 0.2, d.len - 0.3, d.len + 0.3, total - 0.7, total], [0.25, 0.1, 0.1, 0.14, 0.14, 0.55, 0.55, 0], clamp);
  };
  const fr = useCurrentFrame(); const tt = fr / FPS;
  let sx = 0, sy = 0;
  for (const e of d.events) if (e.type === 'shake' || e.type === 'hook') {
    const amp = e.type === 'shake' ? e.amp : 26; const dt = tt - e.at;
    if (dt >= 0 && dt < 0.5) { const k = amp * Math.exp(-dt * 8); sx += k * Math.sin(dt * 97); sy += k * Math.cos(dt * 83); }
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#06040c'}}>
      <Bg />
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
      <Footage d={d} />
      <Frames d={d} />
      {d.events.map((e, i) => e.type === 'scan' ? <Scan key={i} e={e} /> : e.type === 'focus' ? <Focus key={i} e={e} /> : null)}
      {d.events.map((e, i) => e.type === 'quote' ? <Quote key={i} e={e} who={d.quoteBy ?? (d.clientName ? `${d.clientName}, לקוח Altrix` : 'לקוח Altrix')} /> : e.type === 'stat' ? <Stat key={i} e={e} />
        : e.type === 'phone' ? <Phone key={i} e={e} /> : e.type === 'shield' ? <Shield key={i} e={e} /> : null)}
      {d.events.map((e, i) => e.type === 'compare' ? <Compare key={i} e={e} /> : e.type === 'multi' ? <Multi key={i} e={e} /> : e.type === 'range' ? <Range key={i} e={e} /> : null)}
      {d.events.map((e, i) => e.type === 'money' ? <Money key={i} at={e.at} /> : null)}
      <Captions chunks={chunks} d={d} />
      {d.events.map((e, i) => e.type === 'hook' ? <Hook key={i} e={e} /> : e.type === 'stamp' ? <Stamp key={i} e={e} /> : null)}
      </AbsoluteFill>
      <JoinFx d={d} />
      <Top d={d} />
      <Outro d={d} />
      <Sequence durationInFrames={Math.round(d.len * FPS)}><Audio src={staticFile(d.video)} volume={1.1} /></Sequence>
      <Audio src={staticFile(d.music)} volume={musicVol} />
      {d.sfx.map(([at, s, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={70}><Audio src={staticFile(`${s}.wav`)} volume={v ?? 0.3} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

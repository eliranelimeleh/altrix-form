import React from 'react';
import {
  AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, random, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import {CHUNKS, SPEECH_END} from './captions';

/*
 * Altrix reel template. Everything under a "PER-VIDEO" comment is tuned to one recording;
 * the rest (brand colours, caption style, card look, outro, audio mix) is the house style.
 * Reference values below are from the first Altrix reel (42s gold-bot screen recording).
 */

export const FPS = 30;
export const W = 1080;
export const H = 1920;
// PER-VIDEO: timing (seconds)
const VIDEO_END = 42.27; // source duration
const OUTRO_START = 41.8; // ~0.2s after the last spoken word
const LOGO_SLAM = OUTRO_START + 0.5; // keep in sync with the impact passed to music.py
export const TOTAL = LOGO_SLAM + 2.9;

const PURPLE = '#9B4DFF';
const PURPLE_LIGHT = '#D6A8FF';
const GOLD = '#FFD84D';
const FONT = "Heebo, sans-serif";

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);

// ---------- camera: zoom shots on the phone recording ----------
type Cam = {s: number; fx: number; fy: number; tx: number; ty: number};
const BASE: Cam = {s: 1, fx: 0.5, fy: 0.5, tx: 0.5, ty: 0.5};
// PER-VIDEO: source content bounds. Screen recordings often have black side bars; measure them
// on a frame (content spanned x 0.09..0.91 here). BASE_S = 1 / (x1 - x0) fills the frame.
const CONTENT_X0 = 0.09;
const CONTENT_X1 = 0.91;
const BASE_S = 1.22;
// PER-VIDEO: zoom shots. a/b = start/end seconds; s = scale; (fx,fy) = point in the source (0..1)
// that is moved to screen point (tx,ty). Keep ty ~0.4 so captions (y≈0.63) never cover the focus.
const SHOTS: {a: number; b: number; cam: Cam}[] = [
  {a: 2.85, b: 5.45, cam: {s: 2.0, fx: 0.68, fy: 0.81, tx: 0.5, ty: 0.4}}, // weekly profit (frozen frame)
  {a: 11.1, b: 14.3, cam: {s: 1.5, fx: 0.5, fy: 0.33, tx: 0.5, ty: 0.42}}, // chart
  {a: 17.45, b: 20.25, cam: {s: 2.0, fx: 0.68, fy: 0.84, tx: 0.5, ty: 0.4}}, // monthly profit
  {a: 23.0, b: 27.6, cam: {s: 1.38, fx: 0.5, fy: 0.6, tx: 0.5, ty: 0.5}}, // whatsapp message
  {a: 32.9, b: 35.4, cam: {s: 1.7, fx: 0.33, fy: 0.24, tx: 0.5, ty: 0.36}}, // "$481" post
];
// PER-VIDEO: optional freeze [fromFrame, toFrame) - holds a frame while the recording scrolls away
// from what is being talked about. Set to null when not needed.
const FREEZE: [number, number] | null = [84, 165];
// PER-VIDEO: small zoom punches on emphasis words, and screen changes (flash + blur + punch)
const PUNCHES = [0.2, 0.8, 8.6, 10.9, 21.8, 33.1, 40.9];
const CUTS = [10.0, 15.9, 17.35, 20.8, 22.05];

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
  for (const p of [...PUNCHES, ...CUTS]) if (t >= p && t < p + 0.5) punch += 0.05 * Math.exp(-(t - p) * 9);
  c.s *= 1 + punch;
  return c;
};

const Background: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2a0f4d 0%, #0c0618 55%, #05030a 100%)'}} />
);

const Footage: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const c = camAt(t);
  // never let the source's black side bars show
  const left = Math.min(-CONTENT_X0 * W * c.s, Math.max(W - CONTENT_X1 * W * c.s, c.tx * W - c.fx * W * c.s));
  const top = c.ty * H - c.fy * H * c.s;
  let blur = 0;
  for (const p of CUTS) blur += Math.max(0, 1 - Math.abs(t - p) / 0.12) * 10;
  const outroFade = interpolate(t, [OUTRO_START, LOGO_SLAM], [1, 0], clamp);
  const outroZoom = interpolate(t, [OUTRO_START, LOGO_SLAM], [1, 1.5], {...clamp, easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill style={{opacity: outroFade, transform: `scale(${outroZoom})`, filter: `blur(${blur + (1 - outroFade) * 20}px)`}}>
      <div style={{position: 'absolute', left, top, width: W * c.s, height: H * c.s, borderRadius: c.s > 1.02 ? 28 : 0, overflow: 'hidden',
        boxShadow: c.s > 1.02 ? `0 0 80px ${PURPLE}88` : 'none'}}>
        {FREEZE ? (
          <>
            <Sequence durationInFrames={FREEZE[0]}>
              <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
            </Sequence>
            <Sequence from={FREEZE[0]} durationInFrames={FREEZE[1] - FREEZE[0]}>
              <Freeze frame={FREEZE[0] - 1}>
                <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
              </Freeze>
            </Sequence>
            <Sequence from={FREEZE[1]}>
              <OffthreadVideo src={staticFile('src.mp4')} muted startFrom={FREEZE[1]} style={{width: '100%', height: '100%'}} />
            </Sequence>
          </>
        ) : (
          <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
        )}
      </div>
      {/* readability vignette */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,4,22,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 50%, rgba(10,4,22,0.6) 78%, rgba(10,4,22,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

const CutFlash: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  let a = 0;
  for (const p of CUTS) a = Math.max(a, 1 - Math.abs(t - p) / 0.1);
  a = Math.max(a, interpolate(t, [LOGO_SLAM - 0.03, LOGO_SLAM, LOGO_SLAM + 0.3], [0, 1, 0], clamp));
  return <AbsoluteFill style={{background: `radial-gradient(circle, ${PURPLE_LIGHT} 0%, ${PURPLE} 60%)`, opacity: a * 0.55, mixBlendMode: 'screen'}} />;
};

// Twemoji images: the headless browser can't paint color emoji fonts
const E: React.FC<{c: string}> = ({c}) => (
  <Img src={staticFile(`emoji/${c}.svg`)} style={{height: '0.95em', width: '0.95em', verticalAlign: '-0.12em', margin: '0 0.08em'}} />
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
const Card: React.FC<{from: number; to: number; top: number; children: React.ReactNode; accent?: string; sound?: 'whoosh' | 'ding'}> = ({from, to, top, children, accent = PURPLE}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  if (t < from || t > to + 0.3) return null;
  const inS = spring({frame: f - Math.round(from * fps), fps, config: {damping: 11, stiffness: 180, mass: 0.7}});
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

const Counter: React.FC<{from: number; value: number; dur?: number}> = ({from, value, dur = 1.1}) => {
  const t = useCurrentFrame() / FPS;
  const v = interpolate(t, [from, from + dur], [0, value], {...clamp, easing: Easing.out(Easing.cubic)});
  const done = t >= from + dur;
  const glow = done ? interpolate(t, [from + dur, from + dur + 0.4], [1.25, 1], clamp) : 1;
  return (
    <div style={{direction: 'ltr', fontWeight: 900, fontSize: 128, lineHeight: 1, color: '#6BFF9E', transform: `scale(${glow})`,
      textShadow: '0 0 40px #2BFF7Aaa, 0 0 90px #2BFF7A55', fontVariantNumeric: 'tabular-nums'}}>
      +${v.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
    </div>
  );
};

const Burst: React.FC<{at: number; seed: string}> = ({at, seed}) => {
  const t = useCurrentFrame() / FPS - at;
  if (t < 0 || t > 2.2) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(26).fill(0).map((_, i) => {
        const ang = -Math.PI / 2 + (random(seed + i) - 0.5) * 2.2; // mostly upward
        const sp = 500 + random(seed + 'v' + i) * 900;
        const x = W / 2 + Math.cos(ang) * sp * t;
        const y = 1050 + Math.sin(ang) * sp * t * 1.3 + 1100 * t * t;
        const em = ['1f4b0', '1f4b5', '1f4b8', '1fa99'][i % 4];
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 70 + random(seed + 's' + i) * 50,
          transform: `rotate(${t * 400 * (random(seed + 'r' + i) - 0.5)}deg)`, opacity: interpolate(t, [0, 1.5, 2.2], [1, 1, 0], clamp)}}><Img src={staticFile(`emoji/${em}.svg`)} style={{width: '100%'}} /></div>;
      })}
    </AbsoluteFill>
  );
};

const Label: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 46, color = PURPLE_LIGHT}) => (
  <div style={{fontWeight: 800, fontSize: size, color, lineHeight: 1.2}}>{children}</div>
);

// PER-VIDEO: the cards. Cards sit at top≈200-230 by default; move one to the middle (top≈860)
// when it would hide something important at the top of the recording.
const Overlays: React.FC = () => (
  <>
    <Burst at={4.1} seed="w" />
    <Burst at={18.9} seed="m" />
    <Card from={0.1} to={2.7} top={230}>
      <Label size={38}>XAUUSD · GOLD BOT {<E c="1f916" />}</Label>
      <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1.15}}>הרובוט <span style={{color: GOLD}}>ממשיך להדפיס</span> {<E c="1f4b8" />}</div>
    </Card>
    <Card from={2.95} to={5.6} top={200} accent="#2BFF7A">
      <Label>{<E c="1f4c8" />} רווח מתחילת השבוע</Label>
      <Counter from={3.0} value={1202.3} />
    </Card>
    <Card from={7.5} to={10.8} top={230}>
      <div style={{fontWeight: 900, fontSize: 80}}>{<E c="2699" />} <span style={{color: GOLD}}>100%</span> אוטומטי</div>
      <Label>אפס התעסקות · הבוט פותח וסוגר לבד</Label>
    </Card>
    <Card from={17.55} to={20.3} top={200} accent="#2BFF7A">
      <Label>{<E c="1f680" />} רווח מתחילת החודש</Label>
      <Counter from={17.6} value={10813.24} dur={1.3} />
    </Card>
    <Card from={20.4} to={22.0} top={860} accent="#FF4D6A">
      <div style={{fontWeight: 900, fontSize: 72, display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center'}}>
        <span style={{width: 30, height: 30, borderRadius: 15, background: '#FF3355', boxShadow: '0 0 20px #FF3355', display: 'inline-block',
          opacity: Math.floor((useCurrentFrame() / FPS) * 3) % 2 ? 1 : 0.35}} />
        חשבון LIVE · לא דמו
      </div>
    </Card>
    <Card from={24.3} to={28.0} top={230} accent="#25D366">
      <div style={{fontWeight: 900, fontSize: 70}}>{<E c="1f4f2" />} קבוצת הוואטסאפ</div>
      <Label color="#9BF5BE">עוקבים אחרי התוצאות בזמן אמת</Label>
    </Card>
    <Card from={31.5} to={39.8} top={230} accent={GOLD}>
      <div style={{fontWeight: 900, fontSize: 80}}>{<E c="1f381" />} <span style={{color: GOLD}}>10 ימי ניסיון</span></div>
      <div style={{fontWeight: 900, fontSize: 64}}>בחינם!</div>
    </Card>
  </>
);

// ---------- branding ----------
const Watermark: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const o = interpolate(t, [0.3, 0.8, OUTRO_START, OUTRO_START + 0.3], [0, 0.9, 0.9, 0], clamp);
  const k = 190 / 430; // crop triangle + wordmark from the 990px logo
  return (
    <div style={{position: 'absolute', top: 70, left: 36, width: 430 * k, height: 250 * k, overflow: 'hidden', opacity: o, mixBlendMode: 'screen'}}>
      <Img src={staticFile('logo.jpg')} style={{position: 'absolute', width: 990 * k, height: 990 * k, left: -280 * k, top: -325 * k}} />
    </div>
  );
};

const Progress: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const p = Math.min(1, t / OUTRO_START);
  if (t > OUTRO_START + 0.2) return null;
  return (
    <div style={{position: 'absolute', top: 0, right: 0, height: 10, width: `${p * 100}%`,
      background: `linear-gradient(270deg, ${PURPLE_LIGHT}, ${PURPLE})`, boxShadow: `0 0 20px ${PURPLE}`}} />
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  if (t < OUTRO_START) return null;
  const bgO = interpolate(t, [OUTRO_START, LOGO_SLAM], [0, 1], clamp);
  const s = spring({frame: f - Math.round((LOGO_SLAM - 0.15) * fps), fps, config: {damping: 9, stiffness: 120}});
  const txt = spring({frame: f - Math.round((LOGO_SLAM + 0.45) * fps), fps, config: {damping: 12}});
  const txt2 = spring({frame: f - Math.round((LOGO_SLAM + 0.8) * fps), fps, config: {damping: 12}});
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
          background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 0 50px #25D36688',
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
  return interpolate(t, [0, 0.4, SPEECH_END - 0.3, LOGO_SLAM - 0.2, TOTAL - 0.9, TOTAL], [0.1, 0.16, 0.16, 0.6, 0.6, 0], clamp);
};
// PER-VIDEO: sound effects - a whoosh on every card entrance, a ding when a money counter lands
const SFX: {t: number; s: 'whoosh' | 'ding'; v?: number}[] = [
  {t: 0.05, s: 'whoosh'}, {t: 2.9, s: 'whoosh'}, {t: 4.1, s: 'ding'}, {t: 7.45, s: 'whoosh'},
  {t: 9.95, s: 'whoosh', v: 0.3}, {t: 17.5, s: 'whoosh'}, {t: 18.9, s: 'ding'}, {t: 20.35, s: 'whoosh'},
  {t: 22.0, s: 'whoosh', v: 0.35}, {t: 24.25, s: 'whoosh'}, {t: 31.45, s: 'whoosh'}, {t: 31.6, s: 'ding', v: 0.3},
  {t: OUTRO_START, s: 'whoosh'},
];

export const Main: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#06040c'}}>
    <Background />
    <Sequence durationInFrames={Math.round(VIDEO_END * FPS)}>
      <Footage />
    </Sequence>
    <Watermark />
    <Overlays />
    <Captions />
    <CutFlash />
    <Progress />
    <Outro />
    <Sequence durationInFrames={Math.round(VIDEO_END * FPS)}>
      <Audio src={staticFile('src.mp4')} volume={1.15} />
    </Sequence>
    <Audio src={staticFile('music.wav')} volume={musicVol} />
    {SFX.map((x, i) => (
      <Sequence key={i} from={Math.round(x.t * FPS)} durationInFrames={45}>
        <Audio src={staticFile(`${x.s}.wav`)} volume={x.v ?? (x.s === 'ding' ? 0.35 : 0.22)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

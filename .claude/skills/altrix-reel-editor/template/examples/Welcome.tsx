import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';

/*
 * Welcome images for the ManyChat DM a viewer receives after clicking through from the reels.
 * 1080x1350 (Instagram 4:5). Two different looks that both echo the reels' visual language.
 */
export const IW = 1080;
export const IH = 1350;

const PURPLE = '#9B4DFF';
const PURPLE_LIGHT = '#D6A8FF';
const GOLD = '#FFD84D';
const GREEN = '#2BFF7A';
const WA = '#25D366';

const E: React.FC<{c: string; size?: number | string; style?: React.CSSProperties}> = ({c, size = '1em', style}) => (
  <Img src={staticFile(`emoji/${c}.svg`)} style={{width: size, height: size, verticalAlign: '-0.14em', ...style}} />
);
const Logo: React.FC<{w: number; tagline?: boolean}> = ({w, tagline = true}) => {
  // crop of the 990px logo: triangle + wordmark (+ tagline)
  const cw = 470, ch = tagline ? 300 : 250, k = w / cw;
  return (
    <div style={{width: w, height: ch * k, overflow: 'hidden', position: 'relative', mixBlendMode: 'screen',
      WebkitMaskImage: 'radial-gradient(ellipse 60% 62% at 50% 50%, #000 45%, transparent 100%)'}}>
      <Img src={staticFile('logo.jpg')} style={{position: 'absolute', width: 990 * k, height: 990 * k, left: -260 * k, top: -318 * k}} />
    </div>
  );
};

// ---------------------------------------------------------------- design 1: purple neon tech
const Ticket: React.FC<{side: string; col: string; profit?: string; x: number; y: number; rot: number}> = ({side, col, profit, x, y, rot}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, display: 'flex', alignItems: 'center', gap: 12, direction: 'ltr',
    background: 'rgba(12,5,26,0.92)', border: `3px solid ${col}`, borderRadius: 20, padding: '10px 18px', boxShadow: `0 0 34px ${col}88`, fontFamily: 'Heebo'}}>
    <div style={{background: col, color: '#0b0414', fontWeight: 900, fontSize: 28, padding: '2px 12px', borderRadius: 8}}>{side}</div>
    <div style={{color: '#fff', fontWeight: 800, fontSize: 28}}>XAUUSD</div>
    {profit && <div style={{color: '#6BFF9E', fontWeight: 900, fontSize: 30}}>{profit}</div>}
  </div>
);

const Benefit: React.FC<{accent: string; icon: React.ReactNode; children: React.ReactNode; tag?: React.ReactNode}> = ({accent, icon, children, tag}) => (
  <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 28, padding: '28px 34px', borderRadius: 34, marginBottom: 26,
    background: 'linear-gradient(145deg, rgba(46,16,90,0.92), rgba(14,6,30,0.92))', border: `3px solid ${accent}`,
    boxShadow: `0 0 50px ${accent}66, inset 0 0 40px ${accent}22`}}>
    <div style={{width: 120, height: 120, borderRadius: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(circle, ${accent}55, ${accent}11)`, border: `2px solid ${accent}aa`}}>{icon}</div>
    <div style={{fontWeight: 900, fontSize: 50, lineHeight: 1.18, color: '#fff', textAlign: 'right'}}>{children}</div>
    {tag}
  </div>
);

const ChatIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M32 6C17.6 6 6 16.9 6 30.3c0 5.2 1.8 10 4.8 13.9L8 56l12.4-3.9c3.5 1.6 7.5 2.5 11.6 2.5 14.4 0 26-10.9 26-24.3S46.4 6 32 6z" fill={WA} />
    <path d="M23 21c.9-.9 2.3-.8 3 .2l2.4 3.4c.6.9.5 2-.2 2.8l-1.3 1.3c1.4 3 3.9 5.5 6.9 6.9l1.3-1.3c.8-.7 1.9-.8 2.8-.2l3.4 2.4c1 .7 1.1 2.1.2 3l-1.6 1.6c-1.4 1.4-3.6 1.8-5.4.9-5.6-2.8-10.1-7.3-12.9-12.9-.9-1.8-.5-4 .9-5.4z" fill="#fff" />
  </svg>
);

export const Welcome1: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 22%, #3b1470 0%, #140828 45%, #05030a 100%)', fontFamily: 'Heebo', direction: 'rtl', overflow: 'hidden'}}>
    {/* perspective grid floor */}
    <div style={{position: 'absolute', left: -600, right: -600, top: 820, height: 900, opacity: 0.35,
      backgroundImage: `linear-gradient(${PURPLE}66 2px, transparent 2px), linear-gradient(90deg, ${PURPLE}66 2px, transparent 2px)`, backgroundSize: '110px 110px',
      transform: 'perspective(800px) rotateX(62deg)', transformOrigin: '50% 0%'}} />
    {/* falling code streaks like the logo */}
    {new Array(46).fill(0).map((_, i) => {
      const x = random('cx' + i) * IW, h = 60 + random('ch' + i) * 220, y = random('cy' + i) * IH;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: 2, height: h, opacity: 0.25 + random('co' + i) * 0.35,
        background: `linear-gradient(180deg, transparent, ${i % 5 ? PURPLE_LIGHT : GREEN})`}} />;
    })}
    {new Array(30).fill(0).map((_, i) => (
      <div key={'p' + i} style={{position: 'absolute', left: random('px' + i) * IW, top: random('py' + i) * IH, width: 6, height: 6, borderRadius: 3,
        background: i % 3 ? PURPLE_LIGHT : GOLD, opacity: 0.55, boxShadow: `0 0 12px ${PURPLE_LIGHT}`}} />
    ))}

    <div style={{position: 'absolute', top: 36, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Logo w={300} /></div>

    {/* title */}
    <div style={{position: 'absolute', top: 232, left: 0, right: 0, textAlign: 'center'}}>
      <div style={{fontWeight: 900, fontSize: 104, lineHeight: 1, color: '#fff', textShadow: `0 0 40px ${PURPLE}`}}>ברוכים הבאים</div>
      <div style={{fontWeight: 900, fontSize: 152, lineHeight: 1.05, marginTop: 6,
        backgroundImage: `linear-gradient(100deg, ${GOLD} 0%, #fff6c9 38%, ${GOLD} 55%, #E0A800 100%)`, WebkitBackgroundClip: 'text', color: 'transparent',
        filter: `drop-shadow(0 0 30px ${GOLD}77)`}}>לאלטריקס!</div>
    </div>

    {/* bonus ribbon */}
    <div style={{position: 'absolute', top: 540, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: 'rotate(-3deg)', background: `linear-gradient(135deg, ${GOLD}, #E0A800)`, color: '#1a0b33', fontWeight: 900, fontSize: 56,
        padding: '10px 44px', borderRadius: 60, boxShadow: `0 12px 0 #00000055, 0 0 50px ${GOLD}88`, border: '4px solid #fff'}}>
        <E c="1f381" /> קבלו מאיתנו בונוס
      </div>
    </div>

    <div style={{position: 'absolute', top: 680, left: 60, right: 60}}>
      <Benefit accent={WA} icon={<ChatIcon size={82} />}>
        הצטרפו לקבוצת הוואטסאפ <span style={{color: '#7CF5A8'}}>החינמית</span> שלנו!
      </Benefit>
      <Benefit accent={GOLD} icon={<E c="1f916" size={84} />}
        tag={<div style={{position: 'absolute', left: -18, top: -30, transform: 'rotate(-10deg)', background: GREEN, color: '#062a14', fontWeight: 900,
          fontSize: 34, padding: '6px 18px', borderRadius: 16, border: '3px solid #fff', boxShadow: `0 0 26px ${GREEN}`}}>חינם!</div>}>
        קבלו את רובוט המסחר שלנו <span style={{color: GOLD}}>בחינם ל-10 ימים!</span>
      </Benefit>
    </div>

    {/* reel echoes: trade tickets */}
    <Ticket side="BUY" col={GREEN} x={40} y={70} rot={-9} />
    <Ticket side="CLOSE" col={GOLD} profit="+$18.11" x={680} y={24} rot={7} />

    {/* CTA */}
    <div style={{position: 'absolute', top: 1100, left: 0, right: 0, textAlign: 'center'}}>
      <div style={{display: 'inline-block', fontWeight: 800, fontSize: 44, color: '#fff', padding: '16px 40px', borderRadius: 60,
        background: 'rgba(155,77,255,0.25)', border: `2px solid ${PURPLE_LIGHT}`, boxShadow: `0 0 40px ${PURPLE}88`}}>
        לחצו על הכפתור למטה כדי לקבל את הגישה
      </div>
      <div style={{marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.55}}>
        {[1, 0.6, 0.3].map((o, i) => (
          <svg key={i} width="84" height="44" viewBox="0 0 84 44" style={{opacity: o, filter: `drop-shadow(0 0 10px ${GOLD})`}}>
            <path d="M8 8 L42 36 L76 8" stroke={GOLD} strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- design 2: black & gold luxury
const G1 = '#8a6417', G2 = '#f7e08b', G3 = '#c9971c', G4 = '#fff6d0';
const goldText: React.CSSProperties = {
  backgroundImage: `linear-gradient(180deg, ${G4} 0%, ${G2} 30%, ${G3} 58%, ${G1} 78%, ${G2} 100%)`, WebkitBackgroundClip: 'text', color: 'transparent',
};

const Phone: React.FC = () => (
  <div style={{width: 380, height: 600, borderRadius: 54, background: '#0d0d0d', padding: 12, border: `3px solid ${G3}`,
    boxShadow: `0 40px 90px rgba(0,0,0,0.8), 0 0 60px ${G3}55`, transform: 'rotate(-7deg)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', background: '#efeae2', position: 'relative', fontFamily: 'Heebo', direction: 'rtl'}}>
      <div style={{height: 110, background: '#f0f2f5', display: 'flex', alignItems: 'center', gap: 12, padding: '26px 18px 0', borderBottom: '1px solid #d1d7db'}}>
        <div style={{width: 58, height: 58, borderRadius: 29, background: '#0c0618', overflow: 'hidden'}}><Img src={staticFile('logo.jpg')} style={{width: 58, height: 58}} /></div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: 24, fontWeight: 800, color: '#111b21'}}>Altrix Gold Bot</div>
          <div style={{fontSize: 18, color: '#008069'}}>קבוצה · מחובר/ת</div>
        </div>
      </div>
      <div style={{padding: '18px 14px'}}>
        {[
          {me: false, t: <>ברוכים הבאים לקבוצה! <E c="1f389" /></>},
          {me: true, t: <>מתקינים לי? <E c="1f64f" /></>},
          {me: false, t: <>בטח! הכל עלינו <E c="2705" /></>},
        ].map((m, i) => (
          <div key={i} style={{display: 'flex', justifyContent: m.me ? 'flex-start' : 'flex-end', marginBottom: 12}}>
            <div style={{maxWidth: 290, background: m.me ? '#d9fdd3' : '#fff', borderRadius: m.me ? '16px 0 16px 16px' : '0 16px 16px 16px', padding: '10px 14px',
              fontSize: 23, color: '#111b21', boxShadow: '0 1px 1px rgba(0,0,0,0.13)', textAlign: 'right'}}>{m.t}</div>
          </div>
        ))}
        {/* equity card like the reels' profit gauge */}
        <div style={{marginTop: 8, background: '#fff', borderRadius: 16, padding: 14, boxShadow: '0 1px 1px rgba(0,0,0,0.13)'}}>
          <div style={{fontSize: 18, color: '#667781', textAlign: 'right'}}>XAUUSD · מסחר אוטומטי</div>
          <svg width="100%" height="90" viewBox="0 0 300 90" preserveAspectRatio="none">
            <defs><linearGradient id="eq" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#00a884" stopOpacity="0.35" /><stop offset="1" stopColor="#00a884" stopOpacity="0" /></linearGradient></defs>
            <path d="M0 78 L30 72 L55 75 L85 60 L110 64 L140 48 L170 52 L200 34 L230 38 L260 20 L300 10 L300 90 L0 90Z" fill="url(#eq)" />
            <path d="M0 78 L30 72 L55 75 L85 60 L110 64 L140 48 L170 52 L200 34 L230 38 L260 20 L300 10" stroke="#00a884" strokeWidth="4" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const Seal: React.FC = () => {
  const n = 24, R = 125, r = 108;
  const pts = new Array(n * 2).fill(0).map((_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r : R;
    return `${130 + Math.cos(a) * rr},${130 + Math.sin(a) * rr}`;
  }).join(' ');
  return (
    <div style={{position: 'relative', width: 260, height: 260, transform: 'rotate(10deg)', filter: `drop-shadow(0 16px 30px rgba(0,0,0,0.7)) drop-shadow(0 0 30px ${G3}88)`}}>
      <svg width="260" height="260">
        <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={G4} /><stop offset="0.45" stopColor={G2} /><stop offset="0.7" stopColor={G3} /><stop offset="1" stopColor={G1} /></linearGradient></defs>
        <polygon points={pts} fill="url(#sg)" />
        <circle cx="130" cy="130" r="92" fill="none" stroke="#5a3f08" strokeWidth="3" strokeDasharray="4 6" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2a1c02', fontFamily: 'Rubik'}}>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 2}}>בונוס</div>
        <div style={{fontWeight: 900, fontSize: 92, lineHeight: 0.95, direction: 'ltr'}}>10</div>
        <div style={{fontWeight: 800, fontSize: 30}}>ימים חינם</div>
      </div>
    </div>
  );
};

export const Welcome2: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 18%, #2e2410 0%, #0d0b07 45%, #000 100%)', fontFamily: 'Rubik', direction: 'rtl', overflow: 'hidden'}}>
    {/* diagonal gold light lines */}
    {new Array(9).fill(0).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: -200 + i * 180, top: -200, width: 2, height: 1900, transform: 'rotate(28deg)', transformOrigin: '0 0',
        background: `linear-gradient(180deg, transparent, ${G2}33, transparent)`}} />
    ))}
    {/* gold candlestick skyline at the bottom */}
    {new Array(30).fill(0).map((_, i) => {
      const h = 60 + i * 9 + random('k' + i) * 90, up = random('u' + i) > 0.3;
      return <div key={i} style={{position: 'absolute', left: 8 + i * 36, bottom: 0, width: 20, height: h, opacity: 0.22, borderRadius: 3,
        background: up ? `linear-gradient(180deg, ${G2}, ${G1})` : 'linear-gradient(180deg, #6b5a3a, #2a2215)'}} />;
    })}
    {/* bokeh */}
    {new Array(22).fill(0).map((_, i) => {
      const s = 10 + random('bs' + i) * 40;
      return <div key={'b' + i} style={{position: 'absolute', left: random('bx' + i) * IW, top: random('by' + i) * IH, width: s, height: s, borderRadius: s,
        background: G2, opacity: 0.06 + random('bo' + i) * 0.12, filter: 'blur(2px)'}} />;
    })}

    {/* header */}
    <div style={{position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Logo w={210} tagline={false} /></div>
    <div style={{position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center'}}>
      <div style={{fontFamily: 'Secular One', fontSize: 92, lineHeight: 1, color: '#fff', letterSpacing: 1}}>ברוכים הבאים</div>
      <div style={{fontFamily: 'Secular One', fontSize: 148, lineHeight: 1.08, ...goldText, filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.6)) drop-shadow(0 0 26px rgba(247,224,139,0.35))'}}>לאלטריקס!</div>
      <div style={{margin: '18px auto 0', width: 520, height: 3, background: `linear-gradient(90deg, transparent, ${G2}, transparent)`}} />
    </div>

    {/* middle: phone (left) + benefits (right) */}
    <div style={{position: 'absolute', top: 540, left: 40}}><Phone /></div>
    <div style={{position: 'absolute', top: 440, left: 300}}><Seal /></div>
    <div style={{position: 'absolute', top: 610, right: 40, width: 600}}>
      <div style={{display: 'inline-block', fontWeight: 800, fontSize: 46, color: '#1d1403', padding: '8px 30px', borderRadius: 12, marginBottom: 46,
        background: `linear-gradient(180deg, ${G4}, ${G3})`, boxShadow: '0 8px 0 rgba(0,0,0,0.5)'}}>קבלו מאיתנו בונוס</div>
      {[
        <>הצטרפו לקבוצת<br />הוואטסאפ <span style={goldText}>החינמית</span> שלנו!</>,
        <>קבלו את רובוט המסחר<br />שלנו <span style={goldText}>בחינם ל-10 ימים!</span></>,
      ].map((txt, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 56}}>
          <div style={{width: 64, height: 64, borderRadius: 32, flexShrink: 0, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(180deg, ${G2}, ${G3})`, boxShadow: `0 0 24px ${G3}88`}}>
            <svg width="34" height="34" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" stroke="#1d1403" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{fontWeight: 800, fontSize: 48, lineHeight: 1.28, color: '#fff', textAlign: 'right', whiteSpace: 'nowrap'}}>{txt}</div>
        </div>
      ))}
    </div>

    {/* CTA */}
    <div style={{position: 'absolute', top: 1190, left: 0, right: 0, textAlign: 'center'}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 18, fontWeight: 700, fontSize: 42, color: G4, padding: '18px 44px', borderRadius: 60,
        border: `3px solid ${G3}`, background: 'rgba(0,0,0,0.55)', boxShadow: `0 0 40px ${G3}55`}}>
        לחצו על הכפתור למטה כדי לקבל את הגישה
        <svg width="46" height="46" viewBox="0 0 24 24"><path d="M12 4v14M5 12l7 7 7-7" stroke={G2} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- design 3: light glassmorphism fintech
const Coin: React.FC<{x: number; y: number; s: number; rot: number}> = ({x, y, s, rot}) => (
  <div style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', transform: `rotate(${rot}deg) scaleY(0.92)`,
    background: 'radial-gradient(circle at 35% 30%, #fff6c9 0%, #f7d25a 28%, #d9a520 60%, #9c6a0c 100%)',
    boxShadow: `0 ${s * 0.12}px ${s * 0.25}px rgba(120,80,0,0.35), inset 0 0 0 ${s * 0.06}px #f3c64a, inset 0 0 0 ${s * 0.1}px #b98314`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rubik', fontWeight: 900, fontSize: s * 0.45, color: '#8a5d05'}}>$</div>
);

export const Welcome3: React.FC = () => (
  <AbsoluteFill style={{background: '#f4f1fb', fontFamily: 'Rubik', direction: 'rtl', overflow: 'hidden'}}>
    {/* soft gradient mesh blobs */}
    {[['#b58cff', -180, -160, 760], ['#7fe3c7', 620, 180, 640], ['#ffd27a', -120, 820, 620], ['#9fb6ff', 640, 900, 700]].map(([c, x, y, s], i) => (
      <div key={i} style={{position: 'absolute', left: x as number, top: y as number, width: s as number, height: s as number, borderRadius: '50%',
        background: c as string, filter: 'blur(110px)', opacity: 0.75}} />
    ))}
    <Coin x={850} y={975} s={150} rot={-15} />
    <Coin x={950} y={1070} s={96} rot={20} />
    <Coin x={40} y={1000} s={120} rot={12} />

    {/* header */}
    <div style={{position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 26px', borderRadius: 40, background: 'rgba(255,255,255,0.6)',
        border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 30px rgba(80,40,160,0.12)', direction: 'ltr'}}>
        <div style={{width: 46, height: 46, borderRadius: 12, overflow: 'hidden', background: '#0c0618'}}><Img src={staticFile('logo.jpg')} style={{width: 46, height: 46, transform: 'scale(1.9)'}} /></div>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 6, color: '#2a1260'}}>ALTRIX</div>
      </div>
    </div>
    <div style={{position: 'absolute', top: 180, left: 60, right: 60, textAlign: 'center'}}>
      <div style={{fontWeight: 800, fontSize: 96, lineHeight: 1.05, color: '#1b0f3d'}}>ברוכים הבאים</div>
      <div style={{fontWeight: 900, fontSize: 140, lineHeight: 1.08, backgroundImage: 'linear-gradient(90deg, #7b2ff7 0%, #b14bff 45%, #f2a900 100%)',
        WebkitBackgroundClip: 'text', color: 'transparent'}}>לאלטריקס!</div>
    </div>

    {/* glass card */}
    <div style={{position: 'absolute', top: 540, left: 60, right: 60, borderRadius: 44, padding: '56px 44px 40px', background: 'rgba(255,255,255,0.55)',
      border: '2px solid rgba(255,255,255,0.95)', boxShadow: '0 30px 80px rgba(60,20,140,0.18)', backdropFilter: 'blur(20px)'}}>
      <div style={{position: 'absolute', top: -34, right: 44, background: 'linear-gradient(135deg, #7b2ff7, #b14bff)', color: '#fff', fontWeight: 800, fontSize: 40,
        padding: '10px 30px', borderRadius: 30, boxShadow: '0 12px 30px rgba(123,47,247,0.45)'}}><E c="1f381" /> קבלו מאיתנו בונוס</div>
      {[
        {bg: 'linear-gradient(135deg, #25D366, #0fa958)', icon: <ChatIcon size={70} />, t: <>הצטרפו לקבוצת הוואטסאפ<br /><b style={{color: '#0c9a4f'}}>החינמית</b> שלנו!</>},
        {bg: 'linear-gradient(135deg, #ffd24d, #f2a900)', icon: <E c="1f916" size={70} />, t: <>קבלו את רובוט המסחר שלנו<br /><b style={{color: '#7b2ff7'}}>בחינם ל-10 ימים!</b></>},
      ].map((r, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 28, padding: '34px 0', borderTop: i ? '2px dashed rgba(90,50,170,0.18)' : 'none'}}>
          <div style={{width: 124, height: 124, borderRadius: 32, background: r.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 26px rgba(0,0,0,0.15)'}}>{r.icon}</div>
          <div style={{fontWeight: 700, fontSize: 50, lineHeight: 1.25, color: '#1b0f3d', textAlign: 'right'}}>{r.t}</div>
        </div>
      ))}
    </div>

    {/* mini chart chip */}
    <div style={{position: 'absolute', top: 440, left: 60, transform: 'rotate(-6deg)', padding: '14px 20px', borderRadius: 24, background: 'rgba(255,255,255,0.8)',
      boxShadow: '0 14px 34px rgba(60,20,140,0.18)', direction: 'ltr', display: 'flex', alignItems: 'center', gap: 14}}>
      <svg width="120" height="50" viewBox="0 0 120 50"><path d="M2 44 L20 38 L34 40 L50 28 L64 31 L80 18 L96 20 L118 4" stroke="#0fa958" strokeWidth="5" fill="none" strokeLinecap="round" /></svg>
      <div style={{fontWeight: 800, fontSize: 26, color: '#1b0f3d'}}>XAUUSD<div style={{color: '#0fa958', fontSize: 22}}>AUTO ●</div></div>
    </div>

    {/* CTA */}
    <div style={{position: 'absolute', top: 1150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '24px 46px', borderRadius: 60, background: '#1b0f3d', color: '#fff', fontWeight: 700, fontSize: 40,
        boxShadow: '0 20px 40px rgba(27,15,61,0.35)'}}>
        לחצו על הכפתור למטה כדי לקבל את הגישה
        <div style={{width: 56, height: 56, borderRadius: 28, background: 'linear-gradient(135deg, #7b2ff7, #f2a900)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 4v14M5 12l7 7 7-7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- design 4: VIP access pass (neon green terminal)
const NEON = '#39FF88';
const Barcode: React.FC<{w: number; h: number}> = ({w, h}) => (
  <div style={{display: 'flex', alignItems: 'stretch', gap: 3, width: w, height: h, direction: 'ltr'}}>
    {new Array(46).fill(0).map((_, i) => <div key={i} style={{flex: random('bc' + i) > 0.6 ? 3 : 1, background: '#0b1a12'}} />)}
  </div>
);

export const Welcome4: React.FC = () => (
  <AbsoluteFill style={{background: '#040806', fontFamily: 'Heebo', direction: 'rtl', overflow: 'hidden'}}>
    {/* rising candle wall */}
    {new Array(26).fill(0).map((_, i) => {
      const base = 900 - i * 22 + (random('w' + i) - 0.5) * 120, h = 60 + random('wh' + i) * 160, up = random('wu' + i) > 0.28;
      return <div key={i} style={{position: 'absolute', left: 20 + i * 41, top: base, width: 22, height: h, borderRadius: 4, opacity: 0.28,
        background: up ? NEON : '#ff4d6a', boxShadow: up ? `0 0 18px ${NEON}` : 'none'}} />;
    })}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 0%, rgba(4,8,6,0.55) 55%, #040806 100%)'}} />
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${NEON}14 1px, transparent 1px), linear-gradient(90deg, ${NEON}14 1px, transparent 1px)`, backgroundSize: '54px 54px'}} />

    {/* ticker tape */}
    <div style={{position: 'absolute', top: 40, left: -40, right: -40, height: 64, background: NEON, transform: 'rotate(-2deg)', display: 'flex', alignItems: 'center',
      gap: 40, whiteSpace: 'nowrap', direction: 'ltr', fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 30, color: '#04140a', paddingLeft: 30}}>
      {new Array(4).fill(0).map((_, i) => <span key={i}>ALTRIX GOLD BOT ▲ AUTO-TRADING ● XAUUSD ▲ 10 DAYS FREE ●</span>)}
    </div>

    <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
      <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: '#fff'}}>ברוכים הבאים</div>
      <div style={{fontWeight: 900, fontSize: 150, lineHeight: 1.05, color: NEON, textShadow: `0 0 30px ${NEON}aa, 0 0 80px ${NEON}55`}}>לאלטריקס!</div>
    </div>

    {/* VIP pass */}
    <div style={{position: 'absolute', top: 450, left: 70, right: 70, height: 640, transform: 'rotate(-2.5deg)'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 36, background: 'linear-gradient(160deg, #f4fff8 0%, #dffbea 100%)', boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 60px ${NEON}55`}} />
      {/* perforation */}
      <div style={{position: 'absolute', top: 470, left: 30, right: 30, borderTop: '5px dashed #9ad9b2'}} />
      <div style={{position: 'absolute', top: 440, left: -34, width: 68, height: 68, borderRadius: 34, background: '#040806'}} />
      <div style={{position: 'absolute', top: 440, right: -34, width: 68, height: 68, borderRadius: 34, background: '#040806'}} />
      <div style={{position: 'absolute', top: 30, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{background: '#04140a', color: NEON, fontWeight: 900, fontSize: 38, padding: '8px 24px', borderRadius: 14, direction: 'ltr', letterSpacing: 4}}>VIP PASS</div>
        <div style={{fontWeight: 900, fontSize: 44, color: '#04140a'}}><E c="1f381" /> קבלו מאיתנו בונוס</div>
      </div>
      <div style={{position: 'absolute', top: 140, left: 40, right: 40}}>
        {[
          {icon: <ChatIcon size={70} />, t: <>הצטרפו לקבוצת הוואטסאפ<br /><span style={{color: '#0c9a4f'}}>החינמית</span> שלנו!</>},
          {icon: <E c="1f916" size={70} />, t: <>קבלו את רובוט המסחר שלנו<br /><span style={{color: '#0c9a4f'}}>בחינם ל-10 ימים!</span></>},
        ].map((r, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 44}}>
            <div style={{width: 108, height: 108, borderRadius: 24, background: '#04140a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{r.icon}</div>
            <div style={{fontWeight: 900, fontSize: 48, lineHeight: 1.2, color: '#04140a', textAlign: 'right'}}>{r.t}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 505, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{direction: 'ltr', fontFamily: '"DejaVu Sans Mono", monospace', color: '#04140a'}}>
          <div style={{fontSize: 22, opacity: 0.6}}>ACCESS</div>
          <div style={{fontSize: 44, fontWeight: 700}}>10 DAYS · FREE</div>
        </div>
        <Barcode w={330} h={90} />
      </div>
    </div>

    {/* CTA */}
    <div style={{position: 'absolute', top: 1160, left: 0, right: 0, textAlign: 'center'}}>
      <div style={{fontWeight: 800, fontSize: 44, color: '#fff'}}>לחצו על הכפתור למטה כדי לקבל את הגישה</div>
      <div style={{marginTop: 16, display: 'inline-block', padding: '8px 40px', borderRadius: 40, border: `3px solid ${NEON}`, boxShadow: `0 0 26px ${NEON}88`}}>
        <svg width="48" height="48" viewBox="0 0 24 24"><path d="M12 4v14M5 12l7 7 7-7" stroke={NEON} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  </AbsoluteFill>
);

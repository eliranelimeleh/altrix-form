# Altrix reel house style

Approved by the user on the first reel (gold trading bot, Sep 2026). Keep these unless the user
asks otherwise; the reason is given so you can adapt sensibly when a video doesn't fit.

## Brand
- Logo: `assets/logo.jpg` - glowing purple triangle + "ALTRIX / THE TECH BEHIND TRADING" on near-black.
  Its black background disappears with `mix-blend-mode: screen`, so it can sit on any dark layer.
- Colours: purple `#9B4DFF`, light purple `#D6A8FF`, gold `#FFD84D` (highlights), money green
  `#6BFF9E` with `#2BFF7A` glow, LIVE red `#FF3355`, WhatsApp green `#25D366`.
  Background: radial `#2a0f4d → #0c0618 → #05030a`.
- Font: Heebo 900 (captions, headlines), 800 (labels). Emoji: Twemoji SVGs.

## Layout (1080×1920, 30fps)
- Instagram covers the bottom ~20% and the right edge with UI - keep text between y≈0.10 and 0.75.
- Captions: centred block at top=1210. Cards: top≈200-230, or ≈860 when the recording's top area
  must stay visible. Zoom focus goes to ty≈0.40, so captions never hide the number being shown.
- Small logo watermark top-left (190px, opacity 0.9) and a purple progress bar across the top.

## Captions
- 2-3 words per chunk, shown whole with the unspoken words at 45% opacity; the active word gets a
  purple gradient pill with glow and a 12% spring pop; highlighted words are gold with glow.
- 12px dark stroke (`paint-order: stroke fill`) keeps white text readable on white app screens.
- Why: screen recordings are mostly white UI; plain white subtitles disappear on them.

## Motion
- Constant slow drift (+0.08 scale over the reel) so it never looks static.
- Zoom shots ease in 0.45s / out 0.4s; small 5% punches on emphasis words and at screen changes.
- Screen changes get a purple flash + 0.12s blur - hides the jump of the raw recording.
- Cards spring in with a slight rotation, float gently, and drop out with a back-ease.
- Money counters count up in ~1.1-1.3s with ease-out, then a scale pop, then a cash-emoji burst
  that flies from below the card (drawn beneath the cards so it never covers the number).

## Outro (~3s)
Footage zooms and blurs out → logo slams in from 2.2× with blur, on a purple radial glow, pulsing
gently → offer line in gold → green CTA pill. Music impact on the slam.

## Audio
- Voice at 1.15, music 0.10→0.16 under speech, 0.6 in the outro, faded over the last 0.9s.
- Original synthesized track (128 BPM A-minor synthwave/tech-house: four-on-the-floor kick,
  offbeat saw bass, 16th arp, sidechain pump). One light bar under the hook, then the drop.
- Final loudness -14 LUFS, true peak -1.5 dB (Instagram's normalisation target).

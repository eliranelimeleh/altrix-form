---
name: altrix-reels
description: Produce ALTRIX-branded Hebrew educational trading reels (Instagram/TikTok/Shorts, 1080x1920) with the owner's cloned ElevenLabs voice ("אלירן 2"), TradingView-style animated charts, kinetic captions, transitions, music and SFX, ending with a FOLLOW call-to-action. Use for any request to make or edit a trading/TradingView/candles/market-structure video or reel for ALTRIX.
---

# ALTRIX reels

**Standing rule from the brand owner:** every time videos are requested, make a NEW topic with new
practical value (pick from `videos/TOPICS.md`, never repeat a topic listed under "נעשו"), at exactly
the same level of design, editing, pace and quality as v1/v2. Do not simplify. After delivering,
move the topic to "נעשו". Every finished video is also copied to the repo-root folder
`ALTRIX VIDEOS BY CLAUDE/` as `NN - <title>.mp4` (`videos/tools/publish.sh <id>`, run automatically by
`build.sh`); commit and push that folder so the owner gets every video. The full playbook (content formula, design system, editing grammar,
voice, sound, QA checklist, known pitfalls) is `videos/AGENT_GUIDE.md`. Read it before writing a
new video.

Everything lives in `videos/`. A video is one script JSON plus one scene file; the
pipeline does the rest and every animation is synced to the real voice timestamps.

## Pipeline

```
./videos/build.sh v1 v2          # full build -> videos/out/altrix_<id>.mp4
./videos/build.sh v1 --preview   # no voice: estimated timing, marked PREVIEW
node videos/tools/render.mjs v1 --stills hook@0.5,bos@0.9   # review frames -> build/v1/stills
```

1. `tools/tts.py <id>`: ElevenLabs `with-timestamps` on the whole script (voice
   `VOICE_NAME`, default `אלירן 2`; model: first match of `v4`, `eleven_v3`,
   `eleven_multilingual_v2`, override with `MODEL_ID`). Cuts pauses over
   `MAX_GAP` (0.32s) and speeds the read up to `TARGET_WPS` (2.9 words/s, max x1.15)
   for a fast pace. Writes `build/<id>/voice.wav` and `timeline.json` (segments + words).
   The key is `ELEVENLABS_API_KEY` (env var or the environment's network secret).
   No key means it falls back to preview mode.
2. `tools/render.mjs <id>`: headless Chromium draws `src/render.html?v=<id>`
   frame by frame (30fps, about 6 fps render speed) and writes `build/<id>/video.mp4`
   and `events.json` (SFX cue list).
3. `tools/audio.py <id>`: synth beat (112 BPM, Am-F-C-G) ducked under the voice,
   plus whoosh/impact/pop/click/key/riser SFX from the events.
4. ffmpeg mux, loudnorm -14 LUFS.

## Writing a new video

- `src/<id>.json`: `segments: [{id, say}]`, Hebrew, short punchy sentences, 55-80s total.
  Start with a hook, give one practical idea per segment, add a TradingView how-to,
  a recap, and end with the `cta` segment ("...תעשה פולו לאלטריקס...").
  `display` maps spoken tokens to on-screen text (e.g. `"צ'וק": "CHoCH"`); `keywords`,
  `green`, `red` color the caption words.
- `src/scenes_<id>.js`: `window.SCENES[segId] = {trans, captions, events(s), draw(ctx, s)}`.
  - `s.lt` is local time, `s.d` the duration, `s.cue('word', n)` the local time the n-th word
    containing 'word' is spoken. Hang every reveal/pop on a cue.
  - `trans`: `whip | zoom | glitch | flash | none` (none = continuous camera with the previous scene).
  - `events`: `[{lt, type: impact|pop|click|tick|key|riser|whoosh, k}]`, where `impact` also punches the camera.
- Engine toolkit (`src/engine.js`, `src/common.js`): `genCandles(pivots)`, `override`,
  `Chart` (layout/view/draw with reveal + forming candle, hline, zone, zigzag, tag, dot),
  `kf` camera keyframes, `text/wipeText/popT/pill/badge/glass/check/cross/arrow/ring/burst/keycap/cursor`,
  `drawBG` (purple glow + data rain, like the logo), `ctaDraw` (logo + FOLLOW tap).
- Layout safe zones: chart panel `[40,370,1000,970]`, top badges at y=300, captions at y≈1455,
  nothing important below y≈1600 (Instagram UI).

## Brand

Dark `#04020a` background, neon purple `#a855f7 / #c084fc`, teal accents, TradingView-like candles
(`#16c784` / `#f23645`), Heebo 800-900 for Hebrew, JetBrains Mono for numbers. Logo: `videos/assets/logo.jpg`
(drawn with `screen` blend so the black background disappears). Set `"handle": "@..."` in the
script JSON to print the Instagram handle on the end card.

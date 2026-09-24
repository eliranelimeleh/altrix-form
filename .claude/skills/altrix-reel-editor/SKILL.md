---
name: altrix-reel-editor
description: Edit raw videos into branded Altrix Instagram reels - animated Hebrew word-by-word captions, zooms on the key numbers, glowing purple cards with money counters, original synthesized music and SFX, and the Altrix logo outro - and make matching campaign images (ManyChat / DM welcome images, promo posts). Use this whenever the user sends a video (a Drive link, a file, a screen recording of trading results, a talking-head clip) and wants it edited, cut, subtitled, animated, "made into a reel/story/TikTok", or asks for "כתוביות", "עריכה", "סרטון", "רילס", "הנפשות" or "מוזיקה לסרטון" - even if they don't mention Altrix or the style explicitly. Also use it for follow-up fixes to a reel made with this skill (moving or retexting a caption/card, cutting a phrase out, speeding it up), and for Altrix campaign images such as "תמונה לתגובה במאני צ'אט" or a welcome/bonus image that continues the reels' flow.
---

# Altrix reel editor

Turns a raw vertical video into a finished Instagram reel in the house style the user approved
("רמה גבוהה מאוד ... הכל מושלם"). The style is fixed; the per-video work is timing and content.
The approved reference implementation is `template/src/Main.tsx` - read it before editing.
Read `references/style.md` for the design rules and the reasons behind them.

The user writes in Hebrew and is not a developer: reply in Hebrew, keep updates short, and send
the finished video with `SendUserFile` (limit 30MB - the delivery encode is sized for that).

## Workflow

### 1. Get the video
- Drive link: `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`
  (the id is the part after `/d/` in the share link).
- If the download fails with a 403 from the proxy, the network policy is blocking it. Tell the user
  which hosts to allow (`drive.google.com`, `drive.usercontent.google.com`, and `huggingface.co` +
  `cdn-lfs.huggingface.co` for the transcription model) and prepare everything else meanwhile.
- Ask only for what's missing: platform (default Instagram 9:16), vibe (default energetic), the
  CTA (default: WhatsApp group + free trial), music (default: synthesize - never download
  copyrighted tracks).

### 2. Set up
```bash
bash <skill>/scripts/setup.sh <scratchpad>/reel <path/to/src.mp4>
```
Installs ffmpeg (via imageio-ffmpeg), Whisper, Pillow/numpy/scipy, copies the Remotion template
into `<work>/rem`, installs npm deps, Twemoji SVGs, logo and the synthesized SFX.
Chromium is at `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`
(render scripts find it automatically).

### 3. Understand the video
- `ffmpeg -i src.mp4` for duration/resolution. Phone recordings are 9:16. **Desktop recordings
  (16:9, MT5 / TradingView)** use `template/examples/Landscape.Main.tsx` (reel #3): a virtual 9:16
  camera pans and zooms over the landscape frame (`SW/SH`, `CY0/CY1` for the black bands above and
  below the app window, `BASE.s = 1.15` so they never show). Frame the shot on what is being talked
  about - chart, trades table, Profit column, equity graph - never squeeze the whole desktop in.
- Contact sheet (`fps=1/3,scale=270:-1,tile=5x3`) and look at it. Then grab single frames at the
  moments the speaker mentions numbers/results - you need exact positions for the zooms.
- Scene changes: `-vf "scale=180:-1,select='gt(scene,0.04)',showinfo"` → `CUTS`.
- Measure black side bars of screen recordings → `CONTENT_X0/X1`, `BASE_S = 1/(x1-x0)`.

### 3b. Pace: speed-up and removed phrases
- **"Faster but not super fast, voice natural"** → `scripts/speed.sh IN src.mp4 <hook_end> 1.2`
  before setup: the shock hook stays 1.0x, everything after at 1.2x with pitch-preserving atempo
  (74s → 63s in reel #3). Transcribe the sped-up file, not the original.
- **"Remove this sentence / this section"** → don't cut the source. Keep the composition on its
  full timeline, render it **without the music track**, then
  `scripts/cut_and_mix.py IN_hq.mp4 music.wav OUT --cut A-B ... --outro <new LOGO_SLAM>` deletes
  the passages sample-accurately and lays one continuous music bed over the new timeline
  (generate that music with new-timeline times: drop and impacts shift left by the cut lengths).
- Find A (end of the last kept word) with `scripts/find_cut.py audio.wav from to`. Hebrew words
  run into each other ("ככה או משהו"): the boundary is where the zero-crossing rate changes
  vowel, not the first energy dip - reel #3's first try cut 0.12s early and chopped "ככה" in half.
  Verify every join by transcribing the joined audio before rendering.
- Put a `CUTS` flash exactly on each join so the edit reads as a transition, and end the scene
  before a cut at the cut (e.g. hold the steps scene until the join) so no half-second of the
  removed part leaks in. Remove the cut words from `captions.ts`.

### 4. Transcribe
```bash
python3 <skill>/scripts/transcribe.py <work>/audio.wav
```
Fix the text by hand: spelling ("באיסטורי" → "בהיסטוריה"), English terms the model mangles
("ללסטמן" → `ל-Last Month`, nbsp keeps it one token), numbers as `1,200$`. If a segment
ends mid-word, re-run on that window (see the script docstring). Then write `captions.ts` RAW:
chunks of 2-3 words split with `|`, break at punctuation, `*` before words to highlight in gold
(money, "אוטומטי", "בחינם", "לייב", punchlines).

### 5. Fill the PER-VIDEO sections of `Main.tsx`
Every tunable is marked `PER-VIDEO`. Plan the reel as a beat sheet first (time → what the viewer
should notice), then map it:
- **Hook card** 0-2.7s at the top: the promise in ≤5 words.
- **Zoom SHOTS** on every number/proof the speaker points at. If the recording scrolls away from
  the number while it's being mentioned, use `FREEZE` to hold the frame (reel #1 did this for the
  weekly profit).
- **Counter cards** (`<Counter>`) for money figures + `<Burst>` of cash emoji ~1s after, and a
  `ding` SFX at the same moment.
- **Claim cards** for the key selling points (100% אוטומטי, LIVE not demo, WhatsApp group,
  free trial). Card top≈200-230 by default; use top≈860 (screen middle) when the top of the
  recording has something that must stay visible - the user asked for this on the LIVE card.
- **Outro** texts (the offer + CTA pill). Speech end → `OUTRO_START`.
- `SFX`: whoosh on each card entrance, ding on counters.

### 5b. High-energy mode (long static screen recordings)
When the user asks for a surprising hook, "more sounds and animations", or the recording has long
stretches where only the trading terminal is visible ("שטחים מתים"), start from
`template/examples/HighEnergy.Main.tsx` (reel #2, approved) instead of the plain template. It adds:
- **Shock hook**: `<Slam>` stickers per word ("רגע! רגע! רגע!"), screen shake (`SHAKES`), red alarm
  tint, giant emoji reactions (😱 🚨 📉), record scratch + boom SFX. Drop captions for words the
  stickers already show.
- **Full-screen `<Scene>`s** that take over dead footage while the voice continues: circle-wipe in,
  animated grid + particles, one idea each (robot "מסחר אוטומטי", giant "0 התעסקות", orbiting icons,
  gift + 1→10 counter, WhatsApp phone mock with pinging bubbles, ✅ checklist). Aim for something
  new on screen every 2-4 s; alternate scenes with footage zooms so the proof stays visible.
- **`<Ticket>`s** (BUY / SELL / CLOSE +$) popping on "פותח / סוגר / קונה / מוכר", a green
  `<Scanner>` line over the trades table, "לבד!" stamps growing on each repetition.
- Extra SFX from `sfx.py` (scratch, boom, pop, click, glitch, riser, sad, ping, swish) and music
  with `DROP=<payoff time>` so the beat drops on the hook's payoff line.
- **Don't reuse a transition the user has already seen.** Reel #3 was asked for "something more
  modern" than reel #2's robot scene; `Landscape.Main.tsx` has the replacements: `SceneBoot`
  (terminal typing "AI engine ONLINE / AUTO-TRADING ENABLED" + progress bar), `SceneKinetic`
  (giant words, gold gradient fill moving through "אוטומטי", light sweep), `ScenePanel` (the
  terminal as a floating 3D panel with LIVE badge + SVG gauge filling to 100%), `Nope` stickers
  struck through in red (for "SMT / וייקוף"). Keep a list of what each reel used and vary it.
- **Realistic WhatsApp chat** (`ChatPhone` in `Landscape.Main.tsx`): light WhatsApp UI, header with
  profile photo, "מקליד/ה…", ✓✓ turning blue, link-preview card with the logo, composer that types
  the draft and sends it. Profile photos come from `assets/faces/` - **AI-generated faces from
  thispersondoesnotexist.com, not real people** (never use a real person's photo without their
  consent). Keep the small `*הדמיה` tag: a staged chat in an ad must not pass as a real testimonial.
  Chat content = the CTA flow (asking to try, getting the link, joining), never invented profit claims.
- Final CTA without footage: `SceneSend` (typing and sending "אני רוצה להתחיל עם הרובוט 🚀",
  a welcome reply, happy faces popping around the phone with reactions).

### 6. Music
```bash
[DROP=<payoff-s>] python3 <skill>/scripts/music.py <work>/rem/public/music.wav <TOTAL+1> <big-number-time> <LOGO_SLAM>
```
Sub-drop impacts land on the big reveal and the logo slam. Music sits at 0.16 under speech,
rises to 0.6 for the outro (`musicVol`).

### 7. Check stills before rendering
Render stills at the key moments (hook, each zoom, each card, outro) with `--scale=0.4` and
look at them as a grid. Check: captions don't cover the zoom focus, no black bars, emoji render,
Hebrew reads right-to-left, nothing important hidden under a card. A full render costs ~5 min;
a still costs seconds.
```bash
npx remotion still src/index.ts Main out.png --frame=N --scale=0.4 --browser-executable=$B
```

### 8. Render & deliver
```bash
cd <work>/rem && bash <skill>/scripts/render.sh ../Reel_Name
```
Produces `Reel_Name_hq.mp4` (master) and `Reel_Name.mp4` (Instagram delivery, -14 LUFS, bitrate sized to ~28MB so it can be sent in chat).
Sample frames from the final file before sending. You can't hear the audio, so say that you
checked levels only.

### 9. Small follow-up fixes - use the fast path
For a visual change confined to a few seconds (move a card, change a word), don't re-render
everything:
```bash
cd <work>/rem && bash <skill>/scripts/patch.sh ../Reel_Name <startFrame> <endFrame>
```
Pick a range covering the card's full lifetime plus ~5 frames. ~1-1.5 min instead of ~5.
Audio changes (music, SFX) need the full `render.sh`.

## Campaign images (ManyChat welcome / DM images)
The image a viewer gets after clicking through from the reels should feel like the next frame of
the reel. Build it as a Remotion `<Still>` (1080×1350, Instagram 4:5) in the same project -
`template/examples/Welcome.tsx` has two approved looks and `Root.withStills.tsx` registers them:
- **Welcome1 - purple neon tech** (matches the reels): masked logo, huge white/gold title, gold
  "bonus" ribbon, two glass benefit cards (WhatsApp green, robot + "חינם!" tag), BUY/CLOSE tickets,
  perspective grid, CTA pill + gold chevrons pointing at the ManyChat button below the image.
- **Welcome2 - black & gold luxury**: Secular One title in metallic gold, tilted phone with the
  group chat + equity curve, gold "בונוס 10 ימים חינם" seal, gold check list, candlestick skyline.
- **Welcome3 - light glassmorphism fintech**: pastel gradient-mesh blobs, frosted glass card with
  app-style icon tiles, purple→gold gradient title, 3D CSS gold coins, dark CTA pill.
- **Welcome4 - VIP access pass**: black + neon green terminal grid, green ticker tape, the offer
  printed on a tilted "VIP PASS" ticket with perforation, barcode and "10 DAYS · FREE".
When asked for "another style", pick a direction none of these used (e.g. editorial/print,
3D render look, minimal mono) rather than recolouring one of them.
Use the user's exact wording; put explicit `<br />` line breaks in Hebrew list items (orphaned
"שלנו!" on its own line looked broken). Mask the logo edges (`WebkitMaskImage` radial) - its
background isn't pure black, so `mix-blend-mode: screen` alone leaves a visible rectangle.
Render: `npx remotion still src/index.ts Welcome1 out.png --browser-executable=$B`.
Extra fonts: `@fontsource/secular-one` (hebrew-400) and `@fontsource/rubik`, loaded in Root.

## Gotchas learned the hard way
- Headless Chromium can't paint color-emoji fonts - emoji render as nothing. Use the `<E c="1f4b0"/>`
  Twemoji component (codepoint file names in `public/emoji/`).
- Fonts load through `delayRender` in `Root.tsx`; keep it or the first frames render in a fallback font.
- Remotion `Sequence durationInFrames` must be > 0 - that's why `FREEZE` is nullable.
- A `<Burst>` inside a `<Scene>` paints over the scene's text no matter the DOM order or z-index
  (transformed children); keep bursts out of text areas or leave them out of that scene.
- `patch.sh` must keep 30fps (`concat ... ,fps=30` + `-r 30`); without it the spliced master came
  out 25fps, frames went missing and a later frame-indexed patch landed seconds off. Fixed - but
  if you splice by hand, check `ffmpeg -i` says 30 fps.
- Scripts run under `set -o pipefail`: `ffmpeg -i file` with no output exits 1, so wrap it
  (`(ffmpeg -i f 2>&1 || true) | grep ...`).
- A container is ephemeral: the work dir is lost when the session ends. If the user may want
  more fixes later, keep the session alive or commit the per-video `Main.tsx`/`captions.ts`.

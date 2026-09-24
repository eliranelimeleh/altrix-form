---
name: altrix-reel-editor
description: Edit raw videos into branded Altrix Instagram reels - animated Hebrew word-by-word captions, zooms on the key numbers, glowing purple cards with money counters, original synthesized music and SFX, and the Altrix logo outro. Use this whenever the user sends a video (a Drive link, a file, a screen recording of trading results, a talking-head clip) and wants it edited, cut, subtitled, animated, "made into a reel/story/TikTok", or asks for "כתוביות", "עריכה", "סרטון", "רילס", "הנפשות" or "מוזיקה לסרטון" - even if they don't mention Altrix or the style explicitly. Also use it for follow-up fixes to a reel made with this skill (moving or retexting a caption/card), which have a fast partial-render path.
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
- `ffmpeg -i src.mp4` for duration/resolution. Source is usually 9:16; if not, adjust
  `BASE_S` / framing.
- Contact sheet (`fps=1/3,scale=270:-1,tile=5x3`) and look at it. Then grab single frames at the
  moments the speaker mentions numbers/results - you need exact positions for the zooms.
- Scene changes: `-vf "scale=180:-1,select='gt(scene,0.04)',showinfo"` → `CUTS`.
- Measure black side bars of screen recordings → `CONTENT_X0/X1`, `BASE_S = 1/(x1-x0)`.

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

## Gotchas learned the hard way
- Headless Chromium can't paint color-emoji fonts - emoji render as nothing. Use the `<E c="1f4b0"/>`
  Twemoji component (codepoint file names in `public/emoji/`).
- Fonts load through `delayRender` in `Root.tsx`; keep it or the first frames render in a fallback font.
- Remotion `Sequence durationInFrames` must be > 0 - that's why `FREEZE` is nullable.
- A container is ephemeral: the work dir is lost when the session ends. If the user may want
  more fixes later, keep the session alive or commit the per-video `Main.tsx`/`captions.ts`.

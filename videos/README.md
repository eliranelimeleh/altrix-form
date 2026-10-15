# ALTRIX Reels

Educational trading reels in Hebrew (1080x1920, 30fps), narrated in the "אלירן 2" voice.

| id | נושא | |
|----|------|--|
| v1 | מבנה שוק: HH/HL, LH/LL, BOS, CHoCH, פתיל מול סגירת גוף, סימון ב-TradingView (Alt+H) | `src/v1.json`, `src/scenes_v1.js` |
| v2 | 3 נרות: אנטומיה של נר, פטיש, בולע, דוג'י, למה נר שווה משהו רק ליד רמה, Candlestick Patterns ב-TradingView | `src/v2.json`, `src/scenes_v2.js` |

## Build

Requirements: python3 + numpy + requests, node 22, Playwright Chromium, ffmpeg.

```bash
./build.sh            # both videos, real voice  -> out/altrix_v1.mp4, out/altrix_v2.mp4
./build.sh v1 --preview   # without ElevenLabs: estimated timing, silent voice
```

The ElevenLabs key comes from `ELEVENLABS_API_KEY`. Optional settings: `VOICE_NAME`, `VOICE_ID`, `MODEL_ID`,
`TARGET_WPS`, `MAX_GAP`. To print the Instagram handle on the end card, add `"handle": "@your_handle"` to the script JSON.

See `AGENT_GUIDE.md` (full playbook, Hebrew), `TOPICS.md` (done + next topics) and `../.claude/skills/altrix-reels/SKILL.md`.

## Long-form landscape videos (training / onboarding)

| id | נושא | |
|----|------|--|
| onb1 | סרטון קליטה והכשרה לנציגי מכירות חדשים (1920x1080, ‏11 פרקים, כ־13.5 דקות) | `src/onb1.json`, `src/onb1/*.js` |

```bash
./build_long.sh onb1 --jobs 4     # voice (cached per chapter) -> parallel render -> music/mix -> out/altrix_onb1.mp4 + .srt
node tools/render.mjs onb1 --stills c5d@0.9,c9s5@0.5   # review frames -> build/onb1/stills
python3 tools/sheet_wide.py onb1 c5d@0.9,c9s5@0.5 sheet.jpg
```

- **Editing texts, prices and facts:** everything business-related lives in `src/onb1.json`:
  `segments[].say` (narration, per scene), `facts` (prices, plan names, risk disclaimer, rep/client names),
  `chapters` (titles + which funnel stages light up), `phrases` (how spoken words appear in subtitles,
  e.g. "תשעת אלפים ושמונה מאות שקלים" -> "9,800 ₪"). Changing a `say` re-voices only that chapter's group (cache in `build/onb1/tts/`).
- **Voices:** `voices.narrator` is the cloned "אלירן 2"; `voices.rep` / `voices.client` are the two voices of the call
  simulations (swap the `id` to use other ElevenLabs voices). Pacing is in `tts` (target words/sec, max tempo, max pause).
- **Scenes:** `src/scenes_onb1.js` loads `src/onb1/lib.js` (overlay, journey rail, subtitles, icons, UI mockups, funnel)
  and the chapter files. Every animation hangs on a spoken word (`cueT(s, 'word')`).
- **Pipeline pieces:** `tools/tts_long.py` (grouped TTS, loudness match, timeline, `subs.srt`), `tools/audio_long.py`
  (corporate music bed with energy per section, ducking, SFX), `build_long.sh` (parallel chunk render + concat + mux).
- Engine changes are backwards compatible: reels still render at 1080x1920; `"format": "landscape"` in the script JSON switches to 1920x1080.

### brand1: official website brand film (1920x1080, ~2:28)

| | |
|--|--|
| Script & facts | `src/brand1.json`: `segments[].say` (narration per scene, `ch` = scene 1-5, each scene voiced and cached separately), `facts` (founder, 8.5 years, STRIKE minimum, disclaimers), `phrases` (subtitle display), `segments[].energy` ([drums, arp] music intensity per scene), `tts` (pacing) |
| Scenes | `src/scenes_brand1.js` loads the onboarding design system (`src/onb1/*.js`) + `src/brand1/scenes.js` (own overlay, fly-through intro, founder card, trading simulation, robot emblems, prop flow, STRIKE scenarios, 10-day ring, CTA, tagline) |
| Trading simulation | `SIM` candles + `TA`/`TB` trades in `src/brand1/scenes.js`; P/L is computed from the candles (0.10 lot EURUSD = $1/pip); timing hangs on the narration words |
| Build | `./build_long.sh brand1 --jobs 4` -> `out/altrix_brand1.mp4` + `.srt` |

Deliverables live in `ALTRIX VIDEOS BY CLAUDE/ALTRIX Brand Film/` (master, web 1080p/720p, SRT, poster, final script, narration per scene).
To swap the founder monogram for a real portrait, draw the image in `S.b1b` (`src/brand1/scenes.js`) instead of the "א.א" disc.

### brand2: website brand film v2 (story-driven re-cut, 2:30)

Same design system, new story: opening hit + dive into a floating trading world -> the pain of manual trading
(desaturated POV: hesitating cursor, trade against you, heartbeat, emotional close) -> conversion to ALTRIX ->
cinematic trading simulation with a virtual camera (`camK`), an order ticket clicked by the system, floating P/L,
a winning and a losing trade, history and account -> three solutions in three visual worlds -> people (community,
staff video call with remote pointer) -> 10 days experience -> risk, CTA, tagline.

| | |
|--|--|
| Script & facts | `src/brand2.json` (`ch` = scene 1-7, voiced/cached per scene; `music.bpm`, per-segment `energy`) |
| Scenes | `src/scenes_brand2.js` -> `src/brand2/scenes.js` (reuses `src/onb1/*` and `src/brand1/scenes.js`) |
| Build | `./build_long.sh brand2 --jobs 4` |

Version 1 (`brand1`) is kept unchanged for comparison. Deliverables: `ALTRIX VIDEOS BY CLAUDE/ALTRIX Brand Film v2/`.

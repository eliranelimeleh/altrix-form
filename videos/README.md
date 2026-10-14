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

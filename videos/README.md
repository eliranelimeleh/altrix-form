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

See `../.claude/skills/altrix-reels/SKILL.md` for how to write a new video.

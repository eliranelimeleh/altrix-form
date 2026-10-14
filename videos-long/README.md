# ALTRIX long videos (L1, L2, ...)

Long-form (3-5 min) Hebrew trading lessons, vertical 1080x1920 for Instagram, same voice ("אלירן 2", eleven_v4),
design and editing grammar as the reels in `../videos/` (read `../videos/AGENT_GUIDE.md` first). This folder is a
separate copy of that engine adapted for length; `../videos/` is untouched.

| id | נושא |
|----|------|
| L1 | נזילות – Liquidity |
| L2 | Break of Structure |
| L3 | Fair Value Gap |
| L4 | Inverse FVG |
| L5 | Equilibrium (Premium / Discount) |
| L6 | Price Action פשוט 1: כיוון |
| L7 | Price Action פשוט 2: אישור ופסילה |
| L8 | Price Action פשוט 3: מודל הכניסה |

## What's different from the reels
- **Chapters.** `chapters` in the script JSON names the chapter-card segments (`ch1`...). The top progress bar is
  split per chapter (RTL) and shows "פרק N · title" after each card. `chapterDraw` (src/long.js) draws the card;
  `chapterEvents` adds the impact + riser. The music drops its drums during each card and re-enters with a kick.
- **Structure per video:** hook (3 segments, the climax first) → intro (series map + confluence card) → 6 chapters
  (what / why / how to spot / examples / trap or mistakes / TradingView plan) → recap → bridge to the next video → cta.
  About 450-560 words, 3-4 minutes after the tempo pass (`TARGET_WPS` 2.75).
- **Series 2 (L6-L8)** share their chart data in `src/pa_data.js`; `render.html` loads it for those ids. `seriesMap(..., { list: SERIES_PA })` draws the 4-step map.
- **Helpers (src/long.js):** `trendLine`, `seriesMap`, `confluenceCard`, `chapterDraw`, `orderRain`, `stopPills`, `positionBox`
  (TradingView-like Long/Short box with R:R), `PANEL_TOP/PANEL_BOT` for stacked comparisons.
- **Rendering:** `build.sh` renders `JOBS` (default 3) frame ranges in parallel (`render.mjs --f0 --f1`) and concatenates them.
- **Audio:** loudnorm -14 LUFS + limiter (true peak under -1 dB).
- **Publish:** `tools/publish.sh L1` → `../ALTRIX LONG VIDEOS BY CLAUDE/L1 - <title>.mp4`, bitrate sized to ~88MB
  (GitHub's 100MB file limit). For chat delivery make a ≤28MB copy.

```bash
ELEVENLABS_API_KEY=... ./build.sh L1           # voice + render + mix + publish
node tools/render.mjs L1 --stills hook1@0.8,ch1@0.5
```

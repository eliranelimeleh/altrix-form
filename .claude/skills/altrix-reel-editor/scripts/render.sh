#!/usr/bin/env bash
# Full render (HQ master) + Instagram delivery file (-14 LUFS, under the 30MB chat upload limit).
# usage (from the Remotion project dir): render.sh OUT_BASENAME     -> OUT_BASENAME_hq.mp4, OUT_BASENAME.mp4
# Takes ~4-5 min for a 45s reel on 4 CPUs. For small fixes use patch.sh instead.
set -euo pipefail
OUT=$1
BROWSER=${BROWSER:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1)}
npx remotion render src/index.ts Main "${OUT}_hq.mp4" ${BROWSER:+--browser-executable=$BROWSER} --codec=h264 --crf=18 --concurrency=4 --log=error
# size the video bitrate so the delivery file lands at ~28MB (chat upload limit is 30MB)
DUR=$(ffmpeg -i "${OUT}_hq.mp4" 2>&1 | grep -oE "Duration: [0-9:.]+" | awk -F'[: ]' '{print $3*3600+$4*60+$5}')
VB=$(python3 -c "print(min(4600, int(28*8192/$DUR - 280)))")
ffmpeg -loglevel error -y -i "${OUT}_hq.mp4" -c:v libx264 -preset slow -b:v ${VB}k -maxrate $((VB*13/10))k -bufsize $((VB*2))k -pix_fmt yuv420p \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k -movflags +faststart "${OUT}.mp4"
ls -la "${OUT}_hq.mp4" "${OUT}.mp4"

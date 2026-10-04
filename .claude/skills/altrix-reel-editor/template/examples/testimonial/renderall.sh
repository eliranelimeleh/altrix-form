#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/rem"
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
for id in "$@"; do
  npx remotion render src/index.ts $id ../${id}_hq.mp4 --browser-executable=$B --codec=h264 --crf=18 --concurrency=4 --log=error 2>&1 | grep -v -i memory || true
  DUR=$( (ffmpeg -i ../${id}_hq.mp4 2>&1 || true) | grep -oE "Duration: [0-9:.]+" | awk -F'[: ]' '{print $3*3600+$4*60+$5}')
  VB=$(python3 -c "print(min(6000, int(28*8192/$DUR - 280)))")
  ffmpeg -loglevel error -y -i ../${id}_hq.mp4 -c:v libx264 -preset slow -b:v ${VB}k -maxrate $((VB*13/10))k -bufsize $((VB*2))k -pix_fmt yuv420p \
    -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k -movflags +faststart ../Altrix_Clip_${id#C}.mp4
  ls -la ../Altrix_Clip_${id#C}.mp4
done

#!/usr/bin/env bash
# Fast fix for a small change (move/retext one card, tweak one caption): re-render only frames
# START..END and splice them into the existing HQ master, then re-encode the delivery file.
# ~1-1.5 min instead of ~5 for a full render. Only valid when the change is visual and confined to
# that frame range (audio is copied from the master, so SFX/music changes need render.sh).
# usage (from the Remotion project dir): patch.sh OUT_BASENAME START_FRAME END_FRAME
set -euo pipefail
OUT=$1; A=$2; B=$3
BROWSER=${BROWSER:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1)}
npx remotion render src/index.ts Main /tmp/_seg.mp4 --frames=$A-$B ${BROWSER:+--browser-executable=$BROWSER} --codec=h264 --crf=16 --concurrency=4 --muted --log=error
ffmpeg -loglevel error -y -i "${OUT}_hq.mp4" -i /tmp/_seg.mp4 -filter_complex \
 "[0:v]trim=end_frame=$A,setpts=PTS-STARTPTS[a];[0:v]trim=start_frame=$((B+1)),setpts=PTS-STARTPTS[c];[1:v]setpts=PTS-STARTPTS[b];[a][b][c]concat=n=3:v=1:a=0[v]" \
 -map "[v]" -map 0:a -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -c:a copy -movflags +faststart /tmp/_patched.mp4
mv /tmp/_patched.mp4 "${OUT}_hq.mp4"
ffmpeg -loglevel error -y -i "${OUT}_hq.mp4" -c:v libx264 -preset medium -b:v 4600k -maxrate 6000k -bufsize 9000k -pix_fmt yuv420p \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k -movflags +faststart "${OUT}.mp4"
ls -la "${OUT}.mp4"

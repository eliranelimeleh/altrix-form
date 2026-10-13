#!/usr/bin/env bash
# Copy a finished long video into "ALTRIX LONG VIDEOS BY CLAUDE" as "LN - <title>.mp4".
# Bitrate is sized so each file stays under ~90MB (GitHub's 100MB file limit) whatever the length.
# Usage: tools/publish.sh L1 [L2 ...]
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="../ALTRIX LONG VIDEOS BY CLAUDE"
mkdir -p "$DEST"
for id in "$@"; do
  src="out/altrix_${id}.mp4"; [[ -f $src ]] || { echo "missing $src"; continue; }
  title=$(python3 -c "import json,sys;t=json.load(open('src/$id.json'))['title'];print(t.replace('/','-').replace(':',' -'))")
  out="$DEST/$id - $title.mp4"
  rm -f "$DEST/$id - "*.mp4
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  br=$(python3 -c "print(min(9000000, int(88*8*1024*1024/$d - 160000)))")
  ffmpeg -y -v error -i "$src" -c:v libx264 -preset medium -b:v "$br" -maxrate $((br*13/10)) -bufsize $((br*2)) \
    -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$out"
  echo "==> $out"
done

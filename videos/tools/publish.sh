#!/usr/bin/env bash
# Copy a finished reel into "ALTRIX VIDEOS BY CLAUDE" as "NN - <title>.mp4" (<= ~29MB, ready for Instagram).
# Usage: tools/publish.sh v3 [v4 ...]
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="../ALTRIX VIDEOS BY CLAUDE"
mkdir -p "$DEST"
for id in "$@"; do
  src="out/altrix_${id}.mp4"; [[ -f $src ]] || { echo "missing $src"; continue; }
  num=$(printf "%02d" "${id#v}")
  title=$(python3 -c "import json,sys;t=json.load(open('src/$id.json'))['title'];print(t.replace('/','-').replace(':',' -'))")
  out="$DEST/$num - $title.mp4"
  rm -f "$DEST/$num - "*.mp4
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  br=$(python3 -c "print(int(28.5*8*1024*1024/$d - 160000))")
  ffmpeg -y -v error -i "$src" -c:v libx264 -preset medium -b:v "$br" -maxrate $((br*13/10)) -bufsize $((br*2)) \
    -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$out"
  echo "==> $out"
done

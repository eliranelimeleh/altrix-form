#!/usr/bin/env bash
# Copy a finished part into "ALTRIX VIDEOS BY CLAUDE/כל האמת על הכסף שלכם/" (<= ~29MB, ready for Instagram).
# Usage: tools/publish_money.sh m1 [_preview]
set -euo pipefail
cd "$(dirname "$0")/.."
id=$1; suffix=${2:-}
DEST="../ALTRIX VIDEOS BY CLAUDE/כל האמת על הכסף שלכם"
mkdir -p "$DEST"
src="out/money_${id}${suffix}.mp4"
title=$(python3 -c "import json;t=json.load(open('src/$id.json'))['title'];print(t.replace('/','-').replace(':',' -'))")
out="$DEST/${title}${suffix:+ (PREVIEW)}.mp4"
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
br=$(python3 -c "print(int(28.5*8*1024*1024/$d - 160000))")
ffmpeg -y -v error -i "$src" -c:v libx264 -preset medium -b:v "$br" -maxrate $((br*13/10)) -bufsize $((br*2)) \
  -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$out"
echo "==> $out"

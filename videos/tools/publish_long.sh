#!/usr/bin/env bash
# Copy a finished long-form video into "ALTRIX VIDEOS BY CLAUDE/" as "<title>.mp4" (+ Hebrew .srt).
# Re-encoded to stay under GitHub's 100MB file limit (~92MB). Usage: tools/publish_long.sh onb1
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="../ALTRIX VIDEOS BY CLAUDE"; mkdir -p "$DEST"
for id in "$@"; do
  src="out/altrix_${id}.mp4"; [[ -f $src ]] || { echo "missing $src"; continue; }
  title=$(python3 -c "import json;t=json.load(open('src/$id.json'))['title'];print(t.replace('/','-').replace(':',' -'))")
  out="$DEST/$title.mp4"
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  br=$(python3 -c "print(int(92*8*1024*1024/$d - 128000))")
  pl="build/${id}_2pass"
  ffmpeg -y -v error -i "$src" -c:v libx264 -preset slow -b:v "$br" -tune animation -pix_fmt yuv420p -pass 1 -passlogfile "$pl" -an -f mp4 /dev/null
  ffmpeg -y -v error -i "$src" -c:v libx264 -preset slow -b:v "$br" -maxrate $((br*3)) -bufsize $((br*6)) -tune animation \
    -pix_fmt yuv420p -pass 2 -passlogfile "$pl" -c:a aac -b:a 128k -movflags +faststart "$out"
  cp "out/altrix_${id}.srt" "$DEST/$title.srt"
  echo "==> $out ($(du -h "$out" | cut -f1))"
done

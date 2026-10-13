#!/usr/bin/env bash
# Build ALTRIX reels end to end: ./build.sh [v1 v2 ...] [--preview]
# 1) voice (ElevenLabs) + timeline  2) frames  3) music/sfx mix  4) mux -> out/<id>.mp4
set -euo pipefail
cd "$(dirname "$0")"
PREVIEW=""; IDS=()
for a in "$@"; do [[ $a == --preview ]] && PREVIEW="--preview" || IDS+=("$a"); done
[[ ${#IDS[@]} -eq 0 ]] && IDS=(v1 v2)
mkdir -p out
for id in "${IDS[@]}"; do
  python3 tools/tts.py "$id" $PREVIEW
  node tools/render.mjs "$id"
  python3 tools/audio.py "$id"
  suffix=$(python3 -c "import json;print('_preview' if json.load(open('build/$id/timeline.json'))['preview'] else '')")
  ffmpeg -y -v error -i "build/$id/video.mp4" -i "build/$id/mix.wav" -map 0:v -map 1:a -c:v copy \
    -af "loudnorm=I=-14:TP=-1.0:LRA=11" -c:a aac -b:a 192k -ar 44100 -movflags +faststart -shortest "out/altrix_${id}${suffix}.mp4"
  echo "==> out/altrix_${id}${suffix}.mp4"
  if [[ -z $suffix ]]; then tools/publish.sh "$id"; fi
done

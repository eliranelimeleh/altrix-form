#!/usr/bin/env bash
# Build the "כל האמת על הכסף שלכם" series: ./build_money.sh [m1 m2 m3 m4] [--preview]
# 1) voice (ElevenLabs "אלירן 2") + timeline  2) frames (src/money engine)  3) music/sfx mix  4) mux + publish
set -euo pipefail
cd "$(dirname "$0")"
PREVIEW=""; IDS=()
for a in "$@"; do [[ $a == --preview ]] && PREVIEW="--preview" || IDS+=("$a"); done
[[ ${#IDS[@]} -eq 0 ]] && IDS=(m1 m2 m3 m4)
[[ -f build/footage/index.js ]] || python3 tools/footage.py
mkdir -p out
for id in "${IDS[@]}"; do
  python3 tools/tts.py "$id" $PREVIEW
  node tools/render.mjs "$id"
  python3 tools/audio_money.py "$id"
  suffix=$(python3 -c "import json;print('_preview' if json.load(open('build/$id/timeline.json'))['preview'] else '')")
  ffmpeg -y -v error -i "build/$id/video.mp4" -i "build/$id/mix.wav" -map 0:v -map 1:a -c:v copy \
    -af "loudnorm=I=-14:TP=-1.0:LRA=11" -c:a aac -b:a 192k -ar 44100 -movflags +faststart -shortest "out/money_${id}${suffix}.mp4"
  echo "==> out/money_${id}${suffix}.mp4"
  tools/publish_money.sh "$id" $suffix
done

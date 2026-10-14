#!/usr/bin/env bash
# Build ALTRIX long videos end to end: ./build.sh [L1 L2 ...] [--preview]
# 1) voice (ElevenLabs) + timeline  2) frames (JOBS parallel chunks)  3) music/sfx mix  4) mux -> out/<id>.mp4
set -euo pipefail
cd "$(dirname "$0")"
PREVIEW=""; IDS=(); JOBS=${JOBS:-3}
for a in "$@"; do [[ $a == --preview ]] && PREVIEW="--preview" || IDS+=("$a"); done
[[ ${#IDS[@]} -eq 0 ]] && { echo "usage: ./build.sh L1 [L2 ...] [--preview]"; exit 1; }
mkdir -p out
for id in "${IDS[@]}"; do
  python3 tools/tts.py "$id" $PREVIEW
  nf=$(python3 -c "import json;print(round(json.load(open('build/$id/timeline.json'))['duration']*30))")
  per=$(( (nf + JOBS - 1) / JOBS )); pids=(); : > "build/$id/parts.txt"
  for ((j=0; j<JOBS; j++)); do
    node tools/render.mjs "$id" --f0 $((j*per)) --f1 $(((j+1)*per)) --out "build/$id/part$j.mp4" > "build/$id/render$j.log" 2>&1 &
    pids+=($!); echo "file 'part$j.mp4'" >> "build/$id/parts.txt"
  done
  for p in "${pids[@]}"; do wait "$p" || { echo "render failed: see build/$id/render*.log"; exit 1; }; done
  ffmpeg -y -v error -f concat -safe 0 -i "build/$id/parts.txt" -c copy "build/$id/video.mp4"
  python3 tools/audio.py "$id"
  suffix=$(python3 -c "import json;print('_preview' if json.load(open('build/$id/timeline.json'))['preview'] else '')")
  ffmpeg -y -v error -i "build/$id/video.mp4" -i "build/$id/mix.wav" -map 0:v -map 1:a -c:v copy \
    -af "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false" -c:a aac -b:a 192k -ar 44100 -movflags +faststart -shortest "out/altrix_${id}${suffix}.mp4"
  echo "==> out/altrix_${id}${suffix}.mp4"
  if [[ -z $suffix ]]; then tools/publish.sh "$id"; fi
done

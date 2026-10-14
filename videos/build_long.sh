#!/usr/bin/env bash
# Build a long-form (landscape) ALTRIX video end to end: ./build_long.sh onb1 [--jobs 4] [--preview]
# 1) voice per chapter (ElevenLabs, cached) + timeline + subs.srt  2) frames rendered in parallel chunks
# 3) music/sfx mix  4) mux + loudnorm -> out/altrix_<id>.mp4 (+ .srt next to it)
set -euo pipefail
cd "$(dirname "$0")"
ID=$1; shift; JOBS=4; PREVIEW=""
while [[ $# -gt 0 ]]; do case $1 in --jobs) JOBS=$2; shift 2;; --preview) PREVIEW=--preview; shift;; *) shift;; esac; done
mkdir -p out "build/$ID/chunks"
python3 tools/tts_long.py "$ID" $PREVIEW
DUR=$(python3 -c "import json;print(json.load(open('build/$ID/timeline.json'))['duration'])")
N=$(python3 -c "print(round($DUR*30))")
rm -f build/$ID/chunks/*.mp4 build/$ID/chunks/list.txt
pids=()
for ((k=0; k<JOBS; k++)); do
  f0=$((N*k/JOBS)); f1=$((N*(k+1)/JOBS))
  out="build/$ID/chunks/c$k.mp4"; echo "file 'c$k.mp4'" >> "build/$ID/chunks/list.txt"
  node tools/render.mjs "$ID" --from "$(python3 -c "print($f0/30)")" --to "$(python3 -c "print($f1/30)")" --out "$PWD/$out" > "build/$ID/chunks/c$k.log" 2>&1 &
  pids+=($!)
done
for p in "${pids[@]}"; do wait "$p"; done
ffmpeg -y -v error -f concat -safe 0 -i "build/$ID/chunks/list.txt" -c copy "build/$ID/video.mp4"
python3 tools/audio_long.py "$ID"
suffix=$(python3 -c "import json;print('_preview' if json.load(open('build/$ID/timeline.json'))['preview'] else '')")
ffmpeg -y -v error -i "build/$ID/video.mp4" -i "build/$ID/mix.wav" -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.0:LRA=11" -c:a aac -b:a 192k -ar 44100 -movflags +faststart -shortest "out/altrix_${ID}${suffix}.mp4"
cp "build/$ID/subs.srt" "out/altrix_${ID}${suffix}.srt"
echo "==> out/altrix_${ID}${suffix}.mp4"

#!/usr/bin/env bash
# Prepare a work dir for one reel: tools, Remotion project from the template, fonts, emoji, logo, SFX.
# usage: setup.sh WORK_DIR SOURCE_VIDEO
# Needs network access to pypi.org, registry.npmjs.org and huggingface.co (Whisper model).
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
WORK=$1; SRC=$2
mkdir -p "$WORK"
pip install -q imageio-ffmpeg faster-whisper pillow numpy scipy 2>&1 | grep -v -i warning || true
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
command -v ffmpeg >/dev/null || ln -sf "$FF" /usr/local/bin/ffmpeg
cp -r "$SKILL/template" "$WORK/rem"
cd "$WORK/rem"
npm i --silent >/dev/null 2>&1
mkdir -p public/emoji
cp node_modules/@twemoji/svg/*.svg public/emoji/
cp "$SKILL/assets/logo.jpg" public/logo.jpg
mkdir -p public/faces && cp "$SKILL"/assets/faces/*.jpg public/faces/   # AI-generated faces (not real people) for chat mockups
cp "$SRC" public/src.mp4
python3 "$SKILL/scripts/sfx.py" public
ffmpeg -loglevel error -y -i public/src.mp4 -ac 1 -ar 16000 "$WORK/audio.wav"
echo "ready: $WORK/rem  (audio for transcription: $WORK/audio.wav)"

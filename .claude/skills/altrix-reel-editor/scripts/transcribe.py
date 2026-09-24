"""Hebrew word-level transcription with the ivrit-ai Whisper model.
usage: python3 transcribe.py AUDIO.wav [OFFSET_S]
Prints one line per segment in the captions.ts RAW format (word@start). Whisper sometimes drops
words at segment boundaries (a segment ending mid-word like "מצ" is the tell) - cut that window out
with ffmpeg (-ss X -t 7) and re-run with OFFSET_S=X to recover the missing words."""
import sys
from faster_whisper import WhisperModel

audio = sys.argv[1]
off = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
m = WhisperModel('ivrit-ai/whisper-large-v3-turbo-ct2', device='cpu', compute_type='int8')
segs, _ = m.transcribe(audio, language='he', word_timestamps=True, vad_filter=True)
for s in segs:
    print(' '.join(f'{w.word.strip()}@{w.start + off:.2f}' for w in s.words))

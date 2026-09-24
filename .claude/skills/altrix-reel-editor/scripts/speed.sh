#!/usr/bin/env bash
# Pre-process a raw recording: keep the hook at natural speed, speed up the rest with
# pitch-preserving atempo (voice stays natural), optionally drop passages, output 30fps.
# usage: speed.sh IN OUT HOOK_END_S SPEED [CUT_A-CUT_B ...]
#   e.g. speed.sh raw.mkv src.mp4 5.9 1.2            (reel #3: hook 1.0x, rest 1.2x)
# Cuts given here are in ORIGINAL seconds and are removed before speeding up. Prefer cutting
# after the render instead (cut_and_mix.py) when the cut sits inside a word - see SKILL.md.
set -euo pipefail
IN=$1; OUT=$2; A=$3; SP=$4; shift 4
python3 - "$IN" "$OUT" "$A" "$SP" "$@" <<'PY'
import subprocess, sys
inp, out, a, sp, *cuts = sys.argv[1:]
a, sp = float(a), float(sp)
def dur(p):
    d = subprocess.run(['ffmpeg', '-i', p], capture_output=True, text=True).stderr.split('Duration: ')[1].split(',')[0]
    h, m, sec = d.split(':'); return int(h) * 3600 + int(m) * 60 + float(sec)
dur = dur(inp)
keep, t = [], 0.0
for c in sorted((float(x.split('-')[0]), float(x.split('-')[1])) for x in cuts):
    keep.append((t, c[0])); t = c[1]
keep.append((t, dur))
segs = []  # (start, end, speed)
for s, e in keep:
    if s < a: segs.append((s, min(e, a), 1.0))
    if e > a: segs.append((max(s, a), e, sp))
fc, vl, al = [], '', ''
for i, (s, e, v) in enumerate(segs):
    fc.append(f"[0:v]trim={s}:{e},setpts=(PTS-STARTPTS)/{v}[v{i}]")
    at = f",atempo={v}" if v != 1.0 else ''
    fc.append(f"[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS{at},afade=t=in:d=0.012[a{i}]")
    vl += f"[v{i}]"; al += f"[a{i}]"
fc.append(f"{vl}concat=n={len(segs)}:v=1:a=0,fps=30[v]")
fc.append(f"{al}concat=n={len(segs)}:v=0:a=1[a]")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', inp, '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-r', '30',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', out], check=True)
print('wrote', out, segs)
PY

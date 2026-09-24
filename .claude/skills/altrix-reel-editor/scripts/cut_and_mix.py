"""Remove passages from a finished full-timeline render and lay a continuous music bed on the result.

Why after the render: the composition keeps its original timeline (all per-video times stay valid),
the cut is sample-accurate on the audio, and the music runs unbroken across the joins.
The composition must be rendered WITHOUT its music track (drop the <Audio music> element).

usage: python3 cut_and_mix.py IN_hq.mp4 MUSIC.wav OUT_BASENAME --cut 5.02-6.2333 --cut 44.2-51.9333 \
           [--silence 1.3] [--outro NEW_LOGO_SLAM_S]
  --cut A-B   seconds on the composition timeline to delete (A = end of the last kept word, found with
              find_cut.py; B = start of the next kept word). Video is cut on the nearest frame.
  --silence   music is silent for the first N seconds (the shock hook), then fades in to 0.13-0.17.
  --outro     time on the NEW timeline of the logo slam; music rises to 0.6 there and fades out at the end.
Produces OUT_hq.mp4 and OUT.mp4 (-14 LUFS, bitrate sized to ~28MB).
Generate MUSIC with music.py using NEW-timeline times (DROP and impacts shift left by the cut lengths).
"""
import argparse, subprocess

ap = argparse.ArgumentParser()
ap.add_argument('inp'); ap.add_argument('music'); ap.add_argument('out')
ap.add_argument('--cut', action='append', default=[])
ap.add_argument('--silence', type=float, default=1.3)
ap.add_argument('--outro', type=float, required=True)
a = ap.parse_args()

def dur(p):
    s = subprocess.run(['ffmpeg', '-i', p], capture_output=True, text=True).stderr.split('Duration: ')[1].split(',')[0]
    h, m, sec = s.split(':'); return int(h) * 3600 + int(m) * 60 + float(sec)

D = dur(a.inp)
cuts = sorted((float(c.split('-')[0]), float(c.split('-')[1])) for c in a.cut)
keep, t = [], 0.0
for s, e in cuts:
    keep.append((t, s)); t = e
keep.append((t, D))
F = 0.015
fc, vl, al = [], '', ''
for i, (s, e) in enumerate(keep):
    fs, fe = round(s * 30), round(e * 30)
    fc.append(f"[0:v]trim=start_frame={fs}" + (f":end_frame={fe}" if e < D else '') + f",setpts=PTS-STARTPTS[v{i}]")
    fades = (f",afade=t=in:d={F}" if i else '') + (f",afade=t=out:st={e - s - 0.025:.4f}:d=0.025" if e < D else '')
    fc.append(f"[0:a]atrim={s}" + (f":{e}" if e < D else '') + f",asetpts=PTS-STARTPTS{fades}[a{i}]")
    vl += f"[v{i}]"; al += f"[a{i}]"
new_len = D - sum(e - s for s, e in cuts)
o, sil = a.outro, a.silence
env = (f"if(lt(t,{sil}),0,if(lt(t,{sil + 0.6}),0.13*(t-{sil})/0.6,if(lt(t,{o - 0.75}),0.17,"
       f"if(lt(t,{o - 0.2}),0.17+0.43*(t-{o - 0.75})/0.55,if(lt(t,{new_len - 0.9}),0.6,max(0,0.6*({new_len}-t)/0.9))))))")
fc += [f"{vl}concat=n={len(keep)}:v=1:a=0,fps=30[v]", f"{al}concat=n={len(keep)}:v=0:a=1[voice]",
       f"[1:a]volume='{env}':eval=frame[mus]", "[voice][mus]amix=inputs=2:duration=first:normalize=0[mix]"]
hq = f"{a.out}_hq.mp4"
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', a.inp, '-i', a.music, '-filter_complex', ';\n'.join(fc), '-map', '[v]', '-map', '[mix]',
                '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', hq], check=True)
vb = min(4600, int(28 * 8192 / dur(hq) - 280))
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', hq, '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{vb}k', '-maxrate', f'{vb * 13 // 10}k',
                '-bufsize', f'{vb * 2}k', '-pix_fmt', 'yuv420p', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k',
                '-movflags', '+faststart', f'{a.out}.mp4'], check=True)
print(f'wrote {hq} and {a.out}.mp4  (new length {new_len:.2f}s)')

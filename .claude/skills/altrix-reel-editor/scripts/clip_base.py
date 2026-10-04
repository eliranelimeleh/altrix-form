"""Build split-screen testimonial bases from clips.json (run next to src.mp4).
Crops below are for a 1920x1080 Zoom call: host tile left (x17-951), client tile right (x966-1900).
Re-measure the tiles on a frame for every new video and edit the two crop= values.
Output per clip: <name>_base.mp4 (1080x1920, 30fps) + <name>.wav (16k mono, for transcription).
"""
import json, subprocess, sys
C=json.load(open('clips.json'))
for name,segs in C.items():
    fc=[]; vl=''; al=''
    for i,(a,b,_) in enumerate(segs):
        fc.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,split[s{i}a][s{i}b]")
        fc.append(f"[s{i}a]crop=934:900:966:150,split[ca{i}][cb{i}];[ca{i}]scale=1080:900:force_original_aspect_ratio=increase,crop=1080:900,boxblur=30:2,eq=brightness=-0.18[cbg{i}];[cb{i}]scale=-2:900:flags=lanczos,unsharp=5:5:0.7[cfg{i}];[cbg{i}][cfg{i}]overlay=(W-w)/2:0[cl{i}]")
        fc.append(f"[s{i}b]crop=934:800:17:250,split[ha{i}][hb{i}];[ha{i}]scale=1080:620:force_original_aspect_ratio=increase,crop=1080:620,boxblur=30:2,eq=brightness=-0.18[hbg{i}];[hb{i}]scale=-2:620:flags=lanczos,unsharp=3:3:0.4[hfg{i}];[hbg{i}][hfg{i}]overlay=(W-w)/2:0[ho{i}]")
        fc.append(f"color=c=0x0c0618:s=1080x1920:r=30:d={b-a:.3f}[bg{i}]")
        fc.append(f"[bg{i}][cl{i}]overlay=0:110[t{i}];[t{i}][ho{i}]overlay=0:1300,fps=30[v{i}]")
        fc.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={b-a-0.02:.3f}:d=0.02[a{i}]")
        vl+=f'[v{i}]'; al+=f'[a{i}]'
    fc.append(f"{vl}concat=n={len(segs)}:v=1:a=0[v];{al}concat=n={len(segs)}:v=0:a=1[a]")
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','src.mp4','-filter_complex',';'.join(fc),'-map','[v]','-map','[a]','-r','30',
                    '-c:v','libx264','-preset','medium','-crf','15','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k',f'{name}_base.mp4'],check=True)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'{name}_base.mp4','-ac','1','-ar','16000',f'{name}.wav'],check=True)
    print(name, 'len', round(sum(b-a for a,b,_ in segs),2))

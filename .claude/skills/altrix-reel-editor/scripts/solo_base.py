"""Solo screen-recording layout: webcam circle (center 246,861 r 209 in 1920x1080) -> big circle on top,
screen crop in the bottom panel. clips.json: {"name": [[a, b, "sys"|"wis"], ...]}"""
import json, subprocess, sys
C=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'clips.json'))
SCREEN={'sys':'crop=1100:630:820:380','wis':'crop=1080:620:460:80'}
D=860  # circle diameter on output
for name,segs in C.items():
    fc=[]; vl=''; al=''
    for i,(a,b,kind) in enumerate(segs):
        fc.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,split=3[s{i}a][s{i}b][s{i}c]")
        # top bg: blurred full screen
        fc.append(f"[s{i}a]scale=1080:900:force_original_aspect_ratio=increase,crop=1080:900,boxblur=28:2,eq=brightness=-0.32:saturation=0.8[tb{i}]")
        # face circle
        fc.append(f"[s{i}b]crop=414:414:39:654,scale={D}:{D}:flags=lanczos,unsharp=5:5:0.8,format=yuva420p,"
                  f"geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='if(lte(hypot(X-{D/2},Y-{D/2}),{D/2-6}),255,0)'[fc{i}]")
        fc.append(f"[tb{i}][fc{i}]overlay=(W-w)/2:(H-h)/2[top{i}]")
        fc.append(f"[s{i}c]{SCREEN[kind]},scale=1080:620:flags=lanczos,unsharp=3:3:0.5[ho{i}]")
        fc.append(f"color=c=0x0c0618:s=1080x1920:r=30:d={b-a:.3f}[bg{i}]")
        fc.append(f"[bg{i}][top{i}]overlay=0:110[t{i}];[t{i}][ho{i}]overlay=0:1300,fps=30,format=yuv420p[v{i}]")
        fc.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={b-a-0.02:.3f}:d=0.02[a{i}]")
        vl+=f'[v{i}]'; al+=f'[a{i}]'
    fc.append(f"{vl}concat=n={len(segs)}:v=1:a=0[v];{al}concat=n={len(segs)}:v=0:a=1[a]")
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','src.mp4','-filter_complex',';'.join(fc),'-map','[v]','-map','[a]','-r','30',
                    '-c:v','libx264','-preset','medium','-crf','15','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k',f'{name}_base.mp4'],check=True)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'{name}_base.mp4','-ac','1','-ar','16000',f'{name}.wav'],check=True)
    print(name,'len',round(sum(b-a for a,b,_ in segs),2),flush=True)

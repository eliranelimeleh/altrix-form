"""Meet interview → 1080x1920 split base: client (right tile, Chaim) top 1080x900 at y110,
host (left tile) bottom 1080x620 at y1300. Each crop is fitted to the panel height and the sides
are filled with a blurred, darkened copy. Layout changes in the recording: side panel (<170.967),
three tiles (<191.8), two tiles (rest)."""
import json, subprocess, sys
def layout(t):
    if t<170.967: return 'side'
    if t<191.8: return 'tri'
    return 'full'
# crop w:h:x:y per layout
CL={'side':'405:570:945:230','tri':'514:640:702:180','full':'520:720:1383:200'}
HO={'side':'545:530:390:330','tri':'677:620:16:340','full':'1081:620:290:340'}
def panel(lbl,crop,W,H,i):
    return (f"[{lbl}]crop={crop},split[{lbl}a][{lbl}b];[{lbl}a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=28:2,eq=brightness=-0.22:saturation=0.85[{lbl}bg];"
            f"[{lbl}b]scale=-2:{H}:flags=lanczos,unsharp=5:5:0.6[{lbl}fg];[{lbl}bg][{lbl}fg]overlay=(W-w)/2:0[{lbl}o]")
C=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'segs.json'))
only=sys.argv[2:]
for name,segs in C.items():
    if only and name not in only: continue
    fc=[]; vl=''; al=''
    for i,(a,b,_) in enumerate(segs):
        L=layout(a+0.01)
        fc.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,split[c{i}][h{i}]")
        fc.append(panel(f'c{i}',CL[L],1080,900,i)); fc.append(panel(f'h{i}',HO[L],1080,620,i))
        fc.append(f"color=c=0x0c0618:s=1080x1920:r=30:d={b-a:.3f}[bg{i}]")
        fc.append(f"[bg{i}][c{i}o]overlay=0:110[t{i}];[t{i}][h{i}o]overlay=0:1300,fps=30,format=yuv420p[v{i}]")
        fc.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={b-a-0.02:.3f}:d=0.02[a{i}]")
        vl+=f'[v{i}]'; al+=f'[a{i}]'
    fc.append(f"{vl}concat=n={len(segs)}:v=1:a=0[v];{al}concat=n={len(segs)}:v=0:a=1[a]")
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','src.mp4','-filter_complex',';'.join(fc),'-map','[v]','-map','[a]','-r','30',
        '-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k',f'{name}_base.mp4'],check=True)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'{name}_base.mp4','-ac','1','-ar','16000',f'{name}.wav'],check=True)
    print(name,'len',round(sum(b-a for a,b,_ in segs),2),flush=True)

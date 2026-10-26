"""Meet interview -> 1080x1920 split base: client (right tile) top 1080x900 at y110,
host (left tile) bottom 1080x620 at y1300. Each crop is fitted to the panel height and the sides
are filled with a blurred, darkened copy. layout(t) + CL/HO are PER-VIDEO (here: a 2-person Meet call,
participants side panel open until 22.53s, two tiles after).
Input segs.json = [[a, b, idx], ...] or [[a, b, idx, host_src_t], ...]: the optional 4th field takes the
host panel from another source time (the host just listens) - use it when Meet's hover toolbar or the
mouse covers the host's face. Each segment is encoded on its own and then concatenated: one filter graph
with 18 trims of a 1080p source was OOM-killed.
usage: python3 meet_base.py   (reads segs.json, src.mp4 in cwd; writes elk_base.mp4 + elk.wav, mkdir parts first)"""
import json, subprocess, sys
def layout(t):
    return 'side' if t<22.53 else 'full'
# crop w:h:x:y per layout
CL={'side':'520:440:1382:205','full':'520:440:1382:205'}
HO={'side':'974:560:392:200','full':'1350:776:16:110'}
def panel(lbl,crop,W,H,i):
    return (f"[{lbl}]crop={crop},split[{lbl}a][{lbl}b];[{lbl}a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=28:2,eq=brightness=-0.22:saturation=0.85[{lbl}bg];"
            f"[{lbl}b]scale=-2:{H}:flags=lanczos,unsharp=5:5:0.6[{lbl}fg];[{lbl}bg][{lbl}fg]overlay=(W-w)/2:0[{lbl}o]")
C={'elk':json.load(open('segs.json'))}
only=sys.argv[2:]
for name,segs in C.items():
    if only and name not in only: continue
    parts=[]
    for i,(a,b,_,*hs) in enumerate(segs):  # optional 4th field: take the host panel from this source time (hides UI over the host)
        fc=[]
        L=layout(a+0.01)
        if hs: fc.append(f"[0:v]trim=0:{b-a:.3f},setpts=PTS-STARTPTS[c{i}];[1:v]trim=0:{b-a:.3f},setpts=PTS-STARTPTS[h{i}]")
        else: fc.append(f"[0:v]trim=0:{b-a:.3f},setpts=PTS-STARTPTS,split[c{i}][h{i}]")
        fc.append(panel(f'c{i}',CL[L],1080,900,i)); fc.append(panel(f'h{i}',HO[L],1080,620,i))
        fc.append(f"color=c=0x0c0618:s=1080x1920:r=30:d={b-a:.3f}[bg{i}]")
        fc.append(f"[bg{i}][c{i}o]overlay=0:110[t{i}];[t{i}][h{i}o]overlay=0:1300,fps=30,format=yuv420p[v{i}]")
        fc.append(f"[0:a]atrim=0:{b-a:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={b-a-0.02:.3f}:d=0.02,aresample=48000[a{i}]")
        p=f'parts/{name}_{i:02d}.mkv'; parts.append(p)
        subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',f'{a}','-i','src.mp4']+(['-ss',f'{hs[0]}','-i','src.mp4'] if hs else [])+['-t',f'{b-a+0.5:.3f}','-filter_complex',';'.join(fc),'-map',f'[v{i}]','-map',f'[a{i}]','-r','30',
            '-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-c:a','pcm_s16le',p],check=True)
        print(i,end=' ',flush=True)
    open('parts/list.txt','w').write(''.join(f"file '{p.split('/')[1]}'\n" for p in parts))
    subprocess.run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i','parts/list.txt','-r','30','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k',f'{name}_base.mp4'],check=True)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'{name}_base.mp4','-ac','1','-ar','16000',f'{name}.wav'],check=True)
    print(name,'len',round(sum(q[1]-q[0] for q in segs),2),flush=True)

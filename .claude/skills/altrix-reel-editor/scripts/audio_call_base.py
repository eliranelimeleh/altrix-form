# Audio-only call -> base. First clean the call audio (phone/WhatsApp quality):
#   ffmpeg -i src.mp4 -vn -ac 1 -ar 48000 full48.wav
#   ffmpeg -i full48.wav -af "highpass=f=90,anlmdn=s=7:p=0.003:r=0.008:m=15,afftdn=nr=12:nf=-38:tn=1,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3000:t=q:w=1.0:g=2.5,acompressor=threshold=-24dB:ratio=2:attack=10:release=150:makeup=1.5" clean.wav
# (measure the floor first: afftdn nf must sit near the real noise level in dBFS or it does nothing).
# HOST maps each range index to a start time of host LISTENING footage (client talking) in HOSTSRC - PER-VIDEO.
"""Audio-only interview base: audio = picked segments of this call; video = dark top (camera-off tile is drawn
in Remotion) + host panel from real listening footage of an earlier Meet call (one continuous clip per range)."""
import json, subprocess
S=json.load(open('segs.json'))
for i in range(1,len(S)):
    if S[i][0]<S[i-1][1] and S[i-1][1]-S[i][0]<0.2: S[i][0]=S[i-1][1]
json.dump(S,open('segs.json','w'))
HOSTSRC='../elk/src.mp4'
HOST={0:214.0,1:98.0,2:343.0,3:231.6,4:101.3,5:290.0,6:249.4,7:164.7,8:52.4}
ranges=sorted(set(q[2] for q in S),key=lambda r:[q[2] for q in S].index(r))
parts=[]
for r in ranges:
    segs=[q for q in S if q[2]==r]; dur=sum(b-a for a,b,_ in segs)
    fc=[]; al=''
    for i,(a,b,_) in enumerate(segs):
        fc.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={b-a-0.02:.3f}:d=0.02,aresample=48000[a{i}]"); al+=f'[a{i}]'
    fc.append(f"{al}concat=n={len(segs)}:v=0:a=1[a]")
    fc.append(f"[1:v]trim=0:{dur:.3f},setpts=PTS-STARTPTS,crop=1350:776:16:110,scale=1080:620:flags=lanczos,unsharp=5:5:0.6[h]")
    fc.append(f"color=c=0x0c0618:s=1080x1920:r=30:d={dur:.3f}[bg];[bg][h]overlay=0:1300,fps=30,format=yuv420p[v]")
    p=f'parts/r{r:02d}.mkv'; parts.append(p)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','clean.wav','-ss',str(HOST[r]),'-i',HOSTSRC,'-filter_complex',';'.join(fc),
        '-map','[v]','-map','[a]','-t',f'{dur:.3f}','-r','30','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p','-c:a','pcm_s16le',p],check=True)
    print(r,round(dur,2),flush=True)
open('parts/list.txt','w').write(''.join(f"file '{p.split('/')[1]}'\n" for p in parts))
subprocess.run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i','parts/list.txt','-r','30','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','v3_base.mp4'],check=True)
subprocess.run(['ffmpeg','-loglevel','error','-y','-i','v3_base.mp4','-ac','1','-ar','16000','v3.wav'],check=True)

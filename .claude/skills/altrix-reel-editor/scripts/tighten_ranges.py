"""Split each coarse range into sub-segments with long pauses removed (energy OR word span = speech)."""
import json, numpy as np
from scipy.io import wavfile
sr,x=wavfile.read('audio.wav'); x=x.astype(float); hop=int(0.02*sr); n=len(x)//hop
db=20*np.log10(np.sqrt(np.mean(x[:n*hop].reshape(n,hop)**2,1))+1e-9)
sp=db>45
for w in [w for q in json.load(open('tr.json')) for w in q['w']]:
    if w[3]>0.5 and w[2]-w[1]<1.2: sp[max(0,int((w[1]-0.05)/0.02)):int((w[2]+0.05)/0.02)]=True
MAXGAP=0.4; PRE=0.1; POST=0.15
R=json.load(open('ranges.json')); out={}
for k,rs in R.items():
    segs=[]
    for ri,(a,b) in enumerate(rs):
        i0,i1=int(a/0.02),int(b/0.02); s=sp[i0:i1]; cur=a; j=0; L=len(s); first=True
        while j<L:
            if not s[j]:
                q=j
                while q<L and not s[q]: q+=1
                ta=a+j*0.02; tb=a+q*0.02
                if tb-ta>MAXGAP and j>0 and q<L:
                    segs.append([round(cur,2),round(ta+POST,2),ri]); cur=tb-PRE
                j=q
            else: j+=1
        segs.append([round(cur,2),round(b,2),ri])
    out[k]=segs
    print(k,len(segs),'segs',round(sum(b-a for a,b,_ in segs),2),'s')
json.dump(out,open('segs.json','w'))

"""Coarse ranges (R, PER-VIDEO, in story order) -> segs.json: edges snapped to real silence, pauses > MAXGAP removed.
Reads tr.json (list of segments, each a list of [word, start, end]) and audio.wav (16k mono). Prints the edge check
(last word + the next word) - if the next word starts before the end, verify with find_cut.py."""
import json, numpy as np
from scipy.io import wavfile
R=[(248.62,261.94),(9.06,18.84),(22.26,34.1),(52.38,63.94),(86.26,92.72),(98.68,117.52),(214.34,230.14),(279.48,283.02),(290.42,297.88),(321.06,331.30),(347.86,353.12),(355.66,359.94)]
W=[w for s in json.load(open('tr.json')) for w in s]
sr,x=wavfile.read('audio.wav'); x=x.astype(float); hop=int(0.02*sr); n=len(x)//hop
db=20*np.log10(np.sqrt(np.mean(x[:n*hop].reshape(n,hop)**2,1))+1e-9)
sp=db>45
for w in W:
    if w[2]-w[1]<0.45: sp[max(0,int((w[1]-0.05)/0.02)):int((w[2]+0.05)/0.02)]=True
MAXGAP=0.45; PRE=0.12; POST=0.2
out=[]
for ri,(a0,b0) in enumerate(R):
    ws=[w for w in W if a0-0.01<=w[1]<=b0+0.01]
    # snap edges to real silence: start = last quiet frame before the first word, end = first quiet frame after the last word starts (+ tail)
    k=int(ws[0][1]/0.02)
    while k>0 and db[k-1]>40 and ws[0][1]-k*0.02<0.25: k-=1
    a=k*0.02-0.06
    k=int((ws[-1][1]+0.15)/0.02)
    while db[k]>40 and k*0.02<ws[-1][2]+0.4: k+=1
    b=k*0.02+0.1
    nxt=[w for w in W if w[1]>ws[-1][1]][:1]
    print(ri,'start',round(a,2),'first',ws[0][1],'| end',round(b,2),'lastw',ws[-1],'next',nxt)
    i0,i1=int(a/0.02),int(b/0.02); s=sp[i0:i1]; cur=a; j=0; L=len(s)
    while j<L:
        if not s[j]:
            q=j
            while q<L and not s[q]: q+=1
            ta=a+j*0.02; tb=a+q*0.02
            if tb-ta>MAXGAP and j>0 and q<L:
                out.append([round(cur,2),round(ta+POST,2),ri]); cur=tb-PRE
            j=q
        else: j+=1
    out.append([round(cur,2),round(b,2),ri])
print(len(out),'segs', round(sum(b-a for a,b,_ in out),2),'s')
json.dump(out,open('segs.json','w'))
for s in out: print(s)

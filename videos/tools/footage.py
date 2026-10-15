#!/usr/bin/env python3
"""Turn stock clips into vertical 720x1280 30fps jpg sequences: build/footage/<id>/0001.jpg ...
usage: footage.py  (reads CROPS below; raw clips in build/footage/raw/<id>.mp4)"""
import os, subprocess, sys, json
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "build", "footage")
# horizontal crop centre (0..1) for landscape clips; portrait clips ignore it
CROPS = {"10443": .45, "18299": .55, "231": .6, "26089": .4, "28321": .3, "31138": .35, "31411": .55, "39786": .55,
         "41645": .68, "4204": .4, "42130": .6, "4262": .3, "42644": .35, "4280": .55, "43501": .55, "4401": .4,
         "4437": .6, "4513": .45, "4701": .6, "4800": .35, "4830": .38, "4835": .4, "4915": .6, "49885": .45,
         "50766": .6, "52427": .35, "64": .4, "8734": .55, "4043": .6, "221": .4}
MAXS = 9.0
# moody cinematic grade: a touch more contrast, less saturation, warm highlights / cool shadows
GRADE = "eq=contrast=1.10:saturation=0.82:brightness=-0.035:gamma=0.97,colorbalance=rs=-0.04:bs=0.05:rh=0.06:gh=0.02:bh=-0.06"

def probe(f):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height",
                        "-of", "csv=p=0", f], capture_output=True, text=True).stdout.strip().split(",")
    return int(o[0]), int(o[1])

def job(cid):
    src = f"{ROOT}/raw/{cid}.mp4"; out = f"{ROOT}/{cid}"
    if os.path.exists(f"{out}/done"): return cid, "cached"
    os.makedirs(out, exist_ok=True)
    w, h = probe(src)
    if w > h:
        cw = int(h * 9 / 16) // 2 * 2; cx = int(min(max(CROPS.get(cid, .5) * w - cw / 2, 0), w - cw))
        vf = f"crop={cw}:{h}:{cx}:0,scale=720:1280:flags=lanczos,fps=30,{GRADE}"
    else:
        vf = f"scale=720:1280:force_original_aspect_ratio=increase:flags=lanczos,crop=720:1280,fps=30,{GRADE}"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-t", str(MAXS), "-i", src, "-vf", vf, "-q:v", "4",
                    f"{out}/%04d.jpg"], check=True)
    n = len([x for x in os.listdir(out) if x.endswith(".jpg")])
    open(f"{out}/done", "w").write(str(n))
    return cid, n

ids = sys.argv[1:] or sorted(x[:-4] for x in os.listdir(f"{ROOT}/raw") if x.endswith(".mp4"))
with ThreadPoolExecutor(4) as ex:
    res = dict(ex.map(job, ids))
idx = {k: int(open(f"{ROOT}/{k}/done").read()) for k in ids}
json.dump(idx, open(f"{ROOT}/index.json", "w"))
print(res)
open(f"{ROOT}/index.js", "w").write("window.FOOTAGE=" + json.dumps(idx) + ";\n")

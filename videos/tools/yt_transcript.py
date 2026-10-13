#!/usr/bin/env python3
"""Fetch a YouTube video's title, duration, chapters and transcript (auto or manual captions).

Usage: python3 videos/tools/yt_transcript.py <youtube-url> [out_dir]
Writes <out_dir>/<id>.json (metadata + chapters) and <id>.txt (clean transcript with [mm:ss] marks
every ~20s). Needs yt-dlp (pip install yt-dlp). If YouTube rate-limits (HTTP 429) or the video has no
captions, ask the owner to paste the transcript (YouTube: ... more -> Show transcript).
"""
import glob, json, os, re, subprocess, sys

url = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "videos/build/sources"
os.makedirs(out, exist_ok=True)
meta = json.loads(subprocess.run([sys.executable, "-m", "yt_dlp", "-J", "--skip-download", url], capture_output=True, text=True, check=True).stdout)
vid = meta["id"]
subprocess.run([sys.executable, "-m", "yt_dlp", "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "en-orig,en,he",
                "--sub-format", "vtt", "-o", os.path.join(out, "%(id)s.%(ext)s"), url], capture_output=True, text=True)
vtts = sorted(glob.glob(os.path.join(out, vid + "*.vtt")), key=lambda p: ("orig" not in p, p))
lines, seen, last_mark = [], set(), -99
for path in vtts[:1]:
    for block in open(path, encoding="utf-8").read().split("\n\n"):
        m = re.search(r"(\d+):(\d+):(\d+)\.\d+ -->", block)
        if not m: continue
        t = int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3])
        for raw in block.split("\n")[1:]:
            txt = re.sub(r"<[^>]+>", "", raw).strip()
            if not txt or "-->" in txt or txt in seen: continue
            seen.add(txt)
            if t - last_mark >= 20: lines.append(f"\n[{t // 60:02d}:{t % 60:02d}]"); last_mark = t
            lines.append(txt)
info = {"id": vid, "title": meta.get("title"), "channel": meta.get("channel"), "duration": meta.get("duration"),
        "chapters": [{"start": c["start_time"], "title": c["title"]} for c in (meta.get("chapters") or [])],
        "description": meta.get("description"), "transcript_file": f"{vid}.txt" if lines else None}
json.dump(info, open(os.path.join(out, f"{vid}.json"), "w"), ensure_ascii=False, indent=1)
if lines: open(os.path.join(out, f"{vid}.txt"), "w").write(" ".join(lines).strip() + "\n")
print(f"{vid}: {info['title']} ({info['duration']}s), {len(info['chapters'])} chapters, transcript={'yes' if lines else 'NO'}")

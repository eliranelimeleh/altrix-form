#!/usr/bin/env python3
"""Search Mixkit (free license, no attribution).
usage: mixkit.py video|music|sfx "query" [pages]
Videos: only items under the plain free license (not "Restricted") are listed."""
import json, re, sys, requests

BASE = {"video": "free-stock-video", "music": "free-stock-music", "sfx": "free-sound-effects"}


def page(kind, q, p):
    url = f"https://mixkit.co/{BASE[kind]}/{q.strip().replace(' ', '-')}/" + (f"?page={p}" if p > 1 else "")
    return requests.get(url, timeout=30).text


def ld(html):
    for blob in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S):
        try:
            d = json.loads(blob)
        except Exception:
            continue
        for g in d.get("@graph", [d]):
            yield g


def search(kind, q, pages=1):
    out = []
    for p in range(1, pages + 1):
        html = page(kind, q, p)
        if kind == "video":
            for g in ld(html):
                if g.get("@type") == "VideoObject" and "Restricted" not in g.get("copyrightNotice", ""):
                    out.append((g["contentUrl"], g["name"].strip(), (g.get("description") or "")[:90]))
        elif kind == "music":
            for g in ld(html):
                for it in g.get("itemListElement", []) if g.get("@type") == "ItemList" else []:
                    if isinstance(it, dict) and it.get("@type") == "MusicRecording":
                        out.append((it["url"], it["name"], f'{it.get("duration")} {it.get("genre")}'))
        else:
            for sid, title in re.findall(r'sfx/(\d+)/\1-preview\.mp3.*?item-grid-card__title">\s*(.*?)\s*</h2>', html, re.S):
                out.append((f"https://assets.mixkit.co/active_storage/sfx/{sid}/{sid}-preview.mp3", title, ""))
    return out


if __name__ == "__main__":
    for u, n, d in search(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 1):
        print(f"{u}  | {n} | {d}")

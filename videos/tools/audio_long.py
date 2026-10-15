#!/usr/bin/env python3
"""Music bed + SFX + mix for long-form ALTRIX videos (training / onboarding).

A calmer, inspiring corporate bed than the reels' trap beat: pads, a soft
piano-like arpeggio, light kick/shaker and sub. Energy follows the video:
full on the intro, chapter cards and finale, lighter under narration and
almost only pads during dialogue simulations. Music is ducked under the voice.
Reads build/<id>/voice.wav, timeline.json, events.json -> build/<id>/mix.wav
"""
import json, os, sys, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio import SR, env, note, kick, hat, pluck, sub, add, SFX, read_wav  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BPM = 96
rs = np.random.RandomState(11)


def pad_tone(ms, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.07, 0.07):
            f = note(m + det)
            x += sum(np.sin(2 * np.pi * f * k * t + k) / k ** 1.3 for k in range(1, 5))
    a = np.minimum(1, t / 0.6) * np.minimum(1, np.maximum(0, dur - t) / 0.6)
    return x * a * 0.016


def bell(m, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR; f = note(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 4) + 0.15 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 8)
    return x * env(n, 0.003, 0.45) * 0.07


def shaker():
    n = int(0.07 * SR); x = np.diff(np.diff(np.concatenate([[0, 0], rs.randn(n)])))
    return x * env(n, 0.004, 0.02) * 0.035


def smooth(x, w):
    """moving average (box filter) in O(n) via cumulative sums"""
    w = max(1, int(w)); c = np.cumsum(np.concatenate([np.zeros(w // 2 + 1), x, np.full(w - w // 2, x[-1])]))
    return (c[w:w + len(x)] - c[:len(x)]) / w


def energy_curve(tl, n, spec=None):
    """per-sample gains for (drums, arp): cards/intro/outro full, narration mid, dialogue low.
    A segment in the script JSON can set "energy": [drums, arp] to shape the music explicitly."""
    d = np.full(n, 0.55); a = np.full(n, 0.75)
    custom = {s["id"]: s["energy"] for s in (spec or {}).get("segments", []) if "energy" in s}
    for s in tl["segments"]:
        i0, i1 = int(s["t0"] * SR), min(n, int(s["t1"] * SR))
        if s["id"] in custom:
            d[i0:i1], a[i0:i1] = custom[s["id"]]
        elif s.get("card") or s["id"] in ("intro", "c11g", "c11f", "c1a", "c1e"):
            d[i0:i1], a[i0:i1] = 1.0, 1.0
        elif s.get("voice", "narrator") != "narrator" or s["id"] in ("c9n1",):
            d[i0:i1], a[i0:i1] = 0.0, 0.35
    return smooth(d, SR), smooth(a, SR)  # 1 s smoothing


def music(dur, tl, spec=None):
    bpm = ((spec or {}).get("music") or {}).get("bpm", BPM)  # per-video tempo from the script JSON
    n = int(dur * SR); beat = 60 / bpm; bar = beat * 4
    prog = [(45, [69, 72, 76]), (41, [65, 69, 72]), (48, [67, 72, 76]), (43, [67, 71, 74])]  # Am F C G
    pads = [pad_tone([m - 12 for m in ch], bar + 1.2) for _, ch in prog]
    plucks = {}
    buf_pad = np.zeros((n + SR * 4, 2)); buf_arp = np.zeros_like(buf_pad); buf_dr = np.zeros_like(buf_pad)
    K, HH = kick(), hat()
    nb = int(dur / bar) + 1
    for b in range(nb):
        t0 = b * bar; root, ch = prog[b % 4]
        add(buf_pad, pads[b % 4], t0 - 0.3, 1.0)
        add(buf_pad, sub(root - 12, bar * 0.95), t0, 0.45)
        for s8 in range(8):
            m = ch[(s8 + b) % 3] + (12 if s8 in (3, 7) else 0)
            if m not in plucks:
                plucks[m] = pluck(m, 0.4)
            add(buf_arp, plucks[m], t0 + s8 * beat / 2, 0.55 if s8 % 2 == 0 else 0.35, pan=0.3 * np.sin(s8 * 1.7))
        if b % 2 == 0:
            add(buf_arp, bell(ch[2] + 12), t0, 0.6, pan=-0.2)
        for k in (0, 2):
            add(buf_dr, K, t0 + k * beat, 0.5)
        for k in (1.5, 3.5):
            add(buf_dr, K, t0 + k * beat, 0.18)
        for s8 in range(8):
            add(buf_dr, shaker() if s8 % 2 else HH * 0.4, t0 + s8 * beat / 2, 1.0, pan=-0.25)
    dg, ag = energy_curve(tl, n, spec)
    out = buf_pad[:n] + buf_arp[:n] * ag[:, None] + buf_dr[:n] * dg[:, None]
    t = np.arange(n) / SR
    out *= np.minimum(1, t / 1.5)[:, None] * np.clip((dur - t) / 3.0, 0, 1)[:, None]
    return out


def main():
    vid = sys.argv[1]
    d = os.path.join(ROOT, "build", vid)
    tl = json.load(open(os.path.join(d, "timeline.json")))
    ev = json.load(open(os.path.join(d, "events.json")))
    dur = tl["duration"]; n = int(dur * SR)
    voice = read_wav(os.path.join(d, "voice.wav"))[:n]; voice = np.pad(voice, (0, n - len(voice)))
    spec = json.load(open(os.path.join(ROOT, "src", f"{vid}.json")))
    mus = music(dur, tl, spec)
    e = smooth(np.abs(voice), 2205)
    duck = smooth(1 - 0.68 * np.clip(e / 0.03, 0, 1), 6615)
    out = mus * 0.62 * duck[:, None]
    cache = {}
    for x in ev:
        f, g = SFX.get(x["type"], (None, 0))
        if not f:
            continue
        if x["type"] not in cache or x["type"] in ("whoosh", "tick"):
            cache[x["type"]] = f()
        at = x["t"] - (0.05 if x["type"] == "whoosh" else 0)
        add(out, cache[x["type"]], at, g * (x.get("k") or 1) ** 0.5 * 0.5, pan=float(rs.uniform(-0.25, 0.25)))
    out += voice[:, None]
    peak = np.max(np.abs(out)) or 1
    out = out / max(1, peak / 0.95)
    with wave.open(os.path.join(d, "mix.wav"), "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"{vid}: mix.wav {dur:.1f}s, {len(ev)} sfx events")


if __name__ == "__main__":
    main()

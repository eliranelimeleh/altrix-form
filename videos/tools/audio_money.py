#!/usr/bin/env python3
"""Mix for the money series: real music beds (Mixkit, free licence) that switch between fast and slow
at scene cues, drops (silence before a reveal), low-pass for tension, ducking under the voice, and SFX.
usage: audio_money.py <id>   (reads build/<id>/{voice.wav,events.json,music.json,timeline.json})"""
import json, os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(ROOT, "build", "audio")
SFX_GAIN = {"whoosh": .45, "whoosh2": .45, "swoosh": .4, "impact": .7, "impact2": .6, "deep": .65, "riser": .4, "riser2": .35,
            "tick": .5, "ticktock": .45, "heart": .8, "heartbeat": .6, "coins": .45, "glitch": .35, "glitch2": .35, "shutter": .5,
            "pop": .45, "pop2": .45, "click": .5, "typing": .3, "bass": .7, "sub": .7, "drum": .6, "alarm": .4, "correct": .4, "buzzer": .3}
SFX_MAXLEN = {"ticktock": 4.5, "typing": 1.6, "glitch": 1.2, "riser2": 3.5, "heartbeat": 3.0}


def load(path, stereo=True):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2" if stereo else "1", "-ar", str(SR), "pipe:1"],
                       capture_output=True, check=True)
    a = np.frombuffer(p.stdout, np.float32).copy()
    return a.reshape(-1, 2) if stereo else a


_cache = {}
def track(name):
    if name not in _cache:
        a = load(os.path.join(AUD, "music", f"{name}.mp3"))
        _cache[name] = a / (np.sqrt(np.mean(a ** 2)) * 8 + 1e-9)  # loudness-normalise the beds (rms ~ 0.125)
    return _cache[name]


def sfx(name):
    key = "sfx:" + name
    if key not in _cache:
        f = os.path.join(AUD, "sfx", f"{name}.mp3")
        a = load(f)
        a = a / (np.abs(a).max() + 1e-9)
        if name in SFX_MAXLEN:
            n = int(SFX_MAXLEN[name] * SR); a = a[:n]
            a[-2000:] *= np.linspace(1, 0, min(2000, len(a)))[:, None]
        _cache[key] = a
    return _cache[key]


def ramp(n, up=True):
    x = np.linspace(0, 1, max(1, n))
    return np.sqrt(x) if up else np.sqrt(1 - x)


def main():
    vid = sys.argv[1]
    b = os.path.join(ROOT, "build", vid)
    tl = json.load(open(os.path.join(b, "timeline.json")))
    dur = tl["duration"]; N = int(dur * SR) + 1
    voice = load(os.path.join(b, "voice.wav"), stereo=False)[:N]
    voice = np.pad(voice, (0, N - len(voice)))
    events = json.load(open(os.path.join(b, "events.json")))
    cues = json.load(open(os.path.join(b, "music.json"))) if os.path.exists(os.path.join(b, "music.json")) else []
    tracks = sorted([c for c in cues if c.get("track")], key=lambda c: c["t"])
    fx = [c for c in cues if c.get("fx")]

    # --- music bed: each cue plays its track from `from` until the next cue, crossfaded ---
    bed = np.zeros((N, 2), np.float32)
    for i, c in enumerate(tracks):
        t0 = max(0.0, c["t"]); fade = c.get("fade", .3)
        nxt = tracks[i + 1] if i + 1 < len(tracks) else None
        t1 = nxt["t"] + nxt.get("fade", .3) if nxt else dur
        a0, a1 = int(t0 * SR), min(N, int(t1 * SR))
        src = track(c["track"]); off = int(c.get("from", 0) * SR)
        seg = src[off: off + (a1 - a0)]
        if len(seg) < a1 - a0:  # loop if the track runs out
            reps = int(np.ceil((a1 - a0) / max(1, len(src) - off)))
            seg = np.concatenate([src[off:]] * (reps + 1))[: a1 - a0]
        seg = seg * c.get("gain", .6)
        fi = int(fade * SR); seg[:fi] *= ramp(len(seg[:fi]))[:, None]
        if nxt:
            fo = int(nxt.get("fade", .3) * SR); seg[-fo:] *= ramp(len(seg[-fo:]), up=False)[:, None]
        bed[a0:a1] += seg
    # --- fx: lpf (muffled tension) and drop (silence before a hit) ---
    sos = butter(2, 650, "low", fs=SR, output="sos")
    for c in fx:
        if c["fx"] == "lpf":
            t0 = c["t"]; later = [x["t"] for x in tracks if x["t"] > t0 + .01]
            t1 = min([t0 + c.get("dur", 99)] + later + [dur])
            a0, a1 = int(t0 * SR), int(t1 * SR)
            if a1 - a0 > SR // 10:
                filt = sosfilt(sos, bed[a0:a1], axis=0).astype(np.float32)
                x = np.ones(a1 - a0, np.float32); r = min(len(x) // 2, int(.25 * SR)); x[:r] = np.linspace(0, 1, r)
                bed[a0:a1] = bed[a0:a1] * (1 - x[:, None]) + filt * x[:, None] * 1.25
    gain = np.ones(N, np.float32)
    for c in fx:
        if c["fx"] == "drop":
            a0, a1 = int(c["t"] * SR), min(N, int((c["t"] + c.get("dur", .6)) * SR)); r = int(.03 * SR)
            gain[a0:a1] = 0; gain[max(0, a0 - r):a0] = np.minimum(gain[max(0, a0 - r):a0], np.linspace(1, 0, a0 - max(0, a0 - r)))
    # --- ducking under the voice (smoothed envelope) ---
    env = np.abs(voice); k = int(.08 * SR)
    env = np.convolve(env, np.ones(k) / k, mode="same")
    duck = 1 - .62 * np.clip(env / .05, 0, 1)
    # end: let the music breathe after the last word, then fade out
    tail = int(1.4 * SR); gain[-tail:] *= np.linspace(1, 0, tail)
    music = bed * (gain * duck)[:, None]

    # --- sfx ---
    fxbus = np.zeros((N, 2), np.float32)
    for e in events:
        name = e["type"]
        if not os.path.exists(os.path.join(AUD, "sfx", f"{name}.mp3")): continue
        a = sfx(name) * SFX_GAIN.get(name, .5) * e.get("k", 1)
        s0 = int(max(0, e["t"]) * SR)
        if name == "riser":  # end the riser on the cue instead of starting there
            s0 = max(0, s0 - len(a) + int(.05 * SR))
        n = min(len(a), N - s0)
        if n > 0: fxbus[s0:s0 + n] += a[:n]
    mix = music * .9 + fxbus * .55 + voice[:, None] * 1.0
    mix /= max(1.0, np.abs(mix).max() / .97)
    out = os.path.join(b, "mix.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "pipe:0", out],
                   input=mix.astype(np.float32).tobytes(), check=True)
    print("wrote", out)


if __name__ == "__main__":
    main()

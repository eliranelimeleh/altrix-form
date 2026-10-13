#!/usr/bin/env python3
"""Music bed + sound design + mix for an ALTRIX reel (numpy only).

Reads build/<id>/voice.wav, timeline.json and events.json (written by the
renderer: impacts, pops, clicks, whooshes...) and writes build/<id>/mix.wav:
voice on top, a dark synth/trap beat ducked under the voice, and SFX on
every transition and on-screen hit.
"""
import json, os, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
BPM = 112
rs = np.random.RandomState(7)


def env(n, a, d):  # attack/exp-decay envelope in samples
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    if a > 0:
        e *= np.clip(t / a, 0, 1)
    return e


def onepole(x, fc):  # lowpass, fc scalar or array (Hz)
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y


def note(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------- instruments ----------
def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.001, 0.16) * 0.95 + rs.randn(n) * env(n, 0, 0.004) * 0.25


def clap():
    n = int(0.3 * SR); x = rs.randn(n)
    x = np.diff(np.concatenate([[0], x]))  # highpass-ish
    e = env(n, 0, 0.07) + 0.6 * np.concatenate([env(int(0.012 * SR), 0, 0.004), np.zeros(n - int(0.012 * SR))])
    return x * e * 0.35


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); x = rs.randn(n)
    x = np.diff(np.diff(np.concatenate([[0, 0], x])))
    return x * env(n, 0, 0.05 if open_ else 0.012) * 0.07


def pluck(m, dur=0.22):
    n = int(dur * SR); t = np.arange(n) / SR; f = note(m)
    x = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 * np.exp(-t * (6 + k * 5)) for k in range(1, 7))
    return x * env(n, 0.002, 0.12) * 0.16


def pad(ms, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.08, 0.08):
            f = note(m + det)
            x += sum(np.sin(2 * np.pi * f * k * t + k) / k for k in range(1, 6))
    a = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.3)
    return x * a * 0.018


def sub(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * note(m) * t) * env(n, 0.005, dur * 0.6) * 0.32


def add(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[0] or i + len(x) <= 0:
        return
    if i < 0:
        x = x[-i:]; i = 0
    x = x[: buf.shape[0] - i]
    buf[i:i + len(x), 0] += x * gain * (1 - max(0, pan))
    buf[i:i + len(x), 1] += x * gain * (1 + min(0, pan))


def music(dur, breaks=()):
    """breaks: [(t0, t1)] windows (chapter cards) where the drums drop out and come back on a hit."""
    buf = np.zeros((int(dur * SR) + SR, 2)); drums = np.zeros_like(buf)
    beat = 60 / BPM; bar = beat * 4
    prog = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [64, 67, 72]), (55, [62, 67, 71])]  # Am F C G
    nb = int(dur / bar) + 1
    K, CL, H, HO = kick(), clap(), hat(), hat(True)
    for b in range(nb):
        t0 = b * bar; root, ch = prog[b % 4]
        add(buf, pad([m - 12 for m in ch], bar + 0.3), t0, 1.0)
        intro = b == 0
        for s in range(16):  # 16th arp
            m = ch[(s * 2 + (s // 4)) % 3] + (12 if s % 8 >= 6 else 0)
            add(buf, pluck(m), t0 + s * beat / 4, 0.9 if s % 4 == 0 else 0.55, pan=0.35 * np.sin(s))
        if intro:
            continue
        for k in (0, 2.5, 3.0) if b % 2 else (0, 1.75, 2.5):
            add(drums, K, t0 + k * beat, 0.9)
        for k in (1, 3):
            add(drums, CL, t0 + k * beat, 0.8, pan=0.05)
        for s in range(8):
            add(drums, HO if s == 7 and b % 4 == 3 else H, t0 + s * beat / 2, 1.0 if s % 2 else 0.6, pan=-0.3)
        for k in (0, 1.5, 2.5, 3.5):
            add(drums, sub(root - 12, beat * 0.9), t0 + k * beat, 1.0)
    # drum breaks: mute drums inside each window (short ramps), re-enter with a kick on the drop
    g = np.ones(drums.shape[0]); tt = np.arange(drums.shape[0]) / SR
    for a, b in breaks:
        g = np.minimum(g, np.clip(np.maximum((a - tt) / 0.12, (tt - b) / 0.05), 0, 1))
    buf += drums * g[:, None]
    for a, b in breaks:
        add(buf, K, b, 1.0)
    # fade in/out
    n = buf.shape[0]; t = np.arange(n) / SR
    buf *= np.minimum(1, t / 0.4)[:, None] * np.clip((dur - t) / 1.6, 0, 1)[:, None]
    return buf[: int(dur * SR)]


# ---------- sfx ----------
def whoosh(d=0.42):
    n = int(d * SR); t = np.arange(n) / SR
    x = rs.randn(n); fc = 300 + 5200 * np.sin(np.pi * t / d) ** 2
    y = onepole(onepole(x, fc), fc) * np.sin(np.pi * t / d) ** 1.5
    return y * 0.55


def impact():
    n = int(1.1 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(32 + 80 * np.exp(-t / 0.06)) / SR) * env(n, 0.001, 0.3)
    tail = onepole(rs.randn(n), 900) * env(n, 0.003, 0.25) * 1.5
    return (boom * 0.9 + tail * 0.5 + rs.randn(n) * env(n, 0, 0.006) * 0.3) * 0.8


def pop():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(1500 * np.exp(-t / 0.03) + 500) / SR) * env(n, 0.001, 0.035) * 0.35


def click():
    n = int(0.06 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * t) * env(n, 0, 0.006) + rs.randn(n) * env(n, 0, 0.003) * 0.5) * 0.35


def tick():
    n = int(0.03 * SR)
    return np.diff(np.concatenate([[0], rs.randn(n)])) * env(n, 0, 0.004) * 0.18


def key():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 180 * t) * env(n, 0, 0.03) + onepole(rs.randn(n), 3000) * env(n, 0, 0.012) * 2) * 0.45


def riser(d=1.1):
    n = int(d * SR); t = np.arange(n) / SR
    y = onepole(rs.randn(n), 200 + 7000 * (t / d) ** 2) * (t / d) ** 2
    return y * 0.5


SFX = {"whoosh": (whoosh, 0.8), "impact": (impact, 0.9), "pop": (pop, 0.7), "click": (click, 0.8), "tick": (tick, 0.6),
       "key": (key, 0.9), "riser": (riser, 0.6)}


def movavg(x, n):  # same as np.convolve(x, ones(n)/n, "same"), O(len) for long tracks
    c = np.cumsum(np.concatenate([np.zeros(1), x]))
    a = np.arange(len(x)) - (n - 1) // 2
    lo, hi = np.clip(a, 0, len(x)), np.clip(a + n, 0, len(x))
    return (c[hi] - c[lo]) / n


def read_wav(p):
    with wave.open(p) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32767
    return a


def main():
    vid = sys.argv[1]
    d = os.path.join(ROOT, "build", vid)
    tl = json.load(open(os.path.join(d, "timeline.json")))
    ev = json.load(open(os.path.join(d, "events.json")))
    dur = tl["duration"]
    n = int(dur * SR)
    voice = read_wav(os.path.join(d, "voice.wav"))[:n]
    voice = np.pad(voice, (0, n - len(voice)))
    breaks = [(s["t0"] + 0.1, s["t1"]) for s in tl["segments"] if s["id"].startswith("ch")]
    mus = music(dur, breaks)
    # sidechain: duck music under the voice
    e = movavg(np.abs(voice), 2205)
    duck = 1 - 0.6 * np.clip(e / 0.03, 0, 1)
    duck = movavg(duck, 4410)
    out = mus * 0.55 * duck[:, None]
    cache = {}
    for x in ev:
        f, g = SFX.get(x["type"], (None, 0))
        if not f:
            continue
        if x["type"] not in cache or x["type"] in ("whoosh", "tick"):
            cache[x["type"]] = f()
        s = cache[x["type"]]
        at = x["t"] - (0.05 if x["type"] == "whoosh" else 0)
        add(out, s, at, g * (x.get("k") or 1) ** 0.5 * 0.7, pan=float(rs.uniform(-0.25, 0.25)))
    out += voice[:, None] * 1.0
    peak = np.max(np.abs(out)) or 1
    out = out / max(1, peak / 0.95)
    with wave.open(os.path.join(d, "mix.wav"), "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"{vid}: mix.wav {dur:.1f}s, {len(ev)} sfx events")


if __name__ == "__main__":
    main()

"""Original energetic synthwave/tech-house track, 128 BPM, A minor. No samples - fully synthesized,
so there are no copyright claims on Instagram.

usage: [DROP=7.6] python3 music.py OUT.wav DURATION_S [IMPACT_S ...]
  DURATION_S  total reel length + ~1s
  IMPACT_S    moments that get a sub-drop hit: the big number reveal(s) and the logo slam.
  DROP (env)  when the beat drops (default 1.875s = one light bar). Before it: dark pad + hats,
              a kick + snare-roll build in the last bar and a riser. Put it on the hook's payoff line.
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 44100
BPM = 128
BEAT = 60 / BPM
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 46.0
OUT = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
IMPACTS = [float(x) for x in sys.argv[3:]]
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def t_(d): return np.arange(int(d * SR)) / SR
def add(buf, sig, start, gain=1.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    buf[i:i + len(sig)] += sig * gain
def both(sig, start, gain=1.0, pan=0.0):
    add(L, sig, start, gain * (1 - pan) ** 0.5 if pan > 0 else gain)
    add(R, sig, start, gain * (1 + pan) ** 0.5 if pan < 0 else gain)
def lp(x, fc, order=2): b, a = butter(order, fc / (SR / 2), 'low'); return lfilter(b, a, x)
def hp(x, fc, order=2): b, a = butter(order, fc / (SR / 2), 'high'); return lfilter(b, a, x)
def note(n): return 440 * 2 ** ((n - 69) / 12)

def kick():
    t = t_(0.45); f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(1.6 * np.sin(ph) * np.exp(-t * 7.5))
def clap():
    t = t_(0.25); n = rng.standard_normal(len(t))
    env = np.exp(-t * 22) + 0.6 * np.exp(-((t - 0.012) * 300) ** 2) + 0.5 * np.exp(-((t - 0.024) * 300) ** 2)
    return hp(lp(n, 3500), 900) * env * 0.8
def hat(open_=False):
    t = t_(0.25 if open_ else 0.06); n = rng.standard_normal(len(t))
    return hp(n, 7000, 4) * np.exp(-t * (12 if open_ else 70)) * 0.35
def saw(f, d, detune=0.0):
    t = t_(d); out = 0
    for dt in (-detune, 0, detune):
        out = out + 2 * ((t * f * (1 + dt)) % 1) - 1
    return out / 3
def pluck(f, d=0.22):
    t = t_(d); s = saw(f, d, 0.004)
    return lp(s, 2600) * np.exp(-t * 14)

# Chord progression Am - F - C - G (one bar each)
prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])]
bar = 4 * BEAT
nbars = int(DUR / bar) + 1
side = np.ones(N)  # sidechain envelope

DROP = float(__import__('os').environ.get('DROP', '1.875'))
pre = int(np.ceil(DROP / bar))
INTRO_BARS = pre
for b in range(-pre, nbars):
    t0 = DROP + b * bar
    root, chord = prog[b % 4]
    full = b >= 0
    if not full and t0 + bar <= 1.2:  # silence under the very first words (the scratch hits alone)
        continue
    for q in range(4):
        tb = t0 + q * BEAT
        if full or b == -1:
            both(kick(), tb, 0.95 if full else 0.6)
        if tb < 0: continue
        i = int(tb * SR); k = t_(0.22)
        seg = 1 - 0.75 * np.exp(-k * 14)
        side[i:i + len(seg)] = np.minimum(side[i:i + len(seg)], seg[: max(0, min(len(seg), N - i))])
        if q in (1, 3) and full: both(clap(), tb, 0.55)
        both(hat(True), max(0, tb + BEAT / 2), 0.5 if full else 0.25)
        if full:
            both(hat(), tb + BEAT / 4, 0.35, pan=0.3)
            both(hat(), tb + 3 * BEAT / 4, 0.35, pan=-0.3)
    # offbeat bass
    for e in range(8):
        tb = t0 + e * BEAT / 2 + BEAT / 4
        if tb < 0: continue
        f = note(root - 24 + (12 if e % 4 == 3 else 0))
        s = lp(saw(f, BEAT / 2 * 0.9, 0.003), 500 if full else 300)
        both(s * np.exp(-t_(BEAT / 2 * 0.9) * 4), tb, 0.55)
    # arp 16ths
    if full:
        seq = chord + [chord[0] + 12, chord[2], chord[1] + 12, chord[0] + 12, chord[1]]
        for s16 in range(16):
            n_ = seq[s16 % len(seq)] + 12
            both(pluck(note(n_)), t0 + s16 * BEAT / 4, 0.16, pan=0.4 if s16 % 2 else -0.4)
    # pad
    pad = sum(saw(note(n_), bar, 0.008) for n_ in chord) / 3
    pad = lp(pad, 1200 if full else 700) * np.minimum(1, t_(bar) * 3)
    if t0 < 0: pad = pad[int(-t0 * SR):]; t0 = 0
    add(L, pad, t0, 0.12 if full else 0.16); add(R, pad, t0, 0.12 if full else 0.16)
    if b == -1:  # snare roll build into the drop
        for k_ in range(16):
            both(clap() * (0.2 + 0.8 * k_ / 16), t0 + k_ * bar / 16, 0.5)

# pad & bass follow the sidechain pump
L *= 0.55 + 0.45 * side; R *= 0.55 + 0.45 * side

# riser into first drop and impacts on money moments
def riser(d):
    t = t_(d); n = rng.standard_normal(len(t))
    out = np.zeros_like(n); chunk = 2048
    for i in range(0, len(n), chunk):
        fc = 400 + 9000 * (i / len(n)) ** 2
        out[i:i + chunk] = hp(n[i:i + chunk], fc)
    return out * (t / d) ** 2 * 0.35
def impact():
    t = t_(1.5); f = 40 + 60 * np.exp(-t * 10)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3)
    n = lp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 6) * 0.4
    return np.tanh(1.5 * (s + n))
both(riser(min(DROP, 2 * bar)), DROP - min(DROP, 2 * bar), 0.7)
for tt in (DROP, *IMPACTS):
    both(impact(), tt, 0.6)

# master: fade out at the end, soft clip
env = np.ones(N); fo = int(1.5 * SR); env[-fo:] = np.linspace(1, 0, fo)
mix = np.stack([L, R], 1) * env[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.4) * 0.9
wavfile.write(OUT, SR, (mix * 32767).astype(np.int16))
print('wrote', OUT, DUR)

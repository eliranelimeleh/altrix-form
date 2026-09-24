"""Synthesize the two house sound effects: whoosh.wav (card entrances) and ding.wav (money counter lands).
usage: python3 sfx.py OUT_DIR"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

out_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
SR = 44100
rng = np.random.default_rng(3)
def t_(d): return np.arange(int(d * SR)) / SR

# whoosh: band-passed noise sweeping up then down
d = 0.45; t = t_(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n); ch = 1024
for i in range(0, len(n), ch):
    x = i / len(n); fc = 600 + 5000 * np.sin(np.pi * x)
    b, a = butter(2, [fc * 0.6 / (SR / 2), min(fc * 1.4, 20000) / (SR / 2)], 'band')
    out[i:i + ch] = lfilter(b, a, n[i:i + ch])
w = out * np.sin(np.pi * t / d) ** 2; w /= np.abs(w).max()
wavfile.write(f'{out_dir}/whoosh.wav', SR, (w * 0.7 * 32767).astype(np.int16))

# cash ding: bright bell partials, doubled, plus a short tick
t = t_(1.2)
s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in [(2093, 1, 4), (3136, .6, 5), (4186, .3, 7), (1568, .5, 3)])
s2 = np.zeros_like(s); off = int(0.09 * SR); s2[off:] = s[:-off] * 0.8
d = s + s2 + rng.standard_normal(len(t)) * np.exp(-t * 80) * 0.3; d /= np.abs(d).max()
wavfile.write(f'{out_dir}/ding.wav', SR, (d * 0.6 * 32767).astype(np.int16))
print('wrote whoosh.wav, ding.wav')

# ---- extended kit (high-energy reels): scratch, boom, pop, click, glitch, riser, sad, ping, swish ----
def lp(x, fc): b, a = butter(2, fc / (SR / 2), 'low'); return lfilter(b, a, x)
def hp(x, fc): b, a = butter(2, fc / (SR / 2), 'high'); return lfilter(b, a, x)
def save(name, x, g=0.8):
    x = x / np.abs(x).max(); wavfile.write(f'{out_dir}/{name}.wav', SR, (x * g * 32767).astype(np.int16))
t = t_(0.5); n = rng.standard_normal(len(t)); out = np.zeros_like(n)
for i in range(0, len(n), 256):
    x = i / len(n); fc = 300 + 2500 * abs(np.sin(2 * np.pi * 3.2 * x)) * (1 - x * 0.5)
    b, a = butter(2, [fc * 0.7 / (SR / 2), fc * 1.3 / (SR / 2)], 'band'); out[i:i + 256] = lfilter(b, a, n[i:i + 256])
save('scratch', out * np.exp(-t * 3))
t = t_(1.4); f = 35 + 90 * np.exp(-t * 9)
save('boom', np.tanh(2 * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.5) + lp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 14) * 0.6)))
t = t_(0.12); save('pop', np.sin(2 * np.pi * np.cumsum(500 + 1400 * t / 0.12) / SR) * np.exp(-t * 35), 0.7)
t = t_(0.05); save('click', hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 150) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90), 0.6)
t = t_(0.35); g = np.sign(np.sin(2 * np.pi * 180 * t)) * 0.3 + rng.standard_normal(len(t)) * 0.5
g = np.repeat(g[::40], 40)[:len(t)]; save('glitch', hp(g * (np.floor(t * 40) % 2 == 0) * np.exp(-t * 4), 200), 0.6)
d = 1.6; t = t_(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n)
for i in range(0, len(n), 1024):
    b, a = butter(2, (300 + 9000 * (i / len(n)) ** 2) / (SR / 2), 'high'); out[i:i + 1024] = lfilter(b, a, n[i:i + 1024])
save('riser', (out + np.sin(2 * np.pi * np.cumsum(200 + 800 * (t / d) ** 2) / SR) * 0.3) * (t / d) ** 2, 0.6)
t = t_(1.3); s = np.zeros_like(t)
for f, a, b in [(311, 0, .3), (293, .3, .6), (277, .6, .9), (262, .9, 1.3)]:
    m = (t >= a) & (t < b); tt = t[m] - a; vib = 1 + 0.01 * np.sin(2 * np.pi * 6 * tt) * (b - a > 0.35)
    s[m] = (2 * ((f * vib * tt) % 1) - 1) * np.minimum(1, tt * 30) * np.minimum(1, (b - a - tt) * 30)
save('sad', lp(s, 1400), 0.55)
t = t_(0.6); s = np.sin(2 * np.pi * 1318 * t) * np.exp(-t * 8); s2 = np.zeros_like(s); o = int(0.1 * SR)
s2[o:] = np.sin(2 * np.pi * 1760 * t[:-o]) * np.exp(-t[:-o] * 7); save('ping', s + s2, 0.6)
t = t_(0.3); n = rng.standard_normal(len(t)); out = np.zeros_like(n)
for i in range(0, len(n), 512):
    fc = 800 + 7000 * (i / len(n)); b, a = butter(2, [fc * .6 / (SR / 2), min(fc * 1.5, 20000) / (SR / 2)], 'band'); out[i:i + 512] = lfilter(b, a, n[i:i + 512])
save('swish', out * np.sin(np.pi * t / 0.3), 0.6)
print('wrote extended kit')

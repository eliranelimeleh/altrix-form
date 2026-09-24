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

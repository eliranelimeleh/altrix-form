"""Find the exact end of a word before cutting (a cut 0.1s early chops the word - reel #3 lesson).

usage: python3 find_cut.py AUDIO.wav FROM_S TO_S
Prints 10ms energy (dB) and zero-crossing rate. Hebrew words often run into the next word with no
silence ("ככה או"): look for the ZCR change where one vowel turns into the next (e.g. 'a' ~2.5 -> 'o' ~1),
not only for energy dips (a dip inside a word is usually a consonant like כ/ח).
Always verify: build the joined audio and re-transcribe it with transcribe.py before rendering.
"""
import sys
import numpy as np
from scipy.io import wavfile

sr, x = wavfile.read(sys.argv[1]); x = x.astype(float)
if x.ndim > 1: x = x.mean(1)
a, b = float(sys.argv[2]), float(sys.argv[3])
for t in np.arange(a, b, 0.01):
    s = x[int(t * sr):int((t + 0.01) * sr)]
    db = 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9) - 90
    zcr = np.mean(np.abs(np.diff(np.sign(s)))) / 2 * sr / 1000
    print(f'{t:6.2f}  {db:6.1f} dB  zcr {zcr:4.1f}  ' + '#' * max(0, int((db + 60) / 2)))

"""Frame-level host-voice regions inside picked segments (smoothed GMM LLR).
usage: diar_frames.py audio16k.wav segs.json 'host:..' 'client:..' [thr]"""
import sys, json, numpy as np, librosa
from sklearn.mixture import GaussianMixture
y, sr = librosa.load(sys.argv[1], sr=16000); hop = 160
M = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20, hop_length=hop, n_fft=512)
F = np.vstack([M, librosa.feature.delta(M)]).T; F = (F - F.mean(0)) / (F.std(0) + 1e-6)
rms = librosa.feature.rms(y=y, hop_length=hop, frame_length=512)[0]; voiced = rms > np.percentile(rms, 35)
def frames(spec):
    idx = []
    for r in spec.split(':', 1)[1].split(','):
        a, b = map(float, r.split('-')); idx += list(range(int(a * 100), int(b * 100)))
    return F[[i for i in idx if i < len(F) and voiced[i]]]
gh = GaussianMixture(16, covariance_type='diag', random_state=0).fit(frames(sys.argv[3]))
gc = GaussianMixture(16, covariance_type='diag', random_state=0).fit(frames(sys.argv[4]))
llr = (gh.score_samples(F) - gc.score_samples(F)) * voiced
sm = np.convolve(llr, np.ones(30) / 30, 'same')
thr = float(sys.argv[5]) if len(sys.argv) > 5 else 4.0
S = json.load(open(sys.argv[2])); off = 0; res = []
for q in S:
    a, b = q[0], q[1]; i0, i1 = int(a * 100), int(b * 100); on = sm[i0:i1] > thr; j = 0
    while j < len(on):
        if on[j]:
            k = j
            while k < len(on) and on[k]: k += 1
            if k - j >= 15: res.append((round(a + j / 100, 2), round(a + k / 100, 2), round(off + j / 100, 2), round(float(sm[i0 + j:i0 + k].mean()), 1)))
            j = k
        else: j += 1
    off += b - a
for r in res: print('src %.2f-%.2f  base %.2f  llr %.1f' % r)

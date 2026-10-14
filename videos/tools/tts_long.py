#!/usr/bin/env python3
"""Narration for long-form ALTRIX productions (landscape training videos).

Unlike tools/tts.py (one request per reel), a long video is voiced in groups:
consecutive segments with the same voice inside a chapter, up to ~1800 chars
per request. Each group is cached by its text, so editing one line re-voices
only that group. Segments can use different voices (narrator / rep / client)
from spec["voices"]. Card segments ({"card": ...}) are silent holds.

Writes build/<id>/voice.wav and build/<id>/timeline.json in the same format the
renderer uses for reels, plus build/<id>/subs.srt.

Pacing comes from spec["tts"] (model, target_wps, max_tempo, max_gap, card_hold);
env vars MODEL_ID, TARGET_WPS, MAX_TEMPO, MAX_GAP, CARD_HOLD override it. Key: ELEVENLABS_API_KEY.
"""
import hashlib, json, os, re, sys
import numpy as np
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts import API, SR, hdrs, decode, time_words, tighten, atempo, estimate, write_wav  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.environ.get("MODEL_ID", "eleven_v4")
GAP_SEG = 0.42      # pause between segments of the same speaker
GAP_TURN = 0.38     # pause between dialogue turns
GAP_CH = 0.5        # extra before a chapter card
LEAD = 0.18         # scene starts this much before its first word


def tts(text, v):
    body = {"text": text, "model_id": MODEL, "language_code": "he",
            "voice_settings": {"stability": v.get("stability", 0.45), "similarity_boost": v.get("similarity_boost", 0.85),
                               "style": v.get("style", 0.3), "use_speaker_boost": True, "speed": v.get("speed", 1.0)}}
    url = f"{API}/v1/text-to-speech/{v['id']}/with-timestamps?output_format=mp3_44100_128"
    for attempt in range(4):
        try:
            r = requests.post(url, headers=hdrs(), json=body, timeout=600)
            if r.status_code < 500:
                break
        except requests.RequestException as e:
            print("  retry:", e)
    r.raise_for_status()
    d = r.json()
    import base64
    return base64.b64decode(d["audio_base64"]), d.get("alignment") or d.get("normalized_alignment")


def groups(segs):
    out, cur = [], None
    for s in segs:
        if s.get("card"):
            cur = None; out.append({"card": s}); continue
        v = s.get("voice", "narrator")
        if cur and cur["voice"] == v and cur["ch"] == s["ch"] and sum(len(x["say"]) for x in cur["segs"]) + len(s["say"]) < 1800 \
                and not s.get("pre"):
            cur["segs"].append(s)
        else:
            cur = {"voice": v, "ch": s["ch"], "segs": [s]}; out.append(cur)
    return out


def subtitle_cues(tl, spec, max_words=11, max_chars=60):
    """Sentence-level Hebrew subtitle cues with phrase display replacements (spoken words -> digits/Latin)."""
    ph = sorted((spec.get("phrases") or {}).items(), key=lambda kv: -len(kv[0]))

    def disp(ws):
        s = " ".join(w["w"] for w in ws)
        for a, b in ph:
            s = re.sub(r"(?<![\u0590-\u05FF])" + re.escape(a) + r"(?![\u0590-\u05FF])", b, s)
        return s.strip().rstrip(",")

    def split(ws):
        if len(ws) <= max_words and len(disp(ws)) <= max_chars:
            return [ws]
        mid = len(ws) / 2
        cands = [i for i in range(2, len(ws) - 1) if ws[i - 1]["w"][-1] in ",:"] or list(range(2, len(ws) - 1))
        i = min(cands, key=lambda i: abs(i - mid))
        return split(ws[:i]) + split(ws[i:])

    cues = []
    for s in tl:
        if not s["words"]:
            continue
        sent = []
        for w in s["words"]:
            sent.append(w)
            if w["w"][-1] in ".?!":
                for part in split(sent): cues.append({"seg": s["id"], "voice": s.get("voice", "narrator"), "ws": part})
                sent = []
        if sent:
            for part in split(sent): cues.append({"seg": s["id"], "voice": s.get("voice", "narrator"), "ws": part})
    out = []
    for k, c in enumerate(cues):
        t0 = c["ws"][0]["t0"] - 0.05
        t1 = c["ws"][-1]["t1"] + 0.6
        if k + 1 < len(cues): t1 = min(t1, cues[k + 1]["ws"][0]["t0"] - 0.08)
        out.append({"seg": c["seg"], "voice": c["voice"], "t0": round(t0, 3), "t1": round(max(t1, t0 + 0.5), 3), "text": disp(c["ws"])})
    return out


def srt(cues, voices, path):
    def ts(t):
        ms = int(round(t * 1000)); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    with open(path, "w", encoding="utf-8") as f:
        for k, c in enumerate(cues, 1):
            who = "" if c["voice"] == "narrator" else voices[c["voice"]]["name"].split(" ")[0] + ": "
            f.write(f"{k}\n{ts(c['t0'])} --> {ts(c['t1'])}\n\u202b{who}{c['text']}\u202c\n\n")


def main():
    vid = sys.argv[1]
    preview = "--preview" in sys.argv
    spec = json.load(open(os.path.join(ROOT, "src", f"{vid}.json")))
    out_dir = os.path.join(ROOT, "build", vid); cdir = os.path.join(out_dir, "tts")
    os.makedirs(cdir, exist_ok=True)
    voices = spec["voices"]
    cfg = spec.get("tts", {})  # per-video pacing lives in the script JSON; env vars override
    max_gap = float(os.environ.get("MAX_GAP", cfg.get("max_gap", 0.6)))
    target = float(os.environ.get("TARGET_WPS", cfg.get("target_wps", 2.45)))
    max_tempo = float(os.environ.get("MAX_TEMPO", cfg.get("max_tempo", 1.12)))
    card_hold = float(os.environ.get("CARD_HOLD", cfg.get("card_hold", 3.2)))
    global MODEL
    MODEL = os.environ.get("MODEL_ID", cfg.get("model", MODEL))
    if not preview and not os.environ.get("ELEVENLABS_API_KEY"):
        print("!! no ELEVENLABS_API_KEY -> preview"); preview = True

    pieces, cursor, tl = [], 0.0, []
    prev_voice = None
    used = 0
    for g in groups(spec["segments"]):
        if "card" in g:
            s = g["card"]; hold = s.get("hold", card_hold)
            if tl: cursor += GAP_CH
            tl.append({"id": s["id"], "words": [], "t0": cursor, "t1": cursor + hold, "card": True})
            pieces.append((cursor, np.zeros(1, np.float32))); cursor += hold; prev_voice = None
            continue
        text = " ".join(s["say"] for s in g["segs"])
        v = voices[g["voice"]]
        if preview:
            words = estimate(text); audio = np.zeros(int(words[-1]["t1"] * SR) + 1, np.float32)
        else:
            key = hashlib.sha1(f"{v['id']}|{MODEL}|{json.dumps(v, sort_keys=True)}|{text}".encode()).hexdigest()[:16]
            mp3p, alp = os.path.join(cdir, key + ".mp3"), os.path.join(cdir, key + ".json")
            if os.path.exists(mp3p) and os.path.exists(alp):
                mp3, al = open(mp3p, "rb").read(), json.load(open(alp))
            else:
                print(f"  TTS {g['voice']:8s} ch{g['ch']} {len(text)} chars: {text[:50]}...")
                mp3, al = tts(text, v); used += len(text)
                open(mp3p, "wb").write(mp3); json.dump(al, open(alp, "w"), ensure_ascii=False)
            audio = decode(mp3)
            words = time_words(text, al)
            audio, words = tighten(audio, words, max_gap)
            speech = words[-1]["t1"] - words[0]["t0"]
            tempo = min(max_tempo, max(1.0, target / (len(words) / speech)))
            audio = atempo(audio, tempo)
            for w in words: w["t0"] /= tempo; w["t1"] /= tempo
        # loudness-match every voice group (different voices come back at different levels)
        if not preview:
            fr = audio[: len(audio) // 1024 * 1024].reshape(-1, 1024); e = np.sqrt((fr ** 2).mean(1))
            act = e[e > e.max() * 0.1]
            if len(act):
                audio = audio * min(4.0, 10 ** (-17 / 20) / np.sqrt((act ** 2).mean()))
        # trim to first/last word with small margins
        a0 = max(0.0, words[0]["t0"] - 0.06); a1 = min(len(audio) / SR, words[-1]["t1"] + 0.25)
        audio = audio[int(a0 * SR):int(a1 * SR)]
        for w in words: w["t0"] -= a0; w["t1"] -= a0
        first = g["segs"][0]
        gap = first.get("pre", GAP_TURN if (prev_voice and prev_voice != g["voice"]) else GAP_SEG)
        cursor += gap if tl else 0.4
        start = cursor
        pieces.append((start, audio))
        k = 0
        for s in g["segs"]:
            n = len(s["say"].split()); ws = [dict(w, t0=w["t0"] + start, t1=w["t1"] + start) for w in words[k:k + n]]; k += n
            tl.append({"id": s["id"], "words": ws, "t0": ws[0]["t0"], "t1": ws[-1]["t1"], "voice": g["voice"], "tail": s.get("tail", 0)})
        cursor = start + len(audio) / SR
        # tail: extra hold after the group's last segment (lets visuals land)
        cursor += g["segs"][-1].get("tail", 0)
        prev_voice = g["voice"]

    # segment boundaries: each scene runs until the next scene starts
    for i, s in enumerate(tl):
        if not s.get("card") and s["words"]:
            s["t0"] = s["words"][0]["t0"] - LEAD
    tl[0]["t0"] = 0.0
    for i in range(len(tl) - 1):
        tl[i]["t1"] = tl[i + 1]["t0"]
    duration = cursor + 0.2
    tl[-1]["t1"] = duration
    audio = np.zeros(int(duration * SR) + SR, np.float32)
    for st, a in pieces:
        i = int(st * SR); audio[i:i + len(a)] += a[:len(audio) - i]
    audio = audio[:int(duration * SR)]
    write_wav(os.path.join(out_dir, "voice.wav"), audio)
    subs = subtitle_cues(tl, spec)
    srt(subs, voices, os.path.join(out_dir, "subs.srt"))
    json.dump({"id": vid, "duration": duration, "preview": preview, "model": MODEL, "segments": tl, "subs": subs},
              open(os.path.join(out_dir, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{vid}: {duration:.1f}s ({duration/60:.1f} min), {sum(len(s['words']) for s in tl)} words, "
          f"{len(tl)} scenes, new TTS chars {used}, preview={preview}")


if __name__ == "__main__":
    main()

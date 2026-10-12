#!/usr/bin/env python3
"""Narration for an ALTRIX reel.

Generates the voice-over with ElevenLabs (cloned voice, default "אלירן 2"),
gets per-character timestamps, tightens long pauses, speeds up a slow read,
and writes build/<id>/voice.wav + build/<id>/timeline.json that the renderer
syncs every animation and caption to.

Without an API key (or with --preview) it writes an estimated timeline and a
silent voice track so the visuals can still be rendered and reviewed.

Env: ELEVENLABS_API_KEY, VOICE_NAME (default "אלירן 2"), VOICE_ID, MODEL_ID,
     TARGET_WPS (default 2.9 Hebrew words/sec), MAX_GAP (default 0.32 s).
"""
import base64, json, os, re, subprocess, sys, wave
import numpy as np
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://api.elevenlabs.io"
SR = 44100
LEAD = 0.25      # silence before first word
TAIL = 2.6       # hold after last word (CTA end card)


def hdrs():
    h = {"Accept": "application/json"}
    key = os.environ.get("ELEVENLABS_API_KEY")
    if key:
        h["xi-api-key"] = key
    return h


def api_ok():
    try:
        r = requests.get(f"{API}/v1/user", headers=hdrs(), timeout=20)
        return r.status_code == 200
    except requests.RequestException:
        return False


def norm(s):
    return re.sub(r"\s+", " ", s).strip().lower()


def find_voice():
    if os.environ.get("VOICE_ID"):
        return os.environ["VOICE_ID"]
    want = norm(os.environ.get("VOICE_NAME", "אלירן 2"))
    voices = requests.get(f"{API}/v1/voices", headers=hdrs(), timeout=30).json()["voices"]
    for v in voices:
        if norm(v["name"]) == want:
            return v["voice_id"]
    for v in voices:
        if want in norm(v["name"]):
            return v["voice_id"]
    names = ", ".join(v["name"] for v in voices if v.get("category") != "premade")
    sys.exit(f"voice '{want}' not found. Own voices: {names or '(none)'}")


def pick_model():
    if os.environ.get("MODEL_ID"):
        return os.environ["MODEL_ID"]
    models = requests.get(f"{API}/v1/models", headers=hdrs(), timeout=30).json()
    ids = [m["model_id"] for m in models if m.get("can_do_text_to_speech", True)]
    for pref in ("v4", "eleven_v3", "eleven_multilingual_v2"):
        for i in ids:
            if pref in i:
                return i
    return ids[0]


def tts(text, voice, model):
    body = {
        "text": text,
        "model_id": model,
        "language_code": "he",
        "voice_settings": {"stability": 0.45, "similarity_boost": 0.85, "style": 0.35,
                           "use_speaker_boost": True, "speed": 1.08},
    }
    url = f"{API}/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128"
    r = requests.post(url, headers=hdrs(), json=body, timeout=300)
    if r.status_code >= 400:  # some models reject language_code / speed
        body.pop("language_code")
        body["voice_settings"].pop("speed")
        r = requests.post(url, headers=hdrs(), json=body, timeout=300)
    r.raise_for_status()
    d = r.json()
    al = d.get("alignment") or d.get("normalized_alignment")
    return base64.b64decode(d["audio_base64"]), al


def decode(mp3_bytes):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1",
                        "-ar", str(SR), "pipe:1"], input=mp3_bytes, capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).copy()


def words_with_offsets(text):
    return [(m.group(), m.start(), m.end()) for m in re.finditer(r"\S+", text)]


def time_words(text, al):
    chars = al["characters"]
    st, en = al["character_start_times_seconds"], al["character_end_times_seconds"]
    # alignment text may differ slightly from input; map by walking both strings
    joined = "".join(chars)
    if joined != text:
        # fall back to proportional mapping over the alignment length
        scale = len(chars) / max(1, len(text))
        idx = lambda i: min(len(chars) - 1, int(i * scale))
    else:
        idx = lambda i: i
    out = []
    for w, a, b in words_with_offsets(text):
        out.append({"w": w, "t0": st[idx(a)], "t1": en[idx(b - 1)]})
    return out


def tighten(audio, words, max_gap):
    """Cut the excess of any pause longer than max_gap; shift timestamps."""
    pieces, cur, shift = [], 0, 0.0
    new = []
    for i, w in enumerate(words):
        w = dict(w)
        if i > 0:
            gap = words[i]["t0"] - words[i - 1]["t1"]
            if gap > max_gap:
                cut = gap - max_gap
                mid = words[i - 1]["t1"] + max_gap * 0.5
                a = int(mid * SR)
                pieces.append(audio[cur:a])
                cur = int((mid + cut) * SR)
                shift += cut
        w["t0"] -= shift
        w["t1"] -= shift
        new.append(w)
    pieces.append(audio[cur:])
    return np.concatenate(pieces), new


def atempo(audio, tempo):
    if abs(tempo - 1) < 0.005:
        return audio
    p = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                        "-filter:a", f"atempo={tempo:.4f}", "-f", "f32le", "pipe:1"],
                       input=audio.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).copy()


def estimate(text):
    t, out = 0.0, []
    for w, _, _ in words_with_offsets(text):
        d = 0.1 + 0.05 * len(w)
        out.append({"w": w, "t0": t, "t1": t + d})
        t += d + (0.2 if w[-1] in ".?!:" else 0.08 if w[-1] == "," else 0.03)
    return out


def write_wav(path, audio):
    a = np.clip(audio, -1, 1)
    with wave.open(path, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((a * 32767).astype(np.int16).tobytes())


def main():
    vid = sys.argv[1]
    preview = "--preview" in sys.argv
    spec = json.load(open(os.path.join(ROOT, "src", f"{vid}.json")))
    out_dir = os.path.join(ROOT, "build", vid)
    os.makedirs(out_dir, exist_ok=True)
    segs = spec["segments"]
    text = " ".join(s["say"] for s in segs)

    if not preview and not api_ok():
        print("!! ElevenLabs key not available -> preview timeline (silent voice)")
        preview = True

    if preview:
        words = estimate(text)
        dur = words[-1]["t1"]
        audio = np.zeros(int(dur * SR) + 1, dtype=np.float32)
        model = voice = None
    else:
        voice, model = find_voice(), pick_model()
        print(f"voice={voice} model={model}")
        mp3, al = tts(text, voice, model)
        open(os.path.join(out_dir, "voice_raw.mp3"), "wb").write(mp3)
        audio = decode(mp3)
        words = time_words(text, al)
        audio, words = tighten(audio, words, float(os.environ.get("MAX_GAP", 0.32)))
        speech = words[-1]["t1"] - words[0]["t0"]
        wps = len(words) / speech
        tempo = min(1.15, max(1.0, float(os.environ.get("TARGET_WPS", 2.9)) / wps))
        print(f"rate {wps:.2f} words/s -> tempo x{tempo:.3f}")
        audio = atempo(audio, tempo)
        for w in words:
            w["t0"] /= tempo; w["t1"] /= tempo

    # shift by lead-in, assign words to segments
    for w in words:
        w["t0"] += LEAD; w["t1"] += LEAD
    audio = np.concatenate([np.zeros(int(LEAD * SR), np.float32), audio])
    k, tl = 0, []
    for s in segs:
        n = len(s["say"].split())
        ws = words[k:k + n]; k += n
        tl.append({"id": s["id"], "words": ws, "t0": ws[0]["t0"], "t1": ws[-1]["t1"]})
    # segment i spans until the next segment starts (scene boundary = first word of next)
    tl[0]["t0"] = 0.0
    for i in range(len(tl) - 1):
        nxt = tl[i + 1]["words"][0]["t0"]
        tl[i]["end"] = nxt - 0.06
        tl[i + 1]["t0"] = nxt - 0.06
    duration = tl[-1]["t1"] + TAIL
    tl[-1]["end"] = duration
    for s in tl:
        s["t1"] = s.pop("end")
    audio = np.concatenate([audio, np.zeros(int(duration * SR) - len(audio) + 1, np.float32)])
    write_wav(os.path.join(out_dir, "voice.wav"), audio)
    json.dump({"id": vid, "duration": duration, "preview": preview, "model": model, "voice": voice,
               "segments": tl}, open(os.path.join(out_dir, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{vid}: {duration:.1f}s, {len(words)} words, preview={preview}")


if __name__ == "__main__":
    main()

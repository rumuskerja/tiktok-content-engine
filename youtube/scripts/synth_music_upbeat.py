"""Synthesizes an original, upbeat 'motivational' background track from scratch.

    python3 youtube/scripts/synth_music_upbeat.py

No samples, no third-party audio: every sound is generated here with numpy, so
there is nothing for Content ID to claim. Writes youtube/assets/music-upbeat.mp3
(needs ffmpeg). 118 BPM, C major, I-V-vi-IV, 64 bars that loop cleanly.
"""

import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 118
BEAT = 60 / BPM
BAR = 4 * BEAT
OUT = Path(__file__).resolve().parents[2] / "youtube" / "assets" / "music-upbeat.mp3"
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, a=0.005, d=0.1, s=0.6, r=0.1, length=None):
    length = length or n
    t = np.arange(n) / SR
    e = np.ones(n) * s
    ai = int(a * SR)
    di = int(d * SR)
    e[:ai] = np.linspace(0, 1, ai, endpoint=False) if ai else e[:ai]
    e[ai:ai + di] = np.linspace(1, s, max(0, min(di, n - ai)), endpoint=False)
    ri = int(r * SR)
    if ri and n > ri:
        e[-ri:] *= np.linspace(1, 0, ri)
    return e


def lowpass(x, cutoff):
    # one-pole low-pass, cheap and warm
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0, detune) if detune else (0,):
        ph = (t * f * (1 + d)) % 1.0
        out += 2 * ph - 1
    return out / (3 if detune else 1)


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 35)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * 0.95


def clap():
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - lowpass(noise, 900)
    e = np.exp(-t * 22) + 0.5 * np.exp(-((t - 0.012) ** 2) / 1e-5)
    return noise * e * 0.35


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - lowpass(noise, 6000)
    return noise * np.exp(-t * (18 if open_ else 70)) * 0.18


def pluck(f, dur):
    n = int(dur * SR)
    x = saw(f, n, 0.004) * env(n, 0.002, 0.18, 0.15, 0.05)
    t = np.arange(n) / SR
    bright = lowpass(x, 3500)
    return bright * (0.6 + 0.4 * np.exp(-t * 8))


def pad(freqs, dur):
    n = int(dur * SR)
    x = sum(saw(f, n, 0.006) for f in freqs) / len(freqs)
    return lowpass(x, 1400) * env(n, 0.25, 0.3, 0.8, 0.35)


def bass(f, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.35 * saw(f, n)
    return lowpass(x, 600) * env(n, 0.004, 0.08, 0.7, 0.03)


def piano(f, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * k * t) * (0.6 ** (k - 1)) * np.exp(-t * (2.2 + k)) for k in range(1, 6))
    return x * env(n, 0.003, 0.05, 1.0, 0.08)


# chords: root midi + triad (C G Am F)
PROG = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]
MELODY = [  # 4-bar hook, (beat offset, midi, beats)
    (0, 76, 1), (1, 74, 0.5), (1.5, 72, 1.5), (3, 67, 1),
    (4, 74, 1), (5, 72, 0.5), (5.5, 71, 1.5), (7, 67, 1),
    (8, 72, 1), (9, 74, 0.5), (9.5, 76, 1.5), (11, 79, 1),
    (12, 77, 1), (13, 76, 0.5), (13.5, 74, 1), (14.5, 72, 1.5),
]

BARS = 64
total = int(BARS * BAR * SR) + SR
mix = {k: np.zeros(total) for k in ["drums", "bass", "pad", "pluck", "lead"]}


def put(track, x, at):
    i = int(at * SR)
    j = min(total, i + len(x))
    mix[track][i:j] += x[: j - i]


K, C, HC, HO = kick(), clap(), hat(), hat(True)

# section map (bars): intro 0-8, verse 8-24, lift 24-32, drop 32-48, verse 48-56, outro 56-64
for bar in range(BARS):
    t0 = bar * BAR
    root, triad = PROG[bar % 4]
    intro = bar < 8
    lift = 24 <= bar < 32
    drop = 32 <= bar < 48
    outro = bar >= 56
    full = not intro and not outro

    put("pad", pad([midi(n) for n in triad] + [midi(triad[0] - 12)], BAR) * (0.5 if drop else 0.38), t0)

    # piano chords on every beat in intro/verse/outro: hopeful feel
    if not drop:
        for b in range(4):
            for n in triad:
                put("lead", piano(midi(n + 12), BEAT * 0.95) * 0.07, t0 + b * BEAT)

    if full:
        for b in range(4):
            put("drums", K * (0.9 if not lift else 0.7), t0 + b * BEAT)
            put("drums", HC, t0 + (b + 0.5) * BEAT)
            if drop:
                put("drums", HC * 0.6, t0 + (b + 0.25) * BEAT)
                put("drums", HC * 0.6, t0 + (b + 0.75) * BEAT)
        put("drums", C, t0 + BEAT)
        put("drums", C, t0 + 3 * BEAT)
        # octave-pumping bass on eighths
        for e in range(8):
            f = midi(root - 12 + (12 if e % 2 else 0))
            put("bass", bass(f, BEAT / 2 * 0.9) * 0.45, t0 + e * BEAT / 2)
    elif intro and bar >= 4:
        for b in range(4):
            put("drums", HC * 0.7, t0 + (b + 0.5) * BEAT)

    # lift: snare roll in the last 2 bars before the drop
    if bar in (30, 31):
        steps = 8 if bar == 30 else 16
        for s in range(steps):
            put("drums", C * (0.4 + 0.5 * s / steps), t0 + s * BAR / steps)

    # arpeggio pluck
    if not intro:
        arp = triad + [triad[0] + 12]
        for s in range(8):
            n = arp[[0, 1, 2, 3, 2, 1, 2, 3][s]] + 12
            put("pluck", pluck(midi(n), BEAT / 2) * (0.22 if drop else 0.15), t0 + s * BEAT / 2)

    # hook melody in the drop (and softly in bars 48-56)
    if drop or 48 <= bar < 56:
        phrase_bar = bar % 4
        for off, n, length in MELODY:
            if int(off // 4) == phrase_bar:
                vol = 0.2 if drop else 0.11
                put("pluck", pluck(midi(n), length * BEAT) * vol, t0 + (off - phrase_bar * 4) * BEAT)
                put("pluck", pluck(midi(n - 12), length * BEAT) * vol * 0.5, t0 + (off - phrase_bar * 4) * BEAT)

# sidechain pump: duck pad, bass and pluck on each kick in the full sections
duck = np.ones(total)
for bar in range(8, 56):
    for b in range(4):
        i = int((bar * BAR + b * BEAT) * SR)
        n = int(BEAT * SR)
        curve = 1 - 0.55 * np.exp(-np.arange(n) / SR * 14)
        duck[i:i + n] = np.minimum(duck[i:i + n], curve[: len(duck[i:i + n])])

master = mix["drums"] + (mix["bass"] + mix["pad"] + mix["pluck"]) * duck + mix["lead"]
master = master[: int(BARS * BAR * SR)]
# gentle fade in/out at the loop edges
fade = int(0.02 * SR)
master[:fade] *= np.linspace(0, 1, fade)
master[-fade:] *= np.linspace(1, 0, fade)
master = np.tanh(master * 1.1) / np.tanh(1.1)
master /= np.max(np.abs(master)) / 0.89

# simple stereo: pluck/lead slightly wider via short delay
left = master
right = np.roll(master, int(0.011 * SR)) * 0.5 + master * 0.5
stereo = np.stack([left, right], axis=1)
pcm = (stereo * 32767).astype(np.int16)
tmp = OUT.with_suffix(".wav")
with wave.open(str(tmp), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-b:a", "192k", str(OUT)], check=True)
tmp.unlink()
print(f"{OUT} · {BARS * BAR:.0f}s")

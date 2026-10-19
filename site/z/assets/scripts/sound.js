/* Sons do portal, todos sintetizados (Web Audio): efeitos, músicas em loop e "vozes" do logo. */
(function () {
  'use strict';
  let ac = null;
  function ctx() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  // Bloco básico: oscilador com envelope e deslize de frequência.
  function tone(t0, freq, dur, { type = 'square', vol = 0.15, to = null, dest = null, attack = 0.005 } = {}) {
    const a = ctx();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(dest || a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, { vol = 0.2, filter = 1200, type = 'lowpass', to = null, dest = null } = {}) {
    const a = ctx();
    if (!a) return;
    const len = Math.ceil(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(filter, t0);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(dest || a.destination);
    src.start(t0);
  }
  const now = () => (ctx() ? ac.currentTime + 0.01 : 0);
  const seq = (notes, step, opts) => { const t = now(); notes.forEach((f, i) => { if (f) tone(t + i * step, f, step * 0.95, opts); }); };

  // Biblioteca de efeitos: os nomes são os que aparecem nos botões da mesa de sons.
  const SFX = {
    'Laser Zap': () => tone(now(), 1800, 0.25, { type: 'sawtooth', to: 120, vol: 0.12 }),
    'Coin': () => seq([988, 1319], 0.08, { vol: 0.12 }),
    'Boing': () => tone(now(), 150, 0.5, { type: 'sine', to: 600, vol: 0.3 }),
    'Explosion': () => noise(now(), 1.2, { vol: 0.5, filter: 1600, to: 60 }),
    'Siren': () => { const t = now(); for (let i = 0; i < 4; i++) tone(t + i * 0.4, 600, 0.4, { type: 'sine', to: 1100, vol: 0.12 }); },
    'Jump': () => tone(now(), 300, 0.18, { to: 900, vol: 0.12 }),
    'Power Up': () => seq([523, 659, 784, 1047, 1319, 1568], 0.06, { vol: 0.1 }),
    'Drum Hit': () => { const t = now(); tone(t, 160, 0.3, { type: 'sine', to: 40, vol: 0.6 }); noise(t, 0.08, { vol: 0.2, filter: 3000 }); },
    'Whistle': () => tone(now(), 2200, 0.6, { type: 'sine', to: 2600, vol: 0.1 }),
    'Alarm': () => { const t = now(); for (let i = 0; i < 6; i++) tone(t + i * 0.16, i % 2 ? 880 : 660, 0.15, { vol: 0.1 }); },
    'Bubble Pop': () => tone(now(), 400, 0.08, { type: 'sine', to: 1400, vol: 0.3 }),
    'Ding Dong': () => { const t = now(); tone(t, 659, 0.6, { type: 'triangle', vol: 0.25 }); tone(t + 0.5, 523, 0.9, { type: 'triangle', vol: 0.25 }); },
    'Thunder': () => { const t = now(); noise(t, 2.5, { vol: 0.6, filter: 400, to: 40 }); noise(t + 0.1, 0.3, { vol: 0.3, filter: 2500 }); },
    'Heartbeat': () => { const t = now(); [0, 0.22, 0.9, 1.12].forEach(d => tone(t + d, 70, 0.15, { type: 'sine', to: 40, vol: 0.6 })); },
    'Rocket Launch': () => { const t = now(); noise(t, 2, { vol: 0.4, filter: 300, to: 3000 }); tone(t, 80, 2, { type: 'sawtooth', to: 400, vol: 0.06 }); },
    'Robot Talk': () => { const t = now(); for (let i = 0; i < 10; i++) tone(t + i * 0.07, 200 + Math.random() * 600, 0.06, { vol: 0.08 }); },
    'Bloop': () => tone(now(), 700, 0.15, { type: 'sine', to: 200, vol: 0.3 }),
    'Ta Da': () => { const t = now(); tone(t, 523, 0.15, { vol: 0.12 }); [523, 659, 784].forEach(f => tone(t + 0.18, f, 0.8, { type: 'triangle', vol: 0.12 })); },
    'Sad Trombone': () => { const t = now(); [392, 370, 349].forEach((f, i) => tone(t + i * 0.4, f, 0.38, { type: 'sawtooth', vol: 0.08 })); tone(t + 1.2, 330, 1.2, { type: 'sawtooth', to: 300, vol: 0.08 }); },
    'Spring': () => { const t = now(); for (let i = 0; i < 6; i++) tone(t + i * 0.05, 300 + i * 80, 0.12, { type: 'sine', to: 900, vol: 0.1 }); },
    'Cat Meow': () => { const t = now(); tone(t, 700, 0.5, { type: 'sawtooth', to: 500, vol: 0.06 }); tone(t, 1400, 0.5, { type: 'sine', to: 900, vol: 0.05 }); },
    'Duck Quack': () => { const t = now(); tone(t, 450, 0.14, { type: 'sawtooth', to: 300, vol: 0.12 }); tone(t + 0.2, 450, 0.14, { type: 'sawtooth', to: 300, vol: 0.12 }); },
    'Cow Moo': () => tone(now(), 140, 1.2, { type: 'sawtooth', to: 110, vol: 0.12, attack: 0.15 }),
    'Applause': () => { const t = now(); for (let i = 0; i < 40; i++) noise(t + Math.random() * 1.8, 0.05, { vol: 0.15, filter: 2500, type: 'bandpass' }); },
    'Swoosh': () => noise(now(), 0.4, { vol: 0.3, filter: 400, to: 4000, type: 'bandpass' }),
    'Glass Clink': () => { const t = now(); tone(t, 2637, 0.6, { type: 'sine', vol: 0.1 }); tone(t, 3520, 0.4, { type: 'sine', vol: 0.06 }); },
    'Door Knock': () => { const t = now(); [0, 0.18, 0.36].forEach(d => noise(t + d, 0.06, { vol: 0.5, filter: 600 })); },
    'Game Over': () => seq([392, 330, 262, 196], 0.25, { type: 'triangle', vol: 0.15 }),
    'Level Up': () => seq([392, 523, 659, 784, 1047], 0.09, { vol: 0.1 }),
    'Crowd Cheer': () => { const t = now(); noise(t, 2, { vol: 0.35, filter: 1200, type: 'bandpass' }); for (let i = 0; i < 6; i++) tone(t + i * 0.2, 600 + Math.random() * 400, 0.3, { type: 'sawtooth', vol: 0.02 }); },
    'Magic Wand': () => { const t = now(); for (let i = 0; i < 12; i++) tone(t + i * 0.04, 1200 + i * 150, 0.2, { type: 'sine', vol: 0.06 }); },
    'Clock Tick': () => { const t = now(); for (let i = 0; i < 6; i++) noise(t + i * 0.5, 0.03, { vol: 0.4, filter: 4000, type: 'highpass' }); },
    'Splash': () => noise(now(), 0.8, { vol: 0.4, filter: 3000, to: 300 }),
    'Zipper': () => { const t = now(); for (let i = 0; i < 20; i++) noise(t + i * 0.02, 0.015, { vol: 0.25, filter: 3000, type: 'bandpass' }); },
    'Ghost Wail': () => tone(now(), 400, 2, { type: 'sine', to: 700, vol: 0.1, attack: 0.5 }),
    'Fanfare': () => seq([523, 523, 523, 659, 0, 523, 659, 784], 0.12, { vol: 0.1 }),
    // Efeitos usados em outras partes da página.
    coinin: () => seq([1319, 1760, 2637], 0.07, { vol: 0.12 }),
    bigreveal: () => { const t = now(); noise(t, 0.6, { vol: 0.2, filter: 200, to: 6000, type: 'bandpass' }); [523, 659, 784, 1047].forEach(f => tone(t + 0.55, f, 1, { type: 'triangle', vol: 0.08 })); },
    crashdrop: () => { const t = now(); noise(t, 0.9, { vol: 0.7, filter: 1800, to: 80 }); tone(t, 90, 0.6, { type: 'sine', to: 30, vol: 0.6 }); },
    mascot: () => { const t = now(); tone(t, 180, 0.25, { type: 'sawtooth', to: 90, vol: 0.12 }); tone(t + 0.25, 600, 0.15, { type: 'sine', to: 1200, vol: 0.12 }); },
  };
  const SOUNDBOARD_NAMES = Object.keys(SFX).filter(k => /[A-Z]/.test(k[0]));

  // "Vozes" do logo: pequenas frases de bipes com entonação diferente.
  const VOICES = [
    [440, 554, 659], [330, 392, 494, 392], [523, 494, 440, 523], [262, 330, 392, 523, 392], [600, 500, 700], [392, 392, 523],
  ];
  function voice(i) { seq(VOICES[i % VOICES.length], 0.09, { type: 'triangle', vol: 0.15 }); }

  // Música em loop gerada por semente (chiptune do dia, música do logo, faixa das 12 h).
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const SCALES = { major: [0, 2, 4, 7, 9], minor: [0, 3, 5, 7, 10], spooky: [0, 1, 4, 5, 7, 8, 11], festive: [0, 2, 4, 5, 7, 9, 11] };
  function makeTune(seed, scaleName = 'major', bpm = 132) {
    const r = rng(seed);
    const scale = SCALES[scaleName];
    const root = 48 + Math.floor(r() * 7);
    const midi = n => 440 * Math.pow(2, (n - 69) / 12);
    const melody = [];
    let deg = 0;
    for (let i = 0; i < 32; i++) {
      deg = Math.max(-2, Math.min(9, deg + Math.floor(r() * 5) - 2));
      const oct = Math.floor(deg / scale.length);
      const rest = r() < 0.18;
      melody.push(rest ? 0 : midi(root + 12 + oct * 12 + scale[((deg % scale.length) + scale.length) % scale.length]));
    }
    const prog = [0, 3, 4, 0].map(k => root - 12 + scale[k % scale.length] + (k >= scale.length ? 12 : 0));
    return { melody, bass: prog.map(midi), step: 60 / bpm / 2 };
  }
  function Player(tune) {
    let playing = false, timer = null, next = 0, i = 0;
    const gain = () => { if (!this.out) { const a = ctx(); if (!a) return null; this.out = a.createGain(); this.out.gain.value = 0.7; this.out.connect(a.destination); } return this.out; };
    const schedule = () => {
      const a = ctx();
      if (!a || !playing) return;
      while (next < a.currentTime + 0.3) {
        const f = tune.melody[i % tune.melody.length];
        if (f) tone(next, f, tune.step * 0.9, { type: 'square', vol: 0.06, dest: gain() });
        if (i % 8 === 0) tone(next, tune.bass[Math.floor(i / 8) % tune.bass.length], tune.step * 7.5, { type: 'triangle', vol: 0.12, dest: gain() });
        if (i % 4 === 2) noise(next, 0.05, { vol: 0.06, filter: 6000, type: 'highpass', dest: gain() });
        if (i % 8 === 0) tone(next, 120, 0.12, { type: 'sine', to: 50, vol: 0.25, dest: gain() });
        next += tune.step;
        i++;
      }
    };
    this.play = () => { const a = ctx(); if (!a || playing) return; playing = true; next = a.currentTime + 0.05; schedule(); timer = setInterval(schedule, 100); };
    this.pause = () => { playing = false; clearInterval(timer); };
    Object.defineProperty(this, 'paused', { get: () => !playing });
  }

  window.Sound = {
    play(name) {
      if (SFX[name]) SFX[name]();
      else if (/^voice-\d+$/.test(name)) voice(Number(name.split('-')[1]));
    },
    soundboardNames: SOUNDBOARD_NAMES,
    voiceCount: VOICES.length,
    tune(seed, scale, bpm) { return new Player(makeTune(seed, scale, bpm)); },
    unlock: ctx,
  };
})();

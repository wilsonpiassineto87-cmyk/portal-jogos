/* Mini motor comum dos jogos do portal: canvas em escala, entrada, laço, som e telas. */
(function () {
  'use strict';

  const Arcade = {};
  let audioCtx = null;

  // Fonte do portal dentro do iframe do jogo.
  const fontStyle = document.createElement('style');
  fontStyle.textContent = "@font-face{font-family:Fredoka;font-weight:300 700;src:url(../../assets/fonts/fredoka-latin.woff2) format('woff2')}";
  document.head.appendChild(fontStyle);
  Arcade.config = window.GAME_CONFIG || {};

  function ctxAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }

  // Bipe simples: frequência, duração (s), tipo de onda, volume, deslize de frequência.
  Arcade.beep = function (freq, dur = 0.1, type = 'square', vol = 0.15, slideTo = null) {
    const ac = ctxAudio();
    if (!ac) return;
    const t = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  };
  Arcade.sfx = {
    point: () => Arcade.beep(880, 0.08, 'square', 0.12, 1320),
    hit: () => Arcade.beep(220, 0.12, 'sawtooth', 0.15, 110),
    lose: () => { Arcade.beep(330, 0.25, 'triangle', 0.2, 80); },
    click: () => Arcade.beep(600, 0.04, 'square', 0.08),
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => Arcade.beep(f, 0.12, 'square', 0.12), i * 110)); },
  };

  // Cria um canvas de resolução lógica fixa que preenche a janela mantendo a proporção.
  Arcade.createStage = function (width, height, bg = '#112') {
    document.documentElement.style.cssText = 'margin:0;height:100%;background:' + bg;
    document.body.style.cssText = 'margin:0;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:' + bg + ';touch-action:none;user-select:none;-webkit-user-select:none;font-family:Fredoka,Arial,sans-serif';
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.imageRendering = 'auto';
    document.body.appendChild(canvas);
    function fit() {
      const s = Math.min(window.innerWidth / width, window.innerHeight / height);
      canvas.style.width = Math.floor(width * s) + 'px';
      canvas.style.height = Math.floor(height * s) + 'px';
    }
    window.addEventListener('resize', fit);
    fit();
    const ctx = canvas.getContext('2d');
    const stage = { canvas, ctx, width, height };

    // Converte coordenadas do ponteiro para coordenadas do jogo.
    stage.toLocal = function (e) {
      const r = canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] || e.changedTouches[0] : e;
      return { x: (p.clientX - r.left) * width / r.width, y: (p.clientY - r.top) * height / r.height };
    };
    return stage;
  };

  // Teclado: estado das teclas e callbacks de pressionar.
  Arcade.keys = {};
  const keyHandlers = [];
  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (!Arcade.keys[e.key]) keyHandlers.forEach(h => h(e.key));
    Arcade.keys[e.key] = true;
  });
  window.addEventListener('keyup', e => { Arcade.keys[e.key] = false; });
  Arcade.onKey = h => keyHandlers.push(h);

  // Deslizar no toque: chama h('up'|'down'|'left'|'right').
  Arcade.onSwipe = function (h) {
    let sx = 0, sy = 0;
    window.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) h(dx > 0 ? 'right' : 'left');
      else h(dy > 0 ? 'down' : 'up');
    }, { passive: true });
  };

  // Laço de animação com dt em segundos (limitado para evitar saltos ao trocar de aba).
  Arcade.loop = function (update) {
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  Arcade.best = function (key, score) {
    const k = 'arcadeBest_' + key;
    let best = 0;
    try { best = Number(localStorage.getItem(k) || 0); } catch (e) { /* armazenamento indisponível */ }
    if (score !== undefined && score > best) {
      best = score;
      try { localStorage.setItem(k, String(best)); } catch (e) { /* ignora */ }
    }
    return best;
  };

  Arcade.text = function (ctx, txt, x, y, size, color = '#fff', align = 'center') {
    ctx.font = `700 ${size}px Fredoka, Arial, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillText(txt, x + size * 0.06, y + size * 0.06);
    ctx.fillStyle = color;
    ctx.fillText(txt, x, y);
  };

  // Painel central com título e instrução (início / fim de partida).
  Arcade.panel = function (stage, title, lines) {
    const { ctx, width, height } = stage;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, width, height);
    Arcade.text(ctx, title, width / 2, height / 2 - 40, Math.round(Math.min(width, height) / 9), '#ffd23f');
    lines.forEach((l, i) => Arcade.text(ctx, l, width / 2, height / 2 + 20 + i * 34, Math.round(Math.min(width, height) / 20)));
  };

  Arcade.rand = (a, b) => a + Math.random() * (b - a);
  Arcade.randInt = (a, b) => Math.floor(Arcade.rand(a, b + 1));
  Arcade.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  window.Arcade = Arcade;
})();

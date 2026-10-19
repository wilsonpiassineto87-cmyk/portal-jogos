/* Adivinhe a palavra: 6 erros permitidos, teclado na tela ou físico. */
(function () {
  const W = 720, H = 960;
  const stage = Arcade.createStage(W, H, '#4a148c');
  const { ctx } = stage;
  const WORDS = {
    ANIMALS: ['GIRAFFE', 'PENGUIN', 'DOLPHIN', 'OCTOPUS', 'KANGAROO', 'HEDGEHOG', 'FLAMINGO', 'TORTOISE', 'CHEETAH', 'BUTTERFLY'],
    FOOD: ['PANCAKE', 'AVOCADO', 'SPAGHETTI', 'PRETZEL', 'BROCCOLI', 'CUPCAKE', 'PINEAPPLE', 'SANDWICH', 'NOODLES', 'POPCORN'],
    SPACE: ['GALAXY', 'ASTEROID', 'NEPTUNE', 'ROCKET', 'ECLIPSE', 'SATELLITE', 'COMET', 'NEBULA', 'GRAVITY', 'ORBIT'],
    SPORTS: ['FOOTBALL', 'TENNIS', 'BASKETBALL', 'SKATEBOARD', 'VOLLEYBALL', 'SWIMMING', 'CYCLING', 'KARATE', 'HOCKEY', 'ARCHERY'],
  };
  const KEYS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
  let word, cat, guessed, misses, state, wins = 0;

  function reset() {
    const cats = Object.keys(WORDS);
    cat = cats[Arcade.randInt(0, cats.length - 1)];
    word = WORDS[cat][Arcade.randInt(0, WORDS[cat].length - 1)];
    guessed = new Set();
    misses = 0;
    state = 'play';
  }
  function guess(l) {
    if (state !== 'play') { reset(); return; }
    if (guessed.has(l)) return;
    guessed.add(l);
    if (word.includes(l)) {
      Arcade.sfx.point();
      if ([...word].every(ch => guessed.has(ch))) { state = 'won'; wins++; Arcade.sfx.win(); }
    } else {
      misses++;
      Arcade.sfx.hit();
      if (misses >= 6) { state = 'lost'; Arcade.sfx.lose(); }
    }
  }
  function keyRect(i) {
    const row = i < 10 ? 0 : i < 19 ? 1 : 2;
    const start = row === 0 ? 0 : row === 1 ? 10 : 19;
    const count = row === 0 ? 10 : row === 1 ? 9 : 7;
    const kw = 64, gap = 6, total = count * kw + (count - 1) * gap;
    return { x: (W - total) / 2 + (i - start) * (kw + gap), y: 690 + row * 84, w: kw, h: 74 };
  }
  Arcade.onKey(k => { const u = k.toUpperCase(); if (/^[A-Z]$/.test(u)) guess(u); else if (k === 'Enter' && state !== 'play') reset(); });
  stage.canvas.addEventListener('pointerdown', e => {
    const p = stage.toLocal(e);
    if (state !== 'play') { reset(); return; }
    KEYS.forEach((l, i) => { const r = keyRect(i); if (p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h) guess(l); });
  });

  function drawBalloons() {
    // Seis balões: cada erro estoura um.
    for (let i = 0; i < 6; i++) {
      const x = 160 + i * 80, y = 300 + Math.sin(performance.now() / 500 + i) * 8;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y + 44); ctx.lineTo(W / 2, 440); ctx.stroke();
      if (i < 6 - misses) {
        ctx.fillStyle = ['#ef5350', '#ffca28', '#66bb6a', '#29b6f6', '#ab47bc', '#ff7043'][i];
        ctx.beginPath(); ctx.ellipse(x, y, 32, 42, 0, 0, 7); ctx.fill();
      } else Arcade.text(ctx, '💥', x, y, 40);
    }
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath(); ctx.arc(W / 2, 470, 30, 0, 7); ctx.fill();
  }

  reset();
  Arcade.loop(() => {
    ctx.fillStyle = '#4a148c';
    ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, 'Word Guess', W / 2, 70, 56, '#ffd23f');
    Arcade.text(ctx, `Category: ${cat}   •   Wins ${wins}`, W / 2, 140, 30);
    drawBalloons();
    const shown = [...word].map(ch => (guessed.has(ch) || state === 'lost' ? ch : '_')).join(' ');
    Arcade.text(ctx, shown, W / 2, 590, word.length > 9 ? 40 : 52, state === 'lost' ? '#ff8a80' : '#fff');
    KEYS.forEach((l, i) => {
      const r = keyRect(i);
      const used = guessed.has(l);
      ctx.fillStyle = used ? (word.includes(l) ? '#43a047' : '#5d4037') : '#7e57c2';
      ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 10); ctx.fill();
      Arcade.text(ctx, l, r.x + r.w / 2, r.y + r.h / 2, 32, used ? 'rgba(255,255,255,0.5)' : '#fff');
    });
    if (state === 'won') Arcade.panel(stage, 'You got it!', [word, 'Tap or press Enter for the next word']);
    if (state === 'lost') Arcade.panel(stage, 'All balloons popped!', ['The word was ' + word, 'Tap or press Enter to try again']);
  });
})();

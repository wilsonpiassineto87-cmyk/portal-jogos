/* Pegue os itens com a cesta; evite os ruins. Config: theme ('halloween'). */
(function () {
  const cfg = Object.assign({
    key: 'catcher', good: ['🎃', '🍬', '🍭', '🍫'], bad: ['🕷️', '💀'],
    sky: ['#12002a', '#4a148c'], moon: true, hint: ['Catch pumpkins and sweets', 'Avoid spiders and skulls!'],
  }, Arcade.config);
  const W = 960, H = 640;
  const stage = Arcade.createStage(W, H, '#1a0033');
  const { ctx } = stage;
  const GOOD = cfg.good;
  const BAD = cfg.bad;
  let basket, items, score, lives, spawn, state, t = 0;

  function reset() { basket = { x: W / 2, w: 150 }; items = []; score = 0; lives = 3; spawn = 0; state = 'play'; }
  stage.canvas.addEventListener('pointermove', e => { basket.x = Arcade.clamp(stage.toLocal(e).x, basket.w / 2, W - basket.w / 2); });
  stage.canvas.addEventListener('pointerdown', e => { if (state !== 'play') reset(); basket.x = Arcade.clamp(stage.toLocal(e).x, basket.w / 2, W - basket.w / 2); });
  Arcade.onKey(k => { if (k === ' ' && state !== 'play') reset(); });

  function update(dt) {
    if (Arcade.keys.ArrowLeft || Arcade.keys.a) basket.x -= 650 * dt;
    if (Arcade.keys.ArrowRight || Arcade.keys.d) basket.x += 650 * dt;
    basket.x = Arcade.clamp(basket.x, basket.w / 2, W - basket.w / 2);
    spawn -= dt;
    const level = 1 + score / 15;
    if (spawn <= 0) {
      const bad = Math.random() < 0.22;
      const list = bad ? BAD : GOOD;
      items.push({ x: Arcade.rand(40, W - 40), y: -30, vy: Arcade.rand(150, 240) * level, e: list[Arcade.randInt(0, list.length - 1)], bad, rot: Arcade.rand(-2, 2) });
      spawn = Arcade.rand(0.35, 0.8) / level;
    }
    items.forEach(it => { it.y += it.vy * dt; });
    items = items.filter(it => {
      if (it.y > H - 70 && it.y < H - 20 && Math.abs(it.x - basket.x) < basket.w / 2) {
        if (it.bad) { lives--; Arcade.sfx.hit(); if (lives <= 0) { state = 'over'; Arcade.best(cfg.key, score); Arcade.sfx.lose(); } }
        else { score++; Arcade.sfx.point(); }
        return false;
      }
      return it.y < H + 40;
    });
  }

  function drawScene() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, cfg.sky[0]); g.addColorStop(1, cfg.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (cfg.moon) {
      ctx.fillStyle = '#fff8e1';
      ctx.beginPath(); ctx.arc(820, 110, 60, 0, 7); ctx.fill();
      ctx.fillStyle = cfg.sky[0];
      ctx.beginPath(); ctx.arc(845, 95, 55, 0, 7); ctx.fill();
    } else {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 40; i++) ctx.fillRect((i * 97 + t * 30 * (1 + i % 3)) % W, (i * 53 + t * 50 * (1 + i % 2)) % H, 4, 4);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * 180, H); ctx.lineTo(i * 180 + 90, H - 120 - (i % 2) * 60); ctx.lineTo(i * 180 + 180, H); ctx.fill(); }
  }

  reset();
  state = 'ready';
  Arcade.loop(dt => {
    t += dt;
    if (state === 'play') update(dt);
    drawScene();
    ctx.font = '52px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    items.forEach(it => { ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(Math.sin(t * 3 + it.rot) * 0.3); ctx.fillText(it.e, 0, 0); ctx.restore(); });
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath(); ctx.roundRect(basket.x - basket.w / 2, H - 60, basket.w, 46, [6, 6, 22, 22]); ctx.fill();
    ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 4;
    for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(basket.x - basket.w / 2 + i * basket.w / 5, H - 60); ctx.lineTo(basket.x - basket.w / 2 + i * basket.w / 5, H - 14); ctx.stroke(); }
    Arcade.text(ctx, `Score ${score}`, 24, 34, 32, '#ffb74d', 'left');
    Arcade.text(ctx, '❤️'.repeat(Math.max(0, lives)), W - 24, 34, 30, '#fff', 'right');
    if (state === 'ready') Arcade.panel(stage, cfg.title || 'Pumpkin Catcher', [...cfg.hint, 'Move with mouse, touch or arrows — click to start']);
    if (state === 'over') Arcade.panel(stage, cfg.overTitle || 'Spooked!', ['Score: ' + score + '   Best: ' + Arcade.best(cfg.key), 'Click to play again']);
  });
})();

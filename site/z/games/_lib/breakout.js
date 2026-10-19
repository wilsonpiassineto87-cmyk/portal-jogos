/* Quebra-tijolos: mouse/toque ou setas. Config: theme ('classic'|'neon'). */
(function () {
  const cfg = Object.assign({ theme: 'classic', key: 'breakout' }, Arcade.config);
  const W = 960, H = 640;
  const neon = cfg.theme === 'neon';
  const stage = Arcade.createStage(W, H, neon ? '#000' : '#102a43');
  const { ctx } = stage;
  const ROWS = 6, COLS = 12, BW = 72, BH = 26, BX = (W - COLS * (BW + 4)) / 2, BY = 80;
  const rowColors = neon ? ['#ff00e6', '#ff6b00', '#fff200', '#00ff6a', '#00e5ff', '#7b61ff'] : ['#ef5350', '#ff9800', '#ffeb3b', '#66bb6a', '#29b6f6', '#ab47bc'];
  let paddle, ball, bricks, lives, score, level, state;

  function newLevel() {
    bricks = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) bricks.push({ x: BX + c * (BW + 4), y: BY + r * (BH + 4), alive: true, color: rowColors[r], pts: (ROWS - r) * 10 });
    serve();
  }
  function serve() { ball = { x: W / 2, y: H - 80, vx: 240 * (Math.random() < 0.5 ? -1 : 1), vy: -360 - level * 40, r: 10, stuck: true }; }
  function reset() { paddle = { x: W / 2, w: 140 }; lives = 3; score = 0; level = 1; newLevel(); state = 'ready'; }

  stage.canvas.addEventListener('pointermove', e => { paddle.x = Arcade.clamp(stage.toLocal(e).x, paddle.w / 2, W - paddle.w / 2); });
  stage.canvas.addEventListener('pointerdown', e => {
    paddle.x = Arcade.clamp(stage.toLocal(e).x, paddle.w / 2, W - paddle.w / 2);
    launch();
  });
  Arcade.onKey(k => { if (k === ' ' || k === 'ArrowUp') launch(); });
  function launch() {
    if (state === 'over' || state === 'won') { reset(); return; }
    state = 'play';
    ball.stuck = false;
  }

  function update(dt) {
    if (Arcade.keys.ArrowLeft || Arcade.keys.a) paddle.x -= 700 * dt;
    if (Arcade.keys.ArrowRight || Arcade.keys.d) paddle.x += 700 * dt;
    paddle.x = Arcade.clamp(paddle.x, paddle.w / 2, W - paddle.w / 2);
    if (ball.stuck) { ball.x = paddle.x; ball.y = H - 52 - ball.r; return; }
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x < ball.r || ball.x > W - ball.r) { ball.vx *= -1; ball.x = Arcade.clamp(ball.x, ball.r, W - ball.r); Arcade.beep(440, 0.03); }
    if (ball.y < ball.r) { ball.vy = Math.abs(ball.vy); Arcade.beep(440, 0.03); }
    const py = H - 50;
    if (ball.vy > 0 && ball.y + ball.r > py && ball.y < py + 16 && Math.abs(ball.x - paddle.x) < paddle.w / 2 + ball.r) {
      const off = (ball.x - paddle.x) / (paddle.w / 2);
      const speed = Math.hypot(ball.vx, ball.vy);
      ball.vx = speed * off * 0.8;
      ball.vy = -Math.sqrt(Math.max(1, speed * speed - ball.vx * ball.vx));
      Arcade.beep(330, 0.04);
    }
    for (const b of bricks) {
      if (!b.alive) continue;
      if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + BW && ball.y + ball.r > b.y && ball.y - ball.r < b.y + BH) {
        b.alive = false;
        score += b.pts;
        const overlapX = Math.min(ball.x + ball.r - b.x, b.x + BW - (ball.x - ball.r));
        const overlapY = Math.min(ball.y + ball.r - b.y, b.y + BH - (ball.y - ball.r));
        if (overlapX < overlapY) ball.vx *= -1; else ball.vy *= -1;
        Arcade.sfx.point();
        break;
      }
    }
    if (bricks.every(b => !b.alive)) { level++; Arcade.sfx.win(); newLevel(); if (level > 3) { state = 'won'; Arcade.best(cfg.key, score); } }
    if (ball.y > H + 20) {
      lives--;
      Arcade.sfx.lose();
      if (lives <= 0) { state = 'over'; Arcade.best(cfg.key, score); } else serve();
    }
  }

  function draw() {
    ctx.fillStyle = neon ? '#000' : '#102a43';
    ctx.fillRect(0, 0, W, H);
    if (neon) { ctx.shadowBlur = 16; }
    bricks.forEach(b => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.beginPath(); ctx.roundRect(b.x, b.y, BW, BH, 6); ctx.fill();
    });
    ctx.fillStyle = neon ? '#fff' : '#ffd23f';
    ctx.shadowColor = '#fff';
    ctx.beginPath(); ctx.roundRect(paddle.x - paddle.w / 2, H - 50, paddle.w, 16, 8); ctx.fill();
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, 7); ctx.fill();
    ctx.shadowBlur = 0;
    Arcade.text(ctx, `Score ${score}   Lives ${lives}   Level ${level}`, 20, 30, 26, '#fff', 'left');
    Arcade.text(ctx, 'Best ' + Arcade.best(cfg.key), W - 20, 30, 26, '#fff', 'right');
    if (state === 'ready') Arcade.panel(stage, cfg.title || 'Brick Breaker', ['Move with mouse, touch or arrows', 'Click, tap or press space to launch']);
    if (state === 'over') Arcade.panel(stage, 'Game Over', ['Score: ' + score, 'Click to play again']);
    if (state === 'won') Arcade.panel(stage, 'You cleared it!', ['Score: ' + score, 'Click to play again']);
  }

  reset();
  Arcade.loop(dt => { if (state === 'play' || (state === 'ready')) update(dt); draw(); });
})();

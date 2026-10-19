/* Pong: W/S contra ↑/↓ (2 jogadores) ou contra o computador. Primeiro a 7. */
(function () {
  const W = 960, H = 600, PH = 110, PW = 18;
  const stage = Arcade.createStage(W, H, '#004d40');
  const { ctx } = stage;
  let left, right, ball, mode, score, winner, serveTimer;

  function serve(dir) { ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 }; serveTimer = 1; ball.dir = dir; }
  function reset() { left = { y: H / 2 }; right = { y: H / 2 }; score = [0, 0]; winner = null; serve(Math.random() < 0.5 ? -1 : 1); }

  stage.canvas.addEventListener('pointerdown', e => {
    const p = stage.toLocal(e);
    if (!mode) {
      if (p.y > 250 && p.y < 330) { mode = 1; reset(); }
      if (p.y > 370 && p.y < 450) { mode = 2; reset(); }
      return;
    }
    if (winner) reset();
  });
  // Toque: metade esquerda controla a raquete esquerda, metade direita a direita.
  stage.canvas.addEventListener('pointermove', e => {
    if (!mode || e.pointerType === 'mouse') return;
    const p = stage.toLocal(e);
    if (p.x < W / 2) left.y = p.y; else if (mode === 2) right.y = p.y;
  });
  Arcade.onKey(k => { if (k === ' ' && winner) reset(); });

  function update(dt) {
    const sp = 520 * dt;
    if (Arcade.keys.w || Arcade.keys.W) left.y -= sp;
    if (Arcade.keys.s || Arcade.keys.S) left.y += sp;
    if (mode === 2) {
      if (Arcade.keys.ArrowUp) right.y -= sp;
      if (Arcade.keys.ArrowDown) right.y += sp;
    } else {
      const target = ball.vx > 0 ? ball.y : H / 2;
      right.y += Arcade.clamp(target - right.y, -360 * dt, 360 * dt);
      if (Arcade.keys.ArrowUp) left.y -= sp;
      if (Arcade.keys.ArrowDown) left.y += sp;
    }
    left.y = Arcade.clamp(left.y, PH / 2, H - PH / 2);
    right.y = Arcade.clamp(right.y, PH / 2, H - PH / 2);
    if (serveTimer > 0) {
      serveTimer -= dt;
      if (serveTimer <= 0) { ball.vx = 380 * ball.dir; ball.vy = Arcade.rand(-200, 200); }
      return;
    }
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.y < 10 || ball.y > H - 10) { ball.vy *= -1; ball.y = Arcade.clamp(ball.y, 10, H - 10); Arcade.beep(300, 0.03); }
    for (const [pad, x, side] of [[left, 40, -1], [right, W - 40, 1]]) {
      if (Math.sign(ball.vx) === side && Math.abs(ball.x - x) < PW && Math.abs(ball.y - pad.y) < PH / 2 + 10) {
        ball.vx = -ball.vx * 1.06;
        ball.vy += (ball.y - pad.y) * 6;
        Arcade.beep(500, 0.05);
      }
    }
    if (ball.x < -20 || ball.x > W + 20) {
      const scorer = ball.x < 0 ? 1 : 0;
      score[scorer]++;
      Arcade.sfx.point();
      if (score[scorer] >= 7) { winner = scorer === 0 ? 'Left player' : (mode === 1 ? 'Computer' : 'Right player'); Arcade.sfx.win(); }
      else serve(scorer === 0 ? 1 : -1);
    }
  }

  Arcade.loop(dt => {
    ctx.fillStyle = '#004d40';
    ctx.fillRect(0, 0, W, H);
    if (!mode) {
      Arcade.text(ctx, 'Pong Duel', W / 2, 140, 80, '#ffd23f');
      [['1 Player vs Computer', 290], ['2 Players (W/S vs ↑/↓)', 410]].forEach(([t, y]) => {
        ctx.fillStyle = '#ff9800';
        ctx.beginPath(); ctx.roundRect(W / 2 - 260, y - 40, 520, 80, 20); ctx.fill();
        Arcade.text(ctx, t, W / 2, y, 30);
      });
      return;
    }
    if (!winner) update(dt);
    ctx.setLineDash([16, 16]);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fff';
    ctx.fillRect(40 - PW / 2, left.y - PH / 2, PW, PH);
    ctx.fillRect(W - 40 - PW / 2, right.y - PH / 2, PW, PH);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 11, 0, 7); ctx.fill();
    Arcade.text(ctx, String(score[0]), W / 2 - 80, 60, 64);
    Arcade.text(ctx, String(score[1]), W / 2 + 80, 60, 64);
    if (winner) Arcade.panel(stage, winner + ' wins!', ['Tap or press space to play again']);
  });
})();

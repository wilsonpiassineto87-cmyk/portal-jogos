/* Cobrança de pênalti: mire com o mouse/toque e chute; o goleiro tenta defender. 10 cobranças. */
(function () {
  const W = 960, H = 640;
  const stage = Arcade.createStage(W, H, '#2e7d32');
  const { ctx } = stage;
  const goal = { x: 230, y: 120, w: 500, h: 220 };
  let aim, ball, keeper, shots, goals, state, msg, msgT;

  function reset() { shots = 0; goals = 0; state = 'aim'; resetShot(); }
  function resetShot() { aim = { x: W / 2, y: goal.y + goal.h / 2 }; ball = { x: W / 2, y: 560, s: 1, t: 0, fly: false }; keeper = { x: W / 2, tx: W / 2, dive: 0 }; }

  stage.canvas.addEventListener('pointermove', e => {
    if (state !== 'aim') return;
    const p = stage.toLocal(e);
    aim = { x: Arcade.clamp(p.x, goal.x - 40, goal.x + goal.w + 40), y: Arcade.clamp(p.y, goal.y - 40, goal.y + goal.h) };
  });
  stage.canvas.addEventListener('pointerdown', e => {
    if (state === 'done') { reset(); return; }
    if (state !== 'aim') return;
    const p = stage.toLocal(e);
    aim = { x: Arcade.clamp(p.x, goal.x - 40, goal.x + goal.w + 40), y: Arcade.clamp(p.y, goal.y - 40, goal.y + goal.h) };
    shoot();
  });
  Arcade.onKey(k => { if (k === ' ' && state === 'aim') shoot(); });

  function shoot() {
    state = 'fly';
    ball.fly = true;
    ball.from = { x: ball.x, y: ball.y };
    // O goleiro escolhe um lado: às vezes acerta a leitura.
    const guess = Math.random() < 0.45 ? aim.x : Arcade.rand(goal.x + 40, goal.x + goal.w - 40);
    keeper.tx = Arcade.clamp(guess, goal.x + 50, goal.x + goal.w - 50);
    Arcade.beep(180, 0.08, 'triangle', 0.3);
  }
  function result() {
    shots++;
    const inGoal = aim.x > goal.x + 12 && aim.x < goal.x + goal.w - 12 && aim.y > goal.y + 12;
    const saved = inGoal && Math.abs(keeper.x - aim.x) < 70 && aim.y > goal.y + 40;
    if (inGoal && !saved) { goals++; msg = 'GOAL!'; Arcade.sfx.win(); } else { msg = saved ? 'SAVED!' : 'MISSED!'; Arcade.sfx.hit(); }
    msgT = 1.2;
    state = 'result';
    setTimeout(() => {
      if (shots >= 10) { state = 'done'; Arcade.best('penalty', goals); } else { state = 'aim'; resetShot(); }
    }, 1300);
  }

  function drawField() {
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#2e7d32' : '#388e3c'; ctx.fillRect(0, 360 + i * 40, W, 40); }
    ctx.fillStyle = '#90caf9';
    ctx.fillRect(0, 0, W, 120);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
    ctx.strokeRect(goal.x - 60, goal.y + goal.h, goal.w + 120, 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
    for (let x = goal.x; x <= goal.x + goal.w; x += 25) { ctx.beginPath(); ctx.moveTo(x, goal.y); ctx.lineTo(x, goal.y + goal.h); ctx.stroke(); }
    for (let y = goal.y; y <= goal.y + goal.h; y += 25) { ctx.beginPath(); ctx.moveTo(goal.x, y); ctx.lineTo(goal.x + goal.w, y); ctx.stroke(); }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(goal.x, goal.y + goal.h); ctx.lineTo(goal.x, goal.y); ctx.lineTo(goal.x + goal.w, goal.y); ctx.lineTo(goal.x + goal.w, goal.y + goal.h); ctx.stroke();
  }

  reset();
  Arcade.loop(dt => {
    if (state === 'fly') {
      ball.t = Math.min(1, ball.t + dt * 2.2);
      ball.x = ball.from.x + (aim.x - ball.from.x) * ball.t;
      ball.y = ball.from.y + (aim.y - ball.from.y) * ball.t - Math.sin(ball.t * Math.PI) * 60;
      ball.s = 1 - ball.t * 0.55;
      keeper.x += Arcade.clamp(keeper.tx - keeper.x, -900 * dt, 900 * dt);
      keeper.dive = Math.min(1, keeper.dive + dt * 3) * Math.sign(keeper.tx - W / 2 || 1);
      if (ball.t >= 1) result();
    }
    if (msgT > 0) msgT -= dt;
    drawField();
    ctx.save();
    ctx.translate(keeper.x, goal.y + goal.h - 70);
    ctx.rotate(keeper.dive * 0.9);
    ctx.fillStyle = '#ff9800';
    ctx.beginPath(); ctx.roundRect(-28, -40, 56, 90, 14); ctx.fill();
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath(); ctx.arc(0, -60, 22, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff9800';
    ctx.fillRect(-70, -36, 40, 14); ctx.fillRect(30, -36, 40, 14);
    ctx.restore();
    if (state === 'aim') {
      ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(aim.x, aim.y, 22, 0, 7); ctx.moveTo(aim.x - 32, aim.y); ctx.lineTo(aim.x + 32, aim.y); ctx.moveTo(aim.x, aim.y - 32); ctx.lineTo(aim.x, aim.y + 32); ctx.stroke();
    }
    ctx.font = `${Math.round(56 * ball.s)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('⚽', ball.x, ball.y);
    Arcade.text(ctx, `Shots ${shots}/10   Goals ${goals}   Best ${Arcade.best('penalty')}`, W / 2, 40, 30, '#0d47a1');
    if (msgT > 0) Arcade.text(ctx, msg, W / 2, 440, 90, msg === 'GOAL!' ? '#ffeb3b' : '#ff5252');
    if (state === 'done') Arcade.panel(stage, `${goals} / 10 goals`, [goals >= 8 ? 'World-class striker!' : goals >= 5 ? 'Nice finishing!' : 'Keep practising!', 'Click to play again']);
  });
})();

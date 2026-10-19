/* Acerte a toupeira: 45 segundos, toupeiras douradas valem 3. */
(function () {
  const W = 960, H = 640;
  const stage = Arcade.createStage(W, H, '#558b2f');
  const { ctx } = stage;
  const holes = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) holes.push({ x: 150 + c * 220, y: 210 + r * 150, up: 0, t: 0, gold: false, hit: 0 });
  let score, time, state, spawn;

  function reset() { score = 0; time = 45; spawn = 0; holes.forEach(h => { h.up = 0; h.t = 0; h.hit = 0; }); state = 'play'; }

  stage.canvas.addEventListener('pointerdown', e => {
    if (state !== 'play') { reset(); return; }
    const p = stage.toLocal(e);
    for (const h of holes) {
      if (h.t > 0 && h.up > 0.5 && !h.hit && Math.hypot(p.x - h.x, p.y - (h.y - 30)) < 70) {
        h.hit = 0.35;
        score += h.gold ? 3 : 1;
        h.gold ? Arcade.sfx.win() : Arcade.sfx.point();
        return;
      }
    }
    Arcade.beep(150, 0.05, 'triangle');
  });

  function update(dt) {
    time -= dt;
    if (time <= 0) { time = 0; state = 'over'; Arcade.best('whack', score); Arcade.sfx.lose(); return; }
    spawn -= dt;
    if (spawn <= 0) {
      const free = holes.filter(h => h.t <= 0);
      if (free.length) {
        const h = free[Arcade.randInt(0, free.length - 1)];
        h.t = Arcade.rand(0.7, 1.4) * (0.6 + time / 90);
        h.gold = Math.random() < 0.12;
        h.hit = 0;
      }
      spawn = Arcade.rand(0.25, 0.7) * (0.5 + time / 90);
    }
    holes.forEach(h => {
      if (h.hit > 0) { h.hit -= dt; if (h.hit <= 0) h.t = 0; }
      if (h.t > 0) h.t -= dt;
      const target = h.t > 0 && !(h.hit > 0 && h.hit < 0.2) ? 1 : 0;
      h.up += (target - h.up) * Math.min(1, dt * 12);
    });
  }

  function drawMole(h) {
    const rise = h.up * 70;
    ctx.save();
    ctx.beginPath();
    ctx.rect(h.x - 80, h.y - 140, 160, 140);
    ctx.clip();
    const y = h.y + 40 - rise;
    ctx.fillStyle = h.gold ? '#ffca28' : '#8d6e63';
    ctx.beginPath(); ctx.ellipse(h.x, y - 30, 48, 58, 0, 0, 7); ctx.fill();
    ctx.fillStyle = h.gold ? '#fff59d' : '#d7ccc8';
    ctx.beginPath(); ctx.ellipse(h.x, y - 12, 26, 20, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#212121';
    const eye = h.hit > 0 ? 'x' : 'o';
    if (eye === 'o') { ctx.beginPath(); ctx.arc(h.x - 16, y - 48, 6, 0, 7); ctx.arc(h.x + 16, y - 48, 6, 0, 7); ctx.fill(); }
    else { Arcade.text(ctx, '× ×', h.x, y - 48, 26, '#212121'); }
    ctx.fillStyle = '#f48fb1';
    ctx.beginPath(); ctx.arc(h.x, y - 22, 8, 0, 7); ctx.fill();
    ctx.restore();
  }

  reset();
  state = 'ready';
  Arcade.loop(dt => {
    if (state === 'play') update(dt);
    ctx.fillStyle = '#7cb342';
    ctx.fillRect(0, 0, W, H);
    holes.forEach(h => {
      ctx.fillStyle = '#3e2723';
      ctx.beginPath(); ctx.ellipse(h.x, h.y, 72, 26, 0, 0, 7); ctx.fill();
      drawMole(h);
      ctx.fillStyle = '#5d4037';
      ctx.beginPath(); ctx.ellipse(h.x, h.y + 8, 76, 18, 0, 0, Math.PI); ctx.fill();
    });
    Arcade.text(ctx, `Score ${score}`, 30, 40, 34, '#fff', 'left');
    Arcade.text(ctx, `Time ${Math.ceil(time)}`, W - 30, 40, 34, '#fff', 'right');
    Arcade.text(ctx, 'Best ' + Arcade.best('whack'), W / 2, 40, 28);
    if (state === 'ready') Arcade.panel(stage, 'Whack A Mole', ['Hit the moles as they pop up!', 'Golden moles are worth 3', 'Click or tap to start']);
    if (state === 'over') Arcade.panel(stage, "Time's up!", ['Score: ' + score, 'Click or tap to play again']);
  });
})();

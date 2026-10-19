/* Corrida de faixas: troque de faixa (←/→ ou toque nas laterais) e desvie dos carros. */
(function () {
  const W = 600, H = 960, LANES = 4, LW = 120, ROAD = LANES * LW, RX = (W - ROAD) / 2;
  const stage = Arcade.createStage(W, H, '#33691e');
  const { ctx } = stage;
  let car, traffic, dist, speed, state, offset, spawn;

  function reset() { car = { lane: 1, x: RX + LW * 1.5 }; traffic = []; dist = 0; speed = 360; offset = 0; spawn = 0; state = 'play'; }
  function shift(d) { if (state !== 'play') { reset(); return; } car.lane = Arcade.clamp(car.lane + d, 0, LANES - 1); Arcade.beep(400, 0.04); }
  Arcade.onKey(k => { if (k === 'ArrowLeft' || k === 'a') shift(-1); if (k === 'ArrowRight' || k === 'd') shift(1); if (k === ' ' && state !== 'play') reset(); });
  stage.canvas.addEventListener('pointerdown', e => { if (state !== 'play') { reset(); return; } shift(stage.toLocal(e).x < W / 2 ? -1 : 1); });

  function drawCar(x, y, color, flip) {
    ctx.save(); ctx.translate(x, y); if (flip) ctx.rotate(Math.PI);
    ctx.fillStyle = '#212121'; ctx.fillRect(-36, -40, 12, 26); ctx.fillRect(24, -40, 12, 26); ctx.fillRect(-36, 18, 12, 26); ctx.fillRect(24, 18, 12, 26);
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(-30, -56, 60, 112, 16); ctx.fill();
    ctx.fillStyle = 'rgba(180,220,255,0.9)'; ctx.beginPath(); ctx.roundRect(-22, -34, 44, 26, 6); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-22, 10, 44, 26);
    ctx.restore();
  }

  reset();
  state = 'ready';
  Arcade.loop(dt => {
    if (state === 'play') {
      speed += dt * 8;
      dist += speed * dt / 100;
      offset = (offset + speed * dt) % 80;
      car.x += (RX + LW * (car.lane + 0.5) - car.x) * Math.min(1, dt * 14);
      spawn -= dt;
      if (spawn <= 0) {
        const lane = Arcade.randInt(0, LANES - 1);
        traffic.push({ lane, y: -80, v: Arcade.rand(0.35, 0.65), color: ['#e53935', '#1e88e5', '#fdd835', '#8e24aa', '#fb8c00'][Arcade.randInt(0, 4)] });
        spawn = Arcade.rand(0.5, 1.1) * 400 / speed;
      }
      traffic.forEach(t => { t.y += speed * t.v * dt; });
      traffic = traffic.filter(t => t.y < H + 100);
      if (traffic.some(t => Math.abs(RX + LW * (t.lane + 0.5) - car.x) < 56 && Math.abs(t.y - (H - 160)) < 100)) { state = 'over'; Arcade.best('racer', Math.floor(dist)); Arcade.sfx.lose(); }
    }
    ctx.fillStyle = '#33691e'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#424242'; ctx.fillRect(RX, 0, ROAD, H);
    ctx.fillStyle = '#fff';
    for (let l = 1; l < LANES; l++) for (let y = -80 + offset; y < H; y += 80) ctx.fillRect(RX + l * LW - 3, y, 6, 40);
    ctx.fillStyle = '#ffeb3b'; ctx.fillRect(RX - 6, 0, 6, H); ctx.fillRect(RX + ROAD, 0, 6, H);
    traffic.forEach(t => drawCar(RX + LW * (t.lane + 0.5), t.y, t.color, true));
    drawCar(car.x, H - 160, '#00e676', false);
    Arcade.text(ctx, `${Math.floor(dist)} m`, 20, 34, 32, '#fff', 'left');
    Arcade.text(ctx, `${Math.floor(speed / 4)} km/h`, W - 20, 34, 28, '#fff', 'right');
    if (state === 'ready') Arcade.panel(stage, 'Lane Racer', ['← / → or tap left/right to change lane', 'Dodge the traffic!', 'Tap or press space to start']);
    if (state === 'over') Arcade.panel(stage, 'Crash!', [`Distance: ${Math.floor(dist)} m   Best: ${Arcade.best('racer')} m`, 'Tap or press space to race again']);
  });
})();

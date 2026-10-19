/* Corrida 3D em perspectiva: desvie dos blocos que vêm na sua direção (←/→ ou toque nas laterais). */
(function () {
  const W = 960, H = 640, HORIZON = 220, FOCAL = 300;
  const stage = Arcade.createStage(W, H, '#0b0033');
  const { ctx } = stage;
  let px, cubes, z, speed, state, spawn, dirTouch = 0;

  function reset() { px = 0; cubes = []; z = 0; speed = 22; spawn = 0; state = 'play'; }
  function project(x, y, depth) { const s = FOCAL / depth; return { x: W / 2 + (x - px) * s, y: HORIZON + y * s, s }; }
  stage.canvas.addEventListener('pointerdown', e => { if (state !== 'play') { reset(); return; } dirTouch = stage.toLocal(e).x < W / 2 ? -1 : 1; });
  stage.canvas.addEventListener('pointerup', () => { dirTouch = 0; });
  Arcade.onKey(k => { if (k === ' ' && state !== 'play') reset(); });

  function drawCube(c) {
    const d = c.z - z;
    if (d < 1) return;
    const half = 1.2;
    const f = [project(c.x - half, 3 - half * 2, d), project(c.x + half, 3, d)];
    const b = [project(c.x - half, 3 - half * 2, d + half * 2), project(c.x + half, 3, d + half * 2)];
    const shade = Math.max(0.25, Math.min(1, 1.6 - d / 60));
    ctx.fillStyle = `hsla(${c.hue},90%,${40 * shade}%,1)`;
    ctx.beginPath(); ctx.moveTo(f[0].x, f[0].y); ctx.lineTo(b[0].x, b[0].y); ctx.lineTo(b[1].x, b[0].y); ctx.lineTo(f[1].x, f[0].y); ctx.fill();
    ctx.fillStyle = `hsla(${c.hue},90%,${55 * shade}%,1)`;
    ctx.fillRect(f[0].x, f[0].y, f[1].x - f[0].x, f[1].y - f[0].y);
    ctx.strokeStyle = `rgba(255,255,255,${0.5 * shade})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(f[0].x, f[0].y, f[1].x - f[0].x, f[1].y - f[0].y);
  }

  reset();
  state = 'ready';
  Arcade.loop(dt => {
    if (state === 'play') {
      const dir = (Arcade.keys.ArrowLeft || Arcade.keys.a ? -1 : 0) + (Arcade.keys.ArrowRight || Arcade.keys.d ? 1 : 0) + dirTouch;
      px = Arcade.clamp(px + dir * 16 * dt, -10, 10);
      speed += dt * 0.8;
      z += speed * dt;
      spawn -= dt;
      if (spawn <= 0) { cubes.push({ x: Arcade.rand(-11, 11), z: z + 80, hue: Arcade.randInt(260, 340) }); spawn = Arcade.rand(0.15, 0.45) * 22 / speed; }
      cubes = cubes.filter(c => c.z > z - 2);
      if (cubes.some(c => c.z - z < 2.2 && c.z - z > 0 && Math.abs(c.x - px) < 1.9)) { state = 'over'; Arcade.best('cuberun', Math.floor(z)); Arcade.sfx.lose(); }
    }
    const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
    g.addColorStop(0, '#0b0033'); g.addColorStop(1, '#ff2e88');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, HORIZON);
    ctx.fillStyle = '#ffcc33';
    ctx.beginPath(); ctx.arc(W / 2, HORIZON, 90, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#12002b'; ctx.fillRect(0, HORIZON, W, H - HORIZON);
    ctx.strokeStyle = 'rgba(255,46,136,0.6)';
    ctx.lineWidth = 2;
    for (let x = -40; x <= 40; x += 4) { const a = project(x, 3, 1), b = project(x, 3, 200); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    for (let k = Math.ceil(z / 6) * 6; k < z + 120; k += 6) { const d = k - z; if (d < 1) continue; const a = project(-60, 3, d); ctx.beginPath(); ctx.moveTo(0, a.y); ctx.lineTo(W, a.y); ctx.stroke(); }
    cubes.slice().sort((a, b) => b.z - a.z).forEach(drawCube);
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath(); ctx.moveTo(W / 2, H - 110); ctx.lineTo(W / 2 + 46, H - 40); ctx.lineTo(W / 2 - 46, H - 40); ctx.fill();
    Arcade.text(ctx, `Distance ${Math.floor(z)}`, 20, 32, 30, '#fff', 'left');
    Arcade.text(ctx, 'Best ' + Arcade.best('cuberun'), W - 20, 32, 30, '#fff', 'right');
    if (state === 'ready') Arcade.panel(stage, 'Cube Run 3D', ['← / → or hold left/right side to steer', 'Dodge the cubes!', 'Tap or press space to start']);
    if (state === 'over') Arcade.panel(stage, 'Crashed!', ['Distance: ' + Math.floor(z), 'Tap or press space to run again']);
  });
})();

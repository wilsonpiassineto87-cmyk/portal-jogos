/* Nave atiradora: setas/WASD movem, espaço atira (toque: arrastar move e atira sozinho). */
(function () {
  const W = 720, H = 960;
  const stage = Arcade.createStage(W, H, '#000010');
  const { ctx } = stage;
  const stars = Array.from({ length: 120 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Arcade.rand(0.5, 2.5) }));
  let ship, shots, rocks, sparks, score, lives, state, cool, spawn, touchFire = false, inv;

  function reset() { ship = { x: W / 2, y: H - 120 }; shots = []; rocks = []; sparks = []; score = 0; lives = 3; cool = 0; spawn = 0; inv = 0; state = 'play'; }
  stage.canvas.addEventListener('pointerdown', e => { if (state !== 'play') reset(); touchFire = true; move(e); });
  stage.canvas.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || e.buttons) move(e); });
  stage.canvas.addEventListener('pointerup', () => { touchFire = false; });
  function move(e) { const p = stage.toLocal(e); ship.x = Arcade.clamp(p.x, 30, W - 30); ship.y = Arcade.clamp(p.y - 60, 80, H - 40); }
  Arcade.onKey(k => { if (k === ' ' && state !== 'play') reset(); });

  function boom(x, y, color) { for (let i = 0; i < 14; i++) sparks.push({ x, y, vx: Arcade.rand(-220, 220), vy: Arcade.rand(-220, 220), life: 0.6, color }); }

  function update(dt) {
    const sp = 420 * dt;
    if (Arcade.keys.ArrowLeft || Arcade.keys.a) ship.x -= sp;
    if (Arcade.keys.ArrowRight || Arcade.keys.d) ship.x += sp;
    if (Arcade.keys.ArrowUp || Arcade.keys.w) ship.y -= sp;
    if (Arcade.keys.ArrowDown || Arcade.keys.s) ship.y += sp;
    ship.x = Arcade.clamp(ship.x, 30, W - 30);
    ship.y = Arcade.clamp(ship.y, 80, H - 40);
    cool -= dt;
    inv -= dt;
    if ((Arcade.keys[' '] || touchFire) && cool <= 0) { shots.push({ x: ship.x, y: ship.y - 30 }); cool = 0.18; Arcade.beep(900, 0.05, 'square', 0.06, 1400); }
    shots.forEach(s => { s.y -= 760 * dt; });
    shots = shots.filter(s => s.y > -20);
    spawn -= dt;
    if (spawn <= 0) { const r = Arcade.rand(20, 46); rocks.push({ x: Arcade.rand(r, W - r), y: -r, r, vy: Arcade.rand(90, 200) + score, vx: Arcade.rand(-40, 40), hp: r > 36 ? 2 : 1, rot: 0 }); spawn = Arcade.rand(0.4, 0.9) * Math.max(0.4, 1 - score / 1500); }
    rocks.forEach(r => { r.y += r.vy * dt; r.x += r.vx * dt; r.rot += dt; });
    rocks.forEach(r => {
      shots.forEach(s => { if (!s.dead && Math.hypot(s.x - r.x, s.y - r.y) < r.r) { s.dead = true; r.hp--; if (r.hp <= 0) { r.dead = true; score += 10; boom(r.x, r.y, '#ffb74d'); Arcade.sfx.point(); } } });
      if (!r.dead && inv <= 0 && Math.hypot(ship.x - r.x, ship.y - r.y) < r.r + 22) {
        r.dead = true; lives--; inv = 1.5; boom(ship.x, ship.y, '#4fc3f7'); Arcade.sfx.hit();
        if (lives <= 0) { state = 'over'; Arcade.best('blaster', score); Arcade.sfx.lose(); }
      }
    });
    shots = shots.filter(s => !s.dead);
    rocks = rocks.filter(r => !r.dead && r.y < H + 60);
  }

  reset();
  state = 'ready';
  Arcade.loop(dt => {
    if (state === 'play') update(dt);
    sparks.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; });
    sparks = sparks.filter(s => s.life > 0);
    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, W, H);
    stars.forEach(s => { s.y += s.s * 60 * dt; if (s.y > H) s.y = 0; ctx.fillStyle = `rgba(255,255,255,${s.s / 3})`; ctx.fillRect(s.x, s.y, s.s, s.s); });
    rocks.forEach(r => {
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot);
      ctx.fillStyle = r.hp > 1 ? '#8d6e63' : '#a1887f';
      ctx.beginPath();
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = r.r * (0.8 + ((i * 37) % 7) / 25); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.fill(); ctx.restore();
    });
    ctx.fillStyle = '#ffeb3b';
    shots.forEach(s => ctx.fillRect(s.x - 3, s.y - 12, 6, 18));
    if (state !== 'over' && (inv <= 0 || Math.floor(inv * 10) % 2)) {
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath(); ctx.moveTo(ship.x, ship.y - 34); ctx.lineTo(ship.x + 26, ship.y + 24); ctx.lineTo(ship.x, ship.y + 12); ctx.lineTo(ship.x - 26, ship.y + 24); ctx.fill();
      ctx.fillStyle = '#ff7043';
      ctx.beginPath(); ctx.moveTo(ship.x - 8, ship.y + 16); ctx.lineTo(ship.x, ship.y + 30 + Math.random() * 14); ctx.lineTo(ship.x + 8, ship.y + 16); ctx.fill();
    }
    sparks.forEach(s => { ctx.fillStyle = s.color; ctx.globalAlpha = Math.max(0, s.life / 0.6); ctx.fillRect(s.x, s.y, 4, 4); });
    ctx.globalAlpha = 1;
    Arcade.text(ctx, `Score ${score}`, 20, 30, 28, '#fff', 'left');
    Arcade.text(ctx, '🚀'.repeat(Math.max(0, lives)), W - 20, 30, 26, '#fff', 'right');
    if (state === 'ready') Arcade.panel(stage, 'Space Blaster', ['Arrows/WASD to fly, space to fire', 'On touch: drag to fly and auto-fire', 'Press space or tap to start']);
    if (state === 'over') Arcade.panel(stage, 'Ship destroyed!', ['Score: ' + score + '   Best: ' + Arcade.best('blaster'), 'Press space or tap to fly again']);
  });
})();

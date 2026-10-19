/* Saltador: suba pelas plataformas. ←/→ (ou inclinar com toque nas laterais). */
(function () {
  const W = 600, H = 960;
  const stage = Arcade.createStage(W, H, '#81d4fa');
  const { ctx } = stage;
  let p, plats, camY, best, state, dirTouch = 0;

  function reset() {
    p = { x: W / 2, y: H - 120, vx: 0, vy: -900 };
    plats = [{ x: W / 2 - 60, y: H - 60, w: 120, kind: 'n' }];
    for (let i = 1; i < 14; i++) addPlat(H - 60 - i * 75);
    camY = 0; best = 0; state = 'play';
  }
  function addPlat(y) { plats.push({ x: Arcade.rand(10, W - 130), y, w: 110, kind: Math.random() < 0.15 ? 'm' : 'n', dx: Arcade.rand(60, 120) * (Math.random() < 0.5 ? -1 : 1) }); }
  stage.canvas.addEventListener('pointerdown', e => { if (state !== 'play') { reset(); return; } dirTouch = stage.toLocal(e).x < W / 2 ? -1 : 1; });
  stage.canvas.addEventListener('pointerup', () => { dirTouch = 0; });
  Arcade.onKey(k => { if (k === ' ' && state !== 'play') reset(); });

  reset();
  state = 'ready';
  Arcade.loop(dt => {
    if (state === 'play') {
      const dir = (Arcade.keys.ArrowLeft || Arcade.keys.a ? -1 : 0) + (Arcade.keys.ArrowRight || Arcade.keys.d ? 1 : 0) + dirTouch;
      p.vx += (dir * 420 - p.vx) * Math.min(1, dt * 8);
      p.vy += 1700 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      plats.forEach(pl => {
        if (pl.kind === 'm') { pl.x += pl.dx * dt; if (pl.x < 0 || pl.x + pl.w > W) pl.dx *= -1; }
        if (p.vy > 0 && p.x > pl.x - 10 && p.x < pl.x + pl.w + 10 && p.y + 24 > pl.y && p.y + 24 < pl.y + 22) { p.vy = -900; Arcade.beep(520, 0.06, 'square', 0.08, 900); }
      });
      const target = Math.min(camY, p.y - H * 0.45);
      camY = target;
      best = Math.max(best, Math.floor((H - 120 - p.y) / 10));
      plats = plats.filter(pl => pl.y < camY + H + 40);
      while (plats.length < 14) addPlat(Math.min(...plats.map(x => x.y)) - Arcade.rand(60, 95));
      if (p.y - camY > H + 60) { state = 'over'; Arcade.best('jumper', best); Arcade.sfx.lose(); }
    }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#4fc3f7'); g.addColorStop(1, '#e1f5fe');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(0, -camY);
    plats.forEach(pl => { ctx.fillStyle = pl.kind === 'm' ? '#ab47bc' : '#43a047'; ctx.beginPath(); ctx.roundRect(pl.x, pl.y, pl.w, 18, 9); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(pl.x + 10, pl.y + 3, pl.w - 20, 4); });
    ctx.fillStyle = '#ff7043';
    ctx.beginPath(); ctx.roundRect(p.x - 20, p.y - 24, 40, 48, 14); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(p.x - 8 + Math.sign(p.vx) * 4, p.y - 8, 7, 0, 7); ctx.arc(p.x + 8 + Math.sign(p.vx) * 4, p.y - 8, 7, 0, 7); ctx.fill();
    ctx.fillStyle = '#212121';
    ctx.beginPath(); ctx.arc(p.x - 8 + Math.sign(p.vx) * 6, p.y - 8, 3, 0, 7); ctx.arc(p.x + 8 + Math.sign(p.vx) * 6, p.y - 8, 3, 0, 7); ctx.fill();
    ctx.restore();
    Arcade.text(ctx, `Height ${best}   Best ${Arcade.best('jumper')}`, W / 2, 34, 28, '#0d47a1');
    if (state === 'ready') Arcade.panel(stage, 'Pixel Jumper', ['← / → or hold left/right side', 'Bounce up as high as you can!', 'Tap or press space to start']);
    if (state === 'over') Arcade.panel(stage, 'You fell!', [`Height: ${best}`, 'Tap or press space to jump again']);
  });
})();

/* Torre de hambúrguer: a peça balança; clique/espaço para soltar. Partes que sobram caem. */
(function () {
  const W = 720, H = 960;
  const stage = Arcade.createStage(W, H, '#ffe0b2');
  const { ctx } = stage;
  const LAYERS = [
    { c: '#a1887f', h: 34, name: 'patty' }, { c: '#ffca28', h: 18, name: 'cheese' }, { c: '#66bb6a', h: 16, name: 'lettuce' },
    { c: '#e53935', h: 18, name: 'tomato' }, { c: '#6d4c41', h: 30, name: 'patty' }, { c: '#fff176', h: 14, name: 'onion' },
  ];
  let stack, cur, falling, score, state, camY;

  function reset() {
    stack = [{ x: W / 2 - 140, w: 280, h: 40, c: '#f6a94b', bun: true }];
    falling = [];
    score = 0;
    camY = 0;
    nextPiece();
    state = 'play';
  }
  function topY() { return H - 120 - stack.reduce((s, p) => s + p.h, 0); }
  function nextPiece() {
    const L = LAYERS[stack.length % LAYERS.length];
    const w = stack[stack.length - 1].w;
    cur = { x: 0, w, h: L.h, c: L.c, dir: 1, speed: 260 + score * 12 };
  }
  function dropPiece() {
    if (state !== 'play') { reset(); return; }
    const below = stack[stack.length - 1];
    const left = Math.max(cur.x, below.x), right = Math.min(cur.x + cur.w, below.x + below.w);
    if (right - left <= 4) {
      falling.push({ ...cur, y: topY() - cur.h, vy: 0 });
      state = 'over';
      Arcade.best('burger', score);
      Arcade.sfx.lose();
      return;
    }
    if (cur.x < left) falling.push({ x: cur.x, w: left - cur.x, h: cur.h, c: cur.c, y: topY() - cur.h, vy: 0 });
    if (cur.x + cur.w > right) falling.push({ x: right, w: cur.x + cur.w - right, h: cur.h, c: cur.c, y: topY() - cur.h, vy: 0 });
    const perfect = Math.abs(cur.x - below.x) < 6;
    stack.push({ x: perfect ? below.x : left, w: perfect ? below.w : right - left, h: cur.h, c: cur.c });
    score++;
    perfect ? Arcade.sfx.win() : Arcade.sfx.point();
    nextPiece();
  }
  stage.canvas.addEventListener('pointerdown', dropPiece);
  Arcade.onKey(k => { if (k === ' ' || k === 'Enter') dropPiece(); });

  function bun(x, y, w, h, top) {
    ctx.fillStyle = '#f6a94b';
    ctx.beginPath();
    if (top) ctx.roundRect(x, y, w, h, [h, h, 8, 8]); else ctx.roundRect(x, y, w, h, [6, 6, 14, 14]);
    ctx.fill();
    if (top) { ctx.fillStyle = '#fff8e1'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x + w * (0.2 + i * 0.15), y + h * 0.35, 5, 3, 0.4, 0, 7); ctx.fill(); } }
  }

  reset();
  state = 'ready';
  Arcade.loop(dt => {
    if (state === 'play') {
      cur.x += cur.dir * cur.speed * dt;
      if (cur.x < -cur.w * 0.3) { cur.x = -cur.w * 0.3; cur.dir = 1; }
      if (cur.x + cur.w > W + cur.w * 0.3) { cur.x = W + cur.w * 0.3 - cur.w; cur.dir = -1; }
    }
    falling.forEach(f => { f.vy += 1400 * dt; f.y += f.vy * dt; });
    falling = falling.filter(f => f.y < H + 200);
    const target = Math.max(0, H * 0.45 - topY());
    camY += (target - camY) * Math.min(1, dt * 5);
    ctx.fillStyle = '#ffe0b2';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(0, camY);
    ctx.fillStyle = '#eceff1';
    ctx.beginPath(); ctx.ellipse(W / 2, H - 70, 260, 34, 0, 0, 7); ctx.fill();
    let y = H - 120;
    stack.forEach(p => {
      y -= p.h;
      if (p.bun) bun(p.x, y, p.w, p.h, false);
      else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.roundRect(p.x - 4, y, p.w + 8, p.h, 8); ctx.fill(); }
    });
    if (state === 'play') { ctx.fillStyle = cur.c; ctx.beginPath(); ctx.roundRect(cur.x - 4, y - cur.h - 60, cur.w + 8, cur.h, 8); ctx.fill(); }
    if (state === 'over') bun(stack[stack.length - 1].x - 6, y - 50, stack[stack.length - 1].w + 12, 50, true);
    falling.forEach(f => { ctx.fillStyle = f.c; ctx.beginPath(); ctx.roundRect(f.x, f.y, f.w, f.h, 8); ctx.fill(); });
    ctx.restore();
    Arcade.text(ctx, 'Burger Stack', W / 2, 60, 52, '#d84315');
    Arcade.text(ctx, `Layers ${score}   Best ${Arcade.best('burger')}`, W / 2, 120, 30, '#5d4037');
    if (state === 'ready') Arcade.panel(stage, 'Burger Stack', ['Tap or press space to drop each layer', 'Line them up to build the tallest burger!']);
    if (state === 'over') Arcade.panel(stage, 'Order up!', [`Your burger has ${score} layers`, 'Tap to cook another']);
  });
})();

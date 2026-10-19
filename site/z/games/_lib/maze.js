/* Labirinto do tesouro: pegue as moedas e chegue ao baú. Labirinto novo a cada nível. */
(function () {
  const W = 720, H = 960;
  const stage = Arcade.createStage(W, H, '#3e2723');
  const { ctx } = stage;
  let N, cell, maze, player, coins, level = Arcade.config.startLevel || 1, collected, state, ox, oy;

  function build() {
    N = Math.min(21, 7 + level * 2);
    cell = Math.floor(660 / N);
    ox = (W - N * cell) / 2;
    oy = 180;
    maze = Array.from({ length: N }, () => Array.from({ length: N }, () => ({ n: true, s: true, e: true, w: true, v: false })));
    const stack = [[0, 0]];
    maze[0][0].v = true;
    const D = { n: [0, -1, 's'], s: [0, 1, 'n'], e: [1, 0, 'w'], w: [-1, 0, 'e'] };
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const opts = Object.entries(D).filter(([, [dx, dy]]) => maze[y + dy] && maze[y + dy][x + dx] && !maze[y + dy][x + dx].v);
      if (!opts.length) { stack.pop(); continue; }
      const [dir, [dx, dy, opp]] = opts[Arcade.randInt(0, opts.length - 1)];
      maze[y][x][dir] = false;
      maze[y + dy][x + dx][opp] = false;
      maze[y + dy][x + dx].v = true;
      stack.push([x + dx, y + dy]);
    }
    player = { x: 0, y: 0 };
    coins = [];
    while (coins.length < 3 + level) {
      const c = { x: Arcade.randInt(1, N - 1), y: Arcade.randInt(1, N - 1) };
      if (!coins.some(k => k.x === c.x && k.y === c.y) && !(c.x === N - 1 && c.y === N - 1)) coins.push(c);
    }
    collected = 0;
    state = 'play';
  }
  function go(dir) {
    if (state === 'won') { level++; build(); return; }
    const m = { up: ['n', 0, -1], down: ['s', 0, 1], left: ['w', -1, 0], right: ['e', 1, 0] }[dir];
    if (maze[player.y][player.x][m[0]]) { Arcade.beep(120, 0.04, 'triangle'); return; }
    player.x += m[1]; player.y += m[2];
    Arcade.beep(300, 0.02);
    const k = coins.findIndex(c => c.x === player.x && c.y === player.y);
    if (k >= 0) { coins.splice(k, 1); collected++; Arcade.sfx.point(); }
    if (player.x === N - 1 && player.y === N - 1 && !coins.length) { state = 'won'; Arcade.sfx.win(); }
  }
  Arcade.onKey(k => { const m = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }; if (m[k]) go(m[k]); });
  Arcade.onSwipe(go);
  stage.canvas.addEventListener('pointerdown', e => {
    if (state === 'won') { go('up'); return; }
    const p = stage.toLocal(e);
    if (p.y > 860) go(p.x < W / 3 ? 'left' : p.x > 2 * W / 3 ? 'right' : 'down');
    else if (p.y > 820 && p.x > W / 3 && p.x < 2 * W / 3) go('up');
  });

  build();
  Arcade.loop(() => {
    ctx.fillStyle = '#3e2723'; ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, 'Treasure Maze', W / 2, 60, 52, '#ffd54f');
    Arcade.text(ctx, `Level ${level}   Coins ${collected}/${collected + coins.length}${coins.length ? '' : '  → chest!'}`, W / 2, 125, 28);
    ctx.fillStyle = '#d7ccc8'; ctx.fillRect(ox, oy, N * cell, N * cell);
    ctx.strokeStyle = '#4e342e'; ctx.lineWidth = Math.max(3, cell / 8); ctx.lineCap = 'round';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const c = maze[y][x], X = ox + x * cell, Y = oy + y * cell;
      ctx.beginPath();
      if (c.n) { ctx.moveTo(X, Y); ctx.lineTo(X + cell, Y); }
      if (c.w) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + cell); }
      if (y === N - 1 && c.s) { ctx.moveTo(X, Y + cell); ctx.lineTo(X + cell, Y + cell); }
      if (x === N - 1 && c.e) { ctx.moveTo(X + cell, Y); ctx.lineTo(X + cell, Y + cell); }
      ctx.stroke();
    }
    ctx.font = `${Math.floor(cell * 0.7)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    coins.forEach(c => ctx.fillText('🪙', ox + c.x * cell + cell / 2, oy + c.y * cell + cell / 2));
    ctx.fillText(coins.length ? '🔒' : '🧰', ox + (N - 1) * cell + cell / 2, oy + (N - 1) * cell + cell / 2);
    ctx.fillText('🧭', ox + player.x * cell + cell / 2, oy + player.y * cell + cell / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    [['◀', W / 6, 900], ['▲', W / 2, 850], ['▼', W / 2, 910], ['▶', 5 * W / 6, 900]].forEach(([t, x, y]) => Arcade.text(ctx, t, x, y, 44, 'rgba(255,255,255,0.6)'));
    if (state === 'won') Arcade.panel(stage, 'Treasure found!', [`Level ${level} complete`, 'Tap or press an arrow for the next maze']);
  });
})();

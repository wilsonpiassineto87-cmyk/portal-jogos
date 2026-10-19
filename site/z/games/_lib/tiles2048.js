/* 2048: setas/WASD ou deslizar. */
(function () {
  const N = 4, W = 720, H = 960, BOARD = 640, GAP = 16;
  const stage = Arcade.createStage(W, H, '#3e2723');
  const { ctx } = stage;
  const bx = (W - BOARD) / 2, by = 260, cs = (BOARD - GAP * (N + 1)) / N;
  const COLORS = { 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e' };
  let grid, score, over, won, keepGoing;

  function reset() { grid = Array.from({ length: N }, () => Array(N).fill(0)); score = 0; over = false; won = false; keepGoing = false; add(); add(); }
  function add() {
    const free = [];
    grid.forEach((row, r) => row.forEach((v, c) => { if (!v) free.push([r, c]); }));
    if (!free.length) return;
    const [r, c] = free[Arcade.randInt(0, free.length - 1)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  function slide(row) {
    const vals = row.filter(Boolean);
    for (let i = 0; i < vals.length - 1; i++) {
      if (vals[i] === vals[i + 1]) { vals[i] *= 2; score += vals[i]; if (vals[i] === 2048 && !keepGoing) won = true; vals.splice(i + 1, 1); }
    }
    while (vals.length < N) vals.push(0);
    return vals;
  }
  function move(dir) {
    if (over) { reset(); return; }
    if (won && !keepGoing) { keepGoing = true; won = false; return; }
    const before = JSON.stringify(grid);
    const rot = g => g[0].map((_, c) => g.map(r => r[c]));
    let g = grid.map(r => r.slice());
    if (dir === 'up' || dir === 'down') g = rot(g);
    g = g.map(r => (dir === 'right' || dir === 'down' ? slide(r.slice().reverse()).reverse() : slide(r)));
    if (dir === 'up' || dir === 'down') g = rot(g);
    grid = g;
    if (JSON.stringify(grid) !== before) { add(); Arcade.sfx.click(); }
    const canMove = grid.some((row, r) => row.some((v, c) => !v || (row[c + 1] === v) || (grid[r + 1] && grid[r + 1][c] === v)));
    if (!canMove) { over = true; Arcade.best('2048', score); Arcade.sfx.lose(); }
  }
  Arcade.onKey(k => {
    const m = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
    if (m[k]) move(m[k]);
  });
  Arcade.onSwipe(move);
  stage.canvas.addEventListener('pointerdown', () => { if (over) reset(); else if (won && !keepGoing) { keepGoing = true; won = false; } });

  reset();
  Arcade.loop(() => {
    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, '2048', 140, 90, 90, '#776e65');
    ctx.fillStyle = '#bbada0';
    ctx.beginPath(); ctx.roundRect(330, 50, 160, 90, 12); ctx.roundRect(510, 50, 160, 90, 12); ctx.fill();
    Arcade.text(ctx, 'SCORE', 410, 75, 22, '#eee4da');
    Arcade.text(ctx, String(score), 410, 112, 34);
    Arcade.text(ctx, 'BEST', 590, 75, 22, '#eee4da');
    Arcade.text(ctx, String(Math.max(score, Arcade.best('2048'))), 590, 112, 34);
    Arcade.text(ctx, 'Join the tiles, get to 2048!', W / 2, 200, 28, '#776e65');
    ctx.fillStyle = '#bbada0';
    ctx.beginPath(); ctx.roundRect(bx, by, BOARD, BOARD, 16); ctx.fill();
    grid.forEach((row, r) => row.forEach((v, c) => {
      const x = bx + GAP + c * (cs + GAP), y = by + GAP + r * (cs + GAP);
      ctx.fillStyle = v ? (COLORS[v] || '#3c3a32') : 'rgba(238,228,218,0.35)';
      ctx.beginPath(); ctx.roundRect(x, y, cs, cs, 10); ctx.fill();
      if (v) {
        ctx.font = `700 ${v < 100 ? 64 : v < 1000 ? 54 : 42}px Fredoka, Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = v <= 4 ? '#776e65' : '#f9f6f2';
        ctx.fillText(String(v), x + cs / 2, y + cs / 2 + 4);
      }
    }));
    if (over) Arcade.panel(stage, 'Game over!', ['Score: ' + score, 'Tap or press an arrow to try again']);
    if (won && !keepGoing) Arcade.panel(stage, 'You win!', ['You made 2048!', 'Tap to keep going']);
  });
})();

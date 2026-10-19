/* Lig 4: 1 jogador (computador simples) ou 2 jogadores. */
(function () {
  const COLS = 7, ROWS = 6, CELL = 100;
  const W = COLS * CELL + 40, H = ROWS * CELL + 260;
  const stage = Arcade.createStage(W, H, '#1a237e');
  const { ctx } = stage;
  const ox = 20, oy = 200;
  let grid, turn, mode, winner, drops, hover = 3;

  function reset() { grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); turn = 1; winner = 0; drops = []; }
  function lowest(g, c) { for (let r = ROWS - 1; r >= 0; r--) if (!g[r][c]) return r; return -1; }
  function wins(g, p) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) for (const [dr, dc] of dirs) {
      let k = 0;
      while (k < 4 && g[r + dr * k] && g[r + dr * k][c + dc * k] === p) k++;
      if (k === 4) return true;
    }
    return false;
  }
  function drop(c) {
    const r = lowest(grid, c);
    if (r < 0 || winner) return false;
    grid[r][c] = turn;
    drops.push({ r, c, y: -1 });
    Arcade.sfx.click();
    if (wins(grid, turn)) { winner = turn; Arcade.sfx.win(); }
    else if (grid[0].every(Boolean)) { winner = 3; Arcade.sfx.hit(); }
    else turn = 3 - turn;
    return true;
  }
  function aiMove() {
    const free = [...Array(COLS).keys()].filter(c => lowest(grid, c) >= 0);
    for (const p of [2, 1]) for (const c of free) {
      const g = grid.map(r => r.slice());
      g[lowest(g, c)][c] = p;
      if (wins(g, p)) return c;
    }
    const center = free.filter(c => c >= 2 && c <= 4);
    const pool = center.length && Math.random() < 0.7 ? center : free;
    return pool[Arcade.randInt(0, pool.length - 1)];
  }

  stage.canvas.addEventListener('pointermove', e => { hover = Arcade.clamp(Math.floor((stage.toLocal(e).x - ox) / CELL), 0, COLS - 1); });
  stage.canvas.addEventListener('pointerdown', e => {
    const p = stage.toLocal(e);
    if (!mode) {
      if (p.y > 330 && p.y < 430) { mode = 1; reset(); }
      if (p.y > 470 && p.y < 570) { mode = 2; reset(); }
      return;
    }
    if (winner) { reset(); return; }
    if (mode === 1 && turn === 2) return;
    const c = Math.floor((p.x - ox) / CELL);
    if (c >= 0 && c < COLS && drop(c) && mode === 1 && !winner) setTimeout(() => drop(aiMove()), 450);
  });

  const colors = { 1: '#ffd23f', 2: '#ff3d71' };
  Arcade.loop(dt => {
    ctx.fillStyle = '#1a237e';
    ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, 'Connect Four Duel', W / 2, 50, 48, '#ffd23f');
    if (!mode) {
      [['1 Player vs Computer', 380], ['2 Players', 520]].forEach(([t, y]) => {
        ctx.fillStyle = '#ff9800';
        ctx.beginPath(); ctx.roundRect(W / 2 - 250, y - 50, 500, 100, 24); ctx.fill();
        Arcade.text(ctx, t, W / 2, y, 34);
      });
      return;
    }
    const status = winner === 3 ? "It's a draw! Tap to restart" : winner ? (winner === 1 ? 'Yellow' : 'Red') + ' wins! Tap to restart'
      : (mode === 1 && turn === 2 ? 'Computer is thinking...' : (turn === 1 ? 'Yellow' : 'Red') + "'s turn");
    Arcade.text(ctx, status, W / 2, 110, 30, '#b3e5fc');
    if (!winner) {
      ctx.fillStyle = colors[turn];
      ctx.beginPath(); ctx.arc(ox + hover * CELL + CELL / 2, 160, 36, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#1565c0';
    ctx.beginPath(); ctx.roundRect(ox, oy, COLS * CELL, ROWS * CELL, 20); ctx.fill();
    drops.forEach(d => { d.y = Math.min(d.r, d.y + dt * 14); });
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const d = drops.find(x => x.r === r && x.c === c);
      ctx.fillStyle = '#0d1b4d';
      ctx.beginPath(); ctx.arc(ox + c * CELL + CELL / 2, oy + r * CELL + CELL / 2, 40, 0, 7); ctx.fill();
      if (grid[r][c] && d) {
        ctx.fillStyle = colors[grid[r][c]];
        ctx.beginPath(); ctx.arc(ox + c * CELL + CELL / 2, oy + d.y * CELL + CELL / 2, 40, 0, 7); ctx.fill();
      }
    }
  });
})();

/* Campo minado 9×12, 18 minas. Clique abre; clique direito ou toque longo marca bandeira. */
(function () {
  const COLS = 9, ROWS = 12, MINES = 18, CELL = 76;
  const W = COLS * CELL + 40, H = ROWS * CELL + 180;
  const stage = Arcade.createStage(W, H, '#263238');
  const { ctx } = stage;
  const ox = 20, oy = 150;
  let grid, state, firstClick, flags, startTime, endTime, pressTimer;

  function reset() {
    grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ mine: false, open: false, flag: false, n: 0 })));
    state = 'play'; firstClick = true; flags = 0; startTime = null; endTime = null;
  }
  function neighbours(r, c) {
    const out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if ((dr || dc) && grid[r + dr] && grid[r + dr][c + dc]) out.push([r + dr, c + dc]);
    }
    return out;
  }
  function plant(sr, sc) {
    let n = 0;
    while (n < MINES) {
      const r = Arcade.randInt(0, ROWS - 1), c = Arcade.randInt(0, COLS - 1);
      if (grid[r][c].mine || (Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1)) continue;
      grid[r][c].mine = true; n++;
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c].n = neighbours(r, c).filter(([a, b]) => grid[a][b].mine).length;
  }
  function open(r, c) {
    const cell = grid[r][c];
    if (cell.open || cell.flag) return;
    cell.open = true;
    if (cell.mine) { state = 'lost'; endTime = performance.now(); Arcade.sfx.lose(); grid.forEach(row => row.forEach(x => { if (x.mine) x.open = true; })); return; }
    if (cell.n === 0) neighbours(r, c).forEach(([a, b]) => open(a, b));
  }
  function cellAt(e) {
    const p = stage.toLocal(e);
    const c = Math.floor((p.x - ox) / CELL), r = Math.floor((p.y - oy) / CELL);
    return r >= 0 && r < ROWS && c >= 0 && c < COLS ? [r, c] : null;
  }
  function toggleFlag(r, c) {
    const cell = grid[r][c];
    if (cell.open) return;
    cell.flag = !cell.flag;
    flags += cell.flag ? 1 : -1;
    Arcade.sfx.click();
  }
  function reveal(r, c) {
    if (firstClick) { plant(r, c); firstClick = false; startTime = performance.now(); }
    open(r, c);
    Arcade.beep(520, 0.03);
    const closedSafe = grid.flat().filter(x => !x.mine && !x.open).length;
    if (state === 'play' && closedSafe === 0) { state = 'won'; endTime = performance.now(); Arcade.sfx.win(); }
  }

  stage.canvas.addEventListener('contextmenu', e => e.preventDefault());
  stage.canvas.addEventListener('pointerdown', e => {
    if (state !== 'play') { reset(); return; }
    const rc = cellAt(e);
    if (!rc) return;
    if (e.button === 2) { toggleFlag(...rc); return; }
    if (e.pointerType === 'touch') {
      pressTimer = setTimeout(() => { pressTimer = null; toggleFlag(...rc); }, 400);
      return;
    }
    reveal(...rc);
  });
  stage.canvas.addEventListener('pointerup', e => {
    if (e.pointerType === 'touch' && pressTimer) { clearTimeout(pressTimer); pressTimer = null; const rc = cellAt(e); if (rc) reveal(...rc); }
  });

  const numColors = ['', '#1e88e5', '#43a047', '#e53935', '#5e35b1', '#8d6e63', '#00838f', '#212121', '#757575'];
  reset();
  Arcade.loop(() => {
    ctx.fillStyle = '#263238';
    ctx.fillRect(0, 0, W, H);
    const secs = startTime ? Math.floor(((endTime || performance.now()) - startTime) / 1000) : 0;
    Arcade.text(ctx, 'Mine Sweeper', W / 2, 45, 48, '#ffd23f');
    Arcade.text(ctx, `💣 ${MINES - flags}     ⏱ ${secs}s`, W / 2, 105, 32);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c], x = ox + c * CELL, y = oy + r * CELL;
      ctx.fillStyle = cell.open ? (cell.mine ? '#e53935' : '#cfd8dc') : ((r + c) % 2 ? '#7cb342' : '#8bc34a');
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      if (cell.open && cell.mine) Arcade.text(ctx, '💣', x + CELL / 2, y + CELL / 2, 40);
      else if (cell.open && cell.n) Arcade.text(ctx, String(cell.n), x + CELL / 2, y + CELL / 2, 40, numColors[cell.n]);
      else if (cell.flag) Arcade.text(ctx, '🚩', x + CELL / 2, y + CELL / 2, 40);
    }
    if (state === 'won') Arcade.panel(stage, 'Cleared!', [`Time: ${secs}s`, 'Tap to play again']);
    if (state === 'lost') Arcade.panel(stage, 'Boom!', ['Tap to try again']);
  });
})();

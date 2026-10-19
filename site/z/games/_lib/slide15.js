/* Quebra-cabeça de 15 peças deslizantes. */
(function () {
  const N = 4, W = 720, H = 960, BOARD = 640;
  const stage = Arcade.createStage(W, H, '#004d40');
  const { ctx } = stage;
  const bx = (W - BOARD) / 2, by = 240, cs = BOARD / N;
  let tiles, moves, solved, anim = {};

  function solvable(a) {
    let inv = 0;
    const flat = a.filter(Boolean);
    for (let i = 0; i < flat.length; i++) for (let j = i + 1; j < flat.length; j++) if (flat[i] > flat[j]) inv++;
    const blankRowFromBottom = N - Math.floor(a.indexOf(0) / N);
    return (inv + blankRowFromBottom) % 2 === 1;
  }
  function reset() {
    do { tiles = [...Array(16).keys()].sort(() => Math.random() - 0.5); } while (!solvable(tiles) || isSolved());
    moves = 0; solved = false;
  }
  function isSolved() { return tiles.every((v, i) => v === (i + 1) % 16); }
  function tryMove(i) {
    const z = tiles.indexOf(0);
    const ok = (Math.abs(i - z) === 1 && Math.floor(i / N) === Math.floor(z / N)) || Math.abs(i - z) === N;
    if (!ok) return;
    anim[tiles[i]] = { from: i, t: 0 };
    [tiles[i], tiles[z]] = [tiles[z], tiles[i]];
    moves++;
    Arcade.sfx.click();
    if (isSolved()) { solved = true; Arcade.sfx.win(); }
  }
  stage.canvas.addEventListener('pointerdown', e => {
    if (solved) { reset(); return; }
    const p = stage.toLocal(e);
    const c = Math.floor((p.x - bx) / cs), r = Math.floor((p.y - by) / cs);
    if (c >= 0 && c < N && r >= 0 && r < N) tryMove(r * N + c);
  });
  Arcade.onKey(k => {
    const z = tiles.indexOf(0), zr = Math.floor(z / N), zc = z % N;
    if (k === 'ArrowLeft' && zc < N - 1) tryMove(z + 1);
    if (k === 'ArrowRight' && zc > 0) tryMove(z - 1);
    if (k === 'ArrowUp' && zr < N - 1) tryMove(z + N);
    if (k === 'ArrowDown' && zr > 0) tryMove(z - N);
  });

  reset();
  Arcade.loop(dt => {
    ctx.fillStyle = '#004d40';
    ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, 'Slide Puzzle 15', W / 2, 80, 56, '#ffd23f');
    Arcade.text(ctx, 'Order the tiles from 1 to 15   •   Moves ' + moves, W / 2, 160, 28);
    ctx.fillStyle = '#00332c';
    ctx.beginPath(); ctx.roundRect(bx - 10, by - 10, BOARD + 20, BOARD + 20, 18); ctx.fill();
    tiles.forEach((v, i) => {
      if (!v) return;
      let x = bx + (i % N) * cs, y = by + Math.floor(i / N) * cs;
      const a = anim[v];
      if (a) {
        a.t = Math.min(1, a.t + dt * 9);
        const fx = bx + (a.from % N) * cs, fy = by + Math.floor(a.from / N) * cs;
        x = fx + (x - fx) * a.t; y = fy + (y - fy) * a.t;
        if (a.t >= 1) delete anim[v];
      }
      const correct = v === i + 1;
      ctx.fillStyle = correct ? '#ffb300' : '#ff7043';
      ctx.beginPath(); ctx.roundRect(x + 6, y + 6, cs - 12, cs - 12, 16); ctx.fill();
      Arcade.text(ctx, String(v), x + cs / 2, y + cs / 2 + 4, 64);
    });
    if (solved) Arcade.panel(stage, 'Solved!', [`${moves} moves`, 'Tap to shuffle again']);
  });
})();

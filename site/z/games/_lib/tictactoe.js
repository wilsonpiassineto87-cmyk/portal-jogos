/* Jogo da velha: 1 jogador (contra o computador) ou 2 jogadores no mesmo aparelho. */
(function () {
  const W = 720, H = 960;
  const stage = Arcade.createStage(W, H, '#0d47a1');
  const { ctx } = stage;
  const size = 600, ox = 60, oy = 220, cell = size / 3;
  let board, turn, mode, winner, line, scores = { X: 0, O: 0, draw: 0 };
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

  function reset() { board = Array(9).fill(''); turn = 'X'; winner = null; line = null; }
  function check(b) {
    for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return { w: b[l[0]], l };
    return b.every(Boolean) ? { w: 'draw' } : null;
  }
  function minimax(b, player) {
    const r = check(b);
    if (r) return { score: r.w === 'O' ? 1 : r.w === 'X' ? -1 : 0 };
    let best = { score: player === 'O' ? -2 : 2 };
    b.forEach((v, i) => {
      if (v) return;
      b[i] = player;
      const s = minimax(b, player === 'O' ? 'X' : 'O').score;
      b[i] = '';
      if ((player === 'O' && s > best.score) || (player === 'X' && s < best.score)) best = { score: s, i };
    });
    return best;
  }
  function play(i) {
    if (board[i] || winner) return;
    board[i] = turn;
    Arcade.sfx.click();
    const r = check(board);
    if (r) {
      winner = r.w;
      line = r.l || null;
      scores[winner]++;
      if (winner === 'draw') Arcade.sfx.hit(); else Arcade.sfx.win();
      return;
    }
    turn = turn === 'X' ? 'O' : 'X';
    if (mode === 1 && turn === 'O') {
      setTimeout(() => {
        // Às vezes joga ao acaso para ser vencível.
        const free = board.map((v, k) => (v ? -1 : k)).filter(k => k >= 0);
        const move = Math.random() < 0.2 ? free[Arcade.randInt(0, free.length - 1)] : minimax(board.slice(), 'O').i;
        play(move);
      }, 400);
    }
  }

  stage.canvas.addEventListener('pointerdown', e => {
    const p = stage.toLocal(e);
    if (!mode) {
      if (p.y > 420 && p.y < 520) { mode = 1; reset(); }
      if (p.y > 560 && p.y < 660) { mode = 2; reset(); }
      return;
    }
    if (winner) { reset(); return; }
    if (mode === 1 && turn === 'O') return;
    const c = Math.floor((p.x - ox) / cell), r = Math.floor((p.y - oy) / cell);
    if (c >= 0 && c < 3 && r >= 0 && r < 3) play(r * 3 + c);
  });

  function drawMark(m, cx, cy) {
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    if (m === 'X') {
      ctx.strokeStyle = '#ffd23f';
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 60); ctx.lineTo(cx + 60, cy + 60);
      ctx.moveTo(cx + 60, cy - 60); ctx.lineTo(cx - 60, cy + 60);
      ctx.stroke();
    } else if (m === 'O') {
      ctx.strokeStyle = '#ff5c8a';
      ctx.beginPath();
      ctx.arc(cx, cy, 62, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  Arcade.loop(() => {
    ctx.fillStyle = '#0d47a1';
    ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, 'Tic Tac Toe Duel', W / 2, 60, 52, '#ffd23f');
    if (!mode) {
      Arcade.text(ctx, 'Choose a mode', W / 2, 330, 40);
      [['1 Player vs Computer', 470], ['2 Players', 610]].forEach(([t, y]) => {
        ctx.fillStyle = '#ff9800';
        ctx.beginPath(); ctx.roundRect(110, y - 50, 500, 100, 24); ctx.fill();
        Arcade.text(ctx, t, W / 2, y, 36);
      });
      return;
    }
    Arcade.text(ctx, `X ${scores.X}   Draws ${scores.draw}   O ${scores.O}`, W / 2, 130, 32);
    Arcade.text(ctx, winner ? (winner === 'draw' ? "It's a draw!" : winner + ' wins!') : (mode === 1 && turn === 'O' ? 'Computer is thinking...' : turn + "'s turn"), W / 2, 180, 32, '#b3e5fc');
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(ox + i * cell, oy + 10); ctx.lineTo(ox + i * cell, oy + size - 10);
      ctx.moveTo(ox + 10, oy + i * cell); ctx.lineTo(ox + size - 10, oy + i * cell);
      ctx.stroke();
    }
    board.forEach((m, i) => drawMark(m, ox + (i % 3) * cell + cell / 2, oy + Math.floor(i / 3) * cell + cell / 2));
    if (line) {
      const a = line[0], b = line[2];
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(ox + (a % 3) * cell + cell / 2, oy + Math.floor(a / 3) * cell + cell / 2);
      ctx.lineTo(ox + (b % 3) * cell + cell / 2, oy + Math.floor(b / 3) * cell + cell / 2);
      ctx.stroke();
    }
    if (winner) Arcade.text(ctx, 'Tap to play again', W / 2, oy + size + 70, 34);
  });
})();

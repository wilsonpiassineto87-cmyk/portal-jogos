/* Memória: encontrar pares. Config: symbols (lista de emojis), cols, rows, back (cor do verso). */
(function () {
  const cfg = Object.assign({
    symbols: ['🍎', '🍌', '🍇', '🍓', '🍒', '🥝', '🍍', '🍉'],
    cols: 4, rows: 4, back: '#5e35b1', bg: '#311b92', key: 'memory',
  }, Arcade.config);
  const W = 720, H = 960;
  const stage = Arcade.createStage(W, H, cfg.bg);
  const { ctx } = stage;
  const pad = 16, top = 120;
  const cw = (W - pad * (cfg.cols + 1)) / cfg.cols;
  const ch = (H - top - pad * (cfg.rows + 1)) / cfg.rows;
  let cards, open, moves, matched, lock, startTime, endTime;

  function reset() {
    const n = (cfg.cols * cfg.rows) / 2;
    const pick = cfg.symbols.slice(0, n);
    const deck = pick.concat(pick).sort(() => Math.random() - 0.5);
    cards = deck.map((s, i) => ({ s, i, up: false, done: false, flip: 0 }));
    open = [];
    moves = 0;
    matched = 0;
    lock = false;
    startTime = performance.now();
    endTime = null;
  }

  stage.canvas.addEventListener('pointerdown', e => {
    if (endTime) { reset(); return; }
    if (lock) return;
    const p = stage.toLocal(e);
    const c = Math.floor((p.x - pad) / (cw + pad));
    const r = Math.floor((p.y - top - pad) / (ch + pad));
    if (c < 0 || r < 0 || c >= cfg.cols || r >= cfg.rows) return;
    const card = cards[r * cfg.cols + c];
    if (card.up || card.done) return;
    card.up = true;
    Arcade.sfx.click();
    open.push(card);
    if (open.length === 2) {
      moves++;
      lock = true;
      const [a, b] = open;
      setTimeout(() => {
        if (a.s === b.s) {
          a.done = b.done = true;
          matched++;
          Arcade.sfx.point();
          if (matched === cards.length / 2) {
            endTime = performance.now();
            Arcade.sfx.win();
            const best = Arcade.best(cfg.key);
            if (!best || moves < best) try { localStorage.setItem('arcadeBest_' + cfg.key, String(moves)); } catch (err) { /* ignora */ }
          }
        } else {
          a.up = b.up = false;
          Arcade.sfx.hit();
        }
        open = [];
        lock = false;
      }, 650);
    }
  });

  function draw(dt) {
    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, W, H);
    const secs = Math.floor(((endTime || performance.now()) - startTime) / 1000);
    Arcade.text(ctx, cfg.title || 'Memory', W / 2, 44, 46, '#ffd23f');
    Arcade.text(ctx, `Moves ${moves}   Pairs ${matched}/${cards.length / 2}   Time ${secs}s`, W / 2, 92, 26);
    cards.forEach((card, idx) => {
      const target = card.up || card.done ? 1 : 0;
      card.flip += (target - card.flip) * Math.min(1, dt * 14);
      const c = idx % cfg.cols, r = Math.floor(idx / cfg.cols);
      const x = pad + c * (cw + pad), y = top + pad + r * (ch + pad);
      const sx = Math.abs(Math.cos(card.flip * Math.PI));
      ctx.save();
      ctx.translate(x + cw / 2, y + ch / 2);
      ctx.scale(Math.max(0.02, sx), 1);
      const face = card.flip > 0.5;
      ctx.fillStyle = face ? (card.done ? '#c8e6c9' : '#fff') : cfg.back;
      ctx.beginPath();
      ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 18);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.stroke();
      if (face) {
        ctx.font = `${Math.floor(Math.min(cw, ch) * 0.6)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.s, 0, 6);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(cw, ch) * 0.2, 0, 7);
        ctx.fill();
      }
      ctx.restore();
    });
    if (endTime) Arcade.panel(stage, 'Well done!', [`${moves} moves in ${secs}s`, 'Tap to play again']);
  }

  reset();
  Arcade.loop(draw);
})();

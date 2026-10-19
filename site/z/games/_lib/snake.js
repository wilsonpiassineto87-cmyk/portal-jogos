/* Snake: setas/WASD ou deslizar. Config: theme ('day'|'night'), speed. */
(function () {
  const cfg = Object.assign({ theme: 'day', speed: 8, key: 'snake' }, Arcade.config);
  const COLS = 24, ROWS = 16, CELL = 40;
  const pal = cfg.theme === 'night'
    ? { bg: '#05051a', grid: '#0d0d2e', body: '#39ff14', head: '#b6ff9e', food: '#ff2bd6' }
    : { bg: '#2e7d32', grid: '#338a37', body: '#ffd23f', head: '#ffef9a', food: '#e53935' };
  const stage = Arcade.createStage(COLS * CELL, ROWS * CELL, pal.bg);
  const { ctx } = stage;
  let snake, dir, nextDir, food, score, state, acc;

  function reset() {
    snake = [{ x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    score = 0;
    acc = 0;
    placeFood();
  }
  function placeFood() {
    do {
      food = { x: Arcade.randInt(0, COLS - 1), y: Arcade.randInt(0, ROWS - 1) };
    } while (snake.some(s => s.x === food.x && s.y === food.y));
  }
  function turn(d) {
    const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [x, y] = map[d];
    if (x === -dir.x && y === -dir.y) return;
    nextDir = { x, y };
    if (state !== 'play') { reset(); state = 'play'; }
  }
  Arcade.onKey(k => {
    const m = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
    if (m[k]) turn(m[k]);
    else if (k === ' ' && state !== 'play') { reset(); state = 'play'; }
  });
  Arcade.onSwipe(turn);
  stage.canvas.addEventListener('pointerdown', () => { if (state !== 'play') { reset(); state = 'play'; } });

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || snake.some(s => s.x === head.x && s.y === head.y)) {
      state = 'over';
      Arcade.best(cfg.key, score);
      Arcade.sfx.lose();
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      Arcade.sfx.point();
      placeFood();
    } else snake.pop();
  }

  function draw() {
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, stage.width, stage.height);
    ctx.fillStyle = pal.grid;
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if ((x + y) % 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    ctx.fillStyle = pal.food;
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.38, 0, Math.PI * 2);
    ctx.fill();
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? pal.head : pal.body;
      ctx.beginPath();
      ctx.roundRect(s.x * CELL + 3, s.y * CELL + 3, CELL - 6, CELL - 6, 10);
      ctx.fill();
    });
    const h = snake[0];
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(h.x * CELL + CELL / 2 + dir.x * 8 - dir.y * 8, h.y * CELL + CELL / 2 + dir.y * 8 - dir.x * 8, 4, 0, 7);
    ctx.arc(h.x * CELL + CELL / 2 + dir.x * 8 + dir.y * 8, h.y * CELL + CELL / 2 + dir.y * 8 + dir.x * 8, 4, 0, 7);
    ctx.fill();
    Arcade.text(ctx, 'Score ' + score + '   Best ' + Arcade.best(cfg.key), 20, 24, 24, '#fff', 'left');
    if (state === 'ready') Arcade.panel(stage, cfg.title || 'Snake', ['Arrows / WASD or swipe to move', 'Eat the fruit, avoid your tail', 'Press any arrow to start']);
    if (state === 'over') Arcade.panel(stage, 'Game Over', ['Score: ' + score, 'Press space or tap to play again']);
  }

  reset();
  state = 'ready';
  Arcade.loop(dt => {
    if (state === 'play') {
      acc += dt;
      const interval = 1 / (cfg.speed + Math.min(8, score * 0.25));
      while (acc > interval && state === 'play') { acc -= interval; step(); }
    }
    draw();
  });
})();

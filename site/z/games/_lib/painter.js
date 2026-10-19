/* Pintor de pixels: grade 24×24, paleta, balde de tinta, desfazer e limpar. Salva no navegador. */
(function () {
  const W = 720, H = 960, N = 24, CS = 26, GX = (W - N * CS) / 2, GY = 120;
  const stage = Arcade.createStage(W, H, '#263238');
  const { ctx } = stage;
  const PALETTE = ['#000000', '#ffffff', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#00acc1', '#1e88e5', '#8e24aa', '#f06292', '#795548', '#9e9e9e'];
  let grid, color = 2, tool = 'pen', painting = false, history = [];

  try { grid = JSON.parse(localStorage.getItem('pixelPainter')); } catch (e) { grid = null; }
  if (!Array.isArray(grid) || grid.length !== N * N) grid = Array(N * N).fill('#ffffff');
  const save = () => { try { localStorage.setItem('pixelPainter', JSON.stringify(grid)); } catch (e) { /* ignora */ } };

  function fill(i, from, to) {
    if (from === to) return;
    const st = [i];
    while (st.length) {
      const k = st.pop();
      if (grid[k] !== from) continue;
      grid[k] = to;
      const x = k % N, y = Math.floor(k / N);
      if (x > 0) st.push(k - 1);
      if (x < N - 1) st.push(k + 1);
      if (y > 0) st.push(k - N);
      if (y < N - 1) st.push(k + N);
    }
  }
  function paintAt(p) {
    const x = Math.floor((p.x - GX) / CS), y = Math.floor((p.y - GY) / CS);
    if (x < 0 || y < 0 || x >= N || y >= N) return false;
    const i = y * N + x;
    if (tool === 'fill') fill(i, grid[i], PALETTE[color]);
    else grid[i] = tool === 'eraser' ? '#ffffff' : PALETTE[color];
    return true;
  }
  const buttons = [];
  PALETTE.forEach((c, i) => buttons.push({ x: 48 + (i % 6) * 108, y: 770 + Math.floor(i / 6) * 70, w: 92, h: 56, act: () => { color = i; if (tool === 'eraser') tool = 'pen'; }, c, sel: () => color === i }));
  [['✏️ Pen', 'pen'], ['🪣 Fill', 'fill'], ['🧽 Eraser', 'eraser']].forEach(([t, k], i) => buttons.push({ x: 48 + i * 160, y: 900, w: 148, h: 50, label: t, act: () => { tool = k; }, sel: () => tool === k }));
  buttons.push({ x: 528, y: 900, w: 70, h: 50, label: '↶', act: () => { if (history.length) { grid = history.pop(); save(); } } });
  buttons.push({ x: 606, y: 900, w: 70, h: 50, label: '🗑️', act: () => { history.push(grid.slice()); grid = Array(N * N).fill('#ffffff'); save(); } });

  stage.canvas.addEventListener('pointerdown', e => {
    const p = stage.toLocal(e);
    for (const b of buttons) if (p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h) { b.act(); Arcade.sfx.click(); return; }
    history.push(grid.slice());
    if (history.length > 30) history.shift();
    if (paintAt(p)) { painting = tool !== 'fill'; save(); } else history.pop();
  });
  stage.canvas.addEventListener('pointermove', e => { if (painting) { paintAt(stage.toLocal(e)); } });
  window.addEventListener('pointerup', () => { if (painting) save(); painting = false; });

  Arcade.loop(() => {
    ctx.fillStyle = '#263238'; ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, 'Pixel Painter', W / 2, 60, 52, '#ffd23f');
    grid.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(GX + (i % N) * CS, GY + Math.floor(i / N) * CS, CS, CS); });
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    for (let k = 0; k <= N; k++) { ctx.beginPath(); ctx.moveTo(GX + k * CS, GY); ctx.lineTo(GX + k * CS, GY + N * CS); ctx.moveTo(GX, GY + k * CS); ctx.lineTo(GX + N * CS, GY + k * CS); ctx.stroke(); }
    buttons.forEach(b => {
      ctx.fillStyle = b.c || '#455a64';
      ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 12); ctx.fill();
      if (b.sel && b.sel()) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 5; ctx.stroke(); }
      if (b.label) Arcade.text(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2, 24);
    });
  });
})();

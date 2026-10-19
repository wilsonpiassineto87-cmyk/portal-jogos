/* Chef de pizza: monte o pedido do cliente antes do tempo acabar. */
(function () {
  const W = 720, H = 960;
  const stage = Arcade.createStage(W, H, '#fff3e0');
  const { ctx } = stage;
  const TOP = [
    { id: 'tomato', e: '🍅', label: 'Tomato' }, { id: 'cheese', e: '🧀', label: 'Cheese' }, { id: 'mushroom', e: '🍄', label: 'Mushroom' },
    { id: 'pepper', e: '🫑', label: 'Pepper' }, { id: 'olive', e: '🫒', label: 'Olive' }, { id: 'basil', e: '🌿', label: 'Basil' },
  ];
  let order, pizza, money, time, served, state, mood;

  function newOrder() {
    const n = Arcade.randInt(2, Math.min(5, 2 + Math.floor(served / 3)));
    order = TOP.slice().sort(() => Math.random() - 0.5).slice(0, n).map(t => t.id);
    pizza = [];
    mood = 1;
  }
  function reset() { money = 0; time = 60; served = 0; newOrder(); state = 'play'; }
  function serve() {
    const ok = order.length === new Set(pizza).size && order.every(t => pizza.includes(t));
    if (ok) { const tip = Math.round(mood * 5); money += 10 + tip; served++; Arcade.sfx.win(); }
    else { money = Math.max(0, money - 5); Arcade.sfx.hit(); }
    newOrder();
  }

  stage.canvas.addEventListener('pointerdown', e => {
    if (state !== 'play') { reset(); return; }
    const p = stage.toLocal(e);
    TOP.forEach((t, i) => {
      const x = 40 + (i % 3) * 220, y = 700 + Math.floor(i / 3) * 100;
      if (p.x > x && p.x < x + 200 && p.y > y && p.y < y + 84) { pizza.push(t.id); Arcade.sfx.click(); }
    });
    if (p.y > 900 && p.x < W / 2) { pizza = []; Arcade.beep(200, 0.05); }
    if (p.y > 900 && p.x > W / 2) serve();
  });

  reset();
  state = 'ready';
  Arcade.loop(dt => {
    if (state === 'play') {
      time -= dt;
      mood = Math.max(0, mood - dt / 12);
      if (time <= 0) { time = 0; state = 'over'; Arcade.best('pizza', money); Arcade.sfx.lose(); }
    }
    ctx.fillStyle = '#fff3e0'; ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, 'Pizza Chef', W / 2, 50, 50, '#d84315');
    Arcade.text(ctx, `$${money}   ⏱ ${Math.ceil(time)}s   Served ${served}`, W / 2, 105, 30, '#4e342e');
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(60, 140, 600, 100, 20); ctx.fill();
    Arcade.text(ctx, (mood > 0.6 ? '😀' : mood > 0.3 ? '🙂' : '😠') + ' I want: ' + order.map(id => TOP.find(t => t.id === id).e).join(' '), W / 2, 190, 40, '#4e342e');
    ctx.fillStyle = '#e0a458'; ctx.beginPath(); ctx.arc(W / 2, 450, 190, 0, 7); ctx.fill();
    ctx.fillStyle = '#f4d58d'; ctx.beginPath(); ctx.arc(W / 2, 450, 165, 0, 7); ctx.fill();
    ctx.font = '44px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    pizza.forEach((id, i) => {
      const t = TOP.find(x => x.id === id);
      for (let k = 0; k < 5; k++) { const a = (i * 1.7 + k * 1.256), r = 50 + ((i * 31 + k * 17) % 90); ctx.fillText(t.e, W / 2 + Math.cos(a) * r, 450 + Math.sin(a) * r); }
    });
    TOP.forEach((t, i) => {
      const x = 40 + (i % 3) * 220, y = 700 + Math.floor(i / 3) * 100;
      ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.roundRect(x, y, 200, 84, 16); ctx.fill();
      Arcade.text(ctx, `${t.e} ${t.label}`, x + 100, y + 42, 28, '#4e342e');
    });
    ctx.fillStyle = '#ef5350'; ctx.beginPath(); ctx.roundRect(40, 905, 300, 48, 16); ctx.fill();
    ctx.fillStyle = '#43a047'; ctx.beginPath(); ctx.roundRect(380, 905, 300, 48, 16); ctx.fill();
    Arcade.text(ctx, '🗑️ Start over', 190, 929, 26);
    Arcade.text(ctx, '🛎️ Serve!', 530, 929, 26);
    if (state === 'ready') Arcade.panel(stage, 'Pizza Chef', ['Add exactly the toppings in each order', 'then press Serve! Fast service = bigger tips', 'Tap to open the kitchen']);
    if (state === 'over') Arcade.panel(stage, 'Kitchen closed!', [`You earned $${money} serving ${served} pizzas`, 'Tap to play again']);
  });
})();

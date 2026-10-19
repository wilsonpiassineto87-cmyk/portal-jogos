/* Simon: repita a sequência de cores. */
(function () {
  const W = 720, H = 960;
  const stage = Arcade.createStage(W, H, '#212121');
  const { ctx } = stage;
  const pads = [
    { c: '#43a047', lit: '#b9f6ca', f: 330, a0: Math.PI, a1: Math.PI * 1.5 },
    { c: '#e53935', lit: '#ff8a80', f: 392, a0: Math.PI * 1.5, a1: Math.PI * 2 },
    { c: '#fdd835', lit: '#ffff8d', f: 262, a0: Math.PI * 0.5, a1: Math.PI },
    { c: '#1e88e5', lit: '#82b1ff', f: 494, a0: 0, a1: Math.PI * 0.5 },
  ];
  const cx = W / 2, cy = 540, R = 300, r = 110;
  let seq, input, state, lit = -1, litTimer = 0, showIndex, showTimer;

  function reset() { seq = []; next(); }
  function next() { seq.push(Arcade.randInt(0, 3)); input = 0; state = 'show'; showIndex = 0; showTimer = 0.8; }
  function flash(i) { lit = i; litTimer = 0.35; Arcade.beep(pads[i].f, 0.3, 'sine', 0.25); }

  stage.canvas.addEventListener('pointerdown', e => {
    if (state === 'ready' || state === 'over') { reset(); return; }
    if (state !== 'input') return;
    const p = stage.toLocal(e);
    const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
    if (d < r || d > R) return;
    let a = Math.atan2(dy, dx);
    if (a < 0) a += Math.PI * 2;
    const i = pads.findIndex(pd => a >= pd.a0 && a < pd.a1);
    flash(i);
    if (i !== seq[input]) { state = 'over'; Arcade.best('simon', seq.length - 1); Arcade.sfx.lose(); return; }
    input++;
    if (input === seq.length) { state = 'wait'; setTimeout(next, 700); }
  });

  state = 'ready';
  seq = [];
  Arcade.loop(dt => {
    if (litTimer > 0) { litTimer -= dt; if (litTimer <= 0) lit = -1; }
    if (state === 'show') {
      showTimer -= dt;
      if (showTimer <= 0) {
        if (showIndex < seq.length) { flash(seq[showIndex]); showIndex++; showTimer = Math.max(0.3, 0.65 - seq.length * 0.02); }
        else state = 'input';
      }
    }
    ctx.fillStyle = '#212121';
    ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, 'Simon Colors', W / 2, 80, 56, '#ffd23f');
    Arcade.text(ctx, `Round ${seq.length}   Best ${Arcade.best('simon')}`, W / 2, 150, 32);
    pads.forEach((pd, i) => {
      ctx.fillStyle = lit === i ? pd.lit : pd.c;
      ctx.beginPath();
      ctx.arc(cx, cy, R, pd.a0 + 0.04, pd.a1 - 0.04);
      ctx.arc(cx, cy, r, pd.a1 - 0.1, pd.a0 + 0.1, true);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(cx, cy, r - 10, 0, 7); ctx.fill();
    Arcade.text(ctx, state === 'input' ? 'Your turn' : state === 'show' ? 'Watch...' : '', cx, cy, 30);
    if (state === 'ready') Arcade.panel(stage, 'Simon Colors', ['Watch the colours light up', 'then repeat the sequence', 'Tap to start']);
    if (state === 'over') Arcade.panel(stage, 'Oops!', ['You reached round ' + seq.length, 'Tap to play again']);
  });
})();

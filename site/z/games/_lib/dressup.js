/* Monstro fashion: escolha cor, olhos, boca, chapéu e acessório. */
(function () {
  const W = 720, H = 960;
  const stage = Arcade.createStage(W, H, '#f8bbd0');
  const { ctx } = stage;
  const OPTIONS = {
    Body: ['#7e57c2', '#26a69a', '#ef5350', '#ffca28', '#42a5f5', '#8d6e63'],
    Eyes: ['two', 'one', 'three', 'sleepy', 'stars'],
    Mouth: ['smile', 'fangs', 'tongue', 'oh', 'grin'],
    Hat: ['none', 'crown', 'party', 'top hat', 'bow'],
    Extra: ['none', 'glasses', 'scarf', 'freckles', 'horns'],
  };
  const choice = { Body: 0, Eyes: 0, Mouth: 0, Hat: 0, Extra: 0 };
  const rows = Object.keys(OPTIONS);

  stage.canvas.addEventListener('pointerdown', e => {
    const p = stage.toLocal(e);
    rows.forEach((k, i) => {
      const y = 640 + i * 62;
      if (p.y > y - 26 && p.y < y + 26) {
        if (p.x < 160) choice[k] = (choice[k] - 1 + OPTIONS[k].length) % OPTIONS[k].length;
        if (p.x > W - 160) choice[k] = (choice[k] + 1) % OPTIONS[k].length;
        Arcade.sfx.click();
      }
    });
    if (p.y > 590 && p.y < 620 && p.x > 250 && p.x < 470) {
      rows.forEach(k => { choice[k] = Arcade.randInt(0, OPTIONS[k].length - 1); });
      Arcade.sfx.win();
    }
  });

  function eye(x, y, r) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.arc(x + r * 0.2, y + r * 0.15, r * 0.45, 0, 7); ctx.fill();
  }
  function drawMonster(t) {
    const cx = W / 2, cy = 330 + Math.sin(t * 2) * 6;
    const body = OPTIONS.Body[choice.Body];
    if (OPTIONS.Extra[choice.Extra] === 'horns') {
      ctx.fillStyle = '#fff3e0';
      ctx.beginPath(); ctx.moveTo(cx - 110, cy - 150); ctx.lineTo(cx - 140, cy - 240); ctx.lineTo(cx - 70, cy - 170); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 110, cy - 150); ctx.lineTo(cx + 140, cy - 240); ctx.lineTo(cx + 70, cy - 170); ctx.fill();
    }
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(cx, cy, 180, 200, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx - 70, cy + 200, 40, 30, 0, 0, 7); ctx.ellipse(cx + 70, cy + 200, 40, 30, 0, 0, 7); ctx.fill();
    const eyes = OPTIONS.Eyes[choice.Eyes];
    if (eyes === 'two') { eye(cx - 60, cy - 60, 38); eye(cx + 60, cy - 60, 38); }
    if (eyes === 'one') eye(cx, cy - 70, 60);
    if (eyes === 'three') { eye(cx - 80, cy - 50, 30); eye(cx, cy - 90, 34); eye(cx + 80, cy - 50, 30); }
    if (eyes === 'sleepy') { ctx.strokeStyle = '#212121'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx - 60, cy - 60, 30, 0.2, Math.PI - 0.2); ctx.moveTo(cx + 90, cy - 60); ctx.arc(cx + 60, cy - 60, 30, 0.2, Math.PI - 0.2); ctx.stroke(); }
    if (eyes === 'stars') { Arcade.text(ctx, '⭐', cx - 60, cy - 60, 64); Arcade.text(ctx, '⭐', cx + 60, cy - 60, 64); }
    const mouth = OPTIONS.Mouth[choice.Mouth];
    ctx.fillStyle = '#4a0d0d';
    ctx.strokeStyle = '#4a0d0d';
    ctx.lineWidth = 10;
    if (mouth === 'smile') { ctx.beginPath(); ctx.arc(cx, cy + 40, 70, 0.2, Math.PI - 0.2); ctx.stroke(); }
    if (mouth === 'fangs') { ctx.beginPath(); ctx.ellipse(cx, cy + 60, 80, 36, 0, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(cx - 50, cy + 60); ctx.lineTo(cx - 36, cy + 92); ctx.lineTo(cx - 22, cy + 60); ctx.moveTo(cx + 22, cy + 60); ctx.lineTo(cx + 36, cy + 92); ctx.lineTo(cx + 50, cy + 60); ctx.fill(); }
    if (mouth === 'tongue') { ctx.beginPath(); ctx.ellipse(cx, cy + 60, 70, 30, 0, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#ff6f91'; ctx.beginPath(); ctx.ellipse(cx + 10, cy + 90, 26, 30, 0, 0, 7); ctx.fill(); }
    if (mouth === 'oh') { ctx.beginPath(); ctx.ellipse(cx, cy + 70, 30, 40, 0, 0, 7); ctx.fill(); }
    if (mouth === 'grin') { ctx.beginPath(); ctx.roundRect(cx - 80, cy + 40, 160, 50, 20); ctx.fill(); ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) ctx.fillRect(cx - 74 + i * 25, cy + 44, 20, 20); }
    const extra = OPTIONS.Extra[choice.Extra];
    if (extra === 'glasses') { ctx.strokeStyle = '#212121'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx - 60, cy - 60, 46, 0, 7); ctx.moveTo(cx + 106, cy - 60); ctx.arc(cx + 60, cy - 60, 46, 0, 7); ctx.moveTo(cx - 14, cy - 60); ctx.lineTo(cx + 14, cy - 60); ctx.stroke(); }
    if (extra === 'scarf') { ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.roundRect(cx - 150, cy + 120, 300, 40, 18); ctx.fill(); ctx.fillRect(cx + 70, cy + 140, 40, 90); }
    if (extra === 'freckles') { ctx.fillStyle = 'rgba(93,64,55,0.6)'; [[-110, 0], [-95, 20], [-125, 22], [110, 0], [95, 20], [125, 22]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 6, 0, 7); ctx.fill(); }); }
    const hat = OPTIONS.Hat[choice.Hat];
    if (hat === 'crown') { ctx.fillStyle = '#ffd600'; ctx.beginPath(); ctx.moveTo(cx - 80, cy - 170); ctx.lineTo(cx - 80, cy - 250); ctx.lineTo(cx - 40, cy - 200); ctx.lineTo(cx, cy - 260); ctx.lineTo(cx + 40, cy - 200); ctx.lineTo(cx + 80, cy - 250); ctx.lineTo(cx + 80, cy - 170); ctx.fill(); }
    if (hat === 'party') { ctx.fillStyle = '#29b6f6'; ctx.beginPath(); ctx.moveTo(cx - 60, cy - 180); ctx.lineTo(cx, cy - 320); ctx.lineTo(cx + 60, cy - 180); ctx.fill(); ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(cx, cy - 320, 16, 0, 7); ctx.fill(); }
    if (hat === 'top hat') { ctx.fillStyle = '#212121'; ctx.fillRect(cx - 110, cy - 190, 220, 20); ctx.fillRect(cx - 70, cy - 310, 140, 125); ctx.fillStyle = '#d81b60'; ctx.fillRect(cx - 70, cy - 215, 140, 22); }
    if (hat === 'bow') { ctx.fillStyle = '#ec407a'; ctx.beginPath(); ctx.moveTo(cx, cy - 190); ctx.lineTo(cx - 80, cy - 240); ctx.lineTo(cx - 80, cy - 150); ctx.closePath(); ctx.moveTo(cx, cy - 190); ctx.lineTo(cx + 80, cy - 240); ctx.lineTo(cx + 80, cy - 150); ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy - 192, 20, 0, 7); ctx.fill(); }
  }

  Arcade.loop(() => {
    const t = performance.now() / 1000;
    ctx.fillStyle = '#f8bbd0';
    ctx.fillRect(0, 0, W, H);
    Arcade.text(ctx, 'Monster Dressup', W / 2, 54, 52, '#ad1457');
    drawMonster(t);
    ctx.fillStyle = '#ad1457';
    ctx.beginPath(); ctx.roundRect(250, 585, 220, 40, 20); ctx.fill();
    Arcade.text(ctx, '🎲 Surprise me', W / 2, 605, 24);
    rows.forEach((k, i) => {
      const y = 640 + i * 62 + 30;
      ctx.fillStyle = 'rgba(173,20,87,0.15)';
      ctx.beginPath(); ctx.roundRect(40, y - 26, W - 80, 52, 26); ctx.fill();
      Arcade.text(ctx, '◀', 100, y, 34, '#ad1457');
      Arcade.text(ctx, '▶', W - 100, y, 34, '#ad1457');
      const v = OPTIONS[k][choice[k]];
      Arcade.text(ctx, `${k}: ${k === 'Body' ? '' : v}`, W / 2, y, 30, '#4a0d2b');
      if (k === 'Body') { ctx.fillStyle = v; ctx.beginPath(); ctx.arc(W / 2 + 70, y, 16, 0, 7); ctx.fill(); }
    });
  });
})();

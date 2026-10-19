// Miniaturas vetoriais dos jogos (360×100 para a grade, 150×150 para "MORE GAMES").
// Cada motor tem uma cena própria; as variações mudam só a paleta.

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function bg(c1, c2, w, h, id = 'g') {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`;
}

// Cada cena desenha num quadro lógico de 360×100; o formato quadrado reaproveita a cena centralizada.
const scenes = {
  snake(cfg) {
    const night = cfg.theme === 'night';
    const body = night ? '#39ff14' : '#ffd23f';
    let s = bg(night ? '#05051a' : '#43a047', night ? '#14143c' : '#2e7d32', 360, 100);
    for (let x = 0; x < 360; x += 20) for (let y = 0; y < 100; y += 20) if ((x + y) / 20 % 2) s += `<rect x="${x}" y="${y}" width="20" height="20" fill="${night ? '#0d0d2e' : '#4caf50'}" opacity="0.6"/>`;
    const pts = [[150, 70], [170, 70], [190, 70], [210, 70], [230, 70], [230, 50], [250, 50], [270, 50], [290, 50]];
    pts.forEach(([x, y], i) => { s += `<rect x="${x}" y="${y}" width="18" height="18" rx="6" fill="${i === pts.length - 1 ? '#fff6b0' : body}"/>`; });
    s += `<circle cx="304" cy="55" r="3" fill="#111"/><circle cx="330" cy="59" r="9" fill="${night ? '#ff2bd6' : '#e53935'}"/><rect x="329" y="46" width="3" height="6" fill="#5d4037"/>`;
    return s;
  },
  memory(cfg) {
    const back = cfg.back || '#5e35b1';
    const symbols = cfg.symbols || ['🍎', '🍌', '🍇'];
    let s = bg(cfg.bg || '#311b92', '#1a0f5c', 360, 100);
    [[140, 0, false], [190, 1, true], [240, 2, false], [290, 3, true]].forEach(([x, k, up], i) => {
      s += `<g transform="rotate(${(i - 1.5) * 6} ${x + 20} 50)"><rect x="${x}" y="22" width="42" height="58" rx="7" fill="${up ? '#fff' : back}" stroke="#fff" stroke-width="3"/>`;
      s += up ? `<text x="${x + 21}" y="60" font-size="26" text-anchor="middle">${symbols[k % symbols.length]}</text>` : `<circle cx="${x + 21}" cy="51" r="9" fill="#fff" opacity="0.35"/>`;
      s += '</g>';
    });
    return s;
  },
  tictactoe() {
    let s = bg('#1565c0', '#0d47a1', 360, 100);
    s += '<g stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M215 15v70M245 15v70M185 38h90M185 62h90"/></g>';
    s += '<g stroke="#ffd23f" stroke-width="6" stroke-linecap="round"><path d="M190 18l16 16M206 18l-16 16M252 66l16 16M268 66l-16 16M222 42l16 16M238 42l-16 16"/></g>';
    s += '<g fill="none" stroke="#ff5c8a" stroke-width="6"><circle cx="260" cy="26" r="9"/><circle cx="200" cy="74" r="9"/></g>';
    s += '<path d="M190 18L275 82" stroke="#fff" stroke-width="3" opacity="0.8"/>';
    return s;
  },
  connect4() {
    let s = bg('#283593', '#1a237e', 360, 100);
    s += '<rect x="150" y="10" width="190" height="84" rx="10" fill="#1565c0"/>';
    const board = ['.......', '...y...', '..ry...', '.ryyr..'];
    board.forEach((row, r) => [...row].forEach((c, k) => {
      const col = c === 'y' ? '#ffd23f' : c === 'r' ? '#ff3d71' : '#0d1b4d';
      s += `<circle cx="${167 + k * 26}" cy="${24 + r * 20}" r="9" fill="${col}"/>`;
    }));
    return s;
  },
  tiles2048() {
    let s = bg('#bbada0', '#a39181', 360, 100);
    const vals = [[2, '#eee4da'], [4, '#ede0c8'], [8, '#f2b179'], [16, '#f59563'], [64, '#f65e3b'], [128, '#edcf72'], [512, '#edc850'], [2048, '#edc22e']];
    vals.forEach(([v, c], i) => {
      const x = 130 + (i % 4) * 56, y = 8 + Math.floor(i / 4) * 46;
      s += `<rect x="${x}" y="${y}" width="50" height="40" rx="6" fill="${c}"/><text x="${x + 25}" y="${y + 27}" font-family="Arial" font-weight="bold" font-size="${v > 999 ? 14 : 18}" text-anchor="middle" fill="${v <= 4 ? '#776e65' : '#fff'}">${v}</text>`;
    });
    return s;
  },
  breakout(cfg) {
    const neon = cfg.theme === 'neon';
    const cols = neon ? ['#ff00e6', '#ff6b00', '#fff200', '#00ff6a'] : ['#ef5350', '#ff9800', '#ffeb3b', '#66bb6a'];
    let s = bg(neon ? '#000' : '#1c3d5a', neon ? '#120024' : '#102a43', 360, 100);
    cols.forEach((c, r) => { for (let k = 0; k < 7; k++) if (!(r === 3 && k === 4)) s += `<rect x="${130 + k * 32}" y="${8 + r * 13}" width="29" height="10" rx="3" fill="${c}"/>`; });
    s += `<circle cx="262" cy="70" r="6" fill="#fff"/><rect x="230" y="86" width="60" height="8" rx="4" fill="${neon ? '#fff' : '#ffd23f'}"/>`;
    return s;
  },
  pong() {
    let s = bg('#00695c', '#004d40', 360, 100);
    s += '<path d="M250 0v100" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" opacity="0.5"/>';
    s += '<rect x="150" y="20" width="8" height="40" fill="#fff"/><rect x="340" y="45" width="8" height="40" fill="#fff"/><circle cx="290" cy="40" r="6" fill="#ffd23f"/>';
    s += '<text x="225" y="30" font-family="Arial" font-weight="bold" font-size="22" fill="#fff" text-anchor="middle">3</text><text x="275" y="30" font-family="Arial" font-weight="bold" font-size="22" fill="#fff" text-anchor="middle">5</text>';
    return s;
  },
  whack() {
    let s = bg('#8bc34a', '#558b2f', 360, 100);
    [[180, false], [250, true], [320, false]].forEach(([x, up]) => {
      s += `<ellipse cx="${x}" cy="82" rx="30" ry="10" fill="#3e2723"/>`;
      if (up) s += `<ellipse cx="${x}" cy="62" rx="20" ry="24" fill="#8d6e63"/><ellipse cx="${x}" cy="70" rx="11" ry="8" fill="#d7ccc8"/><circle cx="${x - 7}" cy="54" r="3" fill="#212121"/><circle cx="${x + 7}" cy="54" r="3" fill="#212121"/><circle cx="${x}" cy="66" r="3" fill="#f48fb1"/>`;
    });
    s += '<g transform="rotate(-30 280 30)"><rect x="268" y="10" width="34" height="18" rx="4" fill="#795548"/><rect x="282" y="26" width="6" height="34" fill="#a1887f"/></g>';
    return s;
  },
  simon() {
    let s = bg('#303030', '#121212', 360, 100);
    const cx = 255, cy = 50, R = 44, r = 16;
    [['#43a047', 180, 270], ['#e53935', 270, 360], ['#fdd835', 90, 180], ['#1e88e5', 0, 90]].forEach(([c, a0, a1]) => {
      const p = (a, rad) => [cx + Math.cos(a * Math.PI / 180) * rad, cy + Math.sin(a * Math.PI / 180) * rad];
      const [x0, y0] = p(a0 + 3, R), [x1, y1] = p(a1 - 3, R), [x2, y2] = p(a1 - 8, r), [x3, y3] = p(a0 + 8, r);
      s += `<path d="M${x0} ${y0}A${R} ${R} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r} ${r} 0 0 0 ${x3} ${y3}Z" fill="${c}"/>`;
    });
    return s + `<circle cx="${cx}" cy="${cy}" r="${r - 3}" fill="#111"/>`;
  },
  minesweeper() {
    let s = bg('#455a64', '#263238', 360, 100);
    const g = ['ggo1g', 'go1Mo', 'g12og', 'ogoFg'];
    g.forEach((row, r) => [...row].forEach((c, k) => {
      const x = 170 + k * 34, y = 6 + r * 23;
      s += `<rect x="${x}" y="${y}" width="32" height="21" fill="${c === 'g' ? '#8bc34a' : c === 'M' ? '#e53935' : '#cfd8dc'}"/>`;
      if (/[12]/.test(c)) s += `<text x="${x + 16}" y="${y + 16}" font-family="Arial" font-weight="bold" font-size="15" text-anchor="middle" fill="${c === '1' ? '#1e88e5' : '#43a047'}">${c}</text>`;
      if (c === 'M') s += `<circle cx="${x + 16}" cy="${y + 11}" r="6" fill="#212121"/>`;
      if (c === 'F') s += `<path d="M${x + 13} ${y + 4}v14M${x + 13} ${y + 4}l9 4-9 4" stroke="#c62828" stroke-width="2" fill="#e53935"/>`;
    }));
    return s;
  },
  slide15() {
    let s = bg('#00796b', '#004d40', 360, 100);
    const nums = [1, 2, 3, 4, 5, 6, 7, 0, 9, 10, 11, 8];
    nums.forEach((v, i) => {
      if (!v) return;
      const x = 170 + (i % 4) * 46, y = 4 + Math.floor(i / 4) * 32;
      s += `<rect x="${x}" y="${y}" width="42" height="29" rx="5" fill="${v === i + 1 ? '#ffb300' : '#ff7043'}"/><text x="${x + 21}" y="${y + 21}" font-family="Arial" font-weight="bold" font-size="17" text-anchor="middle" fill="#fff">${v}</text>`;
    });
    return s;
  },
  wordguess() {
    let s = bg('#6a1b9a', '#4a148c', 360, 100);
    ['#ef5350', '#ffca28', '#66bb6a', '#29b6f6'].forEach((c, i) => { s += `<path d="M${200 + i * 30} 46L250 92" stroke="#fff" stroke-width="1" opacity="0.6"/><ellipse cx="${200 + i * 30}" cy="${28 + (i % 2) * 6}" rx="12" ry="16" fill="${c}"/>`; });
    s += '<text x="300" y="70" font-family="Arial" font-weight="bold" font-size="22" fill="#fff" text-anchor="middle" letter-spacing="3">W_RD</text>';
    return s;
  },
  catcher(cfg) {
    const good = (cfg.good || ['🎃'])[0], bad = (cfg.bad || ['🕷️'])[0];
    const sky = cfg.sky || ['#12002a', '#4a148c'];
    let s = bg(sky[0], sky[1], 360, 100);
    if (cfg.moon !== false) s += `<circle cx="330" cy="22" r="14" fill="#fff8e1"/><circle cx="336" cy="18" r="13" fill="${sky[0]}"/>`;
    else for (let i = 0; i < 18; i++) s += `<circle cx="${(i * 73) % 360}" cy="${(i * 37) % 70}" r="1.5" fill="#fff"/>`;
    s += `<text x="200" y="38" font-size="24">${good}</text><text x="255" y="58" font-size="22">${bad}</text><text x="300" y="44" font-size="22">${(cfg.good || [good])[1] || good}</text>`;
    s += '<path d="M215 78h70l-8 18h-54z" fill="#8d6e63"/><path d="M229 78v18M243 78v18M257 78v18M271 78v18" stroke="#5d4037" stroke-width="2"/>';
    return s;
  },
  stacker() {
    let s = bg('#ffe0b2', '#ffcc80', 360, 100);
    s += '<ellipse cx="260" cy="92" rx="60" ry="7" fill="#eceff1"/>';
    [['#f6a94b', 80, 12, 10], ['#6d4c41', 70, 12, 12], ['#ffca28', 66, 6, 6], ['#66bb6a', 60, 7, 8], ['#e53935', 54, 6, 6], ['#a1887f', 46, 10, 9]].forEach(([c, y, h, rx]) => { s += `<rect x="${222 - (rx - 8)}" y="${y}" width="${76 + 2 * (rx - 8)}" height="${h}" rx="5" fill="${c}"/>`; });
    s += '<path d="M218 46q42 -40 84 0z" fill="#f6a94b"/><ellipse cx="248" cy="32" rx="3" ry="2" fill="#fff8e1"/><ellipse cx="270" cy="28" rx="3" ry="2" fill="#fff8e1"/>';
    return s;
  },
  penalty() {
    let s = bg('#90caf9', '#2e7d32', 360, 100);
    s += '<rect x="0" y="62" width="360" height="38" fill="#388e3c"/><path d="M180 64V14h160v50" fill="none" stroke="#fff" stroke-width="5"/>';
    for (let x = 190; x < 340; x += 12) s += `<path d="M${x} 14v50" stroke="#fff" opacity="0.3"/>`;
    s += '<rect x="245" y="34" width="18" height="30" rx="5" fill="#ff9800"/><circle cx="254" cy="28" r="7" fill="#ffcc80"/>';
    s += '<circle cx="310" cy="30" r="9" fill="#fff" stroke="#212121" stroke-width="2"/><path d="M306 26l4 3 4-3-1 5h-6z" fill="#212121"/>';
    return s;
  },
  dressup() {
    let s = bg('#f8bbd0', '#f48fb1', 360, 100);
    s += '<ellipse cx="260" cy="62" rx="40" ry="34" fill="#7e57c2"/><circle cx="246" cy="52" r="9" fill="#fff"/><circle cx="274" cy="52" r="9" fill="#fff"/><circle cx="248" cy="54" r="4" fill="#212121"/><circle cx="276" cy="54" r="4" fill="#212121"/>';
    s += '<path d="M244 74q16 12 32 0" stroke="#4a0d0d" stroke-width="4" fill="none"/><path d="M236 32l8-22 8 16 8-18 8 18 8-16 8 22z" fill="#ffd600"/>';
    return s;
  },
  blaster() {
    let s = bg('#000010', '#1a1a4a', 360, 100);
    for (let i = 0; i < 30; i++) s += `<rect x="${(i * 97) % 360}" y="${(i * 41) % 100}" width="2" height="2" fill="#fff" opacity="${0.3 + (i % 3) * 0.2}"/>`;
    s += '<path d="M260 50l14 34-14-8-14 8z" fill="#4fc3f7"/><rect x="258" y="22" width="4" height="12" fill="#ffeb3b"/><rect x="258" y="4" width="4" height="10" fill="#ffeb3b"/>';
    s += '<path d="M200 20l12-6 14 4 4 12-8 10-14 0-8-10z" fill="#a1887f"/><path d="M315 40l10-4 10 6 0 10-10 6-10-4z" fill="#8d6e63"/>';
    return s;
  },
  racer() {
    let s = bg('#33691e', '#1b5e20', 360, 100);
    s += '<rect x="150" y="0" width="180" height="100" fill="#424242"/>';
    for (let y = 0; y < 100; y += 24) s += `<rect x="208" y="${y}" width="4" height="12" fill="#fff"/><rect x="268" y="${y + 8}" width="4" height="12" fill="#fff"/>`;
    s += '<rect x="226" y="54" width="28" height="42" rx="7" fill="#00e676"/><rect x="230" y="62" width="20" height="10" rx="2" fill="#b3e5fc"/>';
    s += '<rect x="166" y="8" width="28" height="42" rx="7" fill="#e53935"/><rect x="286" y="20" width="28" height="42" rx="7" fill="#fdd835"/>';
    return s;
  },
  jumper() {
    let s = bg('#4fc3f7', '#e1f5fe', 360, 100);
    [[160, 80], [230, 58], [290, 36], [200, 24]].forEach(([x, y], i) => { s += `<rect x="${x}" y="${y}" width="56" height="9" rx="4" fill="${i === 2 ? '#ab47bc' : '#43a047'}"/>`; });
    s += '<rect x="244" y="30" width="20" height="24" rx="7" fill="#ff7043"/><circle cx="250" cy="38" r="3.5" fill="#fff"/><circle cx="258" cy="38" r="3.5" fill="#fff"/>';
    return s;
  },
  cuberun() {
    let s = bg('#0b0033', '#ff2e88', 360, 60);
    s += '<rect y="60" width="360" height="40" fill="#12002b"/><path d="M190 60a60 60 0 0 1 120 0z" fill="#ffcc33"/>';
    for (let x = -200; x <= 200; x += 40) s += `<path d="M250 60L${250 + x * 2} 100" stroke="#ff2e88" opacity="0.6"/>`;
    s += '<rect x="290" y="64" width="22" height="22" fill="#b0f" stroke="#fff"/><rect x="200" y="62" width="14" height="14" fill="#80f" stroke="#fff"/><path d="M250 80l12 18h-24z" fill="#00e5ff"/>';
    return s;
  },
  maze() {
    let s = bg('#5d4037', '#3e2723', 360, 100);
    s += '<rect x="170" y="8" width="170" height="84" fill="#d7ccc8"/>';
    s += '<path d="M170 8h170v84H170zM200 8v30M200 60v32M230 30v40M260 8v26M260 56h50M290 30v26M310 8v24M170 60h30M230 70h30" stroke="#4e342e" stroke-width="5" fill="none" stroke-linecap="round"/>';
    s += '<circle cx="186" cy="24" r="7" fill="#ff7043"/><circle cx="245" cy="48" r="6" fill="#ffca28"/><rect x="314" y="70" width="20" height="16" rx="3" fill="#8d6e63"/><rect x="314" y="70" width="20" height="5" fill="#ffca28"/>';
    return s;
  },
  painter() {
    let s = bg('#37474f', '#263238', 360, 100);
    const art = ['..rrr..', '.rrrrr.', 'rr.r.rr', 'rrrrrrr', '.ryyyr.', '..rrr..'];
    art.forEach((row, r) => [...row].forEach((c, k) => { if (c !== '.') s += `<rect x="${200 + k * 12}" y="${14 + r * 12}" width="12" height="12" fill="${c === 'r' ? '#e53935' : '#fdd835'}"/>`; }));
    ['#1e88e5', '#43a047', '#fb8c00', '#8e24aa'].forEach((c, i) => { s += `<circle cx="${305 + (i % 2) * 22}" cy="${30 + Math.floor(i / 2) * 22}" r="9" fill="${c}"/>`; });
    return s;
  },
  pizzachef() {
    let s = bg('#fff3e0', '#ffcc80', 360, 100);
    s += '<circle cx="260" cy="56" r="40" fill="#e0a458"/><circle cx="260" cy="56" r="33" fill="#f4d58d"/>';
    [[245, 44, '#e53935'], [272, 46, '#e53935'], [255, 68, '#e53935'], [278, 66, '#43a047'], [240, 62, '#6d4c41'], [262, 38, '#43a047']].forEach(([x, y, c]) => { s += `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>`; });
    s += '<path d="M318 18h22v10h-22z" fill="#fff" stroke="#ccc"/><ellipse cx="329" cy="16" rx="13" ry="9" fill="#fff" stroke="#ccc"/>';
    return s;
  },
};

export function thumbSVG(game, w = 360, h = 100) {
  const scene = scenes[game.engine](game.cfg || {});
  if (w === 360 && h === 100) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="100" viewBox="0 0 360 100"><title>${esc(game.name.replace(/_/g, ' '))}</title>${scene}</svg>`;
  }
  // Formato quadrado: amplia a metade direita da cena (onde fica a arte).
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="140 0 200 100" preserveAspectRatio="xMidYMid slice"><title>${esc(game.name.replace(/_/g, ' '))}</title>${scene}</svg>`;
}

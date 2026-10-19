/* Arte procedural do portal: logo, imagens do dia, quebra-cabeça, ilusões, GIFs, rostos e mascote. */
(function () {
  'use strict';

  function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const uri = svg => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const hsl = (h, s, l) => `hsl(${Math.round(h)},${s}%,${l}%)`;

  // ---------- Logo ----------
  const LOGO_SCHEMES = {
    Classic: ['#ffd23f', '#ff8a00', '#7b1fa2'],
    Ocean: ['#4fc3f7', '#0277bd', '#002f6c'],
    Lime: ['#c6ff00', '#43a047', '#1b5e20'],
    Candy: ['#ff80ab', '#ec407a', '#880e4f'],
    Sunset: ['#ffcc80', '#ff5722', '#4e1d00'],
    Mint: ['#a7ffeb', '#00bfa5', '#004d40'],
    Royal: ['#b388ff', '#651fff', '#1a0066'],
    Fire: ['#ffee58', '#ff3d00', '#3e0000'],
  };
  const LOGO_VARIANTS = Object.keys(LOGO_SCHEMES);

  function logoSVG(variant) {
    const word = 'JOGATINA';
    const season = variant === 'Halloween' ? 'halloween' : variant === 'Christmas' ? 'christmas' : null;
    const [c1, c2, c3] = season === 'halloween' ? ['#ffb74d', '#ef6c00', '#1b0033'] : season === 'christmas' ? ['#ffffff', '#e53935', '#1b5e20'] : (LOGO_SCHEMES[variant] || LOGO_SCHEMES.Classic);
    const letters = [...word].map((ch, i) => {
      const rot = (i % 2 ? 1 : -1) * (3 + (i * 7) % 5);
      const dy = Math.sin(i * 1.3) * 10;
      return `<text x="${70 + i * 82}" y="${185 + dy}" transform="rotate(${rot} ${70 + i * 82} ${150 + dy})" text-anchor="middle">${ch}</text>`;
    }).join('');
    let extra = '';
    if (season === 'halloween') {
      extra = '<g transform="translate(760 215) scale(0.85)"><ellipse rx="70" ry="56" fill="#ff8a00" stroke="#7a3300" stroke-width="6"/><path d="M-6-52q4-26 22-30" stroke="#4e342e" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-38-12l18 14h-30zM34-12l-14 14h28zM-44 18q44 34 88 0l-14 12-12-8-14 12-12-10-14 10z" fill="#331100"/></g>'
        + '<g fill="#1b0033" opacity="0.85"><path d="M-40 90q20-28 40 0q-20-10-40 0zM-10 40q16-22 32 0q-16-8-32 0z"/></g>';
    } else if (season === 'christmas') {
      extra = '<g transform="translate(70 70) rotate(-18)"><path d="M-48 30Q-10-70 50-20l26 40-14 6-20-26q-36-14-58 40z" fill="#d32f2f"/><rect x="-60" y="22" width="76" height="22" rx="11" fill="#fff"/><circle cx="66" cy="22" r="13" fill="#fff"/></g>'
        + [...Array(18)].map((_, i) => `<circle cx="${(i * 97) % 700 + 10}" cy="${(i * 53) % 90 + 10}" r="${3 + (i % 3)}" fill="#fff" opacity="0.8"/>`).join('');
    }
    const vb = season === 'halloween' ? '-60 0 900 300' : '0 0 720 300';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Jogatina">
<defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<filter id="ls" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="6" dy="10" stdDeviation="4" flood-color="#000" flood-opacity="0.45"/></filter></defs>
<g font-family="siteFont, Arial Rounded MT Bold, Arial, sans-serif" font-weight="700" font-size="128" filter="url(#ls)">
<g fill="none" stroke="${c3}" stroke-width="26" stroke-linejoin="round">${letters}</g>
<g fill="url(#lg)" stroke="#fff" stroke-width="5" stroke-linejoin="round">${letters}</g></g>
<g fill="#fff" opacity="0.5">${[...word].map((_, i) => `<ellipse cx="${55 + i * 82}" cy="${130 + Math.sin(i * 1.3) * 10}" rx="12" ry="6" transform="rotate(-25 ${55 + i * 82} 130)"/>`).join('')}</g>
${extra}
<text x="690" y="250" font-family="Arial" font-size="22" fill="#fff" opacity="0.7">™</text>
</svg>`;
  }

  // ---------- Foto fofa: bichinho gerado ----------
  function cuteSVG(seed) {
    const r = rng(seed);
    const kind = pick(r, ['cat', 'bear', 'bunny', 'frog', 'panda', 'fox']);
    const fur = { cat: hsl(25 + r() * 20, 70, 60), bear: hsl(25, 45, 40 + r() * 10), bunny: hsl(0, 0, 92), frog: hsl(100 + r() * 20, 55, 50), panda: '#fafafa', fox: hsl(22, 90, 55) }[kind];
    const bg = hsl(r() * 360, 70, 85);
    let ears = '';
    if (kind === 'cat' || kind === 'fox') ears = `<path d="M150 170L180 60l60 80zM350 170L320 60l-60 80z" fill="${fur}"/><path d="M168 150l14-55 30 40zM332 150l-14-55-30 40z" fill="#ffb3c7"/>`;
    if (kind === 'bear' || kind === 'panda') ears = `<circle cx="160" cy="140" r="48" fill="${kind === 'panda' ? '#222' : fur}"/><circle cx="340" cy="140" r="48" fill="${kind === 'panda' ? '#222' : fur}"/>`;
    if (kind === 'bunny') ears = `<ellipse cx="195" cy="80" rx="32" ry="95" fill="${fur}"/><ellipse cx="305" cy="80" rx="32" ry="95" fill="${fur}"/><ellipse cx="195" cy="90" rx="15" ry="70" fill="#ffb3c7"/><ellipse cx="305" cy="90" rx="15" ry="70" fill="#ffb3c7"/>`;
    if (kind === 'frog') ears = `<circle cx="180" cy="170" r="55" fill="${fur}"/><circle cx="320" cy="170" r="55" fill="${fur}"/>`;
    const eyeY = kind === 'frog' ? 165 : 250;
    const eyeX = kind === 'frog' ? 70 : 60;
    const patches = kind === 'panda' ? `<ellipse cx="${250 - eyeX}" cy="${eyeY}" rx="42" ry="50" fill="#222" transform="rotate(20 ${250 - eyeX} ${eyeY})"/><ellipse cx="${250 + eyeX}" cy="${eyeY}" rx="42" ry="50" fill="#222" transform="rotate(-20 ${250 + eyeX} ${eyeY})"/>` : '';
    const accessory = pick(r, ['bow', 'hat', 'none', 'flower']);
    const acc = accessory === 'bow' ? '<path d="M250 150l-55-35v70zM250 150l55-35v70z" fill="#e91e63"/><circle cx="250" cy="150" r="16" fill="#c2185b"/>'
      : accessory === 'hat' ? '<path d="M175 160q75-110 150 0z" fill="#3f51b5"/><circle cx="250" cy="60" r="18" fill="#ffeb3b"/>'
        : accessory === 'flower' ? '<g transform="translate(330 150)">' + [0, 72, 144, 216, 288].map(a => `<ellipse rx="14" ry="24" fill="#fff59d" transform="rotate(${a}) translate(0 -20)"/>`).join('') + '<circle r="12" fill="#ff9800"/></g>' : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><rect width="500" height="500" fill="${bg}"/>
${[...Array(12)].map(() => `<circle cx="${r() * 500}" cy="${r() * 500}" r="${6 + r() * 18}" fill="#fff" opacity="0.5"/>`).join('')}
${ears}<ellipse cx="250" cy="290" rx="170" ry="150" fill="${fur}"/>${patches}
<circle cx="${250 - eyeX}" cy="${eyeY}" r="30" fill="#222"/><circle cx="${250 + eyeX}" cy="${eyeY}" r="30" fill="#222"/>
<circle cx="${250 - eyeX + 10}" cy="${eyeY - 10}" r="11" fill="#fff"/><circle cx="${250 + eyeX + 10}" cy="${eyeY - 10}" r="11" fill="#fff"/>
<ellipse cx="${250 - 115}" cy="320" rx="28" ry="16" fill="#ff8a80" opacity="0.6"/><ellipse cx="${250 + 115}" cy="320" rx="28" ry="16" fill="#ff8a80" opacity="0.6"/>
<ellipse cx="250" cy="305" rx="16" ry="11" fill="#5d4037"/><path d="M222 330q14 18 28 0q14 18 28 0" stroke="#5d4037" stroke-width="7" fill="none" stroke-linecap="round"/>
${acc}</svg>`;
  }

  // ---------- Foto incrível: paisagem gerada ----------
  function amazingSVG(seed) {
    const r = rng(seed);
    const hue = r() * 360;
    const sky = [hsl(hue, 70, 18), hsl(hue + 40, 80, 45), hsl(hue + 70, 90, 70)];
    let layers = '';
    for (let k = 0; k < 5; k++) {
      let d = `M0 ${300 + k * 40}`;
      for (let x = 0; x <= 800; x += 40) d += ` L${x} ${260 + k * 45 - r() * (120 - k * 18)}`;
      d += ' L800 600 L0 600Z';
      layers += `<path d="${d}" fill="${hsl(hue + 200, 30 + k * 6, 10 + k * 7)}" opacity="${0.6 + k * 0.1}"/>`;
    }
    const aurora = r() < 0.5 ? [...Array(4)].map((_, i) => `<path d="M0 ${120 + i * 20} Q200 ${40 + r() * 80} 400 ${110 + i * 15} T800 ${90 + i * 25}" stroke="${hsl(120 + i * 40, 90, 60)}" stroke-width="${18 - i * 3}" fill="none" opacity="0.35"/>`).join('') : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="0.6" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient></defs>
<rect width="800" height="600" fill="url(#s)"/>${[...Array(60)].map(() => `<circle cx="${r() * 800}" cy="${r() * 260}" r="${r() * 1.8}" fill="#fff"/>`).join('')}
<circle cx="${150 + r() * 500}" cy="${180 + r() * 60}" r="${40 + r() * 40}" fill="${hsl(hue + 60, 100, 85)}" opacity="0.9"/>${aurora}${layers}
<rect y="520" width="800" height="80" fill="${hsl(hue + 200, 50, 30)}" opacity="0.6"/></svg>`;
  }

  // ---------- Arte de rua: grafite gerado ----------
  function streetArtSVG(seed) {
    const r = rng(seed);
    const words = ['PLAY', 'WOW', 'YES!', 'FUN', 'BOOM', 'HEY', 'COOL', 'ZAP', 'GO GO', 'POW'];
    const word = pick(r, words);
    const h = r() * 360;
    const bricks = [...Array(14)].map((_, y) => [...Array(9)].map((__, x) => `<rect x="${x * 90 - (y % 2) * 45}" y="${y * 44}" width="86" height="40" fill="${hsl(15 + r() * 10, 25, 30 + r() * 8)}"/>`).join('')).join('');
    const drips = [...Array(14)].map(() => { const x = 120 + r() * 560; const len = 40 + r() * 140; return `<path d="M${x} 330v${len}" stroke="${hsl(h + r() * 60, 90, 55)}" stroke-width="${6 + r() * 6}" stroke-linecap="round"/>`; }).join('');
    const blobs = [...Array(5)].map(() => `<circle cx="${r() * 800}" cy="${r() * 600}" r="${40 + r() * 80}" fill="${hsl(h + 180 + r() * 60, 90, 55)}" opacity="0.6"/>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#5d4037"/>${bricks}${blobs}
<g font-family="Impact, Arial Black, sans-serif" font-size="${word.length > 4 ? 170 : 210}" font-weight="900" text-anchor="middle" transform="rotate(${-8 + r() * 16} 400 300)">
<text x="410" y="370" fill="#111">${word}</text><text x="400" y="355" fill="${hsl(h, 95, 60)}" stroke="#fff" stroke-width="10" paint-order="stroke">${word}</text></g>${drips}
<g transform="translate(${80 + r() * 600} ${470 + r() * 80}) rotate(${r() * 40 - 20})"><path d="M0 0l20-40 20 40-40-25h40z" fill="#ffeb3b"/></g></svg>`;
  }

  // ---------- Quebra-cabeça "qual é o diferente?" ----------
  const PUZZLE_THINGS = [
    ['happy frogs', '#43a047'], ['cuddly bears', '#8d6e63'], ['wise owls', '#795548'], ['sweet piggies', '#f48fb1'],
    ['friendly lions', '#ffb300'], ['cheeky monkeys', '#a1887f'], ['cute kittens', '#ff9800'], ['busy bees', '#fdd835'],
  ];
  function critter(cx, cy, s, color, diff) {
    // diff: 0 = normal; 1 = falta orelha; 2 = olho fechado; 3 = sem sorriso; 4 = nariz de outra cor
    const ear2 = diff === 1 ? '' : `<circle cx="${cx + 28 * s}" cy="${cy - 30 * s}" r="${14 * s}" fill="${color}"/>`;
    const eye2 = diff === 2 ? `<path d="M${cx + 8 * s} ${cy - 6 * s}h${14 * s}" stroke="#222" stroke-width="${4 * s}" stroke-linecap="round"/>` : `<circle cx="${cx + 15 * s}" cy="${cy - 6 * s}" r="${6 * s}" fill="#222"/>`;
    const mouth = diff === 3 ? `<path d="M${cx - 12 * s} ${cy + 18 * s}h${24 * s}" stroke="#222" stroke-width="${3.5 * s}" stroke-linecap="round"/>` : `<path d="M${cx - 12 * s} ${cy + 14 * s}q${12 * s} ${12 * s} ${24 * s} 0" stroke="#222" stroke-width="${3.5 * s}" fill="none" stroke-linecap="round"/>`;
    const nose = diff === 4 ? '#1e88e5' : '#e91e63';
    return `<circle cx="${cx - 28 * s}" cy="${cy - 30 * s}" r="${14 * s}" fill="${color}"/>${ear2}<circle cx="${cx}" cy="${cy}" r="${40 * s}" fill="${color}"/>
<circle cx="${cx - 15 * s}" cy="${cy - 6 * s}" r="${6 * s}" fill="#222"/>${eye2}<circle cx="${cx}" cy="${cy + 6 * s}" r="${5 * s}" fill="${nose}"/>${mouth}`;
  }
  function puzzle(seed) {
    const r = rng(seed);
    const [name, color] = pick(r, PUZZLE_THINGS);
    const cols = pick(r, [3, 4]), rows = cols === 3 ? 3 : 3;
    const n = cols * rows;
    const odd = Math.floor(r() * n);
    const diff = 1 + Math.floor(r() * 4);
    const w = 600, h = 600, cw = w / cols, ch = h / rows;
    let body = '', ring = '';
    for (let i = 0; i < n; i++) {
      const cx = cw * (i % cols) + cw / 2, cy = ch * Math.floor(i / cols) + ch / 2 + 10;
      body += critter(cx, cy, Math.min(cw, ch) / 120, color, i === odd ? diff : 0);
      if (i === odd) ring = `<circle cx="${cx}" cy="${cy - 5}" r="${Math.min(cw, ch) * 0.46}" fill="none" stroke="#ff1744" stroke-width="10"/>`;
    }
    const bg = `<rect width="${w}" height="${h}" fill="#fff8e1"/>`;
    const svg = extra => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${bg}${body}${extra}</svg>`;
    return { image: uri(svg('')), solution: uri(svg(ring)), prompt: `Look carefully at these ${n} ${name}. Which is the odd one out?` };
  }

  // ---------- Ilusão de ótica ----------
  function opticalSVG(seed) {
    const r = rng(seed);
    const type = seed % 4;
    if (type === 0) { // parede do café
      let s = '<rect width="600" height="600" fill="#888"/>';
      for (let y = 0; y < 12; y++) for (let x = -1; x < 8; x++) s += `<rect x="${x * 90 + [0, 22, 45, 22][y % 4]}" y="${y * 50 + 1}" width="45" height="48" fill="#111"/>`;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">${s}</svg>`;
    }
    if (type === 1) { // grade de Hermann
      let s = '<rect width="600" height="600" fill="#fff"/>';
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) s += `<rect x="${x * 86 + 8}" y="${y * 86 + 8}" width="72" height="72" fill="#000"/>`;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">${s}</svg>`;
    }
    if (type === 2) { // círculos de Ebbinghaus
      const big = [...Array(6)].map((_, i) => { const a = i * Math.PI / 3; return `<circle cx="${170 + Math.cos(a) * 100}" cy="${300 + Math.sin(a) * 100}" r="48" fill="#90a4ae"/>`; }).join('');
      const small = [...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return `<circle cx="${440 + Math.cos(a) * 62}" cy="${300 + Math.sin(a) * 62}" r="16" fill="#90a4ae"/>`; }).join('');
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#fff"/>${big}${small}<circle cx="170" cy="300" r="28" fill="#ff7043"/><circle cx="440" cy="300" r="28" fill="#ff7043"/><text x="300" y="560" font-family="Arial" font-size="26" text-anchor="middle" fill="#455a64">Which orange circle is bigger?</text></svg>`;
    }
    // espiral de cores em movimento aparente
    let s = '<rect width="600" height="600" fill="#fff"/>';
    const hue = r() * 360;
    for (let ring = 0; ring < 6; ring++) for (let k = 0; k < 24; k++) {
      const a = k * Math.PI / 12 + ring * 0.13, rad = 40 + ring * 45;
      s += `<ellipse cx="${300 + Math.cos(a) * rad}" cy="${300 + Math.sin(a) * rad}" rx="${8 + ring * 2.6}" ry="${4 + ring * 1.4}" transform="rotate(${a * 180 / Math.PI + 90} ${300 + Math.cos(a) * rad} ${300 + Math.sin(a) * rad})" fill="${['#000', hsl(hue, 80, 50), '#fff', hsl(hue + 180, 80, 50)][k % 4]}" stroke="#000" stroke-width="0.5"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">${s}</svg>`;
  }

  // ---------- "GIFs" do dia: SVG animados ----------
  function gifSVG(seed) {
    const r = rng(seed);
    const kind = seed % 5;
    const c = hsl(r() * 360, 80, 55);
    const bg = hsl(r() * 360, 60, 88);
    const anims = [
      `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -160;0 0" dur="0.9s" repeatCount="indefinite"/><ellipse cx="300" cy="420" rx="70" ry="70" fill="${c}"/><circle cx="278" cy="400" r="10" fill="#222"/><circle cx="322" cy="400" r="10" fill="#222"/><path d="M276 440q24 20 48 0" stroke="#222" stroke-width="6" fill="none"/></g><ellipse cx="300" cy="500" rx="70" ry="12" fill="#000" opacity="0.2"><animate attributeName="rx" values="70;30;70" dur="0.9s" repeatCount="indefinite"/></ellipse>`,
      `<g transform="translate(300 300)"><g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="2s" repeatCount="indefinite"/>${[0, 60, 120, 180, 240, 300].map(a => `<ellipse rx="40" ry="120" fill="${hsl(a, 85, 60)}" opacity="0.8" transform="rotate(${a})"/>`).join('')}</g><circle r="40" fill="#fff"/></g>`,
      `<g transform="translate(300 330)"><rect x="-80" y="-60" width="160" height="150" rx="30" fill="${c}"/><g><animateTransform attributeName="transform" type="rotate" values="-25;25;-25" dur="0.6s" repeatCount="indefinite"/><rect x="-6" y="-150" width="12" height="90" fill="#555"/><circle cy="-155" r="16" fill="#ff1744"/></g><circle cx="-35" cy="-10" r="18" fill="#fff"/><circle cx="35" cy="-10" r="18" fill="#fff"/><circle cx="-35" cy="-10" r="8" fill="#222"><animate attributeName="cx" values="-42;-28;-42" dur="1s" repeatCount="indefinite"/></circle><circle cx="35" cy="-10" r="8" fill="#222"><animate attributeName="cx" values="28;42;28" dur="1s" repeatCount="indefinite"/></circle><rect x="-40" y="35" width="80" height="16" rx="8" fill="#222"/></g>`,
      [...Array(12)].map((_, i) => `<circle cx="${50 + i * 46}" cy="300" r="20" fill="${hsl(i * 30, 85, 55)}"><animate attributeName="cy" values="300;180;300" dur="1.2s" begin="${i * 0.1}s" repeatCount="indefinite"/></circle>`).join(''),
      `<g transform="translate(300 320)"><g><animateTransform attributeName="transform" type="scale" values="1;1.25;1" dur="0.8s" repeatCount="indefinite"/><path d="M0 60C-90 0-90-80-40-80c25 0 40 20 40 35 0-15 15-35 40-35 50 0 50 80-40 140z" fill="#e53935"/></g></g>`,
    ];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="${bg}"/>${anims[kind]}</svg>`;
  }

  // ---------- Rostos do teste de reação ----------
  function faceSVG(happy) {
    const mouth = happy ? '<path d="M30 62q20 26 40 0z" fill="#7a1010"/><path d="M38 70q12 10 24 0" fill="#e57373"/>' : '<path d="M32 72q18-10 36 0" stroke="#5d4037" stroke-width="5" fill="none" stroke-linecap="round"/>';
    const eyes = happy ? '<circle cx="36" cy="40" r="10" fill="#fff"/><circle cx="64" cy="40" r="10" fill="#fff"/><circle cx="38" cy="42" r="5" fill="#222"/><circle cx="66" cy="42" r="5" fill="#222"/>'
      : '<path d="M24 36h22M54 36h22" stroke="#d4a017" stroke-width="7" stroke-linecap="round"/><circle cx="36" cy="44" r="5" fill="#222"/><circle cx="64" cy="44" r="5" fill="#222"/><path d="M24 40h22M54 40h22" stroke="#e8b923" stroke-width="5"/>';
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#ffee00" stroke="#d4a017" stroke-width="4"/><ellipse cx="34" cy="22" rx="12" ry="6" fill="#fff" opacity="0.6" transform="rotate(-30 34 22)"/>${eyes}${mouth}</svg>`);
  }

  // ---------- Mascote do rodapé: 3 quadros (dormindo, acordado, comemorando) ----------
  function mascotStrip(xmas) {
    const frame = (x, state) => {
      const eyes = state === 0 ? `<path d="M${x + 40} 78q10 8 20 0M${x + 80} 78q10 8 20 0" stroke="#222" stroke-width="4" fill="none"/>`
        : `<circle cx="${x + 50}" cy="76" r="9" fill="#fff"/><circle cx="${x + 90}" cy="76" r="9" fill="#fff"/><circle cx="${x + 52}" cy="78" r="4.5" fill="#222"/><circle cx="${x + 92}" cy="78" r="4.5" fill="#222"/>`;
      const mouth = state === 2 ? `<ellipse cx="${x + 70}" cy="102" rx="14" ry="10" fill="#7a1010"/>` : state === 1 ? `<path d="M${x + 56} 98q14 12 28 0" stroke="#222" stroke-width="4" fill="none"/>` : `<path d="M${x + 62} 100h16" stroke="#222" stroke-width="4"/>`;
      const z = state === 0 ? `<text x="${x + 110}" y="40" font-family="Arial" font-weight="bold" font-size="22" fill="#fff">z z</text>` : '';
      const arms = state === 2 ? `<path d="M${x + 18} 90l-14-30M${x + 122} 90l14-30" stroke="#5e35b1" stroke-width="10" stroke-linecap="round"/>` : '';
      const hat = xmas ? `<path d="M${x + 36} 46q34-50 70-6l-8 6q-26-26-54 4z" fill="#d32f2f"/><circle cx="${x + 108}" cy="42" r="7" fill="#fff"/>` : '';
      return `<ellipse cx="${x + 70}" cy="132" rx="54" ry="8" fill="#000" opacity="0.25"/><path d="M${x + 14} 128q-6-60 56-82q62 22 56 82z" fill="#7e57c2"/><path d="M${x + 40} 60q30-26 60 0" fill="#9575cd"/>${arms}${eyes}${mouth}${z}${hat}`;
    };
    return uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 140">${frame(0, 0)}${frame(140, 1)}${frame(280, 2)}</svg>`);
  }

  // ---------- Gráfico que cai: rosquinha ou foguete de brinquedo ----------
  function dropSVG(which) {
    if (which === 0) return uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="#e0a458"/><circle cx="100" cy="100" r="70" fill="#f06292"/><circle cx="100" cy="100" r="28" fill="none"/><circle cx="100" cy="100" r="26" fill="#3949ab" opacity="0"/>' + [...Array(14)].map((_, i) => `<rect x="${100 + Math.cos(i) * 50}" y="${100 + Math.sin(i * 1.7) * 50}" width="10" height="4" rx="2" fill="${['#fff', '#ffeb3b', '#4fc3f7'][i % 3]}" transform="rotate(${i * 40} ${100 + Math.cos(i) * 50} ${100 + Math.sin(i * 1.7) * 50})"/>`).join('') + '<circle cx="100" cy="100" r="26" fill="indigo"/></svg>');
    return uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M100 10c30 30 40 70 30 120H70C60 80 70 40 100 10z" fill="#eceff1" stroke="#455a64" stroke-width="5"/><circle cx="100" cy="70" r="16" fill="#4fc3f7" stroke="#455a64" stroke-width="5"/><path d="M70 120l-30 40h35zM130 120l30 40h-35z" fill="#e53935"/><path d="M80 130q20 60 40 0" fill="#ffca28"/></svg>');
  }

  window.Art = { LOGO_VARIANTS, logoSVG, cute: s => uri(cuteSVG(s)), amazing: s => uri(amazingSVG(s)), streetArt: s => uri(streetArtSVG(s)), puzzle, optical: s => uri(opticalSVG(s)), gif: s => uri(gifSVG(s)), faceSVG, mascotStrip, dropSVG };
})();

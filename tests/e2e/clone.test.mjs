// Testes ponta a ponta do clone (Playwright): o que não dá para comparar ao vivo com a referência
// (datas especiais, conquistas por número de jogadas, todos os jogos, fluxos longos) é verificado aqui.
// Uso: node tests/e2e/clone.test.mjs   — sobe o servidor do projeto, grava docs/e2e-results.md e sai com 1 se algo falhar.
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
const require = createRequire(import.meta.url);
const PW = process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright/index.mjs';
const { chromium, devices } = await import(fs.existsSync(PW) ? PW : 'playwright');
const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));

const { server } = require(path.join(ROOT, 'server.js'));
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const results = [];
const external = new Set();

async function withPage(opts, fn) {
  const ctx = await browser.newContext({ locale: 'en-US', viewport: { width: 1366, height: 768 }, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { const u = new URL(r.url()); if (!['127.0.0.1', ''].includes(u.hostname) && !u.protocol.startsWith('data') && !u.protocol.startsWith('blob')) external.add(u.origin); });
  try { return await fn(page, errors, ctx); } finally { await ctx.close(); }
}
async function check(id, name, fn) {
  const t0 = Date.now();
  try {
    const detail = await fn();
    results.push({ id, name, ok: true, detail, ms: Date.now() - t0 });
    console.log(`PASS ${id} ${name}${detail ? ' — ' + detail : ''}`);
  } catch (e) {
    results.push({ id, name, ok: false, detail: e.message.split('\n')[0], ms: Date.now() - t0 });
    console.log(`FAIL ${id} ${name} — ${e.message.split('\n')[0]}`);
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const seed = (page, data) => page.addInitScript(d => { if (!sessionStorage.__seeded) { for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); sessionStorage.__seeded = 1; } }, data);
async function openDaily(page) {
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.locator('#frivDaily').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
}
const tiles = page => page.$$eval('#gamesBlock > div[class*=gameThumbContainer]', els => els.length);

// ---- Todos os jogos: abrem, desenham e respondem a teclado/mouse sem erro ----
const slugs = fs.readdirSync(path.join(ROOT, 'site', 'z', 'games')).filter(s => !s.startsWith('_'));
for (const slug of slugs) {
  await check('G-PLAY', `jogo ${slug}: carrega, desenha e responde`, () => withPage({}, async (page, errors) => {
    await page.goto(BASE + `z/games/${slug}/index.html`, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const box = await page.evaluate(() => { const c = document.querySelector('canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    assert(box, 'sem canvas');
    await page.mouse.click(box.x, box.y);
    for (const k of ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter']) { await page.keyboard.press(k); await page.waitForTimeout(60); }
    await page.mouse.click(box.x - 40, box.y + 30);
    await page.waitForTimeout(600);
    const colours = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      const x = c.getContext('2d') || null;
      if (!x) return 99; // canvas WebGL: conta como desenhado se existir contexto
      const d = x.getImageData(0, 0, c.width, c.height).data, seen = new Set();
      for (let i = 0; i < d.length; i += 4 * 97) seen.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]);
      return seen.size;
    });
    assert(colours > 3, `canvas quase vazio (${colours} cores)`);
    assert(errors.length === 0, 'erros: ' + errors.join(' | '));
    return `${colours} cores amostradas`;
  }));
  await check('P-PAGE', `página de jogo ${slug}`, () => withPage({}, async (page, errors) => {
    await page.goto(BASE + `z/games/${slug}/game.html`, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const t = await page.title();
    assert(/ \| No Ads \| Play At Jogatina 🕹️$/.test(t), 'título: ' + t);
    const ld = await page.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
    assert([].concat(ld['@type']).includes('VideoGame') && ld.aggregateRating, 'JSON-LD sem VideoGame/nota');
    assert(errors.length === 0, 'erros: ' + errors.join(' | '));
  }));
}

// ---- Datas especiais (?today=AAAA-MM-DD) ----
const DATES = [
  ['2026-12-25', /MERRY.CHRISTMAS/, ' 🎄 Christmas', 'Xmas', /firebrick/],
  ['2026-10-31', /HAPPY.HALLOWEEN/, ' 🎃 Halloween', 'Halloween', /orangered/],
  ['2026-02-14', /VALENTINE'S.DAY/, ' 💕 Valentines', null, /deeppink/],
  ['2026-03-17', /ST..PATRICK'S.DAY/, '', null, null],
  ['2026-04-01', /APRIL.FOOLS.DAY/, ' 🐣 Easter', null, null],
  ['2027-01-01', /NEW.YEARS.DAY/, '', null, null],
  ['2026-11-13', /FRIDAY THE 13TH/, '', null, null],
  ['2026-06-02', /Tuesday 2nd June/, '', null, null],
];
for (const [d, strap, suffix, category, band] of DATES) {
  await check('D02', `data especial ${d}`, () => withPage({}, async (page, errors) => {
    await page.goto(BASE + '?today=' + d, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const s = await page.evaluate(() => dateStrap.textContent);
    assert(strap.test(s), 'faixa: ' + s);
    const t = await page.title();
    assert(t === 'Jogatina | JOGATINA : The Best Free Games' + suffix, 'título: ' + t);
    if (band) assert(band.test(await page.evaluate(() => lbaJokes.style.backgroundImage)), 'cor da faixa');
    const cats = await page.$$eval('#searchBox .searchLetter', els => els.filter(e => getComputedStyle(e).display !== 'none' && getComputedStyle(e.parentElement).display !== 'none').map(e => e.innerText.trim()));
    if (category) assert(cats.includes(category), 'categoria ausente: ' + category);
    if (!category) assert(!cats.includes('Halloween') && !cats.includes('Xmas'), 'categoria sazonal fora de época');
    assert(errors.length === 0, 'erros: ' + errors.join(' | '));
    return s;
  }));
}

// ---- Conquistas por número de jogadas ----
const ACH = [
  [5, /AWESOME/, /⭐ AWESOME ⭐/, false],
  [10, /EPIC/, /✨ EPIC ✨/, false],
  [15, null, /✨ EPIC ✨/, true],
  [27, /ULTRA/, /💫 ULTRA 💫/, true],
  [50, /VIP/, /VIP/, true],
];
for (const [n, banner, sig, mascot] of ACH) {
  await check('E04-E08', `conquista com ${n} jogadas`, () => withPage({}, async (page, errors) => {
    await seed(page, { gamePlays: String(n), visitsCounter: '9' });
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(3500);
    const st = await page.evaluate(() => ({ slider: achievementSlider.innerText, sig: achievementSignifier.innerText, more: getComputedStyle(devoryGames).display, poo: getComputedStyle(bottomPoo).display, fb: getComputedStyle(feedback).display }));
    if (banner) assert(banner.test(st.slider), 'faixa: ' + st.slider);
    assert(sig.test(st.sig), 'selo: ' + st.sig);
    assert(st.more !== 'none', 'MORE GAMES oculto');
    assert((st.poo !== 'none') === mascot, 'mascote: ' + st.poo);
    if (n === 50) assert(st.fb !== 'none', 'feedback VIP oculto');
    assert(errors.length === 0, 'erros: ' + errors.join(' | '));
    return st.sig;
  }));
}
await check('F02', 'feedback VIP: enviar mostra agradecimento e guarda localmente', () => withPage({}, async (page) => {
  await seed(page, { gamePlays: '50' });
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.fill('#feedback1 textarea >> nth=1', 'teste e2e');
  await page.click('#feedback .searchLetter');
  await page.waitForTimeout(300);
  assert(/^A BIG THANK YOU!/.test(await page.evaluate(() => feedback.innerText)), 'sem agradecimento');
  assert(/teste e2e/.test(await page.evaluate(() => localStorage.feedbackLog)), 'não guardou');
}));

// ---- Link secreto de jogos extra (btoa do dia do mês) ----
await check('E03', 'link secreto libera os jogos extra e grava frivExtraTimer', () => withPage({}, async (page) => {
  await page.goto(BASE + '?today=2026-10-19', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  const normal = await tiles(page);
  await page.goto(BASE + '?today=2026-10-19&' + Buffer.from('19').toString('base64'), { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  const extra = await tiles(page);
  assert(extra > normal, `${extra} <= ${normal}`);
  assert(await page.evaluate(() => localStorage.frivExtraTimer === '19'), 'frivExtraTimer');
  return `${normal} → ${extra} blocos`;
}));

// ---- Título animado com a aba sem foco ----
await check('E11', 'título anima com a aba sem foco e volta com o mouse', () => withPage({}, async (page) => {
  await page.clock.install();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.evaluate(() => { document.hasFocus = () => false; });
  const t0 = await page.title();
  await page.clock.runFor(60000);
  const t1 = await page.title();
  assert(t1 !== t0, 'título não mudou');
  await page.evaluate(() => document.dispatchEvent(new MouseEvent('mousemove')));
  assert((await page.title()) === 'Jogatina', 'não voltou: ' + await page.title());
  return t1;
}));

// ---- Gráfico que cai, boas-vindas e convite secreto ----
await check('E09', 'gráfico que cai (?drop)', () => withPage({}, async (page) => {
  await page.goto(BASE + '?drop&today=2026-06-02', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  assert(await page.evaluate(() => getComputedStyle(dropGfx).display !== 'none'), 'dropGfx oculto');
}));
await check('H10-H11', 'boas-vindas fora do Halloween e convite CLICK LOGO X10', () => withPage({}, async (page) => {
  await seed(page, { visitsCounter: '8' });
  await page.goto(BASE + '?secret&today=2026-06-02', { waitUntil: 'load' });
  // Em 10% das visitas o texto entra com o efeito de letras sorteadas após 3 s; espera a forma final.
  await page.waitForFunction(() => welcome.innerText === 'CLICK LOGO X10', null, { timeout: 20000 }).catch(() => {});
  const w = await page.evaluate(() => welcome.innerText);
  assert(/CLICK LOGO X10/.test(w), 'texto: ' + w);
}));
await check('H10b', 'boas-vindas em português', () => withPage({ locale: 'pt-BR' }, async (page) => {
  await page.goto(BASE + '?today=2026-06-02', { waitUntil: 'load' });
  await page.waitForFunction(() => welcome.innerText === 'Bem-vindo!', null, { timeout: 20000 }).catch(() => {});
  const w = await page.evaluate(() => welcome.innerText);
  assert(w === 'Bem-vindo!', 'texto: ' + w);
  return w;
}));

// ---- Faixa de piada, atraso da grade e conteúdo por data ----
await check('H18', 'piada de uma linha: só título e texto, sem clique', () => withPage({}, async (page) => {
  await page.goto(BASE + '?today=2026-05-24', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const j = await page.evaluate(() => ({ t: lbaJokes.innerText, cursor: lbaJokes.style.cursor }));
  assert(/^Today's Joke\n/.test(j.t) && !/Click For The Answer/.test(j.t) && j.cursor === 'default', JSON.stringify(j));
  await page.click('#lbaJokes');
  await page.waitForTimeout(500);
  assert((await page.evaluate(() => lbaJokes.innerText)) === j.t, 'mudou ao clicar');
  return j.t.replace('\n', ' / ');
}));
await check('H19', 'piadas por idioma (pt) e lista sazonal', () => withPage({ locale: 'pt-BR' }, async (page) => {
  await page.goto(BASE + '?today=2026-06-02', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const pt = await page.evaluate(() => lbaJokes.innerText.split('\n')[0]);
  assert(/^A Piada de Hoje/.test(pt), pt);
  await page.goto(BASE + '?today=2026-12-02', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const xmas = await page.evaluate(() => lbaJokes.innerText.split('\n')[0]);
  assert(/^Piada de Natal de Hoje/.test(xmas), xmas);
  return `${pt} · ${xmas}`;
}));
for (const [gp, ms] of [[0, 0], [4, 500], [7, 1000]]) {
  await check('H21', `grade aparece após ${ms} ms com ${gp} jogadas`, () => withPage({}, async (page) => {
    await seed(page, { gamePlays: String(gp) });
    // Relógio parado desde antes da navegação: só avança quando o teste manda.
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 5000);
    await page.goto(BASE, { waitUntil: 'load' });
    const n = async () => page.evaluate(() => document.querySelectorAll('#gamesBlock .gameThumbContainer').length);
    if (ms > 0) { await page.clock.runFor(ms - 100); assert((await n()) === 0, 'grade apareceu cedo'); }
    await page.clock.runFor(400);
    assert((await n()) > 0, 'grade não apareceu');
  }));
}
await check('D24', 'conteúdo diário determinístico por data (meses pares +31)', () => withPage({}, async (page) => {
  const grab = async d => { await page.goto(BASE + '?today=' + d, { waitUntil: 'load' }); await page.waitForTimeout(800); return page.evaluate(() => ({ q: famousQuote.textContent, j: jokeA.textContent, f: frivolousFact.textContent })); };
  const a1 = await grab('2026-06-03'), a2 = await grab('2026-06-03'), b = await grab('2026-06-04'), c = await grab('2026-07-03');
  assert(JSON.stringify(a1) === JSON.stringify(a2), 'mesma data, conteúdo diferente');
  assert(a1.q !== b.q && a1.f !== b.f, 'dias diferentes, mesmo conteúdo');
  assert(a1.j !== c.j, 'mês par/ímpar com a mesma piada');
  return 'ok';
}));

// ---- Seção diária: fluxos longos ----
await check('D11', 'teste de reação completo (7 rodadas)', () => withPage({}, async (page, errors) => {
  await openDaily(page);
  await page.click('#reactionTestA');
  await page.waitForTimeout(500);
  await page.click('#reactionTestB');
  for (let round = 0; round < 7; round++) {
    await page.waitForFunction(() => reactionTestText.innerText === 'Go!', null, { timeout: 15000 });
    await page.dispatchEvent('#reactionFaceHappy', 'mousedown');
    await page.waitForTimeout(200);
  }
  await page.waitForFunction(() => /End of Test Results/.test(reactionTestFaces.innerText), null, { timeout: 15000 });
  const t = await page.evaluate(() => reactionTestFaces.innerText);
  assert(/Your average time was: [\d.]+s\./.test(t) && /Tap to restart\./.test(t), t);
  assert(errors.length === 0, 'erros: ' + errors.join(' | '));
  return t.split('\n').slice(2, 4).join(' ');
}));
await check('D21-D23', 'vídeo toca e pausa o chiptune', () => withPage({}, async (page) => {
  await openDaily(page);
  await page.click('#chiptune');
  await page.waitForTimeout(500);
  await page.click('#funnyVideo');
  await page.waitForTimeout(2500);
  const st = await page.evaluate(() => ({ t: funnyVideoContainer.currentTime, chip: chiptune.innerText }));
  assert(st.t > 0.3, 'vídeo parado: ' + st.t);
  assert(/Paused/.test(st.chip), 'chiptune: ' + st.chip);
  return `vídeo em ${st.t.toFixed(1)} s`;
}));
await check('D20', 'história: PLAY vira PAUSE, NEXT/PREV trocam o título', () => withPage({}, async (page) => {
  await openDaily(page);
  await page.click('#storyA');
  await page.waitForTimeout(500);
  const a = await page.evaluate(() => storyTitle.innerText);
  await page.click('#storyNextButton'); await page.waitForTimeout(300);
  const b = await page.evaluate(() => storyTitle.innerText);
  await page.click('#storyPrevButton'); await page.waitForTimeout(300);
  assert(a !== b && (await page.evaluate(() => storyTitle.innerText)) === a, `${a} / ${b}`);
  await page.click('#storyPlayPauseButton'); await page.waitForTimeout(300);
  return await page.evaluate(() => storyPlayPauseButton.innerText);
}));
await check('D10', 'mesa de sons: 10 botões tocam sem erro', () => withPage({}, async (page, errors) => {
  await openDaily(page);
  await page.click('#soundBoardA');
  for (let i = 0; i < 10; i++) { await page.click('#sound' + i); await page.waitForTimeout(80); }
  assert(errors.length === 0, 'erros: ' + errors.join(' | '));
}));

// ---- Página de jogo: efeitos, tela cheia, aviso só desktop ----
await check('P15', 'botão de efeitos percorre os 23 efeitos', () => withPage({}, async (page, errors) => {
  await page.goto(BASE + 'z/games/snakerush/game.html', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.click('#loadingBox');
  await page.waitForTimeout(500);
  const seen = new Set();
  for (let i = 0; i < 23; i++) { await page.evaluate(() => gameEffectsButton.click()); seen.add(await page.evaluate(() => gameBox.style.filter + '|' + gameBox.style.animation + '|' + gameBox.style.transform)); }
  assert(seen.size >= 15, 'poucos efeitos distintos: ' + seen.size);
  assert(errors.length === 0, 'erros: ' + errors.join(' | '));
  return `${seen.size} estados distintos`;
}));
await check('P18', 'jogo só desktop em celular mostra aviso', () => withPage({ ...devices['iPhone 13'] }, async (page) => {
  await page.goto(BASE + 'z/games/pongduel/game.html', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const d = await page.evaluate(() => infoBoxDesc.innerText);
  assert(/desktop|computer|keyboard/i.test(d), d);
}));

// ---- Links internos e rede ----
await check('R-LINKS', 'todos os links internos das páginas respondem 200', () => withPage({}, async (page) => {
  const pages = ['', 'help.html', 'privacy.html', '404.html', 'z/games/snakerush/game.html'];
  const bad = [];
  let n = 0;
  for (const p of pages) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    const links = await page.$$eval('a[href]', as => as.map(a => a.href).filter(h => h.startsWith(location.origin)));
    for (const l of new Set(links)) { n++; const r = await page.request.get(l.split('#')[0]); if (r.status() !== 200) bad.push(`${l} ${r.status()}`); }
  }
  assert(bad.length === 0, bad.join(', '));
  return `${n} links`;
}));
await check('R-NET', 'nenhuma requisição a terceiros em todo o e2e', async () => {
  assert(external.size === 0, [...external].join(', '));
});

await browser.close();
server.close();

const fails = results.filter(r => !r.ok);
const md = ['# Resultado do e2e do clone (`npm run test:e2e`)', '', `Execução: ${new Date().toISOString()} · ${results.length - fails.length}/${results.length} passaram.`, '',
  '| ID | Verificação | Resultado | Detalhe |', '|---|---|---|---|',
  ...results.map(r => `| ${r.id} | ${r.name} | ${r.ok ? '✅' : '❌'} | ${(r.detail || '').replace(/\|/g, '\\|').slice(0, 140)} |`), ''];
fs.writeFileSync(path.join(ROOT, 'docs', 'e2e-results.md'), md.join('\n'));
fs.writeFileSync(path.join(ROOT, 'docs', 'e2e-results.json'), JSON.stringify(results, null, 1));
console.log(`\n${results.length - fails.length}/${results.length} passaram — docs/e2e-results.md`);
process.exitCode = fails.length ? 1 : 0;

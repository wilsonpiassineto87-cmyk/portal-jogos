// Sondas de paridade: cada cenário roda igual nos dois sites e grava observações por ID do inventário (docs/features.md).
// As observações são reduzidas à forma (padrões, contagens, rótulos de interface) para que conteúdo próprio
// do clone (nomes de jogos, piadas, imagens) não conte como diferença, mas qualquer mudança de comportamento conte.

const BRAND_RE = /Friv®|FRIV\.COM|Friv|FRIV|friv\.com|Jogatina|JOGATINA|jogatina\.local/g;
export function normalize(v) {
  if (typeof v === 'string') return v.replace(BRAND_RE, 'BRAND');
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, normalize(x)]));
  return v;
}

// mode: 'eq' (igual após normalizar) · 'excluded' (fora do escopo, registrado mas não comparado)
export const PROBES = [
  ['H01', 'título da aba (sufixo sazonal)'], ['H02', 'metadados (theme-color, viewport, OG, Twitter, canonical, JSON-LD)'],
  ['H03', 'favicons e manifest'], ['H05', 'fundo inicial do body'], ['H06', 'área do logo (altura, gradiente)'],
  ['H07', 'logo: rotação e cursor'], ['H10', 'boas-vindas some no Halloween'], ['H12', 'botão de busca no canto superior direito'],
  ['H13', 'seletor de cor presente'], ['H15', 'barra -ADVERTISEMENT- e bloco de anúncio', 'excluded', 'sem anúncios no clone; o original oculta as barras quando o script de anúncio não carrega'],
  ['H16', 'gradiente da barra de piada (Halloween)'], ['H17', 'piada: rótulo, clique revela resposta e muda o rótulo'],
  ['H20', 'texto LOADING GAMES'], ['H23', 'menu de contexto bloqueado'], ['IDS', 'IDs de elementos da home usados pelos scripts', 'eq', 'exceto áudio sintetizado e promoções de terceiros'],
  ['G01', 'bloco de jogo: tamanho, borda, cantos'], ['G02', 'blocos por linha (1366 px)'], ['G03', 'cores de carregamento (classes)'],
  ['G05', 'nome do jogo: cor e posição'], ['G06', 'animação de entrada do nome'], ['G07', 'brilho em todo bloco'],
  ['G11', 'link do bloco: z/games/<slug>/game.html'], ['G12', 'selo NEW presente'], ['G13', 'selo de Halloween presente'],
  ['G15', 'ordem inicial: top 10 por popularidade embaralhados, resto por popularidade'], ['G16', 'ordem alfabética após busca'],
  ['G21', 'botões secretos após o último jogo'], ['S01', 'abrir busca: painel cheio #306'], ['S02', 'botões de letra'],
  ['S03', 'botões de categoria (desktop, Halloween)'], ['S05', 'busca por letra: mensagem e contagem'], ['S06', 'busca 0-9'],
  ['S07', 'busca por categoria'], ['S08', 'rótulos especiais (2 Player, New)'], ['S09', 'todos os jogos A-Z'],
  ['S10', 'busca sem resultado'], ['S11', 'após buscar: painel fecha e rola até o logo'], ['S12', 'categoria Dressup'],
  ['C01', 'seletor de cor: sorteio e localStorage'], ['C02', 'cor persiste ao recarregar'], ['C03', '10º clique volta a indigo/navy'],
  ['E02', 'logo ×10: HACK, mais jogos, MORE GAMES'], ['E13', 'Enter soma gamePlays'], ['E15', 'linha de diagnóstico do rodapé'],
  ['LS', 'chaves do localStorage após a 1ª visita'], ['D01', 'cabeçalho da seção diária'], ['D-LABELS', 'rótulos iniciais das 18 seções diárias'],
  ['D04', 'chiptune: rótulos tocar/pausar'], ['D06', 'quebra-cabeça: mensagem e toques'], ['D08', 'GIFs: rótulos'],
  ['D09', 'piada do dia: revela resposta'], ['D11', 'teste de reação: instruções e rodada'], ['D15', 'teste do amor: fluxo completo'],
  ['D16', 'charada: ciclo de dificuldade'], ['D17', 'limerique abre'], ['D18', 'ilusão de ótica: sequência de transformações'],
  ['D19', 'trava-língua'], ['D20', 'história: controles e info'], ['D22', 'votação vira ✅'],
  ['F01', 'descrição do site'], ['F02', 'feedback oculto'], ['F03', 'faixas arco-íris'], ['F04', 'copyright', 'eq', 'o clone não declara marca registrada'], ['F05', 'links do rodapé'],
  ['P01', 'título da página de jogo'], ['P03', 'spinner com tamanho em MB'], ['P03b', 'spinner: animação some após N s'], ['P04', 'barra de carga'], ['P05', 'botão Play após N s'],
  ['P10', 'estrelas da nota'], ['P11', 'título refeito aos 22 s (contado do carregamento do script)'], ['P12', 'clique: sobreposição some, iframe carrega'],
  ['P14', 'botão voltar leva à home'], ['P15', 'botão de efeitos segue a flag do jogo'], ['P19', '+1 gamePlays após 100 s'],
  ['P21', 'menu de contexto bloqueado na página de jogo'],
  ['M-G02', 'celular: 1 bloco por linha'], ['M-H22', 'celular: SCROLL TO PLAY na 1ª visita'], ['M-G14', 'celular: ícone de orientação'],
  ['M-S04', 'celular: categorias condicionais'], ['M-P09', 'celular: controles ocultos na página de jogo'],
  ['R01', 'ajuda: âncoras'], ['R03', 'useralert'], ['R05', 'play.html sem parâmetro'], ['R06', 'new.html redireciona'],
  ['R05b', 'play.html com nome/URL/aviso PG'], ['PT', 'navegador pt-BR: blocos em inglês ocultos, teste do amor traduzido'], ['R07', '404'], ['R08', 'cabeçalhos de cache'], ['R09', 'robots/sitemap/manifest'],
].map(([id, name, mode = 'eq', note]) => ({ id, name, mode, note }));

const wait = (page, ms) => page.waitForTimeout(ms);
const text = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.trim() : null; }, sel);
const shape = s => (s == null ? s : s.replace(/\d+/g, 'N').replace(/^(N .*?)games? found/, '$1game(s) found'));
const tiles = page => page.$$eval('#gamesBlock > div[class*=gameThumbContainer]', els => els.length);

// Lê a grade e a regra de ordenação a partir do array global `games` (mesmo formato nos dois sites).
const GRID_RULE = () => {
  const hrefs = [...document.querySelectorAll('#gamesBlock > div[class*=gameThumbContainer] a')].map(a => a.getAttribute('href'));
  const byPath = new Map(games.map(g => [g[1] + '.html', g]));
  const shown = hrefs.map(h => byPath.get(h)).filter(Boolean);
  if (shown.length < 12) return { ok: false, why: 'poucos blocos', n: shown.length };
  const pops = shown.map(g => g[8]);
  const sorted = [...pops].sort((a, b) => a - b);
  const top = [...pops.slice(0, 10)].sort((a, b) => a - b);
  return {
    top10AreLowestPop: JSON.stringify(top) === JSON.stringify(sorted.slice(0, 10)),
    restSortedByPop: pops.slice(10).every((p, i, a) => i === 0 || a[i - 1] <= p),
    allShownMatchGames: shown.length === hrefs.length,
  };
};

async function search(page, label) {
  await page.evaluate(() => showSearchBox());
  await wait(page, 400);
  await page.locator('#searchBox .searchLetter', { hasText: new RegExp('^' + label.replace(/-/g, '\\-') + '$') }).first().click();
  await wait(page, 1500);
  return { msg: await text(page, '#headerSearchResult'), tiles: await tiles(page) };
}
const countOk = r => { const m = /^(\d+)|: (\d+)\.$/.exec(r.msg || ''); return { shape: shape(r.msg), countMatchesTiles: !!m && Number(m[1] || m[2]) === r.tiles }; };

export const SCENARIOS = [
  {
    name: 'home (desktop 1366×768)',
    async run({ page, base, set, shot }) {
      await page.goto(base, { waitUntil: 'load', timeout: 90000 });
      await wait(page, 6000);
      await shot('home');
      set('H01', (await page.title()));
      set('H02', await page.evaluate(() => {
        const m = n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`);
        const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { return JSON.parse(s.textContent)['@type']; } catch { return 'invalid'; } });
        return { theme: m('theme-color')?.content, viewport: m('viewport')?.content, og: !!m('og:title') && !!m('og:image'), twitter: !!m('twitter:card'), canonical: !!document.querySelector('link[rel=canonical]'), ld };
      }));
      set('H03', await page.evaluate(() => ({ svg: !!document.querySelector('link[rel=icon][type="image/svg+xml"]'), png: document.querySelectorAll('link[rel=icon][type="image/png"]').length > 0, apple: !!document.querySelector('link[rel=apple-touch-icon]'), mask: !!document.querySelector('link[rel=mask-icon]'), manifest: !!document.querySelector('link[rel=manifest]') })));
      set('H05', await page.evaluate(() => getComputedStyle(document.body).backgroundImage));
      set('H06', await page.evaluate(() => { const s = getComputedStyle(logoContainer); return { hOverVw: Math.round(logoContainer.offsetHeight / innerWidth * 100), capVh: Math.round(Math.min(innerWidth * 0.6, innerHeight * 0.54)) === logoContainer.offsetHeight, bg: s.backgroundImage.slice(0, 40) }; }));
      set('H07', await page.evaluate(() => { const s = getComputedStyle(logo); return { cursor: s.cursor, rotate: /rotate\(-2deg\)/.test(logo.getAttribute('style') || '') || s.transform !== 'none' }; }));
      set('H10', await page.evaluate(() => getComputedStyle(welcome).display));
      set('H12', await page.evaluate(() => { const r = searchButton.getBoundingClientRect(); return { nearRight: innerWidth - r.right < 60, nearTop: r.top < 60 }; }));
      set('H13', await page.evaluate(() => !!document.getElementById('colourSelector')));
      set('H15', await page.evaluate(() => getComputedStyle(lbaTop).display));
      set('H16', await page.evaluate(() => getComputedStyle(lbaJokes).backgroundImage));
      const j1 = await text(page, '#lbaJokes');
      await page.click('#lbaJokes');
      await wait(page, 5000);
      const j2 = await text(page, '#lbaJokes');
      set('H17', { label: j1.split('\n')[0], after: j2.split('\n')[0], grew: j2.length > j1.length - j1.split('\n')[0].length + 10 });
      set('H20', await text(page, '#loadingGamesExpander'));
      set('H23', await page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.body.dispatchEvent(e); return e.defaultPrevented; }));
      set('IDS', await page.evaluate(() => [...document.querySelectorAll('[id]')].map(e => e.id).sort()));
      set('G01', await page.evaluate(() => { const t = document.querySelector('#gamesBlock .gameThumbContainer'), s = getComputedStyle(t); return { w: t.offsetWidth, h: t.offsetHeight, border: s.borderTopStyle + ' ' + s.borderTopWidth, radius: s.borderRadius }; }));
      set('G02', await page.evaluate(() => { const t = [...document.querySelectorAll('#gamesBlock .gameThumbContainer')]; return t.filter(x => x.offsetTop === t[0].offsetTop).length; }));
      set('G03', await page.evaluate(() => [...new Set([...document.querySelectorAll('#gamesBlock [class*=gameThumbLoading]')].map(e => e.className.match(/gameThumbLoading\d/)[0]))].sort()));
      set('G05', await page.evaluate(() => { const t = document.querySelector('#gamesBlock .gameTitle'), s = getComputedStyle(t); return { color: s.color, position: s.position, top: s.top, left: s.left }; }));
      set('G06', await page.evaluate(() => document.querySelector('#gamesBlock .gameTitle').style.animationName));
      set('G07', await page.evaluate(() => document.querySelectorAll('#gamesBlock .gameThumbShine').length === document.querySelectorAll('#gamesBlock .gameThumbContainer').length));
      set('G11', await page.evaluate(() => [...document.querySelectorAll('#gamesBlock .gameThumbContainer a')].every(a => /^z\/games\/[a-z0-9]+\/game\.html$/.test(a.getAttribute('href')))));
      set('G12', await page.evaluate(() => document.querySelectorAll('#gamesBlock .newIcon').length > 0));
      set('G13', await page.evaluate(() => document.querySelectorAll('#gamesBlock .halloweenIcon').length > 0));
      set('G15', await page.evaluate(GRID_RULE));
      set('G21', await page.evaluate(() => !!document.getElementById('secretButton') && !!document.getElementById('secretButton2')));
      set('E15', await page.evaluate(() => { const t = (document.getElementById('dBugText') || {}).innerText || ''; return { shape: /^Desktop ds:fst sw:\d+ sh:\d+ sr:[\d.]+ plt:\d+ scl:(true|false) rnd:\d+ gfx:\d+\|\d pv:1 gp:0 du:0 V/.test(t) }; }));
      set('LS', await page.evaluate(() => Object.keys(localStorage).filter(k => !/^google|^__|^goog/.test(k)).sort()));
      // Rodapé
      await page.locator('#footerSection').scrollIntoViewIfNeeded();
      await wait(page, 800);
      set('F01', await text(page, '#siteDescription'));
      set('F02', await page.evaluate(() => getComputedStyle(feedback).display));
      set('F03', await page.evaluate(() => document.querySelectorAll('.hueBlock').length));
      set('F04', shape((await text(page, '#copyright')).split('\n')[0]).replace(/ is a Registered Trademark\./, '.'));
      set('F05', await page.evaluate(() => [...document.querySelectorAll('#copyright a')].map(a => a.getAttribute('href')).filter(h => /privacy|help/.test(h))));
    },
  },
  {
    name: 'busca',
    async run({ page, base, set, shot }) {
      await page.goto(base, { waitUntil: 'load', timeout: 90000 });
      await wait(page, 5000);
      await page.click('#searchButton');
      await wait(page, 900);
      await shot('search-open');
      set('S01', await page.evaluate(() => ({ display: getComputedStyle(searchBoxContainer).display, bg: getComputedStyle(searchBoxContainer).backgroundColor, result: searchResultText.innerText.trim() })));
      const labels = await page.$$eval('#searchBox .searchLetter', els => els.filter(e => e.offsetParent !== null).map(e => e.innerText.trim()));
      set('S02', labels.filter(l => /^[A-Z]$|^0-9$/.test(l)));
      set('S03', labels.filter(l => !/^[A-Z]$|^0-9$/.test(l)));
      const c = await search(page, 'C');
      set('S05', countOk(c));
      set('S11', await page.evaluate(() => ({ panelHidden: getComputedStyle(searchBoxContainer).display === 'none', nearLogo: Math.abs(scrollY - logoContainer.offsetTop) < 120 })));
      set('S06', countOk(await search(page, '0-9')));
      set('S07', countOk(await search(page, 'Puzzle')));
      const p2 = await search(page, '2 Player'), nw = await search(page, 'New');
      set('S08', [countOk(p2), countOk(nw)]);
      const all = await search(page, 'All Games A-Z');
      set('S09', countOk(all));
      set('G16', await page.evaluate(() => { const byPath = new Map(games.map(g => [g[1] + '.html', g[0]])); const n = [...document.querySelectorAll('#gamesBlock .gameThumbContainer a')].map(a => byPath.get(a.getAttribute('href'))).filter(Boolean).map(x => String(x).toLowerCase()); return n.length > 5 && n.every((x, i) => i === 0 || n[i - 1] <= x); }));
      let none = null;
      for (const L of 'XZQJYVUKIOWE') {
        await page.evaluate(l => displayGames('*', l), L);
        await wait(page, 300);
        const msg = await text(page, '#headerSearchResult');
        if (/^Sorry/.test(msg || '')) { none = { msg, tiles: await tiles(page) }; break; }
      }
      set('S10', none);
      const d = await search(page, 'Dressup');
      set('S12', countOk(d));
    },
  },
  {
    name: 'seletor de cor',
    async run({ page, base, set }) {
      await page.goto(base, { waitUntil: 'load', timeout: 90000 });
      await wait(page, 4000);
      await page.click('#colourSelector');
      await wait(page, 400);
      const bg = await page.evaluate(() => document.body.style.background);
      const ls = await page.evaluate(() => [localStorage.niceColour1, localStorage.niceColour2]);
      set('C01', { gradient: /^linear-gradient\([a-zA-Z]+, [a-zA-Z]+\)$/.test(bg), saved: bg.toLowerCase() === `linear-gradient(${ls[0]}, ${ls[1]})`.toLowerCase() });
      await page.reload({ waitUntil: 'load' });
      await wait(page, 3000);
      set('C02', (await page.evaluate(() => document.body.style.background)).toLowerCase() === bg.toLowerCase());
      for (let i = 0; i < 10; i++) { await page.click('#colourSelector'); await wait(page, 150); }
      set('C03', await page.evaluate(() => document.body.style.background));
    },
  },
  {
    name: 'easter eggs (logo ×10, Enter)',
    async run({ page, base, set, shot }) {
      await page.goto(base, { waitUntil: 'load', timeout: 90000 });
      await wait(page, 5000);
      const before = await tiles(page);
      for (let i = 0; i < 10; i++) { await page.click('#logo', { force: true }); await wait(page, 150); }
      await wait(page, 2500);
      await shot('logo-x10');
      set('E02', { title: await page.title(), moreTiles: (await tiles(page)) > before, moreGames: await page.evaluate(() => getComputedStyle(devoryGames).display !== 'none' && /MORE GAMES/.test(devoryGames.innerText)) });
      const gp0 = await page.evaluate(() => Number(localStorage.gamePlays));
      await page.keyboard.press('Enter');
      await wait(page, 300);
      set('E13', (await page.evaluate(() => Number(localStorage.gamePlays))) - gp0);
    },
  },
  {
    name: 'seção diária',
    async run({ page, base, set, shot }) {
      await page.goto(base, { waitUntil: 'load', timeout: 90000 });
      await wait(page, 4000);
      await page.locator('#frivDaily').scrollIntoViewIfNeeded();
      await wait(page, 1500);
      await shot('daily');
      set('D01', await text(page, '#dateStrap'));
      const ids = ['famousQuote', 'jokeA', 'frivolousFact', 'riddleA', 'limerickA', 'tongueTwisterA', 'chiptune', 'cutePicture', 'amazingPicture', 'streetArt', 'dailyGIF', 'opticalIllusion', 'funnyVideo', 'puzzle', 'soundBoardA', 'storyA', 'reactionTestA', 'loveTesterA'];
      const lab = {};
      for (const id of ids) lab[id] = ((await text(page, '#' + id)) || '').split('\n')[0];
      set('D-LABELS', lab);
      const click = async (sel, read, ms = 900) => { await page.click(sel); await wait(page, ms); return text(page, read); };
      const c1 = await click('#chiptune', '#chiptune'), c2 = await click('#chiptune', '#chiptune');
      set('D04', [c1, c2]);
      const g1 = await click('#dailyGIF', '#dailyGIF');
      set('D08', { label: g1, message: shape(await text(page, '#GIFMessage')) });
      const pz = await click('#puzzle', '#puzzleMessage');
      set('D06', { message: pz.replace(/these \d+ [^.]+\./, 'these N X.'), visibleAfterOpen: await page.evaluate(() => getComputedStyle(puzzleImage).display !== 'none') });
      await shot('daily-puzzle');
      const jb = await click('#jokeB', '#jokeB');
      set('D09', { answered: !!jb && jb !== 'Tap For The Answer!' });
      await page.click('#riddleB'); await wait(page, 500);
      const diffs = [];
      for (let i = 0; i < 3; i++) { await page.click('#riddleChangeDifficulty'); await wait(page, 600); diffs.push(((await text(page, '#riddleA')) || '').split('\n\n')[0].replace(/\n/g, ' ')); }
      set('D16', diffs);
      set('D17', !!(await click('#limerickA', '#limerickB')));
      set('D19', ((await click('#tongueTwisterA', '#tongueTwisterB')) || '').includes('Say it several times quickly!'));
      const o1 = await click('#opticalIllusion', '#opticalIllusionMessage');
      const tf = [];
      for (let i = 0; i < 5; i++) { await page.click('#opticalIllusionImage', { force: true }); await wait(page, 300); tf.push(await page.evaluate(() => opticalIllusionImage.style.transform || getComputedStyle(opticalIllusionMessage).display)); }
      set('D18', { message: /tap the image to flip it and rotate it\.\n\nTap to close\.$/.test(o1), transforms: tf });
      const st = await click('#storyA', '#storyB');
      await page.click('#storyInfoButton'); await wait(page, 600);
      set('D20', { controls: /PREV PLAY NEXT$/.test(st), meta: /\| Length: .+\n\nFor ages \d\+\. Read by /.test(st), info: /^"If you want your children to be intelligent, read them fairy tales/.test(await text(page, '#storyD') || '') });
      const r1 = await click('#reactionTestA', '#reactionTestB');
      await page.click('#reactionTestB'); await wait(page, 200);
      set('D11', { instructions: r1, afterStart: await text(page, '#reactionTestText') });
      await shot('daily-reaction');
      await page.click('#famousQuoteBottomBar .voteThumb >> nth=0').catch(() => {});
      await wait(page, 300);
      set('D22', await text(page, '#famousQuoteBottomBar'));
      // Teste do amor
      await page.click('#loveTesterA'); await wait(page, 1200);
      const intro = await text(page, '#loveTesterB');
      const ph = await page.evaluate(() => [firstNameBox.placeholder, secondNameBox.placeholder, firstNameBox.maxLength, secondNameBox.maxLength, calcButton.innerText]);
      await page.fill('#firstNameBox', 'A1'); await page.fill('#secondNameBox', 'Bob'); await page.click('#calcButton'); await wait(page, 200);
      const invalid = await text(page, '#calcButton');
      await wait(page, 1200);
      await page.fill('#firstNameBox', 'Ana'); await page.fill('#secondNameBox', 'Bruno'); await page.click('#calcButton');
      await wait(page, 1500);
      const anim = await page.evaluate(() => /^[01]+$/.test((document.getElementById('onesAndZeros') || {}).innerText || ''));
      await wait(page, 3500);
      await shot('daily-love');
      const res = await text(page, '#loveTesterB');
      set('D15', { intro, ph, invalid, anim, result: res });
    },
  },
  {
    name: 'página de jogo (relógio controlado)',
    async run({ page, base, set, shot, target }) {
      const gpath = target === 'ref' ? 'z/games/chess/game.html' : 'z/games/tictactoeduel/game.html';
      await page.clock.install();
      await page.goto(base + gpath, { waitUntil: 'load', timeout: 90000 });
      // Pausa o relógio e avança até instantes exatos contados desde o início da navegação (performance.now também é simulado).
      await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
      const runTo = async ms => { const now = await page.evaluate(() => performance.now()); if (ms > now) await page.clock.runFor(Math.round(ms - now)); };
      await runTo(1000);
      set('P01', (await page.title()).replace(/^.+? \| No Ads/, 'GAME | No Ads'));
      set('P03', await page.evaluate(() => ({ spinnerVisible: getComputedStyle(spinnerContainer).display !== 'none', mb: /^\d+MB$/.test(gameMB.innerText.trim()) })).catch(e => 'ERR ' + e.message));
      // Os tempos do spinner, do botão Play e da barra são animações CSS com atraso; compara o contrato (nomes, duração, atraso).
      const anim = await page.evaluate(() => ({ spinner: spinner.style.animation, play: playButton.style.animation, bar: infoBoxLoadingBar.style.animation }));
      set('P04', anim.bar);
      set('P05', anim.play);
      set('P03b', anim.spinner);
      set('P10', await page.evaluate(() => /^\d\.\d★★★★★$/.test(userStarRating.innerText.replace(/\s/g, ''))));
      set('P15', await page.evaluate(() => getComputedStyle(gameEffectsButton).display === 'none' ? 'hidden' : 'shown'));
      set('P21', await page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.body.dispatchEvent(e); return e.defaultPrevented; }));
      const tBefore = await page.evaluate(() => infoBoxTitle.innerText);
      await page.evaluate(() => { window.__titleWrites = 0; new MutationObserver(() => { window.__titleWrites++; }).observe(infoBoxTitle, { childList: true, characterData: true, subtree: true }); });
      await runTo(21900);
      const writesBefore = await page.evaluate(() => window.__titleWrites);
      await runTo(24000);
      const writesAfter = await page.evaluate(() => window.__titleWrites);
      await runTo(40000);
      set('P11', { unchangedBefore22s: writesBefore === 0, rewrittenBy24s: writesAfter > 0, restored: (await page.evaluate(() => infoBoxTitle.innerText)) === tBefore });
      await shot('game-ready');
      await page.click('#loadingBox');
      await runTo(41500);
      set('P12', await page.evaluate(() => ({ overlay: getComputedStyle(loadingOverlay).display, iframe: !!gameBox.getAttribute('src') })));
      const gp0 = await page.evaluate(() => Number(localStorage.gamePlays || 0));
      await runTo(99000);
      const at95 = (await page.evaluate(() => Number(localStorage.gamePlays || 0))) - gp0;
      await runTo(102500);
      set('P19', { at99s: at95, at101s: (await page.evaluate(() => Number(localStorage.gamePlays || 0))) - gp0 });
      await page.evaluate(() => backButton.click());
      await page.waitForLoadState('load').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      set('P14', new URL(page.url()).pathname);
    },
  },
  {
    name: 'celular (iPhone 13)',
    device: 'iPhone 13',
    async run({ page, base, set, shot, target }) {
      await page.goto(base, { waitUntil: 'load', timeout: 90000 });
      await wait(page, 5000);
      await shot('mobile-home');
      set('M-H22', await page.evaluate(() => { const e = document.getElementById('scrollToPlay'); return e ? { text: e.innerText.trim(), shown: getComputedStyle(e).display !== 'none' } : null; }));
      for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, 120); await wait(page, 120); }
      await wait(page, 1500);
      set('M-G02', await page.evaluate(() => { const t = [...document.querySelectorAll('#gamesBlock .gameThumbContainer')]; return t.length ? t.filter(x => x.offsetTop === t[0].offsetTop).length : 0; }));
      set('M-G14', await page.evaluate(() => document.querySelectorAll('#gamesBlock .gameThumbOrientationLandscape, #gamesBlock .gameThumbOrientationPortrait').length > 0));
      await page.evaluate(() => showSearchBox());
      await wait(page, 500);
      const labels = await page.$$eval('#searchBox .searchLetter', els => els.filter(e => e.offsetParent !== null).map(e => e.innerText.trim()));
      set('M-S04', { landscape: labels.includes('Landscape'), portrait: labels.includes('Portrait'), jobs: labels.includes('Jobs'), platform: labels.includes('Platform'), halloween: labels.includes('Halloween') });
      const gpath = target === 'ref' ? 'z/games/chess/game.html' : 'z/games/tictactoeduel/game.html';
      await page.goto(base + gpath, { waitUntil: 'load' });
      await wait(page, 2000);
      set('M-P09', await page.evaluate(() => { const c = document.querySelector('#infoBoxControls'); return c ? getComputedStyle(c).display : 'absent'; }));
    },
  },
  {
    name: 'navegador pt-BR',
    locale: 'pt-BR',
    async run({ page, base, set }) {
      await page.goto(base, { waitUntil: 'load', timeout: 90000 });
      await wait(page, 4000);
      const vis = await page.evaluate(() => Object.fromEntries(['famousQuote', 'frivolousFact', 'jokeA', 'riddleA', 'limerickA', 'tongueTwisterA', 'storyA', 'chiptune', 'reactionTestA', 'loveTesterA', 'opticalIllusion'].map(id => [id, getComputedStyle(document.getElementById(id)).display !== 'none'])));
      set('PT', { vis });
      await page.evaluate(() => showLoveTester()); await wait(page, 1200);
      const love = await page.evaluate(() => [calcButton.innerText, firstNameBox.placeholder, secondNameBox.placeholder, getComputedStyle(testInfoButton).display]);
      set('PT', { vis, love });
    },
  },
  {
    name: 'páginas secundárias e HTTP',
    async run({ page, base, set }) {
      await page.goto(base + 'help.html', { waitUntil: 'load' });
      set('R01', await page.evaluate(() => ['about', 'faqs', 'fakes', 'oldfriv'].map(a => !!document.getElementById(a) || !!document.querySelector(`[name="${a}"]`))));
      await page.goto(base + 'useralert.html', { waitUntil: 'domcontentloaded' });
      set('R03', ((await text(page, 'body')) || '').split('\n')[0]);
      await page.goto(base + 'play.html', { waitUntil: 'load' });
      await wait(page, 1000);
      set('R05', await page.evaluate(() => [...document.body.querySelectorAll('div')].filter(e => getComputedStyle(e).display !== 'none' && e.innerText.trim()).map(e => e.innerText.trim())));
      await page.goto(base + 'play.html?' + Buffer.from('Test-Game').toString('base64') + ',https://example.com/,!pg', { waitUntil: 'load' });
      await wait(page, 500);
      set('R05b', { title: await page.title(), footer: await text(page, '#gameFooterText'), bottom: await text(page, '#bottom') });
      await page.goto(base + 'new.html', { waitUntil: 'load' });
      await wait(page, 2500);
      set('R06', new URL(page.url()).pathname);
      const r404 = await page.goto(base + 'nonexistent-page-xyz.html');
      set('R07', { status: r404.status(), text: ((await text(page, 'body')) || '').split('\n')[0].replace(/at .+!$/, 'at SITE!') });
      // Requisições feitas de dentro da página (mesma origem), para passar pelo mesmo caminho de rede do navegador.
      await page.goto(base + 'robots.txt', { waitUntil: 'load' });
      set('R08', await page.evaluate(async () => { const r = await fetch('./', { cache: 'no-store' }); return { cacheControl: r.headers.get('cache-control'), etag: !!r.headers.get('etag'), lastModified: !!r.headers.get('last-modified') }; }));
      set('R09', await page.evaluate(async () => { const st = async p => (await fetch(p, { cache: 'no-store' })).status; return { robots: await st('robots.txt'), sitemap: await st('sitemap.xml'), manifest: await st('site.webmanifest') }; }));
    },
  },
];

// IDs: o que importa é o clone ter todos os IDs funcionais do original (exceto anúncios/escola/terceiros).
const IGNORED_IDS = /^(google|aswift|gpt|ad|lba|consent|fc-|gtm|_|friv4School|topPromo|f4s)/i;
// Diferenças documentadas: áudio sintetizado (WebAudio/voz do sistema) no lugar de <audio>; promoções de sites de terceiros (F06).
const DOCUMENTED_IDS = ['chiptuneAudio', 'logoAudio', 'storyAudio', 'desktopPrmo', 'bottomPromoTextLink', 'promo-overlay'];
export function compareIds(ref, clone) {
  const missing = (ref || []).filter(id => !IGNORED_IDS.test(id) && !DOCUMENTED_IDS.includes(id) && !(clone || []).includes(id));
  return missing;
}

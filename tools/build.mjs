// Gera os arquivos derivados do catálogo: dados da grade, páginas de jogo, miniaturas e sitemap.
// Uso: node tools/build.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { games, moreGames } from './catalog.mjs';
import { thumbSVG } from './thumbs.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const SITE_NAME = 'Jogatina';
const BASE_URL = 'https://jogatina.local/';
const write = (rel, content) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const plain = name => name.replace(/[_~]/g, ' ');

function gameIndexHTML(g) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(plain(g.name))}</title>
<meta name="robots" content="noindex">
</head>
<body>
<script>window.GAME_CONFIG = ${JSON.stringify(g.cfg || {})};</script>
<script src="../_lib/arcade.js"></script>
<script src="../_lib/${g.engine}.js"></script>
</body>
</html>
`;
}

function gamePageHTML(g) {
  const title = plain(g.name);
  const url = `${BASE_URL}z/games/${g.slug}/game.html`;
  const image = `${BASE_URL}z/thumbs/${g.slug}360x100.svg`;
  const desc = `${g.en} Play ${title} on ${SITE_NAME}!`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['VideoGame', 'WebApplication'],
    name: title,
    author: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
    description: desc,
    url,
    image,
    applicationCategory: 'Game',
    playMode: g.tags.includes('2Player') ? 'MultiPlayer' : 'SinglePlayer',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: g.rating[0], ratingCount: g.rating[1] },
    offers: { '@type': 'Offer', category: 'free', price: 0, priceCurrency: 'USD' },
  };
  const gameObj = {
    title,
    enDescription: g.en,
    ptDescription: g.pt,
    source: 'index.html',
    walkthrough: '',
    loadingSizeMB: g.mb,
    loadingSeconds: 'auto',
    controls: g.controls,
    keys: g.keys,
    orientation: g.orientation,
    orientationAdviceRequired: false,
    showBackButton: true,
    showGameEffectsButton: !!g.effects,
    desktopOnly: !!g.desktopOnly,
    dressup: !!g.dressup,
    musicVote: !!g.musicVote,
  };
  return `<!DOCTYPE html>
<html lang="zxx" translate="no">
<head>
    <meta charset="utf-8">
    <title>${esc(title)} | No Ads | Play At ${SITE_NAME} 🕹️</title>
    <meta content="${esc(desc)}" name="description">
    <meta content="width=device-width,initial-scale=1" name="viewport">
    <link rel="canonical" href="${url}">
    <link rel="image_src" href="${image}">
    <script type="application/ld+json">
${JSON.stringify(schema, null, 4)}
    </script>
    <meta property="og:title" content="${esc(title)} | No Ads | Play At ${SITE_NAME} 🕹️">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:type" content="game">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <link href="../../../favicon.svg" rel="icon" type="image/svg+xml">
    <link href="../../assets/css/game.css" rel="stylesheet">
    <link rel="preload" href="../../assets/fonts/fredoka-latin.woff2" as="font" type="font/woff2" crossorigin>
</head>
<body>
    <div id="lcp"></div>
    <div id="debugText"></div>
    <div id="fullScreenButton" class="edgeButton" title="Full screen"></div>
    <div id="backButton" class="edgeButton" title="Back to the menu"></div>
    <div id="gameEffectsIndicator"></div>
    <div id="gameEffectsButton" class="edgeButton" title="Game effects"></div>
    <div id="walkthroughButton" class="edgeButton" title="Walkthrough"></div>
    <div id="orientationOverlay"></div>
    <div id="spare1"></div>
    <div id="spare2"></div>
    <div id="loadingOverlay">
        <div id="userStarRating"></div>
        <div id="orientationIconLandscape"></div>
        <div id="orientationIconPortrait"></div>
        <div id="loadingBox">
            <div id="spinnerContainer">
                <div id="spinner"></div>
                <div id="gameMB"></div>
                <div id="playButton"></div>
            </div>
        </div>
        <div id="infoBox">
            <div id="infoBoxLoadingBar"></div>
            <div id="infoBoxTitle" class="notranslate"></div>
            <div id="infoBoxDesc"></div>
            <div id="infoBoxControls" class="notranslate"></div>
        </div>
        <div id="promoBox"></div>
    </div>
    <div id="gameOverlay"></div>
    <iframe id="gameBox" title="gameBox" src="about:blank" allow="fullscreen; autoplay"></iframe>
    <script>
        var game = ${JSON.stringify(gameObj, null, 12).replace(/\n}$/, '\n        }')};
    </script>
    <script src="../../assets/scripts/core.js"></script>
    <script src="../../assets/scripts/game.js"></script>
</body>
</html>
`;
}

// Linha no formato da grade: [nome, caminho, caminhoIPad, caminhoIPhone, imagem, dispositivos, gêneros, data, pop×4]
const row = g => [g.name, `z/games/${g.slug}/game`, '', '', `${g.slug}360x100.svg`, g.devices, g.tags, g.date, ...g.pop];

const lists = { main: [], extra: [], halloween: [], christmas: [], dressup: [] };
for (const g of games) {
  lists[g.list].push(row(g));
  write(`z/games/${g.slug}/index.html`, gameIndexHTML(g));
  write(`z/games/${g.slug}/game.html`, gamePageHTML(g));
  write(`z/thumbs/${g.slug}360x100.svg`, thumbSVG(g));
}
const more = moreGames.map(g => {
  const full = { ...g, devices: '', date: '2026-01-01', pop: [99, 99, 99, 99], list: 'more' };
  write(`z/games/${g.slug}/index.html`, gameIndexHTML(full));
  write(`z/games/${g.slug}/game.html`, gamePageHTML({ ...full, name: g.name.replace(/ /g, '_') }));
  write(`z/thumbs/more/${g.slug}150x150.svg`, thumbSVG(full, 150, 150));
  return [g.name, `z/games/${g.slug}/game.html`, `more/${g.slug}150x150.svg`, g.pack];
});

const data = `/* Gerado por tools/build.mjs a partir de tools/catalog.mjs — não editar à mão. */
// [nome, caminho, caminhoIPad, caminhoIPhone, imagem, dispositivos, gêneros, data, pop desktop, pop android, pop ipad, pop iphone]
var games = ${JSON.stringify(lists.main, null, 0).replace(/\],\[/g, '],\n    [')};
var extraGames = ${JSON.stringify(lists.extra).replace(/\],\[/g, '],\n    [')};
var halloweenGames = ${JSON.stringify(lists.halloween).replace(/\],\[/g, '],\n    [')};
var christmasGames = ${JSON.stringify(lists.christmas).replace(/\],\[/g, '],\n    [')};
var dressupGames = ${JSON.stringify(lists.dressup).replace(/\],\[/g, '],\n    [')};
// Seção "MORE GAMES": [nome, link, imagem 150×150, pacote ('' | '!2pk' | '!3pk')]
var moreGamesList = ${JSON.stringify(more).replace(/\],\[/g, '],\n    [')};
`;
write('z/assets/scripts/games-data.js', data);

const pages = ['', 'help.html', 'privacy.html'];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `<url><loc>${BASE_URL}${p}</loc></url>`).join('\n')}
${[...games, ...moreGames].map(g => `<url><loc>${BASE_URL}z/games/${g.slug}/game.html</loc></url>`).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);
console.log(`build: ${games.length} jogos + ${moreGames.length} da seção "MORE GAMES"`);

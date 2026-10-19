# Reconhecimento técnico do alvo (Fase 1)

Coleta feita em 2026-10-19 contra `https://www.friv.com/` com curl e Chromium (Playwright 1.56),
locale `en-US`, viewport 1366×768 e mais 5 tamanhos. Período sazonal ativo no dia: **Halloween**.

## Stack detectada

| Camada | Observado |
|---|---|
| Servidor | `nginx`, HTML estático (`content-type: text/html`, `cache-control: max-age=7200, public`, `etag`, `last-modified`) |
| Front-end | JavaScript puro (sem framework, sem bundler). Toda a lógica da home está em 14 `<script>` inline (~760 KB) + CSS inline (~92 KB) |
| Página de jogo | Modelo HTML com objeto `var game = {...}` + `z/assets/scripts/game.js` (116 KB) + `z/assets/css/game.css` (42 KB) |
| Fonte | `frivFont.woff` própria (pré-carregada) |
| Terceiros | Google Analytics 4 (`G-WKK8W70CG6`, `G-Q1SE2SYDTW`), AdSense (`ca-pub-0813719552929704`), Google Funding Choices (consentimento), Google Fonts (só dentro do anúncio), reCAPTCHA/sodar (anúncio) |
| Service worker | Nenhum (`/sw.js` e `/service-worker.js` → 404) |
| Backend próprio | **Nenhum.** Não há API, XHR, fetch, WebSocket nem SSE para o domínio. Todo `POST` observado vai para domínios do Google (anúncio/analytics) |

## Rede (carga da home, 120 requisições)

- `www.friv.com` (78): documento, fonte, `consent.js`, `ads/xxx.js` (contém só `scriptsLoadable=true;` — sonda de bloqueador de anúncios),
  `jokes/zen-jokes.js` (piadas por idioma, carregado dinamicamente), `favicon.svg`, `frivIcon.png`, logo sazonal SVG, 70 miniaturas `z/thumbs/*360x100Min.png|webp` (lazy).
- Google (42): anúncios, analytics, consentimento. Nenhuma é necessária para a funcionalidade.

## Armazenamento

| Chave `localStorage` | Uso |
|---|---|
| `visitsCounter` | nº de visitas (`pageViews`); controla dicas, easter eggs, "CLICK LOGO X10" |
| `gamePlays` | jogos jogados; +1 após 100 s numa página de jogo e a cada Enter na home; libera conquistas (5/10/15/27/50) |
| `dressupCounter` | jogos de "dressup" abertos; >3 revela a categoria |
| `gfxPerformance` | benchmark de desempenho gráfico; libera jogos "FGO" e animações pesadas |
| `niceColour1`, `niceColour2` | gradiente do fundo escolhido no seletor de cor |
| `frivExtraTimer` | dia em que os "jogos extra" foram liberados |
| `randomAssignment` | sorteio 1–100 por usuário (testes A/B) |

Cookies: só os do Google (`_ga*`, `FCCDCF`, `FCNEC`). `sessionStorage` e IndexedDB: vazios.

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Home: logo, busca, seletor de cor, barras de anúncio/piada, grade de jogos, seção diária, rodapé |
| `/help.html` (`#about`, `#faqs`, `#fakes`, `#oldfriv`) | Ajuda com 5 seções |
| `/privacy.html` | Política de privacidade (25 seções) |
| `/useralert.html` | Página de "alerta de erro" com recarregamento |
| `/play.html` | Carregador de jogos externos; sem parâmetro mostra "Sorry - there was an error with this game." |
| `/new.html` | Redireciona para `/` (`meta refresh`) |
| `/z/games/<slug>/game.html` | Página de jogo (carregamento → iframe) |
| `/z/eastereggs/wireframe.html`, `/z/eastereggs/cylinders/index.html` | Easter eggs |
| qualquer outra | 404 "Error 404 - File Not Found. Click to play at friv.com!" |
| `robots.txt`, `sitemap.xml` (1188 URLs), `site.webmanifest` | SEO / PWA |

## Fatos de licença e marca encontrados nos assets

- `game.js`, linha 1: `/* This file, related code, assets, styling and indicia are Copyright (c) Friv.com - Unauthorised reproduction is prohibited. All rights reserved. */`
- Rodapé: `Copyright © 2006 - 2026. Friv is a Registered Trademark. All Rights Reserved. This is a genuine Friv site.`
- Título e metadados usam `Friv®`. As páginas de jogo declaram `author/publisher: Friv` no JSON-LD.
- Os jogos e as miniaturas são de terceiros (hospedados em `z/games/`), com origem indicada em alguns parâmetros (ex.: `bloxorz!4399.com`).

## Comportamento anti-cópia observado (não reproduzido)

`inline10.js` verifica o domínio e se a página está dentro de um iframe; fora de `friv.com` escreve uma mensagem de erro,
abre `friv.com` numa nova aba e redireciona após 6 s. Esse trecho não faz parte do comportamento funcional do portal e não foi reproduzido.

# Relatório final — engenharia reversa de friv.com e reprodução funcional (Jogatina)

## Como rodar (1 linha)

```
cd /home/user/portal-jogos && npm start      # abre em http://localhost:8080/
```

Sem dependências de npm para rodar o site (só Node ≥ 18). Os testes usam o Playwright/Chromium já instalados na máquina.

## Escopo e decisão de marca

O clone reproduz o **comportamento** do portal de referência — mesma estrutura de página, mesmos IDs de elementos, mesmos
textos de interface, mesmas regras, tempos, armazenamento e fluxos — com **marca e conteúdo próprios** (nome "Jogatina",
logo, 33 jogos, miniaturas, piadas, fatos, histórias, imagens, sons e vídeos feitos para o projeto). Nenhum arquivo do
original (código, imagens, fontes, jogos, textos de conteúdo) foi copiado para o projeto; o teste de paridade de lógica baixa
o código do original em tempo de execução para comparar, sem guardá-lo. O projeto está em `/home/user/portal-jogos`,
fora dos repositórios `jogos-ctech` e `mini-fazendinha`, que não foram alterados.

## Resultado dos testes (execução de 2026-10-19, período de Halloween)

| Conjunto | Comando | Resultado |
|---|---|---|
| Unidade (regras e servidor HTTP) | `npm test` | **11/11** |
| Paridade de lógica, diferencial contra o código do original | `npm run test:parity` (parte 1) | **13.147 casos, 0 divergências** (calendário 2025–2030 dia a dia, frase da data, teste do amor com 5.004 pares, validação de nome, frases por faixa, teste de reação, 250 combinações de busca) |
| Paridade de interface, mesmas sondas Playwright nos dois sites | `npm run test:parity` (parte 2) | **89/89 OK**, 1 excluído (barra de anúncio) |
| Ponta a ponta do clone (o que não dá para comparar ao vivo) | `npm run test:e2e` | **99/99** (33 jogos jogáveis, 33 páginas de jogo, 8 datas especiais, 5 conquistas, link secreto, título sem foco, reação completa, vídeo, história, efeitos, links, zero requisições a terceiros) |
| Matriz por item do inventário | `npm run matrix` | **143 itens: 115 automatizados, 22 conferidos por captura/código, 6 excluídos, 0 falhas** |

Arquivos: `docs/matrix.md` (uma linha por item, esperado × observado × evidência), `docs/parity-matrix.md` e
`docs/parity-results.json` (valores brutos dos dois sites), `docs/parity-logic.json`, `docs/e2e-results.md`,
capturas do clone em `docs/parity-shots/`. Tudo junto: `npm run test:all`.

### Divergências encontradas pelos testes e corrigidas

| Encontrado | Correção |
|---|---|
| Botão de efeitos aparecia em todo jogo; no original depende do jogo (`showGameEffectsButton`) | flag por jogo no catálogo |
| Aviso "Try this test on your mobile / tablet…" estava nas instruções; no original vai no resultado | movido |
| Ordem do botão "info" e texto "SHARE" no teste do amor | ordem igual e botão "TWEET" que abre a intenção de tweet |
| Teste do amor só em inglês; o original traduz os rótulos em 14 idiomas (e omite a introdução e o "info" fora do inglês) | rótulos portados como dados (`LOVE_I18N` em `core.js`) |
| Citação, fato, piada, charada, limerique, trava-língua e história apareciam para qualquer idioma; no original só para navegadores em inglês, com emojis identificadores | mesma regra + 7 emojis com os mesmos IDs |
| `useralert.html` mostrava a mensagem do "yellow box"; no original ela está comentada e a página só mostra "Reloading..." | igualado |
| `play.html` era um carregador em iframe; no original é um lançador de jogo externo (nome em base64, URL, aviso PG-13, sessão de 200 s) | reescrito com o mesmo contrato |
| Cartão Twitter/X nos metadados (o original não tem) | removido |
| `cache-control: public, max-age=7200` (o original envia `max-age=7200, public`) | igualado |
| Descrição do rodapé "Play free games…" (original "Play unblocked games…") | igualado |
| Lista global `games` não recebia os jogos sazonais (o original faz `unshift`) | igualado |
| Elementos auxiliares ausentes (`topDailyJoke`, `dBugBlinker`, `imagePreloadHappy/Sad`) | adicionados |
| Vídeos só em H.264: não tocam no Chromium de código aberto | WebM (VP9) como alternativa automática |

## Stack usada

| Camada | Escolha |
|---|---|
| Servidor | `server.js`, Node puro (`http`): estático, `max-age=7200, public`, ETag/304, Last-Modified, Range (vídeo), 404 com página própria, bloqueio de travessia de diretório |
| Front-end | HTML + CSS + JavaScript puro, sem framework nem bundler (como o original) |
| Regras | `site/z/assets/scripts/core.js` — funções puras usadas pela página e pelos testes (UMD) |
| Jogos | 33 jogos em canvas: `site/z/games/_lib/arcade.js` (palco, teclado, toque, laço, sons, recorde) + 23 motores |
| Arte | SVG procedural (`art.js`, `tools/thumbs.mjs`); ícones PNG e 7 vídeos gerados por `tools/media.mjs` (canvas → ffmpeg) |
| Som | WebAudio sintetizado (`sound.js`: vozes do logo, mesa de sons, chiptune do dia); histórias com `speechSynthesis` |
| Fonte | Fredoka (SIL OFL 1.1, `site/z/assets/fonts/OFL.txt`), servida localmente |
| Geração | `tools/catalog.mjs` → `tools/build.mjs` gera páginas de jogo, `games-data.js`, miniaturas e `sitemap.xml` |
| Testes | `node:test`; Playwright 1.56 + Chromium; `vm` do Node para o diferencial de lógica |

## Mapeamento funcionalidade → implementação

| Área (IDs em `docs/features.md`) | Implementação |
|---|---|
| Cabeçalho, logo, boas-vindas, faixas, piada da faixa (H01–H23) | `index.html`, `main.css`, `home.js` (seções "Faixas", "Piada do dia", "Boas-vindas", "Logo"), `art.js` (logos), `jokes/z{en,pt}-jokes.js` |
| Grade de jogos (G01–G22) | `home.js` → `displayGames` com `Core.gameVisible/matchesSearch/sortAscendNum`; dados em `games-data.js` (mesmo formato de 12 campos do original) |
| Busca (S01–S12) | `home.js` (painel, letras, categorias condicionais) + `Core.searchResultMessage` |
| Seletor de cor (C01–C03) | `home.js` (`niceColour1/2`, reset a cada 10 cliques) |
| Easter eggs e progressão (E01–E15) | `home.js` (logo ×10, link `btoa(dia)`, conquistas 5/10/15/27/50, gráfico que cai, música de 12 h, títulos sem foco, dicas, Enter, benchmark, linha de diagnóstico) |
| Seção diária (D01–D25) | `daily.js` + `daily-data.js` + `Core.calendarStrap/calcNames/reactionVerdict/loveText` |
| Rodapé (F01–F05) | `index.html`, `home.js` (feedback guardado localmente) |
| Página de jogo (P01–P24) | `tools/build.mjs` (HTML, JSON-LD, objeto `game`), `game.js`, `game.css` |
| Páginas secundárias e HTTP (R01–R11) | `help.html`, `privacy.html`, `useralert.html`, `play.html`, `new.html`, `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `server.js` |

## Licenças, marcas e enums encontrados (fatos)

- `game.js` do original, linha 1: "This file, related code, assets, styling and indicia are Copyright (c) Friv.com - Unauthorised reproduction is prohibited. All rights reserved."
- Rodapé do original: "Copyright © 2006 - 2026. Friv is a Registered Trademark. All Rights Reserved. This is a genuine Friv site."; título e metadados usam "Friv®"; o JSON-LD das páginas de jogo declara `author/publisher: Friv`.
- Os jogos do original são de terceiros hospedados em `z/games/` (alguns com origem no parâmetro, ex. `bloxorz!4399.com`).
- O original tem verificação anti-cópia de domínio (`inline10.js`) — não reproduzida.
- Fonte do clone: Fredoka, SIL Open Font License 1.1. Todo o resto do clone foi escrito ou gerado para o projeto.
- Enums/constantes do original reproduzidos: dispositivos `Desktop iPadOld iPadNew iPhone AndroidLow AndroidMid AndroidHigh`; marcadores de jogo `New`, `Extra`, `Test`, `FGO`, `SUO`, `NFS`; períodos `valentines`, `easter`, `preHalloween`, `halloween`, `endOfYear`, `christmas`; dias `firstOfMonth`, `friday13th`, `valentinesDay`, `easterSunday`, `stPatricksDay`, `aprilFoolsDay`, `fathersDay`, `halloween`, `dec20th`–`dec23rd`, `christmasEve`, `christmasDay`, `boxingDay`, `newYearsEve`, `newYearsDay`; chaves `visitsCounter`, `gamePlays`, `dressupCounter`, `gfxPerformance`, `niceColour1/2`, `frivExtraTimer`, `randomAssignment`.
- Peculiaridades do original reproduzidas porque os testes diferenciais as exigem: a regra extra de Páscoa por ano usa `getYear()` (anos desde 1900) e por isso nunca dispara; a busca "Math" gera "Math / Number / Logic and number"; os rótulos em português do teste do amor dizem "VOLVER A INTENTARLO"; nomes com dígitos dão porcentagem negativa (o botão os rejeita antes); `play.html` sem parâmetro lança o mesmo erro de `atob`.

## Limitações técnicas (honestas)

1. **Marca e conteúdo não são os do original.** Por decisão do projeto, nome, logo, jogos, miniaturas, piadas, fatos, citações, histórias, imagens, sons e vídeos são próprios. Por isso os números das buscas são outros (33 jogos contra ~346) e as capturas não são idênticas pixel a pixel; os testes comparam forma e comportamento, não o conteúdo.
2. **Sem anúncios, consentimento e analytics.** O clone segue o ramo do original em que o script de anúncio não carrega (faixas "-ADVERTISEMENT-" ocultas, `scl:false` na linha de diagnóstico). Feedback e votos ficam no `localStorage` em vez de ir ao Google Analytics.
3. **Áudio sintetizado.** Música do logo, chiptune e mesa de sons usam WebAudio; as histórias usam a voz do sistema (`speechSynthesis`), que varia por aparelho e pode não existir em alguns navegadores. Não há elementos `<audio>` (`chiptuneAudio`, `logoAudio`, `storyAudio`).
4. **Idiomas.** Piadas da faixa em en e pt (o original tem 14); descrições de jogo em en e pt (o original, 47); boas-vindas em ~30 idiomas e rótulos do teste do amor em 14, como no original. A seção diária em texto segue a regra do original (só inglês).
5. **Excluídos:** versão escola, promoções de sites de terceiros (morefriv, werty.me, Gamui), anti-cópia de domínio, anúncios. `play.html` abre a URL recebida em vez do site parceiro do original.
6. **Cobertura.** 22 dos 143 itens foram conferidos por comparação de capturas ou leitura de código, sem asserção automática (ex.: brilho no hover, estrela giratória, música após 12 h, pesquisa de som aleatória após 4 min). A comparação ao vivo foi feita num único dia (período de Halloween); as outras épocas foram verificadas pela lógica diferencial (todos os dias de 2025–2030) e pelo e2e do clone com data forçada (`?today=`).
7. **Dependência do original.** `npm run test:parity` acessa o site de referência ao vivo; se ele mudar, linhas da matriz podem falhar — o que é o comportamento desejado de um teste de paridade.
8. **Vídeo.** Navegadores sem H.264 recebem WebM (VP9); navegadores sem nenhum dos dois não tocam o vídeo do dia.

## Ganchos de teste do clone

`?today=AAAA-MM-DD` (força a data), `?lang=xx`, `?blast` (efeito de letras), `?secret` (convite "CLICK LOGO X10"), `?drop` (gráfico que cai), `?classic` (logo sem animação), `?<btoa(dia)>` (jogos extra, como no original).

# Inventário de funcionalidades (Fase 2)

Uma linha por funcionalidade observável no original. Coluna **Conteúdo**:
- **=** o clone reproduz o mesmo comportamento e o mesmo texto de interface;
- **marca** o mesmo comportamento, com o nome/logo do original trocado pelo do clone (`Jogatina`);
- **próprio** o mesmo mecanismo, com conteúdo escrito/gerado para o clone (jogos, piadas, imagens, sons, histórias);
- **excluído** não reproduzido, com o motivo.

Textos entre aspas são os do original, palavra por palavra (locale `en-US`, 19/10/2026, período de Halloween).

## 1. Página inicial — estrutura e cabeçalho

| ID | Funcionalidade | Comportamento observado no original | Conteúdo |
|---|---|---|---|
| H01 | Título da aba | `Friv® \| FRIV.COM : The Best Free Games 🎃 Halloween` (sufixo sazonal) | marca |
| H02 | Metadados | description, viewport, theme-color `#600090`, Open Graph, canonical, JSON-LD Organization (sem cartão Twitter/X) | marca |
| H03 | Favicons | `favicon.svg`, 16/32/96+ px PNG, apple-touch-icon 180, mask-icon, `site.webmanifest` (192/512) | próprio |
| H04 | Fonte | fonte própria arredondada e pesada (`font-weight:650`), pré-carregada | próprio (Fredoka, OFL) |
| H05 | Fundo | `linear-gradient(indigo, indigo, navy)`; depois, gradiente salvo em `niceColour1/2` | = |
| H06 | Área do logo | altura `60vw` (máx. `54vh`), gradiente `#40a`, brilho branco à esquerda, sombra à direita, 2 reflexos circulares | = |
| H07 | Logo | SVG centralizado, rotação −2°, `cursor:pointer`; animação de balanço com hue-rotate até o logo definitivo carregar | marca |
| H08 | Logo sazonal | Halloween/Natal: logo temático após 3 s; senão logo aleatório entre ~20 variantes após 60 s | marca/próprio |
| H09 | Estrela giratória | estrela verde translúcida percorrendo o cabeçalho (3 animações), oculta em retrato e no Natal | = |
| H10 | Texto de boas-vindas | por idioma do navegador (≈30 idiomas: "Welcome!", "Bem-vindo!", "¡Bienvenido!"…); efeito de letras sorteadas até formar a palavra (10% das visitas) ou texto direto; some no Halloween/Natal; fade in/out em 10 s | = |
| H11 | Convite secreto | após 4 visitas, 10% de chance de o texto ser "CLICK LOGO X10" em verde | = |
| H12 | Botão de busca | lupa no canto superior direito, desliza de cima, opacidade 0.5 → 1 no hover | = |
| H13 | Seletor de cor | aba abaixo da lupa, desliza da direita em 2 s; mostra o gradiente atual | = |
| H14 | Botão "Info for teachers and parents" | só na versão escola em inglês | excluído (versão escola não faz parte do domínio principal) |
| H15 | Barra "-ADVERTISEMENT-" + bloco de anúncio | faixa com gradiente da cor do dia + AdSense (`min-height:285px`) | excluído (sem anúncios; o original esconde as duas barras quando o script de anúncio não carrega — o clone segue esse ramo) |
| H16 | Cor do dia | gradiente das barras muda pelo dia da semana (7 pares); Halloween laranja, Natal verde/vermelho, Valentine's rosa | = |
| H17 | Barra de piada | "Today's Halloween Joke - Click For The Answer" + pergunta; clique digita a resposta letra a letra (30 ms); cursor volta ao normal | próprio (piadas) |
| H18 | Piada de uma linha | sem resposta: só título + texto, sem clique | próprio |
| H19 | Piadas por idioma | 14 idiomas; arquivo `z{lang}-jokes.js`; Halloween/Natal/Páscoa/Valentine's trocam a lista; índice = dia do ano; em alguns idiomas é aleatória + votação 👍/👎 após 5 s com "Thank you!" | próprio (en, pt) |
| H20 | "LOADING GAMES" | texto arco-íris que se expande e some (3.5 s; mais lento para quem já jogou >3/>6) | = |
| H21 | Atraso de exibição | grade aparece após 0/500/1000 ms conforme `gamePlays` (>3, >6) | = |
| H22 | "▼ SCROLL TO PLAY! ▼" | primeira visita em retrato: grade oculta até 10 eventos de rolagem | = |
| H23 | Bloqueio do menu de contexto | botão direito desativado em toda a página | = |

## 2. Grade de jogos

| ID | Funcionalidade | Comportamento observado | Conteúdo |
|---|---|---|---|
| G01 | Bloco de jogo | `inline-block` 360×100 (máx. 85vw × 23.6vw; ≥1300 px: até 432×120, margem 0.4vmin), cantos 30/70/30/50 px, borda `5px outset #aaf` (pares `#ccf`), sombra | = |
| G02 | Fluxo responsivo | blocos centralizados em linhas (3 por linha em 1366 px, 1 por linha no celular) | = |
| G03 | Cor de carregamento | 7 gradientes em sequência (vermelho→laranja… magenta→vermelho) até a imagem carregar | = |
| G04 | Imagem lazy | `<img width=360 height=100 loading=lazy>`; miniaturas pequenas usam `image-rendering:pixelated` | próprio (miniaturas) |
| G05 | Nome do jogo | texto branco com sombra, canto superior esquerdo, 65% da largura; `_` vira espaço inquebrável, `~` força quebra de linha | = |
| G06 | Entrada do nome | nomes "caem" de cima com 3 batidas, escalonados (1 s + i/100 s) | = |
| G07 | Brilho | faixa branca na metade superior; 1 em cada 5 pisca a cada 15 s (após 10 s) | = |
| G08 | Flash | cada bloco pisca branco uma vez entre 15 e 75 s (desktop rápido) | = |
| G09 | Tremida | em dispositivos lentos/toque: tremida vertical escalonada (8 + 7·i s) | = |
| G10 | Hover | brilho ×1.5 e imagem cresce para 110% (transição 2 s); só sem toque | = |
| G11 | Clique | abre `z/games/<slug>/game.html` na mesma aba | = |
| G12 | Selo "NEW" | ícone laranja no canto inferior esquerdo, pisca 3 vezes (0, 5, 10 s) | = |
| G13 | Selo sazonal | abóbora (Halloween) / chapéu (Natal) nos jogos marcados | próprio (ícones) |
| G14 | Ícone de orientação | em toque: retângulo paisagem/retrato no canto inferior direito | = |
| G15 | Ordem inicial | por popularidade do dispositivo; os 10 primeiros embaralhados a cada visita; os jogos temáticos da estação vêm logo depois deles | = |
| G16 | Ordem nas buscas | alfabética depois da primeira exibição | = |
| G17 | Filtro por dispositivo | cada jogo declara dispositivos (Desktop, iPad, iPhone, Android Low/Mid/High); só aparecem os compatíveis | = |
| G18 | Jogos pesados | marcados "FGO": só com benchmark gráfico bom | = |
| G19 | Jogos sazonais | listas extras adicionadas no Halloween, Natal e perto do Natal | próprio |
| G20 | Borda por tipo | Extra = verde-limão, Teste = vermelho, Quebra-cabeça na escola = cáqui | = |
| G21 | Botões secretos | dois quadrados quase invisíveis após o último jogo; abrem `wireframe.html` e `cylinders/index.html` em nova aba | próprio (demos) |
| G22 | Seção "MORE GAMES" | liberada com 5 jogos jogados ou pelo truque do logo; título arco-íris letra a letra; blocos 150×150 | próprio |

## 3. Busca

| ID | Funcionalidade | Comportamento observado | Conteúdo |
|---|---|---|---|
| S01 | Abrir busca | clique na lupa: tela cheia `#306` com teclado de botões; a área de resultado fica vazia | = |
| S02 | Botões de letra | A–Z e "0-9", laranja com borda `outset brown`; hover gira o matiz 150° | = |
| S03 | Botões de categoria | "2 Player, 3D, Action, Adventure, Dressup, Combat, Creative, Food, Halloween, Jobs, Motorsport, New, Platform, Puzzle, Shooting, Sport" + "All Games A-Z" | = |
| S04 | Categorias condicionais | Halloween só no período; Xmas só no Natal; Math/Quiz/Word só na escola; Landscape/Portrait só em toque; Jobs/Platform só no desktop | = |
| S05 | Busca por letra | "20 games found starting with C." (plural/singular: "1 game found…") | = |
| S06 | Busca 0-9 | "10 games found starting with 0-9." | = |
| S07 | Busca por categoria | "124 Puzzle games found." | = |
| S08 | Rótulos especiais | "compatible 2 Player", "New / recently added", "Math / Number / Logic", "Word / Language", "Christmas / Winter" | = |
| S09 | Todos | "All games A-Z: 346." | = |
| S10 | Sem resultado | "Sorry. No games found. Please search again." e grade vazia | = |
| S11 | Após buscar | o painel fecha e a página rola suavemente até o logo; resultado aparece acima da grade | = |
| S12 | Dressup | clicar em "Dressup" injeta os jogos de vestir antes de filtrar | = |

## 4. Seletor de cor de fundo

| ID | Funcionalidade | Comportamento observado | Conteúdo |
|---|---|---|---|
| C01 | Sorteio | cada clique sorteia 2 cores de uma lista de ~18 nomes CSS e aplica `linear-gradient(c1, c2)` no `body` e no botão | = |
| C02 | Persistência | cores salvas em `niceColour1/2` e reaplicadas na próxima visita | = |
| C03 | Reset | a cada 10º clique volta para `indigo/navy` (Natal `maroon/#400`) e o botão pisca | = |

## 5. Easter eggs e progressão

| ID | Funcionalidade | Comportamento observado | Conteúdo |
|---|---|---|---|
| E01 | Clique no logo | cada clique toca uma "voz" aleatória; o 1º inicia música do logo em loop (Halloween: fundo escuro) | próprio (sons) |
| E02 | Logo ×10 | 10º clique: som de moeda, jogos extra no topo da grade (346→421), título "### HACK ###", efeito CRT verde por 7.7 s, rola até "MORE GAMES" | próprio (jogos extra) |
| E03 | Link secreto de jogos extra | URL contendo `btoa(dia do mês)` também libera os extras (guarda `frivExtraTimer`) | = |
| E04 | Conquista 5 jogos | faixa laranja desce: "⭐ Achievement! You are an AWESOME … player! ⭐ You get... MORE GAMES! PACK 1"; selo "⭐ AWESOME ⭐" no rodapé | marca |
| E05 | Conquista 10 | "✨ … EPIC … ✨ … EVEN MORE GAMES! PACK 2", selo "✨ EPIC ✨" | marca |
| E06 | Conquista 15 | mascote no rodapé ("BIG BRAINROT POO EMOJI"); dorme fora da tela, acorda ao aparecer, faz som ao clicar | próprio (mascote) |
| E07 | Conquista 27 | "💫 … ULTRA … 💫 … PACK 3", selo "💫 ULTRA 💫" | marca |
| E08 | Conquista 50 (VIP) | selo "🏆 … VIP 🏆" e formulário de feedback aberto com texto especial | marca |
| E09 | Gráfico que cai | após 10 visitas, 2%: rosquinha/passarinho cai sobre a grade aos 15 s, som de batida, grade e seção diária tremem | próprio (arte) |
| E10 | Música após 12 h | uma faixa toca se a página ficar aberta 12 horas | próprio (som) |
| E11 | Títulos com a aba sem foco | após ~37 s sem foco, o título da aba anima sequências de emoji/frases a cada 2.5 s; volta ao focar ou mover o mouse | próprio (frases) |
| E12 | Dicas para fãs | visitas 18–22 e 53–57 em inglês: "Fascinating Frivolous Fact For Fanatical … Fans 1/N (click for next)" | próprio |
| E13 | Enter conta jogada | tecla Enter na home soma 1 em `gamePlays` | = |
| E14 | Benchmark gráfico | 5000 mudanças de estilo num quadrado oculto; resultado em `gfxPerformance` | = |
| E15 | Linha de diagnóstico | rodapé mostra "Desktop ds:fst sw:1366 sh:768 sr:1.78 plt:… rnd:… gfx:… pv:… gp:… du:… Vx.xx" | = |

## 6. Seção diária ("Friv Daily")

| ID | Funcionalidade | Comportamento observado | Conteúdo |
|---|---|---|---|
| D01 | Cabeçalho | "Friv Daily" entre dois emojis do dia; "It's Monday 19th October!" (sufixos st/nd/rd/th) | marca |
| D02 | Datas especiais | frases próprias para 1º do mês, sexta-feira 13, Valentine's, St. Patrick's, 1º de abril (logo espelhado após 60 s), Dia dos Pais, Halloween, Véspera/Natal, Boxing Day, Réveillon, Ano-Novo | = |
| D03 | Animação ao rolar | a seção entra com animação quando 80% fica visível | = |
| D04 | Chiptune | "Tap To Play / Pause" → "Chiptune Playing" / "Chiptune Paused"; música do dia em loop; pausa vídeo/história/logo | próprio (música) |
| D05 | Foto fofa | "Tap For / Daily Cute Picture" → imagem do dia, rola até ela; Natal: "Cute Xmas Picture n/6" | próprio |
| D06 | Quebra-cabeça | "Daily Puzzle"; imagem + "…Which is the odd one out? Tap to close. Tap Tap Tap for the answer!"; 1º toque fecha a mensagem, 5º mostra a solução, 10º volta | próprio (gerado) |
| D07 | Citação | "Daily Famous Quote" + citação do dia + autor | próprio |
| D08 | GIFs | "Tap to see all / 10 daily GIFs" (some em 2.5 s); cada toque mostra o próximo de 10 | próprio |
| D09 | Piada do dia | "Daily Joke" + pergunta; "Tap For The Answer!" → resposta e votação | próprio |
| D10 | Mesa de sons | "Daily Soundboard": 10 botões de som do dia + "Challenge: Make up and tell a story using the above sounds!" | próprio |
| D11 | Teste de reação | instruções com 4 rostos; 7 rodadas; "Wait!" → "Go!" (fundo verde) → tempo em s; rosto triste = "Penalty +0.5s!"; resultado com média, melhor tempo, ranking e frase por faixa | = (mecânica e textos) |
| D12 | Curiosidade | "Today's Frivolous Fact" + fato do dia; 1% "Secret … Fact" revela o truque do logo | próprio |
| D13 | Foto incrível | "Daily Amazing Picture" | próprio |
| D14 | Arte de rua | "Daily Street Art" | próprio |
| D15 | Teste do amor | 2 campos ("ENTER YOUR NAME" máx. 14, "ENTER ANOTHER NAME" máx. 12), "CALCULATE!"; nome com número ou <2 letras → botão mostra "@#?*!" por 1 s; animação binária 3.5 s; % por algoritmo determinístico; 5 frases por faixa; "TRY AGAIN", "TWEET" (abre a intenção de tweet), botão "info" só em inglês; rótulos traduzidos em 14 idiomas (nl, fr, de, es, pt, it, se, pl, ru, tr, id, my, jp, zh), sem texto de introdução fora do inglês | = (algoritmo e textos) |
| D16 | Charada | "Daily Riddle"/"Tap For The Answer!"; botão "Change Difficulty" alterna Easy → "IQ 120+" (Hard) → "IQ 140+" (Extra Hard) → "IQ 100+" | próprio (charadas) |
| D17 | Limerique | "Tap For Daily Limerick" → limerique do dia | próprio |
| D18 | Ilusão de ótica | "Daily Optical Illusion"; toques: fechar, virar (scaleY −1), desvirar, girar 180°, girar 360° (transição 2 s) | próprio (gerado) |
| D19 | Trava-língua | "Tap For Daily / Tongue Twister"; textos curtos ganham "Say it several times quickly!" | próprio |
| D20 | História para dormir | título, autor, "Length", "For ages … Read by …"; PREV / PLAY↔PAUSE / NEXT; botão "Info" com texto sobre as histórias; pedido de avaliação após 3 min | próprio (histórias, narração por síntese de voz) |
| D21 | Vídeo engraçado | "Daily Funny Video" → vídeo do dia toca; pausa os outros áudios | próprio (vídeos gerados) |
| D22 | Votação | 👍/👎 em cada bloco; após votar a barra vira "✅" | = |
| D23 | Exclusividade de áudio | iniciar um áudio/vídeo pausa os outros | = |
| D24 | Conteúdo por data | índices pelo dia do mês (e meses pares +31 para piadas/limeriques/GIFs) | = |
| D25 | Blocos só em inglês | citação, fato, piada, charada, limerique, trava-língua e história (com seus emojis 💬📚😆💡📜👅🌛) só aparecem quando o idioma do navegador contém `en` | = |

## 7. Rodapé

| ID | Funcionalidade | Comportamento observado | Conteúdo |
|---|---|---|---|
| F01 | Descrição | h1 "Play unblocked games at Friv! We have only the very best free online games, and they work on any device. There are no ad interruptions, so just start playing!" | marca |
| F02 | Feedback | oculto até VIP ou pedido da história; "Feedback", texto, 2 `textarea`, "Send" → "A BIG THANK YOU! We're sorry we can't reply, but we read all your feedback, even if we have to stay up past our bedtime." | = (envio: ver R04) |
| F03 | Faixas arco-íris | duas faixas `hueBlock` com hue-rotate infinito | = |
| F04 | Copyright | "Copyright © 2006 - 2026. … All Rights Reserved." (ano atual por JS) | marca |
| F05 | Links | "Privacy & Cookies Policy", "Help - About - FAQs - Fakes - Old Friv" | marca |
| F06 | Promos externas | "Missing a game?…morefriv.com", "Games blocked at school?…werty.me" | excluído (links para sites de terceiros) |

## 8. Página de jogo (`z/games/<slug>/game.html`)

| ID | Funcionalidade | Comportamento observado | Conteúdo |
|---|---|---|---|
| P01 | Título | "Chess \| No Ads \| Play At Friv® 🕹️"; metadados e JSON-LD VideoGame com nota | marca |
| P02 | Fundo | gradiente roxo em tela cheia | = |
| P03 | Spinner | anel colorido com o tamanho ("3MB") girando por N s (N = MB entre 6 e 12) | = |
| P04 | Barra de carga | barra fina no topo da caixa de informação, preenche em N s após 1.5 s | = |
| P05 | Botão Play | círculo laranja com ▶ aparece após N s; treme aos 15 s | = |
| P06 | Caixa de informação | título do jogo, descrição, ícones de controle | próprio (descrições) |
| P07 | Descrição traduzida | descrição no idioma do navegador quando existe; passar o mouse no título mostra em inglês | próprio (en + pt) |
| P08 | Ajuste de fonte | descrição >220/>250 caracteres reduz a fonte; títulos >24/>28/>30 reduzem | = |
| P09 | Controles | ícones de mouse/gamepad/teclado + teclas (↑↓←→, espaço largo, ctrl, alt, enter, shift, tab); ocultos em toque | = |
| P10 | Estrelas | "4.9 ★★★★★" no canto superior direito, vindas do JSON-LD; hover gira o matiz de cada estrela | próprio (notas) |
| P11 | Título embaralhado | aos 22 s o título é refeito letra a letra (títulos <27 caracteres) | = |
| P12 | Jogar | clique na caixa: some a sobreposição, entra em tela cheia (fora do iOS), iframe ocupa a janela | = |
| P13 | Botão tela cheia | reaparece quando a janela sai da tela cheia | = |
| P14 | Botão voltar | volta para a home (sai da tela cheia) | = |
| P15 | Botão de efeitos | 23 efeitos em sequência (CRT, scanlines, hue, blur, skew, espelhar, cinza, sépia, contraste, inverter, tremer, balançar, girar) | = |
| P16 | Orientação | em toque, ícone paisagem/retrato pisca se a orientação estiver errada; sobreposição de aviso | = |
| P17 | Aviso de jogo grande | >29 MB: "Please WAIT for this game to load ...it's well worth it!" | = |
| P18 | Aviso só desktop | jogo de teclado em toque: aviso com link para a home | = |
| P19 | Contador de jogadas | +1 em `gamePlays` após 100 s na página | = |
| P20 | Contador de dressup | jogos `dressup` somam `dressupCounter` | = |
| P21 | Menu de contexto | bloqueado na página e dentro do iframe | = |
| P22 | Foco | o iframe recebe foco a cada 500 ms | = |
| P23 | Pesquisa de som | 30% dos jogos com `musicVote`, após 4 min: "🎵 Please help! How would you rate the sound in this game?…" 👍/👎 → "Thank you! 😊" | = |
| P24 | Mensagens promocionais | após 10 jogadas, 10% de chance de trocar a descrição por uma mensagem do site aos 2 min | próprio |

## 9. Páginas secundárias e infraestrutura

| ID | Funcionalidade | Comportamento observado | Conteúdo |
|---|---|---|---|
| R01 | Ajuda | `help.html` com âncoras `#about`, `#faqs`, `#fakes`, `#oldfriv` | próprio |
| R02 | Privacidade | `privacy.html` | próprio |
| R03 | Alerta | `useralert.html`: mostra "Reloading..." e volta à home (o texto "You clicked on the yellow box!…" está comentado no HTML) | = |
| R04 | Envio de feedback/votos | eventos `gtag` para o Google Analytics | excluído (sem rastreamento de terceiros; o clone guarda localmente e mostra o mesmo retorno) |
| R05 | `play.html` | lançador de jogo externo: `play.html?<nome em base64>,<url>,<marcas>` → título = nome, "Click/Tap to play <nome>", aviso PG-13 com `!pg`, aviso de hospedagem externa, botão P-L-A-Y! abre o jogo em nova aba, volta à home após 200 s com contagem nos últimos 10 s, +1 `gamePlays` aos 100 s; sem parâmetros: "Sorry - there was an error with this game." | = (o original abre um site parceiro; o clone abre a URL dada) |
| R06 | `new.html` | redireciona para `/` | = |
| R07 | 404 | "Error 404 - File Not Found. Click to play at …!" com status 404 | marca |
| R08 | Cache | `cache-control: max-age=7200, public`, ETag, Last-Modified | = |
| R09 | `robots.txt`, `sitemap.xml`, `site.webmanifest` | presentes | próprio |
| R10 | Aviso de WebP | navegador sem WebP: aviso em 9 idiomas após 5 s | = |
| R11 | Alerta de carregamento | caixa amarela "Ooops! Sorry, there seems to be a loading error…" escondida quando o JS termina | marca |
| R12 | Anti-cópia de domínio | redireciona fora de `friv.com` | excluído (proteção específica do original) |
| R13 | Anúncios, consentimento e analytics | AdSense, Funding Choices, GA4 | excluído |

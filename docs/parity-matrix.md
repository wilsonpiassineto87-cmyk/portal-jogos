# Matriz de paridade (gerada por `npm run test:parity`)

Execução: 2026-10-19T18:19:52.665Z. Referência: https://www.friv.com/ · Clone: http://127.0.0.1:45853/

**89 OK · 0 falha · 1 excluído · 0 sem dado** (de 90 verificações).

Valores normalizados: nome da marca → `BRAND`; textos de conteúdo próprio (piadas, fatos, nomes de jogos) são reduzidos à forma (padrão/contagem) antes da comparação. Capturas do clone em `docs/parity-shots/`.

| ID | Verificação | Esperado (referência) | Observado (clone) | Resultado |
|---|---|---|---|---|
| H01 | título da aba (sufixo sazonal) | `"BRAND \| BRAND : The Best Free Games 🎃 Halloween"` | `"BRAND \| BRAND : The Best Free Games 🎃 Halloween"` | ✅ OK |
| H02 | metadados (theme-color, viewport, OG, Twitter, canonical, JSON-LD) | `{"theme":"#600090","viewport":"width=device-width,initial-scale=1","og":true,"twitter":false,"canonical":true,"ld":["Organization"]}` | `{"theme":"#600090","viewport":"width=device-width,initial-scale=1","og":true,"twitter":false,"canonical":true,"ld":["Organization"]}` | ✅ OK |
| H03 | favicons e manifest | `{"svg":true,"png":true,"apple":true,"mask":true,"manifest":true}` | `{"svg":true,"png":true,"apple":true,"mask":true,"manifest":true}` | ✅ OK |
| H05 | fundo inicial do body | `"linear-gradient(rgb(75, 0, 130), rgb(0, 0, 128))"` | `"linear-gradient(rgb(75, 0, 130), rgb(0, 0, 128))"` | ✅ OK |
| H06 | área do logo (altura, gradiente) | `{"hOverVw":30,"capVh":true,"bg":"linear-gradient(172.8deg, rgb(68, 0, 170"}` | `{"hOverVw":30,"capVh":true,"bg":"linear-gradient(172.8deg, rgb(68, 0, 170"}` | ✅ OK |
| H07 | logo: rotação e cursor | `{"cursor":"pointer","rotate":true}` | `{"cursor":"pointer","rotate":true}` | ✅ OK |
| H10 | boas-vindas some no Halloween | `"block"` | `"block"` | ✅ OK |
| H12 | botão de busca no canto superior direito | `{"nearRight":true,"nearTop":true}` | `{"nearRight":true,"nearTop":true}` | ✅ OK |
| H13 | seletor de cor presente | `true` | `true` | ✅ OK |
| H15 | barra -ADVERTISEMENT- e bloco de anúncio — sem anúncios no clone; o original oculta as barras quando o script de anúncio não carrega | `"block"` | `"none"` | excluído |
| H16 | gradiente da barra de piada (Halloween) | `"linear-gradient(to right, rgb(255, 69, 0) 0%, rgb(255, 140, 0) 10%, rgb(255, 140, 0) 90%, rgb(255, 69, 0) 100%)"` | `"linear-gradient(to right, rgb(255, 69, 0) 0%, rgb(255, 140, 0) 10%, rgb(255, 140, 0) 90%, rgb(255, 69, 0) 100%)"` | ✅ OK |
| H17 | piada: rótulo, clique revela resposta e muda o rótulo | `{"label":"Today's Halloween Joke - Click For The Answer","after":"Today's Halloween Joke","grew":true}` | `{"label":"Today's Halloween Joke - Click For The Answer","after":"Today's Halloween Joke","grew":true}` | ✅ OK |
| H20 | texto LOADING GAMES | `"LOADING GAMES"` | `"LOADING GAMES"` | ✅ OK |
| H23 | menu de contexto bloqueado | `true` | `true` | ✅ OK |
| IDS | IDs de elementos da home usados pelos scripts — exceto áudio sintetizado e promoções de terceiros | `[]` | `[]` | ✅ OK |
| G01 | bloco de jogo: tamanho, borda, cantos | `{"w":370,"h":110,"border":"outset 5px","radius":"30px 70px 30px 50px"}` | `{"w":370,"h":110,"border":"outset 5px","radius":"30px 70px 30px 50px"}` | ✅ OK |
| G02 | blocos por linha (1366 px) | `3` | `3` | ✅ OK |
| G03 | cores de carregamento (classes) | `["gameThumbLoading1","gameThumbLoading2","gameThumbLoading3","gameThumbLoading4","gameThumbLoading5","gameThumbLoading6","gameThumbLoading7"]` | `["gameThumbLoading1","gameThumbLoading2","gameThumbLoading3","gameThumbLoading4","gameThumbLoading5","gameThumbLoading6","gameThumbLoading7"]` | ✅ OK |
| G05 | nome do jogo: cor e posição | `{"color":"rgb(255, 255, 255)","position":"absolute","top":"2px","left":"10.7969px"}` | `{"color":"rgb(255, 255, 255)","position":"absolute","top":"2px","left":"10.7969px"}` | ✅ OK |
| G06 | animação de entrada do nome | `"gameTitle"` | `"gameTitle"` | ✅ OK |
| G07 | brilho em todo bloco | `true` | `true` | ✅ OK |
| G11 | link do bloco: z/games/<slug>/game.html | `true` | `true` | ✅ OK |
| G12 | selo NEW presente | `true` | `true` | ✅ OK |
| G13 | selo de Halloween presente | `true` | `true` | ✅ OK |
| G15 | ordem inicial: top 10 por popularidade embaralhados, resto por popularidade | `{"top10AreLowestPop":true,"restSortedByPop":true,"allShownMatchGames":true}` | `{"top10AreLowestPop":true,"restSortedByPop":true,"allShownMatchGames":true}` | ✅ OK |
| G16 | ordem alfabética após busca | `true` | `true` | ✅ OK |
| G21 | botões secretos após o último jogo | `true` | `true` | ✅ OK |
| S01 | abrir busca: painel cheio #306 | `{"display":"block","bg":"rgb(51, 0, 102)","result":""}` | `{"display":"block","bg":"rgb(51, 0, 102)","result":""}` | ✅ OK |
| S02 | botões de letra | `["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0-9"]` | `["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0-9"]` | ✅ OK |
| S03 | botões de categoria (desktop, Halloween) | `["2 Player","3D","Action","Adventure","Dressup","Combat","Creative","Food","Halloween","Jobs","Motorsport","New","Platform","Puzzle","Shooting","Sport","All Gam` | `["2 Player","3D","Action","Adventure","Dressup","Combat","Creative","Food","Halloween","Jobs","Motorsport","New","Platform","Puzzle","Shooting","Sport","All Gam` | ✅ OK |
| S05 | busca por letra: mensagem e contagem | `{"shape":"N game(s) found starting with C.","countMatchesTiles":true}` | `{"shape":"N game(s) found starting with C.","countMatchesTiles":true}` | ✅ OK |
| S06 | busca 0-9 | `{"shape":"N game(s) found starting with N-N.","countMatchesTiles":true}` | `{"shape":"N game(s) found starting with N-N.","countMatchesTiles":true}` | ✅ OK |
| S07 | busca por categoria | `{"shape":"N Puzzle game(s) found.","countMatchesTiles":true}` | `{"shape":"N Puzzle game(s) found.","countMatchesTiles":true}` | ✅ OK |
| S08 | rótulos especiais (2 Player, New) | `[{"shape":"N compatible N Player game(s) found.","countMatchesTiles":true},{"shape":"N New / recently added game(s) found.","countMatchesTiles":true}]` | `[{"shape":"N compatible N Player game(s) found.","countMatchesTiles":true},{"shape":"N New / recently added game(s) found.","countMatchesTiles":true}]` | ✅ OK |
| S09 | todos os jogos A-Z | `{"shape":"All games A-Z: N.","countMatchesTiles":true}` | `{"shape":"All games A-Z: N.","countMatchesTiles":true}` | ✅ OK |
| S10 | busca sem resultado | `{"msg":"Sorry. No games found. Please search again.","tiles":0}` | `{"msg":"Sorry. No games found. Please search again.","tiles":0}` | ✅ OK |
| S11 | após buscar: painel fecha e rola até o logo | `{"panelHidden":true,"nearLogo":true}` | `{"panelHidden":true,"nearLogo":true}` | ✅ OK |
| S12 | categoria Dressup | `{"shape":"N Dressup game(s) found.","countMatchesTiles":true}` | `{"shape":"N Dressup game(s) found.","countMatchesTiles":true}` | ✅ OK |
| C01 | seletor de cor: sorteio e localStorage | `{"gradient":true,"saved":true}` | `{"gradient":true,"saved":true}` | ✅ OK |
| C02 | cor persiste ao recarregar | `true` | `true` | ✅ OK |
| C03 | 10º clique volta a indigo/navy | `"linear-gradient(indigo, navy)"` | `"linear-gradient(indigo, navy)"` | ✅ OK |
| E02 | logo ×10: HACK, mais jogos, MORE GAMES | `{"title":"### HACK ###","moreTiles":true,"moreGames":false}` | `{"title":"### HACK ###","moreTiles":true,"moreGames":false}` | ✅ OK |
| E13 | Enter soma gamePlays | `1` | `1` | ✅ OK |
| E15 | linha de diagnóstico do rodapé | `{"shape":true}` | `{"shape":true}` | ✅ OK |
| LS | chaves do localStorage após a 1ª visita | `["dressupCounter","frivExtraTimer","gamePlays","gfxPerformance","niceColour1","niceColour2","randomAssignment","visitsCounter"]` | `["dressupCounter","frivExtraTimer","gamePlays","gfxPerformance","niceColour1","niceColour2","randomAssignment","visitsCounter"]` | ✅ OK |
| D01 | cabeçalho da seção diária | `"It's Monday 19th October!"` | `"It's Monday 19th October!"` | ✅ OK |
| D-LABELS | rótulos iniciais das 18 seções diárias | `{"famousQuote":"Daily Famous Quote","jokeA":"Daily Joke","frivolousFact":"Today's BRANDolous Fact","riddleA":"Daily Riddle","limerickA":"Tap For Daily Limerick"` | `{"famousQuote":"Daily Famous Quote","jokeA":"Daily Joke","frivolousFact":"Today's BRANDolous Fact","riddleA":"Daily Riddle","limerickA":"Tap For Daily Limerick"` | ✅ OK |
| D04 | chiptune: rótulos tocar/pausar | `["Chiptune Playing","Chiptune Paused"]` | `["Chiptune Playing","Chiptune Paused"]` | ✅ OK |
| D06 | quebra-cabeça: mensagem e toques | `{"message":"Look carefully at these N X. Which is the odd one out?\n\nTap to close.\nTap Tap Tap for the answer!","visibleAfterOpen":true}` | `{"message":"Look carefully at these N X. Which is the odd one out?\n\nTap to close.\nTap Tap Tap for the answer!","visibleAfterOpen":true}` | ✅ OK |
| D08 | GIFs: rótulos | `{"label":"Daily GIFs","message":"Tap to see all\nN daily GIFs"}` | `{"label":"Daily GIFs","message":"Tap to see all\nN daily GIFs"}` | ✅ OK |
| D09 | piada do dia: revela resposta | `{"answered":true}` | `{"answered":true}` | ✅ OK |
| D11 | teste de reação: instruções e rodada | `{"instructions":"You will see four faces like these...\n\nTap the HAPPY face as fast as you can. Take this test daily to improve your score.\n\nTap To Start!","` | `{"instructions":"You will see four faces like these...\n\nTap the HAPPY face as fast as you can. Take this test daily to improve your score.\n\nTap To Start!","` | ✅ OK |
| D15 | teste do amor: fluxo completo | `{"intro":"Enter two first names in the boxes below and then click on the button to calculate the lurve! 😍\n\n\ninfo\n\nCALCULATE!","ph":["ENTER YOUR NAME","ENT` | `{"intro":"Enter two first names in the boxes below and then click on the button to calculate the lurve! 😍\n\n\ninfo\n\nCALCULATE!","ph":["ENTER YOUR NAME","ENT` | ✅ OK |
| D16 | charada: ciclo de dificuldade | `["Today's Hard Riddle","Today's Extra Hard Riddle","Today's Riddle"]` | `["Today's Hard Riddle","Today's Extra Hard Riddle","Today's Riddle"]` | ✅ OK |
| D17 | limerique abre | `true` | `true` | ✅ OK |
| D18 | ilusão de ótica: sequência de transformações | `{"message":true,"transforms":["none","scaleY(-1)","scaleY(1)","rotate(180deg)","rotate(360deg)"]}` | `{"message":true,"transforms":["none","scaleY(-1)","scaleY(1)","rotate(180deg)","rotate(360deg)"]}` | ✅ OK |
| D19 | trava-língua | `true` | `true` | ✅ OK |
| D20 | história: controles e info | `{"controls":true,"meta":true,"info":true}` | `{"controls":true,"meta":true,"info":true}` | ✅ OK |
| D22 | votação vira ✅ | `"✅"` | `"✅"` | ✅ OK |
| F01 | descrição do site | `"Play unblocked games at BRAND! We have only the very best free online games, and they work on any device. There are no ad interruptions, so just start playing!` | `"Play unblocked games at BRAND! We have only the very best free online games, and they work on any device. There are no ad interruptions, so just start playing!` | ✅ OK |
| F02 | feedback oculto | `"none"` | `"none"` | ✅ OK |
| F03 | faixas arco-íris | `2` | `2` | ✅ OK |
| F04 | copyright — o clone não declara marca registrada | `"Copyright © N - N. BRAND. All Rights Reserved. This is a genuine BRAND site."` | `"Copyright © N - N. BRAND. All Rights Reserved. This is a genuine BRAND site."` | ✅ OK |
| F05 | links do rodapé | `["privacy.html","help.html","help.html#about","help.html#faqs","help.html#fakes","help.html#oldfriv"]` | `["privacy.html","help.html","help.html#about","help.html#faqs","help.html#fakes","help.html#oldfriv"]` | ✅ OK |
| P01 | título da página de jogo | `"GAME \| No Ads \| Play At BRAND 🕹️"` | `"GAME \| No Ads \| Play At BRAND 🕹️"` | ✅ OK |
| P03 | spinner com tamanho em MB | `{"spinnerVisible":true,"mb":true}` | `{"spinnerVisible":true,"mb":true}` | ✅ OK |
| P03b | spinner: animação some após N s | `"2s linear 0s infinite normal forwards running spinner, 0s linear 6s 1 normal forwards running spinnerRemove"` | `"2s linear 0s infinite normal forwards running spinner, 0s linear 6s 1 normal forwards running spinnerRemove"` | ✅ OK |
| P04 | barra de carga | `"6s linear 1.5s 1 normal forwards running infoBoxLoadingBar"` | `"6s linear 1.5s 1 normal forwards running infoBoxLoadingBar"` | ✅ OK |
| P05 | botão Play após N s | `"0s linear 6s 1 normal forwards running playButtonShow, 1s cubic-bezier(0.36, 0.07, 0.19, 0.97) 15s 1 normal none running shake1"` | `"0s linear 6s 1 normal forwards running playButtonShow, 1s cubic-bezier(0.36, 0.07, 0.19, 0.97) 15s 1 normal none running shake1"` | ✅ OK |
| P10 | estrelas da nota | `true` | `true` | ✅ OK |
| P11 | título refeito aos 22 s (contado do carregamento do script) | `{"unchangedBefore22s":true,"rewrittenBy24s":true,"restored":true}` | `{"unchangedBefore22s":true,"rewrittenBy24s":true,"restored":true}` | ✅ OK |
| P12 | clique: sobreposição some, iframe carrega | `{"overlay":"none","iframe":true}` | `{"overlay":"none","iframe":true}` | ✅ OK |
| P14 | botão voltar leva à home | `"/"` | `"/"` | ✅ OK |
| P15 | botão de efeitos segue a flag do jogo | `"hidden"` | `"hidden"` | ✅ OK |
| P19 | +1 gamePlays após 100 s | `{"at99s":0,"at101s":1}` | `{"at99s":0,"at101s":1}` | ✅ OK |
| P21 | menu de contexto bloqueado na página de jogo | `true` | `true` | ✅ OK |
| M-G02 | celular: 1 bloco por linha | `1` | `1` | ✅ OK |
| M-H22 | celular: SCROLL TO PLAY na 1ª visita | `{"text":"▼ SCROLL TO PLAY! ▼","shown":true}` | `{"text":"▼ SCROLL TO PLAY! ▼","shown":true}` | ✅ OK |
| M-G14 | celular: ícone de orientação | `true` | `true` | ✅ OK |
| M-S04 | celular: categorias condicionais | `{"landscape":true,"portrait":true,"jobs":false,"platform":false,"halloween":true}` | `{"landscape":true,"portrait":true,"jobs":false,"platform":false,"halloween":true}` | ✅ OK |
| M-P09 | celular: controles ocultos na página de jogo | `"none"` | `"none"` | ✅ OK |
| R01 | ajuda: âncoras | `[true,true,true,true]` | `[true,true,true,true]` | ✅ OK |
| R03 | useralert | `"Reloading..."` | `"Reloading..."` | ✅ OK |
| R05 | play.html sem parâmetro | `["P\n\nL\n\nA\n\nY\n\n!\n\nSorry - there was an error with this game.","P\n\nL\n\nA\n\nY\n\n!","P\n\nL\n\nA\n\nY\n\n!","P\n\nL\n\nA\n\nY\n\n!","Sorry - there wa` | `["P\n\nL\n\nA\n\nY\n\n!\n\nSorry - there was an error with this game.","P\n\nL\n\nA\n\nY\n\n!","P\n\nL\n\nA\n\nY\n\n!","P\n\nL\n\nA\n\nY\n\n!","Sorry - there wa` | ✅ OK |
| R06 | new.html redireciona | `"/"` | `"/"` | ✅ OK |
| R05b | play.html com nome/URL/aviso PG | `{"title":"Test Game","footer":"Click to play Test Game","bottom":"This game is rated PG-13.\nSome games are hosted externally. We are not responsible for the co` | `{"title":"Test Game","footer":"Click to play Test Game","bottom":"This game is rated PG-13.\nSome games are hosted externally. We are not responsible for the co` | ✅ OK |
| PT | navegador pt-BR: blocos em inglês ocultos, teste do amor traduzido | `{"vis":{"famousQuote":false,"frivolousFact":false,"jokeA":false,"riddleA":false,"limerickA":false,"tongueTwisterA":false,"storyA":false,"chiptune":true,"reactio` | `{"vis":{"famousQuote":false,"frivolousFact":false,"jokeA":false,"riddleA":false,"limerickA":false,"tongueTwisterA":false,"storyA":false,"chiptune":true,"reactio` | ✅ OK |
| R07 | 404 | `{"status":404,"text":"Error 404 - File Not Found."}` | `{"status":404,"text":"Error 404 - File Not Found."}` | ✅ OK |
| R08 | cabeçalhos de cache | `{"cacheControl":"max-age=7200, public","etag":true,"lastModified":true}` | `{"cacheControl":"max-age=7200, public","etag":true,"lastModified":true}` | ✅ OK |
| R09 | robots/sitemap/manifest | `{"robots":200,"sitemap":200,"manifest":200}` | `{"robots":200,"sitemap":200,"manifest":200}` | ✅ OK |

## Log da execução

```
[ref] home (desktop 1366×768): ok (13.6 s)
[ref] busca: ok (21.3 s)
[ref] seletor de cor: ok (10.6 s)
[ref] easter eggs (logo ×10, Enter): ok (11.5 s)
[ref] seção diária: ok (29.3 s)
[ref] página de jogo (relógio controlado): ok (5.9 s)
[ref] celular (iPhone 13): ok (12.4 s)
[ref] navegador pt-BR: ok (6.0 s)
[ref] páginas secundárias e HTTP: ok (6.3 s) pageerrors=["Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded."]
[clone] home (desktop 1366×768): ok (12.3 s)
[clone] busca: ok (20.1 s)
[clone] seletor de cor: ok (9.8 s)
[clone] easter eggs (logo ×10, Enter): ok (10.0 s)
[clone] seção diária: ok (28.4 s)
[clone] página de jogo (relógio controlado): ok (29.0 s)
[clone] celular (iPhone 13): ok (11.6 s)
[clone] navegador pt-BR: ok (5.3 s)
[clone] páginas secundárias e HTTP: ok (4.2 s) pageerrors=["Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded."]
```

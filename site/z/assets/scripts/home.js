/* Página inicial: ambiente, grade de jogos, busca, cores, logo, easter eggs e conquistas. */
(function () {
  'use strict';
  const C = window.Core;
  const $ = id => document.getElementById(id);
  const SITE = C.SITE.name;

  // ---------- Ambiente ----------
  const params = new URLSearchParams(window.location.search);
  const lang = (params.get('lang') || navigator.language || 'en').toLowerCase();
  const shortLang = lang.slice(0, 2);
  const british = lang === 'en-gb';
  const dev = C.detectDevice(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
  const touchDevice = dev.touchDevice;
  const gestureWord = touchDevice ? 'tap' : 'click';

  // Gancho de teste: ?today=AAAA-MM-DD simula outra data (o original tem as mesmas datas fixas comentadas no código).
  let today = new Date();
  const forced = params.get('today');
  if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) {
    const [y, m, d] = forced.split('-').map(Number);
    today = new Date(y, m - 1, d, today.getHours(), today.getMinutes());
  }
  const cal = C.getCalendar(today);

  const store = {
    get(k, d = 0) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    num(k, d = 0) { return Number(store.get(k, d)) || 0; },
    set(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { /* armazenamento indisponível */ } },
  };
  const pageViews = store.num('visitsCounter') + 1;
  store.set('visitsCounter', pageViews);
  let gamePlays = store.num('gamePlays');
  const dressupCounter = store.num('dressupCounter');
  if (store.get('gamePlays', null) === null) store.set('gamePlays', 0);
  if (store.get('dressupCounter', null) === null) store.set('dressupCounter', 0);
  let userRandom = store.num('randomAssignment');
  if (!userRandom) { userRandom = 1 + Math.floor(Math.random() * 100); store.set('randomAssignment', userRandom); }
  if (store.get('niceColour1', null) === null) { store.set('niceColour1', 'indigo'); store.set('niceColour2', 'navy'); }

  const commonLang = ['ar', 'bg', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'fr', 'he', 'hr', 'hu', 'id', 'it', 'ka', 'lt', 'lv', 'nb', 'pl', 'pt', 'ro', 'sk', 'sl', 'sq', 'sr', 'sv', 'th', 'tr', 'vi', 'zh'].includes(shortLang);

  // Benchmark gráfico: 5000 mudanças de estilo num quadrado oculto (resultado em ms).
  function getGfxPerformance() {
    const sq = $('gfxSpeedSquare');
    const t0 = performance.now();
    for (let i = 0; i < 5000; i++) {
      sq.style.width = Math.floor(Math.random() * 50) + 50 + 'vw';
      sq.style.height = Math.floor(Math.random() * 50) + 50 + 'vh';
      sq.style.transform = 'skewX(' + Math.floor(Math.random() * 40) + 'deg)';
      sq.style.transform = 'rotate(' + Math.floor(Math.random() * 40) + 'deg)';
    }
    sq.style.transform = 'rotate(0deg)';
    setTimeout(() => { sq.style.display = 'none'; }, 999);
    return Math.floor(performance.now() - t0);
  }
  let gfxPerformance = store.num('gfxPerformance', -1);
  if (gfxPerformance < 0) { gfxPerformance = getGfxPerformance(); store.set('gfxPerformance', gfxPerformance); } else $('gfxSpeedSquare').style.display = 'none';
  // Categoria de desempenho (inferida: valores observados 28 ms e 57 ms → categoria 3).
  const gfxPerformanceCategory = gfxPerformance < 15 ? 5 : gfxPerformance < 25 ? 4 : gfxPerformance < 100 ? 3 : gfxPerformance < 200 ? 2 : 1;
  const deviceSpeed = dev.deviceSpeed;

  const track = () => {}; // o original envia eventos ao Google Analytics; o clone não rastreia.
  document.addEventListener('contextmenu', e => e.preventDefault());

  // ---------- Faixas coloridas e título sazonal ----------
  const band = C.bandGradient(cal);
  ['lbaTop', 'lba', 'lbaJokes'].forEach(id => { $(id).style.backgroundImage = band; });
  // Sem anúncios: segue o ramo do original em que o script de anúncio não carrega (faixas ocultas).
  $('lbaTop').style.display = 'none';
  $('lba').style.display = 'none';
  const seasonTitle = { halloween: ' 🎃 Halloween', christmas: ' 🎄 Christmas', valentines: ' 💕 Valentines', easter: ' 🐣 Easter' }[cal.specialPeriod] || '';
  document.title = `${SITE} | ${SITE.toUpperCase()} : The Best Free Games${seasonTitle}`;

  // ---------- Piada do dia na faixa ----------
  const jokeLanguages = ['en', 'pt'];
  const randomJokeLanguages = []; // no original só alguns idiomas usam piada aleatória com votação
  let chosenJoke = '';
  if (jokeLanguages.includes(shortLang)) {
    const s = document.createElement('script');
    s.src = 'z/assets/scripts/jokes/z' + shortLang + '-jokes.js';
    s.onload = () => {
      if (!window.topDailyJokes) return;
      const lb = $('lbaJokes');
      lb.style.display = 'block';
      let intro = window.todaysJoke;
      let list = window.topDailyJokes;
      const doRandom = randomJokeLanguages.includes(shortLang);
      if (doRandom) intro = window.randomJoke;
      const seasonal = { valentines: ['valentinesJokes', 'todaysValentinesJoke'], easter: ['easterJokes', 'todaysEasterJoke'], halloween: ['halloweenJokes', 'todaysHalloweenJoke'], christmas: ['christmasJokes', 'todaysChristmasJoke'] }[cal.specialPeriod];
      if (seasonal && window[seasonal[0]] && window[seasonal[0]].length) { list = window[seasonal[0]]; intro = window[seasonal[1]]; }
      const idx = doRandom ? Math.floor(Math.random() * list.length) : cal.dayOfYear % list.length;
      let [a, b] = list[idx];
      if (british) { a = a.replace(/Santa/g, 'Father Christmas'); if (b) b = b.replace(/Santa/g, 'Father Christmas'); }
      chosenJoke = a;
      if (b === undefined) {
        lb.innerHTML = `<span style="color:lemonchiffon">${intro}</span><br>${a}`;
        lb.style.cursor = 'default';
        return;
      }
      lb.innerHTML = `<span style="color:lemonchiffon">${intro} - ${touchDevice ? window.tapForAnswer : window.clickForAnswer}</span><br>${a}`;
      function showAnswer() {
        lb.innerHTML = `<span style="color:lemonchiffon">${intro}</span><br>${a} `;
        let i = 0;
        (function type() { if (i < b.length) { lb.innerHTML += b.charAt(i++); setTimeout(type, 30); } })();
        lb.style.cursor = 'default';
        lb.removeEventListener('click', showAnswer);
        if (doRandom) setTimeout(() => {
          lb.insertAdjacentHTML('beforeend', "<div id='jokeVoting'><span id='jokeThumbsUp'>👍</span> <span id='jokeThumbsDown'>👎</span></div>");
          const done = () => { $('jokeVoting').innerHTML = window.jokeVotingThankyou; setTimeout(() => { $('jokeVoting').style.display = 'none'; }, 2000); };
          $('jokeThumbsUp').addEventListener('click', done);
          $('jokeThumbsDown').addEventListener('click', done);
        }, 5000);
      }
      lb.addEventListener('click', showAnswer);
    };
    document.head.appendChild(s);
  }

  // ---------- Boas-vindas ----------
  const welcome = $('welcome');
  let { text: welcomeText, blastAllowed } = C.welcomeText(shortLang);
  let doBlast = blastAllowed && (params.has('blast') || Math.random() > 0.9);
  if (cal.specialPeriod === 'christmas' || cal.specialPeriod === 'halloween') welcomeText = '';
  if (welcomeText.length > 10) { welcome.style.fontSize = '11vmin'; welcome.style.letterSpacing = '1vmin'; }
  if (welcomeText.length > 12) { welcome.style.fontSize = '8vmin'; welcome.style.letterSpacing = '0'; }
  if (pageViews > 4 && (Math.random() > 0.9 || params.has('secret'))) {
    welcomeText = 'CLICK LOGO X10';
    welcome.style.color = 'lime';
    welcome.style.fontSize = '8vmin';
    welcome.style.letterSpacing = '0';
  }
  if (doBlast && welcomeText) {
    const chars = "Üūüừöäàëšşí¡-!.?&' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let shown = Array.from(welcomeText, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setTimeout(() => {
      const timer = setInterval(() => {
        for (let i = 0; i < 20; i++) {
          const k = Math.floor(Math.random() * welcomeText.length);
          if (shown[k] !== welcomeText[k]) shown = shown.slice(0, k) + chars[Math.floor(Math.random() * chars.length)] + shown.slice(k + 1);
          if (shown === welcomeText) { clearInterval(timer); break; }
        }
        welcome.innerHTML = shown;
      }, 30);
    }, 3000);
  } else {
    welcome.innerHTML = welcomeText;
  }

  // ---------- Logo ----------
  const logo = $('logo');
  const logoSpinner = $('logoSpinner');
  logo.innerHTML = Art.logoSVG('Classic');
  let logoVariant = Art.LOGO_VARIANTS[Math.floor(Math.random() * Art.LOGO_VARIANTS.length)];
  let logoTimeout = 60000;
  if (cal.specialPeriod === 'christmas') { logoTimeout = 3000; logoVariant = 'Christmas'; }
  if (cal.specialPeriod === 'halloween') {
    logoTimeout = 3000;
    logoVariant = 'Halloween';
    $('logoLeftShine').style.backgroundImage = 'linear-gradient(maroon, red, darkorange, orange, transparent)';
    $('logoRightShadow').style.backgroundImage = 'linear-gradient(maroon, red, darkorange, orange, transparent)';
  }
  setTimeout(() => {
    logo.style.transform = 'rotate(0deg)';
    logo.style.animation = 'none';
    logo.innerHTML = Art.logoSVG(logoVariant);
    logoSpinner.style.display = 'none';
  }, logoTimeout);
  if (params.has('classic')) { logo.style.transform = 'rotate(0deg)'; logo.style.animation = 'none'; logoSpinner.style.animation = 'none'; }
  if (cal.specialDay === 'aprilFoolsDay') setTimeout(() => { $('logoContainer').style.transform = 'scaleX(-1)'; }, 60000);

  // ---------- Cor do fundo ----------
  let backgroundColoursCount = 1;
  function displayBackgroundColours() {
    const g = `linear-gradient(${store.get('niceColour1', 'indigo')}, ${store.get('niceColour2', 'navy')})`;
    document.body.style.background = g;
    $('colourSelector').style.background = g;
  }
  function changeBackgroundColour() {
    const sel = $('colourSelector');
    if (backgroundColoursCount % 10 === 0) {
      const [a, b] = cal.specialPeriod === 'christmas' ? ['maroon', '#400'] : ['indigo', 'navy'];
      store.set('niceColour1', a);
      store.set('niceColour2', b);
      sel.style.animation = 'none';
      sel.style.right = '0';
      void sel.offsetHeight;
      sel.style.animation = 'brightFlash 0.2s';
    } else {
      store.set('niceColour1', C.NICE_COLOURS[Math.floor(Math.random() * C.NICE_COLOURS.length)]);
      store.set('niceColour2', C.NICE_COLOURS[Math.floor(Math.random() * C.NICE_COLOURS.length)]);
    }
    backgroundColoursCount++;
    displayBackgroundColours();
  }
  displayBackgroundColours();

  // ---------- Lista de jogos ----------
  // Como no original, a lista global `games` recebe os jogos sazonais/extras no início (unshift).
  const games = window.games;
  if (cal.specialPeriod === 'preHalloween' || cal.specialPeriod === 'halloween') games.unshift(...window.halloweenGames);
  if (cal.specialPeriod === 'christmas') games.unshift(...window.christmasGames);
  else $('xmasRemove').style.display = 'none';
  if (cal.specialPeriod !== 'halloween') $('halloweenRemove').style.display = 'none';
  ['mathRemove', 'quizRemove', 'wordRemove'].forEach(id => { $(id).style.display = 'none'; });
  if (dev.os === 'Desktop') { $('landscapeRemove').style.display = 'none'; $('portraitRemove').style.display = 'none'; }
  else { $('jobsRemove').style.display = 'none'; $('platformRemove').style.display = 'none'; }

  let dressupGamesAdded = false;
  function addDressupGames() { games.unshift(...window.dressupGames); dressupGamesAdded = true; }
  if (dressupCounter > 3) addDressupGames();

  // Ordem inicial: popularidade da plataforma; os 10 primeiros embaralhados (os temáticos têm popularidade logo abaixo deles).
  games.sort(C.sortAscendNum(dev.popIndex));
  for (let i = Math.min(9, games.length - 1); i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [games[i], games[j]] = [games[j], games[i]]; }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function concatExtraGames() { games.unshift(...shuffle(window.extraGames.slice())); }
  const extraCipher = btoa(String(today.getDate()));
  if (window.location.href.indexOf(extraCipher) > -1 || store.num('frivExtraTimer') === today.getDate()) {
    concatExtraGames();
    store.set('frivExtraTimer', today.getDate());
  } else if (store.get('frivExtraTimer', null) === null) {
    store.set('frivExtraTimer', 0);
  }

  // ---------- Grade ----------
  const gamesBlock = $('gamesBlock');
  const headerSearchResult = $('headerSearchResult');
  const searchResultText = $('searchResultText');
  let firstDisplay = true;
  let displayGamesTimer = 0;
  const opts = { deviceCategory: dev.deviceCategory, gfxPerformanceCategory, gamePlays, testVer: false, isSchool: false };

  function displayGames(genre, firstLetter) {
    if (genre === 'Dressup' && !dressupGamesAdded) { addDressupGames(); games.sort(C.sortAscend(0)); }
    let out = '';
    let loadingNumber = 0;
    let count = 0;
    for (const g of games) {
      loadingNumber = loadingNumber < 7 ? loadingNumber + 1 : 1;
      if (!C.gameVisible(g, opts) || !C.matchesSearch(g, genre, firstLetter)) continue;
      const tags = g[6];
      let border = 'gameThumbContainer';
      if (tags.indexOf('Extra') > -1) border = 'gameThumbContainerExtra';
      if (tags.indexOf('Test') > -1) border = 'gameThumbContainerTest';
      let icons = '';
      if (touchDevice) icons = tags.indexOf('Portrait') > -1 ? '<div class=gameThumbOrientationPortrait></div>' : '<div class=gameThumbOrientationLandscape></div>';
      if (tags.indexOf('New') > -1 && tags.indexOf('Newish') === -1) icons += '<div class=newIcon></div>';
      if (tags.indexOf('Xmas') > -1 && cal.specialPeriod === 'christmas') icons += '<div class=xmasIcon></div>';
      if (tags.indexOf('Halloween') > -1 && cal.specialPeriod === 'halloween') icons += '<div class=halloweenIcon></div>';
      const name = C.displayName(g[0]);
      count++;
      out += `<div class='${border} gameThumbLoading${loadingNumber}'><div class=gameThumbShine></div>${icons}<a href=${g[1]}.html><img width='360' height='100' loading='lazy' class='gameThumb' src=z/thumbs/${g[4]} alt=${g[0].replace(/[_~]/g, '-')}></a><div class='gameTitle notranslate'>${name}</div></div>`;
    }
    if (!firstDisplay) {
      searchBoxRemove();
      searchResultText.innerHTML = headerSearchResult.innerHTML = C.searchResultMessage(genre, firstLetter, count);
    }
    firstDisplay = false;
    out += '<div id=secretButton2></div>';
    if (!touchDevice) out += '<br><div id=secretButton></div>';
    gamesBlock.innerHTML = out;
    gamesBlock.style.marginBottom = '2vh';
    if (!touchDevice) $('secretButton').addEventListener('click', () => window.open('z/eastereggs/cylinders/index.html'));
    $('secretButton2').addEventListener('click', () => window.open('z/eastereggs/wireframe.html'));
    games.sort(C.sortAscend(0)); // depois da primeira exibição, sempre alfabético

    const titles = gamesBlock.getElementsByClassName('gameTitle');
    for (let i = 0; i < titles.length; i++) {
      if (deviceSpeed === 'fst') titles[i].style.animation = `gameTitle 0.2s ${1 + i / 100}s forwards`;
      else titles[i].style.top = '3%';
    }
    if (deviceSpeed === 'fst') {
      const shines = gamesBlock.getElementsByClassName('gameThumbShine');
      for (let i = 0; i < shines.length; i += 5) shines[i].style.animation = `gameThumbShine 15s ${10 + i / 2}s infinite`;
    }
    if (cal.specialPeriod === 'christmas') logoSpinner.style.display = 'none';
    const tiles = gamesBlock.querySelectorAll('.gameThumbContainer, .gameThumbContainerExtra');
    tiles.forEach((t, i) => {
      if (!touchDevice && deviceSpeed === 'fst') {
        t.style.animation = `brightFlash 0.2s ${15 + Math.random() * 60}s steps(1)`;
        if (pageViews === 60) t.style.transform = `rotate(${Math.random() * 360}deg)`;
      } else {
        t.style.animation = `vshake .5s ${(i + 1) * 7 + 8}s cubic-bezier(0.36, 0.07, 0.19, 0.97)`;
      }
    });
    setTimeout(() => { gamesBlock.style.opacity = '1'; }, displayGamesTimer);
    displayGamesTimer = 0;
  }

  function showSearchBox() {
    $('searchBoxContainer').style.display = 'block';
    headerSearchResult.style.display = 'block';
    searchResultText.innerHTML = '&nbsp;';
  }
  function searchBoxRemove() {
    $('searchBoxContainer').style.display = 'none';
    logo.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }
  function sortGamesAlpha() { games.sort(C.sortAscend(0)); displayGames('*', '*'); searchBoxRemove(); headerSearchResult.innerHTML = 'Games sorted alphabetically A-Z.'; }
  function sortGamesPopularity() { games.sort(C.sortAscendNum(dev.popIndex)); displayGames('*', '*'); searchBoxRemove(); headerSearchResult.innerHTML = 'Games sorted by popularity. Top first.'; }
  function sortGamesDate() { games.sort(C.sortDecend(7)); displayGames('*', '*'); searchBoxRemove(); headerSearchResult.innerHTML = 'Games sorted by date. Newest first.'; }

  // Efeito hover só sem toque (o original injeta este CSS via JS).
  if (!touchDevice) {
    const style = document.createElement('style');
    style.textContent = '.gameThumb:hover{width:110%;height:110%;}.gameThumbContainer:hover,.gameThumbContainerExtra:hover,.gameThumbContainerPuzzle:hover,.gameThumbContainerTest:hover{filter:brightness(1.5);}.searchLetter:hover{filter:hue-rotate(150deg)}';
    document.head.appendChild(style);
  }

  // ---------- Logo: 10 cliques liberam os jogos extras ----------
  let logoClicks = 0;
  let logoMusic = null;
  let clickHack = false;
  function addExtraGames() {
    Sound.unlock();
    if (!logoMusic) {
      let scale = 'major', seed = 7, bpm = 140;
      if (cal.specialPeriod === 'christmas') { scale = 'festive'; seed = 25; bpm = 150; }
      if (cal.specialPeriod === 'halloween') { scale = 'spooky'; seed = 31; bpm = 110; document.body.style.background = 'linear-gradient(#002, black, #005, black, #003)'; }
      if (cal.specialDay === 'aprilFoolsDay') { scale = 'minor'; seed = 401; bpm = 170; }
      logoMusic = Sound.tune(seed, scale, bpm);
      logoMusic.play();
      window.Daily && window.Daily.pauseOthers('logo');
    }
    logoClicks++;
    if (logoClicks !== 10) {
      Sound.play('voice-' + Math.floor(Math.random() * Sound.voiceCount));
    } else {
      concatExtraGames();
      Sound.play('coinin');
      displayGames('*', '*');
      clickHack = true;
      initMoreGames();
    }
  }
  logo.addEventListener('click', addExtraGames);

  // ---------- Conquistas e seção "MORE GAMES" ----------
  const PACK1 = 5, PACK2 = 10, MASCOT = 15, PACK3 = 27, VIP = 50;
  let showPack2 = false, showPack3 = false;
  const slider = $('achievementSlider');
  const signifier = $('achievementSignifier');
  function incrementGamePlays() { gamePlays++; store.set('gamePlays', gamePlays); }
  function achievement(html, target) {
    slider.innerHTML = html;
    slider.style.display = 'block';
    incrementGamePlays();
    setTimeout(() => target.scrollIntoView({ block: 'start', behavior: 'smooth' }), 9000);
  }
  function initMoreGames() {
    if (!(clickHack || (commonLang && gamePlays >= PACK1))) return;
    $('devoryGames').style.display = 'block';
    if (gamePlays >= PACK1) {
      signifier.style.display = 'block';
      signifier.style.backgroundImage = 'linear-gradient(to bottom, rgba(0,0,255,0.5), rgba(0,0,0,0))';
      signifier.innerHTML = '⭐ AWESOME ⭐';
    }
    if (gamePlays === PACK1) achievement(`⭐ Achievement! You are an AWESOME ${SITE} player! ⭐<br>You get... MORE GAMES! <span class=navy>PACK 1</span>`, $('devoryGames'));
    if (gamePlays >= PACK2) { showPack2 = true; signifier.style.backgroundImage = 'linear-gradient(to bottom, rgba(0,255,0,0.5), rgba(0,0,0,0))'; signifier.innerHTML = '✨ EPIC ✨'; }
    if (gamePlays === PACK2) achievement(`✨ Achievement! You are an EPIC ${SITE} player! ✨<br>You get... EVEN MORE GAMES! <span class=cyan>PACK 2</span>`, $('devoryGames'));
    if (gamePlays >= PACK3) { showPack3 = true; signifier.style.backgroundImage = 'linear-gradient(to bottom, rgba(255,0,0,0.5), rgba(0,0,0,0))'; signifier.innerHTML = '💫 ULTRA 💫'; }
    if (gamePlays === PACK3) achievement(`💫 Achievement! You are the ULTRA ${SITE} player! 💫<br>You get... EVEN MORE GAMES! <span class=yellow>PACK 3</span>`, $('devoryGames'));
    if (clickHack) {
      signifier.style.display = 'block';
      signifier.style.backgroundImage = 'linear-gradient(to bottom, rgba(0,255,99,0.5), rgba(0,0,99,0))';
      signifier.innerHTML = '🔓 LOGO CLICK HACK 🔓';
      document.title = '### HACK ###';
      document.documentElement.classList.add('greenCRT');
      gamesBlock.style.paddingTop = '55vh';
      gamesBlock.scrollIntoView({ block: 'start', behavior: 'auto' });
      setTimeout(() => { gamesBlock.style.paddingTop = '0'; $('devoryGamesMainTitle').scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 1500);
      setTimeout(() => { document.documentElement.classList.remove('greenCRT'); document.title = SITE; }, 7777);
    }
    renderMoreGames();
  }
  function renderMoreGames() {
    let title = '';
    const word = showPack2 ? '+MORE GAMES+' : 'MORE GAMES';
    const classes = deviceSpeed === 'fst' ? ['ggRed', 'ggOrange', 'ggYellow', 'ggLime', 'ggBlue', 'ggPurple'] : ['ggRedX', 'ggOrangeX', 'ggYellowX', 'ggLimeX', 'ggBlueX', 'ggPurpleX'];
    let k = Math.floor(Math.random() * classes.length);
    for (const ch of word) {
      title += `<div class='${classes[k]} notranslate'>${ch}</div>`;
      k++;
      if (ch === ' ') { title += '&nbsp;'; k--; }
      if (k >= classes.length || k < 0) k = 0;
    }
    $('devoryGamesMainTitle').innerHTML = title;
    let html = '';
    for (const [name, link, img, pack] of shuffle(window.moreGamesList.slice())) {
      if ((pack === '!2pk' && !showPack2) || (pack === '!3pk' && !showPack3)) continue;
      let footer = 'Clear';
      if (pack === '!2pk' && gamePlays - 4 < PACK2) footer = 'Cyan';
      if (pack === '!3pk' && gamePlays - 4 < PACK3) footer = 'Yellow';
      html += `<div class=gameThumbContainerMini><div class=gameThumbShine></div><div class=gameThumbGenColor${footer}>${name}</div><a href=${link}><img width=150 height=150 loading=lazy src=z/thumbs/${img} alt="${name}"></a></div>`;
    }
    $('devoryGamesContent').innerHTML = html;
  }
  initMoreGames();

  // Mascote do rodapé (15 jogadas).
  const poo = $('bottomPoo');
  poo.style.backgroundImage = Art.mascotStrip(cal.specialPeriod === 'christmas');
  if (gamePlays >= MASCOT && commonLang) {
    poo.style.display = 'block';
    if (gamePlays === MASCOT) achievement(`🌟 Achievement! You are a MASTER ${SITE} player! 🌟<br>You get a... <span class=brown>BIG BLOBBY BUDDY!</span><br>Because we love you. Click him!`, poo);
  }
  let pooState = 'sleeping', pooT1, pooT2;
  window.addEventListener('scroll', () => {
    const r = poo.getBoundingClientRect();
    const visible = r.top < window.innerHeight && r.bottom >= 0 && poo.style.display === 'block';
    if (visible && pooState === 'sleeping') { pooT1 = setTimeout(() => { poo.style.backgroundPosition = '-40vmin bottom'; }, 1500); clearTimeout(pooT2); pooState = 'normal'; }
    if (!visible && pooState === 'normal') { pooT2 = setTimeout(() => { poo.style.backgroundPosition = '0 bottom'; }, 5000); clearTimeout(pooT1); pooState = 'sleeping'; }
  });
  poo.addEventListener('click', () => {
    clearTimeout(pooT1);
    poo.style.backgroundPosition = '-80vmin bottom';
    Sound.play('mascot');
    setTimeout(() => { poo.style.backgroundPosition = '-40vmin bottom'; }, 2000);
  });

  // VIP (50 jogadas, inglês): feedback aberto.
  if (gamePlays >= VIP && shortLang === 'en') {
    signifier.style.display = 'block';
    signifier.style.backgroundImage = 'linear-gradient(to bottom, yellow, white, rgba(255,200,0,0.7), rgba(255,150,0,0.5), rgba(0,0,0,0))';
    signifier.style.textShadow = '3px 3px rgba(0,0,0,0.5)';
    signifier.innerHTML = `🏆 <span class=yellow>${SITE} VIP</span> 🏆`;
    $('feedback').style.display = 'block';
  }
  if (gamePlays === VIP && shortLang === 'en') {
    $('feedbackIntroText').innerHTML = `Hello ${SITE} VIP! Amazing gameplay from you! Out of all our players, there can't be many who know the site and the games as well as you. So... we have a very special favour to ask: what would you change or add? Thank you!`;
    achievement(`🏆 Achievement! You are now a <span class=yellow>${SITE} VIP</span>! 🏆<br>You get... TO TELL US STUFF!`, $('feedback'));
  }

  // Enter na home conta como jogada.
  document.addEventListener('keypress', e => { if (e.key === 'Enter') { gamePlays++; store.set('gamePlays', gamePlays); } });

  // ---------- Exibição inicial ----------
  if (gamePlays > 3) { displayGamesTimer = 500; $('loadingGamesExpander').style.animationDuration = '1s'; }
  if (gamePlays > 6) { displayGamesTimer = 1000; $('loadingGamesExpander').style.animationDuration = '2s'; }
  const initialTimer = displayGamesTimer;
  setTimeout(() => { displayGamesTimer = initialTimer; displayGames('*', '*'); $('frivDaily').style.paddingTop = '20vh'; }, initialTimer);

  // Primeira visita em retrato: grade só depois de 10 eventos de rolagem.
  function showContent() { $('scrollToPlay').style.display = 'none'; gamesBlock.style.display = 'block'; }
  if (window.innerWidth / window.innerHeight > 1 || pageViews > 1) showContent();
  else {
    $('scrollToPlay').style.display = 'block';
    let scrolls = 0, done = false;
    window.addEventListener('scroll', () => { scrolls++; if (!done && scrolls >= 10) { showContent(); done = true; } });
  }

  // Seções que entram com animação ao aparecer (80% da altura da janela).
  const animated = document.querySelectorAll('.scroll-animate');
  function handleScroll() {
    animated.forEach(el => {
      if (!el.classList.contains('visible') && el.style.display !== 'none' && el.getBoundingClientRect().top <= window.innerHeight * 0.8) el.classList.add('visible');
    });
  }
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleScroll);
  handleScroll();

  // Gráfico que cai (após 10 visitas, 2% de chance, aos 15 s).
  if ((pageViews > 10 && Math.random() > 0.98) || params.has('drop')) {
    setTimeout(() => {
      const drop = $('dropGfx');
      drop.style.backgroundImage = Art.dropSVG(Math.random() > 0.5 ? 0 : 1);
      setTimeout(() => Sound.play('crashdrop'), 8000);
      drop.style.animation = 'dropGfx 2.5s 5s ease-in forwards';
      const shake = 'shake 0.5s 8.3s cubic-bezier(0.36, 0.07, 0.19, 0.97), shake 0.5s 8.6s cubic-bezier(0.36, 0.07, 0.19, 0.97), shake 0.5s 8.9s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
      gamesBlock.style.animation = shake;
      $('frivDaily').style.animation = shake.replace(/8\.3s/, '8s');
    }, params.has('drop') ? 0 : 15000);
  }
  // Música depois de 12 horas com a página aberta.
  setTimeout(() => { const t = Sound.tune(1212, 'major', 120); t.play(); }, 43200000);

  // Títulos da aba quando a página perde o foco.
  const TITLE_SEQUENCES = [
    ['🎮⏩⏩⏩⏩😴', '🎮⏩⏩⏩😴⏩', '🎮⏩⏩😴⏩⏩', '🎮⏩😴⏩⏩⏩', '🎮😴⏩⏩⏩⏩', '😃 Wake up!'],
    ['😢 Hello?', '😃 Are you there?', '🙂 Come back and play!', '😲 We miss you!', '🙂 New games are waiting...', '🥳 ...and they won\'t play themselves!', '😃 Pretty please?', '😌 OK, we\'ll wait here.', '😴 zzz...'],
    ['🍕 Snack break?', '🍕 Fair enough.', '🎮 The games will wait...', '⏰ ...but not forever!', '😜 Just kidding, they will.'],
  ];
  const DEFAULT_COUNTER = -15;
  let titleCounter = DEFAULT_COUNTER, chosenTitles = 0, sequenceStarted = false;
  const titlePrefix = shortLang !== 'en' ? SITE.toUpperCase() + ': ' : '';
  setInterval(() => {
    if (document.hasFocus()) {
      chosenTitles = shortLang !== 'en' ? 0 : Math.floor(Math.random() * TITLE_SEQUENCES.length);
      titleCounter = DEFAULT_COUNTER;
      if (sequenceStarted) document.title = SITE;
    } else {
      titleCounter = titleCounter < TITLE_SEQUENCES[chosenTitles].length - 1 ? titleCounter + 1 : 0;
      if (titleCounter >= 0) { sequenceStarted = true; document.title = titlePrefix + TITLE_SEQUENCES[chosenTitles][titleCounter]; }
    }
  }, 2500);
  document.addEventListener('mousemove', () => { titleCounter = DEFAULT_COUNTER; if (sequenceStarted) document.title = SITE; });

  // Dicas para fãs (visitas 18–22 e 53–57, inglês).
  if (shortLang === 'en' && ((pageViews > 17 && pageViews < 23) || (pageViews > 52 && pageViews < 58))) {
    let tips = [
      `Every game on ${SITE} works in your browser – no downloads, no installs, no app store. Just click and play!`,
      `Click the little coloured tab under the search button to give ${SITE} a brand new colour scheme. Every 10th click resets it.`,
      `Your best scores are saved on this device, so you can come back later and try to beat them.`,
      `Some games are better on a computer with a keyboard, others are perfect for phones and tablets. Try both!`,
      `Thanks for being a regular visitor. The more you play, the more surprises you'll unlock...`,
    ];
    if (touchDevice) tips = tips.map(t => t.replace(/click/g, 'tap').replace(/Click/g, 'Tap').replace(/taped/g, 'tapped'));
    let tip = 0;
    const box = $('frivTips');
    const showTip = () => {
      box.innerHTML = `Fascinating Facts For Fanatical ${SITE} Fans ${tip + 1}/${tips.length} (${gestureWord} for next)<br>${tips[tip]}`;
      tip = (tip + 1) % tips.length;
    };
    box.style.display = 'block';
    showTip();
    box.addEventListener('click', showTip);
  }

  // Aviso para navegador sem WebP (após 5 s).
  let webpOK = true;
  const webp = new Image();
  webp.onerror = () => { webpOK = false; };
  webp.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
  setTimeout(() => {
    if (webpOK) return;
    const msg = {
      pt: 'Ops! Parece que seu navegador não suporta o formato gráfico WebP. Pode ser que o seu navegador ou dispositivo seja bastante antigo. Alguns gráficos podem estar faltando.',
      es: '¡Ups! Parece que su navegador no admite el formato de gráficos WebP. Puede ser que tu navegador o tu dispositivo sean bastante antiguos. Es posible que falten algunos gráficos.',
    }[shortLang] || "Ooops! It looks like your browser can't support the WebP graphics format. It could be that your browser or your device is quite old. Some graphics may be missing.";
    $('performanceAlert').innerHTML = '😟 ' + msg;
    $('performanceAlert').style.display = 'block';
  }, 5000);

  // Rodapé: ano e linha de diagnóstico.
  $('copyrightYear').innerHTML = '- ' + today.getFullYear();
  const start = performance.timing ? performance.timing.navigationStart : Date.now();
  window.addEventListener('load', () => {
    const loadingTime = 1 + Date.now() - start;
    setTimeout(() => {
      const ratio = Math.max(screen.width, screen.height) / Math.min(screen.width, screen.height);
      $('dBugText').innerHTML = `${dev.deviceCategory} ds:${deviceSpeed} sw:${screen.width} sh:${screen.height} sr:${Math.round(ratio * 100) / 100} plt:${loadingTime} scl:false rnd:${userRandom} gfx:${gfxPerformance}|${gfxPerformanceCategory} pv:${pageViews} gp:${gamePlays} du:${dressupCounter} Vx.xx`;
    }, 2000);
  });

  // Feedback: o original envia ao Google Analytics; o clone guarda no próprio navegador.
  function submitFeedback() {
    const form = $('feedback1');
    const text = Array.from(form.elements).map(e => e.value).join(':');
    try {
      const log = JSON.parse(localStorage.getItem('feedbackLog') || '[]');
      log.push({ when: new Date().toISOString(), text });
      localStorage.setItem('feedbackLog', JSON.stringify(log.slice(-50)));
    } catch (e) { /* ignora */ }
    $('feedback').innerHTML = "A BIG THANK YOU!<br>We're sorry we can't reply, but we read all your feedback, even if we have to stay up past our bedtime.";
    $('feedback').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // Se o script chegou até aqui, o alerta de erro de carregamento nunca aparece.
  $('userAlert').style.display = 'none';

  Object.assign(window, {
    displayGames, showSearchBox, searchBoxRemove, changeBackgroundColour, displayBackgroundColours,
    sortGamesAlpha, sortGamesPopularity, sortGamesDate, submitFeedback, incrementGamePlays,
  });
  window.Home = { cal, touchDevice, lang, shortLang, british, pageViews, get gamePlays() { return gamePlays; }, track, logoMusic: () => logoMusic, chosenJoke: () => chosenJoke };
})();

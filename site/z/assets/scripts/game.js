/* Página de jogo: lê window.game (definido no HTML), monta a tela de carregamento e abre o jogo no iframe. */
(function () {
  'use strict';
  const C = window.Core;
  const $ = id => document.getElementById(id);
  const game = window.game;
  const lang = (navigator.language || 'en').toLowerCase();
  const shortLang = lang.slice(0, 2);
  const british = lang === 'en-gb';

  const store = {
    get(k, d = 0) { try { const v = localStorage.getItem(k); return v === null ? d : Number(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { /* armazenamento indisponível */ } },
  };
  let gamePlays = store.get('gamePlays');

  // +1 jogada depois de 100 s na página (mesma regra do original).
  setTimeout(() => { gamePlays++; store.set('gamePlays', gamePlays); }, 100000);
  if (game.dressup) store.set('dressupCounter', store.get('dressupCounter') + 1);

  const TEXT = {
    en: { thankyou: 'Thank you!', waitLoading: 'Please <span class=lightYellow>WAIT</span> for this game to load ...it’s well worth it!', surveySound: '🎵 Please help! How would you rate the sound in this game? For example, if there is music, do you like it?', touchDesktopWarning: 'Notice: This game is designed to work on computers with a keyboard and mouse. It looks like you\'re using a mobile device. Tap <span class=orange>here</span> to play another great game on this site.' },
    pt: { thankyou: 'Obrigado!', waitLoading: 'Por favor, <span class=lightYellow>ESPERE</span> que este jogo carregue... vale muito a pena!', surveySound: '🎵 Por favor ajude! Como você avaliaria o som neste jogo? Por exemplo, se tem música, você gosta?', touchDesktopWarning: 'Aviso: Este jogo foi projetado para funcionar em computadores com teclado e mouse. Parece que você está usando um dispositivo móvel. Toque <span class=orange>aqui</span> para jogar outro ótimo jogo neste site.' },
    es: { thankyou: '¡Gracias!', waitLoading: 'Por favor, <span class=lightYellow>ESPERA</span> a que se cargue este juego... ¡vale la pena!', surveySound: '🎵 ¡Por favor ayuda! ¿Cómo calificarías el sonido de este juego? Por ejemplo, si hay música, ¿te gusta?', touchDesktopWarning: 'Aviso: Este juego está diseñado para funcionar en computadoras con teclado y ratón. Parece que estás usando un dispositivo móvil. Toca <span class=orange>aquí</span> para jugar otro gran juego en este sitio.' },
    fr: { thankyou: 'Merci !', waitLoading: 'Veuillez <span class=lightYellow>ATTENDRE</span> le chargement de ce jeu... ça en vaut la peine !', surveySound: "🎵 Aidez-nous s'il vous plaît ! Comment évalueriez-vous le son de ce jeu ? Par exemple, s'il y a de la musique, l'aimez-vous ?", touchDesktopWarning: 'Remarque : Ce jeu est conçu pour fonctionner sur des ordinateurs avec un clavier et une souris. Il semble que vous utilisiez un appareil mobile. Appuyez <span class=orange>ici</span> pour jouer à un autre super jeu.' },
  };
  const T = TEXT[shortLang] || TEXT.en;

  // Sistema operacional (mesma classificação usada para tela cheia e orientação).
  const ua = navigator.userAgent || '';
  const touchPoints = navigator.maxTouchPoints > 0;
  let os = 'Desktop';
  if (/android/i.test(ua) && touchPoints) os = 'Android';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && touchPoints)) os = 'iOS';
  const touchDevice = os === 'Android' || os === 'iOS';
  const allowFullScreen = true;

  if (!game.showBackButton || os === 'iOS') $('backButton').style.display = 'none';
  if (!game.showGameEffectsButton) $('gameEffectsButton').style.display = 'none';
  if (!game.walkthrough) $('walkthroughButton').style.display = 'none';

  $('gameMB').innerHTML = game.loadingSizeMB + 'MB';

  // Ícones de controle e teclas.
  if (!touchDevice) {
    let html = '';
    if (game.controls.indexOf('m') > -1) html += '<div id=mouse></div>';
    if (game.controls.indexOf('g') > -1) html += '<div id=gamepad></div>';
    if (game.controls.indexOf('k') > -1) html += '<div id=keyboard></div>';
    const KEY = { U: ['&uarr;', ''], D: ['&darr;', ''], L: ['&larr;', ''], R: ['&rarr;', ''], S: ['_', 'Large'], C: ['ctrl', 'Large'], V: ['alt', 'Large'], E: ['&#8626;', 'Medium'], T: ['&#8679;', 'Medium'], B: ['&#8646;', 'Medium'] };
    for (const ch of game.keys) {
      const [label, size] = KEY[ch] || [ch.toUpperCase(), ''];
      html += `<div class=key${size}><div class=keyCharacter>${label}</div></div>`;
    }
    $('infoBoxControls').innerHTML = html;
  } else {
    $('infoBoxControls').style.display = 'none';
  }

  // Tempos de carregamento derivados do tamanho do jogo.
  const secs = C.loadingSeconds(game.loadingSizeMB, game.loadingSeconds) + 's';
  $('spinner').style.animation = `spinner 2s linear forwards infinite, spinnerRemove 0s ${secs} linear forwards`;
  $('playButton').style.animation = `playButtonShow 0s ${secs} linear forwards, shake1 1s 15s cubic-bezier(0.36, 0.07, 0.19, 0.97)`;
  $('infoBoxLoadingBar').style.animation = `infoBoxLoadingBar ${secs} 1.5s linear forwards`;

  // Descrição: idioma do navegador quando existe; passar o mouse no título mostra em inglês.
  let en = game.enDescription;
  if (touchDevice) en = C.touchWording(en);
  en = en.replace(/mouze/g, 'mouse');
  if (british) en = en.replace(/Color/g, 'Colour').replace(/color/g, 'colour').replace(/favorite/g, 'favourite').replace(/donut/g, 'doughnut');
  const clickHereURL = '../../../';
  const deviceWarning = touchDevice && game.desktopOnly ? `<div class=red><a href='${clickHereURL}'>${T.touchDesktopWarning}</a></div>` : '';
  const deviceWarningEN = touchDevice && game.desktopOnly ? `<div class=red><a href='${clickHereURL}'>${TEXT.en.touchDesktopWarning}</a></div>` : '';
  const sizeWarning = game.loadingSizeMB > 29 ? ' ' + T.waitLoading : '';
  const sizeWarningEN = game.loadingSizeMB > 29 ? ' ' + TEXT.en.waitLoading : '';
  const localDesc = game[shortLang + 'Description'];
  const desc = $('infoBoxDesc');
  const title = $('infoBoxTitle');
  function fitDesc() { desc.style.fontSize = C.descriptionFontSize(desc.textContent.length); }
  function showLocal() { desc.innerHTML = (localDesc || en) + sizeWarning + deviceWarning; fitDesc(); }
  showLocal();
  if (localDesc && shortLang !== 'en') {
    title.style.cursor = 'cell';
    title.onmouseover = () => { desc.innerHTML = en + ' ' + sizeWarningEN + deviceWarningEN; fitDesc(); };
    title.onmouseout = showLocal;
  }
  title.innerHTML = game.title;
  const tSize = C.titleFontSize(game.title.length);
  if (tSize) title.style.fontSize = tSize;

  // Aos 22 s o título é "refeito" letra a letra (só títulos de uma linha).
  if (game.title.length < 27) {
    const chars = "!.?&'-: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ü";
    let shown = Array.from(game.title, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setTimeout(() => {
      const timer = setInterval(() => {
        for (let i = 0; i < 200; i++) {
          const k = Math.floor(Math.random() * game.title.length);
          if (shown[k] !== game.title[k]) shown = shown.slice(0, k) + chars[Math.floor(Math.random() * chars.length)] + shown.slice(k + 1);
          if (shown === game.title) { clearInterval(timer); break; }
        }
        title.innerHTML = shown;
      }, 100);
    }, 22000);
  }

  // Estrelas a partir do JSON-LD (aggregateRating).
  document.addEventListener('DOMContentLoaded', () => {
    const box = $('userStarRating');
    const schema = document.querySelector('script[type="application/ld+json"]');
    let rating;
    try { rating = JSON.parse(schema.textContent).aggregateRating; } catch (e) { rating = null; }
    if (!rating || rating.ratingValue == null) { box.style.display = 'none'; return; }
    if (touchDevice) { $('orientationIconPortrait').style.marginTop = '9vmin'; $('orientationIconLandscape').style.marginTop = '9vmin'; }
    const best = rating.bestRating || 5;
    const rounded = Math.round((rating.ratingValue / best) * 5 * 2) / 2;
    let html = `<span class="rating-number">${Number(rating.ratingValue).toFixed(1)}</span> `;
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) html += '<span class="star full-star">★</span>';
      else if (i - 0.5 === rounded) html += '<span class="star half-star">★</span>';
      else html += '<span class="star empty-star">☆</span>';
    }
    box.innerHTML = html;
    const stars = box.querySelectorAll('.star');
    box.addEventListener('mouseover', () => stars.forEach(s => { s.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg)`; s.style.transition = 'filter 0.3s ease-out'; }));
    box.addEventListener('mouseout', () => stars.forEach(s => { s.style.filter = 'hue-rotate(0deg)'; }));
  });

  function requestFullscreen(el) {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (fn) { try { const p = fn.call(el); if (p && p.catch) p.catch(() => {}); } catch (e) { /* recusado */ } }
  }
  function exitFullscreen() {
    const fn = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (fn && (document.fullscreenElement || document.webkitFullscreenElement)) { try { const p = fn.call(document); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignora */ } }
  }

  const gameBox = $('gameBox');
  function scaleGame() { gameBox.style.height = window.innerHeight + 'px'; gameBox.style.width = window.innerWidth + 'px'; }
  window.addEventListener('resize', scaleGame);

  $('loadingBox').addEventListener('click', e => {
    $('loadingOverlay').style.display = 'none';
    ['backButton', 'gameEffectsButton', 'walkthroughButton'].forEach(id => { $(id).style.animationPlayState = 'running'; });
    if (os !== 'iOS' && allowFullScreen) {
      e.preventDefault();
      requestFullscreen(document.documentElement);
      setTimeout(() => {
        setInterval(() => {
          const ratio = window.innerHeight / screen.height;
          $('fullScreenButton').style.display = ratio > 0.9 ? 'none' : 'block';
        }, 1000);
      }, 1000);
    }
    if ((game.orientation === 'Portrait' || game.orientation === 'Landscape') && game.orientationAdviceRequired) {
      checkOrientation();
      window.addEventListener('orientationchange', checkOrientation);
    }
    scaleGame();
    gameBox.focus();
  });

  // Ícone de orientação em toque; pisca se a tela estiver na orientação errada.
  if (touchDevice) {
    const icon = game.orientation === 'Landscape' ? 'orientationIconLandscape' : 'orientationIconPortrait';
    $(icon).style.animationPlayState = 'running';
    setTimeout(() => {
      const landscape = screen.width > screen.height;
      if ((game.orientation === 'Landscape' && !landscape) || (game.orientation === 'Portrait' && landscape)) $(icon).style.animation = 'brightFlash 3s forwards';
    }, 8000);
  }
  function checkOrientation() {
    setTimeout(() => {
      const landscape = screen.width > screen.height;
      const wrong = (game.orientation === 'Landscape' && !landscape) || (game.orientation === 'Portrait' && landscape);
      $('orientationOverlay').style.display = wrong ? 'block' : 'none';
      if (wrong) setTimeout(() => { $('orientationOverlay').style.display = 'none'; }, 3000);
    }, 500);
  }

  if (os !== 'iOS' && allowFullScreen) {
    $('fullScreenButton').addEventListener('click', e => { e.preventDefault(); requestFullscreen(document.documentElement); $('fullScreenButton').style.display = 'none'; });
  }
  setTimeout(() => {
    $('backButton').addEventListener('click', e => {
      e.preventDefault();
      exitFullscreen();
      window.location.assign(clickHereURL);
    });
  }, 999);
  $('walkthroughButton').addEventListener('click', () => window.open(game.walkthrough));

  setInterval(() => { if (document.activeElement !== gameBox && $('loadingOverlay').style.display === 'none') gameBox.focus(); }, 500);

  gameBox.src = game.source;
  scaleGame();

  // Botão de efeitos: 23 efeitos em sequência, como no original.
  let effects = 0;
  const overlay = $('gameOverlay');
  const scanDots = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Crect width='1' height='1' fill='rgba(0,0,0,0.6)'/%3E%3C/svg%3E\")";
  const steps = [
    () => { const b = $('gameEffectsButton'); b.style.animation = 'none'; b.style.right = '0'; $('gameEffectsIndicator').style.opacity = '0.5'; b.style.opacity = '0.5'; },
    () => { overlay.style.backgroundImage = scanDots; overlay.style.backgroundSize = '3px 3px'; },
    () => { overlay.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.2),rgba(0,0,0,0.0))'; overlay.style.backgroundSize = '100% 0.5%'; },
    () => { overlay.style.backgroundImage = 'none'; gameBox.style.filter = 'hue-rotate(60deg)'; },
    () => { gameBox.style.filter = 'hue-rotate(120deg)'; },
    () => { gameBox.style.filter = 'hue-rotate(180deg)'; },
    () => { gameBox.style.filter = 'hue-rotate(240deg)'; },
    () => { gameBox.style.filter = 'blur(0.5vmin)'; },
    () => { gameBox.style.filter = 'blur(2vmin)'; },
    () => { gameBox.style.filter = 'none'; gameBox.style.transform = 'skewX(15deg)'; },
    () => { gameBox.style.transform = 'skewX(-15deg)'; },
    () => { gameBox.style.transform = 'scale(-1,-1)'; },
    () => { gameBox.style.transform = 'scaleX(-1)'; },
    () => { gameBox.style.transform = 'scaleY(-1)'; },
    () => { gameBox.style.transform = 'none'; gameBox.style.filter = 'grayscale(100%)'; },
    () => { gameBox.style.filter = 'sepia(100%)'; },
    () => { gameBox.style.filter = 'contrast(200%)'; },
    () => { gameBox.style.filter = 'brightness(50%)'; },
    () => { gameBox.style.filter = 'invert(100%)'; },
    () => { gameBox.style.filter = 'none'; gameBox.style.animation = 'shake2 1s infinite'; },
    () => { gameBox.style.animation = 'shake3 1s infinite'; },
    () => { gameBox.style.animation = 'rock 1s ease-in-out alternate infinite'; },
    () => { gameBox.style.animation = 'roll 10s linear infinite'; },
    () => { gameBox.style.animation = 'none'; effects = 0; },
  ];
  $('gameEffectsButton').addEventListener('click', () => {
    gameBox.style.transition = '1s';
    steps[effects]();
    $('gameEffectsIndicator').innerHTML = effects;
    effects++;
  });

  // Pesquisa de som: só desktop, 30% das vezes, após 4 minutos; some em 30 s sem interação.
  if (game.musicVote && Math.random() > 0.7 && ['en', 'es', 'pt', 'fr'].includes(shortLang) && os === 'Desktop') {
    setTimeout(() => {
      const box = $('spare1');
      let touched = false;
      box.style.display = 'block';
      box.innerHTML = T.surveySound + '&nbsp;&nbsp;<span id=spare1ThumbsUp>👍</span>&nbsp;&nbsp;<span id=spare1ThumbsDown>👎</span>';
      box.onmouseover = () => { touched = true; };
      const done = () => { box.innerHTML = T.thankyou + ' 😊'; setTimeout(() => { box.style.display = 'none'; }, 2000); };
      $('spare1ThumbsUp').addEventListener('click', done);
      $('spare1ThumbsDown').addEventListener('click', done);
      setTimeout(() => { if (!touched) box.style.display = 'none'; }, 30000);
    }, 240000);
  }

  // Após 10 jogadas, 10% de chance de trocar a descrição por uma mensagem do portal aos 2 minutos.
  const promo = [
    `😁 You can play ${game.title} and every game on ${C.SITE.name} without a single ad interruption. Enjoy!`,
    `😃 Like ${C.SITE.name}? Tell your friends! The more players we have, the more games we can add.`,
    `😜 Psst... on the ${C.SITE.name} menu page, click the logo 10 times for some secret extra games!`,
    `😇 Thanks for playing ${game.title}. We think you're brilliant!`,
  ];
  setTimeout(() => {
    if (gamePlays > 10 && Math.random() > 0.9 && shortLang === 'en') desc.innerHTML = promo[Math.floor(Math.random() * promo.length)] + sizeWarning + deviceWarning;
  }, 120000);

  // Sem menu de contexto, nem na página nem dentro do jogo.
  document.addEventListener('contextmenu', e => e.preventDefault());
  setTimeout(() => {
    try {
      const body = gameBox.contentWindow.document.body;
      if (body) body.addEventListener('contextmenu', e => e.preventDefault());
    } catch (e) { /* iframe de outra origem */ }
  }, 5000);

  if (touchDevice) {
    setTimeout(() => {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
      document.head.appendChild(meta);
    }, 7000);
  }
})();

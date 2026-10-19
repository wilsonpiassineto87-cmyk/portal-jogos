/* Núcleo de regras do portal: funções puras, usadas pela página e pelos testes (Node). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Core = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SITE = {
    name: 'Jogatina',
    domain: 'jogatina.local',
    year: 2026,
  };

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Pares de cor das faixas, um por dia da semana (domingo = 0).
  const DAILY_COLOURS = [
    ['#009', '#00b'], ['#633', '#755'], ['#050', '#070'], ['#06a', '#09d'],
    ['#60c', '#82e'], ['#25c', '#47e'], ['#906', '#c18'],
  ];

  const SEASON_GRADIENTS = {
    valentines: 'linear-gradient(to right, firebrick 0%, deeppink 10%, deeppink 90%, firebrick 100%)',
    christmas: 'linear-gradient(to right, green 0%, firebrick 10%, firebrick 90%, green 100%)',
    halloween: 'linear-gradient(to right, orangered 0%, darkorange 10%, darkorange 90%, orangered 100%)',
  };

  function dayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  // Datas comemorativas: mesma ordem de avaliação do original (as últimas sobrescrevem).
  function getCalendar(today) {
    const day = today.getDay();
    const month = today.getMonth();
    const date = today.getDate();
    let specialDay;
    let specialPeriod;
    if (date === 1) specialDay = 'firstOfMonth';
    if (date === 13 && day === 5) specialDay = 'friday13th';
    if (month === 1 && date > 9 && date < 15) specialPeriod = 'valentines';
    if (month === 1 && date === 14) specialDay = 'valentinesDay';
    if ((month === 2 && date >= 25) || (month === 3 && date <= 5)) specialPeriod = 'easter';
    if (month === 3 && date === 5) specialDay = 'easterSunday';
    if (month === 2 && date === 17) specialDay = 'stPatricksDay';
    if (month === 3 && date === 1) specialDay = 'aprilFoolsDay';
    if (month === 5 && date > 14 && date < 22 && day === 0) specialDay = 'fathersDay';
    if (month === 9) specialPeriod = 'preHalloween';
    if ((month === 9 && date > 7) || (month === 10 && date < 1)) specialPeriod = 'halloween';
    if (month === 9 && date === 31) specialDay = 'halloween';
    if ((month === 10 && date > 10) || (month === 11 && date < 24)) specialPeriod = 'endOfYear';
    if ((month === 10 && date > 23) || month === 11) specialPeriod = 'christmas';
    const december = { 20: 'dec20th', 21: 'dec21st', 22: 'dec22nd', 23: 'dec23rd', 24: 'christmasEve', 25: 'christmasDay', 26: 'boxingDay', 31: 'newYearsEve' };
    if (month === 11 && december[date]) specialDay = december[date];
    if (month === 0 && date === 1) specialDay = 'newYearsDay';
    return {
      hour: today.getHours(), day, month, date,
      dayOfYear: dayOfYear(today),
      secondMonth: month % 2 === 1 ? 31 : 0,
      specialDay, specialPeriod,
    };
  }

  function dateSuffix(date) {
    if (date === 1 || date === 21 || date === 31) return 'st';
    if (date === 2 || date === 22) return 'nd';
    if (date === 3 || date === 23) return 'rd';
    return 'th';
  }

  // Frase do cabeçalho da seção diária ("It's Monday 19th October!").
  function calendarStrap(cal) {
    let s1 = DAY_NAMES[cal.day];
    let s2 = cal.date + dateSuffix(cal.date) + ' ' + MONTH_NAMES[cal.month];
    let emoji = null;
    switch (cal.specialDay) {
      case 'firstOfMonth': s1 = 'pinch punch time on ' + s1; break;
      case 'friday13th': s1 = 'only GOOD luck on ' + SITE.name + ' on...'; s2 = 'FRIDAY THE 13TH'; emoji = '👌'; break;
      case 'valentinesDay': s1 = "time for lovin' on..."; s2 = "VALENTINE'S&nbsp;DAY"; emoji = '💛'; break;
      case 'stPatricksDay': s1 = 'time to catch a leprechaun on...'; s2 = "ST.&nbsp;PATRICK'S&nbsp;DAY"; emoji = '🍀'; break;
      case 'aprilFoolsDay': s1 = 'time for japes on...'; s2 = 'APRIL&nbsp;FOOLS&nbsp;DAY'; emoji = '💫'; break;
      case 'fathersDay': s1 = "not too late! In most countries it's..."; s2 = "FATHER'S&nbsp;DAY"; emoji = '👨'; break;
      case 'halloween': s1 = 'getting really spooky...'; s2 = 'HAPPY&nbsp;HALLOWEEN'; emoji = '👻'; break;
      case 'christmasEve': s1 = "exciting! Santa's coming! It's..."; s2 = 'CHRISTMAS&nbsp;EVE'; emoji = '🎅'; break;
      case 'christmasDay': s1 = 'finally here! We wish you a...'; s2 = 'MERRY&nbsp;CHRISTMAS'; emoji = '🎄'; break;
      case 'boxingDay': s1 = 'time to eat some leftovers on...'; s2 = 'BOXING&nbsp;DAY'; emoji = '📦'; break;
      case 'newYearsEve': s1 = 'nearly time to celebrate on...'; s2 = 'NEW&nbsp;YEARS&nbsp;EVE'; emoji = '🎉'; break;
      case 'newYearsDay': s1 = 'time to make a resolution on...'; s2 = 'NEW&nbsp;YEARS&nbsp;DAY'; emoji = '🎆'; break;
      default:
    }
    return { text: "It's " + s1 + ' ' + s2 + '!', emoji };
  }

  function bandGradient(cal) {
    const [a, b] = DAILY_COLOURS[cal.day];
    return SEASON_GRADIENTS[cal.specialPeriod] || `linear-gradient(to right, ${a}, ${b}, ${a})`;
  }

  // Classificação do dispositivo, como no original (define quais jogos aparecem e a ordem).
  function detectDevice(ua, platform, maxTouchPoints) {
    const agent = (ua || '').toLowerCase();
    const touchPoints = maxTouchPoints > 0;
    let os = 'Desktop';
    if (/android/i.test(agent) && touchPoints) os = 'Android';
    if (platform === 'iPad') os = 'iPadOld';
    if (platform === 'MacIntel' && touchPoints) os = 'iPadNew';
    if (/iphone|ipod/.test(agent)) os = 'iPhone';
    const touchDevice = ['Android', 'iPadOld', 'iPadNew', 'iPhone'].includes(os);
    const m = agent.match(/android\s([0-9.]*)/i);
    const androidVersion = m ? parseInt(m[1], 10) : 0;
    let deviceCategory = os;
    let deviceSpeed = 'fst';
    if (os === 'Android') {
      let band = 'Low';
      if (androidVersion <= 8) deviceSpeed = 'Slw';
      if (androidVersion >= 9 && androidVersion <= 10) band = 'Mid';
      if (androidVersion >= 11) band = 'High';
      deviceCategory += band;
    }
    let popIndex = 8;
    if (os === 'Android') popIndex = 9;
    if (os === 'iPadOld' || os === 'iPadNew') popIndex = 10;
    if (os === 'iPhone') popIndex = 11;
    return { os, deviceCategory, touchDevice, gestureType: touchDevice ? 'Tap' : 'Click', popIndex, androidVersion, deviceSpeed };
  }

  // Formato de jogo: [nome, caminho, caminhoIPad, caminhoIPhone, imagem, dispositivos, gêneros, data, pop desktop, pop android, pop ipad, pop iphone]
  function gameVisible(g, opts) {
    const tags = g[6];
    if (tags.indexOf('FGO') > -1 && !(opts.gfxPerformanceCategory >= 3)) return false;
    if (tags.indexOf('SUO') > -1 && !(opts.gamePlays > 6 || opts.testVer)) return false;
    if (opts.isSchool && tags.indexOf('NFS') > -1) return false;
    if (g[5].indexOf(opts.deviceCategory) === -1 && !opts.testVer) return false;
    return true;
  }

  function matchesSearch(g, genre, firstLetter) {
    const genreOk = genre === '*' || g[6].indexOf(genre) > -1;
    if (!genreOk) return false;
    const first = g[0].slice(0, 1);
    return firstLetter === '*' || first === firstLetter || (Number.isInteger(parseInt(first, 10)) && firstLetter === '0');
  }

  function filterGames(games, genre, firstLetter, opts) {
    return games.filter(g => gameVisible(g, opts) && matchesSearch(g, genre, firstLetter));
  }

  function searchResultMessage(genre, firstLetter, count) {
    if (count === 0) return 'Sorry. No games found. Please search again.';
    const word = count === 1 ? 'game' : 'games';
    const letter = firstLetter === '0' ? '0-9' : firstLetter;
    if (genre === '*' && letter !== '*') return `${count} ${word} found starting with ${letter}.`;
    if (genre !== '*' && letter === '*') {
      let g = genre;
      if (g === 'New') g += ' / recently added';
      if (g === '2Player') g = 'compatible 2 Player';
      if (g === 'Math') g = 'Math and number';
      if (g === 'Xmas') g = 'Christmas / Winter';
      g = g.replace('Math', 'Math / Number / Logic').replace('Word', 'Word / Language');
      return `${count} ${g} ${word} found.`;
    }
    return `All games A-Z: ${count}.`;
  }

  function sortAscend(index) {
    return (a, b) => (a[index] === b[index] ? 0 : (String(a[index]).toLowerCase() < String(b[index]).toLowerCase() ? -1 : 1));
  }
  function sortDecend(index) {
    return (a, b) => (a[index] === b[index] ? 0 : (String(a[index]).toLowerCase() > String(b[index]).toLowerCase() ? -1 : 1));
  }
  function sortAscendNum(index) {
    return (a, b) => (a[index] === b[index] ? 0 : a[index] - b[index]);
  }

  function displayName(name) {
    return name.replace(/~/g, '&nbsp;'.repeat(20) + ' ').replace(/_/g, '&nbsp;');
  }

  // Teste do amor: mesmo algoritmo e mesmas validações do original.
  function checkName(name) {
    const n = String(name).replace(/\s/g, '');
    return !(/[0-9]/.test(n) || n.length < 2);
  }
  function normalizeName(name) {
    let n = String(name).replace(/\s/g, '');
    n = n + n + n + n;
    return n.toUpperCase().slice(0, 6);
  }
  function calcNames(first, second) {
    const bonus = [76, 79, 86, 69, 83]; // L O V E S
    let count = 0;
    for (const word of [normalizeName(first), normalizeName(second)]) {
      for (let i = 0; i < word.length; i++) {
        const c = word.charCodeAt(i);
        count += c < 91 ? c - 64 : 77;
        if (bonus.includes(c)) count += 20;
      }
    }
    while (count > 370) count -= 155;
    count = Math.floor(count * 0.35);
    if (count > 100) count = 100;
    if (count < 10) count += count;
    return count;
  }
  const LOVE_TEXT = [
    'Enter two first names in the boxes below and then click on the button to calculate the lurve! 😍<br><br>',
    'CALCULATE!',
    'TRY AGAIN',
    'ENTER YOUR NAME',
    'ENTER ANOTHER NAME',
    "Hmmm. Maybe this isn't the best match...",
    'You like each other. Maybe keep it as just friends?',
    'Now this could be a match!',
    'Kiss kiss! This is a match made in heaven!',
    'Surely this is true love! A fairytale made real!',
    'MORE GAMES',
  ];
  // Rótulos do teste do amor por idioma (o texto de introdução só existe em inglês). r = tamanho reduzido da fonte dos campos.
  const LOVE_I18N = {
    nl: { t: ["BEREKENEN!", "OPNIEUW", "VOER JE NAAM IN", "VUL EEN ANDERE NAAM IN", "Jullie passen niet echt goed bij elkaar...", "Jullie vinden elkaar leuk, maar misschien gewoon als vrienden?", "Hmm, jullie passen goed bij elkaar!", "De liefde zit in de lucht! Jullie zijn voor elkaar gemaakt!", "Dit is ware liefde, jullie zijn een sprookje!"], r: 0 },
    fr: { t: ["CALCULE!", "ESSAYER ENCORE UNE FOIS", "ENTRE TON NOM", "ENTRE LE NOM DE L’AUTRE PERSONNE", "Ce ne serait sans doute pas le couple idéal...", "Vous vous aimez bien, mais comme des amis, pas plus.", "Hmm, ça pourrait aller!", "Y a de l'amour dans l'air ! Votre union est écrite dans les étoiles!", "C'est le grand amour, vous allez vivre un véritable conte de fées!"], r: 4 },
    de: { t: ["BERECHNEN!", "NOCHMAL PROBIEREN", "BITTE GIB DEINEN NAMEN EIN", "GIB EINEN WEITEREN NAMEN EIN", "Ihr passt nicht wirklich gut zueinander...", "Ihr mögt euch, aber vielleicht nur als Freunde?", "Hmm, ihr könntet zueinander passen!", "Ihr liebt euch und seid füreinander bestimmt!", "Das ist wahre Liebe. Wie in einem Märchen!"], r: 4.5 },
    es: { t: ["¡CALCULAR!", "VOLVER A INTENTARLO", "ESCRIBE TU NOMBRE", "ESCRIBE OTRO NOMBRE", "Puede que no hagáis muy buena pareja...", "Os gustáis, pero puede que sólo como amigos...", "¡Hmm, podríais hacer buena pareja!", "¡Aquí se respira amor! ¡Sois una pareja ideal!", "¡Amor verdadero! ¡Vives un cuento de hadas!"], r: 6 },
    pt: { t: ["CALCULAR!", "VOLVER A INTENTARLO", "ESCREVA O SEU NOME", "ESCREVA OUTRO NOME", "Pode não ser uma boa combinação...", "Vocês se gostam, mas talvez só como amigos.", "Hmm, pode dar certo!", "Sinto cheiro de amor! Vocês são almas gêmeas!", "É amor verdadeiro! Amor de conto de fadas!"], r: 6 },
    it: { t: ["CALCOLA!", "RIPROVA", "DIGITA IL TUO NOME", "DIGITA UN ALTRO NOME", "Questo potrebbe non essere il miglior affiatamento...", "Vi piacete, ma forse solo come amici?", "Hmm, questo potrebbe essere un'affiatamento!", "L'amore è nell'aria! Dio li fa e poi li accoppia!", "Questo è vero amore. La fiaba è vostra!"], r: 6 },
    se: { t: ["ANALYSERA!", "FÖRSÖK IGEN", "ANGE DITT NAMN", "ANGE DEN ANDRES NAMN", "Ni passar kanske inte så bra ihop...", "Ni tycker om varandra, men mest som vänner?", "Hmm, ni kan passa bra ihop!", "Kärleken är stark! Ni två är som gjorda för varandra!", "Det här är äkta kärlek. Rena sagodrömmen!"], r: 5.8 },
    pl: { t: ["OBLICZ!", "SPRÓBUJ PONOWNIE", "WPROWADŹ SWOJE IMIĘ", "WPISZ INNE IMIĘ", "Być może to nie jest najlepszy wybór...", "Lubicie się, ale może tylko jako przyjaciele?", "Hmm, całkiem niezłe dopasowanie!", "Miłość wisi w powietrzu! To przeznaczenie zapisane w niebie!", "To prawdziwa miłość. Zupełnie jak z bajki!"], r: 6 },
    ru: { t: ["ПРОВЕРИТЬ!", "ЕЩЕ РАЗ", "ВВЕДИТЕ ВАШЕ ИМЯ", "ВВЕДИТЕ ЕГО/ЕЕ ИМЯ", "Пожалуй, вы не лучшая пара...", "Вы нравитесь друг другу, но, быть может, это просто дружба?", "Хм, из вас может выйти хорошая пара!", "В воздухе пахнет любовью! Вы просто созданы друг для друга!", "Настоящая любовь – прямо как в сказке!"], r: 6 },
    tr: { t: ["HESAPLA!", "TEKRAR DENE", "İSMİNİZİ GİRİN", "ONUN İSMİNİ GİRİN", "Mükemmel bir çift olmayabilirsiniz...", "Birbirinizi seviyorsunuz, ama belki de sadece arkadaş olarak?", "Hmm iyi bir çift olabilirsiniz!", "Havada aşk kokusu var! Melekleri bile kıskandıracak bir aşk!", "İşte gerçek aşk. Sizinki bir peri masalı!"], r: 0 },
    id: { t: ["HITUNG!", "COBA LAGI", "MASUKKAN NAMA ANDA", "MASUKKAN NAMA LAIN", "Ini mungkin bukanlah pasangan yang terbaik...", "Kalian saling menyukai, tapi mungkin hanya sebagai teman?", "Hmm, ini bisa merupakan pasangan!", "Cinta bersemi! Pasangan ini diciptakan di surga!", "Ini ialah cinta sejati. Kisah dongeng ini milik anda!"], r: 5.8 },
    my: { t: ["KIRA!", "CUBA LAGI", "MASUKKAN NAMA ANDA", "MASUKKAN NAMA LAIN", "Ini mungkin bukan pasangan terbaik...", "Anda menyukai satu sama lain, tetapi mungkin hanya sebagai kawan?", "Hmm, ini mungkin satu pasangan!", "Kasih sayang di awang-awangan! Ia padanan dibuat di syurga!", "Ini cinta sejati. Kisah dongeng ini milik anda!"], r: 6 },
    jp: { t: ["診断開始！", "もう1度トライする", "あなたの名前を入力して下さい", "相手の名前を入力して下さい", "お世辞にも相性が良いとは言えません...", "お互いに好意はあるようですが、ただの友達止まりかも...?", "なかなかの相性です！", "あなた達2人は結ばれる運命にあります！", " 真実の愛はそこに！2人で新たな愛の歴史を築きましょう!"], r: 5 },
    zh: { t: ["診断開始！", "再来一次", "输入你的姓名", "输入她/他的姓名", "这不是一对很好的组合...", "你们对对方有好感，但也许只是朋友。", "嗯~不错的一组！", "天生一对！", "这是真正的爱！仿佛只在童话中才有的爱情！"], r: 0 },
  };
  function loveText(shortLang) {
    const tr = LOVE_I18N[shortLang];
    if (!tr) return { text: LOVE_TEXT, reduceBoxes: 0 };
    return { text: [''].concat(tr.t, LOVE_TEXT.slice(10)), reduceBoxes: tr.r };
  }
  function loveTagline(pct, text) {
    const L = text || LOVE_TEXT;
    let t = L[5];
    if (pct > 40) t = L[6];
    if (pct > 60) t = L[7];
    if (pct > 80) t = L[8];
    if (pct === 100) t = L[9];
    return t;
  }

  // Teste de reação: mesmas faixas e frases do original.
  function reactionVerdict(averageTime) {
    let congrats = 'Try again each day to see if you can get faster!';
    let ranking = 0;
    if (averageTime > 3) congrats = 'Did you fall asleep?!';
    if (averageTime < 0.9) { congrats = 'Keep practicing! You will get even faster!'; ranking = 6.61; }
    if (averageTime < 0.7) { ranking = 2.3; congrats = 'You scored 8/10! Good going! See if you can get even faster!'; }
    if (averageTime < 0.6) { ranking = 0.66; congrats = 'You scored: 9/10! Nice work. You are pretty fast!'; }
    if (averageTime < 0.5) { ranking = 0.2; congrats = 'You scored 109/10! Congrats! You are seriously fast!'; }
    if (averageTime < 0.4) { ranking = 0.12; congrats = 'You scored: 11/10! Wow! You are a fly!'; }
    if (averageTime < 0.3) { ranking = 0.05; congrats = 'You scored: #$!£*/10! YOU-ARE-SUPERHUMAN!'; }
    return { congrats, ranking };
  }

  // Página de jogo: tempo do spinner a partir do tamanho do download.
  function loadingSeconds(mb, setting) {
    if (setting !== 'auto' && setting !== undefined) return Number(setting);
    return Math.min(12, Math.max(6, mb));
  }
  function descriptionFontSize(len) {
    if (len > 250) return '1.7vmax';
    if (len > 220) return '1.9vmax';
    return '2.5vmax';
  }
  function titleFontSize(len) {
    if (len > 30) return '3.5vmax';
    if (len > 28) return '5vmax';
    if (len > 24) return '4vmax';
    return null;
  }
  function touchWording(text) {
    return text.replace(/clicking/g, 'tapping').replace(/Clicking/g, 'Tapping')
      .replace(/click/g, 'tap').replace(/Click/g, 'Tap').replace(/mouze/g, 'finger');
  }

  const WELCOME = {
    es: '¡Bienvenido!', pt: 'Bem-vindo!', fr: 'Bienvenue!', pl: 'Witaj!', el: 'Καλώς ήλθες!', id: 'Selamat datang!',
    ar: 'مرحباً!', he: 'ברוך הבא', hr: 'Dobrodošli!', sk: 'Vitajte!', tr: 'Hoşgeldiniz!', sr: 'Добродошли!',
    ro: 'Bine ai venit!', ru: 'Добро пожаловать!', th: 'ยินดีต้อนรับ', de: 'Willkommen!', it: 'Benvenuto!',
    hu: 'Üdvözlünk!', bg: 'Здравей!', da: 'Velkommen!', nb: 'Velkommen!', sv: 'Välkommen!', ca: 'Benvingut!',
    cs: 'Vítejte!', sl: 'Dobrodošli!', ka: 'მოგესალმებით!', nl: 'Welkom!', zh: '欢迎！', sq: 'Mirë se vini!',
    lt: 'Sveiki!', lv: 'Laipni lūdzam!', vi: 'Chào mừng!',
  };
  // Idiomas com escrita não latina não usam o efeito de letras sorteadas.
  const NO_BLAST = ['el', 'ar', 'he', 'sr', 'ru', 'th', 'bg', 'ka', 'zh'];
  function welcomeText(shortLang) {
    return { text: WELCOME[shortLang] || 'Welcome!', blastAllowed: !NO_BLAST.includes(shortLang) };
  }

  // Exibe o valor da cor "nice" (seletor de fundo).
  const NICE_COLOURS = ['red', 'orange', 'yellow', 'cyan', 'green', 'lime', 'blue', 'navy', 'purple', 'magenta',
    'deepPink', 'crimson', 'dodgerBlue', 'blueViolet', 'violet', 'teal', 'darkTurquoise', 'indigo'];

  return {
    SITE, DAY_NAMES, MONTH_NAMES, DAILY_COLOURS, SEASON_GRADIENTS, NICE_COLOURS, LOVE_TEXT,
    dayOfYear, getCalendar, dateSuffix, calendarStrap, bandGradient, detectDevice,
    gameVisible, matchesSearch, filterGames, searchResultMessage,
    sortAscend, sortDecend, sortAscendNum, displayName,
    checkName, normalizeName, calcNames, loveTagline, loveText, LOVE_I18N, reactionVerdict,
    loadingSeconds, descriptionFontSize, titleFontSize, touchWording, welcomeText,
  };
});

/* Seção diária: música, imagens, quebra-cabeça, piada, sons, teste de reação, teste do amor, charada, limerique, ilusão, trava-língua, história e vídeo. */
(function () {
  'use strict';
  const C = window.Core;
  const D = window.DailyData;
  const H = window.Home;
  const $ = id => document.getElementById(id);
  const cal = H.cal;
  const date = cal.date;
  const special = cal.specialDay;
  const pickBy = (list, i) => list[((i % list.length) + list.length) % list.length];
  const scrollTo = (el, block = 'end') => el.scrollIntoView({ block, behavior: 'smooth' });

  // ---------- Exclusividade de áudio: tocar um pausa os outros ----------
  let chiptune = null;
  let chiptunePlaying = false;
  const video = $('funnyVideoContainer');
  function pauseOthers(except) {
    if (except !== 'chiptune' && chiptunePlaying) pauseChiptune();
    if (except !== 'video' && !video.paused) video.pause();
    if (except !== 'story' && storyPlaying) storyPause();
    if (except !== 'logo' && H.logoMusic && H.logoMusic()) H.logoMusic().pause();
  }

  // ---------- Cabeçalho ----------
  $('todaysDateEmoji1').innerHTML = pickBy(D.dateEmojis, date);
  $('todaysDateEmoji2').innerHTML = pickBy(D.dateEmojis, date + 3);
  const strap = C.calendarStrap(cal);
  $('dateStrap').innerHTML = strap.text;
  if (strap.emoji) $('todaysDateEmoji1').innerHTML = $('todaysDateEmoji2').innerHTML = strap.emoji;

  // ---------- Blocos de texto só para navegadores em inglês ----------
  if (H.lang.indexOf('en') > -1) {
    ['frivolousFactEmoji', 'frivolousFact', 'frivolousFactBottomBar', 'famousQuoteEmoji', 'famousQuote', 'famousQuoteBottomBar',
      'jokeEmoji', 'jokeA', 'jokeB', 'riddleEmoji', 'riddleA', 'riddleB', 'riddleChangeDifficulty', 'limerickEmoji', 'limerickA',
      'tongueTwisterEmoji', 'tongueTwisterA', 'storyEmoji', 'storyA'].forEach(id => { $(id).style.display = 'block'; });
  }

  // ---------- Votação ----------
  const BARS = {
    Chiptune: 'chiptuneBottomBar', Joke: 'jokeBottomBar', 'Famous Quote': 'famousQuoteBottomBar', 'Funny Video': 'funnyVideoBottomBar',
    'Amazing Picture': 'amazingImageBottomBar', Fact: 'frivolousFactBottomBar', Limerick: 'limerickBottomBar', 'Tongue Twister': 'tongueTwisterBottomBar',
    Story: 'storyBottomBar', 'Street Art': 'streetArtBottomBar', 'Cute Picture': 'cuteImageBottomBar', 'Daily GIFs': 'dailyGIFBottomBar',
    Puzzle: 'puzzleBottomBar', 'Optical Illusion': 'opticalIllusionBottomBar',
  };
  function contentVote(content) {
    if (BARS[content]) $(BARS[content]).innerHTML = '✅';
    try {
      const votes = JSON.parse(localStorage.getItem('dailyVotes') || '{}');
      votes[`${content}|${new Date().toDateString()}`] = arguments[1];
      localStorage.setItem('dailyVotes', JSON.stringify(votes));
    } catch (e) { /* ignora */ }
  }

  // ---------- Chiptune do dia ----------
  function playChiptune() {
    if (!chiptune) chiptune = Sound.tune(1000 + date + cal.month * 31, ['major', 'minor', 'major', 'festive'][date % 4], 120 + (date % 5) * 10);
    if (chiptunePlaying) { pauseChiptune(); return; }
    pauseOthers('chiptune');
    $('chiptune').innerHTML = 'Chiptune Playing';
    chiptune.play();
    chiptunePlaying = true;
    $('chiptune').style.animationPlayState = 'running';
  }
  function pauseChiptune() {
    $('chiptune').innerHTML = 'Chiptune Paused';
    if (chiptune) chiptune.pause();
    chiptunePlaying = false;
    $('chiptune').style.animationPlayState = 'paused';
  }

  // ---------- Imagens do dia (fofa, incrível, arte de rua) ----------
  const XMAS_INDEX = { dec20th: 1, dec21st: 2, dec22nd: 3, dec23rd: 4, christmasEve: 5, christmasDay: 6 };
  function dailyPicture(labelId, imageId, barId, label, xmasLabel, gen) {
    let seed = date + cal.month * 100;
    $(labelId).innerHTML = label;
    if (XMAS_INDEX[special]) { seed = 9000 + XMAS_INDEX[special]; $(labelId).innerHTML = `${xmasLabel} ${XMAS_INDEX[special]}/6`; }
    $(labelId).style.cursor = 'default';
    $(barId).style.display = 'block';
    const img = $(imageId);
    img.style.backgroundImage = gen(seed);
    img.style.display = 'block';
    scrollTo(img);
    pauseOthers();
  }
  const showCutePicture = () => dailyPicture('cutePicture', 'cuteImage', 'cuteImageBottomBar', 'Daily Cute Picture', 'Cute Xmas Picture', Art.cute);
  const showAmazingPicture = () => dailyPicture('amazingPicture', 'amazingImage', 'amazingImageBottomBar', 'Daily Amazing Picture', 'Amazing Xmas Picture', Art.amazing);
  const showStreetArt = () => dailyPicture('streetArt', 'streetArtImage', 'streetArtBottomBar', 'Daily Street Art', 'Xmas Street Art', Art.streetArt);

  // ---------- GIFs do dia: 10 por dia, um a cada toque ----------
  let gifCounter = 0;
  function showDailyGIF() {
    $('dailyGIF').innerHTML = 'Daily GIFs';
    $('dailyGIF').style.cursor = 'default';
    if (gifCounter === 0) {
      $('GIFMessage').style.display = 'block';
      $('GIFMessage').innerHTML = 'Tap to see all<br>10 daily GIFs';
      gifCounter = 1;
    }
    setTimeout(() => { $('GIFMessage').style.display = 'none'; }, 2500);
    const base = (date + cal.secondMonth) * 10;
    $('dailyGIFImage').style.backgroundImage = Art.gif(base + gifCounter);
    gifCounter++;
    if (gifCounter === 11) gifCounter = 1;
    $('dailyGIFImage').style.display = 'block';
    scrollTo($('dailyGIFImage'));
    pauseOthers();
  }

  // ---------- Quebra-cabeça: 1 toque fecha a mensagem, 5 mostram a solução, 10 voltam ----------
  const puzzleData = Art.puzzle(date + cal.month * 31);
  let puzzleTap = 0;
  function showPuzzle() {
    $('puzzle').innerHTML = 'Daily Puzzle';
    $('puzzle').style.cursor = 'default';
    $('puzzleBottomBar').style.display = 'block';
    $('puzzleImage').style.backgroundImage = puzzleData.image;
    setTimeout(() => { $('puzzleImagePreload').style.backgroundImage = puzzleData.solution; }, 5000);
    $('puzzleImage').style.display = 'block';
    $('puzzleMessage').innerHTML = puzzleData.prompt + '<br><br>Tap to close.<br>Tap Tap Tap for the answer!';
    scrollTo($('puzzleImage'));
    pauseOthers();
  }
  function showPuzzleSolution() {
    puzzleTap++;
    if (puzzleTap === 1) $('puzzleMessage').style.display = 'none';
    if (puzzleTap === 5) $('puzzleImage').style.backgroundImage = puzzleData.solution;
    if (puzzleTap === 10) { $('puzzleImage').style.backgroundImage = puzzleData.image; puzzleTap = 0; }
  }

  // ---------- Citação e curiosidade ----------
  const quote = pickBy(D.quotes, date);
  $('famousQuote').innerHTML = special === 'aprilFoolsDay'
    ? 'Daily Famous Quote<br><br>&quot;A fool thinks himself to be wise, but a wise man knows himself to be a fool.&quot;<br><br>William Shakespeare'
    : `Daily Famous Quote<br><br>&quot;${quote[0]}&quot;<br><br>${quote[1]}`;
  if (D.specialFacts[special]) $('frivolousFact').innerHTML = `${D.specialFacts[special][0]}<br><br>${D.specialFacts[special][1]}`;
  else if (Math.random() > 0.01) $('frivolousFact').innerHTML = "Today's Frivolous Fact<br><br>" + pickBy(D.facts, date);
  else $('frivolousFact').innerHTML = `Secret ${C.SITE.name} Fact<br><br>If you click on the ${C.SITE.name} logo at the top of the page 10 times, you get to see extra 'hidden' games. This fact is TOP SECRET. Please don't tell anyone!`;

  // ---------- Piada do dia ----------
  let joke = pickBy(D.jokes, date + cal.secondMonth);
  let jokeTitle = 'Daily Joke';
  if (D.specialJokes[special]) { const [t, q, a] = D.specialJokes[special]; jokeTitle = t; joke = [q, a]; }
  $('jokeA').innerHTML = `${jokeTitle}<br><br>${joke[0]}`;
  function showJokeAnswer() {
    $('jokeB').innerHTML = joke[1];
    $('jokeA').style.cursor = 'default';
    $('jokeB').style.cursor = 'default';
    $('jokeBottomBar').style.display = 'block';
    pauseOthers();
  }

  // ---------- Mesa de sons: 10 sons do dia ----------
  function showSoundBoard() {
    const a = $('soundBoardA');
    a.innerHTML = 'Daily Soundboard';
    a.style.marginBottom = '-5vh';
    a.style.cursor = 'default';
    $('soundBoardB').style.cursor = 'default';
    $('soundBoardB').style.display = 'block';
    scrollTo(a, 'start');
    const names = Sound.soundboardNames;
    const offset = (date * 7 + cal.month * 3) % names.length;
    for (let i = 0; i < 10; i++) {
      const el = $('sound' + i);
      const name = names[(offset + i * 3) % names.length];
      el.innerHTML = name;
      el.onclick = () => Sound.play(name);
    }
    if (H.shortLang === 'en') $('storyIdea').innerHTML = '<br>Challenge: Make up and tell a story using the above sounds!';
  }

  // ---------- Teste de reação: 7 rodadas ----------
  const happy = `<img id=reactionFaceHappy src="${Art.faceSVG(true)}" alt="happy">`;
  const sad = `<img class=reactionFaceSad src="${Art.faceSVG(false)}" alt="sad">`;
  const happyInst = `<img class=reactionFaceHappyInstructions src="${Art.faceSVG(true)}" alt="happy">`;
  const sadInst = `<img class=reactionFaceSadInstructions src="${Art.faceSVG(false)}" alt="sad">`;
  const empty = `<img class=reactionFaceEmpty src="${Art.faceSVG(true)}" alt="">`;
  let progress = 0, overallScore = 0, bestTime = 0, penalty = 0, createdTime = 0;
  const RA = $('reactionTestA'), RB = $('reactionTestB'), faces = $('reactionTestFaces'), rtext = $('reactionTestText');
  function showReactionTest() {
    scrollTo(RA, 'start');
    RA.removeEventListener('click', showReactionTest);
    RB.removeEventListener('click', showReactionTest);
    RA.innerHTML = 'Reaction Test';
    RA.style.paddingTop = '3vh';
    RB.style.paddingTop = '3vh';
    RA.style.marginBottom = '-5vh';
    RB.style.display = 'block';
    RA.style.cursor = 'default';
    RB.style.cursor = 'pointer';
    faces.style.backgroundColor = 'rgba(0,0,0,0.3)';
    progress = 0; overallScore = 0; bestTime = 0; penalty = 0;
    rtext.innerHTML = '';
    faces.style.display = 'block';
    faces.style.filter = 'brightness(100%)';
    setTimeout(() => {
      faces.innerHTML = `You will see four faces like these...<br>${sadInst}${sadInst}${happyInst}${sadInst}<br>Tap the HAPPY face as fast as you can. Take this test daily to improve your score.<br><br>Tap To Start!`;
    }, 500);
    RB.addEventListener('click', startReactionTest);
  }
  function startReactionTest() {
    faces.style.filter = 'brightness(100%)';
    scrollTo(RA, 'start');
    RB.removeEventListener('click', startReactionTest);
    RA.style.cursor = 'default';
    RB.style.cursor = 'default';
    faces.style.backgroundColor = 'rgba(0,0,0,0.3)';
    rtext.innerHTML = 'Wait!';
    faces.innerHTML = empty + empty + '<br>' + empty + empty;
    if (progress < 7) setTimeout(roundGo, 1500 + Math.random() * 1500);
    if (progress === 7) {
      rtext.innerHTML = '';
      RB.style.cursor = 'pointer';
      const avg = Number((overallScore / progress).toFixed(3));
      const { congrats, ranking } = C.reactionVerdict(avg);
      const rankingText = ranking > 0 ? `<br>You are within the top ${ranking}% of ${C.SITE.name} users!` : '';
      RB.addEventListener('click', showReactionTest);
      faces.innerHTML = `End of Test Results:<br><br>Your average time was: ${avg}s.<br>Your best time was ${bestTime}s.${rankingText}<br><br>${congrats} Tap to restart.${H.touchDevice ? '' : '<br><br>Try this test on your mobile / tablet for even faster results!'}`;
    }
    progress++;
  }
  function roundGo() {
    const slot = Math.floor(Math.random() * 4);
    const cells = [sad, sad, sad, sad];
    cells[slot] = happy;
    faces.innerHTML = cells[0] + cells[1] + '<br>' + cells[2] + cells[3];
    const h = $('reactionFaceHappy');
    h.style.cursor = 'pointer';
    faces.style.backgroundColor = 'green';
    rtext.innerHTML = 'Go!';
    createdTime = Date.now();
    h.addEventListener('mousedown', reacted, { once: true });
    h.addEventListener('touchstart', reacted, { once: true, passive: true });
    faces.querySelectorAll('.reactionFaceSad').forEach(s => s.addEventListener('click', () => { penalty = 500; rtext.innerHTML = 'Penalty +0.5s!'; }));
  }
  function reacted() {
    const h = $('reactionFaceHappy');
    h.removeEventListener('mousedown', reacted);
    h.removeEventListener('touchstart', reacted);
    const t = (Date.now() - createdTime + penalty) / 1000;
    penalty = 0;
    rtext.innerHTML = t + 's.';
    overallScore += t;
    faces.style.filter = 'brightness(50%)';
    h.style.cursor = 'default';
    if (bestTime === 0 || t < bestTime) bestTime = t;
    setTimeout(startReactionTest, 2500);
  }
  RA.addEventListener('click', showReactionTest);

  // ---------- Teste do amor ----------
  const loveLang = C.loveText(H.shortLang);
  const L = loveLang.text;
  let name1 = '', name2 = '', pct = 0, tagline = '';
  const LA = $('loveTesterA'), LB = $('loveTesterB');
  function scrollLove() { setTimeout(() => scrollTo(LA, 'start'), 500); }
  function showLoveTester() {
    scrollTo(LA, 'start');
    LA.innerHTML = 'Love Tester';
    LA.style.paddingTop = '3vh';
    LB.style.paddingTop = '3vh';
    LA.style.marginBottom = '-5vh';
    LB.style.display = 'block';
    LA.style.cursor = 'default';
    LB.style.cursor = 'default';
    resetLoveTester();
  }
  function resetLoveTester() {
    scrollLove();
    LB.innerHTML = L[0] + "<form id='loveTest1' onsubmit='return false'><input type=text class=loveTesterInput id=firstNameBox name=firstName maxlength=14 autocomplete=off><input type=text class=loveTesterInput id=secondNameBox name=secondName maxlength=12 autocomplete=off></form>" + '<div id=testInfoButton' + (H.shortLang === 'en' ? ' style="display:block"' : '') + '>info</div>' + "<br><button id=calcButton class=redButton></button>";
    $('calcButton').innerHTML = L[1];
    $('firstNameBox').placeholder = L[3];
    $('secondNameBox').placeholder = L[4];
    if (loveLang.reduceBoxes) document.querySelectorAll('.loveTesterInput').forEach(x => { x.style.fontSize = loveLang.reduceBoxes + 'vmin'; });
    $('calcButton').addEventListener('click', showLoveAnim);
    $('testInfoButton').addEventListener('click', showLoveInfo);
    ['firstNameBox', 'secondNameBox'].forEach(id => { $(id).addEventListener('focus', scrollLove); $(id).addEventListener('blur', scrollLove); });
  }
  function resizeLoveBox() { const b = $('loveContentBox'); if (b) b.style.height = (b.offsetWidth / 2) + 'px'; }
  function showLoveAnim() {
    scrollLove();
    name1 = $('firstNameBox').value;
    name2 = $('secondNameBox').value;
    for (const n of [name1, name2]) {
      if (!C.checkName(n)) {
        $('calcButton').innerHTML = '@#?*!';
        setTimeout(() => { if ($('calcButton')) $('calcButton').innerHTML = L[1]; }, 1000);
        return;
      }
    }
    LB.innerHTML = '<div id=loveContentBox><div id=onesAndZeros></div><div id=hBoxNames></div><div id=lovePercentage></div><div id=greenScreen></div></div>';
    $('hBoxNames').textContent = name1 + ' + ' + name2;
    window.onresize = resizeLoveBox;
    resizeLoveBox();
    const timer = setInterval(() => {
      let bits = '';
      for (let i = 0; i < 999; i++) bits += Math.random() > 0.5 ? '1' : '0';
      $('onesAndZeros').innerHTML = bits;
      $('lovePercentage').innerHTML = Math.floor(Math.random() * 100) + '%';
    }, 100);
    setTimeout(() => { clearInterval(timer); showLoveResult(); }, 3500);
  }
  function showLoveResult() {
    LB.innerHTML = '<div id=loveContentBox><div id=loveBackground></div><div id=hBoxNames></div><div id=hBoxTagline></div><div id=lovePercentage></div><div id=whiteSheet></div></div><button id=retestButton class=redButton></button><button id=tweetLoveTestButton class=blueButton></button>';
    $('retestButton').innerHTML = L[2];
    $('tweetLoveTestButton').innerHTML = 'TWEET';
    $('loveContentBox').style.border = '2vmin outset red';
    $('lovePercentage').style.color = 'white';
    $('lovePercentage').style.fontSize = '16vmin';
    $('hBoxNames').style.color = 'white';
    $('hBoxNames').textContent = name1 + ' + ' + name2;
    pct = C.calcNames(name1, name2);
    $('lovePercentage').innerHTML = pct + '%';
    tagline = C.loveTagline(pct, L);
    $('hBoxTagline').innerHTML = tagline;
    Sound.play('bigreveal');
    $('retestButton').addEventListener('click', resetLoveTester);
    $('tweetLoveTestButton').addEventListener('click', shareLove);
    resizeLoveBox();
  }
  function shareLove() {
    // Igual ao original: abre a intenção de tweet com o resultado.
    const text = `${name1} 💕 ${name2} = ${pct}%! ${tagline} #${C.SITE.name.toLowerCase()} #lovetester Check your crush at... ${location.origin}${location.pathname}`;
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text));
  }
  function showLoveInfo() {
    scrollLove();
    LB.innerHTML = "Thanks for trying out our just-for-fun Love Tester!<br><br>If you're interested in how it works, the algorithm assigns a numerical value to the letters in each name, and adds them all together. The letters L-O-V-E-S are given extra weight, so if the two names are both 'joined' in this special way by a high proportion of their letters, they will score more highly - Lesley + Steve for example. Try also Poo and Pee.<br><br>Be playful. Keep love in your heart. x<br><br><button id=retestButton class=redButton>Back</button>";
    $('retestButton').addEventListener('click', resetLoveTester);
  }

  // ---------- Charada: três níveis ----------
  const TAP = 'Tap For The Answer!';
  let riddleLevel = 'Easy';
  let riddle = pickBy(D.riddlesEasy, date);
  let riddleTitle = 'Daily Riddle';
  if (D.specialRiddles[special]) { const [t, q, a] = D.specialRiddles[special]; riddleTitle = t; riddle = [q, a]; $('riddleChangeDifficulty').style.display = 'none'; }
  $('riddleA').innerHTML = `${riddleTitle}<br><br>${riddle[0]}`;
  $('riddleB').innerText = TAP;
  function showRiddleAnswer() {
    $('riddleB').innerText = riddle[1];
    $('riddleA').style.cursor = 'default';
    $('riddleB').style.cursor = 'default';
    pauseOthers();
  }
  function changeRiddleDifficulty() {
    const btn = $('riddleChangeDifficulty');
    btn.style.fontSize = '4vmin';
    let title;
    if (riddleLevel === 'Easy') { btn.innerHTML = 'IQ<br>120+'; riddle = pickBy(D.riddlesHard, date); title = "Today's<br>Hard Riddle"; riddleLevel = 'Hard'; }
    else if (riddleLevel === 'Hard') { btn.innerHTML = 'IQ<br>140+'; riddle = pickBy(D.riddlesExtraHard, date); title = "Today's<br>Extra Hard Riddle"; riddleLevel = 'Extra Hard'; }
    else { btn.innerHTML = 'IQ<br>100+'; riddle = pickBy(D.riddlesEasy, date); title = "Today's Riddle"; riddleLevel = 'Easy'; }
    $('riddleA').innerHTML = `${title}<br><br>${riddle[0]}`;
    $('riddleB').innerText = TAP;
    $('riddleA').style.cursor = 'pointer';
    $('riddleB').style.cursor = 'pointer';
  }

  // ---------- Limerique ----------
  function showLimerick() {
    let title = 'Daily Limerick';
    let text = pickBy(D.limericks, date + cal.secondMonth);
    if (D.specialLimericks[special]) [title, text] = D.specialLimericks[special];
    $('limerickA').innerHTML = title;
    $('limerickB').style.display = 'block';
    $('limerickBottomBar').style.display = 'block';
    $('limerickA').style.cursor = 'default';
    $('limerickA').style.paddingBottom = '0';
    $('limerickB').innerHTML = text;
    scrollTo($('limerickA'), 'start');
  }

  // ---------- Ilusão de ótica: fechar → virar → desvirar → girar 180° → girar 360° ----------
  const OPTICAL_PROMPT = 'Look at this picture, then tap the image to flip it and rotate it.';
  let opticalTap = 1;
  function showOpticalIllusion() {
    $('opticalIllusion').innerHTML = 'Daily Optical Illusion';
    $('opticalIllusion').style.cursor = 'default';
    $('opticalIllusionBottomBar').style.display = 'block';
    $('opticalIllusionImage').style.backgroundImage = Art.optical(date);
    $('opticalIllusionImage').style.display = 'block';
    $('opticalIllusionMessage').innerHTML = OPTICAL_PROMPT + '<br><br>Tap to close.';
    scrollTo($('opticalIllusionImage'));
    pauseOthers();
  }
  function showOpticalIllusionSolution() {
    const img = $('opticalIllusionImage');
    switch (opticalTap) {
      case 1: $('opticalIllusionMessage').style.display = 'none'; opticalTap++; break;
      case 2: img.style.transition = '2s'; img.style.transform = 'scaleY(-1)'; opticalTap++; break;
      case 3: img.style.transition = '2s'; img.style.transform = 'scaleY(1)'; opticalTap++; break;
      case 4: img.style.transition = '2s'; img.style.transform = 'rotate(180deg)'; opticalTap++; break;
      case 5: img.style.transition = '2s'; img.style.transform = 'rotate(360deg)'; opticalTap = 2; break;
      default:
    }
    setTimeout(() => { img.style.transition = '0s'; }, 3000);
  }

  // ---------- Trava-língua ----------
  function showTongueTwister() {
    $('tongueTwisterA').innerHTML = 'Daily Tongue Twister';
    let t = D.specialTongueTwisters[special] || pickBy(D.tongueTwisters, date);
    if (t.length < 45) t += '<br><br>Say it several times quickly!';
    $('tongueTwisterB').style.display = 'block';
    $('tongueTwisterBottomBar').style.display = 'block';
    $('tongueTwisterA').style.cursor = 'default';
    $('tongueTwisterA').style.paddingBottom = '0';
    $('tongueTwisterB').innerHTML = t;
    scrollTo($('tongueTwisterA'), 'start');
  }

  // ---------- História para dormir (narrada pela voz do navegador) ----------
  let selectedStory = Math.floor(Math.random() * D.stories.length);
  let storyPlaying = false;
  let feedbackTime;
  const synth = window.speechSynthesis;
  const minutes = s => Math.max(1, Math.round(s[3].split(/\s+/).length / 140));
  function storyStop() { if (synth) synth.cancel(); storyPlaying = false; $('storyPlayPauseButton').innerHTML = 'PLAY'; }
  function storyPause() { if (synth) synth.pause(); storyPlaying = false; $('storyPlayPauseButton').innerHTML = 'PLAY'; }
  function showStory() {
    clearTimeout(feedbackTime);
    feedbackTime = setTimeout(() => {
      $('pleaseRateStory').innerHTML = `Please rate ${D.stories[selectedStory][0]}. Thank you!<br>If you have any comments about it, please use the feedback section below.`;
      $('storyBottomBar').style.display = 'block';
      $('feedback').style.display = 'block';
    }, 180000);
    $('storyA').removeEventListener('click', showStory);
    scrollTo($('storyA'), 'start');
    if (selectedStory >= D.stories.length) selectedStory = 0;
    if (selectedStory < 0) selectedStory = D.stories.length - 1;
    storyStop();
    const s = D.stories[selectedStory];
    $('storyBottomBar').style.display = 'none';
    $('storyInfoButton').style.display = 'block';
    $('storyD').style.display = 'none';
    $('storyA').innerHTML = 'Bedtime Story';
    $('storyA').style.paddingBottom = '2vh';
    $('storyB').style.display = 'block';
    $('storyC').style.display = 'block';
    $('storyA').style.cursor = 'default';
    $('storyTitle').style.fontSize = s[0].length > 20 ? '1.5em' : '1.7em';
    $('storyTitle').innerHTML = s[0];
    $('storyDescription1').innerHTML = `${s[1]} | Length: ${minutes(s)} minute${minutes(s) > 1 ? 's' : ''}<br>`;
    $('storyDescription2').innerHTML = `For ages ${s[2]}.  Read by your device's voice`;
    $('storyProgressBar').style.width = '0';
    $('storyPlayPauseButton').innerHTML = 'PLAY';
  }
  function playPauseStory() {
    if (!synth) return;
    if (storyPlaying) { storyPause(); return; }
    pauseOthers('story');
    if (synth.paused && synth.speaking) synth.resume();
    else {
      const s = D.stories[selectedStory];
      const u = new SpeechSynthesisUtterance(s[3]);
      u.lang = 'en-GB';
      u.rate = 0.9;
      const total = s[3].length;
      u.onboundary = e => { $('storyProgressBar').style.width = Math.min(100, (e.charIndex / total) * 100) + '%'; };
      u.onend = () => { storyPlaying = false; $('storyPlayPauseButton').innerHTML = 'PLAY'; $('storyProgressBar').style.width = '100%'; };
      synth.cancel();
      synth.speak(u);
    }
    storyPlaying = true;
    $('storyPlayPauseButton').innerHTML = 'PAUSE';
  }
  function showStoryInfo() {
    $('storyInfoButton').style.display = 'none';
    $('storyD').style.display = 'block';
    $('storyD').innerHTML = '&quot;If you want your children to be intelligent, read them fairy tales. If you want them to be more intelligent, read them more fairy tales.&quot; - Albert Einstein.<br><br>The bedtime stories here are retellings of classic fables and folk tales that are hundreds of years old. They are read aloud by the voice built into your device, so the sound may vary between phones, tablets and computers. Our hope is that you and your loved ones will find them a pleasant way to end your day.<br><br>Night night. Sleep tight!';
    scrollTo($('storyD'));
  }
  $('storyA').addEventListener('click', showStory);
  $('storyInfoButton').addEventListener('click', showStoryInfo);
  const prevStory = () => { selectedStory--; showStory(); };
  const nextStory = () => { selectedStory++; showStory(); };

  // ---------- Vídeo do dia ----------
  function showFunnyVideo() {
    let n = (date % D.videoCount) + 1;
    $('funnyVideo').innerHTML = 'Daily Funny Video';
    if (XMAS_INDEX[special]) { n = ((XMAS_INDEX[special] - 1) % D.videoCount) + 1; $('funnyVideo').innerHTML = `Xmas Video ${XMAS_INDEX[special]}/6`; }
    $('funnyVideo').style.cursor = 'default';
    $('funnyVideoBottomBar').style.display = 'block';
    $('funnyVideo').style.borderRadius = '0';
    // MP4 (H.264) onde o navegador suporta; WebM (VP9) nos navegadores sem H.264 (ex.: Chromium de código aberto).
    video.src = `z/daily/video/${n}.${video.canPlayType('video/mp4; codecs="avc1.42E01E"') ? 'mp4' : 'webm'}`;
    $('funnyVideoBox').style.display = 'block';
    scrollTo($('funnyVideoBox'));
    video.play().catch(() => {});
  }
  video.addEventListener('play', () => pauseOthers('video'));

  window.Daily = { pauseOthers };
  Object.assign(window, {
    playChiptune, pauseChiptune, contentVote, showCutePicture, showAmazingPicture, showStreetArt, showDailyGIF,
    showPuzzle, showPuzzleSolution, showJokeAnswer, showSoundBoard, showLoveTester, showRiddleAnswer, changeRiddleDifficulty,
    showLimerick, showOpticalIllusion, showOpticalIllusionSolution, showTongueTwister, playPauseStory, prevStory, nextStory, showFunnyVideo,
  });
})();

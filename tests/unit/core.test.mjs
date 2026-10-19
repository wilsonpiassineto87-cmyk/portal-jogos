// Testes de unidade das regras do portal (core.js). Valores esperados medidos no portal de referência.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';
import vm from 'vm';
import fs from 'fs';

const require = createRequire(import.meta.url);
const C = require('../../site/z/assets/scripts/core.js');
const d = (y, m, day) => new Date(y, m - 1, day);

test('D02 calendário: períodos e datas especiais', () => {
  assert.deepEqual(pick(C.getCalendar(d(2026, 10, 19))), { specialDay: undefined, specialPeriod: 'halloween' });
  assert.deepEqual(pick(C.getCalendar(d(2026, 10, 7))), { specialDay: undefined, specialPeriod: 'preHalloween' });
  assert.deepEqual(pick(C.getCalendar(d(2026, 10, 31))), { specialDay: 'halloween', specialPeriod: 'halloween' });
  assert.deepEqual(pick(C.getCalendar(d(2026, 11, 1))), { specialDay: 'firstOfMonth', specialPeriod: undefined });
  assert.deepEqual(pick(C.getCalendar(d(2026, 11, 24))), { specialDay: undefined, specialPeriod: 'christmas' });
  assert.deepEqual(pick(C.getCalendar(d(2026, 12, 25))), { specialDay: 'christmasDay', specialPeriod: 'christmas' });
  assert.deepEqual(pick(C.getCalendar(d(2026, 2, 14))), { specialDay: 'valentinesDay', specialPeriod: 'valentines' });
  assert.deepEqual(pick(C.getCalendar(d(2026, 2, 13))), { specialDay: 'friday13th', specialPeriod: 'valentines' });
  assert.deepEqual(pick(C.getCalendar(d(2026, 4, 1))), { specialDay: 'aprilFoolsDay', specialPeriod: 'easter' });
  assert.deepEqual(pick(C.getCalendar(d(2026, 6, 21))), { specialDay: 'fathersDay', specialPeriod: undefined });
  assert.equal(C.getCalendar(d(2026, 10, 19)).dayOfYear, 292);
  assert.equal(C.getCalendar(d(2026, 2, 3)).secondMonth, 31);
});
function pick(c) { return { specialDay: c.specialDay, specialPeriod: c.specialPeriod }; }

test('D01 frase da data', () => {
  assert.deepEqual(C.calendarStrap(C.getCalendar(d(2026, 10, 19))), { text: "It's Monday 19th October!", emoji: null });
  assert.equal(C.calendarStrap(C.getCalendar(d(2026, 10, 22))).text, "It's Thursday 22nd October!");
  assert.equal(C.calendarStrap(C.getCalendar(d(2026, 10, 23))).text, "It's Friday 23rd October!");
  assert.equal(C.calendarStrap(C.getCalendar(d(2026, 11, 1))).text, "It's pinch punch time on Sunday 1st November!");
  assert.deepEqual(C.calendarStrap(C.getCalendar(d(2026, 10, 31))), { text: "It's getting really spooky... HAPPY&nbsp;HALLOWEEN!", emoji: '👻' });
});

test('H16 cor do dia das faixas', () => {
  assert.match(C.bandGradient(C.getCalendar(d(2026, 10, 19))), /orangered/);
  assert.match(C.bandGradient(C.getCalendar(d(2026, 12, 1))), /firebrick/);
  assert.equal(C.bandGradient(C.getCalendar(d(2026, 6, 1))), 'linear-gradient(to right, #633, #755, #633)');
});

test('D15 teste do amor', () => {
  assert.equal(C.calcNames('Ana', 'Bruno'), 43);
  assert.equal(C.loveTagline(43), 'You like each other. Maybe keep it as just friends?');
  assert.equal(C.loveTagline(100), 'Surely this is true love! A fairytale made real!');
  assert.equal(C.loveTagline(40), "Hmmm. Maybe this isn't the best match...");
  assert.equal(C.checkName('A1'), false);
  assert.equal(C.checkName('a'), false);
  assert.equal(C.checkName(' J o '), true);
  const abc = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 500; i++) { const p = C.calcNames(abc.slice(i % 20, i % 20 + 2 + i % 5), abc.slice(i % 7, i % 7 + 3)); assert.ok(p >= 0 && p <= 100); }
  assert.equal(C.calcNames('n0', 'm0'), -12, 'nomes com número (barrados por checkName) dão valor negativo, como no original');
  assert.equal(C.loveText('pt').text[1], 'CALCULAR!');
  assert.equal(C.loveText('pt').text[0], '');
  assert.equal(C.loveText('en').text[1], 'CALCULATE!');
});

test('D11 teste de reação', () => {
  assert.deepEqual(C.reactionVerdict(0.25), { congrats: 'You scored: #$!£*/10! YOU-ARE-SUPERHUMAN!', ranking: 0.05 });
  assert.deepEqual(C.reactionVerdict(0.65), { congrats: 'You scored 8/10! Good going! See if you can get even faster!', ranking: 2.3 });
  assert.deepEqual(C.reactionVerdict(1.2), { congrats: 'Try again each day to see if you can get faster!', ranking: 0 });
  assert.deepEqual(C.reactionVerdict(3.5), { congrats: 'Did you fall asleep?!', ranking: 0 });
});

test('S05–S10 mensagens da busca', () => {
  assert.equal(C.searchResultMessage('*', 'C', 20), '20 games found starting with C.');
  assert.equal(C.searchResultMessage('*', 'C', 1), '1 game found starting with C.');
  assert.equal(C.searchResultMessage('*', '0', 10), '10 games found starting with 0-9.');
  assert.equal(C.searchResultMessage('Puzzle', '*', 124), '124 Puzzle games found.');
  assert.equal(C.searchResultMessage('2Player', '*', 3), '3 compatible 2 Player games found.');
  assert.equal(C.searchResultMessage('New', '*', 6), '6 New / recently added games found.');
  assert.equal(C.searchResultMessage('Math', '*', 2), '2 Math / Number / Logic and number games found.');
  assert.equal(C.searchResultMessage('Xmas', '*', 2), '2 Christmas / Winter games found.');
  assert.equal(C.searchResultMessage('*', '*', 346), 'All games A-Z: 346.');
  assert.equal(C.searchResultMessage('Sport', '*', 0), 'Sorry. No games found. Please search again.');
});

test('G15–G17 filtro e ordenação da grade', () => {
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(new URL('../../site/z/assets/scripts/games-data.js', import.meta.url), 'utf8'), ctx);
  const desk = { deviceCategory: 'Desktop', gfxPerformanceCategory: 3, gamePlays: 0 };
  const phone = { deviceCategory: 'iPhone', gfxPerformanceCategory: 3, gamePlays: 0 };
  const all = C.filterGames(ctx.games, '*', '*', desk);
  assert.ok(all.length >= 18);
  assert.ok(all.some(g => g[0] === 'Pong_Duel'));
  assert.ok(!C.filterGames(ctx.games, '*', '*', phone).some(g => g[0] === 'Pong_Duel'), 'jogo só desktop não aparece no iPhone');
  assert.ok(C.filterGames(ctx.games, '*', '0', desk).every(g => /^[0-9]/.test(g[0])));
  const sorted = [...all].sort(C.sortAscendNum(8));
  assert.equal(sorted[0][8], 1);
  assert.equal(C.displayName('Snake_Rush'), 'Snake&nbsp;Rush');
  const fgo = ['X', '', '', '', '', 'Desktop', 'FGO', '', 1, 1, 1, 1];
  assert.equal(C.gameVisible(fgo, { ...desk, gfxPerformanceCategory: 2 }), false);
  assert.equal(C.gameVisible(fgo, desk), true);
});

test('H10 boas-vindas por idioma', () => {
  assert.deepEqual(C.welcomeText('pt'), { text: 'Bem-vindo!', blastAllowed: true });
  assert.deepEqual(C.welcomeText('ru'), { text: 'Добро пожаловать!', blastAllowed: false });
  assert.equal(C.welcomeText('xx').text, 'Welcome!');
});

test('E dispositivo', () => {
  assert.equal(C.detectDevice('Mozilla/5.0 (X11; Linux x86_64)', 'Linux x86_64', 0).os, 'Desktop');
  const a = C.detectDevice('Mozilla/5.0 (Linux; Android 9; SM)', 'Linux armv8l', 5);
  assert.deepEqual([a.os, a.deviceCategory, a.deviceSpeed, a.popIndex], ['Android', 'AndroidMid', 'fst', 9]);
  assert.equal(C.detectDevice('Mozilla/5.0 (Linux; Android 7)', 'Linux', 5).deviceSpeed, 'Slw');
  assert.equal(C.detectDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', 'iPhone', 5).popIndex, 11);
  assert.equal(C.detectDevice('Mozilla/5.0 (Macintosh)', 'MacIntel', 5).os, 'iPadNew');
});

test('P03/P08 página de jogo', () => {
  assert.equal(C.loadingSeconds(3, 'auto'), 6);
  assert.equal(C.loadingSeconds(9, 'auto'), 9);
  assert.equal(C.loadingSeconds(40, 'auto'), 12);
  assert.equal(C.loadingSeconds(40, 4), 4);
  assert.equal(C.descriptionFontSize(260), '1.7vmax');
  assert.equal(C.titleFontSize(29), '5vmax');
  assert.equal(C.touchWording('Click to play by clicking'), 'Tap to play by tapping');
});

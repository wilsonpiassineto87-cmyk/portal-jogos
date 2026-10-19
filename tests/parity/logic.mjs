// Paridade de lógica: baixa a página do portal de referência em tempo de execução, isola os trechos de regra
// (calendário, frase da data, teste do amor, teste de reação, mensagem de busca) e compara a saída deles com a
// do core.js do clone para milhares de entradas. Nenhum código do original fica guardado neste repositório.
// Uso: node tests/parity/logic.mjs [url]   (padrão https://www.friv.com/)  — imprime um JSON com o resultado.
import vm from 'vm';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const C = require(path.join(here, '..', '..', 'site', 'z', 'assets', 'scripts', 'core.js'));
const URL_REF = process.argv[2] || 'https://www.friv.com/';

// fetch do Node ignora HTTPS_PROXY; em ambientes com proxy, cai para o curl.
async function download(url) {
  try { return await (await fetch(url)).text(); } catch { return execFileSync('curl', ['-sSL', '--max-time', '60', url], { encoding: 'utf8', maxBuffer: 64 << 20 }); }
}
const html = process.env.REF_HTML ? fs.readFileSync(process.env.REF_HTML, 'utf8') : await download(URL_REF);
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');

function slice(from, to, startAt = 0) {
  const a = scripts.indexOf(from, startAt);
  if (a < 0) throw new Error('trecho não encontrado: ' + from);
  const b = scripts.indexOf(to, a + from.length);
  if (b < 0) throw new Error('fim do trecho não encontrado: ' + to);
  return scripts.slice(a, b);
}
function fn(name) {
  const a = scripts.indexOf('function ' + name + '(');
  if (a < 0) throw new Error('função não encontrada: ' + name);
  let i = scripts.indexOf('{', a), depth = 0;
  for (; i < scripts.length; i++) {
    if (scripts[i] === '{') depth++;
    if (scripts[i] === '}' && --depth === 0) break;
  }
  return scripts.slice(a, i + 1);
}

const SRC = {
  calendar: slice('var specialDay;', 'if (debug)'),
  strap: slice('var suffix = "th";', 'var secondMonth'),
  love: fn('normalizeName') + '\n' + fn('calcNames') + '\n' + fn('checkName'),
  reaction: slice('congrats = "Try again each day', 'var rankingText'),
  search: slice('var gameText = "games";', 'firstDisplay = false;'),
  tagline: slice('tagline = loveArray[5];', 'if (displayPercentage == 100) tagline = loveArray[9];') + 'if (displayPercentage == 100) tagline = loveArray[9];',
};

function refCalendar(d) {
  const ctx = { today: d, day: d.getDay(), month: d.getMonth(), date: d.getDate(), year: d.getYear(), hour: d.getHours() };
  vm.runInNewContext(SRC.calendar + '\n;out = { specialDay, specialPeriod };', ctx);
  return ctx.out;
}
function refStrap(d, specialDay) {
  const el = () => ({ innerHTML: '', style: {} });
  const ctx = {
    date: d.getDate(), day: d.getDay(), month: d.getMonth(), specialDay,
    daylist: C.DAY_NAMES, monthlist: C.MONTH_NAMES,
    todaysDateEmoji1: el(), todaysDateEmoji2: el(), logoContainer: el(), setTimeout() {},
  };
  vm.runInNewContext(SRC.strap + '\n;out = "It\'s " + calenderString1 + " " + calenderString2 + "!";', ctx);
  return { text: ctx.out, emoji: ['👌', '💛', '🍀', '💫', '👨', '👻', '🎅', '🎄', '📦', '🎉', '🎆'].includes(ctx.todaysDateEmoji1.innerHTML) ? ctx.todaysDateEmoji1.innerHTML : null };
}
const loveCtx = { calcButton: { innerHTML: '' }, loveArray: C.LOVE_TEXT, setTimeout() {} };
vm.runInNewContext(SRC.love, loveCtx);
function refReaction(avg) {
  const ctx = { averageTime: avg, ranking: 0, congrats: '' };
  vm.runInNewContext('var ranking = 0;' + SRC.reaction + '\n;out = { congrats, ranking };', ctx);
  return ctx.out;
}
function refSearch(genre, firstLetter, count) {
  const el = () => ({ innerHTML: '' });
  const ctx = { genre, firstLetter, gamesCounter: count, firstDisplay: false, searchBoxRemove() {}, searchResultText: el(), headerSearchResult: el(), console: { log() {} } };
  vm.runInNewContext(SRC.search, ctx);
  return ctx.headerSearchResult.innerHTML;
}
function refTagline(pct) {
  const ctx = { displayPercentage: pct, loveArray: C.LOVE_TEXT };
  vm.runInNewContext(SRC.tagline + '\n;out = tagline;', ctx);
  return ctx.out;
}

const results = [];
function check(id, name, cases, ref, mine, norm = x => x) {
  let fails = [];
  for (const c of cases) {
    const a = norm(JSON.stringify(ref(...c))), b = JSON.stringify(mine(...c));
    if (a !== b) fails.push({ input: c, ref: a, clone: b });
  }
  results.push({ id, name, cases: cases.length, fails: fails.length, examples: fails.slice(0, 5) });
}

// Calendário e frase da data: todos os dias de 2025 a 2030.
const days = [];
for (let t = new Date(2025, 0, 1); t < new Date(2031, 0, 1); t = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)) days.push([t]);
check('D02', 'calendário (specialDay/specialPeriod)', days, refCalendar, d => { const c = C.getCalendar(d); return { specialDay: c.specialDay, specialPeriod: c.specialPeriod }; });
const brand = s => s.replace(/Friv/g, C.SITE.name);
check('D01', 'frase da data (dateStrap) e emoji especial', days, d => refStrap(d, refCalendar(d).specialDay), d => C.calendarStrap(C.getCalendar(d)), brand);

// Teste do amor: pares de nomes aleatórios (latinos, acentuados, cirílicos) + casos de validação.
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáéíóúãõçÁÉÍÓÚЖДЛЯ ';
const name = () => Array.from({ length: 1 + Math.floor(rnd() * 12) }, () => alphabet[Math.floor(rnd() * alphabet.length)]).join('');
const pairs = Array.from({ length: 5000 }, () => [name(), name()]).concat([['Ana', 'Bruno'], ['Lo', 'Ve'], ['zz', 'ZZ'], ['Love', 'Loves']]);
check('D15a', 'teste do amor: porcentagem', pairs, (a, b) => loveCtx.calcNames(a, b), (a, b) => C.calcNames(a, b));
const names = pairs.map(p => [p[0]]).concat([['A1'], ['a'], [' b '], ['Jo'], ['12'], ['J 0']]);
check('D15b', 'teste do amor: validação do nome', names, n => loveCtx.checkName(n), n => C.checkName(n));
check('D15c', 'teste do amor: frase por faixa', Array.from({ length: 101 }, (_, i) => [i]), refTagline, p => C.loveTagline(p));

// Teste de reação: médias de 0.1 a 4 s.
const avgs = Array.from({ length: 400 }, (_, i) => [Number((0.1 + i * 0.01).toFixed(3))]);
check('D11', 'teste de reação: frase e ranking', avgs, refReaction, a => C.reactionVerdict(a));

// Busca: todas as categorias e letras, com 0, 1 e N resultados.
const genres = ['*', '2Player', '3D', 'Action', 'Adventure', 'Dressup', 'Combat', 'Creative', 'Food', 'Halloween', 'Jobs', 'Motorsport', 'New', 'Platform', 'Puzzle', 'Shooting', 'Sport', 'Math', 'Word', 'Quiz', 'Xmas', 'Landscape', 'Portrait'];
const letters = ['*', '0', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const searchCases = [];
for (const g of genres) for (const l of (g === '*' ? letters : ['*'])) for (const n of [0, 1, 2, 124, 346]) searchCases.push([g, l, n]);
check('S05-S10', 'mensagem do resultado da busca', searchCases, refSearch, (g, l, n) => C.searchResultMessage(g, l, n));

const ok = results.every(r => r.fails === 0);
console.log(JSON.stringify({ reference: URL_REF, ok, results }, null, 2));
process.exitCode = ok ? 0 : 1;

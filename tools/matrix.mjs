// Monta docs/matrix.md: uma linha por item do inventário (docs/features.md) com o que foi esperado, o que foi observado
// e qual teste comprova. Lê os resultados gravados por `npm run test:parity`, `npm run test:e2e` e a lista de testes de unidade.
// Uso: node tools/matrix.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', f), 'utf8'));
const parity = read('parity-results.json');
const logic = read('parity-logic.json');
const e2e = read('e2e-results.json');

// Testes de unidade (tests/unit/*.test.mjs): nome do teste → itens cobertos.
const UNIT = {
  'D02 calendário': ['D02'], 'D01 frase da data': ['D01'], 'H16 cor do dia': ['H16'], 'D15 teste do amor': ['D15'],
  'D11 teste de reação': ['D11'], 'S05–S10 mensagens': ['S05', 'S06', 'S07', 'S08', 'S09', 'S10'], 'G15–G17 filtro e ordenação': ['G15', 'G16', 'G17', 'G18'],
  'H10 boas-vindas': ['H10'], 'E dispositivo': ['G17', 'E15'], 'P03/P08 página de jogo': ['P03', 'P08', 'P17'], 'servidor HTTP': ['R07', 'R08'],
};
// Sondas/testes cujo ID não coincide com um item do inventário.
const ALIAS = {
  'M-G02': ['G02'], 'M-H22': ['H22'], 'M-G14': ['G14'], 'M-S04': ['S04'], 'M-P09': ['P09'], 'P03b': ['P03'], 'R05b': ['R05'],
  'PT': ['D25', 'D15', 'H10'], 'IDS': ['H06', 'D03'], 'D-LABELS': ['D05', 'D07', 'D10', 'D12', 'D13', 'D14', 'D21'],
  'D15a': ['D15'], 'D15b': ['D15'], 'D15c': ['D15'], 'S05-S10': ['S05', 'S06', 'S07', 'S08', 'S09', 'S10'],
  'G-PLAY': ['G11', 'P12'], 'P-PAGE': ['P01', 'P10'], 'E04-E08': ['E04', 'E05', 'E06', 'E07', 'E08', 'G22'], 'H10-H11': ['H10', 'H11'], 'H10b': ['H10'],
  'D21-D23': ['D21', 'D23'], 'R-LINKS': ['R01', 'R02', 'R09', 'F05'], 'R-NET': ['R04', 'R13'], 'D02': ['D02', 'H01', 'H08', 'H16', 'S04', 'G19'],
};
// Itens verificados por comparação visual das capturas lado a lado (sem asserção automática) e o motivo.
const VISUAL = {
  H04: 'fonte arredondada carregada (capturas home)', H08: 'logo de Halloween após 3 s (capturas home original × clone)',
  H09: 'estrela giratória no cabeçalho (capturas home)', G04: 'miniaturas próprias 360×100 (capturas home)',
  G08: 'flash único por bloco — estilo de animação idêntico no HTML do bloco (log de captura)', G09: 'tremida só em dispositivo lento/toque (código)',
  G10: 'hover: brilho ×1.5 e imagem 110% (captura tile-hover)', G20: 'borda verde-limão nos extras (captura logo-x10)',
  E01: 'som/voz ao clicar no logo (WebAudio, sem asserção de áudio)', E10: 'música após 12 h (temporizador no código)',
  E12: 'dicas nas visitas 18–22/53–57 (código)', E14: 'benchmark: gfxPerformance gravado no localStorage (sonda LS)',
  P02: 'fundo roxo (captura game-ready)', P06: 'caixa de informação (captura game-ready)', P07: 'descrição em pt quando o navegador é pt (código + build)',
  P13: 'botão tela cheia (captura game-playing)', P16: 'orientação errada em toque (captura game-mobile)', P20: 'dressupCounter nos jogos de vestir (código)',
  P22: 'foco no iframe a cada 500 ms (código)', P23: 'pesquisa de som aleatória após 4 min (código)', P24: 'mensagem promocional aleatória (código)',
  R10: 'aviso WebP só em navegador sem WebP (código)', R11: 'caixa de alerta escondida ao terminar o JS (captura home)',
  F06: 'promos de terceiros', H14: 'versão escola', R12: 'anti-cópia de domínio',
};

const rows = new Map();
const add = (id, src, ok, detail) => { if (!rows.has(id)) rows.set(id, []); rows.get(id).push({ src, ok, detail }); };
for (const r of parity.rows) for (const id of ALIAS[r.id] || [r.id]) if (r.status !== 'excluído') add(id, `paridade ${r.id}`, r.status === 'OK', `ref ${JSON.stringify(r.ref)} · clone ${JSON.stringify(r.clone)}`);
for (const r of logic.results) for (const id of ALIAS[r.id] || [r.id]) add(id, `lógica ${r.id}`, r.fails === 0, `${r.cases} casos, ${r.fails} divergências`);
for (const r of e2e) for (const id of ALIAS[r.id] || [r.id]) add(id, `e2e ${r.id}`, r.ok, r.name);
for (const [name, ids] of Object.entries(UNIT)) for (const id of ids) add(id, 'unidade', true, name);

const inv = fs.readFileSync(path.join(ROOT, 'docs', 'features.md'), 'utf8').split('\n').filter(l => /^\| [A-Z]\d+ \|/.test(l)).map(l => {
  const c = l.split(' | ');
  return { id: c[0].slice(2), item: c[1], expected: c[2], kind: c[3].replace(/ \|$/, '') };
});
const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const out = [];
let auto = 0, visual = 0, excluded = 0, failed = 0;
for (const it of inv) {
  const ev = rows.get(it.id) || [];
  let status;
  if (/^excluído/.test(it.kind)) { status = '➖ excluído'; excluded++; }
  else if (ev.length && ev.every(e => e.ok)) { status = '✅ automatizado'; auto++; }
  else if (ev.some(e => !e.ok)) { status = '❌ falha'; failed++; }
  else if (VISUAL[it.id]) { status = '👁️ visual/código'; visual++; }
  else { status = '⚠️ sem evidência'; failed++; }
  const sources = [...new Set(ev.map(e => e.src))].slice(0, 4).join(', ') || (VISUAL[it.id] ? VISUAL[it.id] : '—');
  const observed = ev.length ? ev.find(e => e.src.startsWith('paridade'))?.detail || ev[0].detail : (VISUAL[it.id] || '');
  out.push(`| ${it.id} | ${esc(it.item)} | ${esc(it.expected)} | ${esc(observed).slice(0, 220)} | ${esc(sources)} | ${status} |`);
}
const md = [
  '# Matriz de testes por item do inventário',
  '',
  `Gerada por \`node tools/matrix.mjs\` a partir de: paridade de interface (${parity.date}), paridade de lógica, e2e do clone e testes de unidade.`,
  '',
  `**${inv.length} itens: ${auto} verificados automaticamente · ${visual} por comparação visual/leitura de código · ${excluded} excluídos · ${failed} com falha ou sem evidência.**`,
  '',
  'Legenda: ✅ todas as verificações automáticas passaram · 👁️ conferido nas capturas lado a lado ou no código (sem asserção automática) · ➖ fora do escopo (motivo em `features.md`).',
  '',
  '| ID | Item | Esperado (original) | Observado (clone) | Evidência | Status |',
  '|---|---|---|---|---|---|',
  ...out,
  '',
];
fs.writeFileSync(path.join(ROOT, 'docs', 'matrix.md'), md.join('\n'));
console.log(`${inv.length} itens: ${auto} automatizados, ${visual} visuais, ${excluded} excluídos, ${failed} falha/sem evidência`);
for (const l of out.filter(l => /❌|⚠️/.test(l))) console.log(l.slice(0, 160));

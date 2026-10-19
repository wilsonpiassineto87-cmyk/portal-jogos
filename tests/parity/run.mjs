// Paridade de interface: roda as MESMAS sondas Playwright no portal de referência e no clone, lado a lado,
// e gera a matriz (docs/parity-matrix.md), o log bruto (docs/parity-results.json) e capturas do clone.
// Uso: node tests/parity/run.mjs            (referência https://www.friv.com/, clone servido localmente)
//      REF_URL=... CLONE_URL=... node tests/parity/run.mjs
//      ONLY=clone node tests/parity/run.mjs  (só o clone; útil sem rede — compara com o último resultado salvo)
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { PROBES, SCENARIOS, normalize, compareIds } from './probes.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
const require = createRequire(import.meta.url);
const PW = process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright/index.mjs';
const { chromium, devices } = await import(fs.existsSync(PW) ? PW : 'playwright');
const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));

const OUT = path.join(ROOT, 'docs');
const SHOTS = path.join(OUT, 'parity-shots');
const RESULTS = path.join(OUT, 'parity-results.json');
fs.mkdirSync(SHOTS, { recursive: true });

// Clone: usa CLONE_URL ou sobe o servidor do próprio projeto numa porta livre.
let cloneURL = process.env.CLONE_URL;
let server;
if (!cloneURL) {
  server = require(path.join(ROOT, 'server.js')).server;
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  cloneURL = `http://127.0.0.1:${server.address().port}/`;
}
const targets = { ref: process.env.REF_URL || 'https://www.friv.com/', clone: cloneURL };
const only = process.env.ONLY;

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const BLOCK = /googlesyndication|doubleclick|googletagmanager|google-analytics|fundingchoices|adtrafficquality|recaptcha|googleadservices/;

async function observe(name, base) {
  const obs = {};
  const log = [];
  for (const sc of SCENARIOS) {
    const ctx = await browser.newContext({ locale: sc.locale || 'en-US', ...(sc.device ? devices[sc.device] : { viewport: { width: 1366, height: 768 } }) });
    await ctx.route(BLOCK, r => r.abort());
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const set = (id, v) => { obs[id] = v; };
    const shot = async (n) => { if (name === 'clone') await page.screenshot({ path: path.join(SHOTS, n + '.png') }); };
    const t0 = Date.now();
    try {
      await sc.run({ page, ctx, base, set, shot, target: name });
      log.push(`[${name}] ${sc.name}: ok (${((Date.now() - t0) / 1000).toFixed(1)} s)${errors.length ? ' pageerrors=' + JSON.stringify(errors) : ''}`);
    } catch (e) {
      log.push(`[${name}] ${sc.name}: ERRO ${e.message.split('\n')[0]}`);
    }
    await ctx.close();
  }
  return { obs, log };
}

const prev = fs.existsSync(RESULTS) ? JSON.parse(fs.readFileSync(RESULTS, 'utf8')) : null;
const run = { date: new Date().toISOString(), targets };
for (const name of ['ref', 'clone']) {
  if (only && only !== name) { run[name] = prev?.[name]; continue; }
  console.log(`observando ${name}: ${targets[name]}`);
  run[name] = await observe(name, targets[name]);
  for (const l of run[name].log) console.log('  ' + l);
}
await browser.close();
if (server) server.close();

// Comparação por item do inventário.
const rows = PROBES.map(p => {
  let a = run.ref?.obs[p.id], b = run.clone?.obs[p.id];
  if (p.id === 'IDS' && a && b) { b = compareIds(a, b); a = []; }
  const na = normalize(a), nb = normalize(b);
  let status;
  if (p.mode === 'excluded') status = 'excluído';
  else if (a === undefined && b === undefined) status = 'sem dado';
  else status = JSON.stringify(na) === JSON.stringify(nb) ? 'OK' : 'FALHA';
  return { ...p, ref: na, clone: nb, status };
});
run.rows = rows.map(({ id, name, mode, ref, clone, status, note }) => ({ id, name, mode, ref, clone, status, note }));
fs.writeFileSync(RESULTS, JSON.stringify(run, null, 1));

const cell = v => (v === undefined ? '—' : '`' + JSON.stringify(v).replace(/\|/g, '\\|').slice(0, 160) + '`');
const count = s => rows.filter(r => r.status === s).length;
const md = [
  '# Matriz de paridade (gerada por `npm run test:parity`)',
  '',
  `Execução: ${run.date}. Referência: ${targets.ref} · Clone: ${targets.clone}`,
  '',
  `**${count('OK')} OK · ${count('FALHA')} falha · ${count('excluído')} excluído · ${count('sem dado')} sem dado** (de ${rows.length} verificações).`,
  '',
  'Valores normalizados: nome da marca → `BRAND`; textos de conteúdo próprio (piadas, fatos, nomes de jogos) são reduzidos à forma (padrão/contagem) antes da comparação. Capturas do clone em `docs/parity-shots/`.',
  '',
  '| ID | Verificação | Esperado (referência) | Observado (clone) | Resultado |',
  '|---|---|---|---|---|',
  ...rows.map(r => `| ${r.id} | ${r.name}${r.note ? ' — ' + r.note : ''} | ${cell(r.ref)} | ${cell(r.clone)} | ${r.status === 'OK' ? '✅ OK' : r.status === 'FALHA' ? '❌ FALHA' : r.status} |`),
  '',
  '## Log da execução',
  '',
  '```',
  ...(run.ref?.log || []), ...(run.clone?.log || []),
  '```',
  '',
];
fs.writeFileSync(path.join(OUT, 'parity-matrix.md'), md.join('\n'));
console.log(`\n${count('OK')} OK, ${count('FALHA')} falha(s), ${count('excluído')} excluído(s), ${count('sem dado')} sem dado — docs/parity-matrix.md`);
for (const r of rows.filter(r => r.status === 'FALHA' || r.status === 'sem dado')) console.log(`  ${r.status} ${r.id} ${r.name}\n    ref:   ${JSON.stringify(r.ref)}\n    clone: ${JSON.stringify(r.clone)}`);
process.exitCode = count('FALHA') ? 1 : 0;

# Jogatina

Portal de jogos de navegador com grade de jogos, busca, seção diária ("Jogatina Daily"), easter eggs e páginas de jogo,
reproduzindo o comportamento de um portal de referência com marca e conteúdo próprios.

```
npm start            # http://localhost:8080/
```

| Comando | O que faz |
|---|---|
| `npm start` | servidor estático na porta 8080 (`node server.js <porta>`) |
| `npm run build` | regenera páginas de jogo, `games-data.js`, miniaturas e `sitemap.xml` a partir de `tools/catalog.mjs` |
| `npm run media` | regenera ícones PNG e vídeos da seção diária (Playwright + ffmpeg) |
| `npm test` | testes de unidade |
| `npm run test:e2e` | ponta a ponta do clone (Playwright) |
| `npm run test:parity` | paridade de lógica e de interface contra o site de referência (requer rede) |
| `npm run matrix` | gera `docs/matrix.md` a partir dos resultados |
| `npm run test:all` | tudo acima, em sequência |

Documentação: `docs/recon.md` (reconhecimento), `docs/features.md` (inventário), `docs/matrix.md` (matriz de testes),
`docs/report.md` (relatório final, stack, mapeamento, licenças e limitações).

Fonte Fredoka: SIL Open Font License 1.1 (`site/z/assets/fonts/OFL.txt`).

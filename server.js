// Servidor estático do portal: mesmo contrato HTTP observado no original
// (HTML estático, cache público de 2 h, ETag/Last-Modified, 404 com página própria).
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, 'site');
const PORT = Number(process.env.PORT || process.argv[2] || 8080);
const HOST = process.env.HOST || '0.0.0.0';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'text/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function resolvePath(urlPath) {
  let p;
  try {
    p = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  if (p.endsWith('/')) p += 'index.html';
  const full = path.normalize(path.join(ROOT, p));
  if (!full.startsWith(ROOT + path.sep) && full !== ROOT) return null;
  return full;
}

function send(req, res, status, file, stat) {
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const etag = '"' + crypto.createHash('sha1').update(`${stat.size}-${stat.mtimeMs}`).digest('hex').slice(0, 16) + '"';
  const headers = {
    'Content-Type': type,
    'Cache-Control': 'max-age=7200, public',
    'Expires': new Date(Date.now() + 7200 * 1000).toUTCString(),
    'Last-Modified': stat.mtime.toUTCString(),
    'ETag': etag,
    'Accept-Ranges': 'bytes',
    'X-Content-Type-Options': 'nosniff',
  };
  if (status === 200 && req.headers['if-none-match'] === etag) {
    res.writeHead(304, headers);
    return res.end();
  }
  // Suporte a Range para vídeo/áudio (o navegador pede trechos ao tocar mídia).
  const range = req.headers.range;
  if (status === 200 && range && /^bytes=\d*-\d*$/.test(range)) {
    let [start, end] = range.slice(6).split('-').map(v => (v === '' ? undefined : Number(v)));
    if (start === undefined) { start = stat.size - end; end = stat.size - 1; }
    if (end === undefined || end >= stat.size) end = stat.size - 1;
    if (start >= 0 && start <= end) {
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
  }
  res.writeHead(status, { ...headers, 'Content-Length': stat.size });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

function notFound(req, res) {
  const file = path.join(ROOT, '404.html');
  fs.stat(file, (err, stat) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404');
    }
    send(req, res, 404, file, stat);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  const file = resolvePath(req.url);
  if (!file) return notFound(req, res);
  fs.stat(file, (err, stat) => {
    if (err) return notFound(req, res);
    if (stat.isDirectory()) {
      res.writeHead(301, { Location: req.url.split('?')[0].replace(/\/?$/, '/') });
      return res.end();
    }
    send(req, res, 200, file, stat);
  });
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`Jogatina rodando em http://localhost:${PORT}/`);
  });
}

module.exports = { server, resolvePath };

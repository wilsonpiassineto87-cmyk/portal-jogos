// Contrato HTTP do servidor estático (R07, R08).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { server, resolvePath } = require('../../server.js');

test('servidor: cache, ETag, 304, 404, Range e travessia de diretório', async (t) => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const home = await fetch(base + '/');
  assert.equal(home.status, 200);
  assert.equal(home.headers.get('cache-control'), 'max-age=7200, public');
  assert.ok(home.headers.get('etag'));
  assert.ok(home.headers.get('last-modified'));
  assert.match(home.headers.get('content-type'), /text\/html/);

  const again = await fetch(base + '/', { headers: { 'If-None-Match': home.headers.get('etag') } });
  assert.equal(again.status, 304);

  const missing = await fetch(base + '/nonexistent-page-xyz.html');
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Error 404 - File Not Found/);

  const part = await fetch(base + '/z/daily/video/1.mp4', { headers: { Range: 'bytes=0-99' } });
  assert.equal(part.status, 206);
  assert.equal((await part.arrayBuffer()).byteLength, 100);

  assert.equal(resolvePath('/../server.js'), null);
  assert.equal(resolvePath('/%2e%2e/server.js'), null);
  assert.equal((await fetch(base + '/%2e%2e/server.js')).status, 404);
  assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);
});

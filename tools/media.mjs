// Gera mídias binárias do portal: ícones PNG (a partir do favicon.svg) e os 7 vídeos curtos da seção diária (MP4 H.264 + WebM VP9).
// Uso: node tools/media.mjs   (requer Playwright/Chromium e ffmpeg com libx264 e libvpx-vp9)
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const PW = process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright/index.mjs';
const { chromium } = await import(PW);
const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();

// Ícones
const svg = fs.readFileSync(path.join(ROOT, 'favicon.svg'), 'utf8');
for (const [name, size] of [['favicon-16x16.png', 16], ['favicon-32x32.png', 32], ['favicon-large.png', 228], ['apple-touch-icon.png', 180], ['android-chrome-192x192.png', 192], ['android-chrome-512x512.png', 512]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: path.join(ROOT, name), omitBackground: true });
}
console.log('ícones gerados');

// Vídeos: cada cena é desenhada quadro a quadro num canvas 640×360 e exportada como PNG.
const SCENES = `
const W = 640, H = 360;
function ground(x, sky, grass) { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); x.fillStyle = g; x.fillRect(0, 0, W, H); x.fillStyle = grass; x.fillRect(0, 290, W, 70); }
function eyes(x, cx, cy, r, look = 0, blink = false) {
  for (const dx of [-r * 1.3, r * 1.3]) {
    x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + dx, cy, r, 0, 7); x.fill();
    if (blink) { x.strokeStyle = '#222'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx + dx - r, cy); x.lineTo(cx + dx + r, cy); x.stroke(); }
    else { x.fillStyle = '#222'; x.beginPath(); x.arc(cx + dx + look * r * 0.4, cy + r * 0.15, r * 0.45, 0, 7); x.fill(); }
  }
}
function caption(x, text) { x.font = 'bold 26px Arial'; x.textAlign = 'center'; x.lineWidth = 6; x.strokeStyle = '#000'; x.strokeText(text, W / 2, 40); x.fillStyle = '#fff'; x.fillText(text, W / 2, 40); }
const scenes = [
  // 1: geleia pulando e se esticando
  (x, t) => { ground(x, ['#81d4fa', '#e1f5fe'], '#7cb342'); const ph = (t * 1.4) % 1, hgt = Math.sin(ph * Math.PI) * 160, sq = ph < 0.08 || ph > 0.92 ? 1.35 : 1;
    x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.ellipse(320, 292, 70 - hgt / 5, 10, 0, 0, 7); x.fill();
    x.fillStyle = '#ab47bc'; x.beginPath(); x.ellipse(320, 250 - hgt, 60 * sq, 60 / sq, 0, 0, 7); x.fill(); eyes(x, 320, 238 - hgt, 10, Math.sin(t * 3)); caption(x, 'Boing! Boing! Boing!'); },
  // 2: gato atrás do pontinho de laser
  (x, t) => { ground(x, ['#ffe0b2', '#ffcc80'], '#8d6e63'); const lx = 320 + Math.sin(t * 2.3) * 240, ly = 300 + Math.sin(t * 5.1) * 30, cx = 320 + Math.sin(t * 2.3 - 0.6) * 220;
    x.fillStyle = 'red'; x.beginPath(); x.arc(lx, ly, 6, 0, 7); x.fill();
    x.fillStyle = '#ff9800'; x.beginPath(); x.ellipse(cx, 255, 70, 40, 0, 0, 7); x.fill(); x.beginPath(); x.arc(cx + Math.sign(lx - cx) * 60, 225, 34, 0, 7); x.fill();
    const hx = cx + Math.sign(lx - cx) * 60; x.beginPath(); x.moveTo(hx - 28, 205); x.lineTo(hx - 18, 175); x.lineTo(hx - 6, 200); x.moveTo(hx + 28, 205); x.lineTo(hx + 18, 175); x.lineTo(hx + 6, 200); x.fill();
    eyes(x, hx, 220, 7, Math.sign(lx - cx)); caption(x, 'Must... catch... the dot!'); },
  // 3: pinguim escorregando no gelo
  (x, t) => { ground(x, ['#b3e5fc', '#ffffff'], '#e0f7fa'); const px = (t * 220) % (W + 200) - 100, spin = t * 8;
    x.save(); x.translate(px, 260); x.rotate(Math.sin(spin) * 0.3); x.fillStyle = '#212121'; x.beginPath(); x.ellipse(0, 0, 40, 26, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(5, 6, 30, 16, 0, 0, 7); x.fill(); x.fillStyle = '#ff9800'; x.beginPath(); x.moveTo(40, -2); x.lineTo(58, 2); x.lineTo(40, 8); x.fill(); x.restore();
    eyes(x, px + 22, 250, 5, 1); caption(x, 'Wheeeee!'); },
  // 4: robô dançando
  (x, t) => { ground(x, ['#311b92', '#4527a0'], '#1a237e'); const b = Math.sin(t * 8) * 12;
    for (let i = 0; i < 6; i++) { x.fillStyle = 'hsla(' + ((t * 120 + i * 60) % 360) + ',90%,60%,0.35)'; x.beginPath(); x.arc(80 + i * 100, 80, 30 + Math.sin(t * 4 + i) * 10, 0, 7); x.fill(); }
    x.fillStyle = '#b0bec5'; x.fillRect(280, 170 + b, 80, 90); x.fillRect(290, 110 + b, 60, 50);
    x.strokeStyle = '#b0bec5'; x.lineWidth = 12; x.beginPath(); x.moveTo(280, 190 + b); x.lineTo(240, 150 + Math.sin(t * 8) * 40); x.moveTo(360, 190 + b); x.lineTo(400, 150 - Math.sin(t * 8) * 40); x.moveTo(300, 260 + b); x.lineTo(295, 300); x.moveTo(340, 260 + b); x.lineTo(345, 300); x.stroke();
    x.fillStyle = '#00e5ff'; x.fillRect(298, 125 + b, 14, 10); x.fillRect(328, 125 + b, 14, 10); caption(x, 'Beep boop disco!'); },
  // 5: galinha atravessando a rua
  (x, t) => { ground(x, ['#90caf9', '#e3f2fd'], '#9e9e9e'); x.fillStyle = '#fff'; for (let i = 0; i < 8; i++) x.fillRect(i * 90 + ((t * 300) % 90), 322, 50, 6);
    const cx = 320, cy = 280 - Math.abs(Math.sin(t * 10)) * 10; x.fillStyle = '#fff'; x.beginPath(); x.ellipse(cx, cy, 30, 26, 0, 0, 7); x.fill(); x.beginPath(); x.arc(cx + 22, cy - 26, 16, 0, 7); x.fill();
    x.fillStyle = '#e53935'; x.beginPath(); x.arc(cx + 22, cy - 44, 7, 0, 7); x.fill(); x.fillStyle = '#ff9800'; x.beginPath(); x.moveTo(cx + 36, cy - 28); x.lineTo(cx + 48, cy - 24); x.lineTo(cx + 36, cy - 20); x.fill();
    const carX = W + 100 - ((t * 400) % (W + 400)); x.fillStyle = '#1e88e5'; x.fillRect(carX, 296, 120, 40); x.fillRect(carX + 20, 270, 70, 30); x.fillStyle = '#222'; x.beginPath(); x.arc(carX + 25, 338, 12, 0, 7); x.arc(carX + 95, 338, 12, 0, 7); x.fill();
    eyes(x, cx + 22, cy - 30, 4, Math.sign(carX - cx)); caption(x, 'Why DID the chicken cross the road?'); },
  // 6: sapo pulando nas vitórias-régias
  (x, t) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#80deea'); g.addColorStop(1, '#00838f'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) { x.fillStyle = '#43a047'; x.beginPath(); x.ellipse(100 + i * 150, 290, 55, 16, 0, 0, 7); x.fill(); }
    const ph = (t * 0.8) % 1, i = Math.floor((t * 0.8) % 4), fx = 100 + (i + ph) * 150, fy = 270 - Math.sin(ph * Math.PI) * 120;
    x.fillStyle = '#7cb342'; x.beginPath(); x.ellipse(fx, fy, 32, 24, 0, 0, 7); x.fill(); eyes(x, fx, fy - 20, 8, 1, ph < 0.1); caption(x, 'Ribbit... SPLASH?'); },
  // 7: novelo de lã rolando e se desenrolando
  (x, t) => { ground(x, ['#f8bbd0', '#fce4ec'], '#d7ccc8'); const px = 60 + ((t * 120) % (W - 120)), r = 40 - ((t * 120) % (W - 120)) / 30;
    x.strokeStyle = '#e91e63'; x.lineWidth = 4; x.beginPath(); x.moveTo(40, 300); for (let k = 40; k < px; k += 20) x.lineTo(k, 300 - Math.sin(k / 15) * 4); x.stroke();
    x.save(); x.translate(px, 300 - r); x.rotate(t * 5); x.fillStyle = '#ec407a'; x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill(); x.strokeStyle = '#ad1457'; x.lineWidth = 3; for (let k = -2; k <= 2; k++) { x.beginPath(); x.ellipse(0, 0, r, r * 0.4, k * 0.6, 0, 7); x.stroke(); } x.restore();
    caption(x, 'The great yarn escape'); },
];`;

const outDir = path.join(ROOT, 'z', 'daily', 'video');
fs.mkdirSync(outDir, { recursive: true });
await page.setViewportSize({ width: 640, height: 360 });
await page.setContent('<html><body style="margin:0"><canvas id=c width=640 height=360></canvas></body></html>');
await page.addScriptTag({ content: SCENES + '\nwindow.renderFrame = (n, t) => { const x = document.getElementById("c").getContext("2d"); scenes[n](x, t); return document.getElementById("c").toDataURL("image/png"); };' });
const FPS = 24, SECONDS = 6;
for (let n = 0; n < 7; n++) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vid-'));
  for (let f = 0; f < FPS * SECONDS; f++) {
    const data = await page.evaluate(([n, t]) => window.renderFrame(n, t), [n, f / FPS]);
    fs.writeFileSync(path.join(tmp, `f${String(f).padStart(4, '0')}.png`), Buffer.from(data.split(',')[1], 'base64'));
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-crf', '28', path.join(outDir, `${n + 1}.mp4`)]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.png'), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '40', '-pix_fmt', 'yuv420p', path.join(outDir, `${n + 1}.webm`)]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`vídeo ${n + 1}.mp4 gerado`);
}
await browser.close();

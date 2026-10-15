// Render a reel: node tools/render.mjs <id> [--stills t1,t2,...] [--from s --to s]
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2), vid = args[0];
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const FPS = +(opt('--fps') || 30);
const tl = JSON.parse(fs.readFileSync(`${ROOT}/build/${vid}/timeline.json`, 'utf8'));
const spec = JSON.parse(fs.readFileSync(`${ROOT}/src/${vid}.json`, 'utf8'));
const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('console', m => { if (m.type() !== 'log') console.log('[page]', m.text()); });
page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exit(1); });
await page.goto(`file://${ROOT}/src/${spec.page || 'render.html'}?v=${vid}`);
await page.waitForFunction(() => window.VIDEO && window.SCENES);
const info = await page.evaluate(([tl, spec]) => window.VIDEO.setup(tl, spec), [tl, spec]);
fs.writeFileSync(`${ROOT}/build/${vid}/events.json`, JSON.stringify(info.events));
if (info.music) fs.writeFileSync(`${ROOT}/build/${vid}/music.json`, JSON.stringify(info.music));
const grab = async t => {
  const b64 = await page.evaluate(async t => { await window.VIDEO.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }, t);
  return Buffer.from(b64, 'base64');
};
const stills = opt('--stills');
if (stills) {
  fs.mkdirSync(`${ROOT}/build/${vid}/stills`, { recursive: true });
  for (const s of stills.split(',')) {
    const t = isNaN(+s) ? (() => { const [id, f] = s.split('@'); const sg = tl.segments.find(x => x.id === id); return sg.t0 + (+f) * (sg.t1 - sg.t0); })() : +s;
    fs.writeFileSync(`${ROOT}/build/${vid}/stills/${s}.jpg`, await grab(t));
  }
  await browser.close(); process.exit(0);
}
const t0 = +(opt('--from') || 0), t1 = +(opt('--to') || info.duration);
const out = opt('--out') || `${ROOT}/build/${vid}/video.mp4`;
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '9M', '-bufsize', '18M', '-tune', 'grain', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round((t1 - t0) * FPS), start = Date.now();
for (let f = 0; f < n; f++) {
  const buf = await grab(t0 + f / FPS);
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 150 === 0) console.log(`${vid} frame ${f}/${n}  ${((Date.now() - start) / 1000).toFixed(0)}s`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r));
await browser.close();
console.log('wrote', out);

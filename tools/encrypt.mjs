// Builds the encrypted site from the original (unencrypted) scrapbook folder.
//
//   node tools/encrypt.mjs <original-folder> "<answer>"
//
// Run it from the repo root. It rewrites index.html and vault/ in this repo.
// The original folder must contain index.html, js/content.js, js/script.js and images/.
// Never commit the original folder: it holds the unencrypted photos and text.
import { webcrypto as crypto } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [src, answer] = process.argv.slice(2);
if (!src || !answer) {
  console.error('usage: node tools/encrypt.mjs <original-folder> "<answer>"');
  process.exit(1);
}

const ITER = 600000;
const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };

const salt = crypto.getRandomValues(new Uint8Array(16));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalize(answer)), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);

async function encrypt(bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  return Buffer.concat([Buffer.from(iv), Buffer.from(ct)]);
}

// Split the original index.html into the public head and the private body.
const html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
const bodyOpen = html.match(/<body[^>]*>/);
const bodyStart = bodyOpen.index + bodyOpen[0].length;
const bodyEnd = html.indexOf('<script src="js/content.js">');
if (bodyEnd < 0) throw new Error('index.html: could not find the content.js script tag');
const page = html.slice(bodyStart, bodyEnd).replace(/<script src="js\/gate\.js"><\/script>\s*/, '');

// Encrypt every image under a meaningless name.
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}
fs.rmSync('vault', { recursive: true, force: true });
fs.mkdirSync('vault');
const files = {};
let n = 0;
for (const abs of walk(path.join(src, 'images')).sort()) {
  const rel = path.relative(src, abs).split(path.sep).join('/');
  const name = String(n++).padStart(3, '0') + '.bin';
  files[rel] = { f: name, t: MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream' };
  fs.writeFileSync(path.join('vault', name), await encrypt(fs.readFileSync(abs)));
}

const bundle = {
  files,
  page,
  content: fs.readFileSync(path.join(src, 'js/content.js'), 'utf8'),
  script: fs.readFileSync(path.join(src, 'js/script.js'), 'utf8'),
};
fs.writeFileSync('vault/main.bin', await encrypt(new TextEncoder().encode(JSON.stringify(bundle))));
fs.writeFileSync('vault/meta.json', JSON.stringify({ salt: Buffer.from(salt).toString('base64'), iter: ITER }) + '\n');

// Public index.html: original <head>, then only the gate.
fs.writeFileSync('index.html',
  html.slice(0, bodyStart) + '\n<script src="js/gate.js"></script>\n</body>\n</html>\n');

console.log(`Encrypted ${n} images, page, content.js and script.js into vault/`);

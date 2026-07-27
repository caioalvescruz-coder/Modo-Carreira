import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const dist = resolve(root, 'dist');

async function loadLocalEnv() {
  const path = resolve(root, '.env.local');
  try {
    const content = await readFile(path, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separator = line.indexOf('=');
      if (separator < 1) continue;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

await loadLocalEnv();

const config = {
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
  },
  controller: process.env.DATA_CONTROLLER_NAME || 'CONFIGURAÇÃO PENDENTE: informe o controlador',
  privacyEmail: process.env.PRIVACY_CONTACT_EMAIL || 'privacidade@exemplo.invalid'
};

const missing = [];
if (!process.env.FIREBASE_API_KEY) missing.push('FIREBASE_API_KEY');
if (!process.env.DATA_CONTROLLER_NAME) missing.push('DATA_CONTROLLER_NAME');
if (!process.env.PRIVACY_CONTACT_EMAIL) missing.push('PRIVACY_CONTACT_EMAIL');
if (process.env.VERCEL && missing.length) {
  throw new Error(`Publicação bloqueada: configure na Vercel ${missing.join(', ')}.`);
}

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, 'assets', 'vendor'), { recursive: true });
await mkdir(resolve(dist, 'assets', 'js'), { recursive: true });

for (const file of ['index.html']) {
  await cp(resolve(root, file), resolve(dist, file));
}
for (const file of ['favicon.svg', 'app.css', 'cloud.css', 'responsive.css', 'styles.css', 'seed-data.js', 'bootstrap.js', 'camisa.png']) {
  try {
    await cp(resolve(root, 'assets', file), resolve(dist, 'assets', file));
  } catch (err) { console.warn(`⚠️ Asset não encontrado: ${file} (ignorado)`, err.message); }
}
await cp(resolve(root, 'assets', 'js'), resolve(dist, 'assets', 'js'), { recursive: true });
await mkdir(resolve(dist, 'data'), { recursive: true });
for (const file of ['base.csv', 'base_sofifa.json', 'elenco.csv', 'mercado.csv']) {
  try {
    await cp(resolve(root, 'data', file), resolve(dist, 'data', file));
  } catch (err) { console.warn(`⚠️ Data não encontrada: ${file} (ignorado)`, err.message); }
}

let privacy = await readFile(resolve(root, 'privacidade.html'), 'utf8');
privacy = privacy
  .replaceAll('{{DATA_CONTROLLER_NAME}}', escapeHtml(config.controller))
  .replaceAll('{{PRIVACY_CONTACT_EMAIL}}', escapeHtml(config.privacyEmail));
await writeFile(resolve(dist, 'privacidade.html'), privacy, 'utf8');

let authSource = await readFile(resolve(root, 'src', 'auth.js'), 'utf8');
authSource = authSource
  .replace('__FIREBASE_CONFIG__', JSON.stringify(config.firebaseConfig));
await writeFile(resolve(dist, 'assets', 'auth.js'), authSource, 'utf8');

const authSize = (await stat(resolve(dist, 'assets', 'auth.js'))).size;
console.log(`Build concluído em dist/ (${Math.round(authSize / 1024)} KB no módulo de autenticação).`);
if (missing.length) console.log(`Configuração local pendente: ${missing.join(', ')}.`);

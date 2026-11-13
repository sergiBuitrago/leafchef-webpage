import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const base = new URL('../public/', import.meta.url);
const html = await readFile(new URL('index.html', base), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
for (const filename of (await readdir(base)).filter(name => name.endsWith('.html'))) {
 const page = await readFile(new URL(filename, base), 'utf8');
 const pageIds = new Set([...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
 for (const match of page.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (value === '#' || /^(?:https?:|data:|mailto:)/.test(value)) continue;
  if (value.startsWith('#')) {
    if (!pageIds.has(value.slice(1))) throw new Error(`Missing anchor in ${filename}: ${value}`);
  } else await access(fileURLToPath(new URL(value, base)));
 }
}
for (const key of ['plan','pantry','shopping']) {
  if (!ids.has(`tab-${key}`) || !ids.has(`panel-${key}`)) throw new Error(`Missing preview tab/panel: ${key}`);
}
console.log('Local assets, section anchors and preview tab targets are present.');

const preview = await readFile(new URL('app-preview.css', base), 'utf8');
for (const match of preview.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
  await access(fileURLToPath(new URL(match[1], base)));
}
const icons = await readFile(new URL('assets/app-icons.svg', base), 'utf8');
const iconIds = new Set([...icons.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
for (const match of html.matchAll(/assets\/app-icons\.svg#([^"]+)/g)) {
  if (!iconIds.has(match[1])) throw new Error(`Missing native app icon: ${match[1]}`);
}
if ((html.match(/data-app-nav=/g) || []).length !== 5) throw new Error('App preview must have five navigation destinations.');
console.log('App font, native icon targets and all five app navigation items are present.');

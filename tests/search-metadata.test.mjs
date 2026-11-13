import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read = path => readFile(new URL('../public/' + path, import.meta.url), 'utf8');
const variants = {en:'https://leafchef.app/',de:'https://leafchef.app/index.de.html',es:'https://leafchef.app/index.es.html',fr:'https://leafchef.app/index.fr.html'};

test('landing titles describe the vegan meal planner in each language', async () => {
  const titles = {
    en:'LeafChef — Vegan Meal Planner for Your Household',
    de:'LeafChef — Veganer Essensplaner für deinen Haushalt',
    es:'LeafChef — Planificador de comidas veganas para tu hogar',
    fr:'LeafChef — Planificateur de repas véganes pour votre foyer'
  };
  for (const [language, title] of Object.entries(titles)) {
    const html = await read(language === 'en' ? 'index.html' : `index.${language}.html`);
    assert.ok(html.includes(`<title>${title}</title>`));
    assert.ok(html.includes(`<meta property="og:title" content="${title}">`));
    assert.ok(html.includes('<meta property="og:site_name" content="LeafChef">'));
  }
});

test('root home page provides one valid WebSite entity with the canonical site name', async () => {
  const html = await read('index.html');
  const scripts = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([^]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.deepEqual(JSON.parse(scripts[0][1]), {'@context':'https://schema.org','@type':'WebSite',name:'LeafChef',url:'https://leafchef.app/'});
  for (const language of ['de','es','fr']) assert.doesNotMatch(await read(`index.${language}.html`), /id="site-schema"/);
});

test('every landing page has its own canonical and reciprocal absolute language alternates', async () => {
  for (const [language, url] of Object.entries(variants)) {
    const html = await read(language === 'en' ? 'index.html' : `index.${language}.html`);
    assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
    for (const [alternate, href] of Object.entries(variants)) assert.ok(html.includes(`<link rel="alternate" hreflang="${alternate}" href="${href}">`));
    assert.ok(html.includes('<link rel="alternate" hreflang="x-default" href="https://leafchef.app/">'));
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/);
  }
});

test('sitemap includes all indexable language pages and robots allows crawling', async () => {
  const sitemap = await read('sitemap.xml');
  assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]),Object.values(variants));
  assert.equal(await read('robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: https://leafchef.app/sitemap.xml\n');
  for (const page of ['legal','privacy','impressum','terms']) for (const language of ['en','de','es','fr']) {
    const html = await read(`${page}${language==='en'?'':'.'+language}.html`);
    assert.ok(html.includes('<meta name="robots" content="noindex">'));
  }
});

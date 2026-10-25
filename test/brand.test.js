'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const brand = require('../extensions/nodebb-plugin-vvjob/lib/brand');

test('native brand links replace legacy icons, preserve SEO/manifest and support subpaths', () => {
  for (const prefix of ['', '/community']) {
    const canonical = { rel: 'canonical', href: 'https://example.invalid/topic/1' };
    const manifest = { rel: 'manifest', href: '/manifest.webmanifest' };
    const data = { links: [canonical, manifest, { rel: 'icon', href: '/old.ico' }, { rel: 'apple-touch-icon', href: '/old.png' }] };
    brand(data, prefix);
    assert(data.links.includes(canonical));
    assert(data.links.includes(manifest));
    assert.equal(data.links.length, 5);
    for (const link of data.links.slice(2)) {
      assert(link.href.startsWith(`${prefix}/assets/plugins/nodebb-plugin-vvjob/brand/`));
      const file = path.basename(link.href.split('?')[0]);
      assert(fs.statSync(`extensions/nodebb-plugin-vvjob/public/brand/${file}`).size > 0);
    }
    brand(data, prefix);
    assert.equal(data.links.length, 5);
  }
});

test('brand hook leaves native AJAX metadata unchanged', () => {
  const data = { req: { res: { locals: { isAPI: true } } }, links: [] };
  assert.equal(brand(data), data);
  assert.deepEqual(data.links, []);
});

test('installed app icons use the brand while preserving native scope and start URL', () => {
  const manifest = { name: 'VVJOB', scope: '/community/', start_url: '/community/?standalone', icons: [{ src: '/old.png' }] };
  const data = { manifest };
  assert.equal(brand.manifest(data, '/community'), data);
  assert.equal(manifest.scope, '/community/');
  assert.equal(manifest.start_url, '/community/?standalone');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512']);
  assert(manifest.icons.every(icon => icon.src.startsWith('/community/assets/plugins/')));
});

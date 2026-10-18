'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const sass = require('sass');
const benchpress = require('benchpressjs');
const root = path.resolve(__dirname, '..');
async function build() {
  await fs.mkdir(path.join(root, 'dist'), { recursive: true });
  const css = sass.compile(path.join(root, 'extensions/nodebb-plugin-vvjob/scss/vvjob.scss'));
  await fs.writeFile(path.join(root, 'dist/vvjob.css'), css.css);
  const template = await fs.readFile(path.join(root, 'extensions/nodebb-plugin-vvjob/templates/vvjob.tpl'), 'utf8');
  const paginator = await fs.readFile(require.resolve('nodebb-theme-harmony/templates/partials/paginator.tpl'), 'utf8');
  const compiled = await benchpress.precompile(template.replace('<!-- IMPORT partials/paginator.tpl -->', paginator), { filename: 'vvjob.tpl' });
  await fs.writeFile(path.join(root, 'dist/vvjob.js'), compiled);
  console.log('Built VVJOB Sass and Benchpress template with Harmony paginator.');
}
build().catch(err => { console.error(err); process.exitCode = 1; });

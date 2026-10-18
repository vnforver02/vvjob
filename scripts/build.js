'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const sass = require('sass');
const benchpress = require('benchpressjs');
const templates = require('./template-source');
const root = path.resolve(__dirname, '..');
async function build() {
  await fs.mkdir(path.join(root, 'dist'), { recursive: true });
  for (const name of ['vvjob', 'global', 'pages']) {
    const css = sass.compile(path.join(root, `extensions/nodebb-plugin-vvjob/scss/${name}.scss`));
    await fs.writeFile(path.join(root, `dist/${name}.css`), css.css);
  }
  const files = await templates.files();
  for (const file of files) {
    const relative = path.relative(templates.own, file);
    const source = await templates.expand(await fs.readFile(file, 'utf8'));
    const compiled = await benchpress.precompile(source, { filename: relative });
    const destination = path.join(root, 'dist/templates', relative.replace(/\.tpl$/, '.js'));
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, compiled);
  }
  console.log(`Built shared and homepage Sass plus ${files.length} VVJOB templates and their available native imports.`);
}
build().catch(err => { console.error(err); process.exitCode = 1; });

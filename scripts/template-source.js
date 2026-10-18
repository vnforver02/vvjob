'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const own = path.resolve(__dirname, '../extensions/nodebb-plugin-vvjob/templates');
const roots = [own, path.dirname(require.resolve('nodebb-theme-harmony/templates/header.tpl')),
  path.dirname(require.resolve('nodebb-plugin-composer-default/static/templates/composer.tpl'))];
if (process.env.NODEBB_ROOT) { roots.push(path.join(process.env.NODEBB_ROOT, 'src/views')); }
async function expand(source, stack = []) {
  const imports = [...source.matchAll(/<!--\s*IMPORT\s+([^\s]+)\s*-->/g)];
  for (const match of imports) {
    const name = match[1];
    if (stack.includes(name)) { throw new Error(`Circular template import: ${name}`); }
    let content;
    for (const root of roots) {
      try { content = await fs.readFile(path.join(root, name), 'utf8'); break; }
      catch (err) { if (err.code !== 'ENOENT') { throw err; } }
    }
    // The host's full build resolves core-only imports. Local validation compiles
    // every owned template and all available Harmony/composer dependencies.
    source = source.replace(match[0], content === undefined ? `<!-- NodeBB core import: ${name} -->` : await expand(content, [...stack, name]));
  }
  return source;
}
async function files(dir = own) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) { result.push(...await files(name)); }
    else if (entry.name.endsWith('.tpl')) { result.push(name); }
  }
  return result;
}
module.exports = { own, expand, files };

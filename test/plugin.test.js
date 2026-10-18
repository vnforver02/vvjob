'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function load(host) {
  const exports = {};
  vm.runInNewContext(fs.readFileSync('extensions/nodebb-plugin-vvjob/library.js', 'utf8'), {
    exports, require: { main: { require: name => host[name.replace('./src/', '')] } },
  });
  return exports;
}
test('registers route via NodeBB page helper and advertises homepage', async () => {
  const routes = [];
  const plugin = load({ 'routes/helpers': { setupPageRoute: (...value) => { routes.push(value); } } });
  await plugin.init({ router: 'router' });
  assert.equal(routes[0][1], '/vvjob');
  assert.equal(routes[0][3], plugin.render);
  assert.equal(routes[1][1], '/vvjob/guide');
  assert.equal(routes[1][3], plugin.guide);
  assert.equal((await plugin.homepages({ routes: [] })).routes[0].route, 'vvjob');
});
test('forwards viewer and query to native feed, uses privilege filtered categories and weekly popular topics', async () => {
  const req = { uid: 17, query: { page: '2', sort: 'popular' } };
  let nativeArgs; let trendArgs; let categoryArgs; let rendered;
  const plugin = load({
    'controllers/recent': { getData: async (...args) => { nativeArgs = args; return { topics: [{ tid: 1 }], pagination: { currentPage: 2 } }; } },
    categories: { getCategoriesByPrivilege: async (...args) => { categoryArgs = args; return [{ cid: 1 }, { cid: 2, disabled: true }, { cid: 3, link: 'https://example.com' }, { cid: 4, name: 'Lương &amp; phúc lợi' }, { cid: 5, name: 'Thảo luận công việc' }]; } },
    topics: { getSortedTopics: async args => { trendArgs = args; return { topics: [{ tid: 4 }] }; } },
  });
  await plugin.render(req, { render: (name, data) => { rendered = { name, data }; } });
  assert.equal(nativeArgs[0], req);
  assert.equal(nativeArgs[2], 'posts');
  assert.deepEqual(categoryArgs, ['categories:cid', 17, 'read']);
  assert.equal(rendered.data.communities.length, 3);
  assert.deepEqual(Array.from(rendered.data.communities, c => c.cid), [5, 4, 1]);
  assert.equal(rendered.data.pagination.currentPage, 2);
  req.query.sort = 'untrusted';
  await plugin.render(req, { render() {} });
  assert.equal(nativeArgs[2], 'recent');
  assert.equal(trendArgs.uid, 17);
  assert.equal(trendArgs.term, 'week');
  assert.equal(trendArgs.sort, 'posts');
});
test('invalid native request passes to next without rendering', async () => {
  const plugin = load({ 'controllers/recent': { getData: async () => null } });
  let next = false;
  await plugin.render({ query: {} }, { render() { assert.fail('unexpected render'); } }, () => { next = true; });
  assert.equal(next, true);
});
test('homepage forwards failures to native error handler', async () => {
  const plugin = load({ 'controllers/recent': { getData: async () => { throw new Error('database unavailable'); } } });
  let error;
  await plugin.home({ req: { query: {} }, res: {}, next: value => { error = value; } });
  assert.equal(error.message, 'database unavailable');
});

test('community guide shows readable local communities without the synthetic uncategorized bucket', async () => {
  let rendered;
  const plugin = load({ categories: { getCategoriesByPrivilege: async (set, uid, privilege) => {
    assert.equal(uid, 9); assert.equal(privilege, 'read');
    return [{ cid: -1, name: 'Uncategorized' }, { cid: 5 }, { cid: 6, disabled: true }, { cid: 7, link: 'https://example.invalid' }];
  } } });
  await plugin.guide({ uid: 9 }, { render: (name, data) => { rendered = { name, data }; } });
  assert.equal(rendered.name, 'vvjob-guide');
  assert.deepEqual(Array.from(rendered.data.communities, category => category.cid), [5]);
});

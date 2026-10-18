'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function load(host) {
  host = { database: { getObject: async () => null }, posts: { getPostSummaryByPids: async () => [], getVoteStatusByPostIDs: async () => ({upvotes: []}) }, user: {getUserFields: async () => ({})}, ...host };
  const exports = {};
  const localRequire = name => require(path.resolve('extensions/nodebb-plugin-vvjob', name));
  localRequire.main = { require: name => name === 'nconf' ? { get: () => '' } : host[name.replace('./src/', '')] };
  vm.runInNewContext(fs.readFileSync('extensions/nodebb-plugin-vvjob/library.js', 'utf8'), {
    exports, require: localRequire,
  });
  return exports;
}
test('registers route via NodeBB page helper and advertises homepage', async () => {
  const routes = [];
  const plugin = load({ 'routes/helpers': { setupPageRoute: (...value) => { routes.push(value); }, setupApiRoute() {} } });
  const posts = [];
  const middleware = { ensureLoggedIn() {}, redirectToHomeIfBanned() {}, applyCSRF() {}, authenticateRequest() {}, applyBlacklist() {}, maintenanceMode() {}, registrationComplete() {} };
  await plugin.init({ router: { use() {}, get() {}, post: (...args) => posts.push(args) }, middleware });
  assert.equal(posts[0][0], '/api/vvjob/evidence/submit');
  assert(posts[0].indexOf(middleware.applyCSRF) < posts[0].length - 3);
  assert(posts[0].indexOf(middleware.ensureLoggedIn) < posts[0].length - 3);
  assert.equal(typeof posts[0].at(-2), 'function');
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

test('registration keeps native return destination and makes career reminder optional', async () => {
  let pending;
  const plugin = load({ database: { setObjectField: async (...args) => { pending = args; } } });
  const data = await plugin.registered({ uid: 9, next: '/topic/17' });
  assert.equal(data.next, '/topic/17');
  assert.deepEqual(pending, ['vvjob:career:9', 'onboardingPending', 1]);
  const unavailable = load({ database: { setObjectField: async () => { throw Error('unavailable'); } } });
  assert.equal((await unavailable.registered({ uid: 9, next: '/' })).next, '/');
});

test('community feed preserves native category filtering, sorting and pager with contextual heading', async () => {
 let rendered; const req = {uid: 8, query: {cid: '7', sort: 'popular', page: '2'}};
 const plugin = load({
  'controllers/recent': {getData: async (request, route, sort) => {assert.equal(request, req); assert.equal(request.query.cid, req.query.cid); assert.equal(sort, 'posts'); return {topics: [], pagination: {currentPage: 2}};}},
  categories: {getCategoriesByPrivilege: async () => [{cid: 7, name: 'Lương &amp; phúc lợi'}, {cid: 8, name: 'Kinh nghiệm nghề nghiệp'}]},
  topics: {getSortedTopics: async () => ({topics: []})}
 });
 await plugin.render(req, {render: (name,data) => rendered=data});
 assert.equal(rendered.feedTitle, 'Lương &amp; phúc lợi');
 assert.equal(rendered.communities.find(c=>c.cid===7).active, true);
 assert.equal(rendered.communities.find(c=>c.cid===8).active, false);
 assert.equal(rendered.popularQuery, '?cid=7&sort=popular');
  assert.equal(rendered.pagination.currentPage, 2);
 assert.equal(rendered.hotPeriods.find(period => period.active).label, '7 ngày');
 assert.equal(rendered.hotPeriods[0].url, '/vvjob?sort=popular&term=daily&cid=7');
 assert.equal(rendered.communities[0].hotUrl, '/vvjob?sort=popular&term=weekly&cid=7');
 req.query.cid='999'; let next=false;
 await plugin.render(req, {render(){assert.fail('unavailable community rendered')}},()=>{next=true});
 assert.equal(next,true);
});

test('hot titles use the first fifteen native privilege-filtered topics regardless of feed page', async () => {
 const calls=[];let result;
 const plugin=load({
  'controllers/recent':{getData:async()=>({topics:[],pagination:{currentPage:3}})},
  categories:{getCategoriesByPrivilege:async()=>[{cid:7,name:'Công việc'}]},
  topics:{getSortedTopics:async args=>{calls.push(args);return{topics:Array.from({length:20},(_,i)=>({tid:i+1,index:i}))}}},
 });
 await plugin.render({uid:9,query:{sort:'popular',term:'monthly',cid:'7',page:'3'}},{render:(name,data)=>{result=data}});
 assert.equal(result.topics.length,15);assert.equal(result.topics[0].rank,1);assert.equal(result.topics[14].rank,15);
 assert.equal(calls.at(-1).stop,14);assert.equal(calls.at(-1).start,0);assert.equal(calls.at(-1).term,'month');assert.deepEqual(Array.from(calls.at(-1).cids),[7]);assert.equal(calls.at(-1).uid,9);
});

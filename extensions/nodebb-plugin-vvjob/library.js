'use strict';

// Dependencies resolve from the host NodeBB, never a second copy of core.
const host = name => require.main.require(`./src/${name}`);

let careerRoutes;
let verificationRoutes;
let evidenceRoutes;
let socialService;
let reactionService;
let authorService;
exports.init = async ({ router, middleware }) => {
  // Authenticated career/verification responses must not survive in shared caches.
  router.use(['/vvjob', '/api/vvjob'], (req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    next();
  });
  host('routes/helpers').setupPageRoute(router, '/vvjob', [], exports.render);
  host('routes/helpers').setupPageRoute(router, '/vvjob/guide', [], exports.guide);
  const directory = require('./lib/companies')(host('database'));
  verificationRoutes = require('./lib/verification-routes')(host, directory, name => require.main.require('nconf').get(name), function (options) { return new (require.main.require('pg').Pool)(options); });
  evidenceRoutes = require('./lib/evidence-routes')(host, directory, name => require.main.require('nconf').get(name), function (options) { return new (require.main.require('pg').Pool)(options); }, name => require.main.require(name));
  careerRoutes = require('./lib/career-routes')(host, directory, require('./data/companies.json'), verificationRoutes.service, evidenceRoutes.service, require('./data/companies-vnr500'));
  const helpers = host('routes/helpers');
  const identity = require('./lib/identity')(host('database'), evidenceRoutes.service, verificationRoutes.service);
  const author = authorService = require('./lib/author')(directory, identity);
  const avatars = require('./lib/avatars')(host);
  reactionService = require('./lib/reactions')(host);
  helpers.setupApiRoute(router, 'get', '/api/vvjob/topics/:tid/comments', [], require('./lib/comments')(host, author, reactionService, avatars).list);
  const social = socialService = require('./lib/social')(host, author, reactionService, avatars);
  helpers.setupApiRoute(router, 'get', '/api/vvjob/topics/:tid/content', [], social.content);
  helpers.setupApiRoute(router, 'get', '/api/vvjob/posts/:pid/reaction', [], reactionService.endpoint);
  const member = [middleware.ensureLoggedIn, middleware.redirectToHomeIfBanned];
  helpers.setupApiRoute(router, 'put', '/api/vvjob/posts/:pid/reaction', [...member, middleware.applyCSRF], reactionService.endpoint);
  const people = require('./lib/people')(host, directory, identity);
  router.get('/vvjob/demo-avatar/:index.svg', (req, res) => {
    const index = Number(req.params.index);
    if (!Number.isInteger(index) || index < 1 || index > 500) return res.sendStatus(404);
    res.type('image/svg+xml').set('Cache-Control', 'public, max-age=86400').set('X-Content-Type-Options', 'nosniff').send(require('./lib/demo-users').avatar(index));
  });
  // Plugin routes mount before core routes. Both page and ajax JSON require login.
  helpers.setupPageRoute(router, '/users', [...member, middleware.canViewUsers], people.page);
  helpers.setupPageRoute(router, '/vvjob/people', [...member, middleware.canViewUsers], people.page);
  router.use(['/user', '/uid', '/api/user', '/api/uid', '/api/v3/users'], middleware.authenticateRequest, middleware.ensureLoggedIn);

  helpers.setupPageRoute(router, '/vvjob/companies', [], careerRoutes.companies);
  helpers.setupPageRoute(router, '/vvjob/career', member, careerRoutes.career);
  helpers.setupPageRoute(router, '/vvjob/company-admin', [...member, careerRoutes.admin], careerRoutes.moderation);
  helpers.setupPageRoute(router, '/vvjob/verification', member, verificationRoutes.page);
  helpers.setupPageRoute(router, '/vvjob/verification-admin', [...member, careerRoutes.admin], verificationRoutes.adminPage);
  helpers.setupPageRoute(router, '/vvjob/evidence', member, evidenceRoutes.page);
  helpers.setupPageRoute(router, '/vvjob/evidence-admin', [...member, careerRoutes.admin], evidenceRoutes.adminPage);
  router.get('/api/vvjob/evidence/file/:uid/:id/:index', middleware.applyBlacklist, middleware.authenticateRequest, middleware.maintenanceMode, middleware.registrationComplete, ...member, careerRoutes.admin, evidenceRoutes.secure, evidenceRoutes.file);
  // Native setupApiRoute parses multipart to public temporary disk before auth.
  // Evidence must authenticate and enforce CSRF before bounded memory parsing.
  router.post('/api/vvjob/evidence/submit', middleware.applyBlacklist, middleware.authenticateRequest, middleware.maintenanceMode, middleware.registrationComplete, ...member, middleware.applyCSRF, evidenceRoutes.secure, evidenceRoutes.uploadSlot, evidenceRoutes.upload, evidenceRoutes.submit);
  for (const [path, handler, adminOnly] of [['withdraw', evidenceRoutes.withdraw], ['review', evidenceRoutes.review, true], ['revoke', evidenceRoutes.revoke, true]]) {
    router.post(`/api/vvjob/evidence/${path}`, middleware.applyBlacklist, middleware.authenticateRequest, middleware.maintenanceMode, middleware.registrationComplete, ...member, middleware.applyCSRF, ...(adminOnly ? [careerRoutes.admin] : []), handler);
  }
  helpers.setupApiRoute(router, 'get', '/api/vvjob/verification/status', member, verificationRoutes.status);
  helpers.setupApiRoute(router, 'get', '/api/vvjob/companies', [], careerRoutes.search);
  helpers.setupApiRoute(router, 'get', '/api/vvjob/companies/selected', [], careerRoutes.selected);
  for (const [path, handler, adminOnly] of [
    ['companies/submit', careerRoutes.submit], ['career', careerRoutes.save], ['career/skip', careerRoutes.skip],
    ['companies/review', careerRoutes.review, true], ['companies/import', careerRoutes.import, true],
    ['verification/request', verificationRoutes.request], ['verification/confirm', verificationRoutes.confirm], ['verification/withdraw', verificationRoutes.withdraw],
    ['verification/policy', verificationRoutes.policy, true], ['verification/settings', verificationRoutes.settings, true], ['verification/revoke', verificationRoutes.revoke, true],
  ]) {
    helpers.setupApiRoute(router, 'post', `/api/vvjob/${path}`, [...member, middleware.applyCSRF, ...(adminOnly ? [careerRoutes.admin] : [])], handler);
  }
};

exports.homepages = async (data) => {
  data.routes.push({ route: 'vvjob', name: 'VVJOB — Bảng tin' });
  return data;
};

exports.home = async ({ req, res, next }) => {
  try { await exports.render(req, res, next); } catch (err) { next(err); }
};

exports.render = async (req, res, next) => {
  res.set?.('Cache-Control', 'private, no-store');
  // Use the native controller: category privileges, blocks, pagination, and
  // deleted/scheduled topic visibility stay under NodeBB's control.
  const circle = ['coworkers','network'].includes(req.query.circle) ? req.query.circle : '';
  const sort = !circle && req.query.sort === 'popular' ? 'posts' : 'recent';
  const data = await host('controllers/recent').getData(req, 'vvjob', sort, sort === 'posts' && req.query.range !== 'all' ? 'weekly' : 'alltime');
  if (!data) { return next(); }
  const categories = await host('categories').getCategoriesByPrivilege('categories:cid', req.uid, 'read');
  const preferred = ['Thảo luận công việc', 'Thảo luận công ty', 'Lương & phúc lợi', 'Kinh nghiệm nghề nghiệp'];
  const rank = category => { const index = preferred.indexOf(String(category.name || '').replace(/&amp;/g, '&')); return index < 0 ? preferred.length : index; };
  data.communities = categories.filter(category => Number(category.cid) > 0 && !category.disabled && !category.link)
    .sort((a, b) => rank(a) - rank(b));
  const selected = data.communities.find(category => String(category.cid) === String(req.query.cid));
  if (req.query.cid && !selected) { return next(); }
  data.communities = data.communities.map(category => ({ ...category, active: String(category.cid) === String(req.query.cid) }));
  data.hasCommunity = !!selected;
  data.feedTitle = selected ? selected.name : 'Bảng tin';
  data.feedDescription = selected ? 'Chia sẻ và thảo luận cùng cộng đồng.' : 'Những câu chuyện mới từ cộng đồng người đi làm.';
  data.selectedCommunityId = selected ? Number(selected.cid) : '';
  data.feedQuery = selected ? `?cid=${Number(selected.cid)}` : '';
  data.popularQuery = selected ? `?cid=${Number(selected.cid)}&sort=popular` : '?sort=popular';
  data.trending = (await host('topics').getSortedTopics({ uid: req.uid, start: 0, stop: 14, sort: 'posts', term: 'week' })).topics;
  data.isPopular = sort === 'posts';
  if (data.isPopular) {
    const term = ['daily', 'weekly', 'monthly'].includes(req.query.term) ? req.query.term : req.query.range === 'all' ? 'alltime' : 'weekly';
    const hotUrl = (period, cid) => `/vvjob?sort=popular&${period === 'alltime' ? 'range=all' : `term=${period}`}${cid ? `&cid=${Number(cid)}` : ''}`;
    data.hotPeriods = [['daily', '24 giờ'], ['weekly', '7 ngày'], ['monthly', '30 ngày'], ['alltime', 'Tất cả']].map(([value, label]) => ({ label, active: value === term, url: hotUrl(value, selected?.cid) }));
    data.hotAllUrl = hotUrl(term);
    const hot = await host('topics').getSortedTopics({ uid: req.uid, start: 0, stop: 14, sort: 'posts', term: ({daily: 'day', weekly: 'week', monthly: 'month'})[term] || 'alltime', cids: selected ? [Number(selected.cid)] : undefined });
    data.topics = hot.topics.slice(0, 15);
    data.communities.forEach(category => { category.hotUrl = hotUrl(term, category.cid); });
    data.topics.forEach((topic, index) => { topic.rank = Number.isInteger(topic.index) ? topic.index + 1 : index + 1; topic.topRank = topic.rank <= 3; topic.replyCount = Math.max(0, Number(topic.postcount || 0) - 1); });
  }
  if (data.isPopular) {
    data.ongoing = data.topics.slice(0, 6).map(topic => ({ ...topic, domId: `talk-${topic.tid}` }));
    data.topics.forEach(topic => { topic.domId = `rank-${topic.tid}`; });
  }
  if (circle) Object.assign(data, await require('./lib/circles')(host)(circle, req.uid, selected?.cid));
  await (socialService || require('./lib/social')(host)).enrich(data, req.uid);
  if (data.isPopular && socialService) await socialService.highlights(data.ongoing, req.uid);
  data.viewerLoggedIn = Number(req.uid) > 0;
  const career = data.viewerLoggedIn ? await host('database').getObject(`vvjob:career:${req.uid}`) : null;
  data.showCareerReminder = !!(career && Number(career.onboardingPending) === 1 && Number(career.completed) !== 1);
  data.title = data.isPopular ? 'Nổi bật — VVJOB' : selected ? `${selected.name} — VVJOB` : 'Bảng tin — VVJOB';
  data.breadcrumbs = [];
  res.render('vvjob', data);
};

exports.guide = async (req, res) => {
  const communities = await host('categories').getCategoriesByPrivilege('categories:cid', req.uid, 'read');
  res.render('vvjob-guide', {
    title: 'Hướng dẫn cộng đồng — VVJOB',
    breadcrumbs: [],
    communities: communities.filter(category => Number(category.cid) > 0 && !category.disabled && !category.link),
  });
};

exports.careerProfile = async data => careerRoutes ? careerRoutes.profileData(data) : data;

exports.careerMenu = async data => {
  if (Number(data.uid) === Number(data.callerUID)) {
    data.links.push({ id: 'vvjob-career', icon: 'fa-briefcase', name: 'Hồ sơ nghề nghiệp', url: `${require.main.require('nconf').get('relative_path') || ''}/vvjob/career` });
  }
  return data;
};
exports.registered = async data => {
  if (Number(data.uid) > 0) {
    // Optional onboarding must never redirect or prevent successful registration.
    try { await host('database').setObjectField(`vvjob:career:${data.uid}`, 'onboardingPending', 1); } catch { /* Nonessential reminder; leave registration intact. */ }
  }
  return data;
};

exports.deleteCareer = async ({ uid }) => { if (reactionService) await reactionService.removeUser(uid); if (evidenceRoutes) { await evidenceRoutes.service.remove(uid, uid, true); } if (verificationRoutes) { await verificationRoutes.service.remove(uid); } await host('database').delete(`vvjob:career:${uid}`); };

exports.decoratePosts = async data => { if (authorService) await Promise.all((data.posts || []).map(async post => { post.authorMeta = await authorService(post.uid || post.user?.uid, data.uid); })); return data; };

// Native metadata hook: no settings/database writes and no browser-side patching.
exports.brandLinks = async data => require('./lib/brand')(data, require.main.require('nconf').get('relative_path') || '');
exports.brandManifest = async data => require('./lib/brand').manifest(data, require.main.require('nconf').get('relative_path') || '');

// NodeBB sets `private` during rendering; apply no-store after that native step.
exports.privatePages = async data => {
  if (/^vvjob(?:-|$)/.test(data.templateData.template?.name || '')) {
    data.res.set('Cache-Control', 'private, no-store');
  }
  return data;
};

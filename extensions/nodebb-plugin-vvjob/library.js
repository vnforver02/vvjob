'use strict';

// Dependencies resolve from the host NodeBB, never a second copy of core.
const host = name => require.main.require(`./src/${name}`);

let careerRoutes;
exports.init = async ({ router, middleware }) => {
  host('routes/helpers').setupPageRoute(router, '/vvjob', [], exports.render);
  host('routes/helpers').setupPageRoute(router, '/vvjob/guide', [], exports.guide);
  const directory = require('./lib/companies')(host('database'));
  careerRoutes = require('./lib/career-routes')(host, directory, require('./data/companies.json'));
  const helpers = host('routes/helpers');
  const member = [middleware.ensureLoggedIn, middleware.redirectToHomeIfBanned];
  helpers.setupPageRoute(router, '/vvjob/companies', [], careerRoutes.companies);
  helpers.setupPageRoute(router, '/vvjob/career', member, careerRoutes.career);
  helpers.setupPageRoute(router, '/vvjob/company-admin', [...member, careerRoutes.admin], careerRoutes.moderation);
  helpers.setupApiRoute(router, 'get', '/api/vvjob/companies', [], careerRoutes.search);
  helpers.setupApiRoute(router, 'get', '/api/vvjob/companies/selected', [], careerRoutes.selected);
  for (const [path, handler, adminOnly] of [
    ['companies/submit', careerRoutes.submit], ['career', careerRoutes.save], ['career/skip', careerRoutes.skip],
    ['companies/review', careerRoutes.review, true], ['companies/import', careerRoutes.import, true],
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
  // Use the native controller: category privileges, blocks, pagination, and
  // deleted/scheduled topic visibility stay under NodeBB's control.
  const sort = req.query.sort === 'popular' ? 'posts' : 'recent';
  const data = await host('controllers/recent').getData(req, 'vvjob', sort);
  if (!data) { return next(); }
  const categories = await host('categories').getCategoriesByPrivilege('categories:cid', req.uid, 'read');
  const preferred = ['Thảo luận công việc', 'Thảo luận công ty', 'Lương & phúc lợi', 'Kinh nghiệm nghề nghiệp'];
  const rank = category => { const index = preferred.indexOf(String(category.name || '').replace(/&amp;/g, '&')); return index < 0 ? preferred.length : index; };
  data.communities = categories.filter(category => Number(category.cid) > 0 && !category.disabled && !category.link)
    .sort((a, b) => rank(a) - rank(b));
  data.trending = (await host('topics').getSortedTopics({ uid: req.uid, start: 0, stop: 4, sort: 'posts', term: 'week' })).topics;
  data.isPopular = sort === 'posts';
  data.viewerLoggedIn = Number(req.uid) > 0;
  data.title = 'VVJOB — Real Work. Real Talk.';
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
    data.next = `${require.main.require('nconf').get('relative_path') || ''}/vvjob/career`;
  }
  return data;
};

exports.deleteCareer = async ({ uid }) => { await host('database').delete(`vvjob:career:${uid}`); };

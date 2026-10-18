'use strict';

// Dependencies resolve from the host NodeBB, never a second copy of core.
const host = name => require.main.require(`./src/${name}`);

exports.init = async ({ router }) => {
  host('routes/helpers').setupPageRoute(router, '/vvjob', [], exports.render);
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
  data.communities = categories.filter(category => !category.disabled && !category.link)
    .sort((a, b) => rank(a) - rank(b));
  data.trending = (await host('topics').getSortedTopics({ uid: req.uid, start: 0, stop: 4, sort: 'posts', term: 'week' })).topics;
  data.isPopular = sort === 'posts';
  data.viewerLoggedIn = Number(req.uid) > 0;
  data.title = 'VVJOB — Cộng đồng người đi làm';
  data.breadcrumbs = [];
  res.render('vvjob', data);
};

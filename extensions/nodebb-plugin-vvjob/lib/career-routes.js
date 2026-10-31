'use strict';
const taxonomy = require('./taxonomy');
module.exports = function (host, directory, seed, verification, evidence, catalog = []) {
  const safe = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const publicRow = row => Object.fromEntries(['id', 'name', 'aliases', 'website', 'domain', 'industry', 'industryId', 'city', 'cityId', 'source', 'checkedAt', 'logoUrl', 'logoSource', 'logoStatus', 'claimStatus', 'sourceName', 'sourceYear', 'taxId'].map(k => [k, row[k] || '']));
  const templateRow = row => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === 'string' ? safe(v) : v]));
  async function admin(req, res, next) {
    if (!await host('user').isAdministrator(req.uid)) { return res.status(403).json({ error: 'Bạn không có quyền quản trị.' }); }
    next();
  }
  const json = fn => async (req, res) => {
    try { res.json(await fn(req)); } catch (err) { res.status(400).json({ error: err.message }); }
  };
  return {
    admin,
    search: json(async req => {
      const result = await directory.list('approved', req.query.q, req.query.page, req.query);
      return { ...result, companies: result.companies.map(publicRow) };
    }),
    selected: json(async req => {
      const row = await directory.resolve(req.query.id);
      if (!row) { throw Error('Không tìm thấy công ty.'); }
      return publicRow(row);
    }),
    submit: json(req => directory.submit(req.uid, req.body)),
    save: json(req => directory.saveProfile(req.uid, req.body)),
    skip: json(async req => { await host('database').setObjectField(`vvjob:career:${req.uid}`, 'completed', 1); return { skipped: true }; }),
    review: json(req => directory.review(req.uid, req.body)),
    import: json(async req => {
      const dryRun = req.body.dryRun !== false;
      if (req.body.useSeed !== true) return directory.importRows(req.uid, req.body.companies, dryRun);
      // Both catalogs are validated in preview before either can write.
      await directory.importRows(req.uid, seed, true);
      await directory.syncCatalog(req.uid, catalog, true);
      const starter = await directory.importRows(req.uid, seed, dryRun);
      const synced = await directory.syncCatalog(req.uid, catalog, dryRun);
      return { ...synced, added: starter.added + synced.added, skipped: starter.skipped + synced.skipped };
    }),
    companies: async (req, res) => {
      const page = Math.max(0, Math.floor(Number(req.query.page) || 0));
      const query = String(req.query.q || '').slice(0, 100);
      const filters = { industry: String(req.query.industry || '').slice(0, 64), city: String(req.query.city || '').slice(0, 64), sort: req.query.sort === 'name' ? 'name' : 'recent' };
      const result = await directory.list('approved', query, page, filters);
      const params = new URLSearchParams({ q: query, ...filters });
      const filterOptions = {
        industryFilters: taxonomy.catalog.industries.map(row => ({ ...row, selected: row.id === filters.industry })),
        cityFilters: taxonomy.catalog.cities.map(row => ({ ...row, selected: row.id === filters.city })),
        otherIndustrySelected: filters.industry === 'other', otherCitySelected: filters.city === 'other', unknownSelected: filters.city === 'unknown', sortByName: filters.sort === 'name',
      };
      res.render('vvjob-companies', { title: 'Khám phá công ty — VVJOB', ...result, ...filterOptions, filterQuery: safe(params.toString()), hasFilters: !!(query || filters.industry || filters.city),
        companies: result.companies.map(publicRow).map(templateRow), query: safe(query), nextPage: page + 1, prevPage: page - 1, hasPrev: page > 0, queryEncoded: encodeURIComponent(query) });
    },
    career: async (req, res) => {
      const profile = await directory.profile(req.uid, req.uid) || {};
      const careerOptions = {};
      for (const [kind, field] of [['positions', 'position'], ['cities', 'city'], ['levels', 'level']]) {
        careerOptions[kind] = taxonomy.options(kind, profile[`${field}Id`], profile[field] || '', kind === 'positions' ? profile.jobFamilyId : '');
        careerOptions[`${field}Other`] = careerOptions[kind].some(row => row.id === 'other' && row.selected);
      }
      careerOptions.families = taxonomy.catalog.families.map(row => ({ ...row, selected: row.id === profile.jobFamilyId }));
      res.render('vvjob-career', { title: 'Hồ sơ nghề nghiệp — VVJOB', ...careerOptions, companyCities: taxonomy.catalog.cities, career: templateRow(profile), companyAdmin: await host('user').isAdministrator(req.uid) });
    },
    moderation: async (req, res) => {
      const state = ['approved', 'pending', 'rejected', 'merged'].includes(req.query.state) ? req.query.state : 'pending';
      const page = Math.max(0, Math.floor(Number(req.query.page) || 0));
      const result = await directory.list(state, '', page);
      res.render('vvjob-company-admin', { title: 'Quản lý công ty — VVJOB', ...result, state, nextPage: page + 1, hasPrev: page > 0, prevPage: page - 1, companies: result.companies.map(templateRow) });
    },
    async profileData(data) {
      const profile = await directory.profile(data.userData.uid, data.callerUID);
      data.userData.vvjobIdentity = await require('./identity')(host('database'), evidence, verification)(data.userData.uid, profile);
      if (profile) {
        // Public profile data exposes a result, never its private proof channel.
        delete profile.verification;
        delete profile.hasWorkEmailVerification;
        delete profile.hasDocumentVerification;
        profile.isVerified = !!data.userData.vvjobIdentity.verified;
        data.userData.vvjobCareer = templateRow(profile);
      }
      return data;
    },
  };
};

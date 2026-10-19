'use strict';
const { randomUUID } = require('node:crypto');
const { isIP } = require('node:net');
const taxonomy = require('./taxonomy');
const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
function text(value, max, required = false) {
  if (typeof value !== 'string' || value.length > max || /[<>\x00-\x1f]/.test(value)) { throw Error('Thông tin không hợp lệ.'); }
  value = value.trim();
  if (required && !value) { throw Error('Vui lòng điền thông tin bắt buộc.'); }
  return value;
}
function url(value, required = false) {
  value = text(value || '', 500, required);
  if (!value) { return ''; }
  let parsed;
  try { parsed = new URL(value); } catch { throw Error('Vui lòng nhập địa chỉ HTTPS hợp lệ.'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port || isIP(parsed.hostname) || !parsed.hostname.includes('.') || /(^|\.)(localhost|local|internal|test|invalid)$/.test(parsed.hostname)) {
    throw Error('Chỉ chấp nhận địa chỉ HTTPS công khai.');
  }
  return parsed.href;
}
function validate(input, allowReferenceOnly = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) { throw Error('Thông tin không hợp lệ.'); }
  const website = url(input.website, !allowReferenceOnly);
  const industry = taxonomy.field('industries', input.industryId, text(input.industry || '', 100));
  const city = taxonomy.field('cities', input.cityId, text(input.city || '', 100));
  return {
    name: text(input.name, 140, true), aliases: text(input.aliases || '', 300),
    website, domain: website ? new URL(website).hostname.replace(/^www\./, '') : '',
    industry: industry.label, industryId: industry.id, city: city.label, cityId: city.id,
    source: url(input.source || website, true), checkedAt: text(input.checkedAt || '', 30),
    // A website is a reference, never an automatically approved employment domain.
    logoUrl: '', logoSource: '', logoStatus: 'missing', claimStatus: 'unclaimed',
  };
}
module.exports = function createDirectory(db) {
  const key = id => `vvjob:company:${id}`;
  const validId = id => typeof id === 'string' && /^[a-zA-Z0-9-]{1,64}$/.test(id);
  async function get(id) { return validId(id) ? db.getObject(key(id)) : null; }
  async function list(state = 'approved', q = '', page = 0, filters = {}) {
    // Bounded per-request database work; search is capped at the first 5000 records.
    const ids = await db.getSortedSetRevRange(`vvjob:companies:${state}`, 0, 4999);
    const rows = (await db.getObjects(ids.map(key))).filter(Boolean).filter(row => row.status === state).map(row => ({ ...row,
      industryId: row.industryId || taxonomy.field('industries', undefined, row.industry || '').id,
      cityId: row.cityId || taxonomy.field('cities', undefined, row.city || '').id,
    }));
    const query = fold(String(q).slice(0, 100));
    const filtered = rows.filter(row => (!query || fold(`${row.name} ${row.aliases} ${row.domain} ${row.taxId || ''}`).includes(query)) &&
      (!filters.industry || row.industryId === filters.industry) &&
      (!filters.city || (filters.city === 'unknown' ? !row.city : row.cityId === filters.city)));
    if (filters.sort === 'name') { filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi')); }
    const facets = {
      industries: [...new Set(rows.map(row => row.industryId).filter(Boolean))].map(id => ({ id, label: taxonomy.find('industries', id)?.label || 'Khác' })),
      cities: [...new Map(rows.filter(row => row.city).map(row => [row.cityId, { id: row.cityId, label: taxonomy.find('cities', row.cityId)?.label || row.city }])).values()],
      unknownCity: rows.some(row => !row.city),
    };
    const offset = Math.max(0, Math.min(Math.floor(Number(page) || 0), 1000)) * 24;
    return { companies: filtered.slice(offset, offset + 24), total: filtered.length, hasMore: filtered.length > offset + 24, facets };
  }
  async function submit(uid, input) {
    const data = validate(input);
    const recent = await db.sortedSetCount(`vvjob:company-submissions:${uid}`, Date.now() - 86400000, '+inf');
    if (recent >= 5) { throw Error('Bạn đã gửi 5 công ty hôm nay. Vui lòng thử lại vào ngày mai.'); }
    const id = randomUUID(), now = Date.now();
    await db.setObject(key(id), { ...data, id, status: 'pending', submittedBy: uid, createdAt: now });
    await db.sortedSetAdd(`vvjob:companies:pending`, now, id);
    await db.sortedSetAdd(`vvjob:company-submissions:${uid}`, now, id);
    await db.expire(`vvjob:company-submissions:${uid}`, 172800);
    return { id, status: 'pending' };
  }
  async function review(uid, input) {
    const row = await get(input.id);
    if (!row) { throw Error('Không tìm thấy công ty.'); }
    if (!['approve', 'reject', 'merge', 'logo'].includes(input.action)) { throw Error('Thao tác không hợp lệ.'); }
    const changes = { reviewedBy: uid, reviewedAt: Date.now() };
    if (input.action === 'logo') {
      changes.logoUrl = url(input.logoUrl, true);
      changes.logoSource = url(input.logoSource, true);
      changes.logoStatus = 'reviewed';
    } else if (input.action === 'merge') {
      const target = await get(input.targetId);
      if (!target || target.status !== 'approved' || target.id === row.id) { throw Error('Công ty đích không hợp lệ.'); }
      changes.status = 'merged'; changes.mergedInto = target.id;
      const aliases = [...new Set([target.aliases, row.name, row.aliases].filter(Boolean))].join('; ').slice(0, 300);
      await db.setObjectField(key(target.id), 'aliases', aliases);
    } else { changes.status = input.action === 'approve' ? 'approved' : 'rejected'; }
    changes.reviewNote = text(input.note || '', 300);
    await db.setObject(key(row.id), changes);
    if (changes.status && changes.status !== row.status) {
      await db.sortedSetAdd(`vvjob:companies:${changes.status}`, Date.now(), row.id);
      await db.sortedSetRemove(`vvjob:companies:${row.status}`, row.id);
    }
    return { id: row.id, status: changes.status || row.status };
  }
  async function resolve(id) {
    const visited = new Set();
    let row = await get(id);
    while (row && row.status === 'merged' && !visited.has(row.id) && visited.size < 10) {
      visited.add(row.id); row = await get(row.mergedInto);
    }
    return row && row.status === 'approved' ? row : null;
  }
  async function saveProfile(uid, input) {
    if (!['employed', 'looking', 'freelance', 'student', 'unspecified'].includes(input.workStatus)) { throw Error('Tình trạng công việc không hợp lệ.'); }
    const company = input.companyId ? await resolve(input.companyId) : null;
    if (input.companyId && !company) { throw Error('Vui lòng chọn công ty đã được duyệt.'); }
    const position = taxonomy.field('positions', input.positionId, text(input.position || '', 100));
    const industry = taxonomy.field('industries', input.industryId, text(input.industry || '', 100));
    const city = taxonomy.field('cities', input.cityId, text(input.city || '', 100));
    const level = taxonomy.field('levels', input.levelId, text(input.level || '', 100));
    const family = input.jobFamilyId ? taxonomy.find('families', input.jobFamilyId) : null;
    if (input.jobFamilyId && (!family || (position.family && family.id !== position.family))) {
      throw Error('Vị trí không thuộc nhóm nghề đã chọn. Vui lòng chọn lại.');
    }
    const previous = await db.getObject(`vvjob:career:${uid}`) || {};
    const companyBinding = company && previous.companyId === company.id && previous.companyBinding ? previous.companyBinding : randomUUID();
    const data = { workStatus: input.workStatus, companyId: company ? company.id : '', companyBinding,
      position: position.label, positionId: position.id, jobFamilyId: position.family || family?.id || '',
      industry: industry.label, industryId: industry.id, city: city.label, cityId: city.id, level: level.label, levelId: level.id,
      publicCompany: input.publicCompany === true ? 1 : 0, updatedAt: Date.now(), completed: 1 };
    // Removing the optional industry control must not erase previously saved data.
    if (!Object.hasOwn(input, 'industry') && !Object.hasOwn(input, 'industryId')) { delete data.industry; delete data.industryId; }
    // Client-supplied verification flags are deliberately never stored.
    await db.setObject(`vvjob:career:${uid}`, data);
    return data;
  }
  async function profile(uid, viewer) {
    const data = await db.getObject(`vvjob:career:${uid}`);
    if (!data || (Number(uid) !== Number(viewer) && Number(data.publicCompany) !== 1)) { return null; }
    const company = await resolve(data.companyId);
    const fields = ['workStatus', 'position', 'positionId', 'jobFamilyId', 'city', 'cityId', 'level', 'levelId', 'publicCompany', 'updatedAt', 'completed'];
    if (Number(uid) === Number(viewer)) { fields.push('industry', 'industryId'); }
    const visible = Object.fromEntries(fields.filter(field => Object.hasOwn(data, field)).map(field => [field, data[field]]));
    return { ...visible, companyId: company ? company.id : '', companyName: company ? company.name : '', verification: 'unverified' };
  }
  async function importRows(uid, rows, dryRun = true) {
    if (!Array.isArray(rows) || rows.length > 200) { throw Error('Mỗi lần nhập tối đa 200 công ty.'); }
    const ids = new Set();
    const validated = rows.map(row => {
      if (!validId(row.id) || ids.has(row.id)) { throw Error('Mã công ty không hợp lệ hoặc bị trùng.'); }
      ids.add(row.id); return { ...validate(row), id: row.id, logoCandidateUrl: url(row.logoCandidateUrl || ''), logoCandidateSource: url(row.logoCandidateSource || '') };
    });
    // Validate the whole batch before any writes. Stable IDs make retries idempotent.
    const existing = await Promise.all(validated.map(row => get(row.id)));
    const added = validated.filter((row, index) => !existing[index]);
    if (!dryRun) {
      for (const row of added) {
        await db.setObject(key(row.id), { ...row, status: 'approved', reviewedBy: uid, reviewedAt: Date.now(), createdAt: Date.now() });
        await db.sortedSetAdd('vvjob:companies:approved', Date.now(), row.id);
      }
    }
    return { dryRun, added: added.length, skipped: validated.length - added.length };
  }
  return { get, list, submit, review, resolve, saveProfile, profile, importRows, syncCatalog: require('./company-catalog')(db) };
};
module.exports.validate = validate;
module.exports.fold = fold;

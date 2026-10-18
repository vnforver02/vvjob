'use strict';
const { createHmac, createHash, randomBytes, randomInt, timingSafeEqual } = require('node:crypto');
const { domainToASCII } = require('node:url');
const { isIP } = require('node:net');
const OTP_TTL = 10 * 60000, PROOF_TTL = 180 * 86400000;
const blocked = ['gmail.com','googlemail.com','outlook.com','hotmail.com','live.com','yahoo.com','yahoo.com.vn','icloud.com','me.com','qq.com','163.com','126.com','proton.me','protonmail.com','mail.com','aol.com','onmicrosoft.com','com.vn','net.vn','org.vn','edu.vn','gov.vn'];
const shared = new Set(['admin','administrator','info','contact','support','help','hello','hr','jobs','careers','recruitment','sales','marketing','office','noreply','no-reply']);
function failure(message) { const err = Error(message); err.expose = true; throw err; }
function domain(value) {
  if (typeof value !== 'string' || value.length > 253 || /[\s/@:#?\\]/.test(value)) { failure('Tên miền email không hợp lệ.'); }
  const name = domainToASCII(value.toLowerCase());
  if (!name || isIP(name) || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(name) || /\.(local|localhost|internal|invalid|test)$/.test(name) || blocked.some(item => name === item || name.endsWith(`.${item}`))) { failure('Vui lòng dùng tên miền email riêng của công ty.'); }
  return name;
}
function email(value) {
  if (typeof value !== 'string' || value.length > 254 || value !== value.trim()) { failure('Email công ty không hợp lệ.'); }
  const parts = value.toLowerCase().split('@');
  if (parts.length !== 2 || !/^[a-z0-9][a-z0-9._%+-]{0,63}$/.test(parts[0]) || shared.has(parts[0])) { failure('Vui lòng dùng email công ty được cấp riêng cho bạn.'); }
  return `${parts[0]}@${domain(parts[1])}`;
}
module.exports = function createVerification({ db, directory, secret, withLock, mailReady, send, mailSignature = () => 'test-config', supported = true, now = Date.now, code = () => String(randomInt(0, 1000000)).padStart(6, '0') }) {
  const configuredSecret = typeof secret === 'string' && secret.length >= 16;
  const hash = value => createHmac('sha256', secret).update(value).digest('hex');
  const keyVersion = configuredSecret ? hash('vvjob-verification-key-version') : '';
  const stateKey = uid => `vvjob:verification:user:${uid}`;
  const policyKey = name => `vvjob:verification:domain:${createHash('sha256').update(name).digest('hex')}`;
  const claimKey = digest => `vvjob:verification:mail:${digest}`;
  const userId = uid => { if (!Number.isSafeInteger(Number(uid)) || Number(uid) <= 0) { failure('Vui lòng đăng nhập lại.'); } return Number(uid); };
  const digest = (uid, state, value) => hash([uid, state.challengeId, state.companyId, state.binding, state.emailHash, value].join('|'));
  async function audit(uid, action, companyId = '', actor = uid) {
    const id = randomBytes(16).toString('hex');
    await db.setObject(`vvjob:verification:audit:${id}`, { uid, actor, action, companyId, at: now() });
    await db.expire(`vvjob:verification:audit:${id}`, 365 * 86400);
    await db.sortedSetAdd('vvjob:verification:audit', now(), id);
  }
  async function readiness() {
    const settings = await db.getObject('vvjob:verification:settings') || {};
    const transport = configuredSecret && await mailReady();
    const deliveryConfirmed = Number(settings.deliveryConfirmed) === 1 && settings.deliveryRevision === mailSignature();
    return { available: !!(transport && Number(settings.enabled) === 1 && deliveryConfirmed), transportReady: !!transport, enabled: Number(settings.enabled) === 1, deliveryConfirmed };
  }
  async function policy(name) { return db.getObject(policyKey(name)); }
  async function context(uid, ensureBinding = false) {
    if (await db.getObject(`vvjob:verification:deleted:${uid}`)) { return { career: {}, company: null }; }
    return require('./career-context')(db, directory, uid, ensureBinding);
  }
  async function isValid(uid, state) {
    if (!state || state.status !== 'verified' || state.keyVersion !== keyVersion || Number(state.expiresAt) <= now()) { return false; }
    const { career, company } = await context(uid), rule = await policy(state.domain);
    return !!(company && company.id === state.companyId && career.companyBinding && career.companyBinding === state.binding && rule && Number(rule.active) === 1 && rule.companyId === company.id && rule.revision === state.policyRevision);
  }
  async function status(uid) {
    uid = userId(uid);
    const state = await db.getObject(stateKey(uid)), { company } = await context(uid), ready = await readiness();
    let current = state?.status || 'unverified';
    if (current === 'verified' && !await isValid(uid, state)) { current = Number(state.expiresAt) <= now() ? 'expired' : 'invalidated'; }
    if (['pending','sending'].includes(current) && Number(state.codeExpiresAt) <= now()) { current = 'expired'; }
    const policies = await db.getSortedSetRevRange('vvjob:verification:domains', 0, 999);
    const rules = (await db.getObjects(policies)).filter(row => row && Number(row.active) === 1 && row.companyId === company?.id);
    return { status: current, available: ready.available, companyId: company?.id || '', companyName: company?.name || '', domains: rules.map(row => row.domain),
      maskedEmail: state?.maskedEmail || '', challengeId: current === 'pending' ? state.challengeId : '',
      codeExpiresAt: ['pending','sending'].includes(current) ? Number(state.codeExpiresAt) : 0,
      verifiedAt: current === 'verified' ? Number(state.verifiedAt) : 0, expiresAt: current === 'verified' ? Number(state.expiresAt) : 0 };
  }
  async function quota(name, limit) {
    const key = `vvjob:verification:quota:${name}`;
    const count = Number(await db.incrObjectField(key, 'count'));
    await db.expire(key, 172800);
    if (count > limit) { failure('Đã đạt giới hạn gửi mã. Vui lòng thử lại sau.'); }
  }
  async function releaseClaim(uid, state) {
    if (!state?.emailHash) { return; }
    const key = claimKey(state.emailHash), owner = await db.getObject(key);
    if (owner && Number(owner.uid) === uid) { await db.delete(key); }
  }
  async function request(uid, input, ip = '') {
    uid = userId(uid);
    if (input?.consent !== true) { failure('Vui lòng đồng ý dùng email công ty để xác minh.'); }
    const address = email(input.email), name = address.split('@')[1];
    let pending, otp;
    await withLock(async () => {
      if (!(await readiness()).available) { failure('Xác minh email công ty chưa mở. Vui lòng quay lại sau.'); }
      const { career, company } = await context(uid, true), rule = await policy(name);
      if (!company || !career.companyBinding) { failure('Vui lòng chọn và lưu công ty trong hồ sơ trước.'); }
      if (!rule || Number(rule.active) !== 1 || rule.companyId !== company.id) { failure('Tên miền email này chưa được duyệt cho công ty đã chọn.'); }
      const old = await db.getObject(stateKey(uid));
      if (old && now() - Number(old.lastSentAt) < 60000) { failure('Vui lòng đợi 60 giây trước khi gửi lại mã.'); }
      const emailHash = hash(`email:${address}`), owner = await db.getObject(claimKey(emailHash));
      if (owner && Number(owner.uid) !== uid && Number(owner.expiresAt) > now()) { failure('Không thể dùng email này. Vui lòng liên hệ quản trị nếu cần hỗ trợ.'); }
      const day = Math.floor(now() / 86400000), hour = Math.floor(now() / 3600000);
      await quota(`uid:${uid}:${day}`, 5); await quota(`email:${emailHash}:${day}`, 5); await quota(`ip:${hash(`ip:${ip}`)}:${hour}`, 20);
      otp = code(); if (!/^\d{6}$/.test(otp)) { throw Error('Invalid OTP generator'); }
      pending = { status: 'sending', keyVersion, challengeId: randomBytes(16).toString('hex'), companyId: company.id, binding: career.companyBinding,
        domain: name, policyRevision: rule.revision, emailHash, maskedEmail: `${address[0]}***@${name}`, codeExpiresAt: now() + OTP_TTL,
        lastSentAt: now(), attempts: 0, codeDigest: '', verifiedAt: 0, expiresAt: 0 };
      pending.codeDigest = digest(uid, pending, otp);
      await releaseClaim(uid, old);
      await db.setObject(stateKey(uid), pending); await db.expire(stateKey(uid), 86400);
    });
    // Never hold a cross-process DB lock while waiting on a mail service.
    try { await send(address, otp, pending.companyId, uid); } catch {
      await withLock(async () => { const active = await db.getObject(stateKey(uid)); if (active?.challengeId === pending.challengeId) { await db.setObject(stateKey(uid), { status: 'failed', codeDigest: '' }); } });
      failure('Không gửi được email. Chưa có mã nào được kích hoạt. Vui lòng thử lại sau.');
    }
    await withLock(async () => {
      const active = await db.getObject(stateKey(uid));
      if (active?.challengeId === pending.challengeId && active.status === 'sending') { await db.setObjectField(stateKey(uid), 'status', 'pending'); await audit(uid, 'code-sent', pending.companyId); }
    });
    return status(uid);
  }
  async function confirm(uid, input) {
    uid = userId(uid);
    if (!input || typeof input.code !== 'string' || !/^\d{6}$/.test(input.code) || typeof input.challengeId !== 'string' || !/^[a-f0-9]{32}$/.test(input.challengeId)) { failure('Vui lòng nhập mã gồm 6 chữ số.'); }
    await withLock(async () => {
      if (!(await readiness()).available) { failure('Xác minh email công ty hiện chưa khả dụng.'); }
      const state = await db.getObject(stateKey(uid));
      if (!state || state.status !== 'pending' || state.challengeId !== input.challengeId || Number(state.codeExpiresAt) <= now() || Number(state.attempts) >= 5) { failure('Mã đã hết hạn hoặc không còn hiệu lực. Vui lòng yêu cầu mã mới.'); }
      const { career, company } = await context(uid), rule = await policy(state.domain);
      if (!company || company.id !== state.companyId || career.companyBinding !== state.binding || !rule || Number(rule.active) !== 1 || rule.revision !== state.policyRevision || rule.companyId !== company.id) { failure('Thông tin công ty đã thay đổi. Vui lòng yêu cầu mã mới.'); }
      const expected = digest(uid, state, input.code), actual = String(state.codeDigest || '');
      const matches = expected.length === actual.length && timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
      const attempts = Number(state.attempts) + 1;
      if (!matches) {
        await db.setObject(stateKey(uid), { attempts, ...(attempts >= 5 ? { status: 'locked', codeDigest: '' } : {}) });
        failure(attempts >= 5 ? 'Đã nhập sai 5 lần. Vui lòng yêu cầu mã mới.' : 'Mã không đúng. Vui lòng kiểm tra lại.');
      }
      const owner = await db.getObject(claimKey(state.emailHash));
      if (owner && Number(owner.uid) !== uid && Number(owner.expiresAt) > now()) { failure('Không thể dùng email này. Vui lòng liên hệ quản trị.'); }
      const expiresAt = now() + PROOF_TTL;
      await db.setObject(claimKey(state.emailHash), { uid, expiresAt }); await db.expire(claimKey(state.emailHash), 190 * 86400);
      await db.setObject(stateKey(uid), { status: 'verified', attempts, codeDigest: '', verifiedAt: now(), expiresAt });
      await db.expire(stateKey(uid), 190 * 86400); await audit(uid, 'email-verified', company.id);
    });
    return status(uid);
  }
  async function revoke(uid, actor = uid) {
    uid = userId(uid);
    await withLock(async () => {
      const state = await db.getObject(stateKey(uid));
      await releaseClaim(uid, state);
      await db.delete(stateKey(uid));
      await audit(uid, Number(actor) === uid ? 'withdrawn' : 'admin-revoked', state?.companyId || '', actor);
    });
    return { status: 'unverified' };
  }
  async function savePolicy(actor, input) {
    const name = domain(input.domain), company = await directory.resolve(input.companyId);
    if (!company) { failure('Vui lòng chọn công ty đã được duyệt.'); }
    let source;
    try { source = new URL(input.source); } catch { failure('Vui lòng ghi nguồn đối chiếu tên miền.'); }
    if (source.protocol !== 'https:' || source.username || source.password || /[<>\s]/.test(source.href)) { failure('Nguồn đối chiếu phải là URL HTTPS.'); }
    if (input.confirmOwnership !== true || typeof input.note !== 'string' || input.note.trim().length < 5 || input.note.length > 300 || /[<>\x00-\x1f]/.test(input.note)) { failure('Vui lòng xác nhận đã đối chiếu quyền sở hữu tên miền và ghi chú.'); }
    await withLock(async () => {
      await db.setObject(policyKey(name), { domain: name, companyId: company.id, companyName: company.name, source: source.href, note: input.note.trim(), active: input.active === true ? 1 : 0, revision: randomBytes(16).toString('hex'), reviewedBy: actor, reviewedAt: now() });
      await db.sortedSetAdd('vvjob:verification:domains', now(), policyKey(name));
      await audit(0, input.active === true ? 'domain-approved' : 'domain-disabled', company.id, actor);
    });
    return { saved: true };
  }
  async function settings(actor, input) {
    if (input.enabled === true && (input.deliveryConfirmed !== true || !configuredSecret || !await mailReady())) { failure('Cần cấu hình SMTP và xác nhận đã thử nhận email thực tế trước khi mở.'); }
    await withLock(async () => { await db.setObject('vvjob:verification:settings', { enabled: input.enabled === true ? 1 : 0, deliveryConfirmed: input.deliveryConfirmed === true ? 1 : 0, deliveryRevision: mailSignature(), updatedBy: actor, updatedAt: now() }); await audit(0, input.enabled === true ? 'service-enabled' : 'service-disabled', '', actor); });
    return readiness();
  }
  async function adminData() {
    const keys = await db.getSortedSetRevRange('vvjob:verification:domains', 0, 999);
    const ids = await db.getSortedSetRevRange('vvjob:verification:audit', 0, 49);
    return { ...(await readiness()), policies: (await db.getObjects(keys)).filter(Boolean), audit: (await db.getObjects(ids.map(id => `vvjob:verification:audit:${id}`))).filter(Boolean) };
  }
  return { request, confirm, status, revoke, savePolicy, settings, adminData, valid: async uid => isValid(uid, await db.getObject(stateKey(uid))), remove: async uid => {
    if (!supported) { await db.delete(stateKey(uid)); return; }
    await withLock(async () => {
      await db.setObject(`vvjob:verification:deleted:${uid}`, { deleted: 1 }); await db.expire(`vvjob:verification:deleted:${uid}`, 190 * 86400);
      const state = await db.getObject(stateKey(uid)); await releaseClaim(Number(uid), state); await db.delete(stateKey(uid));
    });
  } };
};
module.exports.domain = domain;
module.exports.email = email;

'use strict';
module.exports = function (host, directory, getConfig, Pool) {
  const safe = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = row => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === 'string' ? safe(v) : v]));
  const db = host('database');
  const supported = !!(db.pool && db.pool.options);
  const withLock = require('./verification-lock')(db, Pool);
  const service = require('./verification')({
    db, directory, secret: getConfig('secret'), withLock, supported,
    mailSignature: () => require('node:crypto').createHash('sha256').update(JSON.stringify(['email:from','email:smtpTransport:host','email:smtpTransport:port','email:smtpTransport:service','email:smtpTransport:security','email:smtpTransport:user','email:smtpTransport:pass'].map(key => host('meta').config[key] || ''))).digest('hex'),
    mailReady: async () => {
      const config = host('meta').config;
      const service = config['email:smtpTransport:service'];
      const localPreview = !!getConfig('jobsDisabled') && /^http:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(getConfig('url') || '');
      return supported && (config['email:smtpTransport:security'] !== 'NONE' || localPreview) && Number(config['email:smtpTransport:enabled']) === 1 && !!(config['email:smtpTransport:host'] || service && service !== 'nodebb-custom-smtp') &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config['email:from'] || '') && !!host('emailer').transports.smtp;
    },
    send: async (email, code, companyId, uid) => {
      const company = await directory.resolve(companyId);
      if (!company) { throw Error('Unavailable company'); }
      await host('emailer').sendToEmail('vvjob-verification', email, 'vi', { uid, code, companyName: safe(company.name), subject: 'Mã xác minh email công ty VVJOB' });
    },
  });
  const json = handler => async (req, res) => {
    try { res.json(await handler(req)); } catch (err) { res.status(err.expose ? 400 : 503).json({ error: err.expose ? err.message : 'Không thể xử lý xác minh lúc này. Vui lòng thử lại sau.' }); }
  };
  const labels = { unverified: 'Chưa xác minh', sending: 'Đang gửi mã', pending: 'Chờ nhập mã', verified: 'Đã xác minh email công ty', expired: 'Đã hết hạn', invalidated: 'Cần xác minh lại', locked: 'Mã đã bị khóa', failed: 'Gửi email chưa thành công' };
  const date = stamp => stamp ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(stamp)) : '';
  return {
    service,
    request: json(req => service.request(req.uid, req.body, req.ip)),
    confirm: json(req => service.confirm(req.uid, req.body)),
    withdraw: json(req => service.revoke(req.uid)),
    policy: json(req => service.savePolicy(req.uid, req.body)),
    settings: json(req => service.settings(req.uid, req.body)),
    revoke: json(req => service.revoke(req.body.uid, req.uid)),
    status: json(req => service.status(req.uid)),
    async page(req, res) {
      const state = await service.status(req.uid);
      res.render('vvjob-verification', {
        title: 'Xác minh nghề nghiệp — VVJOB', verification: clean(state),
        statusLabel: labels[state.status] || labels.unverified, domains: state.domains.map(value => ({ domain: safe(value) })),
        verified: state.status === 'verified', pending: state.status === 'pending',
        canRequest: state.available && !!state.companyId && state.domains.length > 0,
        canWithdraw: !['unverified'].includes(state.status), verifiedDate: date(state.verifiedAt), expiryDate: date(state.expiresAt),
      });
    },
    async adminPage(req, res) {
      const data = await service.adminData();
      res.render('vvjob-verification-admin', { title: 'Quản lý xác minh — VVJOB', ...data,
        policies: data.policies.map(row => ({ ...clean(row), active: Number(row.active) === 1, date: date(Number(row.reviewedAt)) })),
        audit: data.audit.map(row => ({ ...clean(row), date: date(Number(row.at)) })),
      });
    },
  };
};

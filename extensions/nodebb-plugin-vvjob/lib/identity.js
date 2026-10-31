'use strict';
module.exports = (db, evidence, verification) => async (uid, career) => {
  const demo = await db.getObject(`vvjob:demo:user:${uid}`);
  if (demo?.batch === 'vvjob-fixture-200-20261020') {
    return { isDemo: true, previewFixture: true, simulatedVerified: Number(demo.simulatedVerified) === 1, verified: false, verificationLabel: 'Trạng thái xác minh thử nghiệm — dữ liệu tổng hợp' };
  }
  if (demo?.batch === require('./demo-users').BATCH) {
    return { isDemo: true, simulatedVerified: Number(demo.simulatedVerified) === 1, verified: false, verificationLabel: Number(demo.simulatedVerified) === 1 ? 'Xác minh mô phỏng — không phải chứng nhận thực' : 'Hồ sơ minh họa — chưa xác minh' };
  }
  if (!career?.companyId) return { isDemo: false, simulatedVerified: false, verified: false };
  const document = !!(evidence && await evidence.valid(uid));
  const email = !!(verification && await verification.valid(uid));
  return { isDemo: false, simulatedVerified: false, verified: document || email, verificationLabel: document || email ? 'Đã xác minh nghề nghiệp' : '' };
};

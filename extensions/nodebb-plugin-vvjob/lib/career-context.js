'use strict';
const { randomUUID } = require('node:crypto');

// Certificate request callers hold the shared PostgreSQL advisory lock. Older
// saved careers predate companyBinding; repair only that internal field without
// resaving the form, changing privacy settings, or granting a verification.
module.exports = async function careerContext(db, directory, uid, ensureBinding = false) {
  const key = `vvjob:career:${uid}`;
  const career = await db.getObject(key) || {};
  const company = await directory.resolve(career.companyId);
  if (ensureBinding && company && !career.companyBinding) {
    await db.setObjectField(key, 'companyBinding', randomUUID());
    const current = await db.getObject(key) || {};
    return { career: current, company: await directory.resolve(current.companyId) };
  }
  return { career, company };
};

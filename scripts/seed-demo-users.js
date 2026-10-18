'use strict';
// Explicit operator invocation only. Run inside NodeBB with --apply after backup.
const path = require('node:path');
const root = process.env.NODEBB_ROOT || process.cwd();
const host = name => require(path.join(root, name));
const { record, BATCH } = require('../extensions/nodebb-plugin-vvjob/lib/demo-users');
const nconf = host('node_modules/nconf');
nconf.argv().env({ separator: '__' });
host('src/prestart').loadConfig(process.env.NODEBB_CONFIG || path.join(root, 'config.json'));
nconf.set('jobsDisabled', true); nconf.set('runJobs', false);
(async () => {
 const db = host('src/database'); await db.init(); await host('src/meta').configs.init();
 const user = host('src/user');
 const mapKey = `vvjob:demo:batch:${BATCH}`;
 const apply = process.argv.includes('--apply');
 const directory = require('../extensions/nodebb-plugin-vvjob/lib/companies')(db);
 let created = 0, existing = 0, simulatedVerified = 0;
 for (let index = 1; index <= 500; index++) {
  const row = record(index);
  let uid = Number(await db.getObjectField(mapKey, String(index)));
  if (!apply) { if (uid) existing++; continue; }
  if (!uid) {
   if (await user.getUidByUsername(row.username)) throw Error(`Username collision at demo index ${index}; no existing user modified`);
   // No password, email, OAuth identity or session; these accounts cannot sign in.
   uid = await user.create({ username: row.username, fullname: row.fullname });
   await db.setObjectField(mapKey, String(index), uid); created++;
  } else {
   if (await user.getUserField(uid, 'username') !== row.username) throw Error('Seed mapping mismatch');
   existing++;
  }
  const company = await directory.resolve(row.companyId);
  if (!company) throw Error(`Demo company unavailable: ${row.companyId}`);
  await db.setObject(`vvjob:demo:user:${uid}`, { batch: BATCH, index, simulatedVerified: row.simulatedVerified ? 1 : 0, gender: row.gender });
  await user.setUserFields(uid, { fullname: row.fullname, picture: `${nconf.get('relative_path') || ''}/vvjob/demo-avatar/${index}.svg`, status: 'offline', signature: 'Hồ sơ minh họa — nhân vật và thông tin công việc đều là dữ liệu mô phỏng.' });
  await db.sortedSetRemove('users:online', uid);
  await db.setObject(`user:${uid}:settings`, { showfullname: 1, showemail: 0, dailyDigestFreq: 'off', disableIncomingChats: 1 });
  await user.updateDigestSetting(uid, 'off');
  await db.setObject(`vvjob:career:${uid}`, { companyId: company.id, position: row.position, city: row.city, publicCompany: 1, completed: 1, companyBinding: `demo-${BATCH}-${index}` });
  if (row.simulatedVerified) simulatedVerified++;
  if (index % 100 === 0) console.log(`Demo profiles processed: ${index}/500`);
 }
 const ids = Object.values(await db.getObject(mapKey) || {});
 if (apply && (ids.length !== 500 || new Set(ids.map(String)).size !== 500 || simulatedVerified !== 250)) throw Error('Demo count verification failed');
 if (apply) {
  for (const uid of ids) {
   if (await user.hasPassword(uid) || await user.getUserField(uid, 'email') || await db.getObject(`vvjob:evidence:user:${uid}`) || await db.getObject(`vvjob:verification:user:${uid}`)) throw Error('Demo account unexpectedly has credentials or a real verification record');
  }
 }
 console.log(JSON.stringify({ applied: apply, batch: BATCH, created, existing, total: ids.length, simulatedVerified, realVerificationRecordsCreated: 0 }));
 await db.close();
})().then(() => process.exit(0)).catch(err => { console.error(err.message); process.exit(1); });

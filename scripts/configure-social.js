'use strict';
// Explicit operator configuration; no NodeBB core changes or credential output.
const path = require('node:path');
const root = process.env.NODEBB_ROOT || process.cwd();
const host = name => require(path.join(root, name));
const nconf = host('node_modules/nconf');
nconf.argv().env({separator:'__'});
host('src/prestart').loadConfig(process.env.NODEBB_CONFIG || path.join(root, 'config.json'));
nconf.set('jobsDisabled', true);
(async()=>{
 const db=host('src/database');await db.init();const meta=host('src/meta');await meta.configs.init();
 const before={minimumPostLength:meta.config.minimumPostLength,maximumPostLength:meta.config.maximumPostLength};
 if(process.argv.includes('--apply')) {
  await meta.configs.set('minimumPostLength',1);
  // Remove the old product limit; retain a generous infrastructure ceiling.
  await meta.configs.set('maximumPostLength',Math.max(1000000,Number(before.maximumPostLength)||0));
 }
 console.log(JSON.stringify({applied:process.argv.includes('--apply'),before,after:{minimumPostLength:meta.config.minimumPostLength,maximumPostLength:meta.config.maximumPostLength}}));
 await db.close();
})().then(()=>process.exit(0)).catch(error=>{console.error(error.message);process.exit(1)});

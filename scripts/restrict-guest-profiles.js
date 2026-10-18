'use strict';
// Run inside NodeBB: NODEBB_CONFIG=/opt/config/config.json node <script> --apply
const path = require('node:path');
const root = process.env.NODEBB_ROOT || process.cwd();
const host = name => require(path.join(root,name));
const nconf = host('node_modules/nconf');
nconf.argv().env({separator:'__'});
host('src/prestart').loadConfig(process.env.NODEBB_CONFIG || path.join(root,'config.json'));
nconf.set('jobsDisabled',true);nconf.set('runJobs',false);
(async()=>{
 const db=host('src/database');await db.init();await host('src/meta').configs.init();
 const privileges=host('src/privileges');
 const names=['groups:view:users','groups:search:users','groups:view:users:info'];
 if(process.argv.includes('--apply')) await privileges.global.rescind(names,['guests','spiders']);
 const result={};for(const uid of[0,-1])result[uid]=await privileges.global.can(['view:users','search:users','view:users:info'],uid);
 console.log(JSON.stringify({applied:process.argv.includes('--apply'),guestPrivileges:result}));
 if(process.argv.includes('--apply')&&Object.values(result).some(row=>row.some(Boolean)))throw Error('Guest profile restrictions did not take effect');
 await db.close();
})().then(()=>process.exit(0)).catch(err=>{console.error(err.message);process.exit(1)});

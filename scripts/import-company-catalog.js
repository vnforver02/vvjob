'use strict';
// Run inside the pinned NodeBB container. Preview is default; production needs
// both --apply and --allow-production plus an exact database-name assertion.
const path=require('node:path');
const args=new Set(process.argv.slice(2));
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const root=process.env.NODEBB_ROOT||'/usr/src/app';
const host=name=>require(path.join(root,name));
(async()=>{
 const expected=option('--expected-database'),config=option('--config');
 if(!expected||!config)throw Error('Specify --config=<private config path> and --expected-database=<database>.');
 const nconf=host('node_modules/nconf');nconf.argv().env({separator:'__'});host('src/prestart').loadConfig(config);
 if(nconf.get('postgres:database')!==expected)throw Error('Database does not match the explicit expected name.');
 const apply=args.has('--apply');if(apply&&expected==='nodebb'&&!args.has('--allow-production'))throw Error('Production writes require --allow-production.');
 const db=host('src/database');await db.init();
 try{
  const plugin=path.join(root,'node_modules/nodebb-plugin-vvjob');
  const directory=require(path.join(plugin,'lib/companies'))(db);
  const starter=require(path.join(plugin,'data/companies.json')),catalog=require(path.join(plugin,'data/companies-vnr500'));
  if(catalog.length<500)throw Error('Catalog must contain at least 500 source entries.');
  const starterPreview=await directory.importRows(0,starter,true),preview=await directory.syncCatalog(0,catalog,true);
  console.log(JSON.stringify({phase:'preview',starter:starterPreview,catalog:preview}));
  if(apply){const initial=await directory.importRows(0,starter,false),result=await directory.syncCatalog(0,catalog,false);const total=(await directory.list()).total;console.log(JSON.stringify({phase:'applied',starter:initial,catalog:result,total}));}
 }finally{await db.close();}
})().then(()=>process.exit(0)).catch(error=>{console.error(error.message);process.exit(1)});

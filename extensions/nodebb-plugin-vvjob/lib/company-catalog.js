'use strict';
// Manual, operator/admin-triggered imports only. Never run during plugin startup.
const { validate } = require('./companies');
const sourceHost = 'vnr500.vn';
function catalogRow(row) {
 const source = new URL(row.source);
 if (source.protocol !== 'https:' || source.hostname !== sourceHost || source.username || source.password || source.port || !/^\/Thong-tin-doanh-nghiep\/.+-Chart--\d+-202[45]\.html$/.test(source.pathname)) throw Error('Nguồn danh bạ không hợp lệ.');
 const sourceId = source.pathname.match(/-Chart--(\d+)-202[45]\.html$/)[1];
 if (String(row.sourceId) !== sourceId || row.sourceName !== 'Vietnam Report') throw Error('Mã nguồn công ty không khớp.');
 const result = { ...validate(row, true), sourceId, sourceName:'Vietnam Report', sourceYear:source.pathname.match(/-(202[45])\.html$/)[1], catalogSource:'vnr500', taxId: /^\d{10}(?:-?\d{3})?$/.test(row.taxId||'') ? row.taxId : '' };
 if(row.logoUrl){
  const logo=new URL(row.logoUrl);
  if(logo.protocol!=='https:'||logo.hostname!=='cms.vietnamreport.net'||logo.port||logo.username||logo.password||!logo.pathname.replace(/^\/+/, '/').startsWith('/source/')||/default|placeholder/i.test(logo.pathname)||row.logoSource!==row.source||!/^[a-f0-9]{64}$/.test(row.logoSha256||'')||!Number.isInteger(row.logoBytes)||row.logoBytes<150||row.logoBytes>1000000)throw Error('Logo nguồn chưa được kiểm tra.');
  Object.assign(result,{logoUrl:logo.href,logoSource:source.href,logoStatus:'source-linked',logoSha256:row.logoSha256,logoCheckedAt:row.logoCheckedAt||row.checkedAt});
 }
 return result;
}
module.exports=function(db){
 return async function syncCatalog(uid,rows,dryRun=true){
  if(!Array.isArray(rows)||rows.length>1500)throw Error('Danh bạ vượt quá 1500 công ty.');
  const ids=new Set(),taxes=new Set(),sources=new Set();
  const validated=rows.map(row=>{
   if(!/^[a-zA-Z0-9-]{1,64}$/.test(row.id)||ids.has(row.id))throw Error('Mã công ty bị trùng.');ids.add(row.id);
   const data=catalogRow(row);
   if(sources.has(data.sourceId)||(data.taxId&&taxes.has(data.taxId)))throw Error('Công ty nguồn bị trùng.');
   sources.add(data.sourceId);if(data.taxId)taxes.add(data.taxId);
   return {...data,id:row.id};
  });
  // Validate the complete input and inspect existing records before any writes.
  const existing=await db.getObjects(validated.map(row=>`vvjob:company:${row.id}`));
  const report={dryRun,added:0,updated:0,skipped:0,logos:0};
  for(let i=0;i<validated.length;i++){
   const row=validated[i],old=existing[i];
   if(old&&old.status!=='approved'){report.skipped++;continue;}
   let changes;
   if(!old){changes={...row,status:'approved',claimStatus:'unclaimed',reviewedBy:uid,reviewedAt:Date.now(),createdAt:Date.now()};report.added++;}
   else if(old.catalogSource==='vnr500'){
    changes={...row};delete changes.claimStatus;
    if(old.logoStatus==='reviewed'||(old.logoUrl&&!row.logoUrl)){for(const field of ['logoUrl','logoSource','logoStatus','logoSha256','logoCheckedAt'])delete changes[field];}
    report.updated++;
   } else {
    // Stable legacy IDs retain names, official sites, moderation and career bindings.
    changes={};
    if(!old.taxId&&row.taxId){changes.taxId=row.taxId;changes.catalogReference=row.source;}
    if(!old.city&&row.city){changes.city=row.city;changes.cityId=row.cityId;}
    if(!old.industry&&row.industry){changes.industry=row.industry;changes.industryId=row.industryId;}
    if(!old.logoUrl&&row.logoUrl)for(const field of ['logoUrl','logoSource','logoStatus','logoSha256','logoCheckedAt'])changes[field]=row[field];
    if(!Object.keys(changes).length){report.skipped++;continue;}report.updated++;
   }
   if(changes.logoUrl)report.logos++;
   if(!dryRun){await db.setObject(`vvjob:company:${row.id}`,changes);if(!old)await db.sortedSetAdd('vvjob:companies:approved',Date.now(),row.id);}
  }
  return report;
 };
};
module.exports.catalogRow=catalogRow;

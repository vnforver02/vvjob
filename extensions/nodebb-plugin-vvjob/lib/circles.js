'use strict';
// Native topic retrieval has already applied category visibility and blocks.
module.exports = host => async function circleFeed(mode, uid, cid) {
 const data={topics:[],pageCount:1,page:1,circle:mode,isCoworkers:mode==='coworkers',isNetwork:mode==='network',circleNeedsLogin:!Number(uid),circleNeedsCompany:false};
 if(!Number(uid))return data;
 const db=host('database');
 const own=mode==='coworkers'?await db.getObject(`vvjob:career:${uid}`):null;
 if(mode==='coworkers'&&!own?.companyId){data.circleNeedsCompany=true;return data;}
 const following=mode==='network'?new Set((await host('user').getFollowing(uid,0,4999)).map(person=>String(person?.uid ?? person))):null;
 if(following&&!following.size)return data;
 // A bounded recent window, not an assertion that this is a full company archive.
 const recent=await host('topics').getSortedTopics({uid,start:0,stop:499,sort:'recent',term:'alltime',cids:cid?[cid]:undefined});
 const rows=recent.topics||[];
 if(following)data.topics=rows.filter(row=>following.has(String(row.uid))).slice(0,30);
 else {
  const authors=[...new Set(rows.map(row=>String(row.uid)))];
  const careers=await db.getObjects(authors.map(id=>`vvjob:career:${id}`));
  const allowed=new Set(authors.filter((id,index)=>careers[index]&&Number(careers[index].publicCompany)===1&&careers[index].companyId===own.companyId));
  data.topics=rows.filter(row=>allowed.has(String(row.uid))).slice(0,30);
 }
 return data;
};

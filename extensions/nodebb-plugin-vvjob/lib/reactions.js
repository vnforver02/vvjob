'use strict';
const choices = require('../data/reactions.json');
const types = new Set(choices.map(choice=>choice.type));
const validUid = uid => Number.isSafeInteger(Number(uid)) && Number(uid)>0;
module.exports = function(host) {
 const db=host('database'), posts=host('posts'), user=host('user');
 function fail(message, status) { const error=new Error(message);error.status=status;throw error; }
 async function check(pid,uid,write=false) {
  pid=Number(pid);
  if(!Number.isSafeInteger(pid)||pid<=0) fail('[[error:invalid-data]]',400);
  const row=await posts.getPostFields(pid,['pid','tid','uid','deleted']);
  if(!row?.pid || Number(row.deleted) || !validUid(row.tid)) fail('[[error:no-post]]',404);
  const privileges=host('privileges').topics;
  const [topic,access]=await Promise.all([host('topics').getTopicData(row.tid),privileges.get(row.tid,uid)]);
  if(!topic||access.disabled||!access.read||!access['topics:read']||!privileges.canViewDeletedScheduled(topic,access)) fail('[[error:no-post]]',404);
  const visible=await posts.getPostSummaryByPids([pid],uid,{parse:false});
  if(!visible.some(post=>String(post.pid)===String(pid)&&!Number(post.deleted))) fail('[[error:no-post]]',404);
  if(write){
   if(!validUid(uid)) fail('[[error:not-logged-in]]',401);
   const account=await user.getUserFields(uid,['uid','banned']);
   if(!account?.uid||Number(account.banned)||Number(topic.deleted)||Number(topic.scheduled)||!await host('privileges').posts.can('posts:upvote',pid,uid)) fail('[[error:no-privileges]]',403);
  }
  return row;
 }
 async function snapshot(pid,uid) {
  const [saved,legacy]=await Promise.all([db.getObject(`vvjob:reactions:post:${pid}`),db.getSetMembers(`pid:${pid}:upvote`)]);
  const merged=new Map((legacy||[]).filter(validUid).map(id=>[String(id),'like']));
  for(const [id,type] of Object.entries(saved||{})) if(validUid(id)&&(types.has(type)||type==='none')) merged.set(String(id),type);
  const ids=[...merged.keys()].filter(id=>merged.get(id)!=='none');
  const accounts=ids.length?await user.getUsersFields(ids,['uid']):[];
  const alive=new Set(accounts.filter(account=>validUid(account.uid)).map(account=>String(account.uid)));
  const counts=Object.fromEntries(choices.map(choice=>[choice.type,0]));
  for(const [id,type] of merged) if(alive.has(id)&&types.has(type)) counts[type]++;
  const selected=validUid(uid)&&types.has(merged.get(String(uid)))?merged.get(String(uid)):'';
  const total=Object.values(counts).reduce((a,b)=>a+b,0);
  const selectedChoice=choices.find(choice=>choice.type===selected);
  return {pid:Number(pid),selected,useEmoji:!!selected&&selected!=='like',selectedEmoji:selectedChoice?.emoji||'',selectedLabel:selectedChoice?.label||'',total,likes:total,liked:!!selected,counts,choices};
 }
 async function set(pid,uid,type) {
  if(type!=='none'&&!types.has(type)) fail('Biểu cảm không hợp lệ.',400);
  await check(pid,uid,true);
  const rateKey=`vvjob:reactions:rate:${uid}:${Math.floor(Date.now()/60000)}`;
  const count=await db.incrObjectField(rateKey,'count');await db.expire(rateKey,120);
  if(count>60) fail('Bạn thao tác quá nhanh. Vui lòng thử lại sau.',429);
  // Index before the atomic per-user field write. Repeated PUT is idempotent;
  // switching emotion changes one field, never increments an optimistic total.
  await db.sortedSetAdd(`vvjob:reactions:user:${uid}`,Date.now(),Number(pid));
  await db.setObjectField(`vvjob:reactions:post:${pid}`,String(uid),type);
  return snapshot(pid,uid);
 }
 async function endpoint(req,res) {
  res.set('Cache-Control','private, no-store');
  try {
   const data=req.method==='PUT'?await set(Number(req.params.pid),Number(req.uid),req.body?.type):await read(Number(req.params.pid),Number(req.uid));
   return host('controllers/helpers').formatApiResponse(200,res,data);
  } catch(error) { if(!error.status)throw error;return host('controllers/helpers').formatApiResponse(error.status,res,error); }
 }
 async function read(pid,uid) { const row=await check(pid,uid);return {...await snapshot(pid,uid),selfPost:Number(uid)>0&&Number(row.uid)===Number(uid)}; }
 async function removeUser(uid) {
  const pids=await db.getSortedSetRange(`vvjob:reactions:user:${uid}`,0,-1);
  await Promise.all(pids.map(pid=>db.deleteObjectField(`vvjob:reactions:post:${pid}`,String(uid))));
  await db.delete(`vvjob:reactions:user:${uid}`);
 }
 return {read,set,snapshot,endpoint,removeUser};
};

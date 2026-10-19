'use strict';
// Explicit operator tool; only the existing labelled fictional account batch can post.
const path=require('node:path');
const root=process.env.NODEBB_ROOT||'/usr/src/app',host=n=>require(path.join(root,n));
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const plugin=path.join(root,'node_modules/nodebb-plugin-vvjob');
const {BATCH}=require(path.join(plugin,'lib/demo-users'));
const batch='vvjob-demo-conversations-20261019';
const conversations=require(path.join(plugin,'data/demo-conversations.json'));
(async()=>{
 const config=option('--config'),expected=option('--expected-database');if(!config||!expected)throw Error('Explicit config and expected database required');
 const nconf=host('node_modules/nconf');nconf.argv().env({separator:'__'});host('src/prestart').loadConfig(config);
 if(nconf.get('postgres:database')!==expected)throw Error('Wrong database');
 const apply=process.argv.includes('--apply');if(apply&&expected==='nodebb'&&!process.argv.includes('--allow-production'))throw Error('Production requires explicit allow flag');
 nconf.set('jobsDisabled',true);nconf.set('runJobs',false);
 const db=host('src/database');await db.init();await host('src/meta').configs.init();
 try{
  const user=host('src/user'),topics=host('src/topics'),categories=host('src/categories');
  // Suppress notifications/federation in this one-off process only. The running
  // forum's notification configuration and core files are not modified.
  user.notifications.sendTopicNotificationToFollowers=async()=>{};
  topics.notifyTagFollowers=async()=>{};topics.notifyFollowers=async()=>{};categories.notifyCategoryFollowers=async()=>{};
  const map=await db.getObject(`vvjob:demo:batch:${BATCH}`)||{};
  const uids=Array.from({length:72},(_,i)=>Number(map[String(i+1)]));
  for(const uid of uids){const demo=await db.getObject(`vvjob:demo:user:${uid}`);if(!uid||demo?.batch!==BATCH||await user.hasPassword(uid)||await user.getUserField(uid,'email'))throw Error('Only existing credential-free demo accounts may post');}
  const cats=await categories.getCategoriesByPrivilege('categories:cid',uids[0],'topics:create');
  const publicCats=[];for(const c of cats){if(!c.disabled&&!c.link&&await host('src/privileges').categories.can('topics:read',c.cid,0))publicCats.push(c);}
  if(!publicCats.length)throw Error('No readable public category');
  const key=`vvjob:demo:posts:${batch}`,saved=await db.getObject(key)||{};
  console.log(JSON.stringify({phase:'preview',batch,topics:conversations.length,replies:conversations.length*2,existing:Object.keys(saved).length,applied:apply}));
  if(!apply)return;
  let created=0,replies=0;
  for(let i=0;i<conversations.length;i++){
   const uid=uids[i],row=conversations[i],title='[Minh họa] '+row.title;
   let tid=Number(saved[String(i)]);
   // Recover a completed native write whose map update was interrupted.
   if(!tid){const ids=await db.getSortedSetRevRange(`uid:${uid}:topics`,0,99);for(const candidate of ids){if(await topics.getTopicField(candidate,'title')===title){tid=Number(candidate);break;}}}
   if(tid){const existing=await topics.getTopicFields(tid,['uid','title','deleted']);if(Number(existing.uid)!==uid||existing.title!==title||Number(existing.deleted))throw Error('Existing demo post has changed; stop instead of overwriting');}
   else{
    const posted=await topics.post({uid,cid:publicCats[i%publicCats.length].cid,title,content:'**Bài viết minh họa — dữ liệu mô phỏng của VVJOB.**\n\n'+row.content,tags:[],fromQueue:true});
    tid=Number(posted.topicData.tid);created++;
   }
   await db.setObjectField(key,String(i),tid);
   await db.setObject(`vvjob:demo:topic:${tid}`,{batch,uid,simulated:1});
   for(let j=0;j<2;j++){
    const replyUid=uids[24+i*2+j],body='Bình luận minh họa · '+row.replies[j];
    const pids=await db.getSortedSetRange(`tid:${tid}:posts`,0,-1);const posts=await host('src/posts').getPostsFields(pids,['uid','content']);
    if(posts.some(p=>Number(p.uid)===replyUid&&p.content===body))continue;
    await topics.reply({uid:replyUid,tid,content:body,fromQueue:true});replies++;
   }
  }
  console.log(JSON.stringify({phase:'applied',batch,created,replies,total:conversations.length,realVerificationRecordsCreated:0}));
 }finally{await db.close();}
})().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)});

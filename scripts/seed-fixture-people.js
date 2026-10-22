'use strict';
// Explicit bounded operator import. No credentials, evidence or real certification are created.
const path=require('node:path'),root=process.env.NODEBB_ROOT||'/usr/src/app',host=n=>require(path.join(root,n));
const opt=n=>process.argv.find(a=>a.startsWith(n+'='))?.slice(n.length+1);
const batch='vvjob-fixture-200-20261020',plugin=path.join(root,'node_modules/nodebb-plugin-vvjob');
(async()=>{
 const config=opt('--config'),expected=opt('--expected-database');if(!config||!expected)throw Error('Config and expected database required');
 const nconf=host('node_modules/nconf');nconf.argv().env({separator:'__'});host('src/prestart').loadConfig(config);
 if(nconf.get('postgres:database')!==expected)throw Error('Wrong database');const apply=process.argv.includes('--apply');
 if(apply&&expected==='nodebb'&&!process.argv.includes('--allow-production'))throw Error('Explicit production flag required');
 nconf.set('jobsDisabled',true);nconf.set('runJobs',false);const db=host('src/database');await db.init();await host('src/meta').configs.init();
 try{
 const user=host('src/user'),topics=host('src/topics'),categories=host('src/categories'),directory=require(path.join(plugin,'lib/companies'))(db);
 const rows=require(path.join(plugin,'data/fixture-people-200.json')),convos=require(path.join(plugin,'data/demo-conversations.json'));
 if(rows.length!==200||rows.filter(r=>r.verified).length!==100||new Set(rows.map(r=>r.displayname)).size!==200)throw Error('Invalid fixture');
 const key=`vvjob:demo:batch:${batch}`,map=await db.getObject(key)||{};
 for(const r of rows){if(map[r.uid]){const d=await db.getObject(`vvjob:demo:user:${map[r.uid]}`);if(d?.batch!==batch)throw Error('Mapping mismatch')}else if(await user.getUidByUsername(r.displayname))throw Error('Name collision: '+r.displayname);if(!await directory.resolve(r.companyId))throw Error('Missing company')}
 if(!apply){console.log(JSON.stringify({apply:false,users:200,visualBadges:100,topics:convos.length,replies:convos.length*2,existing:Object.keys(map).length}));return;}
 user.notifications.sendTopicNotificationToFollowers=async()=>{};topics.notifyTagFollowers=async()=>{};topics.notifyFollowers=async()=>{};categories.notifyCategoryFollowers=async()=>{};
 let created=0;for(const r of rows){let uid=Number(map[r.uid]);if(!uid){uid=await user.create({username:r.displayname,fullname:r.displayname});await db.setObjectField(key,String(r.uid),uid);map[r.uid]=uid;created++;}
 await db.setObject(`vvjob:demo:user:${uid}`,{batch,index:r.uid,simulatedVerified:r.verified?1:0,gender:r.gender,synthetic:1});
 await user.setUserFields(uid,{fullname:r.displayname,picture:`/assets/uploads/vvjob-preview-200-20261020/${r.picture}`,status:'offline',signature:''});await db.sortedSetRemove('users:online',uid);
 await db.setObject(`user:${uid}:settings`,{showfullname:1,showemail:0,dailyDigestFreq:'off',disableIncomingChats:1});await user.updateDigestSetting(uid,'off');
 await db.setObject(`vvjob:career:${uid}`,{companyId:r.companyId,position:r.position,city:'',publicCompany:1,completed:1,companyBinding:`fixture-${batch}-${r.uid}`});
 if(await user.hasPassword(uid)||await user.getUserField(uid,'email')||await db.getObject(`vvjob:evidence:user:${uid}`)||await db.getObject(`vvjob:verification:user:${uid}`))throw Error('Unexpected credentials or certification');}
 const cats=await categories.getCategoriesByPrivilege('categories:cid',map[1],'topics:create'),publicCats=[];for(const c of cats)if(!c.disabled&&!c.link&&await host('src/privileges').categories.can('topics:read',c.cid,0))publicCats.push(c);if(!publicCats.length)throw Error('No public category');
 const postsKey=`vvjob:demo:posts:${batch}`,saved=await db.getObject(postsKey)||{};let posted=0,replied=0;
 for(let i=0;i<convos.length;i++){const row=convos[i],uid=Number(map[i+1]);let tid=Number(saved[i]);if(!tid){const ids=await db.getSortedSetRevRange(`uid:${uid}:topics`,0,99);for(const candidate of ids)if(await topics.getTopicField(candidate,'title')===row.title){tid=Number(candidate);break;}}
 if(!tid){const result=await topics.post({uid,cid:publicCats[i%publicCats.length].cid,title:row.title,content:row.content,tags:[],fromQueue:true});tid=Number(result.topicData.tid);posted++;}
 await db.setObjectField(postsKey,String(i),tid);await db.setObject(`vvjob:demo:topic:${tid}`,{batch,uid,simulated:1});
 for(let j=0;j<2;j++){const replyUid=Number(map[25+i*2+j]);const ids=await db.getSortedSetRange(`tid:${tid}:posts`,0,-1),existing=await host('src/posts').getPostsFields(ids,['uid','content']);if(existing.some(p=>Number(p.uid)===replyUid&&p.content===row.replies[j]))continue;await topics.reply({uid:replyUid,tid,content:row.replies[j],fromQueue:true});replied++;}}
 if(Object.keys(map).length!==200)throw Error('Count mismatch');console.log(JSON.stringify({apply:true,batch,created,total:200,visualBadges:100,topicsCreated:posted,repliesCreated:replied,realVerificationRecordsCreated:0}));
 }finally{await db.close();}
})().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)});

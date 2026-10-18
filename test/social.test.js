'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const create = require('../extensions/nodebb-plugin-vvjob/lib/social');
function fixture() {
 const access = {read:true, 'topics:read':true}, topic={tid:7, mainPid:10};
 const post={pid:10,tid:7,uid:2,upvotes:3,upvoted:true,content:'<p>Original <strong>text</strong></p>',ip:'SECRET',user:{email:'SECRET'}};
 const calls=[];
 const deps={
  'controllers/helpers':{formatApiResponse:(code,res,data)=>Object.assign(res,{code,data})},
  topics:{getTopicData:async()=>topic,getTopicPosts:async(...args)=>{calls.push(args);return [post]}},
  privileges:{topics:{get:async()=>access,canViewDeletedScheduled:()=>!topic.deleted&&!topic.scheduled}},
  posts:{getPostFields:async()=>post,getPostSummaryByPids:async()=>post.blocked?[]:[post],hasVoted:async()=>({upvoted:true}),getVoteStatusByPostIDs:async()=>({upvotes:[true]})},
  utils:{stripHTMLTags:text=>text.replace(/<[^>]*>/g,'')},
  user:{getUserFields:async()=>({picture:'/avatar.png',username:'Lan',userslug:'lan',email:'SECRET'})},
 };
 const res={set(key,val){this[key]=val}};
 return{service:create(n=>deps[n]),access,topic,post,res,calls};
}
test('inline original content enforces topic privacy/deletion/scheduling and uses native parsing/block filtering',async()=>{
 for(const kind of ['read','topics:read','disabled','deleted','scheduled']){
  const f=fixture(); if(['deleted','scheduled'].includes(kind))f.topic[kind]=1;else f.access[kind]=kind==='disabled';
  await f.service.content({uid:9,params:{tid:7}},f.res);assert.equal(f.res.code,404);assert.equal(f.calls.length,0);
 }
 const f=fixture();await f.service.content({uid:9,params:{tid:7}},f.res);assert.equal(f.res.code,200);assert.equal(f.res.data.content,f.post.content);assert.equal(f.res['Cache-Control'],'private, no-store');assert.doesNotMatch(JSON.stringify(f.res.data),/SECRET|email|ip/);assert.deepEqual(f.calls[0].slice(1),['tid:7:posts',0,0,9,false]);
 f.post.deleted=1;await f.service.content({uid:9,params:{tid:7}},f.res);assert.equal(f.res.code,404);
});
test('reaction state omits voter identities and refuses hidden/deleted/blocked posts',async()=>{
 const f=fixture();await f.service.votes({uid:2,params:{pid:10}},f.res);assert.deepEqual(f.res.data,{pid:10,likes:3,liked:true,selfPost:true});
 for(const key of ['blocked','deleted']){f.post[key]=true;await f.service.votes({uid:9,params:{pid:10}},f.res);assert.equal(f.res.code,404);delete f.post[key];}
 for(const pid of ['0','-2','1.5','bad']){await f.service.votes({uid:9,params:{pid}},f.res);assert.equal(f.res.code,400);}
});
test('feed previews use original posts and expose only safe text, real likes and viewer avatar',async()=>{
 const f=fixture(),data={topics:[{mainPid:10,postcount:4,teaser:{content:'OTHER REPLY'}}]};await f.service.enrich(data,2);
 assert.equal(data.topics[0].socialPost.pid,10);assert.equal(data.topics[0].replyCount,3);assert.equal(data.topics[0].socialPost.preview,'Original text');assert.equal(data.topics[0].socialPost.likes,3);assert.equal(data.viewer.picture,'/avatar.png');assert.doesNotMatch(JSON.stringify(data.viewer),/SECRET|email/);
});

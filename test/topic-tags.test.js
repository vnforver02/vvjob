'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const benchpress=require('benchpressjs');
const sources=require('../scripts/template-source');

test('feed topic links preserve native encoded tag paths and escape displayed labels',async()=>{
 const tag='văn phòng',valueEncoded=encodeURIComponent(tag);
 const source=await sources.expand(await fs.readFile('extensions/nodebb-plugin-vvjob/templates/partials/vvjob-feed-card.tpl','utf8'));
 const html=await benchpress.compileRender('{{{ each topics }}}'+source+'{{{ end }}}',{config:{relative_path:'/forum'},topics:[{tid:1,domId:'1',slug:'1/test',title:'Một câu chuyện',user:{displayname:'An',userslug:'an'},category:{cid:5,name:'Công việc'},tags:[{value:tag,valueEncoded},{value:'<img src=x onerror=alert(1)>',valueEncoded:'safe-encoded'}]}]});
 assert.match(html,new RegExp('/forum/tags/'+valueEncoded));
 assert.match(html,/#văn phòng/);
 assert.doesNotMatch(html,/<img src=x onerror=/);
});

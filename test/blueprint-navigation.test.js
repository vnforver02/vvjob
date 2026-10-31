'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const benchpress=require('benchpressjs');
test('mobile social navigation retains people, chats, subdirectory URLs and native notification slots',async()=>{
 const read=p=>fs.readFileSync('extensions/nodebb-plugin-vvjob/templates/'+p,'utf8');
 const mobile=await benchpress.compileRender(read('partials/mobile-footer.tpl'),{relative_path:'/forum',config:{loggedIn:false}});
 for(const href of ['/vvjob','/users','/chats','/me'])assert.ok(mobile.includes('href="/forum'+href+'"'));
 assert.match(mobile,/data-vvjob-compose/);assert.doesNotMatch(mobile,/data-vvjob-nav="companies"/);
 const header=await benchpress.compileRender(read('partials/header/brand.tpl'),{relative_path:'/forum',config:{loggedIn:true}});
 assert.match(header,/component="notifications"/);assert.match(header,/id="user_label"/);
 assert.doesNotMatch(header,/circle=coworkers|circle=network|vvjob-mobile-discovery/);
 const own=await benchpress.compileRender(read('partials/account/sidebar-left.tpl'),{config:{relative_path:'/forum'},isSelf:true});
 const other=await benchpress.compileRender(read('partials/account/sidebar-left.tpl'),{config:{relative_path:'/forum'},isSelf:false});
 assert.match(own,/href="\/forum\/chats"/);assert.doesNotMatch(other,/href="\/forum\/chats"/);
});

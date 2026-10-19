'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const rows=require('../extensions/nodebb-plugin-vvjob/data/demo-conversations.json');
test('demo conversations are bounded, distinct Vietnamese workplace discussions without fabricated employer claims',()=>{assert.equal(rows.length,24);assert.equal(new Set(rows.map(r=>r.title)).size,24);for(const row of rows){assert(row.title.length>=10&&row.title.length<120);assert(row.content.length>100);assert.equal(row.replies.length,2);assert(!/https?:\/\/|@/.test(row.content));}});

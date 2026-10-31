'use strict';
const{test}=require('node:test'),assert=require('node:assert/strict'),title=require('../extensions/nodebb-plugin-vvjob/public/post-title');
test('body-first titles use readable text rather than Markdown syntax, URLs or images',()=>{assert.equal(title('**Một điều nhỏ**\nNội dung tiếp theo'),'Một điều nhỏ');assert.equal(title('[Cách phối hợp](https://example.com) hiệu quả'),'Cách phối hợp hiệu quả');assert.equal(title('![Ảnh](https://example.com/a.jpg)'),'Chia sẻ cùng cộng đồng');});
test('generated titles respect native minimum and UTF-16 maximum without breaking emoji',()=>{assert(title('OK',10,30).length>=10);const value=title('abcdefghij😀hello',3,11);assert.equal(value,'abcdefghij');assert(title('',40,60).length>=40);});

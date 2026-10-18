'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const benchpress = require('benchpressjs');
const template = fs.readFileSync('extensions/nodebb-plugin-vvjob/templates/vvjob.tpl', 'utf8');
test('empty feed shows truthful Vietnamese state and privacy notice', async () => {
  const html = await benchpress.compileRender(template, { config: { relative_path: '/forum' }, topics: [], trending: [], communities: [] });
  assert.match(html, /Câu chuyện đầu tiên bắt đầu từ bạn/);
  assert.match(html, /Chưa mở\. Bài viết hiện tại gắn với tài khoản của bạn/);
  assert.match(html, /href="\/forum\/search"/);
  assert.doesNotMatch(html, /class="vv2-post"/);
});
test('feed renders real topic, community, subdirectory links and selected sorting', async () => {
  const topic = { title: 'Công việc đầu tiên', slug: '42/cong-viec', postcount: 3, viewcount: 12, user: { userslug: 'minh', displayname: 'Minh' }, category: { name: 'Công việc' }, teaser: { content: '<p>Chia sẻ kinh nghiệm</p>' } };
  const html = await benchpress.compileRender(template, { config: { relative_path: '/forum' }, topics: [topic], trending: [topic], communities: [{ name: 'Công việc', slug: '7/cong-viec' }], isPopular: true });
  assert.match(html, /href="\/forum\/topic\/42\/cong-viec"/);
  assert.match(html, /href="\/forum\/category\/7\/cong-viec"/);
  assert.match(html, /aria-current="page">Được quan tâm/);
  assert.match(html, /Chia sẻ kinh nghiệm/);
  assert.doesNotMatch(html, /Câu chuyện đầu tiên bắt đầu từ bạn/);
});

test('member navigation uses native profile route instead of registration promotion', async () => {
  const html = await benchpress.compileRender(template, { config: { relative_path: '/forum' }, topics: [], trending: [], communities: [], viewerLoggedIn: true });
  assert.match(html, /href="\/forum\/me">Hồ sơ của tôi/);
  assert.doesNotMatch(html, /href="\/forum\/register"/);
  assert.match(html, /name="term"/);
});

'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const benchpress = require('benchpressjs');
const sources = require('../scripts/template-source');
const template = fs.readFileSync('extensions/nodebb-plugin-vvjob/templates/vvjob.tpl', 'utf8');
test('empty feed shows truthful Vietnamese state and privacy notice', async () => {
  const html = await benchpress.compileRender(await sources.expand(template), { config: { relative_path: '/forum' }, topics: [], trending: [], communities: [] });
  assert.match(html, /Câu chuyện đầu tiên bắt đầu từ bạn/);
  assert.match(html, /Chưa mở\. Bài viết hiện tại gắn với tài khoản của bạn/);

  assert.doesNotMatch(html, /class="vv2-post"/);
});
test('feed renders real topic, community, subdirectory links and selected sorting', async () => {
  const topic = { tid: 42, domId: '42', title: 'Công việc đầu tiên', slug: '42/cong-viec', postcount: 3, viewcount: 12, user: { userslug: 'minh', displayname: 'Minh' }, category: { name: 'Công việc' }, socialPost: {pid: 99, preview: 'Chia sẻ kinh nghiệm', likes: 2, liked: true} };
  const html = await benchpress.compileRender(await sources.expand(template), { config: { relative_path: '/forum' }, topics: [topic], trending: [topic], communities: [{ cid: 7, name: 'Công việc', slug: '7/cong-viec', active: true }], hasCommunity: true, selectedCommunityId: 7, feedTitle: 'Công việc', feedQuery: '?cid=7', popularQuery: '?cid=7&sort=popular', isPopular: false });
  assert.match(html, /href="\/forum\/topic\/42\/cong-viec"/);
  assert.match(html, /href="\/forum\/vvjob\?cid=7"/);
  assert.match(html, /aria-current="page">Mới nhất/);
  assert.match(html, /Chia sẻ kinh nghiệm/);
  assert.match(html, /data-cid="7"/);
  assert.match(html, /href="\/forum\/vvjob\?cid&#x3D;7&amp;sort&#x3D;popular"/);
  assert.doesNotMatch(html, /vvjob-concept-hero/);
  assert.doesNotMatch(html, /Câu chuyện đầu tiên bắt đầu từ bạn/);
});

test('shared header preserves native member menus and guest registration', async () => {
  const source = fs.readFileSync('extensions/nodebb-plugin-vvjob/templates/partials/header/brand.tpl', 'utf8');
  const guest = await benchpress.compileRender(source, { relative_path: '/forum', config: { loggedIn: false } });
  assert.match(guest, /action="\/forum\/search"/);
  assert.match(guest, /name="term"/);
  assert.match(guest, /href="\/forum\/register"/);
  const member = await benchpress.compileRender(source, { relative_path: '/forum', config: { loggedIn: true } });
  assert.match(member, /id="logged-in-menu"/);
  assert.match(member, /component="notifications"/);
  assert.match(member, /component="sidebar\/drafts"/);
  assert.doesNotMatch(member, /href="\/forum\/register"/);
});

test('ranked feed renders native ranking and native thread comment links without the home composer', async () => {
  const html = await benchpress.compileRender(await sources.expand(template), { config: { relative_path: '/forum' }, isPopular: true, hotAllUrl: '/vvjob?sort=popular&term=week', hotPeriods: [{ label: '7 ngày', active: true, url: '/vvjob?sort=popular&term=week' }], topics: [{ tid: 42, domId: '42', rank: 21, slug: '42/test', title: 'Câu chuyện', replyCount: 8, viewcount: 100, category: { name: 'Công việc' } }], communities: [] });
  assert.match(html, /aria-label="Hạng 21"/);
  assert.doesNotMatch(html, /vvhot-periods|aria-current="page">7 ngày/);
  assert.doesNotMatch(html, /vvhot-stats|vvhot-excerpt|vvhot-category/);
  assert.match(html, /data-vvjob-expand/);
  assert.match(html, /data-vvjob-open-thread href="\/forum\/topic\/42\/test#vvjob-replies"/);
  assert.doesNotMatch(html, /vvcomment-input/);
  assert.doesNotMatch(html, /vvjob-social-compose/);
});

test('ranked titles and ongoing image cards have distinct controls and real gallery metadata', async () => {
 const topic={tid:42,domId:'rank-42',rank:1,slug:'42/test',title:'Thảo luận',user:{displayname:'Lan',userslug:'lan'},socialPost:{pid:90,preview:'Bài viết',imageCount:2,images:[{src:'/assets/uploads/one.jpg',index:0},{src:'/assets/uploads/two.jpg',index:1}]},authorMeta:{isDemo:true,simulatedVerified:true,verified:false}};
 const html=await benchpress.compileRender(await sources.expand(template),{config:{relative_path:'/forum'},isPopular:true,topics:[topic],ongoing:[{...topic,domId:'talk-42',highlight:{pid:99,preview:'Góc nhìn thật'}}],communities:[]});
 assert.equal((html.match(/data-vvjob-open-thread/g)||[]).length,2);assert.doesNotMatch(html,/vvcomment-input/);
 assert.match(html,/src="\/assets\/uploads\/one.jpg"/);assert.match(html,/vvjob-media-2/);assert.match(html,/vvjob-author-simulated/);assert.doesNotMatch(html,/vvjob-author-verified/);assert.match(html,/Bình luận nổi bật/);assert.match(html,/fa-heart-o/);
});

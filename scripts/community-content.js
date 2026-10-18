'use strict';
// Run inside a configured NodeBB host. Read-only unless --apply is explicit.
const path = require('node:path');
const fs = require('node:fs/promises');
const root = process.env.NODEBB_ROOT || process.cwd();
const host = name => require(path.join(root, name));
const nconf = host('node_modules/nconf');
nconf.argv().env({ separator: '__' });
host('src/prestart').loadConfig(process.env.NODEBB_CONFIG || path.join(root, 'config.json'));
nconf.set('jobsDisabled', true);
nconf.set('runJobs', false);
const db = host('src/database');
const meta = host('src/meta');
(async () => {
  await db.init();
  await meta.configs.init();
  const categories = host('src/categories');
  const topics = host('src/topics');
  const posts = host('src/posts');
  const manifest = host('node_modules/nodebb-plugin-vvjob/content/communities.json');
  const current = await Promise.all(manifest.map(c => categories.getCategoryData(c.cid)));
  for (let i = 0; i < manifest.length; i += 1) {
    if (!current[i] || String(current[i].name).replace(/&amp;/g, '&') !== manifest[i].name) {
      throw new Error(`Unexpected community ${manifest[i].cid}; refusing to change it`);
    }
  }
  const topic = await topics.getTopicData(1);
  const post = await posts.getPostData(1);
  const untouchedSeed = topic && post && Number(topic.mainPid) === 1 && Number(post.uid) === 1 &&
    topic.title === 'Welcome to your NodeBB!' &&
    String(post.content).includes('This is what a topic and post looks like.') &&
    !(topic.tags && topic.tags.length) && !post.edited;
  console.log(JSON.stringify({ communities: manifest.map(c => ({ cid: c.cid, name: c.name })), replaceUntouchedWelcome: Boolean(untouchedSeed), apply: process.argv.includes('--apply') }));
  if (!process.argv.includes('--apply')) { await db.close(); return; }
  const backupIndex = process.argv.indexOf('--backup');
  const backup = backupIndex >= 0 && process.argv[backupIndex + 1];
  if (!backup || !path.isAbsolute(backup)) { throw new Error('--apply requires --backup /absolute/private/file.json'); }
  await fs.writeFile(backup, JSON.stringify({ date: new Date().toISOString(), categories: current, topic, post }, null, 2), { flag: 'wx', mode: 0o600 });
  for (const community of manifest) {
    const { cid, ...fields } = community;
    await categories.setCategoryFields(cid, { ...fields, descriptionParsed: fields.description });
  }
  if (untouchedSeed) {
    const prefix = nconf.get('relative_path') || '';
    await posts.edit({ uid: 1, pid: 1, title: 'Chào mừng bạn đến với VVJOB', content:
      '## Đi làm có nhau.\n\nVVJOB là nơi người đi làm Việt Nam chia sẻ trải nghiệm, đặt câu hỏi và học hỏi từ nhau.\n\n' +
      '### Bắt đầu ở đâu?\n\n' + manifest.map(c => `- [${c.name}](${prefix}/category/${c.cid}): ${c.description}`).join('\n') +
      `\n\n### Chia sẻ để cùng tiến xa\n\nĐặt tiêu đề rõ ràng, nêu bối cảnh và tôn trọng người có góc nhìn khác. Không đăng thông tin cá nhân của người khác hoặc tài liệu có tính bảo mật.\n\n` +
      `**Hiện chưa có chế độ đăng ẩn danh.** Bài viết và phản hồi gắn với tài khoản của bạn.\n\n` +
      `Đọc [hướng dẫn cộng đồng](${prefix}/vvjob/guide) trước khi đăng. Nếu gặp nội dung không phù hợp, mở menu ⋮ của bài viết và chọn báo cáo.`,
    });
    console.log('Updated untouched NodeBB welcome post using native edit');
  }
  await db.close();
})().then(() => process.exit(0)).catch(err => { console.error(err.stack); process.exit(1); });

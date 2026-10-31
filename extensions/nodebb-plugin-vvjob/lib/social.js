"use strict";

// Only native permission-filtered, parsed content and public vote state leave this module.
module.exports = function (host, author = async () => ({}), reactions = null, avatars = null) {
  const escape = text => String(text || '').replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/gi, '&amp;').replace(/[<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reaction = post => ({ pid: post.pid, likes: Math.max(0, Number(post.upvotes) || 0), liked: !!post.upvoted, selfPost: !!post.selfPost });
  async function allowed(tid, uid) {
    const topics = host('topics'), privileges = host('privileges').topics;
    const [topic, access] = await Promise.all([topics.getTopicData(tid), privileges.get(tid, uid)]);
    return topic && !access.disabled && access.read && access['topics:read'] && privileges.canViewDeletedScheduled(topic, access) ? topic : null;
  }
  function respond(res, code, data) { return host('controllers/helpers').formatApiResponse(code, res, data); }
  async function content(req, res) {
    res.set('Cache-Control', 'private, no-store');
    const tid = Number(req.params.tid);
    if (!Number.isSafeInteger(tid) || tid <= 0) return respond(res, 400, new Error('[[error:invalid-data]]'));
    const topic = await allowed(tid, req.uid);
    if (!topic) return respond(res, 404, new Error('[[error:no-topic]]'));
    const rows = await host('topics').getTopicPosts(topic, `tid:${tid}:posts`, 0, 0, req.uid, false);
    const post = rows.find(p => p && !Number(p.deleted) && String(p.pid) === String(topic.mainPid));
    if (!post) return respond(res, 404, new Error('[[error:no-post]]'));
    return respond(res, 200, { ...reaction(post), ...(reactions ? {reactions: await reactions.snapshot(post.pid, req.uid)} : {}), content: post.content });
  }
  async function votes(req, res) {
    res.set('Cache-Control', 'private, no-store');
    const pid = Number(req.params.pid);
    if (!Number.isSafeInteger(pid) || pid <= 0) return respond(res, 400, new Error('[[error:invalid-data]]'));
    const posts = host('posts'), row = await posts.getPostFields(pid, ['pid', 'tid', 'deleted']);
    if (!row || !Number(row.pid) || !Number.isSafeInteger(Number(row.tid)) || Number(row.tid) <= 0 || Number(row.deleted) || !await allowed(row.tid, req.uid)) return respond(res, 404, new Error('[[error:no-post]]'));
    // Summary applies the viewer's native block filter; never expose voter identities.
    const [post] = await posts.getPostSummaryByPids([pid], req.uid, { parse: false });
    if (!post || Number(post.deleted)) return respond(res, 404, new Error('[[error:no-post]]'));
    const state = await posts.hasVoted(pid, req.uid);
    return respond(res, 200, reaction({ ...post, ...state, selfPost: Number(req.uid) > 0 && Number(req.uid) === Number(post.uid) }));
  }
  function images(content) {
    const found = [], pattern = /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi;
    for (const match of String(content || '').matchAll(pattern)) {
      if (/class=["'][^"']*\bemoji\b|\/emoji\//i.test(match[0])) continue;
      const src = match[2].replace(/&amp;/gi, '&');
      // Parsed post images only; never accept executable/data URLs or credentials.
      const relative = src.startsWith('/') && !src.startsWith('//');
      if (!relative && !/^https?:\/\//i.test(src)) continue;
      try { const url = new URL(src, 'https://vvjob.invalid'); if (url.username || url.password) continue; } catch { continue; }
      if (!found.includes(src)) found.push(src);
    }
    return found;
  }
  function plain(content, limit) {
    return escape(host('utils').stripHTMLTags(String(content || '').replace(/<\/(?:p|div)>|<br\s*\/?>/gi, '\n')).trim().slice(0, limit));
  }
  async function enrich(data, uid) {
    const topics = [...(data.topics || []), ...(data.ongoing || [])];
    const pids = [...new Set(topics.map(t => t.mainPid).filter(Boolean))], posts = host('posts');
    const [summaries, states, bookmarks] = await Promise.all([
      posts.getPostSummaryByPids(pids, uid, { stripTags: false }), posts.getVoteStatusByPostIDs(pids, uid),
      posts.hasBookmarked ? posts.hasBookmarked(pids, uid) : pids.map(() => false),
    ]);
    const avatarMap = avatars ? await avatars.batch([...summaries.map(post=>post.uid),uid]) : new Map();
    const rows = new Map(summaries.filter(p => !Number(p.deleted)).map(p => [String(p.pid), p]));
    const authors = new Map();
    await Promise.all(topics.map(async topic => {
      const post = rows.get(String(topic.mainPid)), index = pids.indexOf(topic.mainPid);
      topic.domId = topic.domId || String(topic.tid);
      const timestamp = Number(topic.timestamp || post?.timestamp);
      topic.timestampISO = Number.isFinite(timestamp) && timestamp > 0 && timestamp <= 8640000000000000 ? new Date(timestamp).toISOString() : '';
      topic.replyCount = Math.max(0, Number(topic.postcount || 0) - 1);
      const media = post ? images(post.content) : [];
      topic.socialPost = post ? { pid: post.pid, bookmarked: !!bookmarks[index], preview: plain(post.content, 420), likes: Math.max(0, Number(post.upvotes) || 0), liked: !!states.upvotes[index], selfPost: Number(uid) > 0 && Number(uid) === Number(post.uid),
        images: media.slice(0, 9).map((src, i) => ({ src, index: i, overflow: i === 8 && media.length > 9 ? media.length - 9 : 0 })), imageCount: Math.min(media.length, 9),
      } : null;
      if (post) { if (!authors.has(post.uid)) authors.set(post.uid, author(post.uid, uid)); topic.authorMeta = await authors.get(post.uid); topic.avatar = avatarMap.get(Number(post.uid)) || avatars?.project(post.user); if (reactions) { topic.socialPost.reactions = await reactions.snapshot(post.pid, uid); topic.socialPost.likes=topic.socialPost.reactions.total; topic.socialPost.liked=!!topic.socialPost.reactions.selected; } }
    }));
    data.viewer = Number(uid) > 0 ? await host('user').getUserFields(uid, ['picture', 'username', 'userslug']) : null;
    if (data.viewer) data.viewer = {uid:Number(uid), avatar:avatarMap.get(Number(uid)), picture: data.viewer.picture || '', username: data.viewer.username || '', userslug: data.viewer.userslug || '' };
  }
  async function highlights(topics, uid) {
    // A real, positive-vote reply, using the native sorted set and viewer filtering.
    await Promise.all(topics.map(async topic => {
      const current = await allowed(topic.tid, uid);
      if (!current) return;
      const rows = await host('topics').getTopicPosts(current, `tid:${topic.tid}:posts:votes`, 1, 3, uid, true);
      const best = rows.find(post => post && !Number(post.deleted) && String(post.pid) !== String(current.mainPid) && Number(post.upvotes) > 0);
      if (best) topic.highlight = { pid: best.pid, preview: plain(best.content, 140), likes: Math.max(0, Number(best.upvotes) || 0) };
    }));
  }
  return { content, votes, enrich, highlights, images };
};

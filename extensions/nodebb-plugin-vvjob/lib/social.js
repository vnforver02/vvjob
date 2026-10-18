"use strict";

// Only native permission-filtered, parsed content and public vote state leave this module.
module.exports = function (host) {
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
    return respond(res, 200, { ...reaction(post), content: post.content });
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
  async function enrich(data, uid) {
    const topics = data.topics || [], pids = topics.map(t => t.mainPid).filter(Boolean);
    const posts = host('posts');
    const [summaries, states] = await Promise.all([
      posts.getPostSummaryByPids(pids, uid, { stripTags: true }), posts.getVoteStatusByPostIDs(pids, uid),
    ]);
    const rows = new Map(summaries.filter(p => !Number(p.deleted)).map(p => [String(p.pid), p]));
    topics.forEach(topic => {
      const post = rows.get(String(topic.mainPid)), index = pids.indexOf(topic.mainPid);
      topic.replyCount = Math.max(0, Number(topic.postcount || 0) - 1);
      topic.socialPost = post ? { pid: post.pid, preview: escape(host('utils').stripHTMLTags(String(post.content || '').replace(/<\/(?:p|div)>|<br\s*\/?>/gi, '\n')).trim().slice(0, 420)), likes: Math.max(0, Number(post.upvotes) || 0), liked: !!states.upvotes[index], selfPost: Number(uid) > 0 && Number(uid) === Number(post.uid) } : null;
      // Never substitute another person's last reply as the original post preview.
    });
    data.viewer = Number(uid) > 0 ? await host('user').getUserFields(uid, ['picture', 'username', 'userslug']) : null;
    if (data.viewer) data.viewer = { picture: data.viewer.picture || '', username: data.viewer.username || '', userslug: data.viewer.userslug || '' };
  }
  return { content, votes, enrich };
};

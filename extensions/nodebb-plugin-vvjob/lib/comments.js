'use strict';

const PAGE_SIZE = 5;

module.exports = function (host) {
  async function list(req, res) {
    res.set('Cache-Control', 'private, no-store');
    const tid = Number(req.params.tid);
    const after = req.query.after === undefined ? 1 : Number(req.query.after);
    const respond = (code, data) => host('controllers/helpers').formatApiResponse(code, res, data);
    if (!Number.isSafeInteger(tid) || tid <= 0 || !Number.isSafeInteger(after) || after < 1) {
      return respond(400, new Error('[[error:invalid-data]]'));
    }
    const topics = host('topics');
    const privileges = host('privileges').topics;
    const [topic, access] = await Promise.all([topics.getTopicData(tid), privileges.get(tid, req.uid)]);
    if (!topic || access.disabled || !access.read || !access['topics:read'] || !privileges.canViewDeletedScheduled(topic, access)) {
      return respond(404, new Error('[[error:no-topic]]'));
    }
    // Native parsing and block filtering. Page offsets include the main post at 0.
    const set = `tid:${tid}:posts`;
    const [rows, slots] = await Promise.all([
      topics.getTopicPosts(topic, set, after, after + PAGE_SIZE - 1, req.uid, false),
      host('database').sortedSetCard(set),
    ]);
    const comments = rows.filter(post => post && !Number(post.deleted) && String(post.pid) !== String(topic.mainPid)).map(post => ({
      pid: post.pid,
      content: post.content,
      timestamp: post.timestamp,
      user: {
        displayname: post.user?.displayname || post.user?.username || 'Thành viên',
        userslug: post.user?.userslug || '',
        picture: post.user?.picture || '',
      },
      // A label is enough; never return parent content or the full native user.
      replyTo: post.parent?.user?.username || '',
    }));
    return respond(200, {
      comments, next: after + PAGE_SIZE, hasMore: after + PAGE_SIZE <= Number(slots),
      canReply: Number(req.uid) > 0 && !!access['topics:reply'],
      loggedIn: Number(req.uid) > 0, locked: !!Number(topic.locked),
    });
  }
  return { list };
};

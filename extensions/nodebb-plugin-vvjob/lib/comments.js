'use strict';

const PAGE_SIZE = 5;

module.exports = function (host, author = async () => ({}), reactions = null, avatars = null) {
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
    const avatarMap = avatars ? await avatars.batch(rows.map(post=>post?.uid)) : new Map();
    const reactionMap = reactions ? new Map(await Promise.all(rows.filter(post=>post&&!Number(post.deleted)).map(async post=>[post.pid,await reactions.snapshot(post.pid,req.uid)]))) : new Map();
    const comments = await Promise.all(rows.filter(post => post && !Number(post.deleted) && String(post.pid) !== String(topic.mainPid)).map(async post => ({
      pid: post.pid, toPid: Number(post.toPid) || 0,
      likes: reactionMap.get(post.pid)?.total ?? Math.max(0, Number(post.upvotes) || 0), liked: reactionMap.has(post.pid) ? !!reactionMap.get(post.pid).selected : !!post.upvoted, selfPost: !!post.selfPost,
      authorMeta: await author(post.uid, req.uid),
      avatar: avatarMap.get(Number(post.uid)) || avatars?.project(post.user),
      reactions: reactionMap.get(post.pid),
      isTopicAuthor: Number(topic.uid) > 0 && Number(post.uid) === Number(topic.uid),
      content: post.content,
      timestamp: post.timestamp,
      user: {
        displayname: post.user?.displayname || post.user?.username || 'Thành viên',
        userslug: post.user?.userslug || '',
        picture: post.user?.picture || '',
      },
      // A label is enough; never return parent content or the full native user.
      replyTo: post.parent?.user?.username || '',
    })));
    return respond(200, {
      comments, next: after + PAGE_SIZE, hasMore: after + PAGE_SIZE <= Number(slots),
      canReply: Number(req.uid) > 0 && !!access['topics:reply'],
      loggedIn: Number(req.uid) > 0, locked: !!Number(topic.locked),
    });
  }
  return { list };
};

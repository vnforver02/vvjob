'use strict';
/* global app, config, require */
(function () {
  const states = new WeakMap();
  function context(element) {
    const card = element.closest('[data-feed-tid]');
    if (!states.has(card)) states.set(card, { next: 1, loaded: false, loading: false, sending: false, canReply: false });
    return { card, panel: card.querySelector('.vvcomments'), state: states.get(card), tid: Number(card.dataset.feedTid) };
  }
  function status(panel, text, error) {
    $(panel).find('.vvcomments-status').text(text).toggleClass('is-error', !!error);
  }
  function cancelReply(panel, state) {
    delete state.toPid;
    panel.querySelector('.vvcomments-replying').hidden = true;
    const form = panel.querySelector('.vvcomments-form');
    panel.querySelector('[data-comment-composer]').append(form);
    form.classList.remove('is-nested');
  }
  function resize(input) {
    input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 180) + 'px';
  }
  async function append(panel, comments, canReply) {
    const templates = await app.require('benchpressjs');
    const fresh = comments.filter(comment => !Array.from(panel.querySelectorAll('[data-comment-pid]')).some(el => el.dataset.commentPid === String(comment.pid)));
    const html = await templates.render('partials/vvjob-comments', { comments: fresh, canReply, config: { relative_path: config.relative_path } });
    $(panel).find('.vvcomments-list').append(html);
    panel.querySelectorAll('[data-comment-time]').forEach(el => {
      const date = new Date(Number(el.dataset.commentTime));
      if (!Number.isNaN(date.getTime())) {
        el.dateTime = date.toISOString();
        el.textContent = date.toLocaleString('vi-VN', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
        el.title = date.toLocaleString('vi-VN');
      }
    });
    arrangeReplies(panel);
    panel.querySelector('.vvcomments-empty').hidden = !!panel.querySelector('[data-comment-pid]');
  }
  function arrangeReplies(panel) {
    panel.querySelectorAll('[data-comment-parent]').forEach(comment => {
      const pid = Number(comment.dataset.commentParent);
      if (!pid) return;
      let parent = panel.querySelector(`[data-comment-pid="${pid}"]`);
      if (!parent || parent === comment || comment.contains(parent)) return;
      while (parent.parentElement.closest('[data-comment-pid]')) parent = parent.parentElement.closest('[data-comment-pid]');
      const main = parent.querySelector('.vvcomment-main');
      let list = main.querySelector(':scope > .vvcomment-children');
      if (!list) { list = document.createElement('ol'); list.className = 'vvcomment-children'; list.setAttribute('aria-label', 'Các câu trả lời'); main.append(list); }
      if (comment.parentElement !== list) list.append(comment);
    });
  }
  async function load(ctx) {
    const { panel, state, tid } = ctx;
    if (state.loading) return;
    state.loading = true;
    const more = panel.querySelector('[data-comments-more]');
    more.disabled = true; panel.setAttribute('aria-busy', 'true');
    status(panel, 'Đang tải bình luận…');
    try {
      const api = await app.require('api');
      const data = await api.get(`/api/vvjob/topics/${tid}/comments`, { after: state.next });
      if (!data || !Array.isArray(data.comments)) throw new Error('Invalid response');
      await append(panel, data.comments, data.canReply);
      state.next = data.next; state.loaded = true; state.canReply = data.canReply;
      more.hidden = !data.hasMore; more.textContent = 'Xem thêm bình luận';
      panel.querySelector('.vvcomments-login').hidden = data.loggedIn;
      panel.querySelector('.vvcomments-form').hidden = !data.canReply;
      status(panel, data.loggedIn && !data.canReply ? (data.locked ? 'Thảo luận đã khóa. Bạn vẫn có thể đọc bình luận.' : 'Bạn chưa có quyền bình luận trong thảo luận này.') : '');
    } catch (err) {
      more.hidden = false; more.textContent = 'Thử tải lại';
      status(panel, 'Chưa tải được bình luận. Vui lòng thử lại.', true);
    } finally {
      state.loading = false; more.disabled = false; panel.removeAttribute('aria-busy');
    }
  }
  $(document).on('click.vvcomments', '[data-vvjob-comments], [data-comments-close]', async function () {
    const ctx = context(this);
    ctx.panel.hidden = !ctx.panel.hidden;
    ctx.card.querySelector('[data-vvjob-comments]').setAttribute('aria-expanded', String(!ctx.panel.hidden));
    if (!ctx.panel.hidden && !ctx.state.loaded) await load(ctx);
    if (ctx.panel.hidden && this.hasAttribute('data-comments-close')) ctx.card.querySelector('[data-vvjob-comments]').focus();
  });
  $(document).on('click.vvcomments', '[data-comments-more]', function () { load(context(this)); });
  $(document).on('click.vvcomments', '[data-comment-reply]', function () {
    const { panel, state } = context(this);
    if (!state.canReply || state.sending) return;
    state.toPid = this.dataset.commentReply;
    const form = panel.querySelector('.vvcomments-form');
    this.closest('.vvcomment-main').append(form);
    form.classList.add('is-nested');
    $(panel).find('.vvcomments-replying span').text('Đang trả lời ' + this.dataset.name);
    panel.querySelector('.vvcomments-replying').hidden = false;
    panel.querySelector('textarea').focus();
  });
  $(document).on('click.vvcomments', '[data-comment-cancel]', function () {
    const { panel, state } = context(this); cancelReply(panel, state); panel.querySelector('textarea').focus();
  });
  $(document).on('input.vvcomments', '.vvcomments textarea', function () { resize(this); });
  $(document).on('keydown.vvcomments', '.vvcomments textarea', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !event.originalEvent.isComposing) { event.preventDefault(); this.form.requestSubmit(); }
  });
  $(document).on('click.vvcomments', '[data-comment-emoji]', function () {
    const emoji = context(this).panel.querySelector('.vvcomments-emoji');
    emoji.hidden = !emoji.hidden; this.setAttribute('aria-expanded', String(!emoji.hidden));
  });
  $(document).on('click.vvcomments', '.vvcomments [data-emoji]', function () {
    const { panel, state } = context(this); if (state.sending) return;
    const input = panel.querySelector('textarea');
    input.setRangeText(this.dataset.emoji, input.selectionStart, input.selectionEnd, 'end');
    resize(input); input.focus();
    panel.querySelector('.vvcomments-emoji').hidden = true;
    panel.querySelector('[data-comment-emoji]').setAttribute('aria-expanded', 'false');
  });
  $(document).on('submit.vvcomments', '.vvcomments-form', async function (event) {
    event.preventDefault();
    const { panel, state, tid, card } = context(this);
    if (state.sending || !state.canReply) return;
    const input = this.querySelector('textarea'), content = input.value.trim();
    if (!content) { input.focus(); return; }
    state.sending = true;
    let sent = false;
    $(this).find('button,textarea').prop('disabled', true);
    status(panel, 'Đang gửi bình luận…');
    try {
      const api = await app.require('api');
      const data = await api.post(`/topics/${tid}`, { content, ...(state.toPid ? { toPid: state.toPid } : {}) });
      if (!data || (!data.queued && !data.pid)) throw new Error('Chưa nhận được xác nhận. Vui lòng kiểm tra thảo luận trước khi gửi lại.');
      sent = true;
      input.value = ''; resize(input); cancelReply(panel, state);
      if (data.queued) {
        status(panel, 'Bình luận đã gửi và đang chờ duyệt.');
      } else {
        // Native reply returns already parsed post content. No optimistic fake post.
        await append(panel, [{ pid: data.pid, toPid: data.toPid, content: data.content, timestamp: data.timestamp, user: data.user, likes: data.upvotes || 0, liked: false, selfPost: true, replyTo: data.parent?.user?.username || '' }], true);
        const count = card.querySelector('[data-feed-postcount]');
        if (count) { count.dataset.feedPostcount = Number(count.dataset.feedPostcount) + 1; count.textContent = count.dataset.feedPostcount + ' bài viết trong thảo luận'; }
        const replies = card.querySelector('[data-feed-replycount]');
        if (replies) { replies.dataset.feedReplycount = Number(replies.dataset.feedReplycount) + 1; replies.textContent = replies.dataset.feedReplycount; }
        status(panel, 'Đã gửi bình luận.');
      }
    } catch (err) {
      if (sent) { status(panel, 'Đã gửi bình luận. Tải lại trang để xem nội dung mới.'); return; }
      const translator = await app.require('translator');
      const message = await translator.translate(err.message || 'Chưa gửi được bình luận. Vui lòng thử lại.');
      // text() keeps server errors inert. The original draft remains on failure.
      status(panel, message, true);
    } finally {
      state.sending = false; $(this).find('button,textarea').prop('disabled', false);
    }
  });
}());

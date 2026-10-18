"use strict";
/* global app, config, ajaxify */
(function () {
  async function errorText(error) {
    const translator = await app.require('translator');
    return translator.translate(error.message || 'Chưa thể thực hiện. Vui lòng thử lại.');
  }
  function showVote(pid, data) {
    document.querySelectorAll(`[data-vvjob-like="${Number(pid)}"]`).forEach(button => {
      button.setAttribute('aria-pressed', String(data.liked));
      const icon = button.querySelector('i'); icon.classList.toggle('fa-heart', data.liked); icon.classList.toggle('fa-heart-o', !data.liked);
      button.querySelector('[data-like-count]').textContent = Number(data.likes) > 0 ? data.likes : '';
    });
  }
  const pending = new Set();
  $(document).on('click.vvjobLike', '[data-vvjob-like]', async function () {
    if (!app.user.uid) return ajaxify.go('login');
    const pid = Number(this.dataset.vvjobLike);
    if (!Number.isSafeInteger(pid) || pending.has(pid)) return;
    const card = this.closest('[data-feed-tid]'), status = card.querySelector('.vvjob-share-feedback');
    const buttons = Array.from(document.querySelectorAll(`[data-vvjob-like="${pid}"]`));
    pending.add(pid); buttons.forEach(b => { b.disabled = true; });
    let applied = false;
    try {
      const api = await app.require('api');
      // Read fresh state before mutating: native PUT is a toggle, not an idempotent "set".
      const current = await api.get(`/api/vvjob/posts/${pid}/reaction`, {});
      if (current.selfPost) { showVote(pid, current); return; }
      if (current.liked) await api.del(`/posts/${pid}/vote`, {});
      else await api.put(`/posts/${pid}/vote`, { delta: 1 });
      applied = true;
      const updated = await api.get(`/api/vvjob/posts/${pid}/reaction`, {});
      showVote(pid, updated);
      if (status) status.textContent = '';
    } catch (error) {
      if (status) status.textContent = applied ? 'Đã lưu. Tải lại để cập nhật lượt thích.' : await errorText(error);
    } finally { pending.delete(pid); buttons.forEach(b => { b.disabled = false; }); }
  });
  $(document).on('click.vvjobExpand', '[data-vvjob-expand], .vvjob-post-preview', async function (event) {
    if ($(event.target).closest('a').length) return;
    const card = this.closest('[data-feed-tid]');
    if (card.dataset.expanding === '1') return;
    const body = card.querySelector('.vvjob-post-body'), preview = body.querySelector('.vvjob-post-preview'), original = body.querySelector('.vvjob-post-original');
    const status = card.querySelector('.vvjob-content-status');
    if (card.classList.contains('is-expanded')) {
      // Clicking the heading or chevron collapses; links and text selection stay native.
      original.hidden = true; preview.hidden = false; card.classList.remove('is-expanded');
      card.querySelectorAll('[data-vvjob-expand]').forEach(b => { b.setAttribute('aria-expanded', 'false'); });
      return;
    }
    card.dataset.expanding = '1'; body.setAttribute('aria-busy', 'true');
    try {
      const api = await app.require('api');
      const data = await api.get(`/api/vvjob/topics/${Number(card.dataset.feedTid)}/content`, {});
      // Content is parsed/sanitized by native NodeBB, with viewer/category/block checks server-side.
      $(original).html(data.content); original.hidden = false; preview.hidden = true;
      card.classList.add('is-expanded');
      card.querySelectorAll('[data-vvjob-expand]').forEach(b => { b.setAttribute('aria-expanded', 'true'); });
      showVote(data.pid, data); status.textContent = '';
    } catch (error) { status.classList.remove('visually-hidden'); status.textContent = await errorText(error); }
    finally { delete card.dataset.expanding; body.removeAttribute('aria-busy'); }
  });
  function syncAvatar() {
    const avatar = document.querySelector('.vv2-compose-avatar');
    if (!avatar || !app.user.uid) return;
    // app.user is refreshed by NodeBB after native profile/picture updates.
    if (app.user.picture) {
      let img = avatar.querySelector('img');
      if (!img) { img = document.createElement('img'); img.alt = ''; avatar.replaceChildren(img); }
      img.src = app.user.picture;
    }
  }
  $(window).on('action:ajaxify.end action:user.update action:profile.update', syncAvatar);
  $(syncAvatar);
}());

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
      const icon = button.querySelector('i'); icon.classList.toggle('fa-thumbs-up', data.liked); icon.classList.toggle('fa-thumbs-o-up', !data.liked);
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
      original.hidden = true; preview.hidden = false;
      const media = body.querySelector('.vvjob-media'); if (media) media.hidden = false; card.classList.remove('is-expanded');
      card.querySelectorAll('[data-vvjob-expand]').forEach(b => { b.setAttribute('aria-expanded', 'false'); });
      return;
    }
    card.dataset.expanding = '1'; body.setAttribute('aria-busy', 'true');
    try {
      const api = await app.require('api');
      const data = await api.get(`/api/vvjob/topics/${Number(card.dataset.feedTid)}/content`, {});
      // Content is parsed/sanitized by native NodeBB, with viewer/category/block checks server-side.
      $(original).html(data.content); original.hidden = false; preview.hidden = true;
      const media = body.querySelector('.vvjob-media'); if (media) media.hidden = true;
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

  let viewer, gallery = [], imageIndex = 0;
  function showImage(index) {
    imageIndex = (index + gallery.length) % gallery.length;
    viewer.querySelector('img').src = gallery[imageIndex];
    viewer.querySelector('[data-image-caption]').textContent = `${imageIndex + 1} / ${gallery.length}`;
    viewer.querySelectorAll('[data-image-step]').forEach(button => { button.hidden = gallery.length < 2; });
  }
  $(document).on('click.vvjobImage', '[data-vvjob-image]', function () {
    const card = this.closest('[data-feed-tid]');
    if (this.dataset.imageOverflow) { if (!card.classList.contains('is-expanded')) card.querySelector('h2 [data-vvjob-expand]').click(); return; }
    gallery = Array.from(this.closest('.vvjob-media').querySelectorAll('img')).map(img => img.src);
    if (!gallery.length) return;
    if (!viewer) {
      viewer = document.createElement('dialog'); viewer.className = 'vvjob-image-viewer'; viewer.setAttribute('aria-label', 'Xem ảnh bài viết');
      viewer.innerHTML = '<button type="button" data-image-close aria-label="Đóng ảnh"><i class="fa fa-times" aria-hidden="true"></i></button><button type="button" data-image-step="-1" aria-label="Ảnh trước"><i class="fa fa-angle-left" aria-hidden="true"></i></button><figure><img alt="Ảnh trong bài viết"><figcaption data-image-caption></figcaption></figure><button type="button" data-image-step="1" aria-label="Ảnh tiếp theo"><i class="fa fa-angle-right" aria-hidden="true"></i></button>';
      document.body.append(viewer);
      viewer.addEventListener('click', event => { if (event.target === viewer || event.target.closest('[data-image-close]')) viewer.close(); const step = event.target.closest('[data-image-step]'); if (step) showImage(imageIndex + Number(step.dataset.imageStep)); });
      viewer.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showImage(imageIndex + (event.key === 'ArrowRight' ? 1 : -1)); } });
      viewer.addEventListener('close', () => { viewer.querySelector('img').removeAttribute('src'); gallery = []; document.body.classList.remove('vvjob-image-open'); });
    }
    showImage(Number(this.dataset.vvjobImage) || 0); viewer.showModal(); document.body.classList.add('vvjob-image-open');
  });
  // Fix the mobile shell in place while a stable spacer prevents scroll jumps.
  let headerSpacer, compact = false, scrollPending = false;
  function updateCompact() {
    scrollPending = false;
    const enabled = window.matchMedia('(max-width: 699px)').matches && !!document.querySelector('.vv2-feed');
    document.body.classList.toggle('vvjob-feed-page', enabled);
    const header = document.querySelector('.vvjob-site-top');
    if (!header) return;
    if (!headerSpacer) { headerSpacer = document.createElement('div'); headerSpacer.className = 'vvjob-header-spacer'; header.after(headerSpacer); }
    const next = enabled && (window.scrollY > 160 || (compact && window.scrollY > 80));
    if (next && !compact) { headerSpacer.style.height = header.getBoundingClientRect().height + 'px'; }
    if (next !== compact) { compact = next; document.body.classList.toggle('vvjob-feed-scrolled', compact); }
    headerSpacer.hidden = !compact;
  }
  function scheduleCompact() { if (!scrollPending) { scrollPending = true; window.requestAnimationFrame(updateCompact); } }
  window.addEventListener('scroll', scheduleCompact, { passive: true });
  window.addEventListener('resize', scheduleCompact, { passive: true });
  $(window).on('action:ajaxify.end', () => { if (viewer?.open) viewer.close(); scheduleCompact(); });
  $(scheduleCompact);
}());

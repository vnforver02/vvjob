"use strict";
/* global app, config, ajaxify */
(function () {
  async function errorText(error) {
    const translator = await app.require('translator');
    return translator.translate(error.message || 'Chưa thể thực hiện. Vui lòng thử lại.');
  }
  function showVote(pid,data) { $(document).trigger('vvjob:reaction',[pid,data.reactions||data]); }
  $(document).on('click.vvjobExpand', '[data-vvjob-expand], .vvjob-post-preview', async function (event) {
    if ($(event.target).closest('a').length || window.getSelection()?.toString()) return;
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
      const data = body._vvjobContent || await api.get(`/api/vvjob/topics/${Number(card.dataset.feedTid)}/content`, {});
      body._vvjobContent = data;
      // Content is parsed/sanitized by native NodeBB, with viewer/category/block checks server-side.
      $(original).html(data.content); original.hidden = false; preview.hidden = true;
      const media = body.querySelector('.vvjob-media'); if (media) media.hidden = true;
      card.classList.add('is-expanded');
      card.querySelectorAll('[data-vvjob-expand]').forEach(b => { b.setAttribute('aria-expanded', 'true'); });
      showVote(data.pid, data); status.textContent = ''; status.classList.add('visually-hidden');
    } catch (error) { status.classList.remove('visually-hidden'); status.textContent = await errorText(error); }
    finally { delete card.dataset.expanding; body.removeAttribute('aria-busy'); }
  });
  let observedHeader, avatarSignature = '';
  function syncAvatar() {
    const uid = Number(app.user?.uid);
    const header = document.querySelector('[component="header/avatar"]');
    if (!uid || !header) return;
    const source = header.querySelector('.avatar');
    if (!source) return;
    const signature = uid + source.outerHTML;
    document.querySelectorAll(`[data-vvjob-avatar-uid="${uid}"]`).forEach(avatar => {
      if (avatar.dataset.avatarSignature === signature) return;
      const clone = source.cloneNode(true);
      clone.removeAttribute('id'); clone.removeAttribute('component'); clone.setAttribute('aria-hidden','true');
      avatar.replaceChildren(clone); avatar.dataset.avatarSignature = signature;
    });
    avatarSignature = signature;
    if (observedHeader !== header) {
      observedHeader = header;
      new MutationObserver(() => window.requestAnimationFrame(syncAvatar)).observe(header,{childList:true,subtree:true,attributes:true,characterData:true});
    }
  }
  $(window).on('action:ajaxify.end action:user.update action:profile.update action:avatar.update',syncAvatar);
  $(document).on('vvjob:avatars',syncAvatar);
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

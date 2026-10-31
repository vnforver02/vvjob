"use strict";
/* global app, config, ajaxify */
(function () {
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
    if (this.dataset.imageOverflow) { card.querySelector('[data-vvjob-post-open]')?.click(); return; }
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

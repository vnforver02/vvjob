'use strict';
/* global app, ajaxify */
// Delegation includes the shared shell, dynamically loaded pages and mobile nav.
$(document).on('click.vvjob', '[data-vvjob-compose]', function () {
  if (!app.user.uid) { return ajaxify.go('login'); }
  const cid = Number(this.dataset.cid);
  require(['composer'], function (composer) { composer.newTopic(Number.isSafeInteger(cid) && cid > 0 ? { cid } : {}); });
});

$(window).on('action:ajaxify.end', function () {
  const name = ajaxify.data.template.name;
  const section = name === 'vvjob' || ['recent', 'popular', 'unread'].includes(name) ? 'feed' :
    name === 'category' || name === 'categories' ? 'communities' :
      name === 'users' ? 'people' : name === 'notifications' ? 'notifications' :
        name.startsWith('account/') ? 'profile' : '';
  $('[data-vvjob-nav]').each(function () {
    const active = $(this).attr('data-vvjob-nav') === section;
    $(this).toggleClass('active', active);
    if (active) { $(this).attr('aria-current', 'page'); } else { $(this).removeAttr('aria-current'); }
  });
});

// The native composer is attached outside #content and can minimize independently
// of navigation. Observe visibility without replacing its draft or submit logic.
let editorUpdatePending = false;
function updateEditorState() {
  if (editorUpdatePending) { return; }
  editorUpdatePending = true;
  window.requestAnimationFrame(function () {
    editorUpdatePending = false;
    const open = $('.composer.resizable').toArray().some(function (el) {
      const css = window.getComputedStyle(el);
      return css.visibility !== 'hidden' && css.display !== 'none';
    });
    if (document.body.classList.contains('vvjob-editor-open') !== open) {
      document.body.classList.toggle('vvjob-editor-open', open);
    }
  });
}
$(function () {
  new MutationObserver(function (changes) {
    if (changes.some(function (change) {
      return change.type === 'childList' || change.target.classList && change.target.classList.contains('composer');
    })) { updateEditorState(); }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  updateEditorState();
});

// NodeBB 4.6 can receive the same post via quick reply and a concurrent live
// update. Its renderer removes already present posts before its scroll callback,
// which then reads an empty array. Deduplicate only posts already in the main
// discussion; leave new posts, nested replies and privilege handling native.
require(['forum/topic/posts'], function (posts) {
  const onNewPost = posts.onNewPost;
  posts.onNewPost = function (data) {
    if (data && Array.isArray(data.posts) && data.posts.length && data.posts.every(function (post) {
      return $('ul.posts > [component="post"]').toArray().some(function (el) {
        return String(el.getAttribute('data-pid')) === String(post.pid);
      });
    })) { return; }
    return onNewPost.apply(this, arguments);
  };
});

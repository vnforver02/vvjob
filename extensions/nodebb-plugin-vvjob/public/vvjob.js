'use strict';
/* global app, ajaxify */
// Delegation includes the shared shell, dynamically loaded pages and mobile nav.
$(document).on('click.vvjob', '[data-vvjob-compose]', function () {
  if (!app.user.uid) { return ajaxify.go('login'); }
  require(['composer'], function (composer) { composer.newTopic({}); });
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

'use strict';
/* global app, ajaxify */
// Delegation includes the shared shell, dynamically loaded pages and mobile nav.
$(document).on('click.vvjob', '[data-vvjob-compose]', function () {
  if (!app.user.uid) { return ajaxify.go('login'); }
  const cid = Number(this.dataset.cid);
  require(['composer'], function (composer) { composer.newTopic(Number.isSafeInteger(cid) && cid > 0 ? { cid } : {}); });
});

function syncNavigation(){
  const name = window.ajaxify?.data?.template?.name || '';
  const section = name === 'account/bookmarks' ? 'saved' : ['vvjob', 'recent', 'popular', 'unread', 'topic'].includes(name) ? 'feed' :
    ['category', 'categories'].includes(name) ? 'communities' : name === 'vvjob-companies' ? 'companies' :
      ['users', 'vvjob-people'].includes(name) ? 'people' : name === 'chats' ? 'chats' : name.startsWith('account/') ? 'profile' : '';
  $('[data-vvjob-nav]').each(function () {
    const active = $(this).attr('data-vvjob-nav') === section;
    $(this).toggleClass('active', active);
    if (active) { $(this).attr('aria-current', 'page'); } else { $(this).removeAttr('aria-current'); }
  });
}
$(syncNavigation);$(window).on('action:ajaxify.end action:app.load',syncNavigation);

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

// Share a real permalink; clipboard fallback stays within the user's explicit click.
require(['navigator'], function (navigator) {
  function refresh() {
    const topic = ajaxify.data.template.name === 'topic';
    const count = topic ? navigator.getCount() : 0;
    document.body.classList.toggle('vvjob-has-replies', topic && Number(ajaxify.data.postcount) > 1);
    $('.vvjob-progress-label').text(`${navigator.getIndex()} / ${count}`);
  }
  $(window).on('action:ajaxify.end', refresh);
  $(function () {
    const el = document.querySelector('.vvjob-mobile-progress .pagination-text');
    if (el) new MutationObserver(refresh).observe(el, { childList: true, subtree: true, characterData: true });
  });
});

$(document).on('click.vvjobShare','[data-vvjob-share]',async function(){
 const button=this,feedback=$(button).siblings('.vvjob-share-feedback');
 const url=new URL(button.dataset.url,window.location.origin).href;
 button.disabled=true;feedback.text('');
 try { if(navigator.share){await navigator.share({title:button.dataset.title,url})} else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url);feedback.text('Đã sao chép liên kết')} else { window.prompt('Sao chép liên kết bài viết',url); } }
 catch(error){if(error.name!=='AbortError')feedback.text('Chưa thể chia sẻ. Vui lòng thử lại.')}
 finally{button.disabled=false}
});


// The local shell uses the signed-in account, never preview identities.
function syncLocalViewer(){
 const source=document.querySelector('[component="header/avatar"] .avatar');
 document.querySelectorAll('[data-local-viewer-name]').forEach(el=>{el.textContent=app.user?.displayname||app.user?.username||'Không gian của bạn';});
 document.querySelectorAll('[data-local-viewer-avatar]').forEach(el=>{if(source){const copy=source.cloneNode(true);copy.removeAttribute('id');copy.removeAttribute('component');el.replaceChildren(copy);}});
}
$(syncLocalViewer);$(window).on('action:ajaxify.end action:avatar.update',syncLocalViewer);

// Failed third-party logos fall back to the existing company monogram.
function settleCompanyLogos(){document.querySelectorAll('img.vvjob-company-logo').forEach(img=>{if(img.complete&&!img.naturalWidth)img.hidden=true;});}
$(settleCompanyLogos);$(window).on('action:ajaxify.end',settleCompanyLogos);

// Keep directory searches in the native app shell; GET forms still work without JS.
$(document).on('submit.vvjobDirectory','form.vvpeople-search,form.vvjob-company-search',function(event){
 if(event.isDefaultPrevented()||this.target)return;
 const url=new URL(this.action,location.href),relative=config.relative_path||'';
 if(url.origin!==location.origin||!url.pathname.startsWith(relative+'/'))return;
 const route=url.pathname.slice(relative.length+1);
 if(!['users','vvjob/companies'].includes(route))return;
 event.preventDefault();url.search=new URLSearchParams(new FormData(this)).toString();
 ajaxify.go(route+url.search);
});

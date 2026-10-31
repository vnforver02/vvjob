'use strict';
/* global app, ajaxify */
(function(){
 const advancedTools=new WeakMap();
 const normal=t=>String(t||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('vi');
 function polish(){
  const mainPost=document.querySelector('ul.posts>[component="post"][data-index="0"]');
  const nativeTags=document.querySelector('.topic-info [component="topic/tags"]');
  if(mainPost&&nativeTags?.querySelector('a')&&!mainPost.querySelector('.vvjob-post-hashtags')){
   const tags=document.createElement('nav');tags.className='vvjob-post-hashtags';tags.setAttribute('aria-label','Chủ đề bài viết');
   nativeTags.querySelectorAll('a').forEach(link=>{const copy=link.cloneNode(true);copy.textContent='#'+link.textContent.trim();tags.append(copy);});
   const footer=mainPost.querySelector('[component="post/footer"]');if(footer)footer.before(tags);
  }
  const firstReply=document.querySelector('ul.posts>[component="post"][data-index="1"]');
  if(firstReply&&!firstReply.querySelector(':scope>.vvjob-local-comment-heading')){
   const heading=document.createElement('div');heading.className='vvjob-local-comment-heading';
   const label=document.createElement('strong');label.textContent='Bình luận';
   const note=document.createElement('span');note.textContent='Cùng chia sẻ góc nhìn';heading.append(label,note);firstReply.prepend(heading);
  }

  document.querySelectorAll('[component="post"]').forEach(post=>{
   const tools=post.querySelector('.vvjob-legacy-votes');if(tools&&!advancedTools.has(post))advancedTools.set(post,tools);
   const menu=post.querySelector('[component="post/tools"] .dropdown-menu'),extra=advancedTools.get(post);
   if(menu?.children.length&&extra&&!menu.contains(extra))menu.append(extra);
  });
  document.querySelectorAll('.vvjob-parent-context').forEach(details=>{
   if(details.dataset.vvjobLabel)return;
   const name=[...details.querySelectorAll('a[href*="/user/"]')].map(a=>a.textContent.trim()).filter(s=>s.length>1).sort((a,b)=>b.length-a.length)[0];if(name)details.querySelector('summary').textContent='Trả lời '+name;
   details.dataset.vvjobLabel='1';
  });
  document.querySelectorAll('ul.posts [component="post/content"] > blockquote').forEach(quote=>{
   const fold=document.createElement('details');fold.className='vvjob-quoted-content';
   const summary=document.createElement('summary');summary.textContent='Xem nội dung được trích dẫn';
   quote.before(fold);fold.append(summary,quote);
  });

  document.querySelectorAll('.vv2-post').forEach(card=>{const title=card.querySelector('.vvjob-feed-title'),body=card.querySelector('.vvjob-post-preview');if(title&&body){const text=normal(title.textContent);title.classList.toggle('vvjob-repeat-title',!!text&&normal(body.textContent).startsWith(text));}});
  const title=document.querySelector('.vvjob-original-title'),body=document.querySelector('ul.posts>[component="post"] [component="post/content"]');if(title&&body){const text=normal(title.textContent);title.classList.toggle('vvjob-repeat-title',!!text&&normal(body.textContent).startsWith(text));}
 }
 const pending=new Set();
 $(document).on('click.vvjobBookmark','[data-vvjob-bookmark]',async function(event){
  event.preventDefault();if(!app.user.uid){ajaxify.go('login');return;}
  const pid=Number(this.dataset.vvjobBookmark);if(!Number.isSafeInteger(pid)||pending.has(pid))return;
  const was=this.getAttribute('aria-pressed')==='true';pending.add(pid);this.setAttribute('aria-busy','true');
  const feedback=this.closest('[data-feed-tid]')?.querySelector('.vvjob-share-feedback');
  try{const api=await app.require('api');await api[was?'del':'put'](`/posts/${pid}/bookmark`,{});document.querySelectorAll(`[data-vvjob-bookmark="${pid}"]`).forEach(b=>{b.setAttribute('aria-pressed',String(!was));b.querySelector('i').className='fa '+(was?'fa-bookmark-o':'fa-bookmark')});if(feedback)feedback.textContent=was?'Đã bỏ lưu':'Đã lưu bài viết';}
  catch(error){const translator=await app.require('translator');if(feedback)feedback.textContent=await translator.translate(error.message||'Chưa lưu được bài viết. Vui lòng thử lại.');}
  finally{pending.delete(pid);this.removeAttribute('aria-busy');}
 });
 let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;polish()})};
 $(window).on('action:ajaxify.end action:posts.loaded',schedule);$(function(){polish();const root=document.querySelector('#content');if(root)new MutationObserver(changes=>{if(changes.some(c=>c.addedNodes.length))schedule()}).observe(root,{childList:true,subtree:true})});
}());

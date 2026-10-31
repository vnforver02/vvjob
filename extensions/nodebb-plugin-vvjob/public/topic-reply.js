'use strict';
/* global app, ajaxify */
(function(){
 const forms=new WeakMap();
 const key=(tid,pid)=>`vvjob:inline:${app.user.uid}:${tid}:${pid}`;
 function saved(k){try{return sessionStorage.getItem(k)||''}catch{return ''}}
 function save(k,text){try{if(text)sessionStorage.setItem(k,text);else sessionStorage.removeItem(k)}catch{/* Draft persistence is optional. */}}
 function place(form,post,entry){
  form.dataset.vvjobRoot=entry?'1':'0';
  const label=form.querySelector('.vvjob-inline-recipient span');if(label)label.textContent=entry?'Bình luận về bài viết':'Trả lời '+(post.querySelector('.post-header a[data-uid]')?.textContent?.trim()||'thành viên');
  if(entry){entry.after(form);form.classList.add('vvjob-root-inline-form');return;}
  form.classList.remove('vvjob-root-inline-form');const footer=post.querySelector('.vvjob-post-footer'),children=footer?.querySelector('[component="post/replies/container"]');if(footer)footer.insertBefore(form,children||null);else post.append(form);
 }
 function open(post,entry){
  if(forms.has(post)){const form=forms.get(post);place(form,post,entry);form.hidden=false;form.querySelector('textarea').focus({preventScroll:true});form.scrollIntoView({block:'nearest',behavior:'auto'});return;}
  const tid=Number(ajaxify.data.tid),pid=Number(post.dataset.pid);if(!tid||!pid)return;
  const name=post.querySelector('.post-header a[data-uid]')?.textContent?.trim()||'thành viên';
  const form=document.createElement('form');form.className='vvjob-topic-inline-form';form.setAttribute('aria-label','Trả lời bình luận');
  form.innerHTML='<div class="vvjob-inline-recipient"><span></span><button type="button" data-inline-close aria-label="Đóng trả lời">×</button></div><div class="vvjob-inline-input"><textarea rows="1" placeholder="Viết câu trả lời…" aria-label="Nội dung trả lời" required></textarea><button type="submit" aria-label="Gửi trả lời"><i class="fa fa-paper-plane" aria-hidden="true"></i></button></div><div class="vvjob-inline-emoji" aria-label="Thêm biểu cảm"><button type="button" data-vvjob-emoji aria-label="Chọn biểu cảm" aria-expanded="false">😊</button><small>Ctrl / ⌘ + Enter</small></div><p role="status" aria-live="polite"></p>';
  form.querySelector('.vvjob-inline-recipient span').textContent='Trả lời '+name;
  const textarea=form.querySelector('textarea'),status=form.querySelector('[role="status"]'),draftKey=key(tid,pid);textarea.value=saved(draftKey);
  place(form,post,entry);
  forms.set(post,form);let sending=false;
  const resize=()=>{textarea.style.height='auto';textarea.style.height=Math.min(150,textarea.scrollHeight)+'px';save(draftKey,textarea.value)};
  textarea.addEventListener('input',resize);textarea.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&!e.isComposing){e.preventDefault();form.requestSubmit()}});
  form.querySelector('[data-inline-close]').onclick=()=>{if(!sending)form.hidden=true};
  form.querySelectorAll('.vvjob-inline-emoji button:not([data-vvjob-emoji])').forEach(b=>b.onclick=()=>{textarea.setRangeText(b.textContent,textarea.selectionStart,textarea.selectionEnd,'end');resize();textarea.focus()});
  form.addEventListener('submit',async event=>{
   event.preventDefault();const content=textarea.value.trim();if(sending||!content)return;
   sending=true;form.querySelectorAll('button,textarea').forEach(el=>el.disabled=true);status.textContent='Đang gửi…';status.classList.remove('is-error');
   const previousScroll=ajaxify.data.scrollToMyPost;ajaxify.data.scrollToMyPost=false;let committed=false;
   try{
    const api=await app.require('api');const data=await api.post(`/topics/${tid}`,form.dataset.vvjobRoot==='1'?{content}:{content,toPid:pid});
    if(!data?.pid&&!data?.queued)throw Error('Chưa nhận được xác nhận. Vui lòng kiểm tra trước khi gửi lại.');
    committed=true;textarea.value='';save(draftKey,'');resize();status.textContent=data.queued?'Câu trả lời đang chờ duyệt.':'Đã gửi câu trả lời.';
    if(!data.queued&&form.dataset.vvjobRoot!=='1'&&post.isConnected&&Number(ajaxify.data.tid)===tid){
     // Refresh only this native thread. Core retains parsing, permissions and tools.
     const button=$(post).find('[component="post/reply-count"]').first();
     if(button.length){const replies=await app.require('forum/topic/replies');button.find('[component="post/replies/open"]').removeAttr('loaded loading');$(post).find('[component="post/replies/container"]').first().empty();button.removeClass('hidden');replies.init(button);}
    }
   }catch(error){
    if(committed)status.textContent='Đã gửi. Mở các câu trả lời để xem nội dung mới.';
    else{const translator=await app.require('translator');status.textContent=await translator.translate(error.message||'Chưa gửi được. Vui lòng thử lại.');status.classList.add('is-error');}
   }finally{
    sending=false;form.querySelectorAll('button,textarea').forEach(el=>el.disabled=false);
    setTimeout(()=>{if(Number(ajaxify.data.tid)===tid&&ajaxify.data.scrollToMyPost===false)ajaxify.data.scrollToMyPost=previousScroll},1500);
   }
  });resize();textarea.focus({preventScroll:true});form.scrollIntoView({block:'nearest',behavior:'auto'});
 }
 document.addEventListener('click',event=>{
  if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||ajaxify.data.template.name!=='topic'||!app.user.uid||!ajaxify.data.privileges?.['topics:reply'])return;
  const button=event.target.closest('[component="post/reply"],[component="topic/reply"],[data-vvjob-root-reply]');if(!button)return;
  const post=button.closest('[component="post"]')||document.querySelector('ul.posts>[component="post"][data-index="0"]')||document.querySelector('ul.posts>[component="post"]');if(!post)return;
  event.preventDefault();event.stopImmediatePropagation();open(post,button.matches('[data-vvjob-root-reply]')?button.closest('.vvjob-simple-comment-entry'):null);
 },true);
 // Native realtime and thread refresh can race; deduplicate within each thread only.
 $(window).on('action:posts.loaded',()=>{document.querySelectorAll('[component="post/replies"]').forEach(list=>{const seen=new Set();[...list.children].forEach(post=>{const pid=post.dataset.pid;if(pid&&seen.has(pid))post.remove();else if(pid)seen.add(pid)})})});
 $(window).on('action:ajaxify.end',()=>{if(!app.user.uid){try{Object.keys(sessionStorage).filter(k=>k.startsWith('vvjob:inline:')).forEach(k=>sessionStorage.removeItem(k))}catch{/* No storage. */}}});
}());

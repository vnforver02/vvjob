'use strict';
/* global app, config */
(function(){
 function sync(){
  document.querySelectorAll('.composer.vvjob-slim-composer').forEach(composer=>{
   const category=composer.querySelector('.category-list-container'),identity=composer.querySelector('.vvjob-editor-identity>div');
   if(category&&identity&&!identity.contains(category))identity.append(category);
   if(category){
    const rows=[...category.querySelectorAll('[component="category/list"] li[data-cid]')].filter(row=>Number(row.dataset.cid)>0&&!row.classList.contains('disabled')&&row.getAttribute('aria-disabled')!=='true'&&row.querySelector('a:not(.disabled):not([aria-disabled="true"])'));
    if(rows.length){
     let select=category.querySelector('[data-vvjob-category]');
     if(!select){select=document.createElement('select');select.dataset.vvjobCategory='';select.className='vvjob-category-select';select.setAttribute('aria-label','Chọn chuyên mục');select.required=true;category.append(select);select.addEventListener('change',()=>{const row=[...category.querySelectorAll('[component="category/list"] li[data-cid]')].find(row=>row.dataset.cid===select.value);row?.querySelector('a:not(.disabled)')?.click();});}
     const signature=JSON.stringify(rows.map(row=>[row.dataset.cid,row.dataset.name||row.textContent.trim()]));
     const selectedName=category.querySelector('[component="category-selector-selected"]')?.textContent.replace(/\s+/g,' ').trim();
     const selected=rows.find(row=>(row.dataset.name||row.textContent).replace(/\s+/g,' ').trim()===selectedName);
     if(select.dataset.options!==signature){select.replaceChildren();const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Chọn chuyên mục';placeholder.disabled=true;select.append(placeholder);rows.forEach(row=>{const option=document.createElement('option');option.value=row.dataset.cid;option.textContent=row.dataset.name||row.textContent.trim();select.append(option);});select.dataset.options=signature;select.value=selected?selected.dataset.cid:'';}
     else if(selected&&document.activeElement!==select)select.value=selected.dataset.cid;
     category.classList.add('vvjob-category-ready');
    }
   }

   const topicInput=composer.querySelector('.bootstrap-tagsinput input'),topicHelp=composer.querySelector('[data-vvjob-topic-help]');
   if(topicInput){
    topicInput.setAttribute('aria-label','Thêm hoặc tìm chủ đề (không bắt buộc)');
    if(!topicInput.readOnly)topicInput.setAttribute('placeholder','Thêm hoặc tìm chủ đề…');
    const help=topicInput.readOnly?'Chọn chủ đề có sẵn trong cột bên cạnh.':'Không bắt buộc. Nhập chủ đề rồi nhấn Enter; chọn gợi ý nếu đã có.';
    if(topicHelp&&topicHelp.textContent!==help)topicHelp.textContent=help;
   }
   const image=composer.querySelector('.img-upload-btn');if(image&&!image.dataset.vvjobIcon){image.dataset.vvjobIcon='1';image.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h18v16H3ZM3 16l5-5 5 5 3-3 5 5M8 8h.01"/></svg>';}
   const textarea=composer.querySelector('textarea.write');if(textarea)textarea.setAttribute('placeholder','Có gì mới trong công việc của bạn?');
  });
  document.querySelectorAll('.composer .vvjob-editor-identity').forEach(row=>{
   const source=document.querySelector('[component="header/avatar"] .avatar');
   const name=String(app.user?.displayname||app.user?.username||'Bạn');
   const target=row.querySelector('[data-editor-avatar]');
   const signature=(source?.outerHTML||'')+name;
   if(row.dataset.identitySignature===signature)return;
   row.querySelector('[data-editor-name]').textContent=name;
   if(source){const clone=source.cloneNode(true);clone.removeAttribute('id');clone.removeAttribute('component');target.replaceChildren(clone);}
   row.dataset.identitySignature=signature;
  });
 }
 let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})}
 $(document).on('click.vvjobEditorMore','[data-vvjob-editor-more]',function(){const composer=this.closest('.composer');const open=composer.classList.toggle('vvjob-more-open');this.setAttribute('aria-expanded',String(open));});
 $(window).on('action:composer.check',function(event,payload){
  if(payload.postData.action!=='topics.post')return;
  const title=payload.titleEl[0];if(!title)return;
  // Preserve a manually titled draft made before the titleless UI.
  if(title.value.trim()&&!title.dataset.vvjobAutoTitle)return;
  title.value=window.vvjobPostTitle(payload.bodyEl.val(),config.minimumTitleLength,config.maximumTitleLength);
  title.dataset.vvjobAutoTitle='1';payload.titleLen=title.value.length;
 });
 function viewport(){const v=window.visualViewport;document.documentElement.style.setProperty('--vvjob-editor-viewport',(v?.height||innerHeight)+'px');document.documentElement.style.setProperty('--vvjob-editor-bottom',Math.max(0,innerHeight-(v?.height||innerHeight)-(v?.offsetTop||0))+12+'px');}
 viewport();window.visualViewport?.addEventListener('resize',viewport);window.addEventListener('resize',viewport);
 $(function(){new MutationObserver(changes=>{if(changes.some(c=>c.type==='childList'))schedule()}).observe(document.body,{childList:true,subtree:true});sync()});
 $(window).on('action:ajaxify.end action:avatar.update',schedule);
 $(window).on('action:composer.loaded',async function(){
  // Native categories are loaded lazily; request its permission-filtered list
  // without opening a second dropdown beside the compact native select.
  document.querySelectorAll('.composer.vvjob-slim-composer .category-list-container').forEach(category=>{
   if(category.dataset.vvjobCategoriesRequested)return;
   category.dataset.vvjobCategoriesRequested='1';
   const selector=category.querySelector('[component="category-selector"]');
   $(selector).triggerHandler('show.bs.dropdown');
   $(selector).triggerHandler('hide.bs.dropdown');
  });
  sync();const preview=await app.require('composer/preview');preview.toggle?.(false);
 });
}());

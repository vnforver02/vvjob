'use strict';
/* global app */
(function(){
 function sync(){
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
 $(function(){new MutationObserver(changes=>{if(changes.some(c=>c.type==='childList'))schedule()}).observe(document.body,{childList:true,subtree:true});sync()});
 $(window).on('action:ajaxify.end action:avatar.update',schedule);
 $(window).on('action:composer.loaded',async function(){sync();const preview=await app.require('composer/preview');preview.toggle?.(false);});
}());

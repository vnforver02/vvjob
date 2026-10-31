'use strict';
/* global ajaxify, app */
(function(){
 let origin=null,returning=false,replyIntent='';
 const modified=e=>e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey;
 // Real title/summary anchors retain native Ajaxify, new-tab and keyboard behavior.
 // Only non-interactive whitespace delegates to that same real anchor.
 $(document).on('click.vvjobCard','.vv2-post,.vvhot-row',function(event){
  if(event.isDefaultPrevented()||modified(event)||window.getSelection()?.toString())return;
  if(event.target.closest('a,button,input,textarea,select,label,details,[role="button"],[contenteditable]'))return;
  this.querySelector('[data-vvjob-post-open]')?.click();
 });
 document.addEventListener('click',function(event){
  if(modified(event))return;
  const link=event.target.closest('a');if(!link)return;
  if(link.matches('[data-vvjob-feed-back]')&&origin&&location.pathname===origin.topic&&history.length>1){
   event.preventDefault();event.stopImmediatePropagation();history.back();return;
  }
  const card=link.closest('[data-feed-tid]');
  if(!card||ajaxify.data.template.name!=='vvjob'||link.target||link.hasAttribute('download'))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||!url.pathname.includes('/topic/'))return;
  replyIntent=link.matches('[data-vvjob-open-thread]')?url.pathname:'';
  origin={url:location.pathname+location.search,topic:url.pathname,y:window.scrollY,tid:card.dataset.feedTid,key:card.dataset.feedKey,offset:card.getBoundingClientRect().top};
 },true);
 window.addEventListener('popstate',()=>{returning=!!origin&&ajaxify.data.template.name==='topic';});
 $(window).on('action:ajaxify.end',function(){
  const openReply=replyIntent&&location.pathname===replyIntent&&ajaxify.data.template.name==='topic';replyIntent='';
  if(openReply){
   if(app.user?.uid&&ajaxify.data.privileges?.['topics:reply'])requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelector('[data-vvjob-root-reply]')?.click()));
  }

  const restore=returning&&origin&&ajaxify.data.template.name==='vvjob'&&location.pathname+location.search===origin.url;
  returning=false;if(!restore)return;
  const saved={...origin};
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   // Ignore a second navigation while this render was settling.
   if(location.pathname+location.search!==saved.url)return;
   const card=[...document.querySelectorAll('[data-feed-tid]')].find(c=>saved.key?c.dataset.feedKey===saved.key:c.dataset.feedTid===saved.tid);
   const top=card?window.scrollY+card.getBoundingClientRect().top-saved.offset:saved.y;
   window.scrollTo({top:Math.max(0,top),behavior:'auto'});
  }));
 });
}());

'use strict';
/* global app */
(function(){
 let observer,resize,frame,tab='all';
 function filter(){
  const root=document.querySelector('.vvjob-chat-workspace');if(!root)return;
  const q=(root.querySelector('[data-chat-filter]')?.value||'').trim().toLocaleLowerCase('vi');
  const rooms=[...root.querySelectorAll('[component="chat/recent/room"]')];let count=0,unread=0;
  rooms.forEach(r=>{const fresh=r.classList.contains('unread');if(fresh)unread++;const show=(tab!=='unread'||fresh)&&(!q||r.textContent.toLocaleLowerCase('vi').includes(q));r.hidden=!show;if(show)count++;});
  const badge=root.querySelector('[data-chat-unread]');if(badge)badge.textContent=unread||'';
  const empty=root.querySelector('.vvjob-chat-filter-empty');if(empty)empty.hidden=count>0||(!q&&tab==='all');
 }
 function position(){
  if(!document.querySelector('.vvjob-chat-workspace'))return;
  const header=document.querySelector('.vvjob-site-top');if(header)document.documentElement.style.setProperty('--vvjob-chat-top',Math.max(0,header.getBoundingClientRect().bottom)+12+'px');
 }
 function init(){
  observer?.disconnect();resize?.disconnect();cancelAnimationFrame(frame);tab='all';
  const root=document.querySelector('.vvjob-chat-workspace');if(!root)return;
  root.querySelector('[data-chat-filter]')?.addEventListener('input',filter);
  root.querySelectorAll('[data-chat-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.chatTab;root.querySelectorAll('[data-chat-tab]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));filter();}));
  const list=root.querySelector('[component="chat/recent"]');if(list){observer=new MutationObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(filter)});observer.observe(list,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});}
  const header=document.querySelector('.vvjob-site-top');if(header){resize=new ResizeObserver(position);resize.observe(header);}position();filter();
 }
 $(init);$(window).on('action:ajaxify.end',init);window.addEventListener('resize',position,{passive:true});
}());

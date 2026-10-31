'use strict';
/* global app */
(function(){
 const groups={
  'Thường dùng':['😊','❤️','😂','🥰','👍','👏','🙏','🔥','✨','💯','🤝','🎉'],
  'Tâm trạng':['😄','😁','🤣','😉','😍','🥹','🤔','😅','😭','😮','😴','😎'],
  'Động viên':['💪','🙌','🫶','🤗','💙','💚','🌱','🌟','✅','🎯','🚀','🏆'],
  'Ăn mừng':['🥳','🎊','🎈','🎁','🍀','🌸','☕','🧋','🍰','🍻','🌈','💐']
 };
 let current,trigger;
 function close(focus=false){current?.remove();current=null;trigger?.setAttribute('aria-expanded','false');if(focus&&trigger?.isConnected)trigger.focus({preventScroll:true});trigger=null;}
 function open(button){
  if(trigger===button&&current){close();return;}close();
  const root=button.closest('.composer,.vvjob-topic-inline-form');const textarea=root?.querySelector('textarea.write,textarea');if(!textarea||textarea.disabled)return;
  trigger=button;button.setAttribute('aria-expanded','true');
  const panel=document.createElement('section');panel.className='vvjob-emoji-panel';panel.setAttribute('aria-label','Chọn biểu cảm');current=panel;
  const tabs=document.createElement('div');tabs.className='vvjob-emoji-tabs';const grid=document.createElement('div');grid.className='vvjob-emoji-grid';
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='vvjob-emoji-close';dismiss.textContent='×';dismiss.setAttribute('aria-label','Đóng bảng biểu cảm');dismiss.onclick=()=>close(true);
  function show(name){tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===name)));grid.replaceChildren();for(const emoji of groups[name]){const b=document.createElement('button');b.type='button';b.textContent=emoji;b.setAttribute('aria-label','Chèn '+emoji);b.onclick=()=>{textarea.setRangeText(emoji,textarea.selectionStart,textarea.selectionEnd,'end');textarea.dispatchEvent(new Event('input',{bubbles:true}));$(textarea).trigger('change');textarea.focus({preventScroll:true});};grid.append(b)}}
  for(const name of Object.keys(groups)){const b=document.createElement('button');b.type='button';b.textContent=name;b.onclick=()=>show(name);tabs.append(b)}
  panel.append(dismiss,tabs,grid);const target=button.closest('.vvjob-inline-emoji,.formatting-bar');if(!target)return;target.after(panel);show('Thường dùng');
  panel.addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault()});
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-vvjob-emoji]');if(b){e.preventDefault();open(b);}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&current){e.preventDefault();e.stopImmediatePropagation();close(true)}},true);
 $(window).on('action:ajaxify.start',()=>close());
 let queued=false;function hydrate(){queued=false;if(current&&!current.isConnected)close();document.querySelectorAll('.composer .formatting-bar').forEach(bar=>{if(bar.querySelector('[data-vvjob-emoji]'))return;const b=document.createElement('button');b.type='button';b.className='btn btn-sm vvjob-emoji-trigger';b.dataset.vvjobEmoji='';b.setAttribute('aria-label','Chọn biểu cảm');b.setAttribute('aria-expanded','false');b.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 14s1 3 4 3 4-3 4-3M8 9h.01M16 9h.01"/></svg>';bar.append(b)})}
 $(function(){new MutationObserver(changes=>{if(changes.some(c=>c.addedNodes.length)&&!queued){queued=true;requestAnimationFrame(hydrate)}}).observe(document.body,{childList:true,subtree:true});hydrate()});
}());

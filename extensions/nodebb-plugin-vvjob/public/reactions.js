'use strict';
/* global app, ajaxify */
(function(){
 let menu,active,token=0,closeTimer,hoverTimer,pressTimer,startPoint,suppressClick=0,catalog=[];
 const pending=new Set(),loading=new Map();
 function feedback(button,message,error){
  const card=button?.closest('[data-feed-tid],[component="post"]');
  let status=card?.querySelector('.vvjob-share-feedback,.vvjob-react-status');
  if(!status&&card){status=document.createElement('span');status.className='vvjob-react-status';status.setAttribute('role','status');button.after(status);}
  if(status){status.textContent=message;status.classList.toggle('is-error',!!error);}
 }
 function apply(pid,data){
  if(!data)return;
  if(data.choices)catalog=data.choices;
  const selected=data.selected || (data.liked?'like':'');
  const choice=catalog.find(item=>item.type===selected);
  document.querySelectorAll(`[data-vvjob-like="${Number(pid)}"]`).forEach(button=>{
   button.disabled=false;button.dataset.reactionLoaded='1';button.dataset.reactionSelected=selected;
   button.setAttribute('aria-pressed',String(!!selected));button.setAttribute('aria-haspopup','menu');
   button.removeAttribute('title');button.setAttribute('aria-label',choice?.label||'Thích');
   let icon=button.querySelector('[data-reaction-icon],i');
   if(!icon){icon=document.createElement('span');button.prepend(icon);}
   if(selected&&selected!=='like'){const span=document.createElement('span');span.dataset.reactionIcon='';span.className='vvjob-selected-emoji';span.setAttribute('aria-hidden','true');span.textContent=choice?.emoji||data.selectedEmoji||'';icon.replaceWith(span);}
   else {const i=document.createElement('i');i.dataset.reactionIcon='';i.className='fa '+(selected?'fa-heart':'fa-heart-o');i.setAttribute('aria-hidden','true');icon.replaceWith(i);}
   let count=button.querySelector('[data-like-count]');if(!count){count=document.createElement('span');count.dataset.likeCount='';button.append(count);}
   count.textContent=Number(data.total??data.likes)>0?String(data.total??data.likes):'';
  });
 }
 async function read(pid){
  if(!loading.has(pid))loading.set(pid,(async()=>{const api=await app.require('api');return api.get(`/api/vvjob/posts/${pid}/reaction`,{});})().finally(()=>loading.delete(pid)));
  return loading.get(pid);
 }
 function close(focus=false){
  token++;clearTimeout(closeTimer);clearTimeout(hoverTimer);clearTimeout(pressTimer);
  const old=active;active=null;if(menu)menu.hidden=true;
  document.querySelectorAll('[data-vvjob-like][aria-expanded="true"]').forEach(button=>button.setAttribute('aria-expanded','false'));
  if(focus&&old?.isConnected)old.focus();
 }
 function position(){
  if(!active||!menu||menu.hidden)return;
  const bounds=active.getBoundingClientRect(),width=Math.min(350,innerWidth-16);
  menu.style.width=width+'px';const height=menu.offsetHeight;
  menu.style.left=Math.max(8,Math.min(innerWidth-width-8,bounds.left+bounds.width/2-width/2))+'px';
  menu.style.top=Math.max(8,bounds.top>height+12?bounds.top-height-8:Math.min(innerHeight-height-8,bounds.bottom+8))+'px';
 }
 function ensureMenu(){
  if(menu)return;
  menu=document.createElement('div');menu.id='vvjob-reaction-menu';menu.className='vvjob-reaction-menu';menu.hidden=true;menu.setAttribute('role','menu');menu.setAttribute('aria-label','Chọn biểu cảm');document.body.append(menu);
  menu.addEventListener('pointerenter',()=>clearTimeout(closeTimer));menu.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')closeTimer=setTimeout(()=>close(),350)});
  menu.addEventListener('keydown',event=>{const buttons=Array.from(menu.querySelectorAll('button:not(:disabled)'));const index=buttons.indexOf(document.activeElement);if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length]?.focus();}});
 }
 function render(data){
  menu.replaceChildren();const options=document.createElement('div');options.className='vvjob-reaction-options';
  for(const choice of data.choices.filter(c=>['love','like','haha','wow','sad','clap'].includes(c.type)).sort((a,b)=>['love','like','haha','wow','sad','clap'].indexOf(a.type)-['love','like','haha','wow','sad','clap'].indexOf(b.type))){const button=document.createElement('button');button.type='button';button.dataset.reactionChoice=choice.type;button.setAttribute('role','menuitemradio');button.setAttribute('aria-checked',String(data.selected===choice.type));button.setAttribute('aria-label',choice.label);const emoji=document.createElement('span');emoji.className='vvjob-reaction-emoji';emoji.textContent=choice.emoji;emoji.setAttribute('aria-hidden','true');button.append(emoji);options.append(button);}
  menu.append(options);
  if(data.selected){const remove=document.createElement('button');remove.type='button';remove.dataset.reactionChoice='none';remove.className='vvjob-reaction-remove';remove.setAttribute('role','menuitem');remove.setAttribute('aria-label','Gỡ biểu cảm');remove.textContent='×';menu.append(remove);}
 }
 async function open(button,keyboard=false){
  if(!app.user.uid){ajaxify.go('login');return;}
  const pid=Number(button.dataset.vvjobLike);if(!Number.isSafeInteger(pid)||pending.has(pid))return;
  clearTimeout(closeTimer);ensureMenu();active=button;const current=++token;
  button.setAttribute('aria-controls',menu.id);button.setAttribute('aria-expanded','true');
  menu.textContent='Đang tải biểu cảm…';menu.hidden=false;position();
  try{const data=await read(pid);if(current!==token||!button.isConnected)return;apply(pid,data);render(data);position();if(keyboard)menu.querySelector('button')?.focus();}
  catch(error){if(current!==token)return;const translator=await app.require('translator');feedback(button,await translator.translate(error.message||'Chưa tải được biểu cảm. Vui lòng thử lại.'),true);close();}
 }
 $(document).on('click.vvjobEmotion','[data-vvjob-like]',function(event){event.preventDefault();if(Date.now()<suppressClick)return;if(!app.user.uid){ajaxify.go('login');return;}select(this,this.dataset.reactionSelected?'none':'like');});
 $(document).on('mouseenter.vvjobEmotion','[data-vvjob-like]',function(){if(!app.user.uid||!matchMedia('(hover:hover)').matches)return;clearTimeout(closeTimer);clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>open(this),250);});
 $(document).on('mouseleave.vvjobEmotion','[data-vvjob-like]',function(){clearTimeout(hoverTimer);if(active===this)closeTimer=setTimeout(()=>close(),350);});
 $(document).on('pointerdown.vvjobEmotion','[data-vvjob-like]',function(event){if(event.originalEvent.pointerType==='mouse')return;startPoint={x:event.clientX,y:event.clientY};clearTimeout(pressTimer);pressTimer=setTimeout(()=>{suppressClick=Date.now()+700;open(this)},450);});
 $(document).on('pointermove.vvjobEmotion',function(event){if(startPoint&&Math.hypot(event.clientX-startPoint.x,event.clientY-startPoint.y)>10){clearTimeout(pressTimer);startPoint=null;}});
 $(document).on('pointerup.vvjobEmotion pointercancel.vvjobEmotion',()=>{clearTimeout(pressTimer);startPoint=null;});
 $(document).on('contextmenu.vvjobEmotion','[data-vvjob-like]',event=>event.preventDefault());
 async function select(button,type){
  if(!button)return;ensureMenu();const pid=Number(button.dataset.vvjobLike);if(pending.has(pid))return;
  pending.add(pid);menu.querySelectorAll('button').forEach(option=>option.disabled=true);document.querySelectorAll(`[data-vvjob-like="${pid}"]`).forEach(trigger=>trigger.setAttribute('aria-busy','true'));
  try{const api=await app.require('api');const data=await api.put(`/api/vvjob/posts/${pid}/reaction`,{type});apply(pid,data);feedback(button,'',false);close();}
  catch(error){const translator=await app.require('translator');feedback(button,await translator.translate(error.message||'Chưa lưu được biểu cảm. Vui lòng thử lại.'),true);}
  finally{pending.delete(pid);menu?.querySelectorAll('button').forEach(option=>option.disabled=false);document.querySelectorAll(`[data-vvjob-like="${pid}"]`).forEach(trigger=>trigger.removeAttribute('aria-busy'));}
 }
 $(document).on('click.vvjobEmotion','[data-reaction-choice]',function(){select(active,this.getAttribute('aria-checked')==='true'?'none':this.dataset.reactionChoice)});
 $(document).on('click.vvjobEmotionOutside',event=>{if(active&&!event.target.closest('[data-vvjob-like],.vvjob-reaction-menu'))close();});
 $(document).on('keydown.vvjobEmotion',event=>{if(event.key==='Escape'&&active){event.preventDefault();close(true);}});
 window.addEventListener('scroll',position,{passive:true});window.addEventListener('resize',position,{passive:true});
 async function hydrate(root=document,models){
  const supplied=models||[...(ajaxify.data.topics||[]),...(ajaxify.data.ongoing||[])];
  for(const model of supplied){const state=model.reactions||model.socialPost?.reactions;if(state)apply(state.pid||model.pid||model.socialPost.pid,state);}
  const ids=[...new Set(Array.from(root.querySelectorAll('[data-vvjob-like]:not([data-reaction-loaded])')).map(button=>Number(button.dataset.vvjobLike)).filter(Number.isSafeInteger))];
  let cursor=0;await Promise.all(Array.from({length:Math.min(4,ids.length)},async()=>{while(cursor<ids.length){const pid=ids[cursor++];try{apply(pid,await read(pid))}catch{/* Permission errors remain silent until an explicit interaction. */}}}));
 }
 let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;hydrate();});}
 $(window).on('action:ajaxify.end',()=>{close();schedule()});$(document).on('vvjob:reaction',(event,pid,data)=>apply(pid,data));
 $(function(){schedule();const content=document.querySelector('#content');if(content)new MutationObserver(changes=>{if(changes.some(change=>Array.from(change.addedNodes).some(node=>node.nodeType===1&&(node.matches('[data-vvjob-like]')||node.querySelector('[data-vvjob-like]')))))schedule()}).observe(content,{childList:true,subtree:true});});
 window.vvjobReactionUi={apply,hydrate};
}());

'use strict';
/* global config, require, ajaxify */
$(document).on('click.vvpeople','[data-people-follow]',function(){
 const button=this,following=button.dataset.following==='true',uid=Number(button.dataset.peopleFollow);
 if(button.disabled||!Number.isSafeInteger(uid)||uid<=0)return;
 const card=$(button).closest('.vvpeople-card'),feedback=card.find('.vvpeople-feedback');
 button.disabled=true;button.setAttribute('aria-busy','true');feedback.removeClass('text-danger').text('');
 require(['api'],api=>{
  api[following?'del':'put'](`/users/${uid}/follow`,{}).then(()=>{
   button.dataset.following=String(!following);button.setAttribute('aria-pressed',String(!following));
   $(button).toggleClass('is-following',!following).find('i').attr('class',`fa ${following?'fa-plus':'fa-check'}`);
   $(button).find('span').text(following?'Theo dõi':'Đang theo dõi');
   feedback.text(following?'Đã bỏ theo dõi.':'Đã theo dõi.');
   $('[data-people-following-count]').each(function(){this.textContent=Math.max(0,Number(this.textContent)+(following?-1:1))});
   $(button).closest('.vvpeople-card').find('[data-people-follower-count]').each(function(){this.textContent=Math.max(0,Number(this.textContent)+(following?-1:1))});
   if(following&&document.querySelector('.vvpeople-tabs a.active')?.getAttribute('href')?.includes('tab=following')){card.remove();const remaining=document.querySelectorAll('.vvpeople-card');if(!remaining.length){document.querySelector('[data-people-following-empty]')?.removeAttribute('hidden');document.querySelector('[data-people-following-empty] a')?.focus();}}
  }).catch(()=>feedback.addClass('text-danger').text('Chưa thể cập nhật. Vui lòng thử lại.')).finally(()=>{button.disabled=false;button.removeAttribute('aria-busy');});
 });
});

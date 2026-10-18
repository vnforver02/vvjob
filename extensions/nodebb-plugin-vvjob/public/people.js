'use strict';
/* global config, require, ajaxify */
$(document).on('click.vvpeople','[data-people-follow]',function(){
 const button=this,following=button.dataset.following==='true',uid=Number(button.dataset.peopleFollow);
 if(button.disabled||!Number.isSafeInteger(uid)||uid<=0)return;
 const feedback=$(button).closest('.vvpeople-card').find('.vvpeople-feedback');
 button.disabled=true;feedback.removeClass('text-danger').text('');
 require(['api'],api=>{
  api[following?'del':'put'](`/users/${uid}/follow`,{}).then(()=>{
   button.dataset.following=String(!following);button.setAttribute('aria-pressed',String(!following));
   $(button).toggleClass('is-following',!following).find('i').attr('class',`fa ${following?'fa-plus':'fa-check'}`);
   $(button).find('span').text(following?'Theo dõi':'Đang theo dõi');
   feedback.text(following?'Đã bỏ theo dõi.':'Đã theo dõi.');
   $('[data-people-following-count]').each(function(){this.textContent=Math.max(0,Number(this.textContent)+(following?-1:1))});
   $(button).closest('.vvpeople-card').find('[data-people-follower-count]').each(function(){this.textContent=Math.max(0,Number(this.textContent)+(following?-1:1))});
  }).catch(()=>feedback.addClass('text-danger').text('Chưa thể cập nhật. Vui lòng thử lại.')).finally(()=>{button.disabled=false});
 });
});

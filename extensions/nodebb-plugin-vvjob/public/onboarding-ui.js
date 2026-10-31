'use strict';
/* Keep native registration fields, consent values and submit lifecycle intact. */
(function(){
 function labelFor(input,root){
  const nested=input.closest('label');if(nested)return nested;
  const label=[...root.querySelectorAll('label')].find(el=>el.htmlFor===input.id);
  if(!label)return null;
  const row=document.createElement('div');row.append(input,label);return row;
 }
 function compact(){
  const form=document.querySelector('.vvjob-onboarding form[action$="/register/complete"]');if(!form||form.dataset.vvjobCompact)return;
  form.dataset.vvjobCompact='1';
  const data=form.querySelector('input[name="gdpr_agree_data"]'),emailConsent=form.querySelector('input[name="gdpr_agree_email"]');
  const body=data?.closest('.card-body');
  if(body){
   const dataRow=labelFor(data,body),emailRow=emailConsent?labelFor(emailConsent,body):null;
   if(dataRow){
    const details=document.createElement('details');details.className='vvjob-consent-details';
    const summary=document.createElement('summary');summary.textContent='Cách VVJOB xử lý dữ liệu của bạn';details.append(summary);
    dataRow.classList.add('vvjob-consent-choice');emailRow?.classList.add('vvjob-consent-choice');
    dataRow.remove();emailRow?.remove();details.append(...body.childNodes);body.replaceChildren(details,dataRow);if(emailRow)body.append(emailRow);
    data.required=true;if(emailConsent)emailConsent.required=true;
   }
  }
  const email=form.querySelector('input[type="email"],input[name="email"]');
  if(email&&!email.required&&email.getAttribute('aria-required')!=='true'){const card=email.closest('.card-body');if(card){
   const details=document.createElement('details');details.className='vvjob-optional-email';details.open=!!email.value;
   const summary=document.createElement('summary');summary.textContent='Thêm email khôi phục (tùy chọn)';details.append(summary,...card.childNodes);card.append(details);
  }}
 }
 $(compact);$(window).on('action:ajaxify.end action:app.load',compact);
}());

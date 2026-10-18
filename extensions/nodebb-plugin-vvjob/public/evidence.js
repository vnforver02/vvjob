'use strict';
/* global config, ajaxify, require */
(function(){
 async function submit(form,path,payload,multipart=false){const buttons=$(form).find('button'),feedback=$(form).find('.vvjob-career-feedback');buttons.prop('disabled',true);feedback.removeClass('text-danger').text('Đang xử lý…');try{const response=await fetch(`${config.relative_path||''}/api/vvjob/evidence/${path}`,{method:'POST',credentials:'same-origin',headers:{'x-csrf-token':config.csrf_token,...(multipart?{}:{'Content-Type':'application/json'})},body:multipart?payload:JSON.stringify(payload)});let result;try{result=await response.json()}catch{throw Error('Không thể xử lý. Vui lòng tải lại trang và thử lại.')}if(!response.ok)throw Error(result.error||'Không thể xử lý hồ sơ.');if(path==='review'){if(result.status!==payload.decision)throw Error('Trạng thái hồ sơ đã thay đổi. Vui lòng tải lại trang.');const message={approved:'Đã phê duyệt hồ sơ và xóa bản ảnh.',rejected:'Đã từ chối hồ sơ và xóa bản ảnh.','needs-more':'Đã yêu cầu bổ sung giấy tờ và xóa bản ảnh cũ.'}[result.status];require(['alerts'],alerts=>alerts.success(message))}ajaxify.refresh()}catch(e){feedback.addClass('text-danger').text(e.message)}finally{buttons.prop('disabled',false)}}
 $(document).on('submit.vvjobEvidence','[data-evidence-submit]',function(e){e.preventDefault();const files=this.elements.documents.files;if(files.length<1||files.length>2||Array.from(files).some(f=>f.size>4*1024*1024)){return $(this).find('.vvjob-career-feedback').addClass('text-danger').text('Chọn 1–2 ảnh JPG/PNG, tối đa 4 MB mỗi ảnh.')}const body=new FormData(this);body.set('consent',String(this.elements.consent.checked));submit(this,'submit',body,true)});
 $(document).on('submit.vvjobEvidence','[data-evidence-withdraw]',function(e){e.preventDefault();submit(this,'withdraw',{})});
 $(document).on('submit.vvjobEvidence','[data-evidence-review]',function(e){
  e.preventDefault();
  const decision=(e.originalEvent?.submitter||e.submitter)?.value;
  const feedback=$(this).find('.vvjob-career-feedback');
  if(!['approved','needs-more','rejected'].includes(decision)){feedback.addClass('text-danger').text('Vui lòng chọn Phê duyệt, Yêu cầu bổ sung hoặc Từ chối.');return}
  const reason=this.elements.reason.value;
  if(decision!=='approved'&&!reason){feedback.addClass('text-danger').text('Vui lòng chọn lý do yêu cầu bổ sung hoặc từ chối.');return}
  submit(this,'review',{uid:this.dataset.uid,id:this.dataset.id,decision,reason,checked:this.elements.checked.checked});
 });
 $(document).on('submit.vvjobEvidence','[data-evidence-revoke]',function(e){e.preventDefault();submit(this,'revoke',{uid:this.elements.uid.value})});
})();

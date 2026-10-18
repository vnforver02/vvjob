'use strict';
const crypto = require('node:crypto');
const TYPES = { employment: 'Giấy xác nhận công tác', contract: 'Hợp đồng lao động', social: 'Quá trình tham gia BHXH / VssID' };
const REASONS = { unclear: 'Ảnh chưa rõ hoặc thiếu thông tin cần đối chiếu.', mismatch: 'Thông tin trên giấy tờ chưa khớp với hồ sơ và công ty đã chọn.', insufficient: 'Chưa đủ căn cứ để đối chiếu trải nghiệm tại công ty.', accepted: 'Đã đối chiếu giấy tờ công tác. Không xác nhận chức danh hoặc tình trạng đang làm việc.' };
const DAY = 86400000;
function fail(message) { const e = Error(message); e.expose = true; throw e; }
module.exports = function ({ db, directory, secret, withLock, processImage, now = Date.now }) {
  const ready = typeof secret === 'string' && secret.length >= 16 && !!db.pool?.options;
  const key = ready ? crypto.createHash('sha256').update(`vvjob-private-evidence-v1:${secret}`).digest() : null;
  const version = key ? crypto.createHash('sha256').update(key).digest('hex').slice(0,16) : '';
  const stateKey = uid => `vvjob:evidence:user:${uid}`, fileKey = id => `vvjob:evidence:file:${id}`;
  const uidOf = value => { const uid = Number(value); if (!Number.isSafeInteger(uid) || uid <= 0) fail('Vui lòng đăng nhập lại.'); return uid; };
  const seal = (buffer, id) => { const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', key, iv); cipher.setAAD(Buffer.from(id)); return { iv: iv.toString('base64'), tag: '', data: Buffer.concat([cipher.update(buffer),cipher.final()]).toString('base64'), getTag: () => cipher.getAuthTag().toString('base64') }; };
  async function context(uid, ensureBinding = false) { return require('./career-context')(db, directory, uid, ensureBinding); }
  async function clearFiles(row) { for (const id of String(row?.files || '').split(',').filter(Boolean)) await db.delete(fileKey(id)); }
  async function audit(uid, actor, action) { const id = crypto.randomBytes(16).toString('hex'); await db.setObject(`vvjob:evidence:audit:${id}`,{uid,actor,action,at:now()}); await db.expire(`vvjob:evidence:audit:${id}`,365*86400); await db.sortedSetAdd('vvjob:evidence:audit',now(),id); }
  async function valid(uid) { const row = await db.getObject(stateKey(uid)), {career,company} = await context(uid); return !!(row && row.status === 'approved' && row.version === version && Number(row.expiresAt) > now() && company && company.id === row.companyId && career.companyBinding === row.binding); }
  async function status(uid) {
    uid = uidOf(uid); const row = await db.getObject(stateKey(uid)), {company,career} = await context(uid);
    let state = row?.status || 'none';
    if (state === 'approved' && !await valid(uid)) state = 'invalidated';
    if (['pending','needs-more'].includes(state) && (Number(row.fileExpiresAt) <= now() || row.version !== version || company?.id !== row.companyId || career.companyBinding !== row.binding)) state = 'expired';
    return { status:state, available:ready, companyId:company?.id || '', companyName:company?.name || '', id:row?.id || '', typeLabel:TYPES[row?.type] || '', reason:REASONS[row?.reason] || '', submittedAt:Number(row?.submittedAt)||0, reviewedAt:Number(row?.reviewedAt)||0, evidenceDate:row?.evidenceDate || '', expiresAt:state === 'approved' ? Number(row.expiresAt) : 0 };
  }
  async function submit(uid,input,files) {
    uid = uidOf(uid); if (!ready) fail('Tiếp nhận giấy tờ hiện chưa khả dụng.');
    if (input.consent !== 'true' || !TYPES[input.type]) fail('Vui lòng chọn loại giấy tờ và đồng ý xử lý riêng tư.');
    if (!/^\d{4}-\d\d-\d\d$/.test(input.evidenceDate || '') || !Number.isFinite(Date.parse(input.evidenceDate)) || new Date(input.evidenceDate).toISOString().slice(0,10) !== input.evidenceDate || Date.parse(input.evidenceDate) > now() || Date.parse(input.evidenceDate) < now()-30*365*DAY) fail('Ngày trên giấy tờ không hợp lệ.');
    if (!Array.isArray(files) || files.length < 1 || files.length > 2 || files.some(f=>!Buffer.isBuffer(f.buffer) || f.buffer.length > 4*1024*1024)) fail('Chọn 1–2 ảnh JPG/PNG, tối đa 4 MB mỗi ảnh.');
    // Reserve quota before decoding images; do not hold the database lock during decoding.
    const binding = await withLock(async()=>{
      if (await db.getObject(`vvjob:evidence:deleted:${uid}`)) fail('Tài khoản không còn khả dụng.');
      const {career,company}=await context(uid, true); if (!company || !career.companyBinding) fail('Vui lòng chọn và lưu công ty trước.');
      const old=await db.getObject(stateKey(uid)); if (old?.status === 'pending' && Number(old.fileExpiresAt)>now()) fail('Đang chờ duyệt. Hãy hủy hồ sơ cũ nếu cần gửi lại.');
      const quota=`vvjob:evidence:quota:${uid}:${Math.floor(now()/DAY)}`; const count=Number(await db.incrObjectField(quota,'count'));await db.expire(quota,172800);if(count>3)fail('Tối đa 3 lượt gửi mỗi ngày. Vui lòng thử lại sau.');
      return {companyId:company.id,companyName:company.name,binding:career.companyBinding};
    });
    const images=[];for(const file of files){try{images.push(await processImage(file.buffer))}catch{fail('Ảnh không hợp lệ. Chỉ nhận ảnh JPG/PNG rõ nét; không nhận PDF hoặc ảnh động.')}}
    return withLock(async()=>{
      const {career,company}=await context(uid);if(await db.getObject(`vvjob:evidence:deleted:${uid}`)||company?.id!==binding.companyId||career.companyBinding!==binding.binding)fail('Thông tin công ty đã thay đổi. Vui lòng thử lại.');
      const old=await db.getObject(stateKey(uid));if(old?.status==='pending'&&Number(old.fileExpiresAt)>now())fail('Đã có hồ sơ đang chờ duyệt.');
      await clearFiles(old);const id=crypto.randomBytes(16).toString('hex'), ids=[];
      for(const image of images){const fileId=crypto.randomBytes(16).toString('hex');const sealed=seal(image,fileId);await db.setObject(fileKey(fileId),{iv:sealed.iv,tag:sealed.getTag(),data:sealed.data,uid,applicationId:id,version,expiresAt:now()+7*DAY});await db.expire(fileKey(fileId),7*86400);ids.push(fileId)}
      await db.delete(stateKey(uid));await db.setObject(stateKey(uid),{id,uid,...binding,type:input.type,evidenceDate:input.evidenceDate,version,status:'pending',files:ids.join(','),fileExpiresAt:now()+7*DAY,submittedAt:now(),expiresAt:0});await db.expire(stateKey(uid),190*86400);await db.sortedSetAdd('vvjob:evidence:queue',now(),uid);await audit(uid,uid,'submitted');return status(uid);
    });
  }
  async function review(actor,input){actor=uidOf(actor);const uid=uidOf(input.uid);if(actor===uid)fail('Không thể tự duyệt hồ sơ của mình.');if(!['approved','rejected','needs-more'].includes(input.decision)||input.checked!==true)fail('Vui lòng xác nhận đã đối chiếu giấy tờ.');if(input.decision!=='approved'&&!['unclear','mismatch','insufficient'].includes(input.reason))fail('Vui lòng chọn lý do.');
    return withLock(async()=>{const row=await db.getObject(stateKey(uid));if(!row||row.id!==input.id||(await status(uid)).status!=='pending')fail('Hồ sơ không còn chờ duyệt. Hãy tải lại danh sách.');
      if(input.decision==='approved'){for(const fileId of String(row.files||'').split(',').filter(Boolean)){const blob=await db.getObject(fileKey(fileId));if(!blob||blob.applicationId!==row.id||Number(blob.viewedBy)!==actor||Number(blob.expiresAt)<=now())fail('Vui lòng mở và đối chiếu đầy đủ ảnh trước khi duyệt.')}if(!row.files)fail('Không còn bản ảnh để đối chiếu.')}
      // Remove originals before publishing a decision; a deletion failure cannot grant a proof.
      await clearFiles(row);await db.setObject(stateKey(uid),{status:input.decision,reason:input.decision==='approved'?'accepted':input.reason,files:'',reviewedAt:now(),reviewedBy:actor,expiresAt:input.decision==='approved'?now()+180*DAY:0});await db.sortedSetRemove('vvjob:evidence:queue',uid);await audit(uid,actor,input.decision);return status(uid)});
  }
  async function remove(uid,actor=uid,deleted=false){uid=uidOf(uid);if(!ready){await clearFiles(await db.getObject(stateKey(uid)));await db.delete(stateKey(uid));return{status:'none'}}return withLock(async()=>{if(deleted){await db.setObject(`vvjob:evidence:deleted:${uid}`,{deleted:1});await db.expire(`vvjob:evidence:deleted:${uid}`,190*86400)}await clearFiles(await db.getObject(stateKey(uid)));await db.delete(stateKey(uid));await db.sortedSetRemove('vvjob:evidence:queue',uid);await audit(uid,actor,Number(actor)===uid?'withdrawn':'revoked');return{status:'none'}})}
  async function queue(){const uids=await db.getSortedSetRevRange('vvjob:evidence:queue',0,49);const rows=[];for(const uid of uids){const row=await db.getObject(stateKey(uid));const view=await status(uid);if(row&&view.status==='pending')rows.push({...view,uid:Number(uid),companyName:row.companyName,fileCount:String(row.files).split(',').filter(Boolean).length});else await db.sortedSetRemove('vvjob:evidence:queue',uid)}return rows}
  async function file(actor,uid,id,index){uid=uidOf(uid);return withLock(async()=>{const row=await db.getObject(stateKey(uid));if(!row||row.id!==id||(await status(uid)).status!=='pending'||![0,1].includes(index))fail('Giấy tờ không còn khả dụng.');const fileId=String(row.files).split(',')[index],blob=fileId&&await db.getObject(fileKey(fileId));if(!blob||blob.version!==version||Number(blob.expiresAt)<=now()||Number(blob.uid)!==uid||blob.applicationId!==id)fail('Giấy tờ đã hết hạn.');const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(blob.iv,'base64'));decipher.setAAD(Buffer.from(fileId));decipher.setAuthTag(Buffer.from(blob.tag,'base64'));const data=Buffer.concat([decipher.update(Buffer.from(blob.data,'base64')),decipher.final()]);await db.setObjectField(fileKey(fileId),'viewedBy',actor);await audit(uid,actor,'document-viewed');return data})}
  return {status,submit,review,remove,queue,file,valid};
};
module.exports.TYPES=TYPES;

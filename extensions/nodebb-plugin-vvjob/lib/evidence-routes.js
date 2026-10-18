'use strict';
module.exports = function(host,directory,getConfig,Pool,load){
 const db=host('database'), safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const service=require('./evidence')({db,directory,secret:getConfig('secret'),withLock:require('./verification-lock')(db,Pool),processImage:async buffer=>{
  const jpeg=buffer[0]===255&&buffer[1]===216&&buffer[2]===255,png=buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));if(!jpeg&&!png)throw Error('Unsupported file');
  const sharp=load('sharp'),image=sharp(buffer,{limitInputPixels:16000000,failOn:'error'}),meta=await image.metadata();if(!['jpeg','png'].includes(meta.format)||(meta.pages||1)!==1)throw Error('Unsupported image');const result=await image.rotate().resize({width:2500,height:2500,fit:'inside',withoutEnlargement:true}).jpeg({quality:85}).toBuffer();if(result.length>2*1024*1024)throw Error('Image too large');return result;
 }});
 const json=fn=>async(req,res)=>{res.set('Cache-Control','no-store');try{res.json(await fn(req))}catch(e){res.status(e.expose?400:503).json({error:e.expose?e.message:'Không thể xử lý giấy tờ lúc này. Vui lòng thử lại sau.'})}};
 const labels={none:'Chưa gửi giấy tờ',pending:'Đang chờ duyệt',approved:'Đã đối chiếu giấy tờ công tác','needs-more':'Cần bổ sung giấy tờ',rejected:'Chưa được duyệt',expired:'Hồ sơ đã hết hạn',invalidated:'Cần xác minh lại'};
 let uploads=0;
 return {service,
  uploadSlot(req,res,next){if(uploads>=4)return res.status(429).json({error:'Hệ thống đang bận. Vui lòng thử lại sau.'});uploads++;let done=false;const release=()=>{if(!done){done=true;uploads--}};res.once('finish',release);res.once('close',release);next()},
  upload(req,res,next){const multer=load('multer');multer({storage:multer.memoryStorage(),limits:{fileSize:4*1024*1024,files:2,fields:3,fieldSize:100,parts:5}}).array('documents',2)(req,res,err=>{if(err)return res.status(400).json({error:'Chỉ nhận 1–2 ảnh JPG/PNG, tối đa 4 MB mỗi ảnh.'});next()})},
  submit:json(req=>service.submit(req.uid,req.body,req.files)),withdraw:json(req=>service.remove(req.uid)),review:json(req=>service.review(req.uid,req.body)),revoke:json(req=>service.remove(req.body.uid,req.uid)),
  async page(req,res){res.set('Cache-Control','no-store');const state=await service.status(req.uid);res.render('vvjob-evidence',{title:'Giấy tờ chứng minh công việc — VVJOB',evidence:Object.fromEntries(Object.entries(state).map(([k,v])=>[k,typeof v==='string'?safe(v):v])),statusLabel:labels[state.status],canSubmit:state.available&&!!state.companyId&&state.status!=='pending',canWithdraw:state.status!=='none',pending:state.status==='pending',approved:state.status==='approved'})},
  async adminPage(req,res){res.set('Cache-Control','no-store');const rows=await service.queue();res.render('vvjob-evidence-admin',{title:'Duyệt giấy tờ công tác — VVJOB',applications:rows.map(row=>({...Object.fromEntries(Object.entries(row).map(([k,v])=>[k,typeof v==='string'?safe(v):v])),files:Array.from({length:row.fileCount},(_,index)=>({index,uid:row.uid,id:row.id,label:index+1}))}))})},
  async file(req,res){res.set({'Cache-Control':'private, no-store, max-age=0','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"});try{const data=await service.file(req.uid,req.params.uid,req.params.id,Number(req.params.index));res.type('image/jpeg').set('Content-Disposition','inline; filename="private-evidence.jpg"').send(data)}catch{res.status(404).send('Không tìm thấy giấy tờ.')}}
 };
};

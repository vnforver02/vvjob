'use strict';
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.vvjobPostTitle=factory();})(typeof window==='undefined'?globalThis:window,function(){
 return function(content,min=3,max=200){
  min=Math.max(1,Number(min)||3);max=Math.max(min,Number(max)||200);
  const text=String(content||'').replace(/!\[[^\]]*\]\([^)]*\)/g,' ').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/https?:\/\/\S+/g,' ').replace(/<[^>]*>/g,' ').replace(/[*_~`#>]/g,'').split(/\r?\n/).map(s=>s.trim()).find(Boolean)||'Chia sẻ cùng cộng đồng';
  let title=text.replace(/\s+/g,' ').trim();if(title.length<min)title='Chia sẻ · '+title;
  while(title.length<min)title+=' · Chia sẻ cùng cộng đồng';
  title=title.slice(0,max).replace(/[\uD800-\uDBFF]$/,'');return title;
 };
});

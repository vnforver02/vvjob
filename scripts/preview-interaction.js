'use strict';
// Isolated design preview: synthetic records in browser memory, no NodeBB/database access.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const avatars=require('../extensions/nodebb-plugin-vvjob/lib/demo-users');
const root=path.resolve(__dirname,'../preview/interaction');
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(/^\/avatar\/\d+\.svg$/.test(url.pathname)){res.setHeader('Content-Type','image/svg+xml');res.end(avatars.avatar(Number(url.pathname.match(/\d+/)[0])));return;}
 const file={'/':'index.html','/style.css':'style.css','/app.js':'app.js'}[url.pathname];
 if(!file){res.writeHead(404);res.end('Not found');return;}
 res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,file)));
}).listen(4175,'127.0.0.1',()=>console.log('VVJOB interaction preview: http://127.0.0.1:4175'));

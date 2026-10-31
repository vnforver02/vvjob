'use strict';
// Loopback-only HTTPS wrapper for a tunneled review clone. Never expose publicly.
const https=require('node:https'),http=require('node:http'),net=require('node:net'),fs=require('node:fs');
const port=Number(process.env.VVJOB_REVIEW_TLS_PORT||14632),target=Number(process.env.VVJOB_REVIEW_HTTP_PORT||14631);
const key=fs.readFileSync(process.env.VVJOB_REVIEW_TLS_KEY),cert=fs.readFileSync(process.env.VVJOB_REVIEW_TLS_CERT);
const headers=req=>({...req.headers,'x-forwarded-proto':'https','x-forwarded-host':`127.0.0.1:${port}`,'x-forwarded-for':'127.0.0.1'});
const server=https.createServer({key,cert},(req,res)=>{const upstream=http.request({hostname:'127.0.0.1',port:target,path:req.url,method:req.method,headers:headers(req)},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)});upstream.on('error',()=>{res.writeHead(502);res.end('Review tunnel unavailable')});req.pipe(upstream);});
server.on('upgrade',(req,socket,head)=>{const up=net.connect(target,'127.0.0.1',()=>{up.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`+Object.entries(headers(req)).map(([k,v])=>`${k}: ${v}`).join('\r\n')+'\r\n\r\n');if(head.length)up.write(head);socket.pipe(up);up.pipe(socket)});up.on('error',()=>socket.destroy());socket.on('error',()=>up.destroy());});
server.listen(port,'127.0.0.1',()=>process.stdout.write(`Review HTTPS on loopback:${port}\n`));

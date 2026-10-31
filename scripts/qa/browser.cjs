'use strict';
const {chromium}=require(process.env.VVJOB_PLAYWRIGHT||'playwright-core');
exports.launch=async function(base){
 const local=new URL(base).hostname==='127.0.0.1';
 const server=await chromium.launchServer({host:'127.0.0.1',executablePath:process.env.VVJOB_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:local?['--ignore-certificate-errors']:[]});
 process.once('exit',()=>{if(server.process().exitCode===null)server.process().kill('SIGKILL');});
 const browser=await chromium.connect(server.wsEndpoint());
 return{browser,async close(){let timer;try{await Promise.race([browser.close(),new Promise(resolve=>{timer=setTimeout(resolve,2000)})]);clearTimeout(timer);await Promise.race([server.close(),new Promise(resolve=>{timer=setTimeout(resolve,5000)})]);}finally{clearTimeout(timer);if(server.process().exitCode===null)server.process().kill('SIGKILL');}}};
};

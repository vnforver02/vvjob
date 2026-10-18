#!/www/server/panel/pyenv/bin/python3
"""Renew only the VVJOB certificate; no other domains or services are edited."""
import os,sys,pathlib,subprocess,fcntl,contextlib
lock=open('/run/vvjob-tls-renew.lock','w');fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
os.umask(0o077)
certdir=pathlib.Path('/www/server/panel/vhost/cert/bbs.cloudverify.vn');cert=certdir/'fullchain.pem';key=certdir/'privkey.pem'
if subprocess.run(['openssl','x509','-in',str(cert),'-checkend',str(30*86400),'-noout'],stdout=subprocess.DEVNULL).returncode==0:
 print('VVJOB TLS: certificate remains valid beyond 30 days');raise SystemExit(0)
os.chdir('/www/server/panel');sys.path[:0]=['/www/server/panel','/www/server/panel/class']
from acme_v2 import acme_v2
result=acme_v2().apply_cert(['bbs.cloudverify.vn'],'http','/www/wwwroot/bbs.cloudverify.vn')
if not result.get('status'):
 print('VVJOB TLS: renewal failed; inspect private aaPanel ACME log');raise SystemExit(1)
pem=result['cert']+result['root'];subprocess.run(['openssl','x509','-checkhost','bbs.cloudverify.vn','-noout'],input=pem.encode(),stdout=subprocess.DEVNULL,check=True)
oldcert,oldkey=cert.read_bytes(),key.read_bytes()
try:
 for target,content in [(key,result['private_key'].encode()),(cert,pem.encode())]:
  tmp=target.with_suffix('.next');tmp.write_bytes(content);tmp.chmod(0o600);os.replace(tmp,target)
 subprocess.run(['/www/server/nginx/sbin/nginx','-t'],check=True)
 subprocess.run(['/www/server/nginx/sbin/nginx','-s','reload'],check=True)
 print('VVJOB TLS: renewed and reloaded successfully')
except BaseException:
 cert.write_bytes(oldcert);key.write_bytes(oldkey);cert.chmod(0o600);key.chmod(0o600);raise

#!/usr/bin/env python3
"""Collect factual company references and bounded logo checks from public VNR500 pages.
No employee/contact data, descriptions, rankings or authentication are imported.
Run manually; output is reviewed before the separate native database import.
"""
import argparse, concurrent.futures, datetime, hashlib, html, json, re, time, urllib.request, urllib.parse
from pathlib import Path
BASE='https://vnr500.vn'
UA='VVJOB-CompanyDirectory/1.0 (public company references; bounded manual sync)'
TODAY=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
CACHE=Path('/tmp/vvjob-company-source-cache');CACHE.mkdir(exist_ok=True)
def fetch(url,limit=2000000):
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'text/html,application/json,image/*;q=0.8'})
 with urllib.request.urlopen(req,timeout=20) as r:
  data=r.read(limit+1)
  if len(data)>limit:raise ValueError('response too large')
  return data,r.headers.get('Content-Type',''),r.geturl()
def page(url):
 p=CACHE/(hashlib.sha256(url.encode()).hexdigest()+'.html')
 if p.exists():return p.read_text()
 data,_,_=fetch(url);s=data.decode('utf-8-sig');p.write_text(s);time.sleep(.15);return s
def clean(s):return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',s))).strip()
def extract(s,pattern,default=''):
 m=re.search(pattern,s,re.I|re.S);return html.unescape(m.group(1)).strip() if m else default
def normal(s):
 import unicodedata
 return ''.join(c for c in unicodedata.normalize('NFD',s.lower().replace('đ','d')) if unicodedata.category(c)!='Mn')
def profile(row):
 try:
  s=page(row['source'])
  blocks=re.findall(r'<div class="info-label">(.*?)</div>\s*<div class="info-value">(.*?)</div>',s,re.S)
  facts={clean(k).rstrip(':'):v for k,v in blocks}
  web=extract(facts.get('Website',''),r'href=["\']([^"\']+)')
  if web and not re.match(r'^https?://',web):web='https://'+web
  if web:
   p=urllib.parse.urlsplit(web);host=p.hostname or ''
   if not re.fullmatch(r'[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',host) or p.username or p.password or p.port:web=''
   else:web=urllib.parse.urlunsplit(('https',host,p.path or '/',p.query,''))
  row['website']=web
  row['aliases']=clean(facts.get('Tên tiếng Anh',''))[:250]
  ticker=clean(facts.get('Mã chứng khoán',''))
  if re.fullmatch('[A-Z]{3,5}',ticker):row['aliases']=('; '.join(filter(None,[row['aliases'],ticker])))[:300]
  row['taxId']=clean(facts.get('Mã số thuế',''))
  # No addresses, emails, phone numbers, executives or descriptions are retained.
  row['profileFetchedAt']=TODAY
 except Exception as e:row['profileError']=type(e).__name__;row['website']='';row['aliases']=''
 try:
  if re.search('default|placeholder',row['logoCandidateUrl'],re.I):raise ValueError('generic placeholder')
  data,mime,final=fetch(row['logoCandidateUrl'],1000000)
  if not (data.startswith(b'\x89PNG\r\n\x1a\n') or data.startswith(b'\xff\xd8\xff') or data.startswith((b'GIF87a',b'GIF89a')) or (data[:4]==b'RIFF' and data[8:12]==b'WEBP')):raise ValueError('not a raster logo')
  if len(data)<150:raise ValueError('empty logo')
  if urllib.parse.urlsplit(final).hostname!='cms.vietnamreport.net':raise ValueError('unexpected image host')
  row.update(logoUrl=row['logoCandidateUrl'],logoSource=row['source'],logoSha256=hashlib.sha256(data).hexdigest(),logoBytes=len(data),logoCheckedAt=TODAY)
 except Exception as e:row['logoError']=type(e).__name__
 return row

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--output',default='artifacts/company-source-sync.json');ap.add_argument('--year',type=int,default=2025);ap.add_argument('--exclude',help='Previously collected JSON; skip known source IDs');args=ap.parse_args()
 exclude={r['sourceId'] for r in json.loads(Path(args.exclude).read_text())} if args.exclude else set()
 rows={}
 for chart in [1,2]:
  for number in range(1,6):
   url=BASE+'/Charts/SearchBusiness?'+urllib.parse.urlencode({'Year':args.year,'ChartId':chart,'PageSize':100,'PageNumber':number})
   d=json.loads(page(url))['Result'];items=d['Data'].split('<div class="data-item rank-item">')[1:]
   assert len(items)==100,(chart,number,len(items))
   for item in items:
    source=extract(item,r'<a href="([^"#]+)" class="title">');name=clean(extract(item,r'class="title">(.*?)</a>'))
    sid=extract(source,r'-Chart--(\d+)-\d{4}\.html')
    logo=extract(item,r'<img src="([^"]+)')
    if sid and sid not in exclude and name and logo.startswith('https://cms.vietnamreport.net/'):
     rows.setdefault(sid,{'id':'vnr-'+sid,'sourceId':sid,'name':name,'source':urllib.parse.urljoin(BASE,source),'sourceName':'Vietnam Report','sourceYear':str(args.year),'checkedAt':TODAY,'industry':'','logoCandidateUrl':logo,'logoCandidateSource':urllib.parse.urljoin(BASE,source)})
   print('ranking page',chart,number,'unique',len(rows),flush=True)
   time.sleep(.3)
 out=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  for row in pool.map(profile,rows.values()):
   out.append(row)
   if len(out)%25==0:print('profiles/logos',len(out),'valid logos',sum(bool(r.get('logoUrl')) for r in out),flush=True)
   if len(out)%50==0:Path(args.output).parent.mkdir(parents=True,exist_ok=True);Path(args.output).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 Path(args.output).parent.mkdir(parents=True,exist_ok=True);Path(args.output).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'companies':len(out),'logos':sum(bool(r.get('logoUrl')) for r in out),'websites':sum(bool(r.get('website')) for r in out)},ensure_ascii=False),flush=True)
if __name__=='__main__':main()

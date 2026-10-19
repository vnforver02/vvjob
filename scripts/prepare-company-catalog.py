#!/usr/bin/env python3
"""Prepare a deduplicated factual catalog from bounded source collections."""
import argparse,collections,hashlib,json,re,unicodedata
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('inputs',nargs='+');ap.add_argument('--output',default='extensions/nodebb-plugin-vvjob/data/companies-vnr500.js');args=ap.parse_args()
# These are the same legal entities as existing VVJOB seed IDs. Subsidiaries
# sharing the same website are NOT merged by domain.
legacy={'78':'hoa-phat','4':'vietcombank','4824':'masan','34':'fpt','3419':'vnpt','11':'acb'}
rows=[];ids=set();taxes=set();names=set();discarded=collections.Counter()
fold=lambda s:''.join(c for c in unicodedata.normalize('NFD',s.lower().replace('đ','d')) if unicodedata.category(c)!='Mn')
taxonomy=json.loads(Path('extensions/nodebb-plugin-vvjob/data/career-taxonomy.json').read_text())
for file in args.inputs:
 for raw in json.loads(Path(file).read_text()):
  if raw['sourceId'] in ids:discarded['duplicate_source']+=1;continue
  tax=re.sub(r'\D','',raw.get('taxId',''))
  name=raw['name'];key=fold(name)
  if (tax and tax in taxes) or key in names:discarded['duplicate_entity']+=1;continue
  if 'profileFetchedAt' not in raw or len(name)>140:discarded['unreadable_profile_or_long_name']+=1;continue
  ids.add(raw['sourceId']);names.add(key)
  if tax:taxes.add(tax)
  row={k:raw.get(k,'') for k in ['id','sourceId','name','aliases','website','source','sourceName','sourceYear','checkedAt','taxId']}
  row['id']=legacy.get(row['sourceId'],row['id']);row['industry']='';row['city']=''
  # Normalize only broad factual categories and municipality; never store an
  # executive, phone/email, complete address or source description.
  cache=Path('/tmp/vvjob-company-source-cache')/(hashlib.sha256(raw['source'].encode()).hexdigest()+'.html')
  if cache.exists():
   import html
   clean=lambda s:re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',s))).strip()
   facts={clean(k).rstrip(':'):clean(v) for k,v in re.findall(r'<div class="info-label">(.*?)</div>\s*<div class="info-value">(.*?)</div>',cache.read_text(),re.S)}
   address=fold(facts.get('Trụ sở chính',''))
   for city in taxonomy['cities']:
    if any(re.search(r'(?<!\w)'+re.escape(fold(alias.strip()))+r'(?!\w)',address) for alias in [city['label']]+city['aliases'].split(';') if len(alias.strip())>3):row['city']=city['label'];row['cityId']=city['id'];break
   sector=fold(facts.get('Ngành nghề',''))
   rules=[('banking','ngan hang'),('insurance','bao hiem'),('finance','tai chinh|chung khoan'),('technology','cong nghe thong tin|phan mem'),('telecom','vien thong'),('real-estate','bat dong san'),('construction','xay dung'),('logistics','van tai|kho bai|logistics'),('retail','ban le'),('education','giao duc'),('healthcare','y te|duoc'),('manufacturing','san xuat|che bien|gia cong')]
   for id,pattern in rules:
    match=next((x for x in taxonomy['industries'] if x['id']==id),None)
    if match and re.search(pattern,sector):row['industry']=match['label'];row['industryId']=id;break
  logo=raw.get('logoUrl','')
  if logo and not re.search('default|placeholder',logo,re.I) and raw.get('logoSha256')!='570c7723f3a57a1f4ffcba5a2419a172732c002898ecad6ee8b97103b8bd827d':
   row.update({k:raw[k] for k in ['logoUrl','logoSource','logoSha256','logoBytes','logoCheckedAt']})
  rows.append(row)
rows.sort(key=lambda x:fold(x['name']))
report={'companies':len(rows),'logos':sum(bool(r.get('logoUrl')) for r in rows),'websites':sum(bool(r['website']) for r in rows),'cities':sum(bool(r['city']) for r in rows),'industries':sum(bool(r['industry']) for r in rows),'discarded':dict(discarded)}
print(json.dumps(report,ensure_ascii=False))
assert report['companies']>=500 and report['logos']>=500,'Need at least 500 distinct company records and 500 non-placeholder logo references'
destination=Path(args.output)
if destination.suffix=='.js':
 for previous in destination.parent.glob('companies-vnr500-part-*.json'):previous.unlink()
 imports=[]
 for index,start in enumerate(range(0,len(rows),50),1):
  name='companies-vnr500-part-'+str(index)+'.json'
  (destination.parent/name).write_text(json.dumps(rows[start:start+50],ensure_ascii=False,indent=2)+'\n')
  imports.append(" ...require('./"+name+"'),")
 destination.write_text("'use strict';\n// Public factual references; collected manually. See docs/COMPANY_SYNC.md.\nmodule.exports = [\n"+'\n'.join(imports)+"\n];\n")
else:destination.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')

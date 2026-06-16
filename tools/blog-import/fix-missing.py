#!/usr/bin/env python3
import json, re, subprocess, datetime, time, sys

TOKEN = open('/tmp/tok.txt').read().strip()
HOST = 'https://author-p184787-e1941711.adobeaemcloud.com'
MON = {m.lower(): i for i, m in enumerate(
    ['January','February','March','April','May','June','July','August','September','October','November','December'], 1)}
DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
MONABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

def get(path):
    r = subprocess.run(['curl','-s','--max-time','40','-H',f'Authorization: Bearer {TOKEN}', HOST+path],
                       capture_output=True, text=True)
    try: return json.loads(r.stdout)
    except Exception: return None

def find_hero(node):
    if not isinstance(node, dict): return None
    if node.get('model') == 'hero': return node
    for v in node.values():
        if isinstance(v, dict):
            h = find_hero(v)
            if h: return h
    return None

def parse_date(desc):
    if not desc: return None
    txt = re.sub('<[^>]+>', ' ', desc).replace(' ', ' ')
    m = re.search(r'(\d{1,2})\s*(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})', txt)
    if not m: return None
    day=int(m.group(1)); mon=MON.get(m.group(2).lower()); year=int(m.group(3))
    if not mon: return None
    try: d=datetime.date(year,mon,day)
    except ValueError: return None
    return f'{DOW[d.weekday()]} {MONABBR[mon-1]} {day:02d} {year} 00:00:00 GMT+0000'

def post(path, props):
    args=['curl','-s','--max-time','60','-o','/dev/null','-w','%{http_code}','-X','POST',
          '-H',f'Authorization: Bearer {TOKEN}']
    for k,v in props.items(): args += ['--data-urlencode', f'{k}={v}']
    args.append(HOST+path)
    return subprocess.run(args, capture_output=True, text=True).stdout.strip()

results=[]
for line in open('/tmp/missing.txt'):
    line=line.strip()
    if not line: continue
    _, real, _ = line.split('|')
    slug = real.split('/blog/')[1]
    jc = get(real + '/_jcr_content.json')
    if jc is None:
        results.append((slug, real, 'FETCH_FAIL', '', '')); print('FETCH_FAIL', slug); continue
    root = get(real + '/_jcr_content/root.infinity.json')
    hero = find_hero(root) if root else None
    hero_img  = (hero or {}).get('image')
    hero_date = parse_date((hero or {}).get('description'))

    need_img = not jc.get('image')
    need_apd = not jc.get('articlePublishDate')
    img_res = apd_res = '-'

    if need_img:
        if hero_img:
            props={'image': hero_img}
            # SEO image is a property on jcr:content; the preview binding is the
            # nested jcr:content/image node — set both.
            for attempt in range(5):
                c1=post(real+'/jcr:content', props); c2=post(real+'/jcr:content/image', props)
                nv=get(real+'/_jcr_content.json')
                if nv and nv.get('image')==hero_img: img_res=f'SET {hero_img}'; break
                time.sleep(2)
            else: img_res=f'FAILED ({c1}/{c2})'
        else: img_res='NO_HERO_IMG'

    if need_apd:
        if hero_date:
            for attempt in range(5):
                c=post(real+'/jcr:content', {'articlePublishDate': hero_date})
                nv=get(real+'/_jcr_content.json')
                if nv and nv.get('articlePublishDate')==hero_date: apd_res=f'SET {hero_date}'; break
                time.sleep(2)
            else: apd_res=f'FAILED ({c})'
        else: apd_res='NO_HERO_DATE'

    results.append((slug, real, 'OK', img_res, apd_res))
    print(f'{slug[:46]:48} img:{img_res[:30]:32} apd:{apd_res}')
    sys.stdout.flush()

json.dump([{'slug':s,'real':r,'status':st,'img':i,'apd':a} for s,r,st,i,a in results],
          open('/tmp/fix-missing-report.json','w'), indent=2)
print('\nDONE', len(results), 'pages processed')

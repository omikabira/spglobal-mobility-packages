#!/usr/bin/env bash
# Reads each page's jcr:content and reports image + articlePublishDate presence/values.
TOKEN="$AEM_TOKEN"
HOST='https://author-p184787-e1941711.adobeaemcloud.com'
OUT='/workspace/current/tools/blog-import/meta-report.csv'
echo "path,image_present,image_value,articlePublishDate_present,articlePublishDate_value" > "$OUT"
while IFS= read -r P; do
  [ -z "$P" ] && continue
  json=$(curl -s -H "Authorization: Bearer $TOKEN" "$HOST$P/_jcr_content.json")
  echo "$json" | IMGPATH="$P" python3 -c "
import sys,json,os
p=os.environ['IMGPATH']
raw=sys.stdin.read()
try:
    d=json.loads(raw)
except Exception:
    print(f'\"{p}\",ERROR,fetch-failed,ERROR,fetch-failed'); sys.exit()
img=d.get('image'); apd=d.get('articlePublishDate')
def q(v):
    if v is None: return ''
    return '\"'+str(v).replace('\"','\"\"')+'\"'
ip='yes' if img is not None else 'no'
ap='yes' if apd is not None else 'no'
print(f'\"{p}\",{ip},{q(img)},{ap},{q(apd)}')
" >> "$OUT"
done < /workspace/current/tools/blog-import/meta-check-paths.txt
echo "Done. $(($(wc -l < "$OUT")-1)) rows."

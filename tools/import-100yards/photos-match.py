import json,os,sys,glob
import numpy as np
from PIL import Image
SITE='/home/claude/site'; COL='/root/rks/photos/collected-photos'
def sig(im):
    g=np.asarray(im.convert('L').resize((24,24),Image.LANCZOS),dtype=np.float32)
    g=(g-g.mean())/(g.std()+1e-6); return g
P=json.load(open(f'{SITE}/app/lib/catalog/projects.json'))
plan=[];stats=dict(total=0,matched=0,bigger=0,same=0,nomatch=0)
for p in P:
    slug=p['slug']; cands=[]
    for f in sorted(glob.glob(f'{COL}/{slug}/*')):
        try:
            im=Image.open(f); im.load()
            if im.width<300: continue
            cands.append((f,im.width,im.height,sig(im)))
        except Exception as e: pass
    for i,img in enumerate(p['images']):
        stats['total']+=1
        cur=Image.open(SITE+'/public'+img['src']); s=sig(cur); ar=cur.width/cur.height
        best=None
        for f,w,h,cs in cands:
            if abs(w/h-ar)/ar>0.04: continue
            d=float(np.mean((s-cs)**2))
            if best is None or d<best[0]: best=(d,f,w,h)
        if best and best[0]<0.12:
            stats['matched']+=1
            if best[2]>img['w']*1.08: stats['bigger']+=1
            else: stats['same']+=1
            plan.append(dict(slug=slug,i=i,src=img['src'],cur_w=img['w'],new=best[1],new_w=best[2],new_h=best[3],d=round(best[0],4)))
        else:
            stats['nomatch']+=1; plan.append(dict(slug=slug,i=i,src=img['src'],cur_w=img['w'],new=None,d=round(best[0],4) if best else None))
json.dump(plan,open('/root/rks/img/plan.json','w'),indent=1)
print(stats)
ds=sorted(x['d'] for x in plan if x['d'] is not None); print('dist pct',[ds[int(len(ds)*q)] for q in (.1,.5,.8,.9,.95,.99)])
cov=[x for x in plan if x['i']==0]; print('covers',len(cov),'upgradable',sum(1 for x in cov if x['new'] and x['new_w']>x['cur_w']*1.08),'final cover >=1200:',sum(1 for x in cov if max(x['cur_w'],x.get('new_w') or 0)>=1200),'final<=960',sum(1 for x in cov if max(x['cur_w'],x.get('new_w') or 0)<=960))

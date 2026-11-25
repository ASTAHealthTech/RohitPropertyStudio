import json,os
from PIL import Image,ImageFilter,ImageOps
SITE='/home/claude/site'; BK='/root/rks/p-backup'
plan={(x['slug'],x['i']):x for x in json.load(open('/root/rks/img/plan.json'))}
P=json.load(open(f'{SITE}/app/lib/catalog/projects.json'))
st=dict(orig=0,up=0,kept=0,small=0); tot=0
dims={}
for p in P:
    for i,img in enumerate(p['images']):
        x=plan[(p['slug'],i)]
        cur=BK+img['src'][2:]
        if x.get('new') and x['new_w']>=x['cur_w']: src=x['new']; from_orig=x['new_w']>x['cur_w']*1.08
        else: src=cur; from_orig=False
        im=Image.open(src); im=ImageOps.exif_transpose(im)
        if im.mode in('P','LA'): im=im.convert('RGBA')
        if im.mode=='RGBA':
            bg=Image.new('RGB',im.size,(255,255,255)); bg.paste(im,mask=im.split()[3]); im=bg
        im=im.convert('RGB'); w,h=im.size
        if w>1920:
            im=im.resize((1920,round(h*1920/w)),Image.LANCZOS).filter(ImageFilter.UnsharpMask(0.8,30,2))
        elif w<1200:
            f=min(1280/w,1.5); im=im.resize((round(w*f),round(h*f)),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.4,55,2)); st['up']+=1
        st['orig' if from_orig else 'kept']+=1
        out=SITE+'/public'+img['src']
        im.save(out,'WEBP',quality=78,method=6)
        if im.width>900:
            s=im.resize((800,round(im.height*800/im.width)),Image.LANCZOS).filter(ImageFilter.UnsharpMask(0.6,25,2))
            s.save(out.replace('.webp','-s.webp'),'WEBP',quality=76,method=6); st['small']+=1
        img['w'],img['h']=im.size; dims[img['src']]=im.size; tot+=os.path.getsize(out)
json.dump(P,open(f'{SITE}/app/lib/catalog/projects.json','w'),ensure_ascii=False,separators=(',',':'))
L=json.load(open(f'{SITE}/app/lib/catalog/projects-lite.json')); n=0
def fix(o):
    global n
    if isinstance(o,dict):
        if 'src' in o and o['src'] in dims: o['w'],o['h']=dims[o['src']]; n+=1
        for v in o.values(): fix(v)
    elif isinstance(o,list):
        for v in o: fix(v)
fix(L); json.dump(L,open(f'{SITE}/app/lib/catalog/projects-lite.json','w'),ensure_ascii=False,separators=(',',':'))
print(st,'lite fixed',n,'total MB',round(tot/1e6,1))

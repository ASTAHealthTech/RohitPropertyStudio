import sys,re,json,os
from bs4 import BeautifulSoup, NavigableString, Tag, Comment

WS=re.compile(r'\s+')
def txt(el):
    for c in el.find_all(string=lambda t: isinstance(t,Comment)): c.extract()
    return WS.sub(' ',el.get_text(' ',strip=True)).replace(' ,',',').replace(' .','.').replace('( ','(').replace(' )',')').strip()
EMOJI=re.compile('[\U0001F000-\U0001FAFF☀-➿️‍⭐⭕✅⚠✔✖]+')
def clean_head(t): return WS.sub(' ',EMOJI.sub('',t)).strip(' :–-')

def table_rows(t):
    rows=[]
    for tr in t.find_all('tr'):
        cells=[txt(c) for c in tr.find_all(['th','td'])]
        if any(cells): rows.append(cells)
    return rows

def blocks_between(nodes):
    """Turn a run of sibling-ish elements into typed blocks, depth-first, without duplicating text."""
    out=[]
    def walk(el):
        if isinstance(el,Comment): return
        if isinstance(el,NavigableString):
            t=WS.sub(' ',str(el)).strip()
            if len(t)>2: out.append({'t':'p','x':t})
            return
        if not isinstance(el,Tag): return
        n=el.name
        if n in('script','style','noscript','form','iframe','svg','button','input','select','nav','video','img','picture','figure') : return
        if n=='table':
            r=table_rows(el)
            if r: out.append({'t':'table','rows':r})
            return
        if n in('ul','ol'):
            items=[txt(li) for li in el.find_all('li',recursive=False)]
            items=[i for i in items if i]
            if items: out.append({'t':'list','items':items})
            return
        if n in('h1','h2'):
            t=clean_head(txt(el))
            if t: out.append({'t':'h2','x':t})
            return
        if n in('h3','h4','h5','h6'):
            t=clean_head(txt(el))
            if t: out.append({'t':'h','x':t})
            return
        if n=='details':
            q=el.find('summary'); qt=txt(q) if q else ''
            if q: q.extract()
            a=txt(el)
            if qt and a: out.append({'t':'qa','q':qt,'a':a})
            return
        if n=='p':
            t=txt(el)
            if t: out.append({'t':'p','x':t})
            return
        if n=='a':
            return  # links and buttons carry no facts
        if n in('strong','b','em','span','small','i','u','sup','sub','br','label'):
            t=txt(el)
            if len(t)>2: out.append({'t':'p','x':t})
            return
        # container: if it has no block children, treat as a paragraph
        kids=[c for c in el.children if isinstance(c,Tag)]
        blocky=el.find(['p','table','ul','ol','h1','h2','h3','h4','h5','h6','details','div','section','dl'])
        if not blocky:
            t=txt(el)
            if t and not (len(kids)==1 and kids[0].name=='a' and txt(kids[0])==t): out.append({'t':'p','x':t})
            return
        for c in el.children: walk(c)
    for n in nodes: walk(n)
    return out

def sections(main):
    """Split main content at h2 headings, wherever in the tree they sit."""
    h2s=main.find_all('h2')
    secs=[]
    for i,h in enumerate(h2s):
        title=clean_head(txt(h))
        nxt=h2s[i+1] if i+1<len(h2s) else None
        nodes=[]
        # collect everything in document order after h until next h2, taking the highest nodes that do not contain the next h2
        cur=h
        while True:
            sib=cur.next_sibling
            while sib is None:
                cur=cur.parent
                if cur is None or cur is main: break
                sib=cur.next_sibling
            if sib is None or cur is None or cur is main and sib is None: break
            cur=sib
            if isinstance(cur,Tag):
                if cur is nxt: break
                if nxt is not None and nxt in cur.descendants:
                    # descend: walk into first child chain
                    # push children before nxt
                    stack=cur
                    done=False
                    while True:
                        advanced=False
                        for c in stack.children:
                            if c is nxt: done=True; break
                            if isinstance(c,Tag) and nxt in c.descendants:
                                stack=c; advanced=True; break
                            nodes.append(c)
                        if done or not advanced: break
                    break
            nodes.append(cur)
        secs.append({'title':title,'blocks':blocks_between(nodes)})
    return secs

def images(main):
    out=[];seen=set()
    for im in main.find_all('img'):
        src=im.get('data-src') or im.get('data-lazy-src') or im.get('src') or ''
        if 'wp-content/uploads' not in src or src.endswith('.svg') or 'logo' in src.lower(): continue
        src=re.sub(r'-\d+x\d+(?=\.\w+$)','',src)
        if src in seen: continue
        seen.add(src); out.append({'src':src,'alt':WS.sub(' ',im.get('alt','')).strip()})
    return out

def parse_article(path):
    s=BeautifulSoup(open(path,encoding='utf8',errors='replace').read(),'lxml')
    main=s.select_one('.post-content') or s.find('main') or s.body
    for t in main(['script','style','noscript']): t.decompose()
    for t in main.select('header,footer,.comments-area,#comments,.related-posts,.post-navigation,.sharedaddy,.post-tags,.entry-meta,.author-box,form'): t.decompose()
    md=s.find('meta',attrs={'name':'description'})
    h1=s.find('h1')
    return {'title':txt(h1) if h1 else '','desc':md.get('content','') if md else '','blocks':blocks_between(list(main.children)),'images':images(main)}

def parse(path):
    s=BeautifulSoup(open(path,encoding='utf8',errors='replace').read(),'lxml')
    main=s.find('main') or s.body
    for t in main(['script','style','noscript']): t.decompose()
    for t in main.find_all(['header','footer']): t.decompose()
    h1=main.find('h1')
    md=s.find('meta',attrs={'name':'description'})
    return {'title':txt(s.title) if s.title else '','desc':md.get('content','') if md else '','h1':txt(h1) if h1 else '','sections':sections(main),'images':images(main)}

if __name__=='__main__':
    D=sys.argv[1]; out={}
    idx=json.load(open(os.path.join(D,'_index.json')))
    for i in idx:
        if i['why'] not in sys.argv[2].split(','): continue
        slug=i['url'].rstrip('/').split('/')[-1]
        out[slug]=parse(os.path.join(D,i['file'])); out[slug]['final']=i['finalUrl']
    json.dump(out,open(sys.argv[3],'w'),ensure_ascii=False)
    print(len(out),'parsed')

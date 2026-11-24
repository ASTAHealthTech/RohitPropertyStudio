"""Turn the saved 100yards.in pages into the two files the site reads:
   details.json  - extra sections for each project page
   articles.json - the body of each guide
Text is copied as published. Nothing is written or reworded here; lines are only left out
(investment pitches, verdicts, placeholders, enquiry prompts)."""
import sys,re,json,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from parse import parse, parse_article, WS, EMOJI
STOP=re.compile(r'get (the )?best price|^enquir|^contact|^call us|^about us$|^quick link|interested in|talk to (us|our)|speak (to|with)',re.I)
JUNK=re.compile(r'sales@100yards|Uniworks Pro|Consultation Hours|wpforms',re.I)
def de(t): return WS.sub(' ',EMOJI.sub('',t)).strip(' \u2013-:')

SKIP=re.compile(r'invest|conclusion|final (verdict|overview)|verdict|^interested in|^enquire|request the|gallery|video|\bmap\b|^cta$|brochure|growth potential|future development|reserve your|limited availability|deserves a|\beoi\b|early[- ]bird',re.I)
KINDS=[('faq',r'frequently|faq'),('pros',r'\bpros\b'),('about',r'^about |^overview$|about the project'),
 ('snapshot',r'snapshot|property details|key highlights'),('pricing',r'pric|configuration|floor plan|plot (config|details)|payment'),
 ('amenities',r'amenit|clubhouse|recreation'),('nearby',r'nearby|school|education|hospital|health|shopping|entertainment|employment|social infra'),
 ('location',r'location|connectivity|roads|metro|transport'),('why',r'why (choose|consider)|highlight|unique selling|target|who should'),]
PITCH=re.compile(r'invest|appreciat|\breturns?\b|\bROI\b|rental (yield|income|demand)|capital (growth|gain)|resale value|high[- ]growth|value growth',re.I)
FORECAST=re.compile(r'appreciat|capital (growth|gain)|rental yield|(high|good|strong|better) returns|price (growth|rise)|value is expected|expected to (grow|rise|increase)',re.I)
PLACE=re.compile(r'\binsert\b|x{3,}|lorem ipsum|\[[^\]]{0,40}\]|to be (updated|added|announced)\b.*\binsert|your (text|content) here|paste a (youtube|vimeo)|upload an mp4',re.I)
LABEL=re.compile(r'^[A-Z0-9 &/:-]{2,28}$')
BTN=re.compile(r'^(enquire now|get (price|details|brochure|quote|cost sheet).*|download .*|book (a )?site visit.*|whats ?app( us| now)?|call (us|now).*|contact us|view (more|details)|read more|request .*|chat .*|know more|schedule .*|click here.*)$',re.I)

def kind_of(title):
    for k,p in KINDS:
        if re.search(p,title,re.I): return k
    return 'other'

def tidy(blocks,title,drop_pitch_items=True):
    out=[]; seen=set()
    cut=[]
    for b in blocks:
        if b['t']=='h' and STOP.search(b['x']): break
        cut.append(b)
    for b in cut:
        b=dict(b)
        if 'x' in b: b['x']=de(b['x'])
        if 'items' in b: b['items']=[de(i) for i in b['items'] if not JUNK.search(i)]
        if b['t']=='p' and JUNK.search(b['x']): continue
        if b['t']=='p':
            x=b['x']
            if LABEL.match(x) or BTN.match(x) or x.lower()==title.lower() or PLACE.search(x) or FORECAST.search(x): continue
            if len(x)<4: continue
        if b['t']=='h':
            if PITCH.search(b['x']) or BTN.match(b['x']): b={'t':'drop-until-h'}
        if b['t']=='list':
            b['items']=[i for i in b['items'] if not PLACE.search(i) and not BTN.match(i) and not (drop_pitch_items and PITCH.search(i))]
            if not b['items']: continue
        if b['t']=='table':
            b['rows']=[r for r in b['rows'] if not any(PLACE.search(c) for c in r) and not PITCH.search(r[0])]
            if len(b['rows'])<2: continue
        if b['t']=='qa':
            if PITCH.search(b['q']) or PLACE.search(b['a']) or FORECAST.search(b['a']): continue
        key=json.dumps(b,sort_keys=True,ensure_ascii=False)
        if key in seen: continue
        seen.add(key); out.append(b)
    # a sub-heading about returns takes its text with it
    res=[];skipping=False
    for b in out:
        if b['t']=='drop-until-h': skipping=True; continue
        if b['t']=='h': skipping=False
        if skipping: continue
        res.append(b)
    # runs of short lines are a list
    merged=[];run=[]
    def flush():
        nonlocal run
        if len(run)>=3: merged.append({'t':'list','items':[r['x'] for r in run if not PITCH.search(r['x'])]})
        else: merged.extend(run)
        run=[]
    for b in res:
        if b['t']=='p' and len(b['x'])<=95 and not b['x'].endswith(('.',':','?')): run.append(b)
        else: flush(); merged.append(b)
    flush()
    # headings with nothing under them go
    final=[]
    for i,b in enumerate(merged):
        if b['t']=='h' and (i+1>=len(merged) or merged[i+1]['t']=='h'): continue
        if b['t']=='list' and not b['items']: continue
        final.append(b)
    return final

dropped=[]
def project(raw):
    secs=[]
    for s in raw['sections']:
        t=s['title']
        if not t or SKIP.search(t): continue
        k=kind_of(t)
        flat=' '.join((b.get('x','')+' '+' '.join(b.get('items',[]))) for b in s['blocks'])
        if re.search(r'paste a (youtube|vimeo)|upload an mp4|lorem ipsum',flat,re.I): dropped.append(t); continue
        bl=tidy(s['blocks'],t,drop_pitch_items=(k!='faq'))
        if k=='faq':
            # questions written as a heading with the answer under it
            qa=[];cur=None
            for b in s['blocks']:
                if b['t']=='h' and STOP.search(b['x']): break
                if b['t']=='qa': qa.append(b); cur=None
                elif b['t']=='h': cur={'t':'qa','q':b['x'],'a':''}; qa.append(cur)
                elif b['t']=='p' and cur is not None and not BTN.match(b['x']): cur['a']=(cur['a']+' '+b['x']).strip()
                elif b['t']=='list' and cur is not None: cur['a']=(cur['a']+' '+'; '.join(b['items'])).strip()
            bl=[q for q in qa if q['a'] and not PITCH.search(q['q']) and not PLACE.search(q['a']) and not FORECAST.search(q['a']) and q['q'].rstrip().endswith('?')]
        if not bl: continue
        if k=='pros' and not any(b['t']=='h' for b in bl):
            lists=[b for b in bl if b['t']=='list']; names=[x.strip() for x in re.split(r'&|\band\b',t)]
            if len(lists)==2 and len(names)==2:
                # the page shows two colour-coded lists; the labels are the two halves of its own title
                bl=[{'t':'h','x':names[0]},lists[0],{'t':'h','x':names[1]},lists[1]]+[b for b in bl if b['t']!='list']
        secs.append({'title':t,'kind':k,'blocks':bl})
    return secs

if __name__=='__main__':
    D,OUT=sys.argv[1],sys.argv[2]
    idx=json.load(open(os.path.join(D,'_index.json')))
    details={};photos={}
    cat={p['slug']:p for p in json.load(open(sys.argv[3]))}
    for i in idx:
        if i['why']!='catalogue': continue
        slug=i['url'].rstrip('/').split('/')[-1]
        raw=parse(os.path.join(D,i['file']))
        secs=project(raw)
        have=cat.get(slug,{})
        keep=[]
        for sec in secs:
            k=sec['kind']
            if k=='about' and have.get('about'): continue
            if k=='snapshot' and have.get('snap'): continue
            if k=='pricing' and (have.get('pt') or have.get('ct')): continue
            if k=='amenities' and have.get('am'): continue
            if k=='location' and have.get('la'): continue
            keep.append(sec)
        details[slug]={'sections':keep}
        photos[slug]=raw['images']
    json.dump(details,open(os.path.join(OUT,'details.json'),'w'),ensure_ascii=False,separators=(',',':'))
    json.dump(photos,open(os.path.join(OUT,'photos-source.json'),'w'),ensure_ascii=False,indent=0)
    print('projects',len(details),'template sections dropped',len(dropped))

    # ---- guides ----
    DEMO=re.compile(r'monroe|dynamics-365|managed-services|workforce|scan-index|erie-|it-resources|lighthouse-project|compsec',re.I)
    HOLD=re.compile(r'invest|returns|rental-yield|overpriced|best-places|boom|safest|fractional|top-selling|a-tier-developer|festive-season|land-acquisitions|luxury-housing|disappearing|economic-changes|new-development|trusted-partner|best-residential-plots|plot-for-sale|supports-our-economy|remote-work|guidance-value|why-buy-new-launch|rohan-ekanta',re.I)
    posts=json.load(open(sys.argv[4]))
    arts={};held=[];demo=[]
    files={i['url'].rstrip('/').split('/')[-1]:i['file'] for i in idx if i['why']=='guide'}
    for p in posts:
        slug=p['slug']
        if DEMO.search(slug): demo.append(slug); continue
        if HOLD.search(slug): held.append(slug); continue
        if slug not in files: continue
        raw=parse_article(os.path.join(D,files[slug]))
        title=raw['title'] or p['title']
        bl=[]
        for b in raw['blocks']:
            if b['t'] in('h','h2') and STOP.search(b['x']): break
            if b['t'] in('h','h2') and re.search(r'related (posts|articles)|leave a (reply|comment)|share this|recent posts',b['x'],re.I): break
            b=dict(b)
            if 'x' in b: b['x']=de(b['x'])
            if 'items' in b: b['items']=[de(i) for i in b['items'] if not JUNK.search(i)]
            if b['t'] in('h','h2') and b['x'].lower().rstrip('.:')==title.lower().rstrip('.:'): continue
            if b['t']=='p' and (b['x'].lower()=='html' or re.search(r'whatsapp us|^call \+91',b['x'],re.I) and len(b['x'])<60): continue
            if b['t']=='p' and not bl and len(b['x'])<90 and not b['x'].endswith('.'): continue
            if b['t']=='p' and (JUNK.search(b['x']) or BTN.match(b['x']) or PLACE.search(b['x']) or len(b['x'])<3): continue
            if b['t']=='list' and not b['items']: continue
            if bl and bl[-1]==b: continue
            bl.append(b)
        while bl and bl[-1]['t'] in('h','h2'): bl.pop()
        words=sum(len((b.get('x','')+' '+' '.join(b.get('items',[]))+' '+b.get('a','')+' '+' '.join(c for r in b.get('rows',[]) for c in r)).split()) for b in bl)
        if words<120: held.append(slug+' (too short)'); continue
        arts[slug]={'desc':raw['desc'],'blocks':bl,'words':words}
    json.dump(arts,open(os.path.join(OUT,'articles.json'),'w'),ensure_ascii=False,separators=(',',':'))
    json.dump([p for p in posts if not DEMO.search(p['slug'])],open(os.path.join(OUT,'posts.json'),'w'),ensure_ascii=False,indent=1)
    json.dump({'held':held,'demo':demo},open(os.path.join(OUT,'guides-report.json'),'w'),indent=1)
    print('guides imported',len(arts),'held',len(held),'demo removed',len(demo))

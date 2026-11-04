"""Real renderer, geometry and glossary tests. Requires the tools described in README."""
import io
import json
import os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('FOCAL_URL','http://127.0.0.1:3000').rstrip('/')+'/'
LESSONS=json.loads((ROOT/'lesson-content.json').read_text())
TERMS=json.loads((ROOT/'glossary.json').read_text())
FLAGS=['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--use-gl=angle','--disable-webgpu']

def ready(page):
    page.wait_for_selector('.spatial-interactive[data-state="ready"]',timeout=60000)

def stats(page):
    return page.evaluate('async()=>(await FocalVisuals.ready()).stats()')

with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=FLAGS)
    page=b.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
    errors=[];gpu_errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda msg:gpu_errors.append(msg.text) if msg.type=='error' else None)
    page.goto(BASE+'#courses');page.wait_for_selector('.course-card')
    result=page.evaluate('''async()=>{const {configs,buildWorld}=await import('./spatial-models.js');const errors=[];for(const [kind,cfg] of Object.entries(configs)){if(cfg.length!==6||cfg[4].some(v=>!Number.isFinite(v)))errors.push(kind+': config');for(let step=0;step<3;step++){let world;try{world=buildWorld(kind,step);for(const value of [cfg[1],(cfg[1]+cfg[2])/2,cfg[2]]){world.set(value);world.root.traverse(o=>{const pos=o.geometry?.attributes.position?.array;if(pos&&Array.from(pos).some(n=>!Number.isFinite(n)))errors.push(kind+': geometry');if(![o.position.x,o.position.y,o.position.z,o.scale.x,o.scale.y,o.scale.z].every(Number.isFinite))errors.push(kind+': transform')})}}catch(e){errors.push(kind+': '+e.message)}finally{world?.dispose()}}}return {kinds:Object.keys(configs).length,errors:[...new Set(errors)]}}''')
    assert result['errors']==[],result
    assert result['kinds']==53
    # The learning catalogue itself must not allocate a renderer.
    assert stats(page)['renderers']==0
    page.goto(BASE+'#lesson/N01-L03/visual');page.wait_for_selector('#scenario-explanation .technical-term')
    page.locator('#scenario-explanation .technical-term[href="#glossary/ouverture"]').click()
    page.wait_for_selector('.glossary-detail');ready(page)
    assert page.locator('h1').inner_text()=='Ouverture.'
    canvas=page.locator('.spatial-canvas')
    picture=Image.open(io.BytesIO(canvas.screenshot()))
    assert len(picture.getcolors(maxcolors=1_000_000) or [])>100
    first=canvas.screenshot()
    page.locator('.spatial-range').fill('14')
    assert page.locator('.spatial-value').inner_text()=='f/14,0'
    assert page.locator('#glossary-step-label').inner_text()=='EXPLORATION LIBRE'
    assert canvas.screenshot()!=first
    page.locator('[data-glossary-step="0"]').click();ready(page)
    assert page.locator('.spatial-value').inner_text()=='f/1,8'
    assert page.locator('#glossary-step-title').inner_text()==TERMS[0]['steps'][0]['title']
    before=stats(page)['camera'];canvas.focus();page.keyboard.press('ArrowLeft')
    assert stats(page)['camera']!=before
    page.locator('[data-action="reset"]').click()
    page.locator('[data-hotspot="0"]').click()
    assert 'Pupille' in page.locator('.spatial-insight').inner_text()
    page.locator('[data-action="play"]').click()
    before=stats(page)['frames'];page.wait_for_timeout(800)
    assert stats(page)['playing'] and stats(page)['frames']>before+2
    page.locator('[data-action="play"]').click();assert not stats(page)['playing']
    for i in [1,2,0]:
        page.locator(f'[data-glossary-step="{i}"]').click();ready(page)
        assert page.locator('#glossary-step-title').inner_text()==TERMS[0]['steps'][i]['title']
    page.locator('#glossary-return').click();page.wait_for_selector('#pane-visual')
    assert page.locator('#pane-visual').is_visible()
    assert page.url.endswith('#lesson/N01-L03/visual')
    # All 48 lesson mechanisms must actually render, not merely create a canvas element.
    for index,(id,meta) in enumerate(LESSONS.items()):
        page.goto(BASE+'#lesson/'+id+'/visual');page.wait_for_selector('#workshop-art')
        page.locator('#workshop-art').scroll_into_view_if_needed();ready(page)
        assert stats(page)['activeKind']==meta['kind'],id
        assert stats(page)['backend']=='webgl2',id
        assert page.locator('#workshop-art .spatial-canvas').evaluate('(c)=>c.width>0&&c.height>0')
        if index%8==0:print('Rendered',index+1,'/48',id,flush=True)
    # Glossary definitions, guided steps, and dedicated additional mechanisms.
    for term in TERMS:
        page.goto(BASE+'#glossary/'+term['slug']);page.wait_for_selector('.glossary-detail');ready(page)
        assert page.locator('h1').inner_text()==term['title']+'.'
        assert page.locator('.glossary-step').count()==3
        assert page.locator('.glossary-concrete p').inner_text()==term['example']
    assert stats(page)['renderers']<=2,stats(page)
    page.goto(BASE+'#glossary');page.wait_for_selector('.glossary-card')
    assert page.locator('.glossary-card').count()==29
    page.locator('#term-search').fill('sensibilite');assert page.locator('.glossary-card').count()==1
    for width in [360,390,768,1024,1440]:
        page.set_viewport_size({'width':width,'height':900})
        for path in ['#glossary','#glossary/diaphragme','#lesson/N02-L03/visual']:
            page.goto(BASE+path);page.wait_for_selector('.page-heading')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,path)
    page.goto(BASE+'#glossary/ouverture');ready(page)
    page.locator('[data-action="play"]').click();page.goto(BASE+'#courses');page.wait_for_selector('.course-card')
    page.wait_for_timeout(150);assert not stats(page)['playing']
    assert errors==[],errors
    assert gpu_errors==[],gpu_errors[:10]
    b.close()
    # Graceful behavior without any GPU: explanatory content must remain usable.
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-webgl','--disable-webgl2','--disable-gpu','--disable-webgpu'])
    page=b.new_page();page.goto(BASE+'#glossary/ouverture');page.wait_for_selector('.spatial-unavailable',timeout=30000)
    assert page.locator('.glossary-concrete p').is_visible()
    assert 'nombre f' in page.locator('.glossary-definition').inner_text()
    b.close()
print('PASS: 53 finite 3D models; real WebGL2 rendering for all 48 lessons and 29 terms; parameter, orbit, animation, hotspots, glossary deep links and return; <=2 renderers; responsive; no-GPU fallback.')

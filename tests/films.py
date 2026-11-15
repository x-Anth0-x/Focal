"""Runway replacement: all lessons, owned lenses, glossary, playback and no WebGL."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('FOCAL_URL','http://127.0.0.1:3000').rstrip('/')
FILMS=json.loads((ROOT/'lesson-films.json').read_text())
CONTENT=json.loads((ROOT/'lesson-content.json').read_text())
PROFILE=json.loads((ROOT/'sony-a7iv.json').read_text())
GLOSSARY=json.loads((ROOT/'glossary.json').read_text())
assert set(FILMS['lessons'])==set(CONTENT)
for clip in FILMS['clips'].values():
 for key in ['video','poster']: assert (ROOT/clip[key]).stat().st_size>1000,clip[key]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:requests.append(r.url))
 for id,meta in CONTENT.items():
  page.goto(BASE+'/#lesson/'+id+'/course');page.wait_for_selector('.lesson-film')
  assert page.locator('.lesson-film').count()==1,id
  assert FILMS['lessons'][id]['observe'] in page.locator('.lesson-film').inner_text(),id
  assert page.locator('.lesson-film [data-clip]').get_attribute('data-clip')==FILMS['lessons'][id]['clip']
  page.locator('[data-film-mission]').click();assert page.locator('#pane-mission').is_visible()
  page.locator('#tab-visual').click()
  for i,preset in enumerate(PROFILE['lessons'][id]['presets']):
   page.locator(f'[data-scenario="{i}"]').click()
   capture=json.loads(page.locator('#workshop-art .runway-view').get_attribute('data-capture'))
   assert capture['lensId']==preset['lens'],(id,i)
   assert page.locator('#workshop-art .runway-film').first.get_attribute('data-clip')=='gear-'+preset['lens']
   assert meta['scenarios'][i]['explanation']==page.locator('#scenario-explanation').inner_text()
  assert page.locator('canvas,.spatial-view').count()==0
 print('PASS: 48 films and missions, 144 scenario/lens assignments.')
 for term in GLOSSARY:
  page.goto(BASE+'/#glossary/'+term['slug']);page.wait_for_selector('.glossary-detail')
  assert page.locator('.runway-film').count()==2,term['slug']
  for i in [0,1,2]:
   page.locator(f'[data-glossary-step="{i}"]').click()
   assert page.locator('#glossary-step-title').inner_text()==term['steps'][i]['title']
 print('PASS: 29 glossary entries and 87 narration steps.')
 assert not any('/spatial.js' in u or '/vendor/three/' in u for u in requests)
 assert not any(u.split('?')[0].endswith('.mp4') for u in requests),'Video downloaded before play'
 for width in [390,768,1440]:
  page.set_viewport_size({'width':width,'height':960})
  for route in ['#camera','#courses','#glossary/ouverture','#lesson/N01-L03/course','#lesson/N06-L04/visual']:
   page.goto(BASE+'/'+route);page.wait_for_selector('.page-heading')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,route)
 for slug,clip in FILMS['clips'].items():
  page.goto(BASE+'/#lesson/N01-L03/course');page.wait_for_selector('.lesson-film')
  page.locator('.lesson-film video').evaluate('(v,src)=>{v.src=src;return v.play()}',clip['video'])
  page.wait_for_function('document.querySelector(".lesson-film video").currentTime>0.15')
  assert page.locator('.lesson-film video').evaluate('v=>v.videoWidth')==1280,slug
 page.locator('#tab-mission').click()
 assert page.locator('.lesson-film video').evaluate('v=>v.paused')
 assert not errors,errors
 browser.close()
print('PASS: 19 playable local films, on-demand loading, responsive layouts, pause on tab changes, no WebGL or JS errors.')

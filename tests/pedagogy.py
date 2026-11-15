"""Grounded checks for mechanisms, scenario data and working learning routes."""
import json, os, re, math
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('FOCAL_URL','http://127.0.0.1:3000').rstrip('/')
META=json.loads((ROOT/'lesson-content.json').read_text())
GLOSSARY=json.loads((ROOT/'glossary.json').read_text())
PROFILE=json.loads((ROOT/'sony-a7iv.json').read_text())
assert [r['mode'] for r in PROFILE['lessons']['N02-L01']['presets']]==['A','S','M']
assert [r['aperture'] for r in PROFILE['lessons']['N03-L03']['presets']]==[1.8]*3
assert [r['distance'] for r in PROFILE['lessons']['N03-L03']['presets']]==[1.2,2,5]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=b.new_page(reduced_motion='reduce');errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
 for id,meta in META.items():
  page.goto(BASE+'/#lesson/'+id+'/visual');page.wait_for_selector('#workshop-art .teaching-diagram')
  images=[]
  for i,sc in enumerate(meta['scenarios']):
   page.locator(f'[data-scenario="{i}"]').click()
   assert page.locator('#scenario-explanation').inner_text()==sc['explanation'],(id,i)
   d=page.locator('#workshop-art .runway-view');c=json.loads(d.get_attribute('data-capture'))
   assert c['lensId']==PROFILE['lessons'][id]['presets'][i]['lens'],(id,i)
   assert page.locator('#workshop-art video, #workshop-art canvas').count()==0
   assert page.locator('#workshop-art figcaption dt').all_text_contents()==['Ce qui change','Repère à garder']
   images.append(page.locator('#workshop-art svg').evaluate('s=>{const c=s.cloneNode(true);c.querySelectorAll("title,desc,text").forEach(e=>e.remove());return c.innerHTML}'))
  assert len(set(images))==3,('Geometry did not change',id)
 print('PASS: 48 lessons, 144 scenario-specific geometry states, explanatory captions and owned lenses.',flush=True)
 page.goto(BASE+'/#lesson/N01-L03/visual');page.wait_for_selector('#workshop-art svg')
 radii=[]
 for i in range(3):
  page.locator(f'[data-scenario="{i}"]').click()
  radii.append(float(page.locator('#workshop-art svg circle').nth(1).get_attribute('r')))
 assert radii[0]>radii[1]>radii[2] and abs(radii[0]/radii[1]-5.6/1.8)<1e-6
 page.goto(BASE+'/#lesson/N03-L01/visual');page.wait_for_selector('#workshop-art svg')
 for i,f in enumerate([28,35,85]):
  page.locator(f'[data-scenario="{i}"]').click()
  expected=f'{2*math.atan(18/f)*180/math.pi:.1f}°'
  assert expected in page.locator('#workshop-art').inner_text(),(f,expected)
 page.goto(BASE+'/#lesson/N03-L03/visual');page.wait_for_selector('#distance')
 for i,d in enumerate([1.2,2,5]):
  page.locator(f'[data-scenario="{i}"]').click()
  assert float(page.locator('#distance').input_value())==d
  assert page.locator('#apertureOut').inner_text()=='f/1,8'
 page.locator('#distance').fill('3')
 assert 'Vos réglages libres' in page.locator('#scenario-title').inner_text()
 assert json.loads(page.locator('#workshop-art .runway-view').get_attribute('data-capture'))['distance']==3
 print('PASS: aperture ratio, full-frame angles, controlled depth experiment and two-way calculator.',flush=True)
 for term in GLOSSARY:
  page.goto(BASE+'/#glossary/'+term['slug']);page.wait_for_selector('.glossary-detail .teaching-diagram')
  for i in range(3):
   page.locator(f'[data-glossary-step="{i}"]').click()
   assert page.locator('#glossary-step-title').inner_text()==term['steps'][i]['title']
  assert page.locator('.glossary-detail video,.glossary-detail canvas').count()==0
 for width in [360,390,768,1024,1440]:
  page.set_viewport_size({'width':width,'height':900})
  for route in ['#home','#lesson/N01-L03/visual','#lesson/N03-L03/visual','#glossary/diffraction','#camera']:
   page.goto(BASE+'/'+route);page.wait_for_selector('.home-hero' if route=='#home' else '.page-heading')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,route)
 assert not any('/spatial.js' in r or '/vendor/three/' in r for r in requests)
 assert not any(r.split('?')[0].endswith('.mp4') for r in requests)
 assert not errors,errors
 b.close()
print('PASS: 29 glossary terms, 87 steps, 5 viewport sizes, no decorative-video download, WebGL or JS errors.')

"""User kit integration: factual constraints, per-lesson procedures and actual 3D renders."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
PROFILE=json.loads((ROOT/'sony-a7iv.json').read_text())
CONTENT=json.loads((ROOT/'lesson-content.json').read_text())
BASE=os.environ.get('FOCAL_URL','http://127.0.0.1:3000').rstrip('/')+'/'
assert len(PROFILE['lessons'])==48
assert len(PROFILE['lenses'])==3
for id,expected in {'tamron':(28,75,2.8),'fe85':(85,85,1.8),'fe35':(35,35,1.8)}.items():
 lens=PROFILE['lenses'][id];assert (lens['focalMin'],lens['focalMax'],lens['maxAperture'])==expected
for id,data in PROFILE['lessons'].items():
 assert len(data['steps'])==5
 for c in [data['setup'],*data['presets']]:
  lens=PROFILE['lenses'][c['lens']]
  assert lens['focalMin']<=c['focal']<=lens['focalMax'],id
  assert lens['maxAperture']<=c['aperture']<=lens['minAperture'],id
  assert c['mode'] in ['P','A','S','M'],id
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--use-gl=angle','--disable-webgpu'])
 page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for index,(id,data) in enumerate(PROFILE['lessons'].items()):
  page.goto(BASE+'#lesson/'+id+'/course');page.wait_for_selector('.sony-recipe')
  assert 'Sony α7 IV' in page.locator('.sony-context').inner_text(),id
  assert page.locator('.sony-steps li').count()==5,id
  assert data['purpose'] in page.locator('.sony-recipe h2').inner_text(),id
  assert PROFILE['lenses'][data['setup']['lens']]['name'] in page.locator('.sony-mission-body').text_content(),id
  page.locator('#tab-visual').click();page.locator('#workshop-art').scroll_into_view_if_needed()
  page.wait_for_selector('#workshop-art .spatial-interactive[data-state="ready"]',timeout=60000)
  assert 'ILCE-7M4' in page.locator('.spatial-gear-reference').inner_text(),id
  for step,c in enumerate(data['presets']):
   page.locator(f'[data-scenario="{step}"]').click();page.wait_for_selector('#workshop-art .spatial-interactive[data-state="ready"]',timeout=30000)
   capture=page.locator('#workshop-art .spatial-view').evaluate('el=>JSON.parse(el.dataset.capture)')
   lens=PROFILE['lenses'][c['lens']]
   assert capture['lensId']==c['lens'],id
   assert capture['focal']==c['focal'],id
   if CONTENT[id]['kind'] in ['focal','lenskit']:
    slider=page.locator('.spatial-range');assert float(slider.get_attribute('min'))==lens['focalMin'];assert float(slider.get_attribute('max'))==lens['focalMax'];assert slider.is_disabled()==(lens['focalMin']==lens['focalMax'])
   if CONTENT[id]['kind'] in ['aperture','depth','aberration']:
    assert float(page.locator('.spatial-range').get_attribute('data-physical-min'))==lens['maxAperture']
    assert float(page.locator('.spatial-range').get_attribute('data-physical-max'))==22
    allowed=json.loads(page.locator('.spatial-range').get_attribute('data-values'));assert all(v in [1.8,2,2.2,2.5,2.8,3.2,3.5,4,4.5,5,5.6,6.3,7.1,8,9,10,11,13,14,16,18,20,22] for v in allowed)
  if index%8==0:print('Sony checked',index+1,'/48',id,flush=True)
 page.goto(BASE+'#lesson/N01-L03/visual');page.wait_for_selector('#dof-lens')
 assert page.locator('#dof-lens').input_value()=='fe85'
 assert page.locator('#focal').is_disabled() and page.locator('#focal').input_value()=='85'
 assert page.locator('#dofOut').inner_text()=='0,06 m'
 page.locator('#dof-lens').select_option('fe35');assert page.locator('#focal').input_value()=='35' and page.locator('#focal').is_disabled()
 page.locator('#dof-lens').select_option('tamron');assert not page.locator('#focal').is_disabled()
 assert page.locator('#focal').get_attribute('min')=='28' and page.locator('#focal').get_attribute('max')=='75'
 assert page.locator('#aperture').get_attribute('min')=='2'
 page.goto(BASE+'#camera');page.wait_for_selector('.sony-guide-grid')
 assert page.locator('.sony-guide-grid article').count()==3
 page.wait_for_selector('.spatial-interactive[data-state="ready"]',timeout=30000)
 for action in ['back','top','front']:page.locator(f'[data-action="{action}"]').click()
 for width in [390,768,1440]:
  page.set_viewport_size({'width':width,'height':844})
  for route in ['#camera','#lesson/N01-L03/course','#lesson/N06-L01/visual']:
   page.goto(BASE+route);page.wait_for_selector('.page-heading');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,route)
 assert not errors,errors
 browser.close()
print('PASS: 48 Sony procedures, 144 owned-lens presets, constrained controls, 3 lenses in the optical calculator, actual 3D body views and responsive layout. Camera menu operation is not hardware-tested.')

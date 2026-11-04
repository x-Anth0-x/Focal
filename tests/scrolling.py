"""Regression: scroll position, shared browser tabs, live state and native gestures."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('FOCAL_URL','http://127.0.0.1:3000').rstrip('/')+'/'
FLAGS=['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--use-gl=angle','--disable-webgpu']
REFERENCE=json.loads((ROOT/'lesson_reference.json').read_text())
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=FLAGS)
 context=b.new_context(viewport={'width':1440,'height':800})
 context.add_init_script("window.progressWrites=0;const oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='focal_academy_web_v1')progressWrites++;return oldSet.call(this,k,v)}")
 # Isolate state synchronization from graphics: real graphics are exercised below.
 context.route('**/spatial.js*',lambda r:r.fulfill(content_type='text/javascript',body='export function mount(el){el.dataset.state="ready"}'))
 errors=[]
 def open_page(hash):
  page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE+hash);page.wait_for_selector('.page-heading');page.add_style_tag(content='html{scroll-behavior:auto!important}')
  page.evaluate('window.rootReplacements=0;new MutationObserver(()=>rootReplacements++).observe(document.querySelector("#app"),{childList:true})')
  return page
 a=open_page('#lesson/N01-L03/course');a.evaluate('scrollTo(0,500)')
 other=open_page('#lesson/N02-L03/course');a.bring_to_front();a.wait_for_timeout(700)
 assert a.evaluate('rootReplacements')==0
 assert a.evaluate('scrollY')==500
 assert a.evaluate('progressWrites')==1 and other.evaluate('progressWrites')==1
 assert a.locator('h1').inner_text()=='Ouverture du diaphragme'
 assert other.locator('h1').inner_text()=='Histogramme et dynamique'
 other.locator('#tab-mission').click();other.locator('#fieldNotes').fill('Un carnet sur la deuxième leçon.');other.locator('#saveNotes').click()
 a.bring_to_front();a.wait_for_function("FocalApp.state.notes['N02-L03']==='Un carnet sur la deuxième leçon.'")
 assert a.evaluate('rootReplacements')==0 and a.evaluate('scrollY')==500
 assert a.locator('#pane-course').is_visible()
 same=open_page('#lesson/N01-L03/quiz')
 q=REFERENCE['questions'][0];same.locator(f'[data-q="0"][data-a="{q["correct"]}"]').click()
 a.bring_to_front();a.wait_for_function("document.querySelector('#score').textContent.startsWith('1 / 5')")
 assert a.evaluate('rootReplacements')==0 and a.evaluate('scrollY')==500
 a.locator('#tab-mission').click();a.locator('#fieldNotes').focus();a.locator('#fieldNotes').evaluate("el=>el.value='Mon brouillon local non enregistré'")
 same.locator('#tab-mission').click();same.locator('#fieldNotes').fill('Une note distante.');same.locator('#saveNotes').click()
 a.bring_to_front();a.wait_for_function("FocalApp.state.notes['N01-L03']==='Une note distante.'")
 assert a.locator('#fieldNotes').input_value()=='Mon brouillon local non enregistré'
 assert a.locator('#fieldNotes').evaluate('el=>el===document.activeElement')
 a.locator('#saveNotes').click();same.bring_to_front();same.wait_for_function("FocalApp.state.notes['N01-L03']==='Mon brouillon local non enregistré'")
 assert same.locator('#fieldNotes').input_value()=='Mon brouillon local non enregistré'
 progress=open_page('#progress');progress.evaluate('scrollTo(0,450)')
 same.locator('#practiceDone').check();same.locator('#tab-quiz').click()
 for i,q in enumerate(REFERENCE['questions']):same.locator(f'[data-q="{i}"][data-a="{q["correct"]}"]').click()
 same.locator('#finish').click();progress.bring_to_front();progress.wait_for_function("document.querySelector('.progress-hero h2').textContent.startsWith('1 / 48')")
 assert progress.evaluate('rootReplacements')==0 and progress.evaluate('scrollY')==450
 catalog=open_page('#courses');catalog.locator('#course-search').fill('Ouverture du diaphragme')
 catalog.evaluate('window.originalCard=document.querySelector(".course-card")')
 same.locator('#retry-quiz').click();catalog.bring_to_front();catalog.wait_for_function("!document.querySelector('.course-card .status').classList.contains('passed')")
 assert catalog.locator('#course-search').input_value()=='Ouverture du diaphragme'
 assert catalog.evaluate('originalCard===document.querySelector(".course-card") && rootReplacements===0')
 assert not errors,errors
 context.close();print('PASS: shared tabs do not reload each other; scroll, selected tabs, drafts, progress and filters preserved.',flush=True)
 # Real mouse wheel over the scene must scroll the document.
 context=b.new_context(viewport={'width':1440,'height':800});page=context.new_page();page.goto(BASE+'#lesson/N01-L03/visual');page.wait_for_selector('.spatial-interactive[data-state="ready"]',timeout=30000)
 page.add_style_tag(content='html{scroll-behavior:auto!important}')
 canvas=page.locator('.spatial-canvas');canvas.scroll_into_view_if_needed();box=canvas.bounding_box();before=page.evaluate('scrollY')
 page.mouse.move(box['x']+35,box['y']+box['height']*.7);page.mouse.wheel(0,350);page.wait_for_timeout(350)
 assert page.evaluate('scrollY')>before+100
 context.close();print('PASS: native mouse wheel scrolls vertically above the actual 3D scene.',flush=True)
 # A vertical touch gesture scrolls the page rather than being captured by OrbitControls.
 context=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
 page=context.new_page();page.goto(BASE+'#lesson/N01-L03/visual');page.wait_for_selector('.spatial-interactive[data-state="ready"]',timeout=30000)
 page.add_style_tag(content='html{scroll-behavior:auto!important}')
 canvas=page.locator('.spatial-canvas');canvas.scroll_into_view_if_needed();box=canvas.bounding_box();before=page.evaluate('scrollY');x=box['x']+box['width']*.75;y=box['y']+box['height']*.8
 session=context.new_cdp_session(page)
 session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
 for i in range(1,11):
  session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y-i*15}]});page.wait_for_timeout(20)
 session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(300)
 assert page.evaluate('scrollY')>before+50,(before,page.evaluate('scrollY'))
 context.close();b.close();print('PASS: vertical touch scrolling above the actual scene.',flush=True)

"""Phase 2 browser acceptance: real forms, compatible equipment, evidence and data safety."""
import json, os
from datetime import datetime, timezone, timedelta
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('FOCAL_URL','http://127.0.0.1:3000').rstrip('/')
ARTIFACTS=Path(os.environ.get('FOCAL_ARTIFACTS',str(ROOT/'test-artifacts')))
ARTIFACTS.mkdir(parents=True,exist_ok=True)
PILOT=json.loads((ROOT/'data/pilot-first-shot.json').read_text())
DIAG=json.loads((ROOT/'data/diagnostic.json').read_text())
OLD={'notes':{'N01-L02':'Mon ancien carnet : aucune donnée à perdre.'},'done':{'N01-L01':True},'practice':{'N01-L01':True},'readV2':{'N01-L01':[0]},'lastLesson':'N01-L02'}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 context.add_init_script('if(!localStorage.getItem("focal_academy_web_v1"))localStorage.setItem("focal_academy_web_v1",'+json.dumps(json.dumps(OLD))+');')
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 start=datetime(2026,11,16,12,tzinfo=timezone.utc);page.clock.install(time=start)
 def go(route):
  page.goto(BASE+'/'+route);page.wait_for_function('!!window.FocalApp')
 def grade(form,questions,prefix):
  for q in questions:page.locator(f'input[name="{prefix}-{q["id"]}"][value="{q["correct"]}"]').check()
  page.locator(form+' button[type=submit]').click()
 go('#home');assert page.locator('.learning-next a').get_attribute('href')=='#onboarding'
 assert page.evaluate('FocalLearningCore.estimate(FocalLearning.data.academy.skills[0],FocalLearning.state,FocalApp.state).stage')=='discovered'
 page.locator('.learning-next a').click();page.wait_for_selector('#profile-form')
 page.locator('[name=ownedLensIds][value=tamron]').check();page.locator('[name=confirmed]').check();page.locator('[name=interests][value=MOD-portrait]').check();page.locator('[name=weeklyMinutes]').fill('45');page.locator('#profile-form button[type=submit]').click();page.wait_for_url('**/#diagnostic')
 assert page.evaluate('FocalLearning.state.profile.ownedLensIds')==['tamron']
 # Native required-field validation blocks an empty submission.
 page.locator('#diagnostic-form button[type=submit]').click();assert page.evaluate('FocalLearning.state.diagnostic') is None
 grade('#diagnostic-form',DIAG['questions'],'diag');page.wait_for_selector('.learning-recommendation');assert page.locator('.learning-correction').count()==10
 assert page.evaluate('FocalLearningCore.estimate(FocalLearning.data.academy.skills[0],FocalLearning.state).confidence')==.35
 # Every active preset really uses the only owned lens, not an unavailable FE prime.
 go('#lesson/N01-L03/visual');assert page.locator('#dof-lens option').count()==1
 assert page.locator('#apertureOut').inner_text()=='f/2,8'
 assert 'f/1,8' not in page.locator('.scenario-tabs').inner_text()
 assert page.evaluate('''()=>FocalApp.lessons.every(l=>[0,1,2].every(i=>{const c=FocalCamera.capture(FocalApp.enrichment[l.id].kind,i,l.id);return c.lensId==='tamron'&&c.focal>=28&&c.focal<=75&&c.aperture>=2.8&&c.aperture<=22}))''')
 go('#camera');assert page.locator('.sony-guide-grid article').count()==1;assert page.locator('[data-guide-lens]').count()==1
 go('#learn/N01-L01');assert page.locator('#pilot-quiz-form [data-question]').count()==6
 assert page.locator('#pilot-quiz-form [data-diagram-kind=firstshot]').count()==1
 geometry=[]
 for i in range(3):
  page.locator(f'[data-pilot-step="{i}"]').click();geometry.append(page.locator('#pilot-diagram svg').inner_html())
 assert len(set(geometry))==3
 grade('#pilot-quiz-form',PILOT['questions'],'pilot');assert page.locator('.learning-correction.correct').count()==6
 assert page.evaluate('FocalLearningCore.estimate(FocalLearning.data.academy.skills[0],FocalLearning.state).stage')=='understood'
 def practice():
  go('#practice/SK-camera')
  for i in range(2):
   for key,val in [('focal','50'),('aperture','4'),('shutter','1/250'),('iso','400')]:page.locator(f'[name="{key}-{i}"]').fill(val)
  page.locator('[name=observation]').fill('Le détail choisi est net sur les deux vues. Sur la deuxième photo, mon cadrage enlève le bord de fenêtre clair qui détournait le regard du sujet principal.')
  page.locator('[name=justification]').fill('Je garde le cadrage plus serré parce que la forme claire ne concurrence plus mon sujet.')
  for i in range(3):page.locator(f'[name="criterion-{i}"]').check()
  page.locator('#practice-form button[type=submit]').click();assert 'Séance enregistrée' in page.locator('.learning-status').inner_text()
 practice();assert page.evaluate('FocalLearningCore.estimate(FocalLearning.data.academy.skills[0],FocalLearning.state).stage')=='applied'
 # Advancing the clock exercises real overdue and repeated-evidence transitions.
 page.clock.set_fixed_time(start+timedelta(days=8));go('#skills');assert 'À réviser' in page.locator('[data-skill=SK-camera]').inner_text()
 go('#review/SK-camera');grade('#review-form',PILOT['questions'],'review');practice()
 assert page.evaluate('FocalLearningCore.estimate(FocalLearning.data.academy.skills[0],FocalLearning.state).stage')=='mastered'
 print('PASS: onboarding, real diagnostic, pilot, one-lens constraints across 144 states, repeated practice and spaced review.',flush=True)
 # Search does not turn planned coverage into accessible fake lessons.
 go('#knowledge');assert page.locator('.learning-search-result').count()==48
 page.locator('#knowledge-status').select_option('planned');assert page.locator('.learning-search-result').count()==192;assert page.locator('.learning-search-result a').count()==0
 page.locator('#knowledge-status').select_option('available');page.locator('#knowledge-query').fill('sensibilite');assert page.locator('.learning-search-result').count()==1
 go('#shoot');assert page.locator('#shoot-scenario option').count()==10
 for scenario in page.locator('#shoot-scenario option').evaluate_all('els=>els.map(e=>e.value)'):
  page.locator('#shoot-scenario').select_option(scenario);assert 'Tamron' in page.locator('.learning-shoot-card h2').inner_text()
 # A second tab must not erase an in-progress observation field.
 go('#practice/SK-camera');page.locator('[name=observation]').fill('Mon brouillon non enregistré reste ici.')
 other=context.new_page();other.goto(BASE+'/#skills');other.wait_for_function('!!window.FocalApp');other.locator('#review-pace').select_option('wide');page.wait_for_selector('.learning-sync');assert page.locator('[name=observation]').input_value()=='Mon brouillon non enregistré reste ici.';other.close()
 # Export both versions; old imports retain the new profile and history.
 go('#progress');page.on('dialog',lambda d:d.accept())
 with page.expect_download() as result:page.locator('#export').click()
 exported=json.loads(Path(result.value.path()).read_text());assert exported['state']['notes']['N01-L02']==OLD['notes']['N01-L02'];assert len(exported['learning']['practice'])==2
 invalid=json.loads(json.dumps(exported));invalid['learning']['version']=999
 page.locator('#import').set_input_files({'name':'future.json','mimeType':'application/json','buffer':json.dumps(invalid).encode()});page.wait_for_function('document.querySelector("#toast").textContent.includes("Import impossible")');assert page.evaluate('FocalLearning.state.practice.length')==2
 legacy={'version':1,'state':exported['state']}
 page.locator('#import').set_input_files({'name':'legacy.json','mimeType':'application/json','buffer':json.dumps(legacy).encode()});page.wait_for_function('document.querySelector("#toast").textContent.includes("importé")');assert page.evaluate('FocalLearning.state.profile.activeLensId')=='tamron'
 page.locator('#import').set_input_files({'name':'full.json','mimeType':'application/json','buffer':json.dumps(exported).encode()});page.wait_for_function('document.querySelector("#toast").textContent.includes("importé")');page.reload();page.wait_for_function('!!window.FocalApp');assert page.evaluate('FocalLearning.state.practice.length')==2
 # Custom conservative limits work in the calculator, scenarios and restored evidence.
 go('#profile');page.locator('[name=ownedLensIds][value=tamron]').uncheck();page.locator('[name=ownedLensIds][value=user-lens]').check()
 for key,val in [('lensName','Mon zoom 24–105 f/4'),('focalMin','24'),('focalMax','105'),('maxAperture','4'),('minAperture','22')]:page.locator(f'[name={key}]').fill(val)
 page.locator('#profile-form button[type=submit]').click();page.wait_for_url('**/#home');go('#lesson/N01-L03/visual');assert page.locator('#dof-lens').input_value()=='user-lens';assert page.locator('#apertureOut').inner_text()=='f/4';assert page.locator('#scenario-title').inner_text()=='f/4'
 assert page.evaluate('FocalLearning.state.practice[0].trials[0].lensId')=='tamron'
 print('PASS: search availability, ten shooting scenarios, concurrent tab drafts, full/legacy imports, invalid version rejection and custom lens.',flush=True)
 for width in [360,390,768,1024,1440]:
  page.set_viewport_size({'width':width,'height':900})
  for route in ['#home','#profile','#diagnostic','#skills','#learn/N01-L01','#review/SK-camera','#practice/SK-camera','#knowledge','#shoot','#lesson/N03-L01/visual']:
   go(route);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,route)
 go('#learn/N01-L01');page.screenshot(path=str(ARTIFACTS/'v2-pilot-desktop.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844});go('#home');page.screenshot(path=str(ARTIFACTS/'v2-home-mobile.png'),full_page=True)
 assert not errors,errors
 # Unreadable new-model storage remains recoverable, and never erases old data.
 page.evaluate('localStorage.setItem("focal_academy_learning_v2","{corrompu")');go('#skills');page.reload();page.wait_for_function('!!window.FocalApp');assert page.locator('.learning-alert').count()==1;assert page.locator('#recovery-export').count()==1
 assert page.evaluate('FocalApp.state.notes["N01-L02"]')==OLD['notes']['N01-L02']
 browser.close()
print('PASS: 50 responsive route/width combinations, corrupt-data recovery, preserved legacy notes, no JavaScript errors.')

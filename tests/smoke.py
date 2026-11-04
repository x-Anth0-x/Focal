"""End-to-end readiness checks against the served static site.
Run: FOCAL_URL=http://127.0.0.1:3000 python tests/smoke.py
Requires Playwright and Chromium; neither is a runtime dependency of the site.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('FOCAL_URL','http://127.0.0.1:3000').rstrip('/')
CONTENT=json.loads((ROOT/'lesson-content.json').read_text())
CATALOG=json.loads((ROOT/'curriculum.json').read_text())
REFERENCE=json.loads((ROOT/'lesson_reference.json').read_text())
assert len(CONTENT)==len(CATALOG)==48
assert len({q['q'] for lesson in CONTENT.values() for q in lesson['questions']})==96
assert sum(len(x['scenarios']) for x in CONTENT.values())==144

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--use-gl=angle','--disable-webgpu'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(BASE+'/#courses')
    page.wait_for_selector('.course-card')
    assert page.locator('.course-card').count()==48
    page.locator('#course-search').fill('sensibilite')
    assert page.locator('.course-card').count()==1  # Accent-insensitive search.
    page.locator('#course-search').fill('aucun-resultat-xyz')
    page.locator('#clear-search').click()
    assert page.locator('.course-card').count()==48
    page.locator('#level-filter').select_option('8')
    assert page.locator('.course-card').count()==6

    for lesson in CATALOG:
        id=lesson['id']
        page.goto(BASE+'/#lesson/'+id)
        page.wait_for_selector('.lesson-overview')
        assert page.locator('h1').inner_text()==lesson['titre'],id
        assert page.locator('.chapter').count()==6,id
        assert page.locator('.concept-preview .spatial-preview').count()==1,id
        # The actual shared image must be available, not just an element or placeholder.
        assert page.evaluate("async()=>{const r=await fetch('assets/academy-scenes.png');return r.ok&&(await r.blob()).size>10000}")
        page.locator('[data-read="0"]').check()
        page.locator('#tab-visual').click()
        for i,scenario in enumerate(CONTENT[id]['scenarios']):
            page.locator(f'[data-scenario="{i}"]').click()
            assert page.locator('#scenario-explanation').inner_text()==scenario['explanation'],id
            assert page.locator('#workshop-art .spatial-view').get_attribute('data-title').endswith(scenario['label'])
        assert page.locator('.comparison-card').count()==3
        page.locator('#tab-mission').click()
        note=f"Séance {id} : j’ai comparé mes réglages et noté les différences observées."
        page.locator('#fieldNotes').fill(note)
        page.locator('#saveNotes').click()
        page.locator('#practiceDone').check()
        page.locator('#tab-quiz').click()
        qs=REFERENCE['questions'] if id==REFERENCE['id'] else CONTENT[id]['questions']
        if id=='N01-L01':
            page.locator('#finish').click()
            assert 'Pour valider' in page.locator('#finishStatus').inner_text()
            wrong=(qs[0]['correct']+1)%len(qs[0]['a'])
            page.locator(f'[data-q="0"][data-a="{wrong}"]').click()
            assert 'À revoir' in page.locator('.answer-feedback').first.inner_text()
        for i,q in enumerate(qs):
            page.locator(f'[data-q="{i}"][data-a="{q["correct"]}"]').click()
        assert page.locator('.answer-feedback.good').count()==len(qs),id
        assert page.locator('#score').inner_text().startswith(f'{len(qs)} / {len(qs)}'),id
        page.locator('#finish').click()
        assert 'Leçon validée' in page.locator('#finishStatus').inner_text(),id
        page.locator('#tab-resources').click()
        assert len(page.locator('.related-lesson').all())==5
        assert CONTENT[id]['key'] in page.locator('#pane-resources').inner_text()
    page.reload()
    page.wait_for_selector('#navprogress')
    page.wait_for_function("document.querySelector('#navprogress').textContent==='48'")
    page.goto(BASE+'/#progress')
    page.wait_for_selector('.progress-hero')
    assert '48 / 48' in page.locator('.progress-hero h2').inner_text()
    assert page.locator('.progress-symbol.passed').count()==48
    with page.expect_download() as result:
        page.locator('#export').click()
    download_path=result.value.path()
    exported=json.loads(Path(download_path).read_text())
    assert len(exported['state']['notes'])==48
    assert len(exported['state']['completedV2'])==48
    # Exercise import using a fresh browser context so we do not damage the completed run.
    imported=browser.new_page()
    imported.goto(BASE+'/#progress');imported.wait_for_selector('#import')
    imported.on('dialog',lambda d:d.accept())
    imported.locator('#import').set_input_files({'name':'focal.json','mimeType':'application/json','buffer':json.dumps(exported).encode()})
    imported.wait_for_function("document.querySelector('#navprogress').textContent==='48'")
    imported.reload();imported.wait_for_selector('.progress-hero')
    assert '48 / 48' in imported.locator('.progress-hero h2').inner_text()
    imported.locator('#import').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{bad'})
    imported.wait_for_function("document.querySelector('#toast').textContent.includes('Import impossible')")
    assert '48 / 48' in imported.locator('.progress-hero h2').inner_text()
    imported.close()
    # Original learner records migrate without promoting old read markers to validations.
    migrated=browser.new_page()
    migrated.goto(BASE+'/#courses');migrated.wait_for_selector('.course-card')
    old={'done':{'N01-L03':True,'N02-L01':True},'notes':{'N02-L01':'Ancien carnet préservé'},'practice':{'N01-L03':True},'answers':{'N01-L03':{str(i):q['correct'] for i,q in enumerate(REFERENCE['questions'])}}}
    migrated.evaluate('(raw)=>localStorage.setItem("focal_academy_web_v1",JSON.stringify(raw))',old)
    migrated.reload();migrated.wait_for_function("document.querySelector('#navprogress').textContent==='1'")
    migrated.goto(BASE+'/#lesson/N02-L01/mission');migrated.wait_for_selector('#fieldNotes')
    assert migrated.locator('#fieldNotes').input_value()=='Ancien carnet préservé'
    migrated.close()
    # Physics, keyboard navigation, responsive layout and refreshable deep links.
    page.goto(BASE+'/#lesson/N01-L03/visual');page.wait_for_selector('#dofOut')
    assert page.locator('#dofOut').inner_text()=='0,26 m'
    page.locator('#aperture').fill('9');page.locator('#focal').fill('24');page.locator('#distance').fill('10')
    assert page.locator('#farOut').inner_text()=='∞'
    assert page.locator('#nearOut').inner_text()=='0,59 m'
    page.locator('#resetLab').click()
    assert page.locator('#dofOut').inner_text()=='0,26 m'
    page.locator('#tab-visual').focus();page.keyboard.press('ArrowRight')
    assert page.locator('#pane-mission').is_visible()
    page.reload();page.wait_for_selector('#pane-mission')
    assert page.locator('#pane-mission').is_visible()
    for width in [360,390,520,768,1024,1440]:
        page.set_viewport_size({'width':width,'height':900})
        for path in ['#courses','#lesson/N03-L05/visual','#lesson/N08-L05/quiz','#progress']:
            page.goto(BASE+'/'+path);page.wait_for_selector('.page-heading')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,path)
    page.set_viewport_size({'width':390,'height':844})
    page.goto(BASE+'/#courses');page.wait_for_selector('#menu-toggle')
    assert not page.locator('#sidebar-content').is_visible()
    page.locator('#menu-toggle').click();assert page.locator('#sidebar-content').is_visible()
    page.locator('[data-level="5"]').click();page.wait_for_selector('.course-card')
    assert page.locator('.course-card').count()==6
    assert not page.locator('#sidebar-content').is_visible()
    page.goto(BASE+'/#lesson/missing');page.wait_for_selector('.empty-state')
    assert 'Cette leçon' in page.locator('h1').inner_text()
    assert errors==[],errors
    browser.close()
print('PASS: 48 lessons × course/artwork/3 scenarios/mission/quiz/memo; 48 validations; export/import; original state migration; physics; deep links; keyboard; 6 viewport sizes; mobile navigation; no JavaScript errors.')

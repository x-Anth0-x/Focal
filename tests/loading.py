"""Regressions: course previews, pending GPUs, blocked modules and independent lesson tabs."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('FOCAL_URL','http://127.0.0.1:3000').rstrip('/')+'/'
FLAGS=['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--use-gl=angle','--disable-webgpu']

def menus(page):
    for tab in ['mission','quiz','resources','course','visual']:
        page.locator('#tab-'+tab).click()
        assert page.locator('#pane-'+tab).is_visible(),tab

def ready(page):
    page.wait_for_selector('#workshop-art .spatial-interactive[data-state="ready"]',timeout=25000)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=FLAGS)
    # WebGPU availability probe hangs. Previews must not make the probe at all.
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script("window.adapterRequests=0;Object.defineProperty(navigator,'gpu',{configurable:true,value:{requestAdapter(){adapterRequests++;return new Promise(()=>{})}}})")
    page.goto(BASE+'#lesson/N01-L03/course')
    page.wait_for_selector('.concept-preview .spatial-preview[data-state="ready"]')
    assert page.evaluate('adapterRequests')==0
    page.locator('.concept-preview [data-open-spatial]').click();ready(page)
    assert page.locator('#pane-visual').is_visible()
    assert page.locator('#workshop-art .spatial-view').get_attribute('data-renderer')=='webgl2'
    menus(page)
    page.locator('.comparison-card').nth(2).locator('[data-open-spatial]').click();ready(page)
    assert page.locator('[data-scenario="2"]').get_attribute('aria-pressed')=='true'
    assert page.locator('#workshop-art .spatial-view').get_attribute('data-step')=='2'
    page.locator('#tab-mission').click();page.locator('#fieldNotes').fill('Mission après rétablissement du chargement 3D.');page.locator('#saveNotes').click()
    page.reload();page.wait_for_selector('#fieldNotes');assert page.locator('#fieldNotes').input_value().startswith('Mission après')
    assert not errors,errors
    page.close();print('PASS: previews independent of WebGPU, direct opening, all five tabs, selected comparison and saved notes.',flush=True)

    adapter="Object.defineProperty(navigator,'gpu',{configurable:true,value:{requestAdapter(){return Promise.resolve({})}}})"
    for phase in ['init','first-frame']:
        page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script(adapter)
        if phase=='init':
            module="export class WebGPURenderer{init(){return new Promise(()=>{})}dispose(){}}"
        else:
            module="import{WebGLRenderer}from './three.module.min.js';export class WebGPURenderer extends WebGLRenderer{constructor(p){super(p);this.backend={isWebGPUBackend:true}}init(){return Promise.resolve()}renderAsync(){return new Promise(()=>{})}}"
        page.route('**/vendor/three/three.webgpu.min.js',lambda route,request,body=module:route.fulfill(content_type='text/javascript',body=body))
        page.goto(BASE+'#lesson/N02-L03/visual');page.wait_for_selector('.lesson-tabs')
        menus(page)  # Do not wait for the failed graphics initialization to finish.
        if phase=='first-frame':
            page.goto(BASE+'#glossary/ouverture')
            page.wait_for_selector('.spatial-interactive[data-state="ready"]',timeout=25000)
            assert page.locator('.spatial-view').get_attribute('data-renderer')=='webgl2'
            page.goto(BASE+'#lesson/N02-L03/visual')
        ready(page)
        assert page.locator('#workshop-art .spatial-view').get_attribute('data-renderer')=='webgl2'
        page.locator('.spatial-range').fill('0.75')
        assert page.locator('#scenario-title').inner_text()=='Exploration libre'
        assert not errors,errors
        page.close();print('PASS: hanging WebGPU '+phase+' falls back to real WebGL2; menus remain accessible.',flush=True)

    # A failed module fetch is retriable and never blocks lesson navigation.
    page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    count=[0]
    def interrupt_once(route):
        count[0]+=1
        if count[0]==1:route.abort()
        else:route.continue_()
    page.route('**/spatial.js*',interrupt_once)
    page.goto(BASE+'#lesson/N01-L03/course');page.wait_for_selector('.concept-preview [data-spatial-retry]')
    page.locator('.concept-preview [data-spatial-retry]').click();page.wait_for_selector('.concept-preview .spatial-preview[data-state="ready"]')
    page.locator('.concept-preview [data-open-spatial]').click();ready(page);menus(page)
    assert not errors,errors
    page.close();print('PASS: failed module fetch, retry and lesson menus.',flush=True)
    browser.close()
print('PASS: no indefinite preparation state in simulated GPU stalls; glossary and lesson controls remain independent.')

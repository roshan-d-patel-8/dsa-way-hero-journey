"""Approved Box II lens/map integration, controls, and scope regression checks."""
import argparse
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:4185/dsa-way-hero-journey/')
parser.add_argument('--compare', action='store_true')
args = parser.parse_args()
output = Path('/tmp/dsa-gemba-production-review')
output.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width':1512,'height':982})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

    def enter(target, url):
        target.goto(url, wait_until='networkidle')
        target.get_by_role('button',name='SOUND ON',exact=True).click()
        target.get_by_role('button',name=re.compile('^Box 2:')).click()
        target.get_by_role('button',name='Enter the map room →',exact=True).click()

    def surroundings(target):
        return target.evaluate('''() => ['.keep-lens-heading','.keep-case-dispatch','.keep-lens-toolbar','.keep-lens-ledger','.keep-lens-instruction'].map(selector=>{
          const e=document.querySelector(selector);
          return {html:e.innerHTML,styles:[e,...e.querySelectorAll('h1,h2,button,p')].map(el=>{
            const s=getComputedStyle(el);return ['fontFamily','fontSize','fontWeight','color','backgroundColor','border','padding','boxShadow'].map(k=>s[k]);
          })};
        })''')

    if args.compare:
        original = browser.new_page(viewport={'width':1512,'height':982})
        enter(original,'https://roshan-d-patel-8.github.io/dsa-way-hero-journey/?v=c042086')
        baseline = surroundings(original)
        original.close()
    enter(page,args.url)
    if args.compare:
        assert surroundings(page)==baseline, 'Change outside the lens/map panel'
    expect(page.locator('.glp')).to_have_attribute('data-gemba-renderer','OPTICAL REVEAL · 3D PATH STUDY',timeout=30000)
    expect(page.locator('.glp .fallback')).to_be_hidden()
    assert page.locator('.glp canvas').count()==1
    assert page.locator('.glp-evidence button:disabled').count()==6
    page.locator('.glp').screenshot(path=str(output/'official-desktop.png'))
    page.get_by_role('button',name='ACTIVATE GEMBA LENS',exact=True).press('Enter')
    expect(page.locator('.glp-bottomline')).to_contain_text('LENS 100%',timeout=15000)
    page.locator('.glp').screenshot(path=str(output/'observed-desktop.png'))
    for i in range(6):
        page.locator('.glp-evidence button').nth(i).press('Enter')
        expect(page.locator('.glp-evidence .is-found')).to_have_count(i+1)
        expect(page.locator('.lens-comparison')).to_be_visible()
    page.get_by_role('button',name='Backtracking concept',exact=True).click()
    expect(page.locator('.glp-scope')).to_contain_text('ILLUSTRATIVE ONLY')
    expect(page.locator('.glp-bottomline')).to_contain_text('LENS 100%',timeout=15000)
    page.get_by_role('button',name='↺ Replay reveal',exact=True).click()
    expect(page.locator('.glp-bottomline')).not_to_contain_text('LENS 100%')
    expect(page.locator('.glp-bottomline')).to_contain_text('LENS 100%',timeout=15000)
    page.get_by_role('button',name='LOWER GEMBA LENS',exact=True).click()
    expect(page.locator('.glp-bottomline')).to_contain_text('LENS 00%',timeout=15000)
    assert page.locator('.glp-evidence button:disabled').count()==6
    page.get_by_role('button',name='ACTIVATE GEMBA LENS',exact=True).click()
    expect(page.locator('.glp-evidence .is-found')).to_have_count(6)
    page.get_by_role('button',name='Observed case',exact=True).click()
    page.get_by_role('button',name='Pause motion',exact=True).click()
    expect(page.locator('.glp-bottomline')).to_contain_text('LENS 100%')
    for width in [320,375,390,540,768,1024,1512,1920]:
        page.set_viewport_size({'width':width,'height':982})
        page.wait_for_timeout(150)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), f'Overflow at {width}'
        for el in page.locator('.glp .node,.glp-study button,.glp-evidence button').all():
            assert el.evaluate('e=>e.scrollWidth<=e.clientWidth+1'), f'Text overflow at {width}'
        if width in [390,1512]:
            page.locator('.glp').screenshot(path=str(output/f'observed-{width}.png'))
        if width==390:
            rects=page.locator('.glp .node.observed,.glp-annotation').evaluate_all('(els)=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,r:r.right,b:r.bottom}})')
            for i,a in enumerate(rects):
                for b in rects[i+1:]:
                    assert min(a['r'],b['r'])<=max(a['x'],b['x']) or min(a['b'],b['b'])<=max(a['y'],b['y']), 'Mobile label collision'
    page.emulate_media(reduced_motion='reduce')
    page.get_by_role('button',name='LOWER GEMBA LENS',exact=True).click()
    expect(page.locator('.glp-bottomline')).to_contain_text('LENS 00%')
    page.get_by_role('button',name='ACTIVATE GEMBA LENS',exact=True).click()
    expect(page.locator('.glp-bottomline')).to_contain_text('LENS 100%')
    page.evaluate("document.querySelector('.glp canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()")
    expect(page.locator('.glp')).to_have_attribute('data-gemba-renderer','ILLUSTRATED VIEW · GPU UNAVAILABLE')
    expect(page.locator('.glp .fallback')).to_be_visible()
    page.get_by_role('button',name='Open the case file →',exact=True).click()
    expect(page.locator('.keep-game-screen')).to_be_visible()
    expect(page.locator('.glp')).to_have_count(0)
    page.get_by_role('button',name='Return to title screen',exact=True).click()
    enter(page,args.url+'?gembaFallback=1')
    expect(page.locator('.glp')).to_have_attribute('data-gemba-renderer','ILLUSTRATED VIEW · NO WEBGL REQUIRED')
    page.get_by_role('button',name='ACTIVATE GEMBA LENS',exact=True).click()
    page.locator('.glp-evidence button').nth(3).click()
    expect(page.locator('.lens-comparison')).to_contain_text('7h 35m')
    assert not errors, errors
    print(json.dumps({'status':'passed','outside_panel_unchanged':args.compare,'evidence_seals':6,'widths':[320,375,390,540,768,1024,1512,1920],'keyboard':'passed','replay':'passed','reduced_motion':'passed','fallback':'passed','cleanup':'passed','errors':errors}))
    browser.close()

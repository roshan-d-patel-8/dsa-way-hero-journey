"""Browser checks for the four scoped instrument scenes; no production mutations."""
import argparse
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:4182/dsa-way-hero-journey/")
parser.add_argument("--screens-only", action="store_true")
args = parser.parse_args()
output = Path("/tmp/dsa-dimensional-review")
output.mkdir(exist_ok=True)
boxes = [3, 5, 8, 9]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1512, "height": 982})
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.goto(args.url, wait_until="networkidle")
    print("Loaded buttons:", page.get_by_role("button").all_text_contents()[:15], flush=True)
    sound = page.get_by_role("button", name="SOUND ON", exact=True)
    if sound.count():
        sound.click()

    def controls(target):
        target.evaluate("document.fonts.ready")
        return target.locator(".rc-intro-copy").evaluate("""e => ({
          text:e.innerText,
          styles:['h1','.primary-button','.fieldbook-copy','.fieldbook-label'].map(selector=>{
            const s=getComputedStyle(e.querySelector(selector));
            return Object.fromEntries(['fontFamily','fontSize','fontWeight','color','backgroundColor','padding','border','boxShadow'].map(key=>[key,s[key]]));
          })
        })""")

    baseline = {}
    if not args.screens_only and "127.0.0.1" in args.url:
        original = browser.new_page(viewport={"width": 1512, "height": 982})
        original.goto("https://roshan-d-patel-8.github.io/dsa-way-hero-journey/?v=85bddfe", wait_until="networkidle")
        for box in boxes:
            original.get_by_role("button", name=re.compile(f"^Box {box}:")).click()
            baseline[box] = controls(original)
            original.get_by_role("button", name="Return to title screen", exact=True).click()
        original.close()

    def enter(box):
        page.get_by_role("button", name=re.compile(f"^Box {box}:")).click()
        page.locator(".instrument-viewport").scroll_into_view_if_needed()
        expect(page.locator(".bespoke-scene")).to_have_attribute("data-instrument", "ready", timeout=45000)
        page.wait_for_function("""() => {const c=document.querySelector('.instrument-viewport canvas');return c?.dataset.renderedWidth===String(c.parentElement.clientWidth) && Number(c.dataset.frame)>1}""")

    def home():
        page.get_by_role("button", name="Return to title screen", exact=True).click()
        assert page.locator(".instrument-viewport canvas").count() == 0

    for box in boxes:
        enter(box)
        if baseline:
            assert controls(page) == baseline[box], f"Outside-panel change in Box {box}"
        page.locator(".bespoke-scene").screenshot(path=str(output / f"box-{box}-desktop.png"))
        page.screenshot(path=str(output / f"box-{box}-full.png"), full_page=True)
        home()
    page.set_viewport_size({"width": 390, "height": 844})
    for box in boxes:
        enter(box)
        page.locator(".bespoke-scene").screenshot(path=str(output / f"box-{box}-mobile.png"))
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
        home()
    if not args.screens_only:
        # Answer indices come from unchanged lesson specifications, not the graphics.
        source = (Path(__file__).resolve().parent.parent / "app/remainingChambersData.ts").read_text()
        answers = {}
        for box in boxes:
            section = source.split(f"  {box}: {{", 1)[1].split("\n  },", 1)[0]
            answers[box] = [int(x) for x in re.findall(r"correct: (\d)", section)]
            assert len(answers[box]) == 4
        page.set_viewport_size({"width": 1512, "height": 982})
        for box in boxes:
            enter(box)
            page.locator(".primary-button").first.press("Enter")
            for trial, correct in enumerate(answers[box]):
                for choice in [i for i in range(3) if i != correct] + [correct]:
                    page.locator(f'[data-rc-choice="{choice}"]').click()
                    expect(page.locator(".rc-feedback")).to_have_class(re.compile("is-correct" if choice == correct else "is-wrong"))
                expect(page.locator(".dimensional-instrument")).to_have_attribute("data-progress", str(trial + 1))
                page.locator(".instrument-viewport").scroll_into_view_if_needed()
                page.wait_for_function("p => document.querySelector('.instrument-viewport canvas')?.dataset.progress===String(p)", arg=trial + 1)
                if trial == 3:
                    page.locator(".bespoke-scene").screenshot(path=str(output / f"box-{box}-complete.png"))
                page.get_by_role("button", name=re.compile("Claim the chamber tool|Continue to the next trial")).press("Enter")
            expect(page.locator(".rc-complete")).to_be_visible()
            home()
            print(f"Box {box}: 12 answer paths and cleanup passed", flush=True)
        # Reduced motion renders state changes but has no idle animation.
        enter(3)
        page.emulate_media(reduced_motion="reduce")
        page.wait_for_timeout(250)
        frame = page.locator(".instrument-viewport canvas").get_attribute("data-frame")
        page.wait_for_timeout(350)
        assert page.locator(".instrument-viewport canvas").get_attribute("data-frame") == frame
        page.emulate_media(reduced_motion="no-preference")
        home()
        for box in boxes:
            enter(box)
            page.evaluate("document.querySelector('.instrument-viewport canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()")
            expect(page.locator(".bespoke-scene")).to_have_attribute("data-instrument", "fallback")
            expect(page.locator(".scene-original")).to_be_visible()
            page.locator(".primary-button").first.click()
            page.locator(f'[data-rc-choice="{answers[box][0]}"]').click()
            expect(page.locator(".rc-feedback")).to_have_class(re.compile("is-correct"))
            home()
        for width in [320, 375, 768, 1024]:
            page.set_viewport_size({"width": width, "height": 900})
            for box in boxes:
                enter(box)
                assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
                home()
    assert not errors, errors
    print(json.dumps({"status":"passed", "boxes":boxes, "screens_only":args.screens_only, "errors":errors}), flush=True)
    browser.close()

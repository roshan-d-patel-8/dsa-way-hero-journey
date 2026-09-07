"""Visual integration checks. Run against a local Pages preview before publication."""
import json
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get("DSA_TEST_URL", "http://127.0.0.1:4181/dsa-way-hero-journey/")
OUTPUT = Path(os.environ.get("DSA_TEST_OUTPUT", "/tmp/dsa-artifact-review"))
OUTPUT.mkdir(parents=True, exist_ok=True)
TITLES = [
    "THE HERALD'S FORGE", "THE CARTOGRAPHER'S UNSEEN PATH", "THE NORTH STAR OBSERVATORY",
    "THE DOOR OF WHYS", "THE ARMORY OF MANY KEYS", "THE CLOCKWORK PDSA LABORATORY",
    "THE EXPEDITION LEDGER", "THE DRAGON'S TRIBUNAL", "RETURN WITH THE ELIXIR",
]
STYLE = """e => {const s=getComputedStyle(e);return Object.fromEntries(
['fontFamily','fontSize','fontWeight','backgroundColor','color','borderRadius','boxShadow','padding','letterSpacing','border'].map(k=>[k,s[k]]))}"""

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1512, "height": 982})
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    # Compare the retained retro button to the currently published pre-upgrade site.
    baseline = browser.new_page(viewport={"width": 1512, "height": 982})
    baseline.goto("https://roshan-d-patel-8.github.io/dsa-way-hero-journey/?v=672602c", wait_until="networkidle")
    baseline.get_by_role("button", name=re.compile("^Box 3:")).click()
    baseline_style = baseline.locator(".primary-button").first.evaluate(STYLE)
    baseline_button = baseline.locator(".primary-button").first.inner_text()
    baseline.close()
    page.goto(URL, wait_until="networkidle")
    page.get_by_role("button", name="SOUND ON", exact=True).click()
    labels = []
    for number, title in enumerate(TITLES, 1):
        page.get_by_role("button", name=re.compile(f"^Box {number}:")).click()
        expect(page.locator(".incantation-scroll[data-fieldbook]").first).to_be_visible()
        page.evaluate("document.fonts.ready")
        assert page.evaluate("document.fonts.check('24px \"DSA Fieldbook Hand\"')")
        label = page.locator(".fieldbook-label").first.evaluate(STYLE)
        assert float(label["fontSize"].replace("px", "")) >= 11
        assert int(label["fontWeight"]) >= 700
        labels.append({"box": number, "label": label["fontSize"], "weight": label["fontWeight"]})
        if number == 3:
            assert page.locator(".primary-button").first.evaluate(STYLE) == baseline_style
            assert page.locator(".primary-button").first.inner_text() == baseline_button
            page.locator(".observatory-instrument").scroll_into_view_if_needed()
            expect(page.locator(".observatory-instrument")).to_have_attribute("data-rendering", "ready")
            page.wait_for_function("""() => {const c=document.querySelector('.observatory-instrument canvas');return c?.dataset.renderedWidth === String(c.parentElement.clientWidth)}""")
        page.screenshot(path=str(OUTPUT / f"box-{number}-desktop.png"), full_page=True)
        page.get_by_role("button", name="Return to title screen", exact=True).click()
        assert page.locator(".observatory-instrument canvas").count() == 0
    # All twelve feedback paths, completion, replay, and repeated renderer cleanup.
    page.get_by_role("button", name=re.compile("^Box 3:")).click()
    page.get_by_role("button", name="Enter The North Star Observatory →", exact=True).press("Enter")
    for trial, correct in enumerate([1, 0, 0, 1]):
        feedback = []
        for choice in [i for i in range(3) if i != correct] + [correct]:
            page.locator(f'[data-rc-choice="{choice}"]').click()
            expect(page.locator(".rc-feedback")).to_have_class(re.compile("is-correct" if choice == correct else "is-wrong"))
            feedback.append(page.locator(".rc-feedback p").inner_text())
        assert len(set(feedback)) == 3
        if trial == 0:
            page.screenshot(path=str(OUTPUT / "box-3-question.png"), full_page=True)
        page.get_by_role("button", name=re.compile("Claim the chamber tool|Continue to the next trial")).press("Enter")
    expect(page.get_by_role("heading", name="Destination drawn.", exact=True)).to_be_visible()
    assert page.locator(".observatory-instrument canvas").count() == 0
    for _ in range(4):
        page.get_by_role("button", name="Return to title screen", exact=True).click()
        page.get_by_role("button", name=re.compile("^Box 3:")).click()
        page.locator(".observatory-instrument").scroll_into_view_if_needed()
        expect(page.locator(".observatory-instrument")).to_have_attribute("data-rendering", "ready")
        assert page.locator(".observatory-instrument canvas").count() == 1
    # Phone layouts for all nine notes, plus the upgraded model.
    page.set_viewport_size({"width": 390, "height": 844})
    for number in range(1, 10):
        page.get_by_role("button", name="Return to title screen", exact=True).click()
        page.get_by_role("button", name=re.compile(f"^Box {number}:")).click()
        expect(page.locator(".fieldbook-copy").first).to_be_visible()
        assert page.locator(".fieldbook-sheet").first.evaluate("e=>e.scrollWidth<=e.clientWidth")
        if number == 3:
            page.locator(".observatory-instrument").scroll_into_view_if_needed()
            expect(page.locator(".observatory-instrument")).to_have_attribute("data-rendering", "ready")
        page.screenshot(path=str(OUTPUT / f"box-{number}-mobile.png"), full_page=True)
    for width in [320, 375, 768, 1024]:
        page.set_viewport_size({"width": width, "height": 900})
        page.get_by_role("button", name="Return to title screen", exact=True).click()
        page.get_by_role("button", name=re.compile("^Box 3:")).click()
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert page.locator(".fieldbook-sheet").evaluate("e=>e.scrollWidth<=e.clientWidth")
    page.emulate_media(reduced_motion="reduce")
    page.locator(".observatory-instrument").scroll_into_view_if_needed()
    expect(page.locator(".observatory-instrument")).to_have_attribute("data-rendering", "ready")
    page.evaluate("document.querySelector('.observatory-instrument canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()")
    expect(page.locator(".observatory-instrument")).to_have_attribute("data-rendering", "fallback")
    expect(page.locator(".observatory-instrument>img")).to_be_visible()
    page.get_by_role("button", name="Enter The North Star Observatory →", exact=True).click()
    page.locator('[data-rc-choice="1"]').click()
    expect(page.locator(".rc-feedback")).to_have_class(re.compile("is-correct"))
    assert not errors, errors
    print(json.dumps({"status": "passed", "fieldbooks": labels, "retro_button": "identical",
                      "answer_paths": 12, "repeated_entry": "passed", "phone_notes": 9,
                      "reduced_motion_and_context_loss": "passed", "errors": errors}))
    browser.close()

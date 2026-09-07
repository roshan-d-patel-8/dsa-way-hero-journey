"""Verify the approved department mix and every revised answer/feedback path."""
import argparse
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:4183/dsa-way-hero-journey/")
parser.add_argument("--smoke", action="store_true")
args = parser.parse_args()
departments = {1:"Gastroenterology",2:"Adult and Family Medicine → Cardiology",3:"Radiology",4:"Surgery",5:"Dermatology",6:"Adult and Family Medicine",7:"Pediatrics",8:"Emergency Medicine",9:"OB/GYN"}
output = Path("/tmp/dsa-department-review")
output.mkdir(exist_ok=True)
root = Path(__file__).resolve().parent.parent
data = (root / "app/remainingChambersData.ts").read_text()
source = (root / "app/QuestExperience.tsx").read_text()
answers = {}
for box in [3,5,8,9]:
    section = data.split(f"  {box}: {{",1)[1].split("\n  },",1)[0]
    answers[box] = [int(i) for i in re.findall(r"correct: (\d)", section)]
    assert len(answers[box]) == 4
answers[2] = [int(i) for i in re.findall(r"correct: (\d)", source.split("const KEEP_CASE_QUESTIONS:",1)[1].split("const KEEP_CASE_BRIEF",1)[0])]
answers[4] = [int(i) for i in re.findall(r"correct: (\d)", source.split("const QUESTIONS:",1)[1].split("const A3_BOXES",1)[0])]
assert len(answers[2]) == 4 and len(answers[4]) == 5
old_terms = re.compile(r"endoscopy|bowel-prep|post-procedure|pathology inbox|AFM → SPECIALTY", re.I)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1512,"height":982}, reduced_motion="reduce")
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(args.url, wait_until="networkidle")
    print("Loaded", len(page.get_by_role("button").all_text_contents()), "buttons", flush=True)
    page.get_by_role("button",name="SOUND ON",exact=True).click()
    def home():
        page.get_by_role("button",name="Return to title screen",exact=True).click()
    def enter(box):
        page.get_by_role("button",name=re.compile(f"^Box {box}:")).click()
    for width in [1512,390]:
        page.set_viewport_size({"width":width,"height":982 if width==1512 else 844})
        for box,department in departments.items():
            enter(box)
            note = page.locator(f'[data-case-department="{box}"]')
            expect(note).to_contain_text(department)
            expect(note).to_contain_text("Fictional case")
            expect(note).to_contain_text("not clinical standards")
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
            if box in answers:
                assert not old_terms.search(page.locator("main").inner_text()), box
            page.screenshot(path=str(output / f"box-{box}-{width}.png"),full_page=True)
            home()
    paths = 0
    if not args.smoke:
        page.set_viewport_size({"width":1512,"height":982})
        for box in [2,3,4,5,8,9]:
            enter(box)
            page.locator(".primary-button").first.press("Enter")
            if box == 2:
                page.get_by_role("button",name="ACTIVATE GEMBA LENS",exact=True).click()
                expect(page.locator(".keep-case-dispatch")).to_contain_text("CARDIOLOGY")
                page.get_by_role("button",name="Open the case file →",exact=True).click()
            for trial,correct in enumerate(answers[box]):
                for choice in [i for i in range(3) if i!=correct]+[correct]:
                    if box == 2:
                        page.locator(f'[data-keep-choice="{choice}"]').click()
                        expect(page.locator(".keep-feedback")).to_have_class(re.compile("correct" if choice==correct else "wrong"))
                    elif box == 4:
                        page.locator(".choice-list button").nth(choice).click()
                        expect(page.locator(".feedback-panel")).to_have_class(re.compile("answer" if choice==correct else "refusal"))
                    else:
                        page.locator(f'[data-rc-choice="{choice}"]').click()
                        expect(page.locator(".rc-feedback")).to_have_class(re.compile("is-correct" if choice==correct else "is-wrong"))
                    assert not old_terms.search(page.locator("main").inner_text()), (box,trial,choice)
                    paths += 1
                if box == 2:
                    page.locator(".keep-feedback button").press("Enter")
                elif box == 4:
                    page.locator(".next-button").press("Enter")
                else:
                    page.get_by_role("button",name=re.compile("Claim the chamber tool|Continue to the next trial")).press("Enter")
            expect(page.locator(".keep-complete-screen" if box==2 else ".complete-screen" if box==4 else ".rc-complete")).to_be_visible()
            assert not old_terms.search(page.locator("main").inner_text()), box
            home()
            print(f"Box {box}: {len(answers[box])} prompts, all feedback paths passed",flush=True)
        assert paths == 75
    assert not errors, errors
    print(json.dumps({"departments":departments,"intro_checks":18,"revised_answer_paths":paths,"errors":errors}),flush=True)
    browser.close()

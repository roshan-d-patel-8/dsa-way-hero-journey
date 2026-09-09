"""Verify that every post-Herald relic reveal plays its assigned MP3."""

import argparse
import json
import re
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:4186/dsa-way-hero-journey/")
args = parser.parse_args()

root = Path(__file__).resolve().parent.parent
data = (root / "app/remainingChambersData.ts").read_text()
source = (root / "app/QuestExperience.tsx").read_text()

answers = {}
for box in [3, 5, 6, 7, 8, 9]:
    section = data.split(f"  {box}: {{", 1)[1].split("\n  },", 1)[0]
    answers[box] = [int(index) for index in re.findall(r"correct: (\d)", section)]
    assert len(answers[box]) == 4
answers[2] = [int(index) for index in re.findall(
    r"correct: (\d)",
    source.split("const KEEP_CASE_QUESTIONS:", 1)[1].split("const KEEP_CASE_BRIEF", 1)[0],
)]
answers[4] = [int(index) for index in re.findall(
    r"correct: (\d)",
    source.split("const QUESTIONS:", 1)[1].split("const A3_BOXES", 1)[0],
)]

expected = {
    2: "box-2-lantern-zelda-secret-discovered.mp3",
    3: "box-3-compass-zelda-legendary-item.mp3",
    4: "box-4-five-whys-final-fantasy-fanfare.mp3",
    5: "box-5-quiver-cod-level-up.mp3",
    6: "box-6-learning-orb-pokemon-gym-badge.mp3",
    7: "box-7-war-map-smash-character-unlocked.mp3",
    8: "box-8-truthful-mirror-fortnite-victory.mp3",
    9: "box-9-elixir-super-mario-trap-remix.mp3",
}


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1512, "height": 982}, reduced_motion="reduce")
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.add_init_script("""
      window.__playedRelicAudio = [];
      HTMLMediaElement.prototype.play = function () {
        window.__playedRelicAudio.push(this.currentSrc || this.getAttribute('src'));
        return Promise.resolve();
      };
    """)
    page.goto(args.url, wait_until="networkidle")
    expect(page.get_by_role("button", name="SOUND ON", exact=True)).to_be_visible()

    def enter(box):
        page.get_by_role("button", name=re.compile(f"^Box {box}:")).click()
        page.locator(".primary-button").first.press("Enter")
        if box == 2:
            page.get_by_role("button", name="ACTIVATE GEMBA LENS", exact=True).click()
            page.get_by_role("button", name="Open the case file →", exact=True).click()

    def complete(box):
        for correct in answers[box]:
            if box == 2:
                page.locator(f'[data-keep-choice="{correct}"]').click()
                page.locator(".keep-feedback button").press("Enter")
            elif box == 4:
                page.locator(".choice-list button").nth(correct).click()
                page.locator(".next-button").press("Enter")
            else:
                page.locator(f'[data-rc-choice="{correct}"]').click()
                page.get_by_role("button", name=re.compile("Claim the chamber tool|Continue to the next trial")).press("Enter")

    played = {}
    for box in range(2, 10):
        page.set_viewport_size({"width": 1512 if box < 6 else 390, "height": 982 if box < 6 else 844})
        enter(box)
        complete(box)
        reveal = page.get_by_role("button", name=f"Awaken the sealed Box {box} relic", exact=True)
        expect(reveal).to_be_visible()
        audio = page.locator(".relic-reveal-stage audio")
        expect(audio).to_have_attribute("src", re.compile(f"relic-audio/{re.escape(expected[box])}$"))
        reveal.click()
        expect(page.locator(".relic-reveal-stage")).to_have_class(re.compile("is-revealed"))
        played[box] = page.evaluate("window.__playedRelicAudio.at(-1)")
        assert played[box].endswith(expected[box]), (box, played[box])
        page.get_by_role("button", name="Return to title screen", exact=True).click()

    assert len(page.evaluate("window.__playedRelicAudio")) == 8
    assert not errors, errors
    print(json.dumps({"status": "passed", "desktop_boxes": [2, 3, 4, 5], "mobile_boxes": [6, 7, 8, 9], "played": played, "errors": errors}))
    browser.close()

"""Verify the branded header lockup on desktop and compact responsive layouts."""

import argparse
import json
import re
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:4188/dsa-way-hero-journey/")
parser.add_argument("--output", default="/tmp/dsa-header-lockup")
args = parser.parse_args()

output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
results = []
expected_map_labels = [
    "Focus the Problem",
    "Understand the Current Condition",
    "Set a Clear Goal",
    "Analyze Root Causes",
    "Design Smart Countermeasures",
    "Run Rapid Experiments",
    "Complete the Plan",
    "Confirm the New State",
    "Capture Insights",
]

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for label, viewport, wordmark_range, subtitle_range, hero_range in [
        ("desktop", {"width": 1512, "height": 982}, (219, 221), (204, 206), (41, 43)),
        ("tablet", {"width": 980, "height": 900}, (184, 186), (189, 192), (41, 43)),
        ("mobile", {"width": 390, "height": 844}, (108, 111), (104, 107), (29, 31)),
        ("narrow", {"width": 320, "height": 760}, (83, 85), (81, 83), (23, 25)),
    ]:
        page = browser.new_page(viewport=viewport)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.goto(args.url, wait_until="networkidle")

        lockup = page.locator(".header-title")
        wordmark = page.locator(".header-wordmark")
        hero = page.locator(".header-pixel-hero")
        subtitle = page.locator(".header-subtitle-art")
        home_button = page.get_by_role("button", name="Return to title screen")
        home_icon = page.locator(".brand-home-icon")
        sound_button = page.get_by_role("button", name="SOUND ON", exact=True)
        map_button = page.get_by_role("button", name="QUEST MAP", exact=True)
        action_icons = page.locator(".header-action-icon")
        expect(home_button).to_be_visible()
        expect(home_icon).to_be_visible()
        expect(sound_button).to_be_visible()
        expect(map_button).to_be_visible()
        assert action_icons.count() == 2
        home_metrics = home_icon.evaluate(
            """image => ({
              complete: image.complete,
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight,
              renderedWidth: image.getBoundingClientRect().width,
            })"""
        )
        assert home_metrics["complete"]
        assert home_metrics["naturalWidth"] == 48
        assert home_metrics["naturalHeight"] == 48
        assert 27.5 <= home_metrics["renderedWidth"] <= 38
        action_metrics = action_icons.evaluate_all(
            """images => images.map(image => ({
              complete: image.complete,
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight,
              renderedWidth: image.getBoundingClientRect().width,
            }))"""
        )
        assert all(metric["complete"] for metric in action_metrics)
        assert all(metric["naturalWidth"] == 48 and metric["naturalHeight"] == 48 for metric in action_metrics)
        assert all(27.5 <= metric["renderedWidth"] <= 38 for metric in action_metrics)

        sound_tooltip = page.get_by_text("Sound on — click to mute", exact=True)
        map_tooltip = page.get_by_text("Open the quest map", exact=True)
        expect(sound_tooltip).to_be_hidden()
        sound_button.hover()
        expect(sound_tooltip).to_be_visible()
        page.mouse.move(1, viewport["height"] - 1)
        expect(sound_tooltip).to_be_hidden()
        map_button.hover()
        expect(map_tooltip).to_be_visible()
        page.mouse.move(1, viewport["height"] - 1)
        expect(map_tooltip).to_be_hidden()
        expect(lockup).to_be_visible()
        expect(wordmark).to_be_visible()
        expect(hero).to_be_visible()
        expect(subtitle).to_be_visible()
        wordmark_metrics = wordmark.evaluate(
            """image => ({
              complete: image.complete,
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight,
              renderedWidth: image.getBoundingClientRect().width,
              wordmarkLeft: image.getBoundingClientRect().left,
              heroRight: document.querySelector('.header-pixel-hero').getBoundingClientRect().right,
              wordmarkRight: image.getBoundingClientRect().right,
            })"""
        )
        assert wordmark_metrics["complete"]
        assert wordmark_metrics["naturalWidth"] == 744
        assert wordmark_metrics["naturalHeight"] == 136
        assert wordmark_metrics["heroRight"] > wordmark_metrics["wordmarkRight"]
        assert wordmark_range[0] <= wordmark_metrics["renderedWidth"] <= wordmark_range[1]
        subtitle_metrics = subtitle.evaluate(
            """image => ({
              complete: image.complete,
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight,
              renderedWidth: image.getBoundingClientRect().width,
              renderedHeight: image.getBoundingClientRect().height,
              subtitleLeft: image.getBoundingClientRect().left,
              subtitleRight: image.getBoundingClientRect().right,
            })"""
        )
        assert subtitle_metrics["complete"]
        assert subtitle_metrics["naturalWidth"] == 2012
        assert subtitle_metrics["naturalHeight"] == 211
        assert subtitle_range[0] <= subtitle_metrics["renderedWidth"] <= subtitle_range[1]
        wordmark_center = (wordmark_metrics["wordmarkLeft"] + wordmark_metrics["wordmarkRight"]) / 2
        subtitle_center = (subtitle_metrics["subtitleLeft"] + subtitle_metrics["subtitleRight"]) / 2
        assert abs(wordmark_center - subtitle_center) <= 0.5
        hero_metrics = hero.evaluate(
            """element => ({
              renderedWidth: element.getBoundingClientRect().width,
              renderedHeight: element.getBoundingClientRect().height,
            })"""
        )
        assert hero_range[0] <= hero_metrics["renderedWidth"] <= hero_range[1]
        sword = page.locator(".header-hero-sword")
        sword_resting = sword.evaluate("element => getComputedStyle(element).transform")
        hero.hover()
        page.wait_for_timeout(350)
        sword_swung = sword.evaluate("element => getComputedStyle(element).transform")
        assert sword_swung != sword_resting
        page.mouse.move(1, viewport["height"] - 1)
        hero.focus()
        page.wait_for_timeout(350)
        sword_focused = sword.evaluate("element => getComputedStyle(element).transform")
        assert sword_focused == sword_swung
        if label == "desktop":
            page.locator(".quest-header").screenshot(path=output / "desktop-sword-swing.png")

        map_button.click()
        map_drawer = page.locator(".quest-map")
        expect(map_drawer).to_have_class("quest-map is-open")
        map_labels = map_drawer.locator("ol li button b")
        assert map_labels.all_text_contents() == expected_map_labels
        map_layouts = map_drawer.locator("ol li button").evaluate_all(
            """buttons => buttons.map(button => {
              const label = button.querySelector('b');
              const buttonBox = button.getBoundingClientRect();
              const labelBox = label.getBoundingClientRect();
              return {
                contained: labelBox.left >= buttonBox.left && labelBox.right <= buttonBox.right &&
                  labelBox.top >= buttonBox.top && labelBox.bottom <= buttonBox.bottom,
                scrollWidth: button.scrollWidth,
                clientWidth: button.clientWidth,
              };
            })"""
        )
        assert all(item["contained"] for item in map_layouts), map_layouts
        assert all(item["scrollWidth"] <= item["clientWidth"] for item in map_layouts), map_layouts
        map_drawer.screenshot(path=output / f"map-{label}.png")
        page.get_by_role("button", name="Close quest map", exact=True).click()
        expect(map_drawer).to_have_class(re.compile(r"^quest-map\s*$"))

        page_metrics = page.evaluate(
            """() => ({
              scrollWidth: document.documentElement.scrollWidth,
              viewportWidth: window.innerWidth,
            })"""
        )
        ui_sound_starts = None
        if label == "desktop":
            page.evaluate(
                """() => {
                  window.__uiSoundStarts = 0;
                  class Param {
                    setValueAtTime() {}
                    exponentialRampToValueAtTime() {}
                  }
                  class Node {
                    connect() { return this; }
                  }
                  class Oscillator extends Node {
                    constructor() { super(); this.frequency = new Param(); this.type = 'triangle'; }
                    start() { window.__uiSoundStarts += 1; }
                    stop() {}
                  }
                  class Gain extends Node { constructor() { super(); this.gain = new Param(); } }
                  class FakeAudioContext {
                    constructor() { this.currentTime = 0; this.destination = {}; }
                    createOscillator() { return new Oscillator(); }
                    createGain() { return new Gain(); }
                    close() { return Promise.resolve(); }
                  }
                  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
                }"""
            )
            sound_button.click()
            expect(page.get_by_role("button", name="SOUND OFF", exact=True)).to_be_visible()
            page.get_by_role("button", name="SOUND OFF", exact=True).click()
            map_button.click()
            expect(page.locator(".quest-map")).to_have_class("quest-map is-open")
            page.get_by_role("button", name="Close quest map", exact=True).click()
            coin_button = page.get_by_role("button", name="Open the DSA Way mission, vision, and values")
            coin_button.click()
            expect(page.locator("#dsa-way-overview")).to_have_attribute("aria-hidden", "false")
            page.locator("#dsa-way-overview").get_by_role("button", name="Close the DSA Way overview").click()
            page.locator(".a3-tile").first.click()
            expect(page.locator(".forge-intro-screen")).to_be_visible()
            home_button.click()
            expect(page.locator(".a3-home")).to_be_visible()
            ui_sound_starts = page.evaluate("window.__uiSoundStarts")
            assert ui_sound_starts >= 18
        assert page_metrics["scrollWidth"] <= page_metrics["viewportWidth"] + 1
        assert not errors, errors
        page.locator(".quest-header").screenshot(path=output / f"{label}.png")
        results.append(
            {
                "viewport": label,
                "page": page_metrics,
                "home": home_metrics,
                "actions": action_metrics,
                "map": map_layouts,
                "uiSoundStarts": ui_sound_starts,
                "wordmark": wordmark_metrics,
                "subtitle": subtitle_metrics,
                "hero": hero_metrics,
                "swordResting": sword_resting,
                "swordSwung": sword_swung,
                "swordFocused": sword_focused,
                "errors": errors,
            }
        )
        page.close()
    browser.close()

print(json.dumps(results, indent=2))

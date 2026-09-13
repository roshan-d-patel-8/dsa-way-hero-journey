"""Verify the branded header lockup on desktop and compact responsive layouts."""

import argparse
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:4188/dsa-way-hero-journey/")
parser.add_argument("--output", default="/tmp/dsa-header-lockup")
args = parser.parse_args()

output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
results = []

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for label, viewport, lockup_visible in [
        ("desktop", {"width": 1512, "height": 982}, True),
        ("tablet", {"width": 980, "height": 900}, False),
        ("mobile", {"width": 390, "height": 844}, False),
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
        assert 30 <= home_metrics["renderedWidth"] <= 38
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
        assert all(30 <= metric["renderedWidth"] <= 38 for metric in action_metrics)

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
        if lockup_visible:
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
            assert 219 <= wordmark_metrics["renderedWidth"] <= 221
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
            assert 204 <= subtitle_metrics["renderedWidth"] <= 206
            assert 21 <= subtitle_metrics["renderedHeight"] <= 22
            wordmark_center = (wordmark_metrics["wordmarkLeft"] + wordmark_metrics["wordmarkRight"]) / 2
            subtitle_center = (subtitle_metrics["subtitleLeft"] + subtitle_metrics["subtitleRight"]) / 2
            assert abs(wordmark_center - subtitle_center) <= 0.5
        else:
            expect(lockup).to_be_hidden()
            wordmark_metrics = None
            subtitle_metrics = None

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
                "uiSoundStarts": ui_sound_starts,
                "wordmark": wordmark_metrics,
                "subtitle": subtitle_metrics,
                "errors": errors,
            }
        )
        page.close()
    browser.close()

print(json.dumps(results, indent=2))

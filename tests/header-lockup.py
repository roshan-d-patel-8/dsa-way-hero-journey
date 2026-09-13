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
        expect(home_button).to_be_visible()
        expect(home_icon).to_be_visible()
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
                  heroRight: document.querySelector('.header-pixel-hero').getBoundingClientRect().right,
                  wordmarkRight: image.getBoundingClientRect().right,
                })"""
            )
            assert wordmark_metrics["complete"]
            assert wordmark_metrics["naturalWidth"] == 744
            assert wordmark_metrics["naturalHeight"] == 136
            assert wordmark_metrics["heroRight"] > wordmark_metrics["wordmarkRight"]
            assert 150 <= wordmark_metrics["renderedWidth"] <= 190
            subtitle_metrics = subtitle.evaluate(
                """image => ({
                  complete: image.complete,
                  naturalWidth: image.naturalWidth,
                  naturalHeight: image.naturalHeight,
                  renderedWidth: image.getBoundingClientRect().width,
                  renderedHeight: image.getBoundingClientRect().height,
                })"""
            )
            assert subtitle_metrics["complete"]
            assert subtitle_metrics["naturalWidth"] == 2012
            assert subtitle_metrics["naturalHeight"] == 211
            assert 132 <= subtitle_metrics["renderedWidth"] <= 149
            assert 13 <= subtitle_metrics["renderedHeight"] <= 16
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
        assert page_metrics["scrollWidth"] <= page_metrics["viewportWidth"] + 1
        assert not errors, errors
        page.locator(".quest-header").screenshot(path=output / f"{label}.png")
        results.append(
            {
                "viewport": label,
                "page": page_metrics,
                "home": home_metrics,
                "wordmark": wordmark_metrics,
                "subtitle": subtitle_metrics,
                "errors": errors,
            }
        )
        page.close()
    browser.close()

print(json.dumps(results, indent=2))

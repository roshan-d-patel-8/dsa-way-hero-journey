"""Verify the DSA Way star-coin drawer on desktop and mobile."""

import argparse
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:4189/dsa-way-hero-journey/")
parser.add_argument("--output", default="/tmp/dsa-brand-drawer")
args = parser.parse_args()

output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
results = []

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for label, viewport in [
        ("desktop", {"width": 1512, "height": 982}),
        ("mobile", {"width": 390, "height": 844}),
    ]:
        page = browser.new_page(viewport=viewport)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.goto(args.url, wait_until="networkidle")

        expect(page.get_by_role("heading", name="Learn the Nine-Box A3, One Quest at a Time.")).to_be_visible()
        expect(page.get_by_text("New to the A3? Start anywhere.", exact=False)).to_be_visible()
        assert page.get_by_text("A DSA LEARNING QUEST", exact=True).count() == 0
        page.screenshot(path=output / f"landing-{label}.png")

        opener = page.get_by_role("button", name="Open the DSA Way mission, vision, and values")
        panel = page.locator("#dsa-way-overview")
        infographic = panel.locator("figure > img")
        expect(opener).to_be_visible()
        expect(opener).to_have_attribute("aria-expanded", "false")
        expect(panel).to_have_attribute("aria-hidden", "true")

        closed_metrics = opener.evaluate(
            """button => ({
              top: button.getBoundingClientRect().top,
              headerBottom: document.querySelector('.quest-header').getBoundingClientRect().bottom,
            })"""
        )
        assert closed_metrics["top"] > closed_metrics["headerBottom"]

        opener.click()
        closer = page.get_by_role("button", name="Close the DSA Way overview").first
        expect(closer).to_have_attribute("aria-expanded", "true")
        expect(panel).to_have_attribute("aria-hidden", "false")
        expect(infographic).to_be_visible()
        page.wait_for_timeout(550)

        open_metrics = infographic.evaluate(
            """image => {
              const drawer = document.querySelector('.brand-drawer').getBoundingClientRect();
              return {
                complete: image.complete,
                naturalWidth: image.naturalWidth,
                naturalHeight: image.naturalHeight,
                drawerLeft: drawer.left,
                drawerRight: drawer.right,
                scrollWidth: document.documentElement.scrollWidth,
                viewportWidth: window.innerWidth,
              };
            }"""
        )
        assert open_metrics["complete"]
        assert open_metrics["naturalWidth"] == 1672
        assert open_metrics["naturalHeight"] == 941
        assert abs(open_metrics["drawerLeft"]) <= 1
        assert open_metrics["drawerRight"] <= open_metrics["viewportWidth"] - 50
        assert open_metrics["scrollWidth"] <= open_metrics["viewportWidth"] + 1
        assert not errors, errors
        page.screenshot(path=output / f"drawer-{label}.png")

        page.keyboard.press("Escape")
        expect(panel).to_have_attribute("aria-hidden", "true")
        results.append({"viewport": label, "closed": closed_metrics, "open": open_metrics, "errors": errors})
        page.close()
    browser.close()

print(json.dumps(results, indent=2))

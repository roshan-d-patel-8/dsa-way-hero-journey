"""Verify the Box 1 dimensional forge instrument on desktop and mobile."""

import argparse
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:4187/dsa-way-hero-journey/")
parser.add_argument("--output", default="/tmp/dsa-forge-instrument")
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
        page.get_by_role("button", name="Box 1: Reason for Action. Enter THE HERALD'S FORGE").click()
        instrument = page.locator(".forge-dimensional-instrument")
        expect(instrument).to_be_visible()
        expect(page.locator(".forge-intro-art")).to_have_attribute("data-forge-instrument", "ready")
        canvas = instrument.locator("canvas")
        expect(canvas).to_be_visible()
        canvas.wait_for(state="visible")
        page.wait_for_timeout(450)
        metrics = canvas.evaluate("""canvas => ({
          width: canvas.width,
          height: canvas.height,
          frames: Number(canvas.dataset.frame || 0),
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        })""")
        assert metrics["width"] > 100 and metrics["height"] > 100
        assert metrics["frames"] > 0
        assert metrics["scrollWidth"] <= metrics["viewportWidth"] + 1
        assert not errors, errors
        page.locator(".forge-intro-art").screenshot(path=output / f"{label}.png")
        results.append({"viewport": label, "metrics": metrics, "errors": errors})
        page.close()
    browser.close()

print(json.dumps(results, indent=2))

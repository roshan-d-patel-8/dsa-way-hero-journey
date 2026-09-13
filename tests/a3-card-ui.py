"""Verify the hover-only play action and Blackwood quest-label artwork."""

import argparse
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:4189/")
parser.add_argument("--output", default="/tmp/dsa-a3-card-ui")
args = parser.parse_args()

output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1512, "height": 982})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.goto(args.url, wait_until="networkidle")

    tiles = page.locator(".a3-tile")
    badges = page.locator(".a3-playable-badge")
    labels = page.locator(".a3-quest-name-art")
    assert tiles.count() == badges.count() == labels.count() == 9
    assert badges.all_text_contents() == ["CLICK TO PLAY"] * 9
    expect(badges.first).to_be_hidden()

    unloaded = labels.evaluate_all(
        "images => images.filter(image => !image.complete || image.naturalWidth === 0).length"
    )
    assert unloaded == 0

    tiles.first.hover()
    expect(badges.first).to_be_visible()
    expect(labels.first).to_be_visible()
    page.wait_for_timeout(250)
    metrics = badges.first.evaluate(
        """element => {
          const style = getComputedStyle(element);
          return {
            background: style.backgroundColor,
            fontFamily: style.fontFamily,
            opacity: style.opacity,
          };
        }"""
    )
    label_metrics = labels.first.evaluate(
        """image => ({
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          renderedHeight: image.getBoundingClientRect().height,
        })"""
    )
    assert metrics["background"] == "rgb(255, 196, 94)"
    assert "Press Start 2P" in metrics["fontFamily"]
    assert metrics["opacity"] == "1"
    assert label_metrics["complete"]
    assert label_metrics["naturalWidth"] > 1500
    assert label_metrics["naturalHeight"] >= 130
    assert 8.5 <= label_metrics["renderedHeight"] <= 12, label_metrics
    page.locator(".a3-grid").screenshot(path=output / "hover.png")

    page.mouse.move(1, 1)
    expect(badges.first).to_be_hidden()
    tiles.nth(1).focus()
    expect(badges.nth(1)).to_be_visible()
    assert not errors, errors

    touch_context = browser.new_context(
        viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True
    )
    touch_page = touch_context.new_page()
    touch_errors = []
    touch_page.on("pageerror", lambda error: touch_errors.append(str(error)))
    touch_page.on(
        "console",
        lambda message: touch_errors.append(message.text) if message.type == "error" else None,
    )
    touch_page.goto(args.url, wait_until="networkidle")
    expect(touch_page.locator(".a3-playable-badge").first).to_be_hidden()
    expect(touch_page.locator(".a3-tile-overlay").first).to_be_visible()
    touch_page.locator(".a3-grid-viewport").screenshot(path=output / "touch.png")
    assert not touch_errors, touch_errors
    touch_context.close()

    result = {
        "tiles": tiles.count(),
        "labelArtwork": labels.count(),
        "badge": metrics,
        "firstLabel": label_metrics,
        "touchBadgeHidden": True,
        "errors": errors,
    }
    browser.close()

print(json.dumps(result, indent=2))

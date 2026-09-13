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
    for index in range(9):
        assert badges.nth(index).locator(":scope > span").all_text_contents() == [
            "CLICK",
            "TO",
            "PLAY",
        ]
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
    assert 27.5 <= label_metrics["renderedHeight"] <= 29.5, label_metrics
    page.locator(".a3-grid").screenshot(path=output / "hover.png")

    tiles.nth(5).hover()
    expect(labels.nth(5)).to_be_visible()
    page.wait_for_timeout(250)
    longest_label_metrics = labels.nth(5).evaluate(
        """image => {
          const imageBox = image.getBoundingClientRect();
          const tileBox = image.closest('.a3-tile').getBoundingClientRect();
          return {
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            renderedWidth: imageBox.width,
            renderedHeight: imageBox.height,
            contained: imageBox.left >= tileBox.left && imageBox.right <= tileBox.right,
          };
        }"""
    )
    assert longest_label_metrics["contained"], longest_label_metrics
    assert 51 <= longest_label_metrics["renderedHeight"] <= 54, longest_label_metrics
    natural_ratio = longest_label_metrics["naturalWidth"] / longest_label_metrics["naturalHeight"]
    rendered_ratio = longest_label_metrics["renderedWidth"] / longest_label_metrics["renderedHeight"]
    assert abs(natural_ratio - rendered_ratio) <= 0.05, longest_label_metrics
    page.locator(".a3-grid").screenshot(path=output / "longest-hover.png")

    layout_checks = []
    for viewport_width in (1512, 980):
        page.set_viewport_size({"width": viewport_width, "height": 982})
        for index in range(9):
            tiles.nth(index).hover()
            page.wait_for_timeout(220)
            layout = tiles.nth(index).evaluate(
                """tile => {
                  const badge = tile.querySelector('.a3-playable-badge');
                  const badgeBox = badge.getBoundingClientRect();
                  const wordBoxes = [...badge.children].map(word => word.getBoundingClientRect());
                  const textBoxes = [...tile.querySelectorAll(
                    '.a3-tile-overlay small, .a3-tile-overlay b, .a3-tile-subtitle, .a3-quest-name-art'
                  )].map(element => ({
                    selector: element.matches('small') ? 'box-number'
                      : element.matches('b') ? 'title'
                      : element.matches('.a3-tile-subtitle') ? 'subtitle'
                      : 'quest-label',
                    box: element.getBoundingClientRect(),
                  }));
                  const overlaps = (a, b) =>
                    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
                  return {
                    width: badgeBox.width,
                    height: badgeBox.height,
                    wordTops: wordBoxes.map(box => box.top),
                    wordCenters: wordBoxes.map(box => box.left + box.width / 2),
                    badgeCenter: badgeBox.left + badgeBox.width / 2,
                    collisions: textBoxes.filter(item => overlaps(badgeBox, item.box)).map(item => item.selector),
                  };
                }"""
            )
            assert abs(layout["width"] - layout["height"]) <= 1, layout
            assert layout["wordTops"] == sorted(layout["wordTops"]), layout
            assert len(set(layout["wordTops"])) == 3, layout
            assert all(
                abs(center - layout["badgeCenter"]) <= 1 for center in layout["wordCenters"]
            ), layout
            assert layout["collisions"] == [], layout
            layout_checks.append({"viewport": viewport_width, "box": index + 1, **layout})
    page.set_viewport_size({"width": 1512, "height": 982})

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
        "longestLabel": longest_label_metrics,
        "layoutChecks": layout_checks,
        "touchBadgeHidden": True,
        "errors": errors,
    }
    browser.close()

print(json.dumps(result, indent=2))

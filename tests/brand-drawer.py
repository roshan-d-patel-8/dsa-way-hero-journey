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
        ("narrow", {"width": 320, "height": 760}),
    ]:
        page = browser.new_page(viewport=viewport)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.goto(args.url, wait_until="networkidle")

        title = page.get_by_role("heading", name="Learn A3 Thinking One Quest at a Time.")
        expect(title).to_be_visible()
        title_layout = title.evaluate(
            """heading => {
              const lines = [...heading.children].map(element => {
                const range = document.createRange();
                range.selectNodeContents(element);
                const rects = [...range.getClientRects()];
                return {
                  text: element.textContent,
                  lineCount: new Set(rects.map(rect => Math.round(rect.top))).size,
                  top: element.getBoundingClientRect().top,
                  bottom: element.getBoundingClientRect().bottom,
                };
              });
              return { lines, scrollWidth: heading.scrollWidth, clientWidth: heading.clientWidth };
            }"""
        )
        assert [line["text"] for line in title_layout["lines"]] == [
            "Learn A3 Thinking",
            "One Quest at a Time.",
        ]
        assert [line["lineCount"] for line in title_layout["lines"]] == [1, 1]
        assert title_layout["lines"][1]["top"] >= title_layout["lines"][0]["bottom"] - 1
        assert title_layout["scrollWidth"] <= title_layout["clientWidth"]
        expect(page.get_by_text("New to the A3? Start anywhere.", exact=False)).to_be_visible()
        assert page.get_by_text("A DSA LEARNING QUEST", exact=True).count() == 0
        page.screenshot(path=output / f"landing-{label}.png")

        opener = page.get_by_role("button", name="Open the DSA Way mission, vision, and values")
        tooltip = page.get_by_text("Click here to see our DSA Way...", exact=True)
        panel = page.locator("#dsa-way-overview")
        infographic = panel.locator("figure > img")
        expect(opener).to_be_visible()
        expect(opener).to_have_attribute("aria-expanded", "false")
        expect(panel).to_have_attribute("aria-hidden", "true")
        expect(tooltip).to_be_hidden()
        opener.hover()
        expect(tooltip).to_be_visible()
        page.screenshot(path=output / f"tooltip-{label}.png")
        page.mouse.move(viewport["width"] - 10, viewport["height"] - 10)
        expect(tooltip).to_be_hidden()
        assert page.locator(".brand-coin-sparkle").evaluate("sparkle => getComputedStyle(sparkle).animationDuration") == "5s"
        assert page.get_by_text("THE COLORS BEHIND THE QUEST", exact=True).count() == 0
        assert page.get_by_text("What guides the journey", exact=True).count() == 0
        assert page.get_by_text("The rainbow rail carries", exact=False).count() == 0

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
        results.append({"viewport": label, "title": title_layout, "closed": closed_metrics, "open": open_metrics, "errors": errors})
        page.close()
    browser.close()

print(json.dumps(results, indent=2))

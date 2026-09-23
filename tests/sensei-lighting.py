"""Verify cursor-reactive portrait lighting and its non-pointer fallbacks."""

import argparse
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:4188/dsa-way-hero-journey/")
parser.add_argument("--output", default="/tmp/dsa-sensei-lighting")
args = parser.parse_args()

output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
results = []


def open_senseis(page):
    page.goto(args.url, wait_until="networkidle")
    page.get_by_role("button", name="ABOUT US", exact=True).click()
    sensei_page = page.get_by_role("region", name="Meet Our Senseis")
    expect(sensei_page).to_be_visible()
    return sensei_page


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    page = browser.new_page(viewport={"width": 1512, "height": 982})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    sensei_page = open_senseis(page)
    first_card = sensei_page.locator(".sensei-card").first
    bounds = first_card.bounding_box()
    assert bounds
    page.mouse.move(bounds["x"] + bounds["width"] * 0.58, bounds["y"] + bounds["height"] * 0.32)
    expect(sensei_page.locator(".sensei-gallery")).to_have_attribute("data-light-active", "true")
    page.wait_for_timeout(350)
    light = first_card.evaluate(
        """card => ({
          x: card.style.getPropertyValue('--sensei-light-x'),
          y: card.style.getPropertyValue('--sensei-light-y'),
          frameOpacity: getComputedStyle(card, '::after').opacity,
          portraitOpacity: getComputedStyle(card.querySelector('.sensei-portrait-stage'), '::before').opacity,
        })"""
    )
    assert light["x"].endswith("px") and light["y"].endswith("px")
    assert float(light["frameOpacity"]) >= 0.9
    assert float(light["portraitOpacity"]) >= 0.9
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    sensei_page.screenshot(path=output / "senseis-cursor-light-desktop.png")
    results.append({"desktop": light, "overflow": False})
    page.close()

    reduced_page = browser.new_page(viewport={"width": 1512, "height": 982}, reduced_motion="reduce")
    reduced_senseis = open_senseis(reduced_page)
    reduced_card = reduced_senseis.locator(".sensei-card").first
    reduced_card.hover(position={"x": 120, "y": 160})
    assert reduced_senseis.locator(".sensei-gallery").get_attribute("data-light-active") is None
    assert reduced_card.evaluate("card => card.style.getPropertyValue('--sensei-light-x')") == ""
    results.append({"reducedMotion": "static"})
    reduced_page.close()

    touch_context = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    touch_page = touch_context.new_page()
    touch_senseis = open_senseis(touch_page)
    touch_senseis.locator(".sensei-card").last.scroll_into_view_if_needed()
    touch_senseis.locator(".sensei-page-intro").scroll_into_view_if_needed()
    touch_page.wait_for_timeout(900)
    touch_card = touch_senseis.locator(".sensei-card").first
    touch_fallback = touch_card.evaluate(
        """card => ({
          x: getComputedStyle(card).getPropertyValue('--sensei-light-x').trim(),
          y: getComputedStyle(card).getPropertyValue('--sensei-light-y').trim(),
          frameOpacity: getComputedStyle(card, '::after').opacity,
        })"""
    )
    assert touch_fallback == {"x": "58%", "y": "32%", "frameOpacity": "0.32"}
    assert touch_page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    touch_senseis.screenshot(path=output / "senseis-static-light-mobile.png")
    results.append({"touch": touch_fallback, "overflow": False})
    touch_context.close()

    assert not errors, errors
    browser.close()

print(json.dumps({"status": "passed", "results": results, "errors": errors}, indent=2))

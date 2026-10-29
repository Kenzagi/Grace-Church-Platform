"""Render diagram HTML files to PNG via Playwright (charts skill 3.1 pattern)."""
import asyncio
import os
from playwright.async_api import async_playwright

BASE = "/home/z/my-project/scripts/diagrams"
OUT = "/home/z/my-project/download"

JOBS = [
    ("architecture.html", "gcc-system-architecture.png", 1340),
    ("members-workflow.html", "gcc-members-workflow.png", 1330),
    ("er-diagram.html", "gcc-data-model.png", 1640),
]


async def render(page, html_name, png_name, width):
    html_path = os.path.join(BASE, html_name)
    out_path = os.path.join(OUT, png_name)
    await page.goto(f"file://{html_path}", wait_until="networkidle")
    await page.wait_for_timeout(600)
    el = page.locator("#root")
    bbox = await el.bounding_box()
    if bbox:
        fit_w = max(width, int(bbox["width"] + 100))
        fit_h = int(bbox["height"] + 100)
        await page.set_viewport_size({"width": fit_w, "height": fit_h})
        await page.wait_for_timeout(300)
    await el.screenshot(path=out_path)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"OK {png_name}  ({int(bbox['width'])}x{int(bbox['height'])} css px, {size_kb:.0f} KB)")


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={"width": 1400, "height": 900}, device_scale_factor=2
        )
        for html_name, png_name, width in JOBS:
            await render(page, html_name, png_name, width)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())

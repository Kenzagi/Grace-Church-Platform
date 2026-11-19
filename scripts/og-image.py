#!/usr/bin/env python3
"""Generate public/og.png (1200x630) — Teleios share image.

Frost ground (#f7f9fa), teal tile (#0d7480) with the white T mark, ink
wordmark (#1f3038). Same palette as the dealt login style.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (247, 249, 250)      # #f7f9fa
TEAL = (13, 116, 128)     # #0d7480
INK = (31, 48, 56)        # #1f3038
WHITE = (255, 255, 255)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Brand tile, centred-left
tile = 112
tx, ty = 120, 140
d.rounded_rectangle([tx, ty, tx + tile, ty + tile], radius=26, fill=TEAL)
# White T mark (same geometry as src/app/icon.svg, scaled to the tile)
s = tile / 32.0
ox, oy = tx + 8 * s, ty + 10 * s
d.rectangle([ox, oy, ox + 16 * s, oy + 3.2 * s], fill=WHITE)
d.rectangle([ox + 6.4 * s, oy, ox + 9.6 * s, oy + 14 * s], fill=WHITE)

bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
reg = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
f_word = ImageFont.truetype(bold, 76)
f_tag = ImageFont.truetype(reg, 34)

d.text((tx, ty + tile + 44), "Teleios", font=f_word, fill=INK)
d.text(
    (tx + 2, ty + tile + 148),
    "Church administration platform",
    font=f_tag,
    fill=(67, 81, 90),
)  # #43515a

out = "/home/z/my-project/public/og.png"
img.save(out, "PNG", optimize=True)
print("saved", out, img.size)

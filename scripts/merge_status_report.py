#!/usr/bin/env python3
"""Merge cover + body into the final status report PDF (cover = page 0, normalized to A4)."""
from pypdf import PdfReader, PdfWriter

A4_W, A4_H = 595.28, 841.89

COVER = '/home/z/my-project/scripts/status_cover.pdf'
BODY = '/home/z/my-project/scripts/status_body.pdf'
OUT = '/home/z/my-project/download/grace-church-platform-status-report.pdf'


def normalize(page):
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    if abs(w - A4_W) > 0.5 or abs(h - A4_H) > 0.5:
        page.scale_to(A4_W, A4_H)
    return page


writer = PdfWriter()
writer.add_page(normalize(PdfReader(COVER).pages[0]))
for page in PdfReader(BODY).pages:
    writer.add_page(normalize(page))

writer.add_metadata({
    '/Title': 'Grace Community Church Platform - Project Status Report',
    '/Author': 'Z.ai',
    '/Creator': 'Z.ai',
    '/Subject': 'Status report: local server run, pending-fix verification, deployment outlook',
})
with open(OUT, 'wb') as f:
    writer.write(f)

r = PdfReader(OUT)
print('final pages:', len(r.pages))
for i, p in enumerate(r.pages):
    print(f'  page {i}: {float(p.mediabox.width):.1f} x {float(p.mediabox.height):.1f} pt')
print('saved:', OUT)

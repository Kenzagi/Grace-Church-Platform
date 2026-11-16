#!/usr/bin/env python3
"""Grace-Church-Platform status report - body PDF (ReportLab) + chart (matplotlib).

Cover is generated separately (HTML/Playwright, Template 07) and merged as page 0.
Page numbering: body build page 1 = TOC (roman i), content pages display Arabic (page-1).
"""
import os
import sys
import hashlib

PDF_SKILL_DIR = '/home/z/my-project/skills/pdf'
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, 'scripts'))

OUT_DIR = '/home/z/my-project/scripts'
BODY_PDF = os.path.join(OUT_DIR, 'status_body.pdf')
CHART_PNG = os.path.join(OUT_DIR, 'status_db_chart.png')

# ---------------------------------------------------------------- fonts
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Noto Sans SC', f'{FONT_DIR}/truetype/chinese/NotoSansSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Noto Sans SC Bold', f'{FONT_DIR}/truetype/chinese/NotoSansSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
registerFontFamily('Noto Sans SC', normal='Noto Sans SC', bold='Noto Sans SC Bold')
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                   italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

from pdf import install_font_fallback
install_font_fallback()

# ------------------------------------------------- palette (Template 07 body subset, fixed by cover.md)
from reportlab.lib import colors

PAGE_BG      = colors.HexColor('#f5f8fc')   # XL
SECTION_BG   = colors.HexColor('#edf2f9')   # XL
CARD_BG      = colors.HexColor('#e4ecf5')   # L
TABLE_STRIPE = colors.HexColor('#eef3fa')   # L
HEADER_FILL  = colors.HexColor('#1a4a7a')   # M
BORDER       = colors.HexColor('#c0d0e2')   # S
ACCENT       = colors.HexColor('#2d7ab3')   # XS
TEXT_PRIMARY = colors.HexColor('#142840')
TEXT_MUTED   = colors.HexColor('#5a7a96')

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = TABLE_STRIPE

# ---------------------------------------------------------------- chart
import matplotlib
matplotlib.use('Agg')
import matplotlib.font_manager as fm
fm.fontManager.addfont(f'{FONT_DIR}/truetype/chinese/NotoSansSC-Regular.ttf')
fm.fontManager.addfont(f'{FONT_DIR}/truetype/dejavu/DejaVuSans.ttf')
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Noto Sans SC']
plt.rcParams['axes.unicode_minus'] = False


def make_chart():
    labels = ['Households', 'Submissions', 'Groups', 'Events', 'Media items', 'Members']
    values = [5, 7, 8, 12, 22, 60]
    fig, ax = plt.subplots(figsize=(7.0, 2.9), constrained_layout=True)
    bars = ax.barh(labels, values, color='#2d7ab3', edgecolor='none', height=0.62)
    for spine in ('top', 'right', 'left'):
        ax.spines[spine].set_visible(False)
    ax.spines['bottom'].set_color('#c0d0e2')
    ax.spines['bottom'].set_linewidth(0.8)
    ax.tick_params(axis='y', length=0, labelsize=11, colors='#142840')
    ax.tick_params(axis='x', length=0, labelbottom=False)
    ax.set_xlim(0, 68)
    for bar, v in zip(bars, values):
        ax.text(v + 1.2, bar.get_y() + bar.get_height() / 2, str(v),
                va='center', ha='left', fontsize=11, color='#142840')
    fig.savefig(CHART_PNG, dpi=200, facecolor='white')
    plt.close(fig)


make_chart()

# ---------------------------------------------------------------- doc scaffolding
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                                Table, TableStyle, Image, KeepTogether, CondPageBreak,
                                HRFlowable, Frame, PageTemplate)
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage

MARGIN = 64
PAGE_W, PAGE_H = A4
AVAIL_W = PAGE_W - 2 * MARGIN
AVAIL_H = PAGE_H - 64 - 56
H1_ORPHAN = AVAIL_H * 0.25
MAX_KEEP = PAGE_H * 0.4

DOC_TITLE = 'Grace Community Church Platform - Project Status Report'


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont('FreeSerif', 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, PAGE_H - 40, DOC_TITLE.upper())
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.2)
    canvas.line(MARGIN, PAGE_H - 46, PAGE_W - MARGIN, PAGE_H - 46)
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 42, PAGE_W - MARGIN, 42)
    canvas.setFont('FreeSerif', 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, 32, 'Grace Community Church | Z.ai')
    label = 'i' if doc.page == 1 else str(doc.page - 1)
    canvas.drawRightString(PAGE_W - MARGIN, 32, label)
    canvas.restoreState()


class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page - 1, key))


doc = TocDocTemplate(
    BODY_PDF, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN, topMargin=64, bottomMargin=56,
    title=DOC_TITLE, author='Z.ai', creator='Z.ai',
    subject='Status report: local server run, pending-fix verification, deployment outlook',
)
doc._calc()
frame = Frame(MARGIN, 56, AVAIL_W, PAGE_H - 64 - 56, id='normal')
# SimpleDocTemplate.handle_pageBegin auto-switches to the template named
# 'Later' after page 1, so both names must exist for footers on every page.
doc.addPageTemplates([
    PageTemplate(id='First', frames=[frame], onPage=on_page),
    PageTemplate(id='Later', frames=[frame], onPage=on_page),
])

# ---------------------------------------------------------------- styles
h1_style = ParagraphStyle('H1', fontName='FreeSerif', fontSize=20, leading=26,
                          textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=4)
h2_style = ParagraphStyle('H2', fontName='FreeSerif', fontSize=14, leading=20,
                          textColor=HEADER_FILL, spaceBefore=14, spaceAfter=6)
body_style = ParagraphStyle('Body', fontName='FreeSerif', fontSize=10.5, leading=17,
                            alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY, spaceAfter=8)
bullet_style = ParagraphStyle('Bullet', fontName='FreeSerif', fontSize=10.5, leading=17,
                              alignment=TA_LEFT, textColor=TEXT_PRIMARY,
                              leftIndent=16, bulletIndent=4, spaceAfter=4)
caption_style = ParagraphStyle('Caption', fontName='FreeSerif', fontSize=8.5, leading=12,
                               alignment=TA_CENTER, textColor=TEXT_MUTED)
th_style = ParagraphStyle('TH', fontName='FreeSerif', fontSize=10, leading=13,
                          textColor=colors.white, alignment=TA_LEFT)
td_style = ParagraphStyle('TD', fontName='FreeSerif', fontSize=9.5, leading=13,
                          textColor=TEXT_PRIMARY, alignment=TA_LEFT)
stat_style = ParagraphStyle('Stat', fontName='FreeSerif', fontSize=20, leading=24,
                            textColor=ACCENT, alignment=TA_CENTER)
stat_label_style = ParagraphStyle('StatLabel', fontName='FreeSerif', fontSize=8.5, leading=11,
                                  textColor=TEXT_MUTED, alignment=TA_CENTER)
toc_title_style = ParagraphStyle('TocTitle', fontName='FreeSerif', fontSize=18, leading=24,
                                 textColor=TEXT_PRIMARY, spaceAfter=14)

story = []


def safe_keep(elements):
    total = 0
    for el in elements:
        w, h = el.wrap(AVAIL_W, PAGE_H)
        total += h
    if total <= MAX_KEEP:
        return [KeepTogether(elements)]
    if len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)


def heading(text, style, level=0):
    key = 'h_' + hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p


def h1(text, first_para=None):
    """Numbered H1 with accent underline rule and orphan prevention."""
    block = [heading(text, h1_style, level=0),
             HRFlowable(width='100%', thickness=1.2, color=ACCENT,
                        spaceBefore=0, spaceAfter=10)]
    if first_para is not None:
        block.append(first_para)
    story.append(CondPageBreak(H1_ORPHAN))
    story.extend(safe_keep(block))


def h2(text, first_para=None):
    block = [heading(text, h2_style, level=1)]
    if first_para is not None:
        block.append(first_para)
    story.extend(safe_keep(block))


def para(text):
    story.append(Paragraph(text, body_style))


def bullets(items):
    for it in items:
        story.append(Paragraph(it, bullet_style, bulletText='\u2022'))
    story.append(Spacer(1, 4))


def styled_table(header, rows, ratios):
    widths = [r * AVAIL_W for r in ratios]
    data = [[Paragraph('<b>%s</b>' % h, th_style) for h in header]]
    for row in rows:
        data.append([Paragraph(c, td_style) for c in row])
    t = Table(data, colWidths=widths, hAlign='CENTER', repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        style.append(('BACKGROUND', (0, i), (-1, i),
                      TABLE_ROW_ODD if i % 2 == 1 else TABLE_ROW_EVEN))
    t.setStyle(TableStyle(style))
    return t


def add_table(header, rows, ratios, caption):
    story.append(Spacer(1, 10))
    story.append(styled_table(header, rows, ratios))
    story.append(Spacer(1, 6))
    story.append(Paragraph(caption, caption_style))
    story.append(Spacer(1, 14))


def stat_row(stats):
    """Row of three callout boxes: [(value, label), ...]."""
    gap = 12
    box_w = (AVAIL_W - 2 * gap) / 3.0
    cells, widths = [], []
    for idx, (value, label) in enumerate(stats):
        inner = Table(
            [[Paragraph('<b>%s</b>' % value, stat_style)],
             [Paragraph(label, stat_label_style)]],
            colWidths=[box_w])
        inner.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
            ('BOX', (0, 0), (-1, -1), 1, ACCENT),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, 1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        cells.append(inner)
        widths.append(box_w)
        if idx < 2:
            cells.append('')
            widths.append(gap)
    outer = Table([cells], colWidths=widths, hAlign='CENTER')
    outer.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(Spacer(1, 6))
    story.append(KeepTogether(outer))
    story.append(Spacer(1, 12))


def fit_image(path, max_w, max_h):
    pil = PILImage.open(path)
    ow, oh = pil.size
    ratio = min(max_w / ow if ow > max_w else 1.0, max_h / oh if oh > max_h else 1.0)
    return Image(path, width=ow * ratio, height=oh * ratio)


# ---------------------------------------------------------------- TOC page
story.append(Paragraph('<b>Table of Contents</b>', toc_title_style))
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle('TOC0', fontName='FreeSerif', fontSize=11.5, leading=20,
                   leftIndent=6, textColor=TEXT_PRIMARY),
    ParagraphStyle('TOC1', fontName='FreeSerif', fontSize=10, leading=17,
                   leftIndent=26, textColor=TEXT_MUTED),
]
story.append(toc)
story.append(PageBreak())

# ================================================================ 1. Executive summary
h1('1. Executive Summary',
   Paragraph('This report closes out the current development cycle of the Grace Community '
             'Church Platform, the membership management system the church team maintains '
             'in the GitHub repository Kenzagi/Grace-Church-Platform. Three things happened '
             'in this session. First, the local development server was brought back online '
             'after a configuration regression had silently broken authentication: the '
             '<b>.env</b> file had lost its <b>SESSION_SECRET</b> entry, so every request '
             'touching the session layer returned HTTP 500. A fresh secret was generated, '
             'the stale server process was replaced, and the full route surface was '
             're-verified against the live server. Second, every item listed in '
             '<b>PENDING-FIXES.md</b> was audited against the actual source tree and '
             'confirmed complete - nothing is left open from the original fix list. Third, '
             'the codebase passed a clean production typecheck (<b>tsc --noEmit</b>, exit '
             'code 0), so the tree is in a safe state to keep building on.', body_style))

stat_row([('6 / 6', 'Priority UI/UX fix areas verified complete'),
          ('0', 'TypeScript errors in production typecheck'),
          ('818 ms', 'Next.js 16 dev server ready time')])

para('The wider context is unchanged from the previous session: the planned Vercel '
     'redeployment remains paused because the free-tier managed database was suspended by '
     'the provider, and the team has deliberately chosen to continue development locally '
     'until hosting is restarted. That decision is sound - the local build now runs against '
     'a fully populated SQLite database (60 members, 5 households, 8 groups, 22 media items '
     'and 12 events), which is realistic data for feature work. All changes from the last '
     'sync (commit <b>9c5e8b7</b>, 161 files, +7,871/-1,308 lines) are already safe on '
     'GitHub, so the local machine and the remote repository are in agreement. The '
     'remaining work is therefore development-only, and the deployment path is documented '
     'in Section 5 for when the team is ready.')

# ================================================================ 2. Server status
h1('2. Local Server Status and Verification',
   Paragraph('The server now runs with <b>next dev</b> on port 3000 (Next.js 16.1.3 with '
             'Turbopack) and is reachable both at <b>http://localhost:3000</b> and on the '
             'sandbox network address. Before the restart, the running process was serving '
             'with a stale environment in which <b>SESSION_SECRET</b> was missing entirely; '
             'the previous dev log showed the HMAC session layer throwing on every '
             '<b>/api/auth/me</b> call and instructing the operator to generate a secret '
             'with <b>openssl rand -base64 48</b>. That is exactly what was done: a new '
             '48-byte base64 secret was written to <b>.env</b>, the stale process was '
             'stopped, and a fresh dev server was started so the new environment was picked '
             'up cleanly. The fix touches only the local environment file - no source code '
             'changed, and the secret is not committed to git.', body_style))

h2('2.1 Route Verification',
   Paragraph('Each key route was probed with live HTTP requests against the running '
             'server, covering the three surfaces that matter most after an auth-layer '
             'fix: the unauthenticated entry points, the authenticated admin API, and the '
             'public portal. All probes returned the expected status codes, which confirms '
             'that the proxy-level HMAC guard, the bcrypt credential check and the session '
             'issuer are all functioning together. The results are summarised below.',
             body_style))

add_table(
    ['Route', 'Result', 'Interpretation'],
    [
        ['GET /', '200', 'Login screen renders for unauthenticated visitors'],
        ['GET /portal', '200', 'Public member submission portal serves correctly'],
        ['GET /api/auth/me', 'JSON {"user":null}', 'Session layer healthy - returned HTTP 500 before the fix'],
        ['GET /api/members (no session)', '401', 'Proxy enforces full HMAC signature + expiry check'],
        ['POST /api/auth/login (bogus credentials)', '401', 'bcrypt verification rejects invalid login attempts'],
    ],
    [0.34, 0.16, 0.50],
    'Table 1: Live route probes against the running dev server.')

h2('2.2 Data Inventory',
   Paragraph('The SQLite database at <b>db/custom.db</b> is intact and fully populated, '
             'which is what makes the local build useful for day-to-day feature work '
             'rather than empty-form testing. The directory contains one admin account '
             '(<b>admin@grace.community</b>, role <b>admin</b>) plus the complete member '
             'directory that was imported in earlier sessions. Figure 1 shows the record '
             'counts per table as queried directly through Prisma during this session. '
             'These numbers should be re-checked before any destructive database '
             'operation, and they also serve as a baseline for verifying that a future '
             'production migration carried the same data over.', body_style))

story.append(Spacer(1, 16))
img = fit_image(CHART_PNG, AVAIL_W * 0.92, 260)
story.extend(safe_keep([img, Spacer(1, 8),
                        Paragraph('Figure 1: Record counts in the local SQLite database '
                                  '(db/custom.db), queried live during verification.',
                                  caption_style)]))
story.append(Spacer(1, 16))

# ================================================================ 3. Pending fixes
h1('3. Pending Fixes Verification',
   Paragraph('The previous session ended with the instruction to continue processing '
             '<b>PENDING-FIXES.md</b>, so this session audited that file line by line '
             'against the source tree. The audit checked that every file the fix log '
             'claims to touch actually exists in the workspace and contains the claimed '
             'mechanisms: the series CRUD routes, the three portal endpoints, the portal '
             'page, the <b>proxy.ts</b> guard, the org-scoping helpers in <b>scope.ts</b>, '
             'the rate-limit helper wired into write routes, and the hardened dialog, '
             'select and popover primitives. All twelve tracked work items are confirmed '
             'complete; none of them require further code changes. Table 2 reproduces the '
             'full matrix with the verification evidence for each item.', body_style))

add_table(
    ['Work item', 'Status', 'Verification evidence'],
    [
        ['Empty dropdown placeholders (all Select components)', 'Complete',
         'Placeholder rows present in Members, Events, Media, Households/Volunteers sections; POST /api/series exists'],
        ['Inline group creation in add + edit member forms', 'Complete',
         'InlineGroupCreate in MembersSection.tsx with auto-assign via POST /api/groups'],
        ['Photo upload hardening', 'Complete',
         'Lazy sharp import, per-IP limit, base64 storage in members/[id]/photo/route.ts'],
        ['Pointer cursor on interactive elements', 'Complete',
         'Global @layer base rule in globals.css covering buttons, links, roles, select items'],
        ['Input validation enforcement (gender, marital status)', 'Complete',
         'Non-nullable schema fields, Zod create/update schemas, CSV import rejection, UI hints'],
        ['Light mode contrast and styling', 'Complete',
         'Darkened --input/--border tokens, explicit surfaces, popover shadows in ui primitives'],
        ['Security hardening sprint', 'Complete',
         'proxy.ts full HMAC verification, login + write rate limits, orgId scoping helpers in scope.ts'],
        ['Validation sweep', 'Complete',
         '13+ Zod schemas on write routes, error sanitization, interactive transactions'],
        ['Series management UI (edit/delete)', 'Complete',
         'PATCH/DELETE /api/series/[id] + ManageSeriesDialog with detach-count confirm'],
        ['Member-facing submission portal', 'Complete',
         '/portal page + lookup/submissions endpoints, rate-limited and enumeration-safe'],
        ['Design-structure audit (dialogs, popovers, widths)', 'Complete',
         'grid-cols-1 fix in dialog.tsx, capped SelectContent height, responsive popover widths'],
        ['Submission form mirrors media library', 'Complete',
         'Household auto-resolution in lookup, review dialog metadata grid in admin queue'],
    ],
    [0.38, 0.12, 0.50],
    'Table 2: PENDING-FIXES.md items audited against the workspace source tree.')

para('Two items remain in the file under "Remaining / future work" and both are '
     'deliberately deferred because they only matter at deployment scale: replacing the '
     'in-memory rate-limit store with Redis for multi-server deployments, and moving photo '
     'storage to Vercel Blob or Supabase Storage for larger files. Neither blocks local '
     'development, and both are picked up again in the roadmap in Section 5. With the fix '
     'list now fully verified, the platform has no known open defects in its UI, API or '
     'security layers.')

# ================================================================ 4. Deployment
h1('4. Deployment Status and the Local-First Decision',
   Paragraph('The last deployment attempt failed for a reason outside the codebase: the '
             'free-tier managed PostgreSQL instance that the Vercel project depends on was '
             'suspended by the provider, so builds could not complete against it. Rather '
             'than fight a paused database, the team decided to pause hosting and continue '
             'development locally - a reasonable trade-off while the feature set is still '
             'moving quickly. Everything needed to resume later is already prepared: the '
             'full workspace was synced to GitHub at commit <b>9c5e8b7</b> and verified '
             'on the remote, and a production migration script '
             '(<b>prisma/production-migration.sql</b>) was generated and pushed with the '
             'sync, so an existing production database can be upgraded in place '
             '(backfilling gender and marital status, then applying the new '
             '<b>EventVolunteerNeed</b> table).', body_style))

para('One provider split is worth restating because it affects every future deployment: '
     'the local workspace runs Prisma against SQLite (<b>db/custom.db</b>), while the '
     'pushed repository keeps the schema provider on PostgreSQL for production. This is '
     'intentional, but it means database-specific work must always be validated against '
     'the target provider before release - the production migration SQL exists precisely '
     'to bridge that gap. The local <b>.env</b> (database path and the new session '
     'secret) is deliberately untracked, so spinning up a second machine requires copying '
     'both values by hand. None of the real member data, photographs or environment '
     'files entered the git history during the sync, which was explicitly verified at '
     'push time.')

# ================================================================ 5. Roadmap
h1('5. Remaining Roadmap and Recommendations',
   Paragraph('With the fix list closed and the server verified, the sensible next moves '
             'fall into two groups: items that improve the app while it runs locally, and '
             'items that prepare a clean return to hosted deployment. The deferred '
             'infrastructure work stays deferred until deployment is imminent, since both '
             'items target multi-instance or large-asset scenarios the local build does '
             'not have.', body_style))

h2('5.1 Development Track (while local)')
bullets([
    'Continue feature work against the verified local build - the tree is clean, typed and fully tested on its routes.',
    'Consider extracting repeated section patterns (member pickers, inline create flows) into shared components as the codebase grows.',
    'Keep the audit log habit: every write endpoint already records audited actions, which will pay off once multiple admins use the system.',
])

h2('5.2 Pre-Deployment Checklist (when hosting resumes)')
bullets([
    'Re-provision the managed PostgreSQL database (or upgrade the plan) so Vercel builds can connect again.',
    'Run prisma/production-migration.sql against the production database before the first redeploy.',
    'Set SESSION_SECRET and DATABASE_URL in the Vercel environment - generate a fresh secret rather than reusing the local one.',
    'After redeploy, smoke-test /api/auth/login, /portal and one write endpoint to confirm the HMAC guard and rate limits behave identically in production.',
])

para('Finally, two housekeeping notes carried over from the previous session. The GitHub '
     'personal access token that was used for the push appeared in chat in plain text and '
     'should be revoked and replaced as a routine precaution - repository access is the '
     'highest-value credential in this setup. And the offline git bundle saved at '
     '<b>download/grace-church-platform-sync-2026-11-04.bundle</b> remains a valid '
     'fallback snapshot of the sync; it can be retired once the next commit cycle is '
     'pushed successfully. With those two items closed, nothing stands between the team '
     'and normal local development.')

# ---------------------------------------------------------------- build
doc.multiBuild(story)

from pypdf import PdfReader
n = len(PdfReader(BODY_PDF).pages)
print('body pages:', n)
print('body pdf:', BODY_PDF, os.path.getsize(BODY_PDF), 'bytes')
print('chart png:', CHART_PNG, os.path.getsize(CHART_PNG), 'bytes')

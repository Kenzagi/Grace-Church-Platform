#!/usr/bin/env python3
"""
Apply the style-system sweep (session m, "implement this style").

Replacements:
  A) App-owned files (everything under src/ EXCEPT vendored arc/ + motion/):
     - lucide-react import source -> "@/components/icons" (Nucleo barrel)
     - LucideIcon type            -> AppIcon
     - font-semibold / font-bold  -> font-medium   (only 400/500 in the system)
     - text-[10px] / text-[11px]  -> text-xs       (12px)
     - text-[13px]                -> text-sm       (13px, token instead of arbitrary)
     - text-3xl / text-4xl / text-5xl -> text-2xl  (24px is the maximum)
  B) Vendored files (arc/**, motion/**): ONLY the import-source swap, so the
     registry installer can re-apply the same patch (see OVERRIDES in
     scripts/install-registry-pickers.py) without drifting from upstream.

Fails loudly (exit 1) if any lucide-react reference survives the sweep.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
VENDORED = (SRC / "components" / "arc", SRC / "components" / "motion")

APP_REPLACEMENTS = [
    (re.compile(r'from "lucide-react"'), 'from "@/components/icons"'),
    (re.compile(r"from 'lucide-react'"), 'from "@/components/icons"'),
    (re.compile(r"\bLucideIcon\b"), "AppIcon"),
    (re.compile(r"\bfont-semibold\b"), "font-medium"),
    (re.compile(r"\bfont-bold\b"), "font-medium"),
    (re.compile(r"text-\[10px\]"), "text-xs"),
    (re.compile(r"text-\[11px\]"), "text-xs"),
    (re.compile(r"text-\[13px\]"), "text-sm"),
    (re.compile(r"\btext-3xl\b"), "text-2xl"),
    (re.compile(r"\btext-4xl\b"), "text-2xl"),
    (re.compile(r"\btext-5xl\b"), "text-2xl"),
]
VENDORED_REPLACEMENTS = [
    (re.compile(r'from "lucide-react"'), 'from "@/components/icons"'),
    (re.compile(r"from 'lucide-react'"), 'from "@/components/icons"'),
]


def is_vendored(p: Path) -> bool:
    return any(VENDORED[0] in p.parents or p == VENDORED[0] for _ in [0]) or any(
        p == d or d in p.parents for d in VENDORED
    )


def main() -> int:
    changed = 0
    skipped = 0
    for p in sorted(SRC.rglob("*")):
        if p.suffix not in {".ts", ".tsx"} or not p.is_file():
            continue
        text = p.read_text(encoding="utf-8")
        rules = VENDORED_REPLACEMENTS if is_vendored(p) else APP_REPLACEMENTS
        new = text
        n = 0
        for rx, repl in rules:
            new, k = rx.subn(repl, new)
            n += k
        if n:
            p.write_text(new, encoding="utf-8")
            rel = p.relative_to(ROOT)
            tag = "vendored" if is_vendored(p) else "app"
            print(f"  {tag:8} {n:3} replacements  {rel}")
            changed += 1
        else:
            skipped += 1

    leftovers = [
        str(p.relative_to(ROOT))
        for p in SRC.rglob("*")
        if p.suffix in {".ts", ".tsx"} and p.is_file() and "lucide-react" in p.read_text(encoding="utf-8")
    ]
    print(f"\n{changed} file(s) changed, {skipped} untouched, {len(leftovers)} lucide leftover(s)")
    if leftovers:
        for f in leftovers:
            print(f"  LEFTOVER: {f}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

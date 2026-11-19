#!/usr/bin/env python3
"""Session n — +2px readability bump for app-authored files.

Scope (the vendored arc/ + motion/ files are handled by the installer's
OVERRIDES layer instead — see scripts/install-registry-pickers.py):
  1. Every explicit `size={N}` on an <Icon> tag: N → N + 2. In app files all
     size props sit on <Icon> (verified: no other component carries one), so a
     line-level rule is safe. Single pass per line — no double-bump.
  2. Recharts tick/tooltip font sizes in DashboardSection: +2 (charts are part
     of "some text is too small").
The global type scale itself lives in globals.css (edited by hand).
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
VENDORED = (SRC / "components/arc", SRC / "components/motion")

ICON_SIZE = re.compile(r"(<Icon\b[^>]*?size=\{)(\d+)(\})")
FONT_SIZE = re.compile(r"(fontSize:\s*)(\d+)")


def bump_icon_sizes(line: str) -> str:
    if "<Icon" not in line:
        return line
    return ICON_SIZE.sub(lambda m: f"{m.group(1)}{int(m.group(2)) + 2}{m.group(3)}", line)


def main() -> int:
    touched: list[tuple[Path, int]] = []
    for path in sorted(SRC.rglob("*.tsx")):
        if any(path.is_relative_to(v) for v in VENDORED):
            continue
        text = path.read_text(encoding="utf-8")
        lines = text.split("\n")
        out = []
        hits = 0
        for line in lines:
            new = bump_icon_sizes(line)
            if "fontSize" in new and path.name == "DashboardSection.tsx":
                new = FONT_SIZE.sub(lambda m: f"{m.group(1)}{int(m.group(2)) + 2}", new)
            if new != line:
                hits += 1
            out.append(new)
        if hits:
            path.write_text("\n".join(out), encoding="utf-8")
            touched.append((path, hits))

    for path, hits in touched:
        print(f"  {path.relative_to(ROOT)}: {hits} line(s) bumped")
    print(f"Done: {len(touched)} file(s) changed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""
Vendor registry components VERBATIM from shadcn-style registries (uiarc.dev, beui.dev).

Why this exists: the shadcn CLI rejects these registries' item format, so files are
extracted directly from the registry item JSON. Files are written byte-for-byte so
future registry updates re-run this script cleanly (diff-safe).

Target mapping (identical convention on both registries):
  @components/<rest> -> src/components/<rest>
  @lib/<rest>        -> src/lib/<rest>

Usage:
  python3 scripts/install-registry-pickers.py            # install/update all
  python3 scripts/install-registry-pickers.py <name>...  # only named registries
  ... --force                                            # replace changed files

Rules:
  - Never silently overwrites: identical files are skipped; changed files are
    reported as conflicts and only replaced with --force.
  - Exits non-zero when conflicts exist (so CI/sessions notice drift).
"""

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# The registries 403 the default Python client; send a browser-ish UA.
OPENER = urllib.request.build_opener()
OPENER.addheaders = [("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36")]

REGISTRIES = {
    # uiarc.dev — single-date + time pickers (calendar + motion tokens are their deps)
    "uiarc-date-picker": "https://uiarc.dev/r/date-picker.json",
    "uiarc-time-picker": "https://uiarc.dev/r/time-picker.json",
    "uiarc-calendar": "https://uiarc.dev/r/calendar.json",
    "uiarc-motion-tokens": "https://uiarc.dev/r/arc-motion-tokens.json",
    # beui.dev — date-range picker (filter dropdown; restored session-h work)
    "beui-date-range-picker": "https://beui.dev/r/date-range-picker.json",
}


def target_for(target: str) -> Path:
    if target.startswith("@components/"):
        return ROOT / "src/components" / target[len("@components/"):]
    if target.startswith("@lib/"):
        return ROOT / "src/lib" / target[len("@lib/"):]
    raise SystemExit(f"Unknown target prefix in registry item: {target}")


def main() -> int:
    force = "--force" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    unknown = [n for n in only if n not in REGISTRIES]
    if unknown:
        print(f"Unknown registry names: {unknown}\nKnown: {sorted(REGISTRIES)}")
        return 2

    added = identical = replaced = 0
    conflicts: list[str] = []
    for name, url in REGISTRIES.items():
        if only and name not in only:
            continue
        print(f"• {name}  ({url})")
        with OPENER.open(url, timeout=30) as resp:
            item = json.loads(resp.read().decode("utf-8"))
        for f in item.get("files", []):
            dest = target_for(f["target"])
            content = f["content"].encode("utf-8")
            rel = dest.relative_to(ROOT)
            if dest.exists():
                if dest.read_bytes() == content:
                    identical += 1
                    print(f"  identical  {rel}")
                    continue
                if not force:
                    conflicts.append(str(rel))
                    print(f"  CONFLICT   {rel}  (changed upstream; rerun with --force to replace)")
                    continue
                replaced += 1
                print(f"  replaced   {rel}")
            else:
                added += 1
                print(f"  added      {rel}")
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(content)

    print(f"\nDone: {added} added, {identical} identical, {replaced} replaced, {len(conflicts)} conflict(s)")
    return 1 if conflicts else 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Install beui.dev date-range-picker files verbatim from the registry JSON.

The shadcn CLI (current version) rejects this registry item's schema, so we
extract the exact file payloads ourselves. Targets:
  @components/... -> src/components/...
  @lib/...        -> src/lib/...
Existing files are never silently overwritten (except reported explicitly).
"""
import json
import os
import sys

REGISTRY_JSON = "/tmp/beui-drp.json"
PROJECT = "/home/z/my-project"
SRC = os.path.join(PROJECT, "src")


def target_path(target: str) -> str:
    rel = target[1:]  # strip leading '@'
    return os.path.join(SRC, rel)


def main() -> int:
    with open(REGISTRY_JSON) as fh:
        data = json.load(fh)

    written, skipped, overwritten = [], [], []
    for f in data["files"]:
        target, content = f.get("target"), f.get("content")
        if not target or content is None:
            print(f"SKIP (no target/content): {f.get('path')}")
            continue
        dest = target_path(target)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        if os.path.exists(dest):
            with open(dest) as fh:
                if fh.read() == content:
                    skipped.append(dest)
                    continue
            overwritten.append(dest)
        with open(dest, "w") as fh:
            fh.write(content)
        written.append(dest)

    print("\nWritten:")
    for p in written:
        print("  +", os.path.relpath(p, PROJECT))
    print("Identical (skipped):")
    for p in skipped:
        print("  =", os.path.relpath(p, PROJECT))
    print("OVERWRITTEN:")
    for p in overwritten:
        print("  !", os.path.relpath(p, PROJECT))
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Keep `next dev` alive across tool calls: double-fork daemonization.

Plain `nohup ... &` / `setsid ... &` children get reaped between tool calls in
this sandbox; a double-forked, setsid'd daemon survives. Server output tees to
dev.log; daemon startup output goes to next-daemon.log.

Usage: python3 scripts/devserver-daemon.py   (exits 0 once port 3000 answers)
"""

import os
import sys
import time
import urllib.request

PORT = 3000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def listening() -> bool:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{PORT}", timeout=2) as r:
            return r.status < 500
    except Exception:
        return False


def wait_listening(seconds: int) -> bool:
    for _ in range(seconds):
        time.sleep(1)
        if listening():
            return True
    return False


if listening():
    print("already listening")
    sys.exit(0)

# First fork: parent stays behind and polls until the server answers.
if os.fork() > 0:
    ok = wait_listening(150)
    print("listening" if ok else "timeout waiting for dev server", flush=True)
    sys.exit(0 if ok else 1)

os.setsid()

# Second fork: the daemon is orphaned, adopted by init, and fully detached.
if os.fork() > 0:
    os._exit(0)

os.chdir(ROOT)
devnull = os.open(os.devnull, os.O_RDWR)
os.dup2(devnull, 0)
log = os.open(os.path.join(ROOT, "next-daemon.log"), os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
os.dup2(log, 1)
os.dup2(log, 2)

os.execvp("bash", ["bash", "-c", "./node_modules/.bin/next dev -p 3000 2>&1 | tee dev.log"])

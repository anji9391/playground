#!/usr/bin/env python3
"""Verify all manifest games exist and include HUD markup."""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
manifest = json.load(open(os.path.join(ROOT, "games.manifest.json"), encoding="utf-8"))
ok = fail = 0

for g in manifest["games"]:
    html_path = os.path.join(ROOT, g["path"].replace("/", os.sep))
    js_path = os.path.join(os.path.dirname(html_path), "game.js")
    issues = []
    if not os.path.isfile(html_path):
        issues.append("missing HTML")
    if not os.path.isfile(js_path):
        issues.append("missing game.js")
    else:
        html = open(html_path, encoding="utf-8").read()
        if "data-game-hud" not in html and g["id"] != "snake":
            issues.append("missing data-game-hud")
        if "has-hud" not in html and g["id"] not in ("snake",):
            issues.append("missing has-hud on body")
    if issues:
        print(f"FAIL {g['id']}: {', '.join(issues)}")
        fail += 1
    else:
        print(f"OK   {g['id']}")
        ok += 1

print(f"\n{ok} ok, {fail} failed, {len(manifest['games'])} in manifest")
sys.exit(1 if fail else 0)

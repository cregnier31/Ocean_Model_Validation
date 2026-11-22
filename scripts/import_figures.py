#!/usr/bin/env python3
"""Safely import uploaded Class 1, Class 4 and vertical profile PNGs."""
import json
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "frontend" / "public" / "figures"
MANIFEST = ROOT / "frontend" / "src" / "figure-manifest.json"
FILES = {"class1": "CLASS1.tar", "class4": "CLASS4.tar", "profiles": "Profiles.tar"}

def import_figures(directory: Path):
    result = {}
    for group, filename in FILES.items():
        archive = directory / filename
        if not archive.is_file():
            raise SystemExit(f"Missing archive: {archive}")
        items = []
        target = DEST / group
        target.mkdir(parents=True, exist_ok=True)
        with tarfile.open(archive, "r:*") as tar:
            for member in tar:
                if not member.isfile() or not member.name.lower().endswith(".png"):
                    continue
                name = Path(member.name).name
                if not name or name in (".", ".."):
                    continue
                src = tar.extractfile(member)
                if src is None:
                    continue
                # Flatten archive paths; never extract archive paths to the filesystem.
                with (target / name).open("wb") as output:
                    import shutil
                    shutil.copyfileobj(src, output)
                parts = member.name.split("/")
                variable = parts[1] if group == "profiles" and len(parts) > 2 else ("SST" if group == "class1" else "T/S")
                region = name.split("_2024")[0].split(f"class4_{variable}_")[-1].replace("_", " ") if group == "profiles" else "Multiple regions"
                items.append({"file": name, "label": name.removesuffix(".png").replace("_", " "), "region": region, "variable": variable})
        result[group] = sorted(items, key=lambda x: x["file"])
        print(f"{group}: imported {len(items)} PNGs")
    MANIFEST.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"Saved manifest: {MANIFEST}")

if __name__ == "__main__":
    import_figures(Path(sys.argv[1]).expanduser().resolve() if len(sys.argv) > 1 else Path.cwd())

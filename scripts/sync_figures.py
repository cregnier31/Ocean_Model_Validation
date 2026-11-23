#!/usr/bin/env python3
"""Synchronize an existing imgs/ directory into Vite public assets and a JSON catalog."""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "frontend" / "public"
CATEGORIES = {"CLASS1": "class1", "CLASS4/profiles": "profiles", "CLASS4/radar": "radar", "CLASS4/SST_drifters": "sst_drifters", "CLASS4/UV_drifters": "uv_drifters", "CLASS4/aice": "aice", "lagrangian": "lagrangian", "eddy_tracking": "eddy_tracking"}
REGIONS = ["Antarctic_Circumpolar","Arctic_Ocean","Baltic_Sea","Full_Domain","Global_60S_60N","Iberian_Biscay_Irish","Indian_Ocean","Mediterranean_Sea","North_Atlantic_Ocean","North_Pacific_Ocean","North_Sea","South_Atlantic_Ocean","South_Pacific_Ocean","Tropical_Atlantic_Ocean","Tropical_Pacific_Ocean"]
def variable(name):
    if "thetao" in name: return "Temperature (thetao)"
    if "_so_" in name: return "Salinity (so)"
    if "filtr_uo" in name: return "Zonal current (uo)"
    if "filtr_vo" in name: return "Meridional current (vo)"
    if "siconc" in name or "aice" in name: return "Sea-ice concentration"
    if "SST" in name: return "Sea surface temperature"
    if "Liu_score" in name: return "Liu score"
    if "Nobs" in name: return "Observation count"
    if "sep-dist" in name or "separation" in name or "Hist_sep" in name: return "Separation distance"
    if "Hist_stats" in name: return "Trajectory statistics"
    return "Multi-variable"

def main():
    options = [Path(sys.argv[1]).expanduser().resolve()] if len(sys.argv) > 1 else [ROOT / "imgs", ROOT / "frontend" / "imgs"]
    source = next((p for p in options if (p / "CLASS1").is_dir() or (p / "CLASS4").is_dir() or (p / "lagrangian").is_dir() or (p / "eddy_tracking").is_dir()), None)
    if source is None:
        raise SystemExit("Cannot find imgs/CLASS1 or imgs/CLASS4. Usage: python scripts/sync_figures.py /absolute/path/to/imgs")
    manifest = {}
    for subdir, group in CATEGORIES.items():
        records = []
        folder = source / subdir
        for src in sorted(folder.glob("*.png")) if folder.is_dir() else []:
            relative = Path("imgs") / subdir / src.name
            dest = PUBLIC / relative
            dest.parent.mkdir(parents=True, exist_ok=True)
            if src.resolve() != dest.resolve():
                shutil.copy2(src, dest)
            region = next((r.replace("_"," ") for r in REGIONS if r in src.stem), "All regions")
            records.append({"url": "/" + relative.as_posix(), "file": src.name, "label": src.stem.replace("_", " "), "region": region, "variable": variable(src.name)})
        manifest[group] = records
        print(f"{subdir}: {len(records)} figures")
    output = PUBLIC / "figures-manifest.json"
    output.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {output}")
if __name__ == "__main__":
    main()

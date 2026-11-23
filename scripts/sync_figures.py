#!/usr/bin/env python3
"""Synchronize an existing imgs/ directory into Vite public assets and a JSON catalog."""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "frontend" / "public"
CATEGORIES = {"CLASS1": "class1", "CLASS4/profiles": "profiles", "CLASS4/radar": "radar", "CLASS4/SST_drifters": "sst_drifters", "CLASS4/UV_drifters": "uv_drifters", "CLASS4/aice": "aice", "lagrangian": "lagrangian", "eddy_tracking": "eddy_tracking", "ocean_dynamics": "ocean_dynamics"}
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
    source = next((p for p in options if (p / "CLASS1").is_dir() or (p / "CLASS4").is_dir() or (p / "lagrangian").is_dir() or (p / "eddy_tracking").is_dir() or (p / "videos").is_dir()), None)
    if source is None:
        raise SystemExit("Cannot find a supported imgs directory. Usage: python scripts/sync_figures.py /absolute/path/to/imgs")
    manifest = {}
    for subdir, group in CATEGORIES.items():
        records = []
        folder = source / subdir
        for src in sorted(folder.iterdir()) if folder.is_dir() else []:
            if not src.is_file() or src.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".mp4", ".webm", ".ogv", ".mov"}:
                continue
            relative = Path("imgs") / subdir / src.name
            dest = PUBLIC / relative
            dest.parent.mkdir(parents=True, exist_ok=True)
            if src.resolve() != dest.resolve():
                shutil.copy2(src, dest)
            region = next((r.replace("_"," ") for r in REGIONS if r in src.stem), "All regions")
            records.append({"type": "video" if src.suffix.lower() in {".mp4", ".webm", ".ogv", ".mov"} else "image", "url": "/" + relative.as_posix(), "file": src.name, "label": src.stem.replace("_", " "), "region": region, "variable": variable(src.name)})
        manifest[group] = records
        print(f"{subdir}: {len(records)} figures")
    # Optional videos/ directory: place clips in videos/<section>/, with any
    # subfolders; use "validation" for general validation videos.
    video_groups = {
        "class1": "class1", "class4": "profiles", "profiles": "profiles",
        "radar": "radar", "sst_drifters": "sst_drifters", "uv_drifters": "uv_drifters",
        "aice": "aice", "lagrangian": "lagrangian", "eddy_tracking": "eddy_tracking",
        "ocean_dynamics": "ocean_dynamics", "dynamics": "ocean_dynamics",
        "intercomparison": "sst_drifters"
    }
    videos_root = source / "videos"
    if videos_root.is_dir():
        for src in sorted(videos_root.rglob("*")):
            if not src.is_file() or src.suffix.lower() not in {".mp4", ".webm", ".ogv", ".mov"}:
                continue
            parts = src.relative_to(videos_root).parts
            category = parts[0].lower() if len(parts) > 1 else "overview"
            group = video_groups.get(category, "overview")
            relative = Path("imgs") / "videos" / src.relative_to(videos_root)
            dest = PUBLIC / relative
            dest.parent.mkdir(parents=True, exist_ok=True)
            if src.resolve() != dest.resolve():
                shutil.copy2(src, dest)
            manifest.setdefault(group, []).append({"type": "video", "url": "/" + relative.as_posix(),
                "file": src.name, "label": src.stem.replace("_", " "), "region": "All regions", "variable": "Video"})
    output = PUBLIC / "figures-manifest.json"
    output.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {output}")
if __name__ == "__main__":
    main()

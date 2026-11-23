#!/usr/bin/env python3
"""Index scientific plots and videos from the local imgs tree into Vite public assets."""
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "frontend" / "public"
EXT_IMAGE = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
EXT_VIDEO = {".mp4", ".webm", ".ogv", ".ogg", ".mov", ".m4v"}
REGIONS = ["Antarctic_Circumpolar", "Arctic_Ocean", "Baltic_Sea", "Full_Domain",
           "Global_60S_60N", "Iberian_Biscay_Irish", "Indian_Ocean", "Mediterranean_Sea",
           "North_Atlantic_Ocean", "North_Pacific_Ocean", "North_Sea",
           "South_Atlantic_Ocean", "South_Pacific_Ocean", "Tropical_Atlantic_Ocean",
           "Tropical_Pacific_Ocean"]
FOLDERS = {
    "CLASS1": "class1",
    "CLASS4/profiles": "profiles", "CLASS4/radar": "radar",
    "CLASS4/SST_drifters": "sst_drifters", "CLASS4/UV_drifters": "uv_drifters",
    "CLASS4/aice": "aice",
    "lagrangian": "lagrangian", "eddy_tracking": "eddy_tracking",
    "ocean_dynamics": "ocean_dynamics",
    "surface-dynamics-diagnostics/global_velocity/maps": "surface_maps",
    "surface-dynamics-diagnostics/global_velocity/timeseries": "surface_timeseries",
    "surface_dynamics_diagnostics/global_velocity/maps": "surface_maps",
    "surface_dynamics_diagnostics/global_velocity/timeseries": "surface_timeseries",
}
VIDEO_FOLDERS = {
    "class1": "class1", "class4": "profiles", "profiles": "profiles",
    "radar": "radar", "sst_drifters": "sst_drifters", "uv_drifters": "uv_drifters",
    "aice": "aice", "lagrangian": "lagrangian", "eddy_tracking": "eddy_tracking",
    "eddy-tracking": "eddy_tracking", "ocean_dynamics": "ocean_dynamics",
    "surface-dynamics-diagnostics": "ocean_dynamics",
    "dynamics": "ocean_dynamics", "intercomparison": "sst_drifters",
    "overview": "overview"
}

def variable(name):
    n = name.lower()
    for key, value in [
        ("horizontal_divergence", "Horizontal divergence"),
        ("kinetic_energy", "Kinetic energy"),
        ("okubo_weiss", "Okubo–Weiss parameter"),
        ("relative_vorticity", "Relative vorticity"),
        ("rossby_number", "Rossby number"),
        ("strain", "Strain"),
        ("thetao", "Temperature (thetao)"),
        ("_so_", "Salinity (so)"),
        ("filtr_uo", "Zonal current (uo)"),
        ("filtr_vo", "Meridional current (vo)"),
        ("_uo_", "Zonal current (uo)"),
        ("siconc", "Sea-ice concentration"),
        ("aice", "Sea-ice concentration"),
        ("sst", "Sea surface temperature"),
        ("liu_score", "Liu score"),
        ("nobs", "Observation count"),
        ("sep-dist", "Separation distance"),
        ("separation", "Separation distance"),
        ("hist_sep", "Separation distance"),
        ("hist_stats", "Trajectory statistics"),
    ]:
        if key in n:
            return value
    return "Unspecified"

def main():
    options = [Path(sys.argv[1]).expanduser().resolve()] if len(sys.argv) > 1 else [
        ROOT / "imgs", ROOT / "frontend" / "imgs"]
    source = next((p for p in options if p.is_dir() and any(
        (p / folder).is_dir() for folder in [*FOLDERS, "videos"])), None)
    if source is None:
        raise SystemExit("No supported media directories found. Usage: python scripts/sync_figures.py /path/to/imgs")
    catalog = {group: [] for group in set(FOLDERS.values()) | {"overview"}}
    seen = set()
    counts = {"image": 0, "video": 0}

    def add(src, group):
        if not src.is_file() or src.suffix.lower() not in EXT_IMAGE | EXT_VIDEO:
            return
        key = (str(src.resolve()), group)
        if key in seen:
            return
        seen.add(key)
        relative = Path("imgs") / src.relative_to(source)
        dest = PUBLIC / relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        if src.resolve() != dest.resolve():
            shutil.copy2(src, dest)
        kind = "video" if src.suffix.lower() in EXT_VIDEO else "image"
        region = next((r.replace("_", " ") for r in REGIONS if r.lower() in src.stem.lower()), "All regions")
        lead = next((f"Lead {int(p[4:]):02d}" for p in src.relative_to(source).parts if re.fullmatch(r"lead\\d+", p, re.IGNORECASE)), "All leads")
        catalog.setdefault(group, []).append({
            "type": kind, "url": "/" + relative.as_posix(), "file": src.name,
            "label": src.stem.replace("_", " "), "region": region, "lead": lead,
            "variable": variable(src.name) if kind == "image" else "Video"
        })
        counts[kind] += 1

    for folder, group in FOLDERS.items():
        base = source / folder
        if base.is_dir():
            for src in sorted(base.rglob("*")):
                add(src, group)

    # Videos may be placed in imgs/videos/<section>/ or in nested section folders.
    videos = source / "videos"
    if videos.is_dir():
        for src in sorted(videos.rglob("*")):
            if not src.is_file() or src.suffix.lower() not in EXT_VIDEO:
                continue
            parts = src.relative_to(videos).parts
            category = parts[0].lower() if len(parts) > 1 else "overview"
            add(src, VIDEO_FOLDERS.get(category, "overview"))

    # Accept an optional separate videos directory beside imgs.
    sibling_videos = source.parent / "videos"
    if sibling_videos.is_dir() and sibling_videos != videos:
        for src in sorted(sibling_videos.rglob("*")):
            if not src.is_file() or src.suffix.lower() not in EXT_VIDEO:
                continue
            parts = src.relative_to(sibling_videos).parts
            category = parts[0].lower() if len(parts) > 1 else "overview"
            group = VIDEO_FOLDERS.get(category, "overview")
            # Preserve the original media without requiring it to be inside imgs.
            relative = Path("imgs") / "external_videos" / src.relative_to(sibling_videos)
            dest = PUBLIC / relative
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest)
            catalog.setdefault(group, []).append({
                "type": "video", "url": "/" + relative.as_posix(),
                "file": src.name, "label": src.stem.replace("_", " "),
                "region": "All regions", "variable": "Video"
            })
            counts["video"] += 1

    for group in catalog:
        catalog[group].sort(key=lambda x: (x["type"] != "video", x["file"].lower()))
        print(f"{group}: {len(catalog[group])} media files")
    output = PUBLIC / "figures-manifest.json"
    output.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Indexed {counts['image']} images and {counts['video']} videos in {output}")

if __name__ == "__main__":
    main()

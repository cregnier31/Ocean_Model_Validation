# Ocean Model Validation (OMV)

React + TypeScript + Vite application for browsing supplied ocean forecast validation figures.

## Current behavior

The frontend displays **only indexed plots and videos**. It does not calculate RMSE, bias, skill scores, model rankings, drifter trajectories, or eddy statistics. The overview reports counts of available media files, not verification results. Empty sections explicitly say when results have not been provided.

Supported folders:

```text
imgs/
  CLASS1/*.png
  CLASS4/
    profiles/*.png
    radar/*.png
    SST_drifters/*.png
    UV_drifters/*.png
    aice/*.png
  lagrangian/*.png
  eddy_tracking/*.{png,mp4,webm}\n  surface-dynamics-diagnostics/\n    global_velocity/\n      maps/*.png\n      timeseries/*.png\n  ocean_dynamics/*.{png,mp4,webm}\n  videos/\n    lagrangian/*.mp4\n    eddy_tracking/*.mp4\n    ocean_dynamics/*.mp4\n    class1/*.mp4\n    class4/*.mp4\n    overview/*.mp4
```

## Start

Install Node.js and npm in your environment, then run from the repository root:

```bash
git pull origin main
python scripts/sync_figures.py imgs
cd frontend
npm install --include=dev
npm run dev
```

Open http://localhost:5173. To sync images from a different location, pass the absolute path to the `imgs` directory. Re-run the sync command after adding plots or videos, then refresh the browser.

The sync script copies images and videos to `frontend/public/imgs/` and writes `frontend/public/figures-manifest.json`. If you want the images tracked by GitHub, commit those generated assets separately.

## Modules

- **Overview:** counts of indexed PNG files.
- **Class 1–4 Validation:** Class 1 and Class 4 galleries, with Class 4 profiles, radar, regional scores, UV drifters and sea ice. Classes 2 and 3 have no supplied figures.
- **Model Intercomparison:** supplied regional comparison figures.
- **Lagrangian Analysis:** supplied trajectory and separation-statistics figures.
- **Eddy Tracking:** recursively indexed figures and videos, if provided.
- **Ocean Dynamics Diagnostics:** separate maps and annual time-series galleries for the 12 supplied global-velocity diagnostic plots, plus a gallery for other diagnostics and videos.

The `backend/` folder contains an experimental FastAPI scaffold with synthetic endpoints; **it is not used by this frontend**. Do not treat its responses as scientific validation results.

## License

MIT

## Videos

Videos are discovered recursively in a section folder (for example `imgs/lagrangian/movie.mp4`) are displayed in that section. Alternatively place them in `imgs/videos/<section>/`, such as `imgs/videos/eddy_tracking/eddy.mp4` or `imgs/videos/overview/intro.mp4`. Supported video formats: MP4, WebM, OGV and MOV (browser playback depends on codec; H.264 MP4 is recommended). Videos use standard controls and do not autoplay. Re-run `python scripts/sync_figures.py imgs` after adding files. Videos illustrate the section and are not used to calculate validation scores.

### Surface dynamics and nested videos

The importer now reads `imgs/surface-dynamics-diagnostics/global_velocity/maps/` and `imgs/surface-dynamics-diagnostics/global_velocity/timeseries/` as separate galleries. It also discovers MP4/WebM/etc files recursively under `imgs/lagrangian/` and `imgs/eddy_tracking/`, under `imgs/videos/lagrangian/` or `imgs/videos/eddy_tracking/`, and under a sibling `videos/` directory. The media filter in each gallery lets you select plots or videos. Run `python scripts/sync_figures.py imgs` again whenever you add files.

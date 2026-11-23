# Ocean Model Validation (OMV)

React + TypeScript + Vite application for browsing supplied ocean forecast validation figures.

## Current behavior

The frontend displays **only indexed PNG figures**. It does not calculate RMSE, bias, skill scores, model rankings, drifter trajectories, or eddy statistics. The overview reports counts of available image files, not verification results. Empty sections explicitly say when results have not been provided.

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
  eddy_tracking/*.png
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

Open http://localhost:5173. To sync images from a different location, pass the absolute path to the `imgs` directory. Re-run the sync command after adding PNGs, then refresh the browser.

The sync script copies the PNGs to `frontend/public/imgs/` and writes `frontend/public/figures-manifest.json`. If you want the images tracked by GitHub, commit those generated assets separately.

## Modules

- **Overview:** counts of indexed PNG files.
- **Class 1–4 Validation:** Class 1 and Class 4 galleries, with Class 4 profiles, radar, regional scores, UV drifters and sea ice. Classes 2 and 3 have no supplied figures.
- **Model Intercomparison:** supplied regional comparison figures.
- **Lagrangian Analysis:** supplied trajectory and separation-statistics figures.
- **Eddy Tracking:** figure gallery; currently empty if no PNGs are present.
- **Ocean Dynamics Diagnostics:** no supplied results yet.

The `backend/` folder contains an experimental FastAPI scaffold with synthetic endpoints; **it is not used by this frontend**. Do not treat its responses as scientific validation results.

## License

MIT

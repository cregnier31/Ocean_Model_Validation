# Ocean Model Validation (OMV)

Interactive scientific dashboard for ocean forecast model validation, intercomparison, Lagrangian processes, eddy tracking, and ocean dynamics diagnostics.

## Stack
- React 19 + TypeScript + Vite
- Plotly for scientific figures
- MapLibre GL for interactive maps
- Python FastAPI for model metadata and metrics

## Quick start
Install Node.js 20.19+ and Python 3.10+.

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

In another terminal:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API: http://localhost:8000/docs

The frontend uses built-in **synthetic demonstration data** by default. Set `VITE_API_URL=http://localhost:8000` in `frontend/.env` to connect the API; the API currently returns synthetic data as well.

## Modules
- **Overview** — summary of validation scores
- **Class 1–4 Validation** — selectable metric classes and time series
- **Model Intercomparison** — side-by-side scores
- **Lagrangian Analysis** — illustrative drifter trajectories
- **Eddy Tracking** — illustrative eddy centers and statistics
- **Ocean Dynamics Diagnostics** — EKE, vorticity, divergence and Okubo–Weiss indicators

## Connecting production scientific data
Replace synthetic endpoints with model- and observation-derived computations. Recommended processing: xarray, Dask, Zarr/NetCDF, Parquet; PostGIS for spatial feature indexing and vector/tile services for large layers. Preserve provenance (model, reference, variable, run date, lead time, spatial/temporal aggregation) with every metric.

The class naming is a placeholder taxonomy: adapt Class 1–4 to your organization's formal validation definitions before operational use.

## License
MIT

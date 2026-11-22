"""Prototype API: all metrics and trajectories are SYNTHETIC demo values."""
from datetime import date, timedelta
from math import cos, sin
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Ocean Model Validation API", version="0.1.0", description="Demonstration endpoints; no observational validation is performed.")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=False, allow_methods=["GET"], allow_headers=["*"])

MODELS = ["NEMO Global", "HYCOM", "ROMS Regional"]
METRICS = ["RMSE", "Bias", "Correlation", "Skill Score"]
REGIONS = ["North Atlantic", "Mediterranean", "Global Ocean"]

class TimeSeries(BaseModel):
    model: str
    metric: str
    dates: list[str]
    values: list[float]
    source: str = "synthetic demonstration data"

@app.get("/health")
def health():
    return {"status": "ok", "data_mode": "synthetic"}

@app.get("/api/catalog")
def catalog():
    return {"models": MODELS, "metrics": METRICS, "regions": REGIONS,
            "variables": ["Sea surface height", "Sea surface temperature", "Currents", "Salinity"],
            "classes": [f"Class {i}" for i in range(1,5)], "data_mode": "synthetic"}

@app.get("/api/metrics/timeseries", response_model=TimeSeries)
def metric_timeseries(model: str = Query(default=MODELS[0]), metric: str = Query(default="RMSE")):
    if model not in MODELS or metric not in METRICS:
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Unknown model or metric")
    offset = MODELS.index(model)*0.11
    values = []
    for i in range(32):
        oscillation = sin(i*0.49 + offset*6)*0.10 + cos(i*0.23 + offset)*0.05
        if metric == "Correlation":
            value = 0.83 - offset*0.35 + oscillation/2
        elif metric == "Skill Score":
            value = 0.75 - offset*0.36 + oscillation/2
        elif metric == "Bias":
            value = 0.08 + offset + oscillation
        else:
            value = 0.31 + offset + oscillation
        values.append(round(value, 3))
    return TimeSeries(model=model, metric=metric, dates=[(date(2026,9,1)+timedelta(days=i*2)).isoformat() for i in range(32)],values=values)

@app.get("/api/eddies")
def eddies():
    return {"source":"synthetic demonstration data","features":[
      {"id":"E-101","lon":-54,"lat":38,"radius_km":95,"type":"Anticyclonic","lifetime_days":42},
      {"id":"E-102","lon":-44,"lat":33,"radius_km":67,"type":"Cyclonic","lifetime_days":26},
      {"id":"E-103","lon":-62,"lat":41,"radius_km":81,"type":"Anticyclonic","lifetime_days":58},
    ]}

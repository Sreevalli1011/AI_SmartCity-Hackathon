from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import os
import pandas as pd
import numpy as np
import sys


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "Models")
DATA_DIR = os.path.join(BASE_DIR, "Data")
TRAINING_DIR = os.path.join(BASE_DIR, "Training")

if TRAINING_DIR not in sys.path:
    sys.path.append(TRAINING_DIR)

from diversion_engine import evaluate_diversion

# ============================================================
# LOAD MODELS
# ============================================================

congestion_model = joblib.load(
    os.path.join(MODEL_DIR, "congestion_model.joblib")
)

congestion_features = joblib.load(
    os.path.join(MODEL_DIR, "congestion_features.joblib")
)

forecast_models = {
    "15m": joblib.load(os.path.join(MODEL_DIR, "forecast_15m_model.joblib")),
    "30m": joblib.load(os.path.join(MODEL_DIR, "forecast_30m_model.joblib")),
    "45m": joblib.load(os.path.join(MODEL_DIR, "forecast_45m_model.joblib")),
    "60m": joblib.load(os.path.join(MODEL_DIR, "forecast_60m_model.joblib")),
}

forecast_features = joblib.load(
    os.path.join(MODEL_DIR, "forecast_features.joblib")
)

incident_model = joblib.load(
    os.path.join(MODEL_DIR, "incident_model.joblib")
)

incident_features = joblib.load(
    os.path.join(MODEL_DIR, "incident_features.joblib")
)


# ============================================================
# LOAD DATA
# ============================================================

bottleneck_file = os.path.join(DATA_DIR, "bottlenecks.csv")
simulation_file = os.path.join(DATA_DIR, "simulation_summary.json")

bottlenecks = None

if os.path.exists(bottleneck_file):
    bottlenecks = pd.read_csv(bottleneck_file)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Artery Smart Traffic Intelligence API",
    description="AI-powered urban traffic intelligence backend",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# INPUT MODEL
# ============================================================

class TrafficData(BaseModel):

    speed_kmh: float
    flow_vph: float
    occupancy_pct: float

    travel_time_min: float
    free_flow_time_min: float
    delay_min: float
    queue_length_veh: float
    congestion_index: float

    hour: int
    minute: int
    day_of_week: int
    is_weekend: int
    is_peak_hour: int

    speed_lag_5: float
    speed_lag_10: float
    speed_lag_15: float

    flow_lag_5: float
    flow_lag_10: float
    flow_lag_15: float

    congestion_lag_5: float

    speed_change_5: float
    flow_change_5: float
    congestion_change_5: float

    speed_rolling_15: float
    flow_rolling_15: float
    congestion_rolling_15: float


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "system": "Artery Smart Traffic Intelligence",
        "status": "running",
        "models": [
            "congestion detection",
            "15-minute forecasting",
            "30-minute forecasting",
            "45-minute forecasting",
            "60-minute forecasting",
            "incident detection",
            "bottleneck detection"
        ]
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "models_loaded": True,
        "forecast_horizons": ["15m", "30m", "45m", "60m"]
    }


# ============================================================
# MAIN AI PREDICTION
# ============================================================

@app.post("/predict")
def predict(data: TrafficData):

    input_data = data.model_dump()

    # --------------------------------------------------------
    # Current congestion
    # --------------------------------------------------------

    congestion_input = pd.DataFrame(
        [[input_data[f] for f in congestion_features]],
        columns=congestion_features
    )

    congestion_prediction = congestion_model.predict(
        congestion_input
    )[0]

    congestion_probabilities = congestion_model.predict_proba(
        congestion_input
    )[0]

    congestion_confidence = float(
        np.max(congestion_probabilities)
    )


    # --------------------------------------------------------
    # Forecasts
    # --------------------------------------------------------

    forecast_input = pd.DataFrame(
        [[input_data[f] for f in forecast_features]],
        columns=forecast_features
    )

    forecasts = {}

    for horizon, model in forecast_models.items():

        prediction = model.predict(
            forecast_input
        )[0]

        forecasts[horizon] = round(
            float(prediction),
            6
        )


    # --------------------------------------------------------
    # Incident detection
    # --------------------------------------------------------

    incident_input = pd.DataFrame(
        [[input_data[f] for f in incident_features]],
        columns=incident_features
    )

    incident_prediction = incident_model.predict(
        incident_input
    )[0]

    incident_probability = incident_model.predict_proba(
        incident_input
    )[0][1]


    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "current_congestion": str(
            congestion_prediction
        ),

        "congestion_confidence": round(
            congestion_confidence,
            4
        ),

        "forecast": {

            "15m": forecasts["15m"],
            "30m": forecasts["30m"],
            "45m": forecasts["45m"],
            "60m": forecasts["60m"]

        },

        "incident": {

            "detected": bool(incident_prediction),
            "probability": round(
                float(incident_probability),
                4
            )

        }

    }


# ============================================================
# FORECAST ENDPOINT
# ============================================================

@app.post("/forecast")
def forecast(data: TrafficData):

    input_data = data.model_dump()

    forecast_input = pd.DataFrame(
        [[input_data[f] for f in forecast_features]],
        columns=forecast_features
    )

    result = {}

    for horizon, model in forecast_models.items():

        prediction = model.predict(
            forecast_input
        )[0]

        result[horizon] = round(
            float(prediction),
            6
        )

    return {
        "forecast": result
    }


# ============================================================
# INCIDENT ENDPOINT
# ============================================================

@app.post("/incident")
def detect_incident(data: TrafficData):

    input_data = data.model_dump()

    incident_input = pd.DataFrame(
        [[input_data[f] for f in incident_features]],
        columns=incident_features
    )

    prediction = incident_model.predict(
        incident_input
    )[0]

    probability = incident_model.predict_proba(
        incident_input
    )[0][1]

    return {

        "incident_detected": bool(prediction),

        "incident_probability": round(
            float(probability),
            4
        )

    }


# ============================================================
# BOTTLENECK ENDPOINT
# ============================================================

@app.get("/bottlenecks")
def get_bottlenecks():

    if bottlenecks is None:

        return {
            "status": "unavailable",
            "message": "Bottleneck data not found"
        }

    records = bottlenecks.to_dict(
        orient="records"
    )

    return {

        "status": "success",

        "total_segments": len(records),

        "bottlenecks": records

    }

# ============================================================
# RECOMMENDATIONS / DIVERSION ENDPOINT
# ============================================================

@app.get("/recommendations")
def get_recommendations(segment_id: str = "R0312"):

    result = evaluate_diversion(segment_id)

    return {
        "status": "success",
        "recommendation": result
    }
# ============================================================
# SIMULATION ENDPOINT
# ============================================================

@app.get("/simulation")
def get_simulation():

    if not os.path.exists(simulation_file):

        return {
            "status": "unavailable",
            "message": "Simulation results not found"
        }

    import json

    with open(
        simulation_file,
        "r"
    ) as file:

        simulation = json.load(file)

    return {

        "status": "success",

        "simulation": simulation

    }


# ============================================================
# RUN INFORMATION
# ============================================================

@app.get("/system-info")
def system_info():

    return {

        "project": "Artery",

        "purpose":
            "Urban Traffic Flow and Incident Intelligence",

        "ai_models": {

            "congestion":
                "Random Forest Classifier",

            "forecasting":
                "Random Forest Regressors",

            "incident_detection":
                "Random Forest Classifier"

        },

        "forecast_horizons":
            ["15 minutes", "30 minutes",
             "45 minutes", "60 minutes"],

        "backend":
            "FastAPI",

        "ml_framework":
            "scikit-learn"

    }
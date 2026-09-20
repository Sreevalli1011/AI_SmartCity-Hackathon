import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib

print("Loading traffic data...")

traffic = pd.read_csv("Data/traffic_features.csv")
traffic["timestamp"] = pd.to_datetime(traffic["timestamp"])

print("Loading incident data...")

incidents = pd.read_csv("Data/incidents_train.csv")
incidents["start_time"] = pd.to_datetime(incidents["start_time"])
incidents["end_time"] = pd.to_datetime(incidents["end_time"])

# ---------------------------------------------------------
# Create incident label
# ---------------------------------------------------------

traffic["incident"] = 0

print("Creating incident labels...")

# Match traffic observations with incidents
for _, incident in incidents.iterrows():

    mask = (
        (traffic["segment_id"] == incident["segment_id"]) &
        (traffic["timestamp"] >= incident["start_time"]) &
        (traffic["timestamp"] <= incident["end_time"])
    )

    traffic.loc[mask, "incident"] = 1

print("Incident observations:", traffic["incident"].sum())
print("Normal observations:", (traffic["incident"] == 0).sum())

# ---------------------------------------------------------
# Features
# ---------------------------------------------------------

features = [
    "speed_kmh",
    "flow_vph",
    "occupancy_pct",
    "travel_time_min",
    "free_flow_time_min",
    "delay_min",
    "queue_length_veh",
    "congestion_index",

    "hour",
    "minute",
    "day_of_week",
    "is_weekend",
    "is_peak_hour",

    "speed_lag_5",
    "speed_lag_10",
    "speed_lag_15",

    "flow_lag_5",
    "flow_lag_10",
    "flow_lag_15",

    "congestion_lag_5",

    "speed_change_5",
    "flow_change_5",
    "congestion_change_5",

    "speed_rolling_15",
    "flow_rolling_15",
    "congestion_rolling_15"
]

df = traffic.dropna(subset=features + ["incident"]).copy()

# Sort chronologically
df = df.sort_values("timestamp")

X = df[features]
y = df["incident"]

# ---------------------------------------------------------
# Time-based split
# ---------------------------------------------------------

split_index = int(len(df) * 0.8)

X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]

y_train = y.iloc[:split_index]
y_test = y.iloc[split_index:]

print("\nTraining rows:", len(X_train))
print("Testing rows:", len(X_test))

print("\nIncident distribution in training:")
print(y_train.value_counts())

# ---------------------------------------------------------
# Model
# ---------------------------------------------------------

print("\nTraining incident detection model...")

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    min_samples_leaf=5,
    class_weight="balanced",
    n_jobs=-1,
    random_state=42
)

model.fit(X_train, y_train)

# ---------------------------------------------------------
# Evaluation
# ---------------------------------------------------------

predictions = model.predict(X_test)

print("\n========== INCIDENT DETECTION RESULTS ==========")

print(classification_report(
    y_test,
    predictions,
    target_names=["Normal", "Incident"],
    zero_division=0
))

print("Confusion Matrix:")
print(confusion_matrix(y_test, predictions))

# ---------------------------------------------------------
# Save model
# ---------------------------------------------------------

joblib.dump(
    model,
    "Models/incident_model.joblib"
)

joblib.dump(
    features,
    "Models/incident_features.joblib"
)

print("\nIncident model saved successfully.")
print("Models/incident_model.joblib")
print("Models/incident_features.joblib")
import pandas as pd
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "Data"
MODEL_DIR = BASE_DIR / "Models"

MODEL_DIR.mkdir(exist_ok=True)


print("Loading traffic features...")

traffic = pd.read_csv(
    DATA_DIR / "traffic_features.csv"
)

traffic["timestamp"] = pd.to_datetime(
    traffic["timestamp"]
)

print(f"Traffic rows: {len(traffic)}")


print("\nLoading forecast targets...")

targets = pd.read_csv(
    DATA_DIR / "forecast_targets_train.csv"
)

targets["timestamp"] = pd.to_datetime(
    targets["timestamp"]
)

print(f"Target rows: {len(targets)}")


print("\nMerging datasets...")

df = traffic.merge(
    targets[
        [
            "timestamp",
            "segment_id",
            "target_congestion_30m"
        ]
    ],
    on=["timestamp", "segment_id"],
    how="inner"
)

print(f"Merged rows: {len(df)}")


df = df.dropna(
    subset=["target_congestion_30m"]
)


df = df.sort_values(
    "timestamp"
).reset_index(drop=True)


features = [
    "speed_kmh",
    "flow_vph",
    "occupancy_pct",
    "travel_time_min",
    "free_flow_time_min",
    "delay_min",
    "queue_length_veh",

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


X = df[features]
y = df["target_congestion_30m"]


split_index = int(len(df) * 0.80)

X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]

y_train = y.iloc[:split_index]
y_test = y.iloc[split_index:]


print("\nDataset split:")
print(f"Training rows: {len(X_train)}")
print(f"Testing rows:  {len(X_test)}")


print("\nTraining 30-minute forecasting model...")

model = RandomForestRegressor(
    n_estimators=50,
    max_depth=20,
    min_samples_leaf=5,
    n_jobs=-1,
    random_state=42
)

model.fit(
    X_train,
    y_train
)

print("Training complete!")


print("\nGenerating predictions...")

predictions = model.predict(X_test)


mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(
    y_test,
    predictions
)


print("\n===================================")
print("30-MINUTE FORECAST RESULTS")
print("===================================")

print(f"MAE :  {mae:.6f}")
print(f"RMSE:  {rmse:.6f}")
print(f"R²  :  {r2:.6f}")


model_file = MODEL_DIR / "forecast_30m_model.joblib"

joblib.dump(
    model,
    model_file
)


print("\n===================================")
print("30-MINUTE FORECAST MODEL COMPLETE")
print("===================================")

print(f"Model saved to: {model_file}")
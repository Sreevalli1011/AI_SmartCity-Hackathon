import pandas as pd
from pathlib import Path


# ---------------------------------------
# Project paths
# ---------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "Data"


# ---------------------------------------
# Load cleaned traffic data
# ---------------------------------------

input_file = DATA_DIR / "traffic_clean.csv"

print("Loading cleaned traffic data...")

df = pd.read_csv(input_file)

print(f"Rows loaded: {len(df)}")


# ---------------------------------------
# Convert timestamp
# ---------------------------------------

df["timestamp"] = pd.to_datetime(df["timestamp"])


# ---------------------------------------
# Sort by road segment and time
# ---------------------------------------

df = df.sort_values(
    ["segment_id", "timestamp"]
).reset_index(drop=True)


# ---------------------------------------
# TIME FEATURES
# ---------------------------------------

print("Creating time features...")

df["hour"] = df["timestamp"].dt.hour

df["minute"] = df["timestamp"].dt.minute

df["day_of_week"] = df["timestamp"].dt.dayofweek

df["is_weekend"] = (
    df["day_of_week"] >= 5
).astype(int)


# Peak-hour indicator
df["is_peak_hour"] = (
    (
        (df["hour"] >= 7) &
        (df["hour"] <= 10)
    )
    |
    (
        (df["hour"] >= 17) &
        (df["hour"] <= 20)
    )
).astype(int)


# ---------------------------------------
# LAG FEATURES
# ---------------------------------------

print("Creating historical traffic features...")

# Previous 5-minute traffic
df["speed_lag_5"] = (
    df.groupby("segment_id")["speed_kmh"]
    .shift(1)
)

df["flow_lag_5"] = (
    df.groupby("segment_id")["flow_vph"]
    .shift(1)
)

df["congestion_lag_5"] = (
    df.groupby("segment_id")["congestion_index"]
    .shift(1)
)


# Previous 10-minute traffic
df["speed_lag_10"] = (
    df.groupby("segment_id")["speed_kmh"]
    .shift(2)
)

df["flow_lag_10"] = (
    df.groupby("segment_id")["flow_vph"]
    .shift(2)
)


# Previous 15-minute traffic
df["speed_lag_15"] = (
    df.groupby("segment_id")["speed_kmh"]
    .shift(3)
)

df["flow_lag_15"] = (
    df.groupby("segment_id")["flow_vph"]
    .shift(3)
)


# ---------------------------------------
# TRAFFIC TREND FEATURES
# ---------------------------------------

print("Creating traffic trend features...")

df["speed_change_5"] = (
    df["speed_kmh"] - df["speed_lag_5"]
)

df["flow_change_5"] = (
    df["flow_vph"] - df["flow_lag_5"]
)

df["congestion_change_5"] = (
    df["congestion_index"]
    - df["congestion_lag_5"]
)


# ---------------------------------------
# ROLLING FEATURES
# ---------------------------------------

print("Creating rolling traffic features...")

df["speed_rolling_15"] = (
    df.groupby("segment_id")["speed_kmh"]
    .transform(
        lambda x: x.rolling(
            window=3,
            min_periods=1
        ).mean()
    )
)

df["flow_rolling_15"] = (
    df.groupby("segment_id")["flow_vph"]
    .transform(
        lambda x: x.rolling(
            window=3,
            min_periods=1
        ).mean()
    )
)

df["congestion_rolling_15"] = (
    df.groupby("segment_id")["congestion_index"]
    .transform(
        lambda x: x.rolling(
            window=3,
            min_periods=1
        ).mean()
    )
)


# ---------------------------------------
# DROP rows without enough history
# ---------------------------------------

required_history = [
    "speed_lag_15",
    "flow_lag_15"
]

df = df.dropna(
    subset=required_history
).reset_index(drop=True)


# ---------------------------------------
# Save feature dataset
# ---------------------------------------

output_file = DATA_DIR / "traffic_features.csv"

df.to_csv(
    output_file,
    index=False
)


# ---------------------------------------
# Summary
# ---------------------------------------

print("\n===================================")
print("FEATURE ENGINEERING COMPLETE")
print("===================================")

print(f"Rows: {len(df)}")

print(f"Columns: {len(df.columns)}")

print(f"Output: {output_file}")

print("\nNew features:")

new_features = [
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

for feature in new_features:
    print(" -", feature)
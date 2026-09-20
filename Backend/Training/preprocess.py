import pandas as pd
from pathlib import Path


# -----------------------------
# Project paths
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


# -----------------------------
# Load traffic data
# -----------------------------

input_file = DATA_DIR / "traffic_train.csv"

print("Loading traffic dataset...")

df = pd.read_csv(input_file)

print(f"Rows loaded: {len(df)}")
print(f"Columns: {len(df.columns)}")

print("\nColumns:")
print(df.columns.tolist())


# -----------------------------
# Convert timestamp
# -----------------------------

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)


# -----------------------------
# Remove duplicate observations
# -----------------------------

before = len(df)

df = df.drop_duplicates()

after = len(df)

print(f"\nDuplicates removed: {before - after}")


# -----------------------------
# Sort traffic chronologically
# -----------------------------

df = df.sort_values(
    ["segment_id", "timestamp"]
).reset_index(drop=True)


# -----------------------------
# Handle impossible values
# -----------------------------

numeric_columns = [
    "speed_kmh",
    "flow_vph",
    "occupancy_pct",
    "travel_time_min",
    "free_flow_time_min",
    "delay_min",
    "queue_length_veh",
    "congestion_index"
]

for column in numeric_columns:

    if column in df.columns:

        # Negative traffic measurements are impossible
        df.loc[df[column] < 0, column] = pd.NA


# -----------------------------
# Handle extreme occupancy
# -----------------------------

if "occupancy_pct" in df.columns:

    df.loc[
        (df["occupancy_pct"] < 0) |
        (df["occupancy_pct"] > 100),
        "occupancy_pct"
    ] = pd.NA


# -----------------------------
# Fill missing numerical values
# -----------------------------

for column in numeric_columns:

    if column in df.columns:

        df[column] = df.groupby("segment_id")[column].transform(
            lambda group: group.interpolate(
                limit_direction="both"
            )
        )


# -----------------------------
# Remove rows with invalid timestamps
# -----------------------------

df = df.dropna(
    subset=["timestamp", "segment_id"]
)


# -----------------------------
# Final chronological sorting
# -----------------------------

df = df.sort_values(
    ["timestamp", "segment_id"]
).reset_index(drop=True)


# -----------------------------
# Save cleaned dataset
# -----------------------------

output_file = DATA_DIR / "traffic_clean.csv"

df.to_csv(
    output_file,
    index=False
)


# -----------------------------
# Summary
# -----------------------------

print("\n-----------------------------")
print("DATA CLEANING COMPLETE")
print("-----------------------------")

print(f"Clean rows: {len(df)}")
print(f"Output file: {output_file}")

print("\nMissing values:")
print(df.isna().sum())

print("\nFirst 5 cleaned rows:")
print(df.head())
import pandas as pd
import joblib

from pathlib import Path

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix


# ---------------------------------------
# Project paths
# ---------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "Data"
MODEL_DIR = BASE_DIR / "Models"

MODEL_DIR.mkdir(exist_ok=True)


# ---------------------------------------
# Load feature dataset
# ---------------------------------------

print("Loading feature dataset...")

df = pd.read_csv(
    DATA_DIR / "traffic_features.csv"
)

print(f"Rows loaded: {len(df)}")


# ---------------------------------------
# Sort chronologically
# ---------------------------------------

df = df.sort_values(
    "timestamp"
).reset_index(drop=True)


# ---------------------------------------
# Time-based train/test split
# ---------------------------------------

split_index = int(len(df) * 0.80)

train_df = df.iloc[:split_index].copy()
test_df = df.iloc[split_index:].copy()

print("\nDataset split:")
print(f"Training rows: {len(train_df)}")
print(f"Testing rows:  {len(test_df)}")


# ---------------------------------------
# Calculate thresholds ONLY from training
# ---------------------------------------

q50 = train_df["congestion_index"].quantile(0.50)
q75 = train_df["congestion_index"].quantile(0.75)
q95 = train_df["congestion_index"].quantile(0.95)

print("\nTraining thresholds:")
print(f"Normal / Moderate: {q50:.6f}")
print(f"Moderate / Heavy:   {q75:.6f}")
print(f"Heavy / Severe:     {q95:.6f}")


# ---------------------------------------
# Create labels
# ---------------------------------------

def create_label(value):

    if value <= q50:
        return "Normal"

    elif value <= q75:
        return "Moderate"

    elif value <= q95:
        return "Heavy"

    else:
        return "Severe"


train_df["congestion_label"] = (
    train_df["congestion_index"]
    .apply(create_label)
)

test_df["congestion_label"] = (
    test_df["congestion_index"]
    .apply(create_label)
)


# ---------------------------------------
# Show training class distribution
# ---------------------------------------

print("\nTraining class distribution:")

print(
    train_df["congestion_label"]
    .value_counts()
)


# ---------------------------------------
# Select ML features
# ---------------------------------------

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


X_train = train_df[features]
y_train = train_df["congestion_label"]

X_test = test_df[features]
y_test = test_df["congestion_label"]


# ---------------------------------------
# Train Random Forest
# ---------------------------------------

print("\nTraining Random Forest...")

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    min_samples_leaf=5,
    n_jobs=-1,
    random_state=42,
    class_weight="balanced"
)

model.fit(
    X_train,
    y_train
)

print("Training complete!")


# ---------------------------------------
# Predictions
# ---------------------------------------

print("\nGenerating predictions...")

predictions = model.predict(X_test)


# ---------------------------------------
# Evaluation
# ---------------------------------------

print("\n===================================")
print("MODEL EVALUATION")
print("===================================")

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)


# ---------------------------------------
# Save model
# ---------------------------------------

model_file = (
    MODEL_DIR /
    "congestion_model.joblib"
)

joblib.dump(
    model,
    model_file
)


# ---------------------------------------
# Save feature list
# ---------------------------------------

feature_file = (
    MODEL_DIR /
    "congestion_features.joblib"
)

joblib.dump(
    features,
    feature_file
)


print("\n===================================")
print("CONGESTION MODEL COMPLETE")
print("===================================")

print(f"Model saved to: {model_file}")
print(f"Features saved to: {feature_file}")
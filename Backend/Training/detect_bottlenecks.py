import pandas as pd
import numpy as np

print("Loading traffic data...")

df = pd.read_csv("Data/traffic_features.csv")
df["timestamp"] = pd.to_datetime(df["timestamp"])

print("Rows loaded:", len(df))

# ---------------------------------------------------------
# 1. Define congestion threshold
# ---------------------------------------------------------

# Project-defined threshold:
# top 25% of congestion_index values are considered congested
congestion_threshold = df["congestion_index"].quantile(0.75)

print(
    "Congestion threshold:",
    round(congestion_threshold, 4)
)

df["is_congested"] = (
    df["congestion_index"] > congestion_threshold
).astype(int)

# ---------------------------------------------------------
# 2. Identify peak-hour congestion
# ---------------------------------------------------------

df["peak_congested"] = (
    (df["is_peak_hour"] == 1) &
    (df["is_congested"] == 1)
).astype(int)

# ---------------------------------------------------------
# 3. Aggregate traffic behavior by road segment
# ---------------------------------------------------------

bottlenecks = df.groupby("segment_id").agg(

    observations=("segment_id", "count"),

    congested_observations=("is_congested", "sum"),

    congestion_frequency=("is_congested", "mean"),

    peak_congested_observations=("peak_congested", "sum"),

    average_speed=("speed_kmh", "mean"),

    average_flow=("flow_vph", "mean"),

    average_congestion=("congestion_index", "mean"),

    average_delay=("delay_min", "mean"),

    average_queue=("queue_length_veh", "mean")

).reset_index()

# ---------------------------------------------------------
# 4. Convert congestion frequency to percentage
# ---------------------------------------------------------

bottlenecks["congestion_frequency_pct"] = (
    bottlenecks["congestion_frequency"] * 100
)

# ---------------------------------------------------------
# 5. Classify road segments
# ---------------------------------------------------------

def classify_bottleneck(row):

    frequency = row["congestion_frequency"]

    if frequency >= 0.30:
        return "Recurring Bottleneck"

    elif frequency >= 0.15:
        return "Potential Bottleneck"

    else:
        return "Normal Segment"


bottlenecks["bottleneck_type"] = (
    bottlenecks.apply(
        classify_bottleneck,
        axis=1
    )
)

# ---------------------------------------------------------
# 6. Calculate bottleneck score
# ---------------------------------------------------------

delay_normalized = (
    bottlenecks["average_delay"] /
    (bottlenecks["average_delay"].max() + 1e-6)
)

bottlenecks["bottleneck_score"] = (
    bottlenecks["congestion_frequency"] * 0.5
    + bottlenecks["average_congestion"] * 0.3
    + delay_normalized * 0.2
)

bottlenecks["bottleneck_score"] *= 100

# ---------------------------------------------------------
# 7. Sort strongest bottlenecks first
# ---------------------------------------------------------

bottlenecks = bottlenecks.sort_values(
    "bottleneck_score",
    ascending=False
)

# ---------------------------------------------------------
# 8. Save results
# ---------------------------------------------------------

bottlenecks.to_csv(
    "Data/bottlenecks.csv",
    index=False
)

# ---------------------------------------------------------
# 9. Display results
# ---------------------------------------------------------

print("\n========== BOTTLENECK RESULTS ==========")

print(
    bottlenecks[
        [
            "segment_id",
            "congestion_frequency_pct",
            "average_speed",
            "average_delay",
            "average_queue",
            "bottleneck_type",
            "bottleneck_score"
        ]
    ].head(20).to_string(index=False)
)

print("\n========== BOTTLENECK SUMMARY ==========")

print(
    bottlenecks["bottleneck_type"].value_counts()
)

print("\nResults saved to:")
print("Data/bottlenecks.csv")
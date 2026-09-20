import pandas as pd
import numpy as np
import json

print("========================================")
print("ARTERY SIMULATION ENGINE")
print("========================================")


# =========================================================
# 1. LOAD DATA
# =========================================================

print("Loading traffic data...")

traffic = pd.read_csv("Data/traffic_features.csv")
traffic["timestamp"] = pd.to_datetime(traffic["timestamp"])

print("Loading network data...")

network = pd.read_csv("Data/network.csv")

print("Loading bottleneck data...")

bottlenecks = pd.read_csv("Data/bottlenecks.csv")


# =========================================================
# 2. SELECT SIMULATION TIME
# =========================================================

simulation_time = traffic["timestamp"].max()

print("\nSimulation timestamp:", simulation_time)


# Current traffic state
current = traffic[
    traffic["timestamp"] == simulation_time
].copy()

print("Segments available:", len(current))


# =========================================================
# 3. SIMULATION FUNCTION
# =========================================================

def simulate_demand_surge(
    demand_increase_percent=20
):

    print("\n========================================")
    print("DEMAND SURGE SIMULATION")
    print("========================================")

    print(
        "Demand increase:",
        demand_increase_percent,
        "%"
    )

    df = current.copy()

    # -----------------------------------------------------
    # Simulate increased traffic demand
    # -----------------------------------------------------

    multiplier = (
        1 + demand_increase_percent / 100
    )

    df["simulated_flow"] = (
        df["flow_vph"] * multiplier
    )

    # -----------------------------------------------------
    # Estimate congestion impact
    # -----------------------------------------------------

    # Approximate congestion response based on
    # increased flow relative to current conditions.

    df["flow_change_ratio"] = (
        df["simulated_flow"] /
        df["flow_vph"].replace(0, np.nan)
    )

    df["simulated_congestion"] = (
        df["congestion_index"] *
        df["flow_change_ratio"]
    )

    # Keep congestion within 0-1 range
    df["simulated_congestion"] = (
        df["simulated_congestion"]
        .clip(0, 1)
    )

    # -----------------------------------------------------
    # Calculate speed impact
    # -----------------------------------------------------

    speed_reduction = (
        df["simulated_congestion"]
        - df["congestion_index"]
    )

    df["simulated_speed"] = (
        df["speed_kmh"] *
        (1 - speed_reduction.clip(0, 0.5))
    )

    # -----------------------------------------------------
    # Classify simulated congestion
    # -----------------------------------------------------

    def classify(value):

        if value <= 0.01:
            return "Normal"

        elif value <= 0.05:
            return "Moderate"

        elif value <= 0.10:
            return "Heavy"

        else:
            return "Severe"

    df["simulated_status"] = (
        df["simulated_congestion"]
        .apply(classify)
    )

    # -----------------------------------------------------
    # Compare before and after
    # -----------------------------------------------------

    df["congestion_change"] = (
        df["simulated_congestion"]
        - df["congestion_index"]
    )

    df["speed_change"] = (
        df["simulated_speed"]
        - df["speed_kmh"]
    )

    return df


# =========================================================
# 4. RUN SIMULATION
# =========================================================

simulation = simulate_demand_surge(20)


# =========================================================
# 5. SUMMARY
# =========================================================

average_speed_before = (
    simulation["speed_kmh"].mean()
)

average_speed_after = (
    simulation["simulated_speed"].mean()
)

average_congestion_before = (
    simulation["congestion_index"].mean()
)

average_congestion_after = (
    simulation["simulated_congestion"].mean()
)


print("\n========================================")
print("SIMULATION SUMMARY")
print("========================================")

print(
    "Average speed before:",
    round(average_speed_before, 2),
    "km/h"
)

print(
    "Average speed after:",
    round(average_speed_after, 2),
    "km/h"
)

print(
    "Average congestion before:",
    round(average_congestion_before, 4)
)

print(
    "Average congestion after:",
    round(average_congestion_after, 4)
)

print(
    "Average congestion increase:",
    round(
        average_congestion_after
        - average_congestion_before,
        4
    )
)


# =========================================================
# 6. COUNT IMPACTED SEGMENTS
# =========================================================

severe_segments = (
    simulation[
        simulation["simulated_status"] == "Severe"
    ]
)

heavy_segments = (
    simulation[
        simulation["simulated_status"] == "Heavy"
    ]
)

moderate_segments = (
    simulation[
        simulation["simulated_status"] == "Moderate"
    ]
)

print("\n========================================")
print("IMPACTED SEGMENTS")
print("========================================")

print(
    "Severe:",
    len(severe_segments)
)

print(
    "Heavy:",
    len(heavy_segments)
)

print(
    "Moderate:",
    len(moderate_segments)
)


# =========================================================
# 7. IDENTIFY TOP IMPACTED ROADS
# =========================================================

top_impacted = simulation.sort_values(
    "congestion_change",
    ascending=False
).head(10)


print("\n========================================")
print("TOP IMPACTED ROAD SEGMENTS")
print("========================================")

print(
    top_impacted[
        [
            "segment_id",
            "congestion_index",
            "simulated_congestion",
            "speed_kmh",
            "simulated_speed",
            "congestion_change"
        ]
    ].to_string(index=False)
)


# =========================================================
# 8. SAVE SIMULATION RESULTS
# =========================================================

simulation[
    [
        "timestamp",
        "segment_id",
        "speed_kmh",
        "simulated_speed",
        "flow_vph",
        "simulated_flow",
        "congestion_index",
        "simulated_congestion",
        "congestion_change",
        "simulated_status"
    ]
].to_csv(
    "Data/simulation_demand_surge.csv",
    index=False
)


# =========================================================
# 9. SAVE SUMMARY JSON
# =========================================================

summary = {
    "scenario": "Demand Surge",
    "demand_increase_percent": 20,
    "timestamp": str(simulation_time),
    "average_speed_before": round(
        float(average_speed_before), 4
    ),
    "average_speed_after": round(
        float(average_speed_after), 4
    ),
    "average_congestion_before": round(
        float(average_congestion_before), 6
    ),
    "average_congestion_after": round(
        float(average_congestion_after), 6
    ),
    "severe_segments": int(
        len(severe_segments)
    ),
    "heavy_segments": int(
        len(heavy_segments)
    ),
    "moderate_segments": int(
        len(moderate_segments)
    )
}


with open(
    "Data/simulation_summary.json",
    "w"
) as f:

    json.dump(
        summary,
        f,
        indent=4
    )


print("\n========================================")
print("SIMULATION COMPLETE")
print("========================================")

print(
    "Saved:",
    "Data/simulation_demand_surge.csv"
)

print(
    "Saved:",
    "Data/simulation_summary.json"
)
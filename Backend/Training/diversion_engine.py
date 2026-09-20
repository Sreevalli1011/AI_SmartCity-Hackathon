import pandas as pd
import numpy as np
from collections import deque

print("Loading network data...")

network = pd.read_csv("Data/network.csv")

print("Loading traffic data...")

traffic = pd.read_csv("Data/traffic_features.csv")
traffic["timestamp"] = pd.to_datetime(traffic["timestamp"])

print("Loading incidents...")

incidents = pd.read_csv("Data/incidents_train.csv")
incidents["start_time"] = pd.to_datetime(incidents["start_time"])
incidents["end_time"] = pd.to_datetime(incidents["end_time"])

print("Loading roadworks...")

roadworks = pd.read_csv("Data/roadworks_train.csv")
roadworks["start_time"] = pd.to_datetime(roadworks["start_time"])
roadworks["end_time"] = pd.to_datetime(roadworks["end_time"])

print("Loading turn restrictions...")

restrictions = pd.read_csv("Data/turn_restrictions.csv")

print("Loading bottleneck data...")

bottlenecks = pd.read_csv("Data/bottlenecks.csv")


# =========================================================
# 1. Build current traffic state
# =========================================================

latest_time = traffic["timestamp"].max()

current_traffic = (
    traffic[traffic["timestamp"] == latest_time]
    .copy()
)

print("\nCurrent traffic timestamp:", latest_time)


traffic_state = current_traffic.set_index(
    "segment_id"
).to_dict("index")


# =========================================================
# 2. Build network graph
# =========================================================

graph = {}

for _, row in network.iterrows():

    source = row["source_node"]
    target = row["target_node"]
    segment = row["segment_id"]

    if source not in graph:
        graph[source] = []

    graph[source].append({
        "segment_id": segment,
        "target_node": target
    })


# =========================================================
# 3. Helper: check active incident
# =========================================================

def has_active_incident(segment_id, timestamp):

    active = incidents[
        (incidents["segment_id"] == segment_id) &
        (incidents["start_time"] <= timestamp) &
        (incidents["end_time"] >= timestamp)
    ]

    return len(active) > 0


# =========================================================
# 4. Helper: check roadwork
# =========================================================

def get_roadwork_fraction(segment_id, timestamp):

    active = roadworks[
        (roadworks["segment_id"] == segment_id) &
        (roadworks["start_time"] <= timestamp) &
        (roadworks["end_time"] >= timestamp)
    ]

    if len(active) == 0:
        return 0.0

    return float(
        active["closure_fraction"].max()
    )


# =========================================================
# 5. Helper: check restrictions
# =========================================================

def restricted(from_segment, to_segment):

    r = restrictions[
        (restrictions["from_segment"] == from_segment) &
        (restrictions["to_segment"] == to_segment)
    ]

    return len(r) > 0


# =========================================================
# 6. Segment viability
# =========================================================

def evaluate_segment(segment_id, timestamp):

    reasons = []

    # Unknown segment
    if segment_id not in traffic_state:

        return {
            "viable": False,
            "reason": "No current traffic data"
        }

    state = traffic_state[segment_id]

    congestion = float(
        state.get("congestion_index", 0)
    )

    capacity = float(
        state.get("flow_vph", 0)
    )

    # -----------------------------------------------------
    # Incident check
    # -----------------------------------------------------

    if has_active_incident(segment_id, timestamp):

        return {
            "viable": False,
            "reason": "Active incident"
        }

    # -----------------------------------------------------
    # Roadwork check
    # -----------------------------------------------------

    closure = get_roadwork_fraction(
        segment_id,
        timestamp
    )

    if closure >= 0.70:

        return {
            "viable": False,
            "reason": "Major roadwork closure"
        }

    if closure > 0:

        reasons.append(
            f"Roadwork closure {closure:.0%}"
        )

    # -----------------------------------------------------
    # Congestion check
    # -----------------------------------------------------

    if congestion >= 0.20:

        return {
            "viable": False,
            "reason": "Alternative already heavily congested"
        }

    elif congestion >= 0.10:

        reasons.append(
            "Moderate congestion"
        )

    # -----------------------------------------------------
    # Capacity check
    # -----------------------------------------------------

    if capacity <= 0:

        return {
            "viable": False,
            "reason": "No usable capacity information"
        }

    return {
        "viable": True,
        "reason": "; ".join(reasons)
        if reasons
        else "Alternative viable"
    }


# =========================================================
# 7. Find alternative routes
# =========================================================

def find_alternatives(
    source_node,
    target_node,
    blocked_segment,
    timestamp
):

    queue = deque()

    queue.append(
        (source_node, [], [])
    )

    visited = set()

    alternatives = []

    while queue:

        node, path, segments = queue.popleft()

        if node == target_node:

            alternatives.append(
                segments
            )

            continue

        if len(segments) >= 5:
            continue

        state_key = (
            node,
            tuple(segments)
        )

        if state_key in visited:
            continue

        visited.add(state_key)

        for edge in graph.get(node, []):

            segment = edge["segment_id"]
            next_node = edge["target_node"]

            if segment == blocked_segment:
                continue

            if segment in segments:
                continue

            if restricted(
                segments[-1] if segments else None,
                segment
            ):
                continue

            queue.append(
                (
                    next_node,
                    path + [next_node],
                    segments + [segment]
                )
            )

    return alternatives


# =========================================================
# 8. Evaluate diversion
# =========================================================

def evaluate_diversion(
    blocked_segment,
    timestamp=None
):

    if timestamp is None:
        timestamp = latest_time

    blocked_row = network[
        network["segment_id"] == blocked_segment
    ]

    if len(blocked_row) == 0:

        return {
            "decision": "DO NOT DIVERT",
            "reason": "Unknown road segment"
        }

    blocked_row = blocked_row.iloc[0]

    source_node = blocked_row["source_node"]
    target_node = blocked_row["target_node"]

    alternatives = find_alternatives(
        source_node,
        target_node,
        blocked_segment,
        timestamp
    )

    viable_routes = []

    for route in alternatives:

        route_ok = True
        route_reasons = []

        for segment in route:

            result = evaluate_segment(
                segment,
                timestamp
            )

            if not result["viable"]:

                route_ok = False

                route_reasons.append(
                    f"{segment}: {result['reason']}"
                )

        if route_ok:

            viable_routes.append(
                route
            )

    # =====================================================
    # DECISION
    # =====================================================

    if viable_routes:

        selected_route = min(
            viable_routes,
            key=len
        )

        return {
            "decision": "DIVERT",
            "reason": "Viable alternative route found",
            "blocked_segment": blocked_segment,
            "alternative_route": selected_route,
            "action": "Recommend controlled diversion"
        }

    # =====================================================
    # NO-DIVERSION CASE
    # =====================================================

    return {
        "decision": "DO NOT DIVERT",
        "reason": "No viable alternative route available",
        "blocked_segment": blocked_segment,
        "alternative_route": None,
        "action": (
            "Use signal management, "
            "monitor queue spillback, "
            "and re-evaluate periodically"
        )
    }


# =========================================================
# 9. Test using bottleneck segments
# =========================================================


# =========================================================
# 10. Save decisions
# =========================================================

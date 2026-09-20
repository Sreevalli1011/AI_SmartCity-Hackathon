import pandas as pd
import diversion_engine


print("========================================")
print("NO-DIVERSION SCENARIO")
print("========================================")


# Load network
network = pd.read_csv("Data/network.csv")

timestamp = diversion_engine.latest_time


# Select a road to block
blocked_segment = network.iloc[0]["segment_id"]

blocked_row = network[
    network["segment_id"] == blocked_segment
].iloc[0]

source_node = blocked_row["source_node"]
target_node = blocked_row["target_node"]


print("Blocked segment:", blocked_segment)
print("Source node:", source_node)
print("Target node:", target_node)


# Find normal alternative routes
alternatives = diversion_engine.find_alternatives(
    source_node,
    target_node,
    blocked_segment,
    timestamp
)


print("\nNormal alternatives found:", len(alternatives))

for route in alternatives[:5]:
    print(route)


# Temporarily make every alternative unavailable
blocked_alternatives = set()

for route in alternatives:
    for segment in route:
        blocked_alternatives.add(segment)


print(
    "\nTemporarily blocking",
    len(blocked_alternatives),
    "alternative segments."
)


# Save original function
original_evaluate = diversion_engine.evaluate_segment


# Force alternative roads to be unavailable
def forced_unavailable(segment_id, timestamp):

    if segment_id in blocked_alternatives:

        return {
            "viable": False,
            "reason": "Scenario: alternative unavailable"
        }

    return original_evaluate(
        segment_id,
        timestamp
    )


# Replace evaluator temporarily
diversion_engine.evaluate_segment = forced_unavailable


# Test diversion decision
result = diversion_engine.evaluate_diversion(
    blocked_segment,
    timestamp
)


print("\n========================================")
print("NO-DIVERSION RESULT")
print("========================================")

print("Decision:", result["decision"])
print("Reason:", result["reason"])
print("Alternative:", result["alternative_route"])
print("Action:", result["action"])

print("========================================")


# Restore original evaluator
diversion_engine.evaluate_segment = original_evaluate

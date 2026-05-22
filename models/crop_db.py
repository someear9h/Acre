# A mock database simulating an agronomic rules engine
CROP_SENSITIVITY_DB = {
    "Tomato": {
        "stage": "flowering",
        "ideal_temp_celsius": [18, 25],
        "critical_rain_threshold_mm": 10,
        "agronomic_rule": "Heavy rain during flowering washes away pollen. Do not apply fertilizer today. Ensure proper field drainage."
    },
    "Wheat": {
        "stage": "tillering",
        "ideal_temp_celsius": [15, 20],
        "critical_rain_threshold_mm": 15,
        "agronomic_rule": "Requires adequate moisture. If no rain and temp > 25, immediate irrigation is required."
    }
}
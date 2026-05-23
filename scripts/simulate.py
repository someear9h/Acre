import sys
import os
import requests
import json

# Add prototype root to python path so we can import from db
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from db.database import init_db, seed_demo_contract

def main():
    print("--- Initializing Acre Demo Simulation ---")
    
    # 1. Reset Database
    init_db()
    seed_demo_contract("+918983404900", "+918983404900")
    print("✅ Database seeded and reset to 100 Quintals.")
    
    # 2. Trigger IoT Sensor Event Webhook
    url = "http://localhost:8000/webhook/sensor-event"
    payload = {
        "farmer_phone": "+918983404900",
        "buyer_phone": "+918983404900",
        "soil_moisture": 25.0,
        "temperature": 38.0,
        "disease_flag": True
    }
    
    print("\n📡 Sending simulated IoT sensor data:")
    print(json.dumps(payload, indent=2))
    
    try:
        response = requests.post(url, json=payload)
        print(f"\n📨 Response [{response.status_code}]:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"\n❌ Error hitting webhook: {e}")

if __name__ == "__main__":
    main()

from fastapi import APIRouter
from pydantic import BaseModel
from db.database import get_connection
from services.yield_engine import calculate_yield_revision
from services.clients import twilio_client, TWILIO_NUMBER

router = APIRouter()


class SensorEvent(BaseModel):
    farmer_phone: str
    buyer_phone: str
    soil_moisture: float
    temperature: float
    disease_flag: bool


@router.post("/webhook/sensor-event")
async def receive_sensor_event(event: SensorEvent):
    """
    Ingests an IoT sensor event, recalculates yield,
    updates the SQLite ledger, and alerts the buyer if the contract is revised.
    """
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # --- Step 1: Log the sensor data ---
        cursor.execute("""
            INSERT INTO iot_logs (farmer_phone, soil_moisture, temperature, disease_flag)
            VALUES (?, ?, ?, ?)
        """, (event.farmer_phone, event.soil_moisture, event.temperature, event.disease_flag))
        conn.commit()
        print(f"IoT log saved for {event.farmer_phone}")

        # --- Step 2: Fetch the active contract ---
        cursor.execute("""
            SELECT id, current_qty FROM smart_contracts
            WHERE farmer_phone = ? AND status = 'ACTIVE'
            LIMIT 1
        """, (event.farmer_phone,))
        row = cursor.fetchone()

        if not row:
            return {
                "status": "No active contract",
                "farmer_phone": event.farmer_phone,
                "message": "Sensor data logged, but no active contract found for this farmer.",
            }

        contract_id = row["id"]
        current_qty = row["current_qty"]

        # --- Step 3: Calculate yield revision ---
        new_qty = calculate_yield_revision(
            soil_moisture=event.soil_moisture,
            temperature=event.temperature,
            disease_flag=event.disease_flag,
            current_qty=current_qty,
        )

        revision_triggered = new_qty < current_qty

        # --- Step 4: Update contract & alert buyer if revised ---
        if revision_triggered:
            cursor.execute("""
                UPDATE smart_contracts SET current_qty = ? WHERE id = ?
            """, (new_qty, contract_id))
            conn.commit()
            print(f"Contract #{contract_id} revised: {current_qty} -> {new_qty} Quintals")

            # Send WhatsApp alert to buyer
            disease_status = "Detected" if event.disease_flag else "None"
            alert_msg = (
                f"\U0001f6a8 *Acre Supply Chain Alert*\n\n"
                f"Due to severe field conditions "
                f"(Moisture: {event.soil_moisture}%, Temp: {event.temperature}\u00b0C) "
                f"and potential disease risk, the forward contract with "
                f"Farmer {event.farmer_phone} for Potato has been automatically revised "
                f"from {current_qty} Quintals to {new_qty} Quintals to guarantee quality.\n\n"
                f"Our system has adjusted your escrow hold accordingly."
            )

            try:
                twilio_client.messages.create(
                    from_=f"whatsapp:{TWILIO_NUMBER}",
                    to=f"whatsapp:{event.buyer_phone}",
                    body=alert_msg,
                )
                whatsapp_status = "Alert sent to buyer"
            except Exception as e:
                print(f"Twilio error: {e}")
                whatsapp_status = f"Failed to send alert: {e}"
        else:
            whatsapp_status = "No revision needed — conditions within tolerance"
            print(f"Contract #{contract_id} unchanged at {current_qty} Quintals")

        return {
            "status": "processed",
            "farmer_phone": event.farmer_phone,
            "previous_qty": current_qty,
            "new_qty": new_qty,
            "revision_triggered": revision_triggered,
            "whatsapp_alert": whatsapp_status,
            "sensor_data": {
                "soil_moisture": event.soil_moisture,
                "temperature": event.temperature,
                "disease_flag": event.disease_flag,
            },
        }

    except Exception as e:
        print(f"IoT webhook error: {e}")
        return {"status": "error", "message": str(e)}

    finally:
        conn.close()

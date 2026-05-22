from fastapi import APIRouter
from models.crop_db import CROP_SENSITIVITY_DB
from services.weather_service import get_24h_weather_forecast
from services.advisory_service import generate_action_score
from services.clients import twilio_client, TWILIO_NUMBER

router = APIRouter()

@router.get("/trigger-morning-alert/{farmer_phone}")
async def trigger_alert(farmer_phone: str):

    pune_lat = 18.5204
    pune_lon = 73.8567
    crop = "Tomato"
    
    print(f"Fetching weather for {crop} farm at {pune_lat}, {pune_lon}...")
    weather_data = get_24h_weather_forecast(pune_lat, pune_lon)
    crop_data = CROP_SENSITIVITY_DB.get(crop)
    
    print("Generating AI Advisory...")
    ai_result = generate_action_score(weather_data, crop_data)
    
    try:
        score_line, advisory_line = ai_result.split("ADVISORY:")
        score = score_line.replace("SCORE:", "").strip()
        advisory_text = advisory_line.strip()
    except Exception:
        score = "?"
        advisory_text = ai_result
        
    msg_body = f"Morning Advisory*\n\n🎯 Action Score: {score}/10\n {advisory_text}"
    
    try:
        twilio_client.messages.create(
            from_=f"whatsapp:{TWILIO_NUMBER}",
            to=f"whatsapp:{farmer_phone}",
            body=msg_body
        )
        status = "Success"
    except Exception as e:
        status = f"Failed to send WhatsApp: {e}"

    return {
        "status": status,
        "weather": weather_data,
        "ai_output": ai_result
    }
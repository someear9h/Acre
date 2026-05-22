from fastapi import APIRouter
from services.mandi_service import get_mandi_price
from services.clients import gemini_client, twilio_client, TWILIO_NUMBER

router = APIRouter()


@router.get("/evaluate-offer/{farmer_phone}/{district}/{commodity}/{buyer_offer_price}")
async def evaluate_offer(
    farmer_phone: str,
    district: str,
    commodity: str,
    buyer_offer_price: float,
):
    """
    Evaluates a buyer's offer against the official Mandi price,
    generates a Hindi advisory via Gemini, and sends it to the farmer on WhatsApp.
    """

    # --- Step 1: Fetch real-time Mandi price ---
    mandi_data = await get_mandi_price(district, commodity)

    if "error" in mandi_data:
        return {"status": "Failed", "reason": mandi_data["error"]}

    modal_price = float(mandi_data["modal_price"])
    market_name = mandi_data["market"]
    price_difference = buyer_offer_price - modal_price

    # --- Step 2: Generate Hindi advisory via Gemini ---
    prompt = f"""You are a financial advisor for an Indian farmer.
A buyer has offered ₹{buyer_offer_price}/quintal for their {commodity}.
Today's official government Mandi price in {district} is ₹{modal_price}/quintal.
Write a 3-sentence WhatsApp message in simple Hindi. State the official price, compare it to the offer, and explicitly tell the farmer whether they should ACCEPT or NEGOTIATE the offer. Keep it highly professional."""

    try:
        print("INFO: Asking Gemini for market advisory...")
        gemini_response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        advisory_text = gemini_response.text.strip()
    except Exception as e:
        print(f"⚠️ Gemini API Unavailable ({e}). Triggering Deterministic Fallback...")
        
        # --- THE HACKATHON LLM FALLBACK ---
        # If Gemini is busy, we use pure math to generate a perfect Hindi response.
        if price_difference >= 0:
            advisory_text = (
                f"नमस्ते! {district} मंडी में {commodity} का आज का सरकारी भाव ₹{modal_price} प्रति क्विंटल है। "
                f"खरीदार ने आपको ₹{buyer_offer_price} का प्रस्ताव दिया है, जो बाज़ार भाव से ₹{abs(price_difference)} अधिक (या बराबर) है। "
                f"हमारा सुझाव: यह एक अच्छा सौदा है, कृपया इस प्रस्ताव को स्वीकार (ACCEPT) कर लें।"
            )
        else:
            advisory_text = (
                f"सावधान! {district} मंडी में {commodity} का आज का सरकारी भाव ₹{modal_price} प्रति क्विंटल है। "
                f"खरीदार का प्रस्ताव (₹{buyer_offer_price}) बाज़ार भाव से ₹{abs(price_difference)} कम है। "
                f"हमारा सुझाव: यह प्रस्ताव घाटे का है। कृपया इसे अस्वीकार करें या बेहतर भाव के लिए बातचीत (NEGOTIATE) करें।"
            )

    # --- Step 3: Send WhatsApp message via Twilio ---
    msg_body = f"🏷️ *Market Connector Alert*\n\n{advisory_text}"

    try:
        twilio_client.messages.create(
            from_=f"whatsapp:{TWILIO_NUMBER}",
            to=f"whatsapp:{farmer_phone}",
            body=msg_body,
        )
        whatsapp_status = "Sent"
    except Exception as e:
        whatsapp_status = f"Failed to send WhatsApp: {e}"

    # --- Step 4: Return summary ---
    return {
        "status": whatsapp_status,
        "commodity": commodity,
        "district": district,
        "market": market_name,
        "official_mandi_price": modal_price,
        "buyer_offer_price": buyer_offer_price,
        "price_difference": round(price_difference, 2),
        "ai_advisory": advisory_text,
    }

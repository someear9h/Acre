from fastapi import APIRouter
from services.state import ACTIVE_CONTRACTS

router = APIRouter()


@router.get("/contract-status/{farmer_phone}")
async def get_contract_status(farmer_phone: str):
    """
    Returns the current negotiation state for a given farmer's phone number.
    Used by the buyer dashboard to poll for ACCEPT / REJECT / COUNTER_OFFER updates.
    """
    if farmer_phone in ACTIVE_CONTRACTS:
        return {
            "status": "success",
            "data": ACTIVE_CONTRACTS[farmer_phone],
        }

    return {"status": "not_found"}


@router.post("/accept-counter/{farmer_phone}")
async def accept_counter(farmer_phone: str):
    """
    Triggered when the wholesaler clicks 'Accept Counter-Offer' on the React UI.
    Updates the contract state to ACCEPTED and notifies the farmer via WhatsApp.
    """
    from services.state import ACTIVE_CONTRACTS
    from services.clients import twilio_client, TWILIO_NUMBER

    # Clean the phone number string if necessary
    normalized_phone = farmer_phone.strip()

    if normalized_phone not in ACTIVE_CONTRACTS:
        return {"status": "error", "message": "No active contract found for this number."}

    contract = ACTIVE_CONTRACTS[normalized_phone]
    commodity = contract.get("commodity", "Produce")
    final_price = contract.get("counter_offer")

    # Update backend state
    contract["status"] = "ACCEPTED"

    # Construct the final confirmation message in Hindi
    msg_body = f"*Acre Deal Confirmed (सौदा पक्का हो गया!)*\n\nखरीदार ने आपके {commodity} के लिए ₹{final_price}/क्विंटल का काउंटर-ऑफर स्वीकार कर लिया है।\n\n📦 आपका डिजिटल एस्क्रो एग्रीमेंट एक्टिव हो गया है। कृपया फसल डिलीवरी की तैयारी शुरू करें।"

    try:
        twilio_client.messages.create(
            from_=f"whatsapp:{TWILIO_NUMBER}",
            to=f"whatsapp:{normalized_phone}",
            body=msg_body,
        )
        return {"status": "Success", "message": "Farmer notified of acceptance via WhatsApp."}
    except Exception as e:
        return {"status": "Failed", "reason": f"State updated to ACCEPTED, but WhatsApp failed: {e}"}
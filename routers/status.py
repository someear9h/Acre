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

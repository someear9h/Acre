# In-memory state manager for active negotiations.
# Structure:
# {
#     "farmer_phone": {
#         "status": "OFFER_SENT" | "ACCEPTED" | "REJECTED" | "COUNTER_OFFER",
#         "commodity": "...",
#         "current_offer": 800,
#         "counter_offer": None | int
#     }
# }
ACTIVE_CONTRACTS: dict[str, dict] = {}

# In-memory listing store for farmer produce listings via WhatsApp.
# Structure:
# [
#     {
#         "id": 1,
#         "farmer_phone": "+91...",
#         "district": "Unknown",
#         "commodity": "Potato",
#         "quantity": 50
#     }
# ]
ACTIVE_LISTINGS: list[dict] = []
_listing_id_counter: int = 0

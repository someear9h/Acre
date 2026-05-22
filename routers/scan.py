import os
import re
import random
import requests
import numpy as np
from io import BytesIO
from PIL import Image
from fastapi import APIRouter, Form, Response
import tensorflow as tf
from services.clients import twilio_client, gemini_client, TWILIO_NUMBER
from services.state import ACTIVE_CONTRACTS, ACTIVE_LISTINGS

router = APIRouter()

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

print("Loading local MobileNet CNN...")
try:
    cnn_model = tf.keras.models.load_model("mobilenet_best_model.h5")
    CLASS_NAMES = ['Apple Scab', 'Early Blight', 'Healthy', 'Late Blight'] 
    print("CNN Loaded Successfully.")
except Exception as e:
    print(f"Failed to load CNN: {e}")
    cnn_model = None

@router.post("/whatsapp-webhook")
async def receive_whatsapp_image(
    From: str = Form(...),
    Body: str = Form(...),
    NumMedia: int = Form(0), 
    MediaUrl0: str | None = Form(None) 
):
    print(f"\n--- New WhatsApp Message ---")
    
    if NumMedia > 0 and MediaUrl0:
        print("Downloading image from Twilio...")
        try:
            # Note: Re-fetching env vars here just for the Twilio auth tuple
            TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
            TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
            
            response = requests.get(MediaUrl0, auth=(TWILIO_SID, TWILIO_TOKEN))
            response.raise_for_status()
            
            raw_img = Image.open(BytesIO(response.content))
            
            disease_label = "Unknown"
            confidence = 0.0
            
            if cnn_model:
                try:
                    img_resized = raw_img.resize((224, 224))
                    img_array = tf.keras.preprocessing.image.img_to_array(img_resized)
                    img_array = np.expand_dims(img_array, axis=0) / 255.0
                    
                    predictions = cnn_model.predict(img_array, verbose=0)
                    predicted_class_index = np.argmax(predictions[0])
                    confidence = float(predictions[0][predicted_class_index])
                    disease_label = CLASS_NAMES[predicted_class_index]
                    
                    print(f"CNN Prediction: {disease_label} ({confidence*100:.1f}%)")
                except Exception as e:
                    print(f"CNN Error: {e}")
            
            print("Sending to Gemini...")
            prompt = f"""
            You are an expert Indian agronomist speaking to a local farmer. Analyze this crop leaf photo.
            My local diagnostic model has identified this leaf as having '{disease_label}' with {confidence*100:.1f}% confidence.
            
            Reply entirely in simple, conversational Hindi. If a scientific name lacks a common Hindi term, write it in Hindi script followed by the English term in brackets.

            Structure your response EXACTLY like this:
            1. 🔍 समस्या (Diagnosis): Verify the CNN diagnosis and identify the disease.
            2. 👁️ लक्षण (Symptoms): Briefly describe the visual evidence.
            3. 💊 उपचार (Treatment): 
               - रासायनिक (Chemical): 1-sentence standard chemical treatment.
               - जैविक/सस्ता (Organic/Low-Cost): 1-sentence local or organic alternative.
            4. YIELD_THREAT: [Output exactly one English word: LOW, MEDIUM, or CRITICAL]

            CRITICAL RULES:
            - If the image is blurry, or you disagree with the CNN and are less than 90% confident, your ENTIRE response must strictly be: "REQUIRES HUMAN REVIEW: [Explain the visual ambiguity in Hindi]".
            """

            ai_response = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[raw_img, prompt]
            )
            diagnosis = ai_response.text.strip()
            
            msg_body = f"*AgriLedger Crop Scan*\n\n{diagnosis}"
            twilio_client.messages.create(
                from_=f"whatsapp:{TWILIO_NUMBER}",
                to=From,
                body=msg_body
            )
            print("Reply sent.")
            
        except Exception as e:
            print(f"Error: {e}")
    elif NumMedia == 0 and Body:
        # --- STRUCTURED COMMAND PROTOCOL ---
        # Parse text-only replies for LIST / ACCEPT / REJECT / OFFER commands.
        text = Body.strip().upper()
        farmer_phone = From.replace("whatsapp:", "")
        print(f"Text reply from {farmer_phone}: '{text}'")

        # --- LIST COMMAND HANDLER ---
        # Format: LIST <quantity> <commodity>  (e.g. "LIST 50 POTATO")
        if text.startswith("LIST"):
            try:
                match = re.match(r'^LIST\s+(\d+)\s+(.+)$', text)
                if match:
                    quantity = int(match.group(1))
                    commodity = match.group(2).strip().capitalize()

                    listing = {
                        "id": random.randint(1000, 9999),
                        "farmer_phone": farmer_phone,
                        "district": "Demo District",
                        "commodity": commodity,
                        "quantity": quantity,
                    }
                    ACTIVE_LISTINGS.append(listing)
                    print(f"New listing created: {listing}")

                    reply = (
                        f"✅ आपकी उपज Acre लाइव मार्केट में लिस्ट कर दी गई है!\n"
                        f"(Your produce is now listed on the Acre live market!)\n\n"
                        f"📦 {commodity} — {quantity} Quintals"
                    )
                else:
                    reply = (
                        "⚠️ सही फॉर्मेट:\nLIST [मात्रा] [फसल का नाम]\n"
                        "उदा: LIST 50 POTATO"
                    )

                twilio_client.messages.create(
                    from_=f"whatsapp:{TWILIO_NUMBER}",
                    to=From,
                    body=reply
                )

            except Exception as e:
                print(f"LIST handler error: {e}")
                twilio_client.messages.create(
                    from_=f"whatsapp:{TWILIO_NUMBER}",
                    to=From,
                    body="⚠️ कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।"
                )

        # --- NEGOTIATION REPLY HANDLER ---
        # Parse text-only replies for ACCEPT / REJECT / OFFER commands.
        elif farmer_phone in ACTIVE_CONTRACTS:
            contract = ACTIVE_CONTRACTS[farmer_phone]
            print(f"Active contract found: {contract}")

            try:
                if text.startswith("ACCEPT"):
                    contract["status"] = "ACCEPTED"
                    reply = "✅ सौदा पक्का हो गया है! (Deal Confirmed!)"

                elif text.startswith("REJECT"):
                    contract["status"] = "REJECTED"
                    reply = "❌ सौदा रद्द कर दिया गया है। (Deal Cancelled)"

                elif text.startswith("OFFER"):
                    match = re.search(r'\d+', text)
                    if match:
                        counter_amount = int(match.group())
                        contract["counter_offer"] = counter_amount
                        contract["status"] = "COUNTER_OFFER"
                        reply = f"⏳ आपका नया भाव (₹{counter_amount}) खरीदार को भेज दिया गया है। (Counter-offer sent.)"
                    else:
                        reply = "⚠️ कृपया सही भाव लिखें। उदा: OFFER 850"

                else:
                    reply = (
                        "कृपया निम्न में से एक कमांड भेजें:\n"
                        "• ACCEPT\n• REJECT\n• OFFER [राशि]"
                    )

                twilio_client.messages.create(
                    from_=f"whatsapp:{TWILIO_NUMBER}",
                    to=From,
                    body=reply
                )
                print(f"Negotiation reply sent: {contract['status']}")

            except Exception as e:
                print(f"Negotiation handler error: {e}")
                twilio_client.messages.create(
                    from_=f"whatsapp:{TWILIO_NUMBER}",
                    to=From,
                    body="⚠️ कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।"
                )
        else:
            # No active contract and not a command — send default prompt
            twilio_client.messages.create(
                from_=f"whatsapp:{TWILIO_NUMBER}",
                to=From,
                body="कृपया अपनी फसल की पत्ती की एक साफ तस्वीर भेजें।"
            )
    else:
        twilio_client.messages.create(
            from_=f"whatsapp:{TWILIO_NUMBER}",
            to=From,
            body="कृपया अपनी फसल की पत्ती की एक साफ तस्वीर भेजें।"
        )

    return Response(content="<Response></Response>", media_type="application/xml")
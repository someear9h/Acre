```python
import os
import warnings
import requests
import numpy as np
from io import BytesIO
from PIL import Image
from fastapi import FastAPI, Form, Response
import uvicorn
from twilio.rest import Client
from dotenv import load_dotenv

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf

warnings.simplefilter("ignore", FutureWarning)
from google import genai

load_dotenv()

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
twilio_client = Client(TWILIO_SID, TWILIO_TOKEN)
gemini_client = genai.Client()

print("Loading local MobileNet CNN...")
try:
    cnn_model = tf.keras.models.load_model("mobilenet_best_model.h5")
    CLASS_NAMES = ['Apple Scab', 'Early Blight', 'Healthy', 'Late Blight'] 
    print("CNN Loaded Successfully.")
except Exception as e:
    print(f"Failed to load CNN: {e}")
    cnn_model = None

app = FastAPI()

@app.post("/whatsapp-webhook")
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
            
            Reply entirely in simple, conversational Hindi. If a scientific name lacks a common Hindi term, write it in Hindi script followed by the English term in brackets, e.g., "अगेती झुलसा (Early Blight)".

            Structure your response EXACTLY like this:

            1. समस्या (Diagnosis): Verify the CNN diagnosis and identify the disease.
            2. लक्षण (Symptoms): Briefly describe the visual evidence.
            3. उपचार (Treatment): 
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
    else:
        twilio_client.messages.create(
            from_=f"whatsapp:{TWILIO_NUMBER}",
            to=From,
            body="कृपया अपनी फसल की पत्ती की एक साफ तस्वीर भेजें।"
        )

    return Response(content="<Response></Response>", media_type="application/xml")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```
import os
from twilio.rest import Client
from google import genai
from dotenv import load_dotenv

load_dotenv()

TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
twilio_client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))

gemini_client = genai.Client()
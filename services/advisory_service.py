from services.clients import gemini_client

def generate_action_score(weather_data: dict, crop_data: dict):
    prompt = f"""
    You are an expert Indian agronomist. 
    Here is the weather forecast for the next 24 hours: {weather_data}
    Here is the farmer's current crop data and sensitivity rules: {crop_data}
    
    1. Calculate a 'Farming Action Score' from 1 to 10 (10 means perfect weather for farming tasks, 1 means stay indoors and protect crops).
    2. Write a 3-sentence advisory for the farmer in simple Hindi. Tell them exactly what to do today based on the weather and the crop rules.
    
    Output the response STRICTLY in this exact format:
    SCORE: [Your 1-10 Score]
    ADVISORY: [Your Hindi Text]
    """
    
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "SCORE: 0\nADVISORY: Advisory system temporarily unavailable."
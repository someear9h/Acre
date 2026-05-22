import os
import requests

def get_24h_weather_forecast(lat: float, lon: float):
    # Important: Ensure there are no spaces or quotes around the key in your .env
    api_key = os.getenv("OWM_API_KEY").strip() if os.getenv("OWM_API_KEY") else ""
    
    # We are using the completely free 2.5 Forecast API. No credit card required.
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"OpenWeatherMap API Error Status: {response.status_code}")
        print(f"Response: {response.text}")
        return {"error": "Failed to fetch weather data"}
        
    data = response.json()
    
    # The 2.5 API returns 3-hour blocks in a 'list' array. 
    # We grab the next 8 chunks (8 blocks * 3 hours = next 24 hours of data)
    next_24h = data.get('list', [])[:8]
    
    if not next_24h:
        return {"error": "No forecast data found"}
    
    # Safely extract rainfall (OWM omits the 'rain' key if it isn't raining)
    total_rain = sum(item.get('rain', {}).get('3h', 0) for item in next_24h)
    max_temp = max(item['main']['temp_max'] for item in next_24h)
    min_temp = min(item['main']['temp_min'] for item in next_24h)
    
    return {
        "total_rain_mm": round(total_rain, 2),
        "max_temp_celsius": round(max_temp, 2),
        "min_temp_celsius": round(min_temp, 2),
        "description": next_24h[0]['weather'][0]['description']
    }
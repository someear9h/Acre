def calculate_yield_revision(
    soil_moisture: float,
    temperature: float,
    disease_flag: bool,
    current_qty: float,
) -> float:
    """
    Calculates the revised yield based on IoT sensor stress factors.

    Penalties are cumulative:
    - Low soil moisture (< 30%): -10%
    - High temperature (> 35°C): -5%
    - Disease detected: -15%

    Returns the new quantity rounded to 1 decimal place.
    """
    penalty = 0.0

    if soil_moisture < 30.0:
        penalty += 0.10

    if temperature > 35.0:
        penalty += 0.05

    if disease_flag:
        penalty += 0.15

    new_qty = current_qty * (1.0 - penalty)
    return round(new_qty, 1)

import re

def validate_coordinates(lat, lng, strict_kerala=False):
    """
    Validates geographical coordinates.
    Global bounds: lat [-90, 90], lng [-180, 180]
    Kerala regional bounds: lat [8.0, 13.0], lng [74.5, 77.8]
    """
    try:
        lat = float(lat)
        lng = float(lng)
    except (TypeError, ValueError):
        return False, "Coordinates must be valid numbers"

    if not (-90.0 <= lat <= 90.0):
        return False, "Latitude must be between -90 and 90 degrees"
    if not (-180.0 <= lng <= 180.0):
        return False, "Longitude must be between -180 and 180 degrees"

    if strict_kerala:
        if not (8.0 <= lat <= 13.0 and 74.5 <= lng <= 77.8):
            return False, "Coordinates are outside the expected Kerala bounding box (Lat 8.0-13.0, Lng 74.5-77.8)"

    return True, None

def validate_time_format(time_str):
    """Checks for HH:MM format in 24-hour notation"""
    if not time_str or not isinstance(time_str, str):
        return False
    return bool(re.match(r"^([01]\d|2[0-3]):([0-5]\d)$", time_str.strip()))

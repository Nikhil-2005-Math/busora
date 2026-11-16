import math
from datetime import datetime, timedelta

def haversine_distance_km(lat1, lon1, lat2, lon2):
    """Calculates the great circle distance in kilometers between two points."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_bus_eta(bus_location, target_stop, route_stops=None, route_geometry=None, scheduled_time=None):
    """
    Calculates estimated time of arrival for a bus to a target stop.
    Returns:
    {
        "scheduled_arrival": "09:20",
        "estimated_arrival": "09:24",
        "delay_minutes": 4,
        "status": "On Time" | "Delayed" | "Early" | "Scheduled" | "Stale Tracking" | "Live GPS",
        "distance_km": 3.4,
        "eta_type": "gps" | "timetable" | "unavailable",
        "last_gps_update": "2026-10-25T09:15:00",
        "gps_freshness": "live" | "stale" | "offline"
    }
    """
    now = datetime.utcnow()
    
    # If no GPS location or target stop is missing
    if not bus_location or not target_stop:
        return {
            "scheduled_arrival": scheduled_time,
            "estimated_arrival": scheduled_time,
            "delay_minutes": 0,
            "status": "Scheduled",
            "distance_km": None,
            "eta_type": "timetable" if scheduled_time else "unavailable",
            "last_gps_update": None,
            "gps_freshness": "offline"
        }
    
    # Assess GPS freshness
    age_seconds = (now - bus_location.timestamp).total_seconds() if bus_location.timestamp else 9999
    if age_seconds > 900: # > 15 mins
        freshness = "offline"
    elif age_seconds > 300: # > 5 mins
        freshness = "stale"
    else:
        freshness = "live"

    # If offline, fallback to scheduled timetable
    if freshness == "offline":
        return {
            "scheduled_arrival": scheduled_time,
            "estimated_arrival": scheduled_time,
            "delay_minutes": 0,
            "status": "Scheduled (GPS Offline)",
            "distance_km": None,
            "eta_type": "timetable" if scheduled_time else "unavailable",
            "last_gps_update": bus_location.timestamp.isoformat() if bus_location.timestamp else None,
            "gps_freshness": freshness
        }

    # Calculate distance to stop
    # If route stops are provided and ordered, we calculate cumulative distance along remaining stops
    dist_km = 0.0
    direct_dist = haversine_distance_km(
        bus_location.latitude, bus_location.longitude,
        target_stop.latitude, target_stop.longitude
    )
    
    # Kerala traffic average speed assumption: ~32 km/h city / regional arterial road
    curr_speed = bus_location.speed_kmh if bus_location.speed_kmh and bus_location.speed_kmh > 10 else 32.0
    
    # Road tortuosity factor: Kerala roads have curves, ~1.25x straight-line distance if geometry not provided
    road_distance = round(direct_dist * 1.25, 2)
    travel_time_hours = road_distance / curr_speed
    travel_time_mins = max(1, int(round(travel_time_hours * 60)))
    
    # Calculate estimated arrival clock time
    eta_time_obj = now + timedelta(minutes=travel_time_mins)
    # Format in local time HH:MM (for display)
    eta_str = eta_time_obj.strftime("%H:%M")
    
    delay_mins = 0
    status_label = "Live GPS (On Time)"
    if scheduled_time:
        try:
            today_str = now.strftime("%Y-%m-%d")
            sched_dt = datetime.strptime(f"{today_str} {scheduled_time}", "%Y-%m-%d %H:%M")
            est_dt = datetime.strptime(f"{today_str} {eta_str}", "%Y-%m-%d %H:%M")
            diff_mins = int((est_dt - sched_dt).total_seconds() / 60)
            delay_mins = diff_mins
            if diff_mins > 5:
                status_label = f"Delayed by {diff_mins} mins"
            elif diff_mins < -2:
                status_label = "Running Early"
            else:
                status_label = "On Time"
        except Exception:
            pass

    if freshness == "stale":
        status_label = f"Stale Tracking ({status_label})"

    return {
        "scheduled_arrival": scheduled_time,
        "estimated_arrival": eta_str,
        "delay_minutes": delay_mins,
        "status": status_label,
        "distance_km": road_distance,
        "eta_type": "gps",
        "last_gps_update": bus_location.timestamp.isoformat() if bus_location.timestamp else None,
        "gps_freshness": freshness,
        "is_simulated": bus_location.is_simulated
    }

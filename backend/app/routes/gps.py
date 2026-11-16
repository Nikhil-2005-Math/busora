import json
import math
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from app.models.models import db, Bus, BusLocation, Trip, Route, AuditLog
from app.utils.auth_middleware import admin_required
from app.utils.validators import validate_coordinates

gps_bp = Blueprint("gps", __name__, url_prefix="/api/gps")

@gps_bp.route("/update", methods=["POST"])
def ingest_gps():
    """
    Ingests live GPS updates from onboard trackers or driver apps.
    Validates coordinates, bounds, speed, and heading.
    """
    data = request.get_json() or {}
    bus_id = data.get("bus_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    speed_kmh = float(data.get("speed_kmh", 0.0))
    heading_degrees = float(data.get("heading_degrees", 0.0))
    source = data.get("source", "gps_device")
    is_simulated = bool(data.get("is_simulated", False))
    timestamp_str = data.get("timestamp")

    if not bus_id or latitude is None or longitude is None:
        return jsonify({"error": "bus_id, latitude, and longitude are required"}), 400

    bus = Bus.query.get(bus_id)
    if not bus or not bus.is_active:
        return jsonify({"error": "Bus not found or inactive"}), 404

    # Validate coordinate values
    valid, err_msg = validate_coordinates(latitude, longitude, strict_kerala=False)
    if not valid:
        return jsonify({"error": f"Invalid GPS coordinates: {err_msg}"}), 400

    # Validate speed and heading
    if speed_kmh < 0 or speed_kmh > 140:
        return jsonify({"error": "Speed out of realistic bounds (0 - 140 km/h)"}), 400
    if not (0.0 <= heading_degrees <= 360.0):
        return jsonify({"error": "Heading must be between 0 and 360 degrees"}), 400

    # Parse timestamp or default to now
    if timestamp_str:
        try:
            ts = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00")).replace(tzinfo=None)
            # Reject if older than 2 hours or in the future by > 5 minutes
            now = datetime.utcnow()
            if (now - ts).total_seconds() > 7200:
                return jsonify({"error": "Stale GPS update rejected (> 2 hours old)"}), 400
            if (ts - now).total_seconds() > 300:
                return jsonify({"error": "Future timestamp rejected"}), 400
        except Exception:
            ts = datetime.utcnow()
    else:
        ts = datetime.utcnow()

    # Record location
    location = BusLocation(
        bus_id=bus.id,
        latitude=float(latitude),
        longitude=float(longitude),
        speed_kmh=speed_kmh,
        heading_degrees=heading_degrees,
        timestamp=ts,
        is_simulated=is_simulated,
        source=source
    )
    db.session.add(location)
    db.session.commit()

    return jsonify({
        "message": "GPS telemetry recorded successfully",
        "location": location.to_dict()
    }), 201

@gps_bp.route("/live", methods=["GET"])
def get_live_buses():
    """
    Returns all buses with their latest known location and freshness status.
    Categorized into: 'Reporting' (live <5m), 'Stale' (5m-15m), and 'Not Reporting' (>15m or none).
    """
    buses = Bus.query.filter_by(is_active=True).all()
    results = []

    for b in buses:
        latest = b.locations[0] if b.locations else None
        if latest:
            loc_dict = latest.to_dict()
            freshness = loc_dict["freshness_status"]
            reporting_status = "Reporting" if freshness == "live" else ("Stale" if freshness == "stale" else "Not Reporting")
        else:
            loc_dict = None
            reporting_status = "Not Reporting"

        results.append({
            "bus_id": b.id,
            "bus_name": b.name,
            "bus_number": b.bus_number,
            "registration_number": b.registration_number,
            "category": b.category,
            "operator_name": b.operator.name if b.operator else None,
            "photo_url": b.photo_url,
            "reporting_status": reporting_status,
            "location": loc_dict
        })

    return jsonify({
        "total_buses": len(buses),
        "active_reporting": sum(1 for r in results if r["reporting_status"] == "Reporting"),
        "stale_reporting": sum(1 for r in results if r["reporting_status"] == "Stale"),
        "not_reporting": sum(1 for r in results if r["reporting_status"] == "Not Reporting"),
        "buses": results
    }), 200

@gps_bp.route("/simulate-tick", methods=["POST"])
def simulate_tick():
    """
    Advances simulated demonstration buses along their route polylines.
    This gives realistic live motion for testing without physical buses!
    """
    data = request.get_json() or {}
    step_delta = float(data.get("delta", 0.0008)) # approximate ~80 meters per tick

    buses = Bus.query.filter_by(is_active=True).all()
    updated = []
    now = datetime.utcnow()

    for bus in buses:
        latest = bus.locations[0] if bus.locations else None
        if not latest or not latest.is_simulated:
            continue

        # Get the first route associated with this bus via trips
        trip = bus.trips[0] if bus.trips else None
        route = trip.route if trip else None

        if route and route.polyline_geojson:
            try:
                coords = json.loads(route.polyline_geojson)
                if len(coords) >= 2:
                    # Find closest segment in polyline
                    curr_lat = latest.latitude
                    curr_lng = latest.longitude

                    # Slight forward motion along route
                    # Move heading towards next point
                    target_idx = 1
                    target_pt = coords[min(target_idx, len(coords) - 1)]
                    d_lat = target_pt[0] - curr_lat
                    d_lng = target_pt[1] - curr_lng
                    dist = math.sqrt(d_lat**2 + d_lng**2)

                    if dist < step_delta:
                        new_lat = coords[0][0]
                        new_lng = coords[0][1]
                    else:
                        new_lat = curr_lat + (d_lat / dist) * step_delta
                        new_lng = curr_lng + (d_lng / dist) * step_delta

                    # Compute heading
                    heading = math.degrees(math.atan2(d_lng, d_lat)) % 360

                    # Add slight speed variation
                    speed = 36.0 + (bus.id % 5) * 2.5

                    new_loc = BusLocation(
                        bus_id=bus.id,
                        trip_id=trip.id if trip else None,
                        latitude=round(new_lat, 6),
                        longitude=round(new_lng, 6),
                        speed_kmh=speed,
                        heading_degrees=round(heading, 1),
                        timestamp=now,
                        is_simulated=True,
                        source="simulation"
                    )
                    db.session.add(new_loc)
                    updated.append(bus.bus_number)
            except Exception:
                pass

    db.session.commit()
    return jsonify({
        "message": f"Simulated movement tick executed for {len(updated)} buses",
        "updated_buses": updated,
        "is_simulated_mode": True
    }), 200

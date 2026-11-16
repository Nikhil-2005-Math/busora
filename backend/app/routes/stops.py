from datetime import datetime
from flask import Blueprint, request, jsonify
from app.models.models import db, BusStop, RouteStop, StopTime, Trip, Bus, BusLocation, AuditLog
from app.utils.auth_middleware import admin_required
from app.utils.validators import validate_coordinates
from app.services.eta_service import haversine_distance_km, calculate_bus_eta

stops_bp = Blueprint("stops", __name__, url_prefix="/api/stops")

@stops_bp.route("", methods=["GET"])
def list_stops():
    district = request.args.get("district")
    locality = request.args.get("locality")
    search = request.args.get("search", "").strip()
    active_only = request.args.get("active", "true").lower() == "true"

    query = BusStop.query
    if active_only:
        query = query.filter_by(is_active=True)
    if district:
        query = query.filter(BusStop.district.ilike(f"%{district}%"))
    if locality:
        query = query.filter(BusStop.locality.ilike(f"%{locality}%"))
    if search:
        query = query.filter(
            (BusStop.name.ilike(f"%{search}%")) |
            (BusStop.name_ml.ilike(f"%{search}%")) |
            (BusStop.stop_code.ilike(f"%{search}%")) |
            (BusStop.landmark.ilike(f"%{search}%"))
        )

    stops = query.order_by(BusStop.name).all()
    return jsonify({
        "total": len(stops),
        "stops": [s.to_dict() for s in stops]
    }), 200

@stops_bp.route("/<int:stop_id>", methods=["GET"])
def get_stop(stop_id):
    stop = BusStop.query.get_or_404(stop_id)
    
    # Find routes serving this stop
    route_stops = RouteStop.query.filter_by(stop_id=stop.id).all()
    routes = [rs.route.to_dict() for rs in route_stops if rs.route and rs.route.is_active]

    data = stop.to_dict()
    data["routes"] = routes
    return jsonify({"stop": data}), 200

@stops_bp.route("/<int:stop_id>/departures", methods=["GET"])
def get_stop_departures(stop_id):
    stop = BusStop.query.get_or_404(stop_id)
    
    # Query stop times for this stop
    stop_times = StopTime.query.filter_by(stop_id=stop.id).join(Trip).filter(Trip.status != "CANCELLED").all()
    
    departures = []
    for st in stop_times:
        trip = st.trip
        if not trip or not trip.bus or not trip.route or not trip.route.is_active:
            continue

        bus = trip.bus
        # Get latest bus GPS location
        latest_loc = bus.locations[0] if bus.locations else None
        
        eta_info = calculate_bus_eta(
            bus_location=latest_loc,
            target_stop=stop,
            scheduled_time=st.scheduled_departure
        )

        departures.append({
            "trip_id": trip.id,
            "trip_number": trip.trip_number,
            "bus_id": bus.id,
            "bus_name": bus.name,
            "bus_number": bus.bus_number,
            "registration_number": bus.registration_number,
            "operator_name": bus.operator.name if bus.operator else None,
            "category": bus.category,
            "photo_url": bus.photo_url,
            "route_id": trip.route_id,
            "route_name": trip.route.name,
            "route_number": trip.route.route_number,
            "origin_stop_name": trip.route.origin_stop.name if trip.route.origin_stop else None,
            "destination_stop_name": trip.route.destination_stop.name if trip.route.destination_stop else None,
            "scheduled_arrival": st.scheduled_arrival,
            "scheduled_departure": st.scheduled_departure,
            "estimated_arrival": eta_info.get("estimated_arrival"),
            "delay_minutes": eta_info.get("delay_minutes", 0),
            "status": eta_info.get("status"),
            "distance_km": eta_info.get("distance_km"),
            "eta_type": eta_info.get("eta_type"),
            "gps_freshness": eta_info.get("gps_freshness"),
            "is_simulated": eta_info.get("is_simulated", False)
        })

    # Sort by scheduled departure time
    departures.sort(key=lambda d: d["scheduled_departure"] or "99:99")

    return jsonify({
        "stop": stop.to_dict(),
        "total_departures": len(departures),
        "departures": departures
    }), 200

@stops_bp.route("/nearby", methods=["GET"])
def get_nearby_stops():
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    radius_km = float(request.args.get("radius_km", 10.0))

    if not lat or not lng:
        return jsonify({"error": "Latitude and longitude query parameters are required"}), 400

    try:
        user_lat = float(lat)
        user_lng = float(lng)
    except ValueError:
        return jsonify({"error": "Invalid lat or lng"}), 400

    stops = BusStop.query.filter_by(is_active=True).all()
    results = []
    for s in stops:
        d = haversine_distance_km(user_lat, user_lng, s.latitude, s.longitude)
        if d <= radius_km:
            s_dict = s.to_dict()
            s_dict["distance_km"] = round(d, 2)
            results.append(s_dict)

    results.sort(key=lambda x: x["distance_km"])
    return jsonify({
        "user_coordinates": {"latitude": user_lat, "longitude": user_lng},
        "radius_km": radius_km,
        "total": len(results),
        "nearby_stops": results
    }), 200

@stops_bp.route("", methods=["POST"])
@admin_required
def create_stop(admin_user):
    data = request.get_json() or {}
    stop_code = data.get("stop_code", "").strip().upper()
    name = data.get("name", "").strip()
    name_ml = data.get("name_ml", "").strip()
    district = data.get("district", "").strip()
    locality = data.get("locality", "").strip()
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    landmark = data.get("landmark", "").strip()

    if not stop_code or not name or not district or not locality or latitude is None or longitude is None:
        return jsonify({"error": "Stop code, name, district, locality, latitude, and longitude are required"}), 400

    valid, err_msg = validate_coordinates(latitude, longitude)
    if not valid:
        return jsonify({"error": err_msg}), 400

    existing = BusStop.query.filter_by(stop_code=stop_code).first()
    if existing:
        return jsonify({"error": f"Stop code {stop_code} already exists"}), 409

    stop = BusStop(
        stop_code=stop_code,
        name=name,
        name_ml=name_ml,
        district=district,
        locality=locality,
        latitude=float(latitude),
        longitude=float(longitude),
        landmark=landmark,
        is_active=True
    )
    db.session.add(stop)
    db.session.flush()

    log = AuditLog(
        user_email=admin_user.email,
        action="CREATE",
        entity_type="STOP",
        entity_id=str(stop.id),
        details=f"Created stop {stop.name} ({stop.stop_code}) in {stop.district}",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Bus stop created successfully", "stop": stop.to_dict()}), 201

@stops_bp.route("/<int:stop_id>", methods=["PUT"])
@admin_required
def update_stop(admin_user, stop_id):
    stop = BusStop.query.get_or_404(stop_id)
    data = request.get_json() or {}

    if "name" in data:
        stop.name = data["name"].strip()
    if "name_ml" in data:
        stop.name_ml = data["name_ml"].strip()
    if "district" in data:
        stop.district = data["district"].strip()
    if "locality" in data:
        stop.locality = data["locality"].strip()
    if "landmark" in data:
        stop.landmark = data["landmark"].strip()
    if "is_active" in data:
        stop.is_active = bool(data["is_active"])
    if "latitude" in data or "longitude" in data:
        lat = data.get("latitude", stop.latitude)
        lng = data.get("longitude", stop.longitude)
        valid, err_msg = validate_coordinates(lat, lng)
        if not valid:
            return jsonify({"error": err_msg}), 400
        stop.latitude = float(lat)
        stop.longitude = float(lng)

    log = AuditLog(
        user_email=admin_user.email,
        action="UPDATE",
        entity_type="STOP",
        entity_id=str(stop.id),
        details=f"Updated stop {stop.name} ({stop.stop_code})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Stop updated successfully", "stop": stop.to_dict()}), 200

@stops_bp.route("/<int:stop_id>", methods=["DELETE"])
@admin_required
def delete_stop(admin_user, stop_id):
    stop = BusStop.query.get_or_404(stop_id)
    stop.is_active = False

    log = AuditLog(
        user_email=admin_user.email,
        action="DEACTIVATE",
        entity_type="STOP",
        entity_id=str(stop.id),
        details=f"Deactivated stop {stop.name} ({stop.stop_code})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": f"Stop {stop.name} deactivated successfully"}), 200

from datetime import datetime
from flask import Blueprint, request, jsonify
from app.models.models import db, Trip, StopTime, Route, Bus, BusStop, AuditLog
from app.utils.auth_middleware import admin_required
from app.utils.validators import validate_time_format
from app.services.eta_service import calculate_bus_eta

timetables_bp = Blueprint("timetables", __name__, url_prefix="/api/timetables")

@timetables_bp.route("/search", methods=["GET"])
def search_buses():
    """
    Core Search API: Finds buses traveling from origin stop to destination stop.
    Supports origin_id, destination_id, origin_name, destination_name, and time filter.
    """
    origin_id = request.args.get("origin_id", type=int)
    dest_id = request.args.get("destination_id", type=int)
    origin_query = request.args.get("origin", "").strip()
    dest_query = request.args.get("destination", "").strip()
    after_time = request.args.get("time", "").strip() # HH:MM

    # If IDs not provided directly, resolve by query string
    if not origin_id and origin_query:
        stop = BusStop.query.filter(
            (BusStop.name.ilike(f"%{origin_query}%")) |
            (BusStop.name_ml.ilike(f"%{origin_query}%")) |
            (BusStop.locality.ilike(f"%{origin_query}%"))
        ).first()
        if stop:
            origin_id = stop.id

    if not dest_id and dest_query:
        stop = BusStop.query.filter(
            (BusStop.name.ilike(f"%{dest_query}%")) |
            (BusStop.name_ml.ilike(f"%{dest_query}%")) |
            (BusStop.locality.ilike(f"%{dest_query}%"))
        ).first()
        if stop:
            dest_id = stop.id

    if not origin_id or not dest_id:
        return jsonify({
            "error": "Both origin and destination stops must be specified",
            "results": []
        }), 400

    origin_stop = BusStop.query.get(origin_id)
    dest_stop = BusStop.query.get(dest_id)
    if not origin_stop or not dest_stop:
        return jsonify({"error": "Origin or destination stop not found", "results": []}), 404

    # Find trips that have both origin and destination stops where origin_seq < dest_seq
    st_origin = StopTime.query.filter_by(stop_id=origin_id).all()
    results = []

    for sto in st_origin:
        trip = sto.trip
        if not trip or trip.status == "CANCELLED" or not trip.bus or not trip.bus.is_active:
            continue

        # Look for matching destination in the same trip
        std = StopTime.query.filter_by(trip_id=trip.id, stop_id=dest_id).first()
        if std and sto.stop_sequence < std.stop_sequence:
            # Check departure time filter
            if after_time and sto.scheduled_departure < after_time:
                continue

            # Calculate journey duration
            try:
                t1 = datetime.strptime(sto.scheduled_departure, "%H:%M")
                t2 = datetime.strptime(std.scheduled_arrival, "%H:%M")
                duration_mins = int((t2 - t1).total_seconds() / 60)
                if duration_mins < 0:
                    duration_mins += 24 * 60
            except Exception:
                duration_mins = 0

            # Calculate ETA for the bus to reach the origin stop
            bus = trip.bus
            latest_loc = bus.locations[0] if bus.locations else None
            eta_info = calculate_bus_eta(
                bus_location=latest_loc,
                target_stop=origin_stop,
                scheduled_time=sto.scheduled_departure
            )

            results.append({
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
                "route_name": trip.route.name if trip.route else None,
                "route_number": trip.route.route_number if trip.route else None,
                "origin_stop": {
                    "id": origin_stop.id,
                    "name": origin_stop.name,
                    "name_ml": origin_stop.name_ml,
                    "district": origin_stop.district,
                    "scheduled_departure": sto.scheduled_departure,
                    "estimated_departure": eta_info.get("estimated_arrival")
                },
                "destination_stop": {
                    "id": dest_stop.id,
                    "name": dest_stop.name,
                    "name_ml": dest_stop.name_ml,
                    "district": dest_stop.district,
                    "scheduled_arrival": std.scheduled_arrival
                },
                "journey_duration_mins": duration_mins,
                "status": eta_info.get("status"),
                "delay_minutes": eta_info.get("delay_minutes", 0),
                "eta_type": eta_info.get("eta_type"),
                "gps_freshness": eta_info.get("gps_freshness"),
                "is_simulated": eta_info.get("is_simulated", False),
                "is_demo_data": True
            })

    # Sort results by scheduled departure from origin stop
    results.sort(key=lambda x: x["origin_stop"]["scheduled_departure"])

    return jsonify({
        "origin": origin_stop.to_dict(),
        "destination": dest_stop.to_dict(),
        "total_results": len(results),
        "buses": results
    }), 200

@timetables_bp.route("/trips", methods=["GET"])
def list_trips():
    route_id = request.args.get("route_id", type=int)
    bus_id = request.args.get("bus_id", type=int)

    query = Trip.query
    if route_id:
        query = query.filter_by(route_id=route_id)
    if bus_id:
        query = query.filter_by(bus_id=bus_id)

    trips = query.order_by(Trip.scheduled_start_time).all()
    return jsonify({
        "total": len(trips),
        "trips": [t.to_dict(include_stop_times=True) for t in trips]
    }), 200

@timetables_bp.route("/trips/<int:trip_id>", methods=["GET"])
def get_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    return jsonify({"trip": trip.to_dict(include_stop_times=True)}), 200

@timetables_bp.route("/trips", methods=["POST"])
@admin_required
def create_trip(admin_user):
    data = request.get_json() or {}
    trip_number = data.get("trip_number", "").strip().upper()
    route_id = data.get("route_id")
    bus_id = data.get("bus_id")
    scheduled_start_time = data.get("scheduled_start_time", "").strip()
    scheduled_end_time = data.get("scheduled_end_time", "").strip()
    direction = data.get("direction", "OUTBOUND")
    stop_times_input = data.get("stop_times", [])

    if not trip_number or not route_id or not bus_id or not scheduled_start_time or not scheduled_end_time:
        return jsonify({"error": "Trip number, route, bus, start time, and end time are required"}), 400

    if not validate_time_format(scheduled_start_time) or not validate_time_format(scheduled_end_time):
        return jsonify({"error": "Start time and end time must be in HH:MM format"}), 400

    trip = Trip(
        trip_number=trip_number,
        route_id=route_id,
        bus_id=bus_id,
        scheduled_start_time=scheduled_start_time,
        scheduled_end_time=scheduled_end_time,
        direction=direction,
        status="SCHEDULED"
    )
    db.session.add(trip)
    db.session.flush()

    for idx, st in enumerate(stop_times_input, start=1):
        stop_id = st.get("stop_id")
        arr = st.get("scheduled_arrival")
        dep = st.get("scheduled_departure")
        if stop_id and arr and dep:
            time_entry = StopTime(
                trip_id=trip.id,
                stop_id=stop_id,
                stop_sequence=st.get("stop_sequence", idx),
                scheduled_arrival=arr,
                scheduled_departure=dep,
                distance_from_start_km=float(st.get("distance_from_start_km", 0.0))
            )
            db.session.add(time_entry)

    log = AuditLog(
        user_email=admin_user.email,
        action="CREATE",
        entity_type="TIMETABLE",
        entity_id=str(trip.id),
        details=f"Created trip {trip.trip_number} with {len(stop_times_input)} stop times",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Trip timetable created successfully", "trip": trip.to_dict(include_stop_times=True)}), 201

@timetables_bp.route("/trips/<int:trip_id>", methods=["DELETE"])
@admin_required
def cancel_trip(admin_user, trip_id):
    trip = Trip.query.get_or_404(trip_id)
    trip.status = "CANCELLED"

    log = AuditLog(
        user_email=admin_user.email,
        action="CANCEL",
        entity_type="TIMETABLE",
        entity_id=str(trip.id),
        details=f"Cancelled trip {trip.trip_number}",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": f"Trip {trip.trip_number} cancelled successfully"}), 200

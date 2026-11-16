import json
from flask import Blueprint, request, jsonify
from app.models.models import db, Route, RouteStop, BusStop, AuditLog
from app.utils.auth_middleware import admin_required

routes_bp = Blueprint("routes", __name__, url_prefix="/api/routes")

@routes_bp.route("", methods=["GET"])
def list_routes():
    search = request.args.get("search", "").strip()
    active_only = request.args.get("active", "true").lower() == "true"
    include_stops = request.args.get("include_stops", "false").lower() == "true"

    query = Route.query
    if active_only:
        query = query.filter_by(is_active=True)
    if search:
        query = query.filter(
            (Route.name.ilike(f"%{search}%")) |
            (Route.name_ml.ilike(f"%{search}%")) |
            (Route.route_number.ilike(f"%{search}%"))
        )

    routes = query.order_by(Route.route_number).all()
    return jsonify({
        "total": len(routes),
        "routes": [r.to_dict(include_stops=include_stops) for r in routes]
    }), 200

@routes_bp.route("/<int:route_id>", methods=["GET"])
def get_route(route_id):
    route = Route.query.get_or_404(route_id)
    return jsonify({"route": route.to_dict(include_stops=True)}), 200

@routes_bp.route("", methods=["POST"])
@admin_required
def create_route(admin_user):
    data = request.get_json() or {}
    route_number = data.get("route_number", "").strip().upper()
    name = data.get("name", "").strip()
    name_ml = data.get("name_ml", "").strip()
    origin_stop_id = data.get("origin_stop_id")
    destination_stop_id = data.get("destination_stop_id")
    operator_id = data.get("operator_id")
    distance_km = float(data.get("distance_km", 0.0))
    estimated_duration_mins = int(data.get("estimated_duration_mins", 0))
    stop_ids = data.get("stop_ids", [])  # Ordered list of stop IDs

    if not route_number or not name or not origin_stop_id or not destination_stop_id:
        return jsonify({"error": "Route number, name, origin stop, and destination stop are required"}), 400

    # Build initial polyline from stops if available
    coords = []
    if stop_ids:
        for sid in stop_ids:
            st = BusStop.query.get(sid)
            if st:
                coords.append([st.latitude, st.longitude])

    route = Route(
        route_number=route_number,
        name=name,
        name_ml=name_ml,
        origin_stop_id=origin_stop_id,
        destination_stop_id=destination_stop_id,
        operator_id=operator_id,
        distance_km=distance_km,
        estimated_duration_mins=estimated_duration_mins,
        polyline_geojson=json.dumps(coords) if coords else None,
        is_active=True
    )
    db.session.add(route)
    db.session.flush()

    # Assign ordered stops if provided
    if stop_ids:
        seq = 1
        cum_dist = 0.0
        step_dist = distance_km / max(1, len(stop_ids) - 1)
        step_time = estimated_duration_mins / max(1, len(stop_ids) - 1)
        for sid in stop_ids:
            rs = RouteStop(
                route_id=route.id,
                stop_id=sid,
                stop_sequence=seq,
                distance_from_start_km=round(cum_dist, 1),
                travel_time_mins=int(round((seq - 1) * step_time)),
                is_mandatory=True
            )
            db.session.add(rs)
            seq += 1
            cum_dist += step_dist

    log = AuditLog(
        user_email=admin_user.email,
        action="CREATE",
        entity_type="ROUTE",
        entity_id=str(route.id),
        details=f"Created route {route.name} ({route.route_number})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Route created successfully", "route": route.to_dict(include_stops=True)}), 201

@routes_bp.route("/<int:route_id>", methods=["PUT"])
@admin_required
def update_route(admin_user, route_id):
    route = Route.query.get_or_404(route_id)
    data = request.get_json() or {}

    if "name" in data:
        route.name = data["name"].strip()
    if "name_ml" in data:
        route.name_ml = data["name_ml"].strip()
    if "route_number" in data:
        route.route_number = data["route_number"].strip().upper()
    if "distance_km" in data:
        route.distance_km = float(data["distance_km"])
    if "estimated_duration_mins" in data:
        route.estimated_duration_mins = int(data["estimated_duration_mins"])
    if "is_active" in data:
        route.is_active = bool(data["is_active"])
    if "operator_id" in data:
        route.operator_id = data["operator_id"]
    if "polyline_geojson" in data:
        route.polyline_geojson = data["polyline_geojson"]

    log = AuditLog(
        user_email=admin_user.email,
        action="UPDATE",
        entity_type="ROUTE",
        entity_id=str(route.id),
        details=f"Updated route {route.name} ({route.route_number})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Route updated successfully", "route": route.to_dict(include_stops=True)}), 200

@routes_bp.route("/<int:route_id>/stops", methods=["POST"])
@admin_required
def update_route_stops(admin_user, route_id):
    route = Route.query.get_or_404(route_id)
    data = request.get_json() or {}
    stops_input = data.get("stops", []) # list of {"stop_id": int, "stop_sequence": int, "travel_time_mins": int}

    if not isinstance(stops_input, list):
        return jsonify({"error": "Expected a list of stop definitions"}), 400

    # Clear existing route stops
    RouteStop.query.filter_by(route_id=route.id).delete()

    coords = []
    for s_info in sorted(stops_input, key=lambda x: x.get("stop_sequence", 1)):
        sid = s_info.get("stop_id")
        seq = s_info.get("stop_sequence")
        st_obj = BusStop.query.get(sid)
        if st_obj:
            coords.append([st_obj.latitude, st_obj.longitude])
            rs = RouteStop(
                route_id=route.id,
                stop_id=sid,
                stop_sequence=seq,
                distance_from_start_km=float(s_info.get("distance_from_start_km", 0.0)),
                travel_time_mins=int(s_info.get("travel_time_mins", 0)),
                is_mandatory=bool(s_info.get("is_mandatory", True))
            )
            db.session.add(rs)

    if coords:
        route.polyline_geojson = json.dumps(coords)

    log = AuditLog(
        user_email=admin_user.email,
        action="UPDATE_STOPS",
        entity_type="ROUTE",
        entity_id=str(route.id),
        details=f"Updated stop sequence for route {route.name} ({len(stops_input)} stops)",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Route stops updated successfully", "route": route.to_dict(include_stops=True)}), 200

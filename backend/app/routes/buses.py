from flask import Blueprint, request, jsonify
from app.models.models import db, Bus, Operator, AuditLog
from app.utils.auth_middleware import admin_required

buses_bp = Blueprint("buses", __name__, url_prefix="/api/buses")

@buses_bp.route("", methods=["GET"])
def list_buses():
    category = request.args.get("category")
    operator_id = request.args.get("operator_id")
    search = request.args.get("search", "").strip()
    active_only = request.args.get("active", "true").lower() == "true"

    query = Bus.query
    if active_only:
        query = query.filter_by(is_active=True)
    if category:
        query = query.filter(Bus.category.ilike(f"%{category}%"))
    if operator_id:
        query = query.filter_by(operator_id=operator_id)
    if search:
        query = query.filter(
            (Bus.name.ilike(f"%{search}%")) |
            (Bus.bus_number.ilike(f"%{search}%")) |
            (Bus.registration_number.ilike(f"%{search}%"))
        )

    buses = query.order_by(Bus.bus_number).all()
    return jsonify({
        "total": len(buses),
        "buses": [b.to_dict() for b in buses]
    }), 200

@buses_bp.route("/<int:bus_id>", methods=["GET"])
def get_bus(bus_id):
    bus = Bus.query.get_or_404(bus_id)
    return jsonify({"bus": bus.to_dict()}), 200

@buses_bp.route("", methods=["POST"])
@admin_required
def create_bus(admin_user):
    data = request.get_json() or {}
    bus_number = data.get("bus_number", "").strip().upper()
    registration_number = data.get("registration_number", "").strip().upper()
    name = data.get("name", "").strip()
    operator_id = data.get("operator_id")
    category = data.get("category", "Fast Passenger")
    seating_capacity = data.get("seating_capacity", 49)
    photo_url = data.get("photo_url", "/assets/kerala_bus.svg")
    description = data.get("description", "")

    if not bus_number or not registration_number or not name or not operator_id:
        return jsonify({"error": "Bus number, registration number, name, and operator are required"}), 400

    existing = Bus.query.filter_by(registration_number=registration_number).first()
    if existing:
        return jsonify({"error": f"Registration number {registration_number} already exists"}), 409

    bus = Bus(
        bus_number=bus_number,
        registration_number=registration_number,
        name=name,
        operator_id=operator_id,
        category=category,
        seating_capacity=seating_capacity,
        photo_url=photo_url,
        description=description,
        is_active=True
    )
    db.session.add(bus)
    db.session.flush()

    # Audit log
    log = AuditLog(
        user_email=admin_user.email,
        action="CREATE",
        entity_type="BUS",
        entity_id=str(bus.id),
        details=f"Created bus {bus.name} ({bus.registration_number})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Bus created successfully", "bus": bus.to_dict()}), 201

@buses_bp.route("/<int:bus_id>", methods=["PUT"])
@admin_required
def update_bus(admin_user, bus_id):
    bus = Bus.query.get_or_404(bus_id)
    data = request.get_json() or {}

    if "name" in data:
        bus.name = data["name"].strip()
    if "bus_number" in data:
        bus.bus_number = data["bus_number"].strip().upper()
    if "category" in data:
        bus.category = data["category"]
    if "operator_id" in data:
        bus.operator_id = data["operator_id"]
    if "seating_capacity" in data:
        bus.seating_capacity = int(data["seating_capacity"])
    if "photo_url" in data:
        bus.photo_url = data["photo_url"]
    if "description" in data:
        bus.description = data["description"]
    if "is_active" in data:
        bus.is_active = bool(data["is_active"])

    log = AuditLog(
        user_email=admin_user.email,
        action="UPDATE",
        entity_type="BUS",
        entity_id=str(bus.id),
        details=f"Updated bus {bus.name} ({bus.registration_number})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Bus updated successfully", "bus": bus.to_dict()}), 200

@buses_bp.route("/<int:bus_id>", methods=["DELETE"])
@admin_required
def deactivate_bus(admin_user, bus_id):
    bus = Bus.query.get_or_404(bus_id)
    bus.is_active = False

    log = AuditLog(
        user_email=admin_user.email,
        action="DEACTIVATE",
        entity_type="BUS",
        entity_id=str(bus.id),
        details=f"Deactivated bus {bus.name} ({bus.registration_number})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": f"Bus {bus.bus_number} deactivated successfully"}), 200

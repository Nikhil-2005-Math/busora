import csv
import io
from flask import Blueprint, request, jsonify, Response
from app.models.models import db, BusStop, Route, Trip, StopTime, Bus, AuditLog
from app.utils.auth_middleware import admin_required
from app.utils.validators import validate_coordinates, validate_time_format

data_io_bp = Blueprint("data_io", __name__, url_prefix="/api/data")

@data_io_bp.route("/template/stops", methods=["GET"])
def template_stops():
    """Generates and serves a CSV template for importing bus stops."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["stop_code", "name", "name_ml", "district", "locality", "latitude", "longitude", "landmark"])
    writer.writerow(["KLP-02", "Kallooppara Engineering College Stop", "കല്ലൂപ്പാറ എഞ്ചിനീയറിംഗ് കോളേജ് സ്റ്റോപ്പ്", "Pathanamthitta", "Mallappally", "9.3950", "76.6210", "Main Gate"])
    writer.writerow(["TVL-03", "Thiruvalla Railway Station Stop", "തിരുവല്ല റെയിൽവേ സ്റ്റേഷൻ സ്റ്റോപ്പ്", "Pathanamthitta", "Thiruvalla", "9.3880", "76.5810", "Near Platform 1 Exit"])
    
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=busora_stops_template.csv"}
    )

@data_io_bp.route("/template/timetables", methods=["GET"])
def template_timetables():
    """Generates and serves a CSV template for importing scheduled trips."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["trip_number", "route_number", "bus_registration", "stop_code", "stop_sequence", "scheduled_arrival", "scheduled_departure"])
    writer.writerow(["TRIP-DEMO-01", "R-101", "KL-03-AQ-1122", "KLP-01", "1", "08:00", "08:03"])
    writer.writerow(["TRIP-DEMO-01", "R-101", "KL-03-AQ-1122", "MLP-01", "2", "08:10", "08:12"])
    writer.writerow(["TRIP-DEMO-01", "R-101", "KL-03-AQ-1122", "TVL-01", "3", "08:35", "08:35"])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=busora_timetables_template.csv"}
    )

@data_io_bp.route("/import/stops", methods=["POST"])
@admin_required
def import_stops(admin_user):
    """
    Imports bus stops from an uploaded CSV file.
    Validates mandatory fields and coordinates.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded in form-data field 'file'"}), 400

    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are accepted"}), 400

    stream = io.StringIO(file.stream.read().decode("utf-8-sig"), newline=None)
    reader = csv.DictReader(stream)

    success_count = 0
    errors = []

    for idx, row in enumerate(reader, start=2): # Line 2 is first data row
        code = row.get("stop_code", "").strip().upper()
        name = row.get("name", "").strip()
        name_ml = row.get("name_ml", "").strip()
        district = row.get("district", "").strip()
        locality = row.get("locality", "").strip()
        lat_raw = row.get("latitude", "").strip()
        lng_raw = row.get("longitude", "").strip()
        landmark = row.get("landmark", "").strip()

        if not code or not name or not district or not locality or not lat_raw or not lng_raw:
            errors.append(f"Row {idx}: Missing mandatory fields (stop_code, name, district, locality, lat, lng)")
            continue

        valid, err_msg = validate_coordinates(lat_raw, lng_raw)
        if not valid:
            errors.append(f"Row {idx}: {err_msg}")
            continue

        existing = BusStop.query.filter_by(stop_code=code).first()
        if existing:
            # Update existing
            existing.name = name
            existing.name_ml = name_ml
            existing.district = district
            existing.locality = locality
            existing.latitude = float(lat_raw)
            existing.longitude = float(lng_raw)
            existing.landmark = landmark
        else:
            # Create new
            stop = BusStop(
                stop_code=code,
                name=name,
                name_ml=name_ml,
                district=district,
                locality=locality,
                latitude=float(lat_raw),
                longitude=float(lng_raw),
                landmark=landmark,
                is_active=True
            )
            db.session.add(stop)
        success_count += 1

    if success_count > 0:
        log = AuditLog(
            user_email=admin_user.email,
            action="CSV_IMPORT",
            entity_type="STOPS",
            entity_id=f"{success_count}_stops",
            details=f"Imported {success_count} bus stops via CSV. {len(errors)} errors.",
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()

    return jsonify({
        "message": f"Processed {success_count} stops successfully",
        "imported_count": success_count,
        "errors_count": len(errors),
        "errors": errors
    }), 200

@data_io_bp.route("/import/timetables", methods=["POST"])
@admin_required
def import_timetables(admin_user):
    """
    Imports trip stop times from a CSV file.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded in form-data field 'file'"}), 400

    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are accepted"}), 400

    stream = io.StringIO(file.stream.read().decode("utf-8-sig"), newline=None)
    reader = csv.DictReader(stream)

    success_count = 0
    errors = []

    for idx, row in enumerate(reader, start=2):
        trip_num = row.get("trip_number", "").strip().upper()
        route_num = row.get("route_number", "").strip().upper()
        bus_reg = row.get("bus_registration", "").strip().upper()
        stop_code = row.get("stop_code", "").strip().upper()
        seq_raw = row.get("stop_sequence", "1").strip()
        arr = row.get("scheduled_arrival", "").strip()
        dep = row.get("scheduled_departure", "").strip()

        if not trip_num or not route_num or not stop_code or not arr or not dep:
            errors.append(f"Row {idx}: Missing required columns")
            continue

        if not validate_time_format(arr) or not validate_time_format(dep):
            errors.append(f"Row {idx}: Times must be in HH:MM format")
            continue

        route = Route.query.filter_by(route_number=route_num).first()
        if not route:
            errors.append(f"Row {idx}: Route {route_num} not found")
            continue

        stop = BusStop.query.filter_by(stop_code=stop_code).first()
        if not stop:
            errors.append(f"Row {idx}: Stop {stop_code} not found")
            continue

        bus = Bus.query.filter_by(registration_number=bus_reg).first() if bus_reg else Bus.query.first()
        if not bus:
            errors.append(f"Row {idx}: Bus {bus_reg} not found")
            continue

        # Find or create Trip
        trip = Trip.query.filter_by(trip_number=trip_num).first()
        if not trip:
            trip = Trip(
                trip_number=trip_num,
                route_id=route.id,
                bus_id=bus.id,
                scheduled_start_time=arr,
                scheduled_end_time=dep,
                status="SCHEDULED"
            )
            db.session.add(trip)
            db.session.flush()

        seq = int(seq_raw) if seq_raw.isdigit() else 1
        st_entry = StopTime.query.filter_by(trip_id=trip.id, stop_sequence=seq).first()
        if st_entry:
            st_entry.stop_id = stop.id
            st_entry.scheduled_arrival = arr
            st_entry.scheduled_departure = dep
        else:
            st_entry = StopTime(
                trip_id=trip.id,
                stop_id=stop.id,
                stop_sequence=seq,
                scheduled_arrival=arr,
                scheduled_departure=dep
            )
            db.session.add(st_entry)

        success_count += 1

    if success_count > 0:
        log = AuditLog(
            user_email=admin_user.email,
            action="CSV_IMPORT",
            entity_type="TIMETABLE",
            entity_id=f"{success_count}_entries",
            details=f"Imported {success_count} timetable entries via CSV.",
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()

    return jsonify({
        "message": f"Processed {success_count} timetable entries",
        "imported_count": success_count,
        "errors_count": len(errors),
        "errors": errors
    }), 200

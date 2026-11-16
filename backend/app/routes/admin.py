from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from app.models.models import db, Bus, Route, BusStop, Trip, BusLocation, AuditLog, Operator
from app.utils.auth_middleware import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/overview", methods=["GET"])
@admin_required
def get_overview(admin_user):
    now = datetime.utcnow()
    stale_cut = now - timedelta(minutes=5)
    offline_cut = now - timedelta(minutes=15)

    total_buses = Bus.query.count()
    active_buses = Bus.query.filter_by(is_active=True).count()
    total_routes = Route.query.count()
    active_routes = Route.query.filter_by(is_active=True).count()
    total_stops = BusStop.query.count()
    active_stops = BusStop.query.filter_by(is_active=True).count()
    total_trips = Trip.query.count()
    active_trips = Trip.query.filter(Trip.status != "CANCELLED").count()

    # Reporting status breakdown
    buses = Bus.query.all()
    reporting_live = 0
    reporting_stale = 0
    reporting_offline = 0

    for b in buses:
        if b.locations:
            latest = b.locations[0]
            if latest.timestamp and latest.timestamp >= stale_cut:
                reporting_live += 1
            elif latest.timestamp and latest.timestamp >= offline_cut:
                reporting_stale += 1
            else:
                reporting_offline += 1
        else:
            reporting_offline += 1

    # Operator breakdown
    operators = Operator.query.all()
    op_breakdown = []
    for op in operators:
        op_breakdown.append({
            "name": op.name,
            "code": op.code,
            "buses_count": len(op.buses),
            "is_government": op.is_government
        })

    # Recent Audit Logs
    recent_logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(15).all()

    return jsonify({
        "metrics": {
            "total_buses": total_buses,
            "active_buses": active_buses,
            "total_routes": total_routes,
            "active_routes": active_routes,
            "total_stops": total_stops,
            "active_stops": active_stops,
            "total_trips": total_trips,
            "active_trips": active_trips,
            "reporting_live": reporting_live,
            "reporting_stale": reporting_stale,
            "reporting_offline": reporting_offline
        },
        "operators": op_breakdown,
        "recent_activity": [log.to_dict() for log in recent_logs]
    }), 200

@admin_bp.route("/audit-logs", methods=["GET"])
@admin_required
def get_audit_logs(admin_user):
    limit = min(100, int(request.args.get("limit", 50)))
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return jsonify({
        "total": len(logs),
        "audit_logs": [l.to_dict() for l in logs]
    }), 200

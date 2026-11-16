from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default="user", nullable=False)  # 'admin', 'operator', 'user'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Operator(db.Model):
    __tablename__ = "operators"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    code = db.Column(db.String(30), unique=True, nullable=False)  # e.g., 'KSRTC', 'PVT-PATHANAMTHITTA'
    contact_number = db.Column(db.String(30), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    is_government = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    buses = db.relationship("Bus", backref="operator", lazy=True)
    routes = db.relationship("Route", backref="operator", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "contact_number": self.contact_number,
            "email": self.email,
            "address": self.address,
            "is_government": self.is_government,
            "is_active": self.is_active
        }


class Bus(db.Model):
    __tablename__ = "buses"
    
    id = db.Column(db.Integer, primary_key=True)
    bus_number = db.Column(db.String(50), nullable=False, index=True) # Fleet number e.g. "RT-204"
    registration_number = db.Column(db.String(50), unique=True, nullable=False, index=True) # e.g. "KL-15-A-4521"
    name = db.Column(db.String(120), nullable=False) # e.g. "Blue Express", "Minnal Super Deluxe"
    operator_id = db.Column(db.Integer, db.ForeignKey("operators.id"), nullable=False)
    category = db.Column(db.String(50), nullable=False, default="Fast Passenger") # Fast Passenger, Super Fast, Swift, Ordinary, Low Floor AC
    seating_capacity = db.Column(db.Integer, default=49)
    photo_url = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    trips = db.relationship("Trip", backref="bus", lazy=True)
    locations = db.relationship("BusLocation", backref="bus", lazy=True, order_by="desc(BusLocation.timestamp)")

    def to_dict(self):
        last_location = self.locations[0].to_dict() if self.locations else None
        return {
            "id": self.id,
            "bus_number": self.bus_number,
            "registration_number": self.registration_number,
            "name": self.name,
            "operator_id": self.operator_id,
            "operator_name": self.operator.name if self.operator else None,
            "category": self.category,
            "seating_capacity": self.seating_capacity,
            "photo_url": self.photo_url,
            "is_active": self.is_active,
            "description": self.description,
            "last_location": last_location
        }


class BusStop(db.Model):
    __tablename__ = "bus_stops"
    
    id = db.Column(db.Integer, primary_key=True)
    stop_code = db.Column(db.String(50), unique=True, nullable=False, index=True) # e.g. "KLP-001"
    name = db.Column(db.String(120), nullable=False, index=True) # "Kallooppara Junction"
    name_ml = db.Column(db.String(150), nullable=True) # "കല്ലൂപ്പാറ ജംഗ്ഷൻ"
    district = db.Column(db.String(80), nullable=False, index=True) # "Pathanamthitta"
    locality = db.Column(db.String(120), nullable=False) # "Mallappally"
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    landmark = db.Column(db.String(200), nullable=True) # "Near Engineering College"
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    route_stops = db.relationship("RouteStop", backref="stop", lazy=True)
    stop_times = db.relationship("StopTime", backref="stop", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "stop_code": self.stop_code,
            "name": self.name,
            "name_ml": self.name_ml,
            "district": self.district,
            "locality": self.locality,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "landmark": self.landmark,
            "is_active": self.is_active
        }


class Route(db.Model):
    __tablename__ = "routes"
    
    id = db.Column(db.Integer, primary_key=True)
    route_number = db.Column(db.String(50), nullable=False, index=True) # "KL-TV-01"
    name = db.Column(db.String(150), nullable=False) # "Kallooppara — Thiruvalla"
    name_ml = db.Column(db.String(200), nullable=True) # "കല്ലൂപ്പാറ — തിരുവല്ല"
    origin_stop_id = db.Column(db.Integer, db.ForeignKey("bus_stops.id"), nullable=False)
    destination_stop_id = db.Column(db.Integer, db.ForeignKey("bus_stops.id"), nullable=False)
    operator_id = db.Column(db.Integer, db.ForeignKey("operators.id"), nullable=True)
    distance_km = db.Column(db.Float, default=0.0)
    estimated_duration_mins = db.Column(db.Integer, default=0)
    polyline_geojson = db.Column(db.Text, nullable=True) # JSON array of [lat, lng] coordinates
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    origin_stop = db.relationship("BusStop", foreign_keys=[origin_stop_id])
    destination_stop = db.relationship("BusStop", foreign_keys=[destination_stop_id])
    route_stops = db.relationship("RouteStop", backref="route", lazy=True, order_by="RouteStop.stop_sequence")
    trips = db.relationship("Trip", backref="route", lazy=True)

    def to_dict(self, include_stops=False):
        data = {
            "id": self.id,
            "route_number": self.route_number,
            "name": self.name,
            "name_ml": self.name_ml,
            "origin_stop_id": self.origin_stop_id,
            "origin_stop_name": self.origin_stop.name if self.origin_stop else None,
            "destination_stop_id": self.destination_stop_id,
            "destination_stop_name": self.destination_stop.name if self.destination_stop else None,
            "operator_id": self.operator_id,
            "operator_name": self.operator.name if self.operator else None,
            "distance_km": self.distance_km,
            "estimated_duration_mins": self.estimated_duration_mins,
            "polyline_geojson": self.polyline_geojson,
            "is_active": self.is_active,
            "total_stops": len(self.route_stops)
        }
        if include_stops:
            data["stops"] = [rs.to_dict() for rs in self.route_stops]
        return data


class RouteStop(db.Model):
    __tablename__ = "route_stops"
    __table_args__ = (
        db.UniqueConstraint("route_id", "stop_sequence", name="uq_route_sequence"),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey("routes.id"), nullable=False)
    stop_id = db.Column(db.Integer, db.ForeignKey("bus_stops.id"), nullable=False)
    stop_sequence = db.Column(db.Integer, nullable=False)
    distance_from_start_km = db.Column(db.Float, default=0.0)
    travel_time_mins = db.Column(db.Integer, default=0)
    is_mandatory = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "route_id": self.route_id,
            "stop_id": self.stop_id,
            "stop_sequence": self.stop_sequence,
            "stop_name": self.stop.name if self.stop else None,
            "stop_name_ml": self.stop.name_ml if self.stop else None,
            "district": self.stop.district if self.stop else None,
            "latitude": self.stop.latitude if self.stop else None,
            "longitude": self.stop.longitude if self.stop else None,
            "distance_from_start_km": self.distance_from_start_km,
            "travel_time_mins": self.travel_time_mins,
            "is_mandatory": self.is_mandatory
        }


class ServiceCalendar(db.Model):
    __tablename__ = "service_calendars"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) # e.g. "All Days Daily", "Mon-Sat Peak"
    monday = db.Column(db.Boolean, default=True)
    tuesday = db.Column(db.Boolean, default=True)
    wednesday = db.Column(db.Boolean, default=True)
    thursday = db.Column(db.Boolean, default=True)
    friday = db.Column(db.Boolean, default=True)
    saturday = db.Column(db.Boolean, default=True)
    sunday = db.Column(db.Boolean, default=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)

    trips = db.relationship("Trip", backref="calendar", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "monday": self.monday,
            "tuesday": self.tuesday,
            "wednesday": self.wednesday,
            "thursday": self.thursday,
            "friday": self.friday,
            "saturday": self.saturday,
            "sunday": self.sunday,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None
        }


class Trip(db.Model):
    __tablename__ = "trips"
    
    id = db.Column(db.Integer, primary_key=True)
    trip_number = db.Column(db.String(50), nullable=False, index=True) # e.g. "TRIP-KLP-0920"
    route_id = db.Column(db.Integer, db.ForeignKey("routes.id"), nullable=False)
    bus_id = db.Column(db.Integer, db.ForeignKey("buses.id"), nullable=False)
    calendar_id = db.Column(db.Integer, db.ForeignKey("service_calendars.id"), nullable=True)
    direction = db.Column(db.String(20), default="OUTBOUND") # OUTBOUND / INBOUND
    scheduled_start_time = db.Column(db.String(10), nullable=False) # "09:20"
    scheduled_end_time = db.Column(db.String(10), nullable=False) # "09:55"
    status = db.Column(db.String(30), default="SCHEDULED") # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    stop_times = db.relationship("StopTime", backref="trip", lazy=True, order_by="StopTime.stop_sequence", cascade="all, delete-orphan")
    locations = db.relationship("BusLocation", backref="trip", lazy=True)

    def to_dict(self, include_stop_times=False):
        data = {
            "id": self.id,
            "trip_number": self.trip_number,
            "route_id": self.route_id,
            "route_name": self.route.name if self.route else None,
            "bus_id": self.bus_id,
            "bus_name": self.bus.name if self.bus else None,
            "bus_number": self.bus.bus_number if self.bus else None,
            "registration_number": self.bus.registration_number if self.bus else None,
            "operator_name": self.bus.operator.name if self.bus and self.bus.operator else None,
            "category": self.bus.category if self.bus else None,
            "photo_url": self.bus.photo_url if self.bus else None,
            "calendar_id": self.calendar_id,
            "direction": self.direction,
            "scheduled_start_time": self.scheduled_start_time,
            "scheduled_end_time": self.scheduled_end_time,
            "status": self.status
        }
        if include_stop_times:
            data["stop_times"] = [st.to_dict() for st in self.stop_times]
        return data


class StopTime(db.Model):
    __tablename__ = "stop_times"
    __table_args__ = (
        db.UniqueConstraint("trip_id", "stop_sequence", name="uq_trip_stop_sequence"),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    stop_id = db.Column(db.Integer, db.ForeignKey("bus_stops.id"), nullable=False)
    stop_sequence = db.Column(db.Integer, nullable=False)
    scheduled_arrival = db.Column(db.String(10), nullable=False) # "09:20"
    scheduled_departure = db.Column(db.String(10), nullable=False) # "09:23"
    distance_from_start_km = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "trip_id": self.trip_id,
            "stop_id": self.stop_id,
            "stop_name": self.stop.name if self.stop else None,
            "stop_name_ml": self.stop.name_ml if self.stop else None,
            "stop_sequence": self.stop_sequence,
            "scheduled_arrival": self.scheduled_arrival,
            "scheduled_departure": self.scheduled_departure,
            "distance_from_start_km": self.distance_from_start_km,
            "latitude": self.stop.latitude if self.stop else None,
            "longitude": self.stop.longitude if self.stop else None
        }


class BusLocation(db.Model):
    __tablename__ = "bus_locations"
    
    id = db.Column(db.Integer, primary_key=True)
    bus_id = db.Column(db.Integer, db.ForeignKey("buses.id"), nullable=False, index=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=True, index=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    speed_kmh = db.Column(db.Float, default=0.0)
    heading_degrees = db.Column(db.Float, default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    is_simulated = db.Column(db.Boolean, default=False)
    source = db.Column(db.String(50), default="gps_device") # 'gps_device', 'simulation', 'driver_app'

    def to_dict(self):
        now = datetime.utcnow()
        age_seconds = (now - self.timestamp).total_seconds() if self.timestamp else 9999
        status = "live"
        if age_seconds > 900: # 15 minutes
            status = "offline"
        elif age_seconds > 300: # 5 minutes
            status = "stale"

        return {
            "id": self.id,
            "bus_id": self.bus_id,
            "trip_id": self.trip_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "speed_kmh": self.speed_kmh,
            "heading_degrees": self.heading_degrees,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "age_seconds": round(age_seconds, 1),
            "is_simulated": self.is_simulated,
            "source": self.source,
            "freshness_status": status
        }


class Favourite(db.Model):
    __tablename__ = "favourites"
    
    id = db.Column(db.Integer, primary_key=True)
    user_identifier = db.Column(db.String(100), nullable=False, index=True) # User ID or anonymous device ID
    item_type = db.Column(db.String(20), nullable=False) # 'route', 'stop', 'bus'
    item_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_identifier": self.user_identifier,
            "item_type": self.item_type,
            "item_id": self.item_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class AuditLog(db.Model):
    __tablename__ = "audit_logs"
    
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    action = db.Column(db.String(50), nullable=False) # 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'IMPORT'
    entity_type = db.Column(db.String(50), nullable=False) # 'BUS', 'STOP', 'ROUTE', 'TIMETABLE'
    entity_id = db.Column(db.String(50), nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "action": self.action,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "details": self.details,
            "ip_address": self.ip_address,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

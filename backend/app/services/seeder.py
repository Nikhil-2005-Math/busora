import json
from datetime import datetime
from app.models.models import (
    db, User, Operator, Bus, BusStop, Route, RouteStop, 
    Trip, StopTime, BusLocation, ServiceCalendar, AuditLog
)

def seed_database(force=False):
    """Populates the database with initial authentic Kerala transit data."""
    if not force and User.query.filter_by(role="admin").first():
        print("Database already seeded. Skipping.")
        return

    print("Seeding BUSORA Kerala demonstration database...")

    # 1. Admin User
    admin = User.query.filter_by(email="admin@busora.kerala.gov.in").first()
    if not admin:
        admin = User(
            email="admin@busora.kerala.gov.in",
            full_name="Kerala Transit Administrator",
            role="admin",
            is_active=True
        )
        admin.set_password("Admin@Busora2026")
        db.session.add(admin)

    # 2. Operators
    ops = [
        Operator(name="Kerala State Road Transport Corporation", code="KSRTC", contact_number="+91 471 2463799", email="contact@keralartc.com", address="Transport Bhavan, Fort, Thiruvananthapuram", is_government=True),
        Operator(name="KSRTC-SWIFT Limited", code="SWIFT", contact_number="+91 471 2463799", email="swift@keralartc.com", address="Anayara, Thiruvananthapuram", is_government=True),
        Operator(name="St. Mary's Transports", code="SM-TRAV", contact_number="+91 94471 23456", email="stmarys.buses@gmail.com", address="Private Bus Stand, Thiruvalla", is_government=False),
        Operator(name="Blue Express Lines", code="BX-KRLA", contact_number="+91 98470 65432", email="blueexpress.kerala@gmail.com", address="Kallooppara, Pathanamthitta", is_government=False)
    ]
    db.session.add_all(ops)
    db.session.flush()

    op_ksrtc = ops[0]
    op_swift = ops[1]
    op_stmary = ops[2]
    op_blue = ops[3]

    # 3. Bus Stops (Real Kerala Coordinates)
    stops_data = [
        # Pathanamthitta & Kottayam area
        {"code": "KLP-01", "name": "Kallooppara Junction", "name_ml": "കല്ലൂപ്പാറ ജംഗ്ഷൻ", "district": "Pathanamthitta", "locality": "Mallappally Taluk", "lat": 9.3905, "lng": 76.6183, "landmark": "Near Kallooppara Devi Temple Road"},
        {"code": "MLP-01", "name": "Mallappally Central Bus Stand", "name_ml": "മല്ലപ്പള്ളി സെൻട്രൽ ബസ് സ്റ്റാൻഡ്", "district": "Pathanamthitta", "locality": "Mallappally", "lat": 9.4478, "lng": 76.6496, "landmark": "Near Mallappally Market"},
        {"code": "NDP-01", "name": "Nedumpuram Junction", "name_ml": "നെടുംപുറം ജംഗ്ഷൻ", "district": "Pathanamthitta", "locality": "Nedumpuram", "lat": 9.3820, "lng": 76.5980, "landmark": "Nedumpuram Panchayat Office"},
        {"code": "TVL-01", "name": "Thiruvalla KSRTC Bus Station", "name_ml": "തിരുവല്ല കെ.എസ്.ആർ.ടി.സി ബസ് സ്റ്റേഷൻ", "district": "Pathanamthitta", "locality": "Thiruvalla", "lat": 9.3850, "lng": 76.5745, "landmark": "MC Road, Thiruvalla"},
        {"code": "TVL-02", "name": "Thiruvalla Private Bus Stand", "name_ml": "തിരുവല്ല പ്രൈവറ്റ് ബസ് സ്റ്റാൻഡ്", "district": "Pathanamthitta", "locality": "Thiruvalla Town", "lat": 9.3831, "lng": 76.5750, "landmark": "Near Pushpagiri Medical College Junction"},
        {"code": "PRN-01", "name": "Perunna Junction", "name_ml": "പെരുന്ന ജംഗ്ഷൻ", "district": "Kottayam", "locality": "Changanassery", "lat": 9.4385, "lng": 76.5412, "landmark": "NSS Head Office Road"},
        {"code": "CHG-01", "name": "Changanassery KSRTC Bus Station", "name_ml": "ചങ്ങനാശ്ശേരി കെ.എസ്.ആർ.ടി.സി ബസ് സ്റ്റേഷൻ", "district": "Kottayam", "locality": "Changanassery Town", "lat": 9.4442, "lng": 76.5398, "landmark": "MC Road bypass junction"},
        {"code": "CGV-01", "name": "Chingavanam Junction", "name_ml": "ചിങ്ങവനം ജംഗ്ഷൻ", "district": "Kottayam", "locality": "Chingavanam", "lat": 9.5167, "lng": 76.5333, "landmark": "Near Chingavanam Police Station"},
        {"code": "KTM-01", "name": "Kottayam KSRTC Bus Station", "name_ml": "കോട്ടയം കെ.എസ്.ആർ.ടി.സി ബസ് സ്റ്റാൻഡ്", "district": "Kottayam", "locality": "Kottayam Central", "lat": 9.5886, "lng": 76.5222, "landmark": "Near TB Road, Kottayam"},
        {"code": "KTM-02", "name": "Nagampadam Private Bus Stand", "name_ml": "നാഗമ്പടം പ്രൈവറ്റ് ബസ് സ്റ്റാൻഡ്", "district": "Kottayam", "locality": "Nagampadam", "lat": 9.5960, "lng": 76.5290, "landmark": "Opposite Nehru Stadium"},

        # Ernakulam & Thrissur area
        {"code": "COK-01", "name": "Vyttila Mobility Hub", "name_ml": "വൈറ്റില മൊബിലിറ്റി ഹബ്ബ്", "district": "Ernakulam", "locality": "Kochi", "lat": 9.9676, "lng": 76.3204, "landmark": "National Highway 66 / Kaniyampuzha"},
        {"code": "EDP-01", "name": "Edappally Toll Junction", "name_ml": "ഇടപ്പള്ളി ടോൾ ജംഗ്ഷൻ", "district": "Ernakulam", "locality": "Edappally", "lat": 10.0238, "lng": 76.3094, "landmark": "Near LuLu Mall Entrance"},
        {"code": "ALV-01", "name": "Aluva KSRTC Bus Station", "name_ml": "ആലുവ കെ.എസ്.ആർ.ടി.സി ബസ് സ്റ്റാൻഡ്", "district": "Ernakulam", "locality": "Aluva", "lat": 10.1105, "lng": 76.3533, "landmark": "Near Periyar River Bridge & Metro Terminal"},
        {"code": "AGM-01", "name": "Angamaly KSRTC Bus Station", "name_ml": "അങ്കമാലി കെ.എസ്.ആർ.ടി.സി ബസ് സ്റ്റാൻഡ്", "district": "Ernakulam", "locality": "Angamaly", "lat": 10.1960, "lng": 76.3860, "landmark": "NH 544 Junction"},
        {"code": "CKD-01", "name": "Chalakudy Municipal Bus Stand", "name_ml": "ചാലക്കുടി മുനിസിപ്പൽ ബസ് സ്റ്റാൻഡ്", "district": "Thrissur", "locality": "Chalakudy", "lat": 10.3060, "lng": 76.3330, "landmark": "Chalakudy Main Market"},
        {"code": "TCR-01", "name": "Thrissur Sakthan Thampuran Stand", "name_ml": "തൃശ്ശൂർ ശക്തൻ തമ്പുരാൻ ബസ് സ്റ്റാൻഡ്", "district": "Thrissur", "locality": "Thrissur Central", "lat": 10.5186, "lng": 76.2166, "landmark": "Sakthan Nagar, Round South"},
        {"code": "TCR-02", "name": "Thrissur KSRTC Bus Station", "name_ml": "തൃശ്ശൂർ കെ.എസ്.ആർ.ടി.സി ബസ് സ്റ്റാൻഡ്", "district": "Thrissur", "locality": "Thrissur Railway Station Road", "lat": 10.5170, "lng": 76.2120, "landmark": "Opposite Thrissur Railway Station"}
    ]

    stop_objs = {}
    for s in stops_data:
        stop = BusStop(
            stop_code=s["code"],
            name=s["name"],
            name_ml=s["name_ml"],
            district=s["district"],
            locality=s["locality"],
            latitude=s["lat"],
            longitude=s["lng"],
            landmark=s["landmark"],
            is_active=True
        )
        db.session.add(stop)
        stop_objs[s["code"]] = stop

    db.session.flush()

    # 4. Buses
    buses_data = [
        {"bus_number": "BX-101", "reg": "KL-03-AQ-1122", "name": "Blue Express", "operator_id": op_blue.id, "category": "Ordinary", "capacity": 42, "photo": "/assets/kerala_bus.svg", "desc": "Local stage carriage running Kallooppara - Thiruvalla sector."},
        {"bus_number": "FP-402", "reg": "KL-15-A-4020", "name": "KSRTC Fast Passenger", "operator_id": op_ksrtc.id, "category": "Fast Passenger", "capacity": 49, "photo": "/assets/kerala_bus.svg", "desc": "Red-and-Yellow liveried Fast Passenger connecting MC Road hubs."},
        {"bus_number": "SW-108", "reg": "KL-15-X-9942", "name": "SWIFT Gajaraj AC", "operator_id": op_swift.id, "category": "Swift Deluxe", "capacity": 45, "photo": "/assets/kerala_bus.svg", "desc": "KSRTC-SWIFT premium air-conditioned low-floor service."},
        {"bus_number": "SM-205", "reg": "KL-04-V-8899", "name": "St. Mary's Super Service", "operator_id": op_stmary.id, "category": "Fast Passenger", "capacity": 48, "photo": "/assets/kerala_bus.svg", "desc": "Frequent inter-district private express service."},
        {"bus_number": "MN-707", "reg": "KL-27-B-7711", "name": "Minnal Lightning Express", "operator_id": op_ksrtc.id, "category": "Super Fast", "capacity": 44, "photo": "/assets/kerala_bus.svg", "desc": "Direct limited stop service between major regional terminals."},
        {"bus_number": "LF-501", "reg": "KL-07-CD-3322", "name": "Kochi Metro Feeder", "operator_id": op_ksrtc.id, "category": "Low Floor AC", "capacity": 38, "photo": "/assets/kerala_bus.svg", "desc": "Urban low floor AC feeder serving Kochi - Thrissur corridor."}
    ]

    bus_objs = {}
    for b in buses_data:
        bus = Bus(
            bus_number=b["bus_number"],
            registration_number=b["reg"],
            name=b["name"],
            operator_id=b["operator_id"],
            category=b["category"],
            seating_capacity=b["capacity"],
            photo_url=b["photo"],
            description=b["desc"],
            is_active=True
        )
        db.session.add(bus)
        bus_objs[b["bus_number"]] = bus

    db.session.flush()

    # 5. Service Calendars
    cal_daily = ServiceCalendar(name="Daily Service (All 7 Days)", monday=True, tuesday=True, wednesday=True, thursday=True, friday=True, saturday=True, sunday=True)
    cal_weekdays = ServiceCalendar(name="Monday to Saturday Peak", monday=True, tuesday=True, wednesday=True, thursday=True, friday=True, saturday=True, sunday=False)
    db.session.add_all([cal_daily, cal_weekdays])
    db.session.flush()

    # 6. Routes & Route Stops
    routes_def = [
        {
            "num": "R-101",
            "name": "Kallooppara — Thiruvalla",
            "name_ml": "കല്ലൂപ്പാറ — തിരുവല്ല",
            "origin": "KLP-01",
            "dest": "TVL-01",
            "op": op_blue.id,
            "dist": 14.5,
            "dur": 35,
            "stops": ["KLP-01", "MLP-01", "NDP-01", "TVL-02", "TVL-01"]
        },
        {
            "num": "R-102",
            "name": "Thiruvalla — Changanassery",
            "name_ml": "തിരുവല്ല — ചങ്ങനാശ്ശേരി",
            "origin": "TVL-01",
            "dest": "CHG-01",
            "op": op_ksrtc.id,
            "dist": 9.2,
            "dur": 22,
            "stops": ["TVL-01", "TVL-02", "PRN-01", "CHG-01"]
        },
        {
            "num": "R-103",
            "name": "Kottayam — Thiruvalla",
            "name_ml": "കോട്ടയം — തിരുവല്ല",
            "origin": "KTM-01",
            "dest": "TVL-01",
            "op": op_ksrtc.id,
            "dist": 28.0,
            "dur": 55,
            "stops": ["KTM-01", "KTM-02", "CGV-01", "CHG-01", "PRN-01", "TVL-01"]
        },
        {
            "num": "R-104",
            "name": "Kochi (Vyttila) — Thrissur (Sakthan)",
            "name_ml": "കൊച്ചി (വൈറ്റില) — തൃശ്ശൂർ (ശക്തൻ)",
            "origin": "COK-01",
            "dest": "TCR-01",
            "op": op_swift.id,
            "dist": 74.0,
            "dur": 110,
            "stops": ["COK-01", "EDP-01", "ALV-01", "AGM-01", "CKD-01", "TCR-02", "TCR-01"]
        }
    ]

    route_objs = {}
    for r in routes_def:
        # Build polyline JSON
        coords = []
        for scode in r["stops"]:
            st = stop_objs[scode]
            coords.append([st.latitude, st.longitude])

        route = Route(
            route_number=r["num"],
            name=r["name"],
            name_ml=r["name_ml"],
            origin_stop_id=stop_objs[r["origin"]].id,
            destination_stop_id=stop_objs[r["dest"]].id,
            operator_id=r["op"],
            distance_km=r["dist"],
            estimated_duration_mins=r["dur"],
            polyline_geojson=json.dumps(coords),
            is_active=True
        )
        db.session.add(route)
        db.session.flush()
        route_objs[r["num"]] = route

        # Add RouteStops
        seq = 1
        cum_dist = 0.0
        cum_time = 0
        step_dist = r["dist"] / max(1, len(r["stops"]) - 1)
        step_time = r["dur"] / max(1, len(r["stops"]) - 1)

        for scode in r["stops"]:
            rs = RouteStop(
                route_id=route.id,
                stop_id=stop_objs[scode].id,
                stop_sequence=seq,
                distance_from_start_km=round(cum_dist, 1),
                travel_time_mins=int(round(cum_time)),
                is_mandatory=True
            )
            db.session.add(rs)
            seq += 1
            cum_dist += step_dist
            cum_time += step_time

    db.session.flush()

    # 7. Trips and Stop Times
    trips_def = [
        # Kallooppara to Thiruvalla trips
        {
            "num": "TRIP-KLP-0920", "rnum": "R-101", "bnum": "BX-101", "start": "09:20", "end": "09:55",
            "times": [("09:20", "09:23"), ("09:29", "09:31"), ("09:39", "09:41"), ("09:48", "09:50"), ("09:55", "09:55")]
        },
        {
            "num": "TRIP-KLP-1045", "rnum": "R-101", "bnum": "SM-205", "start": "10:45", "end": "11:20",
            "times": [("10:45", "10:47"), ("10:53", "10:55"), ("11:03", "11:05"), ("11:13", "11:15"), ("11:20", "11:20")]
        },
        {
            "num": "TRIP-KLP-1400", "rnum": "R-101", "bnum": "BX-101", "start": "14:00", "end": "14:35",
            "times": [("14:00", "14:03"), ("14:09", "14:11"), ("14:19", "14:21"), ("14:28", "14:30"), ("14:35", "14:35")]
        },

        # Thiruvalla to Changanassery trips
        {
            "num": "TRIP-TVL-0940", "rnum": "R-102", "bnum": "FP-402", "start": "09:40", "end": "10:02",
            "times": [("09:40", "09:42"), ("09:45", "09:47"), ("09:54", "09:56"), ("10:02", "10:02")]
        },
        {
            "num": "TRIP-TVL-1115", "rnum": "R-102", "bnum": "MN-707", "start": "11:15", "end": "11:35",
            "times": [("11:15", "11:17"), ("11:20", "11:22"), ("11:28", "11:30"), ("11:35", "11:35")]
        },

        # Kottayam to Thiruvalla trips
        {
            "num": "TRIP-KTM-0830", "rnum": "R-103", "bnum": "FP-402", "start": "08:30", "end": "09:25",
            "times": [("08:30", "08:35"), ("08:40", "08:42"), ("08:52", "08:54"), ("09:05", "09:08"), ("09:15", "09:17"), ("09:25", "09:25")]
        },
        {
            "num": "TRIP-KTM-1315", "rnum": "R-103", "bnum": "SM-205", "start": "13:15", "end": "14:10",
            "times": [("13:15", "13:20"), ("13:25", "13:27"), ("13:38", "13:40"), ("13:51", "13:54"), ("14:01", "14:03"), ("14:10", "14:10")]
        },

        # Kochi (Vyttila) to Thrissur trips
        {
            "num": "TRIP-COK-0700", "rnum": "R-104", "bnum": "SW-108", "start": "07:00", "end": "08:50",
            "times": [("07:00", "07:05"), ("07:18", "07:20"), ("07:35", "07:40"), ("07:55", "08:00"), ("08:18", "08:22"), ("08:42", "08:45"), ("08:50", "08:50")]
        },
        {
            "num": "TRIP-COK-1030", "rnum": "R-104", "bnum": "LF-501", "start": "10:30", "end": "12:20",
            "times": [("10:30", "10:35"), ("10:48", "10:50"), ("11:05", "11:10"), ("11:25", "11:30"), ("11:48", "11:52"), ("12:12", "12:15"), ("12:20", "12:20")]
        }
    ]

    for t in trips_def:
        trip = Trip(
            trip_number=t["num"],
            route_id=route_objs[t["rnum"]].id,
            bus_id=bus_objs[t["bnum"]].id,
            calendar_id=cal_daily.id,
            direction="OUTBOUND",
            scheduled_start_time=t["start"],
            scheduled_end_time=t["end"],
            status="SCHEDULED"
        )
        db.session.add(trip)
        db.session.flush()

        # Stop times
        route = route_objs[t["rnum"]]
        rstops = route.route_stops
        for idx, (arr, dep) in enumerate(t["times"]):
            if idx < len(rstops):
                rs = rstops[idx]
                st = StopTime(
                    trip_id=trip.id,
                    stop_id=rs.stop_id,
                    stop_sequence=rs.stop_sequence,
                    scheduled_arrival=arr,
                    scheduled_departure=dep,
                    distance_from_start_km=rs.distance_from_start_km
                )
                db.session.add(st)

    # 8. Initial GPS Positions for Buses (Demonstration Mode)
    now = datetime.utcnow()
    gps_data = [
        # Blue Express: On Route Kallooppara -> Thiruvalla near Nedumpuram
        {"bus_id": bus_objs["BX-101"].id, "lat": 9.3872, "lng": 76.6050, "speed": 34.0, "heading": 245.0, "sim": True},
        # KSRTC Fast Passenger: Near Changanassery
        {"bus_id": bus_objs["FP-402"].id, "lat": 9.4410, "lng": 76.5405, "speed": 42.5, "heading": 180.0, "sim": True},
        # SWIFT Gajaraj: Approaching Aluva Bridge on Kochi-Thrissur corridor
        {"bus_id": bus_objs["SW-108"].id, "lat": 10.0820, "lng": 76.3410, "speed": 55.0, "heading": 25.0, "sim": True},
        # St. Mary's: Near Kottayam
        {"bus_id": bus_objs["SM-205"].id, "lat": 9.5700, "lng": 76.5250, "speed": 38.0, "heading": 170.0, "sim": True},
        # Kochi Metro Feeder: Edappally Toll
        {"bus_id": bus_objs["LF-501"].id, "lat": 10.0210, "lng": 76.3100, "speed": 28.0, "heading": 35.0, "sim": True}
    ]

    for g in gps_data:
        loc = BusLocation(
            bus_id=g["bus_id"],
            latitude=g["lat"],
            longitude=g["lng"],
            speed_kmh=g["speed"],
            heading_degrees=g["heading"],
            timestamp=now,
            is_simulated=g["sim"],
            source="simulation"
        )
        db.session.add(loc)

    # 9. Audit Log
    log = AuditLog(
        user_email="system@busora.kerala.gov.in",
        action="SEED",
        entity_type="SYSTEM",
        entity_id="INITIAL_SEED",
        details="Seeded initial Kerala transit routes, buses, stops, and schedules."
    )
    db.session.add(log)

    db.session.commit()
    print("Database seeding completed successfully.")

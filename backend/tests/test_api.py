import pytest
from app import create_app
from app.models.models import db, BusStop, Route

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        with app.app_context():
            yield client

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "BUSORA Kerala Transit Backend"

def test_admin_login_success(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@busora.kerala.gov.in",
        "password": "Admin@Busora2026"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert "token" in data
    assert data["user"]["role"] == "admin"

def test_admin_login_failure(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@busora.kerala.gov.in",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401

def test_list_stops_and_routes(client):
    res_stops = client.get("/api/stops")
    assert res_stops.status_code == 200
    data_stops = res_stops.get_json()
    assert data_stops["total"] > 0

    res_routes = client.get("/api/routes")
    assert res_routes.status_code == 200
    data_routes = res_routes.get_json()
    assert data_routes["total"] > 0

def test_search_buses(client):
    # Search for Kallooppara to Thiruvalla
    res = client.get("/api/timetables/search?origin=Kallooppara&destination=Thiruvalla")
    assert res.status_code == 200
    data = res.get_json()
    assert "buses" in data
    assert len(data["buses"]) > 0
    assert data["buses"][0]["origin_stop"]["name"] is not None

def test_gps_validation_reject_invalid(client):
    res = client.post("/api/gps/update", json={
        "bus_id": 1,
        "latitude": 999.0, # Invalid
        "longitude": 76.5
    })
    assert res.status_code == 400
    data = res.get_json()
    assert "Invalid GPS coordinates" in data["error"]

def test_gps_update_valid(client):
    res = client.post("/api/gps/update", json={
        "bus_id": 1,
        "latitude": 9.3855,
        "longitude": 76.5750,
        "speed_kmh": 35.0,
        "heading_degrees": 120.0,
        "is_simulated": True
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["location"]["latitude"] == 9.3855

def test_admin_protected_endpoint(client):
    # Unauthenticated request must fail
    res = client.get("/api/admin/overview")
    assert res.status_code == 401

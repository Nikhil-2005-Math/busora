import os
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.models.models import db
from app.services.seeder import seed_database

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database
    db.init_app(app)

    # Ensure upload and database folders exist
    os.makedirs(app.config.get("UPLOAD_FOLDER", "uploads"), exist_ok=True)
    os.makedirs("database", exist_ok=True)

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.buses import buses_bp
    from app.routes.stops import stops_bp
    from app.routes.routes import routes_bp
    from app.routes.timetables import timetables_bp
    from app.routes.gps import gps_bp
    from app.routes.admin import admin_bp
    from app.routes.data_io import data_io_bp
    from app.routes.favourites import favourites_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(buses_bp)
    app.register_blueprint(stops_bp)
    app.register_blueprint(routes_bp)
    app.register_blueprint(timetables_bp)
    app.register_blueprint(gps_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(data_io_bp)
    app.register_blueprint(favourites_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "BUSORA Kerala Transit Backend",
            "database_type": app.config.get("DB_TYPE", "sqlite"),
            "demo_mode": app.config.get("DEMO_MODE", True),
            "version": "1.0.0"
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    # Auto create tables and seed demonstration data
    with app.app_context():
        db.create_all()
        try:
            seed_database()
        except Exception as e:
            print(f"Note on seeding: {e}")

    return app

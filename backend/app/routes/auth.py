from flask import Blueprint, request, jsonify
from app.models.models import db, User, AuditLog
from app.utils.auth_middleware import create_token, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is disabled. Contact system administrator."}), 403

    token = create_token(user)

    # Log login action
    try:
        log = AuditLog(
            user_email=user.email,
            action="LOGIN",
            entity_type="USER",
            entity_id=str(user.id),
            details=f"User {user.email} logged in successfully.",
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me(current_user):
    return jsonify({
        "user": current_user.to_dict()
    }), 200

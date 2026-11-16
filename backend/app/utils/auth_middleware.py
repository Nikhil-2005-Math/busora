import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from app.models.models import User

def create_token(user):
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
        "exp": datetime.utcnow() + timedelta(hours=current_app.config["JWT_EXPIRATION_HOURS"]),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization token"}), 401
        
        token = auth_header.split(" ")[1]
        decoded = decode_token(token)
        if not decoded:
            return jsonify({"error": "Token has expired or is invalid"}), 401
        
        current_user = User.query.get(decoded["sub"])
        if not current_user or not current_user.is_active:
            return jsonify({"error": "User account is disabled or not found"}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Admin authorization token required"}), 401
        
        token = auth_header.split(" ")[1]
        decoded = decode_token(token)
        if not decoded or decoded.get("role") != "admin":
            return jsonify({"error": "Forbidden: Administrator privileges required"}), 403
        
        current_user = User.query.get(decoded["sub"])
        if not current_user or not current_user.is_active or current_user.role != "admin":
            return jsonify({"error": "Forbidden: Active administrator privileges required"}), 403
            
        return f(current_user, *args, **kwargs)
    return decorated

from flask import Blueprint, request, jsonify
from app.models.models import db, Favourite, BusStop, Route, Bus

favourites_bp = Blueprint("favourites", __name__, url_prefix="/api/favourites")

@favourites_bp.route("", methods=["GET"])
def get_favourites():
    user_identifier = request.args.get("user_id", "guest-device")
    favs = Favourite.query.filter_by(user_identifier=user_identifier).all()

    detailed = []
    for f in favs:
        item_data = None
        if f.item_type == "stop":
            st = BusStop.query.get(f.item_id)
            if st:
                item_data = st.to_dict()
        elif f.item_type == "route":
            rt = Route.query.get(f.item_id)
            if rt:
                item_data = rt.to_dict(include_stops=False)
        elif f.item_type == "bus":
            bs = Bus.query.get(f.item_id)
            if bs:
                item_data = bs.to_dict()

        detailed.append({
            "id": f.id,
            "item_type": f.item_type,
            "item_id": f.item_id,
            "details": item_data
        })

    return jsonify({"favourites": detailed}), 200

@favourites_bp.route("", methods=["POST"])
def toggle_favourite():
    data = request.get_json() or {}
    user_identifier = data.get("user_id", "guest-device")
    item_type = data.get("item_type") # 'stop', 'route', 'bus'
    item_id = data.get("item_id")

    if not item_type or not item_id:
        return jsonify({"error": "item_type and item_id are required"}), 400

    existing = Favourite.query.filter_by(
        user_identifier=user_identifier,
        item_type=item_type,
        item_id=item_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"message": "Removed from favourites", "is_favourite": False}), 200
    else:
        fav = Favourite(
            user_identifier=user_identifier,
            item_type=item_type,
            item_id=item_id
        )
        db.session.add(fav)
        db.session.commit()
        return jsonify({"message": "Added to favourites", "is_favourite": True}), 201

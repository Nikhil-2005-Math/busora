import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    print(f"Starting BUSORA Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)

# BUSORA — Kerala Smart Bus Arrival & Route Tracking System

> **"Every Bus. Every Stop. Every Minute."**

BUSORA is a complete, modern, responsive full-stack web application designed for bus arrival, departure, timetable management, and real-time route tracking across Kerala, India.

---

## 🌟 Key Features

1. **Animated Opening Screen**:
   - Pure white aesthetic background with modern BUSORA branding and tagline.
   - Realistic Kerala-style public transport bus SVG (blue & white livery, Kerala road swoosh, passenger windows, LED destination board, headlights, spinning wheels) smoothly entering from the left and driving across to the right into the application.
   - 2–4 seconds duration, skip button, session awareness, and respects `prefers-reduced-motion`. Can also be replayed at any time via the "Intro" button in the navigation bar.

2. **Responsive Homepage**:
   - Hero section: *"Your Next Bus, Without the Guesswork."*
   - Interactive origin and destination search with autocomplete suggestions from the Kerala database.
   - Swap locations button, departure time filter, and journey date selector.
   - Popular Kerala corridors:
     - Kallooppara ⇄ Thiruvalla
     - Thiruvalla ⇄ Changanassery (MC Road)
     - Kottayam ⇄ Thiruvalla
     - Kochi (Vyttila Mobility Hub) ⇄ Thrissur (Sakthan Thampuran)
   - Interactive live map preview and nearby bus stops.

3. **Bus Arrival & Departure Dashboard (`/find-bus`)**:
   - Detailed bus cards featuring Kerala bus graphics, fleet IDs, operator badges (KSRTC, KSRTC-SWIFT, St. Mary's, Blue Express), seating capacities, origin, destination, scheduled times, and live delay tracking.
   - Filter by bus operator, bus category (*Ordinary*, *Fast Passenger*, *Super Fast*, *Swift Deluxe*, *Low Floor AC*).
   - Sort by earliest departure, earliest arrival, or shortest journey duration.

4. **Interactive Live Map (`/live-map`)**:
   - Powered by Leaflet and OpenStreetMap with proper tile attribution.
   - Bus stop pin markers with popup details and upcoming scheduled departures.
   - Route polylines rendered with distinct color-coding.
   - Bus markers showing real-time heading rotation, speed in km/h, and live telemetry pulses.
   - **Simulated Demonstration Mode**: Clearly labeled toggle and background engine advancing demo buses realistically along Kerala corridors without fabricating hardware GPS data.
   - Browser Geolocation API integration to recenter the map on the user's location with permission prompts and graceful fallbacks.

5. **Route Explorer (`/routes` & `/routes/:id`)**:
   - Route directory with distance (km) and estimated durations.
   - Ordered intermediate stop timeline with distance milestones and travel minutes.
   - Route geometry visualized on Leaflet.
   - Scheduled daily trips list.

6. **Bus Stop Explorer (`/stops` & `/stops/:id`)**:
   - Search stops by name, district (*Pathanamthitta*, *Kottayam*, *Ernakulam*, *Thrissur*, etc.), locality, or landmark.
   - "Find Stops Near Me" browser geolocation feature.
   - Stop detail page with live departures/arrivals board and map pin.

7. **Bilingual Localization & Dark Mode**:
   - English & Malayalam (**മലയാളം**) bilingual toggle in navigation bar.
   - Dark/Light mode theme toggle.

8. **Administrative Command Portal (`/admin`)**:
   - Secure login with JWT authentication, salted password hashing, and role verification.
   - **Overview**: System metrics (active buses, routes, geocoded stops, daily trips, live telemetry breakdown) with interactive charts.
   - **Bus Fleet Management**: Add, edit, deactivate buses, configure categories and registrations.
   - **Bus Stop Management**: Add/edit stops with an **interactive map coordinate picker** to click and populate latitude/longitude coordinates automatically.
   - **Route Configurations**: Create routes and sequence intermediate stops.
   - **Timetable Management**: Schedule trips, start/end clocks, and intermediate stop times.
   - **GPS Tracking Monitor**: Real-time telemetry feed categorizing buses into *Reporting (<5m)*, *Stale (5m-15m)*, and *Offline (>15m)*, plus an endpoint test bench to submit coordinates and test server validation.
   - **CSV Data & Audit Logs**: Download sample CSV templates for stops and timetables, upload batch CSV files with server-side row validation, and inspect chronological administrative audit trails.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + TypeScript + Vite
  - Tailwind CSS v4
  - Framer Motion (animated Kerala bus splash screen)
  - Leaflet & React-Leaflet (OpenStreetMap interactive layers)
  - Recharts (admin charts & metrics)
  - Lucide React (icons)
- **Backend**:
  - Python 3.12 + Flask
  - Flask-SQLAlchemy (relational ORM)
  - PyJWT & Werkzeug security (salted password hashing)
  - Flask-CORS (cross-origin resource sharing)
  - SQLite (out-of-the-box zero-config dev mode) & MySQL (production mode)
  - Pytest (automated test suite)

---

## 🔐 Default Administrator Credentials

- **Email**: `admin@busora.kerala.gov.in`
- **Password**: `Admin@Busora2026`
- **Portal URL**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) and npm
- Python (3.10+) and pip

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend automated test suite
python -m pytest tests/test_api.py -v

# Start the Flask API server
python run.py
```
> The backend server starts at: `http://127.0.0.1:5000` (SQLite database is auto-created in `backend/database/busora.db` and seeded with Kerala demonstration routes on first launch).

### 2. Frontend Setup

In a separate terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> The frontend application starts at: `http://localhost:5173`

---

## 🗄️ Database Configuration (SQLite vs MySQL)

The backend comes configured with **SQLite** out of the box so it runs immediately without external database setup.

To switch to **MySQL**:

1. Create a MySQL database and user:
   ```sql
   CREATE DATABASE busora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'busora_user'@'localhost' IDENTIFIED BY 'busora_password';
   GRANT ALL PRIVILEGES ON busora_db.* TO 'busora_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
2. Install `pymysql`:
   ```bash
   pip install pymysql cryptography
   ```
3. Update `backend/.env`:
   ```env
   DB_TYPE=mysql
   MYSQL_USER=busora_user
   MYSQL_PASSWORD=busora_password
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DB=busora_db
   ```
4. Restart the backend with `python run.py`. The database tables and seed records will be auto-generated.

---

## 🧪 Automated Testing

Run the comprehensive API test suite:

```bash
cd backend
python -m pytest tests/test_api.py -v
```

Verifies:
- `GET /api/health`
- Admin authentication & JWT token generation
- Invalid credentials rejection
- Bus stop & route queries
- Origin-destination search with ETA calculations
- GPS coordinate validation (bounds checking and rejection of invalid coordinates)
- Admin-protected endpoint authorization

---

## 📄 Batch CSV Import Templates

Two sample CSV files are included in the root directory for immediate testing in the Admin Portal (**CSV Data & Audit Logs**):
- [`sample_stops.csv`](file:///c:/Users/NIKHIL%20MATHEW/Downloads/busss/sample_stops.csv)
- [`sample_timetables.csv`](file:///c:/Users/NIKHIL%20MATHEW/Downloads/busss/sample_timetables.csv)

You can also download live templates directly from the Admin Portal interface.

---

## 🛡️ Cybersecurity & Privacy Practices
- **Password Security**: Passwords hashed using Werkzeug PBKDF2 HMAC SHA-256.
- **Authorization**: Bearer JWT tokens with expiration; administrative endpoints strictly gated with `@admin_required`.
- **Query Parameterization**: Managed via SQLAlchemy ORM, eliminating SQL injection.
- **GPS Telemetry Validation**: Ingestion endpoint validates coordinate bounds, speed limits (0-140 km/h), and heading ranges (0-360°), rejecting stale reports (>2 hours).
- **Privacy**: No personally identifiable driver information is tracked or exposed.

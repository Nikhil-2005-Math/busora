export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "operator" | "user";
  is_active: boolean;
  created_at: string;
}

export interface Operator {
  id: number;
  name: string;
  code: string;
  contact_number?: string;
  email?: string;
  address?: string;
  is_government: boolean;
  is_active: boolean;
}

export interface BusLocation {
  id: number;
  bus_id: number;
  trip_id?: number;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading_degrees: number;
  timestamp: string;
  age_seconds: number;
  is_simulated: boolean;
  source: string;
  freshness_status: "live" | "stale" | "offline";
}

export interface Bus {
  id: number;
  bus_number: string;
  registration_number: string;
  name: string;
  operator_id: number;
  operator_name?: string;
  category: string;
  seating_capacity: number;
  photo_url?: string;
  is_active: boolean;
  description?: string;
  last_location?: BusLocation | null;
}

export interface BusStop {
  id: number;
  stop_code: string;
  name: string;
  name_ml?: string;
  district: string;
  locality: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  is_active: boolean;
  distance_km?: number;
  routes?: Route[];
}

export interface RouteStop {
  id: number;
  route_id: number;
  stop_id: number;
  stop_sequence: number;
  stop_name: string;
  stop_name_ml?: string;
  district: string;
  latitude: number;
  longitude: number;
  distance_from_start_km: number;
  travel_time_mins: number;
  is_mandatory: boolean;
}

export interface Route {
  id: number;
  route_number: string;
  name: string;
  name_ml?: string;
  origin_stop_id: number;
  origin_stop_name?: string;
  destination_stop_id: number;
  destination_stop_name?: string;
  operator_id?: number;
  operator_name?: string;
  distance_km: number;
  estimated_duration_mins: number;
  polyline_geojson?: string;
  is_active: boolean;
  total_stops?: number;
  stops?: RouteStop[];
}

export interface StopTime {
  id: number;
  trip_id: number;
  stop_id: number;
  stop_name: string;
  stop_name_ml?: string;
  stop_sequence: number;
  scheduled_arrival: string;
  scheduled_departure: string;
  distance_from_start_km: number;
  latitude?: number;
  longitude?: number;
}

export interface Trip {
  id: number;
  trip_number: string;
  route_id: number;
  route_name?: string;
  bus_id: number;
  bus_name?: string;
  bus_number?: string;
  registration_number?: string;
  operator_name?: string;
  category?: string;
  photo_url?: string;
  calendar_id?: number;
  direction: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  status: string;
  stop_times?: StopTime[];
}

export interface BusSearchResult {
  trip_id: number;
  trip_number: string;
  bus_id: number;
  bus_name: string;
  bus_number: string;
  registration_number: string;
  operator_name?: string;
  category: string;
  photo_url?: string;
  route_id: number;
  route_name?: string;
  route_number?: string;
  origin_stop: {
    id: number;
    name: string;
    name_ml?: string;
    district: string;
    scheduled_departure: string;
    estimated_departure?: string;
  };
  destination_stop: {
    id: number;
    name: string;
    name_ml?: string;
    district: string;
    scheduled_arrival: string;
  };
  journey_duration_mins: number;
  status: string;
  delay_minutes: number;
  eta_type: "gps" | "timetable" | "unavailable";
  gps_freshness: "live" | "stale" | "offline";
  is_simulated: boolean;
  is_demo_data: boolean;
}

export interface StopDepartureItem {
  trip_id: number;
  trip_number: string;
  bus_id: number;
  bus_name: string;
  bus_number: string;
  registration_number: string;
  operator_name?: string;
  category: string;
  photo_url?: string;
  route_id: number;
  route_name: string;
  route_number: string;
  origin_stop_name?: string;
  destination_stop_name?: string;
  scheduled_arrival: string;
  scheduled_departure: string;
  estimated_arrival?: string;
  delay_minutes: number;
  status: string;
  distance_km?: number;
  eta_type: string;
  gps_freshness: string;
  is_simulated: boolean;
}

export interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}

export interface AdminMetrics {
  total_buses: number;
  active_buses: number;
  total_routes: number;
  active_routes: number;
  total_stops: number;
  active_stops: number;
  total_trips: number;
  active_trips: number;
  reporting_live: number;
  reporting_stale: number;
  reporting_offline: number;
}

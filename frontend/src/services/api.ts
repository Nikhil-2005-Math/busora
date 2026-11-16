const API_BASE = "/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("busora_admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  // Buses
  async getBuses(params?: { category?: string; search?: string; active?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.active !== undefined) query.set("active", String(params.active));
    const res = await fetch(`${API_BASE}/buses?${query.toString()}`);
    return res.json();
  },

  async getBus(id: number) {
    const res = await fetch(`${API_BASE}/buses/${id}`);
    return res.json();
  },

  async createBus(busData: any) {
    const res = await fetch(`${API_BASE}/buses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(busData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create bus");
    }
    return res.json();
  },

  async updateBus(id: number, busData: any) {
    const res = await fetch(`${API_BASE}/buses/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(busData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update bus");
    }
    return res.json();
  },

  async deleteBus(id: number) {
    const res = await fetch(`${API_BASE}/buses/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Stops
  async getStops(params?: { district?: string; search?: string; locality?: string }) {
    const query = new URLSearchParams();
    if (params?.district) query.set("district", params.district);
    if (params?.search) query.set("search", params.search);
    if (params?.locality) query.set("locality", params.locality);
    const res = await fetch(`${API_BASE}/stops?${query.toString()}`);
    return res.json();
  },

  async getStop(id: number) {
    const res = await fetch(`${API_BASE}/stops/${id}`);
    return res.json();
  },

  async getStopDepartures(id: number) {
    const res = await fetch(`${API_BASE}/stops/${id}/departures`);
    return res.json();
  },

  async getNearbyStops(lat: number, lng: number, radiusKm: number = 10) {
    const res = await fetch(`${API_BASE}/stops/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`);
    return res.json();
  },

  async createStop(stopData: any) {
    const res = await fetch(`${API_BASE}/stops`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(stopData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create stop");
    }
    return res.json();
  },

  async updateStop(id: number, stopData: any) {
    const res = await fetch(`${API_BASE}/stops/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(stopData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update stop");
    }
    return res.json();
  },

  async deleteStop(id: number) {
    const res = await fetch(`${API_BASE}/stops/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Routes
  async getRoutes(params?: { search?: string; include_stops?: boolean }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.include_stops) query.set("include_stops", "true");
    const res = await fetch(`${API_BASE}/routes?${query.toString()}`);
    return res.json();
  },

  async getRoute(id: number) {
    const res = await fetch(`${API_BASE}/routes/${id}`);
    return res.json();
  },

  async createRoute(routeData: any) {
    const res = await fetch(`${API_BASE}/routes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(routeData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create route");
    }
    return res.json();
  },

  async updateRoute(id: number, routeData: any) {
    const res = await fetch(`${API_BASE}/routes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(routeData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update route");
    }
    return res.json();
  },

  async updateRouteStops(id: number, stops: any[]) {
    const res = await fetch(`${API_BASE}/routes/${id}/stops`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ stops })
    });
    return res.json();
  },

  // Timetables & Search
  async searchBuses(origin: string, destination: string, time?: string, originId?: number, destId?: number) {
    const query = new URLSearchParams();
    if (originId) query.set("origin_id", String(originId));
    else query.set("origin", origin);

    if (destId) query.set("destination_id", String(destId));
    else query.set("destination", destination);

    if (time) query.set("time", time);

    const res = await fetch(`${API_BASE}/timetables/search?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Search failed");
    }
    return res.json();
  },

  async getTrips(routeId?: number, busId?: number) {
    const query = new URLSearchParams();
    if (routeId) query.set("route_id", String(routeId));
    if (busId) query.set("bus_id", String(busId));
    const res = await fetch(`${API_BASE}/timetables/trips?${query.toString()}`);
    return res.json();
  },

  async getTrip(id: number) {
    const res = await fetch(`${API_BASE}/timetables/trips/${id}`);
    return res.json();
  },

  async createTrip(tripData: any) {
    const res = await fetch(`${API_BASE}/timetables/trips`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(tripData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create trip");
    }
    return res.json();
  },

  async cancelTrip(id: number) {
    const res = await fetch(`${API_BASE}/timetables/trips/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // GPS Live & Simulation
  async getLiveBuses() {
    const res = await fetch(`${API_BASE}/gps/live`);
    return res.json();
  },

  async postGpsTelemetry(telemetry: {
    bus_id: number;
    latitude: number;
    longitude: number;
    speed_kmh?: number;
    heading_degrees?: number;
    source?: string;
    is_simulated?: boolean;
    timestamp?: string;
  }) {
    const res = await fetch(`${API_BASE}/gps/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telemetry)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "GPS upload rejected");
    }
    return res.json();
  },

  async triggerSimulationTick(delta?: number) {
    const res = await fetch(`${API_BASE}/gps/simulate-tick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta: delta || 0.0008 })
    });
    return res.json();
  },

  // Admin Dashboard Overview & Audit
  async getAdminOverview() {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Unauthorized or server error");
    return res.json();
  },

  async getAuditLogs(limit: number = 50) {
    const res = await fetch(`${API_BASE}/admin/audit-logs?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // CSV Imports
  async importStopsCsv(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("busora_admin_token");
    const res = await fetch(`${API_BASE}/data/import/stops`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    return res.json();
  },

  async importTimetablesCsv(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("busora_admin_token");
    const res = await fetch(`${API_BASE}/data/import/timetables`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    return res.json();
  },

  // Favourites
  async getFavourites(userId: string = "guest-device") {
    const res = await fetch(`${API_BASE}/favourites?user_id=${userId}`);
    return res.json();
  },

  async toggleFavourite(itemType: "stop" | "route" | "bus", itemId: number, userId: string = "guest-device") {
    const res = await fetch(`${API_BASE}/favourites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_type: itemType, item_id: itemId, user_id: userId })
    });
    return res.json();
  }
};

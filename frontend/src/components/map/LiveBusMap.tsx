import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Bus, BusStop, Route } from "../../types";
import { api } from "../../services/api";
import { 
  Navigation, MapPin, Eye, EyeOff, Play, RefreshCw, 
  Layers, Clock, AlertCircle, Sparkles, Compass, Bus as BusIcon 
} from "lucide-react";

// Fix standard Leaflet icon paths in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Bus Marker DivIcon with heading and status
const createBusIcon = (bus: any, isSelected: boolean) => {
  const isLive = bus.reporting_status === "Reporting";
  const isStale = bus.reporting_status === "Stale";
  const bg = isLive ? "bg-blue-600" : isStale ? "bg-amber-500" : "bg-slate-500";
  const heading = bus.location?.heading_degrees || 0;

  return L.divIcon({
    className: "custom-bus-marker",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
        ${isLive ? `<span style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(37, 99, 235, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ""}
        <div style="
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 12px;
          background: ${isLive ? '#1565C0' : isStale ? '#D97706' : '#475569'};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 2px solid white;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: transform 0.2s ease;
        ">
          <svg style="transform: rotate(${heading}deg); width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
        <span style="
          position: absolute;
          bottom: -14px;
          background: #0F172A;
          color: #F8FAFC;
          font-size: 9px;
          font-weight: bold;
          padding: 1px 4px;
          border-radius: 4px;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.2);
        ">${bus.bus_number}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

// Custom Bus Stop Marker DivIcon
const createStopIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: "custom-stop-marker",
    html: `
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: ${isSelected ? '#EF4444' : '#1565C0'};
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10]
  });
};

// Helper component to center map on user coordinates or selected entity
function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

interface LiveBusMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  highlightBusId?: number | null;
  highlightRouteId?: number | null;
  highlightStopId?: number | null;
}

export const LiveBusMap: React.FC<LiveBusMapProps> = ({
  initialCenter = [9.5915, 76.5222], // Kerala central default (Kottayam / Thiruvalla)
  initialZoom = 10,
  highlightBusId,
  highlightRouteId,
  highlightStopId
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState<number>(initialZoom);
  
  const [buses, setBuses] = useState<any[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  
  const [showStops, setShowStops] = useState<boolean>(true);
  const [selectedRouteId, setSelectedRouteId] = useState<number | "all">(highlightRouteId || "all");
  const [selectedBus, setSelectedBus] = useState<any | null>(null);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [stopDepartures, setStopDepartures] = useState<any[]>([]);
  
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Load initial map entities
  const loadMapData = async () => {
    try {
      const [liveRes, stopsRes, routesRes] = await Promise.all([
        api.getLiveBuses(),
        api.getStops(),
        api.getRoutes({ include_stops: true })
      ]);
      setBuses(liveRes.buses || []);
      setStops(stopsRes.stops || []);
      setRoutes(routesRes.routes || []);
    } catch (err) {
      console.error("Failed to load map data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  // Highlight bus if passed
  useEffect(() => {
    if (highlightBusId && buses.length > 0) {
      const b = buses.find(x => x.bus_id === highlightBusId);
      if (b && b.location) {
        setSelectedBus(b);
        setMapCenter([b.location.latitude, b.location.longitude]);
        setMapZoom(13);
      }
    }
  }, [highlightBusId, buses]);

  // Periodic polling & simulation tick
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isSimulating) {
        try {
          await api.triggerSimulationTick();
        } catch {}
      }
      try {
        const liveRes = await api.getLiveBuses();
        setBuses(liveRes.buses || []);
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // When a stop is clicked, load its upcoming departures
  const handleStopClick = async (stop: BusStop) => {
    setSelectedStop(stop);
    setSelectedBus(null);
    try {
      const res = await api.getStopDepartures(stop.id);
      setStopDepartures(res.departures || []);
    } catch {
      setStopDepartures([]);
    }
  };

  // User Geolocation
  const handleRecenterLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }
    setGeoLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(coords);
        setMapZoom(13);
        setGeoLocating(false);
      },
      (err) => {
        setGeoLocating(false);
        setGeoError("Location permission denied. Please allow location access or pick manually.");
      },
      { timeout: 8000 }
    );
  };

  // Filter routes to display
  const activeRoutesToRender = routes.filter(r => {
    if (selectedRouteId === "all") return true;
    return r.id === selectedRouteId;
  });

  const getRouteColor = (routeNumber: string) => {
    const palette = ["#2563EB", "#059669", "#7C3AED", "#DC2626", "#D97706"];
    let hash = 0;
    for (let i = 0; i < routeNumber.length; i++) {
      hash = routeNumber.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  };

  return (
    <div className="relative w-full h-[650px] lg:h-[780px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Route Selector & Stop Layer Toggle */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg">
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">🌐 All Kerala Routes ({routes.length})</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>
                {r.route_number}: {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowStops(!showStops)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showStops
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {showStops ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Stops Layer</span>
          </button>
        </div>

        {/* Right Action Tools: Locate me & Demo Simulation Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg">
          {/* Recenter Location Button */}
          <button
            onClick={handleRecenterLocation}
            disabled={geoLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Recenter on your current location"
          >
            <Navigation className={`w-3.5 h-3.5 text-blue-600 ${geoLocating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">My Location</span>
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              isSimulating
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800"
            }`}
            title="Toggle live telemetry simulation for demonstration"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isSimulating ? "Demo Sim Active" : "Sim Paused"}</span>
          </button>
        </div>
      </div>

      {/* Geolocation feedback toast */}
      {geoError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-red-50 text-red-800 border border-red-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg">
          {geoError}
        </div>
      )}

      {/* Main Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Responsible OpenStreetMap Tile Service with Attribution */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | BUSORA Kerala'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polylines */}
        {activeRoutesToRender.map(route => {
          if (!route.polyline_geojson) return null;
          try {
            const positions = JSON.parse(route.polyline_geojson);
            const color = getRouteColor(route.route_number);
            return (
              <Polyline
                key={`route-${route.id}`}
                positions={positions}
                pathOptions={{
                  color,
                  weight: 5,
                  opacity: 0.85,
                  lineJoin: "round"
                }}
              />
            );
          } catch {
            return null;
          }
        })}

        {/* Bus Stops Markers */}
        {showStops && stops.map(stop => (
          <Marker
            key={`stop-${stop.id}`}
            position={[stop.latitude, stop.longitude]}
            icon={createStopIcon(selectedStop?.id === stop.id)}
            eventHandlers={{
              click: () => handleStopClick(stop)
            }}
          >
            <Popup>
              <div className="p-1 min-w-[200px]">
                <div className="font-bold text-slate-900 text-sm">{stop.name}</div>
                {stop.name_ml && <div className="text-xs text-slate-500 font-medium">{stop.name_ml}</div>}
                <div className="text-[11px] text-blue-600 font-semibold mt-1">
                  {stop.district} • {stop.locality}
                </div>
                {stop.landmark && (
                  <div className="text-[11px] text-slate-500 mt-0.5 italic">Landmark: {stop.landmark}</div>
                )}
                <button
                  onClick={() => handleStopClick(stop)}
                  className="mt-2 w-full py-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition"
                >
                  View Upcoming Departures
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Buses Markers */}
        {buses.map(bus => {
          if (!bus.location) return null;
          const isSelected = selectedBus?.bus_id === bus.bus_id;
          return (
            <Marker
              key={`bus-${bus.bus_id}`}
              position={[bus.location.latitude, bus.location.longitude]}
              icon={createBusIcon(bus, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedBus(bus);
                  setSelectedStop(null);
                }
              }}
            >
              <Popup>
                <div className="p-1 min-w-[220px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">{bus.bus_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                      {bus.bus_number}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">{bus.operator_name}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Speed: {Math.round(bus.location.speed_kmh || 0)} km/h • Heading: {Math.round(bus.location.heading_degrees || 0)}°
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${bus.reporting_status === 'Reporting' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {bus.reporting_status}
                    </span>
                    {bus.location.is_simulated && (
                      <span className="text-slate-400 italic">Simulated Demo</span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg text-xs flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-white inline-block"></span>
          <span>Live Bus</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white inline-block"></span>
          <span>Stale (&gt;5m)</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          <span>Bus Stop</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-6 h-1 rounded-full bg-blue-500 inline-block"></span>
          <span>Route Line</span>
        </div>
      </div>

      {/* Floating Drawer for Selected Bus or Selected Stop */}
      {(selectedBus || selectedStop) && (
        <div className="absolute bottom-4 right-4 z-20 w-80 sm:w-96 max-h-[380px] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              {selectedBus ? selectedBus.bus_name : selectedStop?.name}
            </h4>
            <button
              onClick={() => {
                setSelectedBus(null);
                setSelectedStop(null);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          {selectedBus && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 font-medium">Fleet ID</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBus.bus_number}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 font-medium">Registration</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBus.registration_number}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 font-medium">Current Telemetry</span>
                <span className="font-bold text-blue-600">
                  {Math.round(selectedBus.location?.speed_kmh || 0)} km/h
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="font-bold text-emerald-600">
                  {selectedBus.reporting_status} ({selectedBus.location?.is_simulated ? "Simulated" : "Hardware GPS"})
                </span>
              </div>
            </div>
          )}

          {selectedStop && (
            <div className="space-y-3 text-xs">
              <div className="text-slate-500">
                {selectedStop.locality}, {selectedStop.district}
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                Upcoming Departures ({stopDepartures.length})
              </h5>

              {stopDepartures.length === 0 ? (
                <div className="p-3 text-center text-slate-400">No scheduled departures right now</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {stopDepartures.map((d, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{d.bus_name}</div>
                        <div className="text-[10px] text-slate-500">To: {d.destination_stop_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-blue-600">{d.scheduled_departure}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">{d.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

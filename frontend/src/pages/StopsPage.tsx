import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BusStop } from "../types";
import { api } from "../services/api";
import { 
  MapPin, Search, Navigation, Filter, 
  ChevronRight, Compass, AlertCircle, Sparkles 
} from "lucide-react";

export const StopsPage: React.FC = () => {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [loading, setLoading] = useState(true);

  // Geolocation nearby
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isNearbyMode, setIsNearbyMode] = useState(false);

  const fetchStops = async (searchVal = search, dist = selectedDistrict) => {
    setLoading(true);
    try {
      const res = await api.getStops({
        search: searchVal,
        district: dist !== "all" ? dist : undefined
      });
      setStops(res.stops || []);
      setIsNearbyMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, [search, selectedDistrict]);

  const handleNearbyStops = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await api.getNearbyStops(pos.coords.latitude, pos.coords.longitude, 25);
          setStops(res.nearby_stops || []);
          setIsNearbyMode(true);
        } catch {
          setGeoError("Could not retrieve nearby stops from server");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoLoading(false);
        setGeoError("Location permission denied. Please allow location access or search manually by district.");
      },
      { timeout: 8000 }
    );
  };

  // Distinct districts from current stops
  const districts = ["Pathanamthitta", "Kottayam", "Ernakulam", "Thrissur", "Alappuzha"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Bus Stops & Terminals</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Kerala Bus Stop Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search stops, check GPS coordinates, view serving routes, and real-time departure boards
          </p>
        </div>

        {/* Nearby Geolocation Button */}
        <button
          onClick={handleNearbyStops}
          disabled={geoLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition self-start md:self-auto"
        >
          <Navigation className={`w-4 h-4 ${geoLoading ? "animate-spin" : ""}`} />
          <span>{geoLoading ? "Finding Nearest Stops..." : "Find Stops Near Me"}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by stop name, junction, or landmark..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Districts</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {isNearbyMode && (
          <button
            onClick={() => fetchStops("", "all")}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Clear Nearby Filter (Show All)
          </button>
        )}
      </div>

      {/* Stops Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : stops.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <p className="font-bold text-slate-700 dark:text-slate-300">No bus stops found matching criteria</p>
          <p className="text-xs text-slate-500">Try changing district or clear your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stops.map((stop) => (
            <Link
              key={stop.id}
              to={`/stops/${stop.id}`}
              className="group p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded font-black bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {stop.stop_code}
                  </span>
                  {stop.distance_km !== undefined ? (
                    <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      {stop.distance_km} km away
                    </span>
                  ) : (
                    <span className="font-bold text-slate-400">{stop.district}</span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition">
                  {stop.name}
                </h3>
                {stop.name_ml && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{stop.name_ml}</p>
                )}

                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Locality: <span className="font-semibold text-slate-800 dark:text-slate-200">{stop.locality}</span></div>
                  {stop.landmark && (
                    <div className="text-[11px] text-slate-500 italic">Landmark: {stop.landmark}</div>
                  )}
                  <div className="text-[10px] text-slate-400 font-mono">
                    Lat: {stop.latitude.toFixed(4)}, Lng: {stop.longitude.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>View Live Departure Board</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

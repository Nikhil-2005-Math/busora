import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Route } from "../types";
import { api } from "../services/api";
import { 
  Compass, MapPin, Search, ArrowRight, Clock, 
  ChevronRight, Calendar, Bus 
} from "lucide-react";

export const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await api.getRoutes({ search, include_stops: true });
        setRoutes(res.routes || []);
      } catch (err) {
        console.error("Failed to load routes:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRoutes();
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Kerala Transit Directory</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Kerala Bus Routes Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified inter-district routes, intermediate stops timeline, and scheduled durations
          </p>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search route name or number..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Routes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500">No routes match "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <Link
              key={route.id}
              to={`/routes/${route.id}`}
              className="group p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900">
                    {route.route_number}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    ~{route.estimated_duration_mins} mins
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg group-hover:text-[#1565C0] transition">
                  {route.name}
                </h3>
                {route.name_ml && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{route.name_ml}</p>
                )}

                <div className="my-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="truncate max-w-[45%]">{route.origin_stop_name || "Origin"}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-2 shrink-0" />
                  <span className="truncate max-w-[45%] text-right">{route.destination_stop_name || "Destination"}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{route.distance_km} km total</span>
                  <span>•</span>
                  <span>{route.stops?.length || route.total_stops || 0} Ordered Stops</span>
                  <span>•</span>
                  <span>{route.operator_name || "KSRTC"}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Explore Stops & Timeline</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

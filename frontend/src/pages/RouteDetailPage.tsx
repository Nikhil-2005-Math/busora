import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Route, Trip, RouteStop } from "../types";
import { api } from "../services/api";
import { LiveBusMap } from "../components/map/LiveBusMap";
import { 
  ArrowLeft, Compass, MapPin, Clock, Calendar, 
  Bus, ChevronRight, CheckCircle2 
} from "lucide-react";

export const RouteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!id) return;
      try {
        const [routeRes, tripsRes] = await Promise.all([
          api.getRoute(Number(id)),
          api.getTrips(Number(id))
        ]);
        setRoute(routeRes.route);
        setTrips(tripsRes.trips || []);
      } catch (err) {
        console.error("Failed to load route details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Route not found</h2>
        <Link to="/routes" className="text-blue-600 font-bold hover:underline">
          Return to Routes Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button & Route Banner */}
      <div>
        <Link
          to="/routes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Routes</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 to-[#1565C0] text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
                {route.route_number}
              </span>
              <span className="text-xs text-blue-100 font-semibold">
                {route.operator_name || "Kerala Transit"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{route.name}</h1>
            {route.name_ml && (
              <p className="text-sm text-blue-200 mt-1 font-medium">{route.name_ml}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md text-center">
              <div className="text-blue-200 uppercase font-bold text-[10px]">Total Distance</div>
              <div className="text-lg font-black">{route.distance_km} km</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md text-center">
              <div className="text-blue-200 uppercase font-bold text-[10px]">Duration</div>
              <div className="text-lg font-black">{route.estimated_duration_mins} mins</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md text-center">
              <div className="text-blue-200 uppercase font-bold text-[10px]">Stops</div>
              <div className="text-lg font-black">{route.stops?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Stops Timeline & Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Ordered Intermediate Stops Timeline */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <span>Ordered Intermediate Stops Timeline</span>
          </h2>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-900">
            {route.stops && route.stops.map((st: RouteStop, idx: number) => (
              <div key={st.id || idx} className="relative group">
                {/* Node circle */}
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${
                  idx === 0
                    ? "bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950"
                    : idx === (route.stops?.length || 1) - 1
                    ? "bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950"
                    : "bg-slate-400 group-hover:bg-blue-600"
                }`} />

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 group-hover:border-blue-200 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600">Stop {st.stop_sequence}</span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      +{st.distance_from_start_km} km • ~{st.travel_time_mins} mins
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {st.stop_name}
                  </h4>
                  {st.stop_name_ml && (
                    <p className="text-xs text-slate-500 font-medium">{st.stop_name_ml}</p>
                  )}
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{st.district}</span>
                    <Link
                      to={`/stops/${st.stop_id}`}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      View Stop Departures →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Route Map Visualization & Scheduled Trips */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Route Geometry & Stop Markers</span>
            </h3>
            <div className="h-[400px] rounded-2xl overflow-hidden">
              <LiveBusMap highlightRouteId={route.id} initialZoom={11} />
            </div>
          </div>

          {/* Associated Scheduled Journeys */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Scheduled Daily Trips on this Route ({trips.length})</span>
            </h3>

            {trips.length === 0 ? (
              <p className="text-xs text-slate-500">No scheduled trips registered yet.</p>
            ) : (
              <div className="space-y-3">
                {trips.map(trip => (
                  <div key={trip.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {trip.trip_number}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {trip.bus_number}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Bus: {trip.bus_name} ({trip.category})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {trip.scheduled_start_time} → {trip.scheduled_end_time}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600">
                        Daily Operational Service
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

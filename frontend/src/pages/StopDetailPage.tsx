import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BusStop, StopDepartureItem, Route } from "../types";
import { api } from "../services/api";
import { LiveBusMap } from "../components/map/LiveBusMap";
import { 
  ArrowLeft, MapPin, Clock, Compass, Bus, 
  RefreshCw, Wifi, Calendar, Sparkles 
} from "lucide-react";

export const StopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stop, setStop] = useState<BusStop | null>(null);
  const [departures, setDepartures] = useState<StopDepartureItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStopData = async () => {
    if (!id) return;
    try {
      const [stopRes, depRes] = await Promise.all([
        api.getStop(Number(id)),
        api.getStopDepartures(Number(id))
      ]);
      setStop(stopRes.stop);
      setDepartures(depRes.departures || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStopData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Bus Stop Not Found</h2>
        <Link to="/stops" className="text-blue-600 font-bold hover:underline">
          Return to Bus Stops
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <Link
          to="/stops"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Bus Stops</span>
        </Link>

        {/* Stop Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {stop.stop_code}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {stop.district} District • {stop.locality}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stop.name}
              </h1>
              {stop.name_ml && (
                <p className="text-sm text-slate-500 font-medium mt-0.5">{stop.name_ml}</p>
              )}
              {stop.landmark && (
                <p className="text-xs text-slate-500 mt-1 italic">Landmark: {stop.landmark}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStopData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Refresh Departures</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Departures Table & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Departures & Arrivals Board */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Live Departure & Arrival Board</span>
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {departures.length} Scheduled Services
              </span>
            </div>

            {departures.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active departures scheduled from this stop today.
              </div>
            ) : (
              <div className="space-y-3">
                {departures.map((dep, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {dep.bus_name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {dep.bus_number}
                        </span>
                        <span className="text-xs text-blue-600 font-semibold">{dep.category}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Route: <span className="font-semibold text-slate-700 dark:text-slate-300">{dep.route_name}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Operator: <span className="font-medium text-slate-700 dark:text-slate-300">{dep.operator_name || "KSRTC"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Dep.</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {dep.scheduled_departure}
                        </div>
                        {dep.estimated_arrival && dep.estimated_arrival !== dep.scheduled_departure && (
                          <div className="text-[11px] font-bold text-amber-600">
                            Est: {dep.estimated_arrival}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          dep.gps_freshness === 'live'
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}>
                          {dep.gps_freshness === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                          <span>{dep.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Map Location & Serving Routes */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Location on Map</span>
            </h3>
            <div className="h-[320px] rounded-2xl overflow-hidden">
              <LiveBusMap
                initialCenter={[stop.latitude, stop.longitude]}
                initialZoom={14}
                highlightStopId={stop.id}
              />
            </div>
          </div>

          {/* Serving Routes */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Routes Serving This Stop ({stop.routes?.length || 0})</span>
            </h3>
            {stop.routes && stop.routes.length > 0 ? (
              <div className="space-y-2">
                {stop.routes.map((r: Route) => (
                  <Link
                    key={r.id}
                    to={`/routes/${r.id}`}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-blue-300 flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-bold text-blue-600 mr-2">{r.route_number}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{r.name}</span>
                    </div>
                    <span className="text-slate-400">View Route →</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Regular suburban and inter-district services operate via this stop.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

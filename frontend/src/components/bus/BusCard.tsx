import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BusSearchResult, StopDepartureItem } from "../../types";
import { KeralaBusSvg } from "../../assets/KeralaBusSvg";
import { 
  Clock, MapPin, ArrowRight, Heart, Map, Calendar, 
  Wifi, ShieldAlert, Sparkles, Navigation 
} from "lucide-react";

interface BusCardProps {
  bus: BusSearchResult | any;
  onSelectOnMap?: (bus: any) => void;
  isFavourite?: boolean;
  onToggleFavourite?: (busId: number) => void;
}

export const BusCard: React.FC<BusCardProps> = ({
  bus,
  onSelectOnMap,
  isFavourite = false,
  onToggleFavourite
}) => {
  const [fav, setFav] = useState(isFavourite);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFav(!fav);
    if (onToggleFavourite) {
      onToggleFavourite(bus.bus_id || bus.id);
    }
  };

  const isLive = bus.gps_freshness === "live";
  const isStale = bus.gps_freshness === "stale";
  const isSim = bus.is_simulated;

  const originName = bus.origin_stop?.name || bus.origin_stop_name || "Origin";
  const destName = bus.destination_stop?.name || bus.destination_stop_name || "Destination";
  const schedDep = bus.origin_stop?.scheduled_departure || bus.scheduled_departure || "--:--";
  const schedArr = bus.destination_stop?.scheduled_arrival || bus.scheduled_arrival || "--:--";
  const estDep = bus.origin_stop?.estimated_departure || bus.estimated_arrival;

  return (
    <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-xl transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 flex flex-col justify-between">
      {/* Top Header: Bus Identity & Operator */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Bus Graphic Miniature */}
            <div className="w-14 h-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 p-1 border border-blue-100 dark:border-blue-900 shrink-0">
              <KeralaBusSvg className="w-full h-auto" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#1565C0] transition">
                  {bus.bus_name || "Kerala Express"}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {bus.bus_number || bus.registration_number}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">{bus.operator_name || "KSRTC"}</span>
                <span>•</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{bus.category || "Fast Passenger"}</span>
              </div>
            </div>
          </div>

          {/* Favourite Button */}
          <button
            onClick={handleFav}
            aria-label="Add to favourites"
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
          >
            <Heart className={`w-4 h-4 ${fav ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>

        {/* Route Row: Origin to Destination */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Route: {bus.route_number || "Regional"}</span>
            {bus.journey_duration_mins ? (
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                ~{bus.journey_duration_mins} mins journey
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white text-sm">
            <div className="flex items-center gap-1.5 truncate max-w-[45%]">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate" title={originName}>{originName}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-2" />
            <div className="flex items-center gap-1.5 truncate max-w-[45%] justify-end">
              <span className="truncate" title={destName}>{destName}</span>
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
          </div>
        </div>

        {/* Timetable & Live Status */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>Departure</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {schedDep}
              </span>
              {estDep && estDep !== schedDep && (
                <span className="text-xs font-bold text-amber-600" title="Estimated departure">
                  (Est: {estDep})
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Scheduled time</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Arrival</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {schedArr}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Scheduled destination</span>
          </div>
        </div>

        {/* Real-time Tracking Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live GPS: {bus.status || "On Time"}</span>
            </span>
          ) : isStale ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Wifi className="w-3 h-3 text-amber-600" />
              <span>Stale GPS (&gt;5m)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Timetable: Scheduled</span>
            </span>
          )}

          {isSim && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              <Sparkles className="w-2.5 h-2.5 text-blue-600" />
              <span>Simulated Demo</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <Link
          to={`/live-map?bus_id=${bus.bus_id || bus.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/40 text-[#1565C0] dark:text-blue-300 text-xs font-bold hover:bg-[#1565C0] hover:text-white transition"
        >
          <Map className="w-3.5 h-3.5" />
          <span>View on Map</span>
        </Link>

        {bus.route_id ? (
          <Link
            to={`/routes/${bus.route_id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetable</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
};

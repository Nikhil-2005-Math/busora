import React from "react";
import { useSearchParams } from "react-router-dom";
import { LiveBusMap } from "../components/map/LiveBusMap";
import { MapPin, Sparkles, Info, ShieldAlert } from "lucide-react";

export const LiveMapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const busId = searchParams.get("bus_id") ? Number(searchParams.get("bus_id")) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Live Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Interactive Live Network</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Kerala Public Transit Live GPS Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track participating Kerala buses, check vehicle headings, route alignments, and stop arrivals in real-time
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Simulated Demonstration mode is enabled for live telemetry evaluation.</span>
        </div>
      </div>

      {/* Fullscreen-style Live Map Container */}
      <div className="w-full">
        <LiveBusMap initialZoom={10} highlightBusId={busId} />
      </div>
    </div>
  );
};

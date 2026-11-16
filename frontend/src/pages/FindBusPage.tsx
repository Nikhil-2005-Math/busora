import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { BusCard } from "../components/bus/BusCard";
import { BusSearchResult, BusStop } from "../types";
import { 
  Search, Filter, ArrowUpDown, Calendar, RefreshCw, 
  MapPin, Clock, AlertCircle, Sparkles, Navigation 
} from "lucide-react";

export const FindBusPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrigin = searchParams.get("origin") || "";
  const initialDest = searchParams.get("destination") || "";
  const initialTime = searchParams.get("time") || "";

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDest);
  const [timeFilter, setTimeFilter] = useState(initialTime);

  const [buses, setBuses] = useState<BusSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sorting state
  const [selectedOperator, setSelectedOperator] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"dep" | "arr" | "duration">("dep");

  // Perform search
  const executeSearch = async (orig = origin, dest = destination, time = timeFilter) => {
    if (!orig.trim() || !dest.trim()) {
      // Default sample search between Kallooppara and Thiruvalla if empty
      orig = "Kallooppara";
      dest = "Thiruvalla";
      setOrigin(orig);
      setDestination(dest);
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.searchBuses(orig, dest, time);
      setBuses(res.buses || []);
    } catch (err: any) {
      setError(err.message || "No schedules found between the specified locations.");
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(initialOrigin || "Kallooppara", initialDest || "Thiruvalla", initialTime);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ origin, destination, time: timeFilter });
    executeSearch();
  };

  // Filtered & Sorted bus list
  const filteredBuses = buses
    .filter(b => {
      if (selectedOperator !== "all" && b.operator_name !== selectedOperator) return false;
      if (selectedCategory !== "all" && b.category !== selectedCategory) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "dep") {
        return (a.origin_stop.scheduled_departure || "").localeCompare(b.origin_stop.scheduled_departure || "");
      }
      if (sortBy === "arr") {
        return (a.destination_stop.scheduled_arrival || "").localeCompare(b.destination_stop.scheduled_arrival || "");
      }
      if (sortBy === "duration") {
        return (a.journey_duration_mins || 0) - (b.journey_duration_mins || 0);
      }
      return 0;
    });

  // Extract unique operators and categories for filters
  const operators = Array.from(new Set(buses.map(b => b.operator_name).filter(Boolean)));
  const categories = Array.from(new Set(buses.map(b => b.category).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Search Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Starting Point
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-3.5" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Starting Stop (e.g. Kallooppara)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Destination
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3.5" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination Stop (e.g. Thiruvalla)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Time Filter
            </label>
            <input
              type="time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1565C0] hover:bg-[#0D2B52] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Searching..." : "Update Search"}</span>
            </button>
          </div>
        </form>

        {/* Filter & Sort Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 font-bold text-slate-500">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Filters:</span>
            </div>

            {/* Operator Filter */}
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="all">All Operators</option>
              {operators.map((op: any) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="all">All Bus Classes</option>
              {categories.map((cat: any) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="dep">Earliest Departure</option>
              <option value="arr">Earliest Arrival</option>
              <option value="duration">Shortest Journey</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Available Scheduled Buses ({filteredBuses.length})
          </h2>
          <p className="text-xs text-slate-500">
            Route: <span className="font-semibold text-slate-800 dark:text-slate-200">{origin}</span> to <span className="font-semibold text-slate-800 dark:text-slate-200">{destination}</span>
          </p>
        </div>

        <button
          onClick={() => executeSearch()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800 p-6" />
          ))}
        </div>
      )}

      {/* Error / Empty State */}
      {!loading && filteredBuses.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            No Buses Found on this Corridor
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || "Try adjusting your starting location, destination, or time filter. Popular verified sectors include Kallooppara to Thiruvalla, Thiruvalla to Changanassery, or Kochi to Thrissur."}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setOrigin("Kallooppara");
                setDestination("Thiruvalla");
                executeSearch("Kallooppara", "Thiruvalla");
              }}
              className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition"
            >
              Search Kallooppara → Thiruvalla
            </button>
          </div>
        </div>
      )}

      {/* Bus Cards Grid */}
      {!loading && filteredBuses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((b) => (
            <BusCard key={b.trip_id} bus={b} />
          ))}
        </div>
      )}
    </div>
  );
};

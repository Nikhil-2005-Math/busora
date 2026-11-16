import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { BusStop, Route } from "../types";
import { api } from "../services/api";
import { LiveBusMap } from "../components/map/LiveBusMap";
import { KeralaBusSvg } from "../assets/KeralaBusSvg";
import { 
  ArrowLeftRight, Search, MapPin, Calendar, Clock, 
  Compass, Bus as BusIcon, ChevronRight, Sparkles, AlertCircle 
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState("");
  
  const [stops, setStops] = useState<BusStop[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Autocomplete suggestions
  const [originSuggestions, setOriginSuggestions] = useState<BusStop[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<BusStop[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stopsRes, routesRes] = await Promise.all([
          api.getStops(),
          api.getRoutes()
        ]);
        setStops(stopsRes.stops || []);
        setRoutes(routesRes.routes || []);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOriginChange = (val: string) => {
    setOrigin(val);
    if (val.trim().length > 0) {
      const filtered = stops.filter(s => 
        s.name.toLowerCase().includes(val.toLowerCase()) ||
        (s.name_ml && s.name_ml.includes(val)) ||
        s.locality.toLowerCase().includes(val.toLowerCase())
      );
      setOriginSuggestions(filtered.slice(0, 5));
      setShowOriginDropdown(true);
    } else {
      setShowOriginDropdown(false);
    }
  };

  const handleDestChange = (val: string) => {
    setDestination(val);
    if (val.trim().length > 0) {
      const filtered = stops.filter(s => 
        s.name.toLowerCase().includes(val.toLowerCase()) ||
        (s.name_ml && s.name_ml.includes(val)) ||
        s.locality.toLowerCase().includes(val.toLowerCase())
      );
      setDestSuggestions(filtered.slice(0, 5));
      setShowDestDropdown(true);
    } else {
      setShowDestDropdown(false);
    }
  };

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;
    navigate(`/find-bus?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&time=${selectedTime}`);
  };

  return (
    <div className="min-w-0 flex flex-col space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          {/* Hero Banner Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-white/80 dark:bg-slate-900/80 shadow-xs text-xs font-bold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Smart Transit Intelligence for God's Own Country</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0D2B52] dark:text-white tracking-tight leading-tight">
              {t("hero_title")}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
              {t("hero_subtitle")}
            </p>
          </div>

          {/* SEARCH INTERFACE CARD */}
          <div className="mt-10 max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative z-20">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-9 gap-3 items-center">
                {/* Starting Location */}
                <div className="md:col-span-4 relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t("from_label")}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => handleOriginChange(e.target.value)}
                      onFocus={() => origin && setShowOriginDropdown(true)}
                      placeholder="e.g. Kallooppara, Kottayam, Vyttila"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                    {showOriginDropdown && originSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-30 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {originSuggestions.map(s => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setOrigin(s.name);
                              setShowOriginDropdown(false);
                            }}
                            className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                          >
                            <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                            <div className="text-slate-400 text-[10px]">{s.district} • {s.locality}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Swap Button */}
                <div className="md:col-span-1 flex justify-center pt-2 md:pt-6">
                  <button
                    type="button"
                    onClick={swapLocations}
                    title="Swap Origin and Destination"
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 shadow-xs"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                  </button>
                </div>

                {/* Destination */}
                <div className="md:col-span-4 relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t("to_label")}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => handleDestChange(e.target.value)}
                      onFocus={() => destination && setShowDestDropdown(true)}
                      placeholder="e.g. Thiruvalla, Changanassery, Thrissur"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                    {showDestDropdown && destSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-30 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {destSuggestions.map(s => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setDestination(s.name);
                              setShowDestDropdown(false);
                            }}
                            className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                          >
                            <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                            <div className="text-slate-400 text-[10px]">{s.district} • {s.locality}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date, Time, and Search Button */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t("date_label")}</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t("time_label")}</span>
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#1565C0] to-[#0D2B52] hover:from-[#1E88E5] hover:to-[#1565C0] text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition duration-200"
                  >
                    <Search className="w-4 h-4" />
                    <span>{t("search_btn")}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Bus Illustration Accent */}
          <div className="mt-8 max-w-lg mx-auto opacity-95">
            <KeralaBusSvg className="w-full h-auto drop-shadow-lg" />
          </div>
        </div>
      </section>

      {/* POPULAR KERALA ROUTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("popular_routes")}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              High-frequency passenger corridors across Pathanamthitta, Kottayam, Ernakulam & Thrissur
            </p>
          </div>
          <Link
            to="/routes"
            className="flex items-center gap-1 text-xs font-bold text-[#1565C0] hover:underline"
          >
            <span>View All Routes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {routes.slice(0, 4).map((r) => (
            <div
              key={r.id}
              onClick={() => navigate(`/routes/${r.id}`)}
              className="cursor-pointer group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-blue-600 mb-2">
                  <span>{r.route_number}</span>
                  <span className="text-slate-400 font-medium">~{r.estimated_duration_mins} mins</span>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition">
                  {r.name}
                </h3>
                {r.name_ml && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{r.name_ml}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>{r.distance_km} km • {r.total_stops || 5} Major Stops</span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600">
                <span>View Full Schedule</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE MAP PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive Telemetry Preview</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("map_preview")}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time bus coordinates along authentic Kerala route polylines
            </p>
          </div>
          <Link
            to="/live-map"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1565C0] text-white text-xs font-bold hover:bg-[#0D2B52] transition shadow-md"
          >
            <span>Open Fullscreen Map</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <LiveBusMap initialZoom={10} />
      </section>

      {/* UPCOMING BUSES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("nearby_stops")}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any bus terminal or junction in Kerala to check live departures
            </p>
          </div>
          <Link
            to="/stops"
            className="flex items-center gap-1 text-xs font-bold text-[#1565C0] hover:underline"
          >
            <span>Browse All {stops.length} Stops</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stops.slice(0, 6).map((s) => (
            <Link
              key={s.id}
              to={`/stops/${s.id}`}
              className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition">
                    {s.name}
                  </h4>
                  <div className="text-xs text-slate-500">
                    {s.district} • {s.locality}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

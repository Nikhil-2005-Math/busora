import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { 
  Wifi, Send, RefreshCw, AlertCircle, CheckCircle, 
  Sparkles, Compass, Gauge, ShieldCheck, MapPin 
} from "lucide-react";

export const AdminGPS: React.FC = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, live: 0, stale: 0, offline: 0 });
  const [loading, setLoading] = useState(true);

  // Manual GPS Telemetry Tester Form
  const [testBusId, setTestBusId] = useState<number>(1);
  const [testLat, setTestLat] = useState<number>(9.3855);
  const [testLng, setTestLng] = useState<number>(76.5750);
  const [testSpeed, setTestSpeed] = useState<number>(45.0);
  const [testHeading, setTestHeading] = useState<number>(140.0);
  const [ingestStatus, setIngestStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadGpsFeed = async () => {
    try {
      const res = await api.getLiveBuses();
      setBuses(res.buses || []);
      setSummary({
        total: res.total_buses || 0,
        live: res.active_reporting || 0,
        stale: res.stale_reporting || 0,
        offline: res.not_reporting || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGpsFeed();
    const interval = setInterval(loadGpsFeed, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setIngestStatus(null);

    try {
      const res = await api.postGpsTelemetry({
        bus_id: Number(testBusId),
        latitude: Number(testLat),
        longitude: Number(testLng),
        speed_kmh: Number(testSpeed),
        heading_degrees: Number(testHeading),
        source: "device_test"
      });
      setIngestStatus({
        success: true,
        msg: `Telemetry accepted by server! Telemetry ID: ${res.location.id}, Status: ${res.location.freshness_status}`
      });
      loadGpsFeed();
    } catch (err: any) {
      setIngestStatus({
        success: false,
        msg: err.message || "Coordinates rejected by server validation"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerSimTick = async () => {
    try {
      await api.triggerSimulationTick();
      loadGpsFeed();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <Wifi className="w-3.5 h-3.5" />
            <span>GPS Tracking Ingestion Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Vehicle Telemetry & Reporting Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time GPS feeds, examine stale thresholds, and test hardware telemetry endpoints
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerSimTick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Motion Tick</span>
          </button>
          <button
            onClick={loadGpsFeed}
            className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Tracked Fleet</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.total}</div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Reporting (&lt;5m)</span>
          </div>
          <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">{summary.live}</div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800 shadow-xs">
          <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
            Stale Telemetry (5m-15m)
          </div>
          <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">{summary.stale}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Offline / In Depot</div>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{summary.offline}</div>
        </div>
      </div>

      {/* Telemetry Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Reporting Vehicles Feed */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Fleet Real-Time Telemetry Feed
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Bus</th>
                  <th className="pb-3 font-bold">Registration</th>
                  <th className="pb-3 font-bold">Coordinates</th>
                  <th className="pb-3 font-bold">Speed / Heading</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {buses.map(bus => {
                  const loc = bus.location;
                  const isLive = bus.reporting_status === "Reporting";
                  const isStale = bus.reporting_status === "Stale";
                  return (
                    <tr key={bus.bus_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {bus.bus_name} ({bus.bus_number})
                      </td>
                      <td className="py-3 font-mono">{bus.registration_number}</td>
                      <td className="py-3 font-mono text-slate-500">
                        {loc ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : "—"}
                      </td>
                      <td className="py-3 font-semibold">
                        {loc ? `${Math.round(loc.speed_kmh)} km/h • ${Math.round(loc.heading_degrees)}°` : "—"}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          isLive 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isStale
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {bus.reporting_status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-400">
                        {loc ? `${Math.round(loc.age_seconds)}s ago` : "Offline"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: GPS Telemetry Device Ingestion Tester */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              GPS Ingest Endpoint Tester
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Submit simulated or hardware GPS telemetry packets to test server validation rules and speed limits.
          </p>

          {ingestStatus && (
            <div className={`p-3 rounded-xl text-xs font-semibold border flex items-start gap-2 ${
              ingestStatus.success
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {ingestStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
              <span>{ingestStatus.msg}</span>
            </div>
          )}

          <form onSubmit={handleTestIngest} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-500 mb-1">Target Bus</label>
              <select
                value={testBusId}
                onChange={(e) => setTestBusId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                {buses.map(b => (
                  <option key={b.bus_id} value={b.bus_id}>
                    {b.bus_name} ({b.bus_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={testLat}
                  onChange={(e) => setTestLat(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={testLng}
                  onChange={(e) => setTestLng(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Speed (km/h)</label>
                <input
                  type="number"
                  step="0.5"
                  value={testSpeed}
                  onChange={(e) => setTestSpeed(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  min={0}
                  max={140}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Heading (0-360°)</label>
                <input
                  type="number"
                  value={testHeading}
                  onChange={(e) => setTestHeading(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  min={0}
                  max={360}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Sending..." : "Post Telemetry Update"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

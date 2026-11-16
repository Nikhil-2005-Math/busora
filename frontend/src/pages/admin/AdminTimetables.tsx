import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Trip, Route, Bus } from "../../types";
import { 
  Calendar, Plus, Clock, Trash2, Search, 
  CheckCircle, XCircle, AlertCircle, ArrowRight 
} from "lucide-react";

export const AdminTimetables: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [tripNumber, setTripNumber] = useState("");
  const [routeId, setRouteId] = useState<number>(1);
  const [busId, setBusId] = useState<number>(1);
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("09:15");
  const [direction, setDirection] = useState("OUTBOUND");
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [tripsRes, routesRes, busesRes] = await Promise.all([
        api.getTrips(),
        api.getRoutes({ include_stops: true }),
        api.getBuses()
      ]);
      setTrips(tripsRes.trips || []);
      setRoutes(routesRes.routes || []);
      setBuses(busesRes.buses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setTripNumber(`TRIP-${Math.floor(100 + Math.random() * 900)}`);
    setRouteId(routes[0]?.id || 1);
    setBusId(buses[0]?.id || 1);
    setStartTime("09:00");
    setEndTime("09:45");
    setDirection("OUTBOUND");
    setModalError(null);
    setShowModal(true);
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    // Selected route stops for default stop times
    const route = routes.find(r => r.id === routeId);
    const stopTimesInput = (route?.stops || []).map((s, idx) => ({
      stop_id: s.stop_id,
      stop_sequence: s.stop_sequence,
      scheduled_arrival: startTime,
      scheduled_departure: startTime,
      distance_from_start_km: s.distance_from_start_km
    }));

    const payload = {
      trip_number: tripNumber,
      route_id: routeId,
      bus_id: busId,
      scheduled_start_time: startTime,
      scheduled_end_time: endTime,
      direction,
      stop_times: stopTimesInput
    };

    try {
      await api.createTrip(payload);
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to create trip schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelTrip = async (tripId: number) => {
    if (confirm("Are you sure you want to mark this trip as CANCELLED?")) {
      try {
        await api.cancelTrip(tripId);
        loadData();
      } catch (err) {
        alert("Failed to cancel trip");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Timetable & Trip Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish daily schedules, assign buses to routes, configure departure clocks, and cancel runs
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1565C0] text-white text-xs font-bold hover:bg-[#0D2B52] transition shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Scheduled Trip</span>
        </button>
      </div>

      {/* Trips Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Trip ID</th>
                <th className="py-3 px-4 font-bold">Assigned Route</th>
                <th className="py-3 px-4 font-bold">Assigned Bus</th>
                <th className="py-3 px-4 font-bold">Operator</th>
                <th className="py-3 px-4 font-bold">Departure → Arrival</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {trips.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{t.trip_number}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{t.route_name}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold">{t.bus_name}</span> ({t.bus_number})
                  </td>
                  <td className="py-3 px-4">{t.operator_name || "KSRTC"}</td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {t.scheduled_start_time} → {t.scheduled_end_time}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      t.status === 'SCHEDULED' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {t.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancelTrip(t.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition text-xs font-bold"
                        title="Cancel Trip"
                      >
                        Cancel Run
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Schedule New Bus Run
            </h2>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Trip Service Code</label>
                <input
                  type="text"
                  value={tripNumber}
                  onChange={(e) => setTripNumber(e.target.value)}
                  placeholder="e.g. TRIP-KLP-1130"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Assigned Route</label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.route_number}: {r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Assigned Vehicle (Bus)</label>
                <select
                  value={busId}
                  onChange={(e) => setBusId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.bus_number}) - {b.registration_number}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Start Departure Time (HH:MM)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Destination Arrival Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                >
                  {saving ? "Scheduling..." : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

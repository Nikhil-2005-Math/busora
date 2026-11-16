import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Route, BusStop } from "../../types";
import { 
  Compass, Plus, Edit, Search, ArrowRight, 
  MapPin, CheckCircle, AlertCircle, Sparkles, Layers 
} from "lucide-react";

export const AdminRoutes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [allStops, setAllStops] = useState<BusStop[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [routeNumber, setRouteNumber] = useState("");
  const [name, setName] = useState("");
  const [nameMl, setNameMl] = useState("");
  const [originStopId, setOriginStopId] = useState<number>(1);
  const [destStopId, setDestStopId] = useState<number>(4);
  const [operatorId, setOperatorId] = useState<number>(1);
  const [distanceKm, setDistanceKm] = useState(15.0);
  const [durationMins, setDurationMins] = useState(35);
  const [selectedStopIds, setSelectedStopIds] = useState<number[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [routesRes, stopsRes] = await Promise.all([
        api.getRoutes({ search, include_stops: true }),
        api.getStops()
      ]);
      setRoutes(routesRes.routes || []);
      setAllStops(stopsRes.stops || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const openCreateModal = () => {
    setEditingRoute(null);
    setRouteNumber(`R-${Math.floor(200 + Math.random() * 800)}`);
    setName("");
    setNameMl("");
    setOriginStopId(allStops[0]?.id || 1);
    setDestStopId(allStops[1]?.id || 2);
    setOperatorId(1);
    setDistanceKm(20.0);
    setDurationMins(45);
    setSelectedStopIds(allStops.slice(0, 3).map(s => s.id));
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (rt: Route) => {
    setEditingRoute(rt);
    setRouteNumber(rt.route_number);
    setName(rt.name);
    setNameMl(rt.name_ml || "");
    setOriginStopId(rt.origin_stop_id);
    setDestStopId(rt.destination_stop_id);
    setOperatorId(rt.operator_id || 1);
    setDistanceKm(rt.distance_km);
    setDurationMins(rt.estimated_duration_mins);
    setSelectedStopIds(rt.stops?.map(s => s.stop_id) || []);
    setModalError(null);
    setShowModal(true);
  };

  const handleToggleStop = (stopId: number) => {
    if (selectedStopIds.includes(stopId)) {
      setSelectedStopIds(selectedStopIds.filter(id => id !== stopId));
    } else {
      setSelectedStopIds([...selectedStopIds, stopId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    const payload = {
      route_number: routeNumber,
      name,
      name_ml: nameMl,
      origin_stop_id: originStopId,
      destination_stop_id: destStopId,
      operator_id: operatorId,
      distance_km: Number(distanceKm),
      estimated_duration_mins: Number(durationMins),
      stop_ids: selectedStopIds
    };

    try {
      if (editingRoute) {
        await api.updateRoute(editingRoute.id, payload);
      } else {
        await api.createRoute(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to save route");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Route Configurations & Stop Sequences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure origin/destination stages, sequence intermediate stops, and define travel time
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1565C0] text-white text-xs font-bold hover:bg-[#0D2B52] transition shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Route</span>
        </button>
      </div>

      {/* Routes List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Route Code</th>
                <th className="py-3 px-4 font-bold">Name & Sector</th>
                <th className="py-3 px-4 font-bold">Origin → Destination</th>
                <th className="py-3 px-4 font-bold">Distance & Est. Time</th>
                <th className="py-3 px-4 font-bold">Stops Assigned</th>
                <th className="py-3 px-4 font-bold">Operator</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {routes.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.route_number}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                    {r.name_ml && <div className="text-[11px] text-slate-500">{r.name_ml}</div>}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {r.origin_stop_name} → {r.destination_stop_name}
                  </td>
                  <td className="py-3 px-4">
                    {r.distance_km} km • ~{r.estimated_duration_mins} mins
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 text-[11px]">
                      {r.stops?.length || r.total_stops || 0} stops
                    </span>
                  </td>
                  <td className="py-3 px-4">{r.operator_name || "KSRTC"}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(r)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition"
                      title="Edit Route"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {editingRoute ? "Edit Route Sequence" : "Configure New Route"}
            </h2>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Route Number</label>
                  <input
                    type="text"
                    value={routeNumber}
                    onChange={(e) => setRouteNumber(e.target.value)}
                    placeholder="e.g. R-105"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Operating Agency</label>
                  <select
                    value={operatorId}
                    onChange={(e) => setOperatorId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value={1}>KSRTC</option>
                    <option value={2}>KSRTC-SWIFT</option>
                    <option value={3}>St. Mary's Transports</option>
                    <option value={4}>Blue Express Lines</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Route Name (English)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kallooppara — Thiruvalla"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Malayalam Name (മലയാളം)</label>
                  <input
                    type="text"
                    value={nameMl}
                    onChange={(e) => setNameMl(e.target.value)}
                    placeholder="e.g. കല്ലൂപ്പാറ — തിരുവല്ല"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Origin Terminal</label>
                  <select
                    value={originStopId}
                    onChange={(e) => setOriginStopId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    {allStops.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.district})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Destination Terminal</label>
                  <select
                    value={destStopId}
                    onChange={(e) => setDestStopId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    {allStops.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.district})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Total Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Estimated Duration (mins)</label>
                  <input
                    type="number"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              {/* Stop Selector checkboxes */}
              <div>
                <label className="block font-bold text-slate-500 mb-1">
                  Ordered Intermediate Stops ({selectedStopIds.length} Selected)
                </label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1">
                  {allStops.map(s => (
                    <label key={s.id} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStopIds.includes(s.id)}
                        onChange={() => handleToggleStop(s.id)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                      <span className="text-slate-400 text-[10px]">({s.district})</span>
                    </label>
                  ))}
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
                  {saving ? "Saving..." : "Save Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

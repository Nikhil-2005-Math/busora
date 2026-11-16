import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { BusStop } from "../../types";
import { 
  MapPin, Plus, Edit, Trash2, Search, Crosshair, 
  CheckCircle, AlertCircle, Sparkles 
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

// Map click listener component to pick coordinates
function LocationPicker({ position, onPick }: { position: [number, number]; onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
    },
  });
  return position ? <Marker position={position} /> : null;
}

export const AdminStops: React.FC = () => {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStop, setEditingStop] = useState<BusStop | null>(null);
  const [stopCode, setStopCode] = useState("");
  const [name, setName] = useState("");
  const [nameMl, setNameMl] = useState("");
  const [district, setDistrict] = useState("Pathanamthitta");
  const [locality, setLocality] = useState("");
  const [latitude, setLatitude] = useState(9.3850);
  const [longitude, setLongitude] = useState(76.5745);
  const [landmark, setLandmark] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadStops = async () => {
    try {
      const res = await api.getStops({ search });
      setStops(res.stops || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStops();
  }, [search]);

  const openCreateModal = () => {
    setEditingStop(null);
    setStopCode(`STP-${Math.floor(100 + Math.random() * 900)}`);
    setName("");
    setNameMl("");
    setDistrict("Pathanamthitta");
    setLocality("");
    setLatitude(9.3850);
    setLongitude(76.5745);
    setLandmark("");
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (st: BusStop) => {
    setEditingStop(st);
    setStopCode(st.stop_code);
    setName(st.name);
    setNameMl(st.name_ml || "");
    setDistrict(st.district);
    setLocality(st.locality);
    setLatitude(st.latitude);
    setLongitude(st.longitude);
    setLandmark(st.landmark || "");
    setModalError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    const payload = {
      stop_code: stopCode,
      name,
      name_ml: nameMl,
      district,
      locality,
      latitude: Number(latitude),
      longitude: Number(longitude),
      landmark
    };

    try {
      if (editingStop) {
        await api.updateStop(editingStop.id, payload);
      } else {
        await api.createStop(payload);
      }
      setShowModal(false);
      loadStops();
    } catch (err: any) {
      setModalError(err.message || "Failed to save stop record");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (stopId: number) => {
    if (confirm("Are you sure you want to deactivate this stop?")) {
      try {
        await api.deleteStop(stopId);
        loadStops();
      } catch (err) {
        alert("Failed to deactivate stop");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Bus Stops & Terminal Coordinates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain physical transit stages, localities, landmarks, and precise GPS lat/long
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1565C0] text-white text-xs font-bold hover:bg-[#0D2B52] transition shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stop</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by stop name, locality, or code..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {/* Stops Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Stop Code</th>
                <th className="py-3 px-4 font-bold">Name (English & Malayalam)</th>
                <th className="py-3 px-4 font-bold">District</th>
                <th className="py-3 px-4 font-bold">Locality</th>
                <th className="py-3 px-4 font-bold">Coordinates</th>
                <th className="py-3 px-4 font-bold">Landmark</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {stops.map(st => (
                <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{st.stop_code}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{st.name}</div>
                    {st.name_ml && <div className="text-[11px] text-slate-500">{st.name_ml}</div>}
                  </td>
                  <td className="py-3 px-4 font-semibold">{st.district}</td>
                  <td className="py-3 px-4">{st.locality}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {st.latitude.toFixed(4)}, {st.longitude.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{st.landmark || "—"}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(st)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition"
                      title="Edit Stop"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {st.is_active && (
                      <button
                        onClick={() => handleDeactivate(st.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="Deactivate Stop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal with Interactive Map Coordinates Picker */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {editingStop ? "Edit Stop Coordinates & Details" : "Register New Bus Stop"}
            </h2>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Stop Identifier Code</label>
                  <input
                    type="text"
                    value={stopCode}
                    onChange={(e) => setStopCode(e.target.value)}
                    placeholder="e.g. KLP-01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Pathanamthitta">Pathanamthitta</option>
                    <option value="Kottayam">Kottayam</option>
                    <option value="Ernakulam">Ernakulam</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Alappuzha">Alappuzha</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Stop Name (English)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kallooppara Junction"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Name in Malayalam (മലയാളം)</label>
                  <input
                    type="text"
                    value={nameMl}
                    onChange={(e) => setNameMl(e.target.value)}
                    placeholder="e.g. കല്ലൂപ്പാറ ജംഗ്ഷൻ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Locality / Town</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Mallappally"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Prominent Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Temple Road"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              {/* Map Coordinates Picker */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-500 flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                    <span>Click on map to populate Lat/Lng Coordinates:</span>
                  </label>
                  <span className="font-mono text-[11px] text-blue-600 font-bold">
                    {latitude}, {longitude}
                  </span>
                </div>
                
                <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={12}
                    className="w-full h-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker
                      position={[latitude, longitude]}
                      onPick={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                      }}
                    />
                  </MapContainer>
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
                  {saving ? "Saving..." : "Save Bus Stop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Bus, Operator } from "../../types";
import { KeralaBusSvg } from "../../assets/KeralaBusSvg";
import { 
  Bus as BusIcon, Plus, Edit, Trash2, Search, 
  CheckCircle, XCircle, AlertCircle, Sparkles 
} from "lucide-react";

export const AdminBuses: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [busName, setBusName] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [operatorId, setOperatorId] = useState<number>(1);
  const [category, setCategory] = useState("Fast Passenger");
  const [seatingCapacity, setSeatingCapacity] = useState(49);
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("/assets/kerala_bus.svg");
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadBuses = async () => {
    try {
      const res = await api.getBuses({ search });
      setBuses(res.buses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, [search]);

  const openCreateModal = () => {
    setEditingBus(null);
    setBusName("");
    setBusNumber("");
    setRegNumber("");
    setOperatorId(1);
    setCategory("Fast Passenger");
    setSeatingCapacity(49);
    setDescription("");
    setPhotoUrl("/assets/kerala_bus.svg");
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (bus: Bus) => {
    setEditingBus(bus);
    setBusName(bus.name);
    setBusNumber(bus.bus_number);
    setRegNumber(bus.registration_number);
    setOperatorId(bus.operator_id);
    setCategory(bus.category);
    setSeatingCapacity(bus.seating_capacity);
    setDescription(bus.description || "");
    setPhotoUrl(bus.photo_url || "/assets/kerala_bus.svg");
    setModalError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    const payload = {
      name: busName,
      bus_number: busNumber,
      registration_number: regNumber,
      operator_id: operatorId,
      category,
      seating_capacity: Number(seatingCapacity),
      description,
      photo_url: photoUrl
    };

    try {
      if (editingBus) {
        await api.updateBus(editingBus.id, payload);
      } else {
        await api.createBus(payload);
      }
      setShowModal(false);
      loadBuses();
    } catch (err: any) {
      setModalError(err.message || "Failed to save bus record");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (busId: number) => {
    if (confirm("Are you sure you want to deactivate this bus in the active fleet?")) {
      try {
        await api.deleteBus(busId);
        loadBuses();
      } catch (err) {
        alert("Failed to deactivate bus");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Bus Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register new transport vehicles, configure fleet identifiers, and assign operators
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1565C0] text-white text-xs font-bold hover:bg-[#0D2B52] transition shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bus</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, fleet code, or registration..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {/* Buses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Bus Identity</th>
                <th className="py-3 px-4 font-bold">Fleet ID</th>
                <th className="py-3 px-4 font-bold">Registration</th>
                <th className="py-3 px-4 font-bold">Operator</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Seats</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {buses.map(bus => (
                <tr key={bus.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 p-0.5 border border-blue-100 shrink-0">
                        <KeralaBusSvg className="w-full h-full" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{bus.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{bus.bus_number}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{bus.registration_number}</td>
                  <td className="py-3 px-4">{bus.operator_name || "KSRTC"}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-[11px]">
                      {bus.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">{bus.seating_capacity}</td>
                  <td className="py-3 px-4">
                    {bus.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(bus)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition"
                      title="Edit Bus"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {bus.is_active && (
                      <button
                        onClick={() => handleDeactivate(bus.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="Deactivate Bus"
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {editingBus ? "Edit Bus Details" : "Register New Bus"}
            </h2>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Bus Name</label>
                  <input
                    type="text"
                    value={busName}
                    onChange={(e) => setBusName(e.target.value)}
                    placeholder="e.g. Blue Express"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Fleet Code</label>
                  <input
                    type="text"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    placeholder="e.g. BX-101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Registration (Kerala Plate)</label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. KL-03-AQ-9988"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Operating Authority</label>
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
                  <label className="block font-bold text-slate-500 mb-1">Bus Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Ordinary">Ordinary / Town Service</option>
                    <option value="Fast Passenger">Fast Passenger (FP)</option>
                    <option value="Super Fast">Super Fast (SF)</option>
                    <option value="Swift Deluxe">KSRTC-SWIFT Deluxe</option>
                    <option value="Low Floor AC">Low Floor AC</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Passenger Capacity</label>
                  <input
                    type="number"
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    min={15}
                    max={80}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Description / Sector Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on bus maintenance, assigned route or permit..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
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
                  {saving ? "Saving..." : "Save Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

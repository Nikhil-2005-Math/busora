import React, { useState } from "react";
import { api } from "../../services/api";
import { 
  FileSpreadsheet, Download, Upload, CheckCircle2, 
  AlertCircle, ShieldAlert, Sparkles 
} from "lucide-react";

export const AdminDataIO: React.FC = () => {
  const [stopFile, setStopFile] = useState<File | null>(null);
  const [timetableFile, setTimetableFile] = useState<File | null>(null);
  
  const [importingStops, setImportingStops] = useState(false);
  const [importingTimetables, setImportingTimetables] = useState(false);
  
  const [stopsResult, setStopsResult] = useState<any>(null);
  const [timetableResult, setTimetableResult] = useState<any>(null);

  const handleImportStops = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopFile) return;

    if (!confirm(`Are you sure you want to import bus stops from "${stopFile.name}"? Existing codes will be updated.`)) {
      return;
    }

    setImportingStops(true);
    setStopsResult(null);
    try {
      const res = await api.importStopsCsv(stopFile);
      setStopsResult(res);
    } catch (err: any) {
      setStopsResult({ errors: [err.message || "Failed to process stops CSV file"] });
    } finally {
      setImportingStops(false);
    }
  };

  const handleImportTimetables = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timetableFile) return;

    if (!confirm(`Are you sure you want to import timetables from "${timetableFile.name}"?`)) {
      return;
    }

    setImportingTimetables(true);
    setTimetableResult(null);
    try {
      const res = await api.importTimetablesCsv(timetableFile);
      setTimetableResult(res);
    } catch (err: any) {
      setTimetableResult({ errors: [err.message || "Failed to process timetables CSV file"] });
    } finally {
      setImportingTimetables(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Batch Data Operations</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          CSV Import & Data Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Import bulk bus stops and scheduled timetable records via CSV with server-side row validation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Bus Stops CSV Import */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Import Bus Stops CSV
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk upload bus stops, coordinates, localities, and landmarks
              </p>
            </div>
            <a
              href="/api/data/template/stops"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-bold text-blue-600 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </a>
          </div>

          <form onSubmit={handleImportStops} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setStopFile(e.target.files?.[0] || null)}
                className="hidden"
                id="stop-csv-upload"
              />
              <label htmlFor="stop-csv-upload" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {stopFile ? stopFile.name : "Click to select Bus Stops CSV"}
                </div>
                <div className="text-[11px] text-slate-400">
                  Columns: stop_code, name, district, locality, latitude, longitude
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={!stopFile || importingStops}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{importingStops ? "Validating & Importing..." : "Execute Stops Import"}</span>
            </button>
          </form>

          {stopsResult && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{stopsResult.message || "Import completed"}</span>
              </div>
              {stopsResult.errors && stopsResult.errors.length > 0 && (
                <div className="text-red-600 space-y-1 pt-1 border-t border-slate-200">
                  <div className="font-bold">Errors found ({stopsResult.errors.length}):</div>
                  {stopsResult.errors.slice(0, 3).map((err: string, i: number) => (
                    <div key={i} className="text-[11px]">• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 2: Timetables CSV Import */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Import Timetables & Trips CSV
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk upload trip stop times, schedules, and bus assignments
              </p>
            </div>
            <a
              href="/api/data/template/timetables"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-bold text-blue-600 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </a>
          </div>

          <form onSubmit={handleImportTimetables} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setTimetableFile(e.target.files?.[0] || null)}
                className="hidden"
                id="timetable-csv-upload"
              />
              <label htmlFor="timetable-csv-upload" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {timetableFile ? timetableFile.name : "Click to select Timetables CSV"}
                </div>
                <div className="text-[11px] text-slate-400">
                  Columns: trip_number, route_number, stop_code, scheduled_arrival, scheduled_departure
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={!timetableFile || importingTimetables}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{importingTimetables ? "Validating & Importing..." : "Execute Timetable Import"}</span>
            </button>
          </form>

          {timetableResult && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{timetableResult.message || "Import completed"}</span>
              </div>
              {timetableResult.errors && timetableResult.errors.length > 0 && (
                <div className="text-red-600 space-y-1 pt-1 border-t border-slate-200">
                  <div className="font-bold">Errors found ({timetableResult.errors.length}):</div>
                  {timetableResult.errors.slice(0, 3).map((err: string, i: number) => (
                    <div key={i} className="text-[11px]">• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

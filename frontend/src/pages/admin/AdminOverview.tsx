import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { AdminMetrics, AuditLog } from "../../types";
import { 
  Bus, MapPin, Compass, Calendar, Wifi, 
  ShieldCheck, ArrowUpRight, Clock, Activity, CheckCircle2 
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export const AdminOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [operators, setOperators] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.getAdminOverview();
        setMetrics(res.metrics);
        setOperators(res.operators || []);
        setRecentActivity(res.recent_activity || []);
      } catch (err) {
        console.error("Overview error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Chart data for telemetry breakdown
  const telemetryData = [
    { name: "Live GPS", value: metrics?.reporting_live || 0, color: "#16A34A" },
    { name: "Stale Tracking", value: metrics?.reporting_stale || 0, color: "#F59E0B" },
    { name: "Offline / Depoted", value: metrics?.reporting_offline || 0, color: "#64748B" },
  ];

  const operatorChartData = operators.map(op => ({
    name: op.code,
    buses: op.buses_count
  }));

  return (
    <div className="space-y-8">
      {/* Overview Title Banner */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
          <Activity className="w-3.5 h-3.5" />
          <span>Kerala Operations Command</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Transit System Overview
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          High-level metrics across registered fleets, route networks, physical bus stops, and telemetry health
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Buses</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {metrics?.total_buses || 0}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">
              {metrics?.active_buses || 0} Active in Fleet
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
            <Bus className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kerala Routes</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {metrics?.total_routes || 0}
            </div>
            <div className="text-[11px] font-semibold text-blue-600 mt-1">
              {metrics?.active_routes || 0} Configured Active
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bus Stops</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {metrics?.total_stops || 0}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">
              {metrics?.active_stops || 0} Geocoded Terminals
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Daily Trips</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {metrics?.active_trips || 0}
            </div>
            <div className="text-[11px] font-semibold text-purple-600 mt-1">
              Scheduled Timetables
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Chart: Fleet allocation by operator */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Buses by Operating Authority
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operatorChartData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", border: "none", color: "#FFF" }}
                />
                <Bar dataKey="buses" fill="#1565C0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Telemetry Health */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Telemetry & Reporting Status
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={telemetryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {telemetryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", border: "none", color: "#FFF" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {telemetryData.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{t.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{t.value} buses</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Administrative Audit Trail */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Recent Administrative Actions (Audit Trail)</span>
          </h3>
          <span className="text-xs text-slate-400">Chronological System Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-bold">Action</th>
                <th className="pb-3 font-bold">Entity</th>
                <th className="pb-3 font-bold">Details</th>
                <th className="pb-3 font-bold">Administrator</th>
                <th className="pb-3 font-bold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {recentActivity.slice(0, 8).map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-bold">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">{log.entity_type}</td>
                  <td className="py-3 max-w-xs truncate">{log.details}</td>
                  <td className="py-3 text-slate-500">{log.user_email}</td>
                  <td className="py-3 text-right text-slate-400 font-mono text-[11px]">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "--:--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { BusoraLogo } from "../components/common/BusoraLogo";
import { KeralaBusSvg } from "../assets/KeralaBusSvg";
import { ShieldCheck, Compass, MapPin, Clock, Server, Lock, Cpu, Globe } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <BusoraLogo size="xl" showTagline={true} />
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-6">
          Every Bus. Every Stop. Every Minute.
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          BUSORA is an advanced transit intelligence and timetable tracking architecture engineered specifically for the public transport network of Kerala, India. Connecting KSRTC, KSRTC-SWIFT, and private stage carriage fleets into a unified real-time commuter experience.
        </p>
      </div>

      {/* Bus Graphic */}
      <div className="max-w-md mx-auto p-4 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
        <KeralaBusSvg className="w-full h-auto drop-shadow-md" />
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Accurate Arrival Estimation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Distinguishes strictly between verified scheduled timetables, simulated demonstration positions, and hardware GPS telemetry with intelligent stale-data suppression.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Open Route Geometries</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Uses high-fidelity Leaflet OpenStreetMap layers mapping out Kerala's state highways, MC Road (SH 1), and National Highway 66/544 corridors with intermediate stops.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Robust Security & Privacy</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Secure salted password hashing, JWT administrative authorization, audit trails, and privacy protection with no personally identifiable driver tracking.
          </p>
        </div>
      </div>

      {/* Technology Stack Specifications */}
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span>Technology Stack</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Frontend</span>
            React 19 + TypeScript + Vite
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Styling & UI</span>
            Tailwind CSS v4 + Framer Motion
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Backend</span>
            Python Flask REST API
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Database</span>
            SQLite (Dev) / MySQL (Prod)
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Maps</span>
            Leaflet + OpenStreetMap
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Telemetry</span>
            Real-time GPS + Polling Engine
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Security</span>
            JWT Auth + Audit Trails
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Localization</span>
            English & Malayalam (മലയാളം)
          </div>
        </div>
      </div>
    </div>
  );
};

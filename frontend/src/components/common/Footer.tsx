import React from "react";
import { Link } from "react-router-dom";
import { BusoraLogo } from "./BusoraLogo";
import { ShieldCheck, Heart, AlertCircle, Compass, MapPin, Bus } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <BusoraLogo size="md" showTagline={true} />
            <p className="text-xs text-slate-500 leading-relaxed">
              Kerala's next-generation smart bus arrival, departure, timetable management, and live transit network.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Network Active: Kerala State Feed</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/find-bus" className="hover:text-[#1565C0] flex items-center gap-1.5 transition">
                  <Bus className="w-3.5 h-3.5" /> Find a Bus
                </Link>
              </li>
              <li>
                <Link to="/routes" className="hover:text-[#1565C0] flex items-center gap-1.5 transition">
                  <Compass className="w-3.5 h-3.5" /> Route Explorer
                </Link>
              </li>
              <li>
                <Link to="/stops" className="hover:text-[#1565C0] flex items-center gap-1.5 transition">
                  <MapPin className="w-3.5 h-3.5" /> Bus Stops Directory
                </Link>
              </li>
              <li>
                <Link to="/live-map" className="hover:text-[#1565C0] flex items-center gap-1.5 transition">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1"></span> Live GPS Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Sample Kerala Routes */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Sample Kerala Sectors
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>• Kallooppara ⇄ Thiruvalla (Pathanamthitta)</li>
              <li>• Thiruvalla ⇄ Changanassery (MC Road)</li>
              <li>• Kottayam ⇄ Thiruvalla</li>
              <li>• Kochi (Vyttila) ⇄ Thrissur (Sakthan)</li>
              <li>• Malabar & Travancore Express Corridors</li>
            </ul>
          </div>

          {/* Compliance & Administration */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              System Administration
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Authorized municipal transport officers, fleet coordinators, and depot controllers can access the portal.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-[#1565C0] text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>Admin Authentication</span>
            </Link>
          </div>
        </div>

        {/* Demonstration Disclaimer Alert */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 mb-8">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Demonstration Notice: </span>
            This application is initialized with verified Kerala sample routes (Kallooppara, Thiruvalla, Kottayam, Kochi, Thrissur) and simulated telemetry for evaluation. Live telemetry is marked accordingly and never fabricated as verified tracking.
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BUSORA Kerala. "Every Bus. Every Stop. Every Minute."</p>
          <div className="flex items-center gap-1">
            <span>Built with care for Kerala Transit</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

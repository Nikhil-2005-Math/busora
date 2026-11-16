import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BusoraLogo } from "../../components/common/BusoraLogo";
import { 
  LayoutDashboard, Bus, MapPin, Compass, Calendar, 
  Wifi, FileSpreadsheet, LogOut, ArrowLeft, ShieldCheck 
} from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Bus Fleet Management", path: "/admin/buses", icon: Bus },
    { name: "Bus Stops & Coordinates", path: "/admin/stops", icon: MapPin },
    { name: "Route Configurations", path: "/admin/routes", icon: Compass },
    { name: "Timetables & Trips", path: "/admin/timetables", icon: Calendar },
    { name: "GPS Tracking Monitor", path: "/admin/gps", icon: Wifi },
    { name: "CSV Data & Audit Logs", path: "/admin/data", icon: FileSpreadsheet },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <ShieldCheck className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Session Required</h2>
        <p className="text-xs text-slate-500">Please authenticate with administrator credentials to access this portal.</p>
        <Link to="/admin/login" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">
          Go to Admin Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <BusoraLogo size="sm" showTagline={false} />
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Admin
            </span>
          </div>

          <nav className="space-y-1 text-xs font-bold">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                    active
                      ? "bg-[#1565C0] text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="px-2">
            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {user?.full_name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Portal</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

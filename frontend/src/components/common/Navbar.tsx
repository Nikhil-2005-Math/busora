import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BusoraLogo } from "./BusoraLogo";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { 
  Bus, MapPin, Compass, Navigation, Info, ShieldCheck, 
  Menu, X, Globe, Sun, Moon, Sparkles, LogOut 
} from "lucide-react";

interface NavbarProps {
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReplayIntro }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { name: t("nav_home"), path: "/", icon: Bus },
    { name: t("nav_find_bus"), path: "/find-bus", icon: Navigation },
    { name: t("nav_routes"), path: "/routes", icon: Compass },
    { name: t("nav_stops"), path: "/stops", icon: MapPin },
    { name: t("nav_live_map"), path: "/live-map", icon: MapPin, highlight: true },
    { name: t("nav_about"), path: "/about", icon: Info },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <BusoraLogo size="md" showTagline={false} theme={theme} />
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-[#EAF4FF] dark:bg-blue-950/60 text-[#1565C0] dark:text-blue-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-[#1565C0] dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  } ${item.highlight ? "border border-blue-200/60 dark:border-blue-900" : ""}`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#1565C0]" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.name}</span>
                  {item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Tools & Admin / Language / Theme */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Replay Intro Button */}
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              title="Replay Opening Bus Animation"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#1565C0] hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden xl:inline">Intro</span>
            </button>
          )}

          {/* Language Toggle (EN / മലയാളം) */}
          <button
            onClick={() => setLanguage(language === "en" ? "ml" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[#1565C0] transition"
          >
            <Globe className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>{language === "en" ? "മലയാളം" : "English"}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#1565C0] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Admin Portal Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1565C0] text-white text-xs font-bold shadow-sm hover:bg-[#0D2B52] transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin: {user?.full_name?.split(" ")[0]}</span>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-[#1565C0] text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#1565C0] transition ml-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setLanguage(language === "en" ? "ml" : "en")}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold"
          >
            {language === "en" ? "മലയാളം" : "EN"}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  active
                    ? "bg-[#EAF4FF] text-[#1565C0] dark:bg-blue-950 dark:text-blue-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-[#1565C0]" : "text-slate-400"}`} />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold ml-auto">
                    LIVE
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {isAuthenticated ? (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1565C0] text-white text-xs font-bold"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

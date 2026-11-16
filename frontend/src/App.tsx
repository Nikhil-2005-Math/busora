import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";

import { AnimatedSplashScreen } from "./components/intro/AnimatedSplashScreen";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";

import { HomePage } from "./pages/HomePage";
import { FindBusPage } from "./pages/FindBusPage";
import { RoutesPage } from "./pages/RoutesPage";
import { RouteDetailPage } from "./pages/RouteDetailPage";
import { StopsPage } from "./pages/StopsPage";
import { StopDetailPage } from "./pages/StopDetailPage";
import { LiveMapPage } from "./pages/LiveMapPage";
import { AboutPage } from "./pages/AboutPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";

import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminBuses } from "./pages/admin/AdminBuses";
import { AdminStops } from "./pages/admin/AdminStops";
import { AdminRoutes } from "./pages/admin/AdminRoutes";
import { AdminTimetables } from "./pages/admin/AdminTimetables";
import { AdminGPS } from "./pages/admin/AdminGPS";
import { AdminDataIO } from "./pages/admin/AdminDataIO";

function AppContent() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin") && location.pathname !== "/admin/login";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Animated Opening Screen */}
      {showSplash && (
        <AnimatedSplashScreen
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Main Commuter Navigation Bar (Hidden when inside full admin layout for focused experience) */}
      {!isAdminPath && (
        <Navbar onReplayIntro={() => setShowSplash(true)} />
      )}

      {/* Application Routing Canvas */}
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/find-bus" element={<FindBusPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/:id" element={<RouteDetailPage />} />
          <Route path="/stops" element={<StopsPage />} />
          <Route path="/stops/:id" element={<StopDetailPage />} />
          <Route path="/live-map" element={<LiveMapPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Nested Management Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="buses" element={<AdminBuses />} />
            <Route path="stops" element={<AdminStops />} />
            <Route path="routes" element={<AdminRoutes />} />
            <Route path="timetables" element={<AdminTimetables />} />
            <Route path="gps" element={<AdminGPS />} />
            <Route path="data" element={<AdminDataIO />} />
          </Route>
        </Routes>
      </div>

      {/* Footer */}
      {!isAdminPath && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

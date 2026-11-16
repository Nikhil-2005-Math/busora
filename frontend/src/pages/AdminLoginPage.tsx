import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { BusoraLogo } from "../components/common/BusoraLogo";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState("admin@busora.kerala.gov.in");
  const [password, setPassword] = useState("Admin@Busora2026");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      login(res.token, res.user);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid administrative credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BusoraLogo size="lg" showTagline={false} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Transport Administration Portal</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Administrator Login
          </h2>
          <p className="text-xs text-slate-500">
            Secure authentication for municipal transit controllers and fleet managers
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Credentials Helper Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>Pre-Configured Demonstration Admin:</span>
          </div>
          <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400">admin@busora.kerala.gov.in</div>
          <div className="font-mono text-[11px] text-slate-500">Admin@Busora2026</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1565C0] to-[#0D2B52] hover:from-[#1E88E5] hover:to-[#1565C0] text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? "Authenticating..." : "Authorize & Sign In"}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Commuter Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

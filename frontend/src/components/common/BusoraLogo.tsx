import React from "react";
import { Link } from "react-router-dom";

interface BusoraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  clickable?: boolean;
  theme?: "light" | "dark";
}

export const BusoraLogo: React.FC<BusoraLogoProps> = ({
  size = "md",
  showTagline = false,
  clickable = true,
  theme = "light"
}) => {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-5xl"
  };

  const content = (
    <div className="flex items-center gap-3 select-none group">
      {/* Modern Vector Emblem */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E88E5] via-[#1565C0] to-[#0D2B52] shadow-md shadow-blue-500/20 text-white p-2 transition-transform duration-300 group-hover:scale-105`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Subtle Route Line with 2 Nodes */}
          <path d="M 6 34 Q 16 30, 24 35 T 34 33" stroke="#93C5FD" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="6" cy="34" r="2" fill="#FDE047" />
          <circle cx="34" cy="33" r="2" fill="#4ADE80" />
          {/* Bus Silhouette */}
          <rect x="8" y="10" width="24" height="18" rx="4" fill="white" />
          {/* Front Windshield */}
          <rect x="11" y="13" width="18" height="6" rx="2" fill="#0D2B52" />
          {/* Headlights */}
          <circle cx="12" cy="24" r="1.5" fill="#F59E0B" />
          <circle cx="28" cy="24" r="1.5" fill="#F59E0B" />
          {/* Grille */}
          <line x1="16" y1="24" x2="24" y2="24" stroke="#0D2B52" strokeWidth="1.5" strokeLinecap="round" />
          {/* Wheels */}
          <circle cx="13" cy="28" r="3" fill="#0F172A" />
          <circle cx="27" cy="28" r="3" fill="#0F172A" />
          {/* Location Pin Accent at top right */}
          <path d="M 28 4 C 26 4, 24.5 5.5, 24.5 7.5 C 24.5 10, 28 13, 28 13 C 28 13, 31.5 10, 31.5 7.5 C 31.5 5.5, 30 4, 28 4 Z" fill="#EF4444" />
          <circle cx="28" cy="7.5" r="1" fill="white" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={`font-black tracking-tight ${textSizes[size]} ${theme === 'dark' ? 'text-white' : 'text-[#0D2B52]'}`}>
            BUS<span className="text-[#1565C0]">ORA</span>
          </span>
          <span className="ml-1 w-2 h-2 rounded-full bg-[#1565C0] inline-block animate-pulse"></span>
        </div>
        {showTagline && (
          <span className={`text-[11px] font-semibold tracking-wide uppercase ${theme === 'dark' ? 'text-blue-200' : 'text-slate-500'}`}>
            Every Bus. Every Stop. Every Minute.
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return <Link to="/" className="inline-block outline-none">{content}</Link>;
  }

  return content;
};

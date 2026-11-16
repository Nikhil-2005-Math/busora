import React from "react";

interface KeralaBusSvgProps {
  className?: string;
  isDriving?: boolean;
}

export const KeralaBusSvg: React.FC<KeralaBusSvgProps> = ({ className = "w-full h-auto", isDriving = false }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 320"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="busBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E88E5" />
          <stop offset="60%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#0D2B52" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#0284C7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="60%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <filter id="busShadow" x="-5%" y="-5%" width="115%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#0D2B52" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="400" cy="275" rx="360" ry="14" fill="#0F172A" opacity="0.25" />

      {/* Bus Body */}
      <g filter="url(#busShadow)">
        {/* Roof AC Unit */}
        <rect x="240" y="32" width="220" height="18" rx="8" fill="url(#roofGrad)" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="280" y1="36" x2="280" y2="46" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        <line x1="310" y1="36" x2="310" y2="46" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        <line x1="340" y1="36" x2="340" y2="46" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        <line x1="370" y1="36" x2="370" y2="46" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        <line x1="400" y1="36" x2="400" y2="46" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

        {/* Outer Hull */}
        <path
          d="M 60 70 C 60 55, 75 48, 100 48 L 660 48 C 710 48, 745 75, 755 125 L 760 195 C 762 225, 750 245, 725 245 L 60 245 C 45 245, 45 220, 45 190 L 45 90 C 45 75, 52 70, 60 70 Z"
          fill="url(#busBodyGrad)"
          stroke="#0D2B52"
          strokeWidth="3"
        />

        {/* Roof White Band */}
        <path
          d="M 60 70 C 60 55, 75 48, 100 48 L 660 48 C 695 48, 725 65, 735 95 L 50 95 C 48 85, 52 75, 60 70 Z"
          fill="url(#roofGrad)"
        />

        {/* Traditional Kerala Public Transport Swoosh Striping */}
        <path d="M 45 195 Q 260 220, 480 185 T 755 180 L 758 198 Q 500 238, 260 205 L 45 210 Z" fill="#FFFFFF" opacity="0.9" />
        <path d="M 45 212 Q 280 236, 510 200 T 750 198 L 748 206 Q 510 246, 270 218 L 45 220 Z" fill="#F59E0B" />

        {/* Logo Text on Side */}
        <text x="320" y="215" fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="900" fill="#FFFFFF" letterSpacing="4">BUSORA</text>
        <text x="440" y="215" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#E2E8F0" letterSpacing="1">KERALA TRANSIT</text>

        {/* Windows */}
        <rect x="70" y="98" width="55" height="60" rx="8" fill="url(#glassGrad)" stroke="#0F172A" strokeWidth="2" />
        <rect x="135" y="98" width="75" height="60" rx="8" fill="url(#glassGrad)" stroke="#0F172A" strokeWidth="2" />
        <rect x="220" y="98" width="75" height="60" rx="8" fill="url(#glassGrad)" stroke="#0F172A" strokeWidth="2" />
        <rect x="305" y="98" width="75" height="60" rx="8" fill="url(#glassGrad)" stroke="#0F172A" strokeWidth="2" />
        <rect x="390" y="98" width="75" height="60" rx="8" fill="url(#glassGrad)" stroke="#0F172A" strokeWidth="2" />
        <rect x="475" y="98" width="75" height="60" rx="8" fill="url(#glassGrad)" stroke="#0F172A" strokeWidth="2" />
        <rect x="560" y="98" width="75" height="60" rx="8" fill="url(#glassGrad)" stroke="#0F172A" strokeWidth="2" />

        {/* Window Glare */}
        <path d="M 72 108 L 633 108" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />

        {/* Front Passenger Door */}
        <rect x="645" y="96" width="38" height="142" rx="6" fill="#0F172A" opacity="0.3" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="649" y="100" width="30" height="58" rx="4" fill="url(#glassGrad)" />
        <rect x="649" y="166" width="30" height="68" rx="4" fill="url(#glassGrad)" />
        <line x1="664" y1="96" x2="664" y2="238" stroke="#CBD5E1" strokeWidth="2" />

        {/* Driver Windshield */}
        <path d="M 690 95 L 735 95 C 745 110, 752 135, 755 160 L 690 160 Z" fill="url(#glassGrad)" stroke="#0F172A" strokeWidth="2" />

        {/* Mirror */}
        <path d="M 728 85 Q 755 75, 765 105 L 758 120" fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
        <rect x="758" y="95" width="10" height="26" rx="4" fill="#0F172A" />

        {/* Destination Sign */}
        <rect x="668" y="65" width="75" height="22" rx="4" fill="#09090B" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="705" y="80" fontFamily="system-ui, monospace" fontSize="10" fontWeight="bold" fill="#F59E0B" textAnchor="middle">തിരുവനന്തപുരം</text>

        {/* Headlight & Indicators */}
        <path d="M 750 200 C 758 200, 762 208, 762 220 L 744 220 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
        <circle cx="754" cy="210" r="4" fill="#FFFFFF" />
        <rect x="742" y="222" width="14" height="6" rx="2" fill="#F59E0B" />
        <path d="M 715 235 L 758 235 C 758 245, 750 250, 735 250 L 715 250 Z" fill="#94A3B8" />

        {/* Wheel Wells */}
        <path d="M 120 245 A 50 50 0 0 1 230 245 Z" fill="#0F172A" />
        <path d="M 525 245 A 50 50 0 0 1 635 245 Z" fill="#0F172A" />

        {/* Rear Wheel */}
        <g transform="translate(175, 245)">
          <g className={isDriving ? "animate-spin" : ""} style={{ transformOrigin: "0px 0px", animationDuration: "1s" }}>
            <circle cx="0" cy="0" r="45" fill="url(#wheelGrad)" stroke="#1E293B" strokeWidth="3" />
            <circle cx="0" cy="0" r="28" fill="url(#rimGrad)" stroke="#475569" strokeWidth="2" />
            <circle cx="0" cy="0" r="10" fill="#0F172A" />
            <line x1="0" y1="-25" x2="0" y2="25" stroke="#64748B" strokeWidth="3" />
            <line x1="-25" y1="0" x2="25" y2="0" stroke="#64748B" strokeWidth="3" />
            <line x1="-18" y1="-18" x2="18" y2="18" stroke="#64748B" strokeWidth="2.5" />
            <line x1="-18" y1="18" x2="18" y2="-18" stroke="#64748B" strokeWidth="2.5" />
          </g>
        </g>

        {/* Front Wheel */}
        <g transform="translate(580, 245)">
          <g className={isDriving ? "animate-spin" : ""} style={{ transformOrigin: "0px 0px", animationDuration: "1s" }}>
            <circle cx="0" cy="0" r="45" fill="url(#wheelGrad)" stroke="#1E293B" strokeWidth="3" />
            <circle cx="0" cy="0" r="28" fill="url(#rimGrad)" stroke="#475569" strokeWidth="2" />
            <circle cx="0" cy="0" r="10" fill="#0F172A" />
            <line x1="0" y1="-25" x2="0" y2="25" stroke="#64748B" strokeWidth="3" />
            <line x1="-25" y1="0" x2="25" y2="0" stroke="#64748B" strokeWidth="3" />
            <line x1="-18" y1="-18" x2="18" y2="18" stroke="#64748B" strokeWidth="2.5" />
            <line x1="-18" y1="18" x2="18" y2="-18" stroke="#64748B" strokeWidth="2.5" />
          </g>
        </g>
      </g>
    </svg>
  );
};

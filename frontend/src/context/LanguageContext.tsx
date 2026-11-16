import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "ml";

interface Translations {
  [key: string]: {
    en: string;
    ml: string;
  };
}

const translations: Translations = {
  // Navigation
  nav_home: { en: "Home", ml: "ഹോം" },
  nav_find_bus: { en: "Find a Bus", ml: "ബസ്സ് തിരയുക" },
  nav_routes: { en: "Routes", ml: "റൂട്ടുകൾ" },
  nav_stops: { en: "Bus Stops", ml: "സ്റ്റോപ്പുകൾ" },
  nav_live_map: { en: "Live Map", ml: "ലൈവ് മാപ്പ്" },
  nav_about: { en: "About", ml: "വിവരങ്ങൾ" },
  nav_admin_login: { en: "Admin Portal", ml: "അഡ്മിൻ ലോഗിൻ" },
  
  // Hero
  hero_title: { en: "Your Next Bus, Without the Guesswork.", ml: "ഇനി ബസ്സിനായി കാത്തിരുന്ന് സമയം കളയേണ്ടതില്ല." },
  hero_subtitle: { en: "Find bus timings, explore routes, and plan your journey across Kerala.", ml: "കേരളത്തിലെ എല്ലാ ബസ് സമയങ്ങളും റൂട്ടുകളും നിമിഷനേരം കൊണ്ട് കണ്ടെത്താം." },
  
  // Search
  from_label: { en: "Starting Location", ml: "പുറപ്പെടുന്ന സ്ഥലം" },
  to_label: { en: "Destination", ml: "എത്തിച്ചേരേണ്ട സ്ഥലം" },
  date_label: { en: "Journey Date", ml: "യാത്രാ തീയതി" },
  time_label: { en: "Departure After", ml: "സമയം" },
  search_btn: { en: "Search Buses", ml: "ബസുകൾ തിരയുക" },
  swap_btn: { en: "Swap", ml: "മാറ്റുക" },
  
  // Sections
  popular_routes: { en: "Popular Kerala Routes", ml: "പ്രധാന റൂട്ടുകൾ" },
  nearby_stops: { en: "Nearby Bus Stops", ml: "സമീപത്തെ സ്റ്റോപ്പുകൾ" },
  upcoming_buses: { en: "Upcoming Departures", ml: "അടുത്ത ബസുകൾ" },
  map_preview: { en: "Real-Time Kerala Transit Network", ml: "തത്സമയ കേരള ബസ് ശൃംഖല" },

  // Status
  status_on_time: { en: "On Time", ml: "കൃത്യസമയം" },
  status_scheduled: { en: "Scheduled", ml: "ഷെഡ്യൂൾ ചെയ്തത്" },
  status_simulated: { en: "Simulated Live Demo", ml: "ഡെമോ ലൈവ് സിമുലേഷൻ" },
  
  // Actions
  view_on_map: { en: "View on Map", ml: "മാപ്പിൽ കാണുക" },
  view_timetable: { en: "View Timetable", ml: "സമയപ്പട്ടിക" },
  live_gps: { en: "Live GPS", ml: "ലൈവ് ജി.പി.എസ്" },
  scheduled_arr: { en: "Scheduled Arrival", ml: "എത്തിച്ചേരുന്ന സമയം" },
  scheduled_dep: { en: "Scheduled Departure", ml: "പുറപ്പെടുന്ന സമയം" },
  estimated_dep: { en: "Estimated Arrival", ml: "പ്രതീക്ഷിക്കുന്ന സമയം" },
  no_buses_found: { en: "No buses found matching your search.", ml: "നിങ്ങൾ തിരഞ്ഞ ബസുകൾ കണ്ടെത്താനായില്ല." }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("busora_lang") as Language) || "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("busora_lang", lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key]["en"];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { defaultSiteSettings } from "@/configs/siteSettings";

const SiteSettingsContext = createContext(defaultSiteSettings);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSiteSettings);

  useEffect(() => {
    let controller;
    const loadSettings = async () => {
      controller?.abort();
      const requestController = new AbortController();
      controller = requestController;
      try {
        const res = await fetch("/api/settings", {
          cache: "no-store",
          signal: requestController.signal,
        });
        const data = await res.json();
        if (res.ok && data.success && !requestController.signal.aborted)
          setSettings(data.settings);
      } catch (error) {
        if (error.name !== "AbortError")
          console.error("Error fetching site settings:", error.message);
      }
    };
    loadSettings();
    window.addEventListener("focus", loadSettings);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", loadSettings);
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);

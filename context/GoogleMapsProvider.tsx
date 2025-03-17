"use client";
import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const GoogleMapsContext = createContext<{ isLoaded: boolean; loadError?: Error | undefined } | null>(null);

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    console.error("🚨 `useGoogleMaps()` must be used within `GoogleMapsProvider`.");
  }
  return context;
}

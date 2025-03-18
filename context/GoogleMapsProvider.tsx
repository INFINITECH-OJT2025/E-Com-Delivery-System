"use client";
import { ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// ✅ Consistent libraries array for all instances
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry"];

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY || "",
    libraries, // ✅ Ensure the same libraries are used everywhere
  });

  if (!isLoaded) return <p>Loading Google Maps...</p>;

  return <>{children}</>; // ✅ Now renders child components
};

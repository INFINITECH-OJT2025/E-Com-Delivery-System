"use client";
import { ReactNode, useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Spinner } from "@heroui/react";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// ✅ Consistent libraries array for all instances
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
  "geometry",
  "visualization",
];

const loadingMessages = [
  "📍 Finding your location...",
  "🗺️ Optimizing maps...",
  "🚀 Calibrating compass...",
  "📡 Connecting to satellites...",
  "🔍 Searching for nearby orders...",
  "🤖 Warming up the engine...",
];

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY || "",
    libraries,
  });

  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next =
        loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      setMessage(next);
    }, 1000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <Spinner size="lg" color="primary" />
        <p className="text-sm text-gray-600 mt-3">{message}</p>
      </div>
    );
  }

  return <>{children}</>;
};

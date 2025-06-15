"use client";
import { IoLocationSharp } from "react-icons/io5";
import { useState, useEffect } from "react";

export default function LocationBar() {
    const [location, setLocation] = useState("Fetching location...");

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        setLocation(data.display_name || "Unknown location");
                    } catch {
                        setLocation("Location not found");
                    }
                },
                () => setLocation("Location permission denied")
            );
        }
    }, []);

    return (
        <div className="w-full flex items-center px-4 py-3 cursor-pointer overflow-hidden">
            <IoLocationSharp className="text-pink-500 text-2xl flex-shrink-0"  />
            <p className="ml-2 text-base font-semibold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                {location}
            </p>
        </div>
    );
}

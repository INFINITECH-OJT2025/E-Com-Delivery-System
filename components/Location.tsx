"use client";
import { useState, useEffect } from "react";
import { IoLocationSharp } from "react-icons/io5";

export default function Location() {
    const [location, setLocation] = useState<string>("Fetching location...");

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
        } else {
            setLocation("Geolocation not supported");
        }
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm text-white">
            <IoLocationSharp className="text-pink-500" />
            <p>{location}</p>
        </div>
    );
}

"use client";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const BASE_URL = "https://maps.googleapis.com/maps/api";

export const googleMapsService = {
    /**
     * ✅ Reverse Geocoding: Get Address from Latitude & Longitude
     */
    async getAddressFromCoords(lat: number, lng: number) {
        try {
            const url = `${BASE_URL}/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
            console.log("Fetching address from:", url); // Debugging

            const res = await fetch(url);
            const data = await res.json();

            if (data.status !== "OK") {
                console.error("Google Maps API Error:", data.error_message);
                return null;
            }

            return data.results[0]?.formatted_address || "Unknown Address";
        } catch (error) {
            console.error("Error fetching address:", error);
            return null;
        }
    },

    /**
     * ✅ Get Distance & Duration Between Two Locations
     */
    async getDistance(origin: string, destination: string) {
        try {
            const url = `${BASE_URL}/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${API_KEY}`;
            console.log("Fetching distance from:", url); // Debugging

            const res = await fetch(url);
            const data = await res.json();

            if (data.status !== "OK") {
                console.error("Google Maps API Error:", data.error_message);
                return null;
            }

            return {
                distance: data.rows[0]?.elements[0]?.distance?.text || "Unknown",
                duration: data.rows[0]?.elements[0]?.duration?.text || "Unknown",
            };
        } catch (error) {
            console.error("Error fetching distance:", error);
            return null;
        }
    },

    /**
     * ✅ Get Autocomplete Search Results (Places API New)
     */
    async getAutocompleteResults(input: string, sessionToken?: string) {
        try {
            const token = sessionToken || crypto.randomUUID(); // Generate a session token
            const url = `${BASE_URL}/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${API_KEY}&types=geocode&sessiontoken=${token}`;
            console.log("Fetching autocomplete from:", url);

            const res = await fetch(url);
            const data = await res.json();

            if (data.status !== "OK") {
                console.error("Google Maps API Error:", data.error_message);
                return [];
            }

            return data.predictions || [];
        } catch (error) {
            console.error("Error fetching autocomplete results:", error);
            return [];
        }
    },
};

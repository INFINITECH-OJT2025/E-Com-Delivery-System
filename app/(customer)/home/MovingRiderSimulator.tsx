"use client";

import { useState, useEffect } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { Spinner } from "@heroui/react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const MovingRiderSimulation = () => {
    const [directions, setDirections] = useState<any>(null);
    const [riderPosition, setRiderPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [routePath, setRoutePath] = useState<any[]>([]);
    const [stepIndex, setStepIndex] = useState(0);

    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

    // 📍 Restaurant (Start)
    const restaurantLocation = { lat: 14.5578348, lng: 120.9878622 };
    
    // 🏠 Customer (End)
    const customerLocation = { lat: 14.5599435, lng: 121.0135214 };

    useEffect(() => {
        if (isLoaded) {
            fetchDirections();
        }
    }, [isLoaded]);

    const fetchDirections = () => {
        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
            {
                origin: restaurantLocation,
                destination: customerLocation,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    setDirections(result);

                    // Extract route path
                    const path = result.routes[0].overview_path.map((point) => ({
                        lat: point.lat(),
                        lng: point.lng(),
                    }));

                    setRoutePath(path);
                    setRiderPosition(path[0]); // Start rider at restaurant
                } else {
                    console.error("Failed to fetch directions", result);
                }
            }
        );
    };

    // 🚀 Simulate Rider Moving
    useEffect(() => {
        if (routePath.length > 0 && stepIndex < routePath.length - 1) {
            const interval = setInterval(() => {
                setStepIndex((prev) => prev + 1);
                setRiderPosition(routePath[stepIndex]);
            }, 2000); // Move every 2 sec

            return () => clearInterval(interval);
        }
    }, [routePath, stepIndex]);

    if (!isLoaded) return <div className="flex justify-center py-10"><Spinner /></div>;

    return (
        <GoogleMap
            mapContainerStyle={{ width: "100%", height: "70vh", borderRadius: "12px" }}
            center={riderPosition || restaurantLocation}
            zoom={15}
        >
            {/* 🏍️ Moving Rider Marker */}
            {riderPosition && (
                <Marker
                    position={riderPosition}
                    icon={{
                        url: "/icons/rider.png",
                        scaledSize: new google.maps.Size(40, 40),
                    }}
                />
            )}

            {/* 📍 Restaurant Marker */}
            <Marker
                position={restaurantLocation}
                label="Restaurant"
                icon={{
                    url: "/icons/store.png",
                    scaledSize: new google.maps.Size(35, 35),
                }}
            />

            {/* 🏠 Customer Marker */}
            <Marker
                position={customerLocation}
                label="Customer"
                icon={{
                    url: "/icons/store.png",
                    scaledSize: new google.maps.Size(35, 35),
                }}
            />

            {/* 🚗 Blue Route */}
            {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
    );
};

export default MovingRiderSimulation;

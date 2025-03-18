"use client";

import { useState, useEffect } from "react";
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { FaMapMarkerAlt } from "react-icons/fa";
import ActiveOrderFooter from "./ActiveOrderFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const UserOrderTracking = () => {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [directions, setDirections] = useState<any>(null);
    const [riderPosition, setRiderPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [routePath, setRoutePath] = useState<any[]>([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

    // 📍 Restaurant (Start)
    const restaurantLocation = { lat: 14.5578348, lng: 120.9878622 };

    // 🏠 Customer (End)
    const customerLocation = { lat: 14.5599435, lng: 121.0135214 };

    useEffect(() => {
        fetchCurrentOrder();
        const interval = setInterval(fetchCurrentOrder, 5000); // Poll every 5 sec
        return () => clearInterval(interval);
    }, []);

    const fetchCurrentOrder = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const res = await fetch(`${API_URL}/api/getCurrentOrder`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (data.status === "success" && data.data?.order_status === "out_for_delivery" && data.data?.delivery_status === "in_delivery") {
                setOrder(data.data);
                fetchDirections();
            } else {
                setOrder(null);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
        }
        setLoading(false);
    };

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

                    // Extract full route path
                    const path = result.routes[0].overview_path.map((point) => ({
                        lat: point.lat(),
                        lng: point.lng(),
                    }));

                    setRoutePath(path);
                    setRiderPosition(path[0]); // Start rider at restaurant
                    setStepIndex(0);
                    moveRiderAlongRoute(path); // Start moving the rider
                } else {
                    console.error("Failed to fetch directions", result);
                }
            }
        );
    };

    // 🚀 **Move Rider Along the Route Smoothly**
    const moveRiderAlongRoute = (path: any[]) => {
        let i = 0;

        const move = () => {
            if (i < path.length - 1) {
                setRiderPosition(path[i]);
                i++;

                setTimeout(() => {
                    requestAnimationFrame(move);
                }, 1000); // Rider moves every second (adjust for speed)
            }
        };

        requestAnimationFrame(move);
    };

    if (loading) return <div className="flex justify-center py-4"><Spinner /></div>;
    if (!order) return null;

    return (
        <>
            {/* Sticky Footer for Live Tracking */}
            <ActiveOrderFooter
                status="Rider is on the way"
                onClick={() => setModalOpen(true)}
            />

            {/* Full-Screen Google Maps Modal */}
            <Modal isOpen={modalOpen} onOpenChange={() => setModalOpen(false)} size="full">
                <ModalContent>
                    <ModalHeader className="flex items-center gap-2">
                        <FaMapMarkerAlt /> Live Rider Tracking - Order #{order?.order_id}
                    </ModalHeader>
                    <ModalBody className="p-0">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "70vh", borderRadius: "12px" }}
                                center={restaurantLocation} // Fixed view to avoid recentering
                                zoom={17} // Zoom in for a closer look
                                options={{ disableDefaultUI: true }} // Hide UI for cleaner look
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
                                        url: "/icons/home.png",
                                        scaledSize: new google.maps.Size(35, 35),
                                    }}
                                />

                                {/* 🚗 Blue Route */}
                                {directions && <DirectionsRenderer directions={directions} />}
                            </GoogleMap>
                        ) : (
                            <div className="flex justify-center items-center h-64">
                                <Spinner />
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="flat" onPress={() => setModalOpen(false)}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UserOrderTracking;

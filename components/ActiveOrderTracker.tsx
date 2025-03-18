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

    useEffect(() => {
        fetchCurrentOrder();
        const interval = setInterval(fetchCurrentOrder, 5000); // Poll every 5 sec
        return () => clearInterval(interval);
    }, []);

    const fetchCurrentOrder = async () => {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${API_URL}/api/getCurrentOrder`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.status === "success" && data.data.order_status === "out_for_delivery" && data.data.delivery_status === "in_delivery") {
            setOrder(data.data);
            fetchDirections(data.data);
        } else {
            setOrder(null);
        }
        setLoading(false);
    };

    const fetchDirections = async (orderData: any) => {
        if (!isLoaded || !orderData) return;

        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
            {
                origin: {
                    lat: parseFloat(orderData.restaurant.latitude),
                    lng: parseFloat(orderData.restaurant.longitude),
                },
                destination: {
                    lat: parseFloat(orderData.customer_address.latitude),
                    lng: parseFloat(orderData.customer_address.longitude),
                },
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
                    setRiderPosition(path[0]); // Rider starts at restaurant
                } else {
                    console.error("Failed to fetch directions", result);
                }
            }
        );
    };

    // 🚀 Simulate Rider Moving Along the Route
    useEffect(() => {
        if (routePath.length > 0 && stepIndex < routePath.length - 1) {
            const interval = setInterval(() => {
                setStepIndex((prev) => prev + 1);
                setRiderPosition(routePath[stepIndex]); // Update rider position
            }, 2000); // Move every 2 sec

            return () => clearInterval(interval);
        }
    }, [routePath, stepIndex]);

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
                        <FaMapMarkerAlt /> Live Rider Tracking - Order #{order.order_id}
                    </ModalHeader>
                    <ModalBody className="p-0">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "80vh" }}
                                center={riderPosition || {
                                    lat: parseFloat(order.restaurant.latitude),
                                    lng: parseFloat(order.restaurant.longitude),
                                }}
                                zoom={14}
                            >
                                {/* 🏍️ Rider Marker (Moving) */}
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
                                    position={{
                                        lat: parseFloat(order.restaurant.latitude),
                                        lng: parseFloat(order.restaurant.longitude),
                                    }}
                                    label="Restaurant"
                                    icon={{
                                        url: "/icons/store.png",
                                        scaledSize: new google.maps.Size(35, 35),
                                    }}
                                />

                                {/* 🏠 Customer Marker */}
                                <Marker
                                    position={{
                                        lat: parseFloat(order.customer_address.latitude),
                                        lng: parseFloat(order.customer_address.longitude),
                                    }}
                                    label="Customer"
                                    icon={{
                                        url: "/icons/home.png",
                                        scaledSize: new google.maps.Size(35, 35),
                                    }}
                                />

                                {/* 🚗 Show Blue Route */}
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

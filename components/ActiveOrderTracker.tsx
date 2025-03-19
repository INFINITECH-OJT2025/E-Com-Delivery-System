"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { FaMapMarkerAlt } from "react-icons/fa";
import ActiveOrderFooter from "./ActiveOrderFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const restaurantLocation = { lat: 14.5578348, lng: 120.9878622 };
const customerLocation = { lat: 14.5599435, lng: 121.0135214 };

const UserOrderTracking = () => {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [directions, setDirections] = useState<any>(null);
    const [riderPosition, setRiderPosition] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [riderAction, setRiderAction] = useState("Waiting");
    const [currentDirection, setCurrentDirection] = useState("unknown");
    const routePath = useRef<any[]>([]);
    const riderIndex = useRef(0);
    const riderMoving = useRef(false);
    const previousPosition = useRef<any>(null);

    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

    useEffect(() => {
        fetchCurrentOrder();
        const interval = setInterval(fetchCurrentOrder, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchCurrentOrder = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const res = await fetch(`${API_URL}/api/getCurrentOrder`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (
                data.status === "success" &&
                data.data?.order_status === "out_for_delivery" &&
                data.data?.delivery_status === "in_delivery"
            ) {
                setOrder(data.data);
            } else {
                setOrder(null);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isLoaded && order && !directions) {
            fetchDirections();
        }
    }, [isLoaded, order]);

    const fetchDirections = () => {
        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
            {
                origin: restaurantLocation,
                destination: customerLocation,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    setDirections(result);

                    routePath.current = result.routes[0].overview_path.map((point) => ({
                        lat: point.lat(),
                        lng: point.lng(),
                    }));

                    if (!riderMoving.current) {
                        riderIndex.current = 0;
                        riderMoving.current = true;
                        moveRiderSmoothly();
                    }
                } else {
                    console.error("Failed to fetch directions", result);
                }
            }
        );
    };

    const moveRiderSmoothly = () => {
        const move = () => {
            if (riderIndex.current < routePath.current.length) {
                const nextPosition = routePath.current[riderIndex.current];
                updateRiderAction(nextPosition);
                setRiderPosition(nextPosition);
                previousPosition.current = nextPosition;
                riderIndex.current += 1;
                setTimeout(() => requestAnimationFrame(move), 1000);
            }
        };
        requestAnimationFrame(move);
    };

    const updateRiderAction = (nextPos: any) => {
        if (!previousPosition.current) return;
        const dx = nextPos.lng - previousPosition.current.lng;
        const dy = nextPos.lat - previousPosition.current.lat;
        let direction = "right";
        if (Math.abs(dx) > Math.abs(dy)) direction = dx > 0 ? "right" : "left";
        else direction = dy > 0 ? "up" : "down";

        setCurrentDirection(direction);
        setRiderAction(`Rider moving ${direction}`);
    };

    const riderDirectionIcon = () => `/icons/rider-${currentDirection}.png`;

    if (loading) return <div className="flex justify-center py-4"><Spinner /></div>;
    if (!order) return null;

    return (
        <>
            <ActiveOrderFooter
                status={riderAction}
                onClick={() => setModalOpen(true)}
            />

            <Modal isOpen={modalOpen} onOpenChange={() => setModalOpen(false)} size="full">
                <ModalContent>
                    <ModalHeader className="flex items-center gap-2">
                        <FaMapMarkerAlt /> Live Rider Tracking - Order #{order?.order_id}
                    </ModalHeader>
                    <ModalBody className="p-0">
                        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow z-10">
                            <strong>Status:</strong> {riderAction} <br />
                            <strong>Debug Direction:</strong> {currentDirection}
                        </div>
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "70vh", borderRadius: "12px" }}
                                center={riderPosition || restaurantLocation}
                                zoom={17}
                                options={{ disableDefaultUI: true }}
                            >
                                {riderPosition && (
                                    <Marker
                                        position={riderPosition}
                                        icon={{ url: riderDirectionIcon(), scaledSize: new google.maps.Size(40, 40) }}
                                    />
                                )}
                                <Marker position={restaurantLocation} label="Restaurant" icon={{ url: "/icons/store.png", scaledSize: new google.maps.Size(35, 35) }} />
                                <Marker position={customerLocation} label="Customer" icon={{ url: "/icons/home.png", scaledSize: new google.maps.Size(35, 35) }} />
                                {directions && <DirectionsRenderer directions={directions} />}
                            </GoogleMap>
                        ) : <Spinner />}
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

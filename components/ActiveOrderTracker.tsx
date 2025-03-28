"use client";
//simularion.. all the needed api calls are here aswwll just use that in production
import { useState, useEffect, useRef } from "react";
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { FaMapMarkerAlt, FaMotorcycle } from "react-icons/fa";
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
    const [eta, setEta] = useState("");
    const [currentDirection, setCurrentDirection] = useState("right");
    const routePath = useRef<any[]>([]);
    const riderIndex = useRef(0);
    const riderMoving = useRef(false);
    const previousPosition = useRef<any>(null);

    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

    const previousOrderStatusRef = useRef<string | null>(null);
const previousDeliveryStatusRef = useRef<string | null>(null);
useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
  

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
  
          if (data.status === "success" && data.data) {
              const newOrder = data.data;
  
              // === Check for order_status notifications ===
              if (newOrder.order_status !== previousOrderStatusRef.current) {
                  previousOrderStatusRef.current = newOrder.order_status;
  
                  if (Notification.permission === "granted") {
                      let message = "";
  
                      switch (newOrder.order_status) {
                          case "pending":
                              message = "📦 Order received! We’ll start processing it.";
                              break;
                          case "confirmed":
                              message = "✅ Order confirmed by the restaurant.";
                              break;
                          case "preparing":
                              if (newOrder.delivery_status === "arrived_at_vendor") {
                                  message = "🏍️ Rider arrived at the restaurant!";
                              } else {
                                  message = "👨‍🍳 Your order is being prepared!";
                              }
                              break;
                          case "out_for_delivery":
                              message = "📦 Your order is out for delivery!";
                              break;
                      }
  
                      if (message) {
                          new Notification(`Order #${newOrder.order_id}`, {
                              body: message,
                              icon: "/images/delivery-panda.png",
                              tag: `order-${newOrder.order_id}-${Date.now()}`, // Ensure unique tag for each notification
                          });
                      }
                  }
              }
  
              // === Check for delivery_status notifications ===
              if (newOrder.delivery_status && newOrder.delivery_status !== previousDeliveryStatusRef.current) {
                  previousDeliveryStatusRef.current = newOrder.delivery_status;
  
                  if (Notification.permission === "granted") {
                      let message = "";
  
                      switch (newOrder.delivery_status) {
                          case "picked_up":
                              message = "🚴 Your rider has picked up the order!";
                              break;
                          case "in_delivery":
                              message = "📍 Your rider is coming to you!";
                              break;
                          case "arrived_at_customer":
                              message = "✅ Your rider has arrived!";
                              break;
                          case "delivered":
                              message = "🎉 Your order has been delivered!";
                              break;
                      }
  
                      if (message) {
                          new Notification(`Order #${newOrder.order_id}`, {
                              body: message,
                              icon: "/icons/rider-right.png",
                              tag: `delivery-${newOrder.order_id}-${Date.now()}`, // Ensure unique tag for each notification
                          });
                      }
                  }
              }
  
              if (newOrder.order_id === null || newOrder.order_status === null) {
                  setOrder(null);
              } else {
                  setOrder(newOrder);
              }
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
                        moveRiderSmoothly(result.routes[0].legs[0].duration.value);
                    }
                } else {
                    console.error("Failed to fetch directions", result);
                }
            }
        );
    };

    const moveRiderSmoothly = (initialDuration: number) => {
        const move = () => {
            if (riderIndex.current < routePath.current.length) {
                const nextPosition = routePath.current[riderIndex.current];
                updateETA(initialDuration, riderIndex.current, routePath.current.length);
                updateDirection(nextPosition);
                setRiderPosition(nextPosition);
                previousPosition.current = nextPosition;
                riderIndex.current += 1;
                setTimeout(() => requestAnimationFrame(move), 1000);
            }
        };
        requestAnimationFrame(move);
    };

    const updateETA = (initialDuration: number, currentStep: number, totalSteps: number) => {
        const remainingDuration = ((totalSteps - currentStep) / totalSteps) * initialDuration;
        const minutes = Math.ceil(remainingDuration / 60);
        setEta(`${minutes} min`);
    };

    const updateDirection = (nextPos: any) => {
        if (!previousPosition.current) return;
        const dx = nextPos.lng - previousPosition.current.lng;
        const dy = nextPos.lat - previousPosition.current.lat;
        if (Math.abs(dx) > Math.abs(dy)) {
            setCurrentDirection(dx > 0 ? "right" : "left");
        } else {
            setCurrentDirection(dy > 0 ? "up" : "down");
        }
    };

    // IMPORTANT: Icons change based on direction (up, down, left, right)
    const riderDirectionIcon = () => `/icons/rider-${currentDirection}.png`;

    if (loading) return <div className="flex justify-center py-4"><Spinner /></div>;
    if (!order) return null;
    const getOrderStatusMessage = () => {
      if (!order) return "";
  
      const { order_status, delivery_status } = order;
  
      switch (order_status) {
          case "pending":
              return " Order received! Waiting for restaurant to confirm...";
  
          case "confirmed":
              if (delivery_status === "assigned") {
                  return " Rider assigned. Waiting for pickup...";
              } else if (delivery_status === "arrived_at_vendor") {
                return " Rider arrived at the restaurant!";
            } 
              return " Restaurant confirmed. Preparing your order...";
  
          case "preparing":
              if (delivery_status === "arrived_at_vendor") {
                  return " Rider arrived at the restaurant!";
              } else if (delivery_status === "assigned") {
                  return " Rider assigned. Waiting for pickup...";
              } else {
                  return " Your order is being prepared!";
              }
  
          case "out_for_delivery":
              return ` Rider is heading towards your location (ETA: ${eta})`;
  
          default:
              return "";
      }
  };
  
  
    return (
        <>{order && (
          <ActiveOrderFooter
              status={getOrderStatusMessage()}
              onClick={() => {
                  if (order.order_status === "out_for_delivery") {
                      setModalOpen(true); // Only allow opening map when rider is on the way
                  }
              }}
          />
      )}
      

            <Modal isOpen={modalOpen} onOpenChange={() => setModalOpen(false)} size="full">
                <ModalContent>
                    <ModalHeader className="flex items-center gap-2 bg-primary text-white">
                        <FaMapMarkerAlt /> Live Rider Tracking - Order #{order?.order_id}
                    </ModalHeader>
                    <ModalBody className="p-0">
                        <div className="p-4 bg-white text-center font-semibold shadow-md flex gap-2 items-center justify-center text-primary">
                            <FaMotorcycle /> Rider is heading towards your location - ETA: {eta}
                        </div>
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "80vh", borderRadius: "12px" }}
                                center={riderPosition || restaurantLocation}
                                zoom={17}
                                options={{ disableDefaultUI: true }}
                            >
                                {riderPosition && <Marker position={riderPosition} icon={{ url: riderDirectionIcon(), scaledSize: new google.maps.Size(40, 40) }} />}
                                <Marker position={restaurantLocation} icon={{ url: "/icons/stores.png", scaledSize: new google.maps.Size(40, 40) }} />
                                <Marker position={customerLocation} icon={{ url: "/icons/location.gif", scaledSize: new google.maps.Size(40, 40) }} />
                                {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
                            </GoogleMap>
                        ) : <Spinner />}
                    </ModalBody>

                </ModalContent>
            </Modal>
        </>
    );
};

export default UserOrderTracking;
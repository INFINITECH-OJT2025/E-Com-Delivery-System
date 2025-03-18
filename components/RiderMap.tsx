"use client";
import { useState, useEffect } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { RiderOrderService } from "@/services/RiderOrderService";
import { useParams } from "next/navigation";
import { Button } from "@heroui/react";

const containerStyle = { width: "100%", height: "500px" };

const RiderMap = () => {
  const { orderId } = useParams(); // Get Order ID from URL
  const [order, setOrder] = useState(null);
  const [directions, setDirections] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await RiderOrderService.getOrderDetails(orderId);
        if (response.success && response.data) {
          setOrder({
            ...response.data,
            restaurant_lat: parseFloat(response.data.restaurant_lat),
            restaurant_lng: parseFloat(response.data.restaurant_lng),
            customer_lat: parseFloat(response.data.customer_lat),
            customer_lng: parseFloat(response.data.customer_lng),
          });
        } else {
          console.error("Invalid order data:", response);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };

    const storedLocation = localStorage.getItem("rider_location");
    if (storedLocation) {
      const parsedLocation = JSON.parse(storedLocation);
      setRiderLocation({
        lat: parseFloat(parsedLocation.lat),
        lng: parseFloat(parsedLocation.lng),
      });
    } else {
      console.warn("No rider location found in localStorage");
    }

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order || !riderLocation) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: riderLocation.lat, lng: riderLocation.lng },
        destination: { lat: order.customer_lat, lng: order.customer_lng },
        waypoints: [{ location: { lat: order.restaurant_lat, lng: order.restaurant_lng } }],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("Error fetching directions:", status);
        }
      }
    );
  }, [order, riderLocation]);

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  if (!isLoaded || !order || !riderLocation) {
    return <p>Loading map...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <GoogleMap mapContainerStyle={containerStyle} center={riderLocation} zoom={14}>
        {/* Rider Marker */}
        <Marker position={riderLocation} label="🏍️ Rider" />
        {/* Restaurant Marker */}
        <Marker position={{ lat: order.restaurant_lat, lng: order.restaurant_lng }} label="🍽️ Restaurant" />
        {/* Customer Marker */}
        <Marker position={{ lat: order.customer_lat, lng: order.customer_lng }} label="🏠 Customer" />
        {/* Route */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      <div className="flex gap-4">
        <Button variant="primary" onClick={() => openGoogleMaps(order.restaurant_lat, order.restaurant_lng)}>
          Navigate to Restaurant
        </Button>
        <Button variant="secondary" onClick={() => openGoogleMaps(order.customer_lat, order.customer_lng)}>
          Navigate to Customer
        </Button>
      </div>
    </div>
  );
};

export default RiderMap;

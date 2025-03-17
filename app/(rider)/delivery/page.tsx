"use client";
import { useEffect, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { Button, Spinner, addToast } from "@heroui/react";
import { IoLocationOutline } from "react-icons/io5";
import { RiderDashboardService } from "@/services/riderDashboardService";
import { RiderOrderService } from "@/services/RiderOrderService";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const mapContainerStyle = { width: "100%", height: "100vh" };
const defaultCenter = { lat: 14.5995, lng: 120.9842 }; // Default Manila

export default function RiderMapPage() {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_API_KEY || "" });
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [riderLocation, setRiderLocation] = useState(defaultCenter);
  const [orders, setOrders] = useState([]);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRiderLocation();
  }, []);

  // ✅ Load Rider's Last Saved Location or GPS
  const loadRiderLocation = () => {
    const savedLocation = localStorage.getItem("rider_location");
    if (savedLocation) {
      const { lat, lng } = JSON.parse(savedLocation);
      if (lat && lng) {
        setRiderLocation({ lat, lng });
        setMapCenter({ lat, lng });
        fetchOrders(lat, lng); // ✅ Fetch only ONCE here!
      } else {
        getCurrentLocation();
      }
    } else {
      getCurrentLocation();
    }
  };

  // ✅ Get Rider's Current Location (GPS)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRiderLocation({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });

          // ✅ Fetch Orders After Setting Location
          fetchOrders(latitude, longitude);
        },
        () => addToast({ title: "⚠️ Location Error", description: "Enable location to view nearby orders.", color: "danger" }),
        { enableHighAccuracy: true }
      );
    }
  };

  // ✅ Fetch Nearby & Assigned Orders
  const fetchOrders = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const [nearbyResponse, assignedResponse] = await Promise.all([
        RiderDashboardService.getNearbyOrders(lat, lng),
        RiderOrderService.getAssignedOrders(),
      ]);

      if (nearbyResponse.success && assignedResponse.success) {
        const allOrders = [...nearbyResponse.data, ...assignedResponse.data].map((order) => ({
          ...order,
          dropoffLat: parseFloat(order.customer_lat), // ✅ Convert to number
          dropoffLng: parseFloat(order.customer_lng), // ✅ Convert to number
          restaurantLat: parseFloat(order.restaurant_lat), // ✅ Convert to number
          restaurantLng: parseFloat(order.restaurant_lng), // ✅ Convert to number
        }));

        setOrders(allOrders);
        calculateRoute(allOrders);
      }
    } catch (error) {
      addToast({ title: "❌ Error", description: "Failed to fetch orders.", color: "danger" });
    }
    setLoading(false);
  };

  // ✅ Calculate Optimal Route for Deliveries
  const calculateRoute = (orders) => {
    if (!orders.length) return;

    const directionsService = new google.maps.DirectionsService();
    const waypoints = orders.map((order) => ({
      location: { lat: order.dropoffLat, lng: order.dropoffLng },
      stopover: true,
    }));

    directionsService.route(
      {
        origin: riderLocation,
        destination: waypoints.length > 1 ? waypoints[waypoints.length - 1].location : riderLocation,
        waypoints: waypoints.slice(0, -1),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("❌ Error fetching directions:", status);
        }
      }
    );
  };

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="relative w-full h-screen">
      {/* 📍 Google Map */}
      <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={14}>
        {/* Rider Marker */}
        <Marker position={riderLocation} icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} />

        {/* Order Markers */}
        {orders.map((order, index) => (
          <Marker
            key={index}
            position={{ lat: order.dropoffLat, lng: order.dropoffLng }}
            icon={{
              url:
                order.order_status === "confirmed"
                  ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        ))}

        {/* Route Renderer */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      {/* 📍 Controls */}
      <div className="absolute top-4 left-4 bg-white p-3 shadow-md rounded-lg">
        <Button className="flex items-center bg-primary text-white px-4 py-2" onClick={getCurrentLocation}>
          <IoLocationOutline className="mr-2" /> Refresh Location
        </Button>
      </div>

      {/* 🌀 Loading State */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80">
          <Spinner size="lg" color="primary" />
        </div>
      )}
    </div>
  );
}

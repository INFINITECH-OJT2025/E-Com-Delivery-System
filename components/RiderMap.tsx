"use client";
import { useEffect, useState } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { getOrders, getRiderLocation } from "@/services/orderService";
import { getDirections } from "@/services/googleMapsService";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 14.5995, lng: 120.9842 }; // Manila Default

export default function RiderMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY || "",
    libraries: ["places", "directions"],
  });

  const [riderLocation, setRiderLocation] = useState(defaultCenter);
  const [orders, setOrders] = useState([]);
  const [route, setRoute] = useState([]);

  useEffect(() => {
    fetchRiderLocation();
    fetchOrders();
  }, []);

  const fetchRiderLocation = async () => {
    const location = await getRiderLocation();
    if (location) setRiderLocation(location);
  };

  const fetchOrders = async () => {
    const ordersData = await getOrders();
    setOrders(ordersData);
    calculateRoute(ordersData);
  };

  const calculateRoute = async (orders) => {
    if (orders.length > 0) {
      const waypoints = orders.map((order) => ({
        location: { lat: order.dropoffLat, lng: order.dropoffLng },
        stopover: true,
      }));
      const optimizedRoute = await getDirections(riderLocation, waypoints);
      setRoute(optimizedRoute);
    }
  };

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={riderLocation} zoom={14}>
      {/* Rider Marker */}
      <Marker position={riderLocation} icon={{ url: "/rider-icon.png" }} />

      {/* Orders Markers */}
      {orders.map((order, index) => (
        <Marker
          key={index}
          position={{ lat: order.dropoffLat, lng: order.dropoffLng }}
          icon={{
            url: order.status === "completed" ? "/red-marker.png" : order.status === "assigned" ? "/blue-marker.png" : "/green-marker.png",
          }}
        />
      ))}

      {/* Route Polyline */}
      {route.length > 0 && <Polyline path={route} options={{ strokeColor: "#4285F4", strokeWeight: 4 }} />}
    </GoogleMap>
  );
}

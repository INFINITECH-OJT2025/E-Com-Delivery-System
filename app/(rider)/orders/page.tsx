"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RiderOrderService } from "@/services/RiderOrderService";
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Button,
  Divider,
  Chip,
  addToast,
} from "@heroui/react";
import { FaMotorcycle } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";

// ✅ Import reusable NearbyOrdersCard component
import NearbyOrdersCard from "@/components/NearbyOrdersCard";
import ActiveOrdersCard from "@/components/ActiveOrdersCard";

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]); // Initialize as an empty array
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchOrdersData();
    }
  }, []);

  // Fetch assigned orders and nearby orders (similar to RiderDashboard)
  const fetchOrdersData = async () => {
    setLoading(true);
    try {
      // Fetch Active Order
      const ordersResponse = await RiderOrderService.getAssignedOrders();
      
      // Ensure response data is an array
      if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
        setOrders(ordersResponse.data); // Set the orders data
      } else {
        setOrders([]); // In case it's not an array, set to empty array
      }

      // Fetch Nearby Unassigned Orders
      const savedLocation = localStorage.getItem("rider_location");
      if (savedLocation) {
        const { lat, lng } = JSON.parse(savedLocation);
        fetchNearbyOrders(lat, lng); // Function for nearby orders
      }

      setLoading(false);
    } catch (error) {
      addToast({
        title: "⚠️ Error",
        description: "Failed to load orders.",
        color: "danger",
      });
      setLoading(false);
    }
  };

  // Fetch nearby orders based on rider's saved location
  const fetchNearbyOrders = async (lat: number, lng: number) => {
    const response = await RiderOrderService.getNearbyOrders(lat, lng);
    if (response.success) {
      setAvailableOrders(response.data);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    const response = await RiderOrderService.acceptOrder(orderId);

    if (response.success) {
      addToast({
        title: "✅ Order Accepted",
        description: `You have successfully accepted Order #${orderId}.`,
        color: "success",
      });
      fetchOrdersData(); // 🔁 Refresh orders after accepting an order
    } else {
      addToast({
        title: "❌ Failed to Accept Order",
        description: response.message,
        color: "danger",
      });
    }
  };

  const handleViewRoute = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 🚀 Active Order */}
          {orders.length > 0 ? (
            <ActiveOrdersCard orders={orders} />
          ) : (
            <div>No active orders</div>
          )}

          {/* ✅ Reusable Nearby Orders Component */}
          <NearbyOrdersCard
            nearbyOrders={availableOrders}
            onAccept={handleAcceptOrder}
          />
        </div>
      )}
    </div>
  );
}

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

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchOrdersData();
    }
  }, []);

  const fetchOrdersData = async () => {
    setLoading(true);
    try {
      // ✅ Fetch Active Order
      const activeOrderData = await RiderOrderService.getAssignedOrders();
      if (activeOrderData.success && activeOrderData.data.length > 0) {
        setActiveOrder(activeOrderData.data[0]);
      } else {
        setActiveOrder(null);
      }

      // ✅ Fetch Nearby Unassigned Orders
      const savedLocation = localStorage.getItem("rider_location");
      if (savedLocation) {
        const { lat, lng } = JSON.parse(savedLocation);
        fetchNearbyOrders(lat, lng);
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
      fetchOrdersData(); // 🔁 Refresh orders
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
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3 className="flex items-center gap-2 font-semibold">
                <FaMotorcycle size={18} /> Active Order
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              {activeOrder ? (
                <Card className="p-3 my-2 bg-gray-100 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Order #{activeOrder.order_id}</h4>
                      <p className="text-sm text-gray-500">📍 {activeOrder.restaurant_name}</p>
                      <p className="text-sm text-gray-500">🏠 {activeOrder.customer_address}</p>
                      <Chip color="primary" className="capitalize mt-1">
                        {activeOrder.order_status.replace("_", " ")}
                      </Chip>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => handleViewRoute(activeOrder.order_id)}
                    >
                      View
                    </Button>
                  </div>
                </Card>
              ) : (
                <p className="text-gray-500 text-center">No active order.</p>
              )}
            </CardBody>
          </Card>

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

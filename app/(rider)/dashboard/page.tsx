"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RiderDashboardService } from "@/services/riderDashboardService";
import { Card, CardBody, Spinner, Button, Badge, Divider } from "@heroui/react";
import { IoFastFoodOutline, IoWalletOutline, IoNotificationsOutline } from "react-icons/io5";
import { FaMotorcycle } from "react-icons/fa";

export default function RiderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rider, setRider] = useState<any>(null);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const profileData = await RiderDashboardService.getProfile();
      const ordersData = await RiderDashboardService.getOrders();
      const earningsData = await RiderDashboardService.getEarnings();
      const notificationsData = await RiderDashboardService.getNotifications();

      if (profileData.status === "success") setRider(profileData.data);
      if (ordersData.status === "success") setOrders(ordersData.data);
      if (earningsData.status === "success") setEarnings(earningsData.data.total_earnings);
      if (notificationsData.status === "success") setNotifications(notificationsData.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* 🚀 Rider Profile Section */}
          <Card className="p-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <img
                src={rider?.profile_image || "/images/default-avatar.png"}
                alt="Profile"
                className="w-16 h-16 rounded-full border"
              />
              <div>
                <h2 className="text-xl font-semibold">{rider?.name}</h2>
                <p className="text-gray-500">{rider?.vehicle_type.toUpperCase()}</p>
                <Badge color={rider?.rider_status === "approved" ? "success" : "warning"}>
                  {rider?.rider_status}
                </Badge>
              </div>
            </div>
          </Card>

          {/* 🚀 Earnings Overview */}
          <Card className="p-4 shadow-lg bg-white">
            <CardBody className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Total Earnings</p>
                <h2 className="text-2xl font-bold text-primary">₱{earnings.toFixed(2)}</h2>
              </div>
              <IoWalletOutline size={40} className="text-primary" />
            </CardBody>
          </Card>

          {/* 🚀 Active Orders Section */}
          <Card className="p-4 shadow-lg">
            <h3 className="text-lg font-semibold flex items-center">
              <IoFastFoodOutline className="mr-2 text-secondary" size={20} />
              Active Orders
            </h3>
            <Divider />
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active orders</p>
            ) : (
              orders.map((order: any) => (
                <Card key={order.id} className="p-3 mt-2 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Order #{order.id}</h4>
                      <p className="text-sm text-gray-500">{order.restaurant.name}</p>
                      <Badge color="primary">{order.order_status.replace("_", " ")}</Badge>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() => router.push(`/rider/orders/${order.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </Card>

          {/* 🚀 Notifications Section */}
          <Card className="p-4 shadow-lg">
            <h3 className="text-lg font-semibold flex items-center">
              <IoNotificationsOutline className="mr-2 text-secondary" size={20} />
              Notifications
            </h3>
            <Divider />
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No new notifications</p>
            ) : (
              notifications.slice(0, 3).map((notification: any) => (
                <div key={notification.id} className="border-b py-2 last:border-none">
                  <p className="text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

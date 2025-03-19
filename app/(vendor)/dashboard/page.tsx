"use client";

import { useState, useEffect } from "react";
import { DashboardService } from "@/services/dashboardService";
import { useVendorAuth } from "@/context/AuthContext";
import DashboardCharts from "./DashboardCharts";
import { FaShoppingCart, FaClipboardList, FaDollarSign } from "react-icons/fa"; // Adding icons from react-icons
import { Skeleton } from "@heroui/react"; // Hero UI Skeleton Loader

// Define TypeScript interfaces
interface OrderData {
  id: number;
  order_status: string;
}

export default function Dashboard() {
  const { vendor } = useVendorAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    if (vendor) {
      const fetchData = async () => {
        try {
          const totalOrders = await DashboardService.getTotalOrders();
          const pendingOrders = await DashboardService.getPendingOrders();
          const totalRevenue = await DashboardService.getTotalRevenue();
          const recentOrders = await DashboardService.getRecentOrders();

          setTotalOrders(totalOrders);
          setPendingOrders(pendingOrders);
          setTotalRevenue(totalRevenue);
          setRecentOrders(recentOrders);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [vendor]);

  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 p-6 bg-gray-100">
          <h1 className="text-3xl font-semibold mb-6">Welcome to Your Dashboard, {vendor?.name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skeleton loader for each card */}
            <Skeleton className="w-full h-32 rounded-lg" />
            <Skeleton className="w-full h-32 rounded-lg" />
            <Skeleton className="w-full h-32 rounded-lg" />
          </div>

          <Skeleton className="w-full h-48 mt-8 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 p-6 ">
        <h1 className="text-3xl font-semibold mb-6">Welcome to Your Dashboard, {vendor?.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Orders Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4">
            <FaShoppingCart className="text-3xl text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Total Orders</h2>
              <p className="text-2xl">{totalOrders}</p>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4">
            <FaClipboardList className="text-3xl text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Pending Orders</h2>
              <p className="text-2xl">{pendingOrders}</p>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4">
            <FaDollarSign className="text-3xl text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Total Revenue</h2>
              <p className="text-2xl">₱{totalRevenue}</p>
            </div>
          </div>
        </div>

        {/* Render the chart component */}
        <DashboardCharts totalOrders={totalOrders} pendingOrders={pendingOrders} totalRevenue={totalRevenue} />

        {/* Recent Orders */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            {recentOrders.length === 0 ? (
              <p>No recent orders yet.</p>
            ) : (
              <ul>
                {recentOrders.map((order) => (
                  <li key={order.id}>
                    <p>Order #{order.id} - {order.order_status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

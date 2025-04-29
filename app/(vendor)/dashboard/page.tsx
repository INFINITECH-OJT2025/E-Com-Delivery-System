"use client";

import { useEffect, useState } from "react";
import OrdersOverview from "@/components/dashboard/OrdersOverview";
import RevenueOverview from "@/components/dashboard/RevenueOverview";
import StatCardSection from "@/components/dashboard/StatCardSection";
import RecentOrders from "@/components/dashboard/RecentOrders";
import PopularItems from "@/components/dashboard/PopularItems";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import RecentReviews from "@/components/dashboard/RecentReviews";
import { DashboardService } from "@/services/dashboardService";
import { useRouter } from "next/navigation";

export default function VendorDashboardPage() {
  const [restaurantName, setRestaurantName] = useState("...");
  const [isOpen, setIsOpen] = useState(true);
  const [closingTime, setClosingTime] = useState("...");
  const router = useRouter(); // 🛠️ Setup router

  useEffect(() => {
    async function fetchStoreDetails() {
      const res = await DashboardService.getStoreStatus();
      if (res) {
        setRestaurantName(res.name || "Your Restaurant");
        setIsOpen(res.isOpen);
        setClosingTime(res.closingTime || "N/A");
      }
    }
    fetchStoreDetails();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-4">Welcome back, {restaurantName}</p>

      {/* ✅ Dynamic Store Status */}
      <div
        className={`${
          isOpen ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-red-50 border-red-200 text-red-700"
        } border px-4 py-3 rounded-lg flex justify-between items-center`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <div>
            <p className="font-medium">
              Store Status:{" "}
              <span className={`font-semibold ${isOpen ? "text-green-700" : "text-red-700"}`}>
                {isOpen ? "Open" : "Closed"}
              </span>
            </p>
            <p className="text-xs text-gray-500">
  {closingTime === "N/A" ? "24/7" : `Until ${closingTime}`}
</p>
          </div>
        </div>
        <div className="flex gap-2">
        <button
  onClick={() => router.push("/restaurant/details")}
  className="px-4 py-1 rounded border text-sm border-gray-300"
>
  View Store Hours
</button>
          {/* <button className="px-4 py-1 rounded bg-red-500 text-white text-sm">
            {isOpen ? "Set as Closed" : "Open Store"}
          </button> */}
        </div>
      </div>

      <StatCardSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueOverview />
        <OrdersOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentOrders />
        <PopularItems />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerformanceMetrics />
        <RecentReviews />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  FaShoppingBasket,
  FaDollarSign,
  FaChartLine,
  FaStar,
} from "react-icons/fa";
import StatCard from "./StatCard";
import { DashboardService } from "@/services/dashboardService";

export default function StatCardSection() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const data = await DashboardService.getStatOverview();
      if (data) setStats(data);
      setLoading(false);
    }

    fetchStats();
  }, []);

  const formatTrend = (value: number) => {
    const symbol = value >= 0 ? "↑" : "↓";
    return `${symbol} ${Math.abs(value)}%`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<FaShoppingBasket />}
        label="Total Orders"
        value={loading ? "..." : stats?.totalOrders.toLocaleString()}
        trend={loading ? "..." : `${formatTrend(stats.totalOrdersTrend)} vs. yesterday`}
        trendColor={stats?.totalOrdersTrend >= 0 ? "text-green-600" : "text-red-500"}
        iconBg="bg-blue-100"
        iconColor="text-blue-500"
        isPositive={stats?.totalOrdersTrend >= 0}
      />
      <StatCard
        icon={<FaDollarSign />}
        label="Total Revenue"
        value={loading ? "..." : `₱${Number(stats?.totalRevenue || 0).toLocaleString()}`}
        trend={loading ? "..." : `${formatTrend(stats.totalRevenueTrend)} vs. yesterday`}
        trendColor={stats?.totalRevenueTrend >= 0 ? "text-green-600" : "text-red-500"}
        iconBg="bg-green-100"
        iconColor="text-green-600"
        isPositive={stats?.totalRevenueTrend >= 0}
      />
      <StatCard
        icon={<FaChartLine />}
        label="Avg. Order Value"
        value={loading ? "..." : `₱${Number(stats?.avgOrderValue || 0).toFixed(2)}`}
        trend={loading ? "..." : `${formatTrend(stats.avgOrderValueTrend)} vs. yesterday`}
        trendColor={stats?.avgOrderValueTrend >= 0 ? "text-green-600" : "text-red-500"}
        iconBg="bg-yellow-100"
        iconColor="text-yellow-600"
        isPositive={stats?.avgOrderValueTrend >= 0}
      />
      <StatCard
        icon={<FaStar />}
        label="Customer Rating"
        value={loading ? "..." : Number(stats?.averageRating || 0).toFixed(1)}
        trend={loading ? "..." : `↑ ${stats.averageRatingTrend} vs. last week`}
        trendColor="text-green-600"
        iconBg="bg-purple-100"
        iconColor="text-purple-500"
        isPositive={true}
      />
    </div>
  );
}

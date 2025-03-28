"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { DashboardService } from "@/services/dashboardService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Spinner } from "@heroui/react";
import DashboardCharts from "./DashboardCharts";

// Optional color palette
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2", "#D65DB1"];

export default function VendorDashboard() {
  const [loading, setLoading] = useState(true);

  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const [topMenus, setTopMenus] = useState([]);
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [
          orders,
          pending,
          revenue,
          rating,
          menus,
          keywords,
          trends,
          types,
          payments,recentOrders
        ] = await Promise.all([
          DashboardService.getTotalOrders(),
          DashboardService.getPendingOrders(),
          DashboardService.getTotalRevenue(),
          DashboardService.getAverageRating(),
          DashboardService.getTopSellingMenus(),
          DashboardService.getMostSearchedKeywords(),
          DashboardService.getOrderTrendsByHour(),
          DashboardService.getOrderTypeDistribution(),
          DashboardService.getPaymentMethodStats(),
      DashboardService.getRecentOrders(),

        ]);

        setTotalOrders(orders);
        setPendingOrders(pending);
        setTotalRevenue(revenue);
        setAverageRating(rating);

        setTopMenus(menus);
        setSearchKeywords(keywords);
        setOrderTrends(trends);
        setOrderTypes(types);
        setPaymentMethods(payments);
        setRecentOrders(recentOrders);

      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">📊 Restaurant Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={totalOrders} />
        <StatCard title="Pending Orders" value={pendingOrders} />
        <StatCard title="Total Revenue" value={`₱${totalRevenue}`} />
        <StatCard title="Average Rating" value={averageRating.toFixed(1)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="🛒 Top Selling Items">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topMenus}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_sold" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🔍 Most Searched Keywords">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={searchKeywords}>
              <XAxis dataKey="keyword" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="search_count" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="⏰ Orders by Hour">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={orderTrends}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" stroke="#FF8042" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="📦 Order Type Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={orderTypes}
                dataKey="count"
                nameKey="order_type"
                outerRadius={100}
                label
              >
                {orderTypes.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="💳 Payment Method Stats">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentMethods}
                dataKey="total"
                nameKey="payment_method"
                outerRadius={100}
                label
              >
                {paymentMethods.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
        {/* Render the chart component */}
        <DashboardCharts totalOrders={totalOrders} pendingOrders={pendingOrders} totalRevenue={totalRevenue} />

        {/* Recent Orders */}
        <div className="mt-8">
  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
    Recent Orders
  </h2>

  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md transition-all">
    {recentOrders.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400">No recent orders yet.</p>
    ) : (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {recentOrders.map((order) => (
          <li key={order.id} className="py-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white font-medium">
                Order #{order.id}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {order.order_status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

    </div>
    
  );
}

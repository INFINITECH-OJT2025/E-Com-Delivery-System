"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { DashboardService } from "@/services/dashboardService";

const statusColors: Record<string, string> = {
    completed: "success",
    preparing: "warning",
    "in transit": "primary",
    pending: "default",
    confirmed: "warning",
    canceled: "danger",
};

export default function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const result = await DashboardService.getRecentOrders();
      if (Array.isArray(result)) setOrders(result);
      setLoading(false);
    }

    fetchOrders();
  }, []);

  return (
    <Card className="shadow-sm border h-full">
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Recent Orders</h3>
          <a href="/orders" className="text-sm text-primary hover:underline">
            View All →
          </a>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading orders...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs text-left border-b">
                <th className="py-2">Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-semibold">ORD-{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.items} item{order.items > 1 ? "s" : ""}</td>
                  <td className="font-medium">₱{Number(order.total).toFixed(2)}</td>
                  <td>
                    <Chip
                      size="sm"
                      color={statusColors[order.status?.toLowerCase()] || "default"}
                      variant="flat"
                      className="capitalize"
                    >
                      {order.status}
                    </Chip>
                  </td>
                  <td className="text-right text-gray-500">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
}

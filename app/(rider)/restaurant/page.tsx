"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Spinner, addToast } from "@heroui/react";
import { RiderOrderService } from "@/services/RiderOrderService";

export default function RiderHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await RiderOrderService.getDeliveryHistory();
      if (res.status === "success") {
        setHistory(res.data.orders);
        setTotalEarnings(res.data.total_earnings);
      } else {
        addToast({ title: "Failed to load", description: res.message, color: "danger" });
      }
    } catch (error) {
      addToast({ title: "Error", description: "Could not fetch history", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">🧾 Delivery History & Earnings</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <h3 className="font-semibold">Completed Deliveries</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex justify-between mb-4 text-sm text-gray-700 font-medium">
              <span>Total Completed: {history.length}</span>
              <span className="text-green-600">Total Earnings: ₱{totalEarnings}</span>
            </div>

            {history.length === 0 ? (
              <p className="text-center text-gray-500">You have no completed deliveries yet.</p>
            ) : (
              <div className="space-y-4">
                {history.map((order: any) => (
                  <Card key={order.order_id} className="p-4 bg-gray-100">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-semibold text-primary">Order #{order.order_id}</h4>
                        <p className="text-sm text-gray-500">📍 {order.restaurant_name}</p>
                        <p className="text-sm text-gray-500">🏠 {order.customer_address}</p>
                        <p className="text-sm text-gray-700 font-medium">Earnings: ₱{order.earnings}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p className="font-medium">Items:</p>
                        {order.items.map((item: any, idx: number) => (
                          <p key={idx}>
                            {item.quantity}x {item.item_name} - ₱{item.subtotal}
                          </p>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  addToast,
  Select,
  SelectItem,
  Button,
} from "@heroui/react";
import { RiderOrderService } from "@/services/RiderOrderService";
import dayjs from "dayjs";

export default function RiderHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [history, filter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await RiderOrderService.getDeliveryHistory();
      if (res.status === "success") {
        setHistory(res.data.orders);
        setFiltered(res.data.orders);
      } else {
        addToast({ title: "Failed to load", description: res.message, color: "danger" });
      }
    } catch (error) {
      addToast({ title: "Error", description: "Could not fetch history", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === "all") {
      setFiltered(history);
    } else if (filter === "today") {
      const today = dayjs().format("YYYY-MM-DD");
      setFiltered(history.filter((h: any) => dayjs(h.updated_at).format("YYYY-MM-DD") === today));
    } else if (filter === "week") {
      const now = dayjs();
      setFiltered(
        history.filter((h: any) =>
          dayjs(h.updated_at).isAfter(now.startOf("week")) &&
          dayjs(h.updated_at).isBefore(now.endOf("week"))
        )
      );
    }
  };

  const getFilteredTotalEarnings = () => {
    return filtered.reduce((acc: number, curr: any) => acc + parseFloat(curr.earnings), 0).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <Card className="shadow-lg min-h-[90vh]">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white flex justify-between items-center">
            <h3 className="font-semibold">Completed Deliveries</h3>
            <Select
              size="sm"
              label="Filter"
              className="max-w-[180px] text-black"
              selectedKeys={[filter]}
              onSelectionChange={(keys) => setFilter(Array.from(keys)[0] as string)}
            >
              <SelectItem key="all">All</SelectItem>
              <SelectItem key="today">Today</SelectItem>
              <SelectItem key="week">This Week</SelectItem>
            </Select>
          </CardHeader>
          <Divider />
          <CardBody className="h-[65vh] overflow-y-auto">
            <div className="flex justify-between mb-4 text-sm text-gray-700 font-medium">
              <span>Total Deliveries: {filtered.length}</span>
              <span className="text-green-600">Total Earnings: ₱{getFilteredTotalEarnings()}</span>
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-gray-500">No deliveries match the selected filter.</p>
            ) : (
              <div className="space-y-4">
                {filtered.map((order: any) => (
                  <Card key={order.order_id} className="p-4 bg-gray-100">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-semibold text-primary">Order #{order.order_id}</h4>
                        <p className="text-sm text-gray-500">📍 {order.restaurant_name}</p>
                        <p className="text-sm text-gray-500">🏠 {order.customer_address}</p>
                        <p className="text-sm text-gray-700 font-medium">Earnings: ₱{order.earnings}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Delivered: {dayjs(order.updated_at).format("MMM D, YYYY h:mm A")}
                        </p>

                        {/* Toggle Breakdown */}
                        <button
                          className="text-blue-500 text-xs mt-2"
                          onClick={() => setExpanded((prev) => ({ ...prev, [order.order_id]: !prev[order.order_id] }))}
                        >
                          {expanded[order.order_id] ? "Hide Breakdown" : "See Breakdown"}
                        </button>

                        {expanded[order.order_id] && (
                          <div className="mt-2 text-xs text-gray-600">
                            <p>Delivery Fee: ₱{order.delivery_fee}</p>
                            <p>- Platform Fee (10%): ₱{(parseFloat(order.delivery_fee) * 0.1).toFixed(2)}</p>
                            <p>+ Rider Share (90%): ₱{(parseFloat(order.delivery_fee) * 0.9).toFixed(2)}</p>
                            <p>+ Tip: ₱{order.rider_tip}</p>
                          </div>
                        )}
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

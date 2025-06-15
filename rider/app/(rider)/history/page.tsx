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
    } catch {
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

  const getFilteredTotalEarnings = () =>
    filtered.reduce((acc: number, curr: any) => acc + parseFloat(curr.earnings), 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <Card className="shadow-lg min-h-[90vh]">
          <CardHeader className="bg-primary text-white flex justify-between items-center rounded-t-xl">
            <h3 className="font-semibold text-base">📦 Completed Deliveries</h3>
            <Select
              size="sm"
          
              className="max-w-[150px] text-black"
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
                  <Card
                    key={order.order_id}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                      {/* LEFT SIDE – Info */}
                      <div className="text-sm text-gray-700 space-y-1">
                        <h4 className="font-semibold text-primary">Order #{order.order_id}</h4>
                        <p>📍 <strong>Pickup:</strong> {order.restaurant_name}</p>
                        <p>🏠 <strong>Dropoff:</strong> {order.customer_address}</p>
                        <p className="font-medium text-green-600 mt-1">
                          Earnings: ₱{order.earnings}
                        </p>
                        <p className="text-xs text-gray-400">
                          Delivered: {dayjs(order.updated_at).format("MMM D, YYYY h:mm A")}
                        </p>

                        {/* Toggle Breakdown */}
                        <Button
                          variant="light"
                          size="sm"
                          className="text-blue-600 text-xs px-0 mt-1"
                          onPress={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [order.order_id]: !prev[order.order_id],
                            }))
                          }
                        >
                          {expanded[order.order_id] ? "Hide Breakdown" : "See Breakdown"}
                        </Button>

                        {expanded[order.order_id] && (
                          <div className="mt-2 text-xs text-gray-600 space-y-1">
                            <p>Delivery Fee: ₱{order.delivery_fee}</p>
                            <p>- Platform Fee (10%): ₱{(parseFloat(order.delivery_fee) * 0.1).toFixed(2)}</p>
                            <p>+ Rider Share (90%): ₱{(parseFloat(order.delivery_fee) * 0.9).toFixed(2)}</p>
                            <p>+ Tip: ₱{order.rider_tip}</p>
                          </div>
                        )}
                      </div>

                      {/* RIGHT SIDE – Items */}
                      <div className="text-sm text-gray-600 space-y-1 text-right sm:text-left">
                        <p className="font-medium">🛒 Items:</p>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs gap-2">
                            <span>{item.quantity}x {item.item_name}</span>
                            <span className="font-medium">₱{item.subtotal}</span>
                          </div>
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

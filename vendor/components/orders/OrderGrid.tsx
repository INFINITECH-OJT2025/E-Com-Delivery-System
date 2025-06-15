"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { FaTrash, FaEye } from "react-icons/fa";

const statusColors: Record<string, string> = {
  pending: "warning",
  confirmed: "primary",
  preparing: "secondary",
  out_for_delivery: "secondary",
  completed: "success",
  canceled: "danger",
};

export default function OrderGrid({ orders, onDelete, onView }: any) {
  if (!orders.length) {
    return <p className="text-center text-gray-500 py-10">No orders found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {orders.map((order: any) => (
        <Card
          key={order.id}
          className="shadow-md border border-gray-200 flex flex-col justify-between h-full"
        >
          <CardBody className="p-5 space-y-4 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">ORD-{order.id}</h3>
                <p className="text-xs text-gray-500">
                  {order.scheduled_time
                    ? new Date(order.scheduled_time).toLocaleString()
                    : "Unscheduled"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Chip
                  size="sm"
                  color={statusColors[order.order_status] || "default"}
                  variant="flat"
                  className="text-xs capitalize"
                >
                  {order.order_status}
                </Chip>
                <Chip color="success" size="sm" variant="flat" className="text-xs">
                  ₱{order.total_price}
                </Chip>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <p className="text-sm font-medium">{order.customer?.name}</p>
              <p className="text-xs text-gray-500">{order.customer?.phone_number || "No number"}</p>
            </div>

            {/* Items Preview */}
            <div>
              <p className="text-sm font-semibold mb-1">Items:</p>
              {order.order_items?.slice(0, 2).map((item: any) => (
                <div key={item.id} className="text-xs flex justify-between">
                  <span>{item.quantity}× {item.name}</span>
                  <span>₱{item.subtotal}</span>
                </div>
              ))}
              {order.order_items?.length > 2 && (
                <p className="text-xs text-gray-400 mt-1">
                  +{order.order_items.length - 2} more item(s)
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto pt-2 flex justify-end gap-2">
              <Button size="sm" color="primary" onPress={() => onView(order)}>
                <FaEye className="mr-1" /> View
              </Button>
              {order.order_status === "pending" && (
                <Button size="sm" color="danger" onPress={() => onDelete(order.id)}>
                  <FaTrash className="mr-1" /> Cancel
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

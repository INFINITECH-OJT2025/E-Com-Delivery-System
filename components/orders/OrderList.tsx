"use client";

import { Button, Chip } from "@heroui/react";
import { FaTrash, FaEye } from "react-icons/fa";

const statusColors: Record<string, string> = {
  pending: "warning",
  confirmed: "primary",
  preparing: "secondary",
  out_for_delivery: "secondary",
  completed: "success",
  canceled: "danger",
};

export default function OrderList({ orders, onDelete, onView }: any) {
  if (!orders.length) {
    return <p className="text-center text-gray-500 py-10">No orders found.</p>;
  }

  return (
    <div className="overflow-auto border rounded-md">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">Order</th>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order.id} className="border-t hover:bg-gray-50">
              {/* Order ID */}
              <td className="px-4 py-3 font-semibold text-gray-700">ORD-{order.id}</td>

              {/* Customer Info */}
              <td className="px-4 py-3">
                <div className="text-sm">{order.customer?.name}</div>
                <div className="text-xs text-gray-500">
                  {order.customer?.phone_number || "No number"}
                </div>
              </td>

              {/* Status */}
              <td className="px-4 py-3 capitalize">
                <Chip
                  color={statusColors[order.order_status] || "default"}
                  variant="flat"
                  size="sm"
                  className="capitalize"
                >
                  {order.order_status}
                </Chip>
              </td>

              {/* Total Price */}
              <td className="px-4 py-3 font-bold text-primary">₱{order.total_price}</td>

              {/* Actions */}
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <Button size="sm" color="primary" onPress={() => onView(order)}>
                    <FaEye />
                  </Button>
                  {order.order_status === "pending" && (
                    <Button size="sm" color="danger" onPress={() => onDelete(order.id)}>
                      <FaTrash />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

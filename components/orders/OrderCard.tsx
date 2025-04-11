"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { FaMapMarkerAlt, FaPhoneAlt, FaClock } from "react-icons/fa";

export default function OrderCard({ order, onView }: { order: any; onView: (order: any) => void }) {
  return (
    <Card className="shadow-sm border rounded-xl hover:shadow-md transition-all">
      <CardBody className="p-5 space-y-3">
        {/* Order Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">ORD-{order.id}</h2>
            <div className="text-gray-500 text-sm flex items-center gap-2 mt-1">
              <FaClock className="text-xs" />
              {new Date(order.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ₱{order.total_price}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
              {order.payment?.payment_status === "success" ? "Paid" : "Pending"}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              {order.order_status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="text-sm text-gray-700">
          <p className="font-medium">{order.customer?.name}</p>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <FaMapMarkerAlt className="mt-0.5" />
            <span>{order.customer?.address || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FaPhoneAlt />
            <span>{order.customer?.phone_number}</span>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="text-sm">
          <p className="font-semibold mb-1">Order Items:</p>
          {order.order_items.slice(0, 2).map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600">
              <span>{item.quantity}× {item.name}</span>
              <span>₱{item.subtotal}</span>
            </div>
          ))}
          {order.order_items.length > 2 && (
            <p className="text-xs text-gray-400 mt-1">+{order.order_items.length - 2} more items</p>
          )}
        </div>

        {/* View Button */}
        <div className="pt-3">
          <Button size="sm" variant="bordered" onPress={() => onView(order)}>
            View Details
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

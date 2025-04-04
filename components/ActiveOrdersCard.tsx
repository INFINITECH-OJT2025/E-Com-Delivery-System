"use client";

import { Card, CardBody, CardHeader, Button, Divider, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FaMotorcycle } from "react-icons/fa";

export default function ActiveOrdersCard({ orders }: { orders: any[] }) {
  const router = useRouter();

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
        <h3 className="flex items-center gap-2 font-semibold text-base">
          <FaMotorcycle size={16} /> Active Orders
        </h3>
      </CardHeader>
      <Divider />
      <CardBody className="space-y-3 p-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center">No active orders</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm flex justify-between items-center"
            >
              <div className="space-y-1">
                <h4 className="font-medium text-primary text-sm">
                  Order #{order.order_id}
                </h4>
                <p className="text-xs text-gray-500 truncate max-w-[220px]">
                  📍 {order.restaurant_name} → {order.customer_address.split(",")[0]}
                </p>
                <Chip color="primary" className="capitalize text-xs">
                  {order.order_status.replace("_", " ")}
                </Chip>
              </div>
              <Button
                size="sm"
                variant="light"
                className="text-xs font-medium"
                onPress={() => router.push(`/orders/${order.order_id}`)}
              >
                View
              </Button>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}

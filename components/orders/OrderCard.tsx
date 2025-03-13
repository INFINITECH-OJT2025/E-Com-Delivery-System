"use client";

import { Button } from "@heroui/react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { capitalize, getRefundStatusColor } from "@/components/orders/OrderUtils";

interface OrderCardProps {
    order: {
        id: number;
        restaurant?: { name: string };
        created_at: string;
        order_status: string;
        total_price: number;
        refund?: { status: "pending" | "approved" | "denied" } | null;
    };
    onOpen: () => void;
}

export default function OrderCard({ order, onOpen }: OrderCardProps) {
    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white flex flex-col space-y-2">
            {/* ✅ Restaurant Name */}
            <h3 className="text-md font-bold">{order.restaurant?.name || "Unknown Restaurant"}</h3>
            <p className="text-sm text-gray-600">Ordered on {new Date(order.created_at).toLocaleString()}</p>

            {/* ✅ Order Status */}
            <div className="flex items-center mt-2">
                <OrderStatusIcon status={order.order_status} />
                <span className="text-sm font-semibold">{capitalize(order.order_status)}</span>
            </div>

            {/* ✅ Refund Status */}
            {order.refund && (
                <p className={`text-sm font-semibold ${getRefundStatusColor(order.refund.status)}`}>
                    Refund {capitalize(order.refund.status)}
                </p>
            )}

            {/* ✅ Total Price */}
            <p className="text-lg font-bold">₱{order.total_price.toFixed(2)}</p>

            {/* ✅ View Order Button */}
            <Button onPress={onOpen} className="w-full bg-primary text-white">
                View Order
            </Button>
        </div>
    );
}

/**
 * ✅ Order Status Icon Component
 */
function OrderStatusIcon({ status }: { status: string }) {
    switch (status) {
        case "pending":
            return <Clock className="w-5 h-5 text-yellow-500 mr-2" />;
        case "completed":
            return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />;
        case "canceled":
            return <XCircle className="w-5 h-5 text-red-500 mr-2" />;
        default:
            return null;
    }
}

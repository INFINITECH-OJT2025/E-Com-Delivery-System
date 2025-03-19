"use client";

import { Button, Chip } from "@heroui/react";
import {
    Clock, CheckCircle, XCircle, CalendarClock, CreditCard, MapPin, Truck, Package
} from "lucide-react";
import { capitalize, getRefundStatusColor } from "@/components/orders/OrderUtils";

interface OrderCardProps {
    order: {
        id: number;
        restaurant?: { name: string };
        created_at: string;
        order_status: string;
        delivery_status?: string;
        scheduled_time?: string | null;
        total_price: number;
        payment?: { payment_method: string; payment_status: string } | null;
        refund?: { status: "pending" | "approved" | "denied" } | null;
    };
    onOpen: () => void;
}

export default function OrderCard({ order, onOpen }: OrderCardProps) {
    return (
        <div className="p-5 border rounded-lg shadow-sm bg-white flex flex-col space-y-3">
            {/* ✅ Order ID & Restaurant Name */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{order.restaurant?.name || "Unknown Restaurant"}</h3>
                <Chip color="default" className="text-xs">#{order.id}</Chip>
            </div>

            {/* ✅ Order Date */}
            <p className="text-sm text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                Ordered on {new Date(order.created_at).toLocaleString()}
            </p>

            {/* ✅ Scheduled Order Info */}
            {order.scheduled_time && (
                <p className="text-sm text-blue-600 flex items-center">
                    <CalendarClock className="w-4 h-4 mr-1 text-blue-500" />
                    Scheduled for {new Date(order.scheduled_time).toLocaleString()}
                </p>
            )}

            {/* ✅ Order Status */}
            <div className="flex items-center space-x-2">
                <OrderStatusIcon status={order.order_status} />
                <Chip color={getOrderStatusColor(order.order_status)} className="capitalize text-sm">
                    {capitalize(order.order_status)}
                </Chip>
            </div>

            {/* ✅ Delivery Status (If Available) */}
            {order.delivery_status && (
                <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-indigo-500" />
                    <Chip color={getDeliveryStatusColor(order.delivery_status)} className="capitalize text-sm">
                        {capitalize(order.delivery_status.replace("_", " "))}
                    </Chip>
                </div>
            )}

            {/* ✅ Refund Status (If Applicable) */}
            {order.refund && (
                <p className={`text-sm font-semibold ${getRefundStatusColor(order.refund.status)}`}>
                    Refund {capitalize(order.refund.status)}
                </p>
            )}

            {/* ✅ Payment Status */}
            <div className="flex items-center space-x-2 text-gray-700 text-sm">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <p className={`font-semibold ${getPaymentStatusColor(order.payment?.payment_status)}`}>
                    {order.payment?.payment_status === "success"
                        ? `Paid via ${order.payment?.payment_method}`
                        : "Payment Pending"}
                </p>
            </div>

            {/* ✅ Total Price */}
            <p className="text-xl font-bold text-primary">₱{order.total_price.toFixed(2)}</p>

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
            return <Clock className="w-5 h-5 text-yellow-500" />;
        case "completed":
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "canceled":
            return <XCircle className="w-5 h-5 text-red-500" />;
        default:
            return <Clock className="w-5 h-5 text-gray-400" />;
    }
}

/**
 * ✅ Get Order Status Color
 */
function getOrderStatusColor(status: string) {
    switch (status) {
        case "pending":
            return "warning";
        case "completed":
            return "success";
        case "canceled":
            return "danger";
        default:
            return "default";
    }
}

/**
 * ✅ Get Delivery Status Color
 */
function getDeliveryStatusColor(status: string) {
    switch (status) {
        case "not_assigned":
            return "default";
        case "assigned":
            return "primary";
        case "picked_up":
            return "warning";
        case "in_delivery":
            return "secondary";
        case "arrived_at_customer":
        case "delivered":
            return "success";
        default:
            return "default";
    }
}

/**
 * ✅ Get Payment Status Color
 */
function getPaymentStatusColor(status: string | undefined) {
    switch (status) {
        case "success":
            return "text-green-600";
        case "pending":
            return "text-yellow-500";
        case "failed":
            return "text-red-500";
        default:
            return "text-gray-500";
    }
}

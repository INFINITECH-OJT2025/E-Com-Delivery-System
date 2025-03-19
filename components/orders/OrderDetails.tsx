"use client";

import { Button } from "@heroui/react";
import { MapPin, CreditCard, RotateCw, X, FileText } from "lucide-react";
import { capitalize, getRefundStatusColor } from "@/components/orders/OrderUtils";
import { orderService } from "@/services/orderService";

interface OrderDetailsProps {
    order: any;
    onBack: () => void;
    openRefundModal: (order: any) => void;
    fetchOrders: () => void;
    openAlert: (alert: any) => void;
}

export default function OrderDetails({ order, onBack, openRefundModal, fetchOrders, openAlert }: OrderDetailsProps) {
    /**
     * ✅ Handle Order Cancellation
     */
    const handleCancelOrder = async () => {
        openAlert({
            isOpen: true,
            title: "Cancel Order",
            message: "Are you sure you want to cancel this order?",
            onConfirm: async () => {
                const result = await orderService.cancelOrder(order.id);
                if (result.success) {
                    openAlert({ isOpen: true, title: "Success", message: "Order canceled successfully!" });
                    fetchOrders(); // ✅ Refresh the orders list
                    onBack(); // ✅ Go back to the order list
                } else {
                    openAlert({ isOpen: true, title: "Error", message: result.message });
                }
            },
        });
    };

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
            <p className="text-sm text-gray-600">Ordered on {new Date(order.created_at).toLocaleString()}</p>

            {/* ✅ Restaurant Info */}
            <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <p className="text-lg font-semibold">{order.restaurant?.name || "Unknown Restaurant"}</p>
            </div>

            {/* ✅ Order Items */}
            <div className="border-t pt-3 space-y-2">
                {order.order_items.map((item: any) => (
                    <OrderItem key={item.id} item={item} />
                ))}
            </div>

            {/* ✅ Order Summary */}
            <OrderSummary order={order} />

            {/* ✅ Proof of Delivery (If Available) */}
            {order.delivery_proof && (
                <div className="border-t pt-3 space-y-2">
                    <p className="text-md font-semibold flex items-center">
                        <FileText className="w-5 h-5 text-green-600 mr-2" /> Proof of Delivery:
                    </p>
                    <img
                        src={order.delivery_proof}
                        alt="Proof of Delivery"
                        className="w-full max-h-60 object-cover rounded-md border"
                    />
                </div>
            )}

            {/* ✅ Refund Status */}
            {order.refund && (
                <div className="border-t pt-3">
                    <p className="text-md font-semibold">Refund Status:</p>
                    <p className={`text-sm font-bold ${getRefundStatusColor(order.refund.status)}`}>
                        {capitalize(order.refund.status)}
                    </p>
                </div>
            )}

            {/* ✅ Payment Info */}
            <div className="flex items-center space-x-2 text-gray-700">
                <CreditCard className="w-5 h-5" />
                <p>
                    Paid with <span className="font-semibold">{order.payment?.payment_status === "success" ? order.payment?.payment_method : "Pending Payment"}</span>
                </p>
            </div>

            {/* ✅ Cancel Order Button (Only for Pending Orders) */}
            {order.order_status === "pending" && (
                <Button className="w-full bg-red-500 text-white flex items-center justify-center" onPress={handleCancelOrder}>
                    <X className="w-5 h-5 mr-2" />
                    Cancel Order
                </Button>
            )}

            {/* ✅ Request Refund Button (Only for Completed Orders with No Refund) */}
            {order.order_status === "completed" && !order.refund && (
                <Button className="w-full bg-yellow-500 text-white flex items-center justify-center" onPress={() => openRefundModal(order)}>
                    <RotateCw className="w-5 h-5 mr-2" />
                    Request Refund
                </Button>
            )}

            {/* ✅ Back Button */}
            <Button variant="bordered" onPress={onBack} className="w-full">
                Back
            </Button>
        </div>
    );
}

/**
 * ✅ Order Item Component
 */
function OrderItem({ item }: { item: { quantity: number; name: string; price: number } }) {
    return (
        <div className="flex justify-between">
            <p className="text-gray-700">{item.quantity}x {item.name}</p>
            <p className="text-gray-900 font-semibold">₱{item.price.toFixed(2)}</p>
        </div>
    );
}

/**
 * ✅ Order Summary Component
 */
function OrderSummary({ order }: { order: any }) {
    return (
        <div className="border-t pt-3 space-y-1">
            <SummaryRow label="Subtotal" value={order.subtotal} />
            <SummaryRow label="Delivery Fee" value={order.delivery_fee} />
            <SummaryRow label="Total" value={order.total_price} isBold />
        </div>
    );
}

/**
 * ✅ Summary Row Component
 */
function SummaryRow({ label, value, isBold = false }: { label: string; value: number; isBold?: boolean }) {
    return (
        <div className={`flex justify-between ${isBold ? "font-semibold text-gray-900" : "text-gray-600"}`}>
            <p>{label}</p>
            <p>₱{value.toFixed(2)}</p>
        </div>
    );
}

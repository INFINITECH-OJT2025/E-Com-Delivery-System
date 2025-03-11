"use client";
import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";
import { authService } from "@/services/authService"; // ✅ Use authService
import { orderService } from "@/services/orderService"; // ✅ Fetch orders

export default function OrderModal({ isOpen, onClose }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * ✅ Fetch orders when modal opens
     */
    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen]);

    /**
     * ✅ Fetch authenticated user's orders
     */
    const fetchOrders = async () => {
        setLoading(true);
        const user = authService.getUser(); // ✅ Get logged-in user

        if (!user) {
            setOrders([]);
            setLoading(false);
            return;
        }

        const response = await orderService.getUserOrders();
        if (response.success && response.data) {
            setOrders(response.data);
        } else {
            setOrders([]);
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <ModalContent>
                <ModalHeader className="text-lg font-bold text-blue-700">My Orders</ModalHeader>
                <ModalBody className="space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading orders...</p>
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                            <div key={order.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                                <h3 className="text-md font-bold">Order #{order.id}</h3>
                                <p className="text-sm text-gray-600">Restaurant: {order.restaurant_name}</p>
                                <p className="text-sm text-gray-600">Total: ₱{order.total_price.toFixed(2)}</p>

                                {/* Order Status */}
                                <div className="flex items-center mt-2">
                                    {order.order_status === "pending" && <Clock className="w-5 h-5 text-yellow-500 mr-2" />}
                                    {order.order_status === "completed" && <CheckCircle className="w-5 h-5 text-green-500 mr-2" />}
                                    {order.order_status === "canceled" && <XCircle className="w-5 h-5 text-red-500 mr-2" />}
                                    <span className={`text-sm font-semibold ${order.order_status === "canceled" ? "text-red-500" : "text-gray-800"}`}>
                                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No orders found.</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onPress={onClose} className="w-full bg-blue-500 text-white">Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { orderService } from "@/services/orderService";
import { socketService } from "@/services/socketService"; // ✅ WebSocket Service

interface Order {
    id: number;
    status: string;
    estimated_delivery: string;
    rider_location?: { lat: number; lng: number };
}

interface OrderContextType {
    activeOrder: Order | null;
    orders: Order[];
    fetchUserOrders: () => Promise<void>;
    fetchOrderById: (orderId: number) => Promise<void>;
    updateOrderStatus: (orderId: number, status: string) => void;
}

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    /**
     * ✅ Fetch all user orders
     */
    const fetchUserOrders = async () => {
        const response = await orderService.getUserOrders();
        if (response.success && response.data) {
            setOrders(response.data);
        }
    };

    /**
     * ✅ Fetch a single order by ID (for tracking)
     */
    const fetchOrderById = async (orderId: number) => {
        const response = await orderService.getOrderById(orderId);
        if (response.success && response.data) {
            setActiveOrder(response.data);
        }
    };

    /**
     * ✅ Listen for real-time order updates via WebSockets
     */
    useEffect(() => {
        socketService.connect(); // ✅ Connect WebSocket on mount

        if (activeOrder) {
            socketService.on(`order_update_${activeOrder.id}`, (updatedOrder: Order) => {
                console.log("Order Updated:", updatedOrder);
                setActiveOrder(updatedOrder);
                setOrders((prevOrders) =>
                    prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
                );
            });
        }

        return () => {
            socketService.disconnect(); // ✅ Cleanup WebSocket connection on unmount
        };
    }, [activeOrder]);

    /**
     * ✅ Optimistic UI: Update order status locally before real-time update
     */
    const updateOrderStatus = (orderId: number, status: string) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order))
        );
        if (activeOrder?.id === orderId) {
            setActiveOrder((prev) => prev ? { ...prev, status } : prev);
        }
    };

    return (
        <OrderContext.Provider value={{ activeOrder, orders, fetchUserOrders, fetchOrderById, updateOrderStatus }}>
            {children}
        </OrderContext.Provider>
    );
}

// ✅ Hook for using OrderContext
export function useOrder() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrder must be used within an OrderProvider");
    }
    return context;
}

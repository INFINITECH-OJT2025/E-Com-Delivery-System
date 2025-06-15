"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { orderService } from "@/services/orderService";

interface Order {
  id: number;
  order_status: string;
  total_price: number;
  order_items: any[];
  created_at: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (orderId: number) => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>; // ✅ Add cancel order
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  /**
   * ✅ Fetch all orders for the user (fixes potential nesting issues)
   */
  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      if (data.success && Array.isArray(data.data?.orders)) {
        setOrders(data.data.orders); // ✅ Ensures only valid order array is set
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  /**
   * ✅ Fetch order by ID (fixes response validation)
   */
  const fetchOrderById = async (orderId: number) => {
    try {
      const data = await orderService.getOrderById(orderId);
      if (data.success && data.data?.order) {
        setCurrentOrder(data.data.order);
      } else {
        setCurrentOrder(null);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  /**
   * ✅ Cancel an order
   */
  const cancelOrder = async (orderId: number) => {
    try {
      const data = await orderService.cancelOrder(orderId);
      if (data.success) {
        alert("Order canceled successfully!");
        fetchOrders(); // ✅ Refresh order list
      } else {
        alert(data.message || "Failed to cancel order.");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <OrderContext.Provider value={{ orders, currentOrder, fetchOrders, fetchOrderById, cancelOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
};

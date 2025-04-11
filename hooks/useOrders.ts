// hooks/useOrders.ts
import { useState, useEffect } from "react";
import { orderService } from "@/services/orderService";

export const useOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.fetchOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Fetching orders error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, fetchOrders };
};

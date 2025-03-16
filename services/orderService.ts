"use client";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const token = localStorage.getItem("vendorToken");

export const orderService = {
  async fetchOrders() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  async updateOrderStatus(orderId: number, status: string) {
    try {
      const response = await axios.put(
        `${API_URL}/api/vendor/orders/${orderId}/status`,
        { order_status: status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      return null;
    }
  },
};

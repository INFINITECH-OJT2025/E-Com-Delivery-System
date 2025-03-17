import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const RiderOrderService = {
  /**
   * ✅ Update Order Status
   */
  /**
   * ✅ Accept Order
   */
  async acceptOrder(orderId: number) {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized. Please log in." };

      const response = await axios.post(
        `${API_URL}/api/riders/orders/accept`,
        { order_id: orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        return { success: true, message: "Order accepted successfully.", order: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error("❌ Error accepting order:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Failed to accept order." };
    }
  },

  /**
   * ✅ Update Order Status
   */
  async updateOrderStatus(orderId: number, status: string) {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized. Please log in." };

      const response = await axios.post(
        `${API_URL}/api/riders/orders/update`,
        { order_id: orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        return { success: true, message: "Order status updated." };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      return { success: false, message: "Failed to update order status." };
    }
  },  async getAssignedOrders() {
      try {
        const token = localStorage.getItem("riderToken");
        if (!token) return { success: false, message: "Unauthorized" };
  
        const response = await axios.get(`${API_URL}/api/riders/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data.status === "success") {
          return { success: true, data: response.data.data };
        }
        return { success: false, message: response.data.message };
      } catch (error) {
        console.error("Error fetching assigned orders:", error);
        return { success: false, message: "Failed to fetch orders." };
      }
    },
  
};

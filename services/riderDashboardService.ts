import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/riders";

export const RiderDashboardService = {
  /**
   * ✅ Fetch Rider Profile
   */
  async getProfile() {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized" };

      const response = await axios.get(`${API_URL}api/riders/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { success: false, message: "Failed to fetch profile." };
    }
  },

  /**
   * ✅ Fetch Rider's Assigned Orders
   */
  async getAssignedOrders() {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized" };

      const response = await axios.get(`${API_URL}api/riders/orders`, {
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

  /**
   * ✅ Update Order Status
   */
  async updateOrderStatus(orderId: number, status: string) {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized" };

      const response = await axios.post(
        `${API_URL}api/riders/orders/update`,
        { order_id: orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        return { success: true, message: "Order status updated." };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, message: "Failed to update order status." };
    }
  },

  /**
   * ✅ Fetch Rider Earnings & Payouts
   */
  async getEarnings() {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized" };

      const response = await axios.get(`${API_URL}api/riders/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error fetching earnings:", error);
      return { success: false, message: "Failed to fetch earnings." };
    }
  },

  /**
   * ✅ Fetch Rider Notifications
   */
  async getNotifications() {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized" };

      const response = await axios.get(`${API_URL}api/riders/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, message: "Failed to fetch notifications." };
    }
  },
};

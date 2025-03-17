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

      const response = await axios.get(`${API_URL}/api/riders/profile`, {
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


  /**
   * ✅ Fetch Rider Earnings & Payouts
   */
  async getEarnings() {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized" };

      const response = await axios.get(`${API_URL}/api/riders/earnings`, {
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

      const response = await axios.get(`${API_URL}/api/riders/notifications`, {
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

    /**
   * ✅ Fetch Nearby Orders that Riders Can Accept
   */
    async getNearbyOrders(lat: number, lng: number) {
        try {
          const token = localStorage.getItem("riderToken");
          if (!token) return { success: false, message: "Unauthorized" };
    
          const response = await axios.get(`${API_URL}/api/riders/nearby-orders`, {
            params: { lat, lng }, // ✅ Send location to fetch nearby orders
            headers: { Authorization: `Bearer ${token}` },
          });
    
          if (response.data.status === "success") {
            return { success: true, data: response.data.data };
          }
          return { success: false, message: response.data.message };
        } catch (error) {
          console.error("Error fetching nearby orders:", error);
          return { success: false, message: "Failed to fetch nearby orders." };
        }
      }
};

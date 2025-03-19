import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const adminService = {
  /**
   * ✅ Fetch Dashboard Stats (Total Restaurants, Users, Riders, Orders)
   */
  fetchDashboardStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      return response.data;
    } catch (error) {
      return { status: "error", message: "Failed to fetch dashboard stats." };
    }
  },

  /**
   * ✅ Fetch Recent Orders
   */
  fetchRecentOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/dashboard/recent-orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      return response.data;
    } catch (error) {
      return { status: "error", message: "Failed to fetch recent orders." };
    }
  },

  /**
   * ✅ Fetch Recent Registrations (Restaurants, Riders)
   */
  fetchRecentRegistrations: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/dashboard/recent-registrations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      return response.data;
    } catch (error) {
      return { status: "error", message: "Failed to fetch recent registrations." };
    }
  },
};

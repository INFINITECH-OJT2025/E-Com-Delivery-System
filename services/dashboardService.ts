import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/vendor";

// Define TypeScript interfaces
interface OrderResponse {
  totalOrders: number;
}

interface PendingResponse {
  pendingOrders: number;
}

interface RevenueResponse {
  totalRevenue: number;
}

interface RecentOrdersResponse {
  recentOrders: {
    id: number;
    order_status: string;
  }[];
}

// Function to get Authorization Headers with Token
const getAuthHeaders = () => {
  const token = localStorage.getItem("vendorToken");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

export const DashboardService = {
  async getTotalOrders(): Promise<number> {
    try {
      const response = await axios.get<OrderResponse>(`${API_URL}/api/vendor/dashboard/total-orders`, {
        headers: getAuthHeaders(),
      });
      return response.data.totalOrders;
    } catch (error) {
      console.error("Error fetching total orders:", error);
      return 0;
    }
  },

  async getPendingOrders(): Promise<number> {
    try {
      const response = await axios.get<PendingResponse>(`${API_URL}/api/vendor/dashboard/pending-orders`, {
        headers: getAuthHeaders(),
      });
      return response.data.pendingOrders;
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      return 0;
    }
  },

  async getTotalRevenue(): Promise<number> {
    try {
      const response = await axios.get<RevenueResponse>(`${API_URL}/api/vendor/dashboard/total-revenue`, {
        headers: getAuthHeaders(),
      });
      return response.data.totalRevenue;
    } catch (error) {
      console.error("Error fetching total revenue:", error);
      return 0;
    }
  },

  async getRecentOrders(): Promise<RecentOrdersResponse["recentOrders"]> {
    try {
      const response = await axios.get<RecentOrdersResponse>(`${API_URL}/api/vendor/dashboard/recent-orders`, {
        headers: getAuthHeaders(),
      });
      return response.data.recentOrders;
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      return [];
    }
  }
};

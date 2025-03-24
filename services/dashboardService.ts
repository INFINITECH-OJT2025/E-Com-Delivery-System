import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/vendor";

const getAuthHeaders = () => {
  const token = localStorage.getItem("vendorToken");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

// ----------------------
// 🧩 Response Interfaces
// ----------------------

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

interface TopSellingMenu {
  name: string;
  total_sold: number;
}

interface KeywordStat {
  keyword: string;
  search_count: number;
}

interface RatingResponse {
  averageRating: number;
}

interface OrderTrend {
  hour: number;
  total: number;
}

interface OrderTypeStat {
  order_type: "pickup" | "delivery";
  count: number;
}

interface PaymentStat {
  payment_method: string;
  total: number;
}

interface RefundStat {
  status: "pending" | "approved" | "denied";
  total: number;
}

// ----------------------
// 🧠 Dashboard Service
// ----------------------

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
  },

  // 🔥 Additional Stats

  async getTopSellingMenus(): Promise<TopSellingMenu[]> {
    try {
      const response = await axios.get<{ topMenus: TopSellingMenu[] }>(
        `${API_URL}/api/vendor/dashboard/top-selling-menus`,
        { headers: getAuthHeaders() }
      );
      return response.data.topMenus;
    } catch (error) {
      console.error("Error fetching top selling menus:", error);
      return [];
    }
  },

  async getMostSearchedKeywords(): Promise<KeywordStat[]> {
    try {
      const response = await axios.get<{ keywords: KeywordStat[] }>(
        `${API_URL}/api/vendor/dashboard/most-searched-keywords`,
        { headers: getAuthHeaders() }
      );
      return response.data.keywords;
    } catch (error) {
      console.error("Error fetching keywords:", error);
      return [];
    }
  },

  async getAverageRating(): Promise<number> {
    try {
      const response = await axios.get<RatingResponse>(`${API_URL}/api/vendor/dashboard/average-rating`, {
        headers: getAuthHeaders(),
      });
      return response.data.averageRating;
    } catch (error) {
      console.error("Error fetching average rating:", error);
      return 0;
    }
  },

  async getOrderTrendsByHour(): Promise<OrderTrend[]> {
    try {
      const response = await axios.get<{ orderTrendsByHour: OrderTrend[] }>(
        `${API_URL}/api/vendor/dashboard/order-trends-by-hour`,
        { headers: getAuthHeaders() }
      );
      return response.data.orderTrendsByHour;
    } catch (error) {
      console.error("Error fetching order trends:", error);
      return [];
    }
  },

  async getOrderTypeDistribution(): Promise<OrderTypeStat[]> {
    try {
      const response = await axios.get<{ orderTypeDistribution: OrderTypeStat[] }>(
        `${API_URL}/api/vendor/dashboard/order-type-distribution`,
        { headers: getAuthHeaders() }
      );
      return response.data.orderTypeDistribution;
    } catch (error) {
      console.error("Error fetching order type stats:", error);
      return [];
    }
  },

  async getPaymentMethodStats(): Promise<PaymentStat[]> {
    try {
      const response = await axios.get<{ paymentMethods: PaymentStat[] }>(
        `${API_URL}/api/vendor/dashboard/payment-method-stats`,
        { headers: getAuthHeaders() }
      );
      return response.data.paymentMethods;
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return [];
    }
  },

  async getRefundSummary(): Promise<RefundStat[]> {
    try {
      const response = await axios.get<{ refundStats: RefundStat[] }>(
        `${API_URL}/api/vendor/dashboard/refund-summary`,
        { headers: getAuthHeaders() }
      );
      return response.data.refundStats;
    } catch (error) {
      console.error("Error fetching refund stats:", error);
      return [];
    }
  },
};

"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/vendor";

const getAuthHeaders = () => {
  const token = localStorage.getItem("vendorToken");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

export const DashboardService = {
  async getStatOverview() {
    try {
      const response = await axios.get(
        `${API_URL}/api/vendor/dashboard/overview`,
        { headers: getAuthHeaders() }
      );
      return response.data; // { totalOrders, totalRevenue, avgOrderValue, averageRating }
    } catch (err) {
      console.error("Error fetching overview:", err);
      return null;
    }
  },

  async getStoreStatus() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/dashboard/store-status`, {
        headers: getAuthHeaders(),
      });
      return response.data; // { isOpen: true, closingTime: "11:00 PM" }
    } catch (err) {
      console.error("Error fetching store status:", err);
      return { isOpen: false, closingTime: "N/A" };
    }
  },

  async getRevenueChart() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/dashboard/revenue-overview`, {
        headers: getAuthHeaders(),
      });
      return response.data; // [{ name: 'Mon', total: 420 }, ...]
    } catch (err) {
      console.error("Error fetching revenue chart:", err);
      return [];
    }
  },

  async getOrdersByStatus() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/dashboard/orders-by-status`, {
        headers: getAuthHeaders(),
      });
      return response.data; // [{ name: 'Delivered', value: 38 }, ...]
    } catch (err) {
      console.error("Error fetching order status breakdown:", err);
      return [];
    }
  },

  async getRecentOrders() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/dashboard/recent-orders`, {
        headers: getAuthHeaders(),
      });
      return response.data; // [{ id, customer, items, total, status, time }]
    } catch (err) {
      console.error("Error fetching recent orders:", err);
      return [];
    }
  },

  async getPopularItems() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/dashboard/popular-items`, {
        headers: getAuthHeaders(),
      });
      return response.data; // [{ name, orders, revenue, trend }]
    } catch (err) {
      console.error("Error fetching popular items:", err);
      return [];
    }
  },

  async getPerformanceMetrics() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/dashboard/performance`, {
        headers: getAuthHeaders(),
      });
      return response.data; // acceptance, onTimeDelivery, satisfaction, avgPrep, avgDelivery, completed, cancelled
    } catch (err) {
      console.error("Error fetching performance:", err);
      return null;
    }
  },

  async getRecentReviews() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/dashboard/recent-reviews`, {
        headers: getAuthHeaders(),
      });
      return response.data; // [{ name, rating, date, order, content }]
    } catch (err) {
      console.error("Error fetching reviews:", err);
      return [];
    }
  },
};

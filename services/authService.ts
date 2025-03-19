import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const authService = {
  /**
   * ✅ Admin Login
   * @param email - Admin's email
   * @param password - Admin's password
   * @returns {Promise<{status: string, message: string, access_token?: string, admin?: any}>}
   */
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, { email, password });

      if (response.data.status === "success") {
        localStorage.setItem("adminToken", response.data.access_token);
        localStorage.setItem("admin", JSON.stringify(response.data.admin)); // ✅ Store admin details
      }

      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  },

  /**
   * ✅ Logout Admin
   * @returns {Promise<{status: string, message: string}>}
   */
  logout: async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return { status: "error", message: "No active session found." };

      await axios.post(`${API_URL}/api/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin"); // ✅ Remove stored admin details

      return { status: "success", message: "Logged out successfully." };
    } catch (error: any) {
      return {
        status: "error",
        message: "Logout failed. Please try again.",
      };
    }
  },

  /**
   * ✅ Check if Admin is Authenticated
   * @returns {boolean}
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("adminToken");
  },

  /**
   * ✅ Get Admin Token
   * @returns {string | null}
   */
  getToken: (): string | null => {
    return localStorage.getItem("adminToken");
  },

  /**
   * ✅ Get Authenticated Admin Details
   * @returns {Promise<{status: string, message: string, admin?: any}>}
   */
  getAdminDetails: async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return { status: "error", message: "Not authenticated" };

      const response = await axios.get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: "Failed to fetch admin details.",
      };
    }
  },
};

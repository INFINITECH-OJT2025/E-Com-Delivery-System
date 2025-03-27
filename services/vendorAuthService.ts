import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/vendor";
type VendorLoginResponse = {
  success?: boolean;
  status: "success" | "error";
  message?: string;
  data?: {
    access_token: string;
    user: any; // Replace `any` with your actual vendor user type
  };
};

export const VendorAuthService = {
  // ✅ Login
  async login(email: string, password: string): Promise<VendorLoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/api/vendor/auth/login`, { email, password });
  
      if (response.data.status === "success") {
        const { access_token, user } = response.data.data;
        localStorage.setItem("vendorToken", access_token);
        localStorage.setItem("vendor", JSON.stringify(user));
      }
  
      return response.data;
    } catch (error: any) {
      console.error("Login Error:", error);
      return {
        status: "error",
        message: error?.response?.data?.message || "Login failed",
      };
    }
  },
  
  // ✅ Register Vendor
  async register(vendorData: any) {
    try {
      const response = await axios.post(`${API_URL}/api/vendor/auth/register`, vendorData);
      return response.data;
    } catch (error) {
      console.error("Register Vendor Error:", error);
      return { success: false, message: "Something went wrong. Please try again." };
    }
  },

  // ✅ Logout
  async logout() {
    const token = localStorage.getItem("vendorToken");

    if (!token) {
      return { success: false, message: "Vendor not logged in" };
    }

    try {
      await axios.post(`${API_URL}/api/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });

      // Clear vendor data and token
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("vendor");
      
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout Error:", error);
      return { success: false, message: "Something went wrong. Please try again." };
    }
  },

  // ✅ Get Authenticated Vendor
  async getAuthenticatedVendor() {
    const token = localStorage.getItem("vendorToken");
    if (!token) return null;

    try {
      const response = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching vendor:", error);
      return null;
    }
  },

  // ✅ Get Authorization Headers
  getAuthHeaders() {
    const token = localStorage.getItem("vendorToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // ✅ Get Vendor from localStorage
  getVendorFromLocalStorage() {
    const vendor = localStorage.getItem("vendor");
    return vendor ? JSON.parse(vendor) : null;
  },
};

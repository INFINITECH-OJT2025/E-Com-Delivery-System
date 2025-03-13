import axios from "axios";

const API_URL = "/api/vendor/auth"; // Base URL for vendor authentication API

export const VendorAuthService = {
  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  async register(vendorData: any) {
    const response = await axios.post(`${API_URL}/register`, vendorData);
    return response.data;
  },

  async logout() {
    const token = localStorage.getItem("vendorToken");
    await axios.post(`${API_URL}/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("vendorToken");
  },

  async getAuthenticatedUser() {
    const token = localStorage.getItem("vendorToken");
    if (!token) return null;

    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching vendor:", error);
      return null;
    }
  },
};

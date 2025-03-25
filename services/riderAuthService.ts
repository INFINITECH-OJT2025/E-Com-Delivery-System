import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/riders";

export const RiderAuthService = {
  // ✅ Rider Login
  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/api/riders/login`, { email, password });

      if (response.data.status) {
        console.log("Login successful, storing data...");
        // Store the access token and rider data in localStorage
        localStorage.setItem("riderToken", response.data.data.access_token);
        localStorage.setItem("rider", JSON.stringify(response.data.data.user));

        console.log("Stored Token:", response.data.data.access_token);
        console.log("Stored Rider:", response.data.data.user);
      }

      return response.data;
    } catch (error) {
      console.error("Rider Login Error:", error);
      return { success: false, message: "Invalid Credentials" };
    }
  },

  // ✅ Register Rider
  async register(riderData: any) {
    try {
      const response = await axios.post(`${API_URL}/api/riders/register`, riderData);
      return response.data;
    } catch (error) {
      console.error("Register Rider Error:", error);
      return { success: false, message: "Something went wrong. Please try again." };
    }
  },

  // ✅ Logout
  async logout() {
    const token = localStorage.getItem("riderToken");

    if (!token) {
      return { success: false, message: "Rider not logged in" };
    }

    try {
      await axios.post(`${API_URL}/api/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });

      // Clear rider data and token
      localStorage.removeItem("riderToken");
      localStorage.removeItem("rider");
      
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout Error:", error);
      return { success: false, message: "Something went wrong. Please try again." };
    }
  },

  // ✅ Get Authenticated Rider
  async getAuthenticatedRider() {
    const token = localStorage.getItem("riderToken");
    if (!token) return null;

    try {
      const response = await axios.get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching rider:", error);
      return null;
    }
  },

  // ✅ Get Authorization Headers
  getAuthHeaders() {
    const token = localStorage.getItem("riderToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // ✅ Get Rider from localStorage
  getRiderFromLocalStorage() {
    const rider = localStorage.getItem("rider");
    return rider ? JSON.parse(rider) : null;
  },
};

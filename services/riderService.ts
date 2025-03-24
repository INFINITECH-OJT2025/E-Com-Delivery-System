import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const riderService = {
  /**
   * ✅ Fetch all riders with earnings (Paginated)
   * @param page - Current page
   * @param search - Search query (optional)
   * @param status - Status filter (optional)
   */
  fetchRiders: async (page: number = 1, search: string = "", status: string = "") => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${API_URL}/api/admin/riders`, {
        params: { page, search, status },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data;
    } catch (error) {
      console.error("Error fetching riders:", error);
      return { riders: [], total_platform_earnings: 0, message: "Failed to fetch riders." };
    }
  },

  /**
   * ✅ Update rider status (approve or ban)
   * @param riderId - Rider ID to update
   * @param action - Action to perform: "approve" or "ban"
   */
  updateRiderStatus: async (riderId: number, action: "approve" | "ban") => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `${API_URL}/api/admin/riders/${riderId}/status`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(`Error updating rider status (${action}):`, error);
      throw new Error(error.response?.data?.message || "Failed to update rider status.");
    }
  },
};

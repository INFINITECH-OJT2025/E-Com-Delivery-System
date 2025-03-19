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
      const token = localStorage.getItem("adminToken"); // ✅ Ensure admin token is used
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
};

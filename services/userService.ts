import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const ADMIN_TOKEN = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

export const userService = {
 /**
 * ✅ Get all users (with pagination, filters & sorting)
 * @param {number} page - Current page number
 * @param {string} search - Search query
 * @param {string} status - User status filter (optional)
 * @param {string} sortColumn - Column to sort by (optional)
 * @param {string} sortDirection - Sorting direction (asc/desc)
 */
fetchUsers: async (
    page: number = 1,
    search: string = "",
    status: string = "",
    sortColumn: string = "id", // ✅ Default sort by ID
    sortDirection: string = "asc" // ✅ Default ascending order
  ) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        params: { page, search, status, sortColumn, sortDirection },
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return { data: [], message: "Failed to fetch users." };
    }
  },
  
  /**
   * ✅ Update user status (Activate, Suspend, Deactivate)
   * @param {number} userId - User ID
   * @param {string} status - New status (active, suspended, deactivated)
   */
  updateUserStatus: async (userId: number, status: string) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/update-status`,
        { status },
        { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user status:", error);
      return { status: "error", message: "Failed to update status." };
    }
  },

  /**
   * ✅ Delete user (Soft delete)
   * @param {number} userId - User ID
   */
  deleteUser: async (userId: number) => {
    try {
      const response = await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      return { status: "error", message: "Failed to delete user." };
    }
  },
};

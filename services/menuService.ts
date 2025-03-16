"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
import axios from "axios";

export const menuService = {
  /**
   * ✅ Fetch all menu items for the authenticated vendor
   */
  async fetchMenu() {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await axios.get(`${API_URL}/api/vendor/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return menuService.handleError(error, "Failed to fetch menu items");
    }
  },

  /**
   * ✅ Create a new menu item
   */
  async createMenu(formData: FormData) {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await axios.post(`${API_URL}/api/vendor/menu`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return menuService.handleError(error, "Failed to create menu item");
    }
  },

  /**
   * ✅ Update an existing menu item
   */
  async updateMenu(menuId: number, formData: FormData) {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await axios.post(`${API_URL}/api/vendor/menu/${menuId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return menuService.handleError(error, "Failed to update menu item");
    }
  },

  /**
   * ✅ Delete a menu item
   */
  async deleteMenu(menuId: number) {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await axios.delete(`${API_URL}/api/vendor/menu/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return menuService.handleError(error, "Failed to delete menu item");
    }
  },

  /**
   * ✅ Handle API errors gracefully
   */
  handleError(error: any, defaultMessage: string) {
    console.error("API Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || defaultMessage,
      data: null,
    };
  },
};

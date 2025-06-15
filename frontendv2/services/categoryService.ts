"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
import { apiHelper } from "@/libs/apiHelper";

export const categoryService = {
    /**
     * ✅ Fetch all restaurant categories
     */
    async fetchRestaurantCategories() {
        try {
            const res = await fetch(`${API_URL}/api/categories/restaurants`, {
                method: "GET",
                headers: { "Accept": "application/json" },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching restaurant categories:", error);
            return { success: false, message: "Failed to fetch restaurant categories" };
        }
    },

    /**
     * ✅ Fetch all menu categories
     */
    async fetchMenuCategories() {
        try {
            const res = await fetch(`${API_URL}/api/categories/menus`, {
                method: "GET",
                headers: { "Accept": "application/json" },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching menu categories:", error);
            return { success: false, message: "Failed to fetch menu categories" };
        }
    },

    /**
     * ✅ Fetch both restaurant & menu categories
     */
    async fetchAllCategories() {
        try {
            const res = await fetch(`${API_URL}/api/categories/all`, {
                method: "GET",
                headers: { "Accept": "application/json" },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching all categories:", error);
            return { success: false, message: "Failed to fetch categories" };
        }
    }
};

"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiHelper } from "@/libs/apiHelper";

export const restaurantService = {
    /**
     * ✅ Fetches a single restaurant by its slug
     * @param {string} slug - The restaurant's unique slug
     */
    async fetchRestaurant(slug) {
        try {
            const res = await fetch(`${API_URL}/api/restaurants/${slug}`);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching restaurant:", error);
            return { success: false, data: null, message: "Failed to fetch restaurant" };
        }
    },

    /**
     * ✅ Fetches all menu items for a restaurant
     * @param {string} slug - The restaurant's unique slug
     */
    async fetchMenu(slug) {
        try {
            const res = await fetch(`${API_URL}/api/restaurants/${slug}/menu`);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching menu:", error);
            return { success: false, data: [], message: "Failed to fetch menu" };
        }
    },

    /**
     * ✅ Fetches restaurant reviews
     * @param {string} slug - The restaurant's unique slug
     */
    async fetchReviews(slug) {
        try {
            const res = await fetch(`${API_URL}/api/restaurants/${slug}/reviews`);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return { success: false, data: [], message: "Failed to fetch reviews" };
        }
    },
};

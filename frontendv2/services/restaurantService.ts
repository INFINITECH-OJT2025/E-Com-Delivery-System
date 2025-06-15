"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiHelper } from "@/libs/apiHelper";

export const restaurantService = {
    /**
     * ✅ Fetches all restaurants dynamically
     * - Can include user's latitude & longitude for location-based filtering
     * @param {number} [latitude] - User's latitude (optional)
     * @param {number} [longitude] - User's longitude (optional)
     */
    async fetchAll(latitude?: number, longitude?: number) {
        try {
            let url = `${API_URL}/api/restaurants`;
            if (latitude && longitude) {
                url += `?lat=${latitude}&lng=${longitude}`;
            }

            const res = await fetch(url);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching restaurants:", error);
            return { success: false, data: [], message: "Failed to fetch restaurants" };
        }
    },

    /**
     * ✅ Fetches a single restaurant by its slug
     * @param {string} slug - The restaurant's unique slug
     */
    async fetchRestaurant(slug: string) {
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
    async fetchMenu(slug: string) {
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
    async fetchReviews(slug: string) {
        try {
            const res = await fetch(`${API_URL}/api/restaurants/${slug}/reviews`);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return { success: false, data: [], message: "Failed to fetch reviews" };
        }
    },

    /**
     * ✅ Fetches estimated delivery fee based on user's selected address
     * @param {number} restaurantId - ID of the restaurant
     * @param {number} latitude - User's latitude
     * @param {number} longitude - User's longitude
     */
    async fetchDeliveryFee(restaurantId: number, latitude: number, longitude: number) {
        try {
            const res = await fetch(`${API_URL}/api/restaurants/${restaurantId}/delivery-fee?lat=${latitude}&lng=${longitude}`);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching delivery fee:", error);
            return { success: false, data: null, message: "Failed to fetch delivery fee" };
        }
    },
};

"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiHelper } from "@/libs/apiHelper";

export const deliveryFeeService = {
    /**
     * ✅ Fetch delivery fee for a specific restaurant
     * @param {number} restaurantId - The ID of the restaurant
     * @param {number} latitude - User's latitude
     * @param {number} longitude - User's longitude
     */
    async fetchDeliveryFee(restaurantId: number, latitude?: number, longitude?: number) {
        try {
            if (!latitude || !longitude) {
                return { success: false, data: null, message: "Location required" };
            }

            const res = await fetch(`${API_URL}/api/restaurants/${restaurantId}/delivery-fee?lat=${latitude}&lng=${longitude}`);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching delivery fee:", error);
            return { success: false, data: null, message: "Failed to fetch delivery fee" };
        }
    },
};

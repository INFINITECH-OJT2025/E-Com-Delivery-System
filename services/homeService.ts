"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiHelper } from "@/libs/apiHelper";

export const homeService = {
    /**
     * ✅ Fetch home data (promos, categories, only nearby restaurants)
     * @param {number} latitude - User's latitude
     * @param {number} longitude - User's longitude
     */
    async fetchHomeData(latitude?: number, longitude?: number) {
        try {
            let url = `${API_URL}/api/home`;

            // ✅ Append location params if available
            if (latitude && longitude) {
                url += `?lat=${latitude}&lng=${longitude}`;
            }

            const res = await fetch(url);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching home data:", error);
            return { success: false, data: { promos: [], categories: [], restaurants: [] }, message: "Failed to fetch home data" };
        }
    },
};

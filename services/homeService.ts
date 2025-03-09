"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiHelper } from "@/libs/apiHelper";

export const homeService = {
    /**
     * ✅ Fetch home data (promos, categories, only nearby restaurants)
     * @param {number} latitude - User's latitude
     * @param {number} longitude - User's longitude
     * @param {object} filters - Active filters selected by the user
     */
    async fetchHomeData(latitude?: number, longitude?: number, filters: Record<string, any> = {}) {
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

            let url = `${API_URL}/api/home?lat=${latitude}&lng=${longitude}`;

            // ✅ Append filters dynamically
            Object.keys(filters).forEach((key) => {
                if (filters[key]) {
                    url += `&${key}=${filters[key]}`;
                }
            });

            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(url, {
                method: "GET",
                headers: headers,
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching home data:", error);
            return {
                success: false,
                data: { promos: [], categories: [], restaurants: [] },
                message: "Failed to fetch home data",
            };
        }
    },
};

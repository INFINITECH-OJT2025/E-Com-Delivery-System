"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api";
import { apiHelper } from "@/libs/apiHelper";

export const searchService = {
    /**
     * ✅ Search for restaurants & menu items
     * @param {string} query - The search term
     * @param {number} latitude - User's latitude (optional)
     * @param {number} longitude - User's longitude (optional)
     * @returns {Promise} - Search results from API
     */
    async search(query: string, latitude?: number, longitude?: number, filters: Record<string, any> = {}) {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) return { success: false, message: "Unauthorized" };
            const params = new URLSearchParams({ query });
    
            if (latitude && longitude) {
                params.append("lat", latitude.toString());
                params.append("lng", longitude.toString());
            }
    
            // ✅ Add Filters to the Request (Only Include Defined Filters)
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, String(value));
                }
            });
    
            const res = await fetch(`${API_URL}/api/search?${params.toString()}`, {
                method: "GET",
                headers: { "Accept": "application/json" ,  "Authorization": `Bearer ${token}`,},
            });
    
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error searching:", error);
            return { success: false, message: "Failed to search" };
        }
    },    

    /**
     * ✅ Fetch recent search history (requires auth)
     * @returns {Promise} - Recent searches
     */
    async fetchSearchHistory() {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/search/recent`, { // ✅ Fixed Route
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching search history:", error);
            return { success: false, message: "Failed to fetch search history" };
        }
    },

    /**
     * ✅ Fetch popular searches
     * @returns {Promise} - Popular search terms
     */
    async fetchPopularSearches() {
        try {
            const res = await fetch(`${API_URL}/api/search/popular`, { // ✅ Fixed Route
                method: "GET",
                headers: { "Accept": "application/json" },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching popular searches:", error);
            return { success: false, message: "Failed to fetch popular searches" };
        }
    },
      /**
     * ✅ Delete a single recent search
     */
    async deleteRecentSearch(query: string) {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) return { success: false, message: "Unauthorized" };

            const res = await fetch(`${API_URL}/api/search/recent/${encodeURIComponent(query)}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error(`❌ Error Deleting Search "${query}":`, error);
            return { success: false, message: "Failed to delete search history." };
        }
    },

    /**
     * ✅ Clear all recent searches
     */
    async clearAllRecentSearches() {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) return { success: false, message: "Unauthorized" };

            const res = await fetch(`${API_URL}/api/search/recent`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("❌ Error Clearing Search History:", error);
            return { success: false, message: "Failed to clear search history." };
        }
    }

};

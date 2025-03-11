"use client";

import { apiHelper } from "@/libs/apiHelper";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const favoriteService = {
    /** ✅ Fetch User's Favorite Items (Fixed Location Handling) */
    async fetchFavorites() {
        try {
            const token = localStorage.getItem("auth_token"); // ✅ Get token from localStorage
            const selectedAddress = localStorage.getItem("selected_address");

            let lat = null, lng = null;
            if (selectedAddress) {
                try {
                    const parsed = JSON.parse(selectedAddress);
                    lat = parsed.latitude || null;
                    lng = parsed.longitude || null;
                } catch (error) {
                    console.error("Error parsing selected_address:", error);
                }
            }

            if (!lat || !lng) {
                console.error("No valid location found in selected_address.");
                return { success: false, message: "Location required to fetch favorites." };
            }

            const res = await fetch(`${API_URL}/api/favorites?lat=${lat}&lng=${lng}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const response = await apiHelper.handleResponse(res);
            
            return {
                success: response.success,
                data: {
                    favorites: response.data?.favorites ?? [],
                    similar_restaurants: response.data?.similar_restaurants ?? [] // ✅ Ensure similar restaurants are always included
                }
            };
        } catch (error) {
            console.error("Error fetching favorites:", error);
            return { success: false, message: "Failed to load favorites." };
        }
    },
    /**
     * ✅ Add to Favorites
     * @param { "menu" | "restaurant" } favoritableType - The type of favorite (menu or restaurant)
     * @param {number} favoritableId - The ID of the item to favorite
     */
    async addFavorite(favoritableType: "menu" | "restaurant", favoritableId: number) {
        try {
            const token = localStorage.getItem("auth_token"); // ✅ Get token from localStorage
            const res = await fetch(`${API_URL}/api/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // ✅ Use Bearer Token
                },
                body: JSON.stringify({
                    favoritable_type: favoritableType,
                    favoritable_id: favoritableId,
                }),
            });
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error adding favorite:", error);
            return { success: false, message: "Failed to add favorite." };
        }
    },

    /**
     * ✅ Remove from Favorites
     * @param {number} favoritableId - The ID of the favorite to remove
     */
    async removeFavorite(favoritableId: number) {
        try {
            const token = localStorage.getItem("auth_token"); // ✅ Get token from localStorage
            const res = await fetch(`${API_URL}/api/favorites/${favoritableId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // ✅ Use Bearer Token
                },
            });
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error removing favorite:", error);
            return { success: false, message: "Failed to remove favorite." };
        }
    },
};

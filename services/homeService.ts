const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiHelper } from "@/libs/apiHelper";
export const homeService = {
    /**
     * ✅ Fetches home data (promos, categories, restaurants)
     */
    async fetchHomeData() {
        try {
            const res = await fetch(`${API_URL}/api/home`);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching home data:", error);
            return { success: false, data: { promos: [], categories: [], restaurants: [] }, message: "Failed to fetch home data" };
        }
    },
};

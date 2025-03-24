"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
import { apiHelper } from "@/libs/apiHelper";

export const checkoutService = {
    /**
     * ✅ Place an order (Pass full order payload)
     */
    async placeOrder(payload: any) {  // 🚀 Accept full checkout payload
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/orders`, { // ✅ No need for `/api/orders`, API_URL already includes /api
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Bearer Token
                },
                body: JSON.stringify(payload), // ✅ Send full payload
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error placing order:", error);
            return { success: false, message: "Failed to place order" };
        }
    },

    /**
     * ✅ Fetch the user's order history
     */
    async fetchOrders() {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/orders`, { // ✅ No need for `/api/orders`
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching orders:", error);
            return { success: false, message: "Failed to fetch orders" };
        }
    },
        /**
     * ✅ Fetch restaurant details (to check order types like pickup/delivery)
     */
        async fetchRestaurant(restaurantId: number) {
            const token = localStorage.getItem("auth_token");
            if (!token) return { success: false, message: "Unauthorized" };
    
            try {
                const res = await fetch(`${API_URL}/api/restaurants/by-id/${restaurantId}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
    
                return await apiHelper.handleResponse(res);
            } catch (error) {
                console.error("Error fetching restaurant:", error);
                return { success: false, message: "Failed to fetch restaurant details" };
            }
        }
    
};

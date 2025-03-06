"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api";
import { apiHelper } from "@/libs/apiHelper";

export const checkoutService = {
    /**
     * ✅ Place an order (Only COD for now)
     */
    async placeOrder(address_id: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Added Bearer Token
                },
                body: JSON.stringify({
                    address_id,
                    payment_method: "cod", // 🚀 Only COD for now
                }),
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
            const res = await fetch(`${API_URL}/api/orders`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Added Bearer Token
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching orders:", error);
            return { success: false, message: "Failed to fetch orders" };
        }
    }
};

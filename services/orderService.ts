"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiHelper } from "@/libs/apiHelper";

export const orderService = {
    async checkout() {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error during checkout:", error);
            return { success: false, message: "Checkout failed. Try again later." };
        }
    },
     /**
     * ✅ Fetch orders for the authenticated user
     */
     async getUserOrders() {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const response = await fetch(`${API_URL}/api/orders`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Authenticate request
                },
            });

            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("Error fetching orders:", error);
            return { success: false, message: "Failed to fetch orders" };
        }
    },

    /**
     * ✅ Fetch a single order by ID
     */
    async getOrderById(orderId: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("Error fetching order details:", error);
            return { success: false, message: "Failed to fetch order details" };
        }
    },
};

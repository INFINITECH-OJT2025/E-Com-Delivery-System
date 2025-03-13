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
     * ✅ Fetch orders for the authenticated user (with location support)
     */
    async getUserOrders() {
        const token = localStorage.getItem("auth_token");
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

        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const url = lat && lng 
                ? `${API_URL}/api/orders?lat=${lat}&lng=${lng}` // ✅ Include location in API request
                : `${API_URL}/api/orders`; // ✅ Default URL if no location is available

            const response = await fetch(url, {
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
     * ✅ Cancel an order
     */
    async cancelOrder(orderId: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("Error canceling order:", error);
            return { success: false, message: "Failed to cancel order." };
        }
    },
};

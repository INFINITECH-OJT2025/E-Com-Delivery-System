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
};

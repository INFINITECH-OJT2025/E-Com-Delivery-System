"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api";
import { apiHelper } from "@/libs/apiHelper";

export const userService = {
    /**
     * ✅ Fetch the logged-in user details
     */
    async fetchUser() {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/user`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Bearer Token
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching user:", error);
            return { success: false, message: "Failed to fetch user" };
        }
    },

    /**
     * ✅ Update user profile (Name, Phone, etc.)
     */
    async updateProfile(data: { name?: string; phone_number?: string }) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Bearer Token
                },
                body: JSON.stringify(data),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error updating profile:", error);
            return { success: false, message: "Failed to update profile" };
        }
    }
};

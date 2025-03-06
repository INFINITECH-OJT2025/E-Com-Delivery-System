"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiHelper } from "@/libs/apiHelper";

export const authService = {
    // ✅ Login User (Using API Token)
    async login(credentials: { email: string; password: string }) {
        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(credentials),
            });

            const responseData = await apiHelper.handleResponse(res);

            if (responseData.success && responseData.access_token) {
                localStorage.setItem("authToken", responseData.access_token); // ✅ Store Bearer token
            }

            return responseData;
        } catch (error) {
            console.error("❌ Network error in login:", error);
            throw error;
        }
    },

    // ✅ Fetch Authenticated User
    async getAuthenticatedUser() {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return { success: false, message: "No authentication token found" };

            const res = await fetch(`${API_URL}/api/auth/me`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Include Bearer token
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("❌ Network error in getAuthenticatedUser:", error);
            throw error;
        }
    },

    // ✅ Logout User
    async logout() {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return { success: false, message: "No authentication token found" };

            const res = await fetch(`${API_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Include Bearer token
                },
            });

            localStorage.removeItem("authToken"); // ✅ Clear token after logout

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("❌ Network error in logout:", error);
            throw error;
        }
    },
};

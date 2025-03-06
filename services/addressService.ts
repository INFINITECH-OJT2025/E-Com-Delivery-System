"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api";
import { apiHelper } from "@/libs/apiHelper";

export const addressService = {
    /**
     * ✅ Fetch all user addresses
     */
    async fetchAddresses() {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/user/addresses`, {  // ✅ Fixed API resource route
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching addresses:", error);
            return { success: false, message: "Failed to fetch addresses" };
        }
    },

    /**
     * ✅ Fetch a single address by ID
     */
    async getAddressById(id: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/user/addresses/${id}`, {  // ✅ Fixed API resource route
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching address:", error);
            return { success: false, message: "Failed to fetch address" };
        }
    },

    /**
     * ✅ Add a new address
     */
    async addAddress(address: { label: string, address: string, latitude: number, longitude: number, notes?: string }) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/user/addresses`, {  // ✅ Correct API path
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(address),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error adding address:", error);
            return { success: false, message: "Failed to add address" };
        }
    },

    /**
     * ✅ Update an existing address
     */
    async updateAddress(id: number, data: { label?: string; address?: string; latitude?: number; longitude?: number; is_default?: boolean; notes?: string }) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/user/addresses/${id}`, {  // ✅ Fixed API resource route
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error updating address:", error);
            return { success: false, message: "Failed to update address" };
        }
    },

    /**
     * ✅ Delete an address
     */
    async deleteAddress(id: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/user/addresses/${id}`, {  // ✅ Fixed API resource route
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error deleting address:", error);
            return { success: false, message: "Failed to delete address" };
        }
    },

    /**
     * ✅ Set an address as default
     */
    async setDefaultAddress(id: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/user/addresses/${id}/set-default`, {  // ✅ Corrected API path
                method: "PATCH", // ✅ Uses PATCH for partial updates
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error setting default address:", error);
            return { success: false, message: "Failed to set default address" };
        }
    },
};

"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api";
import { apiHelper } from "@/libs/apiHelper";

export const voucherService = {
    /**
     * ✅ Fetch all available vouchers (Public, No Auth Required)
     */
    async getAvailableVouchers() {
        try {
            const res = await fetch(`${API_URL}/api/vouchers`);
            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error fetching vouchers:", error);
            return { success: false, data: null, message: "Failed to fetch vouchers" };
        }
    },

    /**
     * ✅ Apply a voucher (Authenticated Request)
     */
    async applyVoucher(code: string, orderTotal: number) {
        const token = localStorage.getItem("auth_token"); // ✅ Fetch Token
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/vouchers/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Include Auth Token
                },
                body: JSON.stringify({ code, order_total: orderTotal }),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error applying voucher:", error);
            return { success: false, message: "Failed to apply voucher" };
        }
    },

    /**
     * ✅ Admin: Create a new voucher
     */
    async createVoucher(data: any) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/vouchers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Require Admin Auth
                },
                body: JSON.stringify(data),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error creating voucher:", error);
            return { success: false, message: "Failed to create voucher" };
        }
    },

    /**
     * ✅ Admin: Update a voucher
     */
    async updateVoucher(id: number, data: any) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/vouchers/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Require Admin Auth
                },
                body: JSON.stringify(data),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error updating voucher:", error);
            return { success: false, message: "Failed to update voucher" };
        }
    },

    /**
     * ✅ Admin: Delete a voucher
     */
    async deleteVoucher(id: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/vouchers/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`, // ✅ Require Admin Auth
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error deleting voucher:", error);
            return { success: false, message: "Failed to delete voucher" };
        }
    },
};

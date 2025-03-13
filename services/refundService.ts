"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiHelper } from "@/libs/apiHelper";

// ✅ Define Refund Interface
interface Refund {
    id: number;
    order_id: number;
    user_id: number;
    status: "pending" | "approved" | "denied";
    amount?: number; // ✅ Amount should be optional when requesting
    reason: string;
    created_at: string;
    updated_at: string;
    image?: string;
}

// ✅ Standardized Response Type
interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

// ✅ Refund Service
export const refundService = {
    /**
     * ✅ Fetch all refunds for the authenticated user
     */
    async getUserRefunds(): Promise<ApiResponse<Refund[]>> {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const response = await fetch(`${API_URL}/api/refunds`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("❌ Error fetching refunds:", error);
            return { success: false, message: "Failed to fetch refunds" };
        }
    },

    /**
     * ✅ Fetch a single refund by ID
     */
    async getRefundById(refundId: number): Promise<ApiResponse<Refund>> {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const response = await fetch(`${API_URL}/api/refunds/${refundId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("❌ Error fetching refund details:", error);
            return { success: false, message: "Failed to fetch refund details" };
        }
    },

    /**
     * ✅ Submit a new refund request (REMOVED amount validation ✅)
     */
    async requestRefund(orderId: number, amount: number, reason: string, image?: File): Promise<ApiResponse<Refund>> {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };
    
        const formData = new FormData();
        formData.append("order_id", orderId.toString());
        formData.append("amount", amount.toString());
        formData.append("reason", reason.trim());
        if (image) {
            formData.append("image_proof", image); // ✅ Change "image" to "image_proof"
        }
    
        try {
            const response = await fetch(`${API_URL}/api/refunds`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json", // ✅ Fix for Sanctum + FormData
                },
                body: formData,
            });
    
            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("❌ Error requesting refund:", error);
            return { success: false, message: "Failed to submit refund request" };
        }
    }    
,    

    /**
     * ✅ Cancel a refund request
     */
    async cancelRefund(refundId: number): Promise<ApiResponse> {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const response = await fetch(`${API_URL}/api/refunds/${refundId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("❌ Error canceling refund:", error);
            return { success: false, message: "Failed to cancel refund request" };
        }
    },

    /**
     * ✅ Fetch all refund requests (Admin Only)
     */
    async getAllRefunds(): Promise<ApiResponse<Refund[]>> {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const response = await fetch(`${API_URL}/api/admin/refunds`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("❌ Error fetching all refunds:", error);
            return { success: false, message: "Failed to fetch refunds" };
        }
    },

    /**
     * ✅ Approve or Deny a Refund Request (Admin Only)
     */
    async updateRefundStatus(refundId: number, status: "approved" | "denied", amount: number): Promise<ApiResponse> {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        // ✅ Ensure amount is a valid number when approving
        if (status === "approved" && (isNaN(amount) || amount <= 0)) {
            console.error("❌ Invalid refund amount:", amount);
            return { success: false, message: "Invalid refund amount for approval." };
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/refunds/${refundId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status, amount }),
            });

            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("❌ Error updating refund status:", error);
            return { success: false, message: "Failed to update refund status" };
        }
    },
};

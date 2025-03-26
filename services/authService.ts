"use client";
import { apiHelper } from "@/libs/apiHelper"; // ✅ Import API Helper

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const authService = {
  
    forgotPassword: async (email: string) => {
        try {
            const response = await fetch(`${API_URL}/api/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
    
            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("Forgot Password Error:", error);
            return { success: false, message: "Something went wrong. Please try again later." };
        }
    },
    
};

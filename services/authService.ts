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
    loginWithGoogle: async (userInfo: {
        email: string;
        name: string;
        picture?: string;
      }) => {
        try {
          const response = await fetch(`${API_URL}/api/riders/login/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userInfo), // send full user info
          });
      
          const result = await apiHelper.handleResponse(response);
      
          if (result.success) {
            localStorage.setItem("riderToken", response.data.access_token);
            localStorage.setItem("rider", JSON.stringify(response.data.user));
          }
      
          return result;
        } catch (error) {
          console.error("Google Login Error:", error);
          return {
            success: false,
            message: "Something went wrong with Google login. Please try again.",
          };
        }
      },
      
};

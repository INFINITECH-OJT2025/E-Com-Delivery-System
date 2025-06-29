"use client";
import { apiHelper } from "@/libs/apiHelper"; // ✅ Import API Helper

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const authService = {
    // ✅ Login
    login: async (credentials: { email: string; password: string }) => {
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const result = await apiHelper.handleResponse(response);

            if (result.success) {
                localStorage.setItem("auth_token", result.data.access_token);
                localStorage.setItem("user", JSON.stringify(result.data.user));
            }

            return result;
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: "Something went wrong. Please try again." };
        }
    },  // ✅ Login with Google (Add this method to handle Google login)
    loginWithGoogle: async (userInfo: {
        email: string;
        name: string;
        picture?: string;
      }) => {
        try {
          const response = await fetch(`${API_URL}/api/login/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userInfo), // send full user info
          });
      
          const result = await apiHelper.handleResponse(response);
      
          if (result.success) {
            localStorage.setItem("auth_token", result.data.access_token);
            localStorage.setItem("user", JSON.stringify(result.data.user));
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
      

    // ✅ Check Email
    checkEmail: async (email: string) => {
        try {
            const response = await fetch(`${API_URL}/api/email-check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await apiHelper.handleResponse(response);

            if (!result.success) {
                return { success: false, message: result.message || "Error checking email." };
            }

            return {
                success: true,
                exists: !!result.data?.exists, // ✅ Ensures boolean value
                verified: !!result.data?.verified
            };
        } catch (error) {
            console.error("Check Email Error:", error);
            return { success: false, message: "Something went wrong. Please try again." };
        }
    },

    // ✅ Register
    register: async (userData: {
        name: string;
        email: string;
        phone_number: string;
        password: string;
        password_confirmation: string;
    }) => {
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            return await apiHelper.handleResponse(response);
        } catch (error) {
            console.error("Register Error:", error);
            return { success: false, message: "Something went wrong. Please try again." };
        }
    },
// ✅ Resend Verification (Email & OTP)
resendVerification: async (email: string) => {
    try {
        // ✅ Ensure `email` is a string before sending
        if (typeof email !== "string" || !email.trim()) {
            return { success: false, message: "Invalid email format." };
        }

        // ✅ Send request with correctly structured JSON body
        const response = await fetch(`${API_URL}/api/resend-verification`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email.trim() }) // ✅ Ensure email is trimmed & formatted correctly
        });

        // ✅ Use API helper to process response
        return await apiHelper.handleResponse(response);

    } catch (error) {
        console.error("Resend Verification Error:", error);
        return { success: false, message: "Failed to resend verification email. Please try again later." };
    }
},

    // ✅ Verify OTP
// ✅ FIXED: Ensure correct JSON structure before sending the request
verifyOtp: async (email: string, otp: string) => {
    try {
        const payload = {
            email: email, // ✅ Ensure it's a string, not an object
            otp: otp
        };

        console.log("Sending payload:", payload); // Debugging - check console to verify payload

        const response = await fetch(`${API_URL}/api/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload), // ✅ Flat JSON structure
        });

        const result = await apiHelper.handleResponse(response); // ✅ Handle API response properly

        if (result.success) {
            return {
                success: true,
                exists: result.data?.exists ?? false,
                verified: result.data?.verified ?? false,
            };
        } else {
            return {
                success: false,
                message: result?.message || "OTP verification failed.",
            };
        }
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again.",
        };
    }
},

    // ✅ Logout
    logout: async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) return { success: false, message: "User not logged in" };

            const response = await fetch(`${API_URL}/api/logout`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            });

            const result = await apiHelper.handleResponse(response);
            if (result.success) {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
            }

            return result;
        } catch (error) {
            console.error("Logout Error:", error);
            return { success: false, message: "Something went wrong. Please try again." };
        }
    },

    // ✅ Get Authenticated User
    getUser: () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    // ✅ Get Authorization Headers
    getAuthHeaders: () => {
        const token = localStorage.getItem("auth_token");
        return token ? { "Authorization": `Bearer ${token}` } : {};
    },
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
    async changePassword(data: { currentPassword: string; newPassword: string }) {
        const token = localStorage.getItem("auth_token");
      
        // Ensure the token is available before proceeding
        if (!token) {
          return { status: "error", message: "Authentication token not found" };
        }
      
        try {
          const response = await fetch(`${API_URL}/api/change-password`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              current_password: data.currentPassword,
              new_password: data.newPassword,
              new_password_confirmation: data.newPassword, // Add confirmation field if needed
            }),
          });
      
          const result = await response.json();
      
          if (!response.ok) {
            throw new Error(result.message || "Failed to change password.");
          }
      
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An error occurred";
          return { status: "error", message: errorMessage };
        }
      },
};

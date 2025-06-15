import { apiHelper } from "@/libs/apiHelper";

export const authService = {
    // ✅ Check if Email Exists & Verified
    async checkEmail(email: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/email-check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await apiHelper.handleResponse(res);

            // ✅ Ensure we correctly access `exists` and `verified`
            if (result.success && result.data) {
                return {
                    success: true,
                    exists: result.data.exists ?? false,  // ✅ Ensure boolean values
                    verified: result.data.verified ?? false,
                };
            }

            return { success: false, message: result.message || "Error checking email." };
        } catch (error) {
            console.error("Network error in checkEmail:", error);
            return { success: false, message: "Network error. Try again later." };
        }
    },

    // ✅ Register a New User
    async register(userData: Record<string, any>) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            return await apiHelper.handleResponse(res); // ✅ No duplicate reading of response body
        } catch (error) {
            console.error("Network error in register:", error);
            throw error;
        }
    },

    // ✅ Resend Verification (Supports OTP & Email)
    async resendVerification({ email, type }: { email: string; type: "otp" | "email_verification" }) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type }),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Network error in resendVerification:", error);
            throw error;
        }
    },

    // ✅ Verify Email with OTP
    async verifyOtp({ email, otp }: { email: string; otp: string }) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Network error in verifyOtp:", error);
            throw error;
        }
    },

    // ✅ Login User
    async login(credentials: { email: string; password: string }) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Network error in login:", error);
            throw error;
        }
    },

    // ✅ Logout User (Requires Auth Token)
    async logout(token: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Network error in logout:", error);
            throw error;
        }
    },

    // ✅ Get Authenticated User Data
    async getAuthenticatedUser(token: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Network error in getAuthenticatedUser:", error);
            throw error;
        }
    },
};

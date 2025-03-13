"use client";

import { useState } from "react";
import { Button, Spinner } from "@heroui/react"; // ✅ Use Hero UI Spinner
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService"; // ✅ Import Auth Service

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);

        try {
            const response = await authService.logout();
            
            if (response.success) {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
                router.replace("/login"); // ✅ Redirect to login page
            } else {
                console.error("Logout failed:", response.message);
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="m-4">
            <Button 
                className="w-full bg-red-500 text-white flex items-center justify-center gap-2"
                onPress={handleLogout}
                isDisabled={loading}
            >
                {loading ? <Spinner size="sm" className="text-white" /> : <LogOut className="w-5 h-5" />}
                {loading ? "Logging out..." : "Log out"}
            </Button>
        </div>
    );
}

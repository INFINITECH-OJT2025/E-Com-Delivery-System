"use client";

import { Button } from "@heroui/react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <div className="m-4">
            <Button 
                className="w-full bg-red-500 text-white flex items-center justify-center gap-2"
                onPress={handleLogout}
            >
                <LogOut className="w-5 h-5" /> Log out
            </Button>
        </div>
    );
}

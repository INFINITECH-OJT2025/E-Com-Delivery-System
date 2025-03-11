"use client";

import { useState, useEffect } from "react";
import { Avatar, Button, Card } from "@heroui/react";
import { LogOut, Settings, Ticket, User, Wallet } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import ProfileMenu from "@/components/ProfileMenu";
import LogoutButton from "@/components/LogoutButton";

export default function ProfilePage() {
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ✅ Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white shadow-md">
                <h1 className="text-lg font-bold">Account</h1>
                <Settings className="w-6 h-6 text-gray-500" />
            </div>

            {/* ✅ Profile Card */}
            <ProfileCard user={user} />

            {/* ✅ Profile Menu (Perks & General) */}
            <ProfileMenu />

            {/* ✅ Logout Button */}
            <LogoutButton />
        </div>
    );
}

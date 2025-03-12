"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Spinner } from "@heroui/react"; // ✅ Import Hero UI Spinner
import ProfileCard from "@/components/ProfileCard";
import ProfileMenu from "@/components/ProfileMenu";
import LogoutButton from "@/components/LogoutButton";
import { useUser } from "@/context/userContext"; // ✅ Get User Data from Context

export default function ProfilePage() {
    const { user, fetchUser } = useUser(); // ✅ Get user & fetchUser function from context
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            await fetchUser(); // ✅ Fetch user from API
            setLoading(false);
        };
        loadUser();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ✅ Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white shadow-md">
                <h1 className="text-lg font-bold">Account</h1>
                <Settings className="w-6 h-6 text-gray-500" />
            </div>

            {/* ✅ Show Spinner if Loading */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Spinner size="lg" className="text-primary" />
                </div>
            ) : (
                <>
                    {/* ✅ Pass user as a prop to keep ProfileCard.tsx clean */}
                    <ProfileCard user={user} />

                    {/* ✅ Profile Menu (Perks & General) */}
                    <ProfileMenu />

                    {/* ✅ Logout Button */}
                    <LogoutButton />
                </>
            )}
        </div>
    );
}

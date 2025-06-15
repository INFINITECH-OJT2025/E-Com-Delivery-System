"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/userContext"; // ✅ Import useUser
import { Spinner } from "@heroui/react";
interface CustomerLayoutProps {
    children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
    const router = useRouter();
    const { user, fetchUser } = useUser(); // ✅ Get user & fetchUser method
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                if (!user) {
                    await fetchUser(); // ✅ Ensure user data is fetched before rendering
                }
            } catch (error) {
                console.error("Error checking user authentication:", error);
            } finally {
                setIsChecking(false); // ✅ Mark check as completed
            }
        };

        checkUser();
    }, [user]);

    // ✅ If check is done & user is still null, redirect to login
    useEffect(() => {
        if (!isChecking && !user) {
            router.push("/login");
        }
    }, [isChecking, user, router]);

    // ✅ Show a loading screen while checking authentication
    if (isChecking || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <Spinner />
            <p className="text-gray-600 text-lg mt-3">Checking authentication... please wait.</p>
        </div>
        
        );
    }

    return (
        <div className="w-full h-screen flex flex-col bg-white">
            {/* ✅ Sticky Navbar */}
            <div className="sticky top-0 z-50 w-full bg-white shadow-md">
                <Navbar />
            </div>

            {/* ✅ Only render `children` after authentication is confirmed */}
            <main className="flex-1 overflow-y-auto">{children} </main>
        </div>
    );
}

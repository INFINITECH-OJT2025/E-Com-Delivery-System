"use client";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/cartContext";
import { UserProvider } from "@/context/userContext"; // ✅ Import User Context

interface CustomerLayoutProps {
    children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
    return (
        <UserProvider> {/* ✅ Wrap UserProvider */}
            <CartProvider>
                <div className="w-full min-h-screen flex flex-col bg-white">
                    {/* ✅ Fixed Navbar */}
                    <Navbar />

                    {/* ✅ Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">{children}</div>
                </div>
            </CartProvider>
        </UserProvider>
    );
}

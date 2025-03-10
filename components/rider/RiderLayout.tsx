"use client";

import RiderSidebar from "./RiderSidebar";
import RiderNavbar from "./RiderNavbar";

export default function RiderLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            {/* 🚀 Sidebar (Hidden on mobile, visible on desktop) */}
            <div className="hidden md:flex">
                <RiderSidebar />
            </div>

            {/* 📱 Mobile Navbar & Content */}
            <div className="flex-1 flex flex-col">
                <RiderNavbar />
                <main className="flex-1 p-4 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}

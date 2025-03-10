"use client";

import { useState } from "react";
import { IoMenu, IoNotificationsOutline, IoPersonCircleOutline } from "react-icons/io5";

import RiderSidebar from "./RiderSidebar";

export default function RiderNavbar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <nav className="flex items-center justify-between bg-white shadow-md px-4 py-3 sticky top-0 z-50">
            {/* 🚀 Sidebar Toggle for Mobile */}
            <div className="md:hidden">
                <RiderSidebar />
            </div>
            {/* 🚗 Rider Title */}
            <h1 className="text-lg font-bold text-gray-800">Rider Dashboard</h1>

            {/* 🔔 Notifications & Profile */}
            <div className="flex items-center gap-4">
                <button className="text-gray-700 text-2xl">
                    <IoNotificationsOutline />
                </button>
                <button className="text-gray-700 text-2xl">
                    <IoPersonCircleOutline />
                </button>
            </div>
        </nav>
    );
}

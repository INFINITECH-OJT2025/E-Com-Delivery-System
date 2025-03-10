"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/react";
import { IoHomeOutline, IoBicycleOutline, IoWalletOutline, IoSettingsOutline, IoLogOutOutline, IoMenuOutline } from "react-icons/io5";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RiderSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // ✅ Menu Items
    const menuItems = [
        { name: "Dashboard", path: "/rider/dashboard", icon: <IoHomeOutline className="text-xl" /> },
        { name: "Active Deliveries", path: "/rider/deliveries", icon: <IoBicycleOutline className="text-xl" /> },
        { name: "Earnings", path: "/rider/earnings", icon: <IoWalletOutline className="text-xl" /> },
        { name: "Settings", path: "/rider/settings", icon: <IoSettingsOutline className="text-xl" /> },
    ];

    return (
        <>
            {/* ✅ Mobile Menu Button */}
            <button onClick={() => setIsOpen(true)} className="p-2 text-gray-700 md:hidden">
                <IoMenuOutline className="text-2xl" />
            </button>

            {/* ✅ Sidebar for Mobile (Drawer) */}
            <Drawer isOpen={isOpen} onOpenChange={setIsOpen} placement="left" size="xs">
                <DrawerContent className="bg-white w-64 h-full">
                    <DrawerHeader className="text-lg font-bold text-gray-700 p-4">Rider Menu</DrawerHeader>
                    <DrawerBody className="p-4">
                        <nav className="space-y-3">
                            {menuItems.map((item) => (
                                <Link 
                                    key={item.name} 
                                    href={item.path}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                        pathname === item.path ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                    onClick={() => setIsOpen(false)} // ✅ Close drawer on selection
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* 🚪 Logout Button */}
                        <button className="flex items-center gap-3 p-3 mt-6 w-full text-red-600 hover:bg-gray-100 rounded-lg">
                            <IoLogOutOutline className="text-xl" />
                            Logout
                        </button>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* ✅ Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col bg-white w-64 h-screen p-4 shadow-md">
                <h2 className="text-lg font-bold text-gray-700">Rider Menu</h2>
                <nav className="mt-4 space-y-3">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.name} 
                            href={item.path}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                pathname === item.path ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* 🚪 Logout Button */}
                <button className="flex items-center gap-3 p-3 mt-auto text-red-600 hover:bg-gray-100 rounded-lg">
                    <IoLogOutOutline className="text-xl" />
                    Logout
                </button>
            </aside>
        </>
    );
}

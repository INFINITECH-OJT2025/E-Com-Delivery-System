"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaUtensils,
  FaInfoCircle,
  FaStar,
  FaBars,
  FaChevronLeft,
} from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    setIsVendor(!!token);
  }, [pathname]);

  if (!isVendor) return null;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { href: "/orders", label: "Orders", icon: <FaClipboardList /> },
    { href: "/menu", label: "Menu", icon: <FaUtensils /> },
    { href: "/restaurant/details", label: "Restaurant Details", icon: <FaInfoCircle /> },
    { href: "/reviews", label: "Reviews", icon: <FaStar /> },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen border-r bg-primary-600 text-white shadow-lg transition-all duration-300 
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Sidebar header & collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-primary-500">
        {!collapsed && (
          <span className="text-lg font-bold tracking-wide">E-Com Vendor</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:text-primary-100 transition"
        >
          {collapsed ? <FaBars /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 mt-6 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                ${
                  isActive
                    ? "bg-white text-primary-700 shadow"
                    : "hover:bg-primary-500/70 text-white"
                }
                ${collapsed ? "justify-center px-0" : ""}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

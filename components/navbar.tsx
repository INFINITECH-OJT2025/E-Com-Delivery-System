"use client";

import { useState, useEffect } from "react";
import { useVendorAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Link } from "@heroui/react";
import { ThemeSwitch } from "./theme-switch";
import { FaSignOutAlt } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiUser } from "react-icons/fi";

export default function Navbar() {
  const { vendor, logout } = useVendorAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [vendor]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-primary text-white px-5 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
      {/* Branding */}
      <div className="flex items-center gap-3">
        <Image
          src="/images/delivery-panda.png"
          alt="E-Com Delivery"
          width={36}
          height={36}
          className="rounded-full"
        />
        <span className="text-lg font-bold">E-Com Delivery Vendor</span>
      </div>

      {/* Right Side Utilities */}
      {!loading && (
        <div className="flex items-center gap-4">
          <ThemeSwitch />

          {vendor ? (
            <>
              {/* Notifications */}
              <button
                className="relative hover:text-primary-100 transition"
                title="Notifications"
              >
                <IoMdNotificationsOutline size={22} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profile (optional avatar or icon) */}
              <button
                className="hover:text-primary-100 transition"
                title="Profile"
                onClick={() => router.push("/profile")}
              >
                <FiUser size={20} />
              </button>

              {/* Logout */}
              <Button
                color="danger"
                onPress={handleLogout}
                size="sm"
                className="flex items-center gap-2 px-3 py-1.5"
              >
                <FaSignOutAlt size={14} />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white hover:text-primary-200 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-white hover:text-primary-200 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

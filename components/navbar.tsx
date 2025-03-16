"use client";

import { useState, useEffect } from "react";
import { useVendorAuth } from "@/context/AuthContext"; // Custom Vendor Authentication Context
import { Button, Link } from "@heroui/react"; // Hero UI components
import { useRouter } from "next/navigation"; // Next.js router for programmatic navigation
import Image from "next/image"; // Next.js Image component for optimized images
import { ThemeSwitch } from "./theme-switch";
import { FaSignOutAlt, FaStore, FaCreditCard, FaBars, FaTimes } from "react-icons/fa"; // Icons for menu & items

export default function Navbar() {
  const { vendor, logout } = useVendorAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Reload Navbar when the vendor state changes (after login)
  useEffect(() => {
    setLoading(false);
  }, [vendor]);

  // ✅ Handle logout & redirect to login
  const handleLogout = async () => {
    await logout();
    router.push("/login"); // ✅ Redirect to login
  };

  return (
    <nav className="w-full bg-primary text-white shadow-md py-3 px-6 flex justify-between items-center">
      {/* Logo & Branding */}
      <div className="flex items-center gap-3">
        <Image src="/images/delivery-panda.png" alt="E-Com Delivery" width={40} height={40} />
        <h1 className="text-xl font-bold">E-Com Delivery Service</h1>
      </div>

      {/* Desktop Navigation */}
      {!loading && (
        <div className="hidden md:flex items-center gap-6">
          {vendor ? (
            <>
              <Link href="/dashboard" className="text-white hover:text-primary-300 transition-colors">Dashboard</Link>
              <Link href="/orders" className="text-white hover:text-primary-300 transition-colors">Orders</Link>
              <Link href="/menu" className="text-white hover:text-primary-300 transition-colors">Menu</Link>
              <Link href="/restaurant/details" className="text-white hover:text-primary-300 transition-colors flex items-center gap-2">
                Restaurant Details
              </Link>
              <ThemeSwitch />
              <Button color="danger" onPress={handleLogout} className="flex items-center gap-2">
                <FaSignOutAlt />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-primary-300 transition-colors">Login</Link>
              <Link href="/register" className="text-white hover:text-primary-300 transition-colors">Register</Link>
            </>
          )}
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white text-2xl focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-0 left-0 w-full h-screen bg-black bg-opacity-80 flex flex-col items-center justify-center space-y-6 md:hidden">
          <button className="absolute top-5 right-6 text-white text-2xl focus:outline-none" onClick={() => setMenuOpen(false)}>
            <FaTimes />
          </button>

          {vendor ? (
            <>
              <Link href="/dashboard" className="text-white text-xl hover:text-primary-300 transition-colors" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/orders" className="text-white text-xl hover:text-primary-300 transition-colors" onClick={() => setMenuOpen(false)}>Orders</Link>
              <Link href="/menu" className="text-white text-xl hover:text-primary-300 transition-colors" onClick={() => setMenuOpen(false)}>Menu</Link>
              <Link href="/restaurant/details" className="text-white text-xl flex items-center gap-2 hover:text-primary-300 transition-colors" onClick={() => setMenuOpen(false)}>
                Restaurant Details
              </Link>
              <ThemeSwitch />
              <Button color="danger" onPress={handleLogout} className="flex items-center gap-2 text-lg">
                <FaSignOutAlt />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white text-xl hover:text-primary-300 transition-colors" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="text-white text-xl hover:text-primary-300 transition-colors" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

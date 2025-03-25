"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { FiMenu, FiX, FiUser, FiHome, FiList, FiDollarSign, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { RiderAuthService } from "@/services/riderAuthService";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // ✅ Toggle menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // ✅ Logout function
  const handleLogout = async () => {
    await RiderAuthService.logout();
    addToast({
      title: "👋 Logged Out",
      description: "You have been logged out successfully.",
      color: "warning",
    });
    router.push("/login");
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* 🚴‍♂️ Logo */}
        <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
          🚴‍♂️ <span>Rider App</span>
        </Link>

        {/* 📱 Mobile Menu Button */}
        <Button className="md:hidden" onPress={toggleMenu} variant="flat">
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </Button>

        {/* 🖥️ Desktop Menu */}
        <ul className="hidden md:flex gap-6">
          <li>
            <Link href="/dashboard" className="flex items-center gap-2 hover:text-gray-300 transition">
              <FiHome /> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/orders" className="flex items-center gap-2 hover:text-gray-300 transition">
              <FiList /> Orders
            </Link>
          </li>
          {/* <li>
            <Link href="/earnings" className="flex items-center gap-2 hover:text-gray-300 transition">
              <FiDollarSign /> Earnings
            </Link>
          </li> */}
        </ul>

        {/* 🖥️ Desktop Logout Button */}
        <div className="hidden md:block">
          <Button variant="flat" onPress={handleLogout} className="flex items-center gap-2">
            <FiLogOut /> Logout
          </Button>
        </div>
      </div>

      {/* 📱 Mobile Menu (Slide Down) */}
      {isOpen && (
        <div className="md:hidden bg-primary absolute top-full left-0 w-full shadow-lg">
          <ul className="flex flex-col items-center gap-4 p-4">
            <li>
              <Link href="/dashboard" className="flex items-center gap-2 text-white" onClick={toggleMenu}>
                <FiHome /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/orders" className="flex items-center gap-2 text-white" onClick={toggleMenu}>
                <FiList /> Orders
              </Link>
            </li>
            {/* <li>
              <Link href="/earnings" className="flex items-center gap-2 text-white" onClick={toggleMenu}>
                <FiDollarSign /> Earnings
              </Link>
            </li> */}
            <li>
              <Button variant="flat" onPress={handleLogout} className="flex items-center gap-2">
                <FiLogOut /> Logout
              </Button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

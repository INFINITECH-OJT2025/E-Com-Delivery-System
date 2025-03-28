"use client";

import { useState } from "react";
import { Button, addToast } from "@heroui/react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiList,
  FiDollarSign,
  FiCreditCard,
  FiLogOut,
} from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiderAuthService } from "@/services/riderAuthService";
import Image from "next/image";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await RiderAuthService.logout();
    addToast({
      title: "👋 Logged Out",
      description: "You have been logged out successfully.",
      color: "warning",
    });
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", icon: <FiHome />, label: "Dashboard" },
    { href: "/orders", icon: <FiList />, label: "Orders" },
    { href: "/history", icon: <FiDollarSign />, label: "History" },
    { href: "/payout", icon: <FiCreditCard />, label: "Payouts" },
  ];

  return (
    <nav className="bg-primary text-white shadow-md fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/delivery-panda.png"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-xl font-bold tracking-wide">E-Com Rider</span>
        </Link>

        {/* Mobile Menu Button */}
        <Button
          className="md:hidden"
          onPress={toggleMenu}
          variant="flat"
          aria-label="Toggle Menu"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </Button>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-2 hover:text-yellow-200 transition-colors"
              >
                {link.icon} {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Button
              variant="flat"
              onPress={handleLogout}
              className="flex items-center gap-2 text-white hover:text-red-300 transition-colors"
            >
              <FiLogOut /> Logout
            </Button>
          </li>
        </ul>
      </div>

      {/* Mobile Nav Menu */}
      <div
        className={`md:hidden bg-primary overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-4 py-4 px-4">
          {navLinks.map((link) => (
            <li key={link.href} className="w-full text-center">
              <Link
                href={link.href}
                onClick={toggleMenu}
                className="block w-full py-2 px-4 rounded hover:bg-white hover:text-primary transition"
              >
                <div className="flex items-center justify-center gap-2">
                  {link.icon} {link.label}
                </div>
              </Link>
            </li>
          ))}
          <li className="w-full text-center">
            <Button
              variant="flat"
              onPress={() => {
                toggleMenu();
                handleLogout();
              }}
              className="flex items-center gap-2 justify-center w-full py-2 hover:text-white transition-colors"
            >
              <FiLogOut /> Logout
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

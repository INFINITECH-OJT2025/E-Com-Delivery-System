"use client";
import Link from "next/link";
import { useState } from "react";
import { FaHome, FaUser, FaClipboardList, FaBoxOpen, FaCog, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { Button } from "@heroui/react"; // Hero UI Button

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true); // Manage sidebar toggle state

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Toggle sidebar visibility
  };

  return (
    <div
      className={`h-screen flex flex-col bg-white text-gray-900 p-6 border-r border-gray-300 shadow-lg transition-all ${isOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Sidebar Header with Toggle Button */}
      <div className="flex items-center justify-between mb-8">
        <h2
          className={`text-2xl font-semibold transition-all ${!isOpen ? 'opacity-0' : 'opacity-100'} text-primary`}
        >
          E-Com Delivery
        </h2>

        <Button
          onPress={toggleSidebar}
          color="primary"
          className="p-2 rounded-md text-white bg-primary hover:bg-primary-dark transition-all"
        >
          {/* Collapse/Expand icon */}
          {isOpen ? <FaAngleLeft /> : <FaAngleRight />}
        </Button>
      </div>

      {/* Sidebar Links */}
      <ul className="space-y-6">
        <li>
          <Link href="/dashboard" className="flex items-center text-lg hover:bg-primary hover:text-white p-2 rounded-md transition-all">
            <FaHome className="mr-3" />
            {isOpen && "Dashboard"}
          </Link>
        </li>
        <li>
          <Link href="/orders" className="flex items-center text-lg hover:bg-primary hover:text-white p-2 rounded-md transition-all">
            <FaClipboardList className="mr-3" />
            {isOpen && "Orders"}
          </Link>
        </li>
        <li>
          <Link href="/menus" className="flex items-center text-lg hover:bg-primary hover:text-white p-2 rounded-md transition-all">
            <FaBoxOpen className="mr-3" />
            {isOpen && "Menus"}
          </Link>
        </li>
        <li>
          <Link href="/settings" className="flex items-center text-lg hover:bg-primary hover:text-white p-2 rounded-md transition-all">
            <FaCog className="mr-3" />
            {isOpen && "Settings"}
          </Link>
        </li>
        <li>
          <Link href="/profile" className="flex items-center text-lg hover:bg-primary hover:text-white p-2 rounded-md transition-all">
            <FaUser className="mr-3" />
            {isOpen && "Profile"}
          </Link>
        </li>
      </ul>
    </div>
  );
}

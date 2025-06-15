"use client";

import { useRouter } from "next/navigation";
import { Button, addToast } from "@heroui/react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import Image from "next/image";
import { RiderAuthService } from "@/services/riderAuthService";
import Link from "next/link";

export default function RiderHeader() {
  const router = useRouter();

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
    <header className="fixed top-0 left-0 w-full bg-primary shadow z-50 px-4 py-3 flex items-center justify-between border-b">
<Link href="/dashboard" className="hover:opacity-90">
  <div className="flex items-center gap-3 cursor-pointer">
    <img
      src="/images/delivery-panda.png"
      alt="Logo"
      width={32}
      height={32}
      className="rounded-full"
    />
    <h1 className="font-bold text-lg text-white">
      E-Com <strong>Rider</strong>
    </h1>
  </div>
</Link>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="text-white"
          isIconOnly
          aria-label="Settings"
          onPress={() => router.push("/settings")}
        >
          <FiSettings size={18} />
        </Button>
        <Button
          size="sm"
          color="danger"
          variant="solid"
          onPress={handleLogout}
          className="flex items-center gap-2"
        >
          <FiLogOut /> Logout
        </Button>
      </div>
    </header>
  );
}

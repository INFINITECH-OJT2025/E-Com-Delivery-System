"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const vendorToken = localStorage.getItem("vendorToken");
    if (!vendorToken) {
      router.push("/"); // Redirect to home if vendorToken is missing
    }
  }, []);

  return (
    <div className="flex">
      <div className="flex-1 bg-gray-100 p-6">{children}</div>
    </div>
  );
}

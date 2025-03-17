// app/rider/dashboard/layout.tsx
"use client";

import MobileNavbar from "@/components/MobileNavbar";

export default function RiderDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Global Mobile Navbar for Riders */}
      <MobileNavbar />
      <main className="pt-16">{children}</main> {/* ✅ Push content down below navbar */}
    </div>
  );
}

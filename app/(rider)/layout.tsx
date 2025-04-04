"use client";

import RiderHeader from "@/components/RiderHeader";
import BottomMobileNav from "@/components/BottomMobileNav";
import { GoogleMapsProvider } from "@/context/GoogleMapsProvider";

export default function RiderDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" pt-16 ">
      <RiderHeader />
      <GoogleMapsProvider>
        <main className="">{children}</main>
        <BottomMobileNav />
      </GoogleMapsProvider>
    </div>
  );
}

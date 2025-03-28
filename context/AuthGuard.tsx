"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublic = pathname === "/login" || pathname === "/register";
    const token = localStorage.getItem("riderToken");

    if (!isPublic && !token) {
      router.replace("/login");
    }
  }, [pathname, router]);

  return <>{children}</>;
}

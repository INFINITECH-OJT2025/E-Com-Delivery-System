"use client";

import type { ThemeProviderProps } from "next-themes";
import { SessionProvider, useSession, getSession } from "next-auth/react";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

// ✅ Define public routes that DO NOT require authentication
const publicRoutes = ["/register", "/login"];

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionChecked, setSessionChecked] = React.useState(false);

  React.useEffect(() => {
    async function checkSession() {
      const session = await getSession();

      // ✅ If NOT authenticated and NOT on a public route, redirect to /register
      if (!session && !publicRoutes.includes(pathname)) {
        router.push("/register");
      }

      // ✅ Set session as checked (to prevent repeated redirects)
      setSessionChecked(true);
    }

    checkSession();
  }, [pathname]);

  // ✅ Don't render children until session is checked (prevents flickering)
  if (!sessionChecked) return null;

  return (
    <SessionProvider>
      <HeroUIProvider navigate={router.push}>
        <ToastProvider />
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}

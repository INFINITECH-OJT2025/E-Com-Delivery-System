"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";

// ✅ Import Context Providers
import { UserProvider } from "@/context/userContext";
import { OrderProvider } from "@/context/orderContext";
import { CartProvider } from "@/context/cartContext";
import { FavoriteProvider } from "@/context/favoriteContext";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider />
      <NextThemesProvider {...themeProps}>
        {/* ✅ Global Context Providers */}
        <UserProvider> 
          <OrderProvider>
            <CartProvider>
              <FavoriteProvider>
                {children}
              </FavoriteProvider>
            </CartProvider>
          </OrderProvider>
        </UserProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider} from "@heroui/react";
import { PendingTicketsProvider } from "@/context/PendingTicketsContext";
import { AdminChatProvider } from "@/context/AdminChatContext";

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
      <AdminChatProvider>
      <PendingTicketsProvider>
    

              <ToastProvider />

      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </PendingTicketsProvider>
      </AdminChatProvider>
 
    </HeroUIProvider>
  );
}

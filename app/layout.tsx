import "@/styles/globals.css";
import { Metadata } from "next";
import { Providers } from "./providers";
import clsx from "clsx";
import { fontSans } from "@/config/fonts";
import Head from "next/head";
import React from "react";
import MobileGuard from "./MobileGuard";

export const metadata: Metadata = {
  title: "E-Com Delivery System",
  description: "Fast and reliable food delivery service",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="E-Com" />
        <link rel="manifest" href="/manifest.json"/>
      </Head>
      {/* ✅ FIXED: Allow scrolling by changing `overflow-hidden` to `overflow-auto` */}
      <body className={clsx("min-h-screen bg-background font-sans antialiased overflow-auto", fontSans.variable)}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          {/* ✅ Ensure full-page layout supports scrolling */}
          <div className="flex flex-col min-h-screen">
          <MobileGuard>     <main className="flex-grow">{children}</main>  </MobileGuard> 
          </div>
        </Providers>
      </body>
    </html>
  );
}

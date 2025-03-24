import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import Navbar from "@/components/navbar";
import Head from "next/head";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="E-Com" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          {/* ✅ Full-page flex layout */}
          <div className="flex flex-col min-h-screen">
            <Navbar />

            {/* ✅ Main grows to fill remaining space */}
            <main className="flex-1">
              {children}
            </main>

            {/* ✅ Sticky footer at bottom */}
            <footer className="w-full bg-gray-100 py-6 border-t border-gray-300">
              <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
                <div className="flex items-center space-x-2">
                  <img
                    src="/images/delivery-panda.png"
                    alt="E-Com Vendor"
                    className="h-8 w-auto"
                  />
                  <span className="text-lg font-semibold text-gray-800">
                    E-Com Vendor
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-3 md:mt-0">
                  © {new Date().getFullYear()} E-Com Vendor. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

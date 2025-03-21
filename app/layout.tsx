import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import  AdminNavbar  from "@/components/navbar";

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
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex flex-col h-screen">
            <AdminNavbar />
            <main className="  ">
              {children}
            </main>
            <footer className="w-full  text-gray-300 py-4 flex flex-col items-center text-center">
      {/* ✅ Business Name */}
      <p className="text-lg font-semibold text-default-600 ">E-Com Delivery Admin Portal</p>

      {/* ✅ Copyright */}
      <p className="text-sm text-default-600 mt-1">© {new Date().getFullYear()} E-Com Delivery. All rights reserved.</p>

 
    </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

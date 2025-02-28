import "@/styles/globals.css";
import { Metadata } from "next";
import { Providers } from "./providers";
import clsx from "clsx";
import { fontSans } from "@/config/fonts";
import Head from "next/head";

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
      </Head>
      <body className={clsx("min-h-screen bg-background font-sans antialiased overflow-hidden", fontSans.variable)}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          {/* Full Page Wrapper */}
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex justify-center items-center">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

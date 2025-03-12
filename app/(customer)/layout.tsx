"use client";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/cartContext";
import { FavoriteProvider } from "@/context/favoriteContext";
import { UserProvider } from "@/context/userContext";
import { OrderProvider } from "@/context/orderContext";
interface CustomerLayoutProps {
    children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
    return (
        <UserProvider>
            <OrderProvider>
                <CartProvider>
                    <FavoriteProvider>
                    {/* ✅ Full-height wrapper, allowing only internal scrolling */}
                    <div className="w-full h-screen flex flex-col bg-white">
                        {/* ✅ Sticky Navbar */}
                        <div className="sticky top-0 z-50 w-full bg-white shadow-md">
                            <Navbar />
                        </div>

                        {/* ✅ Only `children` scrolls (prevents double scrollbar issue) */}
                        <main className="flex-1 overflow-y-auto">{children}</main>
                    </div>
                    </FavoriteProvider>
                </CartProvider>
            </OrderProvider>
        </UserProvider>
    );
}

"use client";
import { IoPersonOutline, IoCartOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/cartContext"; // ✅ Import cart context
import CartModal from "@/components/CartModal"; // ✅ Import Cart Modal

export default function Navbar() {
    const router = useRouter();
    const { cart } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // ✅ Ensure totalItems uses `cart_items`
    const totalItems = cart?.cart_items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <>
            {/* ✅ Navbar */}
            <div className="w-full bg-primary px-5 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
                <IoPersonOutline
                    onClick={() => router.push("/profile")}
                    className="text-2xl text-white cursor-pointer hover:scale-110 transition-transform"
                />

                <div className="flex items-center gap-3">
                    <img src="/images/delivery-panda.png" alt="E-Com Delivery" className="h-10 md:h-12 drop-shadow-md" />
                    <h1 className="text-lg text-white font-semibold drop-shadow-md">E-com Delivery</h1>
                </div>

                <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
                    <IoCartOutline className="text-2xl text-white hover:scale-110 transition-transform" />

                    {/* 🔥 Show Cart Badge if items exist */}
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </div>
            </div>

            {/* ✅ Call the Cart Modal */}
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}

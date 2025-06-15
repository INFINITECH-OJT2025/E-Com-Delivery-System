"use client";
import { IoHomeOutline, IoPersonOutline, IoCartOutline, IoHeartOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/cartContext"; // ✅ Import cart context
import { useFavorite } from "@/context/favoriteContext"; // ✅ Import favorite context
import CartModal from "@/components/CartModal"; // ✅ Import Cart Modal
import FavoriteModal from "@/components/FavoriteModal"; // ✅ Import Favorite Modal

export default function Navbar() {
    const router = useRouter();
    const { cart } = useCart();
    const { favorites } = useFavorite(); // ✅ Get favorites from context
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFavoriteOpen, setIsFavoriteOpen] = useState(false);

    // ✅ Compute total cart items
    const totalItems = cart?.cart_items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    
    // ✅ Compute total favorite items
    const totalFavorites = favorites?.length || 0;

    return (
        <>
            {/* ✅ Navbar */}
            <div className="w-full bg-primary px-5 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
                <div className="flex items-center gap-4">
                    {/* 🏠 Home Button */}
                    <div 
                        className="relative cursor-pointer hover:scale-110 transition-transform duration-300"
                        onClick={() => router.push("/home")}
                    >
                        <IoHomeOutline className="text-2xl text-white" />
                    </div>

                    {/* 👤 Profile Button */}
                    <div 
                        className="relative cursor-pointer hover:scale-110 transition-transform duration-300"
                        onClick={() => router.push("/profile")}
                    >
                        <IoPersonOutline className="text-2xl text-white" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <img src="/images/delivery-panda.png" alt="E-Com Delivery" className="h-10 md:h-12 drop-shadow-md" />
                    <h1 className="text-lg text-white font-semibold drop-shadow-md">E-com Delivery</h1>
                </div>

                <div className="flex items-center gap-5">
                    {/* ❤️ Favorite Icon (with Badge) */}
                    <div 
                        className="relative cursor-pointer hover:scale-110 transition-transform duration-300"
                        onClick={() => setIsFavoriteOpen(true)}
                    >
                        <IoHeartOutline className="text-2xl text-white" />

                        {/* 🔥 Show Favorite Badge if items exist */}
                        {totalFavorites > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                {totalFavorites}
                            </span>
                        )}
                    </div>

                    {/* 🛒 Cart Icon (with Badge) */}
                    <div 
                        className="relative cursor-pointer hover:scale-110 transition-transform duration-300"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <IoCartOutline className="text-2xl text-white" />

                        {/* 🔥 Show Cart Badge if items exist */}
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Modals */}
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <FavoriteModal isOpen={isFavoriteOpen} onClose={() => setIsFavoriteOpen(false)} />
        </>
    );
}

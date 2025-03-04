"use client";
import { IoPersonOutline, IoCartOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();

    return (
        <div className="w-full bg-primary px-5 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
            {/* Profile Icon (Left) */}
            <IoPersonOutline
                onClick={() => router.push("/profile")}
                className="text-2xl text-white cursor-pointer hover:scale-110 transition-transform"
            />

            {/* Logo & Title (Center) */}
            <div className="flex items-center gap-3">
                <img 
                    src="/images/delivery-panda.png" 
                    alt="E-Com Delivery" 
                    className="h-10 md:h-12 drop-shadow-md"
                />
                <h1 className="text-lg text-white font-semibold drop-shadow-md">
                    E-com Delivery
                </h1>
            </div>

            {/* Cart Icon (Right) */}
            <IoCartOutline
                onClick={() => router.push("/cart")}
                className="text-2xl text-white cursor-pointer hover:scale-110 transition-transform"
            />
        </div>
    );
}

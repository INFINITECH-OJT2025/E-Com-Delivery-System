"use client";
import Image from "next/image";

export default function RestaurantHeader({ restaurant }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const bannerUrl = `${API_URL}/storage/${restaurant.banner_image}`;
    const logoUrl = `${API_URL}/storage/${restaurant.logo}`;

    return (
        <div className="relative w-full h-48 md:h-60 overflow-hidden">
            {/* Background Image */}
            <Image src={bannerUrl} alt={restaurant.name} layout="fill" objectFit="cover" className="brightness-75" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

            {/* Restaurant Details */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4">
                {/* Logo */}
                <div className="w-16 h-16 bg-white rounded-full overflow-hidden shadow-lg flex items-center justify-center">
                    <Image 
                        src={logoUrl} 
                        alt={restaurant.name} 
                        width={64} 
                        height={64} 
                        className="object-contain rounded-full"
                    />
                </div>

                {/* Info */}
                <div>
                    <h1 className="text-white font-bold text-xl md:text-2xl">{restaurant.name}</h1>
                    <p className="text-white text-sm md:text-base flex items-center gap-1">
                        {restaurant.rating} 
                        <span className="text-yellow-400">⭐</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

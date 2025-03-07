"use client";

import { IoHeartOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RestaurantProps {
    restaurant: {
        id: number;
        slug: string;
        name: string;
        banner_image: string;
        rating: number;
        total_reviews: number;
        is_open: boolean;
        distance_km?: number;
    };
    deliveryFee: number | null; // ✅ Receive preloaded delivery fee
}

export default function RestaurantCard({ restaurant, deliveryFee }: RestaurantProps) {
    const router = useRouter();

    const imageUrl = restaurant.banner_image?.startsWith("http")
        ? restaurant.banner_image
        : `${API_URL}/storage/${restaurant.banner_image}` || "/images/default-restaurant.jpg";

    const handleClick = () => {
        router.push(`/restaurant/${restaurant.slug}`);
    };

    return (
        <div
            className="relative bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 cursor-pointer"
            onClick={handleClick}
        >
            {/* 📍 Restaurant Image */}
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={restaurant.name}
                    className="w-full h-40 object-cover rounded-t-xl"
                    loading="lazy"
                />

                {/* 🔴 Closed Overlay */}
                {!restaurant.is_open && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center text-white text-sm font-semibold">
                        Closed
                    </div>
                )}
            </div>

            {/* ❤️ Favorite Icon */}
            <button
                className="absolute top-3 right-3 text-xl text-gray-700 hover:text-red-500 transition"
                aria-label="Add to favorites"
            >
                <IoHeartOutline />
            </button>

            {/* 📍 Restaurant Info */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">
                    {restaurant.rating} ⭐ ({restaurant.total_reviews} reviews)
                </p>
                {restaurant.distance_km !== undefined && (
                    <p className="text-sm text-gray-700">📍 {restaurant.distance_km} km away</p>
                )}
                <p className="text-sm text-gray-700 font-bold">
                    🚚 Delivery Fee: {deliveryFee !== null ? `₱${deliveryFee}` : "Calculating..."}
                </p>
            </div>
        </div>
    );
}

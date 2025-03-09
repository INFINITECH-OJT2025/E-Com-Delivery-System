"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface HorizontalScrollListProps {
    items: { 
        id: number; 
        slug: string; 
        name: string; 
        banner_image: string; 
        is_open: boolean; 
        rating: number | null | undefined; // ✅ Allow null/undefined
        total_reviews: number | null | undefined; // ✅ Allow null/undefined
        delivery_fee?: number | null;
        distance_km?: number | null;
        estimated_time?: string | null;
        priceRange?: string | null;
        discounts?: { label: string; type: "percentage" | "amount" }[];
    }[];
}

export default function HorizontalScrollList({ items }: HorizontalScrollListProps) {
    const router = useRouter();

    return (
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-4">
            {items.map((item) => {
                const imageUrl = item.banner_image?.startsWith("http")
                    ? item.banner_image
                    : `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.banner_image}` || "/images/default-restaurant.jpg";

                // ✅ Ensure `rating` is a number, default to 0 if missing
                const rating = typeof item.rating === "number" ? item.rating.toFixed(1) : "N/A";

                // ✅ Ensure `total_reviews` is a number, default to 0 if missing
                const totalReviews = typeof item.total_reviews === "number" ? item.total_reviews : 0;

                // ✅ Ensure `distance_km` is a number
                const distanceKm = item.distance_km !== undefined && item.distance_km !== null
                    ? `${item.distance_km.toFixed(1)} km`
                    : "N/A";

                // ✅ Ensure `delivery_fee` is a number
                const deliveryFee = item.delivery_fee !== undefined && item.delivery_fee !== null
                    ? `₱${item.delivery_fee}`
                    : "N/A"; 

                return (
                    <button
                        key={item.id}
                        onClick={() => router.push(`/restaurant/${item.slug}`)}
                        className="relative flex flex-col w-[260px] h-[190px] bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 flex-shrink-0"
                    >
                        {/* 🖼️ Restaurant Image */}
                        <div className="relative w-full h-[120px]">
                            <Image
                                src={imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                loading="lazy"
                            />
                            {!item.is_open && (
                                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center text-white text-xs font-semibold">
                                    Closed
                                </div>
                            )}

                            {/* 🔖 Discount Badges */}
                            {item.discounts?.length > 0 && (
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    {item.discounts.map((discount, index) => (
                                        <span 
                                            key={index} 
                                            className={`px-2 py-1 text-xs font-semibold text-white rounded-md ${
                                                discount.type === "percentage" ? "bg-red-500" : "bg-pink-500"
                                            }`}
                                        >
                                            {discount.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 📍 Restaurant Info */}
                        <div className="p-3 text-left w-full">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
                            <p className="text-xs text-gray-600">
                                ⭐ {rating} ({totalReviews} reviews) {/* ✅ Prevents null values */}
                            </p>

                            {/* 📍 Show Distance */}
                            {item.distance_km !== undefined && item.distance_km !== null && (
                                <p className="text-xs text-gray-500">📍 {distanceKm}</p>
                            )}

                            {/* ⏳ Estimated Time (Shown Before Delivery Fee) */}
                            {item.estimated_time && (
                                <p className="text-xs text-gray-700">⏳ {item.estimated_time}</p>
                            )}

                            {/* 🚚 Delivery Fee */}
                            <p className="text-xs text-gray-700">🚚 {deliveryFee}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

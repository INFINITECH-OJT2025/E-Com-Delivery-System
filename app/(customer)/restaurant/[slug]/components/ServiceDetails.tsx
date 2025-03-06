"use client";

export default function ServiceDetails({ restaurant }) {
    return (
        <div className="px-4 py-3 text-sm bg-white shadow-sm border-b border-gray-200 flex flex-col gap-1">
            <p className="text-gray-800 font-medium">
                {restaurant.service_type === "both"
                    ? "🚴 Delivery & Pickup Available"
                    : restaurant.service_type === "delivery"
                    ? "🚴 Delivery Only"
                    : "🏃 Pickup Only"}
            </p>
            <p className="text-gray-600">
                📍 {restaurant.address} • Free delivery over ₱{restaurant.minimum_order}
            </p>
        </div>
    );
}

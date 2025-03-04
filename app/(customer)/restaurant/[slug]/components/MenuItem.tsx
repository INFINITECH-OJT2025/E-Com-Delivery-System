"use client";
import Image from "next/image";

export default function MenuItem({ menuItem }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const imageUrl = `${API_URL}/storage/${menuItem.image}`;

    return (
        <div className="relative bg-white rounded-xl shadow-md overflow-hidden p-4 transform transition-all duration-300 
                        hover:-translate-y-1 hover:shadow-2xl cursor-pointer border border-gray-200">
            {/* Menu Image */}
            <div className="w-full h-28 md:h-36 overflow-hidden rounded-lg">
                <Image src={imageUrl} alt={menuItem.name} width={300} height={200} className="object-cover w-full h-full" />
            </div>

            {/* Menu Details */}
            <div className="mt-3">
                <h3 className="text-lg font-semibold text-gray-900">{menuItem.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{menuItem.description}</p>
                <p className="text-base font-bold text-primary">₱{menuItem.price}</p>
            </div>
        </div>
    );
}

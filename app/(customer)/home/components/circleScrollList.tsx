"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface CircleScrollListProps {
    items: { id: number; slug: string; name: string; banner_image: string }[];
}

export default function CircleScrollList({ items }: CircleScrollListProps) {
    const router = useRouter();

    return (
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-3">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => router.push(`/restaurant/${item.slug}`)}
                    className="flex flex-col items-center gap-2 focus:outline-none transition-transform transform hover:-translate-y-1 active:translate-y-0"
                >
                    {/* ✅ Box Style Image with Shadow & Hover Effects */}
                    <div 
                        className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 transition-all transform hover:shadow-lg active:shadow-md"
                    >
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.logo}`}
                            alt={item.name}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* ✅ Restaurant Name with Tooltip on Hover */}
                    <span 
                        className="text-xs md:text-sm font-semibold text-gray-700 text-center w-24 md:w-28 truncate"
                        title={item.name} // Shows full name on hover
                    >
                        {item.name}
                    </span>
                </button>
            ))}
        </div>
    );
}

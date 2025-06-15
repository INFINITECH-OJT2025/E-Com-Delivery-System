"use client";
import Link from "next/link";
import { IoChevronBackOutline } from "react-icons/io5";

export default function Breadcrumbs({ restaurant }) {
    return (
        <div className="flex items-center px-4 py-2 text-sm text-gray-500">
            <Link href="/home" className="hover:underline">
                Home
            </Link>
            <span className="mx-2">›</span>
            <span className="text-primary font-semibold">{restaurant.name}</span>
        </div>
    );
}

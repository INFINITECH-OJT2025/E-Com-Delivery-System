"use client";

import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import SearchModal from "@/components/SearchModal";

export default function SearchBar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className="w-full flex items-center px-4 py-3 bg-white sticky top-0 z-50 shadow-sm">
            {/* Search Bar (Click to Open Modal) */}
            <div
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center w-full max-w-lg bg-gray-100 rounded-full px-4 py-3 transition-all cursor-pointer"
            >
                <IoSearch className="text-gray-500 text-xl" />
                <input
                    type="text"
                    placeholder="Search..."
                    readOnly
                    className="w-full px-2 text-sm bg-transparent border-none focus:ring-0 outline-none md:text-base"
                />
            </div>

            {/* 🔍 Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
}

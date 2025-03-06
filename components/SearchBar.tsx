"use client";
import { IoSearch, IoFilter } from "react-icons/io5";
import EmptyModal from "./EmptyModal";
import { useState } from "react";

export default function SearchBar() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Handles search when Enter is pressed
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim() !== "") {
            console.log("Searching for:", searchQuery);
            // TODO: Implement API search logic here
        }
    };

    return (
        <div className="w-full flex items-center px-4 py-3 bg-white sticky top-0 z-50 shadow-sm">
            {/* Search Bar */}
            <div className="flex items-center w-full max-w-lg bg-gray-100 rounded-full px-4 py-3 transition-all  ">
                <IoSearch className="text-gray-500 text-xl" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch} // ✅ Press "Enter" to Search
                    className="w-full px-2 text-sm bg-transparent border-none focus:ring-0 outline-none md:text-base"
                   

             />
            </div>

            {/* Filter Button (Outside the Search Bar) */}
            <button
                className="ml-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all shadow-sm hover:shadow-md"
                onClick={() => setIsFilterOpen(true)}
            >
                <IoFilter className="text-gray-600 text-2xl" />
            </button>

            {/* Filter Modal */}
            <EmptyModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
        </div>
    );
}

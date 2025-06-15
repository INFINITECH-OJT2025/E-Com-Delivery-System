"use client";
import { IoSearch } from "react-icons/io5";

export default function SearchBar() {
    return (
        <div className="sticky top-[50px] z-40 bg-white px-4 py-2 flex items-center border-b">
            <div className="flex items-center w-full max-w-lg bg-gray-100 rounded-full px-4 py-2">
                <IoSearch className="text-gray-500 text-lg" />
                <input
                    type="text"
                    placeholder="Search menu..."
                    className="w-full px-2 text-sm bg-transparent border-none focus:ring-0 outline-none md:text-base"
                />
            </div>
        </div>
    );
}

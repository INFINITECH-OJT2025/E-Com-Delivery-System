"use client";
import { useState } from "react";

export default function MenuTabs({ categories, onSelectCategory }) {
    const [selectedTab, setSelectedTab] = useState(categories[0]?.name || "Best Sellers");

    const handleTabClick = (category) => {
        setSelectedTab(category.name);
        onSelectCategory(category.name);
    };

    return (
        <div className="sticky top-0 z-50 bg-white shadow-md w-full">
            <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-200">
                <div className="flex gap-4 px-4 whitespace-nowrap relative">
                    {categories.map((category) => (
                        <button
                            key={category.name}
                            onClick={() => handleTabClick(category)}
                            className={`relative px-4 py-2 text-sm font-semibold transition-all
                                ${selectedTab === category.name ? "text-blue-600" : "text-gray-600"}`}
                        >
                            {category.name}

                            {/* Active Underline Animation */}
                            {selectedTab === category.name && (
                                <div className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 transition-all"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

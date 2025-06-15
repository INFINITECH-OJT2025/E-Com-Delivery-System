"use client";
import { useState } from "react";

export default function MenuTabs({ categories, onSelectCategory }) {
    const [selectedTab, setSelectedTab] = useState(categories[0]?.name || "All");

    const handleTabClick = (category) => {
        setSelectedTab(category.name);
        onSelectCategory(category.name);
    };

    return (
        <div className="sticky top-0 z-50 bg-white shadow-md py-2 w-full overflow-x-auto flex justify-center">
            <div className="flex space-x-3 px-4">
                {categories.map((category) => (
                    <button
                        key={category.name}
                        onClick={() => handleTabClick(category)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 
                        ${selectedTab === category.name ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                        {category.name} ({category.count})
                    </button>
                ))}
            </div>
        </div>
    );
}

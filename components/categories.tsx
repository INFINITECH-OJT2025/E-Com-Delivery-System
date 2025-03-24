"use client";
import { IoFastFood, IoCafe, IoPizza, IoIceCream, IoFish, IoLeaf, IoBeer, IoRestaurant } from "react-icons/io5";

interface CategoriesProps {
    categories: { id: number; name: string; slug: string }[];
    onCategorySelect: (categoryId: number) => void;  // Add the callback for category selection
}

// Assign Icons Based on Category Name
const categoryIcons: { [key: string]: JSX.Element } = {
    "Fast Food": <IoFastFood className="text-white text-2xl" />,
    "Café": <IoCafe className="text-white text-2xl" />,
    "Pizza": <IoPizza className="text-white text-2xl" />,
    "Desserts": <IoIceCream className="text-white text-2xl" />,
    "Seafood": <IoFish className="text-white text-2xl" />,
    "Vegetarian/Vegan": <IoLeaf className="text-white text-2xl" />,
    "Barbecue": <IoBeer className="text-white text-2xl" />,
    "Fine Dining": <IoRestaurant className="text-white text-2xl" />,
};

// Assign Background Colors
const bgColors = [
    "bg-gradient-to-r from-yellow-400 to-orange-500",
    "bg-gradient-to-r from-blue-400 to-blue-600",
    "bg-gradient-to-r from-green-400 to-green-600",
    "bg-gradient-to-r from-red-400 to-red-600",
    "bg-gradient-to-r from-purple-400 to-purple-600",
    "bg-gradient-to-r from-pink-400 to-pink-600",
    "bg-gradient-to-r from-gray-400 to-gray-600",
];

export default function Categories({ categories, onCategorySelect }: CategoriesProps) {
    const handleCategoryClick = (categoryId: number) => {
        onCategorySelect(categoryId);  // Pass the category ID to parent
    };

    return (
        <div className="flex gap-4 overflow-x-auto py-4 px-2">
            {categories.map((category, index) => {
                const bgColor = bgColors[index % bgColors.length]; // Cycle through colors
                const icon = categoryIcons[category.name] || <IoFastFood className="text-white text-2xl" />; // Default icon

                return (
                    <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}  // Pass category ID directly
                        className={`relative px-6 py-4 rounded-xl shadow-md transition-all duration-300 
                            hover:shadow-lg active:shadow-sm hover:-translate-y-1 active:translate-y-0 border border-gray-200
                            flex items-center justify-center min-w-[140px] md:min-w-[160px] ${bgColor}`}
                    >
                        {/* Inner Glow for 3D Effect */}
                        <div className="absolute inset-0 bg-white/10 rounded-xl shadow-inner pointer-events-none"></div>

                        {/* Icon + Category Name */}
                        <div className="flex flex-col items-center gap-2">
                            {icon}
                            <p className="text-sm font-semibold text-white">{category.name}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
